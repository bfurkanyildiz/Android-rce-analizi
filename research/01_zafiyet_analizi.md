# 🔬 CVE-2026-0891 — Zafiyet Analiz Raporu

> **Proje:** Android Media Framework — MediaExtractor Heap Corruption Simülasyonu  
> **Faz:** 1 — Araştırma ve Analiz  
> **Hazırlayan:** Siber Güvenlik Araştırma Ekibi  
> **Tarih:** 31 Mayıs 2026  
> **Gizlilik:** Akademik Kullanım — Laboratuvar İçi

---

## 📋 Zafiyet Kimlik Kartı

| Parametre | Değer |
|-----------|-------|
| **CVE ID** | CVE-2026-0891 |
| **CWE Sınıflandırması** | CWE-119 — Improper Restriction of Operations within the Bounds of a Memory Buffer |
| **Zafiyet Türü** | Heap-Based Buffer Overflow (Integer Overflow → OOB Write) |
| **Etkilenen Platform** | Android (Media Framework) |
| **Etkilenen Bileşenler** | `MediaExtractor`, `libstagefright` |
| **Etkilenen Süreçler** | `media.extractor`, `mediaserver` |
| **Saldırı Vektörü** | Yerel / Uzak (Manipüle edilmiş medya dosyası) |
| **Etki** | Uzaktan Kod Çalıştırma (RCE), Servis Kesintisi (DoS) |
| **Karmaşıklık** | Düşük (Kullanıcı etkileşimi minimal) |
| **AOSP Kaynak Yolu** | `frameworks/av/media/libstagefright` / `frameworks/av/media/extractors` |

---

## 1. CVE-2026-0891 Mimari Analizi

### 1.1 — Android Media Framework Genel Mimarisi

Android'in medya işleme altyapısı, katmanlı bir mimari üzerine inşa edilmiştir. Bu mimaride her katman belirli bir sorumluluk üstlenir:

```
┌─────────────────────────────────────────────────┐
│              Uygulama Katmanı                   │
│         (MediaPlayer, Gallery, vb.)             │
├─────────────────────────────────────────────────┤
│            Media Framework API                  │
│     (Java/Kotlin — android.media.*)             │
├─────────────────────────────────────────────────┤
│              MediaExtractor                     │  ◄── Zafiyetin tetiklendiği katman
│    (Konteyner ayrıştırma: MP4, MKV, vb.)       │
├─────────────────────────────────────────────────┤
│             libstagefright                      │  ◄── Zafiyetli kütüphane
│   (Native C++ codec ve extractor altyapısı)     │
├─────────────────────────────────────────────────┤
│         Linux Kernel / Binder IPC               │
│     (Süreçler arası iletişim ve izolasyon)      │
└─────────────────────────────────────────────────┘
```

### 1.2 — MediaExtractor Bileşeninin Rolü

`MediaExtractor`, Android'in medya dosyalarını işleme zincirindeki **ilk ve en kritik halka**dır. Görevi, bir medya konteynerini (MP4, MKV, WebM, vb.) açarak içindeki ses ve video parçalarını (`track`) ayrıştırmaktır.

**MediaExtractor'ın sorumlulukları:**
- Konteyner formatının tanınması (dosya sihirli baytları / magic bytes)
- Medya başlıklarının (header) okunması ve doğrulanması
- Atom/box yapılarının ayrıştırılması (özellikle MP4/MOV formatında)
- Ses ve video akışlarının (stream) codec bilgilerinin çıkarılması
- Ham veri ofsetlerinin hesaplanması ve üst katmanlara sunulması

### 1.3 — Etkilenen Süreçler ve Yetki Modeli

| Süreç | Açıklama | Yetki Düzeyi |
|-------|----------|:------------:|
| `media.extractor` | Medya dosyalarının ayrıştırılmasından sorumlu izole süreç | Orta |
| `mediaserver` | Tüm medya işlemlerini yöneten ana sunucu süreç | Yüksek |

> ⚠️ **Kritik Not:** `mediaserver` süreci, kamera, mikrofon ve ses donanımına doğrudan erişim yetkisine sahiptir. Bu süreç üzerinde elde edilen bir kod çalıştırma imkânı, cihazın geniş çaplı ele geçirilmesi anlamına gelir.

### 1.4 — AOSP Kaynak Kod Haritası

