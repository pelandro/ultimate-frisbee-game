/* ---- stacchi laterali: salto e tuffo ---- */
let cine=null;
const crowd=[];for(let i=0;i<170;i++)crowd.push({x:Math.random(),y:Math.random(),c:['#ffd23f','#ffffff','#7fb0ff','#ff8a8a','#9ad8b0'][i%5],r:Math.random()});
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

const stand=[];
for(let i=0;i<900;i++)stand.push({x:Math.random(),y:Math.random(),c:['#ffd23f','#ffffff','#7fb0ff','#ff8a8a','#9ad8b0','#c7a6ff'][i%6],r:Math.random()});
function limb(pts,w,c){
  ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();
}
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
// pantaloncino: parte alta tonda (anca), orlo in basso dritto
function shortsLeg(p0,p1,w0,w1,c,o){
  const dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
  const poly=()=>{ctx.beginPath();ctx.moveTo(p0[0]+nx*w0/2,p0[1]+ny*w0/2);ctx.lineTo(p1[0]+nx*w1/2,p1[1]+ny*w1/2);ctx.lineTo(p1[0]-nx*w1/2,p1[1]-ny*w1/2);ctx.lineTo(p0[0]-nx*w0/2,p0[1]-ny*w0/2);ctx.closePath();};
  ctx.fillStyle='rgba(8,14,30,.6)';ctx.beginPath();ctx.arc(p0[0],p0[1],w0/2+o,0,6.283);ctx.fill();
  poly();ctx.lineJoin='round';ctx.strokeStyle='rgba(8,14,30,.6)';ctx.lineWidth=o*2;ctx.stroke();
  ctx.fillStyle=c;ctx.beginPath();ctx.arc(p0[0],p0[1],w0/2,0,6.283);ctx.fill();poly();ctx.fill();
}
function figure(hu,col,pose,tt,who){
  const lk=(who&&who.look)||DEF_LOOK,un=UNI[(who&&who.t)||0]||UNI[0],skin=lk.skin,bw=lk.bw,o=hu*0.026;
  const sc=a=>a.map(q=>[q[0]*hu,q[1]*hu]);
  let L,A,sh=[0,-0.52];
  if(pose==='up'){
    L=[[[-0.05,0],[-0.27,0.4],[-0.17,0.82]],[[0.07,0],[0.32,0.34],[0.14,0.6]]];
    A=[[[-0.1,-0.48],[-0.1,-0.95],[-0.06,-1.38]],[[0.1,-0.48],[0.12,-0.95],[0.14,-1.38]]];sh=[-0.04,-0.52];
  }else if(pose==='dive'){
    L=[[[-0.06,0],[-0.14,0.5],[-0.02,0.96]],[[0.06,0],[0.18,0.52],[0.3,0.94]]];
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
    const thigh=[fa(-0.05,0),fa(0,0.09*bw),fa(0.3,0.105*bw),fa(0.7,0.078),fa(1.02,0.058),fa(1.07,0),fa(1.02,-0.058),fa(0.7,-0.08),fa(0.3,-0.098*bw),fa(0,-0.09*bw)];   // coscia piena in alto, ginocchio stretto
    const shin=[fb(-0.05,0),fb(0,0.056),fb(0.22,0.092),fb(0.5,0.07),fb(0.78,0.048),fb(1.0,0.04),fb(1.05,0),fb(1.0,-0.04),fb(0.75,-0.042),fb(0.45,-0.05),fb(0.1,-0.06)];   // polpaccio solo dietro, caviglia sottile
    blob(thigh,skin,o,1);blob(shin,skin,o,1);blob(thigh,skin,o,2);blob(shin,skin,o,2);                       // prima i contorni, poi i riempimenti: nessuna linea nel ginocchio
    const sock=[fb(0.42,0.062),fb(0.75,0.056),fb(1.0,0.05),fb(1.06,0),fb(1.0,-0.05),fb(0.75,-0.05),fb(0.42,-0.052),fb(0.4,0)];
    blob(sock,un.socks,o*0.7);                                                                             // calza
    const s0=fb(0.42,-0.052),s1=fb(0.42,0.062);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=hu*0.016;ctx.beginPath();ctx.moveTo(s0[0],s0[1]);ctx.lineTo(s1[0],s1[1]);ctx.stroke();
    shortsLeg(hp,mix(hp,kn,0.5),hu*0.215*bw,hu*0.2*bw,un.shorts,o);                                         // pantaloncino (orlo dritto)
    ctx.fillStyle=un.shoe;ctx.beginPath();ctx.ellipse(ft[0]+hu*0.05,ft[1]+hu*0.012,hu*0.14,hu*0.062,0,0,6.283);ctx.fill();   // scarpa
    ctx.fillStyle='#eef2f8';ctx.beginPath();ctx.ellipse(ft[0]+hu*0.05,ft[1]+hu*0.044,hu*0.145,hu*0.02,0,0,6.283);ctx.fill();   // suola
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(ft[0]+hu*0.1,ft[1]-hu*0.01,hu*0.045,hu*0.025,0,0,6.283);ctx.fill();
  };
  const arm=a=>{
    const el=a[1],hd=a[2],s0=[shp[0]+(a[0][0]-shp[0])*0.3,a[0][1]];                                        // la spalla sta vicino al centro del busto, non sporge
    chain([s0,mix(s0,el,0.35),el,mix(el,hd,0.3),hd],[hu*0.098,hu*0.104,hu*0.082,hu*0.086,hu*0.062],skin,o);   // braccio con bicipite e avambraccio
    capO(s0,mix(s0,el,0.55),hu*0.125,hu*0.115,col,o*0.8);                                                 // manica corta
    ctx.fillStyle='rgba(8,14,30,.35)';ctx.beginPath();ctx.arc(hd[0],hd[1],hu*0.075,0,6.283);ctx.fill();ctx.fillStyle=skin;ctx.beginPath();ctx.arc(hd[0],hd[1],hu*0.06,0,6.283);ctx.fill();   // mano
  };
  const bk=lk.hair,hx=shp[0],hy=shp[1]-0.27*hu,sway=Math.sin(tt*5)*0.03*hu;
  // dietro: braccio e gamba lontani, capelli lunghi e coda
  arm(As[0]);leg(Ls[0]);
  if(lk.style===2){capO([hx-hu*0.06,hy-hu*0.02],[hx-hu*0.17+sway,hy+hu*0.42],hu*0.2,hu*0.14,bk,o*0.6);}
  if(lk.style===3){capO([hx-hu*0.15,hy-hu*0.07],[hx-hu*0.33+sway*1.6,hy+hu*0.2],hu*0.085,hu*0.06,bk,o*0.6);ctx.fillStyle=un.shirt;ctx.beginPath();ctx.arc(hx-hu*0.16,hy-hu*0.06,hu*0.03,0,6.283);ctx.fill();}
  // busto: sagoma di profilo (torace profondo ~0,27, vita ~0,22, spalla piccola) con sfumatura dalla schiena al petto
  const hipP=[0,hu*0.02],Lt=Math.hypot(shp[0]-hipP[0],shp[1]-hipP[1]),ux=(shp[0]-hipP[0])/Lt,uy=(shp[1]-hipP[1])/Lt,nx=-uy,ny=ux;
  const tp=(t,f)=>[hipP[0]+ux*Lt*t+nx*f*hu*bw,hipP[1]+uy*Lt*t+ny*f*hu*bw];   // t: 0 anca → 1 spalla; f>0 petto, f<0 schiena
  const g0=tp(0.55,-0.14),g1=tp(0.55,0.15),gr=ctx.createLinearGradient(g0[0],g0[1],g1[0],g1[1]);
  gr.addColorStop(0,shade(col,-0.3));gr.addColorStop(0.3,shade(col,-0.06));gr.addColorStop(0.7,col);gr.addColorStop(1,shade(col,0.2));
  blob([tp(0,-0.125),tp(0.34,-0.112),tp(0.72,-0.135),tp(0.97,-0.105),tp(1.06,0.0),tp(0.97,0.1),tp(0.72,0.145),tp(0.34,0.105),tp(0,0.115)],gr,o);
  ctx.fillStyle=un.shorts;ctx.beginPath();ctx.moveTo(-hu*0.12*bw,hu*0.02);ctx.lineTo(hu*0.115*bw,hu*0.02);ctx.lineTo(hu*0.135*bw,hu*0.17);ctx.lineTo(-hu*0.14*bw,hu*0.17);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=hu*0.016;ctx.beginPath();ctx.moveTo(-hu*0.12*bw,hu*0.03);ctx.lineTo(hu*0.115*bw,hu*0.03);ctx.stroke();
  capO(shp,[shp[0]+hu*0.02,shp[1]-hu*0.11],hu*0.095,hu*0.085,skin,o);                                      // collo
  // davanti: gamba e braccio vicini
  leg(Ls[1]);arm(As[1]);
  // testa
  ctx.fillStyle='rgba(8,14,30,.6)';ctx.beginPath();ctx.ellipse(hx,hy,hu*0.19,hu*0.21,0,0,6.283);ctx.fill();
  ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(hx,hy,hu*0.165*lk.hd,hu*0.185*lk.hd,0,0,6.283);ctx.fill();
  ctx.fillStyle=shade(skin,-0.12);ctx.beginPath();ctx.arc(hx-hu*0.02,hy+hu*0.02,hu*0.04,0,6.283);ctx.fill();                  // orecchio
  ctx.fillStyle=skin;ctx.beginPath();ctx.moveTo(hx+hu*0.15,hy-hu*0.01);ctx.lineTo(hx+hu*0.205,hy+hu*0.035);ctx.lineTo(hx+hu*0.14,hy+hu*0.045);ctx.closePath();ctx.fill();   // naso
  ctx.fillStyle='#1b2433';ctx.beginPath();ctx.ellipse(hx+hu*0.085,hy-hu*0.015,hu*0.02,hu*0.03,0,0,6.283);ctx.fill();         // occhio
  ctx.strokeStyle=lk.style===4?shade(skin,-0.35):bk;ctx.lineWidth=hu*0.018;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hx+hu*0.055,hy-hu*0.062);ctx.lineTo(hx+hu*0.125,hy-hu*0.052);ctx.stroke();   // sopracciglio
  ctx.strokeStyle='rgba(120,50,40,.8)';ctx.lineWidth=hu*0.014;ctx.beginPath();ctx.moveTo(hx+hu*0.065,hy+hu*0.085);ctx.lineTo(hx+hu*0.125,hy+hu*0.078);ctx.stroke();   // bocca
  // capelli sopra
  if(lk.style===4){ctx.fillStyle=shade(skin,-0.25);ctx.beginPath();ctx.ellipse(hx,hy-hu*0.01,hu*0.172,hu*0.19,0,Math.PI*1.1,Math.PI*1.95);ctx.lineTo(hx-hu*0.02,hy-hu*0.06);ctx.closePath();ctx.fill();}
  else{
    ctx.fillStyle=bk;ctx.beginPath();ctx.ellipse(hx,hy-hu*0.012,hu*0.178*lk.hd,hu*0.19*lk.hd,0,Math.PI*1.0,Math.PI*2.0);
    ctx.quadraticCurveTo(hx+hu*0.09,hy-hu*0.105,hx-hu*0.01,hy-hu*0.07);ctx.lineTo(hx-hu*0.15,hy+hu*0.0);ctx.closePath();ctx.fill();
    if(lk.style===1){ctx.beginPath();ctx.ellipse(hx-hu*0.1,hy+hu*0.06,hu*0.085,hu*0.15,0,0,6.283);ctx.fill();}
    if(lk.style===2){ctx.beginPath();ctx.ellipse(hx-hu*0.1,hy+hu*0.07,hu*0.09,hu*0.18,0,0,6.283);ctx.fill();}
    ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.ellipse(hx+hu*0.01,hy-hu*0.12,hu*0.07,hu*0.025,-0.2,0,6.283);ctx.fill();   // riflesso sui capelli
  }
}
function athlete(x,gy,hipH,col,face,pose,rot,tt,hu,alpha,ghost,who){
  ctx.save();ctx.globalAlpha=alpha===undefined?1:alpha;
  if(!ghost){
    const k=clamp(1-(hipH-0.9)*0.25,0.45,1);
    ctx.fillStyle='rgba(0,0,0,'+(0.3*k).toFixed(3)+')';ctx.beginPath();ctx.ellipse(x,gy+hu*0.04,hu*0.6*k,hu*0.13*k,0,0,6.283);ctx.fill();
  }
  ctx.translate(x,gy-hipH*hu);ctx.scale(face,1);ctx.rotate(rot);figure(hu,col,pose,tt,who);ctx.restore();
}
const handPos=(x,gy,hipH,face,rot,hu)=>({x:x+face*1.38*hu*Math.sin(rot),y:gy-hipH*hu-1.38*hu*Math.cos(rot)});
function discSprite(x,y,r,ang){discShape(x,y,r*1.15,ang*2,0);}
function outlined(txt,x,y,size,fill,sc,al){   // testo a pixel col contorno, centrato in (x, y)
  const f=size>=26?'B':(size>=12?'P':'p'),hh=f==='B'?32:(f==='P'?16:8);
  ctx.save();ctx.globalAlpha=al===undefined?1:al;ptext(txt,x,y-hh/2,{f,c:fill});ctx.restore();
}
const slowT=(rt,ct)=>{const a=ct-0.12,b=ct+0.15;return rt<a?rt:(rt<b?a+(rt-a)*0.5:rt-(b-a)*0.5);};
function drawMeter(c,w,h){
  const bx=w*0.27,bw=w*0.46,bh=Math.max(18,h*0.05),by=h*0.865;
  const al=c.phase==='res'?clamp(1-(c.rt-0.5)/0.3,0,1):1;
  if(al<=0)return;
  ctx.save();ctx.globalAlpha=al;
  ctx.fillStyle='rgba(6,14,10,.82)';rr(bx-12,by-bh/2-12,bw+24,bh+24,(bh+24)/2);ctx.fill();
  ctx.save();rr(bx,by-bh/2,bw,bh,bh/2);ctx.clip();
  ctx.fillStyle='#2b3a32';ctx.fillRect(bx,by-bh/2,bw,bh);
  const yh=c.hw+0.165;
  let g=ctx.createLinearGradient(bx+bw*(0.5-yh),0,bx+bw*(0.5+yh),0);
  g.addColorStop(0,'rgba(217,169,40,.2)');g.addColorStop(0.5,'#d9a928');g.addColorStop(1,'rgba(217,169,40,.2)');
  ctx.fillStyle=g;ctx.fillRect(bx+bw*(0.5-yh),by-bh/2,bw*yh*2,bh);
  const inG=Math.abs(c.pos-0.5)<=c.hw;
  ctx.fillStyle=inG&&!c.locked?'#8dffbd':'#35c870';ctx.fillRect(bx+bw*(0.5-c.hw),by-bh/2,bw*c.hw*2,bh);
  ctx.restore();
  const nx=bx+bw*c.pos;
  ctx.fillStyle=c.locked?'#ffd23f':'#fff';ctx.fillRect(nx-2.5,by-bh/2-6,5,bh+12);
  ctx.beginPath();ctx.moveTo(nx-8,by-bh/2-14);ctx.lineTo(nx+8,by-bh/2-14);ctx.lineTo(nx,by-bh/2-4);ctx.closePath();ctx.fill();
  ctx.restore();
  const fs=Math.round(Math.max(15,h*0.045));
  if(c.locked){
    const age=c.t-(c.lockT===undefined?c.t:c.lockT),pop=age<0.2?lerp(0.6,1.15,age/0.2):lerp(1.15,1,clamp((age-0.2)/0.15,0,1));
    const qc=c.bonus>=1?'#6dff9e':(c.bonus>=0.5?'#ffe27a':'#ff8a8a');
    outlined(c.quality,w/2,by-bh-fs*0.9,Math.round(fs*1.5),qc,pop,al);
  }else{
    ctx.save();ctx.globalAlpha=al;ctx.fillStyle='#fff';ctx.font=PFONT.p;ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText('Tocca nel verde',Math.round(w/2),Math.round(by-bh/2-12));ctx.restore();
  }
}
function drawCine(){
  const c=cine,sp=c.spec,w=VW,h=VH,u=h*0.115,gy=h*0.74,cx=w/2;
  const jump=sp.kind==='jump',ct=jump?0.36:0.45;
  const aim=c.phase==='aim',vt=aim?0:slowT(c.rt,ct);
  const D=jump?0:(aim?c.t:(c.resT0||0)+(vt<=0.5?vt-vt*vt:0.25));
  const zoom=1.5;   // zoom fisso, uguale a quello del gioco: tra vista dall'alto e stacco laterale non cambia l'ingrandimento
  let shx=0,shy=0;
  if(!aim&&vt>=ct&&vt<ct+0.3){const a=(1-(vt-ct)/0.3)*u*0.14;shx=(Math.random()-0.5)*a;shy=(Math.random()-0.5)*a;}
  const fy=gy-0.3*u;   // si ingrandisce attorno al prato: i piedi restano dove sono e la barra non copre i giocatori
  ctx.save();ctx.translate(cx+shx,fy+shy);ctx.scale(zoom,zoom);ctx.translate(-cx,-fy);
  const X0=-w*0.2,WW=w*1.4;
  // cielo e tribune
  let g=ctx.createLinearGradient(0,-h*0.2,0,gy);g.addColorStop(0,'#050a1e');g.addColorStop(0.55,'#14245a');g.addColorStop(1,'#2d4a94');
  ctx.fillStyle=g;ctx.fillRect(X0,-h*0.2,WW,gy+h*0.2);
  const st0=gy-5.2*u,st1=gy-0.9*u;
  g=ctx.createLinearGradient(0,st0,0,st1);g.addColorStop(0,'#0a1124');g.addColorStop(1,'#141c36');ctx.fillStyle=g;ctx.fillRect(X0,st0,WW,st1-st0);
  for(const d of stand){const sz=0.9+d.y*1.7;ctx.globalAlpha=0.4+d.r*0.5;ctx.fillStyle=d.c;ctx.fillRect(X0+((((d.x*WW-D*u*0.5)%WW)+WW)%WW),st0+d.y*(st1-st0-0.2*u),sz,sz);}
  ctx.globalAlpha=1;
  ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1;
  for(let k=1;k<6;k++){const y=st0+k*(st1-st0)/6;ctx.beginPath();ctx.moveTo(X0,y);ctx.lineTo(X0+WW,y);ctx.stroke();}
  if(!aim&&vt>=ct){
    const n=Math.floor(9*clamp(1-(vt-ct)/0.9,0,1));
    for(let i=0;i<n;i++){const d=stand[(Math.random()*stand.length)|0];ctx.fillStyle='rgba(255,255,255,'+(0.5+Math.random()*0.5)+')';ctx.beginPath();ctx.arc(X0+d.x*WW,st0+d.y*(st1-st0),u*(0.03+Math.random()*0.05),0,6.283);ctx.fill();}
  }
  // riflettori
  for(const lx of [w*0.08,w*0.92]){
    g=ctx.createLinearGradient(0,h*0.06,0,gy);g.addColorStop(0,'rgba(255,250,225,.14)');g.addColorStop(1,'rgba(255,250,225,0)');ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(lx,h*0.06);ctx.lineTo(cx-w*0.3,gy);ctx.lineTo(cx+w*0.3,gy);ctx.closePath();ctx.fill();
    g=ctx.createRadialGradient(lx,h*0.06,2,lx,h*0.06,u*4.5);g.addColorStop(0,'rgba(255,250,225,.8)');g.addColorStop(1,'rgba(255,250,225,0)');
    ctx.fillStyle=g;ctx.fillRect(lx-u*4.5,h*0.06-u*4.5,u*9,u*9);
  }
  // cartelloni
  const bY=gy-1.05*u,bH=0.75*u,pw=3.4*u,bc=['#1d49b8','#10151f','#c9302c','#e9eee9'];
  ctx.font=PFONT.t;ctx.textAlign='center';ctx.textBaseline='middle';
  for(let k=-6;X0+k*pw<X0+WW+pw*4;k++){
    const x=X0+k*pw-((D*u*1.6)%(pw*4)),i=((k%4)+4)%4;ctx.fillStyle=bc[i];ctx.fillRect(x,bY,pw-2,bH);
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(x,bY,pw-2,2);
    ctx.fillStyle=i===3?'#10151f':'#fff';ctx.globalAlpha=0.9;ctx.fillText(i%2?'Frisbee':'Ultimate',x+pw/2,bY+bH/2+1);ctx.globalAlpha=1;
  }
  // prato
  g=ctx.createLinearGradient(0,gy-0.3*u,0,h*1.1);g.addColorStop(0,'#3b9a46');g.addColorStop(1,'#195428');
  ctx.fillStyle=g;ctx.fillRect(X0,gy-0.3*u,WW,h*1.1-gy+0.3*u);
  ctx.fillStyle='rgba(255,255,255,.055)';
  const sf=(D*1.4)%2;
  for(let k=-14;k<=14;k+=2){const kk=k-sf;ctx.beginPath();ctx.moveTo(cx+kk*u*0.9,gy-0.3*u);ctx.lineTo(cx+(kk+1)*u*0.9,gy-0.3*u);ctx.lineTo(cx+(kk+1)*u*3.4,h*1.1);ctx.lineTo(cx+kk*u*3.4,h*1.1);ctx.closePath();ctx.fill();}
  ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X0,gy+u*1.25);ctx.lineTo(X0+WW,gy+u*1.25);ctx.stroke();

  let benefit=null,result='',plates=[],impact=null;
  if(jump){
    const A=sp.a,D=sp.d,ax=cx-0.42*u,dxp=cx+0.42*u,C={x:cx,y:gy-3.15*u},lean=0.3;
    const winA=c.out==='att',ju=aim?0:clamp(vt/0.72,0,1);
    const lifts=j=>{const pk=Math.pow(Math.sin(Math.PI*j),0.7);return {a:pk*(winA?0.93:0.66),d:pk*(winA?0.66:0.93)};};
    const bob=aim?Math.sin(c.t*7)*0.04:0,pose=aim?'ready':'up',rot=aim?0:lean;
    if(!aim){
      for(const gk of [3,2,1]){
        const j=clamp((vt-gk*0.045)/0.72,0,1);if(j<=0)continue;
        const l=lifts(j),al=0.08+(3-gk)*0.06;
        athlete(ax,gy,0.9+l.a,COL[A.t],1,pose,rot,c.t,u,al,true,A);athlete(dxp,gy,0.9+l.d,COL[D.t],-1,pose,rot,c.t,u,al,true,D);
      }
    }
    const l=aim?{a:bob,d:-bob}:lifts(ju),hipA=0.9+l.a,hipD=0.9+l.d;
    athlete(ax,gy,hipA,COL[A.t],1,pose,rot,c.t,u,undefined,false,A);athlete(dxp,gy,hipD,COL[D.t],-1,pose,rot,c.t,u,undefined,false,D);
    const P0={x:cx-w*0.38,y:gy-5.4*u},P1={x:cx-w*0.14,y:gy-6.4*u};
    let dp,pd=null;
    if(aim){pd=clamp(c.t/2.7,0,0.88);dp=bez(P0,P1,C,pd);}
    else if(vt<ct){pd=0.88+0.12*(vt/ct);dp=bez(P0,P1,C,pd);}
    else if(winA)dp=handPos(ax,gy,hipA,1,lean,u);
    else{const t2=vt-ct;dp={x:C.x+u*5.5*t2,y:Math.min(gy-0.2*u,C.y-u*3.2*t2+0.5*u*16*t2*t2)};}
    if(pd!==null){
      for(let i=1;i<=9;i++){const a=bez(P0,P1,C,Math.max(0,pd-0.028*(i-1))),b=bez(P0,P1,C,Math.max(0,pd-0.028*i));
        ctx.strokeStyle='rgba(255,255,255,'+(0.35*(1-i/10)).toFixed(3)+')';ctx.lineWidth=u*0.2*(1-i/10);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    discSprite(dp.x,dp.y,0.17*u,c.t*9);
    plates=[{x:cx-2.7*u,p:A,col:COL[A.t]},{x:cx+2.7*u,p:D,col:COL[D.t]}];
    impact=C;
    if(!aim){benefit=(winA?A.t:D.t)===0;result=winA?'Presa in salto!':'Bloccato in salto!';}
  }else if(sp.kind==='dive2'){
    // attaccante e difensore corrono affiancati dallo stesso lato e si tuffano insieme: chi prende il disco spunta piu' avanti, se nessuno lo prende il disco cade in avanti
    const Aa=sp.a,Dd=sp.d,out=c.out,win=out==='att'?Aa:(out==='def'?Dd:null),Tt={x:cx+0.9*u,y:gy-0.88*u};
    const P0={x:cx-w*0.42,y:gy-3.6*u},P1={x:cx-w*0.1,y:gy-3.4*u};
    const gyOf=who=>who===Aa?gy:gy+0.5*u,huOf=who=>who===Aa?u:u*1.06;   // il difensore corre nella corsia piu' vicina alla camera
    const dpose=(who,v)=>{
      const xs=cx-(who===Aa?2.5:2.8)*u,end=(win?(who===win?1.31:2.2):1.85)*u;   // chi prende arriva sul disco, l'altro resta piu' indietro
      let dx=xs,hip=0.9,rot=0,pose='run';
      if(v>0){
        const du=clamp(v/0.45,0,1),e=easeIO(du);
        dx=lerp(xs,Tt.x-end,e);hip=0.9-0.45*e+0.35*Math.sin(Math.PI*du);rot=1.25*e;pose='dive';
        if(v>0.45){const q=clamp((v-0.45)/0.6,0,1);dx+=q*(who===win?0.9:0.6)*u;hip=0.45-0.2*q;}
      }
      return {dx,hip,rot,pose};
    };
    const dps={a:dpose(Aa,aim?-1:vt),d:dpose(Dd,aim?-1:vt)};
    for(const who of [Aa,Dd]){
      const dz=who===Aa?dps.a:dps.d,hu=huOf(who),gyw=gyOf(who);
      if(!aim&&vt<0.75){
        for(const gk of [3,2,1]){const q=dpose(who,vt-gk*0.04);if(vt-gk*0.04<=0)continue;athlete(q.dx,gyw,q.hip,COL[who.t],1,q.pose,q.rot,c.t,hu,0.08+(3-gk)*0.06,true,who);}
        ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=2;ctx.beginPath();
        for(let k=0;k<5;k++){const yy=gyw-(0.2+k*0.2)*u,xx=dz.dx-u*(0.6+Math.random()*1.2);ctx.moveTo(xx,yy);ctx.lineTo(xx-u*(0.8+Math.random()*1.4),yy);}
        ctx.stroke();
      }
      athlete(dz.dx,gyw,dz.hip,COL[who.t],1,dz.pose,dz.rot,dz.pose==='run'?D*11+(who===Aa?0:1.3):c.t,hu,undefined,false,who);
    }
    let dp,pd=null;
    if(aim){pd=clamp(c.t/2.7,0,0.85);dp=bez(P0,P1,Tt,pd);}
    else if(vt<ct){pd=0.85+0.15*(vt/ct);dp=bez(P0,P1,Tt,pd);}
    else if(win){dp=handPos((win===Aa?dps.a:dps.d).dx,gyOf(win),(win===Aa?dps.a:dps.d).hip,1,(win===Aa?dps.a:dps.d).rot,huOf(win));}
    else{const t2=vt-ct;dp={x:Tt.x+u*3*t2,y:Math.min(gy-0.15*u,Tt.y+u*5*t2*t2)};}   // nessuno lo prende: cade in avanti
    if(pd!==null){
      for(let k=1;k<=9;k++){const a=bez(P0,P1,Tt,Math.max(0,pd-0.028*(k-1))),b=bez(P0,P1,Tt,Math.max(0,pd-0.028*k));
        ctx.strokeStyle='rgba(255,255,255,'+(0.35*(1-k/10)).toFixed(3)+')';ctx.lineWidth=u*0.2*(1-k/10);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    discSprite(dp.x,dp.y,0.17*u,c.t*9);
    if(!aim&&vt>0.4){
      const a=clamp(1-(vt-0.4)/0.9,0,1);ctx.fillStyle=`rgba(214,196,150,${0.5*a})`;
      for(const who of [Aa,Dd]){const dz=who===Aa?dps.a:dps.d;
        for(let k=0;k<9;k++){ctx.beginPath();ctx.arc(dz.dx+(k-4)*0.22*u+(vt-0.4)*u*(0.5+k%3*0.4),gyOf(who)-0.1*u-(k%3)*0.14*u,0.12*u*(1+k%2)*(1+(vt-0.4)),0,6.283);ctx.fill();}}
    }
    plates=[{x:cx-2.2*u,p:Aa,col:COL[Aa.t]},{x:cx+2.2*u,p:Dd,col:COL[Dd.t]}];
    impact=win?Tt:null;
    if(!aim){benefit=win?win.t===0:Dd.t===0;result=out==='att'?'Presa in tuffo!':(out==='def'?'Blocco in tuffo!':'Tuffi mancati');}
  }else{
    const dv=sp.diver,ok=c.out===true,xs=cx-2.6*u,Tt={x:cx+0.9*u,y:gy-0.88*u};
    const E=ok?Tt:{x:Tt.x+1.5*u,y:Tt.y+0.25*u},P0={x:cx-w*0.42,y:gy-3.6*u},P1={x:cx-w*0.1,y:gy-3.4*u};
    const dpose=v=>{
      let dx=xs,hip=0.9,rot=0,pose='run';
      if(v>0){
        const du=clamp(v/0.45,0,1),e=easeIO(du);
        dx=lerp(xs,Tt.x-1.31*u,e);hip=0.9-0.45*e+0.35*Math.sin(Math.PI*du);rot=1.25*e;pose='dive';
        if(v>0.45){const q=clamp((v-0.45)/0.6,0,1);dx+=q*0.9*u;hip=0.45-0.2*q;}
      }
      return {dx,hip,rot,pose};
    };
    const dpz=dpose(aim?-1:vt);
    if(!aim&&vt<0.75){
      for(const gk of [3,2,1]){const q=dpose(vt-gk*0.04);if(vt-gk*0.04<=0)continue;athlete(q.dx,gy,q.hip,COL[dv.t],1,q.pose,q.rot,c.t,u,0.08+(3-gk)*0.06,true,dv);}
      ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=2;ctx.beginPath();
      for(let i=0;i<7;i++){const yy=gy-(0.2+i*0.17)*u,xx=dpz.dx-u*(0.6+Math.random()*1.2);ctx.moveTo(xx,yy);ctx.lineTo(xx-u*(0.8+Math.random()*1.4),yy);}
      ctx.stroke();
    }
    athlete(dpz.dx,gy,dpz.hip,COL[dv.t],1,dpz.pose,dpz.rot,dpz.pose==='run'?D*11:c.t,u,undefined,false,dv);
    // l'altro giocatore corre accanto (corsia piu' vicina alla camera), poi rallenta
    const rs=aim?1:clamp(1-vt/0.7,0,1);
    athlete(xs-1.2*u+(aim?0:vt*u*2.2),gy+0.55*u,0.9,COL[1-dv.t],1,rs>0.15?'run':'ready',0,rs>0.15?D*11+1.3:c.t,u*1.07,0.95,false,{t:1-dv.t,look:makeLook('comp'+dv.t+dv.name)});
    let dp,pd=null;
    if(aim){pd=clamp(c.t/2.7,0,0.85);dp=bez(P0,P1,E,pd);}
    else if(vt<ct){pd=0.85+0.15*(vt/ct);dp=bez(P0,P1,E,pd);}
    else if(ok)dp=handPos(dpz.dx,gy,dpz.hip,1,dpz.rot,u);
    else{const t2=vt-ct;dp={x:E.x+u*3*t2,y:Math.min(gy-0.15*u,E.y+u*5*t2*t2)};}
    if(pd!==null){
      for(let i=1;i<=9;i++){const a=bez(P0,P1,E,Math.max(0,pd-0.028*(i-1))),b=bez(P0,P1,E,Math.max(0,pd-0.028*i));
        ctx.strokeStyle='rgba(255,255,255,'+(0.35*(1-i/10)).toFixed(3)+')';ctx.lineWidth=u*0.2*(1-i/10);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    discSprite(dp.x,dp.y,0.17*u,c.t*9);
    if(!aim&&vt>0.4){
      const a=clamp(1-(vt-0.4)/0.9,0,1);ctx.fillStyle=`rgba(214,196,150,${0.5*a})`;
      for(let i=0;i<12;i++){ctx.beginPath();ctx.arc(dpz.dx+(i-5)*0.22*u+(vt-0.4)*u*(0.5+i%3*0.4),gy-0.1*u-(i%3)*0.14*u,0.12*u*(1+i%2)*(1+(vt-0.4)),0,6.283);ctx.fill();}
    }
    plates=[{x:cx-1.6*u,p:dv,col:COL[dv.t]}];
    impact={x:Tt.x,y:Tt.y};
    if(!aim){benefit=(ok?dv.t:1-dv.t)===0;result=ok?(sp.att?'Presa in tuffo!':'Blocco in tuffo!'):'Tuffo mancato';}
  }
  // impatto: onda e scintille
  if(impact&&!aim&&vt>=ct&&vt-ct<0.4){
    const k=(vt-ct)/0.4;
    ctx.strokeStyle='rgba(255,255,255,'+(0.8*(1-k)).toFixed(3)+')';ctx.lineWidth=4*(1-k)+1;ctx.beginPath();ctx.arc(impact.x,impact.y,u*(0.3+k*1.6),0,6.283);ctx.stroke();
    ctx.strokeStyle='rgba(255,236,160,'+(1-k).toFixed(3)+')';ctx.lineWidth=2.5;ctx.beginPath();
    for(let i=0;i<12;i++){const an=i*0.5236+0.2,r0=u*(0.4+k*0.8),r1=u*(0.7+k*1.9);ctx.moveTo(impact.x+Math.cos(an)*r0,impact.y+Math.sin(an)*r0);ctx.lineTo(impact.x+Math.cos(an)*r1,impact.y+Math.sin(an)*r1);}
    ctx.stroke();
  }
  ctx.restore();
  // luce all'impatto, vignetta, bande cinematografiche
  if(!aim&&vt>=ct&&vt<ct+0.12){ctx.fillStyle='rgba(255,255,255,'+(0.22*(1-(vt-ct)/0.12)).toFixed(3)+')';ctx.fillRect(0,0,w,h);}
  g=ctx.createRadialGradient(cx,h/2,Math.min(w,h)*0.4,cx,h/2,Math.max(w,h)*0.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.5)');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  const bar=h*0.07*easeOut(clamp(c.t/0.35,0,1))*(c.phase==='res'?clamp(1-(c.rt-1.15)/0.25,0,1):1);
  ctx.fillStyle='#000';ctx.fillRect(0,0,w,bar);ctx.fillRect(0,h-bar,w,bar);
  // titolo e nomi
  const ta=clamp(1-(c.t-0.9)/0.5,0,1)*easeOut(clamp(c.t/0.3,0,1));
  if(ta>0&&c.phase==='aim')outlined(jump?'Salto':'Tuffo',cx,h*0.27,Math.round(h*0.085),'#fff',1,ta);
  ctx.font=PFONT.p;
  for(const pl of plates){
    const tw=ctx.measureText(pl.p.name).width,pw2=tw+u*1.2,ph=u*0.85,px=pl.x-pw2/2,py=h*0.085;
    ctx.fillStyle='rgba(6,14,10,.74)';rr(px,py,pw2,ph,ph/2);ctx.fill();
    ctx.fillStyle=pl.col;ctx.beginPath();ctx.arc(px+ph/2,py+ph/2,ph*0.22,0,6.283);ctx.fill();
    ctx.fillStyle='#fff';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(pl.p.name,px+ph*0.85,py+ph/2+1);
  }
  if(!aim&&vt>=ct){
    const age=vt-ct,sc=age<0.2?lerp(0.4,1.15,easeOut(age/0.2)):lerp(1.15,1,clamp((age-0.2)/0.15,0,1));
    ctx.fillStyle='rgba(0,0,0,'+(0.32*Math.min(1,age*5)).toFixed(3)+')';ctx.fillRect(0,h*0.17,w,h*0.13);
    outlined(result,cx,h*0.235,Math.round(h*0.1),benefit?'#6dff9e':'#ff8a8a',sc,1);
  }
  if(c.timing&&(aim||c.locked))drawMeter(c,w,h);
}

