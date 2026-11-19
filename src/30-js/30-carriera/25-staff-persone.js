/* ---- STAFF COME PERSONE ----
   Il livello in SV.staff è quello del contratto. L'esperienza permette di salire senza pagare il corso,
   ma il club decide quando firmare allo stipendio superiore. */
Object.assign(AL_KIND,{staff:['Staff','#7fd8ff']});
const STAFF_TR={
  young:{n:'Sviluppo giovani',r:'fit',d:'Gli under 22 crescono di più in allenamento'},
  res:{n:'Resistenza',r:'fit',d:'I giocatori perdono meno condizione in allenamento'},
  fis:{n:'Riabilitazione',r:'fis',d:'Accorcia gli stop più lunghi'},
  rec:{n:'Recupero rapido',r:'fis',d:'I giocatori recuperano più condizione tra le partite'}
};
const stTrOf=k=>Object.keys(STAFF_TR).filter(t=>STAFF_TR[t].r===k);
const stPerson=k=>(SV&&SV.stp&&SV.stp[k])||null;
const hasTr=(k,id)=>{const s=stPerson(k);return !!(s&&s.tr===id&&staffLv(k)>=1);};   // la caratteristica vale solo se il ruolo e' ricoperto
const STAFF_HIRE=[0,40,130,280],STAFF_RENEW=12,STAFF_RETIRE=66;
const staffCanCut=()=>!(SV.sgp|0)&&!SV.done;
const legacyStaffRate=k=>SV.staffLegacy?.[k]||0;
const staffAnnual=(k,level)=>STAFF_WAGE[level??staffLv(k)];
const staffPart=(year,game,total)=>total>0&&game<total?
  Math.floor(year*(game+1)/total)-Math.floor(year*game/total):0;
