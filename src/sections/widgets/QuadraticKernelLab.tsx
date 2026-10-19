/** Analytic kernel/path comparison. Numeric check: scripts/verify/quadratic-kernel.mjs. */
import {useState} from 'react';
import {Slider,Plot,Task,Verdict,W_BUTTON,FMM_COLORS,fmtEn} from '../../lib';
import {KERNEL_PRESETS,KERNEL_PATH_WINDOW,kernelState,type KernelParameters} from './quadratic-kernel.mjs';
const fmt=(v:number)=>fmtEn(v,3),labels={neutral:'比较',ok:'解析关系',warn:'适用范围',fail:'不成立'};
export function QuadraticKernelLab(){
 const [p,setP]=useState<KernelParameters>(KERNEL_PRESETS[0]);
 const set=(v:Partial<KernelParameters>)=>setP(old=>({...old,...v})),s=kernelState(p);
 return <div className="space-y-2"><Task>先预测：从自由切到恒力，核的模长还是相位会改变？再改变路径形变，区分比较路径与完整传播核。</Task>
 <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-3 items-start"><div className="space-y-1">
 <div className="flex flex-wrap gap-1">{KERNEL_PRESETS.map(v=><button key={v.label} type="button" className={W_BUTTON} onClick={()=>setP(v)}>{v.label}</button>)}</div>
 <label className="text-sm block">模型 <select value={p.model} className={W_BUTTON} onChange={e=>set({model:e.target.value as KernelParameters['model']})}><option value="free">自由 V=0</option><option value="force">恒力 V=−fx</option><option value="oscillator">振子 V=ω²x²/2</option></select></label>
 <Slider label="传播时间 T" value={p.T} min={.25} max={1.5} step={.05} onChange={T=>set({T})} fmt={fmt}/>
 {p.model==='force'&&<Slider label="恒力 f" value={p.force} min={-1} max={1} step={.1} onChange={force=>set({force})} fmt={fmt}/>}
 {p.model==='oscillator'&&<Slider label="频率 ω" value={p.omega} min={.5} max={1.5} step={.1} onChange={omega=>set({omega})} fmt={fmt}/>}
 <Slider label="形变幅 a" value={p.a} min={-.5} max={.5} step={.05} onChange={a=>set({a})} fmt={fmt}/>
 <div className="flex flex-wrap gap-1"><button type="button" className={W_BUTTON} disabled={p.a>=.5} onClick={()=>set({a:Math.min(.5,Math.round((p.a+.05)*20)/20)})}>形变 +0.05</button><button type="button" className={W_BUTTON} onClick={()=>set({a:0})}>恢复经典路径</button><button type="button" className={W_BUTTON} onClick={()=>setP(KERNEL_PRESETS[0])}>全部重置</button></div></div>
 <div className="grid sm:grid-cols-2 gap-2 min-w-0"><Plot width={360} height={250} xDomain={[0,1]} yDomain={KERNEL_PATH_WINDOW} xLabel="时间 t/T" yLabel="位置 x" series={[{f:s.path,color:FMM_COLORS.blau,label:'经典'},{f:s.deformed,color:FMM_COLORS.orange,label:'形变'}]} ariaLabel="同一对固定端点的经典路径和正弦形变路径；路径曲线并非位置概率分布"/>
 <svg viewBox="0 0 270 250" width="270" height="250" className="w-full h-auto" role="img" aria-label="完整传播核的复平面向量，显示实部和虚部；不是单条路径的概率">
 <path d="M30 125H244M135 225V23" fill="none" stroke="var(--w-axis)"/>
 <circle cx="135" cy="125" r={90*s.amplitude} fill="none" stroke="var(--w-grid-strong)"/>
 <path d={`M135 125L${135+90*s.re} ${125-90*s.im}`} fill="none" stroke={FMM_COLORS.blau} strokeWidth="2"/><circle cx={135+90*s.re} cy={125-90*s.im} r="4" fill={FMM_COLORS.blau}/>
 <g fill="var(--w-text)" fontSize="12"><text x="235" y="143">Re K</text><text x="141" y="23">Im K</text><text x="135" y="143">0</text><text x="225" y="119">1</text><text x="135" y="244" textAnchor="middle">蓝向量：完整解析核</text></g></svg></div></div>
 <p className="text-sm">T={fmt(p.T)}；{p.model==='force'?`f=${fmt(p.force)}`:p.model==='oscillator'?`ω=${fmt(p.omega)}，ωT=${fmt(p.omega*p.T)}`:'V=0'}；a={fmt(p.a)}。S经典={fmt(s.S)}，ΔS={fmt(s.deltaS)}，S形变={fmt(s.deformedAction)}；|K|={fmt(s.amplitude)}，Re K={fmt(s.re)}，Im K={fmt(s.im)}。</p>
 <Verdict labels={labels} kind="ok">{p.model==='oscillator'?'振子的二次回复力同时改变经典作用量与涨落因子。':'自由与恒力在相同 T 下有相同 |K|；恒力通过经典作用量改变相位。'} {s.branch==='classical'?'a=0，两条路径重合。':'当前选定形变的 ΔS>0；这只比较一族路径，未计算所有路径的和。'} 调 a 不改变完整核。</Verdict>
 <p className="text-xs">约化单位 m=ℏ=1；端点 x(0)=0、x(T)=1。选取长度 ℓ 后，时间单位 mℓ²/ℏ，力单位 ℏ²/(mℓ³)，作用量单位 ℏ，核单位 ℓ⁻¹。K=|K|exp[iS经典−iπ/4]。振子仅用 0&lt;ωT≤2.25&lt;π 的平方根分支。三个解析特例没有求解一般含时二次势，也没有把光滑比较路径当成全部量子路径。</p></div>;
}
