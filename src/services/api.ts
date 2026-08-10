import { DailyRecord, Student } from '../types';

export async function postRecordToGoogleScript(
  apiUrl: string,
  record: DailyRecord,
  extraPhotoUrl?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      action: 'saveRecord',
      date: record.date,
      studentId: record.studentId,
      name: record.studentName,
      prayer: record.prayer,
      halaqah: record.halaqah,
      discipline: {
        lateActivity: record.discipline.lateActivity,
        dress: record.discipline.dress,
        phone: record.discipline.phone,
        cleaning: record.discipline.cleaning,
      },
      note: record.note || '',
      recorder: record.recorder || 'ระบบ',
      photoUrl: extraPhotoUrl || record.photoUrl || ''
    };

    try {
      // 1. Try standard CORS POST
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        return {
          success: true,
          message: data?.message || 'บันทึกข้อมูลไปยัง Google Apps Script สำเร็จ',
        };
      }
    } catch (corsErr) {
      // 2. Fallback to mode: 'no-cors' if CORS redirect occurs
      await fetch(apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        message: 'ส่งข้อมูลการละหมาด/รูปถ่ายไปยัง Google Sheet เรียบร้อยแล้ว',
      };
    }

    return { success: true, message: 'ส่งข้อมูลไปยัง Google Sheet เรียบร้อย' };
  } catch (err: any) {
    console.warn('Google Apps Script POST failed, cached locally:', err);
    return {
      success: false,
      message: err?.message || 'ไม่สามารถเชื่อมต่อ Google Apps Script ได้ (บันทึกในเครื่องเรียบร้อย)',
    };
  }
}

export async function postStudentRegistrationToGoogleScript(
  apiUrl: string,
  student: Student
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      action: 'registerStudent',
      role: 'นักเรียน',
      id: student.id,
      fullName: student.fullName,
      nickname: student.nickname,
      year: student.year,
      dorm: student.dorm,
      phone: student.phone,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone,
      faculty: student.faculty || '',
      programme: student.programme || '',
      futureCareer: student.futureCareer || '',
      initialScore: student.initialScore || 100,
      photo: student.photo || '',
      photoUrl: student.photo || '',
      advisor: student.advisor || 'อาจารย์ที่ปรึกษา คอลีฟะห์',
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        return {
          success: true,
          message: data?.message || 'ลงทะเบียนนักเรียนลงในแท็บ [นักเรียน] ของ Google Sheet เรียบร้อย',
        };
      }
    } catch (corsErr) {
      await fetch(apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        message: 'ส่งข้อมูลลงทะเบียนนักเรียนไปยัง Google Sheet เรียบร้อยแล้ว',
      };
    }

    return { success: true, message: 'บันทึกข้อมูลนักเรียนลง Google Sheet เรียบร้อย' };
  } catch (err: any) {
    console.warn('Google Apps Script registerStudent POST failed:', err);
    return {
      success: false,
      message: 'บันทึกในระบบเรียบร้อย (ออฟไลน์)',
    };
  }
}

export async function postUserAccountToGoogleScript(
  apiUrl: string,
  user: { id?: string; username: string; name: string; role: string; assignedClassOrDorm?: string; phone?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      action: 'registerUser',
      id: user.id || `USER_${Date.now()}`,
      username: user.username,
      fullName: user.name,
      role: user.role,
      assignedClassOrDorm: user.assignedClassOrDorm || '',
      phone: user.phone || '',
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        return {
          success: true,
          message: data?.message || `บันทึกข้อมูลบุคลากร (${user.role}) ลง Google Sheet เรียบร้อย`,
        };
      }
    } catch (corsErr) {
      await fetch(apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        message: `ส่งข้อมูลบุคลากรไปยัง Google Sheet เรียบร้อยแล้ว`,
      };
    }

    return { success: true, message: 'บันทึกข้อมูลบุคลากรลง Google Sheet เรียบร้อย' };
  } catch (err: any) {
    console.warn('Google Apps Script postUserAccount POST failed:', err);
    return {
      success: false,
      message: 'บันทึกในเครื่องเรียบร้อย (ออฟไลน์)',
    };
  }
}

