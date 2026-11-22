# Phase 7 — Privacy, Security & Policy Compliance

**Application:** StandUp: Habit Alarm & Tracker (`com.growthstreaks.standup`)  
**Target Marketplace:** PhonePe Appstore (India)  
**Regulatory Framework:** Digital Personal Data Protection Act, 2023 (India) & PhonePe Appstore Developer Guidelines

---

## 1. Complete Android Permissions Audit & DPDP Act 2023 Compliance

The compiled `AndroidManifest.xml` contains 18 declared permissions. Each permission has a strictly defined technical justification:

1. `android.permission.USE_EXACT_ALARM`: Ensures the native alarm engine fires at the exact minute set by the user.
2. `android.permission.SCHEDULE_EXACT_ALARM`: Android 12+ compatibility for precise scheduling.
3. `android.permission.USE_FULL_SCREEN_INTENT`: Directs Android to display `StandUpAlarmActivity` immediately over the lock screen.
4. `android.permission.CAMERA`: Used exclusively for the 30-second upright standing posture wake-up mission.
5. `android.permission.ACTIVITY_RECOGNITION`: Requests system permission to read hardware pedometer step counts.
6. `android.permission.FOREGROUND_SERVICE_HEALTH`: Android 14 requirement for background health and pedometer recording.
7. `android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK`: Required to play ringtones continuously via `StandUpAlarmService` until dismissed.
8. `android.permission.RECEIVE_BOOT_COMPLETED`: Triggers `StandUpBootReceiver` to reschedule alarms after a device reboot.
9. `android.permission.WAKE_LOCK`: Keeps CPU awake while the alarm is actively ringing to prevent audio stuttering.
10. `android.permission.VIBRATE`: Vibrates the device in sync with alarm audio.
11. `android.permission.POST_NOTIFICATIONS`: Android 13+ requirement for displaying notifications.
12. `android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`: Prompts user to whitelist app from aggressive OEM task killing.
13. `android.permission.SYSTEM_ALERT_WINDOW`: Allows alarm overlay over other foreground apps.
14. `android.permission.INTERNET`: Required for Google AdMob ad requests.
15. `android.permission.ACCESS_NETWORK_STATE`: Checks internet connectivity before requesting ads.
16. `com.google.android.gms.permission.AD_ID`: Google Advertising ID for ad frequency capping.
17. `android.permission.READ_EXTERNAL_STORAGE` (maxSdkVersion=32): Scoped legacy permission for custom ringtone picker.
18. `android.permission.RECORD_AUDIO`: Native audio library declaration.

---

## 2. On-Device Privacy Architecture & Data Minimization
Under the **Digital Personal Data Protection Act, 2023 (DPDP Act)** of India:
- **Zero Cloud Storage:** StandUp maintains zero cloud databases. No habit records, alarm times, or movement statistics are transmitted off the device.
- **Ephemeral RAM Processing for Camera:** The camera stream is analyzed in volatile RAM to detect standing posture and immediately cleared upon alarm completion. Zero photos or video recordings are saved or uploaded.
- **Data Erasure:** Users can erase 100% of their local data at any time by clearing application data in Android Settings or uninstalling the application.

---

## 3. PhonePe Content Rating Classification
- **Content Rating Level:** **Everyone (3+) / All Ages**
- Questionnaire Declarations:
  - Violence: **None**
  - Sexual Content / Nudity: **None**
  - Profanity / Crude Humor: **None**
  - Controlled Substances / Drugs: **None**
  - Location Sharing: **No**
  - User-to-User Communication (Chat/Forums): **No**
  - In-App Purchases / Real-Money Gambling: **No** (100% Free App)
  - Advertising: **Yes** (Contains Google AdMob Ads)
