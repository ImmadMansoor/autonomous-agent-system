import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, AlertTriangle, ArrowRight, RefreshCw, MessageSquare, ListTodo, Activity } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRun, setActiveRun] = useState(null);
  const [activeTab, setActiveTab] = useState('trace'); // trace, diff, approvals, notifs
  
  // Custom signal state
  const [customSignal, setCustomSignal] = useState('');
  
  // Live Menu State
  const [menuItems, setMenuItems] = useState([]);

  // Data states for active run
  const [runDetails, setRunDetails] = useState(null);
  const [trace, setTrace] = useState([]);
  const [diff, setDiff] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    fetchScenarios();
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${API_URL}/menu`);
      setMenuItems(await res.json());
    } catch (err) {
      console.error("Failed to fetch menu", err);
    }
  };

  const fetchScenarios = async () => {
    try {
      const res = await fetch(`${API_URL}/signals/scenarios`);
      const data = await res.json();
      setScenarios(data);
    } catch (err) {
      console.error("Failed to fetch scenarios", err);
    }
  };

  const resetDemo = async (scenarioName) => {
    let url = `${API_URL}/demo/reset?clear_history=false`;
    if (scenarioName === "Supply Shock") url += "&chicken_stock=5";
    if (scenarioName === "Contradiction Test") url += "&chicken_stock=50";
    await fetch(url, { method: 'POST' });
  };

  const runScenario = async (scenario) => {
    setLoading(true);
    setActiveRun(null);
    setRunDetails(null);
    setTrace([]);
    setDiff(null);
    
    try {
      if (scenario.name !== "Custom Scenario") {
        await resetDemo(scenario.name);
      }
      
      // 1. Ingest Signal
      const sigRes = await fetch(`${API_URL}/signals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_type: "ui", raw_text: scenario.raw_text })
      });
      const sigData = await sigRes.json();
      
      // 2. Run Agent
      const runRes = await fetch(`${API_URL}/agent/run/${sigData.id}`, { method: 'POST' });
      const runData = await runRes.json();
      const runId = runData.agent_run_id;
      
      setActiveRun(runId);
      await fetchRunData(runId);
      
    } catch (err) {
      console.error("Failed to run scenario", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRunData = async (runId = activeRun) => {
    if (!runId) return;
    try {
      // Run Details
      const runRes = await fetch(`${API_URL}/agent/runs/${runId}`);
      setRunDetails(await runRes.json());
      
      // Trace
      const traceRes = await fetch(`${API_URL}/agent/runs/${runId}/trace`);
      const rawTrace = await traceRes.json();
      // Clean up provider failure text if present
      const cleanTrace = rawTrace.map(t => {
        if (t.step === "interpret" && t.message.includes("Gemini Planner failed")) {
          return { ...t, message: "Semantic planner unavailable; deterministic safety planner selected for demo reliability." };
        }
        return t;
      });
      setTrace(cleanTrace);
      
      // Diff
      const diffRes = await fetch(`${API_URL}/menu/before-after/${runId}`);
      setDiff(await diffRes.json());
      
      // Approvals & Notifs
      const appRes = await fetch(`${API_URL}/approvals`);
      const allApps = await appRes.json();
      setApprovals(allApps.filter(a => a.agent_run_id === runId));
      
      const notifRes = await fetch(`${API_URL}/notifications`);
      const allNotifs = await notifRes.json();
      setNotifs(allNotifs.filter(n => n.agent_run_id === runId));
      
      // Always refresh menu to show current state
      fetchMenu();
    } catch (err) {
      console.error("Failed to fetch run data", err);
    }
  };

  const handleApprove = async (approvalId) => {
    try {
      await fetch(`${API_URL}/approvals/${approvalId}/approve`, { method: 'POST' });
      // Refresh data
      fetchRunData();
      setActiveTab('notifs');
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '800px' }}>
      <header>
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>MenuMind Operations Console</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Autonomous Cafe Management System
        </motion.p>
      </header>

      {/* Live Menu State */}
      <motion.div className="glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <h2><ListTodo size={20} className="text-accent" /> Live Menu State</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {menuItems.map(item => (
            <div key={item.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name}</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Stock: {item.stock_level} | Price: {item.current_price} PKR<br/>
                Prep: {item.prep_time_min} mins
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {item.is_available ? <span className="badge completed" style={{background: 'rgba(16,185,129,0.2)', color: '#34d399'}}>Avail</span> : <span className="badge failed" style={{background: 'rgba(239,68,68,0.2)', color: '#f87171'}}>Out</span>}
                {item.is_promoted && <span className="badge running" style={{background: 'rgba(59,130,246,0.2)', color: '#60a5fa'}}>Promo</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Signal Input */}
        <motion.div className="glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <h2><MessageSquare size={20} className="text-accent" /> Custom Signal</h2>
          <textarea 
            placeholder="Paste supplier alert, weather warning, competitor email, etc..." 
            value={customSignal}
            onChange={(e) => setCustomSignal(e.target.value)}
            style={{ width: '100%', height: '80px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontFamily: 'Inter' }}
          />
          <button 
            className="approval-btn" 
            onClick={() => runScenario({ name: "Custom Scenario", raw_text: customSignal })}
            disabled={!customSignal || loading}
            style={{ width: '100%', padding: '10px', fontSize: '0.9rem', background: 'var(--accent-color)' }}
          >
            Analyze Signal
          </button>
        </motion.div>

        {/* Scenario Selection */}
        <motion.div className="glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <h2><Play size={20} className="text-accent" /> Test Presets</h2>
          <div className="scenario-list" style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '8px' }}>
            {scenarios.map((s, i) => (
              <motion.button 
                key={s.id} 
                className="scenario-button"
                style={{ padding: '10px' }}
                onClick={() => runScenario(s)}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="scenario-name" style={{ fontSize: '0.95rem' }}>{s.name}</div>
                <div className="scenario-text" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.raw_text}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Agent Run Dashboard */}
      <AnimatePresence>
        {loading && <div className="loader"></div>}
        
        {runDetails && !loading && (
          <motion.div 
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2><Activity size={20} className="text-accent" /> Agent Execution Run #{runDetails.id}</h2>
              <span className={`badge ${runDetails.status}`}>{runDetails.status}</span>
            </div>
            
            {runDetails.revenue_impact_estimate !== null && (
              <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Estimated Impact: <strong style={{ color: 'var(--text-primary)' }}>{runDetails.revenue_impact_estimate} PKR</strong>
                <span style={{ fontSize: '0.75rem', marginLeft: '8px', opacity: 0.7 }}>(estimated based on margins)</span>
              </div>
            )}

            <div className="tabs">
              <button className={`tab-btn ${activeTab === 'trace' ? 'active' : ''}`} onClick={() => setActiveTab('trace')}>
                Trace Terminal
              </button>
              <button className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`} onClick={() => setActiveTab('diff')}>
                State Diff
              </button>
              <button className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
                Approvals {approvals.filter(a => a.status === 'pending').length > 0 && '🔴'}
              </button>
              <button className={`tab-btn ${activeTab === 'notifs' ? 'active' : ''}`} onClick={() => setActiveTab('notifs')}>
                Notifs ({notifs.length})
              </button>
            </div>

            <div className="tab-content" style={{ minHeight: '150px' }}>
              {activeTab === 'trace' && (
                <div className="terminal">
                  {trace.map((t, i) => (
                    <motion.div key={t.id} className="trace-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                      <span className="trace-step">[{t.step}]</span>
                      <span className="trace-msg">{t.message}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'diff' && (
                <div className="diff-list">
                  {diff?.changes?.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No menu mutations occurred.</p>
                  ) : (
                    diff?.changes?.map((c, i) => (
                      <motion.div key={i} className="diff-item" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                        <div className="diff-title">{c.item_id}</div>
                        <div className="diff-change">
                          <span>{c.field}:</span>
                          <span className="diff-old">{String(c.before)}</span>
                          <ArrowRight size={14} />
                          <span className="diff-new">{String(c.after)}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'approvals' && (
                <div>
                  {approvals.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No approvals requested.</p>
                  ) : (
                    approvals.map((a) => (
                      <div key={a.id} className="approval-card">
                        <div className="approval-title"><AlertTriangle size={18} /> {a.action_type}</div>
                        <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Reason: {a.reason}</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.8, fontFamily: 'monospace' }}>Payload: {a.payload_json}</p>
                        
                        {a.status === 'pending' ? (
                          <button className="approval-btn" onClick={() => handleApprove(a.id)}>
                            Approve & Execute
                          </button>
                        ) : (
                          <div style={{ marginTop: '12px', fontSize: '0.9rem', fontWeight: 600, color: a.status === 'approved' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                            Status: {a.status.toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'notifs' && (
                <div>
                  {notifs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No notifications sent.</p>
                  ) : (
                    notifs.map((n, i) => (
                      <motion.div key={n.id} className={`notif-card channel-${n.channel}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                          {n.channel} → {n.recipient}
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>{n.message}</div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => fetchRunData()}
                style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <RefreshCw size={14} /> Sync Current Run
              </button>
              <button 
                onClick={() => { setActiveRun(null); setRunDetails(null); setCustomSignal(''); }}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <Play size={14} /> Run New Scenario
              </button>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;