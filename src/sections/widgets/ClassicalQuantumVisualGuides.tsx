/** Inline scientific figures, preserving the parent lesson's card boundaries.
 * Numeric checks: scripts/verify/momentum-gauge-figure.mjs,
 * boundary-local-figure.mjs and classical-state-figures.mjs. No timers or sampling.
 */
import {useState} from 'react';
import {FMM_COLORS, Plot, Slider, Task, Verdict, W_BUTTON, W_PANEL, fmtEn} from '../../lib';
import {momentumGauge, boundaryPath, boundaryState, WAVE_COMPARISON, classicalWave, STATE_PROBABILITY} from './classical-quantum-visual.mjs';

const f = (n: number) => fmtEn(n, 3);
const labels = {neutral: '读图', ok: '物理关系', warn: '试探路径', fail: '重新比较'};

export function CanonicalMomentumFigure({caption}: {caption: string}) {
  const [shift, setShift] = useState(3);
  const s = momentumGauge(shift), px = (n: number) => 45 + (n + 4) / 12 * 290;
  const rows = [
    {name: '机械 πₓ', value: s.mechanical, color: FMM_COLORS.blau},
    {name: '势项 g', value: s.shift, color: FMM_COLORS.orange},
    {name: '正则 pₓ', value: s.canonical, color: FMM_COLORS.gruen},
  ];
  return <figure className={`${W_PANEL} p-3 my-3 space-y-2`} data-visual-guide="canonical-momentum">
    <Task>保持粒子的机械动量，改变常量势项 g，比较哪种动量与动能改变。</Task>
    <Slider label="常量势项 g = qAₓ/c" value={shift} onChange={setShift} min={-4} max={4} step={.5} fmt={f}/>
    <div className="flex flex-wrap gap-2">{[0, 3, -4].map(g => <button key={g} type="button" className={W_BUTTON} onClick={() => setShift(g)}>{g === 3 ? '重置 g=3' : `g=${g}`}</button>)}</div>
    <svg viewBox="0 0 380 245" width="380" height="245" className="block w-full h-auto max-w-[520px] mx-auto" role="img" aria-label={`同一机械状态的三条动量分量：机械${f(s.mechanical)}，势项${f(s.shift)}，正则${f(s.canonical)}。`}>
      {[-4, -2, 0, 2, 4, 6, 8].map(n => <g key={n}><path d={`M${px(n)} 22V185`} stroke={n === 0 ? 'var(--w-axis)' : 'var(--w-grid)'} strokeDasharray={n === 0 ? undefined : '3 4'}/><text x={px(n)} y="203" textAnchor="middle" fontSize="12" fill="var(--w-muted)">{n}</text></g>)}
      {rows.map((r, i) => <g key={r.name}>
        <text x="45" y={35 + i * 55} fontSize="13" fill="var(--w-text)">{r.name} = {f(r.value)}</text>
        <path d={`M${px(0)} ${50 + i * 55}H${px(r.value)}`} stroke={r.color} strokeWidth="5"/>
        <circle cx={px(r.value)} cy={50 + i * 55} r="5" fill={r.color}/>
      </g>)}
      <text x="190" y="229" textAnchor="middle" fontSize="13" fill="var(--w-text)">沿 x 方向的动量分量（参考单位）</text>
    </svg>
    <p className="text-sm tabular-nums">pₓ = πₓ + g = {f(s.canonical)}；vₓ = πₓ/m = {f(s.velocity)}；T = πₓ²/(2m) = {f(s.kinetic)}。</p>
    <Verdict labels={labels} kind="ok">改变 g 使正则动量平移，机械动量与动能保持不变。常量 Aₓ 的这种平移可由不显含时间的规范变换实现，不改变 E、B；不能把改变规范误作给粒子施力。</Verdict>
    <figcaption className="text-xs">{caption} 采用高斯电磁单位制，g=qAₓ/c 与动量同量纲；图中各量以固定参考单位计，m=2、πₓ=4，电势保持不变。这里只检查同一位置的分量与规范记账，不模拟磁场轨迹。</figcaption>
  </figure>;
}

