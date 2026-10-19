import assert from "node:assert/strict";
import {
  FOCK_MAX_N,
  FOCK_DIM,
  C,
  scale,
  mul,
  abs2,
  norm2,
  expi,
  zeroState,
  basisState,
  fockPreset,
  FOCK_PRESETS,
  supportHighest,
  fockStats,
  ladder,
  globalPhase,
  BASIS_Q_WINDOW,
  BASIS_DENSITY_MAX,
  BASIS_AMPLITUDE_MAX,
  BASIS_PHASE_MAX,
  BASIS_TIME_MAX,
  BASIS_GLOBAL_MAX,
  BASIS_PRESETS,
  BASIS_PHASE_STEPS,
  BASIS_TIME_STEPS,
  PHI0_PREFACTOR,
  phi0,
  phi1,
  synthesisState,
} from "../../src/sections/widgets/oscillator-algebra.mjs";

const close = (a, b, t = 2e-10) => assert.ok(
  Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= t * Math.max(1, Math.abs(a), Math.abs(b)),
  `${a} != ${b}`,
);
const cabs2 = (z) => z[0] ** 2 + z[1] ** 2;
const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];

function simpson(f, a, b, n = 16000) {
  const even = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / even;
  let sum = f(a) + f(b);
  for (let i = 1; i < even; i += 1) sum += (i % 2 === 1 ? 4 : 2) * f(a + i * h);
  return (sum * h) / 3;
}

function normalized(coeffs) {
  const n2 = coeffs.reduce((sum, z) => sum + cabs2(z), 0);
  const inverse = 1 / Math.sqrt(n2);
  return coeffs.map((z) => scale(z, inverse));
}

/* ------------------------------------------------------------------ *
 * Fock ladder: norms, vacuum, support boundary, global phase.
 * ------------------------------------------------------------------ */

assert.equal(FOCK_DIM, FOCK_MAX_N + 1);
assert.equal(FOCK_PRESETS.length, 4);
assert.deepEqual(FOCK_PRESETS.map((p) => p.id), ["vacuum", "n3", "plus", "iphase"]);

const vacuum = fockPreset("vacuum");
const n3 = fockPreset("n3");
const plus = fockPreset("plus");
const iphase = fockPreset("iphase");
for (const state of [vacuum, n3, plus, iphase]) {
  assert.equal(state.length, FOCK_DIM);
  close(norm2(state), 1, 1e-12);
}
close(vacuum[0][0], 1);
close(n3[3][0], 1);
close(plus[0][0], Math.SQRT1_2);
close(plus[1][0], Math.SQRT1_2);
close(iphase[0][0], Math.SQRT1_2);
close(iphase[1][0], 0);
close(iphase[1][1], Math.SQRT1_2);

const vacuumStats = fockStats(vacuum);
close(vacuumStats.meanN, 0);
close(vacuumStats.energy, 0.5);
assert.equal(vacuumStats.support, 0);
assert.equal(vacuumStats.zero, false);
const n3Stats = fockStats(n3);
close(n3Stats.meanN, 3);
close(n3Stats.energy, 3.5);
assert.equal(n3Stats.support, 3);
const plusStats = fockStats(plus);
close(plusStats.meanN, 0.5);
close(plusStats.energy, 1);
assert.equal(plusStats.support, 1);

const seeds = [
  [C(0.3, 0.2), C(-0.4, 0.1), C(0.5, -0.2), C(0.1, 0.3)],
  [C(0.8, -0.1), C(0.1, 0.2)],
  [C(0, 1), C(0, 0), C(0.2, -0.2)],
  [C(0.1, 0.1), C(0.2, 0.2), C(0.3, 0.3), C(0.4, 0.4), C(0.5, 0.5)],
  [C(0.2, -0.1), C(0, 0), C(0, 0), C(0, 0), C(0, 0), C(0.7, 0.3)],
];
const generalStates = seeds.map((entries) => {
  const full = zeroState();
  entries.forEach((z, n) => { full[n] = z; });
  return normalized(full);
});

