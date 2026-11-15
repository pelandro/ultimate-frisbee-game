/* ---- TUTORIAL COMPLETO: i contenuti ----
   TUT = capitoli {id, t: titolo, sub: riga d'elenco, intro, les: lezioni}; lezione = {id, t, w: dove si trova (facoltativo), b: blocchi, tip: trucco}.
   Un blocco e' un paragrafo (stringa) oppure un elenco (array di stringhe); si puo' usare <b>. I fatti vengono dalla Guida a schede (07-guida.html) e dal codice:
   quando una regola cambia, aggiorna qui la lezione che la riguarda. Gli id delle lezioni non si cambiano: li usano i fumetti (TIP_LES in 21-tutorial.js) e il progresso salvato. */
const TUT=[];

TUT.push({id:'ini',t:'Per iniziare',sub:'L’obiettivo, i menu, i comandi e il primo allenamento.',
intro:'Cinque lezioni per partire bene: che cosa si fa, dove si trova ogni cosa e come si comanda il gioco.',
les:[
{id:'ini-gioco',t:'Che cosa si fa',b:[
`L’Ultimate si gioca in due squadre da 7, con un disco. Per segnare devi portare il disco nella <b>meta</b> avversaria passandolo ai compagni: <b>chi ha il disco non può correre</b>, quindi si avanza solo lanciando.`,
`Vince chi arriva per primo al punteggio scritto in alto: 7 punti in modalità Arcade, 11 in Competitiva, 15 in Lunga.`,
[`Se il disco cade a terra, esce dal campo o viene intercettato, passa agli avversari: è un <b>turnover</b>.`,`Chi ha il disco ha un <b>conteggio di 10 secondi</b> (lo stall): se arriva a 10 senza lanciare, perdi il disco.`,`Dopo ogni meta le squadre cambiano campo e chi ha segnato tira il <b>pull</b> (il lancio lungo di inizio punto).`]],
tip:`Non serve sapere le regole a memoria: nelle prime tre partite compaiono delle schede che spiegano ogni cosa nel momento in cui serve.`},
{id:'ini-menu',t:'I menu del gioco',w:'Menu iniziale',b:[
`Dal menu iniziale scegli come giocare:`,
[`<b>Carriera</b>: la modalità principale. Guidi una squadra per più stagioni, con rosa, mercato, allenamenti, strutture, staff e campionati veri. Il tasto accanto, «Carriere», mostra i tre slot di salvataggio.`,
`<b>Partita veloce</b>: scegli due squadre qualsiasi e giochi subito, senza conseguenze.`,
`<b>Ultimate Team</b>: apri pacchetti di carte, scegli i 7 titolari e vinci un torneo (anche contro le squadre degli altri giocatori).`,
`<b>Torneo</b>: crei un torneo a eliminazione diretta con 4, 8 o 16 squadre.`,
`<b>Allenamento</b>: il tutorial guidato in sette lezioni pratiche, l’allenamento libero e le sfide di abilità con medaglie.`],
`In alto trovi <b>Tutorial</b> (questo manuale), <b>Guida</b> (la consultazione a schede, utile quando cerchi una regola precisa), <b>Audio</b> e <b>Impostazioni</b>.`],
tip:`Se sei nuovo, fai prima il percorso «Allenamento › Tutorial»: ogni lezione si supera facendo ciò che spiega.`},
{id:'ini-comandi',t:'I comandi',b:[
`Il gioco funziona con il tocco, la tastiera e il controller.`,
[`<b>Touch</b>: il lancio si fa trascinando il dito all’indietro e rilasciando; i compagni si chiamano con un tocco; in difesa i pulsanti rossi in basso fanno handblock e tuffo.`,
`<b>Tastiera</b>: frecce o WASD per la direzione, Spazio o J per lanciare (tieni premuto per caricare, rilascia per tirare), Maiusc o K per il lancio alto (in difesa il tuffo), E = taglio, Q = isolamento, C = clear, Esc = annulla, Invio = salta il possesso avversario.`,
`<b>Controller</b>: stick o croce per la direzione, A o RT per lanciare, X o B per il lancio alto, Y per «Salta».`,
`<b>Mouse</b>: si trascina come con il dito.`],
`Dalle <b>Impostazioni</b> regoli sensibilità del trascinamento, dimensione e posizione dei pulsanti, audio, meteo e vento.`,
`Sul telefono il campo si gioca in orizzontale: se tieni il telefono in verticale il gioco si gira da solo.`]},
{id:'ini-primi',t:'I «Primi passi» in partita',b:[
`Nelle prime tre partite compaiono in alto delle schede che spiegano il gioco <b>una alla volta e al momento giusto</b>: obiettivo, pull, ricezione, lancio, chiamate ai compagni, stall, lancio alto, difesa e cosa succede dopo la meta, poi schemi, timeout e simulazione.`,
`Ogni scheda ferma il gioco: premi «Capito» (o Invio) per continuare, oppure «Salta il tutorial» per spegnerle tutte. Quello che hai già visto non si ripete.`,
`Per rivederle: <b>Opzioni › Suggerimenti</b>, spegni e riaccendi.`],
tip:`Anche i fumetti della carriera (quelli che spiegano Rosa, Mercato, Club…) si riattivano da lì.`},
{id:'ini-alle',t:'Il tutorial guidato e le sfide',w:'Menu › Allenamento',b:[
`Nel menu <b>Allenamento</b> c’è il tutorial pratico in sette lezioni: lancio, tagli, tipi di lancio, stall, meta, difesa e pull. Si supera una lezione facendo davvero ciò che spiega, e il gioco ricorda a che punto sei («Riprendi»).`,
`Poi c’è l’<b>allenamento libero</b> (senza punteggio, con o senza difesa) e quattro sfide con medaglie: Precisione, Break, Huck e duelli, Difesa e layout.`],
tip:`L’allenamento libero senza difesa è il posto migliore per imparare a mirare un huck o un rovesciato senza paura di perdere il disco.`}
]});

