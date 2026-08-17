import { dateFnsLocaleFor, type AppLanguage } from '@/lib/i18n';
import { periodBounds } from '@/lib/dates/periods';
import { eachDayOfInterval, format, startOfDay, subYears } from 'date-fns';

export type ArchiveDay = { dayKey: string; count: number };
export type ArchiveSection = { title: string; data: ArchiveDay[] };

/**
 * Every calendar day from the first-ever entry through today, newest first,
 * grouped by month. Falls back to a 1-year lookback when nothing has been logged
 * yet, so the list is never unbounded.
 */
export function buildArchiveSections(
  counts: Map<string, number>,
  firstDayKey: string | null,
  lang: AppLanguage,
  today: Date = new Date()
): ArchiveSection[] {
  const locale = dateFnsLocaleFor(lang);
  const todayStart = startOfDay(today);
  const start = firstDayKey ? periodBounds('day', firstDayKey).start : subYears(todayStart, 1);
  const days = eachDayOfInterval({ start, end: todayStart }).reverse();

  const sections: ArchiveSection[] = [];
  const indexByTitle = new Map<string, number>();

  for (const date of days) {
    const dayKey = format(date, 'yyyy-MM-dd');
    const title = format(date, 'LLLL yyyy', { locale }).toUpperCase();

    let index = indexByTitle.get(title);
    if (index === undefined) {
      index = sections.length;
      indexByTitle.set(title, index);
      sections.push({ title, data: [] });
    }
    sections[index].data.push({ dayKey, count: counts.get(dayKey) ?? 0 });
  }

  return sections;
}
