/** BornBasisLab numerical audit: scripts/verify/born-basis.mjs.
 * ProjectiveMeasurementLab audit: scripts/verify/projective-measurement.mjs.
 * Abstract finite-dimensional Hilbert models, no spatial trajectories or spin apparatus.
 */
import { useState } from "react";
import { FMM_COLORS, Plot, Slider, Task, Verdict, W_BUTTON, fmtEn } from "../../lib";
import {
  BORN_PRESETS, bornBasisState, preparedState, measurementObservable,
  measurementDistribution, projectiveMeasurement, measurementSequence, measurementDraw,
  type BornParameters, type Complex, type ComplexState, type MeasurementResult,
} from "./quantum-measurement.mjs";

const f = (v: number) => fmtEn(Math.abs(v) < 1e-11 ? 0 : v, 4);
const ztext = (z: Complex) => `${f(z[0])}${z[1] < -1e-11 ? " − " : " + "}${f(Math.abs(z[1]))}i`;
const labels = { neutral: "观察", ok: "预测与状态", warn: "接近不等于相等", fail: "不成立" };
type BarSeries = { label: string; values: number[]; color: string };

function ProbabilityBars({ names, series, title }: { names: string[]; series: BarSeries[]; title: string }) {
  const groupWidth = 330 / names.length, baseline = 192;
  return <div>
    <h4 className="text-sm font-semibold">{title}</h4>
    <svg viewBox="0 0 420 240" width="420" height="240" className="w-full h-auto" role="img" aria-label={`${title}。${series.map(s => `${s.label}：${s.values.map(f).join("，")}`).join("；")}`}>
      <text x="49" y="20" fill="var(--w-text)" fontSize="12">概率或频率</text>
      {[0, .25, .5, .75, 1].map(p => <g key={p}><line x1="49" x2="389" y1={baseline - 152 * p} y2={baseline - 152 * p} stroke={p === 0 ? "var(--w-axis)" : "var(--w-grid)"} /><text x="42" y={baseline - 152 * p + 4} textAnchor="end" fill="var(--w-muted)" fontSize="11">{fmtEn(p, 2)}</text></g>)}
      {names.map((name, i) => <g key={name}>
        {series.map((s, j) => {
          const x = 52 + groupWidth * (i + .5) + 27 * (j - (series.length - 1) / 2) - 11;
          return <g key={s.label}><rect x={x} y={baseline - 152 * s.values[i]} width="22" height={152 * s.values[i]} fill={s.color} opacity=".85" /><text x={x + 11} y={baseline - 152 * s.values[i] - 6} textAnchor="middle" fill="var(--w-text)" fontSize="10">{fmtEn(s.values[i], 3)}</text></g>;
        })}
        <text x={52 + groupWidth * (i + .5)} y="216" textAnchor="middle" fill="var(--w-text)" fontSize="12">{name}</text>
      </g>)}
      <text x="220" y="236" textAnchor="middle" fill="var(--w-muted)" fontSize="11">测量结果</text>
    </svg>
    <div className="flex gap-4 flex-wrap text-xs">{series.map(s => <span key={s.label}><span aria-hidden="true" style={{ color: s.color }}>■ </span>{s.label}</span>)}</div>
  </div>;
}

