/** Small teaching models; references and independent checks live in scripts/verify/*-figure.mjs. */
export function momentumGauge(shift) {
  const mass = 2, mechanical = 4;
  return {shift, mass, mechanical, canonical: mechanical + shift, velocity: mechanical / mass, kinetic: mechanical ** 2 / (2 * mass)};
}

export function boundaryPath(t, a) { return t + a * t * (1 - t); }
export function boundaryState(a) {
  return {a, initialVelocity: 1 + a, acceleration: -2 * a, action: .5 + a * a / 6, actionSlope: a / 3, stationary: a === 0};
}

export const WAVE_COMPARISON = {wavelength: 2, period: .5, amplitude: 1, particleVelocity: 4, times: [0, .125]};
export function classicalWave(x, t) { return Math.cos(Math.PI * x - 4 * Math.PI * t); }
export const STATE_PROBABILITY = {amplitudes: [1 / Math.sqrt(5), 2 / Math.sqrt(5)], probabilities: [1 / 5, 4 / 5]};
