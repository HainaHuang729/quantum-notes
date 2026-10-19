// Rounded source scale in Gaussian cgs units, not a precision-constant table.
export const MATTER_HBAR=1e-27;
export const MATTER_H=2*Math.PI*MATTER_HBAR;
export const MATTER_SLIT=.01;
export const MATTER_SCREEN=100;
export const MATTER_BIN_COUNT=30;
export function matterWaveState(logMomentum,logResolution){
 const momentum=10**logMomentum,resolution=10**logResolution;
 const wavelength=MATTER_H/momentum,spacing=wavelength*MATTER_SCREEN/MATTER_SLIT;
 const ratio=resolution/spacing,z=Math.PI*ratio;
 const visibility=Math.abs(z)<1e-8?1-z*z/6:Math.sin(z)/z;
 return {momentum,resolution,wavelength,spacing,ratio,visibility,
  branch:ratio<=.25?'resolved':ratio<4?'transition':'averaged'};
}
export function matterBinIntensity(state,index){
 // Center x=index*r; exact top-hat bin average of 1+cos(2πx/spacing).
 return 1+state.visibility*Math.cos(2*Math.PI*index*state.ratio);
}
