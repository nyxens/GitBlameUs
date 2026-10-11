---
name: LifeVault BBMS
description: Next-generation clinical blood banking & cold-chain telemetry interface
colors:
  primary: "#a855f7"
  primary-deep: "#9333ea"
  secondary: "#ef4444"
  tertiary: "#10b981"
  warning: "#f59e0b"
  neutral-bg: "#000000"
  neutral-surface: "#0b0b0e"
  neutral-surface-hover: "#141418"
  neutral-border: "#262626"
  neutral-text: "#ffffff"
  neutral-text-muted: "#a3a3a3"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-secondary:
    backgroundColor: "{colors.neutral-surface-hover}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card-metric:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input-field:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
---

# Design System: LifeVault BBMS

## Overview

**Creative North Star: "Clinical Precision Optics"**

LifeVault balances the austere discipline of laboratory instrumentation with the intuitive clarity of a mission-critical operations cockpit. It rejects both the bloated visual clutter of generic SaaS templates and the lifeless gray fatigue of legacy hospital software. Every element exists on a canvas of deep obsidian black, engineered to maximize contrast, prevent visual fatigue during long medical shifts, and give instantaneous legibility to life-or-death telemetry.

Surfaces are rendered with disciplined tonal layering: high-density panels, razor-sharp 1px micro-borders, and laser-precise ultraviolet illumination. Interactive controls feel refined, deliberate, and restrained—providing tactile feedback through understated luminance transitions and micro-spring responses that never distract an operator from time-sensitive data entry.

**Key Characteristics:**
- **True Obsidian Canvas:** Absolute dark base (`#000000`) creating high-contrast clarity for clinical metrics and blood compatibility graphs.
- **Micro-Luminescent Hierarchy:** Pure white data typography accompanied by functional status lasers (Ultraviolet for telemetry, Crimson for expiration hazards, Emerald for verified stock).
- **Subtle Tonal Enclosures:** Elevated containers (`#0b0b0e`) framed by faint hairline borders (`rgba(255, 255, 255, 0.1)`), avoiding visual noise.
- **Restrained Motion Grammar:** Subtle, purposeful micro-transitions (subtle border shifts, quick spring taps) prioritizing speed and certainty over theatrical flourishes.

## Colors

The palette is engineered around high-contrast optical instrumentation on an absolute black ground, using functional spectral accents to convey operational status with zero ambiguity.

