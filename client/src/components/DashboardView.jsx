import React from 'react';

export default function DashboardView({ recruits, amphurs, onRegisterClick, onViewRecruit }) {
  // Aggregate stats
  const total = recruits.length;
  
  // By district
  const districtCounts = {};
  amphurs.forEach(a => { districtCounts[a.amphur_th] = 0; });
  recruits.forEach(r => {
    const d = r.district || 'เมืองน่าน';
    districtCounts[d] = (districtCounts[d] || 0) + 1;
  });

  // By birth year
  const yearCounts = {};
  recruits.forEach(r => {
    const y = r.birthYear || 2547;
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });

  // Sort birth years
  const sortedYears = Object.keys(yearCounts).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold mb-2 border border-emerald-400/30">
              ภารกิจงานสัสดี ปี พ.ศ. 2569
            </span>
            <h2 className="text-2xl font-bold">
              ภาพรวมการลงบัญชีทหารกองเกิน จังหวัดน่าน (15 อำเภอ)
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              ทหารกองเกินที่ต้องแสดงตนลงบัญชี: ชายไทยเกิด พ.ศ. 2552 (ย่างเข้า 18 ปี ในปี 2569) และบุคคลตกค้าง
            </p>
          </div>
          <button
            onClick={onRegisterClick}
            className="self-start md:self-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <span>➕</span>
            <span>บันทึกลงบัญชี สด.9 รายใหม่</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            ยอดทหารกองเกินในระบบ
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {total.toLocaleString()} <span className="text-sm font-normal text-slate-500">นาย</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
            <span>✓ ข้อมูลพร้อมใช้งานและพิมพ์ สด.9</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            พื้นที่รับผิดชอบ
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            15 <span className="text-sm font-normal text-slate-500">อำเภอ</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            ครอบคลุมทุกอำเภอในจังหวัดน่าน (มทบ.38)
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            ยอดปีเกิดหลัก (พ.ศ. 2547)
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 mt-2">
            {(yearCounts['2547'] || 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">นาย</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            พร้อมเข้าสู่กระบวนการตรวจเลือก สด.43
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            สถานะเซิร์ฟเวอร์ฐานข้อมูล
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Debian Linux Ready</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            รองรับ Nginx + Node.js API + Docker
          </div>
        </div>
      </div>

      {/* Two Column Layout: District breakdown & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              📍 ยอดการลงบัญชีทหารกองเกิน แยกตาม 15 อำเภอ (จังหวัดน่าน)
            </h3>
            <span className="text-xs text-slate-400">เรียงตามรหัสอำเภอ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {amphurs.map(a => {
              const count = districtCounts[a.amphur_th] || 0;
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
              return (
                <div
                  key={a.amphur_code}
                  className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800">
                      อ.{a.amphur_th}
                    </span>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {a.amphur_code}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-emerald-800">
                      {count.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, percentage * 2))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Recruits Widget (1 Col) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              📋 รายการลงบัญชีล่าสุด
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
              สด.9
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px]">
            {recruits.slice(0, 8).map(r => (
              <div
                key={r.id || r.citizenId}
                onClick={() => onViewRecruit && onViewRecruit(r)}
                className="p-3 rounded-lg border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {r.firstName} {r.lastName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      เลขประจำตัว: {r.citizenId}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    อ.{r.district}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-2 flex justify-between">
                  <span>เกิด พ.ศ. {r.birthYear}</span>
                  <span>ใบสำคัญเล่ม {r.sd9BookNumber || '1'} เลข {r.sd9DocNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
