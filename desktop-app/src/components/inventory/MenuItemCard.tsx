'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bolt, User } from 'lucide-react';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, MENU_ITEM_STATUS, SHADOWS } from '@/lib/constants';
import { HOVER_CARD } from '@/lib/animations';
import { useToast } from '@/components/layout/Toast';

interface MenuItemCardProps {
  id: string;
  name: string;
  description: string;
  price: string;
  basePrice?: string;
  image: string;
  status: 'DYNAMIC' | 'FIXED' | 'WASTE_RISK';
  aiStatus: 'AI_MANAGED' | 'MANUAL' | 'AI_PENDING' | 'NONE';
  isManaged: boolean;
  onToggleManagement: () => void;
}

export function MenuItemCard({ 
  id,
  name, 
  description, 
  price, 
  basePrice, 
  image, 
  status, 
  aiStatus,
  isManaged,
  onToggleManagement 
}: MenuItemCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { showToast } = useToast();
  const statusStyle = MENU_ITEM_STATUS[status];
  const aiStatusStyle = aiStatus !== 'NONE' ? MENU_ITEM_STATUS[aiStatus] : null;
  const isWasteRisk = status === 'WASTE_RISK';
  const isDynamic = status === 'DYNAMIC';
  const isAiManaged = aiStatus === 'AI_MANAGED';
  const isAiPending = aiStatus === 'AI_PENDING';

  const handleToggle = async () => {
    setIsToggling(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onToggleManagement();
    showToast(
      isManaged ? 'info' : 'success', 
      isManaged ? 'Manual Mode Enabled' : 'AI Management Enabled',
      `${name} is now ${isManaged ? 'manually managed' : 'AI-managed'}`
    );
    setIsToggling(false);
  };

  return (
    <motion.div
      // {...HOVER_CARD}
      style={{
        background: COLORS.SURFACE_CONTAINER_LOWEST,
        border: isWasteRisk 
          ? `1px solid ${COLORS.ERROR}30` 
          : `1px solid ${COLORS.OUTLINE_VARIANT}`,
        borderRadius: RADIUS.XL,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: SHADOWS.CARD,
      }}
    >
      <div style={{
        height: '160px',
        overflow: 'hidden',
        position: 'relative',
        background: COLORS.SURFACE_CONTAINER_HIGH,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {!imageError ? (
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
            src={image}
            alt={name}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${COLORS.PRIMARY}15, ${COLORS.SECONDARY}15)`,
          }}>
            <span style={{
              fontSize: '40px',
              fontWeight: 700,
              color: COLORS.PRIMARY,
              opacity: 0.6,
            }}>
              {name.charAt(0)}
            </span>
            <span style={{
              fontSize: FONT_SIZES.LABEL_MD,
              color: COLORS.ON_SURFACE_VARIANT,
              marginTop: SPACING.XS,
            }}>
              {name.split(' ')[1] || ''}
            </span>
          </div>
        )}
        
        <div style={{
          position: 'absolute',
          top: SPACING.SM,
          right: SPACING.SM,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: SPACING.XS,
        }}>
          {/* Status Badge */}
          <span style={{
            padding: `${SPACING.XS} ${SPACING.SM}`,
            background: statusStyle.BG,
            color: statusStyle.COLOR,
            fontSize: '10px',
            fontWeight: 700,
            borderRadius: RADIUS.FULL,
            boxShadow: isDynamic ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
          }}>
            {statusStyle.LABEL}
          </span>
          
          {/* AI Status Badge */}
          {aiStatusStyle && (
            <span style={{
              padding: `${SPACING.XS} ${SPACING.SM}`,
              background: isAiManaged ? 'rgba(16, 185, 129, 0.15)' : isAiPending ? 'rgba(245, 158, 11, 0.15)' : COLORS.SURFACE_CONTAINER_HIGH,
              color: isAiManaged ? '#059669' : isAiPending ? '#d97706' : COLORS.ON_SURFACE_VARIANT,
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: RADIUS.FULL,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              {isAiManaged && <Bolt size={12} style={{ fontVariationSettings: "'FILL' 1" }} />}
              {aiStatus === 'MANUAL' && <User size={12} />}
              {isAiPending && <Bolt size={12} style={{ fontVariationSettings: "'FILL' 1" }} />}
              {aiStatusStyle.LABEL}
            </span>
          )}
        </div>
      </div>
      
      <div style={{
        padding: SPACING.MD,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: SPACING.XS,
        }}>
          <h4 style={{
            fontWeight: 600,
            fontSize: FONT_SIZES.BODY_MD,
            color: COLORS.ON_SURFACE,
          }}>
            {name}
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{
              color: isWasteRisk ? COLORS.ERROR : (isDynamic ? COLORS.PRIMARY : COLORS.ON_SURFACE),
              fontWeight: 800,
              fontSize: FONT_SIZES.BODY_MD,
            }}>
              {price}
            </span>
            {basePrice && (
              <span style={{
                fontSize: '10px',
                color: COLORS.ON_SURFACE_VARIANT,
                textDecoration: isWasteRisk ? 'line-through' : 'none',
              }}>
                {basePrice}
              </span>
            )}
          </div>
        </div>
        
        <p style={{
          fontSize: FONT_SIZES.BODY_SM,
          color: COLORS.ON_SURFACE_VARIANT,
          lineHeight: '1.4',
          marginBottom: SPACING.MD,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {description}
        </p>
        
        <div style={{
          marginTop: 'auto',
          paddingTop: SPACING.MD,
          borderTop: `1px solid ${COLORS.OUTLINE_VARIANT}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: TYPOGRAPHY.FONT_LABEL,
            fontSize: FONT_SIZES.LABEL_MD,
            color: COLORS.ON_SURFACE_VARIANT,
          }}>
            Manual Override
          </span>
          
          <label style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            cursor: isToggling ? 'wait' : 'pointer',
          }}>
            <input
              type="checkbox"
              checked={isManaged}
              onChange={() => handleToggle()}
              disabled={isToggling}
              style={{
                appearance: 'none',
                width: '36px',
                height: '20px',
                background: isManaged ? COLORS.PRIMARY : COLORS.OUTLINE_VARIANT,
                borderRadius: RADIUS.FULL,
                cursor: isToggling ? 'wait' : 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            />
            <span style={{
              position: 'absolute',
              top: '2px',
              left: isManaged ? '18px' : '2px',
              width: '16px',
              height: '16px',
              background: 'white',
              borderRadius: '50%',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </label>
        </div>
      </div>
    </motion.div>
  );
}