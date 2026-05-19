'use client';

import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import { SignalCard } from './SignalCard';
import { SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, COLORS, SHADOWS, GLASS } from '@/lib/constants';
import { REVEAL_UP, STAGGER_CONTAINER } from '@/lib/animations';
import { Signal } from '@/hooks/useAnalyticsData';

interface SignalsFeedProps {
  signals: Signal[];
  selectedSignalId: string | null;
  onSelectSignal: (id: string) => void;
  newSignalsCount: number;
}

export function SignalsFeed({ signals, selectedSignalId, onSelectSignal, newSignalsCount }: SignalsFeedProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <motion.div
      variants={REVEAL_UP}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: SPACING.XS,
        paddingRight: SPACING.XS,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.SM }}>
          <Radio size={24} color={COLORS.PRIMARY} />
          <h3 style={{
            fontFamily: TYPOGRAPHY.FONT_HEADLINE,
            fontSize: FONT_SIZES.HEADLINE_SM,
            fontWeight: 600,
            color: COLORS.ON_SURFACE,
          }}>
            Ingested Signals
          </h3>
        </div>
        <span style={{
          padding: `${SPACING.XS} ${SPACING.MD}`,
          background: `${COLORS.PRIMARY}10`,
          color: COLORS.PRIMARY,
          borderRadius: RADIUS.FULL,
          fontFamily: TYPOGRAPHY.FONT_LABEL,
          fontSize: FONT_SIZES.LABEL_MD,
          border: `${COLORS.PRIMARY}20`,
        }}>
          {newSignalsCount} New Today
        </span>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.MD,
        flex: 1,
      }}>
        <motion.div
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}
        >
          {signals.map((signal) => (
            <SignalCard
              key={signal.id}
              id={signal.id}
              source={signal.source}
              sourceLabel={signal.sourceLabel}
              timestamp={formatTime(signal.timestamp)}
              title={signal.title}
              description={signal.description}
              status={signal.status}
              isSelected={signal.id === selectedSignalId}
              onSelect={() => onSelectSignal(signal.id)}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}