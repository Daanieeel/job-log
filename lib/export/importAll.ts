import { upsertEntry, type Entry } from '@/lib/db/entries';
import { putSummary, type SummaryRecord } from '@/lib/db/summaries';
import { File } from 'expo-file-system';

export type ImportResult =
  | { status: 'imported'; entryCount: number; summaryCount: number }
  | { status: 'cancelled' }
  | { status: 'invalid' };

function parseEntry(raw: unknown): Entry | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { id, text, createdAt, dayKey } = raw as Record<string, unknown>;
  if (typeof id !== 'string' || typeof text !== 'string') return null;
  if (typeof createdAt !== 'string' || typeof dayKey !== 'string') return null;
  const createdAtMs = Date.parse(createdAt);
  if (Number.isNaN(createdAtMs)) return null;
  return { id, text, createdAt: createdAtMs, dayKey };
}

function parseSummary(raw: unknown): SummaryRecord | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { periodType, periodKey, language, source, bullets, entryCount, generatedAt, isFinal } =
    raw as Record<string, unknown>;
  if (typeof periodType !== 'string' || typeof periodKey !== 'string') return null;
  if ((language !== 'en' && language !== 'de') || (source !== 'ai' && source !== 'basic')) return null;
  if (!Array.isArray(bullets) || !bullets.every((b) => typeof b === 'string')) return null;
  if (typeof entryCount !== 'number' || typeof generatedAt !== 'string') return null;
  const generatedAtMs = Date.parse(generatedAt);
  if (Number.isNaN(generatedAtMs)) return null;
  return {
    periodType: periodType as SummaryRecord['periodType'],
    periodKey,
    language,
    source,
    bullets,
    entryCount,
    generatedAt: generatedAtMs,
    isFinal: Boolean(isFinal),
  };
}

/**
 * Opens the native file picker for a `joblog-export-*.json` file (from `exportAllDataAsJson`)
 * and upserts its entries/summaries into the local database. Importing the same file twice is
 * safe — entries upsert by id, summaries upsert by (period_type, period_key, language).
 */
export async function importAllDataFromJson(): Promise<ImportResult> {
  const picked = await File.pickFileAsync({ mimeTypes: ['application/json', 'public.json'] });
  if (picked.canceled) return { status: 'cancelled' };

  let data: unknown;
  try {
    data = JSON.parse(await picked.result.text());
  } catch {
    return { status: 'invalid' };
  }

  if (typeof data !== 'object' || data === null || !Array.isArray((data as any).entries)) {
    return { status: 'invalid' };
  }

  const entries = ((data as any).entries as unknown[]).map(parseEntry).filter((e): e is Entry => e !== null);
  const summaries = Array.isArray((data as any).summaries)
    ? ((data as any).summaries as unknown[]).map(parseSummary).filter((s): s is SummaryRecord => s !== null)
    : [];

  if (entries.length === 0 && summaries.length === 0) return { status: 'invalid' };

  for (const entry of entries) upsertEntry(entry);
  for (const summary of summaries) putSummary(summary);

  return { status: 'imported', entryCount: entries.length, summaryCount: summaries.length };
}
