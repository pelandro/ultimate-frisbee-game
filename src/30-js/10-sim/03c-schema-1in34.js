/* ---- SCHEMA «1 in 3-4» ----
   Tre handler (chi ha il disco al centro, gli altri due indietro sulle linee laterali) e quattro cutter in fila orizzontale a meta' campo.
   Primi tagli: C1 (lato alto) e C2 vengono incontro verso il centro, C4 (lato basso) attacca la profondita', C3 resta.
   Due continuazioni (PB_VAR: l'IA sceglie B 7 volte su 10; chi gioca lancia dove vuole, la variante decide solo i tagli dei compagni):
   - A: passaggio a C2 che e' venuto incontro; poi C3 libera verso la linea laterale bassa e C4 torna incontro dal profondo e riceve.
   - B: nessun passaggio sotto: C1 e C2 liberano verso il basso, C4 torna incontro dal profondo verso il lato alto e riceve, C3 va profondo;
     poi lancio lungo a C3 vicino alla meta, mentre gli handler si riposizionano e i giocatori in basso avanzano lungo la linea.
   Coordinate ricavate dalle schede disegnate (64 m tra le linee di meta, 37 m di larghezza), relative a dove parte chi ha il disco. */
const I34_SET={H2:[-5,7],H3:[-5,30],C1:[23.5,3.6],C2:[23.5,13.6],C3:[23.5,23.2],C4:[23.5,32.6]};
const I34_GO0={C1:[[12.7,15.2]],C2:[[16.1,21.5]],C3:[[23.5,23.2]],C4:[[48,20.2]]};   // primi tagli, uguali nelle due varianti (C3 resta al suo posto)
PLAYBOOK.i34a={stall:5,phases:[
  {pass:['C2'],ready:'C2',set:I34_SET,go:I34_GO0},
  {pass:['C4'],ready:'C4',readyR:3,readyT:4,go:{C3:[[26,32]],C4:[[39.7,15.2]],C1:[[12.7,15.2]]}}   // C4 riceve quando e' tornato incontro, non mentre parte
]};
PLAYBOOK.i34b={stall:6,phases:[
  {pass:[],ready:'C4',readyR:3,readyT:4,auto:true,set:I34_SET,go:I34_GO0,alt:{C2:['i34a',1]}},   // auto: quando C4 e' lontano passa da sola alla fase dopo (nessun passaggio sotto); se il disco va comunque a C2 si continua come in A
  {pass:['C4'],ready:'C4',readyR:4,readyT:3.5,go:{C4:[[27.8,9.4]],C3:[[50.5,23.8]],C2:[[16,31.6]],C1:[[8.4,31.6],[29.3,31.7]],H3:[[7.7,32.7]]}},
  {pass:['C3'],ready:'C3',go:{C3:[[54.5,21.7]],H2:[[8.1,17.7]],H1:[[3.9,31.5]],C1:[[40.5,32.6]],C2:[[26.6,33.1]],H3:[[15.9,33.6]]}}
]};
PB_VAR.i34=[['i34b',0.7],['i34a',0.3]];
SLOTS.i34=[[-6,'r',0],[-5,'a',7],[-5,'a',30],[22,'a',4],[22,'a',14],[22,'a',23],[22,'a',33]];   // gioco libero: la stessa formazione di partenza
SCH_ATT.push('i34');
// controgioco e resa misurata (vedi SCH_FIT e SCH_EFF in 03-movimento-schemi.js): il lancio lungo dopo il ritorno di C4 soffre gli aiuti, i tagli incontro la zona;
// contro l'uomo che forza dentro i tagli verso il centro sono liberi. SCH_EFF: 400 possessi per casella, livello Difficile, come le altre righe
SCH_FIT.i34={man_out:-0.1,man_in:-0.2,zone:0.6,man_poach:0.7};
SCH_EFF.i34={man_out:22,man_in:27,zone:25,man_poach:24};
