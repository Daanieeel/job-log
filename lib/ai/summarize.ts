import { countByRange, listByRange } from '@/lib/db/entries';
import { getCachedSummary, putSummary, type SummarySource } from '@/lib/db/summaries';
import { isPeriodFinal, periodBounds, periodLabel, type ExtendedPeriodType } from '@/lib/dates/periods';
import { checkAvailability, summarizeWithAppleIntelligence } from '@/lib/ai/appleIntelligence';
import { generateFallbackSummary } from '@/lib/ai/fallbackSummary';
import type { AppLanguage } from '@/lib/i18n';

export type SummaryResult = {
  bullets: string[];
  source: SummarySource;
  language: AppLanguage;
  generatedAt: number;
  isFinal: boolean;
  entryCount: number;
};

/**
 * Basic (non-AI) summaries are just excerpts of the original entry text — they can't be
 * translated, so they're always cached under this canonical language regardless of which
 * language the user has toggled to. The UI disables the language toggle for basic summaries.
 */
const BASIC_SUMMARY_LANGUAGE: AppLanguage = 'en';

/**
 * Resolves the summary for a period in a given content language, honoring the cache rule:
 * a cached row is reused when it's final (period fully in the past) or its entry_count still
 * matches the live count. Otherwise the on-device model (or the basic fallback) regenerates it.
 */
export async function getSummaryForPeriod(
  type: ExtendedPeriodType,
  key: string,
  language: AppLanguage,
  options: { force?: boolean } = {}
): Promise<SummaryResult> {
  const bounds = periodBounds(type, key);
  const liveCount = countByRange(bounds.start.getTime(), bounds.end.getTime());
  const final = isPeriodFinal(type, key);

  const availability = await checkAvailability();
  const cacheLanguage = availability.isAvailable ? language : BASIC_SUMMARY_LANGUAGE;

  const cached = getCachedSummary(type, key, cacheLanguage);
  if (!options.force && cached && (cached.isFinal || cached.entryCount === liveCount)) {
    return {
      bullets: cached.bullets,
      source: cached.source,
      language: cached.language,
      generatedAt: cached.generatedAt,
      isFinal: cached.isFinal,
      entryCount: cached.entryCount,
    };
  }

  if (liveCount === 0) {
    return {
      bullets: [],
      source: 'basic',
      language: cacheLanguage,
      generatedAt: Date.now(),
      isFinal: final,
      entryCount: 0,
    };
  }

  const entries = listByRange(bounds.start.getTime(), bounds.end.getTime());

  let bullets: string[];
  let source: SummarySource;

  if (availability.isAvailable) {
    const label = periodLabel(type, key, language);
    bullets = await summarizeWithAppleIntelligence(entries, label, language);
    source = 'ai';
  } else {
    bullets = generateFallbackSummary(entries.map((e) => e.text));
    source = 'basic';
  }

  const generatedAt = Date.now();
  putSummary({
    periodType: type,
    periodKey: key,
    language: cacheLanguage,
    bullets,
    entryCount: liveCount,
    generatedAt,
    isFinal: final,
    source,
  });

  return { bullets, source, language: cacheLanguage, generatedAt, isFinal: final, entryCount: liveCount };
}
