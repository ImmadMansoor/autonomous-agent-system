const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== 'tauri.localhost') {
      return 'https://menumind-backend.onrender.com';
    }
  }
  return 'http://127.0.0.1:8000';
};

const API_BASE = getApiBase().replace(/\/$/, '');

type AnyRecord = Record<string, any>;
type NotificationSettings = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsAlerts: boolean;
  approvalAlerts: boolean;
  inventoryAlerts: boolean;
  weeklyDigest: boolean;
};
type AiPreferences = {
  autoApproveThreshold: number;
  riskTolerance: string;
  decisionSpeed: string;
  humanOverride: boolean;
  explainDecisions: boolean;
  learnFromFeedback: boolean;
};
type SecuritySettings = {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
};

const MENU_IMAGES: Record<string, string> = {
  chicken_wrap: '/chicken_wrap.png',
  beef_wrap: '/beef_wrap.png',
  club_sandwich: '/club_sandwich.png',
  iced_lemonade: '/iced_lemonade.png',
  hot_coffee: '/hot_coffee.png',
};

let lastRun: AnyRecord | null = null;

const offlineMenu: AnyRecord[] = [
  { id: 'chicken_wrap', name: 'Chicken Wrap', category: 'Food', base_price: 520, current_price: 520, stock_level: 18, prep_time_min: 8, is_available: true, is_promoted: false },
  { id: 'beef_wrap', name: 'Beef Wrap', category: 'Food', base_price: 640, current_price: 640, stock_level: 41, prep_time_min: 10, is_available: true, is_promoted: false },
  { id: 'club_sandwich', name: 'Club Sandwich', category: 'Food', base_price: 580, current_price: 580, stock_level: 35, prep_time_min: 9, is_available: true, is_promoted: false },
  { id: 'iced_lemonade', name: 'Iced Lemonade', category: 'Drink', base_price: 260, current_price: 240, stock_level: 76, prep_time_min: 3, is_available: true, is_promoted: true },
  { id: 'hot_coffee', name: 'Hot Coffee', category: 'Drink', base_price: 310, current_price: 310, stock_level: 64, prep_time_min: 4, is_available: true, is_promoted: false },
];

