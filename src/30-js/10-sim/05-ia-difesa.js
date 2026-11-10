/* ---- IA difesa ---- */
function zoneAssign(){
  const P=G.poss,dT=T[1-P],d=dirOf(P);
  const free=dT.filter(q=>q!==G.marker),pairs=[];
  ZSLOTS.forEach((s,k)=>{const sx=G.ref.x+d*s[0],sy=G.ref.y+s[1];for(const q of free)pairs.push([hyp(q.x-sx,q.y-sy),q,k]);});
  pairs.sort((u,v)=>u[0]-v[0]);
  const uq=new Set(),uk=new Set();
  for(const [,q,k] of pairs){if(uq.has(q)||uk.has(k))continue;uq.add(q);uk.add(k);q.zs=k;}
}
/* ---- DIFESA GIOCABILE ----
   G.ctrl = il tuo difensore sotto controllo (anello azzurro); G.cdir = direzione data con il dito, le frecce o lo stick. Senza comandi si comporta come gli altri.
   Quando l'avversario lancia il controllo passa da solo al difensore che puo' arrivare prima sul disco: se lo porti sul punto d'arrivo intercetta o contende.
   G.dmode[squadra]: 0 = contenimento (dietro all'uomo: protegge il profondo), 1 = anticipo (davanti all'uomo: toglie i passaggi corti, rischia sul lungo) */
