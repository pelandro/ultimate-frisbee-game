/* ---- BORDO CAMPO: mete con la trama, cartelloni e panchine ----
   Il campo era un prato uniforme con le mete slavate e il lato basso vuoto: qui si aggiungono gli elementi che danno profondita'.
   Tutto e' disegnato in coordinate del mondo (scorre con la camera) e costa pochi rettangoli per fotogramma: le trame sono pattern creati una volta. */
let ezPat=null;
// trama a righe diagonali delle mete (scura e trasparente: si posa sopra il colore della squadra)
function ezPattern(){
  if(ezPat)return ezPat;
  const c=document.createElement('canvas');c.width=c.height=8;const g=c.getContext('2d');g.fillStyle='rgba(16,22,48,.13)';
  for(let i=0;i<8;i++){g.fillRect(i,7-i,1,1);g.fillRect((i+4)%8,(11-i)%8,1,1);}
  ezPat=ctx.createPattern(c,'repeat');return ezPat;
}
function ezHatch(x,y,w,h){
  const p=ezPattern();if(!p||w<=0)return;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  ctx.translate(-(((CX%8)+8)%8),((OYi%8)+8)%8-8);ctx.fillStyle=p;ctx.fillRect(x-8,y-8,w+24,h+24);ctx.restore();
}
// cartelloni lungo il lato basso e le due panchine a meta' campo (a sinistra la squadra che difende la meta di sinistra)
const BOARD_W=9;   // metri
function drawSideline(y1){
  const y=y1+5,h=7;if(y>VH)return;
  const B=boardTexts();   // testi e colori dei cartelloni dipendono dal campo (17-stadi-pubblico.js)
  const mid=FIELD_L/2,benchL=[mid-15,mid-5],benchR=[mid+5,mid+15];
  const k0=Math.floor((toWorld(0,0).x+4)/BOARD_W)-1,k1=Math.ceil((toWorld(VW,0).x+4)/BOARD_W);
  for(let k=k0;k<=k1;k++){
    const wx=k*BOARD_W-4;if(wx+BOARD_W>benchL[0]&&wx<benchR[1])continue;   // davanti alle panchine niente cartelloni
    if(B.gap&&(k&1))continue;   // campo comunale: pochi cartelloni, con i buchi
    const a=sxw(wx)+1,b=sxw(wx+BOARD_W)-1,i=((k%4)+4)%4;if(b<0||a>VW)continue;
    px(a-1,y-1,b-a+2,h+2,PAL.out);px(a,y,b-a,h,B.bg[i]);px(a,y,b-a,1,'rgba(255,255,255,.22)');
    const t=B.txt[i].find(s=>b-a>ptw(s,'t')+4);   // il testo piu' lungo che ci sta (nome intero, prima parola, sigla)
    if(t)ptext(t,(a+b)/2,y,{f:'t',c:B.ink[i],o:false});
  }
  const blueLeft=G.dir[0]>0;
  for(const [r,t] of [[benchL,blueLeft?0:1],[benchR,blueLeft?1:0]])bench(r,t,y);
}
function bench(r,t,y){
  const a=sxw(r[0]),b=sxw(r[1]);if(b<0||a>VW)return;
  px(a-1,y+3,b-a+2,4,PAL.out);px(a,y+4,b-a,2,'#8a6f52');   // panca
  const n=Math.max(2,Math.min(6,((b-a)/9)|0)),un=UNI[t];
  for(let i=0;i<n;i++){
    const x=ri(a+(b-a)*(i+0.5)/n),h=hashStr('panca'+t+i),sk=FAN_S[h%4],bob=G.mode==='banner'&&G.banner&&G.banner.team===t&&Math.sin(G.tick*11+i)>0.2?2:0;
    px(x-2,y-5-bob,5,9,PAL.out);
    px(x-1,y-4-bob,3,3,sk);px(x-1,y-4-bob,3,1,['#2b1b12','#7a4a21','#101010','#c9964a'][(h>>3)%4]);
    px(x-1,y-1-bob,3,3,un.shirt);px(x-1,y+2-bob,3,1,un.shorts);
  }
}
