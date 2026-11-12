/* ===================== GRAFICA PIXEL-ART (stile Retro Bowl) =====================
   Tutto il campo si disegna in un buffer a bassa risoluzione (circa 224 pixel di altezza) che poi viene ingrandito senza sfumature:
   ogni pixel del gioco e' un quadratino netto sullo schermo. Niente curve morbide: solo rettangoli a coordinate intere. */
const PAL={out:'#161a2b',grass:'#8ab66b',grass2:'#83af64',dot:'#a8cb8d',apron:'#6f9c58',apron2:'#648f4f',line:'#f6f8f2',dim:'#b7d6a0',num:'#a3c888',
  blueZ:'#86a9cf',redZ:'#d5a08f',gold:'#ffd23f',green:'#4fe58f',red:'#ff6b70',sky:'#7fd8ff'};
const ri=Math.round;
const px=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(ri(x),ri(y),w,h);};
function pline(x0,y0,x1,y1,c,t,dash){   // linea a pixel (Bresenham), spessore t, tratteggio facoltativo
  x0=ri(x0);y0=ri(y0);x1=ri(x1);y1=ri(y1);t=t||1;ctx.fillStyle=c;
  const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,o=t>>1;let e=dx-dy,n=0;
  while(n<3000){
    if(!dash||((n/dash|0)&1)===0)ctx.fillRect(x0-o,y0-o,t,t);
    if(x0===x1&&y0===y1)break;
    const e2=2*e;if(e2>-dy){e-=dy;x0+=sx;}if(e2<dx){e+=dx;y0+=sy;}n++;
  }
}
function pring(cx,cy,rx,ry,c,t,dash,a0,a1){   // contorno di un'ellisse a pixel (o un arco tra a0 e a1)
  cx=ri(cx);cy=ri(cy);t=t||1;ctx.fillStyle=c;
  const n=Math.max(16,Math.ceil((rx+ry)*3.4)),o=t>>1,s=a0===undefined?0:a0,e=a1===undefined?6.2832:a1;
  for(let i=0;i<=n;i++){
    if(dash&&((i/dash|0)&1))continue;
    const a=s+(e-s)*i/n;ctx.fillRect(cx+ri(Math.cos(a)*rx)-o,cy+ri(Math.sin(a)*ry)-o,t,t);
  }
}
function pell(cx,cy,rx,ry,c){   // ellisse piena a pixel
  cx=ri(cx);cy=ri(cy);rx=ri(rx);ry=ri(ry);ctx.fillStyle=c;
  for(let y=-ry;y<=ry;y++){const w=ri(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry+0.3))));ctx.fillRect(cx-w,cy+y,2*w+1,1);}
}
// testo a pixel: t = etichette piccole (Tiny5), p = testo (Press Start 2P 8 px), P = titoli (16 px), B = titoloni (32 px). Sempre a coordinate intere
const PFONT={t:'8px UFTiny,monospace',p:'8px UFPress,monospace',P:'16px UFPress,monospace',B:'32px UFPress,monospace'};
const OUT8=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
function ptext(txt,x,y,o){   // o: {f, c (colore), a ('l','c','r'), o (colore del contorno; false = senza), sh (ombra in pixel)}
  o=o||{};ctx.font=PFONT[o.f||'t'];ctx.textBaseline='top';ctx.textAlign='left';
  const w=Math.ceil(ctx.measureText(txt).width),al=o.a||'c';
  x=ri(al==='c'?x-w/2:(al==='r'?x-w:x));y=ri(y);
  if(o.sh){ctx.fillStyle=o.o||PAL.out;ctx.fillText(txt,x+o.sh,y+o.sh);}
  else if(o.o!==false){ctx.fillStyle=o.o||PAL.out;for(const d of OUT8)ctx.fillText(txt,x+d[0],y+d[1]);}
  ctx.fillStyle=o.c||'#fff';ctx.fillText(txt,x,y);
  return w;
}
const ptw=(txt,f)=>{ctx.font=PFONT[f||'t'];return Math.ceil(ctx.measureText(txt).width);};
function pbox(x,y,w,h,bg,bd){   // riquadro con gli angoli smussati di un pixel, come le etichette di Retro Bowl
  x=ri(x);y=ri(y);px(x+1,y,w-2,h,bg);px(x,y+1,w,h-2,bg);
  if(bd){px(x+1,y,w-2,1,bd);px(x+1,y+h-1,w-2,1,bd);px(x,y+1,1,h-2,bd);px(x+w-1,y+1,1,h-2,bd);}
}
function parrow(x,y,dir,c,s){   // punta di freccia piena: dir 0 destra, 1 giu', 2 sinistra, 3 su
  x=ri(x);y=ri(y);s=s||3;ctx.fillStyle=c;
  for(let i=0;i<s;i++){
    const l=2*(s-i)-1;
    if(dir===1)ctx.fillRect(x-(s-i-1),y+i,l,1);else if(dir===3)ctx.fillRect(x-(s-i-1),y-i,l,1);
    else if(dir===0)ctx.fillRect(x+i,y-(s-i-1),1,l);else ctx.fillRect(x-i,y-(s-i-1),1,l);
  }
}

