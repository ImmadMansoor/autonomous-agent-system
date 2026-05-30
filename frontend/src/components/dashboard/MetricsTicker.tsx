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
  'trending_up': <TrendingUp size={20} />,
  'ban': <Ban size={20} />,
  'settings': <Settings size={20} />,
  'dollar-sign': <DollarSign size={20} />,
};

const glassCardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--outline-variant)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'none',
};

export function MetricsTicker({ metrics, liveSignals }: MetricsTickerProps) {
  const liveSignalMessage = liveSignals[0]?.message || 'No active signals';

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
          className="dot-grid-subtle"
          style={{
            ...glassCardStyle,
            padding: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: 'var(--space-sm)',
            borderRadius: 'var(--radius-xl)',
            background: metric.color.startsWith('var(')
              ? `color-mix(in srgb, ${metric.color} 10%, transparent)`
              : `${metric.color}10`,
            color: metric.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
          }}>
            {iconMap[metric.icon]}
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p className="label-caps">{metric.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                className={/^\d+$/.test(String(metric.value)) ? 'data-number data-number-lg' : 'data-number data-number-md'}
                style={{ color: metric.color }}
              >
                {metric.value}
              </span>
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
        className="dot-grid-subtle"
        style={{
          background: 'var(--surface-container-low)',
          border: '1px dashed var(--outline-variant)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-md)',
          position: 'relative',
          overflow: 'hidden',
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
          <Wifi size={12} style={{ marginRight: '4px', color: '#d71921' }} />
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
            minHeight: '24px',
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1.35,
            whiteSpace: 'normal',
          }}
        >
          {liveSignalMessage}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
