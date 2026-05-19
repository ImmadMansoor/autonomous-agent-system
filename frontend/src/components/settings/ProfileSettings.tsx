'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { REVEAL_UP } from '@/lib/animations';
import { RippleButton, useToast } from '@/components/layout';
import { api } from '@/lib/api';

export function ProfileSettings() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api.settings.getProfile()
      .then(res => {
        if (active) {
          setFormData({
            name: res.fullName || '',
            email: res.email || '',
            phone: res.phone || '',
            role: res.role || '',
            location: res.location || '',
          });
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.settings.updateProfile({
        fullName: formData.name,
        phone: formData.phone,
        role: formData.role,
        location: formData.location,
      });
      showToast('success', 'Profile updated', 'Your profile information has been saved.');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast('error', 'Error updating profile', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div variants={REVEAL_UP} initial="hidden" animate="visible">
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid #E2E8F0',
        padding: 'var(--space-lg)',
        position: 'relative',
      }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xl)',
            zIndex: 10,
          }}>
            <Loader2 className="animate-spin" size={24} color="var(--primary)" />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            padding: 'var(--space-sm)',
            background: 'var(--primary-container)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <User size={20} color="var(--on-primary-container)" />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'var(--font-size-headline-sm)',
              fontWeight: 600,
              color: 'var(--on-surface)',
            }}>
              Profile Information
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--on-surface-variant)',
            }}>
              Manage your personal details
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          <FormField
            label="Full Name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            icon={<User size={18} />}
            placeholder="Enter your name"
          />
          <FormField
            label="Email Address (Read-Only)"
            value={formData.email}
            onChange={() => {}}
            icon={<Mail size={18} />}
            placeholder="Enter your email"
            type="email"
            readOnly
          />
          <FormField
            label="Phone Number"
            value={formData.phone}
            onChange={(v) => setFormData({ ...formData, phone: v })}
            icon={<Phone size={18} />}
            placeholder="Enter your phone"
            type="tel"
          />
          <FormField
            label="Role"
            value={formData.role}
            onChange={(v) => setFormData({ ...formData, role: v })}
            icon={<User size={18} />}
            placeholder="Your role"
          />
          <FormField
            label="Location"
            value={formData.location}
            onChange={(v) => setFormData({ ...formData, location: v })}
            icon={<MapPin size={18} />}
            placeholder="Your location"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-md)' }}>
            <RippleButton variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </RippleButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}

function FormField({ label, value, onChange, icon, placeholder, type = 'text', readOnly = false }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
      <label style={{
        fontFamily: 'var(--font-label)',
        fontSize: 'var(--font-size-label-md)',
        color: 'var(--on-surface-variant)',
        fontWeight: 500,
      }}>
        {label}
      </label>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        background: readOnly ? 'var(--surface-container-low)' : 'var(--surface-container)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-sm) var(--space-md)',
        border: '1px solid transparent',
        transition: 'all 0.2s',
        opacity: readOnly ? 0.7 : 1,
      }}>
        <span style={{ color: 'var(--on-surface-variant)', display: 'flex' }}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-body-md)',
            color: 'var(--on-surface)',
            cursor: readOnly ? 'not-allowed' : 'text',
          }}
        />
      </div>
    </div>
  );
}