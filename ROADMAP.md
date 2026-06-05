# 🗺️ Proje Yol Haritası

> **Proje:** CVE-2024-0044 — Android `run-as` Ayrıcalık Yükseltme Zafiyeti Analizi, Simülasyonu ve Honeypot Tabanlı Tespit Sistemi Geliştirme  
> **Tür:** Sızma Testi Final Projesi  
> **Son Güncelleme:** 1 Haziran 2026

---

## 📌 Genel Bakış

Bu yol haritası, Android `run-as` komutundaki **CVE-2024-0044** ayrıcalık yükseltme zafiyetinin araştırılması, kontrollü bir ortamda simüle edilmesi ve bu saldırıyı gerçek zamanlı tespit edebilen bir **Honeypot + IDS (Saldırı Tespit Sistemi)** altyapısının geliştirilmesine yönelik tüm aşamaları kapsamaktadır.

Proje altı ana fazdan oluşmaktadır:

| Faz | Başlık | Dizin | Durum |
|:---:|--------|-------|:-----:|
| 0 | Yazmadan Önce Anla | — | ✅ |
| 1 | Araştırma ve Keşif | `research/` | 🔶 |
| 2 | Ortam Kurulumu | `honeypot/` | 🔶 |
| 3 | Uygulama | `codebase/` | 🔲 |
| 4 | Test ve Raporlama | `docs/` | 🔲 |
| 5 | Teslim Kontrol Listesi | — | 🔲 |

> **Durum Göstergeleri:** 🔲 Başlanmadı · 🔶 Devam Ediyor · ✅ Tamamlandı

---

## Faz 0: Yazmadan Önce Anla

> **Amaç:** Projeye başlamadan önce zafiyetin bağlamını, saldırı yüzeyini ve projenin akademik çerçevesini kavramak.

### 0.1 — Ön Araştırma ve Bağlam Oluşturma
- [x] CVE-2024-0044 zafiyetinin ne olduğunu ve neden önemli olduğunu anlama.
- [x] Android `run-as` komutunun normal çalışma amacını ve mimarideki yerini kavrama.
- [x] Zafiyetin etkilediği Android sürümlerini ve cihaz kapsamını belirleme.
- [x] Sızma testi metodolojisinin (keşif → analiz → sömürü → raporlama) proje akışına nasıl uygulanacağını planlama.

### 0.2 — Proje Kapsamının Belirlenmesi
- [x] Final projesi gereksinimlerinin (3 CVE analizi, lab ortamı, raporlama) listelenmesi.
- [x] Projenin sınırlarının çizilmesi: neler yapılacak, neler kapsam dışı.
- [x] Teslim formatı ve beklentilerin netleştirilmesi.

### 📦 Faz 0 Çıktıları
| Çıktı | Dosya | Durum |
|-------|-------|:-----:|
| Proje yol haritası | `ROADMAP.md` | ✅ |
| Proje ana belgesi | `README.md` | ✅ |

---

## Faz 1: Araştırma ve Keşif (`research/`)

> **Amaç:** Zafiyetin teknik altyapısını kavramak, saldırı yüzeyini belirlemek ve tüm bulguları yapılandırılmış bir şekilde dokümante etmek.

### 1.1 — Zafiyet İstihbaratı
- [x] **NVD (National Vulnerability Database)** üzerinden CVE-2024-0044 kaydının incelenmesi.
- [x] CVSS skoru, etki alanı ve saldırı vektörünün not edilmesi.
- [x] Google Android Güvenlik Bülteni'nde yayınlanan resmi yamanın (patch) incelenmesi.
- [x] İlgili CWE (Common Weakness Enumeration) kategorisinin belirlenmesi.

### 1.2 — Kaynak Kod Analizi (AOSP)
- [x] AOSP (Android Open Source Project) deposundan **Package Manager / Installer** bileşeninin ilgili sürümünün bulunması.
- [x] `run-as` komutundaki girdi doğrulama hatasına yol açan kod bloğunun tespiti.
- [ ] `packages.list` dosyasına yazım yapan `installd` servisindeki sanitizasyon eksikliğinin analizi.
- [ ] Yamalı (patched) ve yamasız (unpatched) sürümler arasındaki farkların (`diff`) çıkarılması.

### 1.3 — PoC (Proof of Concept) Kavramsal Analiz
- [x] Zafiyetin tetiklenme mekanizmasının mantıksal olarak kavranması.
- [x] Saldırı senaryosunun akış diyagramı olarak çizilmesi.
- [ ] Tetikleme için gerekli koşulların (Android sürümü, ADB erişimi, vb.) listelenmesi.
- [x] Tüm araştırma bulgularının `research/` dizini altında Markdown formatında dokümante edilmesi.

