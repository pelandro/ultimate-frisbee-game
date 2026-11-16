/* ---- NUMERI CHE CONTANO: un valore che compare (punteggio finale) sale da zero a scatti invece di apparire gia' fatto ----
   Scatti netti (al massimo 12) come un tabellone; con «riduci movimento» del sistema il numero compare subito */
function countUp(el,to,ms){
  if(!el)return;to=Math.round(+to||0);ms=ms||Math.min(900,180+to*60);
  if(to<=0||(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)){el.textContent=String(to);return;}
  const t0=performance.now(),steps=Math.min(12,to);el.textContent='0';
  const tick=now=>{const u=Math.min(1,(now-t0)/ms),v=u>=1?to:Math.round(Math.floor(u*steps)/steps*to);el.textContent=String(v);if(u<1)requestAnimationFrame(tick);};
  requestAnimationFrame(tick);
}
