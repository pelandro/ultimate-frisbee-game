#!/usr/bin/env node
/* Prova dei ritratti (src/30-js/30-carriera/10b-avatar-dati.js e 10c-avatar-retro.js): i giocatori del foglio Overall hanno tutti il loro ritratto disegnato,
   la ricerca per nome funziona in entrambi gli ordini e senza accenti, i giocatori generati e le giocatrici non ne prendono uno per omonimia, il foglio
   dei disegni si decodifica con le misure giuste e il volto disegnato per tutti gli altri e' sempre valido, stabile e vario.
   Se Playwright non c'e' la prova viene saltata (in CI e' obbligatoria). */
const fs=require('fs'),os=require('os'),path=require('path'),{build}=require('./build');
let chromium;
try{({chromium}=require('playwright'));}
catch(e){if(process.env.CI){console.error('Playwright non installato');process.exit(1);}console.log('Prova dei ritratti saltata: Playwright non e\' installato');process.exit(0);}
const OUT=path.join(os.tmpdir(),'ultimate-avatar-'+process.pid+'.html');
(async()=>{
  let h=build();const i=h.lastIndexOf('})();');
  h=h.slice(0,i)+';window.__AV=()=>({avatar,avFind,avGrid,avLook,makeLook,OVR_2026,AVR_NAMES,AVR_COLS,AVR_SHEET,AVR_CLUB,AVR_SHIRT,mulberry32});'+h.slice(i);
  fs.writeFileSync(OUT,h);
  const browser=await chromium.launch(),page=await browser.newPage(),errs=[];
  page.on('pageerror',e=>errs.push('errore JavaScript: '+e.message));
  await page.goto('file://'+OUT);await page.waitForTimeout(400);
  const res=await page.evaluate(async()=>{
    const X=__AV(),bad=[];
    // 1) tutti i giocatori del foglio hanno un ritratto proprio, e due giocatori diversi non condividono lo sprite
    const seen=new Map(),nk=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();let tot=0;   // «Gaël» e «Gael» sono la stessa persona
    
    for(const [club,rows] of Object.entries(X.OVR_2026))for(const r of rows){tot++;const n=X.avFind({full:r[0]+' '+r[1],label:r[1]+' '+r[0],name:r[1]});
      if(n<0)bad.push('senza ritratto: '+r[1]+' '+r[0]+' ('+club+')');
      else{const k=r[1]+' '+r[0];if(seen.has(n)&&nk(seen.get(n))!==nk(k))bad.push('stesso ritratto per '+seen.get(n)+' e '+k);seen.set(n,k);}}
    // 2) la ricerca ignora ordine e accenti; i generati e le giocatrici non lo prendono
    const first=X.AVR_NAMES.split('~').find(k=>/[a-z]\|[a-z]/.test(k)).split('|');
    const a=X.avFind({label:first[0]+' '+first[1]}),b=X.avFind({full:first[1]+' '+first[0]}),c=X.avFind({name:first[1].toUpperCase()+' '+first[0]});
    if(!(a>=0&&a===b&&b===c))bad.push('ricerca per nome: '+a+', '+b+', '+c);
    if(X.avFind({label:first[0]+' '+first[1],gen:true})!==-1)bad.push('un giocatore generato non deve prendere un ritratto per omonimia');
    if(X.avFind({label:first[0]+' '+first[1],f:true})!==-1)bad.push('una giocatrice non deve prendere un ritratto per omonimia');
    if(X.avFind({})!==-1||X.avFind({label:'Nessuno Inesistente'})!==-1)bad.push('un nome sconosciuto deve dare -1');
    // 3) il foglio si decodifica con le misure attese
    const nSpr=X.AVR_NAMES.split('~').length,img=new Image();img.src=X.AVR_SHEET;
    try{await img.decode();}catch(e){bad.push('il foglio dei ritratti non si decodifica');}
    if(img.naturalWidth!==X.AVR_COLS*32||img.naturalHeight!==Math.ceil(nSpr/X.AVR_COLS)*32)bad.push('foglio '+img.naturalWidth+'x'+img.naturalHeight+' per '+nSpr+' sprite');
    // 4) il volto disegnato: sempre valido, stabile e vario
    const rng=X.mulberry32(7),sig=new Set();let n=0;
    for(let k=0;k<400;k++){
      const nm='Prova '+k+' '+Math.floor(rng()*1e6),f=rng()<0.3,p={full:nm,label:nm,name:nm,gen:true,f,look:X.makeLook(nm,f),club:rng()<0.5?'Club '+k%9:''};
      const g=X.avGrid(X.avLook(p));n++;
      if(g.length!==32||g.some(r=>r.length!==32||r.some(c=>typeof c!=='string'||!/^(#[0-9a-f]{6}|rgb\(\d+,\d+,\d+\))$/.test(c))))bad.push('griglia non valida per '+nm);
      for(const px of [26,46,54,84]){const s=X.avatar(p,px);if(!/^<svg/.test(s)||/NaN|undefined|null/.test(s))bad.push('SVG non valido per '+nm+' a '+px);}
      if(X.avatar(p,46)!==X.avatar(Object.assign({},p),46))bad.push('volto instabile per '+nm);
      sig.add(JSON.stringify(g));
    }
    if(sig.size<n*0.97)bad.push('troppi volti uguali: '+sig.size+' diversi su '+n);
    // 5) senza look (staff, allenatore) il disegno regge comunque
    for(const p of [{},{look:null},{full:'Solo Nome',gen:true}]){const s=X.avatar(p,46);if(!/^<svg/.test(s)||/NaN|undefined/.test(s))bad.push('ritratto senza look non valido');}
    return {bad,tot,nSpr,sig:sig.size};
  });
  await browser.close();fs.rmSync(OUT,{force:true});
  const bad=res.bad.concat(errs);
  if(bad.length){console.error('Prova dei ritratti: '+bad.length+' problemi');for(const b of bad.slice(0,30))console.error('  - '+b);process.exit(1);}
  console.log(`Prova dei ritratti: ok (${res.tot} giocatori del foglio con il loro ritratto su ${res.nSpr} disegnati, ${res.sig} volti diversi su 400 disegnati)`);
})();
