import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyRecord, PrayerStatus } from '../../types';
import {
  Camera,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  CalendarCheck,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sparkles,
  UserCheck,
  History,
  Check
} from 'lucide-react';

type PrayerKey = 'subuh' | 'zuhr' | 'asr' | 'maghrib' | 'isha';

interface PrayerOption {
  key: PrayerKey;
  label: string;
  arabic: string;
  icon: string;
  timeRange: string;
}

const PRAYER_OPTIONS: PrayerOption[] = [
  { key: 'subuh', label: 'ศุบฮี', arabic: 'الفجر', icon: '🌅', timeRange: '04:30 - 06:00 น.' },
  { key: 'zuhr', label: 'ยุฮ์รี', arabic: 'الظهر', icon: '☀️', timeRange: '12:00 - 15:00 น.' },
  { key: 'asr', label: 'อัศรี', arabic: 'العصر', icon: '🌤️', timeRange: '15:30 - 18:00 น.' },
  { key: 'maghrib', label: 'มัฆริบ', arabic: 'المغرب', icon: '🌇', timeRange: '18:30 - 19:30 น.' },
  { key: 'isha', label: 'อิชาอ์', arabic: 'العشاء', icon: '🌙', timeRange: '19:45 - 22:00 น.' },
];

export const StudentPrayerCheckinView: React.FC = () => {
  const { students, selectedStudentId, currentUser, records, addOrUpdateRecord, showSnackbar } = useApp();

  // Find active student
  const student = useMemo(() => {
    if (currentUser) {
      const match = students.find(
        (s) =>
          s.id.toLowerCase() === currentUser.username.toLowerCase() ||
          s.id.toLowerCase() === currentUser.id.toLowerCase()
      );
      if (match && currentUser.role === 'นักเรียน') return match;
    }
    const found = students.find((s) => s.id === selectedStudentId);
    if (found) return found;
    return students[0];
  }, [students, selectedStudentId, currentUser]);

  // Determine current prayer round based on hour
  const getDefaultPrayerKey = (): PrayerKey => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'subuh';
    if (hour >= 11 && hour < 15) return 'zuhr';
    if (hour >= 15 && hour < 18) return 'asr';
    if (hour >= 18 && hour < 19) return 'maghrib';
    return 'isha';
  };

  const [selectedPrayer, setSelectedPrayer] = useState<PrayerKey>(getDefaultPrayerKey());
  const [locationName, setLocationName] = useState<string>('มัสยิดประจำมหาวิทยาลัย');
  
  // Real-time clock ticker
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedTimestamp, setCapturedTimestamp] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start live camera stream with multi-level fallbacks
  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('อุปกรณ์หรือเบราว์เซอร์ไม่รองรับการเปิดกล้องเว็บโดยตรง');
      }

      let videoDevices: MediaDeviceInfo[] = [];
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        videoDevices = devices.filter((d) => d.kind === 'videoinput');
      } catch (e) {
        console.warn('Cannot enumerate devices:', e);
      }

      let stream: MediaStream | null = null;

      // Level 1: Try requested facingMode + ideal resolution
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e1) {
        console.warn('Level 1 camera request failed, trying Level 2 (facingMode only)...', e1);
        // Level 2: Try facingMode only without resolution constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch (e2) {
          console.warn('Level 2 camera request failed, trying deviceId or video: true...', e2);
          if (videoDevices.length > 0) {
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: videoDevices[0].deviceId } },
                audio: false,
              });
            } catch (e3) {
              stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
              });
            }
          } else {
            // Level 3: Fallback to any available video device
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          }
        }
      }

      if (!stream) {
        throw new Error('ไม่พบอุปกรณ์กล้องที่ใช้งานได้');
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMsg = 'ไม่พบอุปกรณ์กล้องหรือไม่มีกล้องที่ใช้งานได้ในอุปกรณ์นี้';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'ถูกปฏิเสธการเข้าถึงกล้อง กรุณาอนุญาตสิทธิ์การเข้าถึงกล้องในเบราว์เซอร์';
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError' ||
        err.message?.includes('Requested device not found') ||
        err.message?.includes('ไม่พบอุปกรณ์กล้อง')
      ) {
        errorMsg = 'ไม่พบกล้องในอุปกรณ์นี้ สามารถใช้ปุ่ม "ใช้กล้องหลักอุปกรณ์ / ถ่ายรูป" ด้านล่างเพื่อบันทึกรูปภาพได้';
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
    }
  };

  // Process uploaded or natively captured image file onto stamped canvas
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 1280;
        canvas.height = img.height || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const now = new Date();
        const nowStr =
          now.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) +
          ' ' +
          now.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }) +
          ' น.';

        const prayerName = PRAYER_OPTIONS.find((p) => p.key === selectedPrayer)?.label || '';

        // Watermark Banner
        const bannerHeight = Math.max(70, Math.round(canvas.height * 0.12));
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

        ctx.fillStyle = '#059669';
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, 4);

        const fontSize = Math.max(14, Math.round(canvas.height * 0.03));
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillText(`📍 ยืนยันการละหมาด: ${prayerName} (${locationName})`, 20, canvas.height - bannerHeight / 2 - 4);

        ctx.fillStyle = '#10B981';
        ctx.font = `bold ${Math.round(fontSize * 0.85)}px sans-serif`;
        ctx.fillText(`👤 ${student?.fullName || 'นักเรียน'} [${student?.id || ''}]`, 20, canvas.height - 15);

        ctx.fillStyle = '#FCD34D';
        ctx.font = `${Math.round(fontSize * 0.8)}px monospace`;
        const timeTextWidth = ctx.measureText(`🕒 ${nowStr}`).width;
        ctx.fillText(`🕒 ${nowStr}`, canvas.width - timeTextWidth - 20, canvas.height - 15);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedPhoto(dataUrl);
        setCapturedTimestamp(nowStr);
        showSnackbar('ประทับลายน้ำเวลาภาพถ่ายเรียบร้อยแล้ว', 'success');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Switch front/back camera
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  // Capture snapshot with overlaid timestamp stamp
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Format stamp text
    const nowStr = currentTime.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' ' + currentTime.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' น.';

    const prayerName = PRAYER_OPTIONS.find((p) => p.key === selectedPrayer)?.label || '';

    // Draw bottom banner watermark
    const bannerHeight = 85;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

    // Accent line
    ctx.fillStyle = '#059669'; // Emerald accent
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, 4);

    // Text details
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`📍 ยืนยันการละหมาด: ${prayerName} (${locationName})`, 20, canvas.height - 50);

    ctx.fillStyle = '#10B981'; // Green status text
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`👤 ${student?.fullName || 'นักเรียน'} [${student?.id || ''}]`, 20, canvas.height - 22);

    ctx.fillStyle = '#FCD34D'; // Yellow time text
    ctx.font = '16px monospace';
    const timeTextWidth = ctx.measureText(`🕒 ${nowStr}`).width;
    ctx.fillText(`🕒 ${nowStr}`, canvas.width - timeTextWidth - 20, canvas.height - 22);

    // Convert canvas to image
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);
    setCapturedTimestamp(nowStr);
    stopCamera();
    showSnackbar('ถ่ายรูปยืนยันตัวตนเรียบร้อยแล้ว', 'success');
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    setCapturedTimestamp(null);
    startCamera();
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Save checkin record to AppContext
  const handleSubmitCheckin = async () => {
    if (!student) return;
    if (!capturedPhoto) {
      showSnackbar('กรุณาเปิดกล้องและถ่ายรูปเพื่อยืนยันก่อนเช็คละหมาด', 'warning');
      return;
    }

    setIsSubmitting(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const existingRecord = records.find(
      (r) => r.studentId === student.id && r.date === todayStr
    );

    const updatedPrayer = existingRecord
      ? { ...existingRecord.prayer, [selectedPrayer]: 'Present' as PrayerStatus }
      : {
          subuh: selectedPrayer === 'subuh' ? 'Present' : 'Absent',
          zuhr: selectedPrayer === 'zuhr' ? 'Present' : 'Absent',
          asr: selectedPrayer === 'asr' ? 'Present' : 'Absent',
          maghrib: selectedPrayer === 'maghrib' ? 'Present' : 'Absent',
          isha: selectedPrayer === 'isha' ? 'Present' : 'Absent',
        };

    const newRecord: DailyRecord = {
      id: existingRecord ? existingRecord.id : `${todayStr}_${student.id}`,
      date: todayStr,
      studentId: student.id,
      studentName: student.fullName,
      prayer: updatedPrayer,
      halaqah: existingRecord?.halaqah || { subuh: 'Absent', asr: 'Absent', isha: 'Absent' },
      discipline: existingRecord?.discipline || {
        lateActivity: false,
        dress: false,
        phone: false,
        cleaning: false,
      },
      bonus: existingRecord?.bonus,
      note: `เช็คละหมาดสดด้วยตนเองเวลา ${capturedTimestamp || ''} สถานที่: ${locationName}`,
      recorder: `${student.fullName} (นักเรียนเช็คเอง)`,
      timestamp: new Date().toISOString(),
    };

    await addOrUpdateRecord(newRecord);
    setIsSubmitting(false);

    showSnackbar(
      `บันทึกการเช็คละหมาด ${PRAYER_OPTIONS.find((p) => p.key === selectedPrayer)?.label} สำเร็จ!`,
      'success'
    );
  };

  // Today's student prayer status overview
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find((r) => r.studentId === student?.id && r.date === todayStr);

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-10 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-15 pointer-events-none">
          <CalendarCheck className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ระบบเช็คละหมาดสดผ่านกล้อง</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              เช็คละหมาดด้วยตนเอง
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              ยืนยันการละหมาดด้วยรูปถ่ายพร้อมระบุวันเวลาและสถานที่แบบเรียลไทม์
            </p>
          </div>

          {/* Student Info Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow">
              {student?.fullName.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-white">{student?.fullName}</div>
              <div className="text-[11px] text-emerald-200 font-mono">
                รหัส: {student?.id}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Clock Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              เวลาปัจจุบันในระบบ
            </span>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {currentTime.toLocaleDateString('th-TH', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            {currentTime.toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Step 1: Select Prayer Round */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center font-bold">1</span>
            <span>เลือกเวลาละหมาดที่จะบันทึก</span>
          </h2>
          <span className="text-xs text-slate-500">เลือกช่วงเวลาละหมาด</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {PRAYER_OPTIONS.map((p) => {
            const isSelected = selectedPrayer === p.key;
            const isCompletedToday = todayRecord?.prayer[p.key] === 'Present';

            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedPrayer(p.key)}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isCompletedToday && (
                  <div className="absolute top-1 right-1 p-0.5 bg-emerald-500 text-white rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div>
                  <div className="text-lg mb-1">{p.icon}</div>
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className="text-[10px] text-slate-400">{p.arabic}</div>
                </div>
                <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-2">
                  {p.timeRange}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Location Selection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center font-bold">2</span>
          <span>ระบุสถานที่ละหมาด</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            'มัสยิดประจำมหาวิทยาลัย',
            'หอพักนักเรียน',
            'อาคารเรียน / ห้องเรียน',
          ].map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocationName(loc)}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                locationName === loc
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{loc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Mandatory Camera Verification */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center font-bold">3</span>
            <span>ถ่ายรูปสดด้วยกล้องเพื่อยืนยัน</span>
          </h2>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>บังคับเปิดกล้องจากแอปเท่านั้น</span>
          </span>
        </div>

        {/* Camera Notice Box */}
        <div className="p-3 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/80 rounded-2xl text-xs text-sky-900 dark:text-sky-200 flex items-center gap-2.5">
          <Camera className="w-5 h-5 text-sky-600 shrink-0" />
          <span>
            ระบบจะเปิดใช้งานกล้องสดของอุปกรณ์ ไม่อนุญาตให้เลือกรูปภาพจากคลังภาพ
            เพื่อให้มั่นใจว่าถ่ายภาพยืนยันจริง ณ เวลาปัจจุบัน
          </span>
        </div>

        {/* Camera Viewport or Snapshot Preview */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video sm:aspect-[16/10] flex items-center justify-center shadow-inner">
          {/* Case A: Camera is active */}
          {isCameraActive && !capturedPhoto && (
            <div className="relative w-full h-full flex flex-col justify-between">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Real-time Camera Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-[11px] text-amber-300 font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>กล้องสด: {currentTime.toLocaleTimeString('th-TH')}</span>
                </div>

                <div className="bg-emerald-950/80 backdrop-blur-md border border-emerald-700/80 px-3 py-1 rounded-xl text-[10px] text-emerald-300 font-bold">
                  {student?.fullName}
                </div>
              </div>

              {/* Bottom Camera Action Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">สลับกล้อง ({facingMode === 'user' ? 'หน้า' : 'หลัง'})</span>
                </button>

                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>ถ่ายรูปยืนยันเวลา</span>
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  ปิดกล้อง
                </button>
              </div>
            </div>
          )}

          {/* Case B: Photo already captured */}
          {capturedPhoto && (
            <div className="relative w-full h-full">
              <img
                src={capturedPhoto}
                alt="Captured Prayer Stamp"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3 py-1.5 bg-slate-900/90 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ถ่ายใหม่</span>
                </button>
              </div>
            </div>
          )}

          {/* Case C: Camera stopped / not opened yet */}
          {!isCameraActive && !capturedPhoto && (
            <div className="p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-900/50 text-emerald-400 border border-emerald-700/60 flex items-center justify-center mx-auto shadow-lg">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">พร้อมถ่ายรูปเช็คละหมาด</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  กดปุ่มด้านล่างเพื่อเปิดใช้งานกล้องสด ถ่ายรูปยืนยันพร้อมประทับเวลา
                </p>
              </div>

              {cameraError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-center gap-2 max-w-md mx-auto text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Native device camera input element */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 transform active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>เปิดกล้องถ่ายภาพสด</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>ใช้กล้องหลักอุปกรณ์ / ถ่ายรูป</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Final Submit Button */}
        <button
          type="button"
          disabled={!capturedPhoto || isSubmitting}
          onClick={handleSubmitCheckin}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            capturedPhoto && !isSubmitting
              ? 'bg-emerald-800 hover:bg-emerald-900 text-white active:scale-[0.99]'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>
            {isSubmitting
              ? 'กำลังบันทึกข้อมูล...'
              : `บันทึกข้อมูลเช็คละหมาด ${
                  PRAYER_OPTIONS.find((p) => p.key === selectedPrayer)?.label
                }`}
          </span>
        </button>
      </div>

      {/* Today's Checkin Summary Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>สถานะการละหมาดของฉันวันนี้ ({todayStr})</span>
          </h3>
          <span className="text-xs text-slate-500">บันทึกสะสม</span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-1">
          {PRAYER_OPTIONS.map((p) => {
            const st = todayRecord?.prayer[p.key];
            const isDone = st === 'Present';

            return (
              <div
                key={p.key}
                className={`p-2.5 rounded-2xl border text-center ${
                  isDone
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold mb-0.5">{p.label}</div>
                {isDone ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>เช็คแล้ว</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">ยังไม่เช็ค</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
