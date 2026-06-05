@echo off
:: Android CVE Analizi - Web Dashboard Baslatici
title Android CVE Analizi Dashboard
echo ============================================================
echo   Android CVE Analizi - Web Dashboard Yerel Sunucusu
echo ============================================================
echo.
echo [1] Yerel sunucu http://localhost:8080 portunda baslatiliyor...
echo [2] Varsayilan tarayicida arayuz aciliyor...
echo.
echo Not: Sunucuyu kapatmak icin bu pencereyi kapatabilir veya 
echo      pencere seciliyken Ctrl + C tus kombinasyonunu kullanabilirsiniz.
echo ============================================================
echo.

:: Tarayicida dashboard'u ac
start http://localhost:8080/web/index.html

:: Python http sunucusunu baslat
python -m http.server 8080
