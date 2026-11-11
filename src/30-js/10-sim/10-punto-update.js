/* ---- punto, aggiornamento ---- */
function scoreGoal(team,p,kind){
  if(G.drill){G.flight=null;HOOKS.sfx('goal',team);HOOKS.toast(team===0?'Meta!':'Meta avversaria',team);drillEvt('goal',team,p,kind);return;}   // allenamento: niente punteggio, si ricomincia
  if(G.seen){G.seen.att[G.sch.att]=(G.seen.att[G.sch.att]||0)+1;G.seen.def[G.sch.def]=(G.seen.def[G.sch.def]||0)+1;}   // gli schemi che hai appena usato: l'avversario se li ricorda
  if(G.ptLog){G.ptLog.push({rec:1-G.pullTeam,by:team,att:G.sch.att,def:G.sch.def});const R=team===0?G.schR:G.defR,k=team===0?G.sch.att:G.sch.def;if(R)(R[k]||(R[k]=[0,0]))[1]++;}   // per il riepilogo della partita
  checkInjuries();
  if(team===1){const k=G.opp.att,r=G.aiRec||(G.aiRec={});(r[k]||(r[k]=[0,0]))[0]++;}
  G.score[team]++;G.mode='banner';HOOKS.sfx('goal',team);HOOKS.shake(team===0?7:4);G.banner={t:2.4,team,scorer:p,kind};G.flight=null;
  HOOKS.vibe(40);
}
// tuffo difensivo a tempo: quando l'avversario lancia e un tuo difensore e' a distanza di tuffo dal punto d'arrivo, il gioco va al rallentatore
// e con il tempismo giusto (pulsante TUFFO) il difensore si tuffa per intercettare. La vista resta quella di gioco.
const SLOW_TAIL=0.8,SLOW_K=0.3,DIVE_REM=0.36,DIVE_COOL=20,DIVE_NEAR=4;   // pausa minima tra due occasioni (s) e distanza massima dal ricevitore (m)
// difesa automatica: i momenti a tempo (tuffo, duello in salto) restano ma sono rari. Dopo ognuno passa almeno DEF_EVT_COOL secondi e l'occasione
// successiva arriva poco piu' di una volta su due: in media uno ogni tre mete difese (misurato su 300 mete)
const DEF_EVT_COOL=32,DEF_EVT_P=0.6;
function defEvt(f){
  if(f.team!==1||defMan()||G.auto)return true;   // in attacco e in difesa manuale gli stacchi ci sono sempre
  if(G.skip||G.diveCool>0||Math.random()>DEF_EVT_P)return false;
  G.diveCool=DEF_EVT_COOL;return true;
}
const DIVE_BONUS={green:0.22,yellow:0.06,red:-0.15};
const drOf=p=>3+2.4*clamp((p.s.tuf-40)/60,0,1);   // quanto oltre la portata ci si puo' tuffare: da 3 m (Tuffo 40) a 5,4 m (Tuffo 100)
// difficolta' della partita veloce: 0 facile (com'era), 1 medio, 2 difficile. Agisce solo sulla squadra avversaria (team 1) e non sulle statistiche
// smart = quanto legge mismatch, marcature e probabilita' dei lanci; poach = aiuti lontano dal disco; react = ritardo di reazione sul lancio;
// adapt = quanto si adatta a cio' che ripeti; sw = cambi di marcatura quando un difensore e' battuto
const DIFF_AI=[{noise:1,think:1,wander:1,sprint:0,hb:1,mark:1,pat:0,smart:0.35,poach:0.45,react:1.15,adapt:0,sw:0.3},
  {noise:0.95,think:1.02,wander:0.95,sprint:0.04,hb:1.07,mark:0.9,pat:0.95,smart:0.8,poach:0.8,react:1,adapt:0.35,sw:0.6},
  {noise:0.85,think:1.05,wander:0.8,sprint:0.08,hb:1.15,mark:0.75,pat:1.3,smart:1.2,poach:1.1,react:0.85,adapt:0.7,sw:0.9}];
