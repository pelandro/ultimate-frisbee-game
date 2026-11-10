/* ---- CAMPO DI ALLENAMENTO (tutorial, allenamento libero, sfide): si usa il motore vero con poche regole in piu'.
   G.drill={side:'att'|'def', def:'on'|'mark'|'off', x0: metri dalla propria linea di meta, pull: lezione sul pull, wait, live, done}.
   Niente punteggio ne' pull: il possesso parte da fermo; dopo una meta o un turnover si ricomincia. Gli eventi vanno all'interfaccia (HOOKS.drill). ---- */
function drillEvt(kind,team,p,x){const D=G.drill;if(D&&D.live)HOOKS.drill(kind,team,p,x);}
function drillPark(P,dT){   // senza difesa (o con il solo marcatore) gli altri difensori aspettano a bordo campo
  const D=G.drill;if(!D||P!==0||D.def==='on')return;
  let k=0;for(const q of dT){if(D.def==='mark'&&q===G.marker)continue;q.x=FIELD_L/2+(k-3)*3;q.y=FIELD_W+6;q.vx=q.vy=0;k++;}
  if(D.def==='off')G.marker=null;
}
function drillStart(){
  const D=G.drill;if(!D)return;
  G.dir=[1,-1];D.wait=0;D.live=true;D.done=false;
  for(const p of SQ.concat(T[1])){p.st=100;p.hot=p.cold=false;p.run=0;p.miss=0;}
  if(D.pull){placeTeams(1);G.readyT=3;return;}   // lezione sul pull: lo tiri tu
  const team=D.side==='def'?1:0,d=dirOf(team),own=d>0?EZ:FIELD_L-EZ,hx=own+d*(D.x0||12);
  placeTeams(team);
  const atk=T[team],def=T[1-team],h=atk[0];
  atk.forEach((p,i)=>{p.x=hx+(i?d*(3+i*2.2):0);p.y=i?clamp(MID+(i-3.5)*5.2,3,FIELD_W-3):MID;});
  def.forEach((q,i)=>{q.x=hx+d*(i?4+i*2.2:1.7);q.y=i?clamp(MID+(i-3.5)*5.2+0.8,3,FIELD_W-3):MID+0.4;});
  G.mode='play';G.puller=null;G.pull=null;G.walk=null;G.brickWait=false;
  G.poss=team;G.holder=h;G.flight=null;G.marker=null;G.stallT=0;G.holdT=0;G.hbAtt=null;G.hbOk=null;G.zoneH=null;G.zoneT=0;G.call=null;
  G.disc.x=h.x;G.disc.y=h.y;G.disc.z=1;
  assignMarks();G.pb=[null,null];startPlay(team);G.think=thinkFor(team,1.2,2);
}
function separate(){
  const all=T[0].concat(T[1]);
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
    const a=all[i],b=all[j],dx=b.x-a.x,dy=b.y-a.y,d=hyp(dx,dy);
    const min=(a===G.holder||b===G.holder)?0.55:0.95;
    if(d<min&&d>0.001){const k=(min-d)*0.5/d;a.x-=dx*k;a.y-=dy*k;b.x+=dx*k;b.y+=dy*k;}
  }
}

