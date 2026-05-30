'use client';

import { motion } from 'framer-motion';
import { Sparkles, Bolt } from 'lucide-react';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, SHADOWS } from '@/lib/constants';
import { REVEAL_UP, BUTTON_ANIMATION } from '@/lib/animations';
import { useToast } from '@/components/layout/Toast';

interface AIInsightCardProps {
  id: string;
  title: string;
  description: string;
  insightType: string;
  actionLabel?: string;
  onExecute: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function AIInsightCard({ 
  id, 
  title, 
  description, 
  insightType, 
  actionLabel, 
  onExecute, 
  onDismiss 
}: AIInsightCardProps) {
  const { showToast } = useToast();

  const handleExecute = () => {
    onExecute(id);
    showToast('success', 'Action Executed', actionLabel || 'AI recommendation applied');
  };

  const handleDismiss = () => {
    onDismiss(id);
    showToast('info', 'Insight Dismissed', 'AI insight has been dismissed');
  };

  return (
    <motion.div
      variants={REVEAL_UP}
      initial="hidden"
      animate="visible"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 98, 141, 0.2)',
        borderRadius: RADIUS.XL,
        padding: SPACING.LG,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: SHADOWS.CARD,
        height: '100%',
      }}
    >
      <div style={{
        position: 'absolute',
        top: SPACING.MD,
        right: SPACING.MD,
      }}>
        <Sparkles 
          size={48} 
          color={COLORS.TERTIARY} 
          style={{ opacity: 0.2, fontVariationSettings: "'FILL' 1" }} 
        />
      </div>
      
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.SM,
          marginBottom: SPACING.SM,
        }}>
          <span style={{
            padding: `${SPACING.XS} ${SPACING.SM}`,
            background: `${COLORS.TERTIARY}10`,
            color: COLORS.TERTIARY,
            borderRadius: RADIUS.FULL,
            fontFamily: TYPOGRAPHY.FONT_LABEL,
            fontSize: FONT_SIZES.LABEL_MD,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            AI Insight
          </span>
          <span style={{
            fontFamily: TYPOGRAPHY.FONT_LABEL,
            fontSize: FONT_SIZES.LABEL_MD,
            color: COLORS.ON_SURFACE_VARIANT,
            textDecoration: 'underline',
          }}>
            {insightType}
          </span>
        </div>
        
        <h2 style={{
          fontFamily: TYPOGRAPHY.FONT_HEADLINE,
          fontSize: FONT_SIZES.HEADLINE_MD,
          fontWeight: 600,
          color: COLORS.ON_SURFACE,
          marginBottom: SPACING.MD,
        }}>
          {title}
        </h2>
        
        <p style={{
          fontFamily: TYPOGRAPHY.FONT_BODY,
          fontSize: FONT_SIZES.BODY_MD,
          color: COLORS.ON_SURFACE_VARIANT,
          maxWidth: '400px',
        }}>
          {description}
        </p>
      </div>
      
      <div style={{
        marginTop: SPACING.XL,
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.MD,
      }}>
        <motion.button
          {...BUTTON_ANIMATION}
          onClick={handleExecute}
          style={{
            background: COLORS.PRIMARY,
            color: COLORS.ON_PRIMARY,
            padding: `${SPACING.SM} ${SPACING.LG}`,
            borderRadius: RADIUS.LG,
            border: 'none',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.SM,
            cursor: 'pointer',
            boxShadow: SHADOWS.CARD,
          }}
        >
          <Bolt size={18} style={{ fontVariationSettings: "'FILL' 1" }} />
          {actionLabel}
        </motion.button>
        
        <button 
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: TYPOGRAPHY.FONT_LABEL,
            fontSize: FONT_SIZES.LABEL_MD,
            color: COLORS.ON_SURFACE_VARIANT,
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
        onMouseEnter={(e) => e.currentTarget.style.color = COLORS.ON_SURFACE}
        onMouseLeave={(e) => e.currentTarget.style.color = COLORS.ON_SURFACE_VARIANT}
        >
          Dismiss Suggestion
        </button>
      </div>
    </motion.div>
  );
}