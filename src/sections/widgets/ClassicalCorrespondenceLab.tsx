/** Coarse-grained quantum/classical oscillator comparison in units
 * hbar = m = omega = 1. Checked by scripts/verify/oscillator-wave.mjs.
 * Bars are finite-bin probabilities, not point densities. The fixed plot
 * window +/- (A + 3) is not renormalized; the quantum outside tail is printed
 * separately and the classical outside probability is exactly zero.
 */
import { useMemo, useState } from "react";
import { Plot, Slider, Task, Verdict, W_BUTTON, FMM_COLORS, fmtEn } from "../../lib";
import {
  CORRESPONDENCE_BINS_MAX,
  CORRESPONDENCE_BINS_MIN,
  CORRESPONDENCE_BINS_STEP,
  CORRESPONDENCE_DEFAULT,
  CORRESPONDENCE_N_MAX,
  CORRESPONDENCE_PRESETS,
  correspondenceState,
} from "./oscillator-wave.mjs";

type Parameters = { n: number; bins: number };
const labels = { neutral: "比较", ok: "粗粒化对应", warn: "差异明显", fail: "不成立" };

const f = (value: number, digits = 4) => fmtEn(value, digits);
const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};
const superscript = (text: string) => text.split("").map(char => SUPERSCRIPT[char] ?? char).join("");
const sci = (value: number) => {
  if (!Number.isFinite(value)) return value > 0 ? "∞" : "−∞";
  if (value === 0) return "0";
  if (Math.abs(value) >= 1e-3 && Math.abs(value) < 1e4) return fmtEn(value, 5);
  const [mantissa, exponent] = value.toExponential(2).split("e");
  return `${mantissa}×10${superscript(String(Number(exponent)))}`;
};

