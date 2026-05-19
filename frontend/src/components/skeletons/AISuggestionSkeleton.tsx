'use client';

import { Skeleton } from './Skeleton';

export function AISuggestionSkeleton() {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <Skeleton width="18px" height="18px" />
          <Skeleton height="20px" width="120px" />
        </div>
        <Skeleton height="16px" width="50px" />
      </div>
      <Skeleton height="40px" width="100%" borderRadius="var(--radius-md)" style={{ marginBottom: 'var(--space-md)' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
        <Skeleton height="32px" width="70px" borderRadius="var(--radius-lg)" />
        <Skeleton height="32px" width="70px" borderRadius="var(--radius-lg)" />
      </div>
    </div>
  );
}