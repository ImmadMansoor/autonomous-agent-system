import React from "react";
import { motion } from "framer-motion";
import { Cpu, Eye, ShieldAlert, Zap, Layers, RefreshCw } from "lucide-react";
import { GlowingEffect } from "./GlowingEffect";

export default function FeatureMatrix() {
  const features = [
    {
      icon: Cpu,
      title: "Real-Time Neural Engine",
      tag: "CORE PIPELINE",
      description: "Continuously scales menu item weights and pricing configurations based on real-time pedestrian density and thermal telemetry.",
      metric: "12ms Latency",
      color: "rgba(0, 104, 95, 0.2)",
      accent: "#00685f"
    },
    {
      icon: Eye,
      title: "Vision-Based Cohort Profiling",
      tag: "AUDIENCE ESTIMATOR",
      description: "Non-PII opt-in camera sensors track local demographic vectors to forecast demand shift factors for cold vs. warm menu models.",
      metric: "94.8% Accuracy",
      color: "rgba(0, 98, 141, 0.2)",
      accent: "#00628d"
    },
    {
      icon: ShieldAlert,
      title: "Asymmetric Guardrail Matrix",
      tag: "RISK PROTECTION",
      description: "Automated safe-limits system that shuts off aggressive surge spikes if supply matrices fail to clear standard resilience thresholds.",
      metric: "0% Breaches",
      color: "rgba(186, 26, 26, 0.2)",
      accent: "#ba1a1a"
    },
    {
      icon: Zap,
      title: "Adaptive Stock Allocator",
      tag: "SUPPLY CHAIN",
      description: "Redirects central warehouse logistics using instant telemetry before local physical inventories reach critical buffer zones.",
      metric: "+42% Efficiency",
      color: "rgba(217, 119, 6, 0.2)",
      accent: "#d97706"
    },
    {
      icon: Layers,
      title: "State-Space Model Layer",
      tag: "PREDICTIVE MODEL",
      description: "Translates stochastic weather forecasting models and transit delays into immediate micro-shifts on espresso bean extractions.",
      metric: "3.2 Hours Ahead",
      color: "rgba(99, 102, 241, 0.2)",
      accent: "#6366f1"
    },
    {
      icon: RefreshCw,
      title: "Self-Healing Cycle Feedback",
      tag: "CONTINUOUS LEARNING",
      description: "Re-adjusts simulation weights dynamically every 24 hours to match historical localized conversion rates perfectly.",
      metric: "Active Feedback",
      color: "rgba(6, 182, 212, 0.2)",
      accent: "#06b6d4"
    }
  ];

  return (
    <section id="telemetry" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-[#f2f4f6]">
      {/* Liquid fluid glowing background shapes for glass effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
            className="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1 shadow-xs border border-zinc-300/60 text-xs font-semibold text-[#00685f] uppercase tracking-wider mb-4"
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
            Engineered to bridge the gap between high-frequency environmental realities and rigid localized retail margins.
          </motion.p>
        </div>

        {/* Liquid Glass Interactive Grid with custom colored mouse follow borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="relative rounded-3xl p-6 bg-white/40 backdrop-blur-xl border border-zinc-300/40 shadow-[inset_0_1px_3px_rgba(255,255,255,0.7)] hover:shadow-lg transition-all duration-300 overflow-hidden cursor-default flex flex-col justify-between group min-h-[260px]"
              >
                {/* 1. Proximity Glowing Border matching the card's specific color theme! */}
                <GlowingEffect
                  spread={140}
                  glow={false}
                  proximity={96}
                  borderWidth={1.5}
                  colorFrom={item.color}
                  colorTo={`${item.accent}10`}
                />

                <div>
                  {/* Top bar with icon & tag */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div 
                      className="p-3 rounded-2xl bg-white/80 border border-zinc-300/30 shadow-xs transition-transform duration-300 group-hover:scale-105"
                      style={{ color: item.accent }}
                    >
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="font-mono text-[9px] font-bold text-[#3d4947] tracking-widest bg-neutral-100/80 px-2 py-1 rounded">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-[#191c1e] mb-2 group-hover:text-[#00685f] transition-colors leading-snug relative z-10">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#3d4947] leading-relaxed mb-4 group-hover:text-black/80 transition-colors relative z-10">
                    {item.description}
                  </p>
                </div>

                {/* Metric Footer */}
                <div className="flex items-center justify-between border-t border-[#bcc9c6]/10 pt-3 mt-2 relative z-10">
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
