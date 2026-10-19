/**
 * Early chapter laboratories: coordinates, complex inner product, Gram–Schmidt.
 * Numeric branches and all presets checked by scripts/verify/early-labs.mjs.
 * Pure slider updates, no animation or randomness; honours reduced motion.
 */
import { useId, useState } from "react";
import { FMM_COLORS, Slider, Task, Verdict, fmtEn } from "../../lib";
import { W_BUTTON } from "../../lib/widgets/surface";

type Vec = [number, number];
type Arrow = { name: string; end: Vec; start?: Vec; color: string; dashed?: boolean };
const f = (x: number) => fmtEn(Math.abs(x) < 1e-10 ? 0 : x, 3);
const labels = { neutral: "观察", ok: "成立", warn: "注意", fail: "无法构造" };

function VectorPlane({ arrows, caption }: { arrows: Arrow[]; caption: string }) {
  const uid = useId().replace(/:/g, "");
  const extent = Math.max(1.5, ...arrows.flatMap(a => [...a.end, ...(a.start ?? [0, 0])].map(Math.abs)));
  const bound = extent * 1.25;
  const scale = 106 / bound;
  const px = (x: number) => 200 + x * scale;
  const py = (y: number) => 145 - y * scale;
  return <div>
    <svg viewBox="0 0 400 290" width="400" height="290" role="img" aria-label={caption} className="w-full h-auto max-w-[480px] mx-auto">
      <defs>{arrows.map((a, i) => <marker key={i} id={`${uid}-${i}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={a.color} /></marker>)}</defs>
      <rect x="45" y="20" width="310" height="250" rx="8" fill="var(--w-bg)" stroke="var(--w-border)" />
      {[-1, -.5, .5, 1].map(t => <g key={t} stroke="var(--w-grid)"><line x1={px(t * bound)} x2={px(t * bound)} y1="29" y2="261" /><line x1="55" x2="345" y1={py(t * bound)} y2={py(t * bound)} /></g>)}
      <g stroke="var(--w-axis)"><line x1="55" x2="345" y1="145" y2="145" /><line x1="200" x2="200" y1="29" y2="261" /></g>
      <g fill="var(--w-muted)" fontSize="11"><text x="340" y="138">x</text><text x="207" y="35">y</text><text x="208" y="159">0</text><text x={px(bound)} y="159" textAnchor="middle">{f(bound)}</text><text x={px(-bound)} y="159" textAnchor="middle">{f(-bound)}</text><text x="190" y={py(bound)} textAnchor="end">{f(bound)}</text><text x="190" y={py(-bound)} textAnchor="end">{f(-bound)}</text></g>
      {arrows.map((a, i) => <line key={i} x1={px((a.start ?? [0, 0])[0])} y1={py((a.start ?? [0, 0])[1])} x2={px(a.end[0])} y2={py(a.end[1])} stroke={a.color} strokeWidth={a.dashed ? 2 : 3} strokeDasharray={a.dashed ? "5 4" : undefined} markerEnd={`url(#${uid}-${i})`} />)}
    </svg>
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">{arrows.map((a, i) => <span key={i}><span aria-hidden="true" style={{ color: a.color }}>━ </span>{a.name} = ({f(a.end[0] - (a.start?.[0] ?? 0))}, {f(a.end[1] - (a.start?.[1] ?? 0))})</span>)}</div>
  </div>;
}

export function BasisLab() {
  const [theta, setTheta] = useState(90);
  const radians = theta * Math.PI / 180;
  const s = Math.sin(radians), c = Math.cos(radians);
  const singular = theta === 0;
  const near = !singular && Math.min(theta, 180 - theta) <= 5;
  const b = singular ? null : 1 / s;
  const a = b === null ? null : 1 - b * c;
  const arrows: Arrow[] = [
    { name: "基 e₁", end: [1, 0], color: FMM_COLORS.blau },
    { name: "基 e₂", end: [c, s], color: FMM_COLORS.orange },
    { name: "目标 V", end: [1, 1], color: FMM_COLORS.gruen },
  ];
  if (a !== null && b !== null) arrows.push({ name: "a e₁", end: [a, 0], color: FMM_COLORS.blau, dashed: true }, { name: "b e₂（平移）", start: [a, 0], end: [1, 1], color: FMM_COLORS.orange, dashed: true });
  return <div>
    <Task>先预测：把基向量转到几乎平行，固定目标的分量会变大还是变小？</Task>
    <Slider label="夹角 θ" value={theta} onChange={setTheta} min={0} max={175} step={1} unit="°" fmt={v => fmtEn(v, 0)} />
    <div className="flex flex-wrap gap-2 my-3">{[90, 45, 2, 0].map(t => <button type="button" className={W_BUTTON} key={t} onClick={() => setTheta(t)}>θ = {t}°</button>)}</div>
    <VectorPlane arrows={arrows} caption={`固定目标向量与角度为 ${theta} 度的两支候选基。虚线给出分量合成。`} />
    <p className="text-sm tabular-nums">e₂ = ({f(c)}, {f(s)})；a = {a === null ? "不存在" : f(a)}；b = {b === null ? "不存在" : f(b)}。图形会自动缩放以容纳全部向量。</p>
    <Verdict kind={singular ? "fail" : near ? "warn" : "ok"} labels={labels}>
      {singular ? "精确平行：两支基都沿 x 轴，目标的 y 分量无法获得。" : near ? "接近平行但仍独立：分量大幅抵消，微小角度变化会明显改变坐标。" : "两支基线性无关：存在唯一的 a、b，合成结果始终为 V = (1, 1)。"}
    </Verdict>
  </div>;
}

export function ComplexInnerLab() {
  const [t, setT] = useState(1);
  const correct = 1 + t, wrong = 1 - t;
  const normW = Math.sqrt(1 + t * t);
  const orthogonal = t === -1;
  const near = !orthogonal && Math.abs(correct) <= .1;
  const y = (v: number) => 150 - v * 30;
  return <div>
    <Task>先找到 W = V 的状态，再找到真正正交的状态，比较两套计算。</Task>
    <Slider label="W 中的参数 t" value={t} onChange={setT} min={-2} max={2} step={.05} fmt={v => fmtEn(v, 2)} />
    <div className="flex flex-wrap gap-2 my-3">{[1, -1, -.95, 0].map(v => <button type="button" className={W_BUTTON} key={v} onClick={() => setT(v)}>t = {v}</button>)}</div>
    <svg viewBox="0 0 400 270" width="400" height="270" role="img" aria-label={`正确内积 ${f(correct)}，遗漏共轭的结果 ${f(wrong)}。`} className="w-full max-w-[480px] h-auto mx-auto">
      <rect x="50" y="25" width="310" height="220" rx="8" fill="var(--w-bg)" stroke="var(--w-border)" />
      {[-1, 0, 1, 2, 3].map(v => <g key={v}><line x1="60" x2="350" y1={y(v)} y2={y(v)} stroke={v === 0 ? "var(--w-axis)" : "var(--w-grid)"} /><text x="47" y={y(v) + 4} textAnchor="end" fill="var(--w-muted)" fontSize="12">{v}</text></g>)}
      <text x="60" y="42" fill="var(--w-text)" fontSize="12">计算结果（实数）</text>
      <line x1="145" x2="145" y1="150" y2={y(correct)} stroke={FMM_COLORS.gruen} strokeWidth="22" /><circle cx="145" cy={y(correct)} r="4" fill={FMM_COLORS.gruen} />
      <line x1="265" x2="265" y1="150" y2={y(wrong)} stroke={FMM_COLORS.rot} strokeWidth="22" /><circle cx="265" cy={y(wrong)} r="4" fill={FMM_COLORS.rot} />
      <g fill="var(--w-text)" fontSize="13" textAnchor="middle"><text x="145" y="218">有共轭：{f(correct)}</text><text x="265" y="218">漏共轭：{f(wrong)}</text><text x="205" y="236">比较的两种算法</text></g>
    </svg>
    <p className="text-sm tabular-nums">V = (1, i)，W = (1, {f(t)} i)；‖V‖ = √2，‖W‖ = {f(normW)}。</p>
    <Verdict kind={orthogonal ? "ok" : near ? "warn" : "neutral"} labels={labels}>
      {orthogonal ? "正确内积精确为零，V 与 W 正交。遗漏共轭反而得到 2。" : near ? "正确内积接近零，但仍不是精确正交。" : t === 1 ? "两向量相同且非零，范数平方为 2。错误算法给出 0，违反正定性。" : `正确内积为 ${f(correct)}，当前两向量不正交。`}
    </Verdict>
  </div>;
}

export function GramSchmidtLab() {
  const [u, setU] = useState(1), [v, setV] = useState(2);
  const coefficient = (2 * u + v) / 5;
  const p: Vec = [2 * coefficient, coefficient];
  const r: Vec = [u - p[0], v - p[1]];
  const norm = Math.hypot(...r), inputNorm = Math.hypot(u, v);
  const singular = 2 * Math.round(v * 20) === Math.round(u * 20);
  const near = !singular && norm / Math.max(inputNorm, 1e-12) < .08;
  const unit: Vec | null = singular ? null : [r[0] / norm, r[1] / norm];
  const presets: [string, number, number][] = [["独立", 1, 2], ["接近平行", 2, 1.05], ["精确平行", 2, 1], ["零向量", 0, 0]];
  return <div>
    <Task>把 II 调到与 I 平行，再稍微偏离，观察剩余量和归一化方向。</Task>
    <Slider label="II 的横坐标 u" value={u} onChange={setU} min={-3} max={3} step={.05} fmt={v => fmtEn(v, 2)} />
    <Slider label="II 的纵坐标 v" value={v} onChange={setV} min={-3} max={3} step={.05} fmt={v => fmtEn(v, 2)} />
    <div className="flex flex-wrap gap-2 my-3">{presets.map(([name, x, y]) => <button type="button" className={W_BUTTON} key={name} onClick={() => { setU(x); setV(y); }}>{name}</button>)}</div>
    <VectorPlane arrows={[
      { name: "旧向量 I", end: [2, 1], color: FMM_COLORS.blau },
      { name: "旧向量 II", end: [u, v], color: FMM_COLORS.orange },
      { name: "投影 p", end: p, color: FMM_COLORS.blau, dashed: true },
      { name: "剩余 r（平移）", start: p, end: [u, v], color: FMM_COLORS.gruen },
    ]} caption="第二个向量拆分为沿第一方向的投影与垂直剩余量。" />
    <p className="text-sm tabular-nums">‖r‖ = {f(singular ? 0 : norm)}；I · r = {f(2 * r[0] + r[1])}；新单位方向 e₂ = {unit ? `(${f(unit[0])}, ${f(unit[1])})` : "不存在"}。</p>
    <Verdict kind={singular ? "fail" : near ? "warn" : "ok"} labels={labels}>
      {singular ? "剩余量精确为零：第二个输入没有提供新方向，不能归一化。" : near ? "剩余量非零但很小：数学上可以继续，数值误差却会被归一化放大。" : "剩余量非零且与 I 正交：除以它的长度，得到第二个正交单位向量。"}
    </Verdict>
  </div>;
}
