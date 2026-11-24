import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  KeyRound, 
  ShieldCheck, 
  User, 
  Sparkles, 
  Lock, 
  ChevronRight, 
  Info,
  CheckCircle2,
  Building
} from 'lucide-react';

export const LoginScreen = () => {
  const { 
    buildings, 
    activeBuildingId, 
    activeBuildingMeta, 
    buildingData,
    switchBuilding, 
    login, 
    quickDemoLogin,
    appSettings 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('resident'); // 'resident' | 'manager' | 'auditor' | 'superadmin'
  const [selectedFlatNo, setSelectedFlatNo] = useState('1');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL'den ?sayfa=superadmin geldiğinde otomatik süper admin sekmesini seç
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sayfa') === 'superadmin') {
      setActiveTab('superadmin');
    }
  }, []);

  const handleBuildingChange = (e) => {
    const newId = e.target.value;
    switchBuilding(newId);
    setErrorMsg('');
    setPin('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setPin('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      let res;
      if (activeTab === 'resident') {
        res = await login({ role: 'resident', pin, flatNo: selectedFlatNo });
      } else if (activeTab === 'manager') {
        res = await login({ role: 'manager', pin });
      } else if (activeTab === 'auditor') {
        res = await login({ role: 'auditor', pin });
      } else if (activeTab === 'superadmin') {
        res = await login({ role: 'superadmin', pin });
      }

      if (!res.success) {
        setErrorMsg(res.message || 'Giriş yapılamadı.');
      }
    } catch {
      setErrorMsg('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mevcut daire listesi
  const flats = buildingData?.flats || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 text-slate-100">
      
      {/* ÜST MARKA & BİNA SEÇİMİ */}
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 shadow-lg shadow-emerald-900/40 mb-3 border border-emerald-400/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            ŞeffafBina
            <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">PWA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Şeffaf, Güvenilir ve Mobil Apartman & Site Yönetimi
          </p>
        </div>

        {/* Apartman Seçimi Dropdown */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xl mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            Yönetilen Apartman / Site
          </label>
          <select
            value={activeBuildingId}
            onChange={handleBuildingChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.address ? b.address.slice(0, 30) + '...' : 'Aktif Bina'})
              </option>
            ))}
          </select>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Seçili Bina: <strong className="text-emerald-400">{activeBuildingMeta?.name}</strong></span>
            <span>{flats.length} Daire</span>
          </div>
        </div>

        {/* GİRİŞ KARTI */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-5 sm:p-6">
          
          {/* ROL SEKMELERİ */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-700/60 mb-5">
            <button
              type="button"
              onClick={() => handleTabChange('resident')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'resident'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4 mb-1" />
              <span>Sakin</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('manager')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'manager'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mb-1" />
              <span>Yönetici</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('auditor')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'auditor'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 mb-1" />
              <span>Denetçi</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('superadmin')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'superadmin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4 mb-1" />
              <span>Admin</span>
            </button>
          </div>

          {/* HATA MESAJI */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* GİRİŞ FORMU */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sakin Girişinde Daire Seçimi */}
            {activeTab === 'resident' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daire Numaranız
                </label>
                <select
                  value={selectedFlatNo}
                  onChange={(e) => setSelectedFlatNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  {flats.map((flat) => (
                    <option key={flat.id} value={flat.no}>
                      Daire {flat.no} - {flat.ownerName} {flat.tenantName ? `(${flat.tenantName})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* PIN Giriş Alanı */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {activeTab === 'resident' && 'Daire Güvenlik PIN Kodu'}
                  {activeTab === 'manager' && 'Yönetici PIN Kodu'}
                  {activeTab === 'auditor' && 'Denetçi PIN Kodu'}
                  {activeTab === 'superadmin' && 'Süper Admin Anahtar PIN'}
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeTab === 'resident' && `Varsayılan: 100${selectedFlatNo}`}
                  {activeTab === 'manager' && 'Varsayılan: 1923'}
                  {activeTab === 'auditor' && 'Varsayılan: 2025'}
                  {activeTab === 'superadmin' && 'Varsayılan: 9999'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN kodunu giriniz..."
                  maxLength={10}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all tracking-widest"
                />
              </div>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                activeTab === 'superadmin'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
              } disabled:opacity-50`}
            >
              <span>Giriş Yap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bilgilendirme Kutusu */}
          <div className="mt-4 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>
              {activeTab === 'resident' && 'Daire sakinleri yalnızca kendi mali geçmişlerini ve apartmanın şeffaf bütçesini görebilir.'}
              {activeTab === 'manager' && 'Yönetici aidat tahsilatı alabilir, fişli gider ekleyebilir ve WhatsApp hatırlatmaları gönderebilir.'}
              {activeTab === 'auditor' && 'Denetçiler mali defterleri inceleyebilir ve resmi denetim onayı verebilir.'}
              {activeTab === 'superadmin' && 'Süper admin yeni binalar açabilir, binaları yönetebilir ve sistem parametrelerini düzenler.'}
            </span>
          </div>
        </div>

        {/* KOLAY TEST / DEMO GİRİŞ ÇUBUĞU */}
        {appSettings?.showQuickDemoBar && (
          <div className="mt-5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Kolay Demo Test Girişi (Tek Tık)
              </span>
              <span className="text-[10px] text-emerald-400/80">Test Modu</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('manager')}
                className="bg-emerald-800/50 hover:bg-emerald-700/60 text-emerald-100 border border-emerald-500/30 py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                👔 Yönetici
                <span className="block text-[10px] font-normal text-emerald-300/80 mt-0.5">PIN: 1923</span>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('auditor')}
                className="bg-teal-800/50 hover:bg-teal-700/60 text-teal-100 border border-teal-500/30 py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                📋 Denetçi
                <span className="block text-[10px] font-normal text-teal-300/80 mt-0.5">PIN: 2025</span>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('resident', 1)}
                className="bg-sky-800/50 hover:bg-sky-700/60 text-sky-100 border border-sky-500/30 py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                🏠 Daire 1 (Sakin)
                <span className="block text-[10px] font-normal text-sky-300/80 mt-0.5">PIN: 1001</span>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('superadmin')}
                className="bg-purple-800/50 hover:bg-purple-700/60 text-purple-100 border border-purple-500/30 py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                🛡️ Süper Admin
                <span className="block text-[10px] font-normal text-purple-300/80 mt-0.5">PIN: 9999</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ALT TELİF & VERSİYON BİLGİSİ */}
      <div className="w-full max-w-md mx-auto text-center mt-6 text-xs text-slate-500">
        <p>ŞeffafBina v1.0 • Mobil Öncelikli Apartman & Site Yönetimi</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Tüm veriler yerel olarak cihazınızda şifrelenip saklanır.</p>
      </div>
    </div>
  );
};
export default LoginScreen;
