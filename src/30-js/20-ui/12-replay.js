/* ---- REPLAY DELLE AZIONI DECISIVE ----
   Durante il gioco si tengono in memoria gli ultimi secondi (posizioni di tutti, disco, chi lo ha, volo in corso). Quando una meta e' spettacolare
   (Callahan, presa in tuffo, duello in aria vinto, huck da 35 m in su: circa una meta su sei, poco meno di 2 a partita) gli ultimi RP_SPAN secondi vengono riproposti al RP_SPEED della velocita'
   prima della fascia della meta, con una didascalia. Un tocco lo salta. Segue l'interruttore «Stacchi laterali» (G.opt.cine).
   La fascia della meta viene allungata di quanto dura il replay (G.banner.t > 2,4 = replay in corso), cosi' il ritmo della partita non cambia altrove. */
const RP={buf:[],on:null,pt:-1,n:0,clock:0,next:0};
const RP_KEEP=3,RP_SPAN=1.6,RP_SPEED=0.75,RP_DUR=RP_SPAN/RP_SPEED;
function rpRecord(step){
  if(!G.inMatch||G.drill||G.paused||G.auto||reduceMotion)return;
  if(G.pointNo!==RP.pt){RP.pt=G.pointNo;RP.buf.length=0;RP.clock=RP.next=0;}   // nuova meta: si ricomincia
  if(G.mode!=='play')return;
  RP.clock+=step;
  if(RP.clock+1e-8<RP.next)return;
  RP.next+=1/30;
  if(RP.next<=RP.clock+1e-8)RP.next=RP.clock+1/30;
  const all=T[0].concat(T[1]),d=G.disc;
  RP.buf.push({t:RP.clock,at:G.tick,p:all.map(p=>({actor:p,x:p.x,y:p.y,face:p.fc||dirOf(p.t),
    speed:hyp(p.vx,p.vy),phase:p.ph||0,pose:poseOf(p),dive:p.dv?diveProg(p):0,
    dir:p.dv?.dir,air:p.dv?diveAir(p):0})),d:[d.x,d.y,d.z],h:all.indexOf(G.holder),kind:G.flight?.kind});
  while(RP.buf.length&&RP.clock-RP.buf[0].t>RP_KEEP)RP.buf.shift();
}
function rpLabel(){
  const b=G.banner,lp=G.lastPlay;if(!b)return '';
  if(b.kind==='callahan')return 'CALLAHAN';
  if(!lp||lp.pt!==G.pointNo)return '';
  if(lp.ck==='tuffo')return 'PRESA IN TUFFO';
  if(lp.duel&&lp.ck==='salto'&&lp.gain>=35)return 'DUELLO VINTO IN ARIA';   // i duelli in salto in meta sono frequenti: solo dopo un huck
  if(lp.gain>=35)return 'HUCK DA '+Math.round(lp.gain)+' M';
  return '';
}
// all'inizio della fascia della meta: se l'azione lo merita parte il replay
function rpCheck(){
  if(G.mode!=='banner'||!G.banner||G.banner.rpChk)return;
  G.banner.rpChk=true;
  const lab=rpLabel(),last=RP.buf[RP.buf.length-1];
  if(reduceMotion||!lab||!G.opt.cine||!last||G.tick-last.at>0.5)return;   // niente replay dopo una meta simulata o saltata (nessun fotogramma recente)
  const fr=RP.buf.filter(f=>f.t>=last.t-RP_SPAN);if(fr.length<10)return;
  RP.on={fr,t:0,lab};
  G.banner.t+=RP_DUR;RP.n++;
}
function rpApply(dt){
  const r=RP.on;if(!r)return;
  if(G.mode!=='banner'||!G.banner||G.banner.t<=2.4){rpEnd();return;}
  r.t+=dt*RP_SPEED;
  const t0=r.fr[0].t,tt=t0+r.t;let i=0;while(i<r.fr.length-1&&r.fr[i+1].t<=tt)i++;
  const a=r.fr[i],b=r.fr[i+1];
  if(!b)return a;
  const f=clamp((tt-a.t)/Math.max(.001,b.t-a.t),0,1);
  const interpolate=(x,y)=>x.map((v,j)=>v+(y[j]-v)*f);
  return {p:a.p.map((q,j)=>b.p[j]?{...q,x:lerp(q.x,b.p[j].x,f),y:lerp(q.y,b.p[j].y,f)}:q),d:interpolate(a.d,b.d),h:a.h,kind:a.kind};
}
function rpEnd(skip){
  const r=RP.on;if(!r)return;
  RP.on=null;
  if(skip&&G.banner)G.banner.t=Math.min(G.banner.t,2.4);
}
function drawReplay(){
  const r=RP.on;if(!r)return;
  const blink=((G.tick*3)|0)&1,y=BAR+4;
  px(0,y,VW,18,'rgba(0,0,0,.72)');
  if(blink){pring(10,y+9,3,3,PAL.red,3);}
  ptext('REPLAY',18,y+5,{f:'p',a:'l',c:'#ffffff',o:false});
  ptext(r.lab,VW/2,y+5,{f:'p',c:PAL.gold,o:false});
  ptext('tocca per saltare',VW-6,y+6,{f:'t',a:'r',c:'#c2cbe6',o:false});
}

function renderReplay(frame,dt){
  ctx.clearRect(0,0,VW,VH);
  updateCamera(dt,frame.d);
  drawField();
  for(const p of frame.p.slice().sort((a,b)=>a.y-b.y)){
    const actor=p.actor,x=sxw(p.x),y=syw(p.y);
    pell(x+1,y,5,1,'rgba(10,30,10,.28)');
    if(p===frame.p[frame.h])pring(x,y,9,3,PAL.gold,1);
    if(p.dive>.45)puppetDive(x+p.dir*6*p.dive,y,UNI[actor.t],heroLook(actor),p.dir,2+7*p.air);
    else puppet(x,y,UNI[actor.t],heroLook(actor),p.face,p.pose,p.phase,Math.min(1,p.speed/6),0,
      {hero:heroVis(actor)?actor.hero:null,sc:heroScale(actor)});
  }
  const [x,y,z]=frame.d,lift=z*S*.5;
  pell(sxw(x),syw(y),3,1,'rgba(10,30,10,.28)');
  pdiscSprite(sxw(x),syw(y)-lift-2,G.tick*22,lift>10?2:1,0,frame.kind==='hammer');
  drawReplay();
  blit();
}
