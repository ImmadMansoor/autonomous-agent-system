'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, Key, Smartphone, Loader2 } from 'lucide-react';
import { REVEAL_UP } from '@/lib/animations';
import { RippleButton, useToast } from '@/components/layout';
import { api } from '@/lib/api';

export function SecuritySettings() {
  const { showToast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [updating2FA, setUpdating2FA] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    let active = true;
    api.settings.getSecurity()
      .then(res => {
        if (active) {
          setTwoFactorEnabled(res.twoFactorEnabled);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load security settings:', err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      showToast('error', 'Fields required', 'Please fill out all password fields.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showToast('error', 'Password mismatch', 'New passwords do not match.');
      return;
    }
    if (passwords.new.length < 8) {
      showToast('error', 'Password too short', 'Password must be at least 8 characters.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.settings.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      showToast('success', 'Password updated', 'Your password has been changed successfully.');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      console.error('Failed to update password:', err);
      showToast('error', 'Password change failed', err.message || 'Please check your current password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    if (updating2FA) return;
    const targetState = !twoFactorEnabled;
    setUpdating2FA(true);
    try {
      await api.settings.toggle2FA(targetState);
      setTwoFactorEnabled(targetState);
      showToast(
        'success',
        targetState ? '2FA Enabled' : '2FA Disabled',
        targetState ? 'Two-factor authentication is now active.' : 'Two-factor authentication has been disabled.'
      );
    } catch (err: any) {
      console.error('Failed to toggle 2FA:', err);
      showToast('error', '2FA Update Failed', err.message || 'Please try again.');
    } finally {
      setUpdating2FA(false);
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
            background: 'var(--error-container)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Lock size={20} color="var(--on-error-container)" />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'var(--font-size-headline-sm)',
              fontWeight: 600,
              color: 'var(--on-surface)',
            }}>
              Security Settings
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--on-surface-variant)',
            }}>
              Manage your account security
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div>
            <h4 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'var(--font-size-body-md)',
              fontWeight: 600,
              color: 'var(--on-surface)',
              marginBottom: 'var(--space-md)',
            }}>
              Change Password
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <PasswordField
                label="Current Password"
                value={passwords.current}
                onChange={(v) => setPasswords({ ...passwords, current: v })}
                show={showCurrentPassword}
                onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={updatingPassword}
              />
              <PasswordField
                label="New Password"
                value={passwords.new}
                onChange={(v) => setPasswords({ ...passwords, new: v })}
                show={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
                disabled={updatingPassword}
              />
              <PasswordField
                label="Confirm New Password"
                value={passwords.confirm}
                onChange={(v) => setPasswords({ ...passwords, confirm: v })}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={updatingPassword}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <RippleButton variant="primary" onClick={handleChangePassword} disabled={updatingPassword}>
                  {updatingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </RippleButton>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 'var(--space-lg)' }}>
            <h4 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'var(--font-size-body-md)',
              fontWeight: 600,
              color: 'var(--on-surface)',
              marginBottom: 'var(--space-md)',
            }}>
              Two-Factor Authentication
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-md)',
              background: 'var(--surface-container)',
              borderRadius: 'var(--radius-lg)',
              opacity: updating2FA ? 0.7 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{
                  padding: 'var(--space-sm)',
                  background: twoFactorEnabled ? 'var(--primary-container)' : 'var(--surface-container-high)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {updating2FA ? (
                    <Loader2 className="animate-spin" size={20} color="var(--primary)" />
                  ) : (
                    <Smartphone size={20} color={twoFactorEnabled ? 'var(--on-primary-container)' : 'var(--on-surface-variant)'} />
                  )}
                </div>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-body-md)',
                    fontWeight: 500,
                    color: 'var(--on-surface)',
                    margin: 0,
                  }}>
                    {twoFactorEnabled ? '2FA is enabled' : '2FA is disabled'}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-body-sm)',
                    color: 'var(--on-surface-variant)',
                    margin: 0,
                  }}>
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggle2FA}
                disabled={updating2FA}
                style={{
                  width: '48px',
                  height: '28px',
                  borderRadius: '14px',
                  background: twoFactorEnabled ? 'var(--primary)' : 'var(--outline-variant)',
                  border: 'none',
                  cursor: updating2FA ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  left: twoFactorEnabled ? '22px' : '2px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '12px',
                  background: 'white',
                  transition: 'all 0.2s',
                }} />
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 'var(--space-lg)' }}>
            <h4 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'var(--font-size-body-md)',
              fontWeight: 600,
              color: 'var(--on-surface)',
              marginBottom: 'var(--space-md)',
            }}>
              Active Sessions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <SessionItem
                device="Chrome on MacOS"
                location="San Francisco, CA"
                current
                lastActive="Now"
              />
              <SessionItem
                device="Safari on iPhone"
                location="San Francisco, CA"
                current={false}
                lastActive="2 hours ago"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function PasswordField({ label, value, onChange, show, onToggle, disabled = false }: PasswordFieldProps) {
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
        background: 'var(--surface-container)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-sm) var(--space-md)',
        opacity: disabled ? 0.6 : 1,
      }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-body-md)',
            color: 'var(--on-surface)',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        <button
          onClick={onToggle}
          disabled={disabled}
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: 'var(--on-surface-variant)',
            display: 'flex',
            padding: 'var(--space-xs)',
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

interface SessionItemProps {
  device: string;
  location: string;
  current: boolean;
  lastActive: string;
}

function SessionItem({ device, location, current, lastActive }: SessionItemProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-md)',
      background: 'var(--surface-container)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div style={{
          padding: 'var(--space-sm)',
          background: 'var(--surface-container-high)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Key size={18} color="var(--on-surface-variant)" />
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-body-md)',
            fontWeight: 500,
            color: 'var(--on-surface)',
            margin: 0,
          }}>
            {device}
            {current && (
              <span style={{
                marginLeft: 'var(--space-sm)',
                fontSize: 'var(--font-size-label-md)',
                color: 'var(--primary)',
                fontWeight: 600,
              }}>
                Current
              </span>
            )}
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-body-sm)',
            color: 'var(--on-surface-variant)',
            margin: 0,
          }}>
            {location} · {lastActive}
          </p>
        </div>
      </div>
      {!current && (
        <RippleButton variant="ghost" style={{ color: 'var(--error)' }}>
          Revoke
        </RippleButton>
      )}
    </div>
  );
}