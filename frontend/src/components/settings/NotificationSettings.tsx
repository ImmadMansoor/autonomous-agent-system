'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, Smartphone, Loader2 } from 'lucide-react';
import { REVEAL_UP } from '@/lib/animations';
import { useToast } from '@/components/layout';
import { api } from '@/lib/api';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, label, description, disabled = false }: ToggleSwitchProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-md)',
      background: 'var(--surface-container)',
      borderRadius: 'var(--radius-lg)',
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
    }}>
      <div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-body-md)',
          fontWeight: 500,
          color: 'var(--on-surface)',
          margin: 0,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-body-sm)',
          color: 'var(--on-surface-variant)',
          margin: 0,
          marginTop: 'var(--space-xs)',
        }}>
          {description}
        </p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        style={{
          width: '48px',
          height: '28px',
          borderRadius: '14px',
          background: checked ? 'var(--primary)' : 'var(--outline-variant)',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
        }}
      >
        <span style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '24px',
          height: '24px',
          borderRadius: '12px',
          background: 'var(--surface)',
          transition: 'all 0.2s',
        }} />
      </button>
    </div>
  );
}

export function NotificationSettings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsAlerts: false,
    approvalAlerts: true,
    inventoryAlerts: true,
    weeklyDigest: true,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let active = true;
    api.settings.getNotifications()
      .then(res => {
        if (active) {
          setSettings(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load notification settings:', err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleToggle = async (key: keyof typeof settings) => {
    if (updating) return;
    const previousSettings = { ...settings };
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setUpdating(true);

    try {
      await api.settings.updateNotifications(updated);
      showToast('success', 'Preferences updated', `Successfully updated notification preferences.`);
    } catch (err) {
      console.error('Failed to update notification settings:', err);
      showToast('error', 'Error updating preferences', 'Please try again.');
      setSettings(previousSettings);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div variants={REVEAL_UP} initial="hidden" animate="visible">
      <div style={{
        background: 'var(--surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--outline-variant)',
        padding: 'var(--space-lg)',
        position: 'relative',
      }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--surface)',
            opacity: 0.8,
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
            background: 'var(--secondary-container)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Bell size={20} color="var(--on-secondary-container)" />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'var(--font-size-headline-sm)',
              fontWeight: 600,
              color: 'var(--on-surface)',
            }}>
              Notification Preferences
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--on-surface-variant)',
            }}>
              Choose how you want to be notified
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <ChannelCard
              icon={<Smartphone size={24} />}
              label="Push"
              active={settings.pushNotifications}
              color="var(--primary)"
              onClick={() => handleToggle('pushNotifications')}
              disabled={updating}
            />
            <ChannelCard
              icon={<Mail size={24} />}
              label="Email"
              active={settings.emailNotifications}
              color="var(--tertiary)"
              onClick={() => handleToggle('emailNotifications')}
              disabled={updating}
            />
            <ChannelCard
              icon={<MessageSquare size={24} />}
              label="SMS"
              active={settings.smsAlerts}
              color="var(--secondary)"
              onClick={() => handleToggle('smsAlerts')}
              disabled={updating}
            />
          </div>

          <ToggleSwitch
            label="Approval Alerts"
            description="Get notified when AI recommendations need your approval"
            checked={settings.approvalAlerts}
            onChange={() => handleToggle('approvalAlerts')}
            disabled={updating}
          />
          <ToggleSwitch
            label="Inventory Alerts"
            description="Critical inventory alerts and stock warnings"
            checked={settings.inventoryAlerts}
            onChange={() => handleToggle('inventoryAlerts')}
            disabled={updating}
          />
          <ToggleSwitch
            label="Weekly Digest"
            description="Receive a weekly summary of operations and insights"
            checked={settings.weeklyDigest}
            onChange={() => handleToggle('weeklyDigest')}
            disabled={updating}
          />
        </div>
      </div>
    </motion.div>
  );
}

interface ChannelCardProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

function ChannelCard({ icon, label, active, color, onClick, disabled = false }: ChannelCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-md)',
        background: active ? `${color}15` : 'var(--surface-container)',
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${active ? color : 'transparent'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        outline: 'none',
        transition: 'all 0.2s',
      }}
    >
      <span style={{ color: active ? color : 'var(--on-surface-variant)' }}>{icon}</span>
      <span style={{
        fontFamily: 'var(--font-label)',
        fontSize: 'var(--font-size-label-md)',
        fontWeight: 500,
        color: active ? color : 'var(--on-surface-variant)',
      }}>
        {label}
      </span>
    </button>
  );
}