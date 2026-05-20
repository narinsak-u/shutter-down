# AGENTS.md — eyesup-shutterdown

## Tech Stack
- **Framework:** Vue 3 (Composition API, `<script setup lang="ts">`)
- **Language:** TypeScript ~6.0
- **State:** Pinia (composition stores)
- **Routing:** Vue Router 5
- **Styling:** TailwindCSS v4
- **Build:** Vite 8
- **Testing:** Vitest 4 + jsdom + @vue/test-utils 2
- **Linting:** ESLint 10 + oxlint 1.60
- **Type-checking:** vue-tsc 3
- **Node:** ^20.19.0 \|\| >=22.12.0

## Commands
| Command | Action |
|---|---|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | Type-check + build |
| `npm run build-only` | Build without type-check |
| `npm run type-check` | `vue-tsc --build` |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run all unit tests (Vitest) |
| `npm run lint` | oxlint + ESLint with --fix |
| `npm run lint:oxlint` | oxlint . --fix |
| `npm run lint:eslint` | ESLint . --fix --cache |

### Running a single test
```sh
npx vitest run src/__tests__/App.spec.ts
npx vitest run src/__tests__/App.spec.ts --reporter=verbose
```

### Watch mode
```sh
npx vitest src/__tests__/App.spec.ts
```

## Code Style

### Vue SFC Structure
Components use `<script setup lang="ts">` with three sections in order:
1. `<script setup lang="ts">` — imports, props, state, logic
2. `<template>` — markup
3. `<style>` (not currently used — styles are in `src/style.css`)

### Imports
- External packages first (`vue`, `pinia`, `vue-router`)
- Internal `@/` alias next (`@/stores/gallery`)
- Relative imports last (`./GalleryItem.vue`)
- CSS imports at the bottom of script section

### Quotes & Semicolons
- **Double quotes** in Vue templates (`"`)
- **Double quotes** in `<script setup>` blocks (`"`) — observed inconsistently with TS files
- **Single quotes** in standalone `.ts` files (`'`)
- **Semicolons** used in `<script setup>` blocks
- **No semicolons** in standalone `.ts` files

### TypeScript
- Define component props with generic syntax: `defineProps<{ name: string; count: number }>()`
- Define emits with generic syntax: `defineEmits<{ click: [value: string] }>()`
- Use `defineModel<boolean>({ default: false })` for v-model
- Use `defineOptions({ name: "ComponentName" })` for component name (required for single-word filenames to satisfy `vue/multi-word-component-names`)
- Export interfaces with `interface` keyword (not `type`)
- Use `ref<T>()`, `computed<T>()`, `watch()` from Vue
- Enable `noUncheckedIndexedAccess` in tsconfig (guard array accesses)

### Naming
- **Files:** PascalCase for components (`GalleryItem.vue`), camelCase for stores (`gallery.ts`)
- **Components:** PascalCase, multi-word via `defineOptions` if filename is single-word
- **Stores:** `use<Name>Store` function, `defineStore('name', () => {...})`
- **Refs:** camelCase (`activeFilter`, `lightboxOpen`)
- **Functions:** camelCase (`openLightbox`, `setFilter`, `handleKeydown`)
- **Events/Slots:** kebab-case in templates (`@click`, `v-model`)
- **Test files:** `*.spec.ts` in `src/__tests__/`

### State Management (Pinia)
- Use composition store syntax: `defineStore('name', () => { ... return { ... } })`
- Return all public refs/computed/functions from the store
- Access store state with `.value` in script, no `.value` in templates

### Testing
- Use `describe` / `it` / `expect` from vitest
- Mount with `@vue/test-utils`: `mount(Component)`
- Set up Pinia per test: `setActivePinia(createPinia())`
- Mock globals with `vi.stubGlobal()` and restore with `vi.unstubAllGlobals()`
- Add type params to all `vi.fn()` calls (enforced by `require-mock-type-parameters`)
- Use `function` keyword (not arrow) for `vi.fn()` implementations that must be constructible (e.g. `new IntersectionObserver(...)`)
- Test files: one `describe` block per component, `it` for individual behaviors

### Linting Rules
- oxlint config: plugins eslint, typescript, unicorn, oxc, vue, vitest
- `source.fixAll` runs on save in VSCode
- Indent: 2 spaces (EditorConfig)
- Max line length: 100
- LF line endings, UTF-8, trailing newline
- Trim trailing whitespace

### TailwindCSS
- Use `@theme` block in `style.css` for design tokens (`--color-*`, `--spacing-*`, `--radius-*`)
- Use `@utility` for custom utility classes (`text-headline-xl`, `font-label-sm`)
- Use `material-symbols-outlined` utility for icon font

### Component Patterns
- Define component name with `defineOptions({ name: "MultiWordName" })` when filename is single-word (satisfies `vue/multi-word-component-names`)
- Store lifecycle: `onMounted` / `onUnmounted` for event listeners (clean up always)
- Use `nextTick` from vue when DOM needs updating after reactive changes
- Use `v-for` with `:key` on unique ids
- Default slot content for empty states
- Avoid dead code: no commented-out imports, template elements, or components
