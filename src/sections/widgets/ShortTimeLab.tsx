/** Source8.5 first-order update; independent verification: scripts/verify/short-time.mjs. */
import {useState} from 'react';
import {Slider,Plot,Task,Verdict,W_BUTTON,fmtEn,FMM_COLORS} from '../../lib';
import {shortTimePoint,shortTimeNorm,SHORT_TIME_PRESETS} from './short-time.mjs';
const titles=['① 常数项','② 奇项相消','③ 加入曲率','④ 加入势能'];
const blue=FMM_COLORS.blau,orange=FMM_COLORS.orange,purple=FMM_COLORS.violett,green=FMM_COLORS.gruen;
const f=(v:number)=>fmtEn(v,4);
export function ShortTimeScaleFigure(){
 return <figure className="quantum-figure">
 <figcaption><b>图解：时间越短，相位纹路越密</b><span>蓝实线 cos φ，紫虚线 sin φ；φ=η²/(2ε)，m=ℏ=1。</span></figcaption>
 <div className="scale-figure-pair">{[.2,.05].map(time=><div key={time}>
 <Plot width={450} height={220} xDomain={[-1.4,1.4]} yDomain={[-1.3,1.3]} xLabel="位移 η" yLabel="核的相位因子" series={[{f:eta=>Math.cos(eta*eta/(2*time)),color:blue,label:'实部'},{f:eta=>Math.sin(eta*eta/(2*time)),color:purple,label:'虚部',dash:[5,3]}]} vlines={[-1,1].map(sign=>({at:sign*Math.sqrt(2*Math.PI*time),color:orange,dash:[2,3]}))} ariaLabel={`ε=${time}的单位相位因子；虚线标记相位转过π的位置，图外积分没有被截断`}/>
 <p>ε={time}；橙标记 |η|=√(2πε)≈{fmtEn(Math.sqrt(2*Math.PI*time),3)}</p>
 </div>)}</div>
 <p>ε 缩为四分之一，相同相位转角对应的位移缩为二分之一。橙标记表示相位尺度，积分仍到 ±∞；每个相位因子的模都是 1。</p>
 </figure>;
}
export function ShortTimeLab(){
 const[sigma,setSigma]=useState(1),[epsilon,setEpsilon]=useState(.1),[V,setV]=useState(0),[x,setX]=useState(0),[stage,setStage]=useState(3),[exact,setExact]=useState(false);
 const p=shortTimePoint(x,sigma,epsilon,V,stage),norm=shortTimeNorm(sigma,epsilon,V);
 const reset=()=>{setSigma(1);setEpsilon(.1);setV(0);setX(0);setStage(3);setExact(false)};
 const selected=(stage>=2?p.kinetic:0)+(stage>=3?p.potential:0);
 return <div className="short-time-lab space-y-3">
 <Task>先在峰顶、拐点与外侧之间切换，预测曲率带来的虚部正负。再缩短 ε，叠加精确结果，观察一阶近似怎样接近它。</Task>
 <div className="visual-step-buttons" aria-label="短时推导步骤">{titles.map((title,i)=><button key={title} className={W_BUTTON} aria-pressed={stage===i} onClick={()=>setStage(i)}>{title}</button>)}</div>
 <div className="short-time-terms" aria-label="积分中的四步贡献">
 <div><b style={{color:blue}}>常数 ψ</b><span>归一核积分 I₀</span><strong>保留原振幅</strong></div>
 <div data-active={stage>=1}><b style={{color:green}}>一次项 ηψ′</b><span>±η 两侧成对抵消</span><strong>{stage>=1?'贡献为 0':'等待配对'}</strong></div>
 <div data-active={stage>=2}><b style={{borderBottom:`2px solid ${orange}`}}>二次项 η²ψ″/2</b><span>η² 按 ε 计阶</span><strong>{stage>=2?'留下 iεψ″/2':'尚未加入'}</strong></div>
 <div data-active={stage>=3}><b style={{borderBottom:`2px solid ${purple}`}}>势能项 −iεV₀ψ</b><span>同一位置的相位更新</span><strong>{stage>=3?'与动能项相加':'尚未加入'}</strong></div>
 </div>
 <div className="short-time-layout"><div className="short-time-settings">
 <div className="flex flex-wrap gap-2">{SHORT_TIME_PRESETS.map(preset=><button key={preset.label} className={W_BUTTON} onClick={()=>{setSigma(preset.sigma);setEpsilon(preset.epsilon);setV(preset.V);setX(preset.x);setStage(3)}}>{preset.label}</button>)}</div>
 <Slider label="初态宽度 σ" value={sigma} onChange={setSigma} min={.7} max={1.5} step={.1} fmt={f}/>
 <Slider label="短时间 ε" value={epsilon} onChange={setEpsilon} min={.01} max={.2} step={.01} fmt={f}/>
 <Slider label="常数势 V₀" value={V} onChange={setV} min={-1} max={1} step={.25} fmt={f}/>
 <Slider label="观察位置 x" value={x} onChange={setX} min={-3} max={3} step={.1} fmt={f}/>
 <div className="flex flex-wrap gap-2"><button className={W_BUTTON} aria-pressed={exact} onClick={()=>setExact(v=>!v)}>{exact?'隐藏精确结果':'叠加精确结果'}</button><button className={W_BUTTON} onClick={reset}>重置短时实验</button></div>
 <p className="text-xs">约化单位 m=ℏ=1。选定长度 ℓ 后，时间单位 mℓ²/ℏ，能量单位 ℏ²/(mℓ²)。横轴范围固定为 −4 至 4，积分与归一讨论覆盖全实轴。</p>
 </div><div className="short-time-plots">
 <Plot width={530} height={245} xDomain={[-4,4]} yDomain={[-.3,1]} xLabel="位置 x" yLabel="初态振幅" series={[{f:q=>shortTimePoint(q,sigma,epsilon,V).initial,color:blue,label:'ψ 初态'}]} vlines={[{at:x,color:orange}]} markers={[{x,y:p.initial,color:orange,r:4}]} ariaLabel="实初态Gaussian与选定观察位置；峰顶向下弯，外侧向上弯"/>
 <Plot width={530} height={245} xDomain={[-4,4]} yDomain={[-.4,.4]} xLabel="位置 x" yLabel="更新的虚部" series={[
 {f:q=>stage>=2?shortTimePoint(q,sigma,epsilon,V).kinetic:0,color:orange,label:'动能'},
 {f:q=>stage>=3?shortTimePoint(q,sigma,epsilon,V).potential:0,color:purple,label:'势能',dash:[5,3]},
 {f:q=>shortTimePoint(q,sigma,epsilon,V,stage).im,color:blue,label:'合计'},
 ...(exact?[{f:(q:number)=>shortTimePoint(q,sigma,epsilon,V).exactIm,color:green,label:'精确 Im ψ',dash:[2,3]}]:[])
 ]} vlines={[{at:x,color:orange}]} markers={[{x,y:selected,color:blue,r:4}]} ariaLabel="短时虚部的动能项、势能项与总和，可叠加精确Gaussian演化比较"/>
 </div></div>
 <div className="short-time-readout" aria-live="polite">
 <span>ψ={f(p.initial)}</span><span>ψ′={f(p.slope)}</span><span>ψ″={f(p.curvature)}</span><span style={{borderBottom:`2px solid ${orange}`}}>动能虚部={f(p.kinetic)}</span><span style={{borderBottom:`2px solid ${purple}`}}>势能虚部={f(p.potential)}</span><span>当前合计={f(selected)}</span>
 </div>
 <Verdict labels={{neutral:'曲率为零',ok:'向下弯',warn:'向上弯'}} kind={Math.abs(x)===sigma?'neutral':p.curvature<0?'ok':'warn'}>{Math.abs(x)===sigma?'拐点处 ψ″=0，动能的一阶局部更新为零；它不代表整个波函数停止演化。':p.curvature<0?'这里 ψ″<0，动能先产生负虚部。':'这里 ψ″>0，动能先产生正虚部。'} 常数势给整个态相同的相位旋转；实部在这份实初态的一阶更新中不变。</Verdict>
 {exact&&<p className="text-sm">精确值：Re ψ={f(p.exactRe)}，Im ψ={f(p.exactIm)}。完整一阶式的全空间范数平方={f(norm)}；精确演化为 1。一阶式没有再次归一化，偏差从 ε² 起，缩短时间可检查它。</p>}
 <p className="text-xs">蓝线表示复振幅的虚部，纵轴允许为负；它不是概率密度。初态 ψ=(πσ²)^(−1/4)exp[−x²/(2σ²)]，势 V(x)=V₀ 处处相同。本实验用这一可解特例对照短时展开，没有对任意势求出精确解。</p>
 </div>;
}
