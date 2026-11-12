/* ===================== TEST AUTOMATICI E SIMULAZIONI RIPRODUCIBILI =====================
   La suite gioca partite IA contro IA col motore vero e controlla: stabilita', ritmo e regole, efficacia dei lanci, equilibrio degli schemi,
   peso della forza e degli attributi, coerenza tra partite simulate e giocate, crescita dei giocatori, prestazioni.
   Ogni passo usa un generatore casuale con seme fisso: con lo stesso seme e lo stesso numero di partite i risultati sono identici a ogni esecuzione.
   Si lancia da Impostazioni > Diagnostica oppure da riga di comando (node test_ultimate_frisbee.js). */
const REV_MAX=10;   // prima delle correzioni (tagli liberi che dondolano, lato dell'attacco che si scambia) erano circa 13 al minuto; ora circa 7
function testMatch(ra,rb,o){   // una partita IA contro IA: ritorna punteggio, statistiche e controlli
  o=o||{};
  setSquad(ra);applyRoster(rb);
  G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=o.fix||null;
  newGame();if(o.len)G.target=o.len;if(o.wind)setWind(o.wind[0],o.wind[1]);G.auto=true;G.lvl=[o.lvl|0,o.lvl|0];G.oppPlus=0;G.idn=[null,null];G.xtr=false;G.hint=false;G.inMatch=true;G.schemeOpen=false;
  applyForm();
  G.startRec=o.rec|0;G.nextRec=G.startRec;startPoint(G.startRec);
  const dt=1/60,r={time:0,nan:0,stuck:false,hold:0,pts:0,ptT:[],rev:0,revT:0,halfAt:-1};let pt=0,last=0,rec=-1,fr=0;
  while(G.mode!=='over'&&r.time<3600){
    update(dt);r.time+=dt;pt+=dt;fr++;
    if(G.mode==='half'){r.halfAt=Math.max(G.score[0],G.score[1]);startSecondHalf();}
    if(rec<0&&G.mode==='ready')rec=G.poss;
    const tot=G.score[0]+G.score[1];
    if(tot!==last){const sc=G.banner?G.banner.team:(G.score[0]>G.score[1]?0:1);if(sc===rec)r.hold++;r.pts++;r.ptT.push(pt);pt=0;last=tot;rec=-1;}
    if(pt>240){r.stuck=true;break;}
    if(fr%6===0){   // ripensamenti: chi non ha il disco, mentre il portatore aspetta, inverte la corsa (angolo oltre 120 gradi rispetto a 0,4 secondi prima)
      if(G.mode==='play'&&G.holder&&!G.flight&&!G.pull&&G.holdT>1){   // solo a formazione assestata (dopo 1 s dalla presa): e' quando chi ha il disco sta decidendo o mirando
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
  const margin=ms=>avg(ms.map(m=>m.score[0]-m.score[1]));
  S.steps.push(['Stabilità, ritmo e regole',()=>{
    const t0=Date.now(),ms=run(ros(62,'a'),ros(62,'b'),n);S.base=ms;S.ms=(Date.now()-t0)/n;
    const thr=avg(ms.map(m=>m.st.thr[0]+m.st.thr[1])),cmp=avg(ms.map(m=>m.st.cmp[0]+m.st.cmp[1]))/thr,to=avg(ms.map(m=>m.st.to[0]+m.st.to[1]));
    const lose=avg(ms.map(m=>Math.min(m.score[0],m.score[1]))),hold=avg(ms.map(m=>m.hold/Math.max(1,m.pts))),ptT=avg([].concat(...ms.map(m=>m.ptT)));
    const rev=ms.reduce((a,m)=>a+m.rev,0)/Math.max(1,ms.reduce((a,m)=>a+m.revT,0)/60);
    const htol=2.6*Math.sqrt(0.25/Math.max(1,ms.reduce((a,m)=>a+m.pts,0)));   // con poche mete il caso pesa: il margine si stringe quando le partite aumentano
    const bad=ms.filter(m=>m.stuck||m.nan||Math.max(m.score[0],m.score[1])!==MATCH_TARGET||Math.min(m.score[0],m.score[1])>=MATCH_TARGET).length;
    return [row('Partite concluse senza blocchi né errori numerici',(n-bad)+' su '+n,bad===0),
      row('Regole del punteggio: si vince a '+MATCH_TARGET,'media sconfitta '+lose.toFixed(1),lose>=1.5&&lose<=6.2,'attesa tra 1,5 e 6,2'),
      row('Lanci completati',pc(cmp),cmp>=0.74&&cmp<=0.93,'attesa tra 74% e 93%'),
      row('Turnover a partita',to.toFixed(1),to>=6&&to<=24,'attesa tra 6 e 24'),
      row('Mete segnate da chi riceve il pull',pc(hold),hold>=0.38-htol&&hold<=0.8+htol,'attesa tra 38% e 80%, con un margine di '+pc(htol)+' per il numero di mete giocate'),
      row('Durata media di una meta',ptT.toFixed(0)+' s',ptT>=10&&ptT<=60,'attesa tra 10 e 60 secondi'),
      row('Ripensamenti: inversioni di corsa di un attaccante senza disco, ogni minuto',rev.toFixed(1),rev<=REV_MAX,'meno di '+REV_MAX+': chi parte per uno scatto lo porta a termine')];
  }]);
  S.steps.push(['Equilibrio degli schemi',()=>{
    const k=Math.max(2,Math.round(n/2)),ra=ros(62,'a'),rb=ros(62,'b'),res=[];   // 3 partite per coppia con n=6: con 2 gli estremi dipendevano troppo dal caso
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
    setSquad(ra);applyRoster(rb);G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=null;
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
    const mm=Math.max(150,n*15),afterPull=c=>{   // mete di chi riceve nel possesso dopo un pull di quel tipo (tira un fuoriclasse: la qualita' e' quella voluta)
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
    const ra=ros(62,'a'),rb=ros(62,'b'),k=Math.max(2,Math.min(3,n)),ms=run(ra,rb,k,{len:11});
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
    let g=0;while(g++<60*120&&!(G.mode==='play'&&G.holder&&G.holder.t===0&&G.holdT>1&&!G.flight&&!G.walk&&!G.brickWait))update(1/60);
    const ok0=canTimeout(0),ok1=canTimeout(1);G.stallT=7.6;for(const p of T[0])p.st=60;
    const lbBefore=situationLabel(G.holder,8),r1=callTimeout(0),st1=G.stallT,en=T[0].every(p=>p.st===60+TMO_REST),r2=callTimeout(0);
    const t=G.target-1;G.score=[t,t];const uni=situationLabel(G.holder,0),lastT=situationLabel(G.holder,9);G.score=[0,0];
    return [row('Timeout: si puo\u2019 chiamare con il disco in mano, una sola volta; lo stall riparte da zero e la squadra recupera',(ok0&&!ok1&&r1&&!r2&&st1===0&&en)?'sì':'no',ok0&&!ok1&&r1&&!r2&&st1===0&&en,'uno a partita, solo per chi ha il disco'),
      row('Etichetta della situazione sopra il portatore',(lbBefore?lbBefore.txt:'-')+', '+(uni?uni.txt:'-')+', '+(lastT?lastT.txt:'-'),lbBefore&&lbBefore.txt==='STALL 8'&&uni&&uni.txt==='UNIVERSE POINT'&&lastT&&lastT.txt==='ULTIMO LANCIO')];
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
      for(const ax of [24,18,30,14])for(const ay of [-12,-8,8,12,-4,4]){
        if(found)continue;const x=clamp(th.x+d*ax,6,FIELD_L-6),y=clamp(th.y+ay,4,FIELD_W-4);let nd=99;for(const q of T[0])if(q!==th)nd=Math.min(nd,hyp(q.x-x,q.y-y));
        if(!computeAim(th,x,y,false,true).intended&&nd>=5&&nd<=CALL_MAX-3&&hyp(x-th.x,y-th.y)>=8){zx=x;zy=y;found=true;}
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
    return [row('Chiamata a una zona libera con il dito che trema: cambi di compagno e chiamate cadute',ok?swaps+' e '+ended:'partita non pronta',ok&&swaps<=1&&ended===0,'al massimo un cambio (un compagno arrivato molto piu\u2019 vicino), nessuna chiamata caduta'),
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
    const hd=T[0].find(q=>q.role==='H'&&q!==T[0][0])||T[0][1],h0=T[0][0],d0=dirOf(0);G.holder=h0;G.flight=null;G.walk=null;G.brickWait=false;G.poss=0;
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
  S.steps.push(['Prestazioni',()=>{
    const gt=S.base?avg(S.base.map(m=>m.time)):0,k=gt/Math.max(0.001,S.ms/1000);
    return [row('Velocità di simulazione',Math.round(S.ms)+' ms a partita ('+Math.round(k)+' volte il tempo reale)',k>=15,'almeno 15 volte')];
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
