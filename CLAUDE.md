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

## Com'è fatto il codice

- I sorgenti stanno in `src/`. Il gioco è la **concatenazione dei file di `src/` in ordine alfabetico di percorso** (`tools/build.js`). Il build trasforma anche il CSS per la rotazione automatica (ogni media query su larghezza/altezza diventa anche una container query sul `<body>`, ogni vh/vw anche cqh/cqw): nei sorgenti si scrive il CSS nel modo solito, ma per le coordinate dei tocchi si usa `layRect(el)` al posto di `getBoundingClientRect()`. Niente moduli né import: tutto il JavaScript vive in un unico ambito globale.
- **Non modificare `dist/`**: è generato e non sta in Git.
- Per aggiungere codice crea un file nuovo nella cartella giusta con un numero libero (per esempio `30-js/30-carriera/11-sponsor.js`). **Non rinumerare né rinominare** i file esistenti: l'ordine conta, perché una costante deve essere dichiarata prima di essere usata al caricamento.
- `src/30-js/10-sim/` è il **motore di gioco**: non deve usare la pagina (`document`, `window`, `localStorage`, `$()`), così gira anche da riga di comando. Parla con l'interfaccia solo attraverso `HOOKS`.
- La mappa completa dei moduli, con funzioni principali e contratti, è in `docs/ARCHITETTURA.md`: leggila prima di cercare nel codice.

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
   - *contratti* (sotto): due modifiche indipendenti possono romperli insieme.
5. Nel messaggio del merge scrivi in poche righe che cosa hai integrato a mano e perché. Segnala all'utente solo i conflitti realmente problematici.

### Contratti da ricontrollare a ogni integrazione

