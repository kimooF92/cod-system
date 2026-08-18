---
title: 'Story 2.4: Ad Performance Tracking & Meta Ads CSV Import'
type: 'feature'
created: '2026-08-19'
status: 'done'
baseline_commit: 'master'
review_loop_iteration: 0
context:
  - '{project-root}/COD E-commerce Growth OS — Product Requirements Document.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-cod-system-2026-08-18/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Operators need to track daily ad spend, CTR, CPC, and CPL without manual mathematical errors or tedious single-entry logging, supporting both manual daily input and 1-click batch import of standard Meta Ads CSV export reports (FR-19, FR-20, FR-21).

**Approach:** Build the Ad Performance Tracking engine with a PostgreSQL migration for `ad_performance_daily`, pure metric calculation functions in `src/lib/engine/ad-metrics.ts`, a robust Meta Ads CSV parser and column auto-mapper in `src/lib/engine/csv-parser.ts`, Server Actions, and an interactive analytics table with manual entry dialog and CSV import wizard on `/analytics` and `/creatives`.

## Boundaries & Constraints

**Always:**
- Pure math core (`AD-1`): CTR (`clicks / impressions`), CPC (`spend / clicks`), CPL (`spend / leads`) must use `safeDivide` in `src/lib/engine/ad-metrics.ts`.
- Supported CSV formats: Standard Meta Ads Manager export (English & French headers: `Campaign Name` / `Nom de la campagne`, `Ad Set Name` / `Nom de l'ensemble de publicités`, `Ad Name` / `Nom de la publicité`, `Amount Spent (TND/USD)` / `Montant dépensé`, `Impressions`, `Link Clicks` / `Clics sur un lien`, `Results` / `Résultats`).
- Currency in `DT` (3 decimals) with monospace tabular numbers.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Automated background sync via Meta Graph API cron.

**Never:**
- No division by zero on 0 clicks, 0 impressions, or 0 leads.
- No silent failures during CSV parsing; parse errors must surface clearly to the operator.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Manual Daily Log | Ad `CR-001`, Date `2026-08-18`, Spend `45.000 DT`, Impressions `3,200`, Clicks `96`, Leads `14` | Saved and computed: CTR `3.0%`, CPC `0.469 DT`, CPL `3.214 DT` | Zod validation on negative spend or invalid date |
| Meta Ads CSV Import | Upload standard Meta Ads CSV file | Auto-maps columns, previews rows, matches existing ads or flags new ads, and inserts batch records | Shows clear error if CSV is empty or missing spend column |
| Zero Leads / Clicks | Ad spent `15.000 DT`, Impressions `800`, Clicks `0`, Leads `0` | CTR `0.0%`, CPC `—`, CPL `—` (handles safely without `NaN` or crash) | Handled safely by `safeDivide` |
| Filter by Date Range | Select "Last 7 Days" or specific Campaign | Aggregates total spend, total leads, blended CTR, blended CPC, and blended CPL | Clean aggregate summary |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00009_ad_performance.sql` -- Schema for `ad_performance_daily` table
- `src/lib/engine/ad-metrics.ts` -- Pure TypeScript ad metrics calculation engine (CTR, CPC, CPL, aggregates)
- `src/lib/engine/csv-parser.ts` -- Meta Ads CSV parser with header auto-mapping
- `src/lib/validations/ad-performance.ts` -- Zod schemas for daily ad performance records
- `src/actions/ad-performance.ts` -- Server Actions (`getAdPerformanceRecords`, `createAdPerformanceRecord`, `batchImportAdPerformance`)
- `src/components/analytics/ad-performance-table.tsx` -- High-density tabular view with daily metrics and aggregates
- `src/components/analytics/ad-performance-manual-dialog.tsx` -- Modal for manual daily ad spend entry
- `src/components/analytics/meta-csv-import-dialog.tsx` -- Modal wizard for CSV drag-and-drop, preview, and batch import
- `src/app/analytics/page.tsx` -- Complete `/analytics` surface
- `tests/ad-performance.test.js` -- Unit tests for ad calculations and CSV parser

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00009_ad_performance.sql` -- Create migration for `ad_performance_daily` table -- Database schema
- [x] `src/lib/engine/ad-metrics.ts` -- Implement pure calculation functions for CTR, CPC, CPL, and aggregates -- AD-1 logic core
- [x] `src/lib/engine/csv-parser.ts` -- Implement Meta Ads CSV parser with French/English header support -- Utility engine
- [x] `src/lib/validations/ad-performance.ts` -- Define Zod schemas for ad performance entries -- Mutation validation
- [x] `src/actions/ad-performance.ts` -- Implement Server Actions for ad performance tracking and CSV import -- Application layer
- [x] `src/components/analytics/` -- Build AdPerformanceTable, AdPerformanceManualDialog, and MetaCsvImportDialog -- Presentation UI
- [x] `src/app/analytics/page.tsx` -- Assemble complete `/analytics` surface -- Route completion
- [x] `tests/ad-performance.test.js` -- Add unit tests for ad calculations and CSV parsing -- Verification suite

**Acceptance Criteria:**
- Given the `/analytics` page, when the operator views the Ad Performance table, then daily records are displayed with spend, impressions, clicks, CTR %, CPC, leads, and CPL.
- Given a Meta Ads CSV export, when the operator uploads it via the CSV Import Dialog, then rows are parsed, previewed, and imported into the database.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for ad performance metrics and CSV parser pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
