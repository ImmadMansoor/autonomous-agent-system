'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Signal {
  id: string;
  source: 'web' | 'weather' | 'sms' | 'pos';
  sourceLabel: string;
  timestamp: Date;
  title: string;
  description: string;
  status: 'parsed' | 'review' | 'automated';
}

export interface Recommendation {
  id: string;
  type: 'inventory' | 'staffing' | 'pricing' | 'operations';
  title: string;
  description: string;
  confidence: number;
  isExecuted: boolean;
  isDismissed: boolean;
}

export interface AIInterpretationData {
  activeContext: string;
  projectedTraffic: number;
  trafficDirection: 'up' | 'down';
  waitTimeRisk: 'low' | 'medium' | 'high';
  estimatedDelay: string;
}

export interface ThroughputDataPoint {
  time: string;
  signals: number;
  aiActions: number;
}

const mockSignals: Signal[] = [
    { id: 'sig-1', source: 'pos', sourceLabel: 'POS', timestamp: new Date(Date.now() - 30 * 60000), title: 'Peak Hour Detected', description: 'Traffic increased by 23% in the last hour', status: 'parsed' },
    { id: 'sig-2', source: 'weather', sourceLabel: 'Weather', timestamp: new Date(Date.now() - 2 * 3600000), title: 'Heat Advisory', description: 'Temperature forecast shows 95°F+ for 3 days', status: 'parsed' },
    { id: 'sig-3', source: 'inventory', sourceLabel: 'Inventory', timestamp: new Date(Date.now() - 4 * 3600000), title: 'Stock Alert: Almond Milk', description: 'Almond milk below safety threshold at 3 branches', status: 'review' },
    { id: 'sig-4', source: 'web', sourceLabel: 'Web', timestamp: new Date(Date.now() - 6 * 3600000), title: 'Competitor Price Change', description: 'Daily Brew raised prices by 15%', status: 'parsed' },
  ];

const mockRecommendations: Recommendation[] = [
    { id: 'rec-1', type: 'pricing', title: 'Launch Cool Down Promotion', description: '15% off iced drinks due to heat advisory', confidence: 96, isExecuted: false, isDismissed: false },
    { id: 'rec-2', type: 'inventory', title: 'Emergency Almond Milk Restock', description: 'Order 12 units priority shipping', confidence: 91, isExecuted: false, isDismissed: false },
    { id: 'rec-3', type: 'staffing', title: 'Add +2 Baristas', description: 'Conference event nearby requires additional staff', confidence: 82, isExecuted: false, isDismissed: false },
];

const mockThroughputData: ThroughputDataPoint[] = [
    { time: '6AM', signals: 12, aiActions: 8 },
    { time: '8AM', signals: 28, aiActions: 22 },
    { time: '10AM', signals: 45, aiActions: 38 },
    { time: '12PM', signals: 62, aiActions: 55 },
    { time: '2PM', signals: 58, aiActions: 48 },
    { time: '4PM', signals: 42, aiActions: 35 },
    { time: '6PM', signals: 35, aiActions: 28 },
    { time: '8PM', signals: 18, aiActions: 12 },
  ];