function staffWage(){
  const regular=regularPhase(),total=regular?regularGames():0,game=SV.sgp|0;
  return Object.keys(STAFF).reduce((sum,k)=>sum+(legacyStaffRate(k)||staffPart(staffAnnual(k),game,total)),0);
}
function staffRemaining(k,level,left=regularGames()-(SV.sgp|0)){
  if(left<=0)return 0;
  const old=level===undefined?legacyStaffRate(k):0,year=staffAnnual(k,level),total=regularGames();
  return old?old*left:total?year-Math.floor(year*Math.min(total,SV.sgp|0)/total):0;
}
const staffSeasonWage=()=>Object.keys(STAFF).reduce((sum,k)=>sum+staffAnnual(k),0);
const staffCanHire=(k,level)=>Object.hasOwn(STAFF,k)&&(level>=staffLv(k)||staffCanCut());
function staffContract(k,level){
  SV.staff[k]=level;
  if(SV.staffLegacy)delete SV.staffLegacy[k];
}
function staffCut(k){
  if(!staffCanCut()||!Object.hasOwn(STAFF,k)||!staffLv(k))return false;
  staffContract(k,staffLv(k)-1);
  if(!staffLv(k))delete SV.stp[k];
  return true;
}
const staffMoodKey=()=>SV.mor>=60?'g':(SV.mor>=40?'o':'s');   // l'umore dello staff segue quello dello spogliatoio
function stLook(key,age){const l=makeLook('staff|'+key,false);if(age>=55)l.hair=age>=60?'#a9a9b0':'#4a4a52';return l;}
// una persona: livello e massimo dati, il resto a caso (rng = funzione che da' numeri tra 0 e 1)
function stNew(k,rng,lv,pot,ageMin,ageMax,withTr){
  const a=ageMin+Math.floor(rng()*(ageMax-ageMin+1)),n=NAME_POOL[Math.floor(rng()*NAME_POOL.length)]+' '+SURN[Math.floor(rng()*SURN.length)];
  const trs=stTrOf(k);
  return {n,a,lk:stLook(k+'|'+n+'|'+a,a),tr:withTr&&trs.length&&rng()<0.75?trs[Math.floor(rng()*trs.length)]:'',lv,pot,x:0};
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
  if(!Object.hasOwn(STAFF,k)||SV.cash<STAFF_RENEW)return false;
  SV.cash-=STAFF_RENEW;if(!SV.candN)SV.candN={};SV.candN[k]=(SV.candN[k]|0)+1;if(SV.cand)delete SV.cand[k];return true;
}
function staffHire(k,i){
  if(!Object.hasOwn(STAFF,k))return '';
  const c=staffCands(k)[i];if(!c)return '';
  const cost=STAFF_HIRE[c.lv];if(SV.cash<cost||!staffCanHire(k,c.lv))return '';
  const old=stPerson(k);
  SV.cash-=cost;if(!SV.stp)SV.stp={};if(!SV.staff)SV.staff={};
  staffContract(k,c.lv);SV.stp[k]={n:c.n,a:c.a,lk:c.lk,tr:c.tr,pot:c.pot,x:0};
  if(SV.cand)delete SV.cand[k];
  const txt=`${c.n} è il nuovo ${STAFF[k].n.toLowerCase()} (livello ${c.lv})${old?`: ${old.n} lascia il club`:''}.`;
  news('Staff: '+txt);return txt;
}
// migliorare chi hai gia' (prima «Migliora»): stesso costo di sempre, ma solo fino al massimo della persona
function buyStaff(k){
  const s=stPerson(k),c=staffCost(k);
  if(!s||staffLv(k)<1||staffLv(k)>=Math.min(STAFF_MAX,s.pot)||SV.cash<c)return false;
  SV.cash-=c;staffContract(k,staffLv(k)+1);s.x=0;news(`Staff: ${s.n} sale al livello ${SV.staff[k]}.`);return true;
}
// chi se ne va (altro club, pensione): al suo posto un assistente di un livello in meno, se ne resta almeno uno
function staffLeave(k){
  const s=stPerson(k),lv=staffLv(k),nl=Math.max(0,lv-1),legacy=legacyStaffRate(k);
  if(SV.stp)delete SV.stp[k];staffContract(k,nl);if(SV.cand)delete SV.cand[k];
  if(legacy&&nl)SV.staffLegacy[k]=Math.min(legacy,nl);
  let txt=`${s?s.n:STAFF[k].n} lascia il club`;
  if(nl>=1){const p=stNew(k,Math.random,nl,Math.min(STAFF_MAX,nl+1),30,45,false);SV.stp[k]=p;txt+=`: lo sostituisce ${p.n}, livello ${nl}`;}
  return txt+'.';
}
// a ogni nuova stagione: un anno di piu', esperienza, qualcuno va in pensione, i candidati si rinnovano
function staffYear(){
  delete SV.staffLegacy;
  delete SV.staffMail;
  for(const k of Object.keys(STAFF)){
    const s=stPerson(k);if(!s||staffLv(k)<1)continue;
    s.a++;s.x=(s.x|0)+1;
    if(s.a>=STAFF_RETIRE){alertAdd('staff',`${s.n} (${STAFF[k].n.toLowerCase()}) va in pensione. ${staffLeave(k)}`);continue;}
    if(s.x===2&&staffLv(k)<Math.min(STAFF_MAX,s.pot))alertAdd('staff',`${s.n} può salire di livello. Apri Staff per vedere il nuovo stipendio.`);
  }
  SV.cand={};
}
// salvataggi di prima: chi aveva gia' un livello ottiene una persona (sempre la stessa, ricavata dalla carriera) con il livello gia' pagato
function staffInit(){
  if(!SV.stp)SV.stp={};if(!SV.cand)SV.cand={};if(!SV.candN)SV.candN={};
  // Il vecchio preparatore curava il recupero. Il suo contratto segue il ruolo di fisioterapista.
  if(!SV.staffV){
    if(!staffLv('fis')&&staffLv('fit')){
      SV.staff.fis=SV.staff.fit;SV.stp.fis=SV.stp.fit;
      delete SV.staff.fit;delete SV.stp.fit;
    }
    const k=staffLv('coach')>=staffLv('men')?'coach':'men';
    if(!staffLv('fit')&&staffLv(k)){
      SV.staff.fit=SV.staff[k];SV.stp.fit=SV.stp[k];
      if(SV.stp.fit)SV.stp.fit.tr=SV.stp.fit.tr==='tal'?'young':'';
    }
    for(const old of ['coach','men']){delete SV.staff[old];delete SV.stp[old];}
    if(SV.round>0||(SV.sgp|0)>0){
      SV.staffLegacy=Object.fromEntries(Object.keys(STAFF).filter(k=>staffLv(k)).map(k=>[k,staffLv(k)]));
    }
    SV.cand={};SV.candN={};SV.staffV=1;
  }
  for(const k of Object.keys(STAFF)){
    const lv=staffLv(k);
    if(lv<1){delete SV.stp[k];continue;}
    if(!SV.stp[k]){const p=stNew(k,mulberry32(hashStr(`${SV.seed}|stp|${k}`)),lv,STAFF_MAX,34,52,true);SV.stp[k]=p;}
    else{
      if(SV.stp[k].pot<lv)SV.stp[k].pot=lv;
      if(STAFF_TR[SV.stp[k].tr]?.r!==k)SV.stp[k].tr='';
    }
  }
}
// Le simulate usano la stessa scelta di schemi della carriera. Un abbinamento favorevole
// vale solo una piccola parte della forza, perché la rivale alterna gli schemi durante la partita.
function tacticPlan(m){
  const id=m.roster?.length?teamIdentity(m.name,bestSeven(m.roster)):ID0;
  const oppA=id.deep>0.3?'vert':id.deep<-0.3?'hex':'horz';
  const oppD=id.poach>0.75?'man_poach':id.pat>0.3?'zone':id.press>0.55?'man_in':'man_out';
  const attack=o=>SCH_EFF[o.id][oppD],defend=o=>-SCH_EFF[oppA][o.id];
  const pick=(list,score,lv)=>careerSchemes(list,lv).reduce((a,b)=>score(b)>score(a)?b:a);
  const att=pick(ATTS,attack),def=pick(DEFS,defend);
  const gain=attack(att)-attack(pick(ATTS,attack,0))+defend(def)-defend(pick(DEFS,defend,0));
  return {att,def,oppD,edge:Math.min(0.65,gain*0.027)};
}
function staffScoutMail(m){
  if(staffLv('ana')!==STAFF_MAX||SV.fired||!m||m.name!==SV.riv)return false;
  const key=[SV.season,SV.event,m.label,m.name].join('|');
  const sent=SV.staffMail||(SV.staffMail=[]);
  if(sent.includes(key))return false;
  const {att,def,oppD}=tacticPlan(m);
  sent.push(key);
  alertAdd('staff',`Contro ${m.name} prova ${att.name} se partono con «${DEF_NAME[oppD]}». In difesa, parti con «${def.name}».`,{quiet:true});
  return true;
}
