import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserAccount,
  Student,
  DailyRecord,
  ScoreRule,
  OrgSettings,
  TimePeriod,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_RECORDS,
  DEFAULT_SCORE_RULES,
  DEFAULT_ORG_SETTINGS,
  INITIAL_USER_ACCOUNTS,
} from '../data/mockData';
import {
  postRecordToGoogleScript,
  postStudentRegistrationToGoogleScript,
  postOrgSettingsToGoogleScript,
  postUserAccountToGoogleScript,
  fetchStudentsFromGoogleScript,
  fetchRecordsFromGoogleScript,
  fetchUsersFromGoogleScript,
  fetchSettingsFromGoogleScript,
  uploadLogoToGoogleDrive
} from '../services/api';
import { updateHeadMetadata } from '../utils/headManager';

export interface SnackbarMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  userAccounts: UserAccount[];
  addUserAccount: (acc: UserAccount) => void;
  updateUserAccount: (acc: UserAccount) => void;
  deleteUserAccount: (id: string) => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  records: DailyRecord[];
  addOrUpdateRecord: (record: DailyRecord) => Promise<boolean>;
  deleteRecord: (id: string) => void;
  scoreRules: ScoreRule;
  updateScoreRules: (newRules: ScoreRule) => void;
  orgSettings: OrgSettings;
  updateOrgSettings: (newSettings: OrgSettings) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isOffline: boolean;
  unsyncedCount: number;
  syncAllRecords: () => Promise<void>;
  snackbars: SnackbarMessage[];
  showSnackbar: (text: string, type?: SnackbarMessage['type']) => void;
  removeSnackbar: (id: string) => void;
  confirmDialog: ConfirmDialogState;
  showConfirm: (dialog: Omit<ConfirmDialogState, 'isOpen'>) => void;
  closeConfirm: () => void;
  manualSyncFromGoogleScript: (silent?: boolean) => Promise<void>;
  pwaInstallPrompt: any;
  triggerPwaInstall: () => void;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clear old mock data if present in localStorage
  useEffect(() => {
    const isCleaned = localStorage.getItem('khalifah_cleaned_v1');
    if (!isCleaned) {
      localStorage.removeItem('khalifah_students');
      localStorage.removeItem('khalifah_records');
      localStorage.removeItem('khalifah_accounts');
      localStorage.setItem('khalifah_cleaned_v1', 'true');
    }
  }, []);

  // Current user / role state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('khalifah_user');
    return saved ? JSON.parse(saved) : null;
  });

  // User accounts list (Admin managed)
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const isCleaned = localStorage.getItem('khalifah_cleaned_v1');
    if (!isCleaned) return INITIAL_USER_ACCOUNTS;
    const saved = localStorage.getItem('khalifah_accounts');
    return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS;
  });

  // Students state
  const [students, setStudents] = useState<Student[]>(() => {
    const isCleaned = localStorage.getItem('khalifah_cleaned_v1');
    if (!isCleaned) return INITIAL_STUDENTS;
    const saved = localStorage.getItem('khalifah_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  // Daily records state
  const [records, setRecords] = useState<DailyRecord[]>(() => {
    const isCleaned = localStorage.getItem('khalifah_cleaned_v1');
    if (!isCleaned) return INITIAL_RECORDS;
    const saved = localStorage.getItem('khalifah_records');
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  // Score rules state
  const [scoreRules, setScoreRules] = useState<ScoreRule>(() => {
    const saved = localStorage.getItem('khalifah_rules');
    return saved ? JSON.parse(saved) : DEFAULT_SCORE_RULES;
  });

  // Org settings state
  const [orgSettings, setOrgSettings] = useState<OrgSettings>(() => {
    const saved = localStorage.getItem('khalifah_org');
    return saved ? JSON.parse(saved) : DEFAULT_ORG_SETTINGS;
  });

  // Active view tab state (Default is 'login' so Landing page opens directly)
  const [activeTab, setActiveTabRaw] = useState<string>('login');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Today');

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('khalifah_dark');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Network offline state
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Snackbars & Confirm dialogs
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // PWA Prompt
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<any>(null);

  // Derived role booleans
  const isAdmin = currentUser?.role === 'Admin';
  const isTeacher = currentUser?.role === 'อาจารย์' || currentUser?.role === 'ครูหอพัก';
  const isStudent = currentUser?.role === 'นักเรียน' || !currentUser;

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('khalifah_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem('khalifah_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('khalifah_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('khalifah_rules', JSON.stringify(scoreRules));
  }, [scoreRules]);

  useEffect(() => {
    localStorage.setItem('khalifah_org', JSON.stringify(orgSettings));
    updateHeadMetadata(orgSettings);
  }, [orgSettings]);

  useEffect(() => {
    localStorage.setItem('khalifah_dark', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Manual & Auto sync students, records, users, and settings from Google Apps Script if URL is configured
  const syncFromGoogleScript = async (silent = true) => {
    if (!orgSettings.apiUrl || isOffline) return;

    try {
      if (!silent) showSnackbar('กำลังดึงข้อมูลล่าสุดจาก Google Sheet...', 'info');

      const remoteSettings = await fetchSettingsFromGoogleScript(orgSettings.apiUrl);
      if (remoteSettings) {
        setOrgSettings((prev) => {
          // If local logoUrl is an embedded base64 image, prioritize it over empty or default remote string
          const resolvedLogoUrl =
            remoteSettings.logoUrl && remoteSettings.logoUrl.trim() !== ''
              ? remoteSettings.logoUrl
              : prev.logoUrl;

          if (
            prev.logoUrl === resolvedLogoUrl &&
            prev.appName === (remoteSettings.appName || prev.appName) &&
            prev.programName === (remoteSettings.programName || prev.programName)
          ) {
            return prev;
          }
          return {
            ...prev,
            appName: remoteSettings.appName || prev.appName,
            programName: remoteSettings.programName || prev.programName,
            faculty: remoteSettings.faculty || prev.faculty,
            university: remoteSettings.university || prev.university,
            logoUrl: resolvedLogoUrl
          };
        });
      }

      const remoteStudents = await fetchStudentsFromGoogleScript(orgSettings.apiUrl);
      if (Array.isArray(remoteStudents) && remoteStudents.length > 0) {
        setStudents((prev) => {
          const map = new Map();
          prev.forEach((s) => map.set(s.id, s));
          remoteStudents.forEach((s) => map.set(s.id, s));
          return Array.from(map.values());
        });
      }

      const remoteRecords = await fetchRecordsFromGoogleScript(orgSettings.apiUrl);
      if (Array.isArray(remoteRecords) && remoteRecords.length > 0) {
        setRecords((prev) => {
          const map = new Map();
          prev.forEach((r) => map.set(r.id, r));
          remoteRecords.forEach((r) => map.set(r.id, r));
          return Array.from(map.values());
        });
      }

      const remoteUsers = await fetchUsersFromGoogleScript(orgSettings.apiUrl);
      if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        setUserAccounts((prev) => {
          const map = new Map();
          prev.forEach((u) => map.set(u.username, u));
          remoteUsers.forEach((u) => {
            map.set(u.username, {
              id: u.id || `usr_${u.username}`,
              name: u.name,
              username: u.username,
              role: u.role,
              assignedClassOrDorm: u.assignedClassOrDorm,
              phone: u.phone,
              status: u.status || 'ใช้งานปกติ'
            });
          });
          return Array.from(map.values());
        });
      }

      if (!silent) showSnackbar('อัปเดตข้อมูลและโลโก้จาก Google Sheet ล่าสุดเรียบร้อยแล้ว', 'success');
    } catch (err) {
      console.warn('Auto sync warning:', err);
      if (!silent) showSnackbar('ไม่สามารถซิงค์ข้อมูลกับ Google Sheet ได้', 'warning');
    }
  };

  useEffect(() => {
    if (!orgSettings.apiUrl || isOffline) return;

    syncFromGoogleScript(true);
    const interval = setInterval(() => {
      syncFromGoogleScript(true);
    }, 10000); // Auto sync every 10 seconds

    return () => clearInterval(interval);
  }, [orgSettings.apiUrl, isOffline]);

  // Tab switching permission guard
  const setActiveTab = (tab: string) => {
    if (!currentUser && tab !== 'login') {
      setActiveTabRaw('login');
      return;
    }
    if (isStudent && tab !== 'profile' && tab !== 'my_account' && tab !== 'login' && tab !== 'student_checkin' && tab !== 'schedule') {
      showSnackbar('นักเรียนสามารถเข้าถึงได้เฉพาะเมนูสำหรับนักเรียนเท่านั้น', 'info');
      setActiveTabRaw('profile');
      return;
    }
    if (isTeacher && tab === 'settings') {
      showSnackbar('การตั้งค่าระบบและบัญชีผู้ใช้สำหรับผู้ดูแลระบบเท่านั้น', 'warning');
      setActiveTabRaw('dashboard');
      return;
    }
    setActiveTabRaw(tab);
  };

  // Prevent navigating away or back when logged out
  useEffect(() => {
    const handlePopState = () => {
      if (!currentUser) {
        setActiveTabRaw('login');
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentUser]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showSnackbar('เชื่อมต่ออินเทอร์เน็ตแล้ว', 'success');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showSnackbar('เข้าสู่โหมดออฟไลน์ (Offline Mode)', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install prompt listener
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('khalifah_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('khalifah_user');
    setActiveTabRaw('login');
    window.history.pushState(null, '', window.location.href);
    showSnackbar('ออกจากระบบเรียบร้อย', 'info');
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const showSnackbar = (text: string, type: SnackbarMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setSnackbars((prev) => {
      if (prev.some((s) => s.text === text)) return prev;
      return [...prev, { id, text, type }];
    });

    setTimeout(() => {
      removeSnackbar(id);
    }, 4000);
  };

  const removeSnackbar = (id: string) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id));
  };

  const showConfirm = (dialog: Omit<ConfirmDialogState, 'isOpen'>) => {
    setConfirmDialog({ ...dialog, isOpen: true });
  };

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Student CRUD
  const addStudent = async (student: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === student.id);
      if (exists) {
        return prev.map((s) => (s.id === student.id ? student : s));
      }
      return [student, ...prev];
    });

    if (orgSettings.apiUrl && !isOffline) {
      await postStudentRegistrationToGoogleScript(orgSettings.apiUrl, student);
    }

    showSnackbar(`เพิ่มนักเรียน ${student.fullName} เรียบร้อย`, 'success');
  };

  const updateStudent = async (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    if (orgSettings.apiUrl && !isOffline) {
      await postStudentRegistrationToGoogleScript(orgSettings.apiUrl, updatedStudent);
    }
    showSnackbar(`อัปเดตข้อมูล ${updatedStudent.fullName} เรียบร้อย`, 'success');
  };

  const deleteStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showSnackbar(`ลบข้อมูลนักเรียน ${student?.fullName || id} เรียบร้อย`, 'warning');
  };

  // Records CRUD & REST API POST
  const addOrUpdateRecord = async (newRecord: DailyRecord): Promise<boolean> => {
    let synced = false;

    // Try posting to Google Apps Script REST API if URL exists and online
    if (orgSettings.apiUrl && !isOffline) {
      const res = await postRecordToGoogleScript(orgSettings.apiUrl, newRecord, newRecord.photoUrl);
      synced = res.success;
    }

    const recordToSave = { ...newRecord, syncedToBackend: synced };

    setRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === recordToSave.id || (r.date === recordToSave.date && r.studentId === recordToSave.studentId));
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = recordToSave;
        return copy;
      }
      return [recordToSave, ...prev];
    });

    if (synced) {
      showSnackbar(`บันทึกข้อมูลและซิงค์กับ Google Sheet สำเร็จ`, 'success');
    } else {
      showSnackbar(`บันทึกในเครื่องเรียบร้อย (จะซิงค์กับ Google Sheet เมื่อออนไลน์)`, 'info');
    }

    return true;
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showSnackbar('ลบบันทึกเรียบร้อย', 'info');
  };

  const updateScoreRules = (newRules: ScoreRule) => {
    setScoreRules(newRules);
    showSnackbar('อัปเดตกฎเกณฑ์การให้คะแนนเรียบร้อย', 'success');
  };

  const updateOrgSettings = async (newSettings: OrgSettings) => {
    let finalSettings = { ...newSettings };

    // If logoUrl is a local Base64 string and API URL exists, upload it to Google Drive first
    if (newSettings.apiUrl && !isOffline && newSettings.logoUrl && newSettings.logoUrl.startsWith('data:image/')) {
      showSnackbar('กำลังอัปโหลดรูปโลโก้เข้า Google Drive...', 'info');
      const uploadRes = await uploadLogoToGoogleDrive(newSettings.apiUrl, newSettings.logoUrl, 'khalifah_system_logo.png');
      if (uploadRes.success && uploadRes.url) {
        finalSettings.logoUrl = uploadRes.url;
      }
    }

    setOrgSettings(finalSettings);

    if (finalSettings.apiUrl && !isOffline) {
      const res = await postOrgSettingsToGoogleScript(finalSettings.apiUrl, {
        appName: finalSettings.appName,
        programName: finalSettings.programName,
        faculty: finalSettings.faculty,
        university: finalSettings.university,
        logoUrl: finalSettings.logoUrl
      });
      if (res.success) {
        showSnackbar('อัปเดตข้อมูลองค์กรและโลโก้ลง Google Sheet [การตั้งค่าระบบ] ช่อง B6 สำเร็จ!', 'success');
      } else {
        showSnackbar('อัปเดตในระบบเรียบร้อย (บันทึกออฟไลน์)', 'info');
      }
    } else {
      showSnackbar('อัปเดตข้อมูลองค์กรในระบบเรียบร้อย', 'success');
    }
  };

  // Sync all unsynced records
  const syncAllRecords = async () => {
    const unsynced = records.filter((r) => !r.syncedToBackend);
    if (unsynced.length === 0) {
      showSnackbar('ข้อมูลงวดนี้ได้รับการซิงค์ครบถ้วนแล้ว', 'info');
      return;
    }

    showSnackbar(`กำลังซิงค์ ${unsynced.length} รายการไปยัง Google Apps Script...`, 'info');
    let successCount = 0;

    for (const rec of unsynced) {
      const res = await postRecordToGoogleScript(orgSettings.apiUrl, rec);
      if (res.success) {
        successCount++;
        setRecords((prev) => prev.map((r) => (r.id === rec.id ? { ...r, syncedToBackend: true } : r)));
      }
    }

    showSnackbar(`ซิงค์ข้อมูลสำเร็จ ${successCount}/${unsynced.length} รายการ`, successCount > 0 ? 'success' : 'warning');
  };

  const triggerPwaInstall = () => {
    if (pwaInstallPrompt) {
      pwaInstallPrompt.prompt();
      pwaInstallPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          showSnackbar('ขอบคุณที่ติดตั้งแอปพลิเคชัน คอลีฟะห์ PWA', 'success');
        }
        setPwaInstallPrompt(null);
      });
    } else {
      showSnackbar('แอปพร้อมใช้งาน PWA บนอุปกรณ์ของคุณแล้ว', 'info');
    }
  };

  const addUserAccount = async (acc: UserAccount) => {
    setUserAccounts((prev) => [acc, ...prev]);
    if (orgSettings.apiUrl && !isOffline) {
      await postUserAccountToGoogleScript(orgSettings.apiUrl, acc);
    }
    showSnackbar(`เพิ่มบัญชีผู้ใช้งาน ${acc.name} เรียบร้อย`, 'success');
  };

  const updateUserAccount = (updatedAcc: UserAccount) => {
    setUserAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
    showSnackbar(`อัปเดตข้อมูลบัญชี ${updatedAcc.name} เรียบร้อย`, 'success');
  };

  const deleteUserAccount = (id: string) => {
    const acc = userAccounts.find((a) => a.id === id);
    setUserAccounts((prev) => prev.filter((a) => a.id !== id));
    showSnackbar(`ลบบัญชีผู้ใช้ ${acc?.name || id} เรียบร้อย`, 'warning');
  };

  const resetToDefaultData = () => {
    setStudents(INITIAL_STUDENTS);
    setRecords(INITIAL_RECORDS);
    setScoreRules(DEFAULT_SCORE_RULES);
    setOrgSettings(DEFAULT_ORG_SETTINGS);
    setUserAccounts(INITIAL_USER_ACCOUNTS);
    showSnackbar('รีเซ็ตข้อมูลเป็นค่าเริ่มต้นเรียบร้อย', 'warning');
  };

  const unsyncedCount = records.filter((r) => !r.syncedToBackend).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        userAccounts,
        addUserAccount,
        updateUserAccount,
        deleteUserAccount,
        isAdmin,
        isTeacher,
        isStudent,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        records,
        addOrUpdateRecord,
        deleteRecord,
        scoreRules,
        updateScoreRules,
        orgSettings,
        updateOrgSettings,
        activeTab,
        setActiveTab,
        selectedStudentId,
        setSelectedStudentId,
        timePeriod,
        setTimePeriod,
        darkMode,
        toggleDarkMode,
        isOffline,
        unsyncedCount,
        syncAllRecords,
        snackbars,
        showSnackbar,
        removeSnackbar,
        confirmDialog,
        showConfirm,
        closeConfirm,
        manualSyncFromGoogleScript: syncFromGoogleScript,
        pwaInstallPrompt,
        triggerPwaInstall,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
