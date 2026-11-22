# Phase 10 — Release Build & Signing Key Generation Guide

**Application:** StandUp: Habit Alarm & Tracker (`com.growthstreaks.standup`)  
**Package:** `com.growthstreaks.standup`  
**Target Marketplace:** PhonePe Appstore (Indus)

---

## 1. Owner Action Required: Keystore Creation
Because signing keys represent the cryptographic legal identity of the developer, the owner must generate their release keystore locally on their personal computer.

### The Exact PowerShell Command:
```powershell
keytool -genkeypair -v `
  -keystore standup-release.keystore `
  -alias standup-release-key `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storetype PKCS12
```

### Guidance for Prompts:
- **Keystore Password:** Choose a strong password and save it in a password manager.
- **First and Last Name:** Saksham Rajpoot (must match PAN/Bank account on developer portal).
- **Organizational Unit:** StandUp Mobile
- **Organization:** StandUp
- **City / Locality:** Enter your city
- **State / Province:** Enter your state
- **Country Code:** `IN`
- **Confirmation:** Enter `yes`

---

## 2. Signing the StandUp Production APK
Using the Android SDK `apksigner` tool:

```powershell
# Step A: Align the binary
zipalign -v -p 4 "StandUp_v3_Release.apk" "StandUp_Aligned.apk"

# Step B: Sign the binary with V2 and V3 signatures
apksigner sign `
  --ks standup-release.keystore `
  --ks-key-alias standup-release-key `
  --in "StandUp_Aligned.apk" `
  --out "StandUp_PhonePe_Production.apk"

# Step C: Verify signature
apksigner verify --verbose --print-certs "StandUp_PhonePe_Production.apk"
```

---

## 3. Production Verification Checklist
- [x] Package Name: `com.growthstreaks.standup`
- [x] Target SDK: API 36 (Android 16 readiness)
- [x] Min SDK: API 24 (Android 7.0+, covering ~96%+ of Indian active smartphones)
- [x] Architectures: `arm64-v8a`, `armeabi-v7a`, `x86_64`, `x86`
- [x] AdMob App ID: `ca-app-pub-9675414045566238~1521257692` verified in manifest
- [x] 21 Custom ringtones bundled in `res/raw/`
- [x] No debug flags or sensitive credentials embedded in client code
