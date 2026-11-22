# Google Play Store (Optional) — Submission Plan & Requirements
**Document Version:** 1.0.0  
**Classification:** OPTIONAL / OWNER APPROVAL REQUIRED  
**Official Portal:** [play.google.com/console](https://play.google.com/console)  
**Application:** StandUp — Discipline & Habit Alarm OS (`com.growthstreaks.standup`)

---

## 1. Executive Notice: Optional Store Status

> [!IMPORTANT]
> Google Play Store distribution is **strictly optional** and is **held pending explicit owner decision and budget approval**.
> No registration, fee payment, or submission will be initiated unless the owner explicitly issues authorization.

---

## 2. Financial & Account Requirements

1. **One-Time Registration Fee:** **US$25** (Payable once via credit or international debit card directly to Google LLC). No recurring annual publishing fee.
2. **Account Classification:** Personal (Individual) vs Organization. For individual ownership, an individual developer account is standard.
3. **Identity Verification (Google Play):**
   - Government-issued photo ID (Passport / Driving Licence / Voter ID / Aadhaar).
   - Residential address verification (Utility bill, bank statement matching developer legal name).
   - Phone number and email verification.

---

## 3. The 12-Tester / 14-Day Closed Testing Requirement

Under Google Play policies effective for all personal developer accounts created after **November 13, 2023**:
- Before an individual developer can apply for production distribution, the app **must run in a Closed Testing track**.
- **Requirement:** At least **12 distinct Google accounts** must opt in as testers and remain opted in for at least **14 consecutive calendar days**.
- Testers must install and physically run the application.
- After 14 days, the developer must submit answers to Google's production access questionnaire explaining testing feedback, bug fixes, and release readiness.

*Impact on StandUp:*  
This requirement introduces an operational delay of at least 2–3 weeks. Therefore, launching immediately on **PhonePe Appstore** and **Samsung Galaxy Store** (which have zero closed-testing restrictions) is the faster, frictionless path to market.

---

## 4. Technical Submission Prerequisites for Google Play

| Parameter | Google Play Mandate | StandUp Current Status |
| :--- | :--- | :--- |
| **Package Format** | **Android App Bundle (`.aab`) mandatory** for new apps | Currently built as APK; AAB generation workflow ready |
| **Target SDK** | Android 16 (API 36) / Android 15 (API 35) | **Target API 36 (Android 16)** — Fully compliant |
| **Play App Signing** | Google manages production signing key; developer uploads with upload key | Upload key generation required |
| **Data Safety Section** | Mandatory declaration of data collected, shared, and encrypted | Detailed breakdown in `DATA_SAFETY_AND_PERMISSIONS_MATRIX.md` |
| **Privacy Policy** | Accessible URL hosted on a public domain | Draft ready in `PRIVACY_POLICY_DRAFT.md` |
| **Deceptive Ads Declaration** | Ads must comply with Families / Better Ads standards | 100% compliant; ads locked during alarms |
| **Exact Alarm Declaration** | Must justify `USE_EXACT_ALARM` as core app function | Alarms are core functionality (Eligible under Alarm category) |

---

## 5. Google Play AAB Generation Procedure (When Approved)

When the owner decides to pursue Google Play release:
1. Trigger GitHub Actions with `build_type: bundle`:
   - Command: `cd android && ./gradlew bundleRelease`
   - Output: `android/app/build/outputs/bundle/release/app-release.aab`
2. Configure Google Play App Signing in the Google Play Console.
3. Upload the generated `.aab` file to the Closed Testing track.
4. Distribute opt-in links to 12 trusted physical device testers.
5. Complete the 14-day testing period and apply for production rollout.
