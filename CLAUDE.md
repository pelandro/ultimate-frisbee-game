# Ultimate Frisbee — istruzioni per Claude Code

Gioco arcade 2D di Ultimate Frisbee in stile retro (riferimento: Retro Bowl), in italiano, distribuito come **un solo file HTML**.
Ci lavorano **due sviluppatori**, entrambi con Claude Code, sullo stesso repository GitHub. Rispondi sempre in italiano, in modo semplice ma completo.

## Comandi

| Comando | A cosa serve |
|---|---|
| `npm run build` | Costruisce `dist/ultimate-frisbee.html` (il gioco: si apre con un doppio clic) |
| `npm test` | Verifica completa: controlli statici, motore di gioco, prova nel browser (circa un minuto) |
| `npm run test:rapido` | Controlli statici + motore con poche partite (per i passi intermedi) |
| `npm run confronto` | Confronta il ramo con `origin/main`: chi ha cambiato cosa e dove le modifiche si toccano |
| `node tools/pr.js apri\|elenco\|stato\|attendi\|unisci` | Pull request: funziona sul computer e nelle sessioni cloud (dove `gh pr ...` non è disponibile) |
| `npm run mappa -- nome` | Dice in quale modulo sta una funzione |
| `node tools/segnalazione.js <file.json>` | Legge un file di «Segnala un problema» (tasto «!» in partita) e mostra i dati, senza giudicare: riassunto, cronologia con salti e tuffi, stato di tutti nell'ultimo istante, tracce dall'alto (`-tracce.png`), filmato dello schermo (`-filmato.png`, `-filmato.html`), scene laterali (`-scene.png`), foto finale (`-schermo.jpg`); su richiesta `--istante <s>`, `--giocatore <B3>`, `--statistiche`. **Quando l'utente manda una segnalazione non analizzarla di tua iniziativa: aspetta che dica che cosa non va**, poi usa lo strumento e le immagini per raccogliere i dati che servono a capirlo |

## Com'è fatto il codice

- I sorgenti stanno in `src/`. Il gioco è la **concatenazione dei file di `src/` in ordine alfabetico di percorso** (`tools/build.js`). Il build trasforma anche il CSS per la rotazione automatica (ogni media query su larghezza/altezza diventa anche una container query sul `<body>`, ogni vh/vw anche cqh/cqw): nei sorgenti si scrive il CSS nel modo solito, ma per le coordinate dei tocchi si usa `layRect(el)` al posto di `getBoundingClientRect()`. Niente moduli né import: tutto il JavaScript vive in un unico ambito globale.
- **Non modificare `dist/`**: è generato e non sta in Git.
- Per aggiungere codice crea un file nuovo nella cartella giusta con un numero libero (per esempio `30-js/30-carriera/11-sponsor.js`). **Non rinumerare né rinominare** i file esistenti: l'ordine conta, perché una costante deve essere dichiarata prima di essere usata al caricamento.
- `src/30-js/10-sim/` è il **motore di gioco**: non deve usare la pagina (`document`, `window`, `localStorage`, `$()`), così gira anche da riga di comando. Parla con l'interfaccia solo attraverso `HOOKS`.
- **Documenti da leggere quando servono** (non sono caricati da soli):
  - `docs/ARCHITETTURA.md`: mappa dei moduli e delle funzioni principali. Leggila prima di cercare nel codice.
  - `docs/CONTRATTI.md`: le regole dettagliate di ogni area (salvataggio, economia, campionati, partita, bilanciamento, interfaccia, testi). Leggi la sezione dell'area prima di cambiarla.
  - `docs/STILE-TESTI.md`: tono e parole fisse, prima di scrivere una scritta nuova.

## Regole Git (obbligatorie)

