/* ---- economia: crediti da partite, classifica e obiettivi; si spendono in giocatori, osservatori e strutture ---- */
function priceOf(o){const v=ovrX(o),pr=potRange(o),pm=(pr[0]+pr[1])/2;return Math.max(3,Math.round(Math.pow(Math.max(0,v-34),2)/11*(o.age<=21?1.25:(o.age>=31?0.55:1))*(1+Math.max(0,pm-v)/60)));}
// chi ha annunciato il ritiro vale poco (gli resta mezza stagione), un infortunato un po' meno: prima si incassava il prezzo pieno alla vigilia dell'addio
const sellValue=o=>Math.round(priceOf(o)*0.6*(o.ret===1?0.35:1)*(o.inj?0.8:1));
const repCap=()=>48+SV.rep*0.5;   // Overall massimo dei giocatori disposti a venire, in base alla reputazione
const matchIncome=win=>Math.round((9+(win?8:0))*SR_K[SV.sr]*(1+SV.rep/200)*(1+0.07*facLv('stad')));   // le tribune portano pubblico
// stipendi: ogni giocatore costa in base al suo Overall (a stagione); si pagano a ogni partita. Una rosa lunga e forte costa: tenere le riserve giuste e' una scelta
const wageOf=o=>2+Math.pow(Math.max(0,ovrX(o)-40),2)/85;
const wageBill=()=>Math.round(SQ.reduce((a,p)=>a+wageOf(p),0)/15);
// STRUTTURE: sei, fino al livello 5 (FAC_MAX). Costano sempre di piu', hanno una manutenzione a partita e d'estate possono perdere un livello (11-carriera-dinamica.js)
const FAC_MAX=5;
const FAC={camp:['Campo di allenamento','Gli allenamenti rendono il 10% in più per livello'],fis:['Fisioterapia','Più recupero a ogni giornata e infortuni meno frequenti (−12% per livello)'],viv:['Vivaio','Più giovani promesse sul mercato, e più forti'],
  stad:['Tribune','Incasso di ogni partita +7% per livello'],oss:['Rete di osservatori','Osservare un giocatore costa 1 credito in meno per livello'],sede:['Sede del club','Affiatamento più rapido e morale di base più alto']};
const facLv=k=>(SV.fac&&SV.fac[k])|0;
const facCost=k=>Math.round(60*(facLv(k)+1)*(1+0.2*facLv(k)));   // 60, 144, 252, 384, 540
function buyFac(k){const c=facCost(k);if(facLv(k)>=FAC_MAX||SV.cash<c)return false;SV.cash-=c;SV.fac[k]=(SV.fac[k]|0)+1;news('Struttura migliorata: '+FAC[k][0]+' al livello '+SV.fac[k]+'.');return true;}
/* ---- mercato: giovani promesse, svincolati e giocatori messi in vendita dalle altre squadre. Del potenziale si vede solo un intervallo: gli osservatori lo stringono ---- */
