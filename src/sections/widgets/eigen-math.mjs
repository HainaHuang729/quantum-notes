export function eigenState(angle, gap) {
  const phi = Math.PI / 6, theta = angle * Math.PI / 180;
  const c = Math.cos(phi), s = Math.sin(phi);
  const a = 1 + gap * s * s, b = -gap * c * s, d = 1 + gap * c * c;
  const v = [Math.cos(theta), Math.sin(theta)];
  const av = [a * v[0] + b * v[1], b * v[0] + d * v[1]];
  return { v, av, matrix: [a,b,d], residual: Math.abs(v[0]*av[1]-v[1]*av[0]),
    branch: gap === 0 ? 'exact' : gap < .05 ? 'near' : 'regular',
    isEigen: gap === 0 || (angle - 30) % 90 === 0 };
}
export const modePresets = [[1,1], [1,-1], [1,0]];
export function modeState(preset, time) {
  const [a,b] = modePresets[preset];
  const initialI = (a+b)/Math.SQRT2, initialII = (a-b)/Math.SQRT2;
  const qI = initialI*Math.cos(time), qII=initialII*Math.cos(Math.sqrt(3)*time);
  return { initialI, initialII, qI,qII,x1:(qI+qII)/Math.SQRT2,x2:(qI-qII)/Math.SQRT2 };
}
