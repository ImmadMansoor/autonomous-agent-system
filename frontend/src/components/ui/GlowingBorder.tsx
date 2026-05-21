'use client';

import { type CSSProperties, type ReactNode } from 'react';

interface GlowingBorderProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function GlowingBorder({
  children,
  active = false,
  className = '',
  style,
}: GlowingBorderProps) {
  return (
    <div
      className={`glowing-border ${active ? 'glowing-border-active' : ''} ${className}`.trim()}
      style={style}
      data-glow-active={active ? 'true' : 'false'}
    >
      <svg
        className="glowing-border-wave"
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="signal-wave-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(137, 245, 231, 0)" />
            <stop offset="18%" stopColor="rgba(137, 245, 231, 0.78)" />
            <stop offset="46%" stopColor="rgba(56, 211, 255, 0.42)" />
            <stop offset="72%" stopColor="rgba(137, 245, 231, 0.72)" />
            <stop offset="100%" stopColor="rgba(255, 122, 47, 0.12)" />
          </linearGradient>
        </defs>
        <path
          className="signal-wave signal-wave-back"
          d="M0 156 C70 116 122 178 198 138 C272 99 322 92 404 136 C480 178 534 100 612 128 C704 162 752 72 846 112 C938 152 984 182 1082 126 C1142 92 1176 116 1200 104"
        />
        <path
          className="signal-wave signal-wave-mid"
          d="M0 132 C54 76 116 164 190 112 C262 62 322 154 402 106 C492 52 548 172 636 118 C728 62 788 92 864 138 C946 190 1016 78 1092 112 C1148 138 1180 154 1200 132"
        />
        <path
          className="signal-wave signal-wave-front"
          d="M0 168 C58 132 112 112 174 150 C248 196 300 76 382 126 C456 172 524 150 586 104 C672 40 738 196 824 134 C900 78 968 92 1038 150 C1106 206 1162 118 1200 146"
        />
      </svg>
      {children}
    </div>
  );
}