TUT.push({id:'att',t:'In partita: attacco',sub:'Pull, lanci, rovesciato, chiamate ai compagni, scatto, stall.',
intro:'Tutto quello che puoi fare quando hai il disco o lo stai per avere.',
les:[
{id:'att-pull',t:'Il pull',b:[
`Ogni punto comincia con un pull. Si decide in due tocchi:`,
[`Prima la barra della <b>POTENZA</b>: il cursore sale e scende, tocca (o Spazio) per fermarlo. <b>Verde</b> = il disco arriva nella meta avversaria; giallo o prima = corto; rosso = rischia di uscire dal fondo.`,
`Poi la barra della <b>DIREZIONE</b>: spazza il campo da una linea laterale all’altra, ferma nel verde (al centro) o almeno nel giallo. Nel rosso esce di lato.`],
`Sul campo vedi dove cadrebbe il disco: <b>FUORI</b> (rosso), <b>CORTO</b> (bianco), <b>BUON PULL</b> (verde) o <b>GRAN PULL</b> (oro, ben in fondo alla meta).`,
`Con un gran pull chi riceve parte con lo stall già a 3 e i suoi tagliatori aspettano di più; con un pull corto o fuori l’attacco avversario ha via libera. Se il pull esce si riparte dal brick (il segno × al centro, a 18 m dalla meta).`],
tip:`Chi tira conta: con Lancio e Sparo alti le barre vanno piano. Scegli come tiratore chi ha i valori migliori.`},
{id:'att-lancio',t:'Il lancio a trascinamento',b:[
`Non c’è nessun pulsante: quando hai il disco <b>tocca dove vuoi, trascina il dito all’indietro e rilascia</b>. Il disco parte nella direzione opposta al trascinamento e tanto più lontano quanto più lo allunghi.`,
[`L’arco a quadretti mostra dove arriva e accanto compare la distanza.`,`I passaggi corti sono più precisi; da 30 m in su è uno sparo.`,`Per annullare riporta il dito vicino a dove avevi toccato: compare «ANNULLA».`],
`Toccare un compagno <b>non</b> gli passa il disco: lo manda in taglio (vedi «Chiamare i compagni»).`],
tip:`Lancia dove il compagno sta correndo, non dove si trova adesso: l’arco ti mostra il punto d’arrivo.`},
{id:'att-mira',t:'Mira assistita e leggere il lancio',b:[
`La direzione del dito conta più della distanza: se punti verso un compagno e carichi più o meno fino a lui, il lancio si <b>aggancia</b> a lui anche se sbagli di qualche metro. Il compagno agganciato ha un anello e una freccia.`,
[`Il <b>cerchio tratteggiato</b> attorno al mirino è l’errore possibile: cresce con la distanza, la pressione (stall, marcatore addosso), i lanci difficili e se rilasci in fretta senza mirare.`,
`L’<b>arco rosso</b> è il limite della tua gittata (dipende dallo Sparo). Oltre, il disco cade corto: la mira scrive «MAX … m: CORTO».`,
`Se un difensore fa in tempo a mettersi sulla traiettoria, l’arco <b>lampeggia in rosso con una croce</b> nel punto in cui verrebbe intercettato: cambia bersaglio o lancia alto.`],
`In Facile l’anello del compagno è verde (sicuro), giallo (incerto) o rosso (rischioso). Dal Medio in su il colore sparisce, in Estrema anche l’anello e la traiettoria.`],
tip:`Prima di rilasciare guarda sempre la croce rossa: è il modo più semplice per non regalare intercetti.`},
{id:'att-tipi',t:'Tipi di lancio e rovesciato',b:[
`Il tipo si sceglie con le <b>dita</b> mentre miri: <b>una dita = piatto</b>, <b>due dita insieme = alto</b> (il rovesciato). Puoi appoggiare la seconda dita anche mentre stai già mirando. Dal lancio dopo si torna al piatto.`,
[`<b>Piatto</b>: Rovescio o Dritto, secondo il lato da cui conviene rilasciare per girare attorno al marcatore. Il rovescio è il più preciso; il dritto parte prima (meno handblock) e viaggia veloce, ma perde precisione oltre i 16 m. Da 30 m è un <b>huck</b>, lungo e galleggiante, che usa lo Sparo.`,
`<b>Alto — Scoober</b> (fino a 14 m): rapido, scavalca le mani del marcatore.`,
`<b>Alto — Hammer</b> (oltre 14 m): arco alto che nessuno intercetta lungo la linea, ma lento e meno preciso (la dispersione è circa una volta e mezza maggiore). Gli handblock riescono solo la metà delle volte.`],
`Il gioco sceglie da solo il lancio adatto e lo scrive accanto al mirino. I lanci piatti curvano: la traiettoria che vedi è quella vera.`,
`Lo sparo (oltre 30 m) è sempre alto ma non conta come Hammer.`],
tip:`Marcatore addosso e cono rosso davanti? Prova il rovesciato a due dita: passa sopra la testa del difensore. Con Lancio basso, però, meglio il piatto.`},
{id:'att-chiama',t:'Chiamare i compagni',b:[
`Le <b>chiamate rapide</b> si fanno toccando i compagni senza trascinare:`,
[`<b>Tocco su un compagno</b> = taglio: un cutter vicino al disco va lungo, uno già lontano torna incontro sul lato aperto; un handler dietro o di fianco ti offre lo scarico (<b>reset</b>) sul lato lasciato libero dal marcatore.`,
`<b>Tieni premuto</b> su un compagno = <b>isolamento</b>: taglia lui e gli altri liberano il corridoio.`,
`<b>Tocco sul portatore</b> = clear: tutti tornano in posizione e ripartono.`],
`Da tastiera: E = taglio, Q = isolamento, C = clear, verso il compagno indicato dalle frecce.`,
`Se miri su una zona libera del campo è come dire a un compagno di correre lì: il più vicino parte subito e il disco gli arriva davanti. Più tieni il mirino fermo, più guadagna spazio.`,
`In Facile e Medio un breve tratto verde mostra da che parte parte ogni compagno (azzurro quello che hai chiamato tu); in Difficile ed Estrema non c’è nessun segnale.`],
tip:`Isola il tuo cutter più veloce contro il marcatore più lento: è il modo più facile di creare un vantaggio.`},
{id:'att-sparo',t:'Sparo, scatto e gioco lungo',b:[
`Oltre 30 m il lancio è uno <b>sparo</b>. Quanto lontano arriva dipende dalla statistica Sparo: con 20 circa 30 m, con 60 circa 65 m, con 99 tutto il campo.`,
`Sui lanci lunghi il tuo giocatore che corre al punto d’arrivo (il ricevitore se attacchi, il difensore più vicino se difendi) ha una freccia, un cerchio e una barra di energia: <b>tieni premuto lo schermo</b> (o il pulsante tondo col fulmine in basso a destra) per fargli <b>scattare</b>, +15% di velocità, ma consuma più energia (meno con la Resistenza alta).`,
`I compagni lo sanno: con un lanciatore che non spara partono pochi tagli lunghi, con uno da tutto campo ne partono di più e più lontano. Compagni con velocità e salto alti tendono ad andare in profondità.`],
tip:`Uno scatto sprecato stanca il giocatore per il resto del punto: usalo solo quando il disco è davvero contendibile.`},
{id:'att-prese',t:'Prese, duelli e tuffi',b:[
`Ogni giocatore ha la statistica <b>Presa</b>. Una presa facile riesce quasi sempre; diventa difficile se il disco arriva al limite della portata, se si corre, se c’è un difensore addosso, se il lancio è un hammer e se si è stanchi. Se il disco sfugge («Presa mancata») l’errore è di chi riceve, non di chi lancia.`,
`Nei duelli contano salto, posizione, chi arriva prima e le mani di chi riceve. L’Agilità decide quanto in fretta si frena e si cambia direzione.`,
`Il <b>tuffo</b> scatta da solo se il disco cade oltre la portata ma abbastanza vicino. Nei duelli in aria e nei tuffi <b>tocca quando l’indicatore è nel verde</b> per avere un bonus.`],
tip:`Gli avversari sfiniti hanno una goccia di sudore: è lì che conviene cercare il duello.`},
{id:'att-stall',t:'Stall, serie e momenti decisivi',b:[
`Il marcatore conta ad alta voce: da 6 in su il numero compare sopra chi ha il disco. A 9 c’è l’<b>ULTIMO LANCIO</b>, a 10 perdi il disco. Se il numero sale, passa subito, anche corto.`,
`Il <b>timeout</b> (uno a partita, in basso a sinistra, solo quando hai il disco) azzera lo stall, fa recuperare un po’ di energia e permette di cambiare schema.`,
[`<b>Serie positiva</b>: più di 10 lanci riusciti di fila = alone rosso e lanci un po’ migliori, finché sbagli.`,`<b>Serie negativa</b>: due errori di fila = alone azzurro e lanci un po’ peggiori, finché ne completi due.`,`<b>MATCH POINT</b> a un punto dalla vittoria, <b>UNIVERSE POINT</b> se lo sono entrambe.`]],
tip:`Con lo stall alto non cercare il lancio perfetto: uno scarico corto vale più di un huck forzato.`},
{id:'att-vento',t:'Vento, pioggia e neve',b:[
`Ogni partita ha il suo <b>vento</b> (calma, brezza, vento, vento forte), indicato in alto a destra con una freccia. Sposta il punto d’arrivo del disco, tanto più quanto più resta in aria: passaggi corti e tesi quasi non lo sentono, spari e hammer sì. Con il vento alle spalle si lancia più lungo, controvento meno. Si alterna ogni meta perché si cambia campo.`,
`Circa una partita su tre ha <b>pioggia o neve</b>: il disco bagnato o gelato rende le prese più difficili e i lanci un po’ meno precisi.`,
`Chi ha Lancio e Sparo alti compensa quasi tutto. Il cerchio tratteggiato della mira mostra comunque dove finirà davvero il disco.`],
tip:`In carriera il meteo si legge sul cruscotto prima di partire. Con vento forte scegli schemi con passaggi corti. Si spegne da Impostazioni › Meteo.`}
]});

