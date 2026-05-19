'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { SPACING, COLORS, RADIUS, SHADOWS } from '@/lib/constants';
import { useToast } from './Toast';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    description: string;
    price: string;
    basePrice: string;
    image: string;
    status: 'DYNAMIC' | 'FIXED' | 'WASTE_RISK';
  }) => void;
}

export function AddInventoryModal({ isOpen, onClose, onAdd }: AddInventoryModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    basePrice: '',
    image: '',
    status: 'FIXED' as 'DYNAMIC' | 'FIXED' | 'WASTE_RISK',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    if (formData.price && isNaN(parseFloat(formData.price.replace('$', '')))) {
      newErrors.price = 'Invalid price format';
    }
    if (formData.basePrice && isNaN(parseFloat(formData.basePrice.replace('$', '')))) {
      newErrors.basePrice = 'Invalid base price format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const priceValue = formData.price.includes('$') ? formData.price : `$${formData.price}`;
    const basePriceValue = formData.basePrice
      ? formData.basePrice.includes('$') ? formData.basePrice : `$${formData.basePrice}`
      : `${parseFloat(formData.price.replace('$', ''))} base`;

    onAdd({
      name: formData.name,
      description: formData.description,
      price: priceValue,
      basePrice: basePriceValue,
      image: formData.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&q=80',
      status: formData.status,
    });

    showToast('success', 'Item Added', `${formData.name} has been added to inventory`);
    
    setFormData({
      name: '',
      description: '',
      price: '',
      basePrice: '',
      image: '',
      status: 'FIXED',
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
                Add Menu Item
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
                  <label style={labelStyle}>Item Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Cappuccino"
                    style={{
                      ...inputStyle,
                      borderColor: errors.name ? COLORS.ERROR : COLORS.OUTLINE_VARIANT,
                    }}
                  />
                  {errors.name && <p style={errorStyle}>{errors.name}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the item"
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '80px',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.MD }}>
                  <div>
                    <label style={labelStyle}>Price *</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="$0.00"
                      style={{
                        ...inputStyle,
                        borderColor: errors.price ? COLORS.ERROR : COLORS.OUTLINE_VARIANT,
                      }}
                    />
                    {errors.price && <p style={errorStyle}>{errors.price}</p>}
                  </div>

                  <div>
                    <label style={labelStyle}>Base Price</label>
                    <input
                      type="text"
                      value={formData.basePrice}
                      onChange={(e) => handleInputChange('basePrice', e.target.value)}
                      placeholder="$0.00 base"
                      style={{
                        ...inputStyle,
                        borderColor: errors.basePrice ? COLORS.ERROR : COLORS.OUTLINE_VARIANT,
                      }}
                    />
                    {errors.basePrice && <p style={errorStyle}>{errors.basePrice}</p>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Status</label>
                  <div style={{ display: 'flex', gap: SPACING.SM }}>
                    {(['FIXED', 'DYNAMIC', 'WASTE_RISK'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleInputChange('status', status)}
                        style={{
                          padding: `${SPACING.SM} ${SPACING.MD}`,
                          borderRadius: RADIUS.MD,
                          border: 'none',
                          fontFamily: 'var(--font-label)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: formData.status === status
                            ? COLORS.PRIMARY
                            : COLORS.SURFACE_CONTAINER,
                          color: formData.status === status
                            ? COLORS.ON_PRIMARY
                            : COLORS.ON_SURFACE_VARIANT,
                          transition: 'all 0.2s',
                        }}
                      >
                        {status === 'WASTE_RISK' ? 'Waste Risk' : status.charAt(0) + status.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
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
                  {isSubmitting ? 'Adding...' : 'Add Item'}
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