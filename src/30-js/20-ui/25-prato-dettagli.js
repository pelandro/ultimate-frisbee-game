/* ---- DETTAGLI DEL PRATO: erba secca, zolle di terra, fango e pozzanghere disegnati a pixel ----
   Non sono ovali posati sull'erba: ogni chiazza e' uno sprite fatto una volta sola (per campo e per tempo) con
   - un contorno irregolare (rumore sul raggio, pulito dai pixel isolati);
   - il bordo che sfuma nell'erba: erba consumata e terra a pixel alterni, fuori qualche pixel d'erba ingiallita;
   - la luce da sinistra in alto: bordo chiaro sopra, ombra sotto e a destra;
   - i dettagli: sassolini con la loro ombra, crepe nella terra secca, fili d'erba che entrano nella terra, tacchetti davanti alle mete;
   - le pozzanghere: riva d'erba bagnata, ombra della riva in alto, acqua a due toni, riflessi del cielo a trattini, fili d'erba nell'acqua
     e i cerchi delle gocce (fotogrammi a pixel, solo dentro l'acqua).
   Sui campi di terra battuta (livelli 0-1) al posto delle zolle ci sono la terra calpestata e i ciuffi d'erba sparsi (dirtPattern).
   Con la neve si vede tutto lo stesso, solo piu' chiaro (come il prato). Gli sprite non si ingrandiscono con lo zoom, come i giocatori. Quanto e' rovinato il campo lo dicono fieldKind e fieldWear (22-campo-retro.js). */
