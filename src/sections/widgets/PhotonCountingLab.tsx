/** Shared deterministic photon-counting.mjs; independent numerical checks in
 * scripts/verify/photon-counting-lab.mjs. Conditional finite-window detection,
 * integrated finite bins, identical Gaussian envelope in both comparison modes.
 * Buttons reveal fixed prefixes of one seeded event sequence; no autoplay.
 */
import { useMemo, useState } from "react";
import { Task,Verdict,FMM_COLORS,W_BUTTON,fmtEn } from "../../lib";
import { photonCounts,PHOTON_BINS,PHOTON_DX,PHOTON_LEFT,PHOTON_RIGHT,type PhotonMode } from "./photon-counting.mjs";
const labels={neutral:"等待计数",ok:"重复实验",warn:"样本还少",fail:"不成立"};
const f=(x:number)=>fmtEn(x,3);
export function PhotonCountingLab(){
 const [mode,setMode]=useState<PhotonMode>('coherent'),[n,setN]=useState(0),[seed,setSeed]=useState(2027);
 const result=useMemo(()=>photonCounts(mode,n,seed),[mode,n,seed]),d=result.distribution;
 const observed=result.counts.map(c=>n?c/(n*PHOTON_DX):0),expected=d.probabilities.map(p=>p/PHOTON_DX);
 const yMax=Math.max(.65,...observed.map(v=>v*1.1),...expected.map(v=>v*1.1));
 const px=(x:number)=>55+(x-PHOTON_LEFT)/(PHOTON_RIGHT-PHOTON_LEFT)*570,py=(y:number)=>215-y/yMax*170;
 const curve=d.centers.map((x,j)=>`${j?'L':'M'}${px(x)},${py(expected[j])}`).join(' ');
 const switchMode=(next:PhotonMode)=>{setMode(next);setN(0);};
 return <div className="space-y-2 photon-counting-lab">
  <Task>先看一次落点，再显示更多计数；切换对照，比较条纹来自振幅相加还是概率相加。</Task>
  <div className="flex flex-wrap gap-2" role="group" aria-label="检测概率模型">
   <button type="button" className={W_BUTTON} aria-pressed={mode==='coherent'} onClick={()=>switchMode('coherent')}>相干双缝：振幅相加</button>
   <button type="button" className={W_BUTTON} aria-pressed={mode==='incoherent'} onClick={()=>switchMode('incoherent')}>非相干对照：概率相加</button>
  </div>
  <div className="flex flex-wrap gap-2" role="group" aria-label="显示同一批记录的前若干次检测">
   {[1,10,100,1000].map(v=><button type="button" className={W_BUTTON} key={v} aria-pressed={n===v} onClick={()=>setN(v)}>前 {v} 次</button>)}
   <button type="button" className={W_BUTTON} disabled={n>=1000} onClick={()=>setN(old=>Math.min(1000,old+10))}>再加 10 次</button>
   <button type="button" className={W_BUTTON} onClick={()=>{setSeed(old=>old+1);setN(0);}}>换一轮并清空</button>
  </div>
  <svg viewBox="0 0 660 290" width="660" height="290" className="block w-full h-auto mx-auto" role="img" aria-label={`累计 ${n} 次检测，直方图与所选模型的预期概率密度比较；下排标记最近的检测箱`}>
   <path d="M55 35V215H625" stroke="var(--w-axis)" fill="none"/>
   <text x="55" y="19" fontSize="12" fill="var(--w-text)">箱频率密度（每单位 x）</text>
   {[0,yMax/2,yMax].map((v,j)=><g key={j}><line x1="51" x2="625" y1={py(v)} y2={py(v)} stroke={j?'var(--w-grid)':'var(--w-axis)'}/><text x="48" y={py(v)+4} textAnchor="end" fontSize="11" fill="var(--w-muted)">{fmtEn(v,2)}</text></g>)}
   {[-4,-2,0,2,4].map(x=><g key={x}><line x1={px(x)} x2={px(x)} y1="215" y2="220" stroke="var(--w-axis)"/><text x={px(x)} y="236" textAnchor="middle" fontSize="11" fill="var(--w-muted)">{x}</text></g>)}
   {result.counts.map((c,j)=>c>0&&<rect key={j} x={px(PHOTON_LEFT+j*PHOTON_DX)+.5} y={py(observed[j])} width={570/PHOTON_BINS-1} height={215-py(observed[j])} fill={FMM_COLORS.blau} opacity=".65"/>)}
   <path d={curve} fill="none" stroke={FMM_COLORS.gruen} strokeWidth="2.3"/>
   <text x="625" y="253" textAnchor="end" fontSize="12" fill="var(--w-text)">屏幕位置 x（无量纲）</text>
   <text x="55" y="256" fontSize="11" fill="var(--w-muted)">最近计数箱</text>
   {result.events.slice(-24).map((bin,j)=><circle key={j} cx={px(d.centers[bin])} cy={267+(j%3)*5} r="2" fill={FMM_COLORS.orange}/>)}
  </svg>
  <p className="text-sm">N = {n}；随机种子 = {seed}；81 个检测箱，箱宽 Δx = 0.1。蓝柱 = 箱计数/(NΔx)，绿线 = 每箱理论概率/Δx；橙点只标记最近的计数箱。</p>
  <Verdict labels={labels} kind={result.branch==='empty'?'neutral':result.branch==='few'?'warn':'ok'}>{n===0?'先显示一次检测：一次只增加一个箱的计数，不会直接画出整条条纹。':n<100?'每次只记录一个位置箱；目前样本少，柱高的波动很大。':'多次独立检测的相对频率呈现所选概率分布；有限样本仍会波动，不能要求每一箱都恰等于理论值。'} {mode==='coherent'?'理想暗纹点的密度为零，但覆盖它的有限宽检测箱仍可有很小的计数概率。':'此对照去掉两路的相干交叉项；降低光强本身不会把相干模型变成这个对照。'}</Verdict>
  <p className="text-xs">模型：相同高斯包络 e^(−x²/4)，相干权重另乘 [1 + cos(πx)]。两种分布均按有限窗口 [−4.05, 4.05] 内“已经探测到”归一化；不模拟绝对光强、真实缝宽或探测效率。</p>
 </div>;
}
