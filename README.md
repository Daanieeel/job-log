# JobLog

A personal, fully offline, single-user work-logging app for iOS. Log short notes about what you
just did at work, browse them by day in an archive, and get AI-curated summaries (Day / Week /
Month / Quarter / Year) powered by on-device Apple Intelligence — with a graceful non-AI fallback
when it's unavailable.

Everything lives in local SQLite. No backend, no accounts, no sync.

## ⚠️ Requires a custom dev client — will NOT run in Expo Go

This app uses `@eitjuh/expo-apple-intelligence`, a native module, so **Expo Go cannot run it**.
You need a dev-client build.

```bash
bun install

# One-time native project generation + CocoaPods install
npx expo prebuild --platform ios
cd ios && pod install && cd ..

# Build and launch the dev client on a simulator or device
npx expo run:ios
```

After the first `run:ios`, day-to-day development is just:

```bash
bun dev   # starts Metro; reload the already-installed dev client to connect
```

Re-run `npx expo run:ios` whenever a native dependency changes (new `expo install`, new config
plugin, etc.) — Metro alone won't pick up native changes.

Apple Intelligence itself requires iOS 26+ on an iPhone 15 Pro or later (or an M-series iPad) with
Apple Intelligence enabled in Settings — see `docs/adrs/ADR-002-apple-intelligence-requirements.md`.
On anything else (including the simulator), the app automatically falls back to a basic,
non-AI summary — this is expected, not a bug.

## Project structure

```
app/                  Expo Router routes (tabs: Home, Archive, Summary, Settings)
components/           Screen-level components + components/ui (react-native-reusables primitives)
lib/
  db/                 expo-sqlite client, migrations, entries + summaries repositories
  ai/                 Apple Intelligence integration, basic fallback, cache-aware orchestrator
  dates/              Period (day/week/month/quarter/year) boundary math + archive day list
  i18n/               English/German translations, language resolution, locale-aware formatting
  export/             JSON export (raw entries + cached summaries) for a selected period
  theme/              Design tokens + ThemeProvider (system/light/dark)
  stores/             Zustand stores (theme, app language, summary language, summary filter)
docs/adrs/            Architecture decision records for assumptions made during the build
DECISIONS.md          Other build-time decisions and deviations from the original spec
```

## Localization

The UI is available in English and German (`Settings → App language`, default: system locale).
AI-generated summaries have their own independent language toggle on the Summary tab (default:
German), so you can log in German and read summaries in either language. Basic (non-AI) fallback
summaries can't be translated on-device and are shown in their original language — see
`docs/adrs/ADR-003-localization.md`.

## Exporting data

- **Settings → Export as text** — every entry ever logged, as a plain-text share sheet.
- **Summary tab → Export period as JSON** — the currently-selected period's raw entries plus any
  already-generated summaries (in whichever languages have been generated), as a `.json` file via
  the native share sheet. See `docs/adrs/ADR-004-json-export-scope.md` for exactly what's included.

## Tech stack

Expo SDK 56 (Router, dev-client), NativeWind + react-native-reusables, expo-sqlite, Zustand,
date-fns, `@eitjuh/expo-apple-intelligence`, expo-symbols/blur/linear-gradient/haptics,
`@expo-google-fonts/space-mono`.
