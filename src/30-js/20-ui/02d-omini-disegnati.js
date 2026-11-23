/* ---- OMINI DISEGNATI A MANO ----
   Testa (con la faccia), busto, pantaloncini, scarpe e mani sono sprite disegnati pixel per pixel, con luci e ombre messe a mano: la luce viene dall'alto
   e dal davanti (lo sprite si specchia quando l'omino si gira). Braccia e gambe restano libere (servono a lanci, prese ed esultanze), ma sono tratti
   netti larghi 2 pixel calcolati riga per riga, non piu' quadratini 2x2 a scalini; il braccio davanti al corpo ha la sua linea scura.
   Tutto va in una griglia: alla fine il contorno nel tono scuro del colore vicino e il disegno a tratti.
   Lettere degli sprite (luce, base, ombra): pelle L S s, capelli G H h, maglia K J j, motivo della maglia B N n, pantaloncini Q P p, calzettoni V C c,
   scarpe X Z z, fascia T A a; E occhio, M bocca, o linea scura. Le parti lontane usano gli stessi colori un tono piu' scuri (ramp16 con profondita' 1). */
const SPR_T={L:['sk',0],S:['sk',1],s:['sk',2],G:['hr',0],H:['hr',1],h:['hr',2],K:['sh',0],J:['sh',1],j:['sh',2],B:['sb',0],N:['sb',1],n:['sb',2],
  Q:['pt',0],P:['pt',1],p:['pt',2],V:['so',0],C:['so',1],c:['so',2],X:['ze',0],Z:['ze',1],z:['ze',2],T:['bd',0],A:['bd',1],a:['bd',2]};
