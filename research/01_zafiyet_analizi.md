# CVE-2024-0044 — Zafiyet Analizi

> **CVE ID:** CVE-2024-0044  
> **Etkilenen Bileşen:** Android `run-as` komutu (Package Manager / Installer)  
> **Zafiyet Türü:** Ayrıcalık Yükseltme (Privilege Escalation)  
> **Etkilenen Sürümler:** Android 12, 12L, 13, 14  
> **Tarih:** Haziran 2026

---

## 1. Zafiyet Nedir?

Android işletim sisteminde `run-as` adında yerleşik bir komut bulunur. Bu komut, geliştiricilerin kendi uygulamalarının dizinine o uygulamanın yetkileriyle erişmesini sağlar. Normalde yalnızca **debuggable** (hata ayıklanabilir) olarak işaretlenmiş uygulamalar üzerinde çalışır.

CVE-2024-0044, `run-as` komutunun paket bilgilerini doğrulama şeklindeki bir **giriş doğrulama hatasından** kaynaklanır. Saldırgan, Android'in paket yönetim sistemine özel olarak hazırlanmış bir paket adı enjekte ederek `run-as` komutunu kandırabilir. Bu sayede saldırgan, hedef uygulamanın kimliğine bürünür ve o uygulamanın özel verilerine erişim kazanır.

---

## 2. Teknik Mekanizma (Sade Anlatım)

Saldırı şu adımlarla gerçekleşir:

1. **Zararlı paket adı hazırlanır:** Saldırgan, satır sonu karakterleri (`\n`) içeren özel bir paket adı oluşturur.
2. **Paket bilgisi zehirlenir:** Bu manipüle edilmiş ad, Android'in `/data/system/packages.list` dosyasına yazılır. Satır sonu karakteri, dosyada yeni bir sahte satır oluşturarak başka bir uygulamanın bilgilerini taklit eder.
3. **`run-as` komutu kandırılır:** `run-as` bu dosyayı okuduğunda, sahte satırı gerçek bir kayıt olarak kabul eder ve saldırganın hedef uygulamanın kimliğiyle çalışmasına izin verir.
4. **Veri çalınır:** Saldırgan artık hedef uygulamanın `/data/data/<paket_adı>/` dizinine tam erişim elde eder.

Özetle: **Satır enjeksiyonu → paket listesi zehirlenmesi → kimlik taklidi → veri hırsızlığı.**

---

## 3. Saldırgan Ne Kazanır?

Bu zafiyet başarıyla istismar edildiğinde saldırgan şunları yapabilir:

- **Özel uygulama verilerine erişim:** Hedef uygulamanın veritabanları, paylaşılan tercihler (SharedPreferences) ve dahili dosyaları okunabilir.
- **Oturum tokenlerinin çalınması:** Bankacılık, mesajlaşma veya sosyal medya uygulamalarının oturum bilgileri ele geçirilebilir.
- **Kimlik taklidi:** Herhangi bir uygulamanın UID'si ile işlem yapılabilir.
- **Zincirleme saldırı:** Elde edilen erişim, daha büyük bir saldırı zincirinin ilk adımı olarak kullanılabilir.

> ⚠️ **Önemli:** Saldırganın bu zafiyeti kullanabilmesi için cihaza fiziksel erişim veya ADB bağlantısı ya da cihazda zaten çalışan zararlı bir uygulama gereklidir.

---

## 4. Tespit ve Engelleme Mantığı

### Tespit Yöntemleri
- **`packages.list` bütünlük kontrolü:** Dosyadaki satır sayısı ve format düzenli aralıklarla doğrulanır; satır sonu anomalileri aranır.
- **`run-as` çağrı izleme:** Anormal `run-as` komut kullanımları (beklenmedik paket adları, sıra dışı UID eşleşmeleri) loglanır.
- **Logcat analizi:** `PackageManager` ve `installd` servislerinden gelen hata ve uyarı mesajları izlenir.

### Engelleme Yöntemleri
- **Resmi yama:** Google'ın Haziran 2024 güvenlik bülteniyle yayınladığı yamanın uygulanması.
- **Girdi sanitizasyonu:** `run-as` komutuna iletilen paket adlarında özel karakter kontrolü yapılması.
- **SELinux politikaları:** `run-as` erişim politikalarının sıkılaştırılması.
- **ADB erişim kısıtlaması:** Üretim cihazlarında ADB'nin varsayılan olarak kapatılması.

---

> 📝 *Bu döküman akademik amaçlıdır. Tüm testler kontrollü laboratuvar ortamında gerçekleştirilecektir.*
