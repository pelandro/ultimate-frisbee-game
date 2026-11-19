---
name: nuovo-campo-salvataggio
description: Checklist per aggiungere o cambiare un campo che deve sopravvivere al salvataggio (giocatore, carriera SV, partita G, Ultimate Team UT, squadre online) senza rompere i salvataggi vecchi. Da usare ogni volta che un campo nuovo viene scritto o letto da salvataggi, sospensioni o profili online.
---

# Nuovo campo nel salvataggio

Un campo nuovo che non passa da tutti i punti qui sotto fa perdere dati o rompe i salvataggi vecchi.
I dettagli per ogni campo già esistente sono nel paragrafo «Contratti da ricontrollare a ogni integrazione» del `CLAUDE.md`: leggilo prima, qui c'è solo la procedura.

## 1. Di che campo si tratta?

Cerca dove vive già un campo simile con `npm run mappa -- nome` e `grep` nel codice, poi segui la riga giusta.

| Il campo è di... | Dove va scritto |
|---|---|
| **Un giocatore** | `squadData()` (scrittura) e `setSquad()` (lettura, in `10-sim/12-allenamenti-rose.js`), con un valore predefinito in `careerInit()` (`30-carriera/04-rosa-linee.js`) per i salvataggi vecchi |
| **La carriera** (`SV.xxx`) | un valore predefinito in `careerInit()`, o in `coachInit()`/`staffInit()` se riguarda allenatore o staff; se si azzera a fine stagione, anche in `beginSeason`/`endSeason` |
| **La partita** (`G.xxx`) | azzeramento in `newGame()` (vale per tutta la partita) o in `placeTeams()` (vale per un solo punto); in tutti gli avvii: `startMatch`, `startQuick`, `startUT`, `startTourn`, `startDrill`; se deve sopravvivere a una sospensione, anche in `suspSnap`/`resumeMatch` (`50-schermate/07-sospendi.js`) |
| **Ultimate Team** (`UT.xxx`) | `utSave()`, `utLoad()` e il suo azzeramento iniziale (`40-modalita/01-ultimate-team-simulazioni.js`); se è della squadra, anche nel ramo `hm` di `utSave` e in `utLoadSq`; si cambia modalità solo con `utUse(rp,hm)` |
| **Squadre online** | anche in `docs/firebase-rules.json` (le regole vanno ripubblicate da chi possiede il progetto Firebase: segnalalo) |
| **Campo del campo e impianto** (`G.vn`) | sia in `careerVenue` sia in `venueNow` |

## 2. Compatibilità con i salvataggi vecchi

- Ogni campo nuovo ha un **valore predefinito** per chi carica un salvataggio che non lo contiene.
- Se il formato cambia in modo **non compatibile**: aumenta `SAVE_V` (in `04-rosa-linee.js`) e aggiungi la conversione in `loadSave()` (`30-carriera/03-calendario-stagione.js`).
- Le chiavi di `localStorage` **non si riusano**: una chiave nuova per un significato nuovo.
- Niente date di nascita né altri dati personali nei giocatori reali.

## 3. Verifica

1. `npm run test:rapido` per i passi intermedi, `npm test` prima di consegnare.
2. **Attenzione:** `node tools/test-salvataggi.js` controlla solo il livello di memorizzazione (transazione unica, migrazione, quota piena). **Non** controlla i tuoi campi: non basta a dire che il contratto è rispettato.
3. Prova a mano il percorso completo: salva, ricarica la pagina, riprendi (carriera, partita sospesa, Ultimate Team se coinvolto), e carica un salvataggio vecchio senza il campo.
4. Se hai toccato giocatori, controlla anche che i generati e i veri passino dallo stesso punto.

## 4. Per chiudere

- Aggiorna il paragrafo dei contratti nel `CLAUDE.md` con il nome del campo e dove va scritto, solo se è un contratto nuovo (campo di carriera, partita, Ultimate Team o giocatore).
- Una riga in `docs/CHANGELOG.md` (sezione «Non ancora pubblicato») solo se cambia qualcosa per chi gioca.
- Nel messaggio del commit o della pull request elenca il campo e i punti toccati, nella voce «contratti toccati» del modello.
- Se l'altro sviluppatore sta toccando lo stesso modulo, lancia `npm run confronto` prima di consegnare.
