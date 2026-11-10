/* ---- economia: crediti da partite, classifica e obiettivi; si spendono in giocatori, osservatori e strutture ---- */
function priceOf(o){const v=ovrX(o),pr=potRange(o),pm=(pr[0]+pr[1])/2;return Math.max(3,Math.round(Math.pow(Math.max(0,v-34),2)/11*(o.age<=21?1.25:(o.age>=31?0.55:1))*(1+Math.max(0,pm-v)/60)));}
const sellValue=o=>Math.round(priceOf(o)*0.6);
const repCap=()=>48+SV.rep*0.5;   // Overall massimo dei giocatori disposti a venire, in base alla reputazione
const matchIncome=win=>Math.round((9+(win?8:0))*SR_K[SV.sr]*(1+SV.rep/200));
// stipendi: ogni giocatore costa in base al suo Overall (a stagione); si pagano a ogni partita. Una rosa lunga e forte costa: tenere le riserve giuste e' una scelta
const wageOf=o=>2+Math.pow(Math.max(0,ovrX(o)-40),2)/85;
const wageBill=()=>Math.round(SQ.reduce((a,p)=>a+wageOf(p),0)/15);
const FAC={camp:['Campo di allenamento','Gli allenamenti rendono il 15% in più per livello'],fis:['Fisioterapia','Recupero più rapido della condizione e meno infortuni'],viv:['Vivaio','Più giovani promesse sul mercato, e più forti']};
const facCost=k=>60*((SV.fac[k]|0)+1);
function buyFac(k){const c=facCost(k);if((SV.fac[k]|0)>=3||SV.cash<c)return false;SV.cash-=c;SV.fac[k]=(SV.fac[k]|0)+1;news('Struttura migliorata: '+FAC[k][0]+' al livello '+SV.fac[k]+'.');return true;}
/* ---- mercato: giovani promesse, svincolati e giocatori messi in vendita dalle altre squadre. Del potenziale si vede solo un intervallo: gli osservatori lo stringono ---- */
