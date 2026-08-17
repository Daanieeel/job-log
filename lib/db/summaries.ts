import { getDb } from '@/lib/db/client';
import type { AppLanguage } from '@/lib/i18n';
import * as Crypto from 'expo-crypto';
import type { ExtendedPeriodType } from '@/lib/dates/periods';

export type SummarySource = 'ai' | 'basic';

export type SummaryRecord = {
  periodType: ExtendedPeriodType;
  periodKey: string;
  language: AppLanguage;
  bullets: string[];
  entryCount: number;
  generatedAt: number;
  isFinal: boolean;
  source: SummarySource;
};

type SummaryRow = {
  id: string;
  period_type: ExtendedPeriodType;
  period_key: string;
  language: AppLanguage;
  bullets: string;
  entry_count: number;
  generated_at: number;
  is_final: number;
  source: SummarySource;
};

function fromRow(row: SummaryRow): SummaryRecord {
  return {
    periodType: row.period_type,
    periodKey: row.period_key,
    language: row.language,
    bullets: JSON.parse(row.bullets),
    entryCount: row.entry_count,
    generatedAt: row.generated_at,
    isFinal: row.is_final === 1,
    source: row.source,
  };
}

export function getCachedSummary(
  periodType: ExtendedPeriodType,
  periodKey: string,
  language: AppLanguage
): SummaryRecord | null {
  const row = getDb().getFirstSync<SummaryRow>(
    'SELECT * FROM summaries WHERE period_type = ? AND period_key = ? AND language = ?;',
    periodType,
    periodKey,
    language
  );
  return row ? fromRow(row) : null;
}

/** All cached summaries (across languages) for a period — used for JSON export. */
export function getAllCachedSummariesForPeriod(
  periodType: ExtendedPeriodType,
  periodKey: string
): SummaryRecord[] {
  const rows = getDb().getAllSync<SummaryRow>(
    'SELECT * FROM summaries WHERE period_type = ? AND period_key = ? ORDER BY language ASC;',
    periodType,
    periodKey
  );
  return rows.map(fromRow);
}

/** Every cached summary, across all periods and languages — used for the full-data JSON export. */
export function getAllSummaries(): SummaryRecord[] {
  const rows = getDb().getAllSync<SummaryRow>('SELECT * FROM summaries;');
  return rows.map(fromRow);
}

export function putSummary(record: SummaryRecord): void {
  getDb().runSync(
    `INSERT INTO summaries (id, period_type, period_key, language, bullets, entry_count, generated_at, is_final, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(period_type, period_key, language) DO UPDATE SET
       bullets = excluded.bullets,
       entry_count = excluded.entry_count,
       generated_at = excluded.generated_at,
       is_final = excluded.is_final,
       source = excluded.source;`,
    Crypto.randomUUID(),
    record.periodType,
    record.periodKey,
    record.language,
    JSON.stringify(record.bullets),
    record.entryCount,
    record.generatedAt,
    record.isFinal ? 1 : 0,
    record.source
  );
}
