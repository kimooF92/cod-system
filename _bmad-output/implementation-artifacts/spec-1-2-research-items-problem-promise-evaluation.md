---
title: 'Story 1.2: Research Items & Problem/Promise Evaluation'
type: 'feature'
created: '2026-08-18'
status: 'done'
baseline_commit: 'NO_VCS'
review_loop_iteration: 0
context:
  - '{project-root}/COD E-commerce Growth OS — Product Requirements Document.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-cod-system-2026-08-18/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The operator needs a dedicated space to log, evaluate, and filter product research ideas with target customer pain points, promises, competitor notes, and gross margin calculations before committing ad testing budget.

**Approach:** Build the Research module with Supabase schema migration for `research_items`, a pure gross margin calculation engine in `src/lib/engine/calculations.ts`, Zod validation schemas, Server Actions for CRUD operations, and an interactive UI on `/research` with status tabs (`ALL`, `IDEA`, `VALIDATING`, `READY_FOR_TEST`, `DISCARDED`), live margin estimation, and responsive research item cards.

## Boundaries & Constraints

**Always:**
- Calculate Gross Margin as `safeDivide(estimated_price - estimated_cost, estimated_price)` returning `null` if estimated_price is 0.
- Use `DESIGN.md` tokens (matte Zinc/Slate surfaces, 1px border, monospace tabular figures for DT and margin %).
- Research status values must strictly be `IDEA`, `VALIDATING`, `READY_FOR_TEST`, `DISCARDED`, or `CONVERTED`.
- Support graceful local state fallback when live Supabase credentials are not yet configured in `.env.local`.

**Ask First:**
- Adding external third-party scraping or API tools to research items.

**Never:**
- No multi-tenant user_id column requirements.
- No client-side math divergence; gross margin math must live in `src/lib/engine/calculations.ts`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Create Research Item | Valid payload: Name "Ergonomic Cushion", Price 65 DT, Cost 22 DT | New record saved with status `IDEA`, gross margin calculated as `66.2%` | Zod validation error displayed on missing required fields |
| Margin Zero Division | Cost 20 DT, Price 0 DT | Margin calculated as `null` rendered as `—` | No NaN, no crash |
| Filter by Status | Click tab "Ready for Test" | View filters list to show only items with status `READY_FOR_TEST` | Displays friendly empty state if 0 items match |
| Status Transition | Change status dropdown from `IDEA` to `VALIDATING` | Optimistic status badge update and Server Action update | Toast notification on failure |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00001_research_items.sql` -- PostgreSQL table schema with indexes and constraints
- `src/lib/engine/calculations.ts` -- Pure TypeScript calculation functions (`calculateGrossMargin`, `safeDivide`)
- `src/lib/validations/research.ts` -- Zod schema for research item creation and updates
- `src/actions/research.ts` -- Server Actions (`getResearchItems`, `createResearchItem`, `updateResearchStatus`, `deleteResearchItem`)
- `src/components/research/research-form-dialog.tsx` -- Modal dialog with live margin preview for creating/editing ideas
- `src/components/research/research-item-card.tsx` -- Card component with problem, promise, margin badge, and quick status switcher
- `src/components/research/research-list.tsx` -- Filterable tabbed list of research items
- `src/app/research/page.tsx` -- Main Research surface assembly

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00001_research_items.sql` -- Create migration for `research_items` table -- Database schema
- [x] `src/lib/engine/calculations.ts` -- Implement `calculateGrossMargin` with unit safety -- AD-1 calculation core
- [x] `src/lib/validations/research.ts` -- Define Zod schemas for research items -- Mutation validation
- [x] `src/actions/research.ts` -- Implement Server Actions with database and fallback persistence -- Application layer
- [x] `src/components/research/` -- Build ResearchFormDialog, ResearchItemCard, and ResearchList -- Presentation UI
- [x] `src/app/research/page.tsx` -- Assemble the complete `/research` surface with filters and stats -- Route completion
- [x] `tests/calculations.test.js` -- Add unit tests for margin calculations and edge cases -- Verification suite

**Acceptance Criteria:**
- Given the `/research` page, when the operator opens the form and enters product idea details with estimated price `80 DT` and cost `25 DT`, then the live margin preview displays `68.8%` and saving creates a new item with status `IDEA`.
- Given the research item list, when clicking on status filter tabs (`ALL`, `IDEA`, `VALIDATING`, `READY_FOR_TEST`, `DISCARDED`), then the list filters instantly without full page reload.
- Given an item on the research page, when selecting a new status from the inline dropdown, then the status updates optimistically and persists.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for margin calculations pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
