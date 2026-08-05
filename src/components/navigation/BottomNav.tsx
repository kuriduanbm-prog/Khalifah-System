import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShieldAlert,
  CalendarCheck,
  BookOpenCheck,
  FileBarChart,
  GraduationCap,
  User,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Sparkles,
  ChevronRight,
  Camera,
  MessageSquare,
  CalendarDays,
  BookOpen
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isStudent,
    isAdmin,
    currentUser,
    logout,
  } = useApp();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const studentNavs = [
    { id: 'schedule', label: 'ตารางเรียน', icon: CalendarDays },
    { id: 'khalifah_info', label: 'ข่าวสาร/ความรู้ทั่วไป', icon: BookOpen },
    { id: 'student_checkin', label: 'เช็คละหมาด', icon: Camera, isProminent: true },
    { id: 'profile', label: 'ผลการเรียน', icon: GraduationCap },
    { id: 'my_account', label: 'ฉัน', icon: User },
  ];

  const staffNavs = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'schedule', label: 'ตารางเรียน', icon: CalendarDays },
    { id: 'discipline', label: 'วินัย', icon: ShieldAlert },
    { id: 'prayer', label: 'ละหมาด', icon: CalendarCheck },
    { id: 'halaqah', label: 'หะละเกาะฮ์', icon: BookOpenCheck },
    { id: 'more', label: 'เพิ่มเติม', icon: Menu },
  ];

  const mobileNavs = isStudent ? studentNavs : staffNavs;

  const handleNavClick = (id: string) => {
    if (id === 'more') {
      setIsMoreMenuOpen(true);
    } else {
      setIsMoreMenuOpen(false);
      setActiveTab(id);
    }
  };

  const isMoreTabActive = ['students', 'settings', 'my_account', 'reports'].includes(activeTab);

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1 flex items-center justify-around">
        {mobileNavs.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === 'more'
              ? isMoreMenuOpen || isMoreTabActive
              : activeTab === item.id;

          if ((item as any).isProminent) {
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="-mt-5 flex flex-col items-center justify-center group"
              >
                <div
                  className={`p-3 rounded-full shadow-xl transition-all transform group-active:scale-90 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white ring-4 ring-emerald-300 dark:ring-emerald-900 shadow-emerald-500/40 scale-110'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30'
                  }`}
                >
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span
                  className={`text-[10px] mt-1 font-bold ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-sky-100 dark:bg-sky-950 scale-110 ring-2 ring-sky-400/30' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Slide-Up Overlay Drawer for "เพิ่มเติม" (More Menu) */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreMenuOpen(false)}
          />

          {/* Bottom Sheet Menu */}
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-5 max-h-[85vh] overflow-y-auto space-y-4">
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    เมนูระบบเพิ่มเติม
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ผู้ใช้: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.name}</span> ({currentUser?.role || 'เจ้าหน้าที่'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Menu Cards */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 px-1 uppercase tracking-wider">
                การจัดการหลัก
              </span>

              {/* 1. ความรู้ทั่วไปโปรแกรมคอลีฟะฮ์ */}
              <button
                onClick={() => {
                  setActiveTab('khalifah_info');
                  setIsMoreMenuOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                  activeTab === 'khalifah_info'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">ความรู้ทั่วไป/ข่าวสารต่างๆ</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      ประกาศระบบ คู่มือการใช้งาน และความรู้ศาสนธรรม
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>

              {/* 2. จัดการนักเรียน */}
              <button
                onClick={() => {
                  setActiveTab('students');
                  setIsMoreMenuOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                  activeTab === 'students'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-600 text-white rounded-xl shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">จัดการนักเรียน</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      เพิ่ม ลบ แก้ไข รายชื่อและกลุ่มเรียนนักเรียน
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>

              {/* 2. ตั้งค่าระบบ (เฉพาะผู้ดูแลระบบ) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsMoreMenuOpen(false);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                    activeTab === 'settings'
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100 ring-2 ring-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">ตั้งค่าระบบ</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        ตั้งค่าหน่วยงาน REST API กฎคะแนน และผู้ใช้งาน
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </button>
              )}

              {/* 3. ฉัน (โปรไฟล์และรหัสผ่าน) */}
              <button
                onClick={() => {
                  setActiveTab('my_account');
                  setIsMoreMenuOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                  activeTab === 'my_account'
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-100 ring-2 ring-purple-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">ฉัน (โปรไฟล์/รหัสผ่าน)</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      แก้ไขข้อมูลส่วนตัวและเปลี่ยนรหัสผ่าน
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>

              {/* 4. ดูผลการเรียนนักเรียน */}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsMoreMenuOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                  activeTab === 'profile'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">ดูผลการเรียนรายบุคคล</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      ตรวจสอบรายงานความประพฤติรายนักเรียน
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>

              {/* 5. รายงานและสถิติ */}
              <button
                onClick={() => {
                  setActiveTab('reports');
                  setIsMoreMenuOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                  activeTab === 'reports'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
                    <FileBarChart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">รายงานและสถิติ</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      ดูภาพรวมสถิติการละหมาด หะละเกาะฮ์ และวินัย
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>
            </div>

            {/* Footer Action: Logout */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  logout();
                }}
                className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

