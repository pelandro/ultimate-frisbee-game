/* ---- TUTORIAL COMPLETO: i contenuti ----
   TUT = capitoli {id, t: titolo, sub: riga d'elenco, intro, les: lezioni}; lezione = {id, t, w: dove si trova (facoltativo), b: blocchi, tip: trucco}.
   Un blocco e' un paragrafo (stringa) oppure un elenco (array di stringhe); si puo' usare <b>. I fatti vengono dalla Guida a schede (07-guida.html) e dal codice:
   quando una regola cambia, aggiorna qui la lezione che la riguarda. Gli id delle lezioni non si cambiano: li usano i fumetti (TIP_LES in 21-tutorial.js) e il progresso salvato.
   Il tutorial dice cio' che serve per giocare bene: niente formule, tarature o conti interni dell'economia (quelli stanno nella Guida). */
const TUT=[];

TUT.push({id:'ini',t:'Per iniziare',sub:'L’obiettivo, i menu, i comandi e il primo allenamento.',
intro:'Cinque lezioni per partire bene: che cosa si fa, dove si trova ogni cosa e come si comanda il gioco.',
les:[
{id:'ini-gioco',t:'Che cosa si fa',b:[
`L’Ultimate si gioca in due squadre da 7, con un disco. Per segnare devi portare il disco nella <b>meta</b> avversaria passandolo ai compagni: <b>chi ha il disco non può correre</b>, quindi si avanza solo lanciando.`,
`Vince chi arriva per primo a 7 mete in modalità Arcade, 11 in Competitiva, 15 in Lunga.`,
[`Se il disco cade a terra, esce dal campo o viene intercettato, passa agli avversari: è un <b>turnover</b>.`,`Chi ha il disco ha <b>10 secondi</b> per lanciare (lo stall): a 10 perde il disco.`,`Dopo ogni meta le squadre cambiano campo e chi ha segnato tira il <b>pull</b> (il lancio lungo di inizio punto).`]],
tip:`Non serve sapere le regole a memoria: nelle prime tre partite compaiono delle schede che spiegano ogni cosa nel momento in cui serve.`},
{id:'ini-menu',t:'I menu del gioco',w:'Menu iniziale',b:[
`Dal menu iniziale scegli come giocare:`,
[`<b>Carriera</b>: la modalità principale. Guidi una squadra per più stagioni, con rosa, mercato, allenamenti, strutture, staff e campionati veri. «Carriere» mostra i tre slot di salvataggio.`,
`<b>Partita veloce</b>: due squadre qualsiasi, subito in campo, senza conseguenze.`,
`<b>Ultimate Team</b>: apri pacchetti di carte, scegli i 7 titolari e sfida il computer o le squadre degli altri giocatori.`,
`<b>Torneo</b>: un torneo a eliminazione diretta con 4, 8 o 16 squadre.`,
`<b>Allenamento</b>: il tutorial pratico, l’allenamento libero e le sfide con medaglie.`],
`In alto trovi <b>Tutorial</b> (questo manuale), <b>Guida</b> (le regole a schede, con tutti i dettagli), <b>Audio</b> e <b>Impostazioni</b>.`],
tip:`Se sei nuovo, fai prima il percorso «Allenamento › Tutorial»: ogni lezione si supera facendo ciò che spiega.`},
{id:'ini-comandi',t:'I comandi',b:[
`Il gioco funziona con il tocco, la tastiera, il mouse e il controller.`,
[`<b>Touch e mouse</b>: si lancia trascinando all’indietro e rilasciando; i compagni si chiamano con un tocco; in difesa i pulsanti rossi in basso fanno handblock e tuffo.`,
`<b>Tastiera</b>: frecce o WASD per la direzione, Spazio o J per lanciare (tieni premuto per caricare, rilascia per tirare), Maiusc o K per il lancio alto (in difesa il tuffo), E = taglio, Q = isolamento, C = clear, Esc = annulla, Invio = salta il possesso avversario.`,
`<b>Controller</b>: stick o croce per la direzione, A o RT per lanciare, X o B per il lancio alto, Y per «Salta».`],
`Dalle <b>Impostazioni</b> regoli sensibilità del trascinamento, dimensione e posizione dei pulsanti, audio, meteo e vento. Sul telefono si gioca in orizzontale: se lo tieni in verticale il gioco si gira da solo.`]},
{id:'ini-primi',t:'I «Primi passi» in partita',b:[
`Nelle prime tre partite compaiono in alto delle schede che spiegano il gioco <b>una alla volta e al momento giusto</b>: pull, ricezione, lancio, chiamate, stall, lancio alto, difesa, isolamento, dopo la meta e timeout, schemi, cambi e simulazione.`,
`Ogni scheda ferma il gioco: «Capito» (o Invio) per continuare, «Salta il tutorial» per spegnerle tutte. Per rivederle: <b>Opzioni › Suggerimenti</b>, spegni e riaccendi.`],
tip:`Da lì si riattivano anche i fumetti della carriera (quelli che spiegano Squadra, Mercato, Società…).`},
{id:'ini-alle',t:'Il tutorial guidato e le sfide',w:'Menu › Allenamento',b:[
`Nel menu <b>Allenamento</b> c’è il tutorial pratico in sette lezioni: lancio, tagli, tipi di lancio, stall, meta, difesa e pull. Una lezione si supera facendo davvero ciò che spiega, e il gioco ricorda a che punto sei («Riprendi»).`,
`Poi ci sono l’<b>allenamento libero</b> e le <b>sfide con medaglie</b> (vedi «Allenamento libero e sfide» nel capitolo delle altre modalità).`],
tip:`L’allenamento libero senza difesa è il posto migliore per imparare a mirare un huck o un rovesciato senza paura di perdere il disco.`}
]});

