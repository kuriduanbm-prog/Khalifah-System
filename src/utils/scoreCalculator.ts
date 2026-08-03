import { DailyRecord, ScoreRule, ScoreBadgeInfo } from '../types';

export function calculateRecordScoreChange(record: DailyRecord, rules: ScoreRule): number {
  let delta = 0;

  // Prayer deductions
  const prayerKeys: (keyof typeof record.prayer)[] = ['subuh', 'zuhr', 'asr', 'maghrib', 'isha'];
  let presentPrayersCount = 0;

  prayerKeys.forEach((key) => {
    const status = record.prayer[key];
    if (status === 'Late') {
      delta += rules.latePrayer; // -1
    } else if (status === 'Absent') {
      delta += rules.absentPrayer; // -3
    } else if (status === 'Present') {
      presentPrayersCount++;
    }
  });

  // Halaqah deductions
  const halaqahKeys: (keyof typeof record.halaqah)[] = ['subuh', 'asr', 'isha'];
  let presentHalaqahCount = 0;

  halaqahKeys.forEach((key) => {
    const status = record.halaqah[key];
    if (status === 'Absent') {
      delta += rules.absentHalaqah; // -2
    } else if (status === 'Present') {
      presentHalaqahCount++;
    }
  });

  // Discipline violations & Attendance status
  if (record.discipline.attendanceStatus === 'Late' || record.discipline.lateActivity) {
    delta += rules.lateActivity; // -1
  }
  if (record.discipline.attendanceStatus === 'Absent') {
    delta += rules.absentPrayer || -2; // -2 or -3
  }
  if (record.discipline.dress) delta += rules.dressViolation; // -1
  if (record.discipline.phone) delta += rules.phoneViolation; // -2
  if (record.discipline.cleaning) delta += rules.cleaningDutyMissed; // -2

  // Bonuses
  if (record.bonus) {
    if (record.bonus.prayerComplete || presentPrayersCount === 5) {
      delta += rules.prayerCompleteBonus; // +2
    }
    if (record.bonus.completeHalaqah || presentHalaqahCount === 3) {
      delta += rules.completeHalaqahBonus; // +1
    }
    if (record.bonus.volunteer) {
      delta += rules.volunteerBonus; // +2
    }
    if (record.bonus.quranMemorisation) {
      delta += rules.quranBonus; // +2
    }
  }

  return delta;
}

export function calculateStudentTotalScore(
  studentId: string,
  initialScore: number = 100,
  records: DailyRecord[],
  rules: ScoreRule
): number {
  const studentRecords = records.filter((r) => r.studentId === studentId);
  let totalDelta = 0;

  studentRecords.forEach((record) => {
    totalDelta += calculateRecordScoreChange(record, rules);
  });

  return Math.max(0, initialScore + totalDelta);
}

export function getScoreBadgeInfo(score: number): ScoreBadgeInfo {
  if (score >= 90) {
    return {
      level: 'Excellent',
      labelThai: 'ดีเยี่ยม (Excellent)',
      colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700',
      bgHex: '#10B981',
      textHex: '#FFFFFF',
    };
  } else if (score >= 80) {
    return {
      level: 'Very Good',
      labelThai: 'ดีมาก (Very Good)',
      colorClass: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-700',
      bgHex: '#14B8A6',
      textHex: '#FFFFFF',
    };
  } else if (score >= 70) {
    return {
      level: 'Good',
      labelThai: 'ดี (Good)',
      colorClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700',
      bgHex: '#3B82F6',
      textHex: '#FFFFFF',
    };
  } else if (score >= 60) {
    return {
      level: 'Need Improvement',
      labelThai: 'ควรปรับปรุง (Need Improvement)',
      colorClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700',
      bgHex: '#F59E0B',
      textHex: '#FFFFFF',
    };
  } else {
    return {
      level: 'Critical',
      labelThai: 'วิกฤต (Critical)',
      colorClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700',
      bgHex: '#EF4444',
      textHex: '#FFFFFF',
    };
  }
}
