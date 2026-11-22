# StandUp — Release Build & Signing Forensic Audit Report
**Document Version:** 1.0.0  
**Verification Target:** StandUp Production APK & GitHub Actions Build Run  
**Authoritative Binary Path:** `C:\Users\315082\Downloads\StandUp-Release-APK\app-release.apk`  
**GitHub Actions Run ID:** `44774920498` ([Live GitHub Run](https://github.com/SakshamRajpoot10/Growth-Streaks/actions/runs/44774920498))  
**Build Source Commit:** `0c2ea525002bce96588e6dcde07511e5670b6dfa` on branch `main`

---

## 1. Cryptographic Hashes & File Attributes

| Forensic Parameter | Verified Value | Verification Method |
| :--- | :--- | :--- |
| **File Name** | `app-release.apk` | Uncompressed from `StandUp-Release-APK.zip` |
| **File Size (Uncompressed)** | **171,261,898 bytes** (~163.33 MB) | Windows File System API (`Length`) |
| **Artifact Size (GitHub Zip)** | **92,664,331 bytes** (~88.37 MB) | GitHub Actions API (`size_in_bytes`) |
| **SHA-256 Checksum** | `73EF7287FF3120EE296B26ED56EE89FD258D222597B2C1C83338AAD37939CC39` | PowerShell `Get-FileHash -Algorithm SHA256` |
| **MD5 Checksum** | `A692FEA0304EF691A94130CCA562DCFE` | PowerShell `Get-FileHash -Algorithm MD5` |
| **Build Status** | **COMPLETED / SUCCESS** | GitHub Actions Run Status |

---

## 2. Package Badging & Technical Specifications (AAPT Dump)

Executed via Android SDK `aapt.exe dump badging`:
- **Package Name:** `com.growthstreaks.standup`
- **Version Code:** `1`
- **Version Name:** `1.0.0`
- **Minimum SDK:** `24` (Android 7.0 Nougat)
- **Target SDK:** `36` (Android 16) — Fully compliant with modern store requirements.
- **Compile SDK:** `37`
- **Application Label:** `StandUp`
- **Launchable Activity:** `com.growthstreaks.standup.MainActivity`
- **Native CPU Architectures (ABIs):** `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64` (Full 64-bit and 32-bit universal coverage).
- **Embedded Audio Assets:** 42 compiled audio resource entries (including all 21 raw alarm ringtones).

---

## 3. Signing Certificate Audit & Security Findings

### Current Keystore Properties:
Inspection via Java `keytool -list -v -keystore android/app/debug.keystore`:
- **Keystore Type:** JKS
- **Key Alias:** `androiddebugkey`
- **Owner / Issuer:** `CN=Android Debug, OU=Android, O=Unknown, L=Unknown, ST=Unknown, C=US`
- **Signature Algorithm:** `SHA1withRSA` (weak)
- **Validity:** Valid until May 1, 2052
- **SHA-256 Certificate Fingerprint:** `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`

### Critical Security Finding & Remediation:
> [!WARNING]
> While the debug signing key is perfect for physical device testing on the owner's phone, **commercial application stores (Samsung Galaxy Store & Google Play) will reject binaries signed with a generic debug certificate (`CN=Android Debug`)**.
> 
> Furthermore, the debug keystore uses `SHA1withRSA`, which is flagged by store scanners as a security vulnerability.
> 
> **Required Action Before Final Store Submission:**  
> A dedicated, secure production release keystore (`standup-release.keystore`) must be generated using `SHA256withRSA` with 2048-bit or 4096-bit key length. The owner must keep this keystore and its passwords safe, as it will be required to sign all future updates.

---

## 4. Production Keystore Generation Procedure (Draft Command)

When ready for the packaging stage, the owner can generate their official release keystore using Java `keytool`:

```bash
keytool -genkeypair -v -keystore standup-release.keystore -alias standup-key -keyalg RSA -keysize 2048 -validity 10000 -storetype PKCS12
```

This ensures a modern, secure PKCS12 keystore with SHA-256 signatures, fulfilling all Samsung, PhonePe, and Google Play commercial standards.
