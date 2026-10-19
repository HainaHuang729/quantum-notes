/** FreeGaussianLab: scripts/verify/free-gaussian.mjs.
 * CenteredBoxLab: scripts/verify/centered-box.mjs.
 * Dimensionless exact analytical solutions; finite display windows are not renormalized.
 */
import { useState } from "react";
import { Plot, Slider, Task, Verdict, W_BUTTON, FMM_COLORS, fmtEn } from "../../lib";
import { FREE_WINDOW, FREE_PRESETS, BOX_PRESETS,freePacket,boxState,boxEnergy,boxEigen,boxEnergyReference,type FreeParameters,type BoxParameters } from "./free-box-math.mjs";
const f=(x:number)=>fmtEn(x,3);
const labels={neutral:"观察",ok:"由解析解判断",warn:"注意显示窗口",fail:"不成立"};
export function FreeGaussianLab(){
  const [p,setP]=useState<FreeParameters>({delta:1,p:1,mass:1,time:0});
  const s=freePacket(p),set=(patch:Partial<FreeParameters>)=>setP(old=>({...old,...patch}));
  return <div className="space-y-3">
    <Task>先预测：把初始宽度减半，会让稍后的位置更集中，还是展宽更快？再改变质量比较。</Task>
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">{FREE_PRESETS.map(v=><button key={v.label} className={W_BUTTON} type="button" onClick={()=>setP(v)}>{v.label}</button>)}</div>
        <Slider label="准备宽度 Δ" min={.5} max={2} step={.1} value={p.delta} onChange={delta=>set({delta})} fmt={f}/>
        <Slider label="平均动量 p₀" min={-2} max={2} step={.1} value={p.p} onChange={q=>set({p:q})} fmt={f}/>
        <Slider label="质量 m" min={1} max={4} step={.5} value={p.mass} onChange={mass=>set({mass})} fmt={f}/>
        <Slider label="时间 t" min={0} max={6} step={.1} value={p.time} onChange={time=>set({time})} fmt={f}/>
        <div className="flex flex-wrap gap-2"><button className={W_BUTTON} type="button" onClick={()=>set({time:Math.min(6,p.time+.5)})}>前进半步</button><button className={W_BUTTON} type="button" onClick={()=>set({time:0})}>回到初态</button><button className={W_BUTTON} type="button" onClick={()=>setP({delta:1,p:1,mass:1,time:0})}>重置全部</button></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Plot width={420} height={300} xDomain={FREE_WINDOW} yDomain={[0,1/(Math.sqrt(Math.PI)*p.delta)*1.15]} xLabel="位置 x / ℓ₀" yLabel="ℓ₀ ρ(x,t)" series={[{f:s.initial,color:FMM_COLORS.orange,label:"初态"},{f:s.density,color:FMM_COLORS.blau,label:"当前"}]} vlines={[{at:s.mean,label:"均值",color:FMM_COLORS.gruen}]} ariaLabel="自由高斯波包的初始与当前密度，固定位置窗口，不对窗口截断后重新归一化"/>
        <Plot width={420} height={300} xDomain={[-7,7]} yDomain={[0,p.delta/Math.sqrt(Math.PI)*1.15]} xLabel="动量 p ℓ₀ / ℏ" yLabel="(ℏ/ℓ₀) ρₚ(p)" series={[{f:s.momentum,color:FMM_COLORS.blau,label:"ρₚ"}]} ariaLabel="自由粒子的动量密度，整个演化中保持不变"/>
        <p className="text-sm tabular-nums sm:col-span-2">⟨X⟩ = {f(s.mean)} ℓ₀；σₓ = {f(s.sigmaX)} ℓ₀；σₚ = {f(s.sigmaP)} ℏ/ℓ₀；σₓσₚ = {f(s.product)} ℏ。<br/>位置窗内概率 = {f(s.windowMass)}，窗外尾部 = {f(s.tail)}；动量窗外尾部 = {fmtEn(s.momentumTail,6)}。<br/>⟨H⟩ = {f(s.energy)} ℏ²/(m₀ℓ₀²)。</p>
      </div>
    </div>
    <Verdict labels={labels} kind={s.tail>.02?"warn":s.branch==="initial"?"neutral":"ok"}>{s.branch==="initial"?"此刻是所选准备，σₓσₚ=ℏ/2。":s.branch==="spreading"?"平均位置不动，密度仍在展宽；零平均动量不表示动量没有分散。":"均值按 p₀t/m 移动，同时不同动量分量使密度展宽。"}窗口外的概率仍属于同一个归一化波包；图内曲线没有被放大补齐。</Verdict>
    <p className="text-xs">单位：位置 ℓ₀，动量 ℏ/ℓ₀，质量 m₀，时间 m₀ℓ₀²/ℏ。这里只演化最初无位置动量相关的自由 Gaussian，未加入势、探测或环境作用。</p>
  </div>;
}

