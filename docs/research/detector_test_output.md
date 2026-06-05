# Detector.py Test Çıktısı — Canlı Simülasyon

**Tarih:** 5 Haziran 2026  
**Araç:** src/detector.py  
**Test Ortamı:** Manuel girdi modu (ADB emülatör olmadan)

## Test Sonuçları

| # | Test Girdisi | Tespit |
|---|---|---|
| 1 | W AndroidRuntime: SIGSEGV in run-as process | ✅ ALARM |
| 2 | E installd: SIGABRT caught in packages.list write | ✅ ALARM |
| 3 | I ActivityManager: Process com.banka.app has died | ✅ ALARM |

## Ekran Görüntüsü
![Detector Test Çıktısı](../assets/detector_test.png)

## Sonuç
Detector, CVE-2024-0044 sömürü imzalarını 
başarıyla yakaladı ve TEHLIKE - ALARM üretti.
