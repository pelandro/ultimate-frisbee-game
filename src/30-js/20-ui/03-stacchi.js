/* ---- stacchi laterali: salto e tuffo ----
   Stesso stile del campo: tutto a pixel interi con contorno scuro. Le figure nascono come disegno vettoriale (figure) e vengono
   trasformate in pixel da athlete(): buffer piccolo, colori netti e ridotti, contorno di 1 pixel. Sfondo e interfaccia sono in drawCine. */
let cine=null;
const easeIO=t=>t*t*(3-2*t);
const bez=(p0,p1,p2,t)=>{const a=1-t;return {x:a*a*p0.x+2*a*t*p1.x+t*t*p2.x,y:a*a*p0.y+2*a*t*p1.y+t*t*p2.y};};
function startCine(spec){
  G.mode='cine';
  const timing=spec.kind==='jump'||spec.timing;
  // ampiezza della zona verde: dipende dal salto (duello in aria) o dal tuffo del tuo giocatore
  const sk=spec.kind==='jump'?'sal':'tuf',mp=spec.kind==='jump'?(spec.a.t===0?spec.a:spec.d):spec.diver;
  const hw=0.025+0.095*clamp((mp.s[sk]-40)/60,0,1);
  cine={spec,t:0,rt:0,phase:'aim',timing,locked:false,pos:0,bonus:0,quality:'',out:null,aimEnd:timing?2.4:1.0,hw,sp:2.3-1.0*clamp((mp.s[sk]-40)/60,0,1),statTxt:(sk==='sal'?'Salto ':'Tuffo ')+mp.s[sk]};
  HOOKS.vibe(25);
}
function cineTap(){
  const c=cine;if(!c||c.phase!=='aim'||!c.timing||c.locked||c.t<0.8)return;
  const q=Math.abs(c.pos-0.5);
  c.locked=true;c.lockT=c.t;c.bonus=q<=c.hw?1:clamp(1-(q-c.hw)/0.33,0,1);
  c.quality=c.bonus>=1?'Perfetto!':(c.bonus>=0.5?'Buono':(c.bonus>0?'Quasi':'Fuori tempo'));HOOKS.sfx('timing',c.bonus>=1?1:(c.bonus>=0.5?0.4:0));
  c.aimEnd=c.t+0.45;
}
function cineResolve(c){c.out=c.spec.fixed!==undefined?c.spec.fixed:c.spec.resolve(c.bonus);c.phase='res';c.rt=0;c.resT0=c.t;}
function updateCine(dt){
  const c=cine;if(!c)return;
  c.t+=dt;
  if(c.phase==='aim'){
    if(c.timing&&!c.locked){
      const ph=((c.t-0.8)*c.sp)%2;c.pos=ph<0?0:(ph<1?ph:2-ph);
      if(c.t>=c.aimEnd){c.locked=true;c.lockT=c.t;c.bonus=0;c.quality='Nessun tocco';c.aimEnd=c.t+0.1;}
    }
    if(c.t>=c.aimEnd)cineResolve(c);
  }else{c.rt+=dt;if(c.rt>=1.4)endCine();}
}
function endCine(){
  const c=cine;if(!c)return;
  cine=null;G.mode='play';HOOKS.vibe(20);
  c.spec.apply(c.out);
}
function skipCine(){const c=cine;if(!c)return;if(c.phase==='aim')cineResolve(c);endCine();}

