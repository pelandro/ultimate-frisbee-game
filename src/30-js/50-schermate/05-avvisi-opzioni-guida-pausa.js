/* ---- AVVISI: tutto cio' che succede ai giocatori (ritiri, infortuni e rientri, scontenti, offerte, crescita e declino). Si apre da solo quando c'e' una novita' ---- */
function renderAlerts(){
  const L=SV.alerts||[],nw=L.filter(a=>!a.seen).length;
  $('alSub').textContent=L.length?(nw?`${nw} novità · le scelte in sospeso restano qui finché non rispondi`:'Nessuna novità: qui resta la cronologia'):'Qui compare tutto ciò che succede ai tuoi giocatori.';
  $('alBody').innerHTML=L.length?L.map(a=>{
    const kd=AL_KIND[a.k]||['Avviso','#c2cbe6'],p=a.full?byFull(a.full):null;let act='';
    if(!a.done&&(a.act==='job'||a.act==='trade'))act=crossLgButtons(a);   // offerte dell'altra lega (35-usa/05-lega-incrociata.js)
    else if(!a.done&&p){
      if(a.act==='stay'&&p.ret===1)act=`<button type="button" class="sec" data-al="${a.id}" data-do="stay">Chiedigli un altro anno (${stayCost(p)} crediti)</button>`;
      else if(a.act==='offer'&&SV.offer&&SV.offer.full===a.full)act=`<button type="button" class="go" data-al="${a.id}" data-do="yes">Accetta (+${SV.offer.price})</button><button type="button" class="sec" data-al="${a.id}" data-do="no">Rifiuta</button>`;
      else if(a.act==='unhappy'&&p.mood===2)act=`<button type="button" class="sec" data-al="${a.id}" data-do="prom">Promettigli spazio</button><button type="button" class="sec" data-al="${a.id}" data-do="sell">Cedilo (+${sellValue(p)})</button>`;
    }
    return `<div class="ali${a.seen?'':' new'}"><span class="alk" style="background:${kd[1]}">${kd[0]}</span><div><p>${esc(a.txt)}</p>${a.res?`<div class="res">${esc(a.res)}</div>`:''}${act?`<div class="schrow">${act}</div>`:''}<small>Stagione ${a.s} · giornata ${a.r}</small></div></div>`;
  }).join(''):'<p class="note">Ancora nessun avviso.</p>';
}
function openAlerts(){renderAlerts();$('alerts').classList.remove('hidden');}
/* Tre livelli di avviso. EMERGENZE (infortuni, addii) e DECISIONI (ritiro annunciato, offerta, richiesta di cessione, sfide) aprono il riquadro da sole, una volta.
   Le NOTIZIE (crescita, rientri, umore tornato, club) non interrompono: accendono il numero sulla campanella e una riga sul cruscotto. */
