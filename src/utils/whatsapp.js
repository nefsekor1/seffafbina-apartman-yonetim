/**
 * WhatsApp Entegrasyon ve Mesaj Şablonu Yardımcıları
 */

import { formatCurrency } from './currency';

/**
 * Telefon numarasını temizleyip uluslararası formata çevirir (varsayılan Türkiye +90)
 */
export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '90' + cleaned.substring(1);
  } else if (!cleaned.startsWith('90')) {
    cleaned = '90' + cleaned;
  }
  return cleaned;
};

/**
 * Daire bazlı borç hatırlatma WhatsApp linki üretir.
 * Şablon kuralı:
 * "Sayın [İsim], [Apartman Adı] Daire [No] için güncel bakiyeniz [Tutar] TL'dir.
 * Ödemenizi apartman IBAN hesabına ([IBAN]) açıklama kısmına daire numaranızı yazarak iletebilirsiniz. İyi günler."
 */
export const createFlatDebtReminderLink = ({
  name,
  flatNo,
  buildingName,
  totalDebt,
  iban,
  phone,
}) => {
  const formattedDebt = formatCurrency(totalDebt);
  const recipientName = name || `Daire ${flatNo} Sakini`;

  const message = `Sayın ${recipientName}, ${buildingName} Daire ${flatNo} için güncel bakiyeniz ${formattedDebt} dir. Ödemenizi apartman IBAN hesabına (${iban}) açıklama kısmına daire numaranızı yazarak iletebilirsiniz. İyi günler.`;

  const cleanedPhone = cleanPhoneNumber(phone);
  const encodedMsg = encodeURIComponent(message);

  if (cleanedPhone) {
    return `https://wa.me/${cleanedPhone}?text=${encodedMsg}`;
  }
  return `https://wa.me/?text=${encodedMsg}`;
};

/**
 * Apartman WhatsApp Grubu için aylık şeffaf özet metni oluşturur.
 */
export const createMonthlyGroupSummaryText = ({
  buildingName,
  period,
  totalBalance,
  duesBalance,
  fixtureBalance,
  collectionRate,
  collectedAmount,
  totalExpenseAmount,
  recentExpenses = [],
  iban,
  accountHolder,
}) => {
  const lines = [
    `🏢 *${buildingName.toUpperCase()}*`,
    `📊 *${period || 'Aylık'} Kasa & Mali Durum Raporu*`,
    `───────────────────────`,
    `💰 *KASA BAKİYELERİ:*`,
    `• Toplam Kasa: *${formatCurrency(totalBalance)}*`,
    `• İşletme (Aidat) Kasası: ${formatCurrency(duesBalance)}`,
    `• Demirbaş (Yatırım) Kasası: ${formatCurrency(fixtureBalance)}`,
    ``,
    `📈 *BU AYIN ÖZETİ:*`,
    `• Toplanan Tahsilat: ${formatCurrency(collectedAmount)} (Tahsilat Oranı: %${collectionRate})`,
    `• Gerçekleşen Giderler: ${formatCurrency(totalExpenseAmount)}`,
  ];

  if (recentExpenses && recentExpenses.length > 0) {
    lines.push(``);
    lines.push(`🧾 *Son Yapılan Harcamalar:*`);
    recentExpenses.slice(0, 4).forEach((exp) => {
      lines.push(`- ${exp.description || exp.category}: ${formatCurrency(exp.amount)}`);
    });
  }

  lines.push(``);
  lines.push(`🏦 *Apartman Banka Hesabı:*`);
  lines.push(`IBAN: \`${iban}\``);
  if (accountHolder) {
    lines.push(`Hesap Sahibi: ${accountHolder}`);
  }
  lines.push(`⚠️ *Not:* Lütfen ödemelerinizde açıklama kısmına *Daire Numaranızı* belirtmeyi unutmayınız.`);
  lines.push(``);
  lines.push(`🌿 _ŞeffafBina Dijital Apartman Yönetimi ile hazırlanmıştır._`);

  return lines.join('\n');
};
