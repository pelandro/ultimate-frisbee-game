/* ===================== LEGHE EUROPEE: ALMENO 11 PARTITE A STAGIONE =====================
   I formati veri (01-formati.js) danno pochissime partite: in Belgio 3 di girone e 3 di tabellone, nel Regno Unito 3 + 2. Per avere stagioni paragonabili
   a quella italiana (15 giornate e playoff), i gironi si giocano con piu' giri contro le stesse squadre (andata, ritorno, terzo giro...) finche' chi vince
   il livello arriva ad almeno LN_MIN partite. Il giro in piu' puo' essere parziale: basta che ogni squadra del girone abbia giocato il numero che serve.
   I livelli dove le partite gia' bastano restano a un giro solo. Le fasi finali non cambiano. */
const LN_MIN=SEASON_MIN;   // 30-carriera/28-allenamenti-fuori-stagione.js
// quante partite della fase finale gioca di sicuro la vincitrice (i turni, meno uno se nel tabellone puo' esserci un riposo)
function lnFinR(tr,sizes){
  const sp=tr.fin[0];if(!sp)return 0;
  if(sp.f>1)return 0;   // chi e' sopra la fase (la prima, promossa direttamente) non la gioca: le partite devono bastare nel girone
  const take=sizes.map(s=>Math.max(0,Math.min(s,sp.t)-sp.f+1));
  if(sp.m==='c8'||sp.m==='x8')return (sp.m==='c8'?3:2)-(take.length<2||take.some(x=>x<4)?1:0);
  if(sp.m==='c4'||sp.m==='k4')return 2-((take.length>1?take.some(x=>x<2):take[0]<4)?1:0);
  if(sp.m==='p')return 1-(take[0]%2?1:0);
  return Math.max(0,take.reduce((a,b)=>a+b,0)-1);   // rr: minigirone
}
// partite di girone che servono a ogni squadra della competizione
const lnGrpMin=(tr,sizes)=>Math.max(Math.max(...sizes)-1,LN_MIN-lnFinR(tr,sizes));
// calendario del girone: giri di tutti contro tutti (al ritorno si invertono casa e trasferta) finche' tutti hanno almeno g partite
function lnGrpSched(n,g){
  if(n<2)return [];
  const rr=roundRobin(n),out=[],cnt=Array(n).fill(0);
  for(let k=0;Math.min(...cnt)<g&&k<rr.length*40;k++){
    const leg=Math.floor(k/rr.length),R=rr[k%rr.length].map(([a,b])=>leg%2?[b,a]:[a,b]);
    out.push(R);for(const [a,b] of R){cnt[a]++;cnt[b]++;}
  }
  return out;
}
const lnCompMin=(tr,comp)=>lnGrpMin(tr,comp.pools.map(p=>p.length));
// per la scheda del campionato: quante partite di girone si giocano in un livello (dalle dimensioni dei dati)
function lnTierGames(lk,tr){
  const rows=lnClubRows(lk).filter(r=>r[1]===tr.id).length,ps=Math.ceil(rows/Math.max(1,tr.comps)/Math.max(1,tr.pools));
  const sizes=[...Array(Math.max(1,tr.pools))].map((_,i)=>i?Math.floor(rows/tr.comps/tr.pools):ps);
  return {g:lnGrpMin(tr,sizes),one:Math.max(...sizes)-1};
}
