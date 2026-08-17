# ADR-004: JSON export scope — exact selected period, cache-only summaries

## Status
Accepted

## Context
The user asked to "select a timeframe and export it as json," including "the raw data I typed in
as well as all generated summaries for that timeframe."

## Decision
The Job Summary tab already has a full timeframe picker (granularity segmented control + period
stepper), so the export action lives there rather than duplicating a second picker in Settings.
"Export period as JSON" exports exactly the currently-selected `(granularity, periodKey)`:

- **Entries**: every raw entry (`id`, `text`, `createdAt` as ISO 8601, `dayKey`) whose timestamp
  falls within that period's bounds.
- **Summaries**: every *already-cached* summary row for that exact `(period_type, period_key)`
  pair, across both languages (`getAllCachedSummariesForPeriod`) — e.g. if the user generated both
  an English and a German summary for "August 2026," both are included.
- Export **never triggers a fresh AI generation** — it dumps what already exists. If no summary has
  been generated yet for that period, `summaries` is an empty array; the user can visit the Summary
  tab first (which will generate and cache one) and export again.

The file is written via `expo-file-system`'s new `File`/`Paths` API to the cache directory and
handed to the native share sheet via `expo-sharing`, so the user can save it to Files, AirDrop it,
etc. — a real file picker, not a plain-text `Share.share` blob (which the existing "Export as text"
Settings action already covers for the full history).

## Rationale
- Exporting sub-period summaries nested inside the selected range (e.g. all daily summaries within
  a selected month) was considered but rejected as scope creep: it requires a period-overlap query
  across differently-shaped period keys (`day` keys vs. `month` keys aren't directly comparable)
  for a use case the user didn't ask for. The exact-period model is simpler, predictable, and
  matches "that timeframe" literally.
- Not force-generating a summary on export keeps the action side-effect-free and fast — it can't
  trigger a slow on-device model call or fail with a generation error; it just reflects the cache.

## Consequences
Documented in the in-app copy is implicit, not explicit: there's no "no summaries yet" warning
before export. If this surprises users in practice, a follow-up could show a small note when
`summaries` would be empty.
