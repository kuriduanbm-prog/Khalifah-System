import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Phone,
  Home,
  GraduationCap,
  KeyRound,
  Save,
  CheckCircle2,
  Lock,
  LogOut,
  ShieldCheck,
  UserCheck,
  Camera,
  Moon,
  Sun,
  Smartphone
} from 'lucide-react';

export const MyAccountView: React.FC = () => {
  const {
    currentUser,
    login,
    logout,
    students,
    updateStudent,
    userAccounts,
    updateUserAccount,
    showSnackbar,
    darkMode,
    toggleDarkMode,
    orgSettings
  } = useApp();

  // Find matching student object if user is a student
  const matchedStudent = students.find(
    (s) => s.id.toLowerCase() === currentUser?.username.toLowerCase() || s.id.toLowerCase() === currentUser?.id.toLowerCase()
  );

  // Find matching userAccount object
  const matchedUserAccount = userAccounts.find(
    (a) => a.id === currentUser?.id || a.username.toLowerCase() === currentUser?.username.toLowerCase()
  );

  // Profile Form state initialized from matchedStudent or currentUser
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.name || matchedStudent?.fullName || '',
    nickname: matchedStudent?.nickname || '',
    year: matchedStudent?.year || 'ม.5',
    dorm: matchedStudent?.dorm || 'หอพักอัลฟุรกอน (หอพักใน)',
    phone: matchedStudent?.phone || '',
    parentName: matchedStudent?.parentName || '',
    parentPhone: matchedStudent?.parentPhone || '',
    avatar: currentUser?.avatar || matchedStudent?.photo || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
  });

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle Edit Profile Form Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.fullName.trim()) {
      showSnackbar('กรุณากรอกชื่อ-นามสกุล', 'warning');
      return;
    }

    // 1. Update current logged in user context
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: profileForm.fullName,
        avatar: profileForm.avatar,
      };
      login(updatedUser);
    }

    // 2. If student record exists, update it
    if (matchedStudent) {
      updateStudent({
        ...matchedStudent,
        fullName: profileForm.fullName,
        nickname: profileForm.nickname || profileForm.fullName.split(' ')[0],
        year: profileForm.year,
        dorm: profileForm.dorm,
        phone: profileForm.phone,
        parentName: profileForm.parentName,
        parentPhone: profileForm.parentPhone,
        photo: profileForm.avatar,
      });
    }

    // 3. If userAccount exists, update it
    if (matchedUserAccount) {
      updateUserAccount({
        ...matchedUserAccount,
        name: profileForm.fullName,
        avatar: profileForm.avatar,
      });
    }

    showSnackbar('บันทึกอัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');
  };

  // Handle Password Change Submit
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      showSnackbar('กรุณากรอกรหัสผ่านใหม่', 'warning');
      return;
    }

    if (newPassword.length < 4) {
      showSnackbar('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showSnackbar('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน', 'warning');
      return;
    }

    setIsChangingPassword(true);

    setTimeout(() => {
      // Update in userAccounts
      if (matchedUserAccount) {
        updateUserAccount({
          ...matchedUserAccount,
          // Store password or simulated auth update
        });
      }

      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSnackbar('เปลี่ยนรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว!', 'success');
    }, 400);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-3xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          <div className="relative group">
            <img
              src={profileForm.avatar}
              alt={currentUser?.name || 'โปรไฟล์'}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white/30 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1.5 rounded-xl shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-0.5 bg-amber-400 text-amber-950 font-black text-xs rounded-full shadow-sm">
                {currentUser?.role || 'นักเรียน'}
              </span>
              <span className="px-3 py-0.5 bg-white/20 text-white font-mono text-xs font-bold rounded-full border border-white/20">
                รหัส: {currentUser?.username || matchedStudent?.id || 'N/A'}
              </span>
            </div>

            <h1 className="text-2xl font-black truncate">{currentUser?.name || 'ผู้ใช้งาน'}</h1>

            <p className="text-xs text-sky-200">
              {matchedStudent?.faculty || orgSettings.faculty} • {matchedStudent?.dorm || 'หอพักนักเรียน'}
            </p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-500/80 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Main Form Tabs Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Side Info & Quick Settings */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>ข้อมูลการบัญชี</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">ชื่อบัญชีผู้ใช้ (Username)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentUser?.username || '-'}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">สิทธิ์การเข้าถึง (Role)</span>
                <span className="font-bold text-sky-700 dark:text-sky-400">{currentUser?.role || 'นักเรียน'}</span>
              </div>

              {matchedStudent && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/60">
                  <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] font-bold">สถานะนักเรียนในระบบ</span>
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300">{matchedStudent.status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Theme Controls Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span>การแสดงผลแอปพลิเคชัน</span>
            </h3>

            <button
              onClick={toggleDarkMode}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors text-xs font-bold"
            >
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
                <span>{darkMode ? 'โหมดมืด (Dark Mode)' : 'โหมดสว่าง (Light Mode)'}</span>
              </div>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 underline">สลับธีม</span>
            </button>
          </div>
        </div>

        {/* Right Column: Edit Profile & Change Password Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Edit Personal Information */}
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-600" />
                <span>แก้ไขข้อมูลส่วนตัว</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">ส่วนที่ 1</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  placeholder="กรอกชื่อ-นามสกุล"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อเล่น (Nickname)
                </label>
                <input
                  type="text"
                  value={profileForm.nickname}
                  onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                  placeholder="กรอกชื่อเล่น"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ระดับชั้นเรียน
                </label>
                <select
                  value={profileForm.year}
                  onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                >
                  <option value="ม.1">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                  <option value="ม.2">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                  <option value="ม.3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                  <option value="ม.4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                  <option value="ม.5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                  <option value="ม.6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  เบอร์โทรศัพท์ส่วนตัว
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono font-semibold outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  หอพัก / ที่อยู่อาศัย
                </label>
                <select
                  value={profileForm.dorm}
                  onChange={(e) => setProfileForm({ ...profileForm, dorm: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                >
                  <option value="หอพักอัลฟุรกอน (หอพักใน)">หอพักอัลฟุรกอน (หอพักใน)</option>
                  <option value="หอพักอัลอามีน (หอพักใน)">หอพักอัลอามีน (หอพักใน)</option>
                  <option value="หอพักภายนอก (ไป-กลับ)">หอพักภายนอก (ไป-กลับ)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อ-นามสกุล ผู้ปกครอง
                </label>
                <input
                  type="text"
                  value={profileForm.parentName}
                  onChange={(e) => setProfileForm({ ...profileForm, parentName: e.target.value })}
                  placeholder="ชื่อผู้ปกครอง"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  เบอร์โทรศัพท์ผู้ปกครอง
                </label>
                <input
                  type="tel"
                  value={profileForm.parentPhone}
                  onChange={(e) => setProfileForm({ ...profileForm, parentPhone: e.target.value })}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono font-semibold outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ลิงก์รูปโปรไฟล์ (URL รูปภาพ)
                </label>
                <input
                  type="url"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-2xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกข้อมูลส่วนตัว</span>
              </button>
            </div>
          </form>

          {/* Card 2: Change Password Form */}
          <form onSubmit={handleChangePassword} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>แก้ไขรหัสผ่าน</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">ส่วนที่ 2</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  รหัสผ่านปัจจุบัน
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านเดิม"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    รหัสผ่านใหม่ *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ยืนยันรหัสผ่านใหม่ *
                  </label>
                  <div className="relative">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold rounded-2xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isChangingPassword ? 'กำลังอัปเดตรหัสผ่าน...' : 'อัปเดตรหัสผ่านใหม่'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
