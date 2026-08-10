import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Student, StudentStatus } from '../../types';
import { postStudentRegistrationToGoogleScript } from '../../services/api';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  UserPlus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  Eye,
  Phone,
  Home,
  GraduationCap,
  Sparkles,
  X,
  Upload,
  Check
} from 'lucide-react';
import { calculateStudentTotalScore, getScoreBadgeInfo } from '../../utils/scoreCalculator';

export const StudentManagementView: React.FC = () => {
  const {
    students,
    records,
    scoreRules,
    orgSettings,
    addStudent,
    updateStudent,
    deleteStudent,
    setSelectedStudentId,
    setActiveTab,
    showConfirm,
    showSnackbar
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [dormFilter, setDormFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'id' | 'name'>('id');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState<Student>({
    id: '',
    fullName: '',
    nickname: '',
    futureCareer: '',
    faculty: 'คณะวิทยาศาสตร์และเทคโนโลยี',
    programme: 'วิทยาการคอมพิวเตอร์',
    year: 1,
    phone: '',
    parentPhone: '',
    dorm: 'หอพักอัลฟุรกอน (หลังที่ 1)',
    advisor: 'ดร.อุสมาน มะดีเยาะ',
    status: 'ปกติ',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    initialScore: 100
  });

  // Dorm options list
  const dorms = useMemo(() => {
    const set = new Set(students.map((s) => s.dorm));
    return ['All', 'InDorm', 'OutDorm', ...Array.from(set)];
  }, [students]);

  // Filter & Sort
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.includes(searchQuery) ||
          s.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.dorm.toLowerCase().includes(searchQuery.toLowerCase());

        // Dorm filter logic (หอพักใน vs หอพักนอก vs specific dorm)
        const dormStr = s.dorm.toLowerCase();
        let matchesDorm = dormFilter === 'All';
        if (dormFilter === 'InDorm') {
          matchesDorm = dormStr.includes('หอพักใน') || (!dormStr.includes('หอพักนอก') && !dormStr.includes('ภายนอก'));
        } else if (dormFilter === 'OutDorm') {
          matchesDorm = dormStr.includes('หอพักนอก') || dormStr.includes('ภายนอก');
        } else if (dormFilter !== 'All') {
          matchesDorm = s.dorm === dormFilter;
        }

        // Year filter logic (ชั้นมัธยมศึกษา ม.4 - ม.6 vs ชั้นปีที่ 1-4)
        const yrStr = s.year.toString();
        let matchesYear = yearFilter === 'All';
        if (yearFilter === 'HighSchool') {
          matchesYear = yrStr.includes('ม.') || yrStr.includes('มัธยม') || s.id.startsWith('M');
        } else if (yearFilter === 'M4') {
          matchesYear = yrStr.includes('ม.4') || yrStr.includes('มัธยมศึกษาปีที่ 4') || s.id.startsWith('M4');
        } else if (yearFilter === 'M5') {
          matchesYear = yrStr.includes('ม.5') || yrStr.includes('มัธยมศึกษาปีที่ 5') || s.id.startsWith('M5');
        } else if (yearFilter === 'M6') {
          matchesYear = yrStr.includes('ม.6') || yrStr.includes('มัธยมศึกษาปีที่ 6') || s.id.startsWith('M6');
        } else if (yearFilter !== 'All') {
          matchesYear = yrStr === yearFilter;
        }

        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

        return matchesSearch && matchesDorm && matchesYear && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          const scoreA = calculateStudentTotalScore(a.id, a.initialScore ?? 100, records, scoreRules);
          const scoreB = calculateStudentTotalScore(b.id, b.initialScore ?? 100, records, scoreRules);
          return scoreB - scoreA;
        } else if (sortBy === 'id') {
          return a.id.localeCompare(b.id);
        } else {
          return a.fullName.localeCompare(b.fullName, 'th');
        }
      });
  }, [students, searchQuery, dormFilter, yearFilter, statusFilter, sortBy, records, scoreRules]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      id: `6712100${Math.floor(10 + Math.random() * 80)}`,
      fullName: '',
      nickname: '',
      futureCareer: '',
      faculty: 'คณะวิทยาศาสตร์และเทคโนโลยี',
      programme: 'วิทยาการคอมพิวเตอร์',
      year: 1,
      phone: '081-000-0000',
      parentPhone: '089-000-0000',
      dorm: 'หอพักอัลฟุรกอน (หลังที่ 1)',
      advisor: 'ดร.อุสมาน มะดีเยาะ',
      status: 'ปกติ',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      initialScore: 100
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setIsModalOpen(true);
  };

  const handleModalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 10 * 1024 * 1024) {
        showSnackbar('ขนาดไฟล์รูปภาพเกิน 10MB กรุณาเลือกไฟล์ขนาดไม่เกิน 10MB', 'warning');
        return;
      }
      showSnackbar('กำลังประมวลผลรูปถ่าย...', 'info');
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.85);
      setFormData((prev) => ({ ...prev, photo: compressedDataUrl }));
      showSnackbar('อัปโหลดและบีบอัดรูปถ่ายเรียบร้อย (พร้อมบันทึกลง Google Sheet)', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปถ่าย', 'danger');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.fullName) return;

    if (editingStudent) {
      updateStudent(formData);
    } else {
      addStudent(formData);
      if (orgSettings.apiUrl) {
        postStudentRegistrationToGoogleScript(orgSettings.apiUrl, formData);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (student: Student) => {
    showConfirm({
      title: 'ยืนยันการลบข้อมูลนักเรียน',
      message: `คุณต้องการลบ ${student.fullName} (รหัส ${student.id}) ออกจากระบบหรือไม่?`,
      type: 'danger',
      confirmText: 'ลบนักเรียน',
      onConfirm: () => deleteStudent(student.id),
    });
  };

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('profile');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-600" />
            <span>จัดการข้อมูลนักเรียนห้องเรียนคอลีฟะห์</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            รายชื่อนักเรียน คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยฟาฏอนี ({students.length} คน)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold rounded-2xl text-sm shadow-md transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มนักเรียนใหม่</span>
        </button>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัสนักเรียน, ชื่อเล่น, หอพัก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-600 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Dorm Filter */}
          <select
            value={dormFilter}
            onChange={(e) => setDormFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="All">หอพักทั้งหมด</option>
            <option value="InDorm">🏢 หอพักใน (ภายในมหาวิทยาลัย)</option>
            <option value="OutDorm">🏠 หอพักนอก (ภายนอกมหาวิทยาลัย)</option>
            {dorms.filter((d) => d !== 'All' && d !== 'InDorm' && d !== 'OutDorm').map((d) => (
              <option key={d} value={d}>— {d}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="All">ทุกชั้นปี</option>
            <option value="M4">ชั้นมัธยมศึกษาปีที่ ม.4</option>
            <option value="M5">ชั้นมัธยมศึกษาปีที่ ม.5</option>
            <option value="M6">ชั้นมัธยมศึกษาปีที่ ม.6</option>
            <option value="1">ชั้นปีที่ 1</option>
            <option value="2">ชั้นปีที่ 2</option>
            <option value="3">ชั้นปีที่ 3</option>
            <option value="4">ชั้นปีที่ 4</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-600 outline-none text-slate-900 dark:text-slate-100"
          >
            <option value="id">เรียงตามรหัสนักเรียน</option>
            <option value="name">เรียงตามชื่อ</option>
          </select>
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-emerald-200 dark:ring-emerald-800">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {students.length === 0 ? 'ยังไม่มีรายชื่อนักเรียนในระบบ' : 'ไม่พบนักเรียนตามเงื่อนไขที่ค้นหา'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {students.length === 0
                ? 'แอดมินหลักสามารถกดปุ่ม "เพิ่มนักเรียนใหม่" เพื่อเริ่มบันทึกข้อมูลรายชื่อนักเรียนในห้องเรียนคอลีฟะห์ได้ทันที'
                : 'ลองปรับเปลี่ยนคำค้นหา หรือเปลี่ยนตัวกรองระดับชั้น/หอพักเพื่อดูรายชื่อนักเรียน'}
            </p>
          </div>
          {students.length === 0 && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold rounded-2xl text-xs shadow-md transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>เพิ่มนักเรียนคนแรก</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((s) => {
            const totalScore = calculateStudentTotalScore(s.id, s.initialScore ?? 100, records, scoreRules);
            const badge = getScoreBadgeInfo(totalScore);

            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={s.photo}
                      alt={s.fullName}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-600/30 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{s.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.colorClass}`}>
                          {badge.labelThai.split(' ')[0]}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {s.fullName} ({s.nickname})
                      </h3>

                      <p className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold mt-0.5">
                        {s.programme} - {typeof s.year === 'string' ? s.year : `ปี ${s.year}`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center gap-2">
                      <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.dorm}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>โทร: {s.phone} | ผปค: {s.parentPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">คะแนนความประพฤติ (เต็ม 100)</span>
                    <span className="text-base font-black text-slate-900 dark:text-slate-100">
                      {totalScore} <span className="text-xs font-normal text-slate-500">/ 100 คะแนน</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleViewProfile(s.id)}
                      className="p-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 transition-colors"
                      title="ดูโปรไฟล์และประวัติการละหมาด"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors"
                      title="แก้ไขข้อมูลนักเรียน"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="p-2 bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-colors"
                      title="ลบนักเรียน"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0 mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar pb-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      รหัสนักเรียน *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingStudent}
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ชื่อเล่น *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nickname}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-between">
                    <span>🎯 อาชีพในอนาคต (Future Career)</span>
                    <span className="text-[9px] bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300">แสดงผลขนาดใหญ่</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น วิศวกร AI, แพทย์เฉพาะทาง, สถาปนิก, นักธุรกิจ ฯลฯ"
                    value={formData.futureCareer || ''}
                    onChange={(e) => setFormData({ ...formData, futureCareer: e.target.value })}
                    className="w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      สาขาวิชา *
                    </label>
                    <select
                      value={formData.programme}
                      onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100"
                    >
                      <option value="วิทยาการคอมพิวเตอร์">วิทยาการคอมพิวเตอร์</option>
                      <option value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</option>
                      <option value="เทคโนโลยีดิจิทัลและมัลติมีเดีย">เทคโนโลยีดิจิทัลและมัลติมีเดีย</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ชั้นปี / ระดับการศึกษา *
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, year: isNaN(Number(val)) ? val : Number(val) });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      <optgroup label="ชั้นมัธยมศึกษา (ม.4 - ม.6)">
                        <option value="ม.4">ชั้นมัธยมศึกษาปีที่ 4 (ม.4)</option>
                        <option value="ม.5">ชั้นมัธยมศึกษาปีที่ 5 (ม.5)</option>
                        <option value="ม.6">ชั้นมัธยมศึกษาปีที่ 6 (ม.6)</option>
                      </optgroup>
                      <optgroup label="ระดับอุดมศึกษา (มหาวิทยาลัย)">
                        <option value={1}>ชั้นปีที่ 1</option>
                        <option value={2}>ชั้นปีที่ 2</option>
                        <option value={3}>ชั้นปีที่ 3</option>
                        <option value={4}>ชั้นปีที่ 4</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    หอพักนักเรียน (ระบุหอพักใน หรือ หอพักนอก) *
                  </label>
                  <div className="space-y-2">
                    <select
                      value={
                        formData.dorm.includes('หอพักใน')
                          ? 'หอพักใน'
                          : formData.dorm.includes('หอพักนอก') || formData.dorm.includes('ภายนอก')
                          ? 'หอพักนอก'
                          : 'อื่นๆ'
                      }
                      onChange={(e) => {
                        const sel = e.target.value;
                        if (sel === 'หอพักใน') {
                          setFormData({ ...formData, dorm: 'หอพักใน - หอพักอัลฟุรกอน (หลังที่ 1)' });
                        } else if (sel === 'หอพักนอก') {
                          setFormData({ ...formData, dorm: 'หอพักนอก - บ้านพัก/หอพักภายนอกมหาวิทยาลัย' });
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      <option value="หอพักใน">🏢 หอพักใน (ภายในมหาวิทยาลัย)</option>
                      <option value="หอพักนอก">🏠 หอพักนอก (ภายนอกมหาวิทยาลัย)</option>
                      <option value="อื่นๆ">✏️ ระบุชื่อหอพักเอง</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="เช่น หอพักใน - หอพักอันนูร (หลังที่ 2)"
                      value={formData.dorm}
                      onChange={(e) => setFormData({ ...formData, dorm: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      เบอร์โทรนักเรียน
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      เบอร์โทรผู้ปกครอง
                    </label>
                    <input
                      type="text"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    อาจารย์ที่ปรึกษา
                  </label>
                  <input
                    type="text"
                    value={formData.advisor}
                    onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    📸 รูปถ่ายประจำตัวนักเรียน (อัปโหลดไฟล์รองรับสูงสุด 10MB หรือระบุ URL)
                  </label>
                  <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <img
                      src={formData.photo || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80'}
                      alt="Student"
                      className="w-12 h-12 rounded-lg object-cover ring-1 ring-emerald-500/30 shrink-0"
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                      <input
                        type="text"
                        placeholder="ลิงก์รูปถ่าย (URL)"
                        value={formData.photo}
                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                        className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                      />
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>เลือกรูปถ่ายจากอุปกรณ์ (สูงสุด 10MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleModalPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    คะแนนสะสมเริ่มต้น (ทุกคนคะแนนเต็ม 100 คะแนน)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.initialScore ?? 100}
                      onChange={(e) => setFormData({ ...formData, initialScore: parseInt(e.target.value) || 100 })}
                      className="w-32 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 font-extrabold text-sm text-emerald-800 dark:text-emerald-300 rounded-xl outline-none"
                    />
                    <span className="text-xs text-slate-500">/ 100 คะแนนเต็ม</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-md transition-transform active:scale-95"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
