import { CONFIG, MOCK_COURSES, MOCK_USER } from '../constants';
import { Course, Lesson, LessonSentence, User } from '../types';

/**
 * Simulates a delay to mimic network latency
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private formatDuration(seconds?: number): string | undefined {
    if (!seconds) return undefined;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private resolvePlaybackDefaults(categoryId?: string | number): Pick<Lesson, 'playbackRate' | 'loopMode'> {
    const numericCategoryId = Number(categoryId ?? 0);
    const speedOptions = [1.0, 1.1, 1.25, 1.4, 1.5];
    const loopOptions: NonNullable<Lesson['loopMode']>[] = ['order', 'repeat', 'single', 'channel-repeat', 'shuffle'];

    return {
      playbackRate: speedOptions[Math.abs(numericCategoryId) % speedOptions.length],
      loopMode: loopOptions[Math.abs(numericCategoryId) % loopOptions.length],
    };
  }

  private normalizeLesson(lesson: any, course?: any): Lesson {
    const durationSeconds = Number(lesson.durationSeconds ?? lesson.duration_seconds ?? 0) || undefined;
    const defaults = this.resolvePlaybackDefaults(course?.categoryId ?? lesson.categoryId);

    return {
      id: String(lesson.id),
      courseId: lesson.courseId ?? lesson.course_id ?? course?.id,
      categoryId: lesson.categoryId ?? course?.categoryId,
      title: String(lesson.title ?? ''),
      duration: lesson.duration ?? this.formatDuration(durationSeconds),
      durationSeconds,
      isLearned: Boolean(lesson.isLearned ?? lesson.learned ?? false),
      mediaType: lesson.mediaType ?? lesson.media_type ?? 'video',
      mediaUrl: lesson.mediaUrl ?? lesson.media_url,
      coverUrl: lesson.coverUrl ?? lesson.cover_url,
      subtitles: lesson.subtitles,
      lastPlaybackPosition: Number(lesson.lastPlaybackPosition ?? lesson.progressSeconds ?? 0),
      playbackRate: Number(lesson.playbackRate ?? defaults.playbackRate),
      loopMode: lesson.loopMode ?? defaults.loopMode,
      sortOrder: lesson.sortOrder ?? lesson.sort_order,
    };
  }

  private normalizeCourse(course: any): Course {
    const lessons = Array.isArray(course.lessons)
      ? course.lessons.map((lesson: any) => this.normalizeLesson(lesson, course))
      : undefined;
    const lessonCount = lessons?.length ?? 0;

    return {
      id: String(course.id),
      categoryId: course.categoryId ?? course.category_id,
      title: String(course.title ?? ''),
      subtitle: String(course.subtitle ?? ''),
      description: course.description,
      imageUrl: course.imageUrl || course.image_url || 'https://picsum.photos/400/500?random=course',
      vocabularyCount: course.vocabularyCount ?? course.vocabulary_count,
      playCount: Number(course.playCount ?? course.play_count ?? 0),
      tags: course.tags ?? [
        lessonCount > 0 ? `共${lessonCount}篇` : '精选课程',
        course.accessType === 'GROUP' ? '分组可见' : course.accessType === 'VIP' ? 'VIP' : '免费',
      ],
      isVip: Boolean(course.isVip ?? course.vipOnly ?? course.vip_only),
      themeColor: course.themeColor,
      author: course.author,
      price: Number(course.price ?? 0),
      category: course.category,
      accessType: course.accessType ?? course.access_type,
      lessons,
    };
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const payload = await response.json().catch(() => null);
    const code = typeof payload?.code === 'number' ? payload.code : response.status;

    if (!response.ok || (payload?.code !== undefined && code !== 0 && code !== 200)) {
      throw new Error(payload?.message || `Request failed: ${response.status}`);
    }

    return (payload?.data ?? payload) as T;
  }

  private normalizeUser(payload: any, fallbackPhoneNumber: string): User {
    const user = payload?.userInfo ?? payload?.user ?? payload ?? {};
    const token = payload?.token ?? payload?.accessToken ?? payload?.jwt;

    if (token) {
      localStorage.setItem('auth_token', token);
    }

    return {
      id: String(user.id ?? 'current-user'),
      phoneNumber: String(user.phoneNumber ?? user.phone_number ?? fallbackPhoneNumber),
      nickname: String(user.nickname ?? user.name ?? 'LearningStar'),
      avatar: String(user.avatar ?? user.avatarUrl ?? user.avatar_url ?? 'https://picsum.photos/100/100'),
    };
  }

  async sendLoginCode(phoneNumber: string): Promise<string | undefined> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(600);
      return undefined;
    }

    const data = await this.request<{ code?: string } | undefined>('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
    return data?.code ? String(data.code) : undefined;
  }

  async loginWithCode(phoneNumber: string, code: string): Promise<User> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(800);
      return { ...MOCK_USER, phoneNumber };
    }

    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code }),
    });
    return this.normalizeUser(data, phoneNumber);
  }

  async login(phoneNumber: string): Promise<User> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(800);
      return { ...MOCK_USER, phoneNumber };
    }

    const code = await this.sendLoginCode(phoneNumber);
    if (!code) {
      throw new Error('当前后端未返回本机号码验证码，请使用其他手机号登录');
    }
    return this.loginWithCode(phoneNumber, code);
  }

  async getCourses(): Promise<Course[]> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(500);
      return MOCK_COURSES;
    } else {
      try {
        const data = await this.request<any[] | { list?: any[]; records?: any[]; items?: any[] }>('/courses');
        const courses = Array.isArray(data) ? data : (data.list ?? data.records ?? data.items ?? []);
        return courses.map(course => this.normalizeCourse(course));
      } catch (error) {
        console.warn('Failed to load recommended courses, using mock courses.', error);
        return MOCK_COURSES;
      }
    }
  }

  async getCategories(): Promise<any[]> {
    if (CONFIG.USE_MOCK_DATA) {
      return [];
    }

    try {
      return await this.request<any[]>('/categories');
    } catch (error) {
      console.warn('Failed to load categories.', error);
      return [];
    }
  }

  async getCoursesByCategory(categoryId: string | number): Promise<Course[]> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(300);
      return MOCK_COURSES;
    }

    try {
      const data = await this.request<any[] | { list?: any[]; records?: any[]; items?: any[] }>(`/courses?categoryId=${categoryId}`);
      const courses = Array.isArray(data) ? data : (data.list ?? data.records ?? data.items ?? []);
      return courses.map(course => this.normalizeCourse(course));
    } catch (error) {
      console.warn('Failed to load category courses.', error);
      return MOCK_COURSES;
    }
  }

  async getCourseDetail(courseId: string): Promise<Course> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(400);
      return MOCK_COURSES.find(course => course.id === courseId) ?? MOCK_COURSES[0];
    }

    const data = await this.request<{ course?: any; lessons?: any[] } | any>(`/courses/${courseId}`);
    const course = data.course ?? data;
    return this.normalizeCourse({ ...course, lessons: data.lessons ?? course.lessons });
  }

  async getLessonDetail(lessonId: string): Promise<Lesson> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(300);
      return MOCK_COURSES.flatMap(course => course.lessons ?? []).find(lesson => lesson.id === lessonId) ?? MOCK_COURSES[0].lessons![0];
    }

    const data = await this.request<{ lesson?: any; course?: any } | any>(`/lessons/${lessonId}`);
    return this.normalizeLesson(data.lesson ?? data, data.course);
  }

  async getLessonTranscripts(lessonId: string): Promise<LessonSentence[]> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(300);
      return [];
    }

    const transcripts = await this.request<any[]>(`/lessons/${lessonId}/transcripts`);
    return transcripts.map((item, index) => ({
      id: String(item.id ?? `${lessonId}-${index}`),
      text: String(item.text ?? item.engText ?? item.eng_text ?? ''),
      translation: String(item.translation ?? item.zhText ?? item.zh_text ?? ''),
      startTime: Number(item.startTime ?? item.start_time ?? 0),
      duration: Number(item.duration ?? 0),
    }));
  }

  async reportLessonProgress(lessonId: string, progressSeconds: number): Promise<void> {
    if (CONFIG.USE_MOCK_DATA) return;

    await this.request('/user/progress', {
      method: 'POST',
      body: JSON.stringify({ lessonId: Number(lessonId), progressSeconds: Math.floor(progressSeconds) }),
    });
  }

  async getLessonKeyWords(lessonId: string): Promise<any[]> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(500);
      return [
        { word: 'chart', pronunciation: '/tʃɑːrt/', pos: 'n.', translation: '图表；海图；图纸 vt. 绘制...的图表', isSaved: false },
        { word: 'censorship', pronunciation: '/ˈsensərʃɪp/', pos: 'n.', translation: '审查员的职权;审查制度', isSaved: false },
        { word: 'headline', pronunciation: '/ˈhedlaɪn/', pos: 'n.', translation: '大标题；内容提要；栏外标题', isSaved: false },
        { word: 'criticism', pronunciation: '/ˈkrɪtɪsɪzəm/', pos: 'n.', translation: '批评，批判，指责 评论，评论文章', isSaved: false },
        { word: 'publicly', pronunciation: '/ˈpʌblɪkli/', pos: 'adv.', translation: '公然地；以公众名义', isSaved: false },
        { word: 'immigration', pronunciation: '/ˌɪmɪˈɡreɪʃn/', pos: 'n.', translation: '移民局检查站 移民', isSaved: false },
        { word: 'breach', pronunciation: '/briːtʃ/', pos: 'n.', translation: '违背，违反；缺口 vt. 打破；违反', isSaved: false },
        { word: 'transmit', pronunciation: '/trænsˈmɪt/', pos: 'vt.', translation: '传达；遗传；传播；发射', isSaved: false },
        { word: 'disorder', pronunciation: '/dɪsˈɔːrdər/', pos: 'n.', translation: '混乱；骚乱 vt. 扰乱；使失调', isSaved: false },
        { word: 'banjo', pronunciation: '/ˈbændʒoʊ/', pos: 'n.', translation: '班卓琴；五弦琴', isSaved: false },
      ];
    } else {
      try {
        return await this.request<any[]>(`/lessons/${lessonId}/keywords`);
      } catch (e) {
        // Fallback to mock data if API is down
        return [
          { word: 'chart', pronunciation: '/tʃɑːrt/', pos: 'n.', translation: '图表；海图；图纸 vt. 绘制...的图表', isSaved: false },
          { word: 'censorship', pronunciation: '/ˈsensərʃɪp/', pos: 'n.', translation: '审查员的职权;审查制度', isSaved: false },
          { word: 'headline', pronunciation: '/ˈhedlaɪn/', pos: 'n.', translation: '大标题；内容提要；栏外标题', isSaved: false },
          { word: 'criticism', pronunciation: '/ˈkrɪtɪsɪzəm/', pos: 'n.', translation: '批评，批判，指责 评论，评论文章', isSaved: false },
          { word: 'publicly', pronunciation: '/ˈpʌblɪkli/', pos: 'adv.', translation: '公然地；以公众名义', isSaved: false },
          { word: 'immigration', pronunciation: '/ˌɪmɪˈɡreɪʃn/', pos: 'n.', translation: '移民局检查站 移民', isSaved: false },
          { word: 'breach', pronunciation: '/briːtʃ/', pos: 'n.', translation: '违背，违反；缺口 vt. 打破；违反', isSaved: false },
          { word: 'transmit', pronunciation: '/trænsˈmɪt/', pos: 'vt.', translation: '传达；遗传；传播；发射', isSaved: false },
          { word: 'disorder', pronunciation: '/dɪsˈɔːrdər/', pos: 'n.', translation: '混乱；骚乱 vt. 扰乱；使失调', isSaved: false },
          { word: 'banjo', pronunciation: '/ˈbændʒoʊ/', pos: 'n.', translation: '班卓琴；五弦琴', isSaved: false },
        ];
      }
    }
  }
}

export const apiService = new ApiService();
