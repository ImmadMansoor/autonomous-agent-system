'use client';

import { motion } from 'framer-motion';
import { Brain, TrendingUp, Lightbulb, CheckCircle, UserPlus, AlertTriangle, Loader2 } from 'lucide-react';
import { SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, COLORS, SHADOWS } from '@/lib/constants';
import { REVEAL_UP, BUTTON_ANIMATION } from '@/lib/animations';
import { useToast } from '@/components/layout/Toast';
import { AIInterpretationData, Recommendation } from '@/hooks/useAnalyticsData';

interface AIInterpretationPanelProps {
  interpretation: AIInterpretationData | null;
  recommendations: Recommendation[];
  pendingRecommendations: Recommendation[];
  avgConfidence: number;
  onExecuteRecommendation: (id: string) => Promise<boolean>;
  onExecuteAll: () => Promise<number>;
  onDismissRecommendation: (id: string) => void;
  onDismissAll: () => void;
  isExecuting: boolean;
}

const typeIcons = {
  inventory: CheckCircle,
  staffing: UserPlus,
  pricing: TrendingUp,
  operations: Lightbulb,
};

export function AIInterpretationPanel({
  interpretation,
  recommendations,
  pendingRecommendations,
  avgConfidence,
  onExecuteRecommendation,
  onExecuteAll,
  onDismissRecommendation,
  onDismissAll,
  isExecuting,
}: AIInterpretationPanelProps) {
  const { showToast } = useToast();

  const handleExecuteSingle = async (id: string, title: string) => {
    const success = await onExecuteRecommendation(id);
    if (success) {
      showToast('success', 'Action Executed', `"${title}" has been executed`);
    }
  };

  const handleExecuteAll = async () => {
    const count = await onExecuteAll();
    if (count > 0) {
      showToast('success', 'All Actions Executed', `${count} recommendations have been applied`);
    }
  };

  const handleDismiss = (id: string, title: string) => {
    onDismissRecommendation(id);
    showToast('info', 'Recommendation Dismissed', `"${title}" has been dismissed`);
  };

  const handleDismissAll = () => {
    onDismissAll();
    showToast('info', 'All Dismissed', 'All pending recommendations have been dismissed');
  };

  const activeRecommendations = recommendations.filter(r => !r.isExecuted && !r.isDismissed);

  return (
    <motion.div
      variants={REVEAL_UP}
      initial="hidden"
      animate="visible"
      style={{
        borderRadius: RADIUS.XL,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${COLORS.PRIMARY}20`,
        boxShadow: SHADOWS.CARD,
        background: COLORS.SURFACE_CONTAINER_LOWEST,
      }}
    >
      {/* Panel Header */}
      <div style={{
        padding: SPACING.LG,
        borderBottom: `1px solid ${COLORS.OUTLINE_VARIANT}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: COLORS.SURFACE_CONTAINER_LOWEST,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.MD }}>
          <div style={{
            padding: '8px',
            background: COLORS.PRIMARY,
            borderRadius: RADIUS.LG,
            color: COLORS.ON_PRIMARY,
            boxShadow: SHADOWS.CARD,
          }}>
            <Brain size={24} style={{ fontVariationSettings: "'FILL' 1" }} />
          </div>
          <div>
            <h3 style={{
              fontFamily: TYPOGRAPHY.FONT_HEADLINE,
              fontSize: FONT_SIZES.HEADLINE_MD,
              fontWeight: 600,
              color: COLORS.ON_SURFACE,
            }}>
              AI Interpretation
            </h3>
            <p style={{
              fontFamily: TYPOGRAPHY.FONT_BODY,
              fontSize: FONT_SIZES.BODY_SM,
              color: COLORS.ON_SURFACE_VARIANT,
            }}>
              Real-time reasoning engine
            </p>
          </div>
        </div>
        <span style={{
          padding: `${SPACING.XS} ${SPACING.MD}`,
          background: `${COLORS.PRIMARY}10`,
          color: COLORS.PRIMARY,
          borderRadius: RADIUS.FULL,
          fontFamily: TYPOGRAPHY.FONT_LABEL,
          fontSize: FONT_SIZES.LABEL_MD,
          border: `${COLORS.PRIMARY}20`,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
        className="pulse-soft"
        >
          Live Analysis
        </span>
      </div>
      
      <div style={{ padding: SPACING.LG, display: 'flex', flexDirection: 'column', gap: SPACING.XL }}>
        {/* Active Signal Context */}
        <div>
          <p style={{
            fontFamily: TYPOGRAPHY.FONT_LABEL,
            fontSize: FONT_SIZES.LABEL_MD,
            fontWeight: 700,
            color: COLORS.ON_SURFACE_VARIANT,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: SPACING.MD,
          }}>
            Active Signal Context
          </p>
          <div style={{
            background: COLORS.SURFACE_CONTAINER_LOW,
            borderRadius: RADIUS.XL,
            padding: SPACING.MD,
            border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
            fontFamily: TYPOGRAPHY.FONT_MONO,
            fontSize: FONT_SIZES.BODY_SM,
            color: COLORS.ON_SURFACE,
            fontStyle: 'italic',
            borderLeft: `4px solid ${COLORS.PRIMARY}`,
          }}>
            "{interpretation?.activeContext || 'No signal selected'}"
          </div>
        </div>
        
        {/* Operational Impact Metrics */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.SM, marginBottom: SPACING.MD }}>
            <Lightbulb size={20} color={COLORS.PRIMARY} />
            <h4 style={{
              fontFamily: TYPOGRAPHY.FONT_HEADLINE,
              fontSize: FONT_SIZES.HEADLINE_SM,
              fontWeight: 600,
              color: COLORS.ON_SURFACE,
            }}>
              Operational Impact
            </h4>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: SPACING.MD,
          }}>
            <div style={{
              background: COLORS.SURFACE_CONTAINER_LOWEST,
              border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
              borderRadius: RADIUS.XL,
              padding: SPACING.LG,
              boxShadow: SHADOWS.CARD,
            }}>
              <p style={{
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: FONT_SIZES.LABEL_MD,
                color: COLORS.ON_SURFACE_VARIANT,
                fontWeight: 700,
                marginBottom: SPACING.XS,
              }}>
                Projected Traffic
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: SPACING.XS }}>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                  fontSize: '32px',
                  fontWeight: 700,
                  color: COLORS.PRIMARY,
                }}>
                  {interpretation ? (interpretation.projectedTraffic > 0 ? '+' : '') + `${interpretation.projectedTraffic}%` : '--'}
                </p>
                <TrendingUp size={20} color={COLORS.PRIMARY} style={{ marginBottom: '4px' }} />
              </div>
              <p style={{
                fontFamily: TYPOGRAPHY.FONT_BODY,
                fontSize: FONT_SIZES.BODY_SM,
                color: COLORS.ON_SURFACE_VARIANT,
                marginTop: SPACING.XS
              }}>
                above baseline average
              </p>
            </div>
            
            <div style={{
              background: COLORS.SURFACE_CONTAINER_LOWEST,
              border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
              borderRadius: RADIUS.XL,
              padding: SPACING.LG,
              boxShadow: SHADOWS.CARD,
            }}>
              <p style={{
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: FONT_SIZES.LABEL_MD,
                color: COLORS.ON_SURFACE_VARIANT,
                fontWeight: 700,
                marginBottom: SPACING.XS,
              }}>
                Wait Time Risk
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: SPACING.XS }}>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                  fontSize: '32px',
                  fontWeight: 700,
                  color: interpretation?.waitTimeRisk === 'high' ? COLORS.ERROR : interpretation?.waitTimeRisk === 'medium' ? '#d97706' : COLORS.PRIMARY,
                }}>
                  {interpretation?.waitTimeRisk ? interpretation.waitTimeRisk.charAt(0).toUpperCase() + interpretation.waitTimeRisk.slice(1) : '--'}
                </p>
                <AlertTriangle 
                  size={20} 
                  color={interpretation?.waitTimeRisk === 'high' ? COLORS.ERROR : interpretation?.waitTimeRisk === 'medium' ? '#d97706' : COLORS.PRIMARY} 
                  style={{ marginBottom: '8px' }} 
                />
              </div>
              <p style={{
                fontFamily: TYPOGRAPHY.FONT_BODY,
                fontSize: FONT_SIZES.BODY_SM,
                color: COLORS.ON_SURFACE_VARIANT,
                marginTop: SPACING.XS
              }}>
                {interpretation?.estimatedDelay || 'No data'}
              </p>
            </div>
          </div>
        </div>
        
        {/* AI Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.SM }}>
              <Lightbulb size={20} color={COLORS.PRIMARY} />
              <h4 style={{
                fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                fontSize: FONT_SIZES.HEADLINE_SM,
                fontWeight: 600,
                color: COLORS.ON_SURFACE,
              }}>
                AI Recommendations
              </h4>
            </div>
            <span style={{
              background: `${COLORS.PRIMARY}10`,
              color: COLORS.PRIMARY,
              padding: `${SPACING.XS} ${SPACING.MD}`,
              borderRadius: RADIUS.FULL,
              fontFamily: TYPOGRAPHY.FONT_LABEL,
              fontSize: FONT_SIZES.LABEL_MD,
              border: `${COLORS.PRIMARY}20`,
              fontWeight: 700,
            }}>
              Confidence: {avgConfidence}%
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}>
            {activeRecommendations.map((rec) => {
              const Icon = typeIcons[rec.type] || Lightbulb;
              return (
                <motion.div
                  key={rec.id}
                  whileHover={{ backgroundColor: `${COLORS.PRIMARY}10` }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: SPACING.MD,
                    background: `${COLORS.PRIMARY}05`,
                    border: `${COLORS.PRIMARY}10`,
                    padding: SPACING.LG,
                    borderRadius: RADIUS.XL,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    padding: '8px',
                    background: `${COLORS.PRIMARY}10`,
                    borderRadius: RADIUS.LG,
                    color: COLORS.PRIMARY,
                  }}>
                    <Icon size={20} style={{ fontVariationSettings: "'FILL' 1" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontFamily: TYPOGRAPHY.FONT_BODY,
                      fontSize: FONT_SIZES.BODY_MD,
                      fontWeight: 700,
                      color: COLORS.ON_SURFACE,
                    }}>
                      {rec.title}
                    </p>
                    <p style={{
                      fontFamily: TYPOGRAPHY.FONT_BODY,
                      fontSize: FONT_SIZES.BODY_SM,
                      color: COLORS.ON_SURFACE_VARIANT,
                    }}>
                      {rec.description}
                    </p>
                    <div style={{ display: 'flex', gap: SPACING.SM, marginTop: SPACING.SM }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteSingle(rec.id, rec.title);
                        }}
                        style={{
                          background: COLORS.PRIMARY,
                          color: COLORS.ON_PRIMARY,
                          border: 'none',
                          borderRadius: RADIUS.MD,
                          padding: `${SPACING.XS} ${SPACING.SM}`,
                          fontSize: FONT_SIZES.LABEL_MD,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Execute
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(rec.id, rec.title);
                        }}
                        style={{
                          background: 'transparent',
                          color: COLORS.ON_SURFACE_VARIANT,
                          border: `1px solid ${COLORS.OUTLINE}`,
                          borderRadius: RADIUS.MD,
                          padding: `${SPACING.XS} ${SPACING.SM}`,
                          fontSize: FONT_SIZES.LABEL_MD,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {activeRecommendations.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: SPACING.XL,
                color: COLORS.ON_SURFACE_VARIANT,
                fontFamily: TYPOGRAPHY.FONT_BODY,
              }}>
                No pending recommendations
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Panel Footer Actions */}
      <div style={{
        padding: SPACING.LG,
        background: COLORS.SURFACE_CONTAINER_LOW,
        borderTop: `1px solid ${COLORS.OUTLINE_VARIANT}`,
        display: 'flex',
        gap: SPACING.MD,
      }}>
        <motion.button
          {...BUTTON_ANIMATION}
          onClick={handleExecuteAll}
          disabled={isExecuting || activeRecommendations.length === 0}
          style={{
            flex: 1,
            padding: '14px',
            background: activeRecommendations.length > 0 ? COLORS.PRIMARY : COLORS.SURFACE_CONTAINER_HIGH,
            color: COLORS.ON_PRIMARY,
            borderRadius: RADIUS.XL,
            border: 'none',
            fontWeight: 700,
            cursor: activeRecommendations.length > 0 ? 'pointer' : 'not-allowed',
            boxShadow: SHADOWS.CARD,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: SPACING.SM,
          }}
        >
          {isExecuting ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Executing...
            </>
          ) : (
            `Execute All (${activeRecommendations.length})`
          )}
        </motion.button>
        
        <motion.button
          {...BUTTON_ANIMATION}
          onClick={handleDismissAll}
          disabled={activeRecommendations.length === 0}
          style={{
            padding: `14px ${SPACING.XL}`,
            background: 'transparent',
            border: `1px solid ${COLORS.OUTLINE}`,
            borderRadius: RADIUS.XL,
            fontWeight: 700,
            color: COLORS.ON_SURFACE_VARIANT,
            cursor: activeRecommendations.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          Dismiss All
        </motion.button>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}