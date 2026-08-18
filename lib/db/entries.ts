import { getDb } from '@/lib/db/client';
import * as Crypto from 'expo-crypto';
import { format } from 'date-fns';

export type Entry = {
  id: string;
  text: string;
  createdAt: number;
  dayKey: string;
};

type EntryRow = {
  id: string;
  text: string;
  created_at: number;
  day_key: string;
};

function fromRow(row: EntryRow): Entry {
  return { id: row.id, text: row.text, createdAt: row.created_at, dayKey: row.day_key };
}

export function dayKeyFor(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function createEntry(text: string, at: Date = new Date()): Entry {
  const entry: Entry = {
    id: Crypto.randomUUID(),
    text: text.trim(),
    createdAt: at.getTime(),
    dayKey: dayKeyFor(at),
  };

  getDb().runSync(
    'INSERT INTO entries (id, text, created_at, day_key) VALUES (?, ?, ?, ?);',
    entry.id,
    entry.text,
    entry.createdAt,
    entry.dayKey
  );

  return entry;
}

/** Inserts an entry with a caller-supplied id, or replaces the existing row with the same id — used by data import so re-importing the same file is idempotent. */
export function upsertEntry(entry: Entry): void {
  getDb().runSync(
    `INSERT INTO entries (id, text, created_at, day_key) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET text = excluded.text, created_at = excluded.created_at, day_key = excluded.day_key;`,
    entry.id,
    entry.text,
    entry.createdAt,
    entry.dayKey
  );
}

export function listByDay(dayKey: string): Entry[] {
  const rows = getDb().getAllSync<EntryRow>(
    'SELECT * FROM entries WHERE day_key = ? ORDER BY created_at DESC;',
    dayKey
  );
  return rows.map(fromRow);
}

export function listByRange(startMs: number, endMsExclusive: number): Entry[] {
  const rows = getDb().getAllSync<EntryRow>(
    'SELECT * FROM entries WHERE created_at >= ? AND created_at < ? ORDER BY created_at ASC;',
    startMs,
    endMsExclusive
  );
  return rows.map(fromRow);
}

export function countByRange(startMs: number, endMsExclusive: number): number {
  const row = getDb().getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM entries WHERE created_at >= ? AND created_at < ?;',
    startMs,
    endMsExclusive
  );
  return row?.count ?? 0;
}

/** Earliest entry's local day, or null if nothing has been logged yet. */
export function firstEntryDayKey(): string | null {
  const row = getDb().getFirstSync<{ day_key: string }>(
    'SELECT day_key FROM entries ORDER BY created_at ASC LIMIT 1;'
  );
  return row?.day_key ?? null;
}

/** Day keys that have at least one entry, mapped to their entry count. */
export function entryCountsByDay(): Map<string, number> {
  const rows = getDb().getAllSync<{ day_key: string; count: number }>(
    'SELECT day_key, COUNT(*) as count FROM entries GROUP BY day_key;'
  );
  return new Map(rows.map((r) => [r.day_key, r.count]));
}

const SEARCH_LIMIT = 200;

/** Entries whose text contains `query` (case-insensitive), newest first. */
export function searchEntries(query: string): Entry[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const rows = getDb().getAllSync<EntryRow>(
    'SELECT * FROM entries WHERE text LIKE ? COLLATE NOCASE ORDER BY created_at DESC LIMIT ?;',
    `%${trimmed}%`,
    SEARCH_LIMIT
  );
  return rows.map(fromRow);
}

/** Every entry in the range, grouped by day (newest-first within each day) — for Archive's extended view. */
export function listInRangeGroupedByDay(startMs: number, endMsExclusive: number): Map<string, Entry[]> {
  const rows = getDb().getAllSync<EntryRow>(
    'SELECT * FROM entries WHERE created_at >= ? AND created_at < ? ORDER BY day_key, created_at DESC;',
    startMs,
    endMsExclusive
  );

  const grouped = new Map<string, Entry[]>();
  for (const row of rows) {
    const entry = fromRow(row);
    const existing = grouped.get(entry.dayKey);
    if (existing) existing.push(entry);
    else grouped.set(entry.dayKey, [entry]);
  }
  return grouped;
}

export function deleteEntry(id: string): void {
  getDb().runSync('DELETE FROM entries WHERE id = ?;', id);
}

export function clearAll(): void {
  getDb().execSync('DELETE FROM entries; DELETE FROM summaries;');
}

export function listAllForExport(): Entry[] {
  const rows = getDb().getAllSync<EntryRow>('SELECT * FROM entries ORDER BY created_at ASC;');
  return rows.map(fromRow);
}
