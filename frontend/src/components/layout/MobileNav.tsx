'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, CheckSquare, CheckCircle, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Ops', href: '/', activeIcon: true },
  { icon: CheckSquare, label: 'Planner', href: '/planner', activeIcon: false },
  { icon: CheckCircle, label: 'Approve', href: '/approvals', activeIcon: false },
  { icon: BarChart3, label: 'Intel', href: '/analytics', activeIcon: false },
  { icon: Settings, label: 'Settings', href: '/settings', activeIcon: false },
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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--surface)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--outline-variant)',
      padding: 'var(--space-sm) var(--space-lg)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 50,
    }}>
      {navItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '8px',
            }}
          >
            <Icon 
              size={24} 
              color={isActive ? 'var(--primary)' : 'var(--on-surface-variant)'} 
              style={isActive && item.activeIcon ? { fontVariationSettings: "'FILL' 1" } : undefined}
            />
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
              marginTop: '2px',
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
