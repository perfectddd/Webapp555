import React, { useState, useEffect, useMemo } from 'react';
import { formatThaiID } from '../utils/thaiUtils';

export default function RecruitList({ recruits, amphurs, onPrintSD9, onSelectRecruit, onRegisterNew }) {
  const [inputSearch, setInputSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // 300ms Debounce to prevent heavy UI recalculations or rapid API hits
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(inputSearch);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [inputSearch]);

  // Filtered recruits using debounced search query
  const filteredRecruits = useMemo(() => {
    return recruits.filter(r => {
      if (selectedDistrict && r.district !== selectedDistrict) return false;
      if (selectedYear && r.birthYear?.toString() !== selectedYear) return false;
      if (debouncedSearch) {
        const term = debouncedSearch.trim().toLowerCase();
        const fullName = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
        const cid = (r.citizenId || '').toString();
        const id = (r.id || '').toString().toLowerCase();
        const sub = (r.subDistrict || '').toLowerCase();
        if (!fullName.includes(term) && !cid.includes(term) && !id.includes(term) && !sub.includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [recruits, debouncedSearch, selectedDistrict, selectedYear]);

  // Pagination
  const totalPages = Math.ceil(filteredRecruits.length / pageSize) || 1;
  const paginatedRecruits = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecruits.slice(start, start + pageSize);
  }, [filteredRecruits, currentPage]);

  // Unique birth years for filter
  const birthYears = useMemo(() => {
    const set = new Set();
    recruits.forEach(r => { if (r.birthYear) set.add(r.birthYear); });
    return Array.from(set).sort((a, b) => b - a);
  }, [recruits]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box with Debounce (300ms) */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="🔍 ค้นหาด้วยชื่อ, นามสกุล, เลข ปชช. 13 หลัก, หรือตำบล (Debounced 300ms)..."
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {inputSearch && (
              <button
                onClick={() => { setInputSearch(''); setDebouncedSearch(''); }}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕ ล้าง
              </button>
            )}
          </div>

          {/* District filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="">ทุกอำเภอ (15 อำเภอ น่าน)</option>
              {amphurs.map(a => (
                <option key={a.amphur_code} value={a.amphur_th}>
                  อ.{a.amphur_th}
                </option>
              ))}
            </select>
          </div>

          {/* Year filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="">ทุกปีเกิด (พ.ศ.)</option>
              {birthYears.map(y => (
                <option key={y} value={y}>พ.ศ. {y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            พบข้อมูลทหารกองเกินทั้งสิ้น <strong>{filteredRecruits.length.toLocaleString()}</strong> นาย 
            {filteredRecruits.length !== recruits.length && ` (จากทั้งหมด ${recruits.length.toLocaleString()} นาย)`}
          </div>
          <button
            onClick={onRegisterNew}
            className="self-start sm:self-auto px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center space-x-1"
          >
            <span>➕ ลงบัญชี สด.9 ใหม่</span>
          </button>
        </div>
      </div>

      {/* Recruits Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">ลำดับ / เลข สด.1</th>
                <th className="px-4 py-3 text-left">เลขประจำตัวประชาชน</th>
                <th className="px-4 py-3 text-left">ชื่อ - นามสกุล</th>
                <th className="px-4 py-3 text-left">วันเดือนปีเกิด</th>
                <th className="px-4 py-3 text-left">ภูมิลำเนาทหาร</th>
                <th className="px-4 py-3 text-left">ใบสำคัญ สด.9</th>
                <th className="px-4 py-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedRecruits.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
                    ไม่พบข้อมูลทหารกองเกินตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                paginatedRecruits.map((r, idx) => (
                  <tr key={r.id || r.citizenId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      <div>{(currentPage - 1) * pageSize + idx + 1}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">สด.1: {r.sd1Number || '-'}</div>
                    </td>

                    <td className="px-4 py-3 font-mono text-xs font-medium text-slate-800">
                      {formatThaiID(r.citizenId)}
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-900">
                      {r.firstName} {r.lastName}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      {r.birthDate} {r.birthMonth} {r.birthYear}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <span className="font-semibold text-slate-800">อ.{r.district}</span>
                      <div className="text-slate-500">ต.{r.subDistrict || '-'} ม.{r.moo || '-'}</div>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                        เล่ม {r.sd9BookNumber || '1'} เลข {r.sd9DocNumber || '-'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onSelectRecruit && onSelectRecruit(r)}
                          title="ดูรายละเอียดฉบับเต็ม"
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                        >
                          👁️ รายละเอียด
                        </button>
                        <button
                          onClick={() => onPrintSD9 && onPrintSD9(r)}
                          title="พิมพ์ใบสำคัญ (แบบ สด.9)"
                          className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center space-x-1 shadow-sm"
                        >
                          <span>🖨️</span>
                          <span>พิมพ์ สด.9</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              หน้า {currentPage} จากทั้งหมด {totalPages} หน้า (แสดงทีละ {pageSize} รายการ)
            </div>
            <div className="flex space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40"
              >
                « แรกสุด
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border border-slate-300 bg-white disabled:opacity-40"
              >
                ‹ ก่อนหน้า
              </button>
              <span className="px-3 py-1 bg-emerald-600 text-white rounded font-semibold">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border border-slate-300 bg-white disabled:opacity-40"
              >
                ถัดไป ›
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40"
              >
                ท้ายสุด »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
