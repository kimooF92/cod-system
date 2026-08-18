---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - COD E-commerce Growth OS — Product Requirements Document.md
  - _bmad-output/planning-artifacts/architecture/architecture-cod-system-2026-08-18/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-cod-system-2026-08-18/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-cod-system-2026-08-18/EXPERIENCE.md
---

# COD Growth OS - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for COD Growth OS, decomposing the requirements from the PRD, UX Design Spines (DESIGN.md + EXPERIENCE.md), and Architecture Spine (ARCHITECTURE-SPINE.md) into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR-1:** The system must display Cash Available, Ad Spend, Leads, Orders, Delivered Orders, Net Profit, Profit per Delivered Order, and Delivery Rate for the selected period.
- **FR-2:** The system must display a Product Scoreboard with Product, Status, Leads, CPL, Confirmation Rate, Delivery Rate, Profit per Delivered Order, Net Profit, and Decision.
- **FR-3:** The system must rank active winners, products requiring a decision, products currently testing, and archived/killed products in that order unless the owner changes the sort. A product is in the "requiring a decision" state when the Decision Engine has generated a recommendation that has not yet been accepted or overridden by the owner.
- **FR-4:** The system must show clickable recommended actions such as Scale, Hold, Kill, Test Creative, Confirm Orders, and Cash Warning.
- **FR-5:** The system must show the owner’s daily checklist: review performance, handle follow-ups, update numbers, and review decisions.
- **FR-6:** The owner must be able to create and edit Products with name, SKU, selling price, product cost, packaging cost, delivery cost, return cost, other fulfillment cost, target CPL, expected delivery rate, lead capacity, notes, and status.
- **FR-7:** The owner must be able to create Research Items with market, problem, target customer, pain point, promise, competitors, estimated cost, price, margin, creative opportunities, source, notes, and research status.
- **FR-8:** The owner must be able to convert a Research Item into a Product without duplicating information unnecessarily.
- **FR-9:** The owner must be able to create a Test with dates, budget, target leads, target CPL, expected delivery rate, target profit per delivered order, planned creative quantity, and notes.
- **FR-10:** A Test must show spend, leads, CPL, confirmed orders, confirmation rate, delivered orders, delivery rate, revenue, costs, net profit, profit per order, and profit per lead.
- **FR-11:** The owner must be able to manually override Product status; the system must preserve the previous status and timestamp the change.
- **FR-12:** The system must calculate a Product Score from configurable dimensions including CPL, customer interest, confirmation rate, delivery potential, profit per order, creative potential, upsell potential, and competition. The score must be a single composite number on a 0–100 scale with configurable weights and a per-dimension breakdown.
- **FR-13:** The system must recommend `KILL`, `HOLD`, `SCALE`, or `BIG SCALE` for a Product when sufficient performance data exists.
- **FR-14:** A recommendation must consider CPL, confirmation rate, delivery rate, profit per delivered order, sample size, number of observed days, and performance consistency.
- **FR-15:** The system must avoid strong recommendations from tiny samples and must label confidence `LOW`, `MEDIUM`, or `HIGH`. Defaults: 10 leads for MEDIUM, 25 leads + 3 days for HIGH.
- **FR-16:** Every recommendation must include the key metrics, comparison with the configured targets, a plain-language reason, confidence, and suggested next action.
- **FR-17:** The owner must be able to accept or override a recommendation and record an optional reason. Recommendations and overrides must be stored in a Decision Log.
- **FR-18:** The system must distinguish product fatigue from creative fatigue and recommend testing or refreshing creatives before automatically killing a product.
- **FR-19:** The owner must be able to create Creatives with Product, angle, concept, hook, format, script, visual concept, CTA, file/URL, status, and launch date.
- **FR-20:** Creative statuses must include `IDEA`, `IN PRODUCTION`, `READY`, `RUNNING`, `WINNER`, `ITERATE`, `KILL`, and `ARCHIVED`.
- **FR-21:** The owner must be able to maintain reusable lists of hooks, angles, concepts, and formats.
- **FR-22:** The owner must be able to record Creative Performance for spend, impressions, CTR, CPC, leads, CPL, orders, delivered orders, delivery rate, revenue, and profit.
- **FR-23:** The system must recommend `WINNER`, `KEEP`, `ITERATE`, or `KILL` for a Creative and explain the recommendation based on defined target benchmarks.
- **FR-24:** The owner must be able to record Platforms, Campaigns, Ad Sets, and Ads manually and connect them to Products and Creatives.
- **FR-25:** Version 1 must support manual entry and CSV import for advertising performance with client-side column validation before commit.
- **FR-26:** The owner must be able to create and edit Orders with customer name, phone, governorate, address, Product, quantity, unit price, delivery fee, total, source, Creative, Campaign, and relevant dates.
- **FR-27:** The owner must be able to move an Order through confirmation, preparation, shipment, delivery, cancellation, no-answer, and return outcomes.
- **FR-28:** The system must track attempt count, last contact time, next follow-up time, contact result, notes, courier, return reason, and return cost.
- **FR-29:** The Dashboard must surface Orders requiring follow-up today and Orders stuck beyond configurable operational thresholds.
- **FR-30:** The system must calculate confirmation rate, delivery rate, return rate, delivered revenue, and related product/creative breakdowns.
- **FR-31:** The owner must be able to record financial transactions including ad spend, product purchase, delivery cost, return cost, packaging, supplier payment, customer payment, other expense, owner withdrawal, and owner injection.
- **FR-32:** Each transaction must support amount, date, category, Product, Order, and note.
- **FR-33:** The Cash Dashboard must display Total Cash, Advertising Capital, Operations Capital, Profit, Expected COD Receivables, Outstanding Supplier Payments, and Upcoming Expenses.
- **FR-34:** The system must calculate actual Net Profit as Delivered Revenue minus advertising spend, product costs, delivery costs, return costs, packaging, and other relevant costs.
- **FR-35:** The system must show cash warnings when projected ad spend or obligations exceed available capital.
- **FR-36:** The owner must be able to create a Monthly Period with starting cash, profit target, testing budget, scaling budget, operations reserve, emergency reserve, target winners, target products tested, target delivery rate, target CPL, and target profit per order.
- **FR-37:** The Monthly Dashboard must show targets, actuals, progress, products tested, winners, leads, delivered orders, ad spend, revenue, net profit, delivery rate, and average CPL.
- **FR-38:** The system must generate a month-end summary of leads, confirmations, delivered orders, returns, spend, revenue, costs, and actual profit.
- **FR-39:** The system must rank the best/worst product, most profitable product, best delivery product, best CPL product, and most profitable Creative using explicit sort keys.
- **FR-40:** The owner must be able to record what worked, what failed, useful angles, winning Creatives, supplier/operations lessons, and next-month changes.
- **FR-41:** The system must generate an editable next-month draft with active winners, products to test, testing budget, scaling budget, operations reserve, and profit target pre-filled from current performance.
- **FR-42:** For each winning Product, the system must show current and target leads/day, CPL, spend/day, delivered/day, and profit/day.
- **FR-43:** The owner must be able to configure scale stages, initially 10–15, 20, 25, and custom leads/day.
- **FR-44:** The system must calculate capacity utilization as current leads divided by daily lead capacity.
- **FR-45:** The system must generate alerts for high CPL, low delivery, low profit/order, sudden performance drops, low cash, excessive unconfirmed Orders, high returns, and declining Creative performance.
- **FR-46:** The owner must be able to convert a recommendation into a Task with title, Product, priority, due date, status, and source recommendation.