TUT.push({id:'att',t:'In partita: attacco',sub:'Pull, lanci, rovesciato, chiamate ai compagni, scatto, stall.',
intro:'Tutto quello che puoi fare quando hai il disco o lo stai per avere.',
les:[
{id:'att-pull',t:'Il pull',b:[
`Ogni punto comincia con un pull. Si decide in due tocchi:`,
[`Prima la barra della <b>POTENZA</b>: tocca (o Spazio) per fermare il cursore. <b>Verde</b> = il disco arriva nella meta avversaria; giallo o prima = corto; rosso = rischia di uscire dal fondo.`,
`Poi la barra della <b>DIREZIONE</b>: ferma nel verde (al centro) o almeno nel giallo. Nel rosso esce di lato.`],
`Sul campo vedi dove cadrebbe il disco: <b>FUORI</b>, <b>CORTO</b>, <b>BUON PULL</b> o <b>GRAN PULL</b> (oro, ben in fondo alla meta).`,
`Un gran pull mette in difficoltà chi riceve per qualche secondo (stall che parte più alto, tagliatori in ritardo); un pull corto o fuori dà via libera all’attacco avversario. Se il pull esce si riparte dal brick (il segno × al centro) e tutti vanno subito al loro posto.`],
tip:`Chi tira conta: con Lancio e Sparo alti le barre vanno più piano. Scegli come tiratore chi ha i valori migliori.`},
{id:'att-lancio',t:'Il lancio a trascinamento',b:[
`Non c’è nessun pulsante: quando hai il disco <b>tocca dove vuoi, trascina il dito all’indietro e rilascia</b>. Il disco parte nella direzione opposta al trascinamento e tanto più lontano quanto più lo allunghi.`,
[`L’arco a quadretti mostra dove arriva e accanto compare la distanza.`,`I passaggi corti sono più precisi; da 30 m in su è uno sparo.`,`Per annullare riporta il dito vicino a dove avevi toccato: compare «ANNULLA».`],
`Toccare un compagno <b>non</b> gli passa il disco: lo manda in taglio (vedi «Chiamare i compagni»).`],
tip:`Lancia dove il compagno sta correndo, non dove si trova adesso: l’arco ti mostra il punto d’arrivo.`},
{id:'att-mira',t:'Mira assistita e leggere il lancio',b:[
`La direzione del dito conta più della distanza: se punti verso un compagno e carichi più o meno fino a lui, il lancio si <b>aggancia</b> a lui anche se sbagli di qualche metro. Il compagno agganciato ha un anello e una freccia.`,
[`Il <b>cerchio tratteggiato</b> attorno al mirino è l’errore possibile: cresce con la distanza, con la pressione (stall alto, marcatore addosso), con i lanci difficili e se rilasci in fretta.`,
`L’<b>arco rosso</b> è il limite della tua gittata (dipende dallo Sparo). Oltre, il disco cade corto: la mira scrive «MAX … m: CORTO».`,
`Se un difensore può mettersi sulla traiettoria, l’arco <b>lampeggia in rosso con una croce</b> nel punto dell’intercetto: cambia bersaglio o lancia alto.`],
`In Facile l’anello del compagno è verde (sicuro), giallo (incerto) o rosso (rischioso). Dal Medio in su il colore sparisce, in Estrema anche l’anello e la traiettoria.`],
tip:`Prima di rilasciare guarda sempre la croce rossa: è il modo più semplice per non regalare intercetti.`},
{id:'att-tipi',t:'Tipi di lancio e rovesciato',b:[
`Il tipo si sceglie con le <b>dita</b>: <b>un tocco = piatto</b>, <b>doppio tocco = alto</b> (il rovesciato): tocca una volta in un punto libero del campo, poi tocca di nuovo e tieni premuto per mirare. Funzionano anche <b>due dita insieme</b>, anche mentre stai già mirando. Dal lancio dopo si torna al piatto.`,
[`<b>Piatto</b>: Rovescio o Dritto, secondo il lato che gira attorno al marcatore. Il rovescio è il più preciso; il dritto parte prima (meno handblock) ma perde precisione sulle distanze lunghe. Da 30 m è un <b>huck</b>, lungo e galleggiante.`,
`<b>Alto — Scoober</b> (fino a 14 m): rapido, scavalca le mani del marcatore.`,
`<b>Alto — Hammer</b> (oltre 14 m): arco alto che nessuno intercetta lungo la linea e difficile da bloccare, ma lento e meno preciso.`],
`Il gioco sceglie da solo il lancio adatto e lo scrive accanto al mirino. I lanci piatti curvano: la traiettoria che vedi è quella vera.`],
tip:`Marcatore addosso e cono rosso davanti? Prova il rovesciato (doppio tocco): passa sopra la testa del difensore. Con Lancio basso, però, meglio il piatto.`},
{id:'att-chiama',t:'Chiamare i compagni',b:[
`Le <b>chiamate rapide</b> si fanno toccando i compagni senza trascinare:`,
[`<b>Tocco su un compagno</b> = taglio: un cutter vicino al disco va lungo, uno già lontano torna incontro sul lato aperto; un handler ti offre lo scarico (<b>reset</b>) sul lato lasciato libero dal marcatore.`,
`<b>Tieni premuto</b> su un compagno = <b>isolamento</b>: taglia lui e gli altri liberano il corridoio.`,
`<b>Tocco su chi ha il disco</b> = clear: tutti tornano in posizione e ripartono.`],
`Da tastiera: E = taglio, Q = isolamento, C = clear, verso il compagno indicato dalle frecce.`,
`Se miri su una <b>zona libera</b> del campo, un compagno ci corre: quello che ci arriva prima, non per forza il più vicino. Più alta è la Visione di chi ha il disco, più lontano dai compagni può essere la zona. Il disco va esattamente dove hai mirato.`,
`In Facile e Medio un breve tratto verde mostra in che direzione parte ogni compagno (azzurro quello che hai chiamato tu); in Difficile ed Estrema non c’è nessun segnale.`],
tip:`Isola il tuo cutter più veloce contro il marcatore più lento: è il modo più facile di creare un vantaggio.`},
{id:'att-sparo',t:'Sparo, scatto e gioco lungo',b:[
`Oltre 30 m il lancio è uno <b>sparo</b>. Quanto lontano arriva dipende dalla statistica Sparo: con 20 circa 30 m, con 60 circa 65 m, con 99 tutto il campo.`,
`Sui lanci lunghi il tuo giocatore che corre al punto d’arrivo ha una freccia, un cerchio e una barra di energia: <b>tieni premuto lo schermo</b> (o il pulsante col fulmine in basso a destra) per farlo <b>scattare</b>. Va più veloce ma consuma più energia (meno con la Resistenza alta).`,
`I compagni si regolano su chi lancia: con un lanciatore che non spara partono pochi tagli lunghi, con uno da tutto campo ne partono di più e più lontano.`],
tip:`Uno scatto sprecato stanca il giocatore per il resto del punto: usalo solo quando il disco è davvero contendibile.`},
{id:'att-prese',t:'Prese, duelli e tuffi',b:[
`Una presa facile riesce quasi sempre; diventa difficile se il disco arriva al limite della portata, in corsa, con un difensore addosso, su un hammer o quando si è stanchi. Conta la statistica <b>Presa</b> di chi riceve.`,
`Nei duelli contano salto, posizione, chi arriva prima e le mani di chi riceve. L’Agilità decide quanto in fretta si frena e si cambia direzione.`,
`Il <b>tuffo</b> scatta da solo se il disco cade appena oltre la portata. Nei duelli in aria e nei tuffi <b>tocca quando l’indicatore è nel verde</b> per avere un bonus.`],
tip:`Gli avversari sfiniti hanno una goccia di sudore: è lì che conviene cercare il duello.`},
{id:'att-stall',t:'Stall, serie e momenti decisivi',b:[
`Quando un difensore ti marca conta fino a 10: lo vedi scritto in alto («Stall 3»…) e, da 6, anche sopra chi ha il disco. A 9 c’è l’<b>ULTIMO LANCIO</b>, a 10 perdi il disco. Se il numero sale, passa subito, anche corto (o chiama il timeout: vedi «Timeout, half time e pausa»).`,
[`<b>Serie positiva</b>: tanti lanci riusciti di fila accendono un alone rosso e i lanci vengono un po’ meglio, finché sbagli.`,`<b>Serie negativa</b>: due errori di fila accendono un alone azzurro e i lanci vengono un po’ peggio, finché ne completi due.`,`<b>MATCH POINT</b> a un punto dalla vittoria, <b>UNIVERSE POINT</b> se lo sono entrambe.`]],
tip:`Con lo stall alto non cercare il lancio perfetto: uno scarico corto vale più di un huck forzato.`},
{id:'att-vento',t:'Vento, pioggia e neve',b:[
`Ogni partita ha il suo <b>vento</b> (calma, brezza, vento, vento forte), indicato in alto a destra con una freccia. Sposta il disco tanto più quanto più resta in aria: i passaggi corti e tesi quasi non lo sentono, spari e hammer sì. Con il vento alle spalle si lancia più lungo, controvento meno; a ogni meta si cambia campo e si cambia verso.`,
`A volte piove o nevica: le prese sono più difficili e i lanci un po’ meno precisi. Chi ha Lancio e Sparo alti compensa quasi tutto, e il cerchio tratteggiato della mira mostra comunque dove finirà il disco.`],
tip:`In carriera il meteo si legge nella schermata Partita prima di giocare: con vento forte scegli schemi a passaggi corti. Si spegne da Impostazioni › Meteo.`}
]});

