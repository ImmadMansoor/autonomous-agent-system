'use client';

import { motion } from 'framer-motion';
import { Brain, TrendingUp, DollarSign, Package } from 'lucide-react';
import { STAGGER_CONTAINER, REVEAL_UP, HOVER_CARD } from '@/lib/animations';

interface ContextItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
}

const contexts: ContextItem[] = [
  { icon: <DollarSign size={18} />, label: 'Avg Order Value', value: '$18.24', trend: '+5.2%' },
  { icon: <TrendingUp size={18} />, label: 'Peak Hours', value: '8-10 AM', trend: undefined },
  { icon: <Package size={18} />, label: 'Low Stock Items', value: '3', trend: 'Needs attention' },
  { icon: <Brain size={18} />, label: 'AI Confidence', value: '94%', trend: 'High' },
];

export function ContextCard() {
  return (
    <motion.div
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--outline-variant)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-md) var(--space-lg)',
        borderBottom: '1px solid var(--outline-variant)',
      }}>
        <Brain size={18} color="var(--primary)" />
        <span style={{
          fontFamily: 'var(--font-headline)',
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--on-surface)',
        }}>
          Context Analysis
        </span>
      </div>

      <div style={{ padding: 'var(--space-md)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm)' }}>
        {contexts.map((ctx, index) => (
          <motion.div
            key={ctx.label}
            variants={REVEAL_UP}
            {...HOVER_CARD}
            style={{
              padding: 'var(--space-md)',
              background: 'var(--surface-container)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
              <span style={{ color: 'var(--primary)' }}>{ctx.icon}</span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--on-surface-variant)',
              }}>
                {ctx.label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--on-surface)',
              }}>
                {ctx.value}
              </span>
              {ctx.trend && (
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: ctx.trend.startsWith('+') ? 'var(--primary)' : 
                         ctx.trend === 'High' ? 'var(--primary)' : 'var(--error)',
                }}>
                  {ctx.trend}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}