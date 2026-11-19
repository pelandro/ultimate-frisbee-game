#!/usr/bin/env node
/* Prova di impaginazione: apre le schermate principali a piu' risoluzioni (telefono piccolo e grande, interfaccia ingrandita, iPad, computer)
   e cerca i difetti che i test funzionali non vedono: elementi che escono dallo schermo, pulsanti che si sovrappongono,
   pulsanti troppo piccoli da toccare, pagine che scorrono di lato. Se Playwright non c'e' la prova viene saltata (in CI e' obbligatoria). */
const fs=require('fs'),os=require('os'),path=require('path'),{build}=require('./build');
const titleMenu=async(pg,id)=>{if(!(await pg.locator(id).isVisible()))await pg.click('#tMore');await pg.click(id);};   // le voci Guida, Guida passo passo, Audio e Impostazioni stanno nel riquadro «Altro»
let chromium;
try{({chromium}=require('playwright'));}
catch(e){if(process.env.CI){console.error('Playwright non installato');process.exit(1);}console.log('Prova di impaginazione saltata: Playwright non e\' installato');process.exit(0);}
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'ultimate-impaginazione-'));
const OUT=path.join(folder,'gioco.html');
// risoluzioni: uz = scelta «Dimensione dell'interfaccia» (1 automatica, 3 molto piu' grande); lo zoom non si tocca, si verifica soltanto
const SIZES=[{w:667,h:375,uz:1,m:1,n:'telefono piccolo'},{w:874,h:402,uz:1,m:1,n:'telefono grande'},{w:874,h:402,uz:3,m:1,n:'telefono, interfaccia molto piu\' grande'},{w:1180,h:820,uz:1,m:1,n:'iPad (automatica)'},{w:1180,h:820,uz:2,m:1,n:'iPad, interfaccia piu\' grande'},{w:1024,h:768,uz:1,m:0,n:'tablet 1024'},{w:1366,h:768,uz:1,m:0,n:'computer'}];
// il controllo gira nella pagina: guarda la finestra in primo piano (se c'e') oppure la schermata visibile e la cornice della carriera
const DET=()=>{
  const out=[],VW=innerWidth,VH=innerHeight;
  let contrasts=0,targets=0,centres=0;
  function rgba(value){
    const parts=value.match(/[0-9.]+/g)?.map(Number)||[];
    if(value.startsWith('rgb'))return parts;
    if(value.startsWith('color(srgb '))return parts.map((n,i)=>i<3?n*255:n);
    return [];
  }
  const luminance=rgb=>rgb.slice(0,3).reduce((sum,value,i)=>{
    const v=value/255;
    return sum+[.2126,.7152,.0722][i]*(v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  },0);
  const blend=(fg,bg)=>bg.slice(0,3).map((v,i)=>v*(1-(fg[3]??1))+fg[i]*(fg[3]??1));
  function background(el){
    const layers=[];
    for(let p=el;p;p=p.parentElement){
      const style=getComputedStyle(p);
      // Una sfumatura o un’immagine richiede un controllo visivo separato.
      if(style.backgroundImage!=='none'||Number(style.opacity)<1)return null;
      const color=rgba(style.backgroundColor);
      if(color.length<3)continue;
      if((color[3]??1)===1)return layers.reduceRight((bg,fg)=>blend(fg,bg),color);
      if(color[3]>0)layers.push(color);
    }
    return null;
  }
  const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'&&c.opacity!=='0';};
  const ov=[...document.querySelectorAll('.overlay:not(.hidden)')].filter(e=>!['tip','pp','rot'].includes(e.id)&&vis(e)).sort((a,b)=>(Number(getComputedStyle(a).zIndex)||0)-(Number(getComputedStyle(b).zIndex)||0));
  const menu=document.querySelector('#cmenu:not(.hidden)');
  const roots=ov.length?[ov[ov.length-1]]:menu?[menu]:[...document.querySelectorAll('.screen:not(.hidden)')].concat([...document.querySelectorAll('#cshell:not(.hidden)')]);
  const lab=e=>(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')+' «'+(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,24)+'»';
  for(const root of roots){
    for(const e of root.querySelectorAll('*')){
      if(!vis(e)||getComputedStyle(e).position==='fixed')continue;
      const r=e.getBoundingClientRect();
      let p=e.parentElement,clip=false;while(p&&p!==document.body){if(/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)){clip=true;break;}p=p.parentElement;}
      if(!clip&&(r.right>VW+2||r.left<-2))out.push('esce dallo schermo: '+lab(e));
      if(e.matches('button,button *,label,label *,select,summary,summary *,[role=status],.note,.sub')&&
        !e.closest('[disabled],svg,[aria-hidden=true]')&&[...e.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim())){
        const c=getComputedStyle(e),bg=background(e),fg=rgba(c.color);
        if(bg&&fg.length>=3){
          contrasts++;
          const [a,b]=[luminance(blend(fg,bg)),luminance(bg)].sort((x,y)=>y-x);
          const ratio=(a+.05)/(b+.05),large=parseFloat(c.fontSize)>=(Number(c.fontWeight)>=700?18.6667:24);
          if(ratio+0.005<(large?3:4.5))out.push('contrasto '+ratio.toFixed(2)+': '+lab(e)+' ('+c.color+' / '+bg.slice(0,3).join(',')+')');
        }
      }
    }
    const bs=[...root.querySelectorAll('button,select,summary,input:not([type=hidden])')].filter(vis);
    for(const b of bs){
      const r=b.getBoundingClientRect(),z=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui'))||1;
      const x=(r.left+r.right)/2,y=(r.top+r.bottom)/2;
      if(b.disabled)continue;
      const cx=Math.max(0,Math.min(VW-1,x)),cy=Math.max(0,Math.min(VH-1,y));
      const hit=document.elementFromPoint(cx,cy);
      if(x===cx&&y===cy)centres++;
      if(x===cx&&y===cy&&hit!==b&&!b.contains(hit)){
        const occluder=hit?.closest('button,select,input,summary');
        if(occluder&&occluder!==b)out.push('centro coperto: '+lab(b)+' da '+lab(occluder));
      }
      if(b.type==='checkbox')continue; // la superficie interattiva include la label
      targets++;
      let width=r.width,height=r.height;
      if(b.matches('.infb,.inf')){
        const hitArea=getComputedStyle(b,'::after');
        width-=z*(parseFloat(hitArea.left)||0)+(parseFloat(hitArea.right)||0)*z;
        height-=z*(parseFloat(hitArea.top)||0)+(parseFloat(hitArea.bottom)||0)*z;
      }
      if(width<Math.max(24,28*Math.min(z,1))-.25||height<Math.max(24,26*Math.min(z,1))-.25)
        out.push('pulsante troppo piccolo ('+Math.round(width)+'x'+Math.round(height)+'): '+lab(b));
    }
    for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){
      const a=bs[i].getBoundingClientRect(),b=bs[j].getBoundingClientRect();
      if(bs[i].contains(bs[j])||bs[j].contains(bs[i]))continue;
      const ox=Math.min(a.right,b.right)-Math.max(a.left,b.left),oy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
      if(ox>3&&oy>3)out.push('pulsanti sovrapposti: '+lab(bs[i])+' e '+lab(bs[j])+' ('+[a.top,a.bottom,b.top,b.bottom].map(Math.round).join(',')+')');
    }
    if(root.classList.contains('screen')&&root.scrollWidth>root.clientWidth+2)out.push('la schermata scorre di lato: #'+root.id+' ('+root.scrollWidth+' su '+root.clientWidth+')');
  }
  return {errors:[...new Set(out)].slice(0,12),contrasts,targets,centres};
};
(async()=>{
  fs.writeFileSync(OUT,build());
  const browser=await chromium.launch(),errs=[];let checks=0,contrasts=0,targets=0,centres=0;
  for(const S of SIZES){
    const ctx=await browser.newContext({viewport:{width:S.w,height:S.h},isMobile:!!S.m,hasTouch:!!S.m}),page=await ctx.newPage();page.setDefaultTimeout(8000);
    page.on('pageerror',e=>errs.push(S.n+': errore JavaScript: '+e.message));
    for(const [sel,btn] of [['#alerts:not(.hidden)','#alX'],['#tip:not(.hidden)','#tipOk'],['#intro:not(.hidden)','#inGo'],['#press:not(.hidden)','#prSkip']])await page.addLocatorHandler(page.locator(sel+' '+btn),async()=>{await page.click(btn);});
    await page.addLocatorHandler(page.locator('#evt:not(.hidden)'),async()=>{if(!(await page.locator('#evOk').isVisible()))await page.click('#evOpts button:not([disabled]) >> nth=0');await page.click('#evOk');});
    await page.goto('file://'+OUT);await page.waitForTimeout(300);
    await page.evaluate(uz=>{localStorage.setItem('ultimate-primi','{"d":[],"m":0,"off":1}');localStorage.setItem('ultimate-suggerimenti','0');localStorage.setItem('ultimate-settings',JSON.stringify({ci:2,cs:1,bs:2,ds:2,uz,rl:0,pos:null}));},S.uz);
    await page.reload();await page.waitForTimeout(400);
    const look=async name=>{await page.waitForTimeout(150);const r=await page.evaluate(DET);checks++;contrasts+=r.contrasts;targets+=r.targets;centres+=r.centres;for(const x of r.errors)errs.push(S.n+' · '+name+': '+x);};
    try{
      await look('menu iniziale');
      await titleMenu(page,'#tHelp');await look('Guida');await page.click('#gdX');
      await page.click('#tSchool');await look('Allenamento e lezioni');await page.click('#scBack');
      await titleMenu(page,'#tSet');for(const [t,n] of [['#sTabGame','Impostazioni · Partita'],['#sTabCtl','Impostazioni · Comandi'],['#sTabScr','Impostazioni · Schermo e audio'],['#sGoDiag','Impostazioni · Avanzate']]){await page.click(t);await look(n);}await page.click('#sBack');
      await page.click('#tQuick');await look('partita veloce');await page.click('#qA');
      await look('catalogo squadre');await page.click('#qpX');await page.click('#qBack');
      await page.click('#tTourn');await look('configurazione torneo');await page.click('#tnBack');
      await page.click('#tUT');await page.click('#umCpu');if(await page.locator('#uPack').isVisible()){await page.click('#uPack');await page.click('#pkGo');await page.waitForTimeout(3400);await page.click('#pkGo');}
      await page.click('#uEquip');await look('Ultimate Team · Equipaggiamento');await page.click('#eqBack');await page.click('#uBack');await page.click('#umBack');
      await page.click('#tCareer');await look('scelta del campionato');
      await page.click('#lgList [data-div="m"]');await look('scelta del campionato maschile');
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
  await browser.close();try{fs.rmSync(folder,{recursive:true});}catch(e){}
  if(errs.length){console.error('Prova di impaginazione: '+errs.length+' problemi');for(const e of errs)console.error('  [NO] '+e);process.exit(1);}
  console.log(`Accessibilità: ${contrasts} verifiche di contrasto, ${targets} dimensioni, ${centres} centri interattivi.`);
  console.log('Prova di impaginazione: ok ('+checks+' schermate su '+SIZES.length+' risoluzioni)');
})().catch(e=>{console.error('Prova di impaginazione interrotta: '+e.message);process.exit(1);});
