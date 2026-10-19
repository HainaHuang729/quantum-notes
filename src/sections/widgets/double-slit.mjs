// Far-field teaching model: identical Gaussian slit envelopes, arbitrary intensity units.
export const SLIT_SIGMA = 2.2;
export const SLIT_PRESETS = [
  { id: "bright", label: "中央相长", u: 0, phasePi: 0, mode: "coherent" },
  { id: "dark", label: "中央相消", u: 0, phasePi: 1, mode: "coherent" },
  { id: "near", label: "接近相消", u: 0, phasePi: .95, mode: "coherent" },
  { id: "next", label: "相邻亮纹", u: 1, phasePi: 0, mode: "coherent" },
  { id: "sum", label: "粒子加和", u: 0, phasePi: 1, mode: "additive" },
];

export function doubleSlitAt(u, phasePi) {
  const envelope = Math.exp(-u * u / (2 * SLIT_SIGMA * SLIT_SIGMA));
  const delta = Math.PI * (2 * u + phasePi);
  const additive = 2 * envelope;
  const coherent = additive * (1 + Math.cos(delta));
  return { envelope, delta, coherent, additive };
}

export function doubleSlitState(parameters) {
  const { u, phasePi, mode } = parameters;
  const values = doubleSlitAt(u, phasePi);
  // Classify exact phase relations from integer slider ticks, never a float cosine.
  const phaseTicks = 2 * Math.round(u * 20) + Math.round(phasePi * 20);
  const wrappedTicks = ((phaseTicks % 40) + 40) % 40;
  const branch = mode === "additive" ? "additive"
    : wrappedTicks === 0 ? "bright"
    : wrappedTicks === 20 ? "dark"
    : Math.abs(wrappedTicks - 20) <= 2 ? "near-dark"
    : Math.min(wrappedTicks, 40 - wrappedTicks) <= 2 ? "near-bright"
    : "intermediate";
  return { ...values, selected: mode === "coherent" ? values.coherent : values.additive, branch };
}
