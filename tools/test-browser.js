#!/usr/bin/env node
/* Prova del gioco in un browser vero (Playwright, Chromium senza finestra): apre il gioco costruito e attraversa i percorsi principali
   come farebbe un giocatore. Fallisce se compare un errore JavaScript o se una schermata non si apre.
   Se Playwright non e' installato la prova viene saltata (in CI invece e' obbligatoria). */
const fs=require('fs'),os=require('os'),path=require('path'),{build}=require('./build');
let chromium;
try{({chromium}=require('playwright'));}
catch(e){
  if(process.env.CI){console.error('Playwright non installato: in CI la prova nel browser e\' obbligatoria');process.exit(1);}
  console.log('Prova nel browser saltata: Playwright non e\' installato (npm install && npx playwright install chromium)');process.exit(0);
}
(async()=>{
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'ultimate-browser-'));
  process.on('exit',()=>fs.rmSync(folder,{recursive:true,force:true}));
  const OUT=path.join(folder,'gioco.html');
  fs.writeFileSync(OUT,build().replace('const hasSave=loadSave();','window.testSaves=saveStore;window.testImport=importSave;const hasSave=loadSave();'));
  const browser=await chromium.launch(),errs=[],done=[];
  const page=await (await browser.newContext({viewport:{width:844,height:390}})).newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror',e=>errs.push('errore JavaScript: '+e.message+' ('+String(e.stack||'').split('\n').slice(1,3).map(x=>x.trim().replace(/^at /,'').replace(/\(.*[\/\\]/,'(')).join(' < ')+')'));   // anche dove succede: gli errori casuali si possono cercare
  page.on('console',m=>{if(m.type()==='error'&&!/font|net::ERR|Failed to load resource/i.test(m.text()))errs.push('console: '+m.text());});
  // gli avvisi della carriera si aprono da soli: li chiudo quando coprono cio' che sto per toccare
  await page.addLocatorHandler(page.locator('#alerts:not(.hidden) #alX'),async()=>{await page.click('#alX');});
  // anche gli imprevisti compaiono da soli (di rado): scelgo la prima risposta possibile e chiudo
  await page.addLocatorHandler(page.locator('#evt:not(.hidden)'),async()=>{if(!(await page.locator('#evOk').isVisible()))await page.click('#evOpts button:not([disabled]) >> nth=0');await page.click('#evOk');});   // risponde e chiude: Playwright aspetta che il riquadro sparisca
  // i fumetti di primo accesso della carriera (Rosa, Mercato, Club...) si chiudono con «OK»
  await page.addLocatorHandler(page.locator('#tip:not(.hidden) #tipOk'),async()=>{await page.click('#tipOk');});
  // il cartello di presentazione delle partite che contano (derby, finali) si chiude con un tocco
  await page.addLocatorHandler(page.locator('#intro:not(.hidden) #inGo'),async()=>{await page.click('#inGo');});
  // la conferenza stampa dopo le partite che contano si salta con un tocco
  await page.addLocatorHandler(page.locator('#press:not(.hidden) #prSkip'),async()=>{await page.click('#prSkip');});
  const vis_=async(pg,sel)=>{if(!(await pg.locator(sel).isVisible()))throw new Error('non visibile: '+sel);};
  const vis=async(sel,what)=>{if(!(await page.locator(sel).isVisible()))throw new Error('non visibile: '+(what||sel));};
  const menu=async id=>{for(let i=0;i<3;i++){if(!(await page.locator('#cmenu').isVisible()))await page.click('#hMenu');try{await page.click(id,{timeout:3000});return;}catch(e){}}await page.click(id);};   // i fumetti e gli imprevisti che si aprono da soli chiudono il menu: si riapre   // Opzioni, Guida, Tutorial e «Menu principale» stanno nel menu della barra in alto
  const step=async(name,fn)=>{
    try{await fn();done.push(name);}
    catch(e){
      const visible=await page.locator('.screen:not(.hidden),.overlay:not(.hidden)').evaluateAll(elements=>
        elements.filter(el=>getComputedStyle(el).display!=='none').map(el=>el.id)).catch(()=>[]);
      errs.push(name+': '+(process.env.TB_FULL?e.message.split('\n').slice(0,8).join(' | '):e.message.split('\n')[0])+' · schermate aperte: '+visible.join(', '));
      try{if(await page.locator('#tut:not(.hidden)').count())await page.click('#tuX',{timeout:2000});}catch(_){}
    }
  };
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
  // il tutorial «Primi passi» ferma il gioco con le sue schede: nella pagina di prova e' spento (tranne nella prova che lo verifica, in un contesto a parte).
  // Si scrive a pagina caricata e poi si ricarica: uno script iniziale che scrive nel localStorage prima del caricamento, in Chromium, a volte fa perdere i dati dopo una ricarica
  await page.evaluate(()=>localStorage.setItem('ultimate-primi','{"d":[],"m":0,"off":1}'));await page.reload();await page.waitForTimeout(500);
  await step('menu iniziale, guida e impostazioni',async()=>{
    await vis('#title');await page.click('#tHelp');await vis('#guide');await page.click('#gdX');
    await page.click('#tSet');await vis('#settings');await page.click('#sBack');await vis('#title');
  });
  await step('tutorial completo dal menu: capitoli, lezioni, progressi salvati, Esc e ingresso dalla Guida',async()=>{
    await page.click('#tTut');await vis('#tut');
    if(await page.locator('#tuBody .tuc').count()!==6)throw new Error('il tutorial deve avere 6 capitoli');
    await page.click('#tuBody .tuc >> nth=0');await vis('#tuBody .tul >> nth=0');
    await page.click('#tuBody .tul >> nth=0');
    if(!(await page.locator('#tuBody .tubody').count()))throw new Error('la lezione non si apre');
    await page.click('#tuBody .tunav .go');await page.waitForTimeout(100);
    let st=await page.evaluate(()=>JSON.parse(localStorage.getItem('ultimate-tutorial')||'{}'));
    if(Object.keys(st).length<2)throw new Error('le lezioni lette devono restare salvate: '+JSON.stringify(st));
    await page.keyboard.press('Escape');await page.waitForTimeout(100);
    if(await page.locator('#tut:not(.hidden)').count())throw new Error('Esc deve chiudere il tutorial');
    await page.click('#tHelp');await vis('#guide');await page.click('#gdTut');await vis('#tut');
    if(await page.locator('#guide:not(.hidden)').count())throw new Error('aprendo il tutorial la Guida deve chiudersi');
    await page.click('#tuBody .tuc >> nth=0');await page.click('#tuBody [data-tu^="h"]');   // dal capitolo si torna all'indice
    if(await page.locator('#tuBody .tuc').count()!==6)throw new Error('«Tutti i capitoli» deve riportare all\'indice');
    await page.click('#tuX');await vis('#title');
  });
  await step('schermo: l\'interfaccia si adatta (telefono invariato, iPad e computer piu\' grandi) e si puo\' regolare',async()=>{
    const ui=p=>p.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui')));
    const bz=p=>p.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bz')));
    if(await ui(page)!==1||await bz(page)!==1)throw new Error('sul telefono (844x390) l\'ingrandimento deve restare 1');
    for(const [w,h,min,max] of [[1180,820,1.5,1.75],[1366,1024,1.75,2],[1920,950,2,2.5]]){   // iPad, iPad Pro, computer
      const c=await browser.newContext({viewport:{width:w,height:h}}),p=await c.newPage();
      await p.goto('file://'+OUT);await p.waitForTimeout(400);
      const u=await ui(p),b=await bz(p),big=await p.evaluate(()=>document.documentElement.dataset.big);
      await c.close();
      if(u<min||u>max||b<1.5||big!=='1')throw new Error(w+'x'+h+': ingrandimento '+u+' (atteso '+min+'-'+max+'), pulsanti '+b);
    }
    // scelta del giocatore: «Molto piu' grande» sul telefono = 1,5, poi si torna all'automatico
    await page.click('#tSet');await vis('#settings');await page.click('#sTabScr');
    await page.click('#sUz button[data-i="3"]');await page.waitForTimeout(150);if(await ui(page)!==1.5)throw new Error('«Molto piu\' grande» deve portare il telefono a 1,5');
    if(!(await page.evaluate(()=>document.documentElement.dataset.ew)))throw new Error('con l\'interfaccia ingrandita lo spazio utile stretto deve attivare le disposizioni compatte (data-ew)');
    await page.click('#sUz button[data-i="0"]');await page.waitForTimeout(150);if(await ui(page)!==0.75)throw new Error('«Piu\' piccola» deve portare il telefono a 0,75');
    await page.click('#sUz button[data-i="1"]');await page.waitForTimeout(150);if(await ui(page)!==1)throw new Error('«Automatica» deve riportare il telefono a 1');
    await page.click('#sRl button[data-i="1"]');if(await page.evaluate(()=>document.documentElement.dataset.rail)!=='r')throw new Error('«A destra» deve spostare la colonna della carriera');
    await page.click('#sRl button[data-i="2"]');if(await page.evaluate(()=>document.documentElement.dataset.rail)!=='l')throw new Error('«A sinistra» deve mettere la colonna a sinistra');
    await page.click('#sRl button[data-i="0"]');if(await page.evaluate(()=>document.documentElement.dataset.rail)!=='l')throw new Error('«Automatica» senza ritaglio dello schermo deve lasciare la colonna a sinistra');
    await page.click('#sBack');await vis('#title');   // le schede non hanno sottolivelli: un solo «Indietro»
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
  await step('diagnostica: campionato USA (32 club, 4 Conference, Play-in, Nationals, 4 carriere da 6 stagioni)',async()=>{
    await page.click('#tSet');await vis('#settings');await page.click('#sGoDiag');await page.click('#dgUs');
    await page.waitForFunction(()=>/^Finito/.test(document.getElementById('dgState').textContent),null,{timeout:120000});
    const no=await page.locator('#dgOut li').filter({hasText:/^NO/}).allInnerTexts(),n=await page.locator('#dgOut li').count();
    await page.click('#sBack');await page.click('#sBack').catch(()=>{});await vis('#title');
    if(no.length)throw new Error('controlli del campionato USA falliti: '+no.join(' | '));
    if(n<12)throw new Error('il test USA ha dato pochi risultati');
    if(/Continua/.test(await page.locator('#tCareerS').innerText()))throw new Error('il test USA ha lasciato una carriera salvata');
  });
  await step('divisione femminile: carriera e partita veloce solo tra squadre femminili, testi al femminile',async()=>{
    await page.click('#tCareer');await vis('#league');
    if(await page.locator('#lgList [data-div]').count()!==2)throw new Error('prima del campionato si sceglie la divisione (maschile o femminile)');
    if(await page.locator('#lgList [data-lg="IW"]').count())throw new Error('il campionato femminile non deve stare tra i campionati maschili');
    await page.click('#lgList [data-div="w"]');await vis('#team');
    const tn=await page.locator('#tTeams .tteam').allInnerTexts();if(!tn.length||!tn.some(t=>/Tequila Boom Boom/.test(t))||tn.some(t=>/La Fotta/.test(t)))throw new Error('squadre femminili sbagliate: '+tn.slice(0,3).join(' | '));
    await page.click('#tTeams .tteam >> nth=0');await vis('#rpv');if(!/giocatrici/.test(await page.locator('#rpS').innerText()))throw new Error('nella rosa femminile si parla di giocatrici');
    await page.keyboard.press('Tab');
    if(!await page.evaluate(()=>!!document.activeElement.closest('#rpv')))throw new Error('il focus è uscito dalla rosa');
    await page.keyboard.press('Escape');await page.locator('#rpv').waitFor({state:'hidden'});
    await page.click('#teamBack');await vis('#league');
    if(!/divisione/i.test(await page.locator('#lgH').innerText()))throw new Error('dal femminile «Indietro» torna alla scelta della divisione');
    await page.click('#lgList [data-div="m"]');if(!(await page.locator('#lgList [data-lg="IT"]').count()))throw new Error('manca il campionato italiano maschile');
    await page.click('#lgBack');await page.click('#lgBack');await vis('#title');
    await page.click('#tQuick');await vis('#quick');await page.click('#qDiv [data-v="w"]');
    if(!/Women/.test(await page.locator('#qAP').innerText())||!/Women/.test(await page.locator('#qBP').innerText()))throw new Error('partita veloce femminile con una squadra maschile');
    await page.evaluate(()=>{
      const sample=document.createElement('p');sample.id='women-copy-test';
      sample.textContent='I titolari · il difensore · giocatori infortunati';
      sample.setAttribute('aria-label','Ricevitore selezionato');
      document.getElementById('quick').append(sample);
    });
    await page.waitForFunction(()=>document.getElementById('women-copy-test').textContent==='Le titolari · la difensora · giocatrici infortunate');
    if(await page.locator('#women-copy-test').getAttribute('aria-label')!=='Ricevitrice selezionata')throw new Error('Etichetta accessibile Women non aggiornata');
    await page.click('#qA');const tb=await page.locator('#qpTabs button').count();await page.click('#qpX');if(tb!==2)throw new Error('nel femminile le linguette sono Serie A e Serie B');
    await page.click('#qDiv [data-v="m"]');if(/Women/.test(await page.locator('#qAP').innerText())||/giocatrici/.test(await page.locator('#qDP').innerText()))throw new Error('tornando al maschile resta qualcosa del femminile');
    await page.waitForFunction(()=>document.getElementById('women-copy-test').textContent==='I titolari · il difensore · giocatori infortunati');
    if(await page.locator('#women-copy-test').getAttribute('aria-label')!=='Ricevitore selezionato')throw new Error('Etichetta accessibile originale non ripristinata');
    await page.evaluate(()=>document.getElementById('women-copy-test').remove());
    await page.click('#qBack');await vis('#title');
  });
  await step('carriera USA dall\'interfaccia: Italia/USA, Conference, club, allenatore, Classifica a tre viste, partita simulata',async()=>{
    await page.click('#tCareer');await vis('#league');await page.click('#lgList [data-div="m"]');if(await page.locator('#lgList .lgcard').count()<2)throw new Error('servono le schede dei campionati');await page.click('#lgList [data-lg="US"]');await vis('#team');
    if(await page.locator('#tSr button').count()!==8)throw new Error('servono le 8 Conference');
    await page.click('#tSr button[data-k="NE"]');
    if(await page.locator('.tteam').count()!==6)throw new Error('ogni Conference ha 6 club');
    await page.click('.tteam >> nth=1');await vis('#rpv');
    if(await page.locator('#rpBody tr').count()<15)throw new Error('il roster del club deve elencare i giocatori');
    await page.click('#rpFav');await page.click('#rpX');
    if(!/★/.test(await page.locator('.tteam >> nth=0').innerText()))throw new Error('la squadra del cuore deve stare in cima, con la stella');
    await page.click('.tteam >> nth=0');await vis('#rpv');await page.click('#rpGo');await vis('#coachsel');await page.click('#coGo');await page.waitForTimeout(300);await vis('#home');
    if(!/Conference/.test(await page.locator('#hInfo').innerText()))throw new Error('il cruscotto non mostra la Conference');
    await page.click('#hEvent');await vis('#event');
    {const up=await page.locator('#eBody .rt tr.up').count(),pi=await page.locator('#eBody .rt tr.pi').count(),dn=await page.locator('#eBody .rt tr.dn').count();if(up<1||up>2||pi>4||up+pi+dn!==6)throw new Error('zone Nationals / Play-in / eliminate non evidenziate ('+up+'/'+pi+'/'+dn+')');}
    for(const k of ['nat','rank','conf'])await page.click('#usTabs [data-ut="'+k+'"]');
    await page.click('#hHome');await vis('#home');await page.click('#hSim');await vis('#simres');await page.click('#srOk');await vis('#home');
    await menu('#hOpt');await page.click('#opX');
    await page.evaluate(()=>{localStorage.removeItem('ultimate-cuore');window.testSaves.removeItem('ultimate-prototipo-v2');for(const k of [1,2,3])window.testSaves.removeItem('ultimate-carriera-'+k);});await page.reload();await page.waitForTimeout(500);
    await page.evaluate(()=>localStorage.setItem('ultimate-primi','{"d":[],"m":0,"off":1}'));await page.reload();await page.waitForTimeout(500);
  });
  await step('diagnostica: leghe europee (Belgio, Francia, Germania, Regno Unito: dati, rose, formati, promozioni, coppa europea)',async()=>{
    await page.click('#tSet');await vis('#settings');await page.click('#sGoDiag');await page.click('#dgLn');
    await page.waitForFunction(()=>/^Finito/.test(document.getElementById('dgState').textContent),null,{timeout:240000});
    const no=await page.locator('#dgOut li').filter({hasText:/^NO/}).allInnerTexts(),n=await page.locator('#dgOut li').count();
    await page.click('#sBack');await page.click('#sBack').catch(()=>{});await vis('#title');
    if(no.length)throw new Error('controlli delle leghe europee falliti: '+no.join(' | '));
    if(n<12)throw new Error('il test delle leghe europee ha dato pochi risultati');
    if(/Continua/.test(await page.locator('#tCareerS').innerText()))throw new Error('il test delle leghe europee ha lasciato una carriera salvata');
  });
  await step('carriera in Belgio dall\'interfaccia: paese, livello, club, roster, allenatore, Classifica a tre viste, partita simulata',async()=>{
    await page.click('#tCareer');await vis('#league');await page.click('#lgList [data-div="m"]');if(await page.locator('#lgList .lgcard').count()<6)throw new Error('servono le schede dei sei campionati');await page.click('#lgList [data-lg="BE"]');await vis('#team');
    if(await page.locator('#tSr button').count()!==6)throw new Error('servono i 6 livelli belgi');
    await page.click('#tSr button[data-k="N1"]');
    if(await page.locator('.tteam').count()!==8)throw new Error('la N1 belga ha 8 club');
    await page.click('.tteam >> nth=0');await vis('#rpv');
    if(await page.locator('#rpBody tr').count()<15)throw new Error('il roster del club deve elencare i giocatori');
    await page.click('#rpGo');await vis('#coachsel');await page.click('#coGo');await page.waitForTimeout(300);await vis('#home');
    if(!/Belgio/.test(await page.locator('#hInfo').innerText()))throw new Error('il cruscotto non mostra il campionato');
    await page.click('#hEvent');await vis('#event');
    if(await page.locator('#eBody .rt tr.up').count()!==4)throw new Error('il girone da 4 deve avere tutte le squadre nella zona del tabellone');
    for(const k of ['fin','tiers','grp'])await page.click('#lnTabs [data-lt="'+k+'"]');
    await page.click('#hHome');await vis('#home');await page.click('#hSim');await vis('#simres');await page.click('#srOk');await vis('#home');
    await page.evaluate(()=>{localStorage.removeItem('ultimate-cuore');window.testSaves.removeItem('ultimate-prototipo-v2');for(const k of [1,2,3])window.testSaves.removeItem('ultimate-carriera-'+k);});await page.reload();await page.waitForTimeout(500);
    await page.evaluate(()=>localStorage.setItem('ultimate-primi','{"d":[],"m":0,"off":1}'));await page.reload();await page.waitForTimeout(500);
  });
  await step('nuova carriera e cruscotto',async()=>{
    await page.click('#tCareer');await vis('#league');await page.click('#lgList [data-div="m"]');await page.click('#lgList [data-lg="IT"]');await vis('#team');await page.click('#tSr button[data-k="C"]');await page.click('.tteam >> nth=0');await vis('#rpv');await page.click('#rpGo');await vis('#coachsel');
    // schermata dell'allenatore: personaggio casuale, volto e nomi scelti a mano, anteprima che segue
    await page.click('#coRnd');if(!(await page.inputValue('#coN'))||!(await page.inputValue('#coS')))throw new Error('«Personaggio casuale» deve riempire nome e cognome');
    if(await page.locator('#coFaces button').count()!==12)throw new Error('i volti devono essere dodici');
    await page.click('#coFaces button >> nth=3');await page.fill('#coN','Giulia');await page.fill('#coS','Rossi');
    if(!/Giulia Rossi/i.test(await page.locator('#coName').innerText()))throw new Error('l\'anteprima non segue il nome');
    await page.click('#coGo');await page.waitForTimeout(300);await vis('#home');
    if(!(await page.locator('#hCoach svg.av').count()))throw new Error('manca il volto dell\'allenatore nel cruscotto');
    if(!(await page.locator('#ctop .ctcash .coin').count()))throw new Error('manca la moneta di fianco ai crediti nella barra in alto');   // i crediti stanno nella barra in alto (sul cruscotto erano un doppione)
  });
  await step('tutorial completo dal cruscotto: il fumetto della schermata Partita viene prima di sponsor e Posta, «Scopri di più» e tasto Tutorial',async()=>{
    // carriera appena iniziata: si apre per primo il fumetto della schermata Partita; sponsor e Posta aspettano che si chiuda
    if(!(await page.locator('#tip:not(.hidden)').count()))throw new Error('a carriera appena iniziata deve aprirsi per primo il fumetto della schermata Partita');
    if(await page.locator('#evt:not(.hidden), #alerts:not(.hidden)').count())throw new Error('sponsor o Posta aperti insieme al fumetto della schermata Partita');
    await page.evaluate(()=>document.getElementById('tipMore').click());await vis('#tut');   // click dalla pagina: il gestore automatico dei fumetti chiuderebbe il fumetto con «OK»
    if(!/schermata Partita/i.test(await page.locator('#tuH').innerText()))throw new Error('«Scopri di più» deve aprire la lezione sulla schermata Partita: '+await page.locator('#tuH').innerText());
    await page.evaluate(()=>document.getElementById('tuX').click());await page.waitForTimeout(300);
    if(!(await page.locator('#evt:not(.hidden)').count()))throw new Error('chiuso il fumetto deve arrivare la scelta dello sponsor');
    // ogni sponsor ha il suo marchio (18-cartelloni.js): i tre della scelta mostrano il cartellone (che ogni nome abbia il marchio lo controlla check.js)
    if(await page.locator('#evOpts .spb').count()!==3)throw new Error('la scelta dello sponsor deve mostrare i tre cartelloni');
    await vis('#home');await menu('#hTut');await vis('#tut');await page.click('#tuX');await vis('#home');
  });
  await step('allenatore e staff: cambio nome dal cruscotto, candidati, assunzione e rinnovo dell\'elenco',async()=>{
    await page.click('#hCoach');await vis('#coachsel');await page.fill('#coS','Bianchi');await page.click('#coGo');await vis('#home');
    if(!/Bianchi/.test(await page.locator('#hCoach').getAttribute('title')))throw new Error('il cambio di nome non arriva al cruscotto');
    await page.click('#hClub');await vis('#club');
    await page.click('#clTabs [data-k="stf"]');if(await page.locator('#clBox .scard.empty').count()!==3)throw new Error('a inizio carriera i tre ruoli dello staff devono essere vacanti');
    await page.click('#clBox [data-hire="fit"]');await vis('#hire');
    if(await page.locator('#hireList .hcn').count()!==3)throw new Error('i candidati devono essere tre');
    const first=await page.locator('#hireList .hcn .sr').first().innerText();
    await page.click('#hireRenew');if(await page.locator('#hireList .hcn').count()!==3)throw new Error('dopo il rinnovo i candidati devono essere ancora tre');
    await page.click('#hireList [data-hirei]:not([disabled]) >> nth=0');
    await vis('#cfm');await page.click('#cfmOk');
    if(await page.locator('#hire:not(.hidden)').count())throw new Error('assunto: la finestra deve chiudersi');
    if(await page.locator('#clBox .scard:not(.empty)').count()!==1)throw new Error('dopo l\'assunzione deve esserci una persona nello staff');
    await page.click('#hHome');await vis('#home');
  });
  await step('vento: si spegne e si riaccende dalle Impostazioni (aperte dalle Opzioni della carriera), il cruscotto si aggiorna',async()=>{
    const meteo=async()=>/Meteo:/.test(await page.locator('#home').innerText());
    if(!(await meteo()))throw new Error('il cruscotto non annuncia il meteo');
    const wind=async()=>{await menu('#hOpt');await vis('#opts');await page.click('#opSet');await vis('#settings');
      if(!(await page.locator('#sWind').isVisible()))throw new Error('dalle Opzioni le Impostazioni devono aprirsi sulla scheda Partita');
      await page.click('#sWind');const v=await page.locator('#sWind').getAttribute('aria-checked');await page.click('#sBack');await vis('#home');return v;};
    if(await wind()!=='false')throw new Error('il vento non si spegne (interruttore)');
    if(await meteo())throw new Error('con il vento spento il cruscotto non deve annunciare il meteo');
    if(await wind()!=='true')throw new Error('il vento non si riaccende (interruttore)');
    if(!(await meteo()))throw new Error('riacceso il vento il meteo deve tornare');
  });
  await step('rosa, allenamenti, mercato, club, classifica, opzioni',async()=>{
    await page.click('#hRoster');await vis('#roster');await page.click('#rBox [data-rv="t"]');await page.click('tr.pl >> nth=0');await vis('tr.dt');await page.click('#rBox [data-dtab="svi"]');   // gli indirizzi e il rapporto degli osservatori stanno nella parte «Sviluppo» della scheda
    if(await page.locator('.dspec button[data-spec]').count()!==6)throw new Error('gli indirizzi di sviluppo devono essere sei');
    if(!(await page.locator('tr.dt .scr').isVisible()))throw new Error('manca il rapporto di scouting nella scheda');
    await page.click('#hHome');
    await page.click('#hTrain');await vis('#train');await page.click('#tTeamBox [data-int="2"]');
    if(!/Intenso/.test(await page.locator('.tint .sg.on').innerText()))throw new Error('l\'intensità dell\'allenamento non cambia');
    await page.click('#tTeamBox [data-int="1"]');
    if(!/punti/.test(await page.locator('#tTeamBox .ttype[data-team="tec"] .fc').innerText()))throw new Error('manca l\'anteprima della seduta di squadra');
    await page.click('#tTeamBox .ttype[data-team="tec"]');await page.waitForTimeout(100);
    if(await page.locator('#tRes .tres').count())throw new Error('la seduta di squadra parte senza conferma');
    if(!(await page.locator('#tTeamBox .tcf').isVisible()))throw new Error('manca il riquadro di conferma della seduta');
    await page.click('#tTeamBox [data-trgo]');await vis('#tRes .tres');
    await page.click('#tTeamBox [data-prog]');if(!/Acceso/.test(await page.locator('#tTeamBox [data-prog]').innerText()))throw new Error('il programma automatico non si accende');
    if(await page.locator('#tList .prow:not([disabled])').count()>await page.locator('#tList .prow').count()-3)throw new Error('il programma automatico non ha fatto i lavori individuali');
    await page.click('#tTeamBox [data-prog]');await page.click('#hHome');
    await page.click('#hMarket');await vis('#market');await page.click('[data-rp] >> nth=0');await vis('#mkBox .scr');await page.click('#mkTabs [data-k="int"]');await page.click('#hHome');
    await page.click('#hClub');await vis('#club');await page.click('#clTabs [data-k="man"]');{const t=await page.locator('#clBox').innerText();if(!/Sponsor e obiettivo/i.test(t)||!/a ogni partita/.test(t)||!/Conti delle partite/i.test(t))throw new Error('la scheda Società deve mostrare lo sponsor scelto e i conti delle partite: '+t.replace(/\s+/g,' ').slice(0,900));}await page.click('#clTabs [data-k="str"]');if(await page.locator('#clBox .bgr').count()<6)throw new Error('manca il bilancio previsionale');if(await page.locator('#clBox .fbar').count()!==3)throw new Error('devono esserci tre strutture');await page.click('#clTabs [data-k="stf"]');if(await page.locator('#clBox .scard').count()!==3)throw new Error('devono esserci tre figure dello staff');
    // le altre linguette del Club: traguardi (ventidue schede, percentuale), albo d'oro e Hall of Fame
    await page.click('#clTabs [data-k="hon"]');await page.click('#clSub [data-k="ach"]');if(await page.locator('#clBox .ach').count()!==22||!/%/.test(await page.locator('#clBox .achbig').innerText()))throw new Error('i traguardi devono essere ventidue, con la percentuale');
    await page.click('#clSub [data-k="hon"]');if(await page.locator('#clBox .trt').count()<7)throw new Error('manca la bacheca dei trofei');
    await page.click('#clSub [data-k="rec"]');if(await page.locator('#clBox .hofbox').count()!==1)throw new Error('manca la Hall of Fame');
    await page.click('#clTabs button[data-k="stf"]');
    if(await page.locator('#clBox .scard').count()!==3||await page.locator('#clBox [data-hire]').count()<3)throw new Error('le figure dello staff devono essere tre, ciascuna con «Cambia» o «Scegli chi assumere»');
    await page.click('#clTabs [data-k="hon"]');await page.click('#clSub [data-k="rec"]');await page.click('#hHome');
    await page.click('#hEvent');await vis('#event');await page.click('#evTabs [data-sr="A"]');await page.click('#evTabs [data-sr="B"]');await vis('#eBody table.rt');
    const trs=await page.locator('#eBody table.rt tr').count();if(trs<8)throw new Error('classifica di un\'altra serie troppo corta: '+trs);
    await page.click('#eBody [data-evpage="calendar"]');
    if(!/Prossima|Da giocare/.test(await page.locator('#eBody').innerText()))throw new Error('calendario senza prossime partite');
    await page.click('#eBody [data-evpage="stats"]');await vis('#eBody [data-evpage="stats"][aria-current="page"]');
    await page.click('#eBody [data-evpage="final"]');await vis('#eBody [data-evpage="final"][aria-current="page"]');
    await page.click('#eBody [data-evpage="table"]');await vis('#eBody table.rt');
    await page.click('#hHome');
    await menu('#hOpt');await vis('#opts');await page.click('#opX');
    await page.click('#hBell');await vis('#alerts');   // lo chiude il gestore qui sopra alla prossima azione
  });
  await step('Posta: «Chiudi» non segna come letto, «Segna tutto come letto» sì; Mercato: conferma prima di comprare; Allena: lavoro individuale in due passi',async()=>{
    // una notizia nuova di sicuro: un avviso non urgente scritto nel salvataggio, poi ricarica
    await page.evaluate(()=>{const k='ultimate-prototipo-v2',d=JSON.parse(window.testSaves.getItem(k));d.alerts=d.alerts||[];d.alN=(d.alN|0)+1;d.alerts.unshift({id:d.alN,s:d.season,r:1,k:'grow',txt:'Prova di lettura',full:'',act:'',data:null,seen:0,done:0,sh:1});window.testSaves.setItem(k,JSON.stringify(d));if(d.slot)window.testSaves.setItem('ultimate-carriera-'+d.slot,JSON.stringify(d));});
    await page.reload();await page.waitForTimeout(500);await page.click('#tCareer');await vis('#home');
    // qui i tocchi passano da evaluate: il gestore in cima alla prova chiuderebbe la Posta prima di ogni click
    const unread=async()=>(await page.locator('#alBody .ali.new').count()),tap=id=>page.evaluate(i=>document.getElementById(i).click(),id);
    await tap('hBell');await vis('#alerts');const n0=await unread();if(n0<1)throw new Error('la notizia di prova non risulta nuova');
    await tap('alX');await tap('hBell');await vis('#alerts');
    if(await unread()!==n0)throw new Error('«Chiudi» ha segnato le notizie come lette');
    await tap('alAll');if(await unread())throw new Error('«Segna tutto come letto» non ha segnato tutto');
    await tap('alX');
    // mercato: con i crediti per comprare, «Acquista» apre il riepilogo; «Annulla» non compra niente
    await page.evaluate(()=>{const k='ultimate-prototipo-v2',d=JSON.parse(window.testSaves.getItem(k));d.cash=5000;window.testSaves.setItem(k,JSON.stringify(d));if(d.slot)window.testSaves.setItem('ultimate-carriera-'+d.slot,JSON.stringify(d));});
    await page.reload();await page.waitForTimeout(500);await page.click('#tCareer');await vis('#home');
    await page.click('#hMarket');await vis('#market');
    const buy=page.locator('#mkBox [data-buy]:not([disabled])').first();
    if(await buy.count()){
      const r0=await page.locator('#mkTop').innerText();
      await buy.click();await vis('#cfm');if(!/Stipendi/.test(await page.locator('#cfmBody').innerText()))throw new Error('il riepilogo dell\'acquisto non mostra lo stipendio');
      await page.click('#cfmNo');if(await page.locator('#cfm:not(.hidden)').count())throw new Error('«Annulla» non chiude la conferma');
      if(await page.locator('#mkTop').innerText()!==r0)throw new Error('«Annulla» ha comprato lo stesso');
      await buy.click();await vis('#cfm');await page.keyboard.press('Escape');if(await page.locator('#cfm:not(.hidden)').count())throw new Error('Esc non chiude la conferma');
    }
    // allenamento individuale: scegliere un indirizzo non lo esegue, «Avvia» sì
    await page.click('#hTrain');await vis('#train');
    const pr=page.locator('#tList .prow:not([disabled])').first();
    if(await pr.count()){
      await pr.click();
      if(await page.locator('#tTypes .ttype[data-k="rec"]:not([disabled])').count()){   // se restano lavori individuali in questa giornata
        await page.click('#tTypes .ttype[data-k="rec"]');
        if(await page.locator('#tRes .tres').count())throw new Error('il lavoro individuale parte senza conferma');
        await vis('#tCf .tcf');await page.click('#tCf [data-trgo]');await vis('#tRes .tres');
      }
    }
    await page.click('#hHome');
  });
  await step('rosa: filtri, ordinamento e scheda in tre parti; mercato: filtro e ordinamento; guida contestuale',async()=>{
    await vis('#home');await page.click('#hRoster');await vis('#roster');
    await page.click('#rBox [data-rv="c"]');   // la vista scelta resta salvata: qui si controllano le carte
    if(await page.locator('#rBox .pgrid .pcard').count()<7)throw new Error('la vista a carte non mostra la rosa');
    await page.click('#rBox [data-rv="t"]');   // il resto del percorso usa la tabella
    const all=await page.locator('#rBox tr.pl').count();
    await page.click('#rBox [data-rf="H"]');const hs=await page.locator('#rBox tr.pl').count();
    if(!(hs>0&&hs<all))throw new Error('il filtro Handler non restringe la rosa ('+hs+' su '+all+')');
    await page.click('#rBox [data-rf="all"]');await page.selectOption('#rBox [data-rsort]','age');
    const ages=(await page.locator('#rBox tr.pl small.rl').allInnerTexts()).map(t=>+(t.match(/(\d+) anni/)||[0,0])[1]);
    if(ages.some((a,i)=>i&&a<ages[i-1]))throw new Error('ordinamento per età non rispettato: '+ages.join(','));
    await page.click('#rBox .dbtn >> nth=0');
    for(const t of ['pre','svi','att']){await page.click('#rBox [data-dtab="'+t+'"] >> nth=0');await vis('#rBox [data-dtab="'+t+'"].on >> nth=0');}   // puo' esserci piu' di una scheda aperta
    // vista a carte: scheda a tutto schermo, azioni e soprannome
    await page.click('#rBox [data-rv="c"]');await page.click('#rBox [data-card] >> nth=0');await vis('#rBox .pcpanel');
    for(const a of ['rest','talk','nick'])if(!(await page.locator('#rBox [data-'+a+']').count()))throw new Error('manca l\'azione '+a+' nella scheda');
    await page.click('#rBox [data-nick]');await page.fill('#nkIn','Zio');await page.click('#rBox [data-nkok]');
    if(!/Zio/.test(await page.locator('#rBox .pcti h3').innerText()))throw new Error('il soprannome non compare nella scheda');
    await page.click('#rBox [data-dtab="pre"]');if(await page.locator('#rBox .dp3 .dpc').count()!==3)throw new Error('le statistiche non sono in tre colonne');
    await page.click('#rBox .pcx');
    await page.click('#roster .shelp');await vis('#guide');if(!(await page.locator('#gdBody li.ghi').count()))throw new Error('la guida contestuale non evidenzia la voce della Rosa');
    await page.click('#gdX');await page.click('#hHome');
    await page.click('#hMarket');await vis('#market');const m0=await page.locator('#mkBox .mcard').count();
    await page.check('#mkBox [data-mkonly]');const m1=await page.locator('#mkBox .mcard').count();if(m1>m0)throw new Error('il filtro del mercato aggiunge righe');
    await page.uncheck('#mkBox [data-mkonly]');await page.click('#mkTabs [data-k="all"]');await page.selectOption('#mkBox [data-mksort]','price');
    const pr=(await page.locator('#mkBox .mpr').allInnerTexts()).map(x=>parseInt(x,10)).filter(x=>!isNaN(x));
    if(pr.length<3||pr.some((a,i)=>i&&a<pr[i-1]))throw new Error('ordinamento per prezzo non rispettato: '+pr.join(','));
    await page.click('#hHome');await vis('#home');
  });
  await step('partite simulate dal cruscotto',async()=>{
    for(let i=0;i<2;i++){
      await page.click('#hSim');await vis('#simres');
      const mny=await page.locator('#srMoney').innerText();   // i conti della giornata: biglietti (se in casa), sponsor, stipendi, saldo
      if(!/Conti della giornata/.test(mny)||!/Sponsor/.test(mny)||!/Stipendi/.test(mny)||!/Saldo/.test(mny)||(/In casa/.test(mny)&&!/Biglietti/.test(mny))||(/In trasferta/.test(mny)&&(!/Trasferta/.test(mny)||/Biglietti/.test(mny))))throw new Error('conti della giornata incompleti: '+mny.replace(/\s+/g,' '));
      await page.click('#srOk');await page.waitForTimeout(100);
    }
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
  await step('abbandonare una partita di carriera è una sconfitta a tavolino',async()=>{
    await vis('#home');const before=await page.locator('#hNext').innerText();
    await page.click('#hPlay');await page.waitForTimeout(500);if(await page.locator('#menu').isVisible())await page.click('#bGo');
    for(let i=0;i<30&&!(await page.locator('#pause').isVisible());i++){await page.keyboard.press('Escape');await page.waitForTimeout(250);}
    await vis('#pause');await page.click('#paQuit');await page.click('#paQuit');await vis('#over');
    if(!/tavolino/i.test(await page.locator('#oTitle').innerText()))throw new Error('l\'abbandono non e\' registrato come sconfitta a tavolino');
    await page.click('#bAgain');await page.waitForTimeout(200);await vis('#home');
    if((await page.locator('#hNext').innerText())===before)throw new Error('dopo l\'abbandono la stessa partita si puo\' rigiocare');
  });
  await step('Campionato europeo: una sola edizione a stagione, poi si torna al campionato',async()=>{
    // la coppa si sblocca solo dalla Serie A: per provarla si modifica il salvataggio (come se la squadra si fosse qualificata) e si ricarica
    await page.evaluate(()=>{const k='ultimate-prototipo-v2',d=JSON.parse(window.testSaves.getItem(k));d.euUnlocked=true;d.event='eu';d.eu={round:0,state:'on',s:d.season,opps:['Berlino','Parigi','Madrid']};   // formato vecchio: l'edizione riparte come EUCF
    d.susp=null;window.testSaves.setItem(k,JSON.stringify(d));if(d.slot)window.testSaves.setItem('ultimate-carriera-'+d.slot,JSON.stringify(d));});
    await page.reload();await page.waitForTimeout(500);await page.click('#tCareer');await vis('#home');
    for(let i=0;i<12&&(await page.locator('#hSim').isVisible());i++){await page.click('#hSim');await vis('#simres');await page.click('#srOk');await page.waitForTimeout(150);if(/Torna al campionato/.test(await page.locator('#hPlayT').innerText()))break;}
    const t=await page.locator('#hPlayT').innerText();if(!/Torna al campionato/.test(t))throw new Error('a coppa conclusa il tasto principale dice «'+t+'»');
    if(/nuova stagione/i.test(await page.locator('#hNext').innerText()))throw new Error('a coppa conclusa il cruscotto parla di nuova stagione');
    await page.click('#hEvent');await vis('#event');
    if(await page.locator('#eReset').count())throw new Error('la coppa conclusa si puo\' ancora far ripartire');
    await page.click('#eCamp');await page.waitForTimeout(150);await page.click('#hHome');await vis('#home');
    if(!/Inizia partita/.test(await page.locator('#hPlayT').innerText()))throw new Error('dopo la coppa non si torna al campionato');
  });
  await step('fine stagione: riepilogo in cima, tasto «Inizia la nuova stagione» ben visibile e premi dietro un tasto',async()=>{
    for(let i=0;i<70&&(await page.locator('#hSim').isVisible());i++){await page.click('#hSim',{timeout:4000});await vis('#simres');await page.click('#srOk',{timeout:4000});await page.waitForTimeout(120);}
    await page.click('#hEvent');await vis('#event');
    if(await page.locator('#eCards [data-e="camp"]').count())await page.click('#eCards [data-e="camp"]');   // il passo precedente puo' aver lasciato aperta la coppa
    if(!(await page.locator('#eBody .endc').count()))throw new Error('manca la scheda di fine stagione');
    const vh=page.viewportSize().height,bb=await page.locator('#eReset').boundingBox();
    if(!bb||bb.y+bb.height>vh)throw new Error('«Inizia la nuova stagione» non si vede senza scorrere');
    if(await page.locator('#eBody .endtog').count()&&await page.locator('#eBody [data-infobox="endaw"]:not(.hidden)').count())throw new Error('i premi devono essere chiusi all\'apertura');
    await page.click('#eReset');await page.waitForTimeout(300);
    if(await page.locator('#eReset').count())throw new Error('la nuova stagione non e\' partita');
    await page.click('#hHome');await vis('#home');
  });
  await step('slot carriera: una seconda carriera e il ritorno alla prima',async()=>{
    const team1=(await page.locator('#tCareerS').innerText().catch(()=>''));
    await vis('#home');const name1=await page.locator('#hEvt').first().innerText();
    await menu('#hOpt');await vis('#opts');if(await page.locator('#opSlots [data-slot]').count()!==3)throw new Error('gli slot devono essere tre');
    await page.click('#opSlots [data-slot="2"]');await await vis('#league');await page.click('#lgList [data-div="m"]');await page.click('#lgList [data-lg="IT"]');await vis('#team');await page.click('#tSr button[data-k="B"]');await page.click('.tteam >> nth=3');await vis('#rpv');await page.click('#rpGo');await vis('#coachsel');await page.click('#coGo');await page.waitForTimeout(300);await vis('#home');
    const name2=await page.locator('#hEvt').first().innerText();if(name2===name1)throw new Error('lo slot 2 ha la stessa squadra dello slot 1');
    await menu('#hOpt');await page.click('#opSlots [data-slot="1"]');await page.waitForTimeout(300);await vis('#home');
    const back=await page.locator('#hEvt').first().innerText();if(back!==name1)throw new Error('tornando allo slot 1 la carriera non e\' quella di prima: '+back);
    await menu('#hOpt');
    const file=await page.evaluate(()=>window.testSaves.getItem('ultimate-carriera-1'));
    await page.locator('#clFile').setInputFiles({name:'carriera.json',mimeType:'application/json',buffer:Buffer.from(file)});
    // FileReader apre l’anteprima dopo la lettura asincrona.
    await page.locator('#importSlot').waitFor({state:'visible'});
    await page.selectOption('#importSlot','3');
    await page.click('#cfmNo');
    if(await page.evaluate(()=>window.testSaves.getItem('ultimate-carriera-3')))throw new Error('annullare l’importazione ha alterato lo slot di destinazione');
    const atomic=await page.evaluate(()=>{
      const key='ultimate-salvataggi-v1',storage=Storage.prototype,set=storage.setItem;
      const before=localStorage.getItem(key),career=JSON.parse(window.testSaves.getItem('ultimate-prototipo-v2'));
      const backup={app:'ultimate-frisbee',v:career.v,career,slots:{3:{...career,slot:3}},
        extra:{'ultimate-ut':{col:[],sel:[],packs:[0]}}};
      storage.setItem=function(k,v){
        if(k===key)throw new DOMException('Quota di prova','QuotaExceededError');
        return set.call(this,k,v);
      };
      try{return !!window.testImport(JSON.stringify(backup),1,true,true)&&localStorage.getItem(key)===before;}
      finally{storage.setItem=set;}
    });
    if(!atomic)throw new Error('un errore di quota ha lasciato un import parziale');
    await page.click('#opX');

  });
  await step('il salvataggio resiste alla ricarica della pagina',async()=>{
    await page.reload();await page.waitForTimeout(500);
    const t=await page.locator('#tCareerS').innerText();if(!/Continua/.test(t))throw new Error('carriera non ritrovata dopo la ricarica: «'+t+'»');
  });
  await step('partita veloce: avvio, pausa, abbandono',async()=>{
    await page.click('#tQuick');await vis('#quick');await page.click('#qPlay');await page.waitForTimeout(500);
    await page.keyboard.press('Escape');await vis('#pause');await vis('#paFs');if(!/Schermo intero/.test(await page.locator('#paFs').innerText()))throw new Error('il menu pausa deve avere il pulsante dello schermo intero');await page.click('#paQuit');await page.click('#paQuit');await page.waitForTimeout(200);await vis('#quick');await page.click('#qBack');
  });
  await step('Cambi: «Cambia tutti e 7» in partita veloce fa entrare i secondi 7 e premendolo di nuovo tornano i primi',async()=>{
    await page.click('#tQuick');await vis('#quick');await page.click('#qPlay');await page.waitForTimeout(600);
    await page.waitForSelector('#bSub:not(.hidden)',{timeout:20000});await page.click('#bSub');await vis('#subs');
    const field=()=>page.evaluate(()=>[...document.querySelectorAll('#subBox .lu')[0].querySelectorAll('button[data-id]')].map(b=>b.dataset.id).sort().join());
    const f0=await field();
    if(await page.locator('#subBox .lu-all').count()!==1)throw new Error('nel pannello Cambi manca il pulsante «Cambia tutti e 7»');
    await page.click('#subBox .lu-all');const f1=await field();
    if(f1===f0||f1.split(',').some(id=>f0.split(',').includes(id)))throw new Error('«Cambia tutti e 7» deve far uscire tutti i 7 in campo');
    if(f1.split(',').length!==7)throw new Error('in campo devono restare 7 giocatori');
    await page.click('#subBox .lu-all');if(await field()!==f0)throw new Error('premuto di nuovo, «Cambia tutti e 7» deve riportare in campo i primi 7');
    await page.click('#bSubGo');await page.keyboard.press('Escape');await vis('#pause');await page.click('#paQuit');await page.click('#paQuit');await page.waitForTimeout(200);await vis('#quick');await page.click('#qBack');
  });
  await step('pausa: tutti i pulsanti sono dentro lo schermo, anche sul telefono piccolo (667x375), e Abbandona si raggiunge',async()=>{
    const c=await browser.newContext({viewport:{width:667,height:375}}),p=await c.newPage();p.setDefaultTimeout(15000);
    await p.addInitScript(()=>{try{localStorage.setItem('ultimate-primi','{"d":[],"m":9,"off":1}');}catch(e){}});   // niente schede dei «Primi passi» sopra la partita
    await p.goto('file://'+OUT);await p.waitForTimeout(400);
    await p.click('#tQuick');await vis_(p,'#quick');await p.click('#qPlay');await p.waitForTimeout(700);
    await p.keyboard.press('Escape');await p.waitForSelector('#pause:not(.hidden)');
    const bad=await p.evaluate(()=>[...document.querySelectorAll('#pause button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>{const r=b.getBoundingClientRect();return {id:b.id,ok:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&r.height>=34};}).filter(x=>!x.ok).map(x=>x.id));
    if(bad.length)throw new Error('pulsanti della pausa fuori dallo schermo o troppo piccoli: '+bad.join(', '));
    await p.click('#paQuit');await p.click('#paQuit');await p.waitForTimeout(300);   // due tocchi: conferma
    if(await p.locator('#pause:not(.hidden)').count())throw new Error('«Abbandona» (con conferma) deve chiudere la partita');
    await c.close();
  });
  await step('timeout: uno a partita, ferma il gioco e si riprende',async()=>{
    await page.click('#tQuick');await vis('#quick');await page.selectOption('#qS','0');await page.click('#qPlay');await page.waitForTimeout(600);
    if(await page.locator('#menu').isVisible())await page.click('#bGo');
    await page.waitForSelector('#bTO:not(.hidden)',{timeout:40000});   // compare quando hai il disco in mano
    // tipo di lancio con le dita: una = piatto, due (o piu') = alto (il rovesciato); niente pulsante in attacco. Si annulla riportando il dito al punto di partenza
    if(await page.locator('#bHammer:not(.hidden)').count())throw new Error('in attacco non deve esserci il pulsante dei tipi di lancio');
    {const cdp=await page.context().newCDPSession(page),TT=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts}),aim=async()=>await page.locator('canvas').first().getAttribute('data-aim');
     // doppio tocco: un tocco rapido nel campo libero (lontano da ogni compagno), poi un secondo tocco tenuto premuto = lancio alto con un dito solo
     // il gioco sta in una funzione chiusa: non si leggono le posizioni dei giocatori, quindi si provano alcuni punti finche' ne arma uno libero (un tocco su un compagno e' una chiamata e non arma niente)
     const dbl=async(pt,gap)=>{await TT('touchStart',[{x:pt.x,y:pt.y,id:1}]);await page.waitForTimeout(60);await TT('touchEnd',[]);await page.waitForTimeout(gap);
       await TT('touchStart',[{x:pt.x,y:pt.y,id:1}]);await TT('touchMove',[{x:pt.x-40,y:pt.y-10,id:1}]);await page.waitForTimeout(150);const r=await aim();
       await TT('touchMove',[{x:pt.x,y:pt.y,id:1}]);await page.waitForTimeout(80);await TT('touchEnd',[]);await page.waitForTimeout(250);return r;};
     let free=null;for(const fy of [0.3,0.5,0.7,0.85])for(const fx of [0.15,0.3,0.45,0.6,0.75,0.9]){if(free)break;const pt={x:Math.round(844*fx),y:Math.round(390*fy)};if(await dbl(pt,120)==='alto')free=pt;}
     if(!free)throw new Error('doppio tocco: nessun punto del campo ha armato il lancio alto');
     if(await aim())throw new Error('doppio tocco: finita la mira il tipo di lancio deve sparire');
     if(await dbl(free,600)!=='piatto')throw new Error('doppio tocco troppo lento: il lancio deve restare piatto');
     await TT('touchStart',[{x:420,y:250,id:1}]);await TT('touchMove',[{x:380,y:240,id:1}]);await page.waitForTimeout(150);
     if(await aim()!=='piatto')throw new Error('una dita: il lancio deve essere piatto ('+await aim()+')');
     await TT('touchStart',[{x:380,y:240,id:1},{x:300,y:300,id:2}]);await page.waitForTimeout(150);
     if(await aim()!=='alto')throw new Error('due dita: il lancio deve essere alto ('+await aim()+')');
     await TT('touchStart',[{x:380,y:240,id:1},{x:300,y:300,id:2},{x:200,y:300,id:3}]);await page.waitForTimeout(150);
     if(await aim()!=='alto')throw new Error('tre dita: il lancio resta alto, non esiste altro ('+await aim()+')');
     await TT('touchMove',[{x:420,y:250,id:1}]);await page.waitForTimeout(100);await TT('touchEnd',[]);await page.waitForTimeout(200);   // dito al punto di partenza: nessun lancio
     if(await aim())throw new Error('finita la mira il tipo di lancio deve sparire');
     if(!(await page.locator('#bTO:not(.hidden)').count()))throw new Error('il lancio doveva annullarsi: il disco e\' partito');}
    await page.click('#bTO');await vis('#tout');
    const t0=await page.locator('#stall').isVisible();   // ferma: l'orologio dello stall non avanza mentre il riquadro e' aperto
    await page.waitForTimeout(1200);if(!(await page.locator('#tout').isVisible()))throw new Error('il riquadro del timeout si e\' chiuso da solo');
    await page.click('#toGo');await page.waitForTimeout(300);
    if(await page.locator('#tout').isVisible())throw new Error('dopo «Riprendi» il riquadro resta aperto');
    await page.waitForTimeout(500);if(await page.locator('#bTO:not(.hidden)').count())throw new Error('il secondo timeout non dovrebbe essere disponibile');
    await page.keyboard.press('Escape');await vis('#pause');await page.click('#paQuit');await page.click('#paQuit');await page.waitForTimeout(200);await vis('#quick');await page.click('#qBack');
  });
  await step('primi passi: il tutorial si fa giocando (prove che non fermano la partita), ricorda i passi fatti e si esce',async()=>{
    const c=await browser.newContext({viewport:{width:844,height:390}}),p=await c.newPage();
    await p.goto('file://'+OUT);await p.waitForTimeout(400);
    await p.click('#tQuick');await p.selectOption('#qS','0');await p.click('#qPlay');await p.waitForTimeout(600);
    if(await p.locator('#menu').isVisible())await p.click('#bGo');
    await p.waitForSelector('#pp:not(.hidden)',{timeout:15000});
    if(!/come si gioca/i.test(await p.locator('#ppT').innerText()))throw new Error('la prima scheda deve spiegare come si gioca');
    await p.keyboard.press('Escape');await p.waitForTimeout(150);if(await p.locator('#pause:not(.hidden)').count())throw new Error('con la scheda aperta Esc non deve aprire la pausa sotto');
    await p.keyboard.press('Enter');await p.waitForTimeout(200);   // Invio = «Capito»
    await p.waitForSelector('#pp:not(.hidden)',{timeout:25000});   // la prima prova: il pull se tocca a te, altrimenti il passaggio quando hai il disco
    const t2=await p.locator('#ppT').innerText();
    if(!/prova/i.test(t2)||!/pull|passa/i.test(t2))throw new Error('il secondo passo deve essere una prova (pull o passaggio): '+t2);
    if(!/salta questo passo/i.test(await p.locator('#ppOk').innerText()))throw new Error('nelle prove il tasto principale deve essere «Salta questo passo»');
    await p.keyboard.press('Space');await p.waitForTimeout(150);
    if(await p.locator('#pp.hidden').count())throw new Error('durante una prova i tasti vanno al gioco, non chiudono il riquadro');
    await p.click('#ppOk');await p.waitForTimeout(200);
    await p.waitForSelector('#pp:not(.hidden)',{timeout:25000});
    await p.click('#ppSkip');if(await p.locator('#pp:not(.hidden)').count())throw new Error('«Esci dal tutorial» deve chiudere il riquadro');
    const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('ultimate-primi')));
    if(!st.off||st.d.length!==3||st.d[0]!=='goal')throw new Error('lo stato deve ricordare tre passi e il tutorial spento: '+JSON.stringify(st));
    await p.waitForTimeout(2500);if(await p.locator('#pp:not(.hidden)').count())throw new Error('uscito dal tutorial non devono comparire altri passi');
    await c.close();
  });
  await step('pull a tempo, difesa automatica e tasto «Salta»',async()=>{
    await page.click('#tQuick');await vis('#quick');await page.selectOption('#qS','1');await page.click('#qPlay');await page.waitForTimeout(500);
    if(await page.locator('#menu').isVisible())await page.click('#bGo');
    // in partita non compaiono suggerimenti: si aspetta l'inizio della meta (compare «Schemi»), poi due tocchi fermano potenza e direzione
    await page.waitForSelector('#bSch:not(.hidden)');await page.waitForTimeout(800);await page.mouse.click(420,150);   // primo tocco: potenza
    await page.waitForTimeout(400);await page.mouse.click(420,150);   // secondo tocco: direzione, il pull parte
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
    const bracket=page.locator('.tnbracket');if(await bracket.getAttribute('open')===null)await bracket.locator('summary').click();
    await vis('.tncols');if(await page.locator('#tnSim').count()){await page.click('#tnSim');await vis('#simres');await page.click('#srOk');}
    await page.click('#tnBack');
  });
  await step('Ultimate Team: apertura del pacchetto',async()=>{
    await page.click('#tUT');await vis('#utMode');await page.click('#umCpu');await vis('#ut');
    if(await page.locator('#uPack').isVisible()){await page.click('#uPack');await page.click('#pkGo');await page.waitForTimeout(3400);await page.click('#pkGo');await page.waitForTimeout(200);}
    await vis('#ut');await page.click('#uBack');await vis('#utMode');await page.click('#umBack');
  });
  await step('Ultimate Team: Negozio con pacchetto normale, Handler e Cutter',async()=>{
    const ut=()=>page.evaluate(()=>{const o=JSON.parse(window.testSaves.getItem('ultimate-ut'));return {n:o.col.length,c:o.coins|0,pk:o.packs.slice(),r:o.col.map(x=>x.r)};});
    const u0=await ut();await page.evaluate(()=>{const o=JSON.parse(window.testSaves.getItem('ultimate-ut'));o.coins=500;window.testSaves.setItem('ultimate-ut',JSON.stringify(o));});
    await page.reload();await page.waitForTimeout(500);
    await page.click('#tUT');await vis('#utMode');await page.click('#umCpu');await vis('#ut');
    if(await page.locator('#uBuy').count())throw new Error('«Compra un pacchetto» e\' sostituito dal Negozio');
    await page.click('#uShop');await vis('#utShop');
    if(await page.locator('#shList [data-k]').count()!==4)throw new Error('il Negozio deve avere quattro pacchetti (con l\'equipaggiamento)');
    if(await page.locator('#shList svg.disc').count()!==4)throw new Error('i pacchetti del Negozio sono dischi');
    await page.click('#shList [data-k="han"]');await page.click('#shList [data-k="cut"]');
    const u1=await ut();if(u1.c!==500-65-65||u1.pk.length!==u0.pk.length+2)throw new Error('Handler e Cutter: costo o pacchetti sbagliati '+JSON.stringify(u1));
    await page.click('#shOpen');await vis('#utPack');
    await page.click('#pkGo');await page.waitForTimeout(3400);
    if(await page.locator('#pkBody .ucard').count()!==3)throw new Error('il pacchetto Handler ha 3 carte');
    const cls=await page.locator('#pkBody .ucard i:nth-of-type(2)').allTextContents();   // giocatori veri dei campionati: sulla carta c'e' il club
    if(cls.length!==3||cls.some(t=>!t.trim()||t.includes(' · ')))throw new Error('le carte del pacchetto sono giocatori veri con il club: '+JSON.stringify(cls));
    await page.click('#pkGo');await page.waitForTimeout(300);await page.click('#pkGo');await page.waitForTimeout(3400);await page.click('#pkGo');await vis('#ut');
    const u2=await ut(),nw=u2.r.slice(u1.n);if(nw.length!==6||nw.slice(0,3).some(r=>r!=='H')||nw.slice(3).some(r=>r!=='C'))throw new Error('3 Handler e 3 Cutter attesi: '+nw.join(''));
    await page.click('#uBack');await vis('#utMode');await page.click('#umBack');
  });
  await step('Ultimate Team: Real player (senza configurazione online) e ritorno al menu',async()=>{
    await page.click('#tUT');await vis('#utMode');await page.click('#umReal');await vis('#utReal');
    if(!(await page.locator('#urPlay').isDisabled()))throw new Error('senza nome «Inizia partita» deve essere spento');
    await page.click('#urBack');await vis('#utMode');await page.click('#umBack');await vis('#title');
  });
  await step('Ultimate Team: Real player ha una squadra sua, premi dei traguardi e nome non modificabile',async()=>{
    const cols=()=>page.evaluate(()=>['ultimate-ut','ultimate-ut-real'].map(k=>{const o=JSON.parse(window.testSaves.getItem(k)||'null');return o?{n:o.col.length,c:o.coins|0,pk:(o.packs||[]).slice(),ms:o.ms|0}:null;}));
    const cpu0=(await cols())[0];if(!cpu0||cpu0.n<10)throw new Error('la squadra contro il computer dovrebbe esistere gia\'');
    await page.click('#tUT');await vis('#utMode');await page.click('#umReal');await vis('#utReal');
    if(await page.locator('#urRename').count())throw new Error('il pulsante «Cambia nome» non deve piu\' esistere');
    if(await page.locator('#urTeam').isVisible())throw new Error('Real player deve partire senza giocatori, non con quelli del torneo');
    await page.click('#urPack');await vis('#utPack');await page.click('#pkGo');await page.waitForTimeout(3400);await page.click('#pkGo');await vis('#utReal');
    let [cpu,real]=await cols();
    if(!real||real.n!==10)throw new Error('pacchetto iniziale di Real player: attesi 10 giocatori, trovati '+(real&&real.n));
    if(cpu.n!==cpu0.n||cpu.c!==cpu0.c)throw new Error('aprire il pacchetto di Real player ha cambiato la squadra del torneo');
    await page.click('#urTeam');await vis('#utTeam');await page.click('#tmMode [data-m="up"]');
    if(!/1100 punti/.test(await page.locator('#tmInfo').innerText()))throw new Error('sotto i 1100 punti i potenziamenti devono essere bloccati');
    await page.click('#tmList .urow[data-i] >> nth=0');if(await page.locator('#tmUp').isVisible())throw new Error('con i potenziamenti bloccati il riquadro non deve aprirsi');
    await page.click('#tmBack');await vis('#utReal');await page.click('#urBack');await page.click('#umBack');
    // un profilo con 1230 punti (finto, nessuna rete): due traguardi = due pacchetti premio (bronzo da 5, argento da 6) e potenziamenti sbloccati
    await page.evaluate(()=>localStorage.setItem('ultimate-ut-online',JSON.stringify({id:'prova',name:'Prova',p:1230,w:9,l:1,g:10,rt:'x',dirty:false,fresh:false,last:'',op:null})));
    await page.reload();await page.waitForTimeout(500);
    await page.click('#tUT');await vis('#utMode');await page.click('#umReal');await vis('#utReal');
    if(await page.locator('#urNameBox').isVisible())throw new Error('con il nome gia\' scelto il riquadro del nome non deve comparire');
    real=(await cols())[1];if(real.ms!==2||real.pk.join()!=='52,63,322,323')throw new Error('traguardi: attesi i pacchetti 52 e 63 e gli accessori 322 e 323, trovati '+real.pk.join()+' (ms '+real.ms+')');
    if(!/1300 punti/.test(await page.locator('#urMiles .urmr.next').innerText()))throw new Error('il prossimo traguardo dovrebbe essere a 1300 punti: '+await page.locator('#urMiles').innerText());
    if(await page.locator('#urMiles .urmr.done').count()!==2||await page.locator('#urMiles .urmr').count()!==5)throw new Error('i traguardi devono essere 5, con i primi due ottenuti');
    await page.click('#urPack');await vis('#utPack');
    for(let i=0;i<4;i++){await page.click('#pkGo');await page.waitForTimeout(i<3?2200:2600);await page.click('#pkGo');}   // due pacchetti di giocatori e due di accessori
    await vis('#utReal');
    real=(await cols())[1];if(real.n!==21||real.pk.length)throw new Error('dopo i due pacchetti premio attesi 21 giocatori, trovati '+real.n);
    await page.click('#urTeam');await vis('#utTeam');await page.click('#tmMode [data-m="up"]');await page.click('#tmList .urow[data-i] >> nth=0');await vis('#tmUp');
    await page.click('#tmBack');await page.click('#urBack');await vis('#utMode');
    // rientrando nel torneo contro il computer si ritrova la sua squadra, intatta
    await page.click('#umCpu');await vis('#ut');cpu=(await cols())[0];
    if(cpu.n!==cpu0.n||cpu.c!==cpu0.c||!new RegExp('Rosa: '+cpu0.n+' ').test(await page.locator('#uStats').innerText()))throw new Error('la squadra del torneo e\' cambiata dopo Real player');
    await page.click('#uBack');await page.click('#umBack');await vis('#title');
    await page.evaluate(()=>{localStorage.removeItem('ultimate-ut-online');window.testSaves.removeItem('ultimate-ut-real');});await page.reload();await page.waitForTimeout(500);
  });
  await step('Ultimate Team: Superpoteri con la squadra di Sfide online, solo eroi dai pacchetti, assegnati ai titolari',async()=>{
    const st=()=>page.evaluate(()=>{const r=JSON.parse(window.testSaves.getItem('ultimate-ut-real')||'null'),h=JSON.parse(window.testSaves.getItem('ultimate-ut-eroi')||'null');
      return {r:r?{n:r.col.length,hk:r.col.filter(c=>c.hk).length,sel:r.sel.length,c:r.coins|0}:null,h:h?{col:!!h.col,hc:Object.keys(h.hc||{}).length,ha:Object.keys(h.ha||{}),pk:(h.packs||[]).length}:null};});
    await page.click('#tUT');await vis('#utMode');await page.click('#umHero');await vis('#utReal');
    if((await page.locator('#urH').textContent()).trim()!=='Superpoteri')throw new Error('la schermata deve chiamarsi Superpoteri');
    if(await page.locator('#urTeam').isVisible()||await page.locator('#urHero').isVisible())throw new Error('senza la squadra di Real player non ci sono giocatori da mostrare');
    if(!/Sfide online/.test(await page.locator('#urPlayS').textContent()))throw new Error('senza squadra deve dire di completarla in Sfide online');
    await page.click('#urPack');await vis('#utPack');await page.click('#pkGo');await page.waitForTimeout(1800);
    if(await page.locator('#pkBody .hcard').count()!==3)throw new Error('il primo pacchetto eroi ha 3 carte eroe');
    await page.click('#pkGo');await vis('#utReal');
    let s=await st();if(s.r||!s.h||s.h.hc!==3||s.h.col)throw new Error('nei Superpoteri arrivano solo eroi, nessun giocatore: '+JSON.stringify(s));
    // la squadra si fa in Real player: tornando nei Superpoteri c'e' lei, con i tre eroi in campo
    await page.click('#urBack');await vis('#utMode');await page.click('#umReal');await vis('#utReal');
    await page.click('#urPack');await vis('#utPack');await page.click('#pkGo');await page.waitForTimeout(3400);await page.click('#pkGo');await vis('#utReal');
    await page.click('#urShop');await vis('#utShop');if(await page.locator('#shList [data-k="eroi"]').count())throw new Error('il pacchetto eroi sta solo nei Superpoteri');
    await page.click('#shBack');await page.click('#urBack');await vis('#utMode');await page.click('#umHero');await vis('#utReal');
    s=await st();if(!s.r||s.r.n!==10||s.r.hk||s.h.ha.length!==3||new Set(s.h.ha).size!==3)throw new Error('attesi i 10 giocatori di Real player (senza eroi nel suo salvataggio) e 3 eroi diversi in campo: '+JSON.stringify(s));
    if(!(await page.locator('#urTeam').isVisible())||!/10 giocatori/.test(await page.locator('#urTeamS').textContent()))throw new Error('nei Superpoteri si vede la squadra di Real player');
    await page.click('#urHero');await vis('#utHero');
    if(await page.locator('#uhList .qhe').count()!==9||await page.locator('#uhList .qhe:disabled').count()!==6)throw new Error('gli eroi sono 9, sei ancora da trovare');
    await page.click('#uhSt .uhp.has >> nth=0');if(await page.locator('#uhSt .uhp.has').count()!==2)throw new Error('toccando un titolare con l\'eroe glielo tolgo');
    await page.click('#uhAuto');if(await page.locator('#uhSt .uhp.has').count()!==3)throw new Error('«Assegna da solo» rimette tre eroi');
    await page.click('#uhSt .uhp.has >> nth=0');await page.click('#uhBack');await vis('#utReal');
    await page.click('#urTeam');await vis('#utTeam');
    if(await page.locator('#tmMode [data-m="up"]').isVisible()||await page.locator('#tmMode [data-m="del"]').isVisible())throw new Error('nei Superpoteri la squadra ha solo «Titolari»: potenzia e scarta si fa in Real player');
    await page.click('#tmBack');await vis('#utReal');
    // portafoglio separato: i gettoni dei Superpoteri comprano eroi e non toccano quelli di Real player
    await page.click('#urBack');await vis('#utMode');await page.click('#umReal');await vis('#utReal');await page.click('#urBack');await vis('#utMode');   // si esce dai Superpoteri: al rientro si rilegge il salvataggio
    const rc0=await page.evaluate(()=>{const h=JSON.parse(window.testSaves.getItem('ultimate-ut-eroi'));h.coins=200;window.testSaves.setItem('ultimate-ut-eroi',JSON.stringify(h));return JSON.parse(window.testSaves.getItem('ultimate-ut-real')).coins|0;});
    await page.click('#umHero');await vis('#utReal');await page.click('#urShop');await vis('#utShop');
    if(await page.locator('#shList [data-k]').count()!==1||!(await page.locator('#shList [data-k="eroi"]').count()))throw new Error('nel Negozio dei Superpoteri c\'e\' solo il pacchetto eroi');
    await page.click('#shList [data-k="eroi"]');
    const w=await page.evaluate(()=>[JSON.parse(window.testSaves.getItem('ultimate-ut-eroi')).coins,JSON.parse(window.testSaves.getItem('ultimate-ut-real')).coins|0]);
    if(w[0]!==50||w[1]!==rc0)throw new Error('il pacchetto eroi si paga con i gettoni dei Superpoteri, non con quelli di Real player: '+w.join(' e ')+', prima '+rc0);
    await page.click('#shBack');await page.click('#urBack');await vis('#utMode');
    // passando da Real player e tornando, gli eroi restano dati agli stessi titolari (due, dopo averne tolto uno)
    await page.click('#umReal');await vis('#utReal');s=await st();if(s.r.hk||s.r.n!==10)throw new Error('Real player non deve avere eroi: '+JSON.stringify(s));
    await page.click('#urBack');await vis('#utMode');await page.click('#umHero');await vis('#utReal');await page.click('#urHero');await vis('#utHero');
    if(await page.locator('#uhSt .uhp.has').count()!==2)throw new Error('gli eroi assegnati devono restare dove li hai messi');
    await page.click('#uhBack');await page.click('#urBack');await page.click('#umBack');await vis('#title');
    await page.evaluate(()=>{for(const k of ['ultimate-ut-eroi','ultimate-ut-real'])window.testSaves.removeItem(k);for(const k of ['ultimate-ut-eroi-online','ultimate-ut-online'])localStorage.removeItem(k);});await page.reload();await page.waitForTimeout(500);
  });
  await step('Ultimate Team: potenziamenti specializzati',async()=>{
    await page.evaluate(()=>{const o=JSON.parse(window.testSaves.getItem('ultimate-ut')||'null');if(o){o.coins=900;window.testSaves.setItem('ultimate-ut',JSON.stringify(o));}});
    await page.reload();await page.waitForTimeout(500);
    await page.click('#tUT');await vis('#utMode');await page.click('#umCpu');await vis('#ut');await page.click('#uTeam');await vis('#utTeam');
    await page.click('#tmMode [data-m="up"]');await page.click('#tmList .urow[data-i] >> nth=0');await vis('#tmUp');
    if(await page.locator('#tmUp [data-ul]').count()!==4)throw new Error('i potenziamenti devono essere quattro (Tiro, Atletico, Difesa, Mani e testa)');
    await page.click('#tmUp [data-ul="d"]');
    if(!/potenziato \(Difesa\)/.test(await page.locator('#tmInfo').innerText()))throw new Error('il potenziamento non e\' stato applicato: '+await page.locator('#tmInfo').innerText());
    await page.click('#tmBack');await page.click('#uBack');await vis('#utMode');await page.click('#umBack');
  });
  await step('Ultimate Team: equipaggiamento (Negozio, manichino, divisa)',async()=>{
    const eq=()=>page.evaluate(()=>{const o=JSON.parse(window.testSaves.getItem('ultimate-ut'));return {c:o.coins|0,eq:o.eq||{},pk:o.packs.slice()};});
    await page.evaluate(()=>{const o=JSON.parse(window.testSaves.getItem('ultimate-ut'));o.coins=500;o.eq={own:{},on:{}};window.testSaves.setItem('ultimate-ut',JSON.stringify(o));});
    await page.reload();await page.waitForTimeout(500);
    await page.click('#tUT');await vis('#utMode');await page.click('#umCpu');await vis('#ut');
    await page.click('#uShop');await vis('#utShop');await page.click('#shList [data-k="eq"]');
    let u=await eq();if(u.c!==380||u.pk[u.pk.length-1]!==321)throw new Error('pacchetto equipaggiamento: costo o codice sbagliati '+JSON.stringify(u));
    await page.click('#shOpen');await vis('#utPack');await page.click('#pkGo');await page.waitForTimeout(1500);
    if(await page.locator('#pkBody .ucard.eqc').count()!==2)throw new Error('il pacchetto equipaggiamento ha 2 accessori');
    while(await page.locator('#utPack').isVisible()){await page.click('#pkGo');await page.waitForTimeout(1500);}
    await vis('#ut');u=await eq();
    if(Object.keys(u.eq.on||{}).length!==2)throw new Error('i due accessori nuovi devono essere indossati: '+JSON.stringify(u.eq));
    await page.click('#uEquip');await vis('#utEquip');
    if(await page.locator('#eqL .eqs, #eqR .eqs').count()!==6)throw new Error('i posti dell\'equipaggiamento devono essere sei');
    if(!(await page.locator('#eqFig svg').isVisible()))throw new Error('manca il manichino');
    const k=Object.keys(u.eq.on)[0];await page.click(`.eqs[data-k="${k}"]`);await page.click('#eqOff');
    await page.click('#eqKit .eqsw[data-z="s"][data-c="#ffd23f"]');
    u=await eq();if(u.eq.on[k]!==undefined||u.eq.kit.s!=='#ffd23f')throw new Error('togliere un accessorio o cambiare la maglia non funziona: '+JSON.stringify(u.eq));
    if(!/Bonus a tutta la squadra/.test(await page.locator('#eqInfo').innerText()))throw new Error('manca il riepilogo dei bonus');
    await page.click('#eqBack');await vis('#ut');await page.click('#uBack');await vis('#utMode');await page.click('#umBack');
  });
  await step('allenamento: il tutorial parte e si esce dalla pausa',async()=>{
    await page.click('#tSchool');await vis('#school');if(await page.locator('.tles [data-step]').count()!==7)throw new Error('mancano le sette lezioni del tutorial');
    await page.click('#scBox .schrow [data-go="tut"]');await page.waitForTimeout(700);await vis('#coach');
    await page.click('#bExit');await vis('#pause');await page.click('#paQuit');await page.waitForTimeout(300);await vis('#school');
  });
  await step('menu iniziale: Salvataggi, nuova carriera in un altro slot e ritorno, senza passare dalle Opzioni',async()=>{
    await page.click('#tBack').catch(()=>{});
    if(!(await page.locator('#title').isVisible())){await page.goto('file://'+OUT);await page.waitForTimeout(400);}
    if(!/Salvataggi/.test(await page.locator('#tSlots').innerText()))throw new Error('il tasto degli slot deve chiamarsi «Salvataggi»');
    await page.click('#tSlots');await vis('#slots');
    const full=await page.locator('#csBox [data-cgo]').count();if(full<1)throw new Error('la carriera esistente non compare tra gli slot');
    const occupied=page.locator('#csBox .csl:has([data-cgo])').first();
    const oldSlot=await occupied.innerText();
    await occupied.locator('[data-cnew]').click();
    await vis('#cfm');await page.click('#cfmOk');await vis('#league');
    await page.click('#lgBack');await vis('#slots');
    if(await occupied.innerText()!==oldSlot)throw new Error('annullare la sostituzione ha cambiato lo slot');
    await page.reload();await page.click('#tSlots');await vis('#slots');
    if(await occupied.innerText()!==oldSlot)throw new Error('lo slot precedente non sopravvive alla ricarica');
    await occupied.locator('[data-cgo]').click();await vis('#home');
    await menu('#hOpt');await vis('#opts');
    const beforeImport=await page.evaluate(()=>window.testSaves.getItem('ultimate-prototipo-v2'));
    const invalid=JSON.parse(beforeImport);invalid.sched=[];
    await page.locator('#clFile').setInputFiles({name:'carriera-invalida.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
    await page.waitForFunction(()=>document.getElementById('opMsg').textContent.includes('File non valido o incompatibile'));
    if(await page.evaluate(()=>window.testSaves.getItem('ultimate-prototipo-v2'))!==beforeImport)throw new Error('l’importazione invalida ha cambiato il salvataggio');
    await page.click('#opX');await menu('#hBack');await page.click('#tSlots');await vis('#slots');
    const empty=await page.locator('#csBox .csl:not(:has([data-cgo])) [data-cnew]').first();
    const k=+(await empty.getAttribute('data-cnew'));await empty.click();await vis('#league');await page.click('#lgBack');await vis('#slots');   // ripensamento: la carriera di prima resta
    if(await page.locator('#csBox [data-cgo]').count()!==full)throw new Error('tornando indietro la carriera di prima e\' sparita');
    await page.click('#csBox [data-cnew="'+k+'"]');await vis('#league');await page.click('#lgList [data-div="m"]');await page.click('#lgList [data-lg="IT"]');await vis('#team');
    // seconda carriera: partenza da subentrato (squadra in crisi a una giornata dalla fine), con «Un'altra squadra»
    await page.click('#tMode button[data-k="sub"]');await page.click('#tSr button[data-k="B"]');await vis('#tReAcc');await page.click('#tReAlt');await vis('#tReAcc');
    await page.click('#tReAcc');await vis('#coachsel');await page.click('#coGo');await page.waitForTimeout(300);await vis('#home');
    if(!/posto/.test(await page.locator('#hInfo').innerText()))throw new Error('il subentro deve mostrare la posizione in classifica');
    await menu('#hBack');await vis('#title');await page.click('#tSlots');
    if(await page.locator('#csBox [data-cgo]').count()!==full+1)throw new Error('la nuova carriera non e\' nello slot '+k);
    const other=await page.locator('#csBox [data-cgo]:not([data-cgo="'+k+'"])').first();await other.click();await vis('#home');
    await menu('#hBack');await vis('#title');
    if(!(await page.locator('link[rel="icon"]').getAttribute('href')||'').startsWith('data:image/png'))throw new Error('manca l\'icona del gioco');
  });
  // ROTAZIONE AUTOMATICA: telefono tenuto in verticale. Il gioco si disegna girato, i menu si toccano e una partita si gioca
  await step('telefono in verticale: il gioco si gira da solo e risponde al tocco',async()=>{
    const ctx=await browser.newContext({viewport:{width:390,height:664},isMobile:true,hasTouch:true,deviceScaleFactor:1}),p=await ctx.newPage(),er=[];
    p.on('pageerror',e=>er.push(e.message));
    await p.goto('file://'+OUT);await p.waitForTimeout(500);
    await p.evaluate(()=>localStorage.setItem('ultimate-primi','{"d":[],"m":0,"off":1}'));await p.reload();await p.waitForTimeout(500);   // tutorial spento (come nella pagina principale)
    const st=await p.evaluate(()=>({rot:document.documentElement.classList.contains('rotp'),cw:document.getElementById('c').clientWidth,ch:document.getElementById('c').clientHeight,msg:getComputedStyle(document.getElementById('rot')).display}));
    if(!st.rot||st.cw!==664||st.ch!==390||st.msg!=='none')throw new Error('rotazione non applicata: '+JSON.stringify(st));
    await p.click('#tQuick');await p.waitForSelector('#quick:not(.hidden)');await p.click('#qPlay');await p.waitForTimeout(600);
    if(await p.locator('#menu').isVisible())await p.click('#bGo');
    await p.waitForSelector('#bExit:not(.hidden)');await p.click('#bExit');await p.waitForSelector('#pause:not(.hidden)');
    await p.click('#paQuit');await p.click('#paQuit');await p.waitForSelector('#quick:not(.hidden)');
    await p.click('#qBack');await p.click('#tSet');await p.click('#sTabScr');await p.click('#sRot');
    if(await p.evaluate(()=>document.documentElement.classList.contains('rotp')))throw new Error('la rotazione non si spegne dalle Impostazioni');
    await p.click('#sRot').catch(()=>{});await ctx.close();
    if(er.length)throw new Error('errore in verticale: '+er[0]);
  });
  await step('Pages: il gioco riparte offline in una nuova scheda',async()=>{
    const http=require('node:http'),{html,worker}=require('./build').pagesBuild();
    const assets=require('./icona').webFiles();
    const server=http.createServer((req,res)=>{
      const name=new URL(req.url,'http://localhost').pathname.split('/').at(-1);
      if(!name){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);}
      else if(name==='offline-worker.js'){res.setHeader('Content-Type','text/javascript');res.end(worker);}
      else if(Object.hasOwn(assets,name))res.end(assets[name]);
      else{res.statusCode=404;res.end();}
    });
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    const ctx=await browser.newContext({viewport:{width:844,height:390}});
    const url='http://127.0.0.1:'+server.address().port+'/ultimate-frisbee/';
    try{
      const online=await ctx.newPage();await online.goto(url);
      await online.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration())?.active);
      await online.close();
      await ctx.setOffline(true);
      const cold=await ctx.newPage();await cold.goto(url);await vis_(cold,'#title');
      await cold.click('#tQuick');await vis_(cold,'#quick');
    }finally{await ctx.close();await new Promise(resolve=>server.close(resolve));}
  });
  await browser.close();
  for(const d of done)console.log('  [OK] '+d);
  if(errs.length){console.error('Prova nel browser: '+errs.length+' problemi');for(const e of errs)console.error('  [NO] '+e);process.exit(1);}
  console.log('Prova nel browser: ok ('+done.length+' percorsi)');
})().catch(e=>{console.error('Prova nel browser interrotta: '+e.message);process.exit(1);});
