# Worklets Bundle Mode + `React.lazy` → SIGABRT

Minimal reproduction for: a worklet defined in a module that is only reachable through a
dynamic `import()` is missing from the worklets bundle. The UI runtime resolves it to
`undefined`, calls it, and the process aborts.

- `react-native-worklets` 0.10.1
- `react-native-reanimated` 4.5.1
- `expo` 57.0.11 / `react-native` 0.86.2 / New Architecture
- Reproduced in Expo Go 57.0.6, iOS 27.0 simulator (iPhone 17 Pro), macOS arm64

## Steps

```bash
npm install
npx expo start
# press `i`, or open exp://127.0.0.1:8081 in Expo Go
```

> **First run only:** Metro may fail with `Failed to get the SHA-1 for:
> node_modules/react-native-worklets/.worklets/<hash>.js`. The babel plugin writes that
> file into `node_modules` while the request is being served, after Metro built its haste
> map, so it isn't watched yet. Restart Metro once and it goes away. This is arguably a
> second papercut worth fixing — see "Notes" below.

Then press **"Mount lazy animated screen"**.

## Expected

The lazily-imported screen mounts and its `useAnimatedStyle` fades it in.

## Actual

The app dies immediately with `SIGABRT`. Just before the abort, the device log shows:

```
[Worklets] Unable to resolve worklet with hash 17378514769620. Try reloading the app.
Original error: Requiring unknown module "17378514769620".
```

The crash report has **no JS frames at all**:

```
0   libsystem_kernel.dylib   __pthread_kill
...
10  libc++abi.dylib          __cxa_throw
11  hermesvm                 HermesRuntimeImpl::throwPendingError()
12  hermesvm                 HermesRuntimeImpl::call(...)
13  Expo Go                  jsi::WithRuntimeDecorator<worklets::WorkletsReentrancyCheck, ...>::call(...)
14  Expo Go                  jsi::WithRuntimeDecorator<worklets::AroundLock, ...>::call(...)
15  Expo Go                  worklets::WorkletRuntime::runSync<double&>(jsi::Function const&, double&) const
16  Expo Go                  worklets::AnimationFrameBatchinator::flush()::$_0
17  Expo Go                  -[AnimationFrameQueue executeQueue:]
18  QuartzCore               CA::Display::DisplayLinkItem::dispatch_(...)
```

Reading the log requires the device console, because the Metro console dies with the process:

```bash
xcrun simctl spawn <udid> log stream --predicate 'process == "Expo Go"'
```

## Control

In `App.js`, swap the two marked lines so `AnimatedScreen` is imported statically. The
same worklet, the same component, the same everything — it renders correctly. Only the
module's reachability changed.

## Why it aborts instead of showing a red box

`WorkletRuntime::runSync(const jsi::Function&, ...)` only wraps the call in `callGuarded`
under `#ifndef NDEBUG` (`Common/cpp/worklets/WorkletRuntime/WorkletRuntime.h`). Expo Go and
release dev-clients are built with `NDEBUG`, so the `jsi::JSError` propagates out of the
`CADisplayLink` callback with no handler and hits `std::terminate`.

`AnimationFrameBatchinator::flush()` is the entry point here because Reanimated drives its
mapper loop and animation steps from `requestAnimationFrame` on the UI runtime
(`react-native-reanimated/src/core.ts`, `valueSetter.ts`). Scheduling the same broken
worklet through `runOnUI` instead produces the identical abort one frame earlier, via
`worklets::UIScheduler::triggerUI` → `scheduleOnUI` → `runSync`.

## Notes

Two things look separable here:

1. **Diagnosability.** The resolution failure is already detected and logged, but execution
   continues and returns `undefined` to the caller. Throwing a `WorkletsError` at the
   resolution site — or keeping the rAF / `scheduleOnUI` paths guarded in release builds —
   would turn a stackless native crash into an actionable JS error.
2. **Functionality.** `bundleModeCreateModuleIdFactory` assigns fixed ids (`-2` for the
   worklets entry, the worklet hash for each `.worklets/<hash>.js`) that only exist in the
   main bundle, so async chunks can't resolve them. With no eager worklet anywhere in the
   app, the failure surfaces even earlier as `Requiring unknown module "-2"` when the async
   chunk loads — `EagerBox.js` exists in this repro purely to get past that and reach the
   more representative case.

Production `expo export` emits a single bundle with no async chunks, so shipped apps are
unaffected — but the affected screen is impossible to open during development.
