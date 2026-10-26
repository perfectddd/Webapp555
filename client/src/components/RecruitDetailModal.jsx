import React from 'react';
import { formatThaiID, calculateMilitaryYears } from '../utils/thaiUtils';

export default function RecruitDetailModal({ recruit, onClose, onPrintSD9 }) {
  if (!recruit) return null;
  const milestones = calculateMilitaryYears(recruit.birthYear);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              ทะเบียน สด.1 / สด.9
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {recruit.firstName} {recruit.lastName}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              เลขประจำตัวประชาชน: {formatThaiID(recruit.citizenId)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-sm">
          {/* Milestone Banner */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-slate-500">ปีลงบัญชี สด.9</div>
              <div className="text-base font-bold text-emerald-700">พ.ศ. {milestones.regYearBE || '-'}</div>
              <div className="text-[10px] text-slate-400">(ย่าง 18 ปี)</div>
            </div>
            <div className="border-x border-slate-200">
              <div className="text-slate-500">ปีรับหมาย สด.35</div>
              <div className="text-base font-bold text-blue-700">พ.ศ. {milestones.callYearBE || '-'}</div>
              <div className="text-[10px] text-slate-400">(อายุ 20 ปี)</div>
            </div>
            <div>
              <div className="text-slate-500">ปีตรวจเลือก สด.43</div>
              <div className="text-base font-bold text-amber-700">พ.ศ. {milestones.recruitYearBE || '-'}</div>
              <div className="text-[10px] text-slate-400">(อายุ 21 ปี)</div>
            </div>
          </div>

          {/* Info Grids */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">วันเดือนปีเกิด</span>
              <strong className="text-slate-900 text-sm">{recruit.birthDate} {recruit.birthMonth} {recruit.birthYear}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">ภูมิลำเนาทหาร</span>
              <strong className="text-slate-900 text-sm">อ.{recruit.district} จ.{recruit.province || 'น่าน'}</strong>
              <div className="text-slate-600">ต.{recruit.subDistrict || '-'} ม.{recruit.moo || '-'} บ้านเลขที่ {recruit.houseNumber || '-'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">ข้อมูลบิดา - มารดา</span>
              <div className="text-slate-800">บิดา: {recruit.fatherName || '-'} {recruit.fatherLastName || ''}</div>
              <div className="text-slate-800">มารดา: {recruit.motherName || '-'} {recruit.motherLastName || ''}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">การศึกษาและอาชีพ</span>
              <div className="text-slate-800">การศึกษา: {recruit.education || '-'}</div>
              <div className="text-slate-800">อาชีพ: {recruit.occupation || '-'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">ตำหนิสำคัญ</span>
              <strong className="text-slate-800">{recruit.mark || 'ปกติ'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">เอกสารทางราชการ</span>
              <div className="text-emerald-800 font-semibold">ใบสำคัญ สด.9: เล่ม {recruit.sd9BookNumber || '1'} เลข {recruit.sd9DocNumber || '-'}</div>
              <div className="text-slate-600">เลขที่สมุด สด.1: {recruit.sd1Number || '-'}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50"
          >
            ปิด
          </button>
          <button
            onClick={() => { onClose(); onPrintSD9(recruit); }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-lg flex items-center space-x-1.5 shadow-md"
          >
            <span>🖨️</span>
            <span>พิมพ์ใบสำคัญ สด.9</span>
          </button>
        </div>
      </div>
    </div>
  );
}
