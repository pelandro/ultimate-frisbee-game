#!/usr/bin/env node
/* Test del motore di gioco, senza browser: prende il blocco di simulazione (tra SIM_START e SIM_END) ed esegue la suite del gioco
   (la stessa di Impostazioni > Diagnostica). Con lo stesso seme e lo stesso numero di partite i risultati sono identici.
   Uso:  node tools/test-sim.js [partite per gruppo, predefinito 6] [seme, predefinito 2026] */
const {build}=require('./build');
const nums=process.argv.slice(2).filter(a=>/^\d+$/.test(a)).map(Number),n=nums[0]||+(process.env.UF_N||6),seed=nums[1]===undefined?2026:nums[1];
const html=build(),a=html.indexOf('/*SIM_START*/'),b=html.indexOf('/*SIM_END*/');
if(a<0||b<0){console.error('Blocco di simulazione non trovato');process.exit(2);}
let api;
try{api=new Function(html.slice(a,b)+'\nreturn {selfTestPlan,selfTestRun,ROLE_W,KEYS};')();}
catch(e){console.error('Il blocco di simulazione non parte fuori dal browser: '+e.message);process.exit(1);}
let fail=0,tot=0;const t0=Date.now();
// contratti del motore che due modifiche indipendenti possono rompere senza conflitti Git
for(const r in api.ROLE_W){const w=api.ROLE_W[r],sum=Object.values(w).reduce((x,y)=>x+y,0),bad=Object.keys(w).filter(k=>!api.KEYS.includes(k));tot++;
  const ok=Math.abs(sum-1)<1e-6&&!bad.length;if(!ok)fail++;console.log(`  [${ok?'OK':'NO'}] Pesi dell'Overall per il ruolo ${r}: somma ${sum.toFixed(2)}${bad.length?' · statistiche sconosciute: '+bad.join(','):''}`);}
const S=api.selfTestPlan({n,seed});
console.log(`Test del motore: ${n} partite per gruppo, seme ${seed}`);
for(let i=0;i<S.steps.length;i++){
  console.log('== '+S.steps[i][0]);
  for(const r of api.selfTestRun(S,i)){tot++;if(!r.ok)fail++;console.log(`  [${r.ok?'OK':'NO'}] ${r.name}: ${r.val}${r.note?'  ('+r.note+')':''}`);}
}
console.log(`${tot-fail} controlli superati su ${tot} in ${((Date.now()-t0)/1000).toFixed(1)} s`);
process.exit(fail?1:0);
