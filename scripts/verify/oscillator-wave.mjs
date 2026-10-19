import assert from "node:assert/strict";
import {
  CORRESPONDENCE_BINS_MAX,
  CORRESPONDENCE_BINS_MIN,
  CORRESPONDENCE_BINS_STEP,
  CORRESPONDENCE_DEFAULT,
  CORRESPONDENCE_N_MAX,
  CORRESPONDENCE_PRESETS,
  OSC_DENSITY_YLIM,
  OSC_INTEGRATION_LIMIT,
  OSC_LEVEL_E_MAX,
  OSC_LEVEL_WINDOW,
  OSC_N_MAX,
  OSC_PRESETS,
  OSC_Q_WINDOW,
  OSC_WAVE_YLIM,
  classicalBinProbability,
  correspondenceState,
  hermiteFunction,
  oscillatorState,
  quantumBinProbability,
} from "../../src/sections/widgets/oscillator-wave.mjs";

const close = (actual, expected, tolerance = 1e-9, label = "") =>
  assert.ok(
    Math.abs(actual - expected) <=
      tolerance * Math.max(1, Math.abs(actual), Math.abs(expected)),
    `${label}${actual} != ${expected} (tol ${tolerance})`,
  );

function simpson(f, a, b, intervals = 4096) {
  if (a === b) return 0;
  const m = Math.max(2, intervals + (intervals % 2));
  const h = (b - a) / m;
  let sum = f(a) + f(b);
  for (let i = 1; i < m; i += 1) sum += (i % 2 ? 4 : 2) * f(a + i * h);
  return (sum * h) / 3;
}

// Independent eight-node Gauss-Legendre quadrature, subdivided into eight
// panels per bin. Its nodes/weights and error structure differ from Simpson.
function gaussBin(f,a,b){
  const nodes=[.1834346424956498,.525532409916329,.7966664774136267,.9602898564975363];
  const weights=[.362683783378362,.3137066458778873,.2223810344533745,.1012285362903763];
  let total=0;
  for(let panel=0;panel<8;panel++){
    const left=a+(b-a)*panel/8,right=a+(b-a)*(panel+1)/8,mid=(left+right)/2,half=(right-left)/2;
    for(let j=0;j<4;j++)total+=half*weights[j]*(f(mid-half*nodes[j])+f(mid+half*nodes[j]));
  }
  return total;
}

// Explicit physicists' H_0..H_4, independent of the implementation recurrence.
for(const q of [-3,-1.1,0,.4,2.5]){
  const polys=[1,2*q,4*q*q-2,8*q**3-12*q,16*q**4-48*q*q+12];
  const factorial=[1,1,2,6,24];
  for(let n=0;n<=4;n++)close(hermiteFunction(n,q),Math.PI**(-.25)*Math.exp(-q*q/2)*polys[n]/Math.sqrt(2**n*factorial[n]),1e-12);
}

const BIN_VALUES = [];
for (
  let bins = CORRESPONDENCE_BINS_MIN;
  bins <= CORRESPONDENCE_BINS_MAX;
  bins += CORRESPONDENCE_BINS_STEP
) {
  BIN_VALUES.push(bins);
}

