/**
 * Finite-support oscillator algebra (hbar = m = omega = 1) and the
 * energy-basis / position-basis synthesis of the same state.
 *
 * The ladder operators are applied coefficient by coefficient.  Nothing here
 * builds a truncated matrix and claims that [a, a^dagger] = I at the support
 * edge.  A ladder step is an algebraic map followed by an explicit
 * normalization, not a unitary transformation and not a measurement.
 *
 * Checked by scripts/verify/oscillator-algebra.mjs.
 */

/** Highest coefficient index kept in the finite support: 0 ... 12. */
export const FOCK_MAX_N = 12;
export const FOCK_DIM = FOCK_MAX_N + 1;

/** A complex number is a two-entry array [re, im]. */
export const C = (r, i = 0) => [r, i];
export const add = (a, b) => C(a[0] + b[0], a[1] + b[1]);
export const mul = (a, b) => C(a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]);
export const scale = (a, s) => C(a[0] * s, a[1] * s);
export const abs2 = (a) => a[0] * a[0] + a[1] * a[1];
export const norm2 = (state) => state.reduce((sum, a) => sum + abs2(a), 0);
export const expi = (theta) => C(Math.cos(theta), Math.sin(theta));

export function zeroState() {
  return Array.from({ length: FOCK_DIM }, () => C(0));
}

export function basisState(n) {
  if (!Number.isInteger(n) || n < 0 || n > FOCK_MAX_N) {
    throw new RangeError(`basisState: n must be an integer in 0 ... ${FOCK_MAX_N}`);
  }
  return Array.from({ length: FOCK_DIM }, (_, k) => C(k === n ? 1 : 0));
}

export const FOCK_PRESETS = [
  { id: 'vacuum', label: '|0〉' },
  { id: 'n3', label: '|3〉' },
  { id: 'plus', label: '(|0〉+|1〉)/√2' },
  { id: 'iphase', label: '(|0〉+i|1〉)/√2' },
];

export function fockPreset(id) {
  switch (id) {
    case 'vacuum':
      return basisState(0);
    case 'n3':
      return basisState(3);
    case 'plus': {
      const state = zeroState();
      state[0] = C(Math.SQRT1_2);
      state[1] = C(Math.SQRT1_2);
      return state;
    }
    case 'iphase': {
      const state = zeroState();
      state[0] = C(Math.SQRT1_2);
      state[1] = C(0, Math.SQRT1_2);
      return state;
    }
    default:
      throw new RangeError(`fockPreset: unknown preset ${id}`);
  }
}

/** Highest genuinely nonzero coefficient; display precision never truncates support. */
export function supportHighest(state) {
  let highest = -1;
  for (let n = 0; n < state.length; n += 1) {
    if (state[n][0] !== 0 || state[n][1] !== 0) highest = n;
  }
  return highest;
}

/**
 * State readout.  For a normalized state probabilities add to one; for the
 * zero vector every probability is reported as zero and the energy is null.
 */
export function fockStats(state) {
  const total = norm2(state);
  const zero = total === 0;
  let meanN = 0;
  let support = -1;
  for (let n = 0; n < state.length; n += 1) {
    const p = abs2(state[n]);
    if (state[n][0] !== 0 || state[n][1] !== 0) support = n;
    meanN += n * p;
  }
  if (!zero) meanN /= total;
  return {
    norm2: total,
    meanN: zero ? 0 : meanN,
    energy: zero ? null : meanN + 0.5,
    support,
    atCeiling: !!state[FOCK_MAX_N] && (state[FOCK_MAX_N][0] !== 0 || state[FOCK_MAX_N][1] !== 0),
    zero,
    probabilities: state.map((a) => (zero ? 0 : abs2(a) / total)),
  };
}

/**
 * Apply a or a^dagger to a finite-support state.
 *
 *   (a psi)_n      = sqrt(n + 1) c_{n+1}
 *   (a^dagger psi)_n = sqrt(n) c_{n-1}
 *
 * The result is normalized only when its norm is nonzero.  The raw vector and
 * its norm squared are returned so the caller can show the pre-normalization
 * norm instead of hiding it.  Raising is blocked exactly when the state has
 * support at FOCK_MAX_N; annihilation of the vacuum returns a zero vector.
 */
export function ladder(state, op) {
  if (op !== 'a' && op !== 'a†') throw new TypeError('ladder: op must be "a" or "a†"');
  const before = fockStats(state);
  if (op === 'a†' && before.atCeiling) {
    return {
      op,
      raw: null,
      norm2: null,
      state: null,
      blocked: true,
      zero: false,
      meanNBefore: before.meanN,
    };
  }
  const raw = zeroState();
  if (op === 'a') {
    for (let n = 0; n < FOCK_MAX_N; n += 1) {
      raw[n] = scale(state[n + 1], Math.sqrt(n + 1));
    }
  } else {
    for (let n = 1; n <= FOCK_MAX_N; n += 1) {
      raw[n] = scale(state[n - 1], Math.sqrt(n));
    }
  }
  const n2 = norm2(raw);
  if (n2 === 0) {
    return {
      op,
      raw,
      norm2: 0,
      state: null,
      blocked: false,
      zero: true,
      meanNBefore: before.meanN,
    };
  }
  const inverse = 1 / Math.sqrt(n2);
  return {
    op,
    raw,
    norm2: n2,
    state: raw.map((a) => scale(a, inverse)),
    blocked: false,
    zero: false,
    meanNBefore: before.meanN,
  };
}

