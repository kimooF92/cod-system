---
title: 'Story 1.3: Product Catalog & Unit Economics Management'
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

**Problem:** The operator needs an exact product catalog with granular unit economics (product cost, packaging, delivery fee, return cost, target CPL, expected delivery rate) and a seamless 1-click conversion flow from validated research items to avoid manual duplicate entry.

**Approach:** Build the Product Catalog management system with Supabase PostgreSQL migration for `products`, a pure unit economics calculation engine in `src/lib/engine/unit-economics.ts`, Zod validation schemas, Server Actions for CRUD & 1-click research conversion, and a high-density tabular product interface on `/products` with live unit profit calculations.

## Boundaries & Constraints

**Always:**
- Store and calculate all currency in Tunisian Dinar (`DT`) with 3-decimal precision (`numeric(12, 3)`).
- Calculate estimated Net Profit per Delivered Order using the formula: `sellingPrice - (productCost + packagingCost + deliveryCost + ((1 - expectedDeliveryRate) / expectedDeliveryRate) * returnCost + (targetCpl / expectedDeliveryRate))`.
- Initial product status on creation is `READY` (or `RESEARCH` if converted prior to validation).
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Introducing external inventory synchronization APIs.

**Never:**
- No multi-tenant user_id column requirements.
- No client-side math divergence; unit economics formulas must live in `src/lib/engine/unit-economics.ts`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Create Product | Name "Car Wireless Mount", Price 49 DT, Cost 14.5 DT, Pkg 1.5 DT, Del 7.0 DT, Ret 3.5 DT, Target CPL 4.0 DT, Exp. Deliv 65% | Product created with status `READY`, estimated profit per delivered order calculated as `19.885 DT` | Zod validation error displayed on missing required fields |
| Convert Research Item | Click "Convert to Product" on research item `res-1` | Pre-fills name, price, cost; creates product; marks research item as `CONVERTED` with `converted_product_id` | Rolls back if product creation fails |
| Zero Delivery Rate | Expected delivery rate entered as 0% | Fallback to `null` rendered as `—` (safe divide protection) | No division by zero |
| Filter & Search | Type "Mount" in product search | Instantly filters product table | Empty state when no matches |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00002_products.sql` -- PostgreSQL table schema for `products` with constraints and indexes
- `src/lib/engine/unit-economics.ts` -- Pure calculation functions for product unit economics
- `src/lib/validations/product.ts` -- Zod schemas for product creation, editing, and conversion
- `src/actions/products.ts` -- Server Actions (`getProducts`, `createProduct`, `updateProduct`, `convertResearchToProduct`, `deleteProduct`)
- `src/components/products/product-form-dialog.tsx` -- Modal for creating and editing products with live unit economics breakdown
- `src/components/products/product-table.tsx` -- High-density tabular view with status badges, unit metrics, and edit drawer
- `src/app/products/page.tsx` -- Products surface server component
- `src/components/research/research-item-card.tsx` -- Updated with 1-click "Convert to Product" button
- `tests/unit-economics.test.js` -- Unit tests for unit economics formulas and edge cases

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00002_products.sql` -- Create migration for `products` table -- Database schema
- [x] `src/lib/engine/unit-economics.ts` -- Implement `calculateEstimatedProfitPerDeliveredOrder` with unit safety -- AD-1 pure calculation core
- [x] `src/lib/validations/product.ts` -- Define Zod schemas for products -- Mutation validation
- [x] `src/actions/products.ts` -- Implement Server Actions with database and fallback persistence -- Application layer
- [x] `src/components/products/` -- Build ProductFormDialog and ProductTable components -- Presentation UI
- [x] `src/components/research/research-item-card.tsx` -- Wire 1-click "Convert to Product" action -- Feature continuity
- [x] `src/app/products/page.tsx` -- Assemble complete `/products` surface -- Route completion
- [x] `tests/unit-economics.test.js` -- Add unit tests for unit economics calculations -- Verification suite

**Acceptance Criteria:**
- Given the `/products` page, when the operator creates a product with selling price `50 DT`, cost `15 DT`, packaging `1.5 DT`, delivery `7 DT`, return `3.5 DT`, target CPL `4 DT`, and expected delivery rate `70%`, then the system saves the product and displays estimated net profit per delivered order.
- Given a research item in `/research`, when the operator clicks "Convert to Product", then a product is created with matching details and the research item status changes to `CONVERTED`.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given the completion of this story, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for unit economics pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
