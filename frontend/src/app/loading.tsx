'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      gap: '24px',
    }}>
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0, 104, 95, 0.3)',
        }}
      >
        <Brain 
          size={40} 
          color="var(--on-primary)" 
          style={{ fontVariationSettings: "'FILL' 1" }} 
        />
      </motion.div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--primary)',
          letterSpacing: '-0.02em',
        }}>
          CafeAI Ops
        </h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--primary)',
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}