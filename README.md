# Ultimate Frisbee

Gioco arcade 2D di Ultimate Frisbee in stile retro: carriera con squadre e giocatori veri dei Campionati Italiani Open 2026,
partita veloce, torneo, Ultimate Team, tutorial e sfide. Il gioco è un solo file HTML e funziona offline.

## Giocare

```bash
npm run build
```

Poi apri `dist/ultimate-frisbee.html` nel browser (su telefono: in orizzontale).
Ogni pull request e ogni aggiornamento di `main` producono anche il file pronto da scaricare tra gli «Artifacts» della verifica su GitHub.

## Sviluppare (due persone, con Claude Code)

```bash
npm install
```

`npm install` attiva anche i ganci Git del progetto. Poi, in Claude Code:

| Comando | Cosa fa |
|---|---|
| `/inizia <descrizione>` | Aggiorna `main` e crea un ramo per il nuovo aggiornamento |
| `/sincronizza` | Porta nel ramo le ultime modifiche di `main`, unendo in modo ragionato quelle dell'altro |
| `/consegna` | Verifica, salva, carica e apre la pull request con unione automatica |
| `/integra` | Esamina e unisce le pull request aperte |
| `/stato` | Chi sta cambiando cosa |

Le regole complete sono in [`CLAUDE.md`](CLAUDE.md); il flusso di lavoro spiegato per le persone è in [`docs/COLLABORAZIONE.md`](docs/COLLABORAZIONE.md); la mappa del codice in [`docs/ARCHITETTURA.md`](docs/ARCHITETTURA.md).

## Verifiche

```bash
npm test
```

Controlli statici, test del motore di gioco (partite simulate con seme fisso) e prova nel browser.
