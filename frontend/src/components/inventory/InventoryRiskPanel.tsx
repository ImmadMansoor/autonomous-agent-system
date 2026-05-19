'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, ALERT_LEVELS, SHADOWS } from '@/lib/constants';
import { REVEAL_UP } from '@/lib/animations';
import { InventoryRisk } from '@/hooks/useInventoryData';

interface InventoryRiskPanelProps {
  items: InventoryRisk[];
  onDismiss: (id: string) => void;
  onViewAll?: () => void;
}

export function InventoryRiskPanel({ items, onDismiss, onViewAll }: InventoryRiskPanelProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const criticalCount = items.filter(i => i.alertLevel === 'CRITICAL').length;

  const handleViewAll = () => {
    setShowAllModal(true);
  };

  return (
    <>
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
          height: '100%',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: SPACING.LG,
        }}>
          <h3 style={{
            fontFamily: TYPOGRAPHY.FONT_HEADLINE,
            fontSize: FONT_SIZES.HEADLINE_SM,
            fontWeight: 600,
            color: COLORS.ON_SURFACE,
          }}>
            Inventory Risk
          </h3>
          <AlertTriangle 
            size={24} 
            color={criticalCount > 0 ? COLORS.ERROR : COLORS.SECONDARY} 
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}>
          {items.map((item) => {
            const alertStyle = ALERT_LEVELS[item.alertLevel as keyof typeof ALERT_LEVELS] || ALERT_LEVELS.WARNING;
            const isCritical = item.alertLevel === 'CRITICAL';
            const isOptimize = item.alertLevel === 'OPTIMIZE';
            
            return (
              <motion.div
                key={item.id}
                whileHover={{ backgroundColor: COLORS.SURFACE_CONTAINER_LOW }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: SPACING.SM,
                  borderRadius: RADIUS.LG,
                  border: `1px solid transparent`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontWeight: 600,
                    fontSize: FONT_SIZES.BODY_SM,
                    color: COLORS.ON_SURFACE,
                  }}>
                    {item.name}
                  </span>
                  <span style={{
                    fontFamily: TYPOGRAPHY.FONT_LABEL,
                    fontSize: FONT_SIZES.LABEL_MD,
                    color: COLORS.ON_SURFACE_VARIANT,
                  }}>
                    {item.status}
                  </span>
                </div>
                
                <span style={{
                  padding: '2px 6px',
                  background: isCritical ? COLORS.ERROR_CONTAINER : isOptimize ? 'rgba(245, 158, 11, 0.1)' : COLORS.SURFACE_CONTAINER_HIGH,
                  color: isCritical ? COLORS.ON_ERROR_CONTAINER : isOptimize ? '#d97706' : COLORS.ON_SURFACE_VARIANT,
                  fontSize: '10px',
                  fontWeight: 700,
                  borderRadius: RADIUS.SM,
                  textTransform: 'uppercase',
                }}>
                  {alertStyle.LABEL}
                </span>
              </motion.div>
            );
          })}
        </div>
        
        <button 
          onClick={handleViewAll}
          style={{
            width: '100%',
            marginTop: SPACING.LG,
            padding: SPACING.SM,
            background: 'transparent',
            border: `1px solid ${COLORS.OUTLINE}`,
            borderRadius: RADIUS.LG,
            fontFamily: TYPOGRAPHY.FONT_LABEL,
            fontSize: FONT_SIZES.LABEL_MD,
            color: COLORS.ON_SURFACE,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = COLORS.SURFACE_CONTAINER}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          View All Alerts
        </button>
      </motion.div>

      {/* All Alerts Modal */}
      <AnimatePresence>
        {showAllModal && (
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
            onClick={() => setShowAllModal(false)}
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
                alignItems: 'center',
                marginBottom: SPACING.LG,
              }}>
                <h2 style={{
                  fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                  fontSize: FONT_SIZES.HEADLINE_MD,
                  fontWeight: 600,
                  color: COLORS.ON_SURFACE,
                }}>
                  All Inventory Alerts
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAllModal(false)}
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
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}>
                {/* Generate more demo alerts for the modal */}
                {[
                  ...items,
                  { id: 'extra-1', name: 'Espresso Beans', status: 'Low Supply • 8h left', alertLevel: 'WARNING' as const },
                  { id: 'extra-2', name: 'Vanilla Syrup', status: 'Stock-out predicted', alertLevel: 'CRITICAL' as const },
                  { id: 'extra-3', name: 'Almond Milk', status: 'High Waste Risk', alertLevel: 'OPTIMIZE' as const },
                  { id: 'extra-4', name: 'Croissants', status: 'Low Supply • 12h left', alertLevel: 'WARNING' as const },
                  { id: 'extra-5', name: 'Oat Milk', status: 'Stock-out predicted', alertLevel: 'CRITICAL' as const },
                  { id: 'extra-6', name: 'Honey', status: 'Low Supply • 24h left', alertLevel: 'WARNING' as const },
                ].map((item) => {
                  const alertStyle = ALERT_LEVELS[item.alertLevel as keyof typeof ALERT_LEVELS] || ALERT_LEVELS.WARNING;
                  const isCritical = item.alertLevel === 'CRITICAL';
                  const isOptimize = item.alertLevel === 'OPTIMIZE';
                  
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: SPACING.MD,
                        background: COLORS.SURFACE_CONTAINER_LOW,
                        borderRadius: RADIUS.LG,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{
                          fontWeight: 600,
                          fontSize: FONT_SIZES.BODY_MD,
                          color: COLORS.ON_SURFACE,
                        }}>
                          {item.name}
                        </span>
                        <span style={{
                          fontFamily: TYPOGRAPHY.FONT_LABEL,
                          fontSize: FONT_SIZES.LABEL_MD,
                          color: COLORS.ON_SURFACE_VARIANT,
                        }}>
                          {item.status}
                        </span>
                      </div>
                      
                      <span style={{
                        padding: `${SPACING.XS} ${SPACING.SM}`,
                        background: isCritical ? COLORS.ERROR_CONTAINER : isOptimize ? 'rgba(245, 158, 11, 0.1)' : COLORS.SURFACE_CONTAINER_HIGH,
                        color: isCritical ? COLORS.ON_ERROR_CONTAINER : isOptimize ? '#d97706' : COLORS.ON_SURFACE_VARIANT,
                        fontSize: '10px',
                        fontWeight: 700,
                        borderRadius: RADIUS.FULL,
                        textTransform: 'uppercase',
                      }}>
                        {alertStyle.LABEL}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}