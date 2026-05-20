# Gallery Animation and Ease Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore scroll reveal animation classes and unify image zoom transition easing.

**Architecture:** Surgical updates to Vue component classes and CSS transition properties to ensure visual consistency.

**Tech Stack:** Vue 3, Tailwind CSS, CSS.

---

### Task 1: Restore Scroll Reveal Classes

**Files:**
- Modify: `src/components/GalleryItem.vue`

- [ ] **Step 1: Add initial state classes to root div**

Add `opacity-0 translate-y-8` to the class list of the root `div` in `GalleryItem.vue`.

```vue
<template>
  <div
    :class="['masonry-item group relative overflow-hidden bg-surface-container cursor-pointer opacity-0 translate-y-8', type]"
    @click="$emit('click')"
  >
```

- [ ] **Step 2: Verify component still compiles**

Run: `npm run build`
Expected: SUCCESS

### Task 2: Unify Image Zoom Easing

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: Update .image-zoom transition**

Modify the `.image-zoom` rule to use the unified easing.

```css
.image-zoom {
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: SUCCESS

### Task 3: Final Verification and Commit

- [ ] **Step 1: Run all tests**

Run: `npm run test:unit`
Expected: ALL PASS

- [ ] **Step 2: Final lint check**

Run: `npm run lint`
Expected: SUCCESS

- [ ] **Step 3: Commit changes**

Run: `git add src/components/GalleryItem.vue src/style.css`
Run: `git commit -m "fix: restore scroll reveal classes and unify animation easing"`
Expected: SUCCESS
