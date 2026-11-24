import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');
const OUTPUT_PDF = path.resolve('docs/SeffafBina_Kullanim_Kilavuzu.pdf');
const OUTPUT_HTML = path.resolve('docs/Kullanim_Kilavuzu.html');

function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  if (fs.existsSync(filePath)) {
    const bitmap = fs.readFileSync(filePath);
    return `data:image/png;base64,${bitmap.toString('base64')}`;
  }
  return '';
}

const images = {
  login: getBase64Image('01_login_screen.png'),
  dashboard: getBase64Image('02_dashboard_manager.png'),
  collectionModal: getBase64Image('03_collection_modal.png'),
  accrualModal: getBase64Image('04_accrual_modal.png'),
  flats: getBase64Image('05_flats_matrix.png'),
  expenses: getBase64Image('06_expense_list.png'),
  receiptLightbox: getBase64Image('07_receipt_lightbox.png'),
  addExpenseModal: getBase64Image('08_add_expense_modal.png'),
  announcements: getBase64Image('09_communication_announcements.png'),
  issues: getBase64Image('10_issues_tab.png'),
  polls: getBase64Image('11_polls_tab.png'),
  boardPrint: getBase64Image('12_board_print.png'),
  auditorStamp: getBase64Image('13_auditor_stamp.png'),
  settings: getBase64Image('14_building_settings.png'),
  resident: getBase64Image('15_resident_view.png'),
  superadmin: getBase64Image('16_superadmin_view.png'),
};

