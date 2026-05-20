---
name: Minimalist Gallery
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e3e2e2'
  on-secondary-container: '#646464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-margin-desktop: 64px
  container-margin-mobile: 24px
  gutter: 24px
  section-gap: 80px
---

## Brand & Style

The design system is rooted in the philosophy of "The Invisible Frame." It prioritizes content above all else, using generous whitespace and a restricted color palette to ensure that imagery remains the focal point. The aesthetic is modern minimalism with a sophisticated, editorial edge—reminiscent of a high-end physical art gallery.

The target audience consists of photographers, designers, and collectors who value curation and clarity. The UI should evoke a sense of calm, precision, and premium quality. By stripping away non-essential decorative elements, the design system creates a focused environment where every interaction feels intentional and fluid.

## Colors

The color strategy is strictly monochromatic to prevent UI elements from competing with the user's uploaded media. 

- **Primary (#000000):** Reserved for high-contrast text, primary actions, and structural boundaries. It represents authority and focus.
- **Secondary (#757575):** Used for metadata, secondary labels, and icon states that require less visual weight.
- **Surface & Neutrals (#F5F5F5, #E0E0E0):** These tones define the architecture of the app. Use the lighter gray for large background areas and the darker gray for subtle dividers and borders.
- **Background (#FFFFFF):** The canvas. Pure white is used to maximize the perceived brightness and "airiness" of the interface.

## Typography

This design system utilizes **Geist** for its technical precision and elegant, monolinear construction. The typography is treated as a structural element rather than a decorative one.

- **Scale:** Use tight tracking for headlines to create a "locked-in" editorial look.
- **Hierarchy:** High contrast in weight (SemiBold vs. Regular) is preferred over color changes to denote hierarchy.
- **Labels:** Use uppercase for the smallest labels (`label-sm`) to ensure legibility and give them a distinct "catalog" feel.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model. While the outer margins are fixed to provide a consistent frame, the internal grid for imagery is fluid to accommodate varying aspect ratios.

- **Rhythm:** An 8px base unit drives all spacing. 
- **The Frame:** Large outer margins (64px on desktop) create a "matting" effect around the content, similar to a framed photograph.
- **Negative Space:** Do not fear empty rows. If a gallery section ends, use a generous `section-gap` before the next heading to provide visual breathing room.

## Elevation & Depth

This design system avoids traditional drop shadows to maintain its clean, flat-minimalist aesthetic. Depth is instead conveyed through:

- **Tonal Layering:** Interactive elements sit on a #F5F5F5 surface, while the main background remains #FFFFFF.
- **Low-Contrast Outlines:** Buttons and cards are defined by 1px solid borders in #E0E0E0. This creates a "hairline" detail that feels architectural and precise.
- **Z-Index Shifts:** When an image is expanded, use a solid #FFFFFF or #000000 overlay with 100% opacity to completely remove the background context, rather than a translucent blur.

## Shapes

To maintain a sophisticated and professional look, this design system uses a **Soft** (0.25rem) corner radius. This is enough to take the "edge" off the UI without making it appear playful or "bubbly."

- **Imagery:** Photos should remain sharp (0px radius) to respect the original work's integrity.
- **UI Elements:** Buttons, input fields, and small cards use the base `rounded` (4px) setting.
- **Interactive States:** Hover states should transition smoothly with a subtle change in border color or a very light gray fill.

## Components

### Buttons
- **Primary:** Solid #000000 background with #FFFFFF text. No radius or 4px radius. 
- **Ghost:** 1px #E0E0E0 border with #000000 text. On hover, the border darkens to #000000.

### Input Fields
- Underline style or subtle 1px border. Focus state is indicated by a shift from #E0E0E0 to #000000. Labels should be `label-sm` and sit above the input.

### Cards & Grid Items
- **Image Containers:** No borders, no shadows. The image fills the container entirely.
- **Metadata:** Placed directly below the image in `label-md`, left-aligned.

### Navigation
- Top-aligned with high horizontal padding. Use `label-sm` for nav links with a persistent underline for the active state.

### Transitions
- All interactive states (hover, focus) must use a 200ms "ease-out" transition. Gallery filtering should use a simple opacity fade (300ms) rather than complex sliding animations.