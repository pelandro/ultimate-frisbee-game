/* ===================== CAMPO DI ALLENAMENTO: tutorial guidato, allenamento libero, sfide di abilita' =====================
   Tutto gira sul motore vero (G.drill): cambia solo cio' che succede dopo una presa, una meta o un turnover. La carriera non viene toccata. */
const DR={on:false,kind:'',step:0,cnt:0,score:0,tries:0,ch:null,last:'',lastT:0,pulled:false,free:{side:'att',def:'off'}};
const TN={on:false};
const TUT_KEY='ultimate-scuola';
let SCH={tut:false,best:{}};
try{const o=JSON.parse(localStorage.getItem(TUT_KEY)||'null');if(o&&typeof o==='object')SCH={tut:!!o.tut,lv:o.lv|0,best:o.best||{}};}catch(e){}   // lv: lezioni del tutorial superate (si riprende da li')
const schSave=()=>{try{localStorage.setItem(TUT_KEY,JSON.stringify(SCH));}catch(e){}};
// lezioni del tutorial: ognuna prepara il campo e si supera FACENDO la cosa spiegata
const TUT_STEPS=[
  {id:'thr',def:'off',x0:14,n:3,t:'1 · Il lancio',x:'Tocca lo schermo, trascina il dito ALL’INDIETRO come una fionda e rilascia: il disco parte nella direzione opposta. Più trascini, più va lontano.',g:'Completa 3 passaggi'},
  {id:'call',def:'off',x0:14,n:2,t:'2 · Chiama il taglio',x:'Tocca un compagno: gli chiedi di smarcarsi (VIENI o LUNGO). Lancia verso dove sta correndo, non dove si trova.',g:'Completa 2 passaggi a un compagno che hai chiamato'},
  {id:'style',def:'off',x0:14,n:1,t:'3 · Tipi di lancio',x:'Il lancio si sceglie con le dita: una dita PIATTO (teso e veloce), due dita ALTO (scavalca i difensori, il rovesciato). Trascina con due dita (con la tastiera: Maiusc) e lancia ALTO.',g:'Completa 1 lancio ALTO'},
  {id:'stall',def:'mark',x0:14,n:3,t:'4 · Marcatore e stall',x:'Ora un difensore ti marca e conta fino a 10: se arriva in fondo perdi il disco. Lancia sul lato che lascia libero, lontano dalle sue braccia.',g:'Completa 3 passaggi prima dello stall'},
  {id:'goal',def:'on',x0:34,n:1,t:'5 · La meta',x:'Difesa completa. Si segna ricevendo il disco nella zona di meta avversaria (a destra). Avanza con passaggi sicuri o prova il lancio lungo.',g:'Segna una meta'},
  {id:'def',side:'def',def:'on',x0:22,n:1,t:'6 · La difesa',x:'In partita la difesa è automatica (si cambia dalle Impostazioni). Qui provi quella manuale: il tuo difensore ha il cerchio azzurro, trascina per muoverlo e resta tra il tuo uomo e il disco. Quando lampeggiano, premi i tasti per handblock e tuffo.',g:'Recupera il disco'},
  {id:'pull',pull:true,n:1,t:'7 · Il pull',x:'Ogni meta comincia col pull, in due tocchi. Primo tocco: ferma la POTENZA nel verde. Secondo tocco: ferma la DIREZIONE al centro. Sul campo vedi dove cadrà il disco e che pull sarebbe: cerca il GRAN PULL, ben in fondo alla meta.',g:'Tira un pull che resta in campo'}
];
// sfide: ogni lancio (o possesso) e' una prova; il punteggio da' una medaglia
const CHAL={
  prec:{name:'Precisione',def:'off',x0:10,tries:10,unit:'Lanci',medal:[80,115,140],txt:'10 lanci senza difesa: 10 punti a presa, +5 se guadagni almeno 15 metri, 20 se è una meta.'},
  brk:{name:'Break',def:'mark',x0:16,tries:8,unit:'Lanci',medal:[45,75,100],txt:'8 lanci col marcatore addosso: 15 punti per ogni passaggio riuscito sul lato che lui chiude, 3 sul lato aperto.'},
  huck:{name:'Huck e duelli',def:'on',x0:20,tries:8,unit:'Lanci',medal:[60,110,160],txt:'8 lanci lunghi contro la difesa: contano solo le prese con almeno 25 metri guadagnati (tanti punti quanti i metri, +15 in meta).'},
  dif:{name:'Difesa e layout',side:'def',def:'on',x0:22,tries:6,unit:'Azioni',medal:[60,100,140],txt:'6 azioni avversarie da fermare: 30 punti se il disco lo recupera il difensore che stai guidando, 10 se lo recupera un compagno, 0 se segnano.'}
};
const medalOf=(c,v)=>v>=c.medal[2]?3:(v>=c.medal[1]?2:(v>=c.medal[0]?1:0));
const MEDAL_N=['Nessuna medaglia','Bronzo','Argento','Oro'];
function renderSchool(){
  $('tSchoolS').textContent=SCH.tut?'Tutorial, pratica e sfide':'Nuovo? Inizia dal tutorial';
  let h='<div class="schg">';
  const nL=TUT_STEPS.length,done=SCH.tut?nL:Math.min(nL,SCH.lv|0);
  h+=`<div class="ccard"><h3>Tutorial guidato</h3><p>Sette lezioni brevi sul campo: ogni lezione si supera facendo ciò che spiega. Puoi ripeterne una sola quando vuoi.</p><div class="tprog2"><span><i style="width:${Math.round(done/nL*100)}%"></i></span><b>${done}/${nL}</b></div><div class="schrow"><button type="button" class="go" data-go="tut" data-step="${done>0&&done<nL?done:0}">${done>=nL?'Ripeti il tutorial':(done?'Riprendi: lezione '+(done+1):'Inizia il tutorial')}</button></div><div class="tles">${TUT_STEPS.map((t,i)=>`<button type="button" class="sec${i<done?' ok':''}" data-go="tut" data-step="${i}" title="${esc(t.g||'')}">${i<done?'✓ ':''}${esc(t.t)}</button>`).join('')}</div>
    <h3 style="margin-top:10px">Allenamento libero</h3><p>Nessun punteggio e nessun cronometro: si riparte da fermo dopo ogni meta o turnover, con l’energia sempre piena.</p><div class="schrow"><select class="qs" id="scSide"><option value="att">Attacco</option><option value="def">Difesa</option></select><select class="qs" id="scDef"><option value="off">Senza avversari</option><option value="mark">Solo il marcatore</option><option value="on">Difesa completa</option></select><button type="button" class="go" data-go="free">Entra in campo</button></div></div>`;
  h+=`<div class="ccard"><h3>Sfide di abilità</h3>${Object.keys(CHAL).map(k=>{const c=CHAL[k],b=SCH.best[k];return `<div class="chal"><div><b>${c.name}</b><small>${c.txt}</small><span class="md"><span class="medal m${b===undefined?0:medalOf(c,b)}"></span>${b===undefined?'Mai provata':'Record '+b+' · '+MEDAL_N[medalOf(c,b)]} · bronzo ${c.medal[0]}, argento ${c.medal[1]}, oro ${c.medal[2]}</span></div><button type="button" class="go" data-go="${k}">Gioca</button></div>`;}).join('')}</div>`;
  $('scBox').innerHTML=h+'</div>';
  $('scSide').value=DR.free.side;$('scDef').value=DR.free.def;
  $('scDef').disabled=DR.free.side==='def';
}
function startDrill(kind,step){   // step: lezione da cui parte il tutorial (0 = dall'inizio)
  const all=[].concat(SERIES.A,SERIES.B,SERIES.C),a=hasCareer()&&REAL[SV.team]?SV.team:'Grem',b=all.find(n=>n!==a&&TEAM[n].series===TEAM[a].series&&REAL[n])||all.find(n=>n!==a);
  if(hasCareer()){persist();QM.bak=JSON.stringify(SV);}else QM.bak=null;   // la carriera resta com'e': viene rimessa all'uscita
  QM.on=true;UT.on=false;DR.on=true;DR.kind=kind==='tut'||kind==='free'?kind:'ch';DR.ch=CHAL[kind]?kind:null;DR.step=kind==='tut'?clamp(step|0,0,TUT_STEPS.length-1):0;DR.cnt=0;DR.score=0;DR.tries=0;DR.last='';DR.pulled=false;
  setSquad(qRoster(a,9));applyRoster(qRoster(b,7));
  SQ.forEach(p=>{p.injNew=false;p.inj=0;p.cond=100;});
  G.formB=0;G.lines=null;G.injK=0;
  G.oppName=b;G.myName=a;G.matchLabel=kind==='tut'?'Tutorial':(kind==='free'?'Allenamento libero':'Sfida · '+CHAL[kind].name);
  newGame();G.lvl=[0,1];G.oppPlus=0;G.idn=[null,teamIdentity(b,T[1])];G.xtr=false;G.hint=true;G.routes=true;G.inMatch=true;G.recorded=true;G.auto=false;
  G.opp={att:'vert',def:'man_out'};
  const c=kind==='tut'?TUT_STEPS[DR.step]:(kind==='free'?{side:DR.free.side,def:DR.free.side==='def'?'on':DR.free.def,x0:DR.free.side==='def'?22:16}:CHAL[kind]);
  G.drill={side:c.side||'att',def:c.def||'on',x0:c.x0||14,pull:!!c.pull,wait:0,live:false,done:false};
  hideScreens();$('over').classList.add('hidden');$('drEnd').classList.add('hidden');
  drillStart();cam.snap=true;
}
function drillNext(delay,done){const D=G.drill;if(!D)return;D.live=false;D.wait=delay;D.done=!!done;}
function drSay(txt){DR.last=txt;DR.lastT=G.tick;}
function tutNext(){
  DR.step++;DR.cnt=0;DR.pulled=false;SCH.lv=Math.max(SCH.lv|0,DR.step);schSave();   // lezione superata: resta segnata anche se esci a meta' tutorial
  if(DR.step>=TUT_STEPS.length){SCH.tut=true;schSave();drSay('Tutorial completato!');drillNext(1.6,true);return;}
  const c=TUT_STEPS[DR.step];Object.assign(G.drill,{side:c.side||'att',def:c.def||'on',x0:c.x0||14,pull:!!c.pull});
  drSay('Ottimo! Prossima lezione');HOOKS.sfx('ui');drillNext(1.7);
}
HOOKS.drill=(k,team,p,f)=>{
  if(!DR.on||!G.drill)return;
  if(k==='end'){drillEnd();return;}
  if(DR.kind==='free'){if(k==='goal'||k==='to')drillNext(1.4);return;}
  if(DR.kind==='tut'){
    const st=TUT_STEPS[DR.step];let ok=false;
    if(st.id==='thr'||st.id==='stall')ok=k==='catch'&&team===0;
    else if(st.id==='call'){ok=k==='catch'&&team===0&&p.calledT!==undefined&&G.tick-p.calledT<7;if(k==='catch'&&team===0&&!ok)drSay('Presa! Ma prima tocca il compagno per chiamarlo');}
    else if(st.id==='style'){ok=k==='catch'&&team===0&&!!f.high;if(k==='catch'&&team===0&&!ok)drSay('Presa! Ora lancia ALTO: trascina con due dita (o tieni Maiusc)');}
    else if(st.id==='goal')ok=k==='goal'&&team===0;
    else if(st.id==='def')ok=k==='to'&&team===0;
    if(ok){DR.cnt++;if(DR.cnt<st.n)drSay('Bene!');}
    if(DR.cnt>=st.n){tutNext();return;}
    if(k==='goal'||k==='to'){if(k==='to'&&team===1&&st.id!=='def')drSay(st.id==='stall'?'Disco perso: lancia prima che lo stall arrivi a 10':'Disco perso: riprova');if(st.id==='def'&&k==='goal')drSay('Hanno segnato: riprova');drillNext(1.5);}
    return;
  }
  // sfide
  const c=CHAL[DR.ch];let pts=0,used=false,reset=false;
  if(DR.ch==='prec'){
    if(k==='catch'&&team===0){used=true;const gn=p.x-f.sx,ez=p.x>=FIELD_L-EZ;pts=ez?20:10+(gn>=15?5:0);drSay(ez?'Meta! +20':'Presa +'+pts);}
    else if(k==='to'&&team===1){used=true;reset=true;drSay('Lancio perso');}
    else if(k==='goal')reset=true;
  }else if(DR.ch==='brk'){
    if(k==='catch'&&team===0){used=true;pts=f.brk?15:3;drSay(f.brk?'Break! +15':'Lato aperto +3');if(p.x>=FIELD_L-EZ-12)reset=true;}
    else if(k==='to'&&team===1){used=true;reset=true;drSay('Disco perso');}
    else if(k==='goal')reset=true;
  }else if(DR.ch==='huck'){
    if(k==='catch'&&team===0){used=true;reset=true;const gn=Math.round(p.x-f.sx);if(gn>=25){pts=gn+(p.x>=FIELD_L-EZ?15:0);drSay('Huck di '+gn+' m! +'+pts);}else drSay('Troppo corto: '+gn+' m');}
    else if(k==='to'&&team===1){used=true;reset=true;drSay('Lancio perso');}
    else if(k==='goal')reset=true;
  }else if(DR.ch==='dif'){
    if(k==='to'&&team===0){used=true;reset=true;pts=p&&p===G.ctrl?30:10;drSay(pts===30?'Recupero tuo! +30':'Recupero di un compagno +10');}
    else if(k==='goal'&&team===1){used=true;reset=true;drSay('Hanno segnato');}
    else if(k==='goal')reset=true;
  }
  if(used){DR.tries++;DR.score+=pts;}
  if(DR.tries>=c.tries){drillNext(1.5,true);return;}
  if(reset)drillNext(1.3);
};
function drillEnd(){
  let t,s2,m;
  if(DR.kind==='tut'){t='Tutorial completato';s2='Ora conosci i comandi fondamentali.';m='Prova le sfide di abilità o inizia una carriera.';$('deAgain').classList.add('hidden');}
  else{
    const c=CHAL[DR.ch],old=SCH.best[DR.ch],md=medalOf(c,DR.score),rec=old===undefined||DR.score>old;
    if(rec){SCH.best[DR.ch]=DR.score;schSave();}
    t=c.name+': '+DR.score+' punti';s2=MEDAL_N[md]+(md<3?` · per ${MEDAL_N[md+1].toLowerCase()} servono ${c.medal[md]} punti`:'');m=rec?(old===undefined?'Primo risultato registrato.':'Nuovo record! Prima era '+old+'.'):'Il tuo record resta '+old+'.';
    $('deAgain').classList.remove('hidden');
    if(md>=2)HOOKS.sfx('goal',0);
  }
  $('deT').textContent=t;$('deS').textContent=s2;$('deM').textContent=m;$('drEnd').classList.remove('hidden');G.schemeOpen=true;
}
// numeri della barra in alto durante l'allenamento: punti e prove nelle sfide
function drHud(i){
  if(DR.kind==='ch'){const c=CHAL[DR.ch];return i===0?DR.score:(i===1?Math.max(0,c.tries-DR.tries):(i===2?'Punti':c.unit+' rimasti'));}
  return i===2?(DR.kind==='tut'?'Tutorial':'Allenamento'):(i===3?'':'');
}
// riquadro dell'allenatore (in alto al centro) e controllo della lezione sul pull
function drillTick(){
  const co=$('coach');
  if(!DR.on||!G.drill||!(G.mode==='play'||G.mode==='ready')){co.classList.add('hidden');return;}
  const fresh=DR.last&&G.tick-DR.lastT<2.2;
  let h='';
  if(DR.kind==='tut'){
    const st=TUT_STEPS[Math.min(DR.step,TUT_STEPS.length-1)];
    if(st.pull&&G.drill.live){   // il pull e' riuscito se, quando qualcuno raccoglie il disco, non c'e' brick (cioe' non e' uscito)
      if(G.pull)DR.pulled=true;
      else if(DR.pulled&&G.mode==='play'&&G.holder){DR.pulled=false;if(!G.brickWait){DR.cnt++;tutNext();}else{drSay('Fuori dal campo: potenza nel verde, direzione al centro');drillNext(1.6);}}
    }
    h=`<b>${st.t}</b>${st.x}<i>${fresh?DR.last:st.g+(st.n>1?' · '+DR.cnt+'/'+st.n:'')}</i>`;
  }else if(DR.kind==='free')h=`<b>Allenamento libero</b>${G.drill.side==='def'?'Difendi: trascina per muovere il difensore azzurro':'Attacca verso destra: trascina all’indietro e rilascia per lanciare'}${fresh?`<i>${DR.last}</i>`:''}`;
  else{const c=CHAL[DR.ch];h=`<b>${c.name}</b><i>${fresh?DR.last:'Prova '+Math.min(c.tries,DR.tries+1)+' di '+c.tries}</i>`;}
  if(co.dataset.h!==h){co.dataset.h=h;co.innerHTML=h;}
  co.classList.remove('hidden');
}
$('scBox').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)startDrill(b.dataset.go,+(b.dataset.step||0));});
$('scBox').addEventListener('change',e=>{if(e.target.id==='scSide'){DR.free.side=e.target.value;$('scDef').disabled=DR.free.side==='def';}else if(e.target.id==='scDef')DR.free.def=e.target.value;});
$('scBack').addEventListener('click',()=>showScreen('title'));
$('tSchool').addEventListener('click',()=>showScreen('school'));
$('deOk').addEventListener('click',()=>{exitQuick('school');});
$('deAgain').addEventListener('click',()=>{const k=DR.ch;$('drEnd').classList.add('hidden');G.schemeOpen=false;if(k){DR.score=0;DR.tries=0;DR.last='';drillStart();cam.snap=true;}});
