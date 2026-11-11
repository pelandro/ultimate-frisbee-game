#!/usr/bin/env node
/* Tutte le verifiche: controlli statici, poi motore di gioco e prova nel browser INSIEME (sono indipendenti: il tempo totale e' quello del piu' lento,
   non la somma). Si ferma se un gruppo fallisce; l'esito di ognuno si stampa per intero, uno dopo l'altro.
   Uso:  npm test                  (verifica completa, circa un minuto)
         npm run test:rapido       (controlli statici + motore con poche partite, per i passi intermedi)
         node tools/test.js --seriale   (uno alla volta, per cercare un problema) */
const {spawn,spawnSync}=require('child_process'),path=require('path');
const quick=process.argv.includes('--rapido'),serial=process.argv.includes('--seriale'),cwd=path.join(__dirname,'..');
const groups=[['Controlli statici',['tools/check.js']],['Motore di gioco',['tools/test-sim.js',quick?'3':'6']]];
if(!quick)groups.push(['Prova nel browser',['tools/test-browser.js']]);
const fail=name=>{console.error(`\nVERIFICA FALLITA: ${name}`);process.exit(1);};
const ok=()=>console.log('\nVERIFICA SUPERATA'+(quick?' (rapida: manca la prova nel browser)':''));
// 1) controlli statici da soli: se il codice non si carica, inutile provare il resto
console.log('\n### '+groups[0][0]);
let r=spawnSync(process.execPath,groups[0][1],{cwd,stdio:'inherit'});
if(r.status!==0)fail(groups[0][0]);
const rest=groups.slice(1);
if(serial||rest.length<2){
  for(const [name,args] of rest){console.log('\n### '+name);r=spawnSync(process.execPath,args,{cwd,stdio:'inherit'});if(r.status!==0)fail(name);}
  ok();
}else{
  // 2) motore e browser in parallelo: l'uscita di ognuno viene raccolta e mostrata a gruppi, senza mischiare le righe
  Promise.all(rest.map(([name,args])=>new Promise(res=>{
    let out='';const p=spawn(process.execPath,args,{cwd});
    p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);
    p.on('close',code=>res({name,out,code}));
  }))).then(rs=>{
    let bad=null;
    for(const x of rs){console.log('\n### '+x.name);process.stdout.write(x.out);if(x.code!==0&&!bad)bad=x.name;}
    if(bad)fail(bad);ok();
  });
}
