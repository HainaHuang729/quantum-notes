export const MATTER_HBAR:number;
export const MATTER_H:number;
export const MATTER_SLIT:number;
export const MATTER_SCREEN:number;
export const MATTER_BIN_COUNT:number;
export interface MatterWaveState {momentum:number;resolution:number;wavelength:number;spacing:number;ratio:number;visibility:number;branch:string}
export function matterWaveState(logMomentum:number,logResolution:number):MatterWaveState;
export function matterBinIntensity(state:MatterWaveState,index:number):number;
