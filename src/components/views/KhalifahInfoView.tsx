import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Megaphone,
  HelpCircle,
  Award,
  Search,
  Plus,
  Trash2,
  Edit,
  Pin,
  ExternalLink,
  Sparkles,
  Calendar,
  User,
  CheckCircle2,
  X,
  FileText,
  ShieldAlert,
  Download,
  Upload,
  Paperclip,
  FileDown
} from 'lucide-react';

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'announcement' | 'guide' | 'virtue' | 'faq' | 'rules';
  categoryLabel: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  isPinned?: boolean;
  imageUrl?: string;
  attachmentName?: string;
  tags?: string[];
}

const DEFAULT_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'art-001',
    title: '📢 ประกาศแจ้งเปิดใช้งานระบบเช็คชื่อละหมาดและหะละเกาะฮ์ ประจำปีการศึกษา 2569',
    category: 'announcement',
    categoryLabel: 'ประกาศข่าวสาร',
    summary: 'ยินดีต้อนรับนักเรียนและคณาจารย์ผู้ดูแลสู่ระบบ Khalifah Class System มหาวิทยาลัยฟาฏอนี',
    content: `อัลฮัมดุลิลลาฮ์ ขอต้อนรับนักเรียนทุนและนักเรียนในโครงการคอลีฟะฮ์ทุกคน เข้าร่วมใช้งานระบบบันทึกความประพฤติและวิถีชีวิตอิสลามประจำวัน

**วัตถุประสงค์โครงการ:**
1. ส่งเสริมการละหมาดตรงเวลาในมัสยิด/มุศ็อลลาประจำหอพัก
2. พัฒนาการอ่านอัลกุรอานและการเข้าร่วมกิจกรรมหะละเกาะฮ์อย่างสม่ำเสมอ
3. เสริมสร้างวินัย จิตอาสา และคุณธรรมจริยธรรมของนักเรียน

**การเช็คชื่อ:**
- การละหมาด: ซุบฮิ, ซุฮรี, อัศรี, มัฆริบ, อิชาอ์
- หะละเกาะฮ์: รอบประจำวัน
- นักเรียนสามารถใช้ฟีเจอร์ "เช็คละหมาดด้วยตนเอง" พร้อมถ่ายภาพยืนยัน location GPS ได้ในกรณีออกนอกสถานที่`,
    author: 'แอดมินฝ่ายพัฒนาศักยภาพนักเรียน',
    date: '4 สิงหาคม 2569',
    isPinned: true,
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800',
    tags: ['ประกาศหลัก', 'คอลีฟะฮ์', 'ปีการศึกษา2569']
  },
  {
    id: 'art-002',
    title: '🕌 ความสำคัญและคุณค่าของการละหมาดตรงเวลา (คุณธรรมประจำตัวคอลีฟะฮ์)',
    category: 'virtue',
    categoryLabel: 'คุณค่าการละหมาด',
    summary: 'การละหมาดเป็นเสาหลักของศาสนา และการละหมาดตรงเวลาคือการปฏิบัติที่เป็นที่รักยิ่ง ณ อัลลอฮ์ (ซ.บ.)',
    content: `ท่านร่อซูลุลลอฮ์ (ศ็อลลัลลอฮุอะลัยฮิวะสัลลัม) ได้ถูกถามว่า: "การงานใดที่เป็นที่รักยิ่ง ณ อัลลอฮ์?" ท่านตอบว่า: **"การละหมาดตรงตามเวลา"** (บันทึกโดย อัลบุคอรีย์ และมุสลิม)

**ประโยชน์ของการละหมาดตรงเวลาสำหรับนักเรียน:**
- ช่วยสร้างวินัยในการบริหารเวลาเรียนและการอ่านหนังสือ
- เพิ่มพูนบะรอกะฮ์ (ความสิริมงคล) ในชีวิต และจิตใจสงบมั่นคง
- คะแนนละหมาดตรงเวลาสะสมในระบบ จะนำไปประเมินทุนการศึกษาและเกียรติบัตรคอลีฟะฮ์ต้นแบบประจำปี`,
    author: 'คณะกรรมการฝ่ายศาสนธรรม',
    date: '3 สิงหาคม 2569',
    isPinned: false,
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=800',
    tags: ['ละหมาดตรงเวลา', 'ข้อคิดอิสลาม', 'สิริมงคล']
  },
  {
    id: 'art-003',
    title: '⚖️ เกณฑ์การตัดคะแนนความประพฤติและโบนัสพิเศษ (Score Rules)',
    category: 'guide',
    categoryLabel: 'คู่มือ & เกณฑ์คะแนน',
    summary: 'สรุปเกณฑ์คะแนนเริ่มต้น 100 คะแนน การหักคะแนนเมื่อละเมิดกฎ และโบนัสเพิ่มคะแนนความดี',
    content: `**คะแนนเริ่มต้น:** นักเรียนทุกคนมีคะแนนเริ่มต้น 100 คะแนน

**เกณฑ์การหักคะแนน:**
- ละหมาดสาย: -1 คะแนน
- ขาดละหมาด: -2 คะแนน
- มาหะละเกาะฮ์สาย/ขาด: -1 คะแนน
- เข้าเรียนสาย: -1 คะแนน
- ขาดเรียนโดยไม่มีใบลา: -2 คะแนน
- แต่งกายผิดระเบียบ / ส่งเสียงดังยามวิกาล: -2 คะแนน

**โบนัสเพิ่มคะแนนความดี (+1 ถึง +2 คะแนน):**
- ละหมาดครบ 5 เวลาตรงเวลาทั้งวัน
- มีความรู้และเข้าใจเนื้อหาหะละเกาะฮ์
- ทำจิตอาสาช่วยงานหอพัก/มหาวิทยาลัย
- ท่องจำอัลกุรอานเพิ่มขึ้นตามเป้าหมาย`,
    author: 'ฝ่ายปกครองและวินัยนักเรียน',
    date: '1 สิงหาคม 2569',
    isPinned: false,
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    tags: ['เกณฑ์คะแนน', 'ระเบียบวินัย', 'โบนัสคะแนน']
  },
  {
    id: 'art-004',
    title: '❓ คำถามที่พบบ่อย: ลาป่วย/ลากิจ หรือลืมเช็คชื่อ ต้องแจ้งใคร?',
    category: 'faq',
    categoryLabel: 'คำถามที่พบบ่อย',
    summary: 'ขั้นตอนการส่งใบลา และการส่งข้อความแจ้งแอดมินเพื่อแก้ไขข้อมูลย้อนหลัง',
    content: `**Q: หากป่วยหรือติดภารกิจทางบ้าน ต้องแจ้งลาอย่างไร?**
A: สามารถแจ้งอาจารย์ประจำชั้นหรือเจ้าหน้าที่ฝ่ายปกครองเพื่อลงบันทึกการลาป่วย/ลากิจในระบบ

**Q: สามารถตรวจสอบคะแนนสะสมย้อนหลังได้จากที่ไหน?**
A: นักเรียนสามารถเปิดดูได้จากเมนู "ดูผลการเรียน" ในแถบเมนูด้านข้าง จะแสดงคะแนนสะสม เหรียญเกียรติยศ และประวัติย้อนหลังทุกวัน`,
    author: 'ทีมงานฝ่ายบริการนักเรียน',
    date: '30 กรกฎาคม 2569',
    isPinned: false,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    tags: ['FAQ', 'แจ้งลา', 'ช่วยเหลือ']
  },
  {
    id: 'art-005',
    title: '📜 กฎระเบียบและข้อปฏิบัติประจำโครงการคอลีฟะฮ์ มหาวิทยาลัยฟาฏอนี',
    category: 'rules',
    categoryLabel: 'กฎระเบียบต่างๆ',
    summary: 'ระเบียบว่าด้วยวินัย การแต่งกาย การพักอาศัยในหอพัก และเกณฑ์คะแนนความประพฤติ',
    content: `**กฎระเบียบและข้อปฏิบัติสำคัญ:**
1. **การแต่งกาย:** นักเรียนต้องแต่งกายสุภาพ เรียบร้อย ตามหลักการศาสนาอิสลามตลอดเวลาในเขตรั้วมหาวิทยาลัยและหอพัก
2. **เวลาเข้าหอพัก:** ปิดประตูหอพักเวลา 22:00 น. หากมีเหตุจำเป็นต้องได้รับการอนุมัติจากอาจารย์หอพัก
3. **การเข้าละหมาดและหะละเกาะฮ์:** ต้องละหมาดตรงเวลา และเข้าร่วมหะละเกาะฮ์ประจำวันอย่างสม่ำเสมอ
4. **สิ่งเสพติดและอบายมุข:** ห้ามนำเข้าหรือเสพสิ่งเสพติด บุหรี่ บุหรี่ไฟฟ้า และสิ่งมึนเมาทุกชนิดอย่างเด็ดขาด
5. **การรักษาสะอาด:** ร่วมกิจกรรมบิ๊กคลีนนิ่ง และดูแลห้องพักส่วนตัวให้สะอาดเป็นระเบียบ`,
    author: 'ฝ่ายปกครองและระเบียบวินัย',
    date: '4 สิงหาคม 2569',
    isPinned: true,
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
    tags: ['กฎระเบียบ', 'วินัยหอพัก', 'ข้อปฏิบัติ']
  }
];

