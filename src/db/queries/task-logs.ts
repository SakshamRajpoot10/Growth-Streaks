import type * as SQLite from 'expo-sqlite';
import type { TaskLog, TaskLogStatus } from '../schema';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UpsertLogInput {
  id: string;
  taskId: string;
  date: string; // "YYYY-MM-DD"
  status: TaskLogStatus;
  triggerCount?: number;
  respondedAt?: string | null;
}

// ─── Row → Domain mapper ─────────────────────────────────────────────────────

function rowToTaskLog(row: Record<string, unknown>): TaskLog {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    date: row.date as string,
    status: row.status as string,
    triggerCount: row.trigger_count as number,
    respondedAt: (row.responded_at as string) ?? null,
    createdAt: row.created_at as number,
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Returns all logs for a given date. */
export function getLogsByDate(
  db: SQLite.SQLiteDatabase,
  date: string,
): TaskLog[] {
  const rows = db.getAllSync(
    'SELECT * FROM task_logs WHERE date = ? ORDER BY created_at ASC',
    [date],
  );
  return (rows as Record<string, unknown>[]).map(rowToTaskLog);
}

/** Returns logs for a specific task within a date range (inclusive). */
export function getLogsByTaskAndDateRange(
  db: SQLite.SQLiteDatabase,
  taskId: string,
  startDate: string,
  endDate: string,
): TaskLog[] {
  const rows = db.getAllSync(
    `SELECT * FROM task_logs
     WHERE task_id = ? AND date >= ? AND date <= ?
     ORDER BY date ASC`,
    [taskId, startDate, endDate],
  );
  return (rows as Record<string, unknown>[]).map(rowToTaskLog);
}

/** Returns all logs within a date range (inclusive). */
export function getLogsByDateRange(
  db: SQLite.SQLiteDatabase,
  startDate: string,
  endDate: string,
): TaskLog[] {
  const rows = db.getAllSync(
    `SELECT * FROM task_logs
     WHERE date >= ? AND date <= ?
     ORDER BY date ASC`,
    [startDate, endDate],
  );
  return (rows as Record<string, unknown>[]).map(rowToTaskLog);
}

/**
 * Inserts a new log or updates it on conflict (task_id + date).
 * Uses INSERT … ON CONFLICT … DO UPDATE (UPSERT).
 */
export function upsertLog(
  db: SQLite.SQLiteDatabase,
  log: UpsertLogInput,
): TaskLog {
  const now = Date.now();
  db.runSync(
    `INSERT INTO task_logs (id, task_id, date, status, trigger_count, responded_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(task_id, date) DO UPDATE SET
       status        = excluded.status,
       trigger_count = excluded.trigger_count,
       responded_at  = excluded.responded_at`,
    [
      log.id,
      log.taskId,
      log.date,
      log.status,
      log.triggerCount ?? 0,
      log.respondedAt ?? null,
      now,
    ],
  );

  const row = db.getFirstSync(
    'SELECT * FROM task_logs WHERE task_id = ? AND date = ?',
    [log.taskId, log.date],
  );
  return rowToTaskLog(row as Record<string, unknown>);
}

/** Returns distinct dates that have at least one completed (status = 'yes') task. */
export function getDatesWithCompletedTasks(
  db: SQLite.SQLiteDatabase,
): string[] {
  const rows = db.getAllSync(
    `SELECT DISTINCT date FROM task_logs
     WHERE status = 'yes'
     ORDER BY date ASC`,
  );
  return (rows as Record<string, unknown>[]).map((r) => r.date as string);
}
