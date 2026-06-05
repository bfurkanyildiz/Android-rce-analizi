import unittest
import os
import sys

# Test edilecek modülü içe aktarabilmek için path'e ekle
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.detector import get_keywords, process_log_line

class TestDetector(unittest.TestCase):
    def setUp(self):
        # Test öncesi ortam değişkenlerini temizle
        if "DETECTION_KEYWORDS" in os.environ:
            self.orig_keywords = os.environ["DETECTION_KEYWORDS"]
            del os.environ["DETECTION_KEYWORDS"]
        else:
            self.orig_keywords = None

    def tearDown(self):
        # Test sonrası ortam değişkenlerini eski haline getir
        if self.orig_keywords is not None:
            os.environ["DETECTION_KEYWORDS"] = self.orig_keywords
        elif "DETECTION_KEYWORDS" in os.environ:
            del os.environ["DETECTION_KEYWORDS"]

    def test_get_keywords_default(self):
        # Varsayılan anahtar kelimeleri test et
        keywords = get_keywords()
        self.assertIn("SIGSEGV", keywords)
        self.assertIn("SIGABRT", keywords)
        self.assertIn("died", keywords)

    def test_get_keywords_custom(self):
        # Özel anahtar kelimeleri test et
        os.environ["DETECTION_KEYWORDS"] = "TEST_ALARM,DEBUG_ERR"
        keywords = get_keywords()
        self.assertEqual(keywords, ["TEST_ALARM", "DEBUG_ERR"])

    def test_process_log_line(self):
        # process_log_line fonksiyonunun hata vermeden çalıştığını doğrula
        keywords = ["SIGSEGV", "SIGABRT"]
        # Normal satır denemesi
        try:
            process_log_line("I ActivityManager: normal log message", keywords)
            # Alarm satırı denemesi
            process_log_line("W AndroidRuntime: SIGSEGV in run-as process", keywords)
        except Exception as e:
            self.fail(f"process_log_line raised an exception: {e}")

if __name__ == '__main__':
    unittest.main()
