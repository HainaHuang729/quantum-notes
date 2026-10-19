import assert from "node:assert/strict";
import {
  THERMAL_TAU_MAX,
  THERMAL_TAU_STEP,
  THERMAL_GROUND_E,
  THERMAL_EINSTEIN_FACTOR,
  THERMAL_PRESETS,
  thermalState,
  thermalLevels,
} from "../../src/sections/widgets/thermal-oscillator.mjs";

const close = (a, b, t = 1e-11) => assert.ok(
  Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= t * Math.max(1, Math.abs(a), Math.abs(b)),
  `${a} != ${b}`,
);

assert.equal(THERMAL_TAU_MAX, 5);
assert.equal(THERMAL_TAU_STEP, 0.05);
assert.equal(THERMAL_GROUND_E, 0.5);
assert.equal(THERMAL_EINSTEIN_FACTOR, 3);
assert.deepEqual(THERMAL_PRESETS.map((p) => p.tau), [0, 0.5, 4]);

function boltzmann(tau, nMax = 300) {
  const x = 1 / tau;
  const p0 = 1 - Math.exp(-x);
  let z = 0;
  let meanN = 0;
  let energy = 0;
  let second = 0;
  for (let n = 0; n <= nMax; n += 1) {
    const p = p0 * Math.exp(-n * x);
    z += p;
    meanN += n * p;
    energy += (n + 0.5) * p;
    second += (n + 0.5) ** 2 * p;
  }
  meanN /= z;
  energy /= z;
  const variance = second / z - energy ** 2;
  return { z, p0: p0 / z, meanN, E: energy, C: variance / (tau * tau) };
}

const zero = thermalState(0);
assert.equal(zero.branch, "ground");
assert.equal(zero.E, 0.5);
assert.equal(zero.C, 0);
assert.equal(zero.meanN, 0);
assert.equal(zero.p0, 1);
assert.equal(zero.einsteinC, 0);
assert.equal(zero.classicalE, 0);
assert.equal(zero.classicalC, 1);

let checked = 0;
let lastE = -Infinity;
for (let i = 0; i <= 100; i += 1) {
  const tau = i * THERMAL_TAU_STEP;
  const state = thermalState(tau);
  assert.ok(Number.isFinite(state.E) && Number.isFinite(state.C));
  assert.ok(state.E >= THERMAL_GROUND_E - 1e-15);
  assert.ok(state.C >= 0);
  assert.ok(state.E <= 5.2);
  assert.ok(state.C <= 1.05);
  assert.equal(state.classicalC, 1);
  close(state.classicalE, tau);
  close(state.einsteinC, 3 * state.C);
  assert.ok(state.E >= lastE - 1e-12);
  lastE = state.E;
  if (tau === 0) {
    assert.equal(state.branch, "ground");
    assert.equal(state.E, 0.5);
    assert.equal(state.C, 0);
  } else {
    assert.equal(state.branch, "thermal");
    const sum = boltzmann(tau);
    close(state.E, sum.E, 2e-11);
    close(state.C, sum.C, 3e-11);
    close(state.meanN, sum.meanN, 2e-11);
    close(state.p0, sum.p0, 2e-11);
    close(sum.z, 1, 1e-12);
    assert.ok(state.E >= tau - 1e-12);
    assert.ok(state.E - tau <= 0.5 + 1e-12);
    assert.ok(state.C <= 1 + 1e-12);
  }
  checked += 1;
}

// Independent numerical derivative of the returned energy, away from tau=0.
for (const tau of [0.1, 0.25, 0.5, 1, 2, 3, 4, 5]) {
  const h = 1e-4;
  const slope = (thermalState(tau + h).E - thermalState(tau - h).E) / (2 * h);
  close(slope, thermalState(tau).C, 1e-6);
}
const oneSided = (thermalState(1e-4).E - thermalState(0).E) / 1e-4;
assert.ok(oneSided >= -1e-12 && oneSided < 1e-6);

