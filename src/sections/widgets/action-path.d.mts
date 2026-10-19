export type ActionParameters = { system: "free" | "oscillator"; ratio: number; n: number; amplitude: number };
export type ActionBranch = "stationary" | "flat" | "near-flat" | "near-stationary" | "increase" | "decrease";
export const ACTION_PRESETS: (ActionParameters & { id: string; label: string })[];
export function actionState(parameters: ActionParameters): {
  omega: number; duration: number; gap: number; coefficient: number;
  action: number; slope: number; branch: ActionBranch;
};
export function trialPath(t: number, parameters: ActionParameters): number;
export function trialVelocity(t: number, parameters: ActionParameters): number;
export const POLAR_DIFFERENTIAL: { origin: [number, number]; point: [number, number]; radial: [number, number]; tangential: [number, number] };
