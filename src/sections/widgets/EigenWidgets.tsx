/** Eigen-directions and coupled modes; numeric checks: scripts/verify/eigen-directions.mjs and scripts/verify/coupled-modes.mjs. */
import { useState } from "react";
import { Slider, Task, Verdict, FMM_COLORS, W_BUTTON, fmtEn } from "../../lib";
import { eigenState, modeState } from "./eigen-math.mjs";

const verdictLabels = { neutral: "观察", ok: "成立", warn: "接近特殊情形", fail: "不成立" };

export function EigenDirections() {
  const [angle,setAngle]=useState(65), [gap,setGap]=useState(1);
  const state=eigenState(angle,gap);
  const p=(v: number[])=>[200+55*v[0],180-55*v[1]];
  const endV=p(state.v), endA=p(state.av);
  return <div>
    <Task>先把角度调到本征方向，再把间隔调为零，比较哪些方向保持不变。</Task>
    <Slider label="输入角 θ" value={angle} onChange={setAngle} min={0} max={180} step={1} unit="°" />
    <Slider label="本征值间隔 g" value={gap} onChange={setGap} min={0} max={2} step={.01} fmt={fmtEn} />
    <div className="flex flex-wrap gap-2 my-2">
      <button type="button" className={W_BUTTON} onClick={()=>setAngle(30)}>较小本征值方向</button>
      <button type="button" className={W_BUTTON} onClick={()=>setAngle(120)}>较大本征值方向</button>
      <button type="button" className={W_BUTTON} onClick={()=>setGap(0)}>完全简并</button>
      <button type="button" className={W_BUTTON} onClick={()=>setGap(.01)}>接近简并</button>
      <button type="button" className={W_BUTTON} onClick={()=>setGap(1)}>分开本征值</button>
    </div>
    <svg viewBox="0 0 400 350" width="400" height="350" className="block w-full h-auto max-w-[430px] mx-auto" role="img" aria-label="单位输入向量 v 与变换后向量 Av，虚线表示本征轴">
      <line x1="30" y1="180" x2="370" y2="180" stroke="var(--w-axis)" />
      <line x1="200" y1="25" x2="200" y2="325" stroke="var(--w-axis)" />
      <text x="355" y="201" fill="var(--w-text)" fontSize="13">x₁</text>
      <text x="210" y="30" fill="var(--w-text)" fontSize="13">x₂</text>
      {[30,120].map(a=>{const r=a*Math.PI/180;return <line key={a} x1={200-150*Math.cos(r)} y1={180+150*Math.sin(r)} x2={200+150*Math.cos(r)} y2={180-150*Math.sin(r)} stroke="var(--w-muted)" strokeDasharray="4 5" />})}
      <circle cx="200" cy="180" r="55" fill="none" stroke="var(--w-grid-strong)" />
      <line x1="200" y1="180" x2={endA[0]} y2={endA[1]} stroke={FMM_COLORS.rot} strokeWidth="5" />
      <circle cx={endA[0]} cy={endA[1]} r="5" fill={FMM_COLORS.rot} />
      <line x1="200" y1="180" x2={endV[0]} y2={endV[1]} stroke={FMM_COLORS.blau} strokeWidth="3" />
      <circle cx={endV[0]} cy={endV[1]} r="4" fill={FMM_COLORS.blau} />
      <text x="25" y="328" fill={FMM_COLORS.blau} fontSize="13">蓝：v</text>
      <text x="105" y="328" fill={FMM_COLORS.rot} fontSize="13">红：Av</text>
      <text x="220" y="328" fill="var(--w-muted)" fontSize="13">圆半径：单位长度</text>
    </svg>
    <p className="text-sm font-mono">A = [{fmtEn(state.matrix[0],3)}, {fmtEn(state.matrix[1],3)}; {fmtEn(state.matrix[1],3)}, {fmtEn(state.matrix[2],3)}]<br />本征值：1，{fmtEn(1+gap,2)}；v = ({fmtEn(state.v[0],3)}, {fmtEn(state.v[1],3)})；Av = ({fmtEn(state.av[0],3)}, {fmtEn(state.av[1],3)})</p>
    <Verdict labels={verdictLabels} kind={state.branch==='exact'?'ok':state.branch==='near'?'warn':'neutral'}>
      {state.branch==='exact'?'完全简并：所有非零方向都是本征方向。':state.branch==='near'?'接近简并：本征值仍不相同，只有两条本征轴。':'两个本征值不同，本征轴相互垂直。'}
      {gap>0&&(state.isEigen?' 当前输入恰在本征轴上。':' 当前输入不在本征轴上。')}
      {' '}偏离共线的量 |v₁(Av)₂−v₂(Av)₁| = {fmtEn(state.residual,5)}。
    </Verdict>
  </div>;
}