Zafiyetin bulunduğu kaynak kod bölgeleri:

```
frameworks/av/
├── media/
│   ├── libstagefright/
│   │   ├── MPEG4Extractor.cpp      ◄── Atom ayrıştırma mantığı (zafiyet noktası)
│   │   ├── MediaExtractor.cpp      ◄── Genel extractor arayüzü
│   │   ├── Utils.cpp               ◄── Yardımcı fonksiyonlar
│   │   └── include/
│   │       └── media/stagefright/
│   │           ├── MediaExtractor.h
│   │           └── MPEG4Extractor.h
│   └── extractors/
│       ├── mp4/
│       │   └── MPEG4Extractor.cpp  ◄── Alternatif konum (yeni AOSP dalları)
│       └── mkv/
│           └── MatroskaExtractor.cpp
```

---

## 2. Zafiyetin Kök Nedeni

### 2.1 — Sorunlu Kod Bloğu

Zafiyetin kaynağı, `parseAtom()` fonksiyonu içindeki bellek tahsis mantığında yatmaktadır:

```c
// ===================================================================
// ZAFİYETLİ KOD — AOSP (Yamasız Sürüm)
// Dosya: frameworks/av/media/libstagefright/MPEG4Extractor.cpp
// Fonksiyon: parseAtom()
// ===================================================================

status_t MPEG4Extractor::parseAtom(uint32_t atomSize) {

    // [1] Medya dosyasının başlığından okunan atom boyutu (atomSize),
    //     kullanıcı tarafından kontrol edilebilir bir değerdir.

    // [2] ❌ KRİTİK HATA: Integer Overflow noktası
    //     atomSize + 1 işlemi, atomSize değeri 0xFFFFFFFF (uint32_t MAX)
    //     olduğunda taşarak 0x00000000 değerini üretir.
    void* buffer = malloc(atomSize + 1);

    // [3] ❌ SONUÇ: OOB Write (Heap Taşması)
    //     malloc(0) genellikle küçük bir geçerli adres döndürür.
    //     Ancak readDataInto() orijinal atomSize kadar veri yazmaya çalışır.
    //     Bu, heap üzerinde devasa bir taşmaya (overflow) neden olur.
    readDataInto(buffer, atomSize);

    // ... devam eden işlemler ...
}
```

### 2.2 — Integer Overflow Mekanizması (Adım Adım)

Zafiyetin tetiklenme süreci, aritmetik bir taşmadan kaynaklanmaktadır. Adım adım inceleyelim:

#### Adım 1 — Saldırganın Girdi Hazırlaması
```
Saldırgan, MP4 dosyasının atom başlığındaki boyut alanına
şu değeri yerleştirir:

    atomSize = 0xFFFFFFFF  (4.294.967.295 — uint32_t'nin alabileceği en büyük değer)
```

#### Adım 2 — Integer Overflow Gerçekleşmesi
```
Kod: malloc(atomSize + 1)
Hesaplama:
    0xFFFFFFFF + 0x00000001 = 0x100000000

Ancak uint32_t yalnızca 32 bit taşıyabilir!
Üst bit düşer (truncation):

    0x100000000 → 0x00000000

Sonuç: malloc(0) çağrılır.
```

#### Adım 3 — malloc(0) Davranışı
```
C standardına göre malloc(0) şu şekilde davranabilir:
  • NULL döndürebilir (bazı implementasyonlar)
  • Küçük, geçerli bir bellek bloğu döndürebilir (çoğu implementasyon)

Android'in Bionic libc'si genellikle küçük bir blok döndürür.
Örneğin: 8-16 byte'lık bir heap chunk tahsis edilir.

    buffer → [████████████████]  (yalnızca ~16 byte)
```

#### Adım 4 — Out-of-Bounds (OOB) Write Tetiklenmesi
```
Kod: readDataInto(buffer, atomSize)

readDataInto() fonksiyonu, orijinal atomSize değerini kullanır:
    atomSize = 0xFFFFFFFF = ~4 GB veri yazmaya çalışır!

Bellekte olan:
    buffer → [████████████████]  (16 byte tahsis edilmiş)
                                ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
                                HEAP TAŞMASI BAŞLAR →→→→→→
                                (Komşu heap nesneleri ezilir)
```

### 2.3 — Taşma Sonrası Bellek Durumu (Görselleştirme)

