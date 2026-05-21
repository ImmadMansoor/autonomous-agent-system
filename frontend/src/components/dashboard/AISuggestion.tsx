'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Lightbulb, Sparkles } from 'lucide-react';
import { REVEAL_UP } from '@/lib/animations';
import { AISuggestion as AISuggestionType } from '@/data';
import { DotText } from '@/components/ui';

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
  agent: 'var(--primary)',
};

const getCategoryColor = (category: string) => categoryColors[category] || 'var(--primary)';

export function AISuggestion({ suggestion, onApply, onDismiss }: AISuggestionProps) {
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    setIsApplied(false);
  }, [suggestion.id, suggestion.message]);

  const handleApply = () => {
    if (isApplied) return;
    setIsApplied(true);
    window.setTimeout(() => onApply?.(), 650);
  };

  return (
    <motion.div
      variants={REVEAL_UP}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-lg)',
        backgroundImage: `linear-gradient(${getCategoryColor(suggestion.category)}08, ${getCategoryColor(suggestion.category)}08)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
        <h4 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'var(--font-size-headline-sm)',
          fontWeight: 600,
          color: getCategoryColor(suggestion.category),
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
          <DotText size="sm" style={{ color: 'var(--on-surface-variant)' }}>{suggestion.confidence}%</DotText>
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
            whileHover={isApplied ? undefined : { scale: 1.02 }}
            whileTap={isApplied ? undefined : { scale: 0.96 }}
            animate={isApplied ? { scale: [1, 1.08, 1], backgroundColor: '#0f8f70' } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16 }}
            onClick={handleApply}
            disabled={isApplied}
            style={{
              padding: 'var(--space-xs) var(--space-md)',
              background: getCategoryColor(suggestion.category),
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              fontWeight: 600,
              fontSize: 'var(--font-size-body-sm)',
              cursor: isApplied ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: '76px',
              justifyContent: 'center',
            }}
          >
            {isApplied ? <Check size={14} /> : null}
            {isApplied ? 'Applied' : 'Apply'}
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
