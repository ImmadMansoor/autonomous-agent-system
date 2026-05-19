'use client';

import { Skeleton } from './Skeleton';

export function ActiveReasoningSkeleton() {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: 'var(--space-lg)',
          borderBottom: '1px solid var(--outline-variant)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface-bright)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <Skeleton width="18px" height="18px" />
          <Skeleton height="20px" width="150px" />
        </div>
        <Skeleton height="32px" width="80px" borderRadius="var(--radius-lg)" />
      </div>

      <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              padding: 'var(--space-md)',
              background: 'var(--surface-container-low)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--outline-variant)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
              <Skeleton height="14px" width="80px" borderRadius="var(--radius-full)" />
              <Skeleton height="14px" width="60px" />
            </div>
            <Skeleton height="18px" width="80%" style={{ marginBottom: 'var(--space-xs)' }} />
            <Skeleton height="14px" width="100%" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-sm)' }}>
              <Skeleton height="20px" width="50px" borderRadius="var(--radius-full)" />
              <Skeleton height="14px" width="40px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}