### NonFunctional Requirements

- **NFR-1 (Performance):** Dashboard and core operational views must load initial data in < 200ms.
- **NFR-2 (Calculation Invariant):** Zero division-by-zero errors; safe division utility (`safeDivide`) returns `null` rendered as `—` (em-dash).
- **NFR-3 (Currency Precision):** Tunisian Dinar stored as `numeric(12, 3)` in PostgreSQL and displayed with monospace tabular numbers (`font-variant-numeric: tabular-nums`).
- **NFR-4 (Audit Trail):** Status histories (`product_status_history`, `decision_logs`, `order_events`) are append-only.
- **NFR-5 (Single-Tenant Security):** Direct single-operator deployment on Vercel + Supabase without in-app auth wall; deployment-level protection (HTTP basic auth) applied at Vercel layer.

### Additional Requirements

- **ARCH-1:** Tech stack foundation: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Supabase PostgreSQL.
- **ARCH-2:** Pure TypeScript calculation core in `src/lib/engine/` (zero external DB/network dependencies) for all formulas, decision algorithms, and scoring models.
- **ARCH-3:** 22 Supabase PostgreSQL tables with foreign keys and database constraints located in `supabase/migrations/`.
- **ARCH-4:** Next.js Server Actions with Zod validation in `src/actions/` and optimistic state updates for rapid COD triage.
- **ARCH-5:** In-browser PapaParse CSV parsing with pre-commit validation for Meta Ads performance reports.

### UX Design Requirements

- **UX-DR-1:** Design token implementation in Tailwind CSS (matte Zinc/Slate surfaces, semantic Emerald `#10B981`, Amber `#F59E0B`, Crimson `#EF4444`, Blue `#3B82F6`).
- **UX-DR-2:** Ban on AI gradient slop — clean solid surfaces, crisp 1px borders, tabular mono figures for all metrics.
- **UX-DR-3:** Morning Review Habit Checklist component with interactive check-offs and "All Clean for Today ✨" streak state.
- **UX-DR-4:** Decision Inbox badge on Dashboard Scoreboard with 1-click Accept / Override modal.
- **UX-DR-5:** High-density COD Order table with inline status dropdown, past-due follow-up color indicators, and 1-click WhatsApp copy/launch.
- **UX-DR-6:** Desktop-first 240px collapsible sidebar navigation across all 10 PRD surfaces with keyboard shortcuts (`g d`, `g o`, `g p`, etc.).

### FR Coverage Map

