import React from 'react';
import { formatThaiID } from '../utils/thaiUtils';

export default function PrintPreviewSD9({ recruit, onClose }) {
  if (!recruit) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Outer Modal Container */}
      <div className="bg-slate-100 rounded-2xl max-w-4xl w-full p-4 sm:p-6 my-8 shadow-2xl border border-slate-300">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="print:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-300">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🖨️</span>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                ตัวอย่างพิมพ์ใบสำคัญ (แบบ สด.๙)
              </h3>
              <p className="text-xs text-slate-500">
                แบบพิมพ์มาตรฐานกองการสัสดี กองทัพบก สำหรับมอบให้ผู้ลงบัญชีทหารกองเกิน
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-md"
            >
              <span>🖨️</span>
              <span>พิมพ์เอกสาร (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

        {/* Official SD9 Certificate Sheet (A4 Proportion) */}
        <div className="print-area bg-white p-8 sm:p-12 mx-auto rounded-lg shadow-md border-2 border-slate-800 text-slate-900 max-w-[210mm] font-serif leading-relaxed relative">
          {/* Official Corner Reference */}
          <div className="flex justify-between items-start text-xs font-sans text-slate-600 mb-2">
            <div>
              สมุด สด.๑ เล่มที่ <strong>{recruit.sd9BookNumber || '๑'}</strong> เลขที่ <strong>{recruit.sd1Number || recruit.sd9DocNumber || '๑'}</strong>
            </div>
            <div className="font-bold text-sm text-slate-900">
              แบบ สด.๙
            </div>
          </div>

          {/* Thai Garuda Crest (ตราครุฑ) */}
          <div className="text-center my-3">
            <div className="inline-block text-4xl leading-none">
              🦅
            </div>
            <div className="text-[11px] font-sans text-slate-500 uppercase tracking-widest mt-1">
              (ตราครุฑพ่าห์)
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl font-bold tracking-wide">
              ใบสำคัญ
            </h2>
            <p className="text-sm font-medium">
              (หนังสือสำคัญแสดงการลงบัญชีทหารกองเกิน)
            </p>
          </div>

          {/* Document Body */}
          <div className="text-sm space-y-4 text-justify">
            <p className="indent-8 leading-loose">
              ใบสำคัญนี้ออกให้แก่ <strong>{recruit.firstName} {recruit.lastName}</strong>
              &nbsp;เลขประจำตัวประชาชน <strong>{formatThaiID(recruit.citizenId)}</strong>
              &nbsp;เกิดวันที่ <strong>{recruit.birthDate}</strong> เดือน <strong>{recruit.birthMonth}</strong> พ.ศ. <strong>{recruit.birthYear}</strong>
              &nbsp;สัญชาติ <strong>ไทย</strong> ศาสนา <strong>{recruit.religion || 'พุทธ'}</strong>
              &nbsp;อาชีพ <strong>{recruit.occupation || 'รับจ้าง'}</strong>
            </p>

            <p className="indent-8 leading-loose">
              บิดาชื่อ <strong>{recruit.fatherName || '-'} {recruit.fatherLastName || ''}</strong> สัญชาติ <strong>ไทย</strong>
              &nbsp;มารดาชื่อ <strong>{recruit.motherName || '-'} {recruit.motherLastName || ''}</strong> สัญชาติ <strong>ไทย</strong>
              &nbsp;ภูมิลำเนาทหารอยู่บ้านเลขที่ <strong>{recruit.houseNumber || '-'}</strong>
              &nbsp;หมู่ที่ <strong>{recruit.moo || '๑'}</strong>
              &nbsp;ตรอก/ซอย <strong>{recruit.road || '-'}</strong>
              &nbsp;ตำบล <strong>{recruit.subDistrict || '-'}</strong>
              &nbsp;อำเภอ <strong>{recruit.district || 'เมืองน่าน'}</strong>
              &nbsp;จังหวัด <strong>{recruit.province || 'น่าน'}</strong>
            </p>

            <p className="indent-8 leading-loose">
              ตำหนิสำคัญ <strong>{recruit.mark || 'ปกติ'}</strong>
              &nbsp;ได้แสดงตนลงบัญชีทหารกองเกินไว้ที่อำเภอ <strong>{recruit.district || 'เมืองน่าน'}</strong>
              &nbsp;จังหวัด <strong>{recruit.province || 'น่าน'}</strong>
              &nbsp;เมื่อวันที่ <strong>{recruit.regDate || '๑'}</strong> เดือน <strong>{recruit.regMonth || 'มกราคม'}</strong> พ.ศ. <strong>{recruit.regYear || '๒๕๖๙'}</strong>
              &nbsp;แล้ว และได้รับหมายเลขประจำตัวทหารกองเกิน <strong>{recruit.id || '-'}</strong>
            </p>
          </div>

          {/* Signature Block */}
          <div className="mt-12 flex justify-end">
            <div className="w-64 text-center text-xs space-y-2">
              <div className="font-serif">
                ออกให้ ณ วันที่ <strong>{recruit.regDate || '๑'}</strong> เดือน <strong>{recruit.regMonth || 'มกราคม'}</strong> พ.ศ. <strong>{recruit.regYear || '๒๕๖๙'}</strong>
              </div>
              <div className="h-12 flex items-center justify-center text-slate-400 italic">
                (ลงลายมือชื่อและประทับตรา)
              </div>
              <div className="border-b border-dotted border-slate-700 w-44 mx-auto"></div>
              <div className="font-bold">
                (............................................................)
              </div>
              <div className="font-medium">
                สัสดีอำเภอ{recruit.district || 'เมืองน่าน'}
              </div>
            </div>
          </div>

          {/* Notice to Citizens (คำเตือนสำคัญตามกฎหมาย) */}
          <div className="mt-10 pt-4 border-t-2 border-slate-800 text-[11px] space-y-1.5 bg-slate-50 p-4 rounded border font-sans">
            <div className="font-bold text-slate-900 text-center">
              คำเตือนและข้อควรปฏิบัติของทหารกองเกิน (พ.ร.บ. รับราชการทหาร พ.ศ. ๒๔๙๗)
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-700">
              <li>
                <strong>ต้องเก็บรักษาใบสำคัญ (สด.๙) นี้ไว้ให้ดี</strong> อย่าให้ชำรุด สูญหาย หากสูญหายให้รีบแจ้งต่อนายอำเภอท้องที่ภูมิลำเนาทหารเพื่อขอรับใบแทน
              </li>
              <li>
                เมื่อมีอายุครบ ๒๐ ปีบริบูรณ์ (ในปี พ.ศ. <strong>{recruit.birthYear ? recruit.birthYear + 20 : '-'}</strong>) <strong>ต้องไปรับหมายเรียก (แบบ สด.๓๕)</strong> ณ ที่ว่าการอำเภอภูมิลำเนาทหาร
              </li>
              <li>
                เมื่อมีอายุครบ ๒๑ ปีบริบูรณ์ (ในปี พ.ศ. <strong>{recruit.birthYear ? recruit.birthYear + 21 : '-'}</strong>) <strong>ต้องไปเข้ารับการตรวจเลือกทหารกองประจำการ (สด.๔๓)</strong> ตามกำหนดในหมายเรียก
              </li>
              <li>
                หากย้ายภูมิลำเนาทหาร ต้องแจ้งต่อนายอำเภอท้องที่ภายใน ๓๐ วัน นับแต่วันที่ย้าย
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
