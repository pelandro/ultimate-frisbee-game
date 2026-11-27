/* ---- TUTORIAL COMPLETO: i contenuti ----
   TUT = capitoli {id, t: titolo, sub: riga d'elenco, intro, les: lezioni}; lezione = {id, t, w: dove si trova (facoltativo), b: blocchi, tip: trucco}.
   Un blocco e' un paragrafo (stringa) oppure un elenco (array di stringhe); si puo' usare <b>. I fatti vengono dalla Guida a schede (07-guida.html) e dal codice:
   quando una regola cambia, aggiorna qui la lezione che la riguarda. Sei capitoli e 26 lezioni brevi (circa 800 caratteri l'una, mai un punto elenco oltre i 220): il resto sta nella Guida.
   Gli id delle lezioni non si cambiano: li usano i fumetti (TIP_LES in 21-tutorial.js) e il progresso salvato; se due lezioni si uniscono, resta l'id della prima.
   Il tutorial dice cio' che serve per giocare bene: niente formule, tarature o conti interni dell'economia (quelli stanno nella Guida). Tono e parole fisse: docs/STILE-TESTI.md. */
const TUT=[];

TUT.push({id:'ini',t:'Per iniziare',sub:'Le regole in breve, i comandi e le prove guidate.',
intro:'Tre lezioni per partire: come si gioca, come si comanda il gioco e come imparare giocando.',
les:[
{id:'ini-gioco',t:'Come si gioca',b:[
`Due squadre da 7 giocatori e un disco. Per fare una <b>meta</b> (un punto) devi prendere il disco nella zona di meta avversaria. <b>Chi ha il disco non può correre</b>: si avanza solo passandolo.`,
[`Se il disco cade, esce o viene intercettato passa agli avversari: è un <b>turnover</b>.`,
`Se un avversario ti marca da vicino hai <b>10 secondi</b> per lanciare (lo <b>stall</b>). A 10 perdi il disco.`,
`Dopo ogni meta si cambia campo e chi ha segnato tira il <b>pull</b>, il lancio lungo che fa ripartire il gioco.`,
`Vince chi arriva per primo a 7 mete (11 o 15 nelle partite più lunghe).`],
`Parole utili:`,
[`<b>Handler</b> lancia, <b>Cutter</b> taglia e riceve, <b>Defender</b> difende.`,
`<b>Taglio</b>: corsa per smarcarsi. <b>Marcatore</b>: chi marca il portatore. <b>Handblock</b>: blocco del lancio con la mano. <b>Tuffo</b>: slancio per un disco lontano. <b>Huck</b>: lancio lungo e alto.`,
`<b>Overall</b> (OVR): il valore di un giocatore, da 1 a 99.`]],
tip:`Non serve imparare tutto subito: nelle prime tre partite compaiono schede che spiegano ogni cosa quando serve.`},
{id:'ini-comandi',t:'Menu e comandi',b:[
`Dal menu iniziale scegli: <b>Carriera</b> (più stagioni: si apre con i tre slot), <b>Partita veloce</b>, <b>Torneo</b> e <b>Ultimate Team</b> (carte). Guida, Guida passo passo, Audio e Impostazioni stanno in «Altro», in alto a destra.`,
[`<b>Touch e mouse</b>: per lanciare trascina il dito all’indietro e rilascia; per chiamare un compagno toccalo; in difesa usa i pulsanti rossi in basso.`,
`<b>Tastiera</b>: frecce o WASD = direzione; Spazio o J = lancio (tieni premuto per caricare); Maiusc o K = lancio alto (in difesa, tuffo); E = taglio; Q = isolamento; C = clear; Esc = annulla; Invio = salta il possesso avversario.`,
`<b>Controller</b>: stick o croce = direzione; A o RT = lancio; X o B = lancio alto; Y = «Salta».`],
`Le <b>Impostazioni</b> (menu iniziale, in «Altro», e pausa) hanno quattro schede: Partita, Comandi, Schermo e audio, Avanzate.`],
tip:`Sul telefono si gioca in orizzontale: se lo tieni in verticale il gioco si gira da solo.`},
{id:'ini-primi',t:'Imparare giocando',w:'Prime partite',b:[
`La prima partita è anche un tutorial: in alto un riquadro ti chiede una cosa alla volta (tirare il pull, passare, chiamare un taglio, difendere, segnare) mentre la partita continua.`,
[`Quando ci riesci il riquadro diventa verde; se sbagli ti dice di riprovare e, se tardi, ti dà un suggerimento.`,
`«Salta questo passo» va avanti, «Esci dal tutorial» lo spegne. Dura le prime tre partite; per rifarlo: Impostazioni › Partita › Suggerimenti.`]],
tip:`Una Partita veloce in Facile è il posto migliore per imparare a mirare un huck o un lancio alto.`}
]});