function drawFx(){
  for(const p of parts){
    const k=p.life/p.max,x=sxw(p.x),y=syw(p.y);
    if(p.t==='dust'){const s=k>0.5?2:1;px(x,y-p.z*S*0.5,s,s,k>0.4?'#e8dcb8':'#c9d9ae');}
    else if(p.t==='spark'){px(x,y-p.z*S*0.5,k>0.5?2:1,k>0.5?2:1,k>0.5?'#fff3b0':'#ffd23f');}
    else{const r=4+(1-k)*14;pring(x,y,r,r*0.55,k>0.5?'#ffffff':'#d9ecc8',1,k>0.5?0:2);}
  }
}
function cone(x,y){px(x-2,y-1,5,2,PAL.out);px(x-1,y-4,3,4,PAL.out);px(x-1,y-1,3,1,'#ff7a1a');px(x,y-3,1,2,'#ff9a3a');px(x-1,y-2,3,1,'#ffffff');}
function grassPattern(){
  if(grassPat)return grassPat;
  const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');g.fillStyle=PAL.dot;
  for(const q of [[1,1],[9,1],[5,5],[13,5],[1,9],[9,9],[5,13],[13,13]])g.fillRect(q[0],q[1],1,1);
  grassPat=ctx.createPattern(c,'repeat');return grassPat;
}
// pubblico a bordo campo: omini di pochi pixel, colori fissi per posizione; saltano quando si segna
const FAN_C=['#2f7bff','#ff4b4b','#ffd23f','#f4f4f4','#3fd183','#b36bff','#ff9a3a','#273043'],FAN_S=['#f0c9a4','#d9a47a','#a56e45','#f6d7ba'];
function drawCrowd(yBase,up){
  const step=1.55,k0=Math.floor((toWorld(0,0).x-2)/step),k1=Math.ceil((toWorld(VW,0).x+2)/step),party=G.mode==='banner';
  for(let k=k0;k<=k1;k++){
    const h=hashStr('fan'+k+(up?'u':'d'));if(h%7===0)continue;
    const x=sxw(k*step+((h>>3)%5)*0.12),hop=party?(Math.sin(G.tick*11+h)>0.2?2:0):((Math.sin(G.tick*1.3+h)>0.96)?1:0),y=yBase-hop;
    px(x-2,y-8,5,9,PAL.out);px(x-1,y-9,3,1,PAL.out);
    px(x-1,y-8,3,3,FAN_S[h%4]);px(x-1,y-8,3,1,['#2b1b12','#7a4a21','#101010','#c9964a','#8a2f1c'][(h>>5)%5]);
    px(x-1,y-5,3,4,FAN_C[(h>>2)%8]);
    if(party&&hop){px(x-2,y-8,1,2,FAN_S[h%4]);px(x+2,y-8,1,2,FAN_S[h%4]);}
  }
}
/* ---- divise e campi: tu sei sempre in blu e l'avversaria in rosso, ma ogni squadra ha la sua variante (tonalita', pantaloncini, calzettoni);
   anche il campo cambia aspetto da una partita all'altra (erba piu' fresca o piu' secca, bordo in terra). Tutto deriva dai nomi: e' sempre uguale per la stessa sfida ---- */
const KITS=[[{shirt:'#2f7bff',shorts:'#f2f5fa',socks:'#2f7bff'},{shirt:'#1f5fd0',shorts:'#172554',socks:'#f2f5fa'},{shirt:'#3aa0ff',shorts:'#f2f5fa',socks:'#f2f5fa'},{shirt:'#2a4fb8',shorts:'#ffd23f',socks:'#2a4fb8'},{shirt:'#2f7bff',shorts:'#101827',socks:'#101827'}],
  [{shirt:'#ff4b4b',shorts:'#1f2740',socks:'#ff4b4b'},{shirt:'#d93636',shorts:'#f2f5fa',socks:'#d93636'},{shirt:'#ff6a3d',shorts:'#1f2740',socks:'#1f2740'},{shirt:'#c22d55',shorts:'#f2f5fa',socks:'#f2f5fa'},{shirt:'#ff4b4b',shorts:'#101010',socks:'#ffd23f'}]];
const VENUES=[{grass:'#8ab66b',grass2:'#83af64',dot:'#a8cb8d',apron:'#6f9c58',apron2:'#648f4f',dim:'#b7d6a0',num:'#a3c888'},
  {grass:'#7fae72',grass2:'#77a66a',dot:'#9cc590',apron:'#5f8f63',apron2:'#55835a',dim:'#a9cf9f',num:'#97c08b'},
  {grass:'#9bb866',grass2:'#93b05e',dot:'#b6cd88',apron:'#86995a',apron2:'#7a8d50',dim:'#c3d69c',num:'#b0c684'},
  {grass:'#7da26a',grass2:'#759a62',dot:'#98bb86',apron:'#8a6f52',apron2:'#7d6448',dim:'#a8c796',num:'#93b582'}];
