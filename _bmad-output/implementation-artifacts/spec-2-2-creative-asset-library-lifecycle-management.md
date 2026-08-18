---
title: 'Story 2.2: Creative Asset Library & Lifecycle Management'
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

**Problem:** Creative assets are scattered without clear naming, aspect ratios, or linkage back to the marketing angles and hooks that generated them, making it impossible to diagnose why an ad won or died (FR-16, FR-17).

**Approach:** Build the Creative Asset Library with a Supabase PostgreSQL migration for `creative_assets`, Zod validation schemas, Server Actions for asset registration and status lifecycle updates, and an interactive grid/table library view on `/creatives` with media previews, aspect ratio tags (`9:16`, `1:1`, `4:5`, `16:9`), lifecycle states (`TESTING`, `ACTIVE`, `FATIGUED`, `PAUSED`, `ARCHIVED`), and performance tags (`WINNER`, `KEEP`, `ITERATE`, `KILL`).

## Boundaries & Constraints

**Always:**
- Creative code format: `CR-XXX` (e.g. `CR-001`, `CR-002`).
- Supported Asset Types: `VIDEO`, `IMAGE`, `CAROUSEL`.
- Supported Aspect Ratios: `9:16` (Story/Reels), `1:1` (Square Feed), `4:5` (Vertical Feed), `16:9` (Landscape).
- Supported Lifecycle Statuses: `TESTING`, `ACTIVE`, `FATIGUED`, `PAUSED`, `ARCHIVED`.
- Supported Performance Tags: `WINNER`, `KEEP`, `ITERATE`, `KILL`.
- Monospace tabular figures and badges.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Adding direct cloud video transcoding or S3/Supabase storage bucket upload endpoints.

**Never:**
- No creative assets without a linked product.
- No client-side mutation bypassing server validation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Register New Creative | Product "Phone Mount", Angle "Pothole Proof", Code "CR-001", Type `VIDEO`, Aspect Ratio `9:16`, Hook "Tired of phone flying...", Creator "In-House UGC" | Asset created in `TESTING` status with `KEEP` default tag, displayed in asset library | Zod validation on missing code, product, or type |
| Update Lifecycle Status | Change asset `CR-001` from `TESTING` to `ACTIVE` with tag `WINNER` | Asset status updated to `ACTIVE` and performance tag to `WINNER` | Immediate UI feedback |
| Filter by Asset Type | Filter by `VIDEO` and `WINNER` | Only video creatives with `WINNER` tag displayed in the library grid | Friendly empty state if none match |
| Delete Creative Asset | Operator confirms asset deletion | Deletes asset record safely | Confirmation prompt |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00007_creative_assets.sql` -- Schema for `creative_assets` table
- `src/lib/validations/creative-asset.ts` -- Zod schemas for creative assets
- `src/actions/creative-assets.ts` -- Server Actions (`getCreativeAssets`, `createCreativeAsset`, `updateCreativeAssetStatus`, `deleteCreativeAsset`)
- `src/components/creatives/creative-asset-dialog.tsx` -- Modal for registering new creative asset
- `src/components/creatives/creative-asset-card.tsx` -- Card with aspect ratio badge, media thumbnail, angle/hook snippet, status, and tag
- `src/components/creatives/creative-tabs.tsx` -- Switcher between Angles & Hooks Registry vs Asset Library
- `src/app/creatives/page.tsx` -- Updated with multi-tab creative hub
- `tests/creative-assets.test.js` -- Unit tests for creative asset validation and codes

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00007_creative_assets.sql` -- Create migration for `creative_assets` table -- Database schema
- [x] `src/lib/validations/creative-asset.ts` -- Define Zod schemas and enums for assets -- Mutation validation
- [x] `src/actions/creative-assets.ts` -- Implement Server Actions for creative asset management -- Application layer
- [x] `src/components/creatives/` -- Build CreativeAssetDialog, CreativeAssetCard, and CreativeTabs -- Presentation UI
- [x] `src/app/creatives/page.tsx` -- Assemble complete multi-view `/creatives` surface -- Route integration
- [x] `tests/creative-assets.test.js` -- Add unit tests for creative assets -- Verification suite

**Acceptance Criteria:**
- Given the `/creatives` page, when the operator opens the "Asset Library" tab, then all registered creative assets are displayed with code (`CR-001`), aspect ratio (`9:16`), media preview, linked angle, status, and performance tag.
- Given registering a new creative, when inputting product, angle, hook, aspect ratio, and creator, then the asset is saved in `TESTING` status.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for creative assets pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
