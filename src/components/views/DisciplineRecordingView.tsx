import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DisciplineRecord, BonusRecord, DailyRecord, Student } from '../../types';
import {
  ShieldAlert,
  Calendar,
  User,
  Save,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookX,
  XCircle,
  Filter,
  Check,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  calculateRecordScoreChange,
  calculateStudentTotalScore,
  getScoreBadgeInfo
} from '../../utils/scoreCalculator';

export const DisciplineRecordingView: React.FC = () => {
  const { students, records, scoreRules, addOrUpdateRecord, currentUser, showSnackbar } = useApp();

  // Roles check
  const isAdmin = currentUser?.role === 'Admin';
  const canRecordAttendance = currentUser?.role === 'Admin' || currentUser?.role === 'อาจารย์' || currentUser?.role === 'ครูหอพัก';

  // Date selection: Default to today
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Grade Filter selection: 'all', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // Helper function to check if student belongs to selected grade
  const isStudentInGrade = (s: Student, grade: string) => {
    if (grade === 'all') return true;
    const targetNum = grade.replace('ม.', '').trim();
    const yrStr = String(s.year || '');
    const progStr = String(s.programme || '');
    const facStr = String(s.faculty || '');

    return (
      yrStr.includes(grade) ||
      yrStr === targetNum ||
      progStr.includes(grade) ||
      progStr.includes(`ปีที่ ${targetNum}`) ||
      facStr.includes(grade) ||
      s.id.startsWith(`M${targetNum}`) ||
      s.id.startsWith(`M0${targetNum}`)
    );
  };

  // Filter students based on selected grade
  const filteredStudents = useMemo(() => {
    return students.filter((s) => isStudentInGrade(s, selectedGrade));
  }, [students, selectedGrade]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const currentStudentIndex = useMemo(() => {
    return filteredStudents.findIndex((s) => s.id === selectedStudentId);
  }, [filteredStudents, selectedStudentId]);

  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      setSelectedStudentId(filteredStudents[currentStudentIndex - 1].id);
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex >= 0 && currentStudentIndex < filteredStudents.length - 1) {
      setSelectedStudentId(filteredStudents[currentStudentIndex + 1].id);
    }
  };

  // Auto-set or switch student ID when filtered list or student list updates
  useEffect(() => {
    if (filteredStudents.length > 0) {
      const exists = filteredStudents.some((s) => s.id === selectedStudentId);
      if (!exists) {
        setSelectedStudentId(filteredStudents[0].id);
      }
    } else {
      setSelectedStudentId('');
    }
  }, [filteredStudents, selectedStudentId]);

  // Attendance Status state (ข้อ 1 - 4)
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Late' | 'Leave' | 'Absent'>('Present');
  const [leaveNote, setLeaveNote] = useState<string>('');

  // Discipline state (ข้อบังคับเพิ่มเติม)
  const [disciplineState, setDisciplineState] = useState<DisciplineRecord>({
    lateActivity: false,
    dress: false,
    phone: false,
    cleaning: false,
    behavior: false,
  });

  // Bonus state (ข้อ 5: เฉพาะแอดมินหลัก)
  const [bonusState, setBonusState] = useState<BonusRecord>({
    prayerComplete: false,
    completeHalaqah: false,
    volunteer: false,
    quranMemorisation: false,
  });

  // Additional note (ข้อ 6: เฉพาะแอดมินหลัก)
  const [note, setNote] = useState('');

  // Sync state with existing record for (selectedDate, selectedStudentId)
  useEffect(() => {
    if (!selectedStudentId) return;

    const existing = records.find((r) => r.date === selectedDate && r.studentId === selectedStudentId);
    if (existing) {
      setAttendanceStatus(existing.discipline?.attendanceStatus || 'Present');
      setLeaveNote(existing.discipline?.leaveNote || '');
      setDisciplineState(existing.discipline || {
        lateActivity: false,
        dress: false,
        phone: false,
        cleaning: false,
        behavior: false,
      });
      setBonusState(existing.bonus || {
        prayerComplete: false,
        completeHalaqah: false,
        volunteer: false,
        quranMemorisation: false,
      });
      setNote(existing.note || '');
    } else {
      setAttendanceStatus('Present');
      setLeaveNote('');
      setDisciplineState({
        lateActivity: false,
        dress: false,
        phone: false,
        cleaning: false,
        behavior: false,
      });
      setBonusState({
        prayerComplete: false,
        completeHalaqah: false,
        volunteer: false,
        quranMemorisation: false,
      });
      setNote('');
    }
  }, [selectedDate, selectedStudentId, records]);

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  // Compute live current total score & projected badge
  const currentTotalScore = currentStudent
    ? calculateStudentTotalScore(currentStudent.id, currentStudent.initialScore ?? 100, records, scoreRules)
    : 100;

  const currentBadge = getScoreBadgeInfo(currentTotalScore);

  // Preview record for calculation
  const dummyRecord: DailyRecord = {
    id: 'temp',
    date: selectedDate,
    studentId: selectedStudentId,
    studentName: currentStudent?.fullName || '',
    prayer: { subuh: 'Present', zuhr: 'Present', asr: 'Present', maghrib: 'Present', isha: 'Present' },
    halaqah: { subuh: 'Present', asr: 'Present', isha: 'Present' },
    discipline: {
      ...disciplineState,
      attendanceStatus,
      leaveNote,
      lateActivity: attendanceStatus === 'Late' || disciplineState.lateActivity,
    },
    bonus: isAdmin ? bonusState : {},
    note: isAdmin ? note : (attendanceStatus === 'Leave' ? leaveNote : ''),
    recorder: currentUser?.name || 'ระบบ',
    timestamp: new Date().toISOString(),
  };

  const netDelta = calculateRecordScoreChange(dummyRecord, scoreRules);

  const handleDisciplineToggle = (key: keyof DisciplineRecord) => {
    setDisciplineState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleBonusToggle = (key: keyof BonusRecord) => {
    if (!isAdmin) return;
    setBonusState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) {
      showSnackbar('กรุณาเลือกรหัสนักเรียน', 'warning');
      return;
    }

    if (!canRecordAttendance) {
      showSnackbar('นักเรียนไม่มีสิทธิ์บันทึกระเบียบวินัย', 'warning');
      return;
    }

    const existing = records.find((r) => r.date === selectedDate && r.studentId === selectedStudentId);

    const recordDiscipline: DisciplineRecord = {
      ...disciplineState,
      attendanceStatus,
      leaveNote: attendanceStatus === 'Leave' ? leaveNote : '',
      lateActivity: attendanceStatus === 'Late' || disciplineState.lateActivity,
    };

    const finalNote = isAdmin
      ? note
      : attendanceStatus === 'Leave'
      ? leaveNote
      : existing?.note || '';

    const recordToSave: DailyRecord = {
      id: existing ? existing.id : `rec-${selectedDate}-${selectedStudentId}`,
      date: selectedDate,
      studentId: selectedStudentId,
      studentName: currentStudent.fullName,
      prayer: existing?.prayer || { subuh: 'Present', zuhr: 'Present', asr: 'Present', maghrib: 'Present', isha: 'Present' },
      halaqah: existing?.halaqah || { subuh: 'Present', asr: 'Present', isha: 'Present' },
      discipline: recordDiscipline,
      bonus: isAdmin ? bonusState : existing?.bonus || {},
      note: finalNote,
      recorder: currentUser?.name || 'ครูผู้บันทึก',
      timestamp: new Date().toISOString(),
    };

    recordToSave.calculatedScoreChange = calculateRecordScoreChange(recordToSave, scoreRules);

    await addOrUpdateRecord(recordToSave);
    showSnackbar(`บันทึกข้อมูลสำเร็จสำหรับ ${currentStudent.fullName}`, 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            <span>บันทึกระเบียบวินัยและคะแนนความประพฤติ</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ระบบบันทึกสถานะการเรียน วินัย และคะแนนความประพฤตินักเรียน (เชื่อมโยงแดชบอร์ดอัตโนมัติ)
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Controls: Grade Filter, Date & Student Dropdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          {/* Grade Level Selection (ม.1 - ม.6) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-amber-600" />
                <span>เลือกระดับชั้นปี (ม.1 - ม.6):</span>
              </label>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                {selectedGrade === 'all' ? 'ทุกชั้นปี' : `ชั้น ${selectedGrade}`} ({filteredStudents.length} คน)
              </span>
            </div>

            {/* Grade Pills */}
            <div className="grid grid-cols-4 sm:flex sm:items-center gap-1.5">
              {[
                { id: 'all', label: 'ทุกชั้นปี' },
                { id: 'ม.1', label: 'ม.1' },
                { id: 'ม.2', label: 'ม.2' },
                { id: 'ม.3', label: 'ม.3' },
                { id: 'ม.4', label: 'ม.4' },
                { id: 'ม.5', label: 'ม.5' },
                { id: 'ม.6', label: 'ม.6' },
              ].map((g) => {
                const isActive = selectedGrade === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGrade(g.id)}
                    className={`min-h-[40px] px-3 py-2 text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 ring-2 ring-amber-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                    <span>{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Date Selection: Defaults to today */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>วันที่ทำรายการ</span>
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-600 text-slate-900 dark:text-slate-100 cursor-pointer"
              />
            </div>

            {/* Filtered Student Selection Dropdown with Prev/Next Navigation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>เลือกรหัสนักเรียน (กรองตามชั้นเรียน)</span>
                </label>
                {filteredStudents.length > 0 && currentStudentIndex >= 0 && (
                  <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {currentStudentIndex + 1} / {filteredStudents.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevStudent}
                  disabled={currentStudentIndex <= 0}
                  className="px-2.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 cursor-pointer"
                  title="นักเรียนคนก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">ถอยหลัง</span>
                </button>

                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={filteredStudents.length === 0}
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600 text-slate-900 dark:text-slate-100 disabled:opacity-50 cursor-pointer truncate"
                >
                  {filteredStudents.length === 0 ? (
                    <option value="">-- ไม่พบรายชื่อนักเรียนในชั้นปีนี้ --</option>
                  ) : (
                    filteredStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.nickname}) - รหัส {s.id} • {s.year || s.programme}
                      </option>
                    ))
                  )}
                </select>

                <button
                  type="button"
                  onClick={handleNextStudent}
                  disabled={currentStudentIndex < 0 || currentStudentIndex >= filteredStudents.length - 1}
                  className="px-2.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 cursor-pointer"
                  title="นักเรียนคนถัดไป"
                >
                  <span className="hidden sm:inline">ถัดไป</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Student Profile & Score Card */}
        {currentStudent && (
          <div className="bg-slate-900 text-white rounded-2xl py-2.5 px-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentStudent.photo}
                alt={currentStudent.fullName}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-amber-300 font-mono font-bold leading-none mb-0.5">รหัส: {currentStudent.id}</div>
                <h3 className="text-sm sm:text-base font-black text-white truncate leading-tight">
                  {currentStudent.fullName}
                </h3>
              </div>
            </div>

            <div className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between gap-2.5 ${currentBadge.colorClass} shadow-2xs shrink-0`}>
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-md bg-white/80 dark:bg-slate-900/80 shrink-0">
                  <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-[9px] font-bold opacity-80 leading-none">
                    คะแนนความประพฤติปัจจุบัน
                  </div>
                  <div className="text-xs font-black tracking-tight mt-0.5">
                    {currentTotalScore} <span className="text-[9px] font-bold">คะแนน</span>
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-black/5 dark:border-white/10">
                {currentBadge.labelThai}
              </span>
            </div>
          </div>
        )}

        {/* ITEMS 1 - 4: Attendance & Class Behavior Options (สำหรับ ครูผู้สอน & แอดมินหลัก) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>สถานะการมาเรียน/วินัยประจำวัน (ข้อ 1 - 4)</span>
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
              สำหรับครูผู้สอน & แอดมินหลัก
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* 1. การมาเรียนตรงเวลา */}
            <div
              onClick={() => setAttendanceStatus('Present')}
              className={`p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-2 ${
                attendanceStatus === 'Present'
                  ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 shadow-2xs ring-2 ring-emerald-500'
                  : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl shrink-0 ${attendanceStatus === 'Present' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-black leading-tight whitespace-normal">มาเรียนตรงเวลา</span>
                {attendanceStatus === 'Present' && <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">เลือกอยู่</span>}
              </div>
            </div>

            {/* 2. การมาเรียนสาย */}
            <div
              onClick={() => setAttendanceStatus('Late')}
              className={`p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-2 ${
                attendanceStatus === 'Late'
                  ? 'bg-amber-50 border-amber-400 dark:bg-amber-950/60 dark:border-amber-700 text-amber-950 dark:text-amber-100 shadow-2xs ring-2 ring-amber-500'
                  : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl shrink-0 ${attendanceStatus === 'Late' ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-black leading-tight whitespace-normal">มาเรียนสาย</span>
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 shrink-0">
                  {scoreRules.lateActivity} คะแนน
                </span>
              </div>
            </div>

            {/* 3. การลาเรียน (มีให้ระบุหมายเหตุ) */}
            <div
              onClick={() => setAttendanceStatus('Leave')}
              className={`p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-center gap-2 ${
                attendanceStatus === 'Leave'
                  ? 'bg-purple-50 border-purple-400 dark:bg-purple-950/60 dark:border-purple-700 text-purple-950 dark:text-purple-100 shadow-2xs ring-2 ring-purple-500'
                  : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 w-full">
                <div className={`p-1.5 rounded-xl shrink-0 ${attendanceStatus === 'Leave' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  <BookX className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-1">
                  <span className="text-[11px] sm:text-xs font-black leading-tight whitespace-normal">ลาเรียน</span>
                  {attendanceStatus === 'Leave' && <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 shrink-0">เลือกอยู่</span>}
                </div>
              </div>

              {attendanceStatus === 'Leave' && (
                <div className="w-full pt-0.5 space-y-1.5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                  {/* Preset Quick Chips */}
                  <div className="flex flex-wrap gap-1">
                    {['ลากิจ', 'ลาป่วย', 'ธุระทางบ้าน', 'กิจกรรมมหาวิทยาลัย'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLeaveNote(preset)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          leaveNote === preset
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="ระบุเหตุผลการลา..."
                    value={leaveNote}
                    onChange={(e) => setLeaveNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}
            </div>

            {/* 4. การขาดเรียน */}
            <div
              onClick={() => setAttendanceStatus('Absent')}
              className={`p-2.5 sm:p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-2 ${
                attendanceStatus === 'Absent'
                  ? 'bg-rose-50 border-rose-400 dark:bg-rose-950/60 dark:border-rose-700 text-rose-950 dark:text-rose-100 shadow-2xs ring-2 ring-rose-500'
                  : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl shrink-0 ${attendanceStatus === 'Absent' ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                <XCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-black leading-tight whitespace-normal">ขาดเรียน</span>
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 shrink-0">
                  -2 คะแนน
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Specific Violations (Optional Checklist) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <AlertTriangle className="w-4 h-4" />
            <span>การกระทำผิดระเบียบอื่นๆ (ถ้ามี)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { key: 'dress', label: 'แต่งกายผิดระเบียบ', pts: scoreRules.dressViolation },
              { key: 'phone', label: 'ใช้โทรศัพท์ผิดเวลา', pts: scoreRules.phoneViolation },
              { key: 'cleaning', label: 'ขาดเวรทำความสะอาด', pts: scoreRules.cleaningDutyMissed },
            ].map((item) => {
              const isChecked = disciplineState[item.key as keyof DisciplineRecord] ?? false;

              return (
                <div
                  key={item.key}
                  onClick={() => handleDisciplineToggle(item.key as keyof DisciplineRecord)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isChecked
                      ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/60 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-sm'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'border-slate-400 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold">{item.label}</span>
                  </div>

                  <span className="text-[11px] font-black text-rose-600 dark:text-rose-400">
                    {item.pts}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ITEM 5: คะแนนความดีและโบนัสพิเศษ (เพิ่มคะแนน) (เฉพาะแอดมินหลัก) */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-4 ${
          isAdmin
            ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-slate-800'
            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>5. คะแนนความดีและโบนัสพิเศษ (เพิ่มคะแนน)</span>
            </h3>
            {isAdmin ? (
              <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800">
                เฉพาะแอดมินหลัก
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                เฉพาะแอดมินหลักเท่านั้น
              </span>
            )}
          </div>

          {!isAdmin && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              * เมนูโบนัสพิเศษนี้สงวนสิทธิ์การปรับแต่งคะแนนไว้สำหรับผู้ดูแลระบบ (แอดมินหลัก) เท่านั้น
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'prayerComplete', label: 'เข้าละหมาดครบ 5 เวลาตรงเวลา', pts: scoreRules.prayerCompleteBonus },
              { key: 'completeHalaqah', label: 'มีความรู้และเข้าใจเนื้อหา', pts: scoreRules.completeHalaqahBonus },
              { key: 'volunteer', label: 'ทำจิตอาสา/ช่วยงานหอพัก', pts: scoreRules.volunteerBonus },
              { key: 'quranMemorisation', label: 'ท่องจำอัลกุรอานเพิ่มขึ้น', pts: scoreRules.quranBonus },
            ].map((item) => {
              const isChecked = bonusState[item.key as keyof BonusRecord] ?? false;

              return (
                <div
                  key={item.key}
                  onClick={() => handleBonusToggle(item.key as keyof BonusRecord)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    !isAdmin
                      ? 'bg-slate-100/50 border-slate-200 text-slate-400 cursor-not-allowed'
                      : isChecked
                      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-sm cursor-pointer'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isChecked && isAdmin
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-400 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {isChecked && isAdmin && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold">{item.label}</span>
                  </div>

                  <span className={`text-xs font-black ${isAdmin ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    +{item.pts} คะแนน
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ITEM 6: รายละเอียด/บันทึกพฤติกรรมเพิ่มเติม (เฉพาะแอดมินหลัก) */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-3 ${
          isAdmin
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>6. รายละเอียด/บันทึกพฤติกรรมเพิ่มเติม</span>
            </label>
            {isAdmin ? (
              <span className="text-[10px] font-black px-2.5 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-800">
                เฉพาะแอดมินหลัก
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                เฉพาะแอดมินหลักเท่านั้น
              </span>
            )}
          </div>

          <textarea
            rows={2.5}
            disabled={!isAdmin}
            placeholder={
              isAdmin
                ? "ระบุรายละเอียดหรือหมายเหตุบันทึกพฤติกรรมเพิ่มเติม (บันทึกเฉพาะของแอดมิน)..."
                : "สงวนสิทธิ์เฉพาะแอดมินหลักสำหรับการบันทึกข้อความพฤติกรรมเพิ่มเติม..."
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-amber-600 text-slate-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-medium">ผลการคำนวณคะแนนสุทธิสำหรับบันทึกนี้:</span>
            <span
              className={`font-black text-sm ${
                netDelta > 0
                  ? 'text-emerald-600'
                  : netDelta < 0
                  ? 'text-rose-600'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {netDelta > 0 ? `+${netDelta}` : netDelta} คะแนน
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canRecordAttendance || filteredStudents.length === 0}
          className="w-full py-4 bg-amber-800 hover:bg-amber-900 text-amber-300 font-extrabold rounded-3xl text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Save className="w-5 h-5" />
          <span>บันทึกวินัย & คำนวณคะแนนความประพฤติ</span>
        </button>
      </form>
    </div>
  );
};

