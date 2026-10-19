export function scalingState(a, freeB, constrained) {
  const b = constrained ? 1/a : freeB;
  const bracket=a*b;
  return {a,b,bracket,area:bracket,branch:constrained||freeB===1/a?'canonical':Math.abs(bracket-1)<.06?'near':'noncanonical'};
}
export function oscillatorSymmetry(alpha,t,angle=45) {
  const w=Math.sqrt(1+alpha),x=Math.cos(t),px=-Math.sin(t),y=Math.sin(w*t)/w,py=Math.cos(w*t);
  const theta=angle*Math.PI/180,c=Math.cos(theta),s=Math.sin(theta);
  const rx=c*x-s*y,ry=s*x+c*y,rpx=c*px-s*py,rpy=s*px+c*py;
  const energy=(px*px+py*py+x*x+(1+alpha)*y*y)/2;
  const rotatedEnergy=(rpx*rpx+rpy*rpy+rx*rx+(1+alpha)*ry*ry)/2;
  return {x,y,px,py,w,lz:x*py-y*px,torque:-alpha*x*y,energy,rotatedEnergy,deltaEnergy:rotatedEnergy-energy,
    branch:alpha===0?'symmetric':alpha<.05?'near':'broken'};
}
export function endpointState(T) {
  return {T,velocity:1/T,action:1/(2*T),energy:1/(2*T*T),dSdT:-1/(2*T*T),lagrangian:1/(2*T*T),boundary:-1/(T*T)};
}
