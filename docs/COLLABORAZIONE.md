# Lavorare in due

Due persone, ognuna con Claude Code, sullo stesso repository. L'idea è semplice:
**ognuno lavora nel proprio ramo, `main` cambia solo con le pull request, e ogni pull request viene provata insieme a tutto ciò che è già in `main`.**

## Primo avvio (una volta sola)

Il repository è <https://github.com/pelandro/ultimate-frisbee-game> (**pubblico**: chiunque può leggerlo, solo i collaboratori invitati possono scriverci).

Chi lo possiede invita il collega da GitHub: **Settings › Collaborators › Add people** (permesso di scrittura).

Entrambi, sul proprio computer:

```bash
git clone https://github.com/pelandro/ultimate-frisbee-game.git
```

```bash
cd ultimate-frisbee-game && npm install && npx playwright install chromium
```

`npm install` attiva i ganci Git del progetto. Per usare Claude Code sul web, collega GitHub da <https://claude.ai/connect-github>,
dai all'app Claude l'accesso a questo repository e sceglilo all'avvio della sessione.

Le protezioni di `main` su GitHub e l'unione automatica le imposta **il proprietario, una volta sola** (dalle sessioni cloud di Claude non si possono cambiare le impostazioni del repository). **Sono già attive**: il ruleset *Proteggi main* (Settings › Rules › Rulesets) e *Allow auto-merge*. Se in futuro vanno rifatte:

- dal proprio computer: `bash tools/setup-github.sh ultimate-frisbee-game` (serve `gh auth login`);
- oppure a mano: **Settings › General › Pull Requests** → spunta *Allow auto-merge* e *Automatically delete head branches*; **Settings › Rules › Rulesets › New branch ruleset** per il ramo predefinito → *Require a pull request before merging* (0 approvazioni), *Require status checks to pass* con il controllo `verifica` e *Require branches to be up to date*, *Block force pushes*, *Restrict deletions*, lista di bypass vuota.

Se il repository tornasse privato con il piano gratuito di GitHub (che sui repository privati non offre *Allow auto-merge* né la protezione dei rami) il flusso funzionerebbe lo stesso: `node tools/pr.js unisci` aspetta la fine della verifica e unisce solo se è verde, e i ganci di Claude Code e di Git bloccano commit e push diretti su `main`.

## Cosa deve fare il collaboratore (una volta sola)

Le regole per Claude **non vanno scritte a mano**: stanno nel repository (`CLAUDE.md`, `.claude/settings.json`, `.claude/commands/`, `tools/hooks/`) e Claude Code le legge da solo appena apre la cartella del progetto. Basta:

1. Accettare l'invito a collaborare (arriva per email e in <https://github.com/pelandro/ultimate-frisbee-game/invitations>).
2. Clonare il repository e lanciare `npm install` (vedi sopra): attiva i ganci Git.
3. Aprire Claude Code **dentro la cartella clonata** (oppure, sul web, scegliere questo repository) e, alla richiesta, fidarsi del progetto.
4. Verificare che funzioni dicendo a Claude: «/stato». Deve rispondere in italiano con rami e pull request aperte.

Da lì in poi si lavora come descritto sotto. Non servono impostazioni personali. Due accortezze: non usare il proprio `.claude/settings.local.json` per aggirare i blocchi, e avvisarsi quando si cambiano le regole (`CLAUDE.md`, `.claude/`, `tools/hooks/`), perché cambiano il modo di lavorare di entrambi; passano da una pull request come ogni altra modifica.

## Il lavoro di tutti i giorni

Basta dirlo a Claude a parole; questi comandi fanno la stessa cosa in un colpo:

1. **`/inizia aggiungo le maglie personalizzate`** — aggiorna `main` e crea il ramo `agg/maglie-personalizzate`.
2. Si lavora normalmente. Claude prova i passi intermedi con `npm run test:rapido`.
3. **`/consegna`** — porta dentro le ultime modifiche del collega, fa la verifica completa, carica il ramo e apre la pull request. La pull request entra in `main` da sola quando la verifica di GitHub è verde.

Altri comandi: **`/sincronizza`** (aggiornarsi a metà lavoro), **`/integra`** (unire le pull request aperte), **`/stato`** (chi sta cambiando cosa).

A inizio sessione Claude riceve da solo lo stato del repository: se il collega ha aggiunto qualcosa a `main`, lo sa e sincronizza prima di consegnare.

## Cosa succede quando lavorate nello stesso momento

| Situazione | Cosa fa Claude |
|---|---|
| Avete cambiato file o funzioni diverse | Unisce da solo e fa i test. Non chiede nulla. |
| Avete cambiato la stessa funzione o la stessa meccanica | Legge lo scopo delle due modifiche e scrive una versione che le contiene entrambe. Lo riporta in una riga. |
| Le due modifiche si contraddicono (due regole opposte per la stessa cosa) | Si ferma, propone una soluzione che conserva il più possibile di entrambe e chiede conferma. È l'unico caso in cui chiede. |
| Nessun conflitto Git, ma una modifica usa una funzione che l'altro ha cambiato | `npm run confronto` lo segnala; Claude rilegge i due pezzi e i test verificano l'insieme. |

Per ridurre le sovrapposizioni: il codice è diviso in molti file per argomento (`docs/ARCHITETTURA.md`), e il codice nuovo va in file nuovi.
Se sapete già di lavorare sulla stessa meccanica, ditevelo: `/stato` mostra i rami aperti e cosa toccano.

## Le protezioni

Tre livelli, dal più vicino al più lontano:

1. **Claude Code** (`.claude/settings.json`, `tools/hooks/guard-git.js`): blocca commit e merge fatti stando su `main`, push verso `main`, force push; chiede conferma prima di comandi che scartano lavoro.
2. **Git sul vostro computer** (`.githooks/`): le stesse regole valgono anche se usate Git a mano.
3. **GitHub** (protezione di `main`): pull request obbligatoria, verifica obbligatoria sul risultato dell'unione, niente force push né cancellazione, nemmeno per il proprietario.

La verifica (`npm test`, uguale in locale e su GitHub) comprende: controlli statici (sintassi, nomi dichiarati due volte, elementi doppi, segni di conflitto),
test del motore con partite simulate a seme fisso, prova del gioco in un browser vero lungo i percorsi principali.

## Domande frequenti

**Dove trovo il gioco da provare?** `npm run build` crea `dist/ultimate-frisbee.html`. Ogni verifica su GitHub lo allega anche tra gli «Artifacts».

**Perché `dist/` non è nel repository?** È un file generato: se fosse in Git, ogni aggiornamento di entrambi lo metterebbe in conflitto.

**Posso modificare `main` per una correzione al volo?** No: anche una riga passa da un ramo e da una pull request. Con `/inizia` e `/consegna` sono due comandi.

**La verifica su GitHub è rossa.** La pull request non entra. Aprite il ramo, dite a Claude «la verifica è fallita, sistemala»: legge l'esito con `gh run view` e corregge.

**I salvataggi dei giocatori si rompono se cambiamo i dati?** Le regole sono in `CLAUDE.md` («Salvataggio»): ogni campo nuovo ha un valore predefinito per i salvataggi vecchi, e i cambi non compatibili aumentano `SAVE_V`.
