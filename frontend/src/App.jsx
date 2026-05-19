import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  CloudSun,
  Download,
  Gauge,
  History,
  ListChecks,
  Loader2,
  Mic,
  MicOff,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { buildOpsCalendar } from './lib/calendar.js';
import {
  DEFAULT_SIGNALS,
  buildOpsPlan,
  formatAction,
  formatValue,
  getPlannerLabel,
  parsePlan,
  plannerClass,
} from './lib/agentView.js';
import {
  getDevicePerformanceProfile,
  getInitialPerformanceMode,
  storePerformanceMode,
} from './lib/performanceMode.js';
import { getBestVoice, hasNativeTts } from './lib/speech.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [signals, setSignals] = useState(DEFAULT_SIGNALS);
  const [customSignal, setCustomSignal] = useState(DEFAULT_SIGNALS[0].raw_text);
  const [menuItems, setMenuItems] = useState([]);
  const [runDetails, setRunDetails] = useState(null);
  const [trace, setTrace] = useState([]);
  const [diff, setDiff] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [apiOnline, setApiOnline] = useState(null);
  const [plannerMode, setPlannerMode] = useState('checking');
  const [weatherContext, setWeatherContext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [changedItemIds, setChangedItemIds] = useState(new Set());
  const [lastSignal, setLastSignal] = useState('');
  const [lastInputMode, setLastInputMode] = useState('typed');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [ttsSupported, setTtsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsStatus, setTtsStatus] = useState('');
  const [ttsVoice, setTtsVoice] = useState(null);
  const [completedOpsTasks, setCompletedOpsTasks] = useState({});
  const [performanceMode, setPerformanceMode] = useState(getInitialPerformanceMode);
  const recognitionRef = useRef(null);

  const plan = useMemo(() => parsePlan(runDetails), [runDetails]);
  const performanceProfile = useMemo(() => getDevicePerformanceProfile(), []);
  const plannerLabel = useMemo(() => getPlannerLabel(trace), [trace]);
  const changes = diff?.changes || [];
  const primaryAction = plan?.primary_action;
  const secondaryActions = plan?.secondary_actions || [];
  const recommendedActions = plan?.recommended_actions?.length
    ? plan.recommended_actions
    : [primaryAction, ...secondaryActions].filter(Boolean).map(formatAction);
  const opsPlan = useMemo(
    () => buildOpsPlan(plan, approvals, notifications, changes, lastSignal),
    [plan, approvals, notifications, changes, lastSignal],
  );
  const opsDoneCount = opsPlan.filter((task) => completedOpsTasks[task.id]).length;

  const showStatus = (message, type = 'info') => setStatus({ message, type, at: Date.now() });

  const togglePerformanceMode = () => {
    setPerformanceMode((current) => {
      const next = !current;
      storePerformanceMode(next);
      showStatus(next ? 'Performance mode enabled. Heavy visual effects stay reduced.' : 'Performance mode disabled. Full visual effects allowed.', 'info');
      return next;
    });
  };

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (!res.ok) throw new Error('Backend health check failed');
      const data = await res.json();
      setApiOnline(true);
      setPlannerMode(data.planner === 'gemini' ? 'Gemini live' : 'Safety fallback');
      return true;
    } catch {
      setApiOnline(false);
      setPlannerMode('Backend offline');
      return false;
    }
  }, []);

  const fetchMenu = useCallback(async () => {
    const res = await fetch(`${API_URL}/menu`);
    if (!res.ok) throw new Error('Could not load menu state');
    setMenuItems(await res.json());
  }, []);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/signals/scenarios`);
      if (!res.ok) throw new Error('Scenario fetch failed');
      const data = await res.json();
      if (Array.isArray(data) && data.length) setSignals(data);
    } catch {
      setSignals(DEFAULT_SIGNALS);
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/weather/context`);
      if (!res.ok) throw new Error('Weather fetch failed');
      setWeatherContext(await res.json());
    } catch {
      setWeatherContext({ available: false, summary: 'Live weather unavailable.', risks: [] });
    }
  }, []);

  useEffect(() => {
    (async () => {
      const online = await checkHealth();
      await fetchSignals();
      await fetchWeather();
      if (online) {
        try {
          await fetchMenu();
        } catch {
          showStatus('Backend is online, but menu state could not be loaded.', 'error');
        }
      }
    })();
  }, [checkHealth, fetchMenu, fetchSignals, fetchWeather]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setVoiceStatus('Voice input is unavailable here; typing still works.');
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus('Listening. Speak the restaurant signal.');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      if (transcript.trim()) {
        setLastInputMode('voice');
        setCustomSignal(transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      const blocked = event.error === 'not-allowed' || event.error === 'service-not-allowed';
      setVoiceStatus(blocked ? 'Microphone permission was blocked. Type the signal manually.' : 'Voice capture stopped. You can type or try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceStatus((current) => (current.startsWith('Listening') ? 'Voice captured. Review it, then run the agent.' : current));
    };

    recognitionRef.current = recognition;
    setVoiceSupported(true);
    setVoiceStatus('Voice input ready.');

    return () => {
      try {
        recognition.stop();
      } catch {
        // Browser speech engines can throw if stop is called while idle.
      }
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (hasNativeTts()) {
      setTtsSupported(true);
      setTtsStatus('Native spoken result ready on this device.');
      return undefined;
    }

    const available = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    setTtsSupported(available);
    if (!available) {
      setTtsStatus('Spoken result is unavailable in this browser.');
      return undefined;
    }

    const syncVoice = () => {
      const bestVoice = getBestVoice();
      setTtsVoice(bestVoice);
      setTtsStatus(bestVoice ? `Spoken result ready with ${bestVoice.name}.` : 'Spoken result ready after each run.');
    };

    syncVoice();
    window.speechSynthesis.onvoiceschanged = syncVoice;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const cancelSpeech = useCallback(() => {
    if (hasNativeTts()) {
      TextToSpeech.stop().catch(() => {});
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  async function fetchRunData(runId) {
    const [runRes, traceRes, diffRes, approvalsRes, notificationsRes] = await Promise.all([
      fetch(`${API_URL}/agent/runs/${runId}`),
      fetch(`${API_URL}/agent/runs/${runId}/trace`),
      fetch(`${API_URL}/menu/before-after/${runId}`),
      fetch(`${API_URL}/approvals?run_id=${runId}`),
      fetch(`${API_URL}/notifications?run_id=${runId}`),
    ]);

    if (!runRes.ok || !traceRes.ok || !diffRes.ok) throw new Error('Agent run completed, but result loading failed');

    const run = await runRes.json();
    const rawTrace = await traceRes.json();
    const diffData = await diffRes.json();
    const allApprovals = approvalsRes.ok ? await approvalsRes.json() : [];
    const allNotifications = notificationsRes.ok ? await notificationsRes.json() : [];

    setRunDetails(run);
    setTrace(rawTrace);
    setDiff(diffData);
    setApprovals(allApprovals);
    setNotifications(allNotifications);
    setChangedItemIds(new Set((diffData.changes || []).map((item) => item.item_id)));
    await fetchMenu();
    return { diffData, rawTrace };
  }

  async function runLiveAgent(signalText = customSignal) {
    const rawText = signalText.trim();
    if (!rawText) {
      showStatus('Enter a business signal before running the agent.', 'error');
      return;
    }

    setLoading(true);
    setStatus(null);
    setLastSignal(rawText);
    cancelSpeech();

    try {
      const online = await checkHealth();
      if (!online) throw new Error('Backend is offline. Start FastAPI on port 8000 before running the live agent.');

      const signalRes = await fetch(`${API_URL}/signals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_type: lastInputMode === 'voice' ? 'voice' : 'ui', raw_text: rawText }),
      });
      if (!signalRes.ok) throw new Error(`Signal intake failed (${signalRes.status})`);
      const signal = await signalRes.json();

      const runRes = await fetch(`${API_URL}/agent/run/${signal.id}`, { method: 'POST' });
      if (!runRes.ok) throw new Error(`Agent run failed (${runRes.status})`);
      const run = await runRes.json();

      const result = await fetchRunData(run.agent_run_id);
      const count = result.diffData.changes?.length || 0;
      const source = getPlannerLabel(result.rawTrace);
      showStatus(`Live run finished. ${count} menu field change(s). Planner: ${source}.`, 'success');
    } catch (error) {
      showStatus(error.message || 'Live agent failed.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function buildSpokenSummary() {
    const pieces = [
      'MenuMind result.',
      plan?.signal_summary || 'Agent decision complete.',
      `Insight: ${plan?.insight || plan?.reason || 'No insight returned.'}`,
      `Primary action: ${formatAction(primaryAction)}.`,
    ];

    if (approvals.some((approval) => approval.status === 'pending')) {
      pieces.push('This action requires human approval.');
    }

    return pieces.join(' ');
  }

  async function toggleSpeakResult() {
    if (!ttsSupported) {
      setTtsStatus('Spoken result is unavailable in this browser.');
      return;
    }

    if (isSpeaking) {
      cancelSpeech();
      setTtsStatus('Spoken result stopped.');
      return;
    }

    const text = buildSpokenSummary();

    if (hasNativeTts()) {
      setIsSpeaking(true);
      setTtsStatus('Speaking result with Android native voice.');
      try {
        await TextToSpeech.speak({
          text,
          lang: 'en-US',
          rate: 0.86,
          pitch: 1.0,
          volume: 1.0,
        });
        setIsSpeaking(false);
        setTtsStatus('Spoken result sent to native voice engine.');
      } catch {
        setTtsStatus('Native speech could not play. Falling back to browser voice if available.');
        setIsSpeaking(false);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.voice = ttsVoice || getBestVoice();
    utterance.rate = 0.9;
    utterance.pitch = 0.98;
    utterance.volume = 1;
    utterance.onend = () => {
      setIsSpeaking(false);
      setTtsStatus('Spoken result finished.');
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setTtsStatus('Spoken result could not play. You can read the summary on screen.');
    };

    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    setTtsStatus(utterance.voice ? `Speaking result with ${utterance.voice.name}.` : 'Speaking result summary.');
    window.speechSynthesis.speak(utterance);
  }

  function toggleVoiceInput() {
    const recognition = recognitionRef.current;
    if (!voiceSupported || !recognition) {
      setVoiceStatus('Voice input is unavailable here; type the signal manually.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setVoiceStatus('Voice capture stopped. Review the text, then run the agent.');
      return;
    }

    try {
      setLastInputMode('voice');
      setCustomSignal('');
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceStatus('Voice capture could not start. Type the signal manually.');
    }
  }

  function toggleOpsTask(taskId) {
    setCompletedOpsTasks((current) => ({ ...current, [taskId]: !current[taskId] }));
  }

  function downloadOpsCalendar() {
    if (!opsPlan.length) return;
    const calendar = buildOpsCalendar(opsPlan, runDetails?.id);
    const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `menumind-ops-plan-run-${runDetails?.id || 'latest'}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function resetState() {
    setLoading(true);
    cancelSpeech();
    try {
      const online = await checkHealth();
      if (!online) throw new Error('Backend is offline. Cannot reset state.');
      const res = await fetch(`${API_URL}/demo/reset?clear_history=true`, { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      setRunDetails(null);
      setTrace([]);
      setDiff(null);
      setApprovals([]);
      setNotifications([]);
      setChangedItemIds(new Set());
      setCompletedOpsTasks({});
      await fetchMenu();
      showStatus('Menu state reset.', 'success');
    } catch (error) {
      showStatus(error.message || 'Reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function approveAction(approvalId) {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/approvals/${approvalId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Approval failed');
      await fetchRunData(runDetails.id);
      showStatus('Approval executed.', 'success');
    } catch (error) {
      showStatus(error.message || 'Approval failed.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={performanceMode ? 'shell performance-mode' : 'shell'}>
      <header className="topbar">
        <div>
          <p className="eyebrow">MenuMind</p>
          <h1>Restaurant Signal Agent</h1>
        </div>
        <div className="topbar-actions">
          <button
            className={`perf-toggle ${performanceMode ? 'active' : ''}`}
            type="button"
            onClick={togglePerformanceMode}
            title={`Device profile: ${performanceProfile.label}`}
          >
            <Gauge size={16} />
            {performanceMode ? 'Performance' : 'Full effects'}
          </button>
          <div className={`status-pill ${apiOnline ? 'ok' : 'bad'}`}>
            {apiOnline ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {plannerMode}
          </div>
        </div>
      </header>

      {status && (
        <div className={`notice ${status.type}`} key={status.at}>
          {status.message}
        </div>
      )}

      <main className="main-grid">
        <section className="panel intake-panel">
          <div className="section-title">
            <Send size={18} />
            <h2>Signal Intake</h2>
          </div>
          <textarea
            value={customSignal}
            onChange={(event) => {
              setLastInputMode('typed');
              setCustomSignal(event.target.value);
            }}
            placeholder="Paste supplier, weather, event, competitor, or crisis signal..."
          />
          <div className="button-row">
            <button
              className={`voice-btn ${isListening ? 'active' : ''}`}
              type="button"
              onClick={toggleVoiceInput}
              disabled={loading || !voiceSupported}
              title={voiceSupported ? 'Speak a signal into the intake box' : 'Voice input is unavailable in this browser'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {isListening ? 'Stop voice' : 'Speak signal'}
            </button>
            <button className="primary-btn" type="button" onClick={() => runLiveAgent()} disabled={loading}>
              {loading ? <Loader2 className="spin" size={16} /> : <Play size={16} />}
              Run live agent
            </button>
            <button className="secondary-btn" type="button" onClick={resetState} disabled={loading}>
              <RefreshCw size={16} />
              Reset state
            </button>
          </div>
          {voiceStatus && <p className="voice-status">{voiceStatus}</p>}
          {weatherContext && (
            <div className={`weather-strip ${weatherContext.available ? 'ok' : 'warn'}`}>
              <CloudSun size={16} />
              <span>{weatherContext.summary}</span>
            </div>
          )}
          <div className="preset-row">
            {signals.map((signal) => (
              <button
                key={signal.id}
                type="button"
                className="preset-btn"
                onClick={() => {
                  setLastInputMode('typed');
                  setCustomSignal(signal.raw_text);
                }}
                disabled={loading}
              >
                {signal.name}
              </button>
            ))}
          </div>
        </section>

        <section className="panel menu-panel">
          <div className="section-title">
            <ClipboardList size={18} />
            <h2>Menu State</h2>
          </div>
          <div className="menu-list">
            {menuItems.length === 0 ? (
              <p className="empty-text">No menu loaded.</p>
            ) : (
              menuItems.map((item) => (
                <article key={item.id} className={changedItemIds.has(item.id) ? 'menu-row changed' : 'menu-row'}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.category} | {item.current_price} PKR | stock {item.stock_level}</p>
                  </div>
                  <div className="row-badges">
                    <span className={item.is_available ? 'mini-badge ok' : 'mini-badge bad'}>
                      {item.is_available ? 'Available' : 'Hidden'}
                    </span>
                    {item.is_promoted && <span className="mini-badge promo">Promoted</span>}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {runDetails && (
        <section className="decision-section">
          <div className="decision-header">
            <div>
              <p className="eyebrow">Run #{runDetails.id}</p>
              <h2>{plan?.signal_summary || 'Agent decision'}</h2>
            </div>
            <div className="decision-badges">
              <button
                className={`voice-btn ${isSpeaking ? 'active' : ''}`}
                type="button"
                onClick={toggleSpeakResult}
                disabled={loading || !ttsSupported}
                title={ttsSupported ? 'Read the latest agent result aloud' : 'Spoken result is unavailable in this browser'}
              >
                {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {isSpeaking ? 'Stop speaking' : 'Speak result'}
              </button>
              <span className={`status-pill ${plannerClass(plannerLabel)}`}>
                <ShieldCheck size={16} />
                {plannerLabel}
              </span>
              <span className={`status-pill ${runDetails.status === 'completed' ? 'ok' : 'warn'}`}>
                {runDetails.status}
              </span>
            </div>
          </div>

          {ttsStatus && <p className="tts-status">{ttsStatus}</p>}

          {lastSignal && <p className="signal-quote">{lastSignal}</p>}

          <div className="decision-grid">
            <div className="decision-card wide">
              <h3>Business Insight</h3>
              <p>{plan?.insight || plan?.reason || 'No insight returned.'}</p>
            </div>
            <div className="decision-card">
              <h3>Impact</h3>
              <p>{plan?.impact_analysis || `Impact ${plan?.impact_score ?? 0}/10, confidence ${plan?.confidence ?? 0}`}</p>
            </div>
            <div className="decision-card">
              <h3>Primary Action</h3>
              <p>{formatAction(primaryAction)}</p>
            </div>
          </div>

          <div className="result-columns">
            <div>
              <h3>Recommended Actions</h3>
              <ul className="clean-list">
                {recommendedActions.length ? recommendedActions.map((item, index) => <li key={index}>{item}</li>) : <li>No action recommended.</li>}
              </ul>
            </div>

            <div>
              <h3>Menu Changes</h3>
              <ul className="change-list">
                {changes.length ? changes.map((change, index) => (
                  <li key={index}>
                    <strong>{change.item_id.replace(/_/g, ' ')}</strong>
                    <span>{change.field}: {formatValue(change.before)} {'->'} {formatValue(change.after)}</span>
                  </li>
                )) : <li>No menu fields changed.</li>}
              </ul>
            </div>
          </div>

          {(approvals.length > 0 || notifications.length > 0) && (
            <div className="result-columns compact">
              {approvals.length > 0 && (
                <div>
                  <h3>Approvals</h3>
                  {approvals.map((approval) => (
                    <div className="approval-box" key={approval.id}>
                      <strong>{approval.action_type}</strong>
                      <p>{approval.reason}</p>
                      {approval.status === 'pending' && (
                        <button type="button" className="primary-btn small" onClick={() => approveAction(approval.id)} disabled={loading}>
                          Approve
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {notifications.length > 0 && (
                <div>
                  <h3>Messages</h3>
                  {notifications.map((notification) => (
                    <div className="message-box" key={notification.id}>
                      <strong>{notification.channel.replace(/_/g, ' ')}</strong>
                      <p>{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {opsPlan.length > 0 && (
            <section className="ops-board">
              <div className="ops-header">
                <div>
                  <div className="section-title compact-title">
                    <ListChecks size={18} />
                    <h3>Ops Plan</h3>
                  </div>
                  <p>Notion-style execution board generated from this agent run.</p>
                </div>
                <div className="ops-actions">
                  <span className="status-pill idle">
                    <CheckSquare size={16} />
                    {opsDoneCount}/{opsPlan.length} done
                  </span>
                  <button className="secondary-btn" type="button" onClick={downloadOpsCalendar}>
                    <Download size={16} />
                    Schedule plan
                  </button>
                </div>
              </div>

              <div className="ops-grid">
                {opsPlan.map((task) => {
                  const done = Boolean(completedOpsTasks[task.id]);
                  return (
                    <article key={task.id} className={`ops-card ${task.priority} ${task.status} ${done ? 'done' : ''}`}>
                      <div className="ops-card-top">
                        <button
                          className="task-check"
                          type="button"
                          onClick={() => toggleOpsTask(task.id)}
                          aria-label={done ? 'Mark task open' : 'Mark task done'}
                        >
                          {done && <CheckCircle2 size={14} />}
                        </button>
                        <span className={`mini-badge ${task.priority === 'high' ? 'bad' : task.priority === 'low' ? 'ok' : 'promo'}`}>
                          {task.priority}
                        </span>
                      </div>
                      <h4>{task.title}</h4>
                      <p>{task.detail}</p>
                      <div className="task-meta">
                        <span><Users size={14} /> {task.owner}</span>
                        <span><CalendarDays size={14} /> {task.due}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <details className="audit-log">
            <summary>
              <History size={16} />
              Audit trace ({trace.length})
            </summary>
            <div className="trace-box">
              {trace.map((entry) => (
                <p key={entry.id}>
                  <span>[{entry.step}]</span> {entry.message}
                </p>
              ))}
            </div>
          </details>
        </section>
      )}
    </div>
  );
}

export default App;
