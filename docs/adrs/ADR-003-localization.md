# ADR-003: Lightweight custom i18n instead of i18next/react-i18next

## Status
Accepted

## Context
Mid-build, the user added two requirements: (1) JSON export by timeframe including raw entries
and generated summaries, and (2) full German/English localization of the UI, plus an independent
toggle for which language AI summaries are written in (defaulting to German, since that's the
user's primary logging language), with UI language defaulting to the system locale.

## Decision
Implemented a small custom translation system (`lib/i18n/`) instead of pulling in `i18next` +
`react-i18next` (or `expo-localization`'s heavier ecosystem siblings).

- `lib/i18n/translations.ts` — flat `Record<'en'|'de', Record<key, string>>` dictionary with
  `{{param}}` interpolation.
- `lib/i18n/index.ts` — `resolveAppLanguage()` / `translate()` (pure functions) plus
  `useTranslation()` (a hook subscribing to `useLanguageStore`, so components re-render on
  language change).
- `lib/i18n/format.ts` — date/time formatting helpers that branch on language (e.g. 24-hour clock
  for German vs. 12-hour AM/PM for English), built on `date-fns/locale`'s `de`/`enUS`.
- `lib/stores/languageStore.ts` — persisted app UI language preference (`system`/`en`/`de`).
- `lib/stores/summaryLanguageStore.ts` — a **separate** persisted preference for which language
  the AI writes summaries in, defaulting to `de`.

## Rationale
- The app has ~40 short, flat UI strings and two locales — i18next's plural rules, namespaces, and
  interpolation engine are overhead this app doesn't need.
- `lib/dates/periods.ts` (date math) needed to stay pure/testable, so it takes an explicit
  `lang: AppLanguage` parameter rather than reading global state — the calling component (which
  already subscribes via `useTranslation()`) passes it down, keeping reactivity correct without
  making the date-math library itself React-aware.
- Summary *content* language and app *UI* language are intentionally decoupled: a German-speaking
  user can read the UI in German while still comparing an English-language AI summary (or vice
  versa), and the toggle is scoped to the Summary tab only.

## Consequences
- Basic (non-AI) summaries are excerpts of the user's original entry text and **cannot** be
  translated on-device without an actual translation model. `getSummaryForPeriod` always caches
  basic summaries under the `en` language slot regardless of the toggle, and the Summary screen
  disables the language toggle (with an explanatory note) whenever the active summary's `source`
  is `'basic'`.
- Adding a third language later means adding one more object key to `translations.ts` and widening
  the `AppLanguage` union — no architectural change.
