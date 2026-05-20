'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CafeData, LiveSignal, ReasoningItem, AttentionItem, AISuggestion } from '@/data';

const HIDDEN_SUGGESTIONS_KEY = 'menumind_hidden_suggestions';

function getHiddenSuggestionIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(HIDDEN_SUGGESTIONS_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function suggestionGroupId(id: string): string {
  if (id.includes('-suggestion-')) {
    return id.replace(/-suggestion-\d+$/, '-suggestion-*');
  }
  if (id.startsWith('suggestion-')) return 'suggestion-*';
  return id;
}

function isSuggestionHidden(id: string, hidden: Set<string>): boolean {
  return hidden.has(id) || hidden.has(suggestionGroupId(id));
}

function rememberHiddenSuggestion(id: string) {
  if (typeof window === 'undefined' || id === 'default') return;
  const hidden = getHiddenSuggestionIds();
  hidden.add(id);
  hidden.add(suggestionGroupId(id));
  localStorage.setItem(HIDDEN_SUGGESTIONS_KEY, JSON.stringify([...hidden].slice(-50)));
}

function calculateRelativeTime(timestamp: string | Date): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function useOperationsData() {
  const { user } = useAuth();
  const [data, setData] = useState<CafeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);
  // Suppress socket-triggered refreshes for a short window after optimistic UI updates
  const suppressRefreshUntil = useRef<number>(0);

  const loadData = useCallback(async (showSkeleton = true) => {
    try {
      if (showSkeleton && isFirstLoad.current) {
        setIsLoading(true);
      }
      setError(null);

      const [healthRes, signalsRes, reasoningRes, attentionRes, suggestionsRes, metricsRes] = await Promise.allSettled([
        api.operations.getHealth(),
        api.operations.getSignals(),
        api.operations.getReasoning(),
        api.operations.getAttention(),
        api.operations.getSuggestions(),
        api.operations.getMetrics(),
      ]);

      const health = healthRes.status === 'fulfilled' ? healthRes.value : null;
      const signals = signalsRes.status === 'fulfilled' ? signalsRes.value : [];
      const reasoning = reasoningRes.status === 'fulfilled' ? reasoningRes.value : [];
      const attention = attentionRes.status === 'fulfilled' ? attentionRes.value : [];
      const hiddenSuggestionIds = getHiddenSuggestionIds();
      const suggestions = suggestionsRes.status === 'fulfilled'
        ? suggestionsRes.value.filter((suggestion) => !isSuggestionHidden(suggestion.id, hiddenSuggestionIds))
        : [];
      const metrics = metricsRes.status === 'fulfilled' ? metricsRes.value : [];

      setData({
        systemHealth: health ? {
          status: health.status as 'active' | 'idle' | 'error',
          lastCycleTime: new Date(health.lastCycleTime),
          throughputMB: health.throughputMB,
          throughputPercent: health.throughputPercent,
          dataProcessed: health.dataProcessed,
        } : {
          status: 'active',
          lastCycleTime: new Date(),
          throughputMB: 0,
          throughputPercent: 0,
          dataProcessed: '0 MB',
        },
        nextCycle: {
          title: 'Ingestion Cron',
          description: 'Polls external APIs for signals',
          timeEstimate: 'Every 15m',
          scheduledAt: new Date(Date.now() + 15 * 60 * 1000),
        },
        metrics: metrics.map((m, i) => ({
          id: `metric-${i}`,
          icon: 'trending_up',
          label: m.label,
          value: m.value,
          changeType: m.trend as 'positive' | 'negative' | 'neutral',
          color: 'var(--primary)',
        })),
        liveSignals: signals.slice(0, 10).map((s, i) => ({
          id: s.id,
          type: s.type as LiveSignal['type'],
          message: s.message,
          timestamp: new Date(s.createdAt),
          priority: s.priority as 'high' | 'medium' | 'low',
        })),
        reasoningItems: reasoning.slice(0, 5).map(r => ({
          id: r.id,
          type: r.type as 'Pricing Logic' | 'Inventory' | 'Upsell Engine' | 'Demand Forecast' | 'Staffing',
          time: calculateRelativeTime(r.timestamp),
          timestamp: new Date(r.timestamp),
          title: r.title,
          description: r.description,
          confidence: r.confidence,
        })),
        attentionItems: attention.map((a, idx) => ({
          id: a.id || `att-${idx}`,
          type: (a.type || 'Threshold Alert') as any,
          icon: (a.type === 'Inventory' ? 'inventory' : a.type === 'Pricing' ? 'alert' : 'psychology') as any,
          title: a.title || 'Action Required',
          description: a.description || '',
          priority: (a.priority || 'medium') as any,
          actionRequired: a.type === 'Inventory' ? 'Review' : 'Approve',
          actionSecondary: 'Dismiss',
          timestamp: new Date(Date.now() - idx * 5 * 60 * 1000),
          confidence: a.confidence,
          recommendation: a.recommendation,
        })),
        aiSuggestion: suggestions.length > 0 ? {
          id: suggestions[0].id,
          message: suggestions[0].message,
          category: (suggestions[0].category || 'operations') as 'inventory' | 'pricing' | 'operations' | 'marketing',
          confidence: suggestions[0].confidence,
          timestamp: new Date(),
        } : {
          id: 'default',
          message: 'System operating normally, no pending suggestions.',
          category: 'operations' as const,
          confidence: 100,
          timestamp: new Date(),
        },
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error('Failed to load operations data:', err);
      setError('Failed to load operations data');
    } finally {
      if (showSkeleton) setIsLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  // Silent refresh: re-fetches from DB without showing skeleton or loading states
  // Skipped if we're within the suppress window (optimistic update in flight)
  const refreshData = useCallback(() => {
    if (Date.now() < suppressRefreshUntil.current) return;
    loadData(false);
  }, [loadData]);

  const [signalsProcessed, setSignalsProcessed] = useState(0);
  const [processingRate, setProcessingRate] = useState(0);

  useEffect(() => {
    loadData();

    const interval = window.setInterval(refreshData, 5000);

    // All real-time events use silent refresh — no skeleton, no glitch
    refreshData();

    return () => {
      window.clearInterval(interval);
    };
  }, [loadData, refreshData]);

  const addLiveSignal = useCallback(async (signal: Omit<LiveSignal, 'id' | 'timestamp'>) => {
    try {
      const result = await api.operations.createSignal({
        type: signal.type,
        message: signal.message,
        priority: signal.priority,
      });
      const newSignal: LiveSignal = {
        ...signal,
        id: result.id,
        timestamp: new Date(),
      };
      // Optimistic update — shows signal immediately
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          liveSignals: [newSignal, ...prev.liveSignals].slice(0, 10),
        };
      });
      // Suppress the socket signal:created event (backend will emit it)
      // then do a fresh DB sync after 800ms to reconcile
      suppressRefreshUntil.current = Date.now() + 800;
      setTimeout(() => loadData(false), 900);
    } catch (err) {
      console.error('Failed to add signal:', err);
    }
  }, [loadData]);

  const addReasoningItem = useCallback((item: Omit<ReasoningItem, 'id' | 'time' | 'timestamp'>) => {
    setData(prev => {
      if (!prev) return prev;
      const newItem: ReasoningItem = {
        ...item,
        id: `reas-${Date.now()}`,
        time: calculateRelativeTime(new Date()),
        timestamp: new Date(),
      };
      return {
        ...prev,
        reasoningItems: [newItem, ...prev.reasoningItems.slice(0, 4)],
      };
    });
  }, []);

  const dismissAttentionItem = useCallback((id: string) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        attentionItems: prev.attentionItems.filter(item => item.id !== id),
      };
    });
  }, []);

  const handleAttentionAction = useCallback(async (id: string, action: 'primary' | 'secondary') => {
    try {
      const actionType = action === 'primary' ? 'approved' : 'dismissed';

      // Suppress socket-triggered refreshes for 2s so the optimistic update
      // isn't immediately overwritten by the approval:updated socket event
      suppressRefreshUntil.current = Date.now() + 2000;
      
      setData(prev => {
        if (!prev) return prev;
        
        const itemToAction = prev.attentionItems.find(i => i.id === id);
        
        if (action === 'primary' && itemToAction) {
          const typeMap: Record<string, string> = {
            'Threshold Alert': 'Pricing Logic',
            'Menu Logic': 'Upsell Engine',
            'Pricing Review': 'Pricing Logic',
            'Inventory Alert': 'Inventory',
          };
          
          const newReasoningItem: ReasoningItem = {
            id: `reas-${Date.now()}`,
            type: (typeMap[itemToAction.type] || 'Demand Forecast') as 'Pricing Logic' | 'Inventory' | 'Upsell Engine' | 'Demand Forecast' | 'Staffing',
            time: 'Just now',
            timestamp: new Date(),
            title: `Approved: ${itemToAction.title}`,
            description: `User approved ${itemToAction.type.toLowerCase()} alert. ${itemToAction.description.substring(0, 80)}...`,
            confidence: 92,
          };
          
          return {
            ...prev,
            attentionItems: prev.attentionItems.filter(i => i.id !== id),
            reasoningItems: [newReasoningItem, ...prev.reasoningItems.slice(0, 4)],
          };
        }
        
        return {
          ...prev,
          attentionItems: prev.attentionItems.filter(i => i.id !== id),
        };
      });

      try {
        await api.operations.handleAttentionAction(id, actionType);
      } catch (apiErr) {
        console.log('API call failed, using mock action only');
      }
    } catch (err) {
      console.error('Failed to handle attention action:', err);
      throw err;
    }
  }, []);

  const updateAISuggestion = useCallback(async (suggestion: Partial<AISuggestion>) => {
    if (!data) return;
    const currentId = data.aiSuggestion.id;
    rememberHiddenSuggestion(currentId);
    suppressRefreshUntil.current = Date.now() + 2500;
    
    setData(prev => {
      if (!prev) return prev;
      
      if (suggestion.message && suggestion.message !== 'Applied successfully!') {
        const newReasoningItem: ReasoningItem = {
          id: `reas-${Date.now()}`,
          type: 'Demand Forecast',
          title: 'AI Suggestion Applied',
          description: suggestion.message,
          confidence: prev.aiSuggestion.confidence,
          time: 'Just now',
          timestamp: new Date(),
        };
        
        return {
          ...prev,
          aiSuggestion: {
            ...prev.aiSuggestion,
            ...suggestion,
            id: 'default',
            message: suggestion.message || 'Applied successfully.',
            category: suggestion.category || prev.aiSuggestion.category,
            timestamp: new Date(),
          },
          reasoningItems: [newReasoningItem, ...prev.reasoningItems.slice(0, 4)],
        };
      }
      
      return {
        ...prev,
        aiSuggestion: {
          ...prev.aiSuggestion,
          ...suggestion,
          id: 'default',
          message: suggestion.message || 'Applied successfully.',
          timestamp: new Date(),
        },
      };
    });

    if (currentId !== 'default') {
      try {
        await api.operations.dismissSuggestion(currentId);
      } catch (err) {
        console.error('Failed to dismiss suggestion in backend:', err);
      }
    }
  }, [data]);

  const dismissAISuggestion = useCallback(async () => {
    if (!data) return;
    const currentId = data.aiSuggestion.id;
    rememberHiddenSuggestion(currentId);
    suppressRefreshUntil.current = Date.now() + 2500;
    
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        aiSuggestion: {
          id: `default`,
          message: 'System operating normally, no pending suggestions.',
          category: 'operations',
          confidence: 100,
          timestamp: new Date(),
        },
      };
    });

    if (currentId !== 'default') {
      try {
        await api.operations.dismissSuggestion(currentId);
      } catch (err) {
        console.error('Failed to dismiss suggestion in backend:', err);
      }
    }
  }, [data]);

  return {
    data,
    isLoading,
    error,
    reload: loadData,
    refreshData,
    addLiveSignal,
    addReasoningItem,
    dismissAttentionItem,
    handleAttentionAction,
    updateAISuggestion,
    dismissAISuggestion,
    signalsProcessed,
    processingRate,
  };
}