- **FR-1:** Epic 6 - Dashboard & Checklist (Display period KPIs: Cash, Spend, Leads, Orders, Delivered, Profit, Delivery Rate)
- **FR-2:** Epic 6 - Dashboard & Checklist (Product Scoreboard with metrics and decision status)
- **FR-3:** Epic 6 - Dashboard & Checklist (Ranking active winners, products requiring decision, testing, archived)
- **FR-4:** Epic 6 - Dashboard & Checklist (Clickable recommended action center)
- **FR-5:** Epic 6 - Dashboard & Checklist (Daily habit operating checklist)
- **FR-6:** Epic 1 - Product Research & Testing (Create/edit products with full unit economics)
- **FR-7:** Epic 1 - Product Research & Testing (Create and manage research items)
- **FR-8:** Epic 1 - Product Research & Testing (1-click convert research item to product)
- **FR-9:** Epic 1 - Product Research & Testing (Create product test with budget and target metrics)
- **FR-10:** Epic 1 - Product Research & Testing (Test performance tracking and benchmark comparison)
- **FR-11:** Epic 1 - Product Research & Testing (Manual product status override with timestamped audit history)
- **FR-12:** Epic 1 - Product Research & Testing (0–100 composite Product Scoring model)
- **FR-13:** Epic 4 - Decision Engine & Scale Planning (Recommend KILL, HOLD, SCALE, BIG SCALE based on data)
- **FR-14:** Epic 4 - Decision Engine & Scale Planning (Multi-factor evaluation: CPL, confirmation, delivery, consistency)
- **FR-15:** Epic 4 - Decision Engine & Scale Planning (Confidence labeling with minimum sample thresholds)
- **FR-16:** Epic 4 - Decision Engine & Scale Planning (Structured recommendation cards with metrics, targets, and rationale)
- **FR-17:** Epic 4 - Decision Engine & Scale Planning (Accept/override recommendation workflow with Decision Log)
- **FR-18:** Epic 4 - Decision Engine & Scale Planning (Distinguish product fatigue from creative fatigue)
- **FR-19:** Epic 2 - Creative Library & Ad Performance (Create and manage creative cards with hooks, angles, scripts)
- **FR-20:** Epic 2 - Creative Library & Ad Performance (Creative lifecycle statuses IDEA..ARCHIVED)
- **FR-21:** Epic 2 - Creative Library & Ad Performance (Reusable angles, concepts, hooks, and formats registry)
- **FR-22:** Epic 2 - Creative Library & Ad Performance (Creative performance tracking: CTR, CPC, CPL, delivery rate, profit)
- **FR-23:** Epic 2 - Creative Library & Ad Performance (Automated WINNER, KEEP, ITERATE, KILL creative recommendations)
- **FR-24:** Epic 2 - Creative Library & Ad Performance (Campaign, ad set, and ad hierarchy linked to products & creatives)
- **FR-25:** Epic 2 - Creative Library & Ad Performance (Manual entry and Meta Ads CSV performance import)
- **FR-26:** Epic 3 - COD Order Operations (Create/edit COD orders with customer info, governorate, and products)
- **FR-27:** Epic 3 - COD Order Operations (Order state transitions: NEW..CONTACTING..DELIVERED/RETURNED)
- **FR-28:** Epic 3 - COD Order Operations (Call attempt logging, follow-up scheduler, courier & return reason tracking)
- **FR-29:** Epic 3 - COD Order Operations (Follow-up today view and stuck order alerts)
- **FR-30:** Epic 3 - COD Order Operations (Operational rates: confirmation rate, delivery rate, return rate, delivered revenue)
- **FR-31:** Epic 5 - Finance & Cash Control (Record financial transactions: ad spend, stock purchase, courier, profit)
- **FR-32:** Epic 5 - Finance & Cash Control (Transaction categorization, product/order linkage, and notes)
- **FR-33:** Epic 5 - Finance & Cash Control (Cash dashboard with Advertising Capital, Ops Reserve, Profit Vault, receivables)
- **FR-34:** Epic 5 - Finance & Cash Control (Delivered Net Profit calculation reconciling all direct/indirect costs)
- **FR-35:** Epic 5 - Finance & Cash Control (Proactive low cash and runway alert warnings)
- **FR-36:** Epic 7 - Monthly Review & Analytics (Create monthly periods with targets and capital allocations)
- **FR-37:** Epic 7 - Monthly Review & Analytics (Monthly dashboard tracking targets vs actuals)
- **FR-38:** Epic 7 - Monthly Review & Analytics (Month-end financial and operational summary generation)
- **FR-39:** Epic 7 - Monthly Review & Analytics (Best/worst rankings for products and creatives by profit/rates)
- **FR-40:** Epic 7 - Monthly Review & Analytics (Qualitative lessons learned & strategy changes log)
- **FR-41:** Epic 7 - Monthly Review & Analytics (Editable next-month draft generation pre-filled from performance)
- **FR-42:** Epic 4 - Decision Engine & Scale Planning (Winning product scale dashboard: target leads/day, spend, delivered/day)
- **FR-43:** Epic 4 - Decision Engine & Scale Planning (Configurable scale stages: 10–15, 20, 25 leads/day)
- **FR-44:** Epic 4 - Decision Engine & Scale Planning (Capacity utilization metric calculation)
- **FR-45:** Epic 6 - Dashboard & Checklist (System-wide alerts for CPL spike, low delivery, low cash, aging orders)
- **FR-46:** Epic 4 - Decision Engine & Scale Planning (Convert recommendation into a prioritized Task)

## Epic List

### Epic 1: Product Research & Testing Catalog
The operator can research new product concepts, convert them into managed products with custom unit economics (cost, price, packaging, delivery), define testing parameters (budget, target CPL, lead goals), and compute comprehensive 0–100 Product Scores.
**FRs covered:** FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-12

### Epic 2: Creative Library & Ad Performance Tracking
The operator can catalog marketing angles, hooks, scripts, and creative assets, track campaign spend and lead generation manually or via Meta Ads CSV import, and receive automated Winner/Keep/Iterate/Kill creative recommendations.
**FRs covered:** FR-19, FR-20, FR-21, FR-22, FR-23, FR-24, FR-25

### Epic 3: COD Order Operations & Customer Confirmation Pipeline
The operator can manage the complete cash-on-delivery order lifecycle from intake to delivery/return, conduct customer phone confirmations with 1-click WhatsApp messaging, manage follow-up scheduling for no-answers, and record courier delivery reconciliation.
**FRs covered:** FR-26, FR-27, FR-28, FR-29, FR-30

