'use client';

import type { CSSProperties, ElementType, ReactNode } from 'react';

export type DotTextSize = 'sm' | 'md' | 'lg' | 'xl' | 'display';

const sizeStyles: Record<DotTextSize, CSSProperties> = {
  sm: {
    fontSize: '14px',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  md: {
    fontSize: '24px',
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  lg: {
    fontSize: '36px',
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  xl: {
    fontSize: '48px',
    letterSpacing: '-0.04em',
    lineHeight: 0.95,
  },
  display: {
    fontSize: 'clamp(40px, 6vw, 72px)',
    letterSpacing: '-0.04em',
    lineHeight: 0.9,
  },
};

interface DotTextProps {
  children: ReactNode;
  size?: DotTextSize;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  uppercase?: boolean;
}

/** Nothing-style dot-matrix display type (Google Font: Doto). */
export function DotText({
  children,
  size = 'md',
  className = '',
  style,
  as: Tag = 'span',
  uppercase = false,
}: DotTextProps) {
  return (
    <Tag
      className={`font-dot ${className}`.trim()}
      style={{
        ...sizeStyles[size],
        fontWeight: 700,
        fontFamily: 'var(--font-dot)',
        fontVariationSettings: "'ROND' 0",
        color: 'var(--text-display, var(--on-surface))',
        textTransform: uppercase ? 'uppercase' : undefined,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/** Colon made of two stacked dots (Nothing clock style). */
export function DotColon({ style }: { style?: CSSProperties }) {
  return (
    <span
      className="font-dot-dot-colon"
      aria-hidden
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        margin: '0 0.08em',
        verticalAlign: 'middle',
        ...style,
      }}
    >
      <span />
      <span />
    </span>
  );
}