TUT.push({id:'att',t:'Attacco',sub:'Pull, lancio, chiamate ai compagni, lanci lunghi, stall.',
intro:'Tutto quello che puoi fare quando hai il disco o lo stai per avere.',
les:[
{id:'att-pull',t:'Il pull',b:[
`Ogni meta comincia con il pull. Lo tiri con due tocchi (o Spazio):`,
[`<b>Potenza</b>: ferma il cursore nel <b>verde</b> per arrivare nella meta avversaria. Prima è corto, nel rosso esce dal fondo.`,
`<b>Direzione</b>: ferma il cursore al centro. Nel rosso il disco esce di lato.`],
`Sul campo vedi dove cadrà: <b>FUORI</b>, <b>CORTO</b>, <b>DI LATO</b>, <b>BUON PULL</b> o <b>GRAN PULL</b> (in oro, molto in fondo alla meta e lontano dalle linee: il più difficile da centrare). Un gran pull mette in difficoltà chi riceve; un pull corto o fuori lo aiuta. Se esce si riparte dal <b>brick</b> (la × al centro) o dal punto d’uscita, se è più avanti.`],
tip:`Per il pull scegli chi ha Lancio e Sparo più alti: le barre vanno più piano.`},
{id:'att-lancio',t:'Lanciare e mirare',b:[
`Non ci sono pulsanti: <b>tocca, trascina il dito all’indietro e rilascia</b>, come una fionda. Il disco parte nel verso opposto, tanto più lontano quanto più trascini. Per annullare riporta il dito dove avevi toccato.`,
[`<b>Mira assistita</b>: se punti verso un compagno il lancio si aggancia a lui.`,
`<b>Cerchio tratteggiato</b>: l’errore possibile. Cresce con la distanza, lo stall alto, il marcatore addosso e se rilasci in fretta.`,
`<b>Croce rossa</b>: un difensore può intercettare lì. Cambia bersaglio o lancia alto.`],
`<b>Tipo di lancio</b>: un tocco = <b>piatto</b>; doppio tocco (o due dita) = <b>alto</b>. Per il doppio tocco tocca in un punto libero, poi di nuovo e tieni premuto.`,
[`<b>Piatto</b>: Rovescio (il più preciso) o Dritto (più veloce). Da 30 m è un <b>huck</b>.`,
`<b>Alto</b>: Scoober (fino a 14 m, scavalca il marcatore) o Hammer (oltre: non si intercetta, ma è lento e meno preciso).`]],
tip:`Lancia dove il compagno sta correndo, non dove si trova. Prima di rilasciare guarda sempre la croce rossa.`},
{id:'att-chiama',t:'Chiamare i compagni',b:[
`Tocca i compagni, senza trascinare:`,
[`<b>Tocco su un compagno</b> = taglio. Un cutter va lungo o torna incontro; un handler ti offre lo scarico (<b>reset</b>).`,
`<b>Tieni premuto</b> su un compagno = <b>isolamento</b>: taglia solo lui e gli altri liberano il corridoio.`,
`<b>Tocco su chi ha il disco</b> = clear: tutti tornano in posizione e ripartono.`],
`Se miri su una <b>zona libera</b>, ci corre il compagno che arriva prima. Più alta è la Visione di chi lancia, più lontano può essere.`],
tip:`Isola il tuo cutter più veloce contro il marcatore più lento: è il modo più facile di creare un vantaggio.`},
{id:'att-sparo',t:'Lanci lunghi, scatto e prese',b:[
[`<b>Sparo</b>: oltre 30 m. Fin dove è preciso e quanto lontano arriva dipende dalla statistica Sparo: con 60 circa 40 m precisi, con 75 circa 55, con 99 tutto il campo.`,
`<b>Scatto</b>: sui lanci lunghi tieni premuto lo schermo (o il fulmine in basso a destra) per far scattare chi corre al disco. Va più veloce ma consuma energia.`,
`<b>Prese</b>: riescono quasi sempre, ma sono difficili al limite della portata, in corsa, con un difensore addosso o da stanchi. Conta la Presa di chi riceve.`,
`<b>Duelli e tuffi</b>: contano salto e posizione. Nei duelli in aria e nei tuffi incerti <b>tocca quando l’indicatore è nel verde</b> (o almeno nel giallo): nel nero il disco non si prende.`]],
tip:`Gli avversari sfiniti hanno una goccia di sudore: cerca il duello con loro. Uno scatto sprecato stanca per il resto della meta.`},
{id:'att-stall',t:'Stall, vento e momenti decisivi',b:[
`Quando un difensore ti marca parte lo <b>stall</b>: lo vedi in alto («Stall 3») e, da 6, sopra chi ha il disco. A 9 c’è l’<b>ULTIMO LANCIO</b>, a 10 perdi il disco. Passa subito, anche corto, o chiama il <b>timeout</b>.`,
[`<b>Serie</b>: tanti lanci riusciti di fila (alone rosso) migliorano i lanci; due errori di fila (alone azzurro) li peggiorano.`,
`<b>MATCH POINT</b> a una meta dalla vittoria, <b>UNIVERSE POINT</b> se lo sono entrambe.`,
`<b>Vento</b> (in alto a destra): con il vento alle spalle si lancia più lungo, controvento meno; a ogni meta si cambia campo. <b>Pioggia e neve</b> rendono prese e lanci più difficili. Si spengono da Impostazioni › Partita › Meteo.`]],
tip:`Con lo stall alto non cercare il lancio perfetto: uno scarico corto vale più di un huck forzato.`}
]});

