/**
 * ŞeffafBina Başlangıç Demo Verileri (12 Daireli Örnek Apartmanı - B Blok)
 */

// Kolay ve hafif SVG fatura şablonu oluşturucu
const makeSvgInvoice = (title, amount, dateStr, no) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <rect width="600" height="800" fill="#f8fafc" rx="8"/>
    <rect x="25" y="25" width="550" height="750" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" rx="6"/>
    <rect x="25" y="25" width="550" height="90" fill="#064e3b" rx="6"/>
    <text x="300" y="70" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">FATURA &amp; MAKBUZ</text>
    <text x="300" y="95" fill="#a7f3d0" font-family="sans-serif" font-size="14" text-anchor="middle">Resmi Mali Harcama Belgesi</text>
    
    <text x="50" y="160" fill="#334155" font-family="monospace" font-size="15" font-weight="bold">BELGE NO : ${no}</text>
    <text x="50" y="190" fill="#334155" font-family="monospace" font-size="15">TARİH    : ${dateStr}</text>
    <text x="50" y="220" fill="#334155" font-family="monospace" font-size="15">FİRMA    : Şeffaf Hizmet ve Teknik Ltd. Şti.</text>
    <text x="50" y="250" fill="#334155" font-family="monospace" font-size="15">VERGİ NO : 3489201948 - Kadıköy VD.</text>
    
    <line x1="45" y1="280" x2="555" y2="280" stroke="#94a3b8" stroke-dasharray="6,6"/>
    
    <text x="50" y="320" fill="#0f172a" font-family="sans-serif" font-size="17" font-weight="bold">Harcama Açıklaması:</text>
    <text x="50" y="350" fill="#334155" font-family="sans-serif" font-size="16">${title}</text>
    <text x="50" y="380" fill="#64748b" font-family="sans-serif" font-size="14">İşçilik ve KDV dahildir. Apartman ortak gideridir.</text>
    
    <rect x="45" y="420" width="510" height="50" fill="#f1f5f9" rx="4"/>
    <text x="60" y="452" fill="#475569" font-family="monospace" font-size="16" font-weight="bold">HİZMET KALEMİ</text>
    <text x="535" y="452" fill="#475569" font-family="monospace" font-size="16" font-weight="bold" text-anchor="end">TUTAR</text>
    
    <text x="60" y="510" fill="#1e293b" font-family="sans-serif" font-size="15">${title.slice(0, 32)}</text>
    <text x="535" y="510" fill="#1e293b" font-family="monospace" font-size="16" font-weight="bold" text-anchor="end">${amount} TL</text>
    
    <line x1="45" y1="560" x2="555" y2="560" stroke="#047857" stroke-width="2"/>
    
    <text x="50" y="610" fill="#0f172a" font-family="sans-serif" font-size="20" font-weight="bold">TOPLAM TUTAR :</text>
    <text x="535" y="610" fill="#047857" font-family="monospace" font-size="24" font-weight="bold" text-anchor="end">${amount} ₺</text>
    
    <rect x="180" y="650" width="240" height="70" fill="none" stroke="#059669" stroke-width="3" rx="8" stroke-dasharray="8,4"/>
    <text x="300" y="685" fill="#059669" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">ÖDENDİ - ONAYLI</text>
    <text x="300" y="705" fill="#059669" font-family="sans-serif" font-size="12" text-anchor="middle">ŞeffafBina Dijital Fiş Sistemi</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
};

export const initialBuildings = [
  {
    id: 'ornek-apt',
    name: 'Örnek Apartmanı - B Blok',
    address: 'Atatürk Mah. Karanfil Sok. No: 14 Kadıköy / İstanbul',
    iban: 'TR33 0006 1005 1234 5678 9012 34',
    accountHolder: 'Örnek Apt B Blok Yöneticiliği',
    monthlyDues: 850,
    managerPin: '1923',
    auditorPin: '2025',
    isActive: true,
    totalFlats: 12,
  },
  {
    id: 'gunes-sitesi',
    name: 'Güneş Sitesi - A Blok',
    address: 'Barbaros Bulvarı No: 42 Beşiktaş / İstanbul',
    iban: 'TR44 0006 2000 9876 5432 1098 76',
    accountHolder: 'Güneş Sitesi A Blok Yönetimi',
    monthlyDues: 1200,
    managerPin: '1923',
    auditorPin: '2025',
    isActive: true,
    totalFlats: 16,
  }
];

