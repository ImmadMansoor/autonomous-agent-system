'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronRight } from 'lucide-react';
import { STAGGER_CONTAINER, REVEAL_UP } from '@/lib/animations';
import { ReasoningItem as ReasoningItemType } from '@/data';

interface ActiveReasoningProps {
  items: ReasoningItemType[];
}

const typeStyles: Record<string, { bg: string; color: string }> = {
  'Pricing Logic': { bg: 'rgba(0, 104, 95, 0.1)', color: 'var(--primary)' },
  'Inventory': { bg: 'rgba(186, 26, 26, 0.1)', color: 'var(--error)' },
  'Upsell Engine': { bg: 'rgba(0, 98, 141, 0.1)', color: 'var(--tertiary)' },
  'Demand Forecast': { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
  'Staffing': { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' },
};

export function ActiveReasoning({ items }: ActiveReasoningProps) {
  return (
    <motion.div
      variants={REVEAL_UP}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        padding: 'var(--space-lg)',
        borderBottom: '1px solid var(--outline-variant)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--surface-bright)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <History size={18} color="var(--primary)" />
          <h3 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'var(--font-size-headline-sm)',
            fontWeight: 600,
            color: 'var(--on-surface)',
          }}>
            Active Reasoning
          </h3>
        </div>
        <span style={{
          padding: 'var(--space-xs) var(--space-md)',
          borderRadius: '9999px',
          background: 'var(--primary-container)',
          color: 'var(--on-primary-container)',
          fontFamily: 'var(--font-label)',
          fontSize: 'var(--font-size-label-md)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--on-primary-container)',
            }}
          />
          LIVE
        </span>
      </div>

      <div style={{ borderBottom: '1px solid var(--outline-variant)' }}>
        <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <Link key={item.id} href={`/logs/${item.id}`} style={{ textDecoration: 'none' }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              layout
              variants={REVEAL_UP}
              style={{
                padding: 'var(--space-lg)',
                borderBottom: '1px solid var(--outline-variant)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-container-low)';
                e.currentTarget.style.paddingRight = 'var(--space-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.paddingRight = 'var(--space-lg)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span style={{
                    background: typeStyles[item.type]?.bg || 'rgba(0, 104, 95, 0.1)',
                    color: typeStyles[item.type]?.color || 'var(--primary)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-label)',
                    fontSize: 'var(--font-size-label-md)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {item.type}
                  </span>
                  <span style={{
                    color: 'var(--on-surface-variant)',
                    fontFamily: 'var(--font-label)',
                    fontSize: 'var(--font-size-label-md)',
                  }}>
                    {item.time}
                  </span>
                </div>
                <ChevronRight size={18} color="var(--on-surface-variant)" style={{ flexShrink: 0 }} />
              </div>
              <h4 style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-body-lg)',
                fontWeight: 600,
                color: 'var(--on-surface)',
                marginBottom: 'var(--space-xs)',
              }}>
                {item.title}
              </h4>
              <p style={{
                color: 'var(--on-surface-variant)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-body-sm)',
              }}>
                {item.description}
              </p>
              {item.confidence && (
                <div style={{
                  marginTop: 'var(--space-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                }}>
                  <div style={{
                    width: '60px',
                    height: '4px',
                    background: 'var(--surface-container)',
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
                  <span style={{
                    fontSize: 'var(--font-size-label-md)',
                    color: 'var(--on-surface-variant)',
                  }}>
                    {item.confidence}% confidence
                  </span>
                </div>
              )}
            </motion.div>
          </Link>
        ))}
        </AnimatePresence>
      </div>

      <Link href="/logs" style={{ textDecoration: 'none' }}>
        <motion.button
          variants={REVEAL_UP}
          whileHover={{ background: 'rgba(0, 104, 95, 0.05)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: 'var(--space-md)',
            color: 'var(--primary)',
            fontWeight: 600,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-xs)',
          }}
        >
          View Complete Logs
          <ChevronRight size={16} />
        </motion.button>
      </Link>
    </motion.div>
  );
}