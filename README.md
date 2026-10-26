# ระบบงานสัสดีอิเล็กทรอนิกส์ (SASSADEE NAN Web Application)
> ระบบจัดการทะเบียนและลงบัญชีทหารกองเกิน (สด.๙ / สด.๑) จังหวัดน่าน ๑๕ อำเภอ (มณฑลทหารบกที่ ๓๘)

โปรเจกต์นี้ได้รับการพัฒนาและปรับปรุงประสิทธิภาพจากระบบฐานข้อมูล Microsoft Access เดิม สู่ Modern Web Application สถาปัตยกรรม **React 18 + Node.js + MySQL 8.4 LTS** รองรับการวางระบบบน **Linux Debian** (ผ่าน Docker Compose หรือ Nginx)

---

## 🌟 จุดเด่นและฟังก์ชันการทำงาน

1. **ระบบลงบัญชีทหารกองเกิน (แบบ สด.๙):**
   * ตรวจสอบความถูกต้องของเลขประจำตัวประชาชน 13 หลักด้วยสูตร **Modulo 11 Checksum** แบบเรียลไทม์
   * คำนวณปีทหารกองเกินอัตโนมัติ: ปีลงบัญชี สด.9 (ย่าง 18 ปี), ปีรับหมาย สด.35 (อายุ 20 ปี), ปีตรวจเลือก สด.43 (อายุ 21 ปี)
   * ฐานข้อมูล 15 อำเภอของจังหวัดน่าน (`5501`–`5515`)
   * ระบบ Autocomplete สำหรับชื่อถนนและตรอก/ซอย (แก้ปัญหาหน้าเว็บหน่วงจากการโหลด 28,000+ รายการ)
2. **ระบบพิมพ์ใบสำคัญ (แบบ สด.๙) ทางการ:**
   * จัดรูปแบบตามแบบฟอร์มมาตรฐานกองการสัสดี กองทัพบก พร้อมตราครุฑพ่าห์และข้อความตาม พ.ร.บ. รับราชการทหาร พ.ศ. 2497
   * รองรับการสั่งพิมพ์ A4 หรือบันทึกเป็น PDF ทันที
3. **ระบบค้นหาและทะเบียนรายชื่อ:**
   * ค้นหาด่วนด้วยชื่อ นามสกุล หรือเลข 13 หลัก พร้อมระบบหน่วงเวลา **Debounce 300ms**
   * กรองแยกตามอำเภอและปีเกิด พร้อมการแบ่งหน้า (Pagination)
4. **สถาปัตยกรรมฐานข้อมูล MySQL 8.4 LTS:**
   * Engine: `InnoDB` | Charset: `utf8mb4` | Collation: `utf8mb4_0900_ai_ci` (Unicode 9.0 Thai sorting standard)
   * ตาราง `tb_recuit` พร้อม `UNIQUE KEY ux_idcard` และ Composite Index `ix_year_area`
   * คอลัมน์ `updated_at TIMESTAMP` ป้องกันปัญหา Write Conflict ใน Access ODBC
   * ตาราง `tb_sd1_sequence` ป้องกันการออกเลขซ้ำด้วย Row-level Lock (`SELECT ... FOR UPDATE`)
   * ตารางสรุปยอด `summary_by_amphur` อัปเดตผ่าน MySQL Event Scheduler ทุก 15 นาที
   * ระบบบันทึก Audit Log แบบ Asynchronous ตามมาตรฐาน PDPA

---

## 📁 โครงสร้างโปรเจกต์

```
├── SASSADEE_PREVIEW.html       # Single-file Preview ดับเบิ้ลคลิกทดสอบได้ทันทีบน Windows
├── DEPLOY_DEBIAN.md            # คู่มือการติดตั้งบน Linux Debian 11/12 อย่างละเอียด
├── docker-compose.yml          # Docker Compose (MySQL 8.4 + Node API + React Nginx)
├── nginx.conf                  # Nginx Reverse Proxy Config
├── mysql/
│   └── conf.d/my.cnf           # การตั้งค่า MySQL 8.4 (Buffer pool 1G, Slow query log)
├── scripts/
│   └── optimize_access_db.ps1  # สคริปต์ล้างข้อมูลตกค้าง Access
├── server/
│   ├── database/
│   │   └── schema_mysql.sql    # DDL Schema MySQL 8.4 สมบูรณ์
│   ├── db.js                   # Connection Pool & Async Audit
│   └── server.js               # REST API Server (Port 4000)
└── client/                     # ส่วนหน้าเว็บ React + Vite + Tailwind CSS
    └── src/
        └── components/
            ├── RegistrationForm.jsx
            ├── RecruitList.jsx
            ├── PrintPreviewSD9.jsx
            └── DashboardView.jsx
```

---

## 🚀 วิธีการติดตั้งและรันระบบ

### วิธีที่ 1: รันผ่าน Docker บน Linux Debian (แนะนำ)
```bash
# Clone โปรเจกต์
git clone https://github.com/perfectddd/Webapp555.git
cd Webapp555

# สั่งรันทุกบริการ (MySQL, API, Web)
docker compose up -d --build
```
เปิดใช้งานผ่านเบราว์เซอร์: `http://localhost` หรือ `http://<server-ip>`

### วิธีที่ 2: รันเพื่อพัฒนาบนเครื่อง (Development)
```bash
# 1. รัน Backend API
cd server
npm install
npm start

# 2. รัน Frontend React
cd ../client
npm install
npm run dev
```

---

## 📄 ลิขสิทธิ์และการใช้งาน
ระบบพัฒนาขึ้นสำหรับสนับสนุนภารกิจงานสัสดี มณฑลทหารบกที่ 38 จังหวัดน่าน
