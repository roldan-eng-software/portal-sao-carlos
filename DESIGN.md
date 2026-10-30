---
name: "Meu Bairro - Portal São Carlos"
description: "Portal comunitário de utilidade pública de São Carlos/SP com curadoria humana, sem cadastro e sem monetização direta."
colors:
  primary: "#001428"
  primary-container: "#0f2942"
  on-primary: "#ffffff"
  secondary: "#0050cc"
  secondary-container: "#0266ff"
  on-secondary: "#ffffff"
  secondary-fixed: "#dae1ff"
  on-secondary-fixed: "#001849"
  surface-canvas: "#f8fafc"
  surface-bright: "#f8f9ff"
  surface-card: "#ffffff"
  surface-container-low: "#eff4ff"
  surface-container: "#e6eeff"
  surface-container-high: "#dce9ff"
  surface-variant: "#d5e3fc"
  on-surface: "#0d1c2e"
  on-surface-variant: "#43474d"
  outline: "#74777e"
  outline-variant: "#c3c6ce"
  border-subtle: "#e2e8f0"
  inverse-surface: "#233144"
  accent-amber: "#f59e0b"
  badge-emergency: "#ef4444"
  badge-success: "#10b981"
  error: "#ba1a1a"
  error-container: "#ffdad6"
  on-error: "#ffffff"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: "48px"
    letterSpacing: "-0.02em"
  display-mobile:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: "38px"
    letterSpacing: "-0.015em"
  headline-lg:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "36px"
    letterSpacing: "-0.015em"
  headline-md:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "-0.01em"
  headline-sm:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
  body-lg:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "26px"
  body-md:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
  body-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
  label-lg:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
    letterSpacing: "0.01em"
  label-md:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0.04em"
  label-sm:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: "14px"
    letterSpacing: "0.06em"
rounded:
  sm: "0.25rem"
  DEFAULT: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  full: "9999px"
spacing:
  gutter: "1.25rem"
  gutter-mobile: "0.75rem"
  margin: "2rem"
  margin-mobile: "1rem"
  space-xs: "0.25rem"
  space-sm: "0.5rem"
  space-md: "1rem"
  space-lg: "1.5rem"
  space-xl: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
---

# Design System: Meu Bairro - Portal São Carlos

## Overview

**Creative North Star: "The Trusted Civic Commons"**

The Portal São Carlos is a community utility portal that balances institutional credibility with approachable local service. The design language fuses modern corporate/civic clarity with high-utility digital editorial—prioritizing scannability, trust, and accessibility. It favors structured segmentation, clean surfaces, purposeful status tags, and restrained accents that draw attention only where action is needed.

**Key Characteristics:**
- **Institutionally trustworthy:** Deep navy (`#001428`) anchors authority without feeling cold.
- **Action-oriented:** Electric blue (`#0050cc`) drives high-intent CTAs like "Anuncie Aqui".
- **Utility-first:** Information hierarchy favors clarity over decoration.
- **Community-focused:** Warm, welcoming, and distinctly local to São Carlos/SP.

## Colors

The palette differentiates editorial content from commercial/promotional utility while maintaining strong contrast and accessibility.

### Primary
- **Deep Navy (`#001428`)**: Headers, primary navigation, institutional elements. Provides editorial weight and authority.
- **Primary Container (`#0f2942`)**: Supporting surfaces for institutional blocks and emphasized containers.

### Secondary
- **Electric Blue (`#0050cc`)**: Primary interactive affordances, links, and CTAs. Used for "Anuncie Aqui" and key actions.
- **Secondary Container (`#0266ff`)**: Hover/active states for secondary actions and prominent buttons.

### Neutral
- **Canvas (`#f8fafc`)**: Base background, warm and easy on the eyes.
- **Card (`#ffffff`)**: Content cards and modules with clear separation from canvas.
- **Surface Container Low/Default/High**: Subtle layering for sections, feeds, and grouped content.
- **On-Surface (`#0d1c2e`)**: Primary text with excellent contrast.
- **On-Surface Variant (`#43474d`)**: Secondary text, metadata, timestamps.
- **Outline/Outline Variant**: Borders, dividers, and subtle framing.

### Named Accents
- **Accent Amber (`#f59e0b`)**: Commercial highlights and sponsored badges ("Destaque Comercial").
- **Badge Emergency (`#ef4444`)**: Emergency contacts and critical alerts.
- **Badge Success (`#10b981`)**: Verified/positive status indicators.
- **Error (`#ba1a1a`)**: Form validation errors and critical states.

**The Clarity Rule:** Color is used functionally—accents signal meaning, never decoration for its own sake.

## Typography

**Display Font:** Plus Jakarta Sans (800/700/600) — structural clarity and impact for headlines.  
**Body Font:** Inter (400) — highly legible for dense editorial content.  
**Label Font:** Plus Jakarta Sans (600/700) with increased tracking — instant categorization.

### Hierarchy
- **Display (40px/48px, 800, -0.02em):** Hero headlines only.
- **Display Mobile (30px/38px, 800, -0.015em):** Mobile hero headlines.
- **Headline LG (28px/36px, 700, -0.015em):** Section titles.
- **Headline MD (20px/28px, 600, -0.01em):** Card titles, module headers.
- **Headline SM (16px/24px, 600):** Subsection titles, compact cards.
- **Body LG (16px/26px, 400):** Lead paragraphs, primary content.
- **Body MD (14px/22px, 400):** Standard body text, descriptions.
- **Body SM (12px/18px, 400):** Metadata, captions, timestamps.
- **Label LG (14px/20px, 600, 0.01em):** Buttons, prominent labels.
- **Label MD (12px/16px, 700, 0.04em):** Category chips, section labels (often uppercase).
- **Label SM (10px/14px, 700, 0.06em):** Micro-labels, badges (often uppercase).

