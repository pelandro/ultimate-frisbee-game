#!/usr/bin/env node
/* Prova del gioco in un browser vero (Playwright, Chromium senza finestra): apre il gioco costruito e attraversa i percorsi principali
   come farebbe un giocatore. Fallisce se compare un errore JavaScript o se una schermata non si apre.
   Se Playwright non e' installato la prova viene saltata (in CI invece e' obbligatoria). */
const fs=require('fs'),path=require('path'),{build,OUT}=require('./build');
let chromium;
try{({chromium}=require('playwright'));}
catch(e){
  if(process.env.CI){console.error('Playwright non installato: in CI la prova nel browser e\' obbligatoria');process.exit(1);}
  console.log('Prova nel browser saltata: Playwright non e\' installato (npm install && npx playwright install chromium)');process.exit(0);
}
(async()=>{
  fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,build());
  const browser=await chromium.launch(),errs=[],done=[];
  const page=await (await browser.newContext({viewport:{width:844,height:390}})).newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror',e=>errs.push('errore JavaScript: '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/font|net::ERR|Failed to load resource/i.test(m.text()))errs.push('console: '+m.text());});
  // gli avvisi della carriera si aprono da soli: li chiudo quando coprono cio' che sto per toccare
  await page.addLocatorHandler(page.locator('#alerts:not(.hidden) #alX'),async()=>{await page.click('#alX');});
  const vis=async(sel,what)=>{if(!(await page.locator(sel).isVisible()))throw new Error('non visibile: '+(what||sel));};
  const step=async(name,fn)=>{try{await fn();done.push(name);}catch(e){errs.push(name+': '+e.message.split('\n')[0]);}};
  const playOut=async()=>{   // gioca la partita in corso simulando una meta alla volta, gestendo schemi, cambi obbligati e half time
    for(let i=0;i<160;i++){
      if(await page.locator('#over').isVisible())return;
      if(await page.locator('#subs').isVisible()){if(await page.locator('#bSubAuto').isVisible())await page.click('#bSubAuto');await page.click('#bSubGo');continue;}
      if(await page.locator('#half').isVisible()){await page.click('#hCont');continue;}
      if(await page.locator('#menu').isVisible()){await page.click('#bGo');continue;}
      if(await page.locator('#bSimPt').isVisible()){await page.click('#bSimPt');await page.waitForTimeout(80);continue;}
      await page.waitForTimeout(500);
    }
    throw new Error('la partita non e\' arrivata alla fine');
  };
  await page.goto('file://'+OUT);await page.waitForTimeout(500);
  await step('menu iniziale, guida e impostazioni',async()=>{
    await vis('#title');await page.click('#tHelp');await vis('#guide');await page.click('#gdX');
    await page.click('#tSet');await vis('#settings');await page.click('#sBack');await vis('#title');
  });
  await step('nuova carriera e cruscotto',async()=>{
    await page.click('#tCareer');await vis('#team');await page.click('#tSr button[data-k="C"]');await page.click('.tteam >> nth=0');await page.waitForTimeout(300);await vis('#home');
  });
  await step('rosa, allenamenti, mercato, club, classifica, opzioni',async()=>{
    await page.click('#hRoster');await vis('#roster');await page.click('tr.pl >> nth=0');await vis('tr.dt');await page.click('#rBack');
    await page.click('#hTrain');await vis('#train');await page.click('#tTeamBox .ttype[data-team="tec"]');await vis('#tRes .tres');await page.click('#tBack');
    await page.click('#hMarket');await vis('#market');await page.click('#mkTabs [data-k="int"]');await page.click('#mkBack');
    await page.click('#hClub');await vis('#club');await page.click('#clTabs [data-k="hon"]');await page.click('#clTabs [data-k="rec"]');await page.click('#clBack');
    await page.click('#hEvent');await vis('#event');await page.click('#eBack');
    await page.click('#hOpt');await vis('#opts');await page.click('#opX');
    await page.click('#hBell');await vis('#alerts');   // lo chiude il gestore qui sopra alla prossima azione
  });
  await step('partite simulate dal cruscotto',async()=>{
    for(let i=0;i<2;i++){await page.click('#hSim');await vis('#simres');await page.click('#srOk');await page.waitForTimeout(100);}
  });
  await step('partita di carriera fino alla fine (con «Simula meta» e pausa)',async()=>{
    await page.click('#hPlay');await page.waitForTimeout(500);if(await page.locator('#menu').isVisible())await page.click('#bGo');
    await page.waitForTimeout(300);await page.click('#bExit');await vis('#pause');await page.click('#paGo');
    await playOut();await vis('#over');await page.click('#bAgain');await page.waitForTimeout(200);await vis('#home');
  });
  await step('il salvataggio resiste alla ricarica della pagina',async()=>{
    await page.reload();await page.waitForTimeout(500);
    const t=await page.locator('#tCareerS').innerText();if(!/Continua/.test(t))throw new Error('carriera non ritrovata dopo la ricarica: «'+t+'»');
  });
  await step('partita veloce: avvio, pausa, abbandono',async()=>{
    await page.click('#tQuick');await vis('#quick');await page.click('#qPlay');await page.waitForTimeout(500);
    await page.keyboard.press('Escape');await vis('#pause');await page.click('#paQuit');await page.click('#paQuit');await page.waitForTimeout(200);await vis('#quick');await page.click('#qBack');
  });
  await step('torneo personalizzato',async()=>{
    await page.click('#tTourn');await vis('#tourn');
    if(await page.locator('#tnGo').count()){await page.selectOption('#tnSize','4');await page.click('#tnGo');}
    await vis('.tncols');if(await page.locator('#tnSim').count()){await page.click('#tnSim');await vis('#simres');await page.click('#srOk');}
    await page.click('#tnBack');
  });
  await step('Ultimate Team: apertura del pacchetto',async()=>{
    await page.click('#tUT');await vis('#ut');
    if(await page.locator('#uPack').isVisible()){await page.click('#uPack');await page.click('#pkGo');await page.waitForTimeout(3400);await page.click('#pkGo');await page.waitForTimeout(200);}
    await vis('#ut');await page.click('#uBack');
  });
  await step('allenamento: il tutorial parte e si esce dalla pausa',async()=>{
    await page.click('#tSchool');await vis('#school');await page.click('[data-go="tut"]');await page.waitForTimeout(700);await vis('#coach');
    await page.click('#bExit');await vis('#pause');await page.click('#paQuit');await page.waitForTimeout(300);await vis('#school');
  });
  await browser.close();
  for(const d of done)console.log('  [OK] '+d);
  if(errs.length){console.error('Prova nel browser: '+errs.length+' problemi');for(const e of errs)console.error('  [NO] '+e);process.exit(1);}
  console.log('Prova nel browser: ok ('+done.length+' percorsi)');
})().catch(e=>{console.error('Prova nel browser interrotta: '+e.message);process.exit(1);});
