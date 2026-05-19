export interface Todo {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

export const todos: Todo[] = [
  {
    id: '1',
    content: 'Create todos file in context folder',
    status: 'completed',
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    content: 'Make data throughput calculate from real-time data in operations',
    status: 'pending',
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    content: 'Make AI command input functional in operations',
    status: 'pending',
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    content: 'Make AI suggestion functional in operations',
    status: 'pending',
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];


// approvals
// audit log
add the missing data in modal.
// intelligence

---

## AI Agents (see ai-agents-plan.md · track in ai-agents-progress.md)

### Phase 0 — Foundation
- [ ] p-queue setup + docker-compose (postgres only)
- [ ] decision.schema.ts (Zod) + policy.engine.ts
- [ ] AgentRun Prisma model + /api/agents routes stub

### Phase 1 — Reasoning
- [ ] Reasoning Agent (Vercel AI SDK + structured output)
- [ ] Signal → ReasoningItem + Approval pipeline
- [ ] Wire Operations AI command to agent queue

### Phase 2 — Ingestion
- [ ] Weather connector (Open-Meteo)
- [ ] Supplier webhook + cron pollers

### Phase 3 — Execution
- [ ] Menu & Pricing Agent executors
- [ ] Approval approve → execute → AuditLog

### Phase 4 — Realtime
- [ ] Socket.io push to dashboard hooks

**Packages:** ai-agents-packages.md
