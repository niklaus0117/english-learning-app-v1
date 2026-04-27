import { CONFIG, MOCK_COURSES, MOCK_USER } from '../constants';
import { Course, User, ApiResponse } from '../types';

/**
 * Simulates a delay to mimic network latency
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  async login(phoneNumber: string): Promise<User> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(800);
      return { ...MOCK_USER, phoneNumber };
    } else {
      const response = await fetch(`${CONFIG.API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data: ApiResponse<User> = await response.json();
      return data.data;
    }
  }

  async getCourses(): Promise<Course[]> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(500);
      return MOCK_COURSES;
    } else {
      const response = await fetch(`${CONFIG.API_BASE_URL}/courses/recommend`);
      const data: ApiResponse<Course[]> = await response.json();
      return data.data;
    }
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
        const response = await fetch(`${CONFIG.API_BASE_URL}/lessons/${lessonId}/keywords`);
        if (!response.ok) throw new Error('API down');
        const data: ApiResponse<any[]> = await response.json();
        return data.data;
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
        const response = await fetch(`${CONFIG.API_BASE_URL}/lessons/${lessonId}/keywords`);
        if (!response.ok) throw new Error('API down');
        const data: ApiResponse<any[]> = await response.json();
        return data.data;
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