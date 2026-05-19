'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Zap, 
  Package, 
  TrendingUp, 
  Brain, 
  Users,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  BarChart3,
  Activity,
  FileText
} from 'lucide-react';
import { Sidebar, Navbar, MobileNav, ProtectedRoute } from '@/components/layout';
import { AILogDetailSkeleton } from '@/components/skeletons';
import { REVEAL_UP } from '@/lib/animations';
import { useOperationsData } from '@/hooks';

const typeStyles: Record<string, { bg: string; color: string; icon: React.ReactNode; border: string }> = {
  'Pricing Logic': { 
    bg: 'rgba(0, 104, 95, 0.1)', 
    color: 'var(--primary)',
    icon: <Zap size={20} />,
    border: 'var(--primary)',
  },
  'Inventory': { 
    bg: 'rgba(186, 26, 26, 0.1)', 
    color: 'var(--error)',
    icon: <Package size={20} />,
    border: 'var(--error)',
  },
  'Upsell Engine': { 
    bg: 'rgba(0, 98, 141, 0.1)', 
    color: 'var(--tertiary)',
    icon: <TrendingUp size={20} />,
    border: 'var(--tertiary)',
  },
  'Demand Forecast': { 
    bg: 'rgba(139, 92, 246, 0.1)', 
    color: '#8b5cf6',
    icon: <Brain size={20} />,
    border: '#8b5cf6',
  },
  'Staffing': { 
    bg: 'rgba(236, 72, 153, 0.1)', 
    color: '#ec4899',
    icon: <Users size={20} />,
    border: '#ec4899',
  },
};