// ---------------------------------------------------------------- constants
assert.deepEqual(OSC_Q_WINDOW, [-7, 7]);
assert.deepEqual(OSC_LEVEL_WINDOW, [-5, 5]);
assert.equal(OSC_N_MAX, 10);
assert.equal(OSC_WAVE_YLIM, 0.9);
assert.equal(OSC_DENSITY_YLIM, 0.8);
assert.equal(OSC_LEVEL_E_MAX, 13);
assert.equal(OSC_INTEGRATION_LIMIT, 10);
assert.equal(CORRESPONDENCE_N_MAX, 24);
assert.equal(CORRESPONDENCE_BINS_MIN, 12);
assert.equal(CORRESPONDENCE_BINS_MAX, 72);
assert.equal(CORRESPONDENCE_BINS_STEP, 4);
assert.equal((CORRESPONDENCE_BINS_MAX - CORRESPONDENCE_BINS_MIN) % CORRESPONDENCE_BINS_STEP, 0);
assert.equal(new Set(OSC_PRESETS.map(preset => preset.id)).size, OSC_PRESETS.length);
assert.equal(
  new Set(CORRESPONDENCE_PRESETS.map(preset => preset.id)).size,
  CORRESPONDENCE_PRESETS.length,
);
for (const preset of CORRESPONDENCE_PRESETS) {
  assert.ok(Number.isInteger(preset.n));
  assert.ok(preset.n >= 0 && preset.n <= CORRESPONDENCE_N_MAX);
  assert.ok(Number.isInteger(preset.bins));
  assert.ok(preset.bins >= CORRESPONDENCE_BINS_MIN && preset.bins <= CORRESPONDENCE_BINS_MAX);
  assert.equal((preset.bins - CORRESPONDENCE_BINS_MIN) % CORRESPONDENCE_BINS_STEP, 0);
}

