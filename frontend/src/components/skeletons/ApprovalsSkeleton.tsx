'use client';

import { Skeleton } from './Skeleton';

export function ApprovalsSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-lg)', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            background: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--outline-variant)',
            padding: 'var(--space-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--outline-variant)' }}>
            <div>
              <Skeleton height="24px" width="150px" style={{ marginBottom: 'var(--space-xs)' }} />
              <Skeleton height="16px" width="100px" />
            </div>
            <Skeleton height="36px" width="100px" borderRadius="var(--radius-lg)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  padding: 'var(--space-lg)',
                  background: 'var(--surface-container)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--outline-variant)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                  <Skeleton height="14px" width="80px" borderRadius="var(--radius-full)" />
                  <Skeleton height="14px" width="40px" />
                </div>
                <Skeleton height="20px" width="80%" style={{ marginBottom: 'var(--space-sm)' }} />
                <Skeleton height="16px" width="100%" style={{ marginBottom: 'var(--space-md)' }} />
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                  {[1, 2, 3].map((j) => (
                    <div key={j} style={{ flex: 1 }}>
                      <Skeleton height="12px" width="60%" style={{ marginBottom: '4px' }} />
                      <Skeleton height="8px" width="100%" />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <Skeleton height="36px" width="80px" borderRadius="var(--radius-lg)" />
                  <Skeleton height="36px" width="80px" borderRadius="var(--radius-lg)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <div
          style={{
            background: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--outline-variant)',
            padding: 'var(--space-lg)',
          }}
        >
          <Skeleton height="20px" width="140px" style={{ marginBottom: 'var(--space-md)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <Skeleton width="32px" height="32px" borderRadius="50%" />
                <div style={{ flex: 1 }}>
                  <Skeleton height="14px" width="80%" style={{ marginBottom: '4px' }} />
                  <Skeleton height="12px" width="60%" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton height="36px" width="100%" borderRadius="var(--radius-lg)" style={{ marginTop: 'var(--space-lg)' }} />
        </div>

        <div
          style={{
            background: 'var(--surface-container)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--outline-variant)',
            padding: 'var(--space-lg)',
          }}
        >
          <Skeleton height="20px" width="120px" style={{ marginBottom: 'var(--space-md)' }} />
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                <Skeleton height="14px" width="60%" />
                <Skeleton height="14px" width="30%" />
              </div>
              <Skeleton height="4px" width="100%" borderRadius="9999px" />
            </div>
          ))}
          <Skeleton height="60px" width="100%" borderRadius="var(--radius-lg)" />
        </div>

        <div
          style={{
            padding: 'var(--space-lg)',
            background: 'var(--primary)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}
        >
          <Skeleton width="40px" height="40px" borderRadius="50%" />
          <div>
            <Skeleton height="12px" width="100px" style={{ marginBottom: '4px' }} />
            <Skeleton height="16px" width="80px" />
          </div>
        </div>
      </div>
    </div>
  );
}