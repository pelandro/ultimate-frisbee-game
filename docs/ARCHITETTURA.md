# Architettura

Il gioco è un solo file HTML. In `src/` è diviso in moduli che `tools/build.js` concatena **in ordine alfabetico di percorso**:
i numeri davanti ai nomi servono a questo. Tutto il JavaScript condivide un unico ambito globale (niente import).

Per l'indice aggiornato di tutte le funzioni: `npm run mappa` (oppure `npm run mappa -- nomeFunzione` per trovare dove sta qualcosa).

## Cartelle

| Percorso | Contenuto |
|---|---|
| `src/00-testa.html`, `src/99-coda.html` | Apertura e chiusura della pagina |
| `src/10-css/` | Stili: font incorporati, base, tema retro, schermate di carriera e pannelli, schermi grandi e tocco (`--ui`) |
| `src/20-html/` | Struttura della pagina: campo e HUD, menu, schermate, pannelli, guida |
| `src/30-js/10-sim/` | **Motore di gioco** (tra `/*SIM_START*/` e `/*SIM_END*/`): nessun accesso alla pagina |
| `src/30-js/20-ui/` | Disegno a pixel, stacchi, HUD, input (trascinamento, tastiera, controller), impostazioni, schemi, fine partita, difesa automatica e pull a tempo (`09-difesa-pull.js`), indicatore del vento (`10-vento.js`) |
| `src/30-js/30-carriera/` | Salvataggio, squadre e roster, stagione, rosa e linee, economia, mercato, premi, evoluzione del campionato, vita dei giocatori, avvio partita e navigazione |
| `src/30-js/40-modalita/` | Ultimate Team, partite simulate, campo di allenamento (tutorial, sfide), torneo |
| `src/30-js/50-schermate/` | Schermate della carriera: cruscotto, rosa, allenamenti, mercato, club, avvisi, opzioni, guida, pausa |
| `src/30-js/90-avvio/` | Ciclo principale, audio, avvio |
| `tools/` | Costruzione, verifiche, confronto tra rami, ganci |

## Il motore (`10-sim/`)

| Modulo | Cosa contiene |
|---|---|
| `01-nucleo.js` | Costanti del campo, `KEYS` (le 12 statistiche), stato della partita `G`, `HOOKS`, creazione dei giocatori |
| `02-overall-tratti.js` | Overall per ruolo (`ROLE_W`, `ovr`, `posOf`), tratti (`TRAITS`), velocità di crescita |
| `03-movimento-schemi.js` | Movimento, schemi e playbook, marcature, linee (`useLines`), inizio meta (`startPoint`) |
| `04-ia-attacco.js`, `05-ia-difesa.js` | IA dei compagni senza disco e dei difensori; chiamate rapide; difensore guidato dal giocatore |
| `06-campo-allenamento.js` | Regole di tutorial, allenamento libero e sfide (`G.drill`) |
| `07-lanci.js`, `08-prese-duelli.js` | Tipi di lancio, traiettorie, precisione, handblock; prese, intercetti, duelli, tuffi, turnover |
| `09-ia-lanciatore-pull.js`, `10-punto-update.js` | IA di chi ha il disco, pull, meta, half time, identità tattica, ciclo `update(dt)` |
| `11-progressione.js`, `12-allenamenti-rose.js` | Potenziale, esperienza e crescita, allenamenti, generazione delle rose, roster reali, infortuni, forma |
| `13-partite-simulate.js`, `14-test.js` | Modello delle partite simulate; suite di test (`selfTestPlan`, `selfTestRun`) |
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
