# Khalifah Student Discipline Management System
## ระบบจัดการระเบียบวินัยและบันทึกการละหมาด/หะละเกาะฮ์ นักศึกษาห้องเรียนคอลีฟะห์
**คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยฟาฏอนี**

---

### 📌 ภาพรวมโครงการ (Overview)
แอปพลิเคชัน **Khalifah Student Discipline Management System** พัฒนาขึ้นในรูปแบบ **Progressive Web App (PWA)** พร้อมโครงสร้าง **Material Design 3 (M3) Green Islamic Theme** รองรับการใช้งานแบบ Mobile-First บนสมาร์ตโฟนและคอมพิวเตอร์เดสก์ท็อป เพื่อเป็นเครื่องมือสำหรับผู้ดูแลระบบ อาจารย์ที่ปรึกษา และครูประจำหอพัก ในการติดตาม บันทึกการเข้าละหมาดฟัรฎูประจำวัน (5 เวลา), การเข้าร่วมหะละเกาะฮ์อัลกุรอาน (3 รอบ), บันทึกการทำผิดระเบียบวินัย และการคำนวณคะแนนความประพฤติอัตโนมัติ (เต็ม 100 คะแนน)

---

### 🌟 ฟีเจอร์หลักของระบบ (Main Features)

1. **ระบบยืนยันตัวตน (Login Page)**
   - สิทธิ์การใช้งาน 3 ระดับ: **Admin (ผู้ดูแลระบบ)**, **อาจารย์ (อาจารย์ที่ปรึกษา)**, **ครูหอพัก**
   - มีระบบจดจำเซสชันผู้ใช้งาน พร้อมปุ่มสลับบัญชีทดสอบด่วน

2. **แดชบอร์ดสรุปผลและกราฟวิเคราะห์ (Dashboard)**
   - แสดงการ์ดตัวเลขสรุปสด: นักศึกษาทั้งหมด, ละหมาดครบ, มาสาย, ขาดละหมาด, ขาดหะละเกาะฮ์
   - กรองสถิติตามช่วงเวลา: วันนี้ (Today), สัปดาห์นี้ (Weekly), เดือนนี้ (Monthly)
   - แผนภูมิวิเคราะห์ด้วย **Chart.js**:
     - **Pie Chart**: สัดส่วนการเข้าละหมาด (ตรงเวลา / มาสาย / ขาด)
     - **Bar Chart**: จำนวนครั้งการขาดละหมาดแยกตาม 5 เวลา (Subuh, Zuhr, Asr, Maghrib, Isha)
     - **Line Chart**: แนวโน้มคะแนนความประพฤติเฉลี่ยย้อนหลัง 7 วัน

3. **การจัดการข้อมูลนักศึกษา (Student Management)**
   - ข้อมูลครอบคลุม: รหัสนักศึกษา, ชื่อ-นามสกุล, ชื่อเล่น, คณะ, สาขาวิชา, ชั้นปี, เบอร์โทร, เบอร์ผู้ปกครอง, หอพัก, อาจารย์ที่ปรึกษา, สถานะการศึกษา, รูปถ่าย
   - ค้นหาด้วยชื่อ/รหัส/หอพัก, กรองแยกตามหอพัก/ชั้นปี, เรียงลำดับตามคะแนนสะสม

4. **บันทึกการละหมาดฟัรฎู (Prayer Recording)**
   - เลือกวันที่และนักศึกษา
   - บันทึกการเข้าละหมาด 5 เวลา: **Subuh, Zuhr, Asr, Maghrib, Isha**
   - ตัวเลือกสถานะ (เลือกได้เพียง 1 ตัวเลือกต่อช่วงเวลา): **ตรงเวลา (Present)**, **มาสาย (Late -1)**, **ขาด (Absent -3)**

5. **บันทึกการเข้าร่วมหะละเกาะฮ์ (Halaqah Recording)**
   - บันทึก 3 รอบกิจกรรม: **Subuh (เช้า), Asr (เย็น), Isha (ค่ำ)**
   - สถานะ: **มาเข้าร่วม (Present)**, **ขาด (Absent -2)**

