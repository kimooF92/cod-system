---
title: 'Story 2.1: Marketing Angles, Hooks & Formats Registry'
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

**Problem:** Creative fatigue and inconsistent ad messaging occur when operators do not systematically organize the marketing angles, opening hooks, and creative formats behind their ad creatives (FR-13, FR-14, FR-15).

**Approach:** Build the Marketing Angles, Hooks & Formats Registry with a PostgreSQL migration for `marketing_angles` and `marketing_hooks`, Zod validations, Server Actions, and a high-density creative angles manager on `/creatives` allowing operators to register angles linked to products, attach 7 standard hook types, and select targeted creative formats.

## Boundaries & Constraints

**Always:**
- Supported Hook Types: `QUESTION`, `BOLD_CLAIM`, `PROBLEM_AGITATION`, `CURIOSITY_GAP`, `SOCIAL_PROOF`, `OFFER_LED`, `DEMONSTRATION`.
- Supported Creative Formats: `PROBLEM_SOLUTION`, `DEMONSTRATION`, `UGC_TESTIMONIAL`, `UNBOXING`, `COMPARISON`, `OFFER_LED`, `AUTHORITY_REVIEW`.
- Angles must link to a valid `product_id`. Hooks must link to a valid `angle_id`.
- Monospace badges and clean UI with zero generic AI gradient clutter.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Adding direct automated AI hook copy generation integrations (handled in subsequent creative stories).

**Never:**
- No orphaned hooks without an associated marketing angle.
- No client-side mutation without server validation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Create Marketing Angle | Product "Phone Mount", Name "Rough Road Commute", Pain Point "Phone falling in traffic", Promise "Zero drops on Tunisian potholes", Avatar "Daily Taxi/Car Drivers" | Angle saved and linked to product, displayed in angle grid | Zod validation on missing name or product |
| Add Hook to Angle | Angle `angle-1`, Hook Text "Tired of your phone flying off the dashboard at every speed bump?", Hook Type `PROBLEM_AGITATION` | Hook appended to angle with type badge and copy-to-clipboard button | Requires hook text |
| Filter by Product | Select "Magnetic Phone Holder Pro" in filter bar | View only angles and hooks associated with that specific product | Friendly empty state if product has no angles |
| Delete Angle | Operator confirms angle deletion | Cascades deletion to associated hooks | Prompts confirmation |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00006_marketing_angles_hooks.sql` -- Schema for `marketing_angles` and `marketing_hooks` tables
- `src/lib/validations/creative.ts` -- Zod schemas for angles, hooks, and formats
- `src/actions/creatives.ts` -- Server Actions (`getMarketingAngles`, `createMarketingAngle`, `createMarketingHook`, `deleteMarketingAngle`, `deleteMarketingHook`)
- `src/components/creatives/angle-form-dialog.tsx` -- Modal for creating new marketing angle with target avatar and format
- `src/components/creatives/hook-form-dialog.tsx` -- Modal for attaching new hook to an angle
- `src/components/creatives/angle-card.tsx` -- Card displaying angle details, formats, and list of hooks with 1-click copy
- `src/components/creatives/angle-registry.tsx` -- Main registry component on `/creatives` with product filters and stats
- `src/app/creatives/page.tsx` -- Server component for `/creatives`
- `tests/angles-hooks.test.js` -- Unit tests for angle and hook validation logic

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00006_marketing_angles_hooks.sql` -- Create migration for `marketing_angles` and `marketing_hooks` tables -- Database schema
- [x] `src/lib/validations/creative.ts` -- Define Zod schemas and enums for angles, hooks, and formats -- Mutation validation
- [x] `src/actions/creatives.ts` -- Implement Server Actions for angle and hook management -- Application layer
- [x] `src/components/creatives/` -- Build AngleFormDialog, HookFormDialog, AngleCard, and AngleRegistry components -- Presentation UI
- [x] `src/app/creatives/page.tsx` -- Assemble complete `/creatives` surface -- Route completion
- [x] `tests/angles-hooks.test.js` -- Add unit tests for angle and hook data structures -- Verification suite

**Acceptance Criteria:**
- Given the `/creatives` page, when the operator creates a new marketing angle for a product with name, pain point, promise, avatar, and format, then the angle is saved and displayed in the registry.
- Given an existing angle, when the operator attaches a hook (e.g. `PROBLEM_AGITATION` hook), then the hook appears under the angle card with a type badge and copy button.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for angles and hooks pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
