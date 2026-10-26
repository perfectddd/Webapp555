import React, { useState, useEffect } from 'react';
import { isValidThaiID, formatThaiID, THAI_MONTHS, calculateMilitaryYears, getCurrentThaiYear } from '../utils/thaiUtils';

const SAMPLE_ROADS = [
  'ถนนสุริยพงษ์', 'ถนนอนันตวรฤทธิเดช', 'ถนนมหายศ', 'ถนนผากอง', 'ถนนสุมนเทวราช',
  'ถนนเจษฎาบดินทร์', 'ถนนเปรมประชาราษฎร์', 'ถนนรอบเมือง', 'ถนนน่าน-พะเยา',
  'ถนนน่าน-ท่าวังผา', 'ถนนน่าน-แม่จริม', 'ถนนน่าน-เวียงสา', 'ถนนน่าน-บ้านหลวง'
];

const SAMPLE_SOIS = [
  'ซอย 1', 'ซอย 2', 'ซอย 3', 'ซอย 4', 'ซอย 5', 'ซอยวัดช้างค้ำ', 'ซอยภูมินทร์',
  'ซอยมณเฑียร', 'ซอยบ้านดอน', 'ซอยพญาภู', 'ซอยดอนแก้ว', 'ซอยสวนตาล'
];

export default function RegistrationForm({ amphurs, onSaveSuccess, onCancel }) {
  const currentThaiYear = getCurrentThaiYear();
  const defaultBirthYear = currentThaiYear - 17;

  const [formData, setFormData] = useState({
    citizenId: '',
    title: 'นาย',
    firstName: '',
    lastName: '',
    birthDate: '1',
    birthMonth: 'มกราคม',
    birthYear: defaultBirthYear.toString(),
    religion: 'พุทธ',
    occupation: 'รับจ้าง',
    education: 'มัธยมศึกษาปีที่ ๖',
    mark: 'ปกติ',
    phone: '',
    province: 'น่าน',
    district: amphurs[0]?.amphur_th || 'เมืองน่าน',
    amphurCode: amphurs[0]?.amphur_code || 5501,
    subDistrict: '',
    moo: '1',
    houseNumber: '',
    road: '',
    soi: '',
    fatherName: '',
    fatherLastName: '',
    fatherNationality: 'ไทย',
    motherName: '',
    motherLastName: '',
    motherNationality: 'ไทย',
    regDate: new Date().getDate().toString(),
    regMonth: THAI_MONTHS[new Date().getMonth()],
    regYear: currentThaiYear.toString(),
    sd9BookNumber: '1',
    sd9DocNumber: '',
    sd1Number: ''
  });

  const [idValidationState, setIdValidationState] = useState({ valid: false, message: '' });
  const [militaryYears, setMilitaryYears] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  // Autocomplete suggestions
  const [roadSuggestions, setRoadSuggestions] = useState([]);
  const [showRoadSuggest, setShowRoadSuggest] = useState(false);
  const [soiSuggestions, setSoiSuggestions] = useState([]);
  const [showSoiSuggest, setShowSoiSuggest] = useState(false);

  useEffect(() => {
    const raw = formData.citizenId.replace(/\D/g, '');
    if (raw.length === 0) {
      setIdValidationState({ valid: false, message: '' });
    } else if (raw.length < 13) {
      setIdValidationState({ valid: false, message: `ระบุแล้ว ${raw.length}/13 หลัก` });
    } else if (raw.length === 13) {
      const valid = isValidThaiID(raw);
      setIdValidationState({
        valid,
        message: valid ? '✓ เลขประจำตัวประชาชนถูกต้องตามสูตรคำนวณราชการ (Modulo 11)' : '✗ เลขประจำตัวประชาชนไม่ถูกต้อง (Checksum ไม่ตรง)'
      });
    }
  }, [formData.citizenId]);

  useEffect(() => {
    setMilitaryYears(calculateMilitaryYears(formData.birthYear));
  }, [formData.birthYear]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'district') {
        const found = amphurs.find(a => a.amphur_th === value);
        if (found) next.amphurCode = found.amphur_code;
      }
      return next;
    });

    // Handle road autocomplete
    if (name === 'road') {
      if (value.trim()) {
        const filtered = SAMPLE_ROADS.filter(r => r.toLowerCase().includes(value.trim().toLowerCase()));
        setRoadSuggestions(filtered);
        setShowRoadSuggest(true);
      } else {
        setShowRoadSuggest(false);
      }
    }

    // Handle soi autocomplete
    if (name === 'soi') {
      if (value.trim()) {
        const filtered = SAMPLE_SOIS.filter(s => s.toLowerCase().includes(value.trim().toLowerCase()));
        setSoiSuggestions(filtered);
        setShowSoiSuggest(true);
      } else {
        setShowSoiSuggest(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.citizenId || !formData.firstName || !formData.lastName) {
      alert('กรุณากรอกเลขประจำตัวประชาชน ชื่อ และนามสกุล ให้ครบถ้วน');
      return;
    }

    if (!isValidThaiID(formData.citizenId.replace(/\D/g, ''))) {
      if (!confirm('เลขประจำตัวประชาชนอาจไม่ถูกต้องตามสูตรคำนวณราชการ ต้องการยืนยันบันทึกข้อมูลหรือไม่?')) {
        return;
      }
    }

    setIsSubmitting(true);

    const newRecord = {
      ...formData,
      citizenId: formData.citizenId.replace(/\D/g, ''),
      birthDate: parseInt(formData.birthDate, 10),
      birthYear: parseInt(formData.birthYear, 10),
      regDate: parseInt(formData.regDate, 10),
      regYear: parseInt(formData.regYear, 10),
      moo: parseInt(formData.moo || '1', 10),
      sd9DocNumber: formData.sd9DocNumber || Math.floor(100 + Math.random() * 900).toString(),
      sd1Number: formData.sd1Number || Math.floor(100 + Math.random() * 900).toString(),
      id: `${formData.amphurCode || 5501}01${formData.birthYear.slice(-2)}${Math.floor(100 + Math.random() * 900)}`,
      status: 'ลงบัญชีแล้ว (สด.9)',
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessNotice(newRecord);
      if (onSaveSuccess) {
        onSaveSuccess(newRecord);
      }
    }, 300);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            งานทะเบียนทหาร สด.9
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            แบบฟอร์มการแสดงตนเพื่อลงบัญชีทหารกองเกิน (พ.ร.บ. รับราชการทหาร พ.ศ. 2497)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สำหรับการออกใบสำคัญ (แบบ สด.9) และบันทึกลงในสมุดบัญชีทหารกองเกิน (แบบ สด.1) จังหวัดน่าน
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
          >
            ← กลับหน้ารายการ
          </button>
        )}
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✅</span>
            <div>
              <div className="font-bold text-base">
                ลงบัญชีทหารกองเกินสำเร็จ: {successNotice.firstName} {successNotice.lastName}
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                ออกใบสำคัญ สด.9 เล่มที่ {successNotice.sd9BookNumber} เลขที่ {successNotice.sd9DocNumber} | ภูมิลำเนา อ.{successNotice.district}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSuccessNotice(null)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
            >
              ลงบัญชีนายต่อไป
            </button>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Section 1: ข้อมูลบุคคล */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base mb-4">
            <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-sm">1</span>
            <span>ข้อมูลประจำตัวผู้ขอลงบัญชีทหารกองเกิน</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลขประจำตัวประชาชน 13 หลัก <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="citizenId"
                value={formData.citizenId}
                onChange={handleChange}
                maxLength="17"
                placeholder="เช่น 1-5501-00123-45-6"
                required
                className={`w-full px-3.5 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 ${
                  idValidationState.valid
                    ? 'border-emerald-500 ring-emerald-200 bg-emerald-50/20'
                    : formData.citizenId.length === 13 && !idValidationState.valid
                    ? 'border-red-400 ring-red-100 bg-red-50/20'
                    : 'border-slate-300 focus:ring-emerald-400 focus:border-emerald-500'
                }`}
              />
              {idValidationState.message && (
                <p className={`text-xs mt-1 ${idValidationState.valid ? 'text-emerald-600 font-semibold' : 'text-amber-600'}`}>
                  {idValidationState.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำนำหน้าชื่อ <span className="text-red-500">*</span>
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="นาย">นาย</option>
                <option value="สามเณร">สามเณร</option>
                <option value="พระภิกษุ">พระภิกษุ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="ชื่อตัว"
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="นามสกุล"
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="เช่น 081-234-5678"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Date of Birth & Conscription Timetable */}
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เกิดวันที่
                </label>
                <select
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เดือนเกิด
                </label>
                <select
                  name="birthMonth"
                  value={formData.birthMonth}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {THAI_MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ปีเกิด (พ.ศ.)
                </label>
                <input
                  type="number"
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-600">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                <strong>ปีลงบัญชี (สด.9 ย่าง 18 ปี):</strong>&nbsp;พ.ศ. {militaryYears.regYearBE || '-'}
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                <strong>ปีรับหมายเรียก (สด.35 อายุ 20 ปี):</strong>&nbsp;พ.ศ. {militaryYears.callYearBE || '-'}
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                <strong>ปีตรวจเลือก (สด.43 อายุ 21 ปี):</strong>&nbsp;พ.ศ. {militaryYears.recruitYearBE || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: ภูมิลำเนาทหาร (จังหวัดน่าน 15 อำเภอ) พร้อม Autocomplete ถนนและซอย */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base mb-4">
            <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-sm">2</span>
            <span>ภูมิลำเนาทหาร (ที่อยู่ตามทะเบียนบ้านที่ลงบัญชี)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                จังหวัด <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                readOnly
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-100 font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                อำเภอ (15 อำเภอใน จ.น่าน) <span className="text-red-500">*</span>
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-400"
              >
                {amphurs.map(a => (
                  <option key={a.amphur_code} value={a.amphur_th}>
                    อ.{a.amphur_th} ({a.amphur_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ตำบล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subDistrict"
                value={formData.subDistrict}
                onChange={handleChange}
                placeholder="เช่น ในเวียง / ผาสิงห์"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หมู่ที่
              </label>
              <input
                type="number"
                name="moo"
                value={formData.moo}
                onChange={handleChange}
                placeholder="เช่น 1"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                บ้านเลขที่
              </label>
              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                placeholder="เช่น 123/4"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            {/* Road Autocomplete Input (Optimized: not loading 8,439 roads into a select) */}
            <div className="relative md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ถนน (พิมพ์เพื่อค้นหาแบบ Autocomplete)
              </label>
              <input
                type="text"
                name="road"
                value={formData.road}
                onChange={handleChange}
                onFocus={() => setShowRoadSuggest(true)}
                onBlur={() => setTimeout(() => setShowRoadSuggest(false), 200)}
                placeholder="เช่น ถนนสุริยพงษ์"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
              {showRoadSuggest && roadSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto text-xs">
                  {roadSuggestions.map(road => (
                    <div
                      key={road}
                      onMouseDown={() => {
                        setFormData(p => ({ ...p, road }));
                        setShowRoadSuggest(false);
                      }}
                      className="px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
                    >
                      {road}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Soi Autocomplete Input */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ตรอก / ซอย
              </label>
              <input
                type="text"
                name="soi"
                value={formData.soi}
                onChange={handleChange}
                onFocus={() => setShowSoiSuggest(true)}
                onBlur={() => setTimeout(() => setShowSoiSuggest(false), 200)}
                placeholder="เช่น ซอย 3"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
              {showSoiSuggest && soiSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto text-xs">
                  {soiSuggestions.map(soi => (
                    <div
                      key={soi}
                      onMouseDown={() => {
                        setFormData(p => ({ ...p, soi }));
                        setShowSoiSuggest(false);
                      }}
                      className="px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
                    >
                      {soi}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: ข้อมูลครอบครัว */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base mb-4">
            <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-sm">3</span>
            <span>ข้อมูลบิดา - มารดา และคุณลักษณะ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อบิดา
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="ชื่อบิดา"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                นามสกุลบิดา
              </label>
              <input
                type="text"
                name="fatherLastName"
                value={formData.fatherLastName}
                onChange={handleChange}
                placeholder="นามสกุลบิดา"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อมารดา
              </label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                placeholder="ชื่อมารดา"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                นามสกุลมารดา
              </label>
              <input
                type="text"
                name="motherLastName"
                value={formData.motherLastName}
                onChange={handleChange}
                placeholder="นามสกุลมารดา"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ตำหนิสำคัญ
              </label>
              <input
                type="text"
                name="mark"
                value={formData.mark}
                onChange={handleChange}
                placeholder="เช่น ไฝแก้มขวา / ปกติ"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                การศึกษา / ความรู้
              </label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="มัธยมศึกษาปีที่ ๖">มัธยมศึกษาปีที่ ๖</option>
                <option value="มัธยมศึกษาปีที่ ๓">มัธยมศึกษาปีที่ ๓</option>
                <option value="ประกาศนียบัตรวิชาชีพ (ปวช.)">ประกาศนียบัตรวิชาชีพ (ปวช.)</option>
                <option value="ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)">ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)</option>
                <option value="ปริญญาตรี">ปริญญาตรี</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: การออกเอกสารราชการ (สด.9 & สด.1) */}
        <div className="p-6 bg-emerald-50/30">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base mb-4">
            <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-sm">4</span>
            <span>รายละเอียดการออกใบสำคัญ (แบบ สด.9) และการลงบัญชี</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ใบสำคัญ (สด.9) เล่มที่
              </label>
              <input
                type="text"
                name="sd9BookNumber"
                value={formData.sd9BookNumber}
                onChange={handleChange}
                placeholder="เช่น 1"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ใบสำคัญ (สด.9) เลขที่
              </label>
              <input
                type="text"
                name="sd9DocNumber"
                value={formData.sd9DocNumber}
                onChange={handleChange}
                placeholder="ปล่อยว่างเพื่อรันอัตโนมัติ"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลขที่ในสมุด สด.1
              </label>
              <input
                type="text"
                name="sd1Number"
                value={formData.sd1Number}
                onChange={handleChange}
                placeholder="ปล่อยว่างเพื่อรันอัตโนมัติ"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                วันที่ลงบัญชีทหารกองเกิน
              </label>
              <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-300 font-medium">
                {formData.regDate} {formData.regMonth} พ.ศ. {formData.regYear}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            * ข้อมูลจะถูกจัดเก็บเข้าสู่ฐานข้อมูลระบบสัสดี พร้อมออกใบสำคัญ สด.9 ทันที
          </span>
          <div className="flex space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-white"
              >
                ยกเลิก
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <span>💾 บันทึกการลงบัญชี สด.9</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
