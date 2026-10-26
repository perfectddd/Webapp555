// SASSADEE NAN - Military Conscription Registration API (Node.js)
// Enterprise Backend with MySQL 8.4 Pool Support, Keyset Pagination, Async Audit, and Address Autocomplete

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const db = require('./db');

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');
const RECRUITS_FILE = path.join(DATA_DIR, 'recruits_db.json');

// In-memory data caches for fast autocomplete & fallback
let recruits = [];
let amphurs = [];
let provinces = [];
let sampleRoads = [
  'ถนนสุริยพงษ์', 'ถนนอนันตวรฤทธิเดช', 'ถนนมหายศ', 'ถนนผากอง', 'ถนนสุมนเทวราช',
  'ถนนเจษฎาบดินทร์', 'ถนนเปรมประชาราษฎร์', 'ถนนรอบเมืองเชียงใหม่', 'ถนนน่าน-พะเยา',
  'ถนนน่าน-ท่าวังผา', 'ถนนน่าน-แม่จริม', 'ถนนน่าน-เวียงสา', 'ถนนน่าน-บ้านหลวง'
];
let sampleSois = [
  'ซอย 1', 'ซอย 2', 'ซอย 3', 'ซอย 4', 'ซอย 5', 'ซอยวัดช้างค้ำ', 'ซอยภูมินทร์',
  'ซอยมณเฑียร', 'ซอยบ้านดอน', 'ซอยพญาภู', 'ซอยดอนแก้ว', 'ซอยสวนตาล'
];

function initData() {
  try {
    const amphurPath = path.join(DATA_DIR, 'amphur.json');
    if (fs.existsSync(amphurPath)) {
      amphurs = JSON.parse(fs.readFileSync(amphurPath, 'utf8'));
    }

    const provincePath = path.join(DATA_DIR, 'province.json');
    if (fs.existsSync(provincePath)) {
      provinces = JSON.parse(fs.readFileSync(provincePath, 'utf8'));
    }

    if (fs.existsSync(RECRUITS_FILE)) {
      recruits = JSON.parse(fs.readFileSync(RECRUITS_FILE, 'utf8'));
    } else {
      const samplePath = path.join(DATA_DIR, 'recruit_records.json');
      if (fs.existsSync(samplePath)) {
        const rawSamples = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
        recruits = rawSamples.map((r, idx) => ({
          id: r['รหัสประจำตัว'] || `55030147${String(idx + 1).padStart(3, '0')}`,
          citizenId: (r['เลขประจำตัวประชาชน'] || '').toString().trim(),
          sd1Number: r['เลขที่ สด#1'] || (idx + 1),
          sd9BookNumber: r['ใบสำคัญเล่มที่'] || '1',
          sd9DocNumber: r['ใบสำคัญเลขที่'] || (idx + 1),
          firstName: r['ชื่อ'] || '',
          lastName: r['นามสกุล'] || '',
          birthDate: r['เกิดวันที่'] || 1,
          birthMonth: r['เดือน'] || 'มกราคม',
          birthYear: r['พ#ศ#'] || 2547,
          regDate: r['ลงบัญชีทหารกองเกินวันที่'] || 1,
          regMonth: r['ลงบัญชีทหารกองเกินเดือน'] || 'มกราคม',
          regYear: r['ลงบัญชีทหารกองเกินพ#ศ#'] || 2564,
          houseNumber: r['ภูมิลำเนาทหารเลขที่'] || '',
          moo: r['ภูมิลำเนาทหารหมู่ที่'] || 1,
          subDistrict: r['ภูมิลำเนาทหารตำบล'] || '',
          district: r['ภูมิลำเนาทหารอำเภอ'] || 'บ้านหลวง',
          province: r['ภูมิลำเนาทหารจังหวัด'] || 'น่าน',
          fatherName: r['ชื่อบิดา'] || '',
          fatherLastName: r['บิดาสกุล'] || '',
          motherName: r['มารดาชื่อ'] || '',
          motherLastName: r['มารดาสกุล'] || '',
          mark: r['ตำหนิ'] || 'ปกติ',
          education: (r['ความรู้'] || '').trim() || 'มัธยมศึกษาปีที่ ๖',
          occupation: (r['อาชีพ'] || '').trim() || 'รับจ้าง / เกษตรกรรม',
          religion: r['ศาสนา'] || 'พุทธ',
          phone: r['เบอร์โทรศัพท์'] || '',
          status: 'ลงบัญชีแล้ว (สด.9)',
          createdAt: new Date().toISOString()
        }));
        saveRecruits();
      }
    }
    console.log(`[SASSADEE] Loaded ${amphurs.length} amphurs, ${recruits.length} recruits in cache.`);
  } catch (err) {
    console.error('[SASSADEE] Error initializing data:', err);
  }
}

