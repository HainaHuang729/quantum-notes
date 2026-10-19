/** SI minimum-uncertainty Gaussian/free spreading and photon momentum scales.
 * Checked: scripts/verify/classical-scale-lab.mjs. No microscopic apparatus model.
 * Two logarithmic controls; fixed observation choices; no timers or randomness.
 */
import {useState} from 'react';
import {Slider,Task,Verdict,W_BUTTON,FMM_COLORS,fmtEn} from '../../lib';
import {SCALE_H,SCALE_HBAR,SCALE_YEAR,SCALE_PRESETS,scaleMinLogWidth,classicalScale} from './classical-scale.mjs';
const sci=(x:number)=>x===0?'0':x.toExponential(3).replace('e+',' × 10^').replace('e-',' × 10^−');
const labels={neutral:'观察',ok:'尺度比较',warn:'制备很重要',fail:'重新比较'};
export function ClassicalScaleLab(){
 const[m,setM]=useState(-3),[d,setD]=useState(-15),[time,setTime]=useState(1),[prediction,setPrediction]=useState(''),[reveal,setReveal]=useState(false);
 const s=classicalScale(m,d,time),minD=scaleMinLogWidth(m);
 const preset=(mass:number,width:number)=>{setM(mass);setD(width);setTime(1);setReveal(false)};
 const px=(n:number)=>105+(n+31)/46*405;
 return <div><Task>固定质量，把准备宽度压窄，预测速度散布和展宽；再用轻粒子与 1 g 物体作对照。</Task>
 <div className="grid md:grid-cols-2 gap-3"><div>
 <Slider label="质量指数" value={m} onChange={v=>{setM(v);setD(x=>Math.max(x,scaleMinLogWidth(v)));setReveal(false)}} min={-30} max={0} step={.25} fmt={v=>fmtEn(v,2)}/>
 <Slider label="宽度指数" value={d} onChange={v=>{setD(v);setReveal(false)}} min={minD} max={-2} step={.25} fmt={v=>fmtEn(v,3)}/>
 <div className="flex flex-wrap gap-2 my-2">{SCALE_PRESETS.map(p=><button key={p.id} className={W_BUTTON} onClick={()=>preset(p.logMass,p.logWidth)}>{p.label}</button>)}</div>
 <div className="flex flex-wrap gap-2 my-2"><button className={W_BUTTON} aria-pressed={time===1} onClick={()=>setTime(1)}>观察 1 s</button><button className={W_BUTTON} aria-pressed={time===SCALE_YEAR} onClick={()=>setTime(SCALE_YEAR)}>观察 1 年</button></div>
 <p className="text-xs">质量 m = 10^指数 kg，宽度 Δ = 10^指数 m；每步改变四分之一个数量级。本实验比较 σᵥ ≤ 0.01c 的非相对论准备，宽度下限随质量调整；这个范围不是经典极限的普适边界。</p>
 </div><div>
 <svg viewBox="0 0 560 205" width="560" height="205" className="w-full h-auto" role="img" aria-label="固定对数尺度比较初始位置标准差、观察后的标准差与一毫米；长度单位为米">
 {[-30,-20,-10,0,10].map(n=><g key={n}><path d={`M${px(n)} 24V154`} stroke="var(--w-grid)"/><text x={px(n)} y="174" textAnchor="middle" fontSize="11" fill="var(--w-muted)">{n}</text></g>)}
 {s.lengthLogs.map((n,i)=><g key={i}><text x="97" y={49+i*43} textAnchor="end" fontSize="12" fill="var(--w-text)">{['初始 σₓ','观察后 σₓ','1 mm'][i]}</text><path d={`M105 ${45+i*43}H${px(n)}`} stroke={[FMM_COLORS.blau,FMM_COLORS.orange,FMM_COLORS.gruen][i]} strokeWidth="5"/><circle cx={px(n)} cy={45+i*43} r="4" fill={[FMM_COLORS.blau,FMM_COLORS.orange,FMM_COLORS.gruen][i]}/></g>)}
 <text x="310" y="198" textAnchor="middle" fontSize="12" fill="var(--w-text)">长度指数 n（实际长度 = 10ⁿ m）</text></svg>
 <p className="text-sm">m = {sci(s.mass)} kg；Δ = {sci(s.width)} m；观察 t = {sci(time)} s。</p>
 </div></div>
 <div className="grid md:grid-cols-2 gap-2 text-sm"><p>σₓ(0) = {sci(s.sigmaX)} m<br/>σₚ = {sci(s.sigmaP)} kg·m/s<br/>σᵥ = {sci(s.sigmaV)} m/s<br/>σₓ(t) = {sci(s.sigmaXT)} m</p><p>达到 1 mm 标准差：{s.targetTime===0?'初始已经达到':`${sci(s.targetTime)} s（${sci(s.targetTime/SCALE_YEAR)} 年）`}<br/>选择 λ=Δ 时：<br/>光子动量 h/λ = {sci(s.photonMomentum)} kg·m/s<br/>速度尺度 h/(mλ) = {sci(s.photonVelocity)} m/s</p></div>
 <label>按当前准备与观察时长，位置标准差达到 1 mm 了吗？ <select value={prediction} onChange={e=>{setPrediction(e.target.value);setReveal(false)}}><option value="">先预测</option><option value="yes">已达到</option><option value="no">尚未达到</option></select></label> <button className={W_BUTTON} disabled={!prediction} onClick={()=>setReveal(true)}>比较尺度</button>
 <Verdict labels={labels} kind={reveal&&prediction!==(s.branch==='not-yet'?'no':'yes')?'fail':s.branch==='not-yet'?'ok':'warn'}>{s.branch==='already-wide'?'初始位置标准差已经超过所选 1 mm 参照，质量大也不能让这个初态自动变窄。':s.branch==='reached'?'自由展宽在当前观察时间已达到 1 mm；同一质量下，更窄的初始准备可能带来更大的速度散布。':'当前观察时间内还未达到 1 mm；这只是针对该准备、该时间与该长度参照的比较。'} 光子动量是对照尺度，实际反冲取决于散射方向与装置，不能把 h/λ 当作每次定位的必然动量改变。</Verdict>
 <p className="text-xs">采用 SI：h = {sci(SCALE_H)} J·s（SI 定义值），ℏ = h/(2π) ≈ {sci(SCALE_HBAR)} J·s；1 年取 365.25 日。Gaussian 的 Δ 是包络参数，σₓ=Δ/√2；时间公式仅用于无位置—动量初始相关的自由 Gaussian。这里只选择 λ=Δ 作数量级对照，未模拟显微镜的分辨率或完整测量过程；束缚势中的展宽另论。</p>
 </div>;
}