TUT.push({id:'dif',t:'In partita: difesa',sub:'Difesa automatica o manuale, handblock, tuffo, intercetti e Callahan.',
intro:'Come difendere in modo semplice (da soli o a mano) e come far scattare le giocate che ribaltano il punto.',
les:[
{id:'dif-modi',t:'Difesa automatica o manuale',w:'Impostazioni, Opzioni o Pausa',b:[
`Hai tre modi di difendere:`,
[`<b>Automatica</b> (predefinita): i tuoi difendono da soli seguendo lo schema scelto e il gioco scorre in fretta. Tu scegli la marcatura con il pulsante <b>Marcatura</b> e, quando vuoi, tocchi <b>Salta</b> (Invio, Y sul controller): il possesso avversario viene giocato in un istante dal motore vero e una fascia ti dice com’è finito.`,
`<b>Manuale</b>: guidi tu un difensore (anello azzurro) trascinando il dito o con frecce e stick; se non tocchi nulla marca da solo.`,
`<b>Saltata</b>: ogni possesso avversario si risolve subito.`],
`Si cambia da Impostazioni, Opzioni della carriera o Pausa.`,
`In automatica, circa una volta ogni quattro mete difese arriva un <b>momento a tempo</b>: un tuffo (il gioco rallenta: tocca quando il cerchio si chiude) o un duello in salto.`],
tip:`Hai poco tempo o poca voglia? «Difesa: automatica» più «Salta» ti fa giocare solo l’attacco, che è la parte più divertente.`},
{id:'dif-manuale',t:'Guidare il difensore',b:[
`In difesa manuale uno dei tuoi difensori ha l’<b>anello azzurro</b>. Trascina il dito per farlo correre. Tocca un altro difensore per passare a lui (Tab o Q da tastiera).`,
`Quando l’avversario lancia, il controllo passa da solo al difensore che può arrivare prima al punto d’arrivo: portalo lì per intercettare o contendere il disco.`,
`Il pulsante <b>Marcatura</b> (tasto F) sceglie tra:`,
[`<b>Contenimento</b>: dietro all’uomo, protegge il profondo.`,`<b>Anticipo</b>: davanti all’uomo, toglie i passaggi corti ma rischia sui lanci lunghi. L’anello diventa arancione.`]],
tip:`Contro un attacco che spara tanti huck scegli il contenimento; contro uno che gioca corto e paziente l’anticipo.`},
{id:'dif-block',t:'L’handblock',b:[
`Il marcatore può bloccare il lancio con la mano proprio mentre parte, soprattutto se passi nel <b>cono rosso</b> (il lato che chiude).`,
`In difesa manuale, quando l’avversario sta per lanciare, sul tuo marcatore compare un <b>cerchio che si stringe</b>: premi il pulsante a destra (la mano) quando arriva sull’anello interno. Dopo il tocco il cerchio diventa <b>verde</b> (tempismo giusto), <b>giallo</b> (discreto) o <b>rosso</b> (sbagliato).`,
[`Più è alto il Buco del lanciatore, più il cerchio va veloce; più è alta la Difesa del tuo marcatore, più va piano.`,`Senza tocco la probabilità è 0: bisogna provarci.`,`Il blocco riesce molto più facilmente nel cono rosso e con un lancio piatto (l’hammer lo scavalca).`]],
tip:`Non premere a caso: il verde conta moltissimo. Aspetta il cerchio e tocca quando è sull’anello interno.`},
{id:'dif-tuffo',t:'Tuffo e intercetti',b:[
`Quando l’avversario lancia e un tuo difensore è a distanza di tuffo dal punto d’arrivo, il gioco va al <b>rallentatore</b> e compare un cerchio sul difensore con il pulsante TUFFO. Tocca quando il cerchio arriva sull’anello interno. Più è alto il Tuffo, da più lontano puoi tuffarti (da 3 a 5,4 metri oltre la portata).`,
`Un difensore può anche <b>intercettare lungo il volo</b>, ma solo se il disco gli passa davvero a portata: abbastanza vicino di lato (conta l’Agilità) e abbastanza basso (conta il Salto). Ci riesce più spesso con la Difesa alta, se il disco è lento e se ha avuto tempo di reagire.`,
`I lanci alti (hammer, huck) scavalcano la difesa a metà volo; la zona, che copre gli spazi tra i ricevitori, chiude invece molte linee basse.`],
tip:`In difesa automatica, per il tuffo basta toccare lo schermo in un punto qualsiasi quando il cerchio si chiude.`},
{id:'dif-call',t:'Callahan e dopo il turnover',b:[
`Se un tuo difensore intercetta o blocca e prende il disco <b>nella meta che attacchi tu</b>, segna lui il punto: compare <b>CALLAHAN!</b> in verde. Se succede a te, in rosso: non lanciare vicino alla tua meta con un difensore attorno.`,
`Dopo un turnover nessuno si teletrasporta: il giocatore più vicino corre a raccogliere il disco e si riparte da lì (se il disco è uscito, dal punto in cui ha lasciato il campo).`],
tip:`Vicino alla tua meta, con un difensore addosso, un passaggio corto e sicuro vale più di un lancio rischioso.`}
]});