export function LocalStationaryFigure() {
  const [a, setA] = useState(.8), s = boundaryState(a);
  return <figure className={`${W_PANEL} p-3 my-3 space-y-2`} data-visual-guide="local-stationary">
    <Task>把变形 a 调到零，比较固定端点的试探路径与逐时满足自由运动方程的路径。</Task>
    <Slider label="路径变形 a" value={a} onChange={setA} min={-1} max={1} step={.1} fmt={f}/>
    <div className="flex flex-wrap gap-2"><button type="button" className={W_BUTTON} onClick={() => setA(0)}>局部运动解</button><button type="button" className={W_BUTTON} onClick={() => setA(.8)}>重置试探路径</button><button type="button" className={W_BUTTON} onClick={() => setA(-.8)}>反向变形</button></div>
    <Plot width={440} height={265} xDomain={[0, 1]} yDomain={[-.08, 1.08]} xLabel="时间 t（参考单位）" yLabel="位置 q" ariaLabel="自由粒子的直线路径与同端点弯曲试探路径" series={[
      {f: t => t, color: FMM_COLORS.blau, dash: [5, 4], label: '运动解'},
      {f: t => boundaryPath(t, a), color: FMM_COLORS.orange, label: '试探'},
    ]} points={[{x: 0, y: 0, color: FMM_COLORS.gruen}, {x: 1, y: 1, color: FMM_COLORS.gruen}]}/>
    <p className="text-sm tabular-nums">qₐ(t)=t+a t(1−t)；q̈ₐ=−2a={f(s.acceleration)}。S(a)=1/2+a²/6={f(s.action)}；dS/da={f(s.actionSlope)}。</p>
    <Verdict labels={labels} kind={s.stationary ? 'ok' : 'warn'}>{s.stationary ? 'a 精确为零：作用量对这族变形的斜率为零，路径在每一时刻也满足 q̈=0。用初值 q(0)=0、q̇(0)=1 就能得到它，无需预知终点。' : `试探路径与真实解具有相同端点，但 q̈=${f(s.acceleration)}，不满足自由运动方程。它的初速度为 ${f(s.initialVelocity)}，也不是初速为 1 的同一个初值问题。`}</Verdict>
    <figcaption className="text-xs">无量纲自由粒子，m=1、总时长=1、固定端点 q(0)=0、q(1)=1。蓝虚线是初值问题的解；橙实线仅用于变分比较，不是另一条真实自由轨道。这一族的驻点恰为最小值，一般驻定原理并不保证最小。</figcaption>
  </figure>;
}

export function ParticleWaveFigure() {
  const {times, wavelength, period, particleVelocity} = WAVE_COMPARISON;
  return <figure className={`${W_PANEL} p-3 my-3 space-y-2`} data-visual-guide="particle-wave">
    <div className="grid gap-3 sm:grid-cols-2">
      <svg viewBox="0 0 340 255" width="340" height="255" className="block w-full h-auto" role="img" aria-label="经典粒子在两个时刻分别只有一个位置，速度固定为每秒四米；两行表示不同时刻的位置记录。">
        <text x="170" y="21" textAnchor="middle" fontSize="14" fill="var(--w-text)">粒子：每个时刻一个位置</text>
        {times.map((t, i) => <g key={t}>
          <text x="25" y={52 + i * 80} fontSize="12" fill="var(--w-text)">t = {f(t)} s</text>
          <path d={`M35 ${80 + i * 80}H305`} stroke="var(--w-axis)"/>
          {[0, .5, 1, 1.5, 2].map(x => <g key={x}><path d={`M${45 + 120 * x} ${76 + i * 80}v8`} stroke="var(--w-axis)"/><text x={45 + 120 * x} y={100 + i * 80} textAnchor="middle" fontSize="11" fill="var(--w-muted)">{x}</text></g>)}
          <circle cx={45 + 120 * particleVelocity * t} cy={80 + i * 80} r="6" fill={i ? FMM_COLORS.orange : FMM_COLORS.blau}/>
          <text x={60 + 120 * particleVelocity * t} y={73 + i * 80} fontSize="12" fill="var(--w-text)">q = {f(particleVelocity * t)} m</text>
        </g>)}
        <text x="170" y="214" textAnchor="middle" fontSize="13" fill="var(--w-text)">位置 x / m</text><text x="170" y="240" textAnchor="middle" fontSize="12" fill="var(--w-muted)">初始 q=0，速度 v=4 m/s</text>
      </svg>
      <div><p className="text-sm text-center">波：每个时刻一整条空间函数</p><Plot width={340} height={215} xDomain={[0, 4]} yDomain={[-1.25, 1.25]} xLabel="位置 x / m" yLabel="场值 ψ / A" ariaLabel="经典平面波在零时刻与八分之一秒时的空间场值；橙虚线相对蓝实线右移半米" series={[
        {f: x => classicalWave(x, times[0]), color: FMM_COLORS.blau, label: 't=0'},
        {f: x => classicalWave(x, times[1]), color: FMM_COLORS.orange, dash: [5, 4], label: 't=T/4'},
      ]}/></div>
    </div>
    <figcaption className="text-xs">蓝色为 t=0，橙色为 t=T/4=0.125 s。波的 λ={wavelength} m、T={period} s，波峰速度 λ/T=4 m/s，故右移 0.5 m。这里画一维标量经典波 A cos(πx−4πt)，速度为 4 m/s；它不是真空电磁波，也不是粒子的位置概率；平面波也不表示波的能量集中在波峰。粒子与波只为比较而取相同传播速度。</figcaption>
  </figure>;
}

