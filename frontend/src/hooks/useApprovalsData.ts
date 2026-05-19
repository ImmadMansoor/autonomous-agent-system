'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ApprovalItem, RecentApproval, PolicyLimit } from '@/data';
import { io } from 'socket.io-client';

interface PolicyLimitApi {
  id: string;
  name: string;
  value: string;
  status: string;
}

interface ApprovalsData {
  pendingApprovals: ApprovalItem[];
  recentApprovals: RecentApproval[];
  policyLimits: PolicyLimit[];
  stats: {
    pending: number;
    approved: number;
    rejected: number;
  };
  aiModelStatus: {
    status: 'operational' | 'degraded' | 'offline';
    version: string;
  };
}

type FilterType = 'all' | 'pricing' | 'inventory' | 'menu';

export function useApprovalsData() {
  const { user } = useAuth();
  const [data, setData] = useState<ApprovalsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  // Shared data-fetching logic extracted to avoid duplication
  const fetchAndSet = useCallback(async (showSkeleton: boolean) => {
    try {
      if (showSkeleton) {
        setIsLoading(true);
        setError(null);
      }

      const [pendingRes, statsRes] = await Promise.allSettled([
        api.approvals.getPending(),
        api.approvals.getStats(),
      ]);

      const pending = pendingRes.status === 'fulfilled' ? pendingRes.value : [];
      const stats = statsRes.status === 'fulfilled' ? statsRes.value : null;

      const transformContext = (ctx: unknown): { label: string; value: string; progress: number; isHigh: boolean }[] => {
        // Already in display format (array of {label, value, progress, isHigh})
        if (Array.isArray(ctx)) {
          return ctx.slice(0, 3).map((item: any) => ({
            label: item.label || '',
            value: String(item.value || ''),
            progress: typeof item.progress === 'number' ? item.progress : 50,
            isHigh: !!item.isHigh,
          }));
        }

        if (typeof ctx === 'object' && ctx !== null) {
          // The context may be the full AI proposal object — extract only the "impact" sub-object or
          // other numeric/short-value keys to build 3 display bars
          const obj = ctx as Record<string, unknown>;

          // Prefer impact block if it exists
          if (obj.impact && typeof obj.impact === 'object') {
            const impact = obj.impact as Record<string, unknown>;
            return Object.entries(impact)
              .filter(([, v]) => v !== 'neutral' && v !== null && v !== undefined)
              .slice(0, 3)
              .map(([key, value]) => {
                const strVal = String(value);
                const isPositive = strVal.startsWith('+') || strVal.toLowerCase().includes('high');
                return {
                  label: key.charAt(0).toUpperCase() + key.slice(1) + ' Impact',
                  value: strVal,
                  progress: isPositive ? 80 : 40,
                  isHigh: isPositive,
                };
              });
          }

          // Fallback: pick short string/number fields, skip long text and nested objects
          const skipKeys = new Set(['id', 'title', 'description', 'recommendation', 'reasoning', 'suggestedActions', 'signalType']);
          const entries = Object.entries(obj)
            .filter(([key, value]) => {
              if (skipKeys.has(key)) return false;
              if (value === null || value === undefined) return false;
              if (typeof value === 'object') return false;
              return String(value).length < 30;
            })
            .slice(0, 3);

          return entries.map(([key, value]) => {
            const strVal = String(value);
            const isHigh = strVal.startsWith('+') || strVal.toLowerCase().includes('high') || strVal.toLowerCase().includes('critical');
            const numVal = parseFloat(strVal);
            return {
              label: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
              value: strVal,
              progress: !isNaN(numVal) && numVal <= 100 ? numVal : (isHigh ? 80 : 45),
              isHigh,
            };
          });
        }

        return [];
      };

      const pendingApprovals: ApprovalItem[] = pending.map((p: any) => ({
        id: p.id,
        signalType: p.signalType as 'Pricing Signal' | 'Inventory Signal' | 'Menu Signal',
        title: p.title,
        confidence: p.confidence,
        recommendation: p.recommendation,
        recommendationIcon: (p.recommendationIcon || 'trending_up') as 'trending_up' | 'local_shipping' | 'shopping_cart',
        description: p.description,
        context: transformContext(p.context),
        status: 'pending' as const,
        createdAt: new Date(p.createdAt),
      }));

      const recentApprovals: RecentApproval[] = (stats?.recentApprovals || []).map((r: any) => ({
        id: r.id,
        title: r.title || 'Approval',
        action: (r.action === 'approved' || r.action === 'rejected') ? r.action : 'approved',
        user: r.user?.fullName || user?.fullName || 'Unknown',
        timestamp: r.createdAt ? new Date(r.createdAt) : new Date(),
      }));

      const policyLimits: PolicyLimit[] = (stats?.policyLimits || []).map((pl: PolicyLimitApi) => ({
        label: pl.name,
        value: pl.value,
        progress: pl.status === 'warning' ? 75 : 50,
      }));

      // Use real AI model status from backend, falling back gracefully
      const rawModelStatus = stats?.aiModelStatus;
      const aiModelStatus: ApprovalsData['aiModelStatus'] = {
        status: (rawModelStatus?.status === 'operational' || rawModelStatus?.status === 'degraded' || rawModelStatus?.status === 'offline')
          ? rawModelStatus.status
          : 'operational',
        version: rawModelStatus?.version || 'gemini-flash',
      };

      setData({
        pendingApprovals,
        recentApprovals,
        policyLimits,
        stats: {
          pending: stats?.pending ?? pendingApprovals.length,
          approved: stats?.approved ?? recentApprovals.filter(a => a.action === 'approved').length,
          rejected: stats?.rejected ?? recentApprovals.filter(a => a.action === 'rejected').length,
        },
        aiModelStatus,
      });
    } catch (err) {
      console.error('Failed to load approvals data:', err);
      if (showSkeleton) setError('Failed to load approvals data');
    } finally {
      if (showSkeleton) setIsLoading(false);
    }
  }, [user]);

  // Initial load — show skeleton
  const loadData = useCallback(() => fetchAndSet(true), [fetchAndSet]);
  // Background refresh — silent, no skeleton
  const refreshData = useCallback(() => fetchAndSet(false), [fetchAndSet]);

  useEffect(() => {
    loadData();
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socketUrl = apiUrl.replace(/\/api$/, '');
    const socket = io(socketUrl, { transports: ['websocket'] });
    
    // Real-time: silently refresh without showing skeleton
    socket.on('approval:created', () => refreshData());
    socket.on('approval:updated', () => refreshData());
    socket.on('signal:created', () => refreshData());

    return () => {
      socket.disconnect();
    };
  }, [loadData, refreshData]);

  const filteredApprovals = useMemo(() => {
    if (!data) return [];
    
    if (filter === 'all') return data.pendingApprovals;
    
    return data.pendingApprovals.filter(item => {
      if (filter === 'pricing') return item.signalType === 'Pricing Signal';
      if (filter === 'inventory') return item.signalType === 'Inventory Signal';
      if (filter === 'menu') return item.signalType === 'Menu Signal';
      return true;
    });
  }, [data, filter]);

  const handleApprovalAction = useCallback((id: string, action: 'approve' | 'reject') => {
    setData(prev => {
      if (!prev) return prev;
      
      const item = prev.pendingApprovals.find(i => i.id === id);
      if (!item) return prev;
      
      const newRecentApproval: RecentApproval = {
        id: `rec-${Date.now()}`,
        title: item.title,
        action: action === 'approve' ? 'approved' : 'rejected',
        user: user?.fullName || 'you',
        timestamp: new Date(),
      };
      
      return {
        ...prev,
        pendingApprovals: prev.pendingApprovals.filter(i => i.id !== id),
        recentApprovals: [newRecentApproval, ...prev.recentApprovals].slice(0, 10),
      };
    });
  }, [user]);

  const approveItem = useCallback(async (id: string) => {
    try {
      await api.approvals.approve(id);
      handleApprovalAction(id, 'approve');
    } catch (err) {
      console.error('Failed to approve:', err);
      throw err;
    }
  }, [handleApprovalAction]);

  const rejectItem = useCallback(async (id: string) => {
    try {
      await api.approvals.reject(id);
      handleApprovalAction(id, 'reject');
    } catch (err) {
      console.error('Failed to reject:', err);
      throw err;
    }
  }, [handleApprovalAction]);

  const exportApprovals = useCallback(() => {
    if (!data) return;
    
    const csvContent = [
      ['ID', 'Type', 'Title', 'Confidence', 'Recommendation', 'Status', 'Created'].join(','),
      ...data.pendingApprovals.map(item => [
        item.id,
        item.signalType,
        `"${item.title.replace(/"/g, '""')}"`,
        item.confidence,
        `"${item.recommendation.replace(/"/g, '""')}"`,
        item.status,
        item.createdAt.toISOString(),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approvals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  return {
    data,
    isLoading,
    error,
    reload: loadData,
    filter,
    setFilter,
    filteredApprovals,
    pendingCount: data?.pendingApprovals.length || 0,
    approveItem,
    rejectItem,
    exportApprovals,
  };
}