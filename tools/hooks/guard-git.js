#!/usr/bin/env node
/* Gancio di Claude Code (PreToolUse su Bash): ferma i comandi Git che violano le regole del progetto.
   - mai «git push» verso main (main cambia solo con le pull request), mai force push su main
   - mai commit o merge fatti stando su main
   - conferma esplicita per i comandi che possono cancellare lavoro (reset --hard, clean, branch -D, cancellazione di rami remoti)
   Legge da stdin il JSON del comando; risponde con la decisione. Non fa nulla per i comandi che non riguardano Git. */
const {execFileSync}=require('child_process');
let raw='';process.stdin.on('data',d=>raw+=d).on('end',()=>{
  let cmd='';try{cmd=String((JSON.parse(raw).tool_input||{}).command||'');}catch(e){}
  if(!/\b(git|gh)\b/.test(cmd))return;
  const out=(decision,reason)=>{console.log(JSON.stringify({hookSpecificOutput:{hookEventName:'PreToolUse',permissionDecision:decision,permissionDecisionReason:reason}}));process.exit(0);};
  let branch='';try{branch=execFileSync('git',['symbolic-ref','--short','-q','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch(e){}   // vale anche prima del primo commit
  const onMain=branch==='main'||branch==='master';
  for(const part of cmd.split(/&&|\|\||;|\n|\|/)){
    const c=part.trim().replace(/^(?:[A-Z_]+=\S+\s+)+/,'');
    if(/^git\s+push\b/.test(c)){
      const force=/(^|\s)(--force|-f|--force-with-lease(=\S+)?|--mirror)(\s|$)/.test(c)||/\s\+\S+/.test(c);
      const toMain=/(^|[\s:+])(main|master)(\s|$)/.test(c)||(onMain&&!/\s(origin|upstream)\s+\S+/.test(c));
      if(toMain&&force)out('deny','Regola del progetto: mai force push su main. Le modifiche entrano in main solo con una pull request.');
      if(toMain)out('deny','Regola del progetto: non si fa push diretto su main. Crea un ramo (/inizia), poi apri una pull request (/consegna).');
      if(/(^|\s)(--force|-f)(\s|$)/.test(c))out('deny','Usa «--force-with-lease» sul tuo ramo, mai «--force»: cosi\' non sovrascrivi lavoro altrui gia\' caricato. Di norma non serve: il progetto unisce con merge, senza rebase.');
      if(/(^|\s)--delete(\s|$)|\s:\S+/.test(c))out('ask','Stai per cancellare un ramo remoto: conferma che non contiene lavoro non ancora integrato.');
    }
    if(/^git\s+commit\b/.test(c)&&onMain)out('deny','Sei su main: non si fanno commit diretti. Crea prima un ramo con «git switch -c agg/nome-breve» (oppure /inizia).');
    if(/^git\s+(merge|rebase|cherry-pick)\b/.test(c)&&onMain&&!/--abort|--continue/.test(c))out('deny','Sei su main: l\'integrazione si fa nel ramo di lavoro (git merge origin/main) e poi con la pull request, non unendo dentro main in locale.');
    if(/^git\s+(reset\s+--hard|clean\s+-\w*f|checkout\s+(--\s|\.\s*$)|restore\s+(?!--staged))/.test(c))out('ask','Questo comando scarta modifiche non salvate: conferma che non si perde lavoro.');
    if(/^git\s+branch\s+-D\b/.test(c))out('ask','Stai per cancellare un ramo anche se non e\' stato unito: conferma.');
    if(/^gh\s+pr\s+merge\b/.test(c)&&/--admin/.test(c))out('deny','Non si aggirano i controlli di main con --admin: la pull request si unisce quando la verifica e\' verde.');
  }
});
