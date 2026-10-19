/** Exact examples checked by scripts/verify/boundary-visual.mjs,
 * gaussian-square-visual.mjs and classical-oscillator-visual.mjs. No timers.
 */
import { useState } from 'react';
import { Plot, Slider, Task, Verdict, W_BUTTON, FMM_COLORS, fmtEn } from '../../lib';
import { boundaryComparison, gaussianSquareMoment, classicalOscillatorVisual } from './bound-classical-visual.mjs';
const f = (n:number) => fmtEn(n, 3);
const labels = { neutral:'比较', ok:'解析关系', warn:'边界条件不同', fail:'不成立' };

export function BoundBoundaryVisualGuide() {
  const [mode, setMode] = useState<'bound'|'free'>('bound');
  const [k, setK] = useState(2), [scale, setScale] = useState(1.5), [fraction, setFraction] = useState(0);
  const x = fraction * (mode === 'bound' ? .5 : 2), s = boundaryComparison(mode,k,scale,x);
  return <figure className="space-y-3" data-visual-guide="bound-boundary">
    <Task>切换边界条件，再移动检查位置：Wronskian 为常数，为什么不一定为零？</Task>
    <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-3 items-start"><div>
      <div className="flex flex-wrap gap-2"><button type="button" className={W_BUTTON} aria-pressed={mode==='bound'} onClick={()=>setMode('bound')}>居中箱束缚解</button><button type="button" className={W_BUTTON} aria-pressed={mode==='free'} onClick={()=>setMode('free')}>全直线自由解</button></div>
      {mode==='bound' ? <Slider label="比例系数 c" min={.5} max={2} step={.1} value={scale} onChange={setScale} fmt={f}/> : <Slider label="波数 kℓ" min={.5} max={3} step={.1} value={k} onChange={setK} fmt={f}/>}
      <Slider label="检查位置 u" min={-1} max={1} step={.05} value={fraction} onChange={setFraction} fmt={()=>f(x)}/>
      <button type="button" className={W_BUTTON} onClick={()=>{setMode('bound');setScale(1.5);setK(2);setFraction(0);}}>重置边界对照</button>
    </div><Plot width={520} height={270} xDomain={s.domain} yDomain={[-2.2,2.2]} xLabel="无量纲位置 u=x/ℓ" yLabel="解的振幅" series={[{f:s.first,label:'ψ₁',color:FMM_COLORS.blau},{f:s.second,label:'ψ₂',color:FMM_COLORS.orange,dash:[5,3]}]} vlines={mode==='bound'?[{at:-.5,label:'左壁'},{at:.5,label:'右壁'}]:[]} markers={[{x,y:s.firstValue,color:FMM_COLORS.blau},{x,y:s.secondValue,color:FMM_COLORS.orange}]} ariaLabel="束缚箱中两条成比例解与全直线自由粒子两条独立解的边界对照，点为检查位置"/></div>
    <p className="text-sm tabular-nums" aria-live="polite">u={f(x)}；ψ₁={f(s.firstValue)}，ψ₂={f(s.secondValue)}；dψ₁/du={f(s.firstSlope)}，dψ₂/du={f(s.secondSlope)}。Wᵤ=ψ₁ψ₂′−ψ₂ψ₁′={f(s.wronskian)}。</p>
    <Verdict labels={labels} kind={mode==='bound'?'ok':'warn'}>{mode==='bound'?'ψ₁=cos(πu)，ψ₂=cψ₁，两端共同为零，Wᵤ=0；改变比例没有产生新的态方向。':'ψ₁=cos[(kℓ)u]，ψ₂=sin[(kℓ)u]，是左右行波的实线性组合；Wᵤ=kℓ≠0。全直线解不在无穷远衰减，束缚态边界论证不能套用。'}</Verdict>
    <figcaption className="text-xs">箱长为 ℓ，箱内 kℓ=π；自由解使用同一长度单位 ℓ，图窗边缘不是墙。图中自由解换成实的 cos/sin 基，Wᵤ=kℓ；正文行波基的 W 则为 −2ik，非零结论相同。两解未分别归一化；自由解在全实线上不可平方归一。固定 ℏ²/(2mℓ²) 为能量单位，箱内 E=π²，自由 E=(kℓ)²。这里画的是两个精确例子，不是一般无简并定理的数值证明。</figcaption>
  </figure>;
}

