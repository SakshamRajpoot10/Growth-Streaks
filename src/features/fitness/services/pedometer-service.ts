import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import { openDatabase } from '../../../db/client';
import {
  getTodayFitnessLog,
  upsertFitnessLog,
  FitnessDailyLog,
} from '../../../db/queries/fitness';
import { getToday } from '../../../utils/date';

let pedometerSubscription: { remove: () => void } | null = null;
let onStepUpdateCallback: ((log: FitnessDailyLog) => void) | null = null;

// Baseline and tracking state
let initialBaselineEstablished = false;
let lastRawSensorSteps = 0;
let lastStepTimestamp = 0;

// Walking cadence & sedentary fidget filter
// Normal human walking: 320ms - 1800ms between steps (~1.2 to 2.5 steps/sec)
const MIN_STEP_INTERVAL_MS = 320;  // Reject rapid shaking, screen taps, chair vibration
const MAX_STEP_INTERVAL_MS = 1800; // Pause threshold: if >1.8s between movements, walking has paused
const MIN_CONSECUTIVE_STEPS = 3;   // Must detect at least 3 rhythmic steps before committing (rejects sitting twitches)

let bufferedSteps = 0;
let consecutiveRhythmicCount = 0;
let isWalkSessionActive = false;

/**
 * Initializes and starts precision step tracking using Android's hardware pedometer
 * with cadence verification and sedentary/chair fidget rejection.
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

    const perm = await Pedometer.requestPermissionsAsync().catch(() => ({ status: 'denied' }));
    if (perm.status !== 'granted') {
      return false;
    }

    if (pedometerSubscription) {
      try {
        pedometerSubscription.remove();
      } catch {}
      pedometerSubscription = null;
    }

    // Reset session states
    initialBaselineEstablished = false;
    lastRawSensorSteps = 0;
    lastStepTimestamp = 0;
    bufferedSteps = 0;
    consecutiveRhythmicCount = 0;
    isWalkSessionActive = false;

    pedometerSubscription = Pedometer.watchStepCount((result) => {
      try {
        processRawSensorEvent(result.steps);
      } catch {}
    });

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * High-accuracy gait processor:
 * Filters out sitting fidgets, shaking, typing, and normalizes step counts to true footfalls.
 */
function processRawSensorEvent(currentRawSteps: number): void {
  const now = Date.now();

  // 1. Establish initial baseline: do NOT count device boot or accumulated steps as new steps
  if (!initialBaselineEstablished) {
    initialBaselineEstablished = true;
    lastRawSensorSteps = currentRawSteps;
    lastStepTimestamp = now;
    return;
  }

  const rawDelta = currentRawSteps - lastRawSensorSteps;
  if (rawDelta <= 0) {
    return;
  }

  // Update last seen raw step count
  lastRawSensorSteps = currentRawSteps;

  const elapsed = now - lastStepTimestamp;

  // 2. High-Frequency Noise Filter:
  // If an event comes faster than 320ms, it's screen typing, phone vibration, or jitter. Reject.
  if (elapsed < MIN_STEP_INTERVAL_MS && lastStepTimestamp > 0) {
    return;
  }

  // 3. Cadence and Walking Rhythm Analysis:
  if (elapsed <= MAX_STEP_INTERVAL_MS && lastStepTimestamp > 0) {
    // Within walking cadence (0.32s - 1.8s) -> rhythmic step detected
    consecutiveRhythmicCount += 1;

    // Normal human walking is 1 step per cadence event.
    // Cap any sudden sensor spikes to prevent 1 step becoming 9 steps.
    const stepsToAdd = Math.min(rawDelta, Math.max(1, Math.round(elapsed / 450)));

    if (!isWalkSessionActive) {
      bufferedSteps += stepsToAdd;

      // Only activate walking session and commit if user takes >= MIN_CONSECUTIVE_STEPS
      if (consecutiveRhythmicCount >= MIN_CONSECUTIVE_STEPS) {
        isWalkSessionActive = true;
        const totalToCommit = bufferedSteps;
        bufferedSteps = 0;
        recordStepsDelta(totalToCommit);
      }
    } else {
      // Walk session already active -> record real step directly
      recordStepsDelta(stepsToAdd);
    }
  } else {
    // Gap was longer than 1.8s -> User stopped walking, stood still, or is sitting in chair
    // Reset buffer (discards isolated fidgets / 1-2 twitches while seated)
    consecutiveRhythmicCount = 1;
    bufferedSteps = 1;
    isWalkSessionActive = false;
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
}

/**
 * Records newly detected steps into the current day's SQLite database
 */
export function recordStepsDelta(deltaSteps: number): FitnessDailyLog {
  if (deltaSteps <= 0) {
    const db = openDatabase();
    return getTodayFitnessLog(db, getToday());
  }

  const db = openDatabase();
  const today = getToday();
  const currentLog = getTodayFitnessLog(db, today);

  const updatedSteps = currentLog.steps + deltaSteps;

  // Stride calculations: Average stride length ~0.762m
  const updatedDistance = parseFloat((updatedSteps * 0.000762).toFixed(2));

  // Metabolic calculations: ~0.04 kcal per step
  const updatedCalories = parseFloat((updatedSteps * 0.04).toFixed(1));

  // Move minutes: ~100 steps per minute of active walking
  const updatedMinutes = Math.floor(updatedSteps / 100);

  // Hourly distribution bucket
  const currentHour = String(new Date().getHours());
  const hourly = { ...(currentLog.hourlyDistribution || {}) };
  hourly[currentHour] = (hourly[currentHour] || 0) + deltaSteps;

  const updatedLog: FitnessDailyLog = {
    ...currentLog,
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
 * Manually add or test steps (ideal for calibration)
 */
export function addManualSteps(steps: number): FitnessDailyLog {
  return recordStepsDelta(steps);
}
