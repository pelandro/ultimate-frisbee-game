/* ---- POSTA: decisioni ed emergenze, una riga ciascuna con la sua azione; NOTIZIE: tutto il resto, per giornata (regole in 30-carriera/09b-posta-notizie.js).
   La Posta si apre da sola soltanto per le decisioni e le emergenze piu' gravi ---- */
let alTab='posta';const alExp=new Set();
function alActs(a){   // i pulsanti di una decisione ancora aperta
  if(!alOpen(a))return '';
  if(a.act==='job'||a.act==='trade')return crossLgButtons(a);   // offerte dell'altra lega (35-usa/05-lega-incrociata.js)
  const p=byFull(a.full);
  if(a.act==='stay')return `<button type="button" class="sec" data-al="${a.id}" data-do="stay">Proponi un’altra stagione (${stayCost(p)} crediti)</button>`;
  if(a.act==='offer')return `<button type="button" class="go" data-al="${a.id}" data-do="yes">Accetta (+${SV.offer.price})</button><button type="button" class="sec" data-al="${a.id}" data-do="no">Rifiuta</button>`;
  if(a.act==='unhappy')return `<button type="button" class="sec" data-al="${a.id}" data-do="prom">Prometti spazio in campo</button><button type="button" class="sec" data-al="${a.id}" data-do="sell">Cedi (+${sellValue(p)})</button>`;
  return '';
}
// una riga: tipo, titolo corto (si apre al tocco: testo intero e, nel mercato, i colpi) e il pulsante che serve
function alLine(g){
  const a=g[0],kd=AL_KIND[a.k]||['Avviso','#c2cbe6'],ex=alExp.has(a.id),nw=g.some(x=>!x.seen),act=g.length===1?alActs(a):'';
  const go=!act&&alTab==='posta'&&AL_GO[a.k]?`<button type="button" class="sec" data-algo="${AL_GO[a.k]}" data-ids="${g.map(x=>x.id).join(',')}">${AL_GO_TXT[AL_GO[a.k]]}</button>`:'';
  const mv=x=>x.k==='mkt'&&x.data&&x.data.mv?`<ul class="almv">${x.data.mv.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:'';
  const title=alGroupTitle(g),more=g.length>1||title!==String(a.txt||'').trim()||!!mv(a);
  const full=ex?`<div class="alfull">${g.map(x=>`<p>${esc(x.txt)}</p>${mv(x)}`).join('')}</div>`:'';
  return `<div class="ali${nw?' new':''}"><span class="alk" style="background:${kd[1]}">${kd[0]}</span><div class="alb"><button type="button" class="alt" data-alx="${g.map(x=>x.id).join(',')}"${more?` aria-expanded="${ex}"`:''}><span>${esc(title)}</span>${more?`<i aria-hidden="true">${ex?'▴':'▾'}</i>`:''}</button>${full}${a.res?`<div class="res">${esc(a.res)}</div>`:''}${act||go?`<div class="schrow">${act}${go}</div>`:''}</div></div>`;
}
function renderAlerts(){
  const L=SV.alerts||[],P=L.filter(alPosta),N=L.filter(a=>!alPosta(a));
  const nP=P.filter(a=>!a.seen).length,nN=N.filter(a=>!a.seen).length;
  $('alTabs').innerHTML=[['posta','Posta',nP],['news','Notizie',nN]].map(([k,t,n])=>`<button type="button" class="sg${alTab===k?' on':''}" data-alt="${k}">${t}${n?` <small>${n}</small>`:''}</button>`).join('');
  const grp=(t,l)=>l.length?`<h3 class="alg">${t} <b>${l.length}</b></h3>`+alGroups(l).map(alLine).join(''):'';
  if(alTab==='news'){
    $('alSub').textContent=N.length?'Le notizie su giocatori, club e mercato, per giornata':'Qui compaiono crescite, rientri, traguardi e mercato.';
    $('alAll').classList.add('hidden');
    const days=[];for(const a of N.slice(0,40)){const k=a.s+'|'+a.r;let d=days.find(x=>x.k===k);if(!d){d={k,s:a.s,r:a.r,l:[]};days.push(d);}d.l.push(a);}
    $('alBody').innerHTML=days.length?days.map(d=>`<h3 class="alg">${d.s===SV.season?'':'Stagione '+d.s+' · '}Giornata ${d.r}</h3>`+alGroups(d.l).map(alLine).join('')).join(''):'<p class="note">Ancora nessuna notizia.</p>';
    for(const a of N)a.seen=1;   // le notizie si leggono tutte insieme: aprire la scheda basta
    if(typeof renderShell==='function')renderShell();
    return;
  }
  $('alAll').classList.remove('hidden');
  const open=P.filter(alOpen),cur=P.filter(a=>!alOpen(a)&&(!a.seen||alNow(a))),old=P.filter(a=>!alOpen(a)&&a.seen&&!alNow(a));
  $('alSub').textContent=open.length?'Le decisioni restano qui finché non rispondi':(nP?`${nP} ${nP>1?'avvisi da leggere':'avviso da leggere'}`:'Niente da sistemare');
  $('alAll').disabled=!nP;$('alAll').textContent=nP?`Segna tutto come letto (${nP})`:'Tutto letto';
  const arch=old.length?`<details class="alarch"><summary>Archivio <b>${old.length}</b></summary>${alGroups(old.slice(0,30)).map(alLine).join('')}</details>`:'';
  $('alBody').innerHTML=(open.length||cur.length||old.length)?grp('Da decidere',open)+grp('Avvisi',cur)+arch:'<p class="note">Nessun avviso: le notizie stanno nella scheda accanto.</p>';
}
// sh = gia' mostrato: l'apertura automatica (emergenze e decisioni) avviene una volta sola, ma l'avviso resta «nuovo» finche' non lo leggi davvero
function openAlerts(tab){alTab=tab==='news'?'news':'posta';for(const a of SV.alerts||[])a.sh=1;renderAlerts();$('alerts').classList.remove('hidden');try{$('alX').focus({preventScroll:true});}catch(e){}}
function closeAlerts(){$('alerts').classList.add('hidden');persist();renderHome();}
/* Tre livelli. EMERGENZE gravi (infortuni, addii, offerte, dirigenza) e DECISIONI aprono il riquadro da sole, una volta. Gli altri avvisi della Posta
   accendono il numero sulla campanella; le NOTIZIE non la accendono: si riassumono in «Questa settimana». */
const AL_URGENT={inj:1,bye:1,off:1,dir:1};   // dir: la dirigenza protesta per i conti in rosso
const urgentAlerts=()=>(SV.alerts||[]).filter(a=>!a.seen&&!a.sh&&(AL_URGENT[a.k]||a.act)).length;
function pendingAlerts(){return (SV.alerts||[]).filter(alOpen).length;}
// «Chiudi» chiude e basta; «Segna tutto come letto» e' una scelta a parte; toccare un avviso lo apre e lo segna come letto
$('alX').addEventListener('click',closeAlerts);
$('alAll').addEventListener('click',()=>{for(const a of SV.alerts)if(alPosta(a))a.seen=1;persist();renderAlerts();renderShell&&renderShell();});
$('alTabs').addEventListener('click',e=>{const b=e.target.closest('[data-alt]');if(!b)return;alTab=b.dataset.alt;renderAlerts();$('alBody').scrollTop=0;});
const alByIds=s=>String(s||'').split(',').map(Number).map(i=>SV.alerts.find(x=>x.id===i)).filter(Boolean);
$('alBody').addEventListener('click',e=>{
  const x=e.target.closest('[data-alx]');
  if(x){const g=alByIds(x.dataset.alx),id=g[0]&&g[0].id;if(!g.length)return;if(alExp.has(id))alExp.delete(id);else alExp.add(id);for(const a of g)a.seen=1;persist();renderAlerts();if(typeof renderShell==='function')renderShell();const n=$('alBody').querySelector(`[data-alx="${x.dataset.alx}"]`);if(n)n.focus();return;}
  const go=e.target.closest('[data-algo]');
  if(go){for(const a of alByIds(go.dataset.ids))a.seen=1;closeAlerts();showScreen(go.dataset.algo);return;}
  const b=e.target.closest('[data-al]');if(!b)return;
  const a=SV.alerts.find(x=>x.id===+b.dataset.al),p=a&&a.full?byFull(a.full):null;
  if(a)a.seen=1;   // chi risponde l'ha letto
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
  $('opDiff').innerHTML=order.map(k=>`<button type="button" class="sg${k===cur?' on':''}" data-k="${k}" disabled>${CAR_DIFF[k].name}</button>`).join('');   // scelta all'inizio della carriera: non si cambia piu'
  $('opDiffN').textContent=CAR_DIFF[cur].txt+' Si sceglie all’inizio della carriera e non si può cambiare.';
  $('opLen').innerHTML=LEN_OPTS.map(o=>`<button type="button" class="sg${o.n===carLen()?' on':''}" data-n="${o.n}">${o.name} · ${o.n}</button>`).join('');
  $('opLenN').textContent=LEN_OPTS.find(o=>o.n===carLen()).txt+' Vale dalla prossima partita, anche per quelle simulate e per le altre squadre; l’esperienza di una partita resta la stessa.';
  renderSlots();syncToggles();
}
$('hOpt').addEventListener('click',()=>{$('opMsg').textContent='';renderOpts();$('opts').classList.remove('hidden');});
$('opX').addEventListener('click',()=>{$('opts').classList.add('hidden');renderHome();});
$('opLen').addEventListener('click',e=>{const b=e.target.closest('.sg');if(!b)return;SV.len=lenOk(+b.dataset.n);persist();renderOpts();});
$('opSet').addEventListener('click',()=>{$('opts').classList.add('hidden');setFrom='home';showScreen('settings');setSView('game');});
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
/* ---- PAUSA: un solo tasto in alto a destra durante la partita. La partita si ferma davvero; da qui si riprende, si sospende, si regolano audio e difesa, si apre la guida o si esce ---- */
function openPause(){
  clearMatchInput();
  if(!G.inMatch||!(G.mode==='play'||G.mode==='ready')||G.paused)return;
  G.paused=true;G.schemeOpen=true;drag=null;ddrag=null;aimPid=null;G.cdir=null;
  $('paSub').textContent=G.drill?G.matchLabel:`${G.myName||'Blu'} ${G.score[0]} – ${G.score[1]} ${G.oppName||'Rossi'} · meta ${G.pointNo}`;
  $('paSusp').classList.toggle('hidden',!!(G.drill||QM.on));   // sospendere: solo le partite di carriera
  $('paQuit').textContent=G.drill?'Esci dall’allenamento':(matchCounts()?'Abbandona (sconfitta a tavolino)':'Abbandona la partita');delete $('paQuit').dataset.arm;
  $('paSegT').classList.add('hidden');   // l'esito di «Segnala un problema» vale per una sola pausa
  pauseBoard();syncToggles();$('pause').classList.remove('hidden');
}
function closePause(){$('pause').classList.add('hidden');G.paused=false;G.schemeOpen=false;}
$('paGo').addEventListener('click',closePause);
$('paHelp').addEventListener('click',()=>{$('pause').classList.add('hidden');openGuide(inDefense()?2:1,()=>$('pause').classList.remove('hidden'));});
$('paQuit').addEventListener('click',()=>{
  if(G.drill){closePause();quitMatch();return;}
  // carriera, torneo e Ultimate Team: abbandonare e' una sconfitta a tavolino (prima non veniva registrato nulla e la partita si poteva rigiocare finche' non si vinceva)
  if(matchCounts())armed($('paQuit'),'Conferma: sconfitta a tavolino','Abbandona (sconfitta a tavolino)',()=>{closePause();forfeitMatch();});
  else armed($('paQuit'),'Conferma: il risultato non viene registrato','Abbandona la partita',()=>{closePause();quitMatch();});
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)openPause();});   // cambi app o scheda: la partita ti aspetta
/* ---- SIMULA META: la meta in corso (o quella che sta per cominciare) viene giocata in un istante dal motore vero, con l'IA anche per la tua squadra.
   Valgono le stesse statistiche, la stessa fatica e gli stessi schemi di una meta giocata; poi compare il normale stacco della meta segnata ---- */
function simPoint(){
  if(!G.inMatch||G.drill||G.primi||G.paused||!(G.mode==='ready'||G.mode==='play'))return false;
  const H0=Object.assign({},HOOKS),c0=G.opt.cine,tot=G.score[0]+G.score[1];
  drag=null;ddrag=null;aimPid=null;G.cdir=null;G.schemeOpen=false;
  for(const k of ['toast','sfx','vibe','shake'])HOOKS[k]=function(){};
  HOOKS.cine=null;G.opt.cine=false;G.auto=true;RP.buf.length=0;
  let n=0;
  try{while(n++<24000&&(G.mode==='ready'||G.mode==='play')&&G.score[0]+G.score[1]===tot)update(1/60);}
  finally{Object.assign(HOOKS,H0);G.opt.cine=c0;G.auto=false;}
  G.diveWin=null;G.slowTail=0;G.hold=false;G.sprint=null;G.ctrl=null;cam.snap=true;
  if(G.mode==='banner'&&G.banner){G.banner.sim=1;HOOKS.sfx('goal',G.banner.team);}   // sim: meta simulata, niente esultanza (27-esultanze.js)
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
$('subBox').addEventListener('click',e=>{
  if(e.target.closest('button[data-all]')){swapAll();renderLineupBox();return;}
  const b=e.target.closest('button[data-id]');if(!b)return;tapSwap(+b.dataset.id);renderLineupBox();});
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
  $('subSub').textContent='Infortuni: '+list.map(p=>p.name).join(', ')+'. Scegli chi entra in campo.';
  renderLineupBox();$('subs').classList.remove('hidden');
};
$('hSim').addEventListener('click',simCareerMatch);
$('hPlay').addEventListener('click',()=>{if(suspOk())resumeMatch();else if(nextMatch())startMatch();else if(openSeasonEurope())renderHome();else if(SV.event==='eu'&&!SV.done){SV.event='camp';persist();renderHome();}else{SV.event='camp';showScreen('event');}});
$('hRoster').addEventListener('click',()=>showScreen('roster'));
$('tCareer').addEventListener('click',()=>showScreen('slots'));   // prima i tre slot (Salvataggi): da li' si continua o si inizia
$('tQuick').addEventListener('click',()=>showScreen('quick'));
for(const [id,from] of [['tSet','title'],['hSet',null]])$(id).addEventListener('click',()=>{setFrom=from||csCur;showScreen('settings');setSView('game');});
$('sBack').addEventListener('click',()=>{const to=setFrom;setFrom='title';showScreen(to);});   // le schede non hanno sottolivelli: «Indietro» torna sempre da dove si e' venuti
$('hBack').addEventListener('click',()=>showScreen('title'));
$('teamBack').addEventListener('click',()=>{lgKeep=LEAGUES.filter(l=>lgW(l)===(lgDiv==='w')).length>1;showScreen('league');});
$('qBack').addEventListener('click',()=>showScreen('title'));
$('qL').addEventListener('change',updateQuick);$('qD').addEventListener('change',updateQuick);$('qS').addEventListener('change',updateQuick);
$('qA').addEventListener('click',()=>openPick('a'));$('qB').addEventListener('click',()=>openPick('b'));
$('qpX').addEventListener('click',()=>$('qPick').classList.add('hidden'));
$('qPick').addEventListener('click',e=>{if(e.target===$('qPick'))$('qPick').classList.add('hidden');});
$('qpTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;QM.tab=b.dataset.k;$('qpSearch').value='';renderPick();});
$('qpLg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;QM.lg=b.dataset.l;QM.tab='';$('qpSearch').value='';renderPick();});
$('qpG').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.classList.contains('off'))return;
  QM[QM.side]=b.dataset.n;qGender(QM.side);$('qPick').classList.add('hidden');updateQuick();   // donne solo contro donne
});
$('qDiv').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b||b.dataset.v===QM.div)return;qDivSet(b.dataset.v);for(const x of $('qDiv').children)x.classList.toggle('on',x.dataset.v===QM.div);updateQuick();femPass();});
$('qSwap').addEventListener('click',()=>{const a=QM.a;QM.a=QM.b;QM.b=a;updateQuick();});
$('qPlay').addEventListener('click',startQuick);
$('hTrain').addEventListener('click',()=>showScreen('train'));
$('hEvent').addEventListener('click',()=>showScreen('event'));
// la classifica in breve della schermata Partita si tocca: apre Lega sulla classifica intera, gia' scorsa fino alla tabella e alla tua riga
function openStandings(){
  evSr=SV.sr;eventPage='table';usTabPh=lnTabPh='';usConfSel='';   // si torna alla classifica anche se in Lega si stava guardando un'altra vista
  showScreen('event');
  const t=$('eBody').querySelector('table');if(!t)return;
  ($('eBody').querySelector('.estat')||t).scrollIntoView({block:'start'});   // la riga che dice serie e stagione, poi le intestazioni
  const me=t.querySelector('tr.me');if(me)me.scrollIntoView({block:'nearest'});
}
$('hTab').addEventListener('click',openStandings);
$('hTab').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openStandings();}});
$('hHelp').addEventListener('click',()=>openGuide(5,null,{roster:'Rosa',train:'Allenamenti',market:'Mercato',club:'Strutture',event:'Campionati'}[csCur]));   // la guida si apre dal punto che riguarda la schermata
$('tHelp').addEventListener('click',()=>openGuide(0));
function armed(btn,label,idle,fn){
  if(!btn.dataset.arm){btn.dataset.arm='1';btn.textContent=label;setTimeout(()=>{delete btn.dataset.arm;btn.textContent=idle;},3000);return;}
  delete btn.dataset.arm;btn.textContent=idle;fn();
}
$('hNew').addEventListener('click',()=>askConfirm({
  title:'Sostituire la carriera?',html:'<p>La sostituzione avviene quando inizi e salvi la nuova carriera.</p>',
  ok:'Scegli la nuova squadra',danger:true,onOk:()=>{
    $('opts').classList.add('hidden');
    careerNew(SV.slot||1);
  }
}));
bExit.addEventListener('click',()=>openPause());

