import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  Users,
  Clock,
  XCircle,
  BookX,
  TrendingUp,
  Calendar,
  Search,
  X,
  ChevronRight,
  Filter,
  Eye,
  AlertCircle,
  UserCheck,
  CheckCircle2,
  BookOpen,
  Flame,
  Sparkles,
  Bell
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { calculateStudentTotalScore } from '../../utils/scoreCalculator';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

interface ChatMessage {
  id: string;
  sender: 'student' | 'admin';
  senderName: string;
  studentId?: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'read';
  topicTag?: string;
}

const INITIAL_ADMIN_CHAT: ChatMessage[] = [
  {
    id: 'msg-101',
    sender: 'student',
    senderName: 'มูฮัมหมัด อะลี',
    studentId: 'M0101',
    text: 'สวัสดีครับแอดมิน วันนี้ผมขออนุญาตแจ้งลาป่วยครับ มีอาการไข้ขึ้นสูง มีใบรับรองแพทย์จากโรงพยาบาลครับ',
    timestamp: '08:45 น.',
    status: 'sent',
    topicTag: 'แจ้งลา'
  },
  {
    id: 'msg-102',
    sender: 'student',
    senderName: 'ฟาฏินะฮ์ สะมาแอ',
    studentId: 'M0102',
    text: 'สอบถามเรื่องคะแนนเช็คชื่อละหมาดวันศุกร์ย้อนหลังค่ะ ระบบขึ้นว่าขาด แต่หนูไปละหมาดที่มัสยิดกลางค่ะ',
    timestamp: '10:15 น.',
    status: 'sent',
    topicTag: 'เช็คชื่อ'
  },
  {
    id: 'msg-103',
    sender: 'student',
    senderName: 'อับดุลเลาะห์ สาและ',
    studentId: 'M0201',
    text: 'รบกวนแอดมินช่วยรีเซ็ตรหัสผ่านเข้าใช้งานให้หน่อยครับ ผมจำรหัสเดิมไม่ได้ครับ',
    timestamp: '11:30 น.',
    status: 'sent',
    topicTag: 'บัญชี'
  }
];

