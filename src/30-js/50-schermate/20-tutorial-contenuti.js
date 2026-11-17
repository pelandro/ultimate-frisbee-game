/* ---- TUTORIAL COMPLETO: i contenuti ----
   TUT = capitoli {id, t: titolo, sub: riga d'elenco, intro, les: lezioni}; lezione = {id, t, w: dove si trova (facoltativo), b: blocchi, tip: trucco}.
   Un blocco e' un paragrafo (stringa) oppure un elenco (array di stringhe); si puo' usare <b>. I fatti vengono dalla Guida a schede (07-guida.html) e dal codice:
   quando una regola cambia, aggiorna qui la lezione che la riguarda. Sei capitoli e circa venti lezioni brevi: il resto sta nella Guida.
   Gli id delle lezioni non si cambiano: li usano i fumetti (TIP_LES in 21-tutorial.js) e il progresso salvato; se due lezioni si uniscono, resta l'id della prima.
   Il tutorial dice cio' che serve per giocare bene: niente formule, tarature o conti interni dell'economia (quelli stanno nella Guida). Tono e parole fisse: docs/STILE-TESTI.md. */
const TUT=[];

TUT.push({id:'ini',t:'Per iniziare',sub:'Le regole in breve, le parole da sapere, i comandi e le prove guidate.',
intro:'Tre lezioni per partire: come si gioca, come si comanda il gioco e come imparare giocando.',
les:[
{id:'ini-gioco',t:'Come si gioca',b:[
`Due squadre da 7 giocatori e un disco. Per fare una <b>meta</b> (un punto) devi prendere il disco dentro la zona di meta avversaria. <b>Chi ha il disco non può correre</b>: si avanza solo passandolo ai compagni.`,
[`Se il disco cade, esce dal campo o viene intercettato, passa agli avversari: è un <b>turnover</b>.`,
`Se un avversario ti marca da vicino hai <b>10 secondi</b> per lanciare (lo <b>stall</b>). A 10 perdi il disco.`,
`Dopo ogni meta le squadre cambiano campo e chi ha segnato tira il <b>pull</b>, il lancio lungo che fa ripartire il gioco.`,
`Vince chi arriva per primo a 7 mete (11 o 15 nelle partite più lunghe).`],
`Le parole da sapere:`,
[`<b>Handler</b> gestisce e lancia il disco, <b>Cutter</b> taglia e riceve, <b>Defender</b> è lo specialista della difesa.`,
`<b>Taglio</b>: la corsa per smarcarsi. <b>Marcatore</b>: il difensore che marca chi ha il disco.`,
`<b>Handblock</b>: il blocco del lancio con la mano. <b>Tuffo</b>: lo slancio per prendere o fermare un disco lontano. <b>Huck</b>: un lancio lungo e alto.`,
`<b>Overall</b> (OVR): il valore di un giocatore, da 1 a 99.`]],
tip:`Non serve imparare tutto subito: nelle prime tre partite compaiono delle schede che spiegano ogni cosa quando serve.`},
{id:'ini-comandi',t:'Menu e comandi',b:[
`Dal menu iniziale scegli come giocare:`,
[`<b>Carriera</b>: guidi una squadra per più stagioni («Salvataggi» mostra i tre slot).`,
`<b>Partita veloce</b> e <b>Torneo</b> (4, 8 o 16 squadre): subito in campo, senza impegno.`,
`<b>Ultimate Team</b>: pacchetti di carte e torneo.`,
`<b>Allenamento</b>: tutorial pratico, allenamento libero e sfide.`],
`Si gioca con il tocco, il mouse, la tastiera o il controller:`,
[`<b>Touch e mouse</b>: per lanciare trascina il dito all’indietro e rilascia; per chiamare un compagno toccalo; in difesa usa i pulsanti rossi in basso (handblock e tuffo).`,
`<b>Tastiera</b>: frecce o WASD = direzione; Spazio o J = lancio (tieni premuto per caricare, rilascia per tirare); Maiusc o K = lancio alto (in difesa, tuffo); E = taglio; Q = isolamento; C = clear; Esc = annulla; Invio = salta il possesso avversario.`,
`<b>Controller</b>: stick o croce = direzione; A o RT = lancio; X o B = lancio alto; Y = «Salta».`],
`Le <b>Impostazioni</b> (menu iniziale e pausa) hanno quattro schede: Partita, Comandi, Schermo e audio, Avanzate.`],
tip:`Sul telefono si gioca in orizzontale: se lo tieni in verticale il gioco si gira da solo.`},
{id:'ini-primi',t:'Imparare giocando',w:'Prime partite e menu Allenamento',b:[
`La prima partita è anche un tutorial: <b>impari giocando</b>. In alto un riquadro ti chiede una cosa alla volta (tirare il pull, passare, chiamare un taglio, un isolamento, un lancio alto, passare prima del 10, difendere, segnare) e la partita continua mentre provi.`,
[`Quando ci riesci il riquadro diventa verde e passa alla prova dopo; se sbagli ti dice di riprovare e, se tardi, aggiunge un suggerimento.`,
`Poche schede si leggono soltanto (obiettivo, timeout, schemi, cambi, pausa) e fermano il gioco finché premi «Capito». «Salta questo passo» va avanti, «Esci dal tutorial» lo spegne.`,
`Dura le prime tre partite. Per rifarlo: Impostazioni › Partita › Suggerimenti, spegni e riaccendi.`],
`Nel menu <b>Allenamento</b> trovi il <b>tutorial pratico</b> (sette lezioni: lancio, tagli, tipi di lancio, stall, meta, difesa, pull: si supera facendo ciò che spiega), l’<b>allenamento libero</b> senza punteggio e le <b>sfide con medaglie</b> (Precisione, Break, Huck e duelli, Difesa e layout). Nulla di questo tocca la carriera.`],
tip:`L’allenamento libero senza difesa è il posto migliore per imparare a mirare un huck o un lancio alto senza paura di perdere il disco.`}
]});

