/** Coherent fields versus an independent-path intensity sum.
 * Shared model double-slit.mjs verified by scripts/verify/double-slit.mjs.
 * Geometry is schematic; the plot uses dimensionless far-field coordinates.
 */
import { useState } from "react";
import { FMM_COLORS, Plot, Slider, Task, Verdict, W_BUTTON, fmtEn } from "../../lib";
import { SLIT_PRESETS, SLIT_SIGMA, doubleSlitAt, doubleSlitState, type SlitParameters } from "./double-slit.mjs";

const f = (v: number) => fmtEn(Math.abs(v) < 1e-12 ? 0 : v, 4);
const feedback = { neutral: "观察", ok: "相位关系", warn: "接近但不相等", fail: "不成立" };

function SlitGeometry({ u, coherent }: { u: number; coherent: boolean }) {
  const detectorY = 144 - 24 * u;
  return <svg viewBox="0 0 370 295" width="370" height="295" className="w-full h-auto" role="img" aria-label={`双缝示意：缝距 a、屏距 d，当前探测位置 u=${f(u)}。装置不按比例。`}>
    <g stroke="var(--w-axis)" strokeWidth="3"><path d="M95 30V103M95 113V175M95 185V245" /><path d="M310 30V245" /></g>
    {coherent ? <g stroke={FMM_COLORS.blau} strokeWidth="1.5" opacity=".6">{[18, 31, 44, 57].map(x => <line key={x} x1={x} x2={x} y1="65" y2="220" />)}</g>
      : <g stroke={FMM_COLORS.blau} strokeWidth="1.5" opacity=".6"><path d="M18 144L75 108M18 144H75M18 144L75 180" /></g>}
    <g fill="none" strokeWidth="2"><path d={`M95 108L310 ${detectorY}`} stroke={FMM_COLORS.blau} /><path d={`M95 180L310 ${detectorY}`} stroke={FMM_COLORS.orange} /></g>
    <g stroke="var(--w-muted)" strokeWidth="1.2"><path d="M119 108V180M114 108H124M114 180H124M95 262H310M95 257V267M310 257V267" />{[-3, -2, -1, 0, 1, 2, 3].map(v => <line key={v} x1="305" x2="315" y1={144 - 24 * v} y2={144 - 24 * v} />)}</g>
    <circle cx="310" cy={detectorY} r="5" fill={FMM_COLORS.gruen} />
    <g fill="var(--w-text)" fontSize="13"><text x="68" y="99">S₁</text><text x="68" y="196">S₂</text><text x="126" y="149">a</text><text x="198" y="278">d</text><text x="323" y="31">x ↑</text><text x="323" y={detectorY + 4}>u</text><text x="173" y={(108 + detectorY) / 2 - 8}>d₁</text><text x="212" y={(180 + detectorY) / 2 + 17}>d₂</text></g>
    <text x="180" y="292" textAnchor="middle" fill="var(--w-muted)" fontSize="11">双缝与探测屏示意，不按比例</text>
  </svg>;
}

export function DoubleSlitLab() {
  const [parameters, setParameters] = useState<SlitParameters>(SLIT_PRESETS[0]);
  const state = doubleSlitState(parameters);
  const update = (patch: Partial<SlitParameters>) => setParameters(old => ({ ...old, ...patch }));
  const coherent = parameters.mode === "coherent";
  return <div className="space-y-3">
    <Task>先让屏幕中央完全相消，再切换到粒子加和模型，比较同一位置的强度。</Task>
    <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">{SLIT_PRESETS.map(p => <button key={p.id} type="button" className={W_BUTTON} onClick={() => setParameters(p)}>{p.label}</button>)}</div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="选择双缝预言">
          <button type="button" className={W_BUTTON} aria-pressed={coherent} onClick={() => update({ mode: "coherent" })}>相干波</button>
          <button type="button" className={W_BUTTON} aria-pressed={!coherent} onClick={() => update({ mode: "additive" })}>独立粒子加和</button>
        </div>
        <Slider label="屏幕位置 u" value={parameters.u} onChange={u => update({ u })} min={-3.5} max={3.5} step={.05} fmt={v => fmtEn(v, 2)} />
        <Slider label="额外相位 φ₀/π" value={parameters.phasePi} onChange={phasePi => update({ phasePi })} min={-2} max={2} step={.05} fmt={v => fmtEn(v, 2)} />
        <p className="text-sm">u = x/Δx，σ = {SLIT_SIGMA}；两条单缝曲线均为 G(u)。强度为任意单位，未作概率归一化。</p>
      </div>
      <div>
        <div className="grid gap-3 sm:grid-cols-2 items-start">
          <SlitGeometry u={parameters.u} coherent={coherent} />
          <Plot width={420} height={295} xDomain={[-3.5, 3.5]} yDomain={[-.1, 4.3]} xLabel="屏幕坐标 u = x/Δx" yLabel="强度 I（任意单位）" ariaLabel={coherent ? "相干双缝强度、单缝强度与直接加和的比较" : "独立粒子的双缝加和强度与单缝强度"} series={[
            { f: u => { const s = doubleSlitAt(u, parameters.phasePi); return coherent ? s.coherent : s.additive; }, label: coherent ? "相干双缝" : "粒子加和", color: FMM_COLORS.blau },
            { f: u => doubleSlitAt(u, parameters.phasePi).envelope, label: "单缝 G", color: FMM_COLORS.orange, dash: [3, 3] },
            ...(coherent ? [{ f: (u: number) => doubleSlitAt(u, parameters.phasePi).additive, label: "直接加和 2G", color: FMM_COLORS.grau, dash: [6, 4] }] : []),
          ]} points={[{ x: parameters.u, y: state.selected, color: FMM_COLORS.gruen }]} vlines={[{ at: parameters.u, dash: [3, 4] }]} />
        </div>
        <p className="text-sm tabular-nums mt-3">δ/π = 2u + φ₀/π = {f(2 * parameters.u + parameters.phasePi)}；单缝 I₁ = I₂ = {f(state.envelope)}。<br/>当前选择的双缝强度 I = {f(state.selected)}；直接加和 I₁ + I₂ = {f(state.additive)}。</p>
      </div>
    </div>
    <Verdict labels={feedback} kind={state.branch.startsWith("near-") ? "warn" : state.branch === "intermediate" || state.branch === "additive" ? "neutral" : "ok"}>
      {state.branch === "additive" ? "当前选择独立粒子模型：两类计数直接相加，改变额外相位不会改变这条强度曲线。"
        : state.branch === "dark" ? "相位差精确为奇数倍 π，两路等振幅完全相消：双缝强度为零，但每条单缝强度都为正。"
        : state.branch === "bright" ? "相位差精确为偶数倍 π，两路同相：此处强度为 4G，是直接加和 2G 的两倍。"
        : state.branch === "near-dark" ? "接近奇数倍 π，但尚未精确相消；当前强度很低，仍大于零。"
        : state.branch === "near-bright" ? "接近同相，但相位仍有差别；此处强度尚未达到同一包络下的 4G。"
        : "交叉项由相位差决定，当前强度介于完全相消与局部相长上限之间。"}
    </Verdict>
  </div>;
}
