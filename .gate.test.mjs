import * as m from "./index.mjs";

let pass = 0;
let total = 0;

function test(name, fn) {
  total++;
  let ok = false;
  try {
    ok = fn() === true;
  } catch {
    ok = false;
  }
  if (ok) pass++;
  console.log(`T ${ok ? 1 : 0} ${name}`);
}

function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function s(values) {
  return values.map((v, i) => ({ t: i, v }));
}

// --- rollingMean ---

test("rollingMean: empty input returns empty array", () => {
  return eq(m.rollingMean([], 4), []);
});

test("rollingMean: ramp averaged with a three-wide window", () => {
  return eq(m.rollingMean(s([1, 2, 3, 4, 5]), 3), [1, 1.5, 2, 3, 4]);
});

test("rollingMean: fractional values average exactly", () => {
  return eq(m.rollingMean(s([1.5, 2.5]), 2), [1.5, 2]);
});

test("rollingMean: negative values average correctly", () => {
  return eq(m.rollingMean(s([-2, -4, -6]), 2), [-2, -3, -5]);
});

test("rollingMean: window far wider than the series", () => {
  return eq(m.rollingMean(s([10, 20, 30]), 99), [10, 15, 20]);
});

test("rollingMean: output length always matches input length", () => {
  const out = m.rollingMean(s([9, 9, 9, 9]), 2);
  return Array.isArray(out) && out.length === 4;
});

test("rollingMean: depends on v only, not on t spacing", () => {
  const input = [{ t: 100, v: 6 }, { t: 5, v: 12 }, { t: 73, v: 0 }];
  return eq(m.rollingMean(input, 3), [6, 9, 6]);
});

test("rollingMean: does not reorder or mutate the input", () => {
  const input = [{ t: 7, v: 1 }, { t: 8, v: 3 }];
  m.rollingMean(input, 1);
  return eq(input, [{ t: 7, v: 1 }, { t: 8, v: 3 }]);
});

// --- drift ---

test("drift: empty input yields empty array", () => {
  return eq(m.drift([], 2, 1), []);
});

test("drift: single sample yields empty array", () => {
  return eq(m.drift([{ t: 9, v: -50 }], 1, 0), []);
});

test("drift: flags a spike above the prior mean", () => {
  const out = m.drift(s([1, 1, 1, 1, 9]), 4, 3);
  return Array.isArray(out) && out.length === 1 && out[0].t === 4 && out[0].v === 9;
});

test("drift: flags a downward departure", () => {
  const out = m.drift(s([50, 10]), 1, 20);
  return Array.isArray(out) && out.length === 1 && out[0].t === 1 && out[0].v === 10;
});

test("drift: departure exactly at tolerance is excluded", () => {
  return eq(m.drift(s([7, 10]), 2, 3), []);
});

test("drift: consecutive departures are both flagged", () => {
  const out = m.drift(s([0, 100, 0]), 1, 50);
  return Array.isArray(out) && eq(out.map((x) => x.t), [1, 2]);
});

test("drift: baseline window is capped at n previous values", () => {
  // at i=4 the true baseline is mean(0,0,0)=0 so |40-0|>30 drifts;
  // a window that wrongly spans ALL previous values gives mean 25 and misses it
  const out = m.drift(s([100, 0, 0, 0, 40]), 3, 30);
  return Array.isArray(out) && eq(out.map((x) => x.t), [1, 2, 3, 4]);
});

test("drift: fewer than n previous values uses all available", () => {
  const out = m.drift(s([10, 30]), 5, 10);
  return Array.isArray(out) && out.length === 1 && out[0].t === 1;
});

test("drift: returns the exact sample objects in order", () => {
  const a = { t: 0, v: 5 };
  const b = { t: 1, v: 50 };
  const c = { t: 2, v: 5 };
  const out = m.drift([a, b, c], 1, 20);
  return Array.isArray(out) && out.length === 2 && out[0] === b && out[1] === c;
});

// --- span ---

test("span: empty input gives null min max range", () => {
  return eq(m.span([]), { min: null, max: null, range: null });
});

test("span: mid values do not affect min and max", () => {
  return eq(m.span(s([2, 8, 5])), { min: 2, max: 8, range: 6 });
});

test("span: identical values give zero range", () => {
  return eq(m.span(s([7, 7, 7])), { min: 7, max: 7, range: 0 });
});

test("span: fractional values span exactly", () => {
  return eq(m.span(s([0.5, 2.25])), { min: 0.5, max: 2.25, range: 1.75 });
});

test("span: all-negative values", () => {
  return eq(m.span(s([-10, -3])), { min: -10, max: -3, range: 7 });
});

test("span: single negative sample", () => {
  return eq(m.span([{ t: 4, v: -4 }]), { min: -4, max: -4, range: 0 });
});

console.log(`RESULT ${pass} ${total}`);
