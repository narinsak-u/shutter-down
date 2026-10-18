# Gallery responsiveness browser evidence

## Final snapshot and conditions

Final implementation snapshot: `2f24337429fe9ae4fcf9bb3ca2a1a62f6aacf9d6`. Baseline:
`19427d2f0284703ecd97fb3dceafb8e9e856f04f`.

Fresh browser tabs used the same local Vite environment at 390×844 and 1280×900, with browser
cache disabled and localStorage cleared. Each result is a single run. Initial requests were counted
after first render; journey requests were counted after clearing that log, then filtering to Nature,
scrolling to the bottom, opening the first filtered Photo, and waiting for the Lightbox.

| Viewport | Baseline FCP / LCP / CLS | Final FCP / LCP / CLS | Initial requests, baseline / final | Journey requests, baseline / final |
|---|---|---|---:|---:|
| 390×844 | 220 ms / 452 ms / 0 | 140 ms / not observed / 0 | 65 / 65 | 22 / 15 |
| 1280×900 | 188 ms / 304 ms / 0.06 | 156 ms / not observed / 0 | 75 / 66 | 21 / 17 |

The final LCP observer returned no entry at either viewport; no LCP conclusion is possible. Final
CLS was zero in the initial and filter/scroll captures, but one run does not establish sustained
stability. Request counts include dev-server resources, fonts, Contentful, and image activity.
The baseline values come from the previously recorded matched comparison; all counts and timings
are descriptive, not statistically controlled.

## Renderer trace

The mobile trace covered Nature filtering, scroll-to-bottom, and one-second settle. The desktop
trace used the same journey. The baseline desktop trace was not captured.

| Trace metric | Baseline mobile | Final mobile | Final desktop |
|---|---:|---:|---:|
| `Layout` events / total duration | 37 / 2.023 ms | 22 / 3.726 ms | 33 / 1.831 ms |
| `UpdateLayoutTree` events / total duration | 128 / 8.163 ms | 118 / 24.778 ms | 120 / 7.497 ms |
| Non-input layout shifts after filter/scroll | 3 / 0.1162 | 0 | 0 |

The final mobile trace had fewer events but longer summed `UpdateLayoutTree` duration than the
baseline; the single-run results do not establish an overall performance improvement. Trace
durations are renderer event totals, not end-to-end settle times.

## User-visible checks and limitations

- The same nine Photo IDs appeared in the same initial order. At mobile width, the initial Photo
  was eager/high-priority and the other eight were lazy; at desktop width, the first four were
  eager/high-priority and the other five were lazy. Every checked image had width/height attributes.
- The Gallery remained visible from a stale cache while a synthetic refresh was pending and after
  a synthetic 400 response; the error and Retry control appeared. A synthetic successful retry
  replaced the stale Photo. No write was made.
- Synthetic comment responses at both viewports showed five comments, then appended two after
  “Load more”. Requests were `(skip=0, limit=5)` then `(skip=5, limit=5)`; the pagination action
  added no Like requests. Live Photos had no comments available for this check; no Comment was
  submitted.
- Nature filtering and scrolling displayed the same duplicate Photo ID in both the baseline record
  and final browser run. Its cause is unknown and was not attributed to this layout change.
- Geist font requests to jsDelivr failed in the browser runs; this external loading issue can affect
  typography and timing observations.

No numeric performance target was set; these observations are evidence, not a pass threshold.
