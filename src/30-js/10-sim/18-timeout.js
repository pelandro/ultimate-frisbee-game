/* ---- TIMEOUT ----
   Come nell'ultimate vero: una pausa a partita (TMO_N), chiamata da chi ha il disco. Lo stall riparte da zero, la tua squadra in campo recupera un poco di energia
   (TMO_REST) e si puo' cambiare lo schema d'attacco prima di ripartire. Si chiama solo con il disco in mano, fuori dal volo e dal pull.
   G.tmo[squadra] = timeout gia' usati (si azzera in newGame; sopravvive alla sospensione, vedi suspSnap).
   L'etichetta della situazione sopra il portatore (stall, ultimo lancio, match point, universe point) e' qui: la usano il campo e le prove. */
const TMO_N=1,TMO_REST=14;
const tmoLeft=t=>TMO_N-((G.tmo&&G.tmo[t])|0);
function canTimeout(t){return !!G.inMatch&&!G.drill&&G.mode==='play'&&!G.flight&&!G.walk&&!G.pull&&!G.brickWait&&!!G.holder&&G.holder.t===t&&tmoLeft(t)>0;}
function callTimeout(t){
  if(!canTimeout(t))return false;
  if(!G.tmo)G.tmo=[0,0];G.tmo[t]++;
  G.stallT=0;G.holdT=0;
  for(const p of T[t])p.st=Math.min(100,p.st+TMO_REST);
  for(const p of T[t]){p.cmd=null;if(p!==G.holder){p.cs='set';p.cutT=rnd(0.6,1.4);}}   // si torna in formazione: nessuno resta a meta' di un taglio
  HOOKS.sfx('whistle');
  return true;
}
// dopo un cambio di schema in timeout: la formazione riparte dal nuovo schema (senza contare un possesso in piu' nel riepilogo)
function timeoutRescheme(){if(G.holder&&G.holder.t===0){G.pb=G.pb||[null,null];startPlay(0,G.sch.att);}}
// etichetta della situazione: testo e colore, oppure null. n = conteggio dello stall (1..10) se sei marcato
function situationLabel(h,n){
  if(!h||G.mode!=='play')return null;
  const t=G.target-1,a=G.score[0],b=G.score[1];
  if(n>=9)return {txt:'ULTIMO LANCIO',hot:true};
  if(n>=6)return {txt:'STALL '+n,hot:n>=8};
  if(a===t&&b===t)return {txt:'UNIVERSE POINT',hot:false};
  if(a===t||b===t)return {txt:'MATCH POINT',hot:false};
  return null;
}
