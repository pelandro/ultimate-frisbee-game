/* ---- lancio ---- */
function closedness(th,vx,vy){
  const mk=G.marker;if(!mk||mk.t===th.t)return 0;
  const mx=mk.x-th.x,my=mk.y-th.y,md=hyp(mx,my),vd=hyp(vx,vy);
  if(md>4||md<0.01||vd<0.01)return 0;
  const ang=Math.acos(clamp((mx*vx+my*vy)/(md*vd),-1,1));
  return clamp(1-ang/(55*Math.PI/180),0,1);
}
function throwInfo(th,vx,vy,dist){
  const sparo=dist>=SPARO_D,m=streakMod(th),base=(sparo?th.s.spa:th.s.lan)+m,c=closedness(th,vx,vy);
  let skill=base*(1-0.65*c)+(th.s.buc+m)*0.65*c;
  if(c>0&&G.marker)skill-=(8+(G.marker.s.dif-60)*0.1)*c*(hasT(th,'break')?0.5:1);
  skill-=Math.max(0,G.stallT-6)*2.2*(hasT(th,'general')?0.55:1);
  skill=clamp(skill,20,99);
  const keys=[sparo?'spa':'lan'];if(c>0.15)keys.push('buc');
  const label=(c>0.15?'Buco':(sparo?'Sparo':'Lancio'))+(c>0.15&&sparo?' + sparo':'');
  return {skill,c,sparo,keys,label};
}
const sigmaOf=(skill,dist)=>(100-skill)/100*(0.8+dist*0.14);
/* ---- TIPI DI LANCIO ----
   Stile scelto dal giocatore: 0 = piatto, 1 = sopra la testa, 2 = blade. Il gioco ne ricava il lancio:
   - piatto: ROVESCIO o DRITTO, secondo il lato da cui conviene rilasciare (quello lontano dal marcatore, cosi' la curva gli gira attorno).
     Il rovescio e' il piu' preciso; il dritto parte prima (meno handblock) e viaggia piu' veloce, ma perde precisione sulla distanza. Da 30 m e' un HUCK: lungo e galleggiante.
   - sopra la testa: SCOOBER fino a 14 m (rapido, scavalca le mani del marcatore), HAMMER oltre (arco alto: nessuno lo intercetta lungo la linea, ma e' impreciso e lento).
   - BLADE: disco di taglio, altissimo e velocissimo: arriva prima che la difesa si muova, ma e' il piu' impreciso e il piu' difficile da prendere.
   v = velocita' media (m/s), sig = dispersione, hb = handblock del marcatore, lane = intercetto lungo la linea, curve = curvatura laterale (frazione della distanza),
   ease = quanto rallenta in volo (>1 galleggia alla fine, <1 accelera in picchiata), cd = difficolta' della presa, hi = arriva dall'alto (si salta) */