for (const state of generalStates) {
  const stats = fockStats(state);
  const expectedN = state.reduce((sum, z, n) => sum + n * cabs2(z), 0);
  close(stats.meanN, expectedN);
  close(stats.energy, expectedN + 0.5);
  close(stats.probabilities.reduce((sum, p) => sum + p, 0), 1, 1e-12);

  const rawA = zeroState();
  for (let n = 0; n < FOCK_MAX_N; n += 1) rawA[n] = scale(state[n + 1], Math.sqrt(n + 1));
  const normA = norm2(rawA);
  const resultA = ladder(state, "a");
  assert.equal(resultA.zero, false);
  assert.equal(resultA.blocked, false);
  close(resultA.norm2, normA);
  close(normA, expectedN);
  close(resultA.meanNBefore, expectedN);
  for (let n = 0; n < FOCK_DIM; n += 1) {
    close(resultA.raw[n][0], rawA[n][0], 1e-13);
    close(resultA.raw[n][1], rawA[n][1], 1e-13);
    if (normA > 0) {
      close(resultA.state[n][0], rawA[n][0] / Math.sqrt(normA), 1e-13);
      close(resultA.state[n][1], rawA[n][1] / Math.sqrt(normA), 1e-13);
    }
  }
  close(norm2(resultA.state), 1, 1e-12);

  const rawCreate = zeroState();
  for (let n = 1; n <= FOCK_MAX_N; n += 1) rawCreate[n] = scale(state[n - 1], Math.sqrt(n));
  const normCreate = norm2(rawCreate);
  const resultCreate = ladder(state, "a†");
  assert.equal(resultCreate.zero, false);
  assert.equal(resultCreate.blocked, false);
  close(resultCreate.norm2, normCreate);
  close(normCreate, expectedN + 1);
  close(norm2(resultCreate.state), 1, 1e-12);

  const theta = 0.731;
  const rotated = globalPhase(state, theta);
  const rotatedA = ladder(rotated, "a");
  const rotatedCreate = ladder(rotated, "a†");
  close(rotatedA.norm2, resultA.norm2);
  close(rotatedCreate.norm2, resultCreate.norm2);
  const phase = expi(theta);
  for (let n = 0; n < FOCK_DIM; n += 1) {
    const expected = mul(resultA.state[n], phase);
    close(rotatedA.state[n][0], expected[0], 1e-12);
    close(rotatedA.state[n][1], expected[1], 1e-12);
  }
  close(fockStats(rotated).meanN, stats.meanN, 1e-12);
}

const annihilated = ladder(vacuum, "a");
assert.equal(annihilated.zero, true);
assert.equal(annihilated.blocked, false);
assert.equal(annihilated.norm2, 0);
assert.equal(annihilated.state, null);
for (const z of annihilated.raw) close(abs2(z), 0);
const created = ladder(vacuum, "a†");
assert.equal(created.blocked, false);
assert.equal(created.zero, false);
close(created.norm2, 1);
assert.equal(fockStats(created.state).support, 1);
close(fockStats(created.state).probabilities[1], 1);

assert.equal(supportHighest(vacuum), 0);
assert.equal(supportHighest(annihilated.raw), -1);
assert.equal(fockStats(annihilated.raw).zero, true);
assert.equal(fockStats(annihilated.raw).energy, null);

const top = ladder(basisState(FOCK_MAX_N), "a†");
assert.equal(top.blocked, true);
assert.equal(top.raw, null);
assert.equal(top.state, null);
assert.equal(top.norm2, null);
close(top.meanNBefore, FOCK_MAX_N);
assert.equal(fockStats(basisState(FOCK_MAX_N)).atCeiling, true);
assert.equal(fockStats(basisState(FOCK_MAX_N - 1)).atCeiling, false);

