import type * as SQLite from 'expo-sqlite';
import { TaskLog, TaskLogStatus } from '../../types/task-log';

// ─── Row → Domain mapper ─────────────────────────────────────────────────────

function rowToTaskLog(row: Record<string, unknown>): TaskLog {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    date: row.date as string,
    status: row.status as TaskLogStatus,
    triggerCount: row.trigger_count as number,
    respondedAt: (row.responded_at as string | null) ?? null,
    createdAt: row.created_at as number,
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Returns all logs recorded for a specific calendar date ("YYYY-MM-DD"). */
export function getLogsByDate(
  db: SQLite.SQLiteDatabase,
  date: string,
): TaskLog[] {
  const rows = db.getAllSync(
    'SELECT * FROM task_logs WHERE date = ?',
    [date],
  );
  return (rows as Array<Record<string, unknown>>).map(rowToTaskLog);
}

/** Returns all logs for a specific task within an inclusive date range. */
export function getLogsByTaskAndDateRange(
  db: SQLite.SQLiteDatabase,
  taskId: string,
  startDate: string,
  endDate: string,
): TaskLog[] {
  const rows = db.getAllSync(
    `SELECT * FROM task_logs
     WHERE task_id = ? AND date BETWEEN ? AND ?
     ORDER BY date ASC`,
    [taskId, startDate, endDate],
  );
  return (rows as Array<Record<string, unknown>>).map(rowToTaskLog);
}

/** Returns all logs across all tasks within an inclusive date range. */
export function getLogsByDateRange(
  db: SQLite.SQLiteDatabase,
  startDate: string,
  endDate: string,
): TaskLog[] {
  const rows = db.getAllSync(
    `SELECT * FROM task_logs
     WHERE date BETWEEN ? AND ?
     ORDER BY date ASC`,
    [startDate, endDate],
  );
  return (rows as Array<Record<string, unknown>>).map(rowToTaskLog);
}

/** Inserts a new task log or updates it if a log for (task_id, date) already exists. */
export function upsertLog(
  db: SQLite.SQLiteDatabase,
  log: Omit<TaskLog, 'createdAt'> & { createdAt?: number },
): TaskLog {
  const now = log.createdAt ?? Date.now();

  db.runSync(
    `INSERT INTO task_logs (
       id,
       task_id,
       date,
       status,
       trigger_count,
       responded_at,
       created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(task_id, date) DO UPDATE SET
       status        = excluded.status,
       trigger_count = excluded.trigger_count,
       responded_at  = excluded.responded_at`,
    [
      log.id,
      log.taskId,
      log.date,
      log.status,
      log.triggerCount,
      log.respondedAt,
      now,
    ],
  );

  const row = db.getFirstSync(
    'SELECT * FROM task_logs WHERE task_id = ? AND date = ?',
    [log.taskId, log.date],
  ) as Record<string, unknown>;

  return rowToTaskLog(row);
}
