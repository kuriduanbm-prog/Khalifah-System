export type UserRole = 'Admin' | 'อาจารย์' | 'ครูหอพัก' | 'นักเรียน';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  assignedClassOrDorm?: string;
  avatar?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  assignedClassOrDorm?: string;
  avatar?: string;
  createdAt?: string;
}

export type StudentStatus = 'ปกติ' | 'เฝ้าระวัง' | 'พ้นสภาพ' | 'พักการเรียน';

export interface Student {
  id: string; // Student ID e.g., "6512345678"
  fullName: string;
  nickname: string;
  faculty: string; // คณะวิทยาศาสตร์และเทคโนโลยี / โรงเรียนสาธิต
  programme: string; // สาขาวิชา / แผนการเรียน
  year: number | string; // 1, 2, 3, 4 หรือ 'ม.4', 'ม.5', 'ม.6', 'มัธยมศึกษาปีที่ 4-6'
  phone: string;
  parentPhone: string;
  dorm: string; // 'หอพักใน - ...' หรือ 'หอพักนอก - ...'
  advisor: string; // อาจารย์ที่ปรึกษา
  status: StudentStatus;
  photo: string; // Base64 or URL
  initialScore: number; // คะแนนเต็มเริ่มต้น 100 คะแนน
  parentName?: string; // ชื่อผู้ปกครอง
  isRegistered?: boolean; // สถานะการลงทะเบียนครั้งแรก
}

export type PrayerStatus = 'Present' | 'Late' | 'Absent'; // มา/ตรงเวลา, มาสาย, ขาด
export type HalaqahStatus = 'Present' | 'Absent'; // มา, ขาด

export interface PrayerRecord {
  subuh: PrayerStatus;
  zuhr: PrayerStatus;
  asr: PrayerStatus;
  maghrib: PrayerStatus;
  isha: PrayerStatus;
}

export interface HalaqahRecord {
  subuh: HalaqahStatus;
  asr: HalaqahStatus;
  isha: HalaqahStatus;
}

export interface DisciplineRecord {
  attendanceStatus?: 'Present' | 'Late' | 'Leave' | 'Absent'; // 1.มาเรียนตรงเวลา, 2.มาเรียนสาย, 3.ลาเรียน, 4.ขาดเรียน
  leaveNote?: string; // หมายเหตุการลาเรียน
  lateActivity: boolean; // มาสายกิจกรรม/เข้าเรียน
  dress: boolean; // ผิดระเบียบแต่งกาย
  phone: boolean; // ใช้โทรศัพท์ผิดเวลา
  cleaning: boolean; // ขาดเวรทำความสะอาด
  behavior?: boolean; // พฤติกรรมอื่นๆ
}

export interface BonusRecord {
  prayerComplete?: boolean; // ละหมาดครบ 5 เวลา (+2)
  completeHalaqah?: boolean; // เข้าร่วมหะละเกาะฮ์ครบ (+1)
  volunteer?: boolean; // จิตอาสา (+2)
  quranMemorisation?: boolean; // ท่องจำอัลกุรอาน (+2)
}

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  prayer: PrayerRecord;
  halaqah: HalaqahRecord;
  discipline: DisciplineRecord;
  bonus?: BonusRecord;
  note: string;
  recorder: string;
  timestamp: string;
  calculatedScoreChange?: number;
  syncedToBackend?: boolean;
}

export interface ScoreRule {
  latePrayer: number; // -1
  absentPrayer: number; // -3
  absentHalaqah: number; // -2
  lateActivity: number; // -1
  dressViolation: number; // -1
  phoneViolation: number; // -2
  cleaningDutyMissed: number; // -2
  prayerCompleteBonus: number; // +2
  completeHalaqahBonus: number; // +1
  volunteerBonus: number; // +2
  quranBonus: number; // +2
}

export interface OrgSettings {
  appName: string; // "Khalifah Student Discipline Management System"
  programName: string; // "โปรแกรมห้องเรียนคอลีฟะห์"
  faculty: string; // "คณะวิทยาศาสตร์และเทคโนโลยี"
  university: string; // "มหาวิทยาลัยฟาฏอนี"
  logoUrl: string;
  apiUrl: string;
}

export type ScoreBadgeLevel = 'Excellent' | 'Very Good' | 'Good' | 'Need Improvement' | 'Critical';

export interface ScoreBadgeInfo {
  level: ScoreBadgeLevel;
  labelThai: string;
  colorClass: string;
  bgHex: string;
  textHex: string;
}

export type TimePeriod = 'Today' | 'Daily' | 'Weekly' | 'Monthly' | 'Semester' | 'Yearly';
