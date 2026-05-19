'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Ban, Settings, Wifi, DollarSign } from 'lucide-react';
import { REVEAL_UP } from '@/lib/animations';
import { Metric, LiveSignal } from '@/data';

interface MetricsTickerProps {
  metrics: Metric[];
  liveSignals: LiveSignal[];
}

const iconMap: Record<string, React.ReactNode> = {
  'trending-up': <TrendingUp size={20} />,
  'ban': <Ban size={20} />,
  'settings': <Settings size={20} />,
  'dollar-sign': <DollarSign size={20} />,
};

const glassCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid #E2E8F0',
  borderRadius: 'var(--radius-xl)',
};

export function MetricsTicker({ metrics, liveSignals }: MetricsTickerProps) {
  const liveSignalMessage = liveSignals
    .slice(0, 3)
    .map(s => s.message)
    .join(' | ');

  return (
    <motion.section
      variants={REVEAL_UP}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-gutter)',
      }}
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          variants={REVEAL_UP}
          style={{
            ...glassCardStyle,
            padding: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}
        >
          <div style={{
            padding: 'var(--space-sm)',
            borderRadius: 'var(--radius-xl)',
            background: `${metric.color}10`,
            color: metric.color,
          }}>
            {iconMap[metric.icon]}
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-label)',
              fontSize: 'var(--font-size-label-md)',
              color: 'var(--on-surface-variant)',
            }}>
              {metric.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <p style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'var(--font-size-headline-sm)',
                fontWeight: 600,
                color: metric.color,
              }}>
                {metric.value}
              </p>
              {metric.change && (
                <span style={{
                  fontSize: 'var(--font-size-label-md)',
                  color: metric.changeType === 'positive' ? 'var(--primary)' : 'var(--error)',
                }}>
                  {metric.change}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      <motion.div
        variants={REVEAL_UP}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(255, 255, 255, 0.3)',
          border: '1px dashed var(--outline-variant)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-md)',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-label)',
          fontSize: 'var(--font-size-label-md)',
          color: 'var(--on-surface-variant)',
          display: 'flex',
          alignItems: 'center',
          marginBottom: 'var(--space-xs)',
        }}>
          <Wifi size={12} style={{ marginRight: '4px' }} />
          LIVE SIGNALS
        </p>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-label-md)',
            color: 'var(--on-surface-variant)',
            overflow: 'hidden',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {liveSignalMessage || 'No active signals'}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}