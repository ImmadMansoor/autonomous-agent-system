'use client';

import { Skeleton } from './Skeleton';
import { SPACING, RADIUS } from '@/lib/constants';

export function InventorySkeleton() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: SPACING.XL }}>
        <div style={{ gridColumn: 'span 2' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid #E2E8F0',
              borderRadius: RADIUS.XL,
              padding: SPACING.LG,
              height: '280px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.SM, marginBottom: SPACING.LG }}>
              <Skeleton height="24px" width="80px" borderRadius={RADIUS.FULL} />
              <Skeleton height="16px" width="100px" />
            </div>
            <Skeleton height="32px" width="70%" style={{ marginBottom: SPACING.MD }} />
            <Skeleton height="20px" width="90%" style={{ marginBottom: SPACING.SM }} />
            <Skeleton height="20px" width="60%" />
            <div style={{ marginTop: SPACING.XL, display: 'flex', gap: SPACING.MD }}>
              <Skeleton height="40px" width="180px" borderRadius={RADIUS.LG} />
              <Skeleton height="20px" width="120px" />
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid #E2E8F0',
            borderRadius: RADIUS.XL,
            padding: SPACING.LG,
            height: '280px',
          }}
        >
          <Skeleton height="24px" width="60%" style={{ marginBottom: SPACING.LG }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="48px" width="100%" borderRadius={RADIUS.LG} style={{ marginBottom: SPACING.MD }} />
          ))}
        </div>
      </section>

      <section
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #E2E8F0',
          borderRadius: RADIUS.XL,
          padding: SPACING.LG,
          marginTop: '32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.LG }}>
          <Skeleton height="28px" width="200px" />
          <div style={{ display: 'flex', gap: SPACING.MD }}>
            <Skeleton height="40px" width="200px" borderRadius={RADIUS.LG} />
            <Skeleton height="40px" width="120px" borderRadius={RADIUS.LG} />
            <Skeleton height="40px" width="100px" borderRadius={RADIUS.LG} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: SPACING.MD }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="20px" width="100%" />
          ))}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={`row-${i}`}
              style={{
                gridColumn: 'span 4',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: SPACING.MD,
                padding: `${SPACING.MD} 0`,
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <Skeleton height="60px" width="100%" borderRadius={RADIUS.LG} />
              <Skeleton height="20px" width="100%" />
              <Skeleton height="20px" width="80%" />
              <Skeleton height="32px" width="100%" borderRadius={RADIUS.LG} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: SPACING.SM, marginTop: SPACING.LG }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="36px" width="36px" borderRadius={RADIUS.LG} />
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: SPACING.XL, marginTop: '32px' }}>
        <div style={{ gridColumn: 'span 8' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid #E2E8F0',
              borderRadius: RADIUS.XL,
              padding: SPACING.LG,
              height: '300px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: SPACING.LG }}>
              <Skeleton height="24px" width="180px" />
              <Skeleton height="32px" width="120px" borderRadius={RADIUS.LG} />
            </div>
            <div style={{ display: 'flex', gap: SPACING.XL, marginBottom: SPACING.LG }}>
              <Skeleton height="40px" width="80px" />
              <Skeleton height="40px" width="80px" />
              <Skeleton height="40px" width="80px" />
            </div>
            <Skeleton height="160px" width="100%" borderRadius={RADIUS.LG} />
          </div>
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid #E2E8F0',
              borderRadius: RADIUS.XL,
              padding: SPACING.LG,
              height: '300px',
            }}
          >
            <Skeleton height="24px" width="60%" style={{ marginBottom: SPACING.LG }} />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height="48px" width="100%" borderRadius={RADIUS.LG} style={{ marginBottom: SPACING.MD }} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
