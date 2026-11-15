import * as SQLite from 'expo-sqlite';
import { generateUUID } from '../../utils/uuid';
import { getToday } from '../../utils/date';

export type FitnessGoalType = 'distance_km' | 'calories' | 'active_minutes' | 'steps';

export interface FitnessGoal {
  id: string;
  goalType: FitnessGoalType;
  targetValue: number;
  isActive: boolean;
  createdAt: number;
}

export interface FitnessDailyLog {
  date: string;
  steps: number;
  distanceKm: number;
  calories: number;
  activeMinutes: number;
  goalType: FitnessGoalType;
  goalTarget: number;
  goalCompleted: boolean;
  hourlyDistribution: Record<string, number>; // { "0": 0, "8": 500, "9": 1200, ... }
}

export function getFitnessGoal(db: SQLite.SQLiteDatabase): FitnessGoal {
  try {
    const row = db.getFirstSync(
      'SELECT * FROM fitness_goals WHERE is_active = 1 LIMIT 1'
    ) as any;

    if (row) {
      return {
        id: row.id,
        goalType: row.goal_type as FitnessGoalType,
        targetValue: row.target_value,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
      };
    }
  } catch {
    // Return default
  }

  // Default: 3 km target
  const defaultGoal: FitnessGoal = {
    id: 'default_goal',
    goalType: 'distance_km',
    targetValue: 3.0,
    isActive: true,
    createdAt: Date.now(),
  };

  try {
    db.runSync(
      'INSERT OR REPLACE INTO fitness_goals (id, goal_type, target_value, is_active, created_at) VALUES (?, ?, ?, 1, ?)',
      [defaultGoal.id, defaultGoal.goalType, defaultGoal.targetValue, defaultGoal.createdAt]
    );
  } catch {}

  return defaultGoal;
}

export function setFitnessGoal(
  db: SQLite.SQLiteDatabase,
  goalType: FitnessGoalType,
  targetValue: number
): void {
  const goal = getFitnessGoal(db);
  db.runSync(
    'INSERT OR REPLACE INTO fitness_goals (id, goal_type, target_value, is_active, created_at) VALUES (?, ?, ?, 1, ?)',
    [goal.id || generateUUID(), goalType, targetValue, Date.now()]
  );
}

export function getTodayFitnessLog(
  db: SQLite.SQLiteDatabase,
  date: string = getToday()
): FitnessDailyLog {
  const goal = getFitnessGoal(db);

  try {
    const row = db.getFirstSync(
      'SELECT * FROM fitness_daily_logs WHERE date = ?',
      [date]
    ) as any;

    if (row) {
      let hourly: Record<string, number> = {};
      try {
        hourly = JSON.parse(row.hourly_distribution || '{}');
      } catch {}

      return {
        date: row.date,
        steps: row.steps || 0,
        distanceKm: row.distance_km || 0.0,
        calories: row.calories || 0.0,
        activeMinutes: row.active_minutes || 0,
        goalType: (row.goal_type as FitnessGoalType) || goal.goalType,
        goalTarget: row.goal_target || goal.targetValue,
        goalCompleted: Boolean(row.goal_completed),
        hourlyDistribution: hourly,
      };
    }
  } catch {}

  return {
    date,
    steps: 0,
    distanceKm: 0.0,
    calories: 0.0,
    activeMinutes: 0,
    goalType: goal.goalType,
    goalTarget: goal.targetValue,
    goalCompleted: false,
    hourlyDistribution: {},
  };
}

export function upsertFitnessLog(
  db: SQLite.SQLiteDatabase,
  log: FitnessDailyLog
): void {
  const isCompleted = isGoalReached(log.goalType, log.goalTarget, log);

  db.runSync(
    `INSERT INTO fitness_daily_logs (
      date, steps, distance_km, calories, active_minutes, goal_type, goal_target, goal_completed, hourly_distribution
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      steps = excluded.steps,
      distance_km = excluded.distance_km,
      calories = excluded.calories,
      active_minutes = excluded.active_minutes,
      goal_type = excluded.goal_type,
      goal_target = excluded.goal_target,
      goal_completed = excluded.goal_completed,
      hourly_distribution = excluded.hourly_distribution`,
    [
      log.date,
      log.steps,
      log.distanceKm,
      log.calories,
      log.activeMinutes,
      log.goalType,
      log.goalTarget,
      isCompleted ? 1 : 0,
      JSON.stringify(log.hourlyDistribution || {}),
    ]
  );
}

export function isGoalReached(
  type: FitnessGoalType,
  target: number,
  log: Pick<FitnessDailyLog, 'steps' | 'distanceKm' | 'calories' | 'activeMinutes'>
): boolean {
  switch (type) {
    case 'distance_km':
      return log.distanceKm >= target;
    case 'calories':
      return log.calories >= target;
    case 'active_minutes':
      return log.activeMinutes >= target;
    case 'steps':
      return log.steps >= target;
    default:
      return false;
  }
}

export function getFitnessLogsRange(
  db: SQLite.SQLiteDatabase,
  startDate: string,
  endDate: string
): FitnessDailyLog[] {
  try {
    const rows = db.getAllSync(
      'SELECT * FROM fitness_daily_logs WHERE date BETWEEN ? AND ? ORDER BY date ASC',
      [startDate, endDate]
    ) as any[];

    return rows.map((r) => {
      let hourly: Record<string, number> = {};
      try {
        hourly = JSON.parse(r.hourly_distribution || '{}');
      } catch {}
      return {
        date: r.date,
        steps: r.steps || 0,
        distanceKm: r.distance_km || 0.0,
        calories: r.calories || 0.0,
        activeMinutes: r.active_minutes || 0,
        goalType: r.goal_type as FitnessGoalType,
        goalTarget: r.goal_target,
        goalCompleted: Boolean(r.goal_completed),
        hourlyDistribution: hourly,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Calculates current fitness streak: consecutive days where fitness goal was achieved
 */
export function calculateFitnessStreak(
  db: SQLite.SQLiteDatabase,
  todayStr: string = getToday()
): number {
  try {
    const rows = db.getAllSync(
      'SELECT date, goal_completed FROM fitness_daily_logs ORDER BY date DESC LIMIT 60'
    ) as any[];

    if (!rows || rows.length === 0) return 0;

    let streak = 0;
    const completedSet = new Set(
      rows.filter((r) => Boolean(r.goal_completed)).map((r) => r.date)
    );

    const d = new Date(todayStr);

    // If today is completed, count today
    if (completedSet.has(todayStr)) {
      streak++;
    }

    // Check consecutive past days
    d.setDate(d.getDate() - 1);
    while (true) {
      const pastStr = d.toISOString().slice(0, 10);
      if (completedSet.has(pastStr)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch {
    return 0;
  }
}
