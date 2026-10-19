export const OSC_Q_WINDOW: [number, number];
export const OSC_N_MAX: number;
export const OSC_WAVE_YLIM: number;
export const OSC_DENSITY_YLIM: number;
export const OSC_LEVEL_WINDOW: [number, number];
export const OSC_LEVEL_E_MAX: number;
export const OSC_INTEGRATION_LIMIT: number;
export const CORRESPONDENCE_N_MAX: number;
export const CORRESPONDENCE_BINS_MIN: number;
export const CORRESPONDENCE_BINS_MAX: number;
export const CORRESPONDENCE_BINS_STEP: number;
export const CORRESPONDENCE_WINDOW_MARGIN: number;
export const CORRESPONDENCE_TAIL_EXTRA: number;
export const OSC_PRESETS: { id: string; label: string; n: number }[];
export const CORRESPONDENCE_PRESETS: { id: string; label: string; n: number; bins: number }[];
export const CORRESPONDENCE_DEFAULT: { n: number; bins: number };

export function hermiteFunction(n: number, q: number): number;
export function oscillatorEnergy(n: number): number;
export function turningPoint(n: number): number;

export interface ForbiddenRegion {
  /** Numerically integrated finite-interval contribution, not an exact value. */
  value: number;
  /** Analytic omitted-tail bound; does not bound quadrature error. */
  bound: number;
  /** value+bound; an upper completion of a numerical estimate, not exact mass. */
  total: number;
  limit: number;
  turningPoint: number;
}

export function forbiddenRegion(n: number): ForbiddenRegion;

export interface OscillatorState {
  n: number;
  energy: number;
  turningPoint: number;
  parity: "even" | "odd";
  nodes: number;
  phi: (q: number) => number;
  density: (q: number) => number;
  qWindow: [number, number];
  waveLimit: number;
  densityLimit: number;
  levelWindow: [number, number];
  levelEnergyMax: number;
  maxAbsWave: number;
  maxDensity: number;
  windowMass: number;
  windowTailValue: number;
  windowTailBound: number;
  windowTail: number;
  windowTailLimit: number;
  forbiddenProbability: number;
  forbiddenBound: number;
  forbiddenTotal: number;
  forbiddenLimit: number;
  normCheck: number;
}

export function oscillatorState(n: number): OscillatorState;
export function quantumBinProbability(n: number, a: number, b: number): number;
export function classicalBinProbability(a: number, b: number, A: number): number;

export interface CorrespondenceState {
  n: number;
  bins: number;
  energy: number;
  amplitude: number;
  binWidth: number;
  window: [number, number];
  edges: number[];
  quantum: number[];
  classical: number[];
  quantumSum: number;
  classicalSum: number;
  quantumTailValue: number;
  quantumTailBound: number;
  quantumTail: number;
  quantumOutside: number;
  quantumTotal: number;
  tailLimit: number;
  classicalOutside: number;
  yMax: number;
  totalVariation: number;
  totalVariationTailBound: number;
  branch: "low" | "transition" | "high";
}

export function correspondenceState(n: number, bins: number): CorrespondenceState;
