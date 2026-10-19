import assert from 'node:assert/strict';
import { spectralGuide } from '../../src/sections/widgets/math-visual-guides.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<2e-11,`${a} != ${b}`);
const full=a=>[[a[0],a[1]],[a[1],a[2]]];
const multiply=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((z,x,k)=>z+x*b[k][j],0)));
const q=[[Math.sqrt(3)/2,-.5],[.5,Math.sqrt(3)/2]];
let count=0;
for(let i=-8;i<=8;i++)for(let j=-8;j<=8;j++)for(const kind of ['square','exp','inverse']) {
  const values=[i/4,j/4],s=spectralGuide(...values,kind),a=full(s.matrix), aq=multiply(a,q);
  for(let r=0;r<2;r++)for(let c=0;c<2;c++)close(aq[r][c],q[r][c]*values[c]);
  assert.equal(s.mapped===null,kind==='inverse'&&values.includes(0));
  if(s.mapped) {
    const fa=full(s.mapped),faq=multiply(fa,q);
    for(let c=0;c<2;c++) {
      const y=kind==='square'?values[c]**2:kind==='exp'?Math.exp(values[c]):1/values[c];
      close(s.values[c],y);assert.ok(y> -5&&y<10);
      for(let r=0;r<2;r++)close(faq[r][c],q[r][c]*y);
    }
    if(kind==='square'){const aa=multiply(a,a);for(let r=0;r<2;r++)for(let c=0;c<2;c++)close(fa[r][c],aa[r][c]);}
    if(kind==='inverse'){const id=multiply(a,fa);for(let r=0;r<2;r++)for(let c=0;c<2;c++)close(id[r][c],r===c?1:0);}
    if(kind==='exp'){
      let term=[[1,0],[0,1]],sum=[[1,0],[0,1]];
      for(let n=1;n<=40;n++){term=multiply(term,a).map(row=>row.map(x=>x/n));sum=sum.map((row,r)=>row.map((x,c)=>x+term[r][c]));}
      for(let r=0;r<2;r++)for(let c=0;c<2;c++)close(fa[r][c],sum[r][c]);
    }
  }
  count++;
}
assert.equal(spectralGuide(0,2,'inverse').mapped,null);
close(spectralGuide(-1,2,'square').mapped[0],1.75);
console.log(`spectral-guide: ${count} control states, eigenvector mapping, independent matrix square/inverse/exponential and zero-eigenvalue rejection passed`);
