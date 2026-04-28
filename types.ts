
export interface Course {
  id: string;
  categoryId?: string | number;
  title: string;
  subtitle: string;
  description?: string;
  imageUrl: string;
  vocabularyCount?: number;
  playCount: number;
  tags: string[];
  isVip?: boolean;
  themeColor?: string;
  author?: string;
  price?: number;
  category?: string; // For filtering in Daily Reading
  accessType?: string;
  lessons?: Lesson[]; // Specific lessons for this course
}

export interface Lesson {
  id: string;
  courseId?: string | number;
  categoryId?: string | number;
  title: string;
  duration?: string;
  durationSeconds?: number;
  isLearned: boolean;
  mediaType?: 'audio' | 'video';
  mediaUrl?: string;
  coverUrl?: string;
  subtitles?: LessonSentence[];
  lastPlaybackPosition?: number; // in seconds
  playbackRate?: number;
  loopMode?: 'order' | 'channel-repeat' | 'repeat' | 'shuffle' | 'single';
  sortOrder?: number;
}

export interface LessonSentence {
  id: string;
  text: string;
  translation: string;
  startTime: number; // in seconds
  duration: number;
}

export interface User {
  id: string;
  phoneNumber: string;
  nickname: string;
  avatar: string;
}

export interface WordItem {
  word: string;
  pronunciation: string;
  pos: string; // part of speech (e.g. n. vt.)
  translation: string;
  isSaved?: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export enum TabName {
  HOME = '首页',
  BOOKSHELF = '书架',
  AI_CHAT = 'AI助教',
  VOCABULARY = '生词本',
  PROFILE = '我的'
}
