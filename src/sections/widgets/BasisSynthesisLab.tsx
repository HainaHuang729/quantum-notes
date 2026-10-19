/** Energy-basis coefficients and the position picture of the same oscillator state.
 * Checked: scripts/verify/oscillator-algebra.mjs.
 * Fixed phi_0 width (no width scan), fixed position window [-5,5], no timers.
 */
import { useState } from "react";
import { Plot, Slider, Task, Verdict, W_BUTTON, FMM_COLORS, fmtEn } from "../../lib";
import {
  BASIS_AMPLITUDE_MAX,
  BASIS_DENSITY_MAX,
  BASIS_GLOBAL_MAX,
  BASIS_PHASE_MAX,
  BASIS_PHASE_STEPS,
  BASIS_PRESETS,
  BASIS_Q_WINDOW,
  BASIS_TIME_MAX,
  synthesisState,
  type SynthesisParameters,
} from "./oscillator-algebra.mjs";

type BasisPreset = (typeof BASIS_PRESETS)[number];
const labels = { neutral: "观察", ok: "同一态", warn: "注意窗口", fail: "重新比较" };
const phaseText = (step: number) => (step === 0 ? "0" : `${step}π/${BASIS_PHASE_STEPS}`);
const timeText = (step: number) => (step === 0 ? "0" : step === BASIS_TIME_MAX ? "2π" : `${step}π/${BASIS_PHASE_STEPS}`);
const factorText = ["1", "i", "−1", "−i"];
const sci = (x: number) => x === 0 ? "0" : x.toExponential(1).replace("e-", "×10⁻").replace("e+", "×10");
const zText = (z: [number, number]) => `${fmtEn(z[0], 3)} ${z[1] < 0 ? "−" : "+"} ${fmtEn(Math.abs(z[1]), 3)}i`;

