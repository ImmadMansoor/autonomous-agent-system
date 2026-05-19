'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar, Navbar, MobileNav, ProtectedRoute } from '@/components/layout';
import { ApprovalsQueue, ApprovalsSidebar, ApprovalDetailModal } from '@/components/approvals';
import { useApprovalsData } from '@/hooks';
import { ApprovalsSkeleton } from '@/components/skeletons';
import { ApprovalItem } from '@/data';

export default function ApprovalsPage() {
  const { data, isLoading, error, approveItem, rejectItem, exportApprovals } = useApprovalsData();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);

  if (error) {
    return (
      <ProtectedRoute>
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'var(--error-container)',
            padding: 'var(--space-xl)',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--on-error-container)' }}>{error}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const pendingCount = data?.pendingApprovals?.length || 0;

  return (
    <ProtectedRoute>
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
        <Navbar 
          title="Operational Intelligence" 
          subtitle={isLoading ? 'Loading...' : `${pendingCount} pending approvals`}
        />
        
        <main style={{ 
          padding: 'var(--space-lg)', 
          paddingTop: 'calc(64px + var(--space-lg))',
          paddingBottom: 'calc(64px + var(--space-lg))',
        }}>
          {isLoading ? (
            <ApprovalsSkeleton />
          ) : (
            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-lg)',
              maxWidth: '1600px', 
              margin: '0 auto',
            }}>
              <div style={{ flex: 1 }}>
                <ApprovalsQueue 
                  pendingApprovals={data.pendingApprovals}
                  onApprove={approveItem}
                  onReject={rejectItem}
                  onExport={exportApprovals}
                  onViewDetails={setSelectedApproval}
                  stats={data.stats}
                  policyLimits={data.policyLimits}
                />
              </div>
              <div style={{ width: '320px', flexShrink: 0 }}>
                <ApprovalsSidebar 
                  recentApprovals={data.recentApprovals}
                  policyLimits={data.policyLimits}
                  aiModelStatus={data.aiModelStatus}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedApproval && (
        <ApprovalDetailModal 
          approval={selectedApproval}
          onClose={() => setSelectedApproval(null)}
          onApprove={(id) => {
            approveItem(id);
            setSelectedApproval(null);
          }}
          onReject={(id) => {
            rejectItem(id);
            setSelectedApproval(null);
          }}
        />
      )}

      <MobileNav />
    </div>
    </ProtectedRoute>
  );
}