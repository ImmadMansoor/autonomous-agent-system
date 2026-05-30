'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';
import { STAGGER_CONTAINER, REVEAL_UP, HOVER_CARD } from '@/lib/animations';

interface StatCard {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

const stats: StatCard[] = [
  { 
    title: 'Revenue Today', 
    value: '$2,847', 
    change: '+12.5%', 
    changeType: 'positive',
    icon: <DollarSign size={20} /> 
  },
  { 
    title: 'Orders Processed', 
    value: '156', 
    change: '+8.2%', 
    changeType: 'positive',
    icon: <ShoppingCart size={20} /> 
  },
  { 
    title: 'Pending Approvals', 
    value: '12', 
    change: '-3', 
    changeType: 'neutral',
    icon: <AlertTriangle size={20} /> 
  },
  { 
    title: 'Automated Tasks', 
    value: '89', 
    change: '+15', 
    changeType: 'positive',
    icon: <CheckCircle size={20} /> 
  },
];

export function StatsCards() {
  return (
    <motion.div
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-md)',
      }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          variants={REVEAL_UP}
          {...HOVER_CARD}
          style={{
            background: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            border: '1px solid var(--outline-variant)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--primary-container)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--on-primary-container)',
            }}>
              {stat.icon}
            </div>
            {stat.change && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: stat.changeType === 'positive' ? 'var(--primary)' : 
                       stat.changeType === 'negative' ? 'var(--error)' : 'var(--on-surface-variant)',
              }}>
                {stat.changeType === 'positive' && <TrendingUp size={14} />}
                {stat.changeType === 'negative' && <TrendingDown size={14} />}
                {stat.change}
              </span>
            )}
          </div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--on-surface-variant)',
            marginBottom: 'var(--space-xs)',
          }}>
            {stat.title}
          </p>
          <p style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--on-surface)',
          }}>
            {stat.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}