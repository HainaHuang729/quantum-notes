/** Finite-support Fock ladder. Checked: scripts/verify/oscillator-algebra.mjs.
 * The buttons apply coefficient maps and then normalize; they are not a
 * measurement model and never auto-repeat. No timers or randomness.
 */
import { useState } from "react";
import { Slider, Task, Verdict, W_BUTTON, FMM_COLORS, fmtEn } from "../../lib";
import {
  FOCK_MAX_N,
  FOCK_PRESETS,
  basisState,
  fockPreset,
  fockStats,
  ladder,
  type Complex,
  type LadderOp,
  type LadderResult,
} from "./oscillator-algebra.mjs";

const labels = { neutral: "观察", ok: "代数操作", warn: "边界情况", fail: "重新制备" };
const smallText = (x: number) => x !== 0 && Math.abs(x) < .0005 ? x.toExponential(2) : fmtEn(x, 3);
const zText = (z: Complex) => `${smallText(z[0])} ${z[1] < 0 ? "−" : "+"} ${smallText(Math.abs(z[1]))}i`;

export function FockLadderLab() {
  const [state, setState] = useState<Complex[]>(() => fockPreset("vacuum"));
  const [preparedN, setPreparedN] = useState(0);
  const [steps, setSteps] = useState(0);
  const [last, setLast] = useState<LadderResult | null>(null);
  const stats = fockStats(state);
  const resetMeta = () => { setSteps(0); setLast(null); };
  const prepare = (n: number) => { setPreparedN(n); setState(basisState(n)); resetMeta(); };
  const choosePreset = (id: string) => { setState(fockPreset(id)); resetMeta(); };
  const apply = (op: LadderOp) => {
    const result = ladder(state, op);
    if (result.blocked) return;
    if (result.state) setState(result.state);
    else if (result.raw) setState(result.raw);
    setSteps((value) => value + 1);
    setLast(result);
  };
  const supportText = stats.zero ? "零向量" : stats.support < 0 ? "无" : stats.support === 0 ? "n=0" : `n=0–${stats.support}`;

  const chartW = 560;
  const chartH = 250;
  const padL = 48;
  const padR = 16;
  const padT = 18;
  const padB = 46;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const xFor = (n: number) => padL + ((n + 0.5) * plotW) / (FOCK_MAX_N + 1);
  const yFor = (p: number) => padT + plotH * (1 - p);
  const barW = (plotW / (FOCK_MAX_N + 1)) * 0.62;

  return <div className="space-y-3">
    <Task>先预测：点击 a 或 a† 后，范数会变大还是变小？从 |0〉、|3〉和两种叠加出发，比较作用后的范数²与新态。</Task>
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {FOCK_PRESETS.map((preset) => <button key={preset.id} type="button" className={W_BUTTON} onClick={() => choosePreset(preset.id)}>{preset.label}</button>)}
        </div>
        <Slider label="重新制备 |n〉" value={preparedN} onChange={prepare} min={0} max={FOCK_MAX_N} step={1} fmt={(v) => `|${v}〉`} />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className={W_BUTTON} disabled={stats.zero} onClick={() => apply("a")} aria-label="作用降算符 a">a ↓</button>
          <button type="button" className={W_BUTTON} disabled={stats.zero || stats.atCeiling} onClick={() => apply("a†")} aria-label="作用升算符 a†">a† ↑</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={W_BUTTON} onClick={() => prepare(0)}>重置为 |0〉</button>
          <button type="button" className={W_BUTTON} onClick={() => prepare(preparedN)}>再制备滑块值</button>
        </div>
        <p className="text-xs">点击 a 会把 cₙ 下移并乘 √n；点击 a† 会上移并乘 √(n+1)。每次点击先显示未归一范数²，再归一化。已执行步数：{steps}。滑块只用于重新制备；预设按钮是另外四个起点。</p>
      </div>
      <div className="space-y-3">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} width={chartW} height={chartH} className="w-full h-auto" role="img" aria-label={`能级 0 到 ${FOCK_MAX_N} 的概率分布；当前支撑为 ${supportText}`}>
          <rect width={chartW} height={chartH} fill="var(--w-bg)" />
          {[0, 0.25, 0.5, 0.75, 1].map((p) => <g key={p}>
            <line x1={padL} x2={padL + plotW} y1={yFor(p)} y2={yFor(p)} stroke="var(--w-grid)" />
            <text x={padL - 6} y={yFor(p) + 4} textAnchor="end" fontSize="10" fill="var(--w-muted)">{fmtEn(p, 2)}</text>
          </g>)}
          <line x1={padL} x2={padL + plotW} y1={padT + plotH} y2={padT + plotH} stroke="var(--w-axis)" />
          {stats.probabilities.map((probability, n) => {
            const height = probability * plotH;
            return <g key={n}>
              <rect x={xFor(n) - barW / 2} y={padT + plotH - height} width={barW} height={Math.max(0, height)} rx={1} fill={probability > 1e-13 ? FMM_COLORS.blau : "var(--w-grid)"} />
              <text x={xFor(n)} y={padT + plotH + 14} textAnchor="middle" fontSize="10" fill="var(--w-text)">{n}</text>
            </g>;
          })}
          <text x={padL + plotW / 2} y={chartH - 8} textAnchor="middle" fontSize="11" fill="var(--w-text)">能级 n（Eₙ/(ℏω)=n+1/2）</text>
          <text x={14} y={padT + plotH / 2} textAnchor="middle" fontSize="11" fill="var(--w-text)" transform={`rotate(-90 14 ${padT + plotH / 2})`}>概率 |cₙ|²</text>
        </svg>
        <div className="text-sm tabular-nums space-y-1">
          <p>⟨N⟩ = {stats.zero ? "—" : fmtEn(stats.meanN, 3)}；⟨H⟩/(ℏω) = ⟨N⟩+1/2 = {stats.energy === null ? "—" : fmtEn(stats.energy, 3)}；‖ψ‖² = {fmtEn(stats.norm2, 6)}。</p>
          <p>支撑：{supportText}。{stats.atCeiling ? `已达到最高支持 n=${FOCK_MAX_N}，升操作禁用。` : `最高支持 n=${FOCK_MAX_N}。`}</p>
          {last ? last.blocked ? <p>升操作被支持上限阻止，状态未改变。</p> : last.zero ? <p>上一步 a：‖aψ‖² = 0，得到零向量；不能除以 0。</p> : <p>上一步 {last.op}：作用前 ⟨N⟩ = {fmtEn(last.meanNBefore, 3)}；‖{last.op}ψ‖² = {fmtEn(last.norm2 ?? 0, 4)}（{last.op === "a" ? "等于作用前 ⟨N⟩" : "等于作用前 ⟨N⟩+1"}）；归一化后 ‖ψ′‖² = 1。</p> : <p>尚未操作；当前为初始制备。</p>}
        </div>
        <div className="text-xs space-y-1">
          {stats.zero ? <p>当前为零向量：没有可归一化的系数。用左侧预设或 |n〉 重新制备。</p> : <>
            <p>非零系数与概率：</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 font-mono">
              {state.map((coefficient, n) => coefficient[0] !== 0 || coefficient[1] !== 0 ? <span key={n}>c<sub>{n}</sub> = {zText(coefficient)}（{smallText(stats.probabilities[n])}）</span> : null)}
            </div>
          </>}
        </div>
      </div>
    </div>
    <Verdict labels={labels} kind={stats.zero || stats.atCeiling ? "warn" : "ok"}>
      {stats.zero ? "真空被 a 送到零向量：范数为 0，不能归一化。这里不除以 0，也不把零向量当成另一个真空；用预设或 |n〉 重新制备。"
        : stats.atCeiling ? `当前态在最高支持 n=${FOCK_MAX_N} 上有系数，a† 会把系数推出有限支持，因此禁用；完整数组保留已有系数。不要用截断矩阵声称 [a,a†]=I 在边界也成立。`
        : "a 与 a† 先改写系数，范数一般改变；显示作用后的范数平方，再把向量除以范数得到新态。归一化不把这个代数映射变成幺正变换，也不表示一次确定的物理测量或自动操作。"}
    </Verdict>
    <p className="text-xs">对基矢，a|n〉=√n|n−1〉，a†|n〉=√(n+1)|n+1〉。单位 ℏ=ω=1，Eₙ=(n+1/2)ℏω，⟨H⟩/(ℏω)=⟨N⟩+1/2。最高支持 n={FOCK_MAX_N}；数组始终保留全部系数。这里的归一化只是把结果向量除以它的范数，便于继续作代数演示；量子测量后的态更新不由这个按钮决定。</p>
  </div>;
}
