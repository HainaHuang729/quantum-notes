export function stringValue(x:number,t:number,coefficients:readonly number[]):number;
export function stringEnergyNorm(t:number,a:readonly number[]):number;
export function gaussian(x:number,center:number,width:number):number;
export function testFunction(x:number):number;
export function gaussianMean(center:number,width:number):number;
export function integrate(f:(x:number)=>number,lo:number,hi:number,n?:number):number;
export function projectPoint(v:readonly number[],p:{origin:number[],scale:number,azimuth:number,elevation:number}):[number,number];
export function stringStateClass(a:number[]): 'zero'|'near'|'regular';
