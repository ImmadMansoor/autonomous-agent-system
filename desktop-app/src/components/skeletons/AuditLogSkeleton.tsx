'use client';

import { Skeleton } from './Skeleton';

function AuditLogEntrySkeleton() {
  return (
    <div
      style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--outline-variant)',
        padding: 'var(--space-lg)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <Skeleton height="28px" width="100px" borderRadius="var(--radius-sm)" />
          <Skeleton height="28px" width="72px" borderRadius="var(--radius-sm)" />
        </div>
        <Skeleton height="14px" width="80px" />
      </div>
      <Skeleton height="20px" width="70%" style={{ marginBottom: 'var(--space-xs)' }} />
      <Skeleton height="16px" width="100%" style={{ marginBottom: 'var(--space-sm)' }} />
      <Skeleton height="16px" width="85%" style={{ marginBottom: 'var(--space-md)' }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          paddingTop: 'var(--space-sm)',
          borderTop: '1px solid var(--outline-variant)',
        }}
      >
        <Skeleton height="14px" width="100px" />
        <Skeleton height="14px" width="120px" />
      </div>
    </div>
  );
}

export function AuditLogSkeleton() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Skeleton height="16px" width="140px" style={{ marginBottom: 'var(--space-md)' }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
          }}
        >
          <div>
            <Skeleton height="32px" width="280px" style={{ marginBottom: 'var(--space-xs)' }} />
            <Skeleton height="16px" width="220px" />
          </div>
          <Skeleton height="32px" width="90px" borderRadius="9999px" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        {[80, 100, 100].map((width, i) => (
          <Skeleton key={i} height="32px" width={`${width}px`} borderRadius="var(--radius-full)" />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <AuditLogEntrySkeleton key={i} />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-md)',
          marginTop: 'var(--space-xl)',
        }}
      >
        <Skeleton height="40px" width="110px" borderRadius="var(--radius-lg)" />
        <Skeleton height="16px" width="100px" />
        <Skeleton height="40px" width="90px" borderRadius="var(--radius-lg)" />
      </div>
    </div>
  );
}