/* ---- IDENTITA' TATTICA delle squadre: nasce dal nome (fissa) e dalle qualita' dei 7 in campo.
   deep: -1 gioco corto ... +1 gioco lungo; pat: -1 ritmo alto ... +1 possesso paziente; press: probabilita' di marcare in anticipo; poach: quanto aiutano lontano dal disco ---- */
const ID0={deep:0,pat:0,press:0.3,poach:0.5,tags:[]};
function teamIdentity(seedStr,list){
  const r=mulberry32(hashStr('idn|'+seedStr)),avg=k=>list.reduce((a,o)=>a+o.s[k],0)/list.length;
  const deep=clamp((r()*2-1)*0.7+((avg('spa')+avg('vel'))/2-avg('lan'))/22,-1,1);
  const pat=clamp((r()*2-1)*0.7+(avg('vis')-avg('vel'))/25,-1,1);
  const press=clamp(0.3+(r()-0.5)*0.6+(avg('dif')-avg('lan'))/60,0.05,0.9);
  const poach=clamp(0.5+(r()-0.5)*0.8+(avg('vis')-60)/80,0.1,1);
  const tags=[];
  if(deep>0.3)tags.push('gioco lungo');else if(deep<-0.3)tags.push('gioco corto');
  if(pat>0.3)tags.push('possesso paziente');else if(pat<-0.3)tags.push('ritmo alto');
  if(press>0.55)tags.push('difesa in anticipo');else if(press<0.2)tags.push('difesa di contenimento');
  if(poach>0.75)tags.push('aiuti e raddoppi');
  return {deep,pat,press,poach,tags};
}
const idOf=t=>(G.idn&&G.idn[t])||ID0;
const aiTeam=t=>t===1||!!G.auto;   // squadra guidata dall'IA anche nelle scelte tattiche
const AIK=t=>DIFF_AI[t===1&&G.lvl?G.lvl[1]:0];
const thinkFor=(t,lo,hi,p)=>rnd(lo,hi)*AIK(t).think*(p?1+(60-p.s.vis)*0.004:1);   // la Visione fa decidere prima: 99 -> 16% piu' rapido, 30 -> 12% piu' lento (60 = standard)
// half time: pausa a meta' partita. Si recupera pochissima energia e chi ha iniziato in difesa (il pull) riparte in attacco
function halfTime(){
  G.mode='half';G.halfDone=true;
  for(const p of SQ)p.st=Math.min(100,p.st+HALF_REST);
  for(const q of T[1])q.st=Math.min(100,q.st+HALF_REST);
  G.nextRec=1-G.startRec;
  HOOKS.half();
  if(G.injured&&G.injured.length)HOOKS.injury(G.injured);
}
function startSecondHalf(){G.pointNo++;G.dir=[-G.dir[0],-G.dir[1]];startPoint(G.nextRec);HOOKS.menu();}
const K_DEF=0.85,K_ATT=0.95,K_DEF_AUTO=1.3;   // 1 = velocita' originale: tutto il gioco va al 95% in attacco, all'85% in difesa manuale (serve tempo per reagire) e al 130% in difesa automatica (scorre da sola)
function update(dt){
  const dtr=dt;   // tempo reale (il rallentatore agisce solo sul tempo di gioco)
  const kt=G.poss===1&&!G.pull?(G.auto||defMan()?K_DEF:K_DEF_AUTO):K_ATT;G.k=G.k?G.k+(kt-G.k)*(1-Math.exp(-dt*3)):kt;   // il cambio di velocita' e' graduale
  if(G.slowTail>0)G.slowTail-=dtr;
  G.diveScene=!!(G.diveWin||G.slowTail>0);
  const st=G.diveScene?SLOW_K:1;G.slowK=G.slowK===undefined?1:G.slowK+(st-G.slowK)*(1-Math.exp(-dtr*10));
  if(G.diveCool>0)G.diveCool-=dtr;
  dt*=G.k*G.slowK;
  if(G.mode==='banner'){
    G.banner.t-=dt;
    if(G.banner.t<=0){
      if(Math.max(G.score[0],G.score[1])>=G.target){G.mode='over';HOOKS.over();}
      else if(!G.halfDone&&Math.max(G.score[0],G.score[1])>=HALF_AT)halfTime();
      else{G.nextRec=1-G.banner.team;G.pointNo++;G.dir=[-G.dir[0],-G.dir[1]];startPoint(G.nextRec);HOOKS.menu();if(G.injured&&G.injured.length)HOOKS.injury(G.injured);}
    }
    return;
  }
  if(G.mode==='ready'){
    if(!G.schemeOpen&&(G.pullTeam===1||G.auto)){G.readyT-=dt;if(G.readyT<=0)aiPull();}
    return;
  }
  if(G.mode!=='play')return;
  G.gt=(G.gt||0)+dt;   // tempo di gioco (vale anche nei test e nelle mete simulate, dove G.tick non avanza)
  if(G.drill&&G.drill.wait>0){G.drill.wait-=dtr;if(G.drill.wait<=0){if(G.drill.done){G.drill.wait=0;HOOKS.drill('end');return;}drillStart();return;}}
  if(G.freeze>0){G.freeze-=dt;return;}
  updatePlay(dt);
  updateAttackers(dt);updateDefenders(dt);separate();
  if(G.flight){   // lo scatto sui lanci lunghi consuma energia: meno con la Resistenza alta
    for(const q of (G.sprint&&G.hold?[G.sprint.p]:[]).concat(G.aiSprint||[]))
      if(q.fl&&q.st>0&&hyp(q.x-q.fl.x,q.y-q.fl.y)>0.6)q.st=Math.max(0,q.st-SPRINT_DRAIN*(1.5-q.s.res/100)*(hasT(q,'iron')?0.7:1)*dt);
  }
  updateDisc(dt);
  if(G.mode!=='play')return;
  diveOffer(dtr);
  const h=G.holder;
  if(h&&!G.flight){
    G.holdT+=dt;
    if(G.brickWait){   // brick: l'attacco parte solo quando i difensori si sono schierati (o dopo un po')
      G.brickT+=dt;
      if(brickReady()||G.brickT>8){G.brickWait=false;G.think=rnd(0.5,0.9);}
    }
    if(G.walk){   // dopo un turnover: prima raggiunge il disco; se e' nella meta che attacca, poi cammina fino alla linea di meta
      const wk=G.walk,tg=wk.stage?wk.line:wk.pick;
      if(hyp(h.x-tg.x,h.y-tg.y)<0.6){if(!wk.stage&&wk.line)wk.stage=1;else{G.walk=null;G.think=rnd(0.7,1.1);}}
    }
    const waiting=G.brickWait||!!G.walk;
    if(waiting){G.think=Math.max(G.think,0.6);G.stallT=0;}
    if(!waiting&&G.marker&&hyp(G.marker.x-h.x,G.marker.y-h.y)<3.8)G.stallT+=dt;
    if(G.stallT>=10){HOOKS.sfx('whistle');HOOKS.toast('Stall! Disco perso',1-h.t);turnover(1-h.t,h.x,h.y,G.marker,'',1-h.t);return;}
    if(h.t===1&&!G.auto&&defMan()&&!G.skip){   // il cerchio dell'handblock deve sempre partire intero: se il tuo marcatore arriva quando manca poco al lancio, l'avversario aspetta
      const mk=G.marker;
      if(mk&&mk.t===0&&G.hbOk!==h&&hyp(mk.x-h.x,mk.y-h.y)<3.8){const need=hbDur(h,mk)*(G.k||K_DEF)+0.04;if(G.think<need)G.think=need;G.hbOk=h;}
    }
    if((h.t===1||G.auto)&&!waiting){
      const lv=AIK(h.t);
      if(pbWait(h)){const mk=G.marker,hold=((mk&&mk.t===0?hbDur(h,mk):0.85)+0.12)*(G.k||K_DEF);if(G.think<hold)G.think=hold;}   // schema a sequenza: non lancia finche' non e' pronto
      const patT=lv.pat+Math.max(0,idOf(h.t).pat)*0.9;
      if(patT>0&&G.stallT<7){   // difficolta': aspetta un ricevitore libero (il tempo di lancio resta appena sopra l'inizio del cerchio)
        const mk=G.marker,hold=((mk&&mk.t===0?hbDur(h,mk):0.85)+0.12)*(G.k||K_DEF);
        if(G.think<hold&&aiPick(h).open<patT)G.think=hold;
      }
      G.think-=dt;if(G.think<=0||G.stallT>8.6)aiThrow(h);
    }
  }
}
// dopo un brick i difensori devono essere vicini al proprio uomo (o, in zona, vicini al disco)
function diveCandidate(f){
  const L={x:f.tx,y:f.ty},reach=p=>reachOf(f,p);
  {const p=G.ctrl;if(p&&p.t===1-f.team){const d=hyp(p.x-L.x,p.y-L.y),r=reach(p);if(d>r&&d<=r+drOf(p)+0.5)return p;}}   // prima di tutti il difensore che stai guidando
  let best=null,bd=1e9;
  for(const p of T[1-f.team]){
    const d=hyp(p.x-L.x,p.y-L.y),r=reach(p);
    if(d>r&&d<=r+drOf(p)+0.5&&d-r<bd&&(!f.intended||hyp(p.x-f.intended.x,p.y-f.intended.y)<=DIVE_NEAR)){bd=d-r;best=p;}
  }
  return best;
}
function diveOffer(dtr){
  const f=G.flight,w=G.diveWin;
  if(w){
    w.t+=dtr;
    if(!f||w.t>=w.W+0.2)G.diveWin=null;
    return;
  }
  if(!f||f._offer||f.team!==1||(G.auto&&!G.testDive)||G.skip||G.diveCool>0)return;
  const rem=f.T-f.t;
  if(rem>DIVE_REM)return;
  f._offer=true;
  const p=diveCandidate(f);if(!p)return;
  const man=defMan()||G.auto;if(!man&&Math.random()>DEF_EVT_P)return;
  const W=Math.max(0.8,rem/((G.k||K_DEF)*SLOW_K));
  G.diveWin={p,t:0,W,tp:W*0.78,tol:W*0.32,done:false,color:null};G.diveCool=man?DIVE_COOL:DEF_EVT_COOL;G.diveFocus=p;   // la tolleranza in secondi e' proporzionale alla durata: cerchio piu' veloce = tempismo piu' stretto
}
// tocco sul pulsante TUFFO: il tempismo decide il colore (verde, giallo, rosso)
function diveTap(){
  const w=G.diveWin,f=G.flight;if(!w||w.done||!f)return false;
  const q=clamp(1-Math.abs(w.t-w.tp)/w.tol,0,1),color=q>=0.6?'green':(q>=0.25?'yellow':'red');
  w.done=true;w.color=color;w.q=q;G.dive={p:w.p,qual:q,color};HOOKS.sfx('timing',q);HOOKS.sfx('dive');
  w.p.fl={x:f.tx,y:f.ty};w.p.flD=0;w.p.boost=1;   // il difensore si butta verso il punto d'arrivo
  w.p.dv={t0:G.tick||0,dir:f.tx>=w.p.x?1:-1,end:null};   // animazione del tuffo (la disegna l'interfaccia)
  return true;
}
function brickReady(){
  const def=T[1-G.poss],h=G.holder;if(!h)return true;
  for(const q of def){
    if(q.mark){if(hyp(q.x-q.mark.x,q.y-q.mark.y)>=4.5)return false;}
    else if(hyp(q.x-h.x,q.y-h.y)>=22)return false;
  }
  return true;
}
