# 🗺️ Proje Yol Haritası

> **Proje:** CVE-2024-0044 — Android `run-as` Ayrıcalık Yükseltme Zafiyeti Analizi, Simülasyonu ve Honeypot Tabanlı Tespit Sistemi Geliştirme  
> **Tür:** Sızma Testi Final Projesi  
> **Son Güncelleme:** 1 Haziran 2026

---

## 📌 Genel Bakış

Bu yol haritası, Android `run-as` komutundaki **CVE-2024-0044** ayrıcalık yükseltme zafiyetinin araştırılması, kontrollü bir ortamda simüle edilmesi ve bu saldırıyı gerçek zamanlı tespit edebilen bir **Honeypot + IDS (Saldırı Tespit Sistemi)** altyapısının geliştirilmesine yönelik tüm aşamaları kapsamaktadır.

Proje dört ana fazdan oluşmaktadır:

| Faz | Başlık | Dizin | Durum |
|:---:|--------|-------|:-----:|
| 1 | Araştırma ve Analiz | `research/` | 🔶 |
| 2 | Honeypot Hazırlığı | `honeypot/` | 🔶 |
| 3 | Tespit ve Simülasyon | `codebase/` | 🔲 |
| 4 | Test ve Doğrulama | — | 🔲 |

> **Durum Göstergeleri:** 🔲 Başlanmadı · 🔶 Devam Ediyor · ✅ Tamamlandı

---

## Faz 1: Araştırma ve Analiz (`research/`)

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

## Faz 2: Honeypot Hazırlığı (`honeypot/`)

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

## Faz 3: Tespit ve Simülasyon (`codebase/`)

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

## Faz 4: Test ve Doğrulama

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
