import { DailyRecord, Student } from '../types';

export async function postRecordToGoogleScript(apiUrl: string, record: DailyRecord): Promise<{ success: boolean; message: string }> {
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
      recorder: record.recorder || 'ระบบ'
    };

    // Google Apps Script requires text/plain body to avoid CORS preflight options issues
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
    } else {
      return {
        success: false,
        message: `HTTP Error: ${res.status} ${res.statusText}`,
      };
    }
  } catch (err: any) {
    console.warn('Google Apps Script POST failed, cached locally:', err);
    return {
      success: false,
      message: err?.message || 'ไม่สามารถเชื่อมต่อ Google Apps Script ได้ (บันทึกในเครื่องเรียบร้อย)',
    };
  }
}

export async function postStudentRegistrationToGoogleScript(apiUrl: string, student: Student): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      action: 'registerStudent',
      id: student.id,
      fullName: student.fullName,
      nickname: student.nickname,
      year: student.year,
      dorm: student.dorm,
      phone: student.phone,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone,
      initialScore: student.initialScore || 100,
      timestamp: new Date().toISOString()
    };

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
        message: data?.message || 'ลงทะเบียนนักเรียนและผู้ปกครองลง Google Sheet เรียบร้อย',
      };
    } else {
      return {
        success: false,
        message: `HTTP Error: ${res.status}`,
      };
    }
  } catch (err: any) {
    console.warn('Google Apps Script registerStudent POST failed:', err);
    return {
      success: false,
      message: 'บันทึกในระบบเรียบร้อย (ออฟไลน์)',
    };
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
