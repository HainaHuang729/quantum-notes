import assert from "node:assert/strict";
import {
  smallOscillationState,
  potential,
  harmonicPotential,
  force,
  harmonicForce,
  quantize,
  shiftParameter,
  SMALL_OSC_LIMITS,
  SMALL_OSC_PRESETS,
  SMALL_OSC_THRESHOLD,
} from "../../src/sections/widgets/small-oscillation.mjs";

const close = (a, b, tol = 1e-10) => {
  assert.ok(Math.abs(a - b) < tol, `${a} != ${b} (tol ${tol})`);
};

function simpson(f, a, b, n = 400) {
  assert.equal(n % 2, 0);
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i += 1) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

const A_LIMIT = SMALL_OSC_LIMITS.A;
const G_LIMIT = SMALL_OSC_LIMITS.g;

// The force is checked by an independent central difference of V(q), and V is
// checked by integrating -F from the origin. Neither check substitutes the
// implementation's own derivative.
let derivativeChecks = 0;
for (const g of [0, 0.01, 0.05, 0.2, 0.5]) {
  for (const q of [-3.5, -1.7, -0.3, 0, 0.25, 1, 2.8]) {
    const h = 1e-5;
    const numericDerivative = -(potential(q + h, g) - potential(q - h, g)) / (2 * h);
    close(force(q, g), numericDerivative, 2e-7);
    close(potential(q, g), simpson((x) => -force(x, g), 0, q), 2e-10);
    close(harmonicPotential(q), simpson((x) => -harmonicForce(x), 0, q), 2e-10);
    close(harmonicForce(q), -q);
    derivativeChecks += 1;
  }
}

// The quartic model is exactly the one advertised.
close(potential(1, 0.1), 0.525);
close(potential(2, 0.5), 4);
close(force(1, 0.1), -1.1);
close(force(-2, 0.5), 6);

// Relative corrections at a turning amplitude are independently recomputed as
// energy and force ratios, not read back from the state object.
let correctionChecks = 0;
for (const A of [0.1, 0.2, 1, 1.5, 2, 3]) {
  for (const g of [0, 0.01, 0.05, 0.1, 0.2, 0.5]) {
    const s = smallOscillationState({ A, g });
    const relPotential = (s.potential(A) - s.harmonicPotential(A)) / s.harmonicPotential(A);
    const relForce = (Math.abs(s.force(A)) - Math.abs(s.harmonicForce(A))) / Math.abs(s.harmonicForce(A));
    close(relPotential, (g * A * A) / 2);
    close(relForce, g * A * A);
    close(s.correctionPotential, relPotential);
    close(s.correctionForce, relForce);
    close(s.turningPotential, potential(A, g));
    close(s.harmonicTurning, harmonicPotential(A));
    close(s.turningForce, force(A, g));
    close(s.harmonicForceAtTurning, harmonicForce(A));
    correctionChecks += 1;
  }
}

// g=0 is an exact branch for every amplitude, not a tolerance decision.
for (const A of [0.1, 0.7, 1.2, 2.4, 3]) {
  const s = smallOscillationState({ A, g: 0 });
  assert.equal(s.branch, "exact");
  assert.equal(s.correctionPotential, 0);
  assert.equal(s.correctionForce, 0);
  for (const q of [-A, -A / 3, 0, A / 2, A]) {
    assert.equal(s.potential(q), s.harmonicPotential(q));
    assert.equal(s.force(q), s.harmonicForce(q));
  }
}

// A fixed 5% teaching line: the force branch is inclusive at equality and the
// potential-only branch is entered once the force ratio exceeds it.
{
  const onForceLine = smallOscillationState({ A: 1, g: 0.05 });
  close(onForceLine.correctionForce, 0.05, 1e-13);
  close(onForceLine.correctionPotential, 0.025, 1e-13);
  assert.equal(onForceLine.branch, "within");

  assert.equal(smallOscillationState({ A: 1, g: 0.04 }).branch, "within");
  close(smallOscillationState({ A: 1, g: 0.04 }).correctionForce, 0.04);
  assert.equal(smallOscillationState({ A: 1, g: 0.06 }).branch, "potential-only");
  close(smallOscillationState({ A: 1, g: 0.06 }).correctionPotential, 0.03);

  const onPotentialLine = smallOscillationState({ A: 1, g: 0.1 });
  close(onPotentialLine.correctionPotential, 0.05, 1e-13);
  close(onPotentialLine.correctionForce, 0.1, 1e-13);
  assert.equal(onPotentialLine.branch, "potential-only");
  assert.equal(smallOscillationState({ A: 1, g: 0.11 }).branch, "outside");
  close(smallOscillationState({ A: 1, g: 0.11 }).correctionPotential, 0.055);

  // Doubling A quadruples both corrections because both ratios are quadratic
  // in the amplitude.
  const base = smallOscillationState({ A: 0.6, g: 0.1 });
  const doubled = smallOscillationState({ A: 1.2, g: 0.1 });
  close(doubled.correctionForce, 4 * base.correctionForce);
  close(doubled.correctionPotential, 4 * base.correctionPotential);
}

