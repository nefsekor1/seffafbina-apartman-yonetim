import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTR, getCurrentPeriodName, getRecentPeriodsList } from '../../utils/currency';
import { Printer, Calendar, FileText, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export const BulletinBoardPrint = () => {
  const { 
    buildingData, 
    activeBuildingMeta 
  } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriodName());

  const flats = buildingData?.flats || [];
  const transactions = buildingData?.transactions || [];
  const audits = buildingData?.audits || [];

  // Seçilen döneme ait işlemler
  const periodTransactions = transactions.filter(
    (t) => t.period === selectedPeriod || (t.date && t.date.startsWith(selectedPeriod.slice(0, 7)))
  );

  const periodIncomes = periodTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const periodExpenses = periodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Kasa bakiyeleri (Genel)
  const totalDuesBalance = transactions
    .reduce((sum, t) => sum + (t.budgetType === 'dues' ? (t.type === 'income' ? Number(t.amount) : -Number(t.amount)) : 0), 0);

  const totalFixtureBalance = transactions
    .reduce((sum, t) => sum + (t.budgetType === 'fixture' ? (t.type === 'income' ? Number(t.amount) : -Number(t.amount)) : 0), 0);

  const totalNetBalance = totalDuesBalance + totalFixtureBalance;

  // Seçilen döneme ait denetçi onayı var mı?
  const periodAudit = audits.find((a) => a.period === selectedPeriod) || audits[0];

  const handlePrint = () => {
    window.print();
  };

  const periodList = getRecentPeriodsList(12);

  return (
    <div className="space-y-4">
      
      {/* EKRAN KONTROLLERİ (Yazdırmada Gizlenir: no-print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Rapor Dönemi:
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {periodList.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.01]"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Yazdır / PDF Kaydet (A4)</span>
        </button>
      </div>

      {/* A4 MANTAR PANO ÇIKTISI GÖVDESİ */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg text-slate-900 print:p-0 print:border-none print:shadow-none print:rounded-none max-w-4xl mx-auto">
        
        {/* ÜST ANTET & APARTMAN BİLGİLERİ */}
        <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-700 no-print" />
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                {activeBuildingMeta?.name || 'Apartman Yöneticiliği'}
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {activeBuildingMeta?.address || 'Apartman Ortak Alan Bilgilendirme Raporu'}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Banka IBAN: {activeBuildingMeta?.iban || '-'} • Hesap Sahibi: {activeBuildingMeta?.accountHolder || 'Yönetim'}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white px-3 py-1 rounded text-xs font-black uppercase tracking-widest">
              Mantar Pano Raporu
            </span>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {selectedPeriod}
            </div>
            <div className="text-[10px] text-slate-400">
              Rapor Tarihi: {formatDateTR(new Date())}
            </div>
          </div>
        </div>

        {/* MALİ ÖZET TABLOSU */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
            1. Mali Durum ve Kasa Bakiyeleri Özeti
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Bu Ay Toplanan Aidat</span>
              <span className="text-base font-black text-emerald-700 mt-0.5 block">
                {formatCurrency(periodIncomes)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Bu Ay Yapılan Harcama</span>
              <span className="text-base font-black text-red-600 mt-0.5 block">
                {formatCurrency(periodExpenses)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">İşletme (Aidat) Kasası</span>
              <span className="text-base font-black text-blue-700 mt-0.5 block">
                {formatCurrency(totalDuesBalance)}
              </span>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Güncel Toplam Kasa</span>
              <span className="text-base font-black text-emerald-400 mt-0.5 block">
                {formatCurrency(totalNetBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* BU AYKİ GİDER KALEMLERİ LİSTESİ */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
            2. Bu Ayki Gider ve Harcama Dökümü
          </h2>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
              <tr>
                <th className="py-1.5 px-3">Tarih</th>
                <th className="py-1.5 px-3">Kategori</th>
                <th className="py-1.5 px-3">Harcama Açıklaması</th>
                <th className="py-1.5 px-3 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periodTransactions.filter((t) => t.type === 'expense').length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-slate-400 italic">
                    Bu ay için kayıtlı gider bulunmuyor.
                  </td>
                </tr>
              ) : (
                periodTransactions
                  .filter((t) => t.type === 'expense')
                  .map((t) => (
                    <tr key={t.id}>
                      <td className="py-1.5 px-3 font-mono text-[11px]">{t.date}</td>
                      <td className="py-1.5 px-3 font-semibold">{t.category}</td>
                      <td className="py-1.5 px-3">{t.description || '-'}</td>
                      <td className="py-1.5 px-3 text-right font-bold text-red-600">
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* DAİRE BAZLI ÖDEDİ / BORÇLU DURUM ÇİZELGESİ */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
            3. Daireler Cari Durumu (Aidat &amp; Demirbaş)
          </h2>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
              <tr>
                <th className="py-1.5 px-2 text-center w-12">No</th>
                <th className="py-1.5 px-3">Kat Maliki / Sakin</th>
                <th className="py-1.5 px-3 text-right">İşletme Borcu</th>
                <th className="py-1.5 px-3 text-right">Demirbaş Borcu</th>
                <th className="py-1.5 px-3 text-right">Toplam Bakiye</th>
                <th className="py-1.5 px-3 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flats.map((flat) => {
                const totalDebt = (Number(flat.duesBalance) || 0) + (Number(flat.fixtureBalance) || 0);
                const isPaid = totalDebt <= 0;
                return (
                  <tr key={flat.id} className={isPaid ? '' : 'bg-red-50/30'}>
                    <td className="py-1.5 px-2 text-center font-bold">{flat.no}</td>
                    <td className="py-1.5 px-3 font-medium">
                      {flat.ownerName} {flat.tenantName ? `(${flat.tenantName})` : ''}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono">{formatCurrency(flat.duesBalance)}</td>
                    <td className="py-1.5 px-3 text-right font-mono">{formatCurrency(flat.fixtureBalance)}</td>
                    <td className={`py-1.5 px-3 text-right font-bold ${isPaid ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatCurrency(totalDebt)}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isPaid ? 'ÖDENDİ' : 'BORÇLU'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ALT İMZA VE DENETÇİ DAMGASI ALANI */}
        <div className="mt-8 pt-4 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          {/* Yönetici İmzası */}
          <div>
            <div className="font-bold uppercase tracking-wider text-slate-800">
              Apartman Yöneticisi
            </div>
            <div className="text-[11px] text-slate-500 mt-1">İmza &amp; Kaşe</div>
            <div className="h-16 flex items-end justify-center font-serif text-slate-400 italic">
              (.......................................)
            </div>
          </div>

          {/* Denetçi İmzası & Mühür */}
          <div>
            <div className="font-bold uppercase tracking-wider text-slate-800">
              Apartman Denetçisi
            </div>
            {periodAudit ? (
              <div className="mt-1">
                <span className="inline-block border border-emerald-600 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
                  ONAYLANDI: {periodAudit.stampCode}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">{periodAudit.auditedBy}</p>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 mt-1">İmza &amp; Onay</div>
            )}
            <div className="h-12 flex items-end justify-center font-serif text-slate-400 italic">
              (.......................................)
            </div>
          </div>
        </div>

        {/* Alt Uyarı Notu */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          Bu belge Kat Mülkiyeti Kanunu uyarınca apartman panosuna asılmak üzere ŞeffafBina sistemi üzerinden oluşturulmuştur.
        </div>

      </div>

    </div>
  );
};
export default BulletinBoardPrint;
