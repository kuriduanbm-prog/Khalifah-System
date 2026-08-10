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
  const studentRecords = records
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentScore = Math.min(100, Math.max(0, initialScore));

  studentRecords.forEach((record) => {
    const delta = calculateRecordScoreChange(record, rules);
    currentScore = Math.min(100, Math.max(0, currentScore + delta));
  });

  return Math.min(100, Math.max(0, currentScore));
}

export function getScoreBadgeInfo(score: number): ScoreBadgeInfo {
  const clampedScore = Math.min(100, Math.max(0, score));

  if (clampedScore > 80) {
    return {
      level: 'Excellent',
      labelThai: 'ปกติ/ดีเยี่ยม (81-100 คะแนน)',
      colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700',
      bgHex: '#10B981',
      textHex: '#FFFFFF',
    };
  } else if (clampedScore >= 71) {
    return {
      level: 'Warning',
      labelThai: 'เตือน/ต้องปรับปรุง (71-80 คะแนน)',
      colorClass: 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700',
      bgHex: '#F59E0B',
      textHex: '#FFFFFF',
    };
  } else if (clampedScore >= 50) {
    return {
      level: 'Critical',
      labelThai: 'วิกฤต/เสี่ยงสัญญาทุน (50-70 คะแนน)',
      colorClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700',
      bgHex: '#EF4444',
      textHex: '#FFFFFF',
    };
  } else {
    return {
      level: 'Extreme Critical',
      labelThai: 'วิกฤตขั้นสูง (<50 คะแนน)',
      colorClass: 'bg-rose-200 text-rose-950 border-rose-500 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-600',
      bgHex: '#991B1B',
      textHex: '#FFFFFF',
    };
  }
}
