/** Checked by scripts/verify/force-averaging.mjs.
 * Exact force moments of a prescribed Gaussian at one time; no nonlinear dynamics.
 */
import {useState} from "react";
import {Slider,Plot,Task,Verdict,W_BUTTON,FMM_COLORS,fmtEn} from "../../lib";
import {forceAveraging,FORCE_PRESETS,type ForceParameters} from "./force-averaging.mjs";
const f=(v:number)=>fmtEn(v,3),labels={neutral:"精确相等",ok:"比较结果",warn:"有限宽度修正",fail:"不成立"};
export function ForceAveragingLab(){
 const [p,setP]=useState<ForceParameters>(FORCE_PRESETS[1]);
 const s=forceAveraging(p),set=(v:Partial<ForceParameters>)=>setP(old=>({...old,...v}));
 return <div className="space-y-3"><Task>预测：让波包更窄，平均力会更接近中心处的力吗？再把中心移到零，看相等是否足以说明已成为经典点。</Task>
 <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-4 items-start">
  <div className="space-y-3"><div className="grid grid-cols-2 gap-2">{FORCE_PRESETS.map(v=><button type="button" className={W_BUTTON} key={v.label} onClick={()=>setP(v)}>{v.label}</button>)}</div>
   <Slider label="平均位置 μ" value={p.mu} min={-2} max={2} step={.1} onChange={mu=>set({mu})} fmt={f}/>
   <Slider label="标准差 σ" value={p.sigma} min={.1} max={1.5} step={.1} onChange={sigma=>set({sigma})} fmt={f}/>
   <Slider label="四次项 g" value={p.g} min={0} max={2} step={.1} onChange={g=>set({g})} fmt={f}/>
   <div className="flex gap-2 flex-wrap"><button type="button" className={W_BUTTON} disabled={p.sigma===.1} onClick={()=>set({sigma:Math.max(.1,Math.round((p.sigma-.1)*10)/10)})}>缩窄一格</button><button type="button" className={W_BUTTON} onClick={()=>setP(FORCE_PRESETS[1])}>重置</button></div>
  </div>
  <div className="grid sm:grid-cols-2 gap-3">
   <Plot width={420} height={290} xDomain={s.domain} yDomain={[0,s.densityMax]} xLabel="位置 x/ℓ" yLabel="ℓ ρ(x)" series={[{f:s.density,label:"ρ",color:FMM_COLORS.blau}]} vlines={[{at:p.mu,label:"μ",color:FMM_COLORS.gruen}]} ariaLabel="给定时刻的归一化高斯位置密度，显示均值左右四个标准差，不模拟后续演化"/>
   <Plot width={420} height={290} xDomain={s.forceXDomain} yDomain={s.forceDomain} xLabel="位置 x/ℓ" yLabel="力 F/F₀" series={[{f:s.force,label:"F",color:FMM_COLORS.blau}]} hlines={[{at:s.average,label:"均力",color:FMM_COLORS.gruen},{at:s.center,label:"中心力",color:FMM_COLORS.orange,dash:[4,3]}]} ariaLabel="均值左右两个标准差内的力场与平均力、中心力水平参考线，平均力仍使用全实线分布，不是一条粒子轨迹"/>
   <p className="text-sm tabular-nums sm:col-span-2">V/(F₀ℓ) = x²/2 + {f(p.g)} x⁴/4（此处 x 按 ℓ 计）；⟨X⟩/ℓ = {f(p.mu)}。<br/>⟨F⟩/F₀ = {f(s.average)}；F(μ)/F₀ = {f(s.center)}；两者之差 = {f(s.difference)}。<br/>σ²/ℓ² = {f(s.variance)}；⟨X²⟩/ℓ² = {f(s.second)}；⟨X³⟩/ℓ³ = {f(s.third)}。</p>
  </div>
 </div>
 <Verdict labels={labels} kind={s.branch==="nonlinear"?"warn":"neutral"}>{s.branch==="linear"?"g=0，力对位置是线性的，任意宽度的平均力都等于中心力。":s.branch==="symmetric"?"μ=0，奇函数力的左右贡献精确抵消，所以两力同为零；位置方差仍为正，不能据此说状态没有宽度。":"此刻的修正精确为 −3gμσ²。缩窄分布会按 σ² 减小这个修正，但这里没有计算下一时刻的态。"}</Verdict>
 <p className="text-xs">长度单位 ℓ、力单位 F₀，能量单位 F₀ℓ；二次系数固定为 F₀/ℓ。密度窗为 μ±4σ，窗外概率约 {fmtEn(s.tail*100,5)}%，曲线不重归一化；力场图放大到 μ±2σ，所有矩与平均力仍使用全实线分布。没有测量、时间步进或非线性薛定谔演化。</p>
 </div>;
}
