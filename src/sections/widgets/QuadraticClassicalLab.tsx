/** Exact moment closure, checked independently by
 * scripts/verify/quadratic-classical-lab.mjs. No solver, sampling or autoplay.
 */
import {useState} from 'react';
import {Slider,Plot,Task,Verdict,W_BUTTON,FMM_COLORS,fmtEn} from '../../lib';
import {quadraticState,QUADRATIC_PRESETS,QUADRATIC_WINDOW,type QuadraticParameters} from './quadratic-classical.mjs';
const labels={neutral:'比较',ok:'精确关系',warn:'模型范围',fail:'不成立'},f=(x:number)=>fmtEn(x,3);
export function QuadraticClassicalLab(){
 const [p,setP]=useState<QuadraticParameters>(QUADRATIC_PRESETS[1]);
 const s=quadraticState(p),set=(patch:Partial<QuadraticParameters>)=>setP(old=>({...old,...patch}));
 const px=150+27*s.mean,py=115-27*s.momentum;
 return <div className="space-y-2"><Task>先预测：让波包变窄，会破坏中心的经典轨道吗？逐步观察中心与分布宽度。</Task>
 <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-3 items-start"><div className="space-y-1"><div className="flex gap-2 flex-wrap">{QUADRATIC_PRESETS.map(v=><button key={v.label} type="button" className={W_BUTTON} onClick={()=>setP(v)}>{v.label}</button>)}</div>
 <Slider label="准备宽度 Δ" value={p.delta} onChange={delta=>set({delta})} min={.5} max={2} step={.1} fmt={f}/><Slider label="初位置 x₀" value={p.x0} onChange={x0=>set({x0})} min={-2} max={2} step={.25} fmt={f}/><Slider label="初动量 p₀" value={p.p0} onChange={p0=>set({p0})} min={-2} max={2} step={.25} fmt={f}/><Slider label="时间 t/π" value={p.step} onChange={step=>set({step})} min={0} max={120} step={1} fmt={v=>fmtEn(v/60,2)}/>
 <div className="flex gap-2 flex-wrap"><button type="button" className={W_BUTTON} disabled={p.step>115} onClick={()=>set({step:p.step+5})}>前进 π/12</button><button type="button" className={W_BUTTON} onClick={()=>set({step:0})}>时间归零</button><button type="button" className={W_BUTTON} onClick={()=>setP(QUADRATIC_PRESETS[1])}>全部重置</button></div></div>
 <div className="grid sm:grid-cols-2 gap-2"><Plot width={400} height={255} xDomain={QUADRATIC_WINDOW} yDomain={[0,1.25]} xLabel="位置 x" yLabel="概率密度 ρ" series={[{f:s.density,color:FMM_COLORS.blau,fill:true}]} vlines={[{at:s.mean,color:FMM_COLORS.orange}]} ariaLabel="精确Gaussian位置密度，橙线为同初值经典粒子的位置，也是量子均值"/>
 <svg viewBox="0 0 320 230" width="320" height="230" className="w-full h-auto" role="img" aria-label="相空间中同一初值的经典圆轨道与量子均值：橙十字与蓝圈始终重合，不表示单个粒子被测得的轨迹">
 <path d="M45 115H270M150 205V25" stroke="var(--w-axis)" fill="none"/>
 {[-2,0,2].map(v=><g key={v} fill="var(--w-muted)" fontSize="11"><text x={150+27*v} y="132" textAnchor="middle">{v}</text>{v!==0&&<text x="140" y={119-27*v} textAnchor="end">{v}</text>}</g>)}
 <circle cx="150" cy="115" r={27*s.orbitRadius} fill="none" stroke={FMM_COLORS.orange} strokeDasharray="5 4"/>
 <path d={`M${px-5} ${py}H${px+5}M${px} ${py-5}V${py+5}`} stroke={FMM_COLORS.orange} strokeWidth="2"/><circle cx={px} cy={py} r="7" fill="none" stroke={FMM_COLORS.blau} strokeWidth="2"/>
 <g fill="var(--w-text)" fontSize="12"><text x="276" y="119">〈X〉</text><text x="156" y="18">〈P〉</text><text x="20" y="224">橙轨道/十字：经典；蓝圈：量子均值</text></g></svg></div></div>
 <p className="text-sm">t = {f(s.time)}；〈X〉= {f(s.mean)}，〈P〉= {f(s.momentum)}，σₓ = {f(s.sigma)}。〈X²〉= {f(s.second)}，〈X〉² = {f(s.mean*s.mean)}，差 = Var(X) = {f(s.variance)}；〈H〉= {f(s.energy)}。</p>
 <Verdict labels={labels} kind="ok">{s.branch==='fixed-width'?'Δ=1 时宽度恒定；中心仍沿经典轨道运动。':'宽度周期变化，但中心的运动仍与同初值经典点精确重合。'} 〈X²〉始终比〈X〉²多出正方差；经典的均值方程没有把分布压成一个点。</Verdict>
 <p className="text-xs">H=(P²+X²)/2，ℏ=m=ω=1；长度单位 √(ℏ/mω)，动量单位 √(mℏω)，时间单位 1/ω，能量单位 ℏω。初态 σₓ=Δ/√2、σₚ=1/(√2Δ)，无初始协方差。全轴归一；图窗内概率约 {fmtEn(s.windowMass,6)}，未按图窗重归一。本实验是二次势的精确 Gaussian 演化，不适用于任意势。</p></div>;
}