// ------------------------------------------------------- oscillator spectrum
const forbiddenValues = [];
let eigenCount = 0;
for (let n = 0; n <= OSC_N_MAX; n += 1) {
  const state = oscillatorState(n);
  assert.equal(state.n, n);
  close(state.energy, n + 0.5, 1e-15, `energy n=${n}: `);
  close(state.turningPoint, Math.sqrt(2 * n + 1), 1e-15, `turning n=${n}: `);
  assert.equal(state.nodes, n);
  assert.equal(state.parity, n % 2 === 0 ? "even" : "odd");
  assert.equal(state.forbiddenLimit, OSC_INTEGRATION_LIMIT);
  assert.equal(state.windowTailLimit, OSC_Q_WINDOW[1] + 8);

  // Full-line normalization and orthogonality on a much finer grid.
  const norm = simpson(q => hermiteFunction(n, q) ** 2, -15, 15, 8192);
  close(norm, 1, 1e-10, `norm n=${n}: `);
  for (let m = 0; m < n; m += 1) {
    const overlap = simpson(
      q => hermiteFunction(n, q) * hermiteFunction(m, q),
      -15,
      15,
      4096,
    );
    close(overlap, 0, 1e-9, `orthogonality n=${n} m=${m}: `);
  }

  // Parity and n nodes from sign changes on an offset (root-avoiding) grid.
  for (const q of [0.3, 1.2, 3.1]) {
    close(
      hermiteFunction(n, -q),
      (n % 2 === 0 ? 1 : -1) * hermiteFunction(n, q),
      1e-12,
      `parity n=${n} q=${q}: `,
    );
  }
  let nodes = 0;
  let previous = hermiteFunction(n, -8 + 0.001234);
  for (let i = 1; i < 32000; i += 1) {
    const q = -8 + (16 * (i + 0.001234)) / 32000;
    const value = hermiteFunction(n, q);
    if (previous * value < 0) nodes += 1;
    previous = value;
  }
  assert.equal(nodes, n, `sign-change node count n=${n}`);

  // Time-independent Schrodinger equation, checked with finite differences.
  const h = 1e-4;
  for (const q of [-4, -2, -0.5, 0, 0.8, 2.5, 4]) {
    const value = hermiteFunction(n, q);
    const second =
      (hermiteFunction(n, q + h) - 2 * value + hermiteFunction(n, q - h)) /
      (h * h);
    const rightHandSide = (q * q - (2 * n + 1)) * value;
    assert.ok(
      Math.abs(second - rightHandSide) <= 3e-6 * (1 + Math.abs(rightHandSide)),
      `finite-difference Schrodinger residual n=${n} q=${q}`,
    );
  }

  // Energy moment with a five-point derivative. This is independent of the
  // returned energy value and checks both kinetic and potential contributions.
  const derivativeStep = 1e-3;
  const derivative = q =>
    (-hermiteFunction(n, q + 2 * derivativeStep) +
      8 * hermiteFunction(n, q + derivativeStep) -
      8 * hermiteFunction(n, q - derivativeStep) +
      hermiteFunction(n, q - 2 * derivativeStep)) /
    (12 * derivativeStep);
  const kinetic = 0.5 * simpson(q => derivative(q) ** 2, -12, 12, 8192);
  const potential = 0.5 * simpson(q => q * q * hermiteFunction(n, q) ** 2, -12, 12, 8192);
  close(kinetic + potential, n + 0.5, 1e-8, `energy moment n=${n}: `);

  // Forbidden region: direct fine-grid integration and a conservative bound
  // for the part beyond the stated cutoff.
  const turning = Math.sqrt(2 * n + 1);
  const forbidden = 2 * simpson(
    q => hermiteFunction(n, q) ** 2,
    turning,
    OSC_INTEGRATION_LIMIT,
    4096,
  );
  close(state.forbiddenProbability, forbidden, 2e-9, `forbidden n=${n}: `);
  const forbiddenBeyond = 2 * simpson(
    q => hermiteFunction(n, q) ** 2,
    OSC_INTEGRATION_LIMIT,
    OSC_INTEGRATION_LIMIT + 8,
    2048,
  );
  assert.ok(
    forbiddenBeyond <= state.forbiddenBound * (1 + 1e-9) + 1e-300,
    `forbidden cutoff bound n=${n}: ${forbiddenBeyond} > ${state.forbiddenBound}`,
  );
  close(
    state.forbiddenTotal,
    state.forbiddenProbability + state.forbiddenBound,
    1e-15,
    `forbidden total n=${n}: `,
  );
  assert.ok(state.forbiddenProbability > 0 && state.forbiddenProbability < 0.5);
  forbiddenValues.push(state.forbiddenProbability);

  // Fixed display window: the mass is the actual window mass, never a
  // renormalized curve; the outside tail is integrated and bounded.
  const windowMass = simpson(
    q => hermiteFunction(n, q) ** 2,
    OSC_Q_WINDOW[0],
    OSC_Q_WINDOW[1],
    8192,
  );
  close(state.windowMass, windowMass, 1e-10, `window mass n=${n}: `);
  const windowTail = 2 * simpson(
    q => hermiteFunction(n, q) ** 2,
    OSC_Q_WINDOW[1],
    OSC_Q_WINDOW[1] + 8,
    4096,
  );
  close(state.windowTailValue, windowTail, 1e-12, `window tail n=${n}: `);
  const windowBeyond = 2 * simpson(
    q => hermiteFunction(n, q) ** 2,
    state.windowTailLimit,
    state.windowTailLimit + 8,
    2048,
  );
  assert.ok(
    windowBeyond <= state.windowTailBound * (1 + 1e-9) + 1e-300,
    `window tail cutoff bound n=${n}: ${windowBeyond} > ${state.windowTailBound}`,
  );
  close(
    state.windowTail,
    state.windowTailValue + state.windowTailBound,
    1e-15,
    `window tail total n=${n}: `,
  );
  close(state.normCheck, 1, 1e-9, `window norm check n=${n}: `);
  assert.ok(state.windowMass > 1 - 1e-7);

  // Fixed plot limits must contain every sampled peak for n <= 10.
  assert.ok(state.maxAbsWave <= OSC_WAVE_YLIM + 1e-12);
  assert.ok(state.maxDensity <= OSC_DENSITY_YLIM + 1e-12);
  assert.ok(state.maxAbsWave > 0 && state.maxDensity > 0);
  let scanWave = 0;
  let scanDensity = 0;
  for (let i = 0; i <= 2000; i += 1) {
    const q = OSC_Q_WINDOW[0] + ((OSC_Q_WINDOW[1] - OSC_Q_WINDOW[0]) * i) / 2000;
    const value = hermiteFunction(n, q);
    scanWave = Math.max(scanWave, Math.abs(value));
    scanDensity = Math.max(scanDensity, value * value);
  }
  close(state.maxAbsWave, scanWave, 2e-4, `wave peak n=${n}: `);
  close(state.maxDensity, scanDensity, 2e-4, `density peak n=${n}: `);
  assert.ok(state.turningPoint < OSC_Q_WINDOW[1]);
  assert.ok(state.energy <= OSC_LEVEL_E_MAX);
  assert.ok(Number.isFinite(state.forbiddenBound));
  assert.ok(Number.isFinite(state.windowTailBound));
  eigenCount += 1;
}