const mockDetails: Record<string, {
  trigger: string;
  affectedItems: string[];
  metrics: { label: string; value: string }[];
  relatedActions: { type: string; description: string; status: 'completed' | 'pending' }[];
  notes: string[];
  timestamp: string;
  duration: string;
}> = {
  'reas-1': {
    trigger: 'Weather API: Local temperature reached 85°F (forecast)',
    affectedItems: ['Iced Latte', 'Iced Americano', 'Cold Brew'],
    metrics: [
      { label: 'Price Adjustment', value: '-$0.50' },
      { label: 'Expected Volume Increase', value: '+14%' },
      { label: 'Margin Impact', value: '-2.3%' },
      { label: 'Forecast Accuracy', value: '94%' },
    ],
    relatedActions: [
      { type: 'Menu Update', description: 'Updated pricing across all POS terminals', status: 'completed' },
      { type: 'Inventory Alert', description: 'Pre-positioned extra espresso for anticipated volume', status: 'completed' },
      { type: 'Marketing', description: 'Push notification for cold beverage deals', status: 'pending' },
    ],
    notes: [
      'Historical data shows 87% correlation between temps above 84°F and cold beverage demand',
      'Competitor pricing analysis shows opportunity for price optimization',
      'Summer seasonal adjustment protocol activated',
    ],
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    duration: '4.2s',
  },
  'reas-2': {
    trigger: 'Supplier API: Central Dairy Co. flagged shipping delay',
    affectedItems: ['Sourdough Bread', 'Avocado Toast'],
    metrics: [
      { label: 'Current Stock', value: '12 units' },
      { label: 'Morning Demand', value: '45 units' },
      { label: 'Deficit', value: '-33 units' },
      { label: 'Shelf Life', value: '3 days' },
    ],
    relatedActions: [
      { type: 'Menu Update', description: 'De-listed Sourdough from all morning items', status: 'completed' },
      { type: 'Customer Alert', description: 'Notified 234 mobile order customers', status: 'completed' },
      { type: 'Alternative Order', description: 'Contacted backup supplier for emergency stock', status: 'pending' },
    ],
    notes: [
      'Automatic de-listing triggered per inventory policy',
      'Backup supplier (Artisan Bakery) can deliver by 9 AM',
      'Customer satisfaction impact: low (low morning Sourdough order rate)',
    ],
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    duration: '2.8s',
  },
  'reas-3': {
    trigger: 'Inventory Analytics: Muffin surplus detected (expiring in 48h)',
    affectedItems: ['Blueberry Muffin', 'Chocolate Muffin', 'Banana Bread'],
    metrics: [
      { label: 'Surplus Weight', value: '4.2kg' },
      { label: 'Waste Value', value: '$63.00' },
      { label: 'Potential Savings', value: '$42.50' },
      { label: 'Pairing Success Rate', value: '67%' },
    ],
    relatedActions: [
      { type: 'Promo Activation', description: 'Enabled "Muffin Pairing" on all kiosks', status: 'completed' },
      { type: 'Upsell Training', description: 'Sent tip to baristas for active upselling', status: 'completed' },
      { type: 'Price Reduction', description: 'Applied 15% discount on muffin drinks combos', status: 'completed' },
    ],
    notes: [
      'Predictive waste algorithm flagged 72 hours ago',
      'Upsell pairings: Any medium/large hot beverage + muffin = $1 off',
      'Expected ROI: 67% reduction in muffin waste',
    ],
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    duration: '1.9s',
  },
};

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useOperationsData();

  if (isLoading || !data) {
    return (
      <ProtectedRoute>
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
          <Sidebar />
          <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
            <Navbar title="Log Details" subtitle="Loading..." />
            <main style={{
              padding: 'var(--space-lg) var(--space-xl)',
              paddingTop: 'calc(64px + var(--space-lg))',
              paddingBottom: 'calc(64px + var(--space-lg))',
            }}>
              <AILogDetailSkeleton />
            </main>
          </div>
          <MobileNav />
        </div>
      </ProtectedRoute>
    );
  }

  const item = data.reasoningItems.find(r => r.id === id);

  if (!item) {
    return (
      <ProtectedRoute>
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
          <Sidebar />
          <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
            <Navbar title="Log Not Found" />
            <main style={{ padding: 'var(--space-xl)' }}>
              <Link href="/logs" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                ← Back to Logs
              </Link>
              <h1 style={{ marginTop: 'var(--space-lg)' }}>Log not found</h1>
            </main>
          </div>
          <MobileNav />
        </div>
      </ProtectedRoute>
    );
  }

  const details = mockDetails[id] || {
    trigger: 'Manual trigger',
    affectedItems: [],
    metrics: [],
    relatedActions: [],
    notes: [],
    timestamp: item.timestamp.toISOString(),
    duration: 'N/A',
  };

  const style = typeStyles[item.type] || typeStyles['Pricing Logic'];

  return (
    <ProtectedRoute>
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
        <Navbar title="Log Details" />
        
        <main style={{ 
          padding: 'var(--space-lg) var(--space-xl)', 
          paddingTop: 'calc(64px + var(--space-lg))',
          paddingBottom: 'calc(64px + var(--space-lg))',
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <motion.div variants={REVEAL_UP}>
              <Link 
                href="/logs" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontSize: 'var(--font-size-body-sm)',
                  marginBottom: 'var(--space-lg)',
                }}
              >
                <ArrowLeft size={16} />
                Back to All Logs
              </Link>
            </motion.div>

            <motion.div 
              variants={REVEAL_UP}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${style.border}`,
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-xl)',
                marginBottom: 'var(--space-lg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  background: style.bg,
                  color: style.color,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-lg)',
                  fontFamily: 'var(--font-label)',
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}>
                  {style.icon}
                  {item.type}
                </span>
                
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--on-surface-variant)',
                  fontSize: 'var(--font-size-body-sm)',
                }}>
                  <Clock size={16} />
                  {item.time}
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'var(--font-size-headline-md)',
                fontWeight: 700,
                color: 'var(--on-surface)',
                marginBottom: 'var(--space-md)',
              }}>
                {item.title}
              </h1>
              
              <p style={{
                color: 'var(--on-surface-variant)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-body-md)',
                lineHeight: 1.6,
              }}>
                {item.description}
              </p>

              {item.confidence && (
                <div style={{
                  marginTop: 'var(--space-lg)',
                  padding: 'var(--space-md)',
                  background: 'var(--surface-container)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                }}>
                  <Activity size={20} color="var(--primary)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                      <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--on-surface-variant)' }}>Confidence Score</span>
                      <span style={{ fontWeight: 600, color: item.confidence >= 90 ? 'var(--primary)' : '#f59e0b' }}>{item.confidence}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'var(--surface-container-high)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${item.confidence}%`,
                        height: '100%',
                        background: item.confidence >= 90 ? 'var(--primary)' : item.confidence >= 70 ? '#f59e0b' : 'var(--error)',
                        borderRadius: '9999px',
                      }} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--space-lg)',
              marginBottom: 'var(--space-lg)',
            }}>
              <motion.div 
                variants={REVEAL_UP}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-lg)',
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: 'var(--font-size-headline-sm)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                  marginBottom: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}>
                  <Zap size={18} color="var(--primary)" />
                  Trigger
                </h3>
                <p style={{
                  color: 'var(--on-surface-variant)',
                  fontSize: 'var(--font-size-body-sm)',
                }}>
                  {details.trigger}
                </p>
              </motion.div>

              <motion.div 
                variants={REVEAL_UP}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-lg)',
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: 'var(--font-size-headline-sm)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                  marginBottom: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}>
                  <Clock size={18} color="var(--primary)" />
                  Timing
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--font-size-body-sm)' }}>Executed</span>
                    <span style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 500 }}>
                      {new Date(details.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--font-size-body-sm)' }}>Processing Time</span>
                    <span style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 500 }}>{details.duration}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {details.affectedItems.length > 0 && (
              <motion.div 
                variants={REVEAL_UP}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-lg)',
                  marginBottom: 'var(--space-lg)',
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: 'var(--font-size-headline-sm)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                  marginBottom: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}>
                  <Package size={18} color="var(--tertiary)" />
                  Affected Items
                </h3>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  {details.affectedItems.map((item, i) => (
                    <span key={i} style={{
                      padding: 'var(--space-xs) var(--space-md)',
                      background: 'var(--surface-container)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-body-sm)',
                      color: 'var(--on-surface)',
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {details.metrics.length > 0 && (
              <motion.div 
                variants={REVEAL_UP}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-lg)',
                  marginBottom: 'var(--space-lg)',
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: 'var(--font-size-headline-sm)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                  marginBottom: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}>
                  <BarChart3 size={18} color="var(--primary)" />
                  Metrics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-md)' }}>
                  {details.metrics.map((metric, i) => (
                    <div key={i} style={{
                      padding: 'var(--space-md)',
                      background: 'var(--surface-container)',
                      borderRadius: 'var(--radius-lg)',
                    }}>
                      <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--font-size-label-md)', marginBottom: '4px' }}>
                        {metric.label}
                      </p>
                      <p style={{ fontFamily: 'var(--font-headline)', fontSize: 'var(--font-size-headline-sm)', fontWeight: 600, color: 'var(--on-surface)' }}>
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {details.relatedActions.length > 0 && (
              <motion.div 
                variants={REVEAL_UP}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-lg)',
                  marginBottom: 'var(--space-lg)',
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: 'var(--font-size-headline-sm)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                  marginBottom: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}>
                  <Activity size={18} color="var(--tertiary)" />
                  Related Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {details.relatedActions.map((action, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-md)',
                      background: 'var(--surface-container)',
                      borderRadius: 'var(--radius-lg)',
                    }}>
                      <div>
                        <span style={{ 
                          fontSize: 'var(--font-size-label-md)', 
                          color: 'var(--primary)',
                          fontWeight: 600,
                          marginRight: 'var(--space-sm)',
                        }}>
                          {action.type}:
                        </span>
                        <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--on-surface)' }}>
                          {action.description}
                        </span>
                      </div>
                      {action.status === 'completed' ? (
                        <CheckCircle size={16} color="var(--primary)" />
                      ) : (
                        <AlertTriangle size={16} color="#f59e0b" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {details.notes.length > 0 && (
              <motion.div 
                variants={REVEAL_UP}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-lg)',
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: 'var(--font-size-headline-sm)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                  marginBottom: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}>
                  <FileText size={18} color="var(--on-surface-variant)" />
                  Notes
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {details.notes.map((note, i) => (
                    <li key={i} style={{
                      padding: 'var(--space-sm) 0',
                      borderBottom: i < details.notes.length - 1 ? '1px solid var(--outline-variant)' : 'none',
                      color: 'var(--on-surface-variant)',
                      fontSize: 'var(--font-size-body-sm)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-sm)',
                    }}>
                      <span style={{ color: 'var(--primary)', marginTop: '2px' }}>•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
    </ProtectedRoute>
  );
}