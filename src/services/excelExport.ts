import * as XLSX from 'xlsx';
import { Student, DailyRecord, ScoreRule } from '../types';
import { calculateStudentTotalScore, getScoreBadgeInfo } from '../utils/scoreCalculator';

export function exportToExcel(students: Student[], records: DailyRecord[], rules: ScoreRule, filename: string = 'Khalifah_Student_Report') {
  const dataRows = students.map((st, idx) => {
    const score = calculateStudentTotalScore(st.id, st.initialScore ?? 100, records, rules);
    const badge = getScoreBadgeInfo(score);
    const stRecords = records.filter((r) => r.studentId === st.id);

    let totalAbsentPrayer = 0;
    let totalLatePrayer = 0;
    let totalAbsentHalaqah = 0;

    stRecords.forEach((r) => {
      Object.values(r.prayer).forEach((status) => {
        if (status === 'Absent') totalAbsentPrayer++;
        if (status === 'Late') totalLatePrayer++;
      });
      Object.values(r.halaqah).forEach((status) => {
        if (status === 'Absent') totalAbsentHalaqah++;
      });
    });

    return {
      'ลำดับ': idx + 1,
      'รหัสนักเรียน': st.id,
      'ชื่อ-นามสกุล': st.fullName,
      'ชื่อเล่น': st.nickname,
      'สาขาวิชา': st.programme,
      'ชั้นปี': st.year,
      'หอพัก': st.dorm,
      'เบอร์โทรศัพท์': st.phone,
      'เบอร์ผู้ปกครอง': st.parentPhone,
      'อาจารย์ที่ปรึกษา': st.advisor,
      'สถานะการศึกษา': st.status,
      'คะแนนประพฤติสะสม': score,
      'ระดับวินัย': badge.labelThai,
      'ขาดละหมาด (ครั้ง)': totalAbsentPrayer,
      'ละหมาดสาย (ครั้ง)': totalLatePrayer,
      'นักเรียนอยู่บ้าน (ครั้ง)': totalAbsentHalaqah
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานนักเรียน');

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportToCSV(students: Student[], records: DailyRecord[], rules: ScoreRule, filename: string = 'Khalifah_Student_Report') {
  const headers = [
    'ลำดับ', 'รหัสนักเรียน', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'สาขาวิชา', 'ชั้นปี', 'หอพัก', 'เบอร์โทร', 'คะแนนสะสม', 'ระดับวินัย'
  ];

  const rows = students.map((st, idx) => {
    const score = calculateStudentTotalScore(st.id, st.initialScore ?? 100, records, rules);
    const badge = getScoreBadgeInfo(score);
    return [
      idx + 1,
      `"${st.id}"`,
      `"${st.fullName}"`,
      `"${st.nickname}"`,
      `"${st.programme}"`,
      st.year,
      `"${st.dorm}"`,
      `"${st.phone}"`,
      score,
      `"${badge.labelThai}"`
    ].join(',');
  });

  // Include UTF-8 BOM so Thai characters display correctly in Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
