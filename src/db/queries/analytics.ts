import type * as SQLite from 'expo-sqlite';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DailyStats {
  total: number;
  completed: number;
  rate: number; // 0–1
}

export interface WeeklyStats {
  date: string;
  total: number;
  completed: number;
  rate: number;
}

export interface HeatmapEntry {
  date: string;
  count: number; // completed tasks on that day
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Returns aggregate stats for a single date.
 * `total`     – number of log entries for the date.
 * `completed` – entries with status = 'yes'.
 * `rate`      – completed / total (0 when total is 0).
 */
export function getDailyStats(
  db: SQLite.SQLiteDatabase,
  date: string,
): DailyStats {
  const row = db.getFirstSync(
    `SELECT
       COUNT(*)                                   AS total,
       SUM(CASE WHEN status = 'yes' THEN 1 ELSE 0 END) AS completed
     FROM task_logs
     WHERE date = ?`,
    [date],
  ) as Record<string, unknown> | null;

  const total = (row?.total as number) ?? 0;
  const completed = (row?.completed as number) ?? 0;

  return {
    total,
    completed,
    rate: total > 0 ? completed / total : 0,
  };
}

/**
 * Returns per-day stats for every day within the given range (inclusive).
 * Days with no logs are omitted from the result.
 */
export function getWeeklyStats(
  db: SQLite.SQLiteDatabase,
  startDate: string,
  endDate: string,
): WeeklyStats[] {
  const rows = db.getAllSync(
    `SELECT
       date,
       COUNT(*)                                   AS total,
       SUM(CASE WHEN status = 'yes' THEN 1 ELSE 0 END) AS completed
     FROM task_logs
     WHERE date >= ? AND date <= ?
     GROUP BY date
     ORDER BY date ASC`,
    [startDate, endDate],
  ) as Record<string, unknown>[];

  return rows.map((r) => {
    const total = r.total as number;
    const completed = r.completed as number;
    return {
      date: r.date as string,
      total,
      completed,
      rate: total > 0 ? completed / total : 0,
    };
  });
}

/**
 * Returns heatmap data for a given month: each day in the month that has
 * at least one completed task, along with the count of completed tasks.
 */
export function getMonthlyHeatmapData(
  db: SQLite.SQLiteDatabase,
  year: number,
  month: number,
): HeatmapEntry[] {
  const monthStr = String(month).padStart(2, '0');
  const prefix = `${year}-${monthStr}`;

  const rows = db.getAllSync(
    `SELECT
       date,
       SUM(CASE WHEN status = 'yes' THEN 1 ELSE 0 END) AS count
     FROM task_logs
     WHERE date LIKE ? || '%'
     GROUP BY date
     HAVING count > 0
     ORDER BY date ASC`,
    [prefix],
  ) as Record<string, unknown>[];

  return rows.map((r) => ({
    date: r.date as string,
    count: r.count as number,
  }));
}

/**
 * Returns a sorted list of all distinct dates that have at least one
 * completed (status = 'yes') task log.
 */
export function getCompletedDates(
  db: SQLite.SQLiteDatabase,
): string[] {
  const rows = db.getAllSync(
    `SELECT DISTINCT date FROM task_logs
     WHERE status = 'yes'
     ORDER BY date ASC`,
  );
  return (rows as Record<string, unknown>[]).map((r) => r.date as string);
}
