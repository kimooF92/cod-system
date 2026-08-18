---
title: COD E-commerce Growth OS
status: ready-for-dev
created: 2026-08-18
updated: 2026-08-18
---

# COD E-commerce Growth OS

## 0. Document Purpose

This PRD defines a personal, single-operator web application for managing a Tunisia-based cash-on-delivery e-commerce business. It is a hobby project used only by its owner, not a SaaS product. Version 1 prioritizes reliable manual workflows, accurate calculations, and fast daily decisions over integrations, automation, or multi-user capabilities.

## 1. Vision

COD Growth OS turns product research, testing, advertising measurement, order operations, cash management, and monthly review into one repeatable operating loop:

**Research → Test → Measure → Kill / Hold / Scale → Winner → Scale → Profit → Reinvest → Test again**

The app should answer three questions quickly:

- What happened yesterday and what is happening today?
- Which products, creatives, and campaigns are actually profitable?
- What should I do next while protecting cash?

The app is a decision and operating system, not only an analytics dashboard, CRM, order tracker, or profit calculator.

Initial business assumptions are editable defaults, not hard-coded rules:

| Assumption | Default |
|---|---:|
| Starting capital example | 3,000 DT |
| Average order value | 45 DT |
| Target CPL | 4 DT |
| Target delivery rate | 65% |
| Target net profit per delivered order | 5–7 DT |
| Expected product win rate | 20% |
| Default lead capacity per product/day | 25 |
| Example monthly profit target | 1,000 DT |

## 2. Target User and Journeys

### 2.1 Target user

The sole user is the owner/operator of the e-commerce business. The owner researches products, launches tests, records advertising results, confirms COD orders, monitors delivery, tracks cash, and decides where to spend next.

### 2.2 User journeys

- **UJ-1. Morning review:** The owner opens the dashboard, checks yesterday’s spend, leads, orders, delivery, profit, cash, and recommended actions, then opens the relevant product decision screen.
- **UJ-2. Product decision:** The owner opens a product, reviews economics and evidence, sees a Kill/Hold/Scale recommendation with reasons and confidence, then accepts or overrides it with a note.
- **UJ-3. Daily operations:** The owner works through unconfirmed orders and follow-ups, updates delivery or return outcomes, and sees the resulting KPI changes.
- **UJ-4. Monthly review:** The owner closes a month, reviews product and creative performance, records lessons, and prepares an editable plan for the next month.

## 3. Scope and Product Principles

### 3.1 Principles

- Product is the central business entity: Product → Test → Campaign → Creative → Lead → Order → Delivery → Revenue → Profit.
- Profit is the primary decision metric. CPL alone must never define a winner.
- Failed products are expected; the system should make stopping them easy and protect available cash.
- Recommendations support the owner’s judgment and never silently change a product’s status.
- All thresholds are configurable in Settings.
- Permanent records are not tied to a month; monthly periods are reporting and planning containers.

### 3.2 Explicit non-goals for version 1

- No in-app authentication, sign-up, login, user accounts, roles, teams, or business workspaces.
- No Meta Ads, WhatsApp, courier, supplier, payment, or accounting API integrations.
- No AI product research, AI decision assistant, automated calling, or automated creative generation.
- No public multi-tenant SaaS behavior or enterprise permissions.
- No full accounting system; Finance is an operating cash and profitability tracker.

## 4. Glossary

- **Product** — An item being researched, tested, sold, scaled, or archived.
- **Test** — A bounded product evaluation with targets, budget, dates, and observed performance.
- **Creative** — A marketing asset attached to a Product and optionally to an Ad or Campaign.
- **Lead** — A generated customer inquiry or prospect before it becomes an Order.
- **Order** — A COD purchase record with customer, product, fulfillment, and financial information.
- **Delivered order** — An Order completed by the customer and eligible for delivered revenue.
- **Monthly period** — A reporting and planning period with targets and actuals.
- **Decision** — A Kill, Hold, Scale, or Big Scale recommendation or owner override.

