/**
 * Para birimi ve Tarih biçimlendirme yardımcıları
 */

/**
 * Sayıyı '1.250,00 ₺' formatına dönüştürür.
 */
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Sayıyı para sembolü olmadan '1.250,00' olarak biçimlendirir.
 */
export const formatNumber = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Tarihi '24 Kasım 2026' formatına dönüştürür.
 */
export const formatDateTR = (dateInput) => {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
};

/**
 * Tarihi '24.11.2026' formatına dönüştürür.
 */
export const formatDateShortTR = (dateInput) => {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
};

/**
 * Aktif veya verilen tarihten dönem adı üretir: "2026 Kasım"
 */
export const getCurrentPeriodName = (date = new Date()) => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const d = new Date(date);
  return `${d.getFullYear()} ${months[d.getMonth()]}`;
};

/**
 * Son 12 ayın dönem listesini döner: ["2026 Kasım", "2026 Ekim", ...]
 */
export const getRecentPeriodsList = (count = 12) => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const list = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    list.push(`${d.getFullYear()} ${months[d.getMonth()]}`);
  }
  return list;
};
