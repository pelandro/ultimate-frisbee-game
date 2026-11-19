/* ---- STAFF DELLA CARRIERA ---- */
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
const STAFF_RENEW=12;
const legacyStaffRate=k=>SV.staffLegacy?.[k]||0;
const staffPrepaid=k=>stPerson(k)?.hiredIn===SV.season;
const staffAnnual=(k,level)=>STAFF_WAGE[level??staffLv(k)];
const staffPart=(year,game,total)=>total>0&&game<total?
  Math.floor(year*(game+1)/total)-Math.floor(year*game/total):0;
function staffWage(){
  if(!regularPhase())return 0;
  const total=regularGames(),game=SV.sgp|0;
  let wage=0;
  for(const k of Object.keys(STAFF)){
    if(!staffPrepaid(k))wage+=legacyStaffRate(k)||staffPart(staffAnnual(k),game,total);
  }
  return wage;
}
function staffRemaining(k,left=regularGames()-(SV.sgp|0)){
  if(left<=0||staffPrepaid(k))return 0;
  const old=legacyStaffRate(k),year=staffAnnual(k),total=regularGames();
  return old?old*left:total?year-Math.floor(year*Math.min(total,SV.sgp|0)/total):0;
}
const staffSeasonWage=()=>Object.keys(STAFF).reduce((sum,k)=>sum+staffAnnual(k),0);
function staffContract(k,level){
  SV.staff[k]=level;
  if(SV.staffLegacy)delete SV.staffLegacy[k];
}
function staffLeave(k){
  if(!Object.hasOwn(STAFF,k)||!staffLv(k))return false;
  const person=stPerson(k);
  staffContract(k,0);
  delete SV.stp[k];
  if(person)news('Staff: '+person.n+' lascia il club.');
  return true;
}
const staffMoodKey=()=>SV.mor>=60?'g':(SV.mor>=40?'o':'s');   // l'umore dello staff segue quello dello spogliatoio
function stLook(key,age){const l=makeLook('staff|'+key,false);if(age>=55)l.hair=age>=60?'#a9a9b0':'#4a4a52';return l;}
// Il livello del candidato dipende dal profilo; nome e specialità sono generati.
function stNew(k,rng,lv,ageMin,ageMax,withTr){
  const a=ageMin+Math.floor(rng()*(ageMax-ageMin+1)),n=NAME_POOL[Math.floor(rng()*NAME_POOL.length)]+' '+SURN[Math.floor(rng()*SURN.length)];
  const trs=stTrOf(k);
  return {n,a,lk:stLook(k+'|'+n+'|'+a,a),tr:withTr&&trs.length&&rng()<0.75?trs[Math.floor(rng()*trs.length)]:'',lv};
}
// Tre candidati, uno per livello.
function staffCands(k){
  if(!SV.cand)SV.cand={};
  if(!SV.cand[k]){
    const rng=mulberry32(hashStr(`${SV.seed}|cand|${k}|${SV.season}|${(SV.candN&&SV.candN[k])|0}`));
    SV.cand[k]=[stNew(k,rng,1,26,35,true),stNew(k,rng,2,36,48,true),stNew(k,rng,3,50,62,true)];
  }
  return SV.cand[k];
}
function staffRenew(k){
  if(!Object.hasOwn(STAFF,k)||SV.cash<STAFF_RENEW)return false;
  SV.cash-=STAFF_RENEW;if(!SV.candN)SV.candN={};SV.candN[k]=(SV.candN[k]|0)+1;if(SV.cand)delete SV.cand[k];return true;
}
// La firma dei profili più esperti costa di più, senza cambiare lo stipendio.
const staffHireCost=(k,lv)=>Math.ceil(staffAnnual(k,lv)*(1+lv/10));
function staffHire(k,i){
  if(!Object.hasOwn(STAFF,k))return '';
  const c=staffCands(k)[i];if(!c)return '';
  const cost=staffHireCost(k,c.lv);if(SV.cash<cost)return '';
  const old=stPerson(k);
  SV.cash-=cost;if(!SV.stp)SV.stp={};if(!SV.staff)SV.staff={};
  staffContract(k,c.lv);SV.stp[k]={n:c.n,a:c.a,lk:c.lk,tr:c.tr,hiredIn:SV.season};
  if(SV.cand)delete SV.cand[k];
  const txt=`${c.n} è il nuovo ${STAFF[k].n.toLowerCase()} (livello ${c.lv})${old?`: ${old.n} lascia il club`:''}.`;
  news('Staff: '+txt);return txt;
}
function staffYear(){
  delete SV.staffLegacy;
  delete SV.staffMail;
  for(const k of Object.keys(STAFF)){
    const person=stPerson(k);
    if(person)person.a++;
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
  if(SV.evt?.id==='staff')SV.evt=null;
  for(const k of Object.keys(STAFF)){
    const lv=staffLv(k);
    if(lv<1){delete SV.stp[k];continue;}
    if(!SV.stp[k]){const p=stNew(k,mulberry32(hashStr(`${SV.seed}|stp|${k}`)),lv,34,52,true);SV.stp[k]=p;}
    else{
      delete SV.stp[k].pot;
      delete SV.stp[k].x;
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
