# Phase 11 — PhonePe Appstore Console Submission Walkthrough

**Portal:** [developer.phonepeappstore.com](https://developer.phonepeappstore.com/)  
**Account Model:** Individual Indian Developer  
**Status:** OWNER ACTION REQUIRED for Portal KYC & Direct Submission

This guide provides the exact click-by-click instructions for submitting StandUp on the PhonePe Developer Portal.

---

## Step 1: Sign In & KYC Verification
1. Navigate to [developer.phonepeappstore.com](https://developer.phonepeappstore.com/).
2. Click **Sign In** and authenticate using your Indian mobile phone number and SMS OTP.
3. Select **"Individual Developer"** as your account type.
4. Complete the 1-time KYC verification:
   - Enter your Legal Name (matching your PAN card).
   - Enter your 10-digit PAN number.
   - Enter your bank account details (Account number, IFSC code) for payout/verification.
   - Set your Public Developer Display Name (e.g. `Saksham Rajpoot`).

---

## Step 2: Add New Application
1. On your Developer Dashboard, click the prominent red/blue **"Add New App"** button.
2. In the Package Identifier field, enter:
   ```text
   com.growthstreaks.standup
   ```
3. In the App Name field, copy and paste from `StandUp_PhonePe_Launch_Kit/metadata/METADATA_EN.txt`:
   ```text
   StandUp: Habit Alarm & Tracker
   ```
4. Select **Default Language:** `English (India)`.
5. Select **Primary Category:** `Productivity`.
6. Select **Secondary Category:** `Health & Fitness`.

---

## Step 3: Upload Application Binary
1. Click the **Binary / APK** tab on the left navigation menu.
2. Drag and drop your signed production APK (`StandUp_PhonePe_Production.apk` or `StandUp_v3_Release.apk`).
3. The PhonePe portal will automatically parse the package:
   - It will verify `com.growthstreaks.standup`.
   - It will verify `Version Code: 1` and `Version Name: 1.0.0`.
   - It will verify targetSdk 36 and minSdk 24.

---

## Step 4: Upload Store Graphics & Screenshots
1. Click the **App Graphics / Listing** tab.
2. **App Icon:**
   - Upload `StandUp_PhonePe_Launch_Kit/store_assets/standup_icon_512x512.png`.
3. **Phone Screenshots:**
   - Upload the 6 screenshots from `StandUp_PhonePe_Launch_Kit/screenshots/` in numerical order:
     - 1: `01_dashboard_accountability.jpg`
     - 2: `02_routines_and_camera_alarm.jpg`
     - 3: `03_movement_and_streaks.jpg`
     - 4: `04_fitness_activity_trends.jpg`
     - 5: `05_streak_calendar.jpg`
     - 6: `06_configure_daily_targets.jpg`

---

## Step 5: Fill App Listing Copy
1. **Short Description:**
   - Copy and paste from `METADATA_EN.txt`:
   ```text
   Wake up on time with face-verification alarms, track daily steps 24/7 without extra battery drain, and build unbreakable habit streaks with a responsive calendar.
   ```
2. **Full Description:**
   - Copy and paste the full formatted text from `METADATA_EN.txt`.
3. **Add Hindi Localization (Optional but Highly Recommended):**
   - Click **"+ Add Language"** and select **Hindi (हिन्दी)**.
   - Paste Title, Short Description, and Long Description from `METADATA_HI.txt`.

---

## Step 6: Content Rating & Policy URLs
1. **Content Rating:** Select **"Everyone / 3+"** (No violence, no betting, no mature content).
2. **Contains Ads:** Check **"Yes"** (Supported by Google AdMob).
3. **Privacy Policy URL:** Enter:
   ```text
   https://sakshamrajpoot10.github.io/Growth-Streaks/privacy.html
   ```
4. **Developer Support Email:** Enter:
   ```text
   sakshamrajpoot094@gmail.com
   ```

---

## Step 7: Reviewer Instructions & Submission
1. In the **"Notes for Reviewer"** field, paste the full text from:
   `StandUp_PhonePe_Launch_Kit/documentation/REVIEWER_INSTRUCTIONS.md`
2. Re-check all details on the review summary page.
3. When completely satisfied, click **"Submit for Review"**.
