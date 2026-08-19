---
title: 'Story 3.2: High-Density Order Triage Table with WhatsApp Actions'
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

**Problem:** In Tunisian COD operations, phone confirmations and WhatsApp follow-ups must be executed in seconds. Typing manual messages or manually navigating multiple pages causes confirmation delays and customer cancellations (FR-25, FR-26).

**Approach:** Build the high-density Order Triage Cockpit on `/orders` with pure WhatsApp message generator (`src/lib/engine/whatsapp-templates.ts`), supporting 1-click `wa.me` links with localized templates (Tunisian Derja & French), inline quick status action buttons (`Confirm`, `No Answer`, `Cancel`, `Dispatched`), batch selection actions, and an interactive WhatsApp message preview modal.

## Boundaries & Constraints

**Always:**
- Pure template engine (`AD-1`): Zero DB or external network dependencies in `src/lib/engine/whatsapp-templates.ts`.
- Supported Template Languages:
  - **Tunisian Derja (Arabic)**: "عسلامة [Name]، نأكدوا معاك كموند [Product] (الكمية: [Qty]) بـ [Total] د.ت إلى [Gov]..."
  - **French (Tunisia)**: "Bonjour [Name], nous confirmons votre commande [Product] (Qté: [Qty]) pour un montant de [Total] DT à [Gov]..."
  - **Follow-up / No Answer**: "عسلامة، حاولنا نكلموك بخصوص كموندك..."
- WhatsApp URL scheme: `https://wa.me/216${cleanPhone}?text=${encodedText}`.
- Monospace badges and formatted currency / phone numbers.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Automated WhatsApp Business Cloud API webhook automation.

**Never:**
- No malformed `wa.me` links without country code `216`.
- No client-side state mutation bypassing server action verification.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Generate Derja Confirmation | Customer "Mohamed", Phone "22123456", Product "Phone Mount", Qty 1, Total 56 DT, Gov "Tunis" | Generates valid `https://wa.me/21622123456?text=...` with pre-filled Arabic confirmation | Cleans phone with `sanitizeTunisianPhone` |
| 1-Click Quick Confirm | Operator clicks "Confirm" button on order `ORD-2026-00101` | Status immediately updates to `CONFIRMED`, `attempt_count` increments, `last_contact_at` updates to NOW | Immediate UI feedback |
| Batch Status Update | Select 5 new orders, click "Batch Mark Confirmed" | All 5 orders updated to `CONFIRMED` in a single batch server action | Atomic batch update |
| Filter by Multiple Criteria | Filter by `NEW_ORDER` + `Tunis` + Search "Mohamed" | Real-time filtered triage queue for call center operator | Empty state if no matches |

</frozen-after-approval>

## Code Map

- `src/lib/engine/whatsapp-templates.ts` -- Pure WhatsApp template generation engine (Derja, French, Follow-up)
- `src/actions/orders.ts` -- Updated with `updateOrderStatus` and `batchUpdateOrderStatus`
- `src/components/orders/whatsapp-dialog.tsx` -- Modal for selecting template and launching WhatsApp Web / app
- `src/components/orders/order-triage-table.tsx` -- High-density triage table with inline quick actions and batch selection
- `src/app/orders/page.tsx` -- Updated `/orders` route
- `tests/whatsapp-templates.test.js` -- Unit tests for WhatsApp message construction and URL formatting

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/engine/whatsapp-templates.ts` -- Implement pure localized WhatsApp template engine -- AD-1 logic core
- [x] `src/actions/orders.ts` -- Add Server Actions for inline status transitions and batch updates -- Application layer
- [x] `src/components/orders/whatsapp-dialog.tsx` -- Build WhatsApp message selector & preview modal -- Presentation UI
- [x] `src/components/orders/order-triage-table.tsx` -- Build high-density triage cockpit with inline actions -- Presentation UI
- [x] `src/app/orders/page.tsx` -- Assemble complete `/orders` surface -- Route integration
- [x] `tests/whatsapp-templates.test.js` -- Add unit tests for WhatsApp links and text encoding -- Verification suite

**Acceptance Criteria:**
- Given an order in the triage table, when the operator clicks the WhatsApp action, then a valid `https://wa.me/216...` URL is generated with localized Derja / French templates.
- Given an order, when the operator clicks "Confirm" or "No Answer", then the order status and attempt timestamp update immediately.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for WhatsApp templates pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
