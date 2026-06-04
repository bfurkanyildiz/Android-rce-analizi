# Alpine tabanlı hafif Python imajı
FROM python:3.11-alpine

# Android CLI araçlarını (ADB dahil) ve gerekli bağımlılıkları kur
RUN apk add --no-cache android-tools bash

# Çalışma dizinini ayarla
WORKDIR /app

# Uygulama kodunu kopyala
COPY src/ /app/src/

# Çevre değişkeni varsayılanlarını ayarla
ENV PYTHONUNBUFFERED=1

# Başlangıç komutu: detector scriptini çalıştır
CMD ["python", "src/detector.py"]
