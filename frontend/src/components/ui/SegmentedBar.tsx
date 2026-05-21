'use client';

import type { CSSProperties } from 'react';

interface SegmentedBarProps {
  value: number;
  segments?: number;
  fillColor?: string;
  emptyColor?: string;
  height?: number;
  style?: CSSProperties;
}

/** Nothing OS-style discrete segment progress bar. */
export function SegmentedBar({
  value,
  segments = 24,
  fillColor = 'var(--nothing-accent, #e85d04)',
  emptyColor = 'var(--outline-variant)',
  height = 8,
  style,
}: SegmentedBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const filled = Math.round((clamped / 100) * segments);

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        display: 'flex',
        gap: '2px',
        width: '100%',
        ...style,
      }}
    >
      {Array.from({ length: segments }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height,
            background: i < filled ? fillColor : emptyColor,
            borderRadius: 0,
            minWidth: 0,
          }}
        />
      ))}
    </div>
  );
}
