/* ---- STAFF COME PERSONE ----
   Ogni ruolo dello staff (Allenatore, Preparatore, Analista, Mentore) e' ricoperto da una persona con nome, eta', volto, una caratteristica
   speciale e un livello che cresce con l'esperienza. I numeri non cambiano: tutti gli effetti leggono ancora staffLv(k) (SV.staff[k], 0-3).
   - SV.stp[k] = {n, a, lk, tr, pot, x}: nome, eta', volto, caratteristica (STAFF_TR), livello massimo raggiungibile, stagioni dall'ultima crescita;
   - SV.cand[k] = i tre candidati proposti per il ruolo (si rinnovano a pagamento e a ogni stagione); SV.candN[k] = quante volte sono stati rinnovati;
   - assumere costa in base al livello di partenza; migliorare chi hai gia' (buyStaff) costa come prima, fino al suo massimo (pot);
   - ogni due stagioni nel ruolo chi non ha ancora raggiunto il suo massimo sale di un livello da solo (esperienza);
   - un altro club puo' portarlo via (evento «Offerta per il tuo staff»); a 66 anni va in pensione. Al suo posto subentra un assistente di un livello in meno. */
Object.assign(AL_KIND,{staff:['Staff','#7fd8ff']});
const STAFF_TR={
  mot:{n:'Motivatore',r:'coach',d:'Dopo ogni partita il morale sale di 1 in più'},
  fan:{n:'Beniamino dei tifosi',r:'coach',d:'Ogni vittoria porta un po’ più di tifosi'},
  fis:{n:'Fisioterapista',r:'fit',d:'Gli infortuni durano una partita in meno'},
  rec:{n:'Recupero rapido',r:'fit',d:'Dopo ogni partita la condizione risale di 2 punti in più'},
  str:{n:'Stratega',r:'ana',d:'+0,3 di forma di squadra, oltre al livello'},
  occ:{n:'Occhio clinico',r:'ana',d:'Scopre il potenziale dei tuoi giocatori un anno prima'},
  pap:{n:'Papà della squadra',r:'men',d:'L’affiatamento cresce di più a ogni partita'},
  tal:{n:'Scopritalenti',r:'men',d:'Chi ha fino a 21 anni cresce ancora di più'}
};
const stTrOf=k=>Object.keys(STAFF_TR).filter(t=>STAFF_TR[t].r===k);
const stPerson=k=>(SV&&SV.stp&&SV.stp[k])||null;
const hasTr=(k,id)=>{const s=stPerson(k);return !!(s&&s.tr===id&&staffLv(k)>=1);};   // la caratteristica vale solo se il ruolo e' ricoperto
const STAFF_HIRE=[0,40,130,280],STAFF_RENEW=12,STAFF_RETIRE=66;
const staffMoodKey=()=>SV.mor>=60?'g':(SV.mor>=40?'o':'s');   // l'umore dello staff segue quello dello spogliatoio
function stLook(key,age){const l=makeLook('staff|'+key,false);if(age>=55)l.hair=age>=60?'#a9a9b0':'#4a4a52';return l;}
// una persona: livello e massimo dati, il resto a caso (rng = funzione che da' numeri tra 0 e 1)
function stNew(k,rng,lv,pot,ageMin,ageMax,withTr){
  const a=ageMin+Math.floor(rng()*(ageMax-ageMin+1)),n=NAME_POOL[Math.floor(rng()*NAME_POOL.length)]+' '+SURN[Math.floor(rng()*SURN.length)];
  const trs=stTrOf(k);
  return {n,a,lk:stLook(k+'|'+n+'|'+a,a),tr:withTr&&rng()<0.75?trs[Math.floor(rng()*trs.length)]:'',lv,pot,x:0};
}
// tre candidati per ruolo: un giovane che costa poco e cresce, uno esperto, un veterano subito al massimo (e piu' caro)
function staffCands(k){
  if(!SV.cand)SV.cand={};
  if(!SV.cand[k]){
    const rng=mulberry32(hashStr(`${SV.seed}|cand|${k}|${SV.season}|${(SV.candN&&SV.candN[k])|0}`));
    SV.cand[k]=[stNew(k,rng,1,3,26,35,true),stNew(k,rng,2,rng()<0.5?2:3,36,48,true),stNew(k,rng,3,3,50,62,true)];
  }
  return SV.cand[k];
}
function staffRenew(k){
  if(SV.cash<STAFF_RENEW)return false;
  SV.cash-=STAFF_RENEW;if(!SV.candN)SV.candN={};SV.candN[k]=(SV.candN[k]|0)+1;if(SV.cand)delete SV.cand[k];return true;
}
function staffHire(k,i){
  const c=staffCands(k)[i];if(!c)return '';
  const cost=STAFF_HIRE[c.lv];if(SV.cash<cost)return '';
  const old=stPerson(k);
  SV.cash-=cost;if(!SV.stp)SV.stp={};if(!SV.staff)SV.staff={};
  SV.staff[k]=c.lv;SV.stp[k]={n:c.n,a:c.a,lk:c.lk,tr:c.tr,pot:c.pot,x:0};
  if(SV.cand)delete SV.cand[k];
  const txt=`${c.n} è il nuovo ${STAFF[k].n.toLowerCase()} (livello ${c.lv})${old?`: ${old.n} lascia il club`:''}.`;
  news('Staff: '+txt);return txt;
}
// migliorare chi hai gia' (prima «Migliora»): stesso costo di sempre, ma solo fino al massimo della persona
function buyStaff(k){
  const s=stPerson(k),c=staffCost(k);
  if(!s||staffLv(k)<1||staffLv(k)>=Math.min(STAFF_MAX,s.pot)||SV.cash<c)return false;
  SV.cash-=c;SV.staff[k]=staffLv(k)+1;s.x=0;news(`Staff: ${s.n} sale al livello ${SV.staff[k]}.`);return true;
}
// chi se ne va (altro club, pensione): al suo posto un assistente di un livello in meno, se ne resta almeno uno
function staffLeave(k){
  const s=stPerson(k),lv=staffLv(k),nl=Math.max(0,lv-1);
  if(SV.stp)delete SV.stp[k];SV.staff[k]=nl;if(SV.cand)delete SV.cand[k];
  let txt=`${s?s.n:STAFF[k].n} lascia il club`;
  if(nl>=1){const p=stNew(k,Math.random,nl,Math.min(STAFF_MAX,nl+1),30,45,false);SV.stp[k]=p;txt+=`: lo sostituisce ${p.n}, livello ${nl}`;}
  return txt+'.';
}
// a ogni nuova stagione: un anno di piu', esperienza, qualcuno va in pensione, i candidati si rinnovano
function staffYear(){
  for(const k of Object.keys(STAFF)){
    const s=stPerson(k);if(!s||staffLv(k)<1)continue;
    s.a++;s.x++;
    if(s.a>=STAFF_RETIRE){alertAdd('staff',`${s.n} (${STAFF[k].n.toLowerCase()}) va in pensione. ${staffLeave(k)}`);continue;}
    if(s.x>=2&&staffLv(k)<Math.min(STAFF_MAX,s.pot)){SV.staff[k]=staffLv(k)+1;s.x=0;alertAdd('staff',`${s.n} ha preso esperienza: ${STAFF[k].n.toLowerCase()} al livello ${SV.staff[k]}.`);}
  }
  SV.cand={};
}
// salvataggi di prima: chi aveva gia' un livello ottiene una persona (sempre la stessa, ricavata dalla carriera) con il livello gia' pagato
function staffInit(){
  if(!SV.stp)SV.stp={};if(!SV.cand)SV.cand={};if(!SV.candN)SV.candN={};
  for(const k of Object.keys(STAFF)){
    const lv=staffLv(k);
    if(lv<1){delete SV.stp[k];continue;}
    if(!SV.stp[k]){const p=stNew(k,mulberry32(hashStr(`${SV.seed}|stp|${k}`)),lv,STAFF_MAX,34,52,true);SV.stp[k]=p;}
    else if(SV.stp[k].pot<lv)SV.stp[k].pot=lv;
  }
}
