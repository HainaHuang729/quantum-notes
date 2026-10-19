// Deterministic finite-dimensional examples used by MathVisualGuides.tsx.
export function dualGuide(t, phase) {
  const a = phase * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const ket = [[c, s], [-t * s, t * c]];
  return { ket, bra: ket.map(([x, y]) => [x, -y]), inner: [(1 + t) * c, -(1 + t) * s], norm2: 1 + t * t };
}

export function subspaceGuide(angle, scale, shifted) {
  const a = angle * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]];
  const v = [1.5, 1], coefficient = u[0] * v[0] + u[1] * v[1];
  const projection = u.map(x => x * coefficient);
  const offset = shifted ? n : [0, 0];
  const point = projection.map((x, j) => x + offset[j]);
  return { u, n, v, projection, residual: v.map((x, j) => x - projection[j]), offset, point,
    scaled: point.map(x => scale * x), distance: shifted ? Math.abs(scale - 1) : 0,
    sumDistance: shifted ? 1 : 0 };
}

export function spectralValue(x, kind) {
  return kind === 'square' ? x * x : kind === 'exp' ? Math.exp(x) : x === 0 ? null : 1 / x;
}

export function spectralGuide(first, second, kind) {
  const c = Math.sqrt(3) / 2, s = .5;
  const matrix = (a, b) => [c * c * a + s * s * b, c * s * (a - b), s * s * a + c * c * b];
  const values = [spectralValue(first, kind), spectralValue(second, kind)];
  return { values, matrix: matrix(first, second), mapped: values.some(x => x === null) ? null : matrix(...values) };
}
