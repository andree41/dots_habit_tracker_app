import React, { useMemo, useState } from 'react';
import { Habit, HabitRecord } from '../types';
import { getHabitStats, formatDate, getLightColor } from '../utils';
import { ChevronLeft, Share, Plus, Edit2, Monitor, Trash2, TrendingUp, Calendar, FileText, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import SharePoster from './SharePoster';

interface HabitDetailViewProps {
  habit: Habit;
  onBack: () => void;
  onDelete: (id: string) => void;
  onRecord: (id: string) => void;
  onDeleteRecord: (habitId: string, timestamp: number) => void;
  onUpdateRecord: (habitId: string, timestamp: number, remark: string) => void;
  onEdit: (habit: Habit) => void;
  isDark: boolean;
}

type Filter = 'Last Month' | 'Last Quarter' | 'Last Year';

const HabitDetailView: React.FC<HabitDetailViewProps> = ({ habit, onBack, onDelete, onRecord, onDeleteRecord, onUpdateRecord, onEdit, isDark }) => {
  const [filter, setFilter] = useState<Filter>('Last Month');
  const [editingRecord, setEditingRecord] = useState<HabitRecord | null>(null);
  const [remarkInput, setRemarkInput] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const stats = useMemo(() => getHabitStats(habit), [habit]);

  const activityGrid = useMemo(() => {
    const days = filter === 'Last Month' ? 30 : filter === 'Last Quarter' ? 90 : 365;
    const grid = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = habit.records.filter(r => new Date(r.timestamp).toISOString().split('T')[0] === dateStr).length;
      grid.push({ 
        count, 
        dateStr,
        displayDate: d.toLocaleDateString([], { month: 'short', day: 'numeric' })
      });
    }
    return grid;
  }, [habit.records, filter]);

  const chartData = useMemo(() => {
    const limit = filter === 'Last Month' ? 30 : 20; 
    return activityGrid.slice(-limit);
  }, [activityGrid, filter]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, HabitRecord[]> = {};
    [...habit.records].sort((a, b) => b.timestamp - a.timestamp).forEach(record => {
      const d = new Date(record.timestamp).toISOString().split('T')[0];
      if (!groups[d]) groups[d] = [];
      groups[d].push(record);
    });
    return Object.entries(groups).map(([date, records]) => ({ date, records }));
  }, [habit.records]);

  const handleEditRemark = (record: HabitRecord) => {
    setEditingRecord(record);
    setRemarkInput(record.remark || '');
  };

  const handleSaveRemark = () => {
    if (editingRecord) {
      onUpdateRecord(habit.id, editingRecord.timestamp, remarkInput);
      setEditingRecord(null);
    }
  };

  const lightBg = getLightColor(habit.color);

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20 animate-in fade-in slide-in-from-right duration-300 select-none">
      
      {/* Share Poster Modal */}
      {isSharing && (
        <SharePoster 
          habit={habit} 
          stats={stats} 
          onClose={() => setIsSharing(false)} 
        />
      )}

      {/* Remark Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-[#f2f2f7] dark:bg-black w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="bg-white dark:bg-[#1c1c1e] px-6 pt-10 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <button onClick={() => setEditingRecord(null)} className="text-[#ff4b4b] text-[17px] font-medium">Cancel</button>
              <h2 className="text-[17px] font-bold text-black dark:text-white">Add Remark</h2>
              <button onClick={handleSaveRemark} className="text-[#ff4b4b] text-[17px] font-bold">Done</button>
            </div>
            <div className="p-6">
              <textarea 
                autoFocus
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                placeholder="How did it go?..."
                className="w-full h-32 bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 text-[16px] text-black dark:text-white outline-none placeholder:text-gray-300 shadow-sm"
              />
              <p className="mt-4 text-[11px] text-gray-400 font-bold uppercase tracking-widest text-center">
                Notes are saved locally on your device
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-12 pb-2 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
        <button onClick={onBack} className="flex items-center text-[#ff4b4b] font-medium transition-opacity active:opacity-50">
          <ChevronLeft size={24} strokeWidth={3} />
          <span className="text-lg">Dots</span>
        </button>
        <button 
          onClick={() => setIsSharing(true)}
          className="text-[#ff4b4b] transition-opacity active:opacity-50"
        >
          <Share size={22} />
        </button>
      </div>

      <div className="px-6">
        <h1 className="text-3xl font-bold text-black dark:text-white mt-2 mb-6">Track Detail</h1>

        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{habit.icon}</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{habit.name}</h2>
              <div className="flex items-center gap-2 ml-auto">
                <button 
                  onClick={() => onRecord(habit.id)} 
                  className="p-3 rounded-full transition-transform active:scale-90" 
                  style={{ backgroundColor: lightBg, color: habit.color }}
                  title="Record Today"
                >
                  <Plus size={22} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => onEdit(habit)} 
                  className="p-2 rounded-full transition-all active:scale-90" 
                  style={{ color: habit.color }}
                  title="Edit Habit"
                >
                  <Edit2 size={22} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              From {formatDate(habit.createdAt)}, {stats.totalCount} times in total
            </p>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex mb-6">
          {(['Last Month', 'Last Quarter', 'Last Year'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === f ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-[#1c1c1e] p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Streak</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-black dark:text-white">{stats.streak}</span>
                    <span className="text-xs font-bold text-gray-400">days</span>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#1c1c1e] p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Success Rate</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-black dark:text-white">
                        {Math.round((stats.totalCount / (activityGrid.length || 1)) * 100)}%
                    </span>
                </div>
            </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-200">Frequency Trend</h3>
          </div>
          <div className="h-40 w-full -ml-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="displayDate" hide={true} />
                <YAxis hide={true} domain={[0, 'auto']} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/90 dark:bg-white/90 text-white dark:text-black px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-sm">
                          {payload[0].payload.dateStr}: {payload[0].value} times
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count > 0 ? habit.color : (isDark ? '#2c2c2e' : '#F3F4F6')} 
                      opacity={entry.count > 0 ? 1 : 0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-200">Activity Map</h3>
          </div>
          <div className="grid grid-cols-10 gap-2 overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            {activityGrid.slice(-100).map((day, i) => {
              const opacity = day.count > 0 ? Math.min(0.3 + (day.count * 0.2), 1) : 1;
              return (
                <div 
                  key={i} 
                  title={`${day.dateStr}: ${day.count} records`}
                  className={`aspect-square rounded-[6px] transition-all duration-500 hover:scale-110 cursor-pointer`}
                  style={{ 
                    backgroundColor: day.count > 0 ? habit.color : (isDark ? '#2c2c2e' : '#E5E7EB'),
                    opacity: opacity
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">History Logs</h3>
          {groupedRecords.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm italic">
                No logs recorded yet.
            </div>
          ) : (
            groupedRecords.map((group) => (
                <div key={group.date}>
                <h3 className="text-gray-300 dark:text-gray-600 font-bold mb-4 tracking-tight">{group.date}</h3>
                <div className="space-y-4">
                    {group.records.map((record, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleEditRemark(record)}
                      className="flex items-start gap-4 group cursor-pointer active:opacity-70 transition-opacity"
                    >
                        <div className="w-1 h-10 rounded-full mt-1 shrink-0" style={{ backgroundColor: habit.color }} />
                        <div className="flex-1 flex items-start justify-between">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                            <div className="bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-lg shrink-0">
                                <Monitor size={14} className="text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="font-bold text-sm text-black dark:text-white truncate">
                                {habit.name}
                            </span>
                            {record.remark && <MessageSquare size={12} className="text-gray-300 dark:text-gray-600 ml-1 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </p>
                            {record.remark && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-lg border-l-2 border-gray-200 dark:border-gray-800 animate-in fade-in duration-300">
                                "{record.remark}"
                              </div>
                            )}
                        </div>
                        <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRecord(habit.id, record.timestamp);
                            }}
                            className="p-2 text-gray-300 hover:text-red-500 transition-all active:scale-90"
                        >
                            <Trash2 size={20} strokeWidth={1.5} />
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitDetailView;