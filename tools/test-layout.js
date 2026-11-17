#!/usr/bin/env node
/* Prova di impaginazione: apre le schermate principali a piu' risoluzioni (telefono piccolo e grande, interfaccia ingrandita, iPad, computer)
   e cerca i difetti che i test funzionali non vedono: elementi che escono dallo schermo, pulsanti che si sovrappongono,
   pulsanti troppo piccoli da toccare, pagine che scorrono di lato. Se Playwright non c'e' la prova viene saltata (in CI e' obbligatoria). */
const fs=require('fs'),os=require('os'),path=require('path'),{build}=require('./build');
let chromium;
try{({chromium}=require('playwright'));}
catch(e){if(process.env.CI){console.error('Playwright non installato');process.exit(1);}console.log('Prova di impaginazione saltata: Playwright non e\' installato');process.exit(0);}
const OUT=path.join(os.tmpdir(),'ultimate-impaginazione-'+process.pid+'.html');
// risoluzioni: uz = scelta «Dimensione dell'interfaccia» (1 automatica, 3 molto piu' grande); lo zoom non si tocca, si verifica soltanto
const SIZES=[{w:667,h:375,uz:1,m:1,n:'telefono piccolo'},{w:874,h:402,uz:1,m:1,n:'telefono grande'},{w:874,h:402,uz:3,m:1,n:'telefono, interfaccia molto piu\' grande'},{w:1180,h:820,uz:1,m:1,n:'iPad (automatica)'},{w:1180,h:820,uz:2,m:1,n:'iPad, interfaccia piu\' grande'},{w:1024,h:768,uz:1,m:0,n:'tablet 1024'},{w:1366,h:768,uz:1,m:0,n:'computer'}];
// il controllo gira nella pagina: guarda la finestra in primo piano (se c'e') oppure la schermata visibile e la cornice della carriera
const DET=()=>{
  const out=[],VW=innerWidth;
  const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'&&c.opacity!=='0';};
  const ov=[...document.querySelectorAll('.overlay:not(.hidden)')].filter(e=>!['tip','pp','rot'].includes(e.id)&&vis(e));
  const roots=ov.length?[ov[ov.length-1]]:[...document.querySelectorAll('.screen:not(.hidden)')].concat([...document.querySelectorAll('#cshell:not(.hidden)')]);
  const lab=e=>(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')+' «'+(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,24)+'»';
  for(const root of roots){
    for(const e of root.querySelectorAll('*')){
      if(!vis(e)||getComputedStyle(e).position==='fixed')continue;
      const r=e.getBoundingClientRect();
      let p=e.parentElement,clip=false;while(p&&p!==document.body){if(/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)){clip=true;break;}p=p.parentElement;}
      if(!clip&&(r.right>VW+2||r.left<-2))out.push('esce dallo schermo: '+lab(e));
    }
    const bs=[...root.querySelectorAll('button,select,input:not([type=hidden])')].filter(vis);
    for(const b of bs){
      const r=b.getBoundingClientRect(),z=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui'))||1;
      if(b.matches('.infb,.inf'))continue;   // area di tocco allargata con ::after (13-sistema-ui.css)
      if(b.type==='checkbox')continue;   // si tocca anche l'etichetta
      if(r.width<28*Math.min(z,1)||r.height<26*Math.min(z,1))out.push('pulsante troppo piccolo ('+Math.round(r.width)+'x'+Math.round(r.height)+'): '+lab(b));
    }
    for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){
      const a=bs[i].getBoundingClientRect(),b=bs[j].getBoundingClientRect();
      if(bs[i].contains(bs[j])||bs[j].contains(bs[i]))continue;
      const ox=Math.min(a.right,b.right)-Math.max(a.left,b.left),oy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
      if(ox>3&&oy>3)out.push('pulsanti sovrapposti: '+lab(bs[i])+' e '+lab(bs[j])+' ('+[a.top,a.bottom,b.top,b.bottom].map(Math.round).join(',')+')');
    }
    if(root.classList.contains('screen')&&root.scrollWidth>root.clientWidth+2)out.push('la schermata scorre di lato: #'+root.id+' ('+root.scrollWidth+' su '+root.clientWidth+')');
  }
  return [...new Set(out)].slice(0,12);
};
(async()=>{
  fs.writeFileSync(OUT,build());
  const browser=await chromium.launch(),errs=[];let checks=0;
  for(const S of SIZES){
    const ctx=await browser.newContext({viewport:{width:S.w,height:S.h},isMobile:!!S.m,hasTouch:!!S.m}),page=await ctx.newPage();page.setDefaultTimeout(8000);
    page.on('pageerror',e=>errs.push(S.n+': errore JavaScript: '+e.message));
    for(const [sel,btn] of [['#alerts:not(.hidden)','#alX'],['#tip:not(.hidden)','#tipOk'],['#intro:not(.hidden)','#inGo'],['#press:not(.hidden)','#prSkip']])await page.addLocatorHandler(page.locator(sel+' '+btn),async()=>{await page.click(btn);});
    await page.addLocatorHandler(page.locator('#evt:not(.hidden)'),async()=>{if(!(await page.locator('#evOk').isVisible()))await page.click('#evOpts button:not([disabled]) >> nth=0');await page.click('#evOk');});
    await page.goto('file://'+OUT);await page.waitForTimeout(300);
    await page.evaluate(uz=>{localStorage.setItem('ultimate-primi','{"d":[],"m":0,"off":1}');localStorage.setItem('ultimate-suggerimenti','0');localStorage.setItem('ultimate-settings',JSON.stringify({ci:2,cs:1,bs:2,ds:2,uz,rl:0,pos:null}));},S.uz);
    await page.reload();await page.waitForTimeout(400);
    const look=async name=>{await page.waitForTimeout(150);const r=await page.evaluate(DET);checks++;for(const x of r)errs.push(S.n+' · '+name+': '+x);};
    try{
      await look('menu iniziale');
      await page.click('#tSet');for(const [t,n] of [['#sTabGame','Impostazioni · Partita'],['#sTabCtl','Impostazioni · Comandi'],['#sTabScr','Impostazioni · Schermo e audio'],['#sGoDiag','Impostazioni · Avanzate']]){await page.click(t);await look(n);}await page.click('#sBack');
      await page.click('#tQuick');await look('partita veloce');await page.click('#qBack');
      await page.click('#tUT');await page.click('#umCpu');if(await page.locator('#uPack').isVisible()){await page.click('#uPack');await page.click('#pkGo');await page.waitForTimeout(3400);await page.click('#pkGo');}
      await page.click('#uEquip');await look('Ultimate Team · Equipaggiamento');await page.click('#eqBack');await page.click('#uBack');await page.click('#umBack');
      await page.click('#tCareer');await look('scelta del campionato');
      await page.click('#lgList [data-lg="IT"]');await look('scelta della squadra');
      await page.click('.tteam >> nth=0');await look('anteprima della rosa');
      await page.click('#rpGo');await look('allenatore');
      await page.click('#coRnd');await page.click('#coGo');await page.waitForTimeout(400);
      for(const [id,name] of [['#hHome','Partita'],['#hRoster','Squadra'],['#hTrain','Allena'],['#hMarket','Mercato'],['#hEvent','Lega'],['#hClub','Società']]){await page.click(id);await look(name);}
      await page.click('#hBell');await look('Posta');await page.click('#alX',{timeout:2000}).catch(()=>{});   // puo' averla gia' chiusa il gestore qui sopra
      await page.click('#hMenu');await look('menu della carriera');await page.click('#hOpt');await look('Opzioni');await page.click('#opX',{timeout:2000}).catch(()=>{});
    }catch(e){errs.push(S.n+': percorso interrotto: '+e.message.split('\n').slice(0,12).join(' | '));}
    await ctx.close();
  }
  await browser.close();try{fs.unlinkSync(OUT);}catch(e){}
  if(errs.length){console.error('Prova di impaginazione: '+errs.length+' problemi');for(const e of errs)console.error('  [NO] '+e);process.exit(1);}
  console.log('Prova di impaginazione: ok ('+checks+' schermate su '+SIZES.length+' risoluzioni)');
})().catch(e=>{console.error('Prova di impaginazione interrotta: '+e.message);process.exit(1);});
