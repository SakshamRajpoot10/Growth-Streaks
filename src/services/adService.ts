import { Platform } from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

/**
 * AdService handles all monetization triggers:
 * 1. Alarm completion reward ad (User slides green / turns off alarm)
 * 2. Fitness milestone reward ad (User hits 2km/step goal)
 * 3. Smart Interstitial skippable ad
 * 
 * Note: Uses Google Test IDs in development to ensure zero account bans.
 * Production ad units will take over seamlessly in live builds.
 */

// Production ad units can be plugged in here or loaded from config
const REWARDED_AD_UNIT_ID = __DEV__ 
  ? TestIds.REWARDED 
  : (process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || TestIds.REWARDED);

const INTERSTITIAL_AD_UNIT_ID = __DEV__ 
  ? TestIds.INTERSTITIAL 
  : (process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || TestIds.INTERSTITIAL);

let rewardedAd: RewardedAd | null = null;
let interstitialAd: InterstitialAd | null = null;
let isRewardedLoaded = false;
let isInterstitialLoaded = false;

// Preload the ads immediately
export function initAdService() {
  if (Platform.OS === 'web') return;

  try {
    // 1. Initialize Rewarded Ad
    rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isRewardedLoaded = true;
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      console.log('User earned reward:', reward);
    });

    rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      isRewardedLoaded = false;
      // Preload next reward ad
      rewardedAd?.load();
    });

    rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('Rewarded ad failed to load (offline or no fill):', error);
      isRewardedLoaded = false;
    });

    rewardedAd.load();

    // 2. Initialize Interstitial Ad
    interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      isInterstitialLoaded = true;
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      isInterstitialLoaded = false;
      interstitialAd?.load();
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('Interstitial ad error (offline or no fill):', error);
      isInterstitialLoaded = false;
    });

    interstitialAd.load();
  } catch (e) {
    console.warn('AdMob init error (safe offline fallback):', e);
  }
}

/**
 * Triggered when user completes an alarm (slides right green / standing alarm done)
 */
export async function showAlarmCompletionRewardAd(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (!isRewardedLoaded || !rewardedAd) {
    // If rewarded ad hasn't finished loading yet, try interstitial fallback or pass gracefully
    if (isInterstitialLoaded && interstitialAd) {
      try {
        await interstitialAd.show();
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  try {
    await rewardedAd.show();
    return true;
  } catch (err) {
    console.warn('Could not show alarm reward ad:', err);
    return false;
  }
}

/**
 * Triggered when user completes their daily fitness/step goal
 */
export async function showFitnessMilestoneRewardAd(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (isRewardedLoaded && rewardedAd) {
    try {
      await rewardedAd.show();
      return true;
    } catch (err) {
      return false;
    }
  } else if (isInterstitialLoaded && interstitialAd) {
    try {
      await interstitialAd.show();
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
}

/**
 * Generic clean skippable full-screen ad
 */
export async function showSmartInterstitialAd(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (isInterstitialLoaded && interstitialAd) {
    try {
      await interstitialAd.show();
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}