TUT.push({id:'att',t:'Attacco',sub:'Pull, lancio, chiamate ai compagni, lanci lunghi, stall.',
intro:'Tutto quello che puoi fare quando hai il disco o lo stai per avere.',
les:[
{id:'att-pull',t:'Il pull',b:[
`Ogni meta comincia con il pull, un lancio lungo verso gli avversari. Lo tiri con due tocchi (o Spazio):`,
[`<b>Potenza</b>: ferma il cursore nel <b>verde</b> per arrivare nella meta avversaria; prima è corto, nel rosso rischia di uscire dal fondo.`,
`<b>Direzione</b>: ferma il cursore al centro (verde, o almeno giallo). Nel rosso il disco esce di lato.`],
`Sul campo vedi dove cadrà: <b>FUORI</b>, <b>CORTO</b>, <b>BUON PULL</b> o <b>GRAN PULL</b> (in oro, ben dentro la meta). Un gran pull mette in difficoltà chi riceve (lo stall parte più alto, i tagliatori sono in ritardo); un pull corto o fuori aiuta l’attacco avversario. Se esce si riparte dal <b>brick</b> (la × al centro del campo).`],
tip:`Per il pull scegli chi ha Lancio e Sparo più alti: le barre vanno più piano.`},
{id:'att-lancio',t:'Lanciare e mirare',b:[
`Non ci sono pulsanti: quando hai il disco <b>tocca, trascina il dito all’indietro e rilascia</b>, come una fionda. Il disco parte nel verso opposto, tanto più lontano quanto più trascini. L’arco a quadretti mostra dove arriva, con la distanza. Per annullare riporta il dito vicino a dove avevi toccato («ANNULLA»).`,
[`<b>Mira assistita</b>: se punti verso un compagno il lancio si <b>aggancia</b> a lui (anello e freccia).`,
`<b>Cerchio tratteggiato</b>: l’errore possibile. Cresce con la distanza, con la pressione (stall alto, marcatore addosso), con i lanci difficili e se rilasci in fretta.`,
`<b>Arco rosso</b>: il limite della tua gittata (oltre, il disco cade corto). Se lampeggia con una <b>croce</b>, un difensore può intercettare lì: cambia bersaglio o lancia alto.`,
`In Facile l’anello è verde (sicuro), giallo (incerto) o rosso (rischioso); dal Medio in su il colore sparisce, in Estrema anche l’anello e la traiettoria.`],
`Il <b>tipo di lancio</b> si sceglie con le dita: <b>un tocco = piatto</b>; <b>doppio tocco = alto</b> (tocca una volta in un punto libero del campo, poi tocca di nuovo e tieni premuto; vanno bene anche due dita insieme). Dal lancio dopo si torna al piatto.`,
[`<b>Piatto</b>: Rovescio (il più preciso) o Dritto (parte prima, ma perde precisione da lontano). Da 30 m è un <b>huck</b>.`,
`<b>Alto</b>: Scoober (fino a 14 m: rapido, scavalca le mani del marcatore) o Hammer (oltre: nessuno lo intercetta lungo la linea, ma è lento e meno preciso).`],
`Il gioco sceglie da solo il lancio giusto e lo scrive accanto al mirino.`],
tip:`Lancia dove il compagno sta correndo, non dove si trova adesso. E prima di rilasciare guarda la croce rossa: è il modo più semplice per non regalare intercetti.`},
{id:'att-chiama',t:'Chiamare i compagni',b:[
`Le <b>chiamate rapide</b> si fanno toccando i compagni, senza trascinare:`,
[`<b>Tocco su un compagno</b> = taglio. Un cutter vicino al disco va lungo, uno già lontano torna incontro; un handler ti offre lo scarico (<b>reset</b>).`,
`<b>Tieni premuto</b> su un compagno = <b>isolamento</b>: taglia solo lui e gli altri liberano il corridoio.`,
`<b>Tocco su chi ha il disco</b> = clear: tutti tornano in posizione e ripartono.`],
`Da tastiera: E = taglio, Q = isolamento, C = clear, verso il compagno indicato dalle frecce.`,
`Se miri su una <b>zona libera</b>, ci corre il compagno che arriva prima (non per forza il più vicino): più è alta la Visione di chi ha il disco, più lontano può essere. In Facile e Medio un breve tratto verde mostra dove parte ogni compagno; in Difficile ed Estrema non c’è nessun segnale.`],
tip:`Isola il tuo cutter più veloce contro il marcatore più lento: è il modo più facile di creare un vantaggio.`},
{id:'att-sparo',t:'Lanci lunghi, scatto e prese',b:[
[`<b>Sparo</b>: oltre 30 m il lancio è uno sparo. Quanto lontano arriva dipende dalla statistica Sparo: con 20 circa 30 m, con 60 circa 65 m, con 99 tutto il campo. I compagni lo sanno: con un lanciatore che non spara partono pochi tagli lunghi.`,
`<b>Scatto</b>: sui lanci lunghi, tieni premuto lo schermo (o il pulsante col fulmine in basso a destra) per far scattare chi corre al punto d’arrivo. Va più veloce ma consuma più energia (meno con la Resistenza alta).`,
`<b>Prese</b>: una presa facile riesce quasi sempre; diventa difficile al limite della portata, in corsa, con un difensore addosso, su un hammer o quando si è stanchi. Conta la Presa di chi riceve.`,
`<b>Duelli e tuffi</b>: nei duelli contano salto, posizione e chi arriva prima. Il <b>tuffo</b> parte da solo se il disco cade appena oltre la portata. Nei duelli in aria e nei tuffi <b>tocca quando l’indicatore è nel verde</b> per avere un bonus.`]],
tip:`Gli avversari sfiniti hanno una goccia di sudore: è lì che conviene cercare il duello. E uno scatto sprecato stanca il giocatore per il resto della meta.`},
{id:'att-stall',t:'Stall, vento e momenti decisivi',b:[
`Quando un difensore ti marca parte lo <b>stall</b>: lo vedi in alto («Stall 3») e, da 6, anche sopra chi ha il disco. A 9 c’è l’<b>ULTIMO LANCIO</b>, a 10 perdi il disco. Se il numero sale, passa subito, anche corto, oppure chiama il <b>timeout</b>.`,
[`<b>Serie positiva</b>: tanti lanci riusciti di fila accendono un alone rosso e i lanci vengono un po’ meglio. <b>Serie negativa</b>: due errori di fila accendono un alone azzurro e i lanci vengono un po’ peggio.`,
`<b>MATCH POINT</b> a una meta dalla vittoria, <b>UNIVERSE POINT</b> se lo sono entrambe.`,
`<b>Vento</b> (calma, brezza, vento, vento forte): indicato in alto a destra, sposta il disco tanto più quanto più resta in aria. Con vento alle spalle si lancia più lungo, controvento meno; a ogni meta si cambia campo e si cambia verso.`,
`<b>Pioggia e neve</b>: le prese sono più difficili e i lanci un po’ meno precisi. Si spengono, con il vento, da Impostazioni › Partita › Meteo.`]],
tip:`Con lo stall alto non cercare il lancio perfetto: uno scarico corto vale più di un huck forzato. Con vento forte, passaggi corti e tesi.`}
]});

