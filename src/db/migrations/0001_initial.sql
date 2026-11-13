PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

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
