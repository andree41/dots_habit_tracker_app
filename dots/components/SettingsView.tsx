import React, { useRef, useState } from 'react';
import { ChevronLeft, Download, Upload, Trash2, Info, Moon, ShieldCheck, Sun, Clock, AlertTriangle } from 'lucide-react';
import { Habit, ThemeMode } from '../types';

interface SettingsViewProps {
  onBack: () => void;
  habits: Habit[];
  onImport: (habits: Habit[]) => void;
  onReset: () => void;
  themeMode: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  onBack, 
  habits, 
  onImport, 
  onReset, 
  themeMode, 
  onChangeTheme,
  isDark
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const handleExport = () => {
    const dataStr = JSON.stringify(habits, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `dots_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedHabits = JSON.parse(content) as Habit[];
        if (Array.isArray(importedHabits) && (importedHabits.length === 0 || importedHabits[0].id)) {
          if (window.confirm('This will replace your current data. Are you sure?')) {
            onImport(importedHabits);
            alert('Data imported successfully!');
          }
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse the file.');
      }
    };
    fileReader.readAsText(file);
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConfirmingReset) {
      setIsConfirmingReset(true);
    } else {
      onReset();
      setIsConfirmingReset(false);
      onBack();
    }
  };

  const handleScreenClick = () => {
    if (isConfirmingReset) setIsConfirmingReset(false);
  };

  return (
    <div 
      onClick={handleScreenClick}
      className="min-h-screen bg-[#f2f2f7] dark:bg-black animate-in fade-in slide-in-from-right duration-300"
    >
      <div className="px-4 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-[#f2f2f7]/80 dark:bg-black/80 backdrop-blur-md z-20">
        <button onClick={onBack} className="flex items-center text-[#ff4b4b] font-medium transition-opacity active:opacity-50">
          <ChevronLeft size={24} strokeWidth={3} />
          <span className="text-lg">Dots</span>
        </button>
        <h2 className="text-lg font-bold text-black dark:text-white absolute left-1/2 -translate-x-1/2">Settings</h2>
        <div className="w-10" />
      </div>

      <div className="px-5 py-6 space-y-8 max-w-md mx-auto">
        <section>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 ml-4">
            APPEARANCE
          </p>
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-indigo-500/20 text-indigo-400' : themeMode === 'light' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                {themeMode === 'dark' ? <Moon size={18} /> : themeMode === 'light' ? <Sun size={18} /> : <Clock size={18} />}
              </div>
              <span className="text-[16px] font-medium text-black dark:text-white">Theme Mode</span>
            </div>

            <div className="bg-gray-100 dark:bg-black/50 p-1 rounded-xl flex">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onChangeTheme(mode)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                    themeMode === mode 
                      ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {themeMode === 'system' && (
              <p className="text-[11px] text-gray-400 font-medium px-1 animate-in fade-in slide-in-from-top-1">
                Auto switches: Light from 6 AM to 6 PM, Dark at night.
              </p>
            )}
          </div>
        </section>

        <section>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 ml-4">
            DATA MANAGEMENT
          </p>
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 shadow-sm">
            <button 
              onClick={handleExport}
              className="w-full px-4 py-4 flex items-center justify-between transition-colors active:bg-gray-50 dark:active:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                  <Download size={18} />
                </div>
                <span className="text-[16px] font-medium text-black dark:text-white">Export Backup</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">JSON File</span>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-4 flex items-center justify-between transition-colors active:bg-gray-50 dark:active:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <span className="text-[16px] font-medium text-black dark:text-white">Import Backup</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                className="hidden" 
                accept=".json"
              />
            </button>
          </div>
        </section>

        <section>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 ml-4">
            DANGER ZONE
          </p>
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={handleResetClick}
              className={`w-full px-4 py-4 flex items-center gap-3 transition-all duration-300 active:scale-[0.98] ${
                isConfirmingReset 
                ? 'bg-red-500 text-white' 
                : 'bg-white dark:bg-[#1c1c1e] text-red-500 active:bg-red-50 dark:active:bg-red-900/10'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isConfirmingReset ? 'bg-white/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                {isConfirmingReset ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
              </div>
              <span className="text-[16px] font-bold">
                {isConfirmingReset ? 'Confirm Reset?' : 'Reset All Data'}
              </span>
            </button>
          </div>
          {isConfirmingReset && (
            <div className="mt-3 px-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-3 flex gap-3">
                <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-600 dark:text-red-400 font-medium leading-relaxed">
                  DANGER: This will permanently delete all your trackers and records. This action cannot be undone. Tap again to confirm.
                </p>
              </div>
            </div>
          )}
        </section>

        <section>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 ml-4">
            ABOUT
          </p>
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 shadow-sm">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                  <Info size={18} />
                </div>
                <span className="text-[16px] font-medium text-black dark:text-white">Version</span>
              </div>
              <span className="text-xs text-gray-400 font-bold">1.0.0 (Stable)</span>
            </div>
            
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-[16px] font-medium text-black dark:text-white">Privacy</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">Local Only</span>
            </div>
          </div>
        </section>

        <div className="pt-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Made with ❤️ for better habits
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;