export function ClassicalCorrespondenceLab() {
  const [parameters, setParameters] = useState<Parameters>(CORRESPONDENCE_DEFAULT);
  const state = useMemo(
    () => correspondenceState(parameters.n, parameters.bins),
    [parameters.n, parameters.bins],
  );
  const update = (patch: Partial<Parameters>) =>
    setParameters(old => ({ ...old, ...patch }));

  const step = (values: number[]) => (q: number) => {
    if (q < state.window[0] || q >= state.window[1]) return 0;
    const fraction =
      (q - state.window[0]) / (state.window[1] - state.window[0]);
    const index = Math.min(
      state.bins - 1,
      Math.max(0, Math.floor(fraction * state.bins)),
    );
    return values[index] ?? 0;
  };
  const quantumStep = step(state.quantum);
  const classicalStep = step(state.classical);

  return (
    <div className="space-y-3">
      <Task>
        先预测：把 bin 调粗，量子振荡会不会被抹平？再比较低 n 与高 n 的有限 bin 概率。
      </Task>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {CORRESPONDENCE_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                className={W_BUTTON}
                onClick={() => setParameters({ n: preset.n, bins: preset.bins })}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <Slider
            label="能级 n"
            min={0}
            max={CORRESPONDENCE_N_MAX}
            step={1}
            value={parameters.n}
            onChange={value => update({ n: Math.round(value) })}
            fmt={value => fmtEn(value, 0)}
          />
          <Slider
            label="区间数 bin"
            min={CORRESPONDENCE_BINS_MIN}
            max={CORRESPONDENCE_BINS_MAX}
            step={CORRESPONDENCE_BINS_STEP}
            value={parameters.bins}
            onChange={value => update({ bins: Math.round(value) })}
            fmt={value => fmtEn(value, 0)}
          />

          <button
            type="button"
            className={W_BUTTON}
            onClick={() => setParameters(CORRESPONDENCE_DEFAULT)}
          >
            重置
          </button>
        </div>

        <div className="space-y-2 min-w-0">
          <Plot
            width={440}
            height={300}
            xDomain={state.window}
            yDomain={[0, state.yMax]}
            xLabel="位置 q（无量纲）"
            yLabel="每 bin 概率"
            series={[
              {
                f: quantumStep,
                color: FMM_COLORS.blau,
                label: "量子",
                fill: true,
              },
              {
                f: classicalStep,
                color: FMM_COLORS.orange,
                label: "经典",
                dash: [5, 4],
              },
            ]}
            vlines={[
              {
                at: -state.amplitude,
                color: FMM_COLORS.grau,
                dash: [3, 3],
              },
              {
                at: state.amplitude,
                color: FMM_COLORS.grau,
                dash: [3, 3],
                label: "A",
              },
            ]}
            ariaLabel={`n=${state.n}，共 ${state.bins} 个有限空间 bin 的量子与经典概率比较。阶梯条形的高度是未条件归一化的 bin 概率；量子窗外尾部单独列出，经典窗外概率为零。`}
          />
          <p className="text-xs">
            条形高度是未条件归一化的每 bin 概率，不是概率密度；纵轴按当前最大 bin
            概率缩放，只影响显示，不改变概率。量子窗内和略小于 1，差额就是单列的窗外尾部。灰虚线标出经典振幅 A。
          </p>
        </div>
      </div>

      <p className="text-sm tabular-nums">
        n = {state.n}；Eₙ = {f(state.energy)} ℏω；A = √(2n+1) = {f(state.amplitude)}；bin
        数 = {state.bins}，宽度 Δq = {f(state.binWidth)}。
        <br />
        量子：窗内 Σ ≈ {f(state.quantumSum, 8)}；窗外尾部 ≈ {sci(state.quantumTailValue)}（未积分余尾上界{" "}
        {sci(state.quantumTailBound)}）；全轴 Σ + 尾 ≈ {f(state.quantumTotal, 8)}。余尾上界不含数值积分误差。
        <br />
        经典：窗内 Σ = {f(state.classicalSum, 12)}；窗外 = {f(state.classicalOutside, 0)}（|q|
        大于 A 时经典概率为零）。
        <br />
        加入窗外类别后的粗粒化总变差 ≈ {f(state.totalVariation, 3)}（余尾贡献误差 ≤ {sci(state.totalVariationTailBound)}，另有数值积分误差）。0 表示每个 bin 及窗外类别的概率都相同，不是逐点密度相等。
      </p>

      <Verdict
        labels={labels}
        kind={
          state.branch === "high"
            ? "ok"
            : state.branch === "low"
              ? "warn"
              : "neutral"
        }
      >
        {state.branch === "high"
          ? "高 n 时，在较粗的有限 bin 内，量子概率与经典 arcsine 分布相近，但这是粗粒化后的统计比较，不是 |φₙ|² 与经典密度逐点一致。"
          : state.branch === "low"
            ? "低 n 时，量子分布与经典 arcsine 分布差异明显；把 bin 调粗只能抹平细节，不能把低激发态变成经典分布。"
            : "在中间 n，有限 bin 已经能看出经典分布的包络，但量子振荡仍清晰；高 n 的对应要理解为粗粒化后的统计相近。"}
        当前 n={state.n}、bin={state.bins} 的总变差为 {f(state.totalVariation, 3)}；把 bin
        调细可重新分辨量子振荡，但不同边界也会改变比较，差异不保证随 bin 数单调变化。经典概率只分布在 |q|≤A，量子窗外尾部单列，图中 bin
        概率没有按窗口重归一。
      </Verdict>

      <p className="text-xs">
        单位：ℏ=m=ω=1；A=√(2n+1)，Eₙ=n+1/2；q 无量纲。经典每 bin
        概率用 arcsin(clamp(b/A))−arcsin(clamp(a/A)) 除以 π，量子用 φₙ²
        的独立数值积分，均为有限 bin 概率而不是转折点处的点密度。图中是未条件归一化的 bin
        概率，量子窗内和略小于 1，差额单列为窗外尾部，全轴归一仍为 1。重绘教材中经典与量子分布比较的示意，不是原始实验数据，也不模拟单条经典轨迹。
      </p>
    </div>
  );
}
