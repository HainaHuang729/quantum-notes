/** Exact harmonic-oscillator eigenstates in units hbar = m = omega = 1.
 * Checked by scripts/verify/oscillator-wave.mjs. The fixed display window
 * [-7,7] is never renormalized; the outside tail and the forbidden-region
 * integral (with a conservative cutoff bound) are printed separately.
 */
import { useMemo, useState } from "react";
import { Plot, Slider, Task, Verdict, W_BUTTON, W_BUTTON_AKTIV, FMM_COLORS, fmtEn } from "../../lib";
import {
  OSC_DENSITY_YLIM,
  OSC_LEVEL_E_MAX,
  OSC_LEVEL_WINDOW,
  OSC_N_MAX,
  OSC_PRESETS,
  OSC_Q_WINDOW,
  OSC_WAVE_YLIM,
  oscillatorState,
} from "./oscillator-wave.mjs";

type Mode = "wave" | "density";
const labels = { neutral: "观察", ok: "精确解", warn: "注意", fail: "不成立" };

const f = (value: number) => fmtEn(value, 4);
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

const LEVEL_BOX = { left: 42, right: 282, top: 30, bottom: 262 };
const levelX = (q: number) =>
  LEVEL_BOX.left +
  ((q - OSC_LEVEL_WINDOW[0]) / (OSC_LEVEL_WINDOW[1] - OSC_LEVEL_WINDOW[0])) *
    (LEVEL_BOX.right - LEVEL_BOX.left);
const levelY = (energy: number) =>
  LEVEL_BOX.bottom -
  (energy / OSC_LEVEL_E_MAX) * (LEVEL_BOX.bottom - LEVEL_BOX.top);
const POTENTIAL_PATH = Array.from({ length: 81 }, (_, i) => {
  const q =
    OSC_LEVEL_WINDOW[0] +
    ((OSC_LEVEL_WINDOW[1] - OSC_LEVEL_WINDOW[0]) * i) / 80;
  return `${i === 0 ? "M" : "L"}${levelX(q).toFixed(2)},${levelY((q * q) / 2).toFixed(2)}`;
}).join(" ");