const offlineSignals: AnyRecord[] = [
  {
    id: 1,
    source_type: 'weather',
    raw_text: 'Islamabad Marathon passing G-13 tomorrow with 42C heat. Expect health-focused runners near cafe.',
    status: 'processed',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    source_type: 'inventory',
    raw_text: 'Chicken supplier delayed. Current stock requires review before dinner rush.',
    status: 'queued',
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
];

function buildOfflinePlan(message: string): AnyRecord {
  const lower = message.toLowerCase();
  const supply = lower.includes('supplier') || lower.includes('stock') || lower.includes('chicken') || lower.includes('delivery');
  const crisis = lower.includes('strike') || lower.includes('blocked') || lower.includes('crisis');
  const competition = lower.includes('competitor') || lower.includes('price');

  if (supply) {
    return {
      signal_summary: 'Supplier disruption detected',
      insight: 'Chicken stock is exposed before peak demand. Menu visibility and staff prep should shift to safer items.',
      confidence: 0.86,
      requires_approval: false,
      primary_action: { tool: 'send_staff_alert', args: { item_id: 'chicken_wrap', reason: 'Switch recommendations away from chicken items until supplier ETA is confirmed.' } },
      recommended_actions: [
        'Confirm supplier recovery time',
        'Promote beef wrap and club sandwich as substitutes',
        'Ask counter team to mention limited chicken stock',
      ],
    };
  }

  if (crisis) {
    return {
      signal_summary: 'Crisis guardrail activated',
      insight: 'Route disruption can raise demand volatility, but customer-facing surge actions should stay paused.',
      confidence: 0.82,
      requires_approval: true,
      primary_action: { tool: 'hold_price_changes', args: { item_id: 'operation', reason: 'Crisis situation requires human approval before price or availability changes.' } },
      recommended_actions: [
        'Hold risky customer-facing changes',
        'Notify staff about delivery uncertainty',
        'Prepare manager approval for any menu restriction',
      ],
    };
  }

  if (competition) {
    return {
      signal_summary: 'Competitor pricing move detected',
      insight: 'A nearby competitor discount may reduce lunch conversion. A bundle is safer than direct price cutting.',
      confidence: 0.79,
      requires_approval: false,
      primary_action: { tool: 'set_item_promotion', args: { item_id: 'iced_lemonade', reason: 'Bundle drink with wrap to defend average ticket.' } },
      recommended_actions: [
        'Create lunch bundle signage',
        'Track wrap conversion for the next two hours',
        'Avoid permanent price cuts until trend confirms',
      ],
    };
  }

  return {
    signal_summary: 'Heat and event demand spike detected',
    insight: 'Marathon foot traffic and heat should lift cold drink demand. Hydration products should be staged and promoted before the rush.',
    confidence: 0.9,
    requires_approval: false,
    primary_action: { tool: 'set_item_promotion', args: { item_id: 'iced_lemonade', reason: 'Promote cold drink demand during heat and event traffic.' } },
    recommended_actions: [
      'Prepare event rush station',
      'Draft quick hydration campaign',
      'Move iced lemonade to the top of the counter menu',
    ],
  };
}

function createOfflineRun(message = offlineSignals[0].raw_text): AnyRecord {
  const now = new Date();
  const id = Number(localStorageSafeGet('menumind_offline_run_id') || Date.now());
  const plan = buildOfflinePlan(message);
  const run = {
    id,
    status: 'completed',
    signal_event_id: id,
    final_decision: JSON.stringify(plan),
    created_at: now.toISOString(),
  };
  const signal = {
    id,
    source_type: sourceFromText(message),
    raw_text: message,
    status: 'processed',
    created_at: now.toISOString(),
  };
  const trace = [
    { id: `${id}-ingest`, step: 'ingest', message: 'Offline demo signal accepted by embedded desktop fallback.', created_at: now.toISOString() },
    { id: `${id}-reason`, step: 'reasoning', message: `Safety fallback generated plan with ${Math.round(plan.confidence * 100)}% confidence.`, created_at: now.toISOString() },
    { id: `${id}-plan`, step: 'plan', message: 'Formulated execution plan: local planner fallback ready.', created_at: now.toISOString() },
  ];
  const diff = {
    before: { menu: offlineMenu },
    after: { menu: offlineMenu.map((item) => item.id === 'iced_lemonade' ? { ...item, is_promoted: true, current_price: 240 } : item) },
    changes: [
      { item_id: 'iced_lemonade', field: 'is_promoted', before: false, after: true },
      { item_id: 'iced_lemonade', field: 'current_price', before: 260, after: 240 },
    ],
  };
  const approvals = plan.requires_approval ? [{
    id: `${id}-approval`,
    status: 'pending',
    action_type: plan.primary_action?.tool || 'review',
    reason: 'Offline guardrail requires manager approval for crisis-related actions.',
    payload_json: JSON.stringify(plan.primary_action?.args || {}),
    created_at: now.toISOString(),
  }] : [];
  const notifications = [{
    id: `${id}-staff`,
    channel: 'staff_alert',
    message: plan.recommended_actions?.[0] || 'Review operational plan.',
    created_at: now.toISOString(),
  }];

  lastRun = { run, trace, diff, approvals, notifications, menu: offlineMenu, signal, signalText: message, plan };
  return lastRun;
}

function localStorageSafeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || error.error || 'Request failed');
  }

  return response.json();
}

async function optionalRequest<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    return await request<T>(endpoint);
  } catch (error) {
    console.warn(`Optional API request failed: ${endpoint}`, error);
    return fallback;
  }
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseDecision(run: AnyRecord | null): AnyRecord {
  return parseJson(run?.final_decision, {});
}

function actionLabel(action: AnyRecord | null | undefined): string {
  if (!action) return 'No action selected';
  const tool = String(action.tool || 'action').replaceAll('_', ' ');
  const item = action.args?.item_id ? ` -> ${String(action.args.item_id).replaceAll('_', ' ')}` : '';
  return `${tool}${item}`;
}

