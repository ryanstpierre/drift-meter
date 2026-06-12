# sample-stats

A tiny pure-function library over time-series samples of the shape `{t, v}`, where `t` is a timestamp (any comparable value — never used in arithmetic) and `v` is a numeric value. All functions are pure: they never mutate or reorder their input.

### `rollingMean(samples, n) → means`

Given an array of `{t, v}` samples and a positive integer window size `n`, return an array of numbers of the same length as `samples`. Element `i` is the arithmetic mean of the `v` values in the window ending at sample `i`: the last `min(i + 1, n)` values up to and including `v[i]`. Early samples with fewer than `n` predecessors average over all values seen so far. Only `v` matters — `t` spacing is irrelevant. An empty input yields `[]`. The input array and its sample objects are not mutated.

### `drift(samples, n, tolerance) → drifted`

Given an array of `{t, v}` samples, a positive integer `n`, and a numeric `tolerance`, return the samples whose value departs from the baseline by **strictly more than** `tolerance` in absolute terms. The baseline for sample `i` is the arithmetic mean of the `v` values of the up-to-`n` samples immediately preceding it (indices `max(0, i - n)` through `i - 1` — the current sample is never part of its own baseline, and the window never exceeds `n` previous values). A sample with no predecessors (the first sample) can never drift. A departure exactly equal to `tolerance` is NOT a drift. Departures in either direction (above or below the baseline) count. The result contains the original sample objects (same references), in their original input order. Empty or single-sample input yields `[]`.

### `span(samples) → {min, max, range}`

Given an array of `{t, v}` samples, return an object `{min, max, range}` over the `v` values: `min` is the smallest value, `max` the largest, and `range` is `max - min`. A single sample yields `min === max` and `range === 0`. An empty input yields `{min: null, max: null, range: null}`. The input is not mutated.