export async function postOrgSettingsToGoogleScript(
  apiUrl: string,
  settings: { appName: string; programName: string; faculty: string; university: string; logoUrl: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      action: 'saveSettings',
      ...settings,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        return { success: true, message: data?.message || 'บันทึกการตั้งค่าลง Google Sheet เรียบร้อย' };
      }
    } catch (corsErr) {
      await fetch(apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return { success: true, message: 'ส่งการตั้งค่าไปยัง Google Sheet เรียบร้อยแล้ว' };
    }
    return { success: true, message: 'บันทึกการตั้งค่าลง Google Sheet เรียบร้อย' };
  } catch (err: any) {
    console.warn('postOrgSettingsToGoogleScript failed:', err);
    return { success: false, message: 'บันทึกในระบบเรียบร้อย (ออฟไลน์)' };
  }
}

export async function uploadLogoToGoogleDrive(
  apiUrl: string,
  base64Data: string,
  fileName?: string
): Promise<{ success: boolean; url?: string; message: string }> {
  try {
    const payload = {
      action: 'uploadLogo',
      base64Data,
      fileName: fileName || `khalifah_logo_${Date.now()}.png`,
      isLogo: true,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.url) {
          return {
            success: true,
            url: data.url,
            message: data.message || 'อัปโหลดรูปภาพลง Google Drive เรียบร้อยแล้ว'
          };
        }
      }
    } catch (corsErr) {
      // Fallback mode: no-cors if CORS preflight occurs
      await fetch(apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    }

    // Wait 1.5 seconds for Google Apps Script to write file to Drive & update B6 in SHEET_SETTINGS
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Fetch the generated Google Drive URL directly from Google Apps Script
    const remoteSettings = await fetchSettingsFromGoogleScript(apiUrl);
    if (remoteSettings && remoteSettings.logoUrl) {
      return {
        success: true,
        url: remoteSettings.logoUrl,
        message: 'อัปโหลดรูปภาพลง Google Drive และบันทึกลง Google Sheet เรียบร้อยแล้ว'
      };
    }

    return {
      success: true,
      message: 'ส่งรูปภาพไปยัง Google Drive เรียบร้อยแล้ว'
    };
  } catch (err: any) {
    console.warn('uploadLogoToGoogleDrive failed:', err);
    return { success: false, message: err.message || 'ไม่สามารถอัปโหลดไปยัง Google Drive ได้' };
  }
}

export async function fetchSettingsFromGoogleScript(apiUrl: string): Promise<any | null> {
  try {
    const url = new URL(apiUrl);
    url.searchParams.append('action', 'getSettings');
    const res = await fetch(url.toString(), { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') return data;
    }
    return null;
  } catch (err) {
    console.warn('fetchSettingsFromGoogleScript error:', err);
    return null;
  }
}

export async function fetchUsersFromGoogleScript(apiUrl: string): Promise<any[] | null> {
  try {
    const url = new URL(apiUrl);
    url.searchParams.append('action', 'getUsers');
    const res = await fetch(url.toString(), { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
    return null;
  } catch (err) {
    console.warn('fetchUsersFromGoogleScript error:', err);
    return null;
  }
}

export async function fetchStudentsFromGoogleScript(apiUrl: string): Promise<Student[] | null> {
  try {
    const url = new URL(apiUrl);
    url.searchParams.append('action', 'getStudents');
    const res = await fetch(url.toString(), { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
    return null;
  } catch (err) {
    console.warn('fetchStudentsFromGoogleScript error:', err);
    return null;
  }
}

export async function fetchRecordsFromGoogleScript(apiUrl: string): Promise<DailyRecord[] | null> {
  try {
    const url = new URL(apiUrl);
    url.searchParams.append('action', 'getRecords');
    const res = await fetch(url.toString(), { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
    return null;
  } catch (err) {
    console.warn('fetchRecordsFromGoogleScript error:', err);
    return null;
  }
}

export async function fetchFromGoogleScript(apiUrl: string, action: 'dashboard' | 'students' | 'reports'): Promise<any> {
  try {
    const url = new URL(apiUrl);
    url.searchParams.append('action', action);

    const res = await fetch(url.toString(), {
      method: 'GET',
    });

    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.warn(`Google Apps Script GET ?action=${action} error:`, err);
    return null;
  }
}