export const KhalifahInfoView: React.FC = () => {
  const { isAdmin, isTeacher, isStudent, setActiveTab, showSnackbar } = useApp();

  const [articles, setArticles] = useState<KnowledgeArticle[]>(() => {
    try {
      const saved = localStorage.getItem('khalifah_program_knowledge_articles');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ARTICLES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // Modal for Admin/Teacher Create/Edit Article
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);

  // Modal for Delete Confirmation (Admin & Teacher)
  const [articleToDelete, setArticleToDelete] = useState<KnowledgeArticle | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'announcement' | 'guide' | 'virtue' | 'faq' | 'rules'>('announcement');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('khalifah_program_knowledge_articles', JSON.stringify(articles));
    } catch (e) {
      console.error(e);
    }
  }, [articles]);

  const handleDownloadFile = (url: string, filename?: string) => {
    if (!url) {
      showSnackbar('ไม่พบลิงก์หรือไฟล์แนบสำหรับดาวน์โหลด', 'error');
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'khalifah_announcement_file';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSnackbar('เริ่มการดาวน์โหลดไฟล์เรียบร้อยแล้ว', 'success');
    } catch (e) {
      console.error(e);
      window.open(url, '_blank');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showSnackbar('ไฟล์มีขนาดใหญ่เกินไป (รองรับสูงสุด 15MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormImageUrl(result);
      setFormAttachmentName(file.name);
      showSnackbar(`อัปโหลดไฟล์ "${file.name}" เรียบร้อยแล้ว`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const filteredArticles = articles.filter((art) => {
    const matchCat = activeCategory === 'all' || art.category === activeCategory;
    const matchSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const pinnedArticles = filteredArticles.filter((a) => a.isPinned);
  const regularArticles = filteredArticles.filter((a) => !a.isPinned);

  const handleOpenCreateModal = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormCategory('announcement');
    setFormSummary('');
    setFormContent('');
    setFormImageUrl('');
    setFormAttachmentName('');
    setFormIsPinned(false);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (art: KnowledgeArticle) => {
    setEditingArticle(art);
    setFormTitle(art.title);
    setFormCategory(art.category);
    setFormSummary(art.summary);
    setFormContent(art.content);
    setFormImageUrl(art.imageUrl || '');
    setFormAttachmentName(art.attachmentName || '');
    setFormIsPinned(!!art.isPinned);
    setIsFormModalOpen(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showSnackbar('กรุณากรอกหัวข้อและเนื้อหาบทความ', 'error');
      return;
    }

    const catLabels: Record<string, string> = {
      announcement: 'ประกาศข่าวสาร',
      rules: 'กฎระเบียบต่างๆ',
      guide: 'คู่มือ & เกณฑ์คะแนน',
      virtue: 'คุณค่าการละหมาด',
      faq: 'คำถามที่พบบ่อย'
    };

    if (editingArticle) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editingArticle.id
            ? {
                ...a,
                title: formTitle,
                category: formCategory,
                categoryLabel: catLabels[formCategory] || 'ทั่วไป',
                summary: formSummary || formContent.slice(0, 100),
                content: formContent,
                imageUrl: formImageUrl || a.imageUrl,
                attachmentName: formAttachmentName || a.attachmentName,
                isPinned: formIsPinned
              }
            : a
        )
      );
      showSnackbar('อัปเดตข้อมูลความรู้/ประกาศเรียบร้อย', 'success');
    } else {
      const newArt: KnowledgeArticle = {
        id: `art-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        categoryLabel: catLabels[formCategory] || 'ทั่วไป',
        summary: formSummary || formContent.slice(0, 100),
        content: formContent,
        author: isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'อาจารย์ผู้ดูแล',
        date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800',
        attachmentName: formAttachmentName,
        isPinned: formIsPinned
      };
      setArticles((prev) => [newArt, ...prev]);
      showSnackbar('เพิ่มบทความ/ประกาศใหม่เรียบร้อย', 'success');
    }

    setIsFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!articleToDelete) return;
    const targetId = articleToDelete.id;
    setArticles((prev) => {
      const updated = prev.filter((a) => a.id !== targetId);
      try {
        localStorage.setItem('khalifah_program_knowledge_articles', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (selectedArticle?.id === targetId) {
      setSelectedArticle(null);
    }
    setArticleToDelete(null);
    showSnackbar('ลบบทความ/ประกาศออกจากระบบเรียบร้อยแล้ว', 'success');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-sky-200 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Khalifah Knowledge & Announcement Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ข่าวสาร/ความรู้ทั่วไป
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
              ศูนย์รวมประกาศข่าวสารสำคัญ กฎระเบียบคอลีฟะฮ์ คุณค่าของการละหมาดและอัลกุรอาน
              รวมถึงคำถามที่พบบ่อยจากฝ่ายปกครอง มหาวิทยาลัยฟาฏอนี
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {(isAdmin || isTeacher) && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มประกาศ/ความรู้ใหม่</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาประกาศ ข่าวสาร หรือคู่มือ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'ทั้งหมด', icon: BookOpen },
              { id: 'announcement', label: '📢 ประกาศข่าวสาร', icon: Megaphone },
              { id: 'rules', label: '📜 กฎระเบียบต่างๆ', icon: ShieldAlert },
              { id: 'guide', label: '📖 เกณฑ์คะแนน', icon: Award },
              { id: 'virtue', label: '🕌 คุณค่าการละหมาด', icon: Sparkles },
              { id: 'faq', label: '❓ คำถามพบบ่อย', icon: HelpCircle },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pinned Announcements Section */}
      {pinnedArticles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wide px-1">
            <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>ประกาศสำคัญปักหมุด (Pinned Announcements)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bg-gradient-to-br from-amber-50/80 to-sky-50/80 dark:from-slate-900 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-700/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 bg-amber-400 text-amber-950 text-[10px] font-black rounded-lg flex items-center gap-1 shadow-xs">
                      <Pin className="w-3 h-3 fill-amber-950" />
                      <span>{art.categoryLabel}</span>
                    </span>

                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {art.date}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {art.author}
                  </span>

                  <div className="flex items-center gap-2">
                    {art.imageUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFile(art.imageUrl!, art.attachmentName || art.title);
                        }}
                        className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-emerald-300/50"
                        title="ดาวน์โหลดไฟล์/รูปภาพประกอบ"
                      >
                        <Download className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>ดาวน์โหลดไฟล์</span>
                      </button>
                    )}
                    {(isAdmin || isTeacher) && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditModal(art)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-white dark:hover:bg-slate-800"
                          title="แก้ไขบทความ"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setArticleToDelete(art);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                          title="ลบบทความออกจากระบบ"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </div>
                    )}
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 group-hover:underline">
                      อ่านรายละเอียด <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Articles Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            บทความความรู้และประกาศทั้งหมด ({regularArticles.length})
          </span>
        </div>

        {regularArticles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-bold">ไม่พบบทความหรือประกาศตรงตามคำค้นหา</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                {art.imageUrl && (
                  <div className="h-36 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/20">
                      {art.categoryLabel}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile(art.imageUrl!, art.attachmentName || art.title);
                      }}
                      className="absolute bottom-2.5 right-2.5 px-2 py-1 bg-slate-900/80 hover:bg-emerald-600 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1 border border-white/20 transition-all"
                      title="ดาวน์โหลดไฟล์/รูปภาพ"
                    >
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>โหลดไฟล์</span>
                    </button>
                  </div>
                )}

                <div className="p-4 space-y-2 flex-1">
                  {!art.imageUrl && (
                    <span className="inline-block px-2 py-0.5 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 text-[10px] font-bold rounded-md mb-1">
                      {art.categoryLabel}
                    </span>
                  )}
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {art.date}
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {(isAdmin || isTeacher) && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(art);
                          }}
                          className="p-1 text-slate-400 hover:text-sky-600 cursor-pointer"
                          title="แก้ไข"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setArticleToDelete(art);
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                          title="ลบประกาศ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:underline ml-1">
                      อ่านต่อ &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Reading Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 p-6 relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedArticle.imageUrl && (
              <div className="space-y-2">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-52 object-cover rounded-2xl border border-slate-200 dark:border-slate-800"
                />
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 font-semibold overflow-hidden">
                    <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{selectedArticle.attachmentName || 'รูปภาพหน้าปก / ไฟล์แนบประกอบประกาศ'}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(selectedArticle.imageUrl!, selectedArticle.attachmentName || selectedArticle.title)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลดไฟล์</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-xs font-extrabold rounded-xl">
                  {selectedArticle.categoryLabel}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedArticle.date} • โดย {selectedArticle.author}
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                {selectedArticle.title}
              </h2>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                {selectedArticle.content}
              </div>

              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedArticle.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>

                {(isAdmin || isTeacher) && (
                  <button
                    onClick={() => setArticleToDelete(selectedArticle)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>ลบประกาศนี้</span>
                  </button>
                )}

                {(isAdmin || isTeacher) && (
                  <button
                    onClick={() => {
                      const artToEdit = selectedArticle;
                      setSelectedArticle(null);
                      handleOpenEditModal(artToEdit);
                    }}
                    className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin/Teacher Article Creation & Editing Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSaveArticle}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <span>{editingArticle ? 'แก้ไขประกาศ/บทความ' : 'เพิ่มประกาศ/ความรู้ใหม่'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  หัวข้อบทความ / ประกาศ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ประกาศกำหนดการกิจกรรมคอลีฟะฮ์..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  หมวดหมู่ *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="announcement">📢 ประกาศข่าวสาร</option>
                  <option value="rules">📜 กฎระเบียบต่างๆ</option>
                  <option value="guide">📖 คู่มือ & เกณฑ์คะแนน</option>
                  <option value="virtue">🕌 คุณค่าการละหมาด</option>
                  <option value="faq">❓ คำถามพบบ่อย</option>
                </select>
              </div>

              {/* Cover Image & File Attachment Section */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  📷 URL รูปภาพหน้าปก / ไฟล์แนบ (รองรับดาวน์โหลด)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1">ระบุ URL รูปภาพ:</span>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        if (!formAttachmentName) setFormAttachmentName('image-attachment');
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1">หรือ อัปโหลดไฟล์จากเครื่อง:</span>
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-100 dark:bg-sky-950/80 hover:bg-sky-200 dark:hover:bg-sky-900 border border-dashed border-sky-400 dark:border-sky-600 rounded-xl text-sky-800 dark:text-sky-200 font-bold cursor-pointer transition-all text-xs shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-sky-600" />
                      <span>อัปโหลดไฟล์/รูปภาพ</span>
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {formImageUrl && (
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 mt-1">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate font-mono">
                        {formAttachmentName || 'ไฟล์พร้อมสำหรับดาวน์โหลด'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(formImageUrl, formAttachmentName || 'test-file')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        title="ทดลองดาวน์โหลดไฟล์ที่แนบ"
                      >
                        <Download className="w-3 h-3" />
                        <span>ดาวน์โหลดไฟล์</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormImageUrl('');
                          setFormAttachmentName('');
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="นำไฟล์ออก"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  สรุปย่อ (Summary)
                </label>
                <input
                  type="text"
                  placeholder="คำอธิบายสั้นๆ แสดงในหน้าการ์ด..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  เนื้อหาฉบับเต็ม *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="รายละเอียดประกาศหรือบทความความรู้..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="pinCheck" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  📌 ปักหมุดบทความนี้ไว้ด้านบนสุด (Pinned Announcement)
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                บันทึกบทความ
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  ยืนยันการลบประกาศ/บทความ
                </h3>
                <p className="text-xs text-slate-500">
                  สิทธิ์ Admin และอาจารย์ผู้ดูแล
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                "{articleToDelete.title}"
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                คุณต้องการลบประกาศนี้ใช่หรือไม่? เมื่อลบแล้วบทความนี้จะถูกลบออกจากรายการทั้งหมด
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setArticleToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันการลบประกาศ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
