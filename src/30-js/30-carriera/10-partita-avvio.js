function startMatch(){
  const m=nextMatch();if(!m)return;
  applyRoster(m.roster||makeRoster(m.power,SV.seed+'|'+m.name));
  const plus=carDiff().plus;if(plus)for(const q of T[1])for(const k of KEYS)q.s[k]=Math.min(99,q.s[k]+plus);   // difficile: avversarie piu' forti
  SQ.forEach(p=>{p.injNew=false;});fixLineup();   // gli infortunati non giocano
  const first=!SV.help;if(first){SV.help=true;persist();}   // salvo prima della forma del giorno
  G.formB=teamFormB();applyForm();
  G.oppName=m.name;G.myName=SV.team;G.matchLabel=m.label;
  newGame();G.lvl=[0,carDiff().ai|0];G.oppPlus=plus||0;G.idn=[null,teamIdentity(m.name,T[1])];G.xtr=SV.diff==='xtr';G.hint=(SV.diff||'easy')==='easy';G.routes=G.hint||SV.diff==='med';G.inMatch=true;G.recorded=false;
  G.duo=duoMap();   // intesa tra le coppie: vale solo in carriera
  {const w=careerWind(m);setWind(w[0],w[1]);}   // il meteo annunciato sul cruscotto
  fixLines();G.lines={o:matchLine('lineO'),d:matchLine('lineD'),auto:!!SV.autoSub};G.injK=1-0.12*facLv('fis');   // linee d'attacco e di difesa, cambi intelligenti, fisioterapia
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
  if(first)openSchemes(true);   // la prima volta si aprono gli schemi, con il rimando a tutorial e guida
}
function quitMatch(){$('half').classList.add('hidden');$('pause').classList.add('hidden');G.paused=false;restoreForm();if(QM.on){exitQuick(quickNext());return;}G.schemeOpen=false;G.inMatch=false;$('menu').classList.add('hidden');$('over').classList.add('hidden');showScreen('home');}
const SCREENS=['title','quick','home','team','roster','event','train','market','club','school','tourn','settings','posedit','ut','utPack','utTeam'];
function hideScreens(){for(const sc of SCREENS)$(sc).classList.add('hidden');}
function showScreen(id){
  for(const sc of SCREENS)$(sc).classList.toggle('hidden',sc!==id);
  G.mode='home';
  if(id==='title')renderTitle();else if(id==='quick')renderQuick();else if(id==='home')renderHome();else if(id==='team')renderTeams();else if(id==='roster'){rosterMsg='';sellArm=null;renderRoster();}else if(id==='event')renderEvent();else if(id==='settings')setSView('menu');else if(id==='posedit')layoutButtons();else if(id==='ut')renderUT();else if(id==='utPack')renderPack();else if(id==='utTeam')renderTeamUT();else if(id==='school')renderSchool();else if(id==='tourn')renderTourn();else if(id==='market'){mkMsg='';if(SV.mkSeen!==SV.mkN){SV.mkSeen=SV.mkN;persist();}renderMarket();}else if(id==='club'){clMsg='';renderClub();}else{trainSel.clear();trainRes=null;renderTrain();}
}
const evName=()=>SV.event==='camp'?'Campionato':'Campionato europeo';
// difficolta' della carriera: ritmo degli allenamenti e forza delle avversarie
const CAR_DIFF={
  easy:{name:'Facile',n:1,plus:0,ai:0,txt:'Allenamenti a ogni partita. Avversarie che scelgono in modo semplice.'},
  med:{name:'Medio',n:2,plus:0,ai:1,txt:'Allenamenti una volta ogni 2 partite. Avversarie che leggono i mismatch e si adattano un po’ al tuo gioco.'},
  hard:{name:'Difficile',n:3,plus:2,ai:2,txt:'Allenamenti una volta ogni 3 partite. Avversarie che decidono, si posizionano e reagiscono meglio, e solo 2 punti più forti.'},
  xtr:{name:'Estrema',n:3,plus:2,ai:2,txt:'Come Difficile, ma la traiettoria del lancio si vede solo all’inizio.'}
};
const carDiff=()=>CAR_DIFF[(SV&&SV.diff)||'easy']||CAR_DIFF.easy;
const trainOpen=()=>((SV.played||0)%carDiff().n)===0;       // la sessione e' disponibile prima della 1a partita e poi ogni n partite giocate (anche in Europa)
const trainWait=()=>{const n=carDiff().n;return n-((SV.played||0)%n);};
// forza di una squadra = media delle statistiche dei suoi 7 migliori giocatori (3 handler e 4 cutter)
const incTxt=()=>` Bilancio della giornata: ${SV.lastInc>=0?'+':''}${SV.lastInc} crediti (stipendi ${SV.lastWage|0}${SV.lastUp?', manutenzione e staff '+SV.lastUp:''}).`;
const teamFormB=()=>clamp((SV.chem-50)/50*0.9+(SV.mor-50)/50*0.6+0.3*staffLv('ana'),-1.5,1.5);
const squadPower=()=>{const b=pickSeven(SQ,p=>p.role,mean9);return b.reduce((a,p)=>a+mean9(p),0)/b.length;};
const teamPower=n=>n===SV.team?squadPower():(SV.rost&&SV.rost[n]?rosterPower(SV.rost[n])+carDiff().plus:null);
const previewPower=n=>REAL[n]?rosterPower(realRoster(REAL[n],'preview|'+n,realOpt(n,7))):0;
// stemma della squadra: scudetto con due colori e iniziali, generato dal nome
function crest(name,px){
  const h=hashStr('crest|'+name),h1=h%360,h2=(h1+130+(h>>8)%90)%360,ini=name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const dir=['135deg','180deg','90deg','45deg'][(h>>4)%4];
  return `<span class="crest" style="width:${px}px;height:${Math.round(px*1.12)}px;font-size:${Math.round(px*0.4)}px;background:linear-gradient(${dir},hsl(${h1} 68% 46%) 0 50%,hsl(${h2} 72% 56%) 50% 100%)">${ini}</span>`;
}
// avatar del giocatore: busto con maglia, capelli e pelle del suo aspetto
function avatar(p,px){
  const lk=p.look||DEF_LOOK,un=UNI[p.t||0],hr=lk.hair,sk=lk.skin;
  let hairBack='',hairTop='';
  if(lk.style===2)hairBack=`<path d="M11 17c-2 7-1 13 2 16l4-7z M29 17c2 7 1 13-2 16l-4-7z" fill="${hr}"/>`;
  if(lk.style===3)hairBack=`<circle cx="31" cy="21" r="3.6" fill="${hr}"/>`;
  if(lk.style===4)hairTop=`<path d="M11.8 16a8.2 8.2 0 0 1 16.4 0c-2.5-2-5-3-8.2-3s-5.7 1-8.2 3z" fill="${shade(sk,-0.25)}"/>`;
  else hairTop=`<path d="M11.2 17a8.8 8.8 0 0 1 17.6 0c-1.2-3.4-4.4-5-8.8-5s-7.6 1.6-8.8 5z" fill="${hr}"/>`+(lk.style===1?`<path d="M11 17c-.6 3-.4 5 1 6.4 0-3 .4-4.6 2-6.4z M29 17c.6 3 .4 5-1 6.4 0-3-.4-4.6-2-6.4z" fill="${hr}"/>`:'');
  return `<svg class="av" viewBox="0 0 40 40" width="${px}" height="${px}" aria-hidden="true"><rect width="40" height="40" rx="9" fill="rgba(255,255,255,.12)"/>${hairBack}<path d="M5 40c0-9 6-13.5 15-13.5S35 31 35 40z" fill="${un.shirt}"/><path d="M15 27.5l5 5 5-5z" fill="${sk}"/><circle cx="20" cy="18.5" r="8.4" fill="${sk}"/>${hairTop}${lk.band?`<rect x="11.4" y="13.4" width="17.2" height="2.6" fill="${lk.band}"/>`:''}${lk.beard?`<path d="M12 20.5c.8 5 4 7.6 8 7.6s7.2-2.6 8-7.6c-2.2 2.4-4.8 3.2-8 3.2s-5.8-.8-8-3.2z" fill="${shade(hr,-0.15)}"/>`:''}<circle cx="23.2" cy="19" r="1" fill="#1b2433"/></svg>`;
}
let teamTab='C';
function renderTeams(){for(const b of $('tSr').children)b.classList.toggle('on',b.dataset.k===teamTab);$('tTeams').innerHTML=SERIES[teamTab].map(n=>`<button type="button" class="tteam" data-n="${n.replace(/"/g,'&quot;')}"><span class="tn">${crest(n,22)}<span>${n}</span></span><b class="tp">${Math.round(previewPower(n))}</b></button>`).join('');}
// ---- menu iniziale e partita veloce ----
const QM={on:false,bak:null,a:null,b:null,s:1};   // s: la squadra che inizia in attacco (0 = tua/blu, 1 = avversaria/rossa)
const hasCareer=()=>!!(SV&&SV.team);
function renderTitle(){$('tSchoolS').textContent=SCH.tut?'Tutorial, pratica e sfide':'Nuovo? Inizia dal tutorial';$('tCareerS').textContent=hasCareer()?`Continua: ${SV.team}, ${SERIES_NAME[SV.sr]}`:'Scegli la squadra e inizia';}
const qPowCache={};
function qRoster(n,min){return REAL[n]?realRoster(REAL[n],'qm|'+n,realOpt(n,min)):makeRoster(TEAM[n].power,'qm|'+n);}
function qPower(n){if(qPowCache[n]==null)qPowCache[n]=rosterPower(qRoster(n,7));return qPowCache[n];}
function renderQuick(){
  const all=[].concat(SERIES.A,SERIES.B,SERIES.C);
  if(!QM.a||!all.includes(QM.a))QM.a=hasCareer()&&all.includes(SV.team)?SV.team:'Grem';
  if(!QM.b||!all.includes(QM.b)||QM.b===QM.a)QM.b=all.find(n=>n!==QM.a&&TEAM[n]&&TEAM[n].series!==TEAM[QM.a].series)||all.find(n=>n!==QM.a);
  $('qD').value=QM.d|0;$('qS').value=String(QM.s);updateQuick();
}
// selettore delle squadre: le categorie sono linguette e l'elenco della categoria e' gia' aperto
function openPick(side){QM.side=side;QM.tab=TEAM[QM[side]].series;renderPick();$('qPick').classList.remove('hidden');}
function renderPick(){
  const me=QM[QM.side],other=QM[QM.side==='a'?'b':'a'];
  $('qpT').textContent=QM.side==='a'?'Tua squadra (blu)':'Avversario (rossa)';
  $('qpTabs').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k===QM.tab));
  $('qpG').innerHTML=SERIES[QM.tab].map(n=>`<button type="button" data-n="${n.replace(/"/g,'&quot;')}" class="${n===me?'sel':''}${n===other?' off':''}">${crest(n,22)}<span>${n}</span><b>${Math.round(qPower(n))}</b></button>`).join('');
}
function updateQuick(){
  const a=QM.a,b=QM.b;
  const row=n=>`Serie ${TEAM[n].series} · forza ${Math.round(qPower(n))}`;
  const btn=n=>`<span class="tn">${crest(n,24)}<span>${n}</span></span><span class="qv">▾</span>`;
  $('qA').innerHTML=btn(a);$('qB').innerHTML=btn(b);
  $('qAP').textContent=row(a);$('qBP').textContent=row(b);
  $('qPlay').disabled=a===b;$('qPlay').textContent=a===b?'Scegli due squadre diverse':'Gioca';
  QM.d=+$('qD').value;QM.s=+$('qS').value;
  $('qS').options[0].textContent=a;$('qS').options[1].textContent=b;   // i nomi delle due squadre
  $('qDP').textContent=['L’IA avversaria gioca come sempre.','L’IA avversaria sceglie e reagisce un po’ meglio.','L’IA avversaria sceglie e reagisce molto meglio.','Come Difficile, ma la traiettoria del lancio si vede solo all’inizio (un breve tratto tratteggiato).'][QM.d]+' Le statistiche dei giocatori non cambiano.';
}
function startQuick(){
  const a=QM.a,b=QM.b;if(!a||!b||a===b)return;
  if(hasCareer()){persist();QM.bak=JSON.stringify(SV);}else QM.bak=null;   // la carriera resta com'e': viene rimessa alla fine
  QM.on=true;
  setSquad(qRoster(a,9));applyRoster(qRoster(b,7));
  SQ.forEach(p=>{p.injNew=false;p.inj=0;p.cond=100;});
  G.formB=0;G.lines=null;G.injK=1;applyForm();
  G.oppName=b;G.myName=a;G.matchLabel='Partita veloce';
  newGame();rollWind();G.lvl=[0,Math.min(2,QM.d|0)];G.oppPlus=0;G.idn=[null,teamIdentity(b,T[1])];G.xtr=(QM.d|0)===3;G.hint=(QM.d|0)===0;G.routes=(QM.d|0)<=1;G.inMatch=true;G.recorded=false;   // Estrema = IA come Difficile
  G.nextRec=QM.s===0?0:1;G.startRec=G.nextRec;   // chi riceve il primo pull inizia in attacco; l'altra squadra tira il pull (difesa)
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
}

