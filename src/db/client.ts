import * as SQLite from 'expo-sqlite';
import React from 'react';

const DB_NAME = 'growth-streaks.db';

/**
 * Opens (or creates) the Growth Streaks database and enables
 * WAL journal mode + foreign-key enforcement.
 */
export function openDatabase(): SQLite.SQLiteDatabase {
  const db = SQLite.openDatabaseSync(DB_NAME);

  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync('PRAGMA foreign_keys = ON;');

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
