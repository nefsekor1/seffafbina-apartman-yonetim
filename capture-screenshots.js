import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950'],
    defaultViewport: {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1.5,
    },
  });

  const page = await browser.newPage();

  try {
    // 1. Giriş Ekranı
    console.log('1. 01_login_screen.png');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_screen.png') });

    // 2. Yönetici Oturumu Kur ve Dashboard Çek
    console.log('2. 02_dashboard_manager.png');
    await page.evaluate(() => {
      localStorage.setItem('SEFFAFBINA_SESSION_V1', JSON.stringify({ role: 'manager', buildingId: 'ornek-apt' }));
      localStorage.setItem('SEFFAFBINA_ACTIVE_BUILDING_V1', 'ornek-apt');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_dashboard_manager.png') });

    // 3. Tahsilat Alma Modalı
    console.log('3. 03_collection_modal.png');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Tahsilat Al'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_collection_modal.png') });
    // Kapat
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Vazgeç'));
      if (btn) btn.click();
    });
    await sleep(400);

    // 4. Toplu Borçlandırma Modalı
    console.log('4. 04_accrual_modal.png');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Aylık Aidat Yaz'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_accrual_modal.png') });
    // Kapat
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Vazgeç'));
      if (btn) btn.click();
    });
    await sleep(400);

    // 5. Daireler Sekmesi
    console.log('5. 05_flats_matrix.png');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const btn = navBtns.find(b => b.textContent.includes('Daireler'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_flats_matrix.png') });

    // 6. Kasa & Fişler Sekmesi
    console.log('6. 06_expense_list.png');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const btn = navBtns.find(b => b.textContent.includes('Kasa & Fişler'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_expense_list.png') });

    // 7. Fiş Lightbox Modalı
    console.log('7. 07_receipt_lightbox.png');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.trim() === 'Gör');
      if (btn) btn.click();
    });
    await sleep(700);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_receipt_lightbox.png') });
    await page.keyboard.press('Escape');
    await sleep(400);

    // 8. Fişli Gider Ekle Modalı
    console.log('8. 08_add_expense_modal.png');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Fişli Gider Ekle'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_add_expense_modal.png') });
    // Kapat
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Vazgeç'));
      if (btn) btn.click();
    });
    await sleep(400);

    // 9. İletişim Sekmesi (Duyurular)
    console.log('9. 09_communication_announcements.png');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const btn = navBtns.find(b => b.textContent.includes('İletişim'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_communication_announcements.png') });

    // 10. Arıza Bildirimi Alt Sekmesi
    console.log('10. 10_issues_tab.png');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('main button'));
      const btn = btns.find(b => b.textContent.includes('Arıza Bildirimi'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_issues_tab.png') });

    // 11. Karar Anketleri Alt Sekmesi
    console.log('11. 11_polls_tab.png');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('main button'));
      const btn = btns.find(b => b.textContent.includes('Karar Anketleri'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_polls_tab.png') });

    // 12. Pano & Ayarlar: Mantar Pano A4 Çıktısı
    console.log('12. 12_board_print.png');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const btn = navBtns.find(b => b.textContent.includes('Pano & Ayarlar'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_board_print.png') });

    // 13. Denetçi Onayları Alt Sekmesi
    console.log('13. 13_auditor_stamp.png');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('main button'));
      const btn = btns.find(b => b.textContent.includes('Denetçi Onayları'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_auditor_stamp.png') });

    // 14. Apartman Ayarları & Yedek
    console.log('14. 14_building_settings.png');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('main button'));
      const btn = btns.find(b => b.textContent.includes('Apartman Ayarları'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_building_settings.png') });

    // 15. Daire Sakini Rolü Girişi
    console.log('15. 15_resident_view.png');
    await page.evaluate(() => {
      localStorage.setItem('SEFFAFBINA_SESSION_V1', JSON.stringify({
        role: 'resident',
        buildingId: 'ornek-apt',
        flatId: 'flat_1',
        flatNo: 1,
      }));
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_resident_view.png') });

    // 16. Süper Admin Rolü Girişi
    console.log('16. 16_superadmin_view.png');
    await page.evaluate(() => {
      localStorage.setItem('SEFFAFBINA_SESSION_V1', JSON.stringify({
        role: 'superadmin',
        buildingId: 'ornek-apt',
      }));
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(600);
    // Binalar sekmesine tıkla
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const btn = navBtns.find(b => b.textContent.includes('Binalar'));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_superadmin_view.png') });

    console.log('TÜM EKRANLAR DOĞRULANDI VE EŞSİZ OLARAK ÇEKİLDİ!');
  } catch (e) {
    console.error('Hata:', e);
  } finally {
    await browser.close();
  }
}

run();
