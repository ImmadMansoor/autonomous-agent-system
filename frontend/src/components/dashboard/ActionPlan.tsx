'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { STAGGER_CONTAINER, REVEAL_UP, BUTTON_ANIMATION } from '@/lib/animations';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

const actions: ActionItem[] = [
  { 
    id: '1', 
    title: 'Review Ingredient Pricing', 
    description: '3 items need price adjustment due to supplier changes',
    status: 'in_progress',
    priority: 'high'
  },
  { 
    id: '2', 
    title: 'Approve Menu Update', 
    description: 'New seasonal items ready for activation',
    status: 'pending',
    priority: 'medium'
  },
  { 
    id: '3', 
    title: 'Restock Alert Response', 
    description: 'Oat milk and almond milk below threshold',
    status: 'completed',
    priority: 'high'
  },
  { 
    id: '4', 
    title: 'Validate Cost Calculations', 
    description: 'Profit margins adjusted for 5 items',
    status: 'pending',
    priority: 'low'
  },
];

const priorityColors = {
  high: { bg: 'rgba(186, 26, 26, 0.1)', color: 'var(--error)' },
  medium: { bg: 'rgba(217, 119, 6, 0.1)', color: '#d97706' },
  low: { bg: 'rgba(0, 104, 95, 0.1)', color: 'var(--primary)' },
};

const statusIcons = {
  pending: <Circle size={18} />,
  in_progress: <Clock size={18} />,
  completed: <CheckCircle2 size={18} />,
};

export function ActionPlan() {
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
        justifyContent: 'space-between',
        padding: 'var(--space-md) var(--space-lg)',
        borderBottom: '1px solid var(--outline-variant)',
      }}>
        <span style={{
          fontFamily: 'var(--font-headline)',
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--on-surface)',
        }}>
          Action Plan
        </span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--on-surface-variant)',
        }}>
          {actions.length} tasks
        </span>
      </div>

      <div style={{ padding: 'var(--space-md)' }}>
        {actions.map((action) => (
          <motion.div
            key={action.id}
            variants={REVEAL_UP}
            style={{
              display: 'flex',
              gap: 'var(--space-md)',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              color: action.status === 'completed' ? 'var(--primary)' : 
                     action.status === 'in_progress' ? '#d97706' : 'var(--on-surface-variant)',
              flexShrink: 0,
              marginTop: '2px',
            }}>
              {statusIcons[action.status]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: '4px' }}>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                }}>
                  {action.title}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: priorityColors[action.priority].bg,
                  color: priorityColors[action.priority].color,
                }}>
                  {action.priority}
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--on-surface-variant)',
              }}>
                {action.description}
              </p>
            </div>
            <motion.button
              {...BUTTON_ANIMATION}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--primary-container)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-sm)',
                cursor: 'pointer',
                flexShrink: 0,
                alignSelf: 'center',
              }}
            >
              <ArrowRight size={16} color="var(--on-primary-container)" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}