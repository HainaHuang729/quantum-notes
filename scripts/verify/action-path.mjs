import assert from "node:assert/strict";
import { ACTION_PRESETS, POLAR_DIFFERENTIAL, actionState, trialPath, trialVelocity } from "../../src/sections/widgets/action-path.mjs";

function close(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
}

// Integrate kinetic minus potential independently of the analytical action.
function integrateAction(p) {
  const { duration, omega } = actionState(p), count = 1200, h = duration / count;
  const integrand = t => .5 * trialVelocity(t, p) ** 2 - .5 * omega ** 2 * trialPath(t, p) ** 2;
  let sum = integrand(0) + integrand(duration);
  for (let j = 1; j < count; j++) sum += (j % 2 ? 4 : 2) * integrand(j * h);
  return sum * h / 3;
}

const expected = { free: "increase", down: "decrease", up: "increase", flat: "flat", near: "near-flat", zero: "stationary" };
for (const p of ACTION_PRESETS) {
  const s = actionState(p);
  assert.equal(s.branch, expected[p.id]);
  close(trialPath(0, p), 0); close(trialPath(s.duration, p), 0);
  close(integrateAction(p), s.action);
  const h = 1e-5;
  const derivative = (actionState({ ...p, amplitude: p.amplitude + h }).action - actionState({ ...p, amplitude: p.amplitude - h }).action) / (2 * h);
  close(derivative, s.slope);
}

// Every slider state respects fixed endpoints; all numerical values finite.
let states = 0;
for (const system of ["free", "oscillator"]) for (let k = 50; k <= 250; k++) for (let n = 1; n <= 3; n++) for (let j = -50; j <= 50; j++) {
  const p = { system, ratio: k / 100, n, amplitude: j / 50 }, s = actionState(p);
  assert.ok([s.coefficient, s.action, s.slope, s.duration].every(Number.isFinite));
  close(trialPath(0, p), 0); close(trialPath(s.duration, p), 0);
  if (system === "free" && j !== 0) assert.ok(s.action > 0);
  if (j === 0) { assert.equal(s.branch, "stationary"); close(s.slope, 0); }
  if (system === "oscillator" && k === 100 * n && j !== 0) assert.equal(s.branch, "flat");
  states++;
}

// Zero is stationary for all these directions, yet the same duration has
// positive and negative second variation: a saddle, rather than a minimum.
const saddle = { system: "oscillator", ratio: 1.25, n: 1, amplitude: .6 };
assert.ok(actionState(saddle).action < 0);
assert.ok(actionState({ ...saddle, n: 2 }).action > 0);
assert.equal(actionState({ ...saddle, amplitude: .02 }).branch, "near-stationary");
for (const n of [1, 2, 3]) close(actionState({ ...saddle, n, amplitude: 0 }).slope, 0);

// At a resonant duration, the whole mode family solves x''+x=0.
const resonant = { system: "oscillator", ratio: 1, n: 1, amplitude: .6 };
for (const amplitude of [-1, -.2, .6, 1]) close(actionState({ ...resonant, amplitude }).action, 0);
const t = .9, dt = 1e-3;
close((trialPath(t + dt, resonant) - 2 * trialPath(t, resonant) + trialPath(t - dt, resonant)) / dt ** 2 + trialPath(t, resonant), 0, 1e-7);

// Recreated polar differential diagram and the angular-momentum worked check.
const { origin, point, radial, tangential } = POLAR_DIFFERENTIAL;
close(radial[0] * tangential[0] + radial[1] * tangential[1], 0);
close((point[0] - origin[0]) * radial[1] - (point[1] - origin[1]) * radial[0], 0);
close(1 * 2 ** 2 * 3, 12); close(1 * 1 ** 2 * 12, 12);
console.log(`action-path: six presets, independent quadrature, ${states} slider states and differential geometry verified`);
