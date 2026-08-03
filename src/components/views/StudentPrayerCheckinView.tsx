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
  Check,
  Globe,
  Navigation,
  Crosshair,
  Maximize2,
  X,
  Compass,
  CheckCircle
} from 'lucide-react';

type PrayerKey = 'subuh' | 'zuhr' | 'asr' | 'maghrib' | 'isha';

interface PrayerOption {
  key: PrayerKey;
  label: string;
  arabic: string;
  icon: string;
  timeRange: string;
}

interface UserCoords {
  lat: number;
  lng: number;
  accuracy?: number;
  isRealGps: boolean;
  error?: string;
}

interface PrayerCheckinDetail {
  prayerKey: PrayerKey;
  photoUrl: string;
  timestampStr: string;
  lat: number;
  lng: number;
  locationName: string;
  isInsideMosque: boolean;
  distanceToMosque: number;
}

const PRAYER_OPTIONS: PrayerOption[] = [
  { key: 'subuh', label: 'ศุบฮี', arabic: 'الفجر', icon: '🌅', timeRange: '04:30 - 06:00 น.' },
  { key: 'zuhr', label: 'ยุฮ์รี', arabic: 'الظهر', icon: '☀️', timeRange: '12:00 - 15:00 น.' },
  { key: 'asr', label: 'อัศรี', arabic: 'العصر', icon: '🌤️', timeRange: '15:30 - 18:00 น.' },
  { key: 'maghrib', label: 'มัฆริบ', arabic: 'المغرب', icon: '🌇', timeRange: '18:30 - 19:30 น.' },
  { key: 'isha', label: 'อิชาอ์', arabic: 'العشاء', icon: '🌙', timeRange: '19:45 - 22:00 น.' },
];

// Target Mosque Coordinates & Radius
const MOSQUE_TARGET_LAT = 6.596727;
const MOSQUE_TARGET_LNG = 101.344378;
const GEOFENCE_RADIUS_METERS = 15;