const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>ŞeffafBina | Kapsamlı Kullanım Kılavuzu</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

    @page {
      size: A4;
      margin: 18mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 9pt;
        color: #64748b;
      }
      @bottom-left {
        content: "ŞeffafBina v1.0 • Apartman & Site Yönetim Kılavuzu";
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1e293b;
      background: #ffffff;
      font-size: 10pt;
      line-height: 1.55;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* KAPAK SAYFASI */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 20px;
      background: linear-gradient(135deg, #064e3b 0%, #022c22 50%, #090d16 100%);
      color: #ffffff;
      border-radius: 12px;
      page-break-after: always;
    }

    .cover-top {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cover-logo-box {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
      font-size: 32px;
    }

    .cover-brand {
      font-size: 26pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
    }

    .cover-brand span {
      color: #34d399;
      font-size: 11pt;
      font-weight: 700;
      background: rgba(16, 185, 129, 0.2);
      padding: 3px 8px;
      border-radius: 20px;
      margin-left: 8px;
      border: 1px solid rgba(52, 211, 153, 0.3);
      vertical-align: middle;
    }

    .cover-middle {
      margin: auto 0;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 900;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 16px;
    }

    .cover-title span {
      color: #6ee7b7;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 500;
      color: #cbd5e1;
      max-width: 580px;
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .cover-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .cover-badge {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 9pt;
      font-weight: 600;
      color: #e2e8f0;
    }

    .cover-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9pt;
      color: #94a3b8;
    }

    .cover-meta strong {
      color: #f1f5f9;
      display: block;
      font-size: 10pt;
    }

    /* İÇİNDEKİLER */
    .toc-title {
      font-size: 18pt;
      font-weight: 900;
      color: #064e3b;
      margin-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
    }

    .toc-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 30px;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
      font-size: 10pt;
    }

    .toc-item strong {
      color: #0f172a;
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #cbd5e1;
      margin: 0 10px;
    }

    .toc-page {
      font-weight: 700;
      color: #059669;
    }

    /* BÖLÜM STİLLERİ */
    .chapter-header {
      margin-top: 15px;
      margin-bottom: 16px;
      border-bottom: 2px solid #059669;
      padding-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chapter-num {
      font-size: 10pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #059669;
      letter-spacing: 1px;
    }

    .chapter-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    h3 {
      font-size: 12pt;
      font-weight: 700;
      color: #1e293b;
      margin: 14px 0 6px 0;
    }

    p {
      margin-bottom: 10px;
      color: #334155;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 12px;
      color: #334155;
    }

    li {
      margin-bottom: 4px;
    }

    /* EKRAN GÖRÜNTÜSÜ KUTUSU */
    .screenshot-container {
      margin: 12px 0 16px 0;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      overflow: hidden;
      background: #0f172a;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      page-break-inside: avoid;
    }

    .screenshot-bar {
      background: #1e293b;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1px solid #334155;
    }

    .screenshot-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }

    .screenshot-title {
      color: #cbd5e1;
      font-size: 8pt;
      font-weight: 600;
      margin-left: 8px;
    }

    .screenshot-img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 0 0 10px 10px;
    }

    .screenshot-caption {
      font-size: 8.5pt;
      color: #64748b;
      text-align: center;
      margin-top: 4px;
      margin-bottom: 12px;
      font-style: italic;
    }

    /* BİLGİ VE DİKKAT KUTULARI */
    .alert-box {
      padding: 10px 14px;
      border-radius: 8px;
      margin: 12px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }

    .alert-tip {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      color: #064e3b;
    }

    .alert-warn {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      color: #78350f;
    }

    .alert-info {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      color: #1e3a8a;
    }

    .alert-title {
      font-weight: 800;
      display: block;
      margin-bottom: 3px;
    }

    /* TABLOLAR */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      text-align: left;
    }

    th {
      background: #f8fafc;
      font-weight: 700;
      color: #0f172a;
    }

    /* KOD VE ROZETLER */
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-purple { background: #f3e8ff; color: #7e22ce; }
    .badge-amber { background: #fef3c7; color: #b45309; }
  </style>
</head>
<body>

  <!-- ==================== 1. SAYFA: KAPAK ==================== -->
  <div class="cover-page">
    <div class="cover-top">
      <div class="cover-logo-box">🏢</div>
      <div>
        <div class="cover-brand">ŞeffafBina <span>PWA v1.0</span></div>
        <div style="font-size: 10pt; color: #a7f3d0;">Apartman & Site Yönetiminde Yeni Nesil Şeffaflık</div>
      </div>
    </div>

    <div class="cover-middle">
      <div class="cover-title">
        KAPSAMLI KULLANICI<br>VE YÖNETİCİ <span>REHBERİ</span>
      </div>
      <div class="cover-subtitle">
        10-50 daireli apartman ve siteler için mobil öncelikli, çoklu bina destekli, çift kasalı (Aidat & Demirbaş), fiş fotoğraflı ve tek tık WhatsApp entegrasyonlu eksiksiz kullanım el kitabı.
      </div>

      <div class="cover-badges">
        <span class="cover-badge">📱 Mobil Öncelikli PWA</span>
        <span class="cover-badge">🧾 Fiş &amp; Fatura Doğrulaması</span>
        <span class="cover-badge">💬 Tek Tık WhatsApp Borç Hatırlatıcı</span>
        <span class="cover-badge">⚖️ Kat Mülkiyeti Kanunu Uyumlu</span>
        <span class="cover-badge">🛡️ 4 Ayrı Rol &amp; PIN Güvenliği</span>
        <span class="cover-badge">📋 A4 Mantar Pano Raporu</span>
      </div>
    </div>

    <div class="cover-bottom">
      <div class="cover-meta">
        <strong>T.C. Kat Mülkiyeti Kanunu (KMK) Standartlarına Uygun</strong>
        <span>Hazırlanma Tarihi: 24 Kasım 2026 • Sürüm: 1.0 Production Edition</span>
      </div>
      <div style="text-align: right;">
        <span style="color: #6ee7b7; font-weight: 800;">Google DeepMind Antigravity Mimarisinde</span>
      </div>
    </div>
  </div>

  <!-- ==================== 2. SAYFA: İÇİNDEKİLER ==================== -->
  <div class="page-break">
    <div class="toc-title">İçindekiler</div>
    <ul class="toc-list">
      <li class="toc-item"><strong>1. Genel Bakış ve Temel Mimari</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 3</span></li>
      <li class="toc-item"><strong>2. Giriş Ekranı ve 4 Farklı Rol Yetkilendirmesi</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 4</span></li>
      <li class="toc-item"><strong>3. Yönetici Özet Paneli (Dashboard) ve Kasa Yönetimi</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 5</span></li>
      <li class="toc-item"><strong>4. Daireler Matrisi, Cari Durum & WhatsApp Hatırlatıcı</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 6</span></li>
      <li class="toc-item"><strong>5. Tahsilat Alma ve Toplu Borçlandırma (Tahakkuk)</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 7</span></li>
      <li class="toc-item"><strong>6. Şeffaf Kasa ve Fişli Gider Defteri (Canvas Sıkıştırma)</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 8</span></li>
      <li class="toc-item"><strong>7. Fiş Lightbox Modalı ve Fatura İnceleme</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 9</span></li>
      <li class="toc-item"><strong>8. İletişim: Duyurular, Arıza Bildirimi ve Karar Anketleri</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 10</span></li>
      <li class="toc-item"><strong>9. Mantar Pano A4 Çıktısı (Resmi Pano Raporu)</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 11</span></li>
      <li class="toc-item"><strong>10. Denetçi Onayları ve Dijital Onay Damgası</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 12</span></li>
      <li class="toc-item"><strong>11. Apartman Parametreleri ve JSON Tam Yedekleme</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 13</span></li>
      <li class="toc-item"><strong>12. Daire Sakini Özel Arayüzü ve Süper Admin Konsolu</strong> <span class="toc-dots"></span> <span class="toc-page">Sayfa 14</span></li>
    </ul>

    <div class="alert-box alert-tip">
      <span class="alert-title">💡 Bu Kılavuz Nasıl Kullanılmalı?</span>
      Bu el kitabı hem apartman yöneticileri, hem denetçiler, hem de kat malikleri ve kiracılar için hazırlanmıştır. İlgilendiğiniz konuyu yukarıdaki başlıklardan bularak ekran görüntüleri eşliğinde adım adım uygulayabilirsiniz.
    </div>
  </div>

  <!-- ==================== 3. SAYFA: GENEL BAKIŞ ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 1</div>
        <div class="chapter-title">Genel Bakış ve Temel Mimari</div>
      </div>
      <span class="badge badge-green">Giriş</span>
    </div>

    <p>
      Geleneksel apartman yönetiminde kullanılan kâğıt defterler ve Excel tabloları; veri kayıplarına, hesap karışıklığına ve kat malikleri arasında güvensizliğe yol açmaktadır. <strong>ŞeffafBina</strong>, Türkiye'deki 10-50 daireli binaların gerçek ihtiyaçları göz önünde bulundurularak aşağıdaki ilkelerle geliştirilmiştir:
    </p>

    <h3>1. Çift Kasa Modeli: İşletme Aidatı ve Demirbaş Kasası Ayrımı</h3>
    <p>
      Apartmanlarda en sık yaşanan anlaşmazlık, kiracıların sorumlu olduğu <em>rutin aidat harcamaları</em> (merdiven elektriği, temizlik, rutin asansör bakımı) ile kat maliklerinin (ev sahiplerinin) ödemesi gereken <em>demirbaş/yatırım harcamalarının</em> (hidrofor yenileme, çatı tamiri, güvenlik kamerası) birbirine karışmasıdır. ŞeffafBina bu iki bütçeyi kesin çizgilerle ayırır.
    </p>

    <h3>2. Fiş ve Fatura Şeffaflığı</h3>
    <p>
      Sistemde harcanan her bir kuruşun arkasında bir belge olmalıdır. Yöneticinin eklediği her gidere ait fiş fotoğrafı, telefon kamerasından çekildiği anda otomatik olarak sıkıştırılır ve sisteme işlenir. Sakinler tek tıkla faturanın aslını inceleyebilir.
    </p>

    <h3>3. Mobil Öncelikli ve PWA (Progressive Web App) Teknolojisi</h3>
    <p>
      Uygulama, mobil cihazların tarayıcısında açıldığında sağ üstteki menüden <em>"Ana Ekrana Ekle"</em> denilerek uygulama mağazasına ihtiyaç duymadan tıpkı yerel bir mobil uygulama gibi telefona kurulabilir.
    </p>

    <div class="alert-box alert-info">
      <span class="alert-title">🔒 Veri Gizliliği Güvencesi</span>
      Daire sakinleri sisteme giriş yaptıklarında kendi ödemelerini ve apartmanın genel mali durumunu şeffafça görebilirler; ancak diğer komşuların kişisel telefon numaralarını göremezler.
    </div>
  </div>

  <!-- ==================== 4. SAYFA: GİRİŞ EKRANI VE ROLLER ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 2</div>
        <div class="chapter-title">Giriş Ekranı ve 4 Rol Sistemi</div>
      </div>
      <span class="badge badge-blue">Güvenlik</span>
    </div>

    <p>
      ŞeffafBina çoklu apartman (multi-tenant) altyapısına sahiptir. Giriş ekranının en üstündeki dropdown menüden veya URL parametresi (ör. <code>?bina=ornek-apt</code>) ile istenen bina seçilebilir.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">ŞeffafBina - Giriş Ekranı ve Rol Seçimi</span>
      </div>
      <img src="${images.login}" class="screenshot-img" alt="Giriş Ekranı">
    </div>
    <div class="screenshot-caption">Görsel 1: Çoklu apartman seçici, 4 rol sekmesi ve alt kısımdaki tek tık hızlı demo test çubuğu.</div>

    <h3>Sistemdeki 4 Rol ve Giriş PIN Kodları</h3>
    <table>
      <thead>
        <tr>
          <th>Rol</th>
          <th>Giriş Yöntemi</th>
          <th>Varsayılan PIN</th>
          <th>Yetki Özeti</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Yönetici</strong></td>
          <td>Yönetici Sekmesi + PIN</td>
          <td><code>1923</code></td>
          <td>Tam yetki: Tahsilat, gider, toplu borçlandırma, WhatsApp, duyuru ve ayarlar.</td>
        </tr>
        <tr>
          <td><strong>Denetçi</strong></td>
          <td>Denetçi Sekmesi + PIN</td>
          <td><code>2025</code></td>
          <td>Salt-okunur inceleme + dönemlere resmi "Denetlendi ve Onaylandı" damgası basma.</td>
        </tr>
        <tr>
          <td><strong>Daire Sakini</strong></td>
          <td>Daire No + Daire PIN</td>
          <td><code>1001</code> (Daire 1)</td>
          <td>Kendi cari geçmişi, kasa özeti, faturalar, arıza bildirimi ve ankette tek oy kullanma.</td>
        </tr>
        <tr>
          <td><strong>Süper Admin</strong></td>
          <td>Admin Sekmesi veya <code>?sayfa=superadmin</code></td>
          <td><code>9999</code></td>
          <td>Yeni bina açma, apartman silme, aidat/IBAN belirleme, portföy yönetimi.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== 5. SAYFA: DASHBOARD ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 3</div>
        <div class="chapter-title">Yönetici Özet Paneli (Dashboard)</div>
      </div>
      <span class="badge badge-green">Mali Özet</span>
    </div>

    <p>
      Yönetici olarak giriş yapıldığında karşılaşılan Dashboard, apartmanın mali durumunu tek bakışta özetleyen 4 ana gösterge kartına ve hızlı aksiyon butonlarına sahiptir.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">ŞeffafBina - Yönetici Kontrol Paneli</span>
      </div>
      <img src="${images.dashboard}" class="screenshot-img" alt="Yönetici Dashboard">
    </div>
    <div class="screenshot-caption">Görsel 2: 4 Kasa Kartı, Yönetici Hızlı Aksiyonları, Son Kasa Hareketleri ve Aktif Duyurular.</div>

    <h3>4 Temel Kasa Kartının Anlamı</h3>
    <ul>
      <li><strong>Toplam Kasa:</strong> İşletme Kasası + Demirbaş Kasası toplamı olup apartmanın banka ve eldeki toplam nakit varlığını gösterir.</li>
      <li><strong>İşletme Kasası:</strong> Rutin aidat tahsilatlarından yapılan fatura/temizlik giderleri düşüldükten sonra kalan cari bütçedir.</li>
      <li><strong>Demirbaş Kasası:</strong> Binaya yapılan yatırımlar için toplanan özel ödemeleri ve kalan yatırım rezervini gösterir.</li>
      <li><strong>Tahsilat Oranı (%):</strong> İçinde bulunulan ayın hedeflenen toplam aidat tutarının ne kadarının kasaya girdiğini yüzde ve ilerleme çubuğuyla canlı gösterir.</li>
    </ul>

    <div class="alert-box alert-tip">
      <span class="alert-title">💬 WhatsApp Grup Özeti Kopyala Butonu</span>
      Dashboard'daki "WhatsApp Özeti" butonuna basıldığında, tüm kasa bakiyelerini ve son harcamaları içeren şık biçimlendirilmiş bir metin panoya kopyalanır. Apartman WhatsApp grubuna doğrudan yapıştırabilirsiniz.
    </div>
  </div>

  <!-- ==================== 6. SAYFA: DAİRELER MATRİSİ ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 4</div>
        <div class="chapter-title">Daireler ve Cari Durum Matrisi</div>
      </div>
      <span class="badge badge-blue">Cari Takip</span>
    </div>

    <p>
      "Daireler" sekmesi, binadaki tüm dairelerin kat maliki, kiracı, telefon numarası, daire PIN kodu, İşletme Aidat Borcu, Demirbaş Borcu ve Toplam Bakiyesini listeler.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Daireler Listesi ve Durum Filtreleri</span>
      </div>
      <img src="${images.flats}" class="screenshot-img" alt="Daireler Listesi">
    </div>
    <div class="screenshot-caption">Görsel 3: Daireler matrisi, borçlu/borçsuz filtreleri ve tek tık WhatsApp hatırlatıcı linkleri.</div>

    <h3>Önemli İşlevler</h3>
    <ol>
      <li><strong>Hızlı Arama ve Filtreleme:</strong> İsim veya daire numarasıyla anlık arama yapılabilir; <em>"Tümü"</em>, <em>"Borçlular"</em> ve <em>"Borçsuzlar"</em> filtreleriyle borçlu daireler tek tıkla süzülür.</li>
      <li><strong>Tek Tık WhatsApp Borç Hatırlatıcı:</strong> Borçlu bir dairenin satırındaki yeşil WhatsApp ikonuna tıklandığında telefon numarası ve bakiye otomatik eklenerek şu mesaj hazır açılır:
        <br><code>Sayın [İsim], [Apartman Adı] Daire [No] için güncel bakiyeniz [Tutar] TL'dir. Ödemenizi apartman IBAN hesabına ([IBAN]) açıklama kısmına daire numaranızı yazarak iletebilirsiniz. İyi günler.</code>
      </li>
      <li><strong>Yeni Daire Ekleme / Düzenleme:</strong> Yönetici daire numarasını, katını, malik/kiracı adını ve başlangıç borç bakiyesini dilediği zaman güncelleyebilir.</li>
    </ol>
  </div>

  <!-- ==================== 7. SAYFA: TAHSİLAT VE TOPLU BORÇLANDIRMA ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 5</div>
        <div class="chapter-title">Tahsilat Alma ve Toplu Borçlandırma</div>
      </div>
      <span class="badge badge-green">İşlemler</span>
    </div>

    <p>
      Apartman yönetiminde nakit akışı bu iki modal üzerinden yürütülür:
    </p>

    <h3>A. Tahsilat Alma Modalı</h3>
    <p>
      Bir kat maliki veya kiracı aidat/demirbaş ödediğinde bu form açılır. Daire seçildiğinde güncel borcu ekranda belirir. "Borcu Getir" butonuna basılarak tutar otomatik doldurulabilir.
    </p>
    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Tahsilat Alma Formu</span>
      </div>
      <img src="${images.collectionModal}" class="screenshot-img" alt="Tahsilat Modalı">
    </div>
    <div class="screenshot-caption">Görsel 4: Daire seçimi, bütçe kasası seçimi (İşletme/Demirbaş) ve ödeme yöntemi (IBAN/Nakit).</div>

    <h3>B. Toplu Borçlandırma (Tahakkuk) Modalı</h3>
    <p>
      Ay başlarında tüm dairelere tek tek borç yazmak yerine bu modal kullanılır. Dönem seçilir (ör. "2026 Kasım"), bütçe türü seçilir ve tutar girilerek tek tıkla tüm dairelere borç tahakkuk ettirilir.
    </p>
    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Toplu Borçlandırma Modalı ve Mükerrer Kontrolü</span>
      </div>
      <img src="${images.accrualModal}" class="screenshot-img" alt="Toplu Borçlandırma Modalı">
    </div>
    <div class="screenshot-caption">Görsel 5: Toplu borçlandırma ekranı ve aynı dönem iki kez yazılmasın diye devreye giren sarı uyarı kutusu.</div>
  </div>

  <!-- ==================== 8. SAYFA: FİŞLİ GİDER DEFTERİ ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 6</div>
        <div class="chapter-title">Şeffaf Kasa ve Fişli Gider Defteri</div>
      </div>
      <span class="badge badge-amber">Şeffaflık</span>
    </div>

    <p>
      Apartmanın tüm harcamaları bu defterde kronolojik olarak listelenir. Harcamalar Elektrik, Su, Asansör Bakımı, Temizlik, Bakım-Onarım gibi kategorilere göre filtrelenebilir.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Kasa Hareketleri ve Fiş Listesi</span>
      </div>
      <img src="${images.expenses}" class="screenshot-img" alt="Kasa Defteri">
    </div>
    <div class="screenshot-caption">Görsel 6: Gelir ve gider dökümü, kategori filtreleri ve satırlardaki "Gör" fiş butonları.</div>

    <h3>HTML5 Canvas ile Otomatik Fiş Sıkıştırma</h3>
    <p>
      Gider ekleme formundaki fotoğraf yükleme alanı, telefon kamerasıyla çekilen yüksek çözünürlüklü faturaları yükleme anında <strong>HTML5 Canvas</strong> teknolojisiyle maksimum <strong>900 piksele</strong> ve <strong>0.7 JPEG kalitesine</strong> küçültür. Bu sayede bellek şişmez ve uygulama her zaman yüksek hızda çalışır.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Fişli Gider Ekleme Formu</span>
      </div>
      <img src="${images.addExpenseModal}" class="screenshot-img" alt="Gider Ekleme Modalı">
    </div>
    <div class="screenshot-caption">Görsel 7: Kategori seçimi, tutar, harcama kasası ve Canvas ile sıkıştırılmış fiş önizlemesi.</div>
  </div>

  <!-- ==================== 9. SAYFA: FİŞ LIGHTBOX ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 7</div>
        <div class="chapter-title">Fiş Lightbox Modalı ve İnceleme</div>
      </div>
      <span class="badge badge-purple">Denetim</span>
    </div>

    <p>
      Gider defterindeki veya Dashboard'daki herhangi bir işlem satırında yer alan <strong>"Gör"</strong> butonuna tıklandığında ekran karartılarak tam ekran <strong>Fiş Lightbox Modalı</strong> açılır.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Tam Ekran Fatura / Fiş İnceleme Penceresi (Lightbox)</span>
      </div>
      <img src="${images.receiptLightbox}" class="screenshot-img" alt="Fiş Lightbox">
    </div>
    <div class="screenshot-caption">Görsel 8: Tam ekran fatura önizleme, sağ üstteki "İndir" butonu ve detay bilgileri.</div>

    <h3>Lightbox Özellikleri</h3>
    <ul>
      <li><strong>Yüksek Çözünürlüklü İnceleme:</strong> Fatura üzerindeki belge numarası, vergi dairesi, tarih ve malzeme kalemleri net bir şekilde okunabilir.</li>
      <li><strong>Cihaza İndirme Desteği:</strong> Sağ üst köşedeki "İndir" butonuna basılarak fiş görseli cihaza JPEG formatında kaydedilebilir.</li>
      <li><strong>Kolay Kapatma:</strong> Klavyeden <code>ESC</code> tuşuna basılarak veya sağ üstteki çarpı ikonuna tıklanarak modal anında kapatılabilir.</li>
    </ul>
  </div>

  <!-- ==================== 10. SAYFA: İLETİŞİM, ARIZA VE ANKET ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 8</div>
        <div class="chapter-title">İletişim: Duyurular, Arıza ve Anketler</div>
      </div>
      <span class="badge badge-blue">Topluluk</span>
    </div>

    <p>
      Apartman sakinleriyle etkileşimi artıran üç önemli alt modül "İletişim" sekmesinde yer alır:
    </p>

    <h3>1. Duyurular Panosu</h3>
    <p>
      Yönetici olağan genel kurul toplantısı, su kesintisi veya çöp toplama kuralları gibi konularda duyuru yayınlayabilir. Acil işaretlenen duyurular kırmızı rozetle üst sırada vurgulanır.
    </p>
    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Duyuru Panosu</span>
      </div>
      <img src="${images.announcements}" class="screenshot-img" alt="Duyurular">
    </div>

    <h3>2. Ortak Alan Arıza Takibi</h3>
    <p>
      Sakinler lamba yanmaması, kapı hidroliği arızası gibi durumları fotoğraflı olarak bildirir. Yönetici durumu <code>Beklemede</code> → <code>İşleme Alındı</code> → <code>Çözüldü</code> olarak günceller ve not düşer.
    </p>
    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Ortak Alan Arıza Takibi</span>
      </div>
      <img src="${images.issues}" class="screenshot-img" alt="Arıza Takibi">
    </div>

    <h3>3. Karar Anketleri (Daire Başına 1 Oy)</h3>
    <p>
      Yönetici binada alınacak kararlar için anket başlatır (ör. "Güvenlik kamerası takılsın mı?"). Her daire yalnızca tek bir oy kullanabilir ve oylama sonuçları yüzdelik çubuk grafiklerle canlı gösterilir.
    </p>
    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Canlı Karar Anketi</span>
      </div>
      <img src="${images.polls}" class="screenshot-img" alt="Anketler">
    </div>
  </div>

  <!-- ==================== 11. SAYFA: MANTAR PANO A4 ÇIKTISI ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 9</div>
        <div class="chapter-title">Mantar Pano A4 Rapor Çıktısı (KMK Uyumlu)</div>
      </div>
      <span class="badge badge-green">Resmi Belge</span>
    </div>

    <p>
      Kat Mülkiyeti Kanunu gereğince apartman yöneticileri her ay binanın mali durumunu bina girişindeki panoya asmakla yükümlüdür. ŞeffafBina'nın <strong>Mantar Pano Çıktısı</strong>, bu işlemi tek tıkla standart bir A4 sayfasına sığdırır.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">A4 Mantar Pano Resmi Çıktı Görünümü</span>
      </div>
      <img src="${images.boardPrint}" class="screenshot-img" alt="Mantar Pano Çıktısı">
    </div>
    <div class="screenshot-caption">Görsel 9: A4 yazdırma formatında apartman anteti, kasa tablosu, gider dökümü ve ÖDENDİ/BORÇLU listesi.</div>

    <h3>A4 Raporunda Neler Yer Alır?</h3>
    <ul>
      <li><strong>Apartman Anteti &amp; Banka IBAN:</strong> Resmi apartman adı, açık adresi ve aidat ödeme IBAN numarası.</li>
      <li><strong>Mali Durum Özeti:</strong> Bu ay toplanan aidat, yapılan toplam harcama, işletme kasası ve toplam kasa varlığı.</li>
      <li><strong>Aylık Gider Kalemleri:</strong> Fatura tarihleri, kategorileri ve tutarlarıyla resmi harcama listesi.</li>
      <li><strong>Daireler Ödedi / Borçlu Matrisi:</strong> Hangi dairenin borcu var, hangi daire ödemesini yapmış; açık ve şeffaf tablo.</li>
      <li><strong>İmza &amp; Mühür Alanı:</strong> Apartman Yöneticisi ve Denetçisinin resmi imza ve kaşe kutucukları.</li>
    </ul>
  </div>

  <!-- ==================== 12. SAYFA: DENETÇİ ONAYLARI ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 10</div>
        <div class="chapter-title">Denetçi Onayları ve Dijital Damga</div>
      </div>
      <span class="badge badge-purple">Resmi Onay</span>
    </div>

    <p>
      Apartman denetçisi (veya denetim kurulu), bağımsız olarak sisteme giriş yaparak tüm kasa defterini, fiş fotoğraflarını ve banka hareketlerini inceler. İnceleme tamamlandığında ilgili döneme dijital onay damgası vurur.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Denetçi Onayları ve Mühür Listesi</span>
      </div>
      <img src="${images.auditorStamp}" class="screenshot-img" alt="Denetçi Onayları">
    </div>
    <div class="screenshot-caption">Görsel 10: Denetlenen dönemler, resmi DNT damga kodları ve denetçi rapor notları.</div>

    <h3>Dijital Damganın Çalışma Mantığı</h3>
    <ul>
      <li>Denetçi <code>2025</code> PIN koduyla giriş yapar.</li>
      <li>"Pano & Ayarlar" menüsündeki "Denetçi Onayları" sekmesine gelir.</li>
      <li>"Dönemi Onayla & Mühürle" butonuna tıklar, denetim görüşünü yazar ve onaylar.</li>
      <li>Sistem otomatik olarak benzersiz bir <code>DNT-XXXXXX</code> onay kodu üretir ve bu kod Mantar Pano A4 çıktısındaki denetçi imza kutusuna resmi damga olarak işlenir.</li>
    </ul>
  </div>

  <!-- ==================== 13. SAYFA: AYARLAR VE YEDEKLEME ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 11</div>
        <div class="chapter-title">Apartman Ayarları ve JSON Tam Yedekleme</div>
      </div>
      <span class="badge badge-blue">Yönetim</span>
    </div>

    <p>
      Apartman adı, açık adresi, banka IBAN hesabı, varsayılan aylık aidat tutarı ve giriş güvenlik PIN kodları bu ekrandan güncellenir.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Apartman Ayarları ve Veri Yedekleme</span>
      </div>
      <img src="${images.settings}" class="screenshot-img" alt="Apartman Ayarları">
    </div>
    <div class="screenshot-caption">Görsel 11: Genel bina parametreleri, PIN güncellemeleri ve JSON yedekleme butonları.</div>

    <h3>JSON Tam Yedek İndirme ve Geri Yükleme</h3>
    <ul>
      <li><strong>JSON Yedek İndir:</strong> Tek tıkla apartmanın tüm geçmişini (daireler, tüm gelir-gider kayıtları, fiş fotoğrafları, arıza ve anketler) bilgisayarınıza veya telefonunuza <code>.json</code> dosyası olarak indirir.</li>
      <li><strong>Yedekten Geri Yükle:</strong> Başka bir cihazda çalışırken veya cihaz değiştirdiğinizde daha önce indirdiğiniz JSON dosyasını seçerek tüm verileri saniyeler içinde geri yükleyebilirsiniz.</li>
      <li><strong>Veri Bütünlüğü:</strong> Silinen daireler veya kasa hareketleri kalıcı olarak silinir, F5 yapıldığında asla geri gelmez.</li>
    </ul>
  </div>

  <!-- ==================== 14. SAYFA: SAKİN VE SÜPER ADMİN ==================== -->
  <div class="page-break">
    <div class="chapter-header">
      <div>
        <div class="chapter-num">BÖLÜM 12</div>
        <div class="chapter-title">Daire Sakini Görünümü ve Süper Admin</div>
      </div>
      <span class="badge badge-green">Kullanıcı Rolleri</span>
    </div>

    <h3>A. Daire Sakini Özel Arayüzü</h3>
    <p>
      Bir kat maliki veya kiracı kendi daire numarası ve PIN'iyle giriş yaptığında, sayfanın en üstünde yalnızca kendi dairesinin borç/ödeme durumunu gösteren özel bir kart ile karşılanır.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Daire Sakini Özel Cari Durumu Kartı</span>
      </div>
      <img src="${images.resident}" class="screenshot-img" alt="Daire Sakini Görünümü">
    </div>
    <div class="screenshot-caption">Görsel 12: Daire 1 Sakini görünümü; kişiselleştirilmiş bakiye kartı ve şeffaf kasa hareketleri.</div>

    <h3>B. Süper Admin Konsolu (Portföy Yönetimi)</h3>
    <p>
      Birden fazla bina veya site yöneten profesyonel yöneticiler için geliştirilmiştir. Yeni apartman ekleyebilir, binaları aktif/pasif yapabilir ve binalar arasında tek tıkla geçiş yapabilirler.
    </p>

    <div class="screenshot-container">
      <div class="screenshot-bar">
        <span class="screenshot-dot dot-red"></span>
        <span class="screenshot-dot dot-yellow"></span>
        <span class="screenshot-dot dot-green"></span>
        <span class="screenshot-title">Süper Admin Apartman Portföyü Yönetimi</span>
      </div>
      <img src="${images.superadmin}" class="screenshot-img" alt="Süper Admin Konsolu">
    </div>
    <div class="screenshot-caption">Görsel 13: Binalar portföyü, bina parametreleri ve "Bu Binayı Yönet" geçiş butonları.</div>
  </div>

</body>
</html>
`;

async function generatePdf() {
  console.log('1. HTML kullanım kılavuzu oluşturuluyor...');
  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf-8');

  console.log('2. Puppeteer ile PDF derleniyor...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '12mm',
      right: '12mm',
    },
  });

  await browser.close();
  console.log('Kılavuz başarıyla üretildi!');
  console.log('PDF Dosyası:', OUTPUT_PDF);
  console.log('HTML Dosyası:', OUTPUT_HTML);
}

generatePdf();
