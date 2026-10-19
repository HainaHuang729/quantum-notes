/** Pure model shared by ActionPathLab and scripts/verify/action-path.mjs.
 * Units: m=1, oscillator omega=1, duration=ratio*pi. Endpoints are both zero.
 * Every curve is a*sin(n*pi*t/duration); no claim of a general path solver.
 */
export const ACTION_PRESETS = [
  { id: "free", label: "自由粒子：作用量增大", system: "free", ratio: 1.25, n: 1, amplitude: .6 },
  { id: "down", label: "谐振子：降低作用量", system: "oscillator", ratio: 1.25, n: 1, amplitude: .6 },
  { id: "up", label: "同样时长：提高作用量", system: "oscillator", ratio: 1.25, n: 2, amplitude: .6 },
  { id: "flat", label: "精确 T = π：整族驻定", system: "oscillator", ratio: 1, n: 1, amplitude: .6 },
  { id: "near", label: "接近临界时长", system: "oscillator", ratio: 1.01, n: 1, amplitude: .6 },
  { id: "zero", label: "回到静止经典路径", system: "oscillator", ratio: 1.25, n: 1, amplitude: 0 },
];

export function actionState(parameters) {
  const { system, ratio, n, amplitude } = parameters;
  const omega = system === "free" ? 0 : 1;
  const duration = ratio * Math.PI;
  const gap = n * n - omega * omega * ratio * ratio;
  const coefficient = Math.PI * gap / (4 * ratio);
  const action = coefficient * amplitude * amplitude;
  const slope = 2 * coefficient * amplitude;
  const branch = amplitude === 0 ? "stationary"
    : system === "oscillator" && ratio === n ? "flat"
    : Math.abs(gap) < .06 ? "near-flat"
    : Math.abs(amplitude) < .05 ? "near-stationary"
    : coefficient > 0 ? "increase" : "decrease";
  return { omega, duration, gap, coefficient, action, slope, branch };
}

export function trialPath(t, parameters) {
  const duration = parameters.ratio * Math.PI;
  return parameters.amplitude * Math.sin(parameters.n * Math.PI * t / duration);
}

export function trialVelocity(t, parameters) {
  const duration = parameters.ratio * Math.PI;
  const k = parameters.n * Math.PI / duration;
  return parameters.amplitude * k * Math.cos(k * t);
}

export const POLAR_DIFFERENTIAL = {
  origin: [70, 240], point: [230, 144], radial: [40, -24], tangential: [24, 40],
};
