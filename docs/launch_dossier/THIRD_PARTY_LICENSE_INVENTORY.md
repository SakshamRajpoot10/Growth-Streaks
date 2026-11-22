# Third-Party License & Open-Source Software Inventory
**Document Version:** 1.0.0  
**Application:** StandUp — Discipline & Habit Alarm OS  
**Package:** `com.growthstreaks.standup`

---

## 1. Software Bill of Materials (SBOM) — Direct Dependencies

All direct runtime dependencies declared in `package.json` were audited for commercial permissiveness:

| Package Name | Declared Version | Primary License | Permitted for Commercial Use? | Required Attribution Action |
| :--- | :--- | :--- | :--- | :--- |
| `react` | `19.3.0` | MIT License | **Yes** | Include standard MIT copyright notice |
| `react-dom` | `19.3.0` | MIT License | **Yes** | Include standard MIT copyright notice |
| `react-native` | `0.88.1` | MIT License | **Yes** | Include standard MIT copyright notice |
| `expo` | `~58.0.25` | MIT License | **Yes** | Include standard MIT copyright notice |
| `expo-router` | `~58.0.31` | MIT License | **Yes** | Include standard MIT copyright notice |
| `expo-sqlite` | `~58.0.17` | MIT License | **Yes** | Include standard MIT copyright notice |
| `expo-sensors` | `~58.0.5` | MIT License | **Yes** | Include standard MIT copyright notice |
| `expo-camera` | `~58.0.14` | MIT License | **Yes** | Include standard MIT copyright notice |
| `expo-audio` | `~58.0.12` | MIT License | **Yes** | Include standard MIT copyright notice |
| `expo-haptics` | `~58.0.8` | MIT License | **Yes** | Include standard MIT copyright notice |
| `expo-status-bar` | `~58.0.5` | MIT License | **Yes** | Include standard MIT copyright notice |
| `react-native-notify-kit` | `^10.10.0` | Apache 2.0 / MIT | **Yes** | Retain Apache 2.0 notice & license |
| `react-native-safe-area-context` | `~5.11.1` | MIT License | **Yes** | Include standard MIT copyright notice |
| `react-native-screens` | `~4.30.1` | MIT License | **Yes** | Include standard MIT copyright notice |
| `react-native-svg` | `15.16.0` | MIT License | **Yes** | Include standard MIT copyright notice |
| `react-native-reanimated` | `4.7.1` | MIT License | **Yes** | Include standard MIT copyright notice |
| `react-native-worklets` | `0.13.0` | MIT License | **Yes** | Include standard MIT copyright notice |
| `drizzle-orm` | `^0.45.4` | Apache 2.0 | **Yes** | Retain Apache 2.0 notice |
| `zustand` | `^5.1.0` | MIT License | **Yes** | Include standard MIT copyright notice |
| `date-fns` | `^4.4.0` | MIT License | **Yes** | Include standard MIT copyright notice |

---

## 2. Native Android & SDK Dependencies

| Library / SDK | Provider | License Type | Compliance Notes |
| :--- | :--- | :--- | :--- |
| **AndroidX Core & Jetpack** | Google LLC | Apache License 2.0 | Standard Android open-source libraries |
| **Google Play Services Fitness (`play-services-fitness`)** | Google LLC | Google APIs Terms of Service | Used locally via on-device `FitnessLocal` client |
| **Google Mobile Ads SDK (AdMob)** | Google LLC | Google Mobile Ads SDK Terms | Official advertising SDK (`pub-9675414045566238`) |
| **Kotlin Standard Library** | JetBrains s.r.o. | Apache License 2.0 | Standard Kotlin compiler runtime |

---

## 3. Audio & Media Asset Audit (`android/app/src/main/res/raw/`)

The application embeds 21 audio ringtone files in `android/app/src/main/res/raw/`:
1. `active_stride.mp3` (470 KB)
2. `amber_melody.mp3` (516 KB)
3. `celestial_harp.mp3` (167 KB)
4. `cosmic_synth.mp3` (180 KB)
5. `crystal_calm.mp3` (1.83 MB)
6. `digital_pulse.mp3` (66 KB)
7. `energetic_beat.mp3` (1.81 MB)
8. `focus_flow.mp3` (1.25 MB)
9. `future_clock.mp3` (952 KB)
10. `gentle_chime.mp3` (138 KB)
11. `heroic_rise.mp3` (314 KB)
12. `island_marimba.mp3` (375 KB)
13. `morning_bell.mp3` (1.19 MB)
14. `mountain_echo.mp3` (934 KB)
15. `ocean_breeze.mp3` (5.63 MB)
16. `quiet_sunrise.mp3` (237 KB)
17. `radar_alert.mp3` (1.52 MB)
18. `sunrise_acoustic.mp3` (501 KB)
19. `upbeat_wake.mp3` (119 KB)
20. `urgent_call.mp3` (666 KB)
21. `zen_flute.mp3` (717 KB)

### Compliance Verification Action:
> [!WARNING]
> **OWNER ACTION REQUIRED:** Confirm the commercial licensing origin of these 21 MP3 audio tracks (e.g., whether they were created by the owner, licensed via royalty-free sound libraries such as Pixabay/Freesound under CC0/commercial license, or AI-generated). Commercial app stores require that audio tracks do not infringe third-party musical copyrights.

---

## 4. Draft `THIRD_PARTY_NOTICES.md`

```markdown
# Third-Party Software Notices & Licenses

StandUp — Discipline & Habit Alarm OS incorporates components from the following open-source projects:

## 1. React & React Native
Copyright (c) Meta Platforms, Inc. and affiliates.
Licensed under the MIT License.

## 2. Expo SDK & Expo Router
Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
Licensed under the MIT License.

## 3. Notifee (Notify-Kit)
Copyright (c) Invertase Limited
Licensed under the Apache License, Version 2.0.

## 4. Drizzle ORM
Copyright (c) Drizzle Team
Licensed under the Apache License, Version 2.0.

## 5. Zustand
Copyright (c) 2019 Paul Henschel
Licensed under the MIT License.

All other third-party trademarks, logos, and service marks are the property of their respective owners.
```
