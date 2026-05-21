'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Zap, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { REVEAL_UP, BUTTON_ANIMATION } from '@/lib/animations';
import { useToast } from '@/components/layout/Toast';
import { api } from '@/lib/api';
import { DotMatrixLoader, DotText, GlowingBorder } from '@/components/ui';

interface SignalInputProps {
  onSignalSubmit?: (signal: {
    type: 'Pricing Logic' | 'Inventory' | 'Upsell Engine' | 'Demand Forecast' | 'Staffing';
    title: string;
    description: string;
    confidence: number;
  }) => void;
}

interface ProcessedCommand {
  type: 'Pricing Logic' | 'Inventory' | 'Upsell Engine' | 'Demand Forecast' | 'Staffing';
  title: string;
  description: string;
  confidence: number;
}

const COMMAND_PATTERNS: Record<string, { label: string; prompt: string; preview: () => ProcessedCommand }> = {
  marathon: {
    label: 'Marathon Demand',
    prompt: 'A marathon is happening near G-13 now with warm weather. If this was my restaurant, what should I change in menu, stock, staffing, and promotions?',
    preview: () => ({
      type: 'Demand Forecast',
      title: 'Marathon opportunity analysis',
      description: 'Routes event demand through the live MenuMind agent for hydration, stock, staffing, and promotion decisions.',
      confidence: 91,
    }),
  },
  supplier: {
    label: 'Supplier Shock',
    prompt: 'Supplier says chicken delivery failed today near mandi. What should my cafe do with menu availability, substitutes, and staff alerts?',
    preview: () => ({
      type: 'Inventory',
      title: 'Supplier disruption analysis',
      description: 'Tests the live agent against menu hiding, substitution, approval, and staff notification logic.',
      confidence: 96,
    }),
  },
  competitor: {
    label: 'Competitor Attack',
    prompt: 'A nearby cafe dropped lunch prices aggressively. What competitive response should my restaurant take without damaging margins?',
    preview: () => ({
      type: 'Pricing Logic',
      title: 'Competitor response analysis',
      description: 'Asks the live agent for margin-aware menu positioning and promotion strategy.',
      confidence: 88,
    }),
  },
  heatwave: {
    label: 'Heatwave Demand',
    prompt: 'Weather alert: 43C heatwave near the restaurant. What menu, stock, and customer message should MenuMind execute?',
    preview: () => ({
      type: 'Demand Forecast',
      title: 'Heatwave demand shift',
      description: 'Runs the real planner against weather demand, hydration products, stock, and customer messaging.',
      confidence: 95,
    }),
  },
  crisis: {
    label: 'Crisis Guardrail',
    prompt: 'Flood and road blockage near the restaurant is causing delivery delays. What should we do without unethical surge pricing?',
    preview: () => ({
      type: 'Pricing Logic',
      title: 'Crisis guardrail test',
      description: 'Forces the policy layer to block unsafe price increases and require human approval.',
      confidence: 82,
    }),
  },
};

export function SignalInput({ onSignalSubmit }: SignalInputProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    
    try {
      const result = await api.operations.createSignal({
        type: 'web',
        message: input,
        priority: 'medium',
      });
      const plan = result.plan || {};
      const primary = plan.primary_action?.tool
        ? String(plan.primary_action.tool).replaceAll('_', ' ')
        : 'agent action';
      onSignalSubmit?.({
        type: plan.requires_approval ? 'Pricing Logic' : 'Demand Forecast',
        title: plan.signal_summary || 'Live agent run completed',
        description: plan.insight || plan.reason || `Primary action: ${primary}`,
        confidence: Math.round((plan.confidence || 0.82) * 100),
      });
      showToast('success', 'Live Agent Completed', plan.insight || 'MenuMind updated the operational state.');
      setInput('');
      
    } catch (error) {
      showToast('error', 'Processing Failed', error instanceof Error ? error.message : 'Unable to reach the AI backend.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, onSignalSubmit, showToast]);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const getQuickActionIcon = (type: string) => {
    switch (type) {
      case 'Pricing Logic': return <TrendingUp size={14} />;
      case 'Inventory': return <Package size={14} />;
      case 'Upsell Engine': return <ShoppingCart size={14} />;
      default: return <Zap size={14} />;
    }
  };

  return (
    <motion.div
      variants={REVEAL_UP}
      initial="hidden"
      animate="visible"
    >
      <GlowingBorder active={isProcessing}>
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            border: '1px solid var(--outline-variant)',
            boxShadow: isProcessing
              ? 'inset 0 0 42px rgba(137, 245, 231, 0.12), inset 0 0 120px rgba(0, 104, 95, 0.08)'
              : 'none',
            overflow: 'hidden',
            transition: 'box-shadow 260ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <Sparkles size={18} color="var(--primary)" />
            <div>
              <p className="label-caps" style={{ marginBottom: '4px' }}>Signal intake</p>
              <DotText as="span" size="md">COMMAND</DotText>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            alignItems: 'center',
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask the AI to analyze, optimize, or create..."
              disabled={isProcessing}
              style={{
                flex: 1,
                background: 'var(--surface-container-low)',
                border: '1px solid var(--outline-variant)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: 'var(--on-surface)',
                fontSize: 'var(--font-size-body-sm)',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
            />
            <motion.button
              {...BUTTON_ANIMATION}
              onClick={handleSubmit}
              disabled={isProcessing || !input.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isProcessing
                  ? 'transparent'
                  : input.trim()
                    ? 'var(--primary)'
                    : 'var(--surface-container-high)',
                border: isProcessing ? '1px solid transparent' : 'none',
                borderRadius: 'var(--radius-md)',
                padding: '12px 20px',
                cursor: isProcessing ? 'progress' : input.trim() ? 'pointer' : 'not-allowed',
                minWidth: '48px',
                color: isProcessing ? 'var(--on-surface)' : 'var(--on-primary)',
              }}
            >
              {isProcessing ? (
                <DotMatrixLoader size={24} dotSize={4} />
              ) : (
                <Send size={18} color={input.trim() ? 'var(--on-primary)' : 'var(--outline)'} />
              )}
            </motion.button>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--space-xs)',
            marginTop: 'var(--space-md)',
            flexWrap: 'wrap',
          }}>
            {Object.entries(COMMAND_PATTERNS).slice(0, 5).map(([cmd, command]) => (
              <button
                key={cmd}
                onClick={() => setInput(command.prompt)}
                disabled={isProcessing}
                style={{
                  background: 'var(--surface-container-low)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--on-surface-variant)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
              >
                {getQuickActionIcon(command.preview().type)}
                {command.label}
              </button>
            ))}
          </div>

        </div>
      </GlowingBorder>
    </motion.div>
  );
}
