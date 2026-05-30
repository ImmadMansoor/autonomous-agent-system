'use client';

import { Skeleton } from './Skeleton';

export function MetricsTickerSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 'var(--space-gutter)',
    }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}
        >
          <Skeleton width="40px" height="40px" borderRadius="var(--radius-xl)" />
          <div style={{ flex: 1 }}>
            <Skeleton height="12px" width="50%" style={{ marginBottom: '4px' }} />
            <Skeleton height="20px" width="80%" />
          </div>
        </div>
      ))}
    </div>
  );
}