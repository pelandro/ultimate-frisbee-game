#!/usr/bin/env node
/* Confronto tra due rami: chi ha cambiato cosa, e dove le due serie di modifiche si toccano.
   Serve PRIMA di unire: Git segnala solo le righe in conflitto, questo strumento segnala anche
     1. le stesse funzioni (o regole di stile, o elementi della pagina) cambiate da entrambi, anche in righe diverse;
     2. le dipendenze incrociate: una parte ha cambiato una funzione che l'altra parte usa in cio' che ha modificato;
     3. i «contratti» del gioco toccati (formato del salvataggio, statistiche, ganci tra motore e interfaccia...).
   Uso:  node tools/overlap.js [altro ramo, predefinito origin/main] [mio ramo, predefinito HEAD] [--json] [--strict]
         --strict  esce con codice 2 se la stessa funzione e' stata cambiata da entrambi */
const {execFileSync}=require('child_process');
const args=process.argv.slice(2).filter(a=>!a.startsWith('--')),flags=new Set(process.argv.slice(2).filter(a=>a.startsWith('--')));
const OTHER=args[0]||'origin/main',MINE=args[1]||'HEAD';
const git=(...a)=>{try{return execFileSync('git',a,{encoding:'utf8',maxBuffer:64*1024*1024,stdio:['ignore','pipe','pipe']});}catch(e){return null;}};
const base=(git('merge-base',MINE,OTHER)||'').trim();
if(!base){console.error(`Non trovo un antenato comune tra ${MINE} e ${OTHER} (hai fatto «git fetch origin»?)`);process.exit(1);}
// nomi che fanno da contratto tra parti diverse del gioco: se cambiano, l'altra parte va riletta anche senza conflitti
const CONTRACTS=['SAVE_V','squadData','setSquad','newPlayer','loadSave','persist','careerInit','KEYS','ROLE_W','HOOKS','SCREENS','showScreen','G','CATS','TRAITS','SIM_K','MATCH_TARGET','recordResult','newSeason','endSeason','startMatch','newGame','update'];
const cache={};
function lines(rev,file){const k=rev+':'+file;if(!(k in cache)){const t=git('show',k);cache[k]=t===null?null:t.split('\n');}return cache[k];}
function symbolsOf(rev,file){   // [{name,from,to}] sulle righe (1-based) di quella versione del file
  const L=lines(rev,file);if(!L)return [];
  const out=[];let cur={name:'(inizio del file)',from:1};
  const push=(name,i)=>{cur.to=i;if(cur.to>=cur.from)out.push(cur);cur={name,from:i+1};};
  L.forEach((l,i)=>{
    let m,name=null;
    if(/\.js$/.test(file)){
      if((m=l.match(/^(?:async\s+)?function\s*\*?\s*([\w$]+)/)))name=m[1];
      else if((m=l.match(/^(?:const|let|var)\s+[\[{]?\s*([\w$]+)/)))name=m[1];
      else if((m=l.match(/^\$\('([\w$]+)'\)\.addEventListener\('(\w+)'/)))name='#'+m[1]+':'+m[2];
      else if((m=l.match(/^(HOOKS\.\w+)\s*=/)))name=m[1];
    }else if(/\.css$/.test(file)){if((m=l.match(/^\s*([^{}@\/][^{}]*)\{/)))name=m[1].trim().slice(0,70);else if((m=l.match(/^\s*(@media[^{]*)\{/)))name=m[1].trim().slice(0,70);}
    else if(/\.html$/.test(file)){if((m=l.match(/^<(?:div|button|canvas)[^>]*\bid="([\w$]+)"/)))name='#'+m[1];}
    else if(/\.md$/.test(file)){if((m=l.match(/^#{1,3}\s+(.*)/)))name=m[1].slice(0,70);}
    if(name)push(name,i);   // i = indice 0-based della riga dove comincia il nuovo simbolo: il precedente finisce alla riga i (1-based)
  });
  cur.to=L.length;out.push(cur);return out;
}
function changed(rev){   // {file:{symbols:Set, added, removed, status}}
  const out={},d=git('diff','-U0','--no-color','-M',base,rev,'--','.',':(exclude)dist',':(exclude)package-lock.json');if(d===null)return out;
  let file=null,oldFile=null;
  for(const l of d.split('\n')){
    let m;
    if((m=l.match(/^--- (?:a\/(.*)|\/dev\/null)$/))){oldFile=m[1]||null;continue;}
    if((m=l.match(/^\+\+\+ (?:b\/(.*)|\/dev\/null)$/))){file=m[1]||oldFile;if(!out[file])out[file]={symbols:new Set(),added:0,removed:0,status:m[1]?(oldFile?'modificato':'nuovo'):'eliminato'};continue;}
    if(!(m=l.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/))||!file)continue;
    const os=+m[1],on=m[2]===undefined?1:+m[2],ns=+m[3],nn=m[4]===undefined?1:+m[4],f=out[file];f.added+=nn;f.removed+=on;
    const mark=(r,fl,s,n)=>{for(const y of symbolsOf(r,fl))if(y.from<=s+n-1&&y.to>=s)f.symbols.add(y.name);};
    if(nn>0)mark(rev,file,ns,nn);
    if(on>0&&oldFile)mark(base,oldFile,os,on);
  }
  return out;
}
function bodyOf(rev,file,name){const L=lines(rev,file);if(!L)return '';return symbolsOf(rev,file).filter(y=>y.name===name).map(y=>L.slice(y.from-1,y.to).join('\n')).join('\n');}
const A=changed(MINE),B=changed(OTHER);
const both=Object.keys(A).filter(f=>B[f]).sort();
const same=[],cross=[];
for(const f of both){const s=[...A[f].symbols].filter(x=>B[f].symbols.has(x)&&x!=='(inizio del file)');if(s.length)same.push({file:f,symbols:s});}
// dipendenze incrociate: un nome cambiato solo da una parte, usato nel codice che l'altra parte ha modificato
const idOk=n=>/^[A-Za-z_$][\w$]{3,}$/.test(n);
function crossDeps(X,Y,revY,who){
  const only=[];for(const f in X)for(const s of X[f].symbols)if(idOk(s)&&!(Y[f]&&Y[f].symbols.has(s)))only.push([f,s]);
  for(const g in Y){if(!/\.js$/.test(g))continue;
    for(const t of Y[g].symbols){const body=bodyOf(revY,g,t);if(!body)continue;
      for(const [f,s] of only)if(s!==t&&new RegExp('(^|[^\\w$.])'+s.replace(/\$/g,'\\$')+'\\s*\\(').test(body))cross.push({changed:s,in:f,usedBy:t,usedIn:g,who});}}
}
crossDeps(A,B,OTHER,'tu hai cambiato, l\'altro ramo usa');crossDeps(B,A,MINE,'l\'altro ramo ha cambiato, tu usi');
const contracts=[];for(const [X,who] of [[A,'tuo ramo'],[B,'altro ramo']])for(const f in X)for(const s of X[f].symbols)if(CONTRACTS.includes(s))contracts.push({name:s,file:f,who});
const report={base:base.slice(0,8),mine:MINE,other:OTHER,mineFiles:Object.keys(A).length,otherFiles:Object.keys(B).length,filesBoth:both,sameSymbols:same,crossDeps:cross,contracts};
if(flags.has('--json')){console.log(JSON.stringify(report,(k,v)=>v instanceof Set?[...v]:v,1));}
else{
  const show=(X,t)=>{console.log(`\n${t}: ${Object.keys(X).length} file`);for(const f of Object.keys(X).sort()){const s=[...X[f].symbols].filter(x=>x!=='(inizio del file)');console.log(`  ${f} (${X[f].status}, +${X[f].added} −${X[f].removed})${s.length?': '+s.slice(0,14).join(', ')+(s.length>14?` … e altri ${s.length-14}`:''):''}`);}};
  console.log(`Confronto ${MINE} ↔ ${OTHER} (antenato comune ${base.slice(0,8)})`);
  show(A,`Modifiche di ${MINE}`);show(B,`Modifiche di ${OTHER}`);
  console.log('\n— Punti di contatto —');
  if(!both.length)console.log('Nessun file in comune: le modifiche riguardano parti diverse.');
  else console.log('File cambiati da entrambi: '+both.join(', '));
  if(same.length){console.log('\nSTESSE FUNZIONI cambiate da entrambi (serve un\'integrazione ragionata, non la scelta di una versione):');for(const x of same)console.log(`  ${x.file}: ${x.symbols.join(', ')}`);}
  if(cross.length){console.log('\nDIPENDENZE INCROCIATE (nessun conflitto Git, ma la logica va riletta):');const seen=new Set();for(const c of cross){const k=c.changed+'|'+c.usedBy;if(seen.has(k))continue;seen.add(k);console.log(`  ${c.changed} (${c.in}) → usata da ${c.usedBy} (${c.usedIn}) — ${c.who}`);}}
  if(contracts.length){console.log('\nCONTRATTI del gioco toccati:');for(const c of contracts)console.log(`  ${c.name} (${c.file}) — ${c.who}`);}
  if(!same.length&&!cross.length&&!contracts.length)console.log('Nessuna sovrapposizione logica rilevata: l\'unione puo\' essere automatica (poi «npm test»).');
}
process.exit(flags.has('--strict')&&same.length?2:0);
