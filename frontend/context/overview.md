# MenuMind - frontend2 Overview

## Introduction

frontend2 is the Operations Dashboard for MenuMind - an AI-driven cafe management system. It provides a modern, responsive interface for monitoring and managing cafe operations with real-time AI insights, approval workflows, and comprehensive audit logging.

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Styling**: CSS Variables + Inline Styles
- **State**: React Hooks (useState, useEffect, useCallback)

## Project Vision

MenuMind is an AI-powered operations system for small cafes that turns real-time external signals—such as supplier messages, weather updates, and competitor pricing—into immediate, structured business decisions. It continuously ingests unstructured data, uses an AI reasoning engine combined with business rules to assess impact, and then safely updates the restaurant’s live database. Based on these decisions, it automatically adjusts menu availability, recommends or applies price changes within controlled limits, promotes alternative items, and triggers staff or customer notifications. All changes are reflected instantly in a live dashboard and mobile app, with high-risk actions routed through a human approval step to ensure safety and control.

**Automation roadmap:** [ai-agents-plan.md](./ai-agents-plan.md) · [ai-agents-progress.md](./ai-agents-progress.md) · [ai-agents-packages.md](./ai-agents-packages.md)

The dashboard showcases agent capabilities through modern UI/UX while providing complete oversight: approve, reject, and audit every recommendation.

## Target Pages

### 1. Operations Dashboard (/)
- Hero status section showing AI reasoning engine status
- Metrics ticker with live signals
- Active reasoning feed
- Needs attention widget
- AI suggestions panel

### 2. Approvals Queue (/approvals)
- Decision cards with confidence scores
- Recommendation panels with icon
- Context indicators (3-column grid with progress bars)
- Action buttons: Approve, Reject
- Click to view full details modal
- Export to CSV functionality
- Today's Overview stats (Pending, Approved, Rejected, Avg Time)
- Policy Status warnings
- Sidebar with recent approvals, policy limits, AI status

### 3. Audit Log (/audit-log)
- Full approval/rejection history
- Filter by status (All, Approved, Rejected)
- Clickable entries with detailed modal
- Rich context (recommendation, reasoning, context, signals, history)
- Pagination controls

### 4. Menu & Inventory (/inventory)
- AI Insight Card with glassmorphism styling
- Inventory Risk Panel with critical alerts
- Dynamic Menu Console with menu item cards
- Operational Trend Analysis chart
- Live Signals Feed
- Floating Action Button (FAB)

### 5. Intelligence (/analytics)
- System Throughput chart
- Signals Feed with signal cards
- AI Interpretation Panel
- Operational Impact metrics
- AI Recommendations

### 6. AI Logs (/logs)
- Full AI reasoning history
- Search and filter functionality
- Individual log detail pages

## Navigation

- Sidebar (desktop) - fixed left navigation with 6 main items
- Bottom nav (mobile) - tab-style navigation
- Link-based routing using Next.js `Link`
- Toast notifications for action feedback

## Design System

The dashboard uses a custom design system with:
- Primary color: Teal (#00685f)
- Secondary color: Blue-gray (#505f76)
- Tertiary color: Blue (#00628d)
- Error color: Red (#ba1a1a)
- Surface colors: Light mode with gray tones
- Glass-morphism effects on cards
- Plus Jakarta Sans for headings
- Inter for body text

## File Structure

```
frontend2/
├── context/              # This folder
│   ├── cod practices.md  # Coding guidelines
│   ├── overview.md       # This file
│   ├── features.md       # Feature documentation
│   └── progress.md       # Development progress
├── src/
│   ├── app/
│   │   ├── page.tsx           # Operations dashboard
│   │   ├── approvals/
│   │   │   └── page.tsx        # Approvals page
│   │   ├── audit-log/
│   │   │   └── page.tsx       # Audit log page
│   │   ├── inventory/
│   │   │   └── page.tsx       # Inventory page
│   │   ├── analytics/
│   │   │   └── page.tsx       # Intelligence page
│   │   ├── logs/
│   │   │   ├── page.tsx       # AI Logs list
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Log detail
│   │   ├── layout.tsx         # Root layout with ToastProvider
│   │   └── globals.css        # CSS variables
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── RippleButton.tsx
│   │   │   ├── InlineLoader.tsx
│   │   │   ├── Toast.tsx      # Toast notification system
│   │   │   └── index.ts
│   │   ├── dashboard/
│   │   │   └── (HeroStatus, MetricsTicker, etc.)
│   │   ├── approvals/
│   │   │   ├── ApprovalsQueue.tsx
│   │   │   ├── ApprovalsSidebar.tsx
│   │   │   ├── ApprovalDetailModal.tsx
│   │   │   └── index.ts
│   │   └── inventory/
│   │       └── (Inventory components)
│   ├── hooks/
│   │   ├── useOperationsData.ts
│   │   ├── useApprovalsData.ts
│   │   ├── useAuditLog.ts
│   │   └── index.ts
│   ├── data/
│   │   ├── mockData.ts   # Types + mock data generators
│   │   └── index.ts
│   └── lib/
│       ├── constants.ts  # ALL CONSTANTS
│       └── animations.ts # Framer Motion variants
├── package.json
├── tsconfig.json
└── next.config.js
```

## Key Features

- **Clickable Cards**: All approval and audit log entries open detailed modals
- **Toast Notifications**: Feedback for all actions (approve, reject, export)
- **Color Coding**: Signal types have distinct colors (Pricing/Inventory/Menu)
- **Pagination**: Audit log supports page navigation
- **Export**: Download approvals as CSV
- **Filtering**: Filter audit log by approval status

## Related Documentation

- [Features](./features.md) - Detailed feature breakdown
- [Progress](./progress.md) - Development progress tracking
- [Cod Practices](./cod practices.md) - Coding guidelines