### Epic 4: Decision Engine & Scale Planning
The operator receives objective, confidence-rated Kill/Hold/Scale/Big Scale recommendations backed by real delivery economics, can accept or override decisions with an audit log, distinguish creative vs product fatigue, plan lead scaling stages (10–25 leads/day), and convert decisions into actionable tasks.
**FRs covered:** FR-13, FR-14, FR-15, FR-16, FR-17, FR-18, FR-42, FR-43, FR-44, FR-46

### Epic 5: Finance Ledger & Cash Control Buckets
The operator tracks all business cash movements across Advertising Capital, Operations Reserve, and Profit Vault, monitors delivered revenue vs actual expenses, receives low-cash warnings, and sees true delivered net profit.
**FRs covered:** FR-31, FR-32, FR-33, FR-34, FR-35

### Epic 6: Operator Dashboard, Daily Habit Checklist & System Alerts
The operator begins each day with an interactive Action Center featuring real-time business KPIs, a 4-step Morning Review Checklist with streak rewards, an active Product Scoreboard, and proactive anomaly alerts (CPL spikes, low delivery, unconfirmed order buildup).
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-45

### Epic 7: Monthly Review, Business Analytics & Planning Drafts
The operator closes each operating month with Targets vs Actuals reconciliation, automated best/worst product and creative rankings, recorded strategic lessons, and an auto-generated, editable budget draft for the next month.
**FRs covered:** FR-36, FR-37, FR-38, FR-39, FR-40, FR-41

---

## Epic 1: Product Research & Testing Catalog

Goal: Enable the operator to research new product opportunities, manage products with exact unit economics, run bounded testing campaigns with KPI benchmarks, and compute multi-dimensional 0–100 Product Scores.

### Story 1.1: Project Setup & Design System Foundation

As an e-commerce operator,
I want a clean, responsive application shell with dark/light theme tokens and keyboard navigation,
So that I have a fast, zero-distraction workspace for daily management.

**Acceptance Criteria:**
- **Given** a fresh Next.js 15 App Router project with TypeScript and Tailwind CSS
- **When** the application is loaded
- **Then** the layout displays the collapsible 240px sidebar with navigation links to all 10 PRD surfaces (`Dashboard`, `Products`, `Testing`, `Creatives`, `Orders`, `Finance`, `Analytics`, `Research`, `Monthly Review`, `Settings`)
- **And** the styling uses the solid matte Zinc/Slate design tokens from `DESIGN.md` (no decorative AI gradients)
- **And** financial and percentage figures render with `font-variant-numeric: tabular-nums` in `JetBrains Mono` / `SF Mono`
- **And** keyboard shortcuts (`g d`, `g p`, `g o`, `g f`, `g m`) navigate to their respective surfaces.

### Story 1.2: Research Items & Problem/Promise Evaluation

As an e-commerce operator,
I want to log and evaluate product research ideas with market notes and estimated margins,
So that I maintain a structured backlog of potential products before committing testing capital.

**Acceptance Criteria:**
- **Given** the Research surface (`/research`)
- **When** I fill out the research form with market, problem, target customer, pain point, promise, competitors, estimated cost, estimated price, creative angles, source, and notes
- **Then** a new record is created in the `research_items` table with initial status `IDEA`
- **And** the research list displays all items with filterable status tabs (`IDEA`, `VALIDATING`, `READY_FOR_TEST`, `DISCARDED`)
- **And** estimated gross margin percentage is automatically calculated and displayed.

### Story 1.3: Product Catalog & Unit Economics Management

As an e-commerce operator,
I want to create and edit products with granular unit cost parameters and convert research items into products in 1 click,
So that every product has precise economic baselines for profit calculations.

**Acceptance Criteria:**
- **Given** a research item in `READY_FOR_TEST` status
- **When** I click "Convert to Product"
- **Then** a product creation form pre-fills with the research item's name, estimated cost, price, and notes without data loss
- **And** I can specify SKU, selling price, product cost, packaging cost, delivery cost, return cost, target CPL, expected delivery rate, and daily lead capacity
- **And** saving inserts a row into `products` and marks the research item as converted
- **And** all currency values are saved with 3-decimal precision (`numeric(12, 3)` DT) in PostgreSQL.

### Story 1.4: Product Lifecycle State Machine & Audit History

As an e-commerce operator,
I want to manually change a product's lifecycle status and see its historical transitions,
So that I have a reliable audit trail of product progression from testing to winner or killed.

**Acceptance Criteria:**
- **Given** an existing product on the `/products` view
- **When** I select a new status from the lifecycle dropdown (`IDEA`, `RESEARCH`, `READY`, `TESTING`, `HOLD`, `KILL`, `WINNER`, `SCALING`, `FATIGUED`, `ARCHIVED`)
- **Then** the product status updates optimistically in the UI
- **And** an append-only row is inserted into `product_status_history` containing `product_id`, `previous_status`, `new_status`, `reason`, and `created_at`
- **And** the product detail page renders a chronological timeline of all status changes.

### Story 1.5: Bounded Product Testing & Performance Benchmarks

As an e-commerce operator,
I want to define bounded test parameters (budget, target leads, target CPL) for a product and track actual performance vs targets,
So that I know immediately whether a test is succeeding or failing against its goals.

