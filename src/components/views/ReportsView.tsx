import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TimePeriod } from '../../types';
import {
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Printer,
  Award,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar
} from 'lucide-react';
import { calculateStudentTotalScore, getScoreBadgeInfo } from '../../utils/scoreCalculator';
import { exportStudentsPDF } from '../../services/pdfExport';
import { exportToExcel, exportToCSV } from '../../services/excelExport';

export const ReportsView: React.FC = () => {
  const { students, records, scoreRules, orgSettings } = useApp();
  const [period, setPeriod] = useState<TimePeriod>('Monthly');

  // Compute rankings
  const rankings = useMemo(() => {
    const studentStats = students.map((s) => {
      const score = calculateStudentTotalScore(s.id, s.initialScore ?? 100, records, scoreRules);
      const stRecords = records.filter((r) => r.studentId === s.id);

      let presentPrayer = 0;
      let latePrayer = 0;
      let absentPrayer = 0;

      stRecords.forEach((r) => {
        Object.values(r.prayer).forEach((status) => {
          if (status === 'Present') presentPrayer++;
          if (status === 'Late') latePrayer++;
          if (status === 'Absent') absentPrayer++;
        });
      });

      return {
        student: s,
        score,
        badge: getScoreBadgeInfo(score),
        presentPrayer,
        latePrayer,
        absentPrayer,
      };
    });

    const highestScore = [...studentStats].sort((a, b) => b.score - a.score).slice(0, 5);
    const lowestScore = [...studentStats].sort((a, b) => a.score - b.score).slice(0, 5);
    const topAttendance = [...studentStats].sort((a, b) => b.presentPrayer - a.presentPrayer).slice(0, 5);
    const mostLate = [...studentStats].sort((a, b) => b.latePrayer - a.latePrayer).slice(0, 5);
    const mostAbsent = [...studentStats].sort((a, b) => b.absentPrayer - a.absentPrayer).slice(0, 5);

    return {
      highestScore,
      lowestScore,
      topAttendance,
      mostLate,
      mostAbsent,
      allStats: studentStats,
    };
  }, [students, records, scoreRules]);

  const handleExportPDF = () => {
    exportStudentsPDF(
      students,
      records,
      scoreRules,
      orgSettings,
      `รายงานสรุปความประพฤติและวินัยนักเรียน (${period})`
    );
  };

  const handleExportExcel = () => {
    exportToExcel(students, records, scoreRules, `Khalifah_Report_${period}`);
  };

  const handleExportCSV = () => {
    exportToCSV(students, records, scoreRules, `Khalifah_Report_${period}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in print:p-0 print:space-y-2">
      {/* Printable Header - hidden on screen, visible on print */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-xl font-bold">{orgSettings.programName}</h1>
        <p className="text-sm">{orgSettings.faculty} {orgSettings.university}</p>
        <p className="text-xs text-slate-500 mt-1">รายงานสรุปผลประพฤตินักเรียน ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
      </div>

      {/* Screen Header & Export Buttons */}
      <div className="print:hidden bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-emerald-600" />
            <span>รายงานการประเมินวิสัยทัศน์วินัยและสถิติการเข้าละหมาด</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            วิเคราะห์การมาละหมาด การขาด และอันดับนักเรียนในห้องเรียนคอลีฟะห์
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>ดาวน์โหลด PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออก Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="print:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-sm flex items-center gap-2 overflow-x-auto">
        {(['Daily', 'Weekly', 'Monthly', 'Semester', 'Yearly'] as TimePeriod[]).map((p) => {
          const labelMap: Record<TimePeriod, string> = {
            Today: 'วันนี้',
            Daily: 'รายวัน',
            Weekly: 'รายสัปดาห์',
            Monthly: 'รายเดือน',
            Semester: 'รายภาคเรียน',
            Yearly: 'รายปี',
          };

          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                period === p
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {labelMap[p]}
            </button>
          );
        })}
      </div>

      {/* Top Rankings Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top Prayer Attendance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>เข้าละหมาดตรงเวลาสูงสุด (Top Attendance)</span>
          </h3>
          <div className="space-y-2.5">
            {rankings.topAttendance.map((item, idx) => (
              <div key={item.student.id} className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.student.fullName}</div>
                    <div className="text-[10px] text-slate-400">{item.student.dorm.split(' ')[0]}</div>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {item.presentPrayer} ครั้ง
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span>คะแนนความประพฤติสูงสุด (Highest Score)</span>
          </h3>
          <div className="space-y-2.5">
            {rankings.highestScore.map((item, idx) => (
              <div key={item.student.id} className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.student.fullName}</div>
                    <div className="text-[10px] text-slate-400">{item.student.programme}</div>
                  </div>
                </div>
                <span className="text-xs font-black text-teal-600 dark:text-teal-400">
                  {item.score} คะแนน
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Late */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>มาละหมาดสายสูงสุด (Most Late)</span>
          </h3>
          <div className="space-y-2.5">
            {rankings.mostLate.map((item, idx) => (
              <div key={item.student.id} className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.student.fullName}</div>
                    <div className="text-[10px] text-slate-400">{item.student.id}</div>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                  {item.latePrayer} ครั้ง
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Absent */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>ขาดละหมาด/ขาดหะลาเกาะฮฺสูงสุด (Most Absent)</span>
          </h3>
          <div className="space-y-2.5">
            {rankings.mostAbsent.map((item, idx) => (
              <div key={item.student.id} className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.student.fullName}</div>
                    <div className="text-[10px] text-slate-400">{item.student.dorm.split(' ')[0]}</div>
                  </div>
                </div>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                  {item.absentPrayer} ครั้ง
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm md:col-span-2 lg:col-span-2">
          <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <span>นักเรียนที่ต้องติดตามตักเตือน/ปรับปรุงพฤติกรรม (Lowest Score)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {rankings.lowestScore.map((item, idx) => (
              <div key={item.student.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.student.fullName}</div>
                  <div className="text-[10px] text-slate-400">อ.ที่ปรึกษา: {item.student.advisor}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-rose-600 dark:text-rose-400">{item.score} คะแนน</div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${item.badge.colorClass}`}>
                    {item.badge.labelThai.split(' ')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
