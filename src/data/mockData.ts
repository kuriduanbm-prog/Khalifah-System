import { Student, ScoreRule, OrgSettings, DailyRecord, UserAccount } from '../types';

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-admin-1',
    username: 'admin',
    name: 'ผู้ดูแลระบบหลัก (Main Admin)',
    role: 'Admin',
    assignedClassOrDorm: 'จัดการทุกส่วนในระบบ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  }
];

export const DEFAULT_ORG_SETTINGS: OrgSettings = {
  appName: 'Khalifah Student Discipline Management System',
  programName: 'โปรแกรมห้องเรียนคอลีฟะห์',
  faculty: 'คณะวิทยาศาสตร์และเทคโนโลยี',
  university: 'มหาวิทยาลัยฟาฏอนี',
  logoUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=160&q=80',
  apiUrl: 'https://script.google.com/macros/s/AKfycbyDLGQU5EuGcTXQAdVNaU3MqmnWzWwy4UNKGMpjmBHfFZVmugQf05jUIPj8fBngRsqF/exec',
};

export const DEFAULT_SCORE_RULES: ScoreRule = {
  latePrayer: -1,
  absentPrayer: -3,
  absentHalaqah: -2,
  lateActivity: -1,
  dressViolation: -1,
  phoneViolation: -2,
  cleaningDutyMissed: -2,
  prayerCompleteBonus: 2,
  completeHalaqahBonus: 1,
  volunteerBonus: 2,
  quranBonus: 2,
};

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_RECORDS: DailyRecord[] = [];
