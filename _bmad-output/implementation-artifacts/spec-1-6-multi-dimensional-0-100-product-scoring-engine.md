---
title: 'Story 1.6: Multi-Dimensional 0–100 Product Scoring Engine'
type: 'feature'
created: '2026-08-19'
status: 'done'
baseline_commit: 'master'
review_loop_iteration: 0
context:
  - '{project-root}/COD E-commerce Growth OS — Product Requirements Document.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-cod-system-2026-08-18/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The operator needs an objective, single composite 0–100 Product Score (FR-12) to compare products across multiple dimensions (CPL efficiency, profit per delivered order, delivery potential, confirmation rate, creative opportunities) rather than relying on subjective intuition.

**Approach:** Build the Product Scoring engine in `src/lib/engine/product-scoring.ts` with configurable dimension weights, create the `product_scores` PostgreSQL migration, implement Server Actions to compute and retrieve score breakdowns, and build a Product Score Card & Drawer with visual progress bars for each sub-dimension on `/products` and the main Dashboard.

## Boundaries & Constraints

**Always:**
- Composite score formula: `Sum(dimension_score_i * weight_i)` normalized strictly to a `0–100` integer range.
- Default weights: CPL Efficiency 25%, Profit per Delivered Order 25%, Delivery Rate 20%, Confirmation Rate 15%, Creative Potential 15% (weights sum to 100%).
- Sub-dimension scoring rules must be deterministic with safe division protection.
- Monospace tabular numbers for scores (e.g. `84 / 100`).
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Adding machine learning / external regression algorithms for score weights.

**Never:**
- No composite scores output outside the 0–100 range (clamp between 0 and 100).
- No client-side math divergence; scoring algorithms must live in `src/lib/engine/product-scoring.ts`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| High Performing Winner | Product with CPL 3.2 DT (vs 4.0 target), Profit/Deliv 20 DT, Deliv Rate 72%, Conf Rate 80%, Creative 90 | Composite score calculated as `88 / 100` (Grade A / Excellent) | Safe normalization |
| Product with No Data Yet | New product in `READY` status without test leads | Uses unit economics projections for baseline scoring (e.g. `55 / 100` neutral baseline) | No division by zero |
| Extremely Poor Performance | CPL 12 DT (vs 4 target), Deliv Rate 30%, Net Negative Profit | Composite score clamped at low range `12 / 100` (Grade F / Kill candidate) | Does not emit negative numbers |
| Open Score Breakdown | Click score pill `88` on product row | Drawer slides in with bar charts showing points earned in each of the 5 sub-dimensions | Clear visual explanation |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00005_product_scores.sql` -- PostgreSQL schema for `product_scores` cache and dimension weights
- `src/lib/engine/product-scoring.ts` -- Pure TypeScript multi-dimensional scoring engine with customizable weights
- `src/actions/scoring.ts` -- Server Actions (`calculateProductScore`, `getProductScoreBreakdown`, `getAllProductScores`)
- `src/components/products/product-score-badge.tsx` -- Color-coded score pill (`90+` Emerald, `70-89` Blue, `50-69` Amber, `<50` Red)
- `src/components/products/product-score-drawer.tsx` -- Modal/drawer showing radar/progress bar dimension breakdown
- `src/components/products/product-table.tsx` -- Updated with Score column and breakdown drawer trigger
- `src/app/page.tsx` -- Scoreboard updated with live composite scores
- `tests/scoring.test.js` -- Unit tests for scoring engine, weight validations, and clamping

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00005_product_scores.sql` -- Create migration for `product_scores` table -- Database schema
- [x] `src/lib/engine/product-scoring.ts` -- Implement 0-100 scoring engine with 5 sub-dimensions -- AD-1 pure logic core
- [x] `src/actions/scoring.ts` -- Implement Server Actions for product score evaluation -- Application layer
- [x] `src/components/products/product-score-badge.tsx` -- Build ProductScoreBadge component -- Presentation UI
- [x] `src/components/products/product-score-drawer.tsx` -- Build ProductScoreDrawer dimension breakdown -- Presentation UI
- [x] `src/components/products/product-table.tsx` & Dashboard -- Integrate score badge and drawer into tables -- Route integration
- [x] `tests/scoring.test.js` -- Add unit tests for scoring engine -- Verification suite

**Acceptance Criteria:**
- Given a product in `/products`, when viewing the catalog table, then a composite Product Score (0–100) is displayed with a color-coded score badge.
- Given clicking on a product's score badge, then the ProductScoreDrawer opens displaying the per-dimension points for CPL Efficiency, Profit per Delivered Order, Delivery Rate, Confirmation Rate, and Creative Potential.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for product scoring pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
