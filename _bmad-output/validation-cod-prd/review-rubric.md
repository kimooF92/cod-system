# PRD Quality Review — COD E-commerce Growth OS

## Overall verdict

This is a well-scoped, honest PRD for a hobby/solo project; the Vision, lifecycle model, and Decision Engine are genuinely load-bearing and not furniture. The biggest risk is done-ness: FRs routinely name fields without stating testable acceptance conditions, and a downstream engineer building from this alone would need to make significant interpretive calls. Shape fit is strong — the PRD correctly skips over-formalization — but the UJ protagonists are unnamed, which is a minor but fixable downstream-usability gap.

---

## Decision-readiness — adequate

The Vision states three concrete questions the app must answer and the product loop is explicit. Trade-offs are surfaced honestly: no auth, no integrations, no AI. The non-goals list (§3.2) does real work — it names what was cut and why. The single-owner constraint (§8.1) is stated as a decision, not buried.

What keeps this from *strong*: there are no open questions, no `[ASSUMPTION]` tags, and no `[NOTE FOR PM]` callouts anywhere in the document. For a solo/hobby PRD that is not blocking, but a few genuinely deferred decisions (how to secure a public Vercel deployment without in-app auth, what happens when a product has leads but no confirmed orders in the decision engine sample-size check) are absorbed silently rather than named.

### Findings
- **medium** — Deployment security posture deferred without callout (§8.3). "Any optional deployment-level protection is outside the application requirements" passes the question to the operator without flagging it as an open decision. *Fix:* Add `[NOTE FOR PM]` noting that basic HTTP auth or IP allowlisting at the Vercel layer is the expected mitigation and should be confirmed before go-live.
- **low** — Decision engine confidence thresholds (FR-13, FR-15) are named but not documented. *Fix:* Add one sentence: "Minimum sample thresholds for LOW/MEDIUM/HIGH confidence are configurable in Settings."

---

## Substance over theater — strong

No persona theater — there is one operator and four concrete journeys. No innovation theater — the PRD does not claim novelty it does not have. The defaults table (§1) is product-specific. The Decision Engine rationale (§5.3) earns its detail. Finance correctly scopes out accounting and is specific about what it tracks.

NFRs as a standalone section are absent, which is correct — constraints that matter (no auth, Vercel/Supabase, centralize business logic server-side) are embedded where they apply.

### Findings
- **low** — UJ format is formulaic ("The owner opens X, reviews Y, does Z") but internally consistent. No findings beyond the mechanical protagonist note.

---

## Strategic coherence — strong

The PRD has a clear thesis: COD businesses fail at product kill decisions and cash control; this app closes that loop. Every major feature group — Decision Engine, cash buckets, monthly review, scale planning — traces back to §1. Success Metrics (§10) are operational ("daily review < 10 minutes," "one workflow from test to decision"), not vanity.

Counter-metric is present and sharp: "do not optimize for more screens, more automation, or more data entry." MVP scope maps 1:1 to feature sections. No orphan capabilities.

### Findings
- **low** — Analytics appears in the top-level nav (§7 IA) but has no FR section. *Fix:* Add one sentence: "Analytics aggregates the metrics defined in §6 across time ranges; no dedicated FRs beyond Dashboard and Monthly Review."

---

## Done-ness clarity — thin

This is the dimension that most limits the PRD's ability to directly feed story creation. FRs name fields and capability statements but rarely include a testable consequence.

Under-specified FRs:
- **FR-3**: what events move a product into "requiring a decision" state? Not defined.
- **FR-12**: Product Score — no formula, no score range, no output description. An engineer cannot implement without inventing the model.
- **FR-15**: "avoid strong recommendations from tiny samples" — no threshold defined.
- **FR-23**: Creative recommendation WINNER/KEEP/ITERATE/KILL — no criteria stated.
- **FR-39**: ranking formula for best/worst product, most profitable, etc. — implicit.
- **FR-41**: next-month draft — fields and defaults not specified.

Acceptance Criteria (§11) partially mitigates by naming integration and formula invariants, but does not cover the behavioural FRs above.