export function useAnalyticsData() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [interpretation, setInterpretation] = useState<AIInterpretationData | null>(null);
  const [throughputData, setThroughputData] = useState<ThroughputDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [throughputRes, sourcesRes, recsRes, interpRes] = await Promise.allSettled([
        api.analytics.getThroughput(),
        api.analytics.getSignals(),
        api.analytics.getRecommendations(),
        api.analytics.getInterpretation(),
      ]);

      const throughput = throughputRes.status === 'fulfilled' ? throughputRes.value : [];
      const sources = sourcesRes.status === 'fulfilled' ? sourcesRes.value : [];
      const recs = recsRes.status === 'fulfilled' ? recsRes.value : [];
      const interp = interpRes.status === 'fulfilled' ? interpRes.value : null;

      if (sources.length > 0) {
        setSignals(sources.map((s, i) => ({
          id: s.id || `sig-${i}`,
          source: s.source as Signal['source'],
          sourceLabel: s.source.charAt(0).toUpperCase() + s.source.slice(1),
          timestamp: new Date(),
          title: `${s.source.charAt(0).toUpperCase() + s.source.slice(1)} Signal`,
          description: `${s.count} signals processed from ${s.source}`,
          status: 'parsed' as const,
        })));
        setSelectedSignalId(sources[0].id);
      } else {
        setSignals(mockSignals);
        setSelectedSignalId(mockSignals[0].id);
      }

      if (recs.length > 0) {
        setRecommendations(recs.map(r => ({
          id: r.id,
          type: 'operations' as Recommendation['type'],
          title: r.title,
          description: r.description,
          confidence: r.confidence,
          isExecuted: r.status === 'approved',
          isDismissed: r.status === 'rejected',
        })));
      } else {
        setRecommendations(mockRecommendations);
      }

      if (interp && interp.summary) {
        const demandInsight = interp.insights?.find((i: { label: string }) => i.label === 'Demand Forecast');
        const staffingInsight = interp.insights?.find((i: { label: string }) => i.label === 'Staffing Need');
        const inventoryInsight = interp.insights?.find((i: { label: string }) => i.label === 'Inventory Optimization');
        
        setInterpretation({
          activeContext: interp.summary,
          projectedTraffic: demandInsight?.value === 'High' ? 23 : demandInsight?.value === 'Medium' ? 12 : 5,
          trafficDirection: demandInsight?.value === 'High' ? 'up' : demandInsight?.value === 'Low' ? 'down' : 'up',
          waitTimeRisk: staffingInsight?.confidence && staffingInsight.confidence > 80 ? 'high' : staffingInsight?.confidence && staffingInsight.confidence > 60 ? 'medium' : 'low',
          estimatedDelay: staffingInsight?.value ? `${staffingInsight.value} recommended` : 'Staffing adequate',
        });
      } else {
        setInterpretation({
          activeContext: 'System operating within normal parameters. Detected 3 pricing optimization opportunities.',
          projectedTraffic: 42,
          trafficDirection: 'up',
          waitTimeRisk: 'medium',
          estimatedDelay: '8min peak delay',
        });
      }

      if (throughput.length > 0) {
        setThroughputData(throughput.map((t, i) => ({
          time: t.label || `Time ${i}`,
          signals: Math.floor(t.value * 0.8),
          aiActions: Math.floor(t.value),
        })));
      } else {
        setThroughputData(mockThroughputData);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setSignals(mockSignals);
      setSelectedSignalId(mockSignals[0].id);
      setRecommendations(mockRecommendations);
      setThroughputData(mockThroughputData);
      setInterpretation({
        activeContext: 'System operating within normal parameters.',
        projectedTraffic: 42,
        trafficDirection: 'up',
        waitTimeRisk: 'medium',
        estimatedDelay: '8min peak delay',
      });
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const selectSignal = useCallback((id: string) => {
    setSelectedSignalId(id);
    const signal = signals.find(s => s.id === id);
    if (signal) {
      setInterpretation({
        activeContext: signal.title + '. ' + signal.description,
        projectedTraffic: Math.floor(Math.random() * 30) + 20,
        trafficDirection: 'up',
        waitTimeRisk: signal.status === 'review' ? 'medium' : 'low',
        estimatedDelay: signal.status === 'review' ? '8min delay' : 'No delay',
      });
    }
  }, [signals]);

  const executeRecommendation = useCallback(async (id: string) => {
    setIsExecuting(true);
    
    try {
      await api.analytics.executeRecommendation(id);
      setRecommendations(prev => prev.map(rec => 
        rec.id === id ? { ...rec, isExecuted: true } : rec
      ));
    } catch (err) {
      console.error('Failed to execute recommendation:', err);
    } finally {
      setIsExecuting(false);
    }
    return true;
  }, []);

  const executeAllRecommendations = useCallback(async () => {
    setIsExecuting(true);
    
    const pendingRecs = recommendations.filter(r => !r.isExecuted && !r.isDismissed);
    
    for (let i = 0; i < pendingRecs.length; i++) {
      try {
        await api.analytics.executeRecommendation(pendingRecs[i].id);
        setRecommendations(prev => prev.map(rec => 
          rec.id === pendingRecs[i].id ? { ...rec, isExecuted: true } : rec
        ));
      } catch (err) {
        console.error('Failed to execute recommendation:', err);
      }
    }
    
    setIsExecuting(false);
    return pendingRecs.length;
  }, [recommendations]);

  const dismissRecommendation = useCallback(async (id: string) => {
    try {
      await api.analytics.dismissRecommendation(id);
      setRecommendations(prev => prev.map(rec => 
        rec.id === id ? { ...rec, isDismissed: true } : rec
      ));
    } catch (err) {
      console.error('Failed to dismiss recommendation:', err);
    }
  }, []);

  const addSignal = useCallback((signal: Omit<Signal, 'id' | 'timestamp'>) => {
    const newSignal: Signal = {
      ...signal,
      id: `sig-${Date.now()}`,
      timestamp: new Date(),
    };
    setSignals(prev => [newSignal, ...prev]);
  }, []);

  const dismissAllRecommendations = useCallback(() => {
    setRecommendations(prev => prev.map(rec => 
      !rec.isExecuted ? { ...rec, isDismissed: true } : rec
    ));
  }, []);

  const newSignalsCount = signals.filter(s => {
    const hoursDiff = (new Date().getTime() - s.timestamp.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  }).length;

  const pendingRecommendations = recommendations.filter(r => !r.isExecuted && !r.isDismissed);
  const avgConfidence = pendingRecommendations.length > 0
    ? Math.round(pendingRecommendations.reduce((acc, r) => acc + r.confidence, 0) / pendingRecommendations.length)
    : 0;

  return {
    signals,
    selectedSignalId,
    selectSignal,
    recommendations,
    pendingRecommendations,
    executeRecommendation,
    executeAllRecommendations,
    dismissRecommendation,
    dismissAllRecommendations,
    addSignal,
    interpretation,
    throughputData,
    isLoading,
    isExecuting,
    stats: {
      newSignalsToday: newSignalsCount,
      pendingRecommendations: pendingRecommendations.length,
      avgConfidence,
    },
  };
}