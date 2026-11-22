# StandUp — Master Launch Sequence & Approval Gate
**Document Version:** 1.0.0  
**Application:** StandUp — Discipline & Habit Alarm OS  
**Package:** `com.growthstreaks.standup`

---

## 1. Launch Governance Protocol

To safeguard account ownership, financial security, and intellectual property, the rollout is structured into six gated stages. **Advancement from one stage to the next requires explicit owner authorization.**

```
[ STAGE A: Legal & Compliance Preparation ] (COMPLETED)
                     ↓
[ STAGE B: Store Account Enrollment & KYC ] (OWNER EXECUTED)
                     ↓
[ STAGE C: Production Packaging & Release Keystore ] (TECHNICAL PREPARATION)
                     ↓
[ STAGE D: Portal Metadata & Binary Upload ] (OWNER SUPERVISED)
                     ↓
[ STAGE E: Store Certification & Public Release ] (FINAL OWNER APPROVAL)
                     ↓
[ STAGE F: Post-Launch AdMob Verification & Telemetry ] (MAINTENANCE)
```

---

## 2. Stage Breakdown & Exact Actions

### STAGE A: Legal & Compliance Preparation (CURRENT — COMPLETED)
- [x] Complete technical audit of the compiled release APK.
- [x] Verify genuine physical device screenshots and slot mapping.
- [x] Audit root `LICENSE` file and third-party dependencies.
- [x] Prepare DPDP Act 2023 compliant Privacy Policy and Terms of Service drafts.
- [x] Prepare store listing copy for PhonePe and Samsung stores.
- [x] Compile the complete 18-document Launch Dossier.

---

### STAGE B: Store Account Enrollment & KYC (NEXT STAGE — OWNER EXECUTED)
*Goal:* Establish verified developer accounts under the owner's sole legal identity.
- **Action B.1 (PhonePe):** Owner navigates to [developer.phonepeappstore.com/signup](https://developer.phonepeappstore.com/signup), enters mobile number, verifies OTP, and enters PAN details.
- **Action B.2 (Samsung):** Owner logs into [seller.samsungapps.com](https://seller.samsungapps.com/), completes Private Seller registration, and uploads government ID for commercial verification.
- **Action B.3 (Web Hosting):** Owner establishes a public URL for hosting `Privacy Policy` and `app-ads.txt` (via GitHub Pages or custom domain).

---

### STAGE C: Production Packaging & Release Keystore
*Goal:* Generate a secure, permanent production signing key and compile the final signed binaries.
- **Action C.1:** Generate production PKCS12 release keystore (`standup-release.keystore`). Owner retains backup.
- **Action C.2:** Configure GitHub Actions secret or local Gradle signing properties with production keystore.
- **Action C.3:** Build final production release APK (`com.growthstreaks.standup`).
- **Action C.4:** Verify SHA-256 binary hash and test installation on physical device.

---

### STAGE D: Portal Metadata & Binary Upload
*Goal:* Populate store listings and upload binary artifacts without publishing.
- **Action D.1 (PhonePe):** Upload APK, icon, 6 genuine screenshots, title, descriptions, category, and reviewer instructions.
- **Action D.2 (Samsung):** Upload APK, visual assets, metadata, age rating, and reviewer instructions explaining the lock-screen alarm and camera verification.
- **Action D.3 (Pre-Submission Review):** Present full portal summary to the owner for final review.

---

### STAGE E: Store Certification & Public Release
*Goal:* Review and approval by store QA teams followed by public release.
- **Action E.1:** Owner clicks **"Submit for Review"** in PhonePe Developer Portal and Samsung Seller Portal.
- **Action E.2:** Monitor review status (typically 24–72 hours for PhonePe, 2–5 days for Samsung).
- **Action E.3:** Once approved, trigger public release upon owner confirmation.

---

### STAGE F: Post-Launch AdMob Verification & Telemetry
*Goal:* Activate full advertising revenue streams and monitor production health.
- **Action F.1:** Link approved Samsung Galaxy Store listing in Google AdMob Console (`Apps > StandUp > App Settings > App Store > Samsung Galaxy Store`).
- **Action F.2:** Verify AdMob crawler crawls and confirms `app-ads.txt`.
- **Action F.3:** Verify active live ad impressions and eCPM analytics.
- **Action F.4:** Monitor user reviews and crash telemetry.
