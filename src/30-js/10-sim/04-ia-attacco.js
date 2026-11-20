/* ---- IA attacco (compagni senza disco) ---- */
const visOf=p=>p.s.vis/100;
const wanderW=p=>clamp((0.5-visOf(p))*0.6,0,1)*AIK(p.t).wander*(G.holder&&G.holder.t===p.t&&hasT(G.holder,'general')?0.5:1);   // quanto si muove a caso (visione bassa)
function pickCut(p,H,d,sch,w){
  if(Math.random()<w)return {x:rnd(6,FIELD_L-6),y:rnd(3,FIELD_W-3)};
  const hand=p.role==='H',speedy=(p.s.vel+p.s.sal)/2;
  // velocita' e salto alti: il giocatore tende ad andare lungo (piu' spari, meno passaggi per fare meta)
  const th=H.s?H:null;   // in volo H e' solo il punto d'arrivo: nessuna stima del lanciatore
  const deepP=hand?0.05:clamp(clamp((sch==='vert'||sch==='t1'||sch==='side'||sch==='i34'?0.24:(sch==='horz'?0.22:0.18))+(speedy-55)/100*0.8,0.05,0.8)*deepAppetite(p,th),0.03,0.85);   // chi lancia non spara: pochi tagli lunghi; sparo da tutto campo e intesa: molti
  let tx,ty,deep=false;
  if(Math.random()<deepP){deep=true;const dm=deepRun(p,th);tx=H.x+d*rnd(Math.min(24,dm*0.8),Math.max(24,dm));ty=rnd(4,FIELD_W-4);}
  else{const dx=hand?rnd(-6,4):rnd(8,14),sg=p.cSide=(p.cSide&&Math.random()<0.68)?p.cSide:-(p.cSide||(Math.random()<0.5?1:-1));   // il lato dei tagli successivi resta lo stesso piu' spesso: meno andirivieni da un lato all'altro
    tx=H.x+d*dx;ty=H.y+sg*rnd(hand?5:4,hand?10:12);}
  const gl=d>0?FIELD_L-EZ:EZ;
  if(!hand&&(gl-H.x)*d<RZ_CUT)tx=deep?gl+d*rnd(9,EZ-RZ_BACK):(d>0?Math.max(tx,gl+1.5):Math.min(tx,gl-1.5));   // vicino alla meta i tagli finiscono dentro la meta: il corto appena oltre la linea, il lungo verso il fondo senza uscire (prima i corti si fermavano fuori e i lunghi andavano sulla linea di fondo)
  return {x:clamp(tx,1,FIELD_L-1),y:clamp(ty,2.5,FIELD_W-2.5),deep};
}
const RZ_CUT=22;   // da quanti metri dalla linea di meta i tagli dei cutter vanno dentro la meta
// quanti tagli possono essere in corso insieme: visione alta 2, altrimenti 3 (prima senza limite sotto Visione 70: tutti partivano insieme verso il portatore)
const CUT_CAP=[2,3];
const cutCap=v=>v>0.7?CUT_CAP[0]:CUT_CAP[1];
// il punto verso cui un giocatore si sistema nella formazione cambia ogni fotogramma (il disco si muove, i compagni lo spingono via): senza filtro il giocatore tremava e
// invertiva la corsa. Il filtro lo fa scorrere piano verso il nuovo punto; un salto grande (nuova meta, cambio di possesso) lo porta subito.
function settleTgt(p,x,y,dt){
  if(p.sx===undefined||hyp(p.sx-x,p.sy-y)>16){p.sx=x;p.sy=y;}
  else{const k=1-Math.exp(-dt*2.6);p.sx+=(x-p.sx)*k;p.sy+=(y-p.sy)*k;}
  return {x:p.sx,y:p.sy};
}
function spaceClear(p,tx,ty,mates){
  for(const q of mates){
    if(q===p||q===G.holder)continue;
    if(q.cs==='cut'&&hyp(q.tx-tx,q.ty-ty)<10)return false;
    if(hyp(q.x-tx,q.y-ty)<7)return false;
  }
  return true;
}
// distanza minima dal portatore: i compagni e i difensori (tranne il suo marcatore) non si ammassano sul disco
const MIN_ATT=10,MIN_DEF=7.5;
// distanza di rispetto tra compagni: il punto dove un giocatore vuole andare viene spinto via da chi e' troppo vicino (spinta morbida, solo sotto R).
// Le formazioni normali (compagni a 6 m o piu') si allargano appena (<1 m); cambia di piu' quando lo schema si schiaccia contro la linea di meta o i tagli finiscono nello stesso posto
const SPREAD_R=7,SPREAD_K=0.7,SPREAD_DR=6,SPREAD_DK=0.6;   // attaccanti / difensori a zona
function spreadFrom(p,x,y,mates,R,k){
  let px=x,py=y;
  for(const q of mates){
    if(q===p||q===G.holder)continue;
    const mx=q.cs==='cut'&&q.tx!==undefined?q.tx:q.x,my=q.cs==='cut'&&q.ty!==undefined?q.ty:q.y;
    let dx=px-mx,dy=py-my,d=hyp(dx,dy);
    if(d>=R)continue;
    if(d<0.3){const an=(p.slot||0)*0.9+0.4;dx=Math.cos(an);dy=Math.sin(an);d=1;}
    const push=(R-d)*k;px+=dx/d*push;py+=dy/d*push;
  }
  return {x:clamp(px,1,FIELD_L-1),y:clamp(py,2.5,FIELD_W-2.5)};
}
// i compagni non devono mai correre addosso a chi ha il disco (non si riesce a mirare): SKIRT_R = raggio che il percorso aggira, TEAM_R = distanza sotto cui la guardia
// finale li spinge fuori. Prima solo il PUNTO d'arrivo stava lontano (MIN_ATT): la corsa verso un punto dall'altra parte del portatore gli passava sopra
const SKIRT_R=5.5,TEAM_R=3.2;
function skirt(p,H,x,y,R){
  const vx=x-p.x,vy=y-p.y,L2=vx*vx+vy*vy;if(L2<1)return {x,y};
  const t0=((H.x-p.x)*vx+(H.y-p.y)*vy)/L2;if(t0<=0)return {x,y};   // si allontana dal portatore: niente da aggirare (prima chi era gia' dentro il raggio restava fermo sul bordo)
  const t=Math.min(t0,1),cx=p.x+vx*t,cy=p.y+vy*t;
  if(hyp(cx-H.x,cy-H.y)>=R)return {x,y};
  return awayFrom(H,cx,cy,R);   // tappa sul percorso, spinta fuori dal raggio: poi si riparte verso il punto vero
}
function awayFrom(H,x,y,R){
  let dx=x-H.x,dy=y-H.y,d=hyp(dx,dy);
  if(d>=R)return {x,y};
  if(d<0.2){dx=0;dy=y>=MID?1:-1;d=1;}
  return {x:clamp(H.x+dx/d*R,1,FIELD_L-1),y:clamp(H.y+dy/d*R,2.5,FIELD_W-2.5)};
}
/* ---- CHIAMATE RAPIDE (tocco su un compagno): taglio profondo, taglio di rientro, isolamento, clear ---- */
function callCut(p,kind){   // kind: 'deep', 'under', 'reset' oppure 'auto' (un handler dietro o di fianco al disco fa il RESET; un cutter va profondo se e' vicino al disco, di rientro se e' gia' lontano)
  const h=G.holder;if(!h||h.t!==p.t||p===h||G.flight||G.walk)return null;
  const d=dirOf(p.t),fw=(p.x-h.x)*d;
  if(kind==='auto')kind=(p.role==='H'&&fw<6)?'reset':(fw>15?'under':'deep');   // prima anche l'handler alle spalle veniva mandato lungo: adesso offre lo scarico
  let x,y;
  if(kind==='deep'){x=h.x+d*clamp(Math.max(fw+16,30),26,Math.max(26,Math.min(60,deepRun(p,h)+4)));y=clamp(p.y+(p.y<MID?-2:2),4,FIELD_W-4);}
  else if(kind==='reset'){const open=G.marker?-G.closedSide:(p.y<h.y?-1:1);x=h.x-d*rnd(3.5,5.5);y=clamp(h.y+open*rnd(6,8),3,FIELD_W-3);}   // scarico: un passo dietro al disco, sul lato che il marcatore lascia aperto
  else{const open=G.marker?-G.closedSide:(p.y<h.y?-1:1);x=h.x+d*rnd(8,11);y=clamp(h.y+open*rnd(5,9),3,FIELD_W-3);}   // di rientro: verso il lato aperto dal marcatore
  x=clamp(x,2,FIELD_L-2);
  p.cmd={k:kind,x,y,t:kind==='deep'?4.5:3};p.cs='cut';p.tx=x;p.ty=y;p.cutT=p.cmd.t;p.calledT=G.tick;
  return kind;
}
function callIso(p){   // isolamento: il compagno taglia e gli altri gli liberano il corridoio
  const k=callCut(p,'auto');if(!k)return null;
  G.iso={p,t:3.5};
  for(const q of T[p.t]){if(q===p||q===G.holder)continue;q.cmd=null;q.cs='clear';q.cutT=3;}
  return k;
}
function callClear(team){   // tutti tornano in formazione e ripartono con tagli nuovi
  if(!G.holder||G.holder.t!==team||G.flight)return false;
  for(const q of T[team]){if(q===G.holder)continue;q.cmd=null;q.cs='clear';q.cutT=rnd(0.3,0.9);}
  G.iso=null;return true;
}
/* ---- TAGLIO A LIBERARE (clear) ----
   Un taglio che non riceve il disco non deve restare nella corsia davanti al portatore, dove chiude la linea di passaggio ai compagni:
   chi lo finisce li' dentro esce di lato (stato 'out'), verso la linea laterale dalla sua parte, poi torna nella formazione ('clear').
   Succede in due momenti: quando il taglio finisce senza passaggio (se e' arrivato al punto aspetta un attimo prima, OUT_WIN: e' il momento
   in cui e' libero per ricevere; se il taglio e' scaduto esce subito) e quando il disco va a un altro compagno mentre sta ancora tagliando
   (catchBy: il taglio e' fallito e il nuovo portatore ha bisogno della corsia). Con Visione alta lo fa sempre, con Visione bassa ogni tanto
   resta dov'e' (vecchio comportamento). */
