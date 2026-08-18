---
title: 'Story 1.5: Bounded Product Testing & Performance Benchmarks'
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

**Problem:** The operator needs bounded testing containers with explicit budget caps, lead targets, and benchmark KPIs (FR-9, FR-10) to test new products objectively without letting unproven ad spend run unbounded.

**Approach:** Build the Testing Campaigns module with a Supabase PostgreSQL migration for `product_tests`, a pure benchmark evaluation engine in `src/lib/engine/test-benchmarks.ts`, Zod validation schemas, Server Actions for test lifecycle management, and a rich testing cockpit on `/testing` with target vs actual delta pills, budget utilization meters, and profit-per-lead calculations.

## Boundaries & Constraints

**Always:**
- Bounded testing rule: Every test must have an explicit budget cap, target leads, target CPL, and expected delivery rate.
- Benchmark comparisons must calculate exact percentage or absolute deltas (e.g. Actual CPL vs Target CPL).
- Profit per lead formula: `safeDivide(netProfit, totalLeads)`.
- Currency in `DT` (3 decimals) with monospace tabular numbers.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Adding direct automated integration with Meta Marketing API for budget adjustment.

**Never:**
- No unbounded tests allowed without a designated budget limit.
- No client-side math divergence; benchmark formulas must live in `src/lib/engine/test-benchmarks.ts`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Create Bounded Test | Product "Phone Mount", Budget 120 DT, Target Leads 30, Target CPL 4.0 DT, Exp Deliv 70%, Planned Creatives 3 | Test created in `RUNNING` status with benchmark targets recorded | Zod validation error displayed on missing product or 0 budget |
| Compare CPL Benchmark | Target CPL 4.0 DT, Actual CPL 3.2 DT (Spend 80 DT, 25 Leads) | Delta shown as `-0.800 DT (20% better than target)` with green highlight pill | Handled safely if 0 leads |
| Calculate Profit per Lead | Net Profit 185.0 DT, 25 Leads | Profit per lead calculated as `7.400 DT/lead` | Returns `null` (`—`) if leads are 0 |
| Complete Test | Operator clicks "Complete Test" | Status transitions to `COMPLETED` and end_date is recorded | Toast confirmation |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00004_product_tests.sql` -- PostgreSQL table schema for `product_tests`
- `src/lib/engine/test-benchmarks.ts` -- Pure TypeScript benchmark delta calculation engine
- `src/lib/validations/test.ts` -- Zod schemas for test creation and status updates
- `src/actions/tests.ts` -- Server Actions (`getProductTests`, `createProductTest`, `updateTestStatus`, `deleteProductTest`)
- `src/components/testing/test-form-dialog.tsx` -- Modal for launching bounded tests with product selector and benchmarks
- `src/components/testing/test-card.tsx` -- High-density test card with budget progress bar, benchmark comparison pills, and profit-per-lead metric
- `src/components/testing/test-list.tsx` -- Tabbed list (`ALL`, `RUNNING`, `COMPLETED`, `CANCELLED`) with search and KPI overview
- `src/app/testing/page.tsx` -- Server page for `/testing`
- `tests/test-benchmarks.test.js` -- Unit tests for benchmark evaluations and edge cases

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00004_product_tests.sql` -- Create migration for `product_tests` table -- Database schema
- [x] `src/lib/engine/test-benchmarks.ts` -- Implement benchmark delta and profit-per-lead formulas -- AD-1 logic core
- [x] `src/lib/validations/test.ts` -- Define Zod schemas for testing campaigns -- Mutation validation
- [x] `src/actions/tests.ts` -- Implement Server Actions with database and fallback persistence -- Application layer
- [x] `src/components/testing/` -- Build TestFormDialog, TestCard, and TestList components -- Presentation UI
- [x] `src/app/testing/page.tsx` -- Assemble the complete `/testing` surface with stats and filters -- Route completion
- [x] `tests/test-benchmarks.test.js` -- Add unit tests for benchmark comparisons and edge cases -- Verification suite

**Acceptance Criteria:**
- Given the `/testing` page, when the operator creates a bounded test for a product with budget `100 DT`, target leads `25`, target CPL `4.0 DT`, and expected delivery rate `65%`, then the test is saved with status `RUNNING`.
- Given an active test, when viewing the test card, then it displays actual ad spend vs budget cap, actual CPL vs target CPL, confirmed orders, delivered orders, delivery rate, net profit, profit per delivered order, and profit per lead.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for test benchmarks pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
