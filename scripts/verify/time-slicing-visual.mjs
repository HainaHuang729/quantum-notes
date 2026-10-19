import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {slicingState} from '../../src/sections/widgets/time-slicing.mjs';
const source=readFileSync(new URL('../../src/sections/widgets/TimeSlicingLab.tsx',import.meta.url),'utf8');
const ast=ts.createSourceFile('TimeSlicingLab.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const helper=ast.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==='slicingDiagram');
assert.ok(helper,'Exercise the actual exported geometry helper, not a copied implementation.');
const emitted=ts.transpileModule(helper.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {slicingDiagram}=await import(`data:text/javascript;base64,${Buffer.from(emitted).toString('base64')}`);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
let count=0;
for(let N=2;N<=12;N++)for(let ti=5;ti<=20;ti++){
 const s=slicingState(N,ti/10);
 // Independent Schur elimination of the complete endpoint-inclusive path matrix.
 const h=Array.from({length:N+1},(_,j)=>Array.from({length:N+1},(_,k)=>j===k?(j===0||j===N?1:2)/s.epsilon:Math.abs(j-k)===1?-1/s.epsilon:0));
 for(let step=0;step<=s.M;step++){
  const g=slicingDiagram(s,step);
  assert.equal(g.next,step+1);assert.equal(g.nodes.length,N+1);
  assert.equal(g.nodes.filter(n=>n.fixed).length,2);
  assert.equal(g.nodes.filter(n=>n.integrated).length,step);
  assert.ok(g.nodes.every(n=>n.x>=28&&n.x<=g.width-28));
  assert.ok(g.nodes.every((n,j)=>j===0||n.x-g.nodes[j-1].x>=38-1e-10));
  assert.equal(g.nodes[0].integrated,false);assert.equal(g.nodes[N].integrated,false);
  assert.ok(!/NaN|Infinity/.test(g.arc));
  near(g.coefficient,-h[0][step+1]);
  near(g.coefficient,1/((step+1)*s.epsilon));
  if(step===s.M)near(g.coefficient,1/s.T);
  else{
   const j=step+1,pivot=h[j][j],retained=[0,...Array.from({length:N-j},(_,k)=>j+1+k)];
   for(const row of retained)for(const col of retained)h[row][col]-=h[row][j]*h[j][col]/pivot;
  }
  count++;
 }
 const logs=[s.measureLog,s.fluctuationLog,s.logMagnitude],scale=Math.max(1,...logs.map(Math.abs));
 for(const value of logs)assert.ok(140+120*value/scale>=20-1e-10&&140+120*value/scale<=260+1e-10);
 near(s.measurePhase+s.fluctuationPhase,-Math.PI/4);
 near(s.measureLog+s.fluctuationLog,-Math.log(2*Math.PI*s.T)/2);
}
const figure=readFileSync(new URL('../../src/sections/widgets/KernelGuideFigure.tsx',import.meta.url),'utf8');
assert.equal((figure.match(/button:'/g)||[]).length,3);
assert.ok(figure.includes('aria-pressed={j===active}'));
assert.ok(figure.includes('不是概率密度')&&figure.includes('积分算符'));
const mdx=readFileSync(new URL('../../src/sections/S83.mdx',import.meta.url),'utf8');
assert.equal((mdx.match(/^### /gm)||[]).length,4);
assert.equal((mdx.match(/#eq-8\.3\./g)||[]).length,4);
assert.equal((mdx.match(/:::question\{/g)||[]).length,2);
assert.equal((mdx.match(/<KernelGuideFigure \/>/g)||[]).length,1);
assert.ok(!/^:+interactive/gm.test(mdx));
console.log(`Chapter 8 visual guide: ${count} elimination views; actual geometry bounds and independent endpoint Schur coefficients, log bars, phase balance, accessible flow and unchanged source-card groups passed.`);