export function BornBasisLab() {
  const [parameters, setParameters] = useState<BornParameters>(BORN_PRESETS[0]);
  const s = bornBasisState(parameters);
  const update = (patch: Partial<BornParameters>) => setParameters(old => ({ ...old, ...patch }));
  return <div className="space-y-3 born-lab">
    <Task>先预测：同相叠加整体乘 i 与只把第二分量乘 −1，测量概率会有相同变化吗？用预设比较。</Task>
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">{BORN_PRESETS.map(p => <button key={p.label} type="button" className={W_BUTTON} onClick={() => setParameters(p)}>{p.label}</button>)}<button type="button" className={W_BUTTON} onClick={() => setParameters(BORN_PRESETS[0])}>重置</button></div>
        <Slider label="原基权重 r" min={0} max={1} step={.01} value={parameters.r} onChange={r => update({ r })} fmt={v => fmtEn(v, 2)} />
        <Slider label="相对相位 φ/π" min={-1} max={1} step={.05} value={parameters.phiPi} onChange={phiPi => update({ phiPi })} fmt={v => fmtEn(v, 2)} />
        <Slider label="整体相位 γ/π" min={-1} max={1} step={.05} value={parameters.gammaPi} onChange={gammaPi => update({ gammaPi })} fmt={v => fmtEn(v, 2)} />
        <Slider label="测量基角 β" min={0} max={90} step={1} value={parameters.beta} onChange={beta => update({ beta })} unit="°" fmt={v => fmtEn(v, 0)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 items-start born-displays">
        <div className="born-amplitudes"><h4 className="text-sm font-semibold">两个振幅所在的复平面</h4><Plot width={360} height={290} xDomain={[-1.2, 1.2]} yDomain={[-1.2, 1.2]} xLabel="实部" yLabel="虚部" series={[]} polylines={s.state.map((z, i) => ({ pts: [[0, 0], z] as [number, number][], label: `a${i}`, color: i ? FMM_COLORS.orange : FMM_COLORS.blau }))} points={s.state.map((z, i) => ({ x: z[0], y: z[1], label: `a${i}`, color: i ? FMM_COLORS.orange : FMM_COLORS.blau }))} ariaLabel="归一化二态的两个复振幅，整体相位使两个振幅同时转动" /></div>
        <div className="born-probabilities">
        <ProbabilityBars names={["b₊", "b₋"]} title="同一测量基中的两种准备" series={[
          { label: "纯态叠加", values: s.probabilities, color: FMM_COLORS.blau },
          { label: "经典混合", values: s.mixture, color: FMM_COLORS.orange },
        ]} /></div>
        <p className="text-sm tabular-nums sm:col-span-2 born-readout">a₀ = {ztext(s.state[0])}，a₁ = {ztext(s.state[1])}；归一化概率和 = {f(s.probabilities[0] + s.probabilities[1])}。<br/>投影振幅 c₊ = {ztext(s.amplitudes[0])}，c₋ = {ztext(s.amplitudes[1])}。</p>
      </div>
    </div>
    <p className="text-xs">纯态 ψ = eⁱᵞ[√r |0⟩ + eⁱᵠ√(1−r) |1⟩]。橙色对照每次以概率 r 制备 |0⟩，以 1−r 制备 |1⟩，不指定两者之间的相位。</p>
    <Verdict labels={labels} kind={s.branch === "near-certain" ? "warn" : s.branch.startsWith("certain-") ? "ok" : "neutral"}>
      {s.branch === "certain-plus" ? "该准备正好沿 b₊，纯态测得 b₊ 的概率为一；同权重混合通常仍有两个可能结果。整体相位怎么改都不改变这一点。"
        : s.branch === "certain-minus" ? "该准备正好沿 b₋，纯态测得 b₊ 的概率为零；同权重混合通常仍有两个可能结果。"
        : s.branch === "near-certain" ? "当前概率接近零或一，但未满足预设的精确本征态条件，不把接近确定当作已经确定。"
        : s.branch === "basis-state" ? "输入只含一个原标记态，相对相位不再有可比较的两分量；沿原基测量读数确定，换到其他基后仍可能有概率分布。"
        : s.branch === "original-basis" ? "当前仍沿原标记方向测量，纯态与同权重混合给出相同统计；这一个基中的相同统计不能证明准备方式相同。"
        : "旋转基的投影含相对相位的交叉项。改变整体相位不会改变概率，改变相对相位则通常会。"}
    </Verdict>
  </div>;
}

export function StateBasisFigure() {
  const draw = (v: number[]) => [145 + 62 * v[0] - 42 * v[1], 170 + 24 * v[0] + 24 * v[1] - 85 * v[2]];
  const psi = draw([.5, .5, Math.SQRT1_2]);
  const basis = [
    { title: "在 Ω 的本征基中", vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], labels: ["ω₁", "ω₂", "ω₃"] },
    { title: "在 Λ 的本征基中", vectors: [[Math.SQRT1_2, Math.SQRT1_2, 0], [-Math.SQRT1_2, Math.SQRT1_2, 0], [0, 0, 1]], labels: ["λ₁", "λ₂", "λ₃"] },
  ];
  return <figure className="grid sm:grid-cols-2 gap-3 my-3">{basis.map(panel => <svg key={panel.title} viewBox="0 0 300 240" width="300" height="240" className="w-full h-auto" role="img" aria-label={`${panel.title}，同一抽象实三维态与两组正交基的投影示意，不是空间位置轨迹。`}>
    <text x="150" y="23" textAnchor="middle" fill="var(--w-text)" fontSize="13">{panel.title}</text>
    {panel.vectors.map((v, i) => { const q = draw(v); return <g key={i}><path d={`M145 170L${q[0]} ${q[1]}`} stroke="var(--w-axis)" strokeWidth="2" /><circle cx={q[0]} cy={q[1]} r="3" fill="var(--w-axis)" /><text x={q[0] + 5} y={q[1] + 14} fill="var(--w-text)" fontSize="13">{panel.labels[i]}</text></g>; })}
    <path d={`M145 170L${psi[0]} ${psi[1]}`} stroke={FMM_COLORS.gruen} strokeWidth="3" /><circle cx={psi[0]} cy={psi[1]} r="4" fill={FMM_COLORS.gruen} /><text x={psi[0] + 8} y={psi[1] - 3} fill="var(--w-text)" fontSize="15">ψ</text>
    <text x="150" y="230" textAnchor="middle" fill="var(--w-muted)" fontSize="11">Hilbert 空间实三维教学示意</text>
  </svg>)}</figure>;
}