**The Readability Rule:** Body text maintains generous line height for comfortable scanning. Labels use tighter, tracked treatment for instant categorization.

## Layout

- **Max Width:** 1200px container for optimal scanning and ad placement.
- **Grid:** Responsive 12-column (desktop), 8-column (tablet), 4-column (mobile).
- **Gutters:** 1.25rem (desktop), 1rem (tablet), 0.75rem (mobile).
- **Page Margins:** 2rem (desktop), 1rem (mobile).
- **Spacing Scale:** xs(4px), sm(8px), md(16px), lg(24px), xl(40px).
- **Rhythm:** Sections separated by `space-xl` (40px). Cards use `space-md` (16px) internal padding. Micro-spacing uses `space-xs/sm`.

**The Scannability Rule:** Information flows vertically on mobile, expands into structured grids on larger viewports without sacrificing hierarchy.

## Elevation & Depth

The system prefers crisp edges and subtle layering over heavy shadows, maintaining institutional trust.

- **Level 0 (Canvas):** `#f8fafc` — base surface.
- **Level 1 (Cards/Tiles):** `#ffffff` with `1px solid #e2e8f0` and shadow `0 1px 3px rgba(15, 41, 66, 0.04), 0 1px 2px rgba(15, 41, 66, 0.02)`.
- **Level 2 (Sponsored/Highlight):** Amber-accented border (`#f59e0b`) with tinted shadow `0 4px 12px rgba(245, 158, 11, 0.08)`.
- **Level 3 (Hero/CTA):** Deep navy/blue gradients with shadow `0 12px 28px -4px rgba(15, 41, 66, 0.16)`.

**The Restraint Rule:** Shadows are ambient and subtle. Depth is primarily conveyed through surface color and borders.

## Shapes

- **Base Cards/Modules:** 8px (`0.5rem`) — crisp, modular, professional.
- **Lead Containers/Hero CTAs:** 16px (`1rem`) — slightly more prominent for conversion moments.
- **Badges/Chips/Action Buttons:** Pill geometry (`9999px`) — friendly, scannable categorization.
- **Inputs/Fields:** 8px (`0.5rem`) — clean, accessible.

**The Approachability Rule:** Rounded enough to feel welcoming, angular enough to feel authoritative.

## Components

### Buttons & CTAs
- **Primary (`Anuncie aqui`):** Background `#0050cc`, text `#ffffff`, pill shape, `label-lg`. Hover: `#001428`. Focus: visible outline.
- **Secondary/Ghost:** Transparent or subtle background, `#0050cc` text/border, pill shape.
- **Hero CTA:** Prominent placement in conversion blocks with strong contrast.

### Category Chips & Badges
- **Notícia:** `#f1f5f9` bg, `#0d1c2e` text, slate border.
- **Informativo/Aviso:** `#eff6ff` bg, `#1d4ed8` text, blue border.
- **Publicidade/Destaque:** `#fef3c7` bg, `#b45309` text, amber border.
- **Serviço Público:** `#ecfdf5` bg, `#047857` text, green border.
- **Emergency:** Red badge for critical contacts.

### News Feed Cards
- White card on canvas, 8px radius, subtle border/shadow.
- Structure: category chip + timestamp/source → headline (`headline-md`) → excerpt (`body-md`) → source link.
- Images only from RSS feeds when available (`next/image` with https).

### Commercial/Sponsor Cards
- Amber-accented frame for "Destaque Comercial".
- Business name, category, contact links (WhatsApp prioritized), verified indicators.
- Clear visual distinction without overpowering editorial content.

### Emergency & Public Utility Cards
- Prominent phone numbers, clear labels, 24-hour indicators when applicable.
- Optimized for quick scanning in urgent situations.

### Weather Widget
- Clean card with temperature, conditions, forecast. Uses functional icons (Material Symbols).

### Form & Inputs (`/anunciar`)
- 44px minimum tap height, 8px radius, white background, slate border.
- Focus: 3px outline/ring in `#0050cc` with offset.
- Validation errors clearly indicated with `#ba1a1a`.

## Do's and Don'ts

### Do:
- **Do** prioritize public utility content before advertising (home order: news, weather, notices, contacts, ads, promo).
- **Do** use semantic HTML and ensure all interactive elements meet 44px tap targets.
- **Do** label content with required `ContentLabel` (notícia, informativo, serviço-público, anúncio-gratuito, anúncio-patrocinado, divulgação-própria).
- **Do** sanitize external content and never use `dangerouslySetInnerHTML`.
- **Do** keep copy in pt-BR, factual, and community-focused.
- **Do** respect `prefers-reduced-motion` and provide visible focus states.

### Don't:
- **Don't** add user authentication, payments, comments, or marketplace features (constitutionally prohibited).
- **Don't** upload or store user images—only display images from RSS feeds.
- **Don't** copy full articles—show title, summary, date, source, and link.
- **Don't** present the portal as an official government organ.
- **Don't** invent decorative elements that compete with content hierarchy.
- **Don't** use heavy gradients/shadows that undermine the calm, trustworthy tone.
- **Don't** add search functionality (deliberately omitted per design decisions).
- **Don't** add alert bars or hero carousels that distract from utility.
