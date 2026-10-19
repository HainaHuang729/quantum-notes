import assert from 'node:assert/strict';
import {slicingState,discreteAction,SLICE_PRESETS,SLICE_PATH_T,SLICE_PATH_Y} from '../../src/sections/widgets/time-slicing.mjs';
const near=(a,b,t=2e-10)=>assert.ok(Math.abs(a-b)<t*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
// Direct determinant by permutation expansion, independent of positive-pivot recursion.
function permutationDet(a){
 const n=a.length,used=new Array(n).fill(false);let total=0;
 function visit(row,cols,product){
  if(row===n){let inversions=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(cols[i]>cols[j])inversions++;total+=(inversions%2?-1:1)*product;return;}
  for(let col=0;col<n;col++)if(!used[col]&&a[row][col]!==0){used[col]=true;visit(row+1,[...cols,col],product*a[row][col]);used[col]=false;}
 }
 visit(0,[],1);return total;
}
let count=0;
for(let N=2;N<=12;N++)for(let ti=5;ti<=20;ti++){
 const T=ti/10,eps=T/N,M=N-1,base=slicingState(N,T);
 near(base.logDet,Math.log(N)-(N-1)*Math.log(eps));
 // Eigenvalues of the Dirichlet second-difference matrix give an independent determinant.
 const eigenDet=Array.from({length:M},(_,j)=>(2-2*Math.cos(Math.PI*(j+1)/N))/eps).reduce((a,b)=>a*b,1);
 near(base.determinant,eigenDet);if(M<=6)near(base.determinant,permutationDet(base.hessian));
 for(let j=1;j<=M;j++){assert.ok(base.pivots[j-1]>0);near(base.pivots[j-1],(j+1)/(j*eps));}
 // Check actual Schur elimination of the full Hessian (including all zeros),
 // rather than restating the closed scalar recursion.
 const reduced=base.hessian.map(r=>[...r]);
 for(let j=0;j<M;j++){
  near(reduced[j][j],base.pivots[j]);
  for(let r=j+1;r<M;r++)for(let c=j+1;c<M;c++)reduced[r][c]-=reduced[r][j]*reduced[j][c]/reduced[j][j];
 }
 // Free-kernel normalization and phase from known one-step expression.
 const mag=1/Math.sqrt(2*Math.PI*T),phase=1/(2*T)-Math.PI/4;
 near(base.kernel[0],mag*Math.cos(phase));near(base.kernel[1],mag*Math.sin(phase));
 near(base.measureLog+base.fluctuationLog,-.5*Math.log(2*Math.PI*T));
 near(base.measurePhase+base.fluctuationPhase,-Math.PI/4);
 for(let k=1;k<N;k++)for(let di=-10;di<=10;di++){
  const d=di/10,s=slicingState(N,T,k,d);
  near(s.action,1/(2*T)+d*d/eps);near(s.deltaAction,d*d/eps);
  assert.equal(s.branch,di===0?'classical':'offset');
  near(s.kernel[0],base.kernel[0]);near(s.kernel[1],base.kernel[1]);
  near(s.positions[0],0);near(s.positions[N],1);near(s.times[0],0);near(s.times[N],T);
  for(let j=0;j<=N;j++){assert.ok(s.positions[j]>=SLICE_PATH_Y[0]&&s.positions[j]<=SLICE_PATH_Y[1]);assert.ok(s.times[j]>=SLICE_PATH_T[0]&&s.times[j]<=SLICE_PATH_T[1]);}
  const h=1e-5,left=[...s.positions],right=[...s.positions];left[k]-=h;right[k]+=h;
  near((discreteAction(right,eps)-discreteAction(left,eps))/(2*h),2*d/eps,2e-8);
  for(const number of [...s.kernel,...s.pivots,s.action,s.deltaAction,s.logDet,s.determinant,s.magnitude,...s.localPhases])assert.ok(Number.isFinite(number));
  near(Math.hypot(...s.kernel),s.magnitude);count++;
 }
 // Several nonzero fluctuations simultaneously: S-Scl = ξᵀHξ/2.
 const xi=Array.from({length:M},(_,j)=>.15*Math.sin(j+1)),path=[0,...xi.map((x,j)=>x+(j+1)/N),1];
 let quadratic=0;for(let j=0;j<M;j++)for(let l=0;l<M;l++)quadratic+=xi[j]*base.hessian[j][l]*xi[l]/2;
 near(discreteAction(path,eps)-base.classicalAction,quadratic);
 for(let j=1;j<N;j++)near(((j/N)-(j-1)/N)-((j+1)/N-j/N),0); // stationary discrete gradient
 assert.equal(slicingState(N,T,999).k,N-1);assert.equal(slicingState(N,T,-99).k,1);
}
for(const p of SLICE_PRESETS){assert.ok(Number.isInteger(p.N)&&p.N>=2&&p.N<=12);assert.ok(p.k>=1&&p.k<p.N);near(p.T*10,Math.round(p.T*10));near(p.d*10,Math.round(p.d*10));const s=slicingState(p.N,p.T,p.k,p.d);assert.equal(s.branch,p.d===0?'classical':'offset');}
// Unequal two-slice composition: Gaussian coefficient 1/t1+1/t2 and
// completed-square action reproduce the same normalization and endpoint action.
for(const [t1,t2] of [[.2,.3],[.3,.7],[1.2,.8]]){const h=1/t1+1/t2;near(1/(Math.sqrt(2*Math.PI*t1)*Math.sqrt(2*Math.PI*t2))*Math.sqrt(2*Math.PI/h),1/Math.sqrt(2*Math.PI*(t1+t2)));const middle=t1/(t1+t2);near(middle**2/(2*t1)+(1-middle)**2/(2*t2),1/(2*(t1+t2)));}
console.log(`TimeSlicingLab: ${count} control states; independent determinant expansion/eigenvalues/Schur elimination, action stationarity, kernel normalization/composition, presets and plot bounds passed.`);
// Independent real-axis quadrature of a genuinely damped complex Gaussian.
// Checks the +π/4 branch; a finite-window undamped integral is never claimed
// to be the full path integral. Damping supplies a rigorous absolute tail bound.
function dampedIntegral(c,eta,n){
 const R=8/Math.sqrt(eta),h=2*R/n;let re=0,im=0;
 for(let j=0;j<=n;j++){
  const x=-R+j*h,w=j===0||j===n?1:j%2?4:2,envelope=Math.exp(-eta*x*x),phase=c*x*x;
  re+=w*envelope*Math.cos(phase);im+=w*envelope*Math.sin(phase);
 }
 assert.ok(Math.exp(-eta*R*R)/(eta*R)<1e-25);
 return [re*h/3,im*h/3];
}
for(const c of [.5,1.5,3])for(const eta of [.2,.1,.05]){
 const z=dampedIntegral(c,eta,32768),fine=dampedIntegral(c,eta,65536);
 const magnitude=Math.sqrt(Math.PI)/((eta*eta+c*c)**.25),phase=Math.atan2(c,eta)/2;
 for(let j=0;j<2;j++){near(z[j],fine[j],2e-10);near(fine[j],magnitude*(j===0?Math.cos(phase):Math.sin(phase)),2e-10);}
 assert.ok(fine[0]>0&&fine[1]>0);
}
// Controlled damping limit approaches e^(iπ/4)*sqrt(π/c).
for(const c of [.5,1.5,3]){
 const limit=Math.sqrt(Math.PI/(2*c));let previous=Infinity;
 for(const eta of [.2,.1,.05]){
  const z=dampedIntegral(c,eta,65536),error=Math.hypot(z[0]-limit,z[1]-limit);
  assert.ok(error<previous);previous=error;
 }
}
console.log('TimeSlicingLab: 9 independent damped Gaussian quadratures, doubled resolution, absolute tail bounds and decreasing-damping Fresnel phase limit passed.');
