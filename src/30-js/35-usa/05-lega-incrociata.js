/* ===================== ITALIA ↔ USA: OFFERTE DI LAVORO E SCAMBI DI GIOCATORI =====================
   Chi parte in una lega puo' ricevere offerte dall'altra, in entrambi i sensi:
   - OFFERTA DI LAVORO (SV.job): a inizio stagione, se la carriera va bene, un club dell'altra lega ti vuole come allenatore. Accettando cambi lega: nuovo club e
     nuova rosa, mentre allenatore, storico, trofei, traguardi, Hall of Fame e impostazioni restano tuoi; la reputazione scende un po' (si riparte in un altro ambiente).
   - SCAMBIO (SV.trade): ogni tanto un club dell'altra lega propone un giocatore suo per uno tuo, di livello simile. Accettando, i due si scambiano.
   Le offerte arrivano come Avvisi (act 'job' / 'trade') e scadono alla prossima partita. */
const lgName=lk=>lk==='US'?'Men’s Club USA':'campionato italiano';
const lgNow=()=>isUS()?'US':'IT';
const clubLvl=n=>US_TEAM[n]?1-(US_TEAM[n].rank-1)/31:(TEAM[n]?1-(TEAM[n].rank-1)/45:0.5);   // 0..1: quanto e' prestigioso il club nella sua lega
const foreignClubs=()=>(isUS()?[].concat(SERIES.A,SERIES.B,SERIES.C).filter(n=>REAL[n]):US_NAMES);
const foreignRoster=(n,seed)=>US_TEAM[n]?usRoster(n,seed):realRoster(REAL[n],seed+'|'+n,realOpt(n,9));
const clubLeagueTxt=n=>US_TEAM[n]?`Men’s Club USA, ${usConfName(US_TEAM[n].conf)}`:SERIES_NAME[TEAM[n].series];
// ---- offerta di lavoro, a inizio stagione ----
function crossLgOffer(){
  if(!SV.hist||SV.hist.length<1||SV.job||(SV.jobLast&&SV.season-SV.jobLast<3))return;
  const h=SV.hist[0],good=!!(h&&(h.obj||(h.rank|0)<=2)),tit=!!(SV.next&&SV.next.tit),p=clamp(0.05+(SV.rep-40)/250+(good?0.1:0)+(tit?0.15:0),0.03,0.45);
  if(Math.random()>p)return;
  const me=clubLvl(SV.team),pool=foreignClubs().filter(n=>{const l=clubLvl(n);return l>=me-0.2&&l<=me+0.35;});
  if(!pool.length)return;
  const club=pool[Math.floor(Math.random()*pool.length)],lk=US_TEAM[club]?'US':'IT';
  SV.job={club,lk,season:SV.season,round:SV.round|0};SV.jobLast=SV.season;
  alertAdd('club',`${club} (${clubLeagueTxt(club)}) vuole ${coachName()} come nuovo allenatore. Accettare significa lasciare ${SV.team}: la rosa resta lì, tu riparti con un altro club e un’altra lega. L’offerta vale fino alla prossima partita.`,{act:'job'});
}
// ---- scambio di giocatori ----
function crossLgTrade(){
  if(SV.trade||SV.job||SV.event!=='camp'||SV.done||SQ.length<=SQ_MIN+1)return;
  const mine=SQ.filter(p=>!p.inj&&p.ret!==1&&p.age<=33&&ovr(p)>=squadPower()-14).sort(()=>Math.random()-0.5)[0];if(!mine)return;
  const clubs=foreignClubs().sort(()=>Math.random()-0.5);
  for(const club of clubs.slice(0,6)){
    const ro=foreignRoster(club,SV.seed+'|x|'+SV.season+'|'+(SV.played|0)),cand=ro.filter(o=>Math.abs(ovrX(o)-ovr(mine))<=4&&!SQ.some(p=>p.full===o.full)).sort(()=>Math.random()-0.5)[0];
    if(!cand)continue;
    SV.trade={club,mine:mine.full,theirs:cand,season:SV.season,round:SV.round|0};
    alertAdd('club',`${club} (${clubLeagueTxt(club)}) propone uno scambio: ${cand.label||cand.n} (${cand.age} anni, Overall ${Math.round(ovrX(cand))}, ${POS_NAME[posOf(cand)]}) per ${pname(mine)} (Overall ${ovr(mine)}). L’offerta vale fino alla prossima partita.`,{act:'trade',full:mine.full});
    return;
  }
}
function crossLgTick(){   // dopo ogni partita
  for(const k of ['job','trade'])if(SV[k]&&(SV[k].season!==SV.season||(SV.round|0)>SV[k].round||SV.done)){
    const a=SV.alerts.find(x=>x.act===k&&!x.done);if(a){a.done=1;a.res='Offerta scaduta.';}SV[k]=null;
  }
  if(!SV.trade&&Math.random()<0.05)crossLgTrade();
}
const crossLgButtons=a=>a.act==='job'&&SV.job
  ?`<button type="button" class="go" data-al="${a.id}" data-do="yes">Accetta: vai a ${esc(SV.job.club)}</button><button type="button" class="sec" data-al="${a.id}" data-do="no">Resta qui</button>`
  :(a.act==='trade'&&SV.trade?`<button type="button" class="go" data-al="${a.id}" data-do="yes">Accetta lo scambio</button><button type="button" class="sec" data-al="${a.id}" data-do="no">Rifiuta</button>`:'');
