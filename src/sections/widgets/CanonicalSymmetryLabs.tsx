/** Shared analytic models verified by scripts/verify/canonical-scale.mjs,
 * scripts/verify/rotation-symmetry.mjs, scripts/verify/endpoint-action.mjs.
 * Controls only, no autoplay or unseeded randomness. */
import {useState} from "react";
import {Task,Slider,Plot,Verdict,FMM_COLORS,W_BUTTON,fmtEn} from "../../lib";
import {scalingState,oscillatorSymmetry,endpointState} from "./canonical-symmetry-math.mjs";

const labels={neutral:"观察",ok:"符合条件",warn:"接近但不相等",fail:"条件不成立"};
const f=(x:number)=>fmtEn(Math.abs(x)<1e-12?0:x,4);

export function CanonicalScaleLab(){
  const[a,setA]=useState(1.5),[b,setB]=useState(1),[constrained,setConstrained]=useState(true);
  const s=scalingState(a,b,constrained);
  return <div>
    <Task>放大位置坐标，比较自动补偿动量与任意缩放动量时的基本泊松括号。</Task>
    <label className="block my-3"><input type="checkbox" checked={constrained} onChange={e=>setConstrained(e.target.checked)}/> 保持正则约束 b = 1/a</label>
    <Slider label="位置缩放 a" min={.5} max={2} step={.05} value={a} onChange={setA} fmt={v=>fmtEn(v,2)}/>
    <Slider label="动量缩放 b" min={.5} max={2} step={.05} value={s.b} onChange={setB} disabled={constrained} fmt={v=>fmtEn(v,3)}/>
    <div className="flex flex-wrap gap-2 my-2">
      <button className={W_BUTTON} onClick={()=>{setA(2);setConstrained(true)}}>正则：a=2，b=1/2</button>
      <button className={W_BUTTON} onClick={()=>{setA(1);setB(1.05);setConstrained(false)}}>接近：a=1，b=1.05</button>
      <button className={W_BUTTON} onClick={()=>{setA(2);setB(2);setConstrained(false)}}>任意：a=b=2</button>
    </div>
    <Plot series={[]} xDomain={[-.3,2.4]} yDomain={[-.3,2.4]} width={450} height={310} xLabel="q 或 Q（无量纲）" yLabel="p 或 P" ariaLabel="原单位正方形与缩放后的相空间矩形" polylines={[
      {pts:[[0,0],[1,0],[1,1],[0,1],[0,0]],color:FMM_COLORS.blau,label:"原单位方形",dash:[5,4]},
      {pts:[[0,0],[s.a,0],[s.a,s.b],[0,s.b],[0,0]],color:FMM_COLORS.orange,label:"变换后矩形"}
    ]}/>
    <p className="text-sm">Q = {f(s.a)} q，P = {f(s.b)} p；新矩形面积 = {f(s.area)}；基本括号 ⦃Q,P⦄ = {f(s.bracket)}。</p>
    <Verdict labels={labels} kind={s.branch==='canonical'?'ok':s.branch==='near'?'warn':'fail'}>
      {s.branch==='canonical'?'ab 恰为一，这个变换正则。':s.branch==='near'?'ab 接近一但不等于一，这个变换仍不是正则变换。':'变换可逆，但 ab 不为一，基本泊松括号被改变。'}
    </Verdict>
  </div>;
}

