/** ReducedMassLab: scripts/verify/reduced-mass-lab.mjs.
 * OscillatorPhaseLab: scripts/verify/oscillator-phase-lab.mjs.
 * Numeric states come from mechanics-coordinates.mjs, shared with checks.
 * Every state is set with native sliders; no automatic animation.
 */
import { useState } from "react";
import { Slider, Task, Verdict, FMM_COLORS, W_BUTTON, fmtEn } from "../../lib";
import { reducedMassState, oscillatorPhaseState } from "./mechanics-coordinates.mjs";
const labels={neutral:"观察",ok:"成立",warn:"接近零振幅",fail:"不成立"};
const f=(v:number)=>fmtEn(Math.abs(v)<1e-12?0:v,3);
export function ReducedMassLab(){
 const [m1,setM1]=useState(2),[m2,setM2]=useState(2),[r,setR]=useState(2);
 const s=reducedMassState(m1,m2,r),px=(x:number)=>260+45*x;
 return <div>
  <Task>增大第二个质量，观察质心附近谁移动得更少，以及约化质量怎样变化。</Task>
  <Slider label="质量 m₁" value={m1} min={.5} max={10} step={.5} onChange={setM1} fmt={f}/>
  <Slider label="质量 m₂" value={m2} min={.5} max={10} step={.5} onChange={setM2} fmt={f}/>
  <Slider label="相对位置 r" value={r} min={.5} max={4} step={.1} onChange={setR} fmt={f}/>
  <div className="flex flex-wrap gap-2 my-2"><button type="button" className={W_BUTTON} onClick={()=>{setM1(2);setM2(2);}}>相等质量</button><button type="button" className={W_BUTTON} onClick={()=>{setM1(.5);setM2(10);}}>第二个更重</button></div>
  <svg viewBox="0 0 520 200" width="520" height="200" className="block w-full h-auto" role="img" aria-label="在质心系中，两粒子的位置随质量比变化；质心固定为零">
   <line x1="35" y1="130" x2="480" y2="130" stroke="var(--w-axis)"/><text x="488" y="135" fill="var(--w-text)" fontSize="13">x</text>
   {[-4,-2,0,2,4].map(x=><g key={x}><line x1={px(x)} y1="126" x2={px(x)} y2="135" stroke="var(--w-axis)"/><text x={px(x)} y="150" textAnchor="middle" fill="var(--w-muted)" fontSize="12">{x}</text></g>)}
   <line x1="260" y1="35" x2="260" y2="125" stroke="var(--w-muted)" strokeDasharray="4 4"/><text x="260" y="25" textAnchor="middle" fill="var(--w-text)" fontSize="13">质心 R = 0</text>
   <line x1={px(s.x2)} y1="75" x2={px(s.x1)} y2="75" stroke="var(--w-grid-strong)"/>
   <circle cx={px(s.x1)} cy="75" r={7+1.2*Math.sqrt(m1)} fill={FMM_COLORS.blau}/><circle cx={px(s.x2)} cy="75" r={7+1.2*Math.sqrt(m2)} fill={FMM_COLORS.orange}/>
   <text x={px(s.x1)} y="111" textAnchor="middle" fill={FMM_COLORS.blau} fontSize="13">m₁</text><text x={px(s.x2)} y="111" textAnchor="middle" fill={FMM_COLORS.orange} fontSize="13">m₂</text>
   <text x="260" y="181" textAnchor="middle" fill="var(--w-text)" fontSize="13">r = x₁ − x₂ = {f(r)}；两圆大小仅示意质量</text>
  </svg>
  <p className="text-sm">x₁ = {f(s.x1)}，x₂ = {f(s.x2)}；M = {f(s.total)}，μ = {f(s.mu)}。取相对速度 ṙ = 1，则 v₁ = {f(s.v1)}，v₂ = {f(s.v2)}。</p>
  <Verdict labels={labels} kind="ok">总动量 m₁v₁ + m₂v₂ = 0；两粒子的动能之和 = {f(s.kinetic)}，等于 ½μṙ² = {f(s.relativeKinetic)}。{m1===m2?"相等质量时 μ 等于每个质量的一半。":"质量较大的粒子离质心更近，约化质量小于两个质量中的较小者。"}</Verdict>
 </div>;
}
export function OscillatorPhaseLab(){
 const [m,setM]=useState(1),[k,setK]=useState(1),[a,setA]=useState(1),[angle,setAngle]=useState(0);
 const s=oscillatorPhaseState(m,k,a,angle),px=(q:number)=>210+75*q,py=(p:number)=>170-21*p;
 const orbit=Array.from({length:181},(_,j)=>{const q=oscillatorPhaseState(m,k,a,j*2);return `${j?'L':'M'}${px(q.q)},${py(q.p)}`;}).join(' ');
 return <div>
  <Task>沿相位滑块走一圈，比较位置和动量如何变化，而能量保持不变。</Task>
  <Slider label="质量 m" value={m} min={.5} max={3} step={.5} onChange={setM} fmt={f}/>
  <Slider label="劲度 k" value={k} min={.5} max={3} step={.5} onChange={setK} fmt={f}/>
  <Slider label="振幅 A" value={a} min={0} max={2} step={.05} onChange={setA} fmt={f}/>
  <Slider label="相位 θ = ωt" value={angle} min={0} max={360} step={1} onChange={setAngle} unit="°" fmt={v=>fmtEn(v,0)}/>
  <div className="flex flex-wrap gap-2 my-2"><button type="button" className={W_BUTTON} onClick={()=>{setA(1);setAngle(0);}}>从右端点出发</button><button type="button" className={W_BUTTON} onClick={()=>setAngle(90)}>经过平衡点</button><button type="button" className={W_BUTTON} onClick={()=>setA(0)}>平衡静止态</button></div>
  <svg viewBox="0 0 420 340" width="420" height="340" className="mx-auto block w-full h-auto max-w-[450px]" role="img" aria-label="简谐振子的相空间轨迹，横轴位置，纵轴正则动量">
   <path d="M35 170 H390 M210 315 V25" fill="none" stroke="var(--w-axis)"/>
   <text x="390" y="192" fill="var(--w-text)" fontSize="13">q</text><text x="220" y="28" fill="var(--w-text)" fontSize="13">p</text>
   {[-2,-1,1,2].map(q=><g key={q}><line x1={px(q)} y1="166" x2={px(q)} y2="175" stroke="var(--w-axis)"/><text x={px(q)} y="190" textAnchor="middle" fill="var(--w-muted)" fontSize="11">{q}</text></g>)}
   {[-6,-4,-2,2,4,6].map(p=><g key={p}><line x1="206" y1={py(p)} x2="214" y2={py(p)} stroke="var(--w-axis)"/><text x="199" y={py(p)+4} textAnchor="end" fill="var(--w-muted)" fontSize="11">{p}</text></g>)}
   <path d={orbit} fill="none" stroke={FMM_COLORS.blau} strokeWidth="2.5"/><circle cx={px(s.q)} cy={py(s.p)} r="6" fill={FMM_COLORS.orange}/>
   <text x="210" y="330" textAnchor="middle" fill="var(--w-text)" fontSize="12">蓝：同能量轨道；橙：当前状态（两轴比例不同）</text>
  </svg>
  <p className="text-sm">q = {f(s.q)}，p = {f(s.p)}；q̇ = p/m = {f(s.qdot)}，ṗ = −kq = {f(s.pdot)}；ω = {f(s.omega)}，t = {f(s.time)}。</p>
  <Verdict labels={labels} kind={s.branch==='zero'?'neutral':s.branch==='near'?'warn':'ok'}>{s.branch==='zero'?"A 严格为零，相空间轨道缩成原点，位置和动量都不变化。":s.branch==='near'?"振幅很小但不为零，轨道仍是一条椭圆，并没有退化成点。":"相位增加时沿椭圆运动；相同 q 上通常有相反的两个 p，对应不同运动方向。"} H = p²/(2m) + kq²/2 = {f(s.energy)}，等于 kA²/2 = {f(k*a*a/2)}。</Verdict>
 </div>;
}
