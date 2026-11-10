#!/usr/bin/env node
/* Gancio di Claude Code (SessionStart): a inizio sessione dice a Claude in che stato e' il lavoro condiviso,
   cosi' la sincronizzazione parte da sola senza che nessuno debba ricordarsela. Non modifica nulla: legge soltanto. */
const {execFileSync}=require('child_process');
const git=(a,t)=>{try{return execFileSync('git',a,{encoding:'utf8',timeout:t||5000,stdio:['ignore','pipe','ignore']}).trim();}catch(e){return null;}};
if(git(['rev-parse','--is-inside-work-tree'])!=='true')process.exit(0);
const out=[],branch=git(['symbolic-ref','--short','-q','HEAD'])||git(['rev-parse','--abbrev-ref','HEAD'])||'?';
const hasRemote=!!git(['remote','get-url','origin']);
if(hasRemote)git(['fetch','--quiet','origin'],12000);
out.push(`Ramo attuale: ${branch}.`);
if(hasRemote&&git(['rev-parse','--verify','--quiet','origin/main'])){
  const cnt=(git(['rev-list','--left-right','--count','origin/main...HEAD'])||'0\t0').split(/\s+/).map(Number);
  if(branch==='main')out.push(cnt[0]?`main locale e' indietro di ${cnt[0]} commit: «git pull origin main» prima di creare un ramo.`:'main e\' aggiornato.');
  else{
    if(cnt[0])out.push(`ATTENZIONE: origin/main ha ${cnt[0]} commit nuovi rispetto a questo ramo (lavoro dell'altro sviluppatore). Prima di proseguire o consegnare esegui /sincronizza.`);
    else out.push('Il ramo contiene gia\' l\'ultima versione di main.');
    if(cnt[1])out.push(`Questo ramo ha ${cnt[1]} commit non ancora in main.`);
  }
  const others=(git(['for-each-ref','--format=%(refname:short) %(committerdate:relative)','refs/remotes/origin'])||'').split('\n').filter(l=>/^origin\/\S/.test(l)&&!/^origin\/(main|HEAD)\b/.test(l)&&!l.startsWith('origin/'+branch+' ')).slice(0,6);
  if(others.length)out.push('Altri rami aperti sul repository: '+others.join('; ')+'.');
}else if(!hasRemote)out.push('Nessun repository remoto configurato (origin): vedi docs/COLLABORAZIONE.md, «Primo avvio».');
if(branch==='main')out.push('Sei su main: per qualunque modifica crea prima un ramo (/inizia).');
const dirty=git(['status','--porcelain']);if(dirty)out.push(`Ci sono ${dirty.split('\n').length} file modificati non ancora salvati in un commit.`);
console.log('Stato del lavoro condiviso — '+out.join(' '));
