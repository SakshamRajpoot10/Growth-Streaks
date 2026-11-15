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
let lastStepCount = 0;
let baseStepCount = 0;
let onStepUpdateCallback: ((log: FitnessDailyLog) => void) | null = null;

/**
 * Initializes and starts offline step tracking using Android's hardware pedometer
 */
export async function startStepTracker(
  onUpdate?: (log: FitnessDailyLog) => void
): Promise<boolean> {
  if (onUpdate) {
    onStepUpdateCallback = onUpdate;
  }

  try {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    const { status } = await Pedometer.requestPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }

    if (pedometerSubscription) {
      pedometerSubscription.remove();
      pedometerSubscription = null;
    }

    baseStepCount = 0;
    lastStepCount = 0;

    pedometerSubscription = Pedometer.watchStepCount((result) => {
      const delta = result.steps - lastStepCount;
      if (delta > 0) {
        lastStepCount = result.steps;
        recordStepsDelta(delta);
      }
    });

    return true;
  } catch (error) {
    return false;
  }
}

export function stopStepTracker(): void {
  if (pedometerSubscription) {
    pedometerSubscription.remove();
    pedometerSubscription = null;
  }
}

/**
 * Records newly detected steps into the current day's SQLite database
 */
export function recordStepsDelta(deltaSteps: number): FitnessDailyLog {
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
 * Manually add or test steps (ideal for simulator/calibration)
 */
export function addManualSteps(steps: number): FitnessDailyLog {
  return recordStepsDelta(steps);
}
