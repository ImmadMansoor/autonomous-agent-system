'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sidebar, 
  Navbar, 
  MobileNav, 
  ProtectedRoute 
} from '@/components/layout';
import { 
  ListChecks, 
  Sparkles, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  RefreshCw, 
  Brain,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { buildOpsPlan } from '@/lib/agentView';

type TaskItem = {
  id: string;
  title: string;
  detail: string;
  owner: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  status?: string;
};

const OWNER_THEMES: Record<string, { bg: string; color: string; border: string }> = {
  manager: { bg: 'rgba(0, 104, 95, 0.08)', color: 'var(--primary)', border: 'rgba(0, 104, 95, 0.2)' },
  kitchen: { bg: 'rgba(186, 26, 26, 0.08)', color: 'var(--error)', border: 'rgba(186, 26, 26, 0.2)' },
  marketing: { bg: 'rgba(0, 98, 141, 0.08)', color: 'var(--tertiary)', border: 'rgba(0, 98, 141, 0.2)' },
  counter: { bg: 'rgba(80, 95, 118, 0.08)', color: 'var(--secondary)', border: 'rgba(80, 95, 118, 0.2)' },
  'shift lead': { bg: 'rgba(107, 216, 203, 0.15)', color: 'var(--primary)', border: 'rgba(107, 216, 203, 0.3)' },
};

const PRIORITY_THEMES: Record<string, { color: string; dot: string }> = {
  high: { color: 'var(--error)', dot: 'var(--error)' },
  medium: { color: '#b7791f', dot: '#d69e2e' },
  low: { color: '#2f855a', dot: '#48bb78' },
};

export default function PlannerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [latestRun, setLatestRun] = useState<any | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('menumind_completed_ops_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch (err) {
      console.error('Failed to load completed tasks from localStorage', err);
      return {};
    }
  });
  const activeRunId = latestRun?.run?.id ? String(latestRun.run.id) : 'no-run';
  
  // Custom signal input fields to run pipeline directly from Planner
  const [customSignal, setCustomSignal] = useState('');

  // Main data loader function
  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      // getLatestRun hydrates trace, approvals, notifications, menu diff, and matching signal text.
      const runData = await api.operations.getLatestRun();

      if (runData) {
        setLatestRun(runData);
        
        const signalText = runData.signalText || runData.signal?.raw_text || '';

        // Extract before/after state changes
        const changes = runData.diff?.changes || [];

        // Build the dynamic ops plan checklist
        const computedTasks = buildOpsPlan(
          runData.plan,
          runData.approvals,
          runData.notifications,
          changes,
          signalText
        );

        setTasks(computedTasks as TaskItem[]);
      } else {
        setLatestRun(null);
        setTasks([]);
      }
    } catch (err: any) {
      console.error('Failed to load planner data:', err);
      setError('Could not retrieve active operations plan. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll for updates every 7 seconds
  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 7000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle task checklist tick
  const handleToggleTask = (taskId: string) => {
    const scopedTaskId = `${activeRunId}:${taskId}`;
    setCompletedTasks((current) => {
      const updated = {
        ...current,
        [scopedTaskId]: !current[scopedTaskId]
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('menumind_completed_ops_tasks', JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to save completed tasks to localStorage', err);
        }
      }
      return updated;
    });
  };

  // Run a signal pipeline E2E right from the Planner
  const handleIngestSignal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const signalText = customSignal.trim();
    if (!signalText) return;

    setIsSubmitting(true);
    try {
      await api.operations.createSignal({
        type: 'typed',
        message: signalText,
        priority: 'high'
      });
      setCustomSignal('');
      // Force immediate reload to capture the newly created task list
      await loadData(true);
    } catch (err: any) {
      console.error('Failed to ingest custom signal:', err);
      setError('Failed to process custom signal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply scenario preset
  const handleApplyPreset = (text: string) => {
    setCustomSignal(text);
  };

  // Task Column Categorization
  const columns = useMemo(() => {
    const now: TaskItem[] = [];
    const next: TaskItem[] = [];
    const needsApproval: TaskItem[] = [];
    const done: TaskItem[] = [];

    tasks.forEach(task => {
      const isCompleted = !!completedTasks[`${activeRunId}:${task.id}`];
      
      if (isCompleted) {
        done.push(task);
      } else if (task.status === 'blocked' || task.title.toLowerCase().startsWith('review')) {
        needsApproval.push(task);
      } else if (task.due === 'Now' || task.priority === 'high') {
        now.push(task);
      } else {
        next.push(task);
      }
    });

    return { now, next, needsApproval, done };
  }, [tasks, completedTasks, activeRunId]);

  // Calculate overall stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => !!completedTasks[`${activeRunId}:${t.id}`]).length;
    const approvalCount = columns.needsApproval.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, approvalCount, completionRate };
  }, [tasks, completedTasks, columns, activeRunId]);

  // Render a single task card
  const renderCard = (task: TaskItem) => {
    const isCompleted = !!completedTasks[`${activeRunId}:${task.id}`];
    const ownerTheme = OWNER_THEMES[task.owner.toLowerCase()] || OWNER_THEMES.counter;
    const priorityTheme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.medium;
    const confidence = latestRun?.plan?.confidence 
      ? Math.round(latestRun.plan.confidence * 100) 
      : 84;

    return (
      <motion.div
        layout
        key={task.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        style={{
          background: isCompleted ? 'rgba(0, 104, 95, 0.03)' : 'var(--surface-container-lowest)',
          border: isCompleted 
            ? '1px solid rgba(0, 104, 95, 0.15)' 
            : task.status === 'blocked' 
              ? '1px dashed var(--outline-variant)' 
              : '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
          boxShadow: isCompleted ? 'none' : 'var(--shadow-card)',
          transition: 'border-color 0.2s, background-color 0.2s',
          position: 'relative',
          overflow: 'hidden',
          textDecoration: isCompleted ? 'line-through' : 'none',
          opacity: isCompleted ? 0.75 : 1,
        }}
      >
        {/* Glow indicator for high priority */}
        {task.priority === 'high' && !isCompleted && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            bottom: 0,
            background: 'var(--error)'
          }} />
        )}

        {/* Task Header & Checkbox */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
          <button
            onClick={() => handleToggleTask(task.id)}
            aria-label={isCompleted ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
            style={{
              background: isCompleted ? 'var(--primary)' : 'transparent',
              border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--outline)'}`,
              borderRadius: 'var(--radius-sm)',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              marginTop: '2px',
              color: 'var(--on-primary)',
              transition: 'all 0.15s ease',
            }}
          >
            {isCompleted && <Check size={14} strokeWidth={3} />}
          </button>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: isCompleted ? 'var(--on-surface-variant)' : 'var(--on-surface)',
              lineHeight: '1.4',
            }}>
              {task.title}
            </h4>
            <p style={{
              fontSize: '12px',
              color: 'var(--on-surface-variant)',
              lineHeight: '1.4',
            }}>
              {task.detail}
            </p>
          </div>
        </div>

        {/* Card Footer Badges */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-xs)',
          alignItems: 'center',
          paddingTop: 'var(--space-xs)',
          borderTop: '1px solid var(--surface-container-high)',
        }}>
          {/* Owner Badge */}
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: ownerTheme.bg,
            color: ownerTheme.color,
            border: `1px solid ${ownerTheme.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <User size={10} />
            {task.owner}
          </span>

          {/* Due Info */}
          <span style={{
            fontSize: '11px',
            color: 'var(--on-surface-variant)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: '4px',
          }}>
            <Clock size={10} />
            {task.due || 'Today'}
          </span>

          <span style={{
            fontSize: '11px',
            color: 'var(--on-surface-variant)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <Brain size={10} />
            {confidence}%
          </span>

          {/* Priority Bullet */}
          {!isCompleted && (
            <span style={{
              fontSize: '11px',
              color: priorityTheme.color,
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: priorityTheme.dot,
                display: 'inline-block'
              }} />
              {task.priority.toUpperCase()}
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
        <Sidebar />
        
        <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
          <Navbar 
            title="Operational Planner" 
            subtitle={isLoading ? 'Loading operations...' : `Action checklist for staff coordination`}
          />
          
          <main style={{ 
            padding: 'var(--space-lg) var(--space-xl)', 
            paddingTop: 'calc(64px + var(--space-lg))',
            paddingBottom: 'calc(64px + var(--space-lg))',
          }}>
            
            {/* Top Status & Metrics Frosted Banner */}
            <div style={{
              background: 'var(--surface-container-low)',
              border: '1px solid var(--outline-variant)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-md) var(--space-lg)',
              marginBottom: 'var(--space-lg)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-md)',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--on-primary)',
                }}>
                  <ListChecks size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)' }}>
                    Operations Board
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                    Translate active cafe signals into structured staff task cards.
                  </p>
                </div>
              </div>

              {/* Progress and Ingestion rate widgets */}
              <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
                      {stats.completionRate}%
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                      ({stats.completed}/{stats.total} Tasks)
                    </span>
                  </div>
                  <div style={{
                    width: '180px',
                    height: '6px',
                    background: 'var(--surface-container-high)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    marginTop: '4px',
                  }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.completionRate}%` }}
                      transition={{ duration: 0.4 }}
                      style={{
                        height: '100%',
                        background: 'var(--primary)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => loadData(true)}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--outline-variant)',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--on-surface-variant)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-high)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <RefreshCw size={16} className={isLoading ? 'spin-anim' : ''} />
                </button>
              </div>
            </div>

            {/* Error Message banner */}
            {error && (
              <div style={{
                background: 'var(--error-container)',
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-md)',
                color: 'var(--on-error-container)',
                marginBottom: 'var(--space-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
              }}>
                <AlertCircle size={20} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Board Core Layout */}
            {isLoading && tasks.length === 0 ? (
              <div style={{
                display: 'flex',
                height: '400px',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 'var(--space-sm)',
              }}>
                <RefreshCw size={36} className="spin-anim" color="var(--primary)" />
                <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                  Assembling board checklist from database run logs...
                </p>
              </div>
            ) : tasks.length === 0 ? (
              /* High Fidelity Empty/Ingested State with Quick Trigger Panel */
              <div style={{
                maxWidth: '800px',
                margin: '40px auto',
                background: 'var(--surface-container-low)',
                border: '1px solid var(--outline-variant)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-2xl) var(--space-xl)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-lg)',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(0, 104, 95, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  marginBottom: 'var(--space-sm)',
                }}>
                  <Brain size={32} />
                </div>

                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--on-surface)' }}>
                    No Active Operational Run
                  </h2>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--on-surface-variant)', 
                    maxWidth: '500px', 
                    margin: '8px auto 0 auto',
                    lineHeight: '1.5',
                  }}>
                    MenuMind has not executed any agent pipelines recently. Feed the agent a signal below to generate a dynamic task board.
                  </p>
                </div>

                {/* Quick Signal Ingestion form on empty state */}
                <form 
                  onSubmit={handleIngestSignal}
                  style={{
                    width: '100%',
                    maxWidth: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-md)',
                    background: 'var(--surface-container-lowest)',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-md)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                      Ingest New Cafe Signal
                    </label>
                    <input
                      type="text"
                      value={customSignal}
                      onChange={(e) => setCustomSignal(e.target.value)}
                      placeholder="e.g. Islamabad Marathon passing tomorrow with 42C heat..."
                      style={{
                        width: '100%',
                        padding: '12px var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--outline)',
                        background: 'var(--surface)',
                        color: 'var(--on-surface)',
                        outline: 'none',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('WhatsApp alert: Islamabad Marathon passing G13 tomorrow with 42C heat and health-focused runners near cafe.')}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--surface-container-high)',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--on-surface-variant)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Sparkles size={12} />
                        Heat Preset
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('Assalam-o-Alaikum mian saab, gari ka axle toot gaya hai mandi k paas. Aaj chicken delivery nahi hosakti.')}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--surface-container-high)',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--on-surface-variant)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Sparkles size={12} />
                        Supply Preset
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !customSignal.trim()}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary)',
                        color: 'var(--on-primary)',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: !customSignal.trim() || isSubmitting ? 0.6 : 1,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={14} className="spin-anim" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          Ingest & Plan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* High Fidelity Kanban Board Columns */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-md)',
                alignItems: 'start',
              }}>
                
                {/* Column 1: Now */}
                <div style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-md)',
                  border: '1px solid var(--outline-variant)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)',
                  minHeight: '400px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--error)',
                        boxShadow: '0 0 8px var(--error)',
                      }} />
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)' }}>
                        Now
                      </h3>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'var(--surface-container-high)',
                      color: 'var(--on-surface-variant)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}>
                      {columns.now.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <AnimatePresence mode="popLayout">
                      {columns.now.length === 0 ? (
                        <div style={{
                          padding: 'var(--space-xl) var(--space-md)',
                          textAlign: 'center',
                          color: 'var(--on-surface-variant)',
                          fontSize: '12px',
                          border: '1px dashed var(--outline-variant)',
                          borderRadius: 'var(--radius-lg)',
                          background: 'var(--surface-container-lowest)',
                        }}>
                          No immediate actions.
                        </div>
                      ) : (
                        columns.now.map(renderCard)
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Column 2: Next */}
                <div style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-md)',
                  border: '1px solid var(--outline-variant)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)',
                  minHeight: '400px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--tertiary)',
                      }} />
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)' }}>
                        Next
                      </h3>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'var(--surface-container-high)',
                      color: 'var(--on-surface-variant)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}>
                      {columns.next.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <AnimatePresence mode="popLayout">
                      {columns.next.length === 0 ? (
                        <div style={{
                          padding: 'var(--space-xl) var(--space-md)',
                          textAlign: 'center',
                          color: 'var(--on-surface-variant)',
                          fontSize: '12px',
                          border: '1px dashed var(--outline-variant)',
                          borderRadius: 'var(--radius-lg)',
                          background: 'var(--surface-container-lowest)',
                        }}>
                          No upcoming tasks queued.
                        </div>
                      ) : (
                        columns.next.map(renderCard)
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Column 3: Needs Approval */}
                <div style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-md)',
                  border: '1px solid rgba(183, 121, 31, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)',
                  minHeight: '400px',
                  boxShadow: columns.needsApproval.length > 0 ? '0px 4px 20px rgba(183, 121, 31, 0.05)' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} color="#b7791f" />
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)' }}>
                        Needs Approval
                      </h3>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'rgba(183, 121, 31, 0.15)',
                      color: '#b7791f',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}>
                      {columns.needsApproval.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <AnimatePresence mode="popLayout">
                      {columns.needsApproval.length === 0 ? (
                        <div style={{
                          padding: 'var(--space-xl) var(--space-md)',
                          textAlign: 'center',
                          color: 'var(--on-surface-variant)',
                          fontSize: '12px',
                          border: '1px dashed var(--outline-variant)',
                          borderRadius: 'var(--radius-lg)',
                          background: 'var(--surface-container-lowest)',
                        }}>
                          No blocked or approval-gated tasks!
                        </div>
                      ) : (
                        columns.needsApproval.map(renderCard)
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Column 4: Done */}
                <div style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-md)',
                  border: '1px solid var(--outline-variant)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)',
                  minHeight: '400px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} color="var(--primary)" />
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)' }}>
                        Done
                      </h3>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'var(--primary-container)',
                      color: 'var(--on-primary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}>
                      {columns.done.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <AnimatePresence mode="popLayout">
                      {columns.done.length === 0 ? (
                        <div style={{
                          padding: 'var(--space-xl) var(--space-md)',
                          textAlign: 'center',
                          color: 'var(--on-surface-variant)',
                          fontSize: '12px',
                          border: '1px dashed rgba(0, 104, 95, 0.2)',
                          borderRadius: 'var(--radius-lg)',
                        }}>
                          Tick items off to finish.
                        </div>
                      ) : (
                        columns.done.map(renderCard)
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>
            )}

            {/* Custom pulse spinner keyframe injection */}
            <style jsx global>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .spin-anim {
                animation: spin 1.2s linear infinite;
              }
            `}</style>

          </main>
        </div>

        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
