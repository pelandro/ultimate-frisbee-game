#!/usr/bin/env node
/* Controlli statici, veloci (meno di un secondo): colgono gli errori tipici di un'integrazione fatta male prima ancora di avviare il gioco.
   - segni di conflitto rimasti nei file, file senza a capo finale (romperebbero la concatenazione)
   - errori di sintassi e nomi dichiarati due volte (due sviluppatori che aggiungono la stessa costante)
   - blocco di simulazione senza accessi alla pagina
   - elementi con lo stesso id, riferimenti $('id') a elementi che non esistono */
const fs=require('fs'),path=require('path'),{build,files,SRC}=require('./build');
const errs=[],warn=[];
for(const f of files()){
  const t=fs.readFileSync(path.join(SRC,f),'utf8');
  if(/^(<<<<<<<|=======|>>>>>>>)( |$)/m.test(t))errs.push(`${f}: contiene segni di conflitto Git non risolti`);
  if(!t.endsWith('\n')&&f!=='99-coda.html')errs.push(`${f}: manca l'a capo finale`);
  if(/^30-js\/10-sim\//.test(f)&&/\b(document|window|localStorage|navigator)\s*\.|\$\(\s*['"]/.test(t))errs.push(`${f}: il blocco di simulazione non deve usare la pagina (document, window, localStorage, $())`);
}
const html=build(),a=html.indexOf('<script>'),b=html.lastIndexOf('</script>');
if(a<0||b<0)errs.push('manca il blocco <script>');
else{
  const js=html.slice(a+8,b);
  try{new Function(js);}catch(e){errs.push('JavaScript non valido: '+e.message+' (spesso: lo stesso nome dichiarato due volte dopo un merge)');}
  const s0=js.indexOf('/*SIM_START*/'),s1=js.indexOf('/*SIM_END*/');
  if(s0<0||s1<0||s1<s0)errs.push('marcatori /*SIM_START*/ e /*SIM_END*/ mancanti o in ordine sbagliato');
  // id duplicati nell'HTML statico e riferimenti a id inesistenti
  const stat=html.slice(0,a),ids=[...stat.matchAll(/\bid="([A-Za-z0-9_]+)"/g)].map(m=>m[1]);
  const dup=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];
  if(dup.length)errs.push('id duplicati nell\'HTML: '+dup.join(', '));
  const all=new Set([...html.matchAll(/\bid="([A-Za-z0-9_]+)"/g)].map(m=>m[1]));
  const DYN=['tnSize','tnPool','tnD','tnLen'];   // id creati da codice con un modello (non compaiono come id="..." nel sorgente)
  const miss=[...new Set([...js.matchAll(/\$\('([A-Za-z0-9_]+)'\)/g)].map(m=>m[1]))].filter(x=>!all.has(x)&&!DYN.includes(x));
  if(miss.length)errs.push("$('id') verso elementi che non esistono: "+miss.join(', '));
  if(!/const SAVE_V=\d+/.test(js))errs.push('manca la versione del salvataggio (SAVE_V)');
}
for(const w of warn)console.log('  avviso: '+w);
if(errs.length){console.error('Controlli statici: '+errs.length+' problemi');for(const e of errs)console.error('  - '+e);process.exit(1);}
console.log(`Controlli statici: ok (${files().length} moduli)`);
