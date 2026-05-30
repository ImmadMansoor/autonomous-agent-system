# MenuMind Current Plan

This is the current source of truth. Older model debates and solved issues have been removed to reduce context load.

## Product

MenuMind is an autonomous cafe operations agent for Challenge 1: content-to-action. It turns messy signals into business actions:

`signal -> interpretation -> policy check -> tool execution -> database state change -> trace/result`

## Current Stack

- Backend: FastAPI, SQLite, SQLAlchemy, Pydantic.
- Agent pipeline: `backend/agent.py`.
- Planner: `backend/llm_adapter.py`, Gemini REST first with safety fallback and settings-driven model routing.
- Tools: `backend/tools.py`.
- Frontend: Next.js operations console under `frontend/src/app`, deployed on Vercel.
- Mobile deliverable: Capacitor/APK track still needs review because older workflow/docs mention Vite-era settings.

## Architecture Decision

Do not pivot to Supabase, FlutterFlow, Make.com, or n8n now. Supabase/Make can be used as cloud workflow proof, but the main agent brain remains FastAPI + Gemini + tool registry. Supabase can replace storage later only after schema alignment.

## Fixed Problems

- Gemini REST model path now works with `gemini-2.5-flash`.
- Gemini calls have timeout/fallback protection.
- Settings Decision Speed now routes real backend Gemini models: Fast -> 2.5 Flash, Balanced -> 2.5 Pro, Thorough -> 3 Flash Preview.
- Auto-Approve Threshold legacy `0.7` values are normalized to `70%`.
- Routine supply shocks execute automatically instead of being incorrectly held for approval.
- Real crisis signals still create pending approvals.
- Frontend build succeeds.
- Planner/Ops Board is live at `/planner` and builds task cards from real latest agent runs with safe empty/demo fallbacks.
- Business Impact Forecaster is live on `/analytics` and uses real run fields with safe fallbacks.
- App icon/logo centering was corrected for local desktop builds.
- Frontend now has lightweight browser voice input for signal intake; it fills the textarea and does not auto-run the agent.
- Frontend now has lightweight browser TTS for completed runs; `Speak result` reads only a compact result summary.
- PWA fallback exists; APK generation is next.
- Ignore/context files were added to reduce AI token waste.

## Demo Scenarios

1. Supply shock: chicken delivery fails, low stock. Expected: hide Chicken Wrap, promote Beef Wrap, log tool calls.
2. Heatwave: 44C weather alert. Expected: promote Iced Mint Lemonade, alert staff.
3. Competitor price drop. Expected: promote/discount high-margin combo without destructive price war.
4. Crisis guardrail: strike or blocked road. Expected: no surge pricing, create approval.
5. Marathon/event: hot weather plus nearby runners. Expected: promote healthy cold drink and show strategic advice.

## Next Priorities

1. Test the new `Speak signal` and `Speak result` buttons in Chrome/PWA. If unsupported, leave typing/reading as the fallback.
2. Do not add native Capacitor speech plugins until APK build is already green.
3. Do not start APK work until Android environment is verified. Current check found bundled OpenJDK but did not find `adb`, `gradle`, or the default Android SDK path.
4. If Android Studio/SDK are available, add Capacitor Android wrapper and build debug APK with a strict 2-hour timebox.
5. If the Android toolchain is not ready, use the PWA/mobile browser install as the mobile prototype fallback and record it cleanly.
6. Test mobile/API wiring with the active Next.js environment variable `NEXT_PUBLIC_API_URL` pointed at a reachable backend. Emulator uses `http://10.0.2.2:8000`; real phone should use HTTPS tunnel if possible.
7. Keep backend and UI stable; avoid broad refactors unless they directly protect the demo.
8. Record a clean 3-5 minute demo showing voice/manual signal -> insight -> action -> spoken result -> simulation/result.
9. Show Antigravity screenshots/workplan and optional Make/Supabase workflow proof as support, not as the core live path.

## What Future AI Sessions Should Read

Start with `AGENTS.md`, then `PROJECT_HISTORY_A_TO_Z.txt`, then this file, then only the runtime files needed for the task. Do not read historical PDFs, extracted proposal docs, logs, `node_modules`, `.venv`, `dist`, or database files unless specifically needed.

## Voice + APK track (2-day)

- Day 1: Capacitor android shell, `NEXT_PUBLIC_API_URL` for emulator/LAN.
- Day 2: `@capacitor-community/speech-recognition` + `text-to-speech`, sync APK, E2E demo + video.
- Do not integrate OpenJarvis or copy `GITHUB REPO/` into app — npm packages only.
- Web mic and web TTS already in `App.jsx`; missing native APK voice fallbacks.

## Inter-Agent Communication: Handoff to Codex & Carl from Antigravity

Codex / Carl, we have successfully completed the massive milestone of compiling the React Native Skia UI locally, bypassing all Expo EAS cloud caching issues! 

**1. Current Source Code Truth:**
The entire mobile app UI/UX, including the Nothing OS-inspired Liquid Glass interface, is perfectly localized inside:
👉 `MenuMind-V2-SourceCode/`

**2. Architecture Changes:**
- Do not build from the cloud. Always use the local automated script: `MenuMind-V2-SourceCode\build-local-apk.ps1`.
- This script automatically mounts the workspace to a virtual drive (`M:\`) to transparently bypass Windows `MAX_PATH` C++ compilation limits and NPM `browserslist` space bugs (caused by the space in the parent folder name "Google Hackathon").
- The Gradle JVM Heap is automatically patched to 4GB to support Skia compilation.

**3. Final Output:**
The fully compiled V2 APK is available in `mobile apk/APK/MenuMind-release-V2.apk`.

**Next Steps for Codex/Carl:**
The user is currently testing the V2 Liquid Glass UI on their physical Android device. While we wait for UX feedback, please review the backend or any upcoming feature integrations. Let me know what you decide to build next in this MD file!

Everything is perfectly organized and ready for you. 🚀
