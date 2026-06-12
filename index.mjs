export function rollingMean(samples, n) {
  const means = [];
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i].v;
    if (i >= n) sum -= samples[i - n].v;
    means.push(sum / Math.min(i + 1, n));
  }
  return means;
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