TUT.push({id:'sch',t:'Schemi e gestione della partita',sub:'Gli schemi d’attacco e di difesa, i cambi, il timeout, l’half time, la simulazione.',
intro:'Gli schemi decidono dove si mettono i giocatori; la gestione della partita decide quando cambiarli. Qui trovi tutto ciò che si fa con i menu di gioco.',
les:[
{id:'sch-menu',t:'Il menu Schemi',w:'In partita › Schemi (a inizio meta)',b:[
`A inizio meta tocca <b>Schemi</b> per scegliere attacco e difesa. Se non lo fai restano quelli di prima. Ogni schema ha una descrizione con punti forti e deboli.`,
`Dallo stesso menu si accendono o spengono «Musica e tifo». Accanto a Schemi trovi anche <b>Cambi</b> e <b>Simula meta</b>.`,
`Ogni schema ha un <b>controgioco</b>: nessuno vince sempre. Impara quale schema batte quale difesa e cambia quando vedi che non funziona.`],
tip:`Hai segnato con uno schema? Ripeterlo funziona finché l’IA non lo riconosce: alterna.`},
{id:'sch-att',t:'Gli schemi d’attacco',b:[
[`<b>Verticale</b>: fila al centro. Apertura: uno viene sotto sul lato aperto, uno va lungo sull’altro. Forte contro l’uomo, soffre la zona.`,
`<b>Orizzontale</b>: cutter in linea larga. Il cutter interno attacca la profondità, quello accanto viene incontro. Allarga e batte la zona; contro l’uomo che forza dentro fatica.`,
`<b>Esagono</b>: tutti spaziati, molti tagli corti. Buono contro gli aiuti, la zona lo chiude.`,
`<b>Stack laterale</b>: i cutter in fila su un lato lasciano mezzo campo libero per i tagli in isolamento (tieni premuto su un compagno). Solido contro la marcatura a uomo, meno contro la zona.`,
`<b>Weave</b>: tre handler che si passano il disco in diagonale correndosi davanti. Guadagna metri contro la zona; contro gli aiuti i passaggi corti si complicano.`,
`<b>T1</b>: schema a sequenza, il più efficace. I giocatori eseguono i movimenti alla lettera tanto più quanto è alta la loro Visione. Si tengono 3 handler dietro e 4 cutter davanti. Se lo ripeti, l’IA (Medio e Difficile) lo riconosce.`],
`Verticale, Orizzontale, Weave e T1 hanno un’<b>apertura</b> che parte a ogni ripresa del gioco (dopo il pull o un turnover). Se il ricevitore previsto è marcato si gioca libero, e dallo stall 3 in poi lo schema si abbandona. Vicino alla meta (meno di 20 m) parte da solo l’attacco in meta, con tagli a L.`],
tip:`Contro la zona: Orizzontale o Weave. Contro l’uomo: Verticale o Stack laterale. Contro gli aiuti: Esagono.`},
{id:'sch-dif',t:'Gli schemi di difesa',b:[
[`<b>Uomo, forza fuori</b>: il marcatore chiude il centro, il disco va verso la linea laterale.`,
`<b>Uomo, forza dentro</b>: il marcatore chiude la linea, i lanci vanno verso il centro.`,
`<b>Zona a coppa</b>: tre sul disco a coppa, quattro dietro a chiudere gli spazi. Ferma Verticale ed Esagono (chiude le linee basse, che i lanci alti scavalcano) ma subisce Orizzontale e T1.`,
`<b>Uomo con aiuti</b>: chi marca un uomo lontano dal disco scala sulle linee di passaggio. Più intercetti, ma un taglio improvviso trova il difensore in ritardo.`]],
tip:`Una zona è ottima contro un attacco che gioca corto, ma un huck ben fatto la batte sempre.`},
{id:'sch-ia',t:'Come ragionano gli avversari',b:[
`Ogni squadra ha uno <b>stile suo</b> (gioco lungo o corto, ritmo alto o possesso paziente, difesa in anticipo o di contenimento, aiuti e raddoppi). Lo leggi nel menu Schemi a inizio meta e nel cruscotto prima della partita.`,
[`L’avversario cerca i <b>mismatch</b> (il tuo compagno più veloce o più alto del suo marcatore) e sceglie il lancio con più probabilità di arrivare.`,
`<b>Ricorda gli schemi che hai usato</b> e, in Medio e Difficile, sceglie sempre più spesso il controgioco di quello che ripeti.`,
`Se completi tanti passaggi corti passa all’anticipo; se lanci spesso lungo al contenimento.`,
`I suoi giocatori stanchi escono davvero per quelli freschi in panchina. Mette il difensore migliore su chi gli fa più male.`],
`La difficoltà cambia come l’avversario decide e reagisce, non le sue statistiche (solo in carriera Difficile ha 2 punti in più).`],
tip:`Cambia schema ogni due o tre mete, anche se funziona: renderai l’IA meno efficace.`},
{id:'sch-cambi',t:'Cambi, energia e infortuni',b:[
`Ogni scatto consuma <b>energia</b> (meno con la Resistenza alta) e un giocatore stanco è più lento. Sotto i tuoi giocatori compare una barretta (gialla, arancione, rossa) quando l’energia cala.`,
`Dalla <b>Rosa</b> scegli le due linee: <b>ATT</b> gioca le mete in cui ricevi il pull, <b>DIF</b> quelle in cui lo tiri. Con i «cambi intelligenti» chi è stanco esce da solo per una meta. A inizio meta puoi sempre cambiare a mano con <b>Cambi</b>.`,
`A fine meta un giocatore molto stanco in campo rischia di <b>infortunarsi</b> (in media circa uno ogni 3 partite se non fai mai cambi). Compare un pannello per scegliere chi entra. L’infortunato salta da 1 a 3 partite e non può né giocare né allenarsi.`,
`Sotto quota 35 di condizione un giocatore è «molto affaticato» e rischia di più.`],
tip:`Ruota i giocatori: un titolare fresco al 100% rende più di una stella al 40%.`},
{id:'sch-tempo',t:'Timeout, half time e pausa',b:[
[`<b>Timeout</b>: uno a partita, solo con il disco in mano (tasto in basso a sinistra). Azzera lo stall, recupera un po’ di energia e permette di cambiare schema.`,
`<b>Half time</b>: quando una squadra segna la metà dei punti (4 su 7, 6 su 11, 8 su 15) compare «Half time» con Schemi, Cambi e Continua. Chi ha iniziato in difesa (il pull) la riprende in attacco.`,
`<b>Pausa</b> (tasto «II» in alto a destra): riprendi, simula la meta, apri la guida, regoli audio e stacchi o abbandoni la partita.`],
`<b>Attenzione</b>: in carriera, nel torneo e in Ultimate Team abbandonare è una <b>sconfitta a tavolino</b>. Per fermarti e riprendere dopo usa <b>Sospendi e continua più tardi</b>: la partita si salva con punteggio, energie e statistiche e dal cruscotto «Riprendi la partita» la fa ripartire.`,
`Se chiudi il gioco durante una partita di carriera, la sospensione si salva da sola.`],
tip:`Usa il timeout quando stai per perdere il disco per stall o hai bisogno di cambiare lo schema nel momento decisivo, non a caso.`},
{id:'sch-sim',t:'Simula meta, Salta e durata',b:[
`<b>Simula meta</b> (a inizio meta, accanto a Schemi e Cambi) gioca la meta in un istante con l’intelligenza artificiale per entrambe le squadre. Contano le stesse statistiche, la stessa fatica e gli stessi schemi e i giocatori raccolgono la stessa esperienza. Dal menu di pausa puoi simulare anche una meta già cominciata.`,
`<b>Salta</b> (in difesa automatica) fa giocare in un istante solo il possesso avversario.`,
`La <b>durata</b> si sceglie nelle Opzioni della carriera, nella partita veloce e alla creazione del torneo: <b>Arcade</b> (7 punti), <b>Competitiva</b> (11), <b>Lunga</b> (15). In Ultimate Team si gioca sempre ai 7. Le partite lunghe non fanno crescere di più.`,
`La <b>difficoltà</b> va da Facile a Estrema: più sale, meno aiuti grafici vedi e meglio reagisce l’IA.`],
tip:`Per le partite senza storia simula; per i derby, le finali e quando c’è qualcosa in palio gioca tu.`}
]});

