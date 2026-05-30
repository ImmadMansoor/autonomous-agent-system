'use client';

import { motion } from 'framer-motion';
import { Sidebar, Navbar, MobileNav } from '@/components/layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { HeroStatus, MetricsTicker, ActiveReasoning, NeedsAttention, AISuggestion, SignalInput } from '@/components/dashboard';
import { STAGGER_CONTAINER } from '@/lib/animations';
import { useOperationsData } from '@/hooks';
import { 
  HeroStatusSkeleton, 
  MetricsTickerSkeleton, 
  ActiveReasoningSkeleton, 
  NeedsAttentionSkeleton, 
  AISuggestionSkeleton, 
  SignalInputSkeleton 
} from '@/components/skeletons';

export default function Home() {
  const { data, isLoading, error, handleAttentionAction, dismissAISuggestion, updateAISuggestion, addReasoningItem } = useOperationsData();

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

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
        <Sidebar />
        
        <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
          <Navbar 
            title="Operations Console" 
            subtitle={isLoading ? 'Loading...' : `Last updated: ${data.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`}
          />
          
          <main style={{ 
            padding: 'var(--space-lg) var(--space-xl)', 
            paddingTop: 'calc(64px + var(--space-lg))',
            paddingBottom: 'calc(64px + var(--space-lg))',
          }}>
            <motion.div
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="visible"
              style={{ 
                maxWidth: '1400px', 
                margin: '0 auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'var(--space-lg)' 
              }}
            >
              {isLoading ? (
                <>
                  <HeroStatusSkeleton />
                  <MetricsTickerSkeleton />
                  <SignalInputSkeleton />
                  <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: 'var(--space-gutter)',
                  }}>
                    <div style={{ gridColumn: 'span 8' }}>
                      <ActiveReasoningSkeleton />
                    </div>
                    <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 'var(--space-gutter)' }}>
                      <NeedsAttentionSkeleton />
                      <AISuggestionSkeleton />
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <HeroStatus 
                    systemHealth={data.systemHealth}
                    nextCycle={data.nextCycle}
                  />
                  <MetricsTicker 
                    metrics={data.metrics}
                    liveSignals={data.liveSignals}
                  />
                  <SignalInput 
                    onSignalSubmit={(signal) => {
                      addReasoningItem({
                        type: signal.type,
                        title: signal.title,
                        description: signal.description,
                        confidence: signal.confidence,
                      });
                    }}
                  />
                  
                  <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: 'var(--space-gutter)',
                  }}>
                    <div style={{ gridColumn: 'span 8' }}>
                      <ActiveReasoning items={data.reasoningItems} />
                    </div>
                    <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 'var(--space-gutter)' }}>
                      <NeedsAttention 
                        items={data.attentionItems}
                        onAction={handleAttentionAction}
                      />
                      <AISuggestion 
                        suggestion={data.aiSuggestion}
                        onApply={() => updateAISuggestion({ message: 'Applied successfully!' })}
                        onDismiss={dismissAISuggestion}
                      />
                    </div>
                  </section>
                </>
              )}
            </motion.div>
          </main>
        </div>

        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}