// Low- and high-temperature limits, including values that would overflow a
// naive exp(1/tau) implementation.
for (const tau of [1e-8, 1e-6, 1e-4, 0.01]) {
  const state = thermalState(tau);
  assert.ok(Number.isFinite(state.E) && Number.isFinite(state.C));
  assert.ok(state.E - 0.5 < 1e-12);
  assert.ok(state.C < 1e-12);
}
for (const tau of [100, 1000, 1e6]) {
  const state = thermalState(tau);
  assert.ok(Number.isFinite(state.E) && Number.isFinite(state.C));
  assert.ok(state.E - tau >= 0);
  // The subtraction itself loses absolute precision at very large tau; the
  // physical correction still matches 1/(12 tau) to the displayed tolerance.
  assert.ok(state.E - tau < 1 / (12 * tau) + 1e-9);
  close(state.C, 1, 1e-4);
}
for (const tau of [1e-300, 1e300]) {
  const state = thermalState(tau);
  assert.ok(Number.isFinite(state.E) && Number.isFinite(state.C));
  assert.ok(state.E >= 0.5);
  assert.ok(state.C >= 0 && state.C <= 1);
}

for (const preset of THERMAL_PRESETS) {
  const steps = preset.tau / THERMAL_TAU_STEP;
  assert.ok(Math.abs(steps - Math.round(steps)) < 1e-12);
  const state = thermalState(preset.tau);
  assert.equal(state.branch, preset.tau === 0 ? "ground" : "thermal");
}

for (const tau of [0, 0.05, 0.5, 1, 2, 4, 5]) {
  const shown = thermalLevels(tau, 8);
  assert.equal(shown.p.length, 9);
  assert.equal(shown.energies.length, 9);
  let shownSum = 0;
  shown.p.forEach((p, n) => {
    assert.ok(Number.isFinite(p) && p >= 0);
    close(shown.energies[n], n + 0.5);
    shownSum += p;
  });
  close(shown.sum, shownSum);
  assert.ok(shownSum <= 1 + 1e-12);
  assert.ok(shownSum >= 0);
  if (tau === 0) {
    assert.equal(shown.p[0], 1);
    for (let n = 1; n < shown.p.length; n += 1) assert.equal(shown.p[n], 0);
  }

  // The chart deliberately displays only n = 0 ... 8.  Check its truncation
  // separately, then use a much longer sum for the exact moments.
  const full = thermalLevels(tau, 200);
  let sum = 0;
  let meanN = 0;
  let energy = 0;
  let second = 0;
  full.p.forEach((p, n) => {
    sum += p;
    meanN += n * p;
    energy += (n + 0.5) * p;
    second += (n + 0.5) ** 2 * p;
  });
  close(full.sum, sum);
  close(sum, 1, 1e-12);
  const state = thermalState(tau);
  close(meanN / sum, state.meanN, 1e-10);
  close(energy / sum, state.E, 1e-10);
  close(full.p[0] / sum, state.p0, 1e-10);
  if (tau > 0) {
    const variance = second / sum - (energy / sum) ** 2;
    close(variance / (tau * tau), state.C, 1e-9);
  }
  if (tau <= 0.5) assert.ok(1 - shownSum < 2e-7);
}

// Fixed plot bounds and the actual controlled grid.
for (let i = 0; i <= 100; i += 1) {
  const tau = i * THERMAL_TAU_STEP;
  const state = thermalState(tau);
  assert.ok(state.E >= 0 && state.E <= 5.2);
  assert.ok(state.C >= 0 && state.C <= 1.05);
  assert.ok(Number.isFinite(state.E) && Number.isFinite(state.C));
}
for(let i=0;i<=100;i++){
  const tau=i*THERMAL_TAU_STEP,levels=thermalLevels(tau,8);
  levels.p.forEach((p,n)=>{
    const plotW=560-48-16,cx=48+(n+.5)*plotW/9,barW=plotW/9*.62;
    const y=18+(230-18-46)*(1-p);
    assert.ok(cx-barW/2>=48&&cx+barW/2<=544);
    assert.ok(y>=18-1e-12&&y<=184&&184-y>=-1e-12);
  });
  close(1-levels.sum,tau===0?0:Math.exp(-9/tau),1e-12);
}
close(thermalState(5).E, 5.016655566, 1e-8);
close(thermalState(5).C, 0.996673323, 1e-8);

console.log(`Thermal oscillator: ${checked} controlled tau values, Boltzmann sums, numerical derivatives, low/high limits, presets, level weights and fixed plot bounds pass.`);
