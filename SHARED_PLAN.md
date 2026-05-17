# MenuMind: Shared Build Plan and AI Collaboration Board

Last reviewed by: Carl
Challenge selected: Challenge 1, Autonomous Content-to-Action Agent
Current strategy: Build a real autonomous agent product. Antigravity is the development IDE, not the runtime agent.

## Read This First

All models working in this repo should use this file as the shared coordination layer.

Rules for collaboration:

1. Read this file before changing code or architecture.
2. Keep updates concise and factual. Do not paste long reasoning transcripts.
3. Add decisions to the Decision Log with your model name, date/time, and reason.
4. Add tasks to the Task Board only when they are actionable.
5. Do not create competing plans in separate files unless linked from here.
6. Preserve the chosen architecture unless a blocker is proven.
7. If you disagree with a direction, write the risk and the proposed correction before changing implementation.
8. Use the name "Carl" for this agent in shared notes.

## Source Context

Files reviewed:

- `Google Antigravity Hackathon - Challenges.pdf/.md`
- `MenuMind_Project_Proposal_Final.pdf/.md`
- `MenuMind_Technical_DataFlow_Architecture.pdf/.md`
- `MenuMind_Simulation_Ledger.pdf/.md`
- `Screenshot 2026-05-14 224012.png`

Important clarification from the hackathon team:

> Antigravity is mandated as the IDE/development environment, not as an agent inside the final solution. The submitted product must have its own coded agent(s), connected to any LLM endpoint of our choice. The final solution must not depend on Antigravity to run.

This overrides the older proposal language that described Antigravity as the runtime brain.

## Winning Thesis

MenuMind should be positioned as an autonomous cafe operations agent for small food businesses. It converts messy operational signals into real system changes:

Input -> Insight -> Impact -> Autonomous Decision -> Tool Execution -> Before/After Outcome

The demo should show the agent acting on its own, not asking the user for every step. Human approval appears only for risky or ethical cases.

Why this can win:

- It maps cleanly to Challenge 1.
- It has relatable Pakistani/local business context.
- It demonstrates autonomy through visible tool execution.
- It has strong UX potential with before/after menu state, trace logs, and ROI.
- It includes responsible AI via guardrails against crisis price-gouging.

## Recommended Architecture

### Final Direction for All Models

Do not switch domains to a generic supply-chain app. Another brainstorming note proposed "Apex Agent"; that idea has useful architecture points, but the project should remain **MenuMind** because the uploaded PDFs, scenario ledger, and proposal already support it. We can borrow the real-time dashboard idea without changing the product.

Build order:

1. Backend and agent logic first.
2. Mobile UI second.
3. Cloud integrations last, only if the local product already works.

Reason: The judges will reward working autonomous logic more than a beautiful UI with shallow behavior.

### Backend

Use FastAPI + SQLite for the hackathon build.

Reason:

- Fast to implement.
- Works locally with no cloud setup risk.
- Demonstrates a real backend and database.
- Easy to migrate to Supabase/Firebase later if credentials/time are available.
- Keeps the demo reliable if internet/cloud services fail.

Optional adapter:

- Add Supabase or Firebase only after the local backend works end-to-end.
- Do not block the core prototype on cloud provisioning.

### LLM

Primary:

- Gemini API with function/tool calling, if API access is available.

Fallback:

- A local deterministic planner used only for demo resilience when API keys/network fail.
- The fallback must still run through the same agent pipeline and tools, so the product remains a real backend system.

Important:

- Do not rely on Antigravity as the final agent.
- Do not claim a model name unless verified in the actual API/config.

### Mobile App

Use Expo React Native if time allows. Flutter is not recommended right now because it is not installed in the current workspace, while Node is available.

Minimum acceptable build:

- A mobile-first React web dashboard that can be recorded in a phone-shaped viewport.

Best path:

- Backend: FastAPI
- App: Vite/React mobile-first UI first; Expo React Native only if time remains
- API: REST endpoints plus Server-Sent Events or polling for trace updates

Why this still satisfies the mobile requirement:

- The challenge asks for a working prototype with mobile app. A mobile-first web/PWA prototype is the fastest reliable version for demo recording.
- If time allows, wrap the same UI in Expo or Capacitor later.
- Do not start with Flutter unless someone installs Flutter and owns that path end-to-end.

### Agent Design

Build a small multi-agent pipeline inside our backend:

1. Signal Interpreter
   - Reads unstructured supplier/weather/competitor/crisis text.
   - Extracts entities, time, issue, severity, and confidence.

2. Impact Analyst
   - Scores business impact using inventory, margin, category, demand, and customer risk.

