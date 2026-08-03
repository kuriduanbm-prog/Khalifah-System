import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  Home,
  GraduationCap,
  CalendarCheck,
  BookOpenCheck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { calculateStudentTotalScore, getScoreBadgeInfo } from '../../utils/scoreCalculator';

export const StudentProfileView: React.FC = () => {
  const { students, selectedStudentId, records, scoreRules, orgSettings, setActiveTab, currentUser } = useApp();

  const student = useMemo(() => {
    if (currentUser) {
      const match = students.find(
        (s) => s.id.toLowerCase() === currentUser.username.toLowerCase() || s.id.toLowerCase() === currentUser.id.toLowerCase()
      );
      if (match && currentUser.role === 'นักเรียน') return match;
    }
    const found = students.find((s) => s.id === selectedStudentId);
    if (found) return found;
    return students[0];
  }, [students, selectedStudentId, currentUser]);

  const studentRecords = useMemo(() => {
    if (!student) return [];
    return records.filter((r) => r.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date));
  }, [student, records]);

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        ไม่พบข้อมูลนักเรียนในระบบ
      </div>
    );
  }

  const totalScore = calculateStudentTotalScore(student.id, student.initialScore ?? 100, records, scoreRules);
  const badge = getScoreBadgeInfo(totalScore);

  // Stats calculation
  let totalPresentPrayer = 0;
  let totalLatePrayer = 0;
  let totalAbsentPrayer = 0;
  let totalAbsentHalaqah = 0;

  studentRecords.forEach((r) => {
    Object.values(r.prayer).forEach((st) => {
      if (st === 'Present') totalPresentPrayer++;
      if (st === 'Late') totalLatePrayer++;
      if (st === 'Absent') totalAbsentPrayer++;
    });
    Object.values(r.halaqah).forEach((st) => {
      if (st === 'Absent') totalAbsentHalaqah++;
    });
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto print:p-0 print:space-y-2">
      {/* Printable Header for Print view */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-xl font-bold">{orgSettings.programName}</h1>
        <p className="text-sm">{orgSettings.faculty} {orgSettings.university}</p>
        <p className="text-xs text-slate-500 mt-1">รายงานผลและสถิติประพฤติตนนาย/นางสาว {student.fullName} ({student.id})</p>
      </div>

      {/* Navigation Back for Staff/Teacher */}
      {currentUser && currentUser.role !== 'นักเรียน' && (
        <button
          onClick={() => setActiveTab('students')}
          className="print:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังรายชื่อนักเรียนทั้งหมด</span>
        </button>
      )}

      {/* Main Student Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={student.photo}
            alt={student.fullName}
            className="w-28 h-28 rounded-3xl object-cover ring-4 ring-emerald-600/30 shadow-md shrink-0"
          />

          <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {student.id}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.colorClass}`}>
                {badge.labelThai}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold">
                สถานะ: {student.status}
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {student.fullName} ({student.nickname})
            </h1>

            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
              {student.faculty} | {student.programme} ({typeof student.year === 'string' ? student.year : `ปี ${student.year}`})
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{student.dorm}</span>
              </div>

              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>โทร: {student.phone}</span>
              </div>

              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                <span>ผู้ปกครอง: {student.parentPhone}</span>
              </div>

              <div className="flex items-center gap-2 justify-center md:justify-start col-span-1 sm:col-span-2">
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>อาจารย์ที่ปรึกษา: {student.advisor}</span>
              </div>
            </div>
          </div>

          <div className="text-center md:text-right p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-3xl border border-emerald-200 dark:border-emerald-800 shrink-0 w-full md:w-auto">
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block">คะแนนความประพฤติสะสม</span>
            <span className="text-3xl font-black text-emerald-900 dark:text-emerald-200">{totalScore}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 block mt-1">คะแนนเต็ม 100</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">{totalPresentPrayer}</div>
          <span className="text-[10px] text-slate-400">ละหมาดตรงเวลา (ครั้ง)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm text-center">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">{totalLatePrayer}</div>
          <span className="text-[10px] text-slate-400">ละหมาดสาย (ครั้ง)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm text-center">
          <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-1" />
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">{totalAbsentPrayer}</div>
          <span className="text-[10px] text-slate-400">ขาดละหมาด (ครั้ง)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm text-center">
          <BookOpenCheck className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">{totalAbsentHalaqah}</div>
          <span className="text-[10px] text-slate-400">นักเรียนอยู่บ้าน (ครั้ง)</span>
        </div>
      </div>

      {/* History Records Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-emerald-600" />
          <span>ประวัติบันทึกการละหมาด หะละเกาะฮ์ และระเบียบวินัย</span>
        </h3>

        {studentRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">ยังไม่มีประวัติการบันทึกข้อมูลสำหรับนักเรียนรายนี้</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="p-3">วันที่</th>
                  <th className="p-3">ละหมาด (ซุบฮิ / ซุฮรี / อัศรี / มัฆริบ / อิชาอ์)</th>
                  <th className="p-3">หะละเกาะฮ์</th>
                  <th className="p-3">หมายเหตุ / พฤติกรรม</th>
                  <th className="p-3 text-right">คะแนนสุทธิ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {studentRecords.map((r) => {
                  const delta = r.calculatedScoreChange ?? 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{r.date}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {['subuh', 'zuhr', 'asr', 'maghrib', 'isha'].map((k) => {
                            const st = r.prayer[k as keyof typeof r.prayer];
                            let bg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                            if (st === 'Late') bg = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
                            if (st === 'Absent') bg = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';

                            return (
                              <span key={k} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${bg}`}>
                                {st === 'Present' ? 'ตรง' : st === 'Late' ? 'สาย' : 'ขาด'}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {['subuh', 'asr', 'isha'].map((k) => {
                            const st = r.halaqah[k as keyof typeof r.halaqah];
                            return (
                              <span
                                key={k}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  st === 'Present'
                                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                {st === 'Present' ? 'มา' : 'ขาด'}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{r.note || '-'}</td>
                      <td
                        className={`p-3 text-right font-black ${
                          delta > 0
                            ? 'text-emerald-600'
                            : delta < 0
                            ? 'text-rose-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

