# MenuMind - frontend2 Features

## UI Components

### Layout Components

#### Sidebar
- Fixed left navigation (260px width)
- Logo with brand name "CafeAI Ops"
- Navigation items: Operations, Approvals, Audit Log, Intelligence, Inventory, AI Logs
- Settings and Support links
- Active state highlighting with primary container color

#### Navbar
- Fixed top header (64px height)
- Page title display with optional subtitle
- Search input with rounded pill style
- Action buttons (health metrics, notifications)
- User avatar with profile image
- Responsive design with backdrop blur

#### MobileNav
- Fixed bottom navigation for mobile
- Tab-style layout
- Active state highlighting

#### Toast System
- ToastProvider wraps entire app
- Toast notifications for actions (success, error, info)
- Auto-dismiss after 4 seconds
- Stacked in bottom-right corner

### Operations Dashboard Components

#### HeroStatus
- Two-column grid layout (8/4 split)
- Left: System health with AI reasoning engine status
- "System Health" label
- "AI Reasoning Engine: Active" title
- "Optimizing Live" badge with pulse animation
- Last reasoning cycle timestamp
- Data throughput progress bar
- Right: Next AI cycle preview

#### MetricsTicker
- 4-column grid layout
- Revenue Lift, Stockouts Prevented, Auto-Adjusted, Avg Ticket
- Live Signals ticker with scrolling animation
- Glass card styling for each metric

#### ActiveReasoning
- Live operations feed
- Header with "Active Reasoning" title and LIVE badge
- Types: Pricing Logic, Inventory, Upsell Engine, Demand Forecast, Staffing
- Each item shows: type badge, timestamp, title, description

#### NeedsAttention
- Blue border highlight
- "Needs Attention" header
- Approval items with type, title, description
- Action buttons (Approve, Details, Reject)

#### AISuggestion
- Tertiary colored accent
- Lightbulb icon with "AI Suggestion" label
- Suggestion text with confidence

### Approvals Components

#### ApprovalsQueue
- Header with pending count and Export button
- Clickable decision cards:
  - Signal type badge (color-coded: Pricing=primary, Inventory=error, Menu=tertiary)
  - Title
  - Confidence score badge with Zap icon
  - Recommendation panel with icon
  - Context bars (3-column grid showing progress + value)
  - Description text
  - Action buttons: Approve, Reject
- Today's Overview section (4 stat cards: Pending, Approved, Rejected, Avg Time)
- Policy Status section (warning indicators)

#### ApprovalsSidebar
- Recent Approvals list with icons and timestamps
- Policy Limits display
- Note about high-risk approvals
- Clickable AI Model Status card

#### ApprovalDetailModal
- Full-screen overlay with backdrop blur
- Signal type, title, confidence, timestamp badges
- AI Recommendation with icon
- AI Reasoning in quote style
- Context Analysis grid with colored values
- Decision details (time to decision, user)
- Related Signals tags
- Action History list
- Action ID display
- Close, Reject, Approve buttons

### Audit Log Components

#### AuditLogPage (/audit-log)
- Filter buttons (All, Approved, Rejected)
- Clickable audit entries showing:
  - Action badge (approved/rejected)
  - Signal type
  - Title
  - Details
  - User, confidence, timestamp
- Pagination controls (Previous/Next)
- Entry count indicator
- Back to Approvals link

#### AuditLogDetailModal
- Same structure as ApprovalDetailModal
- Extended fields: timeToDecision, escalated, relatedSignals, previousActions

### Shared Components

#### RippleButton
- Ripple effect on click
- Multiple variants: primary, secondary, outline, ghost
- Scale animation on tap
- Icon support with proper alignment
- FullWidth option

#### InlineLoader
- Rotating icon
- Loading state display

## Pages

### Operations Dashboard (/)
- Full dashboard with all components
- Staggered reveal animations
- Grid-based responsive layout
- Hook: useOperationsData

### Approvals Queue (/approvals)
- Two-column layout (main + sidebar)
- Full approvals workflow
- Clickable cards with modal detail view
- Approve/Reject with toast notifications
- Export to CSV functionality
- Hook: useApprovalsData

### Audit Log (/audit-log)
- Full approval history
- Filter by status
- Clickable entries with detailed modal
- Pagination
- Hook: useAuditLog

### Inventory Page (/inventory)
- AI Insight Card with glassmorphism
- Inventory Risk Panel with alerts
- Dynamic Menu Console with menu item cards
- Operational Trend Analysis chart
- Live Signals Feed
- Floating Action Button (FAB)

### Intelligence/Analytics Page (/analytics)
- System Throughput chart
- Signals Feed with signal cards
- AI Interpretation Panel
- Operational Impact metrics
- AI Recommendations
- Execute All Actions / Dismiss buttons

### AI Logs (/logs)
- Full AI reasoning history
- Search and filter functionality
- Individual log detail pages

## Animations

- **Page load**: Staggered reveal using STAGGER_CONTAINER
- **Button interactions**: Ripple effect + scale on tap
- **Cards**: Hover lift effect
- **Live indicators**: Pulse animation
- **Modal**: Fade in/scale up animation
- **Toast**: Slide in from right

## Routing

- `/` - Operations Dashboard
- `/approvals` - Approvals Queue
- `/audit-log` - Audit Log (new)
- `/analytics` - Intelligence/Analytics
- `/inventory` - Menu & Inventory
- `/logs` - AI Reasoning Logs

## Data Layer

### Mock Data Types (src/data/mockData.ts)
- SystemHealth, NextCycle, Metric, LiveSignal
- ReasoningItem, AttentionItem, AISuggestion
- ApprovalItem, RecentApproval, PolicyLimit
- MarketElasticityData
- AuditLogEntry

### Hooks (src/hooks/)
- useOperationsData - Operations dashboard data
- useApprovalsData - Approvals with filter, approve, reject, export
- useAuditLog - Audit log with pagination

## Constants Usage

All design tokens are defined in `src/lib/constants.ts`:
- COLORS, SPACING, RADIUS, TYPOGRAPHY
- FONT_SIZES, LAYOUT, SHADOWS, GLASS
- MOTION_DURATION, MOTION_EASE, STAGGER

All data types and mock data generators in `src/data/mockData.ts`