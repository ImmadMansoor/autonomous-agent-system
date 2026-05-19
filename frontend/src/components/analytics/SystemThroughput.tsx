'use client';

import { motion } from 'framer-motion';
import { REVEAL_UP } from '@/lib/animations';
import { SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, COLORS, SHADOWS } from '@/lib/constants';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { ThroughputDataPoint } from '@/hooks/useAnalyticsData';

interface SystemThroughputProps {
  data: ThroughputDataPoint[];
}

const defaultData: ThroughputDataPoint[] = [
  { time: '00:00', signals: 150, aiActions: 180 },
  { time: '06:00', signals: 80, aiActions: 140 },
  { time: '12:00', signals: 120, aiActions: 160 },
  { time: '18:00', signals: 60, aiActions: 120 },
  { time: 'NOW', signals: 40, aiActions: 100 },
];

export function SystemThroughput({ data = defaultData }: SystemThroughputProps) {
  return (
    <motion.section
      variants={REVEAL_UP}
      initial="hidden"
      animate="visible"
      className="glass-card"
      style={{
        borderRadius: RADIUS.XL,
        padding: SPACING.LG,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid #E2E8F0',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.LG,
      }}>
        <div>
          <p style={{
            fontFamily: TYPOGRAPHY.FONT_LABEL,
            fontSize: FONT_SIZES.LABEL_MD,
            color: COLORS.PRIMARY,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: SPACING.XS,
          }}>
            Live Monitoring
          </p>
          <h3 style={{
            fontFamily: TYPOGRAPHY.FONT_HEADLINE,
            fontSize: FONT_SIZES.HEADLINE_MD,
            fontWeight: 600,
            color: COLORS.ON_SURFACE,
          }}>
            System Throughput
          </h3>
          <p style={{
            fontFamily: TYPOGRAPHY.FONT_BODY,
            fontSize: FONT_SIZES.BODY_SM,
            color: COLORS.ON_SURFACE_VARIANT,
          }}>
            Signal volume vs. Automated actions (Last 24h)
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.MD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.XS }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: COLORS.PRIMARY,
            }} />
            <span style={{
              fontFamily: TYPOGRAPHY.FONT_LABEL,
              fontSize: FONT_SIZES.LABEL_MD,
              color: COLORS.ON_SURFACE_VARIANT,
            }}>
              Signals
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.XS }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: COLORS.TERTIARY,
            }} />
            <span style={{
              fontFamily: TYPOGRAPHY.FONT_LABEL,
              fontSize: FONT_SIZES.LABEL_MD,
              color: COLORS.ON_SURFACE_VARIANT,
            }}>
              AI Actions
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ position: 'relative', height: '240px', width: '100%', marginTop: '16px', paddingBottom: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="signalsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.PRIMARY} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLORS.PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: COLORS.ON_SURFACE_VARIANT, fontSize: 12, fontFamily: TYPOGRAPHY.FONT_LABEL }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: COLORS.ON_SURFACE_VARIANT, fontSize: 12, fontFamily: TYPOGRAPHY.FONT_LABEL }}
              domain={[0, 200]}
            />
            <Tooltip 
              contentStyle={{
                background: COLORS.SURFACE_CONTAINER_HIGH,
                border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
                borderRadius: RADIUS.LG,
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: FONT_SIZES.LABEL_MD,
              }}
            />
            <Area 
              type="monotone" 
              dataKey="signals" 
              stroke="none"
              fill="url(#signalsGradient)"
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="signals" 
              stroke={COLORS.PRIMARY}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: COLORS.PRIMARY }}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="aiActions" 
              stroke={COLORS.TERTIARY}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 5, fill: COLORS.TERTIARY }}
              animationDuration={1000}
            />
          </ComposedChart>
        </ResponsiveContainer>
        
     
      </div>
    </motion.section>
  );
}