export function GaussianSquareVisualGuide() {
  const [mu,setMu] = useState(1), [delta,setDelta] = useState(1), s = gaussianSquareMoment(mu,delta);
  const preset=(a:number,d:number)=>{setMu(a);setDelta(d);};
  return <figure className="space-y-3" data-visual-guide="gaussian-square">
    <Task>先平移分布，再缩窄它：中心的平方与位置平方的平均，哪一项只由宽度决定？</Task>
    <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-3 items-start"><div>
      <div className="flex flex-wrap gap-2"><button type="button" className={W_BUTTON} onClick={()=>preset(0,1.4)}>原点宽态</button><button type="button" className={W_BUTTON} onClick={()=>preset(1.5,1.4)}>平移同宽</button><button type="button" className={W_BUTTON} onClick={()=>preset(1.5,.4)}>较窄准备</button></div>
      <Slider label="中心 a/ℓ" value={mu} min={-2} max={2} step={.1} onChange={setMu} fmt={f}/><Slider label="宽度 Δ/ℓ" value={delta} min={.4} max={2} step={.1} onChange={setDelta} fmt={f}/><button type="button" className={W_BUTTON} onClick={()=>preset(1,1)}>重置平方均值</button>
    </div><div className="grid sm:grid-cols-2 gap-3">
      <Plot width={420} height={270} xDomain={s.domain} yDomain={[0,s.densityTop]} xLabel="无量纲位置 u=x/ℓ" yLabel="密度 ρᵤ(u)" series={[{f:s.density,label:'ρᵤ',color:FMM_COLORS.blau,fill:true}]} vlines={[{at:mu,label:'a/ℓ',color:FMM_COLORS.gruen}]} ariaLabel="归一化高斯密度，绿色竖线标出均值；横轴固定负八至八，纵轴固定，平移和缩窄的变化保留实际比例"/>
      <Plot width={420} height={270} xDomain={s.domain} yDomain={[0,s.weightedTop]} xLabel="无量纲位置 u=x/ℓ" yLabel="(u−a/ℓ)²ρᵤ(u)" series={[{f:s.weighted,label:'权重',color:FMM_COLORS.orange,fill:true}]} vlines={[{at:mu,color:FMM_COLORS.gruen}]} ariaLabel="平方偏差乘概率密度，整条曲线的面积等于位置方差除以长度单位平方"/>
    </div></div>
    <p className="text-sm tabular-nums" aria-live="polite">⟨X⟩²/ℓ²={f(mu*mu)}；Var(X)/ℓ²=Δ²/(2ℓ²)={f(s.variance)}；⟨X²⟩/ℓ²={f(s.second)}。标准差 σₓ/ℓ={f(s.sigma)}。</p>
    <Verdict labels={labels} kind="ok">{mu===0?'中心恰在原点，⟨X⟩²=0，但橙色面积仍为正；把整个态替换成中心点，会漏掉这一项。':'平移只改变中心平方；保持 Δ 不变时，橙色曲线整体平移、全轴面积保持不变。'} 缩窄 Δ 才会减小两种平均之间的差。</Verdict>
    <figcaption className="text-xs">静态 Gaussian，ρᵤ=exp[−(u−a/ℓ)²/(Δ/ℓ)²]/[√π(Δ/ℓ)]。右图为积分权重，不是另一种概率密度。两图横轴固定 u∈[−8,8]，纵轴也固定，平移和宽窄可直接比较。读数来自全实线解析积分；图窗未画出的尾部仍计入读数，曲线不在窗内重新归一。没有模拟测量或后续时间演化。</figcaption>
  </figure>;
}

