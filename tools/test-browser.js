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
  // anche gli imprevisti compaiono da soli (di rado): scelgo la prima risposta possibile e chiudo
  await page.addLocatorHandler(page.locator('#evt:not(.hidden)'),async()=>{if(!(await page.locator('#evOk').isVisible()))await page.click('#evOpts button:not([disabled]) >> nth=0');await page.click('#evOk');});   // risponde e chiude: Playwright aspetta che il riquadro sparisca
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
  await step('diagnostica: carriera di prova di 12 stagioni',async()=>{
    await page.click('#tSet');await vis('#settings');await page.click('#sGoDiag');await page.click('#dgCar');
    await page.waitForFunction(()=>/^Finito/.test(document.getElementById('dgState').textContent),null,{timeout:120000});
    const no=await page.locator('#dgOut li').filter({hasText:/^NO/}).allInnerTexts(),n=await page.locator('#dgOut li').count();
    await page.click('#sBack');await page.click('#sBack').catch(()=>{});await vis('#title');   // si torna al menu anche se un controllo e' fallito
    if(no.length)throw new Error('controlli della carriera falliti: '+no.join(' | '));
    if(n<8)throw new Error('il test della carriera ha dato pochi risultati');
    if(/Continua/.test(await page.locator('#tCareerS').innerText()))throw new Error('il test della carriera ha lasciato una carriera salvata');
  });
  await step('nuova carriera e cruscotto',async()=>{
    await page.click('#tCareer');await vis('#team');await page.click('#tSr button[data-k="C"]');await page.click('.tteam >> nth=0');await page.waitForTimeout(300);await vis('#home');
  });
  await step('vento: si spegne e si riaccende dalle opzioni, il cruscotto si aggiorna',async()=>{
    const meteo=async()=>/Meteo:/.test(await page.locator('#home').innerText());
    if(!(await meteo()))throw new Error('il cruscotto non annuncia il meteo');
    await page.click('#hOpt');await vis('#opts');await page.click('#opWind');
    if(!/no/.test(await page.locator('#opWind').innerText()))throw new Error('il vento non si spegne');
    await page.click('#opX');if(await meteo())throw new Error('con il vento spento il cruscotto non deve annunciare il meteo');
    await page.click('#hOpt');await page.click('#opWind');
    if(!/sì/.test(await page.locator('#opWind').innerText()))throw new Error('il vento non si riaccende');
    await page.click('#opX');if(!(await meteo()))throw new Error('riacceso il vento il meteo deve tornare');
  });
  await step('rosa, allenamenti, mercato, club, classifica, opzioni',async()=>{
    await page.click('#hRoster');await vis('#roster');await page.click('tr.pl >> nth=0');await vis('tr.dt');
    if(await page.locator('.dspec button[data-spec]').count()!==6)throw new Error('gli indirizzi di sviluppo devono essere sei');
    if(!(await page.locator('tr.dt .scr').isVisible()))throw new Error('manca il rapporto di scouting nella scheda');
    await page.click('#rBack');
    await page.click('#hTrain');await vis('#train');await page.click('#tTeamBox [data-int="2"]');
    if(!/Intenso/.test(await page.locator('.tint small').innerText()))throw new Error('l\'intensità dell\'allenamento non cambia');
    await page.click('#tTeamBox [data-int="1"]');await page.click('#tTeamBox .ttype[data-team="tec"]');await vis('#tRes .tres');await page.click('#tBack');
    await page.click('#hMarket');await vis('#market');await page.click('[data-rp] >> nth=0');await vis('#mkBox .scr');await page.click('#mkTabs [data-k="int"]');await page.click('#mkBack');
    await page.click('#hClub');await vis('#club');if(await page.locator('#clBox .fac').count()!==10)throw new Error('devono esserci sei strutture e quattro figure dello staff');
    if(await page.locator('#clBox [data-staff]').count()!==4)throw new Error('le figure dello staff devono essere quattro');
    await page.click('#clTabs [data-k="hon"]');await page.click('#clTabs [data-k="rec"]');await page.click('#clBack');
    await page.click('#hEvent');await vis('#event');await page.click('#evTabs [data-sr="A"]');await page.click('#evTabs [data-sr="B"]');await vis('#eBody table.rt');
    const trs=await page.locator('#eBody table.rt tr').count();if(trs<8)throw new Error('classifica di un\'altra serie troppo corta: '+trs);
    await page.click('#eBack');
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
  await step('partita sospesa: si salva, resiste alla ricarica e si riprende dal punteggio salvato',async()=>{
    await vis('#home');await page.click('#hPlay');await page.waitForTimeout(500);if(await page.locator('#menu').isVisible())await page.click('#bGo');
    for(let i=0;i<2;i++){await page.waitForSelector('#bSimPt:not(.hidden)',{timeout:20000});await page.click('#bSimPt');await page.waitForTimeout(150);}
    await page.waitForSelector('#bExit:not(.hidden)');await page.waitForTimeout(3500);   // finisce la fascia della meta
    for(let i=0;i<30&&!(await page.locator('#pause').isVisible());i++){await page.keyboard.press('Escape');await page.waitForTimeout(250);}
    await vis('#pause');await page.click('#paSusp');await vis('#home');
    const t=await page.locator('#hPlayT').innerText(),sub=await page.locator('#hPlayS').innerText();
    if(!/Riprendi/.test(t))throw new Error('dopo la sospensione il cruscotto non propone di riprendere: '+t);
    const sc=(sub.match(/(\d+)–(\d+)/)||[]).slice(1).map(Number);if(sc.length!==2||sc[0]+sc[1]<1)throw new Error('punteggio sospeso non valido: '+sub);
    await page.reload();await page.waitForTimeout(500);
    if(!/sospesa/.test(await page.locator('#tCareerS').innerText()))throw new Error('dopo la ricarica la partita sospesa non c\'e\' piu\'');
    await page.click('#tCareer');await vis('#home');await page.click('#hPlay');await page.waitForTimeout(600);if(await page.locator('#menu').isVisible())await page.click('#bGo');
    const s2=(await page.locator('#score').innerText()).match(/(\d+)\s*[–-]\s*(\d+)/);
    if(!s2||+s2[1]!==sc[0]||+s2[2]!==sc[1])throw new Error('ripresa con un punteggio diverso: '+(s2?s2[0]:'?')+' invece di '+sc.join('-'));
    await playOut();await vis('#over');await page.click('#bAgain');await page.waitForTimeout(200);await vis('#home');
    if(/Riprendi/.test(await page.locator('#hPlayT').innerText()))throw new Error('a partita finita resta una sospensione');
  });
  await step('slot carriera: una seconda carriera e il ritorno alla prima',async()=>{
    const team1=(await page.locator('#tCareerS').innerText().catch(()=>''));
    await vis('#home');const name1=await page.locator('#home .dname').first().innerText();
    await page.click('#hOpt');await vis('#opts');if(await page.locator('#opSlots [data-slot]').count()!==3)throw new Error('gli slot devono essere tre');
    await page.click('#opSlots [data-slot="2"]');await vis('#team');await page.click('#tSr button[data-k="B"]');await page.click('.tteam >> nth=3');await page.waitForTimeout(300);await vis('#home');
    const name2=await page.locator('#home .dname').first().innerText();if(name2===name1)throw new Error('lo slot 2 ha la stessa squadra dello slot 1');
    await page.click('#hOpt');await page.click('#opSlots [data-slot="1"]');await page.waitForTimeout(300);await vis('#home');
    const back=await page.locator('#home .dname').first().innerText();if(back!==name1)throw new Error('tornando allo slot 1 la carriera non e\' quella di prima: '+back);
  });
  await step('il salvataggio resiste alla ricarica della pagina',async()=>{
    await page.reload();await page.waitForTimeout(500);
    const t=await page.locator('#tCareerS').innerText();if(!/Continua/.test(t))throw new Error('carriera non ritrovata dopo la ricarica: «'+t+'»');
  });
  await step('partita veloce: avvio, pausa, abbandono',async()=>{
    await page.click('#tQuick');await vis('#quick');await page.click('#qPlay');await page.waitForTimeout(500);
    await page.keyboard.press('Escape');await vis('#pause');await page.click('#paQuit');await page.click('#paQuit');await page.waitForTimeout(200);await vis('#quick');await page.click('#qBack');
  });
  await step('pull a tempo, difesa automatica e tasto «Salta»',async()=>{
    await page.click('#tQuick');await vis('#quick');await page.selectOption('#qS','1');await page.click('#qPlay');await page.waitForTimeout(500);
    if(await page.locator('#menu').isVisible())await page.click('#bGo');
    const hint=async re=>{await page.waitForFunction(r=>{const h=document.getElementById('hint');return !h.classList.contains('hidden')&&new RegExp(r).test(h.textContent);},re);};
    await hint('POTENZA');await page.waitForTimeout(700);await page.mouse.click(420,150);   // primo tocco: potenza
    await hint('DIREZIONE');await page.waitForTimeout(350);await page.mouse.click(420,150);   // secondo tocco: direzione, il pull parte
    await page.waitForSelector('#bSkipD:not(.hidden)',{timeout:25000});
    if(await page.locator('#bThrow').isVisible())throw new Error('in difesa automatica il tasto dell\'handblock non deve comparire');
    await page.click('#bSkipD');await page.waitForTimeout(300);
    if(await page.locator('#bSkipD').isVisible())throw new Error('dopo «Salta» il possesso avversario deve essere finito');
    // se gli avversari hanno segnato scorre lo stacco della meta: la pausa si apre appena si torna a giocare
    for(let i=0;i<40&&!(await page.locator('#pause').isVisible());i++){await page.keyboard.press('Escape');await page.waitForTimeout(250);}
    await vis('#pause');
    const lab=async()=>(await page.locator('#paDef').innerText()).toLowerCase();
    if(!/automatica/.test(await lab()))throw new Error('difesa predefinita non automatica: '+await lab());
    await page.click('#paDef');if(!/manuale/.test(await lab()))throw new Error('la difesa non passa a manuale');
    await page.click('#paDef');await page.click('#paDef');if(!/automatica/.test(await lab()))throw new Error('la difesa non torna automatica');
    await page.click('#paQuit');await page.click('#paQuit');await page.waitForTimeout(200);await vis('#quick');await page.selectOption('#qS','0');await page.click('#qBack');
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
  await step('Ultimate Team: potenziamenti specializzati',async()=>{
    await page.evaluate(()=>{const o=JSON.parse(localStorage.getItem('ultimate-ut')||'null');if(o){o.coins=900;localStorage.setItem('ultimate-ut',JSON.stringify(o));}});
    await page.reload();await page.waitForTimeout(500);
    await page.click('#tUT');await vis('#ut');await page.click('#uTeam');await vis('#utTeam');
    await page.click('#tmMode [data-m="up"]');await page.click('#tmList .urow[data-i] >> nth=0');await vis('#tmUp');
    if(await page.locator('#tmUp [data-ul]').count()!==4)throw new Error('i potenziamenti devono essere quattro (Tiro, Atletico, Difesa, Mani e testa)');
    await page.click('#tmUp [data-ul="d"]');
    if(!/potenziato \(Difesa\)/.test(await page.locator('#tmInfo').innerText()))throw new Error('il potenziamento non e\' stato applicato: '+await page.locator('#tmInfo').innerText());
    await page.click('#tmBack');await page.click('#uBack');
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
