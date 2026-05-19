'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface InlineLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function InlineLoader({ size = 'md', text }: InlineLoaderProps) {
  const sizes = {
    sm: { icon: 20, container: 32 },
    md: { icon: 28, container: 48 },
    lg: { icon: 36, container: 64 },
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '24px',
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        style={{
          width: sizes[size].container,
          height: sizes[size].container,
          background: 'var(--primary-container)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Brain size={sizes[size].icon} color="var(--on-primary-container)" style={{ fontVariationSettings: "'FILL' 1" }} />
      </motion.div>
      {text && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--on-surface-variant)',
        }}>
          {text}
        </p>
      )}
    </div>
  );
}