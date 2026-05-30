'use client';

import { motion } from 'framer-motion';
import { Sidebar, Navbar, MobileNav, ProtectedRoute } from '@/components/layout';
import { ProfileSettings, NotificationSettings, AIPreferences, SecuritySettings } from '@/components/settings';
import { STAGGER_CONTAINER } from '@/lib/animations';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />

      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
        <Navbar
          title="Settings"
          subtitle="Manage your account and preferences"
        />

        <main style={{
          padding: 'var(--space-lg)',
          paddingTop: 'calc(64px + var(--space-lg))',
          paddingBottom: 'calc(64px + var(--space-lg))',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-xl)',
            }}
          >
            <ProfileSettings />
            <NotificationSettings />
            <AIPreferences />
            <SecuritySettings />
          </motion.div>
        </main>
      </div>

      <MobileNav />
    </div>
    </ProtectedRoute>
  );
}