
import React, { useState } from 'react';
import { Habit, HabitStats } from '../types';
import { formatDate } from '../utils';
import { X, Share2, Copy, CheckCircle2 } from 'lucide-react';

interface SharePosterProps {
  habit: Habit;
  stats: HabitStats;
  onClose: () => void;
}

const SharePoster: React.FC<SharePosterProps> = ({ habit, stats, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Generate data for the last 30 days
  const gridData = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hasRecord = habit.records.some(r => new Date(r.timestamp).toISOString().split('T')[0] === dateStr);
    gridData.push(hasRecord);
  }

  const generateEmojiGrid = () => {
    // Generate a 3x10 emoji grid for the share text
    let gridText = '';
    for (let i = 0; i < gridData.length; i++) {
      gridText += gridData[i] ? '🟦' : '⬜';
      if ((i + 1) % 10 === 0) gridText += '\n';
    }
    return gridText;
  };

  const shareText = `🔥 Habit: ${habit.name}\n📅 Streak: ${stats.streak} Days\n✅ Total: ${stats.totalCount} Logs\n\n${generateEmojiGrid()}\nTracked on Dots ✨`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${habit.name} progress`,
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert("Please take a screenshot to share! ✨");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* The Card */}
        <div id="share-card" className="bg-white dark:bg-[#1c1c1e] rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
          {/* Gradient Header */}
          <div 
            className="h-48 relative flex flex-col items-center justify-center text-white"
            style={{ 
              background: `radial-gradient(circle at top right, ${habit.color}, ${habit.color}dd), linear-gradient(135deg, ${habit.color}aa, #000000)` 
            }}
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
                <div className="absolute top-20 right-0 w-60 h-60 rounded-full bg-white/30 blur-3xl" />
            </div>
            
            <div className="bg-white/20 backdrop-blur-xl p-4 rounded-[24px] mb-4 shadow-xl border border-white/20">
                <span className="text-4xl">{habit.icon}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{habit.name}</h2>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Journey Summary</p>
          </div>

          {/* Stats Section */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Current Streak</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">{stats.streak}</span>
                  <span className="text-sm font-bold text-gray-400">Days</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Logs</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalCount}</span>
                  <span className="text-sm font-bold text-gray-400">Times</span>
                </div>
              </div>
            </div>

            {/* Activity Grid */}
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 text-center">Last 30 Days</p>
              <div className="grid grid-cols-10 gap-2 px-2">
                {gridData.map((active, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-full transition-all duration-700`}
                    style={{ 
                      backgroundColor: active ? habit.color : '#f3f4f6',
                      opacity: active ? 1 : (document.documentElement.classList.contains('dark') ? 0.1 : 1)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Footer / Watermark */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-900 dark:text-white tracking-tighter">DOTS TRACKING</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Since {formatDate(habit.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 opacity-30 grayscale">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-4 rounded-3xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <X size={20} />
            Close
          </button>
          <button 
            onClick={handleShare}
            className={`flex-[2] py-4 rounded-3xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${
              copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:shadow-white/10'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 size={20} />
                Copied Grid!
              </>
            ) : (
              <>
                <Share2 size={20} />
                {navigator.share ? 'Share Progress' : 'Copy Visual Grid'}
              </>
            )}
          </button>
        </div>

        <p className="text-white/40 text-[10px] text-center mt-6 font-medium">
          {navigator.share ? 'Sends a visual summary with emojis ✨' : 'Click to copy your visual journey to clipboard ✨'}
        </p>
      </div>
    </div>
  );
};

export default SharePoster;