export const DashboardView: React.FC = () => {
  const { students, records, scoreRules, setActiveTab, setSelectedStudentId, showSnackbar } = useApp();

  // Date selection state: default to today
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dateMode, setDateMode] = useState<'today' | 'custom' | 'weekly' | 'monthly'>('today');

  // Grade/Year selection state (ม.1 - ม.6)
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // Detail Drilldown Modal State
  const [detailModal, setDetailModal] = useState<
    'total' | 'ontime' | 'late' | 'leave' | 'absent_class' | 'absent_prayer' | 'absent_halaqah' | 'ontime_prayer' | null
  >(null);
  const [modalSearch, setModalSearch] = useState<string>('');

  // Helper function to check if student belongs to selected grade
  const isStudentInGrade = (s: Student, grade: string) => {
    if (grade === 'all') return true;
    const targetNum = grade.replace('ม.', '').trim(); // '1', '2', etc.
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

  // Lock body scroll & attach ESC key listener when modal is open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailModal(null);
      }
    };

    if (detailModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [detailModal]);

  // Filter students based on selected grade
  const gradeStudents = useMemo(() => {
    return students.filter((s) => isStudentInGrade(s, selectedGrade));
  }, [students, selectedGrade]);

  const gradeStudentIdsSet = useMemo(() => {
    return new Set(gradeStudents.map((s) => s.id));
  }, [gradeStudents]);

  // Filter records based on selected date / dateMode AND selected grade
  const filteredRecords = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let recs = records;
    if (dateMode === 'today') {
      recs = records.filter((r) => r.date === todayStr);
    } else if (dateMode === 'custom' && selectedDate) {
      recs = records.filter((r) => r.date === selectedDate);
    } else if (dateMode === 'weekly') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      recs = records.filter((r) => new Date(r.date) >= oneWeekAgo);
    } else if (dateMode === 'monthly') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      recs = records.filter((r) => new Date(r.date) >= oneMonthAgo);
    }

    return recs.filter((r) => gradeStudentIdsSet.has(r.studentId));
  }, [records, dateMode, selectedDate, gradeStudentIdsSet]);

  // Compute metrics for filtered grade & date
  const stats = useMemo(() => {
    const totalStudents = gradeStudents.length;
    let onTimeClassCount = 0;
    let classLateCount = 0;
    let totalLeaveCount = 0;
    let absentClassCount = 0;
    let absentPrayerCount = 0;
    let onTimePrayerCount = 0;
    let absentHalaqahCount = 0;

    filteredRecords.forEach((r) => {
      // Prayer absent / ontime
      Object.values(r.prayer).forEach((st) => {
        if (st === 'Present') onTimePrayerCount++;
        if (st === 'Absent') absentPrayerCount++;
      });

      // Halaqah absent
      Object.values(r.halaqah).forEach((st) => {
        if (st === 'Absent') absentHalaqahCount++;
      });

      // Attendance status (ข้อ 1 - 4)
      if (r.discipline?.attendanceStatus === 'Present') {
        onTimeClassCount++;
      } else if (r.discipline?.attendanceStatus === 'Late' || r.discipline?.lateActivity) {
        classLateCount++;
      } else if (r.discipline?.attendanceStatus === 'Absent') {
        absentClassCount++;
      }

      // Leave
      if (
        r.discipline?.attendanceStatus === 'Leave' ||
        r.discipline?.leaveNote ||
        (r.note && (r.note.includes('ลา') || r.note.includes('บ้าน') || r.note.includes('ป่วย')))
      ) {
        totalLeaveCount++;
      }
    });

    return {
      totalStudents,
      onTimeClassCount,
      classLateCount,
      totalLeaveCount,
      absentClassCount,
      absentPrayerCount,
      onTimePrayerCount,
      absentHalaqahCount,
    };
  }, [gradeStudents, filteredRecords]);

  // Chart 1 Data: Pie Chart for Prayer status
  const pieData = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;

    filteredRecords.forEach((r) => {
      Object.values(r.prayer).forEach((st) => {
        if (st === 'Present') present++;
        if (st === 'Late') late++;
        if (st === 'Absent') absent++;
      });
    });

    if (present === 0 && late === 0 && absent === 0) {
      present = 10;
      late = 2;
      absent = 1;
    }

    return {
      labels: ['ตรงเวลา (Present)', 'มาสาย (Late)', 'ขาดละหมาด (Absent)'],
      datasets: [
        {
          data: [present, late, absent],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderColor: ['#059669', '#D97706', '#DC2626'],
          borderWidth: 1,
        },
      ],
    };
  }, [filteredRecords]);

  // Chart 2 Data: Bar Chart by Prayer Time (Subuh, Zuhr, Asr, Maghrib, Isha)
  const barData = useMemo(() => {
    const prayerCounts = { subuh: 0, zuhr: 0, asr: 0, maghrib: 0, isha: 0 };
    filteredRecords.forEach((r) => {
      if (r.prayer.subuh === 'Absent') prayerCounts.subuh++;
      if (r.prayer.zuhr === 'Absent') prayerCounts.zuhr++;
      if (r.prayer.asr === 'Absent') prayerCounts.asr++;
      if (r.prayer.maghrib === 'Absent') prayerCounts.maghrib++;
      if (r.prayer.isha === 'Absent') prayerCounts.isha++;
    });

    return {
      labels: ['ซุบฮิ (Subuh)', 'ซุฮรี (Zuhr)', 'อัศรี (Asr)', 'มัฆริบ (Maghrib)', 'อิชาอ์ (Isha)'],
      datasets: [
        {
          label: 'จำนวนการขาดละหมาด (ครั้ง)',
          data: [
            prayerCounts.subuh,
            prayerCounts.zuhr,
            prayerCounts.asr,
            prayerCounts.maghrib,
            prayerCounts.isha,
          ],
          backgroundColor: '#3B82F6',
          borderRadius: 8,
        },
      ],
    };
  }, [filteredRecords]);

  // Chart 3 Data: Line Chart average student score trajectory over last 7 days
  const lineData = useMemo(() => {
    const days = 7;
    const labels: string[] = [];
    const avgScores: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const formatted = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      labels.push(formatted);

      let totalScoreForDay = 0;
      students.forEach((s) => {
        const sc = calculateStudentTotalScore(
          s.id,
          s.initialScore ?? 100,
          records.filter((r) => r.date <= dateStr),
          scoreRules
        );
        totalScoreForDay += sc;
      });

      const avg = students.length > 0 ? Math.round(totalScoreForDay / students.length) : 100;
      avgScores.push(avg);
    }

    return {
      labels,
      datasets: [
        {
          label: 'คะแนนเฉลี่ยรวมนักเรียน',
          data: avgScores,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [students, records, scoreRules]);

  // Items for Drilldown Modal
  const drilldownItems = useMemo(() => {
    if (!detailModal) return [];

    const prayerNames: Record<string, string> = {
      subuh: 'ซุบฮิ',
      zuhr: 'ซุฮรี',
      asr: 'อัศรี',
      maghrib: 'มัฆริบ',
      isha: 'อิชาอ์',
    };

    const halaqahNames: Record<string, string> = {
      subuh: 'หะละเกาะฮ์เช้า',
      asr: 'หะละเกาะฮ์เย็น',
      isha: 'หะละเกาะฮ์ค่ำ',
    };

    const studentMap = new Map<string, Student>();
    gradeStudents.forEach((s) => studentMap.set(s.id, s));

    if (detailModal === 'total') {
      const list = gradeStudents.map((s) => ({
        id: s.id,
        student: s,
        date: selectedDate || new Date().toISOString().split('T')[0],
        type: 'นักเรียนในระบบ',
        details: [`ชั้นปี: ${s.year || s.programme}`, `คณะ: ${s.faculty}`, `หอพัก: ${s.dorm}`],
        note: `สถานะ: ${s.status}`,
      }));

      if (!modalSearch.trim()) return list;
      const q = modalSearch.toLowerCase().trim();
      return list.filter(
        (item) =>
          item.student.fullName.toLowerCase().includes(q) ||
          item.student.id.toLowerCase().includes(q) ||
          item.student.dorm.toLowerCase().includes(q)
      );
    }

    const items: Array<{
      id: string;
      student: Student;
      date: string;
      type: string;
      details: string[];
      note?: string;
    }> = [];

    filteredRecords.forEach((r) => {
      const student = studentMap.get(r.studentId);
      if (!student) return;

      const details: string[] = [];

      if (detailModal === 'ontime') {
        if (r.discipline?.attendanceStatus === 'Present') {
          details.push('มาเรียนตรงเวลา');
        }
      } else if (detailModal === 'late') {
        if (r.discipline?.attendanceStatus === 'Late' || r.discipline?.lateActivity) {
          details.push('มาเรียนสาย');
        }
        Object.entries(r.prayer).forEach(([pKey, st]) => {
          if (st === 'Late') details.push(`มาสายละหมาด${prayerNames[pKey] || pKey}`);
        });
      } else if (detailModal === 'leave') {
        if (
          r.discipline?.attendanceStatus === 'Leave' ||
          r.discipline?.leaveNote ||
          (r.note && (r.note.includes('ลา') || r.note.includes('บ้าน') || r.note.includes('ป่วย')))
        ) {
          const lNote = r.discipline?.leaveNote || r.note;
          details.push(lNote ? `แจ้งลาเรียน: ${lNote}` : 'ลาเรียน');
        }
      } else if (detailModal === 'absent_class') {
        if (r.discipline?.attendanceStatus === 'Absent') {
          details.push('ขาดเรียน');
        }
      } else if (detailModal === 'absent_prayer') {
        Object.entries(r.prayer).forEach(([pKey, st]) => {
          if (st === 'Absent') details.push(`ขาดละหมาด${prayerNames[pKey] || pKey}`);
        });
      } else if (detailModal === 'absent_halaqah') {
        Object.entries(r.halaqah).forEach(([hKey, st]) => {
          if (st === 'Absent') details.push(`ขาด${halaqahNames[hKey] || hKey}`);
        });
      } else if (detailModal === 'ontime_prayer') {
        Object.entries(r.prayer).forEach(([pKey, st]) => {
          if (st === 'Present') details.push(`ละหมาด${prayerNames[pKey] || pKey} ตรงเวลา`);
        });
      }

      if (details.length > 0) {
        let typeName = '';
        if (detailModal === 'ontime') typeName = 'มาเรียนตรงเวลา';
        else if (detailModal === 'late') typeName = 'มาเรียนสาย';
        else if (detailModal === 'leave') typeName = 'ลาเรียน';
        else if (detailModal === 'absent_class') typeName = 'ขาดเรียน';
        else if (detailModal === 'absent_prayer') typeName = 'ขาดละหมาด';
        else if (detailModal === 'absent_halaqah') typeName = 'ขาดหะลาเกาะฮฺ';
        else if (detailModal === 'ontime_prayer') typeName = 'ละหมาดตรงเวลา';

        items.push({
          id: `${r.id}-${detailModal}`,
          student,
          date: r.date,
          type: typeName,
          details,
          note: r.note,
        });
      }
    });

    if (detailModal === 'leave' && items.length === 0) {
      gradeStudents.forEach((s) => {
        if (s.status === 'พักการเรียน' || s.status === 'เฝ้าระวัง') {
          items.push({
            id: s.id,
            student: s,
            date: selectedDate || new Date().toISOString().split('T')[0],
            type: 'ลาเรียน',
            details: [`สถานะนักเรียน: ${s.status}`, `หอพัก: ${s.dorm}`],
            note: 'ลงทะเบียนลาเรียน / ติดตามพฤติกรรม',
          });
        }
      });
    }

    if (!modalSearch.trim()) return items;
    const q = modalSearch.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.student.fullName.toLowerCase().includes(q) ||
        item.student.id.toLowerCase().includes(q) ||
        item.student.dorm.toLowerCase().includes(q)
    );
  }, [detailModal, filteredRecords, gradeStudents, selectedDate, modalSearch]);

  const handleOpenStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('profile');
    setDetailModal(null);
  };

  const formattedDateLabel = useMemo(() => {
    if (dateMode === 'today') return '';
    if (dateMode === 'custom' && selectedDate) {
      const d = new Date(selectedDate);
      return 'วันที่ ' + d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    if (dateMode === 'weekly') return 'สัปดาห์นี้';
    if (dateMode === 'monthly') return 'เดือนนี้';
    return '';
  }, [dateMode, selectedDate]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Date Selector Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>แดชบอร์ดสรุปผลระเบียบวินัย</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ระบบติดตามบันทึกละหมาด หะละเกาะฮ์ และคะแนนความประพฤตินักเรียน
            </p>
          </div>

          {/* Filter Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => {
                setDateMode('today');
                setSelectedDate(new Date().toISOString().split('T')[0]);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                dateMode === 'today'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              วันนี้
            </button>

            <button
              onClick={() => setDateMode('weekly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                dateMode === 'weekly'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              สัปดาห์นี้
            </button>

            <button
              onClick={() => setDateMode('monthly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                dateMode === 'monthly'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              เดือนนี้
            </button>
          </div>
        </div>

        {/* Custom Date Picker & Grade Level Filter Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
          {/* Grade Filter 2 Rows */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>เลือกระดับชั้นปี (ม.1 - ม.6):</span>
              </label>

              {/* Current Filter Badge */}
              <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-full shrink-0">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-xs font-bold text-sky-800 dark:text-sky-300">
                  {selectedGrade === 'all' ? 'ทุกชั้นปี' : `ชั้น ${selectedGrade}`}
                  {formattedDateLabel ? ` • ${formattedDateLabel}` : ''}
                </span>
              </div>
            </div>

            {/* Row 1: ทุกชั้นปี, ม.1, ม.2, ม.3 */}
            <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center">
              {[
                { id: 'all', label: 'ทุกชั้นปี' },
                { id: 'ม.1', label: 'ม.1' },
                { id: 'ม.2', label: 'ม.2' },
                { id: 'ม.3', label: 'ม.3' },
              ].map((g) => {
                const isActive = selectedGrade === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrade(g.id)}
                    className={`min-h-[42px] px-2.5 py-2 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                    <span>{g.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: ม.4, ม.5, ม.6 */}
            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center">
              {[
                { id: 'ม.4', label: 'ม.4' },
                { id: 'ม.5', label: 'ม.5' },
                { id: 'ม.6', label: 'ม.6' },
              ].map((g) => {
                const isActive = selectedGrade === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrade(g.id)}
                    className={`min-h-[42px] px-2.5 py-2 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500'
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

          {/* Date Picker Row - Mobile Easy Touch */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>เลือกวันที่ต้องการดู:</span>
            </label>
            <div className="relative w-full sm:w-auto">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setDateMode('custom');
                }}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Metric Cards Grid (Click to view details) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* 1. นักเรียนทั้งหมด */}
        <div
          onClick={() => {
            setDetailModal('total');
            setModalSearch('');
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-300 dark:hover:border-blue-700 active:scale-95"
          title="กดเพื่อดูรายชื่อนักเรียนทั้งหมด"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">นักเรียนทั้งหมด</span>
            <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.totalStudents}</div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 block font-medium">
            คนในชั้นเรียน (กดดูรายชื่อ)
          </span>
        </div>

        {/* 2. การมาเรียนตรงเวลา */}
        <div
          onClick={() => {
            setDetailModal('ontime');
            setModalSearch('');
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-300 dark:hover:border-emerald-700 active:scale-95"
          title="กดเพื่อดูรายชื่อนักเรียนที่มาเรียนตรงเวลา"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">การมาเรียนตรงเวลา</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.onTimeClassCount}</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
            คน/ครั้ง (กดดูรายชื่อ)
          </span>
        </div>

        {/* 3. การมาเรียนสาย */}
        <div
          onClick={() => {
            setDetailModal('late');
            setModalSearch('');
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-amber-300 dark:hover:border-amber-700 active:scale-95"
          title="กดเพื่อดูรายชื่อนักเรียนที่มาเรียนสาย"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">การมาเรียนสาย</span>
            <div className="p-2 bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.classLateCount}</div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block font-medium">
            ครั้งที่สาย (กดดูรายชื่อ)
          </span>
        </div>

        {/* 4. การลาเรียน */}
        <div
          onClick={() => {
            setDetailModal('leave');
            setModalSearch('');
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-purple-300 dark:hover:border-purple-700 active:scale-95"
          title="กดเพื่อดูรายชื่อนักเรียนที่ลาเรียน"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">การลาเรียน</span>
            <div className="p-2 bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
              <BookX className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {stats.totalLeaveCount}
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 block font-medium">
            รายการ (กดดูรายชื่อ)
          </span>
        </div>

        {/* 5. การขาดเรียน */}
        <div
          onClick={() => {
            setDetailModal('absent_class');
            setModalSearch('');
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-rose-300 dark:hover:border-rose-700 active:scale-95"
          title="กดเพื่อดูรายชื่อนักเรียนที่ขาดเรียน"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">การขาดเรียน</span>
            <div className="p-2 bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 rounded-2xl group-hover:scale-110 transition-transform">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {stats.absentClassCount}
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 block font-medium">
            ครั้งที่ขาด (กดดูรายชื่อ)
          </span>
        </div>

        {/* 6. ละหมาดตรงเวลา */}
        <div
          onClick={() => {
            setDetailModal('ontime_prayer');
            setModalSearch('');
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-300 dark:hover:border-emerald-700 active:scale-95"
          title="กดเพื่อดูรายชื่อนักเรียนที่ละหมาดตรงเวลา"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ละหมาดตรงเวลา</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.onTimePrayerCount}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
            เวลาที่ตรงเวลา (กดดูรายชื่อ)
          </span>
        </div>

        {/* 7. ขาดละหมาด */}
        <div
          onClick={() => {
            setDetailModal('absent_prayer');
            setModalSearch('');
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-orange-300 dark:hover:border-orange-700 active:scale-95"
          title="กดเพื่อดูรายชื่อนักเรียนที่ขาดละหมาด"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ขาดละหมาด</span>
            <div className="p-2 bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
            {stats.absentPrayerCount}
          </div>
          <span className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 block font-medium">
            เวลาที่ขาด (กดดูรายชื่อ)
          </span>
        </div>

        {/* 8. ขาดหะลาเกาะฮฺ */}
        <div
          onClick={() => {
            setDetailModal('absent_halaqah');
            setModalSearch('');
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-teal-300 dark:hover:border-teal-700 active:scale-95"
          title="กดเพื่อดูรายชื่อนักเรียนที่ขาดหะลาเกาะฮฺ"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ขาดหะลาเกาะฮฺ</span>
            <div className="p-2 bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 rounded-2xl group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
            {stats.absentHalaqahCount}
          </div>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 block font-medium">
            รอบที่ขาด (กดดูรายชื่อ)
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>สัดส่วนสถานะการเข้าละหมาด</span>
          </h3>
          <div className="h-60 flex items-center justify-center">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>การขาดละหมาดแยกตาม 5 เวลา</span>
          </h3>
          <div className="h-60">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm md:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>แนวโน้มคะแนนวินัยเฉลี่ย 7 วัน</span>
          </h3>
          <div className="h-60">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 60, max: 105 },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Drilldown Modal View rendered via Portal directly to body */}
      {detailModal &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setDetailModal(null);
            }}
            className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl h-[92vh] max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${
                    detailModal === 'total' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300' :
                    detailModal === 'ontime' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300' :
                    detailModal === 'late' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-300' :
                    detailModal === 'leave' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-300' :
                    detailModal === 'absent_class' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300' :
                    detailModal === 'absent_prayer' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/80 dark:text-orange-300' :
                    'bg-teal-50 text-teal-600 dark:bg-teal-950/80 dark:text-teal-300'
                  }`}>
                    {detailModal === 'total' && <Users className="w-6 h-6" />}
                    {detailModal === 'ontime' && <CheckCircle2 className="w-6 h-6" />}
                    {detailModal === 'late' && <Clock className="w-6 h-6" />}
                    {detailModal === 'leave' && <BookX className="w-6 h-6" />}
                    {detailModal === 'absent_class' && <XCircle className="w-6 h-6" />}
                    {detailModal === 'absent_prayer' && <Flame className="w-6 h-6" />}
                    {detailModal === 'absent_halaqah' && <BookOpen className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                      {detailModal === 'total' && 'รายชื่อนักเรียนทั้งหมด'}
                      {detailModal === 'ontime' && 'รายชื่อนักเรียนที่มาเรียนตรงเวลา'}
                      {detailModal === 'late' && 'รายชื่อนักเรียนที่มาเรียนสาย'}
                      {detailModal === 'leave' && 'รายชื่อนักเรียนที่ลาเรียน'}
                      {detailModal === 'absent_class' && 'รายชื่อนักเรียนที่ขาดเรียน'}
                      {detailModal === 'absent_prayer' && 'รายชื่อนักเรียนที่ขาดละหมาด'}
                      {detailModal === 'absent_halaqah' && 'รายชื่อนักเรียนที่ขาดหะลาเกาะฮฺ'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formattedDateLabel} • พบทั้งหมด {drilldownItems.length} รายการ
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDetailModal(null)}
                  className="px-3.5 py-2 rounded-2xl bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-extrabold flex items-center gap-1.5 border border-rose-300 dark:border-rose-800 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all text-xs"
                  title="ปิดหน้าต่างป๊อปอัป"
                >
                  <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>ปิดหน้าต่าง</span>
                </button>
              </div>

              {/* Modal Filter & Search Bar */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 space-y-3">
                {/* Grade Selection 2 Rows - Mobile Friendly Touch Pills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>กรองระดับชั้นเรียน (ม.1 - ม.6):</span>
                    </label>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {selectedGrade === 'all' ? 'ทุกชั้นปี' : `ชั้น ${selectedGrade}`}
                    </span>
                  </div>

                  {/* Row 1: ทุกชั้นปี, ม.1, ม.2, ม.3 */}
                  <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center">
                    {[
                      { id: 'all', label: 'ทุกชั้นปี' },
                      { id: 'ม.1', label: 'ม.1' },
                      { id: 'ม.2', label: 'ม.2' },
                      { id: 'ม.3', label: 'ม.3' },
                    ].map((g) => {
                      const isActive = selectedGrade === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setSelectedGrade(g.id)}
                          className={`min-h-[42px] px-2 py-2 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95 ${
                            isActive
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 border border-emerald-500'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                          <span>{g.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Row 2: ม.4, ม.5, ม.6 */}
                  <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center">
                    {[
                      { id: 'ม.4', label: 'ม.4' },
                      { id: 'ม.5', label: 'ม.5' },
                      { id: 'ม.6', label: 'ม.6' },
                    ].map((g) => {
                      const isActive = selectedGrade === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setSelectedGrade(g.id)}
                          className={`min-h-[42px] px-2 py-2 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95 ${
                            isActive
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 border border-emerald-500'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                          <span>{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, รหัสนักเรียน หรือหอพัก..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Modal Student List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {drilldownItems.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      ไม่พบข้อมูลในหมวดนี้สำหรับช่วงเวลาที่เลือก
                    </p>
                  </div>
                ) : (
                  drilldownItems.map((item, idx) => (
                    <div
                      key={item.id + '-' + idx}
                      className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.student.photo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.student.fullName
                            )}&background=0284c7&color=fff`
                          }
                          alt={item.student.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {item.student.fullName}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400 rounded-full">
                              {item.student.id}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.student.faculty} • {item.student.dorm}
                          </div>
                          {/* Details badges */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.details.map((dt, dIdx) => (
                              <span
                                key={dIdx}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  detailModal === 'ontime'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                    : detailModal === 'late'
                                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                                    : detailModal === 'leave'
                                    ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300'
                                    : detailModal === 'absent_class'
                                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                                    : detailModal === 'absent_prayer'
                                    ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300'
                                    : detailModal === 'absent_halaqah'
                                    ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300'
                                    : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                                }`}
                              >
                                {dt}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400">
                          {item.date}
                        </span>
                        <button
                          onClick={() => handleOpenStudentProfile(item.student.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-xl text-xs font-bold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูโปรไฟล์</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
                  💡 คลิกพื้นที่ภายนอก หรือกดปุ่ม <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-mono font-bold">Esc</kbd> เพื่อปิดหน้าต่าง
                </span>
                <button
                  onClick={() => setDetailModal(null)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>ปิดหน้าต่างป๊อปอัป</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
