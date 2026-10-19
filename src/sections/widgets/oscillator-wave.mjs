// Harmonic oscillator in units hbar = m = omega = 1; q is dimensionless.
// Normalized Hermite functions use the stable three-term recurrence
//   phi_0 = pi^(-1/4) exp(-q^2/2), phi_1 = sqrt(2) q phi_0,
//   phi_{n+1} = sqrt(2/(n+1)) q phi_n - sqrt(n/(n+1)) phi_{n-1}.
// All probabilities are full-line probabilities. Finite plot windows are
// never renormalized; their outside tails are returned separately.
// No time evolution, sampling, randomness or external dependencies.

export const OSC_Q_WINDOW = [-7, 7];
export const OSC_N_MAX = 10;
export const OSC_WAVE_YLIM = 0.9;
export const OSC_DENSITY_YLIM = 0.8;
export const OSC_LEVEL_WINDOW = [-5, 5];
export const OSC_LEVEL_E_MAX = 13;
export const OSC_INTEGRATION_LIMIT = 10;

export const CORRESPONDENCE_N_MAX = 24;
export const CORRESPONDENCE_BINS_MIN = 12;
export const CORRESPONDENCE_BINS_MAX = 72;
export const CORRESPONDENCE_BINS_STEP = 4;
export const CORRESPONDENCE_WINDOW_MARGIN = 3;
export const CORRESPONDENCE_TAIL_EXTRA = 8;

export const OSC_PRESETS = [
  { id: "ground", label: "基态", n: 0 },
  { id: "first", label: "第一激发", n: 1 },
  { id: "higher", label: "较高态", n: 10 },
];

export const CORRESPONDENCE_PRESETS = [
  { id: "low", label: "低n", n: 2, bins: 24 },
  { id: "high", label: "高n", n: 24, bins: 24 },
  { id: "coarse", label: "粗", n: 11, bins: 12 },
  { id: "fine", label: "细", n: 11, bins: 72 },
];

export const CORRESPONDENCE_DEFAULT = { n: 11, bins: 24 };

const PHI0 = Math.PI ** -0.25;

/** Composite Simpson rule; an odd interval count is rounded up to even. */
function integrate(f, a, b, intervals) {
  if (a === b) return 0;
  const m = Math.max(2, intervals + (intervals % 2));
  const h = (b - a) / m;
  let sum = f(a) + f(b);
  for (let i = 1; i < m; i += 1) sum += (i % 2 ? 4 : 2) * f(a + i * h);
  return (sum * h) / 3;
}

/** Normalized harmonic-oscillator eigenfunction phi_n(q). */
export function hermiteFunction(n, q) {
  const level = Math.max(0, Math.trunc(n));
  if (level === 0) return PHI0 * Math.exp((-q * q) / 2);
  let previous = PHI0 * Math.exp((-q * q) / 2);
  let current = Math.SQRT2 * q * previous;
  for (let k = 1; k < level; k += 1) {
    const next =
      Math.sqrt(2 / (k + 1)) * q * current -
      Math.sqrt(k / (k + 1)) * previous;
    previous = current;
    current = next;
  }
  return current;
}

export function oscillatorEnergy(n) {
  return Math.max(0, Math.trunc(n)) + 0.5;
}

export function turningPoint(n) {
  return Math.sqrt(2 * Math.max(0, Math.trunc(n)) + 1);
}

const FACTORIAL = [1];
for (let i = 1; i <= CORRESPONDENCE_N_MAX; i += 1) {
  FACTORIAL[i] = FACTORIAL[i - 1] * i;
}

/** Sum of absolute coefficients of the physicists' Hermite polynomial H_n. */
function hermiteCoefficientAbsSum(n) {
  if (n === 0) return 1;
  if (n === 1) return 2;
  let previous = [1];
  let current = [0, 2];
  for (let k = 1; k < n; k += 1) {
    const next = new Array(k + 2).fill(0);
    for (let j = 0; j < current.length; j += 1) next[j + 1] += 2 * current[j];
    for (let j = 0; j < previous.length; j += 1) next[j] -= 2 * k * previous[j];
    previous = current;
    current = next;
  }
  return current.reduce((sum, coefficient) => sum + Math.abs(coefficient), 0);
}