const LANE_HW=5.5,OUT_DY=[3,5],OUT_WIN=[0.35,0.7],OUT_T=1.8;
function laneOut(p,H,d){
  const dy=p.y-H.y;if(Math.abs(dy)>=LANE_HW||(p.x-H.x)*d<2)return null;   // fuori dalla corsia (o dietro al portatore): niente da liberare
  let s=Math.sign(dy)||(H.y<MID?1:-1),y=H.y+s*(LANE_HW+rnd(OUT_DY[0],OUT_DY[1]));
  if(y<2.5||y>FIELD_W-2.5){s=-s;y=H.y+s*(LANE_HW+rnd(OUT_DY[0],OUT_DY[1]));}   // la corsia e' contro la linea laterale: esce dall'altra parte
  // continua un poco nel verso in cui correva: uscire di lato non e' un'inversione di corsa
  return {x:clamp(p.x+clamp(p.vx*0.35,-2.5,2.5),1,FIELD_L-1),y:clamp(y,2.5,FIELD_W-2.5)};
}
function clearOut(q,H,arr){   // prova il taglio a liberare: true se q esce di lato (arr: e' arrivato in fondo al taglio)
  const o=H&&!G.flight&&Math.random()<clamp(0.6+visOf(q)*0.6,0,1)?laneOut(q,H,dirOf(q.t)):null;if(!o)return false;
  q.cs='out';q.oD=arr?rnd(OUT_WIN[0],OUT_WIN[1]):0;q.tx=o.x;q.ty=o.y;q.cutT=q.oD+OUT_T;(G.st.clr||(G.st.clr=[0,0]))[q.t]++;return true;   // G.st.clr: le partite sospese prima di questo contatore non lo hanno
}
/* Chi non sta tagliando e si ritrova sulla linea di passaggio verso un compagno che taglia (fermo in formazione, in attesa nello schema a
   sequenza o di ritorno) fa un passo di lato: il disco deve poter arrivare a chi si e' liberato. Si guarda sia la linea verso dove il
   compagno e' adesso sia quella verso il punto in cui sta andando; ci si sposta dalla parte dove si e' gia', di DODGE_D+DODGE_M dalla linea. */