function sourceFromText(text = ''): string {
  const lower = text.toLowerCase();
  if (lower.includes('weather') || lower.includes('heat') || lower.includes('rain')) return 'weather';
  if (lower.includes('supplier') || lower.includes('stock') || lower.includes('delivery')) return 'inventory';
  if (lower.includes('competitor') || lower.includes('price')) return 'web';
  return 'web';
}

function menuStatus(item: AnyRecord): string {
  if (!item.is_available) return 'WASTE_RISK';
  if (item.is_promoted) return 'DYNAMIC';
  return 'FIXED';
}

function categoryForTrace(step = ''): string {
  const value = step.toLowerCase();
  if (value.includes('price') || value.includes('policy') || value.includes('approval')) return 'Pricing Logic';
  if (value.includes('inventory') || value.includes('tool') || value.includes('menu')) return 'Inventory';
  if (value.includes('staff')) return 'Staffing';
  if (value.includes('campaign') || value.includes('recommendation') || value.includes('bundle')) return 'Upsell Engine';
  return 'Demand Forecast';
}

function titleForTrace(step = ''): string {
  return step.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || 'Agent Step';
}

function formatAction(action: AnyRecord | null | undefined): string {
  if (!action?.tool) return 'No direct tool action';
  const tool = String(action.tool).replaceAll('_', ' ');
  const item = action.args?.item_id ? ` for ${String(action.args.item_id).replaceAll('_', ' ')}` : '';
  return `${tool}${item}`;
}

function humanizeRecommendation(message = ''): string {
  const promotionMatch = message.match(/set_item_promotion\s+on\s+([\w-]+)/i);
  if (promotionMatch) {
    return `Promote ${promotionMatch[1].replaceAll('_', ' ')} across the menu.`;
  }
  return message.replaceAll('_', ' ');
}

function summarizeTraceMessage(trace: AnyRecord, plan: AnyRecord): string {
  const step = String(trace.step || '').toLowerCase();
  const message = String(trace.message || '');

  if (step === 'plan') {
    return [
      plan.signal_summary || plan.insight || 'Execution plan prepared.',
      `Primary action: ${formatAction(plan.primary_action)}.`,
      plan.requires_approval ? 'Human approval required.' : 'Safe to execute.',
    ].filter(Boolean).join(' ');
  }

  if (message.startsWith('Formulated execution plan:')) {
    return [
      plan.signal_summary || 'Execution plan prepared.',
      `Primary action: ${formatAction(plan.primary_action)}.`,
      `Recommendations: ${(plan.recommended_actions || []).length}.`,
    ].join(' ');
  }

  return message.replace(/^\[Action \d+\]\s*/, '').replace(/^\[Task \d+\]\s*/, '');
}

function runConfidence(plan: AnyRecord): number {
  const confidence = Number(plan?.confidence ?? 0.82);
  return Math.max(0, Math.min(100, Math.round(confidence * 100)));
}

async function getFullRun(runId: number): Promise<AnyRecord> {
  try {
    const run = await request<AnyRecord>(`/agent/runs/${runId}`);
    return hydrateRun(run);
  } catch {
    return createOfflineRun();
  }
}

async function hydrateRun(run: AnyRecord): Promise<AnyRecord> {
  const runId = run.id;
  const [trace, diff, approvals, notifications, menu, signals] = await Promise.all([
    optionalRequest<AnyRecord[]>(`/agent/runs/${runId}/trace`, []),
    optionalRequest<AnyRecord>(`/menu/before-after/${runId}`, { before: {}, after: {}, changes: [] }),
    optionalRequest<AnyRecord[]>(`/approvals?run_id=${runId}`, []),
    optionalRequest<AnyRecord[]>(`/notifications?run_id=${runId}`, []),
    optionalRequest<AnyRecord[]>('/menu', []),
    optionalRequest<AnyRecord[]>('/signals?limit=50', []),
  ]);

  const signal = signals.find((item) => Number(item.id) === Number(run.signal_event_id)) || null;
  lastRun = {
    run,
    trace,
    diff,
    approvals,
    notifications,
    menu,
    signal,
    signalText: signal?.raw_text || '',
    plan: parseDecision(run),
  };
  return lastRun;
}