// Every point of the actual control grid, including endpoints, yields finite
// plot windows and finite curves that stay inside those windows.
const aSteps = Math.round((A_LIMIT.max - A_LIMIT.min) / A_LIMIT.step);
const gSteps = Math.round((G_LIMIT.max - G_LIMIT.min) / G_LIMIT.step);
let gridStates = 0;
for (let i = 0; i <= aSteps; i += 1) {
  const A = quantize(A_LIMIT.min + i * A_LIMIT.step, A_LIMIT);
  for (let j = 0; j <= gSteps; j += 1) {
    const g = quantize(G_LIMIT.min + j * G_LIMIT.step, G_LIMIT);
    const s = smallOscillationState({ A, g });
    // Exact integer oracle for the decimal grid: A=(i+1)/10, g=j/100.
    // This includes all reachable 5% boundary pairs without float tolerances.
    const integerRatio = j * (i + 1) ** 2;
    assert.equal(s.branch, j === 0 ? "exact" : integerRatio <= 500 ? "within" : integerRatio <= 1000 ? "potential-only" : "outside");
    assert.ok(Number.isFinite(s.potentialDomain[0]) && s.potentialDomain[0] === 0);
    assert.ok(Number.isFinite(s.potentialDomain[1]) && s.potentialDomain[1] > 0);
    assert.ok(s.forceDomain[0] < 0 && s.forceDomain[1] > 0);
    assert.ok(s.correctionDomain[0] === 0);
    assert.ok(s.correctionDomain[1] >= SMALL_OSC_THRESHOLD);
    // The correction plot draws percentages: its top must contain the 5% line
    // and the current markers, not just the dimensionless ratios.
    const percentTop = 100 * s.correctionDomain[1];
    assert.ok(percentTop >= 5);
    assert.ok(100 * s.correctionForce <= percentTop + 1e-12);
    assert.ok(100 * s.correctionPotential <= percentTop + 1e-12);
    assert.deepEqual(s.xDomain, [-1.25 * A, 1.25 * A]);
    assert.deepEqual(s.correctionXDomain, [0, A_LIMIT.max]);
    assert.ok(A > 0 && g >= 0);
    for (let k = 0; k <= 100; k += 1) {
      const q = s.xDomain[0] + ((s.xDomain[1] - s.xDomain[0]) * k) / 100;
      const v = s.potential(q);
      const f = s.force(q);
      assert.ok(Number.isFinite(v) && v >= s.potentialDomain[0] && v <= s.potentialDomain[1] + 1e-12);
      assert.ok(Number.isFinite(f) && f >= s.forceDomain[0] - 1e-12 && f <= s.forceDomain[1] + 1e-12);
      const a = s.correctionXDomain[0] + ((s.correctionXDomain[1] - s.correctionXDomain[0]) * k) / 100;
      const cp = s.correctionPotentialAt(a);
      const cf = s.correctionForceAt(a);
      assert.ok(Number.isFinite(cp) && cp >= 0 && cp <= s.correctionDomain[1] + 1e-12);
      assert.ok(Number.isFinite(cf) && cf >= 0 && cf <= s.correctionDomain[1] + 1e-12);
    }
    assert.ok(s.turningPotential >= s.potentialDomain[0] && s.turningPotential <= s.potentialDomain[1]);
    assert.ok(s.turningForce >= s.forceDomain[0] && s.turningForce <= s.forceDomain[1]);
    assert.ok(s.correctionForce >= 0 && s.correctionForce <= s.correctionDomain[1]);
    assert.ok(s.correctionPotential >= 0 && s.correctionPotential <= s.correctionDomain[1]);
    if (g === 0) assert.equal(s.branch, "exact");
    else assert.notEqual(s.branch, "exact");
    gridStates += 1;
  }
}

// Control steps: clamp at both endpoints and land on the declared grid.
assert.equal(quantize(-5, A_LIMIT), A_LIMIT.min);
assert.equal(quantize(99, A_LIMIT), A_LIMIT.max);
assert.equal(quantize(-5, G_LIMIT), G_LIMIT.min);
assert.equal(quantize(99, G_LIMIT), G_LIMIT.max);
assert.equal(quantize(0.149, A_LIMIT), 0.1);
assert.equal(quantize(0.151, A_LIMIT), 0.2);
assert.equal(quantize(0.004, G_LIMIT), 0);
assert.equal(quantize(0.006, G_LIMIT), 0.01);
assert.equal(shiftParameter("A", A_LIMIT.min, -1), A_LIMIT.min);
assert.equal(shiftParameter("A", A_LIMIT.max, 1), A_LIMIT.max);
assert.equal(shiftParameter("g", G_LIMIT.min, -1), G_LIMIT.min);
assert.equal(shiftParameter("g", G_LIMIT.max, 1), G_LIMIT.max);
assert.equal(shiftParameter("A", 1, 1), 1.1);
assert.equal(shiftParameter("A", 1, -1), 0.9);
assert.equal(shiftParameter("g", 0.05, 1), 0.06);
assert.equal(shiftParameter("g", 0.05, -1), 0.04);
assert.throws(() => shiftParameter("x", 1, 1), RangeError);

// Every preset lies on the control grid and reaches the branch it advertises.
const expectedBranches = ["exact", "within", "potential-only", "outside"];
assert.equal(SMALL_OSC_PRESETS.length, expectedBranches.length);
SMALL_OSC_PRESETS.forEach((preset, i) => {
  assert.equal(quantize(preset.A, A_LIMIT), preset.A, `${preset.label}: A off grid`);
  assert.equal(quantize(preset.g, G_LIMIT), preset.g, `${preset.label}: g off grid`);
  const s = smallOscillationState(preset);
  assert.equal(s.branch, expectedBranches[i], `${preset.label}: wrong branch`);
});

assert.throws(() => smallOscillationState({ A: 0, g: 0.1 }), RangeError);
assert.throws(() => smallOscillationState({ A: 1, g: -0.1 }), RangeError);
assert.throws(() => smallOscillationState({ A: Number.NaN, g: 0 }), RangeError);
assert.throws(() => smallOscillationState({ A: 1, g: Number.POSITIVE_INFINITY }), RangeError);

console.log(
  `SmallOscillationLab: ${derivativeChecks} independent derivative/integral checks, ` +
  `${correctionChecks} correction checks, ${gridStates} control-grid states, ` +
  `all presets and the exact g=0 branch pass.`,
);
