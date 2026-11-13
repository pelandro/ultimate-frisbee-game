# Architettura

Il gioco è un solo file HTML. In `src/` è diviso in moduli che `tools/build.js` concatena **in ordine alfabetico di percorso**:
i numeri davanti ai nomi servono a questo. Tutto il JavaScript condivide un unico ambito globale (niente import).

Per l'indice aggiornato di tutte le funzioni: `npm run mappa` (oppure `npm run mappa -- nomeFunzione` per trovare dove sta qualcosa).

## Cartelle

| Percorso | Contenuto |
|---|---|
| `src/00-testa.html`, `src/99-coda.html` | Apertura e chiusura della pagina |
| `src/10-css/` | Stili: font incorporati, base, tema retro, schermate di carriera e pannelli, schermi grandi e tocco (`--ui`) |
| `src/20-html/` | Struttura della pagina: campo e HUD, menu, schermate, pannelli, guida. **L'ultimo file (`08-…`) apre `<script>`**: un file HTML nuovo deve venire prima in ordine alfabetico (per esempio `07b-imprevisti.html`) |
| `src/30-js/10-sim/` | **Motore di gioco** (tra `/*SIM_START*/` e `/*SIM_END*/`): nessun accesso alla pagina |
| `src/30-js/20-ui/` | Disegno a pixel (`resize()` in `01-base-camera.js` calcola l'ingrandimento `UIZ`/`--ui` di menu e pannelli, `BZ`/`--bz` dei pulsanti di gioco e `html[data-big]` secondo lo schermo; `UZS` è la scelta del giocatore), stacchi, HUD, input (trascinamento, tastiera, controller), impostazioni, schemi, fine partita, difesa automatica e pull a tempo (`09-difesa-pull.js`), indicatore del vento e del meteo (`10-vento.js`: `drawWeather`), stemma e nomi in campo (`crestPx` in `02-pixel-art.js`); i ritratti (`avatar` in `30-carriera/10-partita-avvio.js`) sono pixel art 16×16, test della carriera in Diagnostica (`11-test-carriera.js`, `careerSelfTest`), replay delle mete spettacolari (`12-replay.js`) |
| `src/30-js/30-carriera/` | Salvataggio, squadre e roster, stagione, rosa e linee, economia, mercato, premi, evoluzione del campionato, vita dei giocatori, avvio partita e navigazione, staff, intesa, obiettivi personali, scouting e specializzazioni (`12-progressione-club.js`), campionati persistenti, rivalità e storie (`13-campionati.js`), carriera dinamica (`11-carriera-dinamica.js`: intensità degli allenamenti, manutenzione e usura delle strutture, imprevisti `EVT`, sfida della dirigenza, dominio) |
| `src/30-js/40-modalita/` | Ultimate Team, partite simulate, campo di allenamento (tutorial, sfide), torneo |
| `src/30-js/50-schermate/` | Schermate della carriera: cruscotto, rosa (con confronti), allenamenti, mercato, club, avvisi, opzioni, guida, pausa, imprevisti, partite sospese (`07-sospendi.js`: `SV.susp`, `suspSnap`, `resumeMatch`), slot carriera (`08-slot.js`) |
| `src/30-js/90-avvio/` | Ciclo principale, audio, avvio |
| `tools/` | Costruzione, verifiche, confronto tra rami, ganci |

## Il motore (`10-sim/`)

| Modulo | Cosa contiene |
|---|---|
| `01-nucleo.js` | Costanti del campo, `KEYS` (le 12 statistiche), stato della partita `G`, `HOOKS`, creazione dei giocatori |
| `02-overall-tratti.js` | Overall per ruolo (`ROLE_W`, `ovr`, `posOf`), tratti (`TRAITS`), velocità di crescita |
| `03-movimento-schemi.js` | Movimento, schemi e playbook, marcature, linee (`useLines`), inizio meta (`startPoint`) |
| `03b-playbook.js` | Aperture di Verticale e Orizzontale, schema Weave, attacco in meta (`PLAYBOOK`, `ezCheck`); posizioni `[u,y]`, `[u,y,'a']` assolute, `[du,dy,'h']` relative al portatore |
| `04-ia-attacco.js`, `04b-ia-coordinazione.js`, `05-ia-difesa.js` | IA dei compagni senza disco (tagli in coppia `pairCut`, give-and-go `giveGo`, isolamenti dell'IA `aiIso`) e dei difensori (lettura degli schemi ripetuti `playRead`, marcatura sul pericolo `dangerMark`); chiamate rapide; difensore guidato dal giocatore |
| `06-campo-allenamento.js` | Regole di tutorial, allenamento libero e sfide (`G.drill`) |
| `07-lanci.js`, `07b-intercetti.js`, `08-prese-duelli.js` | Tipi di lancio, traiettorie, precisione, handblock; intercetti lungo il volo (`laneRead`, `laneCheck`); prese, duelli, tuffi, turnover (con `G.walk`: chi raccoglie corre al disco), uscite dal campo (`oobSpot`) |
| `09-ia-lanciatore-pull.js`, `10-punto-update.js` | IA di chi ha il disco, pull, meta, half time, identità tattica, ciclo `update(dt)`. Il pull: bravura di chi tira (`pullSkill`, `pullPeriod`), qualità del pull (`pullQuality`: brick, corto, buono, gran pull) e vantaggio per qualche secondo (`PULL_EDGE`, `G.edge`: stall di partenza, partenza dei tagliatori, velocità e precisione dei lanci) |
| `11-progressione.js`, `12-allenamenti-rose.js` | Potenziale, esperienza e crescita, allenamenti, generazione delle rose, roster reali, infortuni, forma |
| `13-partite-simulate.js`, `14-test.js` | Modello delle partite simulate; suite di test (`selfTestPlan`, `selfTestRun`) |
| `16-pacchetti.js` | Rarità dei pacchetti di Ultimate Team per qualità (`UT_PQ`, `utPackTiers`, garanzie, paracadute `UT_PITY`) |
| `07c-gittata.js` | Gittata del lanciatore (`throwComf`, `throwMax`, dallo Sparo) e fiducia dei compagni (`trustOf`, `reachSeen`, `deepRun`, `deepAppetite`): chi taglia lungo lo fa solo dove il lancio arriva, di più con intesa. `planThrow` accorcia il lancio oltre `throwMax` (`pl.short`) |
| `30-carriera/15-programma-allenamenti.js` | Anteprima degli allenamenti (`trainForecast`, da `trainExpect` del motore) e programma automatico (`SV.prog`, `autoTrain`, priorità `p.pri`) |
| `30-carriera/16-bilancio.js` | Bilancio previsionale (`budgetForecast`, `budgetPayback`, `budgetHTML`) |
| `30-carriera/17-statistiche-campionato.js` | Statistiche individuali persistenti del girone (`lsMatch`, `o.ss`/`o.cs` sui giocatori avversari, `leadersHTML`); `seriesStats` le usa per i premi |
| `30-carriera/18-motivazioni.js` | Motivazioni sul mercato (`m.mot`, `motBlock`, `mkReprice`) e compatibilità tattica (`fitOf`) |
| `30-carriera/19-presentazioni.js`, `20-ui/13-momenti.js` | `matchStakes` decide se una partita «conta» (finale, derby, ultima giornata, addio di un veterano); `showIntro` mostra il cartello, `momentTick` annuncia match point e universe point |
| `30-js/05-rotazione.js` | Rotazione automatica sui telefoni in verticale (`html.rotp`, `rotPt`, `layRect`, chiave `ultimate-rotazione`). Il build (`tools/build.js`, `rotReady`) duplica media query e unità vh/vw in container query sul `<body>`; `tools/icona.js` disegna l'icona (64 px nell'HTML; 180, 192, 512 e il manifest in `dist/`, copiati sulla pagina) |
| `50-schermate/08-slot.js` | Slot carriera: schermata «Carriere» dal menu iniziale (`renderCareers`, `careerGo`, `careerNew`, `teamBack` con `slotUndo`) e i tasti delle Opzioni |
| `10-sim/18-timeout.js` | Timeout (`callTimeout`, `canTimeout`, `G.tmo`) ed etichetta della situazione (`situationLabel`) |
| `30-carriera/20-tifosi-umore.js` | Tifosi (`SV.fans`, `fansBump`), faccine (`moodKey`, `moodFace`) e stelle (`starsOf`, `starsHTML`) |
| `30-carriera/21-azioni-giocatore.js` | Riposo, Colloquio, Soprannome (`p.nick`), ultima partita (`p.lm`), titoli (`p.ti`), medaglie |
| `50-schermate/09-consigli-fumetti.js` | Linea delle giornate (con i nodi dei playoff), barra «Consiglio» e fumetti di primo accesso (`SV.tips`) |
| `50-schermate/14-primi-passi.js` | Tutorial «Primi passi» nelle prime partite: `PP_STEPS` (schede con il momento in cui compaiono), `ppTick` (chiamato dal ciclo principale), `PP` salvato in `ultimate-primi`; ferma il gioco con `G.paused` |
| `50-schermate/10-conferenza-stampa.js` | Conferenza stampa: `pressCtxOf` (la partita «ha storia»?), `pressFor` (tre risposte: squadra, tifosi, giocatore), `pressApply`, `openPress` |
| `50-schermate/16-scelta-campionato.js` | Scelta del campionato (`LEAGUES`, schermata `league`), roster del club prima di sceglierlo (`openRosterPreview`, overlay `rpv`) e squadra del cuore (`favGet`, `favSet`, chiave `ultimate-cuore`) |
| `34-torneo16/01-torneo16.js`, `36-europa/01-eucf.js`, `50-schermate/18-eucf-schermate.js` | Torneo a 16 squadre (gironi da 4 per fasce di ranking, prequarti 2ª-3ª, quarti, semifinali, finale), comune a Nationals ed EUCF; EUCF: `EU_CLUBS` (club inventati), `euEnsure`, `euAdvance`, `euRecord`, `euOpponent`; schermate e presentazioni europee |
| `50-schermate/17-scroll.js` | `keepY`: ridisegnare una schermata non riporta in cima |
| `35-usa/` (`00-fantasy.js` dati Fantasy dei Nationals, `01-club-usa.js` … `06-test-usa.js`), `50-schermate/15-usa-schermate.js` | **Carriera USA Men's Club** (`SV.lk==='US'`, `SV.sr==='U'`): 32 club e 4 Conference fisse (`US_RAW`, `US_TEAM`, `US_BYCONF`), roster con giocatori veri (`US_CORE`, `US_STAR_CLUB` = internazionali del mercato che giocano nei club, tolti dal mercato USA da `usStarTaken`, `usRoster`; Overall e ruolo dai dati di `00-fantasy.js`: `usFFof`, `usFFval`, `usFFabs`, `usFFrole`, `usFFextra`), regole di stagione (`usBeginSeason` via `leagueBegin`, `usRecord`: stagione regolare, Play-in, Nationals con `SV.us.nat`; `usRanking` con scontri diretti; ranking Elo `SV.us.pr`), fine stagione e obiettivi (`usEndSeason`, `usObjective`), offerte e scambi Italia↔USA (`05-lega-incrociata.js`: `SV.job`, `SV.trade`, `switchLeague`), test (`usaSelfTest`, pulsante «Test USA» in diagnostica). Le funzioni italiane (`startCareer`, `endSeason`, `recordResult`, `leagueBegin/Advance`, `setObjective`, `poLabel`, `renderEvent`) chiamano questi moduli con una riga quando `isUS()`; l'interfaccia USA sta in `15-usa-schermate.js` |
| `30-carriera/22-playoff.js` | Playoff: `SV.po` (tabellone in corso), `SV.poRes` (esito per `endSeason`), `poBegin`, `poPlay`, `poResolve`, `poBracketHTML`; titolo di Serie A e seconda promozione di B e C |
| `30-carriera/24-allenatore.js`, `50-schermate/12-allenatore-scelta.js` | Il tuo allenatore (`SV.coach`, `COACH_FACES`, `coachNorm`, `coachRandom`), partenza da subentrato (`reliefOffer`, `reliefStart`, `SV.start`, `SV.w0`) e schermate «Scegli la tua squadra» (due modalità) e «Il tuo allenatore» |
| `30-carriera/25-staff-persone.js`, `50-schermate/13-staff.js` | Staff come persone: `SV.stp` (persona per ruolo), `SV.cand` (candidati), `STAFF_TR` (caratteristiche, `hasTr`), `staffHire`, `buyStaff`, `staffLeave`, `staffYear`; schede nel Club e finestra dei candidati |
| `30-carriera/23-traguardi.js`, `50-schermate/11-traguardi-albo.js` | Traguardi (`ACH`, `SV.ach`, `achCheck`, `achPct`), albo d’oro della Serie A (`SV.alb`, `roman`, `albHTML`) e Hall of Fame a carte (`SV.hof`, `hofCard`) |
| `30-carriera/14-maturita.js` | `talentGrow`: ogni estate chi ha raggiunto il limite può superarlo (talento +1, `p.ext`, massimo `EXT_MAX`) |
| `17-durata.js` | Durata della partita: `LEN_OPTS` (7, 11, 15 punti), `G.target`, `halfAt()`, `lenK()` (l'esperienza non cresce con le partite lunghe). `simMatch(…, tgt)` usa lo stesso traguardo |
| `11b-specializzazioni.js`, `11c-intesa.js` | Indirizzi di sviluppo dei giocatori (`SPECS`, `specBonus`) e intesa tra coppie (`G.duo`, `duoOf`) |
| `15-vento.js` | Vento e meteo della partita (`G.wind`, `setWind`, `rollWind`, `windOn`; `G.wx`, `weatherFor`, `setWx`): deriva, dispersione e gittata dei lanci; pioggia e neve peggiorano un po' le prese e la precisione |

## Come parlano le parti

- **Motore → interfaccia**: solo tramite `HOOKS` (`toast`, `sfx`, `cine`, `menu`, `over`, `half`, `injury`, `shake`, `vibe`, `drill`). Nei test i ganci sono spenti.
- **Opzioni che il motore legge**: `G.opt.cine` (stacchi laterali), `G.opt.wind` (vento acceso o spento) e `G.opt.def` (difesa: 0 automatica, 1 manuale, 2 saltata; vedi `defMan()`). `G.skip` è acceso mentre un possesso avversario viene saltato.
- **Interfaccia → motore**: chiama le funzioni del motore (`doThrow`, `doPull`, `callCut`, `startPoint`...) e legge `G`, `T` (le due squadre in campo), `SQ` (la rosa del giocatore).
- **Carriera**: tutto lo stato sta in `SV` (salvato in `localStorage` da `persist()`, letto da `loadSave()`). La rosa in memoria è `SQ`; `squadData()` la trasforma in dati da salvare e `setSquad()` la ricostruisce.
- **Modalità senza carriera** (veloce, torneo, Ultimate Team, allenamento): mettono da parte la carriera (`QM.bak`) e la rimettono all'uscita (`exitQuick`).

## Contratti

Sono i punti in cui due modifiche indipendenti possono rompersi a vicenda senza alcun conflitto Git. L'elenco operativo è in `CLAUDE.md`
(«Contratti da ricontrollare a ogni integrazione»); `tools/overlap.js` li segnala quando vengono toccati.

| Contratto | Dove | Chi lo controlla |
|---|---|---|
| Formato del salvataggio | `SAVE_V`, `squadData`, `setSquad`, `careerInit`, `loadSave` | Prova nel browser (ricarica), revisione |
| Statistiche e pesi | `KEYS`, `ROLE_W` | `tools/test-sim.js` (somma dei pesi) |
| Ganci motore ↔ interfaccia | `HOOKS` | `tools/check.js` (motore senza pagina), test del motore |
| Schermate ed elementi | `SCREENS`, `showScreen`, `id` | `tools/check.js` (id doppi, riferimenti mancanti) |
| Ordine dei file | nomi numerati in `src/` | `tools/check.js` (sintassi), prova nel browser (errori al caricamento) |
| Bilanciamento | costanti del motore | `tools/test-sim.js` (fasce attese) |
