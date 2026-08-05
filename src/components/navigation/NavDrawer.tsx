import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpenCheck,
  ShieldAlert,
  FileBarChart,
  GraduationCap,
  Settings,
  Sparkles,
  User,
  Camera,
  CalendarDays,
  BookOpen
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { id: 'schedule', label: 'ตารางเรียน', icon: CalendarDays },
  { id: 'khalifah_info', label: 'ข่าวสาร/ความรู้ทั่วไป', icon: BookOpen },
  { id: 'students', label: 'จัดการนักเรียน', icon: Users },
  { id: 'prayer', label: 'บันทึกละหมาด', icon: CalendarCheck },
  { id: 'student_checkin', label: 'เช็คละหมาดด้วยตนเอง', icon: Camera },
  { id: 'halaqah', label: 'บันทึกหะละเกาะฮ์', icon: BookOpenCheck },
  { id: 'discipline', label: 'บันทึกวินัย/พฤติกรรม', icon: ShieldAlert },
  { id: 'reports', label: 'รายงานและสถิติ', icon: FileBarChart },
  { id: 'profile', label: 'ดูผลการเรียน', icon: GraduationCap },
  { id: 'my_account', label: 'ฉัน (โปรไฟล์/รหัสผ่าน)', icon: User },
  { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings },
];

export const NavDrawer: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, unsyncedCount, isAdmin, isTeacher, isStudent } = useApp();

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (isStudent) {
      return item.id === 'schedule' || item.id === 'khalifah_info' || item.id === 'student_checkin' || item.id === 'profile' || item.id === 'my_account';
    }
    if (isTeacher) {
      return item.id !== 'settings' && item.id !== 'profile' && item.id !== 'student_checkin';
    }
    return item.id !== 'profile' && item.id !== 'student_checkin';
  });

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 min-h-[calc(100vh-65px)]">
      {/* Current Role Banner */}
      <div className="p-4 m-3 bg-sky-50 dark:bg-sky-950/60 rounded-2xl border border-sky-200/60 dark:border-sky-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-600 text-white rounded-xl shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-sky-800 dark:text-sky-300 block">สิทธิ์การใช้งาน</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {currentUser?.role ? currentUser.role : 'นักเรียน/ผู้ปกครอง'}
            </span>
          </div>
        </div>
        {isStudent && (
          <div className="mt-2.5">
            <p className="text-[10px] text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-2 rounded-xl leading-relaxed border border-sky-100 dark:border-sky-900">
              🔒 สำหรับนักเรียน: ดูผลการเรียน, ตารางเรียน, ข่าวสารกิจกรรม และจัดการรหัสผ่านส่วนตัว
            </p>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-sky-600 text-white dark:bg-sky-700 shadow-md transform translate-x-1'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.id === 'settings' && unsyncedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
          );
        })}
      </nav>

      {/* System Footer info */}
      <div className="p-4 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="font-semibold text-slate-600 dark:text-slate-400">ห้องเรียนคอลีฟะห์ v1.0 (PWA)</p>
        <p className="text-[10px] mt-1">คณะวิทยาศาสตร์ฯ มหาวิทยาลัยฟาฏอนี</p>
      </div>
    </aside>
  );
};
