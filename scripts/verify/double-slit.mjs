import assert from "node:assert/strict";
import { SLIT_SIGMA, SLIT_PRESETS, doubleSlitAt, doubleSlitState } from "../../src/sections/widgets/double-slit.mjs";

const close = (a, b, tolerance = 1e-11) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
assert.equal(SLIT_SIGMA, 2.2);
const expected = { bright: "bright", dark: "dark", near: "near-dark", next: "bright", sum: "additive" };
for (const p of SLIT_PRESETS) assert.equal(doubleSlitState(p).branch, expected[p.id]);
close(doubleSlitState(SLIT_PRESETS[0]).selected, 4);
close(doubleSlitState(SLIT_PRESETS[1]).selected, 0);
close(doubleSlitState(SLIT_PRESETS[4]).selected, 2);
assert.equal(doubleSlitState({ u: 0, phasePi: .05, mode: "coherent" }).branch, "near-bright");
assert.equal(doubleSlitState({ u: 0, phasePi: .5, mode: "coherent" }).branch, "intermediate");

let states = 0;
for (let ui = -70; ui <= 70; ui++) for (let pi = -40; pi <= 40; pi++) {
  const u = ui / 20, phasePi = pi / 20, values = doubleSlitAt(u, phasePi);
  // Apparatus SVG uses this exact screen-position map. Every control point,
  // endpoint and its moving u/d1/d2 labels stay within the schematic viewBox.
  const detectorY = 144 - 24 * u;
  assert.ok(detectorY >= 60 && detectorY <= 228);
  assert.ok(detectorY + 4 < 295);
  assert.ok((108 + detectorY) / 2 - 8 > 30);
  assert.ok((180 + detectorY) / 2 + 17 < 245);
  const phase = 2 * Math.PI * u + phasePi * Math.PI;
  // Independent complex field addition, not the cosine-cross-term formula.
  const amplitude = Math.exp(-u * u / (4 * SLIT_SIGMA ** 2));
  const real = amplitude + amplitude * Math.cos(phase);
  const imaginary = amplitude * Math.sin(phase);
  close(values.coherent, real * real + imaginary * imaginary);
  close(values.additive, 2 * amplitude * amplitude);
  assert.ok(values.coherent >= 0 && values.coherent <= 4 * values.envelope + 1e-12);
  close(doubleSlitAt(u, phasePi + 2).coherent, values.coherent);
  close(doubleSlitAt(-u, -phasePi).coherent, values.coherent);
  for (const mode of ["coherent", "additive"]) {
    const state = doubleSlitState({ u, phasePi, mode });
    if (mode === "additive") { close(state.selected, values.additive); assert.equal(state.branch, "additive"); }
    if (state.branch === "dark") close(state.selected, 0);
    if (state.branch === "bright") close(state.selected, 4 * values.envelope);
    if (state.branch === "near-dark") assert.ok(state.selected > 0 && state.selected < state.additive);
    if (state.branch === "near-bright") assert.ok(state.selected < 4 * values.envelope && state.selected > state.additive);
    assert.ok(state.selected >= 0 && state.selected <= 4 + 1e-12);
    states++;
  }
}

// Continuous plot sampling is checked separately from the discrete control grid.
for (let j = 0; j < 1000; j++) {
  const u = -3.5 + 7 * j / 999, phasePi = .37;
  const s = doubleSlitAt(u, phasePi);
  close(s.coherent / s.envelope, 2 + 2 * Math.cos(s.delta));
}

// Fringe peaks move by half a fringe for an added phase pi; spacing stays one.
for (const phasePi of [-1, -.4, 0, .7, 1]) for (let n = -2; n <= 2; n++) {
  const peak = n - phasePi / 2;
  close(doubleSlitAt(peak, phasePi).coherent / doubleSlitAt(peak, phasePi).envelope, 4);
  const dark = peak + .5;
  close(doubleSlitAt(dark, phasePi).coherent, 0);
}

// Original worked numerical examples in S31 and S32.
close(2 / .5, 4); close((2 * Math.PI / .5) / (2 * Math.PI / 2), 4);
close(3 ** 2, 9);
close(.5e-6 * 1 / .25e-3, .002);
// A real sinusoidal field and its complex representation have different
// instantaneous squares, but their time-averaged energies are proportional.
for(const amplitude of [.5,1,3]){
 let mean=0;const samples=4000;
 for(let j=0;j<samples;j++)mean+=(amplitude*Math.cos(2*Math.PI*(j+.5)/samples))**2/samples;
 close(mean,amplitude**2/2);
}
console.log(`double-slit: five presets, all six verdict classes, ${states} slider states, independent complex addition and fringe geometry pass`);
