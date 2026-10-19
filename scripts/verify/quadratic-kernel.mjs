import assert from 'node:assert/strict';
import {KERNEL_PRESETS,KERNEL_PATH_WINDOW,kernelState,classicalAction,classicalPath,classicalVelocity,lagrangian} from '../../src/sections/widgets/quadratic-kernel.mjs';
const close=(a,b,tol=2e-7)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
function simpson(f,T,n=400){let s=f(0)+f(T);for(let j=1;j<n;j++)s+=(j%2?4:2)*f(T*j/n);return s*T/(3*n);}
let count=0;
function stateCheck(p){
 const s=kernelState(p);assert.ok(p.T>=.25&&p.T<=1.5);if(p.model==='oscillator')assert.ok(p.omega*p.T<Math.PI);
 Object.values(s).filter(v=>typeof v==='number').forEach(v=>assert.ok(Number.isFinite(v)));
 close(s.re*s.re+s.im*s.im,s.amplitude*s.amplitude,1e-13);
 close(s.path(0),0);close(s.path(1),1);close(s.deformed(0),0);close(s.deformed(1),1);
 assert.equal(s.branch,p.a===0?'classical':'deformed');
 for(let j=0;j<=50;j++){const q=j/50;for(const v of [s.path(q),s.deformed(q)])assert.ok(v>=KERNEL_PATH_WINDOW[0]&&v<=KERNEL_PATH_WINDOW[1]);}
 // Actual SVG maps ±1 to90 units, center(135,125), room>=100.
 assert.ok(s.amplitude<1);assert.ok(135+90*s.re>=35&&135+90*s.re<=235);assert.ok(125-90*s.im>=25&&125-90*s.im<=225);
 if(p.a!==0)assert.ok(s.deltaS>0);
 if(p.model==='free'||p.model==='force')close(s.amplitude,1/Math.sqrt(2*Math.PI*p.T),1e-13);
 count++;
}
for(let j=0;j<=25;j++)for(let ai=0;ai<=20;ai++){
 const common={T:(5+j)/20,a:(ai-10)/20,omega:1,force:0};stateCheck({...common,model:'free'});
 for(let f=-10;f<=10;f++)stateCheck({...common,model:'force',force:f/10});
 for(let w=5;w<=15;w++)stateCheck({...common,model:'oscillator',omega:w/10});
}
for(const p of KERNEL_PRESETS){stateCheck(p);close((p.T-.25)/.05,Math.round((p.T-.25)/.05));}
// Independent numerical differentiation/integration of general endpoint paths.
for(const preset of KERNEL_PRESETS)for(const T of [.25,.7,1.5])for(const a of [-.5,0,.35]){
 const p={...preset,T,a},h=T*1e-4,s=kernelState(p);
 for(const [x,x0] of [[1,0],[-.4,.8],[0,0]]){
  close(classicalPath(p,0,x,x0),x0);close(classicalPath(p,T,x,x0),x);
  for(const q of [.1,.4,.8]){const t=q*T,z=classicalPath(p,t,x,x0),vel=(classicalPath(p,t+h,x,x0)-classicalPath(p,t-h,x,x0))/(2*h),acc=(classicalPath(p,t+h,x,x0)-2*z+classicalPath(p,t-h,x,x0))/(h*h);
   close(vel,classicalVelocity(p,t,x,x0));close(acc,p.model==='force'?p.force:p.model==='oscillator'?-p.omega*p.omega*z:0,2e-6);
  }
  const independentIntegral=simpson(t=>{const z=classicalPath(p,t,x,x0),v=classicalVelocity(p,t,x,x0);return v*v/2+(p.model==='force'?p.force*z:p.model==='oscillator'?-p.omega*p.omega*z*z/2:0);},T);
  close(independentIntegral,classicalAction(p,x,x0),1e-9);
  const d=1e-5;
  close((classicalAction(p,x+d,x0)-classicalAction(p,x-d,x0))/(2*d),classicalVelocity(p,T,x,x0),1e-8);
  close(-(classicalAction(p,x,x0+d)-classicalAction(p,x,x0-d))/(2*d),classicalVelocity(p,0,x,x0),1e-8);
 }
 const actual=simpson(t=>{const x=classicalPath(p,t)+a*Math.sin(Math.PI*t/T),v=classicalVelocity(p,t)+a*Math.PI/T*Math.cos(Math.PI*t/T);return v*v/2+(p.model==='force'?p.force*x:p.model==='oscillator'?-p.omega*p.omega*x*x/2:0);},T);
 close(actual-s.S,s.deltaS,2e-9);
 close(lagrangian(p,.7,.3),.3**2/2+(p.model==='force'?p.force*.7:p.model==='oscillator'?-(p.omega**2)*.7**2/2:0));
}
for(const T of [.25,1,1.5]){
 const base={model:'free',T,a:.3,force:0,omega:1},f=kernelState(base),z=kernelState({...base,model:'force'}),small=kernelState({...base,model:'oscillator',omega:1e-5});
 for(const key of ['S','amplitude','deltaS','re','im']){close(f[key],z[key],1e-13);close(f[key],small[key],1e-9);}
 const plus=kernelState({...base,model:'force',force:1}),minus=kernelState({...base,model:'force',force:-1});close(plus.S-minus.S,T,1e-13);close(plus.amplitude,minus.amplitude,1e-13);
 // Changing displayed deformation never changes the complete analytic kernel.
 const other=kernelState({...base,a:-.5});close(f.re,other.re,1e-13);close(f.im,other.im,1e-13);
}
console.log(`quadratic-kernel: ${count} controlled states; independent action integrals, ODE, endpoint momentum, limits, presets, SVG bounds passed`);

// Kernel PDE independently tests the fluctuation prefactor and phase together.
const complexKernel=(p,x,x0)=>{const A=kernelState(p).amplitude,phase=classicalAction(p,x,x0)-Math.PI/4;return [A*Math.cos(phase),A*Math.sin(phase)];};
for(const preset of KERNEL_PRESETS)for(const T of [.35,.9,1.4])for(const x of [-.3,0,.8]){
 const p={...preset,T},h=2e-5,x0=.2,k=complexKernel(p,x,x0),tp=complexKernel({...p,T:T+h},x,x0),tm=complexKernel({...p,T:T-h},x,x0),xp=complexKernel(p,x+h,x0),xm=complexKernel(p,x-h,x0);
 const dt=tp.map((v,j)=>(v-tm[j])/(2*h)),xx=xp.map((v,j)=>(v-2*k[j]+xm[j])/(h*h)),V=p.model==='force'?-p.force*x:p.model==='oscillator'?p.omega*p.omega*x*x/2:0;
 close(-dt[1],-.5*xx[0]+V*k[0],3e-6);close(dt[0],-.5*xx[1]+V*k[1],3e-6);
 const mixed=(classicalAction(p,x+h,x0+h)-classicalAction(p,x+h,x0-h)-classicalAction(p,x-h,x0+h)+classicalAction(p,x-h,x0-h))/(4*h*h);
 close(kernelState(p).amplitude**2,-mixed/(2*Math.PI),2e-7);
}
console.log('quadratic-kernel: independent complex Schrödinger PDE and mixed endpoint determinant checks passed');
