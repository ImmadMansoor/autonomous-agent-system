'use client';

import { motion } from 'framer-motion';
import { Globe, Cloud, MessageSquare, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, COLORS } from '@/lib/constants';
import { HOVER_CARD } from '@/lib/animations';

interface SignalCardProps {
  id: string;
  source: 'web' | 'weather' | 'sms' | 'pos' | 'inventory';
  sourceLabel: string;
  timestamp: string;
  title: string;
  description: string;
  status: 'parsed' | 'review' | 'automated';
  isSelected?: boolean;
  onSelect?: () => void;
}

const iconMap = {
  web: Globe,
  weather: Cloud,
  sms: MessageSquare,
  pos: Package,
  inventory: Package,
};

const statusConfig = {
  parsed: { color: '#10b981', label: 'AI Parsed', dotColor: '#10b981' },
  review: { color: '#f59e0b', label: 'Needs Review', dotColor: '#f59e0b' },
  automated: { color: '#10b981', label: 'Automated', dotColor: '#10b981' },
};

export function SignalCard({
  id,
  source,
  sourceLabel,
  timestamp,
  title,
  description,
  status,
  isSelected = false,
  onSelect,
}: SignalCardProps) {
  // Safe fallbacks to prevent undefined icon or status styles rendering crashes.
  const Icon = iconMap[source] || Globe;
  const statusStyle = statusConfig[status] || statusConfig.parsed;
  
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };
  
  return (
    <motion.div
      {...HOVER_CARD}
      onClick={handleClick}
      className="signal-card"
      style={{
        borderRadius: RADIUS.XL,
        padding: SPACING.LG,
        background: isSelected 
          ? 'rgba(0, 131, 120, 0.08)' 
          : 'rgba(255, 255, 255, 0.5)',
        border: isSelected
          ? `2px solid ${COLORS.PRIMARY}`
          : `1px solid ${COLORS.OUTLINE_VARIANT}`,
        cursor: 'pointer',
        boxShadow: isSelected ? 'var(--shadow-card)' : 'none',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.XS,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.SM }}>
          <Icon 
            size={20} 
            color={isSelected ? COLORS.PRIMARY : COLORS.ON_SURFACE_VARIANT}
            style={isSelected ? { fontVariationSettings: "'FILL' 1" } : {}}
          />
          <span style={{
            fontFamily: TYPOGRAPHY.FONT_LABEL,
            fontSize: FONT_SIZES.LABEL_MD,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: isSelected ? COLORS.PRIMARY : COLORS.ON_SURFACE_VARIANT,
          }}>
            {sourceLabel}
          </span>
        </div>
        <span style={{
          fontFamily: TYPOGRAPHY.FONT_LABEL,
          fontSize: FONT_SIZES.LABEL_MD,
          color: COLORS.ON_SURFACE_VARIANT,
        }}>
          {timestamp}
        </span>
      </div>
      
      <h4 style={{
        fontFamily: TYPOGRAPHY.FONT_HEADLINE,
        fontSize: FONT_SIZES.HEADLINE_SM,
        fontWeight: 600,
        color: COLORS.ON_SURFACE,
        marginBottom: SPACING.XS,
        lineHeight: 1.3,
      }}>
        {title}
      </h4>
      
      <p style={{
        fontFamily: TYPOGRAPHY.FONT_BODY,
        fontSize: FONT_SIZES.BODY_SM,
        color: COLORS.ON_SURFACE_VARIANT,
        marginBottom: SPACING.SM,
        lineHeight: 1.5,
      }}>
        {description}
      </p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.XS }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: statusStyle.dotColor,
        }} />
        <span style={{
          fontFamily: TYPOGRAPHY.FONT_LABEL,
          fontSize: FONT_SIZES.LABEL_MD,
          fontWeight: 700,
          textTransform: 'uppercase',
          color: statusStyle.color,
        }}>
          {statusStyle.label}
        </span>
      </div>
    </motion.div>
  );
}
