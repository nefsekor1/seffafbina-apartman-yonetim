/**
 * HTML5 Canvas tabanlı fiş/fatura görseli sıkıştırma yardımcısı.
 * Görseli maksimum 900px genişlik/yükseklik sınırına orantılı küçültür
 * ve 0.7 JPEG kalitesinde base64 dataURL formatında döndürür.
 * 
 * @param {File|Blob} file - Kullanıcının yüklediği veya kameradan çektiği dosya
 * @param {number} maxDimension - Maksimum piksel sınırı (varsayılan: 900)
 * @param {number} quality - JPEG sıkıştırma kalitesi 0-1 (varsayılan: 0.7)
 * @returns {Promise<string>} - Base64 dataURL
 */
export const compressImage = (file, maxDimension = 900, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Dosya bulunamadı.'));
    }

    // Eğer SVG ise doğrudan dataURL oku
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Boyut oranını koruyarak maxDimension sınırına çek
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context alınamadı.'));
        }

        // Beyaz arka plan boya (PNG şeffaflığı siyaha dönmesin)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Görseli çiz
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG 0.7 kalitesinde base64 çıkar
        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = (err) => {
        reject(new Error('Görsel yüklenirken hata oluştu: ' + err));
      };
    };

    reader.onerror = (err) => {
      reject(new Error('Dosya okunurken hata oluştu: ' + err));
    };
  });
};

/**
 * Fiş için örnek canvas placeholder görseli üretir (demo/mock veri için)
 */
export const createMockReceipt = (title, amountStr, dateStr, billNo) => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  // Arka plan fiş kağıdı
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 600, 800);

  // Fiş çerçevesi
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 560, 760);

  // Üst tırtıklı kenar efekti
  ctx.fillStyle = '#e2e8f0';
  for (let i = 20; i < 580; i += 20) {
    ctx.beginPath();
    ctx.arc(i + 10, 20, 6, 0, Math.PI);
    ctx.fill();
  }

  // Fiş başlığı
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MALİ MAKBUZ / FATURA', 300, 90);

  ctx.fillStyle = '#475569';
  ctx.font = '16px sans-serif';
  ctx.fillText('Örnek Hizmet & Tedarik A.Ş.', 300, 125);
  ctx.fillText('Vergi No: 1234567890 | Tic. Sicil: 987654', 300, 150);

  // Çizgi
  ctx.strokeStyle = '#94a3b8';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(40, 180);
  ctx.lineTo(560, 180);
  ctx.stroke();
  ctx.setLineDash([]);

  // Detaylar
  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = '16px monospace';
  ctx.fillText(`BELGE NO : ${billNo || 'FT-2026-9041'}`, 50, 220);
  ctx.fillText(`TARİH    : ${dateStr || '20.11.2026 14:30'}`, 50, 255);
  ctx.fillText(`AÇIKLAMA : ${title || 'Bina Bakım Onarım Gideri'}`, 50, 290);
  ctx.fillText(`ÖDEME    : BANKA HAVALESİ / EFT`, 50, 325);

  // Kalemler
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(40, 360);
  ctx.lineTo(560, 360);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = 'bold 16px monospace';
  ctx.fillText('HİZMET DETAYI               KDV     TUTAR', 50, 400);
  ctx.font = '15px monospace';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('Periyodik Bakım & Malzeme   %20', 50, 440);
  ctx.textAlign = 'right';
  ctx.fillText(`${amountStr || '2.500,00'} TL`, 550, 440);

  // Toplam
  ctx.beginPath();
  ctx.moveTo(40, 520);
  ctx.lineTo(560, 520);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('GENEL TOPLAM:', 50, 570);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#047857';
  ctx.fillText(`${amountStr || '2.500,00'} ₺`, 550, 570);

  // Kaşe / Onay simülasyonu
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3;
  ctx.strokeRect(180, 630, 240, 80);
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('TAHSİL EDİLDİ', 300, 665);
  ctx.font = '12px sans-serif';
  ctx.fillText('ŞeffafBina Dijital Arşiv', 300, 690);

  return canvas.toDataURL('image/jpeg', 0.8);
};