TUT.push({id:'dif',t:'Difesa, schemi e gestione',sub:'Difendere, schemi, cambi, timeout, pausa e simulazione.',
intro:'Come difendere, come scegliere gli schemi e come gestire la partita.',
les:[
{id:'dif-modi',t:'Difendere: automatica o manuale',w:'Impostazioni › Partita o Pausa',b:[
`Hai tre modi di difendere:`,
[`<b>Automatica</b> (predefinita): i tuoi difendono da soli. Quando vuoi tocchi <b>Salta</b> (Invio, Y sul controller): il possesso avversario si gioca in un istante. Ogni tanto arriva un momento a tempo (un tuffo o un duello in salto).`,
`<b>Manuale</b>: guidi un difensore con l’<b>anello azzurro</b> (trascina il dito; tocca un altro difensore per passare a lui).`,
`<b>Saltata</b>: ogni possesso avversario si risolve subito.`],
`Il pulsante <b>Marcatura</b> (tasto F) sceglie tra <b>contenimento</b> (dietro all’uomo, protegge il profondo) e <b>anticipo</b> (davanti all’uomo: toglie i passaggi corti ma rischia sui lanci lunghi).`],
tip:`Contro chi spara tanti huck scegli il contenimento; contro chi gioca corto, l’anticipo.`},
{id:'dif-block',t:'Handblock, tuffo e intercetti',b:[
[`<b>Handblock</b>: in difesa manuale compare sul marcatore un <b>cerchio che si stringe</b>: premi il pulsante a destra quando arriva sull’anello interno. Verde = giusto, giallo = discreto, rosso = sbagliato. Si blocca più facilmente nel <b>cono rosso</b>, il lato che chiude.`,
`<b>Tuffo</b>: se un difensore è a distanza di tuffo, il gioco va al <b>rallentatore</b>: tocca quando il cerchio arriva sull’anello interno.`,
`<b>Intercetto</b>: un difensore può prendere il disco in volo se gli passa a portata. I lanci alti lo scavalcano.`,
`<b>Callahan</b>: se un tuo difensore intercetta nella meta che attacchi tu, segna lui.`]],
tip:`Non premere a caso: nell’handblock conta il tempismo, il verde vale moltissimo.`},
{id:'sch-menu',t:'Gli schemi',w:'In partita › Schemi (a inizio meta)',b:[
`A inizio meta tocca <b>Schemi</b> per scegliere attacco e difesa. Nessuno schema vince sempre, e se ripeti lo stesso la difesa lo <b>impara</b>: cambiarlo la riporta a zero.`,
[`<b>Verticale</b>: forte contro l’uomo, soffre la zona.`,
`<b>Orizzontale</b>: batte la zona.`,
`<b>Esagono</b>: tagli corti, buono contro gli aiuti.`,
`<b>Stack laterale</b>: libera mezzo campo per gli isolamenti, solido contro l’uomo.`,
`<b>Weave</b>: tre handler che si passano il disco, guadagna metri contro la zona.`,
`<b>T1</b>: il più efficace, ma va eseguito bene (serve Visione alta).`,
`<b>1 in 3-4</b>: quattro cutter in fila larga; chi va lungo spesso torna incontro e poi si lancia lungo verso la meta. Forte contro l’uomo che forza dentro, soffre zona e aiuti.`],
`In difesa: <b>Uomo, forza fuori</b>, <b>Uomo, forza dentro</b>, <b>Uomo con aiuti</b> e <b>Zona a coppa</b> (ferma Verticale ed Esagono, subisce Orizzontale e T1). Ogni schema ha una descrizione nel menu.`],
tip:`Contro la zona: Orizzontale o Weave. Contro l’uomo: Verticale o Stack laterale. Cambia schema ogni due o tre mete.`},
{id:'sch-cambi',t:'Cambi, energia e infortuni',b:[
`Ogni scatto consuma <b>energia</b>: un giocatore stanco è più lento (sotto di lui compare una barretta).`,
`Con i «cambi intelligenti» chi è stanco esce da solo; a inizio meta puoi cambiare a mano con <b>Cambi</b>: tocca due giocatori per scambiarli, oppure <b>Cambia tutti e 7</b> per far entrare i 7 migliori della panchina in un colpo (di nuovo e tornano i primi). Le linee si scelgono in Squadra.`,
`Una piccola D accanto al ruolo segna i 7 più forti in difesa.`,
`Un giocatore molto stanco rischia di <b>infortunarsi</b> a fine meta: l’infortunato salta da 1 a 3 partite.`],
tip:`Ruota i giocatori: un titolare fresco rende più di una stella sfinita.`},
{id:'sch-tempo',t:'Timeout, intervallo, pausa e simulazione',b:[
[`<b>Timeout</b>: uno a partita, con il disco in mano. Azzera lo stall e permette di cambiare schema.`,
`<b>Intervallo</b>: alla 4ª meta (6ª su 11, 8ª su 15). Chi aveva iniziato in difesa riprende in attacco.`,
`<b>Pausa</b> (tasto «II»): regoli audio e difesa, apri la guida, sospendi o abbandoni.`,
`<b>Simula meta</b> (a inizio meta): la gioca il computer per entrambe le squadre.`,
`<b>Durata</b>: Arcade 7 mete, Competitiva 11, Lunga 15. <b>Difficoltà</b>: da Facile a Estrema.`],
`In carriera, nel torneo e in Ultimate Team abbandonare è una <b>sconfitta a tavolino</b>: per fermarti usa <b>Sospendi e continua più tardi</b>.`],
tip:`Simula le partite senza storia; gioca tu derby, finali e partite in palio.`}
]});

