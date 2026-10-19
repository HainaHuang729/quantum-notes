/** Thermal harmonic oscillator: Boltzmann mixture over exact levels.
 * Checked: scripts/verify/thermal-oscillator.mjs.
 * Single oscillator only; an Einstein-solid factor of three is shown as a
 * clearly labelled readout, never as fake experimental points. No timers.
 */
import { useState } from "react";
import { Plot, Slider, Task, Verdict, W_BUTTON, FMM_COLORS, fmtEn } from "../../lib";
import {
  THERMAL_EINSTEIN_FACTOR,
  THERMAL_GROUND_E,
  THERMAL_PRESETS,
  THERMAL_TAU_MAX,
  THERMAL_TAU_STEP,
  thermalLevels,
  thermalState,
} from "./thermal-oscillator.mjs";

const labels = { neutral: "观察", ok: "热统计", warn: "模型限制", fail: "重新比较" };
const LEVEL_MAX = 8;

export function ThermalOscillatorLab() {
  const [tau, setTau] = useState(0);
  const s = thermalState(tau);
  const levels = thermalLevels(tau, LEVEL_MAX);

  const chartW = 560;
  const chartH = 230;
  const padL = 48;
  const padR = 16;
  const padT = 18;
  const padB = 46;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const xFor = (n: number) => padL + ((n + 0.5) * plotW) / levels.p.length;
  const yFor = (p: number) => padT + plotH * (1 - p);
  const barW = (plotW / levels.p.length) * 0.62;

  return <div className="space-y-3">
    <Task>先预测：τ 增大时热容从 0 还是从 1 起步？再对照量子曲线与经典 E=τ、C=k_B，并改变 τ 看能级权重怎样重排。</Task>
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {THERMAL_PRESETS.map((preset) => <button key={preset.id} type="button" className={W_BUTTON} aria-pressed={tau === preset.tau} onClick={() => setTau(preset.tau)}>{preset.label}</button>)}
        </div>
        <Slider label="温度 τ" value={tau} onChange={setTau} min={0} max={THERMAL_TAU_MAX} step={THERMAL_TAU_STEP} fmt={(v) => fmtEn(v, 2)} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={W_BUTTON} onClick={() => setTau(0)}>回到 τ=0</button>
          <button type="button" className={W_BUTTON} onClick={() => setTau(0.5)}>低温</button>
          <button type="button" className={W_BUTTON} onClick={() => setTau(4)}>高温</button>
        </div>
        <p className="text-xs">τ = k_B T/(ℏω)，滑块从 0 到 {THERMAL_TAU_MAX}，步长 {fmtEn(THERMAL_TAU_STEP, 2)}。τ=0 精确取基态；τ&gt;0 时所有能级按玻尔兹曼权重混合。</p>
      </div>
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Plot width={420} height={300} xDomain={[0, THERMAL_TAU_MAX]} yDomain={[0, 5.2]} xLabel="τ = k_B T/(ℏω)" yLabel="⟨E⟩/(ℏω)" series={[
            { f: (value) => thermalState(value).E, color: FMM_COLORS.blau, label: "量子" },
            { f: (value) => value, color: FMM_COLORS.orange, label: "经典", dash: [4, 3] },
            { f: () => THERMAL_GROUND_E, color: FMM_COLORS.gruen, label: "零点", dash: [2, 3] },
          ]} vlines={[{ at: tau, color: FMM_COLORS.rot, label: "当前" }]} ariaLabel="量子平均能量在高温下趋近经典值 τ；零点能是温度无关的贡献，量子曲线并非经典直线加二分之一" />
          <Plot width={420} height={300} xDomain={[0, THERMAL_TAU_MAX]} yDomain={[0, 1.05]} xLabel="τ = k_B T/(ℏω)" yLabel="C_V/k_B" series={[
            { f: (value) => thermalState(value).C, color: FMM_COLORS.blau, label: "量子" },
            { f: () => 1, color: FMM_COLORS.orange, label: "经典", dash: [4, 3] },
          ]} vlines={[{ at: tau, color: FMM_COLORS.rot, label: "当前" }]} ariaLabel="量子热容从零温的零值上升到经典值一" />
        </div>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} width={chartW} height={chartH} className="w-full h-auto" role="img" aria-label={`当前温度下能级 0 到 ${LEVEL_MAX} 的玻尔兹曼权重；更高能级的剩余权重在数字读数中单列`}>
          <rect width={chartW} height={chartH} fill="var(--w-bg)" />
          {[0, 0.25, 0.5, 0.75, 1].map((p) => <g key={p}>
            <line x1={padL} x2={padL + plotW} y1={yFor(p)} y2={yFor(p)} stroke="var(--w-grid)" />
            <text x={padL - 6} y={yFor(p) + 4} textAnchor="end" fontSize="10" fill="var(--w-muted)">{fmtEn(p, 2)}</text>
          </g>)}
          <line x1={padL} x2={padL + plotW} y1={padT + plotH} y2={padT + plotH} stroke="var(--w-axis)" />
          {levels.p.map((probability, n) => {
            const height = probability * plotH;
            return <g key={n}>
              <rect x={xFor(n) - barW / 2} y={padT + plotH - height} width={barW} height={Math.max(0, height)} rx={1} fill={probability > 1e-13 ? FMM_COLORS.blau : "var(--w-grid)"} />
              <text x={xFor(n)} y={padT + plotH + 14} textAnchor="middle" fontSize="10" fill="var(--w-text)">{n}</text>
            </g>;
          })}
          <text x={padL + plotW / 2} y={chartH - 8} textAnchor="middle" fontSize="11" fill="var(--w-text)">能级 n≤{LEVEL_MAX}（Eₙ/(ℏω)=n+1/2）</text>
          <text x={14} y={padT + plotH / 2} textAnchor="middle" fontSize="11" fill="var(--w-text)" transform={`rotate(-90 14 ${padT + plotH / 2})`}>权重 pₙ</text>
        </svg>
        <div className="text-sm tabular-nums space-y-1">
          <p>τ = {fmtEn(s.tau, 2)}；⟨E⟩ = {fmtEn(s.E, 4)} ℏω；C_V = {fmtEn(s.C, 4)} k_B；⟨n⟩ = {fmtEn(s.meanN, 4)}；p₀ = {fmtEn(s.p0, 4)}。</p>
          <p>经典：E = τ = {fmtEn(s.classicalE, 4)} ℏω；C = {fmtEn(s.classicalC, 1)} k_B；E−τ = {fmtEn(s.E - s.classicalE, 4)} ℏω。</p>
          <p>图中只画 n≤{LEVEL_MAX}：这些能级的权重和 = {fmtEn(levels.sum, 4)}；其余 = {fmtEn(Math.max(0, 1 - levels.sum), 4)}（高温下未显示的权重更大，只在读数中单列，不从图中删去）。</p>
          <p>三维 Einstein 晶体每原子（三方向，独立同频）：{THERMAL_EINSTEIN_FACTOR}C_V/k_B = {fmtEn(s.einsteinC, 4)}。<br />本图只画单个振子；势能最小值取零，基态能量为 {fmtEn(THERMAL_GROUND_E, 2)} ℏω。</p>
        </div>
      </div>
    </div>
    <Verdict labels={labels} kind={tau === 0 ? "neutral" : "ok"}>
      {tau === 0
        ? "τ=0 时只有基态：⟨E⟩=1/2 ℏω，C=0。零点能是温度无关的基态能量贡献，对温度求导为零。"
        : "有限温度下各能级按 pₙ=(1−e^(−1/τ))e^(−n/τ) 混合，不是把能量本征值线性叠加成一个单一能量。C 来自布居随温度重排；经典极限是 E→τ、C→k_B，而零点能不贡献 dE/dT。"}
    </Verdict>
    <p className="text-xs">单振子模型，ℏ=ω=1，Eₙ=(n+1/2)ℏω，⟨E⟩/ℏω = 1/2 + 1/(e^(1/τ)−1)。τ=0 分支精确取基态；τ&gt;0 用 expm1 与小 x 级数稳定求值，C_V/k_B = x²e^(−x)/(1−e^(−x))²，x=1/τ。图中不含原书 diamond 实验点；理论曲线示意重绘自 Shankar, Principles of Quantum Mechanics, second edition (1994), Chapter 7 Figure 7.3。三维 Einstein 晶体每原子热容是单振子的三倍，读数中已单独标明，不混入单振子曲线。</p>
  </div>;
}
