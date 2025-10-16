window.tokenize=t=>t.replace(/[\n\r]+/g,' ').replace(/[^\p{L}\p{N}'’\-\s]/gu,' ').toLowerCase().split(/\s+/).filter(Boolean);
window.normalize=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
window.align=(partial,words,start=0,w=14)=>{
  const p=tokenize(normalize(partial)); if(!p.length) return {cov:0,idx:start};
  let best={s:0,i:start}; const from=Math.max(0,start-12),to=Math.min(words.length,start+120);
  for(let i=from;i<to;i++){const slice=words.slice(i,i+w);let m=0,pi=0;
    for(let t=0;t<slice.length&&pi<p.length;t++) if(slice[t]===p[pi]){m++;pi++}
    const score=m/Math.max(1,Math.min(w,p.length)); if(score>best.s) best={s:score,i:i+m}}
  return {cov:best.s,idx:Math.max(start,best.i)};
};
