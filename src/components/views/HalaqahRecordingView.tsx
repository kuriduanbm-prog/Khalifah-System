import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { HalaqahRecord, HalaqahStatus, DailyRecord, Student } from '../../types';
import { BookOpenCheck, Calendar, User, CheckCircle2, XCircle, Save, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateRecordScoreChange } from '../../utils/scoreCalculator';

export const HalaqahRecordingView: React.FC = () => {
  const { students, records, scoreRules, addOrUpdateRecord, currentUser, showSnackbar } = useApp();

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

  // Auto-set or switch student ID when filtered list updates
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

  const [halaqahState, setHalaqahState] = useState<HalaqahRecord>({
    subuh: 'Present',
    asr: 'Present',
    isha: 'Present',
  });

  const [note, setNote] = useState('');

  useEffect(() => {
    if (!selectedStudentId) return;
    const existing = records.find((r) => r.date === selectedDate && r.studentId === selectedStudentId);
    if (existing) {
      setHalaqahState(existing.halaqah);
      setNote(existing.note || '');
    } else {
      setHalaqahState({
        subuh: 'Present',
        asr: 'Present',
        isha: 'Present',
      });
      setNote('');
    }
  }, [selectedDate, selectedStudentId, records]);

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  const handleHalaqahChange = (sessionKey: keyof HalaqahRecord, status: HalaqahStatus) => {
    setHalaqahState((prev) => ({
      ...prev,
      [sessionKey]: status,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    const existing = records.find((r) => r.date === selectedDate && r.studentId === selectedStudentId);

    const recordToSave: DailyRecord = {
      id: existing ? existing.id : `rec-${selectedDate}-${selectedStudentId}`,
      date: selectedDate,
      studentId: selectedStudentId,
      studentName: currentStudent.fullName,
      prayer: existing?.prayer || { subuh: 'Present', zuhr: 'Present', asr: 'Present', maghrib: 'Present', isha: 'Present' },
      halaqah: halaqahState,
      discipline: existing?.discipline || { lateActivity: false, dress: false, phone: false, cleaning: false },
      bonus: existing?.bonus || {},
      note,
      recorder: currentUser?.name || 'ครูผู้บันทึก',
      timestamp: new Date().toISOString(),
    };

    recordToSave.calculatedScoreChange = calculateRecordScoreChange(recordToSave, scoreRules);

    await addOrUpdateRecord(recordToSave);
  };

  const sessionsList: { key: keyof HalaqahRecord; label: string; timeThai: string }[] = [
    { key: 'subuh', label: 'Subuh', timeThai: 'หะละเกาะฮ์ซุบฮิ (รอบเช้า)' },
    { key: 'asr', label: 'Asr', timeThai: 'หะละเกาะฮ์อัศรี (รอบเย็น)' },
    { key: 'isha', label: 'Isha', timeThai: 'หะละเกาะฮ์อิชาอ์ (รอบค่ำ)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpenCheck className="w-6 h-6 text-teal-600" />
          <span>บันทึกการเข้าร่วมหะละเกาะฮ์อัลกุรอาน/การเรียนรู้</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          เช็กชื่อการเข้าร่วมกิจกรรมอัลกุรอานประจำวัน (3 รอบ)
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Controls: Grade Filter, Date & Student Dropdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          {/* Grade Level Selection (ม.1 - ม.6) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-teal-600" />
                <span>เลือกระดับชั้นปี (ม.1 - ม.6):</span>
              </label>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
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
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 ring-2 ring-teal-500'
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
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>เลือกวันที่บันทึก</span>
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-600 text-slate-900 dark:text-slate-100 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" />
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
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-teal-600 text-slate-900 dark:text-slate-100 disabled:opacity-50 cursor-pointer truncate"
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

        {/* Selected Student Card */}
        {currentStudent && (
          <div className="bg-slate-900 text-white rounded-2xl py-2.5 px-3.5 shadow-xs flex items-center gap-3 border border-slate-800">
            <img
              src={currentStudent.photo}
              alt={currentStudent.fullName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-teal-400 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-teal-300 font-mono font-bold leading-none mb-0.5">รหัส: {currentStudent.id}</div>
              <h3 className="text-sm sm:text-base font-black text-white truncate leading-tight">
                {currentStudent.fullName}
              </h3>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sessionsList.map((item) => {
            const currentVal = halaqahState[item.key];

            return (
              <div
                key={item.key}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{item.timeThai}</h4>
                  <span className="text-[11px] text-slate-400">รอบ {item.label}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:w-60">
                  <button
                    type="button"
                    onClick={() => handleHalaqahChange(item.key, 'Present')}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      currentVal === 'Present'
                        ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>มาเข้าร่วม</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHalaqahChange(item.key, 'Absent')}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      currentVal === 'Absent'
                        ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>ขาด (-2)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            บันทึกการเรียนอัลกุรอาน / การท่องจำเพิ่มเติม
          </label>
          <input
            type="text"
            placeholder="เช่น อ่านได้ 2 หน้า, ท่องจำซูเราะฮ์ใหม่..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-teal-600 text-slate-900 dark:text-slate-100"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-amber-300 font-extrabold rounded-3xl text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Save className="w-5 h-5" />
          <span>บันทึกหะละเกาะฮ์ & ซิงค์ข้อมูล</span>
        </button>
      </form>
    </div>
  );
};
