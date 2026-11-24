import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import storage from '../../services/storage';
import { formatCurrency, getCurrentPeriodName } from '../../utils/currency';
import { 
  PlusCircle, 
  X, 
  CreditCard, 
  User, 
  Calendar, 
  CheckCircle2, 
  Banknote, 
  Building
} from 'lucide-react';

export const CollectionModal = ({ isOpen, onClose, preselectedFlat }) => {
  const { 
    buildingData, 
    activeBuildingId, 
    refreshBuildingData 
  } = useAuth();

  const flats = buildingData?.flats || [];

  const [selectedFlatId, setSelectedFlatId] = useState('');
  const [budgetType, setBudgetType] = useState('dues'); // 'dues' | 'fixture'
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('IBAN'); // 'IBAN' | 'Nakit'
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState(getCurrentPeriodName());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedFlat) {
      setSelectedFlatId(preselectedFlat.id);
      // Borca göre otomatik tutar önerisi
      const targetDebt = budgetType === 'dues' ? preselectedFlat.duesBalance : preselectedFlat.fixtureBalance;
      if (targetDebt > 0) {
        setAmount(String(targetDebt));
      }
    } else if (flats.length > 0 && !selectedFlatId) {
      setSelectedFlatId(flats[0].id);
    }
  }, [preselectedFlat, flats, budgetType]);

  if (!isOpen) return null;

  const currentFlat = flats.find((f) => f.id === selectedFlatId);

  // Bütçe türü değiştikçe otomatik açıklama ve tutar önerisi
  const handleBudgetTypeChange = (type) => {
    setBudgetType(type);
    if (currentFlat) {
      const debt = type === 'dues' ? currentFlat.duesBalance : currentFlat.fixtureBalance;
      if (debt > 0) {
        setAmount(String(debt));
      }
    }
  };

  const handleFlatChange = (flatId) => {
    setSelectedFlatId(flatId);
    const flat = flats.find((f) => f.id === flatId);
    if (flat) {
      const debt = budgetType === 'dues' ? flat.duesBalance : flat.fixtureBalance;
      if (debt > 0) {
        setAmount(String(debt));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Lütfen geçerli bir tahsilat tutarı giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const flat = flats.find((f) => f.id === selectedFlatId);
      const desc = description.trim() || `${period} ${budgetType === 'dues' ? 'Aidat' : 'Demirbaş'} Tahsilatı`;

      await storage.addTransaction(activeBuildingId, {
        date,
        type: 'income',
        budgetType,
        category: budgetType === 'dues' ? 'Aidat Tahsilatı' : 'Demirbaş Tahsilatı',
        amount: Number(amount),
        description: desc,
        paymentMethod,
        flatId: flat?.id,
        flatNo: flat?.no,
        payerName: flat ? (flat.tenantName || flat.ownerName) : '',
        period,
      });

      await refreshBuildingData();
      onClose();
    } catch (err) {
      alert('Tahsilat kaydedilirken hata oluştu: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* BAŞLIK */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Tahsilat Al</h3>
              <p className="text-[11px] text-slate-500">Daireden yapılan aidat veya demirbaş ödemesini kasaya işle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {/* DAİRE SEÇİMİ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Ödeme Yapan Daire
            </label>
            <select
              value={selectedFlatId}
              onChange={(e) => handleFlatChange(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              {flats.map((flat) => (
                <option key={flat.id} value={flat.id}>
                  Daire {flat.no} - {flat.ownerName} {flat.tenantName ? `(Kiracı: ${flat.tenantName})` : ''} [Borç: {formatCurrency((flat.duesBalance || 0) + (flat.fixtureBalance || 0))}]
                </option>
              ))}
            </select>

            {currentFlat && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-500">
                  Daire {currentFlat.no} Güncel Borç:
                </span>
                <span className="font-bold text-slate-900">
                  İşletme: <strong className="text-amber-600">{formatCurrency(currentFlat.duesBalance)}</strong> | Demirbaş: <strong className="text-purple-600">{formatCurrency(currentFlat.fixtureBalance)}</strong>
                </span>
              </div>
            )}
          </div>

          {/* BÜTÇE TÜRÜ (AİDAT / DEMİRBAŞ) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bütçe Kasası Türü
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleBudgetTypeChange('dues')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  budgetType === 'dues'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                İşletme Aidatı Kasası
              </button>

              <button
                type="button"
                onClick={() => handleBudgetTypeChange('fixture')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  budgetType === 'fixture'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Demirbaş (Yatırım) Kasası
              </button>
            </div>
          </div>

          {/* TUTAR & ÖDEME YÖNTEMİ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Tahsil Edilen Tutar (₺) *</span>
                {currentFlat && (
                  <button
                    type="button"
                    onClick={() => {
                      const debt = budgetType === 'dues' ? currentFlat.duesBalance : currentFlat.fixtureBalance;
                      setAmount(String(debt > 0 ? debt : ''));
                    }}
                    className="text-[10px] text-emerald-600 hover:underline font-bold"
                  >
                    Borcu Getir
                  </button>
                )}
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ödeme Yöntemi
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('IBAN')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'IBAN'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>IBAN / EFT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Nakit')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'Nakit'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Elden Nakit</span>
                </button>
              </div>
            </div>
          </div>

          {/* TARİH VE DÖNEM */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">İşlem Tarihi</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dönem</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Örn: 2026 Kasım"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* AÇIKLAMA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Açıklama (Opsiyonel)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: 2026 Kasım Aidat Ödemesi"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* BUTONLAR */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-700/25 disabled:opacity-50 transition-all"
            >
              Tahsilatı Onayla ve Kasaya Ekle
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default CollectionModal;
