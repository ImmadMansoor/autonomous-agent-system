'use client';

import { Skeleton } from './Skeleton';

export function SignalInputSkeleton() {
  return (
    <div
      style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        border: '1px solid var(--tertiary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <Skeleton width="18px" height="18px" />
        <Skeleton height="20px" width="140px" />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <Skeleton height="44px" width="100%" borderRadius="var(--radius-md)" style={{ flex: 1 }} />
        <Skeleton height="44px" width="48px" borderRadius="var(--radius-md)" />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            height="28px"
            width="70px"
            borderRadius="var(--radius-full)"
          />
        ))}
      </div>
    </div>
  );
}