const HERMITE_ABS_SUM = Array.from(
  { length: CORRESPONDENCE_N_MAX + 1 },
  (_, n) => hermiteCoefficientAbsSum(n),
);

/**
 * Conservative ONE-SIDED bound for integral_Q^infinity phi_n(q)^2 dq.
 * For q >= Q >= sqrt(2n), q^(2n) exp(-q^2/2) decreases, so
 * |phi_n|^2 <= c_n^2 (sum |H_n coefficients|)^2
 *   Q^(2n) exp(-Q^2/2) exp(-q^2/2), and
 * the Gaussian tail is bounded by exp(-Q^2/2)/Q. The result is the upper
 * bound c_n^2 (sum)^2 Q^(2n-1) exp(-Q^2). Callers multiply by two
 * for the symmetric pair of tails. This bounds analytic cutoff error only,
 * not the separate Simpson quadrature error on the retained finite interval.
 */
function hermiteTailBound(n, Q) {
  const level = Math.max(0, Math.trunc(n));
  if (!(Q > 0) || Q * Q < 2 * level) return Number.POSITIVE_INFINITY;
  const c = 1 / Math.sqrt(2 ** level * FACTORIAL[level] * Math.sqrt(Math.PI));
  const coefficientSum = HERMITE_ABS_SUM[level];
  return (
    c * c * coefficientSum * coefficientSum * Q ** (2 * level - 1) * Math.exp(-Q * Q)
  );
}

/** Forbidden-region probability 2 * integral from q_t to the stated cutoff. */
export function forbiddenRegion(n) {
  const level = Math.max(0, Math.trunc(n));
  const qTurning = Math.sqrt(2 * level + 1);
  const limit = OSC_INTEGRATION_LIMIT;
  const value = 2 * integrate(q => hermiteFunction(level, q) ** 2, qTurning, limit, 1200);
  const bound = 2 * hermiteTailBound(level, limit);
  return {
    value,
    bound,
    // Upper completion of the numerical integral; not a certified enclosure
    // of the exact probability because value itself has quadrature error.
    total: value + bound,
    limit,
    turningPoint: qTurning,
  };
}

/** Complete display state of one exact oscillator eigenstate. */
export function oscillatorState(n) {
  const level = Math.max(0, Math.trunc(n));
  const energy = level + 0.5;
  const qTurning = Math.sqrt(2 * level + 1);
  const phi = q => hermiteFunction(level, q);
  const density = q => {
    const value = phi(q);
    return value * value;
  };

  let maxAbsWave = 0;
  let maxDensity = 0;
  for (let i = 0; i <= 800; i += 1) {
    const q = OSC_Q_WINDOW[0] + ((OSC_Q_WINDOW[1] - OSC_Q_WINDOW[0]) * i) / 800;
    const value = phi(q);
    maxAbsWave = Math.max(maxAbsWave, Math.abs(value));
    maxDensity = Math.max(maxDensity, value * value);
  }

  const windowMass = integrate(density, OSC_Q_WINDOW[0], OSC_Q_WINDOW[1], 2048);
  const windowTailValue = 2 * integrate(density, OSC_Q_WINDOW[1], OSC_Q_WINDOW[1] + 8, 1024);
  const windowTailLimit = OSC_Q_WINDOW[1] + 8;
  const windowTailBound = 2 * hermiteTailBound(level, windowTailLimit);
  const windowTail = windowTailValue + windowTailBound;

  const forbidden = forbiddenRegion(level);

  return {
    n: level,
    energy,
    turningPoint: qTurning,
    parity: level % 2 === 0 ? "even" : "odd",
    nodes: level,
    phi,
    density,
    qWindow: OSC_Q_WINDOW,
    waveLimit: OSC_WAVE_YLIM,
    densityLimit: OSC_DENSITY_YLIM,
    levelWindow: OSC_LEVEL_WINDOW,
    levelEnergyMax: OSC_LEVEL_E_MAX,
    maxAbsWave,
    maxDensity,
    windowMass,
    windowTailValue,
    windowTailBound,
    windowTail,
    windowTailLimit,
    forbiddenProbability: forbidden.value,
    forbiddenBound: forbidden.bound,
    forbiddenTotal: forbidden.total,
    forbiddenLimit: forbidden.limit,
    normCheck: windowMass + windowTail,
  };
}

