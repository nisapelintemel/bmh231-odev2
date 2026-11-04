/**
 * BMH231 Web Programlama - Ödev 2: Kampüs Etkinlik Panosu
 * public/betik.js
 */

// Uygulama Durumu (State)
let tumEtkinlikler = [];
let seciliTur = 'tumu';
let aramaMetni = '';

// DOM Elementleri
const kartListesi = document.getElementById('kart-listesi');
const durumMesaji = document.getElementById('durum-mesaji');
const filtreButonlari = document.querySelectorAll('.filtre-btn');
const aramaGirdisi = document.getElementById('arama-girdisi');
const etkinlikFormu = document.getElementById('etkinlik-formu');
const formBildirim = document.getElementById('form-bildirim');

/**
 * D2: API'den Etkinlikleri Getiren Asenkron Fonksiyon
 * (Bölüm E2 (a) maddesinde satır satır açıklanacak fonksiyon)
 */
async function etkinlikleriGetir() {
  durumMesaji.className = 'durum-mesaji';
  durumMesaji.textContent = 'Etkinlikler yükleniyor, lütfen bekleyiniz...';
  durumMesaji.style.display = 'block';
  kartListesi.replaceChildren();

  try {
    const yanit = await fetch('/api/etkinlikler');

    if (!yanit.ok) {
      throw new Error(`Sunucu hatası: HTTP ${yanit.status}`);
    }

    const veriler = await yanit.json();
    tumEtkinlikler = veriler;
    durumMesaji.style.display = 'none';

    // Verileri ekrana çiz
    kartlariFiltreleVeCiz();
  } catch (hata) {
    console.error('Etkinlikler yüklenirken hata meydana geldi:', hata);
    durumMesaji.className = 'durum-mesaji hata';
    durumMesaji.textContent = 'Etkinlikler yüklenirken bir sorun oluştu. Sunucunun çalıştığından emin olunuz.';
    durumMesaji.style.display = 'block';
  }
}

/**
 * C1: Güvenli DOM Üretimi (document.createElement, textContent ve append)
 * Veriye dayalı içerik için kesinlikle innerHTML kullanılmamıştır.
 */
function kartOlustur(etkinlik) {
  // Ana kart kapsayıcısı
  const kart = document.createElement('article');
  kart.className = 'etkinlik-karti';

  // Kart üst başlık ve rozet alanı
  const kartUst = document.createElement('div');
  kartUst.className = 'kart-ust';

  const baslik = document.createElement('h2');
  baslik.className = 'kart-baslik';
  baslik.textContent = etkinlik.baslik;

  const turRozeti = document.createElement('span');
  turRozeti.className = `tur-etiketi tur-${etkinlik.tur.toLowerCase()}`;
  turRozeti.textContent = etkinlik.tur.toUpperCase();

  kartUst.append(baslik, turRozeti);

  // Kart detay listesi
  const bilgiListesi = document.createElement('ul');
  bilgiListesi.className = 'kart-bilgileri';

  // Tarih bilgisi (Türkçe yerel biçimlendirme)
  const tarihLi = document.createElement('li');
  tarihLi.className = 'bilgi-satiri';
  const tarihMetni = new Date(etkinlik.tarih).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  tarihLi.textContent = `📅 Tarih: ${tarihMetni}`;

  // Yer bilgisi
  const yerLi = document.createElement('li');
  yerLi.className = 'bilgi-satiri';
  yerLi.textContent = `📍 Yer: ${etkinlik.yer}`;

  // Kontenjan bilgisi
  const kontenjanLi = document.createElement('li');
  kontenjanLi.className = 'bilgi-satiri';
  kontenjanLi.textContent = `👥 Kontenjan: ${etkinlik.kontenjan} Kişi`;

  bilgiListesi.append(tarihLi, yerLi, kontenjanLi);

  // Kartı birleştir
  kart.append(kartUst, bilgiListesi);
  return kart;
}

/**
 * C2: Filtre ve Canlı Aramayı Birlikte Uygulayan Fonksiyon
 * (Bölüm E2 (b) maddesinde satır satır açıklanacak fonksiyon)
 */