TUT.push({id:'car',t:'La carriera schermo per schermo',sub:'Cruscotto, Rosa, Mercato, Allenamenti, Club (strutture e staff), Classifica, Avvisi.',
intro:'La carriera dura più stagioni. Qui trovi ogni schermata: a cosa serve, come si usa e cosa conviene fare.',
les:[
{id:'car-inizio',t:'Cominciare una carriera',w:'Menu › Carriera',b:[
`Il tasto <b>Carriera</b> riprende l’ultima giocata; <b>Carriere</b> mostra i tre slot (carriere separate sullo stesso dispositivo). «Nuova carriera» ne comincia una e, se lo slot è pieno, chiede conferma perché lo cancella.`,
[`<b>1. Il campionato</b>: Italia, USA Men’s Club, Belgio, Francia, Germania o Regno Unito (vedi il capitolo sui campionati).`,
`<b>2. La squadra</b>: toccandola vedi il suo roster prima di decidere; con «Squadra del cuore» la metti in cima all’elenco con la stella. In Italia scegli tra Serie A, B e C.`,
`<b>3. L’allenatore</b>: nome, cognome e volto (12 facce in pixel art o «Personaggio casuale»).`,
`<b>4. La partenza</b>: «Scegli la squadra» (l’elenco di sempre) oppure <b>Subentrato</b>: una squadra in crisi ti chiama a una giornata dalla fine ed è in zona retrocessione. Hai una sola partita per salvarla (non finire tra le ultime 2).`]],
tip:`Per cominciare in tranquillità scegli una squadra del tuo livello e parti in Facile: puoi cambiare difficoltà più avanti dalle Opzioni.`},
{id:'car-cruscotto',t:'Il cruscotto',w:'Schermata principale della carriera',b:[
`È la schermata da cui parte tutto. In alto la <b>linea delle giornate</b> (l’ultima partita con il risultato, quella di adesso e la prossima), poi la prossima avversaria con il suo stile e il <b>meteo</b>, la classifica, crediti, reputazione, morale, affiatamento e tifosi.`,
[`<b>Inizia partita</b> (tasto giallo) la gioca; <b>Simula</b> la fa giocare al posto tuo.`,
`<b>Rosa, Allenamenti, Mercato, Club, Classifica</b>: le cinque aree della società. Un numero o «!» e «NEW» ti avvisano di cosa richiede attenzione.`,
`La <b>campanella Avvisi</b> raccoglie ciò che succede ai tuoi giocatori. In alto trovi anche Tutorial, Guida e Opzioni; toccando il volto dell’allenatore cambi nome o volto.`,
`In fondo scorre un <b>consiglio</b> scelto in base a ciò che serve davvero adesso (linee incomplete, giocatori scarichi, conti in rosso, crediti da spendere…).`],
`La prima volta che apri Rosa, Mercato, Club, Allenamenti e Classifica compare un fumetto che spiega la schermata: da lì «Scopri di più» porta alla lezione. Si rivedono dalle Opzioni (Suggerimenti).`],
tip:`Prima di ogni partita: guarda il meteo, controlla la Rosa (infortuni e scarichi) e solo poi premi Inizia.`},
{id:'car-rosa',t:'La Rosa',w:'Cruscotto › Rosa',b:[
`La Rosa mostra i tuoi giocatori come <b>carte</b>: ruolo (colore), faccina dell’umore, stelle (da mezza a cinque), barra verde della condizione e bollini <b>A</b> e <b>D</b> per le linee. In alto scegli chi vedere (tutti, per ruolo, fuori dalle linee, «da gestire») e come ordinarli (Overall, potenziale, età, condizione, stipendio, rendimento).`,
`Tocca una carta (o la freccia) per aprire la <b>scheda</b>, in tre parti:`,
[`<b>Attributi</b>: che cosa sa fare, con il confronto con un compagno («Confronta con»).`,`<b>Prestazioni</b>: ultima partita, stagione e carriera, umore, obiettivo, intesa, premi.`,`<b>Sviluppo</b>: potenziale, crescita, indirizzo, rapporto degli osservatori.`],
`Dalla scheda: <b>Riposo</b> (salta la prossima partita e recupera condizione), <b>Colloquio</b> (4 crediti, solleva l’umore ma funziona meno se lo ripeti), <b>Soprannome</b> (compare in campo e nella Hall of Fame), <b>Specializzazione</b> e <b>priorità di allenamento</b>.`,
`<b>Overall</b> (OVR) è il valore del giocatore nel suo ruolo migliore; la <b>forza della squadra</b> è la media dei 7 migliori. Circa un giocatore su quattro ha un <b>tratto</b> (Deep Threat, Break Specialist, Field General, Lockdown, Sky Dominator, Safe Hands, Explosive Cutter, Ironman).`],
tip:`«Linee consigliate» sistema le linee per te; se una linea ha meno di 7 giocatori o un infortunato, il cruscotto te lo segnala.`},
{id:'car-linee',t:'Le linee ATT e DIF',w:'Rosa › A e D',b:[
`Il gioco ha due squadre da 7: la linea <b>ATT</b> gioca le mete in cui ricevi il pull, la linea <b>DIF</b> quelle in cui lo tiri. I bollini A e D sulle carte li assegnano.`,
`Ogni linea ha bisogno di 7 giocatori. Un titolare può stare in entrambe, ma si stanca di più. <b>Linee consigliate</b> propone attacco con 3 handler e 4 cutter, difesa con i migliori difensori (almeno 2 handler per ripartire dopo un recupero), cercando di non ripetere gli stessi nomi. Un buon equilibrio di ruoli rende più delle sole stelle.`,
`Handler e cutter che giocano insieme costruiscono <b>intesa</b> (fino a 12 partite): meno dispersione sui loro lanci e meno prese perse.`],
tip:`Non cambiare tutta la linea a ogni partita: l’intesa si costruisce restando insieme.`},
{id:'car-mercato',t:'Il Mercato',w:'Cruscotto › Mercato',b:[
`Si rinnova ogni 5 giornate. Ci sono <b>15 giocatori</b> di livello vicino al tuo, divisi per categoria nelle linguette: giovani promesse, svincolati, in vendita da altre squadre e, con la stella, <b>internazionali</b> (giocatori veri del mondo: UFA, nazionale USA, club europei; i più forti arrivano solo con tanta reputazione e crediti).`,
[`<b>Solo chi posso prendere</b> nasconde chi costa troppo, chiede più reputazione o non ha posto in rosa.`,`<b>Ordina per</b>: più economico, più forte, più promettente, più giovane, miglior rapporto qualità/prezzo.`,`<b>Dettagli / Rapporto</b>: ciò che sanno gli osservatori e il confronto con il tuo titolare più debole nel ruolo.`,`Il <b>potenziale</b> è un intervallo che si stringe osservando il giocatore.`],
`Circa metà dei giocatori ha una <b>motivazione</b> scritta sotto il nome: «Vuole giocare» firma solo se sarebbe titolare; «Ambizioso» non scende in Serie C; «Ingaggio alto» costa il 20% in più; «Cerca un progetto» fa lo sconto se Vivaio o Campo di allenamento sono almeno al livello 2.`,
`Con i conti in rosso non si compra.`],
tip:`Un giovane col potenziale alto che oggi è scarso diventa il titolare di domani: osservalo prima di decidere.`},
{id:'car-scouting',t:'Osservazioni e rapporti',w:'Mercato › Osserva / Rapporto',b:[
`Far osservare un giocatore costa crediti (1 in meno per livello della Rete di osservatori). Ogni osservazione sblocca una parte del rapporto:`,
[`La <b>prima</b> mostra i punti di forza.`,`La <b>seconda</b> i punti deboli e il tratto.`,`La <b>terza</b> gli schemi adatti, la compatibilità con il vostro stile e il posto che occuperebbe in squadra.`],
`Chi è adatto al tuo gioco (lungo o corto) si inserisce subito; gli altri tolgono più affiatamento. Il potenziale si stringe osservando o tenendo il giocatore in rosa.`],
tip:`Con «Occhio clinico» nello staff scopri i potenziali con un anno di anticipo.`},
{id:'car-allenamenti',t:'Gli Allenamenti',w:'Cruscotto › Allenamenti',b:[
`A ogni giornata puoi fare <b>una seduta di squadra</b> e fino a <b>3 lavori individuali</b> (rendono il 50% in più). Cinque indirizzi:`,
[`<b>Tecnica</b>: lancio, buco, sparo, presa.`,`<b>Atletismo</b>: velocità, scatto, agilità, salto, resistenza.`,`<b>Difesa</b>: difesa, tuffo.`,`<b>Tattica</b>: visione e affiatamento.`,`<b>Recupero</b>: ridà condizione, nessuna crescita.`],
`L’<b>intensità</b> vale per tutte le sedute: Leggero (metà fatica), Normale, Intenso (circa +45% di crescita ma +70% di fatica e più rischio di infortuni). Sopra ogni tasto vedi i punti attesi e la condizione che costa.`,
`Allenarsi costa condizione: chi è scarico parte con meno energia e sotto quota 45 rischia di infortunarsi anche in allenamento. Alterna lavoro e recupero.`,
`Il <b>Programma automatico</b> fa le sedute al posto tuo (Recupero se la squadra è scarica, altrimenti l’indirizzo scelto): prima i giocatori che hai segnato come priorità (fino a 3), poi chi può crescere di più. L’esito arriva negli Avvisi.`],
tip:`La settimana di una partita importante: Recupero il giorno prima, così arrivi con energie piene.`},
{id:'car-crescita',t:'Crescita, età e maturità',b:[
`I giocatori migliorano con l’esperienza in campo (lanci riusciti, tagli efficaci, buone marcature, difese) e con gli allenamenti. I giovani crescono in fretta, tra 24 e 27 anni ci si stabilizza, dopo i 30 il fisico cala. Oltre quota 70 ogni punto costa di più.`,
[`<b>Specializzazioni</b> (Regista, Lanciatore lungo, Saltatore, Scattista, Guardiano, Lettore di gioco): per qualche credito orientano gli allenamenti verso 2-3 statistiche, fino a +30%. Il vantaggio cala con l’età.`,
`<b>Maturità</b>: d’estate chi ha raggiunto il suo limite in metà delle statistiche (21-31 anni) può superarlo: il talento sale di 1, fino a 2 volte.`,
`<b>Obiettivi personali</b>: a inizio stagione fino a 3 giocatori si pongono un traguardo credibile. Chi lo raggiunge cresce di più e porta un premio; chi lo manca resta deluso e alla seconda delusione di fila chiede di partire.`],
`Simulare una partita dà in media la stessa esperienza di giocarla.`],
tip:`Punta su 2-3 giovani da far crescere con le specializzazioni: sono l’investimento che rende di più nel lungo periodo.`},
{id:'car-club',t:'Il Club: Società e Strutture',w:'Cruscotto › Club',b:[
`Il Club ha sei schede: <b>Società</b> (conti e bilancio), <b>Strutture</b>, <b>Staff</b>, <b>Albo d’oro</b>, <b>Traguardi</b> e <b>Record</b>.`,
`Le <b>strutture</b> sono sei e arrivano al livello 5. Ogni livello costa più del precedente (60, 144, 252, 384, 540) e fa crescere la manutenzione, che si paga a ogni partita:`,
[`<b>Campo di allenamento</b>: gli allenamenti rendono il 10% in più per livello.`,`<b>Fisioterapia</b>: più recupero a ogni giornata e infortuni meno frequenti (−12% per livello).`,`<b>Vivaio</b>: più giovani promesse sul mercato, e più forti.`,`<b>Tribune</b>: incasso di ogni partita +7% per livello.`,`<b>Rete di osservatori</b>: osservare un giocatore costa 1 credito in meno per livello.`,`<b>Sede del club</b>: affiatamento più rapido e morale di base più alto.`],
`D’estate una struttura dal livello 2 in su può perdere un livello per usura; durante la stagione può capitare un guasto da riparare. Chi tiene una struttura almeno al livello 3 per metà della stagione riceve in estate il suo <b>premio di mantenimento</b>: sotto ogni struttura vedi per quante giornate l’hai mantenuta.`,
`Il tasto «i» accanto a ogni voce spiega cosa fa.`],
tip:`Con pochi crediti parti dal Campo di allenamento o dalle Tribune (che si ripagano): dopo qualche giornata hanno già reso.`},
{id:'car-staff',t:'Lo Staff tecnico',w:'Club › Staff',b:[
`Quattro persone, una per ruolo, con nome, età, volto, umore, un <b>livello da 1 a 3</b> e spesso una <b>caratteristica speciale</b>.`,
[`<b>Allenatore</b>: gli allenamenti rendono di più. Caratteristica: «Motivatore» (+1 di morale dopo ogni partita) o «Beniamino dei tifosi» (più tifosi a ogni vittoria).`,
`<b>Preparatore atletico</b>: più recupero e meno infortuni. Caratteristica: «Fisioterapista» (infortuni di una partita più brevi) o «Recupero rapido» (+2 di condizione dopo ogni partita).`,
`<b>Analista tattico</b>: alza la forma di squadra. Caratteristica: «Stratega» (+0,3 di forma) o «Occhio clinico» (scopre i potenziali un anno prima).`,
`<b>Mentore dei giovani</b>: chi ha fino a 23 anni cresce di più e gli obiettivi personali rendono. Caratteristica: «Papà della squadra» (più affiatamento) o «Scopritalenti» (chi ha fino a 21 anni cresce di più).`],
`Ogni ruolo parte vacante: <b>Scegli chi assumere</b> mostra tre candidati (un giovane che costa poco e cresce, uno esperto, un veterano già al massimo ma più caro); «Altri candidati» rinnova l’elenco a pagamento. <b>Migliora</b> paga una formazione fino al massimo che la persona può raggiungere; ogni due stagioni chi non è al massimo sale da solo di un livello. <b>Cambia</b> sostituisce la persona.`,
`Gli effetti sugli allenamenti (insieme al campo) non superano mai +50%. Ogni tanto un altro club prova a portarti via uno di loro: se lo lasci andare subentra un assistente di un livello in meno. A 66 anni si va in pensione.`],
tip:`Il Mentore è il più utile se punti sui giovani; l’Allenatore se vuoi crescita per tutti. Lo stipendio si paga a ogni partita: assumi con i conti in ordine.`},
{id:'car-soldi',t:'Soldi, tifosi e morale',b:[
`Ogni partita porta <b>crediti</b> (di più se vinci, in serie più alte e con più reputazione) e costa gli <b>stipendi</b> (crescono con l’Overall), la manutenzione delle strutture e lo staff. A fine stagione arrivano il premio di classifica e quello dell’obiettivo. Con i conti in rosso non si compra e il morale scende.`,
[`<b>Bilancio previsionale</b> (Club › Società): stima incassi, stipendi, saldo all’ultima giornata e premi da qui a fine campionato; accanto alle Tribune c’è in quante partite si ripaga il prossimo livello.`,
`<b>Tifosi</b>: fanno l’incasso, salgono con le vittorie; le Tribune ammorbidiscono le sconfitte.`,
`<b>Morale</b>: si alza con vittorie, premi e Recupero; un Colloquio aiuta il singolo.`,
`<b>Reputazione</b>: apre porte (mercato, offerte, internazionali).`],
`Ogni tanto la dirigenza propone una <b>sfida facoltativa</b>: se riesce porta crediti e reputazione, se no non succede nulla.`],
tip:`Non spendere tutto subito: tieni sempre una riserva di crediti per le emergenze (un guasto, un colloquio, un rinnovo).`},
{id:'car-classifica',t:'Classifica, playoff e premi',w:'Cruscotto › Classifica',b:[
`In <b>Classifica</b> scegli la serie da guardare, leggi l’ultima giornata delle altre e, in «Dal campionato», le storie della stagione. Sotto la tua serie ci sono i <b>migliori per mete, assist e difese</b>.`,
`Finite le 15 giornate (in Italia) si giocano i <b>playoff</b>: in Serie A le prime 4 giocano le semifinali (1ª-4ª, 2ª-3ª) e la finale per lo scudetto. In Serie B e C la prima sale direttamente e dal 2° al 5° posto c’è lo spareggio per la seconda promozione. Salgono due squadre e ne scendono due.`,
[`A fine stagione il campionato assegna <b>MVP</b>, attaccante e difensore dell’anno, capocannoniere, re degli assist, rivelazione (fino a 21 anni), allenatore dell’anno e squadra ideale. I premi vinti restano nella scheda del giocatore e portano reputazione e crediti.`,
`Ogni stagione nasce una <b>rivalità</b> con una squadra del tuo livello: nel derby vincere dà crediti, morale e reputazione; perdere fa male all’umore.`],
`Da qui parte la nuova stagione.`],
tip:`In zona playoff le partite si giocano una alla volta: usa bene i cambi, ogni punto conta.`},
{id:'car-avvisi',t:'Avvisi, ritiri e spogliatoio',b:[
`La campanella <b>Avvisi</b> ha tre livelli: le <b>emergenze</b> (infortuni, addii) e le <b>decisioni</b> (ritiro annunciato, offerta per un tuo giocatore, richiesta di cessione) aprono il riquadro da sole, una volta; le <b>notizie</b> non interrompono e accendono il numero sulla campanella.`,
[`<b>Ritiri</b>: ogni giocatore ha una sua età di ritiro (chi rende ancora continua anche oltre i 40 anni). Prima fa capire che ci pensa, poi annuncia l’ultima stagione: puoi chiedergli un altro anno con un premio di permanenza (un solo tentativo). Chi lascia il segno entra nella Hall of Fame.`,
`<b>Spogliatoio</b>: un buon giocatore che resta fuori 6 partite diventa scontento; dopo 10 chiede la cessione (vendilo o promettigli spazio; se la promessa non è mantenuta se ne va gratis).`,
`<b>Offerte</b>: ogni tanto una squadra di serie superiore chiede uno dei tuoi migliori: accetti o rifiuti entro la partita successiva.`,
`<b>Infortuni seri</b> (5-8 partite) possono lasciare un piccolo calo fisico al rientro.`]],
tip:`Un buon giocatore in panchina troppo a lungo ti lascia: ruotalo oppure promettigli spazio.`},
{id:'car-extra',t:'Conferenze, imprevisti e traguardi',b:[
[`<b>Conferenza stampa</b>: dopo una partita con un po’ di storia (derby, vittoria a sorpresa, finale…) scegli tra tre risposte: parli della squadra (morale), dei tifosi (più tifosi) o di un giocatore (a lui l’umore migliora). «Salta» non cambia nulla.`,
`<b>Imprevisti</b>: una o due volte a stagione dopo una partita succede qualcosa (sponsor, influenza, provino, invito a un torneo). A volte aiuta, a volte no, e spesso scegli tra due strade.`,
`<b>Traguardi</b> (Club › Traguardi): venti obiettivi di lungo periodo (vittorie, promozioni, scudetti, Europa, mete, premi, tifosi, strutture, derby, Hall of Fame…) con barra di avanzamento. Ognuno dà una volta sola un piccolo premio in crediti.`,
`<b>Albo d’oro, Record e Hall of Fame</b> (Club): trofei, l’albo della tua serie, i migliori di sempre della squadra e le carte dorate di chi si ritira dopo una carriera speciale.`]],
tip:`I traguardi sono una guida gratuita su cosa fare dopo: guardali quando non sai che obiettivo darti.`},
{id:'car-opzioni',t:'Opzioni e salvataggi',w:'Cruscotto › Opzioni',b:[
`Dalle <b>Opzioni</b> della carriera regoli difficoltà, durata, vento e meteo, Suggerimenti, difesa manuale/automatica, la musica e gli slot.`,
[`La carriera si salva da sola a ogni passo. I <b>3 slot</b> sono carriere separate.`,
`Puoi <b>esportare e importare un file</b> della carriera dello slot in cui sei (utile per cambiare dispositivo o fare una copia).`,
`I Suggerimenti accendono o spengono i fumetti e i «Primi passi».`]],
tip:`Prima di una prova rischiosa (cambiare campionato, per esempio) esporta la carriera: è la tua copia di sicurezza.`}
]});

