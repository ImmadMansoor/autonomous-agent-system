# MenuMind AI Context Guide

Read this file first when helping with MenuMind. It exists to reduce context waste.

When recording cross-model discussion in markdown, refer to this assistant as Carl.

## Current Build

- Product: MenuMind, Challenge 1 autonomous content-to-action agent.
- Backend: `backend/main.py` FastAPI API, `backend/agent.py` pipeline, `backend/tools.py` tool registry.
- Planner: `backend/llm_adapter.py` uses Gemini REST when available and a clearly labeled safety fallback when Gemini fails.
- Frontend: `frontend/src/App.jsx` mobile-first React/Vite operations console.
- Mobile: PWA exists, but the next target is a Capacitor Android APK.

## Read Only When Needed

- `PROJECT_HISTORY_A_TO_Z.txt` is the durable full handoff.
- `SHARED_PLAN.md` is the concise current plan.
- `SHARED_BRAINSTORMING.md` is a short strategy summary, not a debate log.
- Extracted PDF markdown files were compressed into summaries; use the PDFs only if exact challenge wording is needed.
- Never read `node_modules`, `.venv`, `dist`, `.db`, logs, PDFs, screenshots, or generated artifacts for normal coding tasks.

## Safe Priorities

1. Preserve the working signal -> plan -> tools -> database -> trace -> UI loop.
2. Keep the safety fallback; it protects demos when Gemini/network stalls.
3. Do not pivot to Supabase, FlutterFlow, Make.com, or n8n unless the user explicitly reopens architecture.
4. Prefer small verified fixes over broad rewrites.
5. Do not reintroduce frontend hardcoded business planning.
