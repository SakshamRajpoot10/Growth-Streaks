# Growth Streak — Complete Research & Implementation Plan (Version 2.0 / 2.2)

<p align="center">
  <img src="logo.png" width="160" height="160" alt="Growth Streak Logo" style="border-radius: 32px;" />
</p>

> **App Name:** Growth Streak  
> **APK Deliverable:** `Growth Streak.apk`  
> **Package ID:** `com.growthstreaks.app`  
> **Category:** Active Accountability Tracker (Lock-Screen Alarm, Habit Streaks & Offline Fitness)  
> **Platform:** Android 15 (API 35 Compliant, React Native 0.88 New Architecture)  
> **Architecture:** 100% Strictly Offline-First (Local SQLite WAL, Zero Cloud Dependencies)  
> **GitHub Repository:** [https://github.com/SakshamRajpoot10/Growth-Streaks.git](https://github.com/SakshamRajpoot10/Growth-Streaks.git)  
> **Release Version:** 2.0 (Milestone 2.2)  
> **Last Updated:** November 15, 2026

---

## Executive Summary & Production Deliverables

**Growth Streak** is an active accountability ecosystem designed to eliminate procrastination, enforce daily discipline, and track personal growth. Unlike conventional habit trackers that send passive push notifications that users easily swipe away, Growth Streak utilizes aggressive full-screen accountability alarms, interactive gesture challenges, camera-verified standing posture checks, hardware pedometer fitness tracking, and a strictly fair streak calendar.

### 📦 Key Deliverables
* **Standalone Release APK:** `Growth Streak.apk` (149 MB)
* **Local Workspace Binary:** [Growth Streak.apk](file:///d:/PROJECTS/Growth%20Streaks/Growth%20Streak.apk)
* **Secondary Workspace Copy:** [growth-streaks/Growth Streak.apk](file:///d:/PROJECTS/Growth%20Streaks/growth-streaks/Growth%20Streak.apk)
* **Cloud Direct Download (EAS CDN):** [Download Growth Streak.apk](https://expo.dev/artifacts/eas/_NnggjpKlmyg16DwLbMBJ3pVaUV9dsIlQ7EP5bI4Wiw.apk)
* **EAS Cloud Build Dashboard:** [Build `f87159e7`](https://expo.dev/accounts/sakshamrajpoot/projects/growth-streaks/builds/f87159e7-f1c3-4735-8eb7-f8814985e15d)
* **Interactive Live Display Tester:** [growth-streaks-tester.html](file:///d:/PROJECTS/Growth%20Streaks/growth-streaks-tester.html)
* **High-Resolution App Screenshots:** [docs/screenshots/](file:///d:/PROJECTS/Growth%20Streaks/growth-streaks/docs/screenshots/)
* **Official Branding:** Custom `GS` Clock & Growth Arrow logo across Android launcher icons (`adaptive-icon.png`), splash screen, and GitHub documentation.

---

## Architecture & System Overview

```
                                  +---------------------------------------+
                                  |         Growth Streak Client          |
                                  |  (Expo SDK 54/58 - React Native 0.88)  |
                                  +---------------------------------------+
                                                      |
                  +-----------------------------------+-----------------------------------+
                  |                                   |                                   |
                  v                                   v                                   v
        +-------------------+               +-------------------+               +-------------------+
        |  Offline Fitness  |               | Strict Streak Cal |               |  Lock-Screen &    |
        |  & Pedometer      |               | & Accountability  |               |  Wake-Up Camera   |
        +-------------------+               +-------------------+               +-------------------+
        | expo-sensors      |               | Zero False Reds   |               | expo-av (21 Ringtones)|
        | ACTIVITY_RECOG    |               | Dynamic Today Halo|               | expo-camera       |
        | 24h Hourly Bars   |               | Fractional Success|               | 60s Standing Pose |
        | Steps/km/kcal/min |               | Day Detail Modal  |               | Slide Unlock      |
        +-------------------+               +-------------------+               +-------------------+
                  \                                   |                                   /
                   \                                  |                                  /
                    +---------------------------------+---------------------------------+
                                                      |
                                                      v
                                    +-----------------------------------+
                                    |     Local SQLite WAL Database     |
                                    |     (100% Strictly Offline)       |
                                    +-----------------------------------+
                                    | - habits, tasks, alarms           |
                                    | - completions, daily_metrics      |
                                    | - fitness_goals, fitness_daily_logs|
                                    +-----------------------------------+
```

---

## Core Pillars & Implementation Details

### Pillar 1: 21 Custom Alarm Ringtones & Audio Engine

Growth Streak features a complete sound suite of 21 unique audio ringtones.
* **Storage Location:** `growth-streaks/assets/sounds/`
* **Audio Engine:** `expo-av` with `Audio.Sound.createAsync`, looping playback, haptic feedback, and instant tap-to-stop previews.
* **Audio Catalogue:**
  1. `Gentle Chime` (`gentle_chime.mp3`) — Soothing high-register bell
  2. `Digital Pulse` (`digital_pulse.mp3`) — Modern electronic rhythm
  3. `Morning Bell` (`morning_bell.mp3`) — Classic acoustic morning chime
  4. `Cosmic Synth` (`cosmic_synth.mp3`) — Ambient synth pulse
  5. `Sunrise Acoustic` (`sunrise_acoustic.mp3`) — Warm acoustic guitar chord
  6. `Energetic Beat` (`energetic_beat.mp3`) — High-tempo rhythmic wake-up
  7. `Radar Alert` (`radar_alert.mp3`) — Urgent pulsing beep
  8. `Zen Flute` (`zen_flute.mp3`) — Calm eastern flute motif
  9. `Celestial Harp` (`celestial_harp.mp3`) — Harmonic celestial arpeggios
  10. `Upbeat Wake` (`upbeat_wake.mp3`) — Bright uplifting melody
  11. `Island Marimba` (`island_marimba.mp3`) — Tropical marimba percussion
  12. `Mountain Echo` (`mountain_echo.mp3`) — Resonant brass echo
  13. `Amber Melody` (`amber_melody.mp3`) — Warm amber melody
  14. `Quiet Sunrise` (`quiet_sunrise.mp3`) — Soft gradual dawn melody
  15. `Future Clock` (`future_clock.mp3`) — Futuristic electronic clock
  16. `Heroic Rise` (`heroic_rise.mp3`) — Grand orchestral crescendo
  17. `Ocean Breeze` (`ocean_breeze.mp3`) — Gentle ambient swell
  18. `Focus Flow` (`focus_flow.mp3`) — Binaural productivity rhythm
  19. `Active Stride` (`active_stride.mp3`) — Driving cadence for movement
  20. `Crystal Calm` (`crystal_calm.mp3`) — Clean crystal tones
  21. `Urgent Call` (`urgent_call.mp3`) — Powerful emergency wake-up siren

---

### Pillar 2: Strict Calendar Streak Logic (Zero False Reds)

* **Problem Solved:** Traditional habit trackers incorrectly paint earlier days in the week/month red if the user just downloaded the app today.
* **Zero False Red Rule:** Days prior to app installation or days where no alarms were scheduled remain completely neutral and blank.
* **Red Indicator:** Displayed *only* if alarms were explicitly configured for that date and 0% were completed.
* **Green Indicator:** Displayed whenever at least one scheduled routine/alarm is completed (even fractional success).
* **Current Active Day:** Dynamic ring highlight surrounding the current date, automatically shifting at midnight.
* **Interactive Day Inspection:** Tapping any date in the calendar opens a breakdown modal revealing all alarms scheduled for that day, their completion states, exact timestamps, and overall performance.

---

### Pillar 3: Offline Google Fit-Style Activity & Step Tracker

* **100% Offline Sensor:** Integrates `expo-sensors` Pedometer backed by Android's hardware `Sensor.TYPE_STEP_COUNTER` and `android.permission.ACTIVITY_RECOGNITION`.
* **Zero External Cloud:** Runs completely without Google Fit APIs or network accounts, storing all metrics directly in SQLite.
* **Tracked Metrics:**
  * **Steps:** Real-time step accumulation.
  * **Distance:** Calculated using dynamic step stride lengths ($0.762\text{ m/step}$).
  * **Calories Burned:** Estimated via metabolic equivalents ($0.04\text{ kcal/step}$).
  * **Active Minutes:** Duration of active walking.
  * **Heart Points:** High-intensity activity bonus points.
* **24-Hour Hourly Distribution:** Visual bar chart illustrating activity across all 24 hours of the day.
* **Customizable Goals:** Users can set daily targets:
  * Distance: $3.0\text{ km}$ / $5.0\text{ km}$ / custom
  * Calories: $250\text{ kcal}$ / $500\text{ kcal}$ / custom
  * Duration: $30\text{ min}$ / $45\text{ min}$ / $60\text{ min}$
  * Steps: $6,000$ / $10,000$ steps
* **Fitness Streaks:** Consecutive days meeting or exceeding the active fitness target increments the user's dedicated Fitness Streak.

---

### Pillar 4: Wake-Up Alarm with 60-Second Standing Camera Verification

To ensure users physically get out of bed rather than snoozing while half-asleep:
* **Phase 1: Slide to Unlock** — Prevents accidental screen taps.
* **Phase 2: Camera Standing Pose Verification**
  * Launches front-facing camera with an on-screen human silhouette outline.
  * Live 60-second countdown timer that decrements *only* when the user is standing upright and centered in the frame.
  * 10-second periodic posture verification loop (requires $\ge 4$ of $6$ checks passed).
  * Anti-Abandon / Anti-Cheat Loop: If the user lays down, minimizes the app, or drops the phone, the timer pauses and the loud alarm sound immediately resumes.
* **Phase 3: Celebration** — Upon achieving 60 seconds of verified standing posture, the alarm silences, congratulatory haptics fire, the day's wake-up streak increments, and the completion is logged to SQLite.

---

## Complete Database Schema (SQLite WAL)

```sql
-- Habits and Routines
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  frequency TEXT NOT NULL,
  target_days TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TEXT NOT NULL,
  archived_at TEXT
);

-- Accountability Alarms
CREATE TABLE IF NOT EXISTS alarms (
  id TEXT PRIMARY KEY,
  habit_id TEXT REFERENCES habits(id),
  title TEXT NOT NULL,
  time TEXT NOT NULL,
  days TEXT NOT NULL,
  is_enabled INTEGER DEFAULT 1,
  challenge_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  sound_name TEXT NOT NULL,
  vibrate INTEGER DEFAULT 1,
  snooze_enabled INTEGER DEFAULT 0,
  snooze_count INTEGER DEFAULT 0,
  max_snoozes INTEGER DEFAULT 3,
  created_at TEXT NOT NULL
);

-- Completion Records
CREATE TABLE IF NOT EXISTS completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT REFERENCES habits(id),
  alarm_id TEXT REFERENCES alarms(id),
  completed_at TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  status TEXT NOT NULL,
  strike_count INTEGER DEFAULT 0,
  dismiss_method TEXT NOT NULL,
  time_to_dismiss_seconds INTEGER,
  camera_verified INTEGER DEFAULT 0
);

-- Fitness Daily Logs & Hourly Buckets
CREATE TABLE IF NOT EXISTS fitness_daily_logs (
  date TEXT PRIMARY KEY,
  steps INTEGER DEFAULT 0,
  distance_km REAL DEFAULT 0.0,
  calories_kcal INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  heart_points INTEGER DEFAULT 0,
  goal_reached INTEGER DEFAULT 0,
  hourly_distribution TEXT DEFAULT '[]',
  last_synced_at TEXT NOT NULL
);

-- Fitness Targets
CREATE TABLE IF NOT EXISTS fitness_goals (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL, -- 'steps', 'distance', 'calories', 'active_minutes'
  target_value REAL NOT NULL,
  is_active INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL
);
```

---

## Design System & Theme Architecture

* **Default Mode:** Clean, bright Light Mode with high-contrast typography, crisp borders, and warm amber/emerald accents.
* **Dark Mode:** Switchable Obsidian Midnight theme with balanced contrast.
* **Color Grading Palette:**
  * Background Light: `#F8FAFC` (Slate 50) / Card Surface: `#FFFFFF`
  * Streak Card: `#FFFBEB` (Amber 50) border `#FDE68A` (Amber 200) flame `#F59E0B` (Amber 500)
  * Success Accent: `#10B981` (Emerald 500) / Success Tint: `#ECFDF5`
  * Typography: Primary `#0F172A` (Slate 900), Secondary `#64748B` (Slate 500)

---

## Testing & Verification Suite

1. **TypeScript Static Analysis:** `npx tsc --noEmit` verifies strict types across all navigation routes, SQLite queries, and audio definitions.
2. **Interactive Web Display Tester:** `growth-streaks-tester.html` replicates the mobile application with live audio preview of all 21 tracks, step counter simulation, and interactive 60s camera standing verification.
3. **EAS Cloud Build System:** Generates production-ready standalone `.apk` binaries for Android 15.

---

## Conclusion & Handover

Growth Streak Version 2.0 fulfills all user specifications: 21 authentic audio ringtones, zero-false-red calendar streaks, an offline Google Fit-style activity tracker, 60-second camera-verified wake-up alarms, and standalone APK delivery.
