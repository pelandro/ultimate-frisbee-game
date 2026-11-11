/* ---- INTESA TRA COPPIE (handler-cutter): partite giocate insieme in linea ----
   G.duo[«nomeA|nomeB»] = livello 0..1, riempito all'avvio della partita dalla carriera (SV.duo). Vale solo per la tua squadra.
   Effetto, volutamente moderato: sul lancio tra i due la dispersione cala fino al 10%, e chi riceve perde fino al 30% di probabilita' di far cadere il disco. */
const DUO_SIG=0.1,DUO_DROP=0.3,DUO_FULL=12;   // DUO_FULL: partite insieme per l'intesa piena
const duoKey=(a,b)=>a<b?a+'|'+b:b+'|'+a;
function duoOf(a,b){
  if(!a||!b||a.t!==0||b.t!==0||!G.duo)return 0;
  return G.duo[duoKey(a.full||a.name,b.full||b.name)]||0;
}
