/** Mathematical flow diagram, with no probability-shaped stand-in for an oscillatory kernel.
 * Check: scripts/verify/time-slicing-visual.mjs preserves all stages and source-card grouping.
 */
import {useState} from 'react';
import {Task,Verdict,W_PANEL,W_BUTTON,W_BUTTON_AKTIV,FMM_COLORS} from '../../lib';
const stages=[
 {button:'1 看传播核',title:'传播核',formula:'U(x, t; x′, 0)',hint:'固定输出位置 x，保留所有初始位置 x′',reading:'核为每个初始位置提供一个复振幅和相位。振荡核本身不是概率密度，不能把它画成一座正概率山。'},
 {button:'2 乘初态',title:'乘上初始波函数',formula:'U(x, t; x′, 0) ψ₀(x′)',hint:'逐个 x′ 相乘，保留复数的相位',reading:'初始波函数决定各个初始位置的复权重。先相乘，随后再把这些复贡献相加。'},
 {button:'3 对 x′ 积分',title:'对初始位置积分',formula:'∫ℝ U ψ₀ dx′ = ψ(x, t)',hint:'累加所有 x′，得到时刻 t 的输出波函数',reading:'当 t 趋于零，积分输出恢复 ψ₀(x)。δ 极限说的是这个积分算符怎样作用于函数，不是把每个核值逐点变成普通有限函数。'},
];
export function KernelGuideFigure(){
 const[active,setActive]=useState(0);
 return <figure className={`${W_PANEL} p-3 space-y-2`}>
 <figcaption className="text-sm font-medium">传播核怎样把一个波函数变成另一个？</figcaption>
 <Task>依次选择三个步骤，沿着复振幅从输入读到输出。</Task>
 <div className="flex flex-wrap gap-2">{stages.map((stage,j)=><button key={stage.button} className={j===active?W_BUTTON_AKTIV:W_BUTTON} aria-pressed={j===active} onClick={()=>setActive(j)}>{stage.button}</button>)}</div>
 <svg viewBox="0 0 340 314" width={340} height={314} className="w-full h-auto max-w-sm mx-auto" role="img" aria-label={`核、乘初态、积分的三步流程；当前步骤：${stages[active].title}`}>
 {stages.map((stage,j)=><g key={stage.title} transform={`translate(12,${12+j*104})`}>
 <rect width={316} height={88} rx={8} fill="var(--w-bg)" stroke={j===active?FMM_COLORS.blau:'var(--w-border)'} strokeWidth={j===active?3:1}/>
 <text x={14} y={22} fill={j===active?FMM_COLORS.blau:'var(--w-text)'} fontSize={13}>{j+1}　{stage.title}{j===active?'　◀ 当前':''}</text>
 <text x={158} y={48} textAnchor="middle" fill="var(--w-text)" fontSize={18}>{stage.formula}</text>
 <text x={158} y={72} textAnchor="middle" fill="var(--w-muted)" fontSize={12}>{stage.hint}</text>
 {j<2?<path d="M 158 91 L 158 99 M 154 95 L 158 99 L 162 95" fill="none" stroke="var(--w-axis)" strokeWidth={2}/>:null}
 </g>)}
 </svg>
 <Verdict kind="neutral" labels={{neutral:'读图',ok:'读图',warn:'读图',fail:'读图'}}>{stages[active].reading}</Verdict>
 <p className="text-xs">图例：蓝色粗框和“当前”标记指示所选步骤；所有步骤始终可读。图中箭头表示数学操作顺序。</p>
 </figure>;
}
