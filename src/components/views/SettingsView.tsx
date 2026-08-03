import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { SystemLogo } from '../common/SystemLogo';
import { UserAccount, UserRole } from '../../types';
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
  Image as ImageIcon
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

  const handleSaveUserAccount = (e: React.FormEvent) => {
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
      addUserAccount({
        id: `user-${Date.now()}`,
        name: accForm.name,
        username: accForm.username,
        role: accForm.role,
        assignedClassOrDorm: accForm.assignedClassOrDorm,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date().toISOString(),
      });
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>Google Apps Script REST API Endpoint (POST URL)</span>
          </label>
          <input
            type="text"
            required
            value={orgForm.apiUrl}
            onChange={(e) => setOrgForm({ ...orgForm, apiUrl: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono outline-none text-slate-900 dark:text-slate-100"
          />
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
