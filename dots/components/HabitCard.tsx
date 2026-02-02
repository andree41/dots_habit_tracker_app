import React, { useMemo } from 'react';
import { Habit } from '../types';
import { formatDate, getHabitStats, getLightColor } from '../utils';
import { Plus, Check } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  onClick: () => void;
  onRecord: () => void;
  isDark: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onClick, onRecord, isDark }) => {
  const stats = useMemo(() => getHabitStats(habit), [habit]);

  const isDoneToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return habit.records.some(r => new Date(r.timestamp).toISOString().split('T')[0] === todayStr);
  }, [habit.records]);

  const historyDots = useMemo(() => {
    const dots = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasRecord = habit.records.some(r => new Date(r.timestamp).toISOString().split('T')[0] === dateStr);
      dots.push(hasRecord);
    }
    return dots;
  }, [habit.records]);

  const lightBg = getLightColor(habit.color);

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 mb-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center group relative active:scale-[0.98]"
    >
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mr-4 shrink-0 transition-transform group-hover:scale-105"
        style={{ backgroundColor: lightBg, color: habit.color }}
      >
        {habit.icon}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate leading-tight">{habit.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {habit.trackType === 'completion' ? (isDoneToday ? 'Completed today' : 'Pending today') : `Last: ${formatDate(stats.lastHappen)}`}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1 ml-4 shrink-0">
        {historyDots.map((hasRecord, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full transition-colors duration-300`}
            style={{ 
              backgroundColor: hasRecord ? habit.color : (isDark ? '#2c2c2e' : '#F3F4F6'), 
              opacity: hasRecord ? 1 : 1 
            }}
          />
        ))}
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRecord();
        }}
        disabled={habit.trackType === 'completion' && isDoneToday}
        className={`ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
          habit.trackType === 'completion' && isDoneToday ? 'opacity-30 scale-90' : 'active:scale-90 hover:shadow-lg'
        }`}
        style={{ backgroundColor: lightBg, color: habit.color }}
        title={habit.trackType === 'completion' && isDoneToday ? 'Already Completed' : 'Quick Record'}
      >
        {habit.trackType === 'completion' && isDoneToday ? (
          <Check size={20} strokeWidth={4} />
        ) : (
          <Plus size={20} strokeWidth={3} />
        )}
      </button>
    </div>
  );
};

export default HabitCard;