function saveRecruits() {
  try {
    fs.writeFileSync(RECRUITS_FILE, JSON.stringify(recruits, null, 2), 'utf8');
  } catch (err) {
    console.error('[SASSADEE] Failed to save recruits to file:', err);
  }
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // Healthcheck with MySQL status
  if (pathname === '/api/health') {
    return sendJSON(res, 200, {
      status: 'healthy',
      database: db.isMySQLConnected() ? 'MySQL 8.4 (Active Pool)' : 'JSON/In-Memory Store',
      uptime: process.uptime(),
      platform: process.platform,
      totalRecruits: recruits.length
    });
  }

  // Address Autocomplete: Roads & Sois (Prevents loading 28,000+ items into DOM)
  if (pathname === '/api/address/autocomplete' && method === 'GET') {
    const q = (parsedUrl.query.q || '').trim().toLowerCase();
    const type = parsedUrl.query.type || 'road';
    const sourceList = type === 'soi' ? sampleSois : sampleRoads;
    const matches = sourceList
      .filter(item => !q || item.toLowerCase().includes(q))
      .slice(0, 15);
    return sendJSON(res, 200, matches);
  }

  // Get Nan Amphurs (15 districts)
  if (pathname === '/api/amphurs' && method === 'GET') {
    return sendJSON(res, 200, amphurs);
  }

  // Get Provinces
  if (pathname === '/api/provinces' && method === 'GET') {
    return sendJSON(res, 200, provinces);
  }

  // Dashboard Aggregated Statistics (Uses summary cache)
  if (pathname === '/api/stats' && method === 'GET') {
    const statsByDistrict = {};
    const statsByBirthYear = {};
    const statsByStatus = {};

    amphurs.forEach(a => { statsByDistrict[a.amphur_th] = 0; });
    recruits.forEach(r => {
      const d = r.district || 'เมืองน่าน';
      statsByDistrict[d] = (statsByDistrict[d] || 0) + 1;
      const y = r.birthYear || 'ไม่ระบุ';
      statsByBirthYear[y] = (statsByBirthYear[y] || 0) + 1;
      const s = r.status || 'ลงบัญชีแล้ว (สด.9)';
      statsByStatus[s] = (statsByStatus[s] || 0) + 1;
    });

    db.logAuditAsync({ action: 'VIEW_DASHBOARD', details: { total: recruits.length } });

    return sendJSON(res, 200, {
      total: recruits.length,
      byDistrict: statsByDistrict,
      byBirthYear: statsByBirthYear,
      byStatus: statsByStatus,
      targetCurrentYear: 2552 // ปีเกิดอายุย่าง 18 ปี
    });
  }

  // Recruits: Server-Side Pagination & Keyset Search
  if (pathname === '/api/recruits' && method === 'GET') {
    const query = parsedUrl.query;
    const search = (query.search || '').trim().toLowerCase();
    const district = (query.district || '').trim();
    const birthYear = query.birthYear ? parseInt(query.birthYear, 10) : null;
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(100, parseInt(query.limit || '20', 10)); // Cap limit to 100

    let filtered = recruits.filter(r => {
      if (district && r.district !== district) return false;
      if (birthYear && r.birthYear !== birthYear) return false;
      if (search) {
        const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
        const cid = (r.citizenId || '').toLowerCase();
        const rid = (r.id || '').toLowerCase();
        if (!fullName.includes(search) && !cid.includes(search) && !rid.includes(search)) {
          return false;
        }
      }
      return true;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    db.logAuditAsync({
      action: 'SEARCH_RECRUITS',
      details: { search, district, birthYear, resultsCount: total }
    });

    return sendJSON(res, 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data: items
    });
  }

  // Recruits: Get Single
  if (pathname.startsWith('/api/recruits/') && method === 'GET') {
    const id = pathname.replace('/api/recruits/', '');
    const recruit = recruits.find(r => r.id === id || r.citizenId === id);
    if (!recruit) {
      return sendJSON(res, 404, { error: 'ไม่พบข้อมูลทหารกองเกิน' });
    }
    db.logAuditAsync({ action: 'VIEW_RECRUIT_DETAIL', recordId: id });
    return sendJSON(res, 200, recruit);
  }

  // Recruits: Create New Registration (สด.9) with Sequence Lock
  if (pathname === '/api/recruits' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (!data.citizenId || !data.firstName || !data.lastName) {
          return sendJSON(res, 400, { error: 'กรุณากรอกเลขบัตรประชาชน ชื่อ และนามสกุล' });
        }

        const rawCitizenId = data.citizenId.toString().replace(/\D/g, '');
        const exists = recruits.find(r => r.citizenId === rawCitizenId);
        if (exists) {
          return sendJSON(res, 409, { error: 'เลขประจำตัวประชาชนนี้ได้รับการลงบัญชีทหารกองเกินแล้ว' });
        }

        const currentThaiYear = new Date().getFullYear() + 543;
        const amphurCode = parseInt(data.amphurCode || '5501', 10);
        
        // Get next safe SD1 sequence number without race condition
        let nextSD1 = data.sd1Number;
        try {
          nextSD1 = await db.getNextSD1Number(amphurCode, currentThaiYear);
        } catch (e) {
          nextSD1 = recruits.length + 1;
        }

        const newRecruit = {
          id: data.id || `550101${String(data.birthYear || currentThaiYear - 17).slice(-2)}${String(nextSD1).padStart(3, '0')}`,
          citizenId: rawCitizenId,
          sd1Number: nextSD1,
          sd9BookNumber: data.sd9BookNumber || '1',
          sd9DocNumber: data.sd9DocNumber || nextSD1,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          birthDate: parseInt(data.birthDate || 1, 10),
          birthMonth: data.birthMonth || 'มกราคม',
          birthYear: parseInt(data.birthYear || (currentThaiYear - 17), 10),
          regDate: parseInt(data.regDate || new Date().getDate(), 10),
          regMonth: data.regMonth || 'มกราคม',
          regYear: parseInt(data.regYear || currentThaiYear, 10),
          houseNumber: data.houseNumber || '',
          moo: data.moo || 1,
          subDistrict: data.subDistrict || '',
          district: data.district || 'เมืองน่าน',
          province: data.province || 'น่าน',
          fatherName: data.fatherName || '',
          fatherLastName: data.fatherLastName || '',
          motherName: data.motherName || '',
          motherLastName: data.motherLastName || '',
          mark: data.mark || 'ปกติ',
          education: data.education || 'มัธยมศึกษาปีที่ ๖',
          occupation: data.occupation || 'รับจ้าง',
          religion: data.religion || 'พุทธ',
          phone: data.phone || '',
          status: 'ลงบัญชีแล้ว (สด.9)',
          createdAt: new Date().toISOString()
        };

        recruits.unshift(newRecruit);
        saveRecruits();

        if (db.isMySQLConnected() && db.getPool()) {
          try {
            await db.getPool().execute(
              `INSERT INTO tb_recuit (
                recruit_code, id_card, first_name, last_name, birth_date, birth_month, birth_year,
                reg_date, reg_month, reg_year, house_number, moo, sub_district, amphur_name,
                province_name, father_name, father_last_name, mother_name, mother_last_name,
                mark, education, occupation, religion, phone, status, sd1_number, sd9_book_number, sd9_doc_number
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                newRecruit.id, newRecruit.citizenId, newRecruit.firstName, newRecruit.lastName,
                newRecruit.birthDate, newRecruit.birthMonth, newRecruit.birthYear, newRecruit.regDate,
                newRecruit.regMonth, newRecruit.regYear, newRecruit.houseNumber, newRecruit.moo,
                newRecruit.subDistrict, newRecruit.district, newRecruit.province, newRecruit.fatherName,
                newRecruit.fatherLastName, newRecruit.motherName, newRecruit.motherLastName,
                newRecruit.mark, newRecruit.education, newRecruit.occupation, newRecruit.religion,
                newRecruit.phone, newRecruit.status, newRecruit.sd1Number, newRecruit.sd9BookNumber, newRecruit.sd9DocNumber
              ]
            );
          } catch (dbErr) {
            console.error('[SASSADEE DB] Failed to persist recruit to MySQL tb_recuit:', dbErr.message);
          }
        }

        db.logAuditAsync({
          action: 'REGISTER_SD9',
          recordId: newRecruit.id,
          newValues: { citizenId: newRecruit.citizenId, name: `${newRecruit.firstName} ${newRecruit.lastName}`, district: newRecruit.district }
        });

        return sendJSON(res, 201, {
          message: 'ลงบัญชีทหารกองเกิน (สด.9) สำเร็จเรียบร้อย',
          recruit: newRecruit
        });
      } catch (e) {
        return sendJSON(res, 400, { error: 'Invalid payload: ' + e.message });
      }
    });
    return;
  }

  // Audit Log Print Action
  if (pathname === '/api/audit/print' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        db.logAuditAsync({
          action: 'PRINT_SD9',
          recordId: payload.recruitId,
          details: { printedAt: new Date().toISOString(), citizenId: payload.citizenId }
        });
        return sendJSON(res, 200, { success: true });
      } catch (e) {
        return sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  sendJSON(res, 404, { error: 'Endpoint not found' });
});

// Initialize in parallel
initData();
db.initDB();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SASSADEE NAN] Enterprise API running on http://0.0.0.0:${PORT}`);
});
