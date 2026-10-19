import { seededPhotonRandom } from "./photon-counting.mjs";

export const BORN_PRESETS = [
  { label: "同相叠加", r: .5, phiPi: 0, gammaPi: 0, beta: 45 },
  { label: "反相叠加", r: .5, phiPi: 1, gammaPi: 0, beta: 45 },
  { label: "相差 π/2", r: .5, phiPi: .5, gammaPi: 0, beta: 45 },
  { label: "原标记基", r: .5, phiPi: 1, gammaPi: 0, beta: 0 },
  { label: "整体乘 i", r: .5, phiPi: 0, gammaPi: .5, beta: 45 },
];

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const normSquared = state => state.reduce((s, z) => s + z[0] ** 2 + z[1] ** 2, 0);
export function normalizeState(state) {
  const norm = Math.sqrt(normSquared(state));
  if (!(norm > 0)) throw new Error("Zero vector is not a quantum state");
  return state.map(z => [z[0] / norm, z[1] / norm]);
}
export function innerProduct(a, b) {
  return a.reduce((sum, z, i) => add(sum, mul([z[0], -z[1]], b[i])), [0, 0]);
}

export function realBasis(beta) {
  const c = beta === 90 ? 0 : beta === 45 ? Math.SQRT1_2 : Math.cos(beta * Math.PI / 180);
  const s = beta === 0 ? 0 : beta === 45 ? Math.SQRT1_2 : Math.sin(beta * Math.PI / 180);
  return [[[c, 0], [s, 0]], [[-s, 0], [c, 0]]];
}

export function bornBasisState(p) {
  const polar = (r, angle) => [r * Math.cos(angle), r * Math.sin(angle)];
  const state = [polar(Math.sqrt(p.r), p.gammaPi * Math.PI), polar(Math.sqrt(1 - p.r), (p.gammaPi + p.phiPi) * Math.PI)];
  const basis = realBasis(p.beta), amplitudes = basis.map(v => innerProduct(v, state));
  const weights = amplitudes.map(z => z[0] ** 2 + z[1] ** 2), total = weights[0] + weights[1];
  const probabilities = weights.map(w => w / total);
  const c = basis[0][0][0], s = basis[0][1][0];
  const mixturePlus = p.r * c * c + (1 - p.r) * s * s;
  const mixture = [mixturePlus, 1 - mixturePlus];
  // Exact reachable slider pairs; do not infer mathematical equality from a floating tolerance.
  const alignedWeights = { 30: .75, 45: .5, 60: .25 };
  const aligned = alignedWeights[p.beta];
  const branch = p.r === 0 || p.r === 1 ? "basis-state"
    : p.beta === 0 || p.beta === 90 ? "original-basis"
    : aligned !== undefined && p.r === aligned && p.phiPi === 0 ? "certain-plus"
    : aligned !== undefined && p.r === 1 - aligned && Math.abs(p.phiPi) === 1 ? "certain-minus"
    : probabilities.some(v => v < .02 || v > .98) ? "near-certain" : "interference";
  return { state, basis, amplitudes, probabilities, mixture, branch };
}

export function preparedState(dimension) {
  return dimension === 2 ? [[1 / Math.sqrt(3), 0], [Math.sqrt(2 / 3), 0]]
    : [[.5, 0], [.5, 0], [Math.SQRT1_2, 0]];
}

export function measurementObservable(dimension, which) {
  if (dimension === 2) {
    const basis = realBasis(which === "A" ? 0 : 45);
    return basis.map((v, i) => ({ label: `${which}=${i ? "−1" : "+1"}`, value: i ? -1 : 1, vectors: [v] }));
  }
  const e0 = [[1, 0], [0, 0], [0, 0]], e1 = [[0, 0], [1, 0], [0, 0]], e2 = [[0, 0], [0, 0], [1, 0]];
  if (which === "A") return [{ label: "D=0（二维）", value: 0, vectors: [e0, e1] }, { label: "D=1", value: 1, vectors: [e2] }];
  const b = realBasis(45).map(v => [...v, [0, 0]]);
  return [{ label: "B=+1", value: 1, vectors: [b[0]] }, { label: "B=−1", value: -1, vectors: [b[1]] }, { label: "B=2", value: 2, vectors: [e2] }];
}

export function projectState(state, vectors) {
  const projected = state.map(() => [0, 0]);
  for (const v of vectors) {
    const amplitude = innerProduct(v, state);
    for (let i = 0; i < state.length; i++) projected[i] = add(projected[i], mul(v[i], amplitude));
  }
  return projected;
}

export function measurementDistribution(state, observable) {
  const weights = observable.map(o => normSquared(projectState(state, o.vectors)));
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / total);
}

export function projectiveMeasurement(state, observable, randomValue) {
  const probabilities = measurementDistribution(state, observable);
  let index = probabilities.length - 1, cumulative = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (randomValue < cumulative) { index = i; break; }
  }
  const outcome = observable[index];
  // A rank-one output may choose the eigenket's global phase freely.
  const after = outcome.vectors.length === 1 ? normalizeState(outcome.vectors[0]) : normalizeState(projectState(state, outcome.vectors));
  return { index, outcome, probability: probabilities[index], probabilities, after };
}

export function measurementSequence(initial, observable, count, seed, reprepare) {
  const random = seededPhotonRandom(seed), counts = observable.map(() => 0), events = [];
  let state = initial;
  for (let i = 0; i < count; i++) {
    const result = projectiveMeasurement(reprepare ? initial : state, observable, random());
    counts[result.index]++; events.push(result.index); state = result.after;
  }
  return { counts, events, finalState: state };
}

export function measurementDraw(seed, offset) {
  const random = seededPhotonRandom(seed);
  for (let i = 0; i < offset; i++) random();
  return random();
}
