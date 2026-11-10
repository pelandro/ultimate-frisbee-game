#!/usr/bin/env bash
# Crea il repository GitHub PRIVATO del progetto, carica main e imposta le protezioni. Si esegue una volta sola.
#   Uso:  bash tools/setup-github.sh [nome-repository] [utente-GitHub-del-secondo-sviluppatore]
#   Serve la riga di comando di GitHub (gh) con accesso già fatto:  gh auth login
set -euo pipefail
NAME="${1:-ultimate-frisbee-game}"; COLLAB="${2:-}"
command -v gh >/dev/null || { echo "Manca «gh» (https://cli.github.com)"; exit 1; }
gh auth status >/dev/null || { echo "Esegui prima: gh auth login"; exit 1; }
OWNER="$(gh api user -q .login)"

if git remote get-url origin >/dev/null 2>&1; then
  echo "Il repository remoto esiste già: $(git remote get-url origin)"
  NAME="$(basename -s .git "$(git remote get-url origin)")"; OWNER="$(basename "$(dirname "$(git remote get-url origin)")")"; OWNER="${OWNER##*:}"
else
  gh repo create "$NAME" --private --source=. --remote=origin \
    --description "Ultimate Frisbee: gioco arcade 2D in stile retro"
fi
# primo caricamento di main (solo se il repository è ancora vuoto): l'unica volta in cui si carica main direttamente
if ! git ls-remote --exit-code --heads origin main >/dev/null 2>&1; then ALLOW_MAIN=1 git push -u origin main; fi

# pull request: unione automatica quando la verifica è verde, ramo cancellato dopo l'unione
gh repo edit "$OWNER/$NAME" --enable-auto-merge --delete-branch-on-merge --enable-squash-merge --enable-merge-commit >/dev/null \
  && echo "Unione automatica delle pull request: attiva"

# protezione di main: solo pull request, verifica obbligatoria e fatta sul risultato dell'unione, niente force push né cancellazione
if gh api -X PUT "repos/$OWNER/$NAME/branches/main/protection" --input - >/dev/null 2>&1 <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["verifica"] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
then echo "Protezione di main: attiva (pull request obbligatoria, verifica obbligatoria, niente force push)"
else
  echo "ATTENZIONE: GitHub non ha accettato la protezione di main."
  echo "  Sui repository privati serve un piano a pagamento (Pro/Team). Restano attivi i ganci locali e quelli di Claude Code,"
  echo "  che bloccano comunque push e commit su main; in alternativa rendi il repository pubblico (attenzione: contiene nomi di giocatori reali)."
fi

if [ -n "$COLLAB" ]; then
  gh api -X PUT "repos/$OWNER/$NAME/collaborators/$COLLAB" -f permission=push >/dev/null \
    && echo "Invito inviato a $COLLAB (deve accettarlo dalla posta o da github.com/notifications)"
fi
echo "Fatto: https://github.com/$OWNER/$NAME"
