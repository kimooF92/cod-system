---
name: COD Growth OS
description: Professional, high-density decision & operations system for cash-on-delivery e-commerce. Focused, clean, and friendly-balanced UI built with shadcn/ui and Tailwind.
colors:
  # Base neutral surfaces (Clean Zinc / Slate palette - no AI gradients)
  background: '#090A0C'
  background-light: '#F8FAFC'
  surface: '#111317'
  surface-light: '#FFFFFF'
  surface-subtle: '#181B20'
  surface-subtle-light: '#F1F5F9'
  border: '#23272F'
  border-light: '#E2E8F0'
  border-focus: '#3B82F6'

  # Typography
  foreground: '#F1F5F9'
  foreground-light: '#0F172A'
  muted-foreground: '#8E96A4'
  muted-foreground-light: '#64748B'

  # Semantic Decision & Financial Tokens
  profit-emerald: '#10B981'
  profit-emerald-subtle: 'rgba(16, 185, 129, 0.12)'
  scale-green: '#10B981'
  hold-amber: '#F59E0B'
  hold-amber-subtle: 'rgba(245, 158, 11, 0.12)'
  kill-crimson: '#EF4444'
  kill-crimson-subtle: 'rgba(239, 68, 68, 0.12)'
  testing-blue: '#3B82F6'
  testing-blue-subtle: 'rgba(59, 130, 246, 0.12)'

  # Interactive Accent
  primary: '#2563EB'
  primary-hover: '#1D4ED8'
  primary-foreground: '#FFFFFF'
typography:
  fontFamily: 'Inter, system-ui, sans-serif'
  fontFamilyMono: 'JetBrains Mono, SF Mono, Menlo, monospace'
  h1:
    fontSize: '24px'
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: '-0.02em'
  h2:
    fontSize: '18px'
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: '-0.015em'
  h3:
    fontSize: '15px'
    fontWeight: '600'
    lineHeight: '1.4'
  body:
    fontSize: '14px'
    fontWeight: '400'
    lineHeight: '1.5'
  body-dense:
    fontSize: '13px'
    fontWeight: '400'
    lineHeight: '1.4'
  stat-value:
    fontSize: '22px'
    fontWeight: '700'
    fontFamily: '{typography.fontFamilyMono}'
    letterSpacing: '-0.02em'
  label:
    fontSize: '12px'
    fontWeight: '500'
    letterSpacing: '0.01em'
rounded:
  sm: '4px'
  md: '6px'
  lg: '8px'
  full: '9999px'
spacing:
  gutter: '16px'
  card-padding: '16px'
  table-row-height: '40px'
components:
  card:
    background: '{colors.surface}'
    border: '1px solid {colors.border}'
    radius: '{rounded.md}'
  stat-card:
    background: '{colors.surface}'
    border: '1px solid {colors.border}'
    radius: '{rounded.md}'
    padding: '{spacing.card-padding}'
  pill-scale:
    background: '{colors.profit-emerald-subtle}'
    color: '{colors.scale-green}'
    radius: '{rounded.full}'
  pill-hold:
    background: '{colors.hold-amber-subtle}'
    color: '{colors.hold-amber}'
    radius: '{rounded.full}'
  pill-kill:
    background: '{colors.kill-crimson-subtle}'
    color: '{colors.kill-crimson}'
    radius: '{rounded.full}'
  pill-testing:
    background: '{colors.testing-blue-subtle}'
    color: '{colors.testing-blue}'
    radius: '{rounded.full}'
---

# COD Growth OS — Visual Design System (DESIGN.md)

## 1. Brand & Style

**COD Growth OS** is a high-speed personal operating and decision console for a Cash-on-Delivery e-commerce operator in Tunisia. 

The aesthetic is **Terminal-grade Professional & Friendly-Balanced**:
- **Zero AI Gradients / Slop**: No decorative glowing purple/pink background blobs, no pseudo-futuristic neon shadows, and no glassmorphic blurs that reduce contrast.
- **Precision & Substance**: Crisp 1px solid borders, matte slate/zinc panels, and monospace numeric alignment (`tabular-nums`) for currency (DT) and KPI rates.
- **Friendly & Approachable**: Warm microcopy, rounded corners (`{rounded.md}` = 6px), Lucide icons with comfortable touch targets, and visual satisfaction states for daily habit completion.
- **Decisive Color Coding**: Semantic colors carry explicit financial and operational meaning. Green is never decorative; it strictly denotes profit or a `SCALE` recommendation. Amber denotes `HOLD` or warning thresholds. Crimson strictly denotes `KILL`, loss, or return bottlenecks.

---

## 2. Colors

