---
description: Comincia un nuovo aggiornamento su un ramo pulito, partendo dall'ultima versione di main
argument-hint: <breve descrizione dell'aggiornamento>
---
Comincia un nuovo aggiornamento: $ARGUMENTS

1. Se ci sono modifiche non salvate, dimmelo e fermati (non spostarle né scartarle senza chiedere).
2. `git fetch origin`, poi `git switch main` e `git pull origin main`.
3. Crea il ramo `agg/<nome-breve-in-minuscolo-con-trattini>` ricavato dalla descrizione (`git switch -c ...`).
4. Leggi in `docs/ARCHITETTURA.md` quali moduli riguardano l'aggiornamento e apri solo quelli.
5. Controlla con `git branch -r` e `gh pr list` se l'altro sviluppatore ha un ramo o una pull request aperti sulla stessa area: se sì, dimmelo in una riga prima di cominciare.
6. Poi procedi con il lavoro richiesto. A lavoro finito usa `/consegna`.