3. Policy Guard
   - Blocks crisis exploitation.
   - Requires approval for low confidence, high price change, safety issues, or customer-impacting delays.

4. Action Planner
   - Chooses one primary action and up to three supporting actions.
   - Selects tools without asking the user unless approval is required.

5. Tool Executor
   - Applies database mutations.
   - Creates staff/customer notifications.
   - Writes trace logs and before/after state.

This demonstrates either "multiple agents" or a structured reasoning pipeline, satisfying the challenge requirement.

## Core Product Features

Must-have for submission:

- Raw signal input screen.
- Live menu database with before/after state.
- Autonomous agent trace.
- At least one real simulated action executed by backend tools.
- Approval queue for ethical/risky cases.
- Demo scenarios preloaded.
- README explaining architecture, Antigravity usage, APIs/tools, assumptions, and limitations.

Strong differentiators:

- ROI badge: revenue protected, refunds avoided, prep time saved.
- Crisis ethics demo: agent refuses surge pricing during strike/flood and requests approval instead.
- Contradiction handling: supplier says no chicken, inventory shows limited stock; agent chooses limited availability or prep-time warning.
- Roman Urdu support in prompts/scenarios.
- Replayable demo mode so judges can trigger scenarios reliably.

## Data Model

Use these tables/entities first:

### menu_items

- `id`
- `name`
- `category`
- `base_price`
- `current_price`
- `is_available`
- `is_promoted`
- `stock_level`
- `margin_pct`
- `prep_time_min`
- `updated_at`

### signal_events

- `id`
- `created_at`
- `source_type`
- `raw_text`
- `status`
- `confidence`
- `impact_score`

### agent_runs

- `id`
- `signal_event_id`
- `started_at`
- `completed_at`
- `final_decision`
- `requires_approval`
- `revenue_impact_estimate`

### agent_trace

- `id`
- `agent_run_id`
- `step`
- `message`
- `tool_name`
- `tool_input_json`
- `tool_output_json`
- `created_at`

### approvals

- `id`
- `agent_run_id`
- `action_type`
- `payload_json`
- `reason`
- `status`
- `created_at`
- `resolved_at`

### notifications

- `id`
- `agent_run_id`
- `channel`
- `recipient`
- `message`
- `status`
- `created_at`

## Backend API Plan

Minimum endpoints:

- `GET /health`
- `GET /menu`
- `GET /menu/before-after/{run_id}`
- `GET /signals/scenarios`
- `POST /signals`
- `POST /agent/run/{signal_event_id}`
- `GET /agent/runs/{run_id}`
- `GET /agent/runs/{run_id}/trace`
- `GET /approvals`
- `POST /approvals/{approval_id}/approve`
- `POST /approvals/{approval_id}/reject`
- `GET /notifications`

Useful demo endpoint:

- `POST /demo/reset`
  - Resets seed data so the demo can be replayed cleanly.

## Agent Toolset

Tools the agent may call:

- `get_menu_state()`
- `get_item(item_id)`
- `update_menu_availability(item_id, available, reason)`
- `adjust_item_price(item_id, new_price, reason)`
- `set_item_promotion(item_id, promoted, reason)`
- `extend_prep_time(item_id, minutes, reason)`
- `create_approval(action_type, payload, reason)`
- `send_staff_alert(message, severity)`
- `create_customer_notice(message, affected_items)`
- `estimate_revenue_impact(action_plan)`

Tool safety:

- Tools validate item IDs and numeric ranges.
- Price increase above 15 percent requires approval.
- Any crisis keyword such as flood, disaster, strike, riot, blocked roads, emergency, or shortage exploitation triggers policy review.
- Low confidence below 0.70 requires approval.

## Demo Scenarios

Build these as one-click demo cards:

1. Supply shock
   - Raw input: "Assalam-o-Alaikum mian saab, gari ka axle toot gaya hai mandi k paas. Aaj chicken delivery nahi hosakti."
   - Expected autonomous action: hide Chicken Wrap, promote Beef Wrap or Veg Wrap, alert kitchen.

2. Heatwave demand shift
   - Raw input: "OpenWeather: Islamabad 44C, extreme heat advisory."
   - Expected autonomous action: promote iced drinks, reduce hot beverage emphasis, alert staff to prep ice.

3. Competitor price attack
   - Raw input: "Cafe across the street dropped premium burgers to 350 PKR for lunch."
   - Expected autonomous action: avoid margin-destroying match, promote high-margin combo.

4. Crisis guardrail
   - Raw input: "Faizabad blocked due to strike, deliveries frozen across sectors."
   - Expected action: no surge pricing; create approval for delivery delay warning and route/staff notice.

