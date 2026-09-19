---
name: NovaSlate
description: Utilitarian Minimalist Curriculum Platform with High-Craft GSAP Motion
colors:
  primary: "#1883B1"
  secondary: "#88A9B6"
  surface: "#DEE4E6"
  gold: "#E4B34C"
  crimson: "#D2475F"
typography:
  display:
    fontFamily: "Work Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  display-serif:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2rem, 4.5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Work Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Lexend, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.012em"
  mono:
    fontFamily: "JetBrains Mono, SF Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
  caption:
    fontFamily: "Lexend, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  micro:
    fontFamily: "JetBrains Mono, SF Mono, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.04em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
  curvature: "G2" # Continuous curvature / squircle (corner-smoothing: 60%)
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  bento-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "24px 28px"
---

# Design System: NovaSlate

## Overview

**Creative North Star: "The Editorial Hardware Laboratory"**

NovaSlate embodies the disciplined restraint of precision scientific instrumentation combined with the typography of an elite architectural journal. The interface prioritizes scannability, dense tabular taxonomy, high-contrast monochrome surfaces, and 60fps compositor physics over generic SaaS gradient mush and decorative filler.

Every component feels machined and tactile: hairline 1px borders, subtle millimeter dot-matrix grids, Faux-OS window chrome, and spot pastels reserved strictly for telemetry and semantic status. Motion is purposeful, fluid, and non-blocking, orchestrated through GSAP timelines, ScrollTrigger batch reveals, and quickTo 3D cursor physics.

**Key Characteristics:**
- 5-color palette: Cerulean (#1883B1), Slate (#88A9B6), Mist (#DEE4E6), Amber (#E4B34C), and Crimson (#D2475F).
- Dual typographic pairing: crisp Work Sans headings with Lexend reading body, accented by Newsreader italic.
- Monospace telemetry bands for high-density curriculum stats and hardware specs.
- Zero AI-slop: banned purple/teal gradients, neon glow blobs, and heavy blurred drop shadows.
- Micro-interactions powered by GSAP with 60fps GPU acceleration.

## Colors

The design system is strictly anchored on a 5-color palette:

- **Primary (`#1883B1`)**: Deep Cerulean Ocean — primary brand typography, action buttons, active tabs, and focus rings.
- **Secondary (`#88A9B6`)**: Slate Glaze — secondary labels, muted controls, and subheadings.
- **Surface (`#DEE4E6`)**: Clean Mist — hairline borders, card frames, structural dividing lines, and light fills.
- **Warm (`#E4B34C`)**: Amber Honey — Atlas ESP32 hardware highlights, battery telemetry, and offline tags.
- **Impact (`#D2475F`)**: Welfare Crimson — student-first pledge highlights, destructive alerts, and watermark flags.

### Named Rules
**The Rarity Rule.** Color accents occupy ≤5% of screen real estate. The clean canvas provides clarity; color exists exclusively for functional meaning.  
**The No-Gradient Rule.** Gradients across card surfaces, backgrounds, or text fills are prohibited. Depth is established through 1px border contrast, architectural dot grids, and Faux-OS elevation.

## Typography

**Display Font:** Work Sans (with -apple-system, BlinkMacSystemFont fallback)  
**Editorial Serif Accent:** Newsreader (with Georgia fallback)  
**Body Font:** Lexend (with -apple-system, BlinkMacSystemFont fallback)  
**Telemetry / Code Font:** JetBrains Mono (with monospace fallback)

**Character:** Technical, confident, and editorial. The juxtaposition of modern geometric grotesque with classical italic serif creates an immediate visual distinction between utilitarian data and human craftsmanship.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 5vw, 3.75rem)`, 1.08): Hero titles with tight tracking (`-0.035em`).
- **Editorial Serif Accent** (400 italic, `clamp(2rem, 4.5vw, 3.5rem)`, 1.15): Distinctive italic emphasis phrases within hero headlines.
- **Headline** (700, `clamp(1.5rem, 3vw, 2.25rem)`, 1.2): Section titles with tracking (`-0.03em`).
- **Title** (600, `1.125rem` to `1.25rem`, 1.3): Card headings and bento cell labels.
- **Body** (400, `0.875rem`, 1.6): Feature descriptions and body paragraphs (max line length: 55ch).
- **Label / Monospace** (500, `0.75rem`, 1.4): Metadata telemetry, status badges, and code snippets.

## Layout

A modular 12-column asymmetric grid with unified container constraints (`max-width: 72rem / 1152px`). Spatial rhythm follows an 8px base scale (8px, 16px, 24px, 32px, 48px, 96px).

- **Header:** Fixed 56px minimalist navigation bar with hair-thin scroll progress scrubber and blurred backdrop.
- **Hero:** Asymmetric 7:5 split between value proposition and interactive Faux-OS curriculum indexer.
- **Bento Grid:** Asymmetric 7:5 and 5:7 column distribution creating balanced visual tension across ingestion, OCR, vision AI, and embedded hardware.
- **Dual Showcase:** 2-column equal split for Cloud Web Platform vs. Embedded ESP32 Hardware.

## Elevation & Depth

**The Flat-By-Default Rule.** Surfaces rest entirely flat on the canvas bounded by crisp 1px borders. Heavy blurred shadows are banned. Depth is rendered via:
1. **Faux-OS Window Chrome:** Window dots, header strips, and inset backgrounds.
2. **Subtle Horizon Glow:** Ultra-diffuse 2% opacity ambient radial horizon light (`.ambient-glow-top`).
3. **Interactive 3D Tilt:** Real-time compositor rotation (`rotationX`, `rotationY` via `gsap.quickTo`) tracking cursor coordinates.

## Shapes

**The G2 Continuous Curvature Rule.** All rounded corners strictly enforce **G2 continuous curvature** (superellipse / squircle with smooth curvature acceleration) rather than standard G1 circular fillets. The transition from straight edge to curve accelerates smoothly with zero abrupt curvature step-jump, eliminating perceptible corner seams and creating organic, machined hardware-grade surfaces.

- **Curvature Continuity:** G2 continuous curvature (`corner-shape: squircle`, `-webkit-corner-smoothing: 0.6`).
- **Corner Scale:**
  - **Cards & Bento Cells:** 8px to 12px (`rounded-lg` / `rounded-xl`, G2 squircle).
  - **Buttons & Inputs:** 6px (`--radius: 0.375rem`, G2 continuous curve).
  - **Micro-Pills & Badges:** 4px (`rounded-sm`, G2 continuous curve).
  - **Full Pills:** 9999px (`rounded-full`).
- **Borders:** Consistent `1px solid var(--border)` tracing the G2 perimeter contour.

## Components

### Buttons
- **Shape:** 6px radius (`0.375rem`).
- **Primary:** Cerulean fill (`#1883B1`) with white text (`#FFFFFF`).
- **Outline / Secondary:** Transparent background, `1px solid var(--border)`, text `var(--muted-foreground)` transitioning to `var(--foreground)` on hover.
- **State Transitions:** 150ms transform scale (`0.98`) on active press.

