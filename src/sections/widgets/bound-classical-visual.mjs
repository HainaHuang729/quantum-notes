// Exact teaching examples. Coordinates and wave amplitudes below are dimensionless.
export function boundaryComparison(mode, k, scale, x) {
  const bound = mode === 'bound';
  const waveNumber = bound ? Math.PI : k;
  const first = u => Math.cos(waveNumber * u);
  const firstPrime = u => -waveNumber * Math.sin(waveNumber * u);
  const second = bound ? u => scale * first(u) : u => Math.sin(k * u);
  const secondPrime = bound ? u => scale * firstPrime(u) : u => k * Math.cos(k * u);
  const domain = bound ? [-.5, .5] : [-2, 2];
  return { first, second, firstPrime, secondPrime, domain, waveNumber,
    firstValue: first(x), secondValue: second(x), firstSlope: firstPrime(x), secondSlope: secondPrime(x),
    wronskian: bound ? 0 : k, branch: bound ? 'proportional' : 'independent' };
}

export function gaussianSquareMoment(mu, delta) {
  const variance = delta * delta / 2, sigma = Math.sqrt(variance);
  const density = x => Math.exp(-(((x - mu) / delta) ** 2)) / (Math.sqrt(Math.PI) * delta);
  const weighted = x => (x - mu) ** 2 * density(x);
  return { variance, sigma, second: mu * mu + variance, density, weighted,
    domain: [-8, 8], densityTop: 1.5, weightedTop: .45,
    branch: mu === 0 ? 'centered' : 'shifted' };
}

export function classicalOscillatorVisual(amplitude, omega, degrees) {
  const phase = degrees * Math.PI / 180;
  const x = amplitude * Math.cos(phase), velocity = -amplitude * omega * Math.sin(phase);
  const energy = omega * omega * amplitude * amplitude / 2;
  const potential = omega * omega * x * x / 2, kinetic = velocity * velocity / 2;
  const orbit = Array.from({ length: 121 }, (_, i) => {
    const angle = 2 * Math.PI * i / 120;
    return [amplitude * Math.cos(angle), -amplitude * omega * Math.sin(angle)];
  });
  return { x, velocity, energy, potential, kinetic, orbit, time: phase / omega, period: 2 * Math.PI / omega,
    branch: amplitude === 0 ? 'rest' : degrees % 180 === 0 ? 'turning' : degrees % 90 === 0 ? 'center' : 'moving' };
}
