/** Checked by scripts/verify/small-oscillation.mjs.
 * One turning amplitude: quartic potential/force versus the quadratic reference.
 * No time evolution, no sampling, no nonlinear period.
 */
import { useState } from "react";
import { Slider, Plot, Task, Verdict, W_BUTTON, FMM_COLORS, fmtEn } from "../../lib";
import {
  smallOscillationState,
  shiftParameter,
  SMALL_OSC_LIMITS,
  SMALL_OSC_PRESETS,
  SMALL_OSC_THRESHOLD,
  type SmallOscillationParameters,
} from "./small-oscillation.mjs";

const labels = { neutral: "比较", ok: "二次近似够用", warn: "力的修正超限", fail: "二次近似不足" };
const pct = (v: number) => `${fmtEn(v * 100, 1)}%`;
const f = (v: number, d = 2) => fmtEn(v, d);

export function SmallOscillationLab() {
  const [p, setP] = useState<SmallOscillationParameters>({
    A: SMALL_OSC_PRESETS[1].A,
    g: SMALL_OSC_PRESETS[1].g,
  });
  const s = smallOscillationState(p);
  const set = (patch: Partial<SmallOscillationParameters>) => setP((old) => ({ ...old, ...patch }));
  const bumpA = (direction: number) => set({ A: shiftParameter("A", p.A, direction) });
  const bumpG = (direction: number) => set({ g: shiftParameter("g", p.g, direction) });
  const kind = s.branch === "exact" || s.branch === "within" ? "ok" : s.branch === "potential-only" ? "warn" : "fail";
  const correctionPercentDomain: [number, number] = [0, 100 * s.correctionDomain[1]];

  return (
    <div className="space-y-3">
      <Task>
        先预测：把振幅 A 加倍，力的相对修正会变成原来的几倍？再把 g 调到 0，看 5% 判据是否还需要。
      </Task>
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-4 items-start">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {SMALL_OSC_PRESETS.map((preset) => (
              <button type="button" className={W_BUTTON} key={preset.label} onClick={() => setP({ A: preset.A, g: preset.g })}>
                {preset.label}
              </button>
            ))}
          </div>
          <Slider
            label="振幅 A"
            value={p.A}
            min={SMALL_OSC_LIMITS.A.min}
            max={SMALL_OSC_LIMITS.A.max}
            step={SMALL_OSC_LIMITS.A.step}
            onChange={(A) => set({ A })}
            fmt={(v) => f(v, 1)}
          />
          <Slider
            label="四次项 g"
            value={p.g}
            min={SMALL_OSC_LIMITS.g.min}
            max={SMALL_OSC_LIMITS.g.max}
            step={SMALL_OSC_LIMITS.g.step}
            onChange={(g) => set({ g })}
            fmt={(v) => f(v, 2)}
          />
          <div className="flex gap-2 flex-wrap">
            <button type="button" className={W_BUTTON} disabled={p.A <= SMALL_OSC_LIMITS.A.min} onClick={() => bumpA(-1)}>
              A − 一格
            </button>
            <button type="button" className={W_BUTTON} disabled={p.A >= SMALL_OSC_LIMITS.A.max} onClick={() => bumpA(1)}>
              A + 一格
            </button>
            <button type="button" className={W_BUTTON} disabled={p.g <= SMALL_OSC_LIMITS.g.min} onClick={() => bumpG(-1)}>
              g − 一格
            </button>
            <button type="button" className={W_BUTTON} disabled={p.g >= SMALL_OSC_LIMITS.g.max} onClick={() => bumpG(1)}>
              g + 一格
            </button>
          </div>
          <button type="button" className={W_BUTTON} onClick={() => setP({ A: SMALL_OSC_PRESETS[1].A, g: SMALL_OSC_PRESETS[1].g })}>
            重置
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Plot
            width={420}
            height={250}
            xDomain={s.xDomain}
            yDomain={s.potentialDomain}
            xLabel="q（无量纲）"
            yLabel="V(q)（无量纲）"
            series={[
              { f: s.potential, label: "V", color: FMM_COLORS.blau },
              { f: s.harmonicPotential, label: "V₀", color: FMM_COLORS.orange, dash: [5, 4] },
            ]}
            vlines={[
              { at: -p.A, color: FMM_COLORS.grau, dash: [3, 3] },
              { at: p.A, color: FMM_COLORS.grau, dash: [3, 3] },
            ]}
            points={[
              { x: p.A, y: s.turningPotential, color: FMM_COLORS.rot, r: 3.5 },
              { x: -p.A, y: s.turningPotential, color: FMM_COLORS.rot, r: 3.5 },
            ]}
            ariaLabel="四次势能与二次参考势能；两条灰色竖线标出所选转折幅度正负 A，红点为该处的势能"
          />
          <Plot
            width={420}
            height={250}
            xDomain={s.xDomain}
            yDomain={s.forceDomain}
            xLabel="q（无量纲）"
            yLabel="F(q)（无量纲）"
            series={[
              { f: s.force, label: "F", color: FMM_COLORS.blau },
              { f: s.harmonicForce, label: "F₀", color: FMM_COLORS.orange, dash: [5, 4] },
            ]}
            vlines={[
              { at: -p.A, color: FMM_COLORS.grau, dash: [3, 3] },
              { at: p.A, color: FMM_COLORS.grau, dash: [3, 3] },
            ]}
            points={[
              { x: p.A, y: s.turningForce, color: FMM_COLORS.rot, r: 3.5 },
              { x: -p.A, y: s.force(-p.A), color: FMM_COLORS.rot, r: 3.5 },
            ]}
            ariaLabel="四次力与二次参考力；灰线标出转折幅度，红点为该两侧的力；曲线表示力场，不是粒子轨迹"
          />
          <Plot
            width={420}
            height={230}
            xDomain={s.correctionXDomain}
            yDomain={correctionPercentDomain}
            xLabel="振幅 A（无量纲）"
            yLabel="相对修正 / %"
            series={[
              { f: (a: number) => 100 * s.correctionForceAt(a), label: "力", color: FMM_COLORS.blau },
              { f: (a: number) => 100 * s.correctionPotentialAt(a), label: "势", color: FMM_COLORS.gruen },
            ]}
            hlines={[{ at: 100 * SMALL_OSC_THRESHOLD, label: "5%", color: FMM_COLORS.rot, dash: [5, 4] }]}
            vlines={[{ at: p.A, color: FMM_COLORS.orange }]}
            ariaLabel="势与力的相对修正百分比随振幅的二次增长，红色虚线为 5% 教学判据，橙色竖线为当前振幅"
          />
          <div className="space-y-1 text-sm tabular-nums">
            <p>
              A = {f(p.A, 1)}，g = {f(p.g, 2)}，二者均无量纲。
            </p>
            <p>
              V(A) = {f(s.turningPotential, 3)}，V₀(A) = {f(s.harmonicTurning, 3)}。
            </p>
            <p>
              |F(A)| = {f(Math.abs(s.turningForce), 3)}，|F₀(A)| = {f(Math.abs(s.harmonicForceAtTurning), 3)}。
            </p>
            <p>
              势的相对修正 = {pct(s.correctionPotential)}，力的相对修正 = {pct(s.correctionForce)}；判据线 = {pct(SMALL_OSC_THRESHOLD)}。
            </p>
          </div>
        </div>
      </div>
      <Verdict labels={labels} kind={kind}>
        {s.branch === "exact" && (
          <>g = 0，V(q) = q²/2 且 F(q) = −q。势与力的相对修正都严格为零，任意振幅都不需要 5% 判据。</>
        )}
        {s.branch === "within" && (
          <>在这组 A 与 g 下，势的相对修正为 {pct(s.correctionPotential)}，力的相对修正为 {pct(s.correctionForce)}，两者都不超过 5% 教学线。这只说明转折幅度处的四次项相对二次项够小，不证明整个非线性运动仍是简谐振动，也不给出真实周期。</>
        )}
        {s.branch === "potential-only" && (
          <>势的相对修正为 {pct(s.correctionPotential)}，仍在 5% 内；力的相对修正为 {pct(s.correctionForce)}，已经超过 5%。力含 q³，对振幅比势更敏感，所以“势看起来够二次”不等于力的误差也够小。</>
        )}
        {s.branch === "outside" && (
          <>势的相对修正为 {pct(s.correctionPotential)}，力的相对修正为 {pct(s.correctionForce)}，都超过 5%。在这个转折幅度上，四次项修正超过所选教学线，二次近似不满足这项精度要求。</>
        )}
      </Verdict>
      <p className="text-xs">
        V(q) = q²/2 + gq⁴/4，谐波参考 V₀(q) = q²/2；F = −dV/dq。长度与能量均无量纲，A 为正、g 非负。势图纵轴从 0 起，力图纵轴以 0 为中心，修正图纵轴以百分比覆盖到 A = 3 时的最大修正并保留 5% 线；势与力的图窗取 q 在 ±1.25A 内。5% 是明确选定的教学判据，不是原书常数。两个相对修正都按 A² 增长，所以 A 加倍时它们都变为四倍。实验只比较同一转折幅度处的局部展开，不积分运动，也不计算真实非线性周期。
      </p>
    </div>
  );
}