const DODGE_D=3,DODGE_M=1.5,DODGE_T=1.6,DODGE_V=1;   // DODGE_V: e' un passo di lato, non uno scatto (a velocita' piena rientrare in formazione diventava un ripensamento)
const cutting=q=>q.cs==='cut'||!!q.cmd||!!q.sq;   // sta tagliando: taglio libero, chiamata rapida o movimento dello schema a sequenza (q.sq)
function laneDodge(p,H,atk){
  if(!H||G.flight||G.walk){p.dz=null;return null;}
  if(p.dz&&(p.dz.h!==H||(p.dz.t-=1/60)<=0))p.dz=null;
  for(const c of atk){
    if(c===p||c===H||!cutting(c))continue;
    for(const t of [[c.x,c.y],c.cmd?[c.cmd.x,c.cmd.y]:(c.sq&&c.rt?[c.rt.x,c.rt.y]:[c.tx,c.ty])]){
      if(t[0]===undefined)continue;
      const vx=t[0]-H.x,vy=t[1]-H.y,L2=vx*vx+vy*vy;if(L2<25)continue;
      const u=((p.x-H.x)*vx+(p.y-H.y)*vy)/L2;if(u<0.1||u>0.95)continue;
      const qx=H.x+vx*u,qy=H.y+vy*u;if(hyp(p.x-qx,p.y-qy)>=DODGE_D)continue;
      const L=Math.sqrt(L2),nx=-vy/L,ny=vx/L,vp=p.vx*nx+p.vy*ny,k=DODGE_D+DODGE_M;
      // il lato resta quello scelto la prima volta (la linea si sposta con chi taglia: cambiare lato era un dondolio); la prima volta chi corre
      // esce dalla parte verso cui va (mai un'inversione di corsa), chi e' fermo da quella dove si trova
      let s=p.dz?p.dz.s:(hyp(p.vx,p.vy)>2.5&&Math.abs(vp)>0.3?Math.sign(vp):(((p.x-qx)*nx+(p.y-qy)*ny)>=0?1:-1));
      if(qy+ny*s*k<2||qy+ny*s*k>FIELD_W-2)s=-s;   // contro la linea laterale: dall'altra parte
      return p.dz={x:clamp(qx+nx*s*k,1,FIELD_L-1),y:clamp(qy+ny*s*k,2,FIELD_W-2),t:DODGE_T,h:H,s};
    }
  }
  return p.dz;   // fuori dalla linea: resta ancora un po' dove si e' spostato, poi torna al suo posto
}
function updateAttackers(dt){
  const P=G.poss,atk=T[P],d=dirOf(P),Hh=G.holder,fl0=G.flight,H=Hh||((fl0&&fl0.team===P)?{x:fl0.tx,y:fl0.ty}:G.ref);   // in volo: ci si dispone attorno al punto d'arrivo
  // il lato in cui si dispone l'attacco cambia solo quando il portatore supera il centro di piu' di 2 m: prima, passando a ridosso della mezzeria, tutti scambiavano lato a ogni passo
  if(G.sideA===undefined||Math.abs(H.y-MID)>=2)G.sideA=H.y<MID?1:-1;
  const side=G.sideA,sch=P===0?G.sch.att:G.opp.att;
  let active=0;for(const p of atk)if(p!==Hh&&p.cs==='cut')active++;
  if(G.iso){G.iso.t-=dt;if(G.iso.t<=0||!Hh||G.flight||!G.iso.p.cmd)G.iso=null;}
  if(Hh&&!G.flight&&G.stallT>4.5&&G.resetH!==Hh){
    G.resetH=Hh;let b=null,bd=1e9;for(const p of atk){if(p===Hh||p.cmd||p.role!=='H')continue;const dd=hyp(p.x-Hh.x,p.y-Hh.y);if(dd<bd){bd=dd;b=p;}}
    if(b){const open=G.marker?-G.closedSide:(Hh.y<MID?1:-1);b.cmd={k:'reset',x:clamp(Hh.x-d*4.5,2,FIELD_L-2),y:clamp(Hh.y+open*6.5,3,FIELD_W-3),t:3};b.cs='cut';}
  }
  aiIso(P,Hh,dt);   // l'IA isola il cutter che ha un vantaggio sul suo marcatore
  const mvA=(q,x,y,dt0,am,vm)=>{const g=Hh&&!G.flight&&!G.walk?skirt(q,Hh,x,y,SKIRT_R):{x,y};moveTo(q,g.x,g.y,dt0,am,vm);};   // i compagni aggirano chi ha il disco
  const isoT=G.iso&&G.iso.p.t===P?G.iso.p.cmd:null;   // corridoio da lasciare libero
  for(const p of atk){
    p.rt=null;p.sq=0;   // dove sta andando (solo per disegnare la linea del taglio); sq: corre un movimento dello schema a sequenza
    if(p===Hh){
      if(G.walk){const tg=G.walk.stage?G.walk.line:G.walk.pick;if(G.walk.stage)moveTo(p,tg.x,tg.y,dt,0.55,0.4);else moveTo(p,tg.x,tg.y,dt);}   // corre a prendere il disco, poi lo porta camminando alla linea
      else moveTo(p,p.x,p.y,dt);
      continue;
    }
    if(G.pull&&G.pull.landed&&G.pull.picker===p){moveTo(p,G.disc.x,G.disc.y,dt,0.55,0.4);continue;}   // disco a terra: va a prenderlo camminando
    if(p.fl){const sp=sprinting(p),dt2=G.flight&&G.flight.sparo&&hasT(p,'deep');mvA(p,p.fl.x,p.fl.y,dt,(sp?SPRINT_AM:1)*(dt2?1.1:1),(sp?SPRINT_VM:1)*(dt2?1.04:1));continue;}
    if(G.call&&G.call.q===p&&Hh&&!G.flight){p.rt={x:G.call.x,y:G.call.y};moveTo(p,G.call.x,G.call.y,dt,1.1,1);continue;}
    if(p.cmd){   // chiamata rapida: corre al punto indicato, piu' deciso di un taglio normale
      const c=p.cmd;c.t-=dt;
      const go=c.k==='go'&&G.flight&&G.flight.team===P;   // give-and-go: si continua a correre mentre il disco e' in volo
      if(c.t<=0||(!Hh&&!go)||(G.flight&&!go)||hyp(p.x-c.x,p.y-c.y)<1.5){p.cmd=null;p.cs='hold';p.cutT=rnd(0.5,0.9);}
      else{p.rt={x:c.x,y:c.y};mvA(p,c.x,c.y,dt,1.15,1);continue;}
    }   // chiamato dal lanciatore: corre nella zona indicata
    {const tg=pbTarget(P,p);if(tg){
      if(tg.hold){const o=laneDodge(p,Hh,atk);if(o)mvA(p,o.x,o.y,dt,1,DODGE_V);else mvA(p,p.x,p.y,dt);}
      else if(tg.free){   // non ha un movimento previsto: prova comunque a liberarsi con piccoli tagli attorno al suo posto (fuori e dentro)
        p.fT=(p.fT||0)-dt;
        if(p.fT<=0||p.fx===undefined){
          let tight=99;for(const q of T[1-P])tight=Math.min(tight,hyp(q.x-p.x,q.y-p.y));
          const out=!p.fOut;p.fOut=out;if(!p.fs||Math.random()<0.3)p.fs=-(p.fs||1);   // il lato resta lo stesso per piu' tagli: prima cambiava a ogni passo e il giocatore dondolava
          const big=tight<2.5?1.4:1;
          if(out){p.fx=clamp(tg.post.x+d*rnd(3,7)*big,1,FIELD_L-1);p.fy=clamp(tg.post.y+p.fs*rnd(3,6)*big,2.5,FIELD_W-2.5);}
          else{p.fx=tg.post.x;p.fy=tg.post.y;}
          p.fT=rnd(4.5,7);   // un nuovo piccolo taglio ogni 5-6 secondi circa (prima 1,4-2,2: il giocatore andava e veniva di continuo)
          if(Math.random()<0.5){p.fx=p.x;p.fy=p.y;}   // ogni tanto resta dov'e': un momento fermo tra un movimento e l'altro
        }
        const o=laneDodge(p,Hh,atk);if(o)mvA(p,o.x,o.y,dt,1,DODGE_V);else mvA(p,p.fx,p.fy,dt);
      }
      else{p.rt={x:tg.x,y:tg.y};p.sq=G.pb[P].stage!=='set'?1:0;mvA(p,tg.x,tg.y,dt,tg.am,tg.vm);}
      continue;
    }}   // schema a sequenza
    const v=visOf(p),w=wanderW(p);
    p.cutT-=dt;
    if(G.flight&&p.cs==='cut'&&v>=0.55&&G.flight.team===P&&hyp(p.tx-G.flight.tx,p.ty-G.flight.ty)<7)p.cs='clear';      // disco partito per un altro: libera lo spazio solo se il suo taglio finisce dove sta per arrivare il disco; altrimenti completa lo scatto
    if(p.cs==='set'){
      const a=anchor(sch,p.slot,H,d,side);
      p.wT-=dt;if(p.wT<=0){p.wx=rnd(6,FIELD_L-6);p.wy=rnd(3,FIELD_W-3);p.wT=rnd(0.9,2.2);}
      const st0=spreadFrom(p,lerp(a.x,p.wx,w),lerp(a.y,p.wy,w),atk,SPREAD_R,SPREAD_K),sg0=awayFrom(H,st0.x,st0.y,MIN_ATT),sg1=isoT?awayFrom(isoT,sg0.x,sg0.y,10):sg0,dz=laneDodge(p,Hh,atk),sg=dz||settleTgt(p,sg1.x,sg1.y,dt),close=hyp(p.x-H.x,p.y-H.y)<MIN_ATT;mvA(p,sg.x,sg.y,dt,close||dz?1.7:0.85,close?1.2:1);
      const hc=heroCutOn(p);if(hc)p.cutT-=dt*1.5;   // superpoteri: il compagno trasformato riparte prima e non aspetta il suo turno
      if(p.cutT<=0&&Hh&&!G.flight&&!isoT){
        let tightD=99;for(const q of T[1-P])tightD=Math.min(tightD,hyp(q.x-p.x,q.y-p.y));
        const tight=tightD<2.2&&G.holdT>0.8;   // marcato stretto: deve liberarsi, non aspettare
        if(v>=0.5&&G.holdT<0.5){p.cutT=0.15;}                // aspetta che il lanciatore sia pronto
        else{
          const tg=heroCut(p,H,d)||pickCut(p,H,d,sch,w);
          if(!tight&&!hc&&(active>=cutCap(v)||(Math.random()<clamp(0.12+v*1.1,0,1)&&!spaceClear(p,tg.x,tg.y,atk))))p.cutT=rnd(0.3,0.7); // aspetta che i compagni liberino lo spazio: tetto ai tagli contemporanei a ogni livello di Visione
          else{p.cs='cut';const tg2=spreadFrom(p,tg.x,tg.y,atk,SPREAD_R,SPREAD_K),tc=awayFrom(H,tg2.x,tg2.y,MIN_ATT);p.tx=tc.x;p.ty=tc.y;p.cutT=tg.deep?3.8:2.4;active++;
            if(!isoT&&w<0.5){const n0=G.st.pair[P];pairCut(p,!!tg.deep,H,d,atk);if(G.st.pair[P]>n0)active++;}}   // taglio in coppia
        }
      }
    }else if(p.cs==='cut'){
      p.rt={x:p.tx,y:p.ty};mvA(p,p.tx,p.ty,dt);
      const arr=hyp(p.x-p.tx,p.y-p.ty)<1.2;
      if(arr||p.cutT<=0){
        if(!clearOut(p,Hh,arr)){p.cs='hold';p.cutT=rnd(1.2,2.2);}   // fuori dalla corsia si ferma un momento: prima chi vedeva bene ripartiva subito (0,3-0,8 s) e il campo era un via vai
      }
    }else if(p.cs==='out'){
      if(p.oD>0){p.oD-=dt;mvA(p,p.x,p.y,dt);}   // ancora libero per ricevere: un attimo fermo
      else{p.rt={x:p.tx,y:p.ty};mvA(p,p.tx,p.ty,dt,1.1,1);}
      if(p.oD<=0&&(hyp(p.x-p.tx,p.y-p.ty)<1.5||p.cutT<=0))p.cs='clear';   // fuori dalla corsia: torna nella formazione
    }else if(p.cs==='hold'){
      const o=laneDodge(p,Hh,atk);if(o)mvA(p,o.x,o.y,dt,1,DODGE_V);else mvA(p,p.x,p.y,dt);
      if(p.cutT<=0){
        if(Math.random()<clamp(v*1.15,0,1))p.cs='clear';
        else{p.cs='set';p.cutT=rnd(1.5+0.9*v,4);}
      }
    }else{                                                    // clear: torna nella formazione dello schema
      const a0=anchor(sch,p.slot,H,d,side),a1=spreadFrom(p,a0.x,a0.y,atk,SPREAD_R,SPREAD_K),a2=awayFrom(H,a1.x,a1.y,MIN_ATT),a3=isoT?awayFrom(isoT,a2.x,a2.y,10):a2,a=settleTgt(p,a3.x,a3.y,dt),close=hyp(p.x-H.x,p.y-H.y)<MIN_ATT;
      mvA(p,a.x,a.y,dt,close?1.7:1,close?1.2:1);
      if(hyp(p.x-a.x,p.y-a.y)<2.5){p.cs='set';p.cutT=rnd(1.5+0.9*v,4);}   // in formazione si aspetta di piu' prima del taglio successivo: meno scatti e inversioni, piu' leggibili
    }
  }
  // guardia finale: chi si ritrova comunque troppo vicino al portatore (partenza dei punti, scatti, urti) viene spinto fuori e perde la velocita' verso di lui
  if(Hh&&!G.flight&&!G.walk&&G.mode==='play')for(const q of atk){
    if(q===Hh)continue;
    let dx=q.x-Hh.x,dy=q.y-Hh.y,dd=hyp(dx,dy);if(dd>=TEAM_R)continue;
    if(dd<0.2){dx=0;dy=q.y>=MID?1:-1;dd=1;}
    const ux=dx/dd,uy=dy/dd,step=Math.min(TEAM_R-dd,14*dt);
    q.x=clamp(q.x+ux*step,1,FIELD_L-1);q.y=clamp(q.y+uy*step,1,FIELD_W-1);
    const vin=q.vx*ux+q.vy*uy;if(vin<0){q.vx-=vin*ux;q.vy-=vin*uy;}
  }
}