export function CenteredBoxLab(){
  const [p,setP]=useState<BoxParameters>(BOX_PRESETS[0]);
  const s=boxState(p),set=(patch:Partial<BoxParameters>)=>setP(old=>({...old,...patch}));
  const maxLevel=boxEnergy(7,p.L),selected=s.branch==="stationary"?(p.weight===1?p.n:s.m):null,reference=boxEnergyReference(p.n,p.L);
  return <div className="space-y-3">
    <Task>先把箱长加倍，预测能量怎样变；再把一个定态改成相邻两态叠加，逐步观察密度。</Task>
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">{BOX_PRESETS.map(v=><button key={v.label} type="button" className={W_BUTTON} onClick={()=>setP(v)}>{v.label}</button>)}</div>
        <Slider label="箱长 L" min={1} max={4} step={.1} value={p.L} onChange={L=>set({L})} fmt={f}/>
        <Slider label="较低态 n" min={1} max={6} step={1} value={p.n} onChange={n=>set({n,time:0})} fmt={v=>fmtEn(v,0)}/>
        <Slider label="低态权重 w" min={0} max={1} step={.05} value={p.weight} onChange={weight=>set({weight})} fmt={f}/>
        <Slider label="初始相位 φ/π" min={-1} max={1} step={.1} value={p.phasePi} onChange={phasePi=>set({phasePi})} fmt={f}/>
        <Slider label="时间 t" min={0} max={4} step={.02} value={p.time} onChange={time=>set({time})} fmt={f}/>
        <div className="flex gap-2 flex-wrap"><button type="button" className={W_BUTTON} onClick={()=>set({time:Math.min(4,p.time+s.period/8)})}>前进八分之一拍</button><button type="button" className={W_BUTTON} onClick={()=>set({time:0})}>时间归零</button><button type="button" className={W_BUTTON} onClick={()=>setP(BOX_PRESETS[0])}>重置</button></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 items-start">
        <Plot width={420} height={300} xDomain={[-.55,.55]} yDomain={[0,4.3]} xLabel="居中坐标 x/L" yLabel="L ρ(x,t)" series={[{f:q=>p.L*s.density(q*p.L),label:"当前密度",color:FMM_COLORS.blau},{f:q=>p.L*boxEigen(p.n,p.L,q*p.L)**2,label:"低态密度",color:FMM_COLORS.orange,dash:[4,3]}]} vlines={[{at:-.5,label:"左壁"},{at:.5,label:"右壁"}]} ariaLabel="居中无限深箱内概率密度；箱外恒为零，曲线未经窗内重新归一化"/>
        <div className="min-w-0"><svg viewBox="0 0 340 300" width="340" height="300" className="w-full h-auto" role="img" aria-label="箱中前七个离散能级，能量与量子数平方成正比，采用自动刻度">
          <text x="20" y="20" fill="var(--w-text)" fontSize="12">E：ℏ²/(m₀ℓ₀²)</text><line x1="43" x2="43" y1="32" y2="267" stroke="var(--w-axis)"/>
          {Array.from({length:7},(_,i)=>i+1).map(n=>{const e=boxEnergy(n,p.L),y=267-225*e/maxLevel;return <g key={n}><line x1="53" x2="227" y1={y} y2={y} stroke={n===p.n||n===s.m?FMM_COLORS.blau:"var(--w-muted)"} strokeWidth={n===selected?3:1}/><text x="235" y={y+4} fill="var(--w-text)" fontSize="11">{n}：{fmtEn(e,2)}</text></g>;})}
          <text x="165" y="293" fill="var(--w-muted)" textAnchor="middle" fontSize="11">每次改 L 都重算刻度；请比较读数</text>
        </svg><div className="text-xs space-y-1" role="img" aria-label={`同一编号 n=${p.n}，当前能量是固定箱长 L=1 参照能量的 ${fmtEn(reference.ratio,4)} 倍`}>
          <p>固定参照：同一 n = {p.n}，L = 1 时 Eᵣ = {fmtEn(reference.reference,2)}</p>
          <div className="h-2 w-full rounded overflow-hidden" style={{background:'var(--w-grid)'}}><div className="h-full" style={{width:`${100*reference.ratio}%`,background:FMM_COLORS.blau}}/></div>
          <p>当前 Eₙ/Eᵣ = {fmtEn(reference.ratio,4)}；L 加倍，条长变为四分之一。</p>
        </div></div>
        <p className="text-sm tabular-nums sm:col-span-2">ψ = √w ψₙ e⁻ⁱᴱⁿᵗ + e⁻ⁱᵠ√(1−w) ψₙ₊₁ e⁻ⁱᴱⁿ⁺¹ᵗ；n = {p.n}，n+1 = {s.m}。<br/>Eₙ = {f(s.En)}，Eₙ₊₁ = {f(s.Em)}，⟨H⟩ = {f(s.energy)}；拍周期 T = {f(s.period)}。<br/>⟨X⟩ = {f(s.mean)} ℓ₀；σₓ = {f(s.sigmaX)} ℓ₀；相对演化角 = {f(s.theta)} rad。</p>
      </div>
    </div>
    <Verdict labels={labels} kind={s.branch==="stationary"?"neutral":"ok"}>{s.branch==="stationary"?"只占一个能量本征态，时间只改变整体复相位，密度不变。":"两种能量的相对相位持续变化，交叉项使密度拍动；平均能量仍不随时间改变。"}箱中心一直是零，墙始终在 ±L/2；改变 L 比较的是不同箱子的准备，并非模拟移动墙的动力学。</Verdict>
    <p className="text-xs">同上采用 ℏ=m₀=ℓ₀=1 的数值单位，质量固定为 m₀。仅取相邻两个精确定态，无截断误差；定态编号奇数为空间偶函数，编号偶数为空间奇函数。</p>
  </div>;
}
