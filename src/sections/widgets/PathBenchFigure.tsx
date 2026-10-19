/** Numeric/geometry audit: scripts/verify/path-bench.mjs. A finite path family, not a particle apparatus. */
import {useMemo,useState} from "react";
import {M,Plot,Slider,Task,Verdict,fmtEn,W_BUTTON,useAnimatedValue,FMM_COLORS} from "../../lib";
import {pathAt,deltaAction} from "./stationary-phase.mjs";
import {projectPoint} from "./continuum-math.mjs";
import {staticBench,fixtures,carriages,projection,parts} from "./path-bench-geometry";
import "./anatomy.css";
const f=(n:number)=>fmtEn(n,3);
const presets=[{label:"向下弯",a:-.6},{label:"直线",a:0},{label:"向上弯",a:.6}];
const labels={neutral:"固定边界",ok:"比较路径",warn:"观察",fail:"不成立"};
function trace(a:number){return Array.from({length:181},(_,j)=>{const t=j/180,p=projectPoint([-150+300*t,-65+100*pathAt(t,a),10],projection);return `${j?'L':'M'}${p[0].toFixed(3)} ${p[1].toFixed(3)}`;}).join(' ');}
export function PathBenchFigure(){
 const [target,setTarget]=useState(.6),[continuous,setContinuous]=useState(false),[theme,setTheme]=useState("light");
 const a=useAnimatedValue(target,continuous?0:240),curve=useMemo(()=>trace(a),[a]);
 const choose=(v:number)=>{setContinuous(false);setTarget(v);};
 return <figure className="space-y-3" data-figure="path-bench">
  <Task>先选一条弯曲路径，再把幅度调到零。观察五个内节点怎样移动，而两端夹具保持原位。</Task>
  <div className="string-card iso" data-theme={theme}>
   <div className="string-card-head"><span>图解 · 固定边界</span><b>路径描线台</b></div>
   <svg className="iso-svg" viewBox="0 0 660 360" width="660" height="360" role="img" aria-label="数学描线台：五个滑块改变所选路径，两端夹具固定不动">
    <g dangerouslySetInnerHTML={{__html:staticBench}}/>
    <g dangerouslySetInnerHTML={{__html:fixtures}}/>
    {carriages.map(({t,art})=>{const p=projectPoint([0,100*a*Math.sin(Math.PI*t),0],projection),z=projectPoint([0,0,0],projection);return <g key={t} data-node={t} transform={`translate(${p[0]-z[0]} ${p[1]-z[1]})`} dangerouslySetInnerHTML={{__html:art}}/>;})}
    <path className="iso-line" data-tone="lo" data-dotted="" d={trace(0)}/>
    <path className="iso-line" data-tone="lit" d={curve} style={{strokeWidth:1.8}}/>
   </svg>
   <div className="string-card-foot"><span>内节点可变 · 端点固定</span><span data-readout="">a = {f(a)}　q(½) = {f(pathAt(.5,a))}</span></div>
  </div>
  <figcaption className="text-sm">实线：所选路径。点线：直线参照。描线台把时间沿长边展开，把位置变成滑块的横向位置；它是数学插画，没有模拟真实粒子装置。</figcaption>
  <div className="flex flex-wrap gap-2">{presets.map(p=><button key={p.label} type="button" className={W_BUTTON} onClick={()=>choose(p.a)}>{p.label}</button>)}<button type="button" className={W_BUTTON} onClick={()=>choose(.6)}>重置描线台</button><button type="button" className={W_BUTTON} aria-pressed={theme==="dark"} onClick={()=>setTheme(v=>v==="light"?"dark":"light")}>切换明暗</button></div>
  <Slider label="路径幅度 a" value={target} min={-.7} max={.7} step={.05} onChange={v=>{setContinuous(true);setTarget(v);}} fmt={f}/>
  <M>{String.raw`q_a(t)=t+a\sin(\pi t),\qquad 0\le t\le1`}</M>
  <Plot width={580} height={260} xDomain={[0,1]} yDomain={[-.4,1.4]} xLabel="时间 t" yLabel="位置 q" series={[{f:t=>pathAt(t,a),label:"所选",color:FMM_COLORS.gruen},{f:t=>t,label:"直线",color:"var(--w-muted)",dash:[3,3]}]} points={carriages.map(({t})=>({x:t,y:pathAt(t,a)}))} ariaLabel="与描线台同一数据的时间位置图，端点为零零与一一"/>
  <p className="text-sm tabular-nums">m=T=1，长度与时间使用固定基准单位。S = 0.5 + ΔS = {f(.5+deltaAction(a))}；ΔS = {f(deltaAction(a))}。台架、节点、曲线和这些读数使用同一个 a。</p>
  <Verdict labels={labels} kind={a===0?"neutral":"ok"}>{a===0?"直线预设对应 a=0；此族中一阶作用量变化为零。":"改变 a 会改变路径内部的形状；正负相反的幅度在这个自由粒子例子中具有相同的作用量增量。"}每条曲线都满足 q(0)=0、q(1)=1，因为正弦项在两端为零。</Verdict>
  <p className="text-xs">这里仅展示一族光滑候选路径与五个标记节点，不是全路径积分，也不是路径概率或观测到的粒子轨迹。{parts} 个实体部件由 Anatomy（MIT）绘图库生成。</p>
 </figure>;
}
