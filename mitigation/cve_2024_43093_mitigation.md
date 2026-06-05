# CVE-2024-43093 (Android ExternalStorageProvider Logical File Access Bypass) Mitigation Guide

## 🔍 Root Cause Analysis
The vulnerability stems from the `ExternalStorageProvider` class failing to normalize paths before performing access-control validations. An attacker could register or access folder structures with non-normalized Unicode characters (e.g. using special characters that resolve to standard directories after internal parsing), bypassing security policies on restricted target folders (such as `/Android/data` or `/Android/obb`).

---

## 🛠️ Code-Level Patch (Android Open Source Project / AOSP)

To prevent this logical bypass, string values used for path checks must be NFKC-normalized before comparing them to target policies.

```java
import java.text.Normalizer;

public class ExternalStorageProvider extends DocumentsProvider {
    
    private boolean isRestrictedPath(String path) {
        if (path == null) return false;
        
        // Normalize the path using NFKC (Normalization Form KC) to resolve any hidden bypass characters
        String normalizedPath = Normalizer.normalize(path, Normalizer.Form.NFKC);
        
        // Check normalized path against policy rules
        return normalizedPath.startsWith("/Android/data") || normalizedPath.startsWith("/Android/obb");
    }
}
```

---

## 🛡️ Administrative Mitigations
1. **Apply Security Updates:** Ensure all managed devices are updated to the November 2024 security patch level or later.
2. **Restrict ADB File Access:** Temporarily disable ADB debugging access (`Developer Options -> USB Debugging`) on production devices to prevent local command exploitation.
3. **MAM (Mobile Application Management) Policies:** Use MAM to restrict applications from reading shared external storage folders where user data is cached.
