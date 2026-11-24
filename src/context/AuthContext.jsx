import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storage from '../services/storage';

const AuthContext = createContext();

export const SUPERADMIN_PIN = '9999';

export const AuthProvider = ({ children }) => {
  const [buildings, setBuildings] = useState([]);
  const [activeBuildingId, setActiveBuildingId] = useState('ornek-apt');
  const [buildingData, setBuildingData] = useState(null);
  const [session, setSession] = useState(null); // { role, flatId, flatNo, buildingId }
  const [loading, setLoading] = useState(true);
  const [appSettings, setAppSettings] = useState({ showQuickDemoBar: true });

  // URL parametrelerini kontrol et (?bina=... veya ?sayfa=superadmin)
  const parseUrlParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const binaParam = params.get('bina');
    const sayfaParam = params.get('sayfa');
    return { binaParam, sayfaParam };
  }, []);

  // Tüm binaları ve aktif binayı yükle
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const bList = await storage.getBuildings();
      setBuildings(bList);

      const { binaParam } = parseUrlParams();
      let targetBuildingId = binaParam;

      if (!targetBuildingId || !bList.some((b) => b.id === targetBuildingId)) {
        targetBuildingId = await storage.getActiveBuildingId();
      }

      if (!bList.some((b) => b.id === targetBuildingId) && bList.length > 0) {
        targetBuildingId = bList[0].id;
      }

      setActiveBuildingId(targetBuildingId);
      await storage.setActiveBuildingId(targetBuildingId);

      const bData = await storage.getBuildingData(targetBuildingId);
      setBuildingData(bData);

      // Session kontrolü
      const savedSession = storage.getSession();
      if (savedSession && savedSession.buildingId === targetBuildingId) {
        setSession(savedSession);
      } else {
        setSession(null);
      }

      const settings = storage.getAppSettings();
      setAppSettings(settings);
    } catch (err) {
      console.error('Initialization error in AuthProvider:', err);
    } finally {
      setLoading(false);
    }
  }, [parseUrlParams]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Aktif binanın verilerini yeniden getir
  const refreshBuildingData = async () => {
    if (!activeBuildingId) return;
    try {
      const bData = await storage.getBuildingData(activeBuildingId);
      setBuildingData({ ...bData });
      const bList = await storage.getBuildings();
      setBuildings(bList);
    } catch (e) {
      console.error('refreshBuildingData error:', e);
    }
  };

  // Bina değiştirme
  const switchBuilding = async (buildingId) => {
    setLoading(true);
    try {
      setActiveBuildingId(buildingId);
      await storage.setActiveBuildingId(buildingId);
      const bData = await storage.getBuildingData(buildingId);
      setBuildingData(bData);
      setSession(null);
      storage.setSession(null);

      // URL'i güncelle
      const url = new URL(window.location);
      url.searchParams.set('bina', buildingId);
      window.history.replaceState({}, '', url);
    } finally {
      setLoading(false);
    }
  };

  // Giriş Yapma Fonksiyonu
  const login = async ({ role, pin, flatNo, buildingId = activeBuildingId }) => {
    const currentMeta = buildingData?.meta || buildings.find((b) => b.id === buildingId);

    if (role === 'superadmin') {
      if (pin === SUPERADMIN_PIN) {
        const newSession = { role: 'superadmin', buildingId };
        setSession(newSession);
        storage.setSession(newSession);
        return { success: true };
      }
      return { success: false, message: 'Hatalı Süper Admin PIN kodu!' };
    }

    if (role === 'manager') {
      const expectedPin = currentMeta?.managerPin || '1923';
      if (pin === expectedPin) {
        const newSession = { role: 'manager', buildingId };
        setSession(newSession);
        storage.setSession(newSession);
        return { success: true };
      }
      return { success: false, message: 'Hatalı Yönetici PIN kodu!' };
    }

    if (role === 'auditor') {
      const expectedPin = currentMeta?.auditorPin || '2025';
      if (pin === expectedPin) {
        const newSession = { role: 'auditor', buildingId };
        setSession(newSession);
        storage.setSession(newSession);
        return { success: true };
      }
      return { success: false, message: 'Hatalı Denetçi PIN kodu!' };
    }

    if (role === 'resident') {
      const flat = buildingData?.flats?.find((f) => String(f.no) === String(flatNo));
      if (!flat) {
        return { success: false, message: `Daire ${flatNo} bulunamadı!` };
      }
      if (String(flat.pin) === String(pin)) {
        const newSession = {
          role: 'resident',
          buildingId,
          flatId: flat.id,
          flatNo: flat.no,
          flatData: flat,
        };
        setSession(newSession);
        storage.setSession(newSession);
        return { success: true };
      }
      return { success: false, message: `Daire ${flatNo} için PIN hatalı!` };
    }

    return { success: false, message: 'Geçersiz giriş isteği.' };
  };

  // Çıkış Yapma
  const logout = () => {
    setSession(null);
    storage.setSession(null);
  };

  // Hızlı Demo Girişi (Geliştirici / Test Kolaylığı)
  const quickDemoLogin = (roleKey, targetFlatNo = 1) => {
    if (roleKey === 'superadmin') {
      login({ role: 'superadmin', pin: SUPERADMIN_PIN });
    } else if (roleKey === 'manager') {
      login({ role: 'manager', pin: buildingData?.meta?.managerPin || '1923' });
    } else if (roleKey === 'auditor') {
      login({ role: 'auditor', pin: buildingData?.meta?.auditorPin || '2025' });
    } else if (roleKey === 'resident') {
      const flat = buildingData?.flats?.find((f) => Number(f.no) === Number(targetFlatNo)) || buildingData?.flats?.[0];
      if (flat) {
        login({ role: 'resident', pin: flat.pin, flatNo: flat.no });
      }
    }
  };

  // Ayarları güncelle
  const updateAppSettings = (newSettings) => {
    const updated = { ...appSettings, ...newSettings };
    setAppSettings(updated);
    storage.setAppSettings(updated);
  };

  const activeBuildingMeta = buildingData?.meta || buildings.find((b) => b.id === activeBuildingId) || {};
  const currentResident = session?.role === 'resident'
    ? buildingData?.flats?.find((f) => f.id === session.flatId || String(f.no) === String(session.flatNo))
    : null;

  return (
    <AuthContext.Provider
      value={{
        buildings,
        activeBuildingId,
        activeBuildingMeta,
        buildingData,
        session,
        userRole: session?.role || null,
        currentResident,
        loading,
        appSettings,
        login,
        logout,
        switchBuilding,
        refreshBuildingData,
        quickDemoLogin,
        updateAppSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır!');
  }
  return context;
};