// Genuine finite support cannot depend on a display floor: a 1e-8 amplitude
// has probability 1e-16, but raising still sends it outside the retained array.
for (const edge of [C(1e-8),C(0,-1e-8)]) {
  const tinyTop=zeroState();tinyTop[0]=C(Math.sqrt(1-1e-16));tinyTop[FOCK_MAX_N]=edge;
  const snapshot=tinyTop.map(z=>[...z]);
  assert.equal(supportHighest(tinyTop),FOCK_MAX_N);
  assert.equal(fockStats(tinyTop).support,FOCK_MAX_N);
  assert.equal(fockStats(tinyTop).atCeiling,true);
  assert.equal(ladder(tinyTop,'a†').blocked,true);
  assert.deepEqual(tinyTop,snapshot);
  const down=ladder(tinyTop,'a');
  assert.equal(down.zero,false);assert.equal(down.blocked,false);
  close(down.norm2,FOCK_MAX_N*1e-16,1e-28);
  close(abs2(down.state[FOCK_MAX_N-1]),1,1e-12);
  const tinyNear=zeroState();tinyNear[0]=C(Math.sqrt(1-1e-16));tinyNear[FOCK_MAX_N-1]=edge;
  const raised=ladder(tinyNear,'a†');
  assert.equal(raised.blocked,false);assert.ok(abs2(raised.state[FOCK_MAX_N])>0);
  assert.equal(ladder(raised.state,'a†').blocked,true);
}
for(let n=0;n<=FOCK_MAX_N;n++){
  const state=basisState(n),down=ladder(state,'a'),up=ladder(state,'a†');
  assert.equal(down.zero,n===0);assert.equal(up.blocked,n===FOCK_MAX_N);
  if(n>0){close(down.norm2,n);close(abs2(down.state[n-1]),1);}
  if(n<FOCK_MAX_N){close(up.norm2,n+1);close(abs2(up.state[n+1]),1);}
  // Actual SVG probability bars: n centers, widths and y endpoints.
  const plotW=560-48-16,barW=plotW/(FOCK_MAX_N+1)*.62;
  const cx=48+(n+.5)*plotW/(FOCK_MAX_N+1);
  assert.ok(cx-barW/2>=48&&cx+barW/2<=544);
  assert.ok(18>=0&&204+14<250);
}

const nearTop = ladder(basisState(FOCK_MAX_N - 1), "a†");
assert.equal(nearTop.blocked, false);
assert.equal(fockStats(nearTop.state).support, FOCK_MAX_N);
close(nearTop.norm2, FOCK_MAX_N);
close(fockStats(nearTop.state).probabilities[FOCK_MAX_N], 1);

let chain = basisState(0);
for (let k = 0; k < FOCK_MAX_N; k += 1) {
  const step = ladder(chain, "a†");
  assert.equal(step.blocked, false);
  chain = step.state;
}
assert.equal(fockStats(chain).support, FOCK_MAX_N);
assert.equal(ladder(chain, "a†").blocked, true);

// A naive truncation would force a^dagger|12> = 0 and give <12|[a,a^dagger]|12> = -12,
// not 1.  The model therefore blocks the operation instead of claiming full CCR.
const boundaryCommutator = -Math.sqrt(FOCK_MAX_N) * Math.sqrt(FOCK_MAX_N);
close(boundaryCommutator, -FOCK_MAX_N, 1e-12);
assert.ok(Math.abs(boundaryCommutator - 1) > 1);

/* ------------------------------------------------------------------ *
 * Energy/position synthesis: normalization, moments, period, global phase.
 * ------------------------------------------------------------------ */

close(PHI0_PREFACTOR * Math.PI ** 0.25, 1, 1e-14);
close(simpson((q) => phi0(q) ** 2, -10, 10), 1, 1e-12);
close(simpson((q) => phi1(q) ** 2, -10, 10), 1, 1e-12);
close(simpson((q) => phi0(q) * phi1(q), -10, 10), 0, 1e-12);
assert.deepEqual(BASIS_Q_WINDOW, [-5, 5]);
assert.equal(BASIS_PHASE_MAX, 15);
assert.equal(BASIS_TIME_MAX, 16);
assert.equal(BASIS_GLOBAL_MAX, 3);

for (const preset of BASIS_PRESETS) {
  assert.equal(Number.isInteger(preset.phaseStep), true);
  assert.equal(Number.isInteger(preset.timeStep), true);
  assert.equal(Number.isInteger(preset.globalStep), true);
  assert.ok(Math.abs(preset.w * 20 - Math.round(preset.w * 20)) < 1e-12);
  const state = synthesisState(preset);
  close(abs2(state.c0), preset.w);
  close(abs2(state.c1), 1 - preset.w);
  close(abs2(state.c0) + abs2(state.c1), 1);
  close(state.meanE, 0.5 * preset.w + 1.5 * (1 - preset.w));
  close(state.windowMass, 1, 1e-9);
  assert.ok(state.tail >= 0 && state.tail < 1e-9);
}

