/* ---- stacchi laterali: salto e tuffo ----
   Stesso stile del campo: tutto a pixel interi con contorno scuro. Le figure sono sprite a pixel grossi (athlete, sotto). Sfondo e interfaccia sono in drawCine. */
let cine=null;
const CINE_DK=[1,0.85,0.72,0.6];   // ampiezza di verde e giallo per difficolta' (Facile, Medio, Difficile, Estrema)
const easeIO=t=>t*t*(3-2*t);
const bez=(p0,p1,p2,t)=>{const a=1-t;return {x:a*a*p0.x+2*a*t*p1.x+t*t*p2.x,y:a*a*p0.y+2*a*t*p1.y+t*t*p2.y};};
function startCine(spec){
  sgCine(spec);   // per «Segnala un problema»
  matchLook();
  const kits=UNI.map(kit=>({...kit}));
  G.mode='cine';
  const timing=spec.kind==='jump'||spec.timing;
  // ampiezza della zona verde: dipende dal salto (duello in aria) o dal tuffo del tuo giocatore
  const sk=spec.kind==='jump'?'sal':'tuf',mp=spec.kind==='jump'?(spec.a.t===0?spec.a:spec.d):spec.diver;
  // la difficolta' della partita stringe verde e giallo (la velocita' resta quella del Salto o del Tuffo, che si legge gia' sulla barra)
  const dk=CINE_DK[G.lvl?clamp(G.lvl[1]|0,0,3):0],hw=(0.025+0.095*clamp((mp.s[sk]-40)/60,0,1))*dk;
  cine={yw:0.165*dk,spec,kits,t:0,rt:0,phase:'aim',timing,locked:false,pos:0,bonus:0,quality:'',out:null,aimEnd:timing?2.4:1.0,hw,sp:2.3-1.0*clamp((mp.s[sk]-40)/60,0,1),statTxt:(sk==='sal'?'Salto ':'Tuffo ')+mp.s[sk]};
  HOOKS.vibe(25);
}
function cineTap(){
  const c=cine;if(!c||c.phase!=='aim'||!c.timing||c.locked||c.t<0.8)return;
  const q=Math.abs(c.pos-0.5);
  c.locked=true;c.lockT=c.t;c.bonus=q<=c.hw?1:(q<=c.hw+c.yw?clamp(1-0.5*(q-c.hw)/c.yw,0.5,1):0);   // verde 1, giallo da 0,5 a 1, nero 0: la scena si apre solo quando il nero non basta (08-prese-duelli.js)
  c.quality=c.bonus>=1?'Perfetto!':(c.bonus>=0.5?'Buono':(c.bonus>0?'Quasi':'Fuori tempo'));HOOKS.sfx('timing',c.bonus>=1?1:(c.bonus>=0.5?0.4:0));
  c.aimEnd=c.t+0.45;
}
function cineResolve(c){c.out=c.spec.fixed!==undefined?c.spec.fixed:c.spec.resolve(c.bonus);sgCineOut(c);c.phase='res';c.rt=0;c.resT0=c.t;}
function updateCine(dt){
  const c=cine;if(!c)return;
  c.t+=dt;
  if(c.phase==='aim'){
    if(c.timing&&!c.locked){
      const ph=((c.t-0.8)*c.sp)%2;c.pos=ph<0?0:(ph<1?ph:2-ph);
      if(c.t>=c.aimEnd){c.locked=true;c.lockT=c.t;c.bonus=0;c.quality='Nessun tocco';c.aimEnd=c.t+0.1;}
    }
    if(c.t>=c.aimEnd)cineResolve(c);
  }else{c.rt+=dt;if(c.rt>=(reduceMotion ? 0.2 : 1.4))endCine();}
}
function endCine(){
  const c=cine;if(!c)return;
  cine=null;G.mode='play';HOOKS.vibe(20);
  c.spec.apply(c.out);
}
function skipCine(){const c=cine;if(!c)return;if(c.phase==='aim')cineResolve(c);endCine();}

/* ---- OMINI A PIXEL: le figure delle scene laterali sono disegnate direttamente su una griglia grossa (di solito 1 pixel dell'omino = 1 pixel del gioco:
   un omino in piedi e' alto circa 75 pixel, testa compresa), con bordi netti e senza sfumature: arti e busto sono segmenti e poligoni riempiti pixel per pixel,
   la testa e' uno sprite disegnato a mano (squadrata, profilo verso destra). Ogni materiale ha tre toni: luce sul bordo in alto e sul davanti,
   ombra sotto e dietro, base in mezzo; linea scura dove un materiale finisce su un altro e contorno quasi nero tutt'intorno, come gli sprite a 8 bit.
   Lo scheletro delle pose (skelOf) e' in unita' hu dall'anca, come prima: mani e disco restano allineati (handPos). */
