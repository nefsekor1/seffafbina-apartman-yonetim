import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import storage from '../../services/storage';
import { getCurrentPeriodName, getRecentPeriodsList, formatCurrency } from '../../utils/currency';
import { 
  CreditCard, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Calendar 
} from 'lucide-react';

export const BulkAccrualModal = ({ isOpen, onClose }) => {
  const { 
    buildingData, 
    activeBuildingId, 
    activeBuildingMeta, 
    refreshBuildingData 
  } = useAuth();

  const flats = buildingData?.flats || [];
  const accruals = buildingData?.accruals || [];

  const [period, setPeriod] = useState(getCurrentPeriodName());
  const [budgetType, setBudgetType] = useState('dues'); // 'dues' | 'fixture'
  const [amount, setAmount] = useState(String(activeBuildingMeta?.monthlyDues || 850));
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Mükerrer tahakkuk kontrolü
  const alreadyAccrued = accruals.some(
    (a) => a.period === period && a.budgetType === budgetType
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Lütfen geçerli bir borçlandırma tutarı giriniz.');
      return;
    }

    if (alreadyAccrued) {
      const confirmTwice = window.confirm(
        `DİKKAT: "${period}" dönemi için "${budgetType === 'dues' ? 'İşletme Aidatı' : 'Demirbaş'}" borçlandırması daha önce yapılmış görünüyor!\n\nYine de tüm dairelere ikinci kez tahakkuk işletmek istiyor musunuz?`
      );
      if (!confirmTwice) return;
    }

    setIsSubmitting(true);
    try {
      await storage.bulkAccrue(activeBuildingId, {
        period,
        budgetType,
        amount: Number(amount),
        description: description.trim() || `${period} ${budgetType === 'dues' ? 'Aidat' : 'Demirbaş'} Tahakkuku`,
      });

      await refreshBuildingData();
      alert(`Başarılı! Toplam ${flats.length} daireye kişi başı ${formatCurrency(amount)} borç tahakkuk ettirildi.`);
      onClose();
    } catch (err) {
      alert('Borçlandırma yapılırken hata oluştu: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const periodOptions = getRecentPeriodsList(6);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* BAŞLIK */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Toplu Borçlandırma (Tahakkuk)</h3>
              <p className="text-[11px] text-slate-500">Tüm dairelere tek tıkla aidat veya demirbaş borcu tahakkuk ettir</p>
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
          
          {/* MÜKERRER UYARI PANELİ */}
          {alreadyAccrued && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Mükerrer Tahakkuk Uyarısı!</strong>
                Bu apartmanda <strong>"{period}"</strong> dönemi için <strong>"{budgetType === 'dues' ? 'İşletme Aidatı' : 'Demirbaş'}"</strong> daha önce tahakkuk ettirilmiş. Aynı ay iki kez yazılmasın diye lütfen dönemi veya bütçe türünü kontrol ediniz.
              </div>
            </div>
          )}

          {/* DÖNEM SEÇİMİ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Borçlandırma Dönemi
            </label>
            <div className="flex gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {periodOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BÜTÇE TÜRÜ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bütçe Türü
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBudgetType('dues')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  budgetType === 'dues'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                İşletme Aidatı
              </button>

              <button
                type="button"
                onClick={() => setBudgetType('fixture')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  budgetType === 'fixture'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Demirbaş (Yatırım)
              </button>
            </div>
          </div>

          {/* TUTAR */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daire Başına Tahakkuk Tutarı (₺) *
            </label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="850.00"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Toplam Etkilenen: <strong>{flats.length} Daire</strong></span>
              <span>Toplam Tahakkuk: <strong className="text-blue-600">{formatCurrency(flats.length * (Number(amount) || 0))}</strong></span>
            </div>
          </div>

          {/* AÇIKLAMA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Açıklama (Opsiyonel)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Örn: ${period} ${budgetType === 'dues' ? 'Olağan Aidat Tahakkuku' : 'Demirbaş Ek Ödemesi'}`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* BİLGİLENDİRME KUTUSU */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <Users className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Bu işlem onaylandığında sistemdeki tüm <strong>({flats.length})</strong> dairenin <strong>{budgetType === 'dues' ? 'İşletme' : 'Demirbaş'}</strong> borç hanesine <strong>{formatCurrency(amount)}</strong> otomatik eklenecektir.
            </span>
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
              className={`px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-lg disabled:opacity-50 transition-all ${
                alreadyAccrued
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-700/25'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-700/25'
              }`}
            >
              {alreadyAccrued ? 'Yine de Tahakkuk Ettir' : 'Tahakkuku Onayla'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default BulkAccrualModal;
