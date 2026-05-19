# MenuMind Dashboard

This is the mobile-first React frontend for the MenuMind autonomous agent. It is designed as a cafe operations console, allowing a human manager to observe the agent's autonomous workflow, review state diffs, and approve critical actions.

## Features
- **Live Menu State:** Displays real-time database mutations (Stock, Price, Availability, Promoted Status).
- **Raw Signal Ingestion:** Allows the user to paste unstructured supplier alerts, weather advisories, or competitor emails to trigger the agent.
- **Agent Trace Terminal:** A real-time log showing the agent's reasoning, plan formulation, and tool execution.
- **Approvals Gate:** Intercepts high-risk actions (crisis responses) and requires human sign-off before executing.

## Setup
1. Ensure the Python backend (`http://localhost:8000`) is running.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Access the dashboard at `http://localhost:5173`.
