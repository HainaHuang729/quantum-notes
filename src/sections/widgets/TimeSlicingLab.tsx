/** Exact finite-N Fresnel/Gaussian elimination, not a finite-position-window integral.
 * Shared pure model: time-slicing.mjs; independent checks: scripts/verify/time-slicing.mjs.
 * Units m=ℏ=1, fixed endpoints 0→1; no timers, random paths or numerical path sampling.
 */
import {useState} from 'react';
import {Slider,Plot,Task,Verdict,W_BUTTON,W_PANEL,FMM_COLORS,fmtEn} from '../../lib';
import {slicingState,SLICE_PRESETS,SLICE_PATH_T,SLICE_PATH_Y} from './time-slicing.mjs';
const f=(n:number)=>fmtEn(n,5),labels={neutral:'观察',ok:'归一抵消',warn:'路径有偏移',fail:'重新比较'};
// Geometry only; effective connection comes from the shared model's Schur pivots.
// Checked independently in scripts/verify/time-slicing-visual.mjs.
export function slicingDiagram(s:ReturnType<typeof slicingState>,step:number){
 const width=Math.max(280,s.N*38+56),x=(j:number)=>28+j*(width-56)/s.N;
 return {width,next:step+1,coefficient:step===s.M?2*s.classicalAction:s.pivots[step]-1/s.epsilon,
  nodes:Array.from({length:s.N+1},(_,j)=>({j,x:x(j),fixed:j===0||j===s.N,integrated:j>0&&j<=step})),
  arc:`M ${x(0)} 88 C ${x(0)} 34 ${x(step+1)} 34 ${x(step+1)} 88`};
}
export function TimeSlicingLab(){
 const[N,setN]=useState(6),[T,setT]=useState(1),[k,setK]=useState(3),[d,setD]=useState(0),[step,setStep]=useState(0),[guess,setGuess]=useState(''),[shown,setShown]=useState(false);
 const s=slicingState(N,T,k,d);
 const diagram=slicingDiagram(s,step),logRows=[{name:'测度',value:s.measureLog,color:FMM_COLORS.blau},{name:'涨落积分',value:s.fluctuationLog,color:FMM_COLORS.gruen},{name:'两者相加',value:s.logMagnitude,color:FMM_COLORS.orange}],logScale=Math.max(1,...logRows.map(row=>Math.abs(row.value)));
 const changeN=(n:number)=>{setN(n);setK(x=>Math.min(x,n-1));setStep(x=>Math.min(x,n-1))};
 const preset=(p:typeof SLICE_PRESETS[number])=>{setN(p.N);setT(p.T);setK(p.k);setD(p.d);setStep(0);setGuess('');setShown(false)};
 return <div className="space-y-2"><Task>保持总时间 T，预测增加切片数是否改变完整自由核；再偏移一个节点，区分单路径相位与全部节点积分。</Task>
 <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]"><div>
 <Slider label="总时间 T" value={T} onChange={t=>setT(Math.round(t*10)/10)} min={.5} max={2} step={.1} fmt={f}/>
 <Slider label="时间段数 N" value={N} onChange={changeN} min={2} max={12} step={1} fmt={x=>fmtEn(x,0)}/>
 <Slider label="内部节点 k" value={s.k} onChange={setK} min={1} max={N-1} step={1} fmt={x=>fmtEn(x,0)}/>
 <Slider label="节点偏移 d" value={d} onChange={x=>setD(Math.round(x*10)/10)} min={-1} max={1} step={.1} fmt={f}/>
 <div className="flex flex-wrap gap-2 my-2">{SLICE_PRESETS.map(p=><button key={p.id} className={W_BUTTON} onClick={()=>preset(p)}>{p.label}</button>)}<button className={W_BUTTON} onClick={()=>preset(SLICE_PRESETS[1])}>重置</button></div>
 <p className="text-xs">m=ℏ=1；选长度单位 ℓ，时间单位为 mℓ²/ℏ，作用量单位为 ℏ；两端固定为 x(0)=0、x(T)=1。ε=T/N，内部变量 M=N−1；每段短时归一系数 Aε=(2πiε)^(−1/2)。</p>
 </div><div><Plot series={[{f:t=>t<=T?t/T:NaN,color:FMM_COLORS.gruen,label:'经典'}]} polylines={[{pts:s.times.map((t,j)=>[t,s.positions[j]] as [number,number]),color:FMM_COLORS.blau,label:'折线'}]} markers={s.times.map((t,j)=>({x:t,y:s.positions[j],color:j===s.k?FMM_COLORS.orange:FMM_COLORS.blau,r:j===s.k?5:2.5}))} width={500} height={280} xDomain={SLICE_PATH_T} yDomain={SLICE_PATH_Y} xLabel="时间 t" yLabel="位置 x" ariaLabel="固定端点的离散折线与连续经典直线，橙点为可偏移的内部节点"/>
 <p className="text-sm">ε={f(s.epsilon)}；M={s.M}；Scl={f(s.classicalAction)}；显示路径 S={f(s.action)}，ΔS={f(s.deltaAction)}。相邻两段局部相位分别为 {f(s.localPhases[0])}、{f(s.localPhases[1])} rad；相对相位 ΔS mod 2π={f(s.relativePhase)} rad。</p>
 </div></div>
 <div className="flex flex-wrap gap-2 items-center"><button className={W_BUTTON} disabled={step===0} onClick={()=>setStep(x=>x-1)}>上一步消元</button><button className={W_BUTTON} disabled={step===s.M} onClick={()=>setStep(x=>x+1)}>下一步消元</button><span>查看 {step}/{s.M} 次积分</span></div>
 <figure className={`${W_PANEL} p-3 space-y-2`}>
 <figcaption className="text-sm font-medium">逐个积分后，哪些位置变量还留在式子里？</figcaption>
 <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="节点积分连通图；节点多时可横向滚动">
 <svg viewBox={`0 0 ${diagram.width} 142`} width={diagram.width} height={142} style={{width:'100%',minWidth:diagram.width,height:'auto'}} role="img" aria-label={`已积分 ${step} 个内部变量，左侧有效连接为 x0 到 x${diagram.next}，系数 ${f(diagram.coefficient)}`}>
 <text x={diagram.width/2} y={18} textAnchor="middle" fill="var(--w-text)" fontSize={13}>左侧连接 c = {f(diagram.coefficient)}</text>
 {diagram.nodes.filter(node=>node.j>diagram.next).map(node=><line key={node.j} x1={diagram.nodes[node.j-1].x} y1={96} x2={node.x} y2={96} stroke="var(--w-axis)" strokeWidth={2}/>)}
 <path d={diagram.arc} fill="none" stroke={FMM_COLORS.blau} strokeWidth={3}/>
 {diagram.nodes.map(node=><g key={node.j} transform={`translate(${node.x},96)`}>
 {node.fixed?<rect x={-8} y={-8} width={16} height={16} fill="var(--w-text)"/>:node.integrated?<><circle r={9} fill="var(--w-bg)" stroke="var(--w-muted)" strokeDasharray="3 2"/><path d="M -5 -5 L 5 5 M -5 5 L 5 -5" stroke="var(--w-muted)" strokeWidth={2}/></>:<circle r={9} fill="var(--w-bg)" stroke={FMM_COLORS.blau} strokeWidth={2}/>}
 <text y={28} textAnchor="middle" fontSize={12} fill="var(--w-text)">x{node.j}</text>
 </g>)}
 </svg>
 </div>
 <p className="text-xs">■ 固定端点，不积分；○ 尚待积分；⊗ 已对整个实轴积分。粗线是合并后的连接，其余细线的系数为 1/ε。节点多时可左右滑动图。</p>
 <p className="text-sm" aria-live="polite">{step===s.M?'全部内部变量已积完，只剩两个固定端点。':step===0?'尚未积分。先处理 x1，它连接两段各长 ε 的传播。':`x1 至 x${step} 已从积分式中消去；下一项积分变量是 x${diagram.next}。`} 左侧项为 c(x{diagram.next}−x0)²/2，c={f(diagram.coefficient)}。叉号表示已累加该位置的全部复贡献，没有把这个位置设为零；这幅图表示变量的连接，不表示粒子轨迹。</p>
 </figure>
 <p className="text-sm">涨落矩阵 H=tridiag(−1,2,−1)/ε。{step===0?'先保留所有内部变量。':`第 ${step} 步正主元 p${step}=${f(s.pivots[step-1])}。`} 全部正主元：{s.pivots.map(x=>fmtEn(x,3)).join('，')}。ln det H={f(s.logDet)}，det H={s.determinant.toExponential(4)}。</p>
 <div className="grid gap-3 md:grid-cols-2">
 <figure className={`${W_PANEL} p-3 space-y-2`}><figcaption className="text-sm font-medium">完整积分的模：取对数后相加</figcaption>
 {logRows.map(row=><div key={row.name}><div className="flex justify-between gap-2 text-xs"><span>{row.name}</span><span>ln|因子| = {f(row.value)}</span></div><svg viewBox="0 0 280 24" width={280} height={24} className="w-full h-auto" role="img" aria-label={`${row.name}的模长自然对数为 ${f(row.value)}`}><line x1={10} y1={12} x2={270} y2={12} stroke="var(--w-border)"/><line x1={140} y1={1} x2={140} y2={23} stroke="var(--w-text)"/><line x1={140} y1={12} x2={140+120*row.value/logScale} y2={12} stroke={row.color} strokeWidth={8}/><circle cx={140+120*row.value/logScale} cy={12} r={4} fill={row.color}/></svg></div>)}
 <p className="text-xs">中线为 0，左负右正，三行共用尺度。测度与涨落各自随 N 变化，相加始终为 −ln(2πT)/2。</p></figure>
 <figure className={`${W_PANEL} p-3 space-y-2`}><figcaption className="text-sm font-medium">完整积分的相位：一格代表 π/4</figcaption>
 <div className="text-xs">测度：{N} 个负相位</div><div className="flex gap-1" aria-hidden="true">{Array.from({length:N},(_,j)=><span key={j} className="flex-1 text-center rounded border" style={{borderColor:FMM_COLORS.blau,color:FMM_COLORS.blau}}>−</span>)}</div>
 <div className="text-xs">涨落：{s.M} 个正相位</div><div className="flex gap-1" aria-hidden="true">{Array.from({length:N},(_,j)=><span key={j} className="flex-1 text-center rounded border" style={{borderColor:j<s.M?FMM_COLORS.gruen:'transparent',color:FMM_COLORS.gruen,visibility:j<s.M?'visible':'hidden'}}>+</span>)}</div>
 <p className="text-sm">−{N}π/4 + {s.M}π/4 = −π/4</p><p className="text-xs">按同一列配对，每个“+”抵消一个“−”，最后留下一个负相位。这里还没有加上经典作用量相位 Scl。</p></figure>
 </div>
 <p className="text-sm">ln 为自然对数，把模长相乘转成相加：ln|Aεᴺ|={f(s.measureLog)}；ln|涨落积分因子|={f(s.fluctuationLog)}；相加={f(s.logMagnitude)}。归一相位 {f(s.measurePhase)} 加涨落相位 {f(s.fluctuationPhase)} = −π/4。</p>
 <p className="text-sm">完成全部 {s.M} 个内部实变量的积分后：Re K={f(s.kernel[0])}，Im K={f(s.kernel[1])}；|K|={f(s.magnitude)}，总相位 mod 2π={f(s.kernelPhase)} rad。核的单位为位置单位的倒数。</p>
 <label>固定 T，改变 N 后完整核会？ <select value={guess} onChange={e=>{setGuess(e.target.value);setShown(false)}}><option value="">选择预测</option><option value="same">保持相同</option><option value="change">随 N 改变</option></select></label> <button className={W_BUTTON} disabled={!guess} onClick={()=>setShown(true)}>比较结果</button>
 <Verdict labels={labels} kind={shown&&guess!=='same'?'fail':s.branch==='classical'?'ok':'warn'}>{s.branch==='classical'?'显示的节点在经典直线上，ΔS=0。':'偏移改变了显示路径的作用量与局部相位。'} 完整积分仍覆盖所有内部位置，不会因为画了这一条路径而改变；N 改变时，测度和涨落行列式的因子正好抵消。图中折线不是粒子的已测轨迹，也不是完整路径积分的有限采样。</Verdict>
 </div>;
}

