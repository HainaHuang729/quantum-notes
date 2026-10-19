export const SCALE_H:number,SCALE_HBAR:number,SCALE_C:number,SCALE_YEAR:number,SCALE_TARGET:number,SCALE_SPEED_CAP:number;
export const SCALE_PRESETS:{id:string;label:string;logMass:number;logWidth:number}[];
export function scaleMinLogWidth(logMass:number):number;
export function classicalScale(logMass:number,requestedLogWidth:number,time?:number):{mass:number;width:number;logWidth:number;minimum:number;clamped:boolean;time:number;sigmaX:number;sigmaP:number;sigmaV:number;sigmaXT:number;targetTime:number;photonMomentum:number;photonVelocity:number;branch:'already-wide'|'reached'|'not-yet';lengthLogs:number[]};