const AL_URGENT={inj:1,bye:1,off:1};
const urgentAlerts=()=>(SV.alerts||[]).filter(a=>!a.seen&&(AL_URGENT[a.k]||a.act)).length;
function pendingAlerts(){return (SV.alerts||[]).filter(a=>{if(a.done)return false;if(a.act==='job'||a.act==='trade')return true;const p=a.full?byFull(a.full):null;return p&&((a.act==='stay'&&p.ret===1)||(a.act==='offer'&&SV.offer&&SV.offer.full===a.full)||(a.act==='unhappy'&&p.mood===2));}).length;}
$('hBell').addEventListener('click',openAlerts);
$('alX').addEventListener('click',()=>{for(const a of SV.alerts)a.seen=1;$('alerts').classList.add('hidden');persist();renderHome();});
$('alBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-al]');if(!b)return;
  const a=SV.alerts.find(x=>x.id===+b.dataset.al),p=a&&a.full?byFull(a.full):null;
  if(a&&(a.act==='job'||a.act==='trade')){a.res=crossLgAnswer(a,b.dataset.do);a.done=1;persist();renderAlerts();renderHome();return;}
  if(!a||!p)return;
  const d=b.dataset.do;
  if(d==='stay'){const r=retPersuade(p);a.res=r.txt;if(!r.again)a.done=1;}
  else if(d==='yes'||d==='no'){a.res=offerAnswer(d==='yes');a.done=1;}
  else if(d==='prom'||d==='sell'){a.res=unhappyAnswer(p,d==='sell');a.done=1;}
  persist();renderAlerts();
});
/* ---- OPZIONI DELLA CARRIERA: difficolta', audio e stacchi, comandi, salvataggio, nuova carriera. Tutto cio' che non e' gestione della squadra sta qui ---- */
let setFrom='title';
function renderOpts(){
  const order=['easy','med','hard','xtr'],cur=SV.diff||'easy';
  $('opSub').textContent=`${SV.team} · ${SERIES_NAME[SV.sr]} · stagione ${SV.season}`;
  $('opDiff').innerHTML=order.map(k=>`<button type="button" class="sg${k===cur?' on':''}" data-k="${k}">${CAR_DIFF[k].name}</button>`).join('');
  $('opDiffN').textContent=CAR_DIFF[cur].txt;
  $('opLen').innerHTML=LEN_OPTS.map(o=>`<button type="button" class="sg${o.n===carLen()?' on':''}" data-n="${o.n}">${o.name} · ${o.n}</button>`).join('');
  $('opLenN').textContent=LEN_OPTS.find(o=>o.n===carLen()).txt+' Vale dalla prossima partita, anche per quelle simulate e per le altre squadre; l’esperienza di una partita resta la stessa.';
  renderSlots();syncToggles();
}
$('hOpt').addEventListener('click',()=>{$('opMsg').textContent='';renderOpts();$('opts').classList.remove('hidden');});
$('opX').addEventListener('click',()=>{$('opts').classList.add('hidden');renderHome();});
$('opLen').addEventListener('click',e=>{const b=e.target.closest('.sg');if(!b)return;SV.len=lenOk(+b.dataset.n);persist();renderOpts();});
$('opDiff').addEventListener('click',e=>{const b=e.target.closest('.sg');if(!b)return;SV.diff=b.dataset.k;persist();renderOpts();});
$('opSet').addEventListener('click',()=>{$('opts').classList.add('hidden');setFrom='home';showScreen('settings');});
/* ---- GUIDA a schede: si apre dal menu iniziale, dal cruscotto e dalla pausa, senza uscire da dove si e' ---- */
let guideBack=null;
// key: parola con cui comincia la voce da mostrare (guida contestuale: dal tasto «?» di una schermata si arriva al punto che la riguarda)
function openGuide(tab,back,key){
  guideBack=back||null;
  for(const b of $('gdTabs').children)b.classList.toggle('on',+b.dataset.g===tab);
  for(const u of $('gdBody').children)u.classList.toggle('hidden',+u.dataset.g!==tab);
  $('gdBody').scrollTop=0;$('guide').classList.remove('hidden');
  for(const li of $('gdBody').querySelectorAll('li.ghi'))li.classList.remove('ghi');
  if(key){const sec=[...$('gdBody').children].find(u=>+u.dataset.g===tab),li=sec&&[...sec.children].find(x=>x.textContent.trim().toLowerCase().startsWith(key.toLowerCase()));if(li){li.classList.add('ghi');li.scrollIntoView({block:'start'});}}
}
document.addEventListener('click',e=>{const b=e.target.closest('.shelp');if(b)openGuide(5,null,b.dataset.help);});
$('gdTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)openGuide(+b.dataset.g,guideBack);});
$('gdX').addEventListener('click',()=>{$('guide').classList.add('hidden');const f=guideBack;guideBack=null;if(f)f();});
/* ---- PAUSA: un solo tasto in alto a destra durante la partita. La partita si ferma davvero; da qui si riprende, si simula la meta, si apre la guida o si esce ---- */
function openPause(){
  if(!G.inMatch||!(G.mode==='play'||G.mode==='ready')||G.paused)return;
  G.paused=true;G.schemeOpen=true;drag=null;ddrag=null;aimPid=null;G.cdir=null;
  $('paSub').textContent=G.drill?G.matchLabel:`${G.myName||'Blu'} ${G.score[0]} – ${G.score[1]} ${G.oppName||'Rossi'} · meta ${G.pointNo}`;
  $('paSim').classList.toggle('hidden',!!G.drill);$('paSusp').classList.toggle('hidden',!!(G.drill||QM.on));   // sospendere: solo le partite di carriera
  $('paQuit').textContent=G.drill?'Esci dall’allenamento':(matchCounts()?'Abbandona (sconfitta a tavolino)':'Abbandona la partita');delete $('paQuit').dataset.arm;
  syncToggles();$('pause').classList.remove('hidden');
}
function closePause(){$('pause').classList.add('hidden');G.paused=false;G.schemeOpen=false;}
$('paGo').addEventListener('click',closePause);
$('paHelp').addEventListener('click',()=>{$('pause').classList.add('hidden');openGuide(inDefense()?2:0,()=>$('pause').classList.remove('hidden'));});
$('paQuit').addEventListener('click',()=>{
  if(G.drill){closePause();quitMatch();return;}
  // carriera, torneo e Ultimate Team: abbandonare e' una sconfitta a tavolino (prima non veniva registrato nulla e la partita si poteva rigiocare finche' non si vinceva)
  if(matchCounts())armed($('paQuit'),'Conferma: sconfitta a tavolino','Abbandona (sconfitta a tavolino)',()=>{closePause();forfeitMatch();});
  else armed($('paQuit'),'Conferma: il risultato non viene registrato','Abbandona la partita',()=>{closePause();quitMatch();});
});
$('paSim').addEventListener('click',()=>{closePause();simPoint();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)openPause();});   // cambi app o scheda: la partita ti aspetta
/* ---- SIMULA META: la meta in corso (o quella che sta per cominciare) viene giocata in un istante dal motore vero, con l'IA anche per la tua squadra.
   Valgono le stesse statistiche, la stessa fatica e gli stessi schemi di una meta giocata; poi compare il normale stacco della meta segnata ---- */
