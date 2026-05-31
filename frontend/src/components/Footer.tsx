import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="dark-panel dot-matrix-surface edge-flow text-white py-16 px-6 sm:px-8 mt-12 rounded-t-3xl border-t border-[#bcc9c6]/20 relative">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        
        {/* Left Column - Logo & Descriptor */}
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-4">
            <svg
              viewBox="0 0 32 32"
              className="w-7 h-7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 16 2 Q 16 11 21 11 Q 21 16 30 16 Q 21 16 21 21 Q 16 21 16 30 Q 16 21 11 21 Q 11 16 2 16 Q 11 16 11 11 Q 16 11 16 2 Z"
                fill="#00685f"
              />
            </svg>
            <span className="font-serif font-semibold text-lg text-white tracking-tight">
              MenuMind
            </span>
          </div>
          <p className="text-xs text-[#a3b3b0] leading-relaxed mb-6 font-medium">
            Building autonomous state-space solvers that align real-time localized food & beverage margins with ambient high-frequency market realities.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#00685f] bg-[#e0f1ee]/10 px-3 py-1.5 rounded-full inline-block font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1 animate-pulse" />
            Global Grid Status: Active
          </div>
        </div>

        {/* Right Menu Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
          
          {/* Section Column 1 */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#a3b3b0] tracking-wider block mb-4">
              Explore
            </span>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <a href="#telemetry" className="text-[#a3b3b0] hover:text-[#00685f] transition-colors flex items-center gap-1">
                  <span>Capabilities</span>
                  <ArrowUpRight className="w-3 h-3 text-[#00685f]/80" />
                </a>
              </li>
              <li>
                <a href="#simulator" className="text-[#a3b3b0] hover:text-[#00685f] transition-colors flex items-center gap-1">
                  <span>Engine Trial</span>
                  <ArrowUpRight className="w-3 h-3 text-[#00685f]/80" />
                </a>
              </li>
              <li>
                <a href="#sandbox" className="text-[#a3b3b0] hover:text-[#00685f] transition-colors flex items-center gap-1">
                  <span>Sandbox Calibration</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Section Column 2 */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#a3b3b0] tracking-wider block mb-4">
              Audit Stream
            </span>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <a href="#logs" className="text-[#a3b3b0] hover:text-[#00685f] transition-colors">
                  Live Ticker Shell
                </a>
              </li>
              <li>
                <a href="#dashboard" className="text-[#a3b3b0] hover:text-[#00685f] transition-colors">
                  Operational Metrics
                </a>
              </li>
            </ul>
          </div>

          {/* Section Column 3 */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#a3b3b0] tracking-wider block mb-4">
              Platform
            </span>
            <span className="text-[11px] font-mono font-bold text-[#00685f] block uppercase mb-1">
              v2.5 Stable
            </span>
            <span className="text-[10px] text-[#a3b3b0] leading-normal font-medium block">
              Autonomous grid deployment models in 14 regional zones.
            </span>
          </div>

        </div>

      </div>

      {/* Bottom Legal, copyright and Scroll Top */}
      <div className="max-w-[1100px] mx-auto mt-16 pt-8 border-t border-[#bcc9c6]/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#a3b3b0] font-semibold">
        <span>
          © {new Date().getFullYear()} MenuMind Operations Platform. All rights reserved.
        </span>
        <button
          type="button"
          onClick={handleScrollTop}
          className="text-white hover:text-[#00685f] underline underline-offset-2 transition-colors cursor-pointer"
        >
          Scroll to Top ↑
        </button>
      </div>
    </footer>
  );
}
