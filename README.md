# MenuMind: Autonomous Cafe Operations Agent

## Google Antigravity Hackathon

MenuMind is a fully autonomous operational agent designed to act as a "Store Manager" for a local cafe. Unlike basic chatbots, MenuMind ingests unstructured operational signals (supply chain alerts, weather data, competitor pricing, local events), reasons over the current menu state with Gemini, produces a structured workplan, and executes safe actions directly on the live menu.

### Challenge Alignment
This project directly targets **Challenge 1: Agentic App Workflow Development**.
It implements an end-to-end "observe -> reason -> act -> simulate" loop without a human-in-the-loop, except when critical ethical guardrails or heavy mutations (like price hikes >15%) require human approval.

### Using Google Antigravity
We used the **Google Antigravity system** strictly as our powerful AI development platform/IDE, adhering to the hackathon's clarification that the final product must run its own agent. Antigravity acts as our lead engineer, conducting architecture reviews, auditing Python tests, verifying SQLite mutations, and writing the React frontend. Our runtime agent operates fully independently in `backend/agent.py`.

### Architecture
*   **Backend:** Python, FastAPI, SQLite, Pydantic.
*   **Logic:** A robust hybrid planner. It uses Gemini 2.5 Flash for semantic reasoning, insight extraction, impact analysis, recommended actions, and simulated execution. A clearly labeled safety fallback protects the demo if the API/network stalls.
*   **Safety:** A strict `TOOL_REGISTRY` enforces allowed capabilities. An Approval Gate halts high-risk plans, requiring the manager to explicitly execute them.
*   **Cloud Proof:** Supabase + Make.com can run as a parallel cloud automation proof layer for menu state updates; the local app remains demo-stable even if the cloud workflow is paused.
*   **Frontend:** React (Vite) Mobile-First Dashboard.
*   **Mobile:** PWA is present; next production-style deliverable is a Capacitor Android APK.

### Setup Instructions

**Backend:**
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Mobile APK Path

Use Capacitor to wrap the existing React/Vite app. Android cannot use `localhost` to reach the laptop backend, so production APK builds must point to a public HTTPS backend such as Render.

**Recommended APK flow:**
1. Deploy `backend/` to Render using `render.yaml`.
2. Set Render environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-2.5-flash`
   - `GEMINI_TIMEOUT_SECONDS=35`
3. In GitHub repository variables, set `VITE_API_URL` to the Render backend URL.
4. Run the GitHub Actions workflow `Build Android APK`.
5. Download the `MenuMind-debug-apk` artifact and install `app-debug.apk` on an Android phone.

Local development URLs:
- Browser on laptop: `VITE_API_URL=http://localhost:8000`
- Android emulator: `VITE_API_URL=http://10.0.2.2:8000`
- Real phone without Render: use an HTTPS tunnel or laptop LAN IP.

The APK is a real Android app shell around the MenuMind frontend. The Gemini key and agent brain stay server-side in FastAPI; do not put Gemini keys in the frontend or APK.

### Make.com Integration

There is no native Make.com plugin here. Connect Make through HTTP:
1. Make webhook receives the external signal.
2. Make calls `POST /signals` with `source_type` and `raw_text`.
3. Make calls `POST /agent/run/{signal_id}`.
4. Make reads `/trace`, `/menu/before-after/{run_id}`, `/notifications`, and `/approvals`.

### Demo Flow
1. Open the UI. Notice the **Live Menu State** tracking current items and margins.
2. Type a custom event signal such as: "Islamabad Marathon passing G13 tomorrow, 42C heat, runners and families expected near the cafe." Watch the agent promote healthy hydration, update menu state, and alert staff.
3. Click **Supply Shock**. Watch the agent disable the "Chicken Wrap" and promote the "Beef Wrap" when stock is unsafe.
4. Type a crisis signal such as "Faizabad is blocked, no delivery possible today" to see the ethical guardrail block risky customer-facing changes and request approval.

*Built for the Google Antigravity Hackathon.*
