export function momentumGauge(shift: number): {shift: number; mass: number; mechanical: number; canonical: number; velocity: number; kinetic: number};
export function boundaryPath(t: number, a: number): number;
export function boundaryState(a: number): {a: number; initialVelocity: number; acceleration: number; action: number; actionSlope: number; stationary: boolean};
export const WAVE_COMPARISON: {wavelength: number; period: number; amplitude: number; particleVelocity: number; times: number[]};
export function classicalWave(x: number, t: number): number;
export const STATE_PROBABILITY: {amplitudes: number[]; probabilities: number[]};
