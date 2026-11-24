import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import storage from '../../services/storage';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Key, 
  Building, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const BuildingSettings = () => {
  const { 
    buildingData, 
    activeBuildingId, 
    activeBuildingMeta, 
    userRole, 
    refreshBuildingData,
    appSettings,
    updateAppSettings 
  } = useAuth();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: activeBuildingMeta?.name || '',
    address: activeBuildingMeta?.address || '',
    iban: activeBuildingMeta?.iban || '',
    accountHolder: activeBuildingMeta?.accountHolder || '',
    monthlyDues: activeBuildingMeta?.monthlyDues || 850,
    managerPin: activeBuildingMeta?.managerPin || '1923',
    auditorPin: activeBuildingMeta?.auditorPin || '2025',
  });

  const [isSaved, setIsSaved] = useState(false);
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'superadmin';

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isManagerOrAdmin) {
      alert('Yalnızca bina yöneticisi ve süper admin ayarları değiştirebilir.');
      return;
    }

    try {
      const updatedMeta = {
        ...activeBuildingMeta,
        ...formData,
        monthlyDues: Number(formData.monthlyDues),
      };

      const updatedData = {
        ...buildingData,
        meta: updatedMeta,
      };

      await storage.saveBuildingData(activeBuildingId, updatedData);
      await refreshBuildingData();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      alert('Ayarlar kaydedilirken hata: ' + err.message);
    }
  };

  // JSON Tam Yedek İndir
  const handleExportBackup = async () => {
    try {
      const jsonStr = await storage.exportBackup(activeBuildingId);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seffafbina-${activeBuildingId}-yedek-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Yedek indirilirken hata: ' + err.message);
    }
  };

  // JSON Yedekten Geri Yükle
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        await storage.importBackup(activeBuildingId, content);
        await refreshBuildingData();
        alert('Apartman verileri başarıyla geri yüklendi!');
      } catch (err) {
        alert('Geçersiz yedek dosyası: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Demo Verilerini Sıfırla
  const handleResetToSeed = async () => {
    if (window.confirm('DİKKAT: Mevcut apartman verileri ilk demo ayarlarına sıfırlanacaktır. Emin misiniz?')) {
      await storage.resetToSeed(activeBuildingId);
      await refreshBuildingData();
      alert('Demo verileri sıfırlandı.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* GENEL BİNA AYARLARI FORMU */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              Apartman Genel Bilgileri &amp; Hesap Ayarları
            </h3>
            <p className="text-xs text-slate-500">Tüm sistem ve makbuzlarda dinamik olarak kullanılan bina parametreleri</p>
          </div>

          {isSaved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
              <CheckCircle className="w-3.5 h-3.5" />
              Kaydedildi!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apartman / Site Adı *</label>
              <input
                type="text"
                disabled={!isManagerOrAdmin}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Varsayılan Aylık Aidat (₺)</label>
              <input
                type="number"
                disabled={!isManagerOrAdmin}
                value={formData.monthlyDues}
                onChange={(e) => setFormData({ ...formData, monthlyDues: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Açık Adres</label>
            <input
              type="text"
              disabled={!isManagerOrAdmin}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apartman Banka IBAN</label>
              <input
                type="text"
                disabled={!isManagerOrAdmin}
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hesap Sahibi / Unvan</label>
              <input
                type="text"
                disabled={!isManagerOrAdmin}
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="Örn: Örnek Apt Yöneticiliği"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              />
            </div>
          </div>

          {/* GÜVENLİK PIN KODLARI */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-600" />
              Yönetici ve Denetçi Giriş PIN Kodları
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Yönetici PIN Kodu</label>
                <input
                  type="text"
                  disabled={!isManagerOrAdmin}
                  value={formData.managerPin}
                  onChange={(e) => setFormData({ ...formData, managerPin: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Denetçi PIN Kodu</label>
                <input
                  type="text"
                  disabled={!isManagerOrAdmin}
                  value={formData.auditorPin}
                  onChange={(e) => setFormData({ ...formData, auditorPin: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {isManagerOrAdmin && (
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Ayarları Güncelle &amp; Kaydet</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* YEDEKLEME VE VERİ YÖNETİMİ (JSON) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Veri Yedekleme ve Geri Yükleme (JSON)
          </h3>
          <p className="text-xs text-slate-500">Tüm daireleri, kasa hareketlerini ve fişleri cihazınıza yedekleyin veya başka cihaza taşıyın</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* JSON İndir */}
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>JSON Yedek İndir</span>
          </button>

          {/* JSON Geri Yükle */}
          {isManagerOrAdmin && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Yedekten Geri Yükle</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportBackup}
                className="hidden"
              />

              {/* Demo Sıfırla */}
              <button
                onClick={handleResetToSeed}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Demo Verilerini Sıfırla</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ARAYÜZ VE TEST TERCİHLERİ */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Uygulama ve Demo Seçenekleri
        </h3>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="font-semibold text-xs text-slate-800">
              Giriş Ekranında Kolay Demo Test Çubuğunu Göster
            </div>
            <div className="text-[11px] text-slate-500">
              Tek tıkla Yönetici / Denetçi / Daire 1 / Süper Admin giriş butonları
            </div>
          </div>

          <button
            onClick={() => updateAppSettings({ showQuickDemoBar: !appSettings?.showQuickDemoBar })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              appSettings?.showQuickDemoBar
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-200 text-slate-600 border-slate-300'
            }`}
          >
            {appSettings?.showQuickDemoBar ? 'Açık' : 'Kapalı'}
          </button>
        </div>
      </div>

    </div>
  );
};
export default BuildingSettings;