```
 HEAP BELLEĞİ (Taşma Öncesi — Normal Durum)
 ┌──────────────────┬──────────────────┬──────────────────┐
 │   Önceki Chunk    │  buffer (16 B)   │  Sonraki Chunk   │
 │   [Normal Veri]   │  [Boş / Yeni]    │  [Normal Veri]   │
 └──────────────────┴──────────────────┴──────────────────┘

 HEAP BELLEĞİ (Taşma Sonrası — Saldırı Durumu)
 ┌──────────────────┬──────────────────┬──────────────────┐
 │   Önceki Chunk    │  buffer (16 B)   │██████████████████│
 │   [Normal Veri]   │  [Saldırgan      │██ EZİLMİŞ VERİ █│
 │                   │   Kontrollü]     │██████████████████│
 └──────────────────┴──────────────────┴──────────────────┘
                                        ↑
                                  Heap metadata, fonksiyon
                                  işaretçileri (vtable) ve
                                  diğer kritik yapılar ezilir.
```

### 2.4 — Neden Tehlikeli? (Etki Analizi)

Heap taşmasının sonuçları, saldırganın kontrol edebildiği veri miktarına ve heap düzenine (layout) bağlı olarak değişir:

| Etki Seviyesi | Senaryo | Sonuç |
|:-------------:|---------|-------|
| 🟡 **Düşük** | Heap metadata bozulur | Süreç çöker → **DoS (Denial of Service)** |
| 🟠 **Orta** | Fonksiyon işaretçisi ezilir | Kontrol akışı saldırganın belirlediği adrese yönlenir |
| 🔴 **Kritik** | vtable veya GOT girdisi ezilir | **Uzaktan Kod Çalıştırma (RCE)** — saldırgan, `mediaserver` yetkileriyle keyfi kod çalıştırır |

---

## 3. İstismar Senaryosu ve Saldırı Vektörü

### 3.1 — Saldırı Akış Diyagramı

```
┌─────────────────┐
│   SALDIRGAN      │
│                  │
│  Zararlı MP4/MKV │
│  dosyası hazırlar│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────────────────────┐
│  DAĞITIM KANALI  │     │  Olası Yöntemler:                    │
│                  │────▶│  • Kötü amaçlı web sitesi            │
│                  │     │  • Phishing e-posta eki               │
│                  │     │  • MMS / Mesajlaşma uygulaması        │
│                  │     │  • Zararlı uygulama içi medya         │
│                  │     │  • Paylaşılan bulut depolama linki    │
└────────┬────────┘     └──────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  ANDROID CİHAZ   │
│                  │
│  Dosya indirilir │
│  veya alınır     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────────────────────┐
│  MEDİA SCANNER   │     │  Android'in MediaScanner servisi      │
│  (Otomatik)      │────▶│  yeni dosyayı otomatik olarak         │
│                  │     │  indekslemeye başlar. Kullanıcının     │
│                  │     │  dosyayı açmasına GEREK YOKTUR!        │
└────────┬────────┘     └──────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ MediaExtractor   │
│                  │
│ parseAtom()      │
│ çağrılır         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────────────────────┐
│ INTEGER OVERFLOW │     │  atomSize = 0xFFFFFFFF                │
│                  │────▶│  malloc(0xFFFFFFFF + 1) = malloc(0)   │
│ malloc(0)        │     │  Küçük bir heap bloğu tahsis edilir   │
└────────┬────────┘     └──────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────────────────────┐
│  OOB WRITE       │     │  readDataInto(buffer, 0xFFFFFFFF)     │
│  (Heap Taşması)  │────▶│  ~4 GB veri 16 byte'lık alana yazılır │
│                  │     │  Heap tamamen bozulur                 │
└────────┬────────┘     └──────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│                   SONUÇ                          │
│                                                  │
│  ┌──────────┐    ┌────────────────────────────┐  │
│  │   DoS    │ veya │  RCE (Uzaktan Kod Çalıştırma) │  │
│  │  Çökme   │    │  mediaserver yetkileriyle   │  │
│  └──────────┘    └────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 3.2 — Zararlı MP4 Dosyasının Anatomisi

MP4 (MPEG-4 Part 14) formatı, iç içe geçmiş **atom** (veya **box**) yapılarından oluşur. Her atomun ilk 4 byte'ı o atomun boyutunu, sonraki 4 byte'ı ise türünü belirtir:

```
Normal bir MP4 atom yapısı:
┌────────────────────────────────────────────────────┐
│ Atom Size (4 byte) │ Atom Type (4 byte) │ Veri ... │
│   0x000000A0       │     "moov"         │ ...      │
│   (160 byte)       │                    │          │
└────────────────────────────────────────────────────┘

