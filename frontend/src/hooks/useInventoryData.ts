'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

export interface InventoryRisk {
  id: string;
  name: string;
  status: string;
  alertLevel: 'CRITICAL' | 'OPTIMIZE' | 'WARNING';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  basePrice: string;
  image: string;
  status: 'DYNAMIC' | 'FIXED' | 'WASTE_RISK';
  aiStatus: 'AI_MANAGED' | 'MANUAL' | 'AI_PENDING' | 'NONE';
  isManaged: boolean;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  insightType: string;
  actionLabel: string;
  isDismissed: boolean;
}

export interface LiveSignal {
  id: string;
  type: 'price' | 'inventory' | 'marketing';
  title: string;
  description: string;
  timestamp: Date;
  isNew: boolean;
}

export interface TrendMetric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface TrendDataPoint {
  name: string;
  value: number;
}

export type TimePeriod = '24h' | '7d';
export type FilterType = 'ALL' | 'DYNAMIC' | 'FIXED' | 'WASTE_RISK';
export type SortType = 'name' | 'price' | 'status';

const POLL_INTERVAL_MS = 5000;

function mapAiStatus(status: string): MenuItem['aiStatus'] {
  if (status === 'AUTO' || status === 'AI_MANAGED') return 'AI_MANAGED';
  if (status === 'AI_PENDING') return 'AI_PENDING';
  if (status === 'MANUAL') return 'MANUAL';
  return 'NONE';
}

function mapMenuItem(item: {
  id: string;
  name: string;
  description?: string;
  price: number;
  basePrice?: number;
  image?: string;
  status: string;
  aiStatus: string;
  isManaged: boolean;
}): MenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: `$${item.price.toFixed(2)}`,
    basePrice: item.basePrice ? `$${item.basePrice.toFixed(2)} base` : 'Base price',
    image: item.image || 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=300&fit=crop&q=80',
    status: item.status as MenuItem['status'],
    aiStatus: mapAiStatus(item.aiStatus),
    isManaged: item.isManaged,
  };
}

function mapSignalType(type: string): LiveSignal['type'] {
  if (type === 'inventory' || type === 'temperature') return 'inventory';
  if (type === 'traffic' || type === 'pos') return 'marketing';
  return 'price';
}

