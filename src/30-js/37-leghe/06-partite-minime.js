/* ===================== LEGHE EUROPEE: ALMENO 11 PARTITE A STAGIONE =====================
   Chi vince il livello deve arrivare ad almeno LN_MIN partite (girone piu' fasi finali). I gironi si giocano solo a giri completi: sola andata, oppure andata
   e ritorno (o il numero di giri fisso legs del livello), cosi' ogni avversaria del girone si incontra lo stesso numero di volte. Con i formati di adesso
   (01-formati.js) basta la sola andata dappertutto, tranne la Serie B Women (7 squadre: andata e ritorno). */
const LN_MIN=SEASON_MIN;   // 30-carriera/28-allenamenti-fuori-stagione.js
// quante partite della fase finale gioca di sicuro la vincitrice (i turni, meno uno se nel tabellone puo' esserci un riposo)
function lnFinR(tr,sizes){
  const sp=tr.fin[0];if(!sp)return 0;
  if(sp.f>1)return 0;   // chi e' sopra la fase (la prima, promossa direttamente) non la gioca: le partite devono bastare nel girone
  const take=sizes.map(s=>Math.max(0,Math.min(s,sp.t)-sp.f+1));
  if(sp.m==='b6')return 2;   // la 1ª e la 2ª partono dalla semifinale
  if(sp.m==='c8'&&take.length===1)return take[0]<8?2:3;
  if(sp.m==='c8'||sp.m==='x8')return (sp.m==='c8'?3:2)-(take.length<2||take.some(x=>x<4)?1:0);
  if(sp.m==='c4'||sp.m==='k4')return 2-((take.length>1?take.some(x=>x<2):take[0]<4)?1:0);
  if(sp.m==='p')return 1-(take[0]%2?1:0);
  return Math.max(0,take.reduce((a,b)=>a+b,0)-1);   // rr: minigirone
}
// partite di girone che servono a ogni squadra della competizione
const lnGrpMin=(tr,sizes)=>{
  const one=Math.max(...sizes)-1;if(one<1)return 0;   // un giro: ogni squadra gioca una volta contro tutte le altre del girone
  const need=Math.max(one,LN_MIN-lnFinR(tr,sizes));
  return Math.max(tr.legs||1,Math.ceil(need/one))*one;   // solo giri completi
};
// calendario del girone: giri di tutti contro tutti (al ritorno si invertono casa e trasferta) finche' tutti hanno almeno g partite (g e' sempre un numero di giri completi)
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