// capsula rastremata (arto, busto) con contorno
function capsule(p0,p1,w0,w1,c){
  const dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
  ctx.fillStyle=c;ctx.beginPath();
  ctx.moveTo(p0[0]+nx*w0/2,p0[1]+ny*w0/2);ctx.lineTo(p1[0]+nx*w1/2,p1[1]+ny*w1/2);ctx.lineTo(p1[0]-nx*w1/2,p1[1]-ny*w1/2);ctx.lineTo(p0[0]-nx*w0/2,p0[1]-ny*w0/2);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(p0[0],p0[1],w0/2,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(p1[0],p1[1],w1/2,0,6.283);ctx.fill();
}
const capO=(p0,p1,w0,w1,c,o)=>{capsule(p0,p1,w0+o,w1+o,'rgba(8,14,30,.6)');capsule(p0,p1,w0,w1,c);};
// catena di segmenti rastremati: prima tutti i contorni, poi tutti i riempimenti (niente linee scure nelle giunture)
function chain(pts,ws,c,o){
  for(let i=0;i<pts.length-1;i++)capsule(pts[i],pts[i+1],ws[i]+o,ws[i+1]+o,'rgba(8,14,30,.6)');
  for(let i=0;i<pts.length-1;i++)capsule(pts[i],pts[i+1],ws[i],ws[i+1],c);
}
// sagoma chiusa e morbida che passa attraverso i punti, con contorno (mode 1: solo contorno, 2: solo riempimento)
function blob(pts,fill,o,mode){
  const n=pts.length,mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const path=()=>{const m0=mid(pts[n-1],pts[0]);ctx.beginPath();ctx.moveTo(m0[0],m0[1]);for(let i=0;i<n;i++){const m=mid(pts[i],pts[(i+1)%n]);ctx.quadraticCurveTo(pts[i][0],pts[i][1],m[0],m[1]);}ctx.closePath();};
  if(mode!==2){path();ctx.lineJoin='round';ctx.strokeStyle='rgba(8,14,30,.6)';ctx.lineWidth=o*2;ctx.stroke();}
  if(mode!==1){path();ctx.fillStyle=fill;ctx.fill();}
}
function figure(hu,col,pose,tt,who){
  const lk=(who&&who.look)||DEF_LOOK,un=UNI[(who&&who.t)||0]||UNI[0],skin=lk.skin,bw=lk.bw,o=hu*0.026;
  const sc=a=>a.map(q=>[q[0]*hu,q[1]*hu]);
  let L,A,sh=[0,-0.52];
  if(pose==='up'){
    L=[[[-0.05,0],[-0.13,0.42],[-0.42,0.66]],[[0.06,0],[-0.03,0.45],[-0.3,0.74]]];
    A=[[[-0.1,-0.48],[-0.1,-0.95],[-0.06,-1.38]],[[0.1,-0.48],[0.12,-0.95],[0.14,-1.38]]];sh=[-0.04,-0.52];
  }else if(pose==='dive'){
    L=[[[-0.03,0],[-0.06,0.5],[-0.03,0.96]],[[0.04,0],[0.1,0.52],[0.22,0.94]]];   // tuffo: gambe quasi sull'asse del corpo, cosi' i pantaloncini non sporgono oltre la maglia
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
    L=[[[-0.08,0],[-0.18,0.45+b],[-0.15,0.9]],[[0.08,0],[0.2,0.45+b],[0.13,0.9]]];
    A=[[[-0.12,-0.46],[-0.3,-0.3],[-0.2,-0.1]],[[0.12,-0.46],[0.32,-0.32],[0.36,-0.1]]];
  }
  const Ls=L.map(sc),As=A.map(sc),shp=[sh[0]*hu,sh[1]*hu];
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const leg=l=>{
    const [hp,kn,ft]=l;
    // sistema di riferimento di un segmento: t lungo l'osso, s>0 dietro, s<0 davanti
    const frame=(p0,p1)=>{const dx=p1[0]-p0[0],dy=p1[1]-p0[1],ln=Math.hypot(dx,dy)||1,ux=dx/ln,uy=dy/ln,nx=-uy,ny=ux;return (t,s)=>[p0[0]+ux*ln*t+nx*s*hu,p0[1]+uy*ln*t+ny*s*hu];};
    const fa=frame(hp,kn),fb=frame(kn,ft);
    const thigh=[fa(0.1,0),fa(0.12,0.075*bw),fa(0.3,0.088*bw),fa(0.7,0.066),fa(1.02,0.05),fa(1.07,0),fa(1.02,-0.05),fa(0.7,-0.066),fa(0.3,-0.082*bw),fa(0.12,-0.075*bw)];   // coscia piena in alto, ginocchio stretto
    const shin=[fb(-0.05,0),fb(0,0.056),fb(0.22,0.092),fb(0.5,0.07),fb(0.78,0.048),fb(1.0,0.04),fb(1.05,0),fb(1.0,-0.04),fb(0.75,-0.042),fb(0.45,-0.05),fb(0.1,-0.06)];   // polpaccio solo dietro, caviglia sottile
    blob(thigh,skin,o,1);blob(shin,skin,o,1);blob(thigh,skin,o,2);blob(shin,skin,o,2);                       // prima i contorni, poi i riempimenti: nessuna linea nel ginocchio
    const sock=[fb(0.42,0.062),fb(0.75,0.056),fb(1.0,0.05),fb(1.06,0),fb(1.0,-0.05),fb(0.75,-0.05),fb(0.42,-0.052),fb(0.4,0)];
    blob(sock,un.socks,o*0.7);                                                                             // calza
    const s0=fb(0.42,-0.052),s1=fb(0.42,0.062);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=hu*0.016;ctx.beginPath();ctx.moveTo(s0[0],s0[1]);ctx.lineTo(s1[0],s1[1]);ctx.stroke();
    ctx.fillStyle=un.shoe;ctx.beginPath();ctx.ellipse(ft[0]+hu*0.05,ft[1]+hu*0.012,hu*0.14,hu*0.062,0,0,6.283);ctx.fill();   // scarpa
    ctx.fillStyle='#eef2f8';ctx.beginPath();ctx.ellipse(ft[0]+hu*0.05,ft[1]+hu*0.044,hu*0.145,hu*0.02,0,0,6.283);ctx.fill();   // suola
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(ft[0]+hu*0.1,ft[1]-hu*0.01,hu*0.045,hu*0.025,0,0,6.283);ctx.fill();
  };
  // pantaloncino morbido: bacino + gamba svasata in un unico colore, senza contorni interni; l'orlo e' un filo piu' scuro.
  // La gamba lontana e' appena piu' scura: si capisce quale sta davanti senza linee nette
  const shortsFill=(l,k)=>{
    const [hp,kn]=l,p0=mix(hp,kn,0.04),p1=mix(hp,kn,0.72),w0=hu*0.19*bw,w1=hu*0.23*bw,c=k?shade(un.shorts,k):un.shorts;
    const dx=p1[0]-p0[0],dy=p1[1]-p0[1],ln=Math.hypot(dx,dy)||1,nx=-dy/ln,ny=dx/ln;
    ctx.fillStyle=c;ctx.beginPath();ctx.arc(p0[0],p0[1],w0/2,0,6.283);ctx.fill();
    ctx.beginPath();ctx.moveTo(p0[0]+nx*w0/2,p0[1]+ny*w0/2);ctx.lineTo(p1[0]+nx*w1/2,p1[1]+ny*w1/2);ctx.lineTo(p1[0]-nx*w1/2,p1[1]-ny*w1/2);ctx.lineTo(p0[0]-nx*w0/2,p0[1]-ny*w0/2);ctx.closePath();ctx.fill();
    ctx.strokeStyle=shade(un.shorts,-0.3);ctx.lineWidth=Math.max(hu*0.022,PIXK||0);ctx.lineCap='butt';ctx.beginPath();
    ctx.moveTo(p1[0]+nx*w1/2,p1[1]+ny*w1/2);ctx.lineTo(p1[0]-nx*w1/2,p1[1]-ny*w1/2);ctx.stroke();
  };
  const pelvis=k=>{ctx.fillStyle=k?shade(un.shorts,k):un.shorts;ctx.beginPath();ctx.ellipse(0,hu*0.07,hu*0.145*bw,hu*0.12,0,0,6.283);ctx.fill();};
  const arm=a=>{
    const el=a[1],hd=a[2],s0=[shp[0]+(a[0][0]-shp[0])*0.3,a[0][1]];                                        // la spalla sta vicino al centro del busto, non sporge
    chain([s0,mix(s0,el,0.35),el,mix(el,hd,0.3),hd],[hu*0.098,hu*0.104,hu*0.082,hu*0.086,hu*0.062],skin,o);   // braccio con bicipite e avambraccio
    capO(s0,mix(s0,el,0.55),hu*0.125,hu*0.115,col,o*0.8);                                                 // manica corta
    ctx.fillStyle='rgba(8,14,30,.35)';ctx.beginPath();ctx.arc(hd[0],hd[1],hu*0.075,0,6.283);ctx.fill();ctx.fillStyle=skin;ctx.beginPath();ctx.arc(hd[0],hd[1],hu*0.06,0,6.283);ctx.fill();   // mano
  };
  const bk=lk.hair,hx=shp[0],hy=shp[1]-0.27*hu,sway=Math.sin(tt*5)*0.03*hu;
  // dietro: braccio e gamba lontani, capelli lunghi e coda
  arm(As[0]);leg(Ls[0]);shortsFill(Ls[0],-0.13);leg(Ls[1]);pelvis(-0.02);shortsFill(Ls[1],0);   // la maglia viene dopo: il suo orlo sta sopra i pantaloncini, come nella realta'
  if(lk.style===2){capO([hx-hu*0.06,hy-hu*0.02],[hx-hu*0.17+sway,hy+hu*0.42],hu*0.2,hu*0.14,bk,o*0.6);}
  if(lk.style===3){capO([hx-hu*0.15,hy-hu*0.07],[hx-hu*0.33+sway*1.6,hy+hu*0.2],hu*0.085,hu*0.06,bk,o*0.6);ctx.fillStyle=un.shirt;ctx.beginPath();ctx.arc(hx-hu*0.16,hy-hu*0.06,hu*0.03,0,6.283);ctx.fill();}
  // busto: sagoma di profilo (torace profondo ~0,27, vita ~0,22, spalla piccola) con sfumatura dalla schiena al petto
  const hipP=[0,hu*0.02],Lt=Math.hypot(shp[0]-hipP[0],shp[1]-hipP[1]),ux=(shp[0]-hipP[0])/Lt,uy=(shp[1]-hipP[1])/Lt,nx=-uy,ny=ux;
  const tp=(t,f)=>[hipP[0]+ux*Lt*t+nx*f*hu*bw,hipP[1]+uy*Lt*t+ny*f*hu*bw];   // t: 0 anca → 1 spalla; f>0 petto, f<0 schiena
  const g0=tp(0.55,-0.14),g1=tp(0.55,0.15),gr=ctx.createLinearGradient(g0[0],g0[1],g1[0],g1[1]);
  gr.addColorStop(0,shade(col,-0.3));gr.addColorStop(0.3,shade(col,-0.06));gr.addColorStop(0.7,col);gr.addColorStop(1,shade(col,0.2));
  {   // ombra dell'orlo sui pantaloncini, poi la maglia: lunga, con l'orlo dritto e svasato sotto la vita
    ctx.fillStyle='rgba(10,14,30,.3)';ctx.beginPath();const s0=tp(-0.15,-0.135),s1=tp(-0.15,0.13),s2=tp(-0.26,0.12),s3=tp(-0.26,-0.125);
    ctx.moveTo(s0[0],s0[1]);ctx.lineTo(s1[0],s1[1]);ctx.lineTo(s2[0],s2[1]);ctx.lineTo(s3[0],s3[1]);ctx.closePath();ctx.fill();
    blob([tp(0,-0.125),tp(0.34,-0.112),tp(0.72,-0.135),tp(0.97,-0.105),tp(1.06,0.0),tp(0.97,0.1),tp(0.72,0.145),tp(0.34,0.105),tp(0,0.115)],gr,o);
    // parte bassa della maglia: orlo dritto e appena svasato, con contorno solo su tre lati (in alto si fonde col busto)
    const k0=tp(0.1,-0.13),k1=tp(-0.17,-0.15),k2=tp(-0.17,0.14),k3=tp(0.1,0.125);
    ctx.lineJoin='round';ctx.strokeStyle='rgba(8,14,30,.6)';ctx.lineWidth=o*2;ctx.beginPath();ctx.moveTo(k0[0],k0[1]);ctx.lineTo(k1[0],k1[1]);ctx.lineTo(k2[0],k2[1]);ctx.lineTo(k3[0],k3[1]);ctx.stroke();
    ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(k0[0],k0[1]);ctx.lineTo(k1[0],k1[1]);ctx.lineTo(k2[0],k2[1]);ctx.lineTo(k3[0],k3[1]);ctx.closePath();ctx.fill();
  }
  capO(shp,[shp[0]+hu*0.02,shp[1]-hu*0.11],hu*0.095,hu*0.085,skin,o);                                      // collo
  // davanti: gamba e braccio vicini
  arm(As[1]);
  // testa (a pixel un po' piu' grande: cosi' il viso ha spazio per occhio, sopracciglio e bocca)
  if(PIXK){ctx.save();ctx.translate(hx,hy);ctx.scale(1.28,1.28);ctx.translate(-hx,-hy);}
  ctx.fillStyle='rgba(8,14,30,.6)';ctx.beginPath();ctx.ellipse(hx,hy,hu*0.19,hu*0.21,0,0,6.283);ctx.fill();
  ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(hx,hy,hu*0.165*lk.hd,hu*0.185*lk.hd,0,0,6.283);ctx.fill();
  ctx.fillStyle=shade(skin,-0.1);ctx.beginPath();ctx.arc(hx-hu*0.125,hy+hu*0.03,hu*0.03,0,6.283);ctx.fill();                  // orecchio
  ctx.fillStyle=skin;ctx.beginPath();ctx.moveTo(hx+hu*0.15,hy-hu*0.01);ctx.lineTo(hx+hu*0.205,hy+hu*0.035);ctx.lineTo(hx+hu*0.14,hy+hu*0.045);ctx.closePath();ctx.fill();   // naso
  ctx.fillStyle='#1b2433';if(PIXK){ctx.fillRect(hx+hu*0.075,hy-hu*0.04,PIXK*1.5,PIXK*2.5);}else{ctx.beginPath();ctx.ellipse(hx+hu*0.085,hy-hu*0.015,hu*0.02,hu*0.03,0,0,6.283);ctx.fill();}         // occhio
  ctx.strokeStyle=lk.style===4?shade(skin,-0.35):bk;ctx.lineWidth=Math.max(hu*0.018,PIXK*1.1);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hx+hu*0.055,hy-hu*0.062);ctx.lineTo(hx+hu*0.125,hy-hu*0.052);ctx.stroke();   // sopracciglio
  ctx.strokeStyle='rgba(120,50,40,.95)';ctx.lineWidth=Math.max(hu*0.014,PIXK*1.0);ctx.beginPath();ctx.moveTo(hx+hu*0.065,hy+hu*0.085);ctx.lineTo(hx+hu*0.125,hy+hu*0.078);ctx.stroke();   // bocca
  // capelli sopra
  if(lk.style===4){ctx.fillStyle=shade(skin,-0.25);ctx.beginPath();ctx.ellipse(hx,hy-hu*0.01,hu*0.172,hu*0.19,0,Math.PI*1.1,Math.PI*1.95);ctx.lineTo(hx-hu*0.02,hy-hu*0.06);ctx.closePath();ctx.fill();}
  else{
    ctx.fillStyle=bk;ctx.beginPath();ctx.ellipse(hx,hy-hu*0.012,hu*0.178*lk.hd,hu*0.19*lk.hd,0,Math.PI*1.0,Math.PI*2.0);
    ctx.quadraticCurveTo(hx+hu*0.09,hy-hu*0.105,hx-hu*0.01,hy-hu*0.07);ctx.lineTo(hx-hu*0.15,hy+hu*0.0);ctx.closePath();ctx.fill();
    if(lk.style===1){ctx.beginPath();ctx.ellipse(hx-hu*0.1,hy+hu*0.06,hu*0.085,hu*0.15,0,0,6.283);ctx.fill();}
    if(lk.style===2){ctx.beginPath();ctx.ellipse(hx-hu*0.1,hy+hu*0.07,hu*0.09,hu*0.18,0,0,6.283);ctx.fill();}
    ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.ellipse(hx+hu*0.01,hy-hu*0.12,hu*0.07,hu*0.025,-0.2,0,6.283);ctx.fill();   // riflesso sui capelli
  }
  if(PIXK)ctx.restore();
}
/* ---- pixelizzazione: la figura vettoriale viene disegnata in un buffer piccolo (1 pixel = PIXK pixel del gioco), tagliata a colori netti,
   ridotta a pochi toni e circondata da un contorno scuro di 1 pixel, come gli omini del campo ma piu' grandi e piu' dettagliati ---- */
