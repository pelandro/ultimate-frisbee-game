/* ---- ESULTANZE DOPO LA META (solo la tua squadra) ----
   Mentre scorre la fascia META! (G.banner.t da 2,4 a 0, dopo l'eventuale replay) chi ha segnato esulta. L'esultanza e' scelta a caso, mai la stessa due volte di fila:
   - spike: alza il disco e lo schiaccia a terra; il disco rimbalza tra polvere, fango, schizzi o neve (dipende dal campo e dal tempo);
   - petto contro petto: il compagno piu' vicino corre da lui, saltano insieme e si scontrano in aria (stellina);
   - balletto: con i due compagni piu' vicini, di fronte alla camera, a tempo: passo laterale, giro su se stessi, «febbre del sabato sera»;
   - tuffo di festa: scivolata in tuffo con la scia sul campo, poi in ginocchio con i pugni al cielo;
   - disco al cielo: lo lancia in alto e lo riprende al volo, poi il grido nel fumetto («DAJE!», «CHE TUFFO!» se la presa era in tuffo...).
   Sulla meta che vince la partita c'e' il trionfo: tutti corrono da chi ha segnato e i due compagni piu' vicini lo portano in spalla.
   Se la vince all'universe (la meta del pari a un punto dalla fine) chi ha segnato si toglie la maglia, corre verso le tribune facendola girare sopra la
   testa, i compagni lo raggiungono e lo tirano su (universo): la fascia della meta dura CEL_UNI_X secondi in piu'.
   A volte il fumetto del grido compare anche nello spike, nel balletto e nel tuffo. Gli altri tuoi compagni saltellano come prima, gli avversari restano a testa bassa.
   E' solo disegno: il motore non ne sa nulla e le posizioni vere non cambiano (le corse sono spostamenti disegnati; al punto dopo si riparte dalle linee
   come sempre). Se chi ha segnato e' sotto la fascia nera in basso, l'esultanza si sposta qualche passo piu' in alto. Niente esultanza nelle mete simulate
   (G.banner.sim, da simPoint) e con «riduci animazioni». Le pose nuove passano da puppet con pose 'cel' ed ex.cp (02-pixel-art.js): e' lo stesso omino.
   drawPlayers chiede celFrame() (posizioni e pose) e disegna celGround/celOverlay; drawDisc chiede celDisc() (il disco di chi esulta). */