// teste (12x13, profilo verso destra): S pelle, s pelle in ombra, H capelli, h capelli scuri, E occhio, M bocca, W elastico della coda. Stili come makeLook:
// 0 corti a ciuffi, 1 medi, 2 lunghi, 3 coda, 4 rasati. [righe, centro x, centro y]: il centro e' il punto che sta sopra la spalla
const PX_HEAD=[
 [["...H..H.....","..HHH.HH.H..",".HHHHHHHHHH.","HHHHHHHHHHH.","hHHHHHhHHHH.","hHHHhSSShHH.","hHHhSSSSShS.","hHsSSSSSESS.","hhsSsSSSESSS",".hsSSSSSSSS.","..sSSSSSMSS.","...sSSSSSS..",".....ssSS..."],6,6],
 [["............","...HHHHHH...",".HHHHHHHHHH.","HHHHHHHHHHH.","hHHHHHhHHHH.","hHHHhSSShHH.","hHHhSSSSShS.","hHHSSSSSESS.","hhHSsSSSESSS","hhHSSSSSSSS.","hhhSSSSSMSS.","...sSSSSSS..",".....ssSS..."],6,6],
 [["............","...HHHHHH...",".HHHHHHHHHH.","HHHHHHHHHHH.","hHHHHHhHHHH.","hHHHhSSShHH.","hHHhSSSSShS.","hHhSSSSSESS.","hhhSsSSSESSS","hhhSSSSSSSS.","hHhSSSSSMSS.","hHhsSSSSSS..","hHh..ssSS...","hHh.........","hHh.........","hhh........."],6,6],
 [["...............","......HHHHHH...","....HHHHHHHHHH.","...HHHHHHHHHHH.",".hHWHHHHHhHHHH.","hHHWHHHhSSShHH.","hH.hHHhSSSSShS.",".h.hHsSSSSSESS.","...hhsSsSSSESSS","....hsSSSSSSSS.",".....sSSSSSMSS.","......sSSSSSS..","........ssSS..."],9,6],
 [["............","............",".hhhhhhhhhh.","hhhhhhhhhhh.","hhhhhhhhhhh.","ssSSSSSSSSS.","ssSSSSSSShS.","sssSSSSSESS.","sssSsSSSESSS",".ssSSSSSSSS.","..sSSSSSMSS.","...sSSSSSS..",".....ssSS..."],6,6]
];
const OUTRGB=[14,12,24];
const pxRgb=c=>{if(c[0]==='#'){const n=parseInt(c.slice(1),16);return [n>>16,(n>>8)&255,n&255];}const m=c.match(/[\d.]+/g);return [+m[0],+m[1],+m[2]];};
const pxTone=(c,k)=>c.map(v=>Math.round(k<0?v*(1+k):v+(255-v)*k));
const OZ=hu=>Math.max(1,Math.round(hu/20));   // grandezza del pixel dell'omino in pixel del gioco: nelle scene hu vale 37-43, quindi 2 (pixel grossi, come gli sprite a 8 bit; la testa di 12 pixel e' circa mezzo hu)
// scheletro della posa in unita' hu (0,0 = anca, y verso il basso, profilo verso destra): gambe L, braccia A (spalla, gomito, mano), spalla sh
function skelOf(pose,tt){
  let L,A,sh=[0,-0.52];
  if(pose==='up'){
    L=[[[-0.05,0],[-0.13,0.42],[-0.42,0.66]],[[0.06,0],[-0.03,0.45],[-0.3,0.74]]];
    A=[[[-0.1,-0.48],[-0.3,-0.26],[-0.36,-0.02]],[[0.1,-0.48],[0.1,-0.95],[0.06,-1.38]]];sh=[-0.04,-0.52];   // salto a una mano: quella vicina va al disco, l'altra resta indietro per l'equilibrio
  }else if(pose==='dive'){
    L=[[[-0.03,0],[-0.06,0.5],[-0.03,0.96]],[[0.04,0],[0.1,0.52],[0.22,0.94]]];
    A=[[[-0.08,-0.48],[-0.06,-0.95],[-0.03,-1.4]],[[0.08,-0.48],[0.09,-0.95],[0.1,-1.4]]];
  }else if(pose==='run'){
    sh=[0.14,-0.52];L=[];A=[];
    for(let i=0;i<2;i++){
      const ph=tt+i*Math.PI,sn=Math.sin(ph),th=sn*0.85,sk=th-0.25-0.9*Math.max(0,-sn);
      const kn=[0.02+Math.sin(th)*0.46,Math.cos(th)*0.46],ft=[kn[0]+Math.sin(sk)*0.44,kn[1]+Math.cos(sk)*0.44];
      L.push([[0,0],kn,ft]);
      const al=-sn*0.85,el=[sh[0]+Math.sin(al)*0.3,sh[1]+0.04+Math.cos(al)*0.3],be=al+1.25;
      A.push([[sh[0],sh[1]+0.04],el,[el[0]+Math.sin(be)*0.27,el[1]+Math.cos(be)*0.27]]);
    }
  }else{
    const b=Math.sin(tt*6)*0.02;
    L=[[[-0.09,0],[-0.17,0.45+b],[-0.16,0.9]],[[0.09,0],[0.2,0.45+b],[0.14,0.9]]];
    A=[[[-0.08,-0.46],[-0.3,-0.3],[-0.36,-0.08]],[[0.08,-0.46],[0.27,-0.34],[0.42,-0.48]]];   // pronto: braccio vicino avanti e in alto (pronto a saltare), l'altro indietro: entrambi fuori dal busto
  }
  return {L,A,sh};
}
// TUFFO IN ORIZZONTALE, presa a una mano: tre pose chiave (sempre in hu dall'anca, profilo verso destra) che si fondono tra loro (skMix)
// per un movimento continuo: CARICA (ginocchio piegato, busto avanti, braccia indietro), SPINTA (la gamba d'appoggio si distende, l'altra
// porta avanti il ginocchio, le braccia salgono) e VOLO (corpo disteso; il braccio vicino tende la mano al disco, l'altro resta piegato sotto).
// Una posa-oggetto {L,A,sh,dv} va bene ovunque vada il nome di una posa (athlete, handPos, heldAt): dv alza la testa come nel tuffo.
const SK_LOAD={L:[[[-0.04,0],[-0.2,0.42],[-0.55,0.66]],[[0.06,0],[0.4,0.34],[0.12,0.8]]],A:[[[-0.08,-0.48],[-0.3,-0.28],[-0.5,-0.12]],[[0.08,-0.48],[-0.14,-0.26],[-0.36,-0.08]]],sh:[0.06,-0.52]};
const SK_PUSH={L:[[[-0.04,0],[0.36,0.26],[0.2,0.68]],[[0.04,0],[-0.03,0.5],[-0.08,0.97]]],A:[[[-0.08,-0.48],[0.2,-0.72],[0.38,-0.98]],[[0.08,-0.48],[0.16,-0.92],[0.24,-1.34]]],sh:[0.03,-0.52]};
const SK_FLY={L:[[[-0.03,0],[-0.05,0.5],[-0.02,0.97]],[[0.04,0],[0.11,0.5],[0.26,0.9]]],A:[[[-0.08,-0.48],[0.2,-0.66],[0.38,-0.88]],[[0.08,-0.48],[0.1,-0.95],[0.11,-1.42]]],sh:[0,-0.52]};
const skMix=(a,b,k)=>{const m=(p,q)=>[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k];
  return {L:a.L.map((l,i)=>l.map((p,j)=>m(p,b.L[i][j]))),A:a.A.map((l,i)=>l.map((p,j)=>m(p,b.A[i][j]))),sh:m(a.sh,b.sh),dv:true,ch:b.ch};};