function signalTitle(type: string, message: string): string {
  const titles: Record<string, string> = {
    inventory: 'Inventory',
    weather: 'Weather',
    traffic: 'Traffic',
    temperature: 'Temperature',
    pos: 'POS',
  };
  return titles[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

export function useInventoryData() {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [inventoryRisks, setInventoryRisks] = useState<InventoryRisk[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([]);
  const [trendMetrics, setTrendMetrics] = useState<TrendMetric[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [stats, setStats] = useState({
    activeInsights: 0,
    criticalRisks: 0,
    newSignalsCount: 0,
    aiManagedItems: 0,
    totalItems: 0,
  });
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('24h');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isLoading, setIsLoading] = useState(true);
  const knownSignalIds = useRef<Set<string>>(new Set());

  const applyMetrics = useCallback((metricsRes: {
    metrics: TrendMetric[];
    stats: typeof stats;
  }) => {
    setTrendMetrics(metricsRes.metrics);
    setStats(metricsRes.stats);
  }, []);

  const fetchInventoryData = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) setIsLoading(true);

      const [insightsRes, risksRes, menuItemsRes, signalsRes, trendsRes, metricsRes] =
        await Promise.allSettled([
          api.inventory.getInsights(),
          api.inventory.getRisks(),
          api.inventory.getMenuItems({ pageSize: 50 }),
          api.inventory.getSignals(),
          api.inventory.getTrends(timePeriod),
          api.inventory.getMetrics(),
        ]);

      if (insightsRes.status === 'fulfilled') {
        setAiInsights(
          insightsRes.value.map((i) => ({
            id: i.id,
            title: i.title,
            description: i.description,
            insightType: i.insightType || 'General',
            actionLabel: i.actionLabel || 'View',
            isDismissed: false,
          }))
        );
      }

      if (risksRes.status === 'fulfilled') {
        setInventoryRisks(
          risksRes.value.map((r) => ({
            id: r.id,
            name: r.name,
            status: r.status,
            alertLevel: r.alertLevel as InventoryRisk['alertLevel'],
          }))
        );
      }

      if (menuItemsRes.status === 'fulfilled') {
        const loadedItems = menuItemsRes.value.items.map(mapMenuItem);
        setMenuItems(loadedItems);
      } else {
        console.error('Failed to load menu items:', menuItemsRes.reason);
      }

      if (signalsRes.status === 'fulfilled') {
        const previousIds = knownSignalIds.current;
        const mapped = signalsRes.value.slice(0, 10).map((s) => {
          const isNew = !previousIds.has(s.id) && previousIds.size > 0;
          if (!previousIds.has(s.id)) previousIds.add(s.id);
          return {
            id: s.id,
            type: mapSignalType(s.type),
            title: signalTitle(s.type, s.message),
            description: s.message,
            timestamp: new Date(s.createdAt),
            isNew,
          };
        });
        signalsRes.value.forEach((s) => knownSignalIds.current.add(s.id));
        setLiveSignals(mapped);
      }

      if (trendsRes.status === 'fulfilled') {
        setTrendData(
          trendsRes.value.map((t) => ({
            name: t.label,
            value: t.value,
          }))
        );
      }

      if (metricsRes.status === 'fulfilled') {
        applyMetrics(metricsRes.value);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      if (!options?.silent) setIsLoading(false);
    }
  }, [timePeriod, applyMetrics]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchInventoryData({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchInventoryData]);

  useEffect(() => {
    let filtered = [...menuItems];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    if (filter !== 'ALL') {
      filtered = filtered.filter((item) => item.status === filter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredMenuItems(filtered);
    setCurrentPage(1);
  }, [menuItems, filter, sortBy, searchQuery]);

  const dismissInsight = useCallback(async (id: string) => {
    try {
      await api.inventory.dismissInsight(id);
      setAiInsights((prev) =>
        prev.map((insight) => (insight.id === id ? { ...insight, isDismissed: true } : insight))
      );
      const metrics = await api.inventory.getMetrics();
      applyMetrics(metrics);
    } catch (err) {
      console.error('Failed to dismiss insight:', err);
    }
  }, [applyMetrics]);

  const executeInsightAction = useCallback(
    async (id: string) => {
      await dismissInsight(id);
    },
    [dismissInsight]
  );

  const toggleMenuItemManagement = useCallback(async (id: string) => {
    try {
      const result = await api.inventory.toggleManagement(id);
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                isManaged: result.isManaged,
                aiStatus: mapAiStatus(result.aiStatus),
              }
            : item
        )
      );
      const metrics = await api.inventory.getMetrics();
      applyMetrics(metrics);
    } catch (err) {
      console.error('Failed to toggle management:', err);
    }
  }, [applyMetrics]);

  const addLiveSignal = useCallback((signal: Omit<LiveSignal, 'id' | 'timestamp' | 'isNew'>) => {
    const newSignal: LiveSignal = {
      ...signal,
      id: `sig-${Date.now()}`,
      timestamp: new Date(),
      isNew: true,
    };
    setLiveSignals((prev) => [newSignal, ...prev.slice(0, 9)]);
  }, []);

  const addMenuItem = useCallback(
    async (item: Omit<MenuItem, 'id' | 'aiStatus' | 'isManaged'>) => {
      try {
        const result = await api.inventory.createMenuItem({
          name: item.name,
          description: item.description,
          price: parseFloat(item.price.replace('$', '')),
          image: item.image,
        });
        const newItem: MenuItem = {
          ...item,
          id: result.id,
          aiStatus: 'MANUAL',
          isManaged: false,
        };
        setMenuItems((prev) => [newItem, ...prev]);
        const metrics = await api.inventory.getMetrics();
        applyMetrics(metrics);
      } catch (err) {
        console.error('Failed to add menu item:', err);
      }
    },
    [applyMetrics]
  );

  const markSignalRead = useCallback((id: string) => {
    setLiveSignals((prev) => prev.map((sig) => (sig.id === id ? { ...sig, isNew: false } : sig)));
  }, []);

  const dismissRisk = useCallback((id: string) => {
    setInventoryRisks((prev) => prev.filter((risk) => risk.id !== id));
  }, []);

  const activeInsights = aiInsights.filter((i) => !i.isDismissed);
  const totalPages = Math.ceil(filteredMenuItems.length / itemsPerPage);
  const paginatedMenuItems = filteredMenuItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    aiInsights: activeInsights,
    inventoryRisks,
    menuItems: paginatedMenuItems,
    allMenuItems: menuItems,
    totalItems: filteredMenuItems.length,
    currentPage,
    totalPages,
    setCurrentPage,
    liveSignals,
    trendMetrics,
    trendData,
    timePeriod,
    setTimePeriod,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    isLoading,
    dismissInsight,
    executeInsightAction,
    toggleMenuItemManagement,
    addMenuItem,
    addLiveSignal,
    markSignalRead,
    dismissRisk,
    showAllAlerts: () => {
      console.log('Show all alerts clicked');
    },
    stats: {
      ...stats,
      activeInsights: activeInsights.length,
    },
  };
}
