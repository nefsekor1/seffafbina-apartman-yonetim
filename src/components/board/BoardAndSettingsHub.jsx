import React, { useState } from 'react';
import BulletinBoardPrint from './BulletinBoardPrint';
import AuditorStampSection from './AuditorStampSection';
import BuildingSettings from './BuildingSettings';
import { FileText, Stamp, Settings } from 'lucide-react';

export const BoardAndSettingsHub = () => {
  const [subTab, setSubTab] = useState('board'); // 'board' | 'audits' | 'settings'

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* ÜST BAŞLIK */}
      <div className="no-print">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600" />
          Mantar Pano Raporu &amp; Apartman Ayarları
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          A4 resmi pano dökümü, denetçi dijital onayları ve sistem parametreleri
        </p>
      </div>

      {/* SEKMELER (Yazdırmada Gizlenir: no-print) */}
      <div className="no-print flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setSubTab('board')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            subTab === 'board'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mantar Pano A4 Raporu</span>
        </button>

        <button
          onClick={() => setSubTab('audits')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            subTab === 'audits'
              ? 'bg-teal-700 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Stamp className="w-4 h-4" />
          <span>Denetçi Onayları</span>
        </button>

        <button
          onClick={() => setSubTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            subTab === 'settings'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Apartman Ayarları &amp; Yedek</span>
        </button>
      </div>

      {/* İÇERİK */}
      <div>
        {subTab === 'board' && <BulletinBoardPrint />}
        {subTab === 'audits' && <AuditorStampSection />}
        {subTab === 'settings' && <BuildingSettings />}
      </div>

    </div>
  );
};
export default BoardAndSettingsHub;