TUT.push({id:'dif',t:'Difesa, schemi e gestione',sub:'Difendere, schemi, cambi, timeout, pausa e simulazione.',
intro:'Come difendere (da soli o a mano), come scegliere gli schemi e come gestire la partita.',
les:[
{id:'dif-modi',t:'Difendere: automatica o manuale',w:'Impostazioni › Partita o Pausa',b:[
`Hai tre modi di difendere:`,
[`<b>Automatica</b> (predefinita): i tuoi difendono da soli seguendo lo schema scelto. Con <b>Marcatura</b> scegli la marcatura e, quando vuoi, tocchi <b>Salta</b> (Invio, Y sul controller): il possesso avversario si gioca in un istante e una fascia dice com’è finito. Ogni tanto arriva un <b>momento a tempo</b>: un tuffo o un duello in salto.`,
`<b>Manuale</b>: guidi un difensore con l’<b>anello azzurro</b> (trascina il dito; tocca un altro difensore per passare a lui). Quando l’avversario lancia, il controllo passa al difensore che arriva prima al punto d’arrivo.`,
`<b>Saltata</b>: ogni possesso avversario si risolve subito.`],
`Il pulsante <b>Marcatura</b> (tasto F) sceglie tra <b>contenimento</b> (dietro all’uomo, protegge il profondo) e <b>anticipo</b> (davanti all’uomo: toglie i passaggi corti ma rischia sui lanci lunghi; l’anello diventa arancione).`],
tip:`Contro un attacco che spara tanti huck scegli il contenimento; contro uno che gioca corto e paziente, l’anticipo. Hai poco tempo? «Difesa: automatica» più «Salta» ti fa giocare solo l’attacco.`},
{id:'dif-block',t:'Handblock, tuffo e intercetti',b:[
[`<b>Handblock</b>: il marcatore può bloccare il lancio con la mano proprio mentre parte, soprattutto nel <b>cono rosso</b> (il lato che chiude) e su un lancio piatto. In difesa manuale compare sul tuo marcatore un <b>cerchio che si stringe</b>: premi il pulsante a destra quando arriva sull’anello interno. Verde = tempismo giusto, giallo = discreto, rosso = sbagliato. Se non tocchi, non blocchi.`,
`<b>Tuffo</b>: se un tuo difensore è a distanza di tuffo dal punto d’arrivo, il gioco va al <b>rallentatore</b> e compare un cerchio con il pulsante TUFFO: tocca quando arriva sull’anello interno. In difesa automatica basta toccare lo schermo in un punto qualsiasi.`,
`<b>Intercetto</b>: un difensore può prendere il disco lungo il volo se gli passa a portata (conta l’Agilità di lato e il Salto in altezza). I lanci alti scavalcano la difesa; la zona chiude molte linee basse.`,
`<b>Callahan</b>: se un tuo difensore intercetta e prende il disco nella meta che attacchi tu, segna lui (CALLAHAN!). Succede anche a te, in rosso.`],
`Dopo un turnover il giocatore più vicino corre a raccogliere il disco e si riparte da lì (se il disco è uscito, dal punto in cui ha lasciato il campo).`],
tip:`Non premere a caso: nell’handblock il verde conta moltissimo. Vicino alla tua meta, con un difensore addosso, un passaggio corto vale più di un lancio rischioso.`},
{id:'sch-menu',t:'Gli schemi',w:'In partita › Schemi (a inizio meta)',b:[
`A inizio meta tocca <b>Schemi</b> per scegliere come attaccare e come difendere; se non lo fai restano quelli di prima. Nessuno schema vince sempre: ognuno ha il suo <b>controgioco</b>. Se ripeti lo stesso schema, la difesa lo <b>impara</b> e smarcarsi diventa difficile; cambiandolo riparte da zero.`,
`<b>Attacco</b>:`,
[`<b>Verticale</b>: uno viene sotto sul lato aperto, uno va lungo. Forte contro l’uomo, soffre la zona.`,
`<b>Orizzontale</b>: cutter in linea larga, l’interno attacca la profondità. Batte la zona.`,
`<b>Esagono</b>: tutti spaziati, molti tagli corti. Buono contro gli aiuti.`,
`<b>Stack laterale</b>: cutter in fila su un lato, mezzo campo libero per gli isolamenti. Solido contro l’uomo.`,
`<b>Weave</b>: tre handler che si passano il disco in diagonale. Guadagna metri contro la zona.`,
`<b>T1</b>: schema a sequenza, il più efficace; si esegue tanto meglio quanto è alta la Visione.`],
`<b>Difesa</b>: <b>Uomo, forza fuori</b> (disco verso la linea laterale), <b>Uomo, forza dentro</b> (lanci verso il centro), <b>Zona a coppa</b> (ferma Verticale ed Esagono, subisce Orizzontale, T1 e i lanci alti), <b>Uomo con aiuti</b> (più intercetti, ma un taglio improvviso lo sorprende).`,
`Ogni squadra avversaria ha uno <b>stile suo</b> (gioco lungo o corto, difesa in anticipo o di contenimento…): lo leggi nel menu Schemi. L’avversario <b>ricorda gli schemi che usi</b> e, dal Medio in su, sceglie il controgioco di quello che ripeti.`],
tip:`Contro la zona: Orizzontale o Weave. Contro l’uomo: Verticale o Stack laterale. Contro gli aiuti: Esagono. E cambia schema ogni due o tre mete, anche se funziona.`},
{id:'sch-cambi',t:'Cambi, energia e infortuni',b:[
`Ogni scatto consuma <b>energia</b> e un giocatore stanco è più lento: sotto i tuoi giocatori compare una barretta (gialla, arancione, rossa).`,
`Nella <b>Squadra</b> scegli le due linee (vedi «Squadra e linee»). Con i «cambi intelligenti» chi è stanco esce da solo per una meta; a inizio meta puoi sempre cambiare a mano con <b>Cambi</b>.`,
`Un giocatore molto stanco rischia di <b>infortunarsi</b> a fine meta: compare un pannello per scegliere chi entra. L’infortunato salta da 1 a 3 partite e non può né giocare né allenarsi.`],
tip:`Ruota i giocatori: un titolare fresco rende più di una stella sfinita.`},
{id:'sch-tempo',t:'Timeout, intervallo, pausa e simulazione',b:[
[`<b>Timeout</b>: uno a partita, solo con il disco in mano (tasto in basso a sinistra). Azzera lo stall, fa recuperare un po’ di energia e permette di cambiare schema.`,
`<b>Intervallo</b>: quando una squadra segna la 4ª meta (la 6ª su 11, l’8ª su 15) compare «Intervallo» con Schemi, Cambi e Continua. Chi aveva iniziato in difesa riprende in attacco.`,
`<b>Pausa</b> (tasto «II» in alto a destra): riprendi, sospendi (in carriera), regoli audio, salti e tuffi, difesa e schermo intero, apri la guida o abbandoni.`,
`<b>Simula meta</b> (a inizio meta): la gioca il computer per entrambe le squadre, con le stesse statistiche e la stessa esperienza. <b>Salta</b> (in difesa automatica) gioca solo il possesso avversario.`,
`<b>Durata</b> (Opzioni della carriera, partita veloce, torneo): Arcade 7 mete, Competitiva 11, Lunga 15. <b>Difficoltà</b>: da Facile a Estrema, più sale meno aiuti vedi e più forte è l’avversario.`],
`<b>Attenzione</b>: in carriera, nel torneo e in Ultimate Team abbandonare è una <b>sconfitta a tavolino</b>. Per fermarti usa <b>Sospendi e continua più tardi</b>: la partita si salva com’è e riparte con «Riprendi la partita».`],
tip:`Usa il timeout quando stai per perdere il disco per stall o nella meta decisiva. Per le partite senza storia simula; per i derby, le finali e quando c’è qualcosa in palio gioca tu.`}
]});

