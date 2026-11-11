---
name: NovaSlate
description: Utilitarian Minimalist Curriculum Platform with High-Craft GSAP Motion
colors:
  primary: "#1883B1"
  secondary: "#88A9B6"
  surface: "#DEE4E6"
  canvasLight: "#F5F8F9"
  canvasWarm: "#F1F1F1"
  canvasDark: "#0E1B22"
  obsidian: "#0B1120"
  white: "#FFFFFF"
  black: "#000000"
  charcoal: "#1B313C"
  slateDark: "#55717D"
  slateLight: "#C4D2D7"
  gold: "#E4B34C"
  crimson: "#D2475F"
  emerald: "#10B981"
  windowClose: "#FC685D"
  windowMinimize: "#FCBA40"
  windowZoom: "#33C748"
  borderSubtle: "#DEDEDE"
  graphite: "#2b2b2b"
  sky: "#0284c7"
  ceruleanLight: "#2197c9"
  overlayDark: "#141414"
typography:
  displayLg:
    fontFamily: "Work Sans"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  display:
    fontFamily: "Work Sans"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  displaySerif:
    fontFamily: "Newsreader"
    fontSize: "clamp(2rem, 4.5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Work Sans"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  headingLg:
    fontFamily: "Work Sans"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headingMd:
    fontFamily: "Work Sans"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  headingSm:
    fontFamily: "Work Sans"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  bodyLg:
    fontFamily: "Lexend"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.012em"
  bodyMd:
    fontFamily: "Lexend"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Lexend"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.012em"
  bodyXs:
    fontFamily: "Lexend"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  mono:
    fontFamily: "JetBrains Mono"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
  caption:
    fontFamily: "Lexend"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  captionSm:
    fontFamily: "Lexend"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  micro:
    fontFamily: "JetBrains Mono"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.04em"
  nano:
    fontFamily: "JetBrains Mono"
    fontSize: "9px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.04em"
rounded:
  hairline: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  xlRem: "0.75rem"
  xxl: "16px"
  xxlRem: "1rem"
  modal: "24px"
  modalRem: "1.5rem"
  cardMobile: "1.25rem"
  badge: "5px"
  tag: ".3333rem"
  full: "9999px"
  curvature: "G2" # Continuous curvature / squircle (corner-smoothing: 60%)
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "64px"
components:
  button-gold-standard:
    name: "Gold Standard NovaSlate Button"
    shape: "Pill / Superellipse (rounded-full 9999px)"
    typography: "Work Sans 600, -0.01em tracking"
    primary:
      background: "#0E1B22"
      color: "#F5F8F9"
      hoverBackground: "#F5F8F9"
      hoverColor: "#0E1B22"
    accent:
      background: "{colors.primary}"
      color: "#FFFFFF"
      hoverBackground: "#FFFFFF"
      hoverColor: "{colors.primary}"
    secondary:
      background: "transparent"
      color: "#0E1B22"
      borderColor: "rgba(14, 27, 34, 0.16)"
      hoverBackground: "#0E1B22"
      hoverColor: "#F5F8F9"
    sizes:
      lg: { height: "44px", padding: "0 28px", fontSize: "0.9375rem" }
      md: { height: "36px", padding: "0 20px", fontSize: "0.8125rem" } # Canonical Get Started
      sm: { height: "32px", padding: "0 16px", fontSize: "0.75rem" }
      xs: { height: "26px", padding: "0 12px", fontSize: "0.6875rem" }
      icon: { size: "36px", radius: "9999px" }
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
**The No-Gradient Rule.** Gradients across card surfaces, backgrounds, or text fills are prohibited. Depth is established through 1px border contrast, architectural dot grids, and Faux-OS window layering.

## Typography

**Display Font:** Work Sans (with -apple-system, BlinkMacSystemFont fallback)  
**Editorial Serif Accent:** Newsreader (with Georgia fallback)  
**Body Font:** Lexend (with -apple-system, BlinkMacSystemFont fallback)  
**Telemetry / Code Font:** JetBrains Mono (with monospace fallback)

