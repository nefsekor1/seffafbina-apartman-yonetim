import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import storage from '../../services/storage';
import { formatCurrency } from '../../utils/currency';
import { 
  Building, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ShieldCheck, 
  Key, 
  X,
  CreditCard
} from 'lucide-react';

export const SuperAdminPanel = () => {
  const { 
    buildings, 
    activeBuildingId, 
    switchBuilding, 
    refreshBuildingData 
  } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    address: '',
    iban: '',
    accountHolder: '',
    monthlyDues: 1000,
    managerPin: '1923',
    auditorPin: '2025',
    totalFlats: 10,
    isActive: true,
  });

  const handleAddBuilding = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Lütfen apartman adını giriniz.');
      return;
    }

    const buildingId = formData.id.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    try {
      const newBuilding = {
        ...formData,
        id: buildingId,
        monthlyDues: Number(formData.monthlyDues),
        totalFlats: Number(formData.totalFlats),
        isActive: true,
      };

      await storage.saveBuilding(newBuilding);
      await refreshBuildingData();
      await switchBuilding(buildingId);
      setIsAddModalOpen(false);
      alert(`"${newBuilding.name}" başarıyla oluşturuldu ve seçili bina yapıldı!`);
    } catch (err) {
      alert('Apartman eklenirken hata: ' + err.message);
    }
  };

  const handleDeleteBuilding = async (b) => {
    if (buildings.length <= 1) {
      alert('Sistemdeki son apartmanı silemezsiniz.');
      return;
    }

    if (window.confirm(`DİKKAT: "${b.name}" apartmanını ve bu apartmana ait TÜM daire/kasa verilerini kalıcı olarak silmek istediğinizden emin misiniz?`)) {
      await storage.deleteBuilding(b.id);
      await refreshBuildingData();
      const remaining = buildings.filter((item) => item.id !== b.id);
      if (remaining.length > 0) {
        await switchBuilding(remaining[0].id);
      }
    }
  };

  const handleToggleStatus = async (b) => {
    const updated = { ...b, isActive: !b.isActive };
    await storage.saveBuilding(updated);
    await refreshBuildingData();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* ÜST BAŞLIK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-1 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Süper Admin Konsolu</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Apartman ve Site Portföyü Yönetimi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Yeni apartman açma, IBAN/aidat tanımlama ve binalar arası anında geçiş
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              id: '',
              name: '',
              address: '',
              iban: '',
              accountHolder: '',
              monthlyDues: 1000,
              managerPin: '1923',
              auditorPin: '2025',
              totalFlats: 12,
              isActive: true,
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-700/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Apartman / Site Ekle</span>
        </button>
      </div>

      {/* BİNALAR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buildings.map((b) => {
          const isCurrentActive = b.id === activeBuildingId;

          return (
            <div
              key={b.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 ${
                isCurrentActive
                  ? 'bg-purple-50/50 border-purple-300 shadow-md ring-1 ring-purple-400'
                  : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-md ${
                    isCurrentActive ? 'bg-purple-600' : 'bg-slate-800'
                  }`}>
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
                      {isCurrentActive && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          Aktif Seçili
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate max-w-xs">{b.address || 'Adres belirtilmedi'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(b)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                    title={b.isActive !== false ? 'Pasife Al' : 'Aktifleştir'}
                  >
                    {b.isActive !== false ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteBuilding(b)}
                    className="p-1 rounded-lg text-slate-300 hover:text-red-600"
                    title="Apartmanı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Parametreler */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white/80 p-3 rounded-2xl border border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Bina Kodu / ID</span>
                  <span className="font-mono font-bold text-slate-800">{b.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Aylık Standart Aidat</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(b.monthlyDues || 0)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Yönetici PIN</span>
                  <span className="font-mono font-semibold text-slate-700">{b.managerPin || '1923'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Denetçi PIN</span>
                  <span className="font-mono font-semibold text-slate-700">{b.auditorPin || '2025'}</span>
                </div>
              </div>

              {/* Geçiş Butonu */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                  IBAN: {b.iban || 'Belirtilmedi'}
                </span>

                {!isCurrentActive ? (
                  <button
                    onClick={() => switchBuilding(b.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <span>Bu Binayı Yönet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-purple-700">Şu an yönetiliyor</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* YENİ BİNA EKLEME MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/50 shrink-0">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                Yeni Apartman / Site Portföye Ekle
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBuilding} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apartman / Site Adı *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Akasya Konutları A Blok"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bina Kodu (URL Parametresi)</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="Örn: akasya-a (boşsa oto üretilir)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Açık Adres</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="İl, İlçe, Mahalle ve Sokak..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apartman Banka IBAN</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hesap Sahibi</label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                    placeholder="Apartman Yöneticiliği"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Varsayılan Aidat (₺)</label>
                  <input
                    type="number"
                    value={formData.monthlyDues}
                    onChange={(e) => setFormData({ ...formData, monthlyDues: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Yönetici PIN'i</label>
                  <input
                    type="text"
                    value={formData.managerPin}
                    onChange={(e) => setFormData({ ...formData, managerPin: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Denetçi PIN'i</label>
                  <input
                    type="text"
                    value={formData.auditorPin}
                    onChange={(e) => setFormData({ ...formData, auditorPin: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-700/20"
                >
                  Apartmanı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default SuperAdminPanel;