const ground = synthesisState(BASIS_PRESETS[0]);
const first = synthesisState(BASIS_PRESETS[1]);
const inphase = synthesisState(BASIS_PRESETS[2]);
const quadrature = synthesisState(BASIS_PRESETS[3]);
close(ground.meanQ, 0);
close(first.meanQ, 0);
close(inphase.meanQ, Math.SQRT1_2);
close(quadrature.meanQ, 0, 1e-12);
close(ground.density(0), phi0(0) ** 2);
close(first.density(0.7), phi1(0.7) ** 2);
close(inphase.density(0), 0.5 * phi0(0) ** 2);

const wValues = Array.from({length:21},(_,j)=>j/20);
const phaseSteps = Array.from({length:16},(_,j)=>j);
const timeSteps = Array.from({length:17},(_,j)=>j);
const globalSteps = [0, 1, 2, 3];
let statesChecked = 0;
let maxDensity = 0;
let maxAmplitude = 0;

for (const w of wValues) {
  for (const phaseStep of phaseSteps) {
    for (const timeStep of timeSteps) {
      for (const globalStep of globalSteps) {
        const state = synthesisState({ w, phaseStep, timeStep, globalStep });
        close(abs2(state.c0), w, 1e-12);
        close(abs2(state.c1), 1 - w, 1e-12);
        close(abs2(state.c0) + abs2(state.c1), 1, 1e-12);
        close(state.phi, (phaseStep * Math.PI) / BASIS_PHASE_STEPS);
        close(state.t, (timeStep * Math.PI) / BASIS_PHASE_STEPS);
        const rawDelta = ((phaseStep - timeStep) * Math.PI) / BASIS_PHASE_STEPS;
        const wrapped = Math.atan2(Math.sin(rawDelta), Math.cos(rawDelta));
        // +/-pi represent the same phase at the atan2 branch cut; independently
        // assembled floating expressions may choose opposite representatives.
        close(Math.sin(state.delta),Math.sin(wrapped),1e-12);
        close(Math.cos(state.delta),Math.cos(wrapped),1e-12);
        close(state.meanQ, Math.SQRT2 * Math.sqrt(w * (1 - w)) * Math.cos(wrapped), 1e-12);
        close(state.meanE, 1.5 - w, 1e-12);
        close(state.varianceQ, 1.5 - w - state.meanQ ** 2, 1e-12);
        assert.ok(state.varianceQ >= 0);
        assert.ok(Math.abs(state.meanQ) <= Math.SQRT1_2 + 1e-12);
        for (const q of [-4.5, -2, -1, 0, 1, 2, 4.5]) {
          const z = cadd(cmul(state.c0, [phi0(q), 0]), cmul(state.c1, [phi1(q), 0]));
          close(state.real(q), z[0], 1e-12);
          close(state.imag(q), z[1], 1e-12);
          close(state.density(q), cabs2(z), 1e-12);
          assert.ok(state.density(q) >= 0);
          maxDensity = Math.max(maxDensity, state.density(q));
          maxAmplitude = Math.max(maxAmplitude, Math.abs(state.real(q)), Math.abs(state.imag(q)));
        }
        statesChecked += 1;
      }
    }
  }
}

// Independent complex quadrature: density built from the two coefficients and
// the exact phi_0/phi_1, not from the model's own density closure.
for (const w of [0, 0.25, 0.5, 0.75, 1]) {
  for (const phaseStep of [0, 2, 4, 8]) {
    for (const timeStep of [0, 3, 8, 16]) {
      const state = synthesisState({ w, phaseStep, timeStep, globalStep: (phaseStep + timeStep) % 4 });
      const density = (q) => cabs2(cadd(cmul(state.c0, [phi0(q), 0]), cmul(state.c1, [phi1(q), 0])));
      close(simpson(density, -12, 12), 1, 1e-10);
      const mean = simpson((q) => q * density(q), -12, 12);
      close(mean, state.meanQ, 1e-8);
      close(simpson((q) => (q - mean) ** 2 * density(q), -12, 12), state.varianceQ, 1e-7);
      const window = simpson(density, -5, 5);
      close(window, state.windowMass, 1e-8);
      close(state.tail, 1 - window, 1e-8);
      assert.ok(state.tail < 1e-9);
    }
  }
}

