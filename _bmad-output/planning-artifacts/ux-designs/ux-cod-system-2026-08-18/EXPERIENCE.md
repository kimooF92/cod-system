---
name: COD Growth OS
status: ready-for-dev
sources:
  - {project-root}/COD E-commerce Growth OS — Product Requirements Document.md
updated: 2026-08-18
---

# COD Growth OS — Experience Spine (EXPERIENCE.md)

## 1. Foundation

- **Platform**: Desktop-first web application deployed on Vercel with responsive mobile check-in views.
- **UI Architecture**: shadcn/ui component primitives paired with Tailwind CSS and the visual token contract defined in `DESIGN.md`.
- **Operator Model**: Single-operator system. Zero login wall or friction — opens directly to the active day's operational cockpit.
- **Core Loop**: Research → Test → Measure → Kill/Hold/Scale → Winner → Scale → Profit → Reinvest → Test again.

---

## 2. Information Architecture (IA)

| Surface | Shortcut | Purpose & Core Content |
|---|---|---|
| **Dashboard** | `g d` / Home | Daily operating center: Cash, Spend, Leads, Net Profit, Daily Checklist, Product Scoreboard, Decision Inbox |
| **Products** | `g p` | Lifecycle manager (`IDEA` → `TESTING` → `WINNER` → `SCALING` → `ARCHIVED`), Product Score (0–100), unit economics |
| **Testing** | `g t` | Bounded product test manager: Spend vs Target CPL, Confirmation & Delivery rate benchmarks |
| **Creatives** | `g c` | Angle/Concept/Hook/Format card library, Creative Performance tracking, Winner/Iterate/Kill recommendation |
| **Orders** | `g o` | COD operational pipeline: confirmation call log, follow-up scheduler, delivery/return status tracker |
| **Finance** | `g f` | Cash control cockpit: Ad Capital, Operations Reserve, Profit Vault, manual transaction entry |
| **Analytics** | `g a` | Historical trends: Delivered ROAS, CPL over time, Delivery Rate by Governorate, Creative ROI |
| **Research** | `g r` | Market research intake, problem/pain-point validator, 1-click "Convert to Product" action |
| **Monthly Review** | `g m` | Month-end close: Targets vs Actuals, rankings (Best Product, Best Creative), auto-drafted next-month budget |
| **Settings** | `g s` | Configurable thresholds: Decision Engine sample sizes (10 / 25 leads), target delivery rates, default costs |

---

## 3. Retention & Daily Ritual Architecture

To ensure the operator returns every single morning and maintains discipline, the UI implements a **Daily Operating Habit Loop**:

### 1. Morning Checklist Widget (Trigger & Action)
Located in the primary viewport of the Dashboard. Contains 4 progressive daily tasks:
1. `[ ] Review yesterday spend & delivered profit`
2. `[ ] Process pending order confirmations & follow-ups`
3. `[ ] Update courier delivered / returned status`
4. `[ ] Review Kill / Hold / Scale recommendations`

### 2. Immediate Satisfaction & "All Caught Up" State (Reward)
- Completing each item checks it off with a satisfying tactile micro-animation and updates the progress indicator (e.g. `2/4 completed`).
- When 4/4 is achieved: Replaces the checklist with a calm, rewarding state: **"All operations clean for today ✨ — Daily review complete in 6m"**.
- Displays a subtle operational consistency streak indicator (`🔥 7-day review streak`) to encourage daily logging discipline without noisy gamification.

### 3. Decision Inbox (Zero-Inbox Psychology)
- Products with pending recommendations trigger a notification badge on the Dashboard Scoreboard (`2 decisions waiting`).
- Accepting or overriding a decision logs an entry in the Decision Log and clears the badge. Reaching 0 gives an immediate feeling of control and clarity.

---

## 4. Voice and Tone (Microcopy)

The interface speaks like a sharp, trusted COO: direct, numerical, encouraging, and free of vague fluff.

| Good Microcopy (COD Growth OS) | Bad Microcopy (Vague / AI Slop) |
|---|---|
| "Cash buffer healthy: 18 days of ad spend available." | "Your financial status is looking great! 🚀" |
| "Product CPL is 6.20 DT (Target: 4.00 DT). Recommendation: KILL (High Confidence)." | "AI thinks you should probably consider pausing this campaign." |
| "4 orders need follow-up today." | "You have some pending notifications." |
| "All caught up for today. Next review tomorrow morning." | "Congratulations on finishing your tasks!" |

