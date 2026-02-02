
export type TrackType = 'activity' | 'completion' | 'count';

export interface HabitRecord {
  timestamp: number;
  remark?: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: number;
  records: HabitRecord[]; 
  trackType: TrackType;
}

export type Screen = 'home' | 'detail' | 'add' | 'settings';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface HabitStats {
  totalCount: number;
  streak: number;
  lastHappen: number | null;
  dailyFrequency: { date: string; count: number }[];
}
