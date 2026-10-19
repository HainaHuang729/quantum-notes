// Dimensionless comparison of V(q)=q^2/2+g q^4/4 with its quadratic part.
// The lab examines ONE turning amplitude A. It does not integrate motion,
// sample trajectories, or compute a nonlinear period.
export const SMALL_OSC_LIMITS = Object.freeze({
  A: Object.freeze({ min: 0.1, max: 3, step: 0.1 }),
  g: Object.freeze({ min: 0, max: 0.5, step: 0.01 }),
});

// Deliberately a teaching threshold, not a source constant and not an
// equality tolerance for a degenerate parameter branch.
export const SMALL_OSC_THRESHOLD = 0.05;
const THRESHOLD_LABEL = `${SMALL_OSC_THRESHOLD * 100}%`;

export const SMALL_OSC_PRESETS = Object.freeze([
  { label: "线性 g=0", A: 1.2, g: 0 },
  { label: `力修正 ${THRESHOLD_LABEL}`, A: 1, g: 0.05 },
  { label: `势修正 ${THRESHOLD_LABEL}`, A: 1, g: 0.1 },
  { label: "二次近似不足", A: 2, g: 0.2 },
]);

const tidy = (v) => (Math.abs(v) < 1e-12 ? 0 : v);

export function potential(q, g) {
  return (q * q) / 2 + (g * q ** 4) / 4;
}

export function harmonicPotential(q) {
  return (q * q) / 2;
}

export function force(q, g) {
  return -q - g * q ** 3;
}

export function harmonicForce(q) {
  return -q;
}

export function quantize(value, { min, max, step }) {
  const clamped = Math.min(max, Math.max(min, value));
  const n = Math.round((clamped - min) / step);
  return tidy(Number((min + n * step).toFixed(10)));
}

export function shiftParameter(name, value, direction) {
  const limit = SMALL_OSC_LIMITS[name];
  if (!limit) throw new RangeError(`unknown small-oscillation parameter: ${name}`);
  return quantize(value + direction * limit.step, limit);
}

export function smallOscillationState({ A, g }) {
  if (!Number.isFinite(A) || A <= 0) throw new RangeError("A must be positive and finite");
  if (!Number.isFinite(g) || g < 0) throw new RangeError("g must be nonnegative and finite");

  const half = 1.25 * A;
  const xDomain = [-half, half];
  const potentialEdge = potential(half, g);
  const forceEdge = Math.abs(force(half, g));

  const turningPotential = potential(A, g);
  const harmonicTurning = harmonicPotential(A);
  const turningForce = force(A, g);
  const harmonicForceAtTurning = harmonicForce(A);

  // At the turning point q=A the quartic/harmonic ratios are exactly
  // (g A^4/4)/(A^2/2)=gA^2/2 and (g A^3)/A=gA^2.
  const correctionPotential = (g * A * A) / 2;
  const correctionForce = g * A * A;
  const threshold = SMALL_OSC_THRESHOLD;

  const branch = g === 0
    ? "exact"
    : correctionForce <= threshold
      ? "within"
      : correctionPotential <= threshold
        ? "potential-only"
        : "outside";

  const correctionTop = Math.max(
    1.12 * threshold,
    1.08 * g * SMALL_OSC_LIMITS.A.max ** 2,
  );

  return {
    A,
    g,
    xDomain,
    potentialDomain: [0, potentialEdge * 1.08],
    forceDomain: [-forceEdge * 1.08, forceEdge * 1.08],
    correctionXDomain: [0, SMALL_OSC_LIMITS.A.max],
    correctionDomain: [0, correctionTop],
    turningPotential,
    harmonicTurning,
    turningForce,
    harmonicForceAtTurning,
    correctionPotential,
    correctionForce,
    threshold,
    branch,
    potential: (q) => potential(q, g),
    harmonicPotential,
    force: (q) => force(q, g),
    harmonicForce,
    correctionPotentialAt: (a) => (g * a * a) / 2,
    correctionForceAt: (a) => g * a * a,
  };
}
