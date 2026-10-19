/** Shared models checked by scripts/verify/energy-phase-lab.mjs and pulse-order-lab.mjs.
 * Abstract two-dimensional Hermitian models, ħ=1; no automatic playback/timers.
 */
import {useState} from 'react';
import {Slider,Plot,Task,Verdict,W_BUTTON,FMM_COLORS,fmtEn} from '../../lib';
import {energyEvolution,pulseEvolution} from './quantum-evolution.mjs';
const labels={neutral:'观察',ok:'比较结果',warn:'注意特例',fail:'重新预测'};
const complex=(z:number[])=>`${fmtEn(z[0],3)} ${z[1]<0?'−':'+'} ${fmtEn(Math.abs(z[1]),3)}i`;
export function EnergyPhaseLab(){
 const[g,setG]=useState(1),[w,setW]=useState(.5),[phi,setPhi]=useState(0),[step,setStep]=useState(0),[guess,setGuess]=useState(''),[show,setShow]=useState(false);
 const s=energyEvolution(g,w,phi,step),stationary=w===0||w===1||g===0;
 const preset=(gap:number,weight:number)=>{setG(gap);setW(weight);setPhi(0);setStep(0);setShow(false)};
 return <div className="quantum-evolution-lab"><div className="evolution-task"><Task>先预测：改变时间，哪些测量概率会变？比较能量本征态、叠加态与零能隙，再拖动时间或单步前进。</Task></div>
 <div className="evolution-settings">
 <Slider label="能隙 ΔE" value={g} onChange={setG} min={0} max={4} step={.25}/>
 <Slider label="初态 |1〉权重 w" value={w} onChange={setW} min={0} max={1} step={.1}/>
 <Slider label="相对相位 φ（度）" value={phi} onChange={setPhi} min={0} max={360} step={15}/>
 <Slider label="时间刻度 n" value={step} onChange={setStep} min={0} max={120} step={1}/>
 <div className="flex flex-wrap gap-2 my-2"><button className={W_BUTTON} disabled={step===0} onClick={()=>setStep(x=>Math.max(0,x-1))}>后退一步</button><button className={W_BUTTON} disabled={step===120} onClick={()=>setStep(x=>Math.min(120,x+1))}>前进一步</button><button className={W_BUTTON} onClick={()=>preset(1,.5)}>重置：等权叠加</button><button className={W_BUTTON} onClick={()=>preset(1,1)}>能量本征态</button><button className={W_BUTTON} onClick={()=>preset(0,.5)}>零能隙</button></div>
 </div><div className="evolution-figures">
 <Plot series={[{f:t=>energyEvolution(g,w,phi,t*30/Math.PI).other[0],color:FMM_COLORS.blau,label:'P(+) '},{f:()=>w,color:FMM_COLORS.orange,label:'P(E₁)'}]} xDomain={[0,4*Math.PI]} yDomain={[0,1]} xLabel="时间 t" yLabel="测量概率" width={500} height={245} vlines={[{at:s.t,color:FMM_COLORS.rot}]} markers={[{x:s.t,y:s.other[0],color:FMM_COLORS.blau}]} ariaLabel="另一组基的测量概率随时间振荡，能量概率保持恒定"/>
 <p className="text-sm">时间 t = nπ/30 = {fmtEn(s.t,3)}；相对相位 φ − ΔEt = {fmtEn(s.phase,3)} rad。c₀ = {complex(s.state[0])}，c₁ = {complex(s.state[1])}。归一化 = {fmtEn(s.norm,6)}。P(E₀) = {fmtEn(s.energy[0],3)}，P(E₁) = {fmtEn(s.energy[1],3)}；P(+) = {fmtEn(s.other[0],3)}，P(−) = {fmtEn(s.other[1],3)}。</p>
 </div><div className="evolution-answer">
 <label>对当前参数预测整个时间区间： <select value={guess} onChange={e=>{setGuess(e.target.value);setShow(false)}}><option value="">选择预测</option><option value="stationary">两组概率都不变</option><option value="oscillate">仅 ± 基概率振荡</option><option value="energy">能量概率振荡</option></select></label> <button className={W_BUTTON} disabled={!guess} onClick={()=>setShow(true)}>比较预测</button>
 <Verdict labels={labels} kind={show?(guess===(stationary?'stationary':'oscillate')?'ok':'fail'):'neutral'}>{show?(stationary?'本征态或零能隙使相对相位没有可观测的时间变化，两组概率都固定。':'两项获得不同相位，± 基把它们重新相加而出现振荡；能量基只取各系数模平方，概率固定。'):'固定参数后改变时间。这里 E₀=0、E₁=ΔE，ℏ=1；设置零能隙时任意叠加也是定态。'}</Verdict></div></div>;
}
export function PulseOrderLab(){
 const[a,setA]=useState(2),[b,setB]=useState(2),[order,setOrder]=useState('AB'),[stage,setStage]=useState(2),[guess,setGuess]=useState(''),[show,setShow]=useState(false);
 const ab=pulseEvolution(a,b,'AB'),ba=pulseEvolution(a,b,'BA'),s=pulseEvolution(a,b,order,stage),sameReadout=ab.sameReadout;
 const preset=(aa:number,bb:number)=>{setA(aa);setB(bb);setStage(2);setOrder('AB');setShow(false)};
 return <div className="quantum-evolution-lab"><div className="evolution-task"><Task>同一初态 |+〉，保持 A、B 各自时长，只交换顺序。先预测最终 P(0) 是否相同，再逐段观察。</Task></div>
 <div className="evolution-settings">
 <Slider label="A 角刻度 a" value={a} onChange={setA} min={0} max={8} step={1}/><Slider label="B 角刻度 b" value={b} onChange={setB} min={0} max={8} step={1}/>
 <label>观察顺序 <select value={order} onChange={e=>setOrder(e.target.value)}><option value="AB">先 A 后 B</option><option value="BA">先 B 后 A</option></select></label>
 <Slider label="演化步骤" value={stage} onChange={setStage} min={0} max={2} step={1}/>
 <p className="text-xs">0 初态，1 第一段结束，2 两段结束。</p>
 <div className="flex flex-wrap gap-2 my-2"><button className={W_BUTTON} onClick={()=>preset(2,2)}>重置：两段均 π/4</button><button className={W_BUTTON} onClick={()=>preset(0,2)}>A 时长为零</button><button className={W_BUTTON} onClick={()=>preset(4,2)}>本读出偶然相同</button></div>
 </div><div className="evolution-figures">
 <Plot series={[{f:x=>pulseEvolution(x*8/Math.PI,b,'AB').probabilities[0],color:FMM_COLORS.blau,label:'先 A 后 B'},{f:x=>pulseEvolution(x*8/Math.PI,b,'BA').probabilities[0],color:FMM_COLORS.orange,label:'先 B 后 A'}]} xDomain={[0,Math.PI]} yDomain={[0,1]} xLabel="A 脉冲角度 θA（rad）" yLabel="两段结束的 P(0)" width={500} height={245} vlines={[{at:ab.a,color:FMM_COLORS.rot}]} ariaLabel="相同脉冲不同顺序的最终测量概率比较"/>
 <p className="text-sm">θA = aπ/8 = {fmtEn(s.a,3)} rad；θB = bπ/8 = {fmtEn(s.b,3)} rad。总时长 θA + θB = {fmtEn(s.total,3)}（ℏ 与能量尺度均取 1）。当前顺序 {order==='AB'?'先 A 后 B':'先 B 后 A'}，步骤 {stage}：c₀ = {complex(s.state[0])}，c₁ = {complex(s.state[1])}；P(0) = {fmtEn(s.probabilities[0],3)}，P(1) = {fmtEn(s.probabilities[1],3)}，归一化 = {fmtEn(s.norm,6)}。最终 P(0)：AB = {fmtEn(ab.probabilities[0],3)}，BA = {fmtEn(ba.probabilities[0],3)}。</p>
 </div><div className="evolution-answer">
 <label>当前参数的末态概率预测 <select value={guess} onChange={e=>{setGuess(e.target.value);setShow(false)}}><option value="">选择预测</option><option value="same">相同</option><option value="different">不同</option></select></label> <button className={W_BUTTON} disabled={!guess} onClick={()=>setShow(true)}>比较预测</button>
 <Verdict labels={labels} kind={show?(guess===(sameReadout?'same':'different')?'ok':'fail'):'neutral'}>{sameReadout?'此参数、初态和读出下两种概率严格相同：至少一段角度为 π/2 的整数倍。一个概率相同不能证明两个演化算符相同，更不能证明 Hamiltonian 对易。':'交换两段改变了最终 P(0)，总时长相同仍不够：后来发生的演化必须乘在左边。'} {show?'预测比较已按当前参数更新。':'先作预测；曲线显示完整两段结果，数值读数可逐段查看。'}</Verdict></div></div>;
}