TUT.push({id:'car',t:'La carriera',sub:'Partita, Squadra, Allena, Mercato, Società, Lega, Posta.',
intro:'La carriera dura più stagioni. Ogni schermata ha la stessa cornice: in alto stemma, crediti, Posta e Menu; a sinistra la colonna con le sei sezioni.',
les:[
{id:'car-cruscotto',t:'Cominciare e la schermata Partita',w:'Menu › Carriera',b:[
`«Carriera» riprende l’ultima giocata; «Salvataggi» mostra i tre slot (tre carriere separate sullo stesso dispositivo). Una nuova carriera si sceglie in tre passi:`,
[`<b>Campionato</b>: Italia, USA Men’s Club, Belgio, Francia, Germania o Regno Unito.`,
`<b>Squadra</b>: toccandola vedi la rosa prima di decidere. Oppure parti da <b>Subentrato</b>: una squadra in zona retrocessione ti chiama all’ultima giornata e hai una sola partita per salvarla.`,
`<b>Allenatore</b>: nome, cognome e volto.`],
`La <b>schermata Partita</b> è il punto di partenza di ogni giornata:`,
[`<b>Inizia partita</b> (tasto giallo): la giochi tu. <b>Simula</b>: la gioca il computer.`,
`<b>Questa settimana</b>: ciò che serve adesso (linee incomplete, infortunati, allenamento, mercato rinnovato, Posta). Ogni riga porta alla schermata giusta.`,
`<b>Colonna a sinistra</b>: Partita, Squadra, Allena, Mercato, Lega, Società. Un «!» o «NEW» dice cosa richiede attenzione.`,
`<b>Barra in alto</b>: stemma, crediti, <b>Posta</b> e <b>Menu</b> (Guida, Tutorial, Opzioni, Menu principale). Le <b>Opzioni</b> riguardano solo la carriera: difficoltà, durata, slot, esporta e importa un file.`]],
tip:`Prima di ogni partita: guarda il meteo, svuota «Questa settimana» e solo poi premi Inizia. Per cominciare con calma, parti in Facile: la difficoltà si cambia quando vuoi.`},
{id:'car-rosa',t:'Squadra e linee',w:'Colonna › Squadra',b:[
`I giocatori sono <b>carte</b>: ruolo (colore), Overall, umore, stelle, barra verde della condizione e bollini <b>A</b> e <b>D</b>. Tocca una carta per aprire la <b>scheda</b>: Attributi (con «Confronta con»), Prestazioni e Sviluppo (potenziale, crescita, rapporto degli osservatori). Da lì: <b>Riposo</b> (salta la prossima partita e recupera condizione), <b>Colloquio</b> (solleva l’umore, funziona meno se lo ripeti), Soprannome, Specializzazione e priorità di allenamento.`,
`La forza della squadra è la media dei 7 migliori. Circa un giocatore su quattro ha un <b>tratto</b> (Deep Threat, Break Specialist, Field General, Lockdown, Sky Dominator, Safe Hands, Explosive Cutter, Ironman, Poser).`,
`Le <b>linee</b>: <b>ATT</b> gioca le mete in cui ricevi il pull, <b>DIF</b> quelle in cui lo tiri. Ognuna ha bisogno di 7 giocatori.`,
[`Chi sta in entrambe non riposa mai: rende <b>${DBL_PEN} punti in meno</b> e si stanca il doppio. Con meno di 14 giocatori qualcuno deve farlo per forza.`,
`<b>Linee consigliate</b> mette in attacco 3 handler e 4 cutter e in difesa i migliori difensori.`,
`Handler e cutter che giocano insieme costruiscono <b>intesa</b>: lanci più precisi e meno prese perse.`]],
tip:`Non cambiare tutta la linea a ogni partita: l’intesa si costruisce restando insieme. Se una linea è incompleta, «Questa settimana» te lo dice.`},
{id:'car-mercato',t:'Mercato e osservazioni',w:'Colonna › Mercato',b:[
`Si rinnova ogni 5 giornate: <b>15 giocatori</b> di livello vicino al tuo (giovani promesse, svincolati, in vendita da altre squadre e, con la stella, <b>internazionali</b> veri). «Solo chi posso prendere» nasconde chi costa troppo, chiede più reputazione o non ha posto in rosa.`,
[`Ogni scheda dice di quanto migliorerebbe il titolare che sostituisce. Alcuni hanno una <b>motivazione</b> sotto il nome («Vuole giocare», «Ambizioso», «Ingaggio alto», «Cerca un progetto»).`,
`I <b>giovani</b> sono una scommessa: il potenziale è un intervallo. Gli <b>adulti</b> rendono subito ma crescono poco.`,
`Ogni acquisto ha uno <b>stipendio</b> che paghi a ogni partita. Prima di comprare compare un riepilogo: si compra solo confermando. Con i conti in rosso non si compra.`],
`<b>Osservare</b> un giocatore costa qualche credito. Ogni osservazione sblocca una parte del rapporto: punti di forza; punti deboli e tratto; schemi adatti, compatibilità con il tuo stile e posto in squadra.`],
tip:`Un giovane con potenziale alto che oggi è scarso diventa il titolare di domani: osservalo prima di decidere.`},
{id:'car-allenamenti',t:'Allenamenti e crescita',w:'Colonna › Allena',b:[
`A ogni giornata puoi fare <b>una seduta di squadra</b> e fino a <b>3 lavori individuali</b>, che rendono di più. Cinque indirizzi: <b>Tecnica</b> (lancio, buco, sparo, presa), <b>Atletismo</b> (velocità, scatto, agilità, salto, resistenza), <b>Difesa</b> (difesa, tuffo), <b>Tattica</b> (visione, affiatamento) e <b>Recupero</b> (ridà condizione, nessuna crescita).`,
[`Tocca un indirizzo per vedere l’anteprima (punti attesi, condizione che costa): la seduta parte solo con <b>Avvia</b>. L’<b>intensità</b> (Leggero, Normale, Intenso) vale per tutte le sedute.`,
`Chi è scarico rende meno e, sotto 45 di condizione, rischia di infortunarsi anche in allenamento: alterna lavoro e recupero.`,
`Il <b>Programma automatico</b> fa le sedute al posto tuo; l’esito arriva nella Posta.`],
`I giocatori migliorano anche giocando. I giovani crescono in fretta, tra 24 e 27 anni ci si stabilizza, dopo i 30 il fisico cala. Le <b>specializzazioni</b> orientano gli allenamenti verso 2-3 statistiche, d’estate chi ha raggiunto il limite può superarlo un poco (<b>maturità</b>), e a inizio stagione fino a 3 giocatori si pongono un <b>obiettivo personale</b>: chi lo raggiunge cresce di più, chi lo manca due volte di fila chiede di partire.`],
tip:`Nella settimana di una partita importante fai Recupero il giorno prima. E punta su 2-3 giovani con potenziale alto: nel lungo periodo è l’investimento che rende di più.`},
{id:'car-club',t:'Società: strutture e staff',w:'Colonna › Società',b:[
`La Società ha quattro parti: <b>Conti</b>, <b>Strutture</b>, <b>Staff</b> e <b>Bacheca</b> (albo d’oro, traguardi, record).`,
`Le <b>strutture</b> arrivano al livello 5; ogni livello costa più del precedente e ha una manutenzione a ogni partita:`,
[`<b>Campo di allenamento</b>: allenamenti più efficaci e meno faticosi.`,`<b>Fisioterapia</b>: più recupero e meno infortuni.`,`<b>Vivaio</b>: più giovani promesse sul mercato, e più forti.`,`<b>Tribune</b>: più posti; i tifosi salgono di più dopo una vittoria e calano di meno dopo una sconfitta. Rendono solo se lo stadio si riempie.`,`<b>Rete di osservatori</b>: osservare costa meno.`,`<b>Sede del club</b>: affiatamento più rapido e morale più alto.`],
`Le strutture si consumano (d’estate possono perdere un livello, in stagione può capitare un guasto); se ne tieni una almeno al livello 3 per metà stagione ricevi in estate un premio.`,
`Lo <b>Staff</b> ha quattro ruoli, ognuno con un livello da 1 a 3 e spesso un’abilità speciale: <b>Allenatore</b> (allenamenti), <b>Preparatore atletico</b> (recupero, infortuni), <b>Analista tattico</b> (forma di squadra), <b>Mentore dei giovani</b> (crescita fino a 23 anni). «Scegli chi assumere» mostra tre candidati; «Migliora» paga una formazione; lo stipendio è a ogni partita. Ogni tanto un altro club prova a portartene via uno.`],
tip:`Con pochi crediti parti dal Campo di allenamento. Le Tribune servono quando lo stadio è pieno: in Conti vedi in quante partite si ripaga il livello successivo.`},
{id:'car-soldi',t:'Soldi, tifosi e morale',b:[
`Ogni partita ha il suo <b>conto</b>, che vedi a fine partita e in Società › Conti:`,
[`<b>Entrate</b>: biglietti (solo in casa: più tifosi e partite importanti portano più spettatori, fino ai posti dello stadio), sponsor e premio vittoria.`,
`<b>Uscite</b>: gli <b>stipendi</b> sono la spesa più grande (salgono con l’Overall, quindi ogni acquisto pesa su tutte le partite), poi strutture, staff e, in trasferta, il viaggio. Anche una vittoria può chiudersi in rosso.`],
`A inizio stagione scegli lo <b>sponsor</b>: Sicuro (più soldi a partita, bonus piccolo), Equilibrato o Ambizioso (meno a partita, bonus grande se raggiungi l’obiettivo scritto sul contratto). Chi sale di categoria riceve un premio della lega.`,
`<b>Conti in rosso</b>: mercato, strutture e staff si fermano, la dirigenza avvisa e il morale cala. Se dura troppo vieni <b>esonerato</b> e riparti da una squadra più debole.`,
[`<b>Bilancio previsionale</b> (Società › Conti): come chiuderai la stagione se continui così.`,
`<b>Tifosi</b>: riempiono lo stadio, salgono con le vittorie e calano con le sconfitte. <b>Morale</b>: sale con vittorie, premi e Recupero. <b>Reputazione</b>: apre porte (mercato, internazionali, offerte).`]],
tip:`Non spendere tutto subito: tieni una riserva per le emergenze e guarda il bilancio prima di ogni acquisto grosso.`},
{id:'car-classifica',t:'Lega, premi e traguardi',w:'Colonna › Lega',b:[
`In <b>Lega</b> scegli la serie da guardare, leggi i risultati delle altre e, in «Dal campionato», le storie della stagione. Sotto la tua serie ci sono i <b>migliori per mete, assist e difese</b>. Il formato di playoff e fasi finali di ogni campionato è nel capitolo «I campionati».`,
[`A fine stagione: <b>premi</b> (MVP, attaccante e difensore dell’anno, capocannoniere, re degli assist, rivelazione, allenatore dell’anno, squadra ideale) che restano nella scheda del giocatore e portano reputazione; in cima alla pagina Lega il riepilogo e il tasto <b>Inizia la nuova stagione</b>.`,
`Ogni stagione nasce una <b>rivalità</b> con una squadra del tuo livello: vincere il derby dà crediti, morale e reputazione; perderlo fa male all’umore.`,
`<b>Traguardi</b> (Società › Bacheca): venti obiettivi di lungo periodo con barra di avanzamento, ognuno con un piccolo premio. Nella Bacheca anche albo d’oro, record e Hall of Fame.`]],
tip:`Nei playoff ogni partita conta: giocale tu e usa bene i cambi. I traguardi sono una guida gratuita su cosa fare dopo.`},
{id:'car-avvisi',t:'Posta, ritiri e imprevisti',b:[
`La <b>Posta</b> (in alto) divide i messaggi in <b>Da decidere</b>, <b>Novità</b> e <b>Cronologia</b>. Emergenze e decisioni si aprono da sole; le notizie accendono solo il numero. «Chiudi» non segna niente come letto, «Segna tutto come letto» sì.`,
[`<b>Ritiri</b>: un giocatore prima fa capire che ci pensa, poi annuncia l’ultima stagione; puoi chiedergli un altro anno con un premio di permanenza (un solo tentativo).`,
`<b>Spogliatoio</b>: un buon giocatore che resta fuori a lungo diventa scontento e poi chiede la cessione. Vendilo o promettigli spazio: se non mantieni la promessa se ne va gratis.`,
`<b>Offerte</b>: una squadra più importante può chiedere uno dei tuoi migliori (accetti o rifiuti entro la partita dopo). Se la carriera va bene, un club di <b>un’altra lega</b> può offrirti la panchina: accettando cambi club e lega, ma allenatore, storico, trofei e traguardi restano tuoi.`,
`<b>Mercato delle altre squadre</b>: a inizio stagione una notizia riassume i colpi più grandi dell’estate tra i club del computer.`,
`<b>Conferenza stampa</b> dopo le partite con un po’ di storia (tre risposte: squadra, tifosi o un giocatore) e <b>imprevisti</b> una o due volte a stagione (sponsor, influenza, provino…), spesso con una scelta tra due strade.`]],
tip:`Un buon giocatore in panchina troppo a lungo ti lascia: ruotalo oppure promettigli spazio.`}
]});

