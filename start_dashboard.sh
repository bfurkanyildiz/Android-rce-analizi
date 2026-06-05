#!/bin/bash
# Android CVE Analizi - Web Dashboard Baslatici

echo "============================================================"
echo "  Android CVE Analizi - Web Dashboard Yerel Sunucusu"
echo "============================================================"
echo ""

# Eski asili kalmis port 8080 surecleri varsa otomatik temizle (Port Cakismalarini Onlemek Icin)
if command -v lsof >/dev/null 2>&1; then
    lsof -ti:8080 | xargs kill -9 >/dev/null 2>&1 || true
fi

echo "[1] Yerel sunucu http://localhost:8080 portunda baslatiliyor..."
echo "[2] Varsayilan tarayicida arayuz aciliyor..."
echo ""
echo "Not: Sunucuyu kapatmak icin bu terminali kapatabilir veya"
echo "     Ctrl + C tus kombinasyonunu kullanabilirsiniz."
echo "============================================================"
echo ""

# Tarayicida dashboard'u ac (OS'e gore dogru komutu sec)
if [ "$(uname)" == "Darwin" ]; then
    open http://localhost:8080/web/index.html
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    xdg-open http://localhost:8080/web/index.html
else
    echo "Lutfen tarayicinizdan manuel olarak acin: http://localhost:8080/web/index.html"
fi

# Python http sunucusunu baslat
python3 -m http.server 8080 || python -m http.server 8080