const SOIL_DRY=['#c4aa76','#a88d5c','#88714b','#5f4f36'],SOIL_MUD=['#7d5f3e','#5e4930','#43331f','#2c2216'];   // chiara, base, scura, puntini
// sagoma irregolare in una griglia con un margine (per l'alone fuori): l'unione di qualche lobo ovale, con il bordo mosso dal rumore. 1 dentro, 0 fuori
function blobMask(W,H,M,seed,rough,lobes){
  const TW=W+2*M,TH=H+2*M,m=new Uint8Array(TW*TH),r01=k=>(ihash(seed,k)%1000)/1000,L=[];
  L.push({cx:(TW-1)/2,cy:(TH-1)/2,rx:W/2*0.78,ry:H/2*0.8});
  for(let i=1;i<(lobes||3);i++){
    const rx=W/2*(0.4+0.3*r01(10+i)),ry=H/2*(0.45+0.35*r01(20+i));
    L.push({cx:clamp((TW-1)/2+(r01(30+i)-0.5)*W*0.6,M+rx,TW-1-M-rx),cy:clamp((TH-1)/2+(r01(40+i)-0.5)*H*0.5,M+ry,TH-1-M-ry),rx,ry});
  }
  const f=[3+ihash(seed,1)%3,6+ihash(seed,2)%4],ph=[r01(5)*6.28,r01(6)*6.28];
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){
    const j=((ihash(x+seed*7,y*13+seed)%100)/100-0.5)*0.22*rough;
    for(const l of L){
      const dx=(x-l.cx)/l.rx,dy=(y-l.cy)/l.ry,t=Math.atan2(dy,dx),R=1-rough*(0.12*(0.5+0.5*Math.sin(t*f[0]+ph[0]))+0.07*(0.5+0.5*Math.sin(t*f[1]+ph[1])));
      if(dx*dx+dy*dy<(R+j)*(R+j)){m[y*TW+x]=1;break;}
    }
  }
  for(let pass=0;pass<2;pass++)for(let y=1;y<TH-1;y++)for(let x=1;x<TW-1;x++){   // via i pixel isolati, chiusi i buchi
    const i=y*TW+x,n=m[i-1]+m[i+1]+m[i-TW]+m[i+TW];
    if(m[i]&&n<=1)m[i]=0;else if(!m[i]&&n>=3)m[i]=1;
  }
  return {m,TW,TH};
}
// distanza (in passi a croce) dal confine: dentro (side=1) dai pixel fuori, fuori (side=0) dai pixel dentro
function blobDist(B,side){
  const {m,TW,TH}=B,d=new Uint8Array(TW*TH).fill(255),q=[];
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){
    const i=y*TW+x;if(m[i]!==side)continue;
    const o=side?1:0,edge=(x===0?o:m[i-1]!==side)||(x===TW-1?o:m[i+1]!==side)||(y===0?o:m[i-TW]!==side)||(y===TH-1?o:m[i+TW]!==side);   // il bordo della griglia conta solo per chi sta dentro
    if(edge){d[i]=1;q.push(i);}
  }
  for(let k=0;k<q.length;k++){
    const i=q[k],x=i%TW,y=(i/TW)|0;
    for(const j of [x>0?i-1:-1,x<TW-1?i+1:-1,y>0?i-TW:-1,y<TH-1?i+TW:-1])if(j>=0&&m[j]===side&&d[j]>d[i]+1){d[j]=d[i]+1;q.push(j);}
  }
  return d;
}
function sprCanvas(TW,TH){const c=document.createElement('canvas');c.width=TW;c.height=TH;const g=c.getContext('2d');return {c,put:(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1);}};}
// zolla di terra (o di fango con la pioggia). o.studs: i segni dei tacchetti; o.dry: crepe
function soilSprite(W,H,seed,o){
  const M=3,B=blobMask(W,H,M,seed,o.rough||1.1,3),{m,TW,TH}=B,din=blobDist(B,1),dout=blobDist(B,0),{c,put}=sprCanvas(TW,TH);
  const D=(o.mud?SOIL_MUD:SOIL_DRY).map(k=>o.snow?cMix(k,'#e6eeea',0.3):k),T=cMix(PAL.grass,D[1],0.42),Y=cMix(PAL.grass,'#b8aa66',0.45),blade=cShade(PAL.grass,-0.25);
  const at=(x,y)=>x<0||y<0||x>=TW||y>=TH?0:m[y*TW+x],dIn=(x,y)=>x<0||y<0||x>=TW||y>=TH?0:(m[y*TW+x]?din[y*TW+x]:0);
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){
    const i=y*TW+x,h=ihash(x+seed*31,y+seed*17)%100;
    if(!m[i]){   // fuori: l'erba vicino alla terra e' consumata o ingiallita, a pixel sparsi
      if(dout[i]===1&&h<48)put(x,y,T);else if(dout[i]===2&&h<22)put(x,y,Y);
      continue;
    }
    let col;
    if(din[i]===1)col=(x+y)&1?T:D[0];   // il bordo: erba consumata e terra a pixel alterni
    else if(dIn(x,y-1)===1||dIn(x-1,y)===1&&y<TH/2)col=D[0];   // luce da sinistra in alto
    else if(dIn(x,y+1)===1||dIn(x+1,y)===1&&y>TH/2)col=D[2];   // ombra sotto e a destra
    else col=D[1];
    if(din[i]>=2){
      if(h<6)col=D[3];   // puntini scuri
      else if(o.mud&&din[i]>=3&&h<14)col=h<10?'#3d4b55':'#55636d';   // acqua ferma nel fango
      else if(!o.mud&&h<9&&at(x,y+1)){col='#ddd2b6';}   // sassolino (l'ombra sotto si mette dopo)
      else if(!o.mud&&h<12)col=PAL.dot;   // un ciuffo d'erba sopravvissuto
    }
    put(x,y,col);
  }
  for(let y=1;y<TH-1;y++)for(let x=0;x<TW;x++){   // ombre dei sassolini e fili d'erba che entrano nella terra dai bordi alto e basso
    const i=y*TW+x,h=ihash(x+seed*11,y+seed*5)%100;
    if(m[i]&&din[i]>=2&&!o.mud&&ihash(x+seed*31,y+seed*17)%100>=6&&ihash(x+seed*31,y+seed*17)%100<9)put(x,y+1,D[3]);
    if(!m[i]&&m[i+TW]&&h<24){put(x,y,blade);put(x,y+1,PAL.dot);}
    if(!m[i]&&m[i-TW]&&h<16){put(x,y,blade);put(x,y-1,blade);}
  }
  if(o.dry&&!o.mud)for(let k=0;k<2;k++){   // crepe della terra secca
    let x=M+2+ihash(seed,40+k)%Math.max(1,W-4),y=M+1+ihash(seed,50+k)%Math.max(1,H-2);
    for(let s=0;s<5;s++){if(dIn(x,y)>=2)put(x,y,D[3]);x+=1;y+=ihash(seed+s,60+k)%3-1;}
  }
  if(o.studs){   // i tacchetti: coppie di buchetti dove si gira e si scatta
    for(let k=0;k<Math.floor(W*H/22);k++){const x=ihash(seed,70+k)%TW,y=ihash(seed,90+k)%TH;if(dIn(x,y)>=2&&dIn(x+2,y)>=2){put(x,y,D[2]);put(x+2,y,D[2]);if(o.mud)put(x+1,y+1,D[3]);}}
  }
  return {c,M,TW,TH};
}
// zona d'erba secca: ciuffi gialli (due pixel, la punta piu' chiara) fitti nel mezzo e sempre piu' radi verso fuori, a grumi: niente bordo netto
function drySprite(W,H,seed,cols){
  const M=1,B=blobMask(W,H,M,seed,1.3,4),{m,TW,TH}=B,din=blobDist(B,1),{c,put}=sprCanvas(TW,TH);
  const [Y,Y2,Y0]=cols||[cMix(PAL.grass,'#b4a862',0.48),cMix(PAL.grass,'#d2c785',0.55),cMix(PAL.grass,'#a39857',0.32)];
  for(let y=0;y<TH-1;y++)for(let x=0;x<TW;x++){
    const i=y*TW+x;if(!m[i])continue;
    const d=din[i],grumo=0.5+0.5*Math.sin(x*0.7+seed)*Math.sin(y*1.1+seed*0.3),p=Math.min(1,d/5)*(0.35+0.65*grumo),h=(ihash(x+seed*3,y+seed*9)%1000)/1000;
    if(h<p*0.55){put(x,y,h<p*0.2?Y2:Y);put(x,y+1,Y0);}
  }
  return {c,M,TW,TH};
}
// terra calpestata: piu' scura a grumi, con i segni dei tacchetti; con la pioggia e' fango con qualche riflesso
function scuffSprite(W,H,seed,mud){
  const cols=mud?['#5c4731','#6e5639','#4a3826']:[cShade(PAL.grass,-0.13),cShade(PAL.grass,-0.06),cShade(PAL.grass,-0.2)];
  const s=drySprite(W,H,seed,cols),g=s.c.getContext('2d');
  for(let k=0;k<Math.floor(W*H/26);k++){const x=1+ihash(seed,70+k)%Math.max(1,s.TW-4),y=1+ihash(seed,90+k)%Math.max(1,s.TH-2);g.fillStyle=cols[2];g.fillRect(x,y,1,1);g.fillRect(x+2,y,1,1);}
  if(mud)for(let k=0;k<3;k++){const x=2+ihash(seed,120+k)%Math.max(1,s.TW-5),y=2+ihash(seed,130+k)%Math.max(1,s.TH-4);g.fillStyle='#4b5c68';g.fillRect(x,y,3,1);g.fillStyle='#9fb6c8';g.fillRect(x,y,1,1);}
  return s;
}
// pozzanghera: riva bagnata, ombra della riva, acqua a due toni, riflessi a trattini, fili d'erba nell'acqua
function puddleSprite(W,H,seed,muddy){
  const M=2,B=blobMask(W,H,M,seed,1.2,3),{m,TW,TH}=B,din=blobDist(B,1),dout=blobDist(B,0),{c,put}=sprCanvas(TW,TH);
  const mx=k=>muddy?cMix(k,'#6b5636',0.18):k,SH=mx('#2a4d74'),WA=mx('#3f74ab'),W2=mx('#5a8fc4'),SL=mx('#8fc0e6'),HI='#e4f3ff';
  const bank1=cShade(PAL.grass,-0.38),bank2=cShade(PAL.grass,-0.2),blade=cShade(PAL.grass,-0.1);
  const inside=(x,y)=>x>=0&&y>=0&&x<TW&&y<TH&&m[y*TW+x];
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){
    const i=y*TW+x,h=ihash(x+seed*13,y+seed*29)%100;
    if(!m[i]){if(dout[i]===1&&(h<75||inside(x,y-1)))put(x,y,bank1);else if(dout[i]===2&&h<35)put(x,y,bank2);continue;}   // riva: erba fradicia
    let col=WA;
    if(!inside(x,y-1)||(din[i]===2&&!inside(x,y-2)))col=SH;   // l'ombra della riva in alto
    else if(!inside(x,y+1))col=SL;   // in basso l'acqua bassa prende la luce
    else if(din[i]>=2&&(y%3===1)&&h<30)col=W2;   // increspature
    put(x,y,col);
  }
  for(let k=0;k<(W>26?3:2);k++){   // riflessi del cielo: trattini chiari nella parte alta (il primo piu' lungo)
    for(let t=0;t<16;t++){const x=M+1+ihash(seed,100+k*20+t)%Math.max(1,W-4),y=M+1+ihash(seed,140+k*20+t)%Math.max(1,ri(H*0.6));
      if(din[y*TW+x]>=2&&inside(x+3,y)&&din[y*TW+x+3]>=2){put(x,y,HI);put(x+1,y,HI);if(k===0){put(x+2,y,HI);put(x+3,y,SL);}else put(x+2,y,SL);break;}}
  }
  for(let k=0;k<3;k++){   // fili d'erba che spuntano dall'acqua vicino alla riva
    for(let t=0;t<10;t++){const x=ihash(seed,200+k*10+t)%TW,y=ihash(seed,240+k*10+t)%TH;if(inside(x,y)&&din[y*TW+x]===2){put(x,y,bank1);put(x,y-1,blade);break;}}
  }
  return {c,M,TW,TH,m,din};
}
// ---------- quali chiazze ha un campo: dipende dal club di casa e da quanto e' consumato ----------
let wearKey='',wearList=null;
function wearSpots(V,w){
  const h=hashStr('usura|'+(V.home||V.ev||'')),k=0.55+0.75*w,out=[];
  const add=(kind,x,y,W,H,o)=>out.push({kind,x,y,W:Math.max(4,ri(W*k)),H:Math.max(3,ri(H*k)),seed:ihash(h,out.length+1),o:o||{}});
  const j=i=>((ihash(h,i)%100)/100-0.5)*1.6;
  // zone secche nel corridoio tra le mete e davanti alle mete, poi la terra dove si gioca di piu'
  if(w>=0.3){add('dry',FIELD_L/2+j(1),MID+j(2),64,24);add('dry',EZ+4+j(3),MID+j(4),30,36);add('dry',FIELD_L-EZ-4+j(5),MID+j(6),30,36);
    for(let i=0;i<ri(4*w);i++){const q=ihash(h,300+i);add('dry',EZ+6+(q%520)/10,3+((q>>>10)%310)/10,26+(q>>>20)%18,12+(q>>>24)%8);}}
  add('soil',FIELD_L/2+j(7),MID+j(8),30,14,{studs:1,dry:1});
  add('soil',EZ+2.2+j(9)*0.4,MID+j(10),14,30,{studs:1});add('soil',FIELD_L-EZ-2.2+j(11)*0.4,MID+j(12),14,30,{studs:1});
  add('soil',EZ+18+j(13)*0.5,MID+j(14)*0.5,14,8,{dry:1});add('soil',FIELD_L-EZ-18+j(15)*0.5,MID+j(16)*0.5,14,8,{dry:1});
  for(let i=0;i<ri(10*w);i++){const q=ihash(h,i+50);add('soil',EZ+2+(q%600)/10,2+((q>>>10)%330)/10,5+(q>>>4)%8,3+(q>>>20)%4,{dry:(q>>>8)&1});}
  return out;
}
// campo di terra: zone calpestate dove si gioca di piu' (corridoio centrale, davanti alle mete, sui brick). L'erba sono i ciuffi della trama della terra (dirtPattern)
function dirtSpots(V,cover){
  const h=hashStr('terra|'+(V.home||V.ev||'')),out=[];
  const add=(kind,x,y,W,H)=>out.push({kind,x,y,W,H,seed:ihash(h,out.length+1),o:{}});
  add('scuff',FIELD_L/2,MID,70,26);add('scuff',EZ+3,MID,26,40);add('scuff',FIELD_L-EZ-3,MID,26,40);add('scuff',EZ+18,MID,24,12);add('scuff',FIELD_L-EZ-18,MID,24,12);
  for(let i=0;i<5;i++){const q=ihash(h,400+i);add('scuff',EZ+8+(q%480)/10,MID+((q>>>10)%160)/10-8,22+(q>>>20)%20,10+(q>>>25)%6);}
  return out;
}
const pradoSpr=new Map();
function pradoSprite(sp,wx){
  const key=sp.kind+'|'+sp.W+'|'+sp.H+'|'+sp.seed+'|'+PAL.grass+'|'+wx+'|'+(sp.o.studs?1:0);let s=pradoSpr.get(key);if(s)return s;
  s=sp.kind==='dry'?drySprite(sp.W,sp.H,sp.seed):(sp.kind==='pud'?puddleSprite(sp.W,sp.H,sp.seed,sp.o.muddy):(sp.kind==='scuff'?scuffSprite(sp.W,sp.H,sp.seed,wx===1):soilSprite(sp.W,sp.H,sp.seed,{studs:sp.o.studs,dry:sp.o.dry&&wx!==1,mud:wx===1,snow:wx===2})));
  if(pradoSpr.size>160)pradoSpr.clear();
  pradoSpr.set(key,s);return s;
}
const blitSpr=(s,x,y)=>ctx.drawImage(s.c,ri(x-s.TW/2),ri(y-s.TH/2));
// prato consumato: zone secche, zolle e fango (con la neve sono coperte)
function drawWear(){
  const V=venueNow(),w=fieldWear(V),wx=G.wx|0,fk=fieldKind(V);if(w<0.2)return;   // con la neve si vede tutto, solo piu' chiaro (i colori vengono dalla tavolozza schiarita)
  const key=(V.home||'')+'|'+(V.ev||'')+'|'+ri(w*20)+'|'+fk+'|'+ri(turfCover(V)*20);if(key!==wearKey){wearKey=key;wearList=fk===0?dirtSpots(V,turfCover(V)):wearSpots(V,w);}
  for(const sp of wearList){const x=sxw(sp.x);if(x<-60||x>VW+60)continue;blitSpr(pradoSprite(sp,wx),x,syw(sp.y));}
  if(w>=0.6&&wx!==2)drawWeeds();
}
// campi comunali: margherite e trifoglio lungo i bordi, dove si corre poco
function drawWeeds(){
  const V=venueNow(),h0=hashStr('fiori|'+(V.home||''));
  for(let i=0;i<34;i++){
    const q=ihash(h0,i),side=q&1,wx=EZ+((q>>>1)%640)/10,wy=side?FIELD_W-0.4-((q>>>12)%25)/10:0.4+((q>>>12)%25)/10,x=sxw(wx),y=syw(wy);
    if(x<-3||x>VW+3)continue;
    if((q>>>20)%3){px(x,y-1,1,1,'#f6f6ee');px(x-1,y,3,1,'#f6f6ee');px(x,y+1,1,1,'#f6f6ee');px(x,y,1,1,(q>>>22)&1?'#f2c230':'#e8b52a');}   // margherita
    else{const c=cShade(PAL.grass,-0.22);px(x-1,y,2,1,c);px(x,y-1,2,1,c);}   // trifoglio
  }
}
// ---------- pioggia: pozzanghere ----------
let pudKey='',pudList=null;
function drawPuddles(){
  const V=venueNow(),lv=vnLv(V),w=fieldWear(V),key=(V.home||'')+'|'+(V.ev||'')+'|'+lv;
  if(key!==pudKey){
    pudKey=key;const h0=hashStr('pozze|'+(V.home||V.ev||''));pudList=[];
    const n=[6,5,4,3,2,2][lv]+(h0%2);   // i campi comunali drenano peggio
    for(let i=0;i<n;i++){const h=ihash(h0,i);pudList.push({kind:'pud',x:6+(h%880)/10,y:4+((h>>>11)%290)/10,W:20+(h>>>5)%22,H:8+(h>>>17)%7,seed:h,o:{muddy:w>0.5}});}
  }
  for(let i=0;i<pudList.length;i++){
    const p=pudList[i],x=sxw(p.x),y=syw(p.y);if(x<-30||x>VW+30)continue;
    const s=pradoSprite(p,1),ox=ri(x-s.TW/2),oy=ri(y-s.TH/2);ctx.drawImage(s.c,ox,oy);
    for(let r=0;r<2;r++){   // cerchi delle gocce: un punto, una crocetta, un anello, solo dentro l'acqua
      const t=G.tick*1.4+i*0.37+r*0.53,cyc=Math.floor(t),f=t-cyc;if(f>0.6)continue;
      let cx=-1,cy=-1;for(let k=0;k<8;k++){const q=ihash(i*17+r+k*3,cyc),qx=q%s.TW,qy=(q>>>10)%s.TH,j=qy*s.TW+qx;if(s.m[j]&&s.din[j]>=3){cx=qx;cy=qy;break;}}
      if(cx<0)continue;
      const dots=f<0.18?[[0,0]]:(f<0.38?[[-1,0],[1,0],[0,-1],[0,1]]:[[-2,0],[2,0],[-1,-1],[1,-1],[-1,1],[1,1]]),col=f<0.38?'#d8edff':'#a9cdeb';
      for(const [dx,dy] of dots){const a=cx+dx,b=cy+dy;if(a>=0&&b>=0&&a<s.TW&&b<s.TH&&s.m[b*s.TW+a])px(ox+a,oy+b,1,1,col);}
    }
  }
}