1. **Un ramo per ogni aggiornamento**: `agg/<nome-breve>`, creato dall'ultima `main`. Mai commit su `main`.
2. **`main` cambia solo con le pull request**, unite quando la verifica di GitHub è verde. Mai push diretto, mai force push su `main`, mai `--admin`.
3. **Prima di integrare, sincronizza**: `git fetch origin` e `git merge origin/main` nel ramo di lavoro. Si usa il merge, non il rebase: così non serve mai un force push.
4. **Non eliminare né riscrivere il lavoro dell'altro sviluppatore** (commit, rami, file) senza la sua autorizzazione. Se una sua modifica sembra sbagliata, integrala e segnalalo.
5. Se l'altro sviluppatore unisce per primo, la tua pull request si riallinea da sola (lavoro «Aggiorna rami», con l'unione automatica attiva): non rifare a mano la sincronizzazione. Intervieni solo se il bot lascia un commento di conflitto: allora `/sincronizza`, risolvi con l'unione ragionata e ricarica il ramo.
6. Dopo ogni integrazione: `npm test`. Una pull request con verifica rossa non si unisce.
7. I ganci in `tools/hooks/` e `.githooks/` bloccano le violazioni: se un comando viene fermato, non aggirarlo, segui l'indicazione.

Comandi pronti: `/inizia` (nuovo ramo), `/sincronizza` (porta dentro `main`), `/consegna` (verifica, push, pull request con unione automatica), `/integra` (pull request dell'altro), `/stato`.

## Unione ragionata delle modifiche

L'obiettivo è integrare **entrambi** i miglioramenti: mai sovrascrivere, mai perdere una funzionalità compatibile.

1. **Parti diverse** (file o funzioni diverse, nessuna dipendenza incrociata): unione automatica, poi `npm test`. Non chiedere conferma.
2. **Stessa funzione o stessa meccanica**: leggi le tre versioni (antenato, mia, altrui) e i messaggi dei commit, capisci lo scopo di ciascuna modifica, scrivi una versione che li realizza entrambi. Non prendere una delle due in blocco.
3. **Davvero incompatibili** (due regole opposte per la stessa cosa): fermati, proponi la soluzione che conserva di più di entrambe, chiedi conferma. È l'unico caso in cui si chiede.
4. **Senza conflitti Git non vuol dire senza problemi.** Esegui sempre `npm run confronto` e controlla:
   - *dipendenze incrociate*: uno ha cambiato una funzione che l'altro usa (parametri, valore restituito, effetti collaterali);
   - *contratti* (sotto e in `docs/CONTRATTI.md`, sezioni delle aree toccate): due modifiche indipendenti possono romperli insieme.
5. Nel messaggio del merge scrivi in poche righe che cosa hai integrato a mano e perché. Segnala all'utente solo i conflitti realmente problematici.

### Regole che valgono sempre

Il dettaglio di ognuna è in `docs/CONTRATTI.md`.

- **Salvataggio**: un campo nuovo di un giocatore va in `squadData()` e `setSquad()`, con il valore predefinito per i salvataggi vecchi in `careerInit()`; un campo nuovo di `SV` ha il suo predefinito; un campo di `G` che deve sopravvivere a una sospensione va in `suspSnap`/`resumeMatch`; un formato incompatibile aumenta `SAVE_V` con la conversione in `loadSave()`. Le chiavi di `localStorage` non si riusano. Un campo nuovo di `UT` va in `utSave()`, `utLoad()` e nell'azzeramento iniziale.
- **Partita**: un campo nuovo di `G` si azzera in ogni avvio partita (`startMatch`, `startQuick`, `startUT`, `startTourn`, `startDrill`), oppure in `newGame()` se vale per tutta la partita, o in `placeTeams()` se vale per un punto. Un gancio nuovo va nell'oggetto `HOOKS` iniziale e si spegne nei test.
- **Campionati**: le regole USA e delle leghe europee stanno nei loro file e le funzioni italiane delegano con `isUS()`/`isLN()`; gli elenchi di club per mercato, scambi, offerte o carte passano da `allClubs()` (le squadre femminili giocano solo tra loro).
- **Forza**: una sola formula di potenza (`rosterPower`, `teamPow`/`matchPow`); non scriverne un'altra e non confrontare una potenza con un livello. I giocatori generati con un potenziale passano da `potDraw`/`potB`.
- **Dati generati** (`00-dati-*.js`, Overall 2026, ritratti, età giovanili, rose USA Women): non si ritoccano a mano riga per riga, si rigenerano o si corregge nelle liste fatte apposta. Dei giocatori reali entrano solo nome, ruolo, età e Overall.
- **Bilanciamento**: ogni modifica a Overall, economia, strutture, staff, mercato o crescita va provata con `node tools/test-bilanci.js --se-serve origin/main` prima di consegnare; le costanti del motore sono tarate con `tools/test-sim.js` e vanno rimisurate, non sommate, quando due modifiche toccano la stessa meccanica. Le soglie si cambiano solo se viene chiesto esplicitamente un gioco più facile o più difficile.
- **Meccaniche nascoste**: niente avvisi in partita sull'adattamento della difesa né su altre meccaniche nascoste (unica eccezione il fumetto «Difesa adattata»).
- **Interfaccia**: una schermata nuova va in `SCREENS` e in `showScreen()` (e, se è della carriera, in `CSC` e nella prova di impaginazione); gli `id` sono unici; per i tocchi `layRect(el)`; per i margini `--sal`/`--sar`/`--sat`/`--sab`; le azioni importanti passano da `askConfirm`, mai da `confirm()`.
- **Testi**: guida (`src/20-html/07-guida.html`), tutorial, Primi passi e `docs/CHANGELOG.md` si aggiornano con la modifica. Una regola nuova entra in una lezione esistente del tutorial; gli `id` delle lezioni non si cambiano. Non aggiungere monete a mano (le mette l'osservatore di «crediti»).

### Dove sono i dettagli

| Se tocchi… | Leggi in `docs/CONTRATTI.md` |
|---|---|
| Salvataggi, campi di `SV`, `localStorage` | Salvataggio |
| Conti, sponsor, obiettivi, stipendi, cessioni | Economia della carriera |
| Mercato, svincolati, staff, partite minime | Mercato, staff e stagione |
| Ultimate Team, Superpoteri, pacchetti, online | Ultimate Team |
| Un campionato (Italia, USA, USA Women, leghe europee, Women), EUCF, Nationals | Campionati |
| `G`, ganci, statistiche, schemi, difesa, cambi, scene laterali | Partita e motore |
| Potenza, potenziali, crescita, Overall, punti fissi | Forza, crescita e bilanciamento |
| Schermate, CSS, schermi grandi, conferme, impostazioni, carriera | Interfaccia |
| Guida, tutorial, Primi passi, ritratti | Testi, tutorial e ritratti |

## Stile del codice

- Commenti e testi in italiano; i commenti spiegano il perché, non il cosa.
- Nomi brevi come nel resto del file; nessuna dipendenza esterna a runtime (il gioco deve funzionare offline da un solo file).
- Ogni file di `src/` finisce con un a capo.
- Dati dei giocatori reali: solo nome, età e statistiche pubbliche; niente date di nascita o altri dati personali.
- **Il repository è pubblico e `main` va in rete**: codice, commit e pull request sono leggibili da chiunque, e ciò che entra in `main` viene pubblicato sulla pagina del gioco pochi minuti dopo. Mai chiavi, password, indirizzi email, salvataggi personali o altri dati privati, nemmeno nei messaggi dei commit.

## Cosa non fare senza chiedere

- Pubblicare o distribuire il gioco oltre a ciò che è già autorizzato: il repository pubblico e la pagina <https://pelandro.github.io/ultimate-frisbee-game/>, che GitHub aggiorna da solo a ogni modifica entrata in `main`. Tutto il resto (rilasci, altri siti, negozi di app, annunci) va chiesto.
- Cancellare rami o commit altrui, cambiare le regole di protezione di `main`, disattivare i ganci o i test.