TUT.push({id:'lega',t:'I campionati uno per uno',sub:'Italia, USA Men’s Club, Belgio, Francia, Germania, Regno Unito, EUCF.',
intro:'Ogni campionato ha il suo formato, ricostruito su quello vero. Qui capisci come si gioca, come ci si qualifica e cosa succede a fine stagione.',
les:[
{id:'lega-scelta',t:'Come si sceglie il campionato',w:'Nuova carriera',b:[
`Alla nuova carriera scegli prima il <b>campionato</b>: Italia, USA Men’s Club, Belgio, Francia, Germania o Regno Unito. Poi scegli la squadra (con il roster visibile prima di decidere) e la modalità di partenza.`,
`Le carriere di leghe diverse sono separate. Le squadre e i giocatori sono quelli veri del 2026: nomi, età e statistiche pubbliche; l’Overall di ognuno tiene conto del rendimento nei tornei e della forza del club.`,
`I giocatori che giocano sia in Europa sia in America stanno in una sola lega (in Europa, con il valore più alto ma plausibile), tranne Orion Cable che resta in America.`],
tip:`Non sai da dove partire? Scegli un club di Serie C o di una divisione bassa: più difficile, ma si cresce di più e le promozioni danno molta soddisfazione.`},
{id:'lega-it',t:'Italia: Serie A, B e C',b:[
`Tre serie con le squadre e le rose dei <b>Campionati Italiani Ultimate Open 2026</b> di Flying Disc Italia: ogni rosa è il roster ufficiale preso dai report delle partite, con età reali.`,
[`Si gioca <b>15 giornate</b>.`,
`In <b>Serie A</b> le prime 4 giocano le semifinali (1ª-4ª, 2ª-3ª) e la finale: chi vince è campione d’Italia.`,
`In <b>Serie B e C</b> la prima sale direttamente e dal 2° al 5° posto c’è lo spareggio (2ª-5ª, 3ª-4ª, finale) per la seconda promozione.`,
`Salgono sempre due squadre e ne scendono due.`,
`Le prime 3 della Serie A si qualificano alla <b>EUCF</b>, la coppa europea della stagione dopo.`],
`Ogni stagione nasce una rivalità (derby) con una squadra del tuo girone di forza simile. Dopo uno scudetto le rivali di Serie A si rinforzano.`],
tip:`La Serie A è dura da difendere: dopo il titolo investi in rosa e strutture, perché le altre si rinforzano.`},
{id:'lega-usa',t:'USA Men’s Club',b:[
`<b>48 club</b> veri della divisione Men’s di USA Ultimate (compresi i canadesi Toronto GOAT, Vancouver Furious George e Montréal Mephisto), divisi in <b>8 Conference</b> geografiche da 6 club: Northeast, Mid-Atlantic, Southeast, Great Lakes, North Central, South Central, Northwest e Southwest.`,
[`Si gioca solo nella propria Conference: <b>5 giornate</b>, sola andata. In classifica contano vittorie, scontri diretti e differenza mete.`,
`Niente promozioni né retrocessioni.`,
`I club sono i meglio piazzati nel ranking dei Nationals 2026; la forza va da 72 a 91,5.`,
`I nomi sono quelli veri del 2026 (roster dei Nationals per i 16 qualificati, nomi trovati nelle fonti pubbliche per gli altri).`],
`Il <b>ranking nazionale</b> sale con le vittorie (di più contro avversarie forti e con margini larghi) e scende con le sconfitte; decide le teste di serie dei Nationals. D’estate si riavvicina alla forza delle rose.`,
`Gli obiettivi della dirigenza dipendono dal livello del club: Play-in, Nationals, semifinali o titolo.`],
tip:`Con soli 5 turni ogni partita pesa tantissimo: gioca tu quelle contro le rivali dirette.`},
{id:'lega-nat',t:'USA: Play-in e Nationals',b:[
`Ogni Conference è una regione e ha <b>1 posto automatico</b>; altri 8 posti di forza vanno alle regioni in base al ranking a fine stagione regolare (da 1 a 4 per regione, 16 in tutto). I posti vanno alla regione, non alla squadra: se li contendono i club della Conference.`,
[`Con 1 posto va la 1ª.`,`Con 2: la 1ª direttamente e 2ª contro 3ª in gara secca (Play-in).`,`Con 3: la 1ª diretta, poi 2ª-5ª e 3ª-4ª.`,`Con 4: le prime due dirette, poi 3ª-6ª e 4ª-5ª.`],
`I <b>Nationals</b> hanno 16 squadre in 4 gironi da 4 (fasce del ranking, club della stessa Conference in gironi diversi se possibile): 3 partite a girone, le prime vanno ai quarti, le seconde e le terze ai prequarti (2ª contro 3ª di un altro girone), le quarte sono fuori. Poi quarti, semifinali e finale.`,
`In Classifica trovi tre viste: <b>Conference</b> (verde = Nationals diretti, giallo = Play-in, rosso = fuori), <b>Nationals</b> (gironi e tabellone) e <b>Ranking</b>.`],
tip:`Guarda la proiezione dei posti nella tua Conference: se rischi il Play-in, ogni vittoria larga alza il ranking.`},
{id:'lega-eu',t:'Belgio, Francia, Germania, Regno Unito',b:[
`Campionati Open outdoor veri, con formati ricostruiti dai risultati 2026. Nessuno è eliminato: ogni turno delle fasi finali si gioca per il piazzamento e a fine stagione salgono e scendono squadre tra i livelli.`,
[`<b>Belgio</b>: 6 livelli (N1-N6) da 8 squadre in due gironi da 4, poi tabellone con tutte le finali di piazzamento.`,
`<b>Francia</b>: la N1 ha 12 squadre in due poule da 6 e un Top 8 a tabellone; la N2 tre gironi da 8 con finali di piazzamento; la N3 è presente solo con le prime tre di ogni girone.`,
`<b>Germania</b>: la 1. Liga ha 16 squadre in due gironi da 8 con fasi finali per tutte le posizioni; poi 2. e 3. Liga.`,
`<b>Regno Unito</b>: i Nationals (due gironi da 4 e turno incrociato) e, sotto, i club dell’Open Tour.`],
`Le forze dei club sono stimate dai risultati e dal ranking EUCS; i giocatori sono quelli delle liste dei tornei 2026 (età note o stimate: «circa») e dove un club ha pochi nomi la rosa è completata con giocatori generati.`,
`Le carriere di queste leghe non ricevono offerte dall’altra lega.`],
tip:`Nei livelli bassi le rose hanno meno nomi veri: è l’occasione per trovare giovani e svincolati di talento.`},
{id:'lega-eucf',t:'La coppa europea (EUCF)',w:'Cruscotto › Classifica (stagione dopo la qualificazione)',b:[
`Si sblocca <b>chiudendo il campionato tra i posti qualificanti</b>: Serie A prime 3, livello più alto in Belgio prime 3, in Francia e Regno Unito prime 2, in Germania la prima. Si gioca nella stagione dopo, una sola volta.`,
`Il formato è quello dei veri European Ultimate Club Finals: <b>16 club</b> (3 italiani, 3 belgi, 2 francesi, 2 britannici, 1 tedesco, tutti club veri, più 5 club europei inventati di Spagna, Paesi Bassi, Cechia, Svizzera e Irlanda) in 4 gironi da 4, 3 partite a girone; poi quarti, semifinali e finale (stesso schema dei Nationals USA).`,
`Ogni turno superato porta <b>crediti</b>; la vittoria anche reputazione e un trofeo. A torneo concluso si torna al campionato. Ogni coppa vinta alza il livello delle avversarie successive.`],
tip:`In Europa le avversarie sono forti: arriva con la rosa fresca e prepara gli schemi giusti prima di ogni girone.`},
{id:'lega-ponte',t:'Italia e USA insieme',b:[
`Se la carriera va bene, a inizio stagione un club dell’altra lega (Italia ↔ USA) può offrirti la <b>panchina</b> (negli Avvisi): accettando cambi club e lega, ma allenatore, storico, trofei e traguardi restano tuoi.`,
`Ogni tanto un club dell’altra lega propone anche uno <b>scambio di giocatori</b>.`,
`I giocatori internazionali del mercato che giocano per un club USA stanno nel loro club e, nelle carriere USA, non compaiono sul mercato.`],
tip:`Se vuoi cambiare lega senza perdere nulla, aspetta l’offerta: è l’unico modo per portarti dietro tutto.`}
]});

