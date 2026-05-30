'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { AuditLogEntry } from '@/data';

const transformContext = (ctx: unknown): { label: string; value: string; progress: number; isHigh: boolean }[] => {
  if (Array.isArray(ctx)) return ctx;
  if (typeof ctx === 'object' && ctx !== null) {
    return Object.entries(ctx).map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: String(value),
      progress: typeof value === 'number' ? value : (String(value).includes('High') || String(value).includes('+') ? 80 : 40),
      isHigh: String(value).toLowerCase().includes('high') || String(value).startsWith('+') || String(value).includes('critical'),
    }));
  }
  return [];
};

export function useAuditLog(page: number = 1, pageSize: number = 10) {
  const [data, setData] = useState<{
    entries: AuditLogEntry[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (pageNum: number, pageSz: number, actionFilter: string = 'all') => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await api.auditLog.getEntries({
        page: pageNum,
        pageSize: pageSz,
        action: actionFilter,
      });

      setData({
        entries: result.entries.map((e: { 
          id: string; 
          signalType?: string; 
          title: string; 
          action: string; 
          confidence?: number; 
          timestamp?: string;
          createdAt?: string;
          details?: string;
          context?: unknown;
          escalated?: boolean;
          relatedSignals?: unknown;
          previousActions?: unknown;
          timeToDecision?: number;
        }) => ({
          id: e.id,
          type: (e.signalType || 'Inventory Signal') as 'Pricing Signal' | 'Inventory Signal' | 'Menu Signal',
          title: e.title || 'Approval Action',
          action: (e.action === 'approved' || e.action === 'rejected') ? e.action as 'approved' | 'rejected' : 'approved',
          user: 'User',
          confidence: e.confidence || 80,
          timestamp: e.createdAt ? new Date(e.createdAt) : new Date(),
          details: e.details || '',
          recommendation: '',
          aiReasoning: '',
          context: transformContext(e.context),
          timeToDecision: e.timeToDecision ? `${Math.floor(e.timeToDecision / 60)}m ${e.timeToDecision % 60}s` : '< 1 min',
          escalated: e.escalated || false,
          relatedSignals: Array.isArray(e.relatedSignals) ? e.relatedSignals.map(String) : [],
          previousActions: Array.isArray(e.previousActions) ? e.previousActions.map(String) : [],
        })),
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    } catch (err) {
      console.error('Failed to load audit log:', err);
      setError('Failed to load audit log');
      setData({
        entries: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(page, pageSize);
  }, [loadData, page, pageSize]);

  const goToPage = useCallback((newPage: number) => {
    loadData(newPage, pageSize);
  }, [loadData, pageSize]);

  return {
    data,
    isLoading,
    error,
    reload: () => loadData(page, pageSize),
    goToPage,
  };
}