TUT.push({id:'dif',t:'In partita: difesa',sub:'Difesa automatica o manuale, handblock, tuffo, intercetti e Callahan.',
intro:'Come difendere in modo semplice (da soli o a mano) e come far scattare le giocate che ribaltano il punto.',
les:[
{id:'dif-modi',t:'Difesa automatica o manuale',w:'Impostazioni, Opzioni o Pausa',b:[
`Hai tre modi di difendere:`,
[`<b>Automatica</b> (predefinita): i tuoi difendono da soli seguendo lo schema scelto. Tu scegli la marcatura con il pulsante <b>Marcatura</b> e, quando vuoi, tocchi <b>Salta</b> (Invio, Y sul controller): il possesso avversario si gioca in un istante e una fascia ti dice com’è finito.`,
`<b>Manuale</b>: guidi tu un difensore (anello azzurro); se non tocchi nulla marca da solo.`,
`<b>Saltata</b>: ogni possesso avversario si risolve subito.`],
`Si cambia da Impostazioni, Opzioni della carriera o Pausa. In automatica ogni tanto arriva un <b>momento a tempo</b>: un tuffo (il gioco rallenta: tocca quando il cerchio si chiude) o un duello in salto.`],
tip:`Hai poco tempo? «Difesa: automatica» più «Salta» ti fa giocare solo l’attacco.`},
{id:'dif-manuale',t:'Guidare il difensore',b:[
`In difesa manuale uno dei tuoi difensori ha l’<b>anello azzurro</b>: trascina il dito per farlo correre, tocca un altro difensore per passare a lui (Tab o Q da tastiera).`,
`Quando l’avversario lancia, il controllo passa da solo al difensore che arriva prima al punto d’arrivo: portalo lì per intercettare o contendere il disco.`,
`Il pulsante <b>Marcatura</b> (tasto F) sceglie tra:`,
[`<b>Contenimento</b>: dietro all’uomo, protegge il profondo.`,`<b>Anticipo</b>: davanti all’uomo, toglie i passaggi corti ma rischia sui lanci lunghi. L’anello diventa arancione.`]],
tip:`Contro un attacco che spara tanti huck scegli il contenimento; contro uno che gioca corto e paziente l’anticipo.`},
{id:'dif-block',t:'L’handblock',b:[
`Il marcatore può bloccare il lancio con la mano proprio mentre parte, soprattutto se il lancio passa nel <b>cono rosso</b> (il lato che chiude).`,
`In difesa manuale, quando l’avversario sta per lanciare, sul tuo marcatore compare un <b>cerchio che si stringe</b>: premi il pulsante a destra (la mano) quando arriva sull’anello interno. Il cerchio diventa <b>verde</b> (tempismo giusto), <b>giallo</b> (discreto) o <b>rosso</b> (sbagliato).`,
[`Più è alto il Buco del lanciatore, più il cerchio va veloce; più è alta la Difesa del tuo marcatore, più va piano.`,`Se non tocchi, non blocchi.`,`Si blocca molto più facilmente nel cono rosso e su un lancio piatto (l’hammer lo scavalca).`]],
tip:`Non premere a caso: il verde conta moltissimo. Aspetta che il cerchio arrivi sull’anello interno.`},
{id:'dif-tuffo',t:'Tuffo e intercetti',b:[
`Quando l’avversario lancia e un tuo difensore è a distanza di tuffo dal punto d’arrivo, il gioco va al <b>rallentatore</b> e compare un cerchio con il pulsante TUFFO: tocca quando il cerchio arriva sull’anello interno. Più è alto il Tuffo, da più lontano ci si tuffa.`,
`Un difensore può anche <b>intercettare lungo il volo</b> se il disco gli passa a portata, abbastanza vicino di lato (conta l’Agilità) e abbastanza basso (conta il Salto). Ci riesce più spesso con la Difesa alta e sui dischi lenti.`,
`I lanci alti (hammer, huck) scavalcano la difesa a metà volo; la zona chiude invece molte linee basse.`],
tip:`In difesa automatica, per il tuffo basta toccare lo schermo in un punto qualsiasi quando il cerchio si chiude.`},
{id:'dif-call',t:'Callahan e dopo il turnover',b:[
`Se un tuo difensore intercetta e prende il disco <b>nella meta che attacchi tu</b>, segna lui il punto: compare <b>CALLAHAN!</b> in verde. Se succede a te compare in rosso.`,
`Dopo un turnover il giocatore più vicino corre a raccogliere il disco e si riparte da lì (se il disco è uscito, dal punto in cui ha lasciato il campo).`],
tip:`Vicino alla tua meta, con un difensore addosso, un passaggio corto e sicuro vale più di un lancio rischioso.`}
]});