function autoCtrl(){
  if(G.auto||G.poss!==1){G.ctrl=null;return;}
  const f=G.flight;
  if(f){G.ctrl=G.sprint&&G.sprint.p.t===0?G.sprint.p:T[0].slice().sort((a,b)=>a._t-b._t)[0];return;}
  const h=G.holder;if(!h)return;
  let b=null,bd=1e9;for(const q of T[0]){if(q===G.marker)continue;const dd=hyp(q.x-h.x,q.y-h.y);if(dd<bd){bd=dd;b=q;}}
  G.ctrl=b;
}
function cycleCtrl(){   // passa al difensore successivo, dal piu' vicino al disco (o al punto d'arrivo) in poi
  if(G.poss!==1||G.auto)return;
  const f=G.flight,o=f?{x:f.tx,y:f.ty}:(G.holder||G.ref),list=T[0].slice().sort((a,b)=>hyp(a.x-o.x,a.y-o.y)-hyp(b.x-o.x,b.y-o.y));
  G.ctrl=list[(list.indexOf(G.ctrl)+1)%list.length];G.ctrlBy=true;
}
function updateDefenders(dt){
  const P=G.poss,dT=T[1-P],aT=T[P],d=dirOf(P),Hh=G.holder;
  const sch=P===0?G.opp.def:G.sch.def;
  if(Hh){G.ref.x=Hh.x;G.ref.y=Hh.y;}
  const ref=G.ref;
  let mk=null;
  if(Hh)mk=sch==='zone'?nearestTo(dT,Hh.x,Hh.y):(dT.find(q=>q.mark===Hh)||nearestTo(dT,Hh.x,Hh.y));
  G.marker=mk;
  if(P===1&&!G.auto){   // scelta automatica del difensore che guidi: cambia a ogni nuovo portatore e a ogni lancio
    if(G.flight){if(G.ctrlF!==G.flight){G.ctrlF=G.flight;autoCtrl();}}
    else if(Hh&&(G.ctrlH!==Hh||!G.ctrl||!dT.includes(G.ctrl))){G.ctrlH=Hh;G.ctrlBy=false;autoCtrl();}
  }else{G.ctrl=null;G.cdir=null;}
  const Hd=Hh;   // i difensori (tranne il marcatore) restano a distanza dal portatore; verso il punto d'arrivo possono andare a contendere il disco
  let cs=ref.y<MID?1:-1;if(sch==='man_in')cs=-cs;G.closedSide=cs;
  G.zoneT-=dt;
  if(sch==='zone'&&(G.zoneT<=0||G.zoneH!==Hh)){zoneAssign();G.zoneT=1.2;G.zoneH=Hh;}
  const dTeam=1-P,ai=aiTeam(dTeam),lvD=AIK(dTeam),idn=idOf(dTeam);
  // vicino alla propria meta non c'e' piu' profondo da proteggere: l'IA marca davanti all'uomo
  const nearGoal=Hh?((d>0?FIELD_L-EZ-Hh.x:Hh.x-EZ)<16):false,front=G.dmode[dTeam]===1||(ai&&nearGoal);
  // aiuti lontano dal disco: sempre con lo schema «uomo con aiuti», altrimenti quanto vuole l'identita' della squadra e il livello dell'IA
  const pf=sch==='man_poach'?1:(ai?0.45*idn.poach*lvD.poach:0);
  let deepA=null;if(Hh){let bf=-1e9;for(const a of aT){if(a===Hh)continue;const fw=(a.x-Hh.x)*d;if(fw>bf){bf=fw;deepA=a;}}}
  // CAMBI DI MARCATURA: se due difensori sono messi meglio scambiandosi l'uomo, se lo scambiano
  G.swT=(G.swT||0)-dt;
  if(sch!=='zone'&&G.swT<=0&&Hh){
    G.swT=0.45;
    for(let i=0;i<dT.length;i++)for(let j=i+1;j<dT.length;j++){
      const a=dT[i],b=dT[j];if(a===mk||b===mk||!a.mark||!b.mark||a.fl||b.fl||(a===G.ctrl&&G.cdir)||(b===G.ctrl&&G.cdir))continue;
      const now=hyp(a.x-a.mark.x,a.y-a.mark.y)+hyp(b.x-b.mark.x,b.y-b.mark.y),sw=hyp(a.x-b.mark.x,a.y-b.mark.y)+hyp(b.x-a.mark.x,b.y-a.mark.y);
      if(sw+3<now&&Math.random()<lvD.sw){const t=a.mark;a.mark=b.mark;b.mark=t;}
    }
  }
  for(const q of dT){
    q.nT-=dt;
    if(q.nT<=0){const A=clamp(1+(0.6-q.s.vis/100)*5,0.2,3)*AIK(q.t).mark*(hasT(q,'lock')?0.5:1);q.nx=rnd(-A,A);q.ny=rnd(-A,A);q.nT=rnd(0.6,1.4);}
    if(q===G.ctrl&&G.cdir){   // lo guidi tu
      const sp=sprinting(q);moveTo(q,clamp(q.x+G.cdir.x*8,0.5,FIELD_L-0.5),clamp(q.y+G.cdir.y*8,0.5,FIELD_W-0.5),dt,sp?SPRINT_AM:1.12,sp?SPRINT_VM:1);q.flD=0;q.m.dif+=0;continue;
    }
    if(q.fl){
      if(q.flD>0){q.flD-=dt;}
      else{const sp=sprinting(q);moveTo(q,q.fl.x,q.fl.y,dt,(q.boost?1.15:1)*(sp?SPRINT_AM:1),(q.boost?1.08:1)*(sp?SPRINT_VM:1));continue;}
    }
    if(Hh&&q===mk){
      moveTo(q,clamp(Hh.x+d*0.55,0,FIELD_L),clamp(Hh.y+cs*1.0,0,FIELD_W),dt,0.85+q.s.dif/180);continue;
    }
    if(sch==='zone'){
      const s=ZSLOTS[q.zs]||ZSLOTS[0];
      let sx=clamp(ref.x+d*s[0],1,FIELD_L-1),sy=clamp(ref.y+s[1],3,FIELD_W-3);
      let near=null,nd=22;
      for(const a of aT){if(a===Hh)continue;const dd=hyp(a.x-sx,a.y-sy);if(dd<nd){nd=dd;near=a;}}
      if(near){sx=lerp(sx,near.x+d*0.8,0.95);sy=lerp(sy,near.y,0.95);}
      const z0=spreadFrom(q,sx+q.nx,sy+q.ny,dT,SPREAD_DR,SPREAD_DK),zt=Hd?awayFrom(Hd,z0.x,z0.y,MIN_DEF):z0;
      moveTo(q,zt.x,zt.y,dt,Hd&&hyp(q.x-Hd.x,q.y-Hd.y)<MIN_DEF?1.7:1);
    }else{
      const a=q.mark;if(!a)continue;
      const react=clamp(0.42-q.s.dif*0.0034+0.06+(0.6-q.s.vis/100)*0.4,0.08,0.55)*(hasT(q,'lock')?0.7:1);
      let px=a.x+a.vx*react+d*0.9+q.nx,py=a.y+a.vy*react+q.ny;
      if(front&&Hd){const ax=Hd.x-a.x,ay=Hd.y-a.y,al=hyp(ax,ay);if(al>6){px=a.x+a.vx*react+ax/al*1.25+q.nx;py=a.y+a.vy*react+ay/al*1.25+q.ny;}}   // anticipo: tra l'uomo e il disco
      else if(a===deepA&&Hd)px+=d*1.6;   // contenimento: chi marca l'attaccante piu' avanzato tiene un passo in piu' verso la meta (copre il profondo)
      if(pf>0&&Hd&&a.cs!=='cut'&&!a.cmd&&!a.fl){   // AIUTO: se il suo uomo e' lontano dal disco e fermo, scala verso la linea di passaggio; appena l'uomo taglia torna su di lui
        const far=hyp(a.x-Hd.x,a.y-Hd.y);
        if(far>20){const k=clamp((far-20)/18,0,1)*0.42*pf;px=lerp(px,Hd.x+(a.x-Hd.x)*0.6,k);py=lerp(py,Hd.y+(a.y-Hd.y)*0.6,k);}
      }
      const close=hyp(q.x-a.x,q.y-a.y)<8;
      const mt=Hd?awayFrom(Hd,px,py,MIN_DEF):{x:px,y:py};
      moveTo(q,mt.x,mt.y,dt,Hd&&hyp(q.x-Hd.x,q.y-Hd.y)<MIN_DEF?1.7:(close?0.85+q.s.dif/180:1));
    }
  }
  drillPark(P,dT);
}
