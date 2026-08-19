---
title: 'Story 3.6: Google Sheets Real-Time Order Sync Engine'
type: 'feature'
created: '2026-08-19'
status: 'done'
baseline_commit: 'ede2f49b2e879372c2c9edb8f085be7501eaef63'
review_loop_iteration: 0
context:
  - '{project-root}/COD E-commerce Growth OS — Product Requirements Document.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-cod-system-2026-08-18/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Tunisian COD operators and media buyers receive leads from landing pages (YouCan, Shopify, Google Forms) directly into Google Sheets. Manually transcribing leads causes delays in 15-minute call confirmation windows and duplicate intake errors (FR-26, ARCH-4).

**Approach:** Build the Google Sheets Real-Time Order Sync Engine (`src/lib/engine/sheets-sync.ts`) with flexible column mapping, idempotent de-duplication by phone number + product + date, interactive Sync Drawer (`src/components/orders/sheets-sync-dialog.tsx`) supporting both direct Published Sheet URL fetch and paste/CSV intake, and an API Webhook endpoint (`/api/sync/orders`) for automated Apps Script posting.

## Boundaries & Constraints

**Always:**
- Pure logic engine (`AD-1`): Zero DB or network dependencies in `src/lib/engine/sheets-sync.ts`.
- Idempotent upsert & de-duplication: Never create duplicate `orders` for the same customer phone + product within the same day.
- Phone number normalization: Sanitize all imported phone numbers using `sanitizeTunisianPhone`.
- Governorate fuzzy matching: Normalize imported governorates against `TUNISIAN_GOVERNORATES` (24 governorates).
- Product matching: Match by SKU or product name (case-insensitive fuzzy match) with fallback to default product.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- OAuth2 Google Workspace multi-tenant authorization credentials.

**Never:**
- No deleting or overwriting already confirmed / dispatched order statuses during sync.
- No unhandled network exceptions when Google Sheets endpoint is offline.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Valid Sheet Row Sync | Google Sheet row with Name, Phone `+216 22 123 456`, Governorate "Tunis", Product "prod-1" | Order inserted with normalized phone `22123456`, status `NEW_ORDER`, source "Google Sheets" | Atomic validation |
| Duplicate Lead | Same phone number and product synced twice | 1st row creates order; 2nd row detected as duplicate and skipped | Increments `skippedDuplicates` counter |
| Governorate Alias | Row has governorate "sousse", "Sousse ville", or "Ben Arous" | Normalizes to official governorate string | Case-insensitive match |
| Webhook Intake | Landing page posts JSON payload to `/api/sync/orders` | Ingests lead into queue immediately, returns `{ success: true, order_id }` | Validates Zod schema |
| Missing Product Match | Row has unknown product title | Links to first active product or creates order with default catalog SKU | Graceful fallback |

</frozen-after-approval>

## Code Map

- `src/lib/engine/sheets-sync.ts` -- Pure CSV/JSON parser, column mapper, and idempotent deduplicator
- `src/app/api/sync/orders/route.ts` -- Next.js Route Handler for real-time webhook order ingestion
- `src/actions/orders.ts` -- Add `syncExternalOrders` and `saveSheetSyncConfig` server actions
- `src/components/orders/sheets-sync-dialog.tsx` -- Modal for configuring Google Sheet URL, column mapping, and 1-click sync
- `src/components/orders/order-triage-table.tsx` -- Add "Sync Google Sheet" button to header
- `tests/sheets-sync.test.js` -- Unit tests for row parsing, column mapping, fuzzy matching, and deduplication

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/engine/sheets-sync.ts` -- Implement parsing, column mapping, governorate normalization, and deduplication -- Pure sync logic
- [x] `src/app/api/sync/orders/route.ts` -- Create API endpoint for real-time Apps Script / webhook lead intake -- Webhook listener
- [x] `src/actions/orders.ts` -- Add `syncExternalOrders` Server Action -- Persistence & optimistic updates
- [x] `src/components/orders/sheets-sync-dialog.tsx` -- Build Google Sheets sync and column mapping modal -- User interface
- [x] `src/components/orders/order-triage-table.tsx` -- Mount sheets sync trigger button and modal -- UI integration
- [x] `tests/sheets-sync.test.js` -- Add automated test suite for sync engine -- Test coverage

**Acceptance Criteria:**
- Given a Google Sheet CSV/TSV or JSON lead payload
- When the sync engine runs or webhook receives a lead
- Then new orders are inserted with sanitized phone numbers and normalized governorates
- And duplicate orders are safely skipped
- And the UI displays the sync count and surfaces new orders in `NEW_ORDER` status.

## Design Notes

Supported Google Sheets formats:
1. Google Sheets "Publish to Web as CSV / TSV": `https://docs.google.com/spreadsheets/d/e/.../pub?output=csv`
2. Direct CSV / Tab-delimited text paste from spreadsheet
3. Webhook POST from Google Apps Script (`onFormSubmit` trigger) to `/api/sync/orders`.

## Verification

**Commands:**
- `node tests/sheets-sync.test.js` -- expected: All sync engine unit tests pass
- `npm run build` -- expected: Build passes with zero errors

**Manual checks (if no CLI):**
- Verify clicking "Sync Sheets" opens the sync modal and imports sample sheet rows into the triage queue.

## Suggested Review Order

**Sync Engine & Normalization**

- Delimited text parser, governorate normalization, and idempotent deduplicator
  [`sheets-sync.ts:40`](../../src/lib/engine/sheets-sync.ts#L40)

**Webhook Route Handler & Server Actions**

- Real-time lead intake Webhook endpoint
  [`route.ts:12`](../../src/app/api/sync/orders/route.ts#L12)

- Order batch ingestion Server Action
  [`orders.ts:568`](../../src/actions/orders.ts#L568)

**User Interface & Interactive Dialog**

- Google Sheets sync drawer with live preview and column mapper
  [`sheets-sync-dialog.tsx:32`](../../src/components/orders/sheets-sync-dialog.tsx#L32)

- Order triage cockpit header integration
  [`order-triage-table.tsx:210`](../../src/components/orders/order-triage-table.tsx#L210)

**Automated Tests**

- Unit test suite for parsing, governorates, and deduplication
  [`sheets-sync.test.js:1`](../../tests/sheets-sync.test.js#L1)