## 5. Functional Requirements

### 5.1 Dashboard and action center

The Dashboard is the default operating screen. It supports UJ-1 and shows a date range defaulting to Today, with Today, Yesterday, Last 7 days, This week, This month, Last month, and Custom range options.

- **FR-1:** The system must display Cash Available, Ad Spend, Leads, Orders, Delivered Orders, Net Profit, Profit per Delivered Order, and Delivery Rate for the selected period.
- **FR-2:** The system must display a Product Scoreboard with Product, Status, Leads, CPL, Confirmation Rate, Delivery Rate, Profit per Delivered Order, Net Profit, and Decision.
- **FR-3:** The system must rank active winners, products requiring a decision, products currently testing, and archived/killed products in that order unless the owner changes the sort. A product is in the "requiring a decision" state when the Decision Engine has generated a recommendation that has not yet been accepted or overridden by the owner.
- **FR-4:** The system must show clickable recommended actions such as Scale, Hold, Kill, Test Creative, Confirm Orders, and Cash Warning.
- **FR-5:** The system must show the owner’s daily checklist: review performance, handle follow-ups, update numbers, and review decisions.

### 5.2 Products, research, and testing

Products move through a manually overridable lifecycle:

`IDEA → RESEARCH → READY → TESTING → HOLD / KILL / WINNER → SCALING → FATIGUED / ARCHIVED`

- **FR-6:** The owner must be able to create and edit Products with name, SKU, selling price, product cost, packaging cost, delivery cost, return cost, other fulfillment cost, target CPL, expected delivery rate, lead capacity, notes, and status.
- **FR-7:** The owner must be able to create Research Items with market, problem, target customer, pain point, promise, competitors, estimated cost, price, margin, creative opportunities, source, notes, and research status.
- **FR-8:** The owner must be able to convert a Research Item into a Product without duplicating information unnecessarily.
- **FR-9:** The owner must be able to create a Test with dates, budget, target leads, target CPL, expected delivery rate, target profit per delivered order, planned creative quantity, and notes.
- **FR-10:** A Test must show spend, leads, CPL, confirmed orders, confirmation rate, delivered orders, delivery rate, revenue, costs, net profit, profit per order, and profit per lead.
- **FR-11:** The owner must be able to manually override Product status; the system must preserve the previous status and timestamp the change.
- **FR-12:** The system must calculate a Product Score from configurable dimensions including CPL, customer interest, confirmation rate, delivery potential, profit per order, creative potential, upsell potential, and competition. The score must be a single composite number on a 0–100 scale. Each dimension has a configurable weight (defaulting to equal weighting). The score is displayed alongside its per-dimension breakdown so the owner can see which factors drove the result.

### 5.3 Decision engine

The Decision Engine evaluates evidence without replacing the owner’s judgment. Decision thresholds and minimum sample sizes are editable in Settings.

- **FR-13:** The system must recommend `KILL`, `HOLD`, `SCALE`, or `BIG SCALE` for a Product when sufficient performance data exists.
- **FR-14:** A recommendation must consider CPL, confirmation rate, delivery rate, profit per delivered order, sample size, number of observed days, and performance consistency.
- **FR-15:** The system must avoid strong recommendations from tiny samples and must label confidence `LOW`, `MEDIUM`, or `HIGH`. Minimum sample sizes that unlock each level are configurable in Settings; defaults are 10 leads for `MEDIUM` and 25 leads with at least 3 observed days for `HIGH`.
- **FR-16:** Every recommendation must include the key metrics, comparison with the configured targets, a plain-language reason, confidence, and suggested next action.
- **FR-17:** The owner must be able to accept or override a recommendation and record an optional reason. Recommendations and overrides must be stored in a Decision Log.
- **FR-18:** The system must distinguish product fatigue from creative fatigue and recommend testing or refreshing creatives before automatically killing a product.

Default decision guidance:

