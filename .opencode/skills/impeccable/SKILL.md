---
name: impeccable
description: Design, redesign, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, typeset, layout, or otherwise improve a frontend interface. Covers websites, dashboards, product UI, components, forms, settings, onboarding, empty states. UX review, visual hierarchy, accessibility, performance, responsive behavior, theming, typography, spacing, layout, color, motion, micro-interactions, UX copy, error states, edge cases, and design systems.
license: Apache 2.0
---

Design and iterate production-grade frontend interfaces. Real working code, committed design choices, exceptional craft.

## Setup

1. Familiarize yourself with the project's existing design system, conventions, and components. Read at least one CSS/tokens/theme file and one representative component or page. Don't reinvent the wheel; use what's there when it works, branch out when the UX wins.

2. Read the matching register reference. If the project is marketing, landing page, campaign, or portfolio (design IS the product), read `reference/brand.md`. If it is app UI, admin, dashboard, or tool (design SERVES the product), read `reference/product.md`.

3. If brand-new (no existing CSS tokens / theme / committed brand colors), propose a brand seed color and composition guidance. Use OKLCH throughout. Skip if committed brand colors exist in existing tokens — identity-preservation wins.

## Design guidance

### Color

- **Verify contrast.** Body text must hit ≥4.5:1 against its background; large text (≥18px or bold ≥14px) needs ≥3:1. Placeholder text needs the same 4.5:1.
- Gray text on a colored background looks washed out. Use a darker shade of the background's own hue, or a transparency of the text color.

### Typography

- Cap body line length at 65–75ch.
- Don't pair fonts that are similar but not identical. Pair on a contrast axis or use one family in multiple weights.
- Hero/display heading `clamp()` max ≤ 6rem (~96px).
- Display heading letter-spacing floor ≥ -0.04em.
- Use `text-wrap: balance` on h1–h3; `text-wrap: pretty` on long prose.

### Layout

- Vary spacing for rhythm.
- Cards are the lazy answer. Use them only when they're truly the best affordance. Nested cards are always wrong.
- Flexbox for 1D, Grid for 2D.
- For responsive grids without breakpoints: `repeat(auto-fit, minmax(280px, 1fr))`.
- Build a semantic z-index scale. Never arbitrary values like 999 or 9999.

### Motion

- Motion should be intentional, never an afterthought.
- Don't animate CSS layout properties unless truly needed.
- Ease out with exponential curves. No bounce, no elastic.
- Every animation needs a `@media (prefers-reduced-motion: reduce)` alternative.
- Reveal animations must enhance an already-visible default. Don't gate content visibility on a class-triggered transition.

### Interaction

- Dropdowns inside `overflow: hidden` will be clipped. Use `<dialog>`, `position: fixed`, or a portal.

### New projects only (when no prior work exists)

- Use OKLCH.
- **Avoid cream/sand/beige body bg** — the saturated AI default of 2026.
- Tinted neutrals: add 0.005–0.015 chroma toward the brand's hue.
- Pick a **color strategy** before picking colors:
  - **Restrained**: tinted neutrals + one accent ≤10%. Product default.
  - **Committed**: one saturated color carries 30–60% of the surface. Brand default.
  - **Full palette**: 3–4 named roles, each used deliberately.
  - **Drenched**: the surface IS the color. Brand heroes, campaign pages.

### Absolute bans

- **Side-stripe borders** (`border-left`/`border-right` >1px as accent)
- **Gradient text** (`background-clip: text` + gradient)
- **Glassmorphism as default** — rare and purposeful, or nothing
- **Hero-metric template** — big number + small label + stats
- **Identical card grids** — same-sized cards with icon + heading + text
- **Tiny uppercase tracked eyebrow above every section** — one deliberate kicker is voice; on every section is AI grammar
- **Numbered section markers as default scaffolding** (01/02/03)
- **Text that overflows its container** — test heading copy at every breakpoint

### The AI slop test

Two-order check:
1. Could someone guess the theme + palette from the category alone? If yes, rework.
2. Could someone guess the aesthetic family from category-plus-anti-references? If yes, rework deeper.

## Commands

| Command | Category | Description |
|---------|----------|-------------|
| `craft [feature]` | Build | Shape, then build a feature end-to-end |
| `shape [feature]` | Build | Plan UX/UI before writing code |
| `init` | Build | Set up project context |
| `document` | Build | Generate DESIGN.md from existing code |
| `extract [target]` | Build | Pull reusable tokens and components |
| `critique [target]` | Evaluate | UX design review with heuristic scoring |
| `audit [target]` | Evaluate | Technical quality checks (a11y, perf, responsive) |
| `polish [target]` | Refine | Final quality pass before shipping |
| `bolder [target]` | Refine | Amplify safe or bland designs |
| `quieter [target]` | Refine | Tone down aggressive designs |
| `distill [target]` | Refine | Strip to essence, remove complexity |
| `harden [target]` | Refine | Production-ready: errors, i18n, edge cases |
| `onboard [target]` | Refine | Design first-run flows, empty states |
| `animate [target]` | Enhance | Add purposeful animations and motion |
| `colorize [target]` | Enhance | Add strategic color to monochromatic UIs |
| `typeset [target]` | Enhance | Improve typography hierarchy and fonts |
| `layout [target]` | Enhance | Fix spacing, rhythm, visual hierarchy |
| `delight [target]` | Enhance | Add personality and memorable touches |
| `overdrive [target]` | Enhance | Push past conventional limits |
| `clarify [target]` | Fix | Improve UX copy, labels, error messages |
| `adapt [target]` | Fix | Adapt for different devices and screen sizes |
| `optimize [target]` | Fix | Diagnose and fix UI performance |
| `live [target]` | Iterate | Visual variant mode: iterate on UI elements |

## Routing

1. **No argument:** Present 2-3 highest-value next commands from the table above based on project signals.
2. **First word matches a command:** Load `reference/<command>.md` and follow its instructions.
3. **First word doesn't match but intent maps clearly:** Load that command's reference.
4. **No clear match:** Apply the General rules and register reference using the full argument as context.
