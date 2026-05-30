'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, ShoppingCart, Zap, CheckCircle, Ban, Download, Eye, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { STAGGER_CONTAINER, REVEAL_UP } from '@/lib/animations';
import { RippleButton, useToast } from '@/components/layout';
import { ApprovalItem } from '@/data';

interface ApprovalsQueueProps {
  pendingApprovals: ApprovalItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onExport: () => void;
  onViewDetails: (approval: ApprovalItem) => void;
  stats?: {
    pending: number;
    approved: number;
    rejected: number;
  };
  policyLimits?: { label: string; value: string; progress: number }[];
}

const getSignalColor = (signalType: string) => {
  if (signalType === 'Pricing Signal') return 'var(--primary)';
  if (signalType === 'Inventory Signal') return 'var(--error)';
  return 'var(--tertiary)';
};

const getRecommendationIcon = (icon: string) => {
  if (icon === 'trending_up') return <TrendingUp size={18} />;
  if (icon === 'local_shipping') return <Truck size={18} />;
  return <ShoppingCart size={18} />;
};

export function ApprovalsQueue({ 
  pendingApprovals, 
  onApprove,
  onReject,
  onExport,
  onViewDetails,
  stats,
  policyLimits = [],
}: ApprovalsQueueProps) {
  const { showToast } = useToast();

  const handleApprove = (id: string) => {
    onApprove(id);
    showToast('success', 'Approval confirmed', 'The recommendation has been approved.');
  };

  const handleReject = (id: string) => {
    onReject(id);
    showToast('info', 'Approval rejected', 'The recommendation has been rejected.');
  };

  const handleExport = () => {
    onExport();
    showToast('success', 'Export ready', 'Approval data has been exported to CSV.');
  };

  const pendingCount = pendingApprovals.length;

  return (
    <motion.div
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          <h2 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'var(--font-size-headline-md)',
            fontWeight: 600,
            color: 'var(--on-background)',
          }}>
            Approvals Queue
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-body-sm)',
            color: 'var(--on-surface-variant)',
          }}>
            {pendingCount} {pendingCount === 1 ? 'pending approval' : 'pending approvals'}
          </p>
        </div>
        <RippleButton variant="outline" onClick={handleExport} disabled={pendingCount === 0}>
          <Download size={18} />
          Export
        </RippleButton>
      </div>

      {pendingCount === 0 ? (
        <motion.div
          variants={REVEAL_UP}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-xl)',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--outline-variant)',
            gap: 'var(--space-md)',
            minHeight: '220px',
          }}
        >
          <CheckCircle size={48} color="var(--primary)" strokeWidth={1.5} />
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'var(--font-size-headline-sm)',
              fontWeight: 600,
              color: 'var(--on-surface)',
              marginBottom: 'var(--space-xs)',
            }}>All caught up!</p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--on-surface-variant)',
            }}>No pending approvals. The AI agent will surface new ones as signals arrive.</p>
          </div>
        </motion.div>
      ) : null}

      {pendingApprovals.map((item) => (
        <motion.article
          key={item.id}
          layout
          variants={REVEAL_UP}
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 104, 95, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => onViewDetails(item)}
        >
          {/* Colored top accent bar */}
          <div style={{ height: '3px', background: getSignalColor(item.signalType) }} />

          <div style={{
            padding: 'var(--space-lg)',
            display: 'flex',
            gap: 'var(--space-lg)',
            alignItems: 'stretch',
          }}>
            {/* ── Left: main content ── */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

              {/* Header row: signal type badge + title + confidence pill */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '11px',
                    color: getSignalColor(item.signalType),
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '4px',
                  }}>
                    {item.signalType}
                  </span>
                  <h3 style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-body-lg)',
                    fontWeight: 600,
                    color: 'var(--on-surface)',
                    margin: 0,
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}>
                    {item.title}
                  </h3>
                </div>
                <div style={{
                  flexShrink: 0,
                  background: 'var(--primary-container)',
                  color: 'var(--on-primary-container)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Zap size={13} />
                  <span style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}>
                    {item.confidence}%
                  </span>
                </div>
              </div>

              {/* Recommendation box */}
              <div style={{
                background: 'var(--surface-container)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-sm) var(--space-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
              }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  flexShrink: 0,
                  background: 'var(--surface-container-high)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: getSignalColor(item.signalType),
                }}>
                  {getRecommendationIcon(item.recommendationIcon)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '11px',
                    color: 'var(--on-surface-variant)',
                    margin: '0 0 2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Recommendation
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: 600,
                    color: 'var(--on-surface)',
                    margin: 0,
                    wordBreak: 'break-word',
                  }}>
                    {item.recommendation}
                  </p>
                </div>
              </div>

              {/* Context bars — only render if we have items */}
              {item.context && item.context.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(item.context.length, 3)}, minmax(0, 1fr))`,
                  gap: 'var(--space-sm)',
                }}>
                  {item.context.map((ctx, idx) => (
                    <div key={`${ctx.label}-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'var(--font-label)',
                        fontSize: '10px',
                        color: 'var(--on-surface-variant)',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {ctx.label}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <div style={{
                          height: '4px',
                          flex: 1,
                          minWidth: 0,
                          background: 'var(--surface-container-highest)',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            background: ctx.isHigh ? 'var(--primary)' : 'var(--error)',
                            width: `${Math.max(4, Math.min(100, ctx.progress))}%`,
                            borderRadius: '9999px',
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: ctx.isHigh ? 'var(--primary)' : 'var(--error)',
                          flexShrink: 0,
                          maxWidth: '52px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {ctx.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Description + timestamp */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-body-sm)',
                  color: 'var(--on-surface-variant)',
                  lineHeight: 1.5,
                  margin: 0,
                  flex: 1,
                  minWidth: 0,
                }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, color: 'var(--on-surface-variant)' }}>
                  <Clock size={12} />
                  <span style={{ fontFamily: 'var(--font-label)', fontSize: '11px' }}>
                    {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right: action buttons ── */}
            <div style={{
              width: '148px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
              borderLeft: '1px solid var(--outline-variant)',
              paddingLeft: 'var(--space-lg)',
              justifyContent: 'center',
            }}>
              <RippleButton
                variant="primary"
                fullWidth
                onClick={(e) => {
                  e?.stopPropagation();
                  handleApprove(item.id);
                }}
              >
                <CheckCircle size={16} />
                Approve
              </RippleButton>
              <RippleButton
                variant="outline"
                fullWidth
                onClick={(e) => {
                  e?.stopPropagation();
                  handleReject(item.id);
                }}
              >
                <Ban size={16} />
                Reject
              </RippleButton>
            </div>
          </div>
        </motion.article>
      ))}


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        <QuickStatsSection 
          pendingCount={pendingCount} 
          stats={stats}
        />
        <PolicyWarningsSection policyLimits={policyLimits} />
      </div>
    </motion.div>
  );
}

