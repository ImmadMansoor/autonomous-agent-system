// Color palette
// Color palette
export const COLORS = {
  SURFACE: 'var(--surface)',
  SURFACE_DIM: 'var(--surface-dim)',
  SURFACE_BRIGHT: 'var(--surface-bright)',
  SURFACE_CONTAINER_LOWEST: 'var(--surface-container-lowest)',
  SURFACE_CONTAINER_LOWest: 'var(--surface-container-lowest)',
  SURFACE_CONTAINER_LOW: 'var(--surface-container-low)',
  SURFACE_CONTAINER: 'var(--surface-container)',
  SURFACE_CONTAINER_HIGH: 'var(--surface-container-high)',
  SURFACE_CONTAINER_HIGHEST: 'var(--surface-container-highest)',
  SURFACE_VARIANT: 'var(--surface-variant)',

  ON_SURFACE: 'var(--on-surface)',
  ON_SURFACE_VARIANT: 'var(--on-surface-variant)',
  INVERSE_SURFACE: 'var(--inverse-surface)',
  INVERSE_ON_SURFACE: 'var(--inverse-on-surface)',

  OUTLINE: 'var(--outline)',
  OUTLINE_VARIANT: 'var(--outline-variant)',
  SURFACE_TINT: 'var(--surface-tint)',

  PRIMARY: 'var(--primary)',
  PRIMARY_CONTAINER: 'var(--primary-container)',
  ON_PRIMARY: 'var(--on-primary)',
  ON_PRIMARY_CONTAINER: 'var(--on-primary-container)',
  INVERSE_PRIMARY: 'var(--inverse-primary)',

  SECONDARY: 'var(--secondary)',
  SECONDARY_CONTAINER: 'var(--secondary-container)',
  ON_SECONDARY: 'var(--on-secondary)',
  ON_SECONDARY_CONTAINER: 'var(--on-secondary-container)',

  TERTIARY: 'var(--tertiary)',
  TERTIARY_CONTAINER: 'var(--tertiary-container)',
  ON_TERTIARY: 'var(--on-tertiary)',
  ON_TERTIARY_CONTAINER: 'var(--on-tertiary-container)',

  ERROR: 'var(--error)',
  ERROR_CONTAINER: 'var(--error-container)',
  ON_ERROR: 'var(--on-error)',
  ON_ERROR_CONTAINER: 'var(--on-error-container)',

  PRIMARY_FIXED: 'var(--primary-container)',
  PRIMARY_FIXED_DIM: 'var(--primary-container)',
  ON_PRIMARY_FIXED: 'var(--on-primary-container)',
  ON_PRIMARY_FIXED_VARIANT: 'var(--on-primary-container)',

  SECONDARY_FIXED: 'var(--secondary-container)',
  SECONDARY_FIXED_DIM: 'var(--secondary-container)',
  ON_SECONDARY_FIXED: 'var(--on-secondary-container)',
  ON_SECONDARY_FIXED_VARIANT: 'var(--on-secondary-container)',

  TERTIARY_FIXED: 'var(--tertiary-container)',
  TERTIARY_FIXED_DIM: 'var(--tertiary-container)',
  ON_TERTIARY_FIXED: 'var(--on-tertiary-container)',
  ON_TERTIARY_FIXED_VARIANT: 'var(--on-tertiary-container)',

  BACKGROUND: 'var(--background)',
  ON_BACKGROUND: 'var(--on-background)',
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
  SM: 'var(--radius-sm)',
  MD: 'var(--radius-md)',
  LG: 'var(--radius-lg)',
  XL: 'var(--radius-xl)',
  FULL: 'var(--radius-full)',
} as const;

// Typography
export const TYPOGRAPHY = {
  FONT_HEADLINE: "var(--font-headline), system-ui, sans-serif",
  FONT_BODY: "var(--font-body), system-ui, sans-serif",
  FONT_MONO: "var(--font-mono), monospace",
  FONT_LABEL: "var(--font-label), monospace",
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
  CARD: 'var(--shadow-card)',
  ELEVATED: 'var(--shadow-elevated)',
} as const;

// Glass effect
export const GLASS = {
  BACKGROUND: 'var(--surface)',
  BACKDROP_FILTER: 'none',
  BORDER: '1px solid var(--outline-variant)',
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
