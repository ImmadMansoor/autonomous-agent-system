'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, History, Clock, Check, X, Filter, Search, ChevronLeft, ChevronRight, Zap, Target, MessageSquare, ExternalLink, XCircle } from 'lucide-react';
import { Sidebar, Navbar, MobileNav, RippleButton, ProtectedRoute } from '@/components/layout';
import { AuditLogSkeleton } from '@/components/skeletons';
import { STAGGER_CONTAINER, REVEAL_UP } from '@/lib/animations';
import { useAuditLog } from '@/hooks';
import { formatRelativeTime, AuditLogEntry } from '@/data/mockData';

export default function AuditLogPage() {
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected'>('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const { data, isLoading, error, goToPage } = useAuditLog(1, 10);

  if (error) {
    return (
      <ProtectedRoute>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          background: 'var(--background)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
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

  const filteredEntries = (data?.entries ?? []).filter(entry => {
    if (filter === 'all') return true;
    return entry.action === filter;
  });

  return (
    <ProtectedRoute>
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
        <Navbar
          title="Audit Log"
          subtitle={isLoading ? 'Loading...' : 'Complete approval history'}
        />

        <main style={{
          padding: 'var(--space-lg) var(--space-xl)',
          paddingTop: 'calc(64px + var(--space-lg))',
          paddingBottom: 'calc(64px + var(--space-lg))',
        }}>
          {isLoading || !data ? (
            <AuditLogSkeleton />
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
                href="/approvals" 
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
                Back to Approvals
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
                    Approval Audit Log
                  </h1>
                  <p style={{
                    color: 'var(--on-surface-variant)',
                    fontSize: 'var(--font-size-body-sm)',
                  }}>
                    Full history of all approval decisions
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
                    {data.totalCount} Total
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={REVEAL_UP}
              style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-lg)',
              }}
            >
              {(['all', 'approved', 'rejected'] as const).map((option) => (
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
                    textTransform: 'capitalize',
                  }}
                >
                  {option === 'all' ? 'All' : option}
                </button>
              ))}
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  variants={REVEAL_UP}
                  style={{
                    background: 'var(--surface-container-lowest)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--outline-variant)',
                    padding: 'var(--space-lg)',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-elevated)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--outline-variant)';
                  }}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-xs)',
                        background: entry.action === 'approved' ? 'rgba(0, 104, 95, 0.1)' : 'rgba(186, 26, 26, 0.1)',
                        color: entry.action === 'approved' ? 'var(--primary)' : 'var(--error)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-label)',
                        fontSize: 'var(--font-size-label-md)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}>
                        {entry.action === 'approved' ? <Check size={14} /> : <X size={14} />}
                        {entry.action}
                      </span>
                      
                      <span style={{
                        background: 'var(--surface-container)',
                        color: 'var(--on-surface-variant)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-label)',
                        fontSize: 'var(--font-size-label-md)',
                      }}>
                        {entry.type}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--on-surface-variant)' }}>
                      <Clock size={14} />
                      <span style={{ fontSize: 'var(--font-size-label-md)' }}>
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-body-lg)',
                    fontWeight: 600,
                    color: 'var(--on-surface)',
                    marginBottom: 'var(--space-xs)',
                  }}>
                    {entry.title}
                  </h3>
                  
                  <p style={{
                    color: 'var(--on-surface-variant)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-body-sm)',
                    marginBottom: 'var(--space-md)',
                  }}>
                    {entry.details}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingTop: 'var(--space-sm)',
                    borderTop: '1px solid var(--outline-variant)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <span style={{
                        fontSize: 'var(--font-size-label-md)',
                        color: 'var(--on-surface-variant)',
                      }}>
                        By: <strong style={{ color: 'var(--on-surface)' }}>{entry.user}</strong>
                      </span>
                      <span style={{
                        fontSize: 'var(--font-size-label-md)',
                        color: 'var(--on-surface-variant)',
                      }}>
                        Confidence: <strong style={{ color: entry.confidence >= 90 ? 'var(--primary)' : 'var(--on-surface)' }}>{entry.confidence}%</strong>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredEntries.length === 0 && (
              <motion.div
                variants={REVEAL_UP}
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-xxl)',
                  color: 'var(--on-surface-variant)',
                }}
              >
                <History size={48} style={{ opacity: 0.3, marginBottom: 'var(--space-md)' }} />
                <p>No audit entries found</p>
              </motion.div>
            )}

            {data.totalPages > 1 && (
              <motion.div
                variants={REVEAL_UP}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-md)',
                  marginTop: 'var(--space-xl)',
                }}
              >
                {data.page > 1 ? (
                  <RippleButton
                    variant="outline"
                    onClick={() => goToPage(data.page - 1)}
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </RippleButton>
                ) : (
                  <div style={{ 
                    padding: 'var(--space-sm) var(--space-md)', 
                    border: '1px solid var(--outline-variant)',
                    borderRadius: 'var(--radius-lg)',
                    opacity: 0.5,
                  }}>
                    <ChevronLeft size={18} />
                  </div>
                )}
                
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-body-sm)',
                  color: 'var(--on-surface-variant)',
                }}>
                  Page {data.page} of {data.totalPages}
                </span>
                
                {data.page < data.totalPages ? (
                  <RippleButton
                    variant="outline"
                    onClick={() => goToPage(data.page + 1)}
                  >
                    Next
                    <ChevronRight size={18} />
                  </RippleButton>
                ) : (
                  <div style={{ 
                    padding: 'var(--space-sm) var(--space-md)', 
                    border: '1px solid var(--outline-variant)',
                    borderRadius: 'var(--radius-lg)',
                    opacity: 0.5,
                  }}>
                    <ChevronRight size={18} />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEntry(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 'var(--space-lg)',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--surface-container-lowest)',
                borderRadius: 'var(--radius-xl)',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-lg)',
                borderBottom: '1px solid var(--outline-variant)',
                position: 'sticky',
                top: 0,
                background: 'var(--surface-container-lowest)',
                zIndex: 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div style={{
                    padding: 'var(--space-sm)',
                    background: selectedEntry.action === 'approved' ? 'rgba(0, 104, 95, 0.1)' : 'rgba(186, 26, 26, 0.1)',
                    borderRadius: 'var(--radius-lg)',
                    color: selectedEntry.action === 'approved' ? 'var(--primary)' : 'var(--error)',
                  }}>
                    {selectedEntry.action === 'approved' ? <Check size={24} /> : <X size={24} />}
                  </div>
                  <div>
                    <span style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: 'var(--font-size-label-sm)',
                      color: selectedEntry.action === 'approved' ? 'var(--primary)' : 'var(--error)',
                      textTransform: 'uppercase',
                    }}>
                      {selectedEntry.action}
                    </span>
                    <h2 style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: 'var(--font-size-headline-md)',
                      fontWeight: 600,
                      color: 'var(--on-surface)',
                    }}>
                      {selectedEntry.title}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--space-sm)',
                    color: 'var(--on-surface-variant)',
                  }}
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                {/* Quick Info Row */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    padding: 'var(--space-xs) var(--space-md)',
                    background: 'var(--surface-container)',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    <Target size={14} color="var(--on-surface-variant)" />
                    <span style={{ fontSize: 'var(--font-size-label-md)', color: 'var(--on-surface-variant)' }}>
                      {selectedEntry.type}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    padding: 'var(--space-xs) var(--space-md)',
                    background: 'rgba(0, 104, 95, 0.1)',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    <Zap size={14} color="var(--primary)" />
                    <span style={{ fontSize: 'var(--font-size-label-md)', color: 'var(--primary)' }}>
                      {selectedEntry.confidence}% confidence
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    color: 'var(--on-surface-variant)',
                  }}>
                    <Clock size={14} />
                    <span style={{ fontSize: 'var(--font-size-label-md)' }}>
                      {formatRelativeTime(selectedEntry.timestamp)}
                    </span>
                  </div>
                  {selectedEntry.escalated && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      padding: 'var(--space-xs) var(--space-md)',
                      background: 'rgba(186, 26, 26, 0.1)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--error)',
                      fontSize: 'var(--font-size-label-md)',
                      fontWeight: 600,
                    }}>
                      ⚠ Escalated
                    </div>
                  )}
                </div>

                {/* AI Recommendation */}
                <div style={{
                  background: 'rgba(0, 98, 141, 0.05)',
                  border: '1px solid rgba(0, 98, 141, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-lg)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                    <Target size={16} color="var(--tertiary)" />
                    <span style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: 'var(--font-size-label-md)',
                      color: 'var(--tertiary)',
                      fontWeight: 600,
                    }}>
                      AI Recommendation
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-body-lg)',
                    fontWeight: 600,
                    color: 'var(--on-surface)',
                  }}>
                    {selectedEntry.recommendation}
                  </p>
                </div>

                {/* AI Reasoning */}
                <div style={{
                  background: 'var(--surface-container)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-lg)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                    <MessageSquare size={16} color="var(--on-surface-variant)" />
                    <span style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: 'var(--font-size-label-md)',
                      color: 'var(--on-surface-variant)',
                    }}>
                      AI Reasoning
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-body-md)',
                    color: 'var(--on-surface)',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}>
                    "{selectedEntry.aiReasoning}"
                  </p>
                </div>

                {/* Context Analysis */}
                {selectedEntry.context && (
                  <div>
                    <h4 style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: 'var(--font-size-headline-sm)',
                      fontWeight: 600,
                      color: 'var(--on-surface)',
                      marginBottom: 'var(--space-md)',
                    }}>
                      Context Analysis
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
                      {selectedEntry.context.map((ctx) => (
                        <div key={ctx.label} style={{
                          background: 'var(--surface-container)',
                          borderRadius: 'var(--radius-lg)',
                          padding: 'var(--space-md)',
                        }}>
                          <p style={{
                            fontFamily: 'var(--font-label)',
                            fontSize: 'var(--font-size-label-sm)',
                            color: 'var(--on-surface-variant)',
                            marginBottom: 'var(--space-xs)',
                          }}>
                            {ctx.label}
                          </p>
                          <span style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--font-size-body-md)',
                            fontWeight: 600,
                            color: ctx.isHigh ? 'var(--primary)' : 'var(--on-surface)',
                          }}>
                            {ctx.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 'var(--space-md)',
                }}>
                  <div style={{
                    padding: 'var(--space-md)',
                    background: 'var(--surface-container)',
                    borderRadius: 'var(--radius-lg)',
                  }}>
                    <span style={{
                      fontSize: 'var(--font-size-label-sm)',
                      color: 'var(--on-surface-variant)',
                    }}>
                      Decision Time
                    </span>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--font-size-body-md)',
                      fontWeight: 600,
                      color: 'var(--on-surface)',
                    }}>
                      {selectedEntry.timeToDecision}
                    </p>
                  </div>
                  <div style={{
                    padding: 'var(--space-md)',
                    background: 'var(--surface-container)',
                    borderRadius: 'var(--radius-lg)',
                  }}>
                    <span style={{
                      fontSize: 'var(--font-size-label-sm)',
                      color: 'var(--on-surface-variant)',
                    }}>
                      Approved by
                    </span>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--font-size-body-md)',
                      fontWeight: 600,
                      color: 'var(--on-surface)',
                    }}>
                      {selectedEntry.user}
                    </p>
                  </div>
                </div>

                {/* Related Signals */}
                <div>
                  <h4 style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: 'var(--font-size-headline-sm)',
                    fontWeight: 600,
                    color: 'var(--on-surface)',
                    marginBottom: 'var(--space-sm)',
                  }}>
                    Related Signals
                  </h4>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                    {selectedEntry.relatedSignals.map((signal) => (
                      <span key={signal} style={{
                        padding: 'var(--space-xs) var(--space-sm)',
                        background: 'var(--surface-container)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--font-size-label-md)',
                        color: 'var(--primary)',
                      }}>
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Previous Actions */}
                <div>
                  <h4 style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: 'var(--font-size-headline-sm)',
                    fontWeight: 600,
                    color: 'var(--on-surface)',
                    marginBottom: 'var(--space-sm)',
                  }}>
                    Action History
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    {selectedEntry.previousActions.map((action, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        padding: 'var(--space-xs) 0',
                        color: 'var(--on-surface-variant)',
                        fontSize: 'var(--font-size-body-sm)',
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--outline)',
                        }} />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action ID */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-md)',
                  background: 'var(--surface-container)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-label-sm)',
                    color: 'var(--on-surface-variant)',
                  }}>
                    Action ID
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--font-size-body-sm)',
                    color: 'var(--on-surface)',
                  }}>
                    {selectedEntry.id}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: 'var(--space-lg)',
                borderTop: '1px solid var(--outline-variant)',
                position: 'sticky',
                bottom: 0,
                background: 'var(--surface-container-lowest)',
              }}>
                <RippleButton variant="outline" onClick={() => setSelectedEntry(null)}>
                  Close
                </RippleButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
    </ProtectedRoute>
  );
}