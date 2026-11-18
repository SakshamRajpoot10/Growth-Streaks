import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import notifee, { AndroidImportance } from 'react-native-notify-kit';
import { openDatabase } from '../../../db/client';
import {
  getTodayFitnessLog,
  upsertFitnessLog,
  FitnessDailyLog,
} from '../../../db/queries/fitness';
import { getToday } from '../../../utils/date';

let pedometerSubscription: { remove: () => void } | null = null;
let onStepUpdateCallback: ((log: FitnessDailyLog) => void) | null = null;
let isForegroundServiceRunning = false;

export const PEDOMETER_SERVICE_CHANNEL_ID = 'standup_pedometer_service';

/**
 * Ensures the low-importance, silent channel for 24/7 background tracking exists
 */
async function initializePedometerChannel(): Promise<string> {
  try {
    return await notifee.createChannel({
      id: PEDOMETER_SERVICE_CHANNEL_ID,
      name: 'StandUp 24/7 Step Tracker',
      importance: AndroidImportance.LOW,
      vibration: false,
      lights: false,
    });
  } catch {
    return PEDOMETER_SERVICE_CHANNEL_ID;
  }
}

/**
 * Updates or launches the persistent Android Foreground Service notification
 * ensuring Android never suspends the pedometer sensor when app is closed.
 */
export async function syncPedometerForegroundNotification(steps: number): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const channelId = await initializePedometerChannel();
    await notifee.displayNotification({
      id: 'standup_step_tracker_foreground',
      title: 'StandUp Fitness Active',
      body: `🚶 ${steps.toLocaleString()} steps tracked today • 24/7 Active`,
      android: {
        channelId,
        asForegroundService: true,
        ongoing: true,
        autoCancel: false,
        pressAction: {
          id: 'default',
        },
      },
    });
    isForegroundServiceRunning = true;
  } catch {
    // Handled safely
  }
}

// Pedometer tracking state
let lastRawSensorSteps = 0;
let lastStepTimestamp = 0;

// Walking cadence bounds
// Human walking/jogging: 280ms to 2400ms between footsteps (~0.4 to 3.5 steps/sec)
const MIN_STEP_INTERVAL_MS = 280;   // Rejects engine vibrations, motorcycle chatter, fast shaking
const MAX_STRIDE_INTERVAL_MS = 2500; // Normal stride pause limit

// Sitting fidget / stationary filter state
let candidateBuffer = 0;
let candidateTimestamp = 0;
let bufferResetTimeout: NodeJS.Timeout | null = null;

/**
 * Initializes and starts offline real-time step tracking using Android's hardware pedometer
 * with intelligent gait cadence verification and vehicle/bike vibration rejection.
 */