function simPoint(){
  if(!G.inMatch||G.drill||G.paused||!(G.mode==='ready'||G.mode==='play'))return false;
  const H0=Object.assign({},HOOKS),c0=G.opt.cine,tot=G.score[0]+G.score[1];
  drag=null;ddrag=null;aimPid=null;G.cdir=null;G.schemeOpen=false;
  for(const k of ['toast','sfx','vibe','shake'])HOOKS[k]=function(){};
  HOOKS.cine=null;G.opt.cine=false;G.auto=true;RP.buf.length=0;
  let n=0;
  try{while(n++<24000&&(G.mode==='ready'||G.mode==='play')&&G.score[0]+G.score[1]===tot)update(1/60);}
  finally{Object.assign(HOOKS,H0);G.opt.cine=c0;G.auto=false;}
  G.diveWin=null;G.slowTail=0;G.hold=false;G.sprint=null;G.ctrl=null;cam.snap=true;
  if(G.mode==='banner'&&G.banner)HOOKS.sfx('goal',G.banner.team);
  return true;
}
$('bSimPt').addEventListener('click',()=>{if(G.mode==='ready')simPoint();});
/* TIMEOUT (10-sim/18-timeout.js): il campo si ferma, lo stall riparte da zero e si puo' cambiare lo schema d'attacco */
let toSch0=null;
$('bTO').addEventListener('click',()=>{
  if(!callTimeout(0))return;
  G.paused=true;G.schemeOpen=true;drag=null;aimPid=null;G.high=false;toSch0=G.sch.att;
  $('toTxt').textContent=`Energia +${TMO_REST} · stall a zero · uno a partita`;
  $('tout').classList.remove('hidden');
});
$('toSch').addEventListener('click',()=>{$('tout').classList.add('hidden');openSchemes(false,true);$('mSub').textContent='Timeout: il nuovo schema d’attacco vale da subito.';$('hDef').parentElement.classList.add('hidden');});
function toResume(){
  $('tout').classList.add('hidden');if(!$('menu').classList.contains('hidden'))$('menu').classList.add('hidden');
  if(toSch0!==null&&toSch0!==G.sch.att)timeoutRescheme();
  toSch0=null;G.paused=false;G.schemeOpen=false;
}
$('toGo').addEventListener('click',toResume);
for(const [b,sc] of [['mkBack','home'],['clBack','home'],['hMarket','market'],['hClub','club']])$(b).addEventListener('click',()=>showScreen(sc));
const bSub=$('bSub');
$('subBox').addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(!b)return;tapSwap(+b.dataset.id);renderLineupBox();});
bSub.addEventListener('click',()=>{
  if(G.mode!=='ready')return;
  forcedSubs=false;$('subTitle').textContent='Cambi';$('subSub').textContent=G.lines?(G.lineK==='o'?'Linea d’attacco':'Linea di difesa')+': i cambi che fai valgono anche per le prossime mete di questa linea.':'';
  swapSel=null;G.schemeOpen=true;renderLineupBox();$('subs').classList.remove('hidden');
});
// cambio automatico: al posto di ogni infortunato in campo entra il migliore disponibile dello stesso ruolo
$('bSubAuto').addEventListener('click',()=>{fixLineup();if(G.inMatch&&G.lines&&G.lineK)G.lines[G.lineK]=lineupIds();swapSel=null;persist();renderLineupBox();});
// cambio obbligato: finche' c'e' un infortunato in campo e in panchina c'e' qualcuno che puo' entrare
function mustSub(){const on=new Set(T[0].map(p=>p.id));return !!(forcedSubs&&T[0].some(p=>p.inj)&&SQ.some(p=>!p.inj&&!on.has(p.id)));}
$('bSubGo').addEventListener('click',()=>{
  if(mustSub())return;
  $('subs').classList.add('hidden');G.schemeOpen=false;swapSel=null;forcedSubs=false;
  if(G.mode==='ready')placeTeams(G.poss);
});
// infortunio a fine meta: pannello obbligatorio per far entrare un altro giocatore
HOOKS.injury=list=>{
  forcedSubs=true;G.schemeOpen=true;
  swapSel=list[0].id;
  $('subTitle').textContent='Infortunio';
  $('subSub').textContent=list.map(p=>p.name).join(', ')+(list.length>1?' si sono infortunati':' si è infortunato')+': scegli chi entra al suo posto.';
  renderLineupBox();$('subs').classList.remove('hidden');
};
$('hSim').addEventListener('click',simCareerMatch);
$('hPlay').addEventListener('click',()=>{if(suspOk())resumeMatch();else if(nextMatch())startMatch();else if(SV.event==='eu'&&!SV.done){SV.event='camp';persist();renderHome();}else{SV.event='camp';showScreen('event');}});
$('hRoster').addEventListener('click',()=>showScreen('roster'));
$('tCareer').addEventListener('click',()=>showScreen(hasCareer()?'home':'league'));
$('tQuick').addEventListener('click',()=>showScreen('quick'));
$('tSet').addEventListener('click',()=>showScreen('settings'));
$('sBack').addEventListener('click',()=>{if(sView==='size')setSView('btns');else if(sView!=='menu')setSView('menu');else{const to=setFrom;setFrom='title';showScreen(to);}});
$('hBack').addEventListener('click',()=>showScreen('title'));
$('teamBack').addEventListener('click',()=>showScreen('league'));
$('qBack').addEventListener('click',()=>showScreen('title'));
$('qL').addEventListener('change',updateQuick);$('qD').addEventListener('change',updateQuick);$('qS').addEventListener('change',updateQuick);
$('qA').addEventListener('click',()=>openPick('a'));$('qB').addEventListener('click',()=>openPick('b'));
$('qpX').addEventListener('click',()=>$('qPick').classList.add('hidden'));
$('qPick').addEventListener('click',e=>{if(e.target===$('qPick'))$('qPick').classList.add('hidden');});
$('qpTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;QM.tab=b.dataset.k;renderPick();});
$('qpG').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.classList.contains('off'))return;
  QM[QM.side]=b.dataset.n;$('qPick').classList.add('hidden');updateQuick();
});
$('qSwap').addEventListener('click',()=>{const a=QM.a;QM.a=QM.b;QM.b=a;updateQuick();});
$('qPlay').addEventListener('click',startQuick);
$('hTrain').addEventListener('click',()=>showScreen('train'));
$('hEvent').addEventListener('click',()=>showScreen('event'));
$('hHelp').addEventListener('click',()=>openGuide(5));
$('tHelp').addEventListener('click',()=>openGuide(0));
function armed(btn,label,idle,fn){
  if(!btn.dataset.arm){btn.dataset.arm='1';btn.textContent=label;setTimeout(()=>{delete btn.dataset.arm;btn.textContent=idle;},3000);return;}
  delete btn.dataset.arm;btn.textContent=idle;fn();
}
$('hNew').addEventListener('click',()=>armed($('hNew'),'Conferma: cancella la carriera','Nuova carriera',()=>{
  $('opts').classList.add('hidden');
  const slot=SV.slot||1;try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(slotKey(slot));}catch(e){}
  const help=SV.help;SV={help,slot};showScreen('league');   // la nuova carriera resta nello stesso slot
}));
bExit.addEventListener('click',()=>openPause());