**Acceptance Criteria:**
- **Given** a product in `READY` or `TESTING` status
- **When** I create a Test on `/testing` with start/end dates, testing budget, target leads, target CPL, expected delivery rate, and target profit/delivered order
- **Then** a row is saved in `product_tests`
- **And** the Test view calculates actual spend, leads, actual CPL, confirmation rate, delivery rate, delivered revenue, total costs, net profit, and profit per order/lead
- **And** if leads or orders are 0, the safe division utility (`safeDivide`) returns `null` rendered as `—` (no `NaN` or `Infinity`).

### Story 1.6: Multi-Dimensional 0–100 Product Scoring Engine

As an e-commerce operator,
I want the system to calculate a 0–100 composite Product Score with per-dimension breakdowns,
So that I can objectively compare products on economic and operational potential.

**Acceptance Criteria:**
- **Given** a product with performance data and configured dimension weights
- **When** the scoring engine (`src/lib/engine/scoring.ts`) executes
- **Then** it computes a composite score (0–100) based on CPL score, confirmation rate, delivery rate, profit per order, creative potential, and competition
- **And** the product detail page displays the composite score alongside a progress bar for each sub-dimension
- **And** changing dimension weights in Settings recalculates scores deterministically without modifying database records.

---

## Epic 2: Creative Library & Ad Performance Tracking

Goal: Enable the operator to organize creative assets (hooks, angles, scripts), track ad spend and lead generation manually or via Meta Ads CSV import, and receive automated creative recommendations.

### Story 2.1: Marketing Angles, Hooks & Formats Registry

As an e-commerce operator,
I want to maintain reusable repositories of hooks, angles, concepts, and ad formats,
So that I can quickly assemble new creatives without starting from scratch.

**Acceptance Criteria:**
- **Given** the Creative settings/library view (`/creatives`)
- **When** I add or edit entries in `creative_angles`, `creative_concepts`, `creative_hooks`, and `creative_formats`
- **Then** each item is saved and available in the creative creation dropdowns
- **And** I can view a list of all hooks and angles filtered by product category.

### Story 2.2: Creative Asset Library & Lifecycle Management

As an e-commerce operator,
I want to catalog marketing creatives with angle/hook tags, scripts, and status,
So that I have full visibility into what creative concepts are in production, running, or archived.

**Acceptance Criteria:**
- **Given** a product
- **When** I create a Creative with angle, concept, hook, format, script text, visual description, CTA, media URL, launch date, and status (`IDEA`, `IN PRODUCTION`, `READY`, `RUNNING`, `WINNER`, `ITERATE`, `KILL`, `ARCHIVED`)
- **Then** the record is stored in `creatives`
- **And** the Creatives view displays cards with clear status badges and thumbnail/script previews.

### Story 2.3: Campaign & Ad Structure Mapping

As an e-commerce operator,
I want to record marketing campaigns, ad sets, and ads linked to products and creatives,
So that ad performance data can be attributed directly to specific products and creatives.

**Acceptance Criteria:**
- **Given** active creatives and products
- **When** I register a Campaign, Ad Set, and Ad linking platform (e.g. Meta Ads), product ID, and creative ID
- **Then** records are saved in `campaigns`, `ad_sets`, and `ads`
- **And** the hierarchy is navigable from Campaign down to individual Ads.

### Story 2.4: Ad Performance Tracking & Meta Ads CSV Import

As an e-commerce operator,
I want to upload Meta Ads performance CSV export files with in-browser validation,
So that I can update daily spend, impressions, clicks, and leads without manual entry.

**Acceptance Criteria:**
- **Given** a Meta Ads Manager performance export CSV file
- **When** I drop the file into the CSV Import Drawer on `/creatives` or `/dashboard`
- **Then** PapaParse parses the file in-browser and Zod verifies the presence of required columns (`date`, `campaign_name`, `ad_set_name`, `ad_name`, `spend`, `impressions`, `clicks`, `leads`)
- **And** invalid rows display row-level error messages before any database write occurs
- **And** clicking "Confirm & Import" performs a batched upsert into `ad_performance`
- **And** manual performance entry remains fully supported for single-day quick edits.

### Story 2.5: Automated Creative Recommendation Engine

As an e-commerce operator,
I want automated WINNER, KEEP, ITERATE, or KILL recommendations for each creative,
So that I know which visual concepts to scale and which to stop.

**Acceptance Criteria:**
- **Given** a creative with recorded performance data
- **When** the creative decision engine (`src/lib/engine/decision.ts`) runs
- **Then** it recommends `WINNER` if CPL ≤ target and delivery rate ≥ target over minimum sample leads
- **And** recommends `ITERATE` if CPL > target but CTR/engagement signals are high
- **And** recommends `KILL` if CPL is persistently above target after sufficient sample size
- **And** each recommendation displays a plain-language explanation and target comparison.

---

## Epic 3: COD Order Operations & Customer Confirmation Pipeline

Goal: Enable the operator to execute the daily cash-on-delivery order workflow, conduct customer phone confirmations with 1-click WhatsApp messaging, manage follow-up scheduling, and track courier delivery outcomes.

### Story 3.1: COD Order Intake & Manual Entry

As an e-commerce operator,
I want to quickly create and edit COD orders with customer contact and governorate details,
So that every customer inquiry is captured with complete fulfillment information.

**Acceptance Criteria:**
- **Given** the Orders view (`/orders`)
- **When** I click "New Order" or press shortcut `c`
- **Then** a modal opens allowing entry of customer name, phone number (`+216` Tunisian format), Tunisian governorate dropdown, delivery address, product, quantity, unit price, delivery fee, source, and optional campaign/creative link
- **And** total order amount is calculated automatically
- **And** saving inserts a row into `orders` with initial status `NEW`.

