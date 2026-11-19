/* ---- economia: crediti da partite (biglietti, sponsor, premi), classifica e obiettivi; si spendono in giocatori, osservatori e strutture ---- */
function priceOf(o){const v=ovrX(o),pr=potRange(o),pm=(pr[0]+pr[1])/2;return Math.max(3,Math.round(Math.pow(Math.max(0,v-34),2)/11*(o.age<=21?1.25:(o.age>=31?0.55:1))*(1+Math.max(0,pm-v)/60)));}
// chi ha annunciato il ritiro vale poco (gli resta mezza stagione), un infortunato un po' meno: prima si incassava il prezzo pieno alla vigilia dell'addio
// cessione immediata, senza compratore: la prima della stagione rende il 40% del valore, ogni altra 4 punti in meno fino al 16% (SV.sellN, azzerato in
// beginSeason). Chi svuotava in un colpo una rosa da 28 incassava quasi 1000 crediti; vendere 2-3 giocatori resta come prima. Le offerte dei club pagano di piu'
const sellPct=()=>Math.max(0.16,0.4-0.04*((SV&&SV.sellN)|0));
const sellValue=o=>Math.round(priceOf(o)*sellPct()*(o.ret===1?0.35:1)*(o.inj?0.8:1));
const repCap=()=>48+SV.rep*0.5;   // Overall massimo dei giocatori disposti a venire, in base alla reputazione
// l'incasso di una partita e' in 26-economia-partita.js (matchMoney): biglietti secondo i tifosi (20-tifosi-umore.js) e la capienza delle Tribune, sponsor, premio vittoria
// stipendi: ogni giocatore costa in base al suo Overall (a stagione); si pagano a ogni partita. Una rosa lunga e forte costa: tenere le riserve giuste e' una scelta
const wageOf=o=>4+Math.pow(Math.max(0,ovrX(o)-40),2)/50;   // prima 2+(Ov-40)²/85: un giocatore costava quasi niente dopo averlo comprato e la cassa cresceva da sola (Ov 50: 6 invece di 3, 70: 22 invece di 13, 85: 45 invece di 26)
// premio della lega a chi sale di categoria (150 per il peso della serie nuova: Serie B circa 195, Serie A circa 250): senza, con gli stipendi veri una neopromossa non aveva di che rinforzarsi
const promoPrize=sr=>Math.round(150*(SR_K[sr]||1));
// stipendi a partita: i 14 stipendi piu' alti per intero, le riserve oltre il quattordicesimo a meta' (un rimborso, non un ingaggio). Le rose da 20 di USA ed
// Europa altrimenti costavano piu' di quanto il campionato incassa, e vendere le riserve era il modo piu' facile di fare soldi
// Oltre il ventesimo (rose vere fino a 28 in Europa) si paga un quarto: sono giocatori che non entrano quasi mai in linea
const WAGE_FULL=14,WAGE_HALF=20;
const wageW=i=>i<WAGE_FULL?1:(i<WAGE_HALF?0.5:0.25);   // quota pagata dello stipendio per posizione (0 = il piu' alto)
const wageSeason=list=>{const v=list.map(o=>wageOf(o)).sort((a,b)=>b-a);return v.reduce((a,w,i)=>a+w*wageW(i),0);};
const wageBill=()=>Math.round(wageSeason(SQ)/15);
const wagePart=p=>SQ.length>WAGE_FULL?wageW(SQ.slice().sort((a,b)=>wageOf(b)-wageOf(a)).indexOf(p)):1;
const wageRes=p=>wagePart(p)<1;   // riserva: oltre i 14 stipendi piu' alti
// La spesa sale con il livello. L'impianto ha una voce a parte: gli affitti sono già al netto della sua gestione.
const FAC_MAX=5;
const FAC={
  camp:['Centro sportivo','Allenati meglio e limita gli infortuni'],
  viv:['Vivaio e osservatori','Trova più giovani e spendi meno per osservarli'],
  stad:['Tribune','Ospita più tifosi e incassa dagli affitti']
};
// Il valore storico serve agli affitti e ai rimborsi dei vecchi salvataggi.
const FAC_BASE_VALUES=[40,55,75,100,125];
const FAC_PRICES=[45,60,80,105,140];
const facTotalCost=lv=>FAC_BASE_VALUES.slice(0,lv).reduce((sum,cost)=>sum+cost,0);
const facLv=k=>(SV.fac&&SV.fac[k])|0;
const facCost=k=>Object.hasOwn(FAC,k)?FAC_PRICES[facLv(k)]??0:0;
const facRecovery=()=>[0,0,1,1,2,3][facLv('camp')];
const facInjuryK=()=>1-0.08*facLv('camp');
function migrateFacilities(){
  if(!SV.fac)SV.fac={};
  // Livelli e giornate dei premi seguono il ramo già più sviluppato.
  for(const [key,old] of [['camp','fis'],['viv','oss']]){
    for(const data of [SV.fac,SV.facDays,SV.facKeep])if(data&&Object.hasOwn(data,old)){
      data[key]=Math.max(data[key]|0,data[old]|0);
      delete data[old];
    }
  }
  // Si restituisce il costo della Sede alla scala nuova una sola volta.
  if(Object.hasOwn(SV.fac,'sede')){
    SV.cash+=facTotalCost(clamp(facLv('sede'),0,FAC_MAX));
    delete SV.fac.sede;
  }
  for(const data of [SV.facDays,SV.facKeep])if(data){delete data.sede;delete data.stad;}
  if(SV.evt?.id==='guasto')SV.evt=null;
}
function buyFac(k){const c=facCost(k);if(!c||SV.cash<c)return false;SV.cash-=c;SV.fac[k]=(SV.fac[k]|0)+1;news('Struttura migliorata: '+FAC[k][0]+' al livello '+SV.fac[k]+'.');return true;}
/* ---- mercato: giovani promesse, svincolati e giocatori messi in vendita dalle altre squadre. Del potenziale si vede solo un intervallo: gli osservatori lo stringono ---- */
