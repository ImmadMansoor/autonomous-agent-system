'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Shield, Sliders, Info, Save, Loader2 } from 'lucide-react';
import { REVEAL_UP } from '@/lib/animations';
import { RippleButton, useToast } from '@/components/layout';
import { api } from '@/lib/api';

const DECISION_SPEED_OPTIONS = [
  { id: 'fast', label: 'Fast', model: 'Gemini 2.5 Flash' },
  { id: 'balanced', label: 'Balanced', model: 'Gemini 2.5 Pro' },
  { id: 'thorough', label: 'Thorough', model: 'Gemini 3 Flash Preview' },
];

function normalizeThreshold(value: unknown) {
  const number = Number(value ?? 95);
  if (!Number.isFinite(number)) return 95;
  if (number > 0 && number <= 1) return Math.round(number * 100);
  return Math.max(0, Math.min(100, Math.round(number)));
}

export function AIPreferences() {
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState({
    autoApproveThreshold: 95,
    riskTolerance: 'medium',
    decisionSpeed: 'balanced',
    humanOverride: true,
    explainDecisions: true,
    learnFromFeedback: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api.settings.getAiPreferences()
      .then(res => {
        if (active) {
          setPreferences({
            autoApproveThreshold: normalizeThreshold(res.autoApproveThreshold),
            riskTolerance: res.riskTolerance ?? 'medium',
            decisionSpeed: res.decisionSpeed ?? 'balanced',
            humanOverride: res.humanOverride ?? true,
            explainDecisions: res.explainDecisions ?? true,
            learnFromFeedback: res.learnFromFeedback ?? true,
          });
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load AI preferences:', err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.settings.updateAiPreferences(preferences);
      showToast('success', 'AI preferences saved', 'Your AI agent configuration has been updated.');
    } catch (err) {
      console.error('Failed to update AI preferences:', err);
      showToast('error', 'Error updating AI preferences', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div variants={REVEAL_UP} initial="hidden" animate="visible">
      <div style={{
        background: 'var(--surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--outline-variant)',
        padding: 'var(--space-lg)',
        position: 'relative',
      }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--surface)',
            opacity: 0.8,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xl)',
            zIndex: 10,
          }}>
            <Loader2 className="animate-spin" size={24} color="var(--primary)" />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            padding: 'var(--space-sm)',
            background: 'var(--tertiary-container)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Brain size={20} color="var(--on-tertiary-container)" />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'var(--font-size-headline-sm)',
              fontWeight: 600,
              color: 'var(--on-surface)',
            }}>
              AI Agent Preferences
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--on-surface-variant)',
            }}>
              Configure how the AI agent operates
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <Shield size={18} color="var(--primary)" />
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-body-md)',
                    fontWeight: 500,
                    color: 'var(--on-surface)',
                  }}>
                    Auto-Approve Threshold
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-body-sm)',
                  color: 'var(--on-surface-variant)',
                  margin: 0,
                  marginTop: 'var(--space-xs)',
                }}>
                  Automatically approve recommendations above {preferences.autoApproveThreshold}% confidence
                </p>
              </div>
              <span style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'var(--font-size-headline-sm)',
                fontWeight: 700,
                color: 'var(--primary)',
              }}>
                {preferences.autoApproveThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={preferences.autoApproveThreshold}
              onChange={(e) => setPreferences({ ...preferences, autoApproveThreshold: parseInt(e.target.value) })}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: `linear-gradient(to right, var(--primary) ${preferences.autoApproveThreshold}%, var(--surface-container) ${preferences.autoApproveThreshold}%)`,
                outline: 'none',
                WebkitAppearance: 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <Sliders size={18} color="var(--tertiary)" />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-body-md)',
                fontWeight: 500,
                color: 'var(--on-surface)',
              }}>
                Risk Tolerance
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)' }}>
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPreferences({ ...preferences, riskTolerance: level })}
                  style={{
                    padding: 'var(--space-md)',
                    background: preferences.riskTolerance === level ? 'var(--primary)' : 'var(--surface-container)',
                    color: preferences.riskTolerance === level ? 'var(--on-primary)' : 'var(--on-surface)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-label)',
                    fontSize: 'var(--font-size-label-md)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    transition: 'all 0.2s',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <Zap size={18} color="var(--tertiary)" />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-body-md)',
                fontWeight: 500,
                color: 'var(--on-surface)',
              }}>
                Decision Speed
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)' }}>
              {DECISION_SPEED_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPreferences({ ...preferences, decisionSpeed: option.id })}
                  style={{
                    padding: 'var(--space-md)',
                    background: preferences.decisionSpeed === option.id ? 'var(--primary)' : 'var(--surface-container)',
                    color: preferences.decisionSpeed === option.id ? 'var(--on-primary)' : 'var(--on-surface)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-label)',
                    fontSize: 'var(--font-size-label-md)',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span>{option.label}</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    opacity: 0.78,
                  }}>
                    {option.model}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
            padding: 'var(--space-md)',
            background: 'var(--surface-container)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--outline-variant)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Info size={16} color="var(--tertiary)" />
              <span style={{
                fontFamily: 'var(--font-label)',
                fontSize: 'var(--font-size-label-md)',
                color: 'var(--on-surface-variant)',
              }}>
                Advanced Options
              </span>
            </div>
            <ToggleOption
              label="Human Override"
              description="Always allow manual override of AI decisions"
              checked={preferences.humanOverride}
              onChange={(v) => setPreferences({ ...preferences, humanOverride: v })}
            />
            <ToggleOption
              label="Explain Decisions"
              description="Provide detailed reasoning for each recommendation"
              checked={preferences.explainDecisions}
              onChange={(v) => setPreferences({ ...preferences, explainDecisions: v })}
            />
            <ToggleOption
              label="Learn from Feedback"
              description="Improve recommendations based on your approvals/rejections"
              checked={preferences.learnFromFeedback}
              onChange={(v) => setPreferences({ ...preferences, learnFromFeedback: v })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-md)' }}>
            <RippleButton variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save AI Preferences'}
            </RippleButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ToggleOptionProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleOption({ label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-body-sm)',
          fontWeight: 500,
          color: 'var(--on-surface)',
          margin: 0,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-label-md)',
          color: 'var(--on-surface-variant)',
          margin: 0,
        }}>
          {description}
        </p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        type="button"
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          background: checked ? 'var(--primary)' : 'var(--outline-variant)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
        }}
      >
        <span style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '20px' : '2px',
          width: '20px',
          height: '20px',
          borderRadius: '10px',
          background: 'var(--surface)',
          transition: 'all 0.2s',
        }} />
      </button>
    </div>
  );
}
