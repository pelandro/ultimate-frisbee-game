/* ---- FONDO DEL CAMPO: oltre le linee di fondo ----
   Dietro le mete c'era una fascia di prato piatto con oggetti visti dall'alto (il gazebo sembrava una busta, la borsa tre righe). Ora il fondo cambia
   con l'impianto, come i lati:
   - campetti di terra (fieldKind 0, livelli 0-1): erba rada con chiazze di terra, un sentiero battuto e la rete metallica verde;
     per terra zaini, borracce, felpe, coni e una pila di dischi;
   - campi del club (livello 2): prato con la siepe in fondo, il gazebo della squadra visto di tre quarti, il frigo portatile, borsoni e dischi;
   - campo comunale (livello 3): la ringhiera, con i fotografi;
   - stadi (livelli 4-5): una fascia di prato piu' scura dove stanno i fotografi.
   Gli oggetti sono di lato, come le persone, con le ombre a 16 bit (sprShade). Tutto in metri dalla linea di fondo: scorre con la camera. */
const END_D=6;   // metri oltre la linea di fondo che si disegnano (la camera ne mostra al massimo 5)
const endX=(side,d)=>side?FIELD_L+d:-d;   // x del mondo a d metri oltre la linea di fondo (side 0 a sinistra, 1 a destra)
function endBand(side,d0,d1){const a=sxw(endX(side,d0)),b=sxw(endX(side,d1));return [Math.min(a,b),Math.abs(b-a)];}
function endRows(){return [Math.max(BAR,syw(-1.5)),Math.min(VH,syw(FIELD_W+1.2))];}   // dalla tribuna al lato vicino
// terreno dietro una meta: erba, terra, sentiero e quello che chiude il fondo (rete, siepe, ringhiera o cartelloni)
function endGround(side,V,lv,wx){
  const fk=fieldKind(V),[X,W]=endBand(side,0.25,END_D),[y0,y1]=endRows();
  if(X+W<0||X>VW||y1<=y0)return;
  if(wx!==2){
    patFill(tuftPattern(fk===0?0:lv,fk===0?0.75:(fk===1?0.3:0)),X,y0,W,y1-y0,24);   // ciuffi d'erba (e terra che si vede, sui campi poveri)
    if(fk===0)endDirt(side);
    else if(fk===2){const [a,w]=endBand(side,0.25,3.5);px(a,y0,w,y1-y0,'rgba(16,40,28,.12)');}   // stadio: fascia di prato piu' scura dove stanno i fotografi
  }
  if(fk===0){endPath(side,wx);endFence(side,4.7,wx);}
  else if(lv===2)endHedge(side,4.4,wx);
  else if(lv===3)endRail(side,4.5,wx);
}
// chiazze di terra nell'erba rada: ovali sfrangiati, sempre negli stessi posti
function endDirt(side){
  for(let i=0;i<7;i++){
    const h=ihash(i,side*17+5),d=0.9+(h%100)/100*2.2,wy=((h>>>8)%1000)/1000*(FIELD_W+2)-1,r=0.5+((h>>>18)%100)/100*0.9;
    const x=sxw(endX(side,d)),y=syw(wy),rx=Math.max(2,ri(r*S)),ry=Math.max(1,ri(r*S*0.55));if(x<-rx||x>VW+rx)continue;
    pell(x,y,rx,ry,'#9b8358');pell(x-1,y-1,Math.max(1,rx-2),Math.max(1,ry-1),'#a8915f');
    for(let k=0;k<4;k++){const q=ihash(i*7+k,side+91);px(x-rx+(q%(2*rx+1)),y-ry+((q>>>8)%(2*ry+1)),1,1,k%2?'#7c6a47':'#c2ad7e');}   // sassolini
  }
}
// sentiero di terra battuta lungo il fondo, con i bordi irregolari
function endPath(side,wx){
  const [y0,y1]=endRows(),c=wx===2?'#d9e2ec':(wx===1?'#7e6b4a':'#a38c60'),c2=wx===2?'#c9d4e0':(wx===1?'#6d5c3f':'#8f7a52');
  for(let y=y0;y<y1;y+=2){
    const w=(y-OYi)/S,j=nz(w*0.7,side*13+2)*0.5,k=nz(w*0.9,side*13+7)*0.4;
    const a=sxw(endX(side,3.2+j)),b=sxw(endX(side,4.05+k)),L=Math.min(a,b),R=Math.max(a,b);
    px(L,y,R-L,2,c);if(ihash(y,side+3)%5===0)px(L+1+(ihash(y,side)%Math.max(1,R-L-2)),y,1,1,c2);
  }
}
// rete metallica verde: maglie a rombi, pali ogni 2,5 m con il tappo, corrimano in alto
function endFence(side,d,wx){
  const [y0,y1]=endRows(),x=sxw(endX(side,d));if(x<-4||x>VW+4)return;
  const mesh=wx===2?'rgba(230,238,246,.75)':'rgba(176,196,180,.55)';
  for(let y=y0;y<y1;y++){px(x+((y>>1)&1?0:2),y,1,1,mesh);if((y&3)===0)px(x+1,y,1,1,mesh);}
  px(x+3,y0,1,y1-y0,'rgba(20,40,30,.25)');   // ombra della rete sull'erba
  for(let wy=-1.5;wy<=FIELD_W+1.2;wy+=2.5){const y=syw(wy);if(y<y0-4||y>y1)continue;px(x-1,y-3,4,6,PAL.out);px(x,y-2,2,4,'#4f7a5a');px(x,y-2,1,4,'#6f9a78');}   // pali verdi
  px(x+1,y0,1,y1-y0,'rgba(90,120,100,.55)');
}
// siepe: cespugli scuri con le foglie chiare, il bordo verso il campo a festoni
function endHedge(side,d,wx){
  const [y0,y1]=endRows(),sg=side?1:-1;
  for(let y=y0;y<y1;y+=2){
    const w=(y-OYi)/S,e=nz(w*1.3,side*5+11)*0.45,a=sxw(endX(side,d+e)),b=sxw(endX(side,d+1.3)),L=Math.min(a,b),R=Math.max(a,b);
    if(R<0||L>VW)continue;
    px(L,y,R-L,2,wx===2?'#2f5a3c':'#2d5a33');
    const lit=sg>0?L:R-2;px(lit,y,2,2,wx===2?'#e9f0f7':'#3f7a45');   // il lato verso il campo prende luce (o neve)
    for(let k=0;k<2;k++){const q=ihash(y*3+k,side+57),xx=L+2+(q%Math.max(1,R-L-3));px(xx,y+(k&1),1,1,wx===2?'#f4f8fc':(q&8?'#4f8a52':'#22472a'));}
  }
}
// ringhiera del campo comunale: due tubi azzurri sui paletti
function endRail(side,d,wx){
  const [y0,y1]=endRows(),x=sxw(endX(side,d));if(x<-4||x>VW+4)return;
  px(x-1,y0,4,y1-y0,PAL.out);px(x,y0,2,y1-y0,'#8fb3cc');px(x,y0,1,y1-y0,'#c6dcea');
  for(let wy=-1.5;wy<=FIELD_W+1.2;wy+=2){const y=syw(wy);if(y<y0||y>y1)continue;px(x-1,y-1,4,3,PAL.out);px(x,y,2,1,'#6d8ea6');}
  if(wx===2)px(x,y0,1,y1-y0,'#f4f8fc');
}
// ---- oggetti per terra, di lato ----
// zaino, borsone, borraccia, pila di dischi, felpe e frigo portatile: b/B colore (ombra/luce), w bianco, k tappo, J/j felpa, C corpo del frigo, L coperchio
const SP_PACK=[".ooo.","oBBBo","obbbo","obBbo","obbbo","ooooo"];
const SP_DUFFEL=["...ooo...","..o...o..","ooooooooo","oBBBBBBBo","obwbbbwbo","obbbbbbbo","ooooooooo"];
const SP_BOTTLE=[".o.","oko","owo","obo","obo","ooo"];
const SP_DISCS=[".ooooo.","owwwwwo","oyyyyyo","owwwwwo","orrrrro",".ooooo."];
const SP_HOODIE=["..oooo..",".oJJjJo.","oJjJJJjo","oooooooo"];
const SP_COOLER2=["..oooo..","oooooooo","oLLLLLLo","oooooooo","oCCCCCCo","oCwwCCCo","oCCCCCCo","oooooooo"];
const END_C={o:PAL.out,w:'#f4f4f4',k:'#2b3142',y:'#ffd23f',r:'#e8473f',L:'#e9eef5'};
function endObj(x,y,sp,m,fl){if(x<-12||x>VW+12)return;pell(x,y+1,Math.max(2,sp[0].length>>1),1,'rgba(10,30,10,.22)');sprShade(x,y,sp,Object.assign({},END_C,m),fl);}
// gazebo pieghevole della squadra, di tre quarti: quattro gambe, tetto a piramide nel colore della squadra, balza bianca a festoni
function gazebo3q(x,y,c,wx){
  const w=Math.max(16,ri(3*S)),hl=12,hr=6,dk=5;if(x+w<-4||x-w>VW+4)return;   // y = piedi delle gambe davanti
  const X=ri(x-w/2),r=ramp16(c,0),top=wx===2?'#f4f8fc':r[0];
  pell(ri(x),y-1,ri(w/2)+2,3,'rgba(10,30,10,.25)');   // ombra del tetto
  for(const lx of [X+2,X+w-3])px(lx,y-dk-hl,1,hl,'#5d6375');   // gambe dietro
  for(const lx of [X,X+w-1]){px(lx-1,y-hl-1,3,hl+2,PAL.out);px(lx,y-hl,1,hl,'#9aa4b4');}   // gambe davanti
  const yb=y-hl-1;   // fondo della balza
  for(let k=0;k<hr+dk;k++){   // tetto: dalla punta (in alto) alla gronda
    const t=k/(hr+dk-1),ww=Math.max(2,ri(4+(w+2)*t)),xx=ri(x-ww/2),yy=yb-3-(hr+dk)+k;
    px(xx-1,yy,ww+2,1,PAL.out);px(xx,yy,ri(ww/2),1,k===0?top:r[0]);px(xx+ri(ww/2),yy,ww-ri(ww/2),1,r[1]);
    if(k>1)px(ri(x)-1,yy,1,1,r[2]);   // costola centrale
  }
  px(X-2,yb-3,w+4,4,PAL.out);px(X-1,yb-2,w+2,2,'#f4f4f4');   // balza
  for(let xx=X-1;xx<X+w+1;xx+=3)px(xx,yb,2,1,'#f4f4f4');   // festoni
  px(X-1,yb-2,w+2,1,cShade(c,0.1));
}
