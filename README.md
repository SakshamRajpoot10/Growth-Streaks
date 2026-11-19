<p align="center">
  <img src="logo.png" width="140" height="140" alt="StandUp Logo" style="border-radius: 28px;" />
</p>

<h1 align="center">StandUp — Discipline & Habit Alarm OS</h1>

<p align="center">
  <strong>Active Accountability OS: Reliable Locked-Screen Alarms, Real-Time Pedometer & Biomechanical Analytics</strong><br>
  <em>Strictly Offline-First • SQLite WAL Mode • Google Recording Client Pedometer • 30s Camera Standing Verification • Google Fit Style Trends & Dynamic Graphs</em>
</p>

<p align="center">
  <a href="https://github.com/SakshamRajpoot10/Growth-Streaks"><img src="https://img.shields.io/badge/GitHub-Growth--Streaks-181717?style=for-the-badge&logo=github" alt="GitHub"></a>
  <a href="https://expo.dev/accounts/sakshamrajpoot/projects/growth-streaks"><img src="https://img.shields.io/badge/Expo-SDK%2058-000020?style=for-the-badge&logo=expo" alt="Expo SDK 58"></a>
  <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React%20Native-0.88-61DAFB?style=for-the-badge&logo=react" alt="React Native"></a>
  <a href="https://developer.android.com"><img src="https://img.shields.io/badge/Android%2015-API%2035-3DDC84?style=for-the-badge&logo=android" alt="Android 15"></a>
  <a href="https://sqlite.org"><img src="https://img.shields.io/badge/Database-SQLite%20WAL-003B57?style=for-the-badge&logo=sqlite" alt="SQLite"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
</p>

---

