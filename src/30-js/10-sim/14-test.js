/* ===================== TEST AUTOMATICI E SIMULAZIONI RIPRODUCIBILI =====================
   La suite gioca partite IA contro IA col motore vero e controlla: stabilita', ritmo e regole, efficacia dei lanci, equilibrio degli schemi,
   peso della forza e degli attributi, coerenza tra partite simulate e giocate, crescita dei giocatori, prestazioni.
   Ogni passo usa un generatore casuale con seme fisso: con lo stesso seme e lo stesso numero di partite i risultati sono identici a ogni esecuzione.
   Si lancia da Impostazioni > Diagnostica oppure da riga di comando (node test_ultimate_frisbee.js). */
function testMatch(ra,rb,o){   // una partita IA contro IA: ritorna punteggio, statistiche e controlli
  o=o||{};
  setSquad(ra);applyRoster(rb);
  G.lines=null;G.formB=0;G.drill=null;G.injK=0;G.fix=o.fix||null;
  newGame();if(o.wind)setWind(o.wind[0],o.wind[1]);G.auto=true;G.lvl=[o.lvl|0,o.lvl|0];G.oppPlus=0;G.idn=[null,null];G.xtr=false;G.hint=false;G.inMatch=true;G.schemeOpen=false;
  applyForm();
  G.startRec=o.rec|0;G.nextRec=G.startRec;startPoint(G.startRec);
  const dt=1/60,r={time:0,nan:0,stuck:false,hold:0,pts:0,ptT:[]};let pt=0,last=0,rec=-1,fr=0;
  while(G.mode!=='over'&&r.time<3600){
    update(dt);r.time+=dt;pt+=dt;fr++;
    if(G.mode==='half')startSecondHalf();
    if(rec<0&&G.mode==='ready')rec=G.poss;
    const tot=G.score[0]+G.score[1];
    if(tot!==last){const sc=G.banner?G.banner.team:(G.score[0]>G.score[1]?0:1);if(sc===rec)r.hold++;r.pts++;r.ptT.push(pt);pt=0;last=tot;rec=-1;}
    if(pt>240){r.stuck=true;break;}
    if(fr%30===0)for(const p of T[0].concat(T[1]))if(!isFinite(p.x)||!isFinite(p.y)){r.nan++;p.x=50;p.y=18;}
  }
  r.score=G.score.slice();r.st=JSON.parse(JSON.stringify(G.st));
  r.xp=SQ.filter(p=>p.m.pts>0).reduce((a,p)=>a+xpTotal(p.m)*XP_ROLE[posOf(p)],0)/7;
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
    const htol=2.6*Math.sqrt(0.25/Math.max(1,ms.reduce((a,m)=>a+m.pts,0)));   // con poche mete il caso pesa: il margine si stringe quando le partite aumentano
    const bad=ms.filter(m=>m.stuck||m.nan||Math.max(m.score[0],m.score[1])!==MATCH_TARGET||Math.min(m.score[0],m.score[1])>=MATCH_TARGET).length;
    return [row('Partite concluse senza blocchi né errori numerici',(n-bad)+' su '+n,bad===0),
      row('Regole del punteggio: si vince a '+MATCH_TARGET,'media sconfitta '+lose.toFixed(1),lose>=1.5&&lose<=6.2,'attesa tra 1,5 e 6,2'),
      row('Lanci completati',pc(cmp),cmp>=0.74&&cmp<=0.93,'attesa tra 74% e 93%'),
      row('Turnover a partita',to.toFixed(1),to>=6&&to<=24,'attesa tra 6 e 24'),
      row('Mete segnate da chi riceve il pull',pc(hold),hold>=0.38-htol&&hold<=0.8+htol,'attesa tra 38% e 80%, con un margine di '+pc(htol)+' per il numero di mete giocate'),
      row('Durata media di una meta',ptT.toFixed(0)+' s',ptT>=10&&ptT<=60,'attesa tra 10 e 60 secondi')];
  }]);
  S.steps.push(['Equilibrio degli schemi',()=>{
    const k=Math.max(2,Math.round(n/3)),ra=ros(62,'a'),rb=ros(62,'b'),res=[];
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
      const ra=ros(62+d,'a'),ms=d===0&&S.base?S.base:run(ra,rb,n),diff=rosterPower(ra)-rosterPower(rb);
      const share=avg(ms.map(m=>m.score[0]/(m.score[0]+m.score[1]))),exp=simPointP(diff),tol=Math.max(0.08,2.6*Math.sqrt(0.25/(n*11)));
      if(share<prev-0.04)mono=false;prev=share;
      out.push(row('Differenza di forza '+diff.toFixed(1)+': punti vinti','giocate '+pc(share)+', simulate '+pc(exp),Math.abs(share-exp)<=tol,'scarto ammesso '+pc(tol)));
    }
    out.push(row('La squadra più forte vince di più',mono?'sì':'no',mono));
    return out;
  }]);
  S.steps.push(['Peso degli attributi',()=>{
    const rb=ros(62,'b'),m0=margin(S.base||run(ros(62,'a'),rb,n)),out=[],slack=3.2*Math.sqrt(2/n);
    for(const c of CATS.filter(c=>c.keys.length>1)){
      const ra=ros(62,'a');for(const o of ra)for(const k of c.keys)o.s[k]=Math.min(99,o.s[k]+12);
      const mv=margin(run(ra,rb,n));
      out.push(row(c.name+' +12: scarto medio in punti',(mv>=0?'+':'')+mv.toFixed(1)+' (base '+(m0>=0?'+':'')+m0.toFixed(1)+')',mv>m0-slack,'non deve peggiorare il risultato'));
    }
    return out;
  }]);
  S.steps.push(['Crescita dei giocatori',()=>{
    const gain=age=>{const ro=makeRoster(60,'cresc'+age);let t=0;for(const o of ro){o.age=age;o.dev=1;const b=ovrX(o);for(let i=0;i<15;i++)growBy(o,simParts(o,1),XP_ROLE[posOf(o)]);t+=ovrX(o)-b;}return t/ro.length;};
    const g18=gain(18),g26=gain(26),g34=gain(34),xp=S.base?avg(S.base.map(m=>m.xp)):30;
    const per={};for(const c of CATS){const ro=makeRoster(60,'all'+c.id);let t=0;for(const o of ro){o.age=24;o.dev=1;for(let i=0;i<20;i++)t+=trainCategory(o,c).gain;}per[c.id]=t/ro.length/20;}
    const v=Object.values(per),mx=Math.max(...v),mn=Math.min(...v);
    return [row('Overall guadagnato in 15 partite (18, 26, 34 anni)','+'+g18.toFixed(1)+', +'+g26.toFixed(1)+', +'+g34.toFixed(1),g18>g26&&g26>g34&&g34>=0&&g18<=6,'i giovani crescono di più'),
      row('Esperienza di una partita giocata e di una simulata',xp.toFixed(1)+' e 30,0',xp>=22&&xp<=38,'devono essere vicine'),
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
    return [row('Pull dell\u2019IA che escono dal campo',pc(brick/k),brick/k>=0.08&&brick/k<=0.35,'attesa tra 8% e 35%'),
      row('Pull dell\u2019IA che arrivano nella meta avversaria',pc(deep/k),deep/k>=0.35,'almeno 35%'),
      row('Pull fermato nel verde e al centro: fuori',pc(gOut/k),gOut/k<=0.04,'al massimo 4%'),
      row('Pull a tutta potenza o verso la linea laterale: fuori',pc(rOut/k)+' e '+pc(sOut/k),rOut/k>=0.6&&sOut/k>=0.9,'almeno 60% e 90%'),
      row('Possessi avversari saltati che arrivano in fondo',(m-stuck)+' su '+m,stuck===0),
      row('Mete avversarie per possesso saltato',pc(goals/m),goals/m>=0.05&&goals/m<=0.85,'attesa tra 5% e 85%: né muro né colabrodo'),
      row('Difesa automatica senza difensore guidato né cerchio dell\u2019handblock',ctrl+hbw===0?'sì':'no',ctrl+hbw===0)];
  }]);
  S.steps.push(['Vento',()=>{
    const ra=ros(62,'a'),rb=ros(62,'b'),k=Math.max(4,n),cmpOf=ms=>avg(ms.map(m=>(m.st.cmp[0]+m.st.cmp[1])/Math.max(1,m.st.thr[0]+m.st.thr[1])));
    const calm=cmpOf(S.base||run(ra,rb,k)),strong=cmpOf(run(ra,rb,k,{wind:[3,Math.PI/2]})),bad=run(ra,rb,2,{wind:[3,0]}).filter(m=>m.stuck||m.nan).length;
    // deriva di un lancio alto da 40 m col vento forte di lato: grande per chi lancia male, piccola per chi lancia bene
    setWind(3,Math.PI/2);const drift=sk=>{const w=windOn(sk,40,0,40,40/23.4,true,false);return hyp(w.x,w.y);};const dLo=drift(45),dHi=drift(90);
    // il pull va piu' lungo col vento alle spalle
    setSquad(ra);applyRoster(rb);newGame();placeTeams(1);const p=G.puller,land=()=>{const q=pullPlan(p,0,0.8,0);return q.dist+q.wx*dirOf(0);};
    setWind(3,dirOf(0)>0?0:Math.PI);const tail=land();setWind(3,dirOf(0)>0?Math.PI:0);const head=land();setWind(0,0);
    return [row('Lanci completati con calma e con vento forte di lato',pc(calm)+' e '+pc(strong),strong<calm+0.01&&strong>=calm-0.16,'il vento forte toglie al massimo 16 punti'),
      row('Partite con vento forte concluse senza blocchi',(2-bad)+' su 2',bad===0),
      row('Deriva di uno sparo da 40 m (Sparo 45 e Sparo 90)',dLo.toFixed(1)+' m e '+dHi.toFixed(1)+' m',dLo>dHi*1.8&&dLo<=8&&dHi>=0.3,'chi lancia bene compensa'),
      row('Pull con vento alle spalle e controvento',tail.toFixed(0)+' m e '+head.toFixed(0)+' m',tail-head>=10&&tail-head<=24,'tra 10 e 24 metri di differenza')];
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
