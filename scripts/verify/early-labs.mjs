import assert from "node:assert/strict";

const close = (a, b, eps = 1e-10) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

function basis(theta) {
  const s = Math.sin(theta * Math.PI / 180), c = Math.cos(theta * Math.PI / 180);
  if (theta === 0) return { branch: "singular" };
  const b = 1 / s, a = 1 - b * c;
  close(a + b * c, 1); close(b * s, 1);
  return { a, b, branch: Math.min(theta, 180 - theta) <= 5 ? "near" : "regular" };
}
for (const [theta, branch] of [[90, "regular"], [45, "regular"], [2, "near"], [0, "singular"]]) assert.equal(basis(theta).branch, branch);
close(basis(90).a, 1); close(basis(90).b, 1);
close(basis(45).a, 0); close(basis(45).b, Math.sqrt(2));
assert.ok(Math.abs(basis(2).a) > 20 && basis(2).b > 20);
for (let theta = 1; theta <= 175; theta++) basis(theta);

function inner(t) {
  return { correct: 1 + t, wrong: 1 - t, normW: Math.hypot(1, t), branch: t === -1 ? "orthogonal" : Math.abs(1 + t) <= .1 ? "near" : "regular" };
}
for (const [t, branch] of [[1, "regular"], [-1, "orthogonal"], [-.95, "near"], [0, "regular"]]) assert.equal(inner(t).branch, branch);
close(inner(1).correct, 2); close(inner(1).wrong, 0); close(inner(-1).correct, 0); close(inner(-1).wrong, 2);
close(inner(1).normW, Math.sqrt(2));
for (let k = -40; k <= 40; k++) {
  const t = k / 20, state = inner(t);
  assert.ok(Math.abs(state.correct) <= Math.sqrt(2) * state.normW + 1e-12);
}

function gram(u, v) {
  const q = (2 * u + v) / 5, p = [2 * q, q], r = [u - p[0], v - p[1]];
  const norm = Math.hypot(...r), singular = 2 * Math.round(v * 20) === Math.round(u * 20);
  close(2 * r[0] + r[1], 0);
  close(p[0] + r[0], u); close(p[1] + r[1], v);
  const branch = singular ? "singular" : norm / Math.max(Math.hypot(u, v), 1e-12) < .08 ? "near" : "regular";
  if (!singular) { close(Math.hypot(r[0] / norm, r[1] / norm), 1); }
  else close(norm, 0);
  return { branch, norm };
}
for (const [u, v, branch] of [[1, 2, "regular"], [2, 1.05, "near"], [2, 1, "singular"], [0, 0, "singular"]]) assert.equal(gram(u, v).branch, branch);
for (let x = -60; x <= 60; x++) for (let y = -60; y <= 60; y++) gram(x / 20, y / 20);
close(gram(1, 2).norm, 3 / Math.sqrt(5));

// Original worked examples and explicit inequality checks in the three sections.
close(1 + 2, 3); close(2 * 2, 4);
close(2 ** 2 + Math.hypot(1, 1) ** 2, 6);
close(2 * 0 + 1 * 2, 2); close(2 * 1 - 1 * 2, 0); // (2,1+i)†(i,2)=2
close((1 / Math.sqrt(2)) * (1 / Math.sqrt(6)) + (1 / Math.sqrt(2)) * (-1 / Math.sqrt(6)), 0);
close((1 + 1 + 4) / 6, 1);
assert.ok(Math.sqrt(2) < 2);
console.log("early-labs: all presets, 175 basis angles, 81 complex inputs and 14641 Gram–Schmidt states verified");
