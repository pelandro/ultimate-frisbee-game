/* ===================== GRAFICA PIXEL-ART (stile Retro Bowl) =====================
   Tutto il campo si disegna in un buffer a bassa risoluzione (circa 224 pixel di altezza) che poi viene ingrandito senza sfumature:
   ogni pixel del gioco e' un quadratino netto sullo schermo. Niente curve morbide: solo rettangoli a coordinate intere. */
const PAL={out:'#161a2b',grass:'#8ab66b',grass2:'#83af64',dot:'#a8cb8d',apron:'#6f9c58',apron2:'#648f4f',line:'#f6f8f2',dim:'#b7d6a0',num:'#a3c888',
  blueZ:'#6f9ad2',redZ:'#d7826f',gold:'#ffd23f',green:'#4fe58f',red:'#ff6b70',sky:'#7fd8ff'};
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
    else if(p.t==='spark'){px(x,y-p.z*S*0.5,k>0.5?2:1,k>0.5?2:1,k>0.5?(p.c||'#fff3b0'):(p.c2||'#ffd23f'));}   // c, c2: scintille colorate (superpoteri)
    else if(p.t==='smoke'){   // bomba di fumo dei superpoteri: sbuffi che si gonfiano in fretta, poi si sfaldano
      const a=1-k,g=1-(1-Math.min(1,a*6))**2,sh=k<0.35?k/0.35:1,r=Math.max(1,p.r*(0.55+0.45*g)*S*sh),yy=y-p.z*S*0.5;
      pell(x,yy+r*0.15,r,r*0.75,p.c2||'#9aa4b3');pell(x-r*0.12,yy-r*0.1,r*0.8,r*0.6,p.c||'#d9dee6');if(r>3)pell(x-r*0.35,yy-r*0.3,r*0.35,r*0.28,'#f4f6f9');
    }
    else if(p.t==='blade'){const yy=y-p.z*S*0.5;px(x,yy-1,1,3,PAL.out);px(x,yy,1,2,k>0.5?PAL.dim:PAL.grass2);}   // zolla d'erba alzata dal disco
    else if(p.t==='pop'){   // presa: un anello quadrato che si apre in 4 scatti attorno alle mani
      const st=Math.min(3,((1-k)*4)|0),r=3+st*2,yy=ri(y-p.z*S*0.5),c=st<2?(p.c||'#ffffff'):'#d9ecc8';
      if(st<3){px(x-r,yy-r,2*r+1,1,c);px(x-r,yy+r,2*r+1,1,c);px(x-r,yy-r,1,2*r+1,c);px(x+r,yy-r,1,2*r+1,c);}
      else for(const d of [[-1,-1],[1,-1],[-1,1],[1,1]])px(x+d[0]*r,yy+d[1]*r,1,1,c);
    }
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
// colori del pubblico (le tribune e i tifosi stanno in 17-stadi-pubblico.js)
const FAN_C=['#2f7bff','#ff4b4b','#ffd23f','#f4f4f4','#3fd183','#b36bff','#ff9a3a','#273043'],FAN_S=['#f0c9a4','#d9a47a','#a56e45','#f6d7ba'];
/* ---- divise e campi: tu sei sempre in blu e l'avversaria in rosso, ma ogni squadra ha la sua variante (tonalita', pantaloncini, calzettoni);
   anche il campo cambia aspetto da una partita all'altra (erba piu' fresca o piu' secca, bordo in terra). Tutto deriva dai nomi: e' sempre uguale per la stessa sfida ---- */
const KITS=[[{shirt:'#2f7bff',shorts:'#f2f5fa',socks:'#2f7bff'},{shirt:'#1f5fd0',shorts:'#172554',socks:'#f2f5fa'},{shirt:'#3aa0ff',shorts:'#f2f5fa',socks:'#f2f5fa'},{shirt:'#2a4fb8',shorts:'#ffd23f',socks:'#2a4fb8'},{shirt:'#2f7bff',shorts:'#101827',socks:'#101827'}],
  [{shirt:'#ff4b4b',shorts:'#1f2740',socks:'#ff4b4b'},{shirt:'#d93636',shorts:'#f2f5fa',socks:'#d93636'},{shirt:'#ff6a3d',shorts:'#1f2740',socks:'#1f2740'},{shirt:'#c22d55',shorts:'#f2f5fa',socks:'#f2f5fa'},{shirt:'#ff4b4b',shorts:'#101010',socks:'#ffd23f'}]];
const KIT_AWAY={shirt:'#f2f5fa',shorts:'#1f2740',socks:'#f2f5fa'};
// prati saturi come nei giochi a 16 bit (prima erano verdi slavati): classico, verde-azzurro, secco d'estate, vecchio campo con il bordo in terra
const VENUES=[{grass:'#5ba348',grass2:'#4f9440',dot:'#72b85d',apron:'#3f8436',apron2:'#37752f',dim:'#e4f0d8',num:'#eef6e6'},
  {grass:'#4e9c58',grass2:'#448e4e',dot:'#66b06e',apron:'#367f43',apron2:'#2f703b',dim:'#dff0dc',num:'#ebf6e8'},
  {grass:'#7aa646',grass2:'#6e983e',dot:'#8fb85a',apron:'#5f8a39',apron2:'#547b32',dim:'#eef3d8',num:'#f4f7e6'},
  {grass:'#5a9845',grass2:'#4f8b3d',dot:'#6fab58',apron:'#8a6c4c',apron2:'#7a5e42',dim:'#e2eed6',num:'#edf5e4'}];
let lookKey='';
function matchLook(){
  const on=!!G.inMatch,V=venueNow(),uk=on&&typeof utKitNow==='function'?utKitNow():null,key=(on?(G.myName||'')+'|'+(G.oppName||''):'')+'|'+V.home+'|'+V.v+'|'+V.tier+'|'+vnLv(V)+'|'+V.care+'|'+(G.wx|0)+'|'+(uk?uk.shirt+uk.shorts+uk.socks+uk.shirtB+uk.pat:'');if(key===lookKey)return;lookKey=key;   // anche il tempo: con la pioggia il prato e' piu' scuro
  Object.assign(UNI[0],{pat:'',shirtB:''},uk||KITS[0][on&&G.myName?hashStr('kit|'+G.myName)%KITS[0].length:0]);   // in Ultimate Team la divisa la scegli tu (Equipaggiamento), anche a motivi (pat, shirtB)
  Object.assign(UNI[1],uk&&uk.hot?KIT_AWAY:KITS[1][on&&G.oppName?hashStr('kit|'+G.oppName)%KITS[1].length:0]);   // se ti vesti di rosso o arancione l'avversaria gioca in bianco
  Object.assign(PAL,venuePal());grassPat=null;   // prato del club di casa (17-stadi-pubblico.js)
  PAL.blueZ=ezColor(0);PAL.redZ=ezColor(1);   // mete piene nel colore delle due divise di oggi
  PAL.tick=cMix(PAL.dim,PAL.grass,0.5);   // le tacche ogni 2 m: piu' discrete delle linee
}
// colore della meta: la maglia della squadra (i pantaloncini se la maglia e' bianca), un po' piu' scura e appena velata dal verde del prato
// la vernice ha saturazione e luce contenute (una meta blu elettrico copriva tutto il resto) e prende un po' del verde del prato: sta nella tavolozza del campo
function ezColor(t){
  const V=venueNow(),u=UNI[t],c=cLum(u.shirt)>0.78?u.shorts:u.shirt,hsl=rgb2hsl(cRgb(c));
  const p=hsl2hex(hsl[0],Math.min(hsl[1],0.62),clamp(hsl[2],0.33,0.5)),z=cMix(p,PAL.grass,fieldKind(V)===0?0.5:0.1+0.36*fieldWear(V));
  const wx=G.wx|0;return wx===2?cMix(z,'#eef3f8',0.22):(wx===1?cShade(z,-0.14):z);   // sui campi poveri la vernice e' sbiadita (sulla terra resta appena un velo di colore); con la neve piu' chiara, bagnata piu' scura
}
// Stesso stemma dei menu, disegnato sulla griglia del campo senza immagini o filtri.
function crestPx(cx,cy,w,name,alpha){clubDraw(cx,cy,w,name,alpha);}
/* IL CAMPO, dal basso verso l'alto: bordo campo, prato tagliato, mete piene, ciuffi d'erba, usura, neve o pozzanghere, stemma, scritte, linee;
   poi tutto quello che sta fuori: tribuna (in alto), panchine e cartelloni (in basso), fotografi e cumuli dietro le mete (24-bordocampo-persone.js).
   Tre tipi di campo (fieldKind, 22-campo-retro.js): terra battuta senza le linee delle distanze (livelli 0-1), prato consumato senza i numeri (2-3),
   prato curato con linee e numeri (4-5). Sui campi poveri (fieldWear) le linee sono di gesso e le mete sbiadite */
