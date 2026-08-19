---
title: 'Story 2.5: Automated Creative Recommendation Engine'
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

**Problem:** Media buyers often overspend on fatigued creatives or fail to rapidly scale winning hooks because they lack clear, automated rule-based guidance tied directly to product break-even CPL and CTR thresholds (FR-22).

**Approach:** Build a pure TypeScript creative recommendation engine (`src/lib/engine/creative-recommendations.ts`) that compares live CPL against product break-even CPL, target CPL, CTR, and spend thresholds to generate deterministic recommendations (`SCALE`, `ITERATE_HOOK`, `PAUSE`, `KILL`, `COLLECT_DATA`) with transparent rationale. Surface these recommendations across `/creatives` asset cards and a proactive recommendation cockpit on `/analytics`.

## Boundaries & Constraints

**Always:**
- Pure math & rule engine (`AD-1`): Zero DB or network dependencies in `src/lib/engine/creative-recommendations.ts`.
- Deterministic rules:
  - `COLLECT_DATA`: Spend < Minimum Test Budget (default 30 DT).
  - `SCALE`: CPL <= Target CPL AND CTR >= 2.0% AND Spend >= 30 DT (recommend +20-50% budget scale).
  - `ITERATE_HOOK`: CPL <= Break-even CPL BUT CTR < 1.5% (recommend testing 3 new opening hooks for the same angle).
  - `PAUSE`: CPL > Break-even CPL OR CTR < 1.0% with Spend >= 45 DT.
  - `KILL`: CPL >= 1.5x Break-even CPL OR (Spend >= 2x test budget AND Leads == 0).
- Monospace badges and formatted currency / percentages.
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Automated background automated campaign pause triggers via Meta Graph API.

**Never:**
- No arbitrary non-deterministic advice (must be 100% reproducible given the same inputs).
- No unhandled division by zero.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Winning Ad | Spend 120 DT, Leads 35, CPL 3.429 DT (Target CPL 5.0 DT), CTR 2.8% | Action: `SCALE`, Priority `HIGH`, Rationale "CPL (3.429 DT) is well below target (5.000 DT) with strong 2.8% CTR. Scale daily budget by +30%." | Safe division |
| Low CTR but Profitable | Spend 50 DT, Leads 8, CPL 6.25 DT (Break-even 8.0 DT), CTR 0.9% | Action: `ITERATE_HOOK`, Priority `MEDIUM`, Rationale "Product converts well but CTR is low (0.9%). Keep angle, test 3 new hook variations." | Clean fallback |
| Bleeding Money | Spend 80 DT, Leads 2, CPL 40.0 DT (Break-even 10.0 DT), CTR 0.7% | Action: `KILL`, Priority `CRITICAL`, Rationale "CPL (40.000 DT) is 4.0x break-even CPL (10.000 DT). Cut ad spend immediately." | Clamped ratios |
| Insufficient Data | Spend 15 DT, Leads 1, Impressions 400 | Action: `COLLECT_DATA`, Priority `LOW`, Rationale "Spend (15.000 DT) is below 30.000 DT test threshold. Continue running to collect statistical significance." | Handled gracefully |

</frozen-after-approval>

## Code Map

- `src/lib/engine/creative-recommendations.ts` -- Pure deterministic recommendation rules engine
- `src/components/creatives/creative-recommendation-badge.tsx` -- Visual badge and popover/drawer for recommendation rationale
- `src/components/analytics/creative-recommendations-banner.tsx` -- Actionable recommendation summary banner on `/analytics`
- Update `src/components/creatives/creative-asset-card.tsx` -- Integrate recommendation badge
- Update `src/components/analytics/ad-performance-table.tsx` -- Integrate recommendations banner
- `tests/creative-recommendations.test.js` -- Unit tests for recommendation rules

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/engine/creative-recommendations.ts` -- Implement pure deterministic recommendation engine -- AD-1 logic core
- [x] `src/components/creatives/creative-recommendation-badge.tsx` -- Build recommendation badge with color-coding and rationale tooltip -- Presentation UI
- [x] `src/components/analytics/creative-recommendations-banner.tsx` -- Build top recommendations actionable cockpit banner -- Presentation UI
- [x] `src/components/creatives/creative-asset-card.tsx` -- Embed recommendation badge on creative cards -- Component integration
- [x] `src/components/analytics/ad-performance-table.tsx` -- Embed recommendations banner -- Route integration
- [x] `tests/creative-recommendations.test.js` -- Add unit tests for all recommendation conditions -- Verification suite

**Acceptance Criteria:**
- Given creative assets with ad spend and leads, when evaluated, then each asset receives a deterministic recommendation (`SCALE`, `ITERATE_HOOK`, `PAUSE`, `KILL`, `COLLECT_DATA`) with transparent rationale.
- Given `/creatives` and `/analytics`, recommendations are displayed cleanly with color-coded badges and actions.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for creative recommendations pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