TUT.push({id:'car',t:'La carriera',sub:'Partita, Squadra, Allena, Mercato, Società, Lega, Posta.',
intro:'Ogni schermata ha la stessa cornice: in alto stemma, crediti, Posta e Menu; a sinistra la colonna con le sei sezioni.',
les:[
{id:'car-cruscotto',t:'Cominciare e la schermata Partita',w:'Menu › Carriera',b:[
`Una nuova carriera si sceglie in tre passi:`,
[`<b>Campionato</b>: Italia, USA, Belgio, Francia, Germania o Regno Unito.`,`<b>Squadra</b>: toccandola vedi la rosa. Con «Subentrato» salvi una squadra in crisi in una sola partita.`,`<b>Allenatore</b>: nome, cognome e volto.`],
`«Carriera» (menu iniziale) apre i tre slot. La <b>schermata Partita</b> è il punto di partenza di ogni giornata:`,
[`<b>Inizia partita</b> (tasto giallo): la giochi tu. <b>Simula</b>: la gioca il computer.`,
`<b>Questa settimana</b>: ciò che serve adesso (linee incomplete, infortunati, mercato, Posta) e un riassunto delle notizie. Ogni riga porta alla schermata giusta.`,
`<b>Colonna a sinistra</b>: Partita, Squadra, Allena, Mercato, Lega, Società. <b>Menu</b>: Guida, Tutorial, Opzioni (difficoltà, durata, salvataggi) e Menu principale.`]],
tip:`Prima di ogni partita: guarda il meteo e svuota «Questa settimana». Per cominciare con calma, parti in Facile.`},
{id:'car-rosa',t:'Squadra e linee',w:'Colonna › Squadra',b:[
`I giocatori sono <b>carte</b> con ruolo, Overall, umore, condizione e i bollini <b>A</b> e <b>D</b>. Tocca una carta per aprire la scheda (Attributi, Prestazioni, Sviluppo):`,
[`<b>Riposo</b>: salta la prossima partita e recupera condizione.`,`<b>Colloquio</b>: solleva l’umore.`,`Circa un giocatore su quattro ha un <b>tratto</b>, un talento speciale.`],
`Le <b>linee</b>: <b>ATT</b> gioca le mete in cui ricevi il pull, <b>DIF</b> quelle in cui lo tiri. Ognuna vuole 7 giocatori.`,
[`Chi sta in entrambe non riposa mai: rende <b>${DBL_PEN} punti in meno</b> e si stanca il doppio.`,
`<b>Linee consigliate</b> mette 3 handler e 4 cutter in attacco e i migliori difensori in difesa.`,
`Handler e cutter che giocano insieme costruiscono <b>intesa</b>: lanci più precisi.`]],
tip:`Non cambiare tutta la linea a ogni partita: l’intesa si costruisce restando insieme.`},
{id:'car-mercato',t:'Mercato e osservazioni',w:'Colonna › Mercato',b:[
`Si rinnova ogni 5 giornate: <b>15 giocatori</b> di livello vicino al tuo (giovani, svincolati, in vendita da altre squadre e, con la stella, internazionali veri). «Solo chi posso prendere» nasconde chi costa troppo o non ha posto in rosa.`,
[`I <b>giovani</b> sono una scommessa: il potenziale è un intervallo. Gli <b>adulti</b> rendono subito ma crescono poco.`,
`Ogni acquisto ha uno <b>stipendio</b> a ogni partita. Prima di comprare compare un riepilogo: si compra solo confermando.`,
`<b>Osservare</b> costa qualche credito: ogni osservazione mostra una parte del rapporto (punti di forza, punti deboli e tratto, schemi adatti e posto in squadra).`]],
tip:`Un giovane con potenziale alto che oggi è scarso diventa il titolare di domani: osservalo prima di decidere.`},
{id:'car-allenamenti',t:'Allenamenti e crescita',w:'Colonna › Allena',b:[
`A ogni giornata: <b>una seduta di squadra</b> e fino a <b>3 lavori individuali</b>, che rendono di più. Cinque indirizzi: <b>Tecnica</b>, <b>Atletismo</b>, <b>Difesa</b>, <b>Tattica</b> e <b>Recupero</b> (ridà condizione, nessuna crescita).`,
`In alto due schede: «Squadra» per la seduta di tutti, «Individuali» per i giocatori scelti. Toccando un giocatore si apre da sola la seconda.`,
[`Tocca un indirizzo per vedere l’anteprima: la seduta parte solo con <b>Avvia</b>.`,
`Chi è scarico rende meno e, sotto 45 di condizione, rischia l’infortunio: alterna lavoro e recupero.`,
`Il <b>Programma automatico</b> fa le sedute al posto tuo.`],
`I giovani crescono in fretta, dopo i 30 il fisico cala. Le <b>specializzazioni</b> orientano la crescita; a inizio stagione fino a 3 giocatori si pongono un <b>obiettivo</b>: chi lo manca due volte di fila chiede di partire.`],
tip:`Fai Recupero il giorno prima di una partita importante. Punta su 2-3 giovani con potenziale alto.`},
{id:'car-club',t:'Società: strutture e staff',w:'Colonna › Società',b:[
`Stemmi e sigle identificano la squadra nei menu e sul campo. La Società ha quattro parti: <b>Conti</b>, <b>Strutture</b>, <b>Staff</b> e <b>Bacheca</b> (albo d’oro, traguardi, record).`,
[`<b>Centro sportivo</b>: allena la squadra e falla recuperare.`,
`<b>Vivaio e osservatori</b>: scopri giovani e osservali spendendo meno.`,
`<b>Tribune</b>: migliora il campo, fai spazio ai tifosi e incassa dagli affitti.`,
`<b>Staff</b>: il preparatore migliora le sedute, il fisioterapista riduce gli infortuni e l’analista sblocca schemi. La firma costa più di una stagione di stipendio, soprattutto per i profili più esperti. Il contratto resta attivo finché lo rescindi o cambi persona.`]],
tip:`Se fai spesso il tutto esaurito, valuta di ampliare le Tribune.`},
{id:'car-soldi',t:'Soldi, tifosi e morale',b:[
`Ogni partita ha il suo <b>conto</b>, in Società › Conti:`,
[`<b>Entrate</b>: biglietti (in casa), affitti dell’impianto, sponsor e premio vittoria.`,
`<b>Uscite</b>: gli <b>stipendi</b> sono la spesa più grande, poi strutture, staff e viaggi. Anche una vittoria può chiudersi in rosso.`],
`A inizio stagione scegli lo <b>sponsor</b>: Sicuro paga di più a partita di campionato, Ambizioso dà un premio maggiore se raggiungi l’obiettivo. Gli obiettivi seguono la forza della rosa e il piazzamento dell’ultimo campionato.`,
`<b>Conti in rosso</b>: mercato, strutture e staff si fermano e il morale cala. Se dura troppo vieni <b>esonerato</b> e riparti da una squadra più debole.`,
`I <b>tifosi</b> riempiono lo stadio, il <b>morale</b> sale con vittorie e Recupero, la <b>reputazione</b> apre porte (mercato, offerte).`],
tip:`Tieni una riserva di crediti per le emergenze e guarda il bilancio prima di ogni acquisto grosso.`},
{id:'car-classifica',t:'Lega, premi e traguardi',w:'Colonna › Lega',b:[
`In <b>Lega</b> vedi classifica e risultati, le storie della stagione e i <b>migliori per mete, assist e difese</b>. Il formato di ogni campionato è nel capitolo «I campionati».`,
[`<b>Fine stagione</b>: premi, squadra ideale e il tasto <b>Inizia la nuova stagione</b>. In estate la rosa recupera e si allena nelle giornate senza partita. I progressi arrivano nelle Notizie.`,
`<b>Rivalità</b>: ogni stagione una squadra del tuo livello diventa rivale; vincere il derby dà crediti e morale.`,
`<b>Traguardi</b> (Società › Bacheca): obiettivi di lungo periodo adatti al tuo campionato, ognuno con un premio.`]],
tip:`Nei playoff ogni partita conta: giocale tu.`},
{id:'car-avvisi',t:'Posta, ritiri e imprevisti',b:[
`La <b>Posta</b> tiene solo ciò che chiede un’azione: <b>Da decidere</b> e <b>Avvisi</b>, una riga ciascuno con il suo pulsante. Le decisioni si aprono da sole. Crescite, rientri e mercato stanno nella scheda <b>Notizie</b>.`,
[`<b>Ritiri</b>: un giocatore prima fa capire che ci pensa, poi annuncia l’ultima stagione; puoi chiedergli un altro anno con un premio.`,
`<b>Spogliatoio</b>: un buon giocatore che resta fuori a lungo diventa scontento e poi chiede la cessione: vendilo o promettigli spazio.`,
`<b>Offerte</b>: una squadra più importante può chiedere un tuo giocatore. Un club di un’altra lega può offrirti la panchina: accettando cambi club, ma allenatore, storico e trofei restano tuoi.`,
`<b>Conferenza stampa</b> e <b>imprevisti</b>: dopo alcune partite scegli tra tre risposte; una o due volte a stagione succede qualcosa (sponsor, influenza, provino…).`]],
tip:`Un buon giocatore in panchina troppo a lungo ti lascia: ruotalo oppure promettigli spazio.`}
]});

