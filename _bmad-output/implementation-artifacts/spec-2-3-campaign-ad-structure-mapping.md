---
title: 'Story 2.3: Campaign & Ad Structure Mapping'
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

**Problem:** Ad spend and performance data lose operational context when campaigns are not structured hierarchically and linked directly to Products and Creative Assets (`CR-001`), making budget attribution ambiguous (FR-18).

**Approach:** Build the Campaign Structure Mapping engine with a PostgreSQL migration for `ad_campaigns`, `ad_sets`, and `ads`, Zod validation schemas, Server Actions for full tree CRUD, and an interactive tree/accordion campaign hierarchy manager on `/creatives` allowing operators to map Campaigns (`TESTING`, `SCALING`, `RETARGETING`) → Ad Sets (Audience Targeting) → Ads (linked to Creative Assets & Products).

## Boundaries & Constraints

**Always:**
- Supported Ad Platforms: `META_ADS`, `TIKTOK_ADS`, `SNAPCHAT_ADS`, `GOOGLE_ADS`.
- Supported Campaign Objectives: `TESTING`, `SCALING`, `RETARGETING`, `WARMUP`.
- Hierarchy Integrity: An Ad must belong to an Ad Set; an Ad Set must belong to a Campaign. An Ad must link to a valid Product and Creative Asset.
- Currency formatted in `DT` (3 decimals) with monospace tabular numbers.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Direct two-way OAuth synchronization with Meta Marketing API / TikTok Ads API.

**Never:**
- No orphaned ads without a parent ad set or campaign.
- No client-side mutation without server validation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Create Campaign | Platform `META_ADS`, Name "CBO - Winners Scale Q3", Objective `SCALING`, Daily Budget 120 DT | Campaign created with status `ACTIVE`, displayed in hierarchy tree | Zod validation on missing name or budget <= 0 |
| Create Ad Set in Campaign | Campaign `camp-1`, Name "Broad Men 25-50", Audience "All Tunisia, Age 25-50, Auto Placements", Budget 40 DT | Ad Set created under parent campaign | Ensures parent campaign exists |
| Map Ad to Creative Asset | Ad Set `adset-1`, Name "CR-001 Pothole Hook Ad", Product `prod-1`, Creative Asset `asset-1` (`CR-001`) | Ad mapped and linked to creative asset and product with live preview | Validates asset and product existence |
| Delete Campaign Tree | Operator confirms campaign deletion | Cascades deletion to child ad sets and ads | Confirmation prompt |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00008_campaign_structure.sql` -- Schema for `ad_campaigns`, `ad_sets`, and `ads` tables
- `src/lib/validations/campaign.ts` -- Zod schemas for campaigns, ad sets, and ads
- `src/actions/campaigns.ts` -- Server Actions (`getCampaignHierarchy`, `createCampaign`, `createAdSet`, `createAd`, `deleteCampaign`, `deleteAdSet`, `deleteAd`)
- `src/components/creatives/campaign-form-dialog.tsx` -- Modal for creating new campaign
- `src/components/creatives/adset-form-dialog.tsx` -- Modal for adding ad set under a campaign
- `src/components/creatives/ad-form-dialog.tsx` -- Modal for mapping ad to creative asset and product
- `src/components/creatives/campaign-tree.tsx` -- High-density hierarchical tree view with collapsible ad sets and ads
- `src/components/creatives/creative-hub.tsx` -- Updated with Campaign Structure tab
- `tests/campaign-structure.test.js` -- Unit tests for campaign hierarchy validation

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00008_campaign_structure.sql` -- Create migration for `ad_campaigns`, `ad_sets`, and `ads` tables -- Database schema
- [x] `src/lib/validations/campaign.ts` -- Define Zod schemas and enums for campaign hierarchy -- Mutation validation
- [x] `src/actions/campaigns.ts` -- Implement Server Actions for campaign tree management -- Application layer
- [x] `src/components/creatives/` -- Build CampaignFormDialog, AdSetFormDialog, AdFormDialog, and CampaignTree components -- Presentation UI
- [x] `src/components/creatives/creative-hub.tsx` -- Integrate Campaign Structure tab into creative cockpit -- Route integration
- [x] `tests/campaign-structure.test.js` -- Add unit tests for campaign hierarchy rules -- Verification suite

**Acceptance Criteria:**
- Given the `/creatives` page, when the operator opens the "Campaign Structure" tab, then campaigns are displayed with expandable ad sets and mapped ads.
- Given creating an ad, when selecting an ad set, product, and creative asset (`CR-001`), then the ad is mapped and renders under the ad set.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for campaign hierarchy pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
