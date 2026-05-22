import React, { useState } from "react";
import { motion } from "motion/react";
import { Compass, Sparkles, TrendingUp, HelpCircle } from "lucide-react";

export default function SandboxModel() {
  const [maxSurge, setMaxSurge] = useState(25);
  const [minYield, setMinYield] = useState(1.1);
  const [bufferRatio, setBufferRatio] = useState(15);

  // Simple reactive model calculations based on sliders
  const predictedRevenueFactor = (1 + (maxSurge / 100) * 0.45 + (1.5 - minYield) * 0.25).toFixed(2);
  const predictedConversionFactor = Math.max(20, Math.min(100, Math.round(100 - (maxSurge * 1.25) + (1.5 - minYield) * 15 - (bufferRatio * 0.3)))).toFixed(0);

  // Build points for a gorgeous custom interactive bezier curve representing conversion
  const svgWidth = 320;
  const svgHeight = 140;

  // Calculate dynamic control points based on slider values to bend the visual spline
  const curveY = 130 - (Number(predictedConversionFactor) / 100) * 100;
  const peakY = Math.max(10, Math.min(120, 130 - (maxSurge / 50) * 100));
  const controlPointX = 100 + (bufferRatio * 5);
  const pathData = `M 20 120 Q ${controlPointX} ${peakY}, 280 ${curveY}`;

  return (
    <section id="sandbox" className="py-20 px-4 sm:px-6 relative bg-[#f2f4f6]">
      <div className="max-w-[1100px] mx-auto">

        {/* Section Header with smooth reveals */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1 shadow-xs border border-[#bcc9c6]/50 text-xs font-semibold text-[#00685f] uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>Policy Sandbox Model</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#191c1e] max-w-3xl mx-auto">
            Calibrate your autonomy <span className="font-serif italic text-[#00685f]">safeguards</span>
          </h2>
          <p className="mt-4 text-[#3d4947] text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Fine-tune the mathematical parameters that govern MenuMind's localized price elasticity solvers. Toggle coefficients to predict daily conversion curves in real-time.
          </p>
        </div>

        {/* Dynamic Sandbox Panel (Liquid Glass Layout) */}
        <div className="bg-white/50 backdrop-blur-xl border border-[#bcc9c6] rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Sliders Input Panel (7 columns) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-2 pb-4 border-b border-[#bcc9c6]/30">
              <span className="w-5 h-5 rounded-full bg-[#00685f]/10 text-[#00685f] flex items-center justify-center text-xs">
                1
              </span>
              <h3 className="font-bold text-[#191c1e] text-base">
                Elasticity Boundaries
              </h3>
            </div>

            {/* Slider 1 */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-[11px] font-bold text-[#191c1e] uppercase tracking-wider block">
                  Max Surge Pricing Coefficient
                </label>
                <span className="text-sm font-mono font-bold text-[#00685f]">
                  +{maxSurge}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={maxSurge}
                onChange={(e) => setMaxSurge(Number(e.target.value))}
                className="w-full accent-[#00685f] h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-[#3d4947] mt-1.5 leading-relaxed font-semibold">
                Caps the maximum price adjustment MenuMind can recommend during unusually high demand.
              </p>
            </div>

            {/* Slider 2 */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-[11px] font-bold text-[#191c1e] uppercase tracking-wider block">
                  Minimum Food/Beverage Yield Safeguard
                </label>
                <span className="text-sm font-mono font-bold text-[#00628d]">
                  {minYield.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.9"
                max="1.5"
                step="0.05"
                value={minYield}
                onChange={(e) => setMinYield(Number(e.target.value))}
                className="w-full accent-[#00628d] h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-[#3d4947] mt-1.5 leading-relaxed font-semibold">
                Sets the baseline floor relative to recipe cost parameters, ensuring clearance events never plunge below baseline margin values.
              </p>
            </div>

            {/* Slider 3 */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-[11px] font-bold text-[#191c1e] uppercase tracking-wider block">
                  Logistical Buffer Target Ratio
                </label>
                <span className="text-sm font-mono font-bold text-amber-600">
                  {bufferRatio}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={bufferRatio}
                onChange={(e) => setBufferRatio(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-[#3d4947] mt-1.5 leading-relaxed font-semibold">
                Sets the optimal threshold of physical store stock buffer before the automated logistics pipeline routes warehouse dispatchers.
              </p>
            </div>
          </div>

          {/* Math Output Visualizer (5 columns) */}
          <div className="lg:col-span-5 bg-white border border-[#bcc9c6] rounded-2xl p-6 shadow-xs flex flex-col justify-between self-stretch min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#bcc9c6]/20">
                <span className="text-xs font-bold text-[#3d4947] uppercase tracking-widest block">
                  Predicted Performance Spline
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#00685f] font-semibold bg-[#e0f1ee] px-2.5 py-0.5 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Model Stable
                </span>
              </div>

              {/* Dynamic conversion stats block */}
              <div className="grid grid-cols-2 gap-4 my-2">
                <div className="bg-[#f7f9fb] p-3 rounded-xl border border-neutral-100">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#3d4947] block mb-0.5">
                    Surge Index Factor
                  </span>
                  <span className="text-lg font-bold text-[#191c1e]">
                    {predictedRevenueFactor}x
                  </span>
                </div>

                <div className="bg-[#f7f9fb] p-3 rounded-xl border border-neutral-100">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#3d4947] block mb-0.5">
                    Conversion Rate Index
                  </span>
                  <span className="text-lg font-bold text-[#191c1e]">
                    {predictedConversionFactor}%
                  </span>
                </div>
              </div>

              {/* Interactive Mathematical spline curve drawing */}
              <div className="relative mt-4 bg-neutral-50/50 rounded-xl border border-[#bcc9c6]/30 p-2 overflow-hidden h-[120px] flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 300 120">
                  {/* Grid Lines */}
                  <line x1="20" y1="10" x2="280" y2="10" stroke="#bcc9c6" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="20" y1="65" x2="280" y2="65" stroke="#bcc9c6" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="20" y1="120" x2="280" y2="120" stroke="#bcc9c6" strokeWidth="1" />

                  {/* Active Spline Bend path */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#00685f"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Dynamic Pointer Dot at final coordinate */}
                  <circle
                    cx={280}
                    cy={curveY}
                    r={5}
                    fill="#00685f"
                    className="animate-ping"
                  />
                  <circle
                    cx={280}
                    cy={curveY}
                    r={3.5}
                    fill="#00685f"
                  />
                </svg>

                {/* Grid Overlay tags */}
                <span className="absolute top-2 left-6 text-[8px] font-mono text-[#3d4947]">
                  OPTIMIZATION LIMITS
                </span>
                <span className="absolute bottom-2 right-6 text-[8px] font-mono text-[#00685f] font-bold">
                  CONVERSION PT
                </span>
              </div>
            </div>

            {/* Action simulation trigger */}
            <button
              type="button"
              className="w-full bg-[#191c1e] text-white py-2 px-4 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer text-center block mt-4"
              onClick={() => alert(`Operational Matrix parameters updated: Max Surge=${maxSurge}%, Min Yield=${minYield}x, Buffer Target=${bufferRatio}%.`)}
            >
              Apply Strategy parameters
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
