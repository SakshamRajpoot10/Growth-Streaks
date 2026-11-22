# Store Compliance & Commercial Matrix Comparison
**Document Version:** 1.0.0  
**Target Stores:** PhonePe Appstore (Indus), Samsung Galaxy Store, Google Play Store  
**Application:** StandUp — Discipline & Habit Alarm OS (`com.growthstreaks.standup`)

---

## 1. Comprehensive Store Comparison Table

| Feature / Requirement | PhonePe Appstore (formerly Indus) | Samsung Galaxy Store | Google Play Store (Optional) |
| :--- | :--- | :--- | :--- |
| **Official Developer Portal** | [developer.phonepeappstore.com](https://developer.phonepeappstore.com/) | [seller.samsungapps.com](https://seller.samsungapps.com/) | [play.google.com/console](https://play.google.com/console) |
| **Registration / Account Fee** | **₹0 (Free for Year 1)** | **US$0 (100% Free, No Annual Fee)** | **US$25 (One-time registration fee)** |
| **Annual Maintenance Fee** | Stated as nominal in future; currently free | **₹0 (None)** | **None** |
| **In-App Billing Commission** | **0% on third-party payment gateways** | Standard 30% (applies only if using Samsung IAP) | 15% on first $1M/year under Google Play Billing |
| **Supported Package Formats** | APK, AAB, APKS | APK, AAB | AAB (Mandatory for new apps) |
| **64-bit Architecture** | Required (`arm64-v8a`) | Required (`arm64-v8a`) | Required (`arm64-v8a`) |
| **Target SDK Requirement** | Android 14+ (API 34+) recommended | Android 14+ (API 34+) / 15 (API 35) | Android 16 (API 36) / Android 15 (API 35) |
| **StandUp Current Target SDK** | **API 36 (Android 16)** — Fully Compliant | **API 36 (Android 16)** — Fully Compliant | **API 36 (Android 16)** — Fully Compliant |
| **Mandatory Closed Testing** | **None (Direct production submission)** | **None (Direct QA certification)** | **12 testers for 14 days minimum (Mandatory for personal accounts)** |
| **Identity Verification (India)** | Individual PAN, Mobile OTP, Indian Bank Account | Government ID (Passport / National ID / Driving Licence), Bank account | Government ID, Phone verification, Credit card |
| **AdMob Compatibility** | Not on AdMob's third-party supported store list | **Fully Supported by Google AdMob** | **Fully Supported by Google AdMob** |
| **App Title Character Limit** | Up to 30 characters | Up to 50 characters | Up to 30 characters |
| **Short Description Limit** | Up to 200 characters | Up to 100 characters | Up to 80 characters |
| **Long Description Limit** | Up to 4,000 characters | Up to 4,000 characters | Up to 4,000 characters |
| **Screenshot Requirements** | Minimum 2, maximum 8 (JPEG/PNG) | Minimum 4, maximum 8 (16:9 or 9:16) | Minimum 2, maximum 8 (16:9 or 9:16) |
| **App Icon Specifications** | 512 x 512 px PNG (32-bit, max 1MB) | 512 x 512 px PNG (32-bit, max 1MB) | 512 x 512 px PNG (32-bit, max 1MB) |
| **Review Turnaround Time** | Typically 24–72 hours | Typically 2–5 business days | Typically 3–7 business days (post-testing) |
| **Current Launch Readiness** | **READY FOR OWNER REGISTRATION** | **READY FOR OWNER REGISTRATION** | **CONDITIONAL UPON OWNER APPROVAL** |

---

## 2. Strategic Insights on Commercial Compliance

### A. PhonePe Appstore Advantage
1. **Domestic User Base:** Pre-loaded on millions of Indian devices (OEM partnerships with Lava, Micromax, etc.) and available to all PhonePe users.
2. **Zero Commercial Toll:** 0% commission on any external payment integrations.
3. **No Closed-Testing Hurdle:** You can publish directly without organizing 12 physical testers for two continuous weeks.

### B. Samsung Galaxy Store Advantage
1. **Global Footprint:** Default store on all Samsung devices across 180+ countries.
2. **AdMob Critical Path:** Because Samsung Galaxy Store is officially supported by Google AdMob, linking StandUp here ensures that AdMob serves 100% fill-rate ads with active eCPM optimization.
3. **Completely Free:** No registration fee or recurring developer charges.

### C. Google Play Store Considerations
1. While Google Play is the largest Android market, its mandatory policy requiring **12 opted-in testers for 14 consecutive days** for new personal developer accounts created after November 2023 represents an operational barrier.
2. Recommendation: Launch on PhonePe and Samsung first. Once the app has verified live physical usage and positive ratings, consider the optional Google Play registration.
