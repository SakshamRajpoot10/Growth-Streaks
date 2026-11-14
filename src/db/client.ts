import * as SQLite from 'expo-sqlite';
import React from 'react';

const DB_NAME = 'growth-streaks.db';

export const INITIAL_MIGRATION = `
CREATE TABLE IF NOT EXISTS tasks (
    id                TEXT PRIMARY KEY,
    activity_name     TEXT NOT NULL,
    focus_area        TEXT NOT NULL DEFAULT 'General',
    scheduled_time    TEXT NOT NULL,
    days_of_week      TEXT NOT NULL DEFAULT '[1,2,3,4,5,6,7]',
    alarm_sound       TEXT NOT NULL DEFAULT 'default_alarm',
    pre_alarm_minutes INTEGER NOT NULL DEFAULT 5,
    is_active         INTEGER NOT NULL DEFAULT 1,
    created_at        INTEGER NOT NULL,
    updated_at        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS task_logs (
    id              TEXT PRIMARY KEY,
    task_id         TEXT NOT NULL,
    date            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending',
    trigger_count   INTEGER NOT NULL DEFAULT 0,
    responded_at    TEXT,
    created_at      INTEGER NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(task_id, date)
);

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_logs_date ON task_logs(date);
CREATE INDEX IF NOT EXISTS idx_task_logs_task_date ON task_logs(task_id, date);
CREATE INDEX IF NOT EXISTS idx_task_logs_status ON task_logs(date, status);
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_time ON tasks(scheduled_time);
`;

/**
 * Opens (or creates) the Growth Streaks database, creates tables if missing,
 * and enables WAL journal mode + foreign-key enforcement.
 */
export function openDatabase(): SQLite.SQLiteDatabase {
  const db = SQLite.openDatabaseSync(DB_NAME);

  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync('PRAGMA foreign_keys = ON;');
  db.execSync(INITIAL_MIGRATION);

  return db;
}

// ─── React context ───────────────────────────────────────────────────────────

const DatabaseContext = React.createContext<SQLite.SQLiteDatabase | null>(null);

/**
 * Wraps children with the SQLite database context.
 * Opens the database once on mount.
 */
export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const db = React.useMemo(() => openDatabase(), []);

  return React.createElement(
    DatabaseContext.Provider,
    { value: db },
    children,
  );
}

/**
 * Returns the database handle from context.
 * Must be used inside a <DatabaseProvider>.
 */
export function useDatabase(): SQLite.SQLiteDatabase {
  const db = React.useContext(DatabaseContext);
  if (!db) {
    throw new Error('useDatabase must be used within a <DatabaseProvider>');
  }
  return db;
}
