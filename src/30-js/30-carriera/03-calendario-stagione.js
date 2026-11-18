const REAL={};
(function(){
  const norm=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  for(const sr of ['A','B','C']){
    const ix={};for(const n of SERIES[sr])ix[norm(n.replace(/ \([ABC]\)$/,''))]=n;
    for(const t in REAL_ALL[sr]){const gn=ix[norm(t)];if(gn)REAL[gn]=ovrMergeIT(gn,REAL_ALL[sr][t].map(r=>({sur:r[0],nm:r[1],a:r[2],g:r[3],age:r[4],f:!!r[5]})));}   // Overall, ruolo ed eta' della revisione 2026 (00-ovr-2026.js)
  }
})();
// in A e in B il livello della rosa viene portato alla forza della squadra (che segue la classifica finale 2026); in C dipende solo da assist e mete
const realOpt=(n,min)=>({min,flavor:flavorOf(n),target:TEAM[n]&&TEAM[n].series!=='C'?TEAM[n].power:undefined});
const flavorOf=n=>/U17/.test(n)?'u17':(/U20/.test(n)?'u20':(/NewGen|NextGen|Next Gen|Rookies/.test(n)?'newgen':(/Wise/.test(n)?'wise':'')));
const aiRoster=n=>REAL[n]?realRoster(REAL[n],SV.seed+'|'+n,realOpt(n,7)):makeRoster(TEAM[n].power,SV.seed+'|'+n);
const userRoster=()=>realRoster(REAL[SV.team]||[],'preview|'+SV.team,realOpt(SV.team,9));   // la tua rosa: quella vera, come per le avversarie
// una sola edizione a stagione (s = stagione dell'edizione): prima il torneo concluso si poteva far ripartire all'infinito, accumulando trofei e incassi.
// L'EUCF (gironi da 4, prequarti, quarti, semifinali, finale) sta in 36-europa/01-eucf.js
const newEu=season=>euNew(season);
function roundRobin(n){   // con un numero dispari di squadre ognuna riposa a turno (i riposi non compaiono nelle giornate)
  const m=n%2?n+1:n,arr=[...Array(m).keys()],rounds=[];
  for(let r=0;r<m-1;r++){
    const x=[];for(let i=0;i<m/2;i++){const a=arr[i],b=arr[m-1-i];if(a<n&&b<n)x.push([a,b]);}
    rounds.push(x);arr.splice(1,0,arr.pop());
  }
  return rounds;
}
function freshTab(names){const t={};for(const n of names)t[n]={pts:0,w:0,l:0,pf:0,pa:0};return t;}
function beginSeason(){
  if(isLN())lnPrepSeason();   // leghe europee: promozioni e retrocessioni, gironi, il tuo girone (37-leghe/)
  const names=SV.mem[SV.sr];
  SV.sched=roundRobin(names.length);SV.round=0;SV.tab=isUS()||isLN()?usFreshTab(names):freshTab(names);SV.res=[];SV.done=false;SV.next=null;SV.sgp=0;SV.sellN=0;   // giornate di campionato giocate in questa stagione (28-allenamenti-fuori-stagione.js)
  leagueBegin();   // le altre due serie hanno ora un calendario vero
  if(SV.rost)lsSeasonStart();   // statistiche individuali del girone: la stagione scorsa passa alla carriera, il contatore riparte
  if(SV.rost)SV.expOrd=names.slice().sort((a,b)=>teamPow(b)-teamPow(a));   // gerarchie a inizio stagione: servono al premio per l'allenatore dell'anno
  if(SV.cash!==undefined){setObjective();for(const p of SQ)if(p.car){p.car.yrs=(p.car.yrs|0)+(p.car.ss.mp>0?1:0);p.car.ls=p.car.ss;p.car.ss={mp:0,g:0,a:0,b:0};}}
}
function startCareer(name,opt){   // opt: {coach, relief} (24-allenatore.js)
  opt=opt||{};
  if(US_TEAM[name])return usStartCareer(name,opt);   // campionato USA: 35-usa/
  if(LN_BY[name])return lnStartCareer(name,opt);     // Belgio, Francia, Germania, Regno Unito: 37-leghe/
  const help=!!SV.help,slot=SV.slot||1;   // lo slot in cui nasce la carriera
  SV={v:SAVE_V,team:name,seed:Math.floor(Math.random()*1e9),sr:(TEAM[name]&&TEAM[name].series)||'C',season:opt.season||1,event:'camp',eu:newEu(opt.season||1),help,
      mem:{A:SERIES.A.slice(),B:SERIES.B.slice(),C:SERIES.C.slice()},realAB:1,rv:3,slot};
  SV.coach=coachNorm(opt.coach);SV.start=opt.relief?'sub':'cuore';
  SV.rost={};for(const n in TEAM)if(n!==name)SV.rost[n]=aiRoster(n);
  // la rosa scelta va caricata PRIMA di beginSeason: le gerarchie di inizio stagione (SV.expOrd) leggono la forza della tua squadra,
  // e prima usavano quella della rosa rimasta in memoria (la squadra di prima, o quella iniziale)
  if(REAL[name]){SV.realv=2;setSquad(userRoster());}
  else{startLow();setLineup([0,1,2,3,4,5,6]);}
  beginSeason();
  Object.assign(SV,opt.carry||{});   // se arrivi dal campionato USA: allenatore, storico e traguardi restano tuoi (35-usa/05-lega-incrociata.js)
  careerInit();
  if(opt.relief)reliefStart();else news(`Inizia la carriera con ${name} in ${SERIES_NAME[SV.sr]}. In panchina: ${coachName()}.`);
  if(!opt.deferSave)persist();
}
function careerSaveShape(d){
  if(!d||typeof d.team!=='string'||!d.team||!Number.isInteger(d.season)||d.season<1)return false;
  if(d.v!==undefined&&(!Number.isInteger(d.v)||d.v<1||d.v>SAVE_V))return false;
  if(d.slot!==undefined&&(!Number.isInteger(d.slot)||d.slot<1||d.slot>3))return false;
  const names=d.mem?.[d.sr];
  if(!Array.isArray(names)||!names.includes(d.team)||new Set(names).size!==names.length)return false;
  if(!names.every(n=>typeof n==='string'&&d.tab?.[n]&&['pts','pf','pa'].every(k=>Number.isFinite(d.tab[n][k]))))return false;
  if(!Array.isArray(d.sched)||!d.sched.length||!Number.isInteger(d.round)||d.round<0||d.round>d.sched.length)return false;
  if(!d.sched.every(day=>Array.isArray(day)&&day.every(m=>Array.isArray(m)&&m.length===2
    &&m[0]!==m[1]&&m.every(i=>Number.isInteger(i)&&i>=0&&i<names.length))))return false;
  const player=p=>p&&typeof p==='object'&&p.s&&typeof p.s==='object'&&!Array.isArray(p.s);
  if(d.squad!==undefined&&(!Array.isArray(d.squad)||d.squad.length<7||!d.squad.every(player)))return false;
  return !d.rost||(typeof d.rost==='object'&&Object.values(d.rost).every(r=>Array.isArray(r)&&r.length&&r.every(player)));
}
function loadSave(d0){
  let data=d0;
  if(!data){
    try{data=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');}catch(e){return false;}
  }
  if(!careerSaveShape(data))return false;
  const previous=SV,squad=squadData(),lineup=lineupIds();
  try{
    hydrateCareer(structuredClone(data));
    if(!SV.done&&SV.event==='camp'&&!nextMatch()?.name)throw new Error('Avversaria mancante');
    return true;
  }catch(e){
    restoreCareerState(previous,squad,lineup);
    return false;
  }
}
function careerSaveStatus(failed){
  const el=$('careerSaveStatus');
  el.classList.toggle('hidden',!failed);
}
$('careerSaveStatus').addEventListener('click',()=>persist());

function hydrateCareer(d){
  if(d&&d.team&&d.mem&&d.sched&&d.tab){
    SV=d;if(SV.rost)for(const n in SV.rost)for(const o of SV.rost[n])if(o&&o.s)fillStats(o.s);SV.tTeam=!!SV.tTeam;if(!SV.eu)SV.eu=newEu(SV.season);else if(!SV.eu.nat&&SV.eu.state==='on'&&!SV.eu.rk)SV.eu=Object.assign(newEu(SV.season),{s:SV.eu.s|0});if(!SV.event||(SV.event==='eu'&&!SV.euUnlocked))SV.event='camp';
    const mig=SV.realv===1;   // carriera iniziata con i vecchi roster: la rosa diventa quella ufficiale; gli allenamenti dei giocatori veri restano
    if(Array.isArray(SV.squad)&&SV.squad.length>=7){for(const o of SV.squad)if(o&&o.s)fillStats(o.s);setSquad(SV.squad);}   // versione 3: la rosa e' salvata per intero (acquisti e cessioni compresi)
    else if(SV.realv&&REAL[SV.team])setSquad(userRoster());
    if(!Array.isArray(SV.squad))SQ.forEach((p,i)=>{const x=(SV.players||{})[p.full||p.name];if(!(x&&x.s)){if(!SV.realv)lowStats(p,i);return;}{for(const k of KEYS)if(typeof x.s[k]==='number')p.s[k]=Math.min(x.s[k],capOf(p,k));p.tr=!!x.tr;p.inj=x.inj|0;if(typeof x.age==='number'&&!mig)p.age=x.age;if(typeof x.s.res!=='number'&&ROSTERS[0].list[i])p.s.res=Math.min(Math.round(37+statOrig(ROSTERS[0].list[i],'res')*0.2),capOf(p,'res'));}});
    if(mig){for(const p of SQ)p.age+=Math.max(0,(SV.season|0)-1);SV.realv=2;}   // eta' vere, piu' le stagioni gia' giocate
    else if(!SV.lineO&&Array.isArray(SV.lineup)&&SV.lineup.length===7&&SV.lineup.every(id=>id>=0&&id<SQ.length))setLineup(SV.lineup);
    const f1=SV.rost&&Object.values(SV.rost)[0];
    if(!f1||typeof f1[0].s.res!=='number'){SV.rost={};for(const n in TEAM)if(n!==SV.team)SV.rost[n]=aiRoster(n);SV.realAI=1;}
    // vecchi salvataggi: le avversarie di Serie C diventano reali, la tua rosa resta quella di prima
    if(!SV.realAI&&!SV.realv){for(const n of SERIES.C)if(n!==SV.team&&REAL[n]&&SV.rost[n])SV.rost[n]=aiRoster(n);SV.realAI=1;}
    // salvataggi precedenti: anche le avversarie di Serie A e B prendono i giocatori veri (la tua rosa non cambia)
    if(SV.rv!==3){   // roster ufficiali per tutte le avversarie (nomi ed eta' veri), invecchiati delle stagioni gia' giocate
      SV.rost={};for(const n in TEAM)if(n!==SV.team){const r=aiRoster(n);for(let y=1;y<(SV.season|0);y++)for(const o of r)agePlayer(o,Math.random);SV.rost[n]=r;}
      SV.rv=3;SV.realAB=1;SV.realAI=1;
    }
    for(const n in SV.rost)for(const o of SV.rost[n])if(o){if(o.trait===undefined)o.trait=traitFor(o.full||o.n,o.s,o.r);if(!o.dev)o.dev=devOf(o.full||o.n);}
    if(isUS()){usMigrate();usCrossFix();}   // salvataggio USA con 32 club e 4 Conference: la stagione riparte con 48 club e 8 Conference (35-usa/04-carriera-usa.js)
    SV.v=SAVE_V;careerInit();   // campi della nuova carriera, anche sui salvataggi precedenti
    setLineup(idsOf(SV.lineO).length===7?idsOf(SV.lineO):lineupIds());
    return true;
  }
  SV={};return false;
}
function persist(){
  if(QM.on)return;   // partita veloce: la carriera non si tocca
  SV.v=SAVE_V;SV.squad=squadData();delete SV.players;SV.lineup=lineupIds();SV.savedAt=Date.now();
  if(typeof renderShell==='function'&&!QM.on&&csCur)renderShell();   // crediti e posta nella barra in alto sempre aggiornati
  // Il salvataggio attivo è il dato canonico. La copia nello slot viene usata quando si cambia carriera.
  let data,prev;
  try{
    data=JSON.stringify(SV);
    prev=localStorage.getItem(SAVE_KEY);
    localStorage.setItem(SAVE_KEY,data);
  }catch(e){careerSaveStatus(true);return false;}
  careerSaveStatus(false);
  try{
    if(SV.team)localStorage.setItem(slotKey(SV.slot||1),data);
    if(prev&&prev.length<3e6&&(JSON.parse(prev).slot||1)===(SV.slot||1))
      localStorage.setItem(slotKey(SV.slot||1)+'-bak',prev);
  }catch(e){}   // la copia accessoria non invalida la scrittura del salvataggio attivo
  return true;
}
const ranking=(tab,names)=>names.length&&tab[names[0]]&&tab[names[0]].h?usRanking(tab,names):names.slice().sort((a,b)=>tab[b].pts-tab[a].pts||(tab[b].pf-tab[b].pa)-(tab[a].pf-tab[a].pa)||tab[b].pf-tab[a].pf);   // tabelle USA (con gli scontri diretti, h): 35-usa/03-stagione-usa.js
const myRank=()=>ranking(SV.tab,SV.mem[SV.sr]).indexOf(SV.team)+1;
const totalRounds=()=>SV.sched.length;
function nextMatch(){
  if(SV.event==='camp'&&SV.po&&SV.po.on)return {name:SV.po.opp,roster:SV.rost[SV.po.opp],label:poLabel()};   // playoff: l'avversaria del turno
  if(SV.event==='camp'){
    if(SV.done)return null;
    if(isUS()&&usCrossPending())return usCrossMatch();   // USA: interregionale (35-usa/03-stagione-usa.js)
    const names=SV.mem[SV.sr],ui=names.indexOf(SV.team),pr=SV.sched[SV.round].find(m=>m[0]===ui||m[1]===ui),on=names[pr[0]===ui?pr[1]:pr[0]];
    return {name:on,roster:SV.rost[on],label:`Giornata ${SV.round+1} di ${totalRounds()}`+(on===SV.riv?' · Derby':'')};
  }
  return euOpponent();   // EUCF: 36-europa/01-eucf.js
}
function simPower(a,b){
  const r=simMatch(matchPow(a),matchPow(b),0,carLen());   // stesse regole delle partite vere: si arriva al punteggio scelto, punto per punto
  return [r.a,r.b];
}
function addRes(tab,a,b,sa,sb){
  const A=tab[a],B=tab[b];A.pf+=sa;A.pa+=sb;B.pf+=sb;B.pa+=sa;
  if(sa>sb){A.w++;A.pts+=3;B.l++;}else{B.w++;B.pts+=3;A.l++;}
}
function simSeasonOrder(names){
  const t=freshTab(names);
  for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){const [sa,sb]=simPower(names[i],names[j]);addRes(t,names[i],names[j],sa,sb);}
  return ranking(t,names);
}
// fine stagione: le prime 2 salgono, le ultime 2 scendono (le serie non coinvolte vengono simulate)
function endSeason(){
  if(isUS())return usEndSeason();   // campionato USA: 35-usa/04-carriera-usa.js
  if(isLN())return lnEndSeason();   // leghe europee: 37-leghe/03-stagione-lega.js
  const order={};
  leagueAdvance();   // le altre serie finiscono le giornate che mancano
  for(const sr of ['A','B','C'])order[sr]=sr===SV.sr?ranking(SV.tab,SV.mem[sr]):(SV.lg&&SV.lg[sr]&&SV.lg[sr].round>=SV.lg[sr].sched.length?ranking(SV.lg[sr].tab,SV.mem[sr]):simSeasonOrder(SV.mem[sr]));
  const res={};for(const sr of ['A','B','C'])res[sr]=poResolve(sr,order);   // tabelloni playoff: il tuo e' gia' stato giocato, gli altri si simulano adesso
  leagueEndStories(order,res);
  const rank=order[SV.sr].indexOf(SV.team)+1,P=PROMO,nm={};
  // promossi: il primo sale sempre; la seconda promozione la decide lo spareggio (dal 2° al 5° posto). Retrocesse: sempre le ultime due
  const upB=[order.B[0],res.B?res.B.win:order.B[1]],upC=[order.C[0],res.C?res.C.win:order.C[1]],dnA=order.A.slice(-P),dnB=order.B.slice(-P);
  nm.A=order.A.filter(t=>!dnA.includes(t)).concat(upB);
  nm.B=order.B.filter(t=>!upB.includes(t)&&!dnB.includes(t)).concat(dnA,upC);
  nm.C=order.C.filter(t=>!upC.includes(t)).concat(dnB);
  const champA=res.A?res.A.win:order.A[0],tit=SV.sr==='A'?champA===SV.team:rank===1;   // titolo: in Serie A lo vince chi vince i playoff
  if(res.A)SV.alb=[{s:SV.season,champ:res.A.win,run:res.A.runner,sc:[res.A.fin[2],res.A.fin[3]],ft:res.A.fin[4]===res.A.fin[0]?[res.A.fin[2],res.A.fin[3]]:[res.A.fin[3],res.A.fin[2]]}].concat(SV.alb||[]).slice(0,60);
  let nsr=SV.sr;for(const sr of ['A','B','C'])if(nm[sr].includes(SV.team))nsr=sr;
  let short;
  if(tit&&SV.sr==='A')short='Siete campioni d’Italia!';
  else if(nsr<SV.sr)short=`Promossi in ${SERIES_NAME[nsr]}!`;
  else if(nsr>SV.sr)short=`Retrocessi in ${SERIES_NAME[nsr]}.`;
  else short=`Restate in ${SERIES_NAME[nsr]}.`;
  const qual=SV.sr==='A'&&rank<=3;
  if(qual)short+=' Per la prossima stagione si sblocca il Campionato europeo.';
  chalEval();   // la sfida della dirigenza si giudica adesso, PRIMA dei premi: «Conti in ordine» guarda il saldo con cui arrivi in fondo, non quello gonfiato dai premi
  SV.done=true;SV.next={euQ:order.A.slice(0,3),mem:nm,sr:nsr,rank,short,qual,tit,champs:{A:champA,B:order.B[0],C:order.C[0]},po:res[SV.sr]||null};
  SV.po=null;SV.poRes=null;
  // premi di fine stagione: classifica, obiettivo, reputazione, premi individuali
  const n=SV.mem[SV.sr].length,prize=Math.round((n-rank+1)*3*SR_K[SV.sr]);SV.cash+=prize;
  const ok=objMet(rank,{promoted:nsr<SV.sr,tit});
  if(SV.obj){if(ok){SV.cash+=SV.obj.reward;SV.rep=clamp(SV.rep+3+Math.min(4,Math.max(0,SV.obj.tgt-rank)*0.5),0,100);}else SV.rep=clamp(SV.rep-5,0,100);}
  if(nsr<SV.sr){SV.rep=clamp(SV.rep+6,0,100);const pp=promoPrize(nsr);SV.cash+=pp;SV.next.promoP=pp;news('Premio della lega per la promozione: +'+pp+' crediti per rinforzarvi in '+SERIES_NAME[nsr]+'.');}else if(nsr>SV.sr)SV.rep=clamp(SV.rep-8,0,100);
  if(tit&&SV.sr==='A')SV.rep=clamp(SV.rep+6,0,100);
  fansSeason(tit&&SV.sr==='A'?1:rank,nsr,SV.sr);
  SV.next.prize=prize;SV.next.objOk=!!ok;
  seasonEndDyn(rank);   // sfida della dirigenza, reazione delle rivali
  seasonAwards(rank,order);
  achCheck();
  news('Stagione '+SV.season+' conclusa al '+rank+'° posto: premio di '+prize+' crediti'+(SV.obj?(ok?', bonus dello sponsor (+'+SV.obj.reward+')':', lo sponsor non paga il bonus'):'')+'.');
}
// nuova stagione: tutti i giocatori (anche i tuoi) invecchiano di un anno e le statistiche cambiano di conseguenza
function agePlayers(){
  for(const n in SV.rost)for(const o of SV.rost[n])agePlayer(o,Math.random);
  for(const p of SQ)agePlayer(p,Math.random);
}
function newSeason(){
  SV.mem=SV.next.mem;SV.sr=SV.next.sr;SV.season++;
  SV.euUnlocked=!!SV.next.qual;if(SV.euUnlocked)SV.eu=newEu(SV.season);SV.event='camp';   // la stagione nuova riparte sempre dal campionato
  retireOwn();   // chi aveva annunciato l'addio lascia adesso
  offTrain();    // chi ha finito presto si e' allenato le settimane in cui non ha giocato (28-allenamenti-fuori-stagione.js)
  staffYear();   // lo staff invecchia e matura (25-staff-persone.js)
  achCheck();    // (Hall of Fame)
  for(const p of SQ){p.hist=p.hist||[];p.hist.push([SV.season-1,ovr(p)]);if(p.hist.length>14)p.hist.shift();}   // storico dei progressi: l'Overall con cui ha chiuso la stagione
  const was=new Map(SQ.map(p=>[p.full,ovr(p)]));
  agePlayers();
  potNews();   // 29-potenziali.js: chi si e' fermato e chi ha scoperto piu' margine
  for(const p of SQ){p.sk=Math.min(3,(p.sk|0)+1+(hasTr('ana','occ')?1:0));p.cond=100;}   // un anno insieme: conosci meglio il potenziale dei tuoi
  summerChanges(was);evolveLeague();const aim=aiMarket();   // mercato tra le squadre del computer (31-mercato-ia.js), prima del tuo
  SV.chem=clamp(50+(SV.chem-50)*0.6,0,100);SV.mor=clamp(60+(SV.mor-60)*0.5,0,100);   // estate: l'intesa si allenta un poco, l'umore torna verso la norma
  beginSeason();buildMarket();pickRival();aiMarketNews(aim);   // la notizia dopo la scelta della rivale: la segna nei colpi che la riguardano
  seasonStartDyn();   // premi di mantenimento e usura delle strutture, nuova sfida
  wageWarn();         // 16-bilancio.js: se con questa rosa i conti vanno sotto zero, la dirigenza avvisa subito
  retireCheck('start');starsRetire();   // chi comincia a pensare al ritiro lo dice subito
  persist();
}
function recordResult(win,su,so){
  SV.susp=null;   // la partita e' finita: niente piu' da riprendere
  let msg='';SV.played=(SV.played||0)+1;if(SV.event==='camp')SV.sgp=(SV.sgp|0)+1;
  const incPre=matchMoney(win);   // i conti di questa partita si calcolano con i tifosi e la forma di prima del risultato (26-economia-partita.js)
  const xm=!!(isUS()&&SV.event==='camp'&&usCrossPending());   // interregionale USA: una partita come le altre (conti, allenamento, eventi), ma non conta per la classifica della Conference e non fa girare il mercato
  if(isUS()&&SV.event==='camp'){
    fansBump(win,win?1:0);msg=usRecord(win,su,so);   // campionato USA: stagione regolare, Play-in, Nationals (35-usa/03-stagione-usa.js)
  }else if(isLN()&&SV.event==='camp'){
    fansBump(win,win?1:0);msg=lnRecord(win,su,so);   // leghe europee: gironi e fasi finali (37-leghe/03-stagione-lega.js)
  }else if(SV.event==='camp'&&SV.po&&SV.po.on){
    fansBump(win,win?1:0);msg=poRecord(win,su,so);   // partita di playoff (22-playoff.js)
  }else if(SV.event==='camp'){
    const names=SV.mem[SV.sr],ui=names.indexOf(SV.team);let opp0='';
    for(const [i,j] of SV.sched[SV.round]){
      const a=names[i],b=names[j];
      if(i===ui){addRes(SV.tab,a,b,su,so);SV.res.push({opp:b,su,so});opp0=b;if(lsLive())lsMatch(b,so);}
      else if(j===ui){addRes(SV.tab,a,b,so,su);SV.res.push({opp:a,su,so});opp0=a;if(lsLive())lsMatch(a,so);}
      else{const [sa,sb]=simPower(a,b);addRes(SV.tab,a,b,sa,sb);if(lsLive()){lsMatch(a,sa);lsMatch(b,sb);}}   // statistiche individuali del girone, partita per partita
    }
    SV.round++;
    leagueAdvance();   // giocano anche le altre serie
    fansBump(win,SV.riv&&opp0===SV.riv?(win?1.5:-1):0);   // i tifosi cambiano dopo la partita (una volta sola); l'incasso di questa e' gia' calcolato (incPre)
    const dby=derbyAfter(opp0,win);   // rivalita': incasso, morale e reputazione
    if(SV.round===Math.floor(SV.sched.length/2)){retireCheck('mid');leagueRetAnnounce();leagueHalf();}   // a meta' stagione arrivano gli annunci di ritiro
    if(SV.round>=SV.sched.length){poBegin();msg=SV.po&&SV.po.on?`Stagione regolare conclusa: ${myRank()}° posto. ${PO_NAME[SV.po.kind]}: semifinale contro ${SV.po.opp}.`+dby:`Stagione ${SV.season} conclusa: ${SV.next.rank}° posto. ${SV.next.short}`+dby;}
    else msg=`Giornata ${SV.round} di ${totalRounds()} conclusa: ${myRank()}° in classifica. Prossima: ${nextMatch().name}.`+dby;
  }else{
    fansBump(win,win?1:0);   // anche la coppa europea muove i tifosi
    msg=euRecord(win,su,so);   // EUCF: gironi, prequarti, quarti, semifinali, finale (36-europa/01-eucf.js)
  }
  for(const p of SQ){   // nuova giornata: tornano gli allenamenti, gli infortunati recuperano; ogni infortunio e ogni rientro viene segnalato
    p.tr=false;
    if(p.injNew&&(SV.fisShield|0)>0&&p.inj>1){p.inj=Math.ceil(p.inj/2);SV.fisShield--;}   // prevenzione (fisioterapia tenuta almeno al livello 3)
    if(p.injNew&&p.inj>1&&hasTr('fit','fis'))p.inj--;   // caratteristica del preparatore: «Fisioterapista»
    if(p.injNew){const big=p.inj>=5;if(big){p.injC=(p.injC|0)+1;p.injBig=1;}alertAdd('inj',`${pname(p)} si è infortunat${oa(p)}${big?' in modo serio':''}: ${p.inj} ${p.inj>1?'partite':'partita'} di stop.`,{full:p.full});}
    else if(p.inj>0){p.inj--;if(p.inj===0){if(p.abs)p.abs=0;else healed(p);}}   // abs: assenza per impegni, non un infortunio
    p.injNew=false;
  }
  SV.tTeam=false;
  // incasso, morale, affiatamento, condizione: chi ha giocato si stanca, la settimana fa recuperare (di piu' con la fisioterapia)
  SV.cash+=incPre.net;SV.lastInc=incPre.net;SV.lastWage=incPre.wage;SV.lastUp=incPre.up+incPre.stf;
  econAfterMatch(incPre);   // registro dei conti, avvisi del rosso, premio a chi ha giocato una partita straordinaria
  // morale: sale con le vittorie e scende con le sconfitte, ma tende a tornare verso 60; con i conti in rosso l'umore cala sempre di piu' (redPen)
  SV.mor=clamp(SV.mor+(win?6:-5)+(60+2*facLv('sede')-SV.mor)*0.1-redPen()+(hasTr('coach','mot')?1:0),0,100);SV.chem=clamp(SV.chem+0.5+0.2*facLv('sede')+(hasTr('men','pap')?0.3:0),0,100);
  // la fatica segue i punti giocati (fatShare): chi sta in una sola linea gioca circa meta' delle mete e perde quanto recupera in settimana,
  // chi sta in attacco e in difesa le gioca tutte e si stanca il doppio. Prima contava solo «ha giocato o no», e la profondita' della rosa non serviva a nulla
  for(const p of SQ){const sh=fatShare(p,su+so);p.cond=clamp((p.cond===undefined?100:p.cond)-(sh>0?2*sh*Math.max(5,12-p.s.res*0.06):0)+10+2*facLv('fis')+2*staffLv('fit')+(hasTr('fit','rec')?2:0),0,100);}
  lifeAfterMatch();dynAfterMatch();
  if(SV.event==='camp'&&!SV.done&&!(SV.po&&SV.po.on)&&SV.round%5===0&&!xm)buildMarket();   // il mercato si rinnova ogni 5 giornate
  achCheck();   // traguardi (23-traguardi.js)
  persist();return msg;
}
