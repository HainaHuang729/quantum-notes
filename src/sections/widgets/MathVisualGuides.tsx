/** Finite-dimensional guides; checked by scripts/verify/{dual,subspace,spectral}-guide.mjs.
 * Manual sliders and buttons only: no timers, random samples or motion loop.
 */
import { useState } from "react";
import { FMM_COLORS, M, Plot, Slider, Task, Verdict, W_BUTTON, fmtEn } from "../../lib";
import { dualGuide, subspaceGuide, spectralGuide, spectralValue, type SpectralKind } from "./math-visual-guides.mjs";

const labels = { neutral: "观察", ok: "成立", warn: "注意", fail: "不成立" };
const f = (x: number) => fmtEn(Math.abs(x) < 1e-10 ? 0 : x, 3);
const pair = (v: number[]) => `(${v.map(f).join("，")})`;
const complex = ([x, y]: number[]) => `${f(x)} ${y < -1e-10 ? "−" : "+"} ${f(Math.abs(y))}i`;
const matrixTex = (a: number[]) => `\\begin{pmatrix}${f(a[0])}&${f(a[1])}\\\\${f(a[1])}&${f(a[2])}\\end{pmatrix}`;

export function DualGuide() {
  const [t, setT] = useState(2), [phase, setPhase] = useState(0);
  const state = dualGuide(t, phase);
  const numbers = [state.ket[1], state.bra[1], state.inner];
  const colors = [FMM_COLORS.blau, FMM_COLORS.orange, FMM_COLORS.gruen];
  return <figure data-lab="dual-guide" className="my-4 space-y-3">
    <Task>取 V = (1, it)、W = (1, i)，把 V 乘相位 a = cos φ + i sin φ，观察对应 bra 与内积。</Task>
    <Slider label="虚分量系数 t" value={t} onChange={setT} min={-2} max={2} step={.25} fmt={f} />
    <Slider label="ket 的整体相位 φ" value={phase} onChange={setPhase} min={-180} max={180} step={15} unit="°" fmt={v => fmtEn(v, 0)} />
    <div className="flex flex-wrap gap-2"><button type="button" className={W_BUTTON} onClick={() => { setT(1); setPhase(90); }}>乘以 i</button><button type="button" className={W_BUTTON} onClick={() => { setT(-1); setPhase(0); }}>正交输入</button><button type="button" className={W_BUTTON} onClick={() => { setT(2); setPhase(0); }}>复原示例</button></div>
    <div className="grid gap-1 md:grid-cols-3"><M>{String.raw`|aV\rangle=a\binom{1}{it}`}</M><M>{String.raw`\langle aV|=a^*(1,-it)`}</M><M>{String.raw`\langle aV|W\rangle=a^*(1+t)`}</M></div>
    <Plot series={[]} polylines={numbers.map((v, j) => ({ pts: [[0, 0], [v[0], v[1]]] as [number, number][], color: colors[j], label: ["蓝：ket 第二分量", "橙：bra 第二分量", "绿：输出内积"][j], dash: j === 1 ? [5, 4] : undefined }))} points={numbers.map((v, j) => ({ x: v[0], y: v[1], color: colors[j], r: 4 + j }))} xDomain={[-3.4, 3.4]} yDomain={[-3.4, 3.4]} width={390} height={320} xLabel="复数实部 Re" yLabel="复数虚部 Im" ariaLabel="ket 与 bra 第二个复分量关于实轴对称，绿色为 bra 作用于固定 W 的复数输出" />
    <p className="text-sm tabular-nums">ket 列 = [{state.ket.map(complex).join("；")} ]；bra 行 = [{state.bra.map(complex).join("；")} ]。输出 ⟨aV|W⟩ = {complex(state.inner)}；⟨aV|aV⟩ = {f(state.norm2)}。</p>
    <Verdict labels={labels} kind={t === -1 ? "ok" : phase === 0 ? "neutral" : "ok"}>{t === -1 ? "内积精确为零，整体相位怎样改变都保持正交。" : phase === 0 ? "橙色分量是蓝色分量的复共轭；它在图上关于实轴镜像。" : "ket 的系数乘 a，对应 bra 的系数乘 a*，所以内积沿相反方向转相位。"} 图中每个点只代表一个复数，不是完整二维复向量的空间箭头；重叠点由数值区分。</Verdict>
  </figure>;
}

