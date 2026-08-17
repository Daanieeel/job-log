# Build decisions

Assumptions and deviations made while building JobLog, beyond what's covered in `docs/adrs/`.

## Architecture / design system
- **Accent hues** (revised in the visual-overhaul pass): Violet/Purple (`hsl(258 90% 66%)` light,
  `hsl(258 92% 70%)` dark) is the brand accent — primary button, active segmented-control state,
  focus rings. Cobalt/Royal Blue, Warm Amber/Peach Orange, and Soft Light Blue/Cyan join it only in
  the hero glow gradient (`components/GlowBackground.tsx`, `lib/theme/tokens.ts`'s `GLOW_HUES`) —
  a bolder, multi-hue mesh rather than a single-hue glow. Dark mode gets +0.14 opacity per layer
  since the same hue reads fainter against a near-black background.
- **No monospace font.** The original build used Space Mono for timestamps/eyebrows; removed at
  the user's request. `Eyebrow` (`components/Eyebrow.tsx`, was `Mono.tsx`) now just uses the system
  sans, uppercase + wide tracking, for eyebrow tags; plain small muted `Text` is used inline for
  timestamps (the dedicated `MonoLabel` wrapper was removed as redundant once font-mono was gone).
- **Icons**: SF Symbols (`expo-symbols`, and `sf` props on `NativeTabs.Trigger.Icon`) for
  navigation-level chrome, Lucide (`lucide-react-native`) for in-content icons.
- **Native tab bar**: switched from a JS `Tabs` + manual `BlurView` hack to
  `expo-router/unstable-native-tabs`'s `NativeTabs`, which renders a real `UITabBarController` via
  `react-native-screens` — this is what actually gets iOS 26's Liquid Glass material automatically,
  rather than approximating it. It's an unstable/experimental expo-router API; if a future SDK
  upgrade changes its shape, `app/(tabs)/_layout.tsx` is the only file that needs updating. Native
  Stack headers (Archive, Summary) already got Liquid Glass for free — no change needed there.
- **`summaries` table** gained two columns beyond the spec's schema: `source` (`'ai' | 'basic'`,
  so the UI can show the "AI Summary" vs. "Basic Summary" tag without re-deriving it) and
  `language` (added in migration v2, see ADR-003) with the unique index widened to
  `(period_type, period_key, language)`.

## Data / dates
- **Week**: ISO 8601, Monday–Sunday, keyed as `YYYY-Www` (e.g. `2026-W33`), matching the spec.
- **Quarter**: calendar quarters (Jan–Mar, Apr–Jun, Jul–Sep, Oct–Dec), keyed `YYYY-Qn`.
- **Archive lookback**: exactly 1 year back from today when no entries exist yet, matching §4.
- **IDs**: `expo-crypto`'s `randomUUID()` rather than a userland UUID package.
- Forward navigation in the Summary period stepper is capped at the current period — you can't
  step into a not-yet-started future period (it would only ever show the empty state).

## Apple Intelligence
- See ADR-002 for the real vs. spec-assumed minimum OS/device requirements.
- The model is prompted to write bullets directly in the requested language (English or German) —
  see ADR-003 — rather than generating in one language and translating afterward.
- Basic (non-AI) fallback summaries take the longest, deduplicated entries verbatim — they cannot
  be translated on-device without a translation model, so they're always shown/cached in their
  original language regardless of the summary-language toggle (ADR-003).

## Dependency resolution
- `package.json` pins `overrides.react-native-screens` to `4.26.2`. Without it, bun resolved two
  different `react-native-screens` copies (root + one nested under `expo-router/node_modules/`),
  which double-registered the native `RNSScreen` view and crashed on launch with
  `Invariant Violation: Tried to register two views with the same name RNSScreen`. The override
  forces a single resolved version across the tree.
- Expo SDK was bumped 56 → 57 (see ADR-001) at the user's request, after initially staying on 56.

## Visual-overhaul additions
- **Custom date-range summaries**: added `'custom'` as an `ExtendedPeriodType` on top of the
  existing 5-granularity `PeriodType`, rather than widening `PeriodType` itself — that would have
  forced a `'custom'` case into every exhaustive switch/`Record<PeriodType, …>` keyed on the fixed
  granularities (`GRANULARITIES`, `summaryFilterStore`, the segmented control), none of which have
  any notion of "current custom period" or "step". Only `periodBounds`, `periodLabel`,
  `isPeriodFinal`, and the summary/export functions accept the wider type; a custom key is
  `custom:yyyy-MM-dd_yyyy-MM-dd` (start/end inclusive), parsed by `periodBounds`.
- **Home composer's date-edit button** lets you backfill an entry to a past date/time (a small
  gear icon left of send, opens a page-sheet date picker) — it's genuinely a "settings for this
  entry" affordance, framed that way per the request, even though date is the only setting today.
- **Archive's extended view** shows each day's first 3 entries (most-recent-first, consistent with
  every other list in the app) plus a "+N more" badge; fetches every entry in the visible archive
  window in one query (`listInRangeGroupedByDay`) rather than per-row, since SQLite handles a
  year's worth of rows in milliseconds and this avoids N+1 queries during scroll.
- **Summary/App language toggles show flags** (🇺🇸 English — US English specifically, per the
  request — and 🇩🇪 German); the Summary content-language toggle always puts the app's *current*
  resolved UI language first/selected-by-default (`summaryLanguageStore.language` is `null` until
  the user explicitly picks one, falling back to the live app language rather than a hardcoded
  default) — so switching App Language in Settings also reorders/redefaults the Summary toggle.

## Dev ergonomics
- `lib/db/seed.ts` inserts ~9 fake entries spanning the last ~45 days, gated on `__DEV__ &&
  entries table is empty`, so Home/Archive/Summary aren't empty on first run in development.
- Ruby on this machine is 2.6.10 (pre-dates `Array#filter_map`, added in 2.7), which makes
  CocoaPods' newer "precompiled Expo module" xcframework-lookup step throw non-fatal warnings
  during `pod install`. It falls back to building every pod from source, which works fine — just
  slower. Not fixed here since it's a system Ruby version issue, not a project one.
