'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Truck, ShoppingCart, Zap, CheckCircle, Ban, X, Clock, Target, BarChart3, MessageSquare } from 'lucide-react';
import { RippleButton, useToast } from '@/components/layout';
import { ApprovalItem } from '@/data';
import { formatRelativeTime } from '@/data/mockData';

interface ApprovalDetailModalProps {
  approval: ApprovalItem;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApprovalDetailModal({ 
  approval, 
  onClose, 
  onApprove, 
  onReject 
}: ApprovalDetailModalProps) {
  const { showToast } = useToast();

  const handleApprove = () => {
    onApprove(approval.id);
    showToast('success', 'Approved', `${approval.title} has been approved.`);
  };

  const handleReject = () => {
    onReject(approval.id);
    showToast('info', 'Rejected', `${approval.title} has been rejected.`);
  };

  const getIcon = () => {
    switch (approval.recommendationIcon) {
      case 'trending_up':
        return <TrendingUp size={24} />;
      case 'local_shipping':
        return <Truck size={24} />;
      case 'shopping_cart':
        return <ShoppingCart size={24} />;
      default:
        return <Target size={24} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--space-lg)',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-lg)',
            borderBottom: '1px solid var(--outline-variant)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{
                padding: 'var(--space-sm)',
                background: 'var(--primary-container)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--primary)',
              }}>
                {getIcon()}
              </div>
              <div>
                <span style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: 'var(--font-size-label-sm)',
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {approval.signalType}
                </span>
                <h2 style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: 'var(--font-size-headline-md)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                }}>
                  {approval.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-sm)',
                color: 'var(--on-surface-variant)',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: 'var(--space-xs) var(--space-md)',
                background: 'rgba(0, 104, 95, 0.1)',
                borderRadius: 'var(--radius-full)',
              }}>
                <Zap size={16} style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }} />
                <span style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: 'var(--font-size-label-md)',
                  color: 'var(--primary)',
                }}>
                  {approval.confidence}% Confidence
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                color: 'var(--on-surface-variant)',
              }}>
                <Clock size={16} />
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-body-sm)',
                }}>
                  {formatRelativeTime(approval.createdAt)}
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 98, 141, 0.05)',
              border: '1px solid rgba(0, 98, 141, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <Target size={18} color="var(--tertiary)" />
                <span style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: 'var(--font-size-label-md)',
                  color: 'var(--tertiary)',
                  fontWeight: 600,
                }}>
                  AI Recommendation
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-body-lg)',
                fontWeight: 600,
                color: 'var(--on-surface)',
              }}>
                {approval.recommendation}
              </p>
            </div>

            {approval.context && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                  <BarChart3 size={18} color="var(--on-surface-variant)" />
                  <h4 style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: 'var(--font-size-headline-sm)',
                    fontWeight: 600,
                    color: 'var(--on-surface)',
                  }}>
                    Context Analysis
                  </h4>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 'var(--space-md)',
                }}>
                  {approval.context.map((ctx) => (
                    <div key={ctx.label} style={{
                      background: 'var(--surface-container)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-md)',
                    }}>
                      <p style={{
                        fontFamily: 'var(--font-label)',
                        fontSize: 'var(--font-size-label-sm)',
                        color: 'var(--on-surface-variant)',
                        marginBottom: 'var(--space-xs)',
                      }}>
                        {ctx.label}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--font-size-body-md)',
                          fontWeight: 600,
                          color: ctx.isHigh ? 'var(--primary)' : 'var(--error)',
                        }}>
                          {ctx.value}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--font-size-label-md)',
                          color: 'var(--on-surface-variant)',
                        }}>
                          {ctx.progress}%
                        </span>
                      </div>
                      <div style={{
                        height: '4px',
                        background: 'var(--surface-container-highest)',
                        borderRadius: 'var(--radius-full)',
                        marginTop: 'var(--space-sm)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          background: ctx.isHigh ? 'var(--primary)' : 'var(--error)',
                          width: `${ctx.progress}%`,
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <MessageSquare size={18} color="var(--on-surface-variant)" />
                <h4 style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: 'var(--font-size-headline-sm)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                }}>
                  AI Reasoning
                </h4>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-body-md)',
                color: 'var(--on-surface-variant)',
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}>
                "{approval.description}"
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            padding: 'var(--space-lg)',
            borderTop: '1px solid var(--outline-variant)',
            justifyContent: 'flex-end',
          }}>
            <RippleButton variant="outline" onClick={onClose}>
              Cancel
            </RippleButton>
            <RippleButton 
              variant="outline" 
              style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
              onClick={handleReject}
            >
              <Ban size={18} />
              Reject
            </RippleButton>
            <RippleButton variant="primary" onClick={handleApprove}>
              <CheckCircle size={18} />
              Approve
            </RippleButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}