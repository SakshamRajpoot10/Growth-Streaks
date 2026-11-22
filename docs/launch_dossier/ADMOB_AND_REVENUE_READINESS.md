# AdMob Monetization & Revenue Readiness Report
**Document Version:** 1.0.0  
**Publisher Account ID:** `pub-9675414045566238`  
**Application ID:** `ca-app-pub-9675414045566238~1521257692`  
**Application Package:** `com.growthstreaks.standup`

---

## 1. Executive Summary of AdMob Configuration

StandUp integrates a strictly controlled, non-intrusive monetization architecture powered by **Google AdMob**. All advertising revenues accrue directly and exclusively to the owner's Google AdMob publisher account.

### Production Ad Unit Inventory
| Ad Format | Ad Unit ID | User Placement | Trigger Conditions & Frequency Limits |
| :--- | :--- | :--- | :--- |
| **Rewarded Ad (Unit A)** | `ca-app-pub-9675414045566238/9370781377` | Post-Routine Completion (Streak Shield) | 100% voluntary user opt-in to earn streak protection |
| **Rewarded Ad (Unit B)** | `ca-app-pub-9675414045566238/9917576285` | Emergency Alarm Snooze Reward | Optional snooze unlock; requires full video watch |
| **App Open Ad** | `ca-app-pub-9675414045566238/8720044686` | Cold Launch / App Resume | **4-hour cooldown frequency cap**; strictly blocked during alarms |

---

## 2. Critical Safety Mechanisms (Zero Disruption)

In [admob-service.ts](file:///D:/PROJECTS/Growth%20Streaks/growth-streaks/src/services/admob-service.ts#L44-L135), StandUp enforces strict safety locks:
1. **Active Alarm Interruption Lock:** Advertisements are programmatically forbidden from loading or displaying while `StandUpAlarmActivity` or `IncomingAlarmModal` is ringing.
2. **Camera Verification Lock:** Advertisements are locked out while the front camera is actively analyzing wake-up posture.
3. **Automated Fallbacks:** If the device is offline or AdMob returns `no-fill`, the app functions normally with zero UI freezing or crashes.
4. **Test vs. Production Isolation:** In development builds (`__DEV__ = true`), official Google test unit IDs (`ca-app-pub-3940256099942544/...`) are loaded automatically. In release builds (`__DEV__ = false`), live production units are loaded.

---

## 3. Store Eligibility & Third-Party Store Compatibility

### Official Google AdMob Policy Insight
Google AdMob enforces an **"App Readiness" review** process. Under official AdMob documentation ([support.google.com/admob/answer/9989980](https://support.google.com/admob/answer/9989980)):
- **Samsung Galaxy Store** is an **officially supported third-party Android store**.
- **PhonePe Appstore (formerly Indus Appstore)** is **not currently on Google's published supported third-party store list**.

### Strategic Implication & Operational Solution:
> [!IMPORTANT]
> If an app is published *only* on an unsupported store, AdMob imposes ad-serving limitations (ad limits or zero fill).
> 
> **The Solution:** Because both PhonePe Appstore and Samsung Galaxy Store will distribute the exact same package ID (`com.growthstreaks.standup`), once StandUp is approved and live on **Samsung Galaxy Store**, the owner can link the app in Google AdMob Console under:
> **`AdMob Console > Apps > StandUp > App Settings > App Store > Add Store > Samsung Galaxy Store`**.
> 
> Linking the Samsung store listing fully satisfies AdMob's App Readiness verification, unlocking active global ad serving and full fill rates across all installations sharing that package ID!

---

## 4. `app-ads.txt` Deployment Requirement

Google AdMob requires developers to host an `app-ads.txt` file on their public developer website domain to prevent unauthorized ad inventory spoofing.

### Required `app-ads.txt` Content:
```text
google.com, pub-9675414045566238, DIRECT, f08c47fec0942fa0
```

### Action Required:
1. The developer website URL entered in store listings (e.g., `https://growthstreaks.com` or `https://sakshamrajpoot.com`) must host this exact file at the root:
   `https://[DEVELOPER-DOMAIN]/app-ads.txt`
2. AdMob crawlers will automatically detect and verify the record within 24 hours of store listing publication.

---

## 5. Owner Financial & Tax Checklist (AdMob Console)

The owner must verify the following directly in the official Google AdMob dashboard ([admob.google.com](https://admob.google.com/)):
- [ ] **Payment Profile:** Linked to the owner's legal name.
- [ ] **Bank Account:** Added Indian bank account details (SWIFT code, IFSC, Account Number) for direct wire transfer payouts in INR.
- [ ] **Tax Information:** Completed Indian GSTIN/PAN declaration or US tax status (Form W-8BEN for foreign individuals to claim tax treaty benefits).
- [ ] **Self-Clicking Policy Warning:** Never click ads running on your own physical devices. AdMob's invalid traffic algorithm strictly suspends accounts that generate artificial impressions.