export function ProjectiveMeasurementLab() {
  const [dimension, setDimension] = useState(2), [seed, setSeed] = useState(2029), [cursor, setCursor] = useState(0);
  const [state, setState] = useState<ComplexState>(() => preparedState(2));
  const [last, setLast] = useState<MeasurementResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [batch, setBatch] = useState<{ fresh: number[]; repeated: number[]; first: string } | null>(null);
  const A = measurementObservable(dimension, "A"), B = measurementObservable(dimension, "B");
  const pa = measurementDistribution(state, A), pb = measurementDistribution(state, B);
  const reset = (dim = dimension, nextSeed = seed) => { setDimension(dim); setSeed(nextSeed); setCursor(0); setState(preparedState(dim)); setLast(null); setHistory([]); setBatch(null); };
  const measure = (which: "A" | "B") => {
    const outcome = projectiveMeasurement(state, which === "A" ? A : B, measurementDraw(seed, cursor));
    setState(outcome.after); setLast(outcome); setCursor(cursor + 1);
    setHistory(old => [...old, `${cursor + 1}：${outcome.outcome.label}（测前概率 ${f(outcome.probability)}）`].slice(-8));
  };
  const compare = () => {
    const initial = preparedState(dimension), n = 1000;
    const fresh = measurementSequence(initial, A, n, seed, true), repeated = measurementSequence(initial, A, n, seed, false);
    setBatch({ fresh: fresh.counts.map(x => x / n), repeated: repeated.counts.map(x => x / n), first: A[repeated.events[0]].label });
  };
  return <div className="space-y-3 projective-lab">
    <Task>{dimension === 2 ? "先预测：测过 A 后再测 A，与中间插入 B 有何不同？" : "先预测：D 与 B 对易，插入 B 会不会改变已经确定的 D 读数？"}再比较一千份初态与一个样品连测。</Task>
    <div className="flex flex-wrap gap-2" role="group" aria-label="有限维教学模式">
      <button type="button" className={W_BUTTON} aria-pressed={dimension === 2} onClick={() => reset(2)}>二态：非简并 A</button>
      <button type="button" className={W_BUTTON} aria-pressed={dimension === 3} onClick={() => reset(3)}>三态：简并 D</button>
      <button type="button" className={W_BUTTON} onClick={() => reset()}>重新制备并重置</button>
      <button type="button" className={W_BUTTON} onClick={() => reset(dimension, seed + 1)}>换种子并重置</button>
    </div>
    <div className="grid gap-4 lg:grid-cols-[245px_minmax(0,1fr)]">
      <div className="space-y-3 measurement-details">
        <div className="flex gap-2 flex-wrap"><button type="button" className={W_BUTTON} onClick={() => measure("A")}>测 {dimension === 2 ? "A" : "D"} 一次</button><button type="button" className={W_BUTTON} onClick={() => measure("B")}>插入一次 B 测量</button></div>
        <p className="text-sm">当前 ket 的复分量：</p><ol className="text-xs tabular-nums list-decimal pl-5">{state.map((z, i) => <li key={i}>{ztext(z)}</li>)}</ol>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ProbabilityBars names={A.map(o => o.label)} title={`当前态下一次测 ${dimension === 2 ? "A" : "D"}`} series={[{ label: "Born 概率", values: pa, color: FMM_COLORS.blau }]} />
        <ProbabilityBars names={B.map(o => o.label)} title="当前态下一次测 B" series={[{ label: "Born 概率", values: pb, color: FMM_COLORS.orange }]} />
      </div>
    </div>
    <p className="text-xs">模式为 {dimension} 维；固定种子 {seed}，本轮已测 {cursor} 次。测量间不加自由演化，基标记不代表空间位置或真实自旋仪器。</p>
    <ol className="text-xs list-none space-y-1" aria-label="最近的测量记录">{history.map((line, i) => <li key={i}>{line}</li>)}</ol>
    <Verdict labels={labels} kind={last ? "ok" : "neutral"}>
      {!last ? "尚未测量。每次按钮会从当前态抽取一个结果，再按对应本征子空间归一化投影，更新上方两个分布。"
        : `${last.outcome.label} 已得到；它的测前概率为 ${f(last.probability)}。当前态已更新，立即重复同一理想测量将保留这个结果。${dimension === 2 ? "插入 B 测量通常会改变 A 的统计。" : "此模式的 D 与 B 对易；插入 B 保持已经确定的 D 读数，仍可改变 D 子空间内的方向。"}`}
      {dimension === 3 && " D=0 是二维本征空间，更新保留该平面内部的叠加，不再随机挑其中一条基向量。"}
    </Verdict>
    <button type="button" className={W_BUTTON} onClick={compare}>对照：每次重新制备 / 同一样品连测，各一千次</button>
    {batch && <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ProbabilityBars names={A.map(o => o.label)} title="对照实验：从设定初态另起两组" series={[
        { label: "每次重新制备", values: batch.fresh, color: FMM_COLORS.blau },
        { label: "同一样品连续测", values: batch.repeated, color: FMM_COLORS.orange },
      ]} />
      <p role="status" aria-live="polite" className="text-sm">对照不改变上方当前态。重新制备组的有限频率接近初态概率；同一样品组第一次得到 {batch.first}，之后持续得到同一结果，所以不能用它估计初态的完整分布。重置并保留种子会复现记录；换种子可看到另一组统计波动。</p>
    </div>}
  </div>;
}