function kartlariFiltreleVeCiz() {
  kartListesi.replaceChildren();

  const filtrelenmis = tumEtkinlikler.filter(etkinlik => {
    const turUygun = seciliTur === 'tumu' || etkinlik.tur.toLowerCase() === seciliTur.toLowerCase();
    const aramaUygun = etkinlik.baslik.toLocaleLowerCase('tr-TR').includes(aramaMetni);
    return turUygun && aramaUygun;
  });

  if (filtrelenmis.length === 0) {
    durumMesaji.className = 'durum-mesaji';
    durumMesaji.textContent = 'Aramanıza uygun etkinlik bulunamadı.';
    durumMesaji.style.display = 'block';
  } else {
    durumMesaji.style.display = 'none';
    const parcaKapsayici = document.createDocumentFragment();
    filtrelenmis.forEach(etkinlik => {
      parcaKapsayici.append(kartOlustur(etkinlik));
    });
    kartListesi.append(parcaKapsayici);
  }
}

/**
 * C2: Tür Filtresi Buton Olayları (click)
 */
filtreButonlari.forEach(buton => {
  buton.addEventListener('click', () => {
    filtreButonlari.forEach(b => b.classList.remove('secili'));
    buton.classList.add('secili');
    seciliTur = buton.getAttribute('data-tur');
    kartlariFiltreleVeCiz();
  });
});

/**
 * C2: Canlı Arama Girdisi Olayı (input)
 */
aramaGirdisi.addEventListener('input', (e) => {
  aramaMetni = e.target.value.trim().toLocaleLowerCase('tr-TR');
  kartlariFiltreleVeCiz();
});

/**
 * C3: Etkinlik Öner Formu Doğrulama ve Gönderme
 */
etkinlikFormu.addEventListener('submit', (e) => {
  e.preventDefault();

  const baslikGirdisi = document.getElementById('etkinlik-adi');
  const tarihGirdisi = document.getElementById('etkinlik-tarihi');
  const epostaGirdisi = document.getElementById('iletisim-eposta');

  const baslikDegeri = baslikGirdisi.value.trim();
  const tarihDegeri = tarihGirdisi.value;
  const epostaDegeri = epostaGirdisi.value.trim();

  // 1. Kural: Etkinlik adı en az 5 karakter olmalıdır
  if (baslikDegeri.length < 5) {
    formBildirimiGoster('Etkinlik adı en az 5 karakter uzunluğunda olmalıdır.', 'hata');
    baslikGirdisi.focus();
    return;
  }

  // 2. Kural: Tarih boş veya geçmiş bir gün olamaz
  if (!tarihDegeri) {
    formBildirimiGoster('Lütfen geçerli bir etkinlik tarihi seçiniz.', 'hata');
    tarihGirdisi.focus();
    return;
  }

  const secilenTarih = new Date(tarihDegeri);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0); // Saat farkını sıfırla

  if (secilenTarih < bugun) {
    formBildirimiGoster('Etkinlik tarihi geçmiş bir gün olamaz.', 'hata');
    tarihGirdisi.focus();
    return;
  }

  // 3. Kural: Geçerli bir e-posta adresi olmalıdır
  const epostaDeseni = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!epostaDeseni.test(epostaDegeri)) {
    formBildirimiGoster('Lütfen geçerli bir e-posta adresi giriniz (Örn: ad.soyad@bozok.edu.tr).', 'hata');
    epostaGirdisi.focus();
    return;
  }

  // Tüm kurallar geçerli ise başarı iletisi
  formBildirimiGoster('Teşekkürler! Etkinlik öneriniz başarıyla alındı ve incelemeye iletildi.', 'basari');
  etkinlikFormu.reset();
});

/**
 * C3: Form Geri Bildirim İletisini Gösterme Yardımcısı
 */
function formBildirimiGoster(mesaj, tur) {
  formBildirim.textContent = mesaj;
  formBildirim.className = 'form-bildirim';

  if (tur === 'hata') {
    formBildirim.classList.add('hata-mesaji');
  } else if (tur === 'basari') {
    formBildirim.classList.add('basari-mesaji');
  }

  formBildirim.style.display = 'block';
}

// Sayfa yüklendiğinde etkinlikleri getir
document.addEventListener('DOMContentLoaded', etkinlikleriGetir);
