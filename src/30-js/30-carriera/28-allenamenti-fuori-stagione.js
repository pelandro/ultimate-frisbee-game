/* ---- Preparazione estiva: le date libere dopo l'eliminazione diventano sedute. ---- */
const SEASON_MIN=11;
const sessFor=m=>Math.ceil(Math.max(0,m)/carDiff().n);   // una seduta prima del debutto, poi una ogni n partite
const offGroupBye=N=>!!N?.ord?.some(pool=>pool[0]===SV.team);

function euGamesPlayed(){
  if(SV.seu!==undefined)return SV.seu;
  // Le edizioni già salvate conservano i risultati, anche senza il contatore.
  const N=SV.eu?.nat;
  if(!N)return 0;
  const p=t16Pool(N,SV.team);
  if(p<0)return 0;
  const tab=N.tabs[p][SV.team];
  return tab.w+tab.l+N.ko.flat().filter(m=>m[4]&&m.slice(0,2).includes(SV.team)).length;
}
function offTrainSessions(){
  if(SV.sgp===undefined)return 0;
  let finals;
  if(isUS()){
    const U=SV.us,pin=U.pin?.[U.cf];
    const direct=U.fin?.[U.cf]?.slice(0,pin?.d||0).includes(SV.team);
    finals=T16_MAX_GAMES-Number(offGroupBye(U.nat))+Number(!!pin?.m?.length&&!direct);
  }else if(isLN()){
    const fin=lnTierDef().fin;
    const promotedDirectly=fin[0]?.f>1&&SV.next?.rank===1;
    finals=promotedDirectly?0:lnFinBuild(fin,lnComp().pools).rounds;
  }else{
    const promotedDirectly=SV.sr!=='A'&&SV.next?.rank===1;
    finals=!promotedDirectly&&poZone(SV.sr,{[SV.sr]:SV.mem[SV.sr]})?2:0;
  }
  const domestic=Math.max(SEASON_MIN,regularGames()+finals);
  const europe=euTier()?T16_MAX_GAMES-Number(offGroupBye(SV.eu?.nat)):0;
  const missed=Math.max(0,domestic-SV.sgp)+Math.max(0,europe-euGamesPlayed());
  const played=SV.played||0;
  return sessFor(played+missed)-sessFor(played);
}
function seasonReady(){
  // Lo stop estivo chiude infortuni e assenze. Il numero di infortuni seri resta nello storico.
  for(const p of SQ){
    p.inj=0;p.injNew=false;p.injBig=0;p.abs=0;p.cond=100;p.tr=false;
  }
  for(const roster of Object.values(SV.rost))for(const p of roster){p.inj=0;p.cond=100;}
  SV.tTeam=false;
}
function offTrain(sessions){
  const intensity=trInt().g;
  const random=mulberry32(hashStr(SV.seed+'|preparazione|'+SV.season));
  for(let s=0;s<sessions;s++){
    const teamOption=CATS.map(c=>[c,SQ.reduce((sum,p)=>sum+trainExpect(p,c,trainMul(p)*intensity),0)])
      .sort((a,b)=>b[1]-a[1])[0][0];
    for(const p of SQ)trainCategory(p,teamOption,trainMul(p)*intensity,random);
    if(teamOption.id==='tat')SV.chem=clamp(SV.chem+3,0,100);
    const individual=SQ.map(p=>{
      const mul=trainMul(p,true)*1.5*intensity;
      const [opt,gain]=CATS.map(c=>[c,trainExpect(p,c,mul)]).sort((a,b)=>b[1]-a[1])[0];
      return {p,opt,gain,mul};
    }).sort((a,b)=>b.gain-a.gain).slice(0,3);
    for(const {p,opt,mul} of individual)trainCategory(p,opt,mul,random);
  }
}
function offTrainMail(before,sessions){
  const top=SQ.filter(p=>before.has(p.full)).map(p=>{
    const previous=before.get(p.full);
    return {p,value:ovr(p),gain:ovr(p)-Math.round(previous),raw:ovrX(p)-previous};
  }).filter(x=>x.gain>0).sort((a,b)=>b.gain-a.gain||b.raw-a.raw||b.value-a.value).slice(0,3);
  const intro=sessions?'Preparazione estiva: '+sessions+(sessions===1?' seduta':' sedute')+' nelle giornate senza partita.':'Preparazione estiva.';
  const gains=top.length?' I maggiori progressi: '+top.map(x=>pname(x.p)+' (Overall '+x.value+', +'+x.gain+')').join(', ')+'.'
    :' Nessun Overall è salito di un punto intero.';
  alertAdd('up',intro+gains);
}
