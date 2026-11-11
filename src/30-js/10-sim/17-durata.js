/* ---- DURATA DELLA PARTITA ----
   Arcade: si vince a 7 punti (la partita di sempre). Competitiva: 11. Lunga: 15, come nelle partite vere.
   G.target e' il punteggio che chiude la partita: newGame() lo riporta a 7 e ogni modalita' lo imposta dopo (carriera: SV.len; partita veloce e torneo: la scelta fatta).
   L'half time arriva quando una squadra segna la meta' (arrotondata in su) dei punti. Tutto il resto scala con la durata:
   - l'esperienza di una partita vale quanto quella di una partita ai 7 (lenK), cosi' la carriera non cresce piu' in fretta con le partite lunghe;
   - le partite simulate arrivano allo stesso punteggio (simMatch con il traguardo) e le statistiche ricostruite seguono. */
const LEN_OPTS=[{n:7,name:'Arcade',txt:'Si vince a 7 punti: la partita di sempre, una decina di minuti.'},
  {n:11,name:'Competitiva',txt:'Si vince a 11 punti: contano di più cambi, energie e linee.'},
  {n:15,name:'Lunga',txt:'Si vince a 15 punti, come nelle partite vere: una maratona.'}];
const lenOk=n=>LEN_OPTS.some(o=>o.n===n)?n:MATCH_TARGET;
const halfAt=()=>Math.ceil((G.target||MATCH_TARGET)/2);
const lenK=()=>MATCH_TARGET/(G.target||MATCH_TARGET);   // 1 ai 7 punti, 0,64 agli 11, 0,47 ai 15
