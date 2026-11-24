import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import storage from '../../services/storage';
import { getCurrentPeriodName, getRecentPeriodsList, formatDateTR } from '../../utils/currency';
import { CheckCircle2, ShieldCheck, Stamp, Plus, Calendar, UserCheck } from 'lucide-react';

export const AuditorStampSection = () => {
  const { 
    buildingData, 
    activeBuildingId, 
    userRole, 
    refreshBuildingData 
  } = useAuth();

  const audits = buildingData?.audits || [];

  const [period, setPeriod] = useState(getCurrentPeriodName());
  const [auditorName, setAuditorName] = useState('Süleyman Vural (Denetçi)');
  const [notes, setNotes] = useState('Dönem harcamaları, banka dekontları ve fişler incelenmiş olup kasa denk bulunmuştur.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const isAuditorOrAdmin = userRole === 'auditor' || userRole === 'superadmin';

  const handleAddAudit = async (e) => {
    e.preventDefault();
    if (!notes.trim() || !auditorName.trim()) {
      alert('Lütfen denetçi adı ve denetim rapor notunu giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      await storage.addAudit(activeBuildingId, {
        period,
        notes: notes.trim(),
        auditedBy: auditorName.trim(),
      });

      await refreshBuildingData();
      setShowAddForm(false);
      alert(`Dönem başarıyla denetlendi ve onay damgası vuruldu!`);
    } catch (err) {
      alert('Denetim kaydedilirken hata: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const periodOptions = getRecentPeriodsList(12);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            Resmi Denetçi Onayları ve Mühürleri
          </h3>
          <p className="text-xs text-slate-500">Kat malikleri denetçisi tarafından incelenip onaylanan dönemler</p>
        </div>

        {isAuditorOrAdmin && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition-all"
          >
            <Stamp className="w-4 h-4" />
            <span>Dönemi Onayla &amp; Mühürle</span>
          </button>
        )}
      </div>

      {/* YENİ DENETİM ONAYI FORMU (DENETÇİ İÇİN) */}
      {showAddForm && (
        <form onSubmit={handleAddAudit} className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3 text-xs">
          <div className="font-bold text-teal-950 flex items-center gap-2">
            <Stamp className="w-4 h-4 text-teal-700" />
            <span>Yeni Denetim Onay Damgası Ekle</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Denetlenen Dönem</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {periodOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Denetçi Adı ve Unvanı</label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                required
                className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Denetim Notu &amp; Görüşü</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold shadow-md shadow-teal-800/20"
            >
              Damgayı Onayla &amp; Bas
            </button>
          </div>
        </form>
      )}

      {/* ONAY LİSTESİ */}
      {audits.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs italic">
          Henüz onaylanmış bir denetim raporu bulunmuyor.
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {a.period} Dönemi
                  </span>
                  <span className="font-mono text-[10px] bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded font-black tracking-wider">
                    {a.stampCode}
                  </span>
                </div>
                <p className="text-slate-600 italic">
                  "{a.notes}"
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Denetçi: <strong>{a.auditedBy}</strong></span>
                  <span>•</span>
                  <span>{formatDateTR(a.date)}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <div className="text-right">
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Denetlendi &amp; Onaylandı
                  </div>
                  <div className="text-[10px] text-slate-400">Resmi Kayıt</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AuditorStampSection;
