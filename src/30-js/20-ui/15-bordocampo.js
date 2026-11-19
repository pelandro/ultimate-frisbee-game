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
// lato basso: panchine, staff e cameraman (24-bordocampo-persone.js), con la neve il cumulo spalato davanti, poi la fila di cartelloni (18-cartelloni.js)
function drawSideline(y1){
  if(y1>VH)return;
  nearSide(y1);
  if((G.wx|0)===2)snowBankH(y1+13,3,6,23);
  drawBottomBoards(y1+14,null);
  nearStand(y1);   // sotto i cartelloni, sugli schermi alti: la tribuna vicina vista da dietro (23-tribune.js)
}
