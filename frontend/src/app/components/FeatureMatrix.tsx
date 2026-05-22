import React, { useState } from "react";
import { motion } from "motion/react";
import { Cpu, Eye, ShieldAlert, Zap, Layers, RefreshCw } from "lucide-react";

export default function FeatureMatrix() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: Cpu,
      title: "Live Signal Reasoning",
      tag: "CORE PIPELINE",
      description: "Reads weather, supply, competitor, and event signals, then proposes menu, stock, and messaging actions with clear reasoning.",
      metric: "Live Trace",
      color: "from-teal-500/10 to-emerald-500/10",
      borderColor: "hover:border-emerald-500/40",
      accent: "#00685f"
    },
    {
      icon: Eye,
      title: "Demand Shift Detection",
      tag: "SIGNAL FUSION",
      description: "Forecasts demand pressure from public context such as heatwaves, local events, transit delays, and seasonal behavior.",
      metric: "Scenario Ready",
      color: "from-[#00628d]/10 to-blue-500/10",
      borderColor: "hover:border-[#00628d]/40",
      accent: "#00628d"
    },
    {
      icon: ShieldAlert,
      title: "Ethical Guardrail Layer",
      tag: "RISK PROTECTION",
      description: "Blocks unsafe price spikes, flags risky supply decisions, and keeps sensitive actions behind human approval.",
      metric: "0% Breaches",
      color: "from-rose-500/10 to-red-500/10",
      borderColor: "hover:border-rose-500/40",
      accent: "#ba1a1a"
    },
    {
      icon: Zap,
      title: "Adaptive Stock Planner",
      tag: "SUPPLY CHAIN",
      description: "Turns supply shocks and predicted demand into prep lists, inventory warnings, and manager-ready action plans.",
      metric: "+42% Efficiency",
      color: "from-amber-500/10 to-orange-500/10",
      borderColor: "hover:border-amber-500/40",
      accent: "#d97706"
    },
    {
      icon: Layers,
      title: "Planner Ops Board",
      tag: "PREDICTIVE MODEL",
      description: "Converts AI recommendations into role-based tasks for kitchen, cashier, marketing, and shift-lead workflows.",
      metric: "Actionable Tasks",
      color: "from-indigo-500/10 to-purple-500/10",
      borderColor: "hover:border-indigo-500/40",
      accent: "#6366f1"
    },
    {
      icon: RefreshCw,
      title: "Audit Feedback Loop",
      tag: "CONTINUOUS LEARNING",
      description: "Records every signal, plan, approval, and menu change so operators can inspect why each action happened.",
      metric: "Active Feedback",
      color: "from-cyan-500/10 to-sky-500/10",
      borderColor: "hover:border-cyan-500/40",
      accent: "#06b6d4"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-[#f2f4f6]">
      {/* Liquid fluid glowing background shapes for glass effect */}
      <div className="ambient-blur-layer absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#00685f]/5 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[15%] w-[60%] h-[60%] rounded-full bg-[#00628d]/5 blur-[150px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-emerald-500/5 blur-[100px] animate-pulse" />
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Header with Smooth Text Reveal */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1 shadow-xs border border-[#bcc9c6]/50 text-xs font-semibold text-[#00685f] uppercase tracking-wider mb-4"
          >
            <span>Platform Capabilities</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#191c1e] max-w-2xl mx-auto"
          >
            Liquid systems for <span className="font-serif italic text-[#00685f]">responsive</span> retail
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 text-[#3d4947] text-sm sm:text-base max-w-xl mx-auto font-medium"
          >
            Built to bridge the gap between AI recommendations and real cafe operations: menu changes, approvals, stock prep, and explainable audit trails.
          </motion.p>
        </div>

        {/* Liquid Glass Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            const isHovered = hoveredIndex === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative rounded-3xl p-6 bg-white/40 backdrop-blur-xl border border-[#bcc9c6]/40 shadow-[inset_0_1px_3px_rgba(255,255,255,0.7)] hover:shadow-lg transition-all duration-300 overflow-hidden cursor-default flex flex-col justify-between group ${item.borderColor}`}
                style={{
                  minHeight: "260px"
                }}
              >
                {/* Liquid glow blob following the cursor or fixed corner gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
                />

                {/* Visual Accent Corner Glow */}
                <span
                  className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-b from-transparent to-transparent opacity-10 group-hover:opacity-20 transition-all duration-300 rounded-bl-3xl -z-5 pointer-events-none"
                  style={{ backgroundColor: item.accent }}
                />

                <div>
                  {/* Top bar with icon & tag */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="p-3 rounded-2xl bg-white/80 border border-[#bcc9c6]/30 shadow-xs transition-transform duration-300 group-hover:scale-105"
                      style={{ color: item.accent }}
                    >
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="font-mono text-[9px] font-bold text-[#3d4947] tracking-widest bg-neutral-100/80 px-2 py-1 rounded">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-[#191c1e] mb-2 group-hover:text-[#00685f] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#3d4947] leading-relaxed mb-4 group-hover:text-black/80 transition-colors">
                    {item.description}
                  </p>
                </div>

                {/* Metric Footer */}
                <div className="flex items-center justify-between border-t border-[#bcc9c6]/10 pt-3 mt-2">
                  <span className="text-[10px] uppercase font-bold text-[#3d4947] tracking-wider">
                    Telemetry Status
                  </span>
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{
                      color: item.accent,
                      backgroundColor: `${item.accent}0a`,
                      border: `1.5px solid ${item.accent}15`
                    }}
                  >
                    {item.metric}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
