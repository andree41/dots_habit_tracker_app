
import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, Trash2, AlertCircle, Zap, CheckCircle, Hash, ChevronLeft } from 'lucide-react';
import { Habit, TrackType } from '../types';

interface AddHabitModalProps {
  onClose: () => void;
  onAdd: (habit: { name: string; icon: string; color: string; trackType: TrackType }) => void;
  onDelete?: (id: string) => void;
  initialHabit?: Habit;
}

const ICONS = ['🔥', '💧', '🥗', '📖', '💻', '🧘', '🏃', '💤', '💊', '🍎', '🍵', '🎨', '🎸', '🧹', '💰', '☁️', '😮‍💨', '🌡️', '🧠', '❤️', '🌟'];
const COLORS = [
  '#FF4B4B', // Red
  '#FF9F0A', // Orange
  '#34C759', // Green
  '#007AFF', // Blue
  '#5856D6', // Indigo
  '#AF52DE'  // Purple
];

const TRACK_TYPES: { id: TrackType; name: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'activity', name: 'Activity Log', desc: 'Unlimited logs per day. Best for tracking frequency.', icon: <Zap size={18} /> },
  { id: 'completion', name: 'Daily Check', desc: 'Single log per day. Best for behavioral habits.', icon: <CheckCircle size={18} /> },
  { id: 'count', name: 'Basic Counter', desc: 'Numerical tracking for volume-based goals.', icon: <Hash size={18} /> },
];