let PIXK=0;
const FIG={a:document.createElement('canvas'),b:document.createElement('canvas')};
const q6=v=>Math.min(255,Math.round(v/32)*32);
const OUTRGB=[22,26,43];
function athlete(x,gy,hipH,col,face,pose,rot,tt,hu,alpha,ghost,who){
  const K=PIXK||1,R=Math.ceil(1.75*hu/K),n=2*R;
  const hx=Math.round(x/K)*K,hy=Math.round((gy-hipH*hu)/K)*K;
  if(!ghost){   // ombra a pixel sul prato
    const k=clamp(1-(hipH-0.9)*0.25,0.45,1);
    pell(x,gy+hu*0.04,Math.round(hu*0.6*k),Math.max(2,Math.round(hu*0.1*k)),'rgba(40,70,30,.38)');
  }
  const A=FIG.a,B=FIG.b;if(A.width!==n){A.width=n;A.height=n;B.width=n;B.height=n;}
  const g=A.getContext('2d',{willReadFrequently:true}),old=ctx;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,n,n);
  ctx=g;ctx.save();ctx.scale(1/K,1/K);ctx.translate(R*K,R*K);ctx.scale(face,1);ctx.rotate(rot);
  figure(hu,col,pose,tt,who);
  ctx.restore();ctx=old;
  const im=g.getImageData(0,0,n,n),d=im.data,m=new Uint8Array(n*n);
  for(let i=0;i<n*n;i++)m[i]=d[i*4+3]>=150?1:0;
  const gc=ghost?[q6(parseInt(col.slice(1,3),16)*0.6+100),q6(parseInt(col.slice(3,5),16)*0.6+100),q6(parseInt(col.slice(5,7),16)*0.6+100)]:null;
  const gb=B.getContext('2d'),od=gb.createImageData(n,n),o=od.data;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
    const p=j*n+i;
    if(ghost){   // scia: silhouette a scacchiera nel colore della maglia, senza contorno
      if(m[p]&&((i+j)&1)===0){o[p*4]=gc[0];o[p*4+1]=gc[1];o[p*4+2]=gc[2];o[p*4+3]=255;}
    }
    else if(m[p]){o[p*4]=q6(d[p*4]);o[p*4+1]=q6(d[p*4+1]);o[p*4+2]=q6(d[p*4+2]);o[p*4+3]=255;}
    else if(!ghost&&((i>0&&m[p-1])||(i<n-1&&m[p+1])||(j>0&&m[p-n])||(j<n-1&&m[p+n]))){o[p*4]=OUTRGB[0];o[p*4+1]=OUTRGB[1];o[p*4+2]=OUTRGB[2];o[p*4+3]=255;}
  }
  gb.putImageData(od,0,0);
  old.save();old.globalAlpha=ghost?0.85:(alpha===undefined?1:alpha);old.imageSmoothingEnabled=false;
  old.drawImage(B,hx-R*K,hy-R*K,n*K,n*K);old.restore();
}
const handPos=(x,gy,hipH,face,rot,hu)=>({x:x+face*1.38*hu*Math.sin(rot),y:gy-hipH*hu-1.38*hu*Math.cos(rot)});
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
  const yh=c.hw+0.165,yx=ri(bx+bw*(0.5-yh)),yw=ri(bw*yh*2);
  px(yx,by-bh/2,yw,bh,'#ffd23f');
  const inG=Math.abs(c.pos-0.5)<=c.hw,gx=ri(bx+bw*(0.5-c.hw)),gw=ri(bw*c.hw*2);
  px(gx,by-bh/2,gw,bh,inG&&!c.locked?'#a8ffd0':'#4fe58f');
  px(bx,by-bh/2,bw,1,'rgba(255,255,255,.25)');
  const nx=ri(bx+bw*c.pos);
  px(nx-2,by-bh/2-5,5,bh+10,PAL.out);px(nx-1,by-bh/2-4,3,bh+8,c.locked?'#ffd23f':'#ffffff');
  ctx.restore();
  const fs=Math.round(Math.max(15,h*0.045));
  if(c.locked){
    const age=c.t-(c.lockT===undefined?c.t:c.lockT),pop=age<0.2?lerp(0.6,1.15,age/0.2):lerp(1.15,1,clamp((age-0.2)/0.15,0,1));
    const qc=c.bonus>=1?'#6dff9e':(c.bonus>=0.5?'#ffe27a':'#ff8a8a');
    outlined(c.quality,w/2,by-bh-fs*0.9,Math.round(fs*1.5),qc,pop,al);
  }else{
    ctx.save();ctx.globalAlpha=al;ptext('Tocca nel verde',w/2,by-bh/2-20,{f:'p',c:'#fff'});ctx.restore();
  }
}
// pubblico dello stacco: stessi spettatori a pixel del campo, in file sulle gradinate. Calcolato una volta sola
const SPEC=[];for(let r=0;r<8;r++)for(let i=0;i<84;i++){let hh=Math.imul(r*977+i*131+7,2654435761)>>>0;hh^=hh>>>15;hh=Math.imul(hh,2246822519)>>>0;hh^=hh>>>13;if(hh%11===0)continue;SPEC.push({r,x:(i+((hh>>4)%9)*0.1)/84,hh});}
const CINE_BOARDS=['#2352c4','#161a2b','#d03a36','#eef1ea'];
function drawCine(){
  const c=cine,sp=c.spec,w=VW,h=VH,Z=1.5,u0=h*0.115,gy0=h*0.74,fy0=gy0-0.3*u0,cx=ri(w/2);
  const u=u0*Z,gy=ri(fy0+(gy0-fy0)*Z),W=w*Z;   // lo zoom del vecchio stacco (1,5) e' gia' dentro le misure: si disegna tutto direttamente a pixel
  PIXK=1;   // un pixel dell'omino = un pixel del campo
  const jump=sp.kind==='jump',ct=jump?0.36:0.45;
  const aim=c.phase==='aim',vt=aim?0:slowT(c.rt,ct);
  const SD=jump?0:(aim?c.t:(c.resT0||0)+(vt<=0.5?vt-vt*vt:0.25));
  let shx=0,shy=0;
  if(!aim&&vt>=ct&&vt<ct+0.3){const a=(1-(vt-ct)/0.3)*u*0.1;shx=ri((Math.random()-0.5)*a);shy=ri((Math.random()-0.5)*a);}
  ctx.save();ctx.translate(shx,shy);
  const bH=ri(0.75*u),bY=gy-ri(0.3*u)-bH;   // cartelloni: il loro bordo basso e' l'inizio del prato
  const gt=bY+bH;
  // gradinate: gradoni piatti con lo stesso colore della tribuna del campo, spettatori a pixel
  const step=ri(bY/8),TIER=['#212948','#262e55','#2b3460','#313b69','#384472','#3f4c7b','#465483','#4d5d8b'];
  px(-4,-4,w+8,bY+4,TIER[7]);   // sotto le file: l'arrotondamento dell'altezza non lascia mai strisce scoperte
  for(let r=0;r<8;r++){
    const y0=r*step;px(-4,y0,w+8,step,TIER[r]);px(-4,y0+step-1,w+8,1,'#1b2140');
  }
  const hopOn=!aim&&vt>=ct;
  for(const s of SPEC){
    const yb=s.r*step+step-3,x=ri((((s.x*w-SD*u*0.35*(0.6+s.r*0.1))%w)+w)%w),hh=s.hh,dark=(8-s.r)*0.025;
    const hop=hopOn&&benefitNow&&(hh%3===0)?(Math.sin(vt*26+hh)>0?2:0):0,y=yb-hop;
    px(x-2,y-8,5,9,PAL.out);px(x-1,y-9,3,1,PAL.out);
    px(x-1,y-8,3,3,FAN_S[hh%4]);px(x-1,y-8,3,1,['#2b1b12','#7a4a21','#101010','#c9964a','#8a2f1c'][(hh>>5)%5]);
    px(x-1,y-5,3,4,FAN_C[(hh>>2)%8]);
    if(s.r<6){px(x-2,y-9,5,10,'rgba(22,26,60,'+(0.4-s.r*0.065)+')');}   // file lontane piu' scure
    if(hop){px(x-2,y-8,1,2,FAN_S[hh%4]);px(x+2,y-8,1,2,FAN_S[hh%4]);}
  }
  // cartelloni pubblicitari (bordo scuro, filo chiaro in alto)
  const pw=ri(3.4*u);ctx.font=PFONT.t;
  for(let k=-6;k*pw<w+pw*4;k++){
    const x=ri(k*pw-((SD*u*1.6)%(pw*4))),i=((k%4)+4)%4;
    px(x,bY,pw,bH,PAL.out);px(x+1,bY+1,pw-2,bH-2,CINE_BOARDS[i]);px(x+1,bY+1,pw-2,1,'rgba(255,255,255,.35)');
    ptext(i%2?'Frisbee':'Ultimate',x+pw/2,bY+ri(bH/2)-4,{f:'t',c:i===3?PAL.out:'#fff',o:false});
  }
  // prato: erba del campo, strisce di taglio che scorrono, puntini
  px(-4,gt,w+8,h-gt+4,PAL.grass);
  const sw=ri(2.6*u),off=ri((SD*u*1.4)%(sw*2));
  for(let x=-sw*2-off;x<w+sw;x+=sw*2)px(x,gt,sw,h-gt,PAL.grass2);
  px(-4,gt+ri(1.65*u),w+8,h,PAL.apron);px(-4,gt+ri(1.65*u),w+8,1,PAL.line);
  for(let i=0;i<70;i++){const hh=hashStr('d'+i),dx=((hh%997)/997*w+ri(SD*u*1.4))%w,dy=gt+3+((hh>>10)%97)/97*(h-gt-4);px(ri(dx),ri(dy),1,1,PAL.dot);}
  px(-4,gt,w+8,1,PAL.out);

  let benefit=null,result='',plates=[],impact=null;
  const trail=(P0,P1,E,pd)=>{
    for(let i=1;i<=9;i+=2){const a=bez(P0,P1,E,Math.max(0,pd-0.03*i));px(ri(a.x)-1,ri(a.y)-1,3-(i>5?1:0),3-(i>5?1:0),i<4?'#ffffff':'rgba(255,255,255,.6)');}
  };
  if(jump){
    const winA=c.out==='att';
    const A=sp.a,Dd=sp.d,ax=ri(cx-0.42*u),dxp=ri(cx+0.42*u),C={x:cx,y:gy-ri((winA?3.38:3.15)*u)},lean=0.3;
    const ju=aim?0:clamp(vt/0.72,0,1);
    const hi=winA?1.16:0.93,lo=winA?0.46:0.66;   // presa: chi prende sale molto piu' dell'altro; disco respinto: differenza piccola come prima
    const lifts=j=>{const pk=Math.pow(Math.sin(Math.PI*j),0.7);return {a:pk*(winA?hi:lo),d:pk*(winA?lo:hi)};};
    const bob=aim?Math.sin(c.t*7)*0.04:0,pose=aim?'ready':'up',rot=aim?0:lean;
    if(!aim){
      for(const gk of [3,2,1]){
        const j=clamp((vt-gk*0.045)/0.72,0,1);if(j<=0)continue;
        const l=lifts(j),al=0.1+(3-gk)*0.07;
        athlete(ax,gy,0.9+l.a,COL[A.t],1,pose,rot,c.t,u,al,true,A);athlete(dxp,gy,0.9+l.d,COL[Dd.t],-1,pose,rot,c.t,u,al,true,Dd);
      }
    }
    const l=aim?{a:bob,d:-bob}:lifts(ju),hipA=0.9+l.a,hipD=0.9+l.d;
    athlete(ax,gy,hipA,COL[A.t],1,pose,rot,c.t,u,undefined,false,A);athlete(dxp,gy,hipD,COL[Dd.t],-1,pose,rot,c.t,u,undefined,false,Dd);
    const P0={x:cx-W*0.38,y:gy-5.4*u},P1={x:cx-W*0.14,y:gy-6.4*u};
    let dp,pd=null;
    if(aim){pd=clamp(c.t/2.7,0,0.88);dp=bez(P0,P1,C,pd);}
    else if(vt<ct){pd=0.88+0.12*(vt/ct);dp=bez(P0,P1,C,pd);}
    else if(winA)dp=handPos(ax,gy,hipA,1,lean,u);
    else{const t2=vt-ct;dp={x:C.x+u*5.5*t2,y:Math.min(gy-0.2*u,C.y-u*3.2*t2+0.5*u*16*t2*t2)};}
    if(pd!==null)trail(P0,P1,C,pd);
    discSprite(dp.x,dp.y,0.17*u,c.t*9);
    plates=[{x:cx-2.7*u,p:A,col:COL[A.t]},{x:cx+2.7*u,p:Dd,col:COL[Dd.t]}];
    impact=C;
    if(!aim){benefit=(winA?A.t:Dd.t)===0;result=winA?'Presa in salto!':'Bloccato in salto!';}
  }else if(sp.kind==='dive2'){
    const Aa=sp.a,Dd=sp.d,out=c.out,win=out==='att'?Aa:(out==='def'?Dd:null),Tt={x:cx+0.9*u,y:gy-0.88*u};
    const P0={x:cx-W*0.42,y:gy-3.6*u},P1={x:cx-W*0.1,y:gy-3.4*u};
    const gyOf=who=>who===Aa?gy:gy+ri(0.5*u),huOf=who=>who===Aa?u:u*1.06;
    const dpose=(who,v)=>{
      const xs=cx-(who===Aa?2.5:2.8)*u,end=(win?(who===win?1.31:2.2):1.85)*u;
      let dx=xs,hip=0.9,rot=0,pose='run';
      if(v>0){
        const du=clamp(v/0.45,0,1),e=easeIO(du);
        dx=lerp(xs,Tt.x-end,e);hip=0.9-0.45*e+0.35*Math.sin(Math.PI*du);rot=1.25*e;pose='dive';
        if(v>0.45){const qq=clamp((v-0.45)/0.6,0,1);dx+=qq*(who===win?0.9:0.6)*u;hip=0.45-0.2*qq;}
      }
      return {dx,hip,rot,pose};
    };
    const dps={a:dpose(Aa,aim?-1:vt),d:dpose(Dd,aim?-1:vt)};
    for(const who of [Aa,Dd]){   // prima tutte le scie, poi i corpi: le scie di uno non coprono l'altro
      const dz=who===Aa?dps.a:dps.d,hu=huOf(who),gyw=gyOf(who);
      if(!aim&&vt<0.75){
        for(const gk of [3,2,1]){const qq=dpose(who,vt-gk*0.04);if(vt-gk*0.04<=0)continue;athlete(qq.dx,gyw,qq.hip,COL[who.t],1,qq.pose,qq.rot,c.t,hu,0.1+(3-gk)*0.07,true,who);}
        for(let k=0;k<5;k++){const yy=ri(gyw-(0.2+k*0.2)*u),xx=ri(dz.dx-u*(0.6+((k*37)%7)/7*1.2));px(xx-ri(u*(0.8+((k*53)%5)/5)),yy,ri(u*(0.8+((k*53)%5)/5)),1,'rgba(255,255,255,.55)');}
      }
    }
    for(const who of [Aa,Dd]){
      const dz=who===Aa?dps.a:dps.d,hu=huOf(who),gyw=gyOf(who);
      athlete(dz.dx,gyw,dz.hip,COL[who.t],1,dz.pose,dz.rot,dz.pose==='run'?SD*11+(who===Aa?0:1.3):c.t,hu,undefined,false,who);
    }
    let dp,pd=null;
    if(aim){pd=clamp(c.t/2.7,0,0.85);dp=bez(P0,P1,Tt,pd);}
    else if(vt<ct){pd=0.85+0.15*(vt/ct);dp=bez(P0,P1,Tt,pd);}
    else if(win){const z=win===Aa?dps.a:dps.d;dp=handPos(z.dx,gyOf(win),z.hip,1,z.rot,huOf(win));}
    else{const t2=vt-ct;dp={x:Tt.x+u*3*t2,y:Math.min(gy-0.15*u,Tt.y+u*5*t2*t2)};}
    if(pd!==null)trail(P0,P1,Tt,pd);
    discSprite(dp.x,dp.y,0.17*u,c.t*9);
    if(!aim&&vt>0.4)dust(c,vt,[Aa,Dd].map(who=>({x:(who===Aa?dps.a:dps.d).dx,y:gyOf(who)})),u);
    plates=[{x:cx-2.2*u,p:Aa,col:COL[Aa.t]},{x:cx+2.2*u,p:Dd,col:COL[Dd.t]}];
    impact=win?Tt:null;
    if(!aim){benefit=win?win.t===0:Dd.t===0;result=out==='att'?'Presa in tuffo!':(out==='def'?'Blocco in tuffo!':'Tuffi mancati');}
  }else{
    const dv=sp.diver,ok=c.out===true,xs=cx-2.6*u,Tt={x:cx+0.9*u,y:gy-0.88*u};
    const E=ok?Tt:{x:Tt.x+1.5*u,y:Tt.y+0.25*u},P0={x:cx-W*0.42,y:gy-3.6*u},P1={x:cx-W*0.1,y:gy-3.4*u};
    const dpose=v=>{
      let dx=xs,hip=0.9,rot=0,pose='run';
      if(v>0){
        const du=clamp(v/0.45,0,1),e=easeIO(du);
        dx=lerp(xs,Tt.x-1.31*u,e);hip=0.9-0.45*e+0.35*Math.sin(Math.PI*du);rot=1.25*e;pose='dive';
        if(v>0.45){const qq=clamp((v-0.45)/0.6,0,1);dx+=qq*0.9*u;hip=0.45-0.2*qq;}
      }
      return {dx,hip,rot,pose};
    };
    const dpz=dpose(aim?-1:vt);
    if(!aim&&vt<0.75){
      for(const gk of [3,2,1]){const qq=dpose(vt-gk*0.04);if(vt-gk*0.04<=0)continue;athlete(qq.dx,gy,qq.hip,COL[dv.t],1,qq.pose,qq.rot,c.t,u,0.1+(3-gk)*0.07,true,dv);}
      for(let i=0;i<7;i++){const yy=ri(gy-(0.2+i*0.17)*u),l=ri(u*(0.8+((i*53)%5)/5*1.2)),xx=ri(dpz.dx-u*(0.6+((i*37)%7)/7*1.2));px(xx-l,yy,l,1,'rgba(255,255,255,.55)');}
    }
    athlete(dpz.dx,gy,dpz.hip,COL[dv.t],1,dpz.pose,dpz.rot,dpz.pose==='run'?SD*11:c.t,u,undefined,false,dv);
    const rs=aim?1:clamp(1-vt/0.7,0,1);
    athlete(xs-1.2*u+(aim?0:vt*u*2.2),gy+ri(0.55*u),0.9,COL[1-dv.t],1,rs>0.15?'run':'ready',0,rs>0.15?SD*11+1.3:c.t,u*1.07,undefined,false,{t:1-dv.t,look:makeLook('comp'+dv.t+dv.name)});
    let dp,pd=null;
    if(aim){pd=clamp(c.t/2.7,0,0.85);dp=bez(P0,P1,E,pd);}
    else if(vt<ct){pd=0.85+0.15*(vt/ct);dp=bez(P0,P1,E,pd);}
    else if(ok)dp=handPos(dpz.dx,gy,dpz.hip,1,dpz.rot,u);
    else{const t2=vt-ct;dp={x:E.x+u*3*t2,y:Math.min(gy-0.15*u,E.y+u*5*t2*t2)};}
    if(pd!==null)trail(P0,P1,E,pd);
    discSprite(dp.x,dp.y,0.17*u,c.t*9);
    if(!aim&&vt>0.4)dust(c,vt,[{x:dpz.dx,y:gy}],u);
    plates=[{x:cx-1.6*u,p:dv,col:COL[dv.t]}];
    impact={x:Tt.x,y:Tt.y};
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