// Density period 2*pi: after 16 time steps both coefficients acquire the same
// global factor -1, so the density and every position expectation return.
for (const w of [0.2, 0.5, 0.8]) {
  for (const phaseStep of [0, 2, 5]) {
    const before = synthesisState({ w, phaseStep, timeStep: 3, globalStep: 1 });
    const after = synthesisState({ w, phaseStep, timeStep: 3 + BASIS_TIME_STEPS, globalStep: 1 });
    close(after.c0[0], -before.c0[0], 1e-12);
    close(after.c0[1], -before.c0[1], 1e-12);
    close(after.c1[0], -before.c1[0], 1e-12);
    close(after.c1[1], -before.c1[1], 1e-12);
    for (const q of [-3, -1, 0, 1, 3]) close(after.density(q), before.density(q), 1e-12);
    close(after.meanQ, before.meanQ, 1e-12);
  }
}

// Shifting phi and t by the same number of steps keeps delta and the density,
// while changing the individual coefficients by a global phase.
for (const w of [0.2, 0.5, 0.8]) {
  for (const phaseStep of [0, 2, 5]) {
    for (const k of [1, 3]) {
      const a = synthesisState({ w, phaseStep, timeStep: 0, globalStep: 0 });
      const b = synthesisState({ w, phaseStep: phaseStep + k, timeStep: k, globalStep: 0 });
      close(b.delta, a.delta, 1e-12);
      for (const q of [-3, -1, 0, 1, 3]) close(b.density(q), a.density(q), 1e-12);
      close(b.meanQ, a.meanQ, 1e-12);
    }
  }
}

// Global multiplication by i: complex components rotate, density and every
// probability stay put.
for (const w of [0, 0.3, 0.5, 0.9, 1]) {
  for (const phaseStep of [0, 2, 4, 7]) {
    for (const timeStep of [0, 1, 5, 16]) {
      const a = synthesisState({ w, phaseStep, timeStep, globalStep: 0 });
      const b = synthesisState({ w, phaseStep, timeStep, globalStep: 1 });
      for (const q of [-3, -1, 0, 0.7, 3]) {
        close(b.real(q), -a.imag(q), 1e-12);
        close(b.imag(q), a.real(q), 1e-12);
        close(b.density(q), a.density(q), 1e-12);
      }
      close(b.meanQ, a.meanQ, 1e-12);
      close(b.meanE, a.meanE, 1e-12);
      close(b.windowMass, a.windowMass, 1e-12);
      close(abs2(b.c0), abs2(a.c0), 1e-12);
      close(abs2(b.c1), abs2(a.c1), 1e-12);
    }
  }
}

// Fixed plot bounds hold for every controlled state, and are actually nontrivial.
for (const w of wValues) {
  for (const phaseStep of [0, 1, 2, 4, 7, 15]) {
    for (const timeStep of [0, 1, 4, 8, 16]) {
      const state = synthesisState({ w, phaseStep, timeStep, globalStep: (phaseStep + timeStep) % 4 });
      for (let i = 0; i <= 200; i += 1) {
        const q = -5 + (10 * i) / 200;
        const density = state.density(q);
        const re = state.real(q);
        const im = state.imag(q);
        assert.ok(Number.isFinite(density) && density >= 0);
        assert.ok(Number.isFinite(re) && Number.isFinite(im));
        assert.ok(density <= BASIS_DENSITY_MAX);
        assert.ok(Math.abs(re) <= BASIS_AMPLITUDE_MAX && Math.abs(im) <= BASIS_AMPLITUDE_MAX);
        maxDensity = Math.max(maxDensity, density);
        maxAmplitude = Math.max(maxAmplitude, Math.abs(re), Math.abs(im));
      }
    }
  }
}
assert.ok(maxDensity > 0.6 && maxDensity <= BASIS_DENSITY_MAX);
assert.ok(maxAmplitude > 0.75 && maxAmplitude <= BASIS_AMPLITUDE_MAX);

console.log(`Oscillator algebra: ${statesChecked} synthesis states, ladder norms/vacuum/support boundary/global phase, independent complex quadrature, period and fixed plot bounds pass.`);
