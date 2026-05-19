'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
import { REVEAL_UP } from '@/lib/animations';
import { AISuggestion as AISuggestionType } from '@/data';

interface AISuggestionProps {
  suggestion: AISuggestionType;
  onApply?: () => void;
  onDismiss?: () => void;
}

const categoryColors: Record<string, string> = {
  operations: 'var(--tertiary)',
  pricing: 'var(--primary)',
  inventory: 'var(--error)',
  marketing: '#8b5cf6',
};

export function AISuggestion({ suggestion, onApply, onDismiss }: AISuggestionProps) {
  return (
    <motion.div
      variants={REVEAL_UP}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-lg)',
        backgroundColor: `${categoryColors[suggestion.category]}10`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
        <h4 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'var(--font-size-headline-sm)',
          fontWeight: 600,
          color: categoryColors[suggestion.category],
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
        }}>
          <Lightbulb size={18} />
          AI Suggestion
        </h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--on-surface-variant)',
          fontSize: 'var(--font-size-label-md)',
        }}>
          <Sparkles size={12} />
          <span>{suggestion.confidence}%</span>
        </div>
      </div>
      <p style={{
        color: 'var(--on-surface-variant)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--font-size-body-sm)',
        fontStyle: 'italic',
        lineHeight: 1.6,
      }}>
        "{suggestion.message}"
      </p>
      {suggestion.id !== 'default' && (
        <div style={{
          marginTop: 'var(--space-md)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--space-sm)',
        }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onApply}
            style={{
              padding: 'var(--space-xs) var(--space-md)',
              background: categoryColors[suggestion.category],
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              fontWeight: 600,
              fontSize: 'var(--font-size-body-sm)',
              cursor: 'pointer',
            }}
          >
            Apply
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDismiss}
            style={{
              padding: 'var(--space-xs) var(--space-md)',
              background: 'var(--surface-container)',
              color: 'var(--on-surface-variant)',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              fontWeight: 600,
              fontSize: 'var(--font-size-body-sm)',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}