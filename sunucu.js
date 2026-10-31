// BMH231 - Web Programlama - Ödev 2
// Kampüs Etkinlik Panosu - Sunucu (Node.js HTTP Modülü)
// Öğrenci: Nisa Pelin Temel - 16008125084

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const VERI_DOSYASI = path.join(__dirname, 'etkinlikler.json');

// MIME türleri sözlüğü
const MIME_TURLERI = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

// JSON dosyasından etkinlikleri okuyan yardımcı fonksiyon
function etkinlikleriOku() {
  try {
    const hamVeri = fs.readFileSync(VERI_DOSYASI, 'utf-8');
    return JSON.parse(hamVeri);
  } catch (hata) {
    console.error('Veri dosyası okuma hatası:', hata.message);
    return [];
  }
}

const sunucu = http.createServer((req, res) => {
  const istekZamani = new Date().toLocaleTimeString('tr-TR');
  console.log(`[${istekZamani}] ${req.method} ${req.url}`);

  // Yalnızca GET isteklerine izin verilir
  if (req.method !== 'GET') {
    res.writeHead(405, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Allow': 'GET'
    });
    res.end('405 Yönteme İzin Verilmedi: Yalnızca GET yöntemi desteklenmektedir.');
    return;
  }

  // URL'yi çözümle
  const baseURL = `http://${req.headers.host || 'localhost:3000'}`;
  const parsedUrl = new URL(req.url, baseURL);
  const pathname = parsedUrl.pathname;

  // --- API Uç Noktaları ---

  // 1. /api/etkinlikler/:id (Tekil etkinlik getirme)
  if (pathname.startsWith('/api/etkinlikler/')) {
    const idStr = pathname.slice('/api/etkinlikler/'.length);
    const id = parseInt(idStr, 10);

    if (isNaN(id)) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ hata: 'Geçersiz etkinlik kimliği' }));
      return;
    }

    const etkinlikler = etkinlikleriOku();
    const bulunanEtkinlik = etkinlikler.find(e => e.id === id);

    if (bulunanEtkinlik) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(bulunanEtkinlik));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ hata: 'Etkinlik bulunamadı' }));
    }
    return;
  }

  // 2. /api/etkinlikler veya /api/etkinlikler?tur=...
  if (pathname === '/api/etkinlikler') {
    let etkinlikler = etkinlikleriOku();
    const turFiltresi = parsedUrl.searchParams.get('tur');

    if (turFiltresi) {
      etkinlikler = etkinlikler.filter(e => e.tur.toLowerCase() === turFiltresi.toLowerCase());
    }

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(etkinlikler));
    return;
  }

  // --- Statik Dosya Sunumu (public/ dizini) ---
  let dosyaYolu = pathname === '/' ? '/index.html' : pathname;
  const tamHedefYol = path.normalize(path.join(PUBLIC_DIR, dosyaYolu));

  // Güvenlik: public/ dışına dizin atlama (path traversal) girişimlerini engelle
  if (!tamHedefYol.startsWith(PUBLIC_DIR)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Bulunamadı');
    return;
  }

  fs.stat(tamHedefYol, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Bulunamadı: İstenen sayfa veya dosya mevcut değil.');
      return;
    }

    const uzanti = path.extname(tamHedefYol).toLowerCase();
    const contentType = MIME_TURLERI[uzanti] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const dosyaAkisi = fs.createReadStream(tamHedefYol);
    dosyaAkisi.pipe(res);
  });
});

sunucu.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Kampüs Etkinlik Panosu Sunucusu Aktif!`);
  console.log(`Adres : http://localhost:${PORT}`);
  console.log(`Port  : ${PORT}`);
  console.log(`Dizin : ${PUBLIC_DIR}`);
  console.log(`====================================================`);
});