// Known ground-state forbidden probability: erfc(1) = 0.1572992070502851...
close(oscillatorState(0).forbiddenProbability, 0.15729920705028513, 1e-8, "erfc(1): ");
for (let n = 1; n < forbiddenValues.length; n += 1) {
  assert.ok(
    forbiddenValues[n] < forbiddenValues[n - 1],
    `forbidden probability should decrease with n at n=${n}`,
  );
}

// High-n normalization and selected high-n orthogonal pairs.
for (let n = 0; n <= CORRESPONDENCE_N_MAX; n += 1) {
  const norm = simpson(q => hermiteFunction(n, q) ** 2, -15, 15, 8192);
  close(norm, 1, 2e-10, `high norm n=${n}: `);
  for (const q of [-10, -7, 0, 7, 10]) {
    assert.ok(Number.isFinite(hermiteFunction(n, q)), `finite phi n=${n} q=${q}`);
  }
  for (const q of [1.3, 3.1]) {
    close(
      hermiteFunction(n, -q),
      (n % 2 === 0 ? 1 : -1) * hermiteFunction(n, q),
      1e-12,
      `high parity n=${n} q=${q}: `,
    );
  }
}
for (const [n, m] of [[24, 23], [24, 0], [23, 22], [20, 10], [11, 10]]) {
  const overlap = simpson(
    q => hermiteFunction(n, q) * hermiteFunction(m, q),
    -15,
    15,
    4096,
  );
  close(overlap, 0, 1e-9, `high orthogonality n=${n} m=${m}: `);
}
// Orthogonality across the whole n = 0..24 control range. The coarser grid is
// enough here; the separate n <= 10 block above already used a finer one.
for (let n = 0; n <= CORRESPONDENCE_N_MAX; n += 1) {
  for (let m = 0; m < n; m += 1) {
    const overlap = simpson(
      q => hermiteFunction(n, q) * hermiteFunction(m, q),
      -15,
      15,
      2048,
    );
    close(overlap, 0, 1e-9, `full-range orthogonality n=${n} m=${m}: `);
  }
}

// -------------------------------------------------- finite-bin correspondence
// Uniform-phase classical sampling: theta is uniform, q = A cos(theta). This
// is independent of the arcsine closed form used by the widget model.
const PHASE_SAMPLES = 100000;
let correspondenceCount = 0;

