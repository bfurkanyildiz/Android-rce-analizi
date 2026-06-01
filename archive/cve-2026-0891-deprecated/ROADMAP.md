# 🗺️ Proje Yol Haritası

> **Proje:** CVE-2026-0891 — Android Media Framework (MediaExtractor) Heap Corruption Simülasyonu ile Saldırı Tespit Sistemi ve Honeypot Geliştirme  
> **Tür:** Sızma Testi Final Projesi  
> **Son Güncelleme:** 31 Mayıs 2026

---

## 📌 Genel Bakış

Bu yol haritası, Android Media Framework bünyesindeki **CVE-2026-0891** zafiyetinin araştırılması, kontrollü bir ortamda simüle edilmesi ve bu saldırıyı gerçek zamanlı tespit edebilen bir **Honeypot + IDS (Saldırı Tespit Sistemi)** altyapısının geliştirilmesine yönelik tüm aşamaları kapsamaktadır.

Proje dört ana fazdan oluşmaktadır:

| Faz | Başlık | Dizin | Durum |
|:---:|--------|-------|:-----:|
| 1 | Araştırma ve Analiz | `research/` | 🔲 |
| 2 | Honeypot Hazırlığı | `honeypot/` | 🔲 |
| 3 | Tespit ve Simülasyon | `codebase/` | 🔲 |
| 4 | Test ve Doğrulama | — | 🔲 |

> **Durum Göstergeleri:** 🔲 Başlanmadı · 🔶 Devam Ediyor · ✅ Tamamlandı

---

## Faz 1: Araştırma ve Analiz (`research/`)

> **Amaç:** Zafiyetin teknik altyapısını kavramak, saldırı yüzeyini belirlemek ve tüm bulguları yapılandırılmış bir şekilde dokümante etmek.

### 1.1 — Zafiyet İstihbaratı
- [ ] **NVD (National Vulnerability Database)** üzerinden CVE-2026-0891 kaydının incelenmesi.
- [ ] CVSS skoru, etki alanı ve saldırı vektörünün not edilmesi.
- [ ] Google Android Güvenlik Bülteni'nde yayınlanan resmi yamanın (patch) incelenmesi.
- [ ] İlgili CWE (Common Weakness Enumeration) kategorisinin belirlenmesi.

### 1.2 — Kaynak Kod Analizi (AOSP)
- [ ] AOSP (Android Open Source Project) deposundan **Media Framework** bileşeninin ilgili sürümünün bulunması.
- [ ] `MediaExtractor` sınıfındaki heap corruption'a yol açan kod bloğunun tespiti.
- [ ] `libstagefright` kütüphanesindeki bellek yönetim hatalarının analizi.
- [ ] Yamalı (patched) ve yamasız (unpatched) sürümler arasındaki farkların (`diff`) çıkarılması.

### 1.3 — PoC (Proof of Concept) Kavramsal Analiz
- [ ] Zafiyetin tetiklenme mekanizmasının mantıksal olarak kavranması.
- [ ] Saldırı senaryosunun akış diyagramı olarak çizilmesi.
- [ ] Tetikleme için gerekli koşulların (Android sürümü, medya formatı, vb.) listelenmesi.
- [ ] Tüm araştırma bulgularının `research/` dizini altında Markdown formatında dokümante edilmesi.

### 📦 Faz 1 Çıktıları
| Çıktı | Dosya |
|-------|-------|
| Zafiyet analiz raporu | `research/cve-analiz.md` |
| AOSP kaynak kod notları | `research/aosp-notlar.md` |
| PoC mantık akışı | `research/poc-analiz.md` |

---

## Faz 2: Honeypot Hazırlığı (`honeypot/`)

> **Amaç:** Zafiyetli bir Android ortamını kontrollü biçimde ayağa kaldırmak ve saldırı tespiti için gerekli izleme altyapısını kurmak.

### 2.1 — Emulator Ortamının Kurulumu
- [ ] Zafiyetli Android sürümünü barındıran bir **AVD (Android Virtual Device)** profili oluşturulması.
- [ ] Android SDK ve gerekli sistem imajlarının (`system image`) indirilmesi.
- [ ] Emulator'ün ağ yapılandırmasının (port yönlendirme, ADB bağlantısı) tamamlanması.
- [ ] Emulator üzerinde root erişiminin sağlanması (gerekli ise).

