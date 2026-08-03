import React from 'react';
import { useApp } from '../../context/AppContext';
import { SystemLogo } from '../common/SystemLogo';
import {
  Moon,
  Sun,
  CloudUpload,
  LogOut,
  Download,
  User,
  GraduationCap
} from 'lucide-react';

export const TopBar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const {
    currentUser,
    logout,
    orgSettings,
    darkMode,
    toggleDarkMode,
    isOffline,
    unsyncedCount,
    syncAllRecords,
    pwaInstallPrompt,
    triggerPwaInstall,
    activeTab,
    setActiveTab
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-sky-700 dark:bg-sky-950 text-white shadow-md border-b border-sky-600/50">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Organization Title */}
        <div className="flex items-center gap-3">
          <SystemLogo logoUrl={orgSettings.logoUrl} size="md" alt={orgSettings.programName} />

          <div>
            <h1 className="text-sm sm:text-base font-bold leading-tight text-sky-50">
              {orgSettings.programName}
            </h1>
            <p className="text-[11px] text-sky-200 hidden sm:block">
              {orgSettings.faculty} {orgSettings.university}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Unsynced Records Button */}
          {unsyncedCount > 0 && !isOffline && (
            <button
              onClick={syncAllRecords}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-full text-xs transition-all shadow-sm animate-pulse"
              title="ซิงค์ข้อมูลกับ Google Sheet"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>ซิงค์ ({unsyncedCount})</span>
            </button>
          )}

          {/* PWA Install Button */}
          {pwaInstallPrompt && (
            <button
              onClick={triggerPwaInstall}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-300 hover:bg-amber-200 text-amber-950 font-bold rounded-full text-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ติดตั้งแอป</span>
            </button>
          )}

          {/* Quick Student Report Button (for logged-in users) */}
          {currentUser && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-sky-600/60 hover:bg-sky-600 text-sky-100 border border-sky-500/50'
              }`}
              title="ดูรายงานผลและความประพฤติตนเอง"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>รายงานผลนักเรียน</span>
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title={darkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-sky-100" />}
          </button>

          {/* User Profile / Role Pill */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-sky-600/60">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 p-1 hover:bg-white/10 rounded-full transition-colors text-left"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-300/60"
                />
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-300 mt-0.5">{currentUser.role}</div>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-1.5 hover:bg-rose-500/20 hover:text-rose-200 rounded-full transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4 text-sky-200" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-full text-xs font-bold transition-all shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
