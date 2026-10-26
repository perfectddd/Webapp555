import React from 'react';

export default function Header({ activeTab, setActiveTab, recruitCount }) {
  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center shadow-md border-2 border-emerald-400">
              <span className="text-2xl font-bold">🎖️</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  ระบบงานสัสดีอิเล็กทรอนิกส์ (SASSADEE NAN)
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30">
                  มทบ.38
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ระบบจัดการทะเบียนและลงบัญชีทหารกองเกิน (แบบ สด.9 / สด.1) จังหวัดน่าน
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            {[
              { id: 'dashboard', label: '📊 แดชบอร์ดภาพรวม' },
              { id: 'register', label: '📝 ลงบัญชีทหารกองเกิน (สด.9)' },
              { id: 'list', label: `👥 ทะเบียนทหารกองเกิน (${recruitCount})` },
              { id: 'import', label: '📥 นำเข้าข้อมูล' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
