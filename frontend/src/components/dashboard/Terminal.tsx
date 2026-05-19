'use client';

import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { STAGGER_CONTAINER, REVEAL_UP } from '@/lib/animations';

interface LogEntry {
  id: string;
  type: 'action' | 'alert' | 'success' | 'info';
  message: string;
  timestamp: string;
  agent?: string;
}

const logEntries: LogEntry[] = [
  { id: '1', type: 'success', message: 'Updated menu pricing for "Latte" based on milk cost fluctuation', timestamp: '2s ago', agent: 'MenuMind' },
  { id: '2', type: 'action', message: 'Analyzing inventory levels for "Almond Milk" - below threshold', timestamp: '15s ago', agent: 'Inventory' },
  { id: '3', type: 'info', message: 'Detected pattern: Coffee orders increase 40% on Monday mornings', timestamp: '45s ago', agent: 'Analytics' },
  { id: '4', type: 'alert', message: 'Supply alert: "Oat Milk" inventory at 15% - reorder suggested', timestamp: '2m ago', agent: 'Inventory' },
  { id: '5', type: 'success', message: 'Automated email sent to supplier for restock order #4281', timestamp: '5m ago', agent: 'MenuMind' },
  { id: '6', type: 'action', message: 'Processing batch update for 12 menu items', timestamp: '8m ago', agent: 'MenuMind' },
];

const typeStyles = {
  action: { color: 'var(--tertiary)', bg: 'rgba(0, 98, 141, 0.1)' },
  alert: { color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  success: { color: 'var(--primary)', bg: 'rgba(0, 104, 95, 0.1)' },
  info: { color: 'var(--secondary)', bg: 'rgba(80, 95, 118, 0.1)' },
};

export function Terminal() {
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
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-md) var(--space-lg)',
        borderBottom: '1px solid var(--outline-variant)',
        background: 'var(--surface-container)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <TerminalIcon size={18} color="var(--on-surface-variant)" />
          <span style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--on-surface)',
          }}>
            Live Operations
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: 'var(--primary)',
            borderRadius: '50%',
            boxShadow: '0 0 8px var(--primary)',
          }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--primary)',
          }}>
            Live
          </span>
        </div>
      </div>

      <div style={{
        padding: 'var(--space-md)',
        maxHeight: '400px',
        overflowY: 'auto',
      }}>
        {logEntries.map((entry) => (
          <motion.div
            key={entry.id}
            variants={REVEAL_UP}
            style={{
              display: 'flex',
              gap: 'var(--space-md)',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: typeStyles[entry.type].bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {entry.type === 'success' && <CheckCircle2 size={16} color={typeStyles[entry.type].color} />}
              {entry.type === 'action' && <Zap size={16} color={typeStyles[entry.type].color} />}
              {entry.type === 'alert' && <Clock size={16} color={typeStyles[entry.type].color} />}
              {entry.type === 'info' && <TerminalIcon size={16} color={typeStyles[entry.type].color} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: '4px' }}>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: typeStyles[entry.type].color,
                }}>
                  {entry.agent}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--on-surface-variant)',
                }}>
                  {entry.timestamp}
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--on-surface)',
                lineHeight: '1.5',
              }}>
                {entry.message}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}