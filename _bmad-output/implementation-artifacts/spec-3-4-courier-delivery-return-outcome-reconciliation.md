---
title: 'Story 3.4: Courier Delivery & Return Outcome Reconciliation'
type: 'feature'
created: '2026-08-19'
status: 'done'
baseline_commit: '87d8d35dd6d31168775ab70493f21783b3d66875'
review_loop_iteration: 0
context:
  - '{project-root}/COD E-commerce Growth OS — Product Requirements Document.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-cod-system-2026-08-18/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** After orders are confirmed, e-commerce operators must assign packages to Tunisian couriers, monitor tracking codes, and reconcile delivery versus returned parcels with specific return reasons and return fees to prevent cash leakage (FR-27, FR-28).

**Approach:** Build the Courier Delivery & Return Reconciliation workflow with a dedicated reconciliation modal (`courier-reconciliation-dialog.tsx`), batch dispatching for confirmed orders, explicit courier assignment (Aramex, First Delivery, Maystro, Quick Express, etc.), tracking code validation, return reason classification with configurable return fees (default 3.500 TND), and Server Actions with optimistic UI updates.

## Boundaries & Constraints

**Always:**
- Pure logic & safe state transitions: Valid transitions `CONFIRMED` -> `DISPATCHED` -> `DELIVERED` / `RETURNED`.
- Return fee requirement: Every `RETURNED` order must record a `return_reason` and a non-negative `return_fee` (default 3.500 TND).
- Delivered eligibility: `DELIVERED` orders are flagged as delivered revenue for financial and operational calculations.
- Courier presets for Tunisia: Aramex, First Delivery Express, Maystro Delivery, Quick Express, Colis Express, and Custom.
- Monospace tabular numbers for tracking codes and amounts.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Automated courier API integrations (e.g. Aramex webhooks) or live automated parcel tracking scraping.

**Never:**
- No deleting or resetting order creation timestamps upon dispatch.
- No negative return fees or unvalidated status jumps (e.g. from `CANCELLED` directly to `DELIVERED`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Single Order Dispatch | Order in `CONFIRMED`, operator enters courier "Aramex" and tracking "ARX-12345" | `status: DISPATCHED`, `courier_name: "Aramex"`, `tracking_code: "ARX-12345"` | Required fields validated before update |
| Mark as Delivered | Order in `DISPATCHED`, operator confirms delivery | `status: DELIVERED`, delivered revenue qualified | Atomic update |
| Reconcile Returned Order | Order in `DISPATCHED`, operator marks returned with reason "Customer Refused" & fee 3.500 TND | `status: RETURNED`, `return_reason: "Customer Refused"`, `return_fee: 3.500` | Requires return reason selection |
| Batch Dispatch | 5 confirmed orders selected, operator clicks "Batch Dispatch" with courier "First Delivery" | All 5 orders updated to `DISPATCHED` with courier assigned | Validates all selected IDs |
| Return from Confirmed | Customer cancels while packing (before dispatch) | Transition to `CANCELLED` without incurring courier return fee | Does not require courier return fee |

</frozen-after-approval>

## Code Map

- `src/actions/orders.ts` -- Add `reconcileCourierDelivery` and `batchDispatchOrders` server actions
- `src/components/orders/courier-reconciliation-dialog.tsx` -- Modal for assigning courier, tracking code, or logging delivery/return outcome
- `src/components/orders/batch-dispatch-dialog.tsx` -- Dialog for bulk assigning couriers to confirmed orders
- `src/components/orders/order-triage-table.tsx` -- Connect reconciliation dialogs, status actions, and courier badge columns
- `src/lib/validations/order.ts` -- Add return reasons constants and courier validation schema
- `tests/courier-reconciliation.test.js` -- Unit tests for delivery/return reconciliation rules and return fee handling

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/validations/order.ts` -- Define `COURIER_PRESETS`, `RETURN_REASONS`, and courier reconciliation Zod schema -- Provide standardized choices
- [x] `src/actions/orders.ts` -- Implement `reconcileCourierDelivery` and `batchDispatchOrders` -- Enable single & bulk courier workflow
- [x] `src/components/orders/courier-reconciliation-dialog.tsx` -- Create modal for courier dispatch and delivery/return reconciliation -- Operator UI
- [x] `src/components/orders/batch-dispatch-dialog.tsx` -- Create batch dispatch dialog -- Bulk operations
- [x] `src/components/orders/order-triage-table.tsx` -- Integrate reconciliation triggers and courier tracking pill displays -- Complete triage UX
- [x] `tests/courier-reconciliation.test.js` -- Add automated test suite for courier reconciliation logic -- Ensure correctness

**Acceptance Criteria:**
- Given an order in `CONFIRMED` or `DISPATCHED` status
- When the operator opens the reconciliation dialog and submits courier information or delivery/return outcome
- Then the database and UI update with courier name, tracking code, return reason, and return fee
- And marking an order `DELIVERED` flags it for delivered revenue
- And marking an order `RETURNED` assigns the return fee and reason.

## Design Notes

Tunisian COD couriers require tracking codes (often alphanumeric e.g. `ARX-TN-12345` or `FDX-88214`). Returning orders incurs a standard courier return penalty (usually between 3.000 and 5.000 TND, default 3.500 TND). Standard return reasons:
1. `Customer Refused on Delivery`
2. `Unreachable / Wrong Phone`
3. `Wrong Address / Incomplete`
4. `Wrong Item Shipped`
5. `Late Delivery / Cancelled by Customer`
6. `Damaged in Transit`

## Verification

**Commands:**
- `node tests/courier-reconciliation.test.js` -- expected: All reconciliation unit tests pass
- `npm run build` -- expected: Build passes with zero TypeScript/lint errors

**Manual checks (if no CLI):**
- Verify clicking "Dispatch / Reconcile" on an order opens the reconciliation dialog with courier selection, tracking code, and return reason handling.

## Suggested Review Order

**Courier Presets & Schemas**

- Standardized courier presets and return reasons
  [`order.ts:89`](../../src/lib/validations/order.ts#L89)

- Single reconciliation and batch dispatch Zod schemas
  [`order.ts:111`](../../src/lib/validations/order.ts#L111)

**Server Actions**

- Order courier reconciliation Server Action
  [`orders.ts:459`](../../src/actions/orders.ts#L459)

- Batch dispatch Server Action
  [`orders.ts:518`](../../src/actions/orders.ts#L518)

**User Interface & Reconciliation Dialogs**

- Modal dialog for single order courier reconciliation
  [`courier-reconciliation-dialog.tsx:30`](../../src/components/orders/courier-reconciliation-dialog.tsx#L30)

- Batch dispatch modal for confirmed orders
  [`batch-dispatch-dialog.tsx:16`](../../src/components/orders/batch-dispatch-dialog.tsx#L16)

- Table integration with courier badges, batch dispatch, and reconciliation triggers
  [`order-triage-table.tsx:527`](../../src/components/orders/order-triage-table.tsx#L527)

**Automated Tests**

- Automated unit tests covering all matrix scenarios
  [`courier-reconciliation.test.js:1`](../../tests/courier-reconciliation.test.js#L1)

