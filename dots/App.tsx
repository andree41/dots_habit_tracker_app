import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { Habit, Screen, ThemeMode, TrackType, HabitRecord } from './types';
import HabitCard from './components/HabitCard';
import HabitDetailView from './components/HabitDetailView';
import AddHabitModal from './components/AddHabitModal';
import SettingsView from './components/SettingsView';
import { Plus, Settings, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  const [tick, setTick] = useState(0);

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('becord_theme_mode') as ThemeMode;
    return saved || 'system';
  });

  const isDark = (() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18;
  })();

  useLayoutEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('becord_theme_mode', themeMode);
  }, [isDark, themeMode]);

  useEffect(() => {
    if (themeMode === 'system') {
      const interval = setInterval(() => setTick(t => t + 1), 60000);
      return () => clearInterval(interval);
    }
  }, [themeMode]);

  useEffect(() => {
    const saved = localStorage.getItem('becord_habits');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        
        // Migration: convert old number[] records to HabitRecord[] objects
        let needsMigration = false;
        const migrated = parsed.map((h: any) => {
          if (h.records.length > 0 && typeof h.records[0] === 'number') {
            needsMigration = true;
            return {
              ...h,
              records: h.records.map((ts: number) => ({ timestamp: ts }))
            };
          }
          return h;
        });

        if (needsMigration) {
          setHabits(migrated);
          localStorage.setItem('becord_habits', JSON.stringify(migrated));
        } else {
          setHabits(parsed);
        }
      } catch (e) {
        console.error("Failed to parse habits", e);
      }
    } else {
      const initial: Habit[] = [
        { 
          id: '1', 
          name: 'Stay up', 
          icon: '☁️', 
          color: '#5856D6', 
          trackType: 'activity',
          createdAt: new Date('2022-02-10').getTime(), 
          records: [
            { timestamp: new Date('2022-02-18 03:32:00').getTime(), remark: 'Finished a movie' },
            { timestamp: new Date('2022-02-17 02:32:00').getTime() },
            { timestamp: new Date('2022-02-13 04:36:00').getTime() },
          ] 
        },
        { id: '2', name: 'BadEmotions', icon: '😮‍💨', color: '#FF9F0A', trackType: 'activity', createdAt: Date.now(), records: [] },
        { id: '3', name: 'Cold', icon: '🌡️', color: '#FF4B4B', trackType: 'completion', createdAt: Date.now(), records: [] },
      ];
      setHabits(initial);
      localStorage.setItem('becord_habits', JSON.stringify(initial));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('becord_habits', JSON.stringify(habits));
  }, [habits]);

  const handleAddHabit = (data: { name: string; icon: string; color: string; trackType: TrackType }) => {
    if (editingHabit) {
      setHabits(prev => prev.map(h => h.id === editingHabit.id ? { ...h, ...data } : h));
      setEditingHabit(null);
    } else {
      const newHabit: Habit = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: Date.now(),
        records: []
      };
      setHabits(prev => [newHabit, ...prev]);
    }
    setIsAdding(false);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setCurrentScreen('home');
    setSelectedHabitId(null);
    setIsAdding(false);
    setEditingHabit(null);
  };

  const handleRecord = useCallback((id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        if (h.trackType === 'completion') {
          const todayStr = new Date().toISOString().split('T')[0];
          const hasRecordToday = h.records.some(r => new Date(r.timestamp).toISOString().split('T')[0] === todayStr);
          if (hasRecordToday) return h;
        }
        return { ...h, records: [{ timestamp: Date.now() }, ...h.records] };
      }
      return h;
    }));
  }, []);

  const handleDeleteRecord = useCallback((habitId: string, timestamp: number) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        return { ...h, records: h.records.filter(r => r.timestamp !== timestamp) };
      }
      return h;
    }));
  }, []);

  const handleUpdateRecord = useCallback((habitId: string, timestamp: number, remark: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          records: h.records.map(r => r.timestamp === timestamp ? { ...r, remark } : r)
        };
      }
      return h;
    }));
  }, []);

  const handleResetData = () => {
    setHabits([]);
    localStorage.removeItem('becord_habits');
  };

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  const renderContent = () => {
    switch (currentScreen) {
      case 'settings':
        return (
          <SettingsView 
            onBack={() => setCurrentScreen('home')}
            habits={habits}
            onImport={(newHabits) => setHabits(newHabits)}
            onReset={handleResetData}
            themeMode={themeMode}
            onChangeTheme={setThemeMode}
            isDark={isDark}
          />
        );
      case 'detail':
        return selectedHabit ? (
          <HabitDetailView 
            habit={selectedHabit} 
            onBack={() => {
              setCurrentScreen('home');
              setSelectedHabitId(null);
            }}
            onDelete={handleDeleteHabit}
            onRecord={handleRecord}
            onDeleteRecord={handleDeleteRecord}
            onUpdateRecord={handleUpdateRecord}
            onEdit={(habit) => {
              setEditingHabit(habit);
              setIsAdding(true);
            }}
            isDark={isDark}
          />
        ) : null;
      default:
        return (
          <div className="max-w-md mx-auto min-h-screen relative flex flex-col px-6 py-12">
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Dots</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentScreen('settings')}
                  className="p-3 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors"
                >
                  <Settings size={24} />
                </button>
                <button 
                  onClick={() => {
                    setEditingHabit(null);
                    setIsAdding(true);
                  }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-2xl transition-colors"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1">
              {habits.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center px-8 animate-in fade-in zoom-in duration-700">
                  <div className="w-20 h-20 bg-white dark:bg-[#1c1c1e] rounded-[28px] mb-8 flex items-center justify-center text-3xl shadow-xl shadow-gray-200/50 dark:shadow-none animate-bounce duration-[3000ms]">
                    <Sparkles className="text-orange-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Shall we start a habit?</h3>
                  <p className="text-[15px] font-medium text-gray-400 dark:text-gray-500 leading-relaxed max-w-[240px]">
                    Tap the plus button above to begin your tracking journey. ✨
                  </p>
                </div>
              ) : (
                habits.map(habit => (
                  <HabitCard 
                    key={habit.id} 
                    habit={habit} 
                    onClick={() => {
                      setSelectedHabitId(habit.id);
                      setCurrentScreen('detail');
                    }}
                    onRecord={() => handleRecord(habit.id)}
                    isDark={isDark}
                  />
                ))
              )}
            </div>

            <p className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              {habits.length > 0 ? "tap card for detail, tap + to record" : "every small step counts"}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-black transition-colors duration-300">
      {renderContent()}
      {isAdding && (
        <AddHabitModal 
          onClose={() => {
            setIsAdding(false);
            setEditingHabit(null);
          }} 
          onAdd={handleAddHabit}
          onDelete={handleDeleteHabit}
          initialHabit={editingHabit || undefined}
        />
      )}
    </div>
  );
};

export default App;