### 📦 Faz 1 Çıktıları
| Çıktı | Dosya | Durum |
|-------|-------|:-----:|
| Zafiyet analiz raporu | `research/01_zafiyet_analizi.md` | ✅ |
| Teknik mekanizma analizi | `research/02_teknik_mekanizma.md` | ✅ |
| PoC mantık akışı | `research/03_poc_analizi.md` | 🔲 |

---

## Faz 2: Ortam Kurulumu (`honeypot/`)

> **Amaç:** Zafiyetli bir Android ortamını kontrollü biçimde ayağa kaldırmak ve saldırı tespiti için gerekli izleme altyapısını kurmak.

### 2.1 — Emülatör Ortamının Kurulumu
- [x] Zafiyetli Android sürümünü barındıran bir **AVD (Android Virtual Device)** profili oluşturma rehberinin yazılması.
- [x] Android SDK ve gerekli sistem imajlarının (`system image`) seçim kriterlerinin belirlenmesi.
- [x] ADB bağlantı yapılandırmasının dokümante edilmesi.
- [ ] Emülatör üzerinde root erişiminin sağlanması (gerekli ise).

### 2.2 — Loglama ve İzleme Yapılandırması
- [ ] `logcat` filtrelerinin `run-as` ve Package Manager bileşenine özel olarak ayarlanması.
- [ ] `packages.list` dosya bütünlük kontrolü mekanizmasının tasarlanması.
- [ ] Anormal `run-as` çağrılarını yakalayacak anahtar kelimelerin belirlenmesi.
- [ ] Log çıktılarının dosyaya yönlendirilmesi için `logcat` komut yapısının hazırlanması.

### 2.3 — Kurulum Dokümantasyonu
- [x] Ortamın sıfırdan kurulumu için adım adım rehberin yazılması.
- [ ] Ortam gereksinimlerinin (RAM, disk, SDK sürümü) listelenmesi.
- [ ] Bilinen sorunlar ve çözümleri (`troubleshooting`) bölümünün eklenmesi.

### 📦 Faz 2 Çıktıları
| Çıktı | Dosya | Durum |
|-------|-------|:-----:|
| Ortam kurulum rehberi | `honeypot/ortam_kurulumu.md` | ✅ |
| Logcat yapılandırma scripti | `honeypot/logcat-config.sh` | 🔲 |
| Emülatör başlatma scripti | `honeypot/start-emulator.sh` | 🔲 |

---

## Faz 3: Uygulama (`codebase/`)

> **Amaç:** Saldırı simülasyonu, gerçek zamanlı tespit motoru ve canlı izleme panelini geliştirmek.

### 3.1 — Saldırı Simülasyon Modülü (`modules/attack.py`)
- [ ] Saldırı scriptinin iskelet yapısının oluşturulması.
- [ ] Satır enjeksiyonu içeren zararlı paket adı oluşturma mantığının kodlanması.
- [ ] Hedef emülatöre ADB üzerinden zararlı paketin yüklenmesi.
- [ ] Saldırı parametrelerinin (hedef paket adı, hedef UID) komut satırından alınabilir hale getirilmesi.
- [ ] Saldırı loglarının zaman damgalı olarak kaydedilmesi.

### 3.2 — Tespit Motoru (`detector.py`)
- [ ] Arka planda sürekli çalışacak servis mimarisinin tasarlanması.
- [ ] `packages.list` dosyasını periyodik olarak parse eden modülün yazılması.
- [ ] Satır enjeksiyonu imzalarını (beklenmedik satır sayısı, format anomalileri) tanıyacak kural motorunun geliştirilmesi.
- [ ] Anormal `run-as` çağrılarının `logcat` üzerinden tespiti.
- [ ] Tespit edilen olayların zaman damgası, şiddet seviyesi ve detay bilgisiyle birlikte loglanması.
- [ ] Web panele bildirim göndermek için API endpoint'ine veri iletimi.

### 3.3 — Web İzleme Paneli (`app.py` — Flask)
- [ ] Flask uygulamasının temel yapısının kurulması.
- [ ] Canlı alarm gösterimi: Tespit edilen saldırıların **kırmızı alarm** olarak panelde gösterilmesi.
- [ ] Olay geçmişi tablosu: Tüm geçmiş tespitlerin tarih/saat sıralı listelenmesi.
- [ ] Sistem durumu göstergesi: Honeypot ve detector servislerinin çalışma durumunun görüntülenmesi.
- [ ] Basit bir dashboard arayüzünün HTML/CSS ile tasarlanması.

### 📦 Faz 3 Çıktıları
| Çıktı | Dosya |
|-------|-------|
| Saldırı simülasyon scripti | `codebase/modules/attack.py` |
| Tespit motoru servisi | `codebase/detector.py` |
| Web izleme paneli | `codebase/app.py` |
| HTML şablonları | `codebase/templates/` |

---

## Faz 4: Test ve Raporlama

> **Amaç:** Tüm bileşenlerin uçtan uca çalıştığını doğrulamak ve proje teslim kalitesini sağlamak.

