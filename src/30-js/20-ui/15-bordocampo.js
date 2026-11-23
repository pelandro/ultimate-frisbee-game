/* ---- BORDO CAMPO: cartelloni e panchine (le mete dipinte con le strisce del taglio stanno in 25b-scritte-dipinte.js) ----
   Il campo era un prato uniforme con le mete slavate e il lato basso vuoto: qui si aggiungono gli elementi che danno profondita'.
   Tutto e' disegnato in coordinate del mondo (scorre con la camera) e costa pochi rettangoli per fotogramma: le trame sono pattern creati una volta. */
// lato basso: panchine, staff e cameraman (24-bordocampo-persone.js), con la neve il cumulo spalato davanti, poi la fila di cartelloni (18-cartelloni.js)
function drawSideline(y1){
  if(y1>VH)return;
  nearSide(y1);
  if((G.wx|0)===2)snowBankH(y1+13,3,6,23);
  drawBottomBoards(y1+14,null);
  nearStand(y1);   // sotto i cartelloni, sugli schermi alti: la tribuna vicina vista da dietro (23-tribune.js)
}
