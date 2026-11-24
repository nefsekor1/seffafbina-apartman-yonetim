import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import storage from '../../services/storage';
import { formatDateTR } from '../../utils/currency';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Calendar, 
  X,
  BellRing
} from 'lucide-react';

export const Announcements = () => {
  const { 
    buildingData, 
    activeBuildingId, 
    userRole, 
    refreshBuildingData 
  } = useAuth();

  const announcements = buildingData?.announcements || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'superadmin';

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Lütfen duyuru başlığı ve metnini giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      await storage.addAnnouncement(activeBuildingId, {
        title: title.trim(),
        content: content.trim(),
        isUrgent,
        author: isManagerOrAdmin ? 'Yönetim' : 'Daire Sakini',
        date: new Date().toISOString(),
      });

      await refreshBuildingData();
      setTitle('');
      setContent('');
      setIsUrgent(false);
      setIsModalOpen(false);
    } catch (err) {
      alert('Duyuru eklenirken hata: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (ann) => {
    if (window.confirm(`"${ann.title}" duyurusunu silmek istediğinizden emin misiniz?`)) {
      await storage.deleteAnnouncement(activeBuildingId, ann.id);
      await refreshBuildingData();
    }
  };

  return (
    <div className="space-y-4">
      {/* BAŞLIK & EKLEME BUTONU */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            Apartman Duyuru Panosu
          </h3>
          <p className="text-xs text-slate-500">Genel kurul, bakım çalışmaları ve apartman bilgilendirmeleri</p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Duyuru Yayınla</span>
          </button>
        )}
      </div>

      {/* DUYURU LİSTESİ */}
      {announcements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-slate-400 text-xs">
          Henüz yayınlanmış bir duyuru bulunmamaktadır.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-all ${
                ann.isUrgent
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {ann.isUrgent ? (
                    <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider">
                      <AlertCircle className="w-3 h-3" />
                      Acil Duyuru
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                      Genel
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateTR(ann.date)}
                  </span>
                </div>

                {isManagerOrAdmin && (
                  <button
                    onClick={() => handleDeleteAnnouncement(ann)}
                    className="p-1 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Duyuruyu Kaldır"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-2">
                {ann.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Yayınlayan: <strong>{ann.author || 'Apartman Yönetimi'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DUYURU EKLEME MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-600" />
                Yeni Duyuru Yayınla
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duyuru Başlığı *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Asansör Bakımı ve Revizyonu"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duyuru İçeriği *</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Daire sakinlerine duyurmak istediğiniz mesajı detaylı yazınız..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <label htmlFor="isUrgent" className="text-xs font-bold text-amber-950 cursor-pointer">
                  Acil Duyuru Olarak İşaretle (Kırmızı Rozet)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-600/20"
                >
                  Duyuruyu Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Announcements;
