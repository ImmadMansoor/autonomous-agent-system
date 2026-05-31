import React, { useState } from "react";
import { Menu, X, ChevronDown, ChevronRight, Activity } from "lucide-react";
import { GlowingEffect } from "./GlowingEffect";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Telemetry Feed", id: "telemetry" },
    { name: "Console Simulator", id: "simulator" },
    { name: "Parameter Sandbox", id: "sandbox" },
    { name: "Live Logs", id: "logs" },
  ];

  const handleScroll = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full flex justify-center pt-4 sm:pt-6 px-3 sm:px-4 shrink-0">
      <nav className="premium-glass edge-flow dot-matrix-surface rounded-full shadow-sm border border-white/75 pl-3 pr-3 py-2 w-full max-w-[840px] relative flex items-center">
        <GlowingEffect spread={170} glow proximity={120} borderWidth={1.1} colorFrom="rgba(0,104,95,0.34)" colorTo="rgba(255,255,255,0.7)" />
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <svg
            viewBox="0 0 32 32"
            className="w-7 h-7 sm:w-8 sm:h-8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 16 2 Q 16 11 21 11 Q 21 16 30 16 Q 21 16 21 21 Q 16 21 16 30 Q 16 21 11 21 Q 11 16 2 16 Q 11 16 11 11 Q 16 11 16 2 Z"
              fill="#00685f"
            />
          </svg>
          <span className="font-serif font-semibold text-lg text-[#191c1e] tracking-tight select-none">
            MenuMind
          </span>
        </div>

        {/* Desktop Links */}
        <div className="relative z-10 hidden md:flex items-center gap-6 text-[14px] ml-8">
          {navItems.map((item) => {
            const isTelemetry = item.id === "telemetry";
            return (
              <button
                key={item.id}
                onClick={() => handleScroll(item.id)}
                className="flex items-center gap-1 font-medium transition-colors text-[#3d4947] hover:text-[#191c1e] cursor-pointer"
              >
                {item.name}
                {isTelemetry && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#00685f] inline-block ml-0.5"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Cluster */}
        <div className="relative z-10 ml-auto flex items-center gap-2">
          {/* Activity Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#00685f] px-2.5 py-1 bg-[#e0f1ee]/80 rounded-full font-medium border border-white/60">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Telemetry Active</span>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => handleScroll("simulator")}
            className="bg-[#00685f] text-white rounded-full pl-4 pr-1.5 py-1.5 text-[13px] sm:text-[14px] font-medium flex items-center gap-2 hover:bg-[#00524a] transition-all cursor-pointer select-none shadow-[0_10px_25px_rgba(0,104,95,0.24)]"
          >
            <span>Console</span>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1.5 text-[#3d4947] hover:text-[#191c1e] focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {isOpen && (
          <div className="absolute top-full left-2 right-2 mt-2 premium-glass rounded-2xl shadow-lg border border-white/75 p-4 z-20 md:hidden flex flex-col gap-3">
            {navItems.map((item) => {
              const isTelemetry = item.id === "telemetry";
              return (
                <button
                  key={item.id}
                  onClick={() => handleScroll(item.id)}
                  className="flex items-center justify-between font-medium text-[14px] text-[#3d4947] p-2 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer text-left w-full"
                >
                  <span className="flex items-center gap-1.5">
                    {item.name}
                    {isTelemetry && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00685f]" />
                    )}
                  </span>
                </button>
              );
            })}
            <div className="h-px bg-zinc-200 my-1" />
            <div className="flex items-center gap-2 justify-between p-2">
              <span className="text-xs text-[#3d4947] font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#00685f]/20 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-[#00685f] rounded-full animate-ping" />
                </span>
                Active telemetry connection
              </span>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
