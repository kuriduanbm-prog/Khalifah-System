import React from 'react';
import { useApp } from '../../context/AppContext';
import { Camera } from 'lucide-react';

export const FloatingPrayerCheckinButton: React.FC = () => {
  const { activeTab, setActiveTab, isStudent, currentUser } = useApp();

  // Show floating button for students on all views except login
  // (or when user is logged in as a student)
  if (activeTab === 'login') {
    return null;
  }

  // Only show if user is a student or not an admin/teacher
  if (!isStudent && currentUser?.role && currentUser.role !== 'นักเรียน') {
    return null;
  }

  const isActive = activeTab === 'student_checkin';

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 z-50 animate-bounce-subtle">
      <button
        onClick={() => setActiveTab('student_checkin')}
        title="เช็คละหมาดด้วยตนเอง"
        className={`group relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
          isActive
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 ring-4 ring-emerald-300 dark:ring-emerald-800 scale-105 shadow-emerald-600/50'
            : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:from-emerald-600 hover:to-teal-800 ring-4 ring-emerald-400/40 hover:scale-110 active:scale-95 shadow-emerald-500/40'
        }`}
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-white"></span>
        </span>
        <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md" />
        <span className="text-[8px] sm:text-[9px] font-black text-white leading-none mt-0.5 tracking-tighter drop-shadow-xs">
          เช็คละหมาด
        </span>
      </button>
    </div>
  );
};