### Palette Philosophy
1. **Surfaces (`{colors.surface}`, `{colors.surface-subtle}`)**: Solid dark slate/zinc in dark mode (`#111317`) and crisp clean white/off-white in light mode (`#FFFFFF`). High readability with zero visual fatigue during 30+ minute daily operating sessions.
2. **Borders (`{colors.border}`)**: Crisp 1px structural borders (`#23272F` dark / `#E2E8F0` light) separating dense data cells and summary cards without visual noise.
3. **Semantic Status Colors**:
   - **Profit & Scale Emerald (`#10B981`)**: Used on Net Profit, Delivered Revenue, Scale/Big Scale pills, and 100% daily checklist completion badges.
   - **Hold & Warning Amber (`#F59E0B`)**: Used for `HOLD` decisions, low cash buffer warnings, low delivery rates (50–64%), and unconfirmed order aging alerts.
   - **Kill & Risk Crimson (`#EF4444`)**: Used for `KILL` recommendations, negative profit, high return rates, and critical cash deficits.
   - **Testing Indigo/Blue (`#3B82F6`)**: Used for products/creatives actively in test and neutral actionable buttons.

---

## 3. Typography

- **Primary Typeface**: `Inter` (or `Geist Sans`) for clean UI labels, headers, and dialogs.
- **Numerical Typeface**: `JetBrains Mono` / `SF Mono` with `font-variant-numeric: tabular-nums` for all financial figures (e.g. `3,450 DT`), CPL, percentages, and order counts to ensure flawless vertical column alignment in dense tables.
- **Type Roles**:
  - `h1`: Page title and active workspace heading (24px, semi-bold).
  - `h2`: Section cards, table headers, drawer headers (18px, semi-bold).
  - `stat-value`: Big KPI stat numbers (22px monospace, bold).
  - `body-dense`: Table cell data and checklist items (13px, regular).
  - `label`: Metadata caps / badges (12px, medium).

---

## 4. Layout & Spacing

- **Structure**: Collapsible left sidebar navigation (width: 240px expanded, 64px collapsed) + Top Date Bar / Quick Action Hub + Main Content Grid.
- **Spacing Scale**: Based on an 8px grid (4px, 8px, 12px, 16px, 24px, 32px).
- **Data Density**: Compact row padding (8px top/bottom, 12px left/right) on orders and metrics tables to maximize visible viewport rows without scrolling.
- **Breakpoints**:
  - `≥ 1280px` (Desktop Primary): Full 4-column KPI grid, split Scoreboard/Action Center layout.
  - `1024px – 1279px` (Laptop): 2-column KPI grid, full-width data tables.
  - `< 1024px` (Mobile/Tablet): Single-column stack, collapsible drawer navigation, swipeable cards.

---

## 5. Elevation & Depth

- **Zero heavy drop-shadows**: Elevation is expressed through subtle 1px border contrast (`{colors.border}`) and 1-level background tonal stepping (`surface-subtle` on top of `surface`).
- **Popovers & Drawers**: Modals and side drawers use a clean 1px border with a soft, natural ambient shadow (`box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25)`).

---

## 6. Shapes & Radii

- **Inputs & Buttons**: `{rounded.md}` (6px) for a modern, crisp feel.
- **Cards & Dialogs**: `{rounded.lg}` (8px).
- **Status Badges & Decision Pills**: `{rounded.full}` (9999px) for clear differentiation from clickable square buttons.

---

## 7. Components

### Stat Card
- Top label in `{colors.muted-foreground}` (12px uppercase).
- Big numeric value in `{typography.stat-value}` (22px tabular mono).
- Sub-text with target comparison delta (e.g., `+12% vs Target` in green/red).

### Decision Recommendation Card
- Prominent status pill (`SCALE`, `HOLD`, `KILL`, `BIG SCALE`).
- Confidence Badge (`HIGH`, `MEDIUM`, `LOW`).
- Plain-language reason box with 1-click **Accept** and **Override** buttons.

### Daily Checklist Widget (Retention Driver)
- Progress bar (`3 / 4 completed`).
- Interactive checkboxes with tactile check animation and strike-through on completion.
- "All Clear" celebration badge when 4/4 is achieved.

### COD Order Table Row
- Inline status selector dropdown with instant optimistic color update.
- Governorate and phone number with 1-click WhatsApp/Call copy triggers.
- Follow-up date badge with dynamic color warning when past due.

---

## 8. Do's and Don'ts

| Do | Don't |
|---|---|
| Use tabular numbers for all money (DT) and rate metrics | Use proportional fonts where numbers jump and misalign columns |
| Keep background surfaces solid, dark, and matte | Use colorful purple/blue gradient backgrounds or neon glow overlays |
| Reserve green strictly for profit, healthy delivery, and Scale | Use green as a generic brand decorative color |
| Show explicit "—" for division by zero (e.g. 0 leads) | Display `NaN`, `Infinity`, or fake `0.00%` |
| Give instant visual feedback for daily checklist completion | Hide daily operational tasks inside complex sub-menus |
