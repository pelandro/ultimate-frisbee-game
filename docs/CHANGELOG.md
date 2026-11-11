# Registro delle modifiche

Una riga per aggiornamento, dal punto di vista di chi gioca. Le righe nuove vanno in cima a «Non ancora pubblicato».
Questo file si unisce da solo quando due rami aggiungono righe (vedi `.gitattributes`).

## Non ancora pubblicato
- Progressione e carriera: specializzazioni dei giocatori (indirizzo di sviluppo con rendimenti decrescenti), staff tecnico (quattro figure), intesa tra handler e cutter, obiettivi personali con premi e delusioni, rapporti di scouting a tre livelli con compatibilità tattica, campionati delle altre serie giocati giornata per giornata con storie e rivalità (derby). Ultimate Team: potenziamenti specializzati (Tiro, Atletico, Difesa, Mani e testa; massimo 4 per carta) e crescita lenta delle carte che giocano. Il test della carriera controlla anche questi sistemi.
- Gioco e tattica: tagli coordinati (uno lungo, uno sotto), give-and-go, isolamenti anche dell’IA; aperture per Verticale e Orizzontale, nuovo schema Weave, attacco in meta automatico vicino alla linea; duelli decisi più da statistiche, posizione e tempismo. L’IA riconosce gli schemi che ripeti, marca col suo migliore chi le fa più male e abbandona gli schemi che le fanno perdere dischi. Replay breve e saltabile delle mete spettacolari. Efficacia degli schemi rimisurata.
- Affidabilità e bilanciamento: i pacchetti di Ultimate Team rispettano davvero la loro qualità (rarità crescenti, garanzie e un «paracadute» contro le serie sfortunate); gli intercetti avvengono lungo il volo vero del disco (posizione, altezza, velocità, reazione e portata del difensore); dopo un turnover il giocatore corre a raccogliere il disco invece di comparire lì, e se il disco esce si riparte da dove ha lasciato il campo; i premi delle strutture dipendono dalle giornate in cui sono state mantenute; le partite simulate ora hanno infortuni e tengono conto della difficoltà, e la loro scala di forza è stata ritarata sulle partite giocate. Nuovo «Test carriera» in Impostazioni › Diagnostica.
- Carriera più viva: intensità degli allenamenti (leggero, normale, intenso), fatica che pesa di più (chi è molto affaticato rischia l’infortunio), sei strutture fino al livello 5 con manutenzione, usura e premi annuali di mantenimento, imprevisti occasionali con scelte, sfida facoltativa della dirigenza, rivali che si rinforzano dopo i tuoi scudetti e Coppa europea più dura a ogni vittoria. Effetti delle strutture ribilanciati (campo 10% e fisioterapia 12% per livello).
- Il gioco è sempre aggiornato all'indirizzo <https://pelandro.github.io/ultimate-frisbee-game/>; sotto il titolo compare la versione (data e ora).
- Il vento si può spegnere: Impostazioni › Vento, oppure Opzioni della carriera. Da spento tutte le partite si giocano con la calma.
- Vento: ogni partita ha il suo (in carriera lo annuncia il cruscotto). Sposta e sporca i lanci lunghi e alti, cambia la gittata e muove le zone del pull; chi lancia bene lo compensa.
- Schermi grandi: su PC e iPad Pro menu, pannelli e barra in alto si ingrandiscono. Con il dito i tasti piccoli della Rosa e della pausa sono più comodi; il Mercato non esce più dallo schermo sui telefoni stretti.
- Difesa automatica: i tuoi difendono da soli e il gioco scorre più in fretta; restano la scelta della marcatura e, di rado, un tuffo o un duello a tempo. Il tasto «Salta» risolve subito il possesso avversario. Da Impostazioni, Opzioni e Pausa si sceglie tra difesa automatica, manuale (come prima) o saltata.
- Pull a tempo: due tocchi su due barre che oscillano (potenza e direzione). È più difficile tirare un bel pull, e anche gli avversari ora sbagliano: circa un loro pull su cinque finisce fuori.
- Strumenti: guida per il secondo sviluppatore e protezioni di `main` su GitHub attive (pull request e verifica obbligatorie).
- Strumenti: `node tools/pr.js unisci` aspetta da solo la verifica quando GitHub non offre l'unione automatica (impostazione *Allow auto-merge* spenta o non disponibile).
- Strumenti: le pull request si aprono e si uniscono con `node tools/pr.js`, che funziona anche nelle sessioni cloud di Claude Code.

## 1.0.0 — versione iniziale del repository
- Gioco completo: carriera (rosa, linee, allenamenti, mercato con giocatori internazionali, club, premi, albo d'oro, ritiri e avvisi), partita veloce, torneo, Ultimate Team, tutorial e sfide.
- Sorgente diviso in moduli con costruzione automatica del file unico e verifiche automatiche.
