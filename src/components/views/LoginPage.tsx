import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, User, Student } from '../../types';
import { SystemLogo } from '../common/SystemLogo';
import { postStudentRegistrationToGoogleScript } from '../../services/api';
import {
  KeyRound,
  ShieldCheck,
  UserCheck,
  LogIn,
  Users,
  ArrowRight,
  UserPlus,
  Save,
  CheckCircle2,
  Phone,
  BookOpen,
  Home,
  User as UserIcon,
  HelpCircle,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    login,
    orgSettings,
    setActiveTab,
    students,
    addStudent,
    setSelectedStudentId,
    showSnackbar,
    userAccounts,
    darkMode,
    toggleDarkMode
  } = useApp();

  // Primary Login Mode Tab: Default is 'student' (นักเรียน/ผู้ปกครอง)
  const [loginTab, setLoginTab] = useState<'student' | 'staff'>('student');

  // Student Password / Code & Parent phone inputs
  const [studentCode, setStudentCode] = useState('');
  const [parentPhoneInput, setParentPhoneInput] = useState('');
  const [showFirstTimeForm, setShowFirstTimeForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Student First-time Personal Registration Form state
  const [regForm, setRegForm] = useState({
    fullName: '',
    nickname: '',
    futureCareer: '',
    year: 'ม.5',
    dorm: 'หอพักอัลฟุรกอน (หอพักใน)',
    phone: '',
    parentName: '',
    parentPhone: '',
  });

  // Staff / Admin Direct Code Login state
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  // Handle Student Code / Password Submit (Checks if exists or first-time)
  const handleStudentPasswordCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = studentCode.trim();
    const cleanParentPhone = parentPhoneInput.trim().replace(/[^0-9]/g, '');

    if (!cleanCode && !cleanParentPhone) {
      showSnackbar('กรุณากรอกรหัสนักเรียน และ/หรือ เบอร์โทรผู้ปกครอง', 'warning');
      return;
    }

    // Check if code or parent phone matches any existing student
    const existingStudent = students.find((s) => {
      const codeMatch = cleanCode && s.id.toLowerCase() === cleanCode.toLowerCase();
      const parentPhoneMatch =
        cleanParentPhone &&
        s.parentPhone &&
        s.parentPhone.replace(/[^0-9]/g, '') === cleanParentPhone;
      return codeMatch || parentPhoneMatch;
    });

    if (existingStudent) {
      // RETURNING USER: Skip registration! Navigate directly to student view
      const userObj: User = {
        id: existingStudent.id,
        username: existingStudent.id,
        name: existingStudent.fullName,
        role: 'นักเรียน',
        avatar: existingStudent.photo || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
      };

      login(userObj);
      setSelectedStudentId(existingStudent.id);
      setActiveTab('profile');
    } else {
      // FIRST-TIME USER: Force filling personal & parent information first!
      if (parentPhoneInput) {
        setRegForm((prev) => ({ ...prev, parentPhone: parentPhoneInput }));
      }
      setShowFirstTimeForm(true);
      showSnackbar(`ยังไม่มีข้อมูลในระบบ กรุณากรอกข้อมูลส่วนตัวและผู้ปกครองเพื่อบันทึกลง Google Sheet`, 'info');
    }
  };

  // Submit First-Time Registration Form
  const handleFirstTimeRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regForm.fullName || !regForm.phone || !regForm.parentPhone) {
      showSnackbar('กรุณากรอกข้อมูลสำคัญ (ชื่อนักเรียน, เบอร์โทรนักเรียน และเบอร์โทรผู้ปกครอง) ให้ครบถ้วน', 'warning');
      return;
    }

    setIsRegistering(true);

    const cleanCode = studentCode.trim() || `STU${Date.now().toString().slice(-6)}`;

    const newStudent: Student = {
      id: cleanCode,
      fullName: regForm.fullName,
      nickname: regForm.nickname || regForm.fullName.split(' ')[0],
      futureCareer: regForm.futureCareer,
      faculty: orgSettings.faculty,
      programme: 'อิสลามศึกษาและวิทยาการเรียนรู้',
      year: regForm.year,
      phone: regForm.phone,
      parentName: regForm.parentName,
      parentPhone: regForm.parentPhone,
      dorm: regForm.dorm,
      advisor: 'อาจารย์ที่ปรึกษา คอลีฟะห์',
      status: 'ปกติ',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
      initialScore: 100, // Default 100 points
      isRegistered: true,
    };

    // 1. Add to local App Context & local Storage
    addStudent(newStudent);

    // 2. Post to Google Sheet via Google Apps Script API
    if (orgSettings.apiUrl) {
      await postStudentRegistrationToGoogleScript(orgSettings.apiUrl, newStudent);
    }

    // 3. Log user in and redirect
    const userObj: User = {
      id: newStudent.id,
      username: newStudent.id,
      name: newStudent.fullName,
      role: 'นักเรียน',
      avatar: newStudent.photo,
    };

    login(userObj);
    setSelectedStudentId(newStudent.id);
    setIsRegistering(false);
    setActiveTab('profile');

    showSnackbar(`🎉 บันทึกข้อมูลส่วนตัวนักเรียนและผู้ปกครองลงในระบบ Google Sheet เรียบร้อยแล้ว!`, 'success');
  };

  // Handle Staff Direct Code / Username Login
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = staffUsername.trim().toLowerCase();

    if (!cleanUser) {
      showSnackbar('กรุณากรอกชื่อผู้ใช้หรือรหัสประจำตัวครูผู้สอน', 'warning');
      return;
    }

    // Search userAccounts managed by Admin in Settings
    const matchedAccount = userAccounts.find(
      (a) => a.username.toLowerCase() === cleanUser || a.id.toLowerCase() === cleanUser
    );

    if (matchedAccount) {
      const userObj: User = {
        id: matchedAccount.id,
        username: matchedAccount.username,
        name: matchedAccount.name,
        role: matchedAccount.role, // Role automatically loaded from Settings!
        avatar: matchedAccount.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      };

      login(userObj);
      setActiveTab('dashboard');
    } else {
      showSnackbar('ไม่พบชื่อผู้ใช้งานในระบบ (รหัสทดสอบ: admin, somchai, suhaimee, dorm_staff)', 'warning');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in space-y-5 px-3 sm:px-0 py-2 sm:py-4">
      {/* Top Header Controls: Dark/Light Mode Theme Toggle Switch */}
      <div className="flex justify-end items-center">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
          title={darkMode ? 'สลับเป็นโหมดสว่าง (Light Mode)' : 'สลับเป็นโหมดมืด (Dark Mode)'}
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>โหมดสว่าง (Light)</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-sky-600" />
              <span>โหมดมืด (Dark)</span>
            </>
          )}
        </button>
      </div>

      {/* Brand & Glowing Sky Blue Logo Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center items-center py-1">
          <SystemLogo
            logoUrl={orgSettings.logoUrl}
            size="hero"
            glow={true}
            alt={orgSettings.programName}
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {orgSettings.programName}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-400">
            {orgSettings.faculty} • {orgSettings.university}
          </p>
        </div>
      </div>

      {/* Main Container Card - Sleek White Card for Mobile & Tablet */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Top Tab Switcher: Default Student/Parent active */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setLoginTab('student');
              setShowFirstTimeForm(false);
            }}
            className={`py-2.5 px-2 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              loginTab === 'student'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <div className="flex flex-col text-center leading-tight">
              <span className="font-extrabold text-xs sm:text-sm">นักเรียน</span>
              <span className="text-[10px] sm:text-xs opacity-90 font-semibold">หรือผู้ปกครอง</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLoginTab('staff')}
            className={`py-2.5 px-2 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              loginTab === 'staff'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <div className="flex flex-col text-center leading-tight">
              <span className="font-extrabold text-xs sm:text-sm">ครูผู้สอน</span>
              <span className="text-[10px] sm:text-xs opacity-90 font-semibold">หรือผู้ดูแลระบบ</span>
            </div>
          </button>
        </div>

        {/* TAB 1: STUDENT / PARENT LANDING FLOW */}
        {loginTab === 'student' && (
          <div>
            {!showFirstTimeForm ? (
              /* Step 1: Student ID & Parent Phone Credentials Form */
              <form onSubmit={handleStudentPasswordCheck} className="space-y-4">
                {/* Field 1: Student Code / ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ช่องที่ 1: รหัสนักเรียน *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 text-sky-600 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      placeholder="กรอกรหัสนักเรียน (เช่น M50121001)"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 rounded-2xl text-sm sm:text-base font-bold font-mono outline-none text-slate-900 dark:text-slate-100 transition-all"
                    />
                  </div>
                </div>

                {/* Field 2: Parent Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ช่องที่ 2: เบอร์โทรผู้ปกครองของตัวเอง *
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-sky-600 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={parentPhoneInput}
                      onChange={(e) => setParentPhoneInput(e.target.value)}
                      placeholder="กรอกเบอร์โทรผู้ปกครอง (เช่น 089-999-5001)"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 rounded-2xl text-sm sm:text-base font-bold font-mono outline-none text-slate-900 dark:text-slate-100 transition-all"
                    />
                  </div>
                </div>

                {/* Demo Code Quick Fill Helpers */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                    ตัวอย่างรหัสสำหรับทดลองเข้าสู่ระบบ:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentCode('M50121001');
                        setParentPhoneInput('089-999-5001');
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400 transition-colors"
                    >
                      M50121001 / 0899995001
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentCode('M50121002');
                        setParentPhoneInput('081-888-1122');
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400 transition-colors"
                    >
                      M50121002 / 0818881122
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>เข้าสู่ระบบ</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="relative my-2 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                    </div>
                    <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-400">
                      หรือ
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!studentCode) {
                        setStudentCode(`STU${Math.floor(10000 + Math.random() * 90000)}`);
                      }
                      setShowFirstTimeForm(true);
                    }}
                    className="w-full py-3 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>ลงทะเบียนครั้งแรก</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: First-time Personal Info & Parent Registration Form */
              <form onSubmit={handleFirstTimeRegisterSubmit} className="space-y-5 animate-slide-up">
                <div className="p-3 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-2xl text-sky-900 dark:text-sky-200 text-xs flex items-start gap-2">
                  <UserPlus className="w-5 h-5 shrink-0 text-sky-600 mt-0.5" />
                  <div>
                    <span className="font-bold block">กรอกข้อมูลลงทะเบียนครั้งแรก</span>
                    <span>กรอกข้อมูลส่วนตัวและเบอร์โทรผู้ปกครองเพื่อบันทึกประวัติเข้าสู่ระบบ Google Sheet</span>
                  </div>
                </div>

                {/* Section A: Student Personal Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-sky-800 dark:text-sky-300 flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
                    <UserIcon className="w-4 h-4" />
                    <span>ส่วนที่ 1: ข้อมูลส่วนตัวนักเรียน</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        รหัสนักเรียน
                      </label>
                      <input
                        type="text"
                        disabled
                        value={studentCode}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-600 dark:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        ชื่อ-นามสกุล นักเรียน *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ด.ช. / นาย..."
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        ชื่อเล่น (Nickname)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น เลาะ"
                        value={regForm.nickname}
                        onChange={(e) => setRegForm({ ...regForm, nickname: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-between text-xs">
                        <span>🎯 อาชีพในอนาคต (Future Career)</span>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">แสดงเด่นในโปรไฟล์</span>
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น วิศวกร AI, แพทย์เฉพาะทาง, สถาปนิก, นักธุรกิจ ฯลฯ"
                        value={regForm.futureCareer}
                        onChange={(e) => setRegForm({ ...regForm, futureCareer: e.target.value })}
                        className="w-full px-3 py-2 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl outline-none font-bold text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        ระดับชั้นเรียน *
                      </label>
                      <select
                        value={regForm.year}
                        onChange={(e) => setRegForm({ ...regForm, year: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                      >
                        <option value="ม.4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                        <option value="ม.5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                        <option value="ม.6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        หอพัก / ที่อยู่อาศัย *
                      </label>
                      <select
                        value={regForm.dorm}
                        onChange={(e) => setRegForm({ ...regForm, dorm: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium"
                      >
                        <option value="หอพักอัลฟุรกอน (หอพักใน)">หอพักอัลฟุรกอน (หอพักใน)</option>
                        <option value="หอพักอัลอามีน (หอพักใน)">หอพักอัลอามีน (หอพักใน)</option>
                        <option value="หอพักภายนอก (ไป-กลับ)">หอพักภายนอก (ไป-กลับ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        เบอร์โทรศัพท์นักเรียน *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="08X-XXX-XXXX"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Parent Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
                    <Phone className="w-4 h-4" />
                    <span>ส่วนที่ 2: ข้อมูลผู้ปกครอง</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        ชื่อ-นามสกุล ผู้ปกครอง *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="นาย / นาง..."
                        value={regForm.parentName}
                        onChange={(e) => setRegForm({ ...regForm, parentName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        เบอร์โทรศัพท์ผู้ปกครอง *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="08X-XXX-XXXX"
                        value={regForm.parentPhone}
                        onChange={(e) => setRegForm({ ...regForm, parentPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFirstTimeForm(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ย้อนกลับ</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-2xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isRegistering ? 'กำลังบันทึกลง Google Sheet...' : 'บันทึกข้อมูลและเข้าสู่ระบบ'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: STAFF / ADMIN DIRECT CODE LOGIN */}
        {loginTab === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-4 animate-fade-in">
            {/* Input 1: Staff Username / ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                ชื่อผู้ใช้งาน / รหัสประจำตัวครู *
              </label>
              <div className="relative">
                <UserCheck className="w-5 h-5 text-sky-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งาน (เช่น admin, somchai)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 rounded-2xl text-sm font-mono font-bold outline-none text-slate-900 dark:text-slate-100 transition-all"
                />
              </div>
            </div>

            {/* Input 2: Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                รหัสผ่าน *
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-sky-600 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 rounded-2xl text-sm font-mono font-bold outline-none text-slate-900 dark:text-slate-100 transition-all"
                />
              </div>
            </div>

            {/* Quick Test Staff Accounts */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                คลิกเพื่อเลือกบัญชีทดสอบระบบ:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {userAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setStaffUsername(acc.username);
                      setStaffPassword('123456');
                    }}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950 border border-slate-300 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-sky-700 dark:text-sky-300 transition-colors"
                  >
                    {acc.username} ({acc.role})
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