export function BasisSynthesisLab() {
  const [p, setP] = useState<SynthesisParameters>({ w: 0.5, phaseStep: 0, timeStep: 0, globalStep: 0 });
  const s = synthesisState(p);
  const set = (patch: Partial<SynthesisParameters>) => setP((old) => ({ ...old, ...patch }));
  const choose = (preset: BasisPreset) => setP({
    w: preset.w,
    phaseStep: preset.phaseStep,
    timeStep: preset.timeStep,
    globalStep: preset.globalStep,
  });
  const eigen = p.w === 0 || p.w === 1;

  return <div className="space-y-3">
    <Task>先整体乘 i，预测 |ψ|² 和能量权重是否改变；再改相对相位或单步时间，观察干涉项怎样移动位置均值。</Task>
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {BASIS_PRESETS.map((preset) => <button key={preset.id} type="button" className={W_BUTTON} onClick={() => choose(preset)}>{preset.label}</button>)}
        </div>
        <Slider label="φ₀ 权重 w" value={p.w} onChange={(w) => set({ w })} min={0} max={1} step={0.05} />
        <Slider label="相对相位 φ" value={p.phaseStep} onChange={(phaseStep) => set({ phaseStep })} min={0} max={BASIS_PHASE_MAX} step={1} fmt={phaseText} />
        <Slider label="时间 t" value={p.timeStep} onChange={(timeStep) => set({ timeStep })} min={0} max={BASIS_TIME_MAX} step={1} fmt={timeText} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={W_BUTTON} disabled={p.timeStep >= BASIS_TIME_MAX} onClick={() => set({ timeStep: Math.min(BASIS_TIME_MAX, p.timeStep + 1) })}>单步 +π/8</button>
          <button type="button" className={W_BUTTON} onClick={() => set({ timeStep: 0 })}>时间归零</button>
          <button type="button" className={W_BUTTON} onClick={() => set({ globalStep: (p.globalStep + 1) % (BASIS_GLOBAL_MAX + 1) })}>整体乘 i</button>
          <button type="button" className={W_BUTTON} onClick={() => choose(BASIS_PRESETS[2])}>重置全部</button>
        </div>
        <p className="text-xs">φ 与 t 都取 π/8 的整数倍；t 从 0 到 2π 共 {BASIS_TIME_MAX} 步。κ = gπ/2 是人为加入的全局相位，g = {p.globalStep}。</p>
      </div>
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Plot width={420} height={300} xDomain={BASIS_Q_WINDOW} yDomain={[0, BASIS_DENSITY_MAX]} xLabel="位置 q（振子长度）" yLabel="概率密度 |ψ|²" series={[
            { f: s.density, color: FMM_COLORS.blau, label: "密度", fill: true },
            { f: s.component0, color: FMM_COLORS.orange, label: "φ₀²", dash: [4, 3] },
            { f: s.component1, color: FMM_COLORS.gruen, label: "φ₁²", dash: [2, 3] },
          ]} vlines={[{ at: s.meanQ, color: FMM_COLORS.rot, label: "⟨q⟩" }]} ariaLabel="固定位置窗口内的概率密度及两个能量本征态的加权贡献；整条线归一，不在窗口内重新归一化" />
          <Plot width={420} height={300} xDomain={BASIS_Q_WINDOW} yDomain={[-BASIS_AMPLITUDE_MAX, BASIS_AMPLITUDE_MAX]} xLabel="位置 q（振子长度）" yLabel="波函数分量" series={[
            { f: s.real, color: FMM_COLORS.blau, label: "实部" },
            { f: s.imag, color: FMM_COLORS.orange, label: "虚部" },
          ]} hlines={[{ at: 0, color: FMM_COLORS.grau }]} ariaLabel="同一态在位置空间的实部与虚部；整体乘 i 会交换并翻转这两个分量" />
        </div>
        <div className="text-sm tabular-nums space-y-1">
          <p>c₀ = {zText(s.c0)}；c₁ = {zText(s.c1)}。</p>
          <p>P(E₀)=w = {fmtEn(s.w, 3)}；P(E₁)=1−w = {fmtEn(1 - s.w, 3)}；⟨E⟩/(ℏω) = {fmtEn(s.meanE, 3)}。</p>
          <p>φ = {phaseText(p.phaseStep)}；t = {timeText(p.timeStep)}；δ = φ−t（mod 2π） = {fmtEn(s.delta, 3)} rad（{fmtEn(s.delta / Math.PI, 3)}π）。</p>
          <p>⟨q⟩ = {fmtEn(s.meanQ, 4)}；Δq = {fmtEn(Math.sqrt(Math.max(0, s.varianceQ)), 4)}；κ = {p.globalStep}π/2，e^(iκ) = {factorText[p.globalStep]}。</p>
          <p>窗内概率 = {fmtEn(s.windowMass, 9)}；窗外尾部 ≈ {sci(s.tail)}。</p>
        </div>
      </div>
    </div>
    <Verdict labels={labels} kind="ok">
      {eigen ? (p.globalStep > 0
        ? "当前只占一个能量本征态；整体乘 i 旋转了实部与虚部，但密度、⟨q⟩ 和能量权重都不变。全局相位不进入可观测概率。"
        : "当前只占一个能量本征态，时间只改变整体相位；密度与 ⟨q⟩ 保持不变。w=0 或 1 是滑块端点的精确情形。")
        : p.globalStep > 0
          ? "整体乘 i 后 c₀、c₁ 同时旋转，实部与虚部曲线改变；|ψ|²、⟨q⟩ 和能量权重 w、1−w 不变。全局相位不可观测，相对相位才控制干涉。"
          : "c₀、c₁ 是同一个态在能量基的系数；位置图把它们与 φ₀、φ₁ 逐点相加。相对相位 δ=φ−t 控制干涉项，所以密度与 ⟨q⟩ 随时间变，而 P(E₀)=w、P(E₁)=1−w 不变。"}
    </Verdict>
    <p className="text-xs">单位 ℏ=m=ω=1；ψ = √w φ₀ e^(−it/2) + √(1−w) e^(iφ) φ₁ e^(−3it/2)，φ₀=π^(−1/4)e^(−q²/2)，φ₁=√2 q φ₀；E₀=1/2、E₁=3/2（均以 ℏω 计）。密度图中的虚线是加权成分 wφ₀² 与 (1−w)φ₁²，实线还包含干涉项。位置窗固定 [−5,5]，整条线归一，窗外尾部约 {sci(s.tail)}，图内曲线没有在窗内重新归一化。纵轴上限由 |ψ|²≤φ₀²+φ₁²≤0.685 与 |ψ|≤0.828 定出。φ₀ 宽度固定，不在这里重复宽度展宽实验；整体乘 i 只是全局相位。</p>
  </div>;
}
