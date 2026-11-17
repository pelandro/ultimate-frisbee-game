#!/usr/bin/env node
/* Prova della revisione degli Overall 2026 (src/30-js/30-carriera/00-dati-ovr-2026.js, 00-ovr-2026.js, 38-ovr/): costruisce le rose di tutti i club nel browser e controlla che
   ogni giocatore del foglio abbia l'Overall esatto, che chi e' uscito non ci sia piu', che non ci siano doppioni e che la forza dichiarata dei club del foglio sia quella delle loro rose.
   Uso:  node tools/test-ovr.js            (verifica)
         node tools/test-ovr.js --calcola  (stampa OVR_POW: la forza reale delle rose dei club del foglio, da incollare in 00-ovr-2026.js dopo aver cambiato i dati)
   Se Playwright non c'e' la prova viene saltata (in CI e' obbligatoria). */
const fs=require('fs'),os=require('os'),path=require('path'),{build}=require('./build');
let chromium;
try{({chromium}=require('playwright'));}
catch(e){if(process.env.CI){console.error('Playwright non installato');process.exit(1);}console.log('Prova degli Overall saltata: Playwright non e\' installato');process.exit(0);}
const OUT=path.join(os.tmpdir(),'ultimate-ovr-'+process.pid+'.html'),calcola=process.argv.includes('--calcola');
(async()=>{
  let h=build();const i=h.lastIndexOf('})();');
  // solo per la prova: espone le funzioni del gioco (che vive in un ambito unico, senza moduli)
  h=h.slice(0,i)+';window.__OVR=()=>({OVR_2026,OVR_OUT,OVR_FORCE,OVR_ADD,OVR_PART,ovrPart,OVR_DUAL_US,OVR_POW:typeof OVR_POW!=="undefined"?OVR_POW:{},ovrEntries,ovrKey,foreignRoster,allClubs,rosterPower,rosterLevel,ovr,SQ_MAX,usRoster,lnRoster,realRoster,REAL,realOpt,US_TEAM,LN_BY});'+h.slice(i);
  fs.writeFileSync(OUT,h);
  const browser=await chromium.launch(),page=await browser.newPage(),errs=[];
  page.on('pageerror',e=>errs.push('errore JavaScript: '+e.message));
  await page.goto('file://'+OUT);await page.waitForTimeout(400);
  const res=await page.evaluate(()=>{
    const X=__OVR(),bad=[],pow={},club=n=>X.foreignRoster(n,'prova-ovr');
    let tot=0,cut=0;
    for(const c of X.allClubs()){
      const ro=club(c),keys=new Map();
      for(const o of ro){const k=X.ovrKey(o.full);if(keys.has(k))bad.push('doppione in '+c+': '+o.full);keys.set(k,o);
        const v=X.ovr(o);if(!(v>=25&&v<=99))bad.push('Overall fuori scala in '+c+': '+o.full+' '+v);if(!(o.age>=14&&o.age<=70))bad.push('eta\' strana in '+c+': '+o.full+' '+o.age);}
      for(const n of (X.OVR_OUT[c]||[]))if(keys.has(X.ovrKey(n)))bad.push(n+' dovrebbe essere uscito da '+c);
      const E=X.ovrEntries(c);if(!E.length)continue;
      pow[c]=Math.round(X.rosterLevel(ro)*10)/10;
      const minOv=Math.min(...ro.map(o=>X.ovr(o)));
      for(const e of E){
        if(X.OVR_DUAL_US.has(c+'|'+e.k))continue;
        const o=keys.get(e.k);tot++;
        if(!o){if(ro.length>=X.SQ_MAX&&e.ov<=minOv+0){cut++;continue;}bad.push('manca '+e.nm+' '+e.sur+' ('+c+')');continue;}
        if(X.ovr(o)!==e.ov)bad.push(e.nm+' '+e.sur+' ('+c+'): Overall '+X.ovr(o)+' invece di '+e.ov);
        if(e.ex&&e.age&&o.age!==e.age)bad.push(e.nm+' '+e.sur+' ('+c+'): eta\' '+o.age+' invece di '+e.age);
      }
    }
    // la rosa che parte tua (stessa costruzione delle avversarie, altro seme) deve avere gli stessi Overall del foglio
    let mine=0;
    for(const c of X.allClubs()){
      const E=X.ovrEntries(c);if(!E.length)continue;
      const ro=X.US_TEAM[c]?X.usRoster(c,'prova-ovr-mia'):(X.LN_BY[c]?X.lnRoster(c,'prova-ovr-mia'):X.realRoster(X.REAL[c]||[],'prova-ovr-mia',X.realOpt(c,9)));
      const by=new Map(ro.map(o=>[X.ovrKey(o.full),o]));
      for(const e of E){const o=by.get(e.k);if(!o)continue;mine++;if(X.ovr(o)!==e.ov)bad.push('rosa che parte tua, '+e.nm+' '+e.sur+' ('+c+'): Overall '+X.ovr(o)+' invece di '+e.ov);}
    }
    // correzioni singole ai club fuori dal foglio
    for(const c in X.OVR_PART){const ro=club(c);for(const e of X.ovrPart(c)){const o=ro.find(x=>X.ovrKey(x.full)===e.k);if(!o)bad.push('manca '+e.nm+' '+e.sur+' ('+c+')');else if(X.ovr(o)!==e.ov)bad.push(e.nm+' '+e.sur+' ('+c+'): Overall '+X.ovr(o)+' invece di '+e.ov);else tot++;}}
    // valori bloccati: affidabilita' alta, forzati (OVR_FORCE) e aggiunti a mano (OVR_ADD) hanno il valore del foglio o quello chiesto, senza scarti di club ne' ritocchi
    for(const c in X.OVR_2026){const by=new Map(X.ovrEntries(c).map(e=>[e.k,e])),fo=X.OVR_FORCE[c]||{},fk=new Set(Object.keys(fo).map(X.ovrKey));
      for(const r of X.OVR_2026[c]){const k=X.ovrKey(r[1]+' '+r[0]),e=by.get(k);if(!e)continue;
        if(fk.has(k)){const v=Object.keys(fo).find(n=>X.ovrKey(n)===k);if(e.ov!==fo[v])bad.push('forzato modificato: '+r[1]+' '+r[0]+' ('+c+')');}
        else if(r[6]==='a'&&e.ov!==r[2])bad.push('affidabilita\' alta modificata: '+r[1]+' '+r[0]+' ('+c+'): '+r[2]+' -> '+e.ov);}
      for(const r of (X.OVR_ADD[c]||[])){const e=by.get(X.ovrKey(r[1]+' '+r[0]));if(e&&e.ov!==r[2])bad.push('aggiunto a mano modificato: '+r[1]+' '+r[0]+' ('+c+')');}}
    // richieste puntuali del progetto
    const find=(c,n)=>club(c).find(o=>X.ovrKey(o.full)===X.ovrKey(n));
    const p=find('Cotarica Grandes','Pietro Puppi');if(!p||X.ovr(p)!==87)bad.push('Puppi deve essere 87');
    for(const n of ['Carlo Mazzo','Marco Ragusa']){const q=find('CUS Padova Barbastreji',n);if(!q||X.ovr(q)!==86||q.r!=='H')bad.push(n+' deve essere un handler da 86');}
    return {bad,pow,tot,cut,mine,declared:X.OVR_POW};
  });
  await browser.close();try{fs.unlinkSync(OUT);}catch(e){}
  if(calcola){console.log('const OVR_POW='+JSON.stringify(res.pow).replace(/","/g,'","')+';');return;}
  for(const c in res.pow){const d=res.declared[c];if(d===undefined)res.bad.push('forza dichiarata mancante: '+c+' (rosa '+res.pow[c]+')');else if(Math.abs(d-res.pow[c])>0.35)res.bad.push('forza di '+c+': dichiarata '+d+', rosa '+res.pow[c]);}
  const all=errs.concat(res.bad);
  if(all.length){console.error('Prova degli Overall: '+all.length+' problemi');for(const e of all.slice(0,40))console.error('  [NO] '+e);process.exit(1);}
  console.log(`Prova degli Overall: ok (${res.tot} giocatori del foglio esatti in ${Object.keys(res.pow).length} club, anche nella rosa che parte tua (${res.mine})${res.cut?', '+res.cut+' oltre il limite di rosa':''})`);
})().catch(e=>{console.error('Prova degli Overall interrotta: '+e.message);process.exit(1);});