6. **บันทึกระเบียบวินัยและพฤติกรรม (Discipline Recording)**
   - เช็กบ็อกซ์การทำผิดระเบียบ:
     - มาสายกิจกรรม/เข้าเรียน (-1)
     - แต่งกายผิดระเบียบ/ชุดลำลอง (-1)
     - ใช้โทรศัพท์ผิดเวลาในกิจกรรม (-2)
     - ขาดเวรทำความสะอาดหอพัก (-2)
   - เช็กบ็อกซ์คะแนนความดีโบนัส:
     - ละหมาดครบ 5 เวลา (+2)
     - เข้าร่วมหะละเกาะฮ์ครบ (+1)
     - ทำจิตอาสาช่วยงานหอพัก (+2)
     - ท่องจำอัลกุรอานเพิ่มขึ้น (+2)

7. **ระบบคะแนนความประพฤติอัตโนมัติ (Score System)**
   - คะแนนเริ่มต้น 100 คะแนน
   - คำนวณคะแนนสุทธิและจัดลำดับสัญลักษณ์ป้ายกำกับ (M3 Badges):
     - **90 - 100+ คะแนน**: ดีเยี่ยม (Excellent - สีเขียวเข้ม)
     - **80 - 89 คะแนน**: ดีมาก (Very Good - สีเขียวสด)
     - **70 - 79 คะแนน**: ดี (Good - สีฟ้า)
     - **60 - 69 คะแนน**: ควรปรับปรุง (Need Improvement - สีเหลือง)
     - **น้อยกว่า 60 คะแนน**: วิกฤต (Critical - สีแดง)

8. **รายงานและการส่งออกข้อมูล (Reports & Export)**
   - กรองรายงานตาม: รายวัน, รายสัปดาห์, รายเดือน, รายภาคเรียน, รายปี
   - จัดลำดับอันดับสำคัญ: เข้าละหมาดสูงสุด, มาสายสูงสุด, ขาดมากที่สุด, คะแนนสูงสุด, คะแนนต่ำสุด
   - ส่งออกไฟล์: **PDF (jsPDF)**, **Excel (.xlsx)**, **CSV (UTF-8 BOM)**, **พิมพ์รายงาน (Print Layout)**

9. **โปรไฟล์นักศึกษารายบุคคล (Student Profile)**
   - แสดงประวัติย้อนหลังของนักศึกษาแยกรายบุคคล ทั้งสถิติละหมาด หะละเกาะฮ์ และการตัด/เพิ่มคะแนน

10. **ตั้งค่าระบบ (Settings)**
    - ปรับแต่งชื่อหน่วยงาน คณะ มหาวิทยาลัย และโลโก้
    - กำหนดเกณฑ์คะแนนหัก/โบนัสได้อย่างอิสระ
    - กำหนด URL สำหรับ Google Apps Script REST API
    - สลับ Dark Mode / Light Mode
    - รองรับการติดตั้งแบบ PWA (Installable App) และทำงานแบบออฟไลน์

---

### 🌐 โครงสร้าง Google Apps Script Backend (GAS Setup)

สามารถสร้าง Google Apps Script เพื่อใช้เป็น REST API เชื่อมต่อกับ Google Sheet โดยใช้โค้ดดังนี้:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (data.action === "saveRecord") {
      sheet.appendRow([
        new Date(),
        data.date,
        data.studentId,
        data.name,
        JSON.stringify(data.prayer),
        JSON.stringify(data.halaqah),
        JSON.stringify(data.discipline),
        data.note || "",
        data.recorder || ""
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        "status": "success",
        "message": "บันทึกข้อมูลเรียบร้อยแล้ว"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var action = e.parameter.action;
  return ContentService.createTextOutput(JSON.stringify({
    "status": "ok",
    "action": action,
    "timestamp": new Date()
  })).setMimeType(ContentService.MimeType.JSON);
}
```

---

### 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend**: HTML5, Tailwind CSS v4, TypeScript, React 19, Vite
- **PWA**: Web App Manifest (`manifest.json`), Service Worker (`service-worker.js`)
- **UI System**: Material Design 3 (M3), Lucide Icons
- **Charts & Reports**: Chart.js, jsPDF, jsPDF-AutoTable, XLSX
- **Backend API**: Google Apps Script REST API (JSON payload)
