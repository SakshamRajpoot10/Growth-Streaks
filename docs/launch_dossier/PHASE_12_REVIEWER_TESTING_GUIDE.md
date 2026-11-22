# Phase 12 — Reviewer Testing Guide (PhonePe Appstore)

This document contains the exact reviewer testing guide provided to PhonePe Appstore app reviewers to guarantee a smooth, frictionless app review and zero rejections.

---

## Reviewer Guide Text

```text
Application: StandUp: Habit Alarm & Tracker
Package Name: com.growthstreaks.standup
Review Category: Productivity / Health & Fitness

1. ACCESS CREDENTIALS:
StandUp operates with a 100% offline local-first architecture. 
No login, user account, phone OTP, or credentials are required. 
All features are immediately accessible upon launching the application.

2. HOW TO TEST THE CORE CAMERA ALARM (INSTANT TEST):
You do NOT need to wait for a scheduled clock time to test the alarm and camera mission:
- Open StandUp and grant requested permissions (Notifications, Camera, Physical Activity).
- Tap the "Alarm" tab in the bottom navigation bar.
- Locate the "Wakebup" routine card.
- Tap the yellow button labeled "📸 Test Alarm".
- StandUp will immediately trigger the native full-screen alarm screen (StandUpAlarmActivity), wake the screen, and play audio via the Android Alarm stream.
- Tap "Start Wake-Up Mission". Position your face in front of the front camera. The 30-second timer will count down.
- Once completed, the alarm stops, the routine registers as completed, and today's streak increments.

3. HOW TO TEST 24/7 STEP COUNTING:
- Tap the "Fit" tab in the bottom bar.
- StandUp binds to Android's hardware Sensor.TYPE_STEP_COUNTER and Google Play Services Local Recording API.
- Take a few steps or tilt the device to see live step count updates.
- Tap "Configure" in the top-right corner to test setting custom daily targets (e.g. 5,000, 8,000 steps).

4. HOW TO TEST HABIT STREAKS & CALENDAR:
- Tap the "Dashboard" tab to see today's accountability ring and weekly stats.
- Tap the "Calendar" tab to view monthly consistency with green completion indicators for days with 100% routine completion.

5. SENSITIVE PERMISSION JUSTIFICATIONS:
- CAMERA: Used solely for real-time 30-second upright wake-up verification in volatile RAM. No photos or videos are stored or uploaded.
- ACTIVITY_RECOGNITION: Used strictly to read hardware pedometer step counts. Data stays local in SQLite.
- USE_FULL_SCREEN_INTENT & USE_EXACT_ALARM: Core alarm requirement to display the wake-up screen when the phone is locked.
- REQUEST_IGNORE_BATTERY_OPTIMIZATIONS: Prevents aggressive OEM battery savers from killing scheduled alarms during sleep.

If you have any questions, please contact developer support at: sakshamrajpoot094@gmail.com
```
