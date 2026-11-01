// BMH231 Web Programlama - Ödev 2: Kampüs Etkinlik Panosu
// İstemci Tarafı Betiği (JavaScript - DOM & Asenkron API)
// Öğrenci: Nisa Pelin Temel - 16008125084

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element Referansları ---
  const etkinlikListesiEl = document.getElementById('etkinlik-listesi');
  const durumKapsayiciEl = document.getElementById('durum-kapsayici');
  const aramaGirdisiEl = document.getElementById('arama-girdisi');
  const filtreButonlari = document.querySelectorAll('.filtre-butonu');
  const oneriFormuEl = document.getElementById('etkinlik-oneri-formu');
  const formBildirimEl = document.getElementById('form-bildirim');

  // --- Uygulama Durumu (State) ---
  let tumEtkinlikler = [];
  let seciliTur = 'tumu';
  let aramaMetni = '';

  // ==========================================================================
  // C1. Kartları Veriden Üretmek (DOM API: createElement, textContent, append)
  // Kesinlikle innerHTML kullanılmamıştır!
  // ==========================================================================
  function kartOlustur(etkinlik) {
    // 1. Ana kart kapsayıcısı
    const kart = document.createElement('article');
    kart.classList.add('etkinlik-karti');
    kart.setAttribute('data-id', etkinlik.id);

    // 2. Kart üst kısmı (Başlık ve Tür Etiketi)
    const kartUst = document.createElement('div');
    kartUst.classList.add('kart-ust');

    const baslik = document.createElement('h3');
    baslik.classList.add('etkinlik-baslik');
    baslik.textContent = etkinlik.baslik;

    const turEtiketi = document.createElement('span');
    turEtiketi.classList.add('tur-etiketi', etkinlik.tur);
    // Tür adını büyük harfle gösterme
    const turAdlari = {
      atolye: 'Atölye',
      soylesi: 'Söyleşi',
      topluluk: 'Topluluk'
    };
    turEtiketi.textContent = turAdlari[etkinlik.tur] || etkinlik.tur;

    kartUst.append(baslik, turEtiketi);

    // 3. Kart detayları (Tarih, Yer, Kontenjan)
    const detaylar = document.createElement('div');
    detaylar.classList.add('kart-detaylar');

    // Tarih formatlama (Türkçe biçim: toLocaleDateString)
    const tarihSatir = document.createElement('div');
    tarihSatir.classList.add('detay-satir');
    const tarihIkon = document.createElement('span');
    tarihIkon.classList.add('detay-ikon');
    tarihIkon.textContent = '📅';
    const tarihDeger = document.createElement('span');
    tarihDeger.classList.add('detay-deger');
    
    // YYYY-AA-GG formatını Date nesnesine güvenle dönüştürme
    const [yil, ay, gun] = etkinlik.tarih.split('-').map(Number);
    const tarihObj = new Date(yil, ay - 1, gun);
    tarihDeger.textContent = tarihObj.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    tarihSatir.append(tarihIkon, tarihDeger);

    // Yer bilgisi
    const yerSatir = document.createElement('div');
    yerSatir.classList.add('detay-satir');
    const yerIkon = document.createElement('span');
    yerIkon.classList.add('detay-ikon');
    yerIkon.textContent = '📍';
    const yerDeger = document.createElement('span');
    yerDeger.classList.add('detay-deger');
    yerDeger.textContent = etkinlik.yer;
    yerSatir.append(yerIkon, yerDeger);

    // Kontenjan bilgisi
    const kontenjanSatir = document.createElement('div');
    kontenjanSatir.classList.add('detay-satir');
    const kontenjanIkon = document.createElement('span');
    kontenjanIkon.classList.add('detay-ikon');
    kontenjanIkon.textContent = '👥';
    const kontenjanDeger = document.createElement('span');
    kontenjanDeger.classList.add('detay-deger');
    kontenjanDeger.textContent = `Kontenjan: ${etkinlik.kontenjan} kişi`;
    kontenjanSatir.append(kontenjanIkon, kontenjanDeger);

    detaylar.append(tarihSatir, yerSatir, kontenjanSatir);

    // 4. Kartı birleştir
    kart.append(kartUst, detaylar);
    return kart;
  }

  // ==========================================================================
  // C2. Filtre ve Arama Fonksiyonu (Birlikte Çalışma Mantığı)
  // ==========================================================================
  function etkinlikleriFiltreleVeCiz() {
    // Önceki kartları ve durum iletilerini temizle
    etkinlikListesiEl.replaceChildren();
    durumKapsayiciEl.replaceChildren();

    // 1. Tür filtresini uygula
    let filtrelenmis = tumEtkinlikler;
    if (seciliTur !== 'tumu') {
      filtrelenmis = filtrelenmis.filter(e => e.tur.toLowerCase() === seciliTur.toLowerCase());
    }

    // 2. Arama filtresini uygula (Türkçe harf duyarsız: toLocaleLowerCase('tr-TR'))
    if (aramaMetni.trim() !== '') {
      const aranan = aramaMetni.trim().toLocaleLowerCase('tr-TR');
      filtrelenmis = filtrelenmis.filter(e =>
        e.baslik.toLocaleLowerCase('tr-TR').includes(aranan)
      );
    }

    // 3. Sonuç yoksa "Aramanıza uygun etkinlik yok." iletisi göster
    if (filtrelenmis.length === 0) {
      const bosMesaj = document.createElement('div');
      bosMesaj.classList.add('durum-mesaji', 'bos');
      bosMesaj.textContent = 'Aramanıza uygun etkinlik yok.';
      durumKapsayiciEl.append(bosMesaj);
      return;
    }

    // 4. Kartları galeriye ekle
    filtrelenmis.forEach(etkinlik => {
      const kart = kartOlustur(etkinlik);
      etkinlikListesiEl.append(kart);
    });
  }

  // --- Olay Dinleyicileri: Filtre Butonları (click) ---
  filtreButonlari.forEach(buton => {
    buton.addEventListener('click', () => {
      filtreButonlari.forEach(b => b.classList.remove('secili'));
      buton.classList.add('secili');
      seciliTur = buton.getAttribute('data-tur');
      etkinlikleriFiltreleVeCiz();
    });
  });

  // --- Olay Dinleyicileri: Arama Kutusu (input olayı) ---
  aramaGirdisiEl.addEventListener('input', (e) => {
    aramaMetni = e.target.value;
    etkinlikleriFiltreleVeCiz();
  });

  // ==========================================================================
  // C3. Form Doğrulama (preventDefault, ad >= 5, geçerli gelecek tarih, e-posta)
  // ==========================================================================
  oneriFormuEl.addEventListener('submit', (e) => {
    e.preventDefault();

    // Form alanları
    const baslikInput = document.getElementById('form-etkinlik-adi');
    const tarihInput = document.getElementById('form-etkinlik-tarihi');
    const epostaInput = document.getElementById('form-eposta');

    const baslikDeger = baslikInput.value.trim();
    const tarihDeger = tarihInput.value.trim();
    const epostaDeger = epostaInput.value.trim();

    formBildirimEl.replaceChildren();

    // 1. Kural: Etkinlik adı en az 5 karakter olmalı
    if (baslikDeger.length < 5) {
      formHataGoster('Etkinlik adı en az 5 karakter olmalıdır.');
      baslikInput.focus();
      return;
    }

    // 2. Kural: Tarih boş ya da geçmiş bir gün olamaz
    if (!tarihDeger) {
      formHataGoster('Lütfen geçerli bir etkinlik tarihi seçiniz.');
      tarihInput.focus();
      return;
    }

    const secilenTarih = new Date(tarihDeger);
    const bugun = new Date();
    // Saat/dakika farkını sıfırla
    bugun.setHours(0, 0, 0, 0);

    if (secilenTarih < bugun) {
      formHataGoster('Etkinlik tarihi geçmiş bir gün olamaz.');
      tarihInput.focus();
      return;
    }

    // 3. Kural: E-posta geçerli biçimde olmalıdır
    const epostaRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!epostaRegex.test(epostaDeger)) {
      formHataGoster('Lütfen geçerli bir e-posta adresi giriniz (ör. ad.soyad@bozok.edu.tr).');
      epostaInput.focus();
      return;
    }

    // Başarılı durum
    formBasariGoster('Teşekkürler! Etkinlik öneriniz başarıyla iletildi.');
    oneriFormuEl.reset();
  });

  function formHataGoster(mesaj) {
    formBildirimEl.replaceChildren();
    const hataP = document.createElement('p');
    hataP.classList.add('hata-mesaji');
    hataP.textContent = `Hata: ${mesaj}`;
    formBildirimEl.append(hataP);
  }

  function formBasariGoster(mesaj) {
    formBildirimEl.replaceChildren();
    const basariP = document.createElement('p');
    basariP.classList.add('basari-mesaji');
    basariP.textContent = mesaj;
    formBildirimEl.append(basariP);
  }

  // ==========================================================================
  // D2. fetch ve async/await ile Veri Çekme
  // ==========================================================================
  async function etkinlikleriYukle() {
    // İstek sürerken "Yükleniyor..." iletisi göster
    durumKapsayiciEl.replaceChildren();
    const yukleniyorEl = document.createElement('div');
    yukleniyorEl.classList.add('durum-mesaji', 'yukleniyor');
    yukleniyorEl.textContent = 'Etkinlikler yükleniyor, lütfen bekleyiniz...';
    durumKapsayiciEl.append(yukleniyorEl);

    try {
      const yanit = await fetch('/api/etkinlikler');

      if (!yanit.ok) {
        throw new Error(`Sunucu hatası: ${yanit.status} ${yanit.statusText}`);
      }

      const veriler = await yanit.json();
      tumEtkinlikler = veriler;

      // Yükleniyor iletisini kaldır ve listeyi çiz
      durumKapsayiciEl.replaceChildren();
      etkinlikleriFiltreleVeCiz();
    } catch (hata) {
      durumKapsayiciEl.replaceChildren();
      const hataEl = document.createElement('div');
      hataEl.classList.add('durum-mesaji', 'hata');
      hataEl.textContent = `Etkinlikler yüklenirken bir sorun oluştu: ${hata.message}. Sunucunun çalıştığından emin olunuz.`;
      durumKapsayiciEl.append(hataEl);
      console.error('Veri çekme hatası:', hata);
    }
  }

  // Sayfa yüklendiğinde API'den etkinlikleri çek
  etkinlikleriYukle();
});
