# Samsung Galaxy Store — Submission Plan & Requirements Checklist
**Document Version:** 1.0.0  
**Target Portal:** Samsung Seller Portal ([seller.samsungapps.com](https://seller.samsungapps.com/))  
**Developer Portal Guide:** [developer.samsung.com/galaxy-store](https://developer.samsung.com/galaxy-store)  
**Application:** StandUp — Discipline & Habit Alarm OS (`com.growthstreaks.standup`)

---

## 1. Samsung Seller Portal Account Registration

Samsung offers two seller tracks: **Private Seller** (Individual) and **Corporate Seller** (Company). For an independent owner launch, the **Private Seller** track is appropriate.

### Registration Requirements (Owner-Executed)
1. **Samsung Account:** The owner must sign in using a primary Samsung Account.
2. **Seller Portal Enrollment:**
   - Country / Region selection: India
   - Legal Name of Applicant: *OWNER INPUT REQUIRED*
   - Contact Email: *OWNER INPUT REQUIRED*
   - Official Phone Number: *OWNER INPUT REQUIRED*
   - Government ID Verification: Scanned copy of National ID / Passport / Driving Licence (Upload required by Samsung for commercial distribution).
3. **Commercial Seller Conversion:**
   - Even though StandUp is free to download, distributing applications containing advertisements or in-app services requires Commercial Seller verification.
   - Bank Account Information: Account holder name must match the registered seller legal name exactly.
   - Proof of Bank Account / Voided Cheque or Bank Statement.

---

## 2. Technical Submission Specifications

| Parameter | Samsung Requirement | StandUp Status |
| :--- | :--- | :--- |
| **Package Format** | APK or AAB | APK currently verified; AAB optional |
| **Signing Key Rules** | Must be signed with a valid, non-expired certificate; consistent across updates | Production RSA keystore must be generated prior to final upload |
| **64-bit Architecture** | Mandatory support for 64-bit (`arm64-v8a`) | **Verified (`arm64-v8a` included)** |
| **Target SDK** | Minimum API 34+ | **API 36 (Android 16)** — Compliant |
| **Supported Devices** | Samsung Galaxy smartphones, tablets | All Galaxy phone series running Android 7.0+ |
| **Binary Size** | Max 2 GB | **171.26 MB APK (92.6 MB compressed)** |

---

## 3. Samsung Galaxy Store Listing Specifications

### A. Metadata Limits
- **Application Title:** Maximum 50 characters
  - *Proposed:* `StandUp: Habit Alarm & Fitness Routine OS` (42 chars)
- **Short Description:** Maximum 100 characters
  - *Proposed:* `Smart habit alarm clock with face verification, 24/7 background step pedometer & streaks.` (92 chars)
- **Long Description:** Maximum 4,000 characters
- **Category:** Lifestyle / Productivity / Health & Fitness
- **Age Rating:** 4+ (General Audience)
- **Language:** English (Default) + optional multi-language localization
- **Price:** Free

### B. Visual Asset Specifications
- **App Icon:** 512 x 512 px, 32-bit PNG, RGB, max 1MB.
- **Screenshots:** Minimum 4, maximum 8 screenshots.
  - Recommended dimensions: 1080 x 1920 px or 1080 x 2400 px (9:16 portrait).
  - Genuine mobile device screenshots from the owner's phone fulfill Samsung's authenticity guidelines.
- **Header Image / Banner (Optional):** 1024 x 500 px PNG/JPEG.

---

## 4. Samsung-Specific Policy & Permission Compliance

Samsung's certification team conducts automated and human testing on physical Galaxy devices (Galaxy S, A, and M series). Particular scrutiny is applied to:

1. **Lock-Screen & Full-Screen Behavior:**
   - StandUp's lock-screen alarm triggers `StandUpAlarmActivity` with `showWhenLocked="true"` and `turnScreenOn="true"`.
   - *Samsung Policy Compliance:* Samsung permits full-screen lock-screen takeovers **only for telephony and alarm clock applications**. Because StandUp is explicitly an alarm clock, this is permissible. Clear instructions must be provided to the Samsung QA reviewer.
2. **Advertising Integrity:**
   - Samsung strictly forbids advertisements that obscure system buttons, launch unexpectedly without user trigger, or display when the app is minimized.
   - *StandUp Architecture:* Ads are 100% disabled during alarm ringing and camera verification. Rewarded ads are strictly opt-in upon routine completion. App Open ads have a 4-hour cooldown. This fully satisfies Samsung's ad guidelines.
3. **Battery & Background Operation:**
   - Samsung's One UI incorporates aggressive background task sleeping ("App power management").
   - StandUp directs the user to system battery settings via a clean button in Settings, without deceptive popups or forced system manipulation.

---

## 5. Reviewer Guidance Notes (For Samsung Submission Form)

```text
REVIEWER TESTING INSTRUCTIONS:
Application: StandUp — Discipline & Habit Alarm OS
Purpose: Alarm Clock, Routine Manager, and Fitness Step Tracker.

How to Test Core Functionality:
1. Alarms: Open the "Alarm" tab (My Routines). A pre-configured routine "Wakebup" includes a yellow "📸 Test Alarm" button. Tap this button to immediately trigger the native alarm sequence, sound playback, and lock-screen verification without waiting for a scheduled time.
2. Face Verification: When the alarm rings, tap "Verify Wake Up". The front camera will open for a 30-second upright standing posture/face check. Once verified, the alarm disarms.
3. Step Counter: Open the "Fit" tab. Daily steps are captured via Android hardware sensors and Google Play Services local recording. No external account or login is required.
4. Ads: Monetization utilizes Google AdMob. All ads are safely disabled during active alarms and camera verification.
```
