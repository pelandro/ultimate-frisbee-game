#!/usr/bin/env node
/* Costruisce il gioco: un solo file HTML ottenuto concatenando i moduli di src/ in ordine alfabetico di percorso.
   Uso:  node tools/build.js            scrive dist/ultimate-frisbee.html
         require('./build').build()     restituisce il testo (usato dai test, senza scrivere nulla) */
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),SRC=path.join(ROOT,'src'),OUT=path.join(ROOT,'dist','ultimate-frisbee.html');
function files(dir=SRC,rel=''){
  let out=[];
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const r=rel?rel+'/'+e.name:e.name;
    if(e.isDirectory())out=out.concat(files(path.join(dir,e.name),r));
    else if(/\.(html|css|js)$/.test(e.name))out.push(r);
  }
  return out.sort((a,b)=>a<b?-1:a>b?1:0);   // ordine per codice dei caratteri: uguale su ogni sistema
}
// @@BUILD@@ nei sorgenti diventa la versione: data e commit quando costruisce GitHub (variabile UF_BUILD), «locale» sul proprio computer
function build(){return files().map(f=>fs.readFileSync(path.join(SRC,f),'utf8').replace(/\r\n/g,'\n')).join('').replace(/@@BUILD@@/g,process.env.UF_BUILD||'locale');}
module.exports={build,files,SRC,OUT,ROOT};
if(require.main===module){
  const html=build();fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,html);
  console.log(`Gioco costruito: ${path.relative(ROOT,OUT)} (${files().length} moduli, ${(html.length/1024).toFixed(0)} KB)`);
}
