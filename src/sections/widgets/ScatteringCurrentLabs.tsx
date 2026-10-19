/** Exact Gaussian continuity and finite-step matching models in scattering-current.mjs.
 * Verified by scripts/verify/probability-current-lab.mjs and step-scattering-lab.mjs.
 * ℏ=m=1, free packet initial Δ=1; step incident amplitude=1, no conditional window normalization.
 */
import {useState} from 'react';
import {Task,Slider,Plot,Verdict,W_BUTTON,FMM_COLORS,fmtEn} from '../../lib';
import {currentPacket,stepScattering} from './scattering-current.mjs';
const labels={neutral:'观察',ok:'守恒核对',warn:'注意边界',fail:'比较预测'};
const f=(x:number)=>fmtEn(x,4),complex=(z:number[])=>`${f(z[0])}${z[1]<0?' − ':' + '}${f(Math.abs(z[1]))}i`;
export function ProbabilityCurrentLab(){
 const[p,setP]=useState(2),[time,setTime]=useState(.5),[center,setCenter]=useState(-2),[guess,setGuess]=useState(''),[reveal,setReveal]=useState(false);
 const s=currentPacket(p,time,center);
 const reset=(momentum:number,x0:number)=>{setP(momentum);setCenter(x0);setTime(0);setReveal(false)};
 return <div><Task>先比较同一密度、相反相位梯度；再让波包通过区间 [−1,1]，核对两端净流与区间概率变化。</Task>
 <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-3"><div><Slider label="平均动量 p₀" value={p} onChange={setP} min={-3} max={3} step={.25} fmt={f}/><Slider label="时间 t" value={time} onChange={setTime} min={0} max={4} step={.1} fmt={f}/><Slider label="初始中心 x₀" value={center} onChange={setCenter} min={-3} max={3} step={.5} fmt={f}/>
 <div className="flex flex-wrap gap-2 my-2"><button className={W_BUTTON} onClick={()=>reset(2,-2)}>从左入射</button><button className={W_BUTTON} onClick={()=>reset(2,0)}>同密度：向右</button><button className={W_BUTTON} onClick={()=>reset(-2,0)}>同密度：向左</button><button className={W_BUTTON} onClick={()=>reset(0,0)}>初始实波包</button><button className={W_BUTTON} disabled={time>=4} onClick={()=>setTime(t=>Math.min(4,Math.round((t+.1)*10)/10))}>前进一步</button></div>
 <p className="text-sm">ℏ=m=1，初始 Δ=1；〈X〉={f(s.mean)}，当前包络宽度={f(s.width)}。固定区间概率 P={f(s.probability)}。</p></div>
 <div className="grid sm:grid-cols-2 gap-3"><Plot width={420} height={300} series={[{f:s.density,color:FMM_COLORS.blau,label:'密度 ρ'}]} xDomain={[-8,8]} yDomain={[0,.6]} xLabel="位置 x（长度单位）" yLabel="ρ（1/长度）" vlines={[{at:-1,dash:[4,3]},{at:1,dash:[4,3]}]} ariaLabel="归一化自由波包的概率密度，虚线为固定区间边界"/>
 <Plot width={420} height={300} series={[{f:s.current,color:FMM_COLORS.orange,label:'流 j'}]} xDomain={[-8,8]} yDomain={[-1.8,1.8]} xLabel="位置 x（长度单位）" yLabel="j（1/时间）" vlines={[{at:-1,dash:[4,3]},{at:1,dash:[4,3]}]} ariaLabel="相位梯度决定的有符号概率流"/></div></div>
 <p className="text-sm">左边界 j(−1)={f(s.left)}，右边界 j(1)={f(s.right)}；dP/dt = j(−1)−j(1)={f(s.derivative)}（1/时间）。右向为正，边界读数为负时表示向左流。</p>
 <label>当前区间概率将怎样变化？ <select value={guess} onChange={e=>{setGuess(e.target.value);setReveal(false)}}><option value="">先预测</option><option value="gaining">增加</option><option value="losing">减少</option><option value="balanced">瞬时不变</option></select></label> <button className={W_BUTTON} disabled={!guess} onClick={()=>setReveal(true)}>核对净流</button>
 <Verdict labels={labels} kind={reveal&&guess!==(s.branch==='no-current'?'balanced':s.branch)?'fail':'ok'}>{s.branch==='no-current'?'初始波函数为实包络，j 处处为零；随后自由展宽会产生非零局部流。':s.branch==='gaining'?'两端净流使区间内概率增加。':s.branch==='losing'?'两端净流使区间内概率减少。':'此时两端流量相等，区间概率瞬时不变；这不要求流本身为零。'} 总概率始终为一，显示窗外的尾部没有重新归一化。</Verdict>
 </div>;
}
export function StepScatteringLab(){
 const[e,setE]=useState(20),[v,setV]=useState(10),[view,setView]=useState('density'),[guess,setGuess]=useState(''),[reveal,setReveal]=useState(false),s=stepScattering(e,v);
 const preset=(ee:number,vv:number)=>{setE(ee);setV(vv);setReveal(false)};
 const expected=s.branch==='propagating'?'flow':'no-flow';
 return <div><Task>预测右侧能否承载稳态透射流；跨过 E=V₀，再比较密度尾部、匹配条件与 R+T。</Task>
 <div className="grid md:grid-cols-2 gap-3"><div><Slider label="入射能量 E" value={e/10} onChange={x=>setE(Math.round(x*100)/10)} min={.5} max={4} step={.01} fmt={f}/><Slider label="右侧势能 V₀" value={v/10} onChange={x=>setV(Math.round(x*10))} min={-2} max={3} step={.1} fmt={f}/>
 <div className="flex flex-wrap gap-2 my-2"><button className={W_BUTTON} onClick={()=>preset(20,10)}>上阶：E&gt;V₀</button><button className={W_BUTTON} onClick={()=>preset(5,10)}>低于上阶</button><button className={W_BUTTON} onClick={()=>preset(10,10)}>恰在阈值</button><button className={W_BUTTON} onClick={()=>preset(20,-10)}>下阶</button><button className={W_BUTTON} onClick={()=>preset(20,0)}>无势阶</button></div>
 <div className="flex flex-wrap gap-2 my-2"><button className={W_BUTTON} onClick={()=>preset(9.9,10)}>接近：E=0.99</button><button className={W_BUTTON} onClick={()=>preset(10.1,10)}>接近：E=1.01</button></div>
 <label>显示 <select value={view} onChange={ev=>setView(ev.target.value)}><option value="density">概率密度</option><option value="wave">波函数实部与虚部</option></select></label>
 <p className="text-sm">ℏ=m=1，入射振幅 A=1。E={f(s.energy)}，V₀={f(s.potential)}（能量单位）；k₁={f(s.k)}，{s.branch==='evanescent'?`κ=${f(s.kappa)}`:`k₂=${f(s.q)}`}（1/长度）。</p></div>
 <div><svg viewBox="0 0 460 110" width="460" height="110" className="w-full h-auto" role="img" aria-label="势阶与能量示意；左侧势能零，右侧势能为V零"><path d={`M30 65H225V${65-s.potential*12}H435`} fill="none" stroke={FMM_COLORS.orange} strokeWidth="2"/><path d={`M30 ${65-s.energy*12}H435`} stroke={FMM_COLORS.blau} strokeDasharray="5 3"/><g fill="var(--w-text)" fontSize="12"><text x="8" y="15">能量</text><text x="35" y="101">x&lt;0：V=0</text><text x="270" y="101">x&gt;0：V=V₀</text><text x="435" y="15">E</text><text x="220" y="101">0</text></g></svg>
 <Plot width={460} height={260} series={view==='density'?[{f:s.density,color:FMM_COLORS.blau,label:'|ψ|²'}]:[{f:x=>s.wave(x)[0],color:FMM_COLORS.blau,label:'Re ψ'},{f:x=>s.wave(x)[1],color:FMM_COLORS.orange,label:'Im ψ'}]} xDomain={[-6,6]} yDomain={view==='density'?[0,4.2]:[-2.1,2.1]} xLabel="位置 x（长度单位）" yLabel={view==='density'?'相对密度 |ψ|²':'相对振幅'} vlines={[{at:0,dash:[4,3]}]} ariaLabel="势阶两侧的精确散射波函数；右侧可能传播或指数衰减"/></div></div>
 <p className="text-sm">r=B/A={complex(s.r)}，t=C/A={complex(s.t)}。R={f(s.R)}，T={f(s.T)}，R+T={f(s.R+s.T)}。入射 jᵢ={f(s.incidentCurrent)}，反射 jᵣ={f(s.reflectedCurrent)}，透射 jₜ={f(s.transmittedCurrent)}。ψ(0−)=ψ(0+)={complex(s.wave(0))}，ψ′(0−)=ψ′(0+)={complex(s.gradient(0))}。</p>
 <label>右侧稳态透射流？ <select value={guess} onChange={ev=>{setGuess(ev.target.value);setReveal(false)}}><option value="">先预测</option><option value="flow">非零</option><option value="no-flow">为零</option></select></label> <button className={W_BUTTON} disabled={!guess} onClick={()=>setReveal(true)}>比较预测</button>
 <Verdict labels={labels} kind={reveal&&guess!==expected?'fail':s.branch==='propagating'?'ok':'warn'}>{s.branch==='propagating'?'右侧存在传播波，T=(k₂/k₁)|t|²；即使走下阶也通常有反射。':s.branch==='threshold'?'恰有 E=V₀：右侧有界解是常数，密度非零但导数与流为零，R=1、T=0。':'右侧保留衰减尾部，密度非零而稳态流为零，R=1、T=0。这是半无限势阶，不是有限势垒后的隧穿流。'} 曲线是 A=1 的稳态散射解，不是全实轴归一化波包；没有按图窗作条件归一化。</Verdict>
 </div>;
}
export function ScatteringPacketSketch(){
 const curve=(center:number,baseline:number,height:number)=>Array.from({length:101},(_,i)=>{const x=center-65+i*1.3,y=baseline-height*Math.exp(-(((x-center)/23)**2));return `${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`}).join(' ');
 return <figure><svg viewBox="0 0 560 220" width="560" height="220" className="w-full h-auto" role="img" aria-label="入射前的一个波包与散射后的反射、透射波包；示意不按比例，晚时面积分别为R和T">
 <g fill="none" stroke="var(--w-axis)"><path d="M20 83H280V40H540M20 183H280V140H540"/></g>
 <path d={curve(105,83,44)} fill="none" stroke={FMM_COLORS.blau} strokeWidth="2"/><path d={curve(105,183,28)} fill="none" stroke={FMM_COLORS.orange} strokeWidth="2"/><path d={curve(425,183,42)} fill="none" stroke={FMM_COLORS.gruen} strokeWidth="2"/>
 <g fill="var(--w-text)" fontSize="13"><text x="20" y="18">入射前：总面积 1</text><text x="148" y="52">→</text><text x="20" y="119">很晚以后：两个包分离</text><text x="52" y="146">← 反射</text><text x="385" y="122">透射 →</text><text x="72" y="204">密度面积 R</text><text x="393" y="204">密度面积 T</text><text x="282" y="99">x=0</text><text x="520" y="204">x</text></g></svg>
 <figcaption className="text-xs">参考 Shankar 本节散射波包示意重绘。密度高度、宽度与势阶不按比例；它只说明晚时的面积定义，不是数值演化快照。</figcaption></figure>;
}
