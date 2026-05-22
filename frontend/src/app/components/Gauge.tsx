import React from "react";

interface GaugeProps {
  value: number;
  color?: string;
  showLabels?: boolean;
  min?: string | number;
  max?: string | number;
}

export default function Gauge({
  value,
  color = "#00685f",
  showLabels = false,
  min,
  max,
}: GaugeProps) {
  const totalTicks = 40;
  // active count = round(value/100 * 40)
  const activeTicksCount = Math.round((Math.max(0, Math.min(100, value)) / 100) * totalTicks);

  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    // Ticks span a 180° arc starting at π and sweeping to 2π
    const angle = Math.PI + (i / (totalTicks - 1)) * Math.PI;
    const r1 = 70; // radius (r-10)
    const r2 = 80; // radius r=80
    const cx = 100;
    const cy = 100;

    const x1 = cx + r1 * Math.cos(angle);
    const y1 = cy + r1 * Math.sin(angle);
    const x2 = cx + r2 * Math.cos(angle);
    const y2 = cy + r2 * Math.sin(angle);

    const isActive = i < activeTicksCount;

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? color : "#bcc9c6"}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    );
  });

  return (
    <div className="w-full max-w-[260px] mx-auto flex flex-col items-center">
      <svg
        viewBox="0 0 200 120"
        className="w-full h-auto"
        id={`gauge-svg-${value}`}
      >
        <g>{ticks}</g>
        <text
          x={100}
          y={105}
          textAnchor="middle"
          fill="#191c1e"
          style={{ fontSize: "22px", fontWeight: 600 }}
        >
          {value}%
        </text>
      </svg>
      {showLabels && (min !== undefined || max !== undefined) && (
        <div className="flex justify-between w-full px-2 text-[11px] text-[#3d4947] mt-1 font-medium">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