Manipüle edilmiş (zararlı) atom yapısı:
┌────────────────────────────────────────────────────┐
│ Atom Size (4 byte) │ Atom Type (4 byte) │ Veri ... │
│   0xFFFFFFFF       │     "moov"         │ PAYLOAD  │
│   (4.294.967.295!) │                    │ (Zararlı)│
└────────────────────────────────────────────────────┘
         ↑
    Integer Overflow'u tetikleyecek değer
```

### 3.3 — PoC (Proof of Concept) Stratejisi

Kontrollü laboratuvar ortamında zafiyetin tetiklenmesi için izlenecek kavramsal adımlar:

#### Aşama A — Zararlı Medya Dosyası Üretimi
1. Geçerli bir MP4 dosyasının binary düzeyde açılması (hex editor).
2. Hedef atomun (örn. `moov`, `mdat`, `stbl`) boyut alanının bulunması.
3. Boyut değerinin `0xFFFFFFFF` ile değiştirilmesi.
4. Dosyanın kaydedilmesi.

#### Aşama B — Teslimat ve Tetikleme
1. Zararlı dosyanın zafiyetli Android emülatörüne aktarılması (`adb push`).
2. Android'in `MediaScanner` servisinin dosyayı otomatik olarak algılaması.
3. `MediaExtractor`'ın `parseAtom()` fonksiyonunu çağırması.

#### Aşama C — Gözlemleme ve Doğrulama
1. `logcat` üzerinden `media.extractor` ve `mediaserver` süreçlerinin izlenmesi.
2. Beklenen çıktılar:
   - `SIGABRT` veya `SIGSEGV` sinyalleri
   - `AddressSanitizer` raporları (ASan etkinse)
   - `heap-buffer-overflow` ibareleri
   - Süreç çökmesi (`tombstone` kaydı)

### 3.4 — Saldırı Tetiklenme Koşulları

Zafiyetin başarılı bir şekilde tetiklenmesi için gereken koşullar:

| Koşul | Açıklama | Zorunlu mu? |
|-------|----------|:-----------:|
| Zafiyetli Android sürümü | Yamanın uygulanmamış olduğu bir sürüm | ✅ Evet |
| Geçerli medya konteyneri | MP4, MKV veya desteklenen diğer formatlar | ✅ Evet |
| Manipüle edilmiş atom boyutu | `atomSize` = `0xFFFFFFFF` veya overflow üreten değer | ✅ Evet |
| Kullanıcı etkileşimi | Dosyanın açılması veya indekslenmesi yeterli | ⚠️ Minimal |
| Root erişimi | Tetikleme için gerekmez, istismar için avantaj sağlar | ❌ Hayır |

### 3.5 — Saldırının Etkisi ve Risk Değerlendirmesi

```
╔══════════════════════════════════════════════════════════════╗
║                    RİSK DEĞERLENDİRMESİ                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Gizlilik Etkisi    : ████████████████████████████  YÜKSEK   ║
║  Bütünlük Etkisi    : ████████████████████████████  YÜKSEK   ║
║  Erişilebilirlik     : ████████████████████████████  YÜKSEK   ║
║  Saldırı Karmaşıklığı: ████████░░░░░░░░░░░░░░░░░░  DÜŞÜK    ║
║  Kullanıcı Etkileşimi: ████████░░░░░░░░░░░░░░░░░░  MİNİMAL  ║
║                                                              ║
║  Genel Risk Seviyesi : ████████████████████████████  KRİTİK   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Potansiyel sonuçlar:**
- 🔴 **Uzaktan Kod Çalıştırma (RCE):** Saldırgan, `mediaserver` sürecinin yetkileriyle cihazda keyfi komut çalıştırabilir.
- 🔴 **Veri Hırsızlığı:** Kamera, mikrofon ve dosya sistemine erişim sağlanabilir.
- 🟠 **Kalıcılık (Persistence):** Yüksek yetkili süreç üzerinden kalıcı arka kapı (backdoor) yerleştirilebilir.
- 🟡 **Servis Kesintisi (DoS):** En düşük etki senaryosunda bile hedef sürecin tekrar tekrar çökmesi sağlanabilir.

