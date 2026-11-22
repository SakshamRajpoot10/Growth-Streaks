# PhonePe Appstore (Indus) — Submission Plan & Requirements Checklist
**Document Version:** 1.0.0  
**Target Portal:** [developer.phonepeappstore.com](https://developer.phonepeappstore.com/)  
**Application:** StandUp — Discipline & Habit Alarm OS  
**Application Package ID:** `com.growthstreaks.standup`

---

## 1. Account Creation & Developer Verification Checklist

PhonePe Appstore requires individual Indian developers to complete an identity verification workflow. All steps below must be performed directly by the owner.

### Owner-Supplied Information Checklist
- [ ] **Account Type:** Individual Developer
- [ ] **Full Legal Name:** (As per PAN card) — *OWNER INPUT REQUIRED*
- [ ] **Permanent Account Number (PAN):** Indian 10-digit alphanumeric PAN — *OWNER INPUT REQUIRED*
- [ ] **Mobile Number:** Active Indian mobile number capable of receiving SMS OTP — *OWNER INPUT REQUIRED*
- [ ] **Email Address:** Developer email address for notifications — *OWNER INPUT REQUIRED*
- [ ] **Residential Address:** Complete address including PIN code — *OWNER INPUT REQUIRED*
- [ ] **Bank Account Details:** Account number, IFSC code, account holder name (for verification) — *OWNER INPUT REQUIRED*
- [ ] **Public Developer / Seller Name:** Brand or individual name displayed to users on the store listing — *OWNER INPUT REQUIRED*

---

## 2. Technical Submission Specifications

| Parameter | Specification | StandUp Current Status | Evidence / Notes |
| :--- | :--- | :--- | :--- |
| **Package Format** | APK, AAB, or APKS | APK (`StandUp-Release-APK`) | Verified: 171.26 MB uncompressed, 92.6 MB zip |
| **Package Name** | Must be unique, permanent | `com.growthstreaks.standup` | Verified in AndroidManifest & badging |
| **Target SDK** | Minimum API 34 | **API 36 (Android 16)** | Verified via `aapt dump badging` |
| **Minimum SDK** | Supported Android OS | **API 24 (Android 7.0+)** | Reaches ~96%+ of active Android devices in India |
| **Architecture** | 64-bit support mandatory | **`arm64-v8a` + `x86_64` included** | Verified via binary ELF inspection |
| **Version Code** | Integer > 0 | `versionCode 1` | Verified in build output |
| **Version Name** | Semantic version string | `1.0.0` | Verified in build output |

---

## 3. Store Listing Assets & Text Specifications

### A. Textual Content Limits
- **App Title:** Maximum 30 characters
  - *Proposed:* `StandUp - Habit Alarm OS` (24 chars)
- **Short Description:** Maximum 200 characters
  - *Proposed:* `Wake up on time with face-verification alarms, track daily steps 24/7 without extra battery drain, and build unbreakable habit streaks with a responsive calendar.` (169 chars)
- **Long Description:** Maximum 4,000 characters (See `STORE_LISTING_COPY_DRAFTS.md`)
- **Primary Category:** Productivity / Health & Fitness
- **Secondary Category:** Lifestyle / Tools
- **Content Rating:** Everyone / 3+ (Contains no violence, gambling, or adult content)

### B. Graphic Asset Specifications
- **App Icon:** 512 x 512 px, 32-bit PNG, max 1MB, no transparency in background.
  - *Source:* `./assets/images/icon.png` (High-resolution icon ready).
- **Screenshots:** Minimum 2, maximum 8 images.
  - *Format:* PNG or JPEG, aspect ratio 16:9 or 9:16 (Portrait: 1080 x 2400 px or 1080 x 1920 px).
  - *Source:* The 6 genuine physical device screenshots uploaded by the owner (See `STORE_SCREENSHOTS_AND_GRAPHICS_CHECKLIST.md`).
- **Feature Graphic / Banner (Optional/Recommended):** 1024 x 500 px JPEG/PNG.

---

## 4. Policy Declarations & Permissions Review

During submission on the PhonePe Developer Portal, declarations must be completed for sensitive Android permissions:

1. **`USE_FULL_SCREEN_INTENT` & `USE_EXACT_ALARM`:**
   - *Justification:* StandUp is an alarm clock and routine scheduling application. When an alarm time arrives while the screen is locked, Android requires these permissions to immediately present the full-screen alarm screen so the user can wake up and complete their morning verification.
2. **`CAMERA`:**
   - *Justification:* Used strictly for the 30-second standing face verification wake-up check. Image processing occurs ephemerally on-device; no images or biometric templates are stored or transmitted.
3. **`ACTIVITY_RECOGNITION` & `FOREGROUND_SERVICE_HEALTH`:**
   - *Justification:* Used to collect daily walking steps through hardware sensors and Google Play Services local recording without displaying an intrusive permanent notification.
4. **`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`:**
   - *Justification:* Necessary to prevent OEM battery-killer subsystems from killing scheduled alarms during deep overnight Doze mode.

---

## 5. Step-by-Step Submission Procedure

1. **Step 1:** Owner logs into [developer.phonepeappstore.com](https://developer.phonepeappstore.com/) with phone number and OTP.
2. **Step 2:** Complete individual KYC verification.
3. **Step 3:** Click **"Add New App"** and enter Package Name `com.growthstreaks.standup`.
4. **Step 4:** Upload the verified production APK.
5. **Step 5:** Upload 512x512 icon and the 6 physical screenshots.
6. **Step 6:** Paste approved Title, Short Description, Long Description, and Privacy Policy URL.
7. **Step 7:** Complete the content rating questionnaire (select Free, Ad-Supported).
8. **Step 8:** Provide reviewer notes and test credentials (no login required for StandUp; instructions explaining alarm test button provided).
9. **Step 9:** Owner reviews summary and clicks **"Submit for Review"**.
