# CVE-2024-0044 — Referanslar ve Kaynaklar

Sızma testi final projesi kapsamında incelenen CVE-2024-0044 (Android `run-as` LPE) zafiyetine ait resmi duyurular, teknik analizler ve kaynak bağlantıları bu dokümanda derlenmiştir.

---

## 1. Resmi Güvenlik Duyuruları

| Kaynak / Platform | Bağlantı | Açıklama |
|:---|:---|:---|
| **NVD (NIST)** | [NVD - CVE-2024-0044](https://nvd.nist.gov/vuln/detail/CVE-2024-0044) | Zafiyetin resmi NIST veritabanı kaydı. |
| **Android Security Bulletin** | [Android Security Bulletin - Mart 2024](https://source.android.com/docs/security/bulletin/2024-03-01) | Zafiyetin ilk olarak yayınlandığı ve yamalandığı resmi bülten. |
| **Android Security Bulletin** | [Android Security Bulletin - Ekim 2024](https://source.android.com/docs/security/bulletin/2024-10-01) | İlk yamanın bypass edilmesi üzerine yayınlanan nihai yama bülteni. |
| **Mitre CVE** | [CVE-2024-0044 Record](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-0044) | MITRE üzerindeki resmi CVE kaydı. |

---

## 2. CVSSv3 Skor Analizi

Zafiyetin etki derecesi CVSS v3.1 standardına göre aşağıdaki şekilde puanlanmıştır:

* **CVSS Base Score:** **7.8 (High / Yüksek)**
* **CVSS Vector:** `CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`

### Vektör Detayları:
* **Attack Vector (AV: Local):** Saldırganın hedef sisteme yerel (local) erişimi (ADB bağlantısı veya yerel bir zararlı uygulama) olmalıdır.
* **Attack Complexity (AC: Low):** Saldırıyı gerçekleştirmek için karmaşık bir ön koşul bulunmamaktadır.
* **Privileges Required (PR: Low):** Düşük düzeyde (örneğin sıradan bir uygulama yetkisi veya shell yetkisi) ayrıcalık yeterlidir.
* **User Interaction (UI: None):** Kullanıcı etkileşimi gerekmez.
* **Scope (S: Unchanged):** Güvenlik etki alanı değişmez (Android Sandbox sınırları içinde kalır, fakat başka bir uygulamanın alanına geçilir).
* **Confidentiality (C: High):** Hedef uygulamanın tüm özel verileri (tokenler, veri tabanları) okunabilir.
* **Integrity (I: High):** Hedef uygulamanın dosyaları değiştirilebilir, yetkileri dahilinde API çağrıları yapılabilir.
* **Availability (A: High):** Hedef uygulama çökertilebilir veya işlevsiz hale getirilebilir.

---

## 3. Teknik Makaleler ve Analizler (Writeups & PoC)

* **Meta Security Blog & Araştırmacı "canyie" Analizleri:**
  Zafiyetin `PackageInstallerService.java` üzerindeki yama öncesi ve sonrası analizleri ile yama bypass yöntemlerine dair detaylı GitHub çalışmaları:
  * [canyie's CVE-2024-0044 PoC & Writeup](https://github.com/canyie/CVE-2024-0044)
  * [AOSP Girdi Filtreleme Düzeltme Commiti](https://android.googlesource.com/platform/frameworks/base/+/a75225c5dbb0f19c086c8f4955b92fcb92234)

* **Güvenlik Analiz Toplulukları:**
  * [AppSecure - CVE-2024-0044 Vulnerability Deep Dive](https://appsecure.security/blog/cve-2024-0044-deep-dive/)
  * [SentinelOne Mobile Vulnerability Research](https://www.sentinelone.com/blog/)

---

> [!NOTE]
> Bu kaynaklar, projenin araştırma (`docs/research/`) ve modül geliştirme (`docs/modules/`) süreçlerinde temel referans noktası olarak kullanılmıştır.