- **Scale:** healthy CPL, confirmation, delivery, and profit; sufficient sample; stable performance over multiple days.
- **Hold:** promising or near target, but sample size, delivery evidence, or consistency is insufficient.
- **Kill:** economics remain clearly weak after sufficient data, especially persistently poor delivery or structurally low/negative profit per order.
- **Big Scale:** stable, proven Scale performance over multiple periods and enough delivery volume.

### 5.4 Creatives and campaigns

- **FR-19:** The owner must be able to create Creatives with Product, angle, concept, hook, format, script, visual concept, CTA, file/URL, status, and launch date.
- **FR-20:** Creative statuses must include `IDEA`, `IN PRODUCTION`, `READY`, `RUNNING`, `WINNER`, `ITERATE`, `KILL`, and `ARCHIVED`.
- **FR-21:** The owner must be able to maintain reusable lists of hooks, angles, concepts, and formats.
- **FR-22:** The owner must be able to record Creative Performance for spend, impressions, CTR, CPC, leads, CPL, orders, delivered orders, delivery rate, revenue, and profit.
- **FR-23:** The system must recommend `WINNER`, `KEEP`, `ITERATE`, or `KILL` for a Creative and explain the recommendation. Default criteria: **WINNER** — CPL at or below target and delivery rate at or above target over sufficient leads; **KEEP** — CPL near target or delivery promising but sample size insufficient for a strong call; **ITERATE** — performance below target but audience engagement signals (CTR, lead volume) suggest the format has potential; **KILL** — CPL persistently above target and delivery rate below target after sufficient data. Thresholds and minimum sample sizes are configurable in Settings and mirror the Decision Engine logic in §5.3.
- **FR-24:** The owner must be able to record Platforms, Campaigns, Ad Sets, and Ads manually and connect them to Products and Creatives.
- **FR-25:** Version 1 must support manual entry and CSV import for advertising performance. External API synchronization is deferred. The CSV import must accept at minimum: date, campaign name, ad set name, ad name, spend, impressions, clicks, and leads. The system must validate that required columns are present and surface row-level errors before committing the import. The default expected format is the Meta Ads Manager performance export; the accepted column mapping is documented at implementation.

### 5.5 COD orders and operations

