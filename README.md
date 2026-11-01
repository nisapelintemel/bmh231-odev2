# Kampüs Etkinlik Panosu (BMH231 Ödev 2)

Bu proje, **Yozgat Bozok Üniversitesi Bilgisayar Mühendisliği Bölümü BMH231 Web Programlama** dersi 2. ödevi kapsamında geliştirilmiştir. Projede kampüsteki atölye, söyleşi ve öğrenci topluluk etkinliklerini listeleyen semantik, duyarlı ve etkileşimli bir web panosu sunulmaktadır.

Ön yüzde saf HTML5, CSS3 (Flexbox & CSS Grid) ve JavaScript (DOM API & fetch) kullanılmış; arka yüzde ise herhangi bir harici kütüphane (Express vb.) kullanılmaksızın saf **Node.js** (`http`, `fs`, `path`, `url`) modülleriyle REST mimarisine uygun bir JSON API ve statik dosya sunucusu geliştirilmiştir.

---

## 🎯 Projenin Temel Özellikleri

- **Semantik HTML5 İskeleti**: `header`, `nav`, `main`, `section`, `article`, `footer` ve tam erişilebilir form yapısı (`label-for` eşleşmeleri).
- **Modern & Duyarlı CSS3 Yerleşimi**:
  - `:root` seviyesinde merkezi CSS değişkenleri (renkler, tipografi, gölgeler).
  - Üst gezinme bandı ve filtre butonlarında **Flexbox**.
  - Etkinlik kartları galerisinde `repeat(auto-fit, minmax(320px, 1fr))` ile dinamik **CSS Grid**.
  - Mobil cihazlar için 768px kırılma noktalı duyarlı tasarım (Media Query).
- **Dinamik DOM ve Güvenlik**:
  - XSS açıklarını önlemek amacıyla dinamik içerik üretiminde `innerHTML` yerine `document.createElement`, `textContent` ve `append` metotları kullanılmıştır.
  - Etkinlik tarihleri `toLocaleDateString("tr-TR")` ile Türkçe yerelleştirilmiştir.
- **Canlı Filtreleme ve Arama**:
  - Tür butonları (Tümü, Atölye, Söyleşi, Topluluk) ve arama kutusu eşzamanlı (birlikte) çalışır.
  - Türkçe karakter duyarlı (`toLocaleLowerCase('tr-TR')`) anlık arama desteği.
- **İstemci Tarafı Form Doğrulama**:
  - `preventDefault` ile sayfa yenilenmesi engellenir.
  - Etkinlik adı (en az 5 karakter), gelecek tarih denetimi ve regex ile e-posta geçerlilik kontrolü.
  - Hata ve başarı durumlarında dinamik geri bildirim mesajları.
- **Saf Node.js JSON API & Güvenli Sunucu**:
  - Port 3000 üzerinde çalışır, konsola anlık istek kaydı (log) düşer.
  - Dizin atlama (Path Traversal) engellenmiş statik dosya sunumu.
  - Yalnızca `GET` isteklerini kabul eder, diğer yöntemlerde `405 Method Not Allowed` ve `Allow: GET` başlığı döndürür.

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için sisteminizde [Node.js](https://nodejs.org/) (LTS sürümü) ve [Git](https://git-scm.com/) kurulu olmalıdır.

```bash
# 1. Depoyu klonlayınız
git clone https://github.com/nisapelintemel/bmh231-odev2.git

# 2. Proje dizinine geçiniz
cd bmh231-odev2

# 3. Sunucuyu başlatınız
npm start
```

Sunucu başarıyla başlatıldığında tarayıcınızdan aşağıdaki adrese gidebilirsiniz:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📡 REST API Uç Noktaları

| Yöntem | Uç Nokta (Path) | Açıklama | Başarılı Yanıt | Hata Yanıtı |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Ana web arayüzü (`index.html`) | `200 OK (text/html)` | `404 Not Found` |
| `GET` | `/api/etkinlikler` | Tüm etkinliklerin listesi | `200 OK (application/json)` | `500 Server Error` |
| `GET` | `/api/etkinlikler?tur=atolye` | Belirli türdeki etkinlikler (`atolye`, `soylesi`, `topluluk`) | `200 OK (application/json)` | `200 OK ([])` |
| `GET` | `/api/etkinlikler/:id` | ID numarası verilen tek bir etkinlik nesnesi | `200 OK (application/json)` | `404 Not Found ({"hata": "Etkinlik bulunamadı"})` |
| `DELETE` | `/api/etkinlikler/:id` | Desteklenmeyen yöntem testi | - | `405 Method Not Allowed (Allow: GET)` |

---

## 📂 Proje Dizin Yapısı

```text
bmh231-odev2/
|-- sunucu.js            # Node.js yerel HTTP sunucusu ve REST API yönlendiricisi
|-- etkinlikler.json     # Kampüs etkinlikleri veri tabanı (JSON formatında)
|-- package.json         # Proje ayarları ve npm start betiği
|-- .gitignore           # node_modules/ ve .env yoksayma kuralları
|-- README.md            # Proje dokümantasyonu
`-- public/              # İstemciye sunulan statik dosyalar
    |-- index.html       # Semantik HTML5 arayüz iskeleti
    |-- stil.css         # CSS3 Flexbox, Grid ve duyarlı tasarım kuralları
    `-- betik.js         # DOM yönetimi, asenkron fetch ve arama/filtreleme mantığı
```

---

## 👤 Geliştirici Bilgileri

- **Adı Soyadı**: Nisa Pelin Temel
- **Öğrenci No**: 16008125084
- **Üniversite**: Yozgat Bozok Üniversitesi
- **Bölüm**: Mühendislik-Mimarlık Fakültesi, Bilgisayar Mühendisliği Bölümü
- **Ders**: BMH231 Web Programlama (2026–2027 Güz)
- **Öğretim Üyesi**: Dr. Öğr. Üyesi Çağrı ARISOY
