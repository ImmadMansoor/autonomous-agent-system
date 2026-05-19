# MenuMind AI Agents — Package Reference (Quick Install)

Copy-paste reference for [ai-agents-plan.md](./ai-agents-plan.md).

## MVP stack (Phase 0–1)

```bash
# backend/
npm install ai @ai-sdk/google zod p-queue node-cron
npm install -D @types/node-cron
```

| Package | Role |
|---------|------|
| `ai` | Vercel AI SDK — `generateObject`, tools, streaming |
| `@ai-sdk/google` | Google Gemini API (using gemini-2.5-flash) |
| `zod` | Structured agent outputs (already installed) |
| `p-queue` | In-memory Job queue: ingest → reason → execute |
| `node-cron` | Scheduled connector polls |

## Orchestration upgrade (Phase 4+)

```bash
npm install @langchain/langgraph @langchain/core
```

Use when workflows need branches, human-in-the-loop interrupts, or retries.

## Realtime (Phase 4)

```bash
# backend
npm install socket.io
# frontend
npm install socket.io-client
```

## Notifications (Phase 5)

```bash
npm install resend twilio
```

## Infrastructure

```yaml
# docker-compose.yml (add service)
# Postgres only (Redis skipped for local MVP)
```

## Environment template

See `ai-agents-plan.md` §7 for full list. Minimum:

```
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
AGENT_DRY_RUN=true
AGENT_AUTO_APPROVE_DEFAULT=95
```
