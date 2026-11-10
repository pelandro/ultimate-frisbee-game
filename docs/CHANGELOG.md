# Registro delle modifiche

Una riga per aggiornamento, dal punto di vista di chi gioca. Le righe nuove vanno in cima a «Non ancora pubblicato».
Questo file si unisce da solo quando due rami aggiungono righe (vedi `.gitattributes`).

## Non ancora pubblicato
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
