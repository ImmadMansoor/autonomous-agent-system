import React, { useState } from "react";
import { Menu, X, ChevronDown, ChevronRight, Activity } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", hasDot: true },
    { name: "Agent Logs" },
    { name: "Policy Guardrails" },
    { name: "Integrations", color: "#00628d", hasChevron: true },
  ];

  return (
    <div className="w-full flex justify-center pt-4 sm:pt-6 px-3 sm:px-4">
      <nav className="bg-white/92 backdrop-blur-xl rounded-full shadow-[0_14px_42px_rgba(18,38,44,0.10)] border border-white/70 ring-1 ring-[#bcc9c6]/70 px-3 py-2 w-full max-w-[890px] relative flex items-center gap-4">
        {/* Logo */}
        <a
          href="#dashboard"
          aria-label="MenuMind home"
          className="flex items-center shrink-0 rounded-full px-1.5 py-0.5 transition-transform hover:scale-[1.015]"
        >
          <img
            src="/menumind-logo.png"
            alt="MenuMind"
            className="h-9 w-auto sm:h-10 object-contain"
          />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center justify-center gap-1 text-[13px] lg:text-[14px] flex-1">
          {navItems.map((item) => {
            const isDashboard = item.name === "Dashboard";
            return (
              <a
                href={`#${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                key={item.name}
                className="flex min-h-10 items-center gap-1.5 rounded-full px-3 font-semibold leading-tight transition-colors text-[#3d4947] hover:bg-[#eef5f3] hover:text-[#191c1e]"
                style={item.color ? { color: item.color } : {}}
              >
                {item.name}
                {isDashboard && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#00685f] inline-block ml-0.5"
                    aria-hidden="true"
                  />
                )}
                {item.hasChevron && (
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-[#00628d] stroke-[2.5]" />
                )}
              </a>
            );
          })}
        </div>

        {/* Right Cluster */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Activity Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#00685f] px-3 py-2 bg-[#e0f1ee] rounded-full font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Telemetry Up</span>
          </div>

          {/* Action Button */}
          <button className="bg-[#00685f] text-white rounded-full pl-4 pr-1.5 py-1.5 text-[13px] sm:text-[14px] font-bold flex items-center gap-2 hover:bg-[#00524a] transition-all cursor-pointer shadow-[0_10px_22px_rgba(0,104,95,0.22)]">
            <span className="hidden sm:inline">Launch System</span>
            <span className="inline sm:hidden">Launch</span>
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
          <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-lg border border-[#bcc9c6] p-4 z-20 md:hidden flex flex-col gap-3">
            {navItems.map((item) => {
              const isDashboard = item.name === "Dashboard";
              return (
                <a
                  href={`#${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                  key={item.name}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between font-medium text-[14px] text-[#3d4947] p-2 hover:bg-neutral-50 rounded-lg transition-colors"
                  style={item.color ? { color: item.color } : {}}
                >
                  <span className="flex items-center gap-1.5">
                    {item.name}
                    {isDashboard && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00685f]" />
                    )}
                  </span>
                  {item.hasChevron && (
                    <ChevronDown className="w-4 h-4 text-[#00628d]" />
                  )}
                </a>
              );
            })}
            <div className="h-px bg-[#bcc9c6] my-1" />
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
