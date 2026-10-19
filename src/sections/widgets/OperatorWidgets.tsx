/** RotationWidget: see scripts/verify/operator-rotation.mjs.
 * ProjectionWidget: see scripts/verify/operator-projection.mjs.
 * ActivePassiveWidget: see scripts/verify/operator-active-passive.mjs.
 * Deterministic real two-dimensional slices of the chapter's operators;
 * controls change the mathematics rather than camera decoration. No animation.
 */
import { useState } from "react";
import { FMM_COLORS, Slider, Task, Verdict, W_BUTTON, fmtEn } from "../../lib";

const labels = { neutral: "观察", ok: "成立", warn: "接近特殊情形", fail: "不成立" };
const rad = (d: number) => d * Math.PI / 180;
const pair = (v: readonly number[]) => `(${v.map(x => fmtEn(x, 3)).join("，")})`;
type V = [number, number];
const rot = (p: V, a: number): V => [Math.cos(a)*p[0]-Math.sin(a)*p[1], Math.sin(a)*p[0]+Math.cos(a)*p[1]];
const dot = (a: V, b: V) => a[0]*b[0]+a[1]*b[1];

function VectorPanel({ vectors, title, axisX = "x", axisY = "y", bound = 2.4 }: {
  vectors: { p: V; color: string; name: string; dash?: boolean }[];
  title: string; axisX?: string; axisY?: string; bound?: number;
}) {
  const px = (x: number) => 150 + 110*x/bound;
  const py = (y: number) => 145 - 110*y/bound;
  return <svg viewBox="0 0 300 290" width="300" height="290" className="block h-auto w-full" role="img" aria-label={title}>
    <rect x="1" y="1" width="298" height="288" rx="10" fill="var(--w-bg)" stroke="var(--w-border)" />
    <text x="150" y="23" textAnchor="middle" fill="var(--w-text)" fontSize="13">{title}</text>
    {[-1,1].map(t=><g key={t} stroke="var(--w-grid)"><line x1={px(t)} y1="35" x2={px(t)} y2="255"/><line x1="40" y1={py(t)} x2="260" y2={py(t)}/></g>)}
    <path d="M 35 145 H 270 M 150 260 V 35" stroke="var(--w-axis)" fill="none"/>
    <text x="275" y="149" fill="var(--w-text)" fontSize="12">{axisX}</text><text x="157" y="40" fill="var(--w-text)" fontSize="12">{axisY}</text>
    <text x="145" y="160" fill="var(--w-muted)" fontSize="10">0</text>
    {vectors.map(({p,color,name,dash},i)=><g key={name}>
      <line x1="150" y1="145" x2={px(p[0])} y2={py(p[1])} stroke={color} strokeWidth="2.5" strokeDasharray={dash ? "5 4" : undefined}/>
      <circle cx={px(p[0])} cy={py(p[1])} r="4" fill={color}/>
      <text x={12+i*(280/vectors.length)} y="272" fill={color} fontSize="10">{name}</text>
    </g>)}
  </svg>;
}

export function RotationWidget() {
  const [angle,setAngle] = useState(90);
  const a = rad(angle), ey = rot([1,0],a), ez = rot([0,1],a), sum: V = [ey[0]+ez[0],ey[1]+ez[1]];
  return <div>
    <Task>改变绕 x 轴的转角，看 y、z 基向量及其和怎样一起旋转。</Task>
    <Slider label="转角 θ" min={-180} max={180} step={1} value={angle} onChange={setAngle} unit="°" fmt={x=>fmtEn(x,0)} />
    <button type="button" className={W_BUTTON} onClick={()=>setAngle(90)}>回到正向四分之一圈</button>
    <div className="mx-auto max-w-[360px]"><VectorPanel title="沿 x 轴看 y–z 平面" axisX="y" axisY="z" vectors={[
      {p:ey,color:FMM_COLORS.blau,name:"R|2⟩"},{p:ez,color:FMM_COLORS.orange,name:"R|3⟩"},{p:sum,color:FMM_COLORS.gruen,name:"R(|2⟩+|3⟩)",dash:true}
    ]}/></div>
    <p className="text-sm">蓝 R|2⟩ = {pair(ey)}；橙 R|3⟩ = {pair(ez)}；绿 R(|2⟩+|3⟩) = {pair(sum)}（均为 y、z 分量）。</p>
    <Verdict kind="ok" labels={labels}>相加后旋转与分别旋转再相加给出同一端点；两条单位向量的内积为 {fmtEn(dot(ey,ez),3)}，长度均为 1。</Verdict>
  </div>;
}

