---
description: Porta nel ramo di lavoro le ultime modifiche di main, unendo in modo ragionato quelle dell'altro sviluppatore
---
Sincronizza questo ramo con l'ultima versione di `main`, senza perdere nulla di nessuno dei due.

1. Salva il lavoro in corso in un commit (mai `stash` per poi dimenticarlo). Se sei su `main`, fermati: si sincronizza un ramo di lavoro.
2. `git fetch origin`. Se `origin/main` non ha commit nuovi rispetto al ramo, dillo in una riga e fermati.
3. Esegui `node tools/overlap.js` e leggi il risultato: file in comune, stesse funzioni, dipendenze incrociate, contratti toccati.
4. Leggi cosa ha fatto l'altro sviluppatore: `git log --oneline HEAD..origin/main` e, per le parti che si toccano, `git diff HEAD...origin/main -- <file>`.
5. `git merge origin/main` (merge, non rebase: così non serve mai un force push).
6. Se Git segnala conflitti, per ogni punto:
   - guarda le tre versioni (`git show :1:<file>` antenato, `:2:` tua, `:3:` altrui) e capisci lo SCOPO di ciascuna modifica dai commit e dal codice;
   - scrivi una versione che realizza entrambi gli scopi. Non scegliere «la mia» o «la loro» in blocco, a meno che le due modifiche siano identiche nell'effetto;
   - se le due modifiche cambiano la stessa meccanica in modi diversi ma compatibili (per esempio due parametri nuovi, due condizioni nuove), tienile entrambe;
   - solo se sono davvero incompatibili (due regole opposte per la stessa cosa) fermati e proponimi una soluzione che conserva il più possibile di entrambe, spiegando in tre righe cosa cambia.
7. Anche SENZA conflitti Git, controlla le incompatibilità logiche indicate dallo strumento:
   - «dipendenze incrociate»: rileggi la funzione usata e chi la usa, e verifica che parametri, valori restituiti ed effetti attesi coincidano ancora;
   - «contratti toccati»: applica la lista di controllo di `CLAUDE.md` (salvataggi, statistiche, ganci, schermate, ordine dei file).
8. `npm test`. Se fallisce, correggi l'integrazione (non il test, a meno che il test descriva un comportamento che uno dei due ha cambiato apposta: in quel caso aggiornalo e dillo).
9. Concludi il merge con un messaggio che elenca, in poche righe, che cosa è stato integrato a mano e perché.
10. Riferiscimi solo: quanti commit sono entrati, se c'erano sovrapposizioni e come le hai risolte, esito dei test. Niente elenco se non c'era nulla da segnalare.
