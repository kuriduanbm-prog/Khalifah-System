import React from 'react';
import {
  Stethoscope,
  Code2,
  GraduationCap,
  FlaskConical,
  Rocket,
  Plane,
  Palette,
  Utensils,
  Shield,
  Sparkles,
  Heart,
  Cpu,
  BookOpen,
  Award,
  Zap,
  Briefcase,
  Trophy,
  Sprout,
  Video,
  Globe
} from 'lucide-react';

export interface AnimatedCareerAvatarProps {
  career?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export type CareerType =
  | 'doctor'
  | 'engineer'
  | 'teacher'
  | 'scientist'
  | 'business'
  | 'pilot'
  | 'artist'
  | 'chef'
  | 'police'
  | 'sports'
  | 'farmer'
  | 'creator'
  | 'diplomat'
  | 'default';

export const CAREER_PRESETS = [
  { label: '🩺 แพทย์ / ศัลยแพทย์ / เภสัชกร', value: 'แพทย์ / ศัลยแพทย์ / เภสัชกร' },
  { label: '💻 วิศวกรซอฟต์แวร์ / นักพัฒนา AI', value: 'วิศวกรซอฟต์แวร์ และ AI' },
  { label: '📊 นักวิทยาศาสตร์ข้อมูล (Data Scientist)', value: 'นักวิทยาศาสตร์ข้อมูล (Data Scientist)' },
  { label: '🕌 อาจารย์ / นักวิชาการอิสลาม', value: 'อาจารย์ / นักวิชาการอิสลาม' },
  { label: '🏫 ครูผู้สอน / นักการศึกษา', value: 'ครูผู้สอน' },
  { label: '🚀 นักธุรกิจ / ผู้ประกอบการ CEO', value: 'นักธุรกิจ / ผู้ประกอบการ' },
  { label: '✈️ นักบิน / วิศวกรการบิน', value: 'นักบิน' },
  { label: '🎨 สถาปนิก / นักออกแบบกราฟิก', value: 'สถาปนิก / นักออกแบบ' },
  { label: '🎥 คอนเทนต์ครีเอเตอร์ / ช่างภาพ', value: 'คอนเทนต์ครีเอเตอร์' },
  { label: '👨‍🍳 เชฟ / ผู้เชี่ยวชาญอาหารฮาลาล', value: 'เชฟอาหารฮาลาล' },
  { label: '⚖️ นักกฎหมาย / ทนายความ / ผู้พิพากษา', value: 'นักกฎหมาย / ทนายความ' },
  { label: '🌐 นักการทูต / นักการสื่อสารต่างประเทศ', value: 'นักการทูต / นักการสื่อสารต่างประเทศ' },
  { label: '🌾 เกษตรกรยุคใหม่ (Smart Farmer)', value: 'เกษตรกรยุคใหม่ (Smart Farmer)' },
  { label: '🏀 นักกีฬาอาชีพ / โค้ช', value: 'นักกีฬาอาชีพ' },
  { label: '🔬 นักวิทยาศาสตร์ / นักวิจัย', value: 'นักวิทยาศาสตร์ / นักวิจัย' },
];

export function getCareerType(careerString?: string): CareerType {
  if (!careerString) return 'default';
  const c = careerString.toLowerCase();

  if (
    c.includes('หมอ') ||
    c.includes('แพทย์') ||
    c.includes('พยาบาล') ||
    c.includes('ศัลยแพทย์') ||
    c.includes('เภสัช') ||
    c.includes('ทันตแพทย์') ||
    c.includes('สัตวแพทย์') ||
    c.includes('สาธารณสุข') ||
    c.includes('doctor') ||
    c.includes('nurse') ||
    c.includes('physician') ||
    c.includes('surgeon') ||
    c.includes('dentist') ||
    c.includes('medical')
  ) {
    return 'doctor';
  }

  if (
    c.includes('วิศวกร') ||
    c.includes('โปรแกรมเมอร์') ||
    c.includes('นักพัฒนา') ||
    c.includes('ซอฟต์แวร์') ||
    c.includes('ไอที') ||
    c.includes('คอมพิวเตอร์') ||
    c.includes('ไซเบอร์') ||
    c.includes('engineer') ||
    c.includes('developer') ||
    c.includes('programmer') ||
    c.includes('software') ||
    c.includes('coder') ||
    c.includes('data') ||
    c.includes('ai')
  ) {
    return 'engineer';
  }

  if (
    c.includes('ครู') ||
    c.includes('อาจารย์') ||
    c.includes('ศาสนา') ||
    c.includes('โต๊ะครู') ||
    c.includes('บาบา') ||
    c.includes('อุสตาซ') ||
    c.includes('ดาอีย์') ||
    c.includes('นักวิชาการ') ||
    c.includes('teacher') ||
    c.includes('professor') ||
    c.includes('scholar') ||
    c.includes('educator')
  ) {
    return 'teacher';
  }

  if (
    c.includes('วิจัย') ||
    c.includes('วิทยาศาสตร์') ||
    c.includes('ดาราศาสตร์') ||
    c.includes('ชีววิทยา') ||
    c.includes('เคมี') ||
    c.includes('scientist') ||
    c.includes('researcher') ||
    c.includes('lab')
  ) {
    return 'scientist';
  }

  if (
    c.includes('ธุรกิจ') ||
    c.includes('ผู้ประกอบการ') ||
    c.includes('การตลาด') ||
    c.includes('บัญชี') ||
    c.includes('บริหาร') ||
    c.includes('การเงิน') ||
    c.includes('การตลาดดิจิทัล') ||
    c.includes('business') ||
    c.includes('ceo') ||
    c.includes('entrepreneur') ||
    c.includes('accountant') ||
    c.includes('finance')
  ) {
    return 'business';
  }

  if (
    c.includes('นักบิน') ||
    c.includes('กัปตัน') ||
    c.includes('อวกาศ') ||
    c.includes('การบิน') ||
    c.includes('สจ๊วต') ||
    c.includes('แอร์โฮสเตส') ||
    c.includes('pilot') ||
    c.includes('aviation') ||
    c.includes('astronaut')
  ) {
    return 'pilot';
  }

  if (
    c.includes('ออกแบบ') ||
    c.includes('สถาปนิก') ||
    c.includes('ศิลปิน') ||
    c.includes('กราฟิก') ||
    c.includes('designer') ||
    c.includes('architect') ||
    c.includes('artist') ||
    c.includes('creative')
  ) {
    return 'artist';
  }

  if (
    c.includes('เชฟ') ||
    c.includes('พ่อครัว') ||
    c.includes('แม่ครัว') ||
    c.includes('ทำอาหาร') ||
    c.includes('โภชนาการ') ||
    c.includes('ฮาลาล') ||
    c.includes('chef') ||
    c.includes('cook') ||
    c.includes('culinary')
  ) {
    return 'chef';
  }

  if (
    c.includes('ทหาร') ||
    c.includes('ตำรวจ') ||
    c.includes('ทนาย') ||
    c.includes('ผู้พิพากษา') ||
    c.includes('นิติศาสตร์') ||
    c.includes('กฎหมาย') ||
    c.includes('police') ||
    c.includes('lawyer') ||
    c.includes('judge') ||
    c.includes('military')
  ) {
    return 'police';
  }

  if (
    c.includes('กีฬา') ||
    c.includes('นักกีฬา') ||
    c.includes('โค้ช') ||
    c.includes('ฟุตบอล') ||
    c.includes('แบดมินตัน') ||
    c.includes('athlete') ||
    c.includes('coach') ||
    c.includes('sports')
  ) {
    return 'sports';
  }

  if (
    c.includes('เกษตร') ||
    c.includes('farmer') ||
    c.includes('ฟาร์ม') ||
    c.includes('สิ่งแวดล้อม') ||
    c.includes('พืช') ||
    c.includes('ประมง')
  ) {
    return 'farmer';
  }

  if (
    c.includes('ครีเอเตอร์') ||
    c.includes('youtuber') ||
    c.includes(' creator') ||
    c.includes('ช่างภาพ') ||
    c.includes('ถ่ายภาพ') ||
    c.includes('ตัดต่อ') ||
    c.includes('ยูทูปเบอร์') ||
    c.includes('เกมเมอร์')
  ) {
    return 'creator';
  }

  if (
    c.includes('การทูต') ||
    c.includes('นักการทูต') ||
    c.includes('วิเทศสัมพันธ์') ||
    c.includes('แปล') ||
    c.includes('การสื่อสาร') ||
    c.includes('diplomat')
  ) {
    return 'diplomat';
  }

  return 'default';
}

export const AnimatedCareerAvatar: React.FC<AnimatedCareerAvatarProps> = ({
  career,
  size = 'md',
  className = '',
  showBadge = true
}) => {
  const type = getCareerType(career);

  // Size mapping
  const sizeClasses = {
    xs: 'w-10 h-10',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const badgeSizeClasses = {
    xs: 'text-[8px] px-1.5 py-0.5',
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
    xl: 'text-base px-4 py-2'
  };

  // Config per career type
  const careerConfig = {
    doctor: {
      title: 'แพทย์ / บุคลากรการแพทย์',
      bgGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      hatColor: '#10B981',
      outfitColor: '#ECFDF5',
      accentColor: '#059669',
      floatingIcons: [
        <Heart key="1" className="w-3.5 h-3.5 text-rose-400 animate-ping absolute -top-1 -right-1" />,
        <Stethoscope key="2" className="w-4 h-4 text-emerald-200 animate-bounce absolute -bottom-1 -left-1" />
      ],
      emoji: '🩺',
      badgeBg: 'bg-emerald-500 text-white'
    },
    engineer: {
      title: 'วิศวกรซอฟต์แวร์ / IT',
      bgGradient: 'from-blue-500 via-indigo-600 to-violet-700',
      hatColor: '#3B82F6',
      outfitColor: '#EFF6FF',
      accentColor: '#2563EB',
      floatingIcons: [
        <Code2 key="1" className="w-4 h-4 text-amber-300 animate-pulse absolute -top-1 -right-1" />,
        <Cpu key="2" className="w-3.5 h-3.5 text-sky-200 animate-bounce absolute -bottom-1 -left-1" />
      ],
      emoji: '💻',
      badgeBg: 'bg-indigo-600 text-white'
    },
    teacher: {
      title: 'ผู้ทรงคุณวุฒิ / ครู / นักวิชาการ',
      bgGradient: 'from-amber-400 via-orange-500 to-amber-600',
      hatColor: '#D97706',
      outfitColor: '#FFFBEB',
      accentColor: '#B45309',
      floatingIcons: [
        <GraduationCap key="1" className="w-4 h-4 text-amber-200 animate-bounce absolute -top-1 -left-1" />,
        <BookOpen key="2" className="w-3.5 h-3.5 text-yellow-100 animate-pulse absolute -bottom-1 -right-1" />
      ],
      emoji: '📖',
      badgeBg: 'bg-amber-500 text-amber-950'
    },
    scientist: {
      title: 'นักวิทยาศาสตร์ / นักวิจัย',
      bgGradient: 'from-purple-500 via-fuchsia-600 to-pink-600',
      hatColor: '#8B5CF6',
      outfitColor: '#F5F3FF',
      accentColor: '#7C3AED',
      floatingIcons: [
        <FlaskConical key="1" className="w-4 h-4 text-pink-300 animate-bounce absolute -top-1 -right-1" />,
        <Sparkles key="2" className="w-3.5 h-3.5 text-purple-200 animate-spin absolute -bottom-1 -left-1" />
      ],
      emoji: '🧪',
      badgeBg: 'bg-purple-600 text-white'
    },
    business: {
      title: 'นักธุรกิจ / นักการเงิน',
      bgGradient: 'from-sky-500 via-cyan-600 to-blue-700',
      hatColor: '#0284C7',
      outfitColor: '#F0F9FF',
      accentColor: '#0369A1',
      floatingIcons: [
        <Rocket key="1" className="w-4 h-4 text-amber-300 animate-bounce absolute -top-1 -right-1" />,
        <Briefcase key="2" className="w-3.5 h-3.5 text-sky-200 animate-pulse absolute -bottom-1 -left-1" />
      ],
      emoji: '🚀',
      badgeBg: 'bg-sky-600 text-white'
    },
    pilot: {
      title: 'นักบิน / การบิน',
      bgGradient: 'from-sky-400 via-blue-500 to-indigo-700',
      hatColor: '#1D4ED8',
      outfitColor: '#EFF6FF',
      accentColor: '#1E40AF',
      floatingIcons: [
        <Plane key="1" className="w-4 h-4 text-white animate-pulse absolute -top-1 -right-1" />,
        <Zap key="2" className="w-3.5 h-3.5 text-amber-300 animate-bounce absolute -bottom-1 -left-1" />
      ],
      emoji: '✈️',
      badgeBg: 'bg-blue-600 text-white'
    },
    artist: {
      title: 'สถาปนิก / นักออกแบบ',
      bgGradient: 'from-pink-500 via-rose-500 to-orange-500',
      hatColor: '#EC4899',
      outfitColor: '#FDF2F8',
      accentColor: '#DB2777',
      floatingIcons: [
        <Palette key="1" className="w-4 h-4 text-yellow-300 animate-bounce absolute -top-1 -left-1" />,
        <Sparkles key="2" className="w-3.5 h-3.5 text-pink-200 animate-pulse absolute -bottom-1 -right-1" />
      ],
      emoji: '🎨',
      badgeBg: 'bg-rose-500 text-white'
    },
    chef: {
      title: 'เชฟ / ผู้เชี่ยวชาญโภชนาการ',
      bgGradient: 'from-amber-500 via-orange-600 to-red-600',
      hatColor: '#EA580C',
      outfitColor: '#FFF7ED',
      accentColor: '#C2410C',
      floatingIcons: [
        <Utensils key="1" className="w-4 h-4 text-amber-200 animate-bounce absolute -top-1 -right-1" />,
        <Sparkles key="2" className="w-3.5 h-3.5 text-yellow-300 animate-ping absolute -bottom-1 -left-1" />
      ],
      emoji: '👨‍🍳',
      badgeBg: 'bg-orange-600 text-white'
    },
    police: {
      title: 'ผู้นำระเบียบ / นิติศาสตร์',
      bgGradient: 'from-slate-700 via-slate-800 to-zinc-900',
      hatColor: '#334155',
      outfitColor: '#F8FAFC',
      accentColor: '#1E293B',
      floatingIcons: [
        <Shield key="1" className="w-4 h-4 text-amber-400 animate-pulse absolute -top-1 -right-1" />,
        <Award key="2" className="w-3.5 h-3.5 text-sky-300 animate-bounce absolute -bottom-1 -left-1" />
      ],
      emoji: '⚖️',
      badgeBg: 'bg-slate-800 text-amber-300'
    },
    sports: {
      title: 'นักกีฬาอาชีพ / โค้ช',
      bgGradient: 'from-emerald-500 via-teal-600 to-lime-600',
      hatColor: '#059669',
      outfitColor: '#ECFDF5',
      accentColor: '#047857',
      floatingIcons: [
        <Trophy key="1" className="w-4 h-4 text-amber-300 animate-bounce absolute -top-1 -right-1" />,
        <Zap key="2" className="w-3.5 h-3.5 text-emerald-200 animate-pulse absolute -bottom-1 -left-1" />
      ],
      emoji: '🏀',
      badgeBg: 'bg-emerald-600 text-white'
    },
    farmer: {
      title: 'เกษตรกรยุคใหม่ / Smart Farmer',
      bgGradient: 'from-green-500 via-emerald-600 to-amber-600',
      hatColor: '#16A34A',
      outfitColor: '#F0FDF4',
      accentColor: '#15803D',
      floatingIcons: [
        <Sprout key="1" className="w-4 h-4 text-lime-300 animate-pulse absolute -top-1 -right-1" />,
        <Sparkles key="2" className="w-3.5 h-3.5 text-yellow-200 animate-bounce absolute -bottom-1 -left-1" />
      ],
      emoji: '🌾',
      badgeBg: 'bg-green-600 text-white'
    },
    creator: {
      title: 'คอนเทนต์ครีเอเตอร์ / ช่างภาพ',
      bgGradient: 'from-purple-500 via-pink-600 to-rose-600',
      hatColor: '#9333EA',
      outfitColor: '#FAF5FF',
      accentColor: '#7E22CE',
      floatingIcons: [
        <Video key="1" className="w-4 h-4 text-pink-300 animate-bounce absolute -top-1 -right-1" />,
        <Sparkles key="2" className="w-3.5 h-3.5 text-yellow-300 animate-pulse absolute -bottom-1 -left-1" />
      ],
      emoji: '🎥',
      badgeBg: 'bg-purple-600 text-white'
    },
    diplomat: {
      title: 'นักการทูต / การสื่อสารต่างประเทศ',
      bgGradient: 'from-cyan-500 via-blue-600 to-indigo-700',
      hatColor: '#0891B2',
      outfitColor: '#ECFEFF',
      accentColor: '#0E7490',
      floatingIcons: [
        <Globe key="1" className="w-4 h-4 text-sky-200 animate-spin absolute -top-1 -right-1" />,
        <Award key="2" className="w-3.5 h-3.5 text-amber-300 animate-bounce absolute -bottom-1 -left-1" />
      ],
      emoji: '🌐',
      badgeBg: 'bg-cyan-600 text-white'
    },
    default: {
      title: 'ผู้นำมุสลิมรุ่นใหม่ (Khalifah Leader)',
      bgGradient: 'from-teal-500 via-emerald-600 to-sky-700',
      hatColor: '#0D9488',
      outfitColor: '#F0FDFA',
      accentColor: '#0F766E',
      floatingIcons: [
        <Sparkles key="1" className="w-4 h-4 text-amber-300 animate-spin absolute -top-1 -right-1" />,
        <Award key="2" className="w-3.5 h-3.5 text-teal-200 animate-bounce absolute -bottom-1 -left-1" />
      ],
      emoji: '🌟',
      badgeBg: 'bg-teal-600 text-white'
    }
  };

  const currentConfig = careerConfig[type];

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      {/* Outer Animated Ring */}
      <div className={`relative ${sizeClasses[size]} shrink-0 group cursor-pointer`}>
        {/* Floating Particles Around Character */}
        {currentConfig.floatingIcons}

        {/* Glow Aura Background */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-tr ${currentConfig.bgGradient} blur-md opacity-70 group-hover:opacity-100 transition-all animate-pulse`}
        />

        {/* Main Character Canvas Card */}
        <div
          className={`relative w-full h-full rounded-3xl bg-gradient-to-br ${currentConfig.bgGradient} p-1.5 shadow-lg border-2 border-white/40 overflow-hidden flex items-center justify-center`}
        >
          {/* Animated Cartoon SVG Character */}
          <div className="w-full h-full relative flex items-center justify-center hover:scale-105 transition-transform duration-300">
            {/* SVG Cartoon Illustration */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-md animate-subtle-bounce"
              style={{
                animation: 'floatCharacter 3s ease-in-out infinite'
              }}
            >
              <defs>
                <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Character Outfit / Body */}
              <path
                d="M 20 88 C 20 68, 32 60, 50 60 C 68 60, 80 68, 80 88 Z"
                fill={currentConfig.outfitColor}
                stroke={currentConfig.accentColor}
                strokeWidth="2.5"
              />

              {/* Collar/Tie/Stethoscope details */}
              {type === 'doctor' && (
                <path d="M 40 60 L 50 72 L 60 60" fill="none" stroke="#10B981" strokeWidth="3" />
              )}
              {type === 'engineer' && (
                <rect x="42" y="65" width="16" height="12" rx="2" fill="#3B82F6" />
              )}
              {type === 'business' && (
                <path d="M 46 60 L 50 78 L 54 60" fill="#2563EB" />
              )}
              {type === 'chef' && (
                <circle cx="50" cy="68" r="3" fill="#EA580C" />
              )}
              {type === 'police' && (
                <path d="M 48 60 L 52 60 L 50 75 Z" fill="#F59E0B" />
              )}

              {/* Head / Face Base */}
              <ellipse cx="50" cy="42" rx="22" ry="22" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />

              {/* Friendly Cheeks */}
              <ellipse cx="38" cy="48" rx="4" ry="2.5" fill="#F43F5E" opacity="0.4" />
              <ellipse cx="62" cy="48" rx="4" ry="2.5" fill="#F43F5E" opacity="0.4" />

              {/* Big Sparkling Anime Eyes */}
              <circle cx="41" cy="40" r="3.5" fill="#1E293B" />
              <circle cx="42" cy="38.8" r="1.2" fill="#FFFFFF" />
              <circle cx="59" cy="40" r="3.5" fill="#1E293B" />
              <circle cx="60" cy="38.8" r="1.2" fill="#FFFFFF" />

              {/* Cheerful Smile */}
              <path
                d="M 43 49 Q 50 56 57 49"
                fill="none"
                stroke="#1E293B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Specific Career Hats / Accessories */}
              {type === 'doctor' && (
                <g>
                  {/* Doctor Headband + Mirror */}
                  <rect x="28" y="24" width="44" height="6" rx="3" fill="#10B981" />
                  <circle cx="50" cy="27" r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5" />
                  <circle cx="50" cy="27" r="2" fill="#10B981" />
                </g>
              )}

              {type === 'engineer' && (
                <g>
                  {/* Headphones with Mic */}
                  <path d="M 26 42 C 26 22, 74 22, 74 42" fill="none" stroke="#1E293B" strokeWidth="4" />
                  <rect x="23" y="34" width="7" height="14" rx="3" fill="#3B82F6" />
                  <rect x="70" y="34" width="7" height="14" rx="3" fill="#3B82F6" />
                </g>
              )}

              {type === 'teacher' && (
                <g>
                  {/* Songkok or Graduation Cap */}
                  <path d="M 28 26 L 50 14 L 72 26 L 50 32 Z" fill="#D97706" />
                  <rect x="34" y="26" width="32" height="6" fill="#B45309" />
                  <circle cx="50" cy="23" r="2" fill="#FEF08A" />
                </g>
              )}

              {type === 'scientist' && (
                <g>
                  {/* Goggles */}
                  <rect x="30" y="33" width="18" height="12" rx="4" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
                  <rect x="52" y="33" width="18" height="12" rx="4" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
                  <line x1="48" y1="39" x2="52" y2="39" stroke="#7C3AED" strokeWidth="2.5" />
                </g>
              )}

              {type === 'pilot' && (
                <g>
                  {/* Aviator Helmet & Glasses */}
                  <path d="M 27 30 C 27 18, 73 18, 73 30 Z" fill="#1D4ED8" />
                  <rect x="33" y="30" width="34" height="7" rx="3" fill="#1E40AF" />
                  <circle cx="50" cy="23" r="3" fill="#F59E0B" />
                </g>
              )}

              {type === 'chef' && (
                <g>
                  {/* Chef Toque Hat */}
                  <path d="M 32 28 Q 30 10, 50 10 Q 70 10, 68 28 Z" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" />
                  <rect x="34" y="24" width="32" height="6" fill="#EA580C" />
                </g>
              )}

              {type === 'police' && (
                <g>
                  {/* Officer Cap */}
                  <path d="M 26 26 Q 50 14, 74 26 Z" fill="#334155" />
                  <rect x="32" y="25" width="36" height="5" fill="#1E293B" />
                  <circle cx="50" cy="22" r="3" fill="#F59E0B" />
                </g>
              )}

              {type === 'artist' && (
                <g>
                  {/* Artist Beret */}
                  <path d="M 26 28 Q 40 16, 70 22 Q 65 30, 32 30 Z" fill="#EC4899" />
                  <circle cx="52" cy="18" r="2" fill="#F472B6" />
                </g>
              )}

              {type === 'default' && (
                <g>
                  {/* Crown / Sparkle Cap */}
                  <path d="M 32 26 L 40 18 L 50 24 L 60 18 L 68 26 Z" fill="#F59E0B" />
                  <circle cx="50" cy="16" r="2.5" fill="#FEF08A" />
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Optional Career Title Badge */}
      {showBadge && (
        <div
          className={`font-black rounded-full shadow-sm flex items-center gap-1.5 transition-all ${currentConfig.badgeBg} ${badgeSizeClasses[size]}`}
        >
          <span>{currentConfig.emoji}</span>
          <span>{career || currentConfig.title}</span>
        </div>
      )}

      <style>{`
        @keyframes floatCharacter {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(1.5deg);
          }
        }
      `}</style>
    </div>
  );
};
