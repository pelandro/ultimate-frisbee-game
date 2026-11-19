---
name: bilancia
description: Misura se una modifica rompe i punti fissi del bilanciamento (economia di tutti i campionati, crescita dalla Serie C, fughe nelle altre leghe) e riassume l'esito. Da usare dopo modifiche a Overall, economia, strutture, staff, stipendi, mercato, crescita o potenza di squadra, prima di consegnare.
disable-model-invocation: true
argument-hint: [economia | crescita | tutto]
---

# Misura del bilanciamento

Argomento ricevuto: $ARGUMENTS (vuoto = tutto).

## 1. Serve davvero?

```bash
node tools/test-bilanci.js --se-serve origin/main
```

Se risponde «nessun file che li riguarda è cambiato, prova saltata», fermati e dillo. L'elenco dei file che contano sta in `files` di `tools/bilanci/punti-fissi.js`.

## 2. Misura

- Tutto: `npm run bilanci`.
- Solo una parte: `node tools/test-bilanci.js economia` oppure `node tools/test-bilanci.js crescita`.
- Per vedere solo che la prova giri (le soglie qui non valgono): `node tools/test-bilanci.js --prova`.

Su un computer lento può durare molto (anche mezz'ora): lancia in background e non interrompere.
Serve Playwright; se manca: `npm install && npx playwright install chromium`.

## 3. Leggi l'esito contro i punti fissi

| Codice | Cosa controlla |
|---|---|
| E1 | senza spendere nessuno va in rosso né viene esonerato |
| E2 | tutto al massimo: sostenibile per chi domina, non in pari a metà classifica |
| E3 | metà classifica in pari |
| E4 | vertice: 1-2 acquisti a stagione, non di più |
| E5 | rosa lunga ridotta a 16: nessun guadagno eccessivo |
| G1-G5 | crescita dalla Serie C (Serie A entro la 6ª stagione, scudetto di solito all'8ª-10ª, mai troppo presto, nessuna fuga, vittorie 60-82%) |
| G6 | nelle altre leghe nessuna fuga oltre 8 punti sopra la migliore delle altre |

## 4. Regole

- Se un punto non è rispettato, **correggi la modifica**, non le soglie.
- Le soglie in `tools/bilanci/punti-fissi.js` si cambiano **solo** se chi cura il gioco chiede di renderlo più facile o più difficile, con la data e il motivo nel commento. Mai di tua iniziativa.
- I numeri sono carriere simulate con lo stesso seme, ma ogni cambio al codice sposta il «rumore»: se un valore è al limite, ripeti la misura prima di concludere.
- Se la modifica tocca una meccanica toccata anche dall'altro sviluppatore (stanchezza, precisione, IA, economia), dopo l'unione **rimisura**, non sommare i numeri alla cieca.
- Per la potenza di squadra, `DBL_PEN` e `PW_MY` sono tarati con questa prova: se li tocchi, rimisura. Per gli schemi di gioco (`SCH_FIT`, `ADAPT_*`, `FIT_*`) la misura è un'altra (30+ partite per casella con `G.fix`, vedi `CLAUDE.md`).
- Uno strumento nuovo che tocca questi equilibri va aggiunto a `files`.

## 5. Riferisci

Una tabella breve: punto fisso, valore misurato, soglia, esito (rispettato / non rispettato), e una riga su cosa hai cambiato. Se non hai potuto misurare, dillo: non scrivere «superato» senza averlo visto.
