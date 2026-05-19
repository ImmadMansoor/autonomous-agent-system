# MenuMind Current Plan

This is the current source of truth. Older model debates and solved issues have been removed to reduce context load.

## Product

MenuMind is an autonomous cafe operations agent for Challenge 1: content-to-action. It turns messy signals into business actions:

`signal -> interpretation -> policy check -> tool execution -> database state change -> trace/result`

## Current Stack

- Backend: FastAPI, SQLite, SQLAlchemy, Pydantic.
- Agent pipeline: `backend/agent.py`.
- Planner: `backend/llm_adapter.py`, Gemini REST first with safety fallback.
- Tools: `backend/tools.py`.
- Frontend: React/Vite operations console.
- Mobile deliverable: build Android APK with Capacitor; PWA remains backup.

## Architecture Decision

Do not pivot to Supabase, FlutterFlow, Make.com, or n8n now. Supabase/Make can be used as cloud workflow proof, but the main agent brain remains FastAPI + Gemini + tool registry. Supabase can replace storage later only after schema alignment.

## Fixed Problems

- Gemini REST model path now works with `gemini-2.5-flash`.
- Gemini calls have timeout/fallback protection.
- Routine supply shocks execute automatically instead of being incorrectly held for approval.
- Real crisis signals still create pending approvals.
- Frontend build succeeds.
- Frontend no longer contains hardcoded demo planner logic.
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
6. Test mobile with `VITE_API_URL` pointed at a reachable backend. Emulator uses `http://10.0.2.2:8000`; real phone should use HTTPS tunnel if possible.
7. Keep backend and UI stable; avoid broad refactors unless they directly protect the demo.
8. Record a clean 3-5 minute demo showing voice/manual signal -> insight -> action -> spoken result -> simulation/result.
9. Show Antigravity screenshots/workplan and optional Make/Supabase workflow proof as support, not as the core live path.

## What Future AI Sessions Should Read

Start with `AGENTS.md`, then this file, then only the runtime files needed for the task. Do not read historical PDFs, extracted proposal docs, logs, `node_modules`, `.venv`, `dist`, or database files unless specifically needed.

## Voice + APK track (2-day)

- Day 1: Capacitor android shell, `VITE_API_URL` for emulator/LAN.
- Day 2: `@capacitor-community/speech-recognition` + `text-to-speech`, sync APK, E2E demo + video.
- Do not integrate OpenJarvis or copy `GITHUB REPO/` into app — npm packages only.
- Web mic and web TTS already in `App.jsx`; missing native APK voice fallbacks.

