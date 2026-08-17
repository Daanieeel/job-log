import { format } from 'date-fns';
import { dateFnsLocaleFor, type AppLanguage } from '@/lib/i18n';

/** Entry timestamp — 24-hour clock in German, 12-hour with AM/PM in English. */
export function formatTime(date: Date, lang: AppLanguage): string {
  return lang === 'de' ? format(date, 'HH:mm') : format(date, 'h:mm a');
}

/** Compact date + time, used in AI prompts and export metadata. */
export function formatTimestamp(date: Date, lang: AppLanguage): string {
  const locale = dateFnsLocaleFor(lang);
  return lang === 'de'
    ? format(date, "d. MMM, HH:mm", { locale })
    : format(date, 'MMM d, h:mm a', { locale });
}

/** Short "Aug 17" / "17. Aug" style date, used inside week-range labels. */
export function formatShortDate(date: Date, lang: AppLanguage): string {
  const locale = dateFnsLocaleFor(lang);
  return lang === 'de' ? format(date, 'd. MMM', { locale }) : format(date, 'MMM d', { locale });
}
