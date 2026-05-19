'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar, Navbar, MobileNav, AddInventoryModal, ProtectedRoute } from '@/components/layout';
import { InventorySkeleton } from '@/components/skeletons';
import { AIInsightCard, InventoryRiskPanel, DynamicMenuConsole, OperationalTrendChart, LiveSignalsFeed } from '@/components/inventory';
import { STAGGER_CONTAINER } from '@/lib/animations';
import { useInventoryData } from '@/hooks/useInventoryData';
import { SPACING, COLORS, RADIUS, SHADOWS } from '@/lib/constants';
import { Plus, Sparkles, Bolt } from 'lucide-react';

export default function InventoryPage() {
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const {
    aiInsights,
    inventoryRisks,
    menuItems,
    totalItems,
    currentPage,
    totalPages,
    setCurrentPage,
    liveSignals,
    trendMetrics,
    trendData,
    timePeriod,
    setTimePeriod,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    isLoading,
    dismissInsight,
    executeInsightAction,
    toggleMenuItemManagement,
    markSignalRead,
    dismissRisk,
    showAllAlerts,
    stats,
    addMenuItem,
  } = useInventoryData();

  return (
    <ProtectedRoute>
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
        <Navbar
          title="Menu & Inventory Logic"
          subtitle={isLoading ? 'Loading...' : undefined}
        />

        <main style={{
          padding: `${SPACING.LG} ${SPACING.XL}`,
          paddingTop: 'calc(64px + 24px)',
          paddingBottom: 'calc(64px + 24px)',
        }}>
          {isLoading ? (
            <InventorySkeleton />
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
              
            }}
          >
            {/* AI Intelligence Recommendations (Glassmorphism) */}
            <section style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: SPACING.XL,
            }}>
              <div style={{ gridColumn: 'span 2' }}>
                {/* Glassmorphism AI Insight Card */}
                <motion.div
                  variants={STAGGER_CONTAINER}
                  initial="hidden"
                  animate="visible"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${COLORS.TERTIARY}20`,
                    borderRadius: RADIUS.XL,
                    padding: SPACING.LG,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: SHADOWS.CARD,
                    height: '100%',
                  }}
                >
                  <div style={{ position: 'absolute', top: SPACING.MD, right: SPACING.MD }}>
                    <Sparkles 
                      size={48} 
                      color={COLORS.TERTIARY} 
                      style={{ opacity: 0.2, fontVariationSettings: "'FILL' 1" }} 
                    />
                  </div>
                  
                  <div>
                    {aiInsights.map((insight) => (
                      <div key={insight.id} style={{marginBottom:"32px"}}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: SPACING.SM,
                          marginBottom: SPACING.SM,
                        }}>
                          <span style={{
                            padding: `${SPACING.XS} ${SPACING.SM}`,
                            background: `${COLORS.TERTIARY}10`,
                            color: COLORS.TERTIARY,
                            borderRadius: RADIUS.FULL,
                            fontFamily: 'var(--font-label)',
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            AI Insight
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-label)',
                            fontSize: '12px',
                            color: COLORS.ON_SURFACE_VARIANT,
                            textDecoration: 'underline',
                          }}>
                            {insight.insightType}
                          </span>
                        </div>
                        
                        <h2 style={{
                          fontFamily: 'var(--font-headline)',
                          fontSize: '24px',
                          fontWeight: 600,
                          color: COLORS.ON_SURFACE,
                          marginBottom: SPACING.MD,
                        }}>
                          {insight.title}
                        </h2>
                        
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '16px',
                          color: COLORS.ON_SURFACE_VARIANT,
                          maxWidth: '500px',
                        }}>
                          {insight.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{
                    marginTop: SPACING.XL,
                    display: 'flex',
                    alignItems: 'center',
                    gap: SPACING.MD,
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => aiInsights[0] && executeInsightAction(aiInsights[0].id)}
                      style={{
                        background: COLORS.PRIMARY,
                        color: COLORS.ON_PRIMARY,
                        padding: `${SPACING.SM} ${SPACING.LG}`,
                        borderRadius: RADIUS.LG,
                        border: 'none',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: SPACING.SM,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 104, 95, 0.3)',
                      }}
                    >
                      <Bolt size={18} style={{ fontVariationSettings: "'FILL' 1" }} />
                      {aiInsights[0]?.actionLabel || 'Execute Recommendation'}
                    </motion.button>
                    
                    <button 
                      onClick={() => aiInsights[0] && dismissInsight(aiInsights[0].id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontFamily: 'var(--font-label)',
                        fontSize: '12px',
                        color: COLORS.ON_SURFACE_VARIANT,
                        cursor: 'pointer',
                      }}
                    >
                      Dismiss Suggestion
                    </button>
                  </div>
                </motion.div>
              </div>
              
              <InventoryRiskPanel 
                items={inventoryRisks}
                onDismiss={dismissRisk}
                onViewAll={showAllAlerts}
              />
            </section>

            {/* Dynamic Menu Console with Search, Filter, Sort, Pagination */}
            <DynamicMenuConsole 
              menuItems={menuItems}
              onToggleManagement={toggleMenuItemManagement}
              totalItems={totalItems}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              filter={filter}
              onFilterChange={setFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Live Operations Feed (Bento Style) */}
            <section style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: SPACING.XL,
              marginTop:"32px"
            }}>
              <div style={{ gridColumn: 'span 8' }}>
                <OperationalTrendChart 
                  trendData={trendData}
                  trendMetrics={trendMetrics}
                  timePeriod={timePeriod}
                  onTimePeriodChange={setTimePeriod}
                />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <LiveSignalsFeed 
                  signals={liveSignals}
                  onMarkRead={markSignalRead}
                />
              </div>
            </section>
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
          boxShadow: '0 8px 24px rgba(0, 104, 95, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          zIndex: 50,
        }}
        onClick={() => setIsInventoryModalOpen(true)}
      >
        <Plus size={28} />
      </motion.button>

      <AddInventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        onAdd={addMenuItem}
      />
    </div>
    </ProtectedRoute>
  );
}