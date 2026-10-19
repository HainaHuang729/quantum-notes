import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ConceptLink, QuizLabelsProvider, ProofLabelsProvider, TooltipProvider } from "./lib";
import { sections } from "./sections";
import { SectionBody } from "./mdx/adapters";
import { chapters, sectionNames } from "./lesson/chapters";
import type { LessonCard } from "./lesson/cards";
import.meta.glob("./concepts/*.tsx", { eager: true });
import "./mdx/concepts-mdx";

const course=chapters.map(chapter=>{
 const parts=sections.filter(s=>s.id===chapter.id||s.id.startsWith(`${chapter.id}.`));
 return {...chapter,sections:parts,cards:parts.flatMap(s=>s.cards),coverId:chapter.id==="1"?"card-cover":`card-cover-${chapter.id}`};
});
const deck: {id:string;chapterId:string;card?:LessonCard}[]=course.flatMap(ch=>[
 {id:ch.coverId,chapterId:ch.id},...ch.cards.map(card=>({id:card.id,chapterId:ch.id,card})),
]);
const targets=new Map<string,number>([["reading",0],["",0]]);
for(const [i,item] of deck.entries()){
 targets.set(item.id,i);
 for(const anchor of item.card?.anchors||[])targets.set(anchor,i);
}
for(const ch of course){
 targets.set(`chapter-${ch.id}`,targets.get(ch.coverId)!);
 for(const s of ch.sections){const first=targets.get(s.cards[0]?.id);if(first!==undefined){targets.set(`sec-${s.id}`,first);if(s.key)targets.set(`sec-${s.key}`,first);}}
}
function hashTarget(){try{return decodeURIComponent(location.hash.slice(1));}catch{return "";}}
function scrollToAnchor(anchor:string){
 const target=document.getElementById(anchor),body=target?.closest<HTMLElement>('.slide-body');
 if(!target||!body)return;
 const box=target.getBoundingClientRect(),frame=body.getBoundingClientRect();
 body.scrollTop+=box.top-frame.top-Math.max(0,(body.clientHeight-box.height)/2);
}
function initialCard(){const hash=hashTarget();if(hash&&targets.has(hash))return targets.get(hash)!;try{return targets.get(localStorage.getItem("shankar-card-position-v1")||"")||0;}catch{return 0;}}
function readProgress():string[]{try{
 const p=JSON.parse(localStorage.getItem("shankar-course-progress-v2")||localStorage.getItem("shankar-chapter1-progress-v1")||"[]");
 return Array.isArray(p)?[...new Set(p.filter((x):x is string=>typeof x==="string"&&sections.some(s=>s.id===x)))]:[];
}catch{return [];}}
const kindNames={concept:"主题卡",definition:"定义与结论",proof:"推导卡",experiment:"动手实验",quiz:"自测卡",reading:"深入阅读"};
export default function App(){
 const [active,setActive]=useState(initialCard),[done,setDone]=useState(readProgress),[menu,setMenu]=useState(false),[storageError,setStorageError]=useState(false);
 const item=deck[active],activeCard=item.card,sectionId=activeCard?.sectionId;
 const chapter=course.find(ch=>ch.id===item.chapterId)!;
 const coverIndex=targets.get(chapter.coverId)!,chapterPosition=active-coverIndex;
 const completed=chapter.sections.filter(s=>done.includes(s.id)).length;
 const focusTarget=useRef<string|null>(null);
 const go=(index:number,anchor?:string)=>{
  const n=Math.max(0,Math.min(deck.length-1,index));focusTarget.current=anchor||null;setActive(n);setMenu(false);
  history.replaceState(null,"",`#${anchor||deck[n].id}`);
  if(n===active)requestAnimationFrame(()=>{if(anchor)scrollToAnchor(anchor);});
 };
 useEffect(()=>{try{localStorage.setItem("shankar-card-position-v1",item.id);localStorage.setItem("shankar-course-progress-v2",JSON.stringify(done));}catch{setStorageError(true);}},[item.id,done]);
 useEffect(()=>{
  document.querySelectorAll<HTMLElement>(".slide-body").forEach(el=>{el.scrollTop=0;});
  document.querySelectorAll<HTMLElement>(".slide-card").forEach(el=>{el.scrollTop=0;});
  const target=focusTarget.current;focusTarget.current=null;
  requestAnimationFrame(()=>{if(target)scrollToAnchor(target);});
 },[active]);
 useEffect(()=>{
  const hashChange=()=>{const target=hashTarget(),n=targets.get(target);if(n!==undefined){focusTarget.current=target;setActive(n);setMenu(false);}};
  const keyboard=(e:KeyboardEvent)=>{
   if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||document.querySelector('[data-tt-key]'))return;
   if(e.target instanceof Element&&e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
   if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();go(active+1);}
   if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();go(active-1);}
  };
  window.addEventListener("hashchange",hashChange);window.addEventListener("keydown",keyboard);
  return()=>{window.removeEventListener("hashchange",hashChange);window.removeEventListener("keydown",keyboard);};
 },[active]);
 const followReference=(e:MouseEvent)=>{
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||!(e.target instanceof Element))return;
  const a=e.target.closest<HTMLAnchorElement>('a[href^="#"]');if(!a)return;
  let target:string;try{target=decodeURIComponent(a.hash.slice(1));}catch{return;}
  const n=targets.get(target);if(n!==undefined){e.preventDefault();go(n,target);}
 };
 const currentGroup=chapter.sections.find(s=>s.id===sectionId);
 const localIndex=currentGroup?currentGroup.cards.findIndex(c=>c.id===activeCard?.id)+1:0;
 const isLastInSection=!!activeCard&&deck[active+1]?.card?.sectionId!==sectionId;
 const isLastInChapter=!!activeCard&&chapterPosition===chapter.cards.length;
 const nextChapter=course[course.indexOf(chapter)+1];
 const toggle=()=>{if(sectionId)setDone(p=>p.includes(sectionId)?p.filter(x=>x!==sectionId):[...p,sectionId]);};
 return <TooltipProvider labels={{pin:"固定窗口",close:"关闭",pinned:"已固定"}}><QuizLabelsProvider labels={{true:"正确",false:"错误",correct:"回答正确。",incorrect:t=>`再想一想，这个说法${t?"正确":"错误"}。`,check:"检查答案",numericCorrect:()=>"回答正确。",numericIncorrect:v=>`当前输入 ${v} 超出允许误差，请再试一次。`,numericInvalid:"请输入有效数字。"}}><ProofLabelsProvider labels={{proof:"推导",stepByStep:"逐步阅读",showFullProof:"展开完整推导",nextStep:"下一步",qed:"推导结束"}}>
 <div className="deck-app" onClick={followReference}>
  <header className="topbar"><button className="wordmark" onClick={()=>go(coverIndex)} aria-label="返回本章封面"><span className="brand-mark">ψ</span><span>量子手记<small>QUANTUM NOTES</small></span></button><div className="top-context">SHANKAR <span>/</span> 第 {chapter.id} 章 · {chapter.title}</div><span className="deck-mode">按章学习</span><button className="mobile-menu" aria-expanded={menu} aria-controls="chapter-nav" onClick={()=>setMenu(!menu)}>{menu?"收起目录":"章节目录"}</button></header>
  <div className="deck-layout">
   <aside className={`sidebar ${menu?"is-open":""}`} id="chapter-nav" aria-label="章节目录">
    <div className="sidebar-book"><span className="eyebrow">学习伴读 · 第二版</span><h2>量子力学原理</h2><p>R. Shankar</p></div>
    <label className="chapter-select-label" htmlFor="chapter-select">选择章节</label>
    <select id="chapter-select" value={chapter.id} onChange={e=>go(targets.get(`chapter-${e.target.value}`)!)}>{course.map(ch=><option key={ch.id} value={ch.id}>第 {ch.id} 章 · {ch.title}</option>)}</select>
    <button className={`cover-nav ${!activeCard?"active":""}`} onClick={()=>go(coverIndex)}>◈　本章学习路线</button>
    <div className="deck-chapter-title">第 {chapter.id} 章 <span>{chapter.cards.length} 张内容卡</span></div>
    <nav>{chapter.sections.map(s=><button key={s.id} className={`nav-item ${sectionId===s.id?"active":""}`} aria-current={sectionId===s.id?"location":undefined} onClick={()=>go(targets.get(`sec-${s.id}`)!)}><span className="nav-num">{s.id}</span><span>{sectionNames[s.id]||s.title}<small>{s.cards.length} 张卡片</small></span><span className={`nav-dot ${done.includes(s.id)?"complete":""}`}>{done.includes(s.id)?"✓":""}</span></button>)}</nav>
    <div className="sidebar-progress"><div><span>{chapter.id==="6"?"本章阅读完成":"本章已完成小节"}</span><b>{completed} / {chapter.sections.length}</b></div><progress max={chapter.sections.length} value={completed} aria-label="本章已完成小节数"/><p>{storageError?"浏览器未允许保存，进度仅本次有效。":"翻到哪张，下次就从哪张继续。"}</p></div>
    <div className="sidebar-next"><span>下一章</span><p>{nextChapter?.title||chapter.next}</p>{nextChapter?<button onClick={()=>go(targets.get(nextChapter.coverId)!)}>前往第 {nextChapter.id} 章 →</button>:<small>按原书顺序继续制作</small>}</div>
    <div className="deck-source">依据 Shankar 第 {chapter.id} 章<br/>中文独立讲解 · 个人本地学习</div>
   </aside>
   <div className="deck-stage" id="reading">
    <div className="deck-context"><span>{chapter.title} <i>/</i> {activeCard?sectionNames[sectionId!]||currentGroup?.title:"学习路线"}</span><span className="deck-local-count">{activeCard?`本节 ${localIndex} / ${currentGroup!.cards.length}`:`CHAPTER ${chapter.id.padStart(2,"0")}`}</span></div>
    <main className="slide-stage" aria-label="学习卡片">
     {course.map(ch=><article key={ch.id} className="slide-card cover-card" hidden={item.id!==ch.coverId} id={ch.coverId} aria-label={`第 ${ch.id} 章封面`}>
      <div className="slide-body cover-body"><span className="chapter-pill">CHAPTER {ch.id.padStart(2,"0")} · {ch.prerequisite}</span><h1>{ch.lead}<br/><em>{ch.focus}</em></h1><p className="cover-description">{ch.description}</p><div className="cover-route">{ch.route.map((name,i)=><span key={name}>{i>0&&<b>→</b>}{name}</span>)}</div><div className="cover-hints"><p><span>01</span>{ch.id==="6"?"全章连续讲解":`本章 ${ch.sections.length} 节`} · {ch.cards.length} 张内容卡，按 ← → 逐张学习。</p><p><span>02</span>{ch.id==="1"?<>点开不熟悉的术语，比如 <ConceptLink id="complex-number">复数</ConceptLink>，逐层补齐前置知识。</>:ch.id==="3"?<>从单次探测认识 <ConceptLink id="probability">概率</ConceptLink>，用多次实验看见条纹。</>:ch.id==="4"?<>先预测 <ConceptLink id="probability">测量概率</ConceptLink>，再切换基底、执行测量或推进时间，比较结果。</>:ch.id==="5"?<>调节时间、边界与势能，用同一条 <ConceptLink id="differential-equation">微分方程</ConceptLink> 比较不同系统。</>:ch.id==="6"?<>比较函数的 <ConceptLink id="weighted-average">平均值</ConceptLink>，检验量子预测在什么条件下接近经典。</>:ch.id==="8"?<>改变路径或切片数，观察 <ConceptLink id="complex-number">复振幅</ConceptLink> 怎样相加。</>:ch.id==="7"?<>切换能级与叠加相位，比较同一态在不同表象中的 <ConceptLink id="probability">概率</ConceptLink>。</>:<>先认识 <ConceptLink id="derivative">变化率</ConceptLink>，再用实验理解运动方程。</>}</p><p><span>03</span>{ch.id==="1"?"遇到实验先动手，推导可以逐步展开。":"数学基础可随时返回第 1 章复习，阅读位置会自动保存。"}</p></div><button className="primary-action" onClick={()=>go(targets.get(ch.coverId)!+1)}>开始本章<span>→</span></button><small className="cover-attribution">参考 R. Shankar · Principles of Quantum Mechanics, 2nd ed.<br/>原书版权归原权利人所有，本版供个人本地学习。</small></div>
      <span className="cover-symbol" aria-hidden="true">{ch.symbol}</span>
     </article>)}
     {deck.map((entry,i)=>entry.card&&<article key={entry.id} className="slide-card" hidden={active!==i} id={entry.id} data-kind={entry.card.kind} data-topics={entry.card.topics} data-chapter={entry.chapterId} aria-label={entry.card.title}>
      <header className="slide-heading"><span className="slide-type">{kindNames[entry.card.kind]}<i>·</i>{entry.card.sectionId}</span><h1>{entry.card.title}</h1></header>
      <div className="slide-body" tabIndex={active===i?0:-1}><SectionBody>{entry.card.nodes}</SectionBody></div>
      <div className="slide-card-footer"><span>SHANKAR · {course.find(ch=>ch.id===entry.chapterId)!.english}</span>{active===i&&isLastInSection&&<button className={done.includes(sectionId!)?"is-done":""} aria-pressed={done.includes(sectionId!)} onClick={toggle}>{done.includes(sectionId!)?"✓ 本节已完成":"○ 标记本节完成"}</button>}</div>
     </article>)}
    </main>
    <footer className="deck-controls"><button className="page-back" disabled={active===0} onClick={()=>go(active-1)}>← <span>{chapterPosition===0&&active>0?"上一章":"上一张"}</span></button><div className="deck-page-picker"><label htmlFor="card-select">{String(chapterPosition+1).padStart(2,"0")} <span>/ {chapter.cards.length+1}</span></label><select id="card-select" aria-label="跳转本章卡片" value={active} onChange={e=>go(Number(e.target.value))}><option value={coverIndex}>本章封面</option>{chapter.sections.map(s=><optgroup key={s.id} label={`${s.id} ${sectionNames[s.id]||s.title}`}>{s.cards.map(c=><option key={c.id} value={targets.get(c.id)}>{c.title}</option>)}</optgroup>)}</select></div><span className="keyboard-hint">← → 翻页</span><button className="page-next" disabled={active===deck.length-1} onClick={()=>go(active+1)}><span>{isLastInChapter?(nextChapter?`进入第 ${nextChapter.id} 章`:"本章已读完"):"下一张"}</span> →</button></footer>
   </div>
  </div>
 </div>
 </ProofLabelsProvider></QuizLabelsProvider></TooltipProvider>;
}

