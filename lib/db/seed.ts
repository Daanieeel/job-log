import { getDb } from '@/lib/db/client';
import { createEntry } from '@/lib/db/entries';
import { subDays, subHours } from 'date-fns';

const SAMPLE_ENTRIES: Array<{ at: (now: Date) => Date; text: string }> = [
  { at: (now) => subHours(now, 2), text: 'Fixed the flaky CI test for the auth module' },
  { at: (now) => subHours(now, 5), text: 'Paired with Sam on the onboarding flow redesign' },
  { at: (now) => subDays(now, 1), text: 'Shipped the v2.3 release to TestFlight' },
  { at: (now) => subDays(now, 1), text: 'Reviewed three PRs from the mobile team' },
  { at: (now) => subDays(now, 3), text: 'Wrote the RFC for the new notification service' },
  { at: (now) => subDays(now, 4), text: 'Debugged the memory leak in the background sync job' },
  { at: (now) => subDays(now, 8), text: 'Ran the quarterly planning session' },
  { at: (now) => subDays(now, 20), text: 'Migrated the database to the new schema' },
  { at: (now) => subDays(now, 45), text: 'Gave a tech talk on our on-device AI approach' },
];

/** Populates a handful of fake entries in dev builds only, so screens aren't empty on first run. */
export function seedDevData(): void {
  if (!__DEV__) return;

  const { count } =
    getDb().getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM entries;') ?? {};
  if (count) return;

  const now = new Date();
  for (const sample of SAMPLE_ENTRIES) {
    createEntry(sample.text, sample.at(now));
  }
}
