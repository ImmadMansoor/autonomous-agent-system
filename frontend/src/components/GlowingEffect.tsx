"use client";

import React, { useEffect, useRef, useState } from "react";

interface GlowingEffectProps {
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
  proximity?: number;
  inactiveZone?: number;
  borderWidth?: number;
  className?: string;
  colorFrom?: string;
  colorTo?: string;
}

export const GlowingEffect = ({
  spread = 40,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
  borderWidth = 1.5,
  className = "",
  colorFrom = "rgba(0, 104, 95, 0.25)",
  colorTo = "rgba(0, 98, 141, 0.25)",
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (disabled) return;

    // Check if it is a touch device with no fine pointer (saves mobile battery & lag)
    const touchMediaQuery = window.matchMedia("(pointer: coarse)");
    setIsMobileDevice(touchMediaQuery.matches);

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || touchMediaQuery.matches) return;

      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate proximity bounds
      const isWithinProximity =
        event.clientX >= rect.left - proximity &&
        event.clientX <= rect.right + proximity &&
        event.clientY >= rect.top - proximity &&
        event.clientY <= rect.bottom + proximity;

      setIsHovered(isWithinProximity);

      if (isWithinProximity) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [disabled, proximity]);

  if (disabled) return null;

  // On Mobile: Disable active tracking and use a beautiful pulsing outline fallback
  if (isMobileDevice) {
    return (
      <div
        className={`absolute inset-0 rounded-[inherit] pointer-events-none transition-all duration-500 opacity-90 ${className}`}
        style={{
          padding: `${borderWidth}px`,
          background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          animation: "slow-pulse 3s ease-in-out infinite",
        }}
      />
    );
  }

  // On Desktop: GPU-accelerated cursor following radial light glow
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 ${
        isHovered || glow ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{
        padding: `${borderWidth}px`,
        // We write coordinates straight to inline variables, keeping rendering on GPU
        // @ts-ignore
        "--mouse-x": `${mousePosition.x}px`,
        // @ts-ignore
        "--mouse-y": `${mousePosition.y}px`,
        // @ts-ignore
        "--glow-spread": `${spread}px`,
        background: `radial-gradient(var(--glow-spread) circle at var(--mouse-x) var(--mouse-y), ${colorFrom} 0%, ${colorTo} 50%, transparent 100%)`,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  );
};