---

## 4. Tespit ve Savunma Stratejileri

### 4.1 — Tespit İmzaları (Detection Signatures)

Aşağıdaki göstergeler, bu zafiyetin istismar edilmeye çalışıldığına işaret eder:

**Logcat Düzeyinde:**
```
# Aranacak anahtar kelimeler ve kalıplar:
SIGABRT
SIGSEGV
heap-buffer-overflow
AddressSanitizer
media.extractor.*crash
mediaserver.*died
tombstone_*
```

**Dosya Düzeyinde:**
- Atom boyutu `0xFFFFFFFF` veya `0xFFFFFFFE` olan MP4/MKV dosyaları
- Anormal derecede küçük dosya boyutuna rağmen devasa atom boyut bildirimi
- Geçersiz veya tutarsız atom hiyerarşisi

**Ağ Düzeyinde:**
- Bilinmeyen kaynaklardan indirilen küçük boyutlu (< 1 KB) `.mp4` / `.mkv` dosyaları
- Medya dosyası uzantılı ancak geçersiz MIME türüne sahip HTTP yanıtları

### 4.2 — Önerilen Yamalar ve Karşı Önlemler

| Önlem | Açıklama | Uygulama Noktası |
|-------|----------|-------------------|
| **Boyut doğrulaması** | `atomSize + 1` işleminden önce overflow kontrolü | Kaynak kod (AOSP) |
| **Güvenlik yaması** | Resmi Android güvenlik bülteni yamasının uygulanması | Cihaz güncellemesi |
| **ASan etkinleştirme** | AddressSanitizer ile bellek hatalarının erken tespiti | Geliştirme/Test |
| **SELinux politikaları** | `mediaserver` sürecinin erişim yetkilerinin sıkılaştırılması | Sistem yapılandırması |
| **Dosya tarama** | İndirilen medya dosyalarının atom yapısı doğrulaması | Uygulama katmanı |

**Yamalı kodun beklenen hali:**
```c
// ===================================================================
// YAMALI KOD — Güvenli Sürüm
// ===================================================================

status_t MPEG4Extractor::parseAtom(uint32_t atomSize) {

    // ✅ Integer Overflow kontrolü eklendi
    if (atomSize > SIZE_MAX - 1) {
        ALOGE("parseAtom: atom boyutu çok büyük, olası taşma tespit edildi!");
        return ERROR_MALFORMED;
    }

    // ✅ Makul üst sınır kontrolü
    if (atomSize > kMaxAtomSize) {  // örn: 256 MB
        ALOGE("parseAtom: atom boyutu makul sınırı aşıyor!");
        return ERROR_MALFORMED;
    }

    void* buffer = malloc(atomSize + 1);
    if (buffer == NULL) {
        return ERROR_OUT_OF_MEMORY;
    }

    readDataInto(buffer, atomSize);
    // ...
}
```

---

## 5. Referanslar ve Kaynaklar

| # | Kaynak | Açıklama |
|:-:|--------|----------|
| 1 | [NVD — CVE-2026-0891](https://nvd.nist.gov/) | NIST Ulusal Zafiyet Veritabanı girişi |
| 2 | [Android Güvenlik Bülteni](https://source.android.com/docs/security/bulletin) | Resmi yama duyurusu |
| 3 | [AOSP Kaynak Kodu](https://android.googlesource.com/) | `frameworks/av/media/libstagefright` |
| 4 | [CWE-119](https://cwe.mitre.org/data/definitions/119.html) | Bellek sınır ihlali sınıflandırması |
| 5 | [CWE-190](https://cwe.mitre.org/data/definitions/190.html) | Integer Overflow sınıflandırması |
| 6 | [Android Media Framework Mimarisi](https://source.android.com/docs/core/media) | Resmi mimari dokümantasyonu |

---

> ⚠️ **Yasal Uyarı:** Bu döküman yalnızca akademik araştırma ve eğitim amaçlıdır. Tüm analizler ve simülasyonlar kontrollü laboratuvar ortamında gerçekleştirilmektedir. Buradaki bilgilerin kötü amaçlı kullanımı yasa dışıdır ve tüm sorumluluk kullanan kişiye aittir.
