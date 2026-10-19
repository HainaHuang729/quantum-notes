export type Complex = [number, number];
export type LadderOp = "a" | "a†";

export const FOCK_MAX_N: number;
export const FOCK_DIM: number;
export const C: (r: number, i?: number) => Complex;
export const add: (a: Complex, b: Complex) => Complex;
export const mul: (a: Complex, b: Complex) => Complex;
export const scale: (a: Complex, s: number) => Complex;
export const abs2: (a: Complex) => number;
export const norm2: (state: Complex[]) => number;
export const expi: (theta: number) => Complex;
export function zeroState(): Complex[];
export function basisState(n: number): Complex[];
export const FOCK_PRESETS: { id: string; label: string }[];
export function fockPreset(id: string): Complex[];
export function supportHighest(state: Complex[]): number;
export function fockStats(state: Complex[]): {
  norm2: number;
  meanN: number;
  energy: number | null;
  support: number;
  atCeiling: boolean;
  zero: boolean;
  probabilities: number[];
};
export interface LadderResult {
  op: LadderOp;
  raw: Complex[] | null;
  norm2: number | null;
  state: Complex[] | null;
  blocked: boolean;
  zero: boolean;
  meanNBefore: number;
}
export function ladder(state: Complex[], op: LadderOp): LadderResult;
export function globalPhase(state: Complex[], theta: number): Complex[];

export const PHI0_PREFACTOR: number;
export function phi0(q: number): number;
export function phi1(q: number): number;
export const BASIS_Q_WINDOW: [number, number];
export const BASIS_PHASE_STEPS: number;
export const BASIS_PHASE_MAX: number;
export const BASIS_TIME_STEPS: number;
export const BASIS_TIME_MAX: number;
export const BASIS_GLOBAL_MAX: number;
export const BASIS_PERIOD: number;
export const BASIS_DENSITY_MAX: number;
export const BASIS_AMPLITUDE_MAX: number;
export const BASIS_PRESETS: {
  id: string;
  label: string;
  w: number;
  phaseStep: number;
  timeStep: number;
  globalStep: number;
}[];
export interface SynthesisParameters {
  w: number;
  phaseStep: number;
  timeStep: number;
  globalStep: number;
}
export function synthesisState(p: SynthesisParameters): {
  w: number;
  phi: number;
  t: number;
  kappa: number;
  delta: number;
  c0: Complex;
  c1: Complex;
  meanQ: number;
  meanE: number;
  secondQ: number;
  varianceQ: number;
  density: (q: number) => number;
  real: (q: number) => number;
  imag: (q: number) => number;
  component0: (q: number) => number;
  component1: (q: number) => number;
  energyWeights: [number, number];
  windowMass: number;
  tail: number;
  period: number;
};
