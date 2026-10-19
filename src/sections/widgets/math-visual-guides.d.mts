type Pair = [number, number];
export function dualGuide(t: number, phase: number): {ket: Pair[]; bra: Pair[]; inner: Pair; norm2: number};
export function subspaceGuide(angle: number, scale: number, shifted: boolean): {u: Pair; n: Pair; v: Pair; projection: Pair; residual: Pair; offset: Pair; point: Pair; scaled: Pair; distance: number; sumDistance: number};
export type SpectralKind = 'square' | 'exp' | 'inverse';
export function spectralValue(x: number, kind: SpectralKind): number | null;
export function spectralGuide(first: number, second: number, kind: SpectralKind): {values: (number | null)[]; matrix: number[]; mapped: number[] | null};