TUT.push({id:'mod',t:'Le altre modalità',sub:'Partita veloce, Torneo, Ultimate Team, Real player, Allenamento.',
intro:'Oltre alla carriera, il gioco ha quattro modalità da giocare senza impegno o con una collezione da costruire.',
les:[
{id:'mod-veloce',t:'Partita veloce e Torneo',b:[
[`<b>Partita veloce</b>: scegli due squadre qualsiasi, la durata (Arcade, Competitiva o Lunga), la difficoltà e quale squadra inizia in attacco. Non viene registrato nulla: ideale per provare squadre e schemi.`,
`<b>Torneo</b>: crei un torneo a eliminazione diretta a 4, 8 o 16 squadre vere, scegliendo la tua squadra, la provenienza delle avversarie e la difficoltà. Le partite le giochi o le simuli; il tabellone resta salvato. Abbandonare una partita è una sconfitta a tavolino.`]],
tip:`La Partita veloce con la difficoltà Estrema è il banco di prova migliore per quando ti sembra tutto troppo facile.`},
{id:'mod-ut',t:'Ultimate Team',b:[
`Apri <b>pacchetti</b> di carte Handler, Cutter e Defender (più sono forti, più sono rare; alcune hanno un tratto), scegli i 7 titolari e giochi il torneo a eliminazione. Ogni partita dà <b>gettoni</b> (di più se vinci e vai avanti) per comprare pacchetti e potenziare le carte.`,
[`<b>Qualità dei pacchetti</b>: base e acquistati sono i più comuni, poi bronzo, argento, oro e platino man mano che superi i turni, e il pacchetto dei campioni a chi vince. Dal bronzo in su c’è sempre almeno un Raro; nel pacchetto dei campioni un Epico; dopo cinque pacchetti di fila senza Epici il sesto ne contiene uno.`,
`<b>Potenziamenti</b>: ogni carta ne ha al massimo 4 (2 per linea): Tiro, Atletico, Difesa, Mani e testa.`,
`Chi gioca da titolare cresce da solo (un punto ogni 4 partite, fino a +4).`,
`I <b>doppioni</b> si possono scartare per recuperare gettoni. Gli <b>obiettivi</b> danno premi in gettoni.`,
`Si gioca sempre ai 7 punti.`]],
tip:`Potenzia linee diverse: due carte della stessa forza restano diverse e la squadra è meno prevedibile.`},
{id:'mod-real',t:'Real player',b:[
`In Ultimate Team scegli «Real player» invece di «Computer»: sfidi le squadre di altri giocatori, senza che siano online nello stesso momento (la loro squadra è guidata dall’IA, Media). La squadra è separata da quella del torneo: ha i suoi giocatori, gettoni e pacchetti (si parte da un pacchetto di 10 giocatori).`,
[`Scegli un <b>nome</b> (poi non si cambia). «Inizia partita» carica la tua squadra e ti abbina a un avversario con punti vicini.`,
`Si parte da <b>1000 punti</b>; vincere contro un più forte vale di più, perdere contro un più debole costa di più (da 1 a 32 punti). La classifica online mostra i primi 50.`,
`Premi: vittoria 40 gettoni, sconfitta 15; bonus se batti uno con più punti; un pacchetto costa 130. Ogni 100 punti sopra 1000 c’è un pacchetto premio (Bronzo a 1100, Argento 1200, Oro 1300, Platino 1400, dal 1500 la Super bustina).`,
`I potenziamenti delle carte si sbloccano a 1100 punti.`],
`Servono internet e la partita non si interrompe: abbandonare o chiudere il gioco conta come sconfitta. Senza connessione il resto del gioco funziona come sempre.`],
tip:`Costruisci prima una squadra equilibrata nel torneo contro il computer: la usi poi per scalare la classifica.`},
{id:'mod-allenamento',t:'Allenamento libero e sfide',w:'Menu › Allenamento',b:[
`Oltre al tutorial guidato (sette lezioni), l’Allenamento ha:`,
[`<b>Allenamento libero</b>: senza punteggio, con o senza difesa; ideale per imparare i tipi di lancio.`,
`<b>Sfide con medaglie</b>: Precisione, Break, Huck e duelli, Difesa e layout.`],
`Nessuna sfida ha conseguenze sulla carriera: puoi provare finché non ti riesce.`],
tip:`Prima di una carriera in Difficile, prova qui la mira degli huck: le medaglie ti dicono quanto sei pronto.`}
]});