TUT.push({id:'sch',t:'Schemi e gestione della partita',sub:'Gli schemi d’attacco e di difesa, i cambi, il timeout, l’half time, la simulazione.',
intro:'Gli schemi decidono dove si mettono i giocatori; la gestione della partita decide quando cambiarli.',
les:[
{id:'sch-menu',t:'Il menu Schemi',w:'In partita › Schemi (a inizio meta)',b:[
`A inizio meta tocca <b>Schemi</b> per scegliere attacco e difesa; se non lo fai restano quelli di prima. Ogni schema ha una descrizione con punti forti e deboli. Accanto trovi <b>Cambi</b> e <b>Simula meta</b>.`,
`Ogni schema ha un <b>controgioco</b>: nessuno vince sempre. Impara quale schema batte quale difesa e cambia quando vedi che non funziona.`],
tip:`Hai segnato con uno schema? Ripeterlo funziona finché l’IA non lo riconosce: alterna.`},
{id:'sch-att',t:'Gli schemi d’attacco',b:[
[`<b>Verticale</b>: fila al centro; uno viene sotto sul lato aperto, uno va lungo sull’altro. Forte contro l’uomo, soffre la zona.`,
`<b>Orizzontale</b>: cutter in linea larga; l’interno attacca la profondità, quello accanto viene incontro. Batte la zona; contro l’uomo che forza dentro fatica.`,
`<b>Esagono</b>: tutti spaziati, molti tagli corti. Buono contro gli aiuti, la zona lo chiude.`,
`<b>Stack laterale</b>: i cutter in fila su un lato lasciano mezzo campo libero per gli isolamenti. Solido contro l’uomo, meno contro la zona.`,
`<b>Weave</b>: tre handler che si passano il disco in diagonale correndosi davanti. Guadagna metri contro la zona; contro gli aiuti si complica.`,
`<b>T1</b>: schema a sequenza, il più efficace: 3 handler dietro e 4 cutter davanti, che eseguono i movimenti tanto meglio quanto è alta la loro Visione. Se lo ripeti, l’IA lo riconosce.`],
`Verticale, Orizzontale, Weave e T1 partono con un’<b>apertura</b> a ogni ripresa del gioco (dopo il pull o un turnover); se il ricevitore previsto è marcato si gioca libero. Vicino alla meta parte da solo l’attacco in meta, con tagli a L.`],
tip:`Contro la zona: Orizzontale o Weave. Contro l’uomo: Verticale o Stack laterale. Contro gli aiuti: Esagono.`},
{id:'sch-dif',t:'Gli schemi di difesa',b:[
[`<b>Uomo, forza fuori</b>: il marcatore chiude il centro, il disco va verso la linea laterale.`,
`<b>Uomo, forza dentro</b>: il marcatore chiude la linea, i lanci vanno verso il centro.`,
`<b>Zona a coppa</b>: tre sul disco, quattro dietro a chiudere gli spazi. Ferma Verticale ed Esagono ma subisce Orizzontale, T1 e i lanci alti.`,
`<b>Uomo con aiuti</b>: chi marca lontano dal disco scala sulle linee di passaggio. Più intercetti, ma un taglio improvviso trova il difensore in ritardo.`]],
tip:`Una zona è ottima contro un attacco che gioca corto, ma un huck ben fatto la batte sempre.`},
{id:'sch-ia',t:'Come ragionano gli avversari',b:[
`Ogni squadra ha uno <b>stile suo</b> (gioco lungo o corto, ritmo alto o possesso paziente, difesa in anticipo o di contenimento, aiuti). Lo leggi nel menu Schemi e, in carriera, nella schermata Partita.`,
[`L’avversario cerca i <b>mismatch</b> (il tuo giocatore più lento o più basso del suo) e sceglie il lancio con più probabilità di arrivare.`,
`<b>Ricorda gli schemi che usi</b> e, dal Medio in su, sceglie sempre più spesso il controgioco di quello che ripeti.`,
`Se completi tanti passaggi corti passa all’anticipo; se lanci spesso lungo al contenimento.`,
`Cambia i giocatori stanchi e mette il difensore migliore su chi gli fa più male.`],
`Più sale la difficoltà, meglio l’avversario decide e reagisce; dal Medio in su i suoi giocatori hanno anche qualche punto in più nelle statistiche, e in Estrema parecchi.`],
tip:`Cambia schema ogni due o tre mete, anche se funziona: renderai l’IA meno efficace.`},
{id:'sch-cambi',t:'Cambi, energia e infortuni',b:[
`Ogni scatto consuma <b>energia</b> e un giocatore stanco è più lento. Sotto i tuoi giocatori compare una barretta (gialla, arancione, rossa) quando l’energia cala.`,
`Nella <b>Squadra</b> scegli le due linee (ATT e DIF, vedi «Le linee ATT e DIF»). Con i «cambi intelligenti» chi è stanco esce da solo per una meta; a inizio meta puoi sempre cambiare a mano con <b>Cambi</b>.`,
`Un giocatore molto stanco rischia di <b>infortunarsi</b> a fine meta: compare un pannello per scegliere chi entra. L’infortunato salta da 1 a 3 partite e non può né giocare né allenarsi. Sotto 35 di condizione un giocatore è «molto affaticato» e rischia di più.`],
tip:`Ruota i giocatori: un titolare fresco rende più di una stella sfinita.`},
{id:'sch-tempo',t:'Timeout, half time e pausa',b:[
[`<b>Timeout</b>: uno a partita, solo con il disco in mano (tasto in basso a sinistra). Azzera lo stall, fa recuperare un po’ di energia e permette di cambiare schema.`,
`<b>Half time</b>: a metà dei punti (4 su 7, 6 su 11, 8 su 15) compare «Half time» con Schemi, Cambi e Continua. Chi ha iniziato in difesa riprende in attacco.`,
`<b>Pausa</b> (tasto «II» in alto a destra): riprendi, sospendi (in carriera), regoli audio, stacchi, difesa e schermo intero, apri la guida o abbandoni.`],
`<b>Attenzione</b>: in carriera, nel torneo e in Ultimate Team abbandonare è una <b>sconfitta a tavolino</b>. Per fermarti usa <b>Sospendi e continua più tardi</b>: la partita si salva com’è e riparte con «Riprendi la partita». Se chiudi il gioco durante una partita di carriera, la sospensione si salva da sola.`],
tip:`Usa il timeout quando stai per perdere il disco per stall o nel momento decisivo, non a caso.`},
{id:'sch-sim',t:'Simula meta, Salta e durata',b:[
`<b>Simula meta</b> (a inizio meta) gioca la meta in un istante con l’IA per entrambe le squadre, con le stesse statistiche, la stessa fatica e gli stessi schemi; i giocatori fanno la stessa esperienza. <b>Salta</b> (in difesa automatica) fa giocare in un istante solo il possesso avversario.`,
`La <b>durata</b> si sceglie nelle Opzioni della carriera, nella partita veloce e nel torneo: <b>Arcade</b> (7 punti), <b>Competitiva</b> (11), <b>Lunga</b> (15). In Ultimate Team si gioca sempre ai 7. Le partite lunghe non fanno crescere di più.`,
`La <b>difficoltà</b> va da Facile a Estrema: più sale, meno aiuti grafici vedi e più forte è l’avversario.`],
tip:`Per le partite senza storia simula; per i derby, le finali e quando c’è qualcosa in palio gioca tu.`}
]});

