/* ---- SCRITTE E STEMMA DIPINTI SUL PRATO ----
   Come nei giochi sportivi a 16 bit, le scritte a terra sono a blocchi: il carattere 5x7 degli stemmi (CLUB_FONT) misurato in metri. Crescono con lo zoom
   come le linee, ma ogni blocco cade su pixel interi e resta netto (prima erano testo ingrandito di una frazione, con i bordi sfocati e i pixel di misure diverse).
   Vernice bianca appena velata dal fondo, con un pixel d'ombra in basso a destra nel tono scuro del fondo: la stessa luce degli omini (02c-ombre-16bit.js).
   Lo stemma di centrocampo e' dipinto pieno con il bordo bianco (prima era velato e i suoi colori sul verde diventavano marroni). */
const paintKey=s=>String(s||'').normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/ß/g,'SS').toUpperCase().replace(/[^A-Z0-9 -]/g,' ').replace(/\s+/g,' ').trim();
// righe e lato del blocco (metri) perche' il nome stia in uno spazio lungo len e profondo dep: si prova da una a tre righe e si tiene quella con le lettere piu' grandi
const blockMemo=new Map();
function blockFit(nm,len,dep,cap){
  const key=nm+'|'+len+'|'+dep+'|'+cap;let r=blockMemo.get(key);if(r)return r;
  const w=paintKey(nm).split(' ').filter(Boolean);if(!w.length)w.push('-');
  const lw=ls=>Math.max(...ls.map(l=>l.length))*6-1;
  let best={ls:[w.join(' ')],c:0};
  for(let n=1;n<=Math.min(3,w.length);n++){
    let bl=null,bm=1e9;   // le parole in n righe, con la riga piu' lunga piu' corta possibile
    const rec=(i,k,acc)=>{if(k===1){const ls=acc.concat([w.slice(i).join(' ')]),m=lw(ls);if(m<bm){bm=m;bl=ls;}return;}for(let j=i+1;j<=w.length-k+1;j++)rec(j,k-1,acc.concat([w.slice(i,j).join(' ')]));};
    rec(0,n,[]);
    const c=Math.min(len/bm,dep/(n*7+(n-1)*3));
    if(c>best.c)best={ls:bl,c};
  }
  if(best.ls.length===1&&best.c*lw(best.ls)>len)best.c=len/lw(best.ls);   // una parola sola lunghissima: lettere piu' piccole
  best.c=Math.min(best.c,cap);
  if(blockMemo.size>200)blockMemo.clear();
  blockMemo.set(key,best);return best;
}
// disegna righe di testo a blocchi centrate in (cx, cy) metri; rot: 0 dritto, 1 lungo +y (tetto delle lettere verso +x), -1 lungo -y (tetto verso -x), 2 capovolto
function paintBlocks(ls,c,cx,cy,rot,col,sh){
  const lh=10,tw=Math.max(...ls.map(l=>l.length))*6-1,th=ls.length*lh-3;
  const runs=[];   // [u0, u1, v] in blocchi, con l'origine al centro del testo
  ls.forEach((l,li)=>{
    const x0=Math.round((tw-(l.length*6-1))/2);
    for(let ci=0;ci<l.length;ci++){
      const g=CLUB_FONT[l[ci]];if(!g)continue;
      for(let gy=0;gy<7;gy++){const row=g[gy];let gx=0;while(gx<5){if(row[gx]!=='1'){gx++;continue;}let e=gx;while(e<5&&row[e]==='1')e++;runs.push(x0+ci*6+gx-tw/2,x0+ci*6+e-tw/2,li*lh+gy-th/2);gx=e;}}
    }
  });
  const rect=(u0,u1,v,dx,dy)=>{   // un tratto di blocchi -> rettangolo sullo schermo (gli spigoli arrotondati ai pixel: blocchi netti)
    let X0,X1,Y0,Y1;
    if(rot===0){X0=cx+u0*c;X1=cx+u1*c;Y0=cy+v*c;Y1=Y0+c;}
    else if(rot===2){X0=cx-u1*c;X1=cx-u0*c;Y1=cy-v*c;Y0=Y1-c;}
    else if(rot===1){Y0=cy+u0*c;Y1=cy+u1*c;X1=cx-v*c;X0=X1-c;}
    else{Y0=cy-u1*c;Y1=cy-u0*c;X0=cx+v*c;X1=X0+c;}
    const a=sxw(X0),b=sxw(X1),d=syw(Y0),e=syw(Y1);
    if(b>a&&e>d)ctx.fillRect(a+dx,d+dy,b-a,e-d);
  };
  if(sh){ctx.fillStyle=sh;for(let i=0;i<runs.length;i+=3)rect(runs[i],runs[i+1],runs[i+2],1,1);}
  ctx.fillStyle=col;for(let i=0;i<runs.length;i+=3)rect(runs[i],runs[i+1],runs[i+2],0,0);
}
// nome della squadra nella sua meta, a blocchi lungo la meta (il tetto delle lettere verso la linea di fondo, come prima)
function ezPaintName(nm,zx,side,zc,fw){
  const fit=blockFit(nm,FIELD_W*0.84,EZ*0.6,0.75),wx=G.wx|0;
  const col=wx===2?'rgba(255,255,255,.72)':cMix('#ffffff',zc,0.16+0.3*fw),sh=wx===2?null:ramp16(zc,0)[2];
  paintBlocks(fit.ls,fit.c,zx,MID,side<0?-1:1,col,sh);
}
// numeri delle distanze, a blocchi alti 2,4 m vicino alle due linee laterali (quelli in alto capovolti): la linea passa tra le due cifre
const NUM_C=0.34;
function paintYardNum(n,x){
  const s=String(n),col=PAL.num,sh=cShade(PAL.grass2,-0.12),y0=FIELD_W-1.5-3.5*NUM_C,y1=1.5+3.5*NUM_C;
  if(s.length===1){paintBlocks([s],NUM_C,x,y0,0,col,sh);paintBlocks([s],NUM_C,x,y1,2,col,sh);return;}
  const off=3.5*NUM_C;   // ogni cifra a mezza cifra dalla linea
  for(const [k,d] of [[-1,s[0]],[1,s[1]]]){paintBlocks([d],NUM_C,x+k*off,y0,0,col,sh);paintBlocks([d],NUM_C,x-k*off,y1,2,col,sh);}
}
// stemma dipinto: pieno negli stadi; sui campi del club e sulla terra e' solo la sagoma chiara (vernice da righe o gesso: i colori su un prato consumato
// diventavano una macchia marrone). Il bordo di vernice bianca va solo attorno agli stemmi fatti
// di un pezzo (il tridente, la testa di cavallo, il sole): attorno a quelli fatti di pezzi staccati (stelle e strisce di una bandiera, lettere) appesantiva
let crestCv=null,crestCvKey='',crestParts=0,CREST_RIM=-1;   // CREST_RIM: -1 secondo lo stemma, 0 mai, 1 sempre (per le prove)
const CREST_RIM_MAX=2;   // pezzi al massimo perche' lo stemma abbia il bordo bianco
function crestPieces(cv){   // pezzi staccati dello stemma (pixel pieni collegati in croce; i granelli sotto i 6 pixel non contano)
  const W=cv.width,d=cv.getContext('2d').getImageData(0,0,W,W).data,seen=new Uint8Array(W*W),st=[];let n=0;
  for(let q=0;q<W*W;q++){
    if(seen[q]||d[q*4+3]<128)continue;
    let sz=0;st.push(q);seen[q]=1;
    while(st.length){const k=st.pop(),i=k%W,j=(k/W)|0;sz++;
      for(const m of [i>0?k-1:-1,i<W-1?k+1:-1,j>0?k-W:-1,j<W-1?k+W:-1])if(m>=0&&!seen[m]&&d[m*4+3]>=128){seen[m]=1;st.push(m);}}
    if(sz>=6)n++;
  }
  return n;
}
function crestPaint(cx,cy,w,name,a,chalk){
  const size=Math.max(4,Math.round(w)),key=name+'|'+size+'|'+(chalk?1:0)+'|'+PAL.line+'|'+CREST_RIM;
  if(key!==crestCvKey){
    crestCvKey=key;
    const W=size+4,base=document.createElement('canvas');base.width=base.height=W;
    const keep=ctx;ctx=base.getContext('2d');try{clubDraw(W/2,W/2,size,name,1);}finally{ctx=keep;}
    const o=crestCv||document.createElement('canvas');o.width=o.height=W;const g=o.getContext('2d');g.clearRect(0,0,W,W);
    crestParts=crestPieces(base);
    if(!chalk&&(CREST_RIM<0?crestParts<=CREST_RIM_MAX:CREST_RIM>0)){for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])g.drawImage(base,dx,dy);
    g.globalCompositeOperation='source-in';g.fillStyle=PAL.line;g.fillRect(0,0,W,W);g.globalCompositeOperation='source-over';}
    if(chalk){const k=base.getContext('2d');k.globalCompositeOperation='source-in';k.fillStyle=cMix(PAL.line,PAL.grass,0.35);k.fillRect(0,0,W,W);}
    g.drawImage(base,0,0);crestCv=o;
  }
  ctx.save();ctx.globalAlpha*=a;ctx.drawImage(crestCv,ri(cx)-(crestCv.width>>1),ri(cy)-(crestCv.height>>1));ctx.restore();
}
// righe del taglio dentro le mete: la vernice segue l'erba (strisce nel verso del campo, a quadri o niente sul sintetico); prima c'era una trama a righe oblique
function ezMow(x,y,w,h,zl){
  const V=venueNow(),k=mowKind(V);if(k===3||fieldKind(V)===0||w<=0)return;
  const sw=k===1?8:4,a0=zl?0:FIELD_L-EZ,dk='rgba(12,20,44,.09)';
  for(let i=0;i<EZ/sw;i++){
    const m=zl?EZ-(i+1)*sw:a0+i*sw,odd=zl?(i%2===0):(i%2===1);   // si continua l'alternanza del campo oltre la linea di meta
    const a=Math.max(x,sxw(m)),b=Math.min(x+w,sxw(m+sw));if(b<=a)continue;
    if(k===2){const qh=FIELD_W/4;for(let j=0;j<4;j++)if((i+j+(odd?1:0))%2)px(a,syw(j*qh),b-a,syw((j+1)*qh)-syw(j*qh),dk);}
    else if(odd)px(a,y,b-a,h,dk);
  }
}
