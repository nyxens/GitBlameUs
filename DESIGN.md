---
name: LifeVault Design System
description: Liquid glass dark mode healthcare and blood bank management design system
colors:
  background: "#000000"
  foreground: "#ffffff"
  primary: "#a855f7"
  primary-hover: "#9333ea"
  crimson: "#8b0000"
  rose: "#f43f5e"
  card: "#0d0d0d"
  border: "#333333"
  muted: "#1f1f1f"
  muted-foreground: "#a6a6a6"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-2px"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# Design System: LifeVault

## Overview

**Creative North Star: "The Crimson Vault"**

LifeVault pairs deep dark mode surfaces (#000000 and #0d0d0d) with high-luminance crimson (#f43f5e) and royal purple (#a855f7) glassmorphic accents. The design language evokes precision, urgent clinical capability, and high-tech biological monitoring.

**Key Characteristics:**
- Pitch-black void backgrounds with dot-matrix vector grid overlays.
- Liquid glassmorphism (`liquid-glass`) with multi-pass gradient borders and backdrop blur.
- Dual typography hierarchy pairing sans-serif (`Inter`) structural precision with serif (`Instrument Serif`) emphasis.

## Colors

### Primary
- **Royal Purple Accent** (#a855f7): Interactive CTAs, glowing highlights, and primary state indicators.

### Secondary
- **Crimson Red / Rose** (#f43f5e): Emergency blood requisition status, ABO compatibility highlights, and donor alerts.

### Neutral
- **Pitch Black Ground** (#000000): Deep canvas background.
- **Card Surface** (#0d0d0d): Elevated widget and modal containers.
- **Subtle Glass Border** (#333333): High-precision 1px borders.
- **Muted Text** (#a6a6a6): Supporting copy and table metadata.

## Typography

**Display Font:** Inter (with system sans-serif fallback)  
**Accent Serif Font:** Instrument Serif (italic)  
**Body Font:** Inter  

### Hierarchy
- **Display** (Medium, clamp(2.5rem, 6vw, 4.5rem), 1.15): Primary section titles with -2px tracking.
- **Headline** (SemiBold, 1.5rem–2rem, 1.25): Card headers and modal titles.
- **Body** (Regular, 1rem, 1.6): Paragraph text and donor instructions.
- **Label** (Medium/SemiBold, 0.875rem, uppercase): Badges, stat titles, and table headers.

## Layout

12-column responsive fluid grid with centered max-width (1280px) containers, sticky translucent header navigation, and full-bleed hero backdrop canvas.

## Elevation & Depth

Surfaces rely on tonal layering (#000000 base, #0d0d0d surface) augmented by subtle inset highlights (`inset 0 1px 1px rgba(255,255,255,0.1)`) and multi-stop gradient mask borders instead of heavy drop shadows.

## Shapes

- **Rounded Full** (9999px): Action buttons, donor blood-type badges, and status pills.
- **Rounded MD/LG** (8px–12px): Interactive dashboard widgets, modal containers, and blood compatibility tables.

## Components

### Buttons
- **Shape:** Rounded Pill (`rounded-full`)
- **Primary:** Background `{colors.primary}`, text `#ffffff`, padding `12px 24px`.
- **Hover / Focus:** Glow shadow `0 0 25px rgba(168,85,247,0.4)` and scale transitions.

### Cards / Containers
- **Corner Style:** 12px radius (`rounded-xl`)
- **Background:** `liquid-glass` (rgba(255,255,255,0.01) with 4px backdrop-blur)
- **Border:** Gradient mask highlight border

## Do's and Don'ts

### Do:
- **Do** use `Instrument Serif` italics exclusively for emphasized key words within headings.
- **Do** preserve high-contrast legibility for clinical blood group data (e.g. A+, O-, AB+).

### Don't:
- **Don't** use solid light backgrounds; BloodFlow is built exclusively on deep dark mode aesthetics.
