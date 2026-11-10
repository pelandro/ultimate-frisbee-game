---
description: Verifica, salva, carica il ramo e apre la pull request verso main con unione automatica
argument-hint: [titolo della pull request]
---
Consegna l'aggiornamento di questo ramo. Titolo proposto: $ARGUMENTS

1. Se sei su `main`, fermati e dimmelo.
2. Esegui prima tutti i passi di `/sincronizza` (così la pull request parte già allineata a `main`).
3. `npm test` (verifica completa). Non consegnare con test falliti.
4. Aggiungi una riga in cima a `docs/CHANGELOG.md` (sezione «Non ancora pubblicato»): cosa cambia per chi gioca, in italiano semplice.
5. Commit con messaggi chiari in italiano (uno per argomento, non uno enorme), poi `git push -u origin <ramo>`.
6. Apri la pull request con `gh pr create --base main` seguendo `.github/pull_request_template.md`: cosa cambia, moduli e funzioni toccati, contratti toccati, verifiche fatte.
7. Attiva l'unione automatica: `gh pr merge --auto --squash --delete-branch`. La pull request entra in `main` da sola quando la verifica di GitHub è verde.
8. Se l'unione automatica non è disponibile sul repository, lascia la pull request aperta e dimmelo in una riga.
9. Riferiscimi il collegamento alla pull request e l'esito dei test, nient'altro.
