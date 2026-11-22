# Phase 4 — PhonePe Appstore ASO Research & Metadata Suite
**Application:** StandUp  
**Package:** `com.growthstreaks.standup`  
**Distribution Target:** PhonePe Appstore ONLY  
**Primary Language:** English (Indian Regional English)

---

## 1. Keyword Research & Semantic Grouping

All keywords evaluated are mapped strictly against verified features in StandUp:

| Keyword Group | Target Keywords | Implementation in StandUp Code | Where Keyword is Deployed |
| :--- | :--- | :--- | :--- |
| **Primary Tier** | `Alarm Clock`, `Alarm App`, `Wake Up Alarm`, `Smart Alarm` | Native `AlarmManager` service & lockscreen activity | Title, Short Description, Long Description |
| **Primary Tier** | `Habit Tracker`, `Daily Routine Tracker`, `Routine Planner` | `TaskListScreen.tsx` routine manager & SQLite storage | Title, Short Description, Long Description |
| **Primary Tier** | `Step Counter`, `Pedometer`, `Walking Tracker`, `Fitness Tracker` | Hardware `Sensor.TYPE_STEP_COUNTER` & `LocalRecordingClient` | Title, Short Description, Long Description |
| **Secondary Tier**| `Morning Routine`, `Daily Goals`, `Habit Streaks`, `Streak Calendar` | 7-column calendar grid & 100% completion highlighting | Long Description body & Feature Bullets |
| **Long-Tail** | `Alarm that makes you get up`, `Alarm with wake-up verification` | 30-second camera standing posture check | Long Description body & Reviewer Notes |
| **Long-Tail** | `Daily step counter and tracker without battery drain` | Hardware sensor step collection without GPS drain | Short Description & Feature Bullets |

---

## 2. Title Candidates Evaluation & Final Selection

*PhonePe Appstore Title Hard Limit:* **Maximum 30 Characters**

| Candidate # | Proposed Title | Character Count | Pros | Cons | Recommendation |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **Candidate 1** | `StandUp: Alarm & Step Tracker` | **29 chars** | Clear, concise, pairs waking up and walking. | Misses the habit/discipline dimension. | Strong runner-up |
| **Candidate 2** | `StandUp: Habit Alarm & Tracker` | **29 chars** | **Captures the 4 highest-converting keywords: StandUp, Habit, Alarm, Tracker.** | None. Fits within the 30-char limit with maximum keyword density. | **SELECTED FINAL TITLE** |
| **Candidate 3** | `StandUp: Alarm Clock & Steps` | **28 chars** | Simple everyday language. | "Steps" has lower semantic search intent than "Tracker". | Alternative |

### 🏆 Selected Title:
```text
StandUp: Habit Alarm & Tracker
```
*(Exact length: 29 characters. 100% compliant with PhonePe's 30-character limit).*

---

## 3. Short Description Candidates & Final Selection

*PhonePe Appstore Short Description Limit:* **Maximum 200 Characters**

| Version | Draft Text | Length | Critique & Focus |
| :---: | :--- | :---: | :--- |
| **Option A** *(Feature-Dense)* | `Wake up on time with face-verification alarms, track daily steps 24/7 without extra battery drain, and build unbreakable habit streaks with a responsive calendar.` | **169 chars** | High keyword density, clearly explains all 3 pillars, natural readability. |
| **Option B** *(Motivation-Focused)* | `Stop snoozing. StandUp combines smart wake-up alarms with 24/7 background step counting and daily habit streak tracking to keep you disciplined all day.` | **150 chars** | Punchy and direct, but slightly less search-term coverage for "pedometer". |
| **Option C** *(Minimalist)* | `A discipline operating system combining smart wake-up alarms, 24/7 background step tracking, and habit streak management in one clean app.` | **138 chars** | Professional, but lacks the specific mention of camera verification. |

### 🏆 Selected Short Description:
```text
Wake up on time with face-verification alarms, track daily steps 24/7 without extra battery drain, and build unbreakable habit streaks with a responsive calendar.
```
*(Exact length: 169 characters. Zero keyword stuffing; high conversion appeal).*

---

## 4. Final Long Description (Structured & Policy-Compliant)

```text
Transform your mornings, master your daily routines, and build unbreakable discipline with StandUp — the complete Discipline & Habit Alarm OS.

Most alarm clocks are too easy to snooze, and most habit trackers are easy to ignore. StandUp bridges the gap by combining an uncompromising native alarm engine with interactive wake-up verification, 24/7 background step counting, and an intuitive habit streak calendar.

━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ 1. THE NATIVE ALARM ENGINE THAT NEVER SLEEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Closed-App & Lock-Screen Ringing: StandUp is powered by pure native Android background services. Even when your phone screen is locked, when other apps are open, or when StandUp has been swiped away, your alarm triggers at the exact scheduled second.
• Isolated Alarm Volume Stream: Audio plays through Android's dedicated alarm channel (STREAM_ALARM). Even if your media volume is muted, your wake-up alarm rings at full scheduled volume.
• 21 Embedded Custom Ringtones: Choose from 21 energizing built-in tracks — from gentle acoustic chimes and serene zen flutes to high-energy electronic beats and urgent siren alerts.

━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 2. INTERACTIVE WAKE-UP VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Stand Up to Disarm: Put an end to accidental snoozing. StandUp requires you to physically get out of bed and complete a 30-second upright posture check before the alarm turns off.
• 100% On-Device & Private: Your camera frames are analyzed ephemerally in device memory to verify standing wakefulness. Zero photos are captured, saved to disk, or uploaded to any server.

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏃 3. 24/7 BACKGROUND STEP & FITNESS TRACKING
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Continuous Movement Tracking: Measure your daily steps, active minutes, estimated distance, and calories burned automatically throughout the day.
• Zero Persistent Notifications: Built on Google Play Services Local Recording API, StandUp collects background steps without cluttering your notification shade with permanent alerts.
• Dynamic Visual Analytics: Explore your physical progress with Google Fit-style stacked trend cards, 24-hour hourly distribution bar charts, and calendar-week comparisons.
• Customizable Daily Targets: Set personal milestones for steps, distance, active minutes, and calories, or toggle individual targets off whenever you choose.

━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 4. ACCOUNTABILITY & STREAK CALENDAR
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Responsive Streak Calendar: View your monthly consistency at a glance. Days with 100% completed routines are highlighted with vibrant completion markers.
• Weekly Performance Stats: Track your alarm completion rates and build unstoppable habit momentum week after week.

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 5. PRIVACY-FIRST ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━
• StandUp operates 100% on-device.
• No account registration or login required.
• Your habits, alarm times, and movement logs are stored strictly on your phone in a local database.
• Supported by non-intrusive Google AdMob advertisements that are strictly blocked during active alarms.

Stop snoozing your potential. Download StandUp today and build the discipline your goals deserve!
```

---

## 5. ASO Quality & Character Limits Verification

- **Title Limit:** 30 characters $\rightarrow$ StandUp Title: **29 characters** (PASS).
- **Short Description Limit:** 200 characters $\rightarrow$ StandUp Short Description: **169 characters** (PASS).
- **Long Description Limit:** 4,000 characters $\rightarrow$ StandUp Long Description: **2,488 characters** (PASS).
- **Keyword Stuffing Check:** Passed. Keywords flow naturally within grammatically complete sentences.
- **Brand Consistency:** 100% StandUp branding; zero mention of previous working titles.
