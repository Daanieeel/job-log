import { dateFnsLocaleFor, translate, type AppLanguage } from '@/lib/i18n';
import { formatShortDate } from '@/lib/i18n/format';
import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  format,
  getISOWeek,
  getISOWeekYear,
  getQuarter,
  startOfDay,
  startOfISOWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from 'date-fns';

export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

/** Adds the user-picked arbitrary date range, on top of the 5 fixed granularities. */
export type ExtendedPeriodType = PeriodType | 'custom';

export const GRANULARITIES: PeriodType[] = ['day', 'week', 'month', 'quarter', 'year'];

const CUSTOM_KEY_FORMAT = 'yyyy-MM-dd';

/** Builds a 'custom' period key from an inclusive start/end day pair. */
export function customPeriodKey(start: Date, endInclusive: Date): string {
  return `custom:${format(start, CUSTOM_KEY_FORMAT)}_${format(endInclusive, CUSTOM_KEY_FORMAT)}`;
}

export type PeriodBounds = {
  /** Inclusive start, local time. */
  start: Date;
  /** Exclusive end, local time. */
  end: Date;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Monday of the given ISO week/year, per ISO 8601 (Jan 4 always falls in week 1). */
function isoWeekStart(isoYear: number, isoWeek: number): Date {
  const jan4 = new Date(isoYear, 0, 4);
  const week1Monday = startOfISOWeek(jan4);
  return addWeeks(week1Monday, isoWeek - 1);
}

export function periodKeyFor(type: PeriodType, date: Date): string {
  switch (type) {
    case 'day':
      return format(date, 'yyyy-MM-dd');
    case 'week':
      return `${getISOWeekYear(date)}-W${pad2(getISOWeek(date))}`;
    case 'month':
      return format(date, 'yyyy-MM');
    case 'quarter':
      return `${date.getFullYear()}-Q${getQuarter(date)}`;
    case 'year':
      return format(date, 'yyyy');
  }
}

export function periodBounds(type: ExtendedPeriodType, key: string): PeriodBounds {
  switch (type) {
    case 'custom': {
      const [startStr, endStr] = key.replace('custom:', '').split('_');
      const [sy, sm, sd] = startStr.split('-').map(Number);
      const [ey, em, ed] = endStr.split('-').map(Number);
      const start = startOfDay(new Date(sy, sm - 1, sd));
      const endInclusive = startOfDay(new Date(ey, em - 1, ed));
      return { start, end: addDays(endInclusive, 1) };
    }
    case 'day': {
      const [y, m, d] = key.split('-').map(Number);
      const start = new Date(y, m - 1, d);
      return { start: startOfDay(start), end: startOfDay(addDays(start, 1)) };
    }
    case 'week': {
      const [yearStr, weekStr] = key.split('-W');
      const start = startOfISOWeek(isoWeekStart(Number(yearStr), Number(weekStr)));
      return { start, end: addWeeks(start, 1) };
    }
    case 'month': {
      const [y, m] = key.split('-').map(Number);
      const start = startOfMonth(new Date(y, m - 1, 1));
      return { start, end: startOfMonth(addMonths(start, 1)) };
    }
    case 'quarter': {
      const [yearStr, qStr] = key.split('-Q');
      const start = startOfQuarter(new Date(Number(yearStr), (Number(qStr) - 1) * 3, 1));
      return { start, end: startOfQuarter(addQuarters(start, 1)) };
    }
    case 'year': {
      const y = Number(key);
      const start = startOfYear(new Date(y, 0, 1));
      return { start, end: startOfYear(addYears(start, 1)) };
    }
  }
}

export function currentPeriodKey(type: PeriodType, now: Date = new Date()): string {
  return periodKeyFor(type, now);
}

export function stepPeriod(type: PeriodType, key: string, direction: 1 | -1): string {
  const { start } = periodBounds(type, key);
  const stepped =
    type === 'day'
      ? addDays(start, direction)
      : type === 'week'
        ? addWeeks(start, direction)
        : type === 'month'
          ? addMonths(start, direction)
          : type === 'quarter'
            ? addQuarters(start, direction)
            : addYears(start, direction);
  return periodKeyFor(type, stepped);
}

/** True once the period has fully elapsed and can never receive new entries. */
export function isPeriodFinal(type: ExtendedPeriodType, key: string, now: Date = new Date()): boolean {
  return periodBounds(type, key).end.getTime() <= now.getTime();
}

export type EyebrowKey = 'today' | 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'thisYear';

const EYEBROW_KEY: Record<PeriodType, EyebrowKey> = {
  day: 'today',
  week: 'thisWeek',
  month: 'thisMonth',
  quarter: 'thisQuarter',
  year: 'thisYear',
};

/** Translation-key form of the eyebrow tag for the currently-open period, e.g. 'today'. */
export function periodEyebrowKey(type: PeriodType, key: string, now: Date = new Date()): EyebrowKey | null {
  return key === currentPeriodKey(type, now) ? EYEBROW_KEY[type] : null;
}

export function periodLabel(type: ExtendedPeriodType, key: string, lang: AppLanguage): string {
  const { start, end } = periodBounds(type, key);
  const locale = dateFnsLocaleFor(lang);
  switch (type) {
    case 'custom': {
      const lastDay = addDays(end, -1);
      return `${format(start, 'PP', { locale })} – ${format(lastDay, 'PP', { locale })}`;
    }
    case 'day':
      return format(start, 'PPP', { locale });
    case 'week': {
      const lastDay = addDays(end, -1);
      const sameMonth = start.getMonth() === lastDay.getMonth();
      const sameYear = start.getFullYear() === lastDay.getFullYear();
      const endLabel = sameMonth
        ? format(lastDay, lang === 'de' ? 'd.' : 'd', { locale })
        : formatShortDate(lastDay, lang);
      const yearSuffix = sameYear ? '' : `, ${format(lastDay, 'yyyy')}`;
      const range = `${formatShortDate(start, lang)}–${endLabel}${yearSuffix}`;
      return translate(lang, 'period.week', { range });
    }
    case 'month':
      return format(start, 'LLLL yyyy', { locale });
    case 'quarter':
      return `Q${getQuarter(start)} ${start.getFullYear()}`;
    case 'year':
      return format(start, 'yyyy');
  }
}
