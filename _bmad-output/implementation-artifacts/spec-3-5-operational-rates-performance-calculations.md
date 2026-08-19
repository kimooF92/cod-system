---
title: 'Story 3.5: Operational Rates & Performance Calculations'
type: 'feature'
created: '2026-08-19'
status: 'done'
baseline_commit: '3785ab41d625dcdccb1cc154984946cb9d2513a4'
review_loop_iteration: 0
context:
  - '{project-root}/COD E-commerce Growth OS — Product Requirements Document.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-cod-system-2026-08-18/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Operators cannot make informed scaling and inventory decisions without live visibility into actual Confirmation Rate, Delivery Rate, Return Rate, Delivered Revenue, and Courier Performance breakdowns (FR-30).

**Approach:** Build the pure operational calculation engine (`src/lib/engine/operational-rates.ts`) and interactive operational metrics bar (`src/components/orders/operational-rates-bar.tsx`), calculating aggregate and per-product / per-courier confirmation rates, delivery rates, return rates, and delivered cash revenue, with safe division protection (`safeDivide`), tabular monospace formatting, and performance threshold color coding.

## Boundaries & Constraints

**Always:**
- Pure logic engine (`AD-1`): Zero DB or network dependencies in `src/lib/engine/operational-rates.ts`.
- Safe math (`AD-6`): Division by zero returns `null` rendered as `—` (em-dash), never `NaN` or `Infinity`.
- Formulas:
  - `Confirmation Rate` = `Confirmed Orders / Total Intakes`
  - `Delivery Rate` = `Delivered Orders / Dispatched Orders` (or `Delivered / Confirmed Orders` if dispatched is 0)
  - `Return Rate` = `Returned Orders / Dispatched Orders`
  - `Delivered Revenue` = `sum(total_amount of DELIVERED orders)`
  - `Return Loss` = `sum(return_fee of RETURNED orders)`
- Monospace figures with tabular numbers (`tabular-nums`) and Tunisian Dinar formatting (3 decimals).
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Automated background SMS/Webhook alerting when delivery rate drops below critical thresholds.

**Never:**
- No mutating order state or database rows during rate calculations.
- No client-side floating point rounding bugs (use normalized decimal arithmetic).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Zero Orders | Empty orders list `[]` | All rates return `null`, rendered as `—`, revenue = `0.000 DT` | Safe zero fallback |
| High Performer Orders | 100 orders: 85 Confirmed, 80 Dispatched, 72 Delivered, 8 Returned | Confirmation Rate: `85.0%`, Delivery Rate: `90.0%`, Return Rate: `10.0%` | Accurate calculation |
| Zero Dispatches | 10 Confirmed orders, 0 Dispatched | Confirmation Rate: `100%`, Delivery Rate: `0.0%` / `null`, Return Rate: `null` | `safeDivide` returns `null` |
| Product Breakdown | Orders across 3 different products | Returns array of product performance objects with per-product metrics | Grouped atomically |
| Courier Breakdown | Orders dispatched across Aramex and First Delivery | Returns comparative delivery rate and return rate per courier | Handles unassigned couriers |

</frozen-after-approval>

## Code Map

- `src/lib/engine/operational-rates.ts` -- Pure calculation core for confirmation rate, delivery rate, return rate, delivered revenue, and breakdowns
- `src/components/orders/operational-rates-bar.tsx` -- Live KPI header & breakdown modal displaying operational metrics
- `src/components/orders/order-triage-table.tsx` -- Embed operational rates bar above triage cockpit
- `src/actions/orders.ts` -- Export operational rates getter helper
- `tests/operational-rates.test.js` -- Unit tests verifying formulas, edge cases, zero divisions, and grouping logic

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/engine/operational-rates.ts` -- Implement `calculateOperationalRates`, `calculateProductOperationalRates`, and `calculateCourierPerformance` -- Core pure math
- [x] `src/components/orders/operational-rates-bar.tsx` -- Create operational rate summary widget with courier/product drilldown -- Operator UI
- [x] `src/components/orders/order-triage-table.tsx` -- Integrate OperationalRatesBar at top of orders dashboard -- User surface
- [x] `tests/operational-rates.test.js` -- Add complete test suite covering zero-division, rate calculations, and groupings -- Automated validation

**Acceptance Criteria:**
- Given order records across statuses
- When operational metrics are computed
- Then Confirmation Rate = `Confirmed / Total`, Delivery Rate = `Delivered / Dispatched`, Return Rate = `Returned / Dispatched`
- And Delivered Revenue accurately sums delivered order totals
- And zero orders or 0 denominator cases display `—` safely without crashing.

## Design Notes

Performance color benchmarks:
- Delivery Rate: >= 75% Emerald (Healthy), 60-74% Amber (Caution), < 60% Crimson (Action Required)
- Confirmation Rate: >= 80% Emerald, 65-79% Amber, < 65% Crimson
- Return Rate: <= 12% Emerald, 13-20% Amber, > 20% Crimson

## Verification

**Commands:**
- `node tests/operational-rates.test.js` -- expected: All rate calculation unit tests pass
- `npm run build` -- expected: Build passes with zero errors

**Manual checks (if no CLI):**
- Inspect `/orders` page to verify the Operational Rates bar displays live Confirmation Rate, Delivery Rate, Return Rate, Delivered Revenue, and courier breakdown.

## Suggested Review Order

**Calculation Engine**

- Pure operational rates calculation logic and groupings
  [`operational-rates.ts:71`](../../src/lib/engine/operational-rates.ts#L71)

**User Interface**

- KPI Summary and drilldown tab bar component
  [`operational-rates-bar.tsx:32`](../../src/components/orders/operational-rates-bar.tsx#L32)

- Table header integration
  [`order-triage-table.tsx:219`](../../src/components/orders/order-triage-table.tsx#L219)

**Automated Tests**

- Comprehensive calculation & grouping test suite
  [`operational-rates.test.js:1`](../../tests/operational-rates.test.js#L1)

