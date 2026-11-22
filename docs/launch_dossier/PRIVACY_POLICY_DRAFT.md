# StandUp — Privacy Policy Draft
**Effective Date:** Upon Public Launch (2026)  
**Applicable Legal Framework:** Digital Personal Data Protection Act, 2023 (DPDP Act, India) & Global Privacy Standards  
**Application:** StandUp — Discipline & Habit Alarm OS  
**Package:** `com.growthstreaks.standup`  
**Developer Identity:** [OWNER LEGAL NAME / REGISTERED BRAND - OWNER INPUT REQUIRED]  
**Official Contact / Grievance Officer:** [OWNER SUPPORT EMAIL - OWNER INPUT REQUIRED]

---

## 1. Overview & Core Philosophy

StandUp ("the Application", "we", "our") is designed as a privacy-first, on-device discipline and habit alarm operating system. We believe that your personal routines, wake-up verification, and daily physical movement belong to you alone.

**Fundamental Principle:** StandUp operates **100% on-device** for its core features. We do not maintain remote user databases, we do not require user account logins, and we do not transmit your habit logs, alarms, or camera verification images to any cloud server.

---

## 2. Information We Process

### A. Motion & Pedometer Data
- **What is processed:** Daily step count, estimated walking distance, active minutes, and estimated caloric expenditure.
- **How it is collected:** StandUp accesses device hardware motion sensors (`Sensor.TYPE_STEP_COUNTER`) and Google Play Services on-device Local Recording client (`FitnessLocal`).
- **Where it is stored:** Strictly in a local SQLite database (`standup.db`) on your physical device.
- **Cloud Transmission:** **Zero**. Step counts and activity records are never sent over the internet or uploaded to any remote server.

### B. Camera & Wake-Up Face Verification
- **What is processed:** Real-time camera frames during the optional 30-second upright wake-up verification check.
- **How it is processed:** Camera frames are analyzed **ephemerally in device volatile memory (RAM)** to detect user wakefulness and standing posture.
- **Biometric Storage:** **None**. No photos, video recordings, facial images, or biometric mathematical embeddings are stored in device storage or transmitted over any network. Once the alarm disarms, the camera session terminates and frames are discarded from memory.

### C. Alarms & Daily Routines
- **What is processed:** Alarm scheduled times, task titles (e.g., "Study", "Morning workout"), repetition days, and chosen ringtone.
- **Where it is stored:** Strictly in your device's local SQLite database and Android system `AlarmManager`.

### D. Third-Party Advertising Data (Google AdMob)
- StandUp displays advertisements powered by **Google AdMob** (`pub-9675414045566238`) to support free development.
- **Information Collected by Google AdMob SDK:** Google Advertising ID (`AAID`), coarse location signals (IP-based country/region), device model, operating system version, and ad interaction metrics.
- **User Choice:** Users may reset or disable personalized advertising at any time via Android System Settings (`Settings > Google > Ads > Reset or Delete advertising ID`).
- **Safety Lock:** StandUp programmatically blocks all ad loading and rendering while an alarm is ringing or while camera verification is active.

---

## 3. Device Permissions & Exact Purpose

| Permission | Technical Purpose | Data Destination |
| :--- | :--- | :--- |
| `CAMERA` | 30-second wake-up standing/face check | Ephemeral RAM only; zero storage or upload |
| `ACTIVITY_RECOGNITION` | Read physical step sensor ticks | Stored locally in device SQLite database |
| `FOREGROUND_SERVICE_HEALTH` | Continuous background step tracking | On-device processing only |
| `USE_EXACT_ALARM` | Trigger alarms at precise user-scheduled times | Android system AlarmManager |
| `USE_FULL_SCREEN_INTENT` | Present wake-up alarm modal when phone is locked | Local Android Activity display |
| `RECEIVE_BOOT_COMPLETED` | Restore scheduled alarms after phone reboots | Local SQLite database |
| `INTERNET` & `AD_ID` | Fetch and render Google AdMob ad units | Google AdMob servers |

---

## 4. Data Retention and Erasure

- All application data (habits, calendar history, streak counters, step logs) resides exclusively on your local device.
- **How to delete your data:**
  1. In-app: Clear all data via Android App Info (`Settings > Apps > StandUp > Storage > Clear Data`).
  2. Uninstalling the Application permanently erases the SQLite database and all associated preferences.

---

## 5. Children's Privacy

StandUp does not knowingly target or collect personal information from children under the age of 13. The application is rated for general audiences (3+ / Everyone).

---

## 6. Grievance Redressal & Contact (DPDP Act, India)

In accordance with the Digital Personal Data Protection Act, 2023 of India, you may direct any privacy inquiries, complaints, or feedback to our designated Grievance Officer:

- **Data Fiduciary:** [OWNER LEGAL NAME - OWNER INPUT REQUIRED]
- **Designated Grievance Contact:** [OWNER SUPPORT EMAIL - OWNER INPUT REQUIRED]
- **Jurisdiction:** India
