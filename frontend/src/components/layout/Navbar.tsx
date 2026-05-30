'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Activity, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { BUTTON_ANIMATION } from '@/lib/animations';
import { useAuth } from '@/lib/auth';
import { DotText } from '@/components/ui';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export function Navbar({
  title = 'Dashboard',
  subtitle
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string | number, message: string, time: string, read: boolean }>>([]);
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('menumind_theme');
    const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark-theme', initialTheme === 'dark');
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('menumind_theme', nextTheme);
    document.documentElement.classList.toggle('dark-theme', nextTheme === 'dark');
    document.documentElement.dataset.theme = nextTheme;
  };

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const { api } = await import('@/lib/api');
        const signals = await api.operations.getSignals();
        
        const readIds = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('menumind_read_notifications') || '[]')
          : [];
        const readIdsStrings = Array.isArray(readIds) ? readIds.map(String) : [];
        
        setNotifications(signals.slice(0, 5).map(s => ({
          id: s.id,
          message: s.message,
          time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: readIdsStrings.includes(String(s.id)),
        })));
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    }
    
    fetchNotifications();

    const interval = window.setInterval(fetchNotifications, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string | number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    if (typeof window !== 'undefined') {
      try {
        const readIds = JSON.parse(localStorage.getItem('menumind_read_notifications') || '[]');
        const readIdsStrings = Array.isArray(readIds) ? readIds.map(String) : [];
        if (!readIdsStrings.includes(String(id))) {
          readIdsStrings.push(String(id));
          localStorage.setItem('menumind_read_notifications', JSON.stringify(readIdsStrings));
        }
      } catch (e) {
        console.error('Error saving read notification to localStorage:', e);
      }
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    if (typeof window !== 'undefined') {
      try {
        const readIds = JSON.parse(localStorage.getItem('menumind_read_notifications') || '[]');
        const readIdsStrings = Array.isArray(readIds) ? readIds.map(String) : [];
        notifications.forEach(n => {
          if (!readIdsStrings.includes(String(n.id))) {
            readIdsStrings.push(String(n.id));
          }
        });
        localStorage.setItem('menumind_read_notifications', JSON.stringify(readIdsStrings));
      } catch (e) {
        console.error('Error saving read notifications to localStorage:', e);
      }
    }
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-width)',
      right: 0,
      height: '64px',
      background: 'var(--surface)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--outline-variant)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-lg)',
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div>
          <DotText as="h2" size="md" style={{ color: 'var(--text-display)' }}>
            {title.replace(/\s+/g, ' ').toUpperCase()}
          </DotText>
          {subtitle && (
            <p style={{ marginTop: '6px' }}>
              <span className="label-caps" style={{ marginRight: '8px' }}>
                Updated
              </span>
              {(() => {
                const match = subtitle.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
                if (!match) {
                  return (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-label-md)',
                      color: 'var(--on-surface-variant)',
                    }}>
                      {subtitle}
                    </span>
                  );
                }
                const [, h, m, s] = match;
                const formattedTime = `${h}:${m}${s != null ? `:${s}` : ''}`;
                return (
                  <span className="data-number data-number-sm" style={{ color: 'var(--on-surface-variant)' }}>
                    {formattedTime}
                  </span>
                );
              })()}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        {/* Nothing Mechanical Theme Toggle */}
        <div
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--surface-container-high)',
            border: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-full)',
            padding: '2px',
            cursor: 'pointer',
            position: 'relative',
            width: '56px',
            height: '28px',
            userSelect: 'none',
            transition: 'border-color 0.2s',
            marginRight: '8px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--outline)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--outline-variant)'}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {/* Knob */}
          <motion.div
            animate={{ x: theme === 'dark' ? 26 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              left: '3px',
              top: '2px',
              boxShadow: 'none',
            }}
          >
            {/* Red LED accent dot in Nothing Style */}
            <span style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#d71921',
              display: 'block',
            }} />
          </motion.div>

          {/* Background dot labels */}
          <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            padding: '0 8px',
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--on-surface-variant)',
            pointerEvents: 'none',
            lineHeight: 1,
            alignItems: 'center',
          }}>
            <span style={{ opacity: theme === 'light' ? 0.2 : 0.8 }}>D</span>
            <span style={{ opacity: theme === 'dark' ? 0.2 : 0.8 }}>L</span>
          </div>
        </div>

        <motion.button
          {...BUTTON_ANIMATION}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            position: 'relative',
          }}
          title="System Status"
        >
          <Activity size={20} color="var(--on-surface-variant)" />
        </motion.button>

        <div ref={notificationRef} style={{ position: 'relative' }}>
          <motion.button
            {...BUTTON_ANIMATION}
            onClick={() => {
              const nextState = !showNotifications;
              setShowNotifications(nextState);
              if (nextState) {
                markAllAsRead();
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Bell size={20} color="var(--on-surface-variant)" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                minWidth: '20px',
                height: '20px',
                borderRadius: '4px',
                background: 'var(--nothing-accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}>
                <DotText size="sm" style={{ fontSize: '12px', color: '#fff' }}>
                  {unreadCount}
                </DotText>
              </span>
            )}
          </motion.button>

          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 'var(--space-sm)',
                width: '360px',
                background: 'var(--surface-container-high)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--outline-variant)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                zIndex: 100,
              }}
            >
