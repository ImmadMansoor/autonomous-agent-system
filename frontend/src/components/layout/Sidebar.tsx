'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare,
  CheckCircle, 
  BarChart3, 
  Package,
  Brain,
  FileText,
  ClipboardList,
  Settings,
  LogOut
} from 'lucide-react';
import { BUTTON_ANIMATION } from '@/lib/animations';
import { useAuth } from '@/lib/auth';
import { DotText } from '@/components/ui';

const mainNavItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Operations', href: '/' },
  { icon: <CheckSquare size={20} />, label: 'Planner', href: '/planner' },
  { icon: <CheckCircle size={20} />, label: 'Approvals', href: '/approvals' },
  { icon: <ClipboardList size={20} />, label: 'Audit Log', href: '/audit-log' },
  { icon: <BarChart3 size={20} />, label: 'Intelligence', href: '/analytics' },
  { icon: <Package size={20} />, label: 'Inventory', href: '/inventory' },
  { icon: <FileText size={20} />, label: 'AI Logs', href: '/logs' },
];

const bottomNavItems = [
  { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
];

function normalizePath(path: string | null) {
  if (!path || path === '/') {
    return '/';
  }

  return path.replace(/\/+$/, '');
}

function isActivePath(pathname: string | null, href: string) {
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(href);

  if (targetPath === '/') {
    return currentPath === '/';
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--surface-container-low)',
      borderRight: '1px solid var(--outline-variant)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--space-md)',
      gap: 'var(--space-sm)',
      zIndex: 100,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-sm)',
        paddingBottom: 'var(--space-md)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'var(--primary)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Brain size={20} color="var(--on-primary)" style={{ fontVariationSettings: "'FILL' 1" }} />
        </div>
        <div>
          <DotText as="h1" size="md" style={{ color: 'var(--text-display)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            MenuMind
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d71921', display: 'inline-block' }} />
          </DotText>
          <p style={{
            fontFamily: 'var(--font-label)',
            fontSize: 'var(--font-size-label-md)',
            color: 'var(--on-surface-variant)',
          }}>
            Cafe Operations
          </p>
        </div>
      </div>

      <nav style={{ flex: 1, paddingTop: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {mainNavItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <motion.button
                {...BUTTON_ANIMATION}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-xl)',
                  background: isActive ? 'var(--primary-container)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  color: isActive ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                }}>
                  {item.label}
                </span>
              </motion.button>
            </Link>
          );
        })}
      </nav>

      <div style={{ paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {bottomNavItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <motion.button
                {...BUTTON_ANIMATION}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-xl)',
                  background: isActive ? 'var(--primary-container)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  color: isActive ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                }}>
                  {item.label}
                </span>
              </motion.button>
            </Link>
          );
        })}
        <motion.button
          {...BUTTON_ANIMATION}
          onClick={() => {
            logout();
            router.push('/login');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-xl)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <span style={{ color: 'var(--on-surface-variant)' }}>
            <LogOut size={20} />
          </span>
          <span style={{
            fontFamily: 'var(--font-label)',
            fontSize: '14px',
            color: 'var(--on-surface-variant)',
          }}>
            Logout
          </span>
        </motion.button>
      </div>
    </aside>
  );
}