function crossLgAnswer(a,d){
  if(a.act==='job'){
    const j=SV.job;SV.job=null;if(!j)return 'L’offerta non è più valida.';
    if(d!=='yes')return `Hai rifiutato ${j.club}: resti a ${SV.team}.`;
    return switchLeague(j.club);
  }
  const t=SV.trade;SV.trade=null;if(!t)return 'L’offerta non è più valida.';
  const p=byFull(t.mine);if(!p)return 'Il giocatore non c’è più: scambio saltato.';
  if(d!=='yes')return `Scambio rifiutato: ${pname(p)} resta.`;
  keepFormer(p);
  const rec=Object.assign({},t.theirs,{sk:1,cond:100,car:null,ss:undefined,cs:undefined}),list=squadData().filter(o=>o.full!==p.full);list.push(rec);
  const lO=SV.lineO,lD=SV.lineD;setSquad(list);SV.lineO=lO;SV.lineD=lD;fixLines();SV.chem=Math.max(0,SV.chem-3);
  news(`Scambio con ${t.club}: ${pname(p)} parte, arriva ${rec.label||rec.n}.`);
  return `Scambio fatto: ${pname(p)} passa a ${t.club}, arriva ${rec.label||rec.n}.`;
}
// ---- cambio di lega: accetti l'offerta di un club dell'altra lega ----
function switchLeague(club){
  const old=SV.team,s=SV.season,carry={hist:SV.hist,hof:SV.hof,troph:SV.troph,ach:SV.ach,alb:SV.alb,usAlb:SV.usAlb,rec:SV.rec,tips:SV.tips,diff:SV.diff,len:SV.len,autoSub:SV.autoSub,played:SV.played,jobLast:SV.jobLast,rep:Math.round(SV.rep*0.85)};
  const coach=SV.coach;
  startCareer(club,{coach,season:s,carry});
  if(s>1){   // le rose nuove sono quelle di inizio carriera: invecchiano delle stagioni gia' giocate
    for(const n in SV.rost)for(let y=1;y<s;y++)for(const o of SV.rost[n])agePlayer(o,Math.random);
    const L=squadData();for(let y=1;y<s;y++)for(const o of L)agePlayer(o,Math.random);
    setSquad(L);fixLines();
  }
  news(`Lasci ${old} e accetti ${club} (${lgName(lgNow())}).`);persist();
  return `Benvenuto a ${club}: da ora alleni nel ${lgName(lgNow())}.`;
}
