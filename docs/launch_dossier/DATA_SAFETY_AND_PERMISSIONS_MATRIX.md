# Data Safety, Telemetry & Permissions Matrix
**Document Version:** 1.0.0  
**Application:** StandUp — Discipline & Habit Alarm OS (`com.growthstreaks.standup`)  
**Compiled Android Manifest Audit:** Fully Verified against AAPT badging dump

---

## 1. Technical Permissions Audit Table

| Android Permission | Technical Purpose in Code | Runtime Prompt Required? | Data Destination | Store Justification Text |
| :--- | :--- | :--- | :--- | :--- |
| `USE_EXACT_ALARM` | Triggers exact alarm events via `AlarmManager.setAlarmClock` | No (Normal permission granted on install up to Android 13; declared in manifest) | System AlarmManager | Core alarm clock function; ensures alarm rings at the exact minute set by user. |
| `SCHEDULE_EXACT_ALARM` | Compatibility fallback for exact alarms on Android 12+ | Yes (Settings toggle on Android 13+) | System AlarmManager | Required for reliable alarm scheduling across all Android 12–14 devices. |
| `USE_FULL_SCREEN_INTENT` | Displays full-screen wake-up alarm modal when device is locked | Special App Access (Android 14+) | Local UI Activity | Necessary to display the wake-up alarm modal directly over the lock screen. |
| `CAMERA` | Real-time posture & face verification for 30 seconds to disarm alarm | **Yes (Runtime prompt)** | **100% Ephemeral RAM; Zero Storage / Zero Upload** | Required for the 30-second standing wake-up verification routine. No photos saved. |
| `ACTIVITY_RECOGNITION` | Reads hardware pedometer sensor ticks (`Sensor.TYPE_STEP_COUNTER`) | **Yes (Runtime prompt)** | Stored in local SQLite database on device | Measures daily walking steps for fitness dashboard. Data never leaves phone. |
| `FOREGROUND_SERVICE_HEALTH` | Continuous background step counting without task killing | Declared in manifest | On-device service | Maintains continuous pedometer sensor registration without missing steps. |
| `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | Plays continuous alarm ringtones via `StandUpAlarmService` | Declared in manifest | Audio hardware | Plays alarm ringtone natively via `STREAM_ALARM` until user disarms it. |
| `RECEIVE_BOOT_COMPLETED` | Reschedules alarms after phone reboots via `StandUpBootReceiver` | Normal (Granted on install) | Local SQLite | Restores user alarms automatically if device is powered off or restarted. |
| `WAKE_LOCK` | Keeps CPU awake for 10 minutes during active ringing alarm | Normal (Granted on install) | Device PowerManager | Prevents device from entering deep sleep while an alarm is actively ringing. |
| `VIBRATE` | Vibrates device synchronously with alarm ringtone | Normal (Granted on install) | Device Vibrator service | Haptic tactile wake-up feedback. |
| `POST_NOTIFICATIONS` | Displays wake-up alerts and routine reminders | **Yes (Runtime prompt Android 13+)** | Local Notification Shade | Sends routine reminders and active alarm notifications. |
| `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | Directs user to whitelist app from aggressive OEM task killing | Deep link intent | System Settings | Prevents OEM battery savers from silencing alarms during overnight sleep. |
| `INTERNET` & `ACCESS_NETWORK_STATE` | Loads Google AdMob advertisement units | Normal (Granted on install) | Google AdMob servers | Required exclusively for loading Google AdMob ads. No personal app data sent. |
| `AD_ID` | Reads Google Advertising ID for AdMob personalization | Normal (Granted on install) | Google AdMob SDK | Standard identifier used by AdMob SDK for ad serving and frequency capping. |

---

## 2. Store Data Safety Declaration (Google Play & Samsung Matrix)

When completing the Data Safety / Privacy questionnaire in store portals, enter the following verified answers:

### Data Collection Declarations:
1. **Personal Information (Name, Email, Phone):** **NOT COLLECTED**. StandUp does not require an account, username, or contact information.
2. **Health & Fitness Information:**
   - *Collected:* Yes (Step counts, active minutes, estimated calories).
   - *Purpose:* App Functionality (Displayed to user in Fitness tab).
   - *Shared with third parties:* **NO**. Data is strictly stored in local device SQLite database.
   - *Ephemeral processing:* No, stored persistently on-device until app is uninstalled.
3. **Photos and Videos:** **NOT COLLECTED**. Camera stream is processed ephemerally in RAM for wake-up verification and never written to storage.
4. **Financial Information:** **NOT COLLECTED**.
5. **Location:** **NOT COLLECTED**. (No GPS or precise location permissions declared).
6. **Device or other IDs (Advertising ID):**
   - *Collected:* Yes (Google Advertising ID `AAID` collected by Google Mobile Ads SDK).
   - *Shared:* Shared with Google AdMob for advertising and analytics.
   - *Encrypted in transit:* Yes (HTTPS).
