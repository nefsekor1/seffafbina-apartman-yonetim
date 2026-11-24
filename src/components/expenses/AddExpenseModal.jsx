import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import storage from '../../services/storage';
import { compressImage } from '../../utils/imageCompressor';
import { getCurrentPeriodName } from '../../utils/currency';
import { 
  MinusCircle, 
  X, 
  Camera, 
  Upload, 
  Receipt, 
  Calendar, 
  Tag, 
  Building, 
  Banknote, 
  Check, 
  Trash2,
  Loader2
} from 'lucide-react';

export const CATEGORIES = [
  'Elektrik',
  'Su',
  'Asansör Bakımı',
  'Temizlik',
  'Bakım-Onarım',
  'Resmi Harç/İskan',
  'Sigorta',
  'Bahçe Bakımı',
  'Diğer'
];

export const AddExpenseModal = ({ isOpen, onClose }) => {
  const { 
    activeBuildingId, 
    refreshBuildingData 
  } = useAuth();

  const fileInputRef = useRef(null);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [budgetType, setBudgetType] = useState('dues'); // 'dues' | 'fixture'
  const [category, setCategory] = useState('Elektrik');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('IBAN'); // 'IBAN' | 'Nakit'
  const [period, setPeriod] = useState(getCurrentPeriodName());
  
  // Fiş görseli state
  const [receiptImage, setReceiptImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Görsel yükleme & Canvas ile sıkıştırma
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      // HTML5 Canvas max 900px, 0.7 JPEG kalitesi
      const compressedBase64 = await compressImage(file, 900, 0.7);
      setReceiptImage(compressedBase64);
    } catch (err) {
      alert('Görsel sıkıştırılırken bir hata oluştu: ' + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Lütfen geçerli bir gider tutarı giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      await storage.addTransaction(activeBuildingId, {
        date,
        type: 'expense',
        budgetType,
        category,
        amount: Number(amount),
        description: description.trim() || `${category} Gideri`,
        paymentMethod,
        period,
        receiptImage: receiptImage || null,
      });

      await refreshBuildingData();
      onClose();
    } catch (err) {
      alert('Gider kaydedilirken hata oluştu: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* BAŞLIK */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-red-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <MinusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Gider Ekle (Fişli/Faturalı)</h3>
              <p className="text-[11px] text-slate-500">Apartman harcamasını fiş fotoğrafıyla kasadan düş</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM GÖVDESİ (KAYDIRILABİLİR) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* BÜTÇE TÜRÜ (AİDAT / DEMİRBAŞ) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hangi Kasadan Ödendi?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBudgetType('dues')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  budgetType === 'dues'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                İşletme Kasası (Rutin Gider)
              </button>

              <button
                type="button"
                onClick={() => setBudgetType('fixture')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  budgetType === 'fixture'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Demirbaş Kasası (Yatırım/Tamir)
              </button>
            </div>
          </div>

          {/* TUTAR & ÖDEME YÖNTEMİ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gider Tutarı (₺) *
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Banka / EFT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Nakit')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'Nakit'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Elden Nakit</span>
                </button>
              </div>
            </div>
          </div>

          {/* KATEGORİ & TARİH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                Harcama Kategorisi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Fatura / Belge Tarihi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* AÇIKLAMA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Açıklama / Firma / Detay</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: Kone Asansör Kasım periyodik bakımı..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* FİŞ / FATURA FOTOĞRAFI YÜKLEME (CANVAS OTOMATİK SIKIŞTIRMA) */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Fiş / Fatura Fotoğrafı (Şeffaflık Belgesi)
              </span>
              <span className="text-[10px] text-slate-400">Otomatik max 900px sıkıştırılır</span>
            </label>

            {receiptImage ? (
              <div className="relative rounded-2xl border border-emerald-300 bg-emerald-50/40 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={receiptImage}
                    alt="Fiş Önizleme"
                    className="w-14 h-14 object-cover rounded-xl border border-emerald-200 shadow-sm"
                  />
                  <div>
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Görsel Başarıyla Sıkıştırıldı
                    </div>
                    <div className="text-[10px] text-emerald-700">Gider kaydına eklenecek.</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-100 transition-colors"
                  title="Görseli Kaldır"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/30"
              >
                {isCompressing ? (
                  <div className="flex flex-col items-center justify-center py-2 text-emerald-600">
                    <Loader2 className="w-6 h-6 animate-spin mb-1" />
                    <span className="text-xs font-semibold">Görsel Canvas ile sıkıştırılıyor...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      Fotoğraf Çek veya Galeriden Seç
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Kamera veya dosya (JPG, PNG, WebP)
                    </span>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* ALT BUTONLAR */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-700/25 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <span>Gideri Kasaya İşle</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default AddExpenseModal;
