'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

interface RippleButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export function RippleButton({ 
  children, 
  onClick, 
  style, 
  variant = 'primary',
  fullWidth = false 
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    onClick?.(e);
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--primary)',
      color: 'var(--on-primary)',
      border: 'none',
    },
    secondary: {
      background: 'var(--surface-container)',
      color: 'var(--on-surface)',
      border: '1px solid var(--outline-variant)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--on-surface)',
      border: '1px solid var(--outline-variant)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--on-surface)',
      border: 'none',
    },
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      style={{
        ...variantStyles[variant],
        ...style,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-sm) var(--space-lg)',
        fontFamily: 'var(--font-label)',
        fontSize: 'var(--font-size-label-md)',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-sm)',
      }}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'white',
            pointerEvents: 'none',
            left: ripple.x - 50,
            top: ripple.y - 50,
          }}
        />
      ))}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>{children}</span>
    </motion.button>
  );
}