async function getLatestRunWithTrace(): Promise<AnyRecord | null> {
  try {
    const runs = await request<AnyRecord[]>('/agent/runs?limit=1');
    const run = runs[0];
    if (!run) return createOfflineRun();
    return hydrateRun(run);
  } catch {
    return lastRun || createOfflineRun();
  }
}

async function runSignalFlow(data: { type?: string; message: string; priority?: string }): Promise<AnyRecord> {
  try {
    const signal = await request<AnyRecord>('/signals', {
      method: 'POST',
      body: JSON.stringify({
        source_type: data.type || sourceFromText(data.message),
        raw_text: data.message,
      }),
    });
    const runResponse = await request<{ agent_run_id: number }>(`/agent/run/${signal.id}`, { method: 'POST' });
    const fullRun = await getFullRun(runResponse.agent_run_id);
    return { id: String(signal.id), signal, ...fullRun };
  } catch {
    const offline = createOfflineRun(data.message);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('menumind_offline_run_id', String(offline.run.id));
      } catch {}
    }
    return { id: String(offline.signal.id), signal: offline.signal, ...offline };
  }
}

async function latestRunOrEmpty(): Promise<AnyRecord | null> {
  return lastRun;
}

const demoUser = {
  id: 'demo-owner',
  email: 'demo@menumind.ai',
  fullName: 'MenuMind Demo Owner',
  cafeName: 'MenuMind Cafe',
  role: 'owner',
  location: 'Islamabad G-13',
  phone: '+92 demo',
};

