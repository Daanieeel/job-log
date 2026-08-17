# ADR-002: Apple Intelligence's real minimum requirements exceed the spec's assumption

## Status
Accepted

## Context
The build spec assumed Apple Intelligence requires "iOS 18.1+ on supported silicon." The actual
`@eitjuh/expo-apple-intelligence` package (which wraps Apple's Foundation Models framework) states
in its own README:

| Requirement | Minimum |
|-------------|---------|
| iOS Version | iOS 26.0+ |
| Device | iPhone 15 Pro+ / iPad with M1+ |
| Apple Intelligence | Must be enabled in Settings |
| Xcode | 26.0+ |

The package README also flags iOS 26 / Foundation Models as beta, with APIs that may still change.

## Decision
Build against the package's actual stated requirements, not the spec's assumption. No code change
was needed beyond this: §6 of the spec already required graceful handling of "unavailable" for any
reason (unsupported device, OS version too low, or Apple Intelligence disabled in Settings), and
`getAvailabilityStatus()` reports all three cases uniformly. The app doesn't hardcode a version
check — it defers entirely to the native module's own availability report, so it will continue to
work correctly however Apple's actual rollout requirements evolve.

## Consequences
- On every simulator and on any physical device below iPhone 15 Pro / iOS 26, the app will report
  "unavailable" and use the basic fallback summary (§6b) — this is expected, not a bug.
- No real device meeting these requirements was available to verify `generateResponse()` end-to-end
  during this build; the integration was verified against the package's documented API surface
  (`isAvailable`, `getAvailabilityStatus`, `generateResponse`) and exercised via the fallback path
  in the simulator.