/** Probability of one finite bin for the exact quantum density. */
export function quantumBinProbability(n, a, b) {
  const level = Math.max(0, Math.trunc(n));
  return integrate(q => hermiteFunction(level, q) ** 2, a, b, 256);
}

/**
 * Exact classical single-bin probability for amplitude A:
 * [asin(clamp(b/A)) - asin(clamp(a/A))] / pi.
 * Clamping only evaluates the finite-bin integral; it does not clip a point
 * density and it produces zero for bins wholly outside [-A, A].
 */
export function classicalBinProbability(a, b, A) {
  const reduced = value => Math.max(-1, Math.min(1, value / A));
  return (Math.asin(reduced(b)) - Math.asin(reduced(a))) / Math.PI;
}

/** Finite-bin quantum/classical comparison on the window +/- (A + 3). */
export function correspondenceState(n, bins) {
  const level = Math.max(0, Math.trunc(n));
  const count = Math.max(1, Math.trunc(bins));
  const amplitude = Math.sqrt(2 * level + 1);
  const halfWindow = amplitude + CORRESPONDENCE_WINDOW_MARGIN;
  const edges = Array.from(
    { length: count + 1 },
    (_, i) => -halfWindow + (2 * halfWindow * i) / count,
  );

  const quantum = new Array(count);
  const classical = new Array(count);
  let quantumSum = 0;
  let classicalSum = 0;
  let totalVariation = 0;
  let maxQuantum = 0;
  let maxClassical = 0;

  for (let i = 0; i < count; i += 1) {
    const qProbability = quantumBinProbability(level, edges[i], edges[i + 1]);
    const cProbability = classicalBinProbability(edges[i], edges[i + 1], amplitude);
    quantum[i] = qProbability;
    classical[i] = cProbability;
    quantumSum += qProbability;
    classicalSum += cProbability;
    totalVariation += Math.abs(qProbability - cProbability);
    maxQuantum = Math.max(maxQuantum, qProbability);
    maxClassical = Math.max(maxClassical, cProbability);
  }

  const tailLimit = halfWindow + CORRESPONDENCE_TAIL_EXTRA;
  const tailValue = 2 * integrate(
    q => hermiteFunction(level, q) ** 2,
    halfWindow,
    tailLimit,
    1024,
  );
  const tailBound = 2 * hermiteTailBound(level, tailLimit);
  const quantumTail = tailValue;
  const quantumOutside = tailValue + tailBound;

  return {
    n: level,
    bins: count,
    energy: level + 0.5,
    amplitude,
    binWidth: (2 * halfWindow) / count,
    window: [-halfWindow, halfWindow],
    edges,
    quantum,
    classical,
    quantumSum,
    classicalSum,
    quantumTailValue: tailValue,
    quantumTailBound: tailBound,
    quantumTail,
    quantumOutside,
    quantumTotal: quantumSum + quantumTail,
    tailLimit,
    // The classical support [-A, A] lies strictly inside the window, so the
    // outside probability is exactly zero by construction, not by rounding.
    classicalOutside: 0,
    yMax: Math.max(maxQuantum, maxClassical, 0.01) * 1.15,
    // Add a single outside-window category. Classical mass there is exactly
    // zero. This is a full-line coarse-observation TV estimate, not the
    // unbinned density TV. Omitted analytic tail changes it by <= bound/2;
    // quadrature error is separate.
    totalVariation: (totalVariation + tailValue) / 2,
    totalVariationTailBound: tailBound / 2,
    branch: level <= 3 ? "low" : level >= 12 ? "high" : "transition",
  };
}
