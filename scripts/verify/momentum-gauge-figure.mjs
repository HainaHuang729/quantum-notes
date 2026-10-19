import assert from 'node:assert/strict';
import {momentumGauge} from '../../src/sections/widgets/classical-quantum-visual.mjs';

const near = (x, y) => assert.ok(Math.abs(x - y) < 1e-12, `${x} != ${y}`);
for (let i = -8; i <= 8; i++) {
  const g = i / 2, s = momentumGauge(g);
  // Independent Legendre transform, including a fixed electric potential energy.
  const m = 2, v = 2, electric = .7, L = m * v * v / 2 - electric + g * v;
  const p = m * v + g, H = p * v - L;
  near(s.canonical, p); near(s.canonical - g, s.mechanical);
  near(s.velocity, v); near(s.kinetic + electric, H);
  near(s.kinetic, (p - g) ** 2 / (2 * m));
  assert.equal(s.mechanical, 4); assert.equal(s.kinetic, 4);
  // Every endpoint and zero line stays within the fixed, shared momentum axis.
  for (const n of [s.canonical, s.mechanical, s.shift, 0]) {
    const x = 45 + (n + 4) / 12 * 290;
    assert.ok(x >= 45 && x <= 335);
  }
}
for (const preset of [0, 3, -4]) assert.equal(momentumGauge(preset).kinetic, 4);
assert.equal(momentumGauge(3).canonical, 7);
assert.notEqual(7 ** 2 / 4, momentumGauge(3).kinetic);
console.log('momentum-gauge-figure: all 17 slider states, 3 presets, Legendre transform and fixed plot bounds passed.');
