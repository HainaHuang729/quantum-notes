export type SlitParameters = { u: number; phasePi: number; mode: "coherent" | "additive" };
export type SlitBranch = "additive" | "bright" | "dark" | "near-dark" | "near-bright" | "intermediate";
export const SLIT_SIGMA: number;
export const SLIT_PRESETS: (SlitParameters & { id: string; label: string })[];
export function doubleSlitAt(u: number, phasePi: number): { envelope: number; delta: number; coherent: number; additive: number };
export function doubleSlitState(parameters: SlitParameters): { envelope: number; delta: number; coherent: number; additive: number; selected: number; branch: SlitBranch };
