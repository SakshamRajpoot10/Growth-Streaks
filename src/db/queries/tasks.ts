import type * as SQLite from 'expo-sqlite';
import type { Task } from '../schema';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreateTaskInput {
  id: string;
  activityName: string;
  focusArea?: string;
  scheduledTime: string;
  daysOfWeek?: string;
  alarmSound?: string;
  preAlarmMinutes?: number;
  isActive?: number;
}

export interface UpdateTaskInput {
  activityName?: string;
  focusArea?: string;
  scheduledTime?: string;
  daysOfWeek?: string;
  alarmSound?: string;
  preAlarmMinutes?: number;
  isActive?: number;
}

// ─── Row → Domain mapper ─────────────────────────────────────────────────────

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    activityName: row.activity_name as string,
    focusArea: row.focus_area as string,
    scheduledTime: row.scheduled_time as string,
    daysOfWeek: row.days_of_week as string,
    alarmSound: row.alarm_sound as string,
    preAlarmMinutes: row.pre_alarm_minutes as number,
    isActive: row.is_active as number,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Returns every task, ordered by scheduled time. */
export function getAllTasks(db: SQLite.SQLiteDatabase): Task[] {
  const rows = db.getAllSync(
    'SELECT * FROM tasks ORDER BY scheduled_time ASC',
  );
  return (rows as Record<string, unknown>[]).map(rowToTask);
}

/** Returns only active tasks, ordered by scheduled time. */
export function getActiveTasks(db: SQLite.SQLiteDatabase): Task[] {
  const rows = db.getAllSync(
    'SELECT * FROM tasks WHERE is_active = 1 ORDER BY scheduled_time ASC',
  );
  return (rows as Record<string, unknown>[]).map(rowToTask);
}

/** Returns a single task by its ID, or null if not found. */
export function getTaskById(
  db: SQLite.SQLiteDatabase,
  id: string,
): Task | null {
  const row = db.getFirstSync('SELECT * FROM tasks WHERE id = ?', [id]);
  return row ? rowToTask(row as Record<string, unknown>) : null;
}

/**
 * Returns active tasks scheduled for the given day of the week.
 * `dayOfWeek` is 1 (Mon) – 7 (Sun).
 */
export function getTasksForDay(
  db: SQLite.SQLiteDatabase,
  dayOfWeek: number,
): Task[] {
  // days_of_week is stored as a JSON array, e.g. "[1,2,3,4,5]".
  // We use json_each() to check membership.
  const rows = db.getAllSync(
    `SELECT t.* FROM tasks t
     WHERE t.is_active = 1
       AND EXISTS (
         SELECT 1 FROM json_each(t.days_of_week) je WHERE je.value = ?
       )
     ORDER BY t.scheduled_time ASC`,
    [dayOfWeek],
  );
  return (rows as Record<string, unknown>[]).map(rowToTask);
}

/** Creates a new task. Returns the created task. */
export function createTask(
  db: SQLite.SQLiteDatabase,
  task: CreateTaskInput,
): Task {
  const now = Date.now();
  db.runSync(
    `INSERT INTO tasks (id, activity_name, focus_area, scheduled_time,
       days_of_week, alarm_sound, pre_alarm_minutes, is_active,
       created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.activityName,
      task.focusArea ?? 'General',
      task.scheduledTime,
      task.daysOfWeek ?? '[1,2,3,4,5,6,7]',
      task.alarmSound ?? 'default_alarm',
      task.preAlarmMinutes ?? 5,
      task.isActive ?? 1,
      now,
      now,
    ],
  );
  return getTaskById(db, task.id)!;
}

/** Partially updates a task. Returns the updated task or null. */
export function updateTask(
  db: SQLite.SQLiteDatabase,
  id: string,
  updates: UpdateTaskInput,
): Task | null {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (updates.activityName !== undefined) {
    setClauses.push('activity_name = ?');
    values.push(updates.activityName);
  }
  if (updates.focusArea !== undefined) {
    setClauses.push('focus_area = ?');
    values.push(updates.focusArea);
  }
  if (updates.scheduledTime !== undefined) {
    setClauses.push('scheduled_time = ?');
    values.push(updates.scheduledTime);
  }
  if (updates.daysOfWeek !== undefined) {
    setClauses.push('days_of_week = ?');
    values.push(updates.daysOfWeek);
  }
  if (updates.alarmSound !== undefined) {
    setClauses.push('alarm_sound = ?');
    values.push(updates.alarmSound);
  }
  if (updates.preAlarmMinutes !== undefined) {
    setClauses.push('pre_alarm_minutes = ?');
    values.push(updates.preAlarmMinutes);
  }
  if (updates.isActive !== undefined) {
    setClauses.push('is_active = ?');
    values.push(updates.isActive);
  }

  if (setClauses.length === 0) {
    return getTaskById(db, id);
  }

  setClauses.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  db.runSync(
    `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`,
    values,
  );
  return getTaskById(db, id);
}

/** Toggles a task's is_active flag. Returns the updated task or null. */
export function toggleTask(
  db: SQLite.SQLiteDatabase,
  id: string,
): Task | null {
  db.runSync(
    `UPDATE tasks
     SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
         updated_at = ?
     WHERE id = ?`,
    [Date.now(), id],
  );
  return getTaskById(db, id);
}

/** Deletes a task by ID. Returns true if a row was deleted. */
export function deleteTask(
  db: SQLite.SQLiteDatabase,
  id: string,
): boolean {
  const result = db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
  return result.changes > 0;
}