TUT.push({id:'car',t:'La carriera schermo per schermo',sub:'Partita, Squadra, Allena, Mercato, Lega, Società (strutture e staff), Posta.',
intro:'La carriera dura più stagioni. Ogni schermata ha la stessa cornice: in alto stemma, crediti, Posta e Menu; a sinistra la colonna con le sei sezioni. Qui trovi a cosa serve ognuna e cosa conviene fare.',
les:[
{id:'car-inizio',t:'Cominciare una carriera',w:'Menu › Carriera',b:[
`Il tasto <b>Carriera</b> riprende l’ultima giocata; <b>Carriere</b> mostra i tre slot (carriere separate sullo stesso dispositivo). «Nuova carriera» ne comincia una e, se lo slot è pieno, chiede conferma perché lo cancella.`,
[`<b>1. Il campionato</b>: Italia, USA Men’s Club, Belgio, Francia, Germania o Regno Unito.`,
`<b>2. La squadra</b>: toccandola vedi il suo roster prima di decidere; con «Squadra del cuore» la metti in cima all’elenco. In alternativa parti da <b>Subentrato</b>: una squadra in zona retrocessione ti chiama all’ultima giornata e hai una sola partita per salvarla.`,
`<b>3. L’allenatore</b>: nome, cognome e volto.`]],
tip:`Per cominciare in tranquillità scegli una squadra del tuo livello e parti in Facile: la difficoltà si cambia quando vuoi dalle Opzioni.`},
{id:'car-cruscotto',t:'La schermata Partita e la cornice',w:'Colonna a sinistra › Partita',b:[
`È la schermata da cui parte tutto: la <b>linea delle giornate</b>, la prossima avversaria con il suo stile e il <b>meteo</b>, la mini-classifica e gli indicatori (crediti, tifosi, morale, affiatamento).`,
[`<b>Inizia partita</b> (tasto giallo) la gioca; <b>Simula</b> la fa giocare al posto tuo.`,
`<b>Questa settimana</b> elenca ciò che serve adesso (linee incomplete, infortunati, allenamento, mercato rinnovato, posta): ogni riga porta alla schermata giusta.`,
`<b>Colonna a sinistra</b>: <b>Partita, Squadra, Allena, Mercato, Lega, Società</b>. Un «!» o «NEW» dice cosa richiede attenzione.`,
`<b>Barra in alto</b>: stemma e stagione (apre la Società), crediti, <b>Posta</b>, il volto dell’allenatore e <b>Menu</b> con Guida, Tutorial, Opzioni e Menu principale.`],
`La prima volta che apri una sezione compare un fumetto che la spiega; «Scopri di più» porta alla lezione.`],
tip:`Prima di ogni partita: guarda il meteo, svuota «Questa settimana» e solo poi premi Inizia.`},
{id:'car-rosa',t:'La Squadra (Rosa)',w:'Colonna › Squadra',b:[
`I tuoi giocatori sono <b>carte</b>: ruolo (colore), Overall, faccina dell’umore, stelle, barra verde della condizione e bollini <b>A</b> e <b>D</b> per le linee. In alto scegli chi vedere (tutti, per ruolo, fuori dalle linee, «da gestire») e come ordinarli.`,
`Tocca una carta per aprire la <b>scheda</b>: <b>Attributi</b> (con «Confronta con»), <b>Prestazioni</b> (partite, umore, obiettivo, intesa, premi) e <b>Sviluppo</b> (potenziale, crescita, indirizzo, rapporto degli osservatori). Le frecce passano al giocatore dopo o prima.`,
`Dalla scheda: <b>Riposo</b> (salta la prossima partita e recupera condizione), <b>Colloquio</b> (pochi crediti, solleva l’umore ma funziona meno se lo ripeti), <b>Soprannome</b>, <b>Specializzazione</b> e <b>priorità di allenamento</b>.`,
`L’<b>Overall</b> (OVR) è il valore del giocatore nel suo ruolo migliore; la <b>forza della squadra</b> è la media dei 7 migliori. Circa un giocatore su quattro ha un <b>tratto</b> (Deep Threat, Break Specialist, Field General, Lockdown, Sky Dominator, Safe Hands, Explosive Cutter, Ironman).`],
tip:`«Linee consigliate» sistema le linee per te; se una linea ha meno di 7 giocatori o un infortunato, «Questa settimana» te lo segnala.`},
{id:'car-linee',t:'Le linee ATT e DIF',w:'Squadra › A e D',b:[
`La linea <b>ATT</b> gioca le mete in cui ricevi il pull, la linea <b>DIF</b> quelle in cui lo tiri. I bollini A e D sulle carte dicono chi è in ogni linea (si cambia con ATT e DIF nella scheda), e ognuna ha bisogno di 7 giocatori.`,
`Un titolare può stare in entrambe, ma si stanca di più. <b>Linee consigliate</b> mette in attacco 3 handler e 4 cutter e in difesa i migliori difensori (con almeno 2 handler per ripartire): un buon equilibrio di ruoli rende più delle sole stelle.`,
`Handler e cutter che giocano insieme costruiscono <b>intesa</b>: lanci più precisi e meno prese perse tra loro.`],
tip:`Non cambiare tutta la linea a ogni partita: l’intesa si costruisce restando insieme.`},
{id:'car-mercato',t:'Il Mercato',w:'Colonna › Mercato',b:[
`Si rinnova ogni 5 giornate. Ci sono <b>15 giocatori</b> di livello vicino al tuo, divisi nelle linguette: giovani promesse, svincolati, in vendita da altre squadre e, con la stella, <b>internazionali</b> (giocatori veri del mondo; i più forti arrivano solo con tanta reputazione).`,
[`<b>Solo chi posso prendere</b> nasconde chi costa troppo, chiede più reputazione o non ha posto in rosa.`,`<b>Ordina per</b>: prezzo, forza, potenziale, età, rapporto qualità/prezzo.`,`Ogni scheda dice di quanto migliorerebbe il titolare che sostituisce.`],
`Alcuni hanno una <b>motivazione</b> sotto il nome: «Vuole giocare» firma solo se sarebbe titolare; «Ambizioso» non scende in Serie C; «Ingaggio alto» costa di più; «Cerca un progetto» fa lo sconto se Vivaio o Campo di allenamento sono almeno al livello 2.`,
`I <b>giovani</b> sono una scommessa: il potenziale è un intervallo che si stringe osservandoli o tenendoli in rosa, e qualcuno sorprende in meglio o in peggio. Gli <b>adulti</b> rendono subito ma crescono poco.`,
`Ogni acquisto ha anche uno <b>stipendio</b> che paghi a ogni partita: prima di comprare guarda se i conti reggono. Con i conti in rosso non si compra.`],
tip:`Un giovane col potenziale alto che oggi è scarso diventa il titolare di domani: osservalo prima di decidere.`},
{id:'car-scouting',t:'Osservazioni e rapporti',w:'Mercato › Osserva / Rapporto',b:[
`Osservare un giocatore costa qualche credito, di più per chi vale di più; la <b>Rete di osservatori</b> lo rende più economico. Ogni osservazione sblocca una parte del rapporto:`,
[`La <b>prima</b> mostra i punti di forza.`,`La <b>seconda</b> i punti deboli e il tratto.`,`La <b>terza</b> gli schemi adatti, la compatibilità con il vostro stile e il posto che occuperebbe in squadra.`],
`Chi è adatto al tuo gioco (lungo o corto) si inserisce subito; gli altri tolgono un po’ di affiatamento.`],
tip:`Con «Occhio clinico» nello staff scopri i potenziali dei tuoi giocatori con un anno di anticipo.`},
{id:'car-allenamenti',t:'Gli Allenamenti',w:'Colonna › Allena',b:[
`A ogni giornata puoi fare <b>una seduta di squadra</b> e fino a <b>3 lavori individuali</b>, che rendono di più. Cinque indirizzi:`,
[`<b>Tecnica</b>: lancio, buco, sparo, presa.`,`<b>Atletismo</b>: velocità, scatto, agilità, salto, resistenza.`,`<b>Difesa</b>: difesa, tuffo.`,`<b>Tattica</b>: visione e affiatamento.`,`<b>Recupero</b>: ridà condizione, nessuna crescita.`],
`L’<b>intensità</b> vale per tutte le sedute: Leggero (metà fatica, meno crescita), Normale, Intenso (più crescita, molta più fatica e più rischio di infortuni). Sopra ogni tasto vedi i punti attesi e la condizione che costa.`,
`Chi è scarico gioca con meno energia e sotto 45 di condizione rischia di infortunarsi anche in allenamento: alterna lavoro e recupero.`,
`Il <b>Programma automatico</b> fa le sedute al posto tuo (Recupero se la squadra è scarica, altrimenti l’indirizzo scelto), partendo dai giocatori che hai segnato come priorità. L’esito arriva nella Posta.`],
tip:`La settimana di una partita importante: Recupero il giorno prima, così arrivi con energie piene.`},
{id:'car-crescita',t:'Crescita, età e maturità',b:[
`I giocatori migliorano giocando (lanci riusciti, tagli efficaci, buone marcature, difese) e allenandosi. I giovani crescono in fretta, tra 24 e 27 anni ci si stabilizza, dopo i 30 il fisico cala. Più un giocatore è forte, più piano sale.`,
[`<b>Specializzazioni</b> (Regista, Lanciatore lungo, Saltatore, Scattista, Guardiano, Lettore di gioco): per qualche credito orientano gli allenamenti verso 2-3 statistiche. Rendono di più sui giovani con tanto margine.`,
`<b>Maturità</b>: d’estate chi ha raggiunto il suo limite può superarlo un poco (al massimo due volte in carriera).`,
`<b>Obiettivi personali</b>: a inizio stagione fino a 3 giocatori si pongono un traguardo. Chi lo raggiunge cresce di più; chi lo manca due volte di fila chiede di partire.`],
`Simulare una partita dà in media la stessa esperienza di giocarla.`],
tip:`Punta su 2-3 giovani da far crescere con le specializzazioni: è l’investimento che rende di più nel lungo periodo.`},
{id:'car-club',t:'La Società: conti e strutture',w:'Colonna › Società',b:[
`La Società ha quattro parti: <b>Conti</b>, <b>Strutture</b>, <b>Staff</b> e <b>Bacheca</b> (albo d’oro, traguardi, record).`,
`Le <b>strutture</b> sono sei e arrivano al livello 5. Ogni livello costa più del precedente e ha una manutenzione che paghi a ogni partita:`,
[`<b>Campo di allenamento</b>: allenamenti +6% per livello, e stancano meno.`,`<b>Fisioterapia</b>: più recupero a ogni giornata e −12% di infortuni per livello.`,`<b>Vivaio</b>: più giovani promesse sul mercato, e più forti.`,`<b>Tribune</b>: +55% di posti per livello; i tifosi salgono di più dopo una vittoria e calano di meno dopo una sconfitta. Più posti fanno incassare di più solo se i tifosi riempiono lo stadio.`,`<b>Rete di osservatori</b>: osservare un giocatore costa il 15% in meno per livello.`,`<b>Sede del club</b>: affiatamento più rapido e morale di base più alto.`],
`Le strutture si consumano: d’estate possono perdere un livello e in stagione capita un guasto da riparare. Tenerne una almeno al livello 3 per metà stagione porta in estate un premio: sotto ogni struttura vedi a che punto sei.`],
tip:`Con pochi crediti parti dal Campo di allenamento. Le Tribune servono quando lo stadio è pieno: in Conti vedi in quante partite si ripaga il prossimo livello.`},
{id:'car-staff',t:'Lo Staff tecnico',w:'Società › Staff',b:[
`Quattro persone, una per ruolo, con un <b>livello da 1 a 3</b> e spesso un’<b>abilità speciale</b>:`,
[`<b>Allenatore</b>: allenamenti più efficaci. «Motivatore» (più morale dopo ogni partita) o «Beniamino dei tifosi» (più tifosi a ogni vittoria).`,
`<b>Preparatore atletico</b>: più recupero e meno infortuni. «Fisioterapista» (infortuni più brevi) o «Recupero rapido» (più condizione dopo ogni partita).`,
`<b>Analista tattico</b>: alza la forma di squadra. «Stratega» (ancora più forma) o «Occhio clinico» (scopre i potenziali un anno prima).`,
`<b>Mentore dei giovani</b>: chi ha fino a 23 anni cresce di più. «Papà della squadra» (più affiatamento) o «Scopritalenti» (chi ha fino a 21 anni cresce ancora di più).`],
`Ogni ruolo parte vacante: <b>Scegli chi assumere</b> mostra tre candidati (un giovane economico che cresce, uno esperto, un veterano già al massimo ma più caro). <b>Migliora</b> paga una formazione fino al massimo della persona; con l’esperienza sale anche da sola. <b>Cambia</b> la sostituisce. Ogni tanto un altro club prova a portartene via uno.`],
tip:`Il Mentore è il più utile se punti sui giovani, l’Allenatore se vuoi crescita per tutti. Lo staff ha uno stipendio a ogni partita: assumi quando i conti reggono.`},
{id:'car-soldi',t:'Soldi, tifosi e morale',b:[
`Ogni partita ha il suo <b>conto</b>, che vedi a fine partita e in Società › Conti:`,
[`<b>Entrate</b>: i biglietti (solo in casa: più tifosi e partite importanti portano più spettatori, fino ai posti dello stadio), lo sponsor e il premio vittoria.`,
`<b>Uscite</b>: gli <b>stipendi</b>, la spesa più grande (salgono con l’Overall, quindi ogni acquisto pesa su tutte le partite; oltre i 14 stipendi più alti le riserve costano metà), poi strutture, staff e, in trasferta, il viaggio. Anche una vittoria può chiudersi in rosso.`],
`A inizio stagione scegli lo <b>sponsor</b>: Sicuro (più soldi a partita, bonus piccolo), Equilibrato o Ambizioso (meno a partita, bonus grande se raggiungi l’obiettivo). L’obiettivo è scritto sul contratto. Chi sale di categoria riceve un premio della lega.`,
`<b>Conti in rosso</b>: mercato, strutture e staff si fermano, la dirigenza avvisa e il morale cala. Se dura troppo vieni <b>esonerato</b> e riparti da una squadra più debole.`,
[`<b>Bilancio previsionale</b> (Società › Conti): come chiuderai la stagione se continui così.`,
`<b>Tifosi</b>: riempiono lo stadio, salgono con le vittorie e calano con le sconfitte.`,
`<b>Morale</b>: si alza con vittorie, premi e Recupero; un Colloquio aiuta il singolo.`,
`<b>Reputazione</b>: apre porte (mercato, internazionali, offerte di altri club).`],
`Ogni tanto la dirigenza propone una <b>sfida facoltativa</b> (se riesce porta crediti e reputazione), e dopo una grande partita di un giocatore la società gli dà in automatico un <b>premio</b>: lo paghi tu, e fa piacere alla squadra.`],
tip:`Non spendere tutto subito: tieni una riserva per le emergenze (un guasto, un colloquio, un rinnovo) e guarda il bilancio prima di ogni acquisto grosso.`},
{id:'car-classifica',t:'Lega: classifica, playoff e premi',w:'Colonna › Lega',b:[
`In <b>Lega</b> scegli la serie da guardare, leggi i risultati delle altre e, in «Dal campionato», le storie della stagione. Sotto la tua serie ci sono i <b>migliori per mete, assist e difese</b>. Campionato e Campionato europeo (EUCF) sono due linguette.`,
`Dopo la stagione regolare si giocano <b>playoff</b> o fasi finali: il formato di ogni campionato è nel capitolo «I campionati uno per uno».`,
[`A fine stagione arrivano i <b>premi</b>: MVP, attaccante e difensore dell’anno, capocannoniere, re degli assist, rivelazione, allenatore dell’anno e squadra ideale. Restano nella scheda del giocatore e portano reputazione.`,
`Ogni stagione nasce una <b>rivalità</b> con una squadra del tuo livello: vincere il derby dà crediti, morale e reputazione; perderlo fa male all’umore.`],
`Quando il campionato finisce, in cima alla pagina Lega trovi il riepilogo e il grande tasto <b>Inizia la nuova stagione</b>. Le spiegazioni lunghe stanno dietro il pulsante <b>i</b>.`],
tip:`Nei playoff ogni partita conta: giocale tu e usa bene i cambi.`},
{id:'car-avvisi',t:'Posta, ritiri e spogliatoio',b:[
`La <b>Posta</b> (in alto) divide i messaggi in <b>Da decidere</b>, <b>Novità</b> e <b>Cronologia</b>. Emergenze (infortuni, addii) e decisioni (ritiri, offerte, richieste di cessione) si aprono da sole; le notizie accendono solo il numero.`,
[`<b>Ritiri</b>: un giocatore prima fa capire che ci pensa, poi annuncia l’ultima stagione: puoi chiedergli un altro anno con un premio di permanenza (un solo tentativo). Chi lascia il segno entra nella Hall of Fame.`,
`<b>Spogliatoio</b>: un buon giocatore che resta fuori a lungo diventa scontento e poi chiede la cessione (vendilo o promettigli spazio; se non mantieni la promessa se ne va gratis).`,
`<b>Offerte</b>: ogni tanto una squadra più importante chiede uno dei tuoi migliori: accetti o rifiuti entro la partita successiva.`,
`<b>Infortuni seri</b> possono lasciare un piccolo calo fisico al rientro.`]],
tip:`Un buon giocatore in panchina troppo a lungo ti lascia: ruotalo oppure promettigli spazio.`},
{id:'car-extra',t:'Conferenze, imprevisti e traguardi',b:[
[`<b>Conferenza stampa</b>: dopo una partita con un po’ di storia scegli tra tre risposte: parli della squadra (morale), dei tifosi (più tifosi) o di un giocatore (il suo umore migliora). «Salta» non cambia nulla.`,
`<b>Imprevisti</b>: una o due volte a stagione succede qualcosa (sponsor, influenza, provino, invito a un torneo), spesso con una scelta tra due strade.`,
`<b>Traguardi</b> (Società › Bacheca): venti obiettivi di lungo periodo con barra di avanzamento, ognuno con un piccolo premio.`,
`<b>Albo d’oro, Record e Hall of Fame</b> (Bacheca): trofei, i migliori di sempre della squadra e le carte dorate di chi si ritira dopo una carriera speciale.`]],
tip:`I traguardi sono una guida gratuita su cosa fare dopo: guardali quando non sai che obiettivo darti.`},
{id:'car-opzioni',t:'Opzioni e salvataggi',w:'Menu › Opzioni',b:[
`Dalle <b>Opzioni</b> della carriera regoli difficoltà, durata, vento e meteo, Suggerimenti, difesa, musica e slot.`,
[`La carriera si salva da sola a ogni passo; i <b>3 slot</b> sono carriere separate.`,
`Puoi <b>esportare e importare un file</b> della carriera (per cambiare dispositivo o farne una copia).`]],
tip:`Prima di una scelta rischiosa (cambiare campionato, per esempio) esporta la carriera: è la tua copia di sicurezza.`}
]});

