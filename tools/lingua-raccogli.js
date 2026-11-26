// Raccoglie i testi italiani dell'interfaccia che il dizionario della lingua (src/30-js/20-ui/31-lingua-*.js) non ha ancora.
// Uso: node tools/lingua-raccogli.js [en] [file-uscita.json]. Gira il gioco in italiano, visita le schermate, la guida e il tutorial e confronta ogni testo con i dizionari:
// scrive {txt:[[frase,schermata]], blk:[[html del blocco,schermata]]}: txt va in LANG_TXT/LANG_PAT, blk (paragrafi con grassetti) in LANG_BLK.
const fs=require('fs'),path=require('path'),os=require('os');const {build}=require('./build');const {chromium}=require('playwright');
const lang=process.argv[2]||'en',out=process.argv[3]||path.join(os.tmpdir(),'lingua-mancanti-'+lang+'.json');
const F=path.join(os.tmpdir(),'gioco-lingua.html');fs.writeFileSync(F,build().replace('const hasSave=loadSave();','window.testCareer=s=>eval(s);const hasSave=loadSave();'));
(async()=>{
  const b=await chromium.launch(),p=await b.newPage({viewport:{width:844,height:390}});
  const seen=new Map(),seenB=new Map(),errs=[];p.on('pageerror',e=>errs.push(e.message));
  const grab=async tag=>{const r=await p.evaluate(l=>window.testCareer('lgMissing(document.body,'+JSON.stringify(l)+')'),lang);
    for(const t of r.txt)if(!seen.has(t))seen.set(t,tag);
    for(const t of r.blk)if(!seenB.has(t))seenB.set(t,tag);};
  const ev=s=>p.evaluate(x=>window.testCareer(x),s).catch(e=>errs.push(s+': '+e.message));
  await p.goto('file://'+F);await p.evaluate(()=>{localStorage.setItem('ultimate-primi','{"d":[],"m":0,"off":1}');localStorage.setItem('ultimate-lingua','it');localStorage.setItem('ultimate-stat-avviso','1');});await p.reload();await p.waitForTimeout(1500);
  await grab('titolo');
  await p.click('#tCareer');await p.waitForTimeout(300);await grab('slot');await p.click('[data-cnew="1"]');await p.waitForTimeout(300);await grab('nuova');
  await p.click('#lgList [data-div="m"]');await grab('campionati');await p.click('#lgList [data-lg="IT"]');await p.waitForTimeout(300);await grab('squadre');
  await p.click('.tteam >> nth=0');await p.waitForTimeout(300);await grab('rosa-iniziale');await p.click('#rpGo');await p.waitForTimeout(400);await grab('allenatore');await p.click('#coGo');await p.waitForTimeout(800);
  await grab('home-con-fumetto');await p.click('#tipOk').catch(()=>{});
  for(const id of ['tip','press','evt','intro','alerts'])await p.evaluate(id=>document.getElementById(id)?.classList.add('hidden'),id);
  for(const sc of ['home','roster','train','market','event','club']){await ev(`showScreen('${sc}')`);await p.waitForTimeout(300);await grab(sc);}
  await ev("openAlerts('posta')");await grab('posta');await ev("openAlerts('news')");await grab('notizie');await ev("$('alerts').classList.add('hidden')");
  await p.click('#hTodoB').catch(()=>{});await grab('questa-settimana');await ev("$('todoW').classList.add('hidden')");
  await p.click('#hMenu').catch(()=>{});await grab('menu-carriera');await p.click('#hOpt').catch(()=>{});await p.waitForTimeout(300);await grab('opzioni');
  for(const t of ['sTabGame','sTabCtl','sTabScr','sGoDiag']){await p.click('#'+t).catch(()=>{});await grab('opzioni-'+t);}
  await ev("$('opts').classList.add('hidden')");
  // modalita' fuori carriera
  await ev("QM.on=false;UT.on=false");
  for(const sc of ['quick','tourn','school','ut','utMode','utShop','utTeam','utEquip','utHero','utBoard']){await ev(`showScreen('${sc}')`);await p.waitForTimeout(300);await grab(sc);}
  await ev("uoEnter(false);const v=UT.packs.shift();UT.cur=utMakePack(v);UT.cur.forEach(x=>UT.col.push(x));utAuto();UT.packs=[];utSave();showScreen('utReal')");await p.waitForTimeout(500);await grab('real');
  await ev("showScreen('utTeam')");await grab('squadra-ut');await ev("showScreen('utShop')");await grab('negozio');await ev("showScreen('utEquip')");await grab('equip');
  await ev("$('ric').classList.remove('hidden')");await grab('riconoscimenti');await ev("$('ric').classList.add('hidden')");
  await ev("$('guide').classList.remove('hidden')");await grab('guida');await ev("$('guide').classList.add('hidden')");
  // tutorial: ogni capitolo e ogni lezione
  await ev("openTut()");await grab('tutorial');
  const ids=await p.evaluate(()=>window.testCareer('TUT.map(c=>[c.id,c.les.map(l=>l.id)])'));
  for(const [c,ls] of ids){await ev(`openTut('${c}')`);await grab('tutorial');for(const l of ls){await ev(`openTut('${c}','${l}')`);await grab('tutorial-lezione');}}
  await ev("$('tut').classList.add('hidden')");
  // frasi scritte nel codice e mostrate con textContent (Primi passi, fumetti): si mettono in una pagina di prova e si confrontano come le altre
  const lit=await p.evaluate(x=>window.testCareer(x),'('+function(){
    const o=[],str=f=>(String(f).match(/'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)||[]).map(x=>x.slice(1,-1)).filter(x=>/[A-Za-zÀ-ÿ]{3,}.* /.test(x)&&!/^[#.\w-]+$/.test(x));
    for(const s of PP_STEPS)for(const k of ['t','x','h','ok','retry']){const v=s[k];if(typeof v==='function')o.push(...str(v));else if(typeof v==='string')o.push(v);}
    for(const k in TIPS)o.push(TIPS[k]);
    return o;}.toString()+')()');
  await p.evaluate(l=>{let d=document.getElementById('lgProva');if(!d){d=document.createElement('div');d.id='lgProva';d.style.display='none';document.body.appendChild(d);}d.innerHTML='';for(const t of l){const e=document.createElement('p');e.textContent=t;d.appendChild(e);}},lit);
  await grab('primi-passi-fumetti');await p.evaluate(()=>document.getElementById('lgProva').remove());
  // testi dipinti nel campo: si registrano quelli passati a ptext durante una partita veloce
  await p.evaluate(x=>window.testCareer(x),'window.lgCanvas=new Set();{const o=lgC;lgC=function(s){if(typeof s==="string")window.lgCanvas.add(s);return o(s);};}');
  await ev("QM.on=false;UT.on=false;showScreen('quick')");await p.click('#qPlay').catch(()=>{});await p.waitForTimeout(500);
  await grab('partita-primipassi');
  await p.evaluate(()=>{try{localStorage.setItem('ultimate-primi','{"d":[],"m":9,"off":1}');}catch(e){}});await ev("PP.off=1;if(typeof ppHide==='function')ppHide();$('pp')&&$('pp').classList.add('hidden')");
  for(let k=0;k<12;k++){await p.waitForTimeout(1000);await p.mouse.click(300+k*7,200);if(k%4===3)await grab('partita');}
  await p.click('#bExit').catch(()=>{});await p.waitForTimeout(400);await grab('pausa');await p.click('#paGo').catch(()=>{});
  for(let k=0;k<16;k++){await p.click('#bSimPt',{timeout:1500}).catch(()=>{});await p.waitForTimeout(500);if(k===2)await grab('simula-meta');await ev("[...document.querySelectorAll('#evt button,#tipOk,#ppOk')].forEach(b=>b.click())").catch(()=>{});}
  await p.waitForTimeout(1500);await grab('fine-partita');
  const cv=await p.evaluate(()=>window.testCareer('[...window.lgCanvas]'));
  const trs=await p.evaluate(([l,x])=>window.testCareer('LANG='+JSON.stringify(l)+';'+JSON.stringify(x)+'.map(t=>lgC(t))'),[lang,cv]);
  cv.forEach((t,i)=>{if(trs[i]===t&&/[A-Za-zÀ-ÿ]{2,}/.test(t)&&!seen.has(t))seen.set(t,'campo');});
  const miss=[...seen].map(([t,g])=>[t,g]),missB=[...seenB].map(([t,g])=>[t,g]);
  fs.writeFileSync(out,JSON.stringify({txt:miss,blk:missB},null,1));
  console.log('frasi senza traduzione',miss.length,'· blocchi senza traduzione',missB.length,'→',out,errs.length?'\nerrori: '+errs.slice(0,5).join(' | '):'');await b.close();
})();
