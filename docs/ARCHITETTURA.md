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
| `src/30-js/20-ui/` | Disegno a pixel, stacchi, HUD, input (trascinamento, tastiera, controller), impostazioni, schemi, fine partita, difesa automatica e pull a tempo (`09-difesa-pull.js`), indicatore del vento (`10-vento.js`), test della carriera in Diagnostica (`11-test-carriera.js`, `careerSelfTest`), replay delle mete spettacolari (`12-replay.js`) |
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
| `09-ia-lanciatore-pull.js`, `10-punto-update.js` | IA di chi ha il disco, pull, meta, half time, identità tattica, ciclo `update(dt)` |
| `11-progressione.js`, `12-allenamenti-rose.js` | Potenziale, esperienza e crescita, allenamenti, generazione delle rose, roster reali, infortuni, forma |
| `13-partite-simulate.js`, `14-test.js` | Modello delle partite simulate; suite di test (`selfTestPlan`, `selfTestRun`) |
| `16-pacchetti.js` | Rarità dei pacchetti di Ultimate Team per qualità (`UT_PQ`, `utPackTiers`, garanzie, paracadute `UT_PITY`) |
| `11b-specializzazioni.js`, `11c-intesa.js` | Indirizzi di sviluppo dei giocatori (`SPECS`, `specBonus`) e intesa tra coppie (`G.duo`, `duoOf`) |
| `15-vento.js` | Vento della partita (`G.wind`, `setWind`, `rollWind`, `windOn`): deriva, dispersione e gittata dei lanci |

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
