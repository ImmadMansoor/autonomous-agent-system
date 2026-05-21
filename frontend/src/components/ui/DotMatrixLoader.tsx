'use client';

import type { CSSProperties } from 'react';

interface DotMatrixLoaderProps {
  size?: number;
  dotSize?: number;
  className?: string;
}

const MATRIX_SIZE = 5;
const CENTER = Math.floor(MATRIX_SIZE / 2);

export function DotMatrixLoader({
  size = 24,
  dotSize = 4,
  className = '',
}: DotMatrixLoaderProps) {
  const dots = Array.from({ length: MATRIX_SIZE * MATRIX_SIZE }, (_, index) => {
    const row = Math.floor(index / MATRIX_SIZE);
    const col = index % MATRIX_SIZE;
    const ring = Math.abs(row - CENTER) + Math.abs(col - CENTER);

    return (
      <span
        key={index}
        className="dot-matrix-loader-dot"
        style={{
          '--dot-ring': ring,
          '--dot-index': index,
        } as CSSProperties}
      />
    );
  });

  return (
    <span
      aria-label="Processing"
      className={`dot-matrix-loader ${className}`.trim()}
      role="status"
      style={{
        '--dml-size': `${size}px`,
        '--dml-dot-size': `${dotSize}px`,
        '--dml-gap': `${Math.max(2, Math.round(dotSize * 0.9))}px`,
      } as CSSProperties}
    >
      {dots}
    </span>
  );
}
