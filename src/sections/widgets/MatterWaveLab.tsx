/** Numeric relations and bin integration: scripts/verify/matter-wave-lab.mjs.
 * Rounded source ħ; fixed a,d; equal coherent amplitudes, constant envelope.
 * Bin means are analytic, so dense fringes cannot alias into a visible pattern.
 */
import {useState} from "react";
import {Slider,Plot,Task,Verdict,W_BUTTON,FMM_COLORS,fmtEn} from "../../lib";
import {MATTER_H,MATTER_SCREEN,MATTER_SLIT,MATTER_BIN_COUNT,matterWaveState,matterBinIntensity} from "./matter-wave-math.mjs";
const sci=(x:number)=>x.toExponential(2).replace('e',' × 10^');
const labels={neutral:"观察",ok:"条纹较宽",warn:"分辨率正在限制读数",fail:"不能据此分辨条纹"};
export function MatterWaveLab(){
 const[u,setU]=useState(-20),[v,setV]=useState(-3),s=matterWaveState(u,v);
 const bins=Array.from({length:MATTER_BIN_COUNT},(_,i)=>({index:i-(MATTER_BIN_COUNT-1)/2,intensity:matterBinIntensity(s,i-(MATTER_BIN_COUNT-1)/2)}));
 const windowPeriods=MATTER_BIN_COUNT*s.ratio;
 return <div className="matter-wave-lab">
  <div className="matter-task"><Task>增大动量，再改变探测区间宽度，比较条纹变密与平均效应。</Task></div>
  <div className="matter-settings">
  <Slider label="动量指数 u" value={u} onChange={setU} min={-22} max={0} step={.1} fmt={x=>fmtEn(x,1)}/>
  <Slider label="分辨率指数 v" value={v} onChange={setV} min={-4} max={-1} step={.1} fmt={x=>fmtEn(x,1)}/>
  <div className="flex flex-wrap gap-2 my-2">
   <button className={W_BUTTON} onClick={()=>{setU(-20);setV(-3)}}>较宽条纹</button>
   <button className={W_BUTTON} onClick={()=>{setU(-19);setV(-3)}}>跨过分辨尺度</button>
   <button className={W_BUTTON} onClick={()=>{setU(0);setV(-3)}}>原书弹丸动量</button>
  </div>
  </div>
  <div className="matter-figures">
  <Plot series={[
   {f:x=>Math.log10(MATTER_H)-x,color:FMM_COLORS.blau,label:"波长 λ"},
   {f:x=>Math.log10(MATTER_H*MATTER_SCREEN/MATTER_SLIT)-x,color:FMM_COLORS.orange,label:"条纹间距 Δx"}
  ]} xDomain={[-22,0]} yDomain={[-28,1]} width={500} height={290} xLabel="动量指数 u" yLabel="长度指数 n（长度 = 10ⁿ cm）" ariaLabel="波长及条纹间距随动量指数变化" hlines={[{at:v,label:"探测区间宽度 r",color:FMM_COLORS.gruen,dash:[5,4]}]} vlines={[{at:u,color:FMM_COLORS.rot}]} markers={[{x:u,y:Math.log10(s.spacing),color:FMM_COLORS.orange}]}/>
  <svg viewBox="0 0 500 95" width="500" height="95" className="block w-full h-auto" role="img" aria-label="三十个连续探测区间的平均相对强度；需结合窗口宽度判断等亮的原因">
   {bins.map((b,i)=><rect key={i} x={25+i*15} y="15" width="14" height="40" rx="1" fill={FMM_COLORS.blau} opacity={.08+.46*b.intensity}><title>{`x=${sci(b.index*s.resolution)} cm，平均相对强度=${fmtEn(b.intensity,4)}`}</title></rect>)}
   <text x="25" y="75" fill="var(--w-muted)" fontSize="12">−15r</text><text x="250" y="75" textAnchor="middle" fill="var(--w-text)" fontSize="12">屏幕位置 x = 0</text><text x="475" y="75" textAnchor="end" fill="var(--w-muted)" fontSize="12">15r</text>
  </svg>
  </div>
  <div className="matter-results">
  <p className="text-sm">p = {sci(s.momentum)} g·cm/s；λ = {sci(s.wavelength)} cm；Δx = {sci(s.spacing)} cm；r = {sci(s.resolution)} cm。每格覆盖 r/Δx = {sci(s.ratio)} 个周期，整个 {MATTER_BIN_COUNT} 格窗口覆盖 {sci(windowPeriods)} 个周期。</p>
  <Verdict labels={labels} kind={s.branch==='resolved'?'ok':s.branch==='transition'?'warn':'neutral'}>
   {s.branch==='resolved'?(windowPeriods<1?'单格分辨率足够细，但整个显示窗口不足一个周期；格子近乎等亮可能只是窗口太窄，不能据此说条纹被平均掉。':'单格宽度不超过四分之一个周期，当前窗口也足以覆盖一个周期，模型中的明暗变化较容易保留。'):s.branch==='transition'?'单格宽度已接近条纹周期，区间平均会明显改变读数，部分起伏可能消失。':'单格跨越多个周期，读数趋近平滑平均；这不等于粒子没有物质波。'}
   {' '}平均模型的起伏系数绝对值为 {sci(Math.abs(s.visibility))}（理想细分辨率上限为 1）。这些分区阈值只作教学提示，不是普适仪器判据。
  </Verdict>
  </div>
 </div>;
}
