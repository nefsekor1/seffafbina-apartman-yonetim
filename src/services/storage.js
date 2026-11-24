/**
 * ŞeffafBina Depolama ve Veri Yönetim Servisi
 * LocalStorage tabanlı, asenkron Promise API sunar.
 * İleride Supabase, Firebase veya REST/Redis API'ye kolayca bağlanacak şekilde tasarlanmıştır.
 */

import { initialBuildings, initialBuildingData } from '../data/seedData';

const STORAGE_KEYS = {
  BUILDINGS: 'SEFFAFBINA_BUILDINGS_V1',
  BUILDING_DATA_PREFIX: 'SEFFAFBINA_DATA_',
  ACTIVE_BUILDING: 'SEFFAFBINA_ACTIVE_BUILDING_V1',
  SESSION: 'SEFFAFBINA_SESSION_V1',
  SETTINGS: 'SEFFAFBINA_APP_SETTINGS_V1',
};

// Yardımcı gecikme simülasyonu (Opsiyonel mikrogörev)
const asyncWrap = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 10));

class StorageService {
  constructor() {
    this.init();
  }

  init() {
    try {
      const existingBuildings = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
      if (!existingBuildings) {
        localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(initialBuildings));
        // İlk demo apartmanı verisini kaydet
        const defaultId = initialBuildings[0].id;
        localStorage.setItem(
          `${STORAGE_KEYS.BUILDING_DATA_PREFIX}${defaultId}`,
          JSON.stringify(initialBuildingData)
        );
        localStorage.setItem(STORAGE_KEYS.ACTIVE_BUILDING, defaultId);
      }
    } catch (e) {
      console.error('Storage initialization error:', e);
    }
  }

  // --- BİNA YÖNETİMİ (SUPER ADMIN & MULTI-TENANT) ---

  async getBuildings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
      return asyncWrap(raw ? JSON.parse(raw) : [...initialBuildings]);
    } catch (e) {
      console.error('getBuildings error:', e);
      return asyncWrap([]);
    }
  }

  async saveBuilding(building) {
    const buildings = await this.getBuildings();
    const existingIndex = buildings.findIndex((b) => b.id === building.id);

    let updated;
    if (existingIndex >= 0) {
      updated = buildings.map((b) => (b.id === building.id ? { ...b, ...building } : b));
    } else {
      updated = [...buildings, building];
      // Yeni bina için boş veri şablonu oluştur
      const emptyData = {
        meta: building,
        flats: [],
        transactions: [],
        announcements: [],
        issues: [],
        polls: [],
        audits: [],
      };
      localStorage.setItem(
        `${STORAGE_KEYS.BUILDING_DATA_PREFIX}${building.id}`,
        JSON.stringify(emptyData)
      );
    }

    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(updated));
    return asyncWrap(building);
  }

  async deleteBuilding(buildingId) {
    const buildings = await this.getBuildings();
    const filtered = buildings.filter((b) => b.id !== buildingId);
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(filtered));
    localStorage.removeItem(`${STORAGE_KEYS.BUILDING_DATA_PREFIX}${buildingId}`);
    return asyncWrap(true);
  }

  async getActiveBuildingId() {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_BUILDING);
    if (id) return asyncWrap(id);
    const buildings = await this.getBuildings();
    return asyncWrap(buildings[0]?.id || 'ornek-apt');
  }

  async setActiveBuildingId(buildingId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BUILDING, buildingId);
    return asyncWrap(buildingId);
  }

  // --- SEÇİLİ APARTMANIN TAM VERİSİ ---

  async getBuildingData(buildingId) {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.BUILDING_DATA_PREFIX}${buildingId}`);
      if (raw) {
        return asyncWrap(JSON.parse(raw));
      }
      // Eğer yoksa demo apartman verisinden klonla veya boş oluştur
      if (buildingId === 'ornek-apt') {
        localStorage.setItem(
          `${STORAGE_KEYS.BUILDING_DATA_PREFIX}ornek-apt`,
          JSON.stringify(initialBuildingData)
        );
        return asyncWrap(initialBuildingData);
      }
      const buildings = await this.getBuildings();
      const bMeta = buildings.find((b) => b.id === buildingId) || {};
      const fallback = {
        meta: bMeta,
        flats: [],
        transactions: [],
        announcements: [],
        issues: [],
        polls: [],
        audits: [],
      };
      return asyncWrap(fallback);
    } catch (e) {
      console.error('getBuildingData error:', e);
      return asyncWrap(initialBuildingData);
    }
  }

  async saveBuildingData(buildingId, data) {
    try {
      localStorage.setItem(
        `${STORAGE_KEYS.BUILDING_DATA_PREFIX}${buildingId}`,
        JSON.stringify(data)
      );
      // Meta bilgileri de ana listede senkronize et
      if (data.meta) {
        const buildings = await this.getBuildings();
        const updated = buildings.map((b) => (b.id === buildingId ? { ...b, ...data.meta } : b));
        localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(updated));
      }
      return asyncWrap(data);
    } catch (e) {
      console.error('saveBuildingData error:', e);
      throw e;
    }
  }

  // --- DAİRELER VE CARİ BİLGİLER ---

  async getFlats(buildingId) {
    const data = await this.getBuildingData(buildingId);
    return asyncWrap(data.flats || []);
  }

  async updateFlat(buildingId, updatedFlat) {
    const data = await this.getBuildingData(buildingId);
    data.flats = data.flats.map((f) => (f.id === updatedFlat.id ? { ...f, ...updatedFlat } : f));
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(updatedFlat);
  }

  async addFlat(buildingId, flat) {
    const data = await this.getBuildingData(buildingId);
    const newFlat = {
      ...flat,
      id: flat.id || `flat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      duesBalance: Number(flat.duesBalance || 0),
      fixtureBalance: Number(flat.fixtureBalance || 0),
    };
    data.flats.push(newFlat);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(newFlat);
  }

  async deleteFlat(buildingId, flatId) {
    const data = await this.getBuildingData(buildingId);
    data.flats = data.flats.filter((f) => f.id !== flatId);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(true);
  }

  // --- KASA HAREKETLERİ (GELİR / GİDER / TAHSİLAT) ---

  async getTransactions(buildingId) {
    const data = await this.getBuildingData(buildingId);
    return asyncWrap(data.transactions || []);
  }

  async addTransaction(buildingId, tx) {
    const data = await this.getBuildingData(buildingId);
    const newTx = {
      ...tx,
      id: tx.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      amount: Number(tx.amount || 0),
    };

    // Eğer bir daireden tahsilat yapılıyorsa (gelir ise) dairenin borcunu düşür
    if (newTx.type === 'income' && newTx.flatId) {
      data.flats = data.flats.map((f) => {
        if (f.id === newTx.flatId || String(f.no) === String(newTx.flatNo)) {
          if (newTx.budgetType === 'dues') {
            return { ...f, duesBalance: Math.max(0, (f.duesBalance || 0) - newTx.amount) };
          } else if (newTx.budgetType === 'fixture') {
            return { ...f, fixtureBalance: Math.max(0, (f.fixtureBalance || 0) - newTx.amount) };
          }
        }
        return f;
      });
    }

    data.transactions.unshift(newTx);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(newTx);
  }

  async deleteTransaction(buildingId, txId) {
    const data = await this.getBuildingData(buildingId);
    // İşlemi bulup gerekirse daire bakiyesini geri alma kontrolü (opsiyonel)
    data.transactions = data.transactions.filter((t) => t.id !== txId);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(true);
  }

  // --- TOPLU BORÇLANDIRMA (TAHAKKUK) ---

  async bulkAccrue(buildingId, { period, budgetType, amount, description }) {
    const data = await this.getBuildingData(buildingId);
    const numAmount = Number(amount);

    // Her daireye borç ekle
    data.flats = data.flats.map((flat) => {
      if (budgetType === 'dues') {
        return { ...flat, duesBalance: (flat.duesBalance || 0) + numAmount };
      } else {
        return { ...flat, fixtureBalance: (flat.fixtureBalance || 0) + numAmount };
      }
    });

    // Tahakkuk kaydı oluştur
    if (!data.accruals) data.accruals = [];
    data.accruals.push({
      id: `acc_${Date.now()}`,
      period,
      budgetType,
      amount: numAmount,
      description: description || `${period} ${budgetType === 'dues' ? 'Aidat' : 'Demirbaş'} Tahakkuku`,
      date: new Date().toISOString(),
      flatCount: data.flats.length,
    });

    await this.saveBuildingData(buildingId, data);
    return asyncWrap(data);
  }

  // --- DUYURULAR ---

  async getAnnouncements(buildingId) {
    const data = await this.getBuildingData(buildingId);
    return asyncWrap(data.announcements || []);
  }

  async addAnnouncement(buildingId, ann) {
    const data = await this.getBuildingData(buildingId);
    const newAnn = {
      ...ann,
      id: ann.id || `ann_${Date.now()}`,
      date: ann.date || new Date().toISOString(),
    };
    data.announcements.unshift(newAnn);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(newAnn);
  }

  async deleteAnnouncement(buildingId, annId) {
    const data = await this.getBuildingData(buildingId);
    data.announcements = data.announcements.filter((a) => a.id !== annId);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(true);
  }

  // --- ARIZA VE TALEPLER ---

  async getIssues(buildingId) {
    const data = await this.getBuildingData(buildingId);
    return asyncWrap(data.issues || []);
  }

  async addIssue(buildingId, issue) {
    const data = await this.getBuildingData(buildingId);
    const newIssue = {
      ...issue,
      id: issue.id || `issue_${Date.now()}`,
      status: issue.status || 'pending', // pending, in_progress, resolved
      date: new Date().toISOString(),
      notes: issue.notes || [],
    };
    data.issues.unshift(newIssue);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(newIssue);
  }

  async updateIssueStatus(buildingId, issueId, newStatus, noteText = null) {
    const data = await this.getBuildingData(buildingId);
    data.issues = data.issues.map((i) => {
      if (i.id === issueId) {
        const notes = i.notes || [];
        if (noteText) {
          notes.push({ text: noteText, date: new Date().toISOString() });
        }
        return { ...i, status: newStatus, notes };
      }
      return i;
    });
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(true);
  }

  async deleteIssue(buildingId, issueId) {
    const data = await this.getBuildingData(buildingId);
    data.issues = data.issues.filter((i) => i.id !== issueId);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(true);
  }

  // --- ANKETLER ---

  async getPolls(buildingId) {
    const data = await this.getBuildingData(buildingId);
    return asyncWrap(data.polls || []);
  }

  async addPoll(buildingId, poll) {
    const data = await this.getBuildingData(buildingId);
    const newPoll = {
      ...poll,
      id: poll.id || `poll_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true,
      options: poll.options.map((opt, idx) => ({
        id: opt.id || `opt_${idx}`,
        text: opt.text || opt,
        votes: [], // daire numaraları veya id'leri
      })),
    };
    data.polls.unshift(newPoll);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(newPoll);
  }

  async votePoll(buildingId, pollId, optionId, flatId) {
    const data = await this.getBuildingData(buildingId);
    data.polls = data.polls.map((poll) => {
      if (poll.id === pollId) {
        // Daire daha önce oy kullanmış mı temizle (tek oy kuralı)
        const updatedOptions = poll.options.map((opt) => ({
          ...opt,
          votes: (opt.votes || []).filter((v) => String(v) !== String(flatId)),
        }));
        // Seçilen seçeneğe ekle
        const targetOpt = updatedOptions.find((opt) => opt.id === optionId);
        if (targetOpt) {
          targetOpt.votes.push(String(flatId));
        }
        return { ...poll, options: updatedOptions };
      }
      return poll;
    });
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(true);
  }

  async deletePoll(buildingId, pollId) {
    const data = await this.getBuildingData(buildingId);
    data.polls = data.polls.filter((p) => p.id !== pollId);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(true);
  }

  // --- DENETÇİ ONAY VE DAMGALARI ---

  async getAudits(buildingId) {
    const data = await this.getBuildingData(buildingId);
    return asyncWrap(data.audits || []);
  }

  async addAudit(buildingId, audit) {
    const data = await this.getBuildingData(buildingId);
    if (!data.audits) data.audits = [];
    const newAudit = {
      ...audit,
      id: `audit_${Date.now()}`,
      date: new Date().toISOString(),
      stampCode: `DNT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    };
    data.audits.unshift(newAudit);
    await this.saveBuildingData(buildingId, data);
    return asyncWrap(newAudit);
  }

  // --- YEDEK ALMA VE GERİ YÜKLEME (JSON EXPORT / IMPORT) ---

  async exportBackup(buildingId) {
    const data = await this.getBuildingData(buildingId);
    const exportObject = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      buildingId,
      data,
    };
    const jsonStr = JSON.stringify(exportObject, null, 2);
    return asyncWrap(jsonStr);
  }

  async importBackup(buildingId, jsonContent) {
    try {
      const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      if (!parsed || !parsed.data) {
        throw new Error('Geçersiz yedek dosyası formatı!');
      }
      await this.saveBuildingData(buildingId, parsed.data);
      return asyncWrap(true);
    } catch (e) {
      console.error('Yedek yükleme hatası:', e);
      throw e;
    }
  }

  // Demo verilerini sıfırla
  async resetToSeed(buildingId = 'ornek-apt') {
    localStorage.removeItem(`${STORAGE_KEYS.BUILDING_DATA_PREFIX}${buildingId}`);
    localStorage.setItem(
      `${STORAGE_KEYS.BUILDING_DATA_PREFIX}${buildingId}`,
      JSON.stringify(initialBuildingData)
    );
    return asyncWrap(true);
  }

  // --- OTURUM VE AYARLAR ---

  getSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setSession(session) {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }

  getAppSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : { showQuickDemoBar: true };
    } catch {
      return { showQuickDemoBar: true };
    }
  }

  setAppSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
}

export const storage = new StorageService();
export default storage;
