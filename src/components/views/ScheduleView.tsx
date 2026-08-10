import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { scanScheduleImageOffline, ScannedSlot } from '../../lib/scheduleScanner';
import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  User,
  Search,
  Filter,
  Sparkles,
  Download,
  Info,
  CheckCircle2,
  CalendarDays,
  Upload,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  X,
  Plus,
  FileImage,
  Pencil,
  Scan,
  Loader2,
  Wand2,
  Check,
  Edit3,
  ArrowRight,
  Layers,
  FileSpreadsheet,
  FileText,
  Share2
} from 'lucide-react';

interface ScheduleSlot {
  id: string;
  day: 'อาทิตย์' | 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์';
  time: string; // e.g. '08:30 - 09:30'
  subjectCode: string;
  subjectName: string;
  teacher: string;
  room: string;
  color: string; // bg color badge
}

interface ScheduleImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  uploadedBy?: string;
  year: string;
}

const INITIAL_SCHEDULES: Record<string, ScheduleSlot[]> = {
  'ม.1': [
    { id: 'm1-sun-1', day: 'อาทิตย์', time: '08:30 - 10:30', subjectCode: 'อส11100', subjectName: 'ทบทวนอัลกุรอานเเละความรู้ศาสนา', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 101', color: 'bg-red-500' },
    { id: 'm1-1', day: 'จันทร์', time: '08:30 - 09:30', subjectCode: 'อส11101', subjectName: 'อัลกุรอานเเละอัลฮะดีษ 1', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 101', color: 'bg-emerald-500' },
    { id: 'm1-2', day: 'จันทร์', time: '09:30 - 10:30', subjectCode: 'ค11101', subjectName: 'คณิตศาสตร์พื้นฐาน', teacher: 'อ.อับดุลเลาะห์', room: 'ห้อง 101', color: 'bg-indigo-500' },
    { id: 'm1-3', day: 'จันทร์', time: '10:30 - 11:30', subjectCode: 'ว11101', subjectName: 'วิทยาศาสตร์พื้นฐาน', teacher: 'ดร.ฟารีดะฮ์', room: 'ห้องแล็บ 1', color: 'bg-sky-500' },
    { id: 'm1-4', day: 'จันทร์', time: '11:30 - 12:30', subjectCode: 'REST', subjectName: 'พักกลางวัน & ละหมาดซุฮ์ริ', teacher: 'อาจารย์เวรประจำวัน', room: 'มัสยิดโรงเรียน', color: 'bg-amber-500' },
    { id: 'm1-5', day: 'จันทร์', time: '12:30 - 13:30', subjectCode: 'ท11101', subjectName: 'ภาษาไทย 1', teacher: 'อ.วิภา', room: 'ห้อง 101', color: 'bg-orange-500' },
    { id: 'm1-6', day: 'อังคาร', time: '08:30 - 10:30', subjectCode: 'อ11101', subjectName: 'ภาษาอังกฤษพื้นฐาน', teacher: 'Teacher John', room: 'ห้อง 101', color: 'bg-blue-600' },
    { id: 'm1-7', day: 'อังคาร', time: '10:30 - 11:30', subjectCode: 'ส11101', subjectName: 'สังคมศึกษา', teacher: 'อ.ฮาซัน', room: 'ห้อง 101', color: 'bg-amber-600' },
    { id: 'm1-8', day: 'พุธ', time: '08:30 - 10:30', subjectCode: 'อส11102', subjectName: 'ศาสนประวัติเเละฟิกฮ์', teacher: 'อ.อุสมาน', room: 'ห้อง 101', color: 'bg-teal-500' },
    { id: 'm1-9', day: 'พฤหัสบดี', time: '08:30 - 10:30', subjectCode: 'พ11101', subjectName: 'สุขศึกษาและพลศึกษา', teacher: 'อ.มูฮัมหมัด', room: 'สนามโรงเรียน', color: 'bg-rose-500' },
    { id: 'm1-10', day: 'ศุกร์', time: '08:30 - 10:30', subjectCode: 'ภ11101', subjectName: 'ภาษาอาหรับเบื้องต้น', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 101', color: 'bg-emerald-600' },
  ],
  'ม.2': [
    { id: 'm2-1', day: 'จันทร์', time: '08:30 - 09:30', subjectCode: 'อส21101', subjectName: 'อัลกุรอานเเละอัลฮะดีษ 2', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 201', color: 'bg-emerald-500' },
    { id: 'm2-2', day: 'จันทร์', time: '09:30 - 10:30', subjectCode: 'ค21101', subjectName: 'คณิตศาสตร์ 2', teacher: 'อ.อับดุลเลาะห์', room: 'ห้อง 201', color: 'bg-indigo-500' },
    { id: 'm2-3', day: 'อังคาร', time: '08:30 - 10:30', subjectCode: 'ว21101', subjectName: 'วิทยาศาสตร์และเทคโนโลยี', teacher: 'ดร.ฟารีดะฮ์', room: 'ห้องแล็บ 2', color: 'bg-sky-500' },
    { id: 'm2-4', day: 'พุธ', time: '08:30 - 10:30', subjectCode: 'อ21101', subjectName: 'ภาษาอังกฤษเพื่อการสื่อสาร', teacher: 'Teacher John', room: 'ห้อง 201', color: 'bg-blue-600' },
    { id: 'm2-5', day: 'พฤหัสบดี', time: '08:30 - 10:30', subjectCode: 'ส21101', subjectName: 'ประวัติศาสตร์และจริยธรรม', teacher: 'อ.ฮาซัน', room: 'ห้อง 201', color: 'bg-amber-600' },
    { id: 'm2-6', day: 'ศุกร์', time: '08:30 - 10:30', subjectCode: 'อส21102', subjectName: 'ฟิกฮ์เเละศาสนบัญญัติ', teacher: 'อ.อุสมาน', room: 'ห้อง 201', color: 'bg-teal-600' },
  ],
  'ม.3': [
    { id: 'm3-1', day: 'จันทร์', time: '08:30 - 09:30', subjectCode: 'อส31101', subjectName: 'อัลกุรอานเเละตัฟซีร 1', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 301', color: 'bg-emerald-500' },
    { id: 'm3-2', day: 'จันทร์', time: '09:30 - 10:30', subjectCode: 'ค31101', subjectName: 'คณิตศาสตร์เข้มข้น', teacher: 'อ.อับดุลเลาะห์', room: 'ห้อง 301', color: 'bg-indigo-500' },
    { id: 'm3-3', day: 'อังคาร', time: '08:30 - 10:30', subjectCode: 'ว31101', subjectName: 'วิทยาศาสตร์กายภาพ', teacher: 'อ.นัชมีย์', room: 'ห้องแล็บ 3', color: 'bg-sky-500' },
    { id: 'm3-4', day: 'พุธ', time: '08:30 - 10:30', subjectCode: 'อ31101', subjectName: 'ภาษาอังกฤษ O-NET', teacher: 'Teacher John', room: 'ห้อง 301', color: 'bg-blue-600' },
    { id: 'm3-5', day: 'พฤหัสบดี', time: '08:30 - 10:30', subjectCode: 'ภ31101', subjectName: 'ภาษาอาหรับประยุกต์', teacher: 'อ.อุสมาน', room: 'ห้อง 301', color: 'bg-teal-600' },
    { id: 'm3-6', day: 'ศุกร์', time: '08:30 - 10:30', subjectCode: 'อส31102', subjectName: 'อักลากเเละคุณธรรม', teacher: 'อ.ฮาซัน', room: 'ห้อง 301', color: 'bg-emerald-600' },
  ],
  'ม.4': [
    { id: 'm4-1', day: 'จันทร์', time: '08:30 - 09:30', subjectCode: 'อส31101', subjectName: 'อัลกุรอานเเละอัลฮะดีษ 1', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 401', color: 'bg-emerald-500' },
    { id: 'm4-2', day: 'จันทร์', time: '09:30 - 10:30', subjectCode: 'ว31201', subjectName: 'ฟิสิกส์ 1', teacher: 'อ.อามีนะฮ์', room: 'ห้องแล็บวิทยาศาสตร์', color: 'bg-purple-500' },
    { id: 'm4-3', day: 'อังคาร', time: '08:30 - 10:30', subjectCode: 'ค31101', subjectName: 'คณิตศาสตร์เพิ่มเติม 1', teacher: 'อ.อับดุลเลาะห์', room: 'ห้อง 401', color: 'bg-indigo-500' },
    { id: 'm4-4', day: 'พุธ', time: '08:30 - 10:30', subjectCode: 'ว31202', subjectName: 'เคมี 1', teacher: 'อ.นัชมีย์', room: 'ห้องแล็บเคมี', color: 'bg-pink-500' },
    { id: 'm4-5', day: 'พฤหัสบดี', time: '08:30 - 10:30', subjectCode: 'ว31203', subjectName: 'ชีววิทยา 1', teacher: 'ดร.ฟารีดา', room: 'ห้องแล็บชีววิทยา', color: 'bg-green-600' },
    { id: 'm4-6', day: 'ศุกร์', time: '08:30 - 10:30', subjectCode: 'ภ31101', subjectName: 'ภาษาอาหรับเพื่อการสื่อสาร', teacher: 'อ.อุสมาน', room: 'ห้อง 401', color: 'bg-teal-600' },
  ],
  'ม.5': [
    // วันอาทิตย์
    { id: 'sun-m5-1', day: 'อาทิตย์', time: '08:30 - 10:30', subjectCode: 'อส32100', subjectName: 'กิรออาฮ์เเละตัจวีด (การอ่านอัลกุรอาน)', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 301', color: 'bg-rose-500' },
    { id: 'sun-m5-2', day: 'อาทิตย์', time: '10:30 - 11:30', subjectCode: 'HLQ-SUN', subjectName: 'หะละเกาะฮ์อัลกุรอานยามเช้า', teacher: 'ครูหอพักประจำกลุ่ม', room: 'ลานหะละเกาะฮ์', color: 'bg-purple-600' },

    // วันจันทร์
    { id: '1', day: 'จันทร์', time: '08:30 - 09:30', subjectCode: 'อส32101', subjectName: 'อัลกุรอานเเละอัลฮะดีษ 3', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 301', color: 'bg-emerald-500' },
    { id: '2', day: 'จันทร์', time: '09:30 - 10:30', subjectCode: 'ว32202', subjectName: 'วิทยาการคำนวณและ AI', teacher: 'ดร.ฟารีดะฮ์', room: 'ห้องคอมฯ 2', color: 'bg-sky-500' },
    { id: '3', day: 'จันทร์', time: '10:30 - 11:30', subjectCode: 'ค32101', subjectName: 'คณิตศาสตร์เพิ่มเติม', teacher: 'อ.อับดุลเลาะห์', room: 'ห้อง 301', color: 'bg-indigo-500' },
    { id: '4', day: 'จันทร์', time: '11:30 - 12:30', subjectCode: 'REST', subjectName: 'พักกลางวัน & ละหมาดซุฮ์ริ', teacher: 'อาจารย์เวรประจำวัน', room: 'มัสยิดโรงเรียน', color: 'bg-amber-500' },
    { id: '5', day: 'จันทร์', time: '12:30 - 13:30', subjectCode: 'ภ32101', subjectName: 'ภาษาอาหรับเพื่อการสื่อสาร', teacher: 'อ.อุสมาน', room: 'ห้อง 301', color: 'bg-teal-500' },
    { id: '6', day: 'จันทร์', time: '13:30 - 14:30', subjectCode: 'พ32101', subjectName: 'สุขศึกษาและพลศึกษา', teacher: 'อ.มูฮัมหมัด', room: 'อาคารอเนกประสงค์', color: 'bg-rose-500' },
    { id: '7', day: 'จันทร์', time: '15:30 - 16:30', subjectCode: 'HLQ', subjectName: 'หะละเกาะฮ์อัลกุรอานยามเย็น', teacher: 'ครูหอพักประจำกลุ่ม', room: 'ลานหะละเกาะฮ์', color: 'bg-purple-600' },

    // วันอังคาร
    { id: '8', day: 'อังคาร', time: '08:30 - 09:30', subjectCode: 'ว32201', subjectName: 'ฟิสิกส์ 2', teacher: 'อ.อามีนะฮ์', room: 'ห้องแล็บวิทยาศาสตร์', color: 'bg-purple-500' },
    { id: '9', day: 'อังคาร', time: '09:30 - 10:30', subjectCode: 'ว32201', subjectName: 'ฟิสิกส์ 2 (ปฏิบัติการ)', teacher: 'อ.อามีนะฮ์', room: 'ห้องแล็บวิทยาศาสตร์', color: 'bg-purple-500' },
    { id: '10', day: 'อังคาร', time: '10:30 - 11:30', subjectCode: 'ส32101', subjectName: 'ประวัติศาสตร์อิสลาม', teacher: 'อ.ฮาซัน', room: 'ห้อง 301', color: 'bg-amber-600' },
    { id: '11', day: 'อังคาร', time: '11:30 - 12:30', subjectCode: 'REST', subjectName: 'พักกลางวัน & ละหมาดซุฮ์ริ', teacher: 'อาจารย์เวรประจำวัน', room: 'มัสยิดโรงเรียน', color: 'bg-amber-500' },
    { id: '12', day: 'อังคาร', time: '12:30 - 13:30', subjectCode: 'อ32101', subjectName: 'ภาษาอังกฤษเข้มข้น', teacher: 'Teacher John', room: 'ห้อง 301', color: 'bg-blue-600' },
    { id: '13', day: 'อังคาร', time: '13:30 - 15:30', subjectCode: 'อส32102', subjectName: 'ฟิกฮ์เเละหลักการศาสนา', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 301', color: 'bg-emerald-600' },
    { id: '14', day: 'อังคาร', time: '15:30 - 16:30', subjectCode: 'HLQ', subjectName: 'หะละเกาะฮ์อัลกุรอานยามเย็น', teacher: 'ครูหอพักประจำกลุ่ม', room: 'ลานหะละเกาะฮ์', color: 'bg-purple-600' },

    // วันพุธ
    { id: '15', day: 'พุธ', time: '08:30 - 10:30', subjectCode: 'ว32203', subjectName: 'เคมีและปฏิบัติการ', teacher: 'อ.นัชมีย์', room: 'ห้องแล็บเคมี', color: 'bg-pink-500' },
    { id: '16', day: 'พุธ', time: '10:30 - 11:30', subjectCode: 'ท32101', subjectName: 'ภาษาไทยเพื่อการสื่อสาร', teacher: 'อ.วิภา', room: 'ห้อง 301', color: 'bg-orange-500' },
    { id: '17', day: 'พุธ', time: '11:30 - 12:30', subjectCode: 'REST', subjectName: 'พักกลางวัน & ละหมาดซุฮ์ริ', teacher: 'อาจารย์เวรประจำวัน', room: 'มัสยิดโรงเรียน', color: 'bg-amber-500' },
    { id: '18', day: 'พุธ', time: '12:30 - 14:30', subjectCode: 'ก32901', subjectName: 'กิจกรรมพัฒนาผู้เรียน / ลูกเสือ', teacher: 'ทีมอาจารย์ฝ่ายกิจการ', room: 'สนามโรงเรียน', color: 'bg-slate-600' },
    { id: '19', day: 'พุธ', time: '15:30 - 16:30', subjectCode: 'HLQ', subjectName: 'หะละเกาะฮ์อัลกุรอานยามเย็น', teacher: 'ครูหอพักประจำกลุ่ม', room: 'ลานหะละเกาะฮ์', color: 'bg-purple-600' },

    // วันพฤหัสบดี
    { id: '20', day: 'พฤหัสบดี', time: '08:30 - 10:30', subjectCode: 'ว32204', subjectName: 'ชีววิทยา 2', teacher: 'ดร.ฟารีดา', room: 'ห้องแล็บชีววิทยา', color: 'bg-green-600' },
    { id: '21', day: 'พฤหัสบดี', time: '10:30 - 11:30', subjectCode: 'อส32103', subjectName: 'ภาษาอาหรับชั้นสูง', teacher: 'อ.อุสมาน', room: 'ห้อง 301', color: 'bg-teal-600' },
    { id: '22', day: 'พฤหัสบดี', time: '11:30 - 12:30', subjectCode: 'REST', subjectName: 'พักกลางวัน & ละหมาดซุฮ์ริ', teacher: 'อาจารย์เวรประจำวัน', room: 'มัสยิดโรงเรียน', color: 'bg-amber-500' },
    { id: '23', day: 'พฤหัสบดี', time: '12:30 - 14:30', subjectCode: 'ค32102', subjectName: 'คณิตศาสตร์ประยุกต์', teacher: 'อ.อับดุลเลาะห์', room: 'ห้อง 301', color: 'bg-indigo-600' },
    { id: '24', day: 'พฤหัสบดี', time: '15:30 - 16:30', subjectCode: 'HLQ', subjectName: 'หะละเกาะฮ์อัลกุรอานยามเย็น', teacher: 'ครูหอพักประจำกลุ่ม', room: 'ลานหะละเกาะฮ์', color: 'bg-purple-600' },

    // วันศุกร์
    { id: '25', day: 'ศุกร์', time: '08:30 - 10:30', subjectCode: 'อส32104', subjectName: 'ตัฟซีรเเละอับลาก', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 301', color: 'bg-emerald-600' },
    { id: '26', day: 'ศุกร์', time: '10:30 - 11:30', subjectCode: 'อ32102', subjectName: 'การนำเสนอภาษาอังกฤษ', teacher: 'Teacher John', room: 'ห้อง 301', color: 'bg-blue-600' },
    { id: '27', day: 'ศุกร์', time: '11:30 - 13:30', subjectCode: 'JUMUAH', subjectName: 'เตรียมตัวละหมาดวันศุกร์ (คุตบะฮ์ & ละหมาดญุมอะฮ์)', teacher: 'อิหม่ามประจำมัสยิด', room: 'มัสยิดโรงเรียน', color: 'bg-emerald-700' },
    { id: '28', day: 'ศุกร์', time: '13:30 - 15:30', subjectCode: 'ACT', subjectName: 'ชุมนุมวิชาการและอิสลามศึกษา', teacher: 'อาจารย์ที่ปรึกษา', room: 'หอประชุมใหญ่', color: 'bg-sky-600' },
  ],
  'ม.6': [
    { id: 'm6-1', day: 'จันทร์', time: '08:30 - 09:30', subjectCode: 'อส33101', subjectName: 'อัลกุรอานเเละตัฟซีรชั้นสูง', teacher: 'อ.ซูไฮมี มะเซ็ง', room: 'ห้อง 601', color: 'bg-emerald-600' },
    { id: 'm6-2', day: 'จันทร์', time: '09:30 - 10:30', subjectCode: 'ค33101', subjectName: 'แคลคูลัสและสถิติ', teacher: 'อ.อับดุลเลาะห์', room: 'ห้อง 601', color: 'bg-indigo-600' },
    { id: 'm6-3', day: 'อังคาร', time: '08:30 - 10:30', subjectCode: 'ว33201', subjectName: 'ฟิสิกส์ 3 & ดาราศาสตร์', teacher: 'อ.อามีนะฮ์', room: 'ห้องแล็บวิทยาศาสตร์', color: 'bg-purple-600' },
    { id: 'm6-4', day: 'พุธ', time: '08:30 - 10:30', subjectCode: 'อ33101', subjectName: 'ภาษาอังกฤษเพื่อการสอบแข่งขัน (A-Level)', teacher: 'Teacher John', room: 'ห้อง 601', color: 'bg-blue-600' },
    { id: 'm6-5', day: 'พฤหัสบดี', time: '08:30 - 10:30', subjectCode: 'อส33102', subjectName: 'อูศูลุลฟิกฮ์เเละศาสนศาสตร์', teacher: 'อ.อุสมาน', room: 'ห้อง 601', color: 'bg-teal-600' },
    { id: 'm6-6', day: 'ศุกร์', time: '08:30 - 10:30', subjectCode: 'ก33901', subjectName: 'แนะแนวการศึกษาต่อและอาชีพ', teacher: 'อาจารย์ฝ่ายแนะแนว', room: 'ห้อง 601', color: 'bg-amber-600' },
  ]
};

export const ScheduleView: React.FC = () => {
  const { currentUser, isStudent, showSnackbar, isAdmin, students } = useApp();

  const matchedStudent = students?.find((s) => s.id === currentUser?.username || s.fullName === currentUser?.name);
  const studentYearStr = matchedStudent?.year
    ? typeof matchedStudent.year === 'string'
      ? matchedStudent.year.includes('ม.')
        ? matchedStudent.year
        : `ม.${matchedStudent.year}`
      : `ม.${matchedStudent.year}`
    : currentUser?.assignedClassOrDorm || 'ม.5';

  const defaultYear = isStudent && ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'].includes(studentYearStr)
    ? studentYearStr
    : 'ม.5';

  // Enable direct schedule editing for Admin, Teachers, Dorm Teachers, and Staff (NOT students)
  const canEditSchedule =
    !isStudent &&
    (currentUser?.role === 'Admin' ||
      currentUser?.role === 'อาจารย์' ||
      currentUser?.role === 'ครูหอพัก' ||
      isAdmin);

  const isAdminOrStaff = canEditSchedule;

  const [selectedYear, setSelectedYear] = useState<string>(defaultYear);

  useEffect(() => {
    if (isStudent && defaultYear) {
      setSelectedYear(defaultYear);
    }
  }, [isStudent, defaultYear]);
  const [selectedDay, setSelectedDay] = useState<'ทั้งหมด' | 'อาทิตย์' | 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์'>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  // Stateful schedule data with localStorage persistence
  const [allSchedules, setAllSchedules] = useState<Record<string, ScheduleSlot[]>>(() => {
    try {
      const saved = localStorage.getItem('khalifah_all_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SCHEDULES;
  });

  // Slot modal state (Add / Edit slot)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [slotForm, setSlotForm] = useState<{
    day: 'อาทิตย์' | 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์';
    time: string;
    subjectCode: string;
    subjectName: string;
    teacher: string;
    room: string;
    color: string;
    targetYear: string;
  }>({
    day: 'อาทิตย์',
    time: '08:30 - 09:30',
    subjectCode: '',
    subjectName: '',
    teacher: '',
    room: '',
    color: 'bg-emerald-500',
    targetYear: 'ม.5'
  });

  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<ScheduleSlot | null>(null);

  // Default sample images categorized per grade level (ม.1 - ม.6)
  const DEFAULT_SCHEDULE_IMAGES: ScheduleImage[] = [
    {
      id: 'sample-m1',
      name: 'ตารางเรียนตารางรูปภาพ_ม1.png',
      url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
      uploadedAt: '1 พ.ค. 2569 09:00 น.',
      uploadedBy: 'ฝ่ายวิชาการ',
      year: 'ม.1'
    },
    {
      id: 'sample-m2',
      name: 'ตารางเรียนตารางรูปภาพ_ม2.png',
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
      uploadedAt: '1 พ.ค. 2569 09:15 น.',
      uploadedBy: 'ฝ่ายวิชาการ',
      year: 'ม.2'
    },
    {
      id: 'sample-m3',
      name: 'ตารางเรียนตารางรูปภาพ_ม3.png',
      url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
      uploadedAt: '1 พ.ค. 2569 09:30 น.',
      uploadedBy: 'ฝ่ายวิชาการ',
      year: 'ม.3'
    },
    {
      id: 'sample-m4',
      name: 'ตารางเรียนตารางรูปภาพ_ม4.png',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      uploadedAt: '1 พ.ค. 2569 09:45 น.',
      uploadedBy: 'ฝ่ายวิชาการ',
      year: 'ม.4'
    },
    {
      id: 'sample-m5',
      name: 'ตารางเรียนตารางรูปภาพ_ม5.png',
      url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
      uploadedAt: '1 พ.ค. 2569 10:00 น.',
      uploadedBy: 'ฝ่ายวิชาการ',
      year: 'ม.5'
    },
    {
      id: 'sample-m6',
      name: 'ตารางเรียนตารางรูปภาพ_ม6.png',
      url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80',
      uploadedAt: '1 พ.ค. 2569 10:15 น.',
      uploadedBy: 'ฝ่ายวิชาการ',
      year: 'ม.6'
    }
  ];

  // Uploaded images state with localStorage persistence
  const [uploadedImages, setUploadedImages] = useState<ScheduleImage[]>(() => {
    try {
      const saved = localStorage.getItem('khalifah_schedule_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SCHEDULE_IMAGES;
  });

  const [activeImageModal, setActiveImageModal] = useState<ScheduleImage | null>(null);
  const [deleteConfirmImage, setDeleteConfirmImage] = useState<ScheduleImage | null>(null);

  // Grade level selector for image viewing tab
  const [imageYearFilter, setImageYearFilter] = useState<string>('auto'); // 'auto' follows selectedYear

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetYear, setUploadTargetYear] = useState<string>('ม.5');
  const [pendingFiles, setPendingFiles] = useState<{ id: string; name: string; url: string; file: File }[]>([]);

  // Auto-Scan States (Offline OCR & Table Auto-Organizer)
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const [scannedSlotsResult, setScannedSlotsResult] = useState<ScannedSlot[] | null>(null);
  const [scannedTargetYear, setScannedTargetYear] = useState<string>('ม.5');
  const [isScannedModalOpen, setIsScannedModalOpen] = useState(false);

  // Download CSV Schedule Template for target grade
  const handleDownloadScheduleTemplate = (grade: string) => {
    const headers = ['วัน', 'เวลา', 'รหัสวิชา', 'ชื่อวิชา', 'อาจารย์ผู้สอน', 'ห้องเรียน', 'สี'];
    const sampleRows = [
      ['จันทร์', '08:30 - 09:30', 'อส31101', 'อัลกุรอานเเละอัลฮะดีษ', 'อ.ซูไฮมี มะเซ็ง', 'ห้อง 101', 'bg-emerald-500'],
      ['จันทร์', '09:30 - 10:30', 'ค32101', 'คณิตศาสตร์พื้นฐาน', 'อ.อับดุลเลาะห์', 'ห้อง 101', 'bg-indigo-500'],
      ['จันทร์', '10:30 - 11:30', 'ว32201', 'วิทยาศาสตร์กายภาพ', 'ดร.ฟารีดะฮ์', 'ห้องแล็บ 1', 'bg-sky-500'],
      ['จันทร์', '11:30 - 12:30', 'REST', 'พักกลางวัน & ละหมาดซุฮ์ริ', 'อาจารย์เวรประจำวัน', 'มัสยิดโรงเรียน', 'bg-amber-500'],
      ['จันทร์', '12:30 - 13:30', 'ท32101', 'ภาษาไทยเพื่อการสื่อสาร', 'อ.วิภา', 'ห้อง 101', 'bg-orange-500'],
      ['อังคาร', '08:30 - 10:30', 'อ32101', 'ภาษาอังกฤษเข้มข้น', 'Teacher John', 'ห้อง 101', 'bg-blue-600'],
      ['อังคาร', '10:30 - 11:30', 'ส32101', 'ประวัติศาสตร์อิสลาม', 'อ.ฮาซัน', 'ห้อง 101', 'bg-amber-600'],
      ['พุธ', '08:30 - 10:30', 'อส32102', 'ฟิกฮ์เเละศาสนบัญญัติ', 'อ.อุสมาน', 'ห้อง 101', 'bg-teal-500'],
      ['พฤหัสบดี', '08:30 - 10:30', 'พ32101', 'สุขศึกษาและพลศึกษา', 'อ.มูฮัมหมัด', 'อาคารอเนกประสงค์', 'bg-rose-500'],
      ['ศุกร์', '08:30 - 10:30', 'ภ32101', 'ภาษาอาหรับเพื่อการสื่อสาร', 'อ.ซูไฮมี มะเซ็ง', 'ห้อง 101', 'bg-emerald-600']
    ];

    const csvContent = '\uFEFF' + [headers, ...sampleRows].map(e => e.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `เเบบฟอร์มตารางเรียน_ชั้น_${grade}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar(`ดาวน์โหลดแบบฟอร์มตารางเรียนชั้น ${grade} (CSV) เรียบร้อยแล้ว!`, 'success');
  };

  // Export current grade schedule to CSV
  const handleExportScheduleCSV = (grade: string) => {
    const slots = allSchedules[grade] || [];
    if (slots.length === 0) {
      showSnackbar(`ไม่มีข้อมูลตารางเรียนชั้น ${grade} สำหรับส่งออก`, 'warning');
      return;
    }

    const headers = ['วัน', 'เวลา', 'รหัสวิชา', 'ชื่อวิชา', 'อาจารย์ผู้สอน', 'ห้องเรียน', 'สี'];
    const rows = slots.map(s => [s.day, s.time, s.subjectCode, s.subjectName, s.teacher, s.room, s.color]);
    const csvContent = '\uFEFF' + [headers, ...rows].map(e => e.map(x => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ตารางเรียน_ชั้น_${grade}_ปี2569.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar(`ส่งออกตารางเรียนชั้น ${grade} เป็นไฟล์ CSV สำเร็จ!`, 'success');
  };

  // Import CSV Schedule file
  const handleImportScheduleCSV = (e: React.ChangeEvent<HTMLInputElement>, targetGrade: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          showSnackbar('ไฟล์ CSV ไม่มีข้อมูลรายวิชา', 'warning');
          return;
        }

        const slots: ScannedSlot[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
          const cleanCols = cols.map(c => c.replace(/^"|"$/g, '').trim());

          if (cleanCols.length >= 4) {
            const rawDay = cleanCols[0];
            let day: 'อาทิตย์' | 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์' = 'อาทิตย์';
            if (rawDay.includes('อาทิตย์') || rawDay.includes('Sun')) day = 'อาทิตย์';
            else if (rawDay.includes('จันทร์') || rawDay.includes('Mon')) day = 'จันทร์';
            else if (rawDay.includes('อังคาร') || rawDay.includes('Tue')) day = 'อังคาร';
            else if (rawDay.includes('พุธ') || rawDay.includes('Wed')) day = 'พุธ';
            else if (rawDay.includes('พฤหัส') || rawDay.includes('Thu')) day = 'พฤหัสบดี';
            else if (rawDay.includes('ศุกร์') || rawDay.includes('Fri')) day = 'ศุกร์';

            slots.push({
              id: `csv-${Date.now()}-${i}`,
              day,
              time: cleanCols[1] || '08:30 - 09:30',
              subjectCode: cleanCols[2] || 'GEN101',
              subjectName: cleanCols[3] || 'รายวิชา',
              teacher: cleanCols[4] || 'อ.ผู้สอน',
              room: cleanCols[5] || 'ห้องเรียน',
              color: cleanCols[6] || 'bg-emerald-500'
            });
          }
        }

        if (slots.length > 0) {
          setScannedSlotsResult(slots);
          setScannedTargetYear(targetGrade);
          setIsScannedModalOpen(true);
          showSnackbar(`นำเข้าข้อมูลจากไฟล์ CSV สำเร็จ ${slots.length} วิชา! กรุณาตรวจสอบและบันทึก`, 'success');
        } else {
          showSnackbar('ไม่สามารถอ่านข้อมูลวิชาจากไฟล์ CSV ได้ กรุณาตรวจสอบรูปแบบไฟล์', 'warning');
        }
      } catch (err) {
        console.error(err);
        showSnackbar('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV', 'error');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  // Trigger offline OCR scanner on schedule image
  const handleStartAutoScan = async (imageUrl: string, targetGrade: string) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStatusText('กำลังเตรียมระบบสแกนรูปตารางเรียน (Offline OCR Engine)...');

    try {
      const slots = await scanScheduleImageOffline(imageUrl, (pct, statusText) => {
        setScanProgress(pct);
        setScanStatusText(statusText);
      });

      setScannedSlotsResult(slots);
      setScannedTargetYear(targetGrade);
      setIsScanning(false);
      setIsScannedModalOpen(true);
      showSnackbar(`สแกนรูปตารางเรียนสำเร็จ! จัดเรียง ${slots.length} รายวิชาสำหรับชั้น ${targetGrade}`, 'success');
    } catch (err) {
      console.error(err);
      setIsScanning(false);
      showSnackbar('เกิดข้อผิดพลาดในการสแกนรูปภาพ กรุณาลองใหม่อีกครั้ง', 'error');
    }
  };

  // Apply scanned schedule directly into system table
  const handleApplyScannedSchedule = () => {
    if (!scannedSlotsResult || scannedSlotsResult.length === 0) {
      showSnackbar('ไม่มีข้อมูลตารางเรียนสำหรับการจัดเรียง', 'warning');
      return;
    }

    const convertedSlots: ScheduleSlot[] = scannedSlotsResult.map((s, idx) => ({
      id: `slot-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
      day: s.day,
      time: s.time,
      subjectCode: s.subjectCode || 'GEN101',
      subjectName: s.subjectName || 'วิชาเรียน',
      teacher: s.teacher || 'อ.ผู้สอน',
      room: s.room || 'ห้องเรียน',
      color: s.color || 'bg-emerald-500'
    }));

    setAllSchedules((prev) => {
      const updated = {
        ...prev,
        [scannedTargetYear]: convertedSlots
      };
      try {
        localStorage.setItem('khalifah_all_schedules', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });

    setSelectedYear(scannedTargetYear);
    setIsScannedModalOpen(false);
    setScannedSlotsResult(null);
    setIsUploadModalOpen(false);
    showSnackbar(`จัดเรียงและบันทึกตารางเรียนระดับชั้น ${scannedTargetYear} เข้าสู่ระบบเรียบร้อยแล้ว (${convertedSlots.length} คาบ)`, 'success');
  };

  const handleUpdateScannedSlot = (slotId: string, field: keyof ScannedSlot, value: string) => {
    setScannedSlotsResult((prev) => {
      if (!prev) return null;
      return prev.map((s) => (s.id === slotId ? { ...s, [field]: value } : s));
    });
  };

  const handleDeleteScannedSlot = (slotId: string) => {
    setScannedSlotsResult((prev) => {
      if (!prev) return null;
      return prev.filter((s) => s.id !== slotId);
    });
  };

  const handleAddScannedSlotDay = (day: 'อาทิตย์' | 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์') => {
    const newSlot: ScannedSlot = {
      id: `new-scan-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      day,
      time: '08:30 - 09:30',
      subjectCode: 'GEN',
      subjectName: 'วิชาใหม่',
      teacher: 'อาจารย์ผู้สอน',
      room: 'ห้องเรียน',
      color: 'bg-emerald-500'
    };
    setScannedSlotsResult((prev) => (prev ? [...prev, newSlot] : [newSlot]));
  };

  // Open modal with specific target grade
  const openUploadModal = (targetGrade?: string) => {
    const defaultGrade = targetGrade || (imageYearFilter !== 'auto' && imageYearFilter !== 'ทั้งหมด' ? imageYearFilter : selectedYear);
    setUploadTargetYear(defaultGrade);
    setPendingFiles([]);
    setIsUploadModalOpen(true);
  };

  const handlePendingFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        showSnackbar('กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น (.jpg, .png, .webp)', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setPendingFiles((prev) => [
            ...prev,
            {
              id: `pending-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name,
              url: dataUrl,
              file
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const submitUploadModal = () => {
    if (pendingFiles.length === 0) {
      showSnackbar('กรุณาเลือกไฟล์รูปภาพอย่างน้อย 1 รูป', 'warning');
      return;
    }

    const newEntries: ScheduleImage[] = pendingFiles.map((item) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: item.url,
      name: item.name,
      uploadedAt:
        new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + ' น.',
      uploadedBy: currentUser?.name || 'Admin',
      year: uploadTargetYear
    }));

    setUploadedImages((prev) => {
      const updated = [...newEntries, ...prev];
      try {
        localStorage.setItem('khalifah_schedule_images', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });

    showSnackbar(`เพิ่มรูปตารางเรียนสำหรับระดับชั้น ${uploadTargetYear} จำนวน ${newEntries.length} รูปเรียบร้อยแล้ว`, 'success');
    setIsUploadModalOpen(false);
    setPendingFiles([]);
  };

  const handleDeleteImage = (id: string) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      try {
        localStorage.setItem('khalifah_schedule_images', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
    if (activeImageModal?.id === id) {
      setActiveImageModal(null);
    }
    setDeleteConfirmImage(null);
    showSnackbar('ลบรูปภาพตารางเรียนเรียบร้อยแล้ว', 'info');
  };

  // Open modal to add new slot
  const handleOpenAddSlotModal = (day?: 'อาทิตย์' | 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์') => {
    setEditingSlot(null);
    setSlotForm({
      day: day || (selectedDay !== 'ทั้งหมด' ? selectedDay : 'อาทิตย์'),
      time: '08:30 - 09:30',
      subjectCode: '',
      subjectName: '',
      teacher: currentUser?.role === 'อาจารย์' ? currentUser.name : '',
      room: 'ห้อง 301',
      color: 'bg-emerald-500',
      targetYear: selectedYear
    });
    setIsSlotModalOpen(true);
  };

  // Open modal to edit existing slot
  const handleOpenEditSlotModal = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      day: slot.day,
      time: slot.time,
      subjectCode: slot.subjectCode,
      subjectName: slot.subjectName,
      teacher: slot.teacher,
      room: slot.room,
      color: slot.color,
      targetYear: selectedYear
    });
    setIsSlotModalOpen(true);
  };

  // Save (add or update) slot
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.subjectName.trim()) {
      showSnackbar('กรุณากรอกชื่อวิชา/กิจกรรม', 'warning');
      return;
    }

    setAllSchedules((prev) => {
      const currentYearList = prev[slotForm.targetYear] || [];
      let updatedList: ScheduleSlot[];

      if (editingSlot) {
        // Edit existing slot
        updatedList = currentYearList.map((s) =>
          s.id === editingSlot.id
            ? {
                ...s,
                day: slotForm.day,
                time: slotForm.time,
                subjectCode: slotForm.subjectCode || 'GEN',
                subjectName: slotForm.subjectName,
                teacher: slotForm.teacher || 'ไม่ระบุอาจารย์',
                room: slotForm.room || 'ไม่ระบุห้อง',
                color: slotForm.color
              }
            : s
        );
      } else {
        // Create new slot
        const newSlot: ScheduleSlot = {
          id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          day: slotForm.day,
          time: slotForm.time,
          subjectCode: slotForm.subjectCode || 'GEN',
          subjectName: slotForm.subjectName,
          teacher: slotForm.teacher || 'ไม่ระบุอาจารย์',
          room: slotForm.room || 'ไม่ระบุห้อง',
          color: slotForm.color
        };
        updatedList = [...currentYearList, newSlot];
      }

      const newSchedules = {
        ...prev,
        [slotForm.targetYear]: updatedList
      };

      try {
        localStorage.setItem('khalifah_all_schedules', JSON.stringify(newSchedules));
      } catch (err) {
        console.error(err);
      }

      return newSchedules;
    });

    showSnackbar(
      editingSlot
        ? `แก้ไขวิชา "${slotForm.subjectName}" เรียบร้อยแล้ว`
        : `เพิ่มวิชา "${slotForm.subjectName}" ในตารางเรียบร้อยแล้ว`,
      'success'
    );
    setIsSlotModalOpen(false);
    setEditingSlot(null);
  };

  // Delete slot
  const handleDeleteSlot = (slotId: string) => {
    setAllSchedules((prev) => {
      const currentYearList = prev[selectedYear] || [];
      const updatedList = currentYearList.filter((s) => s.id !== slotId);
      const newSchedules = {
        ...prev,
        [selectedYear]: updatedList
      };

      try {
        localStorage.setItem('khalifah_all_schedules', JSON.stringify(newSchedules));
      } catch (err) {
        console.error(err);
      }

      return newSchedules;
    });

    showSnackbar('ลบรายวิชาออกจากตารางเรียนเรียบร้อยแล้ว', 'info');
    setDeleteConfirmSlot(null);
  };

  // Filtered images list according to imageYearFilter
  const activeImageYear = imageYearFilter === 'auto' ? selectedYear : imageYearFilter;
  const filteredImages =
    activeImageYear === 'ทั้งหมด'
      ? uploadedImages
      : uploadedImages.filter((img) => img.year === activeImageYear);

  // Determine current day of week in Thai
  const currentDayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
  const dayNames: Record<number, 'อาทิตย์' | 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์' | null> = {
    0: 'อาทิตย์',
    1: 'จันทร์',
    2: 'อังคาร',
    3: 'พุธ',
    4: 'พฤหัสบดี',
    5: 'ศุกร์'
  };
  const todayThai = dayNames[currentDayIndex] || 'อาทิตย์';

  const scheduleList = allSchedules[selectedYear] || [];

  const daysList: ('อาทิตย์' | 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์')[] = [
    'อาทิตย์',
    'จันทร์',
    'อังคาร',
    'พุธ',
    'พฤหัสบดี',
    'ศุกร์'
  ];

  const filteredSlots = scheduleList.filter((slot) => {
    const matchDay = selectedDay === 'ทั้งหมด' || slot.day === selectedDay;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      slot.subjectName.toLowerCase().includes(q) ||
      slot.subjectCode.toLowerCase().includes(q) ||
      slot.teacher.toLowerCase().includes(q) ||
      slot.room.toLowerCase().includes(q) ||
      slot.time.toLowerCase().includes(q) ||
      slot.day.toLowerCase().includes(q);
    return matchDay && matchSearch;
  });

  const getDayBadgeColor = (day: string) => {
    switch (day) {
      case 'อาทิตย์': return 'from-red-500 to-rose-600 text-white';
      case 'จันทร์': return 'from-amber-400 to-yellow-500 text-amber-950';
      case 'อังคาร': return 'from-pink-500 to-rose-500 text-white';
      case 'พุธ': return 'from-emerald-500 to-teal-600 text-white';
      case 'พฤหัสบดี': return 'from-orange-500 to-amber-600 text-white';
      case 'ศุกร์': return 'from-sky-500 to-blue-600 text-white';
      default: return 'from-slate-600 to-slate-800 text-white';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-slate-800 text-white rounded-2xl p-3.5 sm:p-4 shadow-md border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl ring-1 ring-white/20 text-amber-300">
            <CalendarDays className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-300/30">
                ปีการศึกษา 2569
              </span>
              <span className="text-[10px] text-sky-200">
                ภาคเรียนที่ 1
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white mt-0.5 tracking-tight">
              ตารางเรียนและกิจกรรม (Class Schedule)
            </h1>
            <p className="text-[11px] text-sky-100/80">
              ตารางเรียนรายสัปดาห์ ห้องเรียน วิชาเรียน และอาจารย์ผู้สอน
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {/* CSV File Import Input */}
          <input
            type="file"
            id="csv-schedule-input"
            accept=".csv"
            onChange={(e) => handleImportScheduleCSV(e, selectedYear)}
            className="hidden"
          />

          {canEditSchedule && (
            <button
              type="button"
              onClick={() => handleDownloadScheduleTemplate(selectedYear)}
              className="px-3 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-white/20"
              title="ดาวน์โหลดไฟล์แบบฟอร์ม CSV สำหรับคนออกตารางเรียนนำไปกรอกข้อมูล"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>📥 โหลดแบบฟอร์ม ({selectedYear})</span>
            </button>
          )}

          {canEditSchedule && (
            <button
              type="button"
              onClick={() => document.getElementById('csv-schedule-input')?.click()}
              className="px-3 py-2 bg-teal-500 hover:bg-teal-600 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-teal-300"
              title="นำเข้าตารางเรียนจากไฟล์ CSV ที่กรอกข้อมูลเสร็จแล้ว"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>📤 นำเข้าไฟล์ CSV</span>
            </button>
          )}

          {canEditSchedule && (
            <button
              type="button"
              onClick={() => handleExportScheduleCSV(selectedYear)}
              className="px-3 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-white/20"
              title="ส่งออกไฟล์ตารางเรียน CSV ชั้นนี้"
            >
              <Share2 className="w-4 h-4 text-sky-200" />
              <span>ส่งออกตารางเรียน</span>
            </button>
          )}

          {canEditSchedule && (
            <button
              onClick={() => handleOpenAddSlotModal()}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-amber-300"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ เพิ่มวิชา ({selectedYear})</span>
            </button>
          )}

          {isAdminOrStaff && (
            <button
              onClick={() => openUploadModal(selectedYear)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-emerald-400"
            >
              <Upload className="w-4 h-4 text-amber-200" />
              <span>📷 เพิ่มรูปตารางเรียน ({selectedYear})</span>
            </button>
          )}

        </div>
      </div>

      {/* Filter and Day Selector Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Class Grade Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1">
              ระดับชั้น:
            </span>
            {['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'].map((grade) => {
              const isSelected = selectedYear === grade;
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => {
                    setSelectedYear(grade);
                    if (imageYearFilter === 'auto') setImageYearFilter('auto');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  ชั้น {grade}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาวิชา, รหัสวิชา, ครูผู้สอน หรือห้องเรียน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedDay('ทั้งหมด')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedDay === 'ทั้งหมด'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด (อา.-ศ.)
          </button>

          {daysList.map((day) => {
            const isToday = day === todayThai;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? `bg-gradient-to-r ${getDayBadgeColor(day)} shadow-xs ring-2 ring-sky-400/40`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>วัน{day}</span>
                {isToday && (
                  <span className="text-[9px] bg-white/30 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 rounded-full font-extrabold">
                    วันนี้
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Uploaded Schedule Images Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>รูปภาพตารางเรียน</span>
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950 px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-800">
                  {filteredImages.length} รูป {activeImageYear !== 'ทั้งหมด' ? `(ชั้น ${activeImageYear})` : '(ทุกชั้น)'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                เลือกระดับชั้นเพื่อดูรูปตารางเรียน หรือกดอัปโหลดรูปเพิ่มเติม
              </p>
            </div>
          </div>

          {isAdminOrStaff && (
            <button
              onClick={() => openUploadModal(activeImageYear !== 'ทั้งหมด' ? activeImageYear : selectedYear)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-emerald-500 shrink-0"
            >
              <Upload className="w-4 h-4 text-amber-300" />
              <span>+ อัปโหลดรูปตารางเรียน (Admin)</span>
            </button>
          )}
        </div>

        {/* Grade Level Filter Tabs for Images */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 mr-1">
            เลือกระดับชั้นดูรูป:
          </span>
          {['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'ทั้งหมด'].map((grade) => {
            const isActive = activeImageYear === grade;
            const count = grade === 'ทั้งหมด' 
              ? uploadedImages.length 
              : uploadedImages.filter(img => img.year === grade).length;

            return (
              <button
                key={grade}
                type="button"
                onClick={() => setImageYearFilter(grade)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-400/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{grade === 'ทั้งหมด' ? 'ดูทุกระดับชั้น' : `ชั้น ${grade}`}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredImages.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
            <FileImage className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              ยังไม่มีไฟล์รูปภาพตารางเรียน {activeImageYear !== 'ทั้งหมด' ? `ระดับชั้น ${activeImageYear}` : ''}
            </p>
            {isAdminOrStaff && (
              <button
                type="button"
                onClick={() => openUploadModal(activeImageYear !== 'ทั้งหมด' ? activeImageYear : selectedYear)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span>คลิกเพื่อเลือกระดับชั้น & อัปโหลดรูปภาพตารางเรียน</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 shadow-sm transition-all hover:shadow-md cursor-pointer"
                onClick={() => setActiveImageModal(img)}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-0.5 rounded-md shadow-xs">
                      ชั้น {img.year}
                    </span>
                    {isAdminOrStaff && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmImage(img);
                        }}
                        className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-all cursor-pointer"
                        title="ลบรูปภาพ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div className="text-white space-y-0.5 max-w-[55%]">
                      <p className="text-xs font-bold truncate">{img.name}</p>
                      <p className="text-[10px] text-slate-300">{img.uploadedAt}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {canEditSchedule && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartAutoScan(img.url, img.year);
                          }}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                          title="สแกนและจัดเรียงตารางเรียนอัตโนมัติ"
                        >
                          <Scan className="w-3.5 h-3.5 text-slate-950" />
                          <span>สแกนตาราง</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageModal(img);
                        }}
                        className="px-2 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3 text-amber-300" />
                        <span>ขยาย</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timetable Display Section */}
      {selectedDay === 'ทั้งหมด' ? (
        // Grid Grouped By Days
        <div className="space-y-6">
          {filteredSlots.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {searchQuery ? `ไม่พบวิชาเรียนที่ตรงกับคำค้นหา "${searchQuery}"` : `ยังไม่มีวิชาเรียนในตารางของระดับชั้น ${selectedYear}`}
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    ล้างคำค้นหา
                  </button>
                )}
                {canEditSchedule && (
                  <button
                    onClick={() => handleOpenAddSlotModal('จันทร์')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ เพิ่มวิชาใหม่ ({selectedYear})</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            daysList.map((day) => {
              const daySlots = filteredSlots.filter((s) => s.day === day);
              if (daySlots.length === 0 && searchQuery) return null;
              const isToday = day === todayThai;

              return (
                <div
                  key={day}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border ${
                    isToday
                      ? 'border-amber-400 dark:border-amber-500/60 ring-2 ring-amber-400/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 shadow-sm'
                  } overflow-hidden`}
                >
                  {/* Day Header */}
                  <div
                    className={`px-5 py-3 bg-gradient-to-r ${getDayBadgeColor(
                      day
                    )} flex items-center justify-between gap-2`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base tracking-tight">
                        วัน{day}
                      </span>
                      {isToday && (
                        <span className="px-2.5 py-0.5 bg-white text-slate-900 text-xs font-black rounded-full shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          วันนี้
                        </span>
                      )}
                      <span className="text-xs font-bold opacity-90 hidden sm:inline ml-2">
                        ({daySlots.length} คาบเรียน)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {canEditSchedule && (
                        <button
                          onClick={() => handleOpenAddSlotModal(day)}
                          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title={`เพิ่มวิชาสำหรับวัน${day}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ เพิ่มวิชา</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slots Grid */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {daySlots.length === 0 ? (
                      <div className="col-span-full py-6 text-center text-xs text-slate-400">
                        ไม่มีรายวิชาสำหรับวัน{day}
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 hover:shadow-md transition-all group relative"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-sky-500" />
                              <span>{slot.time}</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white ${slot.color}`}
                              >
                                {slot.subjectCode}
                              </span>
                              {canEditSchedule && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditSlotModal(slot)}
                                    className="p-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-lg transition-all cursor-pointer"
                                    title="แก้ไขวิชา/คาบเรียนนี้"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmSlot(slot)}
                                    className="p-1 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-lg transition-all cursor-pointer"
                                    title="ลบวิชานี้ออกจากตาราง"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors pr-2">
                            {slot.subjectName}
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-medium truncate max-w-[60%]">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{slot.teacher}</span>
                            </span>
                            <span className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-lg shrink-0">
                              <MapPin className="w-3 h-3" />
                              <span>{slot.room}</span>
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        // Single Day Cards
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div
              className={`px-4 py-2.5 rounded-2xl bg-gradient-to-r ${getDayBadgeColor(
                selectedDay
              )} inline-flex items-center gap-2`}
            >
              <span className="font-black text-base">วัน{selectedDay}</span>
              {selectedDay === todayThai && (
                <span className="px-2 py-0.5 bg-white text-slate-900 text-xs font-bold rounded-full">
                  วันนี้
                </span>
              )}
            </div>

            {canEditSchedule && (
              <button
                onClick={() => handleOpenAddSlotModal(selectedDay)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มวิชา (วัน{selectedDay})</span>
              </button>
            )}
          </div>

          {filteredSlots.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-bold">
                {searchQuery ? `ไม่พบวิชาเรียนที่ตรงกับคำค้นหา "${searchQuery}"` : `ไม่พบคาบเรียนในวัน${selectedDay} ของระดับชั้น ${selectedYear}`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  ล้างคำค้นหา
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 hover:shadow-md transition-all relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span>{slot.time}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white ${slot.color}`}
                      >
                        {slot.subjectCode}
                      </span>
                      {canEditSchedule && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditSlotModal(slot)}
                            className="p-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-lg transition-all cursor-pointer"
                            title="แก้ไขวิชา/คาบเรียนนี้"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmSlot(slot)}
                            className="p-1 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-lg transition-all cursor-pointer"
                            title="ลบวิชานี้ออกจากตาราง"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-base font-black text-slate-900 dark:text-slate-100 leading-snug">
                    {slot.subjectName}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium truncate max-w-[60%]">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{slot.teacher}</span>
                    </span>
                    <span className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-lg shrink-0">
                      <MapPin className="w-3 h-3" />
                      <span>{slot.room}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grade Selector & Image Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Upload className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">เพิ่มรูปภาพตารางเรียน</h3>
                  <p className="text-xs text-emerald-100">เลือกระดับชั้นและอัปโหลดไฟล์รูปตารางเรียน</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Step 1: Select Grade Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>1. เลือกระดับชั้นเรียน (Grade Level) *</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    ชั้นที่เลือก: {uploadTargetYear}
                  </span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'].map((grade) => {
                    const isSelected = uploadTargetYear === grade;
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setUploadTargetYear(grade)}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/30'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{grade}</span>
                        {isSelected && <span className="text-[9px] font-bold text-amber-200">✓ เลือก</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Images */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  2. เลือกไฟล์รูปภาพ (.jpg, .png, .webp) *
                </label>
                <label className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2 group">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 rounded-full group-hover:scale-110 transition-transform">
                    <FileImage className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      คลิกที่นี่ หรือ ลากไฟล์รูปภาพมาวาง
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      รองรับการเลือกหลายรูปพร้อมกันสำหรับชั้น {uploadTargetYear}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePendingFilesSelected}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Pending Preview List */}
              {pendingFiles.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>รูปภาพที่เลือกไว้ ({pendingFiles.length} รายการ):</span>
                    <button
                      type="button"
                      onClick={() => setPendingFiles([])}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      ล้างทั้งหมด
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pendingFiles.map((item) => (
                      <div
                        key={item.id}
                        className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group"
                      >
                        <img src={item.url} alt={item.name} className="w-full h-24 object-cover" />
                        <button
                          type="button"
                          onClick={() => removePendingFile(item.id)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="ลบออก"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="p-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] truncate font-medium">
                          {item.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>รองรับสแกนจัดเรียงตารางเรียนอัตโนมัติแบบ Offline</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={submitUploadModal}
                  disabled={pendingFiles.length === 0}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    pendingFiles.length > 0
                      ? 'bg-slate-700 hover:bg-slate-800 text-white'
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>บันทึกรูปภาพอย่างเดียว</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (pendingFiles.length === 0) {
                      showSnackbar('กรุณาเลือกไฟล์รูปภาพก่อนทำการสแกน', 'warning');
                      return;
                    }
                    submitUploadModal();
                    handleStartAutoScan(pendingFiles[0].url, uploadTargetYear);
                  }}
                  disabled={pendingFiles.length === 0}
                  className={`px-4 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    pendingFiles.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border border-emerald-500 active:scale-95'
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Scan className="w-4 h-4 text-amber-300" />
                  <span>✨ สแกนวิเคราะห์ & จัดเรียงตารางเรียนอัตโนมัติ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Image Preview Modal */}
      {activeImageModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <ImageIcon className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="truncate">
                  <h3 className="text-sm font-bold text-white truncate">{activeImageModal.name}</h3>
                  <span className="text-[11px] text-slate-400">
                    อัปโหลดเมื่อ: {activeImageModal.uploadedAt} • ชั้น {activeImageModal.year}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canEditSchedule && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetImg = activeImageModal;
                      setActiveImageModal(null);
                      handleStartAutoScan(targetImg.url, targetImg.year);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    <Scan className="w-3.5 h-3.5 text-slate-950" />
                    <span>สแกนจัดเรียงตารางเรียนชั้น {activeImageModal.year}</span>
                  </button>
                )}
                <a
                  href={activeImageModal.url}
                  download={activeImageModal.name}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด</span>
                </a>
                {isAdminOrStaff && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmImage(activeImageModal);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบรูป</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveImageModal(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/90">
              <img
                src={activeImageModal.url}
                alt={activeImageModal.name}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {deleteConfirmImage && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/80 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">ยืนยันการลบรูปภาพ</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">ระดับชั้น {deleteConfirmImage.year}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{deleteConfirmImage.name}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">อัปโหลดเมื่อ: {deleteConfirmImage.uploadedAt}</p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพตารางเรียนนี้ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmImage(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleDeleteImage(deleteConfirmImage.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                ยืนยันการลบรูปภาพ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Slot Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs text-amber-300">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {editingSlot ? 'แก้ไขวิชาในตารางเรียน' : 'เพิ่มวิชาใหม่ในตารางเรียน'}
                  </h3>
                  <p className="text-xs text-sky-100">
                    สำหรับระดับชั้น {slotForm.targetYear} • วัน{slotForm.day}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Year */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ระดับชั้น *
                  </label>
                  <select
                    value={slotForm.targetYear}
                    onChange={(e) => setSlotForm({ ...slotForm, targetYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="ม.1">ม.1</option>
                    <option value="ม.2">ม.2</option>
                    <option value="ม.3">ม.3</option>
                    <option value="ม.4">ม.4</option>
                    <option value="ม.5">ม.5</option>
                    <option value="ม.6">ม.6</option>
                  </select>
                </div>

                {/* Day */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    วันเรียน *
                  </label>
                  <select
                    value={slotForm.day}
                    onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="อาทิตย์">วันอาทิตย์</option>
                    <option value="จันทร์">วันจันทร์</option>
                    <option value="อังคาร">วันอังคาร</option>
                    <option value="พุธ">วันพุธ</option>
                    <option value="พฤหัสบดี">วันพฤหัสบดี</option>
                    <option value="ศุกร์">วันศุกร์</option>
                  </select>
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  เวลาเรียน (เช่น 08:30 - 09:30) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="08:30 - 09:30"
                  value={slotForm.time}
                  onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Subject Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    รหัสวิชา
                  </label>
                  <input
                    type="text"
                    placeholder="ว32202"
                    value={slotForm.subjectCode}
                    onChange={(e) => setSlotForm({ ...slotForm, subjectCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อวิชา / กิจกรรม *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="วิทยาการคำนวณและ AI"
                    value={slotForm.subjectName}
                    onChange={(e) => setSlotForm({ ...slotForm, subjectName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Teacher & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    อาจารย์ผู้สอน
                  </label>
                  <input
                    type="text"
                    placeholder="ดร.ฟารีดะฮ์"
                    value={slotForm.teacher}
                    onChange={(e) => setSlotForm({ ...slotForm, teacher: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ห้องเรียน / สถานที่
                  </label>
                  <input
                    type="text"
                    placeholder="ห้องคอมฯ 2"
                    value={slotForm.room}
                    onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Color Tag Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  สีป้ายกำกับวิชา
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'เขียว', value: 'bg-emerald-500' },
                    { name: 'ฟ้า', value: 'bg-sky-500' },
                    { name: 'น้ำเงิน', value: 'bg-blue-600' },
                    { name: 'ม่วง', value: 'bg-purple-600' },
                    { name: 'ชมพู', value: 'bg-pink-500' },
                    { name: 'ส้ม', value: 'bg-orange-500' },
                    { name: 'เหลือง/ทอง', value: 'bg-amber-500' },
                    { name: 'แดง', value: 'bg-rose-500' },
                    { name: 'เขียวเข้ม', value: 'bg-teal-600' },
                    { name: 'เทา', value: 'bg-slate-600' }
                  ].map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setSlotForm({ ...slotForm, color: c.value })}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold text-white transition-all cursor-pointer ${c.value} ${
                        slotForm.color === c.value ? 'ring-2 ring-offset-2 ring-slate-800 shadow-md scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{editingSlot ? 'บันทึกการแก้ไข' : 'เพิ่มวิชาในตาราง'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Slot Confirmation Dialog */}
      {deleteConfirmSlot && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/80 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">ยืนยันการลบวิชา</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">วัน{deleteConfirmSlot.day} • {selectedYear}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">{deleteConfirmSlot.subjectName} ({deleteConfirmSlot.subjectCode})</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">เวลา: {deleteConfirmSlot.time} • ครู: {deleteConfirmSlot.teacher}</p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชานี้ออกจากตารางเรียน {selectedYear}?
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmSlot(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSlot(deleteConfirmSlot.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                ยืนยันการลบวิชา
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanning Progress Overlay Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg animate-bounce">
              <Scan className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                <span>กำลังสแกนวิเคราะห์ตารางเรียน</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                สแกนอ่านข้อความและจัดเรียงเข้าตารางแบบ Offline ไม่ต้องพึ่ง API
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>{scanStatusText}</span>
                <span>{scanProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanned Schedule Review & Editor Modal */}
      {isScannedModalOpen && scannedSlotsResult && (
        <div className="fixed inset-0 z-[65] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shadow-md">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-full">
                      Offline Scan Ready
                    </span>
                    <span className="text-xs font-bold text-teal-200">
                      ระดับชั้น {scannedTargetYear}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                    ตรวจสอบและปรับแก้ตารางเรียนก่อนบันทึก
                  </h2>
                  <p className="text-xs text-emerald-100/90 hidden sm:block">
                    สแกนพบ {scannedSlotsResult.length} คาบเรียน คุณสามารถคลิกแก้ไขวิชา เวลา ครู หรือห้องเรียนได้ทันที
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScannedModalOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scanned Slots List grouped by Day */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 bg-slate-50/50 dark:bg-slate-950/50">
              {(['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'] as const).map((dayName) => {
                const daySlots = scannedSlotsResult.filter((s) => s.day === dayName);

                return (
                  <div
                    key={dayName}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                          วัน{dayName}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          ({daySlots.length} คาบ)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddScannedSlotDay(dayName)}
                        className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1 cursor-pointer bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เพิ่มคาบในวัน{dayName}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {daySlots.length === 0 ? (
                        <div className="col-span-full text-center py-4 text-xs text-slate-400">
                          ไม่มีคาบเรียนวัน{dayName} (กดปุ่มด้านบนเพื่อเพิ่ม)
                        </div>
                      ) : (
                        daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative group"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <input
                                type="text"
                                value={slot.time}
                                onChange={(e) => handleUpdateScannedSlot(slot.id, 'time', e.target.value)}
                                className="text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 outline-none w-28"
                                placeholder="08:30 - 09:30"
                              />
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={slot.subjectCode}
                                  onChange={(e) => handleUpdateScannedSlot(slot.id, 'subjectCode', e.target.value)}
                                  className="text-[10px] font-extrabold text-white bg-emerald-600 px-1.5 py-0.5 rounded-md w-16 text-center outline-none"
                                  placeholder="รหัสวิชา"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteScannedSlot(slot.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                                  title="ลบคาบนี้"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Subject Name */}
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="text-[10px] text-slate-400 font-bold block">ชื่อวิชา / กิจกรรม:</label>
                              </div>
                              <input
                                type="text"
                                value={slot.subjectName}
                                onChange={(e) => handleUpdateScannedSlot(slot.id, 'subjectName', e.target.value)}
                                className="w-full text-xs font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
                                placeholder="ชื่อวิชา"
                              />
                              {/* Quick Fill Subject Badges */}
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {['อัลกุรอาน', 'ฟิกฮ์', 'คณิตศาสตร์', 'วิทยาศาสตร์', 'ภาษาอาหรับ', 'ภาษาอังกฤษ', 'พักกลางวัน'].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => handleUpdateScannedSlot(slot.id, 'subjectName', preset)}
                                    className="text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-sky-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-md transition-colors cursor-pointer"
                                  >
                                    +{preset}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Teacher and Room */}
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <div>
                                <label className="text-[9px] text-slate-400 font-bold block">ผู้สอน:</label>
                                <input
                                  type="text"
                                  value={slot.teacher}
                                  onChange={(e) => handleUpdateScannedSlot(slot.id, 'teacher', e.target.value)}
                                  className="w-full text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 outline-none"
                                  placeholder="อาจารย์"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-400 font-bold block">ห้องเรียน:</label>
                                <input
                                  type="text"
                                  value={slot.room}
                                  onChange={(e) => handleUpdateScannedSlot(slot.id, 'room', e.target.value)}
                                  className="w-full text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 outline-none"
                                  placeholder="ห้อง"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>รวมทั้งหมด {scannedSlotsResult.length} รายวิชาที่จะจัดเข้าตารางชั้น {scannedTargetYear}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsScannedModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleApplyScannedSchedule}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 border border-emerald-500"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>⚡ ยืนยันและจัดเรียงเข้าตารางเรียน (ชั้น {scannedTargetYear})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
