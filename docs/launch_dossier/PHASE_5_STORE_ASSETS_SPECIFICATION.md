# Phase 5 — Store Assets Verification & Final Sequence Specification

**Application:** StandUp: Habit Alarm & Tracker (`com.growthstreaks.standup`)  
**Target Store:** PhonePe Appstore ONLY  
**Asset Kit Directory:** `StandUp_PhonePe_Launch_Kit/`

---

## 1. Official App Icon Verification
- **File Location:** `StandUp_PhonePe_Launch_Kit/store_assets/standup_icon_512x512.png`
- **Resolution:** 512 x 512 pixels (Exact 1:1 square).
- **Format:** 32-bit PNG with RGB color profile.
- **File Size:** 51.7 KB (Well below the 1,024 KB maximum limit).
- **Compliance Checks:**
  - [x] No misleading promotional badges (e.g., "Editor's Choice", "#1 Alarm", "Top Free").
  - [x] No pre-rendered rounded squircle mask (PhonePe Appstore dynamically applies standard OS corner radii; square canvas provided).
  - [x] Solid non-transparent background to ensure perfect contrast in both Dark Mode and Light Mode store interfaces.
  - [x] Sharp high-contrast typography and iconography (StandUp figure with vibrant gradient styling).

---

## 2. PhonePe Appstore Screenshot Sequence & Rationale
PhonePe Appstore supports 2 to 8 portrait screenshots (9:16 or standard mobile resolution).  
The owner captured 6 authentic high-resolution screenshots (1080 x 2400 px) on a real Android device.

| Slot # | Screenshot File Name | Visual Content Captured | Strategic ASO & Conversion Purpose |
| :---: | :--- | :--- | :--- |
| **01** | `01_dashboard_accountability.jpg` | 100% Accountability Ring, 2/2 Tasks Completed, Weekly Performance card, Today's Routines | **The Hook:** Demonstrates instant visual satisfaction of achieving 100% daily discipline and completing morning habits. |
| **02** | `02_routines_and_camera_alarm.jpg` | My Routines list showing "Work Hard" (3:30 PM) and "Wakebup" (3:35 PM with 30s Camera Mission & "Test Alarm" button) | **Core Feature Differentiator:** Directly showcases the camera mission alarm that physically forces users out of bed. |
| **03** | `03_movement_and_streaks.jpg` | 1-Day Streak fire badge with encouragement card, Today's Movement ring (118 steps, 0.09 km, 4.7 kcal, 1 min active) | **Fitness & Streak Combo:** Shows real-time movement and active calorie calculation alongside consistency momentum. |
| **04** | `04_fitness_activity_trends.jpg` | Fitness & Activity screen with 8,000 steps target progress bar, 7-day trend bars for Heart Points, Steps, and Distance | **Analytics & Depth:** Highlights Google Fit-grade visual trends and progress tracking for health-conscious users. |
| **05** | `05_streak_calendar.jpg` | Streak Calendar screen for November 2026, 2/2 completed banner (100%), full monthly grid with green completion indicator | **Long-Term Habit Retention:** Proves habit tracking isn't just for today, but helps build unbreakable monthly streaks. |
| **06** | `06_configure_daily_targets.jpg` | Configure Daily Targets modal showing customizable pills for Steps (8,000), Distance, Heart Points, and Calories | **Customizability & Control:** Reassures users that targets are flexible and can be customized or toggled off anytime. |

---

## 3. Feature Graphic & Promotional Video Evaluation
- **PhonePe Appstore Requirement:** A 1024 x 500 banner and YouTube promotional video are **OPTIONAL** on the PhonePe Developer Portal.
- **Evaluation:** Uploading the 6 verified portrait screenshots alongside the crisp 512x512 app icon fulfills 100% of the required listing criteria and displays cleanly across mobile PhonePe Appstore layouts without requiring video encoding.
