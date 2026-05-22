"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import Navbar from "./components/Navbar";
import DashboardPreview from "./components/DashboardPreview";
import FeatureMatrix from "./components/FeatureMatrix";
import SimulationConsole from "./components/SimulationConsole";
import SandboxModel from "./components/SandboxModel";
import AgentLogs from "./components/AgentLogs";
import Footer from "./components/Footer";

export default function App() {
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateVideoMode = () => setShouldRenderVideo(mediaQuery.matches);

    updateVideoMode();
    mediaQuery.addEventListener("change", updateVideoMode);

    return () => {
      mediaQuery.removeEventListener("change", updateVideoMode);
    };
  }, []);

  const handleAccessTelemetry = () => {
    const previewEl = document.getElementById("features");
    if (previewEl) {
      const top = previewEl.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f2f4f6] p-3 sm:p-4 font-sans antialiased text-[#191c1e] select-none scroll-smooth">
      {/* Hero Container */}
      <div className="hero-shell relative w-full min-h-[calc(100svh-24px)] sm:min-h-[calc(100svh-32px)] md:h-[calc(100vh-32px)] overflow-hidden bg-[#f7f9fb] rounded-2xl sm:rounded-3xl border border-[#bcc9c6] shadow-xs mb-4">

        {/* Background Video with Poster Fallback */}
        {shouldRenderVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disableRemotePlayback
            webkit-playsinline="true"
            x5-playsinline="true"
            poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
            className="hero-video absolute inset-0 w-full h-full object-cover pointer-events-none"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none" />

        {/* Foreground Content Wrapper */}
        <div className="relative z-10 min-h-[calc(100svh-24px)] sm:min-h-[calc(100svh-32px)] md:h-full flex flex-col justify-between">

          {/* Header Nav */}
          <header className="w-full shrink-0">
            <Navbar />
          </header>

          {/* Centered Hero Content */}
          <main className="flex-1 flex flex-col items-center justify-start px-4 pt-8 sm:pt-12 pb-6 text-center max-w-5xl mx-auto w-full">

            {/* Core Badge */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-xs border border-[#bcc9c6]/30">
              <span className="w-2 h-2 rounded-full bg-[#00685f]" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#191c1e] tracking-tight">
                MenuMind Core Engine v2.5
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mt-4 sm:mt-5 max-w-4xl text-[#191c1e] text-center"
              style={{
                fontSize: "clamp(36px, 7vw, 70px)",
                lineHeight: 1.05,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              Shaping{" "}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#00685f",
                }}
              >
                Cafes
              </span>{" "}
              of tomorrow
            </h1>

            {/* Subtitle */}
            <p
              className="mt-3 sm:mt-5 text-[#3d4947] px-2 max-w-2xl font-medium"
              style={{
                fontSize: "clamp(13px, 3.2vw, 16px)",
                lineHeight: 1.4,
              }}
            >
              The Autonomous Agent Platform Processing Real-World Market Telemetry into
              Instant Menu Adjustments
            </p>

            {/* CTA action */}
            <div className="mt-5 sm:mt-6.5 shrink-0">
              <button
                type="button"
                onClick={handleAccessTelemetry}
                className="inline-flex items-center gap-3 bg-[#191c1e] text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5 text-[13px] sm:text-[14px] font-semibold hover:bg-neutral-800 transition-all cursor-pointer shadow-sm group"
              >
                <span>Access Telemetry</span>
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ChevronRight className="w-4 h-4 text-white" />
                </span>
              </button>
            </div>
          </main>

          {/* Interactive Operational Tray Dashboard */}
          <section id="dashboard" className="w-full shrink-0 mt-auto pt-4">
            <DashboardPreview />
          </section>

        </div>
      </div>

      {/* Expanded Sections placed cleanly below the clipped overflow-bound Hero section */}
      <FeatureMatrix />
      <SimulationConsole />
      <SandboxModel />
      <AgentLogs />
      <Footer />
    </div>
  );
}
