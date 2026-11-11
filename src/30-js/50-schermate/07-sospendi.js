/* ---- SOSPENDI LA PARTITA E RIPRENDILA PIU' TARDI (carriera) ----
   La pausa (tasto II, Esc o P) ferma la partita finche' la pagina resta aperta. «Sospendi» invece la salva nella carriera (SV.susp) e torna al cruscotto:
   la riprendi quando vuoi, anche dopo aver chiuso il gioco. Si salvano punteggio, meta, energie e statistiche dei giocatori, schemi, cio' che
   l'avversario ha osservato, i cambi dell'avversario e gli infortuni della partita. Se la sospendi a meta' azione, si riparte dall'inizio di quella meta.
   Se chiudi o nascondi la pagina durante una partita di carriera, la sospensione viene salvata da sola: se poi continui a giocare non cambia nulla. */
function suspSnap(){
  if(!G.inMatch||QM.on||G.drill||G.recorded||!SV||!SV.team)return null;
  const m=nextMatch();if(!m)return null;
  if(Math.max(G.score[0],G.score[1])>=G.target||G.mode==='over')return null;   // partita gia' finita: si registra normalmente
  let rec=1-G.pullTeam,dir=G.dir.slice(),pno=G.pointNo,half=G.halfDone,fresh=false;
  if(G.mode==='banner'&&G.banner){   // meta appena segnata: si riparte dalla successiva (o dal secondo tempo)
    fresh=true;dir=[-dir[0],-dir[1]];pno=G.pointNo+1;
    if(!half&&Math.max(G.score[0],G.score[1])>=halfAt()){half=true;rec=1-G.startRec;}else rec=1-G.banner.team;
  }else if(G.mode==='half'){fresh=true;dir=[-dir[0],-dir[1]];pno=G.pointNo+1;rec=G.nextRec;half=true;}
  else if(!(G.mode==='play'||G.mode==='ready'||G.mode==='cine'))return null;
  const cp=o=>JSON.parse(JSON.stringify(o));
  return {v:1,key:m.label+'|'+m.name,tg:G.target,score:G.score.slice(),pno,half,rec,dir,fresh,startRec:G.startRec,st:cp(G.st),seen:cp(G.seen||{att:{},def:{}}),obs:cp(G.obs||{u:0,d:0,n:0}),
    aiRec:cp(G.aiRec||{}),sch:cp(G.sch),opp:cp(G.opp),dmode:G.dmode.slice(),
    my:SQ.map(p=>({f:p.full,st:Math.round(p.st),m:cp(p.m),inj:p.injNew?p.inj:0})),
    op:T[1].map(q=>({ro:OPP.list.indexOf(q.ro),st:Math.round(q.st),m:cp(q.m)})),ol:OPP.list.map(o=>o.st===undefined?100:Math.round(o.st))};
}
const suspOk=()=>!!(SV&&SV.susp&&nextMatch()&&SV.susp.key===nextMatch().label+'|'+nextMatch().name);
function suspendMatch(){
  const s=suspSnap();if(!s)return false;
  SV.susp=s;$('pause').classList.add('hidden');$('half').classList.add('hidden');G.paused=false;restoreForm();
  G.schemeOpen=false;G.inMatch=false;$('menu').classList.add('hidden');$('over').classList.add('hidden');
  persist();showScreen('home');return true;
}
function resumeMatch(){
  if(!suspOk()){SV.susp=null;persist();return false;}
  const s=SV.susp;
  startMatch();   // squadre, forma, vento, linee e intesa come all'inizio: poi si rimette lo stato salvato
  G.target=lenOk(s.tg|0);   // la partita sospesa finisce al punteggio con cui era cominciata, anche se nel frattempo hai cambiato la durata
  G.score=s.score.slice();G.pointNo=s.pno;G.halfDone=s.half;G.startRec=s.startRec;G.nextRec=s.rec;G.dir=s.dir.slice();
  G.st=s.st;G.seen=s.seen;G.obs=s.obs;G.aiRec=s.aiRec;Object.assign(G.sch,s.sch);Object.assign(G.opp,s.opp);G.dmode=s.dmode.slice();
  for(const x of s.my){const p=byFull(x.f);if(!p)continue;p.st=x.st;p.m=x.m;if(x.inj&&!p.inj){p.inj=x.inj;}if(x.inj)p.injNew=true;}
  s.ol.forEach((v,i)=>{if(OPP.list[i])OPP.list[i].st=v;});
  s.op.forEach((x,i)=>{const q=T[1][i],o=OPP.list[x.ro];if(!q)return;if(o&&q.ro!==o)loadOpp(q,o,true);q.st=x.st;q.m=x.m;});
  G.injured=[];
  if(s.fresh){const o=Object.assign({},G.opp);startPoint(s.rec);Object.assign(G.opp,o);}   // meta nuova: riposo tra le mete, come sempre (gli schemi dell'avversario restano quelli salvati)
  else{useLines(s.rec);placeTeams(s.rec);}                                                       // meta interrotta: si rigioca da capo, senza recupero
  cam.snap=true;SV.susp=null;persist();
  return true;
}
// chiudi o nascondi la pagina durante una partita di carriera: la sospensione si salva da sola
function autoSusp(){const s=suspSnap();if(s){SV.susp=s;persist();}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)autoSusp();});
window.addEventListener('pagehide',autoSusp);
$('paSusp').addEventListener('click',()=>{suspendMatch();});
