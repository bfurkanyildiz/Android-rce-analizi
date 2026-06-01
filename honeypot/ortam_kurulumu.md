# Test Ortamı Kurulumu

> **Konu:** CVE-2024-0044 analizi için izole Android test ortamının hazırlanması  
> **Araçlar:** Android Studio, AVD Manager, ADB  
> **Bağımlılık:** `research/01_zafiyet_analizi.md` ve `research/02_teknik_mekanizma.md` dosyalarının okunmuş olması önerilir

---

## 1. Android Emülatör Kurulumu (AVD)

**Android Studio** üzerinden emülatör oluşturulur:

1. **Android Studio'yu indir ve kur:** [developer.android.com](https://developer.android.com/studio) adresinden güncel sürümü al.
2. **SDK Manager'dan gerekli bileşenleri yükle:**
   - Android 12 (API 31) veya Android 13 (API 33) sistem imajı
   - Android SDK Platform-Tools (ADB için)
3. **AVD Manager ile sanal cihaz oluştur:**
   - Device: Pixel 4 veya benzeri
   - System Image: **API 33 (Android 13)** — zafiyet bu sürümde aktif
   - `x86_64` imajını seç (performans için)
4. **Emülatörü başlat:** AVD Manager'dan "Play" butonuyla çalıştır.

> 💡 **API seviyesi seçimi kritiktir.** CVE-2024-0044, Android 12–14 (API 31–34) arasında geçerlidir. API 33 önerilir çünkü hem güncel hem de yamalı olmayan imajlar mevcuttur.

---

## 2. ADB Bağlantısı

ADB (Android Debug Bridge), bilgisayar ile emülatör arasında köprü kurar:

```bash
# Emülatörün bağlı olduğunu doğrula
adb devices

# Beklenen çıktı:
# emulator-5554   device

# Shell erişimi aç
adb shell

# Paket listesini kontrol et
adb shell cat /data/system/packages.list | head -5
```

Eğer `adb devices` boş dönüyorsa:
- Emülatörün çalıştığından emin ol
- `adb kill-server && adb start-server` ile servisi yeniden başlat

---

## 3. Test Ortamı Neden İzole Olmalı?

Bu proje bir **ayrıcalık yükseltme zafiyetini** test eder. İzolasyon şu nedenlerle zorunludur:

- **Gerçek cihaz kullanma:** Zafiyet, uygulama verilerinin çalınmasına yol açar. Kişisel cihazda test yapmak gerçek verileri riske atar.
- **Ağ izolasyonu:** Emülatör internete bağlıysa, test sırasında istenmeyen trafik oluşabilir. Emülatörü `-no-snapstorage -no-window` parametreleriyle başlatmak veya ağ erişimini kısıtlamak önerilir.
- **Tekrarlanabilirlik:** Temiz bir emülatör snapshot'ı ile her test aynı başlangıç noktasından yapılır. Sonuçlar güvenilir ve raporlanabilir olur.

> ⚠️ **Uyarı:** Bu testler yalnızca sanal ortamda ve akademik amaçla yapılmalıdır. Üçüncü taraf cihazlarda izinsiz test yapmak yasadışıdır.

---

> 📝 *Bu döküman akademik amaçlıdır. Tüm testler kontrollü laboratuvar ortamında gerçekleştirilecektir.*
