import os
import sys
import subprocess
import json
from datetime import datetime

# ANSI renk kodları (Terminal çıktısını görselleştirmek ve premium kılmak için)
RED = "\033[91m"
YELLOW = "\033[93m"
GREEN = "\033[92m"
BLUE = "\033[94m"
BOLD = "\033[1m"
RESET = "\033[0m"

def load_env():
    """Çevre değişkenlerini .env dosyasından okur (ek kütüphane bağımlılığı olmadan)."""
    env_path = ".env"
    if not os.path.exists(env_path):
        # .env bulunamazsa .env.example dosyasını dene
        env_path = ".env.example"
        
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

def get_keywords():
    """Taranacak kelimeleri çevre değişkenlerinden veya varsayılan değerlerden alır."""
    kw_str = os.getenv("DETECTION_KEYWORDS", "SIGSEGV,SIGABRT,died,has died")
    return [kw.strip() for kw in kw_str.split(",") if kw.strip()]

def print_header(keywords):
    print(f"{BLUE}{BOLD}=================================================={RESET}")
    print(f"{BLUE}{BOLD}    Android CVE-2024-0044 Logcat Saldiri Tespit    {RESET}")
    print(f"{BLUE}{BOLD}=================================================={RESET}")
    print(f"{GREEN}[*] Baslangic Zamani:{RESET} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{GREEN}[*] Izlenen Anahtar Kelimeler:{RESET} {', '.join(keywords)}")
    print(f"{GREEN}[*] Durum:{RESET} Log akisi dinleniyor...\n")

def save_detection_to_json(keyword, log_line):
    """Tespit edilen alarmi reports/detection_results.json dosyasina kaydeder."""
    report_dir = "reports"
    report_file = os.path.join(report_dir, "detection_results.json")
    os.makedirs(report_dir, exist_ok=True)
    
    detection = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "keyword": keyword,
        "log_line": log_line.strip()
    }
    
    detections = []
    if os.path.exists(report_file):
        try:
            with open(report_file, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    detections = json.loads(content)
        except Exception:
            pass
            
    detections.append(detection)
    try:
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(detections, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"[!] Log yazma hatasi: {e}")

def process_log_line(line, keywords):
    """Her log satirini analiz edip alarm durumlarini tespit eder."""
    if not line:
        return
    
    line_lower = line.lower()
    for kw in keywords:
        if kw.lower() in line_lower:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"{RED}{BOLD}[TEHLIKE - ALARM {timestamp}]{RESET} {kw} tespiti yapildi!")
            print(f"+-- Log Satiri: {YELLOW}{line.strip()}{RESET}\n")
            save_detection_to_json(kw, line)

def main():
    load_env()
    keywords = get_keywords()
    print_header(keywords)

    adb_host = os.getenv("ADB_HOST", "127.0.0.1")
    emulator_port = os.getenv("EMULATOR_PORT", "5555")
    log_source = os.getenv("LOGCAT_SOURCE_PATH", "")

    # 1. Dosya girdisi kontrolü (Eger bir log dosyasi yapilandirildiysa)
    if log_source and os.path.exists(log_source):
        print(f"{BLUE}[INFO] Log kaynagi olarak dosya okunuyor: {log_source}{RESET}")
        try:
            with open(log_source, "r", encoding="utf-8", errors="ignore") as f:
                # Canli takip (tail -f benzeri)
                f.seek(0, 2) # Dosya sonuna git
                while True:
                    line = f.readline()
                    if not line:
                        continue
                    process_log_line(line, keywords)
        except KeyboardInterrupt:
            print(f"\n{BLUE}[INFO] Tespit motoru kapatiliyor.{RESET}")
            sys.exit(0)

    # 2. Standart girdi (stdin) kontrolü (örn. adb logcat | python detector.py)
    elif not sys.stdin.isatty():
        print(f"{BLUE}[INFO] Log girdisi boru hatti (pipeline / stdin) üzerinden okunuyor...{RESET}")
        try:
            for line in sys.stdin:
                process_log_line(line, keywords)
        except KeyboardInterrupt:
            print(f"\n{BLUE}[INFO] Tespit motoru kapatiliyor.{RESET}")
            sys.exit(0)

    # 3. Canli ADB logcat baglantisi denemesi
    else:
        print(f"{BLUE}[INFO] Canli ADB baglantisi kuruluyor ({adb_host}:{emulator_port})...{RESET}")
        
        # ADB'yi belirtilen cihaza bagla
        adb_target = f"{adb_host}:{emulator_port}"
        connect_cmd = ["adb", "connect", adb_target]
        
        try:
            subprocess.run(connect_cmd, capture_output=True, text=True, timeout=5)
            
            # Logcat akisini baslat (Sadece anahtar kelimeleri yakalamak için logcat ciktisini okuyacagiz)
            logcat_cmd = ["adb", "-s", adb_target, "logcat", "-v", "time"]
            print(f"{GREEN}[SUCCESS] ADB Logcat akisi baslatildi: {' '.join(logcat_cmd)}{RESET}\n")
            
            process = subprocess.Popen(logcat_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, errors="ignore")
            
            while True:
                line = process.stdout.readline()
                if not line and process.poll() is not None:
                    break
                process_log_line(line, keywords)
                
        except (subprocess.SubprocessError, FileNotFoundError) as e:
            print(f"{RED}[HATA] ADB baglantisi veya logcat baslatilamadi ({str(e)}).{RESET}")
            print(f"{YELLOW}[IPUCU] Standart girdi ile calistirmak icin şu komutu deneyin:{RESET}")
            print(f"       adb logcat | python src/detector.py\n")
            print(f"{BLUE}[INFO] Manuel girdiler icin bekleniyor (Terminalden satir girin veya Ctrl+C ile cikin):{RESET}")
            try:
                while True:
                    line = input()
                    process_log_line(line, keywords)
            except KeyboardInterrupt:
                print(f"\n{BLUE}[INFO] Tespit motoru kapatiliyor.{RESET}")
                sys.exit(0)
        except KeyboardInterrupt:
            print(f"\n{BLUE}[INFO] Tespit motoru kapatiliyor.{RESET}")
            sys.exit(0)

if __name__ == "__main__":
    main()
