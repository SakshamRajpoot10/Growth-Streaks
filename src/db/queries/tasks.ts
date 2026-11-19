import type * as SQLite from 'expo-sqlite';
import { Task, VerificationType } from '../../types/task';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreateTaskInput {
  id: string;
  activityName: string;
  focusArea?: string;
  verificationType?: VerificationType;
  scheduledTime: string;
  daysOfWeek?: number[];
  alarmSound?: string;
  preAlarmMinutes?: number;
  isActive?: boolean;
}

export interface UpdateTaskInput {
  activityName?: string;
  focusArea?: string;
  verificationType?: VerificationType;
  scheduledTime?: string;
  daysOfWeek?: number[];
  alarmSound?: string;
  preAlarmMinutes?: number;
  isActive?: boolean;
}

// ─── Row → Domain mapper ─────────────────────────────────────────────────────

function rowToTask(row: Record<string, unknown>): Task {
  let days: number[] = [1, 2, 3, 4, 5, 6, 7];
  try {
    days = JSON.parse((row.days_of_week as string) || '[1,2,3,4,5,6,7]');
  } catch {
    days = [1, 2, 3, 4, 5, 6, 7];
  }

  return {
    id: row.id as string,
    activityName: row.activity_name as string,
    focusArea: row.focus_area as string,
    verificationType: (row.verification_type as VerificationType) || 'STANDARD',
    scheduledTime: row.scheduled_time as string,
    daysOfWeek: days,
    alarmSound: row.alarm_sound as string,
    preAlarmMinutes: row.pre_alarm_minutes as number,
    isActive: Boolean(row.is_active),
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
  return (rows as Array<Record<string, unknown>>).map(rowToTask);
}

/** Returns only active tasks. */
export function getActiveTasks(db: SQLite.SQLiteDatabase): Task[] {
  const rows = db.getAllSync(
    'SELECT * FROM tasks WHERE is_active = 1 ORDER BY scheduled_time ASC',
  );
  return (rows as Array<Record<string, unknown>>).map(rowToTask);
}

/** Fetches a single task by ID. */
export function getTaskById(
  db: SQLite.SQLiteDatabase,
  id: string,
): Task | null {
  const row = db.getFirstSync(
    'SELECT * FROM tasks WHERE id = ?',
    [id],
  ) as Record<string, unknown> | null;
  return row ? rowToTask(row) : null;
}

/**
 * Returns active tasks scheduled to run on a given day of the week.
 * `dayOfWeek` should follow ISO-8601 (1 = Monday, 7 = Sunday).
 */
export function getTasksForDay(
  db: SQLite.SQLiteDatabase,
  dayOfWeek: number,
): Task[] {
  const allActive = getActiveTasks(db);
  return allActive.filter((t) => t.daysOfWeek.includes(dayOfWeek));
}

/** Inserts a new task. Returns the newly created task. */
export function createTask(
  db: SQLite.SQLiteDatabase,
  input: CreateTaskInput,
): Task {
  const now = Date.now();
  const days = input.daysOfWeek ?? [1, 2, 3, 4, 5, 6, 7];
  const daysStr = JSON.stringify(days);

  db.runSync(
    `INSERT INTO tasks (
       id,
       activity_name,
       focus_area,
       verification_type,
       scheduled_time,
       days_of_week,
       alarm_sound,
       pre_alarm_minutes,
       is_active,
       created_at,
       updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.id,
      input.activityName,
      input.focusArea ?? 'General',
      input.verificationType ?? 'STANDARD',
      input.scheduledTime,
      daysStr,
      input.alarmSound ?? 'default_alarm',
      input.preAlarmMinutes ?? 5,
      input.isActive ?? true ? 1 : 0,
      now,
      now,
    ],
  );

  return getTaskById(db, input.id)!;
}

/** Updates an existing task. */
export function updateTask(
  db: SQLite.SQLiteDatabase,
  id: string,
  updates: UpdateTaskInput,
): Task | null {
  const setClauses: string[] = [];
  const values: SQLite.SQLiteBindValue[] = [];

  if (updates.activityName !== undefined) {
    setClauses.push('activity_name = ?');
    values.push(updates.activityName);
  }
  if (updates.focusArea !== undefined) {
    setClauses.push('focus_area = ?');
    values.push(updates.focusArea);
  }
  if (updates.verificationType !== undefined) {
    setClauses.push('verification_type = ?');
    values.push(updates.verificationType);
  }
  if (updates.scheduledTime !== undefined) {
    setClauses.push('scheduled_time = ?');
    values.push(updates.scheduledTime);
  }
  if (updates.daysOfWeek !== undefined) {
    setClauses.push('days_of_week = ?');
    values.push(JSON.stringify(updates.daysOfWeek));
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
    values.push(updates.isActive ? 1 : 0);
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

/** Toggles a task's is_active flag. */
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

/** Permanently deletes a task. */
export function deleteTask(db: SQLite.SQLiteDatabase, id: string): void {
  db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
}