const SCOOB_D=14;
const THROWS={
  backhand:{name:'Rovescio',v:23,sig:1,hb:1,lane:1,curve:0.085,ease:1.12,cd:0,hi:false},
  forehand:{name:'Dritto',v:26.5,sig:1.03,hb:0.85,lane:1,curve:0.06,ease:1.06,cd:0.012,hi:false},
  scoober:{name:'Scoober',v:19,sig:1.3,hb:0.35,lane:0.45,curve:0.03,ease:1,cd:0.035,hi:false},
  hammer:{name:'Hammer',v:17.9,sig:1.6,hb:0.5,lane:0,curve:0,ease:1.08,cd:0.06,hi:true},
  huck:{name:'Huck',v:23.4,sig:1,hb:1,lane:0,curve:0.1,ease:1.45,cd:0.025,hi:true},
  blade:{name:'Blade',v:30,sig:1.85,hb:0.7,lane:0,curve:0,ease:0.8,cd:0.14,hi:true}
};
const throwH=(kind,d)=>kind==='backhand'||kind==='forehand'?clamp(d*0.06,0.6,2.4):(kind==='scoober'?clamp(d*0.2,2,3.4):(kind==='blade'?clamp(d*0.32,5,13):clamp(d*0.17,4.5,9)));
const flightTime=(dist,high,sparo)=>Math.max(0.45,dist/(high===2?30:(sparo?23.4:(high?(dist<SCOOB_D?19:17.9):23))));
// punto del disco lungo il volo (s = 0..1): linea retta piu' la curva laterale
const flightAt=(f,s)=>({x:lerp(f.sx,f.tx,s)+f.cx*4*s*(1-s),y:lerp(f.sy,f.ty,s)+f.cy*4*s*(1-s)});
const flightS=(f,u)=>f.e>=1?1-Math.pow(1-u,f.e):Math.pow(u,1/f.e);
function pathDist(q,f){let b=1e9;for(let i=1;i<10;i++){const P=flightAt(f,i/10);b=Math.min(b,hyp(q.x-P.x,q.y-P.y));}return b;}
// progetto del lancio: tipo, lato del rilascio, dispersione, tempo. Lo usano il lancio vero, l'anteprima della mira e le scelte dell'IA
function planThrow(th,ax,ay,style,exec){
  style=style===true?1:(style|0);
  // gittata: oltre la distanza massima che il suo Sparo permette il disco non arriva, cade corto (vedi 07c-gittata.js)
  const mxR=throwMax(th),d0=hyp(ax-th.x,ay-th.y),short=d0>mxR;
  if(short){const f=mxR/d0;ax=th.x+(ax-th.x)*f;ay=th.y+(ay-th.y)*f;}
  const dx=ax-th.x,dy=ay-th.y,dist=Math.max(1.5,hyp(dx,dy)),info=throwInfo(th,dx,dy,dist);
  const rx=-dy/dist,ry=dx/dist;   // la destra del lanciatore
  let side=-1;const mk=G.marker;
  if(mk&&mk.t!==th.t&&hyp(mk.x-th.x,mk.y-th.y)<4)side=((mk.x-th.x)*rx+(mk.y-th.y)*ry)>0?-1:1;   // rilascio dal lato opposto al marcatore
  else{let bd=4,bq=null;for(const q of T[1-th.t]){const d=segDist(q.x,q.y,th.x,th.y,ax,ay);if(d<bd){bd=d;bq=q;}}if(bq)side=((bq.x-th.x)*rx+(bq.y-th.y)*ry)>0?-1:1;}
  const kind=style===2?'blade':(style===1?(dist<SCOOB_D?'scoober':(info.sparo?'huck':'hammer')):(info.sparo?'huck':(side>0?'forehand':'backhand')));
  const sp=THROWS[kind];
  let k=sp.sig;
  if(kind==='forehand')k*=1+0.012*Math.max(0,dist-16);
  if(kind==='scoober')k*=1+0.1*Math.max(0,dist-11);
  if(kind==='blade')k*=1+0.03*Math.max(0,dist-30)+0.05*Math.max(0,12-dist);
  const wn=windOn(info.skill,dx,dy,dist,Math.max(0.45,dist/sp.v),sp.hi,kind==='scoober');   // vento: deriva, dispersione, gittata
  const comf=throwComf(th)+(wn?wn.along*WIND_RANGE:0);if(dist>comf)k*=1+0.09*(dist-comf);   // gittata comoda: oltre la distanza che il lanciatore regge (dipende dallo Sparo e dal vento) la precisione crolla
  if(wn)k*=wn.k;
  let near=0;for(const q of T[1-th.t])if(q!==mk&&hyp(q.x-th.x,q.y-th.y)<3)near++;
  if(near)k*=1.06;   // un secondo difensore addosso disturba
  k*=exec||1;       // qualita' dell'esecuzione: un lancio affrettato e' meno preciso
  const vm=0.95+0.1*(info.sparo?th.s.spa:th.s.lan)/100;   // chi ha piu' Lancio (o Sparo, da lontano) lo fa viaggiare piu' veloce: meno tempo per intercettarlo
  return {kind,sp,info,dist,short,mx:mxR,vm,side,sig:sigmaOf(info.skill,dist)*k,T:Math.max(0.45,dist/(sp.v*vm)),H:throwH(kind,dist),
    sx:th.x,sy:th.y,tx:ax+(wn?wn.x:0),ty:ay+(wn?wn.y:0),cx:rx*side*sp.curve*dist,cy:ry*side*sp.curve*dist,e:sp.ease};
}
function aimSnap(th,wx,wy,high){
  const dx=wx-th.x,dy=wy-th.y,d0=hyp(dx,dy),ux=d0>0.01?dx/d0:1,uy=d0>0.01?dy/d0:0;
  const skill=(d0>=SPARO_D?th.s.spa:th.s.lan)+streakMod(th),snapR=1.2+skill*0.012;
  const Rb=snapR+0.03*d0,Ra=2.0+skill*0.02+0.18*d0;   // semiassi: di lato / lungo la linea di mira
  let best=null,bm=1;
  for(const q of T[th.t]){
    if(q===th)continue;
    const dd=hyp(q.x-th.x,q.y-th.y),tt=flightTime(dd,high||dd>=SPARO_D,dd>=SPARO_D);
    for(let k=0;k<2;k++){
      const qx=q.x+(k?q.vx*tt*0.8:0),qy=q.y+(k?q.vy*tt*0.8:0),rx=qx-th.x,ry=qy-th.y;
      const m=hyp((-rx*uy+ry*ux)/Rb,(rx*ux+ry*uy-d0)/Ra);
      if(m<bm){bm=m;best=q;}
    }
  }
  // isteresi: il compagno gia' agganciato resta agganciato finche' e' appena fuori dall'ellisse, cosi' il mirino non salta avanti e indietro tra due compagni che si muovono
  const sq=G.snapQ;
  if(sq&&sq!==th&&sq.t===th.t&&sq!==best){
    const dd=hyp(sq.x-th.x,sq.y-th.y),tt=flightTime(dd,high||dd>=SPARO_D,dd>=SPARO_D);let mq=9;
    for(let k=0;k<2;k++){const qx=sq.x+(k?sq.vx*tt*0.8:0),qy=sq.y+(k?sq.vy*tt*0.8:0),rx=qx-th.x,ry=qy-th.y;mq=Math.min(mq,hyp((-rx*uy+ry*ux)/Rb,(rx*ux+ry*uy-d0)/Ra));}
    if(mq<1.3&&mq<bm+0.3){best=sq;bm=Math.min(bm,mq);}
  }
  G.snapQ=best;
  return {best,snapR,m:bm};
}
function computeAim(th,wx,wy,high,nc){
  const {best,snapR}=aimSnap(th,wx,wy,high);
  if(!best){
    const c=G.call;
    if(!nc&&c&&c.q&&c.q.t===th.t&&c.q!==th){
      // zona libera: il compagno chiamato corre li', ma il disco va esattamente dove hai indicato (nessuna correzione)
      return {x:c.x,y:c.y,intended:c.q,snapR,called:true};
    }
    return {x:wx,y:wy,intended:null,snapR};
  }
  const dd=hyp(best.x-th.x,best.y-th.y),tt=flightTime(dd,high||dd>=SPARO_D,dd>=SPARO_D);
  return {x:clamp(best.x+best.vx*tt*0.8,0.5,FIELD_L-0.5),y:clamp(best.y+best.vy*tt*0.8,0.5,FIELD_W-0.5),intended:best,snapR};
}
// il mirino punta una zona senza compagni vicini: e' come dire al compagno piu' vicino a quella zona di correre li'
const CALL_MAX=14;   // distanza massima (m) tra la zona indicata e il compagno che viene chiamato a correrci
// il compagno chiamato smette di correre verso la zona: si ferma un attimo dov'e' (non torna a vagare a caso) e poi riprende il suo gioco
function endCall(){const c=G.call;if(!c)return;G.call=null;if(!c.q.fl){c.q.cs='hold';c.q.cutT=rnd(0.5,0.9);}}
const CALL_DEAD=3,CALL_GRACE=0.45;   // il punto della chiamata segue il dito solo oltre 3 m di spostamento; se il mirino esce dalla zona per un attimo la chiamata non cade subito
/* exact: al rilascio il disco va esattamente dove hai indicato, quindi il punto della chiamata coincide col dito e non ci sono tolleranze. */
function updateCall(th,wx,wy,high,exact){
  const lose=()=>{const c=G.call;if(!c)return;if(exact){endCall();return;}if(c.off===undefined)c.off=G.tick;if(G.tick-c.off>CALL_GRACE)endCall();};   // un tentennamento del mirino non fa fermare chi sta correndo
  if(G.flight||G.holder!==th){endCall();return;}
  if(hyp(wx-th.x,wy-th.y)<6||computeAim(th,wx,wy,high,true).intended){lose();return;}
  let best=null,bd=1e9;
  for(const q of T[th.t]){if(q===th)continue;const d=hyp(q.x-wx,q.y-wy);if(d<bd){bd=d;best=q;}}
  if(bd>CALL_MAX){lose();return;}   // zona lontana da tutti i compagni: lancio libero, nessuno viene chiamato
  const cur=G.call&&G.call.q;
  if(cur&&cur!==best&&hyp(cur.x-wx,cur.y-wy)<bd+4)best=cur;   // isteresi: non cambia compagno per un soffio
  if(cur&&cur!==best)endCall();
  const px=clamp(wx,1,FIELD_L-1),py=clamp(wy,1.5,FIELD_W-1.5),c=G.call;
  if(c&&c.q===best){
    c.off=undefined;
    const dd=hyp(px-c.x,py-c.y);
    if(exact||dd>CALL_DEAD*3){c.x=px;c.y=py;}   // zona cambiata di molto (o rilascio): nuovo punto
    else if(dd>CALL_DEAD){const k=(dd-CALL_DEAD)/dd*0.18;c.x+=(px-c.x)*k;c.y+=(py-c.y)*k;}   // il punto insegue il dito piano, solo per la parte oltre la tolleranza: senza scatti e senza tremare
  }else G.call={q:best,x:px,y:py};
}
const ZONE_LANE_K=2.0,ZONE_LANE_W=2.8;   // la zona chiude le linee di passaggio: i difensori leggono il lancio basso (il disco alto, Hammer e sparo, le scavalca)
function laneBlock(th,tx,ty,f){   // f = volo o progetto del lancio (con la sua curva); senza, linea retta dal lanciatore
  const zone=((th.t===0)?G.opp.def:G.sch.def)==='zone',ox=f?f.sx:th.x,oy=f?f.sy:th.y,lk=f?f.sp.lane:1;
  if(lk<=0)return null;
  let best=null,bp=0;
  for(const q of T[1-th.t]){
    if(hyp(q.x-ox,q.y-oy)<2.5||hyp(q.x-tx,q.y-ty)<2.5)continue;
    const fd=0.55+0.5*clamp((q.s.dif-40)/60,0,1);   // più Difesa, più intercetti
    const dd=f?pathDist(q,f):segDist(q.x,q.y,ox,oy,tx,ty);
    const pr=0.36*lk*(zone?ZONE_LANE_K:1)*fd*clamp(1-dd/(zone?ZONE_LANE_W:1.4),0,1);
    if(pr>bp){bp=pr;best=q;}
  }
  return best?{q:best,prob:bp}:null;
}
function estimateThrow(th,ax,ay,intended,high){
  const pl=planThrow(th,ax,ay,high),info=pl.info,dist=pl.dist,sig=pl.sig;
  ax=pl.tx;ay=pl.ty;   // con il vento il disco arriva spostato: e' li' che vanno contati difensori e ricevitori
  let p=1-Math.exp(-(3.2*3.2)/(2*sig*sig));
  const near=nearestTo(T[1-th.t],ax,ay),nd=hyp(near.x-ax,near.y-ay);
  if(nd<2.2)p*=0.5;else if(nd<4)p*=0.78;
  const lb=laneBlock(th,ax,ay,pl);if(lb)p*=1-lb.prob;
  if(intended){if(ttr(intended,ax,ay)>pl.T+0.4)p*=0.5;p*=1-dropProb(intended,pl.sp.cd+0.05);}
  else{let b=1e9;for(const q of T[th.t])if(q!==th)b=Math.min(b,ttr(q,ax,ay));if(b>pl.T+0.3)p*=0.2;}
  return {p:clamp(p,0.02,0.99),info,dist,sig,plan:pl};
}
// probabilita' di handblock, a Difesa pari al Buco del lanciatore. Colonne: lancio fuori dal cono rosso, a meta' cono, in pieno cono.
// Il tuo marcatore dipende dal colore del tocco (verde >= 0,6, giallo >= 0,25, rosso) e senza tocco vale 0%.
const HB_TAB={green:[0.06,0.20,0.35],yellow:[0.03,0.10,0.17],red:[0,0.02,0.08]};
const HB_AI=[0.01,0.05,0.12];   // il marcatore avversario non tocca: valori fissi
const HB_K=0.85;   // handblock un po' piu' rari: tutte le probabilita' (tue e avversarie) valgono l'85% delle tabelle
// HAMMER (lancio alto scelto sotto i 30 m; lo sparo non conta): passa sopra la testa del marcatore, quindi gli handblock valgono la meta' (HAMMER_HB); ma e' meno preciso: la dispersione e' moltiplicata per HAMMER_SIG, quindi chi ha poco Lancio peggiora molto e chi e' gia' preciso quasi niente (serve piu' Lancio per usarlo bene)
const HAMMER_HB=0.5,HAMMER_SIG=1.6;
const hbColor=q=>q>=0.6?'green':(q>=0.25?'yellow':'red');
const hbSkill=th=>th.s.buc+streakMod(th);   // il lanciatore si libera del marcatore con il Buco
const hbCurve=(a,c)=>{c=clamp(c,0,1);return c<=0.5?lerp(a[0],a[1],c/0.5):lerp(a[1],a[2],(c-0.5)/0.5);};
const hbRel=(th,mk)=>clamp(1+0.02*(mk.s.dif-hbSkill(th)),0.3,2);   // +20 di Difesa sul Buco = +40% di probabilita', -20 = -40%
function hbProb(th,info,mk,ha){
  if(mk.t===1||G.auto||G.skip||!defMan())return clamp(hbCurve(HB_AI,info.c)*hbRel(th,mk)*AIK(mk.t).hb*HB_K,0,0.9);   // marcatore avversario, prova automatica o difesa automatica: decidono le statistiche
  if(!ha)return 0;                                                               // il tuo marcatore senza tocco: 0%
  return clamp(hbCurve(HB_TAB[hbColor(ha.qual)],info.c)*hbRel(th,mk)*HB_K,0,0.9);
}
function doThrow(th,ax,ay,intended,style,exec){
  endCall();G.snapQ=null;
  const pl=planThrow(th,ax,ay,style,exec),info=pl.info,sp=pl.sp;
  const cat=info.c>0.15?'buc':(info.sparo?'spa':'lan');   // categoria del lancio: buco, sparo o lancio
  if(info.sparo)G.st.sp[th.t]++;if(pl.dist<10)G.st.sh[th.t]++;
  // handblock del marcatore sul rilascio: più probabile se il lancio passa nel cono rosso e se ha Difesa alta; i lanci sopra la testa lo scavalcano
  const mk=G.marker,ha=(G.hbAtt&&G.hbAtt.q===mk)?G.hbAtt:null;
  G.hbAtt=null;
  if(mk&&mk.t!==th.t&&hyp(mk.x-th.x,mk.y-th.y)<3.8){
    if(Math.random()<hbProb(th,info,mk,ha)*sp.hb){handblock(th,mk,cat);return;}
  }
  const dL=duoOf(th,intended),sg=pl.sig*(1-DUO_SIG*dL);   // intesa con il compagno a cui lancia
  const lx=pl.tx+randn()*sg,ly=pl.ty+randn()*sg,dl=Math.max(0.5,hyp(lx-th.x,ly-th.y));
  const rx=-(ly-th.y)/dl,ry=(lx-th.x)/dl;
  G.flight={sx:th.x,sy:th.y,tx:lx,ty:ly,t:0,T:Math.max(0.45,dl/(sp.v*pl.vm)),H:throwH(pl.kind,dl),high:sp.hi,team:th.t,thrower:th,intended,sparo:info.sparo,info,cat,
    kind:pl.kind,sp,duoL:dL,e:sp.ease,err:hyp(lx-pl.tx,ly-pl.ty),cx:rx*pl.side*sp.curve*dl,cy:ry*pl.side*sp.curve*dl,stall:G.stallT,brk:!!G.marker&&(ly-th.y)*G.closedSide>1.5};
  G.holder=null;G.stallT=0;G.holdT=0;G.st.thr[th.t]++;
  if(G.kinds)G.kinds[pl.kind]=(G.kinds[pl.kind]||0)+1;
  assignFlight();
  giveGo(th,dl);   // passaggio corto: chi lancia riparte per ricevere di nuovo
  HOOKS.vibe(14);HOOKS.sfx('throw',dl,sp.hi);
}
/* ---- streak: serie positiva (oltre 10 lanci riusciti di fila) e negativa (2 errori di fila) ---- */
const streakMod=p=>p.hot?5:(p.cold?-5:0);
function registerThrow(p,ok,cat){
  if(cat&&p.m)p.m[cat][ok?0:1]++;
  if(ok){
    p.run++;p.miss=0;
    if(p.cold&&p.run>=2)p.cold=false;          // due lanci riusciti: torna normale
    else if(!p.cold&&p.run>10)p.hot=true;      // serie positiva
  }else{
    p.hot=false;p.run=0;p.miss++;
    if(p.miss>=2)p.cold=true;                  // serie negativa
  }
}
// finestra per l'handblock: quando difendi e l'avversario sta per lanciare, il marcatore ha un cerchio che si stringe; il tocco giusto lo fa tentare
// durata del cerchio: piu' e' bravo il lanciatore (Buco) piu' va veloce, piu' e' alta la Difesa del marcatore piu' va piano
const hbDur=(h,mk)=>clamp(0.85+(mk.s.dif-hbSkill(h))*0.0102,0.5,1.3);
function hbWindow(){
  const h=G.holder,mk=G.marker;
  if(G.mode!=='play'||G.flight||G.brickWait||G.walk||!h||h.t!==1||!mk||mk.t!==0||!defMan()||G.skip)return null;
  if(hyp(mk.x-h.x,mk.y-h.y)>3.8||G.think<=0)return null;
  const Wd=hbDur(h,mk),rem=G.think/(G.k||K_DEF);   // secondi reali al lancio
  if(rem>Wd)return null;   // il cerchio compare quando mancano Wd secondi al lancio: la velocita' dipende solo dalle statistiche
  return {q:mk,remain:rem,tot:Wd,done:!!G.hbAtt,qual:G.hbAtt?G.hbAtt.qual:0};
}
function tryHandblock(){
  const w=hbWindow();if(!w||G.hbAtt)return -1;
  // il momento perfetto e' quando il cerchio arriva sull'anello interno: con il cerchio piu' veloce la tolleranza in secondi si accorcia
  const e=(w.remain-0.12)/(w.tot-0.12),qual=clamp(1-Math.abs(e)/0.33,0,1);
  G.hbAtt={q:w.q,qual};HOOKS.sfx('timing',qual);return qual;
}
function handblock(th,q,cat){
  registerThrow(th,false,cat);q.m.dif++;
  G.st.thr[th.t]++;G.st.blk[q.t]++;G.st.hb[q.t]++;
  HOOKS.vibe(30);HOOKS.sfx('slap');HOOKS.shake(5);G.freeze=Math.max(G.freeze,0.08);
  turnover(q.t,th.x,th.y,q,'Handblock!',q.t);
}
function assignFlight(){
  const f=G.flight,P=f.team,atk=T[P],def=T[1-P],L={x:f.tx,y:f.ty};
  for(const p of atk.concat(def)){p.fl=null;p.boost=0;p.flD=0;}
  for(const p of atk)p._t=p===f.thrower?1e9:ttr(p,L.x,L.y);
  for(const q of def)q._t=ttr(q,L.x,L.y);
  let rc=f.intended;
  if(!rc)rc=atk.filter(p=>p!==f.thrower).sort((a,b)=>a._t-b._t)[0];
  rc.fl=L;
  const chase=q=>{q.fl=L;q.flD=Math.max(0.05,(0.3-q.s.dif*0.001+rnd(0,0.1)+Math.max(0,0.08+(0.6-q.s.vis/100)*0.5))*AIK(q.t).react);};
  const zoneD=(P===0?G.opp.def:G.sch.def)==='zone';
  // uomo: insegue il marcatore del ricevitore. Zona: converge sul disco chi e' piu' vicino al punto d'arrivo (e un secondo se e' ad appena un passo), non chi ha "in custodia" il ricevitore
  if(zoneD){const near=def.slice().sort((a,b)=>a._t-b._t);chase(near[0]);if(near[1]&&near[1]._t<near[0]._t+0.45)chase(near[1]);}
  else{const m=def.find(q=>q.mark===rc);if(m)chase(m);}
  laneRead(f);   // gli altri difensori: chi vede passare il disco vicino prova a tagliargli la strada
  // sparo: i corridori sono scelti in automatico (il piu' vicino al punto d'arrivo). Il tuo scatta se tieni premuto, quelli avversari a volte da soli
  G.hold=false;G.sprint=null;G.aiSprint=[];
  const zone=(P===0?G.opp.def:G.sch.def)==='zone';
  // gli altri difensori non si buttano sul disco: restano sul proprio uomo (niente ammassi intorno al portatore)
  if(f.sparo){
    const runnerOf=team=>team===f.team?rc:T[team].filter(q=>q.fl).sort((a,b)=>a._t-b._t)[0]||null;
    const me=runnerOf(0),op=runnerOf(1);
    if(me&&!G.auto)G.sprint={p:me};
    G.aiSprint=(G.auto?[me,op]:[op]).filter(q=>q&&Math.random()<0.3+0.5*q.s.vis/100+AIK(q.t).sprint);
  }
}
function updateDisc(dt){
  const f=G.flight,d=G.disc;
  if(G.pull){
    const pu=G.pull;
    if(!pu.landed){
      pu.t+=dt;const u=Math.min(1,pu.t/pu.T);
      d.x=lerp(pu.sx,pu.tx,u);d.y=lerp(pu.sy,pu.ty,u);d.z=lerp(1.2,0.2,u)+4*pu.H*u*(1-u);
      if(pu.t>=pu.T){
        pu.landed=true;pu.lt=0;d.z=0;d.x=pu.spot.x;d.y=pu.spot.y;
        if(pu.oob)HOOKS.toast('Pull fuori! Si riparte dal brick',G.poss);
        else{const dr=dirOf(G.poss),dep=((dr>0?EZ:FIELD_L-EZ)-pu.spot.x)*dr;   // metri dentro la meta di chi riceve (negativi: il disco e' caduto piu' avanti)
          if(dep>=0)HOOKS.toast(dep>=6?'Gran pull!':'Buon pull',pu.team);else if(dep<-20)HOOKS.toast('Pull corto',G.poss);}
      }
    }else{
      pu.lt+=dt;
      // chi e' piu' vicino al disco (della squadra che riceve) lo prende: al volo se e' a portata nel momento in cui atterra, altrimenti
      // cammina fino al disco a terra e lo raccoglie li'. Nessun teletrasporto.
      const rc=T[G.poss].filter(q=>!q.inj);
      const near=nearestTo(rc,d.x,d.y);
      if(!pu.picker||hyp(pu.picker.x-d.x,pu.picker.y-d.y)>hyp(near.x-d.x,near.y-d.y)+2)pu.picker=near;
      const c=pu.picker,dist=hyp(c.x-d.x,c.y-d.y),inAir=pu.lt<0.3&&dist<=1.5;   // presa al volo solo se il disco atterra praticamente in mano
      if(inAir||dist<0.8||pu.lt>30){
        if(inAir){d.x=c.x;d.y=c.y;}   // presa al volo: il disco e' a pochi centimetri dalla mano
        c.vx=c.vy=0;clearFl();
        if(!inAir){c.x=clamp(d.x,0,FIELD_L);c.y=clamp(d.y,0,FIELD_W);}
        G.holder=c;G.pull=null;G.stallT=0;G.holdT=0;G.hbAtt=null;G.zoneH=null;G.hbOk=null;G.think=thinkFor(c.t,0.9,1.6,c);d.z=1;
        G.brickWait=!!pu.oob;G.brickT=0;G.walk=null;   // brick: l'attacco aspetta che la difesa si schieri
        for(const q of T[G.poss]){q.cs='set';q.cutT=rnd(0.5,1.6);}
        assignMarks();startPlay(G.poss);
      }
    }
    return;
  }
  if(!f){
    if(G.walk&&!G.walk.stage){d.x=G.walk.pick.x;d.y=G.walk.pick.y;d.z=0;return;}   // il disco resta a terra finche' non viene raccolto
    if(G.holder){d.x=G.holder.x;d.y=G.holder.y;d.z=1;}return;
  }
  f.t+=dt;const u=Math.min(1,f.t/f.T),fs=flightS(f,u),P=flightAt(f,fs);   // il disco parte veloce e rallenta (o, per il blade, accelera in picchiata) e segue la sua curva
  d.x=P.x;d.y=P.y;d.z=discZ(f,fs);
  if(f.t<f.T&&laneCheck(f,P,d.z))return;   // toccato da un difensore lungo il volo
  if(f.t>=f.T)landDisc();
}