5. Contradiction test
   - Raw input: "Supplier says chicken is unavailable, but inventory buffer shows 8 portions remaining."
   - Expected action: limited availability or prep warning, not full shutdown.

## Implementation Phases

### Phase 0: Repo Hygiene

- [ ] Add a proper README.
- [ ] Keep extracted PDF Markdown files as context, but do not build runtime logic around them.
- [ ] Add `.env.example`.
- [ ] Decide frontend path: Expo React Native or mobile-first React web.

### Phase 1: Backend Foundation

- [ ] Create FastAPI app structure.
- [ ] Add SQLite database setup and seed data.
- [ ] Implement Pydantic schemas.
- [ ] Implement menu, signal, trace, approval, and notification tables.
- [ ] Add `/demo/reset`.

### Phase 2: Agent Core

- [ ] Implement agent pipeline modules.
- [ ] Implement tool registry.
- [ ] Add Gemini adapter behind an interface.
- [ ] Add deterministic fallback planner for demo resilience.
- [ ] Persist every decision and tool call to `agent_trace`.

### Phase 3: UI

- [ ] Build mobile-first dashboard.
- [ ] Show scenario cards.
- [ ] Show raw input panel.
- [ ] Show live menu state.
- [ ] Show before/after diff for the latest run.
- [ ] Show trace terminal.
- [ ] Show approval queue.
- [ ] Show notifications and ROI badge.

### Phase 4: Demo and Submission

- [ ] Create 3-5 minute demo script.
- [ ] Record a clean end-to-end run.
- [ ] Show Antigravity as the development environment.
- [ ] Show the final product running independently.
- [ ] Update README with architecture, setup, assumptions, and limitations.

## Token and Time Saving Protocol

For all models:

- Start by reading this file, README, and current code structure only.
- Do not re-read all PDFs unless changing product strategy.
- Use the Markdown PDF extracts instead of raw PDF parsing.
- Summarize findings in this file; do not paste full source text.
- Make small, testable changes.
- Prefer one backend path and one UI path.
- Avoid adding large frameworks unless they directly help the demo.

## Known Limitations

- Carl can create the backend and local database in this workspace.
- Carl cannot provision Firebase/Supabase projects without credentials and external account access.
- If cloud backend is required, another model/user with account access should create credentials and place them in `.env`.
- The final solution should be runnable without Antigravity.
- Internet/API availability may fail during demo, so a deterministic fallback path is required.
- Firebase/Supabase/Jules are not required for the first working prototype.

## What We Need From the User

Bring these only if available. They should not block initial development.

- Gemini API key: useful for real LLM reasoning. Put it in `.env` as `GEMINI_API_KEY`.
- Google Cloud / hackathon credits: useful for Gemini and optional hosting.
- Firebase project: optional. Only needed if we decide to add cloud realtime sync after local backend works.
- Supabase project: optional alternative to Firebase. Do not use both.
- Expo Go on phone: optional, only if we convert the UI to Expo React Native.
- Android Studio/emulator: optional. Not needed for demo if we use mobile browser recording.
- Jules: not required. Use only if the team specifically wants asynchronous coding assistance; it is not part of the product architecture.
- GitHub repo access: useful for final submission and collaboration.

Minimum to start now:

- No extra services are required.
- We can build FastAPI + SQLite + mobile-first React locally.
- We can run deterministic agent logic first, then plug Gemini in when the key is ready.

## Message to Other AI Models

Team: Please follow this implementation path unless the user explicitly changes it.

1. Keep the product as MenuMind for Challenge 1.
2. Do not create a second product/domain.
3. Start with a local working backend, not Firebase/Flutter setup.
4. Implement real agent tools and database mutations before polishing UI.
5. Use mobile-first React for the first UI because this workspace has Node but not Flutter.
6. Keep the deterministic fallback path so the demo works without network/API failure.
7. If you add Gemini, hide it behind an adapter and preserve the same tool interface.
8. Update this file after meaningful decisions or completed work.

Suggested work ownership:

- Backend model: FastAPI app, SQLite schema, seed data, API endpoints.
- Agent model: signal interpreter, impact scorer, policy guard, tool executor, trace logs.
- UI model: mobile dashboard, scenario buttons, before/after menu, trace terminal, approval panel.
- Documentation model: README, demo script, architecture diagram, setup instructions.

First milestone:

- User clicks a scenario.
- Backend creates a signal event.
- Agent chooses actions autonomously.
- Tools mutate the database.
- UI shows before/after state and trace logs.
- Crisis scenario creates approval instead of executing risky pricing.

## Status Update — Json, 2026-05-17

**Brain fixed.** Gemini 2.5 Flash is now working as the real LLM planner.

