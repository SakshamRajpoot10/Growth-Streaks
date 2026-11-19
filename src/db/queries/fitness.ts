import * as SQLite from 'expo-sqlite';
import { generateUUID } from '../../utils/uuid';
import { getToday } from '../../utils/date';

export type FitnessGoalType = 'steps' | 'distance_km' | 'heart_points' | 'calories' | 'active_minutes';

export interface UserFitnessGoals {
  steps: number | null;
  distance_km: number | null;
  heart_points: number | null;
  calories: number | null;
}

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

/**
 * Returns all independently configured user fitness goals.
 * Strict rule (Part 4.2): Any goal not configured (or <= 0) is treated as unconfigured (null).
 */
export function getAllFitnessGoals(db: SQLite.SQLiteDatabase): UserFitnessGoals {
  const result: UserFitnessGoals = {
    steps: null,
    distance_km: null,
    heart_points: null,
    calories: null,
  };

  try {
    const rows = db.getAllSync(
      'SELECT goal_type, target_value FROM fitness_goals WHERE is_active = 1 AND target_value > 0 AND id != "default_goal"'
    ) as any[];

    for (const r of rows) {
      if (r.goal_type === 'steps') result.steps = r.target_value;
      if (r.goal_type === 'distance_km') result.distance_km = r.target_value;
      if (r.goal_type === 'heart_points' || r.goal_type === 'active_minutes') {
        result.heart_points = r.target_value;
      }
      if (r.goal_type === 'calories') result.calories = r.target_value;
    }
  } catch {}

  return result;
}

/**
 * Sets or updates a specific metric goal. If targetValue is null or <= 0, disables it.
 */
export function setFitnessGoalForType(
  db: SQLite.SQLiteDatabase,
  goalType: FitnessGoalType,
  targetValue: number | null
): void {
  try {
    const normalizedType = goalType === 'active_minutes' ? 'heart_points' : goalType;
    db.runSync(
      'DELETE FROM fitness_goals WHERE goal_type = ? OR (goal_type = "active_minutes" AND ? = "heart_points")',
      [normalizedType, normalizedType]
    );

    if (targetValue && targetValue > 0) {
      db.runSync(
        'INSERT INTO fitness_goals (id, goal_type, target_value, is_active, created_at) VALUES (?, ?, ?, 1, ?)',
        [generateUUID(), normalizedType, targetValue, Date.now()]
      );
    }
  } catch {}
}

export function getFitnessGoal(db: SQLite.SQLiteDatabase): FitnessGoal {
  try {
    const row = db.getFirstSync(
      'SELECT * FROM fitness_goals WHERE is_active = 1 AND target_value > 0 AND id != "default_goal" LIMIT 1'
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
  } catch {}

  return {
    id: '',
    goalType: 'steps',
    targetValue: 0,
    isActive: false,
    createdAt: Date.now(),
  };
}

export function setFitnessGoal(
  db: SQLite.SQLiteDatabase,
  goalType: FitnessGoalType,
  targetValue: number
): void {
  setFitnessGoalForType(db, goalType, targetValue);
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

/**
 * Checks if a fitness record exists for the given date.
 * Returns null if no record was ever created/recorded for this date (Part 7.2).
 */
export function getFitnessLogIfExists(
  db: SQLite.SQLiteDatabase,
  date: string
): FitnessDailyLog | null {
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
        goalType: row.goal_type as FitnessGoalType,
        goalTarget: row.goal_target || 0,
        goalCompleted: Boolean(row.goal_completed),
        hourlyDistribution: hourly,
      };
    }
  } catch {}

  return null;
}

/**
 * Returns exactly 5 calendar days ending at the specified endDateStr (Part 7.2).
 * Result is ordered chronologically from oldest (T-4) to selected day (T-0).
 */
export function get5DaysEndingAt(
  db: SQLite.SQLiteDatabase,
  endDateStr: string
): Array<{ date: string; log: FitnessDailyLog | null }> {
  const result: Array<{ date: string; log: FitnessDailyLog | null }> = [];
  const parts = endDateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const anchor = new Date(year, month, day, 12, 0, 0);

  for (let i = 4; i >= 0; i--) {
    const d = new Date(anchor.getTime() - i * 86400000);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const log = getFitnessLogIfExists(db, dateStr);
    result.push({ date: dateStr, log });
  }

  return result;
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
 * Returns logs for the last 7 calendar days ending on today (or specified date),
 * filling any missing days with clean zero-value records.
 */
export function getLast7DaysLogs(
  db: SQLite.SQLiteDatabase,
  referenceDate: Date = new Date()
): FitnessDailyLog[] {
  const goal = getFitnessGoal(db);
  const result: FitnessDailyLog[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const log = getTodayFitnessLog(db, dateStr);
    result.push(log);
  }

  return result;
}

/**
 * Returns 7 days of logs for a calendar week (Sunday to Saturday) containing the target date,
 * strictly matching Reference Images 2 & 3.
 */
export function getCalendarWeekLogs(
  db: SQLite.SQLiteDatabase,
  targetDate: Date = new Date()
): {
  logs: FitnessDailyLog[];
  startDate: Date;
  endDate: Date;
  rangeLabel: string;
} {
  const d = new Date(targetDate);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  const logs: FitnessDailyLog[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(sunday);
    cur.setDate(sunday.getDate() + i);
    const dateStr = cur.toISOString().slice(0, 10);
    logs.push(getTodayFitnessLog(db, dateStr));
  }

  const startDay = sunday.getDate();
  const endDay = saturday.getDate();
  const startMonth = sunday.toLocaleString('en-US', { month: 'short' });
  const endMonth = saturday.toLocaleString('en-US', { month: 'short' });

  const rangeLabel =
    startMonth === endMonth
      ? `${startDay}–${endDay} ${startMonth}`
      : `${startDay} ${startMonth} – ${endDay} ${endMonth}`;

  return {
    logs,
    startDate: sunday,
    endDate: saturday,
    rangeLabel,
  };
}

/**
 * Returns daily logs for an entire calendar month.
 */
export function getCalendarMonthLogs(
  db: SQLite.SQLiteDatabase,
  year: number,
  month: number // 1-12
): {
  logs: FitnessDailyLog[];
  monthName: string;
  year: number;
} {
  const daysInMonth = new Date(year, month, 0).getDate();
  const logs: FitnessDailyLog[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    logs.push(getTodayFitnessLog(db, dateStr));
  }

  const dateObj = new Date(year, month - 1, 1);
  const monthName = dateObj.toLocaleString('en-US', { month: 'long' });

  return {
    logs,
    monthName,
    year,
  };
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
