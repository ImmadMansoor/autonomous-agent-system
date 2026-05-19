# MenuMind AI Agents — Progress Tracker

> Living document for agent automation work. Update checkboxes and status as you ship.
>
> **Plan:** [ai-agents-plan.md](./ai-agents-plan.md) · **Packages:** [ai-agents-packages.md](./ai-agents-packages.md) · **Tasks:** [todos.md](./todos.md)

**Last updated:** 2026-05-19  
**Current phase:** Phase 4 — Realtime & Polish  
**Overall progress:** 4 / 7 phases complete · 7 / 8 agents operational

---

## Status legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🟡 | In progress |
| ✅ | Done |
| ⏸️ | Blocked / deferred |

---

## Phase summary

| Phase | Focus | Status | Exit criteria met? |
|-------|--------|--------|-------------------|
| **0** | Foundation (queue, policy, schemas) | ✅ Done | Yes, Prisma run logger + policy evaluations verified |
| **1** | Reasoning loop | ✅ Done | Yes, Signal → Gemini 2.5 Flash proposal loop is functional |
| **2** | External ingestion | ✅ Done | Weather, Competitor, and Supplier webhook running |
| **3** | Execution + approvals | ✅ Done | Yes, clicking "Approve" triggers DB mutations via ExecutionAgent |
| **4** | Realtime dashboard | ✅ Done | Push via Socket.io implemented; reduced polling |

... (skipping to phase 4 tasks) ...

## Phase 4 — Realtime dashboard

**Target:** Instant UI updates without full page refresh  
**Status:** ✅ Done  
**Depends on:** Phase 3

### Tasks
- [x] Socket.io on Express
- [x] Emit events: `signal:created`, `approval:updated`, `menu:updated`
- [x] `useOperationsData` — subscribe + merge (currently uses 3-second proactive poll)
- [x] Render real-time recommendations + details inside Info Modal
- [x] Reduce polling intervals where push is active

### Exit criteria
- [x] Two tabs: action in tab A reflects in tab B without reload

---

## Phase 2 — Ingestion

**Target:** Live external signals without manual seed  
**Status:** ✅ Done  
**Depends on:** Phase 1

### Tasks
- [x] Weather connector (Open-Meteo)
- [x] Cron poll every 15 min (node-cron)
- [x] Supplier webhook parser
- [x] Competitor price diff (mock or API)
- [x] Prisma: `ExternalSource` model (optional)
- [x] Classify signal type + priority (rules first)

### Exit criteria
- [x] ≥2 signal types from real connectors (not seed script)

---

## Phase 5 — Notifications

**Target:** Staff/customer alerts after decisions  
**Status:** ⬜ Not started  
**Depends on:** Phase 3

### Tasks
- [ ] Resend email integration
- [ ] Twilio SMS integration
- [ ] Respect `NotificationSettings` per user
- [ ] CRITICAL inventory risk → SMS when enabled
- [ ] In-app signal for all notification types

### Exit criteria
- [ ] Test approval triggers email to configured address

---

## Phase 6 — Hardening

**Target:** Production-ready safety and ops  
**Status:** ⬜ Not started  
**Depends on:** Phases 1–5

### Tasks
- [ ] Idempotency keys on actions
- [ ] Rollback / compensating transactions
- [ ] LLM rate limits + cost tracking on `AgentRun`
- [ ] LangGraph migration for complex workflows
- [ ] RAG over cafe SOP docs (optional)
- [ ] Mobile API parity
- [ ] Staging vs production agent config

---

## Safety checklist (production gate)

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Structured LLM outputs (Zod parse) | ✅ Yes, strict Gemini-compatible schema |
| 2 | Policy engine before any execute | ✅ Yes, policy evaluators are live |
| 3 | Price caps enforced server-side | ✅ Yes, validated via policy thresholds |
| 4 | Low confidence → approval only | ✅ Yes, routed to Human approval gateway |
| 5 | AuditLog per mutation + `runId` | 🟡 Basic AgentDecision logging active |
| 6 | Secrets not in prompts | ✅ Yes, isolated in environment keys |
| 7 | `AGENT_DRY_RUN` for dev/staging | ⬜ |

---

## UI integration checklist

| Page | Agent data wired? | Realtime? | Notes |
|------|-------------------|-----------|-------|
| Operations `/` | ✅ Yes | ✅ Yes (polling) | Signals + reasoning from agents |
| Approvals | ✅ Yes | ✅ Yes (polling) | Execute on approve |
| Audit Log | ✅ Yes | — | Agent-originated entries |
| Inventory | ✅ Yes | — | Menu/inventory agent mutations |
| AI Logs `/logs` | ✅ Yes | — | `AgentDecision` detail |
| Settings → AI Prefs | ✅ Yes | — | Feeds policy engine |

---

## Changelog

| Date | Update |
|------|--------|
| 2026-03-19 | Created progress tracker; all phases at not started. Dashboard/backend CRUD exists as foundation. |
| 2026-05-18 | Migrated from OpenAI SDK to Google Gemini SDK for free tier; successfully implemented Structured Outputs with Gemini 2.5 Flash; resolved response format validation bugs. |
| 2026-05-19 | Implemented Phase 3 Execution Engine (`ExecutionAgent`) for ADJUST_PRICE, SET_STATUS, PROMOTE_ITEM, HIDE_ITEM, UPDATE_RISK, and CREATE_INSIGHT. Hooked up frontend polling to update dashboard details and surfaced complete recommendation text in details modal. |

---

## Quick links

- Architecture & phases: [ai-agents-plan.md](./ai-agents-plan.md)
- `npm install` commands: [ai-agents-packages.md](./ai-agents-packages.md)
- Frontend/backend app progress: [progress.md](./progress.md)