TUT.push({id:'lega',t:'I campionati uno per uno',sub:'Italia, USA Men’s Club, Belgio, Francia, Germania, Regno Unito, EUCF.',
intro:'Ogni campionato ha il suo formato, ricostruito su quello vero. Qui capisci come si gioca, come ci si qualifica e cosa succede a fine stagione.',
les:[
{id:'lega-scelta',t:'Come si sceglie il campionato',w:'Nuova carriera',b:[
`Alla nuova carriera scegli prima il <b>campionato</b>: Italia, USA Men’s Club, Belgio, Francia, Germania o Regno Unito; poi la squadra, con il roster visibile prima di decidere.`,
`Le squadre e i giocatori sono quelli veri del 2026. Le carriere di campionati diversi sono separate, ma con le offerte si può passare da uno all’altro (vedi «Offerte tra tutte le leghe»).`],
tip:`Non sai da dove partire? Un club di Serie C o di una divisione bassa è più difficile, ma si cresce di più e le promozioni danno molta soddisfazione.`},
{id:'lega-it',t:'Italia: Serie A, B e C',b:[
`Tre serie con le squadre e le rose dei <b>Campionati Italiani Ultimate Open 2026</b>.`,
[`Si giocano <b>15 giornate</b>.`,
`In <b>Serie A</b> le prime 4 giocano semifinali (1ª-4ª, 2ª-3ª) e finale per lo scudetto.`,
`In <b>Serie B e C</b> la prima sale direttamente e dal 2° al 5° posto c’è lo spareggio per la seconda promozione.`,
`Salgono due squadre e ne scendono due.`,
`Le prime 3 della Serie A giocano il <b>Campionato europeo (EUCF)</b> della stagione dopo.`]],
tip:`Dopo uno scudetto le rivali di Serie A si rinforzano per un po’: investi in rosa e strutture per difendere il titolo.`},
{id:'lega-usa',t:'USA Men’s Club',b:[
`<b>48 club</b> veri della divisione Men’s di USA Ultimate (compresi i canadesi), divisi in <b>8 Conference</b> geografiche da 6 club. Niente promozioni né retrocessioni.`,
[`Nella tua Conference giochi <b>5 giornate</b>, sola andata; in classifica contano vittorie, scontri diretti e differenza mete.`,
`In più giochi <b>7 partite interregionali</b>, una contro un club di ciascuna delle altre Conference: non entrano nella classifica della Conference ma contano per il ranking. Le giochi o le simuli come le altre.`],
`Il <b>ranking nazionale</b> sale con le vittorie (di più contro avversarie forti e con margini larghi) e scende con le sconfitte, dopo ogni partita. Decide quanti posti ai Nationals ha ogni regione e le teste di serie.`],
tip:`Con soli 5 turni di Conference ogni partita pesa tantissimo: gioca tu quelle contro le rivali dirette.`},
{id:'lega-nat',t:'USA: Play-in e Nationals',b:[
`Ogni Conference ha <b>1 posto automatico</b> ai Nationals; altri 8 posti vanno alle regioni secondo il ranking (da 1 a 4 per regione, 16 in tutto). I posti sono della regione: se li contendono i club della Conference.`,
`<b>I posti cambiano durante la stagione</b> e sono definitivi solo alla fine della stagione regolare: in Classifica vedi la freccia e una notizia quando cambiano.`,
[`Con 1 posto va la 1ª.`,`Con 2: la 1ª direttamente e 2ª contro 3ª in gara secca (Play-in).`,`Con 3: la 1ª diretta, poi 2ª-5ª e 3ª-4ª.`,`Con 4: le prime due dirette, poi 3ª-6ª e 4ª-5ª.`],
`I <b>Nationals</b> hanno 16 squadre in 4 gironi da 4: le prime vanno ai quarti, seconde e terze ai prequarti, le quarte sono fuori. Poi quarti, semifinali e finale.`,
`In Classifica trovi tre viste: <b>Conference</b> (verde = Nationals diretti, giallo = Play-in, rosso = fuori), <b>Nationals</b> e <b>Ranking</b>.`],
tip:`Ogni vittoria larga, in Conference e nelle interregionali, alza il ranking e può far guadagnare un posto a tutta la regione.`},
{id:'lega-eu',t:'Belgio, Francia, Germania, Regno Unito',b:[
`Campionati Open veri, con i formati del 2026. Nessuno è eliminato: ogni turno delle fasi finali vale per il piazzamento, e a fine stagione si sale e si scende tra i livelli.`,
[`<b>Belgio</b>: 6 livelli (N1-N6) da 8 squadre in due gironi da 4, poi le finali di piazzamento.`,
`<b>Francia</b>: la N1 ha 12 squadre in due poule da 6 e un Top 8 a tabellone; sotto la N2 e la N3.`,
`<b>Germania</b>: la 1. Liga ha 16 squadre in due gironi da 8 con fasi finali; poi 2. e 3. Liga.`,
`<b>Regno Unito</b>: i Nationals (due gironi da 4 e turno incrociato) e, sotto, i club dell’Open Tour.`],
`I gironi si giocano con più giri contro le stesse squadre, poi le fasi finali: chi arriva fino in fondo gioca almeno <b>11 partite</b>.`],
tip:`Nei livelli bassi le rose hanno meno nomi veri: è l’occasione per trovare giovani e svincolati di talento.`},
{id:'lega-eucf',t:'Il Campionato europeo (EUCF)',w:'Colonna › Lega (stagione dopo la qualificazione)',b:[
`Si sblocca <b>chiudendo il campionato tra i posti qualificanti</b>: in Serie A e nel livello più alto del Belgio le prime 3, in Francia e Regno Unito le prime 2, in Germania la prima. Si gioca nella stagione dopo.`,
`<b>16 club</b> in 4 gironi da 4, poi quarti, semifinali e finale. Ogni turno superato porta <b>crediti</b>; la vittoria anche reputazione e un trofeo. Ogni edizione vinta alza il livello delle avversarie successive.`],
tip:`In Europa le avversarie sono forti: arriva con la rosa fresca e prepara gli schemi giusti prima di ogni girone.`},
{id:'lega-ponte',t:'Offerte tra tutte le leghe',w:'Posta (in alto)',b:[
`Se la carriera va bene, a inizio stagione un club di <b>un’altra lega</b> può offrirti la <b>panchina</b>. L’offerta arriva nella Posta e vale fino alla prossima partita.`,
[`Il club offerto ha un <b>prestigio simile al tuo</b>.`,
`Accettando cambi club e lega, ma <b>allenatore, storico, trofei e traguardi restano tuoi</b> (la reputazione scende un po’).`,
`Ogni tanto un club propone anche uno <b>scambio di giocatori</b> di livello simile, dalla tua lega o da un’altra.`]],
tip:`Vuoi cambiare lega senza perdere nulla? Aspetta l’offerta. Non ti piace? Rifiuta e resti dove sei.`}
]});

