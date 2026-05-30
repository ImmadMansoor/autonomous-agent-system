# Repository Layout

This repository now keeps the deployed web/backend code and the mobile Android source in one place without moving the existing Vercel paths.

## Active Folders

- `frontend/` - production Next.js frontend used by the Vercel website.
- `backend/` - FastAPI backend and agent orchestration code.
- `desktop-app/` - desktop application source.
- `mobile/` - Android mobile app source and APK releases.

## Mobile

- `mobile/MenuMind-LiquidGlass/` - React Native / Expo app plus native Kotlin Jetpack Compose liquid-glass navigation source.
- `mobile/releases/android/MenuMind-release-V49-current.apk` - current working APK after the frosted nav/theme sync fixes.
- `mobile/build-mobile-apk-fast.ps1` - local Android release build script.

## Archived And Local-Only Material

- `_ARCHIVE_DO_NOT_INDEX/`, `_build_logs/`, `_device_logs/`, `_device_screenshots/`, APK inspection folders, and local build mirrors are local debugging material and should stay out of Git.
- `node_modules`, Gradle outputs, Rust `target`, Android `.cxx`, `.gradle`, and generated APK build outputs are intentionally ignored.

The current web deployment paths are left unchanged so Vercel does not break during this mobile-source upload.
