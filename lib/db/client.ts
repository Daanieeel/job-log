import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

const DB_NAME = 'joblog.db';

type Migration = { version: number; up: (db: SQLiteDatabase) => void };

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: (db) => {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS entries (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          day_key TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_entries_day_key ON entries(day_key);

        CREATE TABLE IF NOT EXISTS summaries (
          id TEXT PRIMARY KEY,
          period_type TEXT NOT NULL,
          period_key TEXT NOT NULL,
          bullets TEXT NOT NULL,
          entry_count INTEGER NOT NULL,
          generated_at INTEGER NOT NULL,
          is_final INTEGER NOT NULL,
          source TEXT NOT NULL DEFAULT 'ai'
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_summaries_period ON summaries(period_type, period_key);
      `);
    },
  },
  {
    // Summaries are now cached per content language (AI can write in English or German).
    version: 2,
    up: (db) => {
      db.execSync(`
        DROP INDEX IF EXISTS idx_summaries_period;
        ALTER TABLE summaries ADD COLUMN language TEXT NOT NULL DEFAULT 'en';
        CREATE UNIQUE INDEX IF NOT EXISTS idx_summaries_period_lang
          ON summaries(period_type, period_key, language);
      `);
    },
  },
];

let db: SQLiteDatabase | null = null;

/** Lazily opens the singleton connection and runs any pending migrations. */
export function getDb(): SQLiteDatabase {
  if (db) return db;

  db = openDatabaseSync(DB_NAME);
  db.execSync('PRAGMA journal_mode = WAL;');

  const { user_version: currentVersion } = db.getFirstSync<{ user_version: number }>(
    'PRAGMA user_version;'
  )!;

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion).sort(
    (a, b) => a.version - b.version
  );

  for (const migration of pending) {
    db.withTransactionSync(() => {
      migration.up(db!);
      db!.execSync(`PRAGMA user_version = ${migration.version};`);
    });
  }

  return db;
}