TUT.push({id:'tr',t:'Trucchi e strategie',sub:'I consigli che fanno la differenza in partita e in carriera.',
intro:'Dieci regole pratiche, raccolte dal gioco: leggile prima di una partita importante.',
les:[
{id:'tr-att',t:'Attacco: dieci regole',b:[
[`Lancia <b>dove il compagno corre</b>, non dove si trova.`,
`Se la croce rossa lampeggia, <b>cambia bersaglio</b> o lancia alto.`,
`Con lo stall alto, uno <b>scarico corto</b> vale più di un huck forzato.`,
`Il <b>rovesciato</b> (due dita) passa sopra il marcatore: usalo nel cono rosso.`,
`Con <b>vento forte</b> accorcia i lanci e usa passaggi tesi.`,
`<b>Isola</b> il tuo cutter più veloce (tieni premuto) contro il marcatore più lento.`,
`Alterna gli <b>schemi</b>: l’IA ricorda quelli che ripeti.`,
`Un <b>buon pull</b> ti dà metà del punto: ferma bene entrambe le barre.`,
`<b>Timeout</b> prima di perdere il disco per stall o prima del punto decisivo.`,
`Tieni lo <b>scatto</b> per i lanci lunghi dove il disco è contendibile.`]]},
{id:'tr-dif',t:'Difesa: cinque regole',b:[
[`<b>Contenimento</b> contro chi gioca lungo, <b>anticipo</b> contro chi gioca corto.`,
`Il cerchio dell’handblock: <b>aspetta l’anello interno</b>, non premere a caso.`,
`Gli avversari sfiniti (goccia di sudore) sono il tuo bersaglio nei duelli.`,
`<b>Zona</b> contro schemi corti, ma <b>mai</b> contro Orizzontale o T1.`,
`In difesa automatica usa <b>Salta</b> per risparmiare tempo e gioca tu i punti decisivi.`]]},
{id:'tr-car',t:'Carriera: gestione a lungo termine',b:[
[`Tieni sempre <b>7 giocatori sani</b> per linea: usa «Linee consigliate».`,
`Alterna <b>allenamenti e Recupero</b>: arriva alla partita con energie piene.`,
`Investi presto in <b>Campo di allenamento e Tribune</b>: si ripagano.`,
`Punta su <b>2-3 giovani</b> con potenziale alto e specializzali.`,
`Lo <b>Staff</b> dà più del Campo da solo, ma pesa sugli stipendi: tieni i conti in ordine.`,
`Gioca tu i <b>derby, le finali e i playoff</b>, simula le partite senza storia.`,
`Guarda il <b>meteo</b> e il <b>consiglio</b> sul cruscotto prima di ogni partita.`,
`Ruota i titolari: un giocatore in panchina troppo a lungo chiede di partire.`,
`<b>Esporta</b> la carriera ogni tanto: è la tua copia di sicurezza.`]]}
]});
