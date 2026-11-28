/* ---- STADIO D'ORO: lo stadio di chi sostiene il gioco ----
   In carriera prende il posto del grande stadio (livello 6, vnLv 5) per chi ha il premio Sostenitore (careerVenue mette V.vip; si spegne da
   Riconoscimenti › Altro). Mentre si gioca e' calmo e fermo, per non dare fastidio: notte, tribune blu e viola con i seggiolini d'oro, tetto
   dorato, cartelloni neri e oro, prato smeraldo con le linee dorate. SOLO quando si segna (oroFesta) si accendono fuochi d'artificio, lampadine,
   cornice di luci, fari colorati, fontane di scintille e coriandoli. Tutto si ricava dal tempo di gioco: niente stato; con «riduci movimento»
   le luci stanno ferme. */
const ORO_NEON=['#ffd23f','#ff4fd8','#42e8ff','#6dff9e','#ff8a3d','#a78bff'];
const ORO_STEP=['#34256b','#2a1e58'];
const ORO_PAL={grass:'#12804c',grass2:'#0f6c41',dot:'#1d9a5e',apron:'#1d1446',apron2:'#150e34',line:'#ffd84a',dim:'#d9bd55',num:'#ffe680',turf:'#12804c'};
const oroFesta=()=>G.mode==='banner'&&!!G.banner&&G.banner.team!==undefined;   // una meta appena segnata
const oroT=()=>reduceMotion||!oroFesta()?0:G.tick;
const neon=i=>ORO_NEON[((i%ORO_NEON.length)+ORO_NEON.length)%ORO_NEON.length];
// la tavolozza del campo: con pioggia e neve resta la luce del tempo, ma bordo e linee restano quelli dello stadio
function oroPal(o,wx){
  for(const k in ORO_PAL){
    if(wx===2&&/grass|dot|turf|apron|line/.test(k))continue;
    o[k]=wx===1&&k!=='line'&&k!=='num'&&k!=='dim'?cMix(cShade(ORO_PAL[k],-0.12),'#24506a',0.1):ORO_PAL[k];
  }
  return o;
}
// un fuoco d'artificio: nasce in basso come scia, poi si apre in cerchio e cade
function oroBurst(x,y,t,c,r){
  if(t<0.18){px(x-1,y+ri((0.18-t)*r*5),2,5,'#fff6c4');return;}
  const u=(t-0.18)/0.82,d=r*Math.sqrt(u),fall=ri(u*u*r*0.45),a=u<0.55?c:(Math.floor(u*30)%2?c:'#ffffff');
  const sz=r>16?(u<0.7?3:2):(u<0.4?2:1);
  for(let i=0;i<18;i++){
    const an=i*Math.PI/9,vx=Math.cos(an),vy=Math.sin(an);
    px(x+ri(vx*d),y+ri(vy*d)+fall,sz,sz,a);
    px(x+ri(vx*d*0.78),y+ri(vy*d*0.78)+fall,Math.max(1,sz-1),Math.max(1,sz-1),c);
    if(i%2===0)px(x+ri(vx*d*0.5),y+ri(vy*d*0.5)+fall,Math.max(1,sz-1),Math.max(1,sz-1),u<0.7?'#ffffff':c);
  }
  if(u<0.14){pell(x,y,5,5,c);pell(x,y,3,3,'#ffffff');}
}
// cielo di notte tra top e bottom (pixel dello schermo): fasce e stelle; alle mete i fuochi
function oroSky(top,bottom,w){
  const h=bottom-top;if(h<=0)return;
  const BANDS=['#070920','#0d0e33','#171347','#24185a','#37206c'];
  for(let i=0;i<BANDS.length;i++){const a=top+ri(h*i/BANDS.length),b=top+ri(h*(i+1)/BANDS.length);px(0,a,w,b-a+1,BANDS[i]);}
  const t=oroT();
  for(let i=0;i<46;i++){const k=ihash(i,911),x=(k%(w+1)),y=top+((k>>>10)%Math.max(1,h));if(Math.sin(t*2+i)>-0.3)px(x,y,1,1,i%5?'#cfd6ff':'#ffe9a0');}
  if(oroFesta())for(let i=0;i<5;i++){
    const T=t*0.62+i*0.37,n=Math.floor(T),u=T-n,k=ihash(n*7+i,617);
    oroBurst(ri(w*(0.06+(i*0.2+((k%17)/100))%0.9)),top+ri(h*(0.2+((k>>>6)%45)/100)),u,neon(k>>>3),clamp(ri(h*0.34),9,34));
  }
}
// una fila di lampadine a passo fisso nel campo (shift = scorrimento della camera): spente, si rincorrono solo alle mete
function oroLamps(y,w,shift,step,sz,speed){
  const t=Math.floor(oroT()*(speed||7)),s=((shift%step)+step)%step,k0=Math.floor(shift/step);
  for(let i=-1,x=-s-step;x<w+step;i++,x+=step){
    const on=oroFesta()?(((k0+i+t)%3)+3)%3:2;
    px(ri(x),y,sz,sz,on===0?'#ffffff':(on===1?'#ffd23f':'#8a6a14'));
  }
}
// nastro LED: dorato e fermo; alle mete diventa arcobaleno e scorre
function oroRibbon(y,h,w,shift){
  if(!oroFesta()){px(0,y,w,h,'#8a6a14');px(0,y,w,1,'#c99a2a');return;}
  const t=Math.floor(oroT()*40),s=(((shift+t)%12)+12)%12,k0=Math.floor((shift+t)/12);
  for(let i=-1,x=-s-12;x<w+12;i++,x+=12){px(ri(x),y,12,h,neon(k0+i));px(ri(x),y,12,1,'rgba(255,255,255,.55)');}
}
// ---------- dietro i cartelloni: gli ornamenti della tribuna (al posto di quelli di standRoof) ----------
function oroRoof(roofT,roofB,front){
  if(roofB<BAR-2)return;
  const k0=Math.floor((toWorld(0,0).x-AISLE_OFF)/AISLE_STEP)-1,k1=Math.ceil((toWorld(VW,0).x-AISLE_OFF)/AISLE_STEP)+1,t=oroT();
  for(let k=k0;k<=k1;k++){
    const x=sxw(AISLE_OFF+k*AISLE_STEP);if(x<-8||x>VW+8)continue;
    const y0=Math.max(BAR,roofB);px(x-2,y0,4,front-y0,'#c99a2a');px(x-2,y0,1,front-y0,'#ffe27a');px(x+1,y0,1,front-y0,'#7d5c12');   // pilastri dorati
    if(oroFesta())for(let y=y0+3;y<front-2;y+=6)px(x-1,y,2,2,Math.floor(t*5+k+y/6)%3===0?'#ffffff':neon(k+Math.floor(y/6)));
  }
  px(0,roofT,VW,4,'#e5b53a');px(0,roofT,VW,1,'#fff1a8');
  px(0,roofT+4,VW,roofB-roofT-4,'#191233');px(0,roofB-1,VW,1,'#e5b53a');
  oroLamps(roofT+5,VW,CX,8,2,5);
  // pennoni con le stelle sopra il tetto
  for(let k=k0;k<=k1;k+=2){
    const x=sxw(AISLE_OFF+k*AISLE_STEP),y=roofT;if(x<-10||x>VW+10||y-14<BAR-6)continue;
    px(x,y-9,1,9,'#ffe27a');
    const on=oroFesta()&&Math.sin(t*3+k)>0;px(x-2,y-12,5,1,'#ffd23f');px(x,y-14,1,5,'#ffd23f');px(x-1,y-13,3,3,on?'#ffffff':'#ffe27a');
  }
}
// ---------- il nastro tra le prime file e i cartelloni, sempre in vista a campo intero ----------
function oroFront(y0){
  const top=y0-11;if(top<BAR)return;
  oroLamps(top-1,VW,CX,6,2,5);
  // striscioni di tifo dietro i cartelloni: alle mete si colorano e sventolano
  const step=17,k0=Math.floor(toWorld(0,0).x/step)-1,k1=Math.ceil(toWorld(VW,0).x/step)+1,t=oroT();
  for(let k=k0;k<=k1;k++){
    const x=sxw(k*step+4),w=oroFesta()&&Math.sin(t*5+k)>0?1:0,c=oroFesta()?neon(k):(k%2?'#c99a2a':'#4a2f95');if(x<-12||x>VW+12)continue;
    px(x,top-15,1,15,'#ffe27a');px(x+1,top-15+w,9,7,PAL.out);px(x+1,top-14+w,8,5,c);px(x+1,top-12+w,8,1,oroFesta()?'#ffffff':'#e5b53a');
  }
}
// ---------- cartelloni: la sequenza dello stadio ----------
const B_ORO={bg:'#17102f',ink:'#ffd23f',ac:'#fff1a8',ic:'trophy',t:["STADIO D'ORO",'ORO']};
const B_GRAZIE={bg:'#e5b53a',ink:'#17102f',ac:'#ffffff',ic:'heart',t:['GRAZIE!']};
const oroSeq=s=>[B_ORO,s[0],B_GRAZIE,s[1],B_ORO,s[3]||s[0],B_GRAZIE,s[5]||s[1]];
// la cornice attorno a un cartellone: un filo d'oro; alle mete arcobaleno
function oroFrame(a,b,y,k){
  if(!oroFesta()){px(a,y-1,b-a,1,'#c99a2a');px(a,y+BOARD_H,b-a,1,'#8a6a14');return;}
  const t=Math.floor(oroT()*10);
  for(let x=a;x<b;x+=4){const c=neon(Math.floor((x-a)/4)+t+k);px(x,y-1,Math.min(3,b-x),1,c);px(x,y+BOARD_H,Math.min(3,b-x),1,neon(Math.floor((x-a)/4)-t+k));}
}
// ---------- sul prato: solo alle mete luci, fari colorati, fuochi, scintille e coriandoli ----------
function oroBeam(x0,y0,x1,y1,half,c,al){
  ctx.save();ctx.globalAlpha=al;ctx.fillStyle=c;ctx.beginPath();
  ctx.moveTo(x0-2,y0);ctx.lineTo(x0+2,y0);ctx.lineTo(x1+half,y1);ctx.lineTo(x1-half,y1);ctx.closePath();ctx.fill();
  ctx.globalAlpha=al*1.5;ctx.beginPath();ctx.ellipse(x1,y1,half,half*0.4,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
// fontana di scintille da (x, y): h = altezza in pixel
function oroFountain(x,y,h,seed){
  if(x<-20||x>VW+20)return;
  const t=oroT();px(x-4,y-1,9,4,PAL.out);px(x-3,y-1,7,3,'#e5b53a');px(x-3,y-1,7,1,'#fff1a8');
  for(let i=0;i<30;i++){
    const u=(t*1.7+i/30+seed)%1,k=ihash(i,ri(seed*31)+7),sp=((k%21)-10)/10,up=1.5*u-u*u*1.15;
    const sx=x+ri(sp*h*0.3*u),sy=y-ri(up*h*1.8),sz=u<0.6?3:2;
    px(sx,sy,sz,sz,i%4===0?'#ffffff':(i%4===1?'#ff8a3d':'#ffd23f'));
    if(u<0.5)px(sx,sy+sz,1,3,'rgba(255,210,63,.65)');
  }
}
function oroField(x0,x1,y0,y1){
  const t=oroT(),H=y1-y0,g='#ffd84a';
  px(x0-2,y0,1,H,g);px(x1+1,y0,1,H,g);
  if(!oroFesta())return;   // mentre si gioca il campo resta pulito
  // la cornice di LED arcobaleno che gira attorno al campo, con le linee dorate
  const n=Math.floor(t*6),L=x0-6,R=x1+4,T=y0-2,Bt=y1+1;   // sopra e sotto e' sottile: non copre cartelloni e panchine
  for(let x=L,i=0;x<R;x+=6,i++){const w=Math.min(5,R-x);px(x,T,w,2,neon(i+n));px(x,Bt,w,2,neon(i-n));}
  for(let y=T,i=0;y<Bt;y+=6,i++){const h=Math.min(5,Bt-y);px(L,y,3,h,neon(i-n));px(R,y,3,h,neon(i+n));}
  // le mete: un riflesso d'oro che le attraversa e le stelle che si accendono
  for(const [a,b,dir] of [[x0,sxw(EZ),1],[sxw(FIELD_L-EZ),x1,-1]]){
    const W=b-a,u=((t*0.45)%1.6)*(dir>0?1:-1)+(dir>0?0:1);
    ctx.save();ctx.beginPath();ctx.rect(a,y0,W,H);ctx.clip();ctx.globalAlpha=0.28;ctx.fillStyle='#fff1a8';
    ctx.beginPath();const bx=a+u*(W+H*0.4);ctx.moveTo(bx,y0);ctx.lineTo(bx+7,y0);ctx.lineTo(bx+7-H*0.4,y1);ctx.lineTo(bx-H*0.4,y1);ctx.closePath();ctx.fill();ctx.restore();
    for(let i=0;i<14;i++){
      const k=ihash(i,53+(dir>0?0:7)),x=a+4+(k%Math.max(1,W-8)),y=y0+4+((k>>>9)%Math.max(1,H-8));
      const on=Math.sin(t*3+i*1.7)>0.2,c=on?'#fff1a8':'rgba(255,216,74,.7)';px(x-2,y,5,1,c);px(x,y-2,1,5,c);if(on){px(x-1,y-1,3,3,'#ffd23f');px(x,y,1,1,'#ffffff');}
    }
  }
  // l'anello di luci attorno allo stemma di centrocampo
  const cx=sxw(FIELD_L/2),cy=ri(y0+H/2),rad=ri(7.5*S);
  for(let i=0;i<36;i++){const an=i*Math.PI/18,c=(i+n)%4===0?'#ffffff':((i+n)%4===1?'#fff1a8':'#ffd23f');px(cx+ri(Math.cos(an)*rad)-1,cy+ri(Math.sin(an)*rad)-1,2,2,c);}
  // luci incassate nel bordo campo
  const step=ri(2.5*S)||10,m=Math.floor(t*4);
  for(let i=0,y=y0;y<=y1;i++,y+=step){const c=(i+m)%3===0?'#ffffff':neon(i+Math.floor(t*2));px(x0-12,y-1,3,4,c);px(x1+9,y-1,3,4,c);}
  // fari colorati che spazzano il campo
  for(let i=0;i<5;i++){
    const ox=ri(VW*(0.03+i*0.235)),tx=ri(VW*(0.5+0.46*Math.sin(t*(0.55+i*0.11)+i*1.9))),ty=ri(y0+H*(0.5+0.38*Math.cos(t*0.7+i*2.4)));
    oroBeam(ox,Math.max(BAR,y0-30),tx,ty,ri(4.2*S),neon(i),0.2);
  }
  // fontane di scintille sulle linee di meta e agli angoli
  const hi=ri(9*S);
  [x0-8,sxw(EZ),sxw(FIELD_L-EZ),x1+8].forEach((x,i)=>{oroFountain(x,y0-4,hi,i*0.23+0.05);oroFountain(x,y1+5,hi,i*0.19+0.4);});
  // i fuochi d'artificio scoppiano sopra il campo
  for(let i=0;i<7;i++){
    const T2=t*0.8+i*0.29,j=Math.floor(T2),u=T2-j,k=ihash(j*11+i,733);
    oroBurst(ri(VW*(0.08+((k%85)/100))),ri(y0+H*(0.12+((k>>>8)%70)/100)),u,neon(k>>>4),ri((9+(k>>>12)%5)*S));
  }
  oroConfetti(110,BAR,VW,VH);
}
// coriandoli d'oro e colorati che cadono piano
function oroConfetti(N,top,w,bottom){
  const t=oroT();
  for(let i=0;i<N;i++){
    const k=ihash(i,419),sp=10+(k%14),x=((((k>>>4)%(w+20))+Math.sin(t*2+i)*5-CX*0.2)%(w+20)+w+20)%(w+20)-10,y=top+((t*sp+(k>>>12))%Math.max(1,bottom-top));
    px(x,y,2,2+(k&1),i%3?'#ffd23f':neon(i));
  }
}
// ---------- primi piani di salti e tuffi: la stessa notte ----------
function oroCineSky(w,top){oroSky(-5,Math.max(30,top),w+5);}
function oroCineRoof(w,top,roofH,front,shift){
  px(-5,top,w+10,roofH,'#191233');px(-5,top,w+10,3,'#e5b53a');px(-5,top,w+10,1,'#fff1a8');px(-5,top+roofH-2,w+10,2,'#e5b53a');
  oroLamps(top+5,w,ri(shift*0.75),11,3,5);
  const y=Math.max(0,top-3);oroRibbon(top+roofH,4,w,ri(shift*1.1));
  px(-5,front-5,w+10,5,'#191233');px(-5,front-5,w+10,1,'#e5b53a');oroLamps(front-3,w,ri(shift),9,2,5);
  if(!oroFesta())return;   // salti e tuffi in partita: niente fari, fuochi né coriandoli
  const t=oroT();
  for(let i=0;i<5;i++){const ox=ri(w*(0.05+i*0.23));oroBeam(ox,y,ri(w*(0.5+0.42*Math.sin(t*(0.6+i*0.1)+i*2))),front,ri(w*0.06),neon(i),0.17);}
  // fuochi d'artificio davanti alle tribune
  const a=top+roofH+8,H=Math.max(1,front-a-12);
  for(let i=0;i<4;i++){const T=t*0.6+i*0.31,n=Math.floor(T),u=T-n,k=ihash(n*13+i,887);oroBurst(ri(w*(0.08+((k%84)/100))),a+ri(H*(0.1+((k>>>7)%55)/100)),u,neon(k>>>5),clamp(ri(H*0.32),10,30));}
  oroConfetti(46,Math.max(0,top),w,front);
}
