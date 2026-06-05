<div align="center">
  <a href="https://istinye.edu.tr">
    <img src="https://raw.githubusercontent.com/keyvanarasteh/ResearchLab/master/docs/assets/istinye-university-logo.webp" alt="İstinye Üniversitesi" width="180"/>
  </a>

  # CVE Araştırma ve PoC Laboratuvarı — Android Güvenlik Analizi

  ![GitHub](https://img.shields.io/badge/GitHub-Private-red?style=flat-square&logo=github)
  ![Dil](https://img.shields.io/badge/Dil-Python-blue?style=flat-square)
  ![Durum](https://img.shields.io/badge/Durum-Tamamlandı-green?style=flat-square)
  ![Ders](https://img.shields.io/badge/Ders-BGT006-purple?style=flat-square)
</div>

---

## 👨‍🏫 Danışman Bilgisi
| Ad Soyad | Keyvan Arasteh |
| :--- | :--- |
| **GitHub** | [@keyvanarasteh](https://github.com/keyvanarasteh) |
| **E-posta** | keyvan.arasteh@istinye.edu.tr |
| **Web Sitesi** | [qline.tech](https://qline.tech) |

## 👤 Öğrenci Bilgisi
| Ad Soyad | Baha Furkan Yıldız |
| :--- | :--- |
| **Öğrenci No** | 25****1009 |


## 📚 Ders Bilgileri
| Ders Adı | Sızma Testi |
| :--- | :--- |
| **Ders Kodu** | BGT006 |
| **Kredi** | 3 AKTS |
| **Ön Koşullar** | Ağ Temelleri, Linux CLI |
| **Dönem** | 2025-2026 Bahar |

---

## 🚀 Proje Özeti ve Kapsamı
Bu proje, İstinye Üniversitesi Bilgi Güvenliği Teknolojisi programı Sızma Testi (BGT006) dersi final ödevi olarak geliştirilmiştir. Proje kapsamında Android ekosistemini etkileyen 3 farklı güncel zafiyet (CVE-2024-0044, CVE-2024-43093, CVE-2024-23706) derinlemesine incelenmiş, izole lab ortamı kurgulanmış ve siber dedektiflik metodolojisiyle analiz edilmiştir.

### 🔌 Vize Modülü (NetVanguard) Entegrasyonu
Proje kapsamında geliştirilen `src/detector.py` uç nokta log analiz ajanı, vize projesi olarak hayata geçirilen **NetVanguard** merkezi anomali izleme ve alarm paneline entegre edilmiştir. Emülatör üzerinde oluşan kritik zafiyet imzaları ağ üzerinden NetVanguard backend motoruna aktarılarak merkezi izleme (SIEM) mimarisi simüle edilmiştir.