'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, SHADOWS } from '@/lib/constants';
import { REVEAL_UP } from '@/lib/animations';
import { TrendMetric, TrendDataPoint, TimePeriod } from '@/hooks/useInventoryData';

interface OperationalTrendChartProps {
  trendData: TrendDataPoint[];
  trendMetrics: TrendMetric[];
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
}

function getHeightPercentage(value: number): string {
  return `${value}%`;
}

export function OperationalTrendChart({ 
  trendData, 
  trendMetrics, 
  timePeriod, 
  onTimePeriodChange 
}: OperationalTrendChartProps) {
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
        boxShadow: SHADOWS.CARD,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.LG,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.MD }}>
          <TrendingUp size={24} color={COLORS.PRIMARY} />
          <h3 style={{
            fontFamily: TYPOGRAPHY.FONT_HEADLINE,
            fontSize: FONT_SIZES.HEADLINE_SM,
            fontWeight: 600,
            color: COLORS.ON_SURFACE,
          }}>
            Operational Trend Analysis
          </h3>
        </div>
        
        <select 
          value={timePeriod}
          onChange={(e) => onTimePeriodChange(e.target.value as TimePeriod)}
          style={{
            background: COLORS.SURFACE_CONTAINER,
            border: 'none',
            borderRadius: RADIUS.LG,
            fontFamily: TYPOGRAPHY.FONT_LABEL,
            fontSize: FONT_SIZES.LABEL_MD,
            padding: `${SPACING.XS} ${SPACING.SM}`,
            paddingRight: SPACING.LG,
            color: COLORS.ON_SURFACE,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>
      
      {/* Visual Bar Chart */}
      <div style={{
        height: '256px',
        width: '100%',
        background: COLORS.SURFACE_CONTAINER_LOW,
        borderRadius: RADIUS.XL,
        padding: SPACING.MD,
        display: 'flex',
        alignItems: 'flex-end',
        gap: SPACING.SM,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid lines */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: SPACING.MD,
        }}>
          <div style={{ borderTop: `1px solid ${COLORS.OUTLINE_VARIANT}`, width: '100%', height: 0 }} />
          <div style={{ borderTop: `1px solid ${COLORS.OUTLINE_VARIANT}`, width: '100%', height: 0 }} />
          <div style={{ borderTop: `1px solid ${COLORS.OUTLINE_VARIANT}`, width: '100%', height: 0 }} />
          <div style={{ borderTop: `1px solid ${COLORS.OUTLINE_VARIANT}`, width: '100%', height: 0 }} />
        </div>
        
        {/* Bars */}
        {trendData.map((item, index) => {
          const isLast = index === trendData.length - 1;
          return (
            <motion.div
              key={item.name}
              initial={{ height: 0 }}
              animate={{ height: getHeightPercentage(item.value) }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{
                flex: 1,
                background: isLast ? COLORS.PRIMARY : `${COLORS.PRIMARY}${isLast ? '' : '80'}`,
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                position: 'relative',
                zIndex: 10,
              }}
            />
          );
        })}
      </div>
      
      {/* Metrics */}
      <div style={{
        marginTop: SPACING.LG,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: SPACING.MD,
      }}>
        {trendMetrics.map((metric, index) => (
          <div key={index} style={{
            padding: SPACING.MD,
            background: COLORS.SURFACE_CONTAINER_HIGH,
            borderRadius: RADIUS.XL,
          }}>
            <span style={{
              fontFamily: TYPOGRAPHY.FONT_LABEL,
              fontSize: FONT_SIZES.LABEL_MD,
              color: COLORS.ON_SURFACE_VARIANT,
              display: 'block',
              marginBottom: SPACING.XS,
            }}>
              {metric.label}
            </span>
            <span style={{
              fontFamily: TYPOGRAPHY.FONT_HEADLINE,
              fontSize: FONT_SIZES.HEADLINE_SM,
              fontWeight: 600,
              color: COLORS.ON_SURFACE,
            }}>
              {metric.value}
            </span>
            <span style={{
              fontFamily: TYPOGRAPHY.FONT_LABEL,
              fontSize: FONT_SIZES.LABEL_MD,
              fontWeight: 600,
              display: 'block',
              color: metric.isPositive ? '#059669' : (metric.change === 'Stable' ? COLORS.PRIMARY : COLORS.ERROR),
            }}>
              {metric.change}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}