TUT.push({id:'lega',t:'I campionati',sub:'Italia, USA Men’s e Women’s Club, Belgio, Francia, Germania, Regno Unito, Campionato europeo.',
intro:'Ogni campionato ha il suo formato, ricostruito su quello vero. Leggi solo quello che giochi.',
les:[
{id:'lega-it',t:'Italia: Serie A, B e C',b:[
`Tre serie con le squadre e le rose dei <b>Campionati Italiani Ultimate Open 2026</b>, a girone unico di sola andata. Salgono due squadre e ne scendono due.`,
[`<b>Serie A</b>: playoff fra le prime 4.`,
`<b>Serie B e C</b>: 1ª promossa, 2ª-5ª spareggio per la promozione.`,
`Prime 3 della Serie A dopo i playoff al <b>Campionato europeo (EUCF)</b>, che si gioca prima del prossimo campionato.`]],
tip:`Dopo uno scudetto le rivali di Serie A si rinforzano: investi in rosa e strutture per difendere il titolo.`},
{id:'lega-usa',t:'USA Men’s e Women’s Club',b:[
`<b>48 club</b> veri in <b>8 Conference</b> da 6 per divisione. Niente promozioni né retrocessioni.`,
[`<b>Stagione</b>: 5 giornate nella tua Conference e 7 <b>partite interregionali</b>, una contro ciascuna delle altre Conference. Le interregionali non contano per la classifica ma per il ranking.`,
`<b>Ranking</b>: sale con le vittorie (di più contro avversarie forti e con margini larghi). Decide quanti posti ai Nationals ha ogni regione.`,
`<b>Posti</b>: ogni Conference ha 1 posto diretto; altri 8 vanno alle regioni per ranking. Chi non è diretto può giocare il <b>Play-in</b>: gara secca, chi vince va ai Nationals.`,
`<b>Nationals</b>: 16 squadre in 4 gironi da 4. Le prime vanno ai quarti, seconde e terze ai prequarti. Seguono semifinali e finale.`],
`In Classifica: verde = Nationals diretti, giallo = Play-in, rosso = fuori.`],
tip:`Con solo 5 turni di Conference ogni partita pesa: gioca tu quelle contro le rivali dirette.`},
{id:'lega-eu',t:'Europa: campionati nazionali ed EUCF',b:[
`<b>Belgio, Francia, Germania e Regno Unito</b>: club Open del 2026, con formati adattati al gioco. Ogni livello è un girone di sola andata; chi arriva in fondo gioca almeno <b>11 partite</b>.`,
[`<b>Belgio</b>: N1, N2 e N3 (15-16 squadre). N1: playoff fra le prime 4. N2 e N3: 1ª promossa, 2ª-5ª spareggio per la promozione.`,
`<b>Francia</b>: N1 da 12, playoff fra le prime 6. N2 in due gironi geografici da 12, playoff promozione fra le prime 2 di ogni girone.`,
`<b>Germania</b>: 1. Liga da 16, playoff fra le prime 4. 2. Liga: promosse le prime 2, retrocedono le ultime 3. 3. Liga: promosse le prime 3.`,
`<b>Regno Unito</b>: 11 club, playoff fra le prime 8.`],
`Il <b>Campionato europeo (EUCF)</b> si conclude prima del prossimo campionato: 16 club: prime 3 dopo i playoff di Italia, Belgio, Francia, Germania e Regno Unito, più la quarta più forte. Ogni turno superato porta <b>crediti</b>.`],
tip:`In Europa le avversarie sono forti: arriva con la rosa fresca.`}
]});