<div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-md)',
                borderBottom: '1px solid var(--outline-variant)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-label)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      style={{
                        padding: 'var(--space-md)',
                        borderBottom: '1px solid var(--outline-variant)',
                        background: notification.read ? 'transparent' : 'var(--primary-container)',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--font-size-label-sm)',
                        color: notification.read ? 'var(--on-surface)' : 'var(--on-primary-container)',
                        marginBottom: '4px',
                      }}>
                        {notification.message}
                      </p>
                      <span style={{
                        fontSize: 'var(--font-size-body-sm)',
                        color: notification.read ? 'var(--on-surface-variant)' : 'white',
                      }}>
                        {notification.time}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <motion.button
            {...BUTTON_ANIMATION}
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid var(--primary)',
            }}>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq6vxHjY1y2B2GeMVrxu8oYkkQR7XxYE5wD5IZ1HcL0LmSHnGSY4vYNfETaeD9P_Dr1yemrIr3FY_dfyw-cXgxjEzd6b6lwxgTXTpGn-eGXL243DinbapKDezRDr5bvvzG7dSKY1hZBCzJJ7Lbn86aKrOssl3rKXXl3xdmz9yea7QG0YJncdF6Wo5OPCvldoMD8hcMvcfmmkC5-Xd9k7yVM_9IStlavM6LjJE-vE_bGBg1_8o5xrc8EpV2g0lB26eSCnXkAxJj7Eg"
                alt="Manager"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <ChevronDown size={16} color="var(--on-surface-variant)" />
          </motion.button>

          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 'var(--space-xs)',
                width: '200px',
                background: 'var(--surface-container-high)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--outline-variant)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                zIndex: 100,
              }}
            >
              <div style={{
                padding: 'var(--space-md)',
                borderBottom: '1px solid var(--outline-variant)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-label)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                }}>
                  Manager
                </p>
                <p style={{
                  fontSize: 'var(--font-size-label-sm)',
                  color: 'var(--on-surface-variant)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  manager@menumind.com
                </p>
              </div>
              <Link href="/settings" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-md)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-lowest)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={16} color="var(--on-surface-variant)" />
                  <span style={{
                    fontFamily: 'var(--font-label)',
                    color: 'var(--on-surface)',
                  }}>
                    Settings
                  </span>
                </div>
              </Link>
              <div
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-md)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-lowest)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={16} color="var(--on-surface-variant)" />
                <span style={{
                  fontFamily: 'var(--font-label)',
                  color: 'var(--error)',
                }}>
                  Logout
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
