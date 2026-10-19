/** Deterministic, analytic ensemble probabilities; no simulated random events.
 * Checks: scripts/verify/compatible-filter-lab.mjs,
 * scripts/verify/phase-ensemble-lab.mjs, scripts/verify/gaussian-packet-lab.mjs.
 */
import { useState } from 'react';
import {Task,Verdict,Slider,Plot,W_BUTTON,FMM_COLORS,fmtEn} from '../../lib';
import {filterSequence,phaseEnsemble,gaussianPacket} from './postulate-late.mjs';
const labels={ok:'判读',warn:'注意',neutral:'比较',fail:'不成立'};
const f=(x:number)=>fmtEn(x,3),pct=(x:number)=>`${fmtEn(100*x,1)}%`;
export function CompatibleFilterLab(){
 const [angle,setAngle]=useState(45),[inserted,setInserted]=useState(true),r=filterSequence(angle,inserted);
 return <div className="space-y-2"><Task>初态为 A 的 0 本征态。先预测：插入 B 测量且保留全部结果，最后测 A 还一定得到 0 吗？</Task>
 <div className="flex flex-wrap gap-2">{[0,45,90].map(a=><button className={W_BUTTON} type="button" key={a} onClick={()=>{setAngle(a);setInserted(true);}}>重置 θ = {a}°</button>)}<button className={W_BUTTON} type="button" aria-pressed={!inserted} onClick={()=>setInserted(v=>!v)}>{inserted?'移除中间测量':'插入中间测量'}</button></div>
 <Slider label="B 基底角 θ" min={0} max={90} step={1} value={angle} onChange={setAngle} fmt={v=>`${v}°`}/>
 <svg viewBox="0 0 660 235" width="660" height="235" className="w-full h-auto" role="img" aria-label="连续测量概率树，各路径概率包括第一次分支权重">
 <g fill="none" stroke="var(--w-grid-strong)" strokeWidth="2"><path d="M85 112L270 55L480 40M270 55L480 90M85 112L270 170L480 150M270 170L480 200"/></g>
 <g fill="var(--w-text)" fontSize="14"><text x="10" y="110">初态 |0〉</text><text x="195" y="35">{inserted?'B+':'无中间测量'}：{pct(r.first[0])}</text><text x="195" y="194">B−：{pct(r.first[1])}</text>
 {[[0,0,40],[0,1,90],[1,0,150],[1,1,200]].map(([j,k,y])=><text key={`${j}${k}`} x="485" y={y+5}>A={k}：{pct(r.paths[j][k])}</text>)}
 <text x="10" y="228" fontSize="12">末端数字是完整路径的联合概率；未把 B− 支路丢弃。</text></g></svg>
 <p className="text-sm">A = diag(0, 1)；|b+〉= cos θ |0〉+ sin θ |1〉，|b−〉= −sin θ |0〉+ cos θ |1〉。末次 P(A=0) = {pct(r.returnProbability)}。</p>
 <Verdict labels={labels} kind={r.branch==='compatible'||r.branch==='absent'?'ok':'warn'}>{r.branch==='absent'?'没有中间测量，同一理想测量立即重复必然复现。':r.branch==='compatible'?'此角度的 B 只是 A 本征方向的保留或交换，两个算符对易，A 的确定值保持。':r.branch==='maximal'?'B 基底与 A 基底等倾：两条支路都可能，末次 A=0 与 A=1 各占一半。':'B 测量把初态投影到另一组方向；对全部支路求和得到 cos⁴θ + sin⁴θ，通常小于 1。'}</Verdict>
 <p className="text-xs">抽象二态理想投影模型，B 两个本征值取 ±1；无时间演化、没有随机采样。θ 在 0° 或 90° 时恰好对易，邻近角度仍属非对易。</p></div>;
}
export function PhaseEnsembleLab(){
 const [weight,setWeight]=useState(.5),[phase,setPhase]=useState(0),[theta,setTheta]=useState(45),[mode,setMode]=useState<'pure'|'mixed'>('pure'),[global,setGlobal]=useState(0);
 const r=phaseEnsemble(weight,phase,theta,mode),reset=(m:'pure'|'mixed')=>{setMode(m);setWeight(.5);setPhase(0);setTheta(45);setGlobal(0);};
 return <div className="space-y-2"><Task>保持两种制备的 0/1 概率相同，改变相对相位，再换测量基底，找出能区分它们的读数。</Task>
 <div className="flex flex-wrap gap-2"><button className={W_BUTTON} type="button" onClick={()=>reset('pure')}>重置为相干纯态</button><button className={W_BUTTON} type="button" onClick={()=>reset('mixed')}>重置为统计混合</button><button className={W_BUTTON} type="button" onClick={()=>setGlobal(v=>(v+1)%4)}>整体相位再加 π/2</button></div>
 <Slider label="0 态权重 w" min={0} max={1} step={.05} value={weight} onChange={setWeight} fmt={f}/><Slider label="相对相位 φ/π" min={-1} max={1} step={.05} value={phase} onChange={setPhase} fmt={f}/><Slider label="分析基底 θ" min={0} max={90} step={1} value={theta} onChange={setTheta} fmt={v=>`${v}°`}/>
 <Plot width={620} height={220} xDomain={[-1,1]} yDomain={[-.05,1.05]} xLabel="相对相位 φ/π" yLabel="P(b+)" ariaLabel="纯态随相位变化的测量概率与混合态的恒定概率" series={[{f:x=>phaseEnsemble(weight,x,theta,'pure').plus,label:'纯态',color:FMM_COLORS.blau},{f:x=>phaseEnsemble(weight,x,theta,'mixed').plus,label:'混合态',color:FMM_COLORS.orange,dash:[5,4]}]} markers={[{x:phase,y:r.plus,color:FMM_COLORS.gruen}]}/>
 <p className="text-sm">当前：{mode==='pure'?'纯态':'混合态'}；w = {f(weight)}，φ = {f(phase)}π，θ = {theta}°，整体相位 = {global}π/2。ρ = [[{f(weight)}, {f(r.re)} {r.im<0?'−':'+'} {f(Math.abs(r.im))}i], [{f(r.re)} {r.im>0?'−':'+'} {f(Math.abs(r.im))}i, {f(1-weight)}]]。</p>
 <p className="text-sm">P(b+) = {pct(r.plus)}，P(b−) = {pct(r.minus)}；Tr(ρ²) = {f(r.purity)}。两种制备的 P(0) 始终 = {pct(weight)}。</p>
 <Verdict labels={labels} kind={r.branch==='endpoint'?'warn':'ok'}>{r.branch==='endpoint'?'权重端点只剩一个基态，这时所谓混合制备也为纯态，不能用此端点对比相干性。':r.branch==='mixed'?'混合态的两种制备没有固定相对相位，非对角元为零；移动 φ 不改变它的预测。':'纯态非对角元保留相对相位；倾斜基底可使概率对 φ 敏感，但某个相位仍可能恰好给出与混合态相同的读数。θ=0° 或 90° 时，对所有 φ 都读不出差别。'} 整体相位在 |ψ〉〈ψ| 中抵消，不改变任何读数。</Verdict>
 <p className="text-xs">有限二态模型。纯态为 e^(iχ)[√w |0〉+e^(iφ)√(1−w)|1〉]；混合制备以概率 w 或 1−w 准备相应基态。本实验只扫描实旋转的测量基；例如 φ=π/2 时，所有这些实方向都与混合态读数相同，若要区分须再选含复相位的分析基。曲线是精确概率，无随机抽样。</p></div>;
}
export function GaussianPacketLab(){
 const [width,setWidth]=useState(1),[center,setCenter]=useState(0),[momentum,setMomentum]=useState(0),r=gaussianPacket(width,center,momentum);
 const reset=(d:number)=>{setWidth(d);setCenter(0);setMomentum(0);};
 return <div className="space-y-2"><Task>先预测宽度 Δ 减半会怎样，再比较位置、动量两个分布及固定区间内的概率。</Task>
 <div className="flex flex-wrap gap-2">{[.5,1,2].map(d=><button type="button" className={W_BUTTON} key={d} onClick={()=>reset(d)}>重置 Δ = {d}</button>)}</div>
 <Slider label="波函数宽度 Δ" min={.35} max={2} step={.05} value={width} onChange={setWidth} fmt={f}/><Slider label="位置中心 a" min={-2} max={2} step={.1} value={center} onChange={setCenter} fmt={f}/><Slider label="平均动量 p₀" min={-2} max={2} step={.1} value={momentum} onChange={setMomentum} fmt={f}/>
 <div className="grid md:grid-cols-2 gap-2"><Plot width={380} height={235} xDomain={[-8,8]} yDomain={[-.04,1.8]} xLabel="位置 x" yLabel="|ψ(x)|²" ariaLabel="位置概率密度与固定区间负一到一的边界" series={[{f:r.xDensity,color:FMM_COLORS.blau},{f:x=>Math.abs(x)<=1?r.xDensity(x):NaN,color:FMM_COLORS.blau,fill:true}]} vlines={[{at:-1,dash:[4,3]},{at:1,dash:[4,3]}]}/><Plot width={380} height={235} xDomain={[-10,10]} yDomain={[-.04,1.3]} xLabel="动量 p" yLabel="|ψ̃(p)|²" ariaLabel="动量概率密度与固定区间负一到一的边界" series={[{f:r.pDensity,color:FMM_COLORS.orange},{f:p=>Math.abs(p)<=1?r.pDensity(p):NaN,color:FMM_COLORS.orange,fill:true}]} vlines={[{at:-1,dash:[4,3]},{at:1,dash:[4,3]}]}/></div>
 <p className="text-sm">〈X〉= {f(center)}，σₓ = ΔX = {f(r.sigmaX)}；〈P〉= {f(momentum)}，σₚ = ΔP = {f(r.sigmaP)}；σₓσₚ = {f(r.sigmaX*r.sigmaP)}。P(−1 ≤ x ≤ 1) = {pct(r.xInterval)}，P(−1 ≤ p ≤ 1) = {pct(r.pInterval)}。</p>
 <Verdict labels={labels} kind="ok">{r.branch==='localized'?'位置包络收窄，傅里叶变换需要更宽的动量范围。':r.branch==='momentum-sharp'?'位置包络展宽，动量分布收窄。':'当前 Δ=1，在选定无量纲单位中两种标准差相等。'} 这是同一制备态的分布宽度，不是仪器误差；移动中心只平移分布，不改标准差。</Verdict>
 <p className="text-xs">取 ℏ=1 的无量纲单位。全实轴归一化，图窗仅显示其中一段，未重新归一化：位置图内 {pct(r.xVisible)}，动量图内 {pct(r.pVisible)}。虚线标固定积分区间，浅色填充仅标这个区间下的概率面积。按原书 Gaussian 图意重画；本图画密度而非原图的振幅模。</p></div>;
}
export function MicroscopeSketch(){
 return <svg viewBox="0 0 600 235" width="600" height="235" className="w-full h-auto" role="img" aria-label="显微镜思想实验示意：电子散射光进入有限角孔径，收集到的光子方向不唯一">
 <rect x="225" y="20" width="90" height="45" rx="5" fill="var(--w-bg)" stroke="var(--w-axis)"/>
 <path d="M205 85Q270 65 335 85Q270 105 205 85Z" fill="var(--w-bg)" stroke="var(--w-axis)"/>
 <path d="M270 185L208 88M270 185L332 88" fill="none" stroke={FMM_COLORS.orange} strokeWidth="2"/>
 <path d="M270 185V90M100 185H440" stroke="var(--w-axis)" strokeDasharray="5 4"/>
 <circle cx="270" cy="185" r="5" fill={FMM_COLORS.blau}/>
 <path d="M270 225V199M265 207L270 199L275 207" stroke={FMM_COLORS.gruen} fill="none" strokeWidth="2"/>
 <path d="M270 143Q255 144 249 152" fill="none" stroke="var(--w-axis)"/>
 <g fill="var(--w-text)" fontSize="14"><text x="340" y="48">收集并成像</text><text x="345" y="91">物镜有限孔径</text><text x="213" y="143">δθ</text><text x="290" y="206">电子 e⁻</text><text x="282" y="228">入射光 λ</text><text x="455" y="189">x</text><text x="14" y="29">示意不按比例</text></g>
 </svg>;
}