/** Multiply every coefficient by e^{i theta}; used to test global-phase invariance. */
export function globalPhase(state, theta) {
  const phase = expi(theta);
  return state.map((a) => mul(a, phase));
}

/* ------------------------------------------------------------------ *
 * Position representation of the same oscillator, hbar = m = omega = 1.
 * phi_0(q) = pi^(-1/4) exp(-q^2/2), phi_1(q) = sqrt(2) q phi_0(q).
 * ------------------------------------------------------------------ */

export const PHI0_PREFACTOR = Math.PI ** -0.25;

export function phi0(q) {
  return PHI0_PREFACTOR * Math.exp(-0.5 * q * q);
}

export function phi1(q) {
  return Math.SQRT2 * q * phi0(q);
}

export const BASIS_Q_WINDOW = [-5, 5];
export const BASIS_PHASE_STEPS = 8; // phi = m * pi / 8
export const BASIS_PHASE_MAX = 15;
export const BASIS_TIME_STEPS = 16; // t = n * pi / 8; density period 2 pi
export const BASIS_TIME_MAX = 16;
export const BASIS_GLOBAL_MAX = 3;
export const BASIS_PERIOD = 2 * Math.PI;

/*
 * Safe fixed plot bounds, derived rather than fitted:
 *   |psi|^2 <= phi_0^2 + phi_1^2 = exp(-q^2) (1 + 2 q^2) / sqrt(pi)
 *            <= 2 exp(-1/2) / sqrt(pi) = 0.6845,
 *   |psi|   <= sqrt(0.6845) = 0.8273.
 * The margins below leave room above those maxima.
 */
export const BASIS_DENSITY_MAX = 0.7;
export const BASIS_AMPLITUDE_MAX = 0.85;

export const BASIS_PRESETS = [
  { id: 'ground', label: 'φ₀ 本征态', w: 1, phaseStep: 0, timeStep: 0, globalStep: 0 },
  { id: 'first', label: 'φ₁ 本征态', w: 0, phaseStep: 0, timeStep: 0, globalStep: 0 },
  { id: 'inphase', label: '同相叠加', w: 0.5, phaseStep: 0, timeStep: 0, globalStep: 0 },
  { id: 'quadrature', label: '相差 π/2', w: 0.5, phaseStep: 4, timeStep: 0, globalStep: 0 },
];

function requireInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

function simpson(f, a, b, n = 2000) {
  const even = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / even;
  let sum = f(a) + f(b);
  for (let i = 1; i < even; i += 1) {
    sum += (i % 2 === 1 ? 4 : 2) * f(a + i * h);
  }
  return (sum * h) / 3;
}

/**
 * psi(q,t) = sqrt(w) phi_0 e^(-it/2) + sqrt(1-w) e^(i phi) phi_1 e^(-3it/2).
 *
 * `globalStep` multiplies the whole state by e^(i kappa), kappa = g pi/2.
 * It changes the complex components but not the density, the energy weights
 * or any position expectation.
 */
export function synthesisState(p) {
  const { w, phaseStep, timeStep, globalStep } = p;
  if (!(w >= 0 && w <= 1)) throw new RangeError('synthesisState: w must lie in [0, 1]');
  requireInteger(phaseStep, 'phaseStep');
  requireInteger(timeStep, 'timeStep');
  requireInteger(globalStep, 'globalStep');

  const phi = (phaseStep * Math.PI) / BASIS_PHASE_STEPS;
  const t = (timeStep * Math.PI) / BASIS_PHASE_STEPS;
  const kappa = (globalStep * Math.PI) / 2;
  const c0 = scale(expi(kappa - t / 2), Math.sqrt(w));
  const c1 = scale(expi(phi + kappa - (3 * t) / 2), Math.sqrt(1 - w));
  const rawDelta = phi - t;
  const delta = Math.atan2(Math.sin(rawDelta), Math.cos(rawDelta));

  const real = (q) => c0[0] * phi0(q) + c1[0] * phi1(q);
  const imag = (q) => c0[1] * phi0(q) + c1[1] * phi1(q);
  const density = (q) => {
    const re = real(q);
    const im = imag(q);
    return re * re + im * im;
  };
  const component0 = (q) => w * phi0(q) ** 2;
  const component1 = (q) => (1 - w) * phi1(q) ** 2;

  const meanQ = Math.SQRT2 * Math.sqrt(w * (1 - w)) * Math.cos(delta);
  const meanE = 1.5 - w;
  const secondQ = 1.5 - w;
  const varianceQ = Math.max(0, secondQ - meanQ * meanQ);

  const rawMass = simpson(density, BASIS_Q_WINDOW[0], BASIS_Q_WINDOW[1], 2000);
  const windowMass = Math.min(1, Math.max(0, rawMass));
  const tail = Math.max(0, 1 - windowMass);

  return {
    w,
    phi,
    t,
    kappa,
    delta,
    c0,
    c1,
    meanQ,
    meanE,
    secondQ,
    varianceQ,
    density,
    real,
    imag,
    component0,
    component1,
    energyWeights: [w, 1 - w],
    windowMass,
    tail,
    period: BASIS_PERIOD,
  };
}
