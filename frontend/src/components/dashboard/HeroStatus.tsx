'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Radio } from 'lucide-react';
import { REVEAL_UP } from '@/lib/animations';
import { SystemHealth, NextCycle, formatRelativeTime } from '@/data';
import { DotText, SegmentedBar } from '@/components/ui';

interface HeroStatusProps {
  systemHealth: SystemHealth;
  nextCycle: NextCycle;
}

const glassCardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--outline-variant)',
  borderRadius: 'var(--radius-xl)',
};

export function HeroStatus({ systemHealth, nextCycle }: HeroStatusProps) {
  const lastCycleAgo = formatRelativeTime(systemHealth.lastCycleTime);

  return (
    <motion.section
      variants={REVEAL_UP}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 'var(--space-gutter)',
      }}
    >
      <motion.div
        variants={REVEAL_UP}
        className="dot-grid-subtle"
        style={{
          ...glassCardStyle,
          gridColumn: 'span 8',
          padding: 'var(--space-lg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
          <div>
            <p className="label-caps" style={{ marginBottom: 'var(--space-xs)' }}>
              System Health
            </p>
            <p className="label-caps" style={{ marginBottom: 'var(--space-sm)', color: 'var(--on-surface-variant)' }}>
              AI Reasoning Engine
            </p>
            <DotText
              as="h3"
              size="display"
              uppercase
              style={{ marginBottom: 'var(--space-md)' }}
            >
              {systemHealth.status === 'active' ? 'OPERATIONAL' : systemHealth.status.toUpperCase()}
            </DotText>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-xs) var(--space-md)',
                borderRadius: '9999px',
                background: 'rgba(0, 104, 95, 0.1)',
                color: 'var(--primary)',
                border: '1px solid rgba(0, 104, 95, 0.2)',
                fontSize: 'var(--font-size-label-md)',
                fontWeight: 600,
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  marginRight: 'var(--space-sm)',
                }} />
                Optimizing Live
              </span>
              <span style={{
                color: 'var(--on-surface-variant)',
                fontSize: 'var(--font-size-body-sm)',
              }}>
                Last reasoning cycle: {lastCycleAgo}
              </span>
            </div>
          </div>
          <div className="hidden lg:block" style={{ display: 'none' }}>
            <Zap size={64} style={{ color: 'rgba(0, 104, 95, 0.1)' }} />
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-xl)', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
            <Radio size={18} color="var(--primary)" />
            <span style={{
              fontFamily: 'var(--font-label)',
              fontSize: 'var(--font-size-label-md)',
              color: 'var(--on-surface)',
            }}>
              Data Throughput: {systemHealth.dataProcessed}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
            <span className="label-caps">Throughput</span>
            <DotText size="sm" style={{ color: 'var(--nothing-accent)' }}>
              {systemHealth.throughputPercent}%
            </DotText>
          </div>
          <SegmentedBar
            value={systemHealth.throughputPercent}
            fillColor="var(--nothing-accent)"
            height={10}
          />
        </div>
      </motion.div>

      <motion.div
        variants={REVEAL_UP}
        className="dot-grid-subtle"
        style={{
          gridColumn: 'span 4',
          background: 'var(--primary)',
          color: 'var(--on-primary)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 10 }}>
          <p style={{
            fontFamily: 'var(--font-label)',
            fontSize: 'var(--font-size-label-md)',
            color: 'var(--primary-fixed)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 'var(--space-xs)',
          }}>
            Next AI Cycle
          </p>
          <DotText as="h4" size="lg" style={{ marginBottom: 'var(--space-md)', color: 'var(--on-primary)' }}>
            {nextCycle.title}
          </DotText>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-body-md)',
            opacity: 0.9,
            marginBottom: 'var(--space-lg)',
          }}>
            {nextCycle.description}
          </p>
          <Link href="/analytics" style={{
            display: 'inline-block',
            background: 'var(--primary-fixed)',
            color: 'var(--on-primary-fixed)',
            padding: 'var(--space-sm) var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: 'none',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            View Projections
          </Link>
        </div>
        <div style={{
          position: 'absolute',
          right: '-32px',
          bottom: '-32px',
          opacity: 0.2,
          transform: 'rotate(12deg)',
        }}>
          <Zap size={160} />
        </div>
      </motion.div>
    </motion.section>
  );
}