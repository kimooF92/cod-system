---
title: 'Story 3.1: COD Order Intake & Manual Entry'
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

**Problem:** Fast, mistake-free order entry is critical in Tunisian COD e-commerce where orders arrive from multiple lead forms, WhatsApp, and phone calls. Missing phone format validation or manual price calculation errors cause delivery failures (FR-23, FR-24).

**Approach:** Build the COD Order Intake system with a PostgreSQL migration `supabase/migrations/00010_orders.sql`, robust Tunisian phone number validation (8 digits, local prefix checks), full 24 Tunisian governorates selector, automated total amount calculation (`qty * unit_price + delivery_fee`), Server Actions for order intake, and a rapid manual entry modal and interactive orders table on `/orders`.

## Boundaries & Constraints

**Always:**
- Order Number format: `ORD-YYYY-XXXXX` (e.g. `ORD-2026-00101`).
- Supported Initial Order Status: `NEW_ORDER`.
- Tunisian Phone Validation: Must accept 8-digit mobile numbers with or without `+216` or `00216` (e.g. `20123456`, `50123456`, `98123456`, `+21620123456`).
- Supported Governorates: All 24 Tunisian governorates (Ariana, Béja, Ben Arous, Bizerte, Gabès, Gafsa, Jendouba, Kairouan, Kasserine, Kébili, Le Kef, Mahdia, La Manouba, Médenine, Monastir, Nabeul, Sfax, Sidi Bouzid, Siliana, Sousse, Tataouine, Tozeur, Tunis, Zaghouan).
- Currency in `DT` (3 decimals) with monospace tabular numbers.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Direct webhook integration for Shopify / WooCommerce order webhooks.

**Never:**
- No order without a valid customer phone number.
- No client-side price computation without server-side validation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Rapid Order Creation | Customer "Mohamed Ali", Phone "22 123 456", Governorate "Tunis", Address "12 Rue de la Liberté", Product "Phone Mount", Qty 1, Unit Price 49 DT, Delivery Fee 7 DT | Order created with `order_number: "ORD-2026-00101"`, `total_amount: 56.000 DT`, status `NEW_ORDER` | Zod sanitizes phone to `22123456` |
| Multi-Quantity Order | Product "Memory Cushion", Qty 2, Unit Price 69 DT, Delivery Fee 7 DT | Total automatically calculates `2 * 69 + 7 = 145.000 DT` | Live UI computation |
| Invalid Phone Format | Phone input "1234" or letters | Validation error: "Please enter a valid 8-digit Tunisian phone number" | Block submit with error toast/banner |
| Filter by Product / Gov | Filter by "Tunis" and "Phone Mount" | Displays filtered orders matching criteria | Friendly empty state if none |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00010_orders.sql` -- Schema for `orders` table with indexes
- `src/lib/validations/order.ts` -- Zod schemas, 24 governorates list, Tunisian phone sanitizer
- `src/actions/orders.ts` -- Server Actions (`getOrders`, `createOrder`, `deleteOrder`)
- `src/components/orders/order-form-dialog.tsx` -- Fast modal for COD order manual intake
- `src/components/orders/order-table.tsx` -- High-density order triage table
- `src/app/orders/page.tsx` -- Full `/orders` route
- `tests/order-intake.test.js` -- Unit tests for order total math and Tunisian phone validation

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00010_orders.sql` -- Create migration for `orders` table -- Database schema
- [x] `src/lib/validations/order.ts` -- Define Zod schemas, governorates list, and phone validator -- Mutation validation
- [x] `src/actions/orders.ts` -- Implement Server Actions for order intake and querying -- Application layer
- [x] `src/components/orders/` -- Build OrderFormDialog and OrderTable components -- Presentation UI
- [x] `src/app/orders/page.tsx` -- Assemble complete `/orders` surface -- Route completion
- [x] `tests/order-intake.test.js` -- Add unit tests for order intake rules -- Verification suite

**Acceptance Criteria:**
- Given the `/orders` page, when the operator opens the "New Order" dialog, then they can input customer details, select from the 24 Tunisian governorates, pick a product, and see live total calculations.
- Given a valid phone number (e.g. `20123456`), when submitted, the order is created with status `NEW_ORDER` and unique code `ORD-YYYY-XXXXX`.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for order validation and math pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