for (let n = 0; n <= CORRESPONDENCE_N_MAX; n += 1) {
  const amplitude = Math.sqrt(2 * n + 1);
  const phaseQ = new Float64Array(PHASE_SAMPLES);
  for (let j = 0; j < PHASE_SAMPLES; j += 1) {
    phaseQ[j] = amplitude * Math.cos((2 * Math.PI * (j + 0.5)) / PHASE_SAMPLES);
  }

  for (const bins of BIN_VALUES) {
    const state = correspondenceState(n, bins);
    assert.equal(state.n, n);
    assert.equal(state.bins, bins);
    close(state.amplitude, amplitude, 1e-15, `amplitude n=${n}: `);
    close(state.energy, n + 0.5, 1e-15, `correspondence energy n=${n}: `);
    close(state.binWidth, (2 * state.window[1]) / bins, 1e-15, `bin width n=${n} b=${bins}: `);
    close(state.window[0], -(amplitude + 3), 1e-15, `left window n=${n}: `);
    close(state.window[1], amplitude + 3, 1e-15, `right window n=${n}: `);
    close(state.tailLimit, amplitude + 3 + 8, 1e-15, `tail limit n=${n}: `);
    assert.equal(state.edges.length, bins + 1);
    assert.equal(state.quantum.length, bins);
    assert.equal(state.classical.length, bins);
    close(state.edges[0], state.window[0], 1e-15, `left edge n=${n} b=${bins}: `);
    close(state.edges[bins], state.window[1], 1e-15, `right edge n=${n} b=${bins}: `);

    for (let i = 0; i < bins; i += 1) {
      const a = state.edges[i];
      const b = state.edges[i + 1];
      assert.ok(Number.isFinite(a) && Number.isFinite(b));
      assert.ok(b > a, `edge order n=${n} b=${bins} i=${i}`);
      const independentQuantum = simpson(
        q => hermiteFunction(n, q) ** 2,
        a,
        b,
        512,
      );
      close(
        state.quantum[i],
        independentQuantum,
        1e-7,
        `quantum bin n=${n} bins=${bins} i=${i}: `,
      );
      close(state.quantum[i],gaussBin(q=>hermiteFunction(n,q)**2,a,b),1e-8,`independent Gauss bin n=${n} bins=${bins} i=${i}: `);
      close(
        state.quantum[i],
        quantumBinProbability(n, a, b),
        1e-12,
        `quantum bin wrapper n=${n} bins=${bins} i=${i}: `,
      );
      assert.ok(state.quantum[i] >= 0 && state.quantum[i] <= 1 + 1e-12);
      assert.ok(state.classical[i] >= 0 && state.classical[i] <= 1 + 1e-12);
    }
    for (const value of [...state.edges, ...state.quantum, ...state.classical]) {
      assert.ok(Number.isFinite(value), `finite bin data n=${n} bins=${bins}`);
    }

    // Independent uniform-phase histogram for every n and every bin setting.
    const halfWindow = state.window[1];
    const counts = new Int32Array(bins);
    for (let j = 0; j < PHASE_SAMPLES; j += 1) {
      const q = phaseQ[j];
      const index = Math.min(
        bins - 1,
        Math.max(0, Math.floor(((q + halfWindow) / (2 * halfWindow)) * bins)),
      );
      counts[index] += 1;
    }
    for (let i = 0; i < bins; i += 1) {
      close(
        state.classical[i],
        counts[i] / PHASE_SAMPLES,
        4e-5,
        `classical arcsine n=${n} bins=${bins} i=${i}: `,
      );
      close(
        state.classical[i],
        classicalBinProbability(state.edges[i], state.edges[i + 1], amplitude),
        1e-15,
        `classical wrapper n=${n} bins=${bins} i=${i}: `,
      );
    }

    close(state.quantumSum + state.quantumTail, 1, 1e-9, `quantum sum+tail n=${n} b=${bins}: `);
    close(state.quantumTail, state.quantumTailValue, 1e-15);
    close(
      state.quantumOutside,
      state.quantumTailValue + state.quantumTailBound,
      1e-15,
    );
    assert.ok(state.quantumOutside >= state.quantumTail);
    close(state.quantumTotal, state.quantumSum + state.quantumTail, 1e-15);
    close(state.classicalSum, 1, 1e-12, `classical sum n=${n} b=${bins}: `);
    assert.equal(state.classicalOutside, 0);
    assert.equal(state.branch, n <= 3 ? "low" : n >= 12 ? "high" : "transition");
    const variation = 0.5 * state.quantum.reduce(
      (sum, value, i) => sum + Math.abs(value - state.classical[i]),
      0,
    ) + 0.5 * state.quantumTailValue;
    close(state.totalVariation, variation, 1e-15, `total variation n=${n} b=${bins}: `);
    close(state.totalVariationTailBound, state.quantumTailBound / 2, 1e-15);
    const peak = Math.max(...state.quantum, ...state.classical);
    close(state.yMax, Math.max(peak, 0.01) * 1.15, 1e-15, `yMax n=${n} b=${bins}: `);
    assert.ok(state.yMax > 0 && Number.isFinite(state.yMax));
    assert.ok(state.binWidth > 0 && Number.isFinite(state.binWidth));
    assert.ok(Number.isFinite(state.quantumSum));
    assert.ok(Number.isFinite(state.classicalSum));
    assert.ok(Number.isFinite(state.quantumTail));
    assert.ok(Number.isFinite(state.quantumTailBound));
    assert.ok(Number.isFinite(state.quantumTailValue));
    assert.ok(state.quantumTailValue >= 0 && state.quantumTailBound >= 0);

    const outside = 2 * simpson(
      q => hermiteFunction(n, q) ** 2,
      state.window[1],
      state.tailLimit,
      2048,
    );
    close(state.quantumTailValue, outside, 1e-12, `quantum outside n=${n} b=${bins}: `);
    const outsideBeyond = 2 * simpson(
      q => hermiteFunction(n, q) ** 2,
      state.tailLimit,
      state.tailLimit + 8,
      2048,
    );
    assert.ok(
      outsideBeyond <= state.quantumTailBound * (1 + 1e-9) + 1e-300,
      `quantum tail cutoff bound n=${n} b=${bins}: ${outsideBeyond} > ${state.quantumTailBound}`,
    );
    correspondenceCount += 1;
  }
}

