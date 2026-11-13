/* ===================== USA MEN'S CLUB: CARRIERA =====================
   Avvio, obiettivi della dirigenza, fine stagione e offerte per la carriera USA. Per il resto (rosa, mercato, allenamenti, economia, staff, progressione)
   la carriera USA usa le stesse funzioni di quella italiana. */
const US_PRIZE=[3,6,10,15,20,27,35,48];   // premio di fine stagione (crediti, prima di SR_K.U) secondo il punto piu' lontano raggiunto (US_STAGE)
function usStartCareer(name,opt){
  const help=!!SV.help,slot=SV.slot||1,s0=opt.season||1;
  SV={v:SAVE_V,team:name,seed:Math.floor(Math.random()*1e9),sr:'U',lk:'US',season:s0,event:'camp',eu:newEu(s0),help,mem:{},realAB:1,rv:3,realv:2,realAI:1,slot};
  SV.coach=coachNorm(opt.coach);SV.start='cuore';
  usInit(name);
  SV.rost={};for(const n of US_NAMES)if(n!==name)SV.rost[n]=usRoster(n,SV.seed);
  setSquad(usRoster(name,SV.seed+'|user',{low:true}));   // la tua rosa: quella del club, un po' meno allenata delle avversarie
  beginSeason();
  Object.assign(SV,opt.carry||{});   // se arrivi dall'Italia: allenatore, storico e traguardi restano tuoi
  careerInit();
  news(`Inizia la carriera con ${name} nella ${usConfName(SV.us.cf)} dei Men’s Club USA. In panchina: ${coachName()}.`);
  persist();
}
const usRepStart=()=>Math.round(20+(33-US_TEAM[SV.team].rank)/31*40);   // i club piu' prestigiosi partono con piu' reputazione (da 21 a 60)
// ---- obiettivi della dirigenza: secondo il livello del club tra i 32 ----
const US_OBJ=[
  {id:'pin',lvl:1,txt:'Qualificarsi ai Play-in: chiudere tra le prime 6 della Conference',tgt:6,rw:30},
  {id:'nat',lvl:2,txt:'Raggiungere i Nationals',tgt:4,rw:44},
  {id:'sf',lvl:5,txt:'Arrivare alle semifinali dei Nationals',tgt:2,rw:62},
  {id:'tit',lvl:7,txt:'Vincere il titolo nazionale',tgt:1,rw:90}
];
function usObjective(){
  const ord=US_NAMES.slice().sort((a,b)=>teamPow(b)-teamPow(a)),exp=ord.indexOf(SV.team)+1,o=US_OBJ[exp<=4?3:(exp<=10?2:(exp<=20?1:0))];
  SV.obj={id:o.id,lvl:o.lvl,tgt:o.tgt,txt:o.txt,exp,reward:Math.round(o.rw*SR_K.U/1.65)};
}
const usObjOk=()=>!!(SV.obj&&(SV.us.stage|0)>=SV.obj.lvl);
// ---- fine stagione (chiamata da endSeason quando i Nationals sono finiti) ----
function usEndSeason(){
  const U=SV.us,rank=ranking(SV.tab,SV.mem.U).indexOf(SV.team)+1,st=U.stage|0,champ=U.nat&&U.nat.champ?U.nat.champ:null,tit=champ===SV.team;
  chalEval();   // la sfida della dirigenza si giudica prima dei premi
  let short;
  if(tit)short='Siete campioni degli Stati Uniti!';
  else if(st===0)short=`Fuori dai Play-in (${rank}° nella ${usConfName(U.cf)}).`;
  else short=({1:'Eliminati ai Play-in.',2:'Eliminati nel girone dei Nationals.',3:'Eliminati ai prequarti dei Nationals.',4:'Eliminati ai quarti dei Nationals.',5:'Eliminati in semifinale ai Nationals.',6:'Finale dei Nationals persa.'})[st];
  const prize=Math.round(US_PRIZE[st]*SR_K.U),ok=usObjOk();SV.cash+=prize;
  if(SV.obj){if(ok){SV.cash+=SV.obj.reward;SV.rep=clamp(SV.rep+3+Math.min(4,Math.max(0,st-SV.obj.lvl)),0,100);}else SV.rep=clamp(SV.rep-4,0,100);}
  if(tit)SV.rep=clamp(SV.rep+6,0,100);
  SV.fans=clamp(fansOf()+[-3,-1,0,1,2,3,4,6][st],0,100);
  SV.done=true;SV.po=null;SV.poRes=null;
  SV.next={mem:SV.mem,sr:'U',rank,short,qual:false,tit,champs:{U:champ},po:null,prize,objOk:!!ok,us:{stage:st,champ,conf:U.cf,pos:usPos(SV.team)}};
  if(champ&&U.nat){const fin=U.nat.ko[3]&&U.nat.ko[3][0];if(fin)SV.usAlb=[{s:SV.season,champ,run:fin[0]===champ?fin[1]:fin[0],sc:[Math.max(fin[2],fin[3]),Math.min(fin[2],fin[3])]}].concat(SV.usAlb||[]).slice(0,60);}
  seasonEndDyn(rank);   // sfida della dirigenza e obiettivi personali
  seasonAwards(rank,null);
  if(SV.hist[0]&&SV.hist[0].season===SV.season)SV.hist[0].us={stage:st,champ,conf:U.cf,pos:usPos(SV.team)};
  achCheck();
  news(`Stagione ${SV.season} conclusa: ${short} Premio di ${prize} crediti`+(SV.obj?(ok?`, obiettivo raggiunto (+${SV.obj.reward})`:', obiettivo mancato'):'')+'.');
}
// ---- offerte per i tuoi giocatori: dai club della stessa lega piu' forti del tuo ----
function usOfferTeams(){
  const me=US_TEAM[SV.team].rank;
  const up=US_NAMES.filter(n=>n!==SV.team&&US_TEAM[n].rank<me&&SV.rost[n]&&SV.rost[n].length<22);
  return up.length?up:US_NAMES.filter(n=>n!==SV.team&&SV.rost[n]&&SV.rost[n].length<22);
}
ACH.push(['usa','Campioni d’America','Vinci i Nationals USA',1,100,()=>SV.troph.U|0]);
// fase che ci si aspetta di raggiungere con la posizione di adesso (stima per il bilancio previsionale): 1ª-2ª Nationals, 3ª-6ª Play-in, poi fuori
const usExpectStage=rank=>rank<=2?3:(rank<=6?1:0);