---

## 5. Component Behavioral Patterns

### Order Operations Table
- **Inline Fast-Edit**: Status dropdown changes state instantly with optimistic UI. 
- **Governorate & Contact Quick-Actions**: Clicking the phone number copies it or offers a 1-click `https://wa.me/216...` direct link.
- **Follow-up Overdue Flag**: Rows with past-due follow-ups highlight with a subtle amber border and sort to the top of the `CONTACTING` view.

### Product Decision Card
- **Structured Evidence Display**: Shows exact metrics (CPL, Confirmation %, Delivery %, Profit/Order) side-by-side with configured Target values.
- **Confidence Rating**:
  - `LOW` (< 10 leads): Action button reads "Hold & Gather Data".
  - `MEDIUM` (10–24 leads): Displays initial trend.
  - `HIGH` (25+ leads over 3+ days): Clear actionable recommendation.
- **1-Click Actions**: `Accept Recommendation` (auto-updates status and records to Decision Log) or `Override` (opens a 1-line reason modal).

### CSV Ad Import Drawer
- **Drag & Drop**: Accepts Meta Ads export CSV files.
- **Pre-Import Verification**: Displays a preview summary (`14 rows valid, 0 errors, 142.50 DT total spend detected`) with a clear **Confirm & Apply** button before touching the database.

---

## 6. State Patterns

| State | Surface | Visual & Behavioral Treatment |
|---|---|---|
| **App Cold Load** | Dashboard | Clean skeleton cards for KPI tiles and scoreboard. Resolves in < 200ms from Supabase. |
| **No Data / Day 1** | Dashboard | Friendly onboarding card: *"Welcome! Start by adding your starting cash in Finance and creating your first Research Item or Product."* |
| **Empty Decision Inbox** | Dashboard | Green check pill: *"All product decisions up to date."* |
| **Cash Warning** | Top Banner | Amber banner when available ad cash drops below 3 days of average daily spend: *"Ad capital low (450 DT remaining). Top up or reduce daily testing budget."* |
| **Division by Zero** | Any KPI | Displays clean `—` (em-dash) instead of `NaN`, `Infinity`, or `0.00%`. |

---

## 7. Interaction & Keyboard Primitives

- `g d` — Navigate to Dashboard
- `g o` — Navigate to Orders
- `g p` — Navigate to Products
- `g f` — Navigate to Finance
- `g m` — Navigate to Monthly Review
- `c` — Open Quick Create modal (Product / Order / Transaction / Creative)
- `Esc` — Close open drawers, modals, or dropdowns
- `Tab` / `Shift+Tab` — Sequential keyboard navigation across order rows

---

## 8. Key Flows

### Flow 1: Morning 10-Minute Review Loop (Karim, Solo Operator, 9:00 AM)
1. **Karim** opens COD Growth OS in his desktop browser with his morning coffee.
2. The Dashboard loads instantly: Top stat cards show yesterday's ad spend (`80 DT`), confirmed orders (`14`), delivered revenue (`320 DT`), and actual net profit (`94 DT`).
3. Checklist Item 1 auto-checks as he reviews the numbers.
4. He clicks **Checklist Item 2: Orders needing attention (5 orders)** → jumps directly to the Orders view pre-filtered by `CONTACTING / FOLLOW-UP TODAY`.
5. Karim calls the 5 customers, updates their statuses in 3 minutes via inline dropdowns.
6. He jumps back to Dashboard: Checklist Item 2 is checked off (2/4).
7. Decision Inbox shows 1 product: **"Wireless Earbuds V2 — Kill Recommendation (High Confidence: CPL 7.50 DT vs Target 4.00 DT across 32 leads)"**.
8. Karim clicks **Accept Recommendation** → status changes to `KILLED`, decision logged, ad spend saved.
9. Karim marks the final checklist item. The dashboard transitions to the **"All clean for today ✨"** state. Total time: 7 minutes.

---

## 9. Next Step & Traceability

- This experience spine fulfills all functional requirements (FR-1 through FR-46) and user journeys (UJ-1 to UJ-4) in the PRD.
- Ready for technical architecture translation in `bmad-architecture`.