function QuickStatsSection({ pendingCount, stats }: { pendingCount: number; stats?: { pending: number; approved: number; rejected: number } }) {
  const statItems = [
    { label: 'Pending', value: pendingCount, color: 'var(--tertiary)' },
    { label: 'Approved', value: stats?.approved ?? 0, color: 'var(--primary)' },
    { label: 'Rejected', value: stats?.rejected ?? 0, color: 'var(--error)' },
    { label: 'Total', value: (pendingCount) + (stats?.approved ?? 0) + (stats?.rejected ?? 0), color: 'var(--secondary)' },
  ];

  return (
    <motion.div
      variants={REVEAL_UP}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid #E2E8F0',
        padding: 'var(--space-lg)',
      }}
    >
      <h4 style={{
        fontFamily: 'var(--font-headline)',
        fontSize: 'var(--font-size-headline-sm)',
        fontWeight: 600,
        color: 'var(--on-surface)',
        marginBottom: 'var(--space-md)',
      }}>
        Today's Overview
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-sm)' }}>
        {statItems.map((stat, idx) => (
          <div key={idx} style={{
            textAlign: 'center',
            padding: 'var(--space-md)',
            background: 'var(--surface-container)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'var(--font-size-headline-md)',
              fontWeight: 700,
              color: stat.color,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontFamily: 'var(--font-label)',
              fontSize: 'var(--font-size-label-sm)',
              color: 'var(--on-surface-variant)',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PolicyWarningsSection({ policyLimits = [] }: { policyLimits?: { label: string; value: string; progress: number }[] }) {
  const warnings = policyLimits.map(pl => ({ label: pl.label, value: pl.value, status: pl.progress > 60 ? 'warning' : 'ok' }));

  if (warnings.length === 0) {
    return (
      <motion.div
        variants={REVEAL_UP}
        style={{
          background: 'var(--surface-container)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--outline-variant)',
          padding: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--on-surface-variant)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-body-sm)',
          minHeight: '100px',
        }}
      >
        No policy limits configured.
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={REVEAL_UP}
      style={{
        background: 'var(--surface-container)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--outline-variant)',
        padding: 'var(--space-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <AlertTriangle size={16} color="var(--tertiary)" />
        <h4 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'var(--font-size-headline-sm)',
          fontWeight: 600,
          color: 'var(--on-surface)',
        }}>
          Policy Status
        </h4>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {warnings.map((warning, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--surface-container)',
            borderRadius: 'var(--radius-md)',
          }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--on-surface)',
            }}>
              {warning.label}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 600,
              color: warning.status === 'warning' ? 'var(--tertiary)' : 'var(--primary)',
            }}>
              {warning.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}