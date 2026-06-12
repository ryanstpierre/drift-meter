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

test("rollingMean: empty samples yield empty array", () => {
  return eq(m.rollingMean([], 3), []);
});

test("rollingMean: single sample yields its own value", () => {
  return eq(m.rollingMean([{ t: 0, v: 10 }], 3), [10]);
});

test("rollingMean: full window averages the last n values", () => {
  return eq(m.rollingMean(s([2, 4, 6, 8]), 2), [2, 3, 5, 7]);
});

test("rollingMean: n=1 echoes each value", () => {
  return eq(m.rollingMean(s([5, 7, 9]), 1), [5, 7, 9]);
});

test("rollingMean: window wider than samples averages all so far", () => {
  return eq(m.rollingMean(s([3, 6]), 10), [3, 4.5]);
});

test("rollingMean: does not mutate input samples", () => {
  const input = s([2, 4, 6]);
  m.rollingMean(input, 2);
  return eq(input, [{ t: 0, v: 2 }, { t: 1, v: 4 }, { t: 2, v: 6 }]);
});

// --- drift ---

test("drift: empty samples yield no drifts", () => {
  return eq(m.drift([], 3, 5), []);
});

test("drift: single sample never drifts", () => {
  return eq(m.drift([{ t: 0, v: 100 }], 3, 0), []);
});

test("drift: flags value departing the prior rolling mean", () => {
  const out = m.drift(s([10, 10, 10, 20]), 3, 5);
  return Array.isArray(out) && out.length === 1 && out[0].t === 3 && out[0].v === 20;
});

test("drift: departure equal to tolerance is not a drift", () => {
  return eq(m.drift(s([10, 15]), 1, 5), []);
});

test("drift: baseline uses only the previous n values", () => {
  const out = m.drift(s([0, 0, 100, 100, 100, 100]), 2, 10);
  return Array.isArray(out) && eq(out.map((x) => x.t), [2, 3]);
});

test("drift: steady series within tolerance yields nothing", () => {
  return eq(m.drift(s([10, 11, 10, 11]), 2, 5), []);
});

test("drift: returns the original sample objects", () => {
  const a = { t: 0, v: 10 };
  const b = { t: 1, v: 10 };
  const c = { t: 2, v: 10 };
  const d = { t: 3, v: 20 };
  const out = m.drift([a, b, c, d], 3, 5);
  return Array.isArray(out) && out.length === 1 && out[0] === d;
});

// --- span ---

test("span: empty samples yield null min and max", () => {
  return eq(m.span([]), { min: null, max: null, range: null });
});

test("span: single sample collapses to zero range", () => {
  return eq(m.span([{ t: 0, v: 6 }]), { min: 6, max: 6, range: 0 });
});

test("span: reports min max and range over values", () => {
  return eq(m.span(s([3, 9, 1, 7])), { min: 1, max: 9, range: 8 });
});

test("span: spans negative and positive values", () => {
  return eq(m.span(s([-5, 5])), { min: -5, max: 5, range: 10 });
});

console.log(`RESULT ${pass} ${total}`);