export function ProjectionWidget() {
  const [theta,setTheta] = useState(35);
  const [second,setSecond] = useState<"y"|"x">("y");
  const a=rad(theta), amplitude=theta===90?0:Math.cos(a), initial:V=[Math.sin(a),amplitude], once:V=[0,amplitude], twice:V=second==="y"?once:[0,0];
  const exactZero = theta===90 || second==="x";
  const nearZero = !exactZero && Math.abs(Math.cos(a))<0.1;
  return <div>
    <Task>先让电场经过 y 偏振片，再切换第二片的方向，比较输出电场。</Task>
    <Slider label="与 y 轴夹角 θ" min={0} max={90} step={1} value={theta} onChange={setTheta} unit="°" fmt={x=>fmtEn(x,0)}/>
    <div className="my-2 flex flex-wrap gap-2" role="group" aria-label="第二片偏振片方向">
      <button className={W_BUTTON} type="button" aria-pressed={second==="y"} onClick={()=>setSecond("y")}>第二片沿 y</button>
      <button className={W_BUTTON} type="button" aria-pressed={second==="x"} onClick={()=>setSecond("x")}>第二片沿 x</button>
      <button className={W_BUTTON} type="button" onClick={()=>{setTheta(90);setSecond("y");}}>入射电场沿 x</button>
    </div>
    <div className="mx-auto max-w-[360px]"><VectorPanel title="电场在 x–y 平面的投影" bound={1.35} vectors={[
      {p:initial,color:FMM_COLORS.blau,name:"入射 E"},{p:once,color:FMM_COLORS.orange,name:"PᵧE"},{p:twice,color:FMM_COLORS.gruen,name:"第二片输出",dash:true}
    ]}/></div>
    <p className="text-sm">蓝 入射 E = {pair(initial)}；橙 第一片后 = {pair(once)}；绿 第二片后 = {pair(twice)}。单位入射强度下，透射强度为 {fmtEn(exactZero?0:dot(twice,twice),4)}。</p>
    <Verdict kind={exactZero?"neutral":nearZero?"warn":"ok"} labels={labels}>
      {second==="x"?"正交的第二片把剩余分量完全消除，PₓPᵧ = 0。":theta===90?"入射电场与第一片的透射方向正交，第一片已使输出为零。":nearZero?"透射很弱但不等于零；再次施加同方向投影仍保持这个小分量。":"同方向的第二片不再改变电场，Pᵧ² = Pᵧ。"}
    </Verdict>
  </div>;
}

export function ActivePassiveWidget() {
  const [angle,setAngle]=useState(45), [direction,setDirection]=useState(20);
  const a=rad(angle), v:V=[Math.cos(rad(direction)),Math.sin(rad(direction))], uv=rot(v,a);
  const c=Math.cos(a),s=Math.sin(a);
  const b00=2*c*c+s*s,b01=-c*s,b11=2*s*s+c*c;
  const bv:V=[b00*v[0]+b01*v[1],b01*v[0]+b11*v[1]];
  const qActive=2*uv[0]*uv[0]+uv[1]*uv[1],qPassive=dot(v,bv);
  return <div>
    <Task>改变旋转角，比较旋转向量与改写算符得到的同一个数。</Task>
    <Slider label="变换角 θ" min={-180} max={180} step={1} value={angle} onChange={setAngle} unit="°" fmt={x=>fmtEn(x,0)}/>
    <Slider label="原向量方向 φ" min={-180} max={180} step={1} value={direction} onChange={setDirection} unit="°" fmt={x=>fmtEn(x,0)}/>
    <div className="grid gap-3 sm:grid-cols-2">
      <VectorPanel title="主动：v → Uv" bound={1.4} vectors={[{p:v,color:FMM_COLORS.blau,name:"v"},{p:uv,color:FMM_COLORS.orange,name:"Uv"}]}/>
      <VectorPanel title="被动：v 不动，Ω → B" vectors={[{p:v,color:FMM_COLORS.blau,name:"v"},{p:bv,color:FMM_COLORS.gruen,name:"Bv"}]}/>
    </div>
    <p className="text-sm">v = {pair(v)}；Uv = {pair(uv)}；B = UᵀΩU = [[{fmtEn(b00,3)}, {fmtEn(b01,3)}], [{fmtEn(b01,3)}, {fmtEn(b11,3)}]]。</p>
    <Verdict kind="ok" labels={labels}>(Uv)ᵀΩ(Uv) = {fmtEn(qActive,4)}；vᵀBv = {fmtEn(qPassive,4)}。两种计算完全等价；B 的迹始终为 3，行列式始终为 2。</Verdict>
  </div>;
}
