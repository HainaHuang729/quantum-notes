export function eigenState(angle: number, gap: number): { v: number[]; av: number[]; matrix: number[]; residual: number; branch: string; isEigen: boolean };
export const modePresets: number[][];
export function modeState(preset: number, time: number): { initialI: number; initialII: number; qI: number; qII: number; x1: number; x2: number };