export function CoupledModes() {
  const [preset,setPreset]=useState(2), [time,setTime]=useState(0);
  const s=modeState(preset,time);
  const centers=[150+25*s.x1,330+25*s.x2];
  const spring=(left:number,right:number)=>Array.from({length:17},(_,i)=>`${left+(right-left)*i/16},${i===0||i===16?102:102+(i%2?7:-7)}`).join(' ');
  return <div>
    <Task>选择初始位移，再拖动时间，比较物理坐标与正常模坐标。</Task>
    <div className="flex flex-wrap gap-2 my-2">{['同向 (1,1)','反向 (1,−1)','只移第一块 (1,0)'].map((name,i)=><button type="button" key={name} className={W_BUTTON} aria-pressed={preset===i} onClick={()=>{setPreset(i);setTime(0)}}>{name}</button>)}</div>
    <Slider label="时间 t" min={0} max={15} step={.02} value={time} onChange={setTime} fmt={fmtEn} />
    <svg viewBox="0 0 480 245" width="480" height="245" className="block w-full h-auto" role="img" aria-label="根据 Shankar 弹簧质量块示意重绘，两块的位置随所选初态及时间改变">
      <line x1="25" y1="60" x2="25" y2="145" stroke="var(--w-axis)" strokeWidth="4" />
      <line x1="455" y1="60" x2="455" y2="145" stroke="var(--w-axis)" strokeWidth="4" />
      <line x1="25" y1="130" x2="455" y2="130" stroke="var(--w-grid-strong)" />
      {[[25,centers[0]-25],[centers[0]+25,centers[1]-25],[centers[1]+25,455]].map(([a,b],i)=><polyline key={i} points={spring(a,b)} fill="none" stroke="var(--w-muted)" strokeWidth="2" />)}
      {centers.map((x,i)=><g key={i}><line x1={i===0?150:330} y1="60" x2={i===0?150:330} y2="150" stroke="var(--w-grid-strong)" strokeDasharray="3 4" /><rect x={x-25} y="80" width="50" height="44" rx="5" fill={i===0?FMM_COLORS.blau:FMM_COLORS.rot} /><text x={x} y="108" textAnchor="middle" fill="white" fontSize="14">m{i+1}</text></g>)}
      <text x="25" y="28" fontSize="14" fill="var(--w-text)">k = 1，m = 1；虚线为平衡位置</text>
      <text x="40" y="178" fill={FMM_COLORS.blau} fontSize="14">x₁ = {fmtEn(s.x1,3)}</text>
      <text x="275" y="178" fill={FMM_COLORS.rot} fontSize="14">x₂ = {fmtEn(s.x2,3)}</text>
      <text x="40" y="210" fill="var(--w-text)" fontSize="13">xⅠ = {fmtEn(s.qI,3)}（ωⅠ = 1）</text>
      <text x="275" y="210" fill="var(--w-text)" fontSize="13">xⅡ = {fmtEn(s.qII,3)}（ωⅡ = √3）</text>
    </svg>
    <p className="text-sm">初始模式系数：xⅠ(0) = {fmtEn(s.initialI,3)}，xⅡ(0) = {fmtEn(s.initialII,3)}。示意位移按固定比例显示；三根弹簧劲度系数相同。</p>
    <Verdict labels={verdictLabels} kind="ok">{preset===0?'只有同向慢模，中间弹簧长度不变。':preset===1?'只有反向快模，中间弹簧发生伸缩。':'两种正常模都存在，各按自己的频率演化后相加。'}</Verdict>
    <p className="text-xs">根据 Shankar 图 1.5 重新绘制。</p>
  </div>;
}
