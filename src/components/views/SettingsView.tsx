import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { SystemLogo } from '../common/SystemLogo';
import { UserAccount, UserRole } from '../../types';
import { postUserAccountToGoogleScript, uploadLogoToGoogleDrive, postOrgSettingsToGoogleScript } from '../../services/api';
import {
  Settings,
  Save,
  RefreshCw,
  Moon,
  Sun,
  Database,
  Cloud,
  Download,
  ShieldCheck,
  Upload,
  Trash2,
  UserPlus,
  Users,
  Edit2,
  X,
  CheckCircle,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Code2,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Globe,
  Share2,
  Sparkles,
  Layout,
  Eye,
  Link,
  GraduationCap
} from 'lucide-react';

const PRESET_LOGOS = [
  {
    id: 'preset-1',
    name: 'ตราประทับการศึกษา',
    desc: 'หมวกรับปริญญาและดาวเกียรติยศ',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-2',
    name: 'ตราจันทร์เสี้ยวสถาบัน',
    desc: 'สัญลักษณ์อิสลามิกคอลีฟะห์',
    url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-3',
    name: 'ตราโล่และมหาวิทยาลัย',
    desc: 'โล่เกียรติยศวิชาการ มหาวิทยาลัย',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-4',
    name: 'ตราคัมภีร์และแสงปัญญา',
    desc: 'หนังสือ รัศมีปัญญาความรู้',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-5',
    name: 'ตราเหรียญทองคุณธรรม',
    desc: 'เหรียญเกียรติยศความประพฤติ',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-6',
    name: 'ตราโดมมัสยิดฟาฏอนี',
    desc: 'สถาปัตยกรรมมัสยิดฟาฏอนี',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=400&q=80'
  }
];

