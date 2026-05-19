'use client';

import { motion } from 'framer-motion';
import { DollarSign, Package, Lightbulb } from 'lucide-react';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, SHADOWS } from '@/lib/constants';
import { REVEAL_UP, STAGGER_CONTAINER } from '@/lib/animations';
import { LiveSignal } from '@/hooks/useInventoryData';

interface LiveSignalsFeedProps {
  signals: LiveSignal[];
  onMarkRead?: (id: string) => void;
}

const iconMap = {
  price: DollarSign,
  inventory: Package,
  marketing: Lightbulb,
};

const colorMap = {
  price: { bg: `${COLORS.PRIMARY}10`, color: COLORS.PRIMARY },
  inventory: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706' },
  marketing: { bg: `${COLORS.TERTIARY}10`, color: COLORS.TERTIARY },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  return `${Math.floor(diffMinutes / 60)}h ago`;
}

export function LiveSignalsFeed({ signals, onMarkRead }: LiveSignalsFeedProps) {
  const handleSignalClick = (id: string) => {
    if (onMarkRead) {
      onMarkRead(id);
    }
  };

  return (
    <motion.div
      variants={REVEAL_UP}
      initial="hidden"
      animate="visible"
      style={{
        background: COLORS.SURFACE_CONTAINER_LOWEST,
        border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
        borderRadius: RADIUS.XL,
        padding: SPACING.LG,
        flex: 1,
        boxShadow: SHADOWS.CARD,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.LG }}>
        <h3 style={{
          fontFamily: TYPOGRAPHY.FONT_HEADLINE,
          fontSize: FONT_SIZES.HEADLINE_SM,
          fontWeight: 600,
          color: COLORS.ON_SURFACE,
        }}>
          Live Signals
        </h3>
        {signals.some(s => s.isNew) && (
          <span style={{
            background: COLORS.PRIMARY,
            color: COLORS.ON_PRIMARY,
            padding: `2px ${SPACING.SM}`,
            borderRadius: RADIUS.FULL,
            fontSize: '10px',
            fontWeight: 700,
          }}>
            {signals.filter(s => s.isNew).length} New
          </span>
        )}
      </div>
      
      <motion.div
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACING.MD,
          overflowY: 'auto',
          maxHeight: '400px',
        }}
      >
        {signals.map((signal) => {
          const Icon = iconMap[signal.type] || Package;
          const colors = colorMap[signal.type] || { bg: COLORS.SURFACE_CONTAINER_HIGH, color: COLORS.ON_SURFACE_VARIANT };
          
          return (
            <motion.div
              key={signal.id}
              variants={REVEAL_UP}
              onClick={() => handleSignalClick(signal.id)}
              whileHover={{ backgroundColor: COLORS.SURFACE_CONTAINER_LOW }}
              style={{
                display: 'flex',
                gap: SPACING.MD,
                alignItems: 'flex-start',
                padding: SPACING.SM,
                borderRadius: RADIUS.LG,
                cursor: 'pointer',
                background: signal.isNew ? `${COLORS.PRIMARY}05` : 'transparent',
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: colors.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} color={colors.color} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.XS }}>
                  <span style={{
                    fontWeight: 600,
                    fontSize: FONT_SIZES.BODY_SM,
                    color: COLORS.ON_SURFACE,
                  }}>
                    {signal.title}
                  </span>
                  {signal.isNew && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: COLORS.PRIMARY,
                    }} />
                  )}
                </div>
                <span style={{
                  fontFamily: TYPOGRAPHY.FONT_LABEL,
                  fontSize: FONT_SIZES.LABEL_MD,
                  color: COLORS.ON_SURFACE_VARIANT,
                }}>
                  {signal.description}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: COLORS.OUTLINE,
                  marginTop: SPACING.XS,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}>
                  {formatTimeAgo(signal.timestamp)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}