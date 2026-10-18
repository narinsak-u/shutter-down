# Gallery responsiveness browser evidence

## Final snapshot and conditions

Final implementation snapshot: `5ae60d2516df8c331cd15cdbab2bc615ffca3ae5`. Baseline:
`19427d2f0284703ecd97fb3dceafb8e9e856f04f`.

Fresh browser tabs used the same local Vite setup at 390×844 and 1280×900. Browser cache was
disabled and localStorage cleared. Each measurement is one run; first-row images were loaded before
filtering to Nature, scrolling to the bottom, opening its first Photo, and waiting for the Lightbox.
Request logs were cleared before that journey. Counts include dev-server, font, Contentful,
preflight, and image requests.

| Viewport | Baseline FCP / LCP / CLS | Final FCP / LCP / CLS | Initial requests, baseline / final | Journey requests, baseline / final |
|---|---|---|---:|---:|
| 390×844 | 128 ms / 248 ms / 0 | 152 ms / 236 ms / 0 | 118 / 118 | 22 / 25 |
| 1280×900 | 172 ms / 308 ms / 0.04 | 160 ms / 324 ms / 0 | 128 / 130 | 21 / 23 |

## Renderer trace

The trace covers Nature filtering, scroll-to-bottom, and a one-second settle. Layout-shift totals
include buffered entries from page navigation through the journey and exclude entries with recent
input.

| Trace metric | Baseline mobile | Final mobile | Baseline desktop | Final desktop |
|---|---:|---:|---:|---:|
| `Layout` events / total duration | 40 / 2.182 ms | 25 / 3.497 ms | 35 / 1.930 ms | 30 / 2.078 ms |
| `UpdateLayoutTree` events / total duration | 120 / 7.945 ms | 104 / 23.758 ms | 113 / 8.553 ms | 112 / 8.723 ms |
| Non-input layout shifts / total score | 5 / 0.2047 | 3 / 0.0779 | 7 / 0.2259 | 2 / 0.0007 |

The final run had fewer layout events at both widths, but longer summed layout and style-update
durations. Initial desktop CLS was zero in the final run versus 0.04 in the baseline; mobile initial
CLS was zero in both. One run per condition does not establish a performance improvement.
Renderer event totals are not end-to-end settle times.

## User-visible checks and limitations

- The final initial Gallery showed nine Photos in the same observed order as the baseline. At 390
  pixels it used one column; resizing to 1280 pixels produced four columns at x=104, 378, 652, and
  926, then resizing back restored one column at x=24. A desktop tab also resized 1280→390→1280
  and returned to four columns.
- Lightbox navigation worked at both widths: mobile ArrowRight/ArrowLeft changed the selected Photo
  `54K5yTe4u5Ww6uzk5oLYif` → `3pop2mkFXIvL4ixKOXt7pb` → `54K5yTe4u5Ww6uzk5oLYif`; desktop
  Next/Previous changed `7IJVdV7Pn7HMGULuVTcXSL` → `2AI2BqYEAKgvU9XA2X6y1J` → `7IJVdV7Pn7HMGULuVTcXSL`.
- With a synthetic one-second cold Contentful response, baseline and final both showed `Loading...`
  with zero Photo cards while waiting, then showed nine Photos. The baseline first image was lazy
  with automatic priority; the final first image was eager/high-priority.
- At final width, the first Photo was eager/high-priority on mobile and the first four were
  eager/high-priority on desktop; remaining Photos were lazy. Checked images had width and height
  attributes.
- A synthetic stale-cache run kept nine cached Photos visible after a 400 refresh failure and showed
  Retry. Re-entering the sentinel loaded the next page at `skip=9`; all 18 resulting Photo IDs were
  unique. No write was made.
- Synthetic Comment responses showed five Comments initially, ten after loading more at mobile,
  then twelve after loading the final page at desktop. Requests used `(skip=0, limit=5)`,
  `(skip=5, limit=5)`, and `(skip=10, limit=5)`. No Like or Comment write request was made.
- The Photo ID `54K5yTe4u5Ww6uzk5oLYif` appeared twice in Nature-filtered results after scrolling in
  both baseline and final runs. Its cause is unknown; it was not attributed to the responsiveness
  changes.
- Geist font requests to jsDelivr failed in the browser runs. The production build passed but still
  reports a 516.47 kB JavaScript chunk above Vite’s 500 kB warning threshold.

No numeric performance target was set. The observations do not support an overall smoothness or
performance-improvement claim.