export function OscillatorEigenLab() {
  const [n, setN] = useState(0);
  const [mode, setMode] = useState<Mode>("wave");
  const state = useMemo(() => oscillatorState(n), [n]);
  const setLevel = (value: number) =>
    setN(Math.max(0, Math.min(OSC_N_MAX, Math.round(value))));
  const isWave = mode === "wave";
  const turning = state.turningPoint;
  const yDomain: [number, number] = isWave
    ? [-OSC_WAVE_YLIM, OSC_WAVE_YLIM]
    : [0, OSC_DENSITY_YLIM];

  return (
    <div className="space-y-3">
      <Task>
        先预测：n 增大时，节点数和禁阻区概率各自怎样变？再切换波函数与密度，检查转折点外是否仍有非零部分。
      </Task>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {OSC_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                className={W_BUTTON}
                onClick={() => setLevel(preset.n)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <Slider
            label="能级 n"
            min={0}
            max={OSC_N_MAX}
            step={1}
            value={n}
            onChange={setLevel}
            fmt={value => fmtEn(value, 0)}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={isWave ? W_BUTTON_AKTIV : W_BUTTON}
              aria-pressed={isWave}
              onClick={() => setMode("wave")}
            >
              波函数
            </button>
            <button
              type="button"
              className={!isWave ? W_BUTTON_AKTIV : W_BUTTON}
              aria-pressed={!isWave}
              onClick={() => setMode("density")}
            >
              概率密度
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={W_BUTTON}
              disabled={n === 0}
              onClick={() => setLevel(n - 1)}
            >
              前一能级
            </button>
            <button
              type="button"
              className={W_BUTTON}
              disabled={n === OSC_N_MAX}
              onClick={() => setLevel(n + 1)}
            >
              后一能级
            </button>
          </div>

          <button
            type="button"
            className={W_BUTTON}
            onClick={() => {
              setN(0);
              setMode("wave");
            }}
          >
            重置
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
          <Plot
            width={420}
            height={300}
            xDomain={OSC_Q_WINDOW}
            yDomain={yDomain}
            xLabel="无量纲位置 q"
            yLabel={isWave ? "φₙ(q)" : "|φₙ(q)|²"}
            series={[
              {
                f: isWave ? state.phi : state.density,
                color: FMM_COLORS.blau,
                label: isWave ? "φₙ" : "|φₙ|²",
                fill: !isWave,
              },
            ]}
            vlines={[
              {
                at: -turning,
                color: FMM_COLORS.orange,
                dash: [4, 3],
              },
              {
                at: turning,
                color: FMM_COLORS.orange,
                dash: [4, 3],
                label: "q_t",
              },
            ]}
            readout
            ariaLabel={`n=${state.n} 的${isWave ? "波函数" : "概率密度"}，固定窗口 q 从负7到7；橙色虚线为经典转折点正负 ${fmtEn(turning, 3)}。窗口外概率单独列出，没有按窗口重新归一。`}
          />

          <div className="min-w-0">
            <svg
              viewBox="0 0 340 300"
              width={340}
              height={300}
              className="w-full h-auto"
              role="img"
              aria-label={`n=${state.n} 的能级与势 q²/2。蓝色横线是所选能级 E=${fmtEn(state.energy, 2)}，蓝色带是允许区，橙色点与虚线是转折点正负 ${fmtEn(turning, 3)}。`}
            >
              <text x="6" y="18" fill="var(--w-muted)" fontSize="10">
                E/ℏω
              </text>
              <text x="42" y="18" fill="var(--w-text)" fontSize="11">
                Eₙ=n+1/2，V=q²/2
              </text>

              <line
                x1={LEVEL_BOX.left}
                x2={LEVEL_BOX.right}
                y1={LEVEL_BOX.bottom}
                y2={LEVEL_BOX.bottom}
                stroke="var(--w-axis)"
              />
              <line
                x1={levelX(0)}
                x2={levelX(0)}
                y1={LEVEL_BOX.top}
                y2={LEVEL_BOX.bottom}
                stroke="var(--w-axis)"
              />

              {[0, 2, 4, 6, 8, 10, 12].map(energy => (
                <g key={energy}>
                  <line
                    x1={LEVEL_BOX.left - 3}
                    x2={LEVEL_BOX.left}
                    y1={levelY(energy)}
                    y2={levelY(energy)}
                    stroke="var(--w-axis)"
                  />
                  <text
                    x={LEVEL_BOX.left - 6}
                    y={levelY(energy) + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="var(--w-muted)"
                  >
                    {energy}
                  </text>
                </g>
              ))}
              {[-4, -2, 0, 2, 4].map(q => (
                <text
                  key={q}
                  x={levelX(q)}
                  y={LEVEL_BOX.bottom + 13}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--w-muted)"
                >
                  {q}
                </text>
              ))}

              <rect
                x={levelX(-turning)}
                y={levelY(state.energy)}
                width={levelX(turning) - levelX(-turning)}
                height={levelY(0) - levelY(state.energy)}
                fill={FMM_COLORS.blau}
                opacity={0.08}
              />
              <path
                d={POTENTIAL_PATH}
                fill="none"
                stroke={FMM_COLORS.gruen}
                strokeWidth={2}
              />

              {Array.from({ length: OSC_N_MAX + 1 }, (_, level) => level).map(level => {
                const width = Math.sqrt(2 * level + 1);
                const y = levelY(level + 0.5);
                const selected = level === state.n;
                return (
                  <line
                    key={level}
                    x1={levelX(-width)}
                    x2={levelX(width)}
                    y1={y}
                    y2={y}
                    stroke={selected ? FMM_COLORS.blau : FMM_COLORS.grau}
                    strokeWidth={selected ? 3 : 1.2}
                    opacity={selected ? 1 : 0.55}
                  />
                );
              })}

              <line
                x1={levelX(-turning)}
                x2={levelX(-turning)}
                y1={levelY(state.energy)}
                y2={levelY(0)}
                stroke={FMM_COLORS.orange}
                strokeWidth={1.2}
                strokeDasharray="3 3"
              />
              <line
                x1={levelX(turning)}
                x2={levelX(turning)}
                y1={levelY(state.energy)}
                y2={levelY(0)}
                stroke={FMM_COLORS.orange}
                strokeWidth={1.2}
                strokeDasharray="3 3"
              />
              <circle
                cx={levelX(-turning)}
                cy={levelY(state.energy)}
                r={3}
                fill={FMM_COLORS.orange}
              />
              <circle
                cx={levelX(turning)}
                cy={levelY(state.energy)}
                r={3}
                fill={FMM_COLORS.orange}
              />

              <text
                x={LEVEL_BOX.right + 6}
                y={levelY(state.energy) - 12}
                fill={FMM_COLORS.blau}
                fontSize="9"
              >
                n={state.n}
              </text>
              <text
                x={LEVEL_BOX.right + 6}
                y={levelY(state.energy) - 1}
                fill={FMM_COLORS.blau}
                fontSize="9"
              >
                E={fmtEn(state.energy, 1)}
              </text>

              <text
                x={levelX(0)}
                y={LEVEL_BOX.bottom + 28}
                textAnchor="middle"
                fontSize="10"
                fill="var(--w-text)"
              >
                q（无量纲）
              </text>
            </svg>
            <p className="text-xs">蓝带：当前 n 的允许区；橙点与虚线：转折点。</p>
          </div>
        </div>
      </div>

      <p className="text-sm tabular-nums">
        n = {state.n}；Eₙ = {f(state.energy)} ℏω；q_t = ±{f(turning)}；宇称：
        {state.parity === "even" ? "偶函数" : "奇函数"}；节点数：{state.nodes}。
        <br />
        禁阻区概率 P ≈ {fmtEn(state.forbiddenProbability, 6)}（数值积分到 |q| ={" "}
        {state.forbiddenLimit}，未积分尾部 ≤ {sci(state.forbiddenBound)}；此尾界不含数值积分误差）。
        <br />
        图窗内概率 ≈ {fmtEn(state.windowMass, 8)}；窗外尾部 ≈{" "}
        {sci(state.windowTailValue)}（积分到 |q| = {state.windowTailLimit}，余项上界{" "}
        {sci(state.windowTailBound)}）；数值归一核对 ≈ {fmtEn(state.normCheck, 8)}；全轴归一为 1，未按图窗重归一。
      </p>

      <Verdict labels={labels} kind="ok">
        这是精确归一的定态：Eₙ = n+1/2，q_t = ±√(2n+1)，有 {state.nodes} 个节点，宇称随 n
        的奇偶交替。在这组 0 到 10 的态中，n 每增加一，节点数加一，禁阻区概率下降。两条橙线外侧是经典禁阻区，|φₙ|²
        在那里不为零，当前积分概率约 {fmtEn(state.forbiddenProbability, 6)}。图窗固定为 [-7,7]，窗外尾部单列，曲线没有按图窗重归一。
      </Verdict>

      <p className="text-xs">
        单位：ℏ=m=ω=1；长度单位 √(ℏ/mω)，能量单位 ℏω，q 无量纲。纵轴固定：波函数
        ±0.9，密度 0 到 0.8；图窗固定 [-7,7]。禁阻区积分到 |q|=10，余项上界见读数。这里只画解析定态，不含时间演化、测量或实验数据。
      </p>
    </div>
  );
}
