/* ---- economia: crediti da partite (biglietti, sponsor, premi), classifica e obiettivi; si spendono in giocatori, osservatori e strutture ---- */
function priceOf(o){const v=ovrX(o),pr=potRange(o),pm=(pr[0]+pr[1])/2;return Math.max(3,Math.round(Math.pow(Math.max(0,v-34),2)/11*(o.age<=21?1.25:(o.age>=31?0.55:1))*(1+Math.max(0,pm-v)/60)));}
// chi ha annunciato il ritiro vale poco (gli resta mezza stagione), un infortunato un po' meno: prima si incassava il prezzo pieno alla vigilia dell'addio
const sellValue=o=>Math.round(priceOf(o)*0.6*(o.ret===1?0.35:1)*(o.inj?0.8:1));
const repCap=()=>48+SV.rep*0.5;   // Overall massimo dei giocatori disposti a venire, in base alla reputazione
// l'incasso di una partita e' in 26-economia-partita.js (matchMoney): biglietti secondo i tifosi (20-tifosi-umore.js) e la capienza delle Tribune, sponsor, premio vittoria
// stipendi: ogni giocatore costa in base al suo Overall (a stagione); si pagano a ogni partita. Una rosa lunga e forte costa: tenere le riserve giuste e' una scelta
const wageOf=o=>4+Math.pow(Math.max(0,ovrX(o)-40),2)/50;   // prima 2+(Ov-40)²/85: un giocatore costava quasi niente dopo averlo comprato e la cassa cresceva da sola (Ov 50: 6 invece di 3, 70: 22 invece di 13, 85: 45 invece di 26)
// premio della lega a chi sale di categoria (150 per il peso della serie nuova: Serie B circa 195, Serie A circa 250): senza, con gli stipendi veri una neopromossa non aveva di che rinforzarsi
const promoPrize=sr=>Math.round(150*(SR_K[sr]||1));
const wageBill=()=>Math.round(SQ.reduce((a,p)=>a+wageOf(p),0)/15);
// STRUTTURE: sei, fino al livello 5 (FAC_MAX). Costano sempre di piu', hanno una manutenzione a partita e d'estate possono perdere un livello (11-carriera-dinamica.js)
const FAC_MAX=5;
const FAC={camp:['Campo di allenamento','Gli allenamenti rendono il 6% in più per livello e stancano il 6% in meno'],fis:['Fisioterapia','Più recupero a ogni giornata e infortuni meno frequenti (−12% per livello)'],viv:['Vivaio','Più giovani promesse sul mercato, e più forti'],
  stad:['Tribune','Stadio più capiente: +55% di posti per livello (se i tifosi sono tanti si riempie, e l’incasso cresce)'],oss:['Rete di osservatori','Osservare un giocatore costa il 15% in meno per livello'],sede:['Sede del club','Affiatamento più rapido e morale di base più alto']};
const facLv=k=>(SV.fac&&SV.fac[k])|0;
const facCost=k=>Math.round(60*(facLv(k)+1)*(1+0.2*facLv(k)));   // 60, 144, 252, 384, 540
function buyFac(k){const c=facCost(k);if(facLv(k)>=FAC_MAX||SV.cash<c)return false;SV.cash-=c;SV.fac[k]=(SV.fac[k]|0)+1;news('Struttura migliorata: '+FAC[k][0]+' al livello '+SV.fac[k]+'.');return true;}
/* ---- mercato: giovani promesse, svincolati e giocatori messi in vendita dalle altre squadre. Del potenziale si vede solo un intervallo: gli osservatori lo stringono ---- */
