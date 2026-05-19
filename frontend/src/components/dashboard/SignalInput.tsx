'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, Zap, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { REVEAL_UP, BUTTON_ANIMATION } from '@/lib/animations';
import { SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, COLORS, SHADOWS, GLASS } from '@/lib/constants';
import { useToast } from '@/components/layout/Toast';

import { useAuth } from '@/lib/auth';

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

const COMMAND_PATTERNS: Record<string, () => ProcessedCommand> = {
  analyze: () => ({
    type: 'Demand Forecast',
    title: 'Sales Pattern Analysis Complete',
    description: 'Analyzed current sales data. Found 23% higher traffic during afternoon hours. Recommend staffing adjustment.',
    confidence: 89,
  }),
  sales: () => ({
    type: 'Demand Forecast',
    title: 'Sales Performance Review',
    description: 'Today\'s revenue is 12% above average. Top sellers: Iced Latte, Matcha, Avocado Toast.',
    confidence: 94,
  }),
  optimize: () => ({
    type: 'Pricing Logic',
    title: 'Pricing Optimization Complete',
    description: 'Analyzed competitive positioning. Recommended 8% price adjustment on premium drinks to maximize margin.',
    confidence: 91,
  }),
  menu: () => ({
    type: 'Upsell Engine',
    title: 'Menu Optimization Suggested',
    description: 'Cross-analysis shows "Pastry Pairing" could increase average ticket by $2.40. Activate on kiosks?',
    confidence: 87,
  }),
  inventory: () => ({
    type: 'Inventory',
    title: 'Inventory Review Complete',
    description: 'Detected 3 items below safety threshold: Almond Milk, Oat Milk, Espresso Beans. Auto-reorder recommended.',
    confidence: 96,
  }),
  stock: () => ({
    type: 'Inventory',
    title: 'Stock Level Analysis',
    description: 'Current inventory status: 8 items optimal, 3 low, 1 critical. View detailed report?',
    confidence: 93,
  }),
  pricing: () => ({
    type: 'Pricing Logic',
    title: 'Dynamic Pricing Update',
    description: 'Weather-based pricing activated. Iced drinks reduced by $0.50 based on temperature forecast.',
    confidence: 88,
  }),
  weather: () => ({
    type: 'Demand Forecast',
    title: 'Weather Impact Analysis',
    description: 'Heat advisory detected. Predicted 22% increase in cold beverages. Pre-positioning ingredients.',
    confidence: 95,
  }),
  staff: () => ({
    type: 'Staffing',
    title: 'Shift Optimization Recommended',
    description: 'Event detected nearby. Recommend +2 baristas from 10AM-2PM. Estimated coverage: 94%.',
    confidence: 82,
  }),
  supplier: () => ({
    type: 'Inventory',
    title: 'Supplier Status Update',
    description: 'Central supplier flagged delay. Switched to GreenValley backup. Delivery: 2 hours.',
    confidence: 90,
  }),
};

export function SignalInput({ onSignalSubmit }: SignalInputProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const processCommand = useCallback((command: string): ProcessedCommand | null => {
    const lowerCommand = command.toLowerCase();
    
    for (const [keyword, handler] of Object.entries(COMMAND_PATTERNS)) {
      if (lowerCommand.includes(keyword)) {
        return handler();
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
    if (!user?.id) {
      showToast('error', 'Authentication Error', 'You must be logged in to use the AI command.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/agents/simulate-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, userId: user.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reach AI agent');
      }
      
      const result = await response.json();
      showToast('success', 'AI Agent Activated', 'Your signal has been queued for reasoning.');
      setInput('');
      
    } catch (error) {
      showToast('error', 'Processing Failed', 'Unable to reach the AI backend.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, showToast, user]);

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
        {Object.keys(COMMAND_PATTERNS).slice(0, 5).map((cmd) => (
          <button
            key={cmd}
            onClick={() => setInput(cmd)}
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
            {getQuickActionIcon(COMMAND_PATTERNS[cmd]().type)}
            {cmd}
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