### Findings
- **high** — FR-12 Product Score has no formula or output spec (§5.2). Zero signal on the model for a developer. *Fix:* Add score range, weighting approach (equal / configurable / weighted), whether it is a composite number or multi-dimension table.
- **high** — FR-23 Creative recommendation has no criteria (§5.4). WINNER/KEEP/ITERATE/KILL thresholds defined nowhere. *Fix:* State criteria (e.g. "WINNER when CPL ≤ target and delivery rate ≥ target over N leads") or cross-reference Decision Engine logic and Settings.
- **medium** — FR-3 "requiring a decision" has no trigger (§5.1). *Fix:* Add: "A product requires a decision when the Decision Engine has a recommendation not yet accepted or overridden."
- **medium** — FR-13/FR-15 sample thresholds not stated (§5.3). *Fix:* Document MIN_SAMPLE_LOW / MIN_SAMPLE_MEDIUM defaults and note they are configurable in Settings.
- **medium** — FR-41 next-month draft fields and defaults not stated (§5.7). *Fix:* List which fields are pre-filled and from where (e.g. "winners from current WINNER products, testing budget from current month's actual testing spend").
- **low** — FR-39 ranking sort key implicit (§5.7). *Fix:* Clarify per ranking (e.g. "most profitable = highest net profit").

---

## Scope honesty — adequate

Non-Goals (§3.2) and Out-of-Scope (§9) are both present. Future Possibilities (§12) explicitly says "intentionally not part of the current product contract." No `[ASSUMPTION]` tags — not blocking for solo PRD, but a few real inferences are absorbed silently:
- CSV import format assumed to follow Meta Ads export or similar (not stated).
- Single-business data isolation assumed (stated implicitly in §8.1 but not tagged).

### Findings
- **medium** — FR-25 CSV import (§5.4): schema, column mapping, and validation behavior unspecified beyond "validates malformed rows" in §11. *Fix:* Add note: "CSV format expected to match Meta Ads performance export schema; required columns defined at implementation."
- **low** — No Assumptions Index. Not required at this stake level but would save rework if this feeds story creation.

---

## Downstream usability — adequate

Glossary (§4) is present and concise. Domain nouns are consistent across FRs and UJs. FR-1 through FR-46 are contiguous with no gaps. UJ-1 through UJ-4 are contiguous. Section 7 (IA) and Section 8 (Data Model) are clean and extractable. The §8.2 schema is actionable enough for a developer to start. One non-resolving nav reference: Analytics (§7) has no backing FR section.

### Findings
- **low** — UJ protagonists unnamed (§2.2). All four UJs use "the owner." *Fix:* Give the operator a name inline to lock protagonist context and signal single-user scope.
- **low** — Analytics nav entry has no backing FRs (§7). *Fix:* One-sentence clarification (see Strategic Coherence finding).

---

## Shape fit — strong

PRD is correctly shaped for a hobby/single-operator tool:
- Four UJs at the right density — workflow, not psychology.
- No standalone persona section — correct.
- No NFR boilerplate section — correct; constraints are embedded.
- Rigor calibrated to stakes: detailed enough for a solo dev to start.
- §8.1 explicitly removes multi-user structure at the data model level — a rare and valuable downstream-safety move.

One shape tension: `status: final` is declared in frontmatter while FR-12 and FR-23 lack implementation specs a developer needs. "Final" is overloaded here.

### Findings
- **medium** — `status: final` declared before done-ness gaps are closed (frontmatter). *Fix:* Resolve the two high findings above, or downgrade to `status: ready-for-dev` and list the FRs pending spec.

---

## Mechanical notes

- **Glossary drift:** None found. "Delivered order" / "Delivered Orders" capitalization is consistent.
- **ID continuity:** FR-1–FR-46 contiguous, no gaps. UJ-1–UJ-4 contiguous.
- **Assumptions Index:** Not present. Not required at this stake level.
- **UJ protagonist naming:** All four UJs use "the owner" — no named protagonist.
- **Cross-references:** Analytics nav entry (§7) has no backing FR section — one unresolved reference. All other nav items map to FR sections.
- **Division-by-zero spec:** §6 calls this out explicitly. Good.
