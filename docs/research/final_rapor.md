# Sızma Testi / Güvenlik Raporu — Baha Furkan Yıldız

---

## 1. Hedef / Target

* **Analiz Edilen Ekosistem:** Android OS Framework & Core Utilities (Çekirdek Sistem Servisleri ve İzin Mekanizmaları)
* **Tarih / Date:** 4 Haziran 2026
* **Test Ortamı / Environment:** İzole Docker Konteynerleri ve Android AVD (Android Virtual Device - Emülatör) Laboratuvarı
* **Amaç:** Android ekosistemini etkileyen 3 kritik zafiyetin incelenmesi, sömürü mantığının çözümlenmesi ve bu zafiyetlerin oluşturabileceği risklerin tespit edilerek raporlanması.

---

## 2. Metodoloji / Methodology

Proje kapsamında yürütülen siber güvenlik çalışmaları, standart sızma testi metodolojisine uygun olarak 4 ana aşamada gerçekleştirilmiştir:

1. **Keşif / Reconnaissance:** Android işletim sisteminin çekirdek bileşenleri, `run-as` gibi yerleşik CLI araçları ve yetki yönetimini sağlayan sistem servislerinin (Storage Access Framework, Permission Controller) mimari haritası çıkarılmıştır.
2. **Tarama / Scanning:** `logcat` günlükleri ve Android izin doğrulama rutinleri incelenerek, sistemdeki normal durum akışları ile anormal davranış sinyalleri analiz edilmiştir.
3. **İstismar / Exploitation:** Seçilen 3 kritik zafiyetin (CVE-2024-0044, CVE-2024-43093, CVE-2024-23706) mantıksal kök nedenleri (girdi doğrulama ve normalizasyon hataları) teorik olarak simüle edilerek çözümlenmiştir.
4. **Raporlama / Reporting:** Elde edilen tüm sömürü verileri risk matrisine dökülmüş, vize projesi kapsamında geliştirilen **NetVanguard** log analiz motoru ile entegre edilerek izleme altyapısı kurulmuştur.

---

## 3. Bulgular / Findings

Aşağıdaki tablolarda analiz edilen zafiyetlerin detayları, oluşturdukları riskler ve çözüm önerileri sunulmuştur:

### [Kritik] CVE-2024-0044 — run-as Yerel Yetki Yükseltme (Privilege Escalation)

| Parametre | Detay |
|---|---|
| **Açıklama** | `/data/system/packages.list` dosyasına paket kurulumu sırasında satır sonu (`\n`) karakteri enjekte edilerek dosya yapısının bozulması ve `run-as` aracının kandırılarak hedef uygulamanın UID'si ile komut çalıştırılabilmesi. |
| **Risk Derecesi** | **Critical (Kritik) — CVSS: 7.8** (Etkilenen cihaz sayısı yüksek, sömürüsü kolay) |
| **Etki Alanı** | Hedef uygulamaların tüm özel verilerine (SQLite, SharedPreferences, vb.) doğrudan yetkisiz erişim. |
| **Çözüm Önerisi** | `PackageInstallerService` girdi doğrulamalarının sıkılaştırılması ve Mart 2024 (en nihai koruma için Ekim 2024) Google güvenlik yamalarının sisteme uygulanması. |

---

### [Yüksek] CVE-2024-43093 — DocumentsUI Mantıksal Dosya Erişim İhlali

| Parametre | Detay |
|---|---|
| **Açıklama** | `ExternalStorageProvider.java` içindeki `shouldHideDocument()` metodunda bulunan **Unicode Normalizasyon Hatası** nedeniyle, yasaklı dosya yollarının alternatif karakterlerle filtreden kaçırılması ve sandbox dışındaki hassas kullanıcı verilerine erişilmesi. |
| **Risk Derecesi** | **High (Yüksek) — CVSS: 7.5** |
| **Etki Alanı** | Kullanıcının haberi olmadan `Android/data` ve `Android/obb` altındaki tüm özel dosya dizinlerine sızılması. |
| **Çözüm Önerisi** | Dosya yolları filtrelenirken sistem düzeyinde **NFKC** normalizasyonunun zorunlu hale getirilerek girdi karşılaştırmalarının yapılması (Kasım 2024 yaması). |

---

### [Yüksek] CVE-2024-23706 — PermissionController İzin Atlatma Açığı

| Parametre | Detay |
|---|---|
| **Açıklama** | Android HealthFitness IPC bağlantı yollarında uygulanan yetersiz girdi doğrulaması sonucu, yerel bir uygulamanın kullanıcı onayı (izin pencereleri) olmaksızın kritik izinleri atlatabilmesi. |
| **Risk Derecesi** | **High (Yüksek) — CVSS: 7.5** |
| **Etki Alanı** | Kullanıcı etkileşimi olmadan tehlikeli izinlerin (sağlık verileri, biyometrik veriler vb.) gasp edilmesi. |
| **Çözüm Önerisi** | API çağrısı yapan uygulamaların UID ve paket imza bilgilerini doğrulayan çift yönlü kontrol mimarisine geçilmesi (Mayıs 2024 yaması). |

---

## 4. Vize Modülü Entegrasyonu: NetVanguard İzleme Motoru

Bu projede geliştirilen siber dedektiflik ve alarm altyapısı, vizede geliştirilen Rust ve HTML tabanlı **NetVanguard** log analiz/anomali tespit motoruna entegre edilmiştir:

* **Süreç Akışı:** Arka planda çalışan `src/detector.py` motoru, canlı log akışını (logcat) izleyerek `SIGSEGV` (bellek hatası), `SIGABRT` (iptal hatası) veya `died` (servis çökmesi) gibi istismar göstergesi olabilecek anomalileri yakalar.
* **Canlı Alarm Panel Entegrasyonu:** Yakalanan bu kritik sinyaller, NetVanguard analiz motoruna soket veya log yönlendirme kanalları üzerinden anlık olarak aktarılır. NetVanguard paneli bu sinyalleri algıladığı anda arayüzde **kırmızı alarm** oluşturarak analistleri uyarır.

---

## 5. Özet / Summary

Aşağıdaki risk dağılım tablosu, analiz edilen Android OS zafiyetlerinin önem seviyelerini özetlemektedir:

| Seviye (Severity) | Tespit Edilen Sayı | Durum |
|:---:|:---:|:---:|
| 🔴 **Kritik (Critical)** | 1 | İncelenip Raporlandı |
| 🟠 **Yüksek (High)** | 2 | İncelenip Raporlandı |
| 🟡 **Orta (Medium)** | 0 | - |
| 🔵 **Düşük (Low)** | 0 | - |
| **Toplam (Total)** | **3** | **Zafiyet Çözümlendi** |