const skOf=(pose,tt)=>typeof pose==='object'?pose:skelOf(pose,tt);
// il movimento del tuffo nel tempo v dallo stacco (v<0: corsa): carica (0-0,12 s), spinta (fino a 0,24), volo fino alla presa (DV_CT) e caduta in scivolata.
// xs: dove corre; xc: dove sta l'anca nell'istante della presa; tt: fase della corsa. Tutto continuo (posizione, anca, inclinazione e pose)
const SK_FLYD={...SK_FLY,dv:true};
// stesso volo con la presa della mano lontana (la sinistra, piu' lunga: il disco resta lontano dalla testa); la destra, vicina, scende piegata
// e staccata dal corpo, senza coprire la faccia (menu iniziale)
const SK_FLY2={...SK_FLY,A:[[[-0.08,-0.48],[-0.04,-1.04],[0,-1.6]],[[0.08,-0.48],[0.36,-0.56],[0.6,-0.74]]],ch:0},SK_FLY2D={...SK_FLY2,dv:true};
const DV_CT=0.45,DV_LOAD=0.12,DV_PUSH=0.24,DV_ROT=1.47,DV_HIP=0.86;
function diveMo(v,xs,xc,u,tt){
  if(v<=0)return {dx:xs,hip:0.9,rot:0,pose:'run',tt};
  const k=Math.min(v,DV_CT)/DV_CT,s=k*k*(2-k);   // parte da fermo e arriva alla presa ancora in corsa
  let dx=xs+(xc-xs)*s,hip,rot,pose;
  if(v<DV_LOAD){const e=easeIO(v/DV_LOAD);pose=skMix(skelOf('run',tt),SK_LOAD,e);hip=0.9-0.22*e;rot=0.32*e;}
  else if(v<DV_PUSH){const e=easeIO((v-DV_LOAD)/(DV_PUSH-DV_LOAD));pose=skMix(SK_LOAD,SK_PUSH,e);hip=0.68+0.12*e;rot=0.32+0.53*e;}
  else if(v<DV_CT){const q=(v-DV_PUSH)/(DV_CT-DV_PUSH),e=easeIO(q);pose=skMix(SK_PUSH,SK_FLY,e);hip=0.8+(DV_HIP-0.8)*e+0.06*Math.sin(Math.PI*q);rot=0.85+(DV_ROT-0.85)*e;}
  else{const q=v-DV_CT,f=clamp(q/0.32,0,1);pose=SK_FLYD;
    dx=xc+(xc-xs)/DV_CT*0.42*(1-Math.exp(-q/0.42));hip=DV_HIP-(DV_HIP-0.27)*f*f-0.03*clamp((q-0.32)/0.5,0,1);rot=DV_ROT+0.06*f;}
  return {dx,hip,rot,pose,tt};
}
// dove sta l'anca perche' la mano della presa arrivi in (tx, ty) nell'istante della presa
const diveAt=(tx,u)=>{const h=handPos(0,0,DV_HIP,1,DV_ROT,u,SK_FLY);return tx-h.x;};
// materiali: indice nella tavolozza dell'omino
const PXM={SK:1,SKF:2,HR:3,SH:4,PT:5,PTF:6,SO:7,SHO:8,SOL:9,HD:10,SKD:11,EYE:12,MO:13,WH:14,HSK:15};   // HSK: pelle del viso, coi toni disegnati a mano (senza ombre automatiche)
const PXM_LN=new Set([PXM.SK,PXM.SKF,PXM.SH,PXM.PT,PXM.PTF,PXM.SO,PXM.SHO]);   // materiali che fanno la linea scura dove finiscono su un altro
// I due corpi hanno superfici separate, anche quando lo stacco disegna le scie.
const PX_BUF=Array.from({length:2},()=>({
  body:document.createElement('canvas'),
  ghost:document.createElement('canvas')
}));
// stile del disegno (prove del menu iniziale): z = grandezza fissa del pixel dell'omino, hk = testa piu' grande, flat = colori piatti senza luce e ombra
const PX_OPT={z:0,hk:1,flat:false,noSh:false};
// testa piccola (7x7, disegnata 1:1) per i pixel grossi: rimpicciolire quella da 12 pixel la spezzava. h sopra l'occhio = sopracciglio
const PX_HEAD_S=[["..HHHH.",".HHHHHH","hHHHHhH","hHSSSES","hSSSSSS",".sSSSM.","..ss..."],3,3];
function athlete(x,gy,hipH,face,pose,rot,tt,hu,alpha,ghost,who){
  const Z=PX_OPT.z||OZ(hu),hs=hu/Z,hk=OZ(hu)/Z*PX_OPT.hk,R=Math.ceil(1.85*hs),n=2*R+2,c0=R+1;
  if(!ghost&&!PX_OPT.noSh){   // ombra a pixel sul prato
    const k=clamp(1-(hipH-0.9)*0.25,0.45,1);
    pell(x,gy+hu*0.04,Math.round(hu*0.6*k),Math.max(2,Math.round(hu*0.1*k)),'rgba(40,70,30,.38)');
  }
  const side=who.t,lk=who.look||DEF_LOOK,un=cine.kits[side],bw=lk.bw||1;
  const {L,A,sh}=skOf(pose,tt),cr=Math.cos(rot),sr=Math.sin(rot);
  const T=p=>{const X=cr*p[0]-sr*p[1],Y=sr*p[0]+cr*p[1];return [c0+face*X*hs,c0+Y*hs];};   // da hu (figura) a pixel dell'omino
  const id=new Uint8Array(n*n);
  const seg=(a,b,r0,r1,m)=>{   // segmento rastremato a bordi netti (raggi in hu)
    const p=T(a),q=T(b),ra=r0*hs,rb=r1*hs,x0=Math.floor(Math.min(p[0],q[0])-Math.max(ra,rb)-1),x1=Math.ceil(Math.max(p[0],q[0])+Math.max(ra,rb)+1);
    const y0=Math.floor(Math.min(p[1],q[1])-Math.max(ra,rb)-1),y1=Math.ceil(Math.max(p[1],q[1])+Math.max(ra,rb)+1),dx=q[0]-p[0],dy=q[1]-p[1],l2=dx*dx+dy*dy||1;
    for(let j=Math.max(0,y0);j<=Math.min(n-1,y1);j++)for(let i=Math.max(0,x0);i<=Math.min(n-1,x1);i++){
      const px_=i+0.5,py_=j+0.5,t=clamp(((px_-p[0])*dx+(py_-p[1])*dy)/l2,0,1),ex=p[0]+dx*t-px_,ey=p[1]+dy*t-py_,r=ra+(rb-ra)*t;
      if(ex*ex+ey*ey<=r*r+0.15)id[j*n+i]=m;
    }
  };
  const poly=(pts,m)=>{   // poligono pieno (punti in hu)
    const P=pts.map(T);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of P){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}
    for(let j=Math.max(0,Math.floor(y0));j<=Math.min(n-1,Math.ceil(y1));j++)for(let i=Math.max(0,Math.floor(x0));i<=Math.min(n-1,Math.ceil(x1));i++){
      const px_=i+0.5,py_=j+0.5;let ins=false;
      for(let a=0,b=P.length-1;a<P.length;b=a++){const pa=P[a],pb=P[b];if((pa[1]>py_)!==(pb[1]>py_)&&px_<(pb[0]-pa[0])*(py_-pa[1])/(pb[1]-pa[1])+pa[0])ins=!ins;}
      if(ins)id[j*n+i]=m;
    }
  };
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const fwd=(p,k)=>{const q=T([p[0]+k,p[1]]),r=T(p);return q[0]-r[0];};
  const quad=(a,b,w0,w1,m,x0,x1)=>{   // segmento a estremi dritti (larghezze in hu); x0/x1 allungano gli estremi lungo l'osso, per chiudere le giunture
    const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,nx=-uy,ny=ux,A=[a[0]-ux*(x0||0),a[1]-uy*(x0||0)],B=[b[0]+ux*(x1||0),b[1]+uy*(x1||0)];
    poly([[A[0]+nx*w0/2,A[1]+ny*w0/2],[B[0]+nx*w1/2,B[1]+ny*w1/2],[B[0]-nx*w1/2,B[1]-ny*w1/2],[A[0]-nx*w0/2,A[1]-ny*w0/2]],m);
  };
  const arm=(a,sk)=>{const [s,e,h]=a;
    quad(s,e,0.17,0.15,sk,0.03,0.07);quad(e,h,0.15,0.13,sk,0.03,0.02);   // braccio e avambraccio, gomito chiuso
    const hd=[h[0]+(h[0]-e[0])*0.25,h[1]+(h[1]-e[1])*0.25];quad(h,hd,0.19,0.19,sk,0.04,0);   // mano a blocco
    quad(s,mix(s,e,0.5),0.22,0.21,PXM.SH,0.06,0);};   // manica: finisce con un taglio dritto
  const leg=(l,sk,pt)=>{
    const [hp,kn,ft]=l,h0=mix(hp,kn,0.18);seg(h0,kn,0.105,0.085,sk);seg(kn,ft,0.085,0.07,sk);   // la coscia parte sotto l'orlo della maglia: niente sporgenze ai lati del busto
    seg(mix(kn,ft,0.45),ft,0.08,0.075,PXM.SO);   // calza
    const toe=[ft[0]+0.19,ft[1]+0.02];seg([ft[0]-0.03,ft[1]+0.01],toe,0.085,0.07,PXM.SHO);seg([ft[0]-0.04,ft[1]+0.075],[toe[0]+0.02,toe[1]+0.06],0.022,0.022,PXM.SOL);   // scarpa e suola
    seg(h0,mix(hp,kn,0.6),0.125*bw,0.12*bw,pt);   // pantaloncino
  };
  // dietro: braccio e gamba lontani (pelle piu' scura), poi la gamba vicina, il bacino e il busto
  arm(A[0],PXM.SKF);leg(L[0],PXM.SKF,PXM.PTF);leg(L[1],PXM.SK,PXM.PT);
    const hip=[0,0.03],Lt=Math.hypot(sh[0]-hip[0],sh[1]-hip[1]),ux=(sh[0]-hip[0])/Lt,uy=(sh[1]-hip[1])/Lt,nx=-uy,ny=ux;
  const tp=(t,f)=>[hip[0]+ux*Lt*t+nx*f*bw,hip[1]+uy*Lt*t+ny*f*bw];   // t: 0 anca -> 1 spalla; f>0 petto
  poly([tp(-0.42,-0.15),tp(-0.42,0.15),tp(-0.05,0.17),tp(-0.05,-0.17)],PXM.PT);   // bacino: blocco dei pantaloncini sotto la maglia, largo quanto il busto
  poly([tp(-0.2,-0.18),tp(0.35,-0.17),tp(0.75,-0.19),tp(1.02,-0.15),tp(1.1,0.02),tp(1.02,0.16),tp(0.7,0.2),tp(0.35,0.16),tp(-0.2,0.18)],PXM.SH);
  seg(sh,[sh[0]+0.03,sh[1]-0.14],0.08,0.08,PXM.SK);   // collo
  // capelli lunghi dietro le spalle
  // testa: sprite ruotato con la figura (vicino al pixel), centro sopra la spalla
  const dk=pose==='dive'||pose.dv?clamp(rot/1.25,0,1):0,hrot=hk<0.8?0:rot*(1-0.75*dk),hcr=Math.cos(hrot),hsr=Math.sin(hrot);   // tuffo: testa alzata sopra le braccia, sguardo avanti verso il disco; la testa piccola dei pixel grossi resta dritta (ruotata faceva spuntare pixel isolati)
  const hc=T([sh[0]+0.04-0.26*dk,sh[1]-0.36*PX_OPT.hk+0.06*dk]),sm=hk<0.8,HD=sm?PX_HEAD_S:PX_HEAD[(lk.style|0)%PX_HEAD.length],hd=HD[0],hq=sm?PX_OPT.hk:hk,hw=hd[0].length,hh=hd.length,hcx=HD[1],hcy=HD[2];
  const hmap={S:PXM.HSK,s:PXM.SKD,H:PXM.HR,h:PXM.HD,E:PXM.EYE,M:PXM.MO,W:PXM.WH};
  for(let j=Math.floor(hc[1]-24*hq);j<=Math.ceil(hc[1]+24*hq);j++)for(let i=Math.floor(hc[0]-24*hq);i<=Math.ceil(hc[0]+24*hq);i++){
    if(i<0||j<0||i>=n||j>=n)continue;
    const dx=(i+0.5-hc[0])*face/hq,dy=(j+0.5-hc[1])/hq,qx=Math.floor(hcr*dx+hsr*dy+hcx),qy=Math.floor(-hsr*dx+hcr*dy+hcy);
    if(qx<0||qy<0||qx>=hw||qy>=hh)continue;const ch=hd[qy][qx];if(ch!=='.')id[j*n+i]=hmap[ch];
  }
  arm(A[1],PXM.SK);   // davanti: braccio vicino
  // colori
  const skin=pxRgb(lk.skin),hair=pxRgb(lk.hair),cs=pxRgb(un.shirt),sorts=pxRgb(un.shorts);   // la maglia e' quella della divisa in campo (in Ultimate Team la scegli tu)
  const pat=!ghost&&un.pat?un.pat:'',csB=pat?pxRgb(un.shirtB):null;
  const patAt=(i,j)=>{   // motivo della maglia: dal pixel alle coordinate del busto (t lungo il busto, f verso il petto)
    const X=(i+0.5-c0)/(face*hs),Y=(j+0.5-c0)/hs,dx=cr*X+sr*Y-hip[0],dy=-sr*X+cr*Y-hip[1],t=(dx*ux+dy*uy)/Lt,f=(dx*nx+dy*ny)/bw;
    return t>-0.25&&t<1.15&&Math.abs(f)<0.22&&eqPatHit(pat,(f+0.2)/0.4,(1.1-t)/1.3);};
  const base=[null,skin,pxTone(skin,-0.2),hair,cs,sorts,pxTone(sorts,-0.15),pxRgb(un.socks),pxRgb(un.shoe),[238,242,248],pxTone(hair,-0.4),pxTone(skin,-0.22),[20,18,30],pxTone(skin,-0.5),[255,255,255],skin];
  const auto=new Set([PXM.SK,PXM.SKF,PXM.HR,PXM.SH,PXM.PT,PXM.PTF,PXM.SO,PXM.SHO]);
  const B=PX_BUF[side][ghost?'ghost':'body'];if(B.width!==n){B.width=n;B.height=n;}
  const gb=B.getContext('2d'),od=gb.createImageData(n,n),o=od.data,at=(i,j)=>i<0||j<0||i>=n||j>=n?0:id[j*n+i],fr=face>0?1:-1;
  const gc=ghost?pxTone(cs,0.35):null;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
    const p=j*n+i,k=id[p];let c=null;
    if(ghost){if(k&&((i+j)&1)===0)c=gc;}
    else if(k){
      const dn=at(i,j+1),bk=at(i-fr,j);
      if(PXM_LN.has(k)&&((dn&&dn!==k&&PXM_LN.has(dn)&&!(k===PXM.SO||dn===PXM.SO))||(bk&&bk!==k&&PXM_LN.has(bk)&&!(k===PXM.SO||bk===PXM.SO))))c=OUTRGB;
      else if(auto.has(k)&&!PX_OPT.flat){
        const b=pat&&k===PXM.SH&&patAt(i,j)?csB:base[k],up=at(i,j-1),fw=at(i+fr,j),lit=(up!==k||fw!==k)&&dn===k,thick=at(i+fr,j)===k&&at(i+2*fr,j)===k&&at(i+3*fr,j)===k,dark=dn!==k||bk!==k||(thick&&(at(i-2*fr,j)!==k||at(i-3*fr,j)!==k));   // nelle parti larghe l'ombra dietro e' di 3 pixel
        c=lit?pxTone(b,0.22):(dark?pxTone(b,-0.3):b);
      }else c=base[k];
    }else if(at(i-1,j)||at(i+1,j)||at(i,j-1)||at(i,j+1))c=OUTRGB;
    if(c){o[p*4]=c[0];o[p*4+1]=c[1];o[p*4+2]=c[2];o[p*4+3]=255;}
  }
  gb.putImageData(od,0,0);
  const hx=Math.round(x),hy=Math.round(gy-hipH*hu);
  ctx.save();ctx.globalAlpha=ghost?0.85:(alpha===undefined?1:alpha);ctx.imageSmoothingEnabled=false;
  ctx.drawImage(B,hx-c0*Z,hy-c0*Z,n*Z,n*Z);ctx.restore();
}
// la mano vicina (quella che prende) nella posa: stesso scheletro e stessa rotazione di athlete, in pixel del gioco
const handPos=(x,gy,hipH,face,rot,hu,pose)=>{
  const S=skOf(pose||'dive',0),h=S.A[S.ch===0?0:1][2],cr=Math.cos(rot),sr=Math.sin(rot);   // ch: la mano che prende (0 = quella lontana)
  return {x:Math.round(x)+face*(cr*h[0]-sr*h[1])*hu,y:Math.round(gy-hipH*hu)+(sr*h[0]+cr*h[1])*hu};
};
// disco preso. PX_GRIP 'rim': la mano lo stringe dal bordo (il disco sta oltre la mano, lungo il braccio, e la mano si vede sopra il bordo);
// 'hide': il disco e' centrato sulla mano e la copre. heldAt da' il centro del disco: e' anche il punto d'arrivo del volo, cosi' non scatta alla presa
let PX_GRIP='rim';
function heldAt(x,gy,hipH,face,rot,hu,pose){
  const p=handPos(x,gy,hipH,face,rot,hu,pose),ax=face*Math.sin(rot),ay=-Math.cos(rot),rx=Math.max(5,ri(0.17*hu*1.7)),ry=Math.max(2,ri(rx*0.42));
  const k=PX_GRIP==='rim'?1/Math.hypot(ax/rx,ay/ry)-1:0;   // distanza dal centro al bordo nella direzione del braccio
  return {x:p.x+ax*k,y:p.y+ay*k,hx:p.x,hy:p.y};
}
function heldDisc(x,gy,hipH,face,rot,hu,pose,who,spin){
  const q=heldAt(x,gy,hipH,face,rot,hu,pose);discSprite(q.x,q.y,0.17*hu,spin);
  if(PX_GRIP!=='rim')return;
  const sk=pxRgb(((who&&who.look)||DEF_LOOK).skin),hx=ri(q.hx),hy=ri(q.hy),s=Math.max(2,Math.round(hu*0.06));
  px(hx-s-1,hy-s-1,2*s+3,2*s+3,'rgb('+OUTRGB.join(',')+')');px(hx-s,hy-s,2*s+1,2*s+1,'rgb('+sk.join(',')+')');   // la mano sopra il bordo del disco
  px(hx-s,hy-s,2*s+1,1,'rgb('+pxTone(sk,0.22).join(',')+')');px(hx-s,hy+s,2*s+1,1,'rgb('+pxTone(sk,-0.3).join(',')+')');
}
// disco grande a pixel (stesso disegno di quello del campo, ingrandito): bordo scuro, corpo chiaro, ombra sotto e riflesso che gira
function discSprite(x,y,r,spin){
  x=ri(x);y=ri(y);r=Math.max(5,ri(r*1.7));const ry=Math.max(2,ri(r*0.42));
  pell(x,y,r+1,ry+1,PAL.out);pell(x,y,r,ry,'#f6f8f4');
  px(x-r+2,y+ry-1,2*r-3,1,'#b9c6d8');px(x-r+3,y-ry+1,2*r-5,1,'#ffffff');
  const s=((spin|0)%4+4)%4;px(x-r+3+s*2,y,3,1,'#7f9bd0');
}
function outlined(txt,x,y,size,fill,sc,al){   // testo a pixel col contorno, centrato in (x, y)
  const f=size>=26?'B':(size>=12?'P':'p'),hh=f==='B'?32:(f==='P'?16:8);
  ctx.save();ctx.globalAlpha=al===undefined?1:al;ptext(txt,x,y-hh/2,{f,c:fill});ctx.restore();
}
const slowT=(rt,ct)=>{const a=ct-0.12,b=ct+0.15;return rt<a?rt:(rt<b?a+(rt-a)*0.5:rt-(b-a)*0.5);};
// barra del tempismo: stessa grafica della barra della potenza del pull (traccia scura, zone piatte, cursore bianco con contorno)
function drawMeter(c,w,h){
  const bw=ri(w*0.46),bh=Math.max(10,ri(h*0.05)),bx=ri(w/2-bw/2),by=ri(h*0.865);
  const al=c.phase==='res'?clamp(1-(c.rt-0.5)/0.3,0,1):1;
  if(al<=0)return;
  ctx.save();ctx.globalAlpha=al;
  pbox(bx-5,by-bh/2-5,bw+10,bh+10,PAL.out,null);
  px(bx,by-bh/2,bw,bh,'#2b3157');
  const yh=c.hw+c.yw,yx=ri(bx+bw*(0.5-yh)),yw=ri(bw*yh*2);
  px(yx,by-bh/2,yw,bh,'#ffd23f');
  const inG=Math.abs(c.pos-0.5)<=c.hw,gx=ri(bx+bw*(0.5-c.hw)),gw=ri(bw*c.hw*2);
  px(gx,by-bh/2,gw,bh,inG&&!c.locked?'#a8ffd0':'#4fe58f');
  px(bx,by-bh/2,bw,1,'rgba(255,255,255,.25)');
  const nx=ri(bx+bw*c.pos);
  px(nx-2,by-bh/2-5,5,bh+10,PAL.out);px(nx-1,by-bh/2-4,3,bh+8,c.locked?'#ffd23f':'#ffffff');
  ctx.restore();
  // ISTRUZIONE ed ESITO in una linguetta attaccata alla cornice della barra (prima il testo galleggiava sopra le gambe dei giocatori e l'esito copriva la barra).
  // L'esito entra come un timbro: un attimo piu' grande con il bordo bianco, poi si assesta nel colore del risultato
  const top=by-bh/2-5;
  ctx.save();ctx.globalAlpha=al;
  if(c.locked){
    const age=c.t-(c.lockT===undefined?c.t:c.lockT),qc=c.bonus>=1?'#6dff9e':(c.bonus>=0.5?'#ffe27a':'#ff8a8a'),big=age<0.09,f=big||c.bonus>=1?'P':'p',fh=f==='P'?16:8;
    const tw=ptw(c.quality.toUpperCase(),f)+(big?18:12),th=fh+(big?10:7),tx=ri(w/2-tw/2),ty=top-th+(big?-2:1);
    pbox(tx-1,ty-1,tw+2,th+2,PAL.out,null);pbox(tx,ty,tw,th,'#0c1330',big?'#ffffff':qc);
    ptext(c.quality.toUpperCase(),w/2,ty+ri((th-fh)/2)+(f==='P'?1:0),{f,c:qc,o:false});
  }else{
    const txt='TOCCA NEL VERDE',tw=ptw(txt,'p')+12,tx=ri(w/2-tw/2),ty=top-14;
    pbox(tx-1,ty-1,tw+2,16,PAL.out,null);pbox(tx,ty,tw,15,'#0c1330','#4fe58f');
    ptext(txt,w/2,ty+4,{f:'p',c:'#ffffff',o:false});
  }
  ctx.restore();
}
function drawCine(){
  const c=cine,sp=c.spec,w=VW,h=VH,Z=1.5,u0=h*0.115,gy0=h*0.74,fy0=gy0-0.3*u0,cx=ri(w/2);
  const u=u0*Z,gy=ri(fy0+(gy0-fy0)*Z),W=w*Z;   // lo zoom del vecchio stacco (1,5) e' gia' dentro le misure: si disegna tutto direttamente a pixel
  const jump=sp.kind==='jump',ct=jump?0.36:0.45;
  const aim=c.phase==='aim',vt=aim?0:slowT(c.rt,ct);
  const SD=jump&&!(sp.runA&&sp.runD)?0:(aim?c.t:(c.resT0||0)+(vt<=0.5?vt-vt*vt:0.25));   // lo sfondo scorre nel tuffo e nel salto in cui corrono tutti e due
  let shx=0,shy=0;
  if(!aim&&vt>=ct&&vt<ct+0.3){const a=(1-(vt-ct)/0.3)*u*0.1;shx=ri((Math.random()-0.5)*a);shy=ri((Math.random()-0.5)*a);}
  ctx.save();ctx.translate(shx,shy);
  const bH=ri(0.75*u),bY=gy-ri(0.3*u)-bH;   // cartelloni: il loro bordo basso e' l'inizio del prato
  const gt=bY+bH;
  drawCineStands(w,bY,bH,u,SD,!aim&&vt>=ct&&benefitNow,vt);
  // prato: erba del campo, strisce di taglio che scorrono, puntini
  px(-4,gt,w+8,h-gt+4,PAL.grass);
  const sw=ri(2.6*u),off=ri((SD*u*1.4)%(sw*2));
  if(fieldKind(venueNow())>0)for(let x=-sw*2-off;x<w+sw;x+=sw*2)px(x,gt,sw,h-gt,PAL.grass2);
  px(-4,gt+ri(1.65*u),w+8,h,PAL.apron);px(-4,gt+ri(1.65*u),w+8,1,PAL.line);
  for(let i=0;i<70;i++){const hh=hashStr('d'+i),dx=((hh%997)/997*w+ri(SD*u*1.4))%w,dy=gt+3+((hh>>10)%97)/97*(h-gt-4);px(ri(dx),ri(dy),1,1,PAL.dot);}
  px(-4,gt,w+8,1,PAL.out);

  let benefit=null,result='',plates=[],impact=null;
  const trail=(P0,P1,E,pd)=>{
    for(let i=1;i<=9;i+=2){const a=bez(P0,P1,E,Math.max(0,pd-0.03*i));px(ri(a.x)-1,ri(a.y)-1,3-(i>5?1:0),3-(i>5?1:0),i<4?'#ffffff':'rgba(255,255,255,.6)');}
  };
  if(jump){
    const winA=c.out==='att';
    const A=sp.a,Dd=sp.d,ax=ri(cx-0.8*u),dxp=ri(cx+0.8*u),lean=0.3;
    const hi=winA?1.16:0.93,lo=winA?0.46:0.66;   // presa: chi prende sale molto piu' dell'altro; disco respinto: differenza piccola come prima
    const lifts=j=>{const pk=Math.pow(Math.sin(Math.PI*j),0.7);return {a:pk*(winA?hi:lo),d:pk*(winA?lo:hi)};};
    // SALTO DA FERMO O IN CORSA (sp.runA/sp.runD, dal motore: jumpRun): chi era gia' vicino al disco aspetta in posizione e salta sul posto;
    // chi arrivava da lontano entra correndo da sinistra (come nel tuffo), fa gli ultimi passi e stacca all'ultimo, arrivando sul punto della presa nell'istante del contatto.
    // Se corrono tutti e due lo sfondo scorre come nel tuffo e il difensore corre un po' piu' in basso (piu' vicino a chi guarda)
    const run={a:!!sp.runA,d:!!sp.runD},both=run.a&&run.d,bob=Math.sin(c.t*7)*0.04,TK=0.16,t0=c.resT0||c.t;
    const spot={a:both?ri(cx-0.7*u):ax,d:run.d?ri(cx+(both?0.25:-0.05)*u):dxp},gyk={a:gy,d:run.d&&both?gy+ri(0.45*u):gy},huk={a:u,d:run.d&&both?u*1.06:u};
    const far=tm=>both?1.5:3.4-1.4*clamp(tm/2.4,0,1);   // distanza dal punto di stacco mentre corre (in u): da soli si avvicina durante l'attesa
    const jst=(k,v)=>{   // posizione, anca, posa e inclinazione del giocatore k ('a' o 'd') al tempo v dello stacco (v<0: attesa)
      const x0=spot[k],amp=(k==='a')===winA?hi:lo;
      if(!run[k]){
        const fc=k==='a'?1:-1;
        if(v<0)return {x:x0,hip:0.9+(k==='a'?bob:-bob),pose:'ready',rot:0,fc,tt:c.t};
        return {x:x0,hip:0.9+lifts(clamp(v/0.72,0,1))[k],pose:'up',rot:lean,fc,tt:c.t};
      }
      const rt=both?SD*11+(k==='a'?0:1.3):c.t*11;
      if(v<0)return {x:x0-far(c.t)*u,hip:0.9,pose:'run',rot:0,fc:1,tt:rt};
      const x=lerp(x0-far(t0)*u,x0,clamp(v/ct,0,1))+0.3*u*Math.max(0,v-ct);
      if(v<TK)return {x,hip:0.9,pose:'run',rot:0.12,fc:1,tt:rt};   // ultimi passi di corsa
      const jr=clamp((v-TK)/(2*(ct-TK)),0,1);   // stacco in corsa: il punto piu' alto e' nell'istante del contatto
      return {x,hip:0.9+Math.pow(Math.sin(Math.PI*jr),0.7)*amp,pose:'up',rot:lean+0.12,fc:1,tt:c.t};
    };
    const w=winA?'a':'d',wz=jst(w,ct),C=heldAt(wz.x,gyk[w],wz.hip,wz.fc,wz.rot,huk[w],'up');   // il disco arriva nella mano di chi lo tocca, nell'istante del contatto
    const v=aim?-1:vt,za=jst('a',v),zd=jst('d',v);
    if(!aim){
      for(const gk of [3,2,1]){
        const vg=vt-gk*0.045;if(vg<=0)continue;const al=0.1+(3-gk)*0.07;
        for(const [k,who] of [['a',A],['d',Dd]]){const z=jst(k,vg);athlete(z.x,gyk[k],z.hip,z.fc,z.pose,z.rot,z.tt,huk[k],al,true,who);}
      }
    }
    for(const [k,z,who] of [['a',za,A],['d',zd,Dd]])athlete(z.x,gyk[k],z.hip,z.fc,z.pose,z.rot,z.tt,huk[k],undefined,false,who);
    const wcur=winA?za:zd;
    const P0={x:cx-W*0.38,y:gy-5.4*u},P1={x:cx-W*0.14,y:gy-6.4*u};
    let dp,pd=null;
    if(aim){pd=clamp(c.t/2.7,0,0.88);dp=bez(P0,P1,C,pd);}
    else if(vt<ct){pd=0.88+0.12*(vt/ct);dp=bez(P0,P1,C,pd);}
    else if(winA)dp={held:[wcur.x,gyk.a,wcur.hip,wcur.fc,wcur.rot,huk.a,'up',A]};
    else{const t2=vt-ct;dp={x:C.x+u*5.5*t2,y:Math.min(gy-0.2*u,C.y-u*3.2*t2+0.5*u*16*t2*t2)};}
    if(pd!==null)trail(P0,P1,C,pd);
    if(dp.held)heldDisc(...dp.held,c.t*9);else discSprite(dp.x,dp.y,0.17*u,c.t*9);
    plates=[{x:cx-2.7*u,p:A,col:c.kits[A.t].shirt},{x:cx+2.7*u,p:Dd,col:c.kits[Dd.t].shirt}];
    impact=C;
    if(!aim){benefit=(winA?A.t:Dd.t)===0;result=winA?'Presa in salto!':'Bloccato in salto!';}
  }else if(sp.kind==='dive2'){
    const Aa=sp.a,Dd=sp.d,out=c.out,win=out==='att'?Aa:(out==='def'?Dd:null),Tt={x:cx+0.9*u,y:gy-0.88*u};
    const P0={x:cx-W*0.42,y:gy-3.6*u},P1={x:cx-W*0.1,y:gy-3.4*u};
    const gyOf=who=>who===Aa?gy:gy+ri(0.5*u),huOf=who=>who===Aa?u:u*1.06;
    const dpose=(who,v)=>{   // chi arriva tardi resta piu' indietro (end: quanto manca alla presa, in u)
      const xs=cx-(who===Aa?2.5:2.8)*u,end=(win?(who===win?0:0.9):0.54)*u;
      return diveMo(v,xs,diveAt(Tt.x,huOf(who))-end,huOf(who),SD*11+(who===Aa?0:1.3));
    };
    const Ce=win?(()=>{const z=dpose(win,DV_CT);return heldAt(z.dx,gyOf(win),z.hip,1,z.rot,huOf(win),z.pose);})():Tt;   // punto della presa: la mano di chi arriva prima
    const dps={a:dpose(Aa,aim?-1:vt),d:dpose(Dd,aim?-1:vt)};
    for(const who of [Aa,Dd]){   // prima tutte le scie, poi i corpi: le scie di uno non coprono l'altro
      const dz=who===Aa?dps.a:dps.d,hu=huOf(who),gyw=gyOf(who);
      if(!aim&&vt<0.75){
        for(const gk of [3,2,1]){const qq=dpose(who,vt-gk*0.04);if(vt-gk*0.04<=0)continue;athlete(qq.dx,gyw,qq.hip,1,qq.pose,qq.rot,c.t,hu,0.1+(3-gk)*0.07,true,who);}
        for(let k=0;k<5;k++){const yy=ri(gyw-(0.2+k*0.2)*u),xx=ri(dz.dx-u*(0.6+((k*37)%7)/7*1.2));px(xx-ri(u*(0.8+((k*53)%5)/5)),yy,ri(u*(0.8+((k*53)%5)/5)),1,'rgba(255,255,255,.55)');}
      }
    }
    for(const who of [Aa,Dd]){
      const dz=who===Aa?dps.a:dps.d,hu=huOf(who),gyw=gyOf(who);
      athlete(dz.dx,gyw,dz.hip,1,dz.pose,dz.rot,dz.pose==='run'?SD*11+(who===Aa?0:1.3):c.t,hu,undefined,false,who);
    }
    let dp,pd=null;
    if(aim){pd=clamp(c.t/2.7,0,0.85);dp=bez(P0,P1,Ce,pd);}
    else if(vt<ct){pd=0.85+0.15*(vt/ct);dp=bez(P0,P1,Ce,pd);}
    else if(win){const z=win===Aa?dps.a:dps.d;dp={held:[z.dx,gyOf(win),z.hip,1,z.rot,huOf(win),z.pose,win]};}
    else{const t2=vt-ct;dp={x:Tt.x+u*3*t2,y:Math.min(gy-0.15*u,Tt.y+u*5*t2*t2)};}
    if(pd!==null)trail(P0,P1,Ce,pd);
    if(dp.held)heldDisc(...dp.held,c.t*9);else discSprite(dp.x,dp.y,0.17*u,c.t*9);
    if(!aim&&vt>0.4)dust(c,vt,[Aa,Dd].map(who=>({x:(who===Aa?dps.a:dps.d).dx,y:gyOf(who)})),u);
    plates=[{x:cx-2.2*u,p:Aa,col:c.kits[Aa.t].shirt},{x:cx+2.2*u,p:Dd,col:c.kits[Dd.t].shirt}];
    impact=win?Ce:null;
    if(!aim){benefit=win?win.t===0:Dd.t===0;result=out==='att'?'Presa in tuffo!':(out==='def'?'Blocco in tuffo!':'Tuffi mancati');}
  }else{
    const dv=sp.diver,ok=c.out===true,xs=cx-2.6*u,Tt={x:cx+0.9*u,y:gy-0.88*u};
    let E=ok?Tt:{x:Tt.x+1.5*u,y:Tt.y+0.25*u};const P0={x:cx-W*0.42,y:gy-3.6*u},P1={x:cx-W*0.1,y:gy-3.4*u};
    const dpose=v=>diveMo(v,xs,diveAt(Tt.x,u),u,SD*11);
    if(ok){const z=dpose(DV_CT);E=heldAt(z.dx,gy,z.hip,1,z.rot,u,z.pose);}   // presa: il disco arriva nella mano
    const dpz=dpose(aim?-1:vt);
    if(!aim&&vt<0.75){
      for(const gk of [3,2,1]){const qq=dpose(vt-gk*0.04);if(vt-gk*0.04<=0)continue;athlete(qq.dx,gy,qq.hip,1,qq.pose,qq.rot,c.t,u,0.1+(3-gk)*0.07,true,dv);}
      for(let i=0;i<7;i++){const yy=ri(gy-(0.2+i*0.17)*u),l=ri(u*(0.8+((i*53)%5)/5*1.2)),xx=ri(dpz.dx-u*(0.6+((i*37)%7)/7*1.2));px(xx-l,yy,l,1,'rgba(255,255,255,.55)');}
    }
    athlete(dpz.dx,gy,dpz.hip,1,dpz.pose,dpz.rot,dpz.pose==='run'?SD*11:c.t,u,undefined,false,dv);
    const rs=aim?1:clamp(1-vt/0.7,0,1);
    if(sp.chase)athlete(xs-1.2*u+(aim?0:vt*u*2.2),gy+ri(0.55*u),0.9,1,rs>0.15?'run':'ready',0,rs>0.15?SD*11+1.3:c.t,u*1.07,undefined,false,{t:1-dv.t,look:makeLook('comp'+dv.t+dv.name)});   // l'avversario che insegue c'e' solo se era vicino in campo
    let dp,pd=null;
    if(aim){pd=clamp(c.t/2.7,0,0.85);dp=bez(P0,P1,E,pd);}
    else if(vt<ct){pd=0.85+0.15*(vt/ct);dp=bez(P0,P1,E,pd);}
    else if(ok)dp={held:[dpz.dx,gy,dpz.hip,1,dpz.rot,u,dpz.pose,dv]};
    else{const t2=vt-ct;dp={x:E.x+u*3*t2,y:Math.min(gy-0.15*u,E.y+u*5*t2*t2)};}
    if(pd!==null)trail(P0,P1,E,pd);
    if(dp.held)heldDisc(...dp.held,c.t*9);else discSprite(dp.x,dp.y,0.17*u,c.t*9);
    if(!aim&&vt>0.4)dust(c,vt,[{x:dpz.dx,y:gy}],u);
    plates=[{x:cx-1.6*u,p:dv,col:c.kits[dv.t].shirt}];
    impact=ok?{x:E.x,y:E.y}:{x:Tt.x,y:Tt.y};
    if(!aim){benefit=(ok?dv.t:1-dv.t)===0;result=ok?(sp.att?'Presa in tuffo!':'Blocco in tuffo!'):'Tuffo mancato';}
  }
  benefitNow=!!benefit;
  // impatto: anello e raggi a pixel
  if(impact&&!aim&&vt>=ct&&vt-ct<0.4){
    const k=(vt-ct)/0.4,ix=ri(impact.x),iy=ri(impact.y),r=ri(u*(0.3+k*1.4));
    pring(ix,iy,r,ri(r*0.8),k<0.5?'#ffffff':'#fff3b0',k<0.6?2:1);
    for(let i=0;i<10;i++){const an=i*0.6283+0.2,r0=u*(0.45+k*0.8),r1=u*(0.75+k*1.7);pline(ix+Math.cos(an)*r0,iy+Math.sin(an)*r0,ix+Math.cos(an)*r1,iy+Math.sin(an)*r1,'#ffe27a',2);}
  }
  ctx.restore();
  // lampo all'impatto e bande nere
  if(!aim&&vt>=ct&&vt<ct+0.12){ctx.fillStyle='rgba(255,255,255,'+(0.3*(1-(vt-ct)/0.12)).toFixed(3)+')';ctx.fillRect(0,0,w,h);}
  const bar=ri(h*0.07*easeOut(clamp(c.t/0.35,0,1))*(c.phase==='res'?clamp(1-(c.rt-1.15)/0.25,0,1):1));
  px(0,0,w,bar,'#000');px(0,h-bar,w,bar,'#000');
  // titolo e nomi
  const ta=clamp(1-(c.t-0.9)/0.5,0,1)*easeOut(clamp(c.t/0.3,0,1));
  if(ta>0&&c.phase==='aim')outlined(jump?'Salto':'Tuffo',cx,h*0.27,Math.round(h*0.085),'#fff',1,ta);
  for(const pl of plates){
    const tw=ptw(pl.p.name,'p'),pw2=tw+22,ph=14,x0=ri(pl.x-pw2/2),y0=ri(h*0.085);
    pbox(x0,y0,pw2,ph,PAL.out,null);pbox(x0+1,y0+1,pw2-2,ph-2,'#232b4a',null);
    px(x0+4,y0+4,6,6,PAL.out);px(x0+5,y0+5,4,4,pl.col);
    ptext(pl.p.name,x0+13,y0+3,{f:'p',a:'l',c:'#fff',o:false});
  }
  if(!aim&&vt>=ct){
    const age=vt-ct;
    ctx.fillStyle='rgba(22,26,43,'+(0.55*Math.min(1,age*5)).toFixed(3)+')';ctx.fillRect(0,ri(h*0.17),w,ri(h*0.13));
    outlined(result,cx,h*0.235,Math.round(h*0.1),benefit?'#6dff9e':'#ff8a8a',1,1);
  }
  if(c.timing&&(aim||c.locked))drawMeter(c,w,h);
}
let benefitNow=false;
// polvere del tuffo: quadratini color sabbia che si allargano e svaniscono
function dust(c,vt,pts,u){
  const a=clamp(1-(vt-0.4)/0.9,0,1);if(a<=0.05)return;
  for(const p of pts)for(let k=0;k<9;k++){
    const s=Math.max(2,ri(u*0.055*(1+k%2)*(1+(vt-0.4)))),x=ri(p.x+(k-4)*0.22*u+(vt-0.4)*u*(0.5+k%3*0.4)),y=ri(p.y-0.1*u-(k%3)*0.14*u);
    if(a>0.4||k%2)px(x,y,s,s,a>0.6?'#e8dfb4':'#d4c89a');
  }
}
