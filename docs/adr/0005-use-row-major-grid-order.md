# Use measured row-major masonry placement

The gallery places photos in source order into the currently shortest responsive column, using each card's rendered height so the visual result packs like Pinterest while retaining row-major insertion order. This replaces both the original CSS column flow and the fixed row-span approximation.

## Consequences

The layout requires repositioning cards after resize and lazy-image loading, so cards can reflow as their dimensions become known. DOM order, keyboard navigation, filtering, and lightbox order remain source-driven; stored image dimensions can later reduce reflow.
