import React, { useState } from "react";
import { TrendingUp, TrendingDown, ChevronDown, X } from "lucide-react";
import Gauge from "./Gauge.tsx";

export default function DashboardPreview() {
  // --- Card 1 State ---
  const [activeTabCard1, setActiveTabCard1] = useState<"automated" | "manual">(
    "automated"
  );
  const [gaugeValue1, setGaugeValue1] = useState(92);

  // --- Card 2 State ---
  const [zone, setZone] = useState("G-13 Sector Branch");
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const zonesList = [
    "G-13 Sector Branch",
    "F-11 Central Annex",
    "H-9 Perimeter Grid",
    "S-2 Core Processing",
  ];

  const [ruleMatrix, setRuleMatrix] = useState("Deterministic Resilience");
  const [isRuleMatrixOpen, setIsRuleMatrixOpen] = useState(false);
  const rulesList = [
    "Deterministic Resilience",
    "Stochastic Fallback Alpha",
    "Heuristic Cascade Fail-safe",
    "Manual Override Required",
  ];

  const [surgeTolerance, setSurgeTolerance] = useState<number>(15);
  const [bufferThreshold, setBufferThreshold] = useState<number>(100);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleResetDefaults = (e: React.MouseEvent) => {
    e.preventDefault();
    setZone("G-13 Sector Branch");
    setRuleMatrix("Deterministic Resilience");
    setSurgeTolerance(15);
    setBufferThreshold(100);
    setSaveSuccess(false);
  };

  const handleSavePolicy = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  // --- Card 3 State ---
  const [activeTabCard3, setActiveTabCard3] = useState<"guardrails" | "queue">(
    "guardrails"
  );
  const [gaugeValue3, setGaugeValue3] = useState(98);

  return (
    <div className="px-3 sm:px-4 w-full">
      <div className="edge-glow-panel bg-[#f2f4f6]/95 border border-[#bcc9c6] rounded-t-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto shadow-sm">

        {/* Terminal/Tray Header to enrich realism (no fake logs, just standard layout metadata) */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-[#bcc9c6]/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]" />
            <span className="dot-matrix-label text-[11px] text-[#3d4947] tracking-wider uppercase font-semibold">
              Platform Status: Operational
            </span>
          </div>
          <span className="dot-matrix-label text-[11px] text-[#00628d] font-semibold bg-blue-50 px-2 py-0.5 rounded">
            v2.5 // Core
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Card 1 — Operational Throughput */}
          <div className="bg-white rounded-2xl p-5 border border-[#bcc9c6]/40 shadow-xs flex flex-col justify-between min-h-[380px]">
            <div>
              {/* Header */}
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-[13px] font-semibold text-[#00685f]">
                  Agent Runs
                </span>
                <span className="text-[11px] font-medium text-[#3d4947] uppercase tracking-wider">
                  This Month
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 mb-1">
                <span className="dot-matrix-number text-[28px] font-bold text-[#191c1e] leading-none">
                  4,250
                </span>
                <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  +1,120 (35.8%)
                </span>
              </div>
              <p className="text-[11px] text-[#3d4947] mb-4">
                Compared to yesterday
              </p>

              {/* Gauge label */}
              <div className="text-center mb-1">
                <span className="text-xs font-semibold text-[#191c1e] uppercase tracking-wider">
                  Menu Optimization Index
                </span>
              </div>

              {/* Interactive Gauge */}
              <div className="my-2 cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setGaugeValue1(prev => prev === 92 ? 84 : 92)}>
                <Gauge
                  value={gaugeValue1}
                  color="#00685f"
                  showLabels={true}
                  min="3.5K"
                  max="5.0K"
                />
              </div>
            </div>

            {/* Bottom Toggle Pill */}
            <div className="bg-neutral-100 rounded-full p-1 flex mt-4 border border-[#bcc9c6]/20">
              <button
                type="button"
                onClick={() => setActiveTabCard1("automated")}
                className={`flex-1 text-center py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeTabCard1 === "automated"
                    ? "bg-white text-[#191c1e] shadow-xs"
                    : "text-[#3d4947] hover:text-[#191c1e]"
                }`}
              >
                Automated Updates
              </button>
              <button
                type="button"
                onClick={() => setActiveTabCard1("manual")}
                className={`flex-1 text-center py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeTabCard1 === "manual"
                    ? "bg-white text-[#191c1e] shadow-xs"
                    : "text-[#3d4947] hover:text-[#191c1e]"
                }`}
              >
                Manual Bypasses
              </button>
            </div>
          </div>

          {/* Card 2 — Guardrail & Policy Form */}
          <div className="bg-white rounded-2xl p-5 border border-[#bcc9c6]/40 shadow-xs flex flex-col gap-3 min-h-[380px] relative">

            {/* Form Fields Container */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Dropdown 1: Operational Zone Location */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-[#3d4947] uppercase tracking-wider mb-1">
                  Operational Zone Location
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsZoneOpen(!isZoneOpen);
                    setIsRuleMatrixOpen(false);
                  }}
                  className="w-full text-left bg-white border border-[#bcc9c6] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#191c1e] flex justify-between items-center hover:bg-neutral-50 transition-colors"
                >
                  <span>{zone}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#3d4947] stroke-[2.5]" />
                </button>
                {isZoneOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#bcc9c6] rounded-lg shadow-lg z-35 overflow-hidden">
                    {zonesList.map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => {
                          setZone(z);
                          setIsZoneOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#191c1e] hover:bg-emerald-50/50 hover:text-[#00685f] transition-colors font-medium border-b border-neutral-100 last:border-b-0"
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 2: Fallback Rule Matrix */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-[#3d4947] uppercase tracking-wider mb-1">
                  Fallback Rule Matrix
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsRuleMatrixOpen(!isRuleMatrixOpen);
                    setIsZoneOpen(false);
                  }}
                  className="w-full text-left bg-white border border-[#bcc9c6] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#191c1e] flex justify-between items-center hover:bg-neutral-50 transition-colors"
                >
                  <span>{ruleMatrix}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#3d4947] stroke-[2.5]" />
                </button>
                {isRuleMatrixOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#bcc9c6] rounded-lg shadow-lg z-35 overflow-hidden">
                    {rulesList.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRuleMatrix(r);
                          setIsRuleMatrixOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#191c1e] hover:bg-teal-50/50 hover:text-[#00685f] transition-colors font-medium border-b border-neutral-100 last:border-b-0"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input 1: Surge tolerance */}
              <div>
                <label className="block text-[11px] font-semibold text-[#3d4947] uppercase tracking-wider mb-1">
                  Max Surge Price Tolerance (%)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-[#3d4947] font-semibold">
                    %
                  </span>
                  <input
                    type="number"
                    value={surgeTolerance}
                    onChange={(e) => setSurgeTolerance(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="w-full bg-white border border-[#bcc9c6] rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold text-[#191c1e] focus:outline-none focus:border-[#00685f] transition-colors"
                  />
                </div>
              </div>

              {/* Input 2: Buffer Stock */}
              <div>
                <label className="block text-[11px] font-semibold text-[#3d4947] uppercase tracking-wider mb-1">
                  Buffer Stock Alert Threshold (Units)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-[#3d4947] font-semibold">
                    QTY
                  </span>
                  <input
                    type="number"
                    value={bufferThreshold}
                    onChange={(e) => setBufferThreshold(Number(e.target.value))}
                    min={0}
                    className="w-full bg-white border border-[#bcc9c6] rounded-lg pl-12 pr-3 py-1.5 text-xs font-semibold text-[#191c1e] focus:outline-none focus:border-[#00685f] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Footer with buttons */}
            <div className="flex items-center gap-3 mt-4 border-t border-[#bcc9c6]/30 pt-3">
              <button
                type="button"
                onClick={handleSavePolicy}
                className="bg-[#00685f] text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-[#00524a] transition-all cursor-pointer shadow-xs"
              >
                {saveSuccess ? "Saved ✓" : "Save Policy"}
              </button>

              <button
                onClick={handleResetDefaults}
                className="text-[#3d4947] hover:text-[#191c1e] text-xs font-semibold underline underline-offset-2 transition-colors cursor-pointer"
              >
                Reset Default
              </button>

              <button
                type="button"
                onClick={() => {
                  setSurgeTolerance(15);
                  setBufferThreshold(100);
                }}
                className="ml-auto p-1 text-[#3d4947] hover:text-[#ba1a1a] transition-colors hover:bg-neutral-50 rounded"
                title="Clear values"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3 — Crisis Intelligence Indicators */}
          <div className="bg-white rounded-2xl p-5 border border-[#bcc9c6]/40 shadow-xs flex flex-col justify-between min-h-[380px]">
            <div>
              {/* Header */}
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-[13px] font-semibold text-[#ba1a1a]">
                  Crisis Mitigations
                </span>
                <span className="text-[11px] font-medium text-[#3d4947] uppercase tracking-wider">
                  Today
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 mb-1">
                <span className="dot-matrix-number text-[28px] font-bold text-[#191c1e] leading-none">
                  0
                </span>
                <span className="inline-flex items-center gap-0.5 bg-neutral-100 text-[#505f76] rounded-full px-2 py-0.5 text-[11px] font-semibold border border-neutral-200">
                  <TrendingDown className="w-3 h-3" />
                  0 active anomalies
                </span>
              </div>
              <p className="text-[11px] text-[#3d4947] mb-4">
                Compared to last week
              </p>

              {/* Gauge Label */}
              <div className="text-center mb-1">
                <span className="text-xs font-semibold text-[#191c1e] uppercase tracking-wider">
                  System Resilience Check
                </span>
              </div>

              {/* Informational Gauge (no labels) */}
              <div className="my-2 cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setGaugeValue3(prev => prev === 98 ? 100 : 98)}>
                <Gauge
                  value={gaugeValue3}
                  color="#505f76"
                  showLabels={false}
                />
              </div>
            </div>

            {/* Bottom Toggle Pill */}
            <div className="bg-neutral-100 rounded-full p-1 flex mt-4 border border-[#bcc9c6]/20">
              <button
                type="button"
                onClick={() => setActiveTabCard3("guardrails")}
                className={`flex-1 text-center py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeTabCard3 === "guardrails"
                    ? "bg-white text-[#191c1e] shadow-xs"
                    : "text-[#3d4947] hover:text-[#191c1e]"
                }`}
              >
                Active Guardrails
              </button>
              <button
                type="button"
                onClick={() => setActiveTabCard3("queue")}
                className={`flex-1 text-center py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeTabCard3 === "queue"
                    ? "bg-white text-[#191c1e] shadow-xs"
                    : "text-[#3d4947] hover:text-[#191c1e]"
                }`}
              >
                Bypass Queue
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
