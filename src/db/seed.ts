import type * as SQLite from 'expo-sqlite';

/** Default application settings. */
const DEFAULT_SETTINGS: Record<string, string> = {
  theme: 'system',
  notifications_enabled: '1',
  alarm_volume: '80',
  snooze_duration_minutes: '5',
  week_start_day: '1', // Monday
  daily_reminder_time: '08:00',
};

/**
 * Seeds default settings into the `settings` table.
 * Uses INSERT OR IGNORE so existing values are never overwritten.
 */
export function seedDefaults(db: SQLite.SQLiteDatabase): void {
  const stmt = db.prepareSync(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
  );

  try {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      stmt.executeSync([key, value]);
    }
  } finally {
    stmt.finalizeSync();
  }
}