TUT.push({id:'lega',t:'I campionati',sub:'Italia, USA Men’s Club, Belgio, Francia, Germania, Regno Unito, Campionato europeo.',
intro:'Ogni campionato ha il suo formato, ricostruito su quello vero. Leggi solo quello che giochi.',
les:[
{id:'lega-it',t:'Italia: Serie A, B e C',b:[
`Tre serie con le squadre e le rose dei <b>Campionati Italiani Ultimate Open 2026</b>.`,
[`Si giocano <b>15 giornate</b>. Salgono due squadre e ne scendono due.`,
`<b>Serie A</b>: le prime 4 giocano le semifinali (1ª contro 4ª, 2ª contro 3ª) e la finale per lo scudetto.`,
`<b>Serie B e C</b>: la prima sale direttamente; dal 2° al 5° posto c’è lo spareggio per la seconda promozione.`,
`Le prime 3 della Serie A giocano il <b>Campionato europeo (EUCF)</b> la stagione dopo.`]],
tip:`Dopo uno scudetto le rivali di Serie A si rinforzano per un po’: investi in rosa e strutture per difendere il titolo.`},
{id:'lega-usa',t:'USA Men’s Club',b:[
`<b>48 club</b> veri della divisione Men’s di USA Ultimate, in <b>8 Conference</b> da 6. Niente promozioni né retrocessioni.`,
[`<b>Stagione regolare</b>: 5 giornate nella tua Conference (vittorie, scontri diretti, differenza mete) e 7 <b>partite interregionali</b>, una contro ciascuna delle altre Conference: non contano per la classifica della Conference ma per il ranking.`,
`<b>Ranking nazionale</b>: sale con le vittorie (di più contro avversarie forti e con margini larghi), scende con le sconfitte. Decide quanti posti ai Nationals ha ogni regione.`,
`<b>Posti ai Nationals</b>: ogni Conference ha 1 posto diretto; altri 8 vanno alle regioni secondo il ranking (da 1 a 4 per regione, 16 in tutto). I posti cambiano durante la stagione e sono definitivi alla fine della stagione regolare.`,
`<b>Play-in</b>: con 2 posti, la 1ª passa e 2ª contro 3ª è una gara secca; con 3 o 4 posti le prime vanno dirette e le altre si sfidano (3: 2ª-5ª e 3ª-4ª; 4: 3ª-6ª e 4ª-5ª).`,
`<b>Nationals</b> a 16 squadre in 4 gironi da 4: le prime vanno ai quarti, seconde e terze ai prequarti, le quarte sono fuori. Poi quarti, semifinali e finale.`],
`In Classifica ci sono tre viste: <b>Conference</b> (verde = Nationals diretti, giallo = Play-in, rosso = fuori), <b>Nationals</b> e <b>Ranking</b>.`],
tip:`Con soli 5 turni di Conference ogni partita pesa tantissimo: gioca tu quelle contro le rivali dirette. Ogni vittoria larga alza il ranking e può far guadagnare un posto a tutta la regione.`},
{id:'lega-eu',t:'Europa: campionati nazionali ed EUCF',b:[
`<b>Belgio, Francia, Germania e Regno Unito</b>: campionati Open veri, con i formati del 2026. Nessuno è eliminato: ogni turno delle fasi finali vale per il piazzamento, e a fine stagione si sale e si scende tra i livelli.`,
[`<b>Belgio</b>: 6 livelli (N1-N6) da 8 squadre in due gironi da 4, poi le finali di piazzamento.`,
`<b>Francia</b>: la N1 ha 12 squadre in due poule da 6 e un Top 8 a tabellone; sotto ci sono la N2 e la N3.`,
`<b>Germania</b>: la 1. Liga ha 16 squadre in due gironi da 8 con fasi finali; poi 2. e 3. Liga.`,
`<b>Regno Unito</b>: i Nationals (due gironi da 4 e turno incrociato) e, sotto, i club dell’Open Tour.`,
`I gironi si giocano con più giri contro le stesse squadre: chi arriva fino in fondo gioca almeno <b>11 partite</b>.`],
`Il <b>Campionato europeo (EUCF)</b> si sblocca <b>chiudendo il campionato tra i posti qualificanti</b>: in Serie A e nel livello più alto del Belgio le prime 3, in Francia e Regno Unito le prime 2, in Germania la prima. Si gioca la stagione dopo: 16 club in 4 gironi da 4, poi quarti, semifinali e finale. Ogni turno superato porta <b>crediti</b>; la vittoria anche reputazione e un trofeo.`],
tip:`In Europa le avversarie sono forti: arriva con la rosa fresca. Nei livelli bassi delle leghe nazionali, invece, trovi giovani e svincolati di talento.`}
]});

