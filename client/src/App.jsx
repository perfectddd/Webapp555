import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import RegistrationForm from './components/RegistrationForm';
import RecruitList from './components/RecruitList';
import PrintPreviewSD9 from './components/PrintPreviewSD9';
import RecruitDetailModal from './components/RecruitDetailModal';

// Initial seed data from exported Access DB
import initialAmphurs from './data/amphur.json';
import initialRecruitRecords from './data/recruit_records.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recruits, setRecruits] = useState([]);
  const [amphurs, setAmphurs] = useState([]);
  const [selectedRecruitForPrint, setSelectedRecruitForPrint] = useState(null);
  const [selectedRecruitForDetail, setSelectedRecruitForDetail] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);

  // Initialize data on load
  useEffect(() => {
    // 1. Set local amphurs
    setAmphurs(initialAmphurs || []);

    // 2. Try fetching from Backend API, otherwise fallback to local dataset
    fetch('http://localhost:4000/api/recruits?limit=500')
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          setRecruits(data.data);
          setApiConnected(true);
        } else {
          loadFallbackData();
        }
      })
      .catch(() => {
        loadFallbackData();
      });
  }, []);

  const loadFallbackData = () => {
    // Normalize raw Access database samples
    const normalized = (initialRecruitRecords || []).map((r, idx) => ({
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
    setRecruits(normalized);
  };

  // Add new recruit
  const handleSaveSuccess = (newRecruit) => {
    setRecruits(prev => [newRecruit, ...prev]);
    // Also post to backend if connected
    if (apiConnected) {
      fetch('http://localhost:4000/api/recruits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecruit)
      }).catch(err => console.warn('Could not sync with backend:', err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recruitCount={recruits.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            recruits={recruits}
            amphurs={amphurs}
            onRegisterClick={() => setActiveTab('register')}
            onViewRecruit={(r) => setSelectedRecruitForDetail(r)}
          />
        )}

        {activeTab === 'register' && (
          <RegistrationForm
            amphurs={amphurs}
            onSaveSuccess={(newRecruit) => {
              handleSaveSuccess(newRecruit);
              setSelectedRecruitForPrint(newRecruit);
            }}
            onCancel={() => setActiveTab('list')}
          />
        )}

        {activeTab === 'list' && (
          <RecruitList
            recruits={recruits}
            amphurs={amphurs}
            onPrintSD9={(r) => setSelectedRecruitForPrint(r)}
            onSelectRecruit={(r) => setSelectedRecruitForDetail(r)}
            onRegisterNew={() => setActiveTab('register')}
          />
        )}

        {activeTab === 'import' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl mx-auto">
              📂
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              นำเข้าข้อมูลทหารกองเกินจากทะเบียนราษฎร์ (DOPA / Excel)
            </h3>
            <p className="text-sm text-slate-600">
              รองรับไฟล์ Excel (.xlsx, .xls) หรือ CSV สำหรับการลงบัญชีทหารกองเกินแบบกลุ่ม (Batch Registration) ประจำปีของอำเภอ
            </p>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer">
              <span className="text-4xl block mb-2">📑</span>
              <p className="text-sm font-semibold text-slate-700">คลิกหรือลากไฟล์ Excel รายชื่อมาวางที่นี่</p>
              <p className="text-xs text-slate-400 mt-1">ขนาดไฟล์ไม่เกิน 50MB</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        ระบบงานสัสดีอิเล็กทรอนิกส์ (SASSADEE NAN) — กองการสัสดี มณฑลทหารบกที่ 38 จังหวัดน่าน | พร้อมวางระบบบน Linux Debian
      </footer>

      {/* Print SD9 Modal */}
      {selectedRecruitForPrint && (
        <PrintPreviewSD9
          recruit={selectedRecruitForPrint}
          onClose={() => setSelectedRecruitForPrint(null)}
        />
      )}

      {/* Detail Modal */}
      {selectedRecruitForDetail && (
        <RecruitDetailModal
          recruit={selectedRecruitForDetail}
          onClose={() => setSelectedRecruitForDetail(null)}
          onPrintSD9={(r) => {
            setSelectedRecruitForDetail(null);
            setSelectedRecruitForPrint(r);
          }}
        />
      )}
    </div>
  );
}