Root cause was: `llm_adapter.py` used `gemini-1.5-flash-latest` (unsupported model name). Every run silently fell back to keyword matching. Fixed to `gemini-2.5-flash`.

Verified: Marathon scenario (novel, not in any preset) produces genuine reasoning — analyzes event type, weather, competition, customer demographics, and recommends specific strategic actions with explanations.

All 5 smoke test scenarios pass with real Gemini reasoning (7 reasoning steps each). Flexible assertions replaced the old hardcoded checks.

Smarter `DeterministicPlanner` fallback also built — extracts structured signal types (supply, crisis, weather, competitor, event_demand) from arbitrary text using weighted pattern matching. Not true reasoning, but handles edge cases when Gemini is unavailable.

**Next: UI needs updating to show the reasoning chain. The backend is alive; the frontend needs to prove it.**

## Audit History (Condensed)

8 rounds of review by Carl across backend and frontend. All issues resolved.

### Backend Evolution (6 rounds)

1. **Initial audit**: Backend was a skeleton. Missing endpoints, no tool registry, no before/after state, no structured traces.
2. **Second pass**: Added tool registry, approval gating, Gemini fallback, `.gitignore`. Score: 7.5/10.
3. **Third pass**: Fixed crisis approval execution, before/after diff endpoint, scenario stock overrides. Score: 8.3/10.
4. **Fourth pass**: Per-scenario reset states, bounded schemas, README docs. Score: 8.6/10.
5. **Fifth pass**: Strict smoke assertions, response schemas, double-approval protection. Score: 8.8/10.
6. **Sixth pass**: Full smoke test passed with persisted DB proof. All 5 scenarios verified. Score: 9/10. **Backend frozen.**

### Frontend Evolution (2 rounds)

1. **UI audit**: React/Vite dashboard functional. Key issue: Gemini model failure exposed in traces. UI needed live menu panel, custom signal input, and better mobile framing.
2. **UX correction**: Added custom signal textarea, renamed refresh button, cleaned trace language. UI still needs Gemini model fix or clean fallback messaging.

### Final Backend Status

- All 5 demo scenarios pass strict smoke tests
- Tool registry with 9 tools, approval gating, crisis ethics guardrail
- Before/after state diffs, trace terminal, notifications
- SQLite local DB with persisted proof
- Remaining: provision Supabase, fix Gemini model name, record demo video

## Judging Alignment

Evaluation mapping:

- Antigravity use, 25 percent: show development in Antigravity, tasks/workplan/logs, and explain final runtime independence after clarification.
- Agentic workflow, 20 percent: show multi-step pipeline and trace logs.
- Insight and decision quality, 20 percent: use non-trivial scenarios, impact scores, contradictions, margins, ethics.
- Action simulation, 15 percent: mutate real database state and show before/after.
- Technical implementation, 10 percent: clean FastAPI backend, schemas, tool registry, robust guardrails.
- Innovation and UX, 10 percent: mobile-first dashboard, trace terminal, ROI badge, approval gate.

## Decision Log

- [2026-05-16, Carl] Keep MenuMind and Challenge 1. It strongly matches the required input -> insight -> action -> simulated outcome workflow.
- [2026-05-16, Carl] Replace zero-code runtime plan with coded autonomous backend because hackathon clarification says Antigravity is the IDE, not the final agent.
- [2026-05-16, Carl] Recommend FastAPI + SQLite first for reliability and speed. Firebase/Supabase can be added later as adapters, but should not block the working prototype.
- [2026-05-16, Carl] Recommend Gemini tool-calling behind an adapter, plus deterministic fallback for demo resilience.
- [2026-05-16, Carl] Keep MenuMind instead of switching to the proposed Apex Agent domain. Borrow realtime UX ideas, but avoid product drift.
- [2026-05-16, Carl] Prefer mobile-first React first because Python, Node, and npm are available; Flutter is not installed in this workspace.

## Open Questions

- Do we have a Gemini API key available for runtime testing?
- Does the team want local-only demo reliability, cloud sync, or both?
- What is the final submission deadline after challenge selection?

## Task Board

### Ready

- [x] Build FastAPI project structure.
- [x] Create SQLite schema and seed data.
- [x] Implement agent tools and trace logging.
- [x] Implement scenario ingestion endpoint.
- [ ] Build mobile-first React dashboard.
- [ ] Write README and demo script.

### In Progress

- [ ] None.

### Done

- [x] Read hackathon challenge context.
- [x] Read MenuMind proposal, architecture, and scenario ledger.
- [x] Account for hackathon clarification that Antigravity is not the final runtime agent.
- [x] Shared plan alignment.
