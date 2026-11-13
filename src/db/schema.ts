import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  activityName: text('activity_name').notNull(),
  focusArea: text('focus_area').notNull().default('General'),
  scheduledTime: text('scheduled_time').notNull(), // "HH:MM"
  daysOfWeek: text('days_of_week').notNull().default('[1,2,3,4,5,6,7]'),
  alarmSound: text('alarm_sound').notNull().default('default_alarm'),
  preAlarmMinutes: integer('pre_alarm_minutes').notNull().default(5),
  isActive: integer('is_active').notNull().default(1),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

// ─── Task Logs ───────────────────────────────────────────────────────────────

export const taskLogs = sqliteTable(
  'task_logs',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // "YYYY-MM-DD"
    status: text('status').notNull().default('pending'), // pending | yes | no | missed
    triggerCount: integer('trigger_count').notNull().default(0),
    respondedAt: text('responded_at'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => ({
    taskDateUnique: unique('uq_task_logs_task_date').on(table.taskId, table.date),
  }),
);

export type TaskLog = typeof taskLogs.$inferSelect;
export type NewTaskLog = typeof taskLogs.$inferInsert;

export type TaskLogStatus = 'pending' | 'yes' | 'no' | 'missed';

// ─── Settings ────────────────────────────────────────────────────────────────

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
