import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { createMonthlyGroupSummaryText } from '../../utils/whatsapp';
import { 
  Wallet, 
  PiggyBank, 
  TrendingUp, 
  Percent, 
  PlusCircle, 
  MinusCircle, 
  CalendarPlus, 
  Share2, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Copy, 
  Check, 
  ExternalLink,
  Megaphone,
  Wrench,
  Vote,
  Sparkles
} from 'lucide-react';

export const Dashboard = ({
  onOpenCollection,
  onOpenExpense,
  onOpenAccrual,
  onOpenReceipt,
  onNavigateTab,
}) => {
  const { 
    buildingData, 
    activeBuildingMeta, 
    userRole, 
    currentResident 
  } = useAuth();

  const [copiedGroupText, setCopiedGroupText] = useState(false);

  const flats = buildingData?.flats || [];
  const transactions = buildingData?.transactions || [];
  const announcements = buildingData?.announcements || [];
  const issues = buildingData?.issues || [];
  const polls = buildingData?.polls || [];

  // Mali Hesaplamalar:
  // 1. İşletme Gelir ve Giderleri
  const duesIncomes = transactions
    .filter((t) => t.type === 'income' && t.budgetType === 'dues')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const duesExpenses = transactions
    .filter((t) => t.type === 'expense' && t.budgetType === 'dues')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const duesBalance = duesIncomes - duesExpenses;

  // 2. Demirbaş Gelir ve Giderleri
  const fixtureIncomes = transactions
    .filter((t) => t.type === 'income' && t.budgetType === 'fixture')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const fixtureExpenses = transactions
    .filter((t) => t.type === 'expense' && t.budgetType === 'fixture')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const fixtureBalance = fixtureIncomes - fixtureExpenses;

  // 3. Toplam Kasa Bakiyesi
  const totalBalance = duesBalance + fixtureBalance;

  // 4. Bu Ayki Tahsilat Oranı (%)
  const currentMonthStr = new Date().toISOString().slice(0, 7); // '2026-11'
  const currentMonthIncomes = transactions
    .filter((t) => t.type === 'income' && t.date && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const currentMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date && t.date.startsWith(currentMonthStr));
  
  const currentMonthTotalExpenses = currentMonthExpenses
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const monthlyTarget = (flats.length * (activeBuildingMeta?.monthlyDues || 850)) || 1;
  const rawCollectionRate = Math.round((currentMonthIncomes / monthlyTarget) * 100);
  const collectionRate = Math.min(100, Math.max(0, rawCollectionRate));

  // Son 5 Kasa Hareketi
  const recentTransactions = transactions.slice(0, 5);

  // WhatsApp Grup Özeti Kopyalama Fonksiyonu
  const handleCopyWhatsAppGroup = async () => {
    const periodName = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(new Date());
    const text = createMonthlyGroupSummaryText({
      buildingName: activeBuildingMeta?.name || 'Apartmanımız',
      period: periodName,
      totalBalance,
      duesBalance,
      fixtureBalance,
      collectionRate,
      collectedAmount: currentMonthIncomes,
      totalExpenseAmount: currentMonthTotalExpenses,
      recentExpenses: currentMonthExpenses,
      iban: activeBuildingMeta?.iban || 'Belirtilmedi',
      accountHolder: activeBuildingMeta?.accountHolder || 'Yönetim',
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopiedGroupText(true);
      setTimeout(() => setCopiedGroupText(false), 3000);
    } catch {
      alert('Panoya kopyalanamadı, lütfen izinleri kontrol ediniz.');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* SAKİN ÖZEL BİLGİLENDİRME KARTI (Eğer daire sakini giriş yaptıysa) */}
      {userRole === 'resident' && currentResident && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Hoş Geldiniz, {currentResident.ownerName || `Daire ${currentResident.no}`}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Daire {currentResident.no} Cari Durumu
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kat: {currentResident.floor || 'Standart'} • Telefon: {currentResident.phone || '-'}
              </p>
            </div>

            {/* Borç / Ödeme Özeti */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700 text-right min-w-[140px]">
                <div className="text-[11px] text-slate-400 font-medium">İşletme Aidat Borcu</div>
                <div className={`text-base font-bold ${currentResident.duesBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formatCurrency(currentResident.duesBalance)}
                </div>
              </div>

              <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700 text-right min-w-[140px]">
                <div className="text-[11px] text-slate-400 font-medium">Toplam Bakiye</div>
                <div className={`text-lg font-black ${(currentResident.duesBalance + currentResident.fixtureBalance) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatCurrency(currentResident.duesBalance + currentResident.fixtureBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* Sakin Ödeme Hatırlatması */}
          {(currentResident.duesBalance + currentResident.fixtureBalance) > 0 ? (
            <div className="mt-4 pt-4 border-t border-slate-700/70 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Apartman IBAN: <strong className="text-white font-mono">{activeBuildingMeta?.iban}</strong></span>
              </div>
              <span className="text-[11px] text-slate-400 italic">
                * Açıklamaya "Daire {currentResident.no}" yazmayı unutmayınız.
              </span>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-slate-700/70 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Harika! Dairenizin herhangi bir gecikmiş borcu bulunmamaktadır. Teşekkür ederiz.</span>
            </div>
          )}
        </div>
      )}

      {/* 4 ÜST BİLGİ KARTI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* 1. TOPLAM KASA BAKİYESİ */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Toplam Kasa
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalBalance)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Genel Nakit Varlığı</span>
          </div>
        </div>

        {/* 2. İŞLETME (AİDAT) KASASI */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              İşletme Kasası
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-lg sm:text-2xl font-black tracking-tight ${duesBalance >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
            {formatCurrency(duesBalance)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            Rutin Aidat ve Faturalar
          </div>
        </div>

        {/* 3. DEMİRBAŞ (YATIRIM) KASASI */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Demirbaş Kasası
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-lg sm:text-2xl font-black tracking-tight ${fixtureBalance >= 0 ? 'text-purple-900' : 'text-red-600'}`}>
            {formatCurrency(fixtureBalance)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            Bina Yatırım & Yenileme
          </div>
        </div>

        {/* 4. BU AY TAHSİLAT ORANI */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tahsilat Oranı
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              %{collectionRate}
            </span>
            <span className="text-xs text-slate-400 font-medium">Bu Ay</span>
          </div>
          {/* İlerleme çubuğu */}
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                collectionRate >= 80 ? 'bg-emerald-500' : collectionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${collectionRate}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* YÖNETİCİ HIZLI İŞLEM BUTONLARI (Sadece Yönetici veya Süper Admin) */}
      {(userRole === 'manager' || userRole === 'superadmin') && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Yönetici Hızlı İşlemleri
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={onOpenCollection}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div>Tahsilat Al</div>
                <div className="text-[10px] text-emerald-600 font-normal">Aidat/Demirbaş</div>
              </div>
            </button>

            <button
              onClick={onOpenExpense}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-semibold text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <MinusCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div className="text-left">
                <div>Gider Ekle</div>
                <div className="text-[10px] text-red-600 font-normal">Fişli / Faturalı</div>
              </div>
            </button>

            <button
              onClick={onOpenAccrual}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <CalendarPlus className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="text-left">
                <div>Aylık Aidat Yaz</div>
                <div className="text-[10px] text-blue-600 font-normal">Toplu Borçlandır</div>
              </div>
            </button>

            <button
              onClick={handleCopyWhatsAppGroup}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 font-semibold text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              {copiedGroupText ? (
                <Check className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <Share2 className="w-5 h-5 text-green-600 shrink-0" />
              )}
              <div className="text-left">
                <div>{copiedGroupText ? 'Kopyalandı!' : 'WhatsApp Özeti'}</div>
                <div className="text-[10px] text-green-600 font-normal">Gruba Yapıştır</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* İKİ KOLONLU DÜZEN: SON HAREKETLER & DUYURULAR / ARZILAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SOL: SON KASA HAREKETLERİ (2 Kolon) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Son Kasa Hareketleri
            </h3>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Tümünü Gör
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Henüz bir gelir veya gider kaydı bulunmamaktadır.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                          {tx.description || tx.category}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-500">{tx.category}</span>
                          {tx.flatNo && (
                            <>
                              <span>•</span>
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                                Daire {tx.flatNo}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Fiş İkonu (Varsa Tıklanabilir) */}
                      {tx.receiptImage && (
                        <button
                          onClick={() => onOpenReceipt(tx)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Fiş / Faturayı İncele"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      )}

                      <div className={`text-right text-xs sm:text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SAĞ: DUYURULAR VE HIZLI BİLGİ (1 Kolon) */}
        <div className="space-y-6">
          
          {/* AKTİF DUYURULAR */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                Aktif Duyurular
              </h3>
              <button
                onClick={() => onNavigateTab('communication')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Tümü
              </button>
            </div>

            {announcements.length === 0 ? (
              <div className="text-xs text-slate-400 py-3">Aktif bir duyuru yok.</div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 2).map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-3 rounded-xl border text-xs ${
                      ann.isUrgent
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {ann.isUrgent && (
                        <span className="bg-red-500 text-white text-[9px] uppercase px-1.5 py-0.5 rounded font-black">
                          Acil
                        </span>
                      )}
                      <span className="truncate">{ann.title}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ARIZA VE ANKET ÖZETİ WIDGETI */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-500" />
              Ortak Alan & Anket Durumu
            </h3>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => onNavigateTab('communication')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="font-medium text-slate-700">Bekleyen / Süren Arızalar</span>
                </div>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {issues.filter((i) => i.status !== 'resolved').length}
                </span>
              </div>

              <div
                onClick={() => onNavigateTab('communication')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Vote className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-medium text-slate-700">Aktif Karar Anketi</span>
                </div>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {polls.filter((p) => p.isActive).length}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Dashboard;