## 📋 Table of Contents
1. [Project Description](#1-project-description)
2. [Main Features](#2-main-features)
3. [Alarm Architecture & Reliability](#3-alarm-architecture--reliability)
4. [Background Step Counting (Zero Notification)](#4-background-step-counting)
5. [Fitness & Activity Analytics (Google Fit Style)](#5-fitness--activity-analytics)
6. [Wake-Up Verification (30s Camera Standing Check)](#6-wake-up-verification)
7. [Application Architecture](#7-application-architecture)
8. [Technology Stack](#8-technology-stack)
9. [Installation Requirements](#9-installation-requirements)
10. [Local Development Instructions](#10-local-development-instructions)
11. [Android Build Instructions (APK & AAB)](#11-android-build-instructions)
12. [Expo & EAS Configuration](#12-expo--eas-configuration)
13. [Permissions Matrix](#13-permissions-matrix)
14. [AdMob Integration Overview](#14-admob-integration-overview)
15. [Automated Testing & QA](#15-automated-testing--qa)
16. [Privacy, Data Handling & Offline Integrity](#16-privacy--data-handling)
17. [Store Release Information](#17-store-release-information)
18. [Known Platform Limitations](#18-known-platform-limitations)
19. [Visual References & Screenshots](#19-screenshots)
20. [Support & Contact Information](#20-support--contact)

---

## 1. Project Description
**StandUp** is a discipline operating system designed to build consistent personal habits. Combining an unyielding locked-screen native alarm system, passive background step counting via Google's low-power Recording API, and rich intraday biometric analytics, StandUp ensures you never sleep past your commitments or lose track of your movement.

## 2. Main Features
* **Lock-Screen Fullscreen Alarm Experience:** Wakes your device and turns the screen on directly over lockscreens with native high-priority audio routing (`STREAM_ALARM`).
* **Silent Background Step Collection:** Continually collects daily steps even when StandUp is completely closed, without permanent foreground notification clutter in the status bar.
* **Intraday Trends & Analytics:** Google Fit style stacked trend cards for Heart Points, Steps, Distance, and Energy Expended with interactive Day, Week, and Month breakdowns.
* **Strict Dynamic Targets:** Configurable daily goals without fabricated default values.
* **30-Second Wake-Up Posture Verification:** Requires standing upright in front of the camera before the wake-up alarm is dismissed.
* **Ergonomic Routine Management:** Quick 2-button creation and a balanced triangular layout for routine modifications.
* **Safe Opt-In Monetization:** AdMob rewarded ads offered only after successfully completing a routine to earn a Streak Shield.

## 3. Alarm Architecture & Reliability
* **Android `AlarmManager`:** Schedules precise RTC alarms using `setExactAndAllowWhileIdle()` across all Android power states, including Doze mode.
* **Locked-Screen Activity:** Native `StandUpAlarmActivity` with `showWhenLocked="true"`, `turnScreenOn="true"`, and `FLAG_KEEP_SCREEN_ON`.
* **Audio Channel Isolation:** Ringtones play over `STREAM_ALARM` with `USAGE_ALARM` so they ring loudly even if the phone's media volume is muted.
* **Reboot Resilience:** `StandUpBootReceiver` listens for `ACTION_BOOT_COMPLETED`, `TIME_SET`, and `TIMEZONE_CHANGED` to reschedule active alarms immediately upon reboot.

## 4. Background Step Counting
* **Google Recording API Integration:** Native `LocalRecordingClient` connects directly to Android sensor fusion, collecting daily steps at the hardware level with zero background CPU overhead.
* **Foreground Sensor Bridge:** Live sensor updates seamlessly tick real-time walking counts when the user is actively viewing the Fit dashboard.
* **Zero Foreground Notifications:** Removed persistent notification banners from the shade for supported Android 10+ devices.

## 5. Fitness & Activity Analytics
* **Trends Dashboard (Fit Tab):**
  * **Daily Targets:** Independently configurable for Steps, Distance, Heart Points, and Calories. Unset targets are never shown.
  * **4 Stacked Metric Cards:** Heart Points, Steps, Distance, and Energy Expended with 7-day mini bar charts (`S`, `M`, `T`, `W`, `T`, `F`, `S`).
* **Detailed Metric Screens:**
  * **Day View:** 24-hour bar distribution with 4-hour labels (`12 am`, `4 am`, `8 am`, `12 pm`, `4 pm`, `8 pm`, `12 am`) and 2-hour dot ticks; sliding 5-day history list.
  * **Week View:** Sun to Sat bars with goal-reached checkmarks and dashed target lines.
  * **Month View:** Calendar days with leap-year handling.
  * **Dynamic Scaling:** Nice-number interval scaling ($1, 2, 2.5, 5, 10 \times 10^k$) preventing clipped goal lines.

## 6. Wake-Up Verification
* **Dedicated Wake-Up Mapping:** Selecting the "Wake Up" focus area automatically engages `WAKE_UP_VERIFICATION`.
* **Front Camera Standing Pose:** 30-second countdown with live face and posture detection.
* **Audio Silence:** Ringtone silences the moment the camera starts, allowing focus on standing upright.

## 7. Application Architecture
```
growth-streaks/
├── android/               # Native Android build & Gradle configurations
│   ├── app/src/main/java/com/growthstreaks/standup/
│   │   ├── MainActivity.kt
│   │   ├── MainApplication.kt
│   │   ├── StandUpAlarmActivity.kt
│   │   ├── StandUpAlarmReceiver.kt
│   │   ├── StandUpAlarmService.kt
│   │   ├── StandUpBootReceiver.kt
│   │   └── StandUpNativeModule.kt
├── app/                   # Expo Router routes & tab layouts
├── assets/                # Audio ringtones, custom icons, splash graphics
├── src/
│   ├── components/        # Shared atomic UI primitives
│   ├── db/                # SQLite database client & queries
│   ├── features/
│   │   ├── alarm/         # Alarms, camera modals & scheduler
│   │   ├── fitness/       # Dashboard, metric details, trend charts
│   │   └── tasks/         # Routine list, task card & task form
│   ├── services/          # AdMob service & native bridge
│   ├── store/             # Zustand state management
│   └── utils/             # Dates, theme, sound preview
└── scripts/               # Automated unit & integration tests
```

## 8. Technology Stack
* **Framework:** React Native 0.88 + Expo SDK 58 (New Architecture enabled)
* **Language:** TypeScript 5.9 + Kotlin 2.2
* **Storage:** `expo-sqlite` with SQLite WAL mode + `drizzle-orm`
* **Sensors & Audio:** `play-services-fitness`, `expo-sensors`, `expo-audio`
* **Styling & UI:** React Native StyleSheet with automatic light/dark theming
* **Monetization:** Google Mobile Ads (`play-services-ads:23.6.0`) with isolated AdMob controller

## 9. Installation Requirements
* Node.js $\ge 18$ (LTS recommended)
* JDK 17 or higher
* Android SDK Platform 35 / Build Tools 35.0.0
* CMake 3.22+ and Android NDK 27.1

## 10. Local Development Instructions
```bash
# Clone the repository
git clone https://github.com/SakshamRajpoot10/Growth-Streaks.git
cd Growth-Streaks/growth-streaks

# Install dependencies
npm install

# Start Expo local bundler
npx expo start
```

## 11. Android Build Instructions
```bash
# Navigate to native Android project
cd android

# Compile standalone production APK locally
./gradlew.bat assembleRelease --no-daemon

# Compile release App Bundle (AAB) for Google Play
./gradlew.bat bundleRelease --no-daemon
```

## 12. Expo & EAS Configuration
* **Package Name:** `com.growthstreaks.standup`
* **App Slug:** `growth-streaks`
* **EAS Project ID:** `608ce632-b037-4599-b508-2d0350e8038a`
* Configured plugins: `expo-router`, `expo-splash-screen`, `expo-sqlite`, `withAlarmLockScreen`, `withAlarmSounds`.

## 13. Permissions Matrix
| Permission | Justification |
| :--- | :--- |
| `USE_FULL_SCREEN_INTENT` | Displays high-priority fullscreen lockscreen alarm activity. |
| `SCHEDULE_EXACT_ALARM` | Ensures exact-minute alarm delivery via Android AlarmManager. |
| `WAKE_LOCK` | Keeps CPU awake while alarm rings to guarantee sound & vibration. |
| `ACTIVITY_RECOGNITION` | Reads hardware pedometer step counts. |
| `FOREGROUND_SERVICE_HEALTH` | Background step recording without OS suspension. |
| `RECEIVE_BOOT_COMPLETED` | Restores scheduled alarms automatically after device restart. |
| `CAMERA` | Front-facing camera posture check for 30s wake-up verification. |
| `POST_NOTIFICATIONS` | Delivers pre-alarm warnings and active alarm alerts. |

## 14. AdMob Integration Overview
* **Publisher ID:** `pub-9675414045566238`
* **Android App ID:** `ca-app-pub-9675414045566238~1521257692`
* **Rewarded Unit A (Primary):** `ca-app-pub-9675414045566238/9370781377`
* **App Open Unit:** `ca-app-pub-9675414045566238/8720044686`
* **Rewarded Unit B (Secondary):** `ca-app-pub-9675414045566238/9917576285`
* **Authorized Seller (app-ads.txt):** `google.com, pub-9675414045566238, DIRECT, f08c47fec0942fa0`
* **Safety Isolation:** Development strictly uses Google official test IDs. Ads are strictly suppressed during alarms and verification.

## 15. Automated Testing & QA
Run the automated test suite:
```bash
npx -p tsx tsx scripts/test-fitness-analytics.js
```
* **Coverage:** 33/33 tests passing (100% success).
* Covers dynamic scaling, 5-day history windows, leap years, target logic, cadence-based Heart Points, and AdMob test-mode security isolation.

## 16. Privacy & Data Handling
* **100% Offline-First:** Biometric and habit records are stored in a private SQLite database on-device.
* **No Cloud Sync Required:** Zero mandatory logins or external servers.
* **Camera Privacy:** Video frames for posture verification are analyzed in real-time in memory and never stored, saved, or uploaded.

## 17. Store Release Information
* **Primary Target:** Google Play Store (Production Track, AAB format)
* **Secondary Target:** Samsung Galaxy Store (Universal APK format)
* **Category:** Health & Fitness / Productivity
* **Content Rating:** Everyone

## 18. Known Platform Limitations
* **Aggressive OEM Battery Savers:** On certain Xiaomi (MIUI) and Huawei devices, users must whitelist StandUp under "Autostart" and "Battery Saver -> No restrictions" to allow background alarms to fire when killed.
* **Initial Google Recording Setup:** First-time step counting requires Google Play Services to calibrate local step data.

## 19. Screenshots
*(Visual previews aligned with Google Fit aesthetics: Stacked trends, 24h hourly timelines, and 7-day Sun..Sat charts).*

## 20. Support & Contact
* **GitHub Issues:** [https://github.com/SakshamRajpoot10/Growth-Streaks/issues](https://github.com/SakshamRajpoot10/Growth-Streaks/issues)
* **Repository Owner:** Saksham Rajpoot
