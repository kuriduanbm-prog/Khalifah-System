import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { SystemLogo } from '../common/SystemLogo';
import { UserAccount, UserRole } from '../../types';
import { postUserAccountToGoogleScript } from '../../services/api';
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
  AlertCircle
} from 'lucide-react';

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
 * Khalifah System - Google Apps Script Backend Code
 * แยกแท็บการบันทึก: นักเรียน, ครูผู้สอน, ครูหอพัก, แอดมินหลัก, และประวัติเช็คละหมาด/วินัย
 * พร้อมหน้าสรุปภาพรวมและเมนูเรียกใช้งานสร้างตารางอัตโนมัติ
 */

const SHEET_SUMMARY = 'สรุปภาพรวมระบบ';
const SHEET_STUDENTS = 'นักเรียน';
const SHEET_TEACHERS = 'ครูผู้สอน';
const SHEET_DORM_TEACHERS = 'ครูหอพัก';
const SHEET_ADMINS = 'แอดมินหลัก';
const SHEET_RECORDS = 'ประวัติเช็คละหมาดและวินัย';

/**
 * เมนูสร้างตารางอัตโนมัติเมื่อเปิด Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🕌 Khalifah System')
    .addItem('🚀 สร้างและเปิดใช้งานแท็บข้อมูลทั้งหมด', 'setupSheets')
    .addItem('📊 อัปเดตตารางสรุปภาพรวม', 'refreshSummary')
    .addToUi();
}

/**
 * เรียกใช้ฟังก์ชันนี้ใน Apps Script หรือผ่านเมนูด้านบนเพื่อสร้างแท็บและตารางทั้งหมดทันที
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  initAllSheets(ss);
  
  try {
    SpreadsheetApp.getUi().alert('✅ สำเร็จ!', 'ระบบได้สร้างแท็บ [สรุปภาพรวมระบบ], [นักเรียน], [ครูผู้สอน], [ครูหอพัก], [แอดมินหลัก], และ [ประวัติเช็คละหมาดและวินัย] พร้อมตารางคำนวณเรียบร้อยแล้ว', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    Logger.log('Setup completed successfully from script editor!');
  }
}

function refreshSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  updateSummaryTimestamp(ss);
  try {
    SpreadsheetApp.getUi().alert('อัปเดตข้อมูลสรุปเรียบร้อย');
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
        tabs: [SHEET_SUMMARY, SHEET_STUDENTS, SHEET_TEACHERS, SHEET_DORM_TEACHERS, SHEET_ADMINS, SHEET_RECORDS]
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', action: action }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const contents = e.postData.contents;
    const data = JSON.parse(contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initAllSheets(ss);
    
    // 1. บันทึกข้อมูลนักเรียน (ลงแท็บ 'นักเรียน')
    if (data.action === 'registerStudent' || (data.action === 'registerUser' && (data.role === 'นักเรียน' || !data.role))) {
      let sheet = ss.getSheetByName(SHEET_STUDENTS);
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
        new Date().toLocaleString('th-TH')
      ]);
      updateSummaryTimestamp(ss);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'บันทึกข้อมูลลงในแท็บ [นักเรียน] เรียบร้อย' }))
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
        data.fullName || '',
        data.username || '',
        data.assignedClassOrDorm || '-',
        data.phone || '',
        'ใช้งานปกติ',
        new Date().toLocaleString('th-TH')
      ]);
      
      updateSummaryTimestamp(ss);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'บันทึกข้อมูลลงในแท็บ [' + targetSheetName + '] เรียบร้อย' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. บันทึกผลการละหมาด หะละเกาะฮ์ และวินัย (ลงแท็บ 'ประวัติเช็คละหมาดและวินัย')
    if (data.action === 'saveRecord' || data.action === 'quickCheckin') {
      let sheet = ss.getSheetByName(SHEET_RECORDS);
      const p = data.prayer || {};
      const h = data.halaqah || {};
      const d = data.discipline || {};
      
      sheet.appendRow([
        data.date || new Date().toLocaleDateString('th-TH'),
        data.studentId || '',
        data.name || '',
        p.subuh || '-', p.zuhr || '-', p.asr || '-', p.maghrib || '-', p.isha || '-',
        h.subuh || '-', h.asr || '-', h.isha || '-',
        d.lateActivity ? 'สาย' : 'ปกติ',
        d.dress ? 'ผิดระเบียบ' : 'ปกติ',
        d.phone ? 'ยึด' : 'ปกติ',
        d.cleaning ? 'ขาด' : 'ปกติ',
        data.note || '',
        data.recorder || 'ระบบ',
        new Date().toLocaleString('th-TH')
      ]);
      
      updateSummaryTimestamp(ss);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'บันทึกข้อมูลลงในแท็บ [ประวัติเช็คละหมาดและวินัย] เรียบร้อย' }))
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
      .setValue('💡 หมายเหตุ: ข้อมูลฉบับเต็มของแต่ละกลุ่มถูกจัดเก็บอย่างเป็นระเบียบในแท็บด้านล่าง [นักเรียน], [ครูผู้สอน], [ครูหอพัก], [แอดมินหลัก], และ [ประวัติเช็คละหมาดและวินัย]')
      .setFontSize(10).setFontColor('#475569').setHorizontalAlignment('center');
  }

  // 2. แท็บนักเรียน
  createSheetIfNotExists(ss, SHEET_STUDENTS, [
    'รหัสนักเรียน', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'ระดับชั้น', 'หอพัก', 'เบอร์โทรศัพท์', 'ชื่อผู้ปกครอง', 'เบอร์ผู้ปกครอง', 'คณะ/แผนการเรียน', 'สาขาวิชา', 'อาชีพในอนาคต', 'คะแนนเริ่มต้น', 'เวลาบันทึก'
  ], '#0284C7');

  // 3. แท็บครูผู้สอน
  createSheetIfNotExists(ss, SHEET_TEACHERS, [
    'ไอดีผู้ใช้', 'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'ชั้น/วิชาที่รับผิดชอบ', 'เบอร์โทรศัพท์', 'สถานะ', 'เวลาบันทึก'
  ], '#0D9488');

  // 4. แท็บครูหอพัก
  createSheetIfNotExists(ss, SHEET_DORM_TEACHERS, [
    'ไอดีผู้ใช้', 'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'หอพักที่ดูแล', 'เบอร์โทรศัพท์', 'สถานะ', 'เวลาบันทึก'
  ], '#D97706');

  // 5. แท็บแอดมินหลัก
  createSheetIfNotExists(ss, SHEET_ADMINS, [
    'ไอดีผู้ใช้', 'ชื่อ-นามสกุล', 'ชื่อผู้ใช้ (Username)', 'ตำแหน่ง/สังกัด', 'เบอร์โทรศัพท์', 'สถานะ', 'เวลาบันทึก'
  ], '#4F46E5');

  // 6. แท็บประวัติเช็คละหมาดและวินัย
  createSheetIfNotExists(ss, SHEET_RECORDS, [
    'วันที่', 'รหัสนักเรียน', 'ชื่อนักเรียน',
    'ซุบฮิ', 'ซุฮรี', 'อัศรี', 'มัฆริบ', 'อิชาอ์',
    'หะละเกาะฮ์-ซุบฮิ', 'หะละเกาะฮ์-อัศรี', 'หะละเกาะฮ์-อิชาอ์',
    'สายกิจกรรม', 'การแต่งกาย', 'โทรศัพท์', 'เวรทำความสะอาด',
    'หมายเหตุ', 'ผู้บันทึก', 'เวลาบันทึก'
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

  // Image File Upload Handler (FileReader to Base64)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showSnackbar('โปรดเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WEBP)', 'warning');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showSnackbar('ขนาดไฟล์รูปภาพเกิน 2MB โปรดเลือกไฟล์ขนาดเล็กลง', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setOrgForm((prev) => ({ ...prev, logoUrl: base64Url }));
      showSnackbar('อัปโหลดรูปภาพโลโก้สำเร็จ (อย่าลืมกดบันทึก)', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogo = () => {
    setOrgForm((prev) => ({ ...prev, logoUrl: '' }));
    showSnackbar('ลบรูปภาพโลโก้ออกแล้ว', 'info');
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

        {/* Custom Logo Upload Section */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            รูปภาพโลโก้ระบบ (จะแสดงเฉพาะรูปโลโก้ที่อัปโหลด หรือแสดงไอคอนการศึกษาระหว่างรอ)
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Logo Preview box */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <SystemLogo logoUrl={orgForm.logoUrl} size="xl" alt="Preview Logo" />
              <span className="text-[10px] text-slate-400 font-medium">ตัวอย่างโลโก้</span>
            </div>

            <div className="flex-1 space-y-3 w-full">
              {/* File upload button */}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>เลือกรูปโลโก้จากอุปกรณ์</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                </label>

                {orgForm.logoUrl && (
                  <button
                    type="button"
                    onClick={handleClearLogo}
                    className="px-3 py-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบรูปโลโก้</span>
                  </button>
                )}
              </div>

              {/* Direct Image URL input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  หรือวางที่อยู่รูปภาพ URL ของโลโก้
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={orgForm.logoUrl}
                  onChange={(e) => setOrgForm({ ...orgForm, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
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
