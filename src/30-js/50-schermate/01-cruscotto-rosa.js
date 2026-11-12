function renderHome(){
  if(SV.prog&&SV.prog.on&&autoTrain())persist();   // programma di allenamento automatico: parte da solo quando c'e' una sessione disponibile
  const m=nextMatch(),names=SV.mem[SV.sr];
  $('hCrest').innerHTML=crest(SV.team,38);$('hEvt').textContent=SV.team;
  $('hInfo').textContent=`${SERIES_NAME[SV.sr]} · Stagione ${SV.season}`+(SV.event==='camp'?(SV.done?' · conclusa':(SV.round>0?` · ${myRank()}° posto`:'')):' · Campionato europeo');
  let nx;
  if(m){
    const op=Math.round((m.roster?rosterPower(m.roster):m.power)+carDiff().plus),me=Math.round(squadPower()),idn=m.roster?teamIdentity(m.name,bestSeven(m.roster)):null;
    nx=`<small>PROSSIMA · ${m.label}</small><div class="dvs"><span>${crest(m.name,26)}<b>${esc(m.name)}</b></span><span class="dpw"><i>tu</i> ${me} <i>·</i> ${op} <i>loro</i></span></div>`+(idn?`<small class="dtag">Stile: ${idn.tags.concat([clubPol(m.name)[1]]).join(', ')}</small>`:'')+(G.opt.wind===false?'':`<small class="dtag">Meteo: ${windTxt(careerWind(m)[0]).toLowerCase()}</small>`);
  }else if(SV.event==='camp')nx=`<small>STAGIONE CONCLUSA</small><div class="dvs"><span><b>${SV.next?esc(SV.next.short):''}</b></span></div><small class="dtag">Premi e riepilogo in Classifica: da lì parte la nuova stagione</small>`;
  else nx=`<small>CAMPIONATO EUROPEO CONCLUSO</small><div class="dvs"><span><b>${euEndTxt()}</b></span></div><small class="dtag">${SV.done?'La prossima edizione, se vi qualificate, è nella nuova stagione':'Si torna al campionato: la prossima edizione è tra una stagione, se vi qualificate'}</small>`;
  $('hNext').innerHTML=nx;
  const form=SV.res.slice(-5).map(r=>`<i class="${r.su>r.so?'w':'l'}">${r.su>r.so?'V':'S'}</i>`).join('')||'<i>–</i>';
  let tab;
  if(SV.event==='camp'){
    const ord=ranking(SV.tab,names),me=ord.indexOf(SV.team),a=clamp(me-1,0,Math.max(0,ord.length-3));
    tab=ord.slice(a,a+3).map((n,i)=>`<div class="${n===SV.team?'me':''}"><span>${a+i+1}. ${esc(n)}</span><b>${SV.tab[n].pts}</b></div>`).join('');
  }else tab=`<div class="me"><span>${SV.eu.state==='champ'?'Campioni d’Europa':(SV.eu.state==='out'?'Eliminati':EU_ROUND[Math.min(2,SV.eu.round)])}</span><b></b></div>`;
  $('hTab').innerHTML=`<small>${SV.event==='camp'?'CLASSIFICA':'CAMPIONATO EUROPEO'}<span class="dform">${form}</span></small>${tab}`;
  $('hBars').innerHTML=`<div class="dcash"><span>Crediti</span><b>${SV.cash}</b></div>`+statBar('Reputazione',SV.rep,'#ffd23f')+statBar('Morale',SV.mor,'#4fe58f')+statBar('Affiatamento',SV.chem,'#5ac8ff');
  $('hObj').textContent=SV.obj?`Obiettivo: ${SV.obj.txt} (premio ${SV.obj.reward}).`:'';
  // le notizie che non interrompono compaiono qui: l'ultima non letta, e quante altre aspettano nella campanella
  {const un=(SV.alerts||[]).filter(a=>!a.seen&&!(AL_URGENT[a.k]||a.act));
   $('hNews').textContent=un.length?'Novità: '+un[0].txt+(un.length>1?` (+${un.length-1} negli Avvisi)`:''):(SV.news.length?'Ultime: '+SV.news[0].txt:'');
   $('hNews').classList.toggle('nw',un.length>0);}
  // l'azione principale e' sempre quella che serve adesso: giocare, oppure aprire la nuova stagione (o il nuovo torneo europeo)
  const su=suspOk();
  // a competizione conclusa il tasto dice che cosa succede davvero: nuova stagione (se il campionato e' finito) oppure ritorno al campionato (coppa finita)
  const toCamp=!m&&SV.event==='eu'&&!SV.done;
  $('hPlayT').textContent=su?'Riprendi la partita':(m?'Inizia partita':(toCamp?'Torna al campionato':'Nuova stagione'));
  $('hPlayS').textContent=su?`Sospesa sul ${SV.susp.score[0]}–${SV.susp.score[1]} contro ${m.name}`:(m?`Contro ${m.name} · ${carDiff().name}`:(toCamp?`Giornata ${SV.round+1} di ${totalRounds()}`:'Riepilogo, premi e ripartenza'));
  $('hSim').classList.toggle('hidden',!m||su);   // una partita sospesa si riprende, non si simula
  const left=3-SQ.filter(p=>p.tr).length,hurt=SQ.filter(p=>p.inj).length,low=SQ.filter(p=>p.cond<50).length;
  $('hTrainS').textContent=!trainOpen()?`Tra ${trainWait()} ${trainWait()>1?'partite':'partita'}`:!SV.tTeam?'Da fare':(left?`Restano ${left} singoli`:'Fatti');   // testi brevi: sul telefono i lunghi venivano troncati
  $('hRosterS').textContent=`Forza ${Math.round(squadPower())}`+(hurt?` · ${hurt} infort.`:(low?` · ${low} scarichi`:` · ${SQ.length} in rosa`));
  $('hMarketS').textContent=`${SV.market.filter(m=>!canSign(m)).length} alla portata`;
  $('hClubS').textContent=SV.chal&&!SV.chal.done?'Strutture, sfida':'Strutture, staff';
  const lineBad=SV.lineO.length<7||SV.lineD.length<7||SQ.some(p=>p.inj&&(SV.lineO.includes(p.full)||SV.lineD.includes(p.full)));
  $('hRosterB').classList.toggle('hidden',!lineBad);
  $('hTrainB').classList.toggle('hidden',!(trainOpen()&&(!SV.tTeam||left>0)));
  $('hMarketB').classList.toggle('hidden',SV.mkSeen===SV.mkN);
  const nwA=(SV.alerts||[]).filter(a=>!a.seen).length,pdA=pendingAlerts();
  $('hBellB').textContent=nwA||pdA;$('hBellB').classList.toggle('hidden',!(nwA||pdA));
  if(urgentAlerts()&&$('alerts').classList.contains('hidden')&&!$('home').classList.contains('hidden')&&$('opts').classList.contains('hidden')&&$('simres').classList.contains('hidden')&&$('over').classList.contains('hidden'))openAlerts();   // si apre da solo soltanto per le decisioni e le emergenze; le notizie restano nella campanella
  else if(SV.evt&&$('evt').classList.contains('hidden')&&$('alerts').classList.contains('hidden')&&!$('home').classList.contains('hidden')&&$('opts').classList.contains('hidden')&&$('simres').classList.contains('hidden')&&$('over').classList.contains('hidden'))openEvt();   // un imprevisto aspetta una risposta
  $('hEventS').textContent=SV.event==='camp'?(SV.done?'Stagione conclusa: premi e ripartenza':`Giornata ${SV.round+1} di ${totalRounds()}`):(SV.eu.state==='on'?'Campionato europeo: '+EU_ROUND[SV.eu.round].toLowerCase():'Campionato europeo concluso');
}
const euEndTxt=()=>SV.eu.state==='champ'?'Campioni d’Europa!':(SV.eu.state==='out'?'Eliminati: '+EU_ROUND[Math.min(2,SV.eu.round)].toLowerCase()+' persa':'');
// ---- pezzi comuni delle schermate di carriera ----
const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const ovrCls=v=>v>=80?'o5':(v>=70?'o4':(v>=60?'o3':(v>=50?'o2':'o1')));
const potTxt=x=>{const r=potRange(x);return r[0]===r[1]?String(r[0]):r[0]+'–'+r[1];};
const traitBadge=x=>x.trait&&TRAITS[x.trait]?`<span class="trb" title="${esc(TRAITS[x.trait][1])}">${TRAITS[x.trait][0]}</span>`:'';
const condBar=c=>`<span class="cbar" title="Condizione ${Math.round(c)}"><i style="width:${Math.round(c)}%;background:${barColor(c)}"></i></span>`;
const statBar=(l,v,c)=>`<div class="dbar"><span>${l}</span><span class="cbar"><i style="width:${Math.round(v)}%;background:${c}"></i></span><b>${Math.round(v)}</b></div>`;
let swapSel=null;
// scambio in formazione durante la partita: tocca un giocatore in campo e uno in panchina. Il cambio vale anche per le prossime mete della stessa linea
function tapSwap(id){
  const inL=i=>T[0].some(p=>p.id===i);
  if(!inL(id)&&SQ[id].inj)return;   // un infortunato non puo' entrare
  if(swapSel===null){swapSel=id;return;}
  if(swapSel===id){swapSel=null;return;}
  if(inL(swapSel)!==inL(id)){
    const out=inL(swapSel)?swapSel:id,inn=inL(swapSel)?id:swapSel;
    setLineup(lineupIds().map(x=>x===out?inn:x));
    if(G.inMatch&&G.lines&&G.lineK)G.lines[G.lineK]=lineupIds();
    persist();swapSel=null;
  }else swapSel=id;
}
const openDet=new Set();
// filtri e ordinamenti della Rosa: con 20 e piu' giocatori servono per trovare subito chi cerchi
let rFilt='all',rSort='ovr';
const R_FILT={all:['Tutti',()=>true],H:['Handler',p=>posOf(p)==='H'],C:['Cutter',p=>posOf(p)==='C'],D:['Defender',p=>posOf(p)==='D'],out:['Fuori linea',p=>!SV.lineO.includes(p.full)&&!SV.lineD.includes(p.full)],ko:['Da gestire',p=>!!p.inj||p.cond<50||p.mood>0||p.ret===1]};
const R_SORT={ovr:['Overall',(a,b)=>ovrX(b)-ovrX(a)],pot:['Potenziale',(a,b)=>{const x=potRange(a),y=potRange(b);return (y[0]+y[1])-(x[0]+x[1]);}],age:['Età',(a,b)=>a.age-b.age],cond:['Condizione',(a,b)=>a.cond-b.cond],wage:['Stipendio',(a,b)=>wageOf(b)-wageOf(a)],ssn:['Rendimento',(a,b)=>seasonScore(b.car)-seasonScore(a.car)]};
let rosterMsg='',sellArm=null;
function lineToggle(p,k){
  const L=SV[k],i=L.indexOf(p.full);
  if(i>=0){L.splice(i,1);return '';}
  if(p.inj)return 'Un infortunato non può entrare in linea.';
  if(L.length>=7)return (k==='lineO'?'La linea d’attacco':'La linea di difesa')+' ha già 7 giocatori: togline uno prima di aggiungerne un altro.';
  L.push(p.full);return '';
}
// confronto con un compagno: si sceglie dal menu (di base il compagno dello stesso ruolo piu' vicino come Overall)
const cmpWith={};
function rosterCmp(p){
  const pos=posOf(p),others=SQ.filter(q=>q!==p).sort((a,b)=>(posOf(b)===pos)-(posOf(a)===pos)||Math.abs(ovrX(a)-ovrX(p))-Math.abs(ovrX(b)-ovrX(p)));
  if(!others.length)return '';
  const q=byFull(cmpWith[p.full])||others[0];
  return `<div class="dst"><b style="color:var(--gold);font-weight:400">Confronta con</b> <select class="qs cmpsel" data-cmp="${p.id}">${others.map(o=>`<option value="${esc(o.full)}"${o===q?' selected':''}>${esc(pname(o))} · ${POS_NAME[posOf(o)]} ${ovr(o)}</option>`).join('')}</select></div>${compareHTML(p,q,pname(p),pname(q))}`;
}
// storico dei progressi: l'Overall a fine di ogni stagione passata con te, e quello di adesso
function histHTML(p){
  const h=p.hist||[],now=ovr(p);
  if(!h.length)return `<div class="dst"><b style="color:var(--gold);font-weight:400">Storico</b>: prima stagione con te (Overall ${now}).</div>`;
  const pk=Math.max(now,...h.map(x=>x[1]));
  return `<div class="dst"><b style="color:var(--gold);font-weight:400">Storico</b>: <span class="hsl">${h.map((x,i)=>`<i class="${i&&x[1]>h[i-1][1]?'u':(i&&x[1]<h[i-1][1]?'d':'')}">S${x[0]} ${x[1]}</i>`).join('')}<i class="now ${now>h[h.length-1][1]?'u':(now<h[h.length-1][1]?'d':'')}">ora ${now}</i></span>${pk>now?` · massimo toccato ${pk}`:''}</div>`;
}
// margine di crescita per categoria: quanto manca al limite (lo si conosce solo dopo aver osservato il giocatore a fondo)
function roomHTML(p,sure){
  if(!sure)return `<div class="dst"><b style="color:var(--gold);font-weight:400">Limiti</b>: ancora da scoprire: osservalo (o tienilo in rosa: ogni stagione lo conosci meglio).</div>`;
  return `<div class="dst"><b style="color:var(--gold);font-weight:400">Limiti</b>: ${CATS.map(c=>{const room=c.keys.reduce((a,k)=>a+Math.max(0,capX(p,k)-p.s[k]),0);return `${c.name} ${room?'+'+room:'al massimo'}`;}).join(' · ')} (punti ancora raggiungibili)</div>`;
}
// SCHEDA DEL GIOCATORE in tre parti: Attributi (che cosa sa fare), Prestazioni (che cosa ha fatto), Sviluppo (dove puo' arrivare). Prima era un unico elenco lungo
const DET_TABS=[['att','Attributi'],['pre','Prestazioni'],['svi','Sviluppo']],detTab={};
function detailHTML(p){
  const sure=(p.sk|0)>=3,c=p.car,ss=c?c.ss:null,pos=posOf(p),tab=detTab[p.full]||'att';
  const tabs=`<div class="seg dtabs">${DET_TABS.map(t=>`<button type="button" class="sg${tab===t[0]?' on':''}" data-dtab="${t[0]}" data-pid="${p.id}">${t[1]}</button>`).join('')}</div>`;
  let body='';
  if(tab==='att'){
    const stats=CATS.map(ct=>`<div class="dgr"><b>${ct.name} ${catLevel(p,ct)}</b>`+ct.keys.map(k=>`<span>${LBL[k]} ${p.s[k]}${sure?`<small>/${capX(p,k)}</small>`:''}</span>`).join('')+'</div>').join('');
    const rr=['H','C','D'].map(r=>`<span class="${pos===r?'on':''}">${POS_NAME[r]} ${Math.round(rate(p.s,r))}</span>`).join('');
    const tr=p.trait&&TRAITS[p.trait]?`<div class="dtr"><b>${TRAITS[p.trait][0]}</b>: ${TRAITS[p.trait][1].toLowerCase()}.</div>`:'';
    body=`<div class="drole">${rr}</div>${tr}<div class="dg">${stats}</div>${rosterCmp(p)}`;
  }else if(tab==='pre'){
    const per=(x,n)=>n?(x/n).toFixed(1):'–';
    const line=(lab,x)=>`<span>${lab}</span><span>${x.mp}</span><span>${x.g}</span><span>${x.a}</span><span>${x.b}</span><span>${per(x.g*2+x.a*2+x.b*3,x.mp)}</span>`;
    const st=c&&c.mp?`<div class="dperf"><span class="hd"></span><span class="hd">Partite</span><span class="hd">Mete</span><span class="hd">Assist</span><span class="hd">Difese</span><span class="hd">Voto</span>${line('Stagione',ss)}${c.ls&&c.ls.mp?line('Scorsa',c.ls):''}${line('Carriera',c)}</div>`:'<div class="dst">Ancora nessuna partita con questa squadra.</div>';
    const mood=p.mood===2?'chiede la cessione':(p.mood===1?'scontent'+oa(p):(p.idle>=4?'gioca poco ('+p.idle+' partite fuori)':'sereno'));
    body=`${st}<div class="dst">Condizione ${Math.round(p.cond)} · umore: ${mood} · stipendio ${Math.round(wageOf(p))} a stagione${(p.injC|0)?' · infortuni seri: '+p.injC:''}${p.inj?` · <b style="color:var(--bad);font-weight:400">infortunato, ${p.inj} ${p.inj>1?'partite':'partita'}</b>`:''}</div>${goalLineHTML(p)}${duoHTML(p)}${p.aw&&p.aw.length?`<div class="dst"><b style="color:var(--gold);font-weight:400">Premi</b>: ${p.aw.map(a=>esc(a.k)+' (S'+a.s+')').join(', ')}</div>`:''}`;
  }else{
    const ret=p.ret===1?'<b style="color:#c9a0ff;font-weight:400">si ritira a fine stagione</b>':(retScore(p)>-1.5?'<b style="color:#c9a0ff;font-weight:400">pensa al ritiro</b>':(p.age>=30?'ritiro lontano':''));
    body=`<div class="dst">Potenziale ${potTxt(p)}${sure?' (certo)':''} · crescita ${(p.sk|0)>=2?devLabel(p.dev):'da osservare'} · ${p.age} anni${ret?' · '+ret:''}${(p.ext|0)?` · ha superato il proprio limite ${p.ext} ${p.ext>1?'volte':'volta'} su ${EXT_MAX}`:''}</div>${histHTML(p)}${roomHTML(p,sure)}${specHTML(p)}<div class="dst scr">${scoutReport(p)}</div>`;
  }
  if(tab==='svi')body+=`<div class="dst"><b style="color:#7fd8ff;font-weight:400">Allenamento</b>: <button type="button" class="sec${p.pri?' onb':''}" data-pri="${p.id}">${p.pri?'★ Priorità del programma':'Segna come priorità'}</button> <span>${p.pri?'il programma automatico gli riserva un lavoro individuale':'fino a 3 giocatori: il programma automatico allena prima loro'}</span></div>`;
  return `${tabs}${body}<div class="dact">${sure?'':`<button type="button" class="sec" data-scout="${p.id}"${SV.cash<scoutCost()?' disabled':''}>Osserva (${scoutCost()} crediti)</button>`}<button type="button" class="sec" data-sell="${p.id}"${SQ.length>SQ_MIN?'':' disabled'}>${sellArm===p.id?'Conferma la cessione':'Cedi'} (+${sellValue(p)})</button></div>`;
}
$('rBox').addEventListener('change',e=>{const so=e.target.closest('[data-rsort]');if(so){rSort=so.value;renderRoster();return;}const s=e.target.closest('[data-cmp]');if(!s)return;const p=SQ[+s.dataset.cmp];if(p){cmpWith[p.full]=s.value;renderRoster();}});
function renderRoster(){
  const inO=new Set(SV.lineO),inD=new Set(SV.lineD);
  const ord=SQ.filter(R_FILT[rFilt]?R_FILT[rFilt][1]:()=>true).sort((a,b)=>R_SORT[rSort][1](a,b)||ovrX(b)-ovrX(a)||a.name.localeCompare(b.name));
  const cnt=k=>SQ.filter(R_FILT[k][1]).length;
  const bar=`<div class="rbar"><div class="seg">${Object.keys(R_FILT).filter(k=>k==='all'||k===rFilt||cnt(k)).map(k=>`<button type="button" class="sg${rFilt===k?' on':''}" data-rf="${k}">${R_FILT[k][0]}${k==='all'?'':' '+cnt(k)}</button>`).join('')}</div><label class="rsort">Ordina per <select class="qs" data-rsort="1">${Object.keys(R_SORT).map(k=>`<option value="${k}"${rSort===k?' selected':''}>${R_SORT[k][0]}</option>`).join('')}</select></label></div>`;
  $('rTop').innerHTML=`<span>Rosa <b>${SQ.length}</b>/${SQ_MAX}</span><span class="${SV.lineO.length===7?'':'bad'}">Attacco <b>${SV.lineO.length}</b>/7</span><span class="${SV.lineD.length===7?'':'bad'}">Difesa <b>${SV.lineD.length}</b>/7</span><span>Crediti <b>${SV.cash}</b></span><button type="button" class="sec" id="rAuto">Linee consigliate</button><button type="button" class="sec" id="rSmart">Cambi intelligenti: ${SV.autoSub?'sì':'no'}</button>`;
  const head='<tr><th>Giocatore</th><th>OVR</th><th>POT</th><th>Cond</th><th>Linee</th><th></th></tr>';
  const row=p=>{
    const op=openDet.has(p.id),v=ovr(p);
    return `<tr class="pl" data-id="${p.id}"><td><span class="rn">${avatar(p,30)}<span>${esc(p.label||p.name)}${p.star?'<span class="stb">★</span>':''}${traitBadge(p)}${p.ret===1?'<span class="tg r">ultima stagione</span>':''}${p.mood===2?'<span class="tg m">chiede la cessione</span>':(p.mood===1?`<span class="tg m">scontent${oa(p)}</span>`:'')}<small class="rl${p.inj?' bad':''}">${p.ae?'circa ':''}${p.age} anni · ${POS_NAME[posOf(p)]}${p.aw&&p.aw.length?' · '+p.aw.length+(p.aw.length>1?' premi':' premio'):''}${p.inj?` · infortunato ${p.inj} ${p.inj>1?'partite':'partita'}`:''}</small></span></span></td><td><b class="ov ${ovrCls(v)}">${v}</b></td><td class="pot">${potTxt(p)}</td><td>${condBar(p.cond)}</td><td class="lnb"><button type="button" class="lb${inO.has(p.full)?' on':''}" data-line="lineO" data-id="${p.id}">ATT</button><button type="button" class="lb d${inD.has(p.full)?' on':''}" data-line="lineD" data-id="${p.id}">DIF</button></td><td><button type="button" class="dbtn" data-d="${p.id}" aria-label="Scheda">${op?'▴':'▾'}</button></td></tr>`+(op?`<tr class="dt"><td colspan="6">${detailHTML(p)}</td></tr>`:'');
  };
  const warn=(SV.lineO.length<7||SV.lineD.length<7)?'Una linea ha meno di 7 giocatori: alla partita verrà completata con i migliori disponibili.':(SQ.some(p=>p.inj&&(inO.has(p.full)||inD.has(p.full)))?'Un giocatore in linea è infortunato: finché non guarisce gioca al suo posto il migliore disponibile dello stesso ruolo.':'');
  $('rBox').innerHTML=`${rosterMsg||warn?`<p class="rmsg">${rosterMsg||warn}</p>`:''}${bar}${ord.length?`<table class="rt">${head}${ord.map(row).join('')}</table>`:'<p class="note">Nessun giocatore con questo filtro.</p>'}`;
}
const barColor=st=>`hsl(${Math.round(Math.max(0,Math.min(100,st))*1.2)},70%,45%)`;
let forcedSubs=false;
// avviso sul giocatore selezionato per il cambio (nei Cambi e nella Rosa)
function selBanner(){
  if(swapSel===null)return '';
  const p=SQ[swapSel],inL=T[0].some(q=>q.id===swapSel);
  return `<div class="selbar"><b>${p.name}</b> selezionato: scegli con chi scambiarlo</div>`;
}
const swapRole=id=>{   // 'sel' selezionato, 'tgt' puo' essere scambiato con lui, 'dim' non c'entra
  if(swapSel===null)return '';
  if(swapSel===id)return 'sel';
  const inL=i=>T[0].some(q=>q.id===i);
  return (inL(swapSel)!==inL(id)&&!(!inL(id)&&SQ[id].inj))?'tgt':'dim';
};
function renderLineupBox(){
  const on=new Set(T[0].map(p=>p.id));
  const chip=p=>`<button type="button" class="${on.has(p.id)?'on':''} ${swapRole(p.id)}${p.inj?' inj':''}" data-id="${p.id}"><span class="rn">${avatar(p,26)}<span>${p.name}<small>${p.inj?`infortunato, ${p.inj} ${p.inj>1?'partite':'partita'}`:(p.role==='H'?'handler':'cutter')}</small></span></span><span class="eb"><i style="width:${Math.round(p.st)}%;background:${barColor(p.st)}"></i></span></button>`;
  $('subBox').innerHTML=`${selBanner()}<p class="lu-h">In campo</p><div class="lu">${T[0].map(chip).join('')}</div><p class="lu-h">Panchina</p><div class="lu">${SQ.filter(p=>!on.has(p.id)).map(chip).join('')}</div>`;
  $('bSubGo').disabled=mustSub();$('bSubAuto').classList.toggle('hidden',!T[0].some(p=>p.inj));
}
function standingsHTML(sr){
  sr=sr||SV.sr;const names=SV.mem[sr],t=lgTab(sr),ord=ranking(t,names),n=ord.length;
  const rows=ord.map((nm,pos)=>{
    const cls=[nm===SV.team?'me':'',(sr!=='A'&&pos<PROMO)?'up':'',(sr!=='C'&&pos>=n-PROMO)?'dn':''].filter(Boolean).join(' ');
    return `<tr${cls?` class="${cls}"`:''}><td>${pos+1}. ${crest(nm,15)} ${nm}<span class="tp">${Math.round(teamPower(nm)||0)}</span></td><td>${t[nm].w+t[nm].l}</td><td>${t[nm].w}</td><td>${t[nm].l}</td><td>${t[nm].pf-t[nm].pa}</td><td><b>${t[nm].pts}</b></td></tr>`;
  }).join('');
  return `<div style="overflow-x:auto"><table class="rt"><tr><th>Squadra e forza</th><th>G</th><th>V</th><th>S</th><th>Diff</th><th>Pt</th></tr>${rows}</table></div>`;
}
let evSr='';
$('eBody').addEventListener('click',e=>{const b=e.target.closest('#evTabs [data-sr]');if(!b)return;evSr=b.dataset.sr;renderEvent();});
function renderEvent(){
  const cs=SV.done?`${SERIES_NAME[SV.sr]}, stagione conclusa`:`${SERIES_NAME[SV.sr]}, giornata ${SV.round+1} di ${totalRounds()}`;
  const es=SV.eu.state==='champ'?'Campioni':(SV.eu.state==='out'?'Eliminati':EU_ROUND[SV.eu.round]);
  $('eCards').innerHTML=
    `<button type="button" class="ecard${SV.event==='camp'?' on':''}" data-e="camp"><strong>Campionato</strong><small>Serie A, B e C: tutte contro tutte, salgono le prime 2 e scendono le ultime 2. ${cs}.</small></button>`+
    (SV.euUnlocked
      ?`<button type="button" class="ecard${SV.event==='eu'?' on':''}" data-e="eu"><strong>Campionato europeo</strong><small>Eliminazione diretta: quarti, semifinale, finale. ${es}.</small></button>`
      :`<button type="button" class="ecard" data-e="eu" disabled><strong>Campionato europeo</strong><small>Bloccato: serve chiudere la stagione tra le prime 3 della Serie A, e vale per la stagione dopo.</small></button>`);
  let body='';
  if(SV.event==='camp'){
    if(!SV.lg||!SV.lg[evSr])evSr=SV.sr;
    let endH='';
    if(SV.done){const hx=SV.hist[0];endH=`<p class="estat">${SV.next.short}</p>`+(SV.next.prize!==undefined?`<p class="note" style="margin:0 0 8px">Premio di classifica: ${SV.next.prize} crediti. Obiettivo ${SV.next.objOk?'raggiunto: +'+SV.obj.reward+' crediti':'mancato'}.${hx&&hx.mvp?` MVP della squadra: ${esc(hx.mvp)} (${hx.mvpS}).`:''} Con la nuova stagione tutti invecchiano di un anno, i veterani possono ritirarsi, le altre squadre cambiano e il mercato si rinnova.</p>`:'')+(hx&&hx.aw&&hx.aw.length?`<div class="seas"><h3>Premi della stagione · ${SERIES_NAME[SV.sr]}</h3><ul class="awl">${hx.aw.map(awRow).join('')}</ul>${hx.best7&&hx.best7.length?`<p>Squadra ideale: ${hx.best7.map(q=>`${q.mine?'<b style="color:var(--gold)">':'<b>'}${esc(q.name)}</b> (${q.pos})`).join(', ')}</p>`:''}</div>`:'')+`<button type="button" class="go" id="eReset">Inizia la nuova stagione</button>`;}
    body+=endH;   // a stagione conclusa il riepilogo, i premi e il tasto per ripartire stanno in cima: prima erano in fondo a una pagina lunga
    body+=`<div class="seg" id="evTabs">${['A','B','C'].map(s=>`<button type="button" class="sg${evSr===s?' on':''}" data-sr="${s}">${SERIES_NAME[s]}${s===SV.sr?' (tua)':''}</button>`).join('')}</div>`;
    body+=`<p class="estat">${SERIES_NAME[evSr]}, stagione ${SV.season}${evSr!=='A'?', in verde chi sale':''}${evSr!=='C'?`${evSr!=='A'?' e in rosso':', in rosso'} chi scende`:''}${evSr!==SV.sr&&SV.lg[evSr]?` · giornata ${SV.lg[evSr].round} di ${SV.lg[evSr].sched.length}`:''}</p>`;
    body+=standingsHTML(evSr);
    if(evSr!==SV.sr&&SV.lg[evSr]&&SV.lg[evSr].last.length)body+=`<h3 class="eh">Ultima giornata in ${SERIES_NAME[evSr]}</h3><ul class="elist">${SV.lg[evSr].last.map(m=>`<li class="${m[2]>m[3]?'w':'l'}"><span>${esc(m[0])} – ${esc(m[1])}</span><span>${m[2]} – ${m[3]}</span></li>`).join('')}</ul>`;
    if(evSr===SV.sr)body+=leadersHTML();
    if(evSr===SV.sr&&SV.riv)body+=`<p class="note" style="margin:8px 0 0">${derbyTxt()}.</p>`;
    if(SV.story&&SV.story.length)body+=`<h3 class="eh">Dal campionato</h3><ul class="elist">${SV.story.slice(0,6).map(x=>`<li><span>${esc(x.txt)}</span><span>S${x.s}·G${x.r}</span></li>`).join('')}</ul>`;
    const done=SV.res.slice(-6).map((r,i)=>{const g=SV.res.length-Math.min(6,SV.res.length)+i+1;return `<li class="${r.su>r.so?'w':'l'}"><span>Giornata ${g} contro ${r.opp}</span><span>${r.su} – ${r.so}</span></li>`;});
    const nm=nextMatch();
    if(nm)done.push(`<li class="n"><span>${nm.label} contro ${nm.name}</span><span>Prossima</span></li>`);
    body+=`<ul class="elist" style="margin-top:10px">${done.join('')}</ul>`;
  }else{
    const items=EU_ROUND.map((n,i)=>{
      const cls=(SV.eu.state==='champ'||i<SV.eu.round)?'w':(i===SV.eu.round&&SV.eu.state==='out'?'l':(i===SV.eu.round?'n':''));
      const st=cls==='w'?'Vinta':(cls==='l'?'Persa':(cls==='n'?'Prossima':'Da giocare'));
      return `<li class="${cls}"><span>${n} contro ${SV.eu.opps[i]}</span><span>${st}</span></li>`;
    });
    body+=`<ul class="elist">${items.join('')}</ul>`;
    if(SV.eu.state!=='on')body+=`<p class="estat">${euEndTxt()}${SV.eu.cash?` · premi del torneo: ${SV.eu.cash} crediti`:''}</p><p class="note" style="margin:0 0 8px">Il Campionato europeo si gioca una volta a stagione: la prossima edizione è nella stagione dopo, se chiudete la Serie A tra le prime 3.</p><button type="button" class="go" id="eCamp">${SV.done?'Vai al campionato: nuova stagione':'Torna al campionato'}</button>`;
    else body+=`<p class="note" style="margin:8px 0 0">Premi: ${EU_PRIZE.map((v,i)=>Math.round(v*SR_K.A)+' crediti ('+EU_ROUND[i].toLowerCase()+')').join(', ')}. Una sola edizione a stagione.</p>`;
  }
  $('eBody').innerHTML=body;
}