// colori di un omino: [vicino, lontano], per ogni lettera [colore, contorno]
const PAL16C=new Map();
function pal16(un,lk){
  const key=un.shirt+un.shorts+un.socks+un.shoe+(un.shirtB||'')+lk.skin+lk.hair+(lk.band||'');
  let p=PAL16C.get(key);if(p)return p;
  const base={sk:lk.skin,hr:lk.hair,sh:un.shirt,sb:un.shirtB||un.shirt,pt:un.shorts,so:un.socks,ze:un.shoe,bd:lk.band||'#f4f4f4'};
  p=[{},{}];
  for(const d of [0,1]){
    for(const ch in SPR_T){const [m,t]=SPR_T[ch],r=ramp16(base[m],d);p[d][ch]=[r[t],r[3]];}
    const sr=ramp16(lk.skin,d);p[d].E=['#1a1422',PAL.out];p[d].M=[cMix(sr[2],sr[3],0.4),sr[3]];p[d].o=[PAL.out,PAL.out];
  }
  if(PAL16C.size>400)PAL16C.clear();
  PAL16C.set(key,p);return p;
}
// ---- griglia di lavoro: colore, contorno e strato (1 busto, 2 pantaloncini, 3 testa, 4 braccio vicino) di ogni pixel ----
const PGW=96,PGH=112,pgC=new Array(PGW*PGH).fill(null),pgO=new Array(PGW*PGH).fill(null),pgL=new Uint8Array(PGW*PGH),pgM=new Uint16Array(PGW*PGH),pgUsed=[];
let pgX=0,pgY=0,pgMk=0;
function pgBegin(x,y){for(const k of pgUsed){pgC[k]=null;pgO[k]=null;pgL[k]=0;}pgUsed.length=0;pgX=x-(PGW>>1);pgY=y-PGH+16;}
const pgAt=(x,y)=>{const i=x-pgX,j=y-pgY;return i<0||j<0||i>=PGW||j>=PGH?-1:j*PGW+i;};
function pgSet(x,y,c,l){const k=pgAt(x,y);if(k<0)return;if(pgC[k]===null)pgUsed.push(k);pgC[k]=c[0];pgO[k]=c[1];pgL[k]=l|0;}
// sprite a lettere con l'angolo in alto a sinistra in (ox, oy); map(i, j, lettera) puo' cambiare la lettera (motivi, barba, fascia)
function pgSpr(rows,ox,oy,flip,P,l,map){
  const w=rows[0].length;
  for(let j=0;j<rows.length;j++){const r=rows[j];for(let i=0;i<r.length;i++){let ch=r[i];if(ch==='.')continue;if(map)ch=map(i,j,ch);const c=P[ch];if(c)pgSet(flip?ox+w-1-i:ox+i,oy+j,c,l);}}
}
// arto: tratto netto largo w da (ax,ay) a (bx,by), riga per riga se e' piu' verticale e colonna per colonna se e' piu' orizzontale.
// t0 e t1 sono i due toni [luce, ombra] prima e dopo 'cut' (manica e braccio, coscia e calzettone); il pixel chiaro e' quello davanti (f) o sopra.
// inner: dove passa davanti al corpo, i pixel del corpo che lo toccano diventano la loro linea scura (il braccio si stacca dalla maglia)
const pgPts=[];
function pgLimb(ax,ay,bx,by,w,t0,t1,cut,f,l,inner){
  const dx=bx-ax,dy=by-ay;pgPts.length=0;
  if(Math.abs(dy)>=Math.abs(dx)){const n=Math.abs(dy)||1,s=dy<0?-1:1;for(let k=0;k<=Math.abs(dy);k++){const u=k/n,y=ay+s*k,x=ri(ax+dx*u);for(let q=0;q<w;q++)pgPts.push(x+q,y,u,(f>0?q===w-1:q===0)?0:1);}}
  else{const n=Math.abs(dx),s=dx<0?-1:1;for(let k=0;k<=n;k++){const u=k/n,x=ax+s*k,y=ri(ay+dy*u);for(let q=0;q<w;q++)pgPts.push(x,y+q,u,q===0?0:1);}}
  pgMark(inner,l);
}
function pgMark(inner,l,t0x){
  const pts=pgPts;
  if(inner){
    pgMk=(pgMk+1)&65535||1;for(let i=0;i<pts.length;i+=4){const k=pgAt(pts[i],pts[i+1]);if(k>=0)pgM[k]=pgMk;}
    for(let i=0;i<pts.length;i+=4)for(let d=0;d<4;d++){const k=pgAt(pts[i]+(d===0?1:(d===1?-1:0)),pts[i+1]+(d===2?1:(d===3?-1:0)));if(k>=0&&pgM[k]!==pgMk&&pgC[k]!==null&&pgL[k]&&pgL[k]!==l)pgC[k]=pgO[k];}
  }
}
function pgLimbDraw(t0,t1,cut,l){for(let i=0;i<pgPts.length;i+=4){const T=pgPts[i+2]<cut?t0:t1;pgSet(pgPts[i],pgPts[i+1],T[pgPts[i+3]],l);}}
// alla fine: contorno (solo in croce: gli angoli restano smussati) nel tono scuro del pixel che tocca, poi il disegno a tratti; k = ingrandimento (eroi giganti) attorno a (cx, cy)
function pgDraw(k,cx,cy){
  if(!pgUsed.length)return;
  let i0=PGW,i1=0,j0=PGH,j1=0;for(const q of pgUsed){const i=q%PGW,j=(q/PGW)|0;if(i<i0)i0=i;if(i>i1)i1=i;if(j<j0)j0=j;if(j>j1)j1=j;}
  i0=Math.max(0,i0-1);j0=Math.max(0,j0-1);i1=Math.min(PGW-1,i1+1);j1=Math.min(PGH-1,j1+1);
  const big=k&&k!==1;
  for(let j=j0;j<=j1;j++){
    let i=i0;
    while(i<=i1){
      const q=j*PGW+i;let c=pgC[q];
      if(c===null){   // vuoto: contorno se tocca l'omino
        const n=(i>0&&pgC[q-1]!==null)?q-1:((i<PGW-1&&pgC[q+1]!==null)?q+1:((j>0&&pgC[q-PGW]!==null)?q-PGW:((j<PGH-1&&pgC[q+PGW]!==null)?q+PGW:-1)));
        c=n>=0?pgO[n]:null;
      }
      let e=i+1;
      while(e<=i1){const q2=j*PGW+e;let c2=pgC[q2];if(c2===null){const n=(pgC[q2-1]!==null)?q2-1:((e<PGW-1&&pgC[q2+1]!==null)?q2+1:((j>0&&pgC[q2-PGW]!==null)?q2-PGW:((j<PGH-1&&pgC[q2+PGW]!==null)?q2+PGW:-1)));c2=n>=0?pgO[n]:null;}if(c2!==c)break;e++;}
      if(c){
        ctx.fillStyle=c;const X=pgX+i,Y=pgY+j;
        if(big){const a=ri(cx+(X-cx)*k),b=ri(cy+(Y-cy)*k),a2=ri(cx+(pgX+e-cx)*k),b2=ri(cy+(Y+1-cy)*k);ctx.fillRect(a,b,Math.max(1,a2-a),Math.max(1,b2-b));}
        else ctx.fillRect(X,Y,e-i,1);
      }
      i=e;
    }
  }
}
// ---- SPRITE (di lato verso destra; si specchiano verso sinistra) ----
// teste: [vista][acconciatura] (0 di lato, 1 di schiena, 2 di fronte; 0 corti, 1 medi, 2 lunghi, 3 coda, 4 rasati). Di lato la faccia e' l'ultima
// colonna (il naso); le righe oltre l'ottava sono capelli che scendono sulle spalle
const HEADS=[
  [["..hhHHh.",".hHHGGHh","hHHHHHGH","hHHHhhLL","hHHsSLEL","hHhsSSSS",".hssSSSs","..ssSSs."],
   ["..hhHHh.",".hHHGGHh","hHHHHHGH","hHHHHhLL","hHHHhLEL","hHHhsSSS","hHhssSSs",".h.ssSs."],
   ["..hhHHh.",".hHHGGHh","hHHHHHGH","hHHHHhLL","hHHHhLEL","hHHhsSSS","hHHssSSs","hHhssSs.","hHh.....",".h......"],
   ["....hhHHh.","...hHHGGHh","..hHHHHHGH",".haHHHhhLL","hHhHHsSLEL","hhhHhsSSSS","h..hssSSSs","....ssSSs."],
   ["..hhhh..",".hhHHhh.","hhhhhhLL","hsSSSLLL","hsSsSLEL",".sSsSSSS",".ssSSSSs","..ssSSs."]],
  [["..hHHh..",".hHGGHh.","hHGHHHHh","hHHHHHHh","sHHHHHHs","shHHHHhs",".shhhhs.","..sSSs.."],
   ["..hHHh..",".hHGGHh.","hHGHHHHh","hHHHHHHh","hHHHHHHh","hHHHHHHh",".hhhhhh.","..sSSs.."],
   ["..hHHh..",".hHGGHh.","hHGHHHHh","hHHHHHHh","hHHHHHHh","hHHHHHHh","hHHHHHHh","hHHHHHHh",".hHHHHh.","..hhhh.."],
   ["..hHHh..",".hHGGHh.","hHGHHHHh","hHHHHHHh","sHHHHHHs","shHaaHhs",".shHHhs.","..sHhs..","...Hh...","...h...."],
   ["..hhhh..",".hhHHhh.","hhhhhhhh","sSSSSSSs","sSSSSSSs","ssSSSSss",".ssSSss.","..sSSs.."]],
  [["..hHHh..",".hHGGHh.","hHGHHHHh","hHhLLhHh","sSESSESs","sLSSSSLs",".sSssSs.","..sSSs.."],
   ["..hHHh..",".hHGGHh.","hHGHHHHh","hHhLLhHh","hSESSESh","hLSSSSLh","hsSssSsh",".hsSSsh."],
   ["..hHHh..",".hHGGHh.","hHGHHHHh","hHhLLhHh","hSESSESh","hLSSSSLh","hsSssSsh","hhsSSshh","hh....hh",".h....h."],
   ["..hHHh..",".hHGGHh.","hHGHHHHh","hHhLLhHh","sSESSESs","sLSSSSLs",".sSssSs.","..sSSs.."],
   ["..hhhh..",".hhhhhh.","hhLLLLhh","sLSSSSLs","sSESSESs","sLSSSSLs",".sSssSs.","..sSSs.."]]];
