/* ---- DUE LINEE: LA PROFONDITA' DELLA ROSA ----
   In carriera giochi con una linea d'attacco (le mete in cui ricevi il pull) e una di difesa (quelle in cui lo tiri). Chi sta in entrambe non
   riposa mai e rende DBL_PEN in meno in tutte e due (12-allenamenti-rose.js); prima le stelle potevano giocare tutte le mete senza nessun costo,
   e una rosa da 12 valeva quanto una da 20.
   La potenza di squadra (rosterPower, 12-allenamenti-rose.js) conta anche la profondita': 60% i 7 migliori, 35% dal 8º al 14º, 5% dal 15º al 21º.
   Per la tua squadra i valori sono quelli di oggi (myPow in 10-partita-avvio.js): fuori gli infortunati, DBL_PEN a chi sta in entrambe le linee.
   LINE_REF e le due linee riportate alla scala dei 7 titolari (myLinesLevel) servono solo al freno di crescita (carGrowK), che misura un livello e non
   una potenza; nella partita giocata anche le squadre del computer alternano attacco e difesa (twoLines). */
const LINE_REF=3;
function twoLines(list){
  const lo=bestSeven(list),rest=list.filter(o=>!lo.includes(o)),ld=bestSeven(rest),dbl=new Set();
  if(ld.length<7)for(const o of lo.slice().sort((a,b)=>rate(b.s,'D')-rate(a.s,'D'))){if(ld.length>=7)break;ld.push(o);dbl.add(o);}
  return {lo,ld,dbl};
}
// partita giocata: le linee dell'avversario per questa partita (le chiama l'avvio della partita di carriera, dopo applyRoster)
function oppLinesSet(){OPP.ln=OPP.list.length?twoLines(OPP.list):null;}
// a ogni meta entra la linea giusta: se ricevi tu, l'avversario difende
function oppLine(rec){
  const L=OPP.ln;if(!L)return;
  const want=rec===0?L.ld:L.lo;
  for(let i=0;i<7&&i<want.length;i++)if(T[1][i].ro!==want[i])loadOpp(T[1][i],want[i],true);
}