TUT.push({id:'mod',t:'Le altre modalità',sub:'Partita veloce, Torneo, Allenamento, Ultimate Team, Real player.',
intro:'Modalità da giocare senza impegno o con una collezione da costruire.',
les:[
{id:'mod-veloce',t:'Partita veloce, Torneo e Allenamento',b:[
[`<b>Partita veloce</b>: scegli due squadre, la durata, la difficoltà e chi inizia in attacco. Non viene registrato nulla.`,
`<b>Torneo</b>: eliminazione diretta a 4, 8 o 16 squadre vere. Le partite le giochi o le simuli e il tabellone resta salvato. Abbandonare una partita è una sconfitta a tavolino.`,
`<b>Allenamento</b>: tutorial pratico, allenamento libero e sfide con medaglie (vedi «Imparare giocando»). Nessuna sfida ha conseguenze sulla carriera.`]],
tip:`La Partita veloce in Estrema è il banco di prova migliore quando ti sembra tutto troppo facile.`},
{id:'mod-ut',t:'Ultimate Team e Real player',b:[
`Apri <b>pacchetti</b> di carte Handler, Cutter e Defender: sono <b>giocatori veri</b> dei campionati (con il club sulla carta, mai lo stesso due volte). Scegli i 7 titolari e gioca il torneo a eliminazione, sempre a 7 mete. Ogni partita dà <b>gettoni</b> (di più se vinci e vai avanti) per comprare pacchetti nel <b>Negozio</b> (normale, solo Handler, solo Cutter) e potenziare le carte.`,
[`<b>Pacchetti premio</b>: superando i turni ricevi pacchetti sempre più rari (bronzo, argento, oro, platino); chi vince il torneo ottiene il Super pacchetto arcobaleno.`,
`<b>Potenziamenti</b>: al massimo 4 per carta (2 per linea). Chi gioca da titolare cresce anche da solo. I doppioni si scartano per recuperare gettoni.`],
`In <b>Real player</b> (scelto al posto di «Computer») sfidi le squadre di altri giocatori, anche se non sono online in quel momento (le guida il computer, a livello Difficile). La squadra è separata da quella del torneo.`,
[`Scegli un <b>nome</b> (poi non si cambia). «Inizia partita» ti abbina a un avversario con punti vicini ai tuoi; si parte da <b>1000 punti</b> e la classifica online mostra i primi 50.`,
`Il riquadro <b>Traguardi</b> mostra i pacchetti premio: 1100 bronzo, 1200 argento, 1300 oro, 1400 platino, 1500 Super pacchetto. I potenziamenti si sbloccano a 1100 punti.`,
`Servono internet e la partita va finita: abbandonare o chiudere il gioco conta come sconfitta.`]],
tip:`Costruisci prima una squadra equilibrata nel torneo contro il computer per capire quali ruoli ti servono, poi spendi i gettoni di Real player. Potenzia linee diverse: la squadra è più completa.`}
]});