### Bento Cards
- **Corner Style:** 6px radius.
- **Background:** `var(--card)`.
- **Border:** `1px solid var(--border)`, brightening on hover.
- **Padding:** 24px to 32px (`p-6 sm:p-8`).

### Faux-OS Windows
- **Header:** 3 muted window dots (`width: 8px, height: 8px`), terminal path name, and live status badge.
- **Interactive Content:** Tabbed curriculum pills, live formula display, and monospace telemetry.

### Telemetry Stat Cards
- **Style:** Compact card with uppercase 10px monospace label, bold 24–30px metric value, and subtle micro-description.

## Do's and Don'ts

### Do:
- **Do** maintain strict 1px hair-thin borders (`#DEE4E6`) on all containers.
- **Do** apply G2 continuous curvature (squircle corner smoothing) to all rounded containers, cards, and interactive elements.
- **Do** pair Work Sans with Newsreader italics for primary headline statements.
- **Do** use `gsap.quickTo()` for cursor tracking to ensure 60fps compositor performance without layout reflow.
- **Do** use `ScrollToPlugin` for all anchor navigation links with automatic 56px header offset compensation.
- **Do** credit exclusively **Reyansh Niranjan** as the solo architect and creator.

### Don't:
- **Don't** use abrupt G1 circular filleting on cards or button surfaces.
- **Don't** add purple/teal radial glow blobs, blur bubbles, or generic AI-slop gradients.
- **Don't** use emojis in technical UI elements; use crisp Lucide icons.
- **Don't** use heavy multi-stop drop shadows.
- **Don't** reference CPX-SE or fictional team rosters anywhere in the platform.
- **Don't** animate `top`, `left`, `width`, or `height`; always animate `transform` (`x`, `y`, `scale`, `rotation`) and `opacity`.
