---
title: 'Story 3.3: Follow-Up Scheduler & Call Attempt Logging'
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

**Problem:** Call center operators waste time re-calling unreachable leads or forgetting when to follow up, leading to stale inventory or uncoordinated repeated phone calls (FR-27, FR-28).

**Approach:** Build the Follow-Up Scheduler and Call Attempt Logging engine with pure business logic (`src/lib/engine/followup-rules.ts`), tracking attempt counts (1, 2, 3), scheduling next callback windows (+2 hours, +4 hours, tomorrow 10 AM), surfacing a dedicated "Follow-Up Queue" on `/orders`, and enforcing the 3-strike rule with 1-click cancellation.

## Boundaries & Constraints

**Always:**
- Pure logic engine (`AD-1`): Zero DB or network dependencies in `src/lib/engine/followup-rules.ts`.
- Max Call Attempts Threshold: 3 attempts before marking as dead lead (`CANCELLED`).
- Next Follow-Up Presets:
  - `IN_2_HOURS`: `NOW + 2h`
  - `IN_4_HOURS`: `NOW + 4h`
  - `TOMORROW_MORNING`: `Tomorrow at 10:00 AM`
  - `TOMORROW_AFTERNOON`: `Tomorrow at 3:00 PM`
- Monospace badges and formatted attempt counters (`1/3`, `2/3`, `3/3 MAX`).
- Git rule: Make a clean commit immediately after completing this story.

**Ask First:**
- Automated IVR (Interactive Voice Response) automated dialer integration.

**Never:**
- No infinite call retry loops (strictly bounded at 3 attempts).
- No unhandled date-parsing exceptions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Log Attempt 1 (No Answer) | Order in `NEW_ORDER`, operator clicks "No Answer" and picks "In 2 Hours" | `attempt_count: 1`, `status: NO_ANSWER`, `next_follow_up_at` set to `NOW + 2h` | Handled atomically |
| Log Attempt 3 (Max Reached) | Order in `NO_ANSWER` with `attempt_count: 2`, operator logs 3rd attempt | `attempt_count: 3`, system flags "Max Attempts Reached (3/3)", unlocks 1-click "Cancel: 3 Failed Attempts" | Prevents 4th attempt without manual reset |
| Follow-Up Queue Filter | Operator clicks "Due Follow-Ups" tab | Displays orders where `status == 'NO_ANSWER'` and `next_follow_up_at <= NOW` sorted by urgency | Clean empty state when queue is clear |
| Quick Confirm After Follow-Up | Customer answers on 2nd attempt, confirms order | Status updates to `CONFIRMED`, `next_follow_up_at` cleared | Resets follow-up schedule |

</frozen-after-approval>

## Code Map

- `src/lib/engine/followup-rules.ts` -- Pure schedule math & 3-strike threshold evaluator
- `src/actions/orders.ts` -- Updated with `logCallAttemptAndSchedule` and `cancelMaxAttemptOrders`
- `src/components/orders/call-attempt-dialog.tsx` -- Modal for logging attempt note & selecting callback preset
- `src/components/orders/followup-queue-banner.tsx` -- Urgent follow-up counter and queue view
- Update `src/components/orders/order-triage-table.tsx` -- Integrate Follow-Up Queue tab & Attempt badges
- `tests/followup-scheduler.test.js` -- Unit tests for follow-up presets and 3-strike cancellation rules

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/engine/followup-rules.ts` -- Implement pure follow-up calculation and 3-strike rule logic -- AD-1 logic core
- [x] `src/actions/orders.ts` -- Add Server Actions for call attempt logging with presets -- Application layer
- [x] `src/components/orders/call-attempt-dialog.tsx` -- Build CallAttemptDialog with quick preset buttons -- Presentation UI
- [x] `src/components/orders/followup-queue-banner.tsx` -- Build FollowUpQueueBanner for overdue callbacks -- Presentation UI
- [x] `src/components/orders/order-triage-table.tsx` -- Embed Follow-Up tab, attempt badges, and auto-cancel button -- Route integration
- [x] `tests/followup-scheduler.test.js` -- Add unit tests for schedule math and 3-attempt rules -- Verification suite

**Acceptance Criteria:**
- Given an order in `NO_ANSWER`, when the operator logs a call attempt with a preset (e.g. +2 hours), then `attempt_count` increments and `next_follow_up_at` is scheduled.
- Given an order with `attempt_count >= 3`, then it displays the "3/3 MAX" badge and allows 1-click cancellation.
- Given `npm test` and `npm run build`, when executed, then all tests and build verification pass with 0 errors.
- Given story completion, a clean git commit is made.

## Verification

**Commands:**
- `npm test` -- expected: Unit tests for follow-up scheduler pass
- `npm run build` -- expected: Next.js production build succeeds with 0 errors
- `git status` -- expected: Clean git commit after story completion
