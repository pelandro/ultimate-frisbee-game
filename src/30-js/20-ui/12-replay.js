/* ---- REPLAY DELLE AZIONI DECISIVE ----
   Durante il gioco si tengono in memoria gli ultimi secondi (posizioni di tutti, disco, chi lo ha, volo in corso). Quando una meta e' spettacolare
   (Callahan, presa in tuffo, duello in aria vinto, huck da 35 m in su: circa una meta su sei, poco meno di 2 a partita) gli ultimi RP_SPAN secondi vengono riproposti al RP_SPEED della velocita'
   prima della fascia della meta, con una didascalia. Un tocco lo salta. Segue l'interruttore «Stacchi laterali» (G.opt.cine).
   La fascia della meta viene allungata di quanto dura il replay (G.banner.t > 2,4 = replay in corso), cosi' il ritmo della partita non cambia altrove. */
const RP={buf:[],on:null,pt:-1,n:0};
const RP_KEEP=3,RP_SPAN=1.6,RP_SPEED=0.75,RP_DUR=RP_SPAN/RP_SPEED;
function rpRecord(){
  if(!G.inMatch||G.drill)return;
  if(G.pointNo!==RP.pt){RP.pt=G.pointNo;RP.buf.length=0;}   // nuova meta: si ricomincia
  if(G.mode!=='play')return;
  const all=T[0].concat(T[1]),d=G.disc;
  RP.buf.push({t:G.tick,p:all.map(p=>[p.x,p.y,p.vx,p.vy]),d:[d.x,d.y,d.z],h:G.holder,f:G.flight,w:G.walk});
  while(RP.buf.length&&G.tick-RP.buf[0].t>RP_KEEP)RP.buf.shift();
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
  if(!lab||!G.opt.cine||!last||G.tick-last.t>0.5)return;   // niente replay dopo una meta simulata o saltata (nessun fotogramma recente)
  const fr=RP.buf.filter(f=>f.t>=last.t-RP_SPAN);if(fr.length<10)return;
  const all=T[0].concat(T[1]);
  RP.on={fr,t:0,lab,save:{p:all.map(p=>[p.x,p.y,p.vx,p.vy]),d:[G.disc.x,G.disc.y,G.disc.z],h:G.holder,f:G.flight,w:G.walk}};
  G.banner.t+=RP_DUR;RP.n++;
}
function rpSet(s){
  const all=T[0].concat(T[1]);
  all.forEach((p,i)=>{const q=s.p[i];if(q){p.x=q[0];p.y=q[1];p.vx=q[2];p.vy=q[3];}});
  G.disc.x=s.d[0];G.disc.y=s.d[1];G.disc.z=s.d[2];G.holder=s.h;G.flight=s.f;G.walk=s.w;
}
// prima di disegnare: posizioni del fotogramma del replay (al rallentatore)
function rpApply(dt){
  const r=RP.on;if(!r)return;
  if(G.mode!=='banner'||!G.banner||G.banner.t<=2.4){rpEnd();return;}
  r.t+=dt*RP_SPEED;
  const t0=r.fr[0].t,tt=t0+r.t;let i=0;while(i<r.fr.length-1&&r.fr[i+1].t<=tt)i++;
  rpSet(r.fr[i]);
}
function rpEnd(skip){
  const r=RP.on;if(!r)return;
  RP.on=null;rpSet(r.save);
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
