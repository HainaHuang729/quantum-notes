export const THERMAL_TAU_MAX: number;
export const THERMAL_TAU_STEP: number;
export const THERMAL_GROUND_E: number;
export const THERMAL_EINSTEIN_FACTOR: number;
export const THERMAL_PRESETS: { id: string; label: string; tau: number }[];
export type ThermalState = {
  tau: number;
  x: number;
  E: number;
  C: number;
  meanN: number;
  p0: number;
  classicalE: number;
  classicalC: number;
  einsteinC: number;
  branch: "ground" | "thermal";
};
export function thermalState(tau: number): ThermalState;
export function thermalLevels(tau: number, nMax?: number): {
  p: number[];
  energies: number[];
  sum: number;
};
