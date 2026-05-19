# MenuMind Technical Data Flow

This is the current architecture. Older zero-code diagrams have been removed.

## Runtime Flow

```text
React/PWA signal input
  -> FastAPI /signals
  -> FastAPI /agent/run/{signal_id}
  -> agent.py pipeline
  -> llm_adapter.py Gemini or safety fallback
  -> policy guard
  -> tools.py execution
  -> SQLite state and trace tables
  -> React live menu, diff, approvals, notifications
```

## Core Backend Files

- `backend/main.py`: API routes, scenarios, reset endpoint.
- `backend/agent.py`: observe/reason/policy/execute pipeline.
- `backend/llm_adapter.py`: Gemini planner and safety fallback.
- `backend/tools.py`: allowed tool registry.
- `backend/models.py`: SQLAlchemy tables.
- `backend/schemas.py`: Pydantic response shapes.
- `backend/database.py`: database connection.

## Data Tables

- `menu_items`
- `signal_events`
- `agent_runs`
- `agent_trace`
- `approvals`
- `notifications`

## Safety Model

- Routine operational changes can execute automatically.
- Crisis/high-risk decisions require approval.
- Price increases above allowed bounds must be blocked or routed to approval.
- Fallback planner keeps the demo working when Gemini is slow or unavailable.
