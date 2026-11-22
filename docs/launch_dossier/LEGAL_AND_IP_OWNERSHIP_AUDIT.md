# StandUp — Legal & Intellectual Property Ownership Audit
**Document Version:** 1.0.0  
**Jurisdiction Focus:** India (Copyright Act, 1957; Trade Marks Act, 1999) & International IP  
**Application:** StandUp — Discipline & Habit Alarm OS  
**Repository:** `https://github.com/SakshamRajpoot10/Growth-Streaks`

---

## 1. Investigation of the Root `LICENSE` File

### A. Current File Contents & Discovery
The root repository contains a file named `LICENSE` with the following verbatim text:
```text
The MIT License (MIT)
Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
...
```

### B. Forensics: How and Why is this File Present?
- **Origin:** When the repository was initially scaffolded using `npx create-expo-app` (or an Expo starter template), Expo automatically bundled its default MIT license file bearing the copyright of `650 Industries, Inc.` (the parent company of Expo).
- **Scope & Legal Risk:**  
  Because this file sits in the root directory without qualification, third parties inspecting the public GitHub repository could legally misinterpret that:
  1. The entire StandUp application is owned by 650 Industries, Inc.
  2. The owner's original source code, proprietary algorithms, database schemas, and custom UI designs have been released into the public domain / open source under the permissive MIT license.
- **Critical Recommendation:**
  - **Do NOT delete the file blindly.** Expo's underlying starter code retains its original MIT license from 650 Industries, Inc.
  - **Correction Strategy:** Move Expo's license notice into a dedicated `THIRD_PARTY_NOTICES.md` file, and establish a clear, proprietary root `LICENSE` / `COPYRIGHT` declaration stating:
    > *"StandUp Application and original source code Copyright © 2026 [Owner Name]. All Rights Reserved. Underlying third-party frameworks and open-source libraries are licensed under their respective terms."*

---

## 2. Intellectual Property Ownership Inventory

| Component / Asset | Primary Source / Author | Legal Status & Underlying License | Intended Ownership | Evidence & Audit Findings | Required Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Original React Native & TypeScript UI** | Application Owner (Assisted by AI tools) | Proprietary Application Code | **Application Owner (100% Exclusive)** | Unique UI structure, habit cards, fitness sparklines, custom modals | Declare proprietary copyright notice |
| **Native Kotlin Alarm Engine (`StandUpAlarmService`)** | Application Owner (Assisted by AI tools) | Proprietary Native Code | **Application Owner (100% Exclusive)** | Custom AlarmManager service, reboot receiver, lockscreen activity | Declare proprietary copyright notice |
| **Native Background Step Bridge (`StandUpNativeModule`)** | Application Owner (Assisted by AI tools) | Proprietary Native Code | **Application Owner (100% Exclusive)** | Native bridge linking LocalRecordingClient to React Native | Declare proprietary copyright notice |
| **SQLite Schema & Analytics Queries** | Application Owner (Assisted by AI tools) | Proprietary Database Design | **Application Owner (100% Exclusive)** | Drizzle/SQLite schema for tasks, logs, streaks, and fitness logs | Declare proprietary copyright notice |
| **App Branding, Name & Identity ("StandUp")** | Application Owner | Common Law Trademark / Commercial Identity | **Application Owner (100% Exclusive)** | First commercial use in software and store distribution | File trademark application (Class 9/42) |
| **App Icon & Adaptive Visuals** | Application Owner / Repository Assets | Proprietary Artwork | **Application Owner (100% Exclusive)** | `./assets/images/icon.png`, adaptive foreground/background | Retain high-res masters |
| **21 Alarm Audio Files (`res/raw/*.mp3`)** | Externally Sourced Audio Tracks | Royalty-Free / Public Domain / Commercial License | **Licensed for Commercial Use** | 21 MP3 files in `android/app/src/main/res/raw/` | **OWNER ACTION REQUIRED:** Verify origin & commercial clearance |
| **Expo Framework & CLI** | 650 Industries, Inc. | Open Source (MIT) | 650 Industries, Inc. | Node modules, build tools | Attribute in `THIRD_PARTY_NOTICES.md` |
| **React Native Framework** | Meta Platforms, Inc. | Open Source (MIT) | Meta Platforms, Inc. | Core React Native libraries | Attribute in `THIRD_PARTY_NOTICES.md` |
| **Android Jetpack & Google Play Services** | Google LLC | Open Source (Apache 2.0) & Google API Terms | Google LLC | AndroidX, LocalRecordingClient | Attribute in `THIRD_PARTY_NOTICES.md` |

---

## 3. Legal Principles under the Indian Copyright Act, 1957

### A. Section 17 — First Ownership of Copyright
Under Indian law, the author of a work is the first owner of copyright. For computer programs:
- A computer program is protected as a **"literary work"** under Section 2(o).
- The individual who conceives, designs, directs, and compiles the software is the author.

### B. Section 2(d)(vi) — Computer-Generated Works & AI Contributions
Section 2(d)(vi) of the Copyright Act, 1957 defines the author of a computer-generated work as:
> *"in relation to any literary, dramatic, musical or artistic work which is computer-generated, the person who causes the work to be created."*

Because the application owner directed the entire architectural prompt sequence, selected the algorithmic structures, audited the code, integrated the components, tested on physical hardware, and created the compiled output, the legal position in India supports the owner as the person who **caused the work to be created**.

### C. Human Contributor Assignments (Section 18 & 19)
If any human contractors, freelance developers, or UI designers contributed code or graphic assets outside of an employment contract:
- Section 19 mandates that an assignment of copyright must be **in writing, signed by the assignor**, identifying the specific work, rights assigned, territorial extent (India and Worldwide), and consideration.
- A draft Assignment Agreement is provided in `COPYRIGHT_OWNERSHIP_DRAFT.md`.

---

## 4. Official Indian Copyright Registration Process (Software)

The application owner may optionally register the StandUp software with the **Copyright Office of India** ([copyright.gov.in](https://copyright.gov.in/)):

1. **Category:** Computer Software Work (Literary).
2. **Statutory Form:** Form XIV (Statement of Particulars & Statement of Further Particulars).
3. **Required Source Code Extract:**
   - As per Copyright Office guidelines, applicants must submit the **first 10 pages and last 10 pages** (or first 20 and last 20 pages) of source code in PDF format, ensuring sensitive cryptographic keys or passwords are not exposed.
4. **Government Statutory Fee:**
   - ₹500 (Non-commercial / individual applicant) or ₹2,000 (Commercial software).
5. **Mandatory 30-Day Objection Period:** After filing, a mandatory 30-day waiting period applies for any third-party objections before the Copyright Registrar issues the registration certificate (Dairy Number $\rightarrow$ Scrutiny $\rightarrow$ ROC).
