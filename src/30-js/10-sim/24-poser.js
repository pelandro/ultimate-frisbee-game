/* ---- TRATTO POSER ----
   Il Poser rende di piu' quanto piu' a lungo tiene il disco sotto marcatura: finche' ha il disco in mano e lo stall sale, TUTTE le sue statistiche
   crescono di POSER_PT punti per ogni secondo di stall (fino a POSER_MAX); appena lancia o il disco cambia mano tornano quelle di prima.
   Funziona sostituendo p.s con una copia maggiorata: l'originale resta in p.pzb e non si modifica mai (non c'e' niente da «disfare» sul salvataggio).
   poserTick() gira a ogni fotogramma di gioco; poserReset() a ogni punto, a ogni nuova partita e a fine partita (restoreForm). I giocatori con
   la sostituzione attiva stanno in G.pz. A stall 10 il disco e' perso come per chiunque. */
const POSER_PT=1,POSER_MAX=9;   // +1 a ogni statistica per secondo di stall, al massimo +9; il lancio perde 2,2 per ogni secondo oltre il sesto (throwInfo), quindi il guadagno netto e' massimo verso lo stall 5-6 e poi scende: aspettare ancora rende meno e rischia il turnover
const poserBoost=p=>hasT(p,'poser')&&G.holder===p&&!G.flight?clamp(G.stallT*POSER_PT,0,POSER_MAX):0;
function poserTick(){
  const h=G.holder,b=h?poserBoost(h):0,on=G.pz||(G.pz=[]);
  for(let i=on.length-1;i>=0;i--){const p=on[i];if(p!==h||b<=0){p.s=p.pzb;p.pzb=null;on.splice(i,1);}}   // chi non ha piu' il disco (o lo stall e' a zero) torna com'era
  if(h&&b>0){
    if(!h.pzb){h.pzb=h.s;h.s=Object.assign({},h.pzb);on.push(h);}
    for(const k of KEYS)h.s[k]=Math.min(99,h.pzb[k]+b);
  }
}
function poserReset(){
  const on=G.pz;if(on)for(const p of on)if(p.pzb){p.s=p.pzb;p.pzb=null;}
  G.pz=[];
}
