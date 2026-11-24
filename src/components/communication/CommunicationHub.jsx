import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Announcements from './Announcements';
import Issues from './Issues';
import Polls from './Polls';
import { Megaphone, Wrench, Vote, MessageSquare } from 'lucide-react';

export const CommunicationHub = () => {
  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'issues' | 'polls'
  const { buildingData } = useAuth();

  const announcementsCount = buildingData?.announcements?.length || 0;
  const pendingIssuesCount = (buildingData?.issues || []).filter((i) => i.status !== 'resolved').length;
  const activePollsCount = (buildingData?.polls || []).filter((p) => p.isActive).length;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* ÜST BAŞLIK */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-600" />
          İletişim ve Karar Merkezi
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Apartman duyuruları, ortak alan arıza bildirimleri ve karar anketleri
        </p>
      </div>

      {/* İÇ SEKMELER */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Duyurular ({announcementsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'issues'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Arıza Bildirimi ({pendingIssuesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('polls')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'polls'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Karar Anketleri ({activePollsCount})</span>
        </button>
      </div>

      {/* AKTİF İÇERİK */}
      <div>
        {activeTab === 'announcements' && <Announcements />}
        {activeTab === 'issues' && <Issues />}
        {activeTab === 'polls' && <Polls />}
      </div>

    </div>
  );
};
export default CommunicationHub;