### Story 3.2: High-Density Order Triage Table with WhatsApp Actions

As an e-commerce operator,
I want a compact, keyboard-navigable order table with 1-click WhatsApp direct links and instant status updates,
So that I can call and confirm 20+ orders in under 15 minutes.

**Acceptance Criteria:**
- **Given** the active order table on `/orders`
- **When** I click on the customer's phone number
- **Then** it provides 1-click copy and opens a direct WhatsApp Web link (`https://wa.me/216...`)
- **And** changing the inline status dropdown (`NEW`, `CONTACTING`, `CONFIRMED`, `CANCELLED`, `NO ANSWER`) updates the database via a Server Action with optimistic UI reflection
- **And** the status pill immediately adopts the semantic color (e.g. green for `CONFIRMED`, amber for `CONTACTING`, red for `CANCELLED`).

### Story 3.3: Follow-Up Scheduler & Call Attempt Logging

As an e-commerce operator,
I want to log call attempts and schedule follow-up dates for unreachable customers,
So that no customer inquiry is forgotten or dropped.

**Acceptance Criteria:**
- **Given** an order in `CONTACTING` or `NO ANSWER` status
- **When** I log a call outcome and pick a next follow-up date/time
- **Then** `attempt_count` increments, `last_contact_at` updates, and `next_follow_up_at` is set
- **And** an append-only row is logged in `order_events`
- **And** orders with follow-ups scheduled for today (or past due) display an amber badge and sort to the top of the "Follow-up Today" tab.

### Story 3.4: Courier Delivery & Return Outcome Reconciliation

As an e-commerce operator,
I want to record courier assignments, delivered orders, and returned packages with return reasons and costs,
So that inventory and cash receivables reconcile accurately with courier manifests.

**Acceptance Criteria:**
- **Given** confirmed orders
- **When** I update an order to `SHIPPED`, `DELIVERED`, or `RETURNED`
- **Then** courier name, tracking code, delivery date, return reason, and return fee are recorded in `deliveries` / `returns`
- **And** marking an order `DELIVERED` flags it as eligible for delivered revenue in cash reports
- **And** marking an order `RETURNED` attributes return cost to the product's true profit calculation.

### Story 3.5: Operational Rates & Performance Calculations

As an e-commerce operator,
I want the system to calculate Confirmation Rate, Delivery Rate, Return Rate, and Delivered Revenue per product,
So that I have live operational metrics reflecting real fulfillment performance.

**Acceptance Criteria:**
- **Given** order records across different statuses
- **When** operational metrics are computed
- **Then** Confirmation Rate = `Confirmed Orders / Leads`
- **And** Delivery Rate = `Delivered Orders / Confirmed Orders`
- **And** Return Rate = `Returned Orders / Shipped Orders`
- **And** metrics update in real-time on product and operational summary views.

---

## Epic 4: Decision Engine & Scale Planning

Goal: Provide objective, confidence-rated Kill/Hold/Scale/Big Scale recommendations backed by delivery economics, enable audit-logged accept/override decisions, distinguish fatigue types, and manage lead scaling stages.

### Story 4.1: Multi-Factor Product Decision Engine

As an e-commerce operator,
I want the system to evaluate product performance against target economics and generate Kill, Hold, Scale, or Big Scale recommendations,
So that I make objective scaling decisions without emotional bias.

**Acceptance Criteria:**
- **Given** a product with active testing or scaling data
- **When** the Decision Engine (`src/lib/engine/decision.ts`) evaluates the product
- **Then** it generates `SCALE` if CPL ≤ target, delivery rate ≥ target, and profit/delivered order is healthy over sufficient sample size
- **And** generates `HOLD` if metrics are promising but sample size or consistency is insufficient
- **And** generates `KILL` if delivery rate is persistently low or profit per order is negative after sufficient data
- **And** generates `BIG SCALE` if scale performance is stable over multiple consecutive periods
- **And** labels confidence as `LOW` (< 10 leads), `MEDIUM` (10–24 leads), or `HIGH` (25+ leads over 3+ days).

### Story 4.2: Decision Inbox, Override Workflow & Audit Log

As an e-commerce operator,
I want to review recommendations in a Decision Inbox and accept or override them with an explanation,
So that my operational judgment is preserved in an immutable Decision Log.

**Acceptance Criteria:**
- **Given** products with pending recommendations
- **When** I view the Decision card on the product screen or Dashboard
- **Then** I can click "Accept Recommendation" (which updates product status and logs the event)
- **Or** click "Override" to select a different status and submit an optional reason
- **And** an append-only row is saved in `decision_logs` with `product_id`, `recommendation`, `confidence`, `action_taken`, `reason`, and `metrics_snapshot`
- **And** the pending decision badge clears ("Zero Inbox").

### Story 4.3: Creative vs Product Fatigue Detector

As an e-commerce operator,
I want the system to distinguish between creative fatigue and product fatigue,
So that I don't prematurely kill a winning product when only the ad creative is worn out.

**Acceptance Criteria:**
- **Given** a product in `WINNER` or `SCALING` status experiencing rising CPL or dropping CTR
- **When** historical delivery rate and confirmation rate remain healthy
- **Then** the engine flags `CREATIVE_FATIGUE` instead of recommending `KILL`
- **And** surfaces an action card: *"Product economics remain strong. Test 2-3 new creative hooks before pausing product."*

### Story 4.4: Winning Product Scale Planner & Capacity Utilization

