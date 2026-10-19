import assert from 'node:assert/strict';
import {WAVE_COMPARISON as w, classicalWave, STATE_PROBABILITY as s} from '../../src/sections/widgets/classical-quantum-visual.mjs';

const near = (x, y, tolerance = 1e-10) => assert.ok(Math.abs(x - y) < tolerance, `${x} != ${y}`);
near(w.wavelength / w.period, 4); near(w.times[1], w.period / 4);
near(w.particleVelocity * w.times[1], .5);
for (let i = 0; i <= 800; i++) {
  const x = i / 200;
  for (const t of w.times) {
    const expected = Math.cos(2 * Math.PI * (x / w.wavelength - t / w.period));
    near(classicalWave(x, t), expected);
    near(classicalWave(x, t), classicalWave(x + w.wavelength, t));
    near(classicalWave(x, t), classicalWave(x, t + w.period));
    assert.ok(Math.abs(classicalWave(x, t)) <= 1);
  }
  near(classicalWave(x, w.times[1]), classicalWave(x - .5, 0));
}
near(s.amplitudes.reduce((sum, a) => sum + a * a, 0), 1);
near(s.probabilities.reduce((sum, p) => sum + p, 0), 1);
s.probabilities.forEach((p, i) => { near(p, s.amplitudes[i] ** 2); assert.ok(p >= 0 && p <= 1); });
assert.equal(s.probabilities[0], 1 / 5); assert.equal(s.probabilities[1], 4 / 5);
console.log('classical-state-figures: 1602 wave samples, spatial/time periodicity and translation, two-state normalization/Born probabilities passed.');
