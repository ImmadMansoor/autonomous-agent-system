'use client';

import { Skeleton } from './Skeleton';

export function NeedsAttentionSkeleton() {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid #0EA5E9',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: 'var(--space-lg)',
          background: 'var(--surface-container-high)',
          borderBottom: '1px solid var(--outline-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <Skeleton width="18px" height="18px" />
          <Skeleton height="20px" width="140px" />
        </div>
        <Skeleton height="24px" width="32px" borderRadius="9999px" />
      </div>

      <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: 'var(--space-md)',
              background: 'var(--surface-bright)',
              border: '1px solid var(--outline-variant)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
              <Skeleton height="14px" width="100px" />
              <Skeleton width="18px" height="18px" borderRadius="50%" />
            </div>
            <Skeleton height="16px" width="80%" style={{ marginBottom: 'var(--space-xs)' }} />
            <Skeleton height="14px" width="100%" style={{ marginBottom: 'var(--space-md)' }} />
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <Skeleton height="32px" width="60px" borderRadius="var(--radius-lg)" style={{ flex: 1 }} />
              <Skeleton height="32px" width="60px" borderRadius="var(--radius-lg)" style={{ flex: 1 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}