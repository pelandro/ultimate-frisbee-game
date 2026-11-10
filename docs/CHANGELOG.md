# Registro delle modifiche

Una riga per aggiornamento, dal punto di vista di chi gioca. Le righe nuove vanno in cima a «Non ancora pubblicato».
Questo file si unisce da solo quando due rami aggiungono righe (vedi `.gitattributes`).

## Non ancora pubblicato
- Strumenti: `node tools/pr.js unisci` aspetta da solo la verifica quando GitHub non offre l'unione automatica (repository privato con piano gratuito).
- Strumenti: le pull request si aprono e si uniscono con `node tools/pr.js`, che funziona anche nelle sessioni cloud di Claude Code.

## 1.0.0 — versione iniziale del repository
- Gioco completo: carriera (rosa, linee, allenamenti, mercato con giocatori internazionali, club, premi, albo d'oro, ritiri e avvisi), partita veloce, torneo, Ultimate Team, tutorial e sfide.
- Sorgente diviso in moduli con costruzione automatica del file unico e verifiche automatiche.
