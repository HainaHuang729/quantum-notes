import assert from 'node:assert/strict';
import {endpointState} from '../../src/sections/widgets/canonical-symmetry-math.mjs';
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol);
for(let k=20;k<=100;k++){
 const T=k/50,s=endpointState(T),h=1e-5;
 close(s.dSdT,-s.energy);close(s.lagrangian+s.boundary,s.dSdT);
 close((endpointState(T+h).action-endpointState(T-h).action)/(2*h),s.dSdT);
 close(s.velocity*T,1);close(s.action,s.lagrangian*T);
}
for(const T of[.5,1,2]){const s=endpointState(T);assert.ok(s.action>0&&s.dSdT<0)}
close(endpointState(1).action,.5);close(endpointState(1).energy,.5);
console.log('endpoint-action: all travel times, fixed endpoint, boundary derivative and presets pass');
