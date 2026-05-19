# MenuMind Current Proposal Summary

Older versions of this proposal mentioned Supabase, FlutterFlow, Make.com, Slack, and EmailJS. Those are historical ideas, not the current build path.

## Current Pitch

MenuMind is an autonomous operations agent for small cafes. It reads messy business signals such as supplier messages, weather warnings, local events, and competitor price changes, then turns them into safe operational actions.

## Current Stack

- Google Antigravity: visible reasoning/workplan design environment for the hackathon story.
- Gemini: runtime reasoning model when available.
- FastAPI: execution API and agent pipeline.
- SQLite: local system state for the hackathon demo.
- React/Vite: mobile-first operations console.
- PWA: mobile app fallback.

## Agent Loop

1. Observe raw signal.
2. Extract facts and classify signal.
3. Score impact and confidence.
4. Apply safety/ethics policy.
5. Execute approved tools.
6. Show before/after state and trace.

## Main Differentiators

- Roman Urdu supplier signal support.
- Real database state changes.
- Policy guardrail for crises.
- Human approval only for risky actions.
- Clear trace terminal for judge visibility.

## Final Demo Message

MenuMind is not a chatbot. It is a signal-to-action agent that changes the operating state of a cafe and explains every decision.
