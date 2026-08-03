import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, DailyRecord, ScoreRule, OrgSettings } from '../types';
import { calculateStudentTotalScore, getScoreBadgeInfo } from '../utils/scoreCalculator';

export function exportStudentsPDF(
  students: Student[],
  records: DailyRecord[],
  rules: ScoreRule,
  orgSettings: OrgSettings,
  periodName: string = 'รายงานสรุปคะแนนวินัยและประวัติการละหมาด'
) {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Header Banner
  doc.setFillColor(15, 81, 50); // Emerald green
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(orgSettings.appName, 14, 12);
  doc.setFontSize(10);
  doc.text(`${orgSettings.programName} | ${orgSettings.faculty} ${orgSettings.university}`, 14, 19);

  // Subtitle
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text(periodName, 14, 36);
  doc.setFontSize(9);
  doc.text(`วันที่พิมพ์รายงาน: ${new Date().toLocaleDateString('th-TH')} | ทั้งหมด ${students.length} รายการ`, 14, 42);

  const tableData = students.map((st, index) => {
    const totalScore = calculateStudentTotalScore(st.id, st.initialScore ?? 100, records, rules);
    const badge = getScoreBadgeInfo(totalScore);

    const stRecords = records.filter((r) => r.studentId === st.id);
    let absentCount = 0;
    let lateCount = 0;

    stRecords.forEach((r) => {
      Object.values(r.prayer).forEach((status) => {
        if (status === 'Absent') absentCount++;
        if (status === 'Late') lateCount++;
      });
    });

    return [
      (index + 1).toString(),
      st.id,
      st.fullName,
      st.year.toString(),
      st.dorm.split(' ')[0], // short dorm name
      `${totalScore} คะแนน`,
      badge.labelThai.split(' ')[0], // Thai text
      `ขาด ${absentCount} / สาย ${lateCount}`
    ];
  });

  autoTable(doc, {
    startY: 46,
    head: [['#', 'รหัส', 'ชื่อ-นามสกุล', 'ชั้นปี', 'หอพัก', 'คะแนนสะสม', 'ระดับวินัย', 'สถิติละหมาด']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 81, 50],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [245, 247, 245]
    }
  });

  doc.save(`Khalifah_Discipline_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