// universe: secondi in piu' della fascia della meta e per sfilarsi la maglia
const CEL_UNI_X=2.6,CEL_UNI_OFF=0.4;
const CEL_KINDS=['spike','petto','ballo','tuffo','cielo'],CEL_SHOUT=['SIII!','BOOM!','DAJE!','VAI!','EVVAI!','GRANDE!'];
let celSt=null,celLast='',celFr=null;
const celSm=u=>{u=clamp(u,0,1);return u*u*(3-2*u);},celOutQ=u=>{u=clamp(u,0,1);return 1-(1-u)*(1-u);};
const celPick=a=>a[Math.random()*a.length|0];
// l'esultanza in corso (null = nessuna: si saltella come sempre)
function celOn(){
  const b=G.banner;
  if(G.mode!=='banner'||!b){celSt=null;return null;}
  if(b.team!==0||b.t>2.4+(b.celX||0)||RP.on||b.sim||reduceMotion||G.drill||!G.inMatch)return null;
  if(!celSt||celSt.b!==b)celSt=celStart(b);
  return celSt.kind?celSt:null;
}
// a inizio fascia: quale esultanza, chi partecipa e dove va. e = {x0,y0: da dove parte (mondo), sx,sy: il suo posto accanto a chi ha segnato (pixel), t1: quando arriva}
function celStart(b){
  const sc=b.scorer,st={b,kind:'',sc,m:new Map(),ev:{},f:1,bub:false,bt:9,shout:''};
  if(!sc||sc.t!==0||T[0].indexOf(sc)<0)return st;
  const A=celAnchor(sc),sx0=sxw(sc.x),mates=T[0].filter(q=>q!==sc).map(q=>({q,d:hyp(q.x-sc.x,q.y-sc.y),sx:sxw(q.x)-sx0})).sort((u,v)=>u.d-v.d);
  const win=G.score[0]>=G.target&&G.score[0]>G.score[1],hero=!!(G.heroOn&&sc.hero);
  st.f=sc.x>FIELD_L/2?-1:1;   // guarda verso il campo
  const uni=win&&G.score[1]===G.target-1&&G.score[0]===G.target;   // vinta all'universe: si era pari a un punto dalla fine
  if(uni&&mates.length>=2){st.kind='universo';b.celX=CEL_UNI_X;b.t+=CEL_UNI_X;st.len=2.4+CEL_UNI_X;}
  else if(win&&mates.length>=2)st.kind='mucchio';
  else{
    const pool=CEL_KINDS.filter(k=>k!==celLast&&!(k==='tuffo'&&hero)&&!(k==='petto'&&!(mates[0]&&mates[0].d<24)));
    st.kind=celPick(pool.length?pool:['spike']);celLast=st.kind;
  }
  // il grido: a volte legato all'azione (presa in tuffo, in salto, huck), altrimenti a caso
  const lp=b.kind!=='callahan'&&G.lastPlay&&G.lastPlay.pt===G.pointNo&&G.lastPlay.team===0?G.lastPlay:null,cx=[];
  if(lp&&lp.ck==='tuffo')cx.push('CHE TUFFO!');
  if(lp&&lp.ck==='salto')cx.push('CHE SALTO!');
  if(lp&&lp.gain>=35)cx.push('HUCK!');
  st.shout=cx.length&&Math.random()<0.6?celPick(cx):celPick(CEL_SHOUT);
  const dA=hyp(A.x-sc.x,A.y-sc.y),add=(q,sx,sy,t1,o)=>st.m.set(q,Object.assign({x0:q.x,y0:q.y,sx,sy,t1},o||{}));
  add(sc,0,0,dA>0.4?clamp(dA/12,0.12,0.35):0,{role:'sc'});
  const tRun=(d,v,a,z)=>clamp(d/v,a,z);
  if(st.kind==='petto'){
    const m=mates[0],s=m.sx>0?1:(m.sx<0?-1:st.f);st.s=s;
    add(m.q,s*10,-2,tRun(m.d,14,0.18,0.5),{role:'pt'});   // un passo piu' indietro: si vedono tutte e due le teste
    st.c0=Math.max(0.45,st.m.get(m.q).t1,st.m.get(sc).t1)+0.02;
  }else if(st.kind==='ballo'){
    const ds=mates.filter(u=>u.d<20).slice(0,2).sort((u,v)=>u.sx-v.sx);
    if(ds.length===2){add(ds[0].q,-13,0,tRun(ds[0].d,13,0.15,0.45));add(ds[1].q,13,0,tRun(ds[1].d,13,0.15,0.45));}
    else if(ds.length===1)add(ds[0].q,ds[0].sx<0?-13:13,0,tRun(ds[0].d,13,0.15,0.45));
    st.bub=Math.random()<0.4;st.bt=0.6;
  }else if(st.kind==='tuffo'){
    // scivola dal lato con meno giocatori davanti (e con lo spazio per farlo)
    const busy=d=>T[0].concat(T[1]).filter(q=>q!==sc&&Math.abs(q.y-sc.y)<3.5&&(q.x-sc.x)*d>0&&(q.x-sc.x)*d<12).length,room=d=>d>0?FIELD_L-1-sc.x:sc.x-1;
    const D=dirOf(0),ok=d=>room(d)>=10;st.d=!ok(-D)?D:(!ok(D)?-D:(busy(D)<busy(-D)?D:(busy(-D)<busy(D)?-D:D)));
    st.bub=Math.random()<0.45;st.bt=1.55;
  }else if(st.kind==='spike'){st.bub=Math.random()<0.45;st.bt=0.36;}
  else if(st.kind==='cielo'){st.bub=true;st.bt=1.48;}
  else if(st.kind==='universo'){
    // dove corre: verso le tribune (in alto), qualche metro verso il centro del campo, dentro lo schermo
    const top=celAnchor({x:sc.x,y:-99}).y+24/S;st.D={x:clamp(A.x+st.f*9,4,FIELD_L-4),y:Math.min(top,A.y)};   // 24 px di margine: quando lo tirano su sta piu' in alto
    const dD=hyp(st.D.x-A.x,st.D.y-A.y);st.run1=CEL_UNI_OFF+clamp(dD/6.5,1.1,1.8);
    const md=mates.map(u=>({...u,d:hyp(u.q.x-st.D.x,u.q.y-st.D.y)})).sort((u,v)=>u.d-v.d),ls=md.slice(0,2);
    const go=(u,sx,sy,role)=>add(u.q,sx,sy,0,{role,t0:rnd(0.5,0.9),t1:st.run1+rnd(0,0.45),D:true});   // partono quando lui e' gia' in corsa
    go(ls[0],-4,-1,'lift');go(ls[1],4,-1,'lift');
    const L=[[-12,-3],[-9,4],[-17,1]],R=[[12,-3],[9,4],[17,1]];
    for(const u of md.slice(2)){const sl=(sxw(u.q.x)<sxw(st.D.x)&&L.length)||!R.length?L.shift():R.shift();if(!sl)break;go(u,sl[0],sl[1],'');}
    st.L0=Math.max(st.run1,...[...st.m.values()].filter(e=>e.role==='lift').map(e=>e.t1))+0.12;
    st.shout='UNIVERSE!';st.bub=true;st.bt=st.L0+0.25;
  }
  else if(st.kind==='mucchio'){
    const ls=mates.slice(0,2).sort((u,v)=>u.sx-v.sx);
    add(ls[0].q,-4,-1,tRun(ls[0].d,16,0.15,0.8),{role:'lift'});add(ls[1].q,4,-1,tRun(ls[1].d,16,0.15,0.8),{role:'lift'});
    const L=[[-12,-3],[-9,4],[-17,1]],R=[[12,-3],[9,4],[17,1]];
    for(const u of mates.slice(2)){const sl=(u.sx<0&&L.length)||!R.length?L.shift():R.shift();if(!sl)break;add(u.q,sl[0],sl[1],tRun(u.d,16,0.2,1));}
    st.L0=Math.max(0.35,st.m.get(ls[0].q).t1,st.m.get(ls[1].q).t1,st.m.get(sc).t1)+0.08;
  }
  return st;
}
// dove si esulta: dove ha segnato, ma sopra la fascia nera della meta (in basso) e sotto la barra in alto
function celAnchor(sc){
  let y=sc.y;const lo=(BAR+42-OYi)/S,hi=(VH-66-OYi)/S;
  if(lo<hi)y=clamp(y,lo,hi);
  return {x:clamp(sc.x,2,FIELD_L-2),y:clamp(y,0.6,FIELD_W-0.6)};
}
// posizione lungo la corsa verso il posto (con t1 = 0 e' gia' li')
function celGo(e,a,A){
  const tx=A.x+e.sx/S,ty=A.y+e.sy/S,dx=tx-e.x0,dy=ty-e.y0,u=e.t1>0?clamp(a/e.t1,0,1):1,k=celOutQ(u),d=hyp(dx,dy);
  return {x:e.x0+dx*k,y:e.y0+dy*k,run:u<1&&d>0.35,dx,dy,ph:d*k*1.9};
}
const celRunR=(g,f)=>({wx:g.x,wy:g.y,f:Math.abs(g.dx)>0.05?(g.dx>0?1:-1):f,pose:'run',ph:g.ph,run:0.8,view:Math.abs(g.dy)>Math.abs(g.dx)*1.3?(g.dy<0?1:2):0});
const celPose=(g,f,cp,o)=>Object.assign({wx:g.x,wy:g.y,f,pose:cp?'cel':'cheer',cp:cp||null},o||{});
// ---------- le esultanze: per ogni partecipante, a ogni fotogramma, posa e posizione (a = secondi dall'inizio della fascia) ----------
const CEL_DO={
  spike(st,p,e,a,A){
    const g=celGo(e,a,A);if(g.run)return celRunR(g,st.f);
    const l=a-e.t1,f=st.f;
    if(l<0.22){const u=celSm(l/0.16);return celPose(g,f,{h:[[lerp(3,1,u),lerp(4,-10,u)],[-2,5]],lean:-u,hop:u>0.9?1:0});}   // alza il disco e lo tiene su un attimo
    if(l<0.28){const u=(l-0.22)/0.06;return celPose(g,f,{h:[[lerp(1,6,u),lerp(-10,9,u)],[-3,4]],lean:lerp(-1,2,u),crouch:2*u,lg:[[-2,0],[2,0]]});}   // e lo schiaccia
    if(l<0.85){const k=(l*16|0)&1;return celPose(g,f,{h:[[5,1-k],[-4,1+k]],lean:-1,crouch:1,lg:[[-2,0],[2,0]]});}   // braccia larghe: «dai!»
    return celPose(g,f,null);
  },
  petto(st,p,e,a,A){
    const me=p===st.sc,f=me?st.s:-st.s,g=celGo(e,a,A);if(g.run)return celRunR(g,f);
    const l=a-st.c0;
    if(l<0)return celPose(g,f,null);
    if(l<0.12)return celPose(g,f,{crouch:2,lean:-1,h:[[-4,3],[-3,5]]});   // si caricano
    if(l<0.52){
      const u=(l-0.12)/0.4,hop=12*Math.sin(Math.PI*u),inn=u<0.45?lerp(0,1,u/0.45):lerp(1,-1.5,(u-0.45)/0.55);
      if(u>=0.45&&!st.ev.bump){st.ev.bump=1;st.star={t:a};HOOKS.shake(2);HOOKS.sfx('catch',0.8);
        const mx=A.x+st.s*5/S;for(let i=0;i<8;i++){const an=Math.random()*6.283;addFx({t:'spark',x:mx,y:A.y,vx:Math.cos(an)*rnd(2,5),vy:Math.sin(an)*rnd(0.6,1.6),z:40/S,vz:rnd(1,4),life:rnd(0.3,0.5),max:0.5,c:i%2?'#ffffff':PAL.gold,c2:PAL.gold});}}
      return celPose(g,f,{hop,lean:u<0.45?1:0,h:u<0.45?[[-4,-1],[-3,0]]:[[-4,-8],[-3,-7]],lg:[[-1,2],[1,3]]},{ox:f*inn});   // in aria: petto in fuori, braccia indietro
    }
    if(l<0.64){const k='land'+(me?1:0);if(!st.ev[k]){st.ev[k]=1;celSpray(g.x,g.y,4,0,0.6);}return celPose(g,f,{crouch:2,h:[[3,4],[-2,5]]},{ox:-f*1.5});}
    if(l<1.05)return celPose(g,f,{h:[[6,-1],[-2,5]]},{ox:-f*1.5});   // si indicano
    return celPose(g,f,null,{ox:-f*1.5});
  },
  ballo(st,p,e,a,A){
    const g=celGo(e,a,A);if(g.run)return celRunR(g,st.f);
    const D0=0.5;if(a<D0)return celPose(g,e.sx<0?1:(e.sx>0?-1:st.f),null);
    const t=(a-D0)/0.22,n=Math.floor(t),w=t-n;   // un passo ogni 0,22 s, tutti insieme nella stessa direzione
    if(n<4){const sd=n&1?1:-1;   // passo laterale: il braccio dal lato del passo in alto, l'altra gamba alzata
      return celPose(g,1,{view:2,ab:1,crouch:w<0.4?1:0,h:sd>0?[[4,-8],[-3,5]]:[[3,5],[-4,-8]],lg:sd>0?[[-1,2],[3,0]]:[[-3,0],[1,2]]},{ox:sd*2});}
    if(n<6){const q=Math.min(3,Math.floor((t-4)*2));   // giro su se stessi: di fronte, di lato, di schiena, dall'altro lato
      return celPose(g,q===3?-1:1,{view:[2,0,1,0][q],ab:1,hop:2*Math.sin(Math.PI*((t-4)*2-q)),h:[[3,-7],[-3,-7]]});}
    if(n<8){const sd=n&1?-1:1;   // «febbre del sabato sera»: un braccio in alto in diagonale, l'altro in basso
      return celPose(g,1,{view:2,ab:1,h:sd>0?[[5,-9],[-3,6]]:[[3,6],[-5,-9]],lg:[[-2,0],[2,0]]},{ox:sd});}
    return celPose(g,1,{view:2,ab:1,hop:2,h:[[4,-8],[-4,-8]],lg:[[-2,0],[2,0]]});
  },
  tuffo(st,p,e,a,A){
    const d=st.d,y=lerp(e.y0,A.y,celOutQ(a/0.28));
    const dist=celTuffoD(a),x=A.x+d*dist,g={x,y};
    if(a<0.28)return {wx:x,wy:y,f:d,pose:'run',ph:dist*1.9,run:0.9,view:0};
    if(a<0.42){const u=(a-0.28)/0.14;return {wx:x,wy:y,f:d,dive:{dir:d,lift:2+7*Math.sin(Math.PI*u)}};}   // in volo
    if(a<1.05){if(!st.ev.land){st.ev.land=1;celSpray(x,y,8,d,1);}   // scivola: schizzi davanti, la scia resta (celGround)
      if(Math.random()<0.5)celSpray(x+d*1.2,y,1,d,0.7);
      return {wx:x,wy:y,f:d,dive:{dir:d,lift:2}};}
    if(a<1.32)return {wx:x,wy:y,f:d,dive:{dir:d,lift:2}};
    if(a<1.52)return celPose(g,d,{crouch:3,lean:1,h:[[4,7],[2,8]]});   // si tira su
    const k=(a*7|0)&1;return celPose(g,d,{view:2,ab:1,crouch:4,h:k?[[4,-10],[-4,-7]]:[[4,-7],[-4,-10]]});   // in ginocchio, pugni al cielo
  },
  cielo(st,p,e,a,A){
    const g=celGo(e,a,A);if(g.run)return celRunR(g,st.f);
    const l=a-e.t1,f=st.f;
    if(l<0.25)return celPose(g,f,{crouch:2,lean:1,h:[[3,7],[-2,5]]});   // carica il lancio
    if(l<0.32){const u=(l-0.25)/0.07;return celPose(g,f,{hop:3*u,h:[[lerp(3,1,u),lerp(7,-10,u)],[-2,4]]});}   // lo lancia in alto
    if(l<1.42){const k=(l*8|0)&1,hi=l>1.05;return celPose(g,f,{lean:-1,h:[[2,hi?-10:-8],[-1,hi?-9:-7]],lg:[[-1,k],[1,1-k]]});}   // lo segue con lo sguardo
    if(!st.ev.catch){st.ev.catch=1;HOOKS.sfx('catch',0.6);addFx({t:'pop',x:g.x,y:g.y,z:48/S,vx:0,vy:0,vz:0,life:0.3,max:0.3,c:'#ffffff'});}
    return celPose(g,f,{hop:Math.abs(Math.sin((l-1.42)*9))>0.5?2:0,h:[[1,-10],[-3,4]]});   // preso: disco in alto
  },
  universo(st,p,e,a,A){
    const D=st.D,L0=st.L0,bo=a>L0+0.3&&Math.sin((a-L0)*11)>0?1:0;
    if(e.role==='sc'){
      if(a<CEL_UNI_OFF){const u=celSm(a/CEL_UNI_OFF);   // si sfila la maglia: braccia incrociate che salgono sopra la testa
        return celPose({x:A.x,y:A.y},st.f,{crouch:u<0.5?1:0,lean:-1,h:[[lerp(-2,2,u),lerp(3,-10,u)],[lerp(2,-2,u),lerp(3,-10,u)]]},{bare:a>CEL_UNI_OFF*0.6});}
      const u=clamp((a-CEL_UNI_OFF)/(st.run1-CEL_UNI_OFF),0,1),k=celSm(u),x=lerp(A.x,D.x,k),y=lerp(A.y,D.y,k),f=D.x>A.x+0.2?1:(D.x<A.x-0.2?-1:st.f);
      if(u<1){const s=(a*9|0)&1;   // corre con la maglia che gira sopra la testa
        return celPose({x,y},f,{h:[[2,-11],[-3,3+s]],lg:s?[[-3,0],[3,2]]:[[-3,2],[3,0]],hop:s,lean:1},{bare:true,rag:1});}
      if(a<L0)return celPose({x,y},f,{h:[[2,-11],[-4,-8]],hop:(a*8|0)&1},{bare:true,rag:1});
      const w=celSm((a-L0)/0.25),wv=(a*6|0)&1;   // i compagni lo tirano su
      return celPose({x,y},1,{view:2,ab:1,hop:13*w+bo,lg:[[-3,2*w],[3,2*w]],h:wv?[[4,-11],[-3,-6]]:[[3,-6],[-4,-10]]},{bare:true,rag:1});
    }
    // i compagni: partono un attimo dopo, corrono da lui e gli si mettono attorno
    const tx=D.x+e.sx/S,ty=D.y+e.sy/S,u=clamp((a-e.t0)/Math.max(0.1,e.t1-e.t0),0,1),k=celOutQ(u),x=lerp(e.x0,tx,k),y=lerp(e.y0,ty,k),m=e.sx<0?1:-1;
    if(a<e.t0)return celPose({x:e.x0,y:e.y0},m,null);
    if(u<1){const g={x,y,dx:tx-e.x0,dy:ty-e.y0,ph:hyp(tx-e.x0,ty-e.y0)*k*1.9};return celRunR(g,m);}
    if(e.role==='lift'){
      if(a<L0)return celPose({x,y},m,null);
      if(a<L0+0.12)return celPose({x,y},m,{view:2,ab:1,crouch:2,h:[[2,4],[-2,4]]});
      return celPose({x,y},m,{view:2,ab:1,hop:bo,h:m>0?[[2,-5],[-4,-9]]:[[4,-9],[-2,-5]]});   // una mano lo tiene, l'altra al cielo
    }
    return celPose({x,y},m,null);   // gli altri attorno saltano
  },
  mucchio(st,p,e,a,A){
    const g=celGo(e,a,A),L0=st.L0,bo=a>L0+0.25&&Math.sin((a-L0)*11)>0?1:0,m=e.sx<0?1:-1;
    if(e.role==='sc'){
      if(g.run)return celRunR(g,st.f);
      if(a<L0)return celPose(g,st.f,null);
      const u=celSm((a-L0)/0.25),wv=(a*6|0)&1;   // sale sulle spalle dei due compagni
      return celPose(g,1,{view:2,ab:1,hop:13*u+bo,lg:[[-3,2*u],[3,2*u]],h:u<1?[[4,-7],[-4,-7]]:(wv?[[4,-10],[-3,-6]]:[[3,-6],[-4,-10]])});
    }
    if(g.run)return celRunR(g,m);
    if(e.role==='lift'){
      if(a<L0)return celPose(g,m,null);
      if(a<L0+0.12)return celPose(g,m,{view:2,ab:1,crouch:2,h:[[2,4],[-2,4]]});
      return celPose(g,m,{view:2,ab:1,hop:bo,h:m>0?[[2,-5],[-4,-9]]:[[4,-9],[-2,-5]]});   // una mano lo tiene, l'altra al cielo
    }
    return celPose(g,m,null);   // gli altri attorno saltano
  }
};
// tuffo di festa: metri percorsi (rincorsa, volo, scivolata che rallenta)
const celTuffoD=a=>a<0.28?2.5*a/0.28:(a<0.42?2.5+2.5*(a-0.28)/0.14:(a<1.05?5+4.5*celOutQ((a-0.42)/0.63):9.5));
// posa e posizione di chi esulta in questo fotogramma (Map giocatore -> {x,y schermo, wx,wy mondo, f, pose, cp, view, dive, ph, run}); null fuori dalle esultanze
function celFrame(){
  const st=celOn();if(!st){celFr=null;return null;}
  const a=(st.len||2.4)-st.b.t,A=celAnchor(st.sc),M=new Map();
  st.a=a;st.A=A;st.R=null;
  for(const [p,e] of st.m){
    if(T[0].indexOf(p)<0)continue;
    const R=CEL_DO[st.kind](st,p,e,a,A);if(!R)continue;
    R.x=sxw(R.wx)+ri(R.ox||0);R.y=syw(R.wy);M.set(p,R);
    if(p===st.sc)st.R=R;
  }
  return celFr=M;
}
// colori degli schizzi: neve, fango o acqua con la pioggia, polvere sulla terra; null = prato asciutto (fili d'erba e polvere)
function celSurf(){
  const wx=G.wx|0,fk=fieldKind(venueNow());
  if(wx===2)return ['#ffffff','#cfdbe8'];
  if(wx===1)return fk===0?['#7d5f3e','#4a3826']:['#d6ebff','#86b0d8'];
  return fk===0?['#e6d3a4','#b39467']:null;
}
function celSpray(wx,wy,n,dir,pw){
  const C=celSurf();pw=pw||1;
  for(let i=0;i<n;i++){
    const an=Math.random()*6.283,sp=rnd(1.5,4.5)*pw,vx=Math.cos(an)*sp+dir*rnd(1,4)*pw,vy=Math.sin(an)*sp*0.4;
    if(C)addFx({t:'spark',x:wx,y:wy,vx,vy,z:0.1,vz:rnd(3,6.5)*pw,life:rnd(0.35,0.6),max:0.6,c:C[0],c2:C[1]});
    else if(i%2)addFx({t:'blade',x:wx,y:wy,vx,vy,z:0.2,vz:rnd(0.8,1.6),life:0.45,max:0.45});
    else addFx({t:'dust',x:wx,y:wy,vx:vx*0.5,vy:vy*0.5,z:0.1,vz:0.6,life:0.5,max:0.5,r:0.2});
  }
}
// sotto i giocatori: la scia del tuffo di festa
function celGround(){
  const st=celSt;if(!st||st.kind!=='tuffo'||!st.A||celTuffoD(st.a)-1.6<=5)return;
  const d=st.d,x0=sxw(st.A.x+d*5),x1=sxw(st.A.x+d*(celTuffoD(st.a)-1.6)),y=syw(st.A.y),c=(G.wx|0)===1?'rgba(30,20,8,.34)':'rgba(20,28,10,.22)';   // trasparente: si vede sul prato, sulla terra e nella meta colorata
  const a=Math.min(x0,x1),b=Math.max(x0,x1);
  for(let x=a;x<=b;x++){const h=ihash(x-a,7)%5;if(h)px(x,y-1,1,h>2?2:1,c);}
}
// sopra i giocatori: la stellina del petto contro petto e il fumetto del grido
function celOverlay(){
  const st=celSt;if(!st||!st.R)return;
  const R=st.R,a=st.a;
  if(st.star&&a-st.star.t<0.22){const k=(a-st.star.t)/0.22,x=R.x+st.s*4,y=R.y-30,r=2+ri(3*k),c=k<0.5?'#ffffff':PAL.gold;
    px(x-r,y+1,2*r+1,1,PAL.out);px(x-r,y,2*r+1,1,c);px(x,y-r,1,2*r+1,c);
    if(k>0.3)for(const [u,v] of [[-1,-1],[1,-1],[-1,1],[1,1]])px(x+u*(r-1),y+v*(r-1),1,1,c);}
  if(R.rag&&st.sc._ht===G.tick){   // la maglia che gira sopra la testa
    const w=a*15,hx=st.sc._hx,hy=st.sc._hy,cx=hx+ri(Math.cos(w)*4),cy=hy-2+ri(Math.sin(w)*2),c=UNI[0].shirt,d=Math.cos(w)>0?1:-1;
    px(cx-3,cy-2,7,4,PAL.out);px(cx-2,cy-1,5,2,c);px(cx+d*3,cy,2,1,c);px(hx-1,hy-1,2,2,PAL.out);
  }
  if(st.bub&&a>=st.bt&&a<(st.len||2.4)-0.1){
    const sc=st.sc,l=a-st.bt;let top=R.dive?R.y-12:R.y-24-ri((R.cp&&R.cp.hop)||0)+ri((R.cp&&R.cp.crouch)||0)-(R.pose==='cheer'?3:0);
    if(sc._ht===G.tick)top=Math.min(top,sc._hy-2);   // sopra il disco alzato
    celBubble(st.shout,R.x,top-3,l);
  }
}
// fumetto bianco col bordo nero e la punta verso la testa; compare con un piccolo scatto
function celBubble(txt,x,y,l){
  const w=ptw(txt,'p')+8,h=12,pop=l<0.07?2:0,bx=clamp(ri(x-w/2),2,VW-w-2),by=Math.max(BAR+2,ri(y-h-3))-pop,tx=clamp(ri(x),bx+3,bx+w-4);
  pbox(bx-1,by-1,w+2,h+2,PAL.out);pbox(bx,by,w,h,'#ffffff');
  px(tx-2,by+h,5,1,PAL.out);px(tx-1,by+h,3,1,'#ffffff');px(tx-1,by+h+1,3,1,PAL.out);px(tx,by+h+1,1,1,'#ffffff');px(tx,by+h+2,1,1,PAL.out);
  ptext(txt,bx+4,by+2,{f:'p',a:'l',c:'#1b2a55',o:false});
}
// il disco di chi esulta (true = disegnato qui): in mano, schiacciato a terra che rimbalza, lanciato in alto, davanti a chi scivola
function celDisc(){
  const st=celSt;if(!celFr||!st||!st.R)return false;
  const R=st.R,sc=st.sc,a=st.a,f=st.f,gx=R.x,gy=R.y,e=st.m.get(sc),l=a-(e?e.t1:0);
  if(st.kind==='universo'){const x=sxw(st.A.x)+st.f*6,y=syw(st.A.y);if(a>CEL_UNI_OFF){celDiscAt(x,y-1,y,0,0,0);return true;}}   // la maglia al posto del disco: il disco resta a terra
  const inHand=()=>{if(sc._ht!==G.tick)return false;celDiscAt(sc._hx+1+R.f*2,sc._hy+1,gy,G.tick*3,0,0,true);return true;};
  if(st.kind==='spike'&&l>=0.26){
    if(l<0.3){const u=(l-0.26)/0.04,h0=st.rh||[f*3,-23];celDiscAt(gx+lerp(h0[0],f*6,u),gy+lerp(h0[1],-1,u),gy,G.tick*22,0,0);return true;}
    if(!st.ev.imp){st.ev.imp=1;celSpray(st.A.x+f*6/S,st.A.y,12,f,1);addFx({t:'ring',x:st.A.x+f*6/S,y:st.A.y,life:0.35,max:0.35});HOOKS.shake(3);HOOKS.sfx('block');}
    let x,h=0,sp=0,tl=0;
    if(l<0.62){const u=(l-0.3)/0.32;x=gx+f*lerp(6,10,u);h=18*4*u*(1-u);sp=G.tick*22;tl=(l*14|0)&1?1:-1;}
    else if(l<0.82){const u=(l-0.62)/0.2;x=gx+f*lerp(10,12,u);h=5*4*u*(1-u);sp=G.tick*14;if(!st.ev.b2){st.ev.b2=1;celSpray(st.A.x+f*10/S,st.A.y,3,f,0.5);}}
    else x=gx+f*12;
    celDiscAt(ri(x),gy-1-ri(h),gy,sp,0,tl);return true;
  }
  // balletto: le braccia dei tre sono in aria e il disco in mano finiva all'altezza del fianco (o sospeso accanto alla testa): chi ha segnato lo posa a terra davanti a se' e balla
  if(st.kind==='ballo'&&a>=0.5){celDiscAt(ri(gx+f*4),gy+2,gy+2,0,0,0);return true;}
  if(st.kind==='cielo'&&l>=0.29&&l<1.42){
    const u=(l-0.29)/1.13,pk=clamp(gy-BAR-44,12,48),H=pk*4*u*(1-u);
    celDiscAt(gx+f*3+ri(f*2*Math.sin(Math.PI*u)),gy-23-ri(H),gy,G.tick*24,H>30?2:(H>12?1:0),(l*10|0)&1?1:-1);return true;
  }
  if(R.dive){celDiscAt(gx+R.dive.dir*14,gy-5-ri(R.dive.lift),gy,0,0,0,true);return true;}
  if(inHand()){if(st.kind==='spike')st.rh=[sc._hx+1+R.f*2-gx,sc._hy+1-gy];return true;}
  return false;
}
function celDiscAt(x,y,gy,spin,sz,tl,noSh){
  if(!noSh){const hk=clamp((gy-y)/40,0,1);pell(x,gy+1,ri(lerp(4,2,hk)),1,`rgba(10,30,10,${(0.42-0.2*hk).toFixed(2)})`);}
  discScr.x=x;discScr.y=y;pdiscSprite(x,y,spin,sz,tl,false);
}
