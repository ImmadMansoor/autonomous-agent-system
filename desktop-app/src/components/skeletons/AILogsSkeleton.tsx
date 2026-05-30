'use client';

import { Skeleton } from './Skeleton';

function AILogEntrySkeleton() {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <Skeleton height="28px" width="120px" borderRadius="var(--radius-sm)" />
          <Skeleton height="14px" width="70px" />
        </div>
        <Skeleton height="20px" width="20px" borderRadius="var(--radius-sm)" />
      </div>
      <Skeleton height="20px" width="75%" style={{ marginTop: 'var(--space-md)', marginBottom: 'var(--space-xs)' }} />
      <Skeleton height="16px" width="100%" style={{ marginBottom: 'var(--space-sm)' }} />
      <Skeleton height="16px" width="60%" style={{ marginBottom: 'var(--space-md)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <Skeleton height="4px" width="80px" borderRadius="9999px" />
        <Skeleton height="14px" width="100px" />
      </div>
    </div>
  );
}

export function AILogsSkeleton() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Skeleton height="16px" width="160px" style={{ marginBottom: 'var(--space-md)' }} />
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
            <Skeleton height="32px" width="260px" style={{ marginBottom: 'var(--space-xs)' }} />
            <Skeleton height="16px" width="280px" />
          </div>
          <Skeleton height="32px" width="90px" borderRadius="9999px" />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)',
          flexWrap: 'wrap',
        }}
      >
        <Skeleton height="40px" width="300px" borderRadius="var(--radius-xl)" style={{ flex: 1, maxWidth: '300px' }} />
        <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          {[60, 100, 90, 110, 120, 80].map((width, i) => (
            <Skeleton key={i} height="32px" width={`${width}px`} borderRadius="var(--radius-full)" />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <AILogEntrySkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
