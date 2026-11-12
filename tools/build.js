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
/* ROTAZIONE AUTOMATICA (vedi src/30-js/90-avvio/00-rotazione.js): quando il telefono e' in verticale il gioco viene disegnato ruotato di 90 gradi
   dentro il <body>. Le media query e le unita' vh/vw guardano pero' lo schermo (verticale), non il riquadro ruotato (orizzontale): per questo il CSS viene
   trasformato qui, senza toccare i sorgenti, che restano scritti nel modo solito.
   - ogni @media su larghezza o altezza diventa anche @container uf (...) sul <body>, che e' il contenitore: vale sempre il riquadro in cui il gioco e' disegnato;
     la versione @media resta solo per i browser senza container query (@supports not);
   - ogni dichiarazione con vh o vw viene ripetuta con cqh e cqw (chi non li conosce usa la prima);
   - i margini di sicurezza env(safe-area-inset-*) passano da una variabile (--sa-*), che in rotazione scambia i lati. */
const SIZE_Q=/\((min-|max-)?(width|height|aspect-ratio)\b/;
function cqDecls(body){   // aggiunge accanto a ogni dichiarazione con vh/vw la sua copia in unita' del contenitore
  return body.replace(/([a-z-]+)\s*:\s*([^;{}]*\b\d*\.?\d+v[hw]\b[^;{}]*?)(\s*(?:!important)?)(?=;|})/g,(m,prop,val,imp)=>m+';'+prop+':'+val.replace(/(\d*\.?\d+)vh\b/g,'$1cqh').replace(/(\d*\.?\d+)vw\b/g,'$1cqw')+imp);
}
function blocks(css){   // elementi di primo livello: [testo prima della graffa, contenuto] oppure stringhe libere
  const out=[];let i=0;
  while(i<css.length){
    const o=css.indexOf('{',i);if(o<0){out.push(css.slice(i));break;}
    let d=1,j=o+1;while(j<css.length&&d){if(css[j]==='{')d++;else if(css[j]==='}')d--;j++;}
    out.push([css.slice(i,o),css.slice(o+1,j-1)]);i=j;
  }
  return out;
}
function cqify(css){
  return blocks(css).map(b=>{
    if(typeof b==='string')return b;
    const [head,body]=b,h=head.trim();
    if(/^@media/.test(h)&&SIZE_Q.test(h)){
      const cond=h.replace(/^@media\s*/,'');
      return `${head.slice(0,head.length-head.trimStart().length)}@supports not (container-type:size){${h}{${body}}}@container uf ${cond}{${cqDecls(body)}}`;
    }
    if(/^@(media|supports)/.test(h))return head+'{'+cqify(body)+'}';
    if(/^@/.test(h))return head+'{'+body+'}';   // @font-face, @keyframes: invariati
    return head+'{'+cqDecls(body)+'}';
  }).join('');
}
function rotReady(html){
  html=html.replace(/<style>([\s\S]*?)<\/style>/g,(m,css)=>'<style>'+cqify(css)+'</style>');
  return html.replace(/env\(safe-area-inset-(top|right|bottom|left)(,[^)]*)?\)/g,'var(--sa-$1,env(safe-area-inset-$1$2))');
}
function build(){return rotReady(files().map(f=>fs.readFileSync(path.join(SRC,f),'utf8').replace(/\r\n/g,'\n')).join('').replace(/@@BUILD@@/g,process.env.UF_BUILD||'locale').replace('@@ICONA@@','data:image/png;base64,'+require('./icona').png(64).toString('base64')));}
module.exports={build,files,SRC,OUT,ROOT};
if(require.main===module){
  const html=build();fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,html);
  for(const [n,b] of Object.entries(require('./icona').webFiles()))fs.writeFileSync(path.join(path.dirname(OUT),n),b);   // icone e manifest per la pagina web (il gioco offline funziona anche senza)
  console.log(`Gioco costruito: ${path.relative(ROOT,OUT)} (${files().length} moduli, ${(html.length/1024).toFixed(0)} KB)`);
}
