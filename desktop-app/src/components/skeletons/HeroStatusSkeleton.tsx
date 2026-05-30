'use client';

import { Skeleton } from './Skeleton';

export function HeroStatusSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: 'var(--space-gutter)',
    }}>
      <div style={{
        gridColumn: 'span 8',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '180px',
      }}>
        <div>
          <Skeleton height="12px" width="100px" style={{ marginBottom: 'var(--space-xs)' }} />
          <Skeleton height="28px" width="80%" style={{ marginBottom: 'var(--space-md)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
            <Skeleton height="24px" width="120px" borderRadius="9999px" />
            <Skeleton height="14px" width="160px" />
          </div>
        </div>
        <div>
          <Skeleton height="14px" width="180px" style={{ marginBottom: 'var(--space-sm)' }} />
          <Skeleton height="6px" width="100%" borderRadius="9999px" />
        </div>
      </div>

      <div style={{
        gridColumn: 'span 4',
        background: 'var(--surface-container)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '180px',
      }}>
        <Skeleton height="12px" width="100px" style={{ marginBottom: 'var(--space-xs)' }} />
        <Skeleton height="20px" width="80%" style={{ marginBottom: 'var(--space-md)' }} />
        <Skeleton height="16px" width="90%" style={{ marginBottom: 'var(--space-lg)' }} />
        <Skeleton height="36px" width="140px" borderRadius="var(--radius-xl)" />
      </div>
    </div>
  );
}