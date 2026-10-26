// Thai Citizen ID validator and Date/Calculation utilities

export function isValidThaiID(id) {
  if (!id) return false;
  const cleanId = id.toString().replace(/[-\s]/g, '');
  if (cleanId.length !== 13 || !/^\d{13}$/.test(cleanId)) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanId.charAt(i), 10) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(cleanId.charAt(12), 10);
}

export function formatThaiID(id) {
  if (!id) return '';
  const clean = id.toString().replace(/\D/g, '');
  if (clean.length !== 13) return id;
  return `${clean.slice(0, 1)}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean.slice(12, 13)}`;
}

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export function calculateMilitaryYears(birthYearBE) {
  const y = parseInt(birthYearBE, 10);
  if (isNaN(y)) return {};
  return {
    regYearBE: y + 17,    // อายุครบ 17 บริบูรณ์ (ลงบัญชี สด.9 ในปีที่ย่างเข้า 18)
    callYearBE: y + 20,   // อายุ 20 ปี รับหมายเรียก สด.35
    recruitYearBE: y + 21 // อายุ 21 ปี ตรวจเลือกเข้ากองประจำการ สด.43
  };
}

export function getCurrentThaiYear() {
  return new Date().getFullYear() + 543;
}