// busto 7x5 e pantaloncini 7x3: di lato, di schiena, di fronte
const TORSO=[[".JKKKK.","jJJJKKK","jJJJJJK","jjJJJJJ",".jjjJJ."],[".KKKKJ.","KKJJJJj","KJJJJJj","KJJJJJj",".jjjjj."],[".KKSKK.","KKKJJJj","KJJJJJj","KJJJJJj",".jJJJj."]];
const SHORTS=[["pPPPPQQ","pPPPPPP","ppPPPPp"],["QQPPPPp","QPPPPPp","pPp.pPp"],["QQPPPPp","QPPPPPp","pPp.pPp"]];
const SHOE_S=["ZZZ.","zzZX"],SHOE_F=["ZX","zz"];
// tuffo in orizzontale (verso destra): busto disteso e pantaloncini; gambe e braccia sono tratti, la testa e' quella di lato
const DIVE_B=["...pPPKKKKKK.","..ppPPJJJJJKK","..ppPPjJJJJJJ","...pp.jjjjjj."];
// sprite di un omino: gambe, scarpe, braccia, pantaloncini, busto, testa e braccio vicino in questo ordine (quello dopo copre quello prima)
function drawMan16(o){
  const {x,gy,by,sy,T,f,view,lean,un,lk,legs,hands,shx,hero,sc}=o,P=pal16(un,lk),N=P[0],F=P[1],fl=view===0&&f<0;
  pgBegin(x,gy);
  // braccio lontano (dietro a tutto)
  {const h=hands[1];pgLimb(shx,sy+1,h[0],h[1],2,0,0,0,f,5,false);pgLimbDraw([F.J,F.j],[F.S,F.s],0.45,5);pgSet(h[0],h[1],F.S,5);pgSet(h[0]+1,h[1],F.S,5);pgSet(h[0],h[1]+1,F.s,5);pgSet(h[0]+1,h[1]+1,F.s,5);}
  // gambe: anca, ginocchio (se piegata), piede; poi la scarpa
  for(const L of legs){
    const Q=L.far?F:N,sk=[Q.S,Q.s],so=[Q.C,Q.c];
    if(L.kx!==undefined){pgLimb(L.hx,L.hy,L.kx,L.ky,2,0,0,0,f,6,false);pgLimbDraw(sk,sk,2,6);pgLimb(L.kx,L.ky,L.fx,L.fy-1,2,0,0,0,f,6,false);pgLimbDraw(sk,so,0.25,6);}
    else{pgLimb(L.hx,L.hy,L.fx,L.fy-1,2,0,0,0,f,6,false);pgLimbDraw(sk,so,0.62,6);}
    if(view===0)pgSpr(SHOE_S,f>0?L.fx:L.fx-2,L.fy,f<0,Q,6);else pgSpr(SHOE_F,L.fx,L.fy,false,Q,6);
  }
  pgSpr(SHORTS[view],x-3,by-9,fl,N,2);
  const pat=un.pat;
  pgSpr(TORSO[view],x-3+lean,sy,fl,N,1,pat?((i,j,ch)=>(ch==='K'||ch==='J'||ch==='j')&&eqPatHit(pat,((fl?6-i:i)+0.5)/7,(j+0.5)/5)?(ch==='K'?'B':(ch==='J'?'N':'n')):ch):null);
  if(!hero){
    const st=lk.style===4?4:clamp(lk.style|0,0,3),rows=HEADS[view===1?1:(view===2?2:0)][st],w=rows[0].length;
    const ox=view===0?(f>0?x+4+lean-(w-1):x-4+lean):x-4+lean;   // di lato la faccia (ultima colonna) sta in x+4, davanti al busto
    const band=lk.band&&st!==4,beard=lk.beard&&view!==1;
    pgSpr(rows,ox,T,fl,N,3,band||beard?((i,j,ch)=>{
      if(band&&j===2&&(ch==='G'||ch==='H'||ch==='h'))return ch==='G'?'T':(ch==='H'?'A':'a');
      if(beard&&j>=5&&j<=7&&(view===2||i>=w-5)&&(ch==='S'||ch==='L'||ch==='s'))return ch==='s'?'h':'H';
      return ch;}):null);
  }
  // braccio vicino: davanti, con la sua linea scura sul corpo; la mano e' un pugno 2x2
  {const h=hands[0];pgLimb(shx,sy+1,h[0],h[1],2,0,0,0,f,4,true);for(const q of [[0,0],[1,0],[0,1],[1,1]])pgPts.push(h[0]+q[0],h[1]+q[1],1,q[1]);pgMark(true,4);pgLimbDraw([N.K,N.J],[N.S,N.s],0.45,4);}
  pgDraw(sc,x,gy);
}
