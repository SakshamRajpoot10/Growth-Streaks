import type * as SQLite from 'expo-sqlite';
import { DailyStats, WeeklyStats, HeatmapDay } from '../../types/task-log';
import { getIntensityLevel } from '../../utils/streak-calculator';

export function getDailyStats(
  db: SQLite.SQLiteDatabase,
  date: string,
): DailyStats {
  const row = db.getFirstSync(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'yes' THEN 1 ELSE 0 END) AS completed,
       SUM(CASE WHEN status = 'no' THEN 1 ELSE 0 END) AS declined,
       SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) AS missed,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
     FROM task_logs
     WHERE date = ?`,
    [date],
  ) as Record<string, unknown> | null;

  const total = (row?.total as number) ?? 0;
  const completed = (row?.completed as number) ?? 0;
  const declined = (row?.declined as number) ?? 0;
  const missed = (row?.missed as number) ?? 0;
  const pending = (row?.pending as number) ?? 0;

  return {
    total,
    completed,
    declined,
    missed,
    pending,
    rate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getWeeklyStats(
  db: SQLite.SQLiteDatabase,
  startDate: string,
  endDate: string,
): WeeklyStats {
  const row = db.getFirstSync(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'yes' THEN 1 ELSE 0 END) AS completed,
       SUM(CASE WHEN status = 'no' THEN 1 ELSE 0 END) AS declined,
       SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) AS missed,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
     FROM task_logs
     WHERE date BETWEEN ? AND ?`,
    [startDate, endDate],
  ) as Record<string, unknown> | null;

  const total = (row?.total as number) ?? 0;
  const completed = (row?.completed as number) ?? 0;
  const declined = (row?.declined as number) ?? 0;
  const missed = (row?.missed as number) ?? 0;
  const pending = (row?.pending as number) ?? 0;

  return {
    total,
    completed,
    declined,
    missed,
    pending,
    rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    startDate,
    endDate,
  };
}

export function getMonthlyHeatmapData(
  db: SQLite.SQLiteDatabase,
  year: number,
  month: number,
): HeatmapDay[] {
  const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const endStr = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const rows = db.getAllSync(
    `SELECT
       date,
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'yes' THEN 1 ELSE 0 END) AS completed
     FROM task_logs
     WHERE date BETWEEN ? AND ?
     GROUP BY date`,
    [startStr, endStr],
  ) as Array<{ date: string; total: number; completed: number }>;

  const dateMap = new Map<string, { total: number; completed: number }>();
  for (const r of rows) {
    dateMap.set(r.date, { total: r.total, completed: r.completed });
  }

  const result: HeatmapDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const info = dateMap.get(dStr) || { total: 0, completed: 0 };
    const rate = info.total > 0 ? Math.round((info.completed / info.total) * 100) : 0;
    result.push({
      date: dStr,
      total: info.total,
      completed: info.completed,
      rate,
      intensity: getIntensityLevel(rate),
    });
  }

  return result;
}

export function getCompletedDates(db: SQLite.SQLiteDatabase): string[] {
  const rows = db.getAllSync(
    `SELECT DISTINCT date
     FROM task_logs
     WHERE status = 'yes'
     ORDER BY date ASC`,
  ) as Array<{ date: string }>;

  return rows.map((r) => r.date);
}
