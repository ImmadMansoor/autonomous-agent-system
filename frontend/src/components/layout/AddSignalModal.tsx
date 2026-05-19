'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SPACING, COLORS, RADIUS, SHADOWS } from '@/lib/constants';
import { useToast } from './Toast';

interface AddSignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (signal: {
    type: 'price' | 'inventory' | 'marketing';
    title: string;
    description: string;
    source: 'web' | 'weather' | 'sms' | 'pos';
    sourceLabel: string;
    status: 'parsed' | 'review' | 'automated';
  }) => void;
}

const SIGNAL_TYPES = [
  { value: 'price', label: 'Pricing', icon: '💰' },
  { value: 'inventory', label: 'Inventory', icon: '📦' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
] as const;

export function AddSignalModal({ isOpen, onClose, onAdd }: AddSignalModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    type: 'price' as 'price' | 'inventory' | 'marketing',
    title: '',
    description: '',
    source: 'web' as 'web' | 'weather' | 'sms' | 'pos',
    sourceLabel: 'Manual Entry',
    status: 'review' as 'parsed' | 'review' | 'automated',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    onAdd({
      type: formData.type,
      title: formData.title,
      description: formData.description,
      source: formData.source,
      sourceLabel: formData.sourceLabel,
      status: formData.status,
    });

    showToast('success', 'Signal Added', `New ${formData.type} signal has been added`);
    
    setFormData({
      type: 'price',
      title: '',
      description: '',
      source: 'web',
      sourceLabel: 'Manual Entry',
      status: 'review',
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const inputStyle = {
    width: '100%',
    padding: `${SPACING.SM} ${SPACING.MD}`,
    borderRadius: RADIUS.MD,
    border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
    background: COLORS.SURFACE_CONTAINER_LOWEST,
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    color: COLORS.ON_SURFACE,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-label)',
    fontSize: '12px',
    fontWeight: 600,
    color: COLORS.ON_SURFACE_VARIANT,
    marginBottom: SPACING.XS,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const errorStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    color: COLORS.ERROR,
    marginTop: '4px',
  };

  const typeColors = {
    price: { bg: COLORS.PRIMARY, color: COLORS.ON_PRIMARY },
    inventory: { bg: COLORS.ERROR, color: COLORS.ON_ERROR },
    marketing: { bg: COLORS.TERTIARY, color: COLORS.ON_TERTIARY },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 101,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: COLORS.SURFACE_CONTAINER_LOWEST,
                borderRadius: RADIUS.XL,
                padding: SPACING.XL,
                width: '90%',
                maxWidth: '480px',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: SHADOWS.ELEVATED,
              }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.LG }}>
              <h2 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '24px',
                fontWeight: 600,
                color: COLORS.ON_SURFACE,
                margin: 0,
              }}>
                Add Signal
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: SPACING.XS,
                  color: COLORS.ON_SURFACE_VARIANT,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}>
                <div>
                  <label style={labelStyle}>Signal Type</label>
                  <div style={{ display: 'flex', gap: SPACING.SM }}>
                    {SIGNAL_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('type', type.value)}
                        style={{
                          flex: 1,
                          padding: `${SPACING.MD} ${SPACING.SM}`,
                          borderRadius: RADIUS.MD,
                          border: 'none',
                          fontFamily: 'var(--font-label)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: formData.type === type.value
                            ? typeColors[type.value].bg
                            : COLORS.SURFACE_CONTAINER,
                          color: formData.type === type.value
                            ? typeColors[type.value].color
                            : COLORS.ON_SURFACE_VARIANT,
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Price adjustment detected"
                    style={{
                      ...inputStyle,
                      borderColor: errors.title ? COLORS.ERROR : COLORS.OUTLINE_VARIANT,
                    }}
                  />
                  {errors.title && <p style={errorStyle}>{errors.title}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the signal details..."
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '100px',
                      borderColor: errors.description ? COLORS.ERROR : COLORS.OUTLINE_VARIANT,
                    }}
                  />
                  {errors.description && <p style={errorStyle}>{errors.description}</p>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: SPACING.MD, marginTop: SPACING.XL }}>
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    padding: `${SPACING.MD} ${SPACING.LG}`,
                    borderRadius: RADIUS.LG,
                    border: `1px solid ${COLORS.OUTLINE}`,
                    background: 'transparent',
                    fontFamily: 'var(--font-label)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: COLORS.ON_SURFACE,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    padding: `${SPACING.MD} ${SPACING.LG}`,
                    borderRadius: RADIUS.LG,
                    border: 'none',
                    background: COLORS.PRIMARY,
                    color: COLORS.ON_PRIMARY,
                    fontFamily: 'var(--font-label)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Adding...' : 'Add Signal'}
                </motion.button>
              </div>
            </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}