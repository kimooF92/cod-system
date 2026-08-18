# Epic 1 Context: Product Research & Testing Catalog

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Establish the foundational Next.js 15 + Supabase application shell with the strict Zinc/Slate design system, then enable the operator to research new product opportunities, manage unit economics (costs, prices, packaging, delivery, return), run bounded testing campaigns with KPI benchmarks, track status history, and calculate 0–100 Product Scores.

## Stories

- Story 1.1: Project Setup & Design System Foundation
- Story 1.2: Research Items & Problem/Promise Evaluation
- Story 1.3: Product Catalog & Unit Economics Management
- Story 1.4: Product Lifecycle State Machine & Audit History
- Story 1.5: Bounded Product Testing & Performance Benchmarks
- Story 1.6: Multi-Dimensional 0–100 Product Scoring Engine

## Requirements & Constraints

- Currency is stored as `numeric(12, 3)` in PostgreSQL (Tunisian Dinar `DT` standard) and displayed in UI with `font-variant-numeric: tabular-nums` in `JetBrains Mono` / `SF Mono`.
- All division operations must use a safe division utility (`safeDivide`) returning `null` on zero denominator, rendered as `—` (no `NaN` or `Infinity`).
- Product lifecycle statuses: `IDEA` → `RESEARCH` → `READY` → `TESTING` → `HOLD` / `KILL` / `WINNER` → `SCALING` → `FATIGUED` / `ARCHIVED`.
- Manual status changes must be recorded in an append-only `product_status_history` table with timestamps and reasons.
- Product Score is a 0–100 composite score calculated deterministically from CPL, confirmation rate, delivery potential, profit per order, creative potential, and competition.

## Technical Decisions

- **Architecture:** Next.js 15+ App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, and Supabase PostgreSQL.
- **Pure Domain Core (`AD-1`):** All KPI formulas, margin calculations, and scoring algorithms reside in `src/lib/engine/` (zero DB/network dependencies).
- **Single-Operator Model (`AD-2`):** Direct database access without in-app `users` or multi-tenant tables.
- **Database Schema for Epic 1:** `app_settings`, `research_items`, `products`, `product_status_history`, `product_tests`, `product_scores`.
- **Mutations (`AD-4`):** Next.js Server Actions in `src/actions/` with Zod validation.

## UX & Interaction Patterns

- **Design System (`DESIGN.md`):** Solid matte Zinc/Slate surfaces (`#111317` dark / `#FFFFFF` light), 1px borders (`#23272F` / `#E2E8F0`), zero decorative AI gradients or glow overlays.
- **Navigation (`EXPERIENCE.md`):** 240px collapsible sidebar navigation across all 10 PRD surfaces with keyboard shortcuts (`g d`, `g p`, `g o`, `g f`, `g m`, `c`, `Esc`).
- **Research-to-Product:** 1-click conversion pre-filling product name, price, and notes without re-typing.

## Cross-Story Dependencies

- Story 1.1 sets up the Next.js 15 App Router scaffold, Tailwind config, design tokens, Supabase client, and navigation shell used by all following stories.
- Stories 1.2 & 1.3 define the product entity needed by Stories 1.4, 1.5, and 1.6.
- Stories within Epic 1 have no forward dependencies.
