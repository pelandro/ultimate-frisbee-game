const REAL={};
(function(){
  const norm=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  for(const sr of ['A','B','C']){
    const ix={};for(const n of SERIES[sr])ix[norm(n.replace(/ \([ABC]\)$/,''))]=n;
    for(const t in REAL_ALL[sr]){const gn=ix[norm(t)];if(gn)REAL[gn]=REAL_ALL[sr][t].map(r=>({sur:r[0],nm:r[1],a:r[2],g:r[3],age:r[4],f:!!r[5]}));}
  }
})();
// in A e in B il livello della rosa viene portato alla forza della squadra (che segue la classifica finale 2026); in C dipende solo da assist e mete
const realOpt=(n,min)=>({min,low:false,flavor:flavorOf(n),target:TEAM[n]&&TEAM[n].series!=='C'?TEAM[n].power:undefined});
const flavorOf=n=>/U17/.test(n)?'u17':(/U20/.test(n)?'u20':(/NewGen|NextGen|Next Gen|Rookies/.test(n)?'newgen':(/Wise/.test(n)?'wise':'')));
const aiRoster=n=>REAL[n]?realRoster(REAL[n],SV.seed+'|'+n,realOpt(n,7)):makeRoster(TEAM[n].power,SV.seed+'|'+n);
const userRoster=()=>realRoster(REAL[SV.team]||[],SV.seed+'|user',Object.assign(realOpt(SV.team,9),{low:true}));   // la tua rosa: quella vera, un po' meno allenata delle avversarie
const EU_NAMES=['Berlino','Parigi','Madrid','Amsterdam','Londra','Praga','Vienna','Lisbona'],EU_POW=[80,86,91],EU_ROUND=['Quarti di finale','Semifinale','Finale'];
const newEu=()=>({round:0,state:'on',opps:EU_NAMES.slice().sort(()=>Math.random()-0.5).slice(0,3)});
function roundRobin(n){
  const arr=[...Array(n).keys()],rounds=[];
  for(let r=0;r<n-1;r++){
    const m=[];for(let i=0;i<n/2;i++)m.push([arr[i],arr[n-1-i]]);
    rounds.push(m);arr.splice(1,0,arr.pop());
  }
  return rounds;
}
function freshTab(names){const t={};for(const n of names)t[n]={pts:0,w:0,l:0,pf:0,pa:0};return t;}
function beginSeason(){
  const names=SV.mem[SV.sr];
  SV.sched=roundRobin(names.length);SV.round=0;SV.tab=freshTab(names);SV.res=[];SV.done=false;SV.next=null;
  if(SV.rost)SV.expOrd=names.slice().sort((a,b)=>teamPow(b)-teamPow(a));   // gerarchie a inizio stagione: servono al premio per l'allenatore dell'anno
  if(SV.cash!==undefined){setObjective();for(const p of SQ)if(p.car){p.car.yrs=(p.car.yrs|0)+(p.car.ss.mp>0?1:0);p.car.ls=p.car.ss;p.car.ss={mp:0,g:0,a:0,b:0};}}
}
function startCareer(name){
  const help=!!SV.help;
  SV={v:SAVE_V,team:name,seed:Math.floor(Math.random()*1e9),sr:(TEAM[name]&&TEAM[name].series)||'C',season:1,event:'camp',eu:newEu(),help,
      mem:{A:SERIES.A.slice(),B:SERIES.B.slice(),C:SERIES.C.slice()},realAB:1,rv:3};
  SV.rost={};for(const n in TEAM)if(n!==name)SV.rost[n]=aiRoster(n);
  beginSeason();
  if(REAL[name]){SV.realv=2;setSquad(userRoster());}
  else{startLow();setLineup([0,1,2,3,4,5,6]);}
  careerInit();news('Inizia la carriera con '+name+' in '+SERIES_NAME[SV.sr]+'.');
  persist();
}
function loadSave(d0){
  let d=d0||null;
  if(!d){try{const r=localStorage.getItem(SAVE_KEY);if(r)d=JSON.parse(r);}catch(e){}}
  if(d&&d.team&&d.mem&&d.sched&&d.tab){
    SV=d;if(SV.rost)for(const n in SV.rost)for(const o of SV.rost[n])if(o&&o.s)fillStats(o.s);SV.tTeam=!!SV.tTeam;if(!SV.eu||!SV.eu.opps)SV.eu=newEu();if(!SV.event||(SV.event==='eu'&&!SV.euUnlocked))SV.event='camp';
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
    SV.v=SAVE_V;careerInit();   // campi della nuova carriera, anche sui salvataggi precedenti
    setLineup(idsOf(SV.lineO).length===7?idsOf(SV.lineO):lineupIds());
    return true;
  }
  SV={};return false;
}
function persist(){
  if(QM.on)return;   // partita veloce: la carriera non si tocca
  SV.v=SAVE_V;SV.squad=squadData();delete SV.players;SV.lineup=lineupIds();SV.savedAt=Date.now();
  try{const prev=localStorage.getItem(SAVE_KEY);if(prev&&prev.length<3e6)localStorage.setItem(SAVE_KEY+'-bak',prev);localStorage.setItem(SAVE_KEY,JSON.stringify(SV));}catch(e){}   // la versione precedente resta come copia di sicurezza
}
const ranking=(tab,names)=>names.slice().sort((a,b)=>tab[b].pts-tab[a].pts||(tab[b].pf-tab[b].pa)-(tab[a].pf-tab[a].pa)||tab[b].pf-tab[a].pf);
const myRank=()=>ranking(SV.tab,SV.mem[SV.sr]).indexOf(SV.team)+1;
const totalRounds=()=>SV.sched.length;
function nextMatch(){
  if(SV.event==='camp'){
    if(SV.done)return null;
    const names=SV.mem[SV.sr],ui=names.indexOf(SV.team),pr=SV.sched[SV.round].find(m=>m[0]===ui||m[1]===ui),on=names[pr[0]===ui?pr[1]:pr[0]];
    return {name:on,roster:SV.rost[on],label:`Giornata ${SV.round+1} di ${totalRounds()}`};
  }
  if(SV.eu.state!=='on')return null;
  const r=SV.eu.round;return {name:SV.eu.opps[r],power:EU_POW[r]+euPlus(),label:EU_ROUND[r]};   // ogni coppa vinta alza il livello delle avversarie
}
function simPower(a,b){
  const r=simMatch(teamPow(a),teamPow(b),0);   // stesse regole delle partite vere: si arriva a 7, punto per punto
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
  const order={};
  for(const sr of ['A','B','C'])order[sr]=sr===SV.sr?ranking(SV.tab,SV.mem[sr]):simSeasonOrder(SV.mem[sr]);
  const rank=order[SV.sr].indexOf(SV.team)+1,P=PROMO,nm={};
  nm.A=order.A.slice(0,order.A.length-P).concat(order.B.slice(0,P));
  nm.B=order.B.slice(P,order.B.length-P).concat(order.A.slice(order.A.length-P),order.C.slice(0,P));
  nm.C=order.C.slice(P).concat(order.B.slice(order.B.length-P));
  let nsr=SV.sr;for(const sr of ['A','B','C'])if(nm[sr].includes(SV.team))nsr=sr;
  let short;
  if(SV.sr==='A'&&rank===1)short='Siete campioni d’Italia!';
  else if(nsr<SV.sr)short=`Promossi in ${SERIES_NAME[nsr]}!`;
  else if(nsr>SV.sr)short=`Retrocessi in ${SERIES_NAME[nsr]}.`;
  else short=`Restate in ${SERIES_NAME[nsr]}.`;
  const qual=SV.sr==='A'&&rank<=3;
  if(qual)short+=' Per la prossima stagione si sblocca il Campionato europeo.';
  SV.done=true;SV.next={mem:nm,sr:nsr,rank,short,qual};
  // premi di fine stagione: classifica, obiettivo, reputazione, premi individuali
  const n=SV.mem[SV.sr].length,prize=Math.round((n-rank+1)*3*SR_K[SV.sr]);SV.cash+=prize;
  const ok=SV.obj&&rank<=SV.obj.tgt;
  if(SV.obj){if(ok){SV.cash+=SV.obj.reward;SV.rep=clamp(SV.rep+3+Math.min(4,Math.max(0,SV.obj.tgt-rank)*0.5),0,100);}else SV.rep=clamp(SV.rep-5,0,100);}
  if(nsr<SV.sr)SV.rep=clamp(SV.rep+6,0,100);else if(nsr>SV.sr)SV.rep=clamp(SV.rep-8,0,100);
  if(SV.sr==='A'&&rank===1)SV.rep=clamp(SV.rep+6,0,100);
  SV.next.prize=prize;SV.next.objOk=!!ok;
  seasonEndDyn(rank);   // sfida della dirigenza, reazione delle rivali
  seasonAwards(rank,order);
  news('Stagione '+SV.season+' conclusa al '+rank+'° posto: premio di '+prize+' crediti'+(SV.obj?(ok?', obiettivo raggiunto (+'+SV.obj.reward+')':', obiettivo mancato'):'')+'.');
}
// nuova stagione: tutti i giocatori (anche i tuoi) invecchiano di un anno e le statistiche cambiano di conseguenza
function agePlayers(){
  for(const n in SV.rost)for(const o of SV.rost[n])agePlayer(o,Math.random);
  for(const p of SQ)agePlayer(p,Math.random);
}
function newSeason(){
  SV.mem=SV.next.mem;SV.sr=SV.next.sr;SV.season++;
  SV.euUnlocked=!!SV.next.qual;if(SV.euUnlocked)SV.eu=newEu();else if(SV.event==='eu')SV.event='camp';
  retireOwn();   // chi aveva annunciato l'addio lascia adesso
  const was=new Map(SQ.map(p=>[p.full,ovr(p)]));
  agePlayers();
  for(const p of SQ){p.sk=Math.min(3,(p.sk|0)+1);p.cond=100;}   // un anno insieme: conosci meglio il potenziale dei tuoi
  summerChanges(was);evolveLeague();
  SV.chem=clamp(50+(SV.chem-50)*0.6,0,100);SV.mor=clamp(60+(SV.mor-60)*0.5,0,100);   // estate: l'intesa si allenta un poco, l'umore torna verso la norma
  beginSeason();buildMarket();
  seasonStartDyn();   // premi di mantenimento e usura delle strutture, nuova sfida
  retireCheck('start');starsRetire();   // chi comincia a pensare al ritiro lo dice subito
  persist();
}
function recordResult(win,su,so){
  let msg='';SV.played=(SV.played||0)+1;
  if(SV.event==='camp'){
    const names=SV.mem[SV.sr],ui=names.indexOf(SV.team);
    for(const [i,j] of SV.sched[SV.round]){
      const a=names[i],b=names[j];
      if(i===ui){addRes(SV.tab,a,b,su,so);SV.res.push({opp:b,su,so});}
      else if(j===ui){addRes(SV.tab,a,b,so,su);SV.res.push({opp:a,su,so});}
      else{const [sa,sb]=simPower(a,b);addRes(SV.tab,a,b,sa,sb);}
    }
    SV.round++;
    if(SV.round===Math.floor(SV.sched.length/2)){retireCheck('mid');leagueRetAnnounce();}   // a meta' stagione arrivano gli annunci di ritiro
    if(SV.round>=SV.sched.length){endSeason();msg=`Stagione ${SV.season} conclusa: ${SV.next.rank}° posto. ${SV.next.short}`;}
    else msg=`Giornata ${SV.round} di ${totalRounds()} conclusa: ${myRank()}° in classifica. Prossima: ${nextMatch().name}.`;
  }else{
    if(win){
      SV.eu.round++;
      if(SV.eu.round>=3){SV.eu.state='champ';msg='Siete campioni d’Europa!';SV.troph.eu=(SV.troph.eu|0)+1;news('Campioni d’Europa nella stagione '+SV.season+'!');}
      else msg=`Si avanza: ${EU_ROUND[SV.eu.round].toLowerCase()} contro ${SV.eu.opps[SV.eu.round]}.`;
    }else{SV.eu.state='out';msg=`Eliminati: ${EU_ROUND[SV.eu.round].toLowerCase()} persa.`;}
  }
  for(const p of SQ){   // nuova giornata: tornano gli allenamenti, gli infortunati recuperano; ogni infortunio e ogni rientro viene segnalato
    p.tr=false;
    if(p.injNew&&(SV.fisShield|0)>0&&p.inj>1){p.inj=Math.ceil(p.inj/2);SV.fisShield--;}   // prevenzione (fisioterapia tenuta almeno al livello 3)
    if(p.injNew){const big=p.inj>=5;if(big){p.injC=(p.injC|0)+1;p.injBig=1;}alertAdd('inj',`${pname(p)} si è infortunat${oa(p)}${big?' in modo serio':''}: ${p.inj} ${p.inj>1?'partite':'partita'} di stop.`,{full:p.full});}
    else if(p.inj>0){p.inj--;if(p.inj===0){if(p.abs)p.abs=0;else healed(p);}}   // abs: assenza per impegni, non un infortunio
    p.injNew=false;
  }
  SV.tTeam=false;
  // incasso, morale, affiatamento, condizione: chi ha giocato si stanca, la settimana fa recuperare (di piu' con la fisioterapia)
  const inc=matchIncome(win),wg=wageBill();SV.cash+=inc-wg;SV.lastInc=inc-wg;SV.lastWage=wg;
  // morale: sale con le vittorie e scende con le sconfitte, ma tende a tornare verso 60; con i conti in rosso gli stipendi arrivano in ritardo e l'umore cala
  SV.mor=clamp(SV.mor+(win?6:-5)+(60+2*facLv('sede')-SV.mor)*0.1-(SV.cash<0?3:0),0,100);SV.chem=clamp(SV.chem+0.5+0.2*facLv('sede'),0,100);
  for(const p of SQ){const played=p.m&&p.m.pts>0;p.cond=clamp((p.cond===undefined?100:p.cond)-(played?Math.max(5,12-p.s.res*0.06):0)+10+2*facLv('fis'),0,100);}   // la partita pesa un po' di piu' di prima: chi gioca sempre va fatto recuperare
  lifeAfterMatch();dynAfterMatch();
  if(SV.event==='camp'&&!SV.done&&SV.round%5===0)buildMarket();   // il mercato si rinnova ogni 5 giornate
  persist();return msg;
}
