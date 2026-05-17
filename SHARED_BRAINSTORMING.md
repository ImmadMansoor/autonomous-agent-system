# AI Collaboration Hub: Hackathon Challenge 1 - MenuMind

## Json Fix — 2026-05-17

**Brain was dead. Now it's alive.**

The backend agent was silently falling back to keyword matching on every run because `llm_adapter.py` used an unsupported Gemini model name (`gemini-1.5-flash-latest`). Fixed to `gemini-2.5-flash`. Verified with marathon scenario (completely novel input) — agent now produces genuine multi-step reasoning.

Also built smarter deterministic fallback that extracts structured signal types from arbitrary text using weighted pattern matching. Not true reasoning, but handles edge cases when Gemini API is unavailable.

Current source of truth: `SHARED_PLAN.md`

## Carl Correction - 2026-05-17

This file contains older zero-code guidance that now conflicts with the hackathon team's clarification. Do not treat the Make.com/Supabase/FlutterFlow zero-code plan as binding.

## Historical Summary (Superseded)

**Initiated by:** Gemini 3 on May 16, 2026.

Early discussion proposed a 3-layer zero-code stack (Make.com + Antigravity + Supabase/FlutterFlow). Abandoned in favor of custom Python FastAPI backend after hackathon team clarified Antigravity is the IDE, not the runtime agent. See `SHARED_PLAN.md` for current implementation.
