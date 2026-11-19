import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import notifee from 'react-native-notify-kit';
import { openDatabase } from '../../../db/client';
import {
  getTodayFitnessLog,
  upsertFitnessLog,
  FitnessDailyLog,
} from '../../../db/queries/fitness';
import { getToday } from '../../../utils/date';
import { NativeBridge } from '../../../services/native-bridge';

let pedometerSubscription: { remove: () => void } | null = null;
let liveSensorCleanup: (() => void) | null = null;
let onStepUpdateCallback: ((log: FitnessDailyLog) => void) | null = null;
let liveSessionBaseline = 0;
let lastRecordedTotal = 0;

/**
 * Clean up any legacy persistent pedometer notifications from prior versions
 */
export async function clearLegacyPedometerNotification(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await notifee.cancelNotification('standup_step_tracker_foreground');
    await notifee.stopForegroundService();
  } catch {}
}

/**
 * Initializes and starts background step tracking without any persistent notification.
 * Primary: Google Recording API on Mobile (play-services-fitness LocalRecordingClient)
 * Live: Low-power hardware step listener while app is in foreground
 * Fallback: Expo Sensors Pedometer
 */
export async function startStepTracker(
  onUpdate?: (log: FitnessDailyLog) => void
): Promise<boolean> {
  if (onUpdate) {
    onStepUpdateCallback = onUpdate;
  }

  // Remove any unwanted pedometer notification from shade
  await clearLegacyPedometerNotification();

  if (Platform.OS === 'web') {
    return true;
  }

  // 1. Primary Android Path: Google Recording API (Zero foreground notifications!)
  if (NativeBridge.isAvailable) {
    try {
      // Subscribe to background step collection (accountless, local on-device)
      await NativeBridge.subscribeRecordingApi();

      // Read current accumulated background steps
      const recordedSteps = await NativeBridge.readTodayRecordingSteps();
      const hourlyDistribution = await NativeBridge.readHourlyRecordingSteps();

      if (recordedSteps > 0) {
        lastRecordedTotal = recordedSteps;
        recordAbsoluteSteps(recordedSteps, hourlyDistribution);
      }

      // Start live foreground sensor listener for real-time walking UI ticks
      await NativeBridge.startLiveSensor();

      if (liveSensorCleanup) {
        liveSensorCleanup();
        liveSensorCleanup = null;
      }

      liveSensorCleanup = NativeBridge.onLiveSensorStepUpdate((liveSessionSteps) => {
        const liveTotal = lastRecordedTotal + liveSessionSteps;
        recordAbsoluteSteps(liveTotal);
      });

      return true;
    } catch {
      // Fall through to sensor fallback
    }
  }

  // 2. Fallback Path: Expo Sensors Hardware Pedometer
  try {
    const isAvailable = await Pedometer.isAvailableAsync().catch(() => false);
    if (!isAvailable) {
      return false;
    }

    const perm = await Pedometer.requestPermissionsAsync().catch(() => ({ status: 'denied', granted: false }));
    if (!perm.granted && perm.status !== 'granted') {
      return false;
    }

    if (pedometerSubscription) {
      try {
        pedometerSubscription.remove();
      } catch {}
      pedometerSubscription = null;
    }

    let initialHardwareCount = -1;

    pedometerSubscription = Pedometer.watchStepCount((result) => {
      try {
        const currentCount = Math.round(result.steps);
        if (initialHardwareCount === -1) {
          initialHardwareCount = currentCount;
          return;
        }
        const delta = Math.max(0, currentCount - initialHardwareCount);
        if (delta > 0) {
          const db = openDatabase();
          const log = getTodayFitnessLog(db, getToday());
          recordAbsoluteSteps(log.steps + delta);
          initialHardwareCount = currentCount;
        }
      } catch {}
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Refreshes fitness dashboard from the local Recording API source
 * Called whenever app returns to foreground or on user pull-to-refresh
 */
export async function refreshFitnessDashboard(): Promise<FitnessDailyLog> {
  const db = openDatabase();
  const today = getToday();
  const currentLog = getTodayFitnessLog(db, today);

  if (NativeBridge.isAvailable) {
    try {
      const recordedSteps = await NativeBridge.readTodayRecordingSteps();
      const hourlyDistribution = await NativeBridge.readHourlyRecordingSteps();

      if (recordedSteps > currentLog.steps) {
        lastRecordedTotal = recordedSteps;
        return recordAbsoluteSteps(recordedSteps, hourlyDistribution);
      }
    } catch {}
  }

  return currentLog;
}

export function stopStepTracker(): void {
  if (liveSensorCleanup) {
    liveSensorCleanup();
    liveSensorCleanup = null;
  }
  if (NativeBridge.isAvailable) {
    NativeBridge.stopLiveSensor().catch(() => {});
  }
  if (pedometerSubscription) {
    try {
      pedometerSubscription.remove();
    } catch {}
    pedometerSubscription = null;
  }
}

/**
 * Updates SQLite database with real source step count and computed biomechanical metrics
 */
export function recordAbsoluteSteps(
  totalStepsToday: number,
  customHourly?: Record<string, number>
): FitnessDailyLog {
  const db = openDatabase();
  const today = getToday();
  const currentLog = getTodayFitnessLog(db, today);

  const updatedSteps = Math.max(currentLog.steps, totalStepsToday);

  // Stride calculation: Average human stride ~0.762m
  const updatedDistance = parseFloat((updatedSteps * 0.000762).toFixed(2));

  // Metabolic calculations: ~0.04 kcal per step
  const updatedCalories = parseFloat((updatedSteps * 0.04).toFixed(1));

  // Active minutes: ~100 steps per active walking minute
  const updatedMinutes = Math.floor(updatedSteps / 100);

  const currentHour = String(new Date().getHours());
  const hourly = customHourly || { ...(currentLog.hourlyDistribution || {}) };
  if (!customHourly) {
    hourly[currentHour] = updatedSteps;
  }

  const updatedLog: FitnessDailyLog = {
    ...currentLog,
    date: today,
    steps: updatedSteps,
    distanceKm: updatedDistance,
    calories: updatedCalories,
    activeMinutes: updatedMinutes,
    hourlyDistribution: hourly,
  };

  upsertFitnessLog(db, updatedLog);

  if (onStepUpdateCallback) {
    onStepUpdateCallback(updatedLog);
  }

  return updatedLog;
}

/**
 * Manually add steps (for calibration / physical test verification)
 */
export function addManualSteps(stepsToAdd: number): FitnessDailyLog {
  const db = openDatabase();
  const today = getToday();
  const currentLog = getTodayFitnessLog(db, today);
  return recordAbsoluteSteps(currentLog.steps + stepsToAdd);
}