### 2.2 — Loglama ve İzleme Yapılandırması
- [ ] `logcat` filtrelerinin Media Framework bileşenine özel olarak ayarlanması.
- [ ] Heap corruption belirtilerini yakalayacak anahtar kelimelerin (`SIGABRT`, `heap-buffer-overflow`, `AddressSanitizer`, vb.) belirlenmesi.
- [ ] Log çıktılarının dosyaya yönlendirilmesi için `logcat` komut yapısının hazırlanması.
- [ ] Ağ trafiği izleme gereklilikleri varsa `tcpdump` veya benzeri araç yapılandırması.

### 2.3 — Kurulum Dokümantasyonu
- [ ] Ortamın sıfırdan kurulumu için adım adım rehberin yazılması.
- [ ] Ortam gereksinimlerinin (RAM, disk, SDK sürümü) listelenmesi.
- [ ] Bilinen sorunlar ve çözümleri (`troubleshooting`) bölümünün eklenmesi.

### 📦 Faz 2 Çıktıları
| Çıktı | Dosya |
|-------|-------|
| Kurulum rehberi | `honeypot/KURULUM.md` |
| Logcat yapılandırma scripti | `honeypot/logcat-config.sh` |
| Emulator başlatma scripti | `honeypot/start-emulator.sh` |

---

## Faz 3: Tespit ve Simülasyon (`codebase/`)

> **Amaç:** Saldırı simülasyonu, gerçek zamanlı tespit motoru ve canlı izleme panelini geliştirmek.

### 3.1 — Saldırı Simülasyon Modülü (`modules/attack.py`)
- [ ] Saldırı scriptinin iskelet yapısının oluşturulması.
- [ ] Bozuk (malformed) medya dosyası oluşturma veya gönderme mantığının kodlanması.
- [ ] Hedef emulator'e ADB üzerinden saldırı paketinin iletilmesi.
- [ ] Saldırı parametrelerinin (hedef IP, port, payload türü) komut satırından alınabilir hale getirilmesi.
- [ ] Saldırı loglarının zaman damgalı olarak kaydedilmesi.

### 3.2 — Tespit Motoru (`detector.py`)
- [ ] Arka planda sürekli çalışacak servis mimarisinin tasarlanması.
- [ ] `logcat` çıktısını gerçek zamanlı olarak parse eden modülün yazılması.
- [ ] Heap corruption imzalarını (`SIGABRT`, `SIGSEGV`, `buffer-overflow`) tanıyacak kural motorunun geliştirilmesi.
- [ ] Ağ trafiği anomali tespiti modülünün (opsiyonel) eklenmesi.
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
- [ ] Honeypot ortamının (emulator) başarıyla başlatıldığının doğrulanması.
- [ ] `detector.py` servisinin arka planda çalışır duruma getirilmesi.
- [ ] Web panelin (`app.py`) tarayıcıdan erişilebilir olduğunun teyit edilmesi.
- [ ] `attack.py` ile simüle edilmiş saldırı paketinin hedefe gönderilmesi.

### 4.2 — Tespit Doğrulaması
- [ ] `detector.py`'nin logcat çıktısından anormalliği yakalayıp yakalamadığının kontrol edilmesi.
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
│   ├── cve-analiz.md
│   ├── aosp-notlar.md
│   └── poc-analiz.md
├── honeypot/
│   ├── KURULUM.md
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
└── docs/
    ├── test-raporu.md
    ├── final-rapor.md
    └── screenshots/
```

---

## ⚠️ Yasal Uyarı

Bu proje **yalnızca akademik ve eğitim amaçlıdır**. Tüm testler kontrollü laboratuvar ortamında, izole edilmiş sanal makineler üzerinde gerçekleştirilmektedir. Gerçek cihazlara veya üçüncü taraf sistemlere yönelik herhangi bir saldırı girişimi **yasa dışıdır** ve bu projenin kapsamı dışındadır.

---

> 📝 *Bu yol haritası, proje ilerledikçe güncellenecektir.*
