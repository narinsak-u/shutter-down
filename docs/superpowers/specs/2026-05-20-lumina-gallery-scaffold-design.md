# Design Specification: Lumina Gallery Scaffold

**Date:** 2026-05-20
**Topic:** Vue.js Scaffold for "Minimalist Photo Gallery" (Lumina)
**Status:** Draft

## 1. Overview
The goal is to build a functional Vue.js prototype based on the "Lumina Gallery" design. The application will feature a minimalist, editorial aesthetic with a responsive masonry grid, focusing on "The Invisible Frame" philosophy where content (photography) is the priority.

## 2. Architecture

### 2.1 Component Hierarchy
- `App.vue`: Main entry point, orchestrates global state and layout.
  - `Layout.vue`: Shared layout component containing the Header and Footer.
    - `AppHeader.vue`: Navigation, branding ("LUMINA"), and "Curated 2024" tag.
    - `AppFooter.vue`: Social links, copyright, and secondary navigation.
  - `GalleryHome.vue`: The primary view.
    - `MasonryGrid.vue`: Responsive grid container using CSS Grid and masonry spans.
      - `PhotoCard.vue`: Individual photo display with hover effects and metadata overlays.
    - `Lightbox.vue`: Full-screen modal for image expansion.

### 2.2 State Management
- **`stores/gallery.ts` (Pinia)**:
  - `photos`: Array of photo objects.
  - `activePhoto`: Reference to the photo currently opened in the Lightbox.
  - `isLightboxOpen`: Boolean toggle for the Lightbox modal.
  - `filter`: Current active filter (e.g., "All", "Architecture", "Nature").

## 3. Data Schema

### 3.1 Photo Object
```typescript
interface Photo {
  id: string;
  src: string;
  alt: string;
  location: string;
  date: string;
  aspectRatio: 'portrait' | 'landscape' | 'square';
  category: string;
}
```

## 4. Visual Design & Styling

### 4.1 Typography
- **Font Family**: Geist (Sans-serif)
- **Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700).
- **Styles**: Editorial tracking for headlines, uppercase for labels (`label-sm`).

### 4.2 Color Palette (Monochrome)
- `primary`: #000000 (Text, borders, primary actions)
- `secondary`: #5E5E5E (Metadata, secondary labels)
- `surface`: #F9F9F9 (Main backgrounds)
- `background`: #FFFFFF (Canvas, matting)
- `on-surface`: #1A1C1C (Secondary text)

### 4.3 Masonry Grid
- Implementation using CSS Grid `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))` with `grid-auto-rows: 10px`.
- Aspect ratios will be handled via `grid-row-end: span X` classes (Portrait: 45, Landscape: 25, Square: 35).

## 5. Interactions
- **Reveal on Scroll**: Photos fade and translate up as they enter the viewport using an `IntersectionObserver`.
- **Hover Zoom**: Images scale subtly (1.03x) within their containers on hover.
- **Lightbox**: clicking a photo opens a high-resolution view with a white/black backdrop.

## 6. Asset Strategy
- Use high-quality placeholders from Unsplash (or similar) hosted via CDN for the prototype.
- Local `public/images` folder for persistent static assets if needed.

## 7. Implementation Steps (Phases)
1. **Setup**: Configure Tailwind with custom colors, Geist font, and typography scale.
2. **Layout**: Build `Layout`, `AppHeader`, and `AppFooter`.
3. **Data**: Setup Pinia store with mock photo data.
4. **Gallery**: Implement `MasonryGrid` and `PhotoCard`.
5. **Interaction**: Implement the Lightbox and scroll reveal animations.
6. **Refinement**: Audit against "The Invisible Frame" philosophy for spacing and whitespace.
