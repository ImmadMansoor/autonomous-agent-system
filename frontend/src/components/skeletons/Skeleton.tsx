'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', className, style }: SkeletonProps) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
      className={className}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-lg)',
        ...(className as React.CSSProperties),
      }}
    >
      <Skeleton height="16px" width="40%" style={{ marginBottom: '12px' }} />
      <Skeleton height="24px" width="80%" style={{ marginBottom: '8px' }} />
      <Skeleton height="16px" width="60%" />
    </div>
  );
}