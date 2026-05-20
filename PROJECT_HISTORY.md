# MenuMind Project History

This is the compact handoff for future AI sessions. Keep it short and current; do not paste full logs or model debates here.

## Current Product

MenuMind is an autonomous cafe operations agent for the Google Antigravity Hackathon, Challenge 1: content-to-action agentic workflow development.

Core loop:

`messy signal -> Gemini reasoning -> policy guardrail -> tool execution -> database mutation -> trace -> UI explanation`

The runtime agent lives in the app itself, mainly `backend/agent.py`, `backend/llm_adapter.py`, and `backend/tools.py`. Google Antigravity was used as the development environment, not as the production agent runtime.

## Current Stack

- Backend: FastAPI, SQLite, SQLAlchemy, Pydantic.
- Agent: Gemini REST planner with deterministic safety fallback.
- Model routing: settings-driven Gemini model selection.
- Frontend: Next.js app under `frontend/src/app`.
- Live frontend: Vercel, `https://menumind-nu.vercel.app`.
- Live backend: Render, `https://menumind-backend.onrender.com`.
- Desktop: Tauri build exists locally.
- Mobile: Capacitor files exist, but APK workflow still needs review because the active frontend is Next.js, not the older Vite flow.

## Recent Milestones

### Base Autonomous Agent

- Built signal ingestion through `POST /signals`.
- Built agent execution through `POST /agent/run/{signal_id}`.
- Agent produces structured final decisions, workplans, recommendations, simulated execution, demand forecast, revenue projection, and strategic advice.
- Tool registry supports safe cafe operations such as menu availability, promotion, staff alerts, customer notifications, approvals, and audit/trace logging.
- High-risk actions are paused through approval guardrails instead of being blindly executed.

### Gemini Reliability

- Gemini REST path works with current Gemini model names.
- Timeout protection and safety fallback remain in place.
- Backend `/health` reports planner mode, default model, and timeout.

### Decision Speed Model Routing

Implemented real backend model routing from Settings -> AI Agent Preferences -> Decision Speed.

Mapping:

- Fast: `gemini-2.5-flash`, lower latency.
- Balanced: `gemini-2.5-pro`, deeper reasoning.
- Thorough: `gemini-3-flash-preview`, higher-depth preview path.

Backend reads saved preferences for the current user during agent runs and passes the selected speed into `GeminiPlanner`. This is not only a frontend label change.

Environment overrides exist:

- `GEMINI_FAST_MODEL`
- `GEMINI_BALANCED_MODEL`
- `GEMINI_THOROUGH_MODEL`
- matching timeout override variables.

Validation performed:

- Python compile passed for model-routing backend files.
- Mocked Gemini endpoint test proved each speed calls its matching model endpoint and timeout.
- Live Vercel bundle contains the model labels.
- Live backend settings endpoint returns normalized settings.

### Auto-Approve Threshold Fix

Fixed the old `0.7%` display bug.

- Backend default is now `70`.
- Backend normalizes legacy `0.7` values to `70`.
- Frontend also normalizes old values.
- UI now displays `70%` instead of `0.7%`.

### Logo / App Icon Centering

Used the finalized MenuMind logo reference to regenerate centered icon assets for the desktop app.

Outcome:

- Star mark is visually centered in the app icon.
- Tauri icon assets were regenerated locally.
- Desktop portable build was produced locally under `Windows Application/`.

Note: keep generated binaries out of normal source commits unless the user explicitly asks to publish binaries.

### Planner / Ops Board

Antigravity built the Planner concept; Carl reviewed, fixed, committed, pushed, and verified it live.

Live route:

- `https://menumind-nu.vercel.app/planner/`

Feature behavior:

- Pulls latest run, trace, approvals, notifications, menu diff, and matching signal text through the real API.
- Builds operational task cards from actual agent output via `buildOpsPlan`.
- Columns: Now, Next, Needs Approval, Done.
- Task cards include owner, due timing, priority, and confidence.
- Completed tasks persist in `localStorage`.
- Completion state is scoped by `run_id` so old completed tasks do not incorrectly mark future run tasks as done.
- Empty state lets demo users ingest a custom signal or apply preset signals.

Important truth:

- Planner is data-driven from real agent runs.
- It has safe empty/demo states for when no backend run exists.
- It is not a fake hardcoded board, but the frontend task grouping is deterministic logic over the real agent output.

### Business Impact Analytics

Antigravity added Option 2: Dynamic Margin & Financial Impact Forecaster; Carl verified and pushed it live as part of the Planner release.

Location:

- `https://menumind-nu.vercel.app/analytics/`

Feature behavior:

- Polls latest agent run every 8 seconds.
- Shows Projected Profit, Prevented Stock Loss, Guardrail Events, and Menu Changes Executed.
- Shows an intervention flow: Input Signal -> Agent Decision -> Business Value -> Safety Guardrail.
- Uses real run fields when present.
- Uses safe demo fallbacks only when no latest run or no revenue/demand fields exist.
- Revenue values are parsed safely as numbers to avoid render crashes from string API values.

### Deployment

Recent pushed commits:

- `6ab52f7` - decision speed to Gemini model routing.
- `b1cc537` - Planner and Business Impact analytics.

Vercel production deployment for `b1cc537` reached `READY`.

Verified live:

- `/planner/` returns HTTP 200.
- `/analytics/` returns HTTP 200.
- Live backend endpoints used by Planner return HTTP 200.

## Notion / External Repo Status

No real Notion integration is currently added.

The repo has references to "Notion-style" UI wording, but no Notion API auth, sync, database creation, or page publishing logic.

External uploaded repos under folders like `GITHUB REPO/` or duplicate source dumps should not be copied into the app unless there is a specific, small, justified integration. Most are too risky for the hackathon deadline.

## Known Remaining Gaps

- Live backend may return no runs for `demo-token` after deploy/reset. In that case Planner shows the empty state until a signal is ingested.
- `npm run lint` is stale for the current Next.js version and currently fails because `next lint` is no longer valid in this setup. Use `next build` and `tsc --noEmit` until the lint script is replaced.
- Mobile/APK story needs cleanup. Existing workflow references older Vite-style `VITE_API_URL`, while the active app uses `NEXT_PUBLIC_API_URL`.
- `README.md`, `SHARED_PLAN.md`, and older context files may still contain Vite-era wording. Prefer this file plus live code when there is a conflict.
- There are untracked/local artifacts that should not be blindly committed: duplicate repo folders, Windows application binaries, handoff docs, and old zip deletion.

## Recommended Next Work

1. Stop adding large features unless judges explicitly need one.
2. Polish the live demo path: Settings -> Decision Speed, Operations signal run, Planner board, Analytics Business Impact, Logs trace, Approvals guardrail.
3. Fix mobile/APK documentation and workflow if a mobile deliverable is required.
4. Clean stale docs and remove/ignore duplicate local dumps carefully.
5. Optionally add a small "demo seed" button or script to create one safe backend run before judging, but do not hide that it is demo data.

## Validation Commands Used Recently

Frontend:

```bash
cd frontend
npm run build
npx tsc --noEmit
```

Backend:

```bash
python -m py_compile backend/main.py backend/agent.py backend/llm_adapter.py
```

Live checks:

- Vercel deployment status via Vercel connector.
- Live route fetches for `/planner/` and `/analytics/`.
- Render backend endpoint checks for `/agent/runs?limit=1` and `/signals?limit=10`.

