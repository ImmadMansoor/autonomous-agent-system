import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#191c1e] text-white py-16 px-6 sm:px-8 mt-12 rounded-t-3xl border-t border-[#bcc9c6]/20">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-xs">
          <div className="mb-4 inline-flex rounded-full bg-white px-4 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.18)] ring-1 ring-white/15">
            <img
              src="/menumind-logo.png"
              alt="MenuMind"
              className="h-8 w-auto object-contain"
            />
          </div>
          <p className="text-xs text-[#a3b3b0] leading-relaxed mb-6 font-medium">
            MenuMind turns weather, supply, competitor, and demand signals into
            safe menu actions, stock plans, approval queues, and auditable AI
            reasoning for cafe teams.
          </p>
          <div className="inline-flex items-center gap-2 text-[10px] font-mono text-[#00685f] bg-[#e0f1ee]/10 px-3 py-1.5 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
            Global Grid Status: Active
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#a3b3b0] tracking-wider block mb-4">
              Explore
            </span>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <a
                  href="#features"
                  className="text-[#a3b3b0] hover:text-[#00685f] transition-colors flex items-center gap-1"
                >
                  <span>Capabilities</span>
                  <ArrowUpRight className="w-3 h-3 text-[#00685f]/80" />
                </a>
              </li>
              <li>
                <a
                  href="#simulator"
                  className="text-[#a3b3b0] hover:text-[#00685f] transition-colors flex items-center gap-1"
                >
                  <span>Engine Trial</span>
                  <ArrowUpRight className="w-3 h-3 text-[#00685f]/80" />
                </a>
              </li>
              <li>
                <a
                  href="#sandbox"
                  className="text-[#a3b3b0] hover:text-[#00685f] transition-colors flex items-center gap-1"
                >
                  <span>Sandbox Calibration</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#a3b3b0] tracking-wider block mb-4">
              Audit Stream
            </span>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <a
                  href="#agent-logs"
                  className="text-[#a3b3b0] hover:text-[#00685f] transition-colors"
                >
                  Live Ticker Shell
                </a>
              </li>
              <li>
                <a
                  href="#dashboard"
                  className="text-[#a3b3b0] hover:text-[#00685f] transition-colors"
                >
                  Operational Metrics
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#a3b3b0] tracking-wider block mb-4">
              Platform
            </span>
            <span className="text-[11px] font-mono font-bold text-[#00685f] block uppercase mb-1">
              v2.5 Stable
            </span>
            <span className="text-[10px] text-[#a3b3b0] leading-normal font-medium block">
              Autonomous cafe operations demo with live signals, planner tasks,
              approvals, and traceable guardrails.
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto mt-16 pt-8 border-t border-[#bcc9c6]/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#a3b3b0] font-semibold">
        <span>
          Copyright {new Date().getFullYear()} MenuMind Operations Platform.
          All rights reserved.
        </span>
        <button
          type="button"
          onClick={handleScrollTop}
          className="text-white hover:text-[#00685f] underline underline-offset-2 transition-colors cursor-pointer"
        >
          Scroll to Top
        </button>
      </div>
    </footer>
  );
}
