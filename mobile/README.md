# MenuMind Mobile

This folder contains the Android mobile application source and release APK artifacts.

## Structure

- `MenuMind-LiquidGlass/` - React Native / Expo source with the native Kotlin Jetpack Compose liquid-glass bottom navigation.
- `releases/android/` - preserved APKs for physical-device testing.
- `build-mobile-apk-fast.ps1` - fast local build script that syncs the mobile source to a space-safe mirror and builds a release APK.

## Release APK

- `releases/android/MenuMind-release-V49-current.apk` - current working build with the stronger frosted navigation base and immediate theme sync.

## Build

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\mobile\build-mobile-apk-fast.ps1 -Version V50
```

The script writes APKs to:

- `mobile apk/APK/`
- `_PROTECTED_RELEASES/`

Do not commit `node_modules`, Android Gradle outputs, `.cxx`, or mirror folders. They are generated build artifacts.
