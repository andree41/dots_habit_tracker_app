import { Habit, HabitStats } from './types';

export const getHabitStats = (habit: Habit): HabitStats => {
  const sortedRecords = [...habit.records].sort((a, b) => b.timestamp - a.timestamp);
  const lastHappen = sortedRecords.length > 0 ? sortedRecords[0].timestamp : null;

  // Simple streak calculation
  let streak = 0;
  if (lastHappen) {
    const today = new Date().setHours(0, 0, 0, 0);
    const lastDate = new Date(lastHappen).setHours(0, 0, 0, 0);
    
    if (today - lastDate <= 86400000) {
      let currentDate = today;
      const recordDates = new Set(habit.records.map(r => new Date(r.timestamp).setHours(0, 0, 0, 0)));
      
      while (recordDates.has(currentDate)) {
        streak++;
        currentDate -= 86400000;
      }
    }
  }

  // Daily frequency for last 7 days
  const dailyFrequency = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = habit.records.filter(r => new Date(r.timestamp).toISOString().split('T')[0] === dateStr).length;
    dailyFrequency.push({ date: dateStr, count });
  }

  return {
    totalCount: habit.records.length,
    streak,
    lastHappen,
    dailyFrequency
  };
};

export const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return 'No records';
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

export const getLightColor = (hex: string) => {
  if (!hex.startsWith('#')) return 'rgba(255, 75, 75, 0.1)';
  return `${hex}1A`; 
};