TUT.push({id:'mod',t:'Le altre modalità',sub:'Partita veloce, Torneo, Ultimate Team, Real player, Allenamento.',
intro:'Oltre alla carriera, il gioco ha quattro modalità da giocare senza impegno o con una collezione da costruire.',
les:[
{id:'mod-veloce',t:'Partita veloce e Torneo',b:[
[`<b>Partita veloce</b>: scegli due squadre, la durata, la difficoltà e chi inizia in attacco. Non viene registrato nulla: ideale per provare squadre e schemi.`,
`<b>Torneo</b>: un torneo a eliminazione diretta a 4, 8 o 16 squadre vere, con la tua squadra, la provenienza delle avversarie e la difficoltà. Le partite le giochi o le simuli e il tabellone resta salvato. Abbandonare una partita è una sconfitta a tavolino.`]],
tip:`La Partita veloce in Estrema è il banco di prova migliore quando ti sembra tutto troppo facile.`},
{id:'mod-ut',t:'Ultimate Team',b:[
`Apri <b>pacchetti</b> di carte Handler, Cutter e Defender, scegli i 7 titolari e giochi il torneo a eliminazione. Ogni partita dà <b>gettoni</b> (di più se vinci e vai avanti) per comprare pacchetti e potenziare le carte.`,
[`<b>Negozio</b>: il pacchetto normale (5 carte) e i pacchetti <b>Handler</b> e <b>Cutter</b> (3 carte dello stesso ruolo) per coprire il ruolo che ti manca.`,
`<b>Pacchetti premio</b>: superando i turni ricevi pacchetti sempre più rari (bronzo, argento, oro, platino) e chi vince il Super pacchetto arcobaleno. Più è raro, migliori sono le carte.`,
`<b>Potenziamenti</b>: al massimo 4 per carta (2 per linea): Tiro, Atletico, Difesa, Mani e testa. Chi gioca da titolare cresce anche da solo.`,
`I <b>doppioni</b> si scartano per recuperare gettoni; gli <b>obiettivi</b> danno altri gettoni. Si gioca sempre ai 7 punti.`]],
tip:`Potenzia linee diverse: la squadra è più completa e meno prevedibile.`},
{id:'mod-real',t:'Real player',b:[
`In Ultimate Team scegli «Real player» invece di «Computer»: sfidi le squadre di altri giocatori, senza che siano online nello stesso momento (la loro squadra la guida l’IA, sempre a livello Difficile). La squadra è separata da quella del torneo e si parte da un pacchetto di 10 giocatori.`,
[`Scegli un <b>nome</b> (poi non si cambia). «Inizia partita» ti abbina a un avversario con punti vicini ai tuoi.`,
`Si parte da <b>1000 punti</b>: battere uno più forte vale di più, perdere contro uno più debole costa di più. La classifica online mostra i primi 50.`,
`Vinci gettoni a ogni partita (di più se batti chi ha più punti). Il riquadro <b>Traguardi</b> mostra i pacchetti premio: 1100 bronzo, 1200 argento, 1300 oro, 1400 platino, 1500 Super pacchetto.`,
`I potenziamenti delle carte si sbloccano a 1100 punti.`],
`Servono internet e la partita va finita: abbandonare o chiudere il gioco conta come sconfitta. Senza connessione il resto del gioco funziona come sempre.`],
tip:`Costruisci prima una squadra equilibrata nel torneo contro il computer per capire quali ruoli ti servono, poi spendi i gettoni di Real player.`},
{id:'mod-allenamento',t:'Allenamento libero e sfide',w:'Menu › Allenamento',b:[
`Oltre al tutorial guidato, l’Allenamento ha:`,
[`<b>Allenamento libero</b>: senza punteggio, con o senza difesa; ideale per imparare i tipi di lancio.`,
`<b>Sfide con medaglie</b>: Precisione, Break, Huck e duelli, Difesa e layout.`],
`Nessuna sfida ha conseguenze sulla carriera: puoi riprovare finché non ti riesce.`],
tip:`Prima di una carriera in Difficile, prova qui la mira degli huck: le medaglie ti dicono quanto sei pronto.`}
]});

