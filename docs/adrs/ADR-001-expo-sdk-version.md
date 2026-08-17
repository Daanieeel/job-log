# ADR-001: Expo SDK version — 56 initially, upgraded to 57 on request

## Status
Superseded (originally "Accepted" for staying on SDK 56; superseded when the user explicitly
asked to move to SDK 57).

## Context
The build spec asked for "Expo SDK (latest stable)". The project was scaffolded via
`@react-native-reusables/cli`, which pulled Expo SDK 56.0.13 / React Native 0.85.3. During
`npx expo prebuild`, the Expo CLI itself flagged that SDK 57.0.7 / React Native 0.86.0 was the
currently recommended version.

## Original decision (56)
Stayed on SDK 56 rather than upgrading mid-build, because:
- All native modules were already resolved and version-pinned against SDK 56.
- `@eitjuh/expo-apple-intelligence` is a small, unofficial community package (v0.1.1) with no
  stated SDK 57 compatibility testing — upgrading the whole toolchain to chase "latest" risked
  breaking the one native module the AI feature depends on.

## Revised decision (57)
The user explicitly asked to move to SDK 57. Upgraded via:

```bash
npx expo install expo@^57.0.0
npx expo install --fix
rm -rf ios && npx expo prebuild --platform ios
cd ios && pod install
npx expo run:ios
```

This brought react-native to 0.86.2, react-native-reanimated to 4.5.1, react-native-worklets to
0.10.1, and every `expo-*` package to its SDK 57-compatible version. `@eitjuh/expo-apple-intelligence`
declares wide-open peer deps (`"expo": "*"`, `"react": "*"`, `"react-native": "*"`), so it needed no
change and continued to build and link correctly. The `react-native-screens` version override (see
below) remained valid since SDK 57's expected range (`^4.26.0`) still resolves to the pinned 4.26.2.

## Consequences
- Re-verified: clean `tsc --noEmit`, clean `pod install`, and a successful `expo run:ios` build +
  launch on the iPhone 17 / iOS 26.5 simulator with no new runtime errors.
- The `react-native-screens` duplicate-copy issue (see the note in `DECISIONS.md`) was fixed via a
  `package.json` `overrides` entry pinning it to a single version across the dependency tree — this
  was necessary independent of the SDK version and remains in place after the SDK 57 upgrade.