export const initialBuildingData = {
  meta: initialBuildings[0],
  flats: [
    { id: 'flat_1', no: 1, floor: 'Giriş', ownerName: 'Ahmet Yılmaz', tenantName: '', phone: '0532 111 2233', pin: '1001', duesBalance: 0, fixtureBalance: 0 },
    { id: 'flat_2', no: 2, floor: 'Giriş', ownerName: 'Fatma Şahin', tenantName: 'Can Tekin', phone: '0542 222 3344', pin: '1002', duesBalance: 850, fixtureBalance: 0 },
    { id: 'flat_3', no: 3, floor: '1. Kat', ownerName: 'Mehmet Demir', tenantName: '', phone: '0555 333 4455', pin: '1003', duesBalance: 1700, fixtureBalance: 500 },
    { id: 'flat_4', no: 4, floor: '1. Kat', ownerName: 'Ayşe Kaya', tenantName: 'Elif Polat', phone: '0533 444 5566', pin: '1004', duesBalance: 0, fixtureBalance: 0 },
    { id: 'flat_5', no: 5, floor: '2. Kat', ownerName: 'Mustafa Çelik', tenantName: '', phone: '0505 555 6677', pin: '1005', duesBalance: 850, fixtureBalance: 0 },
    { id: 'flat_6', no: 6, floor: '2. Kat', ownerName: 'Emine Arslan', tenantName: '', phone: '0544 666 7788', pin: '1006', duesBalance: 0, fixtureBalance: 0 },
    { id: 'flat_7', no: 7, floor: '3. Kat', ownerName: 'Ali Öztürk', tenantName: 'Burak Koç', phone: '0536 777 8899', pin: '1007', duesBalance: 2550, fixtureBalance: 1500 },
    { id: 'flat_8', no: 8, floor: '3. Kat', ownerName: 'Zeynep Aksoy', tenantName: '', phone: '0552 888 9900', pin: '1008', duesBalance: 0, fixtureBalance: 0 },
    { id: 'flat_9', no: 9, floor: '4. Kat', ownerName: 'Hüseyin Kurt', tenantName: '', phone: '0537 999 0011', pin: '1009', duesBalance: 0, fixtureBalance: 500 },
    { id: 'flat_10', no: 10, floor: '4. Kat', ownerName: 'Hatice Doğan', tenantName: 'Seda Aydın', phone: '0543 101 1213', pin: '1010', duesBalance: 850, fixtureBalance: 0 },
    { id: 'flat_11', no: 11, floor: '5. Kat', ownerName: 'Kemal Güneş', tenantName: '', phone: '0538 121 1415', pin: '1011', duesBalance: 0, fixtureBalance: 0 },
    { id: 'flat_12', no: 12, floor: '5. Kat', ownerName: 'Merve Yıldız', tenantName: '', phone: '0507 131 1617', pin: '1012', duesBalance: 0, fixtureBalance: 0 },
  ],
  transactions: [
    // Gelirler (Aidat ve Demirbaş Tahsilatları)
    {
      id: 'tx_inc_1',
      date: '2026-11-20',
      type: 'income',
      budgetType: 'dues',
      category: 'Aidat Tahsilatı',
      amount: 850,
      description: 'Kasım 2026 Aidat Ödemesi',
      paymentMethod: 'IBAN',
      flatId: 'flat_1',
      flatNo: 1,
      payerName: 'Ahmet Yılmaz',
      period: '2026 Kasım',
    },
    {
      id: 'tx_inc_2',
      date: '2026-11-18',
      type: 'income',
      budgetType: 'dues',
      category: 'Aidat Tahsilatı',
      amount: 850,
      description: 'Kasım 2026 Aidat Ödemesi',
      paymentMethod: 'IBAN',
      flatId: 'flat_4',
      flatNo: 4,
      payerName: 'Elif Polat',
      period: '2026 Kasım',
    },
    {
      id: 'tx_inc_3',
      date: '2026-11-15',
      type: 'income',
      budgetType: 'dues',
      category: 'Aidat Tahsilatı',
      amount: 850,
      description: 'Kasım 2026 Aidat Ödemesi',
      paymentMethod: 'Nakit',
      flatId: 'flat_6',
      flatNo: 6,
      payerName: 'Emine Arslan',
      period: '2026 Kasım',
    },
    {
      id: 'tx_inc_4',
      date: '2026-11-12',
      type: 'income',
      budgetType: 'fixture',
      category: 'Demirbaş Tahsilatı',
      amount: 1500,
      description: 'Asansör Revizyon Katkı Payı',
      paymentMethod: 'IBAN',
      flatId: 'flat_8',
      flatNo: 8,
      payerName: 'Zeynep Aksoy',
      period: '2026 Kasım',
    },
    {
      id: 'tx_inc_5',
      date: '2026-11-10',
      type: 'income',
      budgetType: 'dues',
      category: 'Aidat Tahsilatı',
      amount: 850,
      description: 'Kasım 2026 Aidat Ödemesi',
      paymentMethod: 'IBAN',
      flatId: 'flat_11',
      flatNo: 11,
      payerName: 'Kemal Güneş',
      period: '2026 Kasım',
    },
    {
      id: 'tx_inc_6',
      date: '2026-11-08',
      type: 'income',
      budgetType: 'dues',
      category: 'Aidat Tahsilatı',
      amount: 850,
      description: 'Kasım 2026 Aidat Ödemesi',
      paymentMethod: 'IBAN',
      flatId: 'flat_12',
      flatNo: 12,
      payerName: 'Merve Yıldız',
      period: '2026 Kasım',
    },

    // Giderler (Fişli)
    {
      id: 'tx_exp_1',
      date: '2026-11-22',
      type: 'expense',
      budgetType: 'dues',
      category: 'Asansör Bakımı',
      amount: 1250,
      description: 'Kone Asansör Aylık Periyodik Bakım ve Yağlama',
      paymentMethod: 'IBAN',
      period: '2026 Kasım',
      receiptImage: makeSvgInvoice('Kone Asansör Kasım Bakımı', '1.250,00', '22.11.2026', 'FT-2026-8819'),
    },
    {
      id: 'tx_exp_2',
      date: '2026-11-19',
      type: 'expense',
      budgetType: 'dues',
      category: 'Elektrik',
      amount: 980,
      description: 'BEDAŞ Ortak Alan ve Merdiven Otomatiği Elektrik Faturası',
      paymentMethod: 'IBAN',
      period: '2026 Kasım',
      receiptImage: makeSvgInvoice('BEDAŞ Ortak Alan Elektrik', '980,00', '19.11.2026', 'BEDAS-77401'),
    },
    {
      id: 'tx_exp_3',
      date: '2026-11-14',
      type: 'expense',
      budgetType: 'dues',
      category: 'Temizlik',
      amount: 650,
      description: 'Ortak Alan Temizlik Malzemeleri (Deterjan, Çöp Poşeti, Paspas)',
      paymentMethod: 'Nakit',
      period: '2026 Kasım',
      receiptImage: makeSvgInvoice('Metro Toptan Temizlik Alışverişi', '650,00', '14.11.2026', 'FIS-9921'),
    },
    {
      id: 'tx_exp_4',
      date: '2026-11-05',
      type: 'expense',
      budgetType: 'fixture',
      category: 'Bakım-Onarım',
      amount: 3200,
      description: 'Hidrofor Su Basınç Pompası ve Membran Değişimi',
      paymentMethod: 'IBAN',
      period: '2026 Kasım',
      receiptImage: makeSvgInvoice('Hidrofor Motor & Membran Onarımı', '3.200,00', '05.11.2026', 'FT-2026-4011'),
    },
    {
      id: 'tx_exp_5',
      date: '2026-10-28',
      type: 'expense',
      budgetType: 'dues',
      category: 'Su',
      amount: 420,
      description: 'İSKİ Bahçe ve Ortak Alan Su Faturası',
      paymentMethod: 'IBAN',
      period: '2026 Ekim',
      receiptImage: makeSvgInvoice('İSKİ Bahçe ve Ortak Su', '420,00', '28.10.2026', 'ISKI-2026-10'),
    }
  ],
  announcements: [
    {
      id: 'ann_1',
      title: 'Yıllık Olağan Kat Malikleri Genel Kurul Toplantısı',
      content: 'Değerli komşularımız, 2026-2027 dönemi olağan genel kurul toplantısı 14 Aralık 2026 Pazar günü saat 19:30\'da bina sığınağında yapılacaktır. Çoğunluk sağlanamazsa 21 Aralık 2026 tarihinde aynı yer ve saatte toplanılacaktır. Katılımınız önemle rica olunur.',
      isUrgent: true,
      date: '2026-11-22T10:00:00Z',
      author: 'Yönetim',
    },
    {
      id: 'ann_2',
      title: 'Çöp Toplama Saatleri ve Geri Dönüşüm Hatırlatması',
      content: 'Apartman görevlimiz çöpleri her akşam saat 19:00 - 19:30 arasında kapılardan almaktadır. Lütfen bu saatler haricinde koridorlara çöp poşeti bırakmayınız. Mavi geri dönüşüm poşetleri ayrı toplanmaktadır.',
      isUrgent: false,
      date: '2026-11-15T09:30:00Z',
      author: 'Yönetim',
    }
  ],
  issues: [
    {
      id: 'iss_1',
      title: '3. Kat Merdiven Otomatiği Yanmıyor',
      description: '3. kat sahanlığındaki sensörlü LED lamba algılamıyor, akşamları merdiven tamamen karanlık kalıyor.',
      status: 'in_progress', // pending, in_progress, resolved
      date: '2026-11-23T16:20:00Z',
      flatId: 'flat_7',
      flatNo: 7,
      reporterName: 'Burak Koç',
      notes: [
        { text: 'Elektrikçi çağrıldı, yarın öğlen sensör kontrol edilecek.', date: '2026-11-24T09:00:00Z' }
      ]
    },
    {
      id: 'iss_2',
      title: 'Sığınak Kapısı Kolu Gevşek',
      description: 'Sığınak kapısının kilit mekanizması zor açılıyor ve kol yerinden oynamış durumda.',
      status: 'pending',
      date: '2026-11-21T11:45:00Z',
      flatId: 'flat_2',
      flatNo: 2,
      reporterName: 'Can Tekin',
      notes: []
    },
    {
      id: 'iss_3',
      title: 'Giriş Kapısı Hidroliği Yağ Kaçırıyordu',
      description: 'Ana giriş demir kapısı sert çarpıyordu, hidrolik yenilendi.',
      status: 'resolved',
      date: '2026-11-10T14:00:00Z',
      flatId: 'flat_1',
      flatNo: 1,
      reporterName: 'Ahmet Yılmaz',
      notes: [
        { text: 'Kale kilit yetkili servisi tarafından yeni kapı hidroliği takıldı.', date: '2026-11-12T15:00:00Z' }
      ]
    }
  ],
  polls: [
    {
      id: 'poll_1',
      question: 'Bina Girişine ve Otoparka Güvenlik Kamerası (CCTV) Takılsın mı?',
      createdAt: '2026-11-16T12:00:00Z',
      isActive: true,
      options: [
        { id: 'opt_1', text: 'Evet, takılsın (Demirbaş bütçesinden karşılanabilir)', votes: ['flat_1', 'flat_4', 'flat_6', 'flat_8', 'flat_11'] },
        { id: 'opt_2', text: 'Hayır, gerek yok', votes: ['flat_3', 'flat_7'] },
        { id: 'opt_3', text: 'Kararsızım / Fiyat teklifi görülsün', votes: ['flat_2', 'flat_5'] }
      ]
    }
  ],
  audits: [
    {
      id: 'audit_1',
      period: '2026 Ekim',
      notes: '2026 yılı Ekim ayı tüm gelir-gider makbuzları, banka hesap ekstresi ve fiş kayıtları tarafımca incelenmiş; kasa bakiyesi kuruşu kuruşuna denk bulunmuştur. Harcamalar bütçe sınırları dahilindedir.',
      auditedBy: 'Süleyman Vural (Denetçi - Daire 9)',
      date: '2026-11-02T16:00:00Z',
      stampCode: 'DNT-982104'
    }
  ],
  accruals: [
    {
      id: 'acc_1',
      period: '2026 Kasım',
      budgetType: 'dues',
      amount: 850,
      description: '2026 Kasım Ayı Olağan İşletme Aidatı Tahakkuku',
      date: '2026-11-01T00:00:00Z',
      flatCount: 12
    }
  ]
};
