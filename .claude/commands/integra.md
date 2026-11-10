---
description: Esamina e integra la pull request dell'altro sviluppatore (o tutte quelle aperte)
argument-hint: [numero della pull request]
---
Integra in `main` il lavoro in attesa. Pull request indicata: $ARGUMENTS (se vuoto: tutte quelle aperte, dalla più vecchia).

Per ogni pull request:
1. `node tools/pr.js elenco`, poi per ognuna `node tools/pr.js stato <n>` (ramo, conflitti con `main`, esito della verifica).
2. `git fetch origin` e `node tools/overlap.js origin/main origin/<ramo>`: se non ci sono sovrapposizioni e la verifica è verde, uniscila (`node tools/pr.js unisci <n>`) senza chiedermi nulla.
3. Se GitHub la segnala in conflitto o lo strumento trova stesse funzioni / dipendenze incrociate con ciò che è entrato in `main` dopo la sua apertura:
   - passa al suo ramo (`git switch <ramo>` dopo `git fetch`), esegui lì i passi 3–9 di `/sincronizza`, carica il risultato con un push normale (mai force);
   - non riscrivere né cancellare i commit dell'altro sviluppatore: aggiungi un commit di integrazione;
   - quando la verifica torna verde, unisci.
4. Se due pull request aperte toccano la stessa meccanica, integra prima la più vecchia, poi sincronizza la seconda sopra la prima con lo stesso metodo.
5. Dopo ogni unione: `git switch main && git pull origin main && npm run test:rapido`.
6. Segnalami solo i casi davvero incompatibili (con una proposta), e alla fine un riepilogo di una riga per pull request.
