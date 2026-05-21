'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Brain, AlertTriangle, Package, TrendingDown, X, ArrowRight, Eye, Clock, Zap, Tag, Loader2 } from 'lucide-react';
import { STAGGER_CONTAINER, REVEAL_UP, BUTTON_ANIMATION } from '@/lib/animations';
import { AttentionItem as AttentionItemType } from '@/data';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES } from '@/lib/constants';
import { useToast } from '@/components/layout/Toast';
import { DotText } from '@/components/ui';

interface NeedsAttentionProps {
  items: AttentionItemType[];
  onAction: (id: string, action: 'primary' | 'secondary') => Promise<void>;
  onViewDetails?: (item: AttentionItemType) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  warning: <AlertTriangle size={18} color="#f59e0b" />,
  psychology: <Brain size={18} color="var(--primary)" />,
  inventory: <Package size={18} color="var(--error)" />,
  alert: <TrendingDown size={18} color="#f59e0b" />,
};

const priorityStyles: Record<string, { border: string; bg: string; label: string }> = {
  high: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)', label: 'High Priority' },
  medium: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', label: 'Medium Priority' },
  low: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.05)', label: 'Low Priority' },
};

export function NeedsAttention({ items, onAction, onViewDetails }: NeedsAttentionProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AttentionItemType | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleViewDetails = (item: AttentionItemType) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
    if (onViewDetails) {
      onViewDetails(item);
    }
  };

  if (items.length === 0) {
    return (
      <motion.div
        variants={REVEAL_UP}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          padding: 'var(--space-xl)',
          textAlign: 'center',
        }}
      >
        <Headphones size={32} color="var(--primary)" style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
        <p style={{
          color: 'var(--on-surface-variant)',
          fontFamily: 'var(--font-body)',
        }}>
          All caught up! No items need your attention.
        </p>
      </motion.div>
    );
  }

  return (
    <>
    <motion.div
      variants={REVEAL_UP}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        padding: 'var(--space-lg)',
        background: 'var(--surface-container-high)',
        borderBottom: '1px solid var(--outline-variant)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <Headphones size={18} color="var(--tertiary)" style={{ fontVariationSettings: "'FILL' 1" }} />
          <h3 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'var(--font-size-headline-sm)',
            fontWeight: 600,
            color: 'var(--on-surface)',
          }}>
            Needs Attention
          </h3>
        </div>
        <span style={{
          background: 'var(--error)',
          color: 'var(--on-error)',
          padding: '2px 8px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <DotText size="sm" style={{ color: 'var(--on-error)', lineHeight: 1 }}>
            {items.length}
          </DotText>
        </span>
      </div>

      <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            layout
            style={{
              padding: 'var(--space-md)',
              background: priorityStyles[item.priority]?.bg || 'var(--surface-bright)',
              border: `1px solid ${priorityStyles[item.priority]?.border || 'var(--outline-variant)'}`,
              borderRadius: 'var(--radius-xl)',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
              <span style={{
                color: 'var(--on-surface-variant)',
                fontFamily: 'var(--font-label)',
                fontSize: 'var(--font-size-label-md)',
              }}>
                {item.type}
              </span>
              {iconMap[item.icon]}
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-md)',
              fontWeight: 600,
              color: 'var(--on-surface)',
              marginBottom: 'var(--space-xs)',
            }}>
              {item.title}
            </p>
            <p style={{
              color: 'var(--on-surface-variant)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-sm)',
              marginBottom: 'var(--space-md)',
            }}>
              {item.description}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleViewDetails(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--tertiary)',
                  color: 'var(--on-tertiary)',
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <Eye size={14} />
                Info
              </motion.button>
              <motion.button
                whileHover={{ scale: loadingId === item.id ? 1 : 1.02 }}
                whileTap={{ scale: loadingId === item.id ? 1 : 0.98 }}
                onClick={async () => {
                  if (loadingId) return;
                  setLoadingId(item.id);
                  try {
                    await onAction(item.id, 'primary');
                    showToast('success', 'Action Approved', item.title);
                  } catch (err) {
                    showToast('error', 'Action Failed', 'Unable to process request');
                  } finally {
                    setLoadingId(null);
                  }
                }}
                disabled={loadingId === item.id}
                style={{
                  flex: 1,
                  background: loadingId === item.id ? 'var(--surface-container)' : 'var(--primary)',
                  color: loadingId === item.id ? 'var(--on-surface-variant)' : 'var(--on-primary)',
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: loadingId === item.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {loadingId === item.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                Approve
              </motion.button>
              <motion.button
                whileHover={{ scale: loadingId === `dismiss-${item.id}` ? 1 : 1.02 }}
                whileTap={{ scale: loadingId === `dismiss-${item.id}` ? 1 : 0.98 }}
                onClick={async () => {
                  if (loadingId) return;
                  setLoadingId(`dismiss-${item.id}`);
                  try {
                    await onAction(item.id, 'secondary');
                    showToast('info', 'Dismissed', item.title);
                  } catch (err) {
                    showToast('error', 'Action Failed', 'Unable to process request');
                  } finally {
                    setLoadingId(null);
                  }
                }}
                disabled={loadingId === `dismiss-${item.id}`}
                style={{
                  flex: 1,
                  background: 'var(--surface-container)',
                  color: 'var(--on-surface-variant)',
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: loadingId === `dismiss-${item.id}` ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {loadingId === `dismiss-${item.id}` ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {item.actionSecondary}
              </motion.button>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </motion.div>

    <AnimatePresence>
      {showDetailsModal && selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: COLORS.SURFACE_CONTAINER_LOWEST,
              borderRadius: RADIUS.XL,
              padding: SPACING.XL,
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: SPACING.LG,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.MD }}>
                {iconMap[selectedItem.icon]}
                <div>
                  <h2 style={{
                    fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                    fontSize: FONT_SIZES.HEADLINE_MD,
                    fontWeight: 600,
                    color: COLORS.ON_SURFACE,
                  }}>
                    {selectedItem.title}
                  </h2>
                  <span style={{
                    fontFamily: TYPOGRAPHY.FONT_LABEL,
                    fontSize: FONT_SIZES.LABEL_MD,
                    color: COLORS.ON_SURFACE_VARIANT,
                  }}>
                    {priorityStyles[selectedItem.priority]?.label || 'Priority'}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDetailsModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: SPACING.XS,
                }}
              >
                <X size={24} color={COLORS.ON_SURFACE_VARIANT} />
              </motion.button>
            </div>

            <div style={{ display: 'flex', gap: SPACING.SM, marginBottom: SPACING.MD, flexWrap: 'wrap' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: COLORS.SURFACE_CONTAINER_HIGH,
                padding: `${SPACING.XS} ${SPACING.SM}`,
                borderRadius: RADIUS.MD,
                fontSize: FONT_SIZES.LABEL_SM,
                color: COLORS.ON_SURFACE_VARIANT,
              }}>
                <Tag size={12} />
                {selectedItem.type}
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: COLORS.SURFACE_CONTAINER_HIGH,
                padding: `${SPACING.XS} ${SPACING.SM}`,
                borderRadius: RADIUS.MD,
                fontSize: FONT_SIZES.LABEL_SM,
                color: COLORS.ON_SURFACE_VARIANT,
              }}>
                <Clock size={12} />
                {selectedItem.timestamp instanceof Date 
                  ? selectedItem.timestamp.toLocaleString() 
                  : new Date(selectedItem.timestamp).toLocaleString()}
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(0, 104, 95, 0.1)',
                padding: `${SPACING.XS} ${SPACING.SM}`,
                borderRadius: RADIUS.MD,
                fontSize: FONT_SIZES.LABEL_SM,
                color: COLORS.PRIMARY,
              }}>
                <Zap size={12} />
                {selectedItem.confidence ? `${selectedItem.confidence}% Confidence` : 'High Priority'}
              </span>
            </div>

            <div style={{
              padding: SPACING.MD,
              background: priorityStyles[selectedItem.priority]?.bg || 'transparent',
              borderRadius: RADIUS.LG,
              marginBottom: SPACING.MD,
              border: `1px solid ${priorityStyles[selectedItem.priority]?.border || COLORS.OUTLINE_VARIANT}`,
            }}>
              <p style={{
                fontFamily: TYPOGRAPHY.FONT_BODY,
                fontSize: FONT_SIZES.BODY_MD,
                color: COLORS.ON_SURFACE,
                lineHeight: 1.6,
              }}>
                {selectedItem.description}
              </p>
            </div>

            <div style={{
              padding: SPACING.MD,
              background: COLORS.SURFACE_CONTAINER_LOW,
              borderRadius: RADIUS.LG,
              marginBottom: SPACING.LG,
            }}>
              <p style={{
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: FONT_SIZES.LABEL_SM,
                color: COLORS.ON_SURFACE_VARIANT,
                marginBottom: SPACING.XS,
              }}>
                Recommended Action
              </p>
              <p style={{
                fontFamily: TYPOGRAPHY.FONT_BODY,
                fontSize: FONT_SIZES.BODY_SM,
                color: COLORS.ON_SURFACE,
              }}>
                {selectedItem.recommendation || selectedItem.actionRequired}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: SPACING.SM,
              marginBottom: SPACING.LG,
            }}>
              <div style={{
                padding: SPACING.MD,
                background: COLORS.SURFACE_CONTAINER_LOWEST,
                borderRadius: RADIUS.MD,
                border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
              }}>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_LABEL,
                  fontSize: FONT_SIZES.LABEL_SM,
                  color: COLORS.ON_SURFACE_VARIANT,
                  marginBottom: SPACING.XS,
                }}>
                  Alert Type
                </p>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_BODY,
                  fontSize: FONT_SIZES.BODY_SM,
                  fontWeight: 600,
                  color: COLORS.ON_SURFACE,
                }}>
                  {selectedItem.type}
                </p>
              </div>
              <div style={{
                padding: SPACING.MD,
                background: COLORS.SURFACE_CONTAINER_LOWEST,
                borderRadius: RADIUS.MD,
                border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
              }}>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_LABEL,
                  fontSize: FONT_SIZES.LABEL_SM,
                  color: COLORS.ON_SURFACE_VARIANT,
                  marginBottom: SPACING.XS,
                }}>
                  Priority Level
                </p>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_BODY,
                  fontSize: FONT_SIZES.BODY_SM,
                  fontWeight: 600,
                  color: priorityStyles[selectedItem.priority]?.border || COLORS.ON_SURFACE,
                }}>
                  {priorityStyles[selectedItem.priority]?.label}
                </p>
              </div>
              <div style={{
                padding: SPACING.MD,
                background: COLORS.SURFACE_CONTAINER_LOWEST,
                borderRadius: RADIUS.MD,
                border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
              }}>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_LABEL,
                  fontSize: FONT_SIZES.LABEL_SM,
                  color: COLORS.ON_SURFACE_VARIANT,
                  marginBottom: SPACING.XS,
                }}>
                  Item ID
                </p>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_BODY,
                  fontSize: FONT_SIZES.BODY_SM,
                  fontWeight: 600,
                  color: COLORS.ON_SURFACE,
                }}>
                  {selectedItem.id}
                </p>
              </div>
              <div style={{
                padding: SPACING.MD,
                background: COLORS.SURFACE_CONTAINER_LOWest,
                borderRadius: RADIUS.MD,
                border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
              }}>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_LABEL,
                  fontSize: FONT_SIZES.LABEL_SM,
                  color: COLORS.ON_SURFACE_VARIANT,
                  marginBottom: SPACING.XS,
                }}>
                  Received At
                </p>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_BODY,
                  fontSize: FONT_SIZES.BODY_SM,
                  fontWeight: 600,
                  color: COLORS.ON_SURFACE,
                }}>
                  {selectedItem.timestamp instanceof Date 
                    ? selectedItem.timestamp.toLocaleTimeString() 
                    : new Date(selectedItem.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: SPACING.MD }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onAction(selectedItem.id, 'primary');
                  setShowDetailsModal(false);
                }}
                style={{
                  flex: 1,
                  background: COLORS.PRIMARY,
                  color: COLORS.ON_PRIMARY,
                  padding: `${SPACING.MD} ${SPACING.LG}`,
                  borderRadius: RADIUS.LG,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: FONT_SIZES.BODY_MD,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: SPACING.SM,
                }}
              >
                Approve
                <ArrowRight size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onAction(selectedItem.id, 'secondary');
                  setShowDetailsModal(false);
                }}
                style={{
                  flex: 1,
                  background: COLORS.SURFACE_CONTAINER_HIGH,
                  color: COLORS.ON_SURFACE,
                  padding: `${SPACING.MD} ${SPACING.LG}`,
                  borderRadius: RADIUS.LG,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: FONT_SIZES.BODY_MD,
                  cursor: 'pointer',
                }}
              >
                {selectedItem.actionSecondary}
              </motion.button>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}