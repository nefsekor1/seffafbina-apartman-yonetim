import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTR, getRecentPeriodsList } from '../../utils/currency';
import storage from '../../services/storage';
import { CATEGORIES } from './AddExpenseModal';
import { 
  Receipt, 
  Search, 
  Filter, 
  PlusCircle, 
  MinusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Image as ImageIcon, 
  Trash2, 
  Calendar, 
  Tag, 
  Wallet,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const ExpenseList = ({
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenReceipt,
}) => {
  const { 
    buildingData, 
    activeBuildingId, 
    userRole, 
    refreshBuildingData 
  } = useAuth();

  const transactions = buildingData?.transactions || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [budgetFilter, setBudgetFilter] = useState('all'); // 'all' | 'dues' | 'fixture'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'superadmin';

  // Filtreleme
  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (budgetFilter !== 'all' && t.budgetType !== budgetFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (periodFilter !== 'all' && t.period !== periodFilter && (!t.date || !t.date.startsWith(periodFilter))) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDesc = (t.description || '').toLowerCase().includes(term);
      const matchCat = (t.category || '').toLowerCase().includes(term);
      const matchPayer = (t.payerName || '').toLowerCase().includes(term);
      const matchFlat = t.flatNo ? String(t.flatNo).includes(term) : false;
      return matchDesc || matchCat || matchPayer || matchFlat;
    }

    return true;
  });

  // Silme Fonksiyonu (Veri bütünlüğü kuralı: State ve storage'dan kalıcı silinir)
  const handleDeleteTransaction = async (tx) => {
    if (window.confirm(`"${tx.description || tx.category}" işlemini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      await storage.deleteTransaction(activeBuildingId, tx.id);
      await refreshBuildingData();
    }
  };

  // Toplamlar
  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const periodOptions = getRecentPeriodsList(12);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* ÜST BAŞLIK VE HIZLI BUTONLAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            Şeffaf Kasa ve Fişli Gider Defteri
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Apartmanın tüm harcamaları, fiş/fatura fotoğrafları ve tahsilat dökümü
          </p>
        </div>

        {isManagerOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddIncome}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs sm:text-sm font-semibold transition-all"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Gelir / Tahsilat</span>
            </button>

            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-700/20 transition-all"
            >
              <MinusCircle className="w-4 h-4" />
              <span>Fişli Gider Ekle</span>
            </button>
          </div>
        )}
      </div>

      {/* FİLTRELEME & ARAMA PANELİ */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        
        {/* Üst Sıra: Arama & İşlem Türü Sekmeleri */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Açıklama, Kategori veya Daire..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tüm Hareketler
            </button>

            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Gelirler (+)
            </button>

            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Giderler (-)
            </button>
          </div>
        </div>

        {/* Alt Sıra: Bütçe, Kategori, Dönem Filtreleri */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Bütçe Kasası Filtresi */}
          <select
            value={budgetFilter}
            onChange={(e) => setBudgetFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tüm Kasalar (İşletme + Demirbaş)</option>
            <option value="dues">Sadece İşletme (Aidat) Kasası</option>
            <option value="fixture">Sadece Demirbaş Kasası</option>
          </select>

          {/* Kategori Filtresi */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tüm Harcama Kategorileri</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Dönem Filtresi */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 col-span-2 sm:col-span-1"
          >
            <option value="all">Tüm Dönemler / Aylar</option>
            {periodOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

      </div>

      {/* FİLTRE ÖZETİ BİLGİ ŞERİDİ */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <div>
          Listelenen: <strong>{filteredTransactions.length} işlem</strong>
        </div>
        <div className="flex items-center gap-4">
          <span>Toplam Gelir: <strong className="text-emerald-600">+{formatCurrency(totalFilteredIncome)}</strong></span>
          <span>Toplam Gider: <strong className="text-red-600">-{formatCurrency(totalFilteredExpense)}</strong></span>
        </div>
      </div>

      {/* İŞLEM LİSTESİ: MASAÜSTÜ TABLO & MOBİL KART GÖRÜNÜMÜ */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Tarih</th>
              <th className="py-3 px-4">Tür & Bütçe</th>
              <th className="py-3 px-4">Kategori & Açıklama</th>
              <th className="py-3 px-4">Ödeme Şekli</th>
              <th className="py-3 px-4 text-center">Fiş / Fatura</th>
              <th className="py-3 px-4 text-right">Tutar</th>
              {isManagerOrAdmin && <th className="py-3 px-4 text-center">Sil</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Filtreleme kriterlerine uygun kasa hareketi bulunamadı.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Tarih */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {tx.date || '-'}
                    </td>

                    {/* Tür ve Bütçe Rozeti */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isIncome ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {isIncome ? 'Gelir' : 'Gider'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {tx.budgetType === 'dues' ? 'İşletme Kasası' : 'Demirbaş Kasası'}
                        </span>
                      </div>
                    </td>

                    {/* Kategori & Açıklama */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{tx.description || tx.category}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {tx.category}
                        </span>
                        {tx.flatNo && <span>• Daire {tx.flatNo}</span>}
                        {tx.payerName && <span>• {tx.payerName}</span>}
                      </div>
                    </td>

                    {/* Ödeme Şekli */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {tx.paymentMethod || 'IBAN'}
                    </td>

                    {/* Fiş / Fatura İncele */}
                    <td className="py-3.5 px-4 text-center">
                      {tx.receiptImage ? (
                        <button
                          onClick={() => onOpenReceipt(tx)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                          title="Faturayı / Fişi Görüntüle"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Gör</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs italic">-</span>
                      )}
                    </td>

                    {/* Tutar */}
                    <td className={`py-3.5 px-4 text-right font-black text-sm whitespace-nowrap ${
                      isIncome ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>

                    {/* Sil Butonu (Yönetici) */}
                    {isManagerOrAdmin && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(tx)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hareketi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBİL KART GÖRÜNÜMÜ (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs bg-white rounded-2xl p-4 border border-slate-200">
            Kasa hareketi bulunamadı.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-xl ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {isIncome ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{tx.description || tx.category}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.budgetType === 'dues' ? 'İşletme' : 'Demirbaş'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`font-black text-sm text-right shrink-0 ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium text-[11px]">
                    {tx.category} {tx.flatNo ? `(Daire ${tx.flatNo})` : ''}
                  </span>

                  <div className="flex items-center gap-2">
                    {tx.receiptImage && (
                      <button
                        onClick={() => onOpenReceipt(tx)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Fişi Gör</span>
                      </button>
                    )}

                    {isManagerOrAdmin && (
                      <button
                        onClick={() => handleDeleteTransaction(tx)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
export default ExpenseList;
