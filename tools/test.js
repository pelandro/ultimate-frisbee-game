#!/usr/bin/env node
/* Tutte le verifiche in fila: controlli statici, motore di gioco, prova nel browser. Si ferma al primo gruppo che fallisce.
   Uso:  npm test          (verifica completa, circa un minuto)
         npm run test:rapido   (controlli statici + motore con poche partite, per i passi intermedi) */
const {spawnSync}=require('child_process'),path=require('path');
const quick=process.argv.includes('--rapido');
const steps=[['Controlli statici',['tools/check.js']],['Motore di gioco',['tools/test-sim.js',quick?'3':'6']]];
if(!quick)steps.push(['Prova nel browser',['tools/test-browser.js']]);
for(const [name,args] of steps){
  console.log('\n### '+name);
  const r=spawnSync(process.execPath,args,{cwd:path.join(__dirname,'..'),stdio:'inherit'});
  if(r.status!==0){console.error(`\nVERIFICA FALLITA: ${name}`);process.exit(r.status||1);}
}
console.log('\nVERIFICA SUPERATA'+(quick?' (rapida: manca la prova nel browser)':''));
