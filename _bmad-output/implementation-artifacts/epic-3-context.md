# Epic 3 Context: COD Order Operations & Customer Confirmation Pipeline

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Enable the operator to execute the daily cash-on-delivery order workflow, conduct customer phone confirmations with 1-click WhatsApp messaging, manage follow-up scheduling, track courier delivery outcomes, reconcile returns, and compute live operational fulfillment rates.

## Stories

- Story 3.1: COD Order Intake & Manual Entry
- Story 3.2: High-Density Order Triage Table with WhatsApp Actions
- Story 3.3: Follow-Up Scheduler & Call Attempt Logging
- Story 3.4: Courier Delivery & Return Outcome Reconciliation
- Story 3.5: Operational Rates & Performance Calculations
- Story 3.6: Google Sheets Real-Time Order Sync Engine

## Requirements & Constraints

- Order lifecycle statuses: `NEW_ORDER`, `CONFIRMED`, `DISPATCHED`, `DELIVERED`, `RETURNED`, `CANCELLED`, `NO_ANSWER`.
- Direct customer communication via WhatsApp links formatted with `+216` Tunisian numbers.
- Automated scheduling for follow-up call attempts with bounded retry counts (max 3).
- Courier assignments with courier name, tracking code, dispatch date, and delivery/return reconciliation.
- Return fee attribution (default 3.500 TND) and delivered revenue qualification for financial ledger calculations.
- Live operational rates: Confirmation Rate (`Confirmed / Leads`), Delivery Rate (`Delivered / Confirmed`), Return Rate (`Returned / Dispatched`), Delivered Revenue (`Sum of Delivered Order Totals`).
- Safe division utility (`safeDivide`) returning `null` (displayed as `—`) for any zero-denominator operational rates.
- Tunisian Dinar currency precision formatted with monospace tabular figures (`font-variant-numeric: tabular-nums`).

## Technical Decisions

- Core calculation algorithms isolated in pure TypeScript modules (`src/lib/engine/operational-rates.ts`, `src/lib/engine/followup-rules.ts`) with zero database dependencies.
- Next.js Server Actions with Zod schemas for order mutations and optimistic UI updates for rapid triage.
- Direct Supabase PostgreSQL storage on `orders` table (with indexes on status, governorate, product_id, created_at).
- Real-time or webhook-capable Google Sheets sync engine for external lead intake and order status propagation.

## UX & Interaction Patterns

- High-density table layout with inline status dropdowns, fast keyboard navigation, and semantic badge colors.
- Follow-up call attempt modal with quick-select delay intervals (2h, 4h, tomorrow morning, tomorrow afternoon).
- Courier dispatch & reconciliation dialog with tracking number input and return reason selector.
- Live summary stat cards displaying Confirmation Rate, Delivery Rate, Return Rate, and Delivered Revenue.