**Character:** Technical and restrained, emphasizing clear editorial typography. The juxtaposition of modern geometric grotesque with classical italic serif creates an immediate visual distinction between utilitarian data and human craftsmanship.

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
- **Dual Architecture Display:** 2-column split for Cloud Web Platform and Embedded ESP32 Hardware.

## Surface Depth & Layering

**The Flat-By-Default Rule.** Surfaces rest entirely flat on the canvas bounded by crisp 1px borders. Heavy blurred shadows are banned. Depth is rendered via:
1. **Faux-OS Window Chrome:** Window dots, header strips, and inset backgrounds.
2. **Subtle Horizon Glow:** Ultra-diffuse 2% opacity ambient radial horizon light (`.ambient-glow-top`).
3. **Interactive 3D Tilt:** Real-time compositor rotation (`rotationX`, `rotationY` via `gsap.quickTo`) tracking cursor coordinates.

## Shapes

**The G2 Continuous Curvature Rule.** All rounded corners strictly enforce **G2 continuous curvature** (superellipse / squircle with smooth curvature acceleration) rather than standard G1 circular fillets. The transition from straight edge to curve accelerates smoothly with zero abrupt curvature step-jump, eliminating perceptible corner seams and creating organic, machined hardware-grade surfaces.

- **Curvature Continuity:** G2 continuous curvature (`corner-shape: squircle`, `-webkit-corner-smoothing: 0.6`).
- **Corner Scale:**
  - **Cards & Bento Cells:** 8px to 12px (`rounded-lg` / `rounded-xl`, G2 squircle).
  - **Buttons & Interactive CTAs:** Full Pill (`rounded-full` 9999px) with G2 curvature.
  - **Micro-Pills & Badges:** 4px (`rounded-sm`, G2 continuous curve).
  - **Full Pills:** 9999px (`rounded-full`).
- **Borders:** Consistent `1px solid var(--border)` tracing the G2 perimeter contour.

## Components

### The Gold Standard Button System (Canonical "Get Started" Specification)

The signature **Get Started** button on the landing page header defines the gold standard for all interactive buttons throughout the NovaSlate application ecosystem. It combines Swiss precision typography, pill superellipse curvature, and a dual-layer kinetic clip-path animation.

#### 1. Architectural Anatomy & DOM Contract
Every button consists of a three-tier nested structure:
```html
<button class="btn-main btn-main--primary btn-main--black btn-main--md">
  <span class="btn-main__outer">
    <span class="btn-main__inner">
      <span class="btn-main__text">Get Started</span>
    </span>
    <span class="btn-main__hover" aria-hidden="true">
      <span class="btn-main__text" data-text="Get Started"></span>
    </span>
  </span>
</button>
```
- **`.btn-main`**: Baseline container establishing `inline-flex`, cursor pointer, reset styles, and active press scale.
- **`.btn-main__outer`**: Precision shell with `border-radius: 9999px`, `overflow: hidden`, and 1px hairline boundary on `:after`.
- **`.btn-main__inner`**: Primary visible resting layer containing the default label.
- **`.btn-main__hover`**: Incoming bloom layer with `clip-path: ellipse(...)` and inverted colorway, paired with `data-text` for kinetic text rolling.

#### 2. Typography Standard
- **Font Family**: `var(--font-family-heading, 'Work Sans', sans-serif)`
- **Font Weight**: `600` (Semi-bold)
- **Letter Spacing**: `-0.01em` (precision optical tracking)
- **Text Transform**: Natural casing (e.g. "Get Started", "Open Digital Library") — avoids aggressive all-caps mono.
- **Line Height**: `1` (centered vertically with `display: inline-flex; align-items: center`).

