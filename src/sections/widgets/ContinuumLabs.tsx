/** StringLab: scripts/verify/string-lab.mjs; DeltaLab: scripts/verify/delta-lab.mjs.
 * Three finite normal modes, L=c=1, zero initial velocity. No physical string tension simulation.
 * Deterministic manual time control keeps reduced-motion users in control.
 */
import { useMemo, useState } from "react";
import { M, Plot, Slider, Task, Verdict, fmtEn } from "../../lib";
import { staticBench,handles,projection,parts } from "./string-geometry";
import { stringValue,stringEnergyNorm,stringStateClass,gaussian,testFunction,gaussianMean,projectPoint } from "./continuum-math.mjs";
import "./anatomy.css";
const labels={neutral:"观察",ok:"成立",warn:"近似",fail:"不成立"};
const f=(x:number)=>fmtEn(Math.abs(x)<1e-10?0:x,3);
function wire(t:number,a:number[]) { return Array.from({length:181},(_,j)=>{const x=j/180;const p=projectPoint([-149+298*x,0,52+6*stringValue(x,t,a)],projection);return `${j?"L":"M"}${p[0].toFixed(3)},${p[1].toFixed(3)}`;}).join(" "); }
export function StringLab() {
 const [a,setA]=useState([.8,.35,0]); const [t,setT]=useState(0); const [theme,setTheme]=useState("light");
 const d=useMemo(()=>wire(t,a),[t,a]); const norm=stringEnergyNorm(t,a); const stateClass=stringStateClass(a),zero=stateClass==='zero';
 const near=stateClass==='near';
 return <div data-lab="string">
   <Task>分别改变三个振型的系数，再改变时间。观察相同的系数怎样同时决定曲线与台架上的弦形。</Task>
   <div className="string-layout"><div className="string-picture">
   <div className="string-card iso" data-theme={theme}>
     <div className="string-card-head"><span>实验台 · NORMAL MODES</span><b>固定两端的弦</b></div>
     <svg className="iso-svg" viewBox="0 0 660 330" width="660" height="330" role="img" aria-label="固定两端的三模态弦振动装置">
       <g dangerouslySetInnerHTML={{__html:staticBench}}/>
       {handles.map((h,j)=>{const z=projectPoint([-99+j*95,45,8],projection),q=projectPoint([-99+j*95+22*a[j],45,8],projection);return <g key={j} transform={`translate(${q[0]-z[0]},${q[1]-z[1]})`} dangerouslySetInnerHTML={{__html:h}}/>;})}
       <path d={d} fill="none" stroke={theme==="light"?"#398061":"#8ccaa1"} strokeWidth="2" strokeLinecap="round"/>
       {[-149,149].map(x=>{const p=projectPoint([x,0,52],projection);return <circle key={x} cx={p[0]} cy={p[1]} r="2.7" fill={theme==="light"?"#4d5c50":"#d5ddd6"}/>;})}
     </svg>
     <div className="string-card-foot"><span>调系数 → 叠加振型 → 观察位移</span><span>t = {f(t)}　L = c = 1</span></div>
   </div>
   <Plot series={[{f:x=>stringValue(x,t,a),label:"弦位移 f(x,t)",color:"#3e8564"}]} xDomain={[0,1]} yDomain={[-4.4,4.4]} width={380} height={235} xLabel="x / L" yLabel="位移 f" ariaLabel="弦位移与位置的定量曲线"/>
   </div><div className="string-controls">
   <div className="lab-buttons"><button onClick={()=>{setA([1,0,0]);setT(0);}}>只留基频</button><button onClick={()=>{setA([.8,.35,0]);setT(0);}}>混合振型</button><button onClick={()=>{setA([0,0,0]);setT(0);}}>静止弦</button><button onClick={()=>setTheme(theme==="light"?"dark":"light")} aria-pressed={theme==="dark"}>台架{theme==="light"?"深色":"浅色"}背景</button></div>
   {a.map((v,j)=><Slider key={j} label={`振型 ${j+1} 的系数`} value={v} min={-1} max={1} step={.05} onChange={n=>setA(old=>old.map((x,i)=>i===j?n:x))} fmt={f}/>)}
   <Slider label="时间 t" value={t} min={0} max={2} step={.01} onChange={setT} fmt={f}/>
   <M>{String.raw`f(x,t)=\sqrt2\sum_{m=1}^3a_m\sin(m\pi x)\cos(m\pi t)`}</M>
   <p className="lab-state">a = ({a.map(f).join("，")})　·　t = {f(t)}　·　∫₀¹ f² dx = {f(norm)}</p>

   <Verdict labels={labels} kind={zero?"neutral":near?"warn":"ok"}>{zero?"全部系数为零，弦在所有时刻都保持平直。":near?"系数很小，位移接近零，但不是严格为零的初态。":"每一项都在两个端点为零；它们叠加后仍满足固定边界。"} 当前中点位移为 {f(stringValue(.5,t,a))}。上面的位移平方积分随时间改变，不是这根弦的总机械能。</Verdict>
   </div></div>
   <small className="lab-credit">原创教学示意台架 · Anatomy 绘图库（MIT）· {parts} 个实体部件 · 仅展示前三个正常模</small>
 </div>;
}
export function DeltaLab() {
 const [width,setWidth]=useState(.5); const [center,setCenter]=useState(.3);
 const target=testFunction(center),mean=gaussianMean(center,width),error=width*width/2;
 return <div data-lab="delta">
   <Task>减小高斯峰的宽度 Δ，比较局部平均与目标函数在中心的值。横轴范围有限，面积结论指整条实线。</Task>
   <Slider label="宽度 Δ" value={width} min={.12} max={1} step={.02} onChange={setWidth} fmt={f}/>
   <Slider label="中心 x₀" value={center} min={-1} max={1} step={.05} onChange={setCenter} fmt={f}/>
   <M>{String.raw`g_\Delta(x-x_0)=\frac{e^{-(x-x_0)^2/\Delta^2}}{\sqrt\pi\Delta},\quad f(x)=1+x^2`}</M>
   <Plot series={[{f:x=>gaussian(x,center,width),label:"gΔ(x)",color:"#3e8564",fill:true},{f:testFunction,label:"f(x)",color:"#b68541",dash:[4,4]}]} xDomain={[-3,3]} yDomain={[0,10.5]} width={380} height={280} xLabel="x" yLabel="函数值 / 权重" ariaLabel="有限宽度高斯峰与二次函数"/>
   <div className="delta-values"><span>目标点的值 <b>{f(target)}</b></span><span>全实线加权平均 <b>{f(mean)}</b></span><span>两者之差 <b>{f(error)}</b></span></div>
   <Verdict labels={labels} kind={width<=.2?"ok":"warn"}>峰的全实线积分始终为 1。此例的加权平均恰为 1 + x₀² + Δ²/2，因此误差是 Δ²/2 = {f(error)}；当前 Δ &gt; 0，仍是有限宽度近似，不是真正的 δ 分布。</Verdict>
 </div>;
}
