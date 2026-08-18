---
title: 'Story 1.1: Project Setup & Design System Foundation'
type: 'feature'
created: '2026-08-18'
status: 'done'
baseline_commit: 'NO_VCS'
review_loop_iteration: 0
context:
  - '{project-root}/COD E-commerce Growth OS — Product Requirements Document.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-cod-system-2026-08-18/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-cod-system-2026-08-18/DESIGN.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-cod-system-2026-08-18/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repository lacks the full-stack Next.js 15 App Router codebase, Supabase database client configuration, and the strict Zinc/Slate design system required to build the COD Growth OS applications.

**Approach:** Initialize a Next.js 15 + React 19 + TypeScript project with Tailwind CSS, configure the DESIGN.md matte Zinc/Slate design tokens (no AI gradients, tabular numbers, semantic colors for Profit `#10B981`, Hold `#F59E0B`, Kill `#EF4444`), build the responsive App Shell with a 240px collapsible sidebar covering all 10 PRD surfaces with global keyboard shortcuts (`g d`, `g p`, `g o`, `g f`, `g m`, `c`, `Esc`), and wire the Supabase client helpers and safe formatting utilities.

## Boundaries & Constraints

**Always:**
- Follow `DESIGN.md` color tokens (dark background `#090A0C`, surface `#111317`, border `#23272F`; light background `#F8FAFC`, surface `#FFFFFF`, border `#E2E8F0`).
- Format all financial figures and currency metrics with `font-variant-numeric: tabular-nums` in `JetBrains Mono` / `SF Mono` with 3-decimal precision (`0.000 DT`).
- Ensure safe division via `safeDivide()` returning `null` (rendered as `—`) on division by zero.
- Maintain single-operator simplicity: no in-app login wall or auth barriers.

**Ask First:**
- Adding third-party UI component libraries beyond Tailwind CSS and Lucide React icons.

**Never:**
- No decorative purple/neon AI gradients, glowing borders, or glassmorphic blur overlays that degrade text contrast.
- No `users`, `tenants`, or multi-tenant permission columns.
- No client-side exposure of Supabase service-role secret keys.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Navigation Click | Click on "Orders" in sidebar | Router transitions to `/orders` with active highlight pill | Fallback to active route indicator |
| Keyboard Shortcut | Press `g` then `p` on desktop | Immediate client navigation to `/products` | Ignored if typing in input field |
| Sidebar Toggle | Click sidebar collapse icon | Sidebar transitions to 64px icon-only rail; main content width expands smoothly | Preserves active state and tooltips |
| Currency Formatting | `formatCurrency(142.5)` | Returns string `"142.500 DT"` with tabular-nums CSS class | Fallback to `"0.000 DT"` on invalid input |
| Safe Division | `safeDivide(100, 0)` | Returns `null` | Rendered in UI as em-dash `"—"` |

</frozen-after-approval>

## Code Map

- `package.json` -- Next.js 15, React 19, TypeScript, Tailwind, Lucide React, clsx, tailwind-merge, Supabase JS dependencies
- `tsconfig.json` -- Strict TypeScript compiler options with `@/*` path aliases
- `tailwind.config.ts` -- Custom theme configuration extending colors (`profit-emerald`, `hold-amber`, `kill-crimson`, `testing-blue`, `surface`, `border`)
- `src/app/globals.css` -- CSS custom properties for dark/light theme tokens and tabular mono utilities
- `src/lib/utils.ts` -- `cn()` class merger, `formatCurrency()`, `formatPercent()`, and `safeDivide()`
- `src/lib/supabase/client.ts` -- Browser Supabase client helper
- `src/lib/supabase/server.ts` -- Server-side Supabase client helper using cookies/headers
- `src/lib/supabase/database.types.ts` -- TypeScript database interface definitions
- `src/components/layout/sidebar.tsx` -- Collapsible 240px/64px navigation bar for all 10 PRD surfaces
- `src/components/layout/app-header.tsx` -- Top bar with quick date picker, cash summary badge, and theme toggle
- `src/components/layout/keyboard-shortcuts-listener.tsx` -- Global hotkey listener for navigation (`g d`, `g p`, `g o`, etc.)
- `src/components/ui/stat-card.tsx` -- Standardized KPI card with tabular mono value and target delta
- `src/components/ui/decision-badge.tsx` -- Semantic pill badge (`SCALE`, `HOLD`, `KILL`, `TESTING`, `WINNER`)
- `src/app/layout.tsx` -- Root layout with font imports, theme wrapper, and App Shell structure
- `src/app/page.tsx` -- Dashboard & Action Center landing view
- `src/app/products/page.tsx` -- Products & unit economics placeholder
- `src/app/testing/page.tsx` -- Testing campaigns placeholder
- `src/app/creatives/page.tsx` -- Creatives library placeholder
- `src/app/orders/page.tsx` -- COD orders triage placeholder
- `src/app/finance/page.tsx` -- Cash ledger & buckets placeholder
- `src/app/analytics/page.tsx` -- Analytics trends placeholder
- `src/app/research/page.tsx` -- Research intake placeholder
- `src/app/monthly-review/page.tsx` -- Monthly review placeholder
- `src/app/settings/page.tsx` -- Configurable thresholds placeholder

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- Initialize project dependencies and scripts -- Establish foundational build substrate
- [x] `tsconfig.json` & `tailwind.config.ts` -- Configure TypeScript and Tailwind theme tokens per DESIGN.md -- Lock design tokens
- [x] `src/app/globals.css` -- Define base styles, CSS variables, and tabular-nums class -- Enforce typography rules
- [x] `src/lib/utils.ts` -- Implement `cn`, `formatCurrency`, and `safeDivide` with unit-safe behavior -- AD-6 math invariants
- [x] `src/lib/supabase/` -- Create typed Supabase client helpers for browser and server -- Data access layer
- [x] `src/components/layout/` -- Build Sidebar, AppHeader, and KeyboardShortcutsListener -- Navigation shell
- [x] `src/components/ui/` -- Build StatCard and DecisionBadge reusable primitives -- UI component primitives
- [x] `src/app/layout.tsx` & routes -- Assemble root layout and route structure for all 10 surfaces -- Route scaffolding

**Acceptance Criteria:**
- Given a browser loading the application at `/`, when the page renders, then the layout displays the collapsible 240px sidebar with links to all 10 PRD surfaces with clear visual active indicators.
- Given the application UI, when financial figures or percentages are displayed, then they render using `font-variant-numeric: tabular-nums` in `JetBrains Mono` / `SF Mono` with 3-decimal precision (`0.000 DT`).
- Given keyboard navigation on desktop, when pressing `g` followed by `d`, `p`, `o`, `f`, `m`, then the browser transitions to `/`, `/products`, `/orders`, `/finance`, `/monthly-review` respectively.
- Given the safe division utility, when dividing by zero, then `safeDivide` returns `null` rendered as `—` without throwing an exception or returning `NaN`.
- Given the codebase, when running `npm run build` or TypeScript compile check, then the build succeeds with 0 errors.

## Verification

**Commands:**
- `npm run build` -- expected: Build passes with 0 TypeScript and lint errors
