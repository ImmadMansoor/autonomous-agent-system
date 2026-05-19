export interface SystemHealth {
  status: 'active' | 'idle' | 'error';
  lastCycleTime: Date;
  throughputMB: number;
  throughputPercent: number;
  dataProcessed: string;
}

export interface NextCycle {
  title: string;
  description: string;
  timeEstimate: string;
  scheduledAt: Date;
}

export interface Metric {
  id: string;
  icon: string;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color: string;
}

export interface LiveSignal {
  id: string;
  type: 'temperature' | 'traffic' | 'inventory' | 'weather' | 'pos';
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface ReasoningItem {
  id: string;
  type: 'Pricing Logic' | 'Inventory' | 'Upsell Engine' | 'Demand Forecast' | 'Staffing';
  time: string;
  timestamp: Date;
  title: string;
  description: string;
  confidence?: number;
}

export interface AttentionItem {
  id: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: string;
  actionSecondary?: string;
  timestamp: Date;
  confidence?: number;
  recommendation?: string;
}

export interface AISuggestion {
  id: string;
  message: string;
  category: 'operations' | 'pricing' | 'inventory' | 'marketing';
  confidence: number;
  timestamp: Date;
}

export interface ApprovalItem {
  id: string;
  signalType: 'Pricing Signal' | 'Inventory Signal' | 'Menu Signal';
  title: string;
  confidence: number;
  recommendation: string;
  recommendationIcon: 'trending_up' | 'local_shipping' | 'shopping_cart';
  description: string;
  context?: {
    label: string;
    value: string;
    progress: number;
    isHigh?: boolean;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface RecentApproval {
  id: string;
  title: string;
  action: 'approved' | 'rejected';
  user: string;
  timestamp: Date;
}

export interface PolicyLimit {
  label: string;
  value: string;
  progress: number;
}

export interface MarketElasticityData {
  period: string;
  value: number;
  isNow?: boolean;
}

export interface ApprovalsData {
  pendingApprovals: ApprovalItem[];
  recentApprovals: RecentApproval[];
  policyLimits: PolicyLimit[];
  marketElasticity: MarketElasticityData[];
  aiInsight: {
    title: string;
    description: string;
  };
  aiModelStatus: {
    status: 'operational' | 'degraded' | 'offline';
    version: string;
  };
}

export interface AuditLogEntry {
  id: string;
  type: 'Pricing Signal' | 'Inventory Signal' | 'Menu Signal';
  title: string;
  action: 'approved' | 'rejected';
  user: string;
  confidence: number;
  timestamp: Date;
  details: string;
  recommendation: string;
  aiReasoning: string;
  context?: {
    label: string;
    value: string;
    progress: number;
    isHigh?: boolean;
  }[];
  timeToDecision: string;
  escalated: boolean;
  relatedSignals: string[];
  previousActions: string[];
}

export interface AuditLogData {
  entries: AuditLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CafeData {
  systemHealth: SystemHealth;
  nextCycle: NextCycle;
  metrics: Metric[];
  liveSignals: LiveSignal[];
  reasoningItems: ReasoningItem[];
  attentionItems: AttentionItem[];
  aiSuggestion: AISuggestion;
  lastUpdated: Date;
}

export function getMockCafeData(): CafeData {
  const now = new Date();
  
  return {
    systemHealth: {
      status: 'active',
      lastCycleTime: new Date(now.getTime() - 4000),
      throughputMB: 1.2,
      throughputPercent: 78,
      dataProcessed: '1.2 GB/m',
    },
    nextCycle: {
      title: 'Inventory Audit',
      description: 'Predicted stockouts for morning shift will be resolved in 12m.',
      timeEstimate: '12 minutes',
      scheduledAt: new Date(now.getTime() + 12 * 60 * 1000),
    },
    metrics: [
      {
        id: 'revenue-lift',
        icon: 'trending-up',
        label: 'Revenue Lift',
        value: '+12%',
        change: '+2.3%',
        changeType: 'positive',
        color: 'var(--tertiary)',
      },
      {
        id: 'stockouts-prevented',
        icon: 'ban',
        label: 'Stockouts Prevented',
        value: '8',
        change: '+3',
        changeType: 'positive',
        color: 'var(--primary)',
      },
      {
        id: 'auto-adjusted',
        icon: 'settings',
        label: 'Auto-Adjusted',
        value: '24',
        change: '+5',
        changeType: 'positive',
        color: 'var(--secondary)',
      },
      {
        id: 'avg-ticket',
        icon: 'dollar-sign',
        label: 'Avg Ticket',
        value: '$8.45',
        change: '+$0.32',
        changeType: 'positive',
        color: 'var(--primary)',
      },
    ],
    liveSignals: [
      {
        id: 'sig-1',
        type: 'temperature',
        message: 'TEMP: 85F',
        timestamp: new Date(now.getTime() - 30000),
        priority: 'high',
      },
      {
        id: 'sig-2',
        type: 'traffic',
        message: 'TRAFFIC: HIGH',
        timestamp: new Date(now.getTime() - 60000),
        priority: 'medium',
      },
      {
        id: 'sig-3',
        type: 'inventory',
        message: 'INV: ESPRESSO-LOW',
        timestamp: new Date(now.getTime() - 90000),
        priority: 'high',
      },
      {
        id: 'sig-4',
        type: 'weather',
        message: 'WX: Heat Advisory',
        timestamp: new Date(now.getTime() - 120000),
        priority: 'medium',
      },
      {
        id: 'sig-5',
        type: 'pos',
        message: 'POS: Peak Hour',
        timestamp: new Date(now.getTime() - 150000),
        priority: 'low',
      },
      {
        id: 'sig-6',
        type: 'inventory',
        message: 'INV: Oat Milk LOW',
        timestamp: new Date(now.getTime() - 180000),
        priority: 'high',
      },
    ],
    reasoningItems: [
      {
        id: 'reas-1',
        type: 'Pricing Logic',
        time: '2m ago',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000),
        title: 'Lowered Iced Latte price by $0.50',
        description: 'Trigger: Local temperature reached 85°F forecast. Historical data suggests 14% higher volume at adjusted price point.',
        confidence: 94,
      },
      {
        id: 'reas-2',
        type: 'Inventory',
        time: '14m ago',
        timestamp: new Date(now.getTime() - 14 * 60 * 1000),
        title: 'De-listed Sourdough: Supplier Delay',
        description: 'Automatic update across all terminals. Reasoning: Central supplier flagged shipping delay; current stock insufficient for morning peak.',
        confidence: 98,
      },
      {
        id: 'reas-3',
        type: 'Upsell Engine',
        time: '32m ago',
        timestamp: new Date(now.getTime() - 32 * 60 * 1000),
        title: 'Activated \'Muffin Pairing\' on Kiosks',
        description: 'Reasoning: Muffin surplus + high beverage frequency. Predicted waste reduction: 4.2kg.',
        confidence: 87,
      },
      {
        id: 'reas-4',
        type: 'Demand Forecast',
        time: '45m ago',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000),
        title: 'Morning Rush Protocol Activated',
        description: 'Weather forecast + historical patterns predict 23% higher traffic. Pre-positioned ingredients at mobile order station.',
        confidence: 91,
      },
      {
        id: 'reas-5',
        type: 'Staffing',
        time: '1h ago',
        timestamp: new Date(now.getTime() - 60 * 60 * 1000),
        title: 'Shift Adjustment: +2 Baristas',
        description: 'Event detected: Local conference nearby. Added 2 staff from 10AM-2PM based on attendee arrival patterns.',
        confidence: 82,
      },
    ],
    attentionItems: [
      {
        id: 'att-1',
        type: 'Threshold Alert',
        icon: 'warning',
        title: 'New Vendor Contract',
        description: 'AI suggests switching Dairy provider for a 4% cost reduction. Over $5k annual savings.',
        priority: 'high',
        actionRequired: 'Approve',
        actionSecondary: 'Dismiss',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
        confidence: 94,
      },
      {
        id: 'att-2',
        type: 'Menu Logic',
        icon: 'psychology',
        title: 'Dynamic Pricing Ceiling',
        description: 'System reached +20% max threshold on Nitro Cold Brew. Confirm extended surge?',
        priority: 'medium',
        actionRequired: 'Confirm',
        actionSecondary: 'Reject',
        timestamp: new Date(now.getTime() - 12 * 60 * 1000),
        confidence: 87,
      },
      {
        id: 'att-3',
        type: 'Inventory Alert',
        icon: 'inventory',
        title: 'Critical Stock: Almond Milk',
        description: 'Almond milk below safety threshold. Auto-order triggered but vendor unavailable until tomorrow.',
        priority: 'high',
        actionRequired: 'Approve',
        actionSecondary: 'Dismiss',
        timestamp: new Date(now.getTime() - 25 * 60 * 1000),
        confidence: 96,
      },
    ],
    aiSuggestion: {
      id: 'sug-1',
      message: 'Current operational velocity is 14% higher than last Tuesday. I recommend opening Station 3 by 10:15 AM to handle predicted surge.',
      category: 'operations',
      confidence: 89,
      timestamp: new Date(now.getTime() - 3 * 60 * 1000),
    },
    lastUpdated: now,
  };
}

export function getMockAuditLogData(page: number = 1, pageSize: number = 10): AuditLogData {
  const now = new Date();
  const allEntries: AuditLogEntry[] = [
    { 
      id: 'log-1', 
      type: 'Pricing Signal', 
      title: 'Competitor "Daily Brew" raised prices by 15%', 
      action: 'approved', 
      user: 'you', 
      confidence: 92, 
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), 
      details: 'Increased Signature Blend price to $4.75 to maintain margin advantage.',
      recommendation: 'Increase Signature Blend to $4.75 (+10%)',
      aiReasoning: 'High local demand, competitor inventory low, margin optimization potential.',
      context: [
        { label: 'Demand Context', value: 'High', progress: 88, isHigh: true },
        { label: 'Competitor Inventory', value: 'Low', progress: 20, isHigh: false },
        { label: 'Margin Impact', value: '+12.4%', progress: 100, isHigh: true },
      ],
      timeToDecision: '2m 34s',
      escalated: false,
      relatedSignals: ['SIG-2847', 'SIG-2845', 'WEATHER-92'],
      previousActions: ['Price review completed', 'Competitor analysis done'],
    },
    { 
      id: 'log-2', 
      type: 'Inventory Signal', 
      title: 'Milk supply chain disruption in Northern District', 
      action: 'approved', 
      user: 'Sarah K.', 
      confidence: 88, 
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), 
      details: 'Switched to GreenValley backup supplier for 48 hours.',
      recommendation: 'Switch to "GreenValley" backup for 48 hours',
      aiReasoning: 'Current supplier delayed 24h, stock levels critical at 3 branches, GreenValley has immediate capacity.',
      context: [
        { label: 'Current Stock', value: 'Critical', progress: 15, isHigh: false },
        { label: 'Supplier Delay', value: '24h', progress: 80, isHigh: true },
        { label: 'Backup Available', value: 'Yes', progress: 100, isHigh: true },
      ],
      timeToDecision: '5m 12s',
      escalated: true,
      relatedSignals: ['INV-4512', 'SUP-882'],
      previousActions: ['Vendor contacted', 'Stock audit completed'],
    },
    { 
      id: 'log-3', 
      type: 'Menu Signal', 
      title: 'Seasonal Pumpkin Spice latte demand spike detected', 
      action: 'rejected', 
      user: 'you', 
      confidence: 75, 
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000), 
      details: 'Rejected early launch - timing not optimal for seasonal item.',
      recommendation: 'Add "Spiced Delight" combo at $7.25',
      aiReasoning: 'Historical data shows 34% higher conversion with combo pricing during October.',
      context: [
        { label: 'Demand Trend', value: '+34%', progress: 85, isHigh: true },
        { label: 'Inventory Ready', value: 'No', progress: 30, isHigh: false },
        { label: 'Season Start', value: '2 weeks', progress: 20, isHigh: false },
      ],
      timeToDecision: '1m 45s',
      escalated: false,
      relatedSignals: ['DEM-789', 'TREND-456'],
      previousActions: ['Market analysis done'],
    },
    { 
      id: 'log-4', 
      type: 'Pricing Signal', 
      title: 'Weather alert: Heat wave expected this weekend', 
      action: 'approved', 
      user: 'Mike R.', 
      confidence: 96, 
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000), 
      details: 'Launched "Cool Down" promotion with 15% discount on iced drinks.',
      recommendation: 'Launch "Cool Down" promotion - 15% off iced drinks',
      aiReasoning: 'Temperature forecast shows 95°F+ for 3 days. Historical data suggests 22% increase in iced beverage demand.',
      context: [
        { label: 'Forecast', value: '95°F', progress: 95, isHigh: true },
        { label: 'Duration', value: '3 Days', progress: 60, isHigh: false },
        { label: 'Expected Lift', value: '+22%', progress: 90, isHigh: true },
      ],
      timeToDecision: '3m 20s',
      escalated: false,
      relatedSignals: ['WX-234', 'WX-235', 'DEM-901'],
      previousActions: ['Weather forecast verified', 'Promotion template selected'],
    },
    { 
      id: 'log-5', 
      type: 'Inventory Signal', 
      title: 'Critical stock: Almond Milk across 3 branches', 
      action: 'approved', 
      user: 'you', 
      confidence: 91, 
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), 
      details: 'Emergency order placed with priority shipping.',
      recommendation: 'Emergency reorder: Almond Milk (12 units)',
      aiReasoning: 'Stock below safety threshold at 3 branches. Auto-order triggered but vendor standard delivery too slow.',
      context: [
        { label: 'Branches Affected', value: '3', progress: 60, isHigh: false },
        { label: 'Current Stock', value: '8 units', progress: 20, isHigh: false },
        { label: 'Safety Threshold', value: '15 units', progress: 100, isHigh: true },
      ],
      timeToDecision: '1m 50s',
      escalated: true,
      relatedSignals: ['INV-4489', 'INV-4490', 'INV-4491'],
      previousActions: ['Stock levels verified', 'Vendor availability checked'],
    },
    { 
      id: 'log-6', 
      type: 'Menu Signal', 
      title: 'Menu item deprecation: Sourdough Bread', 
      action: 'approved', 
      user: 'System', 
      confidence: 99, 
      timestamp: new Date(now.getTime() - 36 * 60 * 60 * 1000), 
      details: 'Auto-deprecated discontinued item across all POS systems.',
      recommendation: 'Remove Sourdough Bread from all menus',
      aiReasoning: 'Supplier permanently discontinued. Current stock insufficient for remaining shelf life.',
      context: [
        { label: 'Sales Impact', value: 'Low', progress: 15, isHigh: false },
        { label: 'Stock Remaining', value: '0', progress: 0, isHigh: false },
        { label: 'Alternatives', value: '2 available', progress: 80, isHigh: true },
      ],
      timeToDecision: '0s (auto)',
      escalated: false,
      relatedSignals: ['SUP-991', 'MENU-223'],
      previousActions: ['Supplier notification received', 'Inventory zeroed'],
    },
    { 
      id: 'log-7', 
      type: 'Pricing Signal', 
      title: 'Bulk order discount request: Corporate Client', 
      action: 'rejected', 
      user: 'Sarah K.', 
      confidence: 82, 
      timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000), 
      details: 'Rejected - margin below 15% threshold.',
      recommendation: 'Offer 12% discount on orders above 500 units',
      aiReasoning: 'Corporate client requested 20% bulk discount. Current margin analysis shows 8% at that rate.',
      context: [
        { label: 'Client Margin', value: '8%', progress: 40, isHigh: false },
        { label: 'Min Threshold', value: '15%', progress: 75, isHigh: true },
        { label: 'Volume', value: '500 units', progress: 50, isHigh: false },
      ],
      timeToDecision: '8m 15s',
      escalated: true,
      relatedSignals: ['CORP-445', 'PRICING-882'],
      previousActions: ['Financial analysis completed', 'Client history reviewed'],
    },
    { 
      id: 'log-8', 
      type: 'Inventory Signal', 
      title: 'Equipment maintenance alert: Espresso Machine #3', 
      action: 'approved', 
      user: 'you', 
      confidence: 87, 
      timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000), 
      details: 'Scheduled maintenance during off-peak hours.',
      recommendation: 'Schedule maintenance: Tuesday 2AM - 4AM',
      aiReasoning: 'Predictive analytics indicate potential failure within 48h based on pressure variance patterns.',
      context: [
        { label: 'Failure Risk', value: 'High', progress: 85, isHigh: true },
        { label: 'Repair Time', value: '2 hours', progress: 30, isHigh: false },
        { label: 'Impact Score', value: 'Medium', progress: 50, isHigh: false },
      ],
      timeToDecision: '2m 05s',
      escalated: false,
      relatedSignals: ['EQP-312', 'MAINT-891'],
      previousActions: ['Error logs analyzed', 'Technician scheduled'],
    },
    { 
      id: 'log-9', 
      type: 'Pricing Signal', 
      title: 'Loyalty points multiplier adjustment for weekends', 
      action: 'approved', 
      user: 'Mike R.', 
      confidence: 94, 
      timestamp: new Date(now.getTime() - 96 * 60 * 60 * 1000), 
      details: 'Implemented 2x points for Saturday-Sunday purchases.',
      recommendation: 'Enable 2x loyalty points on weekends',
      aiReasoning: 'Analysis shows 40% lower weekend footfall. 2x points historically increases weekend traffic by 25%.',
      context: [
        { label: 'Current Weekend Traffic', value: '-40%', progress: 20, isHigh: false },
        { label: 'Historical Lift', value: '+25%', progress: 80, isHigh: true },
        { label: 'Cost Impact', value: '$1,200/mo', progress: 35, isHigh: false },
      ],
      timeToDecision: '4m 30s',
      escalated: false,
      relatedSignals: ['LOYALTY-234', 'TRAFFIC-567'],
      previousActions: ['Historical analysis done', 'Cost modeling completed'],
    },
    { 
      id: 'log-10', 
      type: 'Menu Signal', 
      title: 'Combo meal suggestion: Coffee + Pastry', 
      action: 'approved', 
      user: 'you', 
      confidence: 89, 
      timestamp: new Date(now.getTime() - 120 * 60 * 60 * 1000), 
      details: 'Launched combo at 15% discount, projected 18% higher basket size.',
      recommendation: 'Launch "Morning Combo" at $8.50 (15% savings)',
      aiReasoning: 'Pastry inventory 30% above optimal. Combo pricing increases basket size by average $2.40.',
      context: [
        { label: 'Pastry Surplus', value: '+30%', progress: 90, isHigh: true },
        { label: 'Basket Lift', value: '+$2.40', progress: 75, isHigh: true },
        { label: 'Waste Reduction', value: '-15%', progress: 70, isHigh: true },
      ],
      timeToDecision: '3m 10s',
      escalated: false,
      relatedSignals: ['INVENTORY-445', 'POS-789'],
      previousActions: ['Waste analysis completed', 'Pricing optimized'],
    },
    { 
      id: 'log-11', 
      type: 'Inventory Signal', 
      title: 'Waste prevention: Pastry order reduction', 
      action: 'approved', 
      user: 'System', 
      confidence: 95, 
      timestamp: new Date(now.getTime() - 144 * 60 * 60 * 1000), 
      details: 'Auto-reduced pastry order by 20% based on demand forecast.',
      recommendation: 'Reduce daily pastry order by 20%',
      aiReasoning: 'Demand forecast shows 18% lower traffic this week. Current waste rate 12%, reducing to 5% target.',
      context: [
        { label: 'Demand Forecast', value: '-18%', progress: 20, isHigh: false },
        { label: 'Current Waste', value: '12%', progress: 80, isHigh: true },
        { label: 'Target Waste', value: '5%', progress: 50, isHigh: false },
      ],
      timeToDecision: '0s (auto)',
      escalated: false,
      relatedSignals: ['DEMAND-678', 'WASTE-123'],
      previousActions: ['Sales forecast calculated', 'Order system updated'],
    },
    { 
      id: 'log-12', 
      type: 'Pricing Signal', 
      title: 'Competitor promo: "Bean Bros" 20% off', 
      action: 'rejected', 
      user: 'Sarah K.', 
      confidence: 78, 
      timestamp: new Date(now.getTime() - 168 * 60 * 60 * 1000), 
      details: 'Declined to match - short-term promo with minimal impact.',
      recommendation: 'Match competitor: 20% off all espresso drinks',
      aiReasoning: 'Competitor running limited 3-day promo. Historical data shows minimal traffic impact on our cafe.',
      context: [
        { label: 'Competitor Duration', value: '3 days', progress: 20, isHigh: false },
        { label: 'Our Traffic Impact', value: '-2%', progress: 10, isHigh: false },
        { label: 'Margin Impact', value: '-18%', progress: 90, isHigh: true },
      ],
      timeToDecision: '6m 45s',
      escalated: false,
      relatedSignals: ['COMP-678', 'COMP-679'],
      previousActions: ['Competitor monitored', 'Impact analysis done'],
    },
  ];

  const totalCount = allEntries.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const entries = allEntries.slice(startIndex, startIndex + pageSize);

  return {
    entries,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

export function getMockApprovalsData(): ApprovalsData {
  const now = new Date();
  
  return {
    pendingApprovals: [
      {
        id: 'appr-1',
        signalType: 'Pricing Signal',
        title: 'Competitor "Daily Brew" raised prices by 15%',
        confidence: 94,
        recommendation: 'Increase Signature Blend to $4.75 (+10%)',
        recommendationIcon: 'trending_up',
        description: 'High local demand, competitor inventory low, margin optimization potential.',
        context: [
          { label: 'Demand Context', value: 'High', progress: 88, isHigh: true },
          { label: 'Competitor Inventory', value: 'Low', progress: 20, isHigh: false },
          { label: 'Margin Impact', value: '+12.4% Est.', progress: 100, isHigh: true },
        ],
        status: 'pending',
        createdAt: new Date(now.getTime() - 15 * 60 * 1000),
      },
      {
        id: 'appr-2',
        signalType: 'Inventory Signal',
        title: 'Milk supply chain disruption in Northern District',
        confidence: 88,
        recommendation: 'Switch to "GreenValley" backup for 48 hours',
        recommendationIcon: 'local_shipping',
        description: 'Current supplier delayed 24h, stock levels critical at 3 branches, GreenValley has immediate capacity.',
        context: [
          { label: 'Current Stock', value: 'Critical', progress: 15, isHigh: false },
          { label: 'Supplier Delay', value: '24h', progress: 80, isHigh: true },
          { label: 'Backup Available', value: 'Yes', progress: 100, isHigh: true },
        ],
        status: 'pending',
        createdAt: new Date(now.getTime() - 35 * 60 * 1000),
      },
      {
        id: 'appr-3',
        signalType: 'Menu Signal',
        title: 'Seasonal Pumpkin Spice latte demand spike detected',
        confidence: 91,
        recommendation: 'Add "Spiced Delight" combo at $7.25',
        recommendationIcon: 'shopping_cart',
        description: 'Historical data shows 34% higher conversion with combo pricing during October.',
        context: [
          { label: 'Demand Trend', value: '+34%', progress: 85, isHigh: true },
          { label: 'Inventory Ready', value: 'Yes', progress: 100, isHigh: true },
          { label: 'Margin Impact', value: '+8.2%', progress: 75, isHigh: true },
        ],
        status: 'pending',
        createdAt: new Date(now.getTime() - 55 * 60 * 1000),
      },
      {
        id: 'appr-4',
        signalType: 'Pricing Signal',
        title: 'Weather alert: Heat wave expected this weekend',
        confidence: 96,
        recommendation: 'Launch "Cool Down" promotion - 15% off iced drinks',
        recommendationIcon: 'trending_up',
        description: 'Temperature forecast shows 95°F+ for 3 days. Historical data suggests 22% increase in iced beverage demand.',
        context: [
          { label: 'Forecast', value: '95°F', progress: 95, isHigh: true },
          { label: 'Duration', value: '3 Days', progress: 60, isHigh: false },
          { label: 'Expected Lift', value: '+22%', progress: 90, isHigh: true },
        ],
        status: 'pending',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
    ],
    recentApprovals: [
      {
        id: 'rec-1',
        title: 'Holiday Bonus Plan',
        action: 'approved',
        user: 'you',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'rec-2',
        title: 'Pastry Order Adjustment',
        action: 'approved',
        user: 'Sarah K.',
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        id: 'rec-3',
        title: 'Discount Code: LATE10',
        action: 'rejected',
        user: 'you',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        id: 'rec-4',
        title: 'New Vendor Contract',
        action: 'approved',
        user: 'Mike R.',
        timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      },
    ],
    policyLimits: [
      { label: 'Max Price Change', value: '± 20%', progress: 75 },
      { label: 'Auth Threshold', value: '$5,000', progress: 50 },
      { label: 'Min. Confidence', value: '85%', progress: 85 },
    ],
    marketElasticity: [
      { period: 'Mon', value: 40 },
      { period: 'Tue', value: 55 },
      { period: 'Wed', value: 70 },
      { period: 'Thu', value: 85, isNow: true },
      { period: 'Fri', value: 60 },
      { period: 'Sat', value: 45 },
    ],
    aiInsight: {
      title: 'Optimized staffing could save 4% next week.',
      description: 'Based on historical traffic patterns and event data, adjusting shift schedules could reduce labor costs without impacting service quality.',
    },
    aiModelStatus: {
      status: 'operational',
      version: 'v4.2.0',
    },
  };
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}