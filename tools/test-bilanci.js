#!/usr/bin/env node
/* PROVA DEI PUNTI FISSI DEL BILANCIAMENTO (tools/bilanci/punti-fissi.js): carriere simulate nel gioco vero (Chromium senza finestra, come la prova
   nel browser) per l'economia di tutti i campionati e per la crescita dalla Serie C. Su GitHub dura meno di un minuto (su un computer lento anche mezz'ora): non fa parte di
   npm test, la lancia la verifica di GitHub solo quando una pull request cambia Overall, economia, strutture o crescita (vedi «files»).
   Uso:  npm run bilanci                     (tutto)
         node tools/test-bilanci.js economia (solo l'economia)   ·   node tools/test-bilanci.js crescita (solo la crescita dalla Serie C)
         node tools/test-bilanci.js --prova       (pochissime carriere corte: solo per vedere che la prova giri)
         node tools/test-bilanci.js --se-serve <rif>   (solo se i file cambiati rispetto a <rif>, per esempio origin/main, toccano gli equilibri) */
const fs=require('fs'),os=require('os'),path=require('path'),{execSync}=require('child_process'),{build}=require('./build');
const PF=require('./bilanci/punti-fissi');
if(process.argv.includes('--prova')){PF.economia.runs=PF.economia.runs.slice(0,2);PF.economia.seasons=1;PF.crescita.seeds=[1];PF.crescita.seasons=2;}   // solo per vedere che giri (le soglie qui non hanno senso)
const args=process.argv.slice(2),only=args.find(a=>a==='economia'||a==='crescita');
const si=args.indexOf('--se-serve');
if(si>=0){
  const ref=args[si+1]||'origin/main';let ch=[];
  try{ch=execSync(`git diff --name-only ${ref}...HEAD`,{encoding:'utf8'}).split('\n').filter(Boolean);}
  catch(e){try{ch=execSync(`git diff --name-only ${ref} HEAD`,{encoding:'utf8'}).split('\n').filter(Boolean);}catch(_){console.log('Punti fissi: non riesco a confrontare con '+ref+', provo tutto.');ch=['tools/test-bilanci.js'];}}
  const hit=ch.filter(f=>PF.files.some(r=>r.test(f)));
  if(!hit.length){console.log('Punti fissi del bilanciamento: nessun file che li riguarda e\' cambiato, prova saltata.');process.exit(0);}
  console.log('Punti fissi del bilanciamento: cambiati '+hit.slice(0,6).join(', ')+(hit.length>6?' e altri '+(hit.length-6):'')+'.');
}
let chromium;
try{({chromium}=require('playwright'));}catch(e){console.error('Serve Playwright (npm install && npx playwright install chromium).');process.exit(1);}
const ECO=fs.readFileSync(path.join(__dirname,'bilanci/pagina-economia.js'),'utf8'),CAR=fs.readFileSync(path.join(__dirname,'bilanci/pagina-carriera.js'),'utf8');
(async()=>{
  const t0=Date.now();
  // il gioco vive in una funzione chiusa: per lanciare le carriere da fuori si espone un eval dentro la chiusura, solo nella copia di prova
  let html=build();const mk='requestAnimationFrame(frame);\n})();',i=html.lastIndexOf(mk);
  if(i<0){console.error('Non trovo la fine del gioco nel file costruito.');process.exit(1);}
  html=html.slice(0,i)+'window.__ev=s=>eval(s);\n'+html.slice(i);
  const tmp=path.join(os.tmpdir(),'uf-bilanci-'+process.pid+'.html');fs.writeFileSync(tmp,html);
  const browser=await chromium.launch();
  const jobs=[];
  if(only!=='crescita')for(const r of PF.economia.runs)jobs.push({k:'eco',r,code:`(${ECO.trim()})(${JSON.stringify({team:r.team,mode:r.mode||0,trim:r.trim||0,seasons:PF.economia.seasons,seed:PF.economia.seed})})`});
  if(only!=='economia')for(const seed of PF.crescita.seeds)jobs.push({k:'car',seed,code:`(${CAR.trim()})(${JSON.stringify({seed,seasons:PF.crescita.seasons,skill:PF.crescita.skill,xp:PF.crescita.xp})})`});
  // le carriere piu' lunghe per prime, cosi' i processori restano occupati fino alla fine
  jobs.sort((a,b)=>(b.k==='car')-(a.k==='car'));
  const par=Math.max(2,Math.min(8,os.cpus().length)),errs=[];let next=0,done=0;
  const work=async()=>{
    while(next<jobs.length){
      const j=jobs[next++];const ctx=await browser.newContext({viewport:{width:844,height:390}}),pg=await ctx.newPage();
      pg.on('pageerror',e=>errs.push((j.r?j.r.team:'seme '+j.seed)+': '+e.message));
      try{
        await pg.goto('file://'+tmp);await pg.evaluate(()=>localStorage.setItem('ultimate-primi','{"d":[],"m":0,"off":1}'));await pg.reload();await pg.waitForTimeout(300);
        j.res=await pg.evaluate(s=>window.__ev(s),j.code);
      }catch(e){errs.push((j.r?j.r.team:'seme '+j.seed)+': '+e.message.split('\n')[0]);}
      await ctx.close();done++;process.stdout.write(`\r  carriere simulate: ${done}/${jobs.length}`);
    }
  };
  await Promise.all(Array.from({length:par},work));await browser.close();fs.unlinkSync(tmp);
  console.log(`  (${Math.round((Date.now()-t0)/1000)} s, ${par} alla volta)`);
  const fail=[],rows=[],chk=(ok,name,detail)=>{rows.push(`${ok?'  OK ':'  NO '} ${name}: ${detail}`);if(!ok)fail.push(name);};
  if(errs.length)chk(false,'Carriere simulate senza errori',errs.slice(0,4).join(' | '));
  // ---- economia ----
  const E=PF.economia,eco=jobs.filter(j=>j.k==='eco'&&j.res).map(j=>Object.assign({kind:j.r.kind},j.res));
  if(eco.length){
    const lab=x=>x.team+(x.mode==='max'?' (tutto al massimo)':'')+(x.trim?' (rosa a '+x.trim+')':'');
    const gain=x=>x.seasons.reduce((a,s)=>a+s.c1-s.c0,0)/x.seasons.length,base=eco.filter(x=>!x.mode&&!x.trim);
    console.log('\nEconomia ('+E.seasons+' stagioni, guadagno medio a stagione):');
    for(const x of eco)console.log(`  ${lab(x).padEnd(46)} ${String(Math.round(gain(x))).padStart(5)}  · cassa ${x.seasons.map(s=>s.c0+'→'+s.c1).join(', ')}${x.trim?' · vendite '+x.seasons.map(s=>s.sold).join('+'):''}`);
    const red=base.filter(x=>x.seasons.some(s=>s.min<0||s.fired));
    chk(!red.length,'E1 Nessuno in rosso giocando senza spendere',red.length?red.map(x=>lab(x)+' minimo '+Math.min(...x.seasons.map(s=>s.min))).join(', '):base.length+' club, cassa mai sotto zero');
    const mx=eco.filter(x=>x.mode==='max'),mxBad=mx.filter(x=>x.seasons.some(s=>s.fired)||x.seasons.reduce((a,s)=>a+s.red,0)>E.maxRedDays||x.seasons[x.seasons.length-1].c1<x.seasons[0].c0);
    chk(!mxBad.length,'E2 Chi e\' al vertice con strutture e staff al massimo resta in attivo',mx.map(x=>x.team+' '+x.seasons[0].c0+'→'+x.seasons[x.seasons.length-1].c1+(x.seasons.some(s=>s.red)?' ('+x.seasons.reduce((a,s)=>a+s.red,0)+' giornate in rosso)':'')).join(', '));
    const mid=base.filter(x=>x.kind==='mid'),midBad=mid.filter(x=>gain(x)<E.midSeason[0]||gain(x)>E.midSeason[1]);
    chk(!midBad.length,`E3 Meta' classifica in pari (tra ${E.midSeason[0]} e +${E.midSeason[1]} a stagione)`,mid.map(x=>x.team+' '+Math.round(gain(x))).join(', '));
    const top=base.filter(x=>x.kind==='top'),topBad=top.filter(x=>gain(x)<E.topSeason[0]||gain(x)>E.topSeason[1]);
    chk(!topBad.length,`E4 Vertice: 1-2 buoni acquisti a stagione (tra +${E.topSeason[0]} e +${E.topSeason[1]})`,top.map(x=>x.team+' '+Math.round(gain(x))).join(', '));
    const tr=eco.filter(x=>x.trim),trBad=[],trTxt=[];
    for(const x of tr){const b=base.find(y=>y.team===x.team),sale=x.seasons.reduce((a,s)=>a+s.sold,0),ex=b?gain(x)-gain(b):0;trTxt.push(`${x.team} vendite ${sale}, ${ex>=0?'+':''}${Math.round(ex)} a stagione`);if(sale>E.trimSale||ex>E.trimExtra)trBad.push(x);}
    chk(!trBad.length,`E5 Rose lunghe ridotte a 16: vendite fino a ${E.trimSale}, poi al massimo +${E.trimExtra} a stagione`,trTxt.join(', '));
  }
  // ---- crescita ----
  const G=PF.crescita,car=jobs.filter(j=>j.k==='car'&&j.res).map(j=>j.res);
  if(car.length){
    console.log('\nCrescita dalla Serie C (abilita\' +'+G.skill+', '+G.seasons+' stagioni):');
    const fA=c=>{const r=c.rows.find(r=>r.sr==='A');return r?r.s:null;},fT=c=>{const r=c.rows.find(r=>r.sr==='A'&&r.tit);return r?r.s:null;};
    for(const c of car)console.log(`  seme ${String(c.seed).padStart(2)}: ${c.rows.map(r=>r.sr+r.rank+(r.tit?'*':'')+'('+Math.round(r.me)+'/'+Math.round(r.riv)+')').join(' ')} · in A: ${fA(c)||'mai'}, scudetto: ${fT(c)||'mai'}`);
    const n=car.length,inA=car.filter(c=>fA(c)&&fA(c)<=G.reachA[0]).length,tit=car.filter(c=>fT(c)&&fT(c)<=G.title[0]).length,early=car.filter(c=>fT(c)&&fT(c)<G.early[0]).length;
    const fuga=[];for(const c of car)for(const r of c.rows)if(r.sr==='A'&&r.me-r.riv>G.runaway)fuga.push(`seme ${c.seed} stagione ${r.s}: ${r.me} contro ${r.riv}`);
    const w=car.reduce((a,c)=>a+c.win,0)/n;
    chk(inA>=G.reachA[1],`G1 In Serie A entro la ${G.reachA[0]}a stagione (almeno ${G.reachA[1]} su ${n})`,inA+' su '+n);
    chk(tit>=G.title[1],`G2 Primo scudetto entro la ${G.title[0]}a stagione (almeno ${G.title[1]} su ${n})`,tit+' su '+n+' · stagioni: '+car.map(c=>fT(c)||'mai').join(', '));
    chk(early<=G.early[1],`G3 Non troppo facile: scudetto prima della ${G.early[0]}a stagione al massimo in ${G.early[1]}`,early+' su '+n);
    chk(!fuga.length,`G4 Niente fughe in Serie A (al massimo ${G.runaway} punti sopra la seconda forza)`,fuga.length?fuga.slice(0,3).join(', '):'nessuna');
    chk(w>=G.win[0]&&w<=G.win[1],`G5 Vittorie tra il ${Math.round(G.win[0]*100)}% e il ${Math.round(G.win[1]*100)}%`,Math.round(w*100)+'%');
  }
  console.log('\nPunti fissi del bilanciamento:\n'+rows.join('\n'));
  if(fail.length){console.log('\nPUNTI FISSI NON RISPETTATI: '+fail.join(' · ')+'\nSe la modifica voleva davvero rendere il gioco piu\' facile o piu\' difficile, aggiorna tools/bilanci/punti-fissi.js (con il motivo); altrimenti va corretta.');process.exit(1);}
  console.log('\nPUNTI FISSI RISPETTATI');
})().catch(e=>{console.error(e);process.exit(1);});