As an e-commerce operator,
I want to plan scaling stages (10–15, 20, 25 leads/day) and monitor daily lead capacity utilization,
So that I can scale ad spend safely without overwhelming confirmation or courier capacity.

**Acceptance Criteria:**
- **Given** a product in `WINNER` or `SCALING` status
- **When** I view the Scale Planning card on the product page
- **Then** it displays current leads/day, target leads/day, required ad spend/day, projected delivered orders/day, and projected profit/day across configured scale stages (10–15, 20, 25, custom leads/day)
- **And** Capacity Utilization is computed as `Current Leads / Daily Lead Capacity` with a visual warning if utilization > 90%.

### Story 4.5: Recommendation-to-Task Conversion

As an e-commerce operator,
I want to convert any recommendation or alert into a prioritized task with a due date,
So that I can track operational follow-through on my decisions.

**Acceptance Criteria:**
- **Given** an active recommendation or system alert
- **When** I click "Create Task"
- **Then** a task modal opens pre-filled with title, product link, priority (`HIGH`, `MEDIUM`, `LOW`), due date, and source recommendation
- **And** the task appears in the Tasks drawer and Dashboard daily action list
- **And** marking the task complete archives it.

---

## Epic 5: Finance Ledger & Cash Control Buckets

Goal: Track all cash movements across Advertising Capital, Operations Reserve, and Profit Vault, record expenses, monitor receivables, and receive low-cash warnings.

### Story 5.1: Operating Financial Ledger & Transaction Drawer

As an e-commerce operator,
I want to record financial transactions with category, amount, and product/order links,
So that I have an exact, categorized record of every dinar entering or leaving the business.

**Acceptance Criteria:**
- **Given** the Finance view (`/finance`)
- **When** I record a transaction with date, amount, category (`AD_SPEND`, `PRODUCT_PURCHASE`, `DELIVERY_FEE`, `RETURN_FEE`, `PACKAGING`, `SUPPLIER_PAYMENT`, `CUSTOMER_PAYMENT`, `OTHER_EXPENSE`, `OWNER_WITHDRAWAL`, `OWNER_INJECTION`), product link, and note
- **Then** the record is saved to `financial_transactions`
- **And** the ledger displays a filterable table of all transactions with running totals.

### Story 5.2: Cash Buckets & Liquidity Cockpit

As an e-commerce operator,
I want to see my available cash separated into Advertising Capital, Operations Reserve, and Profit Vault,
So that I never accidentally spend operational reserves or profit on ad testing.

**Acceptance Criteria:**
- **Given** financial transaction records
- **When** I open the Cash Dashboard on `/finance`
- **Then** it displays Total Available Cash, Advertising Capital, Operations Reserve, and Profit Vault balances derived from the ledger
- **And** shows Expected COD Receivables (delivered orders not yet paid out by couriers) and Outstanding Supplier Payables
- **And** allows reallocating cash between buckets via a logged transfer transaction.

### Story 5.3: True Delivered Net Profit Calculation Engine

As an e-commerce operator,
I want the system to calculate true delivered net profit reconciling all ad, product, courier, return, and packaging expenses,
So that I know my actual bankable profit rather than vanity revenue.

**Acceptance Criteria:**
- **Given** delivered orders and financial expenses for a selected date range
- **When** the profit engine (`src/lib/engine/calculations.ts`) executes
- **Then** Net Profit = `Delivered Revenue - (Ad Spend + Product Cost + Delivery Cost + Return Cost + Packaging + Other Expenses)`
- **And** Profit per Delivered Order = `Net Profit / Delivered Orders`
- **And** Profit per Lead = `Net Profit / Leads`
- **And** all metrics handle zero denominators safely with `safeDivide`.

### Story 5.4: Cash Safety & Runway Alert Warnings

As an e-commerce operator,
I want to receive prominent cash warning alerts when projected ad spend exceeds safe liquidity reserves,
So that I prevent cash-flow dry-up while orders are in transit.

**Acceptance Criteria:**
- **Given** current Advertising Capital and average daily ad spend
- **When** available ad cash is less than 3 days of average daily spend
- **Then** an amber Cash Warning banner appears on the Dashboard and Finance page
- **And** the warning displays remaining runway days and recommends reducing testing spend or injecting capital.

---

## Epic 6: Operator Dashboard, Daily Habit Checklist & System Alerts

Goal: Provide the operator with an executive morning cockpit featuring real-time KPIs, a 4-step daily operating checklist with streak rewards, a live Product Scoreboard, and proactive anomaly alerts.

### Story 6.1: Executive KPI Cards & Period Time Filters

As an e-commerce operator,
I want to open the Dashboard and immediately see my core business KPIs for Today, Yesterday, or custom date ranges,
So that I can evaluate daily performance in under 30 seconds.

**Acceptance Criteria:**
- **Given** the Dashboard (`/`)
- **When** I select a date filter (Today, Yesterday, Last 7 Days, This Week, This Month, Custom)
- **Then** KPI stat cards display Cash Available, Ad Spend, Leads, Orders, Delivered Orders, Net Profit, Profit/Delivered Order, and Delivery Rate
- **And** each stat card shows comparison deltas vs targets or prior period
- **And** initial page load completes in < 200ms (`NFR-1`).

### Story 6.2: Product Scoreboard & Status Ranker

As an e-commerce operator,
I want a live Product Scoreboard ranking active winners, products requiring decisions, testing items, and killed products,
So that my highest-priority products are immediately visible at the top.