export function SubspaceGuide() {
  const [angle, setAngle] = useState(30), [scale, setScale] = useState(-1), [shifted, setShifted] = useState(false);
  const s = subspaceGuide(angle, scale, shifted);
  const line = [-8, 8].map(t => [s.offset[0] + t * s.u[0], s.offset[1] + t * s.u[1]] as [number, number]);
  return <figure data-lab="subspace-guide" className="my-4 space-y-3">
    <Task>蓝线沿单位方向 u，绿色端点是 αp。先把 α 调到负数，再把整条直线平移一个单位法向量 n。</Task>
    <div className="flex flex-wrap gap-2"><button type="button" className={W_BUTTON} aria-pressed={!shifted} onClick={() => setShifted(false)}>过原点的直线</button><button type="button" className={W_BUTTON} aria-pressed={shifted} onClick={() => setShifted(true)}>偏移直线反例</button><button type="button" className={W_BUTTON} onClick={() => { setAngle(30); setScale(-1); setShifted(false); }}>复原</button></div>
    <Slider label="直线方向 θ" value={angle} onChange={setAngle} min={-80} max={80} step={10} unit="°" fmt={v => fmtEn(v, 0)} />
    <Slider label="数乘系数 α" value={scale} onChange={setScale} min={-2} max={2} step={.25} fmt={f} />
    <Plot series={[]} polylines={[
      { pts: line, color: FMM_COLORS.blau, label: shifted ? "蓝：n + span(u)" : "蓝：U = span(u)" },
      { pts: [[0, 0], s.point], color: FMM_COLORS.orange, label: "橙：线上的 p" },
      { pts: [[0, 0], s.scaled], color: FMM_COLORS.gruen, label: "绿：数乘 αp", dash: [4, 3] },
      ...(!shifted ? [{ pts: [s.projection, s.v], color: FMM_COLORS.violett, label: "紫虚线：V − PᵤV", dash: [3, 4] }] : []),
    ]} points={[{ x: s.point[0], y: s.point[1], color: FMM_COLORS.orange, r: 5 }, { x: s.scaled[0], y: s.scaled[1], color: FMM_COLORS.gruen, r: 5 }, ...(!shifted ? [{ x: 1.5, y: 1, color: FMM_COLORS.violett, label: "V" }] : [])]} xDomain={[-4.5, 4.5]} yDomain={[-4.5, 4.5]} width={390} height={340} xLabel="x 分量" yLabel="y 分量" ariaLabel={shifted ? "偏移直线上点的数乘通常离开直线，原点始终不在线上" : "过原点直线包含正反两个方向，固定 V 的投影及其正交剩余量"} />
    <p className="text-sm tabular-nums">u = {pair(s.u)}；p = {pair(s.point)}；αp = {pair(s.scaled)}。{shifted ? `直线条件 n·x = 1；αp 到直线的距离 = ${f(s.distance)}。` : `V = (1.5，1)，PᵤV = p；u·(V − p) = ${f(s.u[0] * s.residual[0] + s.u[1] * s.residual[1])}。`}</p>
    <Verdict labels={labels} kind={shifted ? "fail" : "ok"}>{shifted ? "偏移直线不含零向量，并且 p+p 到它的距离始终为 1；即使 α=1 时当前点仍在线上，也不能据此判定封闭。" : "U 包含零向量、任意实数倍及任意两成员之和。负系数只把点送到另一侧；正交投影将 V 拆成 U 内部分与垂直剩余量。"} 画布只展示无限直线的一段。</Verdict>
  </figure>;
}

