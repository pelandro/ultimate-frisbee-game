/* ===================== LEGHE EUROPEE: CARRIERA =====================
   Avvio, obiettivi della dirigenza, reputazione e offerte per le carriere in Belgio, Francia, Germania e Regno Unito. Per il resto (rosa, mercato, allenamenti, economia,
   staff, progressione) la carriera usa le stesse funzioni di quella italiana e di quella USA. Le regole della stagione stanno in 03-stagione-lega.js. */
function lnStartCareer(name,opt){
  const B=LN_BY[name],lk=B.lk,help=!!SV.help,slot=SV.slot||1,s0=opt.season||1;
  SV={v:SAVE_V,team:name,seed:Math.floor(Math.random()*1e9),sr:lnKey(lk,B.t),lk,season:s0,event:'camp',eu:newEu(s0),help,mem:{},realAB:1,rv:3,realv:2,realAI:1,slot};
  SV.coach=coachNorm(opt.coach);SV.start='cuore';
  SV.ln={tier:B.t,T:null};
  SV.rost={};for(const n of LN_NAMES)if(LN_BY[n].lk===lk&&n!==name)SV.rost[n]=lnRoster(n,SV.seed);
  setSquad(lnRoster(name,SV.seed+'|user'));   // la tua rosa: quella del club, come per le avversarie
  beginSeason();
  Object.assign(SV,opt.carry||{});
  careerInit();
  news(`Inizia la carriera con ${name} in ${SERIES_NAME[SV.sr]}. In panchina: ${coachName()}.`);
  if(!opt.deferSave)persist();
}
// reputazione di partenza: i club piu' forti del paese partono con piu' reputazione (da 21 a 60)
const lnRepStart=()=>{const all=LN_NAMES.filter(n=>LN_BY[n].lk===SV.lk).sort((a,b)=>LN_BY[b].p-LN_BY[a].p),i=all.indexOf(SV.team);return Math.round(20+(1-i/Math.max(1,all.length-1))*40);};
// obiettivo della dirigenza: secondo il livello del club nella sua competizione e le posizioni che contano (titolo, EUCF, promozione, salvezza)
function lnObjective(){
  const comp=lnComp(),n=comp.clubs.length,ord=comp.clubs.slice().sort((a,b)=>lnP(b)-lnP(a)),exp=ord.indexOf(SV.team)+1,tiers=lnTiers(),ti=tiers.findIndex(t=>t.id===SV.ln.tier),top=ti===0;
  const mv=LN_DEF[SV.lk].mv,down=ti<tiers.length-1?mv[ti]:0,up=ti>0?mv[ti-1]:0,eu=LN_DEF[SV.lk].eu;
  let tgt,txt;
  if(top&&exp<=2){tgt=1;txt=`Titolo ${LN_DEF[SV.lk].de}`;}
  else if(top&&exp<=eu+2){tgt=eu;txt=`Posto all’EUCF (prime ${eu})`;}
  else if(!top&&exp<=up+1){tgt=up;txt=`Promozione (prime ${up})`;}
  else if(exp<=Math.ceil(n/2)){tgt=Math.ceil(n/2);txt=`Prime ${tgt} in classifica`;}
  else{tgt=Math.max(1,n-(down||1));txt=down?`Salvezza (non tra le ultime ${down})`:'Non chiudere ultimi';}
  SV.obj={tgt,txt,exp,reward:Math.round((36+(n-tgt)*4)*SR_K[SV.sr])};
}
const lnObjNow=()=>SV.ln.ph==='grp'?(SV.round>0?` · ora ${myRank()}ª nel girone`:''):' · fase finale';
// offerte per i tuoi giocatori: dai club piu' forti della stessa lega
function lnOfferTeams(){
  const me=LN_BY[SV.team].p;
  const up=LN_NAMES.filter(n=>LN_BY[n].lk===SV.lk&&n!==SV.team&&LN_BY[n].p>me&&SV.rost[n]&&SV.rost[n].length<22);
  return up.length?up:LN_NAMES.filter(n=>LN_BY[n].lk===SV.lk&&n!==SV.team&&SV.rost[n]&&SV.rost[n].length<22);
}
ACH.push(['ln','Campione nazionale','Vinci il campionato di un paese europeo',1,100,()=>lnTitles()]);
const lnTitles=()=>{const t=SV&&SV.troph?SV.troph:{};return LN_IDS.reduce((a,lk)=>a+(t[lnKey(lk,LN_DEF[lk].tiers[0].id)]|0),0);};
