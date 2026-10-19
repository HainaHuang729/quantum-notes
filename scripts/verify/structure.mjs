import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
const root=process.cwd(),sectionFiles=fs.readdirSync('src/sections').filter(f=>/^S\d+\.mdx$/.test(f));
assert.equal(sectionFiles.length,44);
const sectionIds=sectionFiles.map(f=>fs.readFileSync(path.join('src/sections',f),'utf8').match(/export const id\s*=\s*"([^"]+)"/)?.[1]);
for(const [chapter,count] of [[1,10],[2,8],[3,5],[4,3],[5,6],[7,5],[8,6]])for(let n=1;n<=count;n++)assert.ok(sectionIds.includes(`${chapter}.${n}`),`missing section ${chapter}.${n}`);
assert.ok(sectionIds.includes("6"),"missing unsectioned Chapter6");
// The scanned chapter has 117 numbered formulas, including three paired subtags.
const range=(prefix,n)=>Array.from({length:n},(_,i)=>`${prefix}.${i+1}`);
const oscillatorLabels={S71:[...range('7.1',4),'7.1.5a','7.1.5b',...Array.from({length:6},(_,i)=>`7.1.${i+6}`)],S72:range('7.2',5),S73:range('7.3',45),S74:range('7.4',44).flatMap(id=>['7.4.19','7.4.36','7.4.37'].includes(id)?[id+'a',id+'b']:[id]),S75:range('7.5',8)};
for(const [file,expected]of Object.entries(oscillatorLabels)){
 const source=fs.readFileSync(`src/sections/${file}.mdx`,'utf8');
 assert.deepEqual([...source.matchAll(/\{#eq-([^}]+)\}/g)].map(m=>m[1]).sort(),expected.sort(),`${file}: source formula coverage`);
}
const pathIntegralLabels=Object.fromEntries([1,2,4,8,8,15].map((n,i)=>['S8'+(i+1),range('8.'+(i+1),n)]));
for(const [file,expected]of Object.entries(pathIntegralLabels)){
 const source=fs.readFileSync(`src/sections/${file}.mdx`,'utf8');
 assert.deepEqual([...source.matchAll(/\{#eq-([^}]+)\}/g)].map(m=>m[1]).sort(),expected.sort(),`${file}: source formula coverage`);
}
const concepts=new Map(fs.readdirSync('src/concepts').filter(f=>!f.startsWith('_')&&f.endsWith('.mdx')).map(f=>[f.slice(0,-4),fs.readFileSync(path.join('src/concepts',f),'utf8')]));
function links(s){return [...s.matchAll(/:[kc]\[[^\]]*\]\{#([\w-]+)\}|<ConceptLink\s+id="([\w-]+)"/g)].map(m=>m[1]||m[2]);}
const main=sectionFiles.map(f=>fs.readFileSync(path.join('src/sections',f),'utf8')).join('\n');
const todo=new Set(links(main+'\n'+fs.readFileSync('src/App.tsx','utf8'))),seen=new Set();
while(todo.size){const id=todo.values().next().value;todo.delete(id);if(seen.has(id))continue;assert.ok(concepts.has(id),'missing concept '+id);seen.add(id);for(const c of links(concepts.get(id)))todo.add(c);}
assert.equal(seen.size,concepts.size,'orphan concepts must be linked or removed');
const stack=new Set(),done=new Set();function visit(id){assert.ok(!stack.has(id),'concept dependency cycle '+id);if(done.has(id))return;stack.add(id);for(const n of links(concepts.get(id)))visit(n);stack.delete(id);done.add(id);}for(const id of seen)visit(id);
assert.ok(!main.includes('{{'));
// Read actual directive boundaries so nested fences and several deep dives stay distinct.
const parser=unified().use(remarkParse).use(remarkMdx).use(remarkMath).use(remarkDirective);
const hidden=[],visible=[];
for(const f of sectionFiles){
 const source=fs.readFileSync(path.join('src/sections',f),'utf8'),ranges=[];
 const walk=node=>{if(node.type==='containerDirective'&&['deepdive','vertiefung'].includes(node.name)){ranges.push([node.position.start.offset,node.position.end.offset]);return;}for(const child of node.children||[])walk(child);};
 walk(parser.parse(source));let start=0;
 for(const[a,b]of ranges){visible.push(source.slice(start,a));hidden.push(source.slice(a,b));start=b;}visible.push(source.slice(start));
}
const hiddenIds=hidden.flatMap(s=>[...s.matchAll(/\{#eq-([^}]+)\}|:id\[([^\]]+)\]/g)].map(m=>m[1]||m[2]));
const visibleRefs=new Set([...visible.join('\n').matchAll(/@(eq|sec|num|ref):([\w.-]+)/g)].map(m=>m[2]));
for(const id of hiddenIds)assert.ok(!visibleRefs.has(id),'visible reference to collapsed target '+id);
console.log(`structure: 44 reading units in 8 chapters, ${concepts.size} reachable concepts, zero missing/orphan/cycle; deep-dive references checked`);