export const SettingsView: React.FC = () => {
  const {
    orgSettings,
    updateOrgSettings,
    scoreRules,
    updateScoreRules,
    userAccounts,
    addUserAccount,
    updateUserAccount,
    deleteUserAccount,
    darkMode,
    toggleDarkMode,
    resetToDefaultData,
    showConfirm,
    showSnackbar,
    pwaInstallPrompt,
    triggerPwaInstall,
    isAdmin
  } = useApp();

  const [orgForm, setOrgForm] = useState(orgSettings);
  const [rulesForm, setRulesForm] = useState(scoreRules);

  // User Account Modal state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [accForm, setAccForm] = useState<{
    name: string;
    username: string;
    role: UserRole;
    assignedClassOrDorm: string;
  }>({
    name: '',
    username: '',
    role: 'อาจารย์',
    assignedClassOrDorm: 'ม.5',
  });

  // Google Apps Script Connection Test & Setup Guide State
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const googleAppsScriptCode = `/**
 * Khalifah System - Google Apps Script Backend Code (ฉบับสมบูรณ์)
 * จัดเก็บข้อมูลระบบคอลีฟะห์ครบทุกมิติ:
 * 1. สรุปภาพรวมระบบ
 * 2. การตั้งค่าระบบและองค์กร (Org Settings & Score Rules)
 * 3. นักเรียน (Students)
 * 4. ครูผู้สอน (Teachers)
 * 5. ครูหอพัก (Dorm Teachers)
 * 6. แอดมินหลัก (Admins)
 * 7. ประวัติเช็คละหมาด หะละเกาะฮ์ วินัย และรูปถ่ายสด (Records)
 */

const SHEET_SUMMARY = 'สรุปภาพรวมระบบ';
const SHEET_SETTINGS = 'การตั้งค่าระบบ';
const SHEET_STUDENTS = 'นักเรียน';
const SHEET_TEACHERS = 'ครูผู้สอน';
const SHEET_DORM_TEACHERS = 'ครูหอพัก';
const SHEET_ADMINS = 'แอดมินหลัก';
const SHEET_RECORDS = 'ประวัติเช็คละหมาดและวินัย';

/**
 * เมนูสร้างตารางและซิงค์ข้อมูลอัตโนมัติเมื่อเปิด Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🕌 Khalifah System')
    .addItem('🚀 สร้างและเปิดใช้งานแท็บข้อมูลทั้งหมด', 'setupSheets')
    .addItem('📊 อัปเดตตารางสรุปภาพรวม', 'refreshSummary')
    .addToUi();
}

/**
 * เรียกใช้ฟังก์ชันนี้เพื่อสร้างแท็บ หัวตาราง และตั้งค่าระบบทั้งหมดทันที
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  initAllSheets(ss);
  
  try {
    SpreadsheetApp.getUi().alert('✅ สำเร็จ!', 'ระบบได้สร้างแท็บ [สรุปภาพรวมระบบ], [การตั้งค่าระบบ], [นักเรียน], [ครูผู้สอน], [ครูหอพัก], [แอดมินหลัก], และ [ประวัติเช็คละหมาดและวินัย] พร้อมโครงสร้างตารางครบถ้วนเรียบร้อยแล้ว!', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    Logger.log('Setup completed successfully from Apps Script editor!');
  }
}

function refreshSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  updateSummaryTimestamp(ss);
  try {
    SpreadsheetApp.getUi().alert('อัปเดตข้อมูลสรุปภาพรวมเรียบร้อยแล้ว');
  } catch(e) {}
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'init' || action === 'setup') {
    initAllSheets(ss);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'สร้างและจัดโครงสร้างแท็บใน Google Sheet เรียบร้อยแล้ว' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'ping') {
    initAllSheets(ss);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'ok', 
        message: 'เชื่อมต่อสำเร็จ! แท็บข้อมูลพร้อมใช้งาน (200 OK)',
        tabs: [SHEET_SUMMARY, SHEET_SETTINGS, SHEET_STUDENTS, SHEET_TEACHERS, SHEET_DORM_TEACHERS, SHEET_ADMINS, SHEET_RECORDS]
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 1. ดึงข้อมูลรายชื่อนักเรียนทั้งหมด
  if (action === 'getStudents') {
    const sheet = ss.getSheetByName(SHEET_STUDENTS);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    const data = sheet.getDataRange().getValues();
    const list = [];
    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      if (r[0] && r[1]) {
        list.push({
          id: String(r[0]),
          fullName: String(r[1] || ''),
          nickname: String(r[2] || ''),
          year: r[3] || 'ม.5',
          dorm: String(r[4] || ''),
          phone: String(r[5] || ''),
          parentName: String(r[6] || ''),
          parentPhone: String(r[7] || ''),
          faculty: String(r[8] || ''),
          programme: String(r[9] || ''),
          futureCareer: String(r[10] || ''),
          initialScore: Number(r[11]) || 100,
          status: 'ปกติ',
          photo: String(r[12] || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80'),
          advisor: String(r[13] || 'อาจารย์ที่ปรึกษา คอลีฟะห์')
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(list)).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. ดึงประวัติการละหมาด หะละเกาะฮ์ วินัย และรูปถ่ายเช็คสด
  if (action === 'getRecords') {
    const sheet = ss.getSheetByName(SHEET_RECORDS);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    const data = sheet.getDataRange().getValues();
    const list = [];
    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      if (r[0] && r[1]) {
        list.push({
          id: 'rec_' + r[0] + '_' + r[1] + '_' + i,
          date: String(r[0]),
          studentId: String(r[1]),
          studentName: String(r[2] || ''),
          prayer: {
            subuh: r[3] || 'Absent',
            zuhr: r[4] || 'Absent',
            asr: r[5] || 'Absent',
            maghrib: r[6] || 'Absent',
            isha: r[7] || 'Absent'
          },
          halaqah: {
            subuh: r[8] || 'Absent',
            asr: r[9] || 'Absent',
            isha: r[10] || 'Absent'
          },
          discipline: {
            lateActivity: r[11] === 'สาย',
            dress: r[12] === 'ผิดระเบียบ',
            phone: r[13] === 'ยึด',
            cleaning: r[14] === 'ขาด'
          },
          note: String(r[15] || ''),
          recorder: String(r[16] || ''),
          photoUrl: String(r[17] || ''),
          timestamp: String(r[18] || '')
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(list)).setMimeType(ContentService.MimeType.JSON);
  }

  // 3. ดึงรายชื่อบุคลากร (ครูผู้สอน, ครูหอพัก, แอดมิน)
  if (action === 'getUsers') {
    const users = [];
    const readSheetUsers = (sheetName, roleName) => {
      const sh = ss.getSheetByName(sheetName);
      if (!sh) return;
      const data = sh.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const r = data[i];
        if (r[0] && r[1]) {
          users.push({
            id: String(r[0]),
            name: String(r[1] || ''),
            username: String(r[2] || ''),
            assignedClassOrDorm: String(r[3] || '-'),
            phone: String(r[4] || ''),
            role: roleName,
            status: String(r[5] || 'ใช้งานปกติ')
          });
        }
      }
    };

    readSheetUsers(SHEET_TEACHERS, 'อาจารย์');
    readSheetUsers(SHEET_DORM_TEACHERS, 'ครูหอพัก');
    readSheetUsers(SHEET_ADMINS, 'Admin');

    return ContentService.createTextOutput(JSON.stringify(users)).setMimeType(ContentService.MimeType.JSON);
  }

  // 4. ดึงข้อมูลการตั้งค่าระบบและโลโก้องค์กร
  if (action === 'getSettings') {
    const sheet = ss.getSheetByName(SHEET_SETTINGS);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify(null)).setMimeType(ContentService.MimeType.JSON);
    }
    const data = sheet.getDataRange().getValues();
    const settings = {
      appName: String(data[1] ? data[1][1] : ''),
      programName: String(data[2] ? data[2][1] : ''),
      faculty: String(data[3] ? data[3][1] : ''),
      university: String(data[4] ? data[4][1] : ''),
      logoUrl: String(data[5] ? data[5][1] : ''),
      updatedAt: String(data[6] ? data[6][1] : '')
    };
    return ContentService.createTextOutput(JSON.stringify(settings)).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', action: action }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initAllSheets(ss);
    
    // 1. บันทึก/อัปเดตข้อมูลนักเรียนและรูปถ่าย (ลงแท็บ 'นักเรียน')
    if (data.action === 'registerStudent' || data.action === 'updateStudent' || data.action === 'updatePhoto' || (data.action === 'registerUser' && (data.role === 'นักเรียน' || !data.role))) {
      let sheet = ss.getSheetByName(SHEET_STUDENTS);
      const studentId = String(data.id || '');
      const photoUrl = data.photo || data.photoUrl || '';
      let isUpdated = false;

      // ตรวจสอบว่ามีรหัสนักเรียนเดิมอยู่ในตาราง [นักเรียน] หรือไม่
      if (studentId) {
        const rows = sheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (String(rows[i][0]).trim() === studentId.trim()) {
            if (data.fullName) sheet.getRange(i + 1, 2).setValue(data.fullName);
            if (data.nickname) sheet.getRange(i + 1, 3).setValue(data.nickname);
            if (data.year) sheet.getRange(i + 1, 4).setValue(data.year);
            if (data.dorm) sheet.getRange(i + 1, 5).setValue(data.dorm);
            if (data.phone) sheet.getRange(i + 1, 6).setValue(data.phone);
            if (data.parentName) sheet.getRange(i + 1, 7).setValue(data.parentName);
            if (data.parentPhone) sheet.getRange(i + 1, 8).setValue(data.parentPhone);
            if (data.faculty) sheet.getRange(i + 1, 9).setValue(data.faculty);
            if (data.programme) sheet.getRange(i + 1, 10).setValue(data.programme);
            if (data.futureCareer) sheet.getRange(i + 1, 11).setValue(data.futureCareer);
            if (data.initialScore) sheet.getRange(i + 1, 12).setValue(data.initialScore);
            if (photoUrl) sheet.getRange(i + 1, 13).setValue(photoUrl);
            if (data.advisor) sheet.getRange(i + 1, 14).setValue(data.advisor);
            sheet.getRange(i + 1, 15).setValue(new Date().toLocaleString('th-TH'));
            isUpdated = true;
            break;
          }
        }
      }

      // หากยังไม่มีในตาราง ให้เพิ่มแถวใหม่
      if (!isUpdated) {
        sheet.appendRow([
          data.id || '',
          data.fullName || '',
          data.nickname || '',
          data.year || '',
          data.dorm || '',
          data.phone || '',
          data.parentName || '',
          data.parentPhone || '',
          data.faculty || '',
          data.programme || '',
          data.futureCareer || '',
          data.initialScore || 100,
          photoUrl,
          data.advisor || 'อาจารย์ที่ปรึกษา คอลีฟะห์',
          new Date().toLocaleString('th-TH')
        ]);
      }

      updateSummaryTimestamp(ss);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: isUpdated
            ? 'อัปเดตข้อมูลและรูปถ่ายนักเรียนลงแท็บ [นักเรียน] ใน Google Sheet เรียบร้อย'
            : 'บันทึกข้อมูลนักเรียนลงแท็บ [นักเรียน] ใน Google Sheet เรียบร้อย'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. บันทึกบุคลากร (ครูผู้สอน, ครูหอพัก, แอดมินหลัก)
    if (data.action === 'registerUser') {
      const role = data.role || '';
      let targetSheetName = SHEET_TEACHERS;
      
      if (role === 'อาจารย์' || role === 'ครูผู้สอน') {
        targetSheetName = SHEET_TEACHERS;
      } else if (role === 'ครูหอพัก') {
        targetSheetName = SHEET_DORM_TEACHERS;
      } else if (role === 'Admin' || role === 'แอดมินหลัก') {
        targetSheetName = SHEET_ADMINS;
      }
      
      let sheet = ss.getSheetByName(targetSheetName);
      sheet.appendRow([
        data.id || '',
        data.name || data.fullName || '',
        data.username || '',
        data.assignedClassOrDorm || '-',
        data.phone || '',
        'ใช้งานปกติ',
        new Date().toLocaleString('th-TH')
      ]);
      
      updateSummaryTimestamp(ss);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'บันทึกข้อมูลผู้ใช้ลงในแท็บ [' + targetSheetName + '] เรียบร้อย' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. บันทึกผลการละหมาด หะละเกาะฮ์ วินัย และรูปถ่ายเช็คละหมาดสด (ลงแท็บ 'ประวัติเช็คละหมาดและวินัย')
    if (data.action === 'saveRecord' || data.action === 'quickCheckin') {
      let sheet = ss.getSheetByName(SHEET_RECORDS);
      const p = data.prayer || {};
      const h = data.halaqah || {};
      const d = data.discipline || {};
      
      let noteText = data.note || '';
      const photoLink = data.photoUrl || '';

      sheet.appendRow([
        data.date || new Date().toLocaleDateString('th-TH'),
        data.studentId || '',
        data.studentName || data.name || '',
        p.subuh || '-', p.zuhr || '-', p.asr || '-', p.maghrib || '-', p.isha || '-',
        h.subuh || '-', h.asr || '-', h.isha || '-',
        d.lateActivity ? 'สาย' : 'ปกติ',
        d.dress ? 'ผิดระเบียบ' : 'ปกติ',
        d.phone ? 'ยึด' : 'ปกติ',
        d.cleaning ? 'ขาด' : 'ปกติ',
        noteText,
        data.recorder || 'ระบบ',
        photoLink,
        new Date().toLocaleString('th-TH')
      ]);
      
      updateSummaryTimestamp(ss);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'บันทึกประวัติและรูปถ่ายลงในแท็บ [ประวัติเช็คละหมาดและวินัย] เรียบร้อย' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 4. บันทึกการตั้งค่าองค์กรและระบบ (ลงแท็บ 'การตั้งค่าระบบ')
    if (data.action === 'saveSettings') {
      let sheet = ss.getSheetByName(SHEET_SETTINGS);
      if (sheet) {
        sheet.getRange('B2').setValue(data.appName || '');
        sheet.getRange('B3').setValue(data.programName || '');
        sheet.getRange('B4').setValue(data.faculty || '');
        sheet.getRange('B5').setValue(data.university || '');
        sheet.getRange('B6').setValue(data.logoUrl || '');
        sheet.getRange('B7').setValue(new Date().toLocaleString('th-TH'));
      }
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'บันทึกการตั้งค่าลง Google Sheet เรียบร้อย' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 5. อัปโหลดรูปภาพ / โลโก้ ไปยัง Google Drive อัตโนมัติ (เปิดสิทธิ์สาธารณะ)
    if (data.action === 'uploadLogo' || data.action === 'uploadImage' || data.action === 'uploadFile') {
      let base64Data = data.base64Data || data.file || data.image || '';
      if (!base64Data) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, message: 'ไม่พบข้อมูล Base64 ของรูปภาพ' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      let mimeType = 'image/png';
      if (base64Data.indexOf('data:') === 0 && base64Data.indexOf(';base64,') !== -1) {
        const parts = base64Data.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        base64Data = parts[1];
      } else if (base64Data.indexOf('base64,') !== -1) {
        base64Data = base64Data.split('base64,')[1];
      }

      const decoded = Utilities.base64Decode(base64Data);
      const fileName = data.fileName || ('khalifah_upload_' + new Date().getTime() + '.png');
      const blob = Utilities.newBlob(decoded, mimeType, fileName);

      // สร้างหรือค้นหาโฟลเดอร์สำหรับเก็บไฟล์รูปภาพระบบใน Google Drive
      const folderName = 'Khalifah_System_Uploads';
      const folders = DriveApp.getFoldersByName(folderName);
      let folder;
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }

      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const fileId = file.getId();
      const directUrl = 'https://lh3.googleusercontent.com/d/' + fileId;

      // บันทึก URL ใหม่ลงในแท็บ [การตั้งค่าระบบ] ถ้าเป็นรูปโลโก้
      if (data.action === 'uploadLogo' || data.isLogo) {
        let sheet = ss.getSheetByName(SHEET_SETTINGS);
        if (sheet) {
          sheet.getRange('B6').setValue(directUrl);
          sheet.getRange('B7').setValue(new Date().toLocaleString('th-TH'));
        }
      }

      updateSummaryTimestamp(ss);

      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          url: directUrl,
          fileId: fileId,
          message: 'อัปโหลดรูปภาพลง Google Drive และบันทึกลง Google Sheet เรียบร้อยแล้ว'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'รับข้อมูลเรียบร้อย' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ฟังก์ชันสร้างและจัดรูปแบบแท็บทั้งหมดอัตโนมัติ
 */
function initAllSheets(ss) {
  // 1. แท็บสรุปภาพรวมระบบ (Dashboard Overview)
  let sheetSummary = ss.getSheetByName(SHEET_SUMMARY);
  if (!sheetSummary) {
    sheetSummary = ss.insertSheet(SHEET_SUMMARY, 0);
    
    sheetSummary.getRange('A1:H1').merge()
      .setValue('📊 Khalifah System - สรุปภาพรวมและสถิติข้อมูลระบบ')
      .setFontWeight('bold').setFontSize(14).setBackground('#0F766E').setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
      
    sheetSummary.getRange('A2:H2').merge()
      .setValue('ระบบซิงค์ข้อมูลอัตโนมัติกับแอปพลิเคชัน Khalifah System | อัปเดตล่าสุด: ' + new Date().toLocaleString('th-TH'))
      .setFontStyle('italic').setFontSize(10).setBackground('#F0FDFA').setFontColor('#0F766E')
      .setHorizontalAlignment('center');

    // Stats Cards Table
    sheetSummary.getRange('A4').setValue('นักเรียนทั้งหมด');
    sheetSummary.getRange('A5').setFormula("=COUNTA('" + SHEET_STUDENTS + "'!A2:A5000)");
    
    sheetSummary.getRange('C4').setValue('ครูผู้สอน');
    sheetSummary.getRange('C5').setFormula("=COUNTA('" + SHEET_TEACHERS + "'!A2:A5000)");
    
    sheetSummary.getRange('E4').setValue('ครูหอพัก');
    sheetSummary.getRange('E5').setFormula("=COUNTA('" + SHEET_DORM_TEACHERS + "'!A2:A5000)");
    
    sheetSummary.getRange('G4').setValue('แอดมินหลัก');
    sheetSummary.getRange('G5').setFormula("=COUNTA('" + SHEET_ADMINS + "'!A2:A5000)");

    // Style Stat Labels
    const labelRange = sheetSummary.getRange('A4:H4');
    labelRange.setFontWeight('bold').setBackground('#0284C7').setFontColor('#FFFFFF').setHorizontalAlignment('center');
    
    const valueRange = sheetSummary.getRange('A5:H5');
    valueRange.setFontWeight('bold').setFontSize(16).setBackground('#F0F9FF').setFontColor('#0369A1').setHorizontalAlignment('center');

    // Records Stats
    sheetSummary.getRange('A7:D7').merge().setValue('รายการบันทึกเวลา/ละหมาดทั้งหมด');
    sheetSummary.getRange('A8:D8').merge().setFormula("=COUNTA('" + SHEET_RECORDS + "'!A2:A20000)");
    
    sheetSummary.getRange('E7:H7').merge().setValue('บันทึกละหมาดซุบฮิตรงเวลา (ครั้ง)');
    sheetSummary.getRange('E8:H8').merge().setFormula("=COUNTIF('" + SHEET_RECORDS + "'!D2:D20000, \"Present\")");
    
    sheetSummary.getRange('A7:H7').setFontWeight('bold').setBackground('#059669').setFontColor('#FFFFFF').setHorizontalAlignment('center');
    sheetSummary.getRange('A8:H8').setFontWeight('bold').setFontSize(16).setBackground('#ECFDF5').setFontColor('#047857').setHorizontalAlignment('center');

    sheetSummary.getRange('A10:H10').merge()
      .setValue('💡 หมายเหตุ: ข้อมูลฉบับเต็มของแต่ละกลุ่มถูกจัดเก็บอย่างเป็นระเบียบในแท็บด้านล่าง [นักเรียน], [ครูผู้สอน], [ครูหอพัก], [แอดมินหลัก], [ประวัติเช็คละหมาดและวินัย], และ [การตั้งค่าระบบ]')
      .setFontSize(10).setFontColor('#475569').setHorizontalAlignment('center');
  }

  // 2. แท็บการตั้งค่าระบบ
  let sheetSettings = ss.getSheetByName(SHEET_SETTINGS);
  if (!sheetSettings) {
    sheetSettings = ss.insertSheet(SHEET_SETTINGS);
    sheetSettings.appendRow(['หัวข้อการตั้งค่า', 'ค่าปัจจุบัน']);
    sheetSettings.appendRow(['ชื่อระบบหลัก (App Name)', 'Khalifah Student Discipline Management System']);
    sheetSettings.appendRow(['ชื่อโปรแกรม/ห้องเรียน', 'โปรแกรมห้องเรียนคอลีฟะห์']);
    sheetSettings.appendRow(['คณะ/หน่วยงาน', 'คณะวิทยาศาสตร์และเทคโนโลยี']);
    sheetSettings.appendRow(['มหาวิทยาลัย/สถาบัน', 'มหาวิทยาลัยฟาฏอนี']);
    sheetSettings.appendRow(['โลโก้ระบบ (Logo URL)', 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=160&q=80']);
    sheetSettings.appendRow(['อัปเดตล่าสุด', new Date().toLocaleString('th-TH')]);

    const headerRange = sheetSettings.getRange('A1:B1');
    headerRange.setFontWeight('bold').setBackground('#475569').setFontColor('#FFFFFF').setHorizontalAlignment('center');
    sheetSettings.setFrozenRows(1);
  }

  // 3. แท็บนักเรียน
  createSheetIfNotExists(ss, SHEET_STUDENTS, [
    'รหัสนักเรียน', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'ระดับชั้น', 'หอพัก', 'เบอร์โทรศัพท์', 'ชื่อผู้ปกครอง', 'เบอร์ผู้ปกครอง', 'คณะ/แผนการเรียน', 'สาขาวิชา', 'อาชีพในอนาคต', 'คะแนนเริ่มต้น', 'ลิงก์รูปถ่าย', 'อาจารย์ที่ปรึกษา', 'เวลาบันทึก'
  ], '#0284C7');

  // 4. แท็บครูผู้สอน
  createSheetIfNotExists(ss, SHEET_TEACHERS, [
    'ไอดีผู้ใช้', 'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'ชั้น/วิชาที่รับผิดชอบ', 'เบอร์โทรศัพท์', 'สถานะ', 'เวลาบันทึก'
  ], '#0D9488');

  // 5. แท็บครูหอพัก
  createSheetIfNotExists(ss, SHEET_DORM_TEACHERS, [
    'ไอดีผู้ใช้', 'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'หอพักที่ดูแล', 'เบอร์โทรศัพท์', 'สถานะ', 'เวลาบันทึก'
  ], '#D97706');

  // 6. แท็บแอดมินหลัก
  createSheetIfNotExists(ss, SHEET_ADMINS, [
    'ไอดีผู้ใช้', 'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'ตำแหน่ง/สังกัด', 'เบอร์โทรศัพท์', 'สถานะ', 'เวลาบันทึก'
  ], '#4F46E5');

  // 7. แท็บประวัติเช็คละหมาดและวินัย (รวมรูปถ่ายเช็คสด)
  createSheetIfNotExists(ss, SHEET_RECORDS, [
    'วันที่', 'รหัสนักเรียน', 'ชื่อนักเรียน',
    'ซุบฮิ', 'ซุฮรี', 'อัศรี', 'มัฆริบ', 'อิชาอ์',
    'หะละเกาะฮ์-ซุบฮิ', 'หะละเกาะฮ์-อัศรี', 'หะละเกาะฮ์-อิชาอ์',
    'สายกิจกรรม', 'การแต่งกาย', 'โทรศัพท์', 'เวรทำความสะอาด',
    'หมายเหตุ', 'ผู้บันทึก', 'ลิงก์รูปถ่ายเช็คสด', 'เวลาบันทึก'
  ], '#059669');
}

function createSheetIfNotExists(ss, sheetName, headers, headerBgColor) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    
    // Style Header Row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold')
      .setBackground(headerBgColor || '#1E293B')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
    
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function updateSummaryTimestamp(ss) {
  const sheetSummary = ss.getSheetByName(SHEET_SUMMARY);
  if (sheetSummary) {
    sheetSummary.getRange('A2:H2').merge()
      .setValue('ระบบซิงค์ข้อมูลอัตโนมัติกับแอปพลิเคชัน Khalifah System | อัปเดตล่าสุด: ' + new Date().toLocaleString('th-TH'));
  }
}
`;

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setIsCopied(true);
    showSnackbar('คัดลอกโค้ด Google Apps Script เรียบร้อยแล้ว!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!orgForm.apiUrl) {
      showSnackbar('กรุณากรอก Google Apps Script Web App URL ก่อนกดทดสอบ', 'warning');
      return;
    }
    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      const testUrl = orgForm.apiUrl + (orgForm.apiUrl.includes('?') ? '&' : '?') + 'action=ping';
      const res = await fetch(testUrl, { method: 'GET' });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        setApiTestResult({
          success: true,
          message: data?.message || 'เชื่อมต่อสำเร็จ! Google Apps Script พร้อมใช้งาน (200 OK)',
        });
        showSnackbar('เชื่อมต่อกับ Google Apps Script สำเร็จ!', 'success');
      } else {
        setApiTestResult({
          success: false,
          message: `เชื่อมต่อไม่สำเร็จ (HTTP ${res.status} ${res.statusText}) กรุณาตรวจสอบการ Deploy Web App ว่าตั้งค่าสิทธิ์เป็น 'Anyone' (ทุกคน)`,
        });
        showSnackbar('เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบสิทธิ์การเข้าถึง Web App', 'error');
      }
    } catch (err: any) {
      setApiTestResult({
        success: false,
        message: `ไม่สามารถเชื่อมต่อได้ (${err.message || 'Network / CORS Error'}) โปรดตรวจสอบลิงก์ หรือเปลี่ยนการเข้าถึง Web App ให้เป็น 'Anyone' (ทุกคน)`,
      });
      showSnackbar('ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบลิงก์ Google Apps Script', 'error');
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgSettings(orgForm);
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    updateScoreRules(rulesForm);
  };

  // Helper to compress and convert image to embedded Base64 Data URL
  const resizeImageToBase64 = (file: File, maxWidth = 350, maxHeight = 350): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => reject('Load image failed');
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject('Read file failed');
      reader.readAsDataURL(file);
    });
  };

  // Image File Upload Handler (Direct Embedding into System & LocalStorage)
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showSnackbar('โปรดเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WEBP)', 'warning');
      return;
    }

    try {
      showSnackbar('กำลังฝังรูปภาพโลโก้ลงในระบบ...', 'info');
      const embeddedBase64 = await resizeImageToBase64(file, 350, 350);

      // 1. Set form state
      setOrgForm((prev) => ({ ...prev, logoUrl: embeddedBase64 }));

      // 2. Update system org settings state & save to LocalStorage directly
      const newSettings = { ...orgForm, logoUrl: embeddedBase64 };
      updateOrgSettings(newSettings);

      // 3. Asynchronously post to Google Apps Script if URL configured (non-blocking background save)
      if (orgForm.apiUrl) {
        postOrgSettingsToGoogleScript(orgForm.apiUrl, newSettings).catch((err) =>
          console.warn('Background sync org settings warning:', err)
        );
      }

      showSnackbar('ฝังรูปภาพโลโก้เข้าสู่ระบบเรียบร้อยแล้ว! โลโก้จะแสดงผลทันทีโดยไม่ต้องรอซิงค์', 'success');
    } catch (err) {
      console.error('Error embedding logo:', err);
      showSnackbar('ไม่สามารถประมวลผลไฟล์รูปภาพได้ โปรดลองอีกครั้ง', 'error');
    }
  };

  const handleClearLogo = () => {
    setOrgForm((prev) => ({ ...prev, logoUrl: '' }));
    updateOrgSettings({ ...orgForm, logoUrl: '' });
    showSnackbar('ลบรูปภาพโลโก้ออกเรียบร้อยแล้ว ระบบจะแสดงไอคอนค่าเริ่มต้น', 'info');
  };

  // Account Modal Handlers
  const openNewAccountModal = () => {
    setEditingAccId(null);
    setAccForm({
      name: '',
      username: '',
      role: 'อาจารย์',
      assignedClassOrDorm: '',
    });
    setIsAccountModalOpen(true);
  };

  const openEditAccountModal = (acc: UserAccount) => {
    setEditingAccId(acc.id);
    setAccForm({
      name: acc.name,
      username: acc.username,
      role: acc.role,
      assignedClassOrDorm: acc.assignedClassOrDorm || '',
    });
    setIsAccountModalOpen(true);
  };

  const handleSaveUserAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accForm.name || !accForm.username) {
      showSnackbar('กรุณากรอกชื่อและชื่อผู้ใช้งานให้ครบถ้วน', 'warning');
      return;
    }

    if (editingAccId) {
      updateUserAccount({
        id: editingAccId,
        name: accForm.name,
        username: accForm.username,
        role: accForm.role,
        assignedClassOrDorm: accForm.assignedClassOrDorm,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      });
    } else {
      const newAccId = `user-${Date.now()}`;
      addUserAccount({
        id: newAccId,
        name: accForm.name,
        username: accForm.username,
        role: accForm.role,
        assignedClassOrDorm: accForm.assignedClassOrDorm,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date().toISOString(),
      });

      // Sync user to Google Sheet if API URL exists
      if (orgSettings.apiUrl) {
        postUserAccountToGoogleScript(orgSettings.apiUrl, {
          id: newAccId,
          username: accForm.username,
          name: accForm.name,
          role: accForm.role,
          assignedClassOrDorm: accForm.assignedClassOrDorm,
        });
      }
    }

    setIsAccountModalOpen(false);
  };

  const handleDeleteUserAccount = (acc: UserAccount) => {
    showConfirm({
      title: 'ลบบัญชีผู้ใช้งาน',
      message: `คุณต้องการลบบัญชีผู้ใช้ ${acc.name} (${acc.role}) ใช่หรือไม่?`,
      type: 'danger',
      confirmText: 'ลบบัญชี',
      onConfirm: () => deleteUserAccount(acc.id),
    });
  };

  const handleResetData = () => {
    showConfirm({
      title: 'รีเซ็ตข้อมูลเป็นค่าเริ่มต้น',
      message: 'คุณต้องการล้างข้อมูลทั้งหมดและโหลดข้อมูลตัวอย่างเริ่มต้นของมหาวิทยาลัยฟาฏอนีหรือไม่?',
      type: 'warning',
      confirmText: 'รีเซ็ตข้อมูล',
      onConfirm: resetToDefaultData,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Page Title */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>ตั้งค่าระบบ อัปโหลดโลโก้ และจัดการบัญชีครู</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            สิทธิ์ผู้ดูแลระบบ (Admin) สามารถอัปโหลดโลโก้ เพิ่ม/แก้ไข/ลบบัญชีครูผู้สอน และปรับปรุงเกณฑ์วินัยได้
          </p>
        </div>
        <span className="hidden sm:inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold rounded-full text-xs">
          Admin Control
        </span>
      </div>

      {/* 1. Organisation & Logo Customization Form */}
      <form onSubmit={handleSaveOrg} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ข้อมูลหน่วยงาน และ โลโก้ของระบบ (System Branding)</span>
        </h3>

        {/* Dedicated Logo, Favicon & Social Share Preview Section */}
        <div className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-800/80 dark:to-emerald-950/20 rounded-3xl border border-slate-200 dark:border-slate-700/80 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>โลโก้ระบบ, แท็บเบราว์เซอร์ (Favicon) & รูปตั้มเนลสำหรับแชร์</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                รูปภาพนี้จะปรากฏในส่วนหัวของระบบ, ไอคอนขนาดเล็กบนแท็บเบราว์เซอร์ และแสดงเป็นรูปตัวอย่างเมื่อแชร์ลิงก์ให้ผู้อื่น
              </p>
            </div>
            {orgForm.logoUrl && (
              <button
                type="button"
                onClick={handleClearLogo}
                className="self-start sm:self-auto px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-rose-200 dark:border-rose-900"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>รีเซ็ตเป็นโลโก้เริ่มต้น</span>
              </button>
            )}
          </div>

          {/* Real-time Visual Previews (System Header, Browser Tab, Social Card) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>ตัวอย่างการแสดงผลในจุดต่างๆ (Live Preview)</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Preview 1: System Header Logo */}
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Layout className="w-3 h-3 text-sky-500" /> 1. โลโก้ในระบบ
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded font-semibold">Header Bar</span>
                </div>
                <div className="p-2.5 bg-sky-900 text-white rounded-xl flex items-center gap-2.5 shadow-inner">
                  <SystemLogo logoUrl={orgForm.logoUrl} size="md" glow={true} alt="Header Preview" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate leading-tight">{orgForm.appName || 'Khalifah System'}</div>
                    <div className="text-[9px] text-sky-200 truncate">{orgForm.programName || 'โปรแกรมห้องเรียนคอลีฟะห์'}</div>
                  </div>
                </div>
              </div>

              {/* Preview 2: Browser Tab Favicon */}
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-500" /> 2. แท็บเบราว์เซอร์
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-semibold">Favicon</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                  <div className="bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-sm max-w-full">
                    <div className="w-4 h-4 shrink-0 rounded overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                      {orgForm.logoUrl ? (
                        <img src={orgForm.logoUrl} alt="Favicon" className="w-full h-full object-contain" />
                      ) : (
                        <GraduationCap className="w-3 h-3 text-sky-600" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                      {orgForm.appName || 'Khalifah System'}
                    </span>
                    <X className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
                  </div>
                </div>
              </div>

              {/* Preview 3: Social Share Link Thumbnail */}
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-purple-500" /> 3. ตั้มเนลแชร์ลิงก์
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded font-semibold">Social Preview</span>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/80 shadow-sm">
                  <div className="h-16 w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative">
                    {orgForm.logoUrl ? (
                      <img src={orgForm.logoUrl} alt="Social Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                        <GraduationCap className="w-5 h-5 text-sky-600" />
                        <span>Khalifah System</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  </div>
                  <div className="p-2 space-y-0.5">
                    <div className="text-[9px] text-slate-400 font-semibold truncate">khalifah-app.ftu.ac.th</div>
                    <div className="text-[10px] font-bold text-slate-900 dark:text-slate-100 truncate">{orgForm.appName || 'Khalifah System'}</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      ระบบบันทึกพฤติกรรม เช็คชื่อละหมาด ({orgForm.university || 'มหาวิทยาลัยฟาฏอนี'})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload & Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
            {/* Method 1: Upload File */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>วิธีที่ 1: อัปโหลดรูปภาพจากอุปกรณ์</span>
              </span>
              <p className="text-[10px] text-slate-500">
                รองรับไฟล์ PNG, JPG, WEBP ระบบจะฝังรูปภาพลงในระบบทันที ไม่ต้องรออัปโหลดเซิร์ฟเวอร์
              </p>
              <label className="cursor-pointer w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm text-center">
                <Upload className="w-4 h-4" />
                <span>คลิกเลือกรูปภาพเพื่อฝังลงในระบบ</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Method 2: Paste Direct URL */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-sky-600" />
                <span>วิธีที่ 2: วาง URL ลิงก์รูปภาพโดยตรง</span>
              </span>
              <p className="text-[10px] text-slate-500">
                หากมีรูปภาพออนไลน์อยู่แล้ว สามารถวางลิงก์ Image URL ที่นี่ได้ทันที
              </p>
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={orgForm.logoUrl}
                onChange={(e) => setOrgForm({ ...orgForm, logoUrl: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Method 3: Preset Emblems & Badges */}
          <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>วิธีที่ 3: เลือกโลโก้และตราสัญลักษณ์สำเร็จรูป (Preset Badges)</span>
              </span>
              <span className="text-[10px] text-slate-400">คลิกที่ตราสัญลักษณ์เพื่อใช้งานทันที</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {PRESET_LOGOS.map((preset) => {
                const isSelected = orgForm.logoUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setOrgForm({ ...orgForm, logoUrl: preset.url });
                      updateOrgSettings({ ...orgForm, logoUrl: preset.url });
                      showSnackbar(`เลือกใช้งานตราสัญลักษณ์ "${preset.name}" เรียบร้อยแล้ว`, 'success');
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col items-center text-center space-y-1.5 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center border border-slate-200/60 dark:border-slate-700">
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {preset.name}
                      </div>
                      <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{preset.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อโปรแกรม/ระบบ *
            </label>
            <input
              type="text"
              required
              value={orgForm.programName}
              onChange={(e) => setOrgForm({ ...orgForm, programName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              คณะวิชา/โรงเรียน *
            </label>
            <input
              type="text"
              required
              value={orgForm.faculty}
              onChange={(e) => setOrgForm({ ...orgForm, faculty: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              สถาบัน/มหาวิทยาลัย *
            </label>
            <input
              type="text"
              required
              value={orgForm.university}
              onChange={(e) => setOrgForm({ ...orgForm, university: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Google Sheets & Apps Script Integration Settings Box */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>ตั้งค่าการเชื่อมต่อ Google Sheet (Google Apps Script Web App URL)</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    แอดมินหลัก
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ซิงค์ประวัตินักเรียนและผลการละหมาดไปยัง Google Sheet ของโรงเรียนโดยอัตโนมัติ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>{isGuideOpen ? 'ซ่อนคู่มือ & โค้ด' : '📋 ดูวิธีตั้งค่า & รับโค้ด Apps Script'}</span>
              {isGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Google Apps Script Web App URL (POST/GET Endpoint) *
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                type="text"
                required
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={orgForm.apiUrl}
                onChange={(e) => {
                  setOrgForm({ ...orgForm, apiUrl: e.target.value });
                  setApiTestResult(null);
                }}
                className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono outline-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/40"
              />

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingApi}
                className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
                <span>{isTestingApi ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
              </button>
            </div>
          </div>

          {/* Test Result Feedback */}
          {apiTestResult && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
                apiTestResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              {apiTestResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="font-bold block">
                  {apiTestResult.success ? 'ผลการทดสอบ: เชื่อมต่อสำเร็จ' : 'ผลการทดสอบ: ไม่สามารถเชื่อมต่อได้'}
                </span>
                <p className="text-[11px] leading-relaxed opacity-90">{apiTestResult.message}</p>
              </div>
            </div>
          )}

          {/* Collapsible Guide & Code Snippet Box */}
          {isGuideOpen && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  <span>ขั้นตอนการสร้างและตั้งค่า Google Apps Script (4 ขั้นตอน)</span>
                </h5>

                <button
                  type="button"
                  onClick={handleCopyScriptCode}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'คัดลอกโค้ดเรียบร้อย!' : 'คัดลอกโค้ด Apps Script'}</span>
                </button>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-extrabold text-emerald-800 dark:text-emerald-400">1. เปิด Google Sheet</div>
                  <p className="text-[11px] leading-relaxed">
                    สร้างไฟล์ Google Sheet ใหม่ จากนั้นกดเมนู <span className="font-bold">"ส่วนขยาย" (Extensions)</span> &gt; เลือก <span className="font-bold">"Apps Script"</span>
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-extrabold text-emerald-800 dark:text-emerald-400">2. วางโค้ดและกดสร้างแท็บตาราง</div>
                  <p className="text-[11px] leading-relaxed">
                    ลบโค้ดเดิมแล้ววางโค้ดด้านล่างลงไป จากนั้นเลือกฟังก์ชัน <span className="font-bold text-emerald-700 dark:text-emerald-300">setupSheets</span> ในแถบเครื่องมือด้านบนแล้วกด <span className="font-bold text-sky-600">"เรียกใช้" (Run)</span> เพื่อสร้างแท็บและตารางทั้งหมดทันที!
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-extrabold text-emerald-800 dark:text-emerald-400">3. ทำการ Deploy (การทำให้ใช้งาน)</div>
                  <p className="text-[11px] leading-relaxed">
                    กดปุ่ม <span className="font-bold">"Deploy" (ทำให้ใช้งานได้อย่างเป็นทางการ)</span> &gt; เลือก <span className="font-bold">"New Deployment" (รายการใหม่)</span> &gt; เลือกชนิด <span className="font-bold text-sky-600">"Web App" (เว็บแอป)</span>
                  </p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-300 dark:border-amber-800/80 space-y-1 text-amber-900 dark:text-amber-200">
                  <div className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>4. ตั้งค่าสิทธิ์สำคัญ (สำคัญที่สุด!)</span>
                  </div>
                  <ul className="text-[11px] space-y-0.5 list-disc list-inside">
                    <li>Execute as: <span className="font-bold">Me (ฉัน / อีเมลของคุณ)</span></li>
                    <li>Who has access: <span className="font-bold text-rose-600 dark:text-rose-400">Anyone (ทุกคน)</span></li>
                  </ul>
                </div>
              </div>

              {/* Google Sheet Tabs Breakdown Explanation */}
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
                <div className="font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>โครงสร้าง 6 แท็บใน Google Sheet ที่ระบบจะสร้างให้อัตโนมัติ:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-teal-700 dark:text-teal-400 block">1. 📊 สรุปภาพรวมระบบ</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">มีเซลล์สูตรสรุปยอดรวม ดูสถิตินักเรียน, ครู, ละหมาด ได้อย่างง่ายดาย</span>
                  </div>

                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-sky-700 dark:text-sky-400 block">2. 🎓 นักเรียน</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">เก็บบันทึกประวัตินักเรียน, ระดับชั้น, หอพัก, เบอร์ผู้ปกครอง</span>
                  </div>

                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">3. 👨‍🏫 ครูผู้สอน</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">เก็บบันทึกรายชื่ออาจารย์, Username, กลุ่มสาระที่ดูแล</span>
                  </div>

                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block">4. 🏢 ครูหอพัก</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">เก็บบันทึกรายชื่อครูหอพัก, ชื่อหอพักที่ดูแล, เบอร์ติดต่อ</span>
                  </div>

                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-indigo-700 dark:text-indigo-400 block">5. 🛡️ แอดมินหลัก</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">เก็บบันทึกรายชื่อผู้ดูแลระบบหลัก (Main Admins)</span>
                  </div>

                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-green-700 dark:text-green-400 block">6. 🕌 ประวัติเช็คละหมาดและวินัย</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">บันทึกการเช็คละหมาด 5 เวลา, หะละเกาะฮ์, การตัดคะแนน</span>
                  </div>
                </div>
              </div>

              {/* Code Preview Box */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Code.gs (Apps Script)</span>
                  <button
                    type="button"
                    onClick={handleCopyScriptCode}
                    className="hover:underline flex items-center gap-1 cursor-pointer text-emerald-600 dark:text-emerald-400 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>คลิกเพื่อคัดลอก</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl text-[10px] font-mono overflow-x-auto max-h-48 scrollbar-thin border border-slate-800 leading-relaxed">
                  {googleAppsScriptCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>บันทึกการตั้งค่าองค์กรและโลโก้</span>
        </button>
      </form>

      {/* 2. Admin User Account Management Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>จัดการบัญชีผู้ใช้งานสำหรับครูผู้สอนและเจ้าหน้าที่</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ผู้ดูแลระบบสามารถเพิ่มบัญชีอาจารย์ ครูหอพัก เพื่อให้สามารถจัดการบันทึกเวลาและวินัยของห้องเรียนได้
            </p>
          </div>

          <button
            onClick={openNewAccountModal}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold rounded-2xl text-xs transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มบัญชีครูผู้สอน</span>
          </button>
        </div>

        {/* User Account List Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              <tr>
                <th className="p-3">ชื่อ-นามสกุล</th>
                <th className="p-3">ชื่อผู้ใช้งาน (Username)</th>
                <th className="p-3">ตำแหน่ง/สิทธิ์</th>
                <th className="p-3">กลุ่ม/ห้องเรียน/หอพัก</th>
                <th className="p-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {userAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <img
                      src={acc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={acc.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span>{acc.name}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{acc.username}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        acc.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : acc.role === 'อาจารย์'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : acc.role === 'ครูหอพัก'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {acc.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{acc.assignedClassOrDorm || '-'}</td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => openEditAccountModal(acc)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {acc.role !== 'Admin' && (
                      <button
                        onClick={() => handleDeleteUserAccount(acc)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Adding/Editing User Account */}
      {isAccountModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>{editingAccId ? 'แก้ไขบัญชีผู้ใช้งาน' : 'เพิ่มบัญชีครูผู้สอน/อาจารย์ใหม่'}</span>
              </h3>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อ.นูรุดดีน สุไลมาน"
                  value={accForm.name}
                  onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อผู้ใช้งาน (Username สำหรับเข้าสู่ระบบ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น nuruddin"
                  value={accForm.username}
                  onChange={(e) => setAccForm({ ...accForm, username: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ตำแหน่ง/สิทธิ์การใช้งาน *
                </label>
                <select
                  value={accForm.role}
                  onChange={(e) => setAccForm({ ...accForm, role: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                >
                  <option value="อาจารย์">อาจารย์ที่ปรึกษา / ครูผู้สอน</option>
                  <option value="ครูหอพัก">ครูประจำหอพัก</option>
                  <option value="Admin">ผู้ดูแลระบบ (Admin)</option>
                  <option value="นักเรียน">นักเรียน (ดูแดชบอร์ดอย่างเดียว)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ห้องเรียนหรือหอพักที่รับผิดชอบ
                </label>
                <input
                  type="text"
                  placeholder="เช่น ม.4, ม.5, หอพักอัลฟุรกอน"
                  value={accForm.assignedClassOrDorm}
                  onChange={(e) => setAccForm({ ...accForm, assignedClassOrDorm: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold rounded-xl shadow-sm"
                >
                  {editingAccId ? 'อัปเดตบัญชี' : 'บันทึกบัญชีใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 3. Score Rules Customization Form */}
      <form onSubmit={handleSaveRules} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-4 h-4 text-amber-600" />
          <span>ปรับแต่งเกณฑ์คะแนนหัก/โบนัส (Score Rules Customization)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ละหมาดสาย (ครั้งละ)
            </label>
            <input
              type="number"
              value={rulesForm.latePrayer}
              onChange={(e) => setRulesForm({ ...rulesForm, latePrayer: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-rose-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ขาดละหมาด (ครั้งละ)
            </label>
            <input
              type="number"
              value={rulesForm.absentPrayer}
              onChange={(e) => setRulesForm({ ...rulesForm, absentPrayer: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-rose-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ขาดหะละเกาะฮ์ (ครั้งละ)
            </label>
            <input
              type="number"
              value={rulesForm.absentHalaqah}
              onChange={(e) => setRulesForm({ ...rulesForm, absentHalaqah: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-rose-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              แต่งกายผิดระเบียบ / ไม่ทำเวร
            </label>
            <input
              type="number"
              value={rulesForm.dressViolation}
              onChange={(e) => setRulesForm({ ...rulesForm, dressViolation: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-rose-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              โบนัสละหมาดครบ 5 เวลา
            </label>
            <input
              type="number"
              value={rulesForm.prayerCompleteBonus}
              onChange={(e) => setRulesForm({ ...rulesForm, prayerCompleteBonus: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              โบนัสท่องจำอัลกุรอาน
            </label>
            <input
              type="number"
              value={rulesForm.quranBonus}
              onChange={(e) => setRulesForm({ ...rulesForm, quranBonus: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-amber-300 font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>บันทึกเกณฑ์คะแนน</span>
        </button>
      </form>

      {/* 4. Theme & PWA Tools */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
          ธีมและสถานะการทำงาน PWA ออฟไลน์
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
              <span>{darkMode ? 'เปลี่ยนเป็นโหมดสว่าง (Light Mode)' : 'เปลี่ยนเป็นโหมดมืด (Dark Mode)'}</span>
            </button>

            {pwaInstallPrompt && (
              <button
                onClick={triggerPwaInstall}
                className="p-3 bg-amber-300 hover:bg-amber-200 text-amber-950 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>ติดตั้ง PWA App</span>
              </button>
            )}
          </div>

          <button
            onClick={handleResetData}
            className="px-4 py-2.5 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>รีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น</span>
          </button>
        </div>
      </div>
    </div>
  );
};
