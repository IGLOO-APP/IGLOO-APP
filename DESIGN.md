---
name: IGLOO Design System
description: The visual language for IGLOO, a crisp, cool-toned property management dashboard.
colors:
  primary: "#13c8ec"
  primary-dark: "#0ea5c3"
  primary-light: "#e0f7fa"
  primary-hover: "#0fb1d1"
  background-light: "#f8fafc"
  background-dark: "#0b1011"
  surface-light: "#ffffff"
  surface-dark: "#141b1d"
  slate-main: "#0f172a"
  slate-body: "#475569"
  slate-muted: "#94a3b8"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontWeight: 900
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "12px"
  lg: "24px"
  xl: "32px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.slate-main}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.lg}"
---

# Design System: IGLOO Design System

## 1. Overview

**Creative North Star: "The Arctic Vault"**

"The Arctic Vault" is a visual metaphor that guides the user interface of IGLOO. It projects security, clarity, and precision through a cool-toned palette, glassmorphic textures, and smooth transitions. The interface feels solid, secure, and reassuring, like a modern digital vault designed to handle critical financial and property details.

This system rejects saturated cream or warm-sand tones, which feel soft or outdated for property management. Instead, it utilizes frosty whites, deep slate-navies, and glacier-cyan highlights.

**Key Characteristics:**
- **Cool-Toned Professionalism**: Slate grays, deep blacks, and glacier cyans establish a premium look.
- **Tactile Softness**: Cards and panels use rounded corners up to 32px to look friendly yet structured.
- **Glassmorphism & Layering**: Backdrop blurs simulate depth without cluttering the screen.
- **Active Responsiveness**: Elements physically react to clicks with smooth scale-down effects (active-tap).

## 2. Colors

A premium, cool-toned palette centered around glacier cyan accents and deep slate backgrounds.

### Primary
- **Glacier Cyan** (#13c8ec): Used for primary call-to-actions, active navigation highlights, and interactive states.
- **Glacier Dark** (#0ea5c3): Used for button hover states and deep accents.
- **Glacier Light** (#e0f7fa): Used for subtle background highlights behind cyan icons or text.

### Neutral
- **Frost White** (#f8fafc): Clean, bright background for light mode.
- **Abyssal Dark** (#0b1011): The overall dark mode background.
- **Igloo Interior** (#141b1d): The dark mode surface color for cards and panels.
- **Slate Main** (#0f172a): Deep text and title color in light mode.
- **Slate Body** (#475569): Secondary text and copy color.
- **Slate Muted** (#94a3b8): Non-essential metadata, borders, and disabled states.

### Named Rules
**The Glacier Accent Rule.** The primary color (#13c8ec) must be used on ≤10% of any given screen. Its role is strictly functional: to draw attention to primary actions, states, or key highlights.

## 3. Typography

**Display Font:** Manrope (with sans-serif fallback)
**Body Font:** Manrope (with sans-serif fallback)

**Character:** A single typography family in multiple weights. It looks ultra-modern, geometric, and clean, conveying structural stability.

### Hierarchy
- **Display** (Weight 900, clamp(2rem, 5vw, 3.5rem), line-height 1.1, tracking-tighter): Used for large hero values, key metrics, and dashboard summary numbers.
- **Headline** (Weight 800, 24px-30px, line-height 1.2): Used for primary section titles.
- **Title** (Weight 700, 18px-20px, line-height 1.3): Used for cards and details.
- **Body** (Weight 500, 14px-16px, line-height 1.5): Used for descriptions, labels, and table contents. Max line length capped at 75ch.
- **Label** (Weight 900, 11px, letter-spacing 0.15em, uppercase): Used for eyebrows, metadata tags, and table headers.

## 4. Elevation

The system uses a layered approach where surfaces float on top of a base background using subtle borders and soft, modern shadows.

### Shadow Vocabulary
- **Premium Shadow** (`box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 4px 10px -5px rgba(0, 0, 0, 0.02)`): Used on cards at rest to lift them from the background.
- **Premium Hover Shadow** (`box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 8px 20px -10px rgba(0, 0, 0, 0.04)`): Used on interactive elements when hovered.
- **Cyan Glow** (`box-shadow: 0 0 20px rgba(19, 200, 236, 0.15)`): Used selectively for active, focused elements.

### Named Rules
**The Interaction Lift Rule.** Shadows are light and ambient at rest. Upon hover, cards lift physically (translateY(-2px)) and their shadow becomes softer and more diffused to indicate clickability.

## 5. Components

### Buttons
- **Shape:** Rounded corners (6px).
- **Primary:** Background color #13c8ec, text color #0f172a, padding 10px 16px.
- **Hover / Focus:** Transitions background to #0fb1d1. Active states scale down to 96% for tactile response.

### Cards / Containers
- **Corner Style:** Large rounded corners (24px to 32px).
- **Background:** White (#ffffff) in light mode, Igloo Interior (#141b1d) in dark mode.
- **Border:** 1px solid slate-200/60 in light mode, 1px solid white/5 in dark mode.
- **Shadow Strategy:** Uses Premium Shadow at rest, transitioning to Premium Hover Shadow on interactive cards.

### Inputs / Fields
- **Style:** 1px border, 12px rounded corners, padding 12px 16px.
- **Focus:** Highlighted with a 2px Glacier Cyan border and optional Cyan Glow.

## 6. Do's and Don'ts

### Do:
- **Do** use large rounded corners (24px to 32px) on main dashboard panels.
- **Do** ensure text on Glacier Cyan accents has high contrast (e.g. Slate Main #0f172a).
- **Do** implement a scaling click reaction (active-tap) on all interactive cards.

### Don't:
- **Don't** use warm, saturated cream, sand, or beige backgrounds.
- **Don't** use raw, solid black or bright blue borders; use translucent slate-200/60 or white/5 instead.
- **Don't** pair competing display fonts; maintain Manrope as the single family.
