import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import storage from '../../services/storage';
import { formatDateTR } from '../../utils/currency';
import { compressImage } from '../../utils/imageCompressor';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  MessageSquare, 
  Trash2, 
  X,
  User,
  ArrowRight,
  Loader2
} from 'lucide-react';

export const Issues = () => {
  const { 
    buildingData, 
    activeBuildingId, 
    userRole, 
    session,
    currentResident,
    refreshBuildingData 
  } = useAuth();

  const issues = buildingData?.issues || [];
  const flats = buildingData?.flats || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFlatId, setSelectedFlatId] = useState(currentResident?.id || flats[0]?.id || '');
  const [photo, setPhoto] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Durum güncelleme & not ekleme modalı
  const [updatingIssue, setUpdatingIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('pending');
  const [statusNote, setStatusNote] = useState('');

  const fileInputRef = useRef(null);
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'superadmin';

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const base64 = await compressImage(file, 900, 0.7);
      setPhoto(base64);
    } catch (err) {
      alert('Fotoğraf sıkıştırılamadı: ' + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Lütfen başlık ve açıklama giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const flat = flats.find((f) => f.id === selectedFlatId) || currentResident;

      await storage.addIssue(activeBuildingId, {
        title: title.trim(),
        description: description.trim(),
        photo: photo || null,
        flatId: flat?.id,
        flatNo: flat?.no || session?.flatNo,
        reporterName: flat ? (flat.tenantName || flat.ownerName) : 'Bina Sakini',
        status: 'pending',
      });

      await refreshBuildingData();
      setTitle('');
      setDescription('');
      setPhoto(null);
      setIsModalOpen(false);
    } catch (err) {
      alert('Arıza kaydı açılırken hata: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!updatingIssue) return;

    try {
      await storage.updateIssueStatus(
        activeBuildingId,
        updatingIssue.id,
        newStatus,
        statusNote.trim() || null
      );
      await refreshBuildingData();
      setUpdatingIssue(null);
      setStatusNote('');
    } catch (err) {
      alert('Durum güncellenirken hata: ' + err.message);
    }
  };

  const handleDeleteIssue = async (iss) => {
    if (window.confirm(`"${iss.title}" arıza kaydını silmek istediğinizden emin misiniz?`)) {
      await storage.deleteIssue(activeBuildingId, iss.id);
      await refreshBuildingData();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return { label: 'İşleme Alındı', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock };
      case 'resolved':
        return { label: 'Çözüldü', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle };
      case 'pending':
      default:
        return { label: 'Beklemede', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertCircle };
    }
  };

  return (
    <div className="space-y-4">
      {/* ÜST BAŞLIK VE ARİZA AÇMA BUTONU */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            Ortak Alan Arıza & Talep Takibi
          </h3>
          <p className="text-xs text-slate-500">Asansör, aydınlatma, su ve bina ortak alan arıza bildirimleri</p>
        </div>

        <button
          onClick={() => {
            if (currentResident) setSelectedFlatId(currentResident.id);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Arıza Bildir</span>
        </button>
      </div>

      {/* LİSTE */}
      {issues.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-slate-400 text-xs">
          Kayıtlı herhangi bir arıza veya talep bulunmuyor.
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((iss) => {
            const badge = getStatusBadge(iss.status);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={iss.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateTR(iss.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Yönetici Durum Değiştirme Butonu */}
                    {isManagerOrAdmin && (
                      <button
                        onClick={() => {
                          setUpdatingIssue(iss);
                          setNewStatus(iss.status);
                          setStatusNote('');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <span>Durumu Değiştir</span>
                      </button>
                    )}

                    {isManagerOrAdmin && (
                      <button
                        onClick={() => handleDeleteIssue(iss)}
                        className="p-1 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50"
                        title="Arıza Kaydını Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {iss.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {iss.description}
                  </p>
                </div>

                {/* Fotoğraf Varsa */}
                {iss.photo && (
                  <div className="pt-1">
                    <img
                      src={iss.photo}
                      alt="Arıza Görseli"
                      className="w-28 h-28 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                  </div>
                )}

                {/* Yönetici Notları & Güncellemeleri */}
                {iss.notes && iss.notes.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-700 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      Yönetim Notları
                    </div>
                    {iss.notes.map((note, idx) => (
                      <div key={idx} className="text-slate-600 flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{note.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Alt Bilgi */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Bildiren: <strong className="text-slate-700">{iss.reporterName}</strong> (Daire {iss.flatNo})</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* YENİ ARIZA AÇMA MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                Arıza / Talep Bildir
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bildiren Daire</label>
                <select
                  value={selectedFlatId}
                  onChange={(e) => setSelectedFlatId(e.target.value)}
                  disabled={userRole === 'resident'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75"
                >
                  {flats.map((flat) => (
                    <option key={flat.id} value={flat.id}>
                      Daire {flat.no} - {flat.ownerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Arıza / Sorun Başlığı *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 2. Kat Otomat Lambası Yanmıyor"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Açıklama *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sorunun tam yeri, ne zamandır olduğu ve detayları..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Fotoğraf Ekleme (İsteğe Bağlı) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fotoğraf Ekle (Opsiyonel)</label>
                {photo ? (
                  <div className="relative rounded-2xl border border-blue-200 bg-blue-50 p-2 flex items-center justify-between">
                    <img src={photo} alt="Önizleme" className="w-12 h-12 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer bg-slate-50 text-xs font-semibold text-slate-600 flex items-center justify-center gap-2"
                  >
                    {isCompressing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : (
                      <Camera className="w-4 h-4 text-blue-600" />
                    )}
                    <span>{isCompressing ? 'Fotoğraf sıkıştırılıyor...' : 'Arıza Fotoğrafı Çek / Seç'}</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
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
                  disabled={isSubmitting || isCompressing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Kaydı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YÖNETİCİ DURUM GÜNCELLEME MODALI */}
      {updatingIssue && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">Arıza Durumunu Güncelle</h3>
              <button
                onClick={() => setUpdatingIssue(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Yeni Durum</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('pending')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      newStatus === 'pending'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Beklemede
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('in_progress')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      newStatus === 'in_progress'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    İşleme Alındı
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('resolved')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      newStatus === 'resolved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Çözüldü
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">İşlem Notu (Opsiyonel)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Örn: Elektrikçi çağrıldı, parça bekleniyor..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdatingIssue(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md"
                >
                  Durumu Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Issues;