### Primary
- **Electric Ultraviolet** (#a855f7): The primary interactive anchor and brand beam. Used on primary buttons, active navigation markers, key stat metrics, and focused input indicators.

### Secondary
- **Crimson Hazard** (#ef4444): The critical urgency and hazard accent. Reserved strictly for units expiring in ≤7 days, emergency requisitions, expired stock flags, and destructive actions.

### Tertiary
- **Photic Emerald** (#10b981): Verified clinical status. Denotes safely stocked units, successful donor verification, and completed allotment handoffs.
- **Amber Alert** (#f59e0b): Cautionary telemetry indicator for pending receipts and approaching deadlines.

### Neutral
- **Obsidian Base** (#000000): The root backdrop across all screens and workspaces.
- **Instrument Panel Surface** (#0b0b0e): Card, table container, and modal panel fill.
- **Surface Hover** (#141418): Hover state background for rows and list items.
- **Hairline Border** (#262626): 1px structural separator defining card boundaries and field outlines.
- **Pure White** (#ffffff): High-contrast primary readings, titles, and button labels.
- **Muted Zinc** (#a3a3a3): Secondary captions, field placeholders, metadata labels, and column headers.

### Named Rules
**The Rarity of Glow Rule.** Diffuse glow and radial light effects are strictly reserved for focal interactive elements and active emergency warnings. Standard data grids and utility cards remain flat and razor-sharp.

**The Functional Color Rule.** Crimson and emerald are clinical signals, never decorative flourishes. Neither color may be used for general branding or non-status accents.

## Typography

**Display Font:** Instrument Serif (with Georgia, serif)  
**Body Font:** Inter (with system-ui, sans-serif)  
**Headline/Numerical Font:** Plus Jakarta Sans (with Inter, sans-serif)

**Character:** A deliberate synthesis of editorial elegance and precision instrumentation. Instrument Serif provides warmth and institutional permanence in brand wordmarks, while Inter delivers dense, uncompromised legibility for tabular clinical data and inventory telemetry.

### Hierarchy
- **Display** (400, clamp(2rem, 5vw, 3.5rem), 1.1): Used for landing page hero hooks and the signature brand wordmark (`LifeVault`).
- **Headline** (700, 1.875rem (30px), 1.25): Page titles, section headers, and major workspace navigation anchors.
- **Title** (600, 1.25rem (20px), 1.4): Card group headers, modal dialog titles, and metric summary titles.
- **Body** (400, 0.875rem (14px), 1.5): Standard data values, form inputs, table cell records, and descriptive text. Maximum line length: 65ch.
- **Label** (600, 0.75rem (12px), 1.2, uppercase, 0.05em tracking): Table column headers, badge chips, status indicators, and micro-metric labels.

### Named Rules
**The Tabular Clarity Rule.** Numerical readings, shelf coordinates, bag barcodes, and expiration dates always use tabular numerical spacing with high contrast against the container background.

## Layout

Layout follows an ergonomic spatial hierarchy optimized for rapid clinical scanning and dense data entry:
- **Root Canvas:** Full-width viewport with clean fixed headers and generous horizontal padding (`px-6 md:px-16`) on desktop.
- **Workspace Navigation:** Sticky top header with distinct role-gated tabs and immediate emergency callout triggers.
- **Metric Grids:** 4-column responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`) for high-level facility stock telemetry.
- **Data Tables:** Dense horizontal data rows (`h-12` to `h-14`) with subtle zebra/hover borders, sticky column headings, and direct inline action triggers.
- **Spacing Rhythm:** Base 8px unit (`8px`, `16px`, `24px`, `32px`, `48px`). Tight 8-12px spacing between related field controls; generous 24-32px spacing between logical dashboard sections.

## Elevation & Depth

LifeVault conveys depth exclusively through **Structured Tonal Layering** rather than heavy drop shadows:
- **Level 0 (Canvas):** Pure `#000000`.
- **Level 1 (Card & Containers):** `#0b0b0e` surrounded by a hairline `1px solid rgba(255, 255, 255, 0.1)` border.
- **Level 2 (Hover & Active States):** `#141418` with border transition to `rgba(168, 85, 247, 0.4)`.
- **Level 3 (Modals & Overlays):** `#0a0a0c` positioned over an `rgba(0, 0, 0, 0.85)` backdrop with `backdrop-filter: blur(12px)`.

### Shadow Vocabulary
- **Focal Hover Glow** (`box-shadow: 0 0 20px rgba(168, 85, 247, 0.25)`): Applied to primary action buttons and active telemetry pills on hover.
- **Emergency Halo** (`box-shadow: 0 0 25px rgba(239, 68, 68, 0.3)`): Applied strictly to critical expiry warnings and emergency blood shortage alerts.

### Named Rules
**The Flat-By-Default Rule.** All surfaces rest flat at level 0/1. Shadows and ambient halos appear only as dynamic responses to state change (hover, focus, or critical alarm).

## Shapes

- **Form Language:** Crisp, modern silhouettes with consistent corner radii tailored to component scale:
  - **Pills (Full Radius / 9999px):** Status chips, donor blood group badges (e.g. `O+`, `AB-`), and interactive micro-filters.
  - **Controls & Buttons (12px / `rounded-xl`):** Input fields, select dropdowns, action buttons, and table action buttons.
  - **Panels & Metric Cards (16px / `rounded-2xl`):** Metric tiles, telemetry containers, and data cards.
  - **Overlays & Modals (24px / `rounded-3xl`):** Modal dialogs and major workspace modules.
- **Borders:** Universal 1px border (`border-white/10`) providing crisp structural definition without visual weight.

## Components

### Buttons
- **Shape:** Rounded-xl (12px radius)
- **Primary:** Electric Ultraviolet background (`#a855f7`), white text (`#ffffff`), `px-4 py-2` (8px 16px), font-weight 600, subtle hover glow `0 0 16px rgba(168, 85, 247, 0.35)`.
- **Secondary / Ghost:** Subtle surface background (`rgba(255, 255, 255, 0.05)`), hairline border (`border-white/10`), text `text-neutral-300`, hover background `rgba(255, 255, 255, 0.1)`.
- **Danger:** Crimson Hazard background (`#ef4444`), white text, hover background `#dc2626`.

### Cards & Metric Panels
- **Corner Style:** Rounded-2xl (16px radius)
- **Background:** Instrument Panel (`#0b0b0e`), transitioning to `#141418` on hover.
- **Border:** 1px hairline (`border-white/10`), transitioning to `border-purple-500/40` on hover.
- **Internal Padding:** 20px (`p-5`).
- **Telemetry Typography:** Large 30px bold numeral with trailing unit indicator in purple.

### Inputs & Fields
- **Style:** Background `#0b0b0e` / `rgba(23, 23, 23, 0.6)`, hairline border (`border-white/10`), radius 12px (`rounded-xl`), font size 13px, padding `10px 14px`.
- **Focus:** Border shift to `rgba(168, 85, 247, 0.5)` with `box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.2)`. No white browser rings.
- **Placeholder:** Muted Zinc (`#737373`).

### Blood Group & Status Badges
- **Style:** Pill-shaped (9999px radius), padding `4px 10px`, font-size 11px, font-weight 600.
- **Variants:**
  - **Available:** Emerald tint (`rgba(16, 185, 129, 0.15)` fill, `text-emerald-400`, `border-emerald-500/30`).
  - **Expiring Soon:** Crimson tint (`rgba(239, 68, 68, 0.15)` fill, `text-red-400`, `border-red-500/30`).
  - **Pending / In-Transit:** Amber tint (`rgba(245, 158, 11, 0.15)` fill, `text-amber-400`, `border-amber-500/30`).

### Modals & Dialogs
- **Style:** Fixed centered container over `bg-black/85 backdrop-blur-md`, radius 24px (`rounded-3xl`), fill `#0b0b0e`, border `1px solid rgba(255, 255, 255, 0.1)`.
- **Top Accent:** 1px ambient linear gradient border at top edge (`linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.4), transparent)`).

## Do's and Don'ts

### Do:
- **Do** maintain a strict true-black (`#000000`) background across all screens to ensure maximum contrast and reduced eye strain.
- **Do** frame cards and inputs with 1px micro-borders (`rgba(255, 255, 255, 0.1)`) instead of drop shadows.
- **Do** reserve Electric Ultraviolet (`#a855f7`) for primary user actions, active navigation, and focal telemetry indicators.
- **Do** use Crimson (`#ef4444`) exclusively for medical hazards, expiration alerts (≤ 7 days), and destructive actions.
- **Do** format blood barcodes, shelf coordinates (`cellno`, `shelfno`), and unit quantities with clear tabular numbers.

### Don't:
- **Don't** use multi-colored saturated gradients, neon wallpaper, or candy-colored cards that produce cognitive clutter.
- **Don't** use generic white outline focus rings (`outline-white` or default browser focus rings).
- **Don't** mix multiple accent hues within a single card or data row.
- **Don't** allow critical data cells to become low-contrast gray; preserve pure `#ffffff` for immediate scanning.
- **Don't** use slow or spring-heavy animations for clinical data grids or form validation modals.
