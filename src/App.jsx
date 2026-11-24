import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/auth/LoginScreen';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';

// Sayfalar & Modüller
import Dashboard from './components/dashboard/Dashboard';
import FlatList from './components/flats/FlatList';
import ExpenseList from './components/expenses/ExpenseList';
import CommunicationHub from './components/communication/CommunicationHub';
import BoardAndSettingsHub from './components/board/BoardAndSettingsHub';
import SuperAdminPanel from './components/superadmin/SuperAdminPanel';

// Modallar
import CollectionModal from './components/flats/CollectionModal';
import BulkAccrualModal from './components/flats/BulkAccrualModal';
import AddExpenseModal from './components/expenses/AddExpenseModal';
import ReceiptLightboxModal from './components/expenses/ReceiptLightboxModal';
import BuildingSwitchModal from './components/common/BuildingSwitchModal';

import { Loader2 } from 'lucide-react';

const MainAppContent = () => {
  const { session, userRole, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal Durumları
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [selectedFlatForCollection, setSelectedFlatForCollection] = useState(null);
  const [isAccrualOpen, setIsAccrualOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState(null);
  const [isBuildingSwitchOpen, setIsBuildingSwitchOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-sm font-semibold tracking-wide">ŞeffafBina Yükleniyor...</span>
      </div>
    );
  }

  // Giriş Yapılmamışsa Login Ekranı
  if (!session) {
    return <LoginScreen />;
  }

  // Tahsilat Modalını Belirli Bir Daire İle Açma
  const handleOpenCollectionWithFlat = (flat) => {
    setSelectedFlatForCollection(flat);
    setIsCollectionOpen(true);
  };

  const handleOpenCollectionGeneral = () => {
    setSelectedFlatForCollection(null);
    setIsCollectionOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* ÜST BAŞLIK */}
      <Header onOpenBuildingSwitch={() => setIsBuildingSwitchOpen(true)} />

      {/* GEZİNME ÇUBUĞU (Masaüstü üst sekme + Mobil alt bar) */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ANA İÇERİK ALANI */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenCollection={handleOpenCollectionGeneral}
            onOpenExpense={() => setIsExpenseOpen(true)}
            onOpenAccrual={() => setIsAccrualOpen(true)}
            onOpenReceipt={(tx) => setActiveReceiptTx(tx)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'flats' && (
          <FlatList
            onOpenCollectionWithFlat={handleOpenCollectionWithFlat}
            onOpenAccrualModal={() => setIsAccrualOpen(true)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseList
            onOpenAddExpense={() => setIsExpenseOpen(true)}
            onOpenAddIncome={handleOpenCollectionGeneral}
            onOpenReceipt={(tx) => setActiveReceiptTx(tx)}
          />
        )}

        {activeTab === 'communication' && <CommunicationHub />}

        {activeTab === 'board' && <BoardAndSettingsHub />}

        {activeTab === 'superadmin' && <SuperAdminPanel />}
      </main>

      {/* ORTAK MODALLAR */}
      
      {/* Tahsilat Modalı */}
      <CollectionModal
        isOpen={isCollectionOpen}
        onClose={() => {
          setIsCollectionOpen(false);
          setSelectedFlatForCollection(null);
        }}
        preselectedFlat={selectedFlatForCollection}
      />

      {/* Toplu Borçlandırma Modalı */}
      <BulkAccrualModal
        isOpen={isAccrualOpen}
        onClose={() => setIsAccrualOpen(false)}
      />

      {/* Fişli Gider Ekleme Modalı */}
      <AddExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
      />

      {/* Fiş / Fatura Lightbox Modalı */}
      <ReceiptLightboxModal
        isOpen={!!activeReceiptTx}
        onClose={() => setActiveReceiptTx(null)}
        transaction={activeReceiptTx}
      />

      {/* Bina Değiştirme Modalı */}
      <BuildingSwitchModal
        isOpen={isBuildingSwitchOpen}
        onClose={() => setIsBuildingSwitchOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
