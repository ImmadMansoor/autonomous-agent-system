'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, History, Clock, Filter, Search, Zap, Package, TrendingUp, Brain, Users, ChevronRight } from 'lucide-react';
import { Sidebar, Navbar, MobileNav, ProtectedRoute } from '@/components/layout';
import { AILogsSkeleton } from '@/components/skeletons';
import { STAGGER_CONTAINER, REVEAL_UP } from '@/lib/animations';
import { useOperationsData } from '@/hooks';

const typeStyles: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  'Pricing Logic': { 
    bg: 'rgba(0, 104, 95, 0.1)', 
    color: 'var(--primary)',
    icon: <Zap size={16} />,
  },
  'Inventory': { 
    bg: 'rgba(186, 26, 26, 0.1)', 
    color: 'var(--error)',
    icon: <Package size={16} />,
  },
  'Upsell Engine': { 
    bg: 'rgba(0, 98, 141, 0.1)', 
    color: 'var(--tertiary)',
    icon: <TrendingUp size={16} />,
  },
  'Demand Forecast': { 
    bg: 'rgba(139, 92, 246, 0.1)', 
    color: '#8b5cf6',
    icon: <Brain size={16} />,
  },
  'Staffing': { 
    bg: 'rgba(236, 72, 153, 0.1)', 
    color: '#ec4899',
    icon: <Users size={16} />,
  },
};

type FilterType = 'all' | 'Pricing Logic' | 'Inventory' | 'Upsell Engine' | 'Demand Forecast' | 'Staffing';

export default function LogsPage() {
  const { data, isLoading } = useOperationsData();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = (data?.reasoningItems ?? []).filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterOptions: FilterType[] = ['all', 'Pricing Logic', 'Inventory', 'Upsell Engine', 'Demand Forecast', 'Staffing'];

  return (
    <ProtectedRoute>
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
        <Navbar
          title="AI Reasoning Logs"
          subtitle={isLoading ? 'Loading...' : undefined}
        />

        <main style={{
          padding: 'var(--space-lg) var(--space-xl)',
          paddingTop: 'calc(64px + var(--space-lg))',
          paddingBottom: 'calc(64px + var(--space-lg))',
        }}>
          {isLoading || !data ? (
            <AILogsSkeleton />
          ) : (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            style={{ 
              maxWidth: '1200px', 
              margin: '0 auto', 
            }}
          >
            <motion.div variants={REVEAL_UP} style={{ marginBottom: 'var(--space-xl)' }}>
              <Link 
                href="/" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontSize: 'var(--font-size-body-sm)',
                  marginBottom: 'var(--space-md)',
                }}
              >
                <ArrowLeft size={16} />
                Back to Operations
              </Link>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-md)',
              }}>
                <div>
                  <h1 style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: 'var(--font-size-headline-lg)',
                    fontWeight: 700,
                    color: 'var(--on-surface)',
                    marginBottom: 'var(--space-xs)',
                  }}>
                    AI Reasoning Logs
                  </h1>
                  <p style={{
                    color: 'var(--on-surface-variant)',
                    fontSize: 'var(--font-size-body-sm)',
                  }}>
                    Full history of AI decision-making and actions
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}>
                  <span style={{
                    padding: 'var(--space-xs) var(--space-md)',
                    borderRadius: '9999px',
                    background: 'var(--primary-container)',
                    color: 'var(--on-primary-container)',
                    fontFamily: 'var(--font-label)',
                    fontSize: 'var(--font-size-label-md)',
                    fontWeight: 600,
                  }}>
                    {data.reasoningItems.length} Total
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={REVEAL_UP}
              style={{
                display: 'flex',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--surface-container)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-xs) var(--space-md)',
                border: '1px solid var(--outline-variant)',
                flex: 1,
                maxWidth: '300px',
              }}>
                <Search size={16} color="var(--on-surface-variant)" style={{ marginRight: 'var(--space-xs)' }} />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--on-surface)',
                    fontSize: 'var(--font-size-body-sm)',
                    width: '100%',
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: 'var(--space-xs)',
                flexWrap: 'wrap',
              }}>
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    style={{
                      padding: 'var(--space-xs) var(--space-md)',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      background: filter === option ? 'var(--primary)' : 'var(--surface-container)',
                      color: filter === option ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                      fontFamily: 'var(--font-label)',
                      fontSize: 'var(--font-size-label-md)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {option === 'all' ? 'All' : option}
                  </button>
                ))}
              </div>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {filteredLogs.map((item) => (
                <Link key={item.id} href={`/logs/${item.id}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    variants={REVEAL_UP}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--outline-variant)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--space-lg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--outline)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--outline-variant)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-xs)',
                          background: typeStyles[item.type]?.bg || 'rgba(0, 104, 95, 0.1)',
                          color: typeStyles[item.type]?.color || 'var(--primary)',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-label)',
                          fontSize: 'var(--font-size-label-md)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {typeStyles[item.type]?.icon}
                          {item.type}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--on-surface-variant)' }}>
                          <Clock size={14} />
                          <span style={{ fontSize: 'var(--font-size-label-md)' }}>{item.time}</span>
                        </div>
                      </div>
                      
                      <ChevronRight size={20} color="var(--on-surface-variant)" />
                    </div>
                    
                    <h3 style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--font-size-body-lg)',
                      fontWeight: 600,
                      color: 'var(--on-surface)',
                      marginTop: 'var(--space-md)',
                      marginBottom: 'var(--space-xs)',
                    }}>
                      {item.title}
                    </h3>
                    
                    <p style={{
                      color: 'var(--on-surface-variant)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--font-size-body-sm)',
                      lineHeight: 1.5,
                    }}>
                      {item.description}
                    </p>
                    
                    {item.confidence && (
                      <div style={{
                        marginTop: 'var(--space-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                      }}>
                        <div style={{
                          width: '80px',
                          height: '4px',
                          background: 'var(--surface-container)',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${item.confidence}%`,
                            height: '100%',
                            background: item.confidence >= 90 ? 'var(--primary)' : item.confidence >= 70 ? '#f59e0b' : 'var(--error)',
                            borderRadius: '9999px',
                          }} />
                        </div>
                        <span style={{
                          fontSize: 'var(--font-size-label-md)',
                          color: 'var(--on-surface-variant)',
                        }}>
                          {item.confidence}% confidence
                        </span>
                      </div>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>

            {filteredLogs.length === 0 && (
              <motion.div
                variants={REVEAL_UP}
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-xxl)',
                  color: 'var(--on-surface-variant)',
                }}
              >
                <History size={48} style={{ opacity: 0.3, marginBottom: 'var(--space-md)' }} />
                <p>No logs found matching your criteria</p>
              </motion.div>
            )}
          </motion.div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
    </ProtectedRoute>
  );
}