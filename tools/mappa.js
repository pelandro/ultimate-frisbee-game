#!/usr/bin/env node
/* Stampa la mappa aggiornata del codice: per ogni modulo, quante righe ha e quali funzioni contiene.
   Uso:  npm run mappa            (tutta la mappa)
         npm run mappa -- nome    (solo i moduli o le funzioni che contengono «nome») */
const fs=require('fs'),path=require('path'),{files,SRC}=require('./build');
const q=(process.argv[2]||'').toLowerCase();
for(const f of files()){
  const t=fs.readFileSync(path.join(SRC,f),'utf8'),n=t.split('\n').length-1;
  let names=[];
  if(/\.js$/.test(f))names=[...t.matchAll(/^(?:async\s+)?function\s+([\w$]+)/gm)].map(m=>m[1]);
  else if(/\.html$/.test(f))names=[...t.matchAll(/^<(?:div|canvas)[^>]*\bid="([\w$]+)"/gm)].map(m=>'#'+m[1]);
  if(q&&!f.toLowerCase().includes(q)&&!names.some(x=>x.toLowerCase().includes(q)))continue;
  console.log(`${f}  (${n} righe)`+(names.length?'\n    '+names.join(' '):''));
}
