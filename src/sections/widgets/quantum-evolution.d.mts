export type Complex=[number,number];
export function C(r:number,i?:number):Complex;
export function add(a:Complex,b:Complex):Complex;
export function mul(a:Complex,b:Complex):Complex;
export function abs2(a:Complex):number;
export function energyEvolution(gap:number,weight:number,phaseDegrees:number,timeStep:number):{t:number;phase:number;state:Complex[];energy:number[];other:number[];norm:number};
export function pulse(state:Complex[],axis:string,angle:number):Complex[];
export function pulseEvolution(aStep:number,bStep:number,order?:string,stage?:number):{state:Complex[];probabilities:number[];norm:number;a:number;b:number;total:number;sameReadout:boolean};
