// Color palette
export const COLORS = {
  SURFACE: '#f7f9fb',
  SURFACE_DIM: '#d8dadc',
  SURFACE_BRIGHT: '#f7f9fb',
  SURFACE_CONTAINER_LOWEST: '#ffffff',
  SURFACE_CONTAINER_LOWest: '#ffffff',
  SURFACE_CONTAINER_LOW: '#f2f4f6',
  SURFACE_CONTAINER: '#eceef0',
  SURFACE_CONTAINER_HIGH: '#e6e8ea',
  SURFACE_CONTAINER_HIGHEST: '#e0e3e5',
  SURFACE_VARIANT: '#e0e3e5',

  ON_SURFACE: '#191c1e',
  ON_SURFACE_VARIANT: '#3d4947',
  INVERSE_SURFACE: '#2d3133',
  INVERSE_ON_SURFACE: '#eff1f3',

  OUTLINE: '#6d7a77',
  OUTLINE_VARIANT: '#bcc9c6',
  SURFACE_TINT: '#006a61',

  PRIMARY: '#00685f',
  PRIMARY_CONTAINER: '#008378',
  ON_PRIMARY: '#ffffff',
  ON_PRIMARY_CONTAINER: '#f4fffc',
  INVERSE_PRIMARY: '#6bd8cb',

  SECONDARY: '#505f76',
  SECONDARY_CONTAINER: '#d0e1fb',
  ON_SECONDARY: '#ffffff',
  ON_SECONDARY_CONTAINER: '#54647a',

  TERTIARY: '#00628d',
  TERTIARY_CONTAINER: '#007cb1',
  ON_TERTIARY: '#ffffff',
  ON_TERTIARY_CONTAINER: '#fcfcff',

  ERROR: '#ba1a1a',
  ERROR_CONTAINER: '#ffdad6',
  ON_ERROR: '#ffffff',
  ON_ERROR_CONTAINER: '#93000a',

  PRIMARY_FIXED: '#89f5e7',
  PRIMARY_FIXED_DIM: '#6bd8cb',
  ON_PRIMARY_FIXED: '#00201d',
  ON_PRIMARY_FIXED_VARIANT: '#005049',

  SECONDARY_FIXED: '#d3e4fe',
  SECONDARY_FIXED_DIM: '#b7c8e1',
  ON_SECONDARY_FIXED: '#0b1c30',
  ON_SECONDARY_FIXED_VARIANT: '#38485d',

  TERTIARY_FIXED: '#c9e6ff',
  TERTIARY_FIXED_DIM: '#89ceff',
  ON_TERTIARY_FIXED: '#001e2f',
  ON_TERTIARY_FIXED_VARIANT: '#004c6e',

  BACKGROUND: '#f7f9fb',
  ON_BACKGROUND: '#191c1e',
} as const;

// Spacing scale
export const SPACING = {
  XS: '4px',
  SM: '8px',
  MD: '16px',
  LG: '24px',
  XL: '32px',
  XXL: '48px',
  GUTTER: '20px',
} as const;

// Border radius
export const RADIUS = {
  SM: '4px',
  MD: '8px',
  LG: '12px',
  XL: '16px',
  FULL: '9999px',
} as const;

// Typography
export const TYPOGRAPHY = {
  FONT_HEADLINE: "'Plus Jakarta Sans', system-ui, sans-serif",
  FONT_BODY: "'Inter', system-ui, sans-serif",
  FONT_MONO: "'Inter', monospace",
  FONT_LABEL: "'Inter', system-ui, sans-serif",
} as const;

// Font sizes
export const FONT_SIZES = {
  LABEL_SM: '11px',
  LABEL_MD: '12px',
  HEADLINE_SM: '18px',
  HEADLINE_MD: '24px',
  HEADLINE_LG: '32px',
  BODY_SM: '14px',
  BODY_MD: '16px',
  BODY_LG: '18px',
} as const;

// Layout
export const LAYOUT = {
  SIDEBAR_WIDTH: '260px',
  NAVBAR_HEIGHT: '64px',
} as const;

// Shadows
export const SHADOWS = {
  CARD: '0px 4px 12px rgba(15, 23, 42, 0.05)',
  ELEVATED: '0px 8px 24px rgba(15, 23, 42, 0.1)',
} as const;

// Glass effect
export const GLASS = {
  BACKGROUND: 'rgba(255, 255, 255, 0.8)',
  BACKDROP_FILTER: 'blur(20px)',
  BORDER: '1px solid #E2E8F0',
} as const;

// Animation durations
export const MOTION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.35,
  SLOW: 0.5,
} as const;

// Ease curves
export const MOTION_EASE = [0.25, 0.1, 0.25, 1] as const;

// Stagger delays
export const STAGGER = {
  DEFAULT: 0.08,
  FAST: 0.04,
  DELAY_CHILDREN: 0.1,
} as const;

// Type styles for reasoning items
export const TYPE_STYLES = {
  PRICING_LOGIC: { BG: 'rgba(0, 104, 95, 0.1)', COLOR: 'var(--primary)' },
  INVENTORY: { BG: 'rgba(186, 26, 26, 0.1)', COLOR: 'var(--error)' },
  UPSELL_ENGINE: { BG: 'rgba(0, 98, 141, 0.1)', COLOR: 'var(--tertiary)' },
} as const;

// Priority colors
export const PRIORITY_COLORS = {
  HIGH: { BG: 'rgba(186, 26, 26, 0.1)', COLOR: 'var(--error)' },
  MEDIUM: { BG: 'rgba(217, 119, 6, 0.1)', COLOR: '#d97706' },
  LOW: { BG: 'rgba(0, 104, 95, 0.1)', COLOR: 'var(--primary)' },
} as const;

// Status colors for log entries
export const STATUS_COLORS = {
  ACTION: { COLOR: 'var(--tertiary)', BG: 'rgba(0, 98, 141, 0.1)' },
  ALERT: { COLOR: '#d97706', BG: 'rgba(217, 119, 6, 0.1)' },
  SUCCESS: { COLOR: 'var(--primary)', BG: 'rgba(0, 104, 95, 0.1)' },
  INFO: { COLOR: 'var(--secondary)', BG: 'rgba(80, 95, 118, 0.1)' },
} as const;

// Menu item status
export const MENU_ITEM_STATUS = {
  DYNAMIC: { LABEL: 'DYNAMIC', BG: 'var(--primary)', COLOR: 'var(--on-primary)' },
  FIXED: { LABEL: 'FIXED', BG: 'var(--surface-container-highest)', COLOR: 'var(--on-surface-variant)' },
  WASTE_RISK: { LABEL: 'Waste Risk', BG: 'var(--error)', COLOR: 'var(--on-error)' },
  AI_MANAGED: { LABEL: 'AI-MANAGED', BG: 'rgba(16, 185, 129, 0.15)', COLOR: '#059669' },
  MANUAL: { LABEL: 'MANUAL', BG: 'var(--surface-container-high)', COLOR: 'var(--on-surface-variant)' },
  AI_PENDING: { LABEL: 'AI-PENDING', BG: 'rgba(245, 158, 11, 0.15)', COLOR: '#d97706' },
} as const;

// Alert levels
export const ALERT_LEVELS = {
  CRITICAL: { LABEL: 'Critical', BG: 'var(--error-container)', COLOR: 'var(--on-error-container)' },
  OPTIMIZE: { LABEL: 'Optimize', BG: 'rgba(245, 158, 11, 0.1)', COLOR: '#d97706' },
  WARNING: { LABEL: 'Warning', BG: 'rgba(245, 158, 11, 0.1)', COLOR: '#d97706' },
} as const;
