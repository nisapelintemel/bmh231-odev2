const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'etkinlikler.json');

// Desteklenen MIME turleri
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// JSON veri dosyasini guvenli okuma yardimci fonksiyonu
function etkinlikleriOku() {
  try {
    const veri = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(veri);
  } catch (hata) {
    console.error('Veri dosyasi okunurken hata olustu:', hata.message);
    return [];
  }
}

// HTTP sunucusunun olusturulmasi
const sunucu = http.createServer((req, res) => {
  // Her istegin yontemini ve yolunu konsola yazdirma (D1 kurali)
  console.log(`[${new Date().toLocaleTimeString('tr-TR')}] ${req.method} ${req.url}`);

  // Sadece GET isteklerine izin verilir; digerlerine 405 ve Allow basligi donulur
  if (req.method !== 'GET') {
    res.writeHead(405, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Allow': 'GET'
    });
    res.end('405 Method Not Allowed - Yalnizca GET istekleri desteklenmektedir.');
    return;
  }

  // URL ayristirma (sorgu parametrelerini guvenle almak icin standart URL sinifi)
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;

  // --- API ROTalari ---
  if (pathname.startsWith('/api/etkinlikler')) {
    const tumEtkinlikler = etkinlikleriOku();

    // Rota: /api/etkinlikler/:id (Tekil etkinlik getirme)
    const idEslestir = pathname.match(/^\/api\/etkinlikler\/(\d+)$/);
    if (idEslestir) {
      const arananId = parseInt(idEslestir[1], 10);
      const bulunan = tumEtkinlikler.find(e => e.id === arananId);

      if (bulunan) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(bulunan));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ hata: 'Etkinlik bulunamadi' }));
      }
      return;
    }

    // Rota: /api/etkinlikler veya /api/etkinlikler?tur=...
    if (pathname === '/api/etkinlikler') {
      const turFiltresi = parsedUrl.searchParams.get('tur');
      let sonuc = tumEtkinlikler;

      if (turFiltresi) {
        sonuc = tumEtkinlikler.filter(e => e.tur.toLowerCase() === turFiltresi.toLowerCase());
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(sonuc));
      return;
    }

    // Tanimsiz bir /api/ rotasi ise
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ hata: 'Gecersiz API ucbirimi' }));
    return;
  }

  // --- STATIK DOSYA SUNUMU (public/ klasoru) ---
  // Guvenlik: Tarayicinin public klasoru disindaki dosyalara (ornegin sunucu.js) erisimini engelleme
  let guvenliDosyaYolu = pathname === '/' ? '/index.html' : pathname;
  // normalize ile dizin gecisi (directory traversal ../) saldirilarini onleme
  const tamHedefYol = path.join(PUBLIC_DIR, path.normalize(guvenliDosyaYolu));

  // Istenen dosyanin gercekten public klasoru icinde kalip kalmadiginin kontrolu
  if (!tamHedefYol.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden - Bu dizine erisim yetkiniz yok.');
    return;
  }

  fs.stat(tamHedefYol, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - Aradiginiz sayfa veya dosya bulunamadi.');
      return;
    }

    const uzanti = path.extname(tamHedefYol).toLowerCase();
    const contentType = MIME_TYPES[uzanti] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const dosyaAkisi = fs.createReadStream(tamHedefYol);
    dosyaAkisi.pipe(res);
  });
});

sunucu.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde calisiyor.`);
  console.log('Cikmak icin Ctrl+C tuslarina basiniz.');
});