### 4.1 — Uçtan Uca (End-to-End) Test
- [ ] Honeypot ortamının (emülatör) başarıyla başlatıldığının doğrulanması.
- [ ] `detector.py` servisinin arka planda çalışır duruma getirilmesi.
- [ ] Web panelin (`app.py`) tarayıcıdan erişilebilir olduğunun teyit edilmesi.
- [ ] `attack.py` ile simüle edilmiş saldırının hedefe uygulanması.

### 4.2 — Tespit Doğrulaması
- [ ] `detector.py`'nin `packages.list` anomalisini yakalayıp yakalamadığının kontrol edilmesi.
- [ ] Tespit edilen olayın Web Panelde **kırmızı alarm** olarak görünüp görünmediğinin doğrulanması.
- [ ] Alarm detaylarının (zaman damgası, olay türü, şiddet seviyesi) doğruluğunun teyit edilmesi.
- [ ] Yanlış pozitif (false positive) oranının değerlendirilmesi.

### 4.3 — Dokümantasyon ve Teslim
- [ ] Tüm kod dosyalarına açıklayıcı yorumların eklenmesi.
- [ ] `README.md` dosyasının güncellenerek proje kurulum ve kullanım rehberinin tamamlanması.
- [ ] Ekran görüntüleri ve test sonuçlarının `docs/` dizinine eklenmesi.
- [ ] Final raporunun hazırlanması.

### 📦 Faz 4 Çıktıları
| Çıktı | Dosya |
|-------|-------|
| Test sonuç raporu | `docs/test-raporu.md` |
| Ekran görüntüleri | `docs/screenshots/` |
| Final raporu | `docs/final-rapor.md` |

---

## Faz 5: Teslim Kontrol Listesi

> **Amaç:** Projenin teslim öncesi son kontrollerini yapmak ve eksiksiz bir şekilde sunuma hazır hale getirmek.

### 5.1 — Kod ve Dosya Kontrolü
- [ ] Tüm kaynak dosyaların açıklayıcı yorum satırları içerdiğinin doğrulanması.
- [ ] `.gitignore` dosyasının güncel ve eksiksiz olduğunun teyidi.
- [ ] Gereksiz dosyaların (log, cache, geçici dosyalar) repodan temizlenmesi.
- [ ] `requirements.txt` veya bağımlılık dosyalarının güncelliğinin kontrol edilmesi.

### 5.2 — Dokümantasyon Kontrolü
- [ ] `README.md` dosyasının güncel öğrenci bilgileri, proje özeti ve kurulum rehberini içerdiğinin doğrulanması.
- [ ] `ROADMAP.md` faz yapısının eksiksiz olduğunun teyidi.
- [ ] Tüm araştırma belgelerinin (`research/`) tamamlanmış olduğunun kontrol edilmesi.
- [ ] Ekran görüntülerinin ve test kanıtlarının `docs/` dizininde mevcut olduğunun doğrulanması.

### 5.3 — Final Teslim
- [ ] GitHub reposunun son commit'inin temiz ve açıklayıcı mesajla yapılması.
- [ ] Projenin klonlanarak sıfırdan çalıştırılabilirliğinin test edilmesi.
- [ ] Final raporunun PDF veya Markdown formatında hazır olduğunun teyidi.

### 📦 Faz 5 Çıktıları
| Çıktı | Dosya | Durum |
|-------|-------|:-----:|
| Teslim kontrol listesi | `ROADMAP.md` (bu bölüm) | 🔲 |
| Temiz GitHub reposu | — | 🔲 |

---

## 📂 Proje Dizin Yapısı (Hedeflenen)

```
Android-rce-analizi/
├── README.md
├── ROADMAP.md
├── research/
│   ├── 01_zafiyet_analizi.md      ✅
│   ├── 02_teknik_mekanizma.md     ✅
│   └── 03_poc_analizi.md
├── honeypot/
│   ├── ortam_kurulumu.md          ✅
│   ├── logcat-config.sh
│   └── start-emulator.sh
├── codebase/
│   ├── app.py
│   ├── detector.py
│   ├── modules/
│   │   └── attack.py
│   ├── templates/
│   │   └── dashboard.html
│   └── requirements.txt
├── docs/
│   ├── test-raporu.md
│   ├── final-rapor.md
│   └── screenshots/
└── archive/
    └── cve-2026-0891-deprecated/
```

---

## ⚠️ Yasal Uyarı

Bu proje **yalnızca akademik ve eğitim amaçlıdır**. Tüm testler kontrollü laboratuvar ortamında, izole edilmiş sanal makineler üzerinde gerçekleştirilmektedir. Gerçek cihazlara veya üçüncü taraf sistemlere yönelik herhangi bir saldırı girişimi **yasa dışıdır** ve bu projenin kapsamı dışındadır.

---

> 📝 *Bu yol haritası, proje ilerledikçe güncellenecektir.*