Order statuses are `NEW`, `CONTACTING`, `CONFIRMED`, `PREPARING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `NO ANSWER`, and `RETURNED`.

- **FR-26:** The owner must be able to create and edit Orders with customer name, phone, governorate, address, Product, quantity, unit price, delivery fee, total, source, Creative, Campaign, and relevant dates.
- **FR-27:** The owner must be able to move an Order through confirmation, preparation, shipment, delivery, cancellation, no-answer, and return outcomes.
- **FR-28:** The system must track attempt count, last contact time, next follow-up time, contact result, notes, courier, return reason, and return cost.
- **FR-29:** The Dashboard must surface Orders requiring follow-up today and Orders stuck beyond configurable operational thresholds.
- **FR-30:** The system must calculate confirmation rate, delivery rate, return rate, delivered revenue, and related product/creative breakdowns.

### 5.6 Finance and cash control

Cash is separated into Advertising Capital, Operations Capital, and Profit. Finance is intended for operating control, not statutory accounting.

- **FR-31:** The owner must be able to record financial transactions including ad spend, product purchase, delivery cost, return cost, packaging, supplier payment, customer payment, other expense, owner withdrawal, and owner injection.
- **FR-32:** Each transaction must support amount, date, category, Product, Order, and note.
- **FR-33:** The Cash Dashboard must display Total Cash, Advertising Capital, Operations Capital, Profit, Expected COD Receivables, Outstanding Supplier Payments, and Upcoming Expenses.
- **FR-34:** The system must calculate actual Net Profit as Delivered Revenue minus advertising spend, product costs, delivery costs, return costs, packaging, and other relevant costs.
- **FR-35:** The system must show cash warnings when projected ad spend or obligations exceed available capital.

### 5.7 Monthly periods and review

- **FR-36:** The owner must be able to create a Monthly Period with starting cash, profit target, testing budget, scaling budget, operations reserve, emergency reserve, target winners, target products tested, target delivery rate, target CPL, and target profit per order.
- **FR-37:** The Monthly Dashboard must show targets, actuals, progress, products tested, winners, leads, delivered orders, ad spend, revenue, net profit, delivery rate, and average CPL.
- **FR-38:** The system must generate a month-end summary of leads, confirmations, delivered orders, returns, spend, revenue, costs, and actual profit.
- **FR-39:** The system must rank the best/worst product, most profitable product, best delivery product, best CPL product, and most profitable Creative. Sort keys: best/worst product = highest/lowest net profit for the period; best delivery = highest delivery rate (minimum 5 delivered orders); best CPL = lowest CPL (minimum 10 leads); most profitable Creative = highest net profit attributed to that Creative for the period.
- **FR-40:** The owner must be able to record what worked, what failed, useful angles, winning Creatives, supplier/operations lessons, and next-month changes.
- **FR-41:** The system must generate an editable next-month draft with active winners, products to test, testing budget, scaling budget, operations reserve, and profit target. Pre-filled defaults: active winners from current `WINNER` and `SCALING` products; testing budget from the current month's actual testing spend; scaling budget from the current month's scaling spend; profit target carried forward from the current monthly period target. All fields are editable before the new period is saved.

### 5.8 Scale planning, alerts, and tasks

- **FR-42:** For each winning Product, the system must show current and target leads/day, CPL, spend/day, delivered/day, and profit/day.
- **FR-43:** The owner must be able to configure scale stages, initially 10–15, 20, 25, and custom leads/day.
- **FR-44:** The system must calculate capacity utilization as current leads divided by daily lead capacity.
- **FR-45:** The system must generate alerts for high CPL, low delivery, low profit/order, sudden performance drops, low cash, excessive unconfirmed Orders, high returns, and declining Creative performance.
- **FR-46:** The owner must be able to convert a recommendation into a Task with title, Product, priority, due date, status, and source recommendation.

## 6. Metrics and Calculation Rules

```text
CPL = Ad Spend / Leads
Confirmation Rate = Confirmed Orders / Leads
Delivery Rate = Delivered Orders / Confirmed Orders
Return Rate = Returned Orders / Shipped Orders
Profit per Delivered Order = Net Profit / Delivered Orders
Profit per Lead = Net Profit / Leads
AOV = Delivered Revenue / Delivered Orders
ROAS = Delivered Revenue / Ad Spend
Capacity Utilization = Current Leads / Daily Lead Capacity
```

Division by zero must produce an explicit unavailable/— state, not `NaN`, infinity, or a misleading zero. ROAS is available for reference but is not the primary decision metric.

## 7. Information Architecture

Top-level navigation:

```text
Dashboard
Products
Testing
Creatives
Orders
Finance
Analytics
Research
Monthly Review
Settings
```

Analytics aggregates the metrics defined in §6 across configurable time ranges and product/creative dimensions. It has no dedicated FRs beyond what Dashboard (§5.1) and Monthly Review (§5.7) define — its view is a time-filtered projection of those same centralized calculations.

The interface should be clean, fast, desktop-first, responsive, data-dense without clutter, and action-oriented. Status must always use text as well as semantic color: green for healthy/scale, yellow for hold/warning, red for kill/problem, and neutral for draft/archived.

## 8. Data Model and Technical Constraints

### 8.1 Single-owner model

There is one preconfigured owner and one business dataset in version 1. Do not create `users`, memberships, roles, team permissions, or `business_id` columns unless a later scope change requires them. The model should remain easy to extend later, but future multi-user architecture is not a version 1 requirement.

### 8.2 Core Supabase tables

```text
app_settings
monthly_periods
products
product_scores
product_tests
product_status_history
research_items
suppliers
creatives
creative_angles
creative_concepts
creative_hooks
creative_formats
creative_performance
campaigns
ad_sets
ads
ad_performance
leads
orders
order_events
deliveries
returns
financial_transactions
cash_buckets
decision_logs
alerts
tasks
```

Each table should have `id`, `created_at`, and `updated_at`. Use foreign keys for relationships, enums or checked values for statuses, and database constraints where they protect calculation integrity. Preserve status history, decision history, and owner overrides.

### 8.3 Platform direction

- **Frontend and deployment:** A web application deployed on Vercel.
- **Database and storage:** Supabase PostgreSQL and Supabase Storage.
- **Authentication:** None in the application. No sign-up, login, or account screens.
- **Data access:** Prefer server-side Vercel functions/server actions for database mutations. Never expose a Supabase service-role key in browser code.
- **Privacy constraint:** Because version 1 has no in-app authentication, the deployment is intended for private personal use. Public deployment with unrestricted write access is not an acceptable production configuration; any optional deployment-level protection is outside the application requirements. **[NOTE FOR PM]** Before going live, confirm whether deployment-level protection (e.g. Vercel password protection, HTTP basic auth, or IP allowlisting) will be applied. This is outside the application's scope but is the expected mitigation for a public Vercel URL.
- **Business logic:** Centralize KPI formulas, profit calculation, decision evaluation, confidence, and recommendation generation in reusable server-side modules rather than duplicating rules in UI components.

## 9. MVP Scope

### In scope

- Single-owner dashboard and action center.
- Product, research, testing, lifecycle, scoring, and economics.
- Creative library, manual campaign tracking, and CSV import.
- COD order workflow, follow-ups, delivery, and returns.
- Finance transactions, cash buckets, and actual profit.
- Monthly targets, review, lessons, and next-month draft.
- Configurable decision engine with explanations, confidence, overrides, and audit log.
- Alerts, capacity planning, scale stages, and tasks.
- Supabase persistence and Vercel deployment.

### Out of scope

- Authentication and user management.
- Meta Ads, courier, WhatsApp, supplier, payment, or accounting integrations.
- AI features and automated research or creative generation.
- Multi-business, multi-store, team collaboration, or enterprise permissions.
- Automated order calling and external notifications.

## 10. Success Metrics

Success means the owner uses the app as the daily source of truth and can review the business, update operations, and make a Kill/Hold/Scale decision without returning to disconnected spreadsheets.

- Daily review takes less than 10 minutes once data is entered.
- A product can move from test results to an explained decision in one workflow.
- Dashboard KPIs reconcile with the underlying Orders and Financial Transactions.
- Monthly review can be completed without manually rebuilding the report.
- The owner can identify available advertising capital and operational obligations before increasing spend.

Counter-metric: do not optimize for more screens, more automation, or more data entry. A feature is unsuccessful if it increases maintenance burden without improving a decision or operating task.

## 11. Acceptance Criteria

- The app opens directly to the Dashboard without authentication.
- The owner can create a Product, Test, Creative, Order, Transaction, and Monthly Period.
- Product and Creative statuses can be changed manually and their histories are retained.
- Orders can move through the COD workflow, including delivery and return outcomes.
- Dashboard, Product, Creative, Finance, and Monthly metrics use the same centralized calculation rules.
- A Product recommendation contains decision, reasons, confidence, target comparisons, and next action.
- The owner can override a recommendation and see the override in the Decision Log.
- CSV import supports at least campaign/ad performance data and validates malformed rows before import.
- No formula displays `NaN`, infinity, or silent divide-by-zero values.
- The app persists data in Supabase and is deployable on Vercel using environment variables.
- No Supabase service-role secret is shipped to the browser.

## 12. Future Possibilities

Only after the personal MVP is stable, consider Meta Ads synchronization, courier integrations, automated reports, advanced fatigue detection, AI analysis, multi-store support, or team collaboration. These are intentionally not part of the current product contract.
