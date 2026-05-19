# Coding Practices - frontend2

## NOTE
- You must follow solid principles
- You must not mix constants, business logic and UI in a single file
- Separation of concerns is a must!!
- You must encourage reusability
- You must include proper API handling showing loaders and skeletons (do not use skeletons for form submission) while the data loads
- You must never include any hardcoded value in CSS
- You must include reveal animations for premium effect using Framer Motion
- Before writing any code you must read all the files in the context folder
- **All constants must be declared in `src/lib/constants.ts`** - no constants allowed in components or pages

## Constants File Rule (STRICT)
Every constant used in any component or page must be defined in `src/lib/constants.ts`. This includes but is not limited to:
- Colors (use CSS variables via globals.css, reference COLORS in constants)
- Spacing values (XS, SM, MD, LG, XL, XXL, GUTTER)
- Border radius values
- Font families and sizes
- Layout dimensions (sidebar, navbar)
- Animation durations and easings
- Glass effects
- Component-specific colors (priority, status, type styles)

Example:
```typescript
// WRONG - in component file
const buttonStyle = {
  padding: '8px 16px',
  background: '#00685f',
};

// CORRECT - import from constants
import { SPACING, COLORS } from '@/lib/constants';
const buttonStyle = {
  padding: `${SPACING.SM} ${SPACING.MD}`,
  background: COLORS.PRIMARY,
};
```

## TypeScript
- Use strict mode
- Prefer interfaces over types for object shapes
- Avoid `any`, use `unknown` when type is uncertain

## React/Next.js
- Use Server Components by default
- Use `"use client"` only when needed (event handlers, hooks, browser APIs)
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use Next.js App Router with proper route organization

## Forms
- To handle form validation use Zod validation
- To handle state use React Hook Form

## Icons
- Use Lucide React icons

## Charts
- Use Recharts library for all chart components
- Use BarChart for bar charts, LineChart for line charts, ComposedChart for combined charts
- Include ResponsiveContainer for responsive sizing
- Use custom tooltips and animations for premium feel

## File Organization
- One component per file
- Co-locate related files (component + tests + types)
- Use descriptive file names (PascalCase for components)
- Keep all constants in `src/lib/constants.ts`

## Naming
- Components: PascalCase
- Functions/variables: camelCase
- Constants: SCREAMING_SNAKE_CASE

## CSS Variables
- All design tokens should be defined in `src/app/globals.css`
- Reference design tokens via CSS variables (e.g., `var(--primary)`)
- Constants file references these tokens for component usage

## Component Structure
```
src/
├── app/
│   ├── page.tsx           # Route pages
│   ├── layout.tsx        # Root layout
│   └── globals.css       # CSS variables
├── components/
│   ├── layout/           # Layout components (Sidebar, Navbar, etc.)
│   │   └── index.ts
│   ├── dashboard/         # Dashboard components
│   │   └── index.ts
│   └── approvals/        # Approvals components
│       └── index.ts
└── lib/
    ├── constants.ts      # ALL CONSTANTS HERE
    └── animations.ts    # Framer Motion variants
```

## Animation Guidelines
- Use Framer Motion for all reveal animations
- Define variants in `src/lib/animations.ts`
- Use `STAGGER_CONTAINER` for lists/grids
- Use `REVEAL_UP` for single elements
- Include `whileHover` and `whileTap` for interactive elements