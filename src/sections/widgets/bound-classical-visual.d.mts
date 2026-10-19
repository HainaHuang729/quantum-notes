export function boundaryComparison(mode: 'bound' | 'free', k: number, scale: number, x: number): {
 first: (u:number)=>number; second: (u:number)=>number; firstPrime: (u:number)=>number; secondPrime: (u:number)=>number;
 domain:[number,number]; waveNumber:number; firstValue:number; secondValue:number; firstSlope:number; secondSlope:number;
 wronskian:number; branch:'proportional'|'independent';
};
export function gaussianSquareMoment(mu:number, delta:number): {
 variance:number; sigma:number; second:number; density:(x:number)=>number; weighted:(x:number)=>number;
 domain:[number,number]; densityTop:number; weightedTop:number; branch:'centered'|'shifted';
};
export function classicalOscillatorVisual(amplitude:number, omega:number, degrees:number): {
 x:number; velocity:number; energy:number; potential:number; kinetic:number; orbit:[number,number][];
 time:number; period:number; branch:'rest'|'turning'|'center'|'moving';
};
