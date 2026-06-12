export function rollingMean(samples, n) {
  return undefined;
}

export function drift(samples, n, tolerance) {
  return undefined;
}

export function span(samples) {
  if (samples.length === 0) return { min: null, max: null, range: null };
  let min = samples[0].v;
  let max = samples[0].v;
  for (const { v } of samples) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max, range: max - min };
}