function drawField(){
  matchLook();
  const V=venueNow(),lv=vnLv(V),wx=G.wx|0,x0=sxw(0),x1=sxw(FIELD_L),y0=syw(0),y1=syw(FIELD_W),H=y1-y0,gl=sxw(EZ),gr=sxw(FIELD_L-EZ);
  px(0,0,VW,VH,PAL.apron);
  // bordo campo: fascia piu' scura in basso, dietro le panchine (quella in alto e' la tribuna, disegnata da drawStands)
  px(0,y1+21,VW,VH,PAL.apron2);
  const fw=fieldWear(V),fk=fieldKind(V);
  if(wx===2){const t=snowTexture();patFill(t,0,0,VW,y0,24);patFill(t,0,y1,VW,VH-y1,24);patFill(t,0,y0,x0,H,24);patFill(t,x1,y0,VW-x1,H,24);}
  else if(fk<2)patFill(tuftPattern(0,fw),0,y1,VW,VH-y1,24);   // erba alta attorno ai campi poveri
  // prato tagliato secondo il club di casa: strisce, strisce larghe, quadri o sintetico (17-stadi-pubblico.js)
  drawMow(y0,H);
  const blueRight=G.dir[0]>0;
  px(x0,y0,gl-x0,H,blueRight?PAL.redZ:PAL.blueZ);px(gr,y0,x1-gr,H,blueRight?PAL.blueZ:PAL.redZ);
  if(fk>0){ezMow(x0,y0,gl-x0,H,true);ezMow(gr,y0,x1-gr,H,false);}   // mete nel colore della squadra, con le strisce del taglio (25b-scritte-dipinte.js)
  if(fk===0)patFill(dirtPattern(turfCover(V)),x0,y0,x1-x0,H,40);   // terra battuta: granelli, sassolini, qualche filo d'erba (anche nelle mete)
  else if(mowKind(V)!==3)patFill(tuftPattern(lv,wx===2?0:fw),gl,y0,gr-gl,H,24);   // ciuffi d'erba (non sul sintetico), con la terra che si vede sui campi poveri
  drawWear();   // erba consumata sui campi poveri (fango con la pioggia)
  standShadow(y0);   // con il sole, l'ombra della tribuna sul bordo lontano
  // a centrocampo lo stemma della squadra di casa (in campo neutro il nome della manifestazione)
  drawCenterMark();
  // scritta nelle mete: il nome della squadra che segna in quella meta (Blu e Rossi quando i nomi non ci sono), dipinto a blocchi lungo la meta.
  // Va a capo fino a tre righe scegliendo le lettere piu' grandi che ci stanno, sempre centrato (blockFit, 25b-scritte-dipinte.js)
  const nmB=G.inMatch&&G.myName?G.myName:'BLU',nmR=G.inMatch&&G.oppName?G.oppName:'ROSSI';
  if(!titleBg())for(const z of [[EZ/2,blueRight?nmR:nmB,-1,blueRight?PAL.redZ:PAL.blueZ],[FIELD_L-EZ/2,blueRight?nmB:nmR,1,blueRight?PAL.blueZ:PAL.redZ]])   // nel menu iniziale le mete restano senza scritte
    ezPaintName(String(z[1]).replace(/ \([ABC]\)$/,''),z[0],z[2],z[3],fk===0?1:fw);
  // linee ogni 8 m e tacche ogni 2 m: non sulla terra battuta. I numeri della distanza dalla linea di meta (aiutano a misurare i lanci) solo negli stadi
  // e nelle prove. Sui campi poveri le linee sono di gesso: qualche buco qua e la'
  const chalk=fw>0.6,nums=fk===2||!!G.drill;
  if(fk>0){
    for(let k=1;k<8;k++){
      const x=sxw(EZ+k*8);
      if(chalk){for(let y=y0;y<y1;y+=6){const g=ihash(k,y-y0)%5===0;px(x,y,1,g?3:6,PAL.dim);}}else px(x,y0,1,H,PAL.dim);
      if(nums)paintYardNum(Math.min(k,8-k)*8,EZ+k*8);   // numeri a blocchi dipinti (25b-scritte-dipinte.js)
    }
    for(let m=EZ+2;m<FIELD_L-EZ;m+=2){
      const x=sxw(m);px(x,y0+2,1,2,PAL.tick);px(x,y1-4,1,2,PAL.tick);
      px(x,syw(FIELD_W/3)-1,1,2,PAL.tick);px(x,syw(FIELD_W*2/3)-1,1,2,PAL.tick);
    }
  }
  // perimetro e linee di meta
  px(x0-1,y0-1,x1-x0+2,2,PAL.line);px(x0-1,y1-1,x1-x0+2,2,PAL.line);px(x0-1,y0,2,H,PAL.line);px(x1-1,y0,2,H,PAL.line);
  px(gl-1,y0,2,H,PAL.line);px(gr-1,y0,2,H,PAL.line);
  if(chalk)for(const yy of [y0-1,y1-1])for(let x=x0;x<x1;x+=7)if(ihash(x-x0,yy)%6===0)px(x,yy,1,2,PAL.grass2);   // gesso consumato
  // brick
  for(const bx of [EZ+18,FIELD_L-EZ-18]){const x=sxw(bx),y=syw(MID);for(let i=-2;i<=2;i++){px(x+i,y+i,1,1,PAL.line);px(x+i,y-i,1,1,PAL.line);}}
  if(wx===1)drawPuddles();   // l'acqua copre anche le linee
  drawStands(y0);
  drawSideline(y1);
  drawEnds();   // dietro le mete: fotografi, borse, cumuli di neve (24-bordocampo-persone.js)
  const fl=cornerFlags();   // negli stadi e nelle partite importanti agli angoli ci sono le bandierine
  for(const c of [[0,0],[0,FIELD_W],[FIELD_L,0],[FIELD_L,FIELD_W],[EZ,0],[EZ,FIELD_W],[FIELD_L-EZ,0],[FIELD_L-EZ,FIELD_W]])(fl&&(c[0]===0||c[0]===FIELD_L)?cornerFlag:cone)(sxw(c[0]),syw(c[1]));
}
// sagoma fatta di righe orizzontali [x0, y, w]: la si allarga di 'g' pixel con gli angoli smussati (g=1 contorno, g=2 alone)
function spanGrow(rows,g,c){
  ctx.fillStyle=c;
  for(const r of rows)ctx.fillRect(r[0]-g,r[1],r[2]+2*g,1);
  const t=rows[0],b=rows[rows.length-1];
  for(let k=1;k<=g;k++){ctx.fillRect(t[0]-(g-k),t[1]-k,t[2]+2*(g-k),1);ctx.fillRect(b[0]-(g-k),b[1]+k,b[2]+2*(g-k),1);}
}
// DISCO a pixel: sz 0 in mano (7x3), 1 in volo basso (9x3), 2 in volo alto (11x4, piu' vicino alla camera); tl = inclinazione (-1, 0, 1) nei lanci a curva;
// inv = disco capovolto (hammer: si vede la pancia). L'alone scuro lo stacca dal prato e dalla pioggia
function pdiscSprite(x,y,spin,sz,tl,inv){
  x=ri(x);y=ri(y);sz=sz|0;tl=tl|0;
  const W=sz===2?11:(sz===1?9:7),H=sz===2?4:3,h0=-(H>>1),rows=[];
  for(let r=0;r<H;r++){const sh=H===4?(r<2?tl:-tl):(r===0?tl:(r===H-1?-tl:0));rows.push([x-(W>>1)+sh,y+h0+r,W]);}
  if(sz)spanGrow(rows,2,'rgba(22,26,43,.42)');
  spanGrow(rows,1,PAL.out);
  const top=inv?'#b9c6d8':'#ffffff',bot=inv?'#ffffff':'#b9c6d8';
  rows.forEach((r,i)=>{px(r[0],r[1],r[2],1,i===H-1?bot:'#f6f8f4');});
  px(rows[0][0]+1,rows[0][1],W-2,1,top);   // riflesso in alto, senza toccare gli spigoli
  const m=rows[H>>1];px(m[0]+((spin|0)%(W-2)+(W-2))%(W-2),m[1],2,1,'#7f9bd0');
}
const PH=()=>20;   // altezza dello sprite in pixel: la pixel-art non si scala
// ---- omino a pixel: testa, busto, pantaloncini, arti spessi 2 pixel; contorno scuro attorno a tutta la sagoma ----
const lookOf=pl=>(pl&&pl.look)||DEF_LOOK;
// CORSA a 6 fotogrammi (mezzo ciclo = 3, poi le gambe si scambiano): [piede d'appoggio avanti/indietro, piede in volo avanti/indietro, alzata del piede in volo, molleggio del corpo (+ = giu')].
// Appoggio (corpo basso), passaggio (ginocchio alto), spinta (corpo in aria): a 20 pixel sono le pose chiave che danno peso al passo
const RUN_F=[[2,-3,1,1],[0,0,3,0],[-3,3,2,-1]];
// ex: {brk: frenata, view: 0 di lato, 1 di schiena, 2 di fronte, kind: tipo di lancio, ca: secondi dalla presa (o -1)}. Restituisce la posizione della mano vicina (il disco la segue)
function puppet(x,y,un,lk,f,pose,ph,run,arm,ex){
  x=ri(x);y=ri(y);ex=ex||{};
  const ops=[],R=(a,b,w,h,c)=>ops.push(a,b,w,h,c);
  const Lm=(ax,ay,bx,by,c,c2,cut)=>{   // arto: quadratini 2x2 lungo la linea; da 'cut' in poi il secondo colore
    const n=Math.max(Math.abs(bx-ax),Math.abs(by-ay))||1;
    for(let i=0;i<=n;i++){const u=i/n;R(ri(ax+(bx-ax)*u),ri(ay+(by-ay)*u),2,2,(c2&&u>=cut)?c2:c);}
  };
  const skin=lk.skin,skin2=shade(skin,-0.16),hair=lk.hair,shirt=un.shirt,shirt2=shade(shirt,-0.22),sock2=shade(un.socks,-0.22),shoe2=shade(un.shoe,0.12);
  const cp=pose==='cel'?(ex.cp||{}):null;   // posa delle esultanze (20-ui/27-esultanze.js): mani, gambe, salto, accovacciata e vista date da fuori
  const moving=!cp&&run>0.18,fast=run>0.45,view=moving?(ex.view|0):(cp?(cp.view|0):(ex.view===2?2:0)),cheer=pose==='cheer',mark=pose==='mark';
  const fr=moving?((Math.floor(ph/(Math.PI*2)*6)%6)+6)%6:0,half=fr>=3?1:0,RF=RUN_F[fr%3],k=fast?1:0.6;
  const hop=cheer?(Math.sin(G.tick*12+x*0.7)>0?3:0):(pose==='jump'?ri(10*Math.sin(Math.PI*clamp(arm,0,1))):(cp?ri(cp.hop||0):0));
  // lancio in tre tempi (tu: 0 rilascio, 0,22 accompagnamento, 0,6 recupero); lungo = passo e slancio piu' ampi; pw = forza del caricamento quando miri
  const tu=pose==='throw'?1-clamp(arm,0,1):0,lg=!!ex.long,pw=pose==='aim'?clamp(ex.pow||0,0,1):0,cka=ex.ca>=0?ex.ca:-1;
  // gesti esagerati (a 20 pixel un gesto piccolo non si vede): il corpo si abbassa nei momenti di forza
  const crouch=(ex.land?2:0)+(pose==='aim'?(pw>0.7?2:(pw>0.35?1:0)):0)+(pose==='throw'&&tu<0.25?(lg?2:1):0)+(pose==='throw'&&(ex.kind==='hammer'||ex.kind==='scoober')&&tu>=0.25&&tu<0.6?1:0)
    +(pose==='one'&&cka<0.2?2:0)+(pose==='clap'&&cka>=0.1&&cka<0.24?1:0);
  const breathe=!moving&&!cheer&&!cp&&pose!=='jump'&&Math.sin(G.tick*2.4+x*0.37)>0.55?1:0;   // da fermo il busto respira (un pixel), ognuno col suo tempo
  const dyB=(moving?ri(RF[3]*k):(mark?1:(cp?ri(cp.crouch||0):0)))+(cp?0:crouch),gy=y-hop,by=gy+dyB,sy=by-14+breathe,T=by-20+breathe+(pose==='sad'?1:0);
  const caught=ex.ca>=0&&ex.ca<0.3,recoil=caught&&ex.ca>0.08&&ex.ca<0.22?-f:0;   // presa: un pixel di rinculo all'indietro
  let lean=fast?f:0;if(ex.brk&&moving)lean=-f;if(pose==='aim')lean=-f;if((pose==='throw'&&tu<0.6)||pose==='one'||pose==='runcatch')lean=f;if(cp)lean=ri(cp.lean||0)*f;lean+=recoil;
  // GAMBE: quella lontana (dietro) e' piu' scura, cosi' si capisce quale va avanti
  for(const i of [-1,1]){
    const far=i<0,hx=x-1+(i>0?1:-1),sk=far?skin2:skin,so=far?sock2:un.socks,sh=far?shoe2:un.shoe;
    let dx=0,lift=0;
    if(cp&&cp.lg){const L=cp.lg[i<0?0:1];dx=ri(L[0])*(cp.ab?1:f);lift=ri(L[1]);}   // cp.ab: x sullo schermo (vista di fronte), altrimenti in avanti
    else if(moving&&view===0){const planted=(i<0)===(half===0);dx=ri((planted?RF[0]:RF[1])*k)*f;lift=planted?0:ri(RF[2]*(fast?1:0.67));}
    else if(moving){const planted=(i<0)===(half===0);lift=planted?0:(fr%3===1?3:1);}   // di schiena o di fronte: le gambe salgono e scendono sul posto
    else if(pose==='throw')dx=(i>0?(tu<0.25?(lg?6:5):(tu<0.6?4:2)):-(tu<0.25?(lg?5:4):(tu<0.6?3:1)))*f;   // lancio: affondo in avanti, poi la gamba dietro rientra
    else if(pose==='aim')dx=(i>0?2+ri(3*pw):-(2+ri(2*pw)))*f;   // caricamento: le gambe si allargano con la forza
    else if(pose==='one')dx=(i>0?(cka<0.2?5:3):-(cka<0.2?4:2))*f;   // presa a una mano: affondo
    else if(pose==='jump'){dx=i>0?f:-f;lift=3;}   // salto: gambe raccolte
    else if(mark)dx=i*2;   // marcatore: gambe larghe e corpo basso
    else dx=i>0?2:-1;   // da fermo: un pixel di prato tra i piedi, le gambe non si fondono
    const fx=hx+dx,fy=gy-2-lift;
    if(lift>=2){const kx=hx+ri(dx/2)+f*(view===0?1:0),ky=by-3-(lift>2?1:0);Lm(hx,by-6,kx,ky,sk);Lm(kx,ky,fx,fy,sk,so,0.25);}   // ginocchio piegato
    else Lm(hx,by-6,fx,fy,sk,so,0.62);
    const sx0=view!==0?fx:(f>0?fx:fx-1),sw=view!==0?2:3;R(sx0,fy,sw,2,sh);R(view!==0?sx0:(f>0?sx0:sx0+1),fy,sw-1,1,shade(sh,0.2));
  }
  const shx=x-1+lean;
  // BRACCIA: di corsa vanno in opposizione alle gambe; il lancio ha caricamento, rilascio e accompagnamento diversi per rovescio, dritto e hammer
  const kind=ex.kind||'backhand';
  const runHand=i=>{
    if(view!==0){const up=((i<0)===(half===0))?1:0;return [x-1+i*4,sy+5-up];}
    const planted=(i<0)===(half===0),ldx=ri((planted?RF[0]:RF[1])*k);
    return [shx+ri(-ldx*0.8)*f+(fast&&i>0?f:0),sy+5-(fast&&Math.abs(ldx)>1?1:0)];
  };
  const hand=i=>{   // i = 1 braccio vicino, -1 braccio lontano
    if(cp&&cp.h){const q=cp.h[i>0?0:1];return [shx+ri(q[0])*(cp.ab?1:f),sy+ri(q[1])];}
    if(pose==='aim'){   // caricamento: il braccio va indietro, piu' indietro quanto piu' forte tiri (rovescio: attraverso il corpo; dritto: di lato e basso; hammer: sopra la testa)
      const bk=ri(4*pw),tr=pw>0.9&&Math.sin(G.tick*40)>0?1:0;   // al massimo della forza il braccio trema
      if(kind==='hammer'||kind==='scoober')return i>0?[shx-f*(1+ri(2*pw)),sy-7-ri(2*pw)-tr]:[shx+f*(3+ri(2*pw)),sy+4];
      if(kind==='forehand')return i>0?[shx-f*(4+bk)-tr*f,sy+7]:[shx+f*(3+ri(2*pw)),sy+4];
      return i>0?[shx-f*(5+bk)-tr*f,sy+3-ri(pw)]:[shx+f*(3+ri(2*pw)),sy+4];
    }
    if(pose==='throw'){
      const L=lg?1:0;
      if(tu<0.25){   // rilascio, tenuto un istante: braccio teso fino in fondo verso il bersaglio, l'altro indietro
        if(kind==='hammer'||kind==='scoober')return i>0?[shx+f*(4+L),sy-9]:[shx-f*4,sy+4];
        if(kind==='forehand')return i>0?[shx+f*(8+L),sy+5]:[shx-f*4,sy+4];
        return i>0?[shx+f*(8+L),sy+2]:[shx-f*5,sy+3];
      }
      if(tu<0.6){   // accompagnamento ampio: rovescio fin sopra la testa, dritto attraverso il corpo fino all'anca, hammer giu' fino al ginocchio
        if(kind==='hammer'||kind==='scoober')return i>0?[shx+f*6,sy+9]:[shx-f*3,sy+4];
        if(kind==='forehand')return i>0?[shx-f*3,sy+7]:[shx-f*4,sy+2];
        return i>0?[shx+f*5,sy-8]:[shx-f*4,sy+5];
      }
      return i>0?[shx+f*3,sy+6]:[shx-f*1,sy+6];   // recupero
    }
    if(pose==='hold')return i>0?[shx+f*4,sy+5]:[shx-f*1,sy+6];
    if(mark){const w=Math.sin(G.tick*9+x)>0?1:0;return i>0?[shx+f*5,sy-2-w]:[shx+f*4,sy+6+w];}
    // PRESE: ognuna ha il suo gesto, poi il disco torna al petto (prima tornava al petto dopo 0,08 s e il gesto non si vedeva)
    const ca=ex.ca,cpo=pose==='reach'||pose==='jump'||pose==='one'||pose==='clap'||pose==='runcatch';
    if(cpo&&ca>=(pose==='jump'?0.3:(pose==='one'?0.2:(pose==='clap'?0.24:0.14))))return i>0?[shx+f*3,sy+3]:[shx+f*2,sy+4];
    if(pose==='clap')return ca<0.1?(i>0?[shx+f*6,sy-2]:[shx+f*6,sy+9]):(i>0?[shx+f*5,sy+3]:[shx+f*5,sy+4]);   // a tenaglia: mani ben aperte una sopra e una sotto, poi si chiudono
    if(pose==='runcatch')return i>0?[shx+f*8,sy+1]:[shx+f*7,sy+4];   // in corsa: braccia tese avanti fino in fondo
    if(pose==='jump')return i>0?[shx+f*2,sy-10]:[shx,sy-10];   // in salto: braccia tutte in alto
    if(pose==='one')return i>0?[shx+f*8,sy-6]:[shx-f*5,sy+2];   // a una mano: braccio teso in affondo, l'altro indietro per l'equilibrio
    if(pose==='reach')return i>0?[shx+f*3,sy-6]:[shx+f*1,sy-5];
    if(cheer)return i>0?[shx+3,sy-6]:[shx-3,sy-6];
    if(pose==='sad')return i>0?[shx+f,sy+7]:[shx-f,sy+7];
    return moving?runHand(i):[shx+(i>0?f:-f),sy+6];
  };
  // braccio lontano (dietro al busto, piu' scuro)
  let h=hand(-1);Lm(shx,sy+1,h[0],h[1],shirt2,skin2,0.45);
  // pantaloncini e busto
  R(x-3,by-8,6,2,un.shorts);
  R(x-3+lean,sy,6,6,shirt);
  if(view===0)R(f>0?x-3+lean:x+2+lean,sy,1,6,shirt2);else R(x-3+lean,sy,1,6,shirt2);
  R(x-3+lean,sy+5,6,1,shirt2);
  if(un.pat){const sB=un.shirtB,sB2=shade(sB,-0.22);for(let j=0;j<6;j++)for(let i=0;i<6;i++)if(eqPatHit(un.pat,((view===0&&f<0?5-i:i)+0.5)/6,(j+0.5)/6))R(x-3+lean+i,sy+j,1,1,j===5||(view===0?(f>0?i===0:i===5):i===0)?sB2:sB);}   // maglia a motivi (Equipaggiamento di Ultimate Team), con le stesse ombre
  // TESTA: di lato (capelli dietro, occhio davanti), di schiena (solo capelli) o di fronte (due occhi)
  const hx0=x-3+lean+(view===0?f:0),bk=f>0?hx0:hx0+4,bald=lk.style===4;
  if(ex.hero&&HERO_DRAW[ex.hero])HERO_DRAW[ex.hero](R,{x,gy,by,sy,T,hx0,f,view,lean,fast,skin,skin2,hair,shirt});   // superpoteri (20-ui/20-superpoteri.js): testa, collo, coda o tentacoli dell'animale
  else{
  R(hx0+1,T,4,1,skin);R(hx0,T+1,6,4,skin);R(hx0+1,T+5,4,1,skin);
  if(view===1){
    if(bald){R(hx0+1,T,4,1,skin2);R(hx0,T+1,6,3,skin2);}
    else{R(hx0+1,T,4,1,hair);R(hx0,T+1,6,4,hair);if(lk.style===2)R(hx0,T+5,6,1,hair);if(lk.style===3)R(hx0+2,T+5,2,3,hair);}
    if(lk.band)R(hx0,T+2,6,1,lk.band);
  }else{
    if(bald){R(hx0+1,T,4,1,skin2);if(view===0)R(bk,T+1,2,1,skin2);}
    else{
      R(hx0+1,T,4,1,hair);R(hx0,T+1,6,1,hair);
      if(view===0){R(bk,T+2,2,lk.style===0?1:(lk.style===1?3:(lk.style===2?6:2)),hair);if(lk.style===3)R(f>0?hx0-2:hx0+6,T+2+(fast&&Math.sin(ph)>0?1:0),2,3,hair);}
      else if(lk.style>=1){R(hx0,T+2,1,lk.style===2?4:2,hair);R(hx0+5,T+2,1,lk.style===2?4:2,hair);}
    }
    if(lk.band)R(hx0,T+1,6,1,lk.band);
    if(lk.beard){const bc=shade(hair,-0.15);R(hx0+1,T+5,4,1,bc);R(view===0?(f>0?hx0+3:hx0):hx0+1,T+4,view===0?3:4,1,bc);}
    if(view===0)R(f>0?hx0+4:hx0+1,T+3,1,1,PAL.out);else{R(hx0+1,T+3,1,1,PAL.out);R(hx0+4,T+3,1,1,PAL.out);}
  }
  }
  // braccio vicino (davanti al busto): dove l'avambraccio passa sulla maglia ha una linea scura dietro e un tono piu' scuro davanti, cosi' si legge come
  // braccio e non come una striscia color pelle sulla maglia (il contorno scuro generale e' sotto al busto, li' non si vede)
  h=hand(1);
  {const tx0=x-3+lean,tx1=x+2+lean,ax=shx,ay=sy+1,n=Math.max(Math.abs(h[0]-ax),Math.abs(h[1]-ay))||1;
   for(let i=0;i<=n;i++){const u=i/n;if(u<0.45)continue;const qx=ri(ax+(h[0]-ax)*u),qy=ri(ay+(h[1]-ay)*u);
     for(const [ex_,c] of [[f>0?qx-1:qx+2,PAL.out],[f>0?qx+2:qx-1,shirt2]])for(const ey of [qy,qy+1])if(ex_>=tx0&&ex_<=tx1&&ey>=sy&&ey<=sy+5)R(ex_,ey,1,1,c);}}
  Lm(shx,sy+1,h[0],h[1],shade(shirt,0.14),skin,0.45);   // manica un tono piu' chiara della maglia: il braccio vicino si stacca dal busto
  if(ex.sc&&ex.sc!==1){const k=ex.sc;for(let i=0;i<ops.length;i+=5){const a=ri(x+(ops[i]-x)*k),b=ri(y+(ops[i+1]-y)*k),a2=ri(x+(ops[i]+ops[i+2]-x)*k),b2=ri(y+(ops[i+1]+ops[i+3]-y)*k);ops[i]=a;ops[i+1]=b;ops[i+2]=Math.max(1,a2-a);ops[i+3]=Math.max(1,b2-b);}h=[ri(x+(h[0]-x)*k),ri(y+(h[1]-y)*k)];}   // eroi dei superpoteri piu' grandi: i rettangoli si allargano attorno ai piedi, i pixel restano netti
  ctx.fillStyle=PAL.out;for(let i=0;i<ops.length;i+=5)ctx.fillRect(ops[i]-1,ops[i+1]-1,ops[i+2]+2,ops[i+3]+2);
  for(let i=0;i<ops.length;i+=5){ctx.fillStyle=ops[i+4];ctx.fillRect(ops[i],ops[i+1],ops[i+2],ops[i+3]);}
  return h;
}
// omino in tuffo: disteso in orizzontale, braccia tese in avanti
function puppetDive(x,y,un,lk,d,lift){
  x=ri(x);y=ri(y)-ri(lift);
  const ops=[],R=(a,w,b,h,c)=>ops.push(d>0?x+a:x-a-w,y+b,w,h,c);   // a = distanza in avanti lungo la direzione del tuffo
  const skin=lk.skin;
  R(-11,5,-4,2,skin);R(-13,3,-4,2,un.shoe);R(-10,4,-2,2,skin);R(-12,3,-2,2,un.shoe);   // gambe e scarpe
  R(-6,4,-6,4,un.shorts);R(-2,7,-6,4,un.shirt);if(un.pat)for(let j=0;j<4;j++)for(let i=0;i<7;i++)if(eqPatHit(un.pat,(j+0.5)/4,(6.5-i)/7))R(-2+i,1,-6+j,1,un.shirtB);R(-2,7,-3,1,shade(un.shirt,-0.22));   // pantaloncini e busto (a motivi: il busto e' disteso)
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
  if(p.cfx&&G.tick<p.cfx.until){const k=p.cfx.k;return k==='salto'?'jump':k==='mano'?'one':k==='semplice'?'clap':k==='corsa'?'runcatch':'reach';}
  if((p.armT||0)>0)return 'throw';
  if(p===G.holder&&p.t===0&&drag&&drag.dirOk&&!G.flight)return 'aim';   // stai mirando: il braccio si carica
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
    // conta lo scatto iniziale, non il punto preciso dove arrivera': si disegna solo il primo tratto (circa il 40% del percorso, tra 4,5 e 7,5 metri)
    const L=Math.min(d,clamp(d*0.4,4.5*S,7.5*S)),xe=x0+ux*L,ye=y0+uy*L;
    if(L<12)continue;
    pline(x0+ux*6,y0+uy*6,xe,ye,PAL.out,4);pline(x0+ux*6,y0+uy*6,xe,ye,c,2);
    const ax=Math.abs(ux)>Math.abs(uy);
    parrow(xe+(ax?(ux>0?1:-1):0),ye+(ax?0:(uy>0?1:-1)),ax?(ux>0?0:2):(uy>0?1:3),PAL.out,5);
    parrow(xe+(ax?(ux>0?1:-1):0),ye+(ax?0:(uy>0?1:-1)),ax?(ux>0?0:2):(uy>0?1:3),c,4);
  }
}
// NOMI solo per chi conta in quel momento (con tutti i nomi accesi le etichette si sovrapponevano e coprivano i giocatori):
// chi ha il disco o tira il pull, il compagno agganciato dalla mira o chiamato a correre, il difensore che guidi, chi deve ricevere il lancio in volo
let aimTgt=null,aimKind='backhand',aimF=0;   // aimF: forza della mira (0-1), per il caricamento dell'omino
function nameKey(p){
  if(p===G.holder||p===G.puller||p===G.ctrl||p===aimTgt)return true;
  if(G.call&&G.call.q===p)return true;
  const f=G.flight;if(f&&f.intended===p&&f.team===0)return true;
  return !!(p.cfx&&G.tick<p.cfx.until+0.6);   // chi ha appena preso al volo
}
function drawPlayers(dt){
  const cel=celFrame(),cy=p=>{const c=cel&&cel.get(p);return c?c.wy:p.y;};   // esultanze dopo la meta (27-esultanze.js): posizione e posa disegnate
  const all=T[0].concat(T[1],G.dec?G.dec.filter(Boolean):[]).sort((a,b)=>cy(a)-cy(b)),h=PH();   // G.dec: le copie del clone (superpoteri)
  if(cel)celGround();
  if(G.flight&&G.flight!==lastFl){lastFl=G.flight;G.flight.thrower.armT=G.flight.thrower.armT0=0.42;}   // lancio in tre tempi (puppet)
  if(G.pull&&G.pull!==lastPull){lastPull=G.pull;if(G.pull.thrower)G.pull.thrower.armT=G.pull.thrower.armT0=0.5;}
  const names=[];
  for(const p of all){
    const C=cel&&cel.get(p),x=C?C.x:sxw(p.x),y=C?C.y:syw(p.y);if(x<-30||x>VW+30)continue;
    const ghost=p.fake&&p.t===0;   // la copia del tuo clone la vedi trasparente (heroGhost); quella dell'avversario e' identica al vero
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
    const pose=C?C.pose:poseOf(p);
    if(!C&&pose==='run'&&sp<0.6&&!p.dv){const dx=(G.flight?G.disc.x:(G.holder?G.holder.x:G.disc.x))-p.x;if(Math.abs(dx)>0.8)face=dx>0?1:-1;p.fc=face;}   // fermo: guarda il disco
    if(p._lf!==undefined&&face!==p._lf&&!p.dv)p.turnT=0.09;p._lf=face;p.turnT=Math.max(0,(p.turnT||0)-dt);   // girata: un attimo di fronte
    if(p._air&&pose!=='jump')p.landT=0.12;p._air=pose==='jump';p.landT=Math.max(0,(p.landT||0)-dt);   // atterraggio: piega le gambe
    if(pose==='mark'||pose==='hold'){   // il marcatore guarda il portatore; il portatore guarda dove mira (o la meta che attacca)
      if(pose==='mark')face=G.holder.x>=p.x?1:-1;
      else if(drag&&drag.dirOk&&p===G.holder)face=Math.cos(drag.ang)>=0?1:-1;
      else if(sp<0.6)face=dirOf(p.t);
      p.fc=face;
    }
    const dvp=diveProg(p),air=p.dv?diveAir(p):0;
    if(C&&C.dive)pell(x+C.dive.dir*5+1,y,10,1,'rgba(10,30,10,.28)');
    else pell(x+(p.dv?p.dv.dir*5*dvp:0)+1,y,5+ri(5*dvp),1,ghost?'rgba(10,30,10,.12)':'rgba(10,30,10,.28)');   // ombra
    if(p.hot||p.cold){const c=p.hot?(Math.sin(G.tick*14+p.i)>0?'#ff5a3c':'#ffb03a'):'#7fd8ff';pring(x,y-9,10,12,c,1,2);}
    if(C){}   // chi esulta: niente cerchio del possesso
    else if(p===G.holder||p===G.puller){const pu=Math.sin(G.tick*6)>0?1:0;pring(x,y,9+pu,3,PAL.out,3);pring(x,y,9+pu,3,PAL.gold,1);}
    else if(p===G.marker&&G.holder)pring(x,y,9,3,G.dmode[p.t]===1?'#ff8a5c':'#ffffff',1,2);   // arancione: marca in anticipo (piu' pressione sul lancio)
    if(p===G.ctrl&&inDefense()){const pu=Math.sin(G.tick*8)>0?1:0;pring(x,y,10+pu,4,PAL.out,3);pring(x,y,10+pu,4,PAL.sky,1);parrow(x,y-h-16-pu,1,PAL.out,5);parrow(x,y-h-15-pu,1,PAL.sky,4);}   // il difensore che stai guidando
    if(C&&C.dive)puppetDive(x,y,UNI[p.t],heroLook(p),C.dive.dir,C.dive.lift);
    else if(C){const hp=puppet(x,y,UNI[p.t],heroLook(p),C.f,C.pose,C.ph||0,C.run||0,0,{view:C.view|0,cp:C.cp,ca:-1,hero:heroVis(p)?p.hero:null,sc:heroScale(p)});p._hx=hp[0];p._hy=hp[1];p._ht=G.tick;}
    else if(dvp>0.45)puppetDive(x+p.dv.dir*6*dvp,y,UNI[p.t],heroLook(p),p.dv.dir,2+7*air);
    else{
      // vista: di schiena se corre verso l'alto dello schermo, di fronte se scende verso la camera, altrimenti di lato
      const view=sp>1.2&&Math.abs(p.vy)>Math.abs(p.vx)*1.3?(p.vy<0?1:2):(p.turnT>0&&(pose==='run'||pose==='mark')?2:0);
      const kind=pose==='aim'?aimKind:(lastFl&&lastFl.thrower===p?lastFl.kind:'backhand');   // il pull e' un rovescio
      const ca=p.cfx?G.tick-(p.cfx.until-0.42):-1;
      const hp=ghost?heroGhost(x,y,(gx,gy)=>puppet(gx,gy,UNI[p.t],heroLook(p),dvp>0?p.dv.dir:face,pose,p.ph,Math.min(1,sp/6),0,{brk:!!p._brk,view,kind,ca:-1,hero:p.hero,sc:heroScale(p)})):puppet(x,y,UNI[p.t],heroLook(p),dvp>0?p.dv.dir:face,dvp>0?'reach':pose,p.ph,Math.min(1,sp/6),pose==='jump'?1-(p.cfx.until-G.tick)/0.42:clamp((p.armT||0)/(p.armT0||0.42),0,1),{brk:!!p._brk,view,kind,ca,long:!!(lastFl&&lastFl.thrower===p&&hyp(lastFl.tx-lastFl.sx,lastFl.ty-lastFl.sy)>28),pow:aimF,land:p.landT>0,hero:heroVis(p)?p.hero:null,sc:heroScale(p)});
      p._hx=hp[0];p._hy=hp[1];p._ht=G.tick;   // il disco in mano segue la mano (drawDisc)
    }
    heroFrost(p,x,y);   // il ghiaccio ai piedi di chi e' congelato (20-superpoteri.js)
    // energia: barretta sotto i tuoi quando calano; goccia di sudore sugli avversari sfiniti (li' c'e' un duello da cercare)
    if(G.mode==='play'&&G.inMatch&&!p.dv&&!ghost){
      if(p.t===0&&p.st<62){px(x-5,y+3,11,3,PAL.out);px(x-4,y+4,Math.max(1,Math.round(9*p.st/100)),1,p.st<30?PAL.red:(p.st<46?'#ff9a3a':PAL.gold));}
      else if(p.t===1&&p.st<38&&Math.sin(G.tick*5+p.i)>0){px(x+4,y-h+1,1,1,PAL.sky);px(x+4,y-h+2,2,2,PAL.sky);}
    }
    // frenata netta o cambio di direzione (p._brk, dal motore): due sbuffi di polvere ai piedi, una volta per frenata
    if(p._brk&&!p._bd&&G.mode==='play'){p._bd=1;for(let k=0;k<2;k++)addFx({t:'dust',x:p.x,y:p.y,vx:-p.vx*0.12+rnd(-0.6,0.6),vy:-p.vy*0.08+rnd(-0.3,0.3),z:0.2,vz:rnd(0.3,0.9),life:0.45,max:0.45,r:rnd(0.2,0.4)});}
    else if(!p._brk)p._bd=0;
    if(nameKey(p)&&!C)names.push(p);
  }
  if(cel)celOverlay();   // stelline e fumetto del grido
  // i giocatori simbolo (stelle internazionali e chi ha vinto premi) hanno il nome dorato
  for(const p of names)ptext(p.name,sxw(p.x),syw(p.y)-Math.round(h*heroScale(p))-10-(p.dv?4:0)-heroTop(p),{f:'t',c:(p.star||(p.aw&&p.aw.length)||(p.ro&&p.ro.star))?PAL.gold:(p.t===0?'#ffffff':'#ffd9d9')});
  // ETICHETTA DELLA SITUAZIONE sopra chi ha il disco, in un riquadro nero come il «2nd & 10» di Retro Bowl: stall da 6, ultimo lancio, universe point (il match point lo annuncia la fascia a inizio punto)
  const hh=G.holder;
  if(hh&&!G.flight&&G.mode==='play'){
    const n=G.marker&&hyp(G.marker.x-hh.x,G.marker.y-hh.y)<3.8?Math.min(10,Math.floor(G.stallT)+1):0,lb=situationLabel(hh,n);
    if(lb&&(!lb.hot||Math.sin(G.tick*18)>-0.4)){const tw=ptw(lb.txt,'p')+8,bx=clamp(sxw(hh.x)-ri(tw/2),2,VW-tw-2),by=syw(hh.y)-h-34;pbox(bx,by,tw,12,'#000000',lb.hot?PAL.red:'#ffffff');ptext(lb.txt,bx+4,by+2,{f:'p',a:'l',c:lb.hot?PAL.red:'#ffffff',o:false});}
  }
}
function drawDisc(){
  if(celDisc())return;   // durante un'esultanza il disco lo disegna 27-esultanze.js (in mano, schiacciato a terra, lanciato in alto)
  const d=G.disc,f=G.flight||(G.pull&&!G.pull.landed?G.pull:null);
  if(f){
    const hiF=!!(f.high||f===G.pull),tx=sxw(f.tx),ty=syw(f.ty),c=hiF?PAL.gold:'#ffffff',pu=Math.sin(G.tick*10)>0?1:0;
    if(f.cx!==undefined){for(let i=1;i<24;i+=2){const P=flightAt(f,i/24);px(sxw(P.x),syw(P.y),2,1,'rgba(255,255,255,.55)');}}   // la traiettoria segue la curva del lancio
    else pline(sxw(f.sx),syw(f.sy),tx,ty,'rgba(255,255,255,.55)',1,3);
    pring(tx,ty,7+pu,4,PAL.out,3);pring(tx,ty,7+pu,4,c,1);px(tx-1,ty,3,1,c);px(tx,ty-1,1,3,c);
    trail.push({x:d.x,y:d.y,z:d.z*(hiF?1.7:1)});if(trail.length>12)trail.shift();
  }else if(trail.length)trail.length=0;
  // SCIA a nastro: un tratto continuo che si assottiglia e sbiadisce verso la coda (colori pieni: con la trasparenza i quadratini sovrapposti farebbero macchie)
  for(let i=0;i<trail.length-1;i++){
    const a=trail[i],b=trail[i+1],k=(i+1)/trail.length;
    pline(sxw(a.x),syw(a.y)-a.z*S*0.5,sxw(b.x),syw(b.y)-b.z*S*0.5,k>0.66?'#ffffff':(k>0.33?'#e6f0dc':'#c6dcb2'),k>0.66?2:1);
  }
  const car=G.holder||(G.mode==='ready'?G.puller:null);
  let x=sxw(d.x),y=syw(d.y),z=f?d.z:0;
  if(!f&&car){
    const fc=car.fc||dirOf(car.t),dvp=car.dv?diveProg(car):0;
    x=sxw(car.x)+fc*6;y=syw(car.y)-8;
    if(car._ht===G.tick&&!car.dv){x=car._hx+1+fc*2;y=car._hy+1;}   // nella mano vera: si sposta col caricamento del lancio
    if(dvp>0.45){x=sxw(car.x)+car.dv.dir*(6*dvp+14);y=syw(car.y)-5-ri(2+7*diveAir(car));}
    if(G.walk&&!G.walk.stage){x=sxw(d.x);y=syw(d.y);}
    discScr.x=x;discScr.y=y;pdiscSprite(x,y,G.tick*3,0);return;
  }
  const gy=syw(d.y),lift=ri(z*(f&&(f.high||f===G.pull)?1.7:1)*S*0.5);
  discScr.x=x;discScr.y=gy-2-lift;
  // ALTEZZA DEL DISCO: l'ombra resta a terra e si stringe e schiarisce man mano che il disco sale; sopra i 3 metri una fila di puntini la collega al disco,
  // cosi' si capisce a colpo d'occhio quanto e' alto (e se un difensore puo' arrivarci) e dove sta per cadere
  const hk=clamp(lift/40,0,1);
  pell(x,gy+1,ri(lerp(4,2,hk)),1,`rgba(10,30,10,${(0.42-0.2*hk).toFixed(2)})`);
  if(lift>12)for(let yy=gy-3;yy>gy-lift;yy-=4)px(x,yy,1,1,'rgba(255,255,255,.38)');
  // taglia e inclinazione: piu' alto = piu' grande; nei lanci a curva il disco e' inclinato dal lato della curva, l'hammer vola capovolto
  const sz=!f?0:(lift>=10?2:1),tl=f&&f!==G.pull&&f.cx!==undefined&&Math.abs(f.cx)>0.4?Math.sign(f.cx):0;
  pdiscSprite(x,gy-2-lift,G.tick*22,sz,f&&f.kind==='scoober'?0:tl,!!(f&&(f.kind==='hammer'||f.kind==='scoober')));
}
const discScr={x:-99,y:-99};   // dove si vede il disco sullo schermo (la pioggia si dirada li' attorno)
// mira: arco di quadratini bianchi col bordo nero (come la traiettoria di Retro Bowl) e la sua ombra a puntini sul prato
function drawAim(){
  aimTgt=null;
  if(drag&&drag.sl&&G.holder&&G.holder.t===0&&!G.flight)drawSling(drag.ox,drag.oy,drag.fx,drag.fy,!drag.dirOk&&!!drag.was);
  if(!drag||!drag.dirOk||!G.holder||G.holder.t!==0||G.flight)return;
  const h=G.holder,w=toWorld(drag.x,drag.y),hx=sxw(h.x)+(h.fc||1)*5,hy=syw(h.y)-9,gx=sxw(h.x),gy=syw(h.y);
  const dist=hyp(w.x-h.x,w.y-h.y),pl=planThrow(h,w.x,w.y,G.high),kd=pl.kind,mk=G.marker;
  aimKind=kd;aimF=clamp(dist/45,0,1);
  if(mk&&hyp(mk.x-h.x,mk.y-h.y)<4){   // cono chiuso dal marcatore
    const ang=Math.atan2(mk.y-h.y,mk.x-h.x),half=55*Math.PI/180,R=ri(16*S);
    for(const a of [ang-half,ang+half])pline(gx,gy,gx+Math.cos(a)*R,gy+Math.sin(a)*R,PAL.red,1,3);
    pring(gx,gy,R,R,PAL.red,1,3,ang-half,ang+half);
    for(let r=R*0.25;r<R;r+=R*0.25)pring(gx,gy,r,r,'rgba(255,90,90,.5)',1,2,ang-half,ang+half);
  }
  const ex=drag.x+ri((pl.tx-w.x)*S),ey=drag.y+ri((pl.ty-w.y)*S);   // punto d'arrivo vero: quello mirato piu' la deriva del vento
  // ogni lancio ha il suo arco: piatto e teso, scoober a mezza altezza, hammer e huck alti; la curva laterale e' quella vera del volo
  const dpx=hyp(ex-gx,ey-gy),n=Math.max(3,ri(dpx/7));
  const arc=pl.sp.hi?Math.min(52,dpx*0.3):(kd==='scoober'?Math.min(22,dpx*0.17):Math.min(9,dpx*0.06));
  const col=pl.sp.hi||kd==='scoober'?PAL.gold:'#ffffff',cxp=pl.cx*S,cyp=pl.cy*S;
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
  const sn=aimSnap(h,w.x,w.y,G.high),q=sn.best||(G.call&&G.call.q),locked=!!sn.best;aimTgt=q||null;
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
  const tw=ptw(txt,'p')+6,bx=clamp(drag.x-tw/2,2,VW-tw-2),by=clamp(drag.y-26,BAR+2,VH-14-ri(36*UIZ*DPR/PXS));   // sopra la fila dei pulsanti in basso
  pbox(bx,by,tw,12,'#000000');ptext(txt,bx+3,by+2,{f:'p',a:'l',c:pl.short?PAL.red:(pl.sp.hi||kd==='scoober'?PAL.gold:'#ffffff'),o:false});
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
// la fascia va nella meta' dello schermo lontana dal disco, cosi' non copre il giocatore che ha appena preso, bloccato o perso il disco
const bandY=()=>discScr.y>0&&discScr.y<VH*0.52?ri(VH*0.66):ri(VH*0.24);
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
      if(band.y===undefined)band.y=bandY();   // si decide una volta: la fascia non salta mentre e' sullo schermo
      const age=band.max-band.t,e=easeOut(clamp(age/0.14,0,1)),out=easeOut(clamp(1-band.t/0.14,0,1)),hh=24,y=band.y,x=-ri(VW*(1-e))+ri(VW*out);
      px(x,y,VW,hh,'#000000');px(x,y-2,VW,1,'#000000');px(x,y+hh+1,VW,1,'#000000');
      px(x,y,6,hh,band.c);px(x+VW-6,y,6,hh,band.c);
      ptext(band.txt,x+VW/2,y+4,{f:'P',c:'#ffffff',o:false});
    }
  }
  toasts.forEach((t,i)=>{
    const w=ptw(t.txt,'t')+14,x=ri(VW/2-w/2),y=(band&&band.y<VH/2?band.y+31:(elHint.classList.contains('hidden')?BAR+5:ri(70*UIZ*DPR/PXS)))+i*16,   // sotto il suggerimento, se c'e'
      col=t.benefit===0?PAL.green:(t.benefit===1?PAL.red:'#ffffff');
    if(t.t<0.2&&((G.tick*24|0)&1))return;
    // le etichette di vento e meteo stanno in alto a destra: un messaggio lungo che le toccherebbe scende sotto di loro
    const lw=G.inMatch?wxChipW():0,lh=lw?18:0;
    const yy=lh&&!(band&&band.y<VH/2)&&x+w>VW-lw-8&&y<BAR+4+lh?BAR+4+lh+2+i*16:y;
    // i messaggi sono frasi: carattere stretto (quello largo dei titoli resta per le parole brevi e i numeri)
    pbox(x,yy,w,13,'#000000');px(x+3,yy+4,4,5,col);ptext(t.txt,x+10,yy+3,{f:'t',a:'l',c:'#ffffff',o:false});
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
  if(age<0.06){px(0,0,VW,VH,'rgba(255,255,255,.55)');}
  // FASCIA nel terzo basso (prima stava al centro e copriva proprio chi aveva segnato): a sinistra la scritta, a destra chi segna, l'assist e il punteggio
  const e=easeOut(clamp(age/0.22,0,1)),hh=44,y0=VH-hh-12,x=-ri(VW*(1-e)),gone=b.t<0.18;
  if(!gone){
    px(x,y0,VW,hh,'#000000');px(x,y0-3,VW,1,'#000000');px(x,y0+hh+2,VW,1,'#000000');
    px(x,y0+2,VW,2,col);px(x,y0+hh-4,VW,2,col);
    const cal=b.kind==='callahan',title=cal?'CALLAHAN!':'META!',pop=age<0.3&&age>0.22?-2:0,blink=cal&&((G.tick*8|0)&1);
    const as=!cal&&lastFl&&lastFl.team===b.team&&lastFl.thrower&&lastFl.thrower!==b.scorer?lastFl.thrower:null;   // l'ultimo lancio della squadra che segna e' l'assist
    const l1=b.scorer.name,l2=cal?'intercetta e segna':(as?'assist '+as.name:'segna'),l3=`${teamAbbr(G.myName||'Blu')} ${G.score[0]} - ${G.score[1]} ${teamAbbr(G.oppName||'Rossi')}`;
    const rw=Math.max(ptw(l1,'p'),ptw(l2,'t'),ptw(l3,'t'));
    let tf='B',tw=ptw(title,'B');if(tw+rw+22>VW-8){tf='P';tw=ptw(title,'P');}
    const sx=x+ri((VW-(tw+rw+16))/2),rx=sx+tw+16;
    if(age>0.2){
      ptext(title,sx,y0+(tf==='B'?7:14)+pop,{f:tf,a:'l',c:blink?'#ffffff':(cal?(b.team===0?PAL.green:PAL.red):col),o:false,sh:2});
      if(age>0.4){
        px(rx-8,y0+9,1,hh-18,'#3a4466');
        ptext(l1,rx,y0+8,{f:'p',a:'l',c:b.scorer.star?PAL.gold:'#ffffff',o:false});
        ptext(l2,rx,y0+19,{f:'t',a:'l',c:'#a9b6d6',o:false});
        if(age>0.55)ptext(l3,rx,y0+29,{f:'t',a:'l',c:'#ffffff',o:false});
      }
    }
  }
  for(const c of conf){c.x+=c.vx*dt;c.y+=c.vy*dt;c.vx+=Math.sin(G.tick*5+c.y*0.1)*30*dt;if(c.y>VH+4)continue;px(c.x,c.y,c.w,c.w,c.c);}
}

