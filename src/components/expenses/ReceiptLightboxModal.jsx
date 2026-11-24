import React, { useEffect } from 'react';
import { formatCurrency, formatDateTR } from '../../utils/currency';
import { X, Download, Receipt, ExternalLink, Calendar, Tag, CreditCard } from 'lucide-react';

export const ReceiptLightboxModal = ({ isOpen, onClose, transaction }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const handleDownload = () => {
    if (!transaction.receiptImage) return;
    const link = document.createElement('a');
    link.href = transaction.receiptImage;
    link.download = `fis-${transaction.id}-${transaction.date || 'belge'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* ÜST ÇUBUK: BAŞLIK VE KAPATMA BUTONLARI */}
      <div className="flex items-center justify-between text-white max-w-4xl mx-auto w-full pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {transaction.description || transaction.category || 'Mali Belge / Fiş'}
            </h3>
            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <span>{formatDateTR(transaction.date)}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-400">{formatCurrency(transaction.amount)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
            title="Görseli İndir"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">İndir</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-all"
            title="Kapat (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ORTA: GÖRSEL İÇERİĞİ */}
      <div className="flex-1 flex items-center justify-center my-3 overflow-hidden">
        <div className="max-h-[75vh] max-w-2xl w-full flex items-center justify-center bg-slate-900/40 rounded-2xl p-2 border border-white/10 overflow-auto">
          {transaction.receiptImage ? (
            <img
              src={transaction.receiptImage}
              alt="Fiş Görseli"
              className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl transition-all"
            />
          ) : (
            <div className="text-slate-400 text-xs py-12">Bu işlem için fiş görseli bulunmuyor.</div>
          )}
        </div>
      </div>

      {/* ALT ÇUBUK: DETAYLAR */}
      <div className="max-w-4xl mx-auto w-full bg-white/10 rounded-2xl p-3 border border-white/10 text-xs text-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            Kategori: <strong>{transaction.category}</strong>
          </span>

          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            Bütçe: <strong>{transaction.budgetType === 'dues' ? 'İşletme (Aidat)' : 'Demirbaş'}</strong>
          </span>
        </div>

        <div className="text-slate-400 text-[11px]">
          Belge ID: <span className="font-mono">{transaction.id}</span>
        </div>
      </div>

    </div>
  );
};
export default ReceiptLightboxModal;
