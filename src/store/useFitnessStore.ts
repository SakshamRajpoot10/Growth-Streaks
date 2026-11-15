import { create } from 'zustand';
import { openDatabase } from '../db/client';
import {
  getFitnessGoal,
  setFitnessGoal,
  getTodayFitnessLog,
  calculateFitnessStreak,
  FitnessGoal,
  FitnessGoalType,
  FitnessDailyLog,
} from '../db/queries/fitness';
import { startStepTracker, addManualSteps } from '../features/fitness/services/pedometer-service';

interface FitnessState {
  log: FitnessDailyLog;
  goal: FitnessGoal;
  fitnessStreak: number;
  isTracking: boolean;
  loadFitnessData: () => void;
  updateGoal: (type: FitnessGoalType, target: number) => void;
  simulateWalk: (steps: number) => void;
  startTracking: () => Promise<void>;
}

export const useFitnessStore = create<FitnessState>((set, get) => ({
  log: {
    date: new Date().toISOString().slice(0, 10),
    steps: 0,
    distanceKm: 0.0,
    calories: 0.0,
    activeMinutes: 0,
    goalType: 'distance_km',
    goalTarget: 3.0,
    goalCompleted: false,
    hourlyDistribution: {},
  },
  goal: {
    id: 'default',
    goalType: 'distance_km',
    targetValue: 3.0,
    isActive: true,
    createdAt: Date.now(),
  },
  fitnessStreak: 0,
  isTracking: false,

  loadFitnessData: () => {
    try {
      const db = openDatabase();
      const currentGoal = getFitnessGoal(db);
      const currentLog = getTodayFitnessLog(db);
      const streak = calculateFitnessStreak(db);

      set({
        goal: currentGoal,
        log: currentLog,
        fitnessStreak: streak,
      });
    } catch {
      // Safety
    }
  },

  updateGoal: (type, target) => {
    try {
      const db = openDatabase();
      setFitnessGoal(db, type, target);
      get().loadFitnessData();
    } catch {
      // Safety
    }
  },

  simulateWalk: (steps: number) => {
    try {
      const updated = addManualSteps(steps);
      const db = openDatabase();
      const streak = calculateFitnessStreak(db);
      set({ log: updated, fitnessStreak: streak });
    } catch {
      // Safety
    }
  },

  startTracking: async () => {
    get().loadFitnessData();
    const success = await startStepTracker((updatedLog) => {
      const db = openDatabase();
      const streak = calculateFitnessStreak(db);
      set({ log: updatedLog, fitnessStreak: streak });
    });
    set({ isTracking: success });
  },
}));
