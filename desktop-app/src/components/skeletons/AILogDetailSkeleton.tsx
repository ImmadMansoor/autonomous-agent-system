'use client';

import { Skeleton } from './Skeleton';

export function AILogDetailSkeleton() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Skeleton height="16px" width="140px" style={{ marginBottom: 'var(--space-lg)' }} />

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <Skeleton height="36px" width="140px" borderRadius="var(--radius-lg)" />
          <Skeleton height="16px" width="100px" />
        </div>
        <Skeleton height="28px" width="80%" style={{ marginBottom: 'var(--space-md)' }} />
        <Skeleton height="16px" width="100%" style={{ marginBottom: 'var(--space-sm)' }} />
        <Skeleton height="16px" width="90%" style={{ marginBottom: 'var(--space-lg)' }} />
        <Skeleton height="56px" width="100%" borderRadius="var(--radius-lg)" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid #E2E8F0',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-lg)',
            }}
          >
            <Skeleton height="20px" width="100px" style={{ marginBottom: 'var(--space-md)' }} />
            <Skeleton height="14px" width="100%" style={{ marginBottom: 'var(--space-sm)' }} />
            <Skeleton height="14px" width="80%" />
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <Skeleton height="20px" width="140px" style={{ marginBottom: 'var(--space-md)' }} />
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          {[100, 120, 90].map((width, i) => (
            <Skeleton key={i} height="32px" width={`${width}px`} borderRadius="var(--radius-full)" />
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <Skeleton height="20px" width="100px" style={{ marginBottom: 'var(--space-md)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-md)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="72px" width="100%" borderRadius="var(--radius-lg)" />
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-lg)',
        }}
      >
        <Skeleton height="20px" width="140px" style={{ marginBottom: 'var(--space-md)' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <Skeleton height="32px" width="32px" borderRadius="50%" />
            <div style={{ flex: 1 }}>
              <Skeleton height="14px" width="40%" style={{ marginBottom: 'var(--space-xs)' }} />
              <Skeleton height="14px" width="90%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
