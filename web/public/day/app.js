const TEXT=`To jest testowy skrypt. Mów głośno i wyraźnie. Gdy milczysz, tekst stoi. Gdy mówisz, tekst rusza.`;
const cam=document.getElementById('cam'), prompter=document.getElementById('prompter');
const words=tokenize(TEXT); let spans=[], pointer=0;
prompter.innerHTML=words.map((w,i)=>`<span class="word${i===0?' active':''}">${w} </span>`).join('');
spans=[...prompter.querySelectorAll('.word')];
function setPtr(i){pointer=Math.min(i,words.length-1);spans.forEach((el,idx)=>el.classList.toggle('active',idx<=pointer));spans[pointer]?.scrollIntoView({behavior:'smooth',block:'center'})}
function showTab(){document.querySelectorAll('.tab').forEach(d=>d.style.display='none');(document.getElementById(location.hash.slice(1)||'prompter')).style.display='block'}
addEventListener('hashchange',showTab); showTab();

(async()=>{
  const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
  cam.srcObject=stream;
  const mr=new MediaRecorder(stream,{mimeType:'audio/webm'}); let chunks=[];
  mr.ondataavailable=e=>chunks.push(e.data);
  mr.onstop=async ()=>{
    const blob=new Blob(chunks,{type:'audio/webm'}); chunks=[];
    const fd=new FormData(); fd.append('file', new File([await blob.arrayBuffer()],'clip.webm',{type:'audio/webm'}));
    const res=await fetch(BACKEND+'/api/whisper',{method:'POST',body:fd});
    const {text=''}=await res.json(); const {cov,idx}=align(text,words,pointer);
    if(cov>=.65) setPtr(idx);
    mr.start(); setTimeout(()=>mr.stop(),2000);
  };
  mr.start(); setTimeout(()=>mr.stop(),2000);
})();
const BACKEND = ''; // używa tego samego hosta (Vercel) → /api/whisper
