/**
 * Thermal harmonic oscillator (hbar = m = omega = 1).
 *
 * tau = k_B T / (hbar omega), E_n = (n + 1/2) hbar omega.
 * The oscillator is a Boltzmann mixture over the exact oscillator levels:
 *
 *   E(tau) = 1/2 + 1 / (e^(1/tau) - 1),
 *   C_V/k_B = x^2 e^(-x) / (1 - e^(-x))^2,  x = 1/tau.
 *
 * expm1 and a small-x series keep both limits finite.  The zero-point term
 * shifts E but does not contribute to dE/dT.  Checked by
 * scripts/verify/thermal-oscillator.mjs.
 */

export const THERMAL_TAU_MAX = 5;
export const THERMAL_TAU_STEP = 0.05;
export const THERMAL_GROUND_E = 0.5;
export const THERMAL_EINSTEIN_FACTOR = 3;

export const THERMAL_PRESETS = [
  { id: 'ground', label: 'τ=0 基态极限', tau: 0 },
  { id: 'low', label: '低温 τ=0.5', tau: 0.5 },
  { id: 'high', label: '高温 τ=4', tau: 4 },
];

export function thermalState(tau) {
  if (!(tau >= 0) || !Number.isFinite(tau)) {
    throw new RangeError('thermalState: tau must be finite and non-negative');
  }
  if (tau === 0) {
    return {
      tau: 0,
      x: Infinity,
      E: THERMAL_GROUND_E,
      C: 0,
      meanN: 0,
      p0: 1,
      classicalE: 0,
      classicalC: 1,
      einsteinC: 0,
      branch: 'ground',
    };
  }

  const x = 1 / tau;
  let E;
  let C;
  let meanN;
  let p0;
  if (x > 700) {
    // expm1(x) would overflow; the ground term already dominates.
    E = THERMAL_GROUND_E;
    C = 0;
    meanN = 0;
    p0 = 1;
  } else {
    const em = Math.exp(-x);
    const den = -Math.expm1(-x); // 1 - e^(-x), accurate for small x
    E = THERMAL_GROUND_E + 1 / Math.expm1(x);
    C = x < 1e-4
      ? 1 - (x * x) / 12 + x ** 4 / 240
      : (x * x * em) / (den * den);
    meanN = 1 / Math.expm1(x);
    p0 = den;
  }

  return {
    tau,
    x,
    E,
    C,
    meanN,
    p0,
    classicalE: tau,
    classicalC: 1,
    einsteinC: THERMAL_EINSTEIN_FACTOR * C,
    branch: 'thermal',
  };
}

/** Boltzmann weights p_n = (1 - e^(-1/tau)) e^(-n/tau), n = 0 ... nMax. */
export function thermalLevels(tau, nMax = 8) {
  if (!(tau >= 0) || !Number.isFinite(tau)) {
    throw new RangeError('thermalLevels: tau must be finite and non-negative');
  }
  if (!Number.isInteger(nMax) || nMax < 0) {
    throw new RangeError('thermalLevels: nMax must be a non-negative integer');
  }
  if (tau === 0) {
    const p = Array.from({ length: nMax + 1 }, (_, n) => (n === 0 ? 1 : 0));
    return { p, energies: p.map((_, n) => n + 0.5), sum: 1 };
  }
  const x = 1 / tau;
  const p0 = -Math.expm1(-x);
  const p = Array.from({ length: nMax + 1 }, (_, n) => p0 * Math.exp(-n * x));
  const sum = p.reduce((s, value) => s + value, 0);
  return { p, energies: p.map((_, n) => n + 0.5), sum };
}
