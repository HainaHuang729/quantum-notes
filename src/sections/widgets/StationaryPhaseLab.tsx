/** Independent audit: scripts/verify/stationary-phase.mjs. Finite one-mode family only. */
import {useMemo,useState} from "react";
import {Slider,Plot,Task,Verdict,W_BUTTON,FMM_COLORS,fmtEn} from "../../lib";
import {stationaryState,pathAt,shiftPath,PHASE_PRESETS,type PhaseParameters} from "./stationary-phase.mjs";
const f=(v:number)=>fmtEn(v,3),labels={neutral:"驻点",ok:"相位比较",warn:"相位转动",fail:"不成立"};
const unitCircle=Array.from({length:97},(_,j)=>[Math.cos(j*Math.PI/48),Math.sin(j*Math.PI/48)] as [number,number]);
export function StationaryPhaseLab(){
 const [p,setP]=useState<PhaseParameters>(PHASE_PRESETS[0]),s=useMemo(()=>stationaryState(p),[p]);
 return <div className="space-y-3"><Task>预测：减小 ℏ 后，同样偏离直线的路径会转过更多相位吗？把 a 移到零，再比较附近变化。</Task>
 <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-4 items-start"><div className="space-y-3">
  <div className="flex flex-wrap gap-2">{PHASE_PRESETS.map(v=><button className={W_BUTTON} type="button" key={v.label} onClick={()=>setP(v)}>{v.label}</button>)}</div>
  <Slider label="路径幅度 a" value={p.a} min={-1.5} max={1.5} step={.05} onChange={a=>setP(old=>({...old,a}))} fmt={f}/>
  <Slider label="有效 ℏ" value={p.hbar} min={.1} max={2} step={.05} onChange={hbar=>setP(old=>({...old,hbar}))} fmt={f}/>
  <div className="flex flex-wrap gap-2">{[-1,1].map(sign=><button key={sign} type="button" className={W_BUTTON} disabled={sign<0?p.a===-1.5:p.a===1.5} onClick={()=>setP(old=>({...old,a:shiftPath(old.a,sign)}))}>{sign<0?"a − 一格":"a + 一格"}</button>)}<button type="button" className={W_BUTTON} onClick={()=>setP(PHASE_PRESETS[0])}>重置</button></div>
  <p className="text-sm">m=T=1，端点为 (0,0) 与 (1,1)，a∈[−1.5,1.5]；长度、时间、作用量均用固定基准单位计。</p>
 </div><div className="grid sm:grid-cols-2 gap-3">
 <Plot width={420} height={270} xDomain={[0,1]} yDomain={[-1.6,2.6]} xLabel="时间 t/T" yLabel="位置 q" series={[{f:t=>pathAt(t,p.a),label:"所选路径",color:FMM_COLORS.blau},{f:t=>t,label:"经典直线",color:FMM_COLORS.orange,dash:[4,3]}]} points={[{x:0,y:0,color:FMM_COLORS.gruen,r:4},{x:1,y:1,color:FMM_COLORS.gruen,r:4}]} ariaLabel="相同端点下所选正弦偏离路径与经典直线路径，绿色端点固定，不是测量轨迹"/>
 <Plot width={420} height={270} xDomain={[-1.2,1.2]} yDomain={[-1.2,1.2]} xLabel="实部" yLabel="虚部" series={[]} polylines={[{pts:unitCircle,color:'var(--w-border)',dash:[2,3]},{pts:[[0,0],s.phasor],label:"所选相位",color:FMM_COLORS.orange},{pts:s.mean.curve,label:"族累积",color:FMM_COLORS.blau}]} points={[{x:s.mean.re,y:s.mean.im,label:"均值",color:FMM_COLORS.gruen,r:4},{x:s.phasor[0],y:s.phasor[1],color:FMM_COLORS.orange,r:3}]} ariaLabel="灰色单位圆上橙色点表示所选路径相位；蓝色曲线为族累积，绿色点为最终平均，已移去共同经典相位"/>
 <p className="sm:col-span-2 text-sm tabular-nums">Scl = 0.5，ΔS = {f(s.delta)}；ΔS/ℏ = {f(s.phase)} rad；相位对 a 的导数 = {f(s.slope)}。<br/>族平均 = {f(s.mean.re)} + ({f(s.mean.im)})i；模 = {f(s.mean.modulus)}。族平均仅随 ℏ 改变；选中 a 改变蓝色路径与橙色向量。</p>
 </div></div>
 <p className="text-xs">读图：路径图的两个绿点是固定端点。复平面的灰虚线为单位圆；橙线是所选路径的相位，蓝线是按 a 顺序累积的复平均，绿点是最后的族平均。</p>
 <Verdict labels={labels} kind={s.branch==="stationary"?"neutral":s.branch==="slow"?"ok":"warn"}>{s.branch==="stationary"?"a=0 精确驻定，一阶作用量变化为零；小偏离的相位差从 a² 开始。":s.branch==="slow"?"所选相位差小于 1 rad，处在这里选用的慢变尺度内；这不是相干性的硬边界。":"所选路径积累较大相位差，相邻幅度的向量更快转向，累积曲线会弯折。"}减小 ℏ 使固定非零 a 的相位转动加快；有限窗族平均的模不保证严格单调。</Verdict>
 <p className="text-xs">复平面采用 e^(iΔS/ℏ) 参考系；恢复 Scl 只会共同旋转。蓝线按均匀 a 从 −1.5 积到1.5，用2048格 Simpson 求积并除以区间长3；它不是全路径传播核，也不是探测概率。图没有随机取样或时间演化。</p></div>;
}
