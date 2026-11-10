/* ---- IA lanciatore (avversario; in test anche per la tua squadra) ---- */
function aiPick(th){
  const P=th.t,d=dirOf(P),defs=T[1-P];
  let mates=T[P].filter(q=>q!==th);
  {const al=pbAllowed(th);if(al){const m2=mates.filter(q=>al.includes(q));if(m2.length)mates=m2;}}   // schema a sequenza: il lancio va a chi e' previsto
  let best=null,bs=-1e9;const lv=AIK(P),idn=idOf(P),dmD=G.dmode[1-P];
  for(const q of mates){
    const dx=q.x-th.x,dy=q.y-th.y,dist=hyp(dx,dy);if(dist<3.5)continue;
    let open=99,lane=99;
    for(const df of defs){open=Math.min(open,hyp(df.x-q.x,df.y-q.y));lane=Math.min(lane,segDist(df.x,df.y,th.x,th.y,q.x,q.y));}
    const fwd=dx*d,c=closedness(th,dx,dy);
    let sc=Math.min(open,9)+Math.min(lane,6)*0.8+fwd*0.11*(1+0.4*idn.deep)-dist*0.06-c*4+rnd(0,Math.max(1,3.8+(0.6-th.s.vis/100)*9))*lv.noise;
    if(dist>=SPARO_D)sc+=(th.s.spa-55)*0.05-1.5+(open>=5?1.5:0)+idn.deep*1.6;   // sparo: conviene se sei bravo e il compagno e' libero (di piu' per le squadre che giocano lungo)
    if(dist<10)sc-=clamp(1+idn.deep*0.8,0,2);   // evita il gioco troppo vicino al portatore (le squadre da gioco corto lo accettano)
    // MISMATCH: cerca il compagno che ha un vantaggio sul suo marcatore (velocita', salto sul lungo, agilita' sul corto) e mani sicure
    {const mq=defs.find(df=>df.mark===q);if(mq)sc+=clamp((q.s.vel-mq.s.vel)*0.025+(dist>=20?(q.s.sal-mq.s.sal)*0.025:(q.s.agi-mq.s.agi)*0.015)+(q.s.pre-65)*0.012,-1.5,1.5)*lv.smart;}
    // lettura della marcatura: contro l'anticipo conviene il lungo, contro il contenimento il taglio di rientro
    if(lv.smart>0.5){if(dmD===1&&fwd>18)sc+=0.9*lv.smart;else if(dmD===0&&fwd>4&&fwd<16)sc+=0.5*lv.smart;}
    // gestione dello stall: piu' il conteggio sale, piu' cerca un passaggio corto e sicuro e rinuncia al lungo
    if(G.stallT>5){const u=G.stallT-5;if(open>4&&dist<16)sc+=u*0.7;if(dist>20)sc-=u*0.6;}
    if(inEZ(q,P))sc+=3;
    {const own=d>0?q.x:FIELD_L-q.x;if(own<EZ+10&&open<5)sc-=8;}   // vicino alla propria meta (quella che difende) un intercetto regala il punto all'avversario: prudenza
    if(fwd<-3)sc-=2;   // un lancio all'indietro serve solo se non c'e' di meglio
    if(G.stallT>6.5&&fwd<0)sc+=3;
    if(sc>bs){bs=sc;best=q;}
  }
  if(!best)best=nearestTo(mates,th.x,th.y);
  let open=99;for(const df of defs)open=Math.min(open,hyp(df.x-best.x,df.y-best.y));
  return {best,open};
}
function aiThrow(th){
  const P=th.t,defs=T[1-P],pk=aiPick(th),best=pk.best,open=pk.open,lv=AIK(P);
  const dist=hyp(best.x-th.x,best.y-th.y);
  const lead=st=>{const tt=flightTime(dist,st,dist>=SPARO_D);return [clamp(best.x+best.vx*tt*0.8,0.5,FIELD_L-0.5),clamp(best.y+best.vy*tt*0.8,0.5,FIELD_W-0.5)];};
  let style=0;
  if(dist<SPARO_D){
    if(lv.smart>=0.7){   // SCELTA DEL LANCIO: prova gli stili che sa fare e tira quello che ha piu' probabilita' di arrivare
      let bp=-1;
      for(const st of (th.s.lan>76?[0,1,2]:[0,1])){const a=lead(st),e=estimateThrow(th,a[0],a[1],best,st).p+(st===0?0.03:0)+rnd(0,0.05);if(e>bp){bp=e;style=st;}}
    }else{   // livello facile: regole semplici
      const lb=laneBlock(th,best.x,best.y,planThrow(th,best.x,best.y,0));
      if(open<4&&dist>14&&Math.random()<0.4)style=1;
      else if(lb&&lb.prob>0.14&&Math.random()<0.35+th.s.vis*0.004)style=1;
      else if(open>6&&dist>16&&th.s.lan>78&&Math.random()<0.05)style=2;
    }
  }
  const a=lead(style);
  doThrow(th,a[0],a[1],best,style);
}

