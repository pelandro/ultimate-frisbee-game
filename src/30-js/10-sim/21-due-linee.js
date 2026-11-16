/* ---- DUE LINEE: LA PROFONDITA' DELLA ROSA ----
   In carriera giochi con una linea d'attacco (le mete in cui ricevi il pull) e una di difesa (quelle in cui lo tiri). Chi sta in entrambe non
   riposa mai e rende DBL_PEN in meno in tutte e due (12-allenamenti-rose.js); prima le stelle potevano giocare tutte le mete senza nessun costo,
   e una rosa da 12 valeva quanto una da 20.
   La forza della tua squadra in partita e' quella delle due linee, riportata alla scala dei 7 migliori con LINE_REF: quanto in media le due
   linee valgono meno dei 7 migliori nelle rose dei club (misurato su tutti i campionati: da 2 a 3,4). Una rosa di profondita' normale vale
   come prima, una con 14 buoni giocatori di piu', una corta (o con le stelle in entrambe le linee) di meno. Le squadre del computer restano
   alla forza dei loro 7 migliori, che e' anche quella mostrata ovunque; nella partita giocata alternano anche loro attacco e difesa. */
const LINE_REF=3;
function twoLines(list){
  const lo=bestSeven(list),rest=list.filter(o=>!lo.includes(o)),ld=bestSeven(rest),dbl=new Set();
  if(ld.length<7)for(const o of lo.slice().sort((a,b)=>rate(b.s,'D')-rate(a.s,'D'))){if(ld.length>=7)break;ld.push(o);dbl.add(o);}
  return {lo,ld,dbl};
}
// forza delle due linee di una rosa (per i controlli: la tua usa le linee che hai scelto, myLinesPow)
function linesPow(list){
  if(!list||!list.length)return 0;
  const L=twoLines(list),av=l=>l.reduce((a,o)=>a+mean9(o)-(L.dbl.has(o)?DBL_PEN:0),0)/Math.max(1,l.length);
  return (av(L.lo)+av(L.ld))/2;
}
// partita giocata: le linee dell'avversario per questa partita (le chiama l'avvio della partita di carriera, dopo applyRoster)
function oppLinesSet(){OPP.ln=OPP.list.length?twoLines(OPP.list):null;}
// a ogni meta entra la linea giusta: se ricevi tu, l'avversario difende
function oppLine(rec){
  const L=OPP.ln;if(!L)return;
  const want=rec===0?L.ld:L.lo;
  for(let i=0;i<7&&i<want.length;i++)if(T[1][i].ro!==want[i])loadOpp(T[1][i],want[i],true);
}
