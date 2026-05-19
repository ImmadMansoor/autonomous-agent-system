const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      request<{ user: { id: string; email: string; fullName: string; cafeName?: string; role: string }; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    signup: (data: { fullName: string; cafeName?: string; email: string; password: string }) =>
      request<{ user: { id: string; email: string; fullName: string; cafeName?: string; role: string }; token: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getProfile: () =>
      request<{ id: string; email: string; fullName: string; cafeName?: string; role: string; phone?: string; location?: string }>('/auth/profile'),
  },

  operations: {
    getHealth: () =>
      request<{
        id: string;
        status: string;
        lastCycleTime: string;
        throughputMB: number;
        throughputPercent: number;
        dataProcessed: string;
      }>('/operations/health'),
    getSignals: () =>
      request<Array<{
        id: string;
        type: string;
        source?: string;
        message: string;
        priority: string;
        createdAt: string;
      }>>('/operations/signals'),
    createSignal: (data: { type: string; message: string; priority?: string }) =>
      request<{ id: string }>('/operations/signals', { method: 'POST', body: JSON.stringify(data) }),
    getReasoning: () =>
      request<Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        confidence: number;
        timestamp: string;
      }>>('/operations/reasoning'),
    getAttention: () =>
      request<Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        priority: string;
      }>>('/operations/attention'),
    handleAttentionAction: (id: string, action: string) =>
      request<{ success: boolean; action: string }>(`/operations/attention/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      }),
    getSuggestions: () =>
      request<Array<{
        id: string;
        message: string;
        category?: string;
        confidence: number;
      }>>('/operations/suggestions'),
    dismissSuggestion: (id: string) =>
      request<{ id: string }>(`/operations/suggestions/${id}/dismiss`, { method: 'PUT' }),
    getMetrics: () =>
      request<Array<{ label: string; value: string; trend: string }>>('/operations/metrics'),
  },

  approvals: {
    getPending: () =>
      request<Array<{
        id: string;
        signalType: string;
        title: string;
        confidence: number;
        recommendation: string;
        recommendationIcon?: string;
        description: string;
        context?: Array<{ label: string; value: string; progress: number; isHigh: boolean }>;
        createdAt: string;
      }>>('/approvals'),
    getStats: () =>
      request<{
        pending: number;
        approved: number;
        rejected: number;
        recentApprovals: Array<{
          id: string;
          action: string;
          title: string;
          timestamp: string;
        }>;
        policyLimits: Array<{
          id: string;
          name: string;
          value: string;
          status: string;
        }>;
      }>('/approvals/stats'),
    approve: (id: string) =>
      request<{ id: string; status: string }>(`/approvals/${id}/approve`, { method: 'POST' }),
    reject: (id: string) =>
      request<{ id: string; status: string }>(`/approvals/${id}/reject`, { method: 'POST' }),
  },

  auditLog: {
    getEntries: (params: { page?: number; pageSize?: number; action?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.pageSize) query.set('pageSize', String(params.pageSize));
      if (params.action) query.set('action', params.action);
      return request<{
        entries: Array<{
          id: string;
          action: string;
          signalType?: string;
          title: string;
          confidence?: number;
          details?: string;
          timestamp: string;
        }>;
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>(`/audit-log?${query}`);
    },
    getEntry: (id: string) =>
      request<{
        id: string;
        action: string;
        signalType?: string;
        title: string;
        confidence?: number;
        details?: string;
        timestamp: string;
      }>(`/audit-log/${id}`),
  },

  inventory: {
    getMenuItems: (params: { page?: number; pageSize?: number; status?: string; search?: string; sortBy?: string; sortOrder?: string } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => v && query.set(k, String(v)));
      return request<{
        items: Array<{
          id: string;
          name: string;
          description?: string;
          price: number;
          basePrice?: number;
          image?: string;
          status: string;
          aiStatus: string;
          isManaged: boolean;
          createdAt: string;
        }>;
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>(`/inventory/menu-items?${query}`);
    },
    createMenuItem: (data: { name: string; description?: string; price: number; basePrice?: number; image?: string }) =>
      request<{ id: string }>('/inventory/menu-items', { method: 'POST', body: JSON.stringify(data) }),
    toggleManagement: (id: string) =>
      request<{ id: string; isManaged: boolean; aiStatus: string }>(`/inventory/menu-items/${id}/toggle-management`, { method: 'PUT' }),
    getRisks: () =>
      request<Array<{ id: string; name: string; status: string; alertLevel: string }>>('/inventory/risks'),
    getInsights: () =>
      request<Array<{ id: string; title: string; description: string; insightType?: string; actionLabel?: string }>>('/inventory/insights'),
    dismissInsight: (id: string) =>
      request<{ id: string }>(`/inventory/insights/${id}/dismiss`, { method: 'PUT' }),
    getTrends: (period: '24h' | '7d' = '24h') =>
      request<Array<{ id: string; label: string; value: number; timestamp: string }>>(`/inventory/trends?period=${period}`),
    getSignals: () =>
      request<Array<{ id: string; type: string; message: string; priority: string; createdAt: string }>>('/inventory/signals'),
    getMetrics: () =>
      request<{
        metrics: Array<{ label: string; value: string; change: string; isPositive: boolean }>;
        stats: {
          activeInsights: number;
          criticalRisks: number;
          newSignalsCount: number;
          aiManagedItems: number;
          totalItems: number;
        };
        liveThroughput: number;
      }>('/inventory/metrics'),
  },

  analytics: {
    getThroughput: () =>
      request<Array<{ id: string; label: string; value: number; timestamp: string }>>('/analytics/throughput'),
    getSignals: () =>
      request<Array<{ source: string; count: number }>>('/analytics/signals'),
    getRecommendations: () =>
      request<Array<{
        id: string;
        signalType: string;
        title: string;
        confidence: number;
        recommendation: string;
        description: string;
        status: string;
      }>>('/analytics/recommendations'),
    executeRecommendation: (id: string) =>
      request<{ id: string }>(`/analytics/recommendations/${id}/execute`, { method: 'POST' }),
    dismissRecommendation: (id: string) =>
      request<{ id: string }>(`/analytics/recommendations/${id}/dismiss`, { method: 'POST' }),
    getInterpretation: () =>
      request<{
        summary: string;
        insights: Array<{ label: string; value: string; confidence: number }>;
      }>('/analytics/interpretation'),
  },

  settings: {
    getProfile: () =>
      request<{ id: string; email: string; fullName: string; cafeName?: string; role: string; phone?: string; location?: string }>('/settings/profile'),
    updateProfile: (data: { fullName?: string; cafeName?: string; phone?: string; role?: string; location?: string }) =>
      request('/settings/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getNotifications: () =>
      request<{
        pushNotifications: boolean;
        emailNotifications: boolean;
        smsAlerts: boolean;
        approvalAlerts: boolean;
        inventoryAlerts: boolean;
        weeklyDigest: boolean;
      }>('/settings/notifications'),
    updateNotifications: (data: { pushNotifications?: boolean; emailNotifications?: boolean; smsAlerts?: boolean; approvalAlerts?: boolean; inventoryAlerts?: boolean; weeklyDigest?: boolean }) =>
      request('/settings/notifications', { method: 'PUT', body: JSON.stringify(data) }),
    getAiPreferences: () =>
      request<{
        autoApproveThreshold: number;
        riskTolerance: string;
        decisionSpeed: string;
        humanOverride: boolean;
        explainDecisions: boolean;
        learnFromFeedback: boolean;
      }>('/settings/ai-preferences'),
    updateAiPreferences: (data: { autoApproveThreshold?: number; riskTolerance?: string; decisionSpeed?: string; humanOverride?: boolean; explainDecisions?: boolean; learnFromFeedback?: boolean }) =>
      request('/settings/ai-preferences', { method: 'PUT', body: JSON.stringify(data) }),
    getSecurity: () =>
      request<{ twoFactorEnabled: boolean; lastPasswordChange: string }>('/settings/security'),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request('/settings/security/password', { method: 'POST', body: JSON.stringify(data) }),
    toggle2FA: (enabled: boolean) =>
      request('/settings/security/2fa', { method: 'POST', body: JSON.stringify({ enabled }) }),
  },
};

export type ApiService = typeof api;