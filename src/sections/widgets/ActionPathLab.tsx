/** Shared pure model action-path.mjs; checked by scripts/verify/action-path.mjs.
 * Endpoints remain fixed. The action curve is analytical; numerical Simpson
 * integration in the verification script checks it independently.
 * Slider-driven only, no autoplay; reduced-motion users see the same states.
 */
import { useState } from "react";
import { FMM_COLORS, Plot, Slider, Task, Verdict, fmtEn } from "../../lib";
import { W_BUTTON } from "../../lib/widgets/surface";
import { ACTION_PRESETS, POLAR_DIFFERENTIAL, actionState, trialPath, type ActionParameters } from "./action-path.mjs";

const f = (n: number) => fmtEn(Math.abs(n) < 1e-12 ? 0 : n, 4);
const feedback = { neutral: "观察", ok: "成立", warn: "注意", fail: "不成立" };
const presetNames: Record<string, string> = { free: "自由粒子", down: "降低作用量", up: "提高作用量", flat: "临界时长", near: "接近临界", zero: "幅度归零" };

export function ActionPathLab() {
  const [parameters, setParameters] = useState<ActionParameters>(ACTION_PRESETS[0]);
  const state = actionState(parameters);
  const change = (patch: Partial<ActionParameters>) => setParameters(old => ({ ...old, ...patch }));
  const actionBound = Math.max(.15, Math.abs(state.coefficient) * 1.15);
  return <div className="space-y-3 action-path-lab">
    <Task>先比较“降低作用量”与“提高作用量”预设，再把幅度 a 移到零，观察曲线斜率。</Task>
    <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)] action-layout">
    <div className="space-y-2 action-controls">
    <div className="grid grid-cols-2 gap-2">{ACTION_PRESETS.map(p => <button key={p.id} type="button" className={`${W_BUTTON} text-xs`} aria-label={p.label} onClick={() => setParameters(p)}>{presetNames[p.id]}</button>)}</div>
    <div className="flex flex-wrap gap-2" role="group" aria-label="选择势能模型">
      <button type="button" className={W_BUTTON} aria-pressed={parameters.system === "free"} onClick={() => change({ system: "free" })}>自由粒子 V = 0</button>
      <button type="button" className={W_BUTTON} aria-pressed={parameters.system === "oscillator"} onClick={() => change({ system: "oscillator" })}>谐振子 V = x²/2</button>
    </div>
    <Slider label="变形幅度 a" value={parameters.amplitude} onChange={amplitude => change({ amplitude })} min={-1} max={1} step={.02} fmt={v => fmtEn(v, 2)} />
    <Slider label="时长 T / π" value={parameters.ratio} onChange={ratio => change({ ratio })} min={.5} max={2.5} step={.01} fmt={v => fmtEn(v, 2)} />
    <Slider label="半波个数 n" value={parameters.n} onChange={n => change({ n })} min={1} max={3} step={1} fmt={v => fmtEn(v, 0)} />
    <p className="text-sm">固定 m = 1、x(0) = x(T) = 0；ω = {state.omega}，T = {f(parameters.ratio)} π ≈ {f(state.duration)}。这里 T 表示总时长。</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 content-start action-graphs">
      <div><h4 className="text-sm font-semibold">候选路径与经典路径</h4><Plot width={360} height={235} xDomain={[0, state.duration]} yDomain={[-1.15, 1.15]} xLabel="时间 t" yLabel="位置 x" ariaLabel="固定端点的正弦候选路径与零位置的经典路径" series={[
        { f: () => 0, color: FMM_COLORS.grau, dash: [5, 4], label: "经典路径 x = 0" },
        { f: t => trialPath(t, parameters), color: FMM_COLORS.blau, label: "候选路径" },
      ]} points={[{ x: 0, y: 0, color: FMM_COLORS.grau }, { x: state.duration, y: 0, color: FMM_COLORS.grau }]} /></div>
      <div><h4 className="text-sm font-semibold">这族路径的作用量</h4><Plot width={360} height={235} xDomain={[-1, 1]} yDomain={[-actionBound, actionBound]} xLabel="幅度 a" yLabel="作用量 S" ariaLabel="作用量随正弦路径幅度变化的二次函数" series={[
        { f: a => state.coefficient * a * a, color: FMM_COLORS.orange, label: "S(a)" },
      ]} points={[{ x: parameters.amplitude, y: state.action, color: FMM_COLORS.blau }, { x: 0, y: 0, color: FMM_COLORS.grau }]} hlines={[{ at: 0, dash: [3, 3] }]} /></div>
    <p className="text-sm tabular-nums sm:col-span-2">xₐ(t) = a sin(nπt/T)；S(a) = C a²，C = {f(state.coefficient)}；当前 S = {f(state.action)}，dS/da = {f(state.slope)}。</p>
    </div>
    </div>
    <Verdict kind={state.branch === "decrease" || state.branch.startsWith("near-") ? "warn" : state.branch === "flat" ? "neutral" : "ok"} labels={feedback}>
      {state.branch === "stationary" ? "a 精确为零：当前是静止的经典路径，作用量为零，一阶斜率也为零。曲线向上或向下弯仍须另看。"
        : state.branch === "flat" ? "临界时长精确成立：这族正弦路径的作用量全为零，而且每一条都满足谐振子运动方程。端点条件此时不能唯一选出路径。"
        : state.branch === "near-flat" ? "接近临界时长：曲线很平，但 C 仍非零，不能把近似水平当成整族作用量相等。"
        : state.branch === "near-stationary" ? "幅度很接近零，但尚未回到经典路径。作用量差是幅度的二次量，一阶变化随幅度趋于零。"
        : state.branch === "increase" ? "当前变形提高了作用量：沿这一族看，a = 0 是最小点。这尚未检查其他所有允许路径。"
        : "当前变形降低了作用量：静止路径虽然满足驻定条件，却不是最小点。保持相同时长并提高 n，可找到使作用量增大的方向。"}
    </Verdict>
  </div>;
}