export function StateProbabilityFigure() {
  const s = STATE_PROBABILITY;
  return <figure className={`${W_PANEL} p-3 my-3 space-y-2`} data-visual-guide="state-probability">
    <svg viewBox="0 0 350 305" width="350" height="305" className="block w-full h-auto max-w-[480px] mx-auto" role="img" aria-label="归一化二态教学例：振幅一比二，经模平方给出五分之一与五分之四的测量概率。">
      <rect x="30" y="15" width="290" height="60" rx="8" fill="var(--w-bg)" stroke="var(--w-border)"/>
      <text x="175" y="39" textAnchor="middle" fontSize="15" fill="var(--w-text)">相同制备的归一化态</text><text x="175" y="62" textAnchor="middle" fontSize="16" fill="var(--w-text)">|ψ〉=(|a〉+2|b〉)/√5</text>
      <path d="M175 79V104M169 98L175 104L181 98" fill="none" stroke="var(--w-axis)" strokeWidth="2"/>
      <text x="175" y="126" textAnchor="middle" fontSize="13" fill="var(--w-text)">指定 a / b 测量后，取振幅的模平方</text>
      {[0, .5, 1].map(p => <g key={p}><path d={`M50 ${251 - p * 105}H300`} stroke={p === 0 ? 'var(--w-axis)' : 'var(--w-grid)'}/><text x="43" y={255 - p * 105} textAnchor="end" fontSize="11" fill="var(--w-muted)">{p}</text></g>)}
      {s.probabilities.map((p, i) => <g key={i}><rect x={91 + i * 122} y={251 - 105 * p} width="42" height={105 * p} fill={i ? FMM_COLORS.orange : FMM_COLORS.blau}/><text x={112 + i * 122} y={242 - 105 * p} textAnchor="middle" fontSize="14" fill="var(--w-text)">{i ? '4/5' : '1/5'}</text><text x={112 + i * 122} y="274" textAnchor="middle" fontSize="14" fill="var(--w-text)">{i ? '结果 b' : '结果 a'}</text></g>)}
      <text x="175" y="299" textAnchor="middle" fontSize="12" fill="var(--w-muted)">纵轴：概率；横轴：测量结果</text>
    </svg>
    <figcaption className="text-xs">原创建模示意：a、b 是两个正交结果标签，并非两个空间位置。归一化检查 |1/√5|²+|2/√5|²=1。一次测量只得到一个结果，多次相同制备才可检验分布；此处的概率规则将在公设中正式说明，不是由本图证明。</figcaption>
  </figure>;
}

export function PostulateFlowFigure() {
  const rows = [
    {head: 'I · 给出纯态', formula: '|ψ〉，〈ψ|ψ〉=1', detail: '同一整体相位代表同一物理态', color: FMM_COLORS.blau},
    {head: 'II · 选择测量问题', formula: 'Ω = Σᵢ ωᵢ Πᵢ', detail: '本征值 ωᵢ 与本征子空间投影 Πᵢ', color: FMM_COLORS.violett},
    {head: 'III · 概率与条件更新', formula: 'Pᵢ=〈ψ|Πᵢ|ψ〉', detail: '得 i 后：|ψᵢ〉=Πᵢ|ψ〉/√Pᵢ', color: FMM_COLORS.orange},
    {head: 'IV · 再演化到下一时刻', formula: '|ψ(t+Δt)〉=U|ψ(t)〉', detail: '封闭系统的 U 幺正，由 H 决定', color: FMM_COLORS.gruen},
  ];
  return <figure className={`${W_PANEL} p-3 my-3 space-y-2`} data-visual-guide="postulate-flow">
    <svg viewBox="0 0 350 450" width="350" height="450" className="block w-full h-auto max-w-[420px] mx-auto" role="img" aria-label="四条量子公设的计算流程：给出态，选择可观测量，计算测量概率与测后态，再用哈密顿算符演化。">
      {rows.map((r, i) => <g key={r.head}>
        <rect x="18" y={14 + i * 110} width="314" height="87" rx="8" fill="var(--w-bg)" stroke={r.color} strokeWidth="1.5"/>
        <path d={`M18 ${14 + i * 110}v87`} stroke={r.color} strokeWidth="5"/>
        <text x="175" y={37 + i * 110} textAnchor="middle" fontSize="14" fill="var(--w-text)">{r.head}</text>
        <text x="175" y={63 + i * 110} textAnchor="middle" fontSize="16" fill="var(--w-text)">{r.formula}</text>
        <text x="175" y={86 + i * 110} textAnchor="middle" fontSize="12" fill="var(--w-muted)">{r.detail}</text>
        {i < 3 && <path d={`M175 ${103 + i * 110}v17m-6-6l6 6l6-6`} fill="none" stroke="var(--w-axis)" strokeWidth="1.5"/>}
      </g>)}
    </svg>
    <figcaption className="text-xs">有限离散谱的流程图，Πᵢ 可投影到整个简并本征空间；只对 Pᵢ&gt;0 的实际结果做归一化更新。第三步为理想投影测量，第四步为封闭系统演化，两者不能互换。连续谱需用概率密度和区间积分；不是所有实验都必须先测量再演化。</figcaption>
  </figure>;
}
