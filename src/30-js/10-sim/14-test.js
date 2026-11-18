/* ===================== TEST AUTOMATICI E SIMULAZIONI RIPRODUCIBILI =====================
   La suite gioca partite IA contro IA col motore vero e controlla: stabilita', ritmo e regole, efficacia dei lanci, equilibrio degli schemi,
   peso della forza e degli attributi, coerenza tra partite simulate e giocate, crescita dei giocatori, prestazioni.
   Ogni passo usa un generatore casuale con seme fisso: con lo stesso seme e lo stesso numero di partite i risultati sono identici a ogni esecuzione.
   Si lancia da Impostazioni > Diagnostica oppure da riga di comando (node test_ultimate_frisbee.js). */
const LANE_MAX=0.14;   // linee di passaggio verso chi taglia chiuse da un compagno che non taglia: su 24 partite 11% senza tagli a liberare e passi di lato, 9% con (lo stack verticale sta per forza nella corsia); una sola partita va dal 6 al 15%, quindi il tetto ferma i peggioramenti netti, non il caso
const REV_MAX=6;   // prima delle correzioni (tagli liberi che dondolano, lato dell'attacco che si scambia) erano circa 13 al minuto; poi circa 7; con attese piu' lunghe tra un taglio e l'altro circa 4
function testMatch(ra,rb,o){   // una partita IA contro IA: ritorna punteggio, statistiche e controlli
  o=o||{};
  setSquad(ra);applyRoster(rb);
  G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=o.fix||null;
  newGame();if(o.len)G.target=o.len;if(o.wind)setWind(o.wind[0],o.wind[1]);G.auto=true;G.lvl=[o.lvl|0,o.lvl|0];G.oppPlus=0;G.idn=[null,null];G.xtr=false;G.hint=false;G.inMatch=true;G.schemeOpen=false;
  applyForm();
  if(o.hero!==undefined){G.heroOn=true;heroInit(heroRand(),heroRand());if(o.hero!==1)heroAssign(T[0],G.hk[0]);if(o.hero!==0)heroAssign(T[1],G.hk[1]);}   // superpoteri: 'both', 0 o 1 (chi ha gli eroi)
  G.startRec=o.rec|0;G.nextRec=G.startRec;startPoint(G.startRec);
  const dt=1/60,r={time:0,nan:0,stuck:false,hold:0,pts:0,ptT:[],rev:0,revT:0,halfAt:-1,lane:0,laneT:0};let pt=0,last=0,rec=-1,fr=0;
  while(G.mode!=='over'&&r.time<3600){
    update(dt);r.time+=dt;pt+=dt;fr++;
    if(G.mode==='half'){r.halfAt=Math.max(G.score[0],G.score[1]);startSecondHalf();}
    if(rec<0&&G.mode==='ready')rec=G.poss;
    const tot=G.score[0]+G.score[1];
    if(tot!==last){const sc=G.banner?G.banner.team:(G.score[0]>G.score[1]?0:1);if(sc===rec)r.hold++;r.pts++;r.ptT.push(pt);pt=0;last=tot;rec=-1;}
    if(pt>240){r.stuck=true;break;}
    if(fr%6===0){   // ripensamenti: chi non ha il disco, mentre il portatore aspetta, inverte la corsa (angolo oltre 120 gradi rispetto a 0,4 secondi prima)
      if(G.mode==='play'&&G.holder&&!G.flight&&!G.pull&&G.holdT>1){   // solo a formazione assestata (dopo 1 s dalla presa): e' quando chi ha il disco sta decidendo o mirando
        const Hh=G.holder;   // linee di passaggio intasate: un compagno che non taglia sta a meno di 2 m dalla linea tra il portatore e chi taglia (taglio a liberare)
        for(const c of T[G.poss]){
          if(c===Hh||!cutting(c))continue;
          const vx=c.x-Hh.x,vy=c.y-Hh.y,L2=vx*vx+vy*vy;if(L2<25)continue;r.laneT++;
          for(const q of T[G.poss]){if(q===Hh||q===c||cutting(q))continue;const u=((q.x-Hh.x)*vx+(q.y-Hh.y)*vy)/L2;if(u<0.15||u>0.9)continue;if(hyp(Hh.x+vx*u-q.x,Hh.y+vy*u-q.y)<2){r.lane++;break;}}
        }
        for(const p of T[G.poss]){
          if(p===G.holder){p._hq=null;continue;}
          const q=p._hq||(p._hq=[]),sp=hyp(p.vx,p.vy);q.push([p.vx,p.vy]);if(q.length>4)q.shift();r.revT+=0.1;
          if(q.length===4&&sp>2.5){const o=q[0],so=hyp(o[0],o[1]);if(so>2.5&&(o[0]*p.vx+o[1]*p.vy)/(so*sp)<-0.5){r.rev++;q.length=0;}}
        }
      }else for(const p of T[0].concat(T[1]))p._hq=null;
    }
    if(fr%30===0)for(const p of T[0].concat(T[1]))if(!isFinite(p.x)||!isFinite(p.y)){r.nan++;p.x=50;p.y=18;}
  }
  r.score=G.score.slice();r.st=JSON.parse(JSON.stringify(G.st));
  r.xp=SQ.filter(p=>p.m.pts>0).reduce((a,p)=>a+xpTotal(p.m)*XP_ROLE[posOf(p)],0)/7*lenK();
  restoreForm();
  return r;
}
function selfTestPlan(opt){
  opt=opt||{};
  const n=Math.max(2,(opt.n|0)||6),S={n,seed:opt.seed===undefined?2026:(opt.seed|0),steps:[],base:null,ms:0};
  const ros=(pw,tag)=>makeRoster(pw,'test|'+tag),avg=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length),pc=x=>Math.round(x*100)+'%';
  const run=(ra,rb,k,o)=>{const out=[];for(let i=0;i<k;i++)out.push(testMatch(ra,rb,Object.assign({rec:i%2},o||{})));return out;};
  const row=(name,val,ok,note)=>({name,val,ok:!!ok,note:note||''});
  // schemi di una partita nuova: i passi che giocano possessi con placeTeams (senza startPoint) altrimenti ereditano gli schemi lasciati dal passo prima,
  // e l'esito cambiava con lo schema rimasto (con il T1 un Gran pull vale poco e dopo un brick si parte piu' tardi anche senza difetti)
  const schReset=()=>{Object.assign(G.sch,{att:'vert',def:'man_out'});Object.assign(G.opp,{att:'vert',def:'man_out'});};
  const margin=ms=>avg(ms.map(m=>m.score[0]-m.score[1]));
  S.steps.push(['Stabilità, ritmo e regole',()=>{
    const t0=Date.now(),ms=run(ros(62,'a'),ros(62,'b'),n);S.base=ms;S.ms=(Date.now()-t0)/n;
    const thr=avg(ms.map(m=>m.st.thr[0]+m.st.thr[1])),cmp=avg(ms.map(m=>m.st.cmp[0]+m.st.cmp[1]))/thr,to=avg(ms.map(m=>m.st.to[0]+m.st.to[1]));
    const lose=avg(ms.map(m=>Math.min(m.score[0],m.score[1]))),hold=avg(ms.map(m=>m.hold/Math.max(1,m.pts))),ptT=avg([].concat(...ms.map(m=>m.ptT)));
    const rev=ms.reduce((a,m)=>a+m.rev,0)/Math.max(1,ms.reduce((a,m)=>a+m.revT,0)/60);
    const lane=ms.reduce((a,m)=>a+m.lane,0)/Math.max(1,ms.reduce((a,m)=>a+m.laneT,0));
    const htol=2.6*Math.sqrt(0.25/Math.max(1,ms.reduce((a,m)=>a+m.pts,0)));   // con poche mete il caso pesa: il margine si stringe quando le partite aumentano
    const bad=ms.filter(m=>m.stuck||m.nan||Math.max(m.score[0],m.score[1])!==MATCH_TARGET||Math.min(m.score[0],m.score[1])>=MATCH_TARGET).length;
    return [row('Partite concluse senza blocchi né errori numerici',(n-bad)+' su '+n,bad===0),
      row('Regole del punteggio: si vince a '+MATCH_TARGET,'media sconfitta '+lose.toFixed(1),lose>=1.5&&lose<=6.2,'attesa tra 1,5 e 6,2'),
      row('Lanci completati',pc(cmp),cmp>=0.74&&cmp<=0.93,'attesa tra 74% e 93%'),
      row('Turnover a partita',to.toFixed(1),to>=6&&to<=24,'attesa tra 6 e 24'),
      row('Mete segnate da chi riceve il pull',pc(hold),hold>=0.38-htol&&hold<=0.8+htol,'attesa tra 38% e 80%, con un margine di '+pc(htol)+' per il numero di mete giocate'),
      row('Durata media di una meta',ptT.toFixed(0)+' s',ptT>=10&&ptT<=60,'attesa tra 10 e 60 secondi'),
      row('Ripensamenti: inversioni di corsa di un attaccante senza disco, ogni minuto',rev.toFixed(1),rev<=REV_MAX,'meno di '+REV_MAX+': chi parte per uno scatto lo porta a termine'),
      row('Linee di passaggio verso chi taglia chiuse da un compagno',pc(lane),lane<=LANE_MAX,'al massimo '+pc(LANE_MAX)+': chi finisce un taglio a vuoto esce di lato (taglio a liberare)')];
  }]);
  S.steps.push(['Equilibrio degli schemi',()=>{
    const k=Math.max(4,Math.round(n/2)),ra=ros(62,'a'),rb=ros(62,'b'),res=[];   // 4 partite per coppia: con 3 il T1 esatto (Visione alta) sfiorava il limite per puro caso, con 12 lo scarto vero e' 25-30 punti
    for(const at of SCH_ATT)for(const df of SCH_DEF){
      const ms=run(ra,rb,k,{fix:{sch:{att:at,def:df},opp:{att:at,def:df}}});let g=0,ps=0;
      for(const m of ms){g+=m.score[0]+m.score[1];ps+=m.score[0]+m.score[1]+m.st.to[0]+m.st.to[1];}
      res.push([at+' contro '+df,g/Math.max(1,ps)]);
    }
    res.sort((a,b)=>a[1]-b[1]);const lo=res[0],hi=res[res.length-1];
    return [row('Mete per possesso, la coppia più difficile',lo[0]+': '+pc(lo[1]),lo[1]>=0.12,'almeno 12%'),
      row('Mete per possesso, la coppia più facile',hi[0]+': '+pc(hi[1]),hi[1]<=0.72,'al massimo 72%'),
      row('Nessuno schema domina',('scarto '+pc(hi[1]-lo[1])),hi[1]-lo[1]<=0.45,'scarto massimo 45 punti')];
  }]);
  S.steps.push(['Forza delle squadre: partite giocate e simulate',()=>{
    const out=[],rb=ros(62,'b');let prev=-1,mono=true;
    for(const d of [0,6,12]){
      // almeno 10 partite per scarto: con 6 il caso pesava troppo (i punti di una stessa partita non sono indipendenti) e il controllo falliva a seconda del seme
      const k=Math.max(n,10),ra=ros(62+d,'a'),b0=d===0&&S.base?S.base:[],ms=b0.concat(run(ra,rb,Math.max(0,k-b0.length))),diff=rosterPower(ra)-rosterPower(rb);
      const share=avg(ms.map(m=>m.score[0]/(m.score[0]+m.score[1]))),exp=simPointP(diff),tol=Math.max(0.1,3.4*Math.sqrt(0.25/(k*11)));
      if(share<prev-0.04)mono=false;prev=share;
      out.push(row('Differenza di forza '+diff.toFixed(1)+': punti vinti','giocate '+pc(share)+', simulate '+pc(exp),Math.abs(share-exp)<=tol,'scarto ammesso '+pc(tol)));
    }
    out.push(row('La squadra più forte vince di più',mono?'sì':'no',mono));
    return out;
  }]);
  S.steps.push(['Peso degli attributi',()=>{
    // lo scarto medio di poche partite e' rumoroso (circa 3,3 punti di deviazione a partita): servono almeno 10 partite per lato e un margine
    // di 2,6 deviazioni standard, altrimenti il controllo fallisce o passa per caso
    const k=Math.max(n,10),rb=ros(62,'b'),m0=margin(S.base&&n>=k?S.base:run(ros(62,'a'),rb,k)),out=[],slack=2.6*3.3*Math.sqrt(2/k);
    for(const c of CATS.filter(c=>c.keys.length>1)){
      const ra=ros(62,'a');for(const o of ra)for(const k of c.keys)o.s[k]=Math.min(99,o.s[k]+12);
      const mv=margin(run(ra,rb,k));
      out.push(row(c.name+' +12: scarto medio in punti',(mv>=0?'+':'')+mv.toFixed(1)+' (base '+(m0>=0?'+':'')+m0.toFixed(1)+')',mv>m0-slack,'non deve peggiorare il risultato oltre il margine del caso ('+slack.toFixed(1)+')'));
    }
    return out;
  }]);
  S.steps.push(['Crescita dei giocatori',()=>{
    const gain=age=>{const ro=makeRoster(60,'cresc'+age);let t=0;for(const o of ro){o.age=age;o.dev=1;const b=ovrX(o);for(let i=0;i<15;i++)growBy(o,simParts(o,1),XP_ROLE[posOf(o)]);t+=ovrX(o)-b;}return t/ro.length;};
    const g18=gain(18),g26=gain(26),g34=gain(34),xp=S.base?avg(S.base.map(m=>m.xp)):30;
    const per={};for(const c of CATS){const ro=makeRoster(60,'all'+c.id);let t=0;for(const o of ro){o.age=24;o.dev=1;for(let i=0;i<20;i++)t+=trainCategory(o,c).gain;}per[c.id]=t/ro.length/20;}
    const v=Object.values(per),mx=Math.max(...v),mn=Math.min(...v);
    // anteprima degli allenamenti: i punti attesi (trainExpect) devono corrispondere a quelli che arrivano davvero, in media
    let ex=0,re=0;for(const c of CATS){const ro=makeRoster(60,'exp'+c.id);for(const o of ro){o.age=23;o.dev=1;ex+=trainExpect(o,c,1)*40;for(let i=0;i<40;i++){const cl=Object.assign({},o,{s:Object.assign({},o.s)});re+=trainCategory(cl,c,1).gain;}}}
    return [row('Overall guadagnato in 15 partite (18, 26, 34 anni)','+'+g18.toFixed(1)+', +'+g26.toFixed(1)+', +'+g34.toFixed(1),g18>g26&&g26>g34&&g34>=0&&g18<=6,'i giovani crescono di più'),
      row('Esperienza di una partita giocata e di una simulata',xp.toFixed(1)+' e 30,0',xp>=20&&xp<=38,'devono essere vicine'),
      row('Anteprima degli allenamenti: punti attesi e punti arrivati davvero',ex.toFixed(0)+' e '+re.toFixed(0),Math.abs(ex-re)<=re*0.15,'scarto al massimo del 15%'),
      row('Punti per seduta di allenamento, per indirizzo',CATS.map(c=>c.name+' '+per[c.id].toFixed(2)).join(', '),mx<=mn*2.6,'nessun indirizzo oltre due volte e mezza un altro')];
  }]);
  S.steps.push(['Pull e difesa automatica',()=>{
    const k=Math.max(120,n*40),ra=ros(62,'a'),rb=ros(62,'b'),d0=G.opt.def;
    setSquad(ra);applyRoster(rb);schReset();G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=null;
    newGame();G.lvl=[0,0];G.oppPlus=0;G.idn=[null,null];G.inMatch=true;G.schemeOpen=false;
    // 1) i pull dell'IA: una parte deve uscire, la maggior parte deve arrivare nella meta avversaria
    let brick=0,deep=0;
    for(let i=0;i<k;i++){G.auto=true;placeTeams(i%2);aiPull();if(G.pull.oob)brick++;else if(inEZ(G.pull.spot,G.pull.team))deep++;}
    // 2) le zone delle barre dicono il vero: verde e centro restano in campo, oltre la tacca o di lato si esce
    const pullAt=(c,rel)=>{placeTeams(1);doPull(c,(dirOf(0)>0?0:Math.PI)+rel);return G.pull.oob?1:0;};
    let gOut=0,rOut=0,sOut=0;for(let i=0;i<k;i++){gOut+=pullAt((PULL_G0+PULL_TH)/2,0);rOut+=pullAt(1,0);sOut+=pullAt((PULL_G0+PULL_TH)/2,PULL_SW*0.85);}
    // 3) difesa automatica: il possesso avversario si gioca da solo fino alla meta o al recupero, senza difensore guidato ne' cerchi dell'handblock
    G.opt.def=0;G.auto=false;let goals=0,stuck=0,ctrl=0,hbw=0;const m=Math.max(40,n*10);
    for(let i=0;i<m;i++){
      placeTeams(1);doPull(0.8,dirOf(0)>0?0:Math.PI);G.skip=true;
      let t=0;while(t++<14400&&G.mode==='play'&&G.poss===1){update(1/60);if(G.ctrl)ctrl++;if(hbWindow())hbw++;}
      G.skip=false;
      if(G.mode==='banner'){if(G.banner.team===1)goals++;}else if(G.poss!==0)stuck++;
      G.mode='play';
    }
    G.opt.def=d0;
    // 4) la bravura conta: con Sparo e Lancio alti il pull riesce meglio (e le barre vanno piu' piano); un buon pull vale davvero per chi lo tira
    const humanQ=ps=>{   // chi gioca ferma le barre con un errore di tempo di 70 ms: qualita' del pull (0 fuori, 1 corto, 2 buono, 3 gran pull)
      const cnt=[0,0,0,0],kk=Math.max(1200,n*100);
      for(let i=0;i<kk;i++){placeTeams(1);const p=G.puller;p.s.spa=ps;p.s.lan=ps;const T0=pullPeriod(p,0),T1=pullPeriod(p,1);
        doPull(clamp((PULL_G0+PULL_TH)/2+randn()*0.07/T0,0.12,1),(dirOf(0)>0?0:Math.PI)+randn()*0.07/T1*2*PULL_SW);cnt[G.pull.q]++;}
      return cnt.map(x=>x/kk);
    };
    const lo=humanQ(30),hi=humanQ(90);placeTeams(1);const pl=G.puller;pl.s.spa=30;const per30=pullPeriod(pl,0);pl.s.spa=90;const per90=pullPeriod(pl,0);
    const mm=Math.max(450,n*50),afterPull=c=>{   // mete di chi riceve nel possesso dopo un pull di quel tipo (tira un fuoriclasse: la qualita' e' quella voluta)
      let g=0;for(let i=0;i<mm;i++){
        placeTeams(1);const p=G.puller;p.s.spa=99;p.s.lan=99;doPull(c,dirOf(0)>0?0:Math.PI);G.opt.def=0;G.auto=false;G.skip=true;
        let t=0;while(t++<14400&&G.mode==='play'&&G.poss===1)update(1/60);G.skip=false;if(G.mode==='banner'&&G.banner.team===1)g++;G.mode='play';
      }
      return g/mm;
    };
    const gGran=afterPull((PULL_G0+PULL_TH)/2),gShort=afterPull(0.5),gBrick=afterPull(1);G.opt.def=d0;
    return [row('Pull dell\u2019IA che escono dal campo',pc(brick/k),brick/k>=0.08&&brick/k<=0.35,'attesa tra 8% e 35%'),
      row('Pull dell\u2019IA che arrivano nella meta avversaria',pc(deep/k),deep/k>=0.35,'almeno 35%'),
      row('Pull fermato nel verde e al centro: fuori',pc(gOut/k),gOut/k<=0.04,'al massimo 4%'),
      row('Pull a tutta potenza o verso la linea laterale: fuori',pc(rOut/k)+' e '+pc(sOut/k),rOut/k>=0.6&&sOut/k>=0.9,'almeno 60% e 90%'),
      row('Possessi avversari saltati che arrivano in fondo',(m-stuck)+' su '+m,stuck===0),
      row('Mete avversarie per possesso saltato',pc(goals/m),goals/m>=0.02&&goals/m<=0.85,'attesa tra 2% e 85%: né muro né colabrodo'),
      row('Difesa automatica senza difensore guidato né cerchio dell\u2019handblock',ctrl+hbw===0?'sì':'no',ctrl+hbw===0),
      row('Pull: con Sparo e Lancio alti riesce meglio (Gran pull / fuori, con Sparo e Lancio a 30 e a 90)',pc(lo[3])+' / '+pc(lo[0])+' e '+pc(hi[3])+' / '+pc(hi[0])+'; barra a '+per30.toFixed(1)+' s e '+per90.toFixed(1)+' s',hi[3]-lo[3]>=0.25&&lo[0]-hi[0]>=0.1&&per90>=per30*1.6,'+25 punti di Gran pull, 10 punti di fuori in meno, barra almeno 1,6 volte piu\u2019 lenta'),
      row('Un buon pull vale: mete di chi riceve dopo un Gran pull, un pull corto e un brick',pc(gGran)+', '+pc(gShort)+' e '+pc(gBrick),gGran<=gShort*0.85&&gGran<gBrick,'dopo un Gran pull segna almeno il 15% in meno che dopo un pull corto')];
  }]);
  S.steps.push(['Durata della partita',()=>{
    // partita Competitiva (11 punti): finisce a 11, half time al sesto punto, esperienza per partita vicina a quella di una partita ai 7
    // almeno 8 partite: con 2-3 il rumore del campione portava l'esperienza fuori dalla finestra anche senza cambiare nulla nel gioco
    const ra=ros(62,'a'),rb=ros(62,'b'),k=Math.max(8,n),ms=run(ra,rb,k,{len:11});
    const endOk=ms.every(m=>Math.max(m.score[0],m.score[1])===11&&Math.min(m.score[0],m.score[1])<11&&!m.stuck&&!m.nan),halfOk=ms.every(m=>m.halfAt===6);
    const xpL=avg(ms.map(m=>m.xp)),xp7=S.base?avg(S.base.map(m=>m.xp)):xpL;
    // partite simulate: stessa durata, e chi e' piu' forte vince piu' spesso su una partita lunga (meno caso)
    let w7=0,w15=0;for(let i=0;i<4000;i++){if(simMatch(64,60,0,7).a===7)w7++;const r=simMatch(64,60,0,15);if(r.a===15)w15++;}
    const sim11=simMatch(60,60,0,11),simOk=Math.max(sim11.a,sim11.b)===11&&Math.min(sim11.a,sim11.b)<11;
    return [row('Partita Competitiva: si chiude a 11 e l\u2019half time arriva al sesto punto',endOk&&halfOk?'sì':'no',endOk&&halfOk),
      row('Esperienza di una partita agli 11 e ai 7',xpL.toFixed(1)+' e '+xp7.toFixed(1),xpL>=xp7*0.7&&xpL<=xp7*1.35,'le partite lunghe non fanno crescere di più'),
      row('Partite simulate: agli 11 finiscono a 11; +4 di forza vince ai 7 e ai 15',(simOk?'sì':'no')+'; '+pc(w7/4000)+' e '+pc(w15/4000),simOk&&w15>w7,'la partita lunga premia di più la squadra più forte')];
  }]);
  S.steps.push(['Vento',()=>{
    // almeno 10 partite: con meno, il rumore del campione poteva arrivare ai 16 punti di tolleranza
    const ra=ros(62,'a'),rb=ros(62,'b'),k=Math.max(10,n),cmpOf=ms=>avg(ms.map(m=>(m.st.cmp[0]+m.st.cmp[1])/Math.max(1,m.st.thr[0]+m.st.thr[1])));
    const calm=cmpOf(S.base||run(ra,rb,k)),strong=cmpOf(run(ra,rb,k,{wind:[3,Math.PI/2]})),bad=run(ra,rb,2,{wind:[3,0]}).filter(m=>m.stuck||m.nan).length;
    // deriva di un lancio alto da 40 m col vento forte di lato: grande per chi lancia male, piccola per chi lancia bene
    setWind(3,Math.PI/2);const drift=sk=>{const w=windOn(sk,40,0,40,40/23.4,true,false);return hyp(w.x,w.y);};const dLo=drift(45),dHi=drift(90);
    // il pull va piu' lungo col vento alle spalle
    setSquad(ra);applyRoster(rb);newGame();placeTeams(1);const p=G.puller,land=()=>{const q=pullPlan(p,0,0.8,0);return q.dist+q.wx*dirOf(0);};
    const w0=G.opt.wind;G.opt.wind=false;let offOk=true;for(let i=0;i<50;i++)if(windFor(Math.random)[0]!==0)offOk=false;G.opt.wind=true;let some=false;for(let i=0;i<50;i++)if(windFor(Math.random)[0]>0)some=true;offOk=offOk&&some;G.opt.wind=w0;
    const wxN=[0,0,0];for(let i=0;i<4000;i++)wxN[weatherFor(Math.random)]++;
    const th0=T[0][0],wxDiff=[0,1,2].map(v=>{setWx(v);return catchInfo({kind:'backhand',high:false,sp:THROWS.backhand},{p:T[0][3],d:1},[]).diff;}),wxSig=[0,1,2].map(v=>{setWx(v);return planThrow(th0,th0.x+dirOf(0)*15,th0.y,0).sig;});setWx(0);
    setWind(3,dirOf(0)>0?0:Math.PI);const tail=land();setWind(3,dirOf(0)>0?Math.PI:0);const head=land();setWind(0,0);
    return [row('Lanci completati con calma e con vento forte di lato',pc(calm)+' e '+pc(strong),strong<calm+0.01&&strong>=calm-0.16,'il vento forte toglie al massimo 16 punti'),
      row('Partite con vento forte concluse senza blocchi',(2-bad)+' su 2',bad===0),
      row('Deriva di uno sparo da 40 m (Sparo 45 e Sparo 90)',dLo.toFixed(1)+' m e '+dHi.toFixed(1)+' m',dLo>dHi*1.8&&dLo<=8&&dHi>=0.3,'chi lancia bene compensa'),
      row('Meteo: sereno, pioggia, neve nel sorteggio (4000 prove)',pc(wxN[0]/4000)+', '+pc(wxN[1]/4000)+', '+pc(wxN[2]/4000),wxN[0]/4000>0.57&&wxN[0]/4000<0.67&&wxN[1]/4000>0.22&&wxN[1]/4000<0.30&&wxN[2]/4000>0.09&&wxN[2]/4000<0.15),
      row('Pioggia e neve: la presa e\u2019 piu\u2019 difficile e il lancio meno preciso',wxDiff.map(x=>x.toFixed(3)).join(' < ')+'; sigma x'+wxSig.map(x=>x.toFixed(2)).join(' x'),wxDiff[0]<wxDiff[1]&&wxDiff[1]<wxDiff[2]&&wxSig[0]<wxSig[1]&&wxSig[1]<wxSig[2],'sereno, pioggia, neve'),
      row('Vento spento dalle impostazioni: il sorteggio da\u2019 sempre calma',offOk?'sì':'no',offOk),
      row('Pull con vento alle spalle e controvento',tail.toFixed(0)+' m e '+head.toFixed(0)+' m',tail-head>=10&&tail-head<=24,'tra 10 e 24 metri di differenza')];
  }]);
  S.steps.push(['Timeout',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b');setSquad(ra);applyRoster(rb);G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=null;
    newGame();G.auto=true;G.lvl=[0,0];G.oppPlus=0;G.idn=[null,null];G.xtr=false;G.hint=false;G.inMatch=true;G.schemeOpen=false;applyForm();G.startRec=0;G.nextRec=0;startPoint(0);
    let g=0;while(g++<60*120&&!(G.mode==='play'&&G.holder&&G.holder.t===0&&G.holdT>1&&!G.flight&&!G.walk))update(1/60);
    const ok0=canTimeout(0),ok1=canTimeout(1);G.stallT=7.6;for(const p of T[0])p.st=60;
    const lbBefore=situationLabel(G.holder,8),r1=callTimeout(0),st1=G.stallT,en=T[0].every(p=>p.st===60+TMO_REST),r2=callTimeout(0);
    const t=G.target-1;G.score=[t,t];const uni=situationLabel(G.holder,0),lastT=situationLabel(G.holder,9);G.score=[0,0];
    return [row('Timeout: si puo\u2019 chiamare con il disco in mano, una sola volta; lo stall riparte da zero e la squadra recupera',(ok0&&!ok1&&r1&&!r2&&st1===0&&en)?'sì':'no',ok0&&!ok1&&r1&&!r2&&st1===0&&en,'uno a partita, solo per chi ha il disco'),
      row('Etichetta della situazione sopra il portatore',(lbBefore?lbBefore.txt:'-')+', '+(uni?uni.txt:'-')+', '+(lastT?lastT.txt:'-'),lbBefore&&lbBefore.txt==='STALL 8'&&uni&&uni.txt==='UNIVERSE POINT'&&lastT&&lastT.txt==='ULTIMO LANCIO')];
  }]);
  S.steps.push(['Adattamento della difesa e aderenza agli schemi',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b');setSquad(ra);applyRoster(rb);G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=null;
    newGame();G.auto=true;G.lvl=[0,2];G.oppPlus=0;G.idn=[null,null];G.xtr=false;G.hint=false;G.inMatch=true;G.schemeOpen=false;applyForm();G.startRec=1;G.nextRec=1;
    const mm=Math.max(200,n*30);
    // possessi di chi riceve il pull con uno schema fisso: quota di mete (mete / (mete + turnover)) quando e' il primo possesso con quello schema e quando e' il quarto di fila
    const rate=(sch,def,N)=>{let g=0,tn=0;for(let i=0;i<mm;i++){
      placeTeams(0);G.sch.att=sch;G.opp.def=def;G.rep=[{k:sch,n:N-1},{k:'',n:0}];
      const p=G.puller;p.s.spa=99;p.s.lan=99;doPull(0.62,dirOf(1)>0?0:Math.PI);G.skip=true;
      let t=0;while(t++<14400&&G.mode==='play'&&G.poss===0)update(1/60);G.skip=false;
      if(G.mode==='banner'&&G.banner.team===0)g++;else if(G.poss===1)tn++;G.mode='play';}
      return [g,g+tn];};
    const out=[];
    let a1=0,b1=0,a4=0,b4=0;   // contro la marcatura a uomo (la zona si adatta meno): vert, hex e side
    for(const [sch,def] of [['vert','man_out'],['hex','man_in'],['side','man_out']]){const x=rate(sch,def,1),y=rate(sch,def,4);a1+=x[0];b1+=x[1];a4+=y[0];b4+=y[1];}
    const r1=a1/Math.max(1,b1),r4=a4/Math.max(1,b4);
    out.push(row('Stesso schema di fila: mete per possesso al primo e al quarto possesso (vert, hex e side contro la marcatura a uomo)',pc(r1)+' e '+pc(r4),r4<=r1*0.88&&r4>=r1*0.4,'dal quarto di fila la difesa lo legge: tra il 12% e il 60% in meno'));
    G.rep=[{k:'vert',n:1},{k:'vert',n:1}];const first=adaptOf(0);G.rep=[{k:'vert',n:9},{k:'vert',n:9}];const top=adaptOf(0);G.lvl=[0,0];const easy=adaptOf(0);G.lvl=[0,2];
    out.push(row('Adattamento: nessuno al primo possesso, massimo dopo molte ripetizioni, nessuno contro l\u2019IA Facile',first.toFixed(2)+', '+top.toFixed(2)+', '+easy.toFixed(2),first===0&&top>0.5&&easy===0));
    G.rep=[{k:'',n:0},{k:'',n:0}];
    // aderenza: chi vede bene segue lo schema esattamente, chi vede poco quasi sempre
    const lowA=adhOf({s:{vis:40}}),hiA=adhOf({s:{vis:85}});
    out.push(row('Aderenza allo schema con Visione 40 e 85',pc(lowA)+' e '+pc(hiA),lowA>=0.75&&lowA<0.9&&hiA===1,'a Visione alta esattamente come disegnato, a Visione bassa non perfetto'));
    // T1: il primo passaggio dopo l'apertura va a C4, come da schema: chi ha Visione alta lo fa piu' spesso (anche con un difensore vicino)
    const t1c4=vis=>{for(const q of SQ)q.s.vis=vis;let c4=0,tot=0;
      for(let i=0;i<Math.max(60,n*10);i++){placeTeams(0);G.sch.att='t1';G.opp.def='man_out';G.rep=[{k:'',n:0},{k:'',n:0}];
        const p=G.puller;p.s.spa=99;p.s.lan=99;doPull(0.62,dirOf(1)>0?0:Math.PI);G.skip=true;
        let t=0,seen=false;while(t++<3600&&G.mode==='play'&&G.poss===0&&!seen){update(1/60);const pb=G.pb&&G.pb[0],f=G.flight;
          if(pb&&pb.id==='t1'&&pb.phase===0&&f&&f.team===0&&pb.role[f.thrower.id]==='H1'&&f.intended){seen=true;tot++;if(pb.role[f.intended.id]==='C4')c4++;}}
        G.skip=false;G.mode='play';}
      return c4/Math.max(1,tot);};
    const lo=t1c4(30),hi=t1c4(90);
    out.push(row('T1: quota dei primi passaggi a C4 (come da schema) con Visione 30 e 90',pc(lo)+' e '+pc(hi),hi>=lo+0.1&&hi>=0.4,'a Visione alta lo schema e\u2019 eseguito piu\u2019 alla lettera'));
    return out;
  }]);
  S.steps.push(['Cambia tutti e 7',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b');setSquad(ra);applyRoster(rb);G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=null;
    newGame();G.inMatch=true;placeTeams(0);
    const first=new Set(lineupIds()),set=ids=>[...ids].sort((a,b)=>a-b).join(),healthy=SQ.filter(p=>!p.inj).length;
    // 1) i 7 piu' forti sono in campo: entrano i secondi 7 (nessuno dei primi), con 3 handler e 4 cutter
    const b1=blockIds(false),out1=b1&&b1.every(id=>!first.has(id)),roles=b1?b1.map(id=>SQ[id].role).sort().join(''):'';
    const top7=pickSeven(SQ,p=>p.role,ovrX).map(p=>p.id),rest=pickSeven(SQ.filter(p=>!top7.includes(p.id)),p=>p.role,ovrX).map(p=>p.id);
    const okSecond=!!b1&&set(first)===set(top7)&&set(b1)===set(rest);
    // 2) premendolo di nuovo tornano i primi 7
    setLineup(b1);const b2=blockIds(false),okBack=!!b2&&set(b2)===set(first);
    // 3) un infortunato in panchina non entra; con meno di 7 sani in panchina entrano tutti e restano i migliori
    setLineup([...first]);const hurt=SQ.find(p=>!first.has(p.id));hurt.inj=2;const b3=blockIds(true),okInj=!!b3&&!b3.includes(hurt.id)&&b3.length===7;hurt.inj=0;
    const bench=SQ.filter(p=>!first.has(p.id));bench.slice(0,bench.length-3).forEach(p=>{p.inj=1;});const b4=blockIds(false);
    const okFew=!!b4&&b4.length===7&&new Set(b4).size===7&&bench.slice(-3).every(p=>b4.includes(p.id));bench.forEach(p=>{p.inj=0;});
    // 4) senza nessuno in panchina non c'e' niente da cambiare
    const all=SQ.slice();SQ.length=7;setLineup(SQ.map(p=>p.id));const none=blockIds(false)===null;all.forEach((p,i)=>{SQ[i]=p;});
    setLineup([...first]);
    return [row('Cambia tutti e 7: entrano i secondi 7 più forti (3 handler e 4 cutter) e premendolo di nuovo tornano i primi',(okSecond&&out1?'sì':'no')+', '+roles+', '+(okBack?'tornano':'non tornano'),okSecond&&out1&&roles==='CCCCHHH'&&okBack&&healthy>=14),
      row('Cambia tutti e 7: salta gli infortunati; con meno di 7 in panchina entrano tutti; senza panchina non fa nulla',(okInj?'sì':'no')+', '+(okFew?'sì':'no')+', '+(none?'sì':'no'),okInj&&okFew&&none)];
  }]);
  S.steps.push(['Compagni lontani dal portatore e tuffi che finiscono',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b');setSquad(ra);applyRoster(rb);G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=null;
    newGame();G.auto=true;G.lvl=[0,0];G.oppPlus=0;G.idn=[null,null];G.xtr=false;G.hint=false;G.inMatch=true;G.schemeOpen=false;applyForm();G.startRec=0;G.nextRec=0;startPoint(0);
    let g=0;while(g++<60*120&&!(G.mode==='play'&&G.holder&&G.holder.t===0&&G.holdT>1&&!G.flight&&!G.walk))update(1/60);
    // 1) un compagno attaccato al portatore con un taglio che gli passa sopra: non deve restargli addosso
    let near=99,n1=0;
    for(let k=0;k<8&&n1<20;k++){   // l'IA lancia in fretta: si riprova con i portatori successivi finche' ci sono abbastanza fotogrammi da misurare
      let w=0;while(w++<60*40&&!(G.mode==='play'&&G.holder&&G.holder.t===0&&!G.flight&&!G.walk))update(1/60);
      const h=G.holder,d=dirOf(0),q=h&&T[0].find(x=>x!==h);if(!h)break;
      q.x=h.x-d*1.8;q.y=clamp(h.y+0.5,3,FIELD_W-3);q.vx=q.vy=0;q.cs='cut';q.tx=h.x+d*12;q.ty=h.y;q.cutT=3;q.cmd=null;
      for(let i=0;i<60*3&&G.holder===h&&!G.flight;i++){update(1/60);if(i>=12&&G.holder===h&&!G.flight){n1++;for(const m of T[0])if(m!==h)near=Math.min(near,hyp(m.x-h.x,m.y-h.y));}}
      let z=0;while(z++<60*5&&G.flight)update(1/60);
    }
    const okNear=n1>=5&&near>=TEAM_R-0.5;
    // 2) in una partita intera di un punto: nessun compagno resta sotto i 2,5 m dal portatore
    let minP=99,fr=0;
    for(let k=0;k<6&&fr<=30;k++){   // se il punto in corso finisce subito (dipende dal seme) se ne gioca un altro: servono abbastanza fotogrammi con il disco in mano
      if(k>0){G.mode='ready';startPoint(G.nextRec);}
      g=0;while(g++<60*90&&(G.mode==='play'||G.mode==='ready')){update(1/60);const H=G.holder;if(H&&G.mode==='play'&&!G.flight&&!G.walk&&G.holdT>0.5){fr++;for(const m of T[H.t])if(m!==H)minP=Math.min(minP,hyp(m.x-H.x,m.y-H.y));}}
    }
    // 3) un tuffo senza chiusura (intercetto lungo la traiettoria, Salta) non lascia nessuno a terra
    const p1=T[0][2],p2=T[0][3],p3=T[1][1];
    p1.dv={t0:0,dir:1,end:null};G.dive=null;update(1/60);const orph=p1.dv.end!==null;
    p2.dv={t0:0,dir:1,end:null};G.dive={p:p2,qual:1,color:'green'};G.diveWin={p:p2};endDive();const ended=p2.dv.end!==null&&G.dive===null&&G.diveWin===null;
    p3.dv={t0:0,dir:1,end:null};placeTeams(0);const reset=!p3.dv&&!p1.dv&&!p2.dv;
    return [row('Compagno attaccato al portatore con un taglio che gli passa sopra',near.toFixed(1)+' m',okNear,'almeno '+(TEAM_R-0.5).toFixed(1)+' m'),
      row('Distanza minima dei compagni dal portatore in un punto intero',fr>30?minP.toFixed(1)+' m':'-',fr>30&&minP>=2.5,'mai sotto 2,5 m'),
      row('Tuffo senza chiusura: il giocatore si rialza (nessuno steso per tutta la partita)',(orph?'sì':'no')+', '+(ended?'sì':'no')+', '+(reset?'sì':'no'),orph&&ended&&reset,'rete di sicurezza, endDive e nuovo punto')];
  }]);
  S.steps.push(['Brick e partenza dal centro dopo il pull',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b');setSquad(ra);applyRoster(rb);schReset();G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=null;
    newGame();G.auto=true;G.lvl=[0,0];G.oppPlus=0;G.idn=[null,null];G.xtr=false;G.hint=false;G.inMatch=true;G.schemeOpen=false;applyForm();setWind(0,0);
    const fwd=dirOf(0)>0?0:Math.PI,K=12,tick=(max,stop)=>{let g=0;while(g++<max&&!stop())update(1/60);return g/60;};
    // BRICK: pull fuori dal campo (di lato). Appena il disco e' preso tutti sono al loro posto: i difensori accanto al loro uomo, nessuna attesa
    let bOk=0,bFar=0,bWait=0;
    for(let i=0;i<K;i++){
      placeTeams(1);doPull(0.99,fwd+(i%2?1.25:-1.25));if(!G.pull||!G.pull.oob)continue;
      tick(60*12,()=>!G.pull&&!!G.holder);
      const h=G.holder,d=T[1-G.poss];if(!h||!G.brick||G.open)continue;
      bOk++;if(d.some(q=>!q.mark||hyp(q.x-q.mark.x,q.y-q.mark.y)>3.2))bFar++;
      const t=tick(60*6,()=>G.holder!==h||G.mode!=='play');if(t>=4.5)bWait++;   // l'IA lancia entro pochi secondi, non aspetta la difesa (misurato su 40 brick: da 1,1 a 3,3 s, in genere 2,7 s, il tempo normale di uno schema che parte; con 3 s di soglia un solo brick lento faceva fallire il controllo). Il conto si ferma quando il portatore perde il disco, anche se il lancio viene murato sul nascere (handblock: il disco passa subito alla difesa senza volo): prima quel caso, circa 1 seme su 20, contava come attesa lunghissima
    }
    // PARTENZA DAL CENTRO: dopo il pull chi ha il disco lontano dal centro passa all'handler centrale; nessuno taglia finche' il disco non e' a lui
    let pN=0,pH1=0,pC=0,pCut=0,pGo=0,pT=0;
    for(let i=0;i<K;i++){
      placeTeams(1);doPull(0.8,fwd);if(!G.pull||G.pull.oob)continue;
      tick(60*12,()=>!G.pull&&!!G.holder);const h=G.holder;if(!h||h.t!==1)continue;
      h.y=i%2?4:FIELD_W-4;h.vx=h.vy=0;G.pb[1]=null;startPlay(1);const pb=G.pb[1];if(!pb||!pb.prep)continue;
      pN++;let cut=false;
      const t=tick(60*8,()=>{if(pb.stage!=='set')cut=true;return !!G.flight;});if(!G.flight)continue;
      pT+=t;if(cut)pCut++;
      if(pb.role[G.flight.intended&&G.flight.intended.id]==='H1')pH1++;if(Math.abs(G.flight.ty-MID)<=PB_CENTER+1)pC++;
      tick(60*6,()=>!G.flight);if(G.holder&&G.holder.t===1&&pb.active&&!pb.prep){tick(60*3,()=>pb.stage==='go');if(pb.stage==='go')pGo++;}
    }
    return [row('Brick: difensori accanto al loro uomo appena si riparte, e l\u2019attacco lancia entro 4,5 secondi',bOk+' brick, '+bFar+' difese fuori posto, '+bWait+' attese',bOk>=Math.max(2,K/2-2)&&bFar===0&&bWait===0,'nessuna attesa'),
      row('Partenza dal centro: chi ha preso il pull lontano dal centro passa all\u2019handler centrale',pH1+' su '+pN+', vicino al centro '+pC,pN>=K-3&&pH1>=pN*0.75&&pC>=pN*0.75,'il primo passaggio va al centro'),
      row('Partenza dal centro: nessun taglio prima del passaggio, poi lo schema parte',(pCut?pCut+' tagli in anticipo':'nessun taglio in anticipo')+', parte '+pGo+' volte su '+pH1+(pN?' (passaggio dopo '+(pT/pN).toFixed(1)+' s)':''),pCut===0&&pGo>=pH1*0.7&&pN>0&&pT/pN<=4,'passaggio entro 4 s')];
  }]);
  S.steps.push(['Mira e chiamate',()=>{
    // il giocatore mira una zona libera con il dito che trema (e ogni tanto sfiora un compagno): il compagno chiamato deve correrci senza ripensamenti
    const ra=ros(62,'a'),rb=ros(62,'b');setSquad(ra);applyRoster(rb);G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=null;
    newGame();G.auto=true;G.lvl=[0,0];G.oppPlus=0;G.idn=[null,null];G.xtr=false;G.hint=false;G.inMatch=true;G.schemeOpen=false;applyForm();G.startRec=0;G.nextRec=0;startPoint(0);
    let g=0;while(g++<60*120&&!(G.mode==='play'&&G.holder&&G.holder.t===0&&G.holdT>1.5&&!G.flight))update(1/60);
    const th=G.holder,d=dirOf(0);let swaps=0,rev=0,ended=0,prevQ=null,pv=null,moved=99,sx=null,ok=!!th;
    if(ok){
      G.auto=false;   // adesso decide il giocatore: l'azione aspetta il lancio
      // una zona libera davvero: nessun compagno agganciato dal mirino, ma uno abbastanza vicino da essere chiamato
      let zx=clamp(th.x+d*24,6,FIELD_L-6),zy=th.y<MID?MID+8:MID-8,found=false;
      // prima in avanti, poi di lato e indietro: appena dopo il pull i compagni possono essere tutti alle spalle del portatore (prima, senza zona, il controllo passava solo se un compagno ci arrivava per caso)
      for(const ax of [24,18,30,14,10,6,2,-4,-10])for(const ay of [-12,-8,8,12,-4,4,0,-16,16]){
        if(found)continue;const x=clamp(th.x+d*ax,6,FIELD_L-6),y=clamp(th.y+ay,4,FIELD_W-4);let nd=99;for(const q of T[0])if(q!==th)nd=Math.min(nd,hyp(q.x-x,q.y-y));
        if(!computeAim(th,x,y,false,true).intended&&nd>=5&&nd<=callMax(th)-3&&hyp(x-th.x,y-th.y)>=8){zx=x;zy=y;found=true;}
      }
      for(let i=0;i<60*4&&G.holder===th&&!G.flight;i++){
        const j=Math.sin(i*0.9)*2.2,jx=zx+j,jy=zy+Math.cos(i*1.3)*2.2;
        // ogni tanto il mirino sfiora per un attimo un compagno vicino: la chiamata non deve cadere
        const q0=G.call&&G.call.q;let wx=jx,wy=jy;if(q0&&i%40>=20&&i%40<26){wx=q0.x;wy=q0.y;}
        updateCall(th,wx,wy,false);
        const c=G.call;if(c){if(prevQ&&prevQ!==c.q)swaps++;prevQ=c.q;}else if(prevQ&&i>6){ended++;prevQ=null;}
        update(1/60);
        const q=G.call&&G.call.q;
        if(q){if(!sx)sx=[q.x,q.y];const sp=hyp(q.vx,q.vy);if(i>=24&&pv&&sp>2.5&&hyp(pv[0],pv[1])>2.5&&(pv[0]*q.vx+pv[1]*q.vy)/(sp*hyp(pv[0],pv[1]))<-0.5)rev++;if(i%6===0)pv=[q.vx,q.vy];moved=hyp(q.x-G.call.x,q.y-G.call.y);}
      }
    }
    // portata della chiamata secondo la Visione, e un solo chiamato: il piu' veloce ad arrivare, non il piu' vicino
    let cm=[0,0,0,0],pick='-',pickOk=false;
    if(ok){
      const sv=th.s.vis;cm=[25,40,60,90].map(v=>{th.s.vis=v;return Math.round(callMax(th));});th.s.vis=99;
      const [q1,q2]=T[0].filter(q=>q!==th),px=th.x+d*12,py=th.y<MID?th.y+6:th.y-6;
      for(const q of T[0])if(q!==th){q.x=th.x-d*16;q.y=th.y;q.vx=0;q.vy=0;}
      Object.assign(q1.s,{vel:25,sca:25});Object.assign(q2.s,{vel:99,sca:99});
      q1.x=px-d*7;q1.y=py;q2.x=px-d*9;q2.y=py;G.call=null;
      updateCall(th,px,py,false);pick=G.call?(G.call.q===q2?'il veloce (piu\u2019 lontano)':(G.call.q===q1?'il lento (piu\u2019 vicino)':'altro')):'nessuno';pickOk=!!G.call&&G.call.q===q2;
      th.s.vis=sv;
    }
    return [row('Portata della chiamata con Visione 25, 40, 60 e 90',ok?cm.join(', ')+' m':'-',ok&&cm.join()==='10,10,14,20','10 m fino a 40, 14 m a 60, 20 m da 90 in su'),
      row('Chiamata: sceglie chi arriva prima, non il piu\u2019 vicino',ok?pick:'-',ok&&pickOk,'un solo compagno, il piu\u2019 veloce a raggiungere la zona'),
      row('Chiamata a una zona libera con il dito che trema: cambi di compagno e chiamate cadute',ok?swaps+' e '+ended:'partita non pronta',ok&&swaps<=1&&ended===0,'al massimo un cambio (un compagno arrivato molto piu\u2019 vicino), nessuna chiamata caduta'),
      row('Chiamata: inversioni di corsa del compagno e distanza dal punto chiamato dopo 4 secondi',ok?rev+' e '+moved.toFixed(1)+' m':'-',ok&&rev<=1&&moved<=6,'arriva al punto e ci resta (al massimo un ripensamento)')];
  }]);
  S.steps.push(['Gittata, fiducia e cognomi',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b');setSquad(ra);applyRoster(rb);newGame();setWind(0,0);placeTeams(1);
    const th=T[0][0],d=dirOf(0),spa0=th.s.spa,cut=T[0].find(q=>q.role==='C')||T[0][3];
    // 1. gittata: Sparo 20 non arriva a 60 m (il disco cade corto), Sparo 99 si', e i limiti seguono lo Sparo
    th.s.spa=20;const lo=planThrow(th,th.x+d*60,th.y,0),mxLo=throwMax(th);
    th.s.spa=99;const hi=planThrow(th,th.x+d*90,th.y,0),mxHi=throwMax(th);
    // 2. i compagni: tagli lunghi (frequenza e distanza) con un lanciatore debole, forte, forte e con tanta intesa
    const deepStat=(spa,duo)=>{
      th.s.spa=spa;G.duo=duo?{[duoKey(th.full||th.name,cut.full||cut.name)]:1}:{};
      let n=0,dp=0,tot=0;const H={x:th.x,y:th.y,s:th.s,t:0,full:th.full,name:th.name};
      for(let i=0;i<2500;i++){const c=pickCut(cut,Object.assign(H,{}),d,'vert',0);if(c.deep){n++;tot+=(c.x-th.x)*d;}}
      return {f:n/2500,dist:n?tot/n:0};
    };
    const w=deepStat(25,0),f0=deepStat(90,0),f1=deepStat(90,1);G.duo={};
    // 3. l'IA non lancia dove il disco non arriva: Sparo 20, un compagno libero a 55 m e uno coperto a 10 m
    th.s.spa=20;let farPick=0;const far=T[0][1],near=T[0][2];
    for(const q of T[0])if(q!==th&&q!==far&&q!==near){q.x=th.x-d*6;q.y=th.y+8;}
    for(let i=0;i<200;i++){far.x=th.x+d*55;far.y=th.y;near.x=th.x+d*10;near.y=th.y+6;T[1].forEach((q,j)=>{q.x=near.x+(j%2?1:-1)*0.8;q.y=near.y+0.3*j;});if(aiPick(th).best===far)farPick++;}
    th.s.spa=spa0;
    // 3b. Lancio e Visione: il disco di chi ha piu' Lancio viaggia piu' veloce; chi ha piu' Visione decide prima
    const lan0=th.s.lan,vis0=th.s.vis;th.s.lan=30;const tL=planThrow(th,th.x+d*20,th.y,0).T;th.s.lan=99;const tH=planThrow(th,th.x+d*20,th.y,0).T;th.s.lan=lan0;
    const thk=v=>{th.s.vis=v;let t=0;for(let i=0;i<400;i++)t+=thinkFor(0,1,1,th);return t/400;};const kLo=thk(30),kHi=thk(99);th.s.vis=vis0;
    // 4. cognomi in partita: solo il cognome, con l'iniziale se due compagni lo condividono; i giocatori inventati restano col nome
    const lst=[{sur:'Rossi',label:'Mario Rossi',name:'Mario'},{sur:'Rossi',label:'Luca Rossi',name:'Luca'},{sur:'Bianchi',label:'Anna Bianchi',name:'Anna'},{sur:'',label:'Pippo',name:'Pippo'},{sur:'Spaccapanico Proietti',label:'Ugo Spaccapanico Proietti',name:'Ugo'},{sur:'De Luca',label:'Ada De Luca',name:'Ada'}];applySurnames(lst);
    const nm=lst.map(o=>o.name).join('|');
    return [row('Gittata col Sparo: massimo a Sparo 20 e a Sparo 99',Math.round(mxLo)+' m e '+Math.round(mxHi)+' m',mxLo<=32&&mxHi>=96,'20 non spara lontano, 99 fa tutto il campo'),
      row('Lancio da 60 m con Sparo 20 (cade corto) e da 90 m con Sparo 99',(lo.short?'corto':'ok')+' e '+(hi.short?'corto':'ok'),lo.short&&lo.dist<=mxLo+0.01&&!hi.short),
      row('Tagli lunghi con lanciatore debole, forte, forte e affiatato',pc(w.f)+', '+pc(f0.f)+', '+pc(f1.f),w.f<f0.f*0.7&&f0.f<f1.f,'chi lancia lontano e conosce i compagni fa partire piu\u2019 tagli lunghi'),
      row('Distanza media dei tagli lunghi con lanciatore debole e forte',w.dist.toFixed(0)+' m e '+f0.dist.toFixed(0)+' m',w.dist<=30&&f0.dist>=38,'il corridore si ferma dove il lancio arriva'),
      row('L\u2019IA con Sparo 20 lancia al compagno libero a 55 m',farPick+' su 200',farPick<=4,'non lancia dove il disco non arriva'),
      row('Tempo di volo di un lancio da 20 m con Lancio 30 e con Lancio 99',tL.toFixed(2)+' s e '+tH.toFixed(2)+' s',tL>tH*1.03&&tL<tH*1.12,'chi lancia meglio lancia piu\u2019 veloce'),
      row('Tempo di decisione con Visione 30 e con Visione 99 (1 = standard)',kLo.toFixed(2)+' e '+kHi.toFixed(2),kLo>1.05&&kHi<0.9&&kLo<1.2,'chi vede meglio decide prima'),
      row('Cognomi in partita',nm,nm==='Rossi M.|Rossi L.|Bianchi|Pippo|Spaccapanico|De Luca')];
  }]);
  S.steps.push(['Duelli e letture dell\u2019IA',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b');setSquad(ra);applyRoster(rb);newGame();setWind(0,0);placeTeams(1);
    // 1. duello: stessi giocatori, cambia solo la qualita' del lancio (errore di 0,3 m o di 4 m) e la rincorsa di chi riceve
    const A=T[0][3],D=T[1][3];A.vx=A.vy=D.vx=D.vy=0;A._t=D._t=0;
    const fl=err=>({high:true,sp:THROWS.huck,err,intended:A}),R=()=>2,o=(p)=>({p,d:1});
    const good=duelScore(fl(0.3),o(A),o(D),R),bad=duelScore(fl(4),o(A),o(D),R);
    A.vx=7;const runUp=duelScore(fl(0.3),o(A),o(D),R);A.vx=0;
    // 1b. chiamata rapida a un handler alle spalle del disco: scarico (reset) dietro al disco, non un taglio lungo
    const hd=T[0].find(q=>q.role==='H'&&q!==T[0][0])||T[0][1],h0=T[0][0],d0=dirOf(0);G.holder=h0;G.flight=null;G.walk=null;G.poss=0;
    h0.x=40;h0.y=MID;hd.x=h0.x-d0*5;hd.y=MID+7;const rk=callCut(hd,'auto'),rOk=rk==='reset'&&hd.cmd&&(hd.cmd.x-h0.x)*d0<0&&Math.abs(hd.cmd.y-h0.y)>=5;hd.cmd=null;G.holder=null;
    // 2. IA difficile (squadra rossa) con il disco: un compagno libero a 36 m e uno libero a 12 m. Avanti di 3 punti, sotto di 3, vento forte alle spalle, vento forte contro
    G.lvl=[0,2];const th=T[1][0],dr=dirOf(1),far=T[1][1],near=T[1][2];th.s.spa=88;
    const scene=()=>{th.x=50;th.y=MID;far.x=th.x+dr*36;far.y=MID+3;near.x=th.x+dr*12;near.y=MID-7;far.vx=far.vy=near.vx=near.vy=0;
      for(const q of T[1])if(q!==th&&q!==far&&q!==near){q.x=th.x-dr*7;q.y=MID+9;}
      T[0].forEach((q,j)=>{q.x=th.x-dr*(10+j);q.y=4+j*4;q.vx=q.vy=0;});T[0][0].x=far.x-dr*5.5;T[0][0].y=far.y;T[0][1].x=near.x-dr*5.5;T[0][1].y=near.y;G.marker=null;G.stallT=1;};
    const deepShare=()=>{let k=0;for(let i=0;i<300;i++){scene();if(aiPick(th).best===far)k++;}return k/300;};
    G.score=[1,4];const ahead=deepShare();G.score=[4,1];const behind=deepShare();G.score=[2,2];
    setWind(3,dr>0?0:Math.PI);const tail=deepShare();setWind(3,dr>0?Math.PI:0);const head=deepShare();setWind(0,0);G.score=[0,0];G.lvl=[0,0];
    return [row('Duello sul disco alto: punteggio di chi riceve con un lancio preciso e con uno sbagliato di 4 m',good.sa.toFixed(0)+' e '+bad.sa.toFixed(0),good.sa-bad.sa>=5&&good.sd===bad.sd,'il lancio preciso aiuta chi riceve'),
      row('Duello: vantaggio di chi arriva di corsa rispetto a chi salta da fermo','+'+(runUp.sa-good.sa).toFixed(1),runUp.sa-good.sa>=2&&runUp.sa-good.sa<=5),
      row('Chiamata rapida a un handler dietro al disco',rk+(rOk?': scarico dietro al disco, sul lato':': non valido'),rOk),
      row('IA con il disco: lanci lunghi quando è avanti di 3 e quando è sotto di 3',pc(ahead)+' e '+pc(behind),behind>ahead+0.08,'chi è avanti rischia meno'),
      row('IA con il disco: lanci lunghi con vento forte alle spalle e contro',pc(tail)+' e '+pc(head),tail>head+0.08,'controvento si gioca corto')];
  }]);
  S.steps.push(['Specializzazioni e intesa',()=>{
    // 200 sedute di Tecnica con e senza indirizzo «Regista»: il vantaggio c'e', ma cala con l'eta'
    const gainOf=(age,spec)=>{let t=0;for(let i=0;i<200;i++){const o=makeRoster(60,'spt|'+i)[0],pl={s:Object.assign({},o.s),tl:o.tl,tf:o.tf,tv:o.tv,age,dev:1,full:'s'+i,name:'s'+i,spec:spec||undefined};t+=trainCategory(pl,CATS[0],1).gain;}return t/200;};
    const rY=gainOf(19,'reg')/gainOf(19),rO=gainOf(33,'reg')/gainOf(33);
    // intesa: simmetrica, solo per la tua squadra e con effetti contenuti
    G.duo={[duoKey('Anna','Bruno')]:1};const a1={t:0,full:'Anna'},b1={t:0,full:'Bruno'},c1={t:1,full:'Bruno'};
    const sym=duoOf(a1,b1)===1&&duoOf(b1,a1)===1,mine=duoOf(a1,c1)===0;G.duo={};
    return [row('Specializzazione: punti in più per seduta a 19 anni',(rY>=1?'+':'')+Math.round((rY-1)*100)+'%',rY>=1.1&&rY<=1.35,'tra +10% e +35%'),
      row('Specializzazione: vantaggio a 33 anni, più basso di quello a 19',(rO>=1?'+':'')+Math.round((rO-1)*100)+'%',rO<rY&&rO<=1.16,'rendimenti decrescenti con l’età'),
      row('Intesa: simmetrica, solo per la tua squadra, bonus contenuti',sym&&mine?'sì':'no',sym&&mine&&DUO_SIG<=0.12&&DUO_DROP<=0.35)];
  }]);
  S.steps.push(['Pacchetti di Ultimate Team',()=>{
    // 3000 pacchetti da 5 per qualita': la qualita' deve contare davvero, le garanzie valere sempre, il paracadute evitare lunghe serie sfortunate
    const avgQ=[],gRar=[],gEpi=[];let worst=0;
    for(let q=0;q<=6;q++){let t=0,ok2=true,ok6=true,pity=0,run=0;
      for(let i=0;i<3000;i++){const pk=utPackTiers(q,5,pity,Math.random);pity=pk.pity;const mx=Math.max(...pk.tiers);
        if(q>=2&&mx<2)ok2=false;if(q>=6&&mx<3)ok6=false;run=mx>=3?0:run+1;worst=Math.max(worst,run);
        for(const x of pk.tiers)t+=utTierOvr(x,Math.random);}
      avgQ.push(t/15000);gRar.push(ok2);gEpi.push(ok6);}
    const mono=avgQ.every((v,i)=>i===0||v>avgQ[i-1]+0.3);
    return [row('Overall medio delle carte per qualità del pacchetto (0-6)',avgQ.map(v=>v.toFixed(0)).join(', '),mono&&avgQ[6]-avgQ[0]>=12,'cresce a ogni qualità, di almeno 12 punti in tutto'),
      row('Garanzie: un Raro dalla qualità 2, un Epico nel pacchetto dei campioni',gRar.every(Boolean)&&gEpi.every(Boolean)?'sempre':'no',gRar.every(Boolean)&&gEpi.every(Boolean)),
      row('Pacchetti di fila senza Epici, al massimo',String(worst),worst<UT_PITY,'meno di '+UT_PITY)];
  }]);
  S.steps.push(['Potenziamenti di Ultimate Team',()=>{
    // 400 carte: ognuna riceve i quattro potenziamenti permessi su linee a caso. Il tetto vale, il guadagno e' contenuto e le carte restano diverse tra loro
    let over=0,gainT=0,n=0,diff=0;const cards=[];
    for(let i=0;i<400;i++){
      const rng=mulberry32(900+i),o=makeRoster(utTierOvr(2,rng),'upg|'+i)[i%2?0:6],p={s:Object.assign({},o.s),r:i%2?'H':'C'};p.ovr=ovr(p);const o0=p.ovr;let done=0;
      for(let k=0;k<8;k++){const l=Object.keys(UT_LINES)[Math.floor(rng()*4)];if(!utUpWhy(p,l)){utDoUp(p,l);done++;}}
      if(done>UT_UP_MAX||(p.up|0)>UT_UP_MAX||Object.values(p.ul).some(v=>v>UT_UP_LINE))over++;
      gainT+=p.ovr-o0;n++;cards.push(p);
    }
    // due carte della stessa forza ma con potenziamenti diversi: quanto differiscono le loro statistiche (media delle differenze assolute)
    const base=makeRoster(70,'upg|base')[6],A={s:Object.assign({},base.s),r:'C'},B={s:Object.assign({},base.s),r:'C'};A.ovr=ovr(A);B.ovr=ovr(B);utDoUp(A,'t');utDoUp(A,'t');utDoUp(B,'a');utDoUp(B,'d');
    for(const k of KEYS)diff+=Math.abs(A.s[k]-B.s[k]);diff/=KEYS.length;
    const gain=gainT/n;
    return [row('Nessuna carta supera 4 potenziamenti, né 2 per linea',over?over+' carte fuori limite':'rispettato',over===0),
      row('Overall guadagnato con 4 potenziamenti, in media',(gain>=0?'+':'')+gain.toFixed(1),gain>=2&&gain<=9,'tra +2 e +9'),
      row('Due carte della stessa forza con potenziamenti diversi: differenza media per statistica',diff.toFixed(1),diff>=1.5,'almeno 1,5 punti: restano diverse')];
  }]);
  S.steps.push(['Real player di Ultimate Team',()=>{
    // punti Elo, scelta dell'avversario per punti e squadre scaricate da internet (dati di cui non ci si fida)
    const pts=[0,500,1000,2500,4900],bounds=pts.every(a=>pts.every(b=>{const w=utoDelta(a,b,true),l=utoDelta(a,b,false);return w>=1&&w<=UTO_K&&l<=-1&&l>=-UTO_K;}));
    const up=utoDelta(1000,1400,true),dn=utoDelta(1000,600,true),eqW=utoDelta(1000,1000,true),eqL=utoDelta(1000,1000,false);
    const pool=[];for(let i=0;i<300;i++)pool.push({id:'u'+i,p:Math.round(Math.random()*3000),pw:60});
    let dsum=0,bad=0;const K=400;
    for(let i=0;i<K;i++){const me=pool[i%pool.length],o=utoPickOpp(pool,me.id,me.p,'',Math.random);if(!o||o.id===me.id)bad++;else dsum+=Math.abs(o.p-me.p);}
    const avgOpp=p=>{let t=0;for(let i=0;i<200;i++)t+=utoPickOpp(pool,'me',p,'',Math.random).p;return t/200;};
    const a1=avgOpp(500),a2=avgOpp(1500),a3=avgOpp(2500);
    const two=[{id:'a',p:1000,pw:60},{id:'b',p:1010,pw:60}];let repeat=0;for(let i=0;i<40;i++)if(utoPickOpp(two,'me',1000,'a',Math.random).id==='a')repeat++;
    const lone=utoPickOpp([{id:'a',p:4000,pw:60}],'me',100,'',Math.random),none=utoPickOpp([{id:'me',p:100,pw:60}],'me',100,'',Math.random);
    const col=makeRoster(66,'uto|t1'),pk=utoPack(col,[0,1,2,3,4,5,6]),un=utoUnpack(JSON.parse(JSON.stringify(pk.m)),'x');
    const same=!!un&&pk.m.length===14&&un.length===14&&un.every((o,i)=>KEYS.every(k=>o.s[k]===pk.m[i].s[k]));
    const pw7=un?Math.round(un.slice(0,7).reduce((a,o)=>a+ovrX(o),0)/7):-1;
    const hs={};for(const k of KEYS)hs[k]=9999;const hs2=Object.assign({},hs,{lan:-50});
    const hostile=[];for(let i=0;i<7;i++)hostile.push({n:'<b>x</b>'+'a'.repeat(60),r:'Z',a:-5,x:'hack',s:i?hs:hs2});
    const hu=utoUnpack(hostile,'h'),cleaned=!!hu&&hu.length===14&&hu.every(o=>KEYS.every(k=>o.s[k]>=25&&o.s[k]<=99))&&hu.slice(0,7).every(o=>!/[<>]/.test(o.n)&&o.n.length<=20&&o.r==='C'&&o.trait===null);
    const six=hostile.slice(0,6).concat([{n:'y',r:'H',s:{lan:'abc'}}]);
    const junk=utoUnpack(six,'j')===null&&utoUnpack('boom','j')===null&&utoUnpack(null,'j')===null;
    // premi: gettoni (di piu' battendo chi ha piu' punti, mai perdendo) e traguardi di punti con pacchetti sempre migliori
    const cw=d=>{const c=utoCoins(1000,1000+d,true);return c.base+c.bonus;},cs=[0,25,50,100,150,400].map(cw),cl=utoCoins(1000,1400,false);
    const coinOk=cs.every((v,i)=>!i||v>cs[i-1]||(i===5&&v===cs[4]))&&cs[0]===UTO_COIN_W&&cw(-200)===UTO_COIN_W&&cw(2000)===cs[5]&&cl.bonus===0&&cl.base===UTO_COIN_L&&cl.base<UTO_COIN_W;
    const mq=[1,2,3,4,5,9].map(i=>utoMilePack(i)),mileOk=utoMiles(UTO_START)===0&&utoMiles(UTO_START+UTO_MILE-1)===0&&utoMiles(UTO_START+UTO_MILE)===1&&utoMiles(0)===0&&utoMilePts(1)===UTO_START+UTO_MILE
      &&mq.every((v,i)=>!i||(v%10>=mq[i-1]%10&&Math.floor(v/10)>=Math.floor(mq[i-1]/10)))&&mq[0]%10>=2&&mq[4]%10===6&&mq[5]===mq[4]&&mq.every(v=>Math.floor(v/10)>=5&&Math.floor(v/10)<=9);
    return [row('Punti Elo: contro un avversario più forte si vince di più, contro uno più debole di meno',`+${up} / +${eqW} / +${dn}`,up>eqW&&eqW>dn&&eqW===-eqL,'+16 a parità, simmetrico'),
      row('Punti Elo: ogni partita sposta da 1 a '+UTO_K+' punti, a qualsiasi livello',bounds?'sì':'no',bounds),
      row('Avversario scelto: punti vicini ai tuoi (differenza media su 300 giocatori), mai te stesso',Math.round(dsum/K)+' punti',bad===0&&dsum/K<=150,'al massimo 150'),
      row('Più punti hai, più forti sono gli avversari (punti medi a 500, 1500, 2500)',[a1,a2,a3].map(Math.round).join(', '),a1<a2-500&&a2<a3-500,'salgono di oltre 500 a ogni passo'),
      row('L’ultimo avversario si evita se c’è un’alternativa; con un solo candidato lo si prende; da soli, nessuno',`${repeat} ripetizioni su 40`,repeat===0&&!!lone&&lone.id==='a'&&none===null),
      row('Squadra caricata e scaricata: 14 giocatori con le stesse statistiche e la stessa forza',un?`${un.length} giocatori, forza ${pw7} contro ${pk.pw}`:'non valida',same&&Math.abs(pw7-pk.pw)<=1),
      row('Dati ostili da internet: statistiche nei limiti 25-99, nomi senza simboli, ruolo e tratto validi',cleaned?'ripuliti':'no',cleaned),
      row('Squadre incomplete o che non sono squadre: rifiutate',junk?'sì':'no',junk),
      row('Gettoni: vittoria con avversario a +0, +25, +50, +100, +150, +400 punti; sconfitta',cs.join(', ')+'; '+cl.base,coinOk,'crescono con la differenza fino a un massimo, nessun bonus a chi perde'),
      row('Traguardi di punti: pacchetti (qualità + 10 × carte) dal primo al quinto e oltre',mq.join(', '),mileOk,'sempre migliori e più grandi, super pacchetto dal quinto')];
  }]);
  S.steps.push(['Livelli dell\u2019IA',()=>{
    // 4 livelli (Facile, Medio, Difficile, Estrema): il comportamento migliora a ogni passo e ogni livello aggiunge un bonus alle statistiche dei 7 avversari
    const ra=ros(62,'a'),rb=ros(62,'b'),mean=()=>T[1].reduce((a,q)=>a+KEYS.reduce((x,k)=>x+q.s[k],0)/KEYS.length,0)/T[1].length;
    const gain=DIFF_PLUS.map(pl=>{setSquad(ra);applyRoster(rb);const m0=mean();oppBoost(pl);return mean()-m0;});
    const up=(k,dir)=>DIFF_AI.every((l,i)=>!i||(dir>0?l[k]>=DIFF_AI[i-1][k]:l[k]<=DIFF_AI[i-1][k]));
    const beh=DIFF_AI.length===4&&up('smart',1)&&up('react',-1)&&up('mark',-1)&&up('sprint',1)&&DIFF_PLUS.length===4&&DIFF_PLUS.every((v,i)=>!i?v===0:v>DIFF_PLUS[i-1]);
    const ok=gain.every((g,i)=>Math.abs(g-DIFF_PLUS[i])<=0.35);
    G.oppPlus=0;
    return [row('Livelli dell\u2019IA: quattro, con attenzione, reazione, marcatura e scatto che crescono a ogni passo',DIFF_AI.length+' livelli',beh,'Facile, Medio, Difficile, Estrema'),
      row('Bonus di statistiche agli avversari per livello (Facile, Medio, Difficile, Estrema)',gain.map(g=>'+'+g.toFixed(1)).join(', '),ok,DIFF_PLUS.map(v=>'+'+v).join(', ')+' alla media dei 7 in campo')];
  }]);
  S.steps.push(['Tratto Poser',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b');setSquad(ra);applyRoster(rb);newGame();placeTeams(0);
    const p=T[0][0],q=T[0][1],base=p.s,b0=Object.assign({},base),tr0=[p.trait,q.trait];
    p.trait='poser';q.trait=null;G.holder=p;G.flight=null;G.marker=T[1][0];
    const at=st=>{G.stallT=st;poserTick();};
    at(0);const z=p.s===base;                                            // stall a zero: niente cambia
    at(5);const e5=KEYS.every(k=>Math.abs(p.s[k]-Math.min(99,b0[k]+5*POSER_PT))<1e-9);   // stall 5: +5 a tutte le statistiche
    const sk5=throwInfo(p,1,0,12).skill;at(0);const sk0=throwInfo(p,1,0,12).skill;
    at(30);const cap=KEYS.every(k=>Math.abs(p.s[k]-Math.min(99,b0[k]+POSER_MAX))<1e-9);   // oltre il tetto non sale piu'
    const own=base===p.pzb&&KEYS.every(k=>base[k]===b0[k]);                // l'originale non si tocca mai
    G.flight={};poserTick();const flying=p.s===base;G.flight=null;       // disco in volo: statistiche di prima
    at(6);G.holder=null;poserTick();const back=p.s===base&&G.pz.length===0;   // ha lanciato: tornano quelle di prima
    G.holder=q;G.stallT=8;const sq=q.s;poserTick();const other=q.s===sq&&q.pzb===undefined;   // chi non e' Poser non cambia
    G.holder=p;G.stallT=6;poserTick();placeTeams(1);const rst=p.s===base&&G.pz.length===0;   // a ogni punto si ricomincia
    G.holder=p;G.stallT=6;poserTick();restoreForm();const end=p.s===base||p.s===p.b;   // a fine partita (restoreForm) anche
    p.s=base;p.pzb=null;G.pz=[];G.holder=null;G.stallT=0;G.marker=null;p.trait=tr0[0];q.trait=tr0[1];
    return [row('Poser: statistiche invariate a stall 0, +'+(5*POSER_PT)+' a tutte a stall 5, tetto +'+POSER_MAX,(z&&e5&&cap)?'sì':'no',z&&e5&&cap,'più sale lo stall, più salgono tutte le statistiche'),
      row('Poser: il lancio a stall 5 è più preciso di quello a stall 0 (abilità di lancio)',sk5.toFixed(1)+' contro '+sk0.toFixed(1),sk5>sk0+3,'almeno +3'),
      row('Poser: le statistiche tornano quelle di prima dopo il lancio, a disco in volo, a ogni punto e a fine partita; l\u2019originale non si modifica',(own&&flying&&back&&rst&&end)?'sì':'no',own&&flying&&back&&rst&&end),
      row('Chi non è Poser non cambia mai',other?'sì':'no',other)];
  }]);
  S.steps.push(['Prestazioni',()=>{
    const gt=S.base?avg(S.base.map(m=>m.time)):0,k=gt/Math.max(0.001,S.ms/1000);
    return [row('Velocità di simulazione',Math.round(S.ms)+' ms a partita ('+Math.round(k)+' volte il tempo reale)',k>=15,'almeno 15 volte')];
  }]);
  S.steps.push(['Schema 1 in 3-4',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b');for(const o of ra)o.s.vis=90;setSquad(ra);applyRoster(rb);G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=null;
    newGame();G.auto=true;G.lvl=[0,1];G.oppPlus=0;G.idn=[null,null];G.xtr=false;G.hint=false;G.inMatch=true;G.schemeOpen=false;applyForm();G.startRec=1;G.nextRec=1;
    let nb=0,na=0,fullB=0,fullA=0;const N=Math.max(60,n*10);
    for(let i=0;i<N;i++){
      placeTeams(0);G.sch.att='i34';G.opp.def='man_out';G.rep=[{k:'',n:0},{k:'',n:0}];
      const p=G.puller;p.s.spa=99;p.s.lan=99;doPull(0.62,dirOf(1)>0?0:Math.PI);G.skip=true;
      let t=0,first=null;const log=[];
      while(t++<14400&&G.mode==='play'&&G.poss===0){update(1/60);const pb=G.pb&&G.pb[0],f=G.flight;
        if(pb&&pb.active&&!first)first=pb.id;
        if(f&&f.team===0&&!f._t){f._t=1;if(pb&&pb.active&&f.intended)log.push(pb.id+pb.phase+pb.role[f.intended.id]);}}
      G.skip=false;G.mode='play';
      if(first==='i34b')nb++;else if(first==='i34a')na++;
      const sq=log.join(' ');if(sq.includes('i34b1C4')&&sq.includes('i34b2C3'))fullB++;if(sq.includes('i34a0C2')&&sq.includes('i34a1C4'))fullA++;
    }
    const pB=nb/Math.max(1,nb+na);
    return [row('1 in 3-4: variante B scelta circa 7 volte su 10',pc(pB),pB>=0.55&&pB<=0.85),
      row('1 in 3-4 con Visione 90: sequenze complete (B: C4 che torna, poi lungo a C3; A: C2 sotto, poi C4)','B '+fullB+', A '+fullA+' su '+N,fullB>=N*0.15&&fullA>=N*0.08,'i passaggi seguono lo schema disegnato')];
  }]);
  S.steps.push(['Ripresa dalla linea di meta',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b');setSquad(ra);applyRoster(rb);G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=null;
    newGame();G.inMatch=true;placeTeams(0);G.mode='play';
    const tryAt=(x,pk)=>{G.walk=null;const q=T[1][2];q.x=x;q.y=12;turnover(1,x,12,pk?q:null,'',1);return G.walk;};
    const w1=tryAt(EZ*0.5,true),w2=tryAt(FIELD_L-EZ*0.5,true),w3=tryAt(FIELD_L/2,true),w4=tryAt(EZ*0.5,false);
    const ok1=!!(w1&&w1.line&&Math.abs(w1.line.x-(EZ+0.6))<0.01),ok2=!!(w2&&w2.line&&Math.abs(w2.line.x-(FIELD_L-EZ-0.6))<0.01),ok3=!w3||!w3.line,ok4=!!(w4&&w4.line);
    G.walk=null;
    return [row('Turnover dentro una meta (anche con chi raccoglie al volo, come dopo un handblock): si riparte dalla linea di meta',[ok1,ok2,ok3,ok4].map(v=>v?'sì':'no').join(', '),ok1&&ok2&&ok3&&ok4,'nelle due mete sì, a centrocampo no')];
  }]);
  S.steps.push(['Salto da fermo o in corsa nella scena laterale',()=>{
    const f={tx:30,ty:18},p=(x,y,vx,vy)=>({x,y,vx,vy});
    const still=!jumpRun(p(30.5,18.3,0.5,0),f),runFar=jumpRun(p(31,18,6,0),f),stand=!jumpRun(p(31,18,0,0),f);
    return [row('Chi era vicino al disco salta da fermo, chi arrivava da lontano entra di corsa',(still&&stand?'fermo':'no')+', '+(runFar?'in corsa':'no'),still&&stand&&runFar,'oltre '+JUMP_STILL+' m '+JUMP_LOOK+' s prima della presa')];
  }]);
  S.steps.push(['Equipaggiamento di Ultimate Team',()=>{   // 10-sim/25-ut-equipaggiamento.js
    const rng=mulberry32(77),cnt=q=>{const c=[0,0,0];let bad=0;for(let i=0;i<600;i++){const p=eqDraw(q,q>=5?3:2,rng);if(new Set(p.map(o=>o.k)).size!==p.length)bad++;
      if(q>=3&&Math.max(...p.map(o=>o.r))<1)bad++;if(q>=6&&Math.max(...p.map(o=>o.r))<2)bad++;for(const o of p)c[o.r]++;}const t=c[0]+c[1]+c[2];return {epi:c[2]/t,rar:(c[1]+c[2])/t,bad};};
    const qs=[1,2,3,4,5,6].map(cnt),up=qs.every((x,i)=>!i||(x.epi>=qs[i-1].epi&&x.rar>=qs[i-1].rar)),bad=qs.reduce((a,x)=>a+x.bad,0);
    const e=eqInit(null),c1=eqGain(e,[{k:'boot',r:0},{k:'coach',r:2}]),c2=eqGain(e,[{k:'boot',r:2},{k:'boot',r:2},{k:'coach',r:0}]);
    const keep=e.on.boot===2&&e.on.coach===2&&c1===0&&c2===EQ_DUP[2];
    const p={n:'x',r:'C',s:{}};for(const k of KEYS)p.s[k]=95;const q=eqApply(p,e),b=eqBonus(e);
    const ok3=q.s.sca===99&&q.s.vis===99&&q.s.lan===95&&p.s.sca===95&&b.sca===EQ_PLUS[2];
    const old=eqInit({own:{boot:9,drink:1},on:{boot:1,drink:2},kit:{s:'#ff0000',p:'#101827'}});   // valori impossibili da un salvataggio rovinato
    const safe=old.own.boot===1&&old.on.boot===undefined&&old.on.drink===undefined&&old.kit.s===EQ_KIT0.s&&old.kit.p==='#101827';
    const miles=[1,2,3,4,5].map(utoMileEq),mUp=miles.every((v,i)=>!i||(v%10>=miles[i-1]%10&&Math.floor(v/10)%10>=Math.floor(miles[i-1]/10)%10))&&miles.every(v=>Math.floor(v/100)===EQ_PK);
    return [row('Pacchetti: rarità sempre migliori con la qualità, accessori diversi e garanzie rispettate',`Epici ${qs.map(x=>Math.round(x.epi*100)+'%').join(' ')} · errori ${bad}`,up&&!bad),
      row('Doppioni in gettoni, il migliore si indossa da solo',`scarpini ${EQ_RAR[e.on.boot][0]}, coach ${EQ_RAR[e.on.coach][0]}, gettoni ${c1}+${c2}`,keep),
      row('Il bonus vale per la squadra in partita (massimo 99) e non cambia la carta',`Scatto 95 → ${q.s.sca}, Lancio ${q.s.lan}, carta ${p.s.sca}`,ok3),
      row('Salvataggi rovinati e traguardi: valori validi, accessori sempre migliori',(safe?'ok':'no')+', '+miles.join(' '),safe&&mUp)];
  }]);
  S.steps.push(['Superpoteri: gli otto eroi',()=>{   // 27-superpoteri.js
    const ra=ros(62,'ha'),rb=ros(62,'hb');
    setSquad(ra);applyRoster(rb);newGame();
    const rk=heroRand();heroInit(rk,rk);heroAssign(T[0],rk);
    const three=rk.length===HERO_N&&new Set(rk).size===HERO_N&&T[0].filter(x=>x.hero).length===HERO_N&&rk.every(k=>heroOf(0,k));
    G.heroOn=true;heroInit();heroAssign(T[0]);heroAssign(T[1]);   // per provare i poteri: tutti e cinque in campo
    const L=heroOf(0,'lupo'),g=heroOf(0,'giraffa'),o=heroOf(0,'polpo'),q=T[1].find(x=>x.hero!=='giraffa');
    G.mode='play';G.pull=null;for(const t of [0,1])for(const k of HERO_K)G.hz[t][k]=0;
    const base=L.s,v0=L.s.vel,used=heroUse(0,'lupo'),vU=L.s.vel,up=used&&L.s.vel>=Math.min(99,v0+10)&&L.hrb===base,again=!heroUse(0,'lupo');
    for(let i=0;i<Math.ceil(HERO.lupo.dur*10)+2;i++)heroTick(0.1);const back=L.s===base&&!(L.hx>0)&&G.hz[0].lupo>0;
    const f={high:true,err:0,sp:{cd:0},intended:g},a={p:g,d:0.8},d={p:q,d:0.2},reach=p=>reachOf(f,p);g._t=0;q._t=0;
    const s0=duelScore(f,a,d,reach);heroUse(0,'giraffa');const s1=duelScore(f,a,d,reach),gir=s1.sa-s1.sd>80&&s1.sa-s1.sd>s0.sa-s0.sd;
    const r0=laneR(o,false);heroUse(0,'polpo');const pr=laneR(o,false)/r0,pol=pr>2;
    const fl={sx:10,sy:20,tx:40,ty:20,cx:0,cy:0,t:1,T:2,e:1,team:0},fs0=flightS(fl,0.5),P0=flightAt(fl,fs0),d0=hyp(fl.tx-P0.x,fl.ty-P0.y);
    let turns=0;for(let i=0;i<10;i++)if(heroSteer(fl,{x:P0.x,y:P0.y+30},0.05))turns++;
    const P1=flightAt(fl,fs0),d1=hyp(fl.tx-P1.x,fl.ty-P1.y),ang=Math.atan2(fl.ty-P1.y,fl.tx-P1.x);
    const tk=turns===10&&hyp(P1.x-P0.x,P1.y-P0.y)<1e-6&&Math.abs(d1-d0)<1e-6&&Math.abs(ang-HERO_TK_ROT*0.5)<1e-3;
    // clone: la copia non e' in T, chi marca il vero a volte la segue, chi lancia la conta tra i difensori; corre lontano dal vero e sparisce con lui
    const C=heroOf(0,'clone');G.poss=0;G.holder=T[0].find(x=>x!==C&&x.hero!=='tele');G.flight=null;heroUse(0,'clone');const dc=G.dec[0];
    const cOk=!!(dc&&dc.fake&&dc.o===C&&!T[0].includes(dc)&&heroSeen(0).length===T[0].length+1&&heroSeen(0).includes(dc));
    const mq=T[1][0],mk0=mq.mark;mq.mark=C;let fooled=0;for(let i=0;i<300;i++){dc.fool.clear();if(heroMarkOf(mq)===dc)fooled++;}
    const H0=G.holder;G.holder=C;dc.fool.clear();const sees=heroMarkOf(mq)===C;G.holder=H0;mq.mark=mk0;
    for(let i=0;i<25;i++)heroTick(0.1);const sep=G.dec[0]?hyp(G.dec[0].x-C.x,G.dec[0].y-C.y):0;
    heroEnd(C);const gone=!G.dec[0];
    // stregone: l'onda congela chi e' vicino (non chi e' lontano), poi il gelo passa; mietitore: gli avversari perdono energia, i tuoi no
    for(const k of HERO_K)G.hz[1][k]=99;for(const x of T[1])if(x.hx>0)heroEnd(x);   // qui il computer non usa i suoi poteri (e chiude quelli in corso)
    const Wz=heroOf(0,'ghiaccio'),qs=T[1].filter(x=>x.hero!=='lupo'),qn=qs[0],qf=qs[1];qn.x=clamp(Wz.x+3,1,FIELD_L-1);qn.y=Wz.y;qf.x=Wz.x>FIELD_L/2?Wz.x-35:Wz.x+35;qf.y=Wz.y;
    const vn0=vmaxOf(qn),vf0=vmaxOf(qf);heroUse(0,'ghiaccio');const vn1=vmaxOf(qn),vf1=vmaxOf(qf);
    for(let i=0;i<ICE_T*10+2;i++)heroTick(0.1);const vn2=vmaxOf(qn),ice=vn1<vn0*0.6&&vf1===vf0&&vn2===vn0&&!(qn.frz>0);
    const Rp=heroOf(0,'mietitore');for(const x of T[0].concat(T[1]))x.st=100;heroUse(0,'mietitore');const dk=heroDrain(T[1][0]),dm=heroDrain(T[0][0]);
    for(let i=0;i<20;i++)heroTick(0.1);const drop=100-Math.max(...T[1].map(x=>x.st)),mine=Math.min(...T[0].map(x=>x.st));
    const reap=drop>=9&&mine===100&&dk===REAP_K&&dm===1&&Rp.hx>0;heroEnd(Rp);
    // signore del vento: la sua squadra lancia piu' lontano, l'altra piu' corto; finita la trasformazione torna tutto com'era
    heroAssign(T[0],['vento']);   // con otto eroi e sette in campo, il vento qui va assegnato a parte
    const Vt=heroOf(0,'vento'),a0=T[0][0],b0=T[1][0],ma=throwMax(a0),mb=throwMax(b0);heroUse(0,'vento');const ma1=throwMax(a0),mb1=throwMax(b0),hw=[heroWind(0),heroWind(1)];
    heroEnd(Vt);const wind=ma1===ma+VENTO_R&&mb1===mb-VENTO_R&&hw[0]===1&&hw[1]===-1&&throwMax(a0)===ma&&heroWind(0)===0;
    placeTeams(0);const reset=!T[0].concat(T[1]).some(x=>x.hx>0||x.hrb||x.frz>0);
    const both=run(ra,rb,n,{hero:'both'}),okB=both.every(m=>!m.stuck&&!m.nan&&Math.max(m.score[0],m.score[1])===MATCH_TARGET),useB=both.every(m=>m.st.hero&&m.st.hero[0]>0&&m.st.hero[1]>0);
    // quanto contano gli eroi (misurato a parte, 50 partite per lato a squadre pari): chi li ha vince circa 7 volte su 10. Qui non si misura: servirebbero troppe partite
    return [row('Tre eroi per squadra, ognuno col suo pulsante e il suo timer',three?rk.join(', '):'no',three),
      row('Lupo mannaro: statistiche fisiche piu\' alte, poi tornano com\'erano e il timer riparte',`Velocità ${v0} → ${vU}, poi ${back?'di nuovo '+L.s.vel:'non torna'}${again?'':' (doppio uso!)'}`,up&&back&&again),
      row('Giraffa: vince i duelli in aria; Polpo: braccia piu\' lunghe per intercettare',`duello ${Math.round(s0.sa-s0.sd)} → ${Math.round(s1.sa-s1.sd)}, raggio ×${pr.toFixed(1)}`,gir&&pol),
      row('Telecinetico: il disco cambia direzione, ma non la distanza che gli resta (e gira poco alla volta)',`${d0.toFixed(1)} m → ${d1.toFixed(1)} m, girato di ${Math.round(ang*180/Math.PI)}°`,tk),
      row('Clone: la copia non prende dischi, inganna il marcatore e chi lancia, si allontana dal vero e sparisce con lui',`segue la copia ${Math.round(fooled/3)}% · dal vero ${sep.toFixed(1)} m`,cOk&&fooled>60&&fooled<250&&sees&&sep>4&&gone),
      row('Stregone di ghiaccio: l\'onda rallenta chi ha vicino, non chi e\' lontano, e il gelo passa',`velocità ${vn0.toFixed(1)} → ${vn1.toFixed(1)} m/s (lontano ${vf1.toFixed(1)}), poi ${vn2.toFixed(1)}`,ice),
      row('Mietitore: gli avversari perdono energia in fretta (e gli scatti costano di più), i tuoi no',`−${Math.round(drop)} in 2 s, scatti ×${dk}`,reap),
      row('Signore del vento: i tuoi lanci arrivano piu\' lontano, quelli avversari piu\' corti, poi torna tutto come prima',`gittata ${Math.round(ma)} → ${Math.round(ma1)} m, avversari ${Math.round(mb)} → ${Math.round(mb1)} m`,wind),
      row('A ogni punto le trasformazioni finiscono',reset?'sì':'no',reset),
      row('Partite con gli eroi: finiscono regolarmente e le due IA usano i poteri',`${both.filter(m=>m.st.hero).length} su ${n}`,okB&&useB)];
  }]);
  return S;
}
function selfTestRun(S,i){   // esegue il passo i col suo generatore casuale; i suoni, gli stacchi e le scritte restano spenti
  const R0=Math.random,H0=Object.assign({},HOOKS),c0=G.opt.cine;let rows;
  for(const k in HOOKS)HOOKS[k]=k==='cine'?null:function(){};
  G.opt.cine=false;Math.random=mulberry32(S.seed+i*7919);
  try{rows=S.steps[i][1]();}catch(e){rows=[{name:S.steps[i][0],val:'errore: '+(e&&e.message),ok:false,note:''}];}
  finally{Math.random=R0;Object.assign(HOOKS,H0);G.opt.cine=c0;G.auto=false;G.skip=false;setWind(0,0);G.fix=null;G.inMatch=false;G.drill=null;G.mode='menu';}
  return rows;
}
function selfTest(opt){const S=selfTestPlan(opt),out=[];for(let i=0;i<S.steps.length;i++)out.push({group:S.steps[i][0],rows:selfTestRun(S,i)});return out;}
initTeams();resetStats();