#### 3. Sizing Scale
- **Large (`btn-main--lg`)**: `height: 44px`, `padding: 0 28px`, `font-size: 0.9375rem` (Hero / Primary Page Action)
- **Medium (`btn-main--md`)**: `height: 36px`, `padding: 0 20px`, `font-size: 0.8125rem` (Canonical Get Started CTA)
- **Small (`btn-main--sm`)**: `height: 32px`, `padding: 0 16px`, `font-size: 0.75rem` (Secondary cards / in-app controls)
- **Extra Small (`btn-main--xs`)**: `height: 26px`, `padding: 0 12px`, `font-size: 0.6875rem` (Compact telemetry / table actions)
- **Icon (`btn-main--icon`)**: `width: 36px`, `height: 36px`, `border-radius: 9999px`

#### 4. Colorways & Roles
- **Primary Black (`btn-main--primary btn-main--black`)**: Deep charcoal `#0E1B22` fill, white `#F5F8F9` text. Hover blooms into clean white surface with `#0E1B22` text.
- **Primary Cerulean (`btn-main--primary btn-main--accent`)**: Ocean Cerulean `#1883B1` fill, white text. Hover blooms into pure white surface with `#1883B1` text.
- **Secondary Outline (`btn-main--secondary btn-main--black`)**: Transparent fill, 1px border `rgba(14, 27, 34, 0.16)`. Hover blooms into solid `#0E1B22` with `#F5F8F9` text.
- **Secondary White (`btn-main--secondary btn-main--white`)**: Transparent fill, 1px border `rgba(255, 255, 255, 0.3)`. Hover blooms into solid white with `#0E1B22` text.

#### 5. Animation & Motion Engineering
- **Active Press State (Instant Feedback):**
  `:active { transform: scale(0.975); transition: transform 0.08s cubic-bezier(0.25, 1, 0.5, 1); }`
  Gives instant sub-100ms haptic feedback confirming user touch or mouse click.
- **Elliptical Lens Clip-Path Bloom:**
  - Resting: `clip-path: ellipse(80% 50% at 50% 152%);` (tucked beneath the bottom pill rim)
  - Hover: `clip-path: ellipse(100% 70% at 50% 50%); transition: clip-path 0.8s cubic-bezier(0.86, 0, 0.07, 1);`
  Simulates an optical lens blooming upward across the surface.
- **Kinetic Dual-Text Roll:**
  - Resting text rolls upward on hover: `transform: translate3d(0, -0.75em, 0); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);`
  - Hover text translates upward into center: `transform: translateZ(0); transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1) 0.35s;`
- **Dual Mask Text Inset (`data-text`):**
  `:before` clips out via `inset(0 0 100%)` and `:after` clips in via `inset(0 0 0)` over `0.6s cubic-bezier(0.19, 1, 0.22, 1) 0.35s`.
- **Accessibility & Touch Protection:**
  - Gated under `@media (hover: hover) and (pointer: fine)` so mobile tap highlights never get stuck.
  - Gated under `@media (prefers-reduced-motion: reduce)` with clean 200ms opacity fades replacing transform motion.

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
- **Do** use the Gold Standard `.btn-main` / `<Button>` pill architecture with dual-layer text rolling for all interactive buttons.
- **Do** maintain strict 1px hair-thin borders (`#DEE4E6` / `rgba(14, 27, 34, 0.16)`) on all containers.
- **Do** apply G2 continuous curvature (squircle corner smoothing) to all rounded containers and cards.
- **Do** pair Work Sans with Newsreader italics for primary headline statements.
- **Do** use `gsap.quickTo()` for cursor tracking to ensure 60fps compositor performance without layout reflow.
- **Do** use `ScrollToPlugin` for all anchor navigation links with automatic 56px header offset compensation.
- **Do** credit exclusively **Reyansh Niranjan** as the solo architect and creator.

### Don't:
- **Don't** use abrupt square corners or unstyled default HTML buttons.
- **Don't** add purple/teal radial glow blobs, blur bubbles, or generic AI-slop gradients.
- **Don't** use emojis in technical UI elements; use crisp Lucide icons.
- **Don't** use heavy multi-stop drop shadows.
- **Don't** reference CPX-SE or fictional team rosters anywhere in the platform.
- **Don't** animate `top`, `left`, `width`, or `height`; always animate `transform` (`x`, `y`, `scale`, `rotation`) and `opacity`.