export async function startStepTracker(
  onUpdate?: (log: FitnessDailyLog) => void
): Promise<boolean> {
  if (onUpdate) {
    onStepUpdateCallback = onUpdate;
  }

  if (Platform.OS === 'web') {
    return true;
  }

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

    // Reset session states
    lastRawSensorSteps = 0;
    lastStepTimestamp = 0;
    candidateBuffer = 0;

    pedometerSubscription = Pedometer.watchStepCount((result) => {
      try {
        processSensorStepResult(result.steps);
      } catch {}
    });

    // Start 24/7 foreground service notification
    try {
      const db = openDatabase();
      const currentLog = getTodayFitnessLog(db, getToday());
      syncPedometerForegroundNotification(currentLog.steps).catch(() => {});
    } catch {}

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gait cadence & vehicle rejection processor:
 * - Rejects high-frequency bike/motorcycle vibrations (<280ms)
 * - Rejects single-twitch sitting fidgets (requires 2 consecutive rhythmic strides before committing)
 * - Accurately records walking and jogging footfalls in real time
 */
function processSensorStepResult(rawSteps: number): void {
  const currentStepNum = Math.round(rawSteps);
  const now = Date.now();

  // First event: Establish initial sensor baseline
  if (lastRawSensorSteps === 0) {
    lastRawSensorSteps = currentStepNum;
    lastStepTimestamp = now;
    // Android PedometerModule starts at 1 for the first detected step
    recordStepsDelta(1);
    return;
  }

  const rawDelta = currentStepNum - lastRawSensorSteps;
  if (rawDelta <= 0) {
    return;
  }

  lastRawSensorSteps = currentStepNum;
  const elapsed = now - lastStepTimestamp;

  // 1. Bike / Motorcycle Engine Vibration Filter:
  // Engine vibrations and road bumps generate rapid pulses faster than human stride (< 280ms)
  if (elapsed < MIN_STEP_INTERVAL_MS && lastStepTimestamp > 0) {
    // High-frequency vibration (bike/vehicle/screen tap jitter) -> REJECT
    return;
  }

  // Normalize step delta to human biomechanics (1-2 steps per footfall event, never 9)
  const safeDelta = Math.min(rawDelta, Math.max(1, Math.round(elapsed / 450)));

  // 2. Sitting in Chair / Stationary Fidget Filter:
  if (elapsed > MAX_STRIDE_INTERVAL_MS || lastStepTimestamp === 0) {
    // Gap was large: Person was sitting, standing still, or stationary
    // Buffer candidate step. If user takes another step within 2.5s, walking is confirmed!
    candidateBuffer = safeDelta;
    candidateTimestamp = now;

    if (bufferResetTimeout) clearTimeout(bufferResetTimeout);
    bufferResetTimeout = setTimeout(() => {
      // No follow-up step occurred within 3s -> It was an isolated sitting twitch! Discard.
      candidateBuffer = 0;
    }, 3000);
  } else {
    // Within normal walking cadence (280ms - 2500ms):
    if (bufferResetTimeout) {
      clearTimeout(bufferResetTimeout);
      bufferResetTimeout = null;
    }

    if (candidateBuffer > 0) {
      // Walking confirmed! Commit the buffered initial step plus current step
      const stepsToCommit = candidateBuffer + safeDelta;
      candidateBuffer = 0;
      recordStepsDelta(stepsToCommit);
    } else {
      // Already in active walking session -> record step immediately
      recordStepsDelta(safeDelta);
    }
  }

  lastStepTimestamp = now;
}

export function stopStepTracker(): void {
  if (pedometerSubscription) {
    try {
      pedometerSubscription.remove();
    } catch {}
    pedometerSubscription = null;
  }
  if (bufferResetTimeout) {
    clearTimeout(bufferResetTimeout);
    bufferResetTimeout = null;
  }
}

/**
 * Records newly detected steps into the current day's SQLite database
 * Automatically handles midnight rollover (creating a fresh 0-step record for the new day)
 */
export function recordStepsDelta(deltaSteps: number): FitnessDailyLog {
  const db = openDatabase();
  const today = getToday();
  const currentLog = getTodayFitnessLog(db, today);

  const updatedSteps = currentLog.steps + Math.max(1, deltaSteps);

  // Stride calculation: Average human stride ~0.762m
  const updatedDistance = parseFloat((updatedSteps * 0.000762).toFixed(2));

  // Metabolic calculations: ~0.04 kcal per step
  const updatedCalories = parseFloat((updatedSteps * 0.04).toFixed(1));

  // Active minutes: ~100 steps per active walking minute
  const updatedMinutes = Math.floor(updatedSteps / 100);

  // Live hourly distribution bucket for today's trading chart
  const currentHour = String(new Date().getHours());
  const hourly = { ...(currentLog.hourlyDistribution || {}) };
  hourly[currentHour] = (hourly[currentHour] || 0) + deltaSteps;

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

  syncPedometerForegroundNotification(updatedSteps).catch(() => {});

  if (onStepUpdateCallback) {
    onStepUpdateCallback(updatedLog);
  }

  return updatedLog;
}

/**
 * Manually add or test steps (for calibration)
 */
export function addManualSteps(steps: number): FitnessDailyLog {
  return recordStepsDelta(steps);
}