let lookKey='';
function matchLook(){
  const on=!!G.inMatch,key=on?(G.myName||'')+'|'+(G.oppName||''):'';if(key===lookKey)return;lookKey=key;
  Object.assign(UNI[0],KITS[0][on&&G.myName?hashStr('kit|'+G.myName)%KITS[0].length:0]);
  Object.assign(UNI[1],KITS[1][on&&G.oppName?hashStr('kit|'+G.oppName)%KITS[1].length:0]);
  Object.assign(PAL,VENUES[on&&G.oppName?hashStr('campo|'+G.oppName+'|'+(G.myName||''))%VENUES.length:0]);grassPat=null;
}
// STEMMA a pixel (lo stesso scudetto a due colori del cruscotto, dal nome della squadra): a centrocampo e' quello della squadra di casa, in trasparenza
function crestPx(cx,cy,w,name,alpha){
  const h=hashStr('crest|'+name),h1=h%360,h2=(h1+130+(h>>8)%90)%360,hh=ri(w*1.15),ini=name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g,'').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  const c1=`hsla(${h1},68%,46%,${alpha})`,c2=`hsla(${h2},72%,56%,${alpha})`,ln=`rgba(246,248,242,${alpha})`,top=ri(cy-hh/2);
  for(let r=0;r<hh;r++){
    const t=r/hh,rw=ri(w*(t<0.6?1:Math.max(0.1,1-(t-0.6)/0.4*0.9))),x=ri(cx-rw/2),half=ri(rw/2);
    px(x,top+r,half,1,c1);px(x+half,top+r,rw-half,1,c2);
    if(r===0||r===hh-1||rw<3){px(x,top+r,rw,1,ln);}else{px(x,top+r,1,1,ln);px(x+rw-1,top+r,1,1,ln);}
  }
  ptext(ini,cx,top+ri(hh*0.3),{f:w>=40?'P':'p',c:`rgba(255,255,255,${Math.min(1,alpha*2.2)})`,o:false});
}
function drawField(){
  matchLook();
  const x0=sxw(0),x1=sxw(FIELD_L),y0=syw(0),y1=syw(FIELD_W),H=y1-y0,gl=sxw(EZ),gr=sxw(FIELD_L-EZ);
  px(0,0,VW,VH,PAL.apron);
  // bordo campo: fascia piu' scura e pubblico
  px(0,y0-26,VW,14,PAL.apron2);px(0,y1+13,VW,VH,PAL.apron2);
  // prato a fasce di 8 m, con i puntini
  for(let k=0;k<8;k++){const a=sxw(EZ+k*8),b=sxw(EZ+k*8+8);px(a,y0,b-a,H,k%2?PAL.grass2:PAL.grass);}
  const blueRight=G.dir[0]>0;
  px(x0,y0,gl-x0,H,blueRight?PAL.redZ:PAL.blueZ);px(gr,y0,x1-gr,H,blueRight?PAL.blueZ:PAL.redZ);
  const pat=grassPattern();
  if(pat){ctx.save();ctx.translate(-(((CX%16)+16)%16),((OYi%16)+16)%16-16);ctx.fillStyle=pat;ctx.fillRect(0,0,VW+32,VH+32);ctx.restore();}
  // stemma della squadra di casa a centrocampo (solo in partita, con i nomi delle squadre)
  if(G.inMatch&&G.myName&&!G.drill)crestPx(sxw(FIELD_L/2),syw(MID),ri(10*S),G.myName,0.3);
  // scritta nelle mete: il nome della squadra che segna in quella meta (Blu e Rossi quando i nomi non ci sono)
  const nmB=G.inMatch&&G.myName?G.myName:'BLU',nmR=G.inMatch&&G.oppName?G.oppName:'ROSSI';
  for(const z of [[EZ/2,blueRight?nmR:nmB,-1],[FIELD_L-EZ/2,blueRight?nmB:nmR,1]]){
    let nm=String(z[1]).replace(/ \([ABC]\)$/,'').toUpperCase();if(nm.length>18)nm=nm.slice(0,17)+'…';
    ctx.save();ctx.translate(sxw(z[0]),syw(MID));ctx.rotate(z[2]*Math.PI/2);
    const f=S>5.4&&ptw(nm,'P')<FIELD_W*S*0.9?'P':'p';
    ptext(nm,0,f==='P'?-8:-4,{f,c:'rgba(255,255,255,.55)',o:false});ctx.restore();
  }
  // linee ogni 8 m con la distanza dalla linea di meta piu' vicina (aiuta a misurare i lanci), tacche ogni 2 m
  const big=S>5.4;
  for(let k=1;k<8;k++){
    const x=sxw(EZ+k*8);px(x,y0,1,H,PAL.dim);
    const d=Math.min(k,8-k)*8,txt=String(d);
    ptext(txt,x+1,y1-(big?26:16),{f:big?'P':'p',c:PAL.num,o:false});
    ctx.save();ctx.translate(x,y0+(big?26:16));ctx.rotate(Math.PI);ptext(txt,0,0,{f:big?'P':'p',c:PAL.num,o:false});ctx.restore();
  }
  for(let m=EZ+2;m<FIELD_L-EZ;m+=2){
    const x=sxw(m);px(x,y0+2,1,2,PAL.dim);px(x,y1-4,1,2,PAL.dim);
    px(x,syw(FIELD_W/3)-1,1,2,PAL.dim);px(x,syw(FIELD_W*2/3)-1,1,2,PAL.dim);
  }
  // perimetro e linee di meta
  px(x0-1,y0-1,x1-x0+2,2,PAL.line);px(x0-1,y1-1,x1-x0+2,2,PAL.line);px(x0-1,y0,2,H,PAL.line);px(x1-1,y0,2,H,PAL.line);
  px(gl-1,y0,2,H,PAL.line);px(gr-1,y0,2,H,PAL.line);
  // brick
  for(const bx of [EZ+18,FIELD_L-EZ-18]){const x=sxw(bx),y=syw(MID);for(let i=-2;i<=2;i++){px(x+i,y+i,1,1,PAL.line);px(x+i,y-i,1,1,PAL.line);}}
  drawCrowd(y0-13,true);
  for(const c of [[0,0],[0,FIELD_W],[FIELD_L,0],[FIELD_L,FIELD_W],[EZ,0],[EZ,FIELD_W],[FIELD_L-EZ,0],[FIELD_L-EZ,FIELD_W]])cone(sxw(c[0]),syw(c[1]));
}
function discShape(x,y,r,spin,tilt){   // usato negli stacchi laterali
  ctx.save();ctx.translate(x,y);ctx.rotate(tilt);
  ctx.fillStyle=PAL.out;ctx.beginPath();ctx.ellipse(0,0,r+1,r*0.42+1,0,0,6.283);ctx.fill();
  ctx.fillStyle='#f4f7f2';ctx.beginPath();ctx.ellipse(0,0,r,r*0.42,0,0,6.283);ctx.fill();
  ctx.fillStyle='#b9c6d8';ctx.beginPath();ctx.ellipse(0,r*0.1,r*0.7,r*0.2,0,0,6.283);ctx.fill();
  ctx.restore();
}
function pdiscSprite(x,y,spin){   // disco a pixel: 9x4 con contorno, riflesso che gira
  x=ri(x);y=ri(y);
  px(x-4,y-1,9,3,PAL.out);px(x-3,y-2,7,5,PAL.out);
  px(x-3,y-1,7,3,'#f6f8f4');px(x-2,y-1,5,1,'#ffffff');px(x-3,y+1,7,1,'#b9c6d8');
  px(x-2+((spin|0)%4+4)%4,y,2,1,'#7f9bd0');
}
const PH=()=>20;   // altezza dello sprite in pixel: la pixel-art non si scala
// ---- omino a pixel: testa, busto, pantaloncini, arti spessi 2 pixel; contorno scuro attorno a tutta la sagoma ----
const lookOf=pl=>(pl&&pl.look)||DEF_LOOK;
function puppet(x,y,un,lk,f,pose,ph,run,arm){
  x=ri(x);y=ri(y);
  const ops=[],R=(a,b,w,h,c)=>ops.push(a,b,w,h,c);
  const Lm=(ax,ay,bx,by,c,c2,cut)=>{   // arto: quadratini 2x2 lungo la linea; da 'cut' in poi il secondo colore
    const n=Math.max(Math.abs(bx-ax),Math.abs(by-ay))||1;
    for(let i=0;i<=n;i++){const u=i/n;R(ri(ax+(bx-ax)*u),ri(ay+(by-ay)*u),2,2,(c2&&u>=cut)?c2:c);}
  };
  const skin=lk.skin,skin2=shade(skin,-0.16),hair=lk.hair,shirt=un.shirt,shirt2=shade(shirt,-0.22);
  const s=Math.sin(ph),moving=run>0.18,fast=run>0.45,bob=fast&&Math.abs(s)>0.55?1:0;
  const cheer=pose==='cheer',hop=cheer?(Math.sin(G.tick*12+x*0.7)>0?3:0):(pose==='jump'?ri(6*Math.sin(Math.PI*clamp(arm,0,1))):0);
  const gy=y-hop,by=gy-bob,sy=by-14,T=by-20+(pose==='sad'?1:0),lean=fast?f:0;
  // gambe: quella dietro si alza mentre corre
  const sw=moving?s*(fast?4:2.4):0;
  for(const i of [-1,1]){
    const a=sw*i,hx=x-1+(i>0?1:-1),fx=moving?hx+ri(a):hx+i,lift=fast?Math.max(0,ri(-a*f*0.55)):0,fy=gy-2-lift;
    Lm(hx,by-6,fx,fy,skin,un.socks,0.62);
    R(f>0?fx:fx-1,fy,3,2,un.shoe);
  }
  // braccio lontano (dietro al busto)
  const shx=x-1+lean;
  const hand=(i)=>{   // i = 1 braccio vicino, -1 braccio lontano
    if(pose==='throw')return i>0?[shx+f*(3+ri(3*arm)),sy+2-ri(arm)]:[shx-f*2,sy+5];
    if(pose==='hold')return i>0?[shx+f*4,sy+5]:[shx-f*1,sy+6];
    if(pose==='mark'){const w=Math.sin(G.tick*9+x)>0?1:0;return i>0?[shx+f*5,sy-2-w]:[shx+f*4,sy+6+w];}
    if(pose==='reach'||pose==='jump')return i>0?[shx+f*3,sy-6]:[shx+f*1,sy-5];
    if(pose==='one')return i>0?[shx+f*4,sy-7]:[shx-f*2,sy+5];
    if(cheer)return i>0?[shx+3,sy-6]:[shx-3,sy-6];
    if(pose==='sad')return i>0?[shx+f,sy+7]:[shx-f,sy+7];
    return moving?[shx+ri(-sw*i*0.9)+f*(fast?1:0),sy+5-(fast&&i*s*f<0?1:0)]:[shx+(i>0?f:-f),sy+6];
  };
  let h=hand(-1);Lm(shx,sy+1,h[0],h[1],shirt2,skin2,0.45);
  // pantaloncini e busto
  R(x-3,by-8,6,3,un.shorts);
  R(x-3+lean,sy,6,6,shirt);R(f>0?x-3+lean:x+2+lean,sy,1,6,shirt2);R(x-3+lean,sy+5,6,1,shirt2);
  // testa: capelli sopra e dietro, occhio davanti
  const hx0=x-3+lean+f,bk=f>0?hx0:hx0+4;
  R(hx0+1,T,4,1,skin);R(hx0,T+1,6,4,skin);R(hx0+1,T+5,4,1,skin);
  if(lk.style===4){R(hx0+1,T,4,1,skin2);R(bk,T+1,2,1,skin2);}
  else{
    R(hx0+1,T,4,1,hair);R(hx0,T+1,6,1,hair);R(bk,T+2,2,lk.style===0?1:(lk.style===1?3:(lk.style===2?6:2)),hair);
    if(lk.style===3)R(f>0?hx0-2:hx0+6,T+2+(fast&&s>0?1:0),2,3,hair);
  }
  if(lk.band)R(hx0,T+1,6,1,lk.band);                                   // fascia sulla fronte
  if(lk.beard){const bc=shade(hair,-0.15);R(hx0+1,T+5,4,1,bc);R(f>0?hx0+3:hx0,T+4,3,1,bc);}   // barba
  R(f>0?hx0+4:hx0+1,T+3,1,1,PAL.out);
  // braccio vicino (davanti al busto)
  h=hand(1);Lm(shx,sy+1,h[0],h[1],shirt,skin,0.45);
  ctx.fillStyle=PAL.out;for(let i=0;i<ops.length;i+=5)ctx.fillRect(ops[i]-1,ops[i+1]-1,ops[i+2]+2,ops[i+3]+2);
  for(let i=0;i<ops.length;i+=5){ctx.fillStyle=ops[i+4];ctx.fillRect(ops[i],ops[i+1],ops[i+2],ops[i+3]);}
}
// omino in tuffo: disteso in orizzontale, braccia tese in avanti
function puppetDive(x,y,un,lk,d,lift){
  x=ri(x);y=ri(y)-ri(lift);
  const ops=[],R=(a,w,b,h,c)=>ops.push(d>0?x+a:x-a-w,y+b,w,h,c);   // a = distanza in avanti lungo la direzione del tuffo
  const skin=lk.skin;
  R(-11,5,-4,2,skin);R(-13,3,-4,2,un.shoe);R(-10,4,-2,2,skin);R(-12,3,-2,2,un.shoe);   // gambe e scarpe
  R(-6,4,-6,4,un.shorts);R(-2,7,-6,4,un.shirt);R(-2,7,-3,1,shade(un.shirt,-0.22));   // pantaloncini e busto
  R(5,5,-7,5,skin);R(5,5,-8,2,lk.style===4?shade(skin,-0.16):lk.hair);R(9,1,-5,1,PAL.out);   // testa
  R(7,6,-3,2,skin);R(8,5,-5,2,skin);   // braccia tese
  ctx.fillStyle=PAL.out;for(let i=0;i<ops.length;i+=5)ctx.fillRect(ops[i]-1,ops[i+1]-1,ops[i+2]+2,ops[i+3]+2);
  for(let i=0;i<ops.length;i+=5){ctx.fillStyle=ops[i+4];ctx.fillRect(ops[i],ops[i+1],ops[i+2],ops[i+3]);}
}
// avanzamento del tuffo (0 = in piedi, 1 = disteso): si butta in 0,3 s, resta giu' fino alla fine dell'azione, poi si rialza
function diveProg(p){
  const dv=p.dv;if(!dv)return 0;
  const ease=u=>u*u*(3-2*u);
  if(dv.end!==null){const r=(G.tick-dv.end-0.45)/0.6;if(r>=1){p.dv=null;return 0;}return ease(clamp(1-Math.max(0,r),0,1));}
  return ease(clamp((G.tick-dv.t0)/0.3,0,1));
}
function diveAir(p){
  const dv=p.dv;if(!dv)return 0;
  const u=clamp((G.tick-dv.t0)/0.55,0,1);
  if(u>=1&&!dv.landedFx){dv.landedFx=true;for(let k=0;k<7;k++)addFx({t:'dust',x:p.x,y:p.y,vx:(Math.random()-0.5)*3+dv.dir*2,vy:(Math.random()-0.5)*1.6,z:0.1,vz:0.5,life:0.7,max:0.7,r:0.2});}
  return Math.sin(Math.PI*u);
}
function poseOf(p){
  if(G.mode==='banner'&&G.banner)return p.t===G.banner.team?'cheer':'sad';
  if(p.cfx&&G.tick<p.cfx.until)return p.cfx.k==='salto'?'jump':(p.cfx.k==='mano'?'one':'reach');
  if((p.armT||0)>0)return 'throw';
  if(p===G.holder||p===G.puller)return 'hold';
  if(p===G.marker&&G.holder&&hyp(p.x-G.holder.x,p.y-G.holder.y)<4)return 'mark';
  const f=G.flight||(G.pull&&!G.pull.landed?G.pull:null);
  if(f&&p.fl&&f.T-f.t<0.4&&hyp(p.x-p.fl.x,p.y-p.fl.y)<3.2)return 'reach';
  return 'run';
}
// linee dei tagli (come le tracce di Retro Bowl): quando hai il disco vedi dove sta correndo ogni compagno. Verde = taglio, azzurro = chiamato da te
function drawRoutes(){
  const h=G.holder;if(!G.routes||G.mode!=='play'||!h||h.t!==0||G.flight||G.pull||G.walk)return;
  for(const p of T[0]){
    if(p===h||!p.rt)continue;
    const called=!!(G.call&&G.call.q===p),x0=sxw(p.x),y0=syw(p.y)-2,x1=sxw(p.rt.x),y1=syw(p.rt.y)-2,d=hyp(x1-x0,y1-y0);
    if(d<9)continue;
    const c=called?PAL.sky:'#3ddc5a',ux=(x1-x0)/d,uy=(y1-y0)/d;
    pline(x0+ux*6,y0+uy*6,x1,y1,PAL.out,4);pline(x0+ux*6,y0+uy*6,x1,y1,c,2);
    const ax=Math.abs(ux)>Math.abs(uy);
    parrow(x1+(ax?(ux>0?1:-1):0),y1+(ax?0:(uy>0?1:-1)),ax?(ux>0?0:2):(uy>0?1:3),PAL.out,5);
    parrow(x1+(ax?(ux>0?1:-1):0),y1+(ax?0:(uy>0?1:-1)),ax?(ux>0?0:2):(uy>0?1:3),c,4);
  }
}
function drawPlayers(dt){
  const all=T[0].concat(T[1]).sort((a,b)=>a.y-b.y),h=PH();
  if(G.flight&&G.flight!==lastFl){lastFl=G.flight;G.flight.thrower.armT=0.3;}
  if(G.pull&&G.pull!==lastPull){lastPull=G.pull;if(G.pull.thrower)G.pull.thrower.armT=0.4;}
  const names=[];
  for(const p of all){
    const x=sxw(p.x),y=syw(p.y);if(x<-30||x>VW+30)continue;
    const sp=hyp(p.vx,p.vy);p.ph=(p.ph||0)+sp*dt*1.9;if(Math.abs(p.vx)>0.6)p.fc=p.vx>0?1:-1;
    p.armT=Math.max(0,(p.armT||0)-dt);
    if(G.mode==='play'&&sp>6.2&&Math.random()<dt*7)addFx({t:'dust',x:p.x-(p.fc||1)*0.4,y:p.y,vx:0,vy:0,z:0.1,vz:0.5,life:0.4,max:0.4,r:0.16});
    // frenata secca prima di un cambio di direzione: polvere davanti ai piedi; ripartenza: sbuffo dietro
    if(G.mode==='play'){
      if(p._brk&&sp>3&&Math.random()<dt*26)addFx({t:'dust',x:p.x+p.vx/sp*0.55,y:p.y+p.vy/sp*0.3,vx:p.vx*0.25,vy:p.vy*0.25,z:0.08,vz:0.35,life:0.28,max:0.28,r:0.15});
      if((p.wasBrk&&!p._brk)||((p.pv||0)<1&&sp>=1&&sp<4)){const dd=sp>0.2?1/sp:0;for(let k=0;k<2;k++)addFx({t:'dust',x:p.x-p.vx*dd*0.5,y:p.y-p.vy*dd*0.3+(k?0.2:-0.2),vx:-p.vx*dd*1.3,vy:-p.vy*dd*1.3,z:0.1,vz:0.7,life:0.34,max:0.34,r:0.18});}
    }
    p.wasBrk=!!p._brk;p.pv=sp;
    let face=p.fc||dirOf(p.t);
    const pose=poseOf(p);
    if(pose==='mark'||pose==='hold'){   // il marcatore guarda il portatore; il portatore guarda dove mira (o la meta che attacca)
      if(pose==='mark')face=G.holder.x>=p.x?1:-1;
      else if(drag&&drag.dirOk&&p===G.holder)face=Math.cos(drag.ang)>=0?1:-1;
      else if(sp<0.6)face=dirOf(p.t);
      p.fc=face;
    }
    const dvp=diveProg(p),air=p.dv?diveAir(p):0;
    pell(x+(p.dv?p.dv.dir*5*dvp:0)+1,y,5+ri(5*dvp),1,'rgba(10,30,10,.28)');   // ombra
    if(p.hot||p.cold){const c=p.hot?(Math.sin(G.tick*14+p.i)>0?'#ff5a3c':'#ffb03a'):'#7fd8ff';pring(x,y-9,10,12,c,1,2);}
    if(p===G.holder||p===G.puller){const pu=Math.sin(G.tick*6)>0?1:0;pring(x,y,9+pu,3,PAL.out,3);pring(x,y,9+pu,3,PAL.gold,1);}
    else if(p===G.marker&&G.holder)pring(x,y,9,3,G.dmode[p.t]===1?'#ff8a5c':'#ffffff',1,2);   // arancione: marca in anticipo (piu' pressione sul lancio)
    if(p===G.ctrl&&inDefense()){const pu=Math.sin(G.tick*8)>0?1:0;pring(x,y,10+pu,4,PAL.out,3);pring(x,y,10+pu,4,PAL.sky,1);parrow(x,y-h-16-pu,1,PAL.out,5);parrow(x,y-h-15-pu,1,PAL.sky,4);}   // il difensore che stai guidando
    if(dvp>0.45)puppetDive(x+p.dv.dir*6*dvp,y,UNI[p.t],lookOf(p),p.dv.dir,2+7*air);
    else puppet(x,y,UNI[p.t],lookOf(p),dvp>0?p.dv.dir:face,dvp>0?'reach':pose,p.ph,Math.min(1,sp/6),pose==='jump'?1-(p.cfx.until-G.tick)/0.42:clamp((p.armT||0)/0.3,0,1));
    // energia: barretta sotto i tuoi quando calano; goccia di sudore sugli avversari sfiniti (li' c'e' un duello da cercare)
    if(G.mode==='play'&&G.inMatch&&!p.dv){
      if(p.t===0&&p.st<62){px(x-5,y+3,11,3,PAL.out);px(x-4,y+4,Math.max(1,Math.round(9*p.st/100)),1,p.st<30?PAL.red:(p.st<46?'#ff9a3a':PAL.gold));}
      else if(p.t===1&&p.st<38&&Math.sin(G.tick*5+p.i)>0){px(x+4,y-h+1,1,1,PAL.sky);px(x+4,y-h+2,2,2,PAL.sky);}
    }
    // frenata netta o cambio di direzione (p._brk, dal motore): due sbuffi di polvere ai piedi, una volta per frenata
    if(p._brk&&!p._bd&&G.mode==='play'){p._bd=1;for(let k=0;k<2;k++)addFx({t:'dust',x:p.x,y:p.y,vx:-p.vx*0.12+rnd(-0.6,0.6),vy:-p.vy*0.08+rnd(-0.3,0.3),z:0.2,vz:rnd(0.3,0.9),life:0.45,max:0.45,r:rnd(0.2,0.4)});}
    else if(!p._brk)p._bd=0;
    if(p===G.holder||p===G.puller||(p.t===0&&S>5))names.push(p);   // nella vista larga (pull) solo chi ha il disco: i nomi si sovrapporrebbero
  }
  // i giocatori simbolo (stelle internazionali e chi ha vinto premi) hanno il nome dorato
  for(const p of names)ptext(p.name,sxw(p.x),syw(p.y)-h-10-(p.dv?4:0),{f:'t',c:(p.star||(p.aw&&p.aw.length)||(p.ro&&p.ro.star))?PAL.gold:(p.t===0?'#ffffff':'#ffd9d9')});
  // ETICHETTA DELLA SITUAZIONE sopra chi ha il disco, in un riquadro nero come il «2nd & 10» di Retro Bowl: stall da 6, ultimo lancio, match point, universe point
  const hh=G.holder;
  if(hh&&!G.flight&&G.mode==='play'){
    const n=G.marker&&hyp(G.marker.x-hh.x,G.marker.y-hh.y)<3.8?Math.min(10,Math.floor(G.stallT)+1):0,lb=situationLabel(hh,n);
    if(lb&&(!lb.hot||Math.sin(G.tick*18)>-0.4)){const tw=ptw(lb.txt,'p')+8,bx=clamp(sxw(hh.x)-ri(tw/2),2,VW-tw-2),by=syw(hh.y)-h-34;pbox(bx,by,tw,12,'#000000',lb.hot?PAL.red:'#ffffff');ptext(lb.txt,bx+4,by+2,{f:'p',a:'l',c:lb.hot?PAL.red:'#ffffff',o:false});}
  }
}
function drawDisc(){
  const d=G.disc,f=G.flight||(G.pull&&!G.pull.landed?G.pull:null);
  if(f){
    const hiF=!!(f.high||f===G.pull),tx=sxw(f.tx),ty=syw(f.ty),c=hiF?PAL.gold:'#ffffff',pu=Math.sin(G.tick*10)>0?1:0;
    if(f.cx!==undefined){for(let i=1;i<24;i+=2){const P=flightAt(f,i/24);px(sxw(P.x),syw(P.y),2,1,'rgba(255,255,255,.55)');}}   // la traiettoria segue la curva del lancio
    else pline(sxw(f.sx),syw(f.sy),tx,ty,'rgba(255,255,255,.55)',1,3);
    pring(tx,ty,7+pu,4,PAL.out,3);pring(tx,ty,7+pu,4,c,1);px(tx-1,ty,3,1,c);px(tx,ty-1,1,3,c);
    trail.push({x:d.x,y:d.y,z:d.z*(hiF?1.7:1)});if(trail.length>9)trail.shift();
  }else if(trail.length)trail.length=0;
  for(let i=0;i<trail.length-1;i++){const a=trail[i],k=i/trail.length;px(sxw(a.x),syw(a.y)-a.z*S*0.5,k>0.5?2:1,k>0.5?2:1,k>0.5?'#ffffff':'#d9ecc8');}
  const car=G.holder||(G.mode==='ready'?G.puller:null);
  let x=sxw(d.x),y=syw(d.y),z=f?d.z:0;
  if(!f&&car){
    const fc=car.fc||dirOf(car.t),dvp=car.dv?diveProg(car):0;
    x=sxw(car.x)+fc*6;y=syw(car.y)-8;
    if(dvp>0.45){x=sxw(car.x)+car.dv.dir*(6*dvp+14);y=syw(car.y)-5-ri(2+7*diveAir(car));}
    if(G.walk&&!G.walk.stage){x=sxw(d.x);y=syw(d.y);}
    pdiscSprite(x,y,G.tick*3);return;
  }
  const gy=syw(d.y),lift=ri(z*(f&&(f.high||f===G.pull)?1.7:1)*S*0.5);
  // ALTEZZA DEL DISCO: l'ombra resta a terra e si stringe e schiarisce man mano che il disco sale; sopra i 3 metri una fila di puntini la collega al disco,
  // cosi' si capisce a colpo d'occhio quanto e' alto (e se un difensore puo' arrivarci) e dove sta per cadere
  const hk=clamp(lift/40,0,1);
  pell(x,gy+1,ri(lerp(4,2,hk)),1,`rgba(10,30,10,${(0.42-0.2*hk).toFixed(2)})`);
  if(lift>12)for(let yy=gy-3;yy>gy-lift;yy-=4)px(x,yy,1,1,'rgba(255,255,255,.38)');
  pdiscSprite(x,gy-2-lift,G.tick*22);
}
// mira: arco di quadratini bianchi col bordo nero (come la traiettoria di Retro Bowl) e la sua ombra a puntini sul prato
function drawAim(){
  if(drag&&drag.sl&&G.holder&&G.holder.t===0&&!G.flight)drawSling(drag.ox,drag.oy,drag.fx,drag.fy,!drag.dirOk&&!!drag.was);
  if(!drag||!drag.dirOk||!G.holder||G.holder.t!==0||G.flight)return;
  const h=G.holder,w=toWorld(drag.x,drag.y),hx=sxw(h.x)+(h.fc||1)*5,hy=syw(h.y)-9,gx=sxw(h.x),gy=syw(h.y);
  const dist=hyp(w.x-h.x,w.y-h.y),pl=planThrow(h,w.x,w.y,G.high),kd=pl.kind,mk=G.marker;
  if(mk&&hyp(mk.x-h.x,mk.y-h.y)<4){   // cono chiuso dal marcatore
    const ang=Math.atan2(mk.y-h.y,mk.x-h.x),half=55*Math.PI/180,R=ri(16*S);
    for(const a of [ang-half,ang+half])pline(gx,gy,gx+Math.cos(a)*R,gy+Math.sin(a)*R,PAL.red,1,3);
    pring(gx,gy,R,R,PAL.red,1,3,ang-half,ang+half);
    for(let r=R*0.25;r<R;r+=R*0.25)pring(gx,gy,r,r,'rgba(255,90,90,.5)',1,2,ang-half,ang+half);
  }
  const ex=drag.x+ri((pl.tx-w.x)*S),ey=drag.y+ri((pl.ty-w.y)*S);   // punto d'arrivo vero: quello mirato piu' la deriva del vento
  // ogni lancio ha il suo arco: piatto e teso, scoober a mezza altezza, hammer e huck alti, blade altissimo; la curva laterale e' quella vera del volo
  const dpx=hyp(ex-gx,ey-gy),n=Math.max(3,ri(dpx/7));
  const arc=kd==='blade'?Math.min(74,dpx*0.44):(pl.sp.hi?Math.min(52,dpx*0.3):(kd==='scoober'?Math.min(22,dpx*0.17):Math.min(9,dpx*0.06)));
  const col=kd==='blade'?'#ff8a5c':(pl.sp.hi||kd==='scoober'?PAL.gold:'#ffffff'),cxp=pl.cx*S,cyp=pl.cy*S;
  const flow=(G.tick*1.6)%1,lim=G.xtr?Math.min(1,(3+0.12*dist)/Math.max(dist,0.01)):1;
  for(let i=0;i<n;i++){const u=(i+flow)/n;if(u>lim)break;const b=4*u*(1-u);px(lerp(gx,ex,u)+cxp*b,lerp(gy,ey,u)+cyp*b,2,1,'#4f7a3f');}
  for(let i=0;i<n;i++){
    const u=(i+flow)/n;if(u>lim)break;
    const b=4*u*(1-u),x=ri(lerp(hx,ex,u)+cxp*b),y=ri(lerp(hy,ey,u)+cyp*b-arc*b);
    px(x-2,y-2,4,4,PAL.out);px(x-1,y-1,2,2,col);
  }
  if(G.xtr)return;
  // GITTATA: quando il lancio si avvicina al massimo che il suo Sparo permette compare l'arco del limite (rosso); il disco non va oltre
  if(pl.short||pl.dist>pl.mx*0.72){const R=ri(pl.mx*S),an=Math.atan2(w.y-h.y,w.x-h.x);pring(gx,gy,R,R,PAL.out,3,3,an-0.2,an+0.2);pring(gx,gy,R,R,pl.short?PAL.red:'#ff9a8a',1,3,an-0.2,an+0.2);}
  // RISCHIO DI INTERCETTO: il difensore che fa in tempo a mettersi sulla traiettoria lampeggia in rosso, con una croce nel punto in cui la taglierebbe
  {const tr=aimThreat(h,pl);if(tr){const qx=sxw(tr.q.x),qy=syw(tr.q.y),cx2=sxw(tr.x),cy2=syw(tr.y)-6,bl=Math.sin(G.tick*14)>0;
    pring(qx,qy,9,4,PAL.out,3);pring(qx,qy,9,4,bl?PAL.red:'#ffffff',1);
    px(cx2-3,cy2-3,7,7,PAL.out);for(let k=-2;k<=2;k++){px(cx2+k,cy2+k,1,1,PAL.red);px(cx2+k,cy2-k,1,1,PAL.red);}}}
  // cerchio tratteggiato = dove puo' finire il disco: si allarga con la distanza, la pressione e i lanci difficili
  const ur=clamp(ri(1.5*pl.sig*S),5,80);
  pring(ex,ey,ur,ur,PAL.out,3,2);pring(ex,ey,ur,ur,col,1,2);
  px(ex-1,ey-1,3,3,PAL.out);px(ex,ey,1,1,'#ffffff');
  aimAssist(h,w,dist,pl);
}
// compagno agganciato dal mirino (anello + freccia; tratteggiato = e' il compagno chiamato a correre li'), distanza e tipo di lancio.
// In Facile il colore dell'anello dice anche quanto e' rischioso il lancio (verde sicuro, giallo incerto, rosso rischioso)
function aimAssist(h,w,dist,pl){
  const sn=aimSnap(h,w.x,w.y,G.high),q=sn.best||(G.call&&G.call.q),locked=!!sn.best;
  let col='#ffffff';
  if(locked&&G.hint){
    const a=computeAim(h,w.x,w.y,G.high,true),pr=estimateThrow(h,a.x,a.y,a.intended,G.high).p;
    col=pr>=0.75?PAL.green:(pr>=0.5?PAL.gold:PAL.red);
  }
  if(q){
    const x=sxw(q.x),y=syw(q.y),pu=Math.sin(G.tick*10)>0?1:0;
    pring(x,y,10+pu,4,PAL.out,3,locked?0:2);pring(x,y,10+pu,4,col,1,locked?0:2);
    if(locked){const ay=y-PH()-17-pu;parrow(x,ay-1,1,PAL.out,5);parrow(x,ay,1,col,4);}
  }
  const kd=pl.kind,txt=pl.short?'MAX '+Math.round(pl.mx)+' m: CORTO':Math.round(dist)+' m '+pl.sp.name.toUpperCase();   // oltre la gittata (Sparo) il disco cade corto
  const tw=ptw(txt,'p')+6,bx=clamp(drag.x-tw/2,2,VW-tw-2),by=clamp(drag.y-26,BAR+2,VH-14);
  pbox(bx,by,tw,12,'#000000');ptext(txt,bx+3,by+2,{f:'p',a:'l',c:pl.short?PAL.red:(kd==='blade'?'#ff8a5c':(pl.sp.hi||kd==='scoober'?PAL.gold:'#ffffff')),o:false});
}
// sparo in volo: il tuo corridore ha un anello, una freccia e la barra dell'energia
function drawSprint(){
  const r=G.sprint;if(!r||!G.flight||!G.flight.sparo)return;
  const q=r.p,x=sxw(q.x),y=syw(q.y),on=G.hold&&q.st>3,pu=Math.sin(G.tick*12)>0?1:0,c=on?PAL.gold:PAL.sky;
  pring(x,y,11+pu,4,PAL.out,3);pring(x,y,11+pu,4,c,1);
  const ay=y-PH()-19-(on?0:pu);parrow(x,ay-1,1,PAL.out,5);parrow(x,ay,1,c,4);
  px(x-9,ay-8,18,4,PAL.out);px(x-8,ay-7,ri(16*clamp(q.st/100,0,1)),2,barColor(q.st));
  if(on){const sg=q.vx>=0?-1:1;for(let k=0;k<4;k++){const yy=y-4-k*4,xx=x+sg*(8+((G.tick*40+k*5)%7|0));px(sg>0?xx:xx-6,yy,6,1,'#ffffff');}}
}
// tuffo difensivo a tempo: velo scuro del rallentatore e cerchio che si stringe sul difensore
function timingRing(x,y,R,R0,col,done){
  pring(x,y,R0,R0,PAL.out,3);pring(x,y,R0,R0,'#d9ecc8',1,2);
  pring(x,y,R,R,PAL.out,done?5:4);pring(x,y,R,R,col,done?3:2);
}
function drawDiveWin(){
  const w=G.diveWin,a=clamp((1-(G.slowK===undefined?1:G.slowK))/0.7,0,1);
  if(a>0.01)px(0,0,VW,VH,`rgba(5,10,30,${(0.28*a).toFixed(3)})`);
  if(!w)return;
  const q=w.p,x=sxw(q.x),y=syw(q.y)-10,R0=11,k=clamp((w.tp-w.t)/w.tp,0,1);
  timingRing(x,y,w.done?R0+2:ri(R0*(1+2.2*k)),R0,w.done?(w.color==='green'?PAL.green:(w.color==='yellow'?PAL.gold:PAL.red)):'#ffffff',w.done);
}
let hbFx=null;
function drawHb(){
  const w=hbWindow(),R0=11,colOf=qu=>qu>=0.6?PAL.green:(qu>=0.25?PAL.gold:PAL.red);
  if(w){
    const q=w.q,x=sxw(q.x),y=syw(q.y)-10,k=clamp((w.remain-0.12)/(w.tot-0.12),0,1),R=ri(R0*(1+1.8*k)),col=w.done?colOf(w.qual):'#ffffff';
    timingRing(x,y,R,R0,col,w.done);
    if(w.done)hbFx={q,col,R,until:G.tick+0.55};
    return;
  }
  if(hbFx&&G.tick<hbFx.until){const a=(hbFx.until-G.tick)/0.55,q=hbFx.q;if(a>0.5||((G.tick*20|0)&1))pring(sxw(q.x),syw(q.y)-10,Math.max(R0,hbFx.R),Math.max(R0,hbFx.R),hbFx.col,2);}
  else hbFx=null;
}
// messaggi: riquadri neri sotto la barra, testi che salgono dal punto dell'azione, fascia nera a tutto schermo per i cambi di possesso
const floaters=[];let band=null;
function addFloater(txt,x,y,c,f){floaters.push({txt,x,y,c:c||'#ffffff',f:f||'p',t:1.1,max:1.1});if(floaters.length>6)floaters.shift();}
function drawToasts(dt){
  for(const t of toasts)t.t-=dt;
  while(toasts.length&&toasts[0].t<=0)toasts.shift();
  for(let i=floaters.length-1;i>=0;i--){
    const f=floaters[i];f.t-=dt;if(f.t<=0){floaters.splice(i,1);continue;}
    const age=f.max-f.t,y=syw(f.y)-PH()-12-ri(Math.min(1,age/0.5)*10)-(age<0.08?-2:0);
    if(f.t>0.25||((G.tick*24|0)&1))ptext(f.txt,clamp(sxw(f.x),20,VW-20),y,{f:f.f,c:f.c});
  }
  if(G.mode==='banner')return;
  if(band){
    band.t-=dt;
    if(band.t<=0)band=null;
    else{
      const age=band.max-band.t,e=easeOut(clamp(age/0.14,0,1)),out=easeOut(clamp(1-band.t/0.14,0,1)),hh=24,y=ri(VH*0.24),x=-ri(VW*(1-e))+ri(VW*out);
      px(x,y,VW,hh,'#000000');px(x,y-2,VW,1,'#000000');px(x,y+hh+1,VW,1,'#000000');
      px(x,y,6,hh,band.c);px(x+VW-6,y,6,hh,band.c);
      ptext(band.txt,x+VW/2,y+4,{f:'P',c:'#ffffff',o:false});
    }
  }
  toasts.forEach((t,i)=>{
    const w=ptw(t.txt,'p')+14,x=ri(VW/2-w/2),y=(band?ri(VH*0.24)+31:(elHint.classList.contains('hidden')?BAR+5:ri(70*UIZ*DPR/PXS)))+i*16,   // sotto il suggerimento, se c'e'
      col=t.benefit===0?PAL.green:(t.benefit===1?PAL.red:'#ffffff');
    if(t.t<0.2&&((G.tick*24|0)&1))return;
    pbox(x,y,w,13,'#000000');px(x+3,y+4,4,5,col);ptext(t.txt,x+10,y+3,{f:'p',a:'l',c:'#ffffff',o:false});
  });
}
// meta: fascia nera, scritta grande nel colore della squadra, coriandoli a quadretti
function drawBanner(dt){
  if(G.mode!=='banner'||!G.banner){conf.length=0;return;}
  if(G.banner.t>2.4)return;   // prima c'e' il replay
  const b=G.banner,age=2.4-b.t,col=b.team===0?'#6aa0ff':'#ff7b80';
  if(!b.conf){
    b.conf=true;
    for(let i=0;i<90;i++)conf.push({x:Math.random()*VW,y:-Math.random()*VH*0.7,vx:rnd(-14,14),vy:rnd(50,120),c:[col,PAL.gold,'#ffffff',b.team===0?'#2f7bff':'#ff4b4b'][i%4],w:1+(i%2)});
  }
  if(age<0.07){px(0,0,VW,VH,'rgba(255,255,255,.75)');}
  const e=easeOut(clamp(age/0.22,0,1)),hh=64,y0=ri(VH*0.5-hh/2),x=-ri(VW*(1-e)),gone=b.t<0.18;
  if(!gone){
    px(x,y0,VW,hh,'#000000');px(x,y0-3,VW,1,'#000000');px(x,y0+hh+2,VW,1,'#000000');
    px(x,y0+2,VW,2,col);px(x,y0+hh-4,VW,2,col);
    const cal=b.kind==='callahan',title=cal?'CALLAHAN!':'META!',pop=age<0.3&&age>0.22?-2:0,blink=cal&&((G.tick*8|0)&1);
    if(age>0.2){
      ptext(title,VW/2,y0+10+pop,{f:cal&&VW<330?'P':'B',c:blink?'#ffffff':(cal?(b.team===0?PAL.green:PAL.red):col),o:false,sh:2});
      if(age>0.45){
        const names=`${(G.myName||'Blu')} ${G.score[0]} - ${G.score[1]} ${(G.oppName||'Rossi')}`,who=(cal?'Intercetta e segna ':'Segna ')+b.scorer.name;
        ptext(who,VW/2,y0+hh-20,{f:'p',c:'#ffffff',o:false});
        ptext(ptw(names,'p')<VW-10?names:`${G.score[0]} - ${G.score[1]}`,VW/2,y0+hh+8,{f:'p',c:'#ffffff'});
      }
    }
  }
  for(const c of conf){c.x+=c.vx*dt;c.y+=c.vy*dt;c.vx+=Math.sin(G.tick*5+c.y*0.1)*30*dt;if(c.y>VH+4)continue;px(c.x,c.y,c.w,c.w,c.c);}
}

