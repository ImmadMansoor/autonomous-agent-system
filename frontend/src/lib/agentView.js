export const DEFAULT_SIGNALS = [
  {
    id: 'marathon',
    name: 'Marathon + heat',
    raw_text: 'WhatsApp alert: Islamabad Marathon passing G13 tomorrow with 42C heat and health-focused runners near cafe.',
  },
  {
    id: 'supply',
    name: 'Chicken supplier failed',
    raw_text: 'Assalam-o-Alaikum mian saab, gari ka axle toot gaya hai mandi k paas. Aaj chicken delivery nahi hosakti.',
  },
  {
    id: 'crisis',
    name: 'Strike guardrail',
    raw_text: 'Faizabad blocked due to strike, deliveries frozen across sectors. Customers may face delays.',
  },
  {
    id: 'competitor',
    name: 'Competitor price move',
    raw_text: 'Cafe across the street dropped premium burgers to 350 PKR for lunch.',
  },
];

export function parsePlan(runDetails) {
  if (!runDetails?.final_decision) return null;
  try {
    return JSON.parse(runDetails.final_decision);
  } catch {
    return null;
  }
}

export function getPlannerLabel(trace) {
  const messages = trace.map((entry) => entry.message).join(' ');
  if (messages.includes('Gemini')) return 'Gemini live';
  if (messages.includes('safety fallback') || messages.includes('deterministic')) return 'Safety fallback';
  return 'Not run';
}

export function plannerClass(label) {
  if (label === 'Gemini live') return 'ok';
  if (label === 'Safety fallback') return 'warn';
  return 'idle';
}

export function formatAction(action) {
  if (!action) return 'No tool action selected';
  const item = action.args?.item_id || action.args?.action_type || 'operation';
  return `${action.tool.replace(/_/g, ' ')} -> ${String(item).replace(/_/g, ' ')}`;
}

export function formatValue(value) {
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  return String(value);
}

function inferSignalTheme(plan, signal) {
  const text = `${signal || ''} ${plan?.signal_summary || ''} ${plan?.insight || ''}`.toLowerCase();
  if (text.includes('crisis') || text.includes('strike') || text.includes('flood') || text.includes('blocked')) return 'crisis';
  if (text.includes('supplier') || text.includes('stock') || text.includes('delivery')) return 'supply';
  if (text.includes('competitor') || text.includes('price')) return 'competition';
  if (text.includes('marathon') || text.includes('event') || text.includes('crowd') || text.includes('heat')) return 'demand';
  return 'operations';
}

function addOpsTask(tasks, task) {
  if (!task.title) return;
  const id = `${task.owner}-${task.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (tasks.some((item) => item.id === id)) return;
  tasks.push({ id, priority: 'medium', status: 'queued', ...task });
}

export function buildOpsPlan(plan, approvals, notifications, changes, signal) {
  if (!plan) return [];

  const theme = inferSignalTheme(plan, signal);
  const tasks = [];
  const hasPendingApproval = approvals?.some((item) => item.status === 'pending');

  addOpsTask(tasks, {
    title: 'Review agent recommendation',
    detail: plan.insight || plan.reason || 'Review the agent reasoning before execution.',
    owner: 'Manager',
    due: 'Now',
    priority: hasPendingApproval ? 'high' : 'medium',
    status: hasPendingApproval ? 'blocked' : 'queued',
  });

  if (plan.primary_action) {
    addOpsTask(tasks, {
      title: formatAction(plan.primary_action),
      detail: plan.primary_action.args?.reason || 'Execute the primary operational change.',
      owner: plan.primary_action.tool === 'send_staff_alert' ? 'Shift Lead' : 'Manager',
      due: theme === 'demand' ? 'Before rush' : 'Next 15 min',
      priority: theme === 'crisis' ? 'high' : 'medium',
    });
  }

  (plan.recommended_actions || []).slice(0, 4).forEach((item, index) => {
    addOpsTask(tasks, {
      title: item,
      detail: 'Recommended by MenuMind from the live signal analysis.',
      owner: index === 0 ? 'Manager' : index === 1 ? 'Kitchen' : 'Counter',
      due: index === 0 ? 'Now' : 'Today',
      priority: index === 0 ? 'high' : 'medium',
    });
  });

  (notifications || []).forEach((notification) => {
    addOpsTask(tasks, {
      title: `Send ${notification.channel.replace(/_/g, ' ')} update`,
      detail: notification.message,
      owner: notification.channel.includes('staff') || notification.channel.includes('slack') ? 'Shift Lead' : 'Marketing',
      due: 'Now',
      priority: 'high',
    });
  });

  (changes || []).slice(0, 3).forEach((change) => {
    addOpsTask(tasks, {
      title: `Verify ${change.item_id.replace(/_/g, ' ')}`,
      detail: `${change.field}: ${formatValue(change.before)} to ${formatValue(change.after)}`,
      owner: 'Counter',
      due: 'After update',
      priority: 'low',
    });
  });

  if (theme === 'demand') {
    addOpsTask(tasks, {
      title: 'Prepare event rush station',
      detail: 'Stage fast-moving drinks, cups, ice, and a simple offer before foot traffic peaks.',
      owner: 'Kitchen',
      due: 'Before event peak',
      priority: 'high',
    });
    addOpsTask(tasks, {
      title: 'Draft quick campaign',
      detail: 'Use the agent insight to create a short hydration or event offer for nearby customers.',
      owner: 'Marketing',
      due: 'Today',
      priority: 'medium',
    });
  }

  if (theme === 'supply') {
    addOpsTask(tasks, {
      title: 'Confirm supplier recovery time',
      detail: 'Call supplier, verify ETA, and update menu expectations before the next rush.',
      owner: 'Manager',
      due: 'Next 30 min',
      priority: 'high',
    });
  }

  if (theme === 'crisis') {
    addOpsTask(tasks, {
      title: 'Hold risky customer-facing changes',
      detail: 'Keep surge pricing blocked until a human manager approves the crisis response.',
      owner: 'Manager',
      due: 'Now',
      priority: 'high',
      status: 'blocked',
    });
  }

  return tasks.slice(0, 8);
}
