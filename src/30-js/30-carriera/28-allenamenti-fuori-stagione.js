/* ===================== ALLENAMENTI DOPO L'ELIMINAZIONE =====================
   Ogni campionato garantisce almeno SEASON_MIN partite a chi arriva fino in fondo (in Europa con piu' giri nei gironi: 37-leghe/06-partite-minime.js).
   Chi finisce prima, per esempio negli USA senza Play-in o Nationals, resta a casa mentre gli altri giocano: a fine stagione la squadra si allena
   le settimane mancanti come farebbe il programma automatico (seduta di squadra piu' tre lavori individuali, all'intensita' scelta, senza infortuni)
   e i progressi compaiono all'inizio della stagione nuova. SV.sgp conta le giornate di campionato della stagione (anche quelle prima del tuo arrivo, da subentrato). */
const SEASON_MIN=11;
const sessFor=m=>Math.ceil(Math.max(0,m)/carDiff().n);   // sedute disponibili prima di m partite (una ogni n, la prima prima del debutto)
function offTrain(){
  if(SV.sgp===undefined)return;   // salvataggi di prima: non si sa quante se ne sono giocate
  const played=SV.sgp|0,miss=Math.max(0,SEASON_MIN-played),ses=sessFor(SEASON_MIN)-sessFor(played);
  SV.sgp=undefined;
  if(!miss||ses<=0||!SQ.length)return;
  let pts=0;const it=trInt(),was=new Map(SQ.map(p=>[p,ovr(p)])),ok=()=>SQ.filter(p=>!p.inj);
  for(let s=0;s<ses;s++){
    let best=CATS[0],bs=-1;for(const c of CATS){const v=ok().reduce((a,p)=>a+trainExpect(p,c,trainMul(p)*it.g),0);if(v>bs){bs=v;best=c;}}
    for(const p of ok())pts+=trainCategory(p,best,trainMul(p)*it.g).gain;
    if(best.id==='tat')SV.chem=clamp(SV.chem+3,0,100);
    const one=p=>{let b=CATS[0],v=-1;for(const c of CATS){const e=trainExpect(p,c,trainMul(p)*1.5*it.g);if(e>v){v=e;b=c;}}return [p,b,v];};
    for(const [p,c] of ok().map(one).sort((a,b)=>b[2]-a[2]).slice(0,3))pts+=trainCategory(p,c,trainMul(p)*1.5*it.g).gain;
  }
  const up=SQ.map(p=>[p,was.get(p),ovr(p)]).filter(x=>x[2]>x[1]).sort((a,b)=>(b[2]-b[1])-(a[2]-a[1])||b[2]-a[2]);
  const list=up.slice(0,5).map(x=>`${pname(x[0])} ${x[1]}→${x[2]}`).join(', ');
  const txt=`Allenamenti dopo la fine della vostra stagione: mentre le altre giocavano, la squadra si è allenata per ${miss} ${miss>1?'settimane':'settimana'} (${ses} ${ses>1?'sedute':'seduta'}, +${pts} punti di statistiche).`+(up.length?` Overall in crescita per ${up.length} ${up.length>1?'giocatori':'giocatore'}: ${list}${up.length>5?'…':''}.`:' Per ora nessun Overall è salito di un punto intero.');
  alertAdd('up',txt);news(txt);
}