/** Differential geometry reconstruction of source Figure 2.3. No finite arc
 * equality is claimed; radial and tangential increments are perpendicular.
 * Orthogonality of drawn vectors checked in scripts/verify/action-path.mjs.
 */
export function PolarStepFigure() {
  const { origin: o, point: p, radial: dr, tangential: dt } = POLAR_DIFFERENTIAL;
  const r = [p[0] + dr[0], p[1] + dr[1]], q = [r[0] + dt[0], r[1] + dt[1]];
  return <figure className="my-3"><svg viewBox="0 0 380 285" width="380" height="285" className="max-w-full h-auto mx-auto" role="img" aria-label="极坐标局部位移：径向 dρ 与切向 ρdφ 互相垂直，合成位移 dℓ。">
    <g fill="none" stroke="var(--w-axis)" strokeWidth="1.5"><path d="M70 30V240H350" /><path d={`M${o.join(" ")}L${p.join(" ")}`} strokeDasharray="5 4" /><path d="M105 240 A35 35 0 0 0 100 222" /><path d="M263 124 L267 131 L274 127" /></g>
    <g strokeWidth="3" fill="none"><path d={`M${p.join(" ")}L${r.join(" ")}`} stroke={FMM_COLORS.blau} /><path d={`M${r.join(" ")}L${q.join(" ")}`} stroke={FMM_COLORS.orange} /><path d={`M${p.join(" ")}L${q.join(" ")}`} stroke={FMM_COLORS.gruen} /></g>
    <g fill="var(--w-text)" fontSize="15"><text x="343" y="259">x</text><text x="54" y="35">y</text><text x="52" y="258">O</text><text x="109" y="232">φ</text><text x="153" y="182">ρ</text><text x="235" y="119">dρ</text><text x="303" y="140">ρ dφ</text><text x="265" y="183">dℓ</text></g>
    <circle cx={p[0]} cy={p[1]} r="4" fill="var(--w-text)" />
    <text x="192" y="278" textAnchor="middle" fill="var(--w-muted)" fontSize="12">局部微分位移示意，非有限圆弧比例图</text>
  </svg></figure>;
}