export function RotationSymmetryLab(){
  const[alpha,setAlpha]=useState(0),[time,setTime]=useState(1),[angle,setAngle]=useState(45);
  const s=oscillatorSymmetry(alpha,time,angle);
  const orbit:[number,number][]=Array.from({length:301},(_,i)=>{const v=oscillatorSymmetry(alpha,10*i/300,angle);return[v.x,v.y]});
  return <div>
    <Task>先观察圆对称系统，再增加各向异性，比较角动量与旋转后的能量。</Task>
    <Slider label="各向异性 α" min={0} max={2} step={.02} value={alpha} onChange={setAlpha} fmt={v=>fmtEn(v,2)}/>
    <Slider label="时间 t" min={0} max={10} step={.02} value={time} onChange={setTime} fmt={v=>fmtEn(v,2)}/>
    <Slider label="试转角 θ" min={0} max={180} step={1} value={angle} onChange={setAngle} unit="°" fmt={v=>fmtEn(v,0)}/>
    <div className="flex flex-wrap gap-2 my-2">{[["圆对称",0],["微小各向异性",.02],["明显各向异性",1]].map(([name,value])=><button key={name} className={W_BUTTON} onClick={()=>setAlpha(Number(value))}>{name}</button>)}</div>
    <div className="grid gap-3 sm:grid-cols-2">
      <Plot series={[]} xDomain={[-1.3,1.3]} yDomain={[-1.3,1.3]} width={390} height={310} xLabel="位置 x" yLabel="位置 y" ariaLabel="平面振子轨道与当前粒子位置" polylines={[{pts:orbit,color:FMM_COLORS.blau,label:"位置轨道"}]} markers={[{x:s.x,y:s.y,color:FMM_COLORS.rot,label:"当前状态"}]}/>
      <Plot series={[{f:t=>oscillatorSymmetry(alpha,t).lz,color:FMM_COLORS.gruen,label:"角动量 lz"}]} xDomain={[0,10]} yDomain={[-1.6,1.6]} width={390} height={310} xLabel="时间 t" yLabel="角动量 lz" ariaLabel="角动量随时间的解析曲线" markers={[{x:time,y:s.lz,color:FMM_COLORS.rot,label:"当前值"}]}/>
    </div>
    <p className="text-sm">(x,y) = ({f(s.x)}, {f(s.y)})；(pₓ,pᵧ) = ({f(s.px)}, {f(s.py)})；ωᵧ = {f(s.w)}。<br/>lᶻ = {f(s.lz)}；力矩 dlᶻ/dt = {f(s.torque)}；H = {f(s.energy)}；完整状态旋转后 H = {f(s.rotatedEnergy)}，改变量 ΔH = {f(s.deltaEnergy)}。</p>
    <Verdict labels={labels} kind={s.branch==='symmetric'?'ok':s.branch==='near'?'warn':'neutral'}>
      {s.branch==='symmetric'?'α 恰为零，哈密顿量旋转不变，角动量恒定。':s.branch==='near'?'α 很小但非零，旋转对称性已被破坏，角动量可缓慢变化。':'两个方向的回复力不同，没有完整旋转对称性，角动量一般不守恒。'}
      {alpha>0&&' 某个角度或时刻的 ΔH、力矩可以碰巧为零，这不是整体对称性。'}
    </Verdict>
  </div>;
}

export function EndpointActionLab(){
  const[T,setT]=useState(1.5),s=endpointState(T);
  return <div>
    <Task>改变到达同一位置所需的时间，看整条经典路径和作用量如何改变。</Task>
    <Slider label="旅行时间 T" min={.4} max={2} step={.02} value={T} onChange={setT} fmt={v=>fmtEn(v,2)}/>
    <div className="flex flex-wrap gap-2 my-2">{[.5,1,2].map(t=><button key={t} className={W_BUTTON} onClick={()=>setT(t)}>T = {t}</button>)}</div>
    <Plot series={[
      {f:t=>t<=1?t:NaN,color:FMM_COLORS.blau,label:"基准 T₀=1",dash:[5,4]},
      {f:t=>t<=T?t/T:NaN,color:FMM_COLORS.orange,label:"当前旅行时间 T"}
    ]} xDomain={[0,2.15]} yDomain={[-.1,1.2]} width={450} height={285} xLabel="时间 t" yLabel="位置 x" ariaLabel="相同位置端点、不同到达时间的自由粒子经典路径" markers={[{x:T,y:1,color:FMM_COLORS.orange,label:"固定末位置"}]}/>
    <p className="text-sm">速度 = {f(s.velocity)}；S = {f(s.action)}；E = {f(s.energy)}。末端拉格朗日量 L = {f(s.lagrangian)}；路径改变的边界贡献率 −pẋ = {f(s.boundary)}。</p>
    <Verdict labels={labels} kind="ok">dS/dT = {f(s.dSdT)} = −E；L − pẋ = {f(s.lagrangian+s.boundary)}。固定的是末位置，而非原来那条轨道。</Verdict>
  </div>;
}