TUT.push({id:'tr',t:'Trucchi e strategie',sub:'I consigli che fanno la differenza in partita e in carriera.',
intro:'Regole pratiche, raccolte dal gioco: leggile prima di una partita importante.',
les:[
{id:'tr-att',t:'Attacco: dieci regole',b:[
[`Lancia <b>dove il compagno corre</b>, non dove si trova.`,
`Se la croce rossa lampeggia, <b>cambia bersaglio</b> o lancia alto.`,
`Con lo stall alto, uno <b>scarico corto</b> vale più di un huck forzato.`,
`Il <b>rovesciato</b> (doppio tocco) passa sopra il marcatore: usalo nel cono rosso.`,
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
`Prima di comprare pensa allo <b>stipendio</b>: una rosa lunga e forte costa a ogni partita.`,
`Investi presto nel <b>Campo di allenamento</b>; le <b>Tribune</b> quando i tifosi riempiono lo stadio.`,
`Punta su <b>2-3 giovani</b> con potenziale alto e specializzali.`,
`Gioca tu i <b>derby, le finali e i playoff</b>, simula le partite senza storia.`,
`Ruota i titolari: un giocatore in panchina troppo a lungo chiede di partire.`,
`<b>Esporta</b> la carriera ogni tanto: è la tua copia di sicurezza.`]]}
]});
