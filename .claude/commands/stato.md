---
description: Riassume lo stato del lavoro condiviso: rami, pull request, cosa sta cambiando ciascuno
---
Dimmi in breve lo stato del lavoro condiviso, senza modificare nulla:

1. `git fetch origin`, ramo attuale e distanza da `origin/main`.
2. Rami remoti aperti e pull request (`gh pr list`), con autore e data.
3. Per ogni ramo o pull request aperta diversa dalla mia: `node tools/overlap.js origin/<ramo> HEAD` e riporta solo file in comune, stesse funzioni e contratti toccati.
4. Conclusione in due righe: posso continuare tranquillo, oppure con chi e su cosa conviene coordinarsi.