export const api = {
  auth: {
    login: async (data: { email: string; password: string }) => {
      try {
        return await request<{ user: typeof demoUser; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        });
      } catch {
        return { token: 'offline-demo-token', user: { ...demoUser, email: data.email || demoUser.email } };
      }
    },
    signup: async (data: { fullName: string; cafeName?: string; email: string; password: string }) => {
      try {
        return await request<{ user: typeof demoUser; token: string }>('/auth/signup', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return {
          token: 'offline-demo-token',
          user: {
            ...demoUser,
            email: data.email || demoUser.email,
            fullName: data.fullName || demoUser.fullName,
            cafeName: data.cafeName || demoUser.cafeName,
          },
        };
      }
    },
    getProfile: () => optionalRequest<typeof demoUser>('/auth/profile', demoUser),
  },

  operations: {
    getHealth: async () => {
      const health = await optionalRequest<AnyRecord>('/health', { status: 'ok', planner: 'offline-fallback' });
      return {
        id: 'menumind-agent',
        status: health.status === 'ok' ? 'operational' : 'degraded',
        lastCycleTime: new Date().toISOString(),
        throughputMB: 42,
        throughputPercent: health.planner === 'gemini' ? 96 : 82,
        dataProcessed: health.planner === 'gemini' ? 'Gemini planner online' : 'Embedded fallback online',
      };
    },
    getSignals: async () => {
      const [signals, weather] = await Promise.all([
        request<AnyRecord[]>('/signals?limit=10').catch(() => []),
        optionalRequest<AnyRecord | null>('/weather/context', null),
      ]);
      const weatherSignal = weather ? [{
        id: 'weather-context',
        type: 'weather',
        source: weather.source || 'Open-Meteo',
        message: `Weather: ${weather.summary}`,
        priority: Array.isArray(weather.risks) && weather.risks.length ? 'high' : 'medium',
        createdAt: new Date().toISOString(),
      }] : [];
      const current = signals.map((signal) => ({
        id: String(signal.id),
        type: signal.source_type || 'web',
        source: signal.source_type || 'web',
        message: signal.raw_text,
        priority: signal.status === 'processed' ? 'medium' : 'high',
        createdAt: signal.created_at || new Date().toISOString(),
      }));
      const merged = [...weatherSignal, ...current];
      return merged.length ? merged : offlineSignals.map((signal) => ({
        id: String(signal.id),
        type: signal.source_type,
        source: signal.source_type,
        message: signal.raw_text,
        priority: signal.status === 'processed' ? 'medium' : 'high',
        createdAt: signal.created_at,
      }));
    },
    createSignal: runSignalFlow,
    getLatestRun: getLatestRunWithTrace,
    getReasoning: async () => {
      const cached = (await latestRunOrEmpty()) || (await getLatestRunWithTrace());
      if (!cached?.trace?.length) return [];
      const plan = cached.plan || {};
      return cached.trace.slice(-10).reverse().map((t: AnyRecord) => ({
        id: String(t.id),
        type: categoryForTrace(t.step),
        title: titleForTrace(t.step),
        description: summarizeTraceMessage(t, plan),
        confidence: runConfidence(plan),
        timestamp: t.created_at,
      }));
    },
    getAttention: async () => {
      const approvals = await optionalRequest<AnyRecord[]>('/approvals?status=pending', lastRun?.approvals || []);
      return approvals.slice(0, 5).map((a) => ({
        id: String(a.id),
        type: a.action_type || 'approval',
        title: 'Human approval required',
        description: a.reason || 'Policy guardrail paused this action for review.',
        priority: 'high',
        confidence: Math.round((lastRun?.plan?.confidence || 0.78) * 100),
        recommendation: actionLabel({ tool: a.action_type, args: parseJson(a.payload_json, {}) }),
      }));
    },
    handleAttentionAction: async (id: string, action: string) => {
      await optionalRequest(`/approvals/${id}/${action === 'reject' ? 'reject' : 'approve'}`, { success: true });
      return { success: true, action };
    },
    getSuggestions: async () => {
      const plan = lastRun?.plan || {};
      const recommendations = Array.isArray(plan.recommended_actions) ? plan.recommended_actions : [];
      return recommendations.slice(0, 4).map((message: string, index: number) => ({
        id: `run-${lastRun?.run?.id || 'latest'}-suggestion-${index}`,
        message: humanizeRecommendation(message),
        category: 'agent',
        confidence: Math.round((plan.confidence || 0.8) * 100),
      }));
    },
    dismissSuggestion: async (id: string) => ({ id }),
    getMetrics: async () => {
      const [menu, health] = await Promise.all([
        optionalRequest<AnyRecord[]>('/menu', offlineMenu),
        optionalRequest<AnyRecord>('/health', { status: 'ok', planner: 'offline-fallback' }),
      ]);
      const promoted = menu.filter((item) => item.is_promoted).length;
      return [
        { label: 'Planner', value: health.planner || 'fallback', trend: health.status === 'ok' ? '+live' : 'check' },
        { label: 'Menu Items', value: String(menu.length), trend: '+stable' },
        { label: 'Promotions', value: String(promoted), trend: promoted ? '+active' : 'idle' },
      ];
    },
  },

  approvals: {
    getPending: async () => {
      const approvals = await optionalRequest<AnyRecord[]>('/approvals?status=pending', lastRun?.approvals || []);
      return approvals.map((a) => ({
        id: String(a.id),
        signalType: a.action_type?.includes('price') ? 'Pricing Signal' : 'Menu Signal',
        title: 'Approval gate triggered',
        confidence: Math.round((lastRun?.plan?.confidence || 0.78) * 100),
        recommendation: actionLabel({ tool: a.action_type, args: parseJson(a.payload_json, {}) }),
        recommendationIcon: 'trending_up',
        description: a.reason,
        context: parseJson(a.payload_json, {}),
        createdAt: a.created_at,
      }));
    },
    getStats: async () => {
      const approvals = await optionalRequest<AnyRecord[]>('/approvals', lastRun?.approvals || []);
      return {
        pending: approvals.filter((a) => a.status === 'pending').length,
        approved: approvals.filter((a) => a.status === 'approved').length,
        rejected: approvals.filter((a) => a.status === 'rejected').length,
        recentApprovals: approvals.slice(0, 5).map((a) => ({
          id: String(a.id),
          action: a.status,
          title: a.reason || a.action_type,
          timestamp: a.resolved_at || a.created_at,
        })),
        policyLimits: [
          { id: 'price-guard', name: 'Crisis price guardrail', value: 'No surge in crisis', status: 'healthy' },
          { id: 'approval', name: 'Human review', value: 'High-risk actions', status: 'healthy' },
        ],
        aiModelStatus: { status: 'operational', version: 'gemini-flash' },
      };
    },
    approve: async (id: string) => optionalRequest<{ id: string; status: string }>(`/approvals/${id}/approve`, { id, status: 'approved' }),
    reject: async (id: string) => optionalRequest<{ id: string; status: string }>(`/approvals/${id}/reject`, { id, status: 'rejected' }),
  },

  auditLog: {
    getEntries: (params: { page?: number; pageSize?: number; action?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.pageSize) query.set('pageSize', String(params.pageSize));
      if (params.action) query.set('action', params.action);
      return request<{
        entries: AnyRecord[];
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>(`/audit-log?${query}`);
    },
    getEntry: (id: string) => request<AnyRecord>(`/audit-log/${id}`),
  },

  inventory: {
    getMenuItems: async (params: { page?: number; pageSize?: number; status?: string; search?: string; sortBy?: string; sortOrder?: string } = {}) => {
      const menu = await optionalRequest<AnyRecord[]>('/menu', offlineMenu);
      const search = (params.search || '').toLowerCase();
      const items = menu
        .filter((item) => !search || item.name.toLowerCase().includes(search))
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: `${item.category} - ${item.prep_time_min} min prep - stock ${item.stock_level}`,
          price: item.current_price,
          basePrice: item.base_price,
          image: MENU_IMAGES[item.id] || '',
          status: menuStatus(item),
          aiStatus: item.is_promoted ? 'AI_MANAGED' : 'MANUAL',
          isManaged: true,
          createdAt: item.updated_at || new Date().toISOString(),
        }));
      const page = params.page || 1;
      const pageSize = params.pageSize || items.length || 10;
      return {
        items: items.slice((page - 1) * pageSize, page * pageSize),
        totalCount: items.length,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
      };
    },
    createMenuItem: async (data: { name: string; description?: string; price: number; basePrice?: number; image?: string }) => ({
      id: data.name.toLowerCase().replace(/\s+/g, '_'),
    }),
    toggleManagement: async (id: string) => ({ id, isManaged: true, aiStatus: 'AI_MANAGED' }),
    getRisks: async () => {
      const menu = await optionalRequest<AnyRecord[]>('/menu', offlineMenu);
      return menu
        .filter((item) => item.stock_level < 35 || !item.is_available)
        .map((item) => ({
          id: item.id,
          name: item.name,
          status: item.is_available ? `Stock ${item.stock_level}` : 'Unavailable',
          alertLevel: item.is_available ? 'WARNING' : 'CRITICAL',
        }));
    },
    getInsights: async () => {
      const plan = lastRun?.plan || {};
      const recommendations = Array.isArray(plan.recommended_actions) ? plan.recommended_actions : [];
      return recommendations.map((description: string, index: number) => ({
        id: `insight-${index}`,
        title: index === 0 ? 'Primary AI recommendation' : 'Operational recommendation',
        description,
        insightType: 'Agent',
        actionLabel: 'Review',
      }));
    },
    dismissInsight: async (id: string) => ({ id }),
    getTrends: async (_period: '24h' | '7d' = '24h') => [
      { id: 't1', label: '6AM', value: 12, timestamp: new Date().toISOString() },
      { id: 't2', label: '10AM', value: 38, timestamp: new Date().toISOString() },
      { id: 't3', label: '2PM', value: 62, timestamp: new Date().toISOString() },
      { id: 't4', label: '6PM', value: 44, timestamp: new Date().toISOString() },
    ],
    getSignals: async () => api.operations.getSignals(),
    getMetrics: async () => {
      const menu = await optionalRequest<AnyRecord[]>('/menu', offlineMenu);
      const aiManagedItems = menu.filter((item) => item.is_promoted).length;
      const criticalRisks = menu.filter((item) => !item.is_available || item.stock_level < 25).length;
      return {
        metrics: [
          { label: 'AI Managed', value: String(aiManagedItems), change: '+live', isPositive: true },
          { label: 'Risk Items', value: String(criticalRisks), change: criticalRisks ? 'review' : 'clear', isPositive: !criticalRisks },
          { label: 'Menu State', value: String(menu.length), change: 'synced', isPositive: true },
        ],
        stats: {
          activeInsights: lastRun?.plan?.recommended_actions?.length || 0,
          criticalRisks,
          newSignalsCount: lastRun ? 1 : 0,
          aiManagedItems,
          totalItems: menu.length,
        },
        liveThroughput: 94,
      };
    },
  },

  analytics: {
    getThroughput: () => optionalRequest<AnyRecord[]>('/analytics/throughput', [
      { id: 'offline-1', label: '08:00', value: 42, timestamp: new Date().toISOString() },
      { id: 'offline-2', label: '12:00', value: 76, timestamp: new Date().toISOString() },
      { id: 'offline-3', label: '16:00', value: 58, timestamp: new Date().toISOString() },
    ]),
    getSignals: () => optionalRequest<AnyRecord[]>('/analytics/signals', [
      { source: 'weather', count: 2 },
      { source: 'inventory', count: 1 },
      { source: 'web', count: 1 },
    ]),
    getRecommendations: () => optionalRequest<AnyRecord[]>('/analytics/recommendations', []),
    executeRecommendation: async (id: string) => optionalRequest<{ id: string }>(`/analytics/recommendations/${id}/execute`, { id }),
    dismissRecommendation: async (id: string) => optionalRequest<{ id: string }>(`/analytics/recommendations/${id}/dismiss`, { id }),
    getInterpretation: () => optionalRequest<{ summary: string; insights: AnyRecord[] }>('/analytics/interpretation', {
      summary: 'Embedded fallback is active. MenuMind can still demonstrate the full operations flow while the backend is offline.',
      insights: [
        { label: 'Planner', value: 'offline fallback', confidence: 82 },
        { label: 'Signal coverage', value: 'weather + inventory + competitor', confidence: 78 },
      ],
    }),
  },

  settings: {
    getProfile: () => optionalRequest<typeof demoUser>('/settings/profile', demoUser),
    updateProfile: async (data: AnyRecord) => optionalRequest('/settings/profile', { ...demoUser, ...data }),
    getNotifications: () => optionalRequest<NotificationSettings>('/settings/notifications', {
      pushNotifications: true,
      emailNotifications: true,
      smsAlerts: false,
      approvalAlerts: true,
      inventoryAlerts: true,
      weeklyDigest: true,
    }),
    updateNotifications: (data: Partial<NotificationSettings>) =>
      optionalRequest<NotificationSettings>('/settings/notifications', {
        pushNotifications: true,
        emailNotifications: true,
        smsAlerts: false,
        approvalAlerts: true,
        inventoryAlerts: true,
        weeklyDigest: true,
        ...data,
      }),
    getAiPreferences: () => optionalRequest<AiPreferences>('/settings/ai-preferences', {
      autoApproveThreshold: 75,
      riskTolerance: 'balanced',
      decisionSpeed: 'fast',
      humanOverride: true,
      explainDecisions: true,
      learnFromFeedback: true,
    }),
    updateAiPreferences: (data: Partial<AiPreferences>) =>
      optionalRequest<AiPreferences>('/settings/ai-preferences', {
        autoApproveThreshold: 75,
        riskTolerance: 'balanced',
        decisionSpeed: 'fast',
        humanOverride: true,
        explainDecisions: true,
        learnFromFeedback: true,
        ...data,
      }),
    getSecurity: () => optionalRequest<SecuritySettings>('/settings/security', {
      twoFactorEnabled: false,
      lastPasswordChange: new Date().toISOString(),
    }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      optionalRequest('/settings/security/password', { success: true }),
    toggle2FA: (enabled: boolean) => optionalRequest('/settings/security/2fa', { twoFactorEnabled: enabled }),
  },
};

export type ApiService = typeof api;