**Acceptance Criteria:**
- **Given** active products in the system
- **When** the Dashboard renders
- **Then** the Product Scoreboard displays Product Name, Status Pill, Leads, CPL, Confirmation Rate, Delivery Rate, Profit/Delivered Order, Net Profit, and Decision Recommendation
- **And** products are sorted by default in priority order: `Active Winners` → `Requiring Decision` → `Testing` → `Archived/Killed`
- **And** clicking any product row navigates directly to its detail and economics view.

### Story 6.3: Morning Review Habit Checklist with Streak Reward

As an e-commerce operator,
I want an interactive 4-step daily checklist that tracks my operational completion and displays a satisfaction streak state,
So that I maintain daily operating discipline and never miss follow-ups or reviews.

**Acceptance Criteria:**
- **Given** the Dashboard viewport
- **When** I start my morning review
- **Then** the checklist displays 4 interactive items:
  1. `[ ] Review yesterday spend & delivered profit`
  2. `[ ] Process pending order confirmations & follow-ups`
  3. `[ ] Update courier delivered / returned status`
  4. `[ ] Review Kill / Hold / Scale recommendations`
- **And** clicking an item navigates to the relevant screen or toggles its complete state with a tactile checkmark
- **And** completing all 4 items transitions the widget into the "All operations clean for today ✨" state with a daily review streak counter (`🔥 N-day streak`).

### Story 6.4: Proactive Anomaly Alerts & Action Hub

As an e-commerce operator,
I want system alerts for CPL spikes, low delivery rates, aging unconfirmed orders, and creative fatigue,
So that I can resolve operational bottlenecks before they drain profit.

**Acceptance Criteria:**
- **Given** operational and ad performance data
- **When** an anomaly condition occurs (e.g. CPL > 1.5x target, delivery rate < 50%, 5+ orders unconfirmed > 24h)
- **Then** an alert badge and clickable action card appear in the Dashboard Action Center (`FR-4`, `FR-45`)
- **And** clicking the action card navigates directly to the filtered view (e.g. "Confirm 5 Aging Orders").

---

## Epic 7: Monthly Review, Business Analytics & Planning Drafts

Goal: Enable the operator to close each month with Targets vs Actuals reconciliation, automated best/worst product/creative rankings, qualitative lessons learned, and an auto-generated editable budget draft for the next month.

### Story 7.1: Monthly Period Setup & Target Allocation

As an e-commerce operator,
I want to create a monthly period with starting capital, testing/scaling budgets, and target KPIs,
So that I have clear operational boundaries and targets for the month.

**Acceptance Criteria:**
- **Given** the Monthly Review surface (`/monthly-review`)
- **When** I create a Monthly Period with starting cash, profit target, testing budget, scaling budget, operations reserve, emergency reserve, target winners, target tested products, target delivery rate, target CPL, and target profit/order
- **Then** the period is stored in `monthly_periods`
- **And** serves as the benchmark container for monthly reporting.

### Story 7.2: Monthly Performance Dashboard & Month-End Summary

As an e-commerce operator,
I want to compare monthly actuals against targets in a unified dashboard and generate a month-end summary,
So that I can see whether I hit my monthly profit target and operational goals.

**Acceptance Criteria:**
- **Given** an active or past Monthly Period
- **When** I view the Monthly Dashboard
- **Then** it shows progress bars and actual vs target metrics for Products Tested, Winners Found, Leads, Delivered Orders, Ad Spend, Revenue, Net Profit, Delivery Rate, and Average CPL
- **And** clicking "Close Month" generates a locked month-end financial summary reconciling all revenue and expenses.

### Story 7.3: Automated Performance Rankings & Strategic Lessons Log

As an e-commerce operator,
I want automated rankings of my best/worst products and creatives alongside a lessons-learned log,
So that I can extract strategic insights for future product testing.

**Acceptance Criteria:**
- **Given** completed monthly data
- **When** the month-end rankings evaluate (`FR-39`)
- **Then** the system identifies:
  - Best Product & Worst Product (by Net Profit)
  - Best Delivery Product (highest delivery rate with min 5 delivered orders)
  - Best CPL Product (lowest CPL with min 10 leads)
  - Most Profitable Creative (highest net profit attributed)
- **And** provides an editable form to record what worked, what failed, winning angles, supplier notes, and planned operational changes (`FR-40`).

### Story 7.4: Next-Month Draft Generator

As an e-commerce operator,
I want the system to auto-generate an editable draft for the next month pre-filling active winners and budget allocations,
So that planning the next month takes less than 2 minutes.

**Acceptance Criteria:**
- **Given** a closed or active monthly period
- **When** I click "Generate Next Month Plan" (`FR-41`)
- **Then** the system drafts a new period pre-filling active winners (current `WINNER` and `SCALING` products), testing budget (from actual current testing spend), scaling budget (from actual scaling spend), and profit target
- **And** all fields remain fully editable before saving the new period.

### Story 7.5: Historical Analytics & Trend Projections

As an e-commerce operator,
I want to view multi-period trend charts for Delivered ROAS, CPL trends, Delivery Rates by Governorate, and Creative ROI,
So that I can analyze long-term business trajectory.

**Acceptance Criteria:**
- **Given** historical performance data on `/analytics`
- **When** I select date ranges and metric dimensions
- **Then** the analytics engine renders time-series charts for CPL trends, Delivered ROAS, and Delivery Rate by Tunisian Governorate
- **And** all metrics use centralized calculations from `src/lib/engine/calculations.ts` without client-side formula duplication.
