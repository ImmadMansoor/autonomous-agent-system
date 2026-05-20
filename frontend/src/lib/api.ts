const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

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

let lastRun: AnyRecord | null = null;

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

function parseDecision(run: AnyRecord | null): AnyRecord {
  if (!run?.final_decision) return {};
  try {
    return JSON.parse(run.final_decision);
  } catch {
    return {};
  }
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

async function getFullRun(runId: number): Promise<AnyRecord> {
  const run = await request<AnyRecord>(`/agent/runs/${runId}`);
  const [trace, diff, approvals, notifications, menu] = await Promise.all([
    optionalRequest<AnyRecord[]>(`/agent/runs/${runId}/trace`, []),
    optionalRequest<AnyRecord>(`/menu/before-after/${runId}`, { before: {}, after: {}, changes: [] }),
    optionalRequest<AnyRecord[]>(`/approvals?run_id=${runId}`, []),
    optionalRequest<AnyRecord[]>(`/notifications?run_id=${runId}`, []),
    optionalRequest<AnyRecord[]>('/menu', []),
  ]);

  lastRun = { run, trace, diff, approvals, notifications, menu, plan: parseDecision(run) };
  return lastRun;
}

async function runSignalFlow(data: { type?: string; message: string; priority?: string }): Promise<AnyRecord> {
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
    login: (data: { email: string; password: string }) =>
      request<{ user: typeof demoUser; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    signup: (data: { fullName: string; cafeName?: string; email: string; password: string }) =>
      request<{ user: typeof demoUser; token: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getProfile: () => request<typeof demoUser>('/auth/profile'),
  },

  operations: {
    getHealth: async () => {
      const health = await request<AnyRecord>('/health');
      return {
        id: 'menumind-agent',
        status: health.status === 'ok' ? 'operational' : 'degraded',
        lastCycleTime: new Date().toISOString(),
        throughputMB: 42,
        throughputPercent: health.planner === 'gemini' ? 96 : 76,
        dataProcessed: health.planner === 'gemini' ? 'Gemini planner online' : 'Safety fallback online',
      };
    },
    getSignals: async () => {
      const [signals, scenarios] = await Promise.all([
        request<AnyRecord[]>('/signals?limit=10').catch(() => []),
        request<AnyRecord[]>('/signals/scenarios'),
      ]);
      const current = signals.map((signal) => ({
        id: String(signal.id),
        type: signal.source_type || 'web',
        source: signal.source_type || 'web',
        message: signal.raw_text,
        priority: signal.status === 'processed' ? 'medium' : 'high',
        createdAt: signal.created_at || new Date().toISOString(),
      }));
      return [
        ...current,
        ...scenarios.map((s) => ({
          id: `scenario-${s.id}`,
          type: sourceFromText(s.raw_text),
          source: 'preset',
          message: s.raw_text,
          priority: 'medium',
          createdAt: new Date().toISOString(),
        })),
      ];
    },
    createSignal: runSignalFlow,
    getReasoning: async () => {
      const cached = await latestRunOrEmpty();
      if (!cached?.trace?.length) return [];
      return cached.trace.slice(-8).map((t: AnyRecord) => ({
        id: String(t.id),
        type: t.step,
        title: String(t.step || 'agent').replaceAll('_', ' '),
        description: t.message,
        confidence: Math.round((cached.plan?.confidence || 0.82) * 100),
        timestamp: t.created_at,
      }));
    },
    getAttention: async () => {
      const approvals = await request<AnyRecord[]>('/approvals?status=pending');
      return approvals.slice(0, 5).map((a) => ({
        id: String(a.id),
        type: a.action_type || 'approval',
        title: 'Human approval required',
        description: a.reason || 'Policy guardrail paused this action for review.',
        priority: 'high',
        confidence: Math.round((lastRun?.plan?.confidence || 0.78) * 100),
        recommendation: actionLabel({ tool: a.action_type, args: JSON.parse(a.payload_json || '{}') }),
      }));
    },
    handleAttentionAction: async (id: string, action: string) => {
      await request(`/approvals/${id}/${action === 'reject' ? 'reject' : 'approve'}`, { method: 'POST' });
      return { success: true, action };
    },
    getSuggestions: async () => {
      const plan = lastRun?.plan || {};
      const recommendations = Array.isArray(plan.recommended_actions) ? plan.recommended_actions : [];
      return recommendations.slice(0, 4).map((message: string, index: number) => ({
        id: `suggestion-${index}`,
        message,
        category: 'agent',
        confidence: Math.round((plan.confidence || 0.8) * 100),
      }));
    },
    dismissSuggestion: async (id: string) => ({ id }),
    getMetrics: async () => {
      const [menu, health] = await Promise.all([request<AnyRecord[]>('/menu'), request<AnyRecord>('/health')]);
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
      const approvals = await request<AnyRecord[]>('/approvals?status=pending');
      return approvals.map((a) => ({
        id: String(a.id),
        signalType: a.action_type?.includes('price') ? 'Pricing Signal' : 'Menu Signal',
        title: 'Approval gate triggered',
        confidence: Math.round((lastRun?.plan?.confidence || 0.78) * 100),
        recommendation: actionLabel({ tool: a.action_type, args: JSON.parse(a.payload_json || '{}') }),
        recommendationIcon: 'trending_up',
        description: a.reason,
        context: JSON.parse(a.payload_json || '{}'),
        createdAt: a.created_at,
      }));
    },
    getStats: async () => {
      const approvals = await request<AnyRecord[]>('/approvals');
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
    approve: (id: string) => request<{ id: string; status: string }>(`/approvals/${id}/approve`, { method: 'POST' }),
    reject: (id: string) => request<{ id: string; status: string }>(`/approvals/${id}/reject`, { method: 'POST' }),
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
      const menu = await request<AnyRecord[]>('/menu');
      const search = (params.search || '').toLowerCase();
      const items = menu
        .filter((item) => !search || item.name.toLowerCase().includes(search))
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: `${item.category} - ${item.prep_time_min} min prep - stock ${item.stock_level}`,
          price: item.current_price,
          basePrice: item.base_price,
          image: '',
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
      const menu = await request<AnyRecord[]>('/menu');
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
      const menu = await request<AnyRecord[]>('/menu');
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
    getThroughput: () => request<AnyRecord[]>('/analytics/throughput'),
    getSignals: () => request<AnyRecord[]>('/analytics/signals'),
    getRecommendations: () => request<AnyRecord[]>('/analytics/recommendations'),
    executeRecommendation: (id: string) => request<{ id: string }>(`/analytics/recommendations/${id}/execute`, { method: 'POST' }),
    dismissRecommendation: (id: string) => request<{ id: string }>(`/analytics/recommendations/${id}/dismiss`, { method: 'POST' }),
    getInterpretation: () => request<{ summary: string; insights: AnyRecord[] }>('/analytics/interpretation'),
  },

  settings: {
    getProfile: () => request<typeof demoUser>('/settings/profile'),
    updateProfile: (data: AnyRecord) => request('/settings/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getNotifications: () => request<NotificationSettings>('/settings/notifications'),
    updateNotifications: (data: Partial<NotificationSettings>) =>
      request<NotificationSettings>('/settings/notifications', { method: 'PUT', body: JSON.stringify(data) }),
    getAiPreferences: () => request<AiPreferences>('/settings/ai-preferences'),
    updateAiPreferences: (data: Partial<AiPreferences>) =>
      request<AiPreferences>('/settings/ai-preferences', { method: 'PUT', body: JSON.stringify(data) }),
    getSecurity: () => request<SecuritySettings>('/settings/security'),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request('/settings/security/password', { method: 'POST', body: JSON.stringify(data) }),
    toggle2FA: (enabled: boolean) => request('/settings/security/2fa', { method: 'POST', body: JSON.stringify({ enabled }) }),
  },
};

export type ApiService = typeof api;