- **Salvataggio**: ogni campo nuovo di un giocatore va aggiunto sia in `squadData()` (scrittura) sia in `setSquad()` (lettura), con un valore predefinito per i salvataggi vecchi in `careerInit()`. Dalla P2 i giocatori hanno anche `spec`, `goal`, `sad`; la carriera `SV.staff`, `SV.duo`, `SV.lg` (calendari delle altre serie), `SV.story`, `SV.riv`. Dalla maturità: `p.ext` (salvato come `ex`). Dalla revisione della carriera: `p.pri` (priorità di allenamento), `p.hist` (storico dell’Overall, salvato come `hi`), `SV.prog` (programma automatico), `SV.lsOn` e, sui giocatori delle altre squadre, `o.ss`/`o.cs` (statistiche di stagione e carriera); sul mercato `m.mot` e `m.base`. Dall’ondata 1: `SV.fans` (tifosi), `SV.tips` (fumetti visti), sui giocatori `nk` (soprannome), `lm` (ultima partita), `ti` (titoli), `tk` (colloqui); in partita `G.tmo` (timeout usati, anche in `suspSnap`). Dall’ondata 2: `SV.po` e `SV.poRes` (playoff in corso: si azzerano in `endSeason`), `SV.alb` (albo d’oro della Serie A), `SV.ach` (traguardi raggiunti, con la stagione); le voci di `SV.hof` portano anche `pos`, `v`, `lk`, `t`, `nk`, `md` (carta dorata); in partita `G.wx` (meteo: si azzera in `newGame()`, vale per ogni modalità). Dall’ondata 3: `SV.coach` ({n,s,lk}: nome, cognome, volto), `SV.start` ('cuore' o 'sub'), `SV.w0` (vittorie ereditate nel subentro), `SV.stp` (persona per ruolo dello staff: {n,a,lk,tr,pot,x}), `SV.cand` e `SV.candN` (candidati e rinnovi); i livelli restano in `SV.staff` e tutti gli effetti leggono `staffLv(k)`: chi scrive `SV.staff[k]` deve tenere coerente `SV.stp[k]` (usa `staffHire`, `buyStaff`, `staffLeave`). Valori predefiniti per i salvataggi vecchi in `coachInit()` e `staffInit()` (da `careerInit()`). Dalla P3: `SV.susp` (partita sospesa: va azzerata quando la partita finisce o viene abbandonata) e `SV.slot` (slot della carriera; `persist()` scrive anche `ultimate-carriera-<slot>`). Un campo nuovo di `G` che deve sopravvivere a una sospensione va aggiunto anche in `suspSnap`/`resumeMatch`. Se il formato cambia in modo non compatibile, aumenta `SAVE_V` e aggiungi la conversione in `loadSave()`. Le chiavi di `localStorage` non si riusano (dalla scelta del campionato: `ultimate-cuore` = squadra del cuore per campionato, `{IT:nome, US:nome}`; dall'ondata 3: `ultimate-primi` per il tutorial delle prime partite, `ultimate-settings` ha anche `uz`).
- **Campionato USA** (`SV.lk==='US'`, `SV.sr==='U'`): `SV.mem.U` = i club della tua Conference, `SV.lg` = le altre tre; `SV.us` ({cf, conf, ph, pr, pr0, fin, pin, q, nat, stage}), `SV.usAlb`, `SV.job`/`SV.jobLast`/`SV.trade` (offerte Italia↔USA). Le tabelle USA portano `h` (scontri diretti): `ranking()` le riconosce da lì. Le funzioni italiane delegano a `35-usa/` con `isUS()`: non scrivere regole USA dentro quelle italiane. Un'altra lega = un altro file in `35-usa/`-stile, non rami `if` sparsi. Le stelle di `STARS` che giocano in un club USA stanno in `US_STAR_CLUB`.
- **Statistiche**: `KEYS` elenca le 12 statistiche; i pesi di `ROLE_W` devono sommare 1 per ogni ruolo (lo controlla il test).
- **Motore ↔ interfaccia**: il motore chiama `HOOKS.nome(...)`; se aggiungi un gancio, definiscilo anche nell'oggetto `HOOKS` iniziale (funzione vuota) e spegnilo nei test (`selfTestRun`).
- **Stato della partita**: i campi di `G` valgono per tutte le modalità (carriera, veloce, torneo, Ultimate Team, allenamento). Un campo nuovo va azzerato in ogni avvio partita (`startMatch`, `startQuick`, `startUT`, `startTourn`, `startDrill`). Ciò che vale per tutta la partita (per esempio il vento, `G.wind`) si azzera in `newGame()`, che tutte le modalità chiamano. Ciò che vale per un solo punto (come `G.edge`, il vantaggio del pull) si azzera in `placeTeams()`; il tipo di lancio in corso di mira è `G.high` (0 piatto, 1 alto) e si sceglie con le dita (`fingerAdd` in `05-input-impostazioni.js`).
- **Campionati**: un campionato nuovo = una voce in `LEAGUES` (`50-schermate/16-scelta-campionato.js`: id, nome, testo, `clubs`, `roster`) più la sua schermata di scelta dei club; la scelta del campionato, il roster dei club e la squadra del cuore sono comuni.
- **Schermate**: ogni schermata nuova va in `SCREENS` e in `showScreen()`; gli `id` degli elementi sono unici in tutto il gioco (lo controlla `npm run check`). L'interfaccia si adatta alla dimensione dello schermo (`resize()`: `--ui`, `--bz`, `html[data-big]`, scelta del giocatore `SETT.uz`): un elemento fuori da `.screen`/`.overlay` che deve crescere sugli schermi grandi va aggiunto all'elenco `zoom:var(--ui)` di `05-schermi-grandi-e-tocco.css` oppure deve usare `--bz` (come i pulsanti di gioco).
- **Bilanciamento**: le costanti del motore sono tarate con i test (`tools/test-sim.js`). Se due modifiche toccano la stessa meccanica (stanchezza, precisione, IA), dopo l'unione i numeri vanno rimisurati, non sommati alla cieca.
- **Testi**: la guida del gioco (`src/20-html/07-guida.html`) e `docs/CHANGELOG.md` descrivono ciò che c'è davvero: aggiornali con la modifica.

## Stile del codice

- Commenti e testi in italiano; i commenti spiegano il perché, non il cosa.
- Nomi brevi come nel resto del file; nessuna dipendenza esterna a runtime (il gioco deve funzionare offline da un solo file).
- Ogni file di `src/` finisce con un a capo.
- Dati dei giocatori reali: solo nome, età e statistiche pubbliche; niente date di nascita o altri dati personali.
- **Il repository è pubblico e `main` va in rete**: codice, commit e pull request sono leggibili da chiunque, e ciò che entra in `main` viene pubblicato sulla pagina del gioco pochi minuti dopo. Mai chiavi, password, indirizzi email, salvataggi personali o altri dati privati, nemmeno nei messaggi dei commit.

## Cosa non fare senza chiedere

- Pubblicare o distribuire il gioco oltre a ciò che è già autorizzato: il repository pubblico e la pagina <https://pelandro.github.io/ultimate-frisbee-game/>, che GitHub aggiorna da solo a ogni modifica entrata in `main`. Tutto il resto (rilasci, altri siti, negozi di app, annunci) va chiesto.
- Cancellare rami o commit altrui, cambiare le regole di protezione di `main`, disattivare i ganci o i test.