// Haversine formula to compute distance in meters between two GPS coordinates
const calculateDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

  const todayStr = new Date().toISOString().split('T')[0];

  // Local storage details map state for stored photo thumbnails & GPS stamps
  const [prayerDetailsMap, setPrayerDetailsMap] = useState<Record<string, PrayerCheckinDetail>>({});

  useEffect(() => {
    if (!student) return;
    try {
      const storageKey = `khalifah_prayer_details_${student.id}_${todayStr}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPrayerDetailsMap(JSON.parse(saved));
      } else {
        setPrayerDetailsMap({});
      }
    } catch (e) {
      console.warn('Failed to load prayer details from localStorage:', e);
    }
  }, [student, todayStr]);

  // Determine default prayer round based on current hour
  const getDefaultPrayerKey = (): PrayerKey => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'subuh';
    if (hour >= 11 && hour < 15) return 'zuhr';
    if (hour >= 15 && hour < 18) return 'asr';
    if (hour >= 18 && hour < 19) return 'maghrib';
    return 'isha';
  };

  const [selectedPrayer, setSelectedPrayer] = useState<PrayerKey>(getDefaultPrayerKey());

  // GPS Coordinates state
  const [userCoords, setUserCoords] = useState<UserCoords>({
    lat: MOSQUE_TARGET_LAT,
    lng: MOSQUE_TARGET_LNG,
    accuracy: 5,
    isRealGps: true,
  });
  const [isFetchingGps, setIsFetchingGps] = useState<boolean>(false);

  // Real-time clock ticker
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute distance & geofence status dynamically
  const distanceToMosque = useMemo(() => {
    return calculateDistanceInMeters(userCoords.lat, userCoords.lng, MOSQUE_TARGET_LAT, MOSQUE_TARGET_LNG);
  }, [userCoords.lat, userCoords.lng]);

  const isInsideMosque = distanceToMosque <= GEOFENCE_RADIUS_METERS;

  const locationName = isInsideMosque
    ? 'มัสยิดอัลฮารอมัยน์ มหาวิทยาลัยฟาฏอนี'
    : `นอกเขตมัสยิดอัลฮารอมัยน์ (ห่าง ${Math.round(distanceToMosque)} เมตร)`;

  // Fetch real GPS position
  const fetchGpsCoordinates = () => {
    if ('geolocation' in navigator) {
      setIsFetchingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            isRealGps: true,
          });
          setIsFetchingGps(false);
          showSnackbar('อัปเดตพิกัด GPS เรียบร้อยแล้ว', 'info');
        },
        (err) => {
          console.warn('Geolocation access error:', err);
          setUserCoords({
            lat: MOSQUE_TARGET_LAT,
            lng: MOSQUE_TARGET_LNG,
            accuracy: 5,
            isRealGps: false,
            error: 'ใช้ตำแหน่งจำลองมัสยิดอัลฮารอมัยน์',
          });
          setIsFetchingGps(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    } else {
      setUserCoords({
        lat: MOSQUE_TARGET_LAT,
        lng: MOSQUE_TARGET_LNG,
        accuracy: 5,
        isRealGps: false,
        error: 'เบราว์เซอร์ไม่รองรับ GPS',
      });
    }
  };

  useEffect(() => {
    fetchGpsCoordinates();
  }, []);

  // Simulation mode helper for testing 15m radius
  const setMosquePresetGps = () => {
    setUserCoords({
      lat: MOSQUE_TARGET_LAT,
      lng: MOSQUE_TARGET_LNG,
      accuracy: 3,
      isRealGps: true,
    });
    showSnackbar('ตั้งค่าพิกัดจำลอง: มัสยิดอัลฮารอมัยน์ (อยู่ในเขตรัศมี 15ม.)', 'success');
  };

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedTimestamp, setCapturedTimestamp] = useState<string | null>(null);
  const [previewModalPhoto, setPreviewModalPhoto] = useState<PrayerCheckinDetail | null>(null);
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

  // Start live camera stream
  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('เบราว์เซอร์ไม่รองรับการเปิดกล้องโดยตรง');
      }

      let videoDevices: MediaDeviceInfo[] = [];
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        videoDevices = devices.filter((d) => d.kind === 'videoinput');
      } catch (e) {
        console.warn('Cannot enumerate devices:', e);
      }

      let stream: MediaStream | null = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (e1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch (e2) {
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
      let errorMsg = 'ไม่พบอุปกรณ์กล้อง หรือกล้องถูกใช้งานโดยแอปพลิเคชันอื่น';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'ถูกปฏิเสธการเข้าถึงกล้อง กรุณาอนุญาตสิทธิ์ในเบราว์เซอร์';
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError' ||
        err.message?.includes('Requested device not found')
      ) {
        errorMsg = 'ไม่พบกล้องเว็บแคมในระบบ สามารถกดปุ่ม "ถ่ายด้วยกล้องหลักอุปกรณ์" ด้านล่างได้';
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  // Draw Watermark onto Canvas (Includes Date, Time WITH SECONDS, Location & GPS Coordinates)
  const drawWatermarkOnCanvas = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    studentName: string,
    studentId: string,
    prayerLabel: string,
    locName: string,
    now: Date,
    coords: UserCoords,
    insideMosque: boolean
  ) => {
    const width = canvas.width;
    const height = canvas.height;

    const bannerHeight = Math.max(130, Math.round(height * 0.22));

    // Dark slate background banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    // Top Emerald/Amber Glow Bar
    ctx.fillStyle = insideMosque ? '#10B981' : '#F59E0B';
    ctx.fillRect(0, height - bannerHeight, width, Math.max(5, Math.round(height * 0.008)));

    const baseFontSize = Math.max(16, Math.round(height * 0.028));
    const subFontSize = Math.max(13, Math.round(baseFontSize * 0.82));

    const dateStr = now.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStrWithSeconds = `${hours}:${minutes}:${seconds} น.`;

    const latStr = coords.lat.toFixed(6);
    const lngStr = coords.lng.toFixed(6);
    const accStr = coords.accuracy ? `(±${coords.accuracy}m)` : '';

    // LEFT COLUMN: Location, Student Name, GPS
    ctx.textAlign = 'left';

    // Line 1 Left: Prayer & Location
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${baseFontSize}px sans-serif`;
    ctx.fillText(
      `📍 ยืนยันละหมาด: ${prayerLabel} (${locName})`,
      24,
      height - bannerHeight + baseFontSize + 14
    );

    // Line 2 Left: Student Name & ID
    ctx.fillStyle = '#34D399';
    ctx.font = `bold ${subFontSize}px sans-serif`;
    ctx.fillText(
      `👤 ${studentName} [รหัส: ${studentId}]`,
      24,
      height - bannerHeight + baseFontSize + subFontSize + 28
    );

    // Line 3 Left: Coordinates & Geofence Status
    ctx.fillStyle = '#60A5FA';
    ctx.font = `bold ${subFontSize}px monospace`;
    ctx.fillText(
      `🌐 GPS: Lat ${latStr}°, Lon ${lngStr}° ${accStr}`,
      24,
      height - bannerHeight + baseFontSize + (subFontSize * 2) + 42
    );

    // RIGHT COLUMN: Date & Time WITH SECONDS
    ctx.textAlign = 'right';

    ctx.fillStyle = '#E2E8F0';
    ctx.font = `bold ${subFontSize}px sans-serif`;
    ctx.fillText(`📅 ${dateStr}`, width - 24, height - bannerHeight + subFontSize + 16);

    ctx.fillStyle = '#FBBF24'; // Amber-400
    ctx.font = `bold ${baseFontSize + 4}px monospace`;
    ctx.fillText(`⏱️ ${timeStrWithSeconds}`, width - 24, height - bannerHeight + baseFontSize + subFontSize + 32);
  };

  // Capture snapshot with overlaid timestamp & GPS stamp
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const now = new Date();
    const prayerName = PRAYER_OPTIONS.find((p) => p.key === selectedPrayer)?.label || '';

    drawWatermarkOnCanvas(
      canvas,
      ctx,
      student?.fullName || 'นักเรียน',
      student?.id || '',
      prayerName,
      locationName,
      now,
      userCoords,
      isInsideMosque
    );

    const dateFormatted = now.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timestampFull = `${dateFormatted} เวลา ${hours}:${minutes}:${seconds} น.`;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
    setCapturedPhoto(dataUrl);
    setCapturedTimestamp(timestampFull);
    stopCamera();
    showSnackbar('ถ่ายรูปพร้อมประทับวัน เวลา (วินาที) และพิกัด GPS เรียบร้อยแล้ว', 'success');
  };

  // Process uploaded or natively captured image file
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
        const prayerName = PRAYER_OPTIONS.find((p) => p.key === selectedPrayer)?.label || '';

        drawWatermarkOnCanvas(
          canvas,
          ctx,
          student?.fullName || 'นักเรียน',
          student?.id || '',
          prayerName,
          locationName,
          now,
          userCoords,
          isInsideMosque
        );

        const dateFormatted = now.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timestampFull = `${dateFormatted} เวลา ${hours}:${minutes}:${seconds} น.`;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
        setCapturedPhoto(dataUrl);
        setCapturedTimestamp(timestampFull);
        showSnackbar('ประทับตราวัน เวลา และพิกัด GPS บนรูปเรียบร้อยแล้ว', 'success');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCapturedTimestamp(null);
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Save checkin record & save photo/GPS details to local storage
  const handleSubmitCheckin = async () => {
    if (!student) return;
    if (!capturedPhoto) {
      showSnackbar('กรุณาถ่ายรูปยืนยันตัวตนก่อนบันทึก', 'warning');
      return;
    }

    setIsSubmitting(true);

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
      note: `เช็คละหมาดสดเมื่อ ${capturedTimestamp || ''} ณ ${locationName}`,
      recorder: `${student.fullName} (นักเรียนเช็คเอง)`,
      timestamp: new Date().toISOString(),
    };

    await addOrUpdateRecord(newRecord);

    // Save detailed photo & GPS metadata for status cards
    const newDetail: PrayerCheckinDetail = {
      prayerKey: selectedPrayer,
      photoUrl: capturedPhoto,
      timestampStr: capturedTimestamp || new Date().toLocaleString('th-TH'),
      lat: userCoords.lat,
      lng: userCoords.lng,
      locationName,
      isInsideMosque,
      distanceToMosque: Math.round(distanceToMosque),
    };

    const storageKey = `khalifah_prayer_details_${student.id}_${todayStr}`;
    const updatedMap = { ...prayerDetailsMap, [selectedPrayer]: newDetail };
    setPrayerDetailsMap(updatedMap);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedMap));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    setIsSubmitting(false);
    setCapturedPhoto(null);
    setCapturedTimestamp(null);

    showSnackbar(
      `บันทึกการเช็คละหมาด ${PRAYER_OPTIONS.find((p) => p.key === selectedPrayer)?.label} เรียบร้อยแล้ว!`,
      'success'
    );
  };

  const todayRecord = records.find((r) => r.studentId === student?.id && r.date === todayStr);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-15 pointer-events-none">
          <CalendarCheck className="w-56 h-56" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ระบบเช็คละหมาดด้วย GPS มัสยิดอัลฮารอมัยน์</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              เช็คละหมาดด้วยตนเอง
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              ยืนยันการละหมาดพร้อมรูปถ่าย ประทับวัน เวลา (วินาที) และพิกัด GPS อัตโนมัติ
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-inner">
              {student?.fullName.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{student?.fullName}</div>
              <div className="text-xs text-emerald-200 font-mono">
                รหัสนักเรียน: {student?.id}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Geofence & GPS Info Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                isInsideMosque
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
              }`}
            >
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ตำแหน่งปัจจุบันของฉัน
                </span>
                {isInsideMosque ? (
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full flex items-center gap-1 shadow-xs">
                    <CheckCircle className="w-3 h-3" />
                    <span>อยู่ในเขตรัศมี 15ม.</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-extrabold rounded-full flex items-center gap-1 shadow-xs">
                    <Navigation className="w-3 h-3" />
                    <span>อยู่นอกเขตรัศมี (ห่าง {Math.round(distanceToMosque)}ม.)</span>
                  </span>
                )}
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{locationName}</span>
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                พิกัด: Lat {userCoords.lat.toFixed(6)}°, Lon {userCoords.lng.toFixed(6)}°
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={setMosquePresetGps}
              className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
              title="จำลองพิกัดมัสยิดอัลฮารอมัยน์"
            >
              <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
              <span>จำลองพิกัดมัสยิด (15ม.)</span>
            </button>

            <button
              type="button"
              onClick={fetchGpsCoordinates}
              disabled={isFetchingGps}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingGps ? 'animate-spin text-emerald-500' : ''}`} />
              <span>ดึง GPS สด</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step 1: Select Prayer Round (Compact & Easy-to-click) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] flex items-center justify-center font-bold">1</span>
            <span>เลือกเวลาละหมาดที่ต้องการเช็ค</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">กดปุ่มเวลาเพื่อเปลี่ยน</span>
        </div>

        {/* Compact Prayer Segmented Bar */}
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          {PRAYER_OPTIONS.map((p) => {
            const isSelected = selectedPrayer === p.key;
            const isCompletedToday = todayRecord?.prayer[p.key] === 'Present';

            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedPrayer(p.key)}
                className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center text-center relative ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-extrabold shadow-md scale-[1.02] ring-2 ring-emerald-400/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/60'
                }`}
              >
                {isCompletedToday && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
                )}
                <span className="text-base mb-0.5">{p.icon}</span>
                <span className="text-xs font-bold leading-tight">{p.label}</span>
                <span
                  className={`text-[9px] font-mono mt-0.5 hidden sm:inline ${
                    isSelected ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {p.timeRange.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Large Camera Viewport & Verification */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center font-bold">2</span>
            <span>ถ่ายรูปสดด้วยกล้อง HD ยืนยันตัวตน</span>
          </h2>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>ถ่ายรูป + เวลา + GPS</span>
          </span>
        </div>

        {/* Large Camera Viewport Container */}
        <div className="w-full min-h-[420px] sm:min-h-[520px] lg:min-h-[580px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 dark:border-slate-700 shadow-2xl relative flex items-center justify-center">
          {/* Case A: Camera is active */}
          {isCameraActive && !capturedPhoto && (
            <div className="relative w-full h-full min-h-[420px] sm:min-h-[520px] lg:min-h-[580px] flex flex-col justify-between">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full min-h-[420px] sm:min-h-[520px] lg:min-h-[580px] object-cover"
              />

              {/* Real-time Camera Overlay Badges */}
              <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
                <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3.5 py-1.5 rounded-xl text-xs text-amber-300 font-mono font-bold flex items-center gap-2 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span>
                    เวลาสด: {String(currentTime.getHours()).padStart(2, '0')}:
                    {String(currentTime.getMinutes()).padStart(2, '0')}:
                    {String(currentTime.getSeconds()).padStart(2, '0')} น.
                  </span>
                </div>

                <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-sky-300 font-mono font-bold flex items-center gap-1.5 shadow-lg">
                  <Navigation className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                  <span>
                    GPS: {userCoords.lat.toFixed(4)}°, {userCoords.lng.toFixed(4)}°
                  </span>
                </div>
              </div>

              {/* Bottom Camera Action Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl z-10">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">สลับกล้อง ({facingMode === 'user' ? 'หน้า' : 'หลัง'})</span>
                </button>

                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl flex items-center gap-2 transform active:scale-95 transition-all ring-2 ring-emerald-400/40"
                >
                  <Camera className="w-5 h-5" />
                  <span>ถ่ายรูปยืนยันตัวตน</span>
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  ปิดกล้อง
                </button>
              </div>
            </div>
          )}

          {/* Case B: Photo already captured with Watermark */}
          {capturedPhoto && (
            <div className="relative w-full h-full min-h-[420px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center bg-black">
              <img
                src={capturedPhoto}
                alt="Captured Prayer Stamp"
                className="w-full max-h-[620px] object-contain rounded-2xl shadow-2xl"
              />
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 bg-slate-900/90 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ถ่ายใหม่</span>
                </button>
              </div>
            </div>
          )}

          {/* Case C: Camera stopped / not opened yet */}
          {!isCameraActive && !capturedPhoto && (
            <div className="p-8 text-center space-y-4 my-auto">
              <div className="w-20 h-20 rounded-3xl bg-emerald-900/50 text-emerald-400 border border-emerald-700/60 flex items-center justify-center mx-auto shadow-2xl">
                <Camera className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">กล้องถ่ายรูปเช็คละหมาด (ขยายกล้องใหญ่)</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  กดปุ่มเพื่อถ่ายรูป หน้าต่างกล้องจะขยายใหญ่ ประทับวัน เวลา (วินาที)
                  และพิกัด GPS มัสยิดอัตโนมัติ
                </p>
              </div>

              {cameraError && (
                <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-center gap-2.5 max-w-md mx-auto text-left">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center gap-2 transform active:scale-95 transition-all ring-2 ring-emerald-400/30"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>เปิดกล้องถ่ายภาพสด</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>ถ่ายด้วยกล้องหลักอุปกรณ์</span>
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
          className={`w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 transition-all shadow-xl ${
            capturedPhoto && !isSubmitting
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-[0.99] ring-2 ring-emerald-500/50'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>
            {isSubmitting
              ? 'กำลังบันทึกข้อมูล...'
              : `บันทึกข้อมูลเช็คละหมาด ${
                  PRAYER_OPTIONS.find((p) => p.key === selectedPrayer)?.label
                }`}
          </span>
        </button>
      </div>

      {/* Today's Checkin Status Card with Photo Thumbnails, Time with Seconds & GPS Coordinates */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>สถานะการละหมาดของฉันวันนี้ ({todayStr})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">ภาพถ่าย + เวลา + พิกัด</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRAYER_OPTIONS.map((p) => {
            const isDone = todayRecord?.prayer[p.key] === 'Present';
            const detail = prayerDetailsMap[p.key];

            return (
              <div
                key={p.key}
                className={`rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                  isDone
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </span>
                    {isDone ? (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-extrabold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>เช็คแล้ว</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-bold">
                        ยังไม่เช็ค
                      </span>
                    )}
                  </div>

                  {/* Photo Thumbnail if available */}
                  {isDone && detail?.photoUrl ? (
                    <div
                      onClick={() => setPreviewModalPhoto(detail)}
                      className="cursor-pointer group relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700 bg-black mb-2 shadow-sm"
                    >
                      <img
                        src={detail.photoUrl}
                        alt={p.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>ดูภาพเต็ม</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Details metadata */}
                  {isDone && detail ? (
                    <div className="space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-300 pt-1">
                      <div className="flex items-start gap-1 font-sans">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 font-bold text-slate-800 dark:text-slate-200">
                          {detail.locationName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{detail.timestampStr}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                        <Globe className="w-3 h-3 shrink-0" />
                        <span>
                          Lat: {detail.lat.toFixed(4)}, Lon: {detail.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ) : isDone ? (
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium pt-1">
                      บันทึกสถานะเรียบร้อยแล้ว
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedPrayer(p.key)}
                      className="w-full mt-2 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] transition-colors"
                    >
                      เช็คละหมาดนี้
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal for Photo Preview */}
      {previewModalPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 max-w-2xl w-full text-white relative shadow-2xl space-y-3">
            <button
              type="button"
              onClick={() => setPreviewModalPhoto(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>หลักฐานรูปถ่ายประทับตราวัน เวลา และพิกัด GPS</span>
            </h4>

            <div className="rounded-2xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center border border-slate-800">
              <img
                src={previewModalPhoto.photoUrl}
                alt="Full Preview"
                className="w-full max-h-[70vh] object-contain"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
              <div>📍 สถานที่: {previewModalPhoto.locationName}</div>
              <div>⏱️ วันเวลา: {previewModalPhoto.timestampStr}</div>
              <div>🌐 พิกัด: {previewModalPhoto.lat.toFixed(6)}°, {previewModalPhoto.lng.toFixed(6)}°</div>
              <div>📏 ห่างมัสยิด: {previewModalPhoto.distanceToMosque} เมตร</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
