import { listAllForExport } from '@/lib/db/entries';
import { getAllSummaries } from '@/lib/db/summaries';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const EXPORT_FORMAT_VERSION = 1;

/**
 * Exports every entry and every cached summary as a single JSON file, then hands it to the
 * native share sheet. This is the file `importAllDataFromJson` knows how to read back in.
 */
export async function exportAllDataAsJson(): Promise<'exported' | 'empty' | 'unavailable'> {
  const entries = listAllForExport();
  if (entries.length === 0) return 'empty';

  const payload = {
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    entries: entries.map((entry) => ({
      id: entry.id,
      text: entry.text,
      createdAt: new Date(entry.createdAt).toISOString(),
      dayKey: entry.dayKey,
    })),
    summaries: getAllSummaries().map((summary) => ({
      periodType: summary.periodType,
      periodKey: summary.periodKey,
      language: summary.language,
      source: summary.source,
      bullets: summary.bullets,
      entryCount: summary.entryCount,
      generatedAt: new Date(summary.generatedAt).toISOString(),
      isFinal: summary.isFinal,
    })),
  };

  const file = new File(Paths.cache, `joblog-export-${Date.now()}.json`);
  file.write(JSON.stringify(payload, null, 2));

  if (!(await Sharing.isAvailableAsync())) return 'unavailable';

  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
  return 'exported';
}
