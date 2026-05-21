'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, X, Gavel, Zap, Brain, ExternalLink } from 'lucide-react';
import { REVEAL_UP } from '@/lib/animations';
import { RecentApproval, PolicyLimit } from '@/data';
import { formatRelativeTime } from '@/data/mockData';
import { useToast } from '@/components/layout';

interface ApprovalsSidebarProps {
  recentApprovals: RecentApproval[];
  policyLimits: PolicyLimit[];
  aiModelStatus: {
    status: 'operational' | 'degraded' | 'offline';
    version: string;
  };
}

export function ApprovalsSidebar({ 
  recentApprovals, 
  policyLimits, 
  aiModelStatus 
}: ApprovalsSidebarProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const handleViewAuditLog = () => {
    router.push('/audit-log');
  };

  const handlePolicyClick = (policy: PolicyLimit) => {
    showToast('info', policy.label, `Current usage: ${policy.progress}% of ${policy.value}`);
  };

  const handleAIModelClick = () => {
    showToast('success', 'AI Model', `Model ${aiModelStatus.version} is running smoothly`);
  };

  return (
    <motion.div
      variants={REVEAL_UP}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <motion.div
        variants={REVEAL_UP}
        initial="hidden"
        animate="visible"
        style={{
          background: 'var(--surface-container-lowest)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--outline-variant)',
          padding: 'var(--space-lg)',
          boxShadow: 'none',
        }}
      >
        <h3 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'var(--font-size-headline-sm)',
          fontWeight: 600,
          color: 'var(--on-surface)',
          marginBottom: 'var(--space-md)',
        }}>
          Recent Approvals
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {recentApprovals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-lg)',
              color: 'var(--on-surface-variant)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-body-sm)',
              fontStyle: 'italic',
            }}>
              No approvals recorded yet.
            </div>
          ) : recentApprovals.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: item.action === 'approved' ? 'rgba(0, 104, 95, 0.1)' : 'rgba(186, 26, 26, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.action === 'approved' ? 'var(--primary)' : 'var(--error)',
                flexShrink: 0,
              }}>
                {item.action === 'approved' ? <Check size={18} /> : <X size={18} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                }}>
                  {item.title}
                </p>
                <p style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: 'var(--font-size-label-md)',
                  color: 'var(--on-surface-variant)',
                }}>
                  {item.action === 'approved' ? `Approved by ${item.user}` : 'Rejected'} • {formatRelativeTime(item.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={handleViewAuditLog}
          style={{
            width: '100%',
            marginTop: 'var(--space-lg)',
            padding: 'var(--space-sm)',
            color: 'var(--primary)',
            fontFamily: 'var(--font-label)',
            fontSize: 'var(--font-size-label-md)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-xs)',
          }}
        >
          View Full Audit Log
          <ExternalLink size={14} />
        </button>
      </motion.div>

      <motion.div
        variants={REVEAL_UP}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        style={{
          background: 'var(--surface-container)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--outline-variant)',
          padding: 'var(--space-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <Gavel size={18} color="var(--on-surface-variant)" />
          <h3 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'var(--font-size-headline-sm)',
            fontWeight: 600,
            color: 'var(--on-surface)',
          }}>
            Policy Limits
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {policyLimits.map((policy) => (
            <div 
              key={policy.label} 
              onClick={() => handlePolicyClick(policy)}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'var(--space-sm)',
                cursor: 'pointer',
                padding: 'var(--space-xs)',
                margin: 'calc(-1 * var(--space-xs))',
                borderRadius: 'var(--radius-md)',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: 'var(--font-size-label-md)',
                  color: 'var(--on-surface-variant)',
                }}>
                  {policy.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: 'var(--font-size-label-md)',
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                }}>
                  {policy.value}
                </span>
              </div>
              <div style={{
                height: '4px',
                width: '100%',
                background: 'var(--surface-container-highest)',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: 'var(--tertiary)',
                  width: `${policy.progress}%`,
                }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 'var(--space-lg)',
          padding: 'var(--space-md)',
          background: 'var(--surface-container-low)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--outline-variant)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-body-sm)',
            color: 'var(--on-surface-variant)',
            lineHeight: 1.6,
          }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Note:</span> High-risk approvals override standard policy and require 2-factor sign-off.
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={REVEAL_UP}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        onClick={handleAIModelClick}
        style={{
          padding: 'var(--space-lg)',
          background: 'var(--primary)',
          color: 'var(--on-primary)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Brain size={20} style={{ fontVariationSettings: "'FILL' 1" }} />
          </div>
          <span style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '12px',
            height: '12px',
            background: 'var(--primary-fixed)',
            border: '2px solid var(--primary)',
            borderRadius: '50%',
          }} />
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-label)',
            fontSize: 'var(--font-size-label-md)',
            opacity: 0.8,
          }}>
            AI Model Status
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-body-sm)',
            fontWeight: 600,
          }}>
            {aiModelStatus.status.charAt(0).toUpperCase() + aiModelStatus.status.slice(1)} • {aiModelStatus.version}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}