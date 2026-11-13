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
  // i fumetti di primo accesso della carriera (Rosa, Mercato, Club...) si chiudono con «OK»
  await page.addLocatorHandler(page.locator('#tip:not(.hidden) #tipOk'),async()=>{await page.click('#tipOk');});
  // il cartello di presentazione delle partite che contano (derby, finali) si chiude con un tocco
  await page.addLocatorHandler(page.locator('#intro:not(.hidden) #inGo'),async()=>{await page.click('#inGo');});
  // la conferenza stampa dopo le partite che contano si salta con un tocco
  await page.addLocatorHandler(page.locator('#press:not(.hidden) #prSkip'),async()=>{await page.click('#prSkip');});
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
  // il tutorial «Primi passi» ferma il gioco con le sue schede: nella pagina di prova e' spento (tranne nella prova che lo verifica, in un contesto a parte).
  // Si scrive a pagina caricata e poi si ricarica: uno script iniziale che scrive nel localStorage prima del caricamento, in Chromium, a volte fa perdere i dati dopo una ricarica
  await page.evaluate(()=>localStorage.setItem('ultimate-primi','{"d":[],"m":0,"off":1}'));await page.reload();await page.waitForTimeout(500);
  await step('menu iniziale, guida e impostazioni',async()=>{
    await vis('#title');await page.click('#tHelp');await vis('#guide');await page.click('#gdX');
    await page.click('#tSet');await vis('#settings');await page.click('#sBack');await vis('#title');
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
    await page.click('#tSet');await vis('#settings');await page.click('#sGoBtns');await page.click('#sGoSize');
    await page.click('#sUz button[data-i="3"]');await page.waitForTimeout(150);if(await ui(page)!==1.5)throw new Error('«Molto piu\' grande» deve portare il telefono a 1,5');
    await page.click('#sUz button[data-i="0"]');await page.waitForTimeout(150);if(await ui(page)!==0.75)throw new Error('«Piu\' piccola» deve portare il telefono a 0,75');
    await page.click('#sUz button[data-i="1"]');await page.waitForTimeout(150);if(await ui(page)!==1)throw new Error('«Automatica» deve riportare il telefono a 1');
    await page.click('#sBack');await page.click('#sBack');await page.click('#sBack');await vis('#title');
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
  await step('carriera USA dall\'interfaccia: Italia/USA, Conference, club, allenatore, Classifica a tre viste, partita simulata',async()=>{
    await page.click('#tCareer');await vis('#league');if(await page.locator('#lgList .lgcard').count()<2)throw new Error('servono le schede dei campionati');await page.click('#lgList [data-lg="US"]');await vis('#team');
    if(await page.locator('#tSr button').count()!==4)throw new Error('servono le 4 Conference');
    await page.click('#tSr button[data-k="E"]');
    if(await page.locator('.tteam').count()!==8)throw new Error('ogni Conference ha 8 club');
    await page.click('.tteam >> nth=1');await vis('#rpv');
    if(await page.locator('#rpBody tr').count()<15)throw new Error('il roster del club deve elencare i giocatori');
    await page.click('#rpFav');await page.click('#rpX');
    if(!/★/.test(await page.locator('.tteam >> nth=0').innerText()))throw new Error('la squadra del cuore deve stare in cima, con la stella');
    await page.click('.tteam >> nth=0');await vis('#rpv');await page.click('#rpGo');await vis('#coachsel');await page.click('#coGo');await page.waitForTimeout(300);await vis('#home');
    if(!/Conference/.test(await page.locator('#hInfo').innerText()))throw new Error('il cruscotto non mostra la Conference');
    await page.click('#hEvent');await vis('#event');
    if(await page.locator('#eBody .rt tr.up').count()!==2||await page.locator('#eBody .rt tr.pi').count()!==4||await page.locator('#eBody .rt tr.dn').count()!==2)throw new Error('zone Nationals / Play-in / eliminate non evidenziate (2/4/2)');
    for(const k of ['nat','rank','conf'])await page.click('#usTabs [data-ut="'+k+'"]');
    await page.click('#eBack');await vis('#home');await page.click('#hSim');await vis('#simres');await page.click('#srOk');await vis('#home');
    await page.click('#hOpt');await page.click('#opX');
    await page.evaluate(()=>{localStorage.removeItem('ultimate-cuore');localStorage.removeItem('ultimate-prototipo-v2');for(const k of [1,2,3])localStorage.removeItem('ultimate-carriera-'+k);});await page.reload();await page.waitForTimeout(500);
    await page.evaluate(()=>localStorage.setItem('ultimate-primi','{"d":[],"m":0,"off":1}'));await page.reload();await page.waitForTimeout(500);
  });
  await step('nuova carriera e cruscotto',async()=>{
    await page.click('#tCareer');await vis('#league');await page.click('#lgList [data-lg="IT"]');await vis('#team');await page.click('#tSr button[data-k="C"]');await page.click('.tteam >> nth=0');await vis('#rpv');await page.click('#rpGo');await vis('#coachsel');
    // schermata dell'allenatore: personaggio casuale, volto e nomi scelti a mano, anteprima che segue
    await page.click('#coRnd');if(!(await page.inputValue('#coN'))||!(await page.inputValue('#coS')))throw new Error('«Personaggio casuale» deve riempire nome e cognome');
    if(await page.locator('#coFaces button').count()!==12)throw new Error('i volti devono essere dodici');
    await page.click('#coFaces button >> nth=3');await page.fill('#coN','Giulia');await page.fill('#coS','Rossi');
    if(!/Giulia Rossi/i.test(await page.locator('#coName').innerText()))throw new Error('l\'anteprima non segue il nome');
    await page.click('#coGo');await page.waitForTimeout(300);await vis('#home');
    if(!(await page.locator('#hCoach svg.av').count()))throw new Error('manca il volto dell\'allenatore nel cruscotto');
  });
  await step('allenatore e staff: cambio nome dal cruscotto, candidati, assunzione e rinnovo dell\'elenco',async()=>{
    await page.click('#hCoach');await vis('#coachsel');await page.fill('#coS','Bianchi');await page.click('#coGo');await vis('#home');
    if(!/Bianchi/.test(await page.locator('#hCoach').getAttribute('title')))throw new Error('il cambio di nome non arriva al cruscotto');
    await page.click('#hClub');await vis('#club');
    if(await page.locator('#clBox .scard.empty').count()!==4)throw new Error('a inizio carriera i quattro ruoli dello staff devono essere vacanti');
    await page.click('#clBox [data-hire="coach"]');await vis('#hire');
    if(await page.locator('#hireList .hcn').count()!==3)throw new Error('i candidati devono essere tre');
    const first=await page.locator('#hireList .hcn .sr').first().innerText();
    await page.click('#hireRenew');if(await page.locator('#hireList .hcn').count()!==3)throw new Error('dopo il rinnovo i candidati devono essere ancora tre');
    await page.click('#hireList [data-hirei]:not([disabled]) >> nth=0');
    if(await page.locator('#hire:not(.hidden)').count())throw new Error('assunto: la finestra deve chiudersi');
    if(await page.locator('#clBox .scard:not(.empty)').count()!==1)throw new Error('dopo l\'assunzione deve esserci una persona nello staff');
    await page.click('#clBack');await vis('#home');
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
    await page.click('#hRoster');await vis('#roster');await page.click('#rBox [data-rv="t"]');await page.click('tr.pl >> nth=0');await vis('tr.dt');await page.click('#rBox [data-dtab="svi"]');   // gli indirizzi e il rapporto degli osservatori stanno nella parte «Sviluppo» della scheda
    if(await page.locator('.dspec button[data-spec]').count()!==6)throw new Error('gli indirizzi di sviluppo devono essere sei');
    if(!(await page.locator('tr.dt .scr').isVisible()))throw new Error('manca il rapporto di scouting nella scheda');
    await page.click('#rBack');
    await page.click('#hTrain');await vis('#train');await page.click('#tTeamBox [data-int="2"]');
    if(!/Intenso/.test(await page.locator('.tint small').innerText()))throw new Error('l\'intensità dell\'allenamento non cambia');
    await page.click('#tTeamBox [data-int="1"]');
    if(!/punti/.test(await page.locator('#tTeamBox .ttype[data-team="tec"] .fc').innerText()))throw new Error('manca l\'anteprima della seduta di squadra');
    await page.click('#tTeamBox .ttype[data-team="tec"]');await vis('#tRes .tres');
    await page.click('#tTeamBox [data-prog]');if(!/Acceso/.test(await page.locator('#tTeamBox [data-prog]').innerText()))throw new Error('il programma automatico non si accende');
    if(await page.locator('#tList .prow:not([disabled])').count()>await page.locator('#tList .prow').count()-3)throw new Error('il programma automatico non ha fatto i lavori individuali');
    await page.click('#tTeamBox [data-prog]');await page.click('#tBack');
    await page.click('#hMarket');await vis('#market');await page.click('[data-rp] >> nth=0');await vis('#mkBox .scr');await page.click('#mkTabs [data-k="int"]');await page.click('#mkBack');
    await page.click('#hClub');await vis('#club');if(await page.locator('#clBox .bgr').count()<6)throw new Error('manca il bilancio previsionale');if(await page.locator('#clBox .fbar').count()!==6||await page.locator('#clBox .scard').count()!==4)throw new Error('devono esserci sei strutture e quattro figure dello staff');
    // le altre linguette del Club: traguardi (ventuno schede, percentuale), albo d'oro e Hall of Fame
    await page.click('#clTabs button[data-k="ach"]');if(await page.locator('#clBox .ach').count()!==21||!/%/.test(await page.locator('#clBox .achbig').innerText()))throw new Error('i traguardi devono essere ventuno, con la percentuale');
    await page.click('#clTabs button[data-k="hon"]');if(await page.locator('#clBox .trt').count()<7)throw new Error('manca la bacheca dei trofei');
    await page.click('#clTabs button[data-k="rec"]');if(await page.locator('#clBox .hofbox').count()!==1)throw new Error('manca la Hall of Fame');
    await page.click('#clTabs button[data-k="man"]');
    if(await page.locator('#clBox .scard').count()!==4||await page.locator('#clBox [data-hire]').count()<4)throw new Error('le figure dello staff devono essere quattro, ciascuna con «Cambia» o «Scegli chi assumere»');
    await page.click('#clTabs [data-k="hon"]');await page.click('#clTabs [data-k="rec"]');await page.click('#clBack');
    await page.click('#hEvent');await vis('#event');await page.click('#evTabs [data-sr="A"]');await page.click('#evTabs [data-sr="B"]');await vis('#eBody table.rt');
    const trs=await page.locator('#eBody table.rt tr').count();if(trs<8)throw new Error('classifica di un\'altra serie troppo corta: '+trs);
    await page.click('#eBack');
    await page.click('#hOpt');await vis('#opts');await page.click('#opX');
    await page.click('#hBell');await vis('#alerts');   // lo chiude il gestore qui sopra alla prossima azione
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
    await page.click('#gdX');await page.click('#rBack');
    await page.click('#hMarket');await vis('#market');const m0=await page.locator('#mkBox tr').count();
    await page.check('#mkBox [data-mkonly]');const m1=await page.locator('#mkBox tr').count();if(m1>m0)throw new Error('il filtro del mercato aggiunge righe');
    await page.uncheck('#mkBox [data-mkonly]');await page.selectOption('#mkBox [data-mksort]','price');
    const pr=(await page.locator('#mkBox table.rt tr td:nth-child(4)').allInnerTexts()).map(Number).filter(x=>!isNaN(x));
    if(pr.length<3||pr.some((a,i)=>i&&a<pr[i-1]))throw new Error('ordinamento per prezzo non rispettato: '+pr.join(','));
    await page.click('#mkBack');await vis('#home');
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
    await page.evaluate(()=>{const k='ultimate-prototipo-v2',d=JSON.parse(localStorage.getItem(k));d.euUnlocked=true;d.event='eu';d.eu={round:0,state:'on',s:d.season,opps:['Berlino','Parigi','Madrid']};d.susp=null;localStorage.setItem(k,JSON.stringify(d));if(d.slot)localStorage.setItem('ultimate-carriera-'+d.slot,JSON.stringify(d));});
    await page.reload();await page.waitForTimeout(500);await page.click('#tCareer');await vis('#home');
    for(let i=0;i<3&&(await page.locator('#hSim').isVisible());i++){await page.click('#hSim');await vis('#simres');await page.click('#srOk');await page.waitForTimeout(150);}
    const t=await page.locator('#hPlayT').innerText();if(!/Torna al campionato/.test(t))throw new Error('a coppa conclusa il tasto principale dice «'+t+'»');
    if(/nuova stagione/i.test(await page.locator('#hNext').innerText()))throw new Error('a coppa conclusa il cruscotto parla di nuova stagione');
    await page.click('#hEvent');await vis('#event');
    if(await page.locator('#eReset').count())throw new Error('la coppa conclusa si puo\' ancora far ripartire');
    await page.click('#eCamp');await page.waitForTimeout(150);await page.click('#eBack');await vis('#home');
    if(!/Inizia partita/.test(await page.locator('#hPlayT').innerText()))throw new Error('dopo la coppa non si torna al campionato');
  });
  await step('slot carriera: una seconda carriera e il ritorno alla prima',async()=>{
    const team1=(await page.locator('#tCareerS').innerText().catch(()=>''));
    await vis('#home');const name1=await page.locator('#home .dname').first().innerText();
    await page.click('#hOpt');await vis('#opts');if(await page.locator('#opSlots [data-slot]').count()!==3)throw new Error('gli slot devono essere tre');
    await page.click('#opSlots [data-slot="2"]');await await vis('#league');await page.click('#lgList [data-lg="IT"]');await vis('#team');await page.click('#tSr button[data-k="B"]');await page.click('.tteam >> nth=3');await vis('#rpv');await page.click('#rpGo');await vis('#coachsel');await page.click('#coGo');await page.waitForTimeout(300);await vis('#home');
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
  await step('timeout: uno a partita, ferma il gioco e si riprende',async()=>{
    await page.click('#tQuick');await vis('#quick');await page.selectOption('#qS','0');await page.click('#qPlay');await page.waitForTimeout(600);
    if(await page.locator('#menu').isVisible())await page.click('#bGo');
    await page.waitForSelector('#bTO:not(.hidden)',{timeout:40000});   // compare quando hai il disco in mano
    // tipo di lancio con le dita: una = piatto, due (o piu') = alto (il rovesciato); niente pulsante in attacco. Si annulla riportando il dito al punto di partenza
    if(await page.locator('#bHammer:not(.hidden)').count())throw new Error('in attacco non deve esserci il pulsante dei tipi di lancio');
    {const cdp=await page.context().newCDPSession(page),TT=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts}),aim=async()=>await page.locator('canvas').first().getAttribute('data-aim');
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
  await step('primi passi: le schede compaiono nelle prime partite, ricordano cio\' che hai visto e si saltano',async()=>{
    const c=await browser.newContext({viewport:{width:844,height:390}}),p=await c.newPage();
    await p.goto('file://'+OUT);await p.waitForTimeout(400);
    await p.click('#tQuick');await p.selectOption('#qS','0');await p.click('#qPlay');await p.waitForTimeout(600);
    if(await p.locator('#menu').isVisible())await p.click('#bGo');
    await p.waitForSelector('#pp:not(.hidden)',{timeout:15000});
    if(!/come si gioca/i.test(await p.locator('#ppT').innerText()))throw new Error('la prima scheda deve spiegare come si gioca');
    await p.keyboard.press('Escape');await p.waitForTimeout(150);if(await p.locator('#pause:not(.hidden)').count())throw new Error('con la scheda aperta Esc non deve aprire la pausa sotto');
    await p.click('#ppOk');await p.waitForSelector('#pp:not(.hidden)',{timeout:15000});
    if(!/ricevi/i.test(await p.locator('#ppT').innerText()))throw new Error('la seconda scheda deve spiegare la ricezione del pull');
    await p.keyboard.press('Enter');await p.waitForTimeout(200);   // Invio = «Capito»
    await p.waitForSelector('#pp:not(.hidden)',{timeout:20000});   // la scheda sul lancio compare quando hai il disco
    if(!/lanciare/i.test(await p.locator('#ppT').innerText()))throw new Error('la terza scheda deve spiegare il lancio');
    await p.click('#ppSkip');if(await p.locator('#pp:not(.hidden)').count())throw new Error('«Salta il tutorial» deve chiudere la scheda');
    const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('ultimate-primi')));
    if(!st.off||st.d.length!==3)throw new Error('lo stato deve ricordare tre schede viste e il tutorial spento: '+JSON.stringify(st));
    await p.waitForTimeout(2500);if(await p.locator('#pp:not(.hidden)').count())throw new Error('saltato il tutorial non devono comparire altre schede');
    await c.close();
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
    await page.click('#tSchool');await vis('#school');if(await page.locator('.tles [data-step]').count()!==7)throw new Error('mancano le sette lezioni del tutorial');
    await page.click('#scBox .schrow [data-go="tut"]');await page.waitForTimeout(700);await vis('#coach');
    await page.click('#bExit');await vis('#pause');await page.click('#paQuit');await page.waitForTimeout(300);await vis('#school');
  });
  await step('menu iniziale: Carriere, nuova carriera in un altro slot e ritorno, senza passare dalle Opzioni',async()=>{
    await page.click('#tBack').catch(()=>{});
    if(!(await page.locator('#title').isVisible())){await page.goto('file://'+OUT);await page.waitForTimeout(400);}
    await page.click('#tSlots');await vis('#slots');
    const full=await page.locator('#csBox [data-cgo]').count();if(full<1)throw new Error('la carriera esistente non compare tra gli slot');
    const empty=await page.locator('#csBox .csl:not(:has([data-cgo])) [data-cnew]').first();
    const k=+(await empty.getAttribute('data-cnew'));await empty.click();await vis('#league');await page.click('#lgBack');await vis('#slots');   // ripensamento: la carriera di prima resta
    if(await page.locator('#csBox [data-cgo]').count()!==full)throw new Error('tornando indietro la carriera di prima e\' sparita');
    await page.click('#csBox [data-cnew="'+k+'"]');await vis('#league');await page.click('#lgList [data-lg="IT"]');await vis('#team');
    // seconda carriera: partenza da subentrato (squadra in crisi a una giornata dalla fine), con «Un'altra squadra»
    await page.click('#tMode button[data-k="sub"]');await page.click('#tSr button[data-k="B"]');await vis('#tReAcc');await page.click('#tReAlt');await vis('#tReAcc');
    await page.click('#tReAcc');await vis('#coachsel');await page.click('#coGo');await page.waitForTimeout(300);await vis('#home');
    if(!/posto/.test(await page.locator('#hInfo').innerText()))throw new Error('il subentro deve mostrare la posizione in classifica');
    await page.click('#hBack');await vis('#title');await page.click('#tSlots');
    if(await page.locator('#csBox [data-cgo]').count()!==full+1)throw new Error('la nuova carriera non e\' nello slot '+k);
    const other=await page.locator('#csBox [data-cgo]:not([data-cgo="'+k+'"])').first();await other.click();await vis('#home');
    await page.click('#hBack');await vis('#title');
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
    await p.click('#qBack');await p.click('#tSet');await p.click('#sRot');
    if(await p.evaluate(()=>document.documentElement.classList.contains('rotp')))throw new Error('la rotazione non si spegne dalle Impostazioni');
    await p.click('#sRot').catch(()=>{});await ctx.close();
    if(er.length)throw new Error('errore in verticale: '+er[0]);
  });
  await browser.close();
  for(const d of done)console.log('  [OK] '+d);
  if(errs.length){console.error('Prova nel browser: '+errs.length+' problemi');for(const e of errs)console.error('  [NO] '+e);process.exit(1);}
  console.log('Prova nel browser: ok ('+done.length+' percorsi)');
})().catch(e=>{console.error('Prova nel browser interrotta: '+e.message);process.exit(1);});
