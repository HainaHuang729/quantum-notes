import assert from 'node:assert/strict';
import {boundaryPath, boundaryState} from '../../src/sections/widgets/classical-quantum-visual.mjs';

const near = (x, y, tolerance = 1e-8) => assert.ok(Math.abs(x - y) < tolerance, `${x} != ${y}`);
for (let i = -10; i <= 10; i++) {
  const a = i / 10, s = boundaryState(a), n = 1000, h = 1e-4;
  near(boundaryPath(0, a), 0); near(boundaryPath(1, a), 1);
  let integral = 0;
  for (let j = 0; j <= n; j++) {
    const t = j / n, q = boundaryPath(t, a);
    const velocity = (boundaryPath(t + h, a) - boundaryPath(t - h, a)) / (2 * h);
    const acceleration = (boundaryPath(t + h, a) - 2 * q + boundaryPath(t - h, a)) / (h * h);
    near(acceleration, s.acceleration, 1e-6);
    integral += (j === 0 || j === n ? 1 : j % 2 ? 4 : 2) * velocity ** 2 / 2;
    assert.ok(q >= -1e-12 && q <= 1 + 1e-12);
  }
  near(integral / (3 * n), s.action);
  near((boundaryPath(h, a) - boundaryPath(-h, a)) / (2 * h), s.initialVelocity);
  near((boundaryState(a + h).action - boundaryState(a - h).action) / (2 * h), s.actionSlope);
  assert.equal(s.stationary, a === 0);
  if (a !== 0) assert.ok(s.action > .5 && s.acceleration !== 0);
}
for (const a of [0, .8, -.8]) assert.equal(boundaryState(a).stationary, a === 0);
console.log('boundary-local-figure: 21 slider states, 3 presets, 21021 path/ODE points and independent kinetic-action quadrature passed.');
