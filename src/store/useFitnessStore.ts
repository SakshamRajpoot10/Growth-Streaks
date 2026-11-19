import { create } from 'zustand';
import { AppState, Platform } from 'react-native';
import { openDatabase } from '../db/client';
import {
  getFitnessGoal,
  setFitnessGoal,
  getAllFitnessGoals,
  setFitnessGoalForType,
  getTodayFitnessLog,
  calculateFitnessStreak,
  FitnessGoal,
  FitnessGoalType,
  UserFitnessGoals,
  FitnessDailyLog,
} from '../db/queries/fitness';
import { startStepTracker, addManualSteps, refreshFitnessDashboard } from '../features/fitness/services/pedometer-service';
import { getToday } from '../utils/date';

interface FitnessState {
  log: FitnessDailyLog;
  goal: FitnessGoal;
  userGoals: UserFitnessGoals;
  fitnessStreak: number;
  isTracking: boolean;
  loadFitnessData: () => void;
  updateGoal: (type: FitnessGoalType, target: number) => void;
  updateSpecificGoal: (type: FitnessGoalType, target: number | null) => void;
  simulateWalk: (steps: number) => void;
  startTracking: () => Promise<void>;
}

let lastObservedDate = getToday();
let isTrackingInitialized = false;

export const useFitnessStore = create<FitnessState>((set, get) => ({
  log: {
    date: getToday(),
    steps: 0,
    distanceKm: 0.0,
    calories: 0.0,
    activeMinutes: 0,
    goalType: 'steps',
    goalTarget: 0,
    goalCompleted: false,
    hourlyDistribution: {},
  },
  goal: {
    id: '',
    goalType: 'steps',
    targetValue: 0,
    isActive: false,
    createdAt: Date.now(),
  },
  userGoals: {
    steps: null,
    distance_km: null,
    heart_points: null,
    calories: null,
  },
  fitnessStreak: 0,
  isTracking: false,

  loadFitnessData: () => {
    try {
      const db = openDatabase();
      const today = getToday();
      const currentGoal = getFitnessGoal(db);
      const userGoals = getAllFitnessGoals(db);
      const currentLog = getTodayFitnessLog(db, today);
      const streak = calculateFitnessStreak(db);

      lastObservedDate = today;

      set({
        goal: currentGoal,
        userGoals,
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

  updateSpecificGoal: (type, target) => {
    try {
      const db = openDatabase();
      setFitnessGoalForType(db, type, target);
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

    // Prevent duplicate listeners
    if (isTrackingInitialized) {
      return;
    }

    const success = await startStepTracker((updatedLog) => {
      const db = openDatabase();
      const streak = calculateFitnessStreak(db);
      set({ log: updatedLog, fitnessStreak: streak });
    });

    if (success) {
      isTrackingInitialized = true;
    }
    set({ isTracking: success });
  },
}));

// Background-to-Foreground Resume & Midnight Auto-Rollover Listener
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', async (nextState) => {
    if (nextState === 'active') {
      const store = useFitnessStore.getState();
      const currentDate = getToday();

      // Midnight check: if date has rolled over, reload fresh 0-step record for new day
      if (currentDate !== lastObservedDate) {
        lastObservedDate = currentDate;
      }
      try {
        const refreshed = await refreshFitnessDashboard();
        const db = openDatabase();
        const streak = calculateFitnessStreak(db);
        useFitnessStore.setState({ log: refreshed, fitnessStreak: streak });
      } catch {}
      store.loadFitnessData();
      store.startTracking().catch(() => {});
    }
  });

  // Periodic 30-second date check for midnight 00:00:00 rollover while app stays open
  setInterval(() => {
    const currentDate = getToday();
    if (currentDate !== lastObservedDate) {
      lastObservedDate = currentDate;
      useFitnessStore.getState().loadFitnessData();
    }
  }, 30000);
}
