'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, Zap, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { REVEAL_UP, BUTTON_ANIMATION } from '@/lib/animations';
import { SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, COLORS, SHADOWS, GLASS } from '@/lib/constants';
import { useToast } from '@/components/layout/Toast';
import { api } from '@/lib/api';

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

  const processCommand = useCallback((command: string): ProcessedCommand | null => {
    const lowerCommand = command.toLowerCase();
    
    for (const [keyword, handler] of Object.entries(COMMAND_PATTERNS)) {
      if (lowerCommand.includes(keyword)) {
        return handler.preview();
      }
    }
    
    return {
      type: 'Demand Forecast',
      title: `Command Processed: ${command.slice(0, 30)}...`,
      description: `AI analyzed your request "${command}". Generating insights based on current operational data.`,
      confidence: 75,
    };
  }, []);

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
      style={{
        background: COLORS.SURFACE_CONTAINER_LOWEST,
        backdropFilter: GLASS.BACKDROP_FILTER,
        borderRadius: RADIUS.LG,
        padding: SPACING.LG,
        border: `1px solid ${COLORS.TERTIARY}`,
        boxShadow: SHADOWS.ELEVATED,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.SM, marginBottom: SPACING.MD }}>
        <Sparkles size={18} color={COLORS.TERTIARY} />
        <span style={{
          fontFamily: TYPOGRAPHY.FONT_HEADLINE,
          fontSize: FONT_SIZES.HEADLINE_SM,
          fontWeight: 600,
          color: COLORS.ON_SURFACE,
        }}>
          AI Command Input
        </span>
      </div>
      
      <div style={{
        display: 'flex',
        gap: SPACING.SM,
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
            background: COLORS.SURFACE_CONTAINER_LOWEST,
            border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
            borderRadius: RADIUS.MD,
            padding: '12px 16px',
            color: COLORS.ON_SURFACE,
            fontSize: FONT_SIZES.BODY_SM,
            fontFamily: TYPOGRAPHY.FONT_BODY,
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
            background: input.trim() && !isProcessing ? COLORS.TERTIARY : COLORS.SURFACE_CONTAINER_HIGH,
            border: 'none',
            borderRadius: RADIUS.MD,
            padding: '12px 20px',
            cursor: input.trim() && !isProcessing ? 'pointer' : 'not-allowed',
            minWidth: '48px',
          }}
        >
          {isProcessing ? (
            <Loader2 size={18} color={COLORS.ON_TERTIARY} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Send size={18} color={input.trim() ? COLORS.ON_TERTIARY : COLORS.OUTLINE} />
          )}
        </motion.button>
      </div>
      
      <div style={{
        display: 'flex',
        gap: SPACING.XS,
        marginTop: SPACING.MD,
        flexWrap: 'wrap',
      }}>
        {Object.entries(COMMAND_PATTERNS).slice(0, 5).map(([cmd, command]) => (
          <button
            key={cmd}
            onClick={() => setInput(command.prompt)}
            disabled={isProcessing}
            style={{
              background: COLORS.SURFACE_CONTAINER_LOW,
              border: 'none',
              borderRadius: RADIUS.FULL,
              padding: `${SPACING.XS} ${SPACING.SM}`,
              fontSize: '11px',
              fontFamily: TYPOGRAPHY.FONT_BODY,
              color: COLORS.ON_SURFACE_VARIANT,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {getQuickActionIcon(command.preview().type)}
            {command.label}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