export function SpectralGuide() {
  const [first, setFirst] = useState(-1), [second, setSecond] = useState(2), [kind, setKind] = useState<SpectralKind>("square");
  const s = spectralGuide(first, second, kind), invalid = s.mapped === null;
  const name = kind === "square" ? "x²" : kind === "exp" ? "exp(x)" : "1/x";
  return <figure data-lab="spectral-guide" className="my-4 space-y-3">
    <Task>改变两个本征值，再切换函数。固定的本征方向不变，倍率按曲线 y = f(x) 逐个重算。</Task>
    <div className="flex flex-wrap gap-2">{([["square", "平方"], ["exp", "指数"], ["inverse", "求逆"]] as const).map(([value, label]) => <button type="button" key={value} className={W_BUTTON} aria-pressed={kind === value} onClick={() => setKind(value)}>{label}</button>)}<button type="button" className={W_BUTTON} onClick={() => { setKind("inverse"); setFirst(0); setSecond(2); }}>零本征值</button><button type="button" className={W_BUTTON} onClick={() => { setKind("square"); setFirst(-1); setSecond(2); }}>复原</button></div>
    <Slider label="第一本征值 λ₁" value={first} onChange={setFirst} min={-2} max={2} step={.25} fmt={f} />
    <Slider label="第二本征值 λ₂" value={second} onChange={setSecond} min={-2} max={2} step={.25} fmt={f} />
    <M>{String.raw`A=Q\operatorname{diag}(\lambda_1,\lambda_2)Q^{\mathsf T}`}</M>
    <M>{String.raw`Q=\begin{pmatrix}\sqrt3/2&-1/2\\1/2&\sqrt3/2\end{pmatrix}`}</M>
    <Plot series={[{ f: x => kind === "inverse" && Math.abs(x) < .12 ? NaN : spectralValue(x, kind) ?? NaN, color: FMM_COLORS.gruen, label: `f(x) = ${name}` }]} points={[first, second].flatMap((x, j) => s.values[j] === null ? [] : [{ x, y: s.values[j] as number, color: j === 0 ? FMM_COLORS.blau : FMM_COLORS.orange, r: 5 + j }])} xDomain={[-2.25, 2.25]} yDomain={kind === "exp" ? [-1, 10] : [-5, 5]} width={390} height={290} xLabel="原倍率 λ" yLabel="新倍率 f(λ)" ariaLabel={`本征值沿 ${name} 曲线映射，蓝点为第一方向，橙点为第二方向；重合时查看数值`} />
    <p className="text-sm tabular-nums"><span style={{ color: FMM_COLORS.blau }}>蓝：λ₁ = {f(first)} → {s.values[0] === null ? "未定义" : f(s.values[0])}</span>；<span style={{ color: FMM_COLORS.orange }}>橙：λ₂ = {f(second)} → {s.values[1] === null ? "未定义" : f(s.values[1])}</span>。</p>
    <div className="grid gap-1 md:grid-cols-2"><M>{`A=${matrixTex(s.matrix)}`}</M>{s.mapped&&<M>{`f(A)=${matrixTex(s.mapped)}`}</M>}</div>
    <Verdict labels={labels} kind={invalid ? "fail" : "ok"}>{invalid ? "至少一个方向被 A 压成零；没有算符能把所有输入唯一恢复，所以 A 的逆不存在。图中省略这个未定义的映射点。" : first === second ? "本征值完全相同，A 是恒等算符的倍数；应用函数后仍对所有方向使用相同倍率。" : "在这组固定正交本征基中，只需逐个处理两个本征值，再由 Q 换回原坐标；没有对原矩阵元素逐个代入函数。"} 数字矩阵显示三位小数；曲线窗口有限，求逆时零附近留空。</Verdict>
  </figure>;
}
