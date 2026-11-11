/* ---- atterraggio: presa, intercetto, duello, tuffo ---- */
function clearFl(){for(const p of T[0].concat(T[1])){p.fl=null;p.boost=0;p.flD=0;}}
// PRESA: quanto e' difficile una ricezione (0 = facile) e con che probabilita' il disco sfugge di mano.
// Contano il tipo di lancio, il disco al limite della portata (presa a una mano), la corsa, un difensore addosso e la stanchezza: mai il caso da solo.
const reachOf=(f,p)=>f.kind==='blade'?1.25+p.s.sal*0.006:(f.high?1.2+p.s.sal*0.014+(hasT(p,'sky')?0.15:0)+(f.sparo&&hasT(p,'deep')?0.2:0):1.5);
function catchInfo(f,o,def){
  const p=o.p,edge=clamp(o.d/reachOf(f,p),0,1),sp=hyp(p.vx,p.vy);
  let nd=9;for(const q of def)nd=Math.min(nd,hyp(q.x-p.x,q.y-p.y));
  const diff=f.sp.cd+0.12*edge*edge+0.03*clamp(sp/8,0,1)+0.06*clamp(1-(nd-1)/2.5,0,1)+0.035*clamp((45-p.st)/45,0,1);
  const kind=f.high&&edge>0.55?'salto':(edge>0.78?'mano':(nd<1.9?'contesa':(sp>4.5?'corsa':'semplice')));
  return {edge,sp,nd,diff,kind};
}
const dropProb=(p,diff)=>clamp((0.003+diff*(1.3-1.15*p.s.pre/100))*(hasT(p,'hands')?0.55:1),0,0.6);
const CATCH_MSG={salto:'Presa in salto!',mano:'Presa a una mano!',contesa:'Presa contesa!',corsa:'Presa in corsa!',semplice:'Presa!'};
function tryCatch(f,o,def,L){
  const ci=catchInfo(f,o,def),p=o.p;
  if(Math.random()<dropProb(p,ci.diff)){   // disco sfuggito: e' un errore di chi riceve, non di chi lancia
    G.st.drop[f.team]++;HOOKS.sfx('drop');
    return turnover(1-f.team,L.x,L.y,null,'Presa mancata',1-f.team);
  }
  if(ci.kind!=='semplice'&&ci.kind!=='corsa')p.m.pre++;
  if(ci.kind==='salto'){G.st.jump[p.t]++;p.m.sal++;}
  return catchBy(f,p,CATCH_MSG[ci.kind],ci.kind);
}
function landDisc(){
  const f=G.flight,L={x:f.tx,y:f.ty};
  G.hold=false;G.sprint=null;G.aiSprint=[];
  G.disc.x=L.x;G.disc.y=L.y;G.disc.z=0;
  clearFl();
  const atk=T[f.team].filter(p=>p!==f.thrower),def=T[1-f.team];
  const reach=p=>reachOf(f,p);
  const inR=arr=>arr.map(p=>({p,d:hyp(p.x-L.x,p.y-L.y)})).filter(o=>o.d<=reach(o.p)).sort((a,b)=>a.d-b.d);
  const A=inR(atk);let D=inR(def);
  G.flight=null;G.diveWin=null;
  const dv=G.dive;G.dive=null;
  if(dv&&dv.p.dv){dv.p.dv.end=G.tick||0;G.slowTail=SLOW_TAIL;}   // il tuffo e' finito (preso o a vuoto): il rallentatore continua un po' mentre si rialza
  G.noCine=!!dv;   // dopo un tuffo a tempo la vista resta quella di gioco: niente scene laterali per questo disco
  if(dv&&dv.p.t===1-f.team){   // il tuo difensore ha tentato il tuffo a tempo
    const p=dv.p,d=hyp(p.x-L.x,p.y-L.y),base=clamp(0.3+0.6*p.s.tuf/100-0.1*Math.max(0,d-reach(p)),0.08,0.95);
    let pr=clamp(base+DIVE_BONUS[dv.color],0.03,0.95);
    if(A.length)pr*=0.65;   // contro un ricevitore gia' a portata e' piu' difficile
    if(Math.random()<pr){G.st.dive[p.t]++;p.m.tuf++;return finishTurn(f,p,'Intercetto in tuffo!',L);}
    HOOKS.toast('Tuffo mancato',f.team);
    D=D.filter(o=>o.p!==p);   // il difensore e' fuori posizione
  }
  if(A.length&&!D.length)return tryCatch(f,A[0],def,L);
  if(D.length&&!A.length)return finishTurn(f,D[0].p,'Intercetto!',L);
  if(A.length&&D.length)return duel(f,A[0],D[0],reach);
  return diveChain(f,L,atk,def,reach);
}
function catchBy(f,p,msg,ck){
  registerThrow(f.thrower,true,f.cat);
  if(f.sparo)p.m.vel++;else p.m.sca++;
  G.brickWait=false;G.walk=null;playOnCatch(f.team,p);
  G.holder=p;G.poss=f.team;p.vx=p.vy=0;G.stallT=0;G.holdT=0;G.hbAtt=null;G.zoneH=null;G.hbOk=null;G.think=thinkFor(p.t,0.8,1.6);
  G.st.cmp[f.team]++;
  if(f.team===0&&!G.auto&&G.obs){const gn=(p.x-f.sx)*dirOf(0);G.obs.n++;if(gn>=22)G.obs.d++;else if(gn>=3&&gn<18)G.obs.u++;}   // cio' che l'avversario osserva del tuo gioco
  for(const q of T[f.team]){q.cs='set';q.cutT=rnd(0.4,1.6);}
  if(aiTeam(p.t)&&AIK(p.t).smart>=0.7&&!inEZ(p,f.team)){const pk=aiPick(p);if(pk.open>6&&(pk.best.x-p.x)*dirOf(p.t)>5)G.think*=0.62;}   // continuazione
  G.disc.x=p.x;G.disc.y=p.y;
  {let nd=9;for(const q of T[1-f.team])nd=Math.min(nd,hyp(q.x-p.x,q.y-p.y));if(nd>=3){p.m.cut++;f.thrower.m.dec++;}   // taglio efficace: ha ricevuto libero (e chi ha lanciato ha scelto bene)
   if(f.stall>=5){p.m.rst++;f.thrower.m.rst++;}                                                     // reset riuscito con lo stall alto
   const mk0=T[1-f.team].find(q=>q.mark===p);if(mk0&&nd<2)mk0.m.mk+=0.3;}                            // il marcatore era comunque addosso
  drillEvt('catch',f.team,p,f);
  G.lastPlay={gain:(p.x-f.sx)*dirOf(f.team),duel:!!f._duel,ck:ck||(/tuffo/i.test(msg||'')?'tuffo':(/salto/i.test(msg||'')?'salto':'')),team:f.team,pt:G.pointNo};   // per il replay dell'interfaccia
  if(inEZ(p,f.team)){p.m.vis++;f.thrower.m.vis++;p.m.g++;f.thrower.m.a++;scoreGoal(f.team,p);return;}
  ezCheck(f.team,p);   // vicino alla meta: parte l'attacco in meta
  HOOKS.toast(msg||'Presa!',f.team,{gain:(p.x-f.sx)*dirOf(f.team),p,ck:ck||(/tuffo/i.test(msg||'')?'tuffo':(/salto/i.test(msg||'')?'salto':''))});
  HOOKS.sfx('catch',/salto|tuffo|contesa|mano/i.test(msg||'')?1:0.65);
  if(/tuffo|salto/i.test(msg||'')){HOOKS.shake(4);G.freeze=Math.max(G.freeze,0.05);}
}
function finishTurn(f,p,msg,spot){
  registerThrow(f.thrower,false,f.cat);p.m.dif++;G.st.blk[p.t]++;
  if(f.intended){const mk0=T[1-f.team].find(q=>q.mark===f.intended);if(mk0)mk0.m.mk++;}   // buona marcatura: il lancio verso il suo uomo non e' arrivato
  const sp=spot||{x:p.x,y:p.y};   // dove il difensore prende il disco
  if(inEZ(sp,p.t)){   // CALLAHAN: intercetto o blocco nella meta che il difensore attacca (la meta avversaria) = punto per il difensore
    p.x=clamp(sp.x,1,FIELD_L-1);p.y=clamp(sp.y,1,FIELD_W-1);p.vx=p.vy=0;
    G.st.to[f.team]++;G.poss=p.t;G.holder=p;G.flight=null;G.marker=null;G.stallT=0;G.holdT=0;G.hbAtt=null;G.zoneH=null;G.zoneT=0;G.call=null;
    G.disc.x=p.x;G.disc.y=p.y;G.disc.z=1;
    for(const q of T[0].concat(T[1])){q.fl=null;q.boost=0;q.flD=0;q.cmd=null;}
    p.m.vis++;p.m.g++;HOOKS.shake(9);
    scoreGoal(p.t,p,'callahan');return;
  }
  HOOKS.sfx('block');HOOKS.shake(/tuffo|salto/i.test(msg||'')?5:3);G.freeze=Math.max(G.freeze,0.07);
  turnover(p.t,p.x,p.y,p,msg,p.t);
}
function turnover(newTeam,x,y,picker,msg,benefit){
  const spot={x:clamp(x,1,FIELD_L-1),y:clamp(y,1,FIELD_W-1)};
  const pk=picker||nearestTo(T[newTeam],spot.x,spot.y);
  // nessun teletrasporto: chi raccoglie corre fino al disco (G.walk, fase 0) e da li' si riparte. Se il disco cade nella meta che il nuovo
  // possessore attacca non si gioca li': dopo averlo raccolto cammina fino alla linea di meta (fase 1), come dice il regolamento
  const ez=!picker&&inEZ(spot,newTeam);
  if(ez){const dr=dirOf(newTeam),line=dr>0?FIELD_L-EZ:EZ;G.walk={pick:{x:spot.x,y:spot.y},line:{x:line-dr*0.6,y:clamp(spot.y,2.5,FIELD_W-2.5)},stage:0};pk.vx=pk.vy=0;}
  else if(hyp(pk.x-spot.x,pk.y-spot.y)>0.8){G.walk={pick:{x:spot.x,y:spot.y},line:null,stage:0};pk.vx=pk.vy=0;}
  else{pk.x=spot.x;pk.y=spot.y;pk.vx=pk.vy=0;G.walk=null;}
  G.brickWait=false;
  G.st.to[1-newTeam]++;
  if(1-newTeam===1){const k=G.opp.att,r=G.aiRec||(G.aiRec={});(r[k]||(r[k]=[0,0]))[1]++;}   // l'IA tiene il conto dei dischi persi con ogni schema
  G.poss=newTeam;G.holder=pk;G.flight=null;G.marker=null;G.stallT=0;G.holdT=0;G.hbAtt=null;G.zoneH=null;G.zoneT=0;G.call=null;
  HOOKS.sfx('turn',newTeam);
  if(G.walk){G.disc.x=spot.x;G.disc.y=spot.y;G.disc.z=0;}else{G.disc.x=pk.x;G.disc.y=pk.y;G.disc.z=1;}
  for(const p of T[0].concat(T[1])){p.fl=null;p.boost=0;p.flD=0;p.cs='set';p.cutT=rnd(0.6,1.6);p.cmd=null;}
  assignMarks();G.pb=[null,null];startPlay(newTeam);
  G.hbOk=null;G.think=thinkFor(newTeam,0.9,1.7);
  if(msg)HOOKS.toast(msg,benefit===undefined?newTeam:benefit);
  drillEvt('to',newTeam,pk,msg);
}
// ultimo punto del volo ancora dentro il campo (lungo la traiettoria vera, curva compresa): li' il disco e' uscito
function oobSpot(f){
  for(let s=1;s>=0;s-=0.02){const P=flightAt(f,s);if(P.x>=0&&P.x<=FIELD_L&&P.y>=0&&P.y<=FIELD_W)return P;}
  return {x:f.sx,y:f.sy};
}
function duel(f,a,d,reach){
  const hi=f.high;
  const base=(o,isA)=>{
    const p=o.p,near=(reach(p)-o.d)*8;   // la posizione conta: chi e' piu' dentro alla portata parte avvantaggiato
    if(hi)return (isA?p.s.sal:p.s.sal*0.7+p.s.dif*0.3)+near;            // disco alto: conta il Salto (in difesa anche la Difesa)
    return (isA?p.s.sca*0.5+p.s.vel*0.2+p.s.agi*0.3:p.s.dif*0.5+p.s.sca*0.3+p.s.agi*0.2)+near;   // disco basso: non si salta, contano Scatto, Agilita', Velocita' e Difesa
  };
  // duello: decidono qualita' fisiche, posizione (chi e' piu' vicino al disco), tempismo (chi e' arrivato prima sul punto) e le mani di chi riceve; il caso pesa meno di prima
  const early=clamp(((d.p._t||0)-(a.p._t||0))*7,-9,9);
  const sa=base(a,true)+(f.intended===a.p?4:0)+(a.p.s.pre-60)*0.22+early-f.sp.cd*40+(hi&&hasT(a.p,'sky')?7:0),sd=base(d,false)+(hasT(d.p,'lock')?5:0)+(hi&&hasT(d.p,'sky')?7:0),rA=rnd(0,16),rD=rnd(0,16);   // il caso pesa meno: decidono di piu' statistiche, posizione e tempismo
  const resolve=b=>(sa+rA+(a.p.t===0?b*22:0))>=(sd+rD+(d.p.t===0?b*22:0))?'att':'def';
  const apply=out=>{
    if(hi){G.st.jump[out==='att'?a.p.t:d.p.t]++;(out==='att'?a.p:d.p).m.sal++;}
    if(out==='att'){f._duel=true;catchBy(f,a.p,hi?'Presa in salto!':'Presa contesa!');}
    else finishTurn(f,d.p,hi?'Bloccato in salto!':'Intercetto!',{x:f.tx,y:f.ty});
  };
  if(hi&&G.opt.cine&&!G.noCine&&HOOKS.cine&&defEvt(f))HOOKS.cine({kind:'jump',a:a.p,d:d.p,resolve,apply});
  else apply(resolve(0));
}
function diveChain(f,L,atk,def,reach){
  const drOf=p=>3+2.4*clamp((p.s.tuf-40)/60,0,1);   // quanto oltre la portata ci si puo' tuffare: da 3 m (Tuffo 40) a 5,4 m (Tuffo 100)
  const lst=atk.map(p=>({p,att:true})).concat(def.map(p=>({p,att:false})))
    .map(o=>({...o,d:hyp(o.p.x-L.x,o.p.y-L.y)}))
    .filter(o=>o.d>reach(o.p)&&o.d<=reach(o.p)+drOf(o.p)).sort((a,b)=>a.d-b.d);
  const used=new Set(),pOf=o=>clamp(0.3+0.6*o.p.s.tuf/100-0.1*(o.d-reach(o.p)),0.08,0.95);
  const step=i=>{
    while(i<lst.length&&used.has(i))i++;
    if(i>=lst.length){
      const oob=L.x<0||L.x>FIELD_L||L.y<0||L.y>FIELD_W,sp=oob?oobSpot(f):L;   // fuori: si riparte dal punto in cui il disco ha lasciato il campo
      registerThrow(f.thrower,false,f.cat);HOOKS.sfx('drop');
      return turnover(1-f.team,sp.x,sp.y,null,oob?'Fuori!':'Disco a terra',1-f.team);
    }
    const o=lst[i];used.add(i);
    // un attaccante e un difensore che si tuffano insieme: un'unica azione, vince chi arriva (a parita' il piu' vicino)
    const show=G.opt.cine&&!G.noCine&&HOOKS.cine&&(f.team===0||defMan());   // in difesa automatica i tuffi oltre la portata si risolvono da soli (resta il tuffo a tempo)
    const j=show?lst.findIndex((q,k)=>k>i&&!used.has(k)&&q.att!==o.att):-1;
    if(j>=0){
      used.add(j);
      const q=lst[j],A=o.att?o:q,D=o.att?q:o,pA=pOf(A),pD=pOf(D),mine=A.p.t===0?A:D;
      const resolve=b=>{
        const okA=Math.random()<clamp(pA+(A.p.t===0?b*0.18:0),0,0.97),okD=Math.random()<clamp(pD+(D.p.t===0?b*0.18:0),0,0.97);
        if(okA&&okD)return A.d<=D.d?'att':'def';
        return okA?'att':(okD?'def':null);
      };
      const apply=out=>{
        if(out==='att'){G.st.dive[A.p.t]++;A.p.m.tuf++;catchBy(f,A.p,'Presa in tuffo!');}
        else if(out==='def'){G.st.dive[D.p.t]++;D.p.m.tuf++;finishTurn(f,D.p,'Blocco in tuffo!',L);}
        else{HOOKS.toast('Tuffi mancati',1-f.team);step(i+1);}
      };
      HOOKS.cine({kind:'dive2',a:A.p,d:D.p,diver:mine.p,att:mine.att,timing:true,resolve,apply});
      return;
    }
    const p0=pOf(o),mine=o.p.t===0;
    const resolve=b=>Math.random()<clamp(p0+(mine?b*0.18:0),0,0.97);
    const apply=ok=>{
      if(ok){
        G.st.dive[o.p.t]++;o.p.m.tuf++;
        if(o.att)catchBy(f,o.p,'Presa in tuffo!');else finishTurn(f,o.p,'Blocco in tuffo!',L);
      }else{HOOKS.toast('Tuffo mancato',1-o.p.t);step(i+1);}
    };
    if(show){
      if(mine){HOOKS.cine({kind:'dive',diver:o.p,att:o.att,p:p0,timing:true,resolve,apply});return;}
      if(resolve(0)){HOOKS.cine({kind:'dive',diver:o.p,att:o.att,p:p0,timing:false,fixed:true,resolve,apply});return;}
      HOOKS.toast('Tuffo mancato',o.p.t===0?1:0);step(i+1);return;
    }
    apply(resolve(0));
  };
  step(0);
}