TUT.push({id:'mod',t:'Le altre modalità',sub:'Partita veloce, Torneo, Ultimate Team, Sfide online.',
intro:'Modalità da giocare senza impegno o con una collezione da costruire.',
les:[
{id:'mod-veloce',t:'Partita veloce e Torneo',b:[
[`<b>Partita veloce</b>: scegli due squadre di qualsiasi campionato, durata e difficoltà. Non viene registrato nulla.`,
`<b>Torneo</b>: eliminazione diretta a 4, 8 o 16 squadre vere, anche di campionati diversi. Le partite le giochi o le simuli.`]],
tip:`La Partita veloce in Estrema è il banco di prova migliore quando ti sembra tutto troppo facile.`},
{id:'mod-ut',t:'Ultimate Team e Sfide online',b:[
`Apri <b>pacchetti</b> di carte con <b>giocatori veri</b> (Handler, Cutter e Defender), scegli i 7 titolari e gioca il torneo a eliminazione. Ogni partita dà <b>gettoni</b> per comprare pacchetti nel <b>Negozio</b> e potenziare le carte (al massimo 4 per carta).`,
[`<b>Pacchetti premio</b>: passando i turni ricevi pacchetti sempre più rari; chi vince il torneo ottiene il Super pacchetto.`,
`<b>Doppioni</b>: si scartano per recuperare gettoni.`,
`<b>Equipaggiamento</b>: accessori Comuni, Rari o Epici (scarpini, guantini, coach…) che alzano una statistica di tutta la squadra. Li indossi sul manichino, dove scegli anche colori e motivo della divisa.`],
`Con <b>Sfide online</b> (al posto di «Torneo contro l’IA») sfidi le squadre di altri giocatori, guidate dal computer. Scegli un nome (poi non si cambia) e parti da 1000 punti: battere uno più forte vale di più.`,
[`Il riquadro <b>Traguardi</b> mostra i pacchetti premio (da 1100 punti in su).`,
`Servono internet e la partita va finita: abbandonare conta come sconfitta.`]],
tip:`Costruisci prima una squadra equilibrata nel torneo contro il computer, poi spendi i gettoni di Sfide online.`}
]});
