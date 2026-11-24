import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { createFlatDebtReminderLink } from '../../utils/whatsapp';
import storage from '../../services/storage';
import { 
  Users, 
  Search, 
  Filter, 
  MessageCircle, 
  Plus, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Phone, 
  Key, 
  X,
  CreditCard
} from 'lucide-react';

export const FlatList = ({
  onOpenCollectionWithFlat,
  onOpenAccrualModal,
}) => {
  const { 
    buildingData, 
    activeBuildingId, 
    activeBuildingMeta, 
    userRole, 
    session,
    refreshBuildingData 
  } = useAuth();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'inDebt' | 'debtFree'
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    no: '',
    floor: '',
    ownerName: '',
    tenantName: '',
    phone: '',
    pin: '',
    duesBalance: 0,
    fixtureBalance: 0,
  });

  const flats = buildingData?.flats || [];

  // Filtreleme
  const filteredFlats = flats.filter((flat) => {
    const totalDebt = (Number(flat.duesBalance) || 0) + (Number(flat.fixtureBalance) || 0);

    // Durum filtresi
    if (filterType === 'inDebt' && totalDebt <= 0) return false;
    if (filterType === 'debtFree' && totalDebt > 0) return false;

    // Arama
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNo = String(flat.no).includes(term);
      const matchOwner = (flat.ownerName || '').toLowerCase().includes(term);
      const matchTenant = (flat.tenantName || '').toLowerCase().includes(term);
      return matchNo || matchOwner || matchTenant;
    }

    return true;
  });

  // Toplam İstatistikler
  const totalDuesDebt = flats.reduce((acc, f) => acc + (Number(f.duesBalance) || 0), 0);
  const totalFixtureDebt = flats.reduce((acc, f) => acc + (Number(f.fixtureBalance) || 0), 0);
  const inDebtCount = flats.filter((f) => ((Number(f.duesBalance) || 0) + (Number(f.fixtureBalance) || 0)) > 0).length;

  // Daire Ekle / Düzenle Kaydet
  const handleSaveFlat = async (e) => {
    e.preventDefault();
    if (!formData.no || !formData.ownerName) {
      alert('Lütfen daire numarası ve kat maliki adını giriniz.');
      return;
    }

    try {
      if (editingFlat) {
        await storage.updateFlat(activeBuildingId, {
          ...editingFlat,
          no: Number(formData.no),
          floor: formData.floor,
          ownerName: formData.ownerName,
          tenantName: formData.tenantName,
          phone: formData.phone,
          pin: formData.pin || `10${formData.no}`,
          duesBalance: Number(formData.duesBalance) || 0,
          fixtureBalance: Number(formData.fixtureBalance) || 0,
        });
      } else {
        await storage.addFlat(activeBuildingId, {
          no: Number(formData.no),
          floor: formData.floor || 'Standart',
          ownerName: formData.ownerName,
          tenantName: formData.tenantName || '',
          phone: formData.phone || '',
          pin: formData.pin || `10${formData.no}`,
          duesBalance: Number(formData.duesBalance) || 0,
          fixtureBalance: Number(formData.fixtureBalance) || 0,
        });
      }

      await refreshBuildingData();
      setIsAddModalOpen(false);
      setEditingFlat(null);
    } catch (err) {
      alert('Kayıt sırasında bir hata oluştu: ' + err.message);
    }
  };

  // Daire Sil
  const handleDeleteFlat = async (flat) => {
    if (window.confirm(`Daire ${flat.no} (${flat.ownerName}) kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      await storage.deleteFlat(activeBuildingId, flat.id);
      await refreshBuildingData();
    }
  };

  const openEditModal = (flat) => {
    setEditingFlat(flat);
    setFormData({
      no: flat.no,
      floor: flat.floor || '',
      ownerName: flat.ownerName || '',
      tenantName: flat.tenantName || '',
      phone: flat.phone || '',
      pin: flat.pin || '',
      duesBalance: flat.duesBalance || 0,
      fixtureBalance: flat.fixtureBalance || 0,
    });
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingFlat(null);
    const nextNo = flats.length > 0 ? Math.max(...flats.map((f) => Number(f.no) || 0)) + 1 : 1;
    setFormData({
      no: nextNo,
      floor: '',
      ownerName: '',
      tenantName: '',
      phone: '',
      pin: `10${nextNo < 10 ? '0' + nextNo : nextNo}`,
      duesBalance: 0,
      fixtureBalance: 0,
    });
    setIsAddModalOpen(true);
  };

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'superadmin';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* ÜST BAŞLIK VE BUTONLAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Daireler ve Cari Durum
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            İşletme aidatı, demirbaş bakiyeleri ve daire bazlı iletişim
          </p>
        </div>

        {isManagerOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAccrualModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs sm:text-sm font-semibold transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Toplu Borçlandır</span>
            </button>

            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-700/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Daire Ekle</span>
            </button>
          </div>
        )}
      </div>

      {/* ÖZET KARTLAR */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center sm:text-left">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Toplam Daire</div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{flats.length}</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center sm:text-left">
          <div className="text-[11px] font-bold text-amber-600 uppercase">Borçlu Daireler</div>
          <div className="text-lg sm:text-2xl font-black text-amber-600 mt-1">{inDebtCount} Daire</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center sm:text-left">
          <div className="text-[11px] font-bold text-red-600 uppercase">Toplam Alacak</div>
          <div className="text-lg sm:text-2xl font-black text-red-600 mt-1">
            {formatCurrency(totalDuesDebt + totalFixtureDebt)}
          </div>
        </div>
      </div>

      {/* ARAMA VE FİLTRELEME ÇUBUĞU */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Arama Input */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Daire No veya İsim Ara..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filtre Butonları */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tümü ({flats.length})
          </button>

          <button
            onClick={() => setFilterType('inDebt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'inDebt'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Borçlular ({inDebtCount})
          </button>

          <button
            onClick={() => setFilterType('debtFree')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'debtFree'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Borçsuzlar ({flats.length - inDebtCount})
          </button>
        </div>
      </div>

      {/* DAİRELER LİSTESİ: MASAÜSTÜ TABLO & MOBİL KART GÖRÜNÜMÜ */}
      
      {/* 1. MASAÜSTÜ TABLOSU (hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Daire</th>
              <th className="py-3 px-4">Kat Maliki / Sakin</th>
              {isManagerOrAdmin && <th className="py-3 px-4">Telefon</th>}
              {isManagerOrAdmin && <th className="py-3 px-4">Daire PIN</th>}
              <th className="py-3 px-4 text-right">Aidat Borcu</th>
              <th className="py-3 px-4 text-right">Demirbaş Borcu</th>
              <th className="py-3 px-4 text-right">Toplam Bakiye</th>
              <th className="py-3 px-4 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFlats.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Arama kriterlerine uygun daire bulunamadı.
                </td>
              </tr>
            ) : (
              filteredFlats.map((flat) => {
                const totalDebt = (Number(flat.duesBalance) || 0) + (Number(flat.fixtureBalance) || 0);
                const hasDebt = totalDebt > 0;
                
                // WhatsApp Linki
                const whatsappUrl = createFlatDebtReminderLink({
                  name: flat.tenantName || flat.ownerName,
                  flatNo: flat.no,
                  buildingName: activeBuildingMeta?.name || 'Apartmanımız',
                  totalDebt,
                  iban: activeBuildingMeta?.iban || '',
                  phone: flat.phone,
                });

                return (
                  <tr key={flat.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Daire No & Kat */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs">
                          {flat.no}
                        </span>
                        <span className="text-slate-400 text-xs">{flat.floor || 'Giriş'}</span>
                      </div>
                    </td>

                    {/* Kat Maliki & Kiracı */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="font-semibold text-slate-900">{flat.ownerName}</div>
                      {flat.tenantName && (
                        <div className="text-[11px] text-slate-500">Kiracı: {flat.tenantName}</div>
                      )}
                    </td>

                    {/* Telefon (Sadece Yönetici/Admin) */}
                    {isManagerOrAdmin && (
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {flat.phone || '-'}
                      </td>
                    )}

                    {/* PIN (Sadece Yönetici/Admin) */}
                    {isManagerOrAdmin && (
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {flat.pin || `10${flat.no}`}
                        </span>
                      </td>
                    )}

                    {/* Aidat Borcu */}
                    <td className={`py-3.5 px-4 text-right font-medium ${flat.duesBalance > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {formatCurrency(flat.duesBalance)}
                    </td>

                    {/* Demirbaş Borcu */}
                    <td className={`py-3.5 px-4 text-right font-medium ${flat.fixtureBalance > 0 ? 'text-purple-600' : 'text-slate-500'}`}>
                      {formatCurrency(flat.fixtureBalance)}
                    </td>

                    {/* Toplam Bakiye */}
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-block font-bold px-2 py-0.5 rounded-lg text-xs ${
                        hasDebt ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {formatCurrency(totalDebt)}
                      </span>
                    </td>

                    {/* İşlemler */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* WhatsApp Hatırlatıcı (Borçlu ise aktif) */}
                        {hasDebt && flat.phone ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                            title="WhatsApp Borç Hatırlatması Gönder"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        ) : null}

                        {/* Tahsilat Al (Yönetici) */}
                        {isManagerOrAdmin && (
                          <button
                            onClick={() => onOpenCollectionWithFlat(flat)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="Tahsilat Al"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Düzenle (Yönetici) */}
                        {isManagerOrAdmin && (
                          <button
                            onClick={() => openEditModal(flat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Daireyi Düzenle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Sil (Yönetici) */}
                        {isManagerOrAdmin && (
                          <button
                            onClick={() => handleDeleteFlat(flat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Daireyi Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2. MOBİL KART GÖRÜNÜMÜ (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filteredFlats.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-white rounded-2xl p-4 border border-slate-200">
            Arama kriterlerine uygun daire bulunamadı.
          </div>
        ) : (
          filteredFlats.map((flat) => {
            const totalDebt = (Number(flat.duesBalance) || 0) + (Number(flat.fixtureBalance) || 0);
            const hasDebt = totalDebt > 0;
            const whatsappUrl = createFlatDebtReminderLink({
              name: flat.tenantName || flat.ownerName,
              flatNo: flat.no,
              buildingName: activeBuildingMeta?.name || 'Apartmanımız',
              totalDebt,
              iban: activeBuildingMeta?.iban || '',
              phone: flat.phone,
            });

            return (
              <div
                key={flat.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-sm shrink-0">
                      {flat.no}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{flat.ownerName}</div>
                      <div className="text-xs text-slate-400">
                        {flat.floor || 'Giriş'} {flat.tenantName ? `• Kiracı: ${flat.tenantName}` : ''}
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                    hasDebt ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {formatCurrency(totalDebt)}
                  </span>
                </div>

                {/* Bakiyeler Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">İşletme Aidatı</span>
                    <span className={`font-bold ${flat.duesBalance > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {formatCurrency(flat.duesBalance)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Demirbaş Borcu</span>
                    <span className={`font-bold ${flat.fixtureBalance > 0 ? 'text-purple-600' : 'text-slate-600'}`}>
                      {formatCurrency(flat.fixtureBalance)}
                    </span>
                  </div>
                </div>

                {/* Mobil Aksiyon Butonları */}
                <div className="flex items-center justify-between pt-1">
                  {isManagerOrAdmin && flat.phone && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      {flat.phone}
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {/* WhatsApp */}
                    {hasDebt && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-green-50 text-green-700 border border-green-200 text-xs font-semibold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Hatırlat</span>
                      </a>
                    )}

                    {/* Tahsilat */}
                    {isManagerOrAdmin && (
                      <button
                        onClick={() => onOpenCollectionWithFlat(flat)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Tahsilat</span>
                      </button>
                    )}

                    {/* Düzenle */}
                    {isManagerOrAdmin && (
                      <button
                        onClick={() => openEditModal(flat)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DAİRE EKLEME / DÜZENLEME MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {editingFlat ? `Daire ${editingFlat.no} Düzenle` : 'Yeni Daire Ekle'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFlat} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Daire No *</label>
                  <input
                    type="number"
                    value={formData.no}
                    onChange={(e) => setFormData({ ...formData, no: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kat / Konum</label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="Örn: 2. Kat"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kat Maliki (Ev Sahibi) *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Ad Soyad"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kiracı Adı (Varsa)</label>
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  placeholder="Kiracı Ad Soyad"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon Numarası</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0532..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Daire Giriş PIN'i</label>
                  <input
                    type="text"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="Örn: 1001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Başlangıç Borçları */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">İşletme Aidat Borcu (₺)</label>
                  <input
                    type="number"
                    value={formData.duesBalance}
                    onChange={(e) => setFormData({ ...formData, duesBalance: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Demirbaş Borcu (₺)</label>
                  <input
                    type="number"
                    value={formData.fixtureBalance}
                    onChange={(e) => setFormData({ ...formData, fixtureBalance: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20"
                >
                  {editingFlat ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default FlatList;
