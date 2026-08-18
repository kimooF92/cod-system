---
title: 'Story 1.4: Product Lifecycle State Machine & Audit History'
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

**Problem:** The operator needs disciplined control over product lifecycle transitions (`IDEA` → `RESEARCH` → `READY` → `TESTING` → `HOLD` / `KILL` / `WINNER` → `SCALING` → `FATIGUED` / `ARCHIVED`) and a permanent audit trail recording when and why a status was changed (FR-11).

**Approach:** Implement the product lifecycle state machine engine in `src/lib/engine/state-machine.ts`, create the `product_status_history` PostgreSQL migration and Server Actions, build the Status Override Dialog (with reason logging), and add an interactive Status History Drawer showing the complete chronological audit timeline for any product.

## Boundaries & Constraints

**Always:**
- Append-only invariant (`AD-3`): Status changes must insert a record into `product_status_history` preserving previous status, new status, timestamp, and reason.
- Valid status set: `IDEA`, `RESEARCH`, `READY`, `TESTING`, `HOLD`, `KILL`, `WINNER`, `SCALING`, `FATIGUED`, `ARCHIVED`.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Adding automated external webhook triggers upon status changes.

**Never:**
- No deletion or in-place mutation of historical status change records.
- No client-side bypassing of status transition audit logging.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Manual Status Override | Change product `prod-1` from `TESTING` to `WINNER` with reason "CPL 3.200 DT, 72% delivery rate" | Product `status` updated to `WINNER`, row inserted into `product_status_history` with previous `TESTING`, new `WINNER`, reason, and timestamp | Reverts product status update if history insert fails |
| Initial Product Creation | Product created with status `READY` | Initial history row inserted with `previous_status: null`, `new_status: 'READY'`, reason: "Initial product creation" | Initial history recorded seamlessly |
| Open Audit Drawer | Click "History" icon on product row | Drawer slides in displaying chronological timeline of all historical status transitions | Friendly empty state if only initial record exists |
| Blank Reason | Status changed without typing an explicit reason | Reason stored with default fallback `"Manual status update"` | Safe fallback string recorded |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00003_product_status_history.sql` -- PostgreSQL table schema for `product_status_history`
- `src/lib/engine/state-machine.ts` -- Pure TypeScript lifecycle state machine transition validator and metadata
- `src/actions/product-status.ts` -- Server Actions (`updateProductStatusWithHistory`, `getProductStatusHistory`)
- `src/components/products/status-override-dialog.tsx` -- Modal for selecting new status with reason field
- `src/components/products/status-history-drawer.tsx` -- Slide-over drawer rendering audit timeline
- `src/components/products/product-table.tsx` -- Updated with status override trigger and history drawer button
- `tests/state-machine.test.js` -- Unit tests for valid/invalid transitions and state metadata

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00003_product_status_history.sql` -- Create migration for `product_status_history` table -- Database schema
- [x] `src/lib/engine/state-machine.ts` -- Implement lifecycle state transitions and transition rules -- AD-1 logic core
- [x] `src/actions/product-status.ts` -- Implement Server Actions for status transitions and history retrieval -- Application layer
- [x] `src/components/products/status-override-dialog.tsx` -- Build StatusOverrideDialog component -- Presentation UI
- [x] `src/components/products/status-history-drawer.tsx` -- Build StatusHistoryDrawer timeline view -- Presentation UI
- [x] `src/components/products/product-table.tsx` -- Wire status dialog and history drawer into product catalog -- Integration
- [x] `tests/state-machine.test.js` -- Unit test state machine transition logic -- Verification suite

**Acceptance Criteria:**
- Given a product in `/products`, when the operator overrides its status from `TESTING` to `WINNER` and inputs a reason, then the table reflects the new status and a new event is added to the history drawer.
- Given the Status History Drawer, when opened for a product, then it displays a chronological timeline with timestamps, previous status, new status, and the recorded reason.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for state machine and calculations pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
