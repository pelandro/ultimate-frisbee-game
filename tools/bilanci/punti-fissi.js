/* PUNTI FISSI DEL BILANCIAMENTO, concordati con chi cura il gioco. Li controlla tools/test-bilanci.js con carriere simulate.
   Si cambiano SOLO se viene chiesto esplicitamente di rendere il gioco piu' facile o piu' difficile: in quel caso si aggiornano qui, con la data e il
   motivo nel commento, e nello stesso aggiornamento. Una modifica a Overall, strutture, staff, stipendi, entrate o crescita che li rompe va corretta,
   non accompagnata da soglie piu' larghe.
   Le misure sono carriere simulate deterministiche (stesso seme), ma ogni cambio al codice sposta i numeri casuali: le soglie lasciano un margine
   per questo «rumore» e restano strette dove conta (nessuno in rosso, niente fughe). */
module.exports={
  economia:{
    seasons:3,seed:5,
    // squadre provate: «niente» = senza spendere; «max» = strutture e staff al massimo da subito; trim = rosa ridotta vendendo a inizio stagione
    runs:[
      {team:'BFD La Fotta Offence',kind:'top'},{team:'midA',kind:'mid'},{team:'lowC',kind:'low'},
      {team:'Boston DiG',kind:'top'},{team:'Denver Johnny Bravo',kind:'mid'},
      {team:'Mooncatchers',kind:'top'},{team:'Wall City',kind:'top'},{team:'Clapham Ultimate',kind:'top'},
      {team:'BFD La Fotta Offence',kind:'top',mode:'max'},{team:'Boston DiG',kind:'top',mode:'max'},{team:'Clapham Ultimate',kind:'top',mode:'max'},
      {team:'Clapham Ultimate',kind:'top',trim:16},{team:'Wall City',kind:'top',trim:16}
    ],
    nobodyRed:true,          // E1: senza spendere nessuno va in rosso e nessuno viene esonerato (vertice, meta' classifica, ultima di Serie C)
    maxRedDays:2,            // E2: con tutto al massimo un club di vertice non sta in rosso piu' di 2 giornate in 3 stagioni, non e' esonerato e chiude piu' ricco di come parte
    midSeason:[-60,450],     // E3: meta' classifica in pari: guadagno medio a stagione (premi compresi) tra -60 e +450
    topSeason:[100,650],     // E4: vertice senza spendere: 1-2 buoni acquisti a stagione, non di piu' (guadagno medio a stagione)
    trimSale:650,            // E5: svuotare una rosa lunga fino a 16 non rende piu' di 650 crediti in un colpo...
    trimExtra:300            //     ...e dopo non fa guadagnare piu' di 300 crediti a stagione oltre alla stessa squadra con la rosa intera
  },
  crescita:{
    // ultima della Serie C, difficolta' facile, partite «giocate bene» (+7 di forza nelle tue). 18 carriere: con 9 il conto degli scudetti oscillava
    // troppo da una modifica all'altra (da 4 a 8 su 9 con lo stesso gioco) e la prova avrebbe dato falsi allarmi
    seeds:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],seasons:10,skill:7,xp:1.3,
    reachA:[6,14],           // G1: in Serie A entro la 6a stagione in almeno 14 carriere su 18
    title:[10,7],            // G2: primo scudetto entro la 10a stagione in almeno 7 su 18 (misurato a novembre 2026: circa la meta', all'8a-10a stagione;
                             //     accordo del 17/11/2026: «8/9 stagioni vanno bene», la crescita dalla Serie C non si tocca)
    early:[7,2],             // G3: non troppo facile: scudetto prima della 7a stagione al massimo in 2 su 18
    runaway:4,               // G4: niente fughe: in Serie A mai piu' di 4 punti di forza sopra la migliore delle altre (era 97 contro 92)
    win:[0.6,0.82]           // G5: vittorie della tua squadra in tutta la carriera
  },
  // file che toccano questi equilibri: se una pull request ne cambia uno, la verifica di GitHub lancia anche tools/test-bilanci.js
  files:[
    /^src\/30-js\/30-carriera\/00-.*ovr/, /^src\/30-js\/38-ovr\//, /^src\/30-js\/35-usa\/0[0-3]-/, /^src\/30-js\/37-leghe\/0[0-2]-/,
    /^src\/30-js\/30-carriera\/(05-economia|06-mercato|08-evoluzione|11-carriera-dinamica|11-progressione|12-allenamenti|12-progressione-club|16-bilancio|23-traguardi|25-staff|26-economia-partita|27-obiettivi-sponsor|29-potenziali|31-mercato-ia)/,
    /^src\/30-js\/10-sim\/(12-allenamenti-rose|13-partite-simulate|20-sorprese-crescita|21-due-linee)/,
    /^tools\/bilanci\//, /^tools\/test-bilanci\.js$/
  ]
};
