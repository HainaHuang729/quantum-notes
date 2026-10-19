/** Independent checks: scripts/verify/two-path-geometry-lab.mjs and
 * scripts/verify/real-eigenstate-lab.mjs. No random sampling or autoplay.
 */
import {useMemo,useState} from 'react';
import {Task,Verdict,Slider,Plot,W_BUTTON,fmtEn,FMM_COLORS} from '../../lib';
import {twoPathGeometry,geometryWindow,realEigenstate} from './chapter5-late.mjs';
const labels={neutral:'比较',ok:'判读',warn:'适用条件',fail:'不成立'},f=(v:number)=>fmtEn(v,3);
export function TwoPathGeometryLab(){
 const [wave,setWave]=useState(.5),[gap,setGap]=useState(1),[distance,setDistance]=useState(20),[y,setY]=useState(2);
 const r=twoPathGeometry(y,wave,gap,distance),window=useMemo(()=>geometryWindow(wave,gap,distance),[wave,gap,distance]);
 const reset=(near:boolean)=>{setWave(.5);setGap(near?3:1);setDistance(near?1:20);setY(2);};
 return <div className="space-y-2"><Task>先预测：缩短屏距后，等间距条纹近似还可靠吗？比较精确路程与近轴公式。</Task>
 <div className="grid md:grid-cols-[minmax(190px,230px)_minmax(0,1fr)] gap-3 items-start"><div><div className="flex flex-wrap gap-2"><button type="button" className={W_BUTTON} onClick={()=>reset(false)}>重置：远屏</button><button type="button" className={W_BUTTON} onClick={()=>reset(true)}>重置：近屏</button></div>
 <Slider label="波长 λ" value={wave} onChange={setWave} min={.2} max={2} step={.1} fmt={f}/><Slider label="缝距 a" value={gap} onChange={setGap} min={.5} max={3} step={.25} fmt={f}/><Slider label="屏距 D" value={distance} onChange={setDistance} min={1} max={20} step={1} fmt={f}/><Slider label="观察点 y" value={y} onChange={setY} min={-4} max={4} step={.1} fmt={f}/></div>
 <Plot width={520} height={265} series={[{f:x=>twoPathGeometry(x,wave,gap,distance).intensity,label:'精确',color:FMM_COLORS.blau},{f:x=>twoPathGeometry(x,wave,gap,distance).approximate,label:'近轴',color:FMM_COLORS.orange,dash:[5,3]}]} xDomain={[-4,4]} yDomain={[-.04,1.05]} xLabel="屏上位置 y" yLabel="相对 Born 权重 I" markers={[{x:y,y:r.intensity,color:FMM_COLORS.blau}]} ariaLabel="固定屏幕窗口中精确几何与近轴近似的干涉权重比较"/></div>
 <p className="text-sm">所有长度用同一单位。r₊ = {f(r.upper)}，r₋ = {f(r.lower)}；路差 = {f(r.pathDifference)}；相位差 = {f(r.phase)} rad，近轴值 = {f(r.approxPhase)} rad。当前 I = {f(r.intensity)}；边缘相位误差 = {f(window.edgeError)} rad。</p>
 <p className="text-sm">窗口 [−4,4] 内已探测到的条件下，P(|y| ≤ 0.25) = {fmtEn(100*window.centerProbability,2)}%。该概率由曲线积分后归一化；曲线本身不是归一化密度。</p>
 <Verdict labels={labels} kind={window.branch==='accurate'?'ok':'warn'}>{window.branch==='accurate'?'窗口两端的近轴相位误差均小于 0.1 rad，满足本实验的相位精度标准；这不单独保证振幅近似也准确。':'窗口边缘的近轴相位误差至少 0.1 rad，不能只靠 λD/a 预测整窗条纹。'} 0.1 rad 是选定的近似标准；近屏的传播振幅也随距离变化。</Verdict>
 <p className="text-xs">模型：同相等强点源，A± = D/r±，I = |A₊e^(ikr₊)+A₋e^(ikr₋)|²/4；近轴线另取 A±≈1。忽略真实缝宽、边界衍射及探测效率；不是完整双缝边值解。</p></div>;
}
export function RealEigenstateLab(){
 const [weight,setWeight]=useState(0),[phase,setPhase]=useState(45),r=realEigenstate(weight,phase);
 const reset=(w:number)=>{setWeight(w);setPhase(45);};
 const makeReal=()=>setPhase(weight>.5?270:0);
 return <div className="space-y-2"><Task>比较单一本征态与不同能量的复叠加：改一个整体相位，能让整条虚部同时消失吗？</Task>
 <div className="grid md:grid-cols-[minmax(190px,230px)_minmax(0,1fr)] gap-3 items-start"><div><div className="flex flex-wrap gap-2"><button type="button" className={W_BUTTON} onClick={()=>reset(0)}>重置：本征态</button><button type="button" className={W_BUTTON} onClick={()=>reset(.5)}>复叠加</button><button type="button" className={W_BUTTON} onClick={makeReal}>试着去整体相位</button></div><Slider label="第二态权重 w" value={weight} onChange={setWeight} min={0} max={1} step={.05} fmt={f}/><Slider label="整体相位 χ" value={phase} onChange={setPhase} min={0} max={360} step={15} fmt={v=>`${v}°`}/></div>
 <Plot width={520} height={245} xDomain={[-.5,.5]} yDomain={[-2.1,2.1]} series={[{f:r.real,label:'实部',color:FMM_COLORS.blau},{f:r.imaginary,label:'虚部',color:FMM_COLORS.orange,dash:[5,3]}]} xLabel="位置 x/L" yLabel="√L ψ 的分量" ariaLabel="居中无限深箱中叠加态的实部与虚部，观察整体相位能否使虚部全为零"/></div>
 <p className="text-sm">ψ = e^(iχ)[√(1−w) φ₁ + i√w φ₂]；φ₁ = √2 cos(πx)，φ₂ = √2 sin(2πx)，L=1。取 ℏ²/(2mL²)=1：〈H〉= {f(r.energy)}；Var(H) = {f(r.energyVariance)}。</p>
 <p className="text-sm">当前虚部平方积分 = {f(r.currentImaginaryNorm)}；允许任意整体相位后的最小值 = {f(r.minimumImaginaryNorm)}。按钮选择使虚部最小的整体相位；权重端点可为 0，内部最小值严格大于 0。</p>
 <Verdict labels={labels} kind={r.branch==='eigenstate'?'ok':'warn'}>{r.branch==='eigenstate'?'当前只有一个能量本征态。整体相位可去除，使位置本征函数全为实数。':'当前含两个不同能量：能量方差严格为正，不是单一本征态。两个正交实函数带相对 i，不能用一个整体相位同时实化。'} 两种情况都使用同一个实势 Hamiltonian；区别在定理要求的状态条件。</Verdict>
 <p className="text-xs">这是某一时刻的态，不作时间动画。实部和虚部不是两个概率；概率密度为两者平方之和，整体相位不会改变它。箱端点为 Dirichlet 边界，不是环形周期边界。</p></div>;
}
