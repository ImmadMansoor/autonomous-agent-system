'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar, Navbar, MobileNav, AddSignalModal, ProtectedRoute } from '@/components/layout';
import { SystemThroughput, SignalsFeed, AIInterpretationPanel, BusinessImpact } from '@/components/analytics';
import { STAGGER_CONTAINER } from '@/lib/animations';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { SPACING, COLORS, RADIUS, SHADOWS } from '@/lib/constants';
import { Skeleton } from '@/components/skeletons';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api';

function AnalyticsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.LG }}>
      {/* System Throughput Skeleton */}
      <div style={{
        background: COLORS.SURFACE_CONTAINER_LOWEST,
        borderRadius: RADIUS.XL,
        padding: SPACING.LG,
        border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
      }}>
        <Skeleton height="20px" width="180px" style={{ marginBottom: SPACING.MD }} />
        <div style={{ display: 'flex', gap: SPACING.SM, height: '200px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SPACING.XS }}>
              <Skeleton height={`${Math.random() * 100 + 50}px`} width="100%" borderRadius="var(--radius-md)" />
              <Skeleton height="12px" width="30px" />
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.LG }}>
        {/* Signals Feed Skeleton */}
        <div style={{
          background: COLORS.SURFACE_CONTAINER_LOWEST,
          borderRadius: RADIUS.XL,
          padding: SPACING.LG,
          border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
        }}>
          <Skeleton height="24px" width="150px" style={{ marginBottom: SPACING.MD }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ padding: SPACING.MD, background: COLORS.SURFACE_CONTAINER, borderRadius: RADIUS.LG }}>
                <Skeleton height="16px" width="80px" style={{ marginBottom: SPACING.XS }} />
                <Skeleton height="14px" width="100%" />
              </div>
            ))}
          </div>
        </div>

        {/* AI Interpretation Skeleton */}
        <div style={{
          background: COLORS.SURFACE_CONTAINER_LOWEST,
          borderRadius: RADIUS.XL,
          border: `1px solid ${COLORS.PRIMARY}20`,
          overflow: 'hidden',
        }}>
          <div style={{ padding: SPACING.LG, borderBottom: `1px solid ${COLORS.OUTLINE_VARIANT}`, display: 'flex', alignItems: 'center', gap: SPACING.MD }}>
            <Skeleton width="48px" height="48px" borderRadius="var(--radius-lg)" />
            <div>
              <Skeleton height="20px" width="150px" />
              <Skeleton height="14px" width="100px" style={{ marginTop: SPACING.XS }} />
            </div>
          </div>
          <div style={{ padding: SPACING.LG, display: 'flex', flexDirection: 'column', gap: SPACING.XL }}>
            <div>
              <Skeleton height="14px" width="140px" style={{ marginBottom: SPACING.MD }} />
              <Skeleton height="60px" width="100%" borderRadius="var(--radius-lg)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.MD }}>
              <Skeleton height="100px" borderRadius="var(--radius-xl)" />
              <Skeleton height="100px" borderRadius="var(--radius-xl)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} height="80px" borderRadius="var(--radius-xl)" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [isSignalModalOpen, setIsSignalModalOpen] = useState(false);
  const [latestRun, setLatestRun] = useState<any | null>(null);
  const {
    signals,
    selectedSignalId,
    selectSignal,
    recommendations,
    pendingRecommendations,
    executeRecommendation,
    executeAllRecommendations,
    dismissRecommendation,
    dismissAllRecommendations,
    interpretation,
    throughputData,
    isLoading,
    isExecuting,
    stats,
    addSignal,
  } = useAnalyticsData();

  useEffect(() => {
    let isActive = true;
    const fetchLatestRun = async () => {
      try {
        const runData = await api.operations.getLatestRun();
        if (isActive) {
          setLatestRun(runData);
        }
      } catch (err) {
        console.error('Failed to load latest run in Analytics:', err);
      }
    };
    
    fetchLatestRun();
    const interval = setInterval(fetchLatestRun, 8000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <ProtectedRoute>
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
        <Navbar 
          title="Intelligence" 
          subtitle={`${stats.newSignalsToday} signals processed today`}
        />
        
        <main style={{ 
          padding: `${SPACING.LG} ${SPACING.XL}`, 
          paddingTop: 'calc(64px + 24px)',
          paddingBottom: 'calc(64px + 24px)',
        }}>
          {isLoading ? (
            <AnalyticsSkeleton />
          ) : (
            <motion.div
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="visible"
              style={{ 
                maxWidth: '1400px', 
                margin: '0 auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: SPACING.LG 
              }}
            >
            {/* System Throughput Section */}
            <SystemThroughput data={throughputData} />

            {/* Business Impact Section */}
            <BusinessImpact latestRun={latestRun} />
            
            {/* Two Column Content Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: SPACING.GUTTER,
            }}>
              <div style={{ gridColumn: 'span 5' }}>
                <SignalsFeed 
                  signals={signals}
                  selectedSignalId={selectedSignalId}
                  onSelectSignal={selectSignal}
                  newSignalsCount={stats.newSignalsToday}
                />
              </div>
              <div style={{ gridColumn: 'span 7' }}>
                <AIInterpretationPanel 
                  interpretation={interpretation}
                  recommendations={recommendations}
                  pendingRecommendations={pendingRecommendations}
                  avgConfidence={stats.avgConfidence}
                  onExecuteRecommendation={executeRecommendation}
                  onExecuteAll={executeAllRecommendations}
                  onDismissRecommendation={dismissRecommendation}
                  onDismissAll={dismissAllRecommendations}
                  isExecuting={isExecuting}
                />
              </div>
            </div>
          </motion.div>
          )}
        </main>
      </div>

      <MobileNav />
      
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed',
          right: '32px',
          bottom: '32px',
          width: '56px',
          height: '56px',
          borderRadius: RADIUS.XL,
          background: COLORS.PRIMARY,
          color: COLORS.ON_PRIMARY,
          boxShadow: SHADOWS.ELEVATED,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          zIndex: 50,
        }}
        onClick={() => setIsSignalModalOpen(true)}
      >
        <Plus size={28} />
      </motion.button>

      <AddSignalModal
        isOpen={isSignalModalOpen}
        onClose={() => setIsSignalModalOpen(false)}
        onAdd={addSignal}
      />
    </div>
    </ProtectedRoute>
  );
}