// Classical finite-bin identities outside the support.
for (const [a, b] of [
  [-10, -9],
  [9, 10],
  [3, 5],
  [-5, -3],
]) {
  close(classicalBinProbability(a, b, 1), 0, 1e-15, `classical outside ${a},${b}: `);
}
close(classicalBinProbability(-2, 2, 1), 1, 1e-15, "classical spanning bin: ");
close(classicalBinProbability(-1,0,1),.5,1e-15,"left turning-point bin: ");
close(classicalBinProbability(0,1,1),.5,1e-15,"right turning-point bin: ");

// -------------------------------------------------------------- actual presets
for (const preset of OSC_PRESETS) {
  const state = oscillatorState(preset.n);
  assert.equal(state.n, preset.n);
  assert.ok(state.forbiddenProbability > 0 && state.forbiddenProbability < 0.5);
  assert.ok(state.maxAbsWave <= OSC_WAVE_YLIM + 1e-12);
}
for (const preset of CORRESPONDENCE_PRESETS) {
  const state = correspondenceState(preset.n, preset.bins);
  assert.equal(state.branch, preset.n <= 3 ? "low" : preset.n >= 12 ? "high" : "transition");
  assert.equal(state.bins, preset.bins);
  close(state.quantumSum + state.quantumTail, 1, 1e-9, `preset ${preset.id}: `);
  close(state.classicalSum, 1, 1e-12, `preset ${preset.id}: `);
  assert.equal(state.classicalOutside, 0);
  assert.ok(Number.isFinite(state.yMax));
  assert.ok(state.quantum.every(Number.isFinite));
  assert.ok(state.classical.every(Number.isFinite));
}
const defaultState = correspondenceState(
  CORRESPONDENCE_DEFAULT.n,
  CORRESPONDENCE_DEFAULT.bins,
);
assert.equal(defaultState.bins, CORRESPONDENCE_DEFAULT.bins);
assert.equal(defaultState.branch, "transition");

console.log(
  `Oscillator wave: ${eigenCount} exact eigenstates checked in detail for full-line norm/orthogonality, parity, n nodes, finite-difference Schrodinger equation, energy moments, turning points and nonzero forbidden/cutoff tails; n=0..24 normalization/orthogonality also checked; ${correspondenceCount} n/bin combinations checked with independent quantum quadrature, uniform-phase classical sampling, sum+tail closure, actual presets and finite plot bounds.`,
);