export function ClassicalOscillatorVisualGuide() {
  const [amplitude,setAmplitude] = useState(1), [omega,setOmega] = useState(1), [degrees,setDegrees] = useState(0);
  const s = classicalOscillatorVisual(amplitude,omega,degrees), px=270+90*s.x, tip=px+28*s.velocity;
  const energyTop=Math.max(.1,1.12*s.energy);
  const phasePreset=(d:number)=>{setAmplitude(1);setOmega(1);setDegrees(d);};
  return <figure className="space-y-3" data-visual-guide="classical-oscillator">
    <Task>走过半个周期：看速度如何变号，并检查损失的势能去了哪里。把振幅归零，再比较相图。</Task>
    <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-3 items-start"><div>
      <div className="flex flex-wrap gap-2"><button type="button" className={W_BUTTON} onClick={()=>phasePreset(0)}>右转向点</button><button type="button" className={W_BUTTON} onClick={()=>phasePreset(90)}>向左过中心</button><button type="button" className={W_BUTTON} onClick={()=>phasePreset(270)}>向右过中心</button><button type="button" className={W_BUTTON} onClick={()=>{setAmplitude(0);setDegrees(0);}}>静止原点</button></div>
      <Slider label="振幅 A/ℓ" value={amplitude} min={0} max={2} step={.1} onChange={setAmplitude} fmt={f}/><Slider label="角频率 ωt₀" value={omega} min={.5} max={2} step={.1} onChange={setOmega} fmt={f}/><Slider label="时间相位 ωt" value={degrees} min={0} max={360} step={15} onChange={setDegrees} fmt={v=>`${v}°`}/>
      <div className="flex flex-wrap gap-2"><button type="button" className={W_BUTTON} disabled={degrees===360} onClick={()=>setDegrees(d=>Math.min(360,d+15))}>前进十五度</button><button type="button" className={W_BUTTON} onClick={()=>phasePreset(0)}>重置振子图</button></div>
    </div><div className="space-y-3">
      <svg viewBox="0 0 540 125" width="540" height="125" className="w-full h-auto" role="img" aria-label="经典振子在一维轨道上的位置，蓝点是物体，橙色线段的方向与长度表示带符号速度">
        <path d="M45 75H495M270 62V88" fill="none" stroke="var(--w-axis)"/>
        {[-2,-1,0,1,2].map(v=><g key={v} fill="var(--w-muted)" fontSize="12"><path d={`M${270+90*v} 72v6`} stroke="var(--w-axis)"/><text x={270+90*v} y="100" textAnchor="middle">{v}</text></g>)}
        <circle cx={px} cy="75" r="9" fill={FMM_COLORS.blau}/><path d={`M${px} 43H${tip}`} stroke={FMM_COLORS.orange} strokeWidth="3"/>
        {Math.abs(s.velocity)>1e-10&&<path d={`M${tip-(s.velocity>0?6:-6)} 38L${tip} 43L${tip-(s.velocity>0?6:-6)} 48`} stroke={FMM_COLORS.orange} strokeWidth="2" fill="none"/>}
        <g fill="var(--w-text)" fontSize="12"><text x="25" y="19">蓝点：位置；橙箭：速度（独立比例）</text><text x="470" y="119">x/ℓ</text></g>
      </svg>
      <div className="grid sm:grid-cols-2 gap-3"><Plot width={420} height={275} xDomain={[-2.25,2.25]} yDomain={[-4.5,4.5]} xLabel="位置 x/ℓ" yLabel="速度 vt₀/ℓ" series={[]} polylines={amplitude===0?[]:[{pts:s.orbit,label:'轨道',color:FMM_COLORS.blau}]} points={[{x:s.x,y:s.velocity,color:FMM_COLORS.orange,r:5}]} ariaLabel="经典位置速度相图，蓝色椭圆为完整轨道，橙点为所选时刻；振幅为零时退化为原点"/>
      <Plot width={420} height={275} xDomain={[0,2]} yDomain={[0,energyTop]} xLabel="时间相位 ωt/π" yLabel="能量 / E₀" series={[{f:q=>s.energy*Math.cos(Math.PI*q)**2,label:'势 V',color:FMM_COLORS.blau},{f:q=>s.energy*Math.sin(Math.PI*q)**2,label:'动 T',color:FMM_COLORS.orange,dash:[5,3]}]} hlines={[{at:s.energy,label:'总 E',color:FMM_COLORS.gruen}]} vlines={[{at:degrees/180,color:'var(--w-muted)'}]} points={[{x:degrees/180,y:s.potential,color:FMM_COLORS.blau},{x:degrees/180,y:s.kinetic,color:FMM_COLORS.orange}]} ariaLabel="经典振子的势能与动能随相位互相转化，绿色总能量水平线始终不变；能量轴随振幅自动缩放，请比较数值"/></div>
    </div></div>
    <p className="text-sm tabular-nums" aria-live="polite">m/m₀=1，A/ℓ={f(amplitude)}，ωt₀={f(omega)}；t/t₀={f(s.time)}，周期/t₀={f(s.period)}。x/ℓ={f(s.x)}，vt₀/ℓ={f(s.velocity)}；V/E₀={f(s.potential)}，T/E₀={f(s.kinetic)}，E/E₀={f(s.energy)}。</p>
    <Verdict labels={labels} kind={amplitude===0?'neutral':'ok'}>{s.branch==='rest'?'A=0，位置、速度和能量均为零，相图缩成一点。':s.branch==='turning'?'此时在转向点，速度为零，能量全部为势能；回复力使物体随后反向。':s.branch==='center'?'此时经过中心，势能为零、动能最大；负速度向左，正速度向右。':'相图上同一位置通常有正负两个速度分支；总能量不变，动能与势能相互转化。'}</Verdict>
    <figcaption className="text-xs">精确经典解 x=A cos(ωt)，v=−Aω sin(ωt)，初相位固定为零；m=m₀，长度单位 ℓ，时间单位 t₀，E₀=m₀ℓ²/t₀²。图中 A 表示振幅，即正文的 x₀，区别于通解的余弦系数 A。时间只由滑块或按钮改变；能量图自动缩放，振幅大小请读数值。它是一条经典轨道，不表示量子粒子的测量轨迹或概率密度。</figcaption>
  </figure>;
}
