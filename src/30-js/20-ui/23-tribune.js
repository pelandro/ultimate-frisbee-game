/* ---- TRIBUNE E PUBBLICO (fascia sopra il campo) ----
   Il livello dell'impianto (vnLv, 0-5) decide che cosa c'e' oltre i cartelloni:
     0 campo comunale: rete metallica, gente in piedi, alberi e spogliatoi dietro;
     1 campo sportivo: in piu' una tribunetta in tubi a centrocampo;
     2 tribuna: gradoni di cemento su tutto il lato (negli USA in alluminio), poi gli alberi;
     3 tribuna grande: seggiolini nei colori del club, corridoi e una pensilina sui pali;
     4 stadio: anello superiore con la fascia LED, tetto nei colori del club;
     5 grande stadio: seggiolini a mosaico, tetto con i fari, piloni dietro la tribuna.
   Il paese del club di casa (vnLand) sceglie alberi, tetti e bandiere; il tempo veste il pubblico (ombrelli e cappucci con la pioggia,
   cuffie e sciarpe con la neve). Esultano solo i tifosi di chi segna; negli stadi, tra un punto e l'altro, parte la ola. */
const SKY=['#8fd0f2','#8f9cad','#c9d3df'];
const STEP_LV=[null,null,['#7c8396','#6e7588'],['#7a8194','#6b7285'],['#737a8d','#646b7e'],['#6f7689','#60677a']];
const STEP_US=['#aeb6c2','#99a2af'];   // negli USA le tribune basse sono in alluminio
const COAT_C=['#f2c230','#1f3a6b','#c8343a','#2f7d4b','#e86a2a','#6b4aa8'];   // impermeabili e giacconi
const UMB_C=['#d93b3b','#2f6fd6','#f2c230','#2fa84f','#f4f4f4','#1f2740','#e86a2a','#b34fd1'];
const HAIR_C=['#2b1b12','#7a4a21','#101010','#c9964a','#8a2f1c'];
// righe di gradoni per livello (0 = nessuna: rete) e quanto e' lunga la tribunetta del livello 1
const STAND_ROWS=[0,3,3,4,12,15],BLEACH_HALF=13,NEAR_RMAX=3;   // la tribuna vicina, oltre NEAR_RMAX file, e' una trama
function drawStands(y0){
  if(y0<=BAR)return;   // la fascia e' sotto la barra: non si vede
  const V=venueNow(),lv=vnLv(V),wx=G.wx|0,land=vnLand(V),front=y0-3;
  // sopra le tribune basse (o dietro la rete) si vede il paesaggio: cielo, alberi, spogliatoi
  const rows=STAND_ROWS[lv];
  if(lv<=1){const yb=y0-12;if(yb>BAR){px(0,BAR,VW,yb-BAR+2,SKY[wx]);drawClouds(yb,wx);drawTrees(yb+2,land,wx);clubhouse(yb+2,land,wx);}}   // dalla tribuna in su il cielo lo disegna concreteStand
  if(lv===0){standingFans(y0,V,null);drawFenceTop(y0,null);}
  else if(lv===1){
    const a=FIELD_L/2-BLEACH_HALF,b=FIELD_L/2+BLEACH_HALF;
    standingFans(y0,V,[a-1,b+1]);drawFenceTop(y0,[a,b]);bleacher(front,a,b,V,land);
  }else concreteStand(front,lv,V,land,wx);
  if(V.vip)oroFront(y0);
  if(V.big)drawStreamer(Math.max(BAR+1,front-5*Math.min(rows,3)-10));   // lo striscione dei tifosi sopra le prime file
  drawTopBoards(y0);   // cartelloni davanti alla tribuna, con i varchi per vedere il pubblico (18-cartelloni.js)
  farCrew(y0);   // telecamere davanti ai cartelloni (24-bordocampo-persone.js)
  if(wx===2)snowBankH(y0-1,2,4,11);   // la neve spalata dal campo, ammucchiata contro i cartelloni: copre le gambe dei cameraman (basso: i cartelloni si leggono)
  if(V.big&&G.mode==='banner')drawConfetti(y0-16);
}
// ---------- paesaggio ----------
// alberi del paese: pini domestici e cipressi in Italia, conifere negli USA, alberi a chioma tonda nel resto d'Europa
function treeKind(land,h){
  if(land==='IT')return h%5<3?'pino':'cipresso';
  if(land==='US')return h%4?'abete':'tondo';
  if(land==='UK')return h%5?'tondo':'pioppo';
  return h%3?'tondo':'pioppo';
}
function drawTrees(yb,land,wx){
  const step=6.5,k0=Math.floor((toWorld(0,0).x-12)/step),k1=Math.ceil((toWorld(VW,0).x+12)/step);
  const dk=wx===1?-0.14:0,G1=cShade('#2f6a2c',dk),G2=cShade('#3f8138',dk),G3=cShade('#24502a',dk),TR='#5a3c24',SN='#f4f8fc',SN2='#d5e0ec';
  for(let pass=0;pass<2;pass++)for(let k=k0;k<=k1;k++){   // due file: quella lontana piu' scura e piu' in alto
    const h=ihash(k,pass*91+17);if(pass===0&&h%3===0)continue;
    const x=sxw(k*step+(h%50)/10+(pass?3:0)),y=yb-(pass?0:3),kd=treeKind(land,h>>>4),sz=0.8+((h>>>9)%5)*0.1,far=pass===0;
    const c1=far?cShade(G1,-0.12):G1,c2=far?cShade(G2,-0.12):G2,c3=far?cShade(G3,-0.12):G3;
    if(kd==='pino'){
      const th=ri(10*sz),rx=ri(9*sz),ry=3;px(x,y-th,2,th,TR);
      pell(x+1,y-th-1,rx,ry,c3);pell(x,y-th-2,rx-1,ry-1,c1);pell(x-2,y-th-3,ri(rx*0.6),1,c2);
      if(wx===2){px(x-rx+2,y-th-4,2*rx-3,1,SN);px(x-ri(rx*0.6),y-th-5,ri(rx*1.1),1,SN);}
    }else if(kd==='cipresso'||kd==='pioppo'){
      const ry=ri((kd==='cipresso'?11:9)*sz),rx=kd==='cipresso'?2:3;px(x,y-2,1,3,TR);
      pell(x,y-ry-1,rx+1,ry,c3);pell(x-1,y-ry-2,rx,ry-1,kd==='cipresso'?c3:c1);px(x-1,y-2*ry+1,1,ri(ry*0.8),c2);
      if(wx===2){px(x-1,y-2*ry-1,2,2,SN);px(x-rx,y-ry-2,1,2,SN2);}
    }else if(kd==='abete'){
      const hh=ri(16*sz);px(x,y-3,1,4,TR);
      for(let i=0;i<hh;i++){const w=1+ri((hh-i)*0.55)+(i%4===0?1:0);px(x-w,y-3-i,2*w+1,1,i%4===0?c2:c3);if(wx===2&&i%4===0)px(x-w+1,y-3-i,w,1,SN);}
    }else{
      const r=ri(5.5*sz);px(x,y-4,2,5,TR);
      pell(x+1,y-r-3,r+1,r,c3);pell(x,y-r-4,r,r-1,c1);pell(x-ri(r*0.4),y-r-ri(r*0.6)-4,ri(r*0.5),ri(r*0.4),c2);
      if(wx===2){pell(x,y-2*r-2,ri(r*0.8),1,SN);px(x-ri(r*0.5),y-2*r-1,r,1,SN2);}
    }
  }
}
// spogliatoi del campo: intonaco e coppi in Italia, mattoni in Inghilterra, legno bianco negli USA
const HOUSE={IT:['#e9d3a6','#c0562f'],UK:['#a5523a','#4a4f5c'],US:['#ece7dc','#5a5f6a'],DE:['#dcd6c8','#7a3a2a'],FR:['#e6dcc6','#8a4a33'],BE:['#d6cbb8','#5f3a2c'],EU:['#dcd6c8','#7a3a2a']};
function clubhouse(yb,land,wx){
  const [wall,roof]=HOUSE[land]||HOUSE.IT,a=sxw(FIELD_L*0.74),b=sxw(FIELD_L*0.74+13);if(b<0||a>VW)return;
  const w=b-a;px(a-1,yb-9,w+2,10,PAL.out);px(a,yb-8,w,8,wall);
  for(let x=a+3;x<b-3;x+=6){px(x,yb-6,3,2,'#2b3c5a');px(x,yb-6,3,1,'#5c7fa8');}   // finestre
  px(a+ri(w*0.45),yb-5,3,5,'#5a3c24');   // porta
  for(let i=0;i<4;i++)px(a-2+i,yb-10-i,w+4-2*i,1,i===0?PAL.out:(wx===2?(i>1?'#f4f8fc':'#dfe8f2'):roof));
  px(a+1,yb-14,w-2,1,PAL.out);
}
// ---------- campo comunale: rete metallica e gente in piedi ----------
function drawFenceTop(y0,gap){
  const t=y0-15,k0=Math.floor(toWorld(0,0).x/3)-1,k1=Math.ceil(toWorld(VW,0).x/3)+1,ga=gap?sxw(gap[0]):-1,gb=gap?sxw(gap[1]):-1;
  const seg=(a,b)=>{   // tratti di rete tra a e b (in pixel), evitando la tribunetta
    if(b<=a)return;px(a,t+1,b-a,1,'rgba(52,58,74,.8)');px(a,y0-4,b-a,1,'rgba(52,58,74,.7)');
    ctx.save();ctx.beginPath();ctx.rect(a,t+2,b-a,y0-6-t);ctx.clip();
    for(let x=-(((CX%4)+4)%4);x<VW;x+=4)for(let y=t+2;y<y0-4;y+=3)px(x+((y>>1)&1)*2,y,1,1,'rgba(215,222,234,.28)');
    ctx.restore();
  };
  if(gap){seg(0,ga);seg(gb,VW);}else seg(0,VW);
  for(let k=k0;k<=k1;k++){const x=sxw(k*3);if(gap&&x>=ga&&x<=gb)continue;px(x,t,1,y0-3-t,'#4a5062');px(x,t,1,1,'#9aa2b2');}
}
function standingFans(y0,V,skip){
  const step=1.9,k0=Math.floor((toWorld(0,0).x-2)/step),k1=Math.ceil((toWorld(VW,0).x+2)/step),feet=y0-5;
  for(let k=k0;k<=k1;k++){
    const h=ihash(k,5),wx=k*step+((h>>>3)%7)*0.1;if(skip&&wx>skip[0]&&wx<skip[1])continue;
    if((h%1000)/1000>=V.fill*0.8)continue;
    fanFigure(sxw(wx),feet,h,V,fanTeam(V,wx,h),true);
  }
}
// ---------- livello 1: tribunetta in tubi (tre gradini) ----------
function bleacher(front,a,b,V,land){
  const A=sxw(a),B=sxw(b);if(B<0||A>VW)return;
  const us=land==='US',pl=us?'#c3cbd6':'#b8925e',pl2=us?'#8b95a3':'#8a6a40',fr='#5f6676';
  for(let r=2;r>=0;r--){
    const y=front-5*r;
    px(A,y-1,B-A,2,pl);px(A,y+1,B-A,1,pl2);   // asse del gradino
    crowdRow(y,r,V,{a,b,seat:false});
  }
  for(const x of [A,B-1,ri((A+B)/2)]){px(x,front-14,1,15,fr);}
  pline(A,front+1,A+8,front-13,fr,1);pline(B-1,front+1,B-9,front-13,fr,1);   // controventi
}
// ---------- livelli 2-5: gradoni con i corridoi, anello superiore, tetto sui pali ----------
// File per livello: anello inferiore e superiore. Il tetto sta SOPRA le teste dell'ultima fila (non copre e non scurisce nessuno) ed e' retto da pali
// che salgono nei corridoi tra i settori; sopra il tetto il cielo (con gli alberi o, nel grande stadio, i piloni dei fari)
const STAND_LO=[0,0,3,4,7,7],STAND_UP=[0,0,0,0,5,8],AISLE_STEP=14,AISLE_OFF=7,AISLE_W=1.3;
const aisleNear=wx=>{const d=(((wx-AISLE_OFF)%AISLE_STEP)+AISLE_STEP)%AISLE_STEP;return Math.min(d,AISLE_STEP-d);};
const aisleHW=()=>Math.max(2,ri(AISLE_W*S/2));   // meta' larghezza del corridoio in pixel
function concreteStand(front,lv,V,land,wx){
  const us=land==='US'&&lv<=3,C=V.vip?ORO_STEP:(us?STEP_US:STEP_LV[lv]),hs=vnSide(V),seat=lv>=3,home=UNI[hs].shirt,GAP=7;
  const nLo=STAND_LO[lv],nUp=STAND_UP[lv],nAll=nLo+nUp,rowY=r=>front-5*r-(r>=nLo?GAP:0);
  const topBand=rowY(nAll-1)-4,roofH=[0,0,0,5,7,9][lv],roofB=topBand-9,roofT=roofB-roofH,backTop=lv===2?topBand-5:roofT;
  if(V.vip){if(backTop>BAR)oroSky(BAR,backTop+2,VW);}
  else if(backTop>BAR){px(0,BAR,VW,backTop-BAR+2,SKY[wx]);drawClouds(backTop,wx);if(lv<=4)drawTrees(backTop+2,land,wx);else floodMasts(backTop+2,wx);}
  if(lv===2){px(0,topBand-5,VW,6,'#8a90a0');px(0,topBand-5,VW,1,'#b5bbc8');if(wx===2)px(0,topBand-6,VW,1,'#f4f8fc');}   // muro in cima ai gradoni, dietro l'ultima fila
  const stepRow=(r,dk)=>{
    const y=rowY(r);if(y<BAR-6||y-14>VH)return;
    px(0,y-4,VW,5,dk?cShade(C[r%2],dk):C[r%2]);px(0,y-4,VW,1,wx===2?'#eef4fa':(V.vip?'#e5b53a':(us?'#d7dde6':'#a7adbb')));   // gradino con lo spigolo chiaro (con la neve, bianco)
    crowdRow(y,r,V,{seat,mosaic:lv>=5,dark:dk,aisle:true});
  };
  if(nUp){
    for(let r=nAll-1;r>=nLo;r--)stepRow(r,-0.05);   // anello superiore, appena piu' lontano
    aisles(rowY(nAll-1)-4,rowY(nLo),wx);
    const yp=rowY(nLo)+1;   // parapetto dell'anello superiore con il LED che scorre: sta nello spazio tra i due anelli
    if(yp+GAP>BAR){px(0,yp,VW,GAP,'#232838');px(0,yp,VW,1,'#3b4252');
      for(let x=-(((CX+ri(G.tick*20))%24)+24)%24;x<VW;x+=24){px(x,yp+2,12,2,home);px(x+12,yp+2,12,2,PAL.gold);}
      if(V.vip)oroRibbon(yp+1,GAP-2,VW,CX);
      px(0,yp+GAP-1,VW,1,'#161a2b');if(wx===2)px(0,yp-1,VW,1,'#f4f8fc');}
  }
  for(let r=nLo-1;r>=0;r--)stepRow(r,0);
  aisles(rowY(nLo-1)-4,front,wx);
  if(V.vip)oroRoof(roofT,roofB,front);else if(lv>=3)standRoof(roofT,roofB,front,lv,home,wx);
}
// corridoi tra i settori: scale di cemento, senza nessuno seduto (i pali del tetto salgono qui)
function aisles(yt,yb,wx){
  if(yb<BAR)return;yt=Math.max(yt,BAR);
  const hw=aisleHW(),k0=Math.floor((toWorld(0,0).x-AISLE_OFF)/AISLE_STEP)-1,k1=Math.ceil((toWorld(VW,0).x-AISLE_OFF)/AISLE_STEP)+1;
  for(let k=k0;k<=k1;k++){
    const x=sxw(AISLE_OFF+k*AISLE_STEP);if(x<-8||x>VW+8)continue;
    px(x-hw,yt,2*hw+1,yb-yt+1,'#9aa1b0');px(x-hw,yt,1,yb-yt+1,'#6d7486');px(x+hw,yt,1,yb-yt+1,'#6d7486');
    for(let y=yb-4;y>=yt;y-=5)px(x-hw+1,y,2*hw-1,1,wx===2?'#f4f8fc':'#c3c8d3');   // gradini, allineati alle file
  }
}
// tetto: i pali nei corridoi (uno ogni due negli stadi), poi la falda che va indietro e la fronte (grigia sulla pensilina, nei colori del club negli stadi)
function standRoof(roofT,roofB,front,lv,home,wx){
  if(roofB<BAR-2)return;
  const k0=Math.floor((toWorld(0,0).x-AISLE_OFF)/AISLE_STEP)-1,k1=Math.ceil((toWorld(VW,0).x-AISLE_OFF)/AISLE_STEP)+1,ev=lv>=4?2:1;
  for(let k=k0;k<=k1;k++){
    if(((k%ev)+ev)%ev)continue;
    const x=sxw(AISLE_OFF+k*AISLE_STEP);if(x<-6||x>VW+6)continue;
    const y0=Math.max(BAR,roofB);px(x-1,y0,2,front-y0,'#d5dae3');px(x+1,y0,1,front-y0,'#5d6375');px(x-2,roofB,5,2,'#5d6375');   // palo con la staffa in cima
  }
  const deck=lv>=5?4:(lv>=4?3:2),fas=lv>=4?home:'#aab2c0';
  px(0,roofT,VW,deck,'#4a5163');px(0,roofT,VW,1,wx===2?'#f4f8fc':'#5d6375');
  px(0,roofT+deck,VW,roofB-roofT-deck,fas);px(0,roofT+deck,VW,1,cShade(fas,0.3));px(0,roofB-1,VW,1,cShade(fas,-0.4));
  if(wx===2)px(0,roofT-1,VW,1,'#f4f8fc');   // neve sul tetto
  if(lv>=5)for(let x=-(((CX%10)+10)%10);x<VW;x+=10)px(x,roofB-3,3,1,'#fff4c2');   // i fari sotto la fronte del tetto
}
// grande stadio: i piloni dei fari dietro la tribuna (si vedono sugli schermi alti)
function floodMasts(yb,wx){
  for(const mx of [-4,FIELD_L/3,FIELD_L*2/3,FIELD_L+4]){
    const x=sxw(mx);if(x<-10||x>VW+10)continue;
    const top=Math.max(BAR,yb-34);
    px(x-1,top+5,3,yb-top-5,'#6d7486');for(let y=top+7;y<yb;y+=4)px(x-1,y,3,1,'#9aa1b0');   // traliccio
    px(x-5,top,11,6,PAL.out);px(x-4,top+1,9,4,'#3b4252');for(let i=0;i<3;i++)px(x-3+i*3,top+2,2,2,'#fff4c2');   // la batteria di fari
    if(wx===2)px(x-5,top-1,11,1,'#f4f8fc');
  }
}
// ---------- pubblico ----------
// a che squadra tiene il tifoso al posto wx: i tifosi ospiti (quota V.my) in un angolo in fondo a destra; in campo neutro le due tifoserie si dividono la tribuna
function fanTeam(V,wx,h){
  const hs=vnSide(V),away=1-hs,split=V.v==='N'?-10+(FIELD_L+20)*V.my:FIELD_L+10-clamp(V.my*1.6,0.06,0.6)*(FIELD_L+20);
  let t=V.v==='N'?(wx<split?0:1):(wx>=split?away:hs);
  if(((h>>>11)%10)<3)t=-1;   // non tutti vestono i colori
  return t;
}
// fila di tifosi seduti con i piedi a yb. o: {a,b} tratto di tribuna, seat (seggiolini colorati quando il posto e' vuoto), mosaic, dark (anello in ombra)
function crowdRow(yb,row,V,o){
  o=o||{};if(yb-14>VH||yb<BAR-1)return;   // fila fuori dallo schermo
  const step=1.55,lo=o.a!==undefined?o.a:toWorld(0,0).x-2,hi=o.b!==undefined?o.b:toWorld(VW,0).x+2,k0=Math.floor(lo/step),k1=Math.ceil(hi/step);
  const bt=G.mode==='banner'&&G.banner?G.banner.team:-9,hs=vnSide(V),fill=V.fill*(1-0.05*Math.min(row,6)),lv=vnLv(V);
  const seatC=o.seat?(V.vip?'#4a2f95':cShade(UNI[hs].shirt,-0.3)):'',seatW=V.vip?'#e5b53a':cShade('#e9edf3',-0.15);
  const wave=lv>=3&&G.mode==='ready'&&!V.big?((G.tick*15)%(FIELD_L+70))-35:-999;   // la ola tra un punto e l'altro
  for(let k=k0;k<=k1;k++){
    const h=ihash(k,row*131+7),wx=k*step+(row&1?step/2:0)+((h>>>3)%5)*0.1;if(wx<lo||wx>hi)continue;
    const x=sxw(wx);if(x<-6||x>VW+6)continue;
    if(o.aisle&&aisleNear(wx)*S<aisleHW()+3)continue;   // nei corridoi non si siede nessuno
    if((h%1000)/1000>=fill){   // posto vuoto: il seggiolino (a mosaico nel grande stadio)
      if(o.seat){const c=o.mosaic&&((k>>2)+row)%3===0?seatW:seatC;px(x-2,yb-3,5,3,PAL.out);px(x-1,yb-2,3,2,o.dark?cShade(c,o.dark):c);}
      continue;
    }
    const t=fanTeam(V,wx,h),up=Math.abs(wx-wave)<1.6;
    let hop=0;
    if(bt!==-9)hop=(t===bt||(t<0&&h%4===0))&&Math.sin(G.tick*11+h)>0.2?2:0;
    else if(up)hop=2;else if(Math.sin(G.tick*1.3+h)>0.96)hop=1;
    fanFigure(x,yb-hop,h,V,t,false,{arms:(bt!==-9&&hop&&t===bt)||up,dark:o.dark,far:row>=2,back:o.back});
    if(V.vip&&oroFesta()&&ihash(h,Math.floor(oroT()*5))%23===0){px(x-1,yb-hop-9,2,3,'#ffffff');px(x-2,yb-hop-8,4,1,neon(h));}   // le torce dei telefoni
    if(lv>=4&&bt!==-9&&ihash(h,Math.floor(G.tick*9))%97===0)px(x-1,yb-hop-7,3,2,'#ffffff');   // flash delle macchine fotografiche alla meta
  }
}
// un tifoso: seduto (5x9) o in piedi (5x12, con le gambe). Il tempo decide come e' vestito
function fanFigure(x,y,h,V,t,stand,o){
  o=o||{};
  const wx=G.wx|0,sk=FAN_S[h%4],shirt0=t>=0?UNI[t].shirt:FAN_C[(h>>>2)%8],dk=o.dark||0;
  const col=c=>dk?cShade(c,dk):c;
  const umb=wx===1&&(h>>>6)%100<46,hood=wx===1&&!umb,hat=wx===2&&(h>>>7)%100<64,scarf=wx===2&&t>=0&&(h>>>8)%100<55;
  const shirt=hood?COAT_C[(h>>>9)%6]:(wx===2&&t<0?cShade(shirt0,-0.25):shirt0);
  const top=stand?y-11:y-8,ht=stand?12:9;
  px(x-2,top,5,ht,PAL.out);px(x-1,top-1,3,1,PAL.out);
  // di fronte: capelli e viso; nelle file lontane il viso e' una riga sola; visto da dietro (tribuna vicina) solo capelli
  px(x-1,top,3,3,col(sk));px(x-1,top,3,o.back?3:(o.far?2:1),col(hood?shirt:HAIR_C[(h>>>5)%5]));
  if(hood)px(x-1,top+1,1,2,col(shirt)),px(x+1,top+1,1,2,col(shirt));
  if(hat){const hc=t>=0&&h%3?UNI[t].shirt:FAN_C[(h>>>3)%8];px(x-1,top-1,3,2,col(hc));px(x,top-2,1,1,col('#f4f4f4'));}
  px(x-1,top+3,3,stand?5:4,col(shirt));
  if(scarf)px(x-1,top+3,3,1,col(t>=0?(UNI[t].shorts===UNI[t].shirt?'#f4f4f4':UNI[t].shorts):'#f4f4f4'));
  if(stand){px(x-1,top+8,3,3,col('#2b3142'));px(x,top+9,1,2,PAL.out);}
  if(o.arms){px(x-2,top,1,2,col(sk));px(x+2,top,1,2,col(sk));}
  if(umb){   // ombrello aperto sopra la testa
    const u=UMB_C[(h>>>10)%8],y0=top-4;   // quattro rettangoli soli: in tribuna sono centinaia
    px(x-2,y0-1,5,1,PAL.out);px(x-3,y0,7,2,PAL.out);px(x-2,y0,5,1,col(u));px(x-3,y0+1,7,1,col(cShade(u,-0.18)));px(x,y0+2,1,1,PAL.out);
  }
  if(V.big&&t>=0&&!umb&&h%9===0){   // bandiera che sventola: del club o del paese
    const w=Math.sin(G.tick*5+h)>0?1:0;px(x+2,top-7,1,8,PAL.out);
    if(h%2&&t===vnSide(V))flagPx(x+3,top-7+w,vnLand(V));else{px(x+3,top-7+w,4,3,UNI[t].shirt);px(x+3,top-6+w,4,1,'#f4f4f4');}
  }
}
// bandiere nazionali 4x3 (5x3 per USA e Regno Unito)
function flagPx(x,y,land){
  const V3=(a,b,c)=>{px(x,y,1,3,a);px(x+1,y,2,3,b);px(x+3,y,1,3,c);},H3=(a,b,c)=>{px(x,y,4,1,a);px(x,y+1,4,1,b);px(x,y+2,4,1,c);};
  if(land==='IT')V3('#1f9a4a','#f4f4f4','#d3343a');
  else if(land==='FR')V3('#1f3fa0','#f4f4f4','#d3343a');
  else if(land==='BE')V3('#1a1a1a','#f2c230','#d3343a');
  else if(land==='DE')H3('#1a1a1a','#d3343a','#f2c230');
  else if(land==='UK'){px(x,y,5,3,'#1f3a93');px(x,y+1,5,1,'#f4f4f4');px(x+2,y,1,3,'#f4f4f4');px(x+2,y+1,1,1,'#d3343a');}
  else if(land==='US'){px(x,y,5,3,'#d3343a');px(x,y+1,5,1,'#f4f4f4');px(x,y,2,2,'#1f3a93');}
  else{px(x,y,4,3,'#1f3a93');px(x+1,y+1,2,1,'#f2c230');}
}
// nuvole a pixel nel cielo dei campi senza tribuna alta (si vedono sugli schermi alti): bianche col sole, grigie e basse con la pioggia
function drawClouds(yb,wx){
  const top=BAR+2;if(yb-top<14)return;
  const c1=['#ffffff','#a9b3bf','#e8edf3'][wx],c2=['#dcecf8','#8d97a5','#d3dbe5'][wx],n=wx===1?7:4;
  for(let i=0;i<n;i++){
    const h=ihash(i,301),y=top+((h>>>8)%Math.max(1,ri((yb-top)*0.55))),sp=1.5+(h%5)*0.6,w=18+((h>>>4)%22),span=VW+w*2;
    const x=((((h>>>12)%span)+G.tick*sp-CX*0.15)%span+span)%span-w;   // si muovono piano e scorrono poco con la camera (sono lontane)
    pell(x,y+2,ri(w*0.5),3,c2);pell(x-ri(w*0.15),y,ri(w*0.3),3,c1);pell(x+ri(w*0.2),y+1,ri(w*0.28),2,c1);
  }
}
// tribuna vicina, vista da dietro (sotto i cartelloni in basso: si vede sugli schermi alti). Sui campi piccoli qualcuno in piedi sul prato
function nearStand(y1){
  const V=venueNow(),lv=vnLv(V),yS=y1+30;if(yS-12>VH)return;
  if(lv<=1){
    const step=2.3,k0=Math.floor((toWorld(0,0).x-2)/step),k1=Math.ceil((toWorld(VW,0).x+2)/step);
    for(let k=k0;k<=k1;k++){const h=ihash(k,611);if((h%1000)/1000>=V.fill*0.45)continue;const wx=k*step+((h>>>3)%9)*0.12;fanFigure(sxw(wx),yS+((h>>>9)%3)*3,h,V,fanTeam(V,wx,h),true,{back:true});}
    return;
  }
  const C=V.vip?ORO_STEP:STEP_LV[Math.max(2,lv)],nR=Math.ceil((VH-yS)/5)+2;
  px(0,yS-8,VW,2,'#5d6375');   // il parapetto della tribuna vicina, subito sotto i cartelloni
  for(let r=0;r<Math.min(nR,NEAR_RMAX)&&yS+5*r-12<VH;r++){
    const y=yS+5*r;px(0,y-4,VW,5,cShade(C[r%2],-0.1));px(0,y-4,VW,1,'#8d93a3');
    crowdRow(y,r+20,V,{seat:lv>=3,mosaic:lv>=5,back:true});
  }
  if(nR>NEAR_RMAX){const y=yS+5*NEAR_RMAX;if(y-9<VH)crowdFar(y-9,VH,V,true,-0.1,0,y);}
}
// ---------- pubblico lontano: trama di 4 file x 12 tifosi, ripetuta senza cuciture ----------
// Ogni tifoso e' disegnato anche spostato di una trama (a destra e a sinistra, e la prima fila sotto): la trama si ripete senza teste tagliate.
const crowdTiles=new Map(),CT_W=60,CT_H=20;
function crowdTilePat(V,back,dk){
  const lv=vnLv(V),wx=G.wx|0,hs=vnSide(V),key=[lv,V.vip?1:0,wx,UNI[0].shirt,UNI[1].shirt,back?1:0,dk,ri(V.fill*10),hs].join('|');
  let p=crowdTiles.get(key);if(p)return p;
  const c=document.createElement('canvas');c.width=CT_W;c.height=CT_H;const g=c.getContext('2d'),save=ctx,Vt=Object.assign({},V,{big:false});
  ctx=g;
  try{
    const C=V.vip?ORO_STEP:STEP_LV[Math.max(2,lv)],seatC=V.vip?'#4a2f95':cShade(UNI[hs].shirt,-0.3);
    for(const yb of [5,10,15,20,25]){   // dall'alto in basso: la fila sotto copre la testa di quella sopra; 25 = la fila 5 della trama sotto
      const r=(yb/5)%4;
      px(0,yb-4,CT_W,5,cShade(C[r%2],dk-(back?0.1:0)));px(0,yb-4,CT_W,1,cShade('#a7adbb',dk));
      for(let i=0;i<12;i++){
        const h=ihash(i+r*12,977+lv),x=i*5+2+(r&1?2:0);
        for(const ox of [0,-CT_W,CT_W]){
          if((h%1000)/1000>=V.fill){if(lv>=3){px(x+ox-2,yb-3,5,3,PAL.out);px(x+ox-1,yb-2,3,2,cShade(seatC,dk));}continue;}
          const t=(h>>>11)%10<3?-1:((h>>>14)%10<8?hs:1-hs);
          fanFigure(x+ox,yb,h,Vt,t,false,{dark:dk,far:true,back});
        }
      }
    }
  }finally{ctx=save;}
  if(crowdTiles.size>24)crowdTiles.clear();
  p=ctx.createPattern(c,'repeat');crowdTiles.set(key,p);return p;
}
// riempie [ya,yb) con la trama; la riga di base delle file coincide con quella delle file disegnate una per una (ref)
function crowdFar(ya,yb,V,back,dk,bounce,ref){
  const p=crowdTilePat(V,back,dk);if(!p||yb<=ya)return;
  const base=ref!==undefined?ref:yb,ty=((base-CT_H)%CT_H+CT_H)%CT_H+bounce;
  ctx.save();ctx.beginPath();ctx.rect(0,ya,VW,yb-ya);ctx.clip();
  ctx.translate(-(((CX%CT_W)+CT_W)%CT_W),ty-CT_H);ctx.fillStyle=p;ctx.fillRect(0,ya-ty,VW+2*CT_W,yb-ya+2*CT_H);ctx.restore();
}