const AddHabitModal: React.FC<AddHabitModalProps> = ({ onClose, onAdd, onDelete, initialHabit }) => {
  const [name, setName] = useState(initialHabit?.name || '');
  const [icon, setIcon] = useState(initialHabit?.icon || ICONS[0]);
  const [color, setColor] = useState(initialHabit?.color || COLORS[0]);
  const [trackType, setTrackType] = useState<TrackType>(initialHabit?.trackType || 'activity');
  
  const [activeMenu, setActiveMenu] = useState<'main' | 'icons' | 'colors' | 'types'>('main');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name);
      setIcon(initialHabit.icon);
      setColor(initialHabit.color);
      setTrackType(initialHabit.trackType);
    }
  }, [initialHabit]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    onAdd({ name, icon, color, trackType });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!initialHabit || !onDelete) return;
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
    } else {
      onDelete(initialHabit.id);
    }
  };

  const selectedType = TRACK_TYPES.find(t => t.id === trackType);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        onClick={() => isConfirmingDelete && setIsConfirmingDelete(false)}
        className="bg-[#f2f2f7] dark:bg-black w-full max-w-md h-[94vh] sm:h-auto sm:max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
      >
        
        {/* Header Section */}
        <div className="bg-white dark:bg-[#1c1c1e] px-6 pt-12 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0 relative z-20">
          {activeMenu !== 'main' ? (
            <button 
              type="button"
              onClick={() => setActiveMenu('main')} 
              className="flex items-center text-[#ff4b4b] text-[17px] font-medium transition-opacity active:opacity-50"
            >
              <ChevronLeft size={20} strokeWidth={3} className="-ml-1" />
              <span>Back</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={onClose} 
              className="text-[#ff4b4b] text-[17px] font-medium transition-opacity active:opacity-50"
            >
              Cancel
            </button>
          )}
          
          <h2 className="text-[17px] font-bold text-black dark:text-white absolute left-1/2 -translate-x-1/2">
            {activeMenu === 'types' ? 'Track Type' : activeMenu === 'icons' ? 'Choose Icon' : activeMenu === 'colors' ? 'Icon Color' : initialHabit ? 'Set Tracker' : 'New Tracker'}
          </h2>

          <button 
            type="button"
            onClick={() => handleSubmit()}
            disabled={!name.trim() || activeMenu !== 'main'}
            className="text-[#ff4b4b] text-[17px] font-bold transition-opacity active:opacity-50 disabled:opacity-30"
          >
            {initialHabit ? 'Update' : 'Create'}
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          
          {/* Main View */}
          <div className={`h-full overflow-y-auto px-5 py-6 space-y-7 pb-12 no-scrollbar transition-transform duration-300 ${activeMenu !== 'main' ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 ml-4">
                THAT YOU WISH TO LOG
              </p>
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                <div className="px-4 py-4 flex items-center">
                  <input 
                    type="text" 
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Habit Name"
                    className="w-full text-[16px] font-medium text-black dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 bg-transparent leading-normal"
                  />
                </div>
                <div 
                  onClick={() => setActiveMenu('types')}
                  className="px-4 py-4 flex items-center justify-between transition-colors active:bg-gray-50 dark:active:bg-gray-800 cursor-pointer"
                >
                  <span className="text-[16px] font-medium text-black dark:text-white">Track Type</span>
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                    <span className="text-[15px] font-medium">{selectedType?.name}</span>
                    <ChevronRight size={18} className="opacity-50" />
                  </div>
                </div>
                <div 
                  onClick={() => setActiveMenu('colors')}
                  className="px-4 py-4 flex items-center justify-between transition-colors active:bg-gray-50 dark:active:bg-gray-800 cursor-pointer"
                >
                  <span className="text-[16px] font-medium text-black dark:text-white">Icon Color</span>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-5 rounded-[8px] transition-colors" style={{ backgroundColor: color }} />
                    <ChevronRight size={18} className="text-gray-400 dark:text-gray-500 opacity-50" />
                  </div>
                </div>
                <div 
                  onClick={() => setActiveMenu('icons')}
                  className="px-4 py-4 flex items-center justify-between transition-colors active:bg-gray-50 dark:active:bg-gray-800 cursor-pointer"
                >
                  <span className="text-[#ff4b4b] text-[16px] font-medium">Choose Icon</span>
                  <div className="flex items-center gap-2 text-gray-300 dark:text-gray-600">
                    <span className="text-xl filter drop-shadow-sm">{icon}</span>
                    <ChevronRight size={18} className="opacity-50" />
                  </div>
                </div>
              </div>
            </div>

            {initialHabit && onDelete && (
              <div className="pt-2">
                <button 
                  type="button"
                  onClick={handleDeleteClick}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 border shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.98] ${
                    isConfirmingDelete 
                      ? 'bg-red-500 text-white border-red-600' 
                      : 'bg-white dark:bg-[#1c1c1e] text-[#ff4b4b] border-gray-100 dark:border-gray-800'
                  }`}
                >
                  {isConfirmingDelete ? (
                    <>
                      <AlertCircle size={24} strokeWidth={2.5} />
                      <span className="text-[17px] font-bold">Confirm Delete?</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={24} strokeWidth={2} />
                      <span className="text-[17px] font-bold">Delete Tracker</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sub-menu: Track Type Selection */}
          <div className={`absolute inset-0 h-full overflow-y-auto px-5 py-6 space-y-4 transition-transform duration-300 ${activeMenu === 'types' ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
               {TRACK_TYPES.map((type) => (
                 <button
                   key={type.id}
                   onClick={() => { setTrackType(type.id); setActiveMenu('main'); }}
                   className="w-full px-4 py-5 flex items-start gap-4 text-left transition-colors active:bg-gray-50 dark:active:bg-gray-800"
                 >
                   <div className={`mt-0.5 p-2 rounded-xl flex items-center justify-center ${trackType === type.id ? 'bg-[#ff4b4b] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                     {type.icon}
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center justify-between">
                       <span className="text-[16px] font-bold text-black dark:text-white">{type.name}</span>
                       {trackType === type.id && <Check size={18} className="text-[#ff4b4b]" />}
                     </div>
                     <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">{type.desc}</p>
                   </div>
                 </button>
               ))}
             </div>
          </div>

          {/* Sub-menu: Icon Selection */}
          <div className={`absolute inset-0 h-full overflow-y-auto px-5 py-6 transition-transform duration-300 ${activeMenu === 'icons' ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 grid grid-cols-5 gap-4">
                {ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => { setIcon(emoji); setActiveMenu('main'); }}
                    className={`aspect-square text-2xl flex items-center justify-center rounded-[18px] transition-all ${
                      icon === emoji ? 'bg-[#ff4b4b] text-white scale-110 shadow-lg' : 'bg-gray-50 dark:bg-gray-800 active:scale-95'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
             </div>
          </div>

          {/* Sub-menu: Color Selection */}
          <div className={`absolute inset-0 h-full overflow-y-auto px-5 py-6 transition-transform duration-300 ${activeMenu === 'colors' ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 grid grid-cols-3 gap-6">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setActiveMenu('main'); }}
                    className={`h-16 rounded-2xl transition-all flex items-center justify-center ${
                      color === c ? 'ring-4 ring-offset-4 ring-[#ff4b4b] dark:ring-[#ff4b4b] scale-105 shadow-md' : 'active:scale-95'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check size={28} className="text-white drop-shadow-md" strokeWidth={3} />}
                  </button>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddHabitModal;