/* ---- pull ---- */
const PULL_TH=0.88,PULL_T=0.95,PULL_SPEED=1.12;   // PULL_SPEED: velocita' del disco in volo al pull (1 = com'era)
function pullAngle(team,ang){
  const fwd=dirOf(team)>0?0:Math.PI;
  let rel=Math.atan2(Math.sin(ang-fwd),Math.cos(ang-fwd));
  rel=clamp(rel,-1.3,1.3);return fwd+rel;
}
// Il pull non esce piu' a caso. La distanza cresce con la carica fino alla tacca (78 m: dentro la meta avversaria); oltre la tacca il disco va
// ancora piu' lungo (fuori dal fondo) e il controllo cala. Direzione e distanza hanno un errore piccolo, che dipende dallo Sparo di chi tira.
function pullPlan(p,team,charge,ang){
  const c=clamp(charge,0,1),over=clamp((c-PULL_TH)/(1-PULL_TH),0,1);
  return {c,over,dist:20+58*Math.min(c,PULL_TH)/PULL_TH+7*over,a:pullAngle(team,ang),
    sa:(1.1+(100-p.s.spa)*0.03)*(1+2.2*over*over)*Math.PI/180,sd:(1.2+(100-p.s.spa)*0.045)*(1+2*over)};
}
function doPull(charge,ang){
  const pt=G.pullTeam,p=G.puller,d=dirOf(pt),rec=G.poss,pp=pullPlan(p,pt,charge,ang);
  const dist=pp.dist+randn()*pp.sd,a=pp.a+randn()*pp.sa;
  const tx=p.x+Math.cos(a)*dist,ty=p.y+Math.sin(a)*dist;
  const dl=hyp(tx-p.x,ty-p.y),oob=tx<0||tx>FIELD_L||ty<0||ty>FIELD_W;
  let spot;
  const dr=dirOf(rec),hx=dr>0?EZ:FIELD_L-EZ;
  if(oob)spot={x:hx+dr*18,y:MID};   // brick: al centro, a 18 m dalla linea di meta di chi riceve
  else spot={x:clamp(tx,1,FIELD_L-1),y:clamp(ty,3,FIELD_W-3)};   // il pull si prende dove cade, anche dentro la meta
  const atk=T[rec];
  for(const q of atk.concat(T[pt])){q.fl=null;q.flD=0;q.boost=0;}
  const catcher=atk.slice().sort((a,b)=>ttr(a,spot.x,spot.y)-ttr(b,spot.x,spot.y))[0];
  catcher.fl={x:spot.x,y:spot.y};
  G.pull={thrower:p,sx:p.x,sy:p.y,tx,ty,t:0,T:(1.8+dl/40)/PULL_SPEED,H:clamp(dl*0.16,5,12),team:pt,oob,landed:false,spot,catcher,lt:0};
  G.ref={x:spot.x,y:spot.y};
  G.puller=null;G.mode='play';
  assignMarks();
  HOOKS.vibe(18);HOOKS.sfx('pull');
}
function aiPull(){
  const d=dirOf(G.pullTeam),sk=G.puller.s.spa;   // l'IA cerca la tacca: chi ha poco Sparo la sbaglia piu' spesso, in difetto o in eccesso
  doPull(clamp(0.8+randn()*(0.05+(100-sk)*0.0012),0.35,0.98),(d>0?0:Math.PI)+randn()*0.07);
}

