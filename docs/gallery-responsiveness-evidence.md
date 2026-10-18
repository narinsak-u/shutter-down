# Gallery responsiveness browser evidence

This record preserves the browser observations from the matched cache-disabled capture documented in the task-6 browser report. The measured integration snapshot was **75751d9**; it is not the final code after subsequent review changes. The original comparison was the supplied baseline at `19427d2`.

## Conditions and results

Fresh browser tabs used the same configured local Vite environment. Browser HTTP cache was disabled before navigation. The figures below are single captures, not statistical measurements. Request counts include development/runtime resources and Contentful requests.

| Viewport | Original FCP / LCP / CLS | Integration snapshot FCP / LCP / CLS | Original initial requests | Integration initial requests | Original journey requests | Integration journey requests |
|---|---|---|---:|---:|---:|---:|
| 390×844 | 220 ms / 452 ms / 0 | 196 ms / 396 ms / 0 | 65 | 60 | 22 | 21 |
| 1280×900 | 188 ms / 304 ms / 0.06 | 192 ms / 260 ms / 0 | 75 | 64 | 21 | 23 |

Journey requests were counted after clearing the initial-load request log; the journey included Nature filter, scroll-to-bottom, and Lightbox open. The request counts are cumulative within that journey and depend on runtime/data activity.

A supplemental mobile renderer trace and layout-shift capture (one run per version at 390×844, cache disabled and localStorage cleared) measured the journey of Nature filter, scroll-to-bottom, and settle:

| Trace metric | Original | Integration snapshot |
|---|---:|---:|
| `Layout` events / total duration | 37 / 2.023 ms | 36 / 2.146 ms |

| `UpdateLayoutTree` events / total duration | 128 / 8.163 ms | 131 / 9.630 ms |
| Non-input layout shifts after filter/scroll | 3 / 0.1162 total | 0 in this capture |

These are renderer trace event durations, not end-to-end settle times. A later integration capture showed no Photo-source shifts after hiding Photos until masonry positioning; a separate run recorded footer shifts totaling 0.1239. Broader CLS stability is therefore unproven.
The initial Gallery showed the same nine Photo IDs in the same order in both versions. After Nature filtering, images were visibly populated in final screenshots, but individual image completion timing was not instrumented. Lightbox opened in all tabs; “Loading interactions…” appeared briefly on the original mobile tab, followed by “No comments yet” on the integration mobile and both desktop tabs. These observations do not establish comparable loading duration.


## Exercised behavior and limitations

The browser exercised Gallery entry, category filtering, scrolling, responsive resize, Lightbox selection/order, and comment pagination. Resize from 390×844 to 1280×900 produced matching four-column card positions after a one-second settle in a controlled rerun; an earlier stacked integration capture was not reproduced. Live Contentful data provided no Photo with enough comments for pagination, so the UI pagination path was exercised with a temporary synthetic GET-only browser route returning five comments then two more. No comment write was submitted.

All comparisons are single-run observations. Request counts include dev/runtime resources; renderer durations are not end-to-end measurements; results varied across runs. They do not establish an overall performance improvement, and must not be treated as measurements of the final post-review code.
