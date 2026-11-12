function startMatch(resume){   // resume: ripresa di una partita sospesa (niente presentazione)
  const m=nextMatch();if(!m)return;
  applyRoster(m.roster||makeRoster(m.power,SV.seed+'|'+m.name));
  const plus=carDiff().plus;if(plus)for(const q of T[1])for(const k of KEYS)q.s[k]=Math.min(99,q.s[k]+plus);   // difficile: avversarie piu' forti
  SQ.forEach(p=>{p.injNew=false;});fixLineup();   // gli infortunati non giocano
  const first=!SV.help;if(first){SV.help=true;persist();}   // salvo prima della forma del giorno
  G.formB=teamFormB();applyForm();
  G.oppName=m.name;G.myName=SV.team;G.matchLabel=m.label;
  newGame();G.target=carLen();G.lvl=[0,carDiff().ai|0];G.oppPlus=plus||0;G.idn=[null,teamIdentity(m.name,T[1])];G.xtr=SV.diff==='xtr';G.hint=(SV.diff||'easy')==='easy';G.routes=G.hint||SV.diff==='med';G.inMatch=true;G.recorded=false;
  G.duo=duoMap();   // intesa tra le coppie: vale solo in carriera
  {const w=careerWind(m);setWind(w[0],w[1]);setWx(careerWeather(m));}   // il meteo annunciato sul cruscotto
  fixLines();G.lines={o:matchLine('lineO'),d:matchLine('lineD'),auto:!!SV.autoSub};G.injK=1-0.12*facLv('fis');   // linee d'attacco e di difesa, cambi intelligenti, fisioterapia
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
  if(first)openSchemes(true);   // la prima volta si aprono gli schemi, con il rimando a tutorial e guida
  else if(!resume)showIntro(m);   // finali, derby, ultima giornata con qualcosa in palio: un cartello breve prima del pull
}
function quitMatch(){if(!QM.on&&SV&&SV.susp){SV.susp=null;persist();}   // abbandonata: niente da riprendere
  $('half').classList.add('hidden');$('pause').classList.add('hidden');G.paused=false;restoreForm();if(QM.on){exitQuick(quickNext());return;}G.schemeOpen=false;G.inMatch=false;$('menu').classList.add('hidden');$('over').classList.add('hidden');showScreen('home');}
const SCREENS=['title','slots','quick','home','team','coachsel','roster','event','train','market','club','school','tourn','settings','posedit','ut','utPack','utTeam'];
function hideScreens(){for(const sc of SCREENS)$(sc).classList.add('hidden');}
function showScreen(id){
  for(const sc of SCREENS)$(sc).classList.toggle('hidden',sc!==id);
  G.mode='home';
  if(['home','roster','market','club','train','event'].includes(id))setTimeout(()=>{if(!$(id).classList.contains('hidden'))tipOnce(id);},350);   // fumetto di primo accesso
  if(id==='title')renderTitle();else if(id==='slots')renderCareers();else if(id==='quick')renderQuick();else if(id==='home')renderHome();else if(id==='team')renderTeams();else if(id==='coachsel')renderCoach();else if(id==='roster'){rosterMsg='';sellArm=null;cardOpen=null;nickEdit=null;renderRoster();}else if(id==='event')renderEvent();else if(id==='settings')setSView('menu');else if(id==='posedit')layoutButtons();else if(id==='ut')renderUT();else if(id==='utPack')renderPack();else if(id==='utTeam')renderTeamUT();else if(id==='school')renderSchool();else if(id==='tourn')renderTourn();else if(id==='market'){mkMsg='';if(SV.mkSeen!==SV.mkN){SV.mkSeen=SV.mkN;persist();}renderMarket();}else if(id==='club'){clMsg='';renderClub();}else{trainSel.clear();trainRes=null;renderTrain();}
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
const carLen=()=>lenOk((SV&&SV.len)|0);   // durata delle partite di carriera (Opzioni): 7, 11 o 15 punti
const trainOpen=()=>((SV.played||0)%carDiff().n)===0;       // la sessione e' disponibile prima della 1a partita e poi ogni n partite giocate (anche in Europa)
const trainWait=()=>{const n=carDiff().n;return n-((SV.played||0)%n);};
// forza di una squadra = media delle statistiche dei suoi 7 migliori giocatori (3 handler e 4 cutter)
const incTxt=()=>` Bilancio della giornata: ${SV.lastInc>=0?'+':''}${SV.lastInc} crediti (stipendi ${SV.lastWage|0}${SV.lastUp?', manutenzione e staff '+SV.lastUp:''}).`;
const teamFormB=()=>clamp((SV.chem-50)/50*0.9+(SV.mor-50)/50*0.6+0.3*staffLv('ana')+(hasTr('ana','str')?0.3:0),-1.5,1.5);
const squadPower=()=>{const b=pickSeven(SQ,p=>p.role,mean9);return b.reduce((a,p)=>a+mean9(p),0)/b.length;};
const teamPower=n=>n===SV.team?squadPower():(SV.rost&&SV.rost[n]?rosterPower(SV.rost[n])+carDiff().plus:null);
// forza mostrata nella scelta della squadra: la stessa regola della rosa con cui si parte davvero (userRoster: 9 giocatori, un po' meno allenata delle avversarie)
const previewPower=n=>REAL[n]?rosterPower(realRoster(REAL[n],'preview|'+n,Object.assign(realOpt(n,9),{low:true}))):0;
// stemma della squadra: scudetto con due colori e iniziali, generato dal nome
function crest(name,px){
  const h=hashStr('crest|'+name),h1=h%360,h2=(h1+130+(h>>8)%90)%360,ini=name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const dir=['135deg','180deg','90deg','45deg'][(h>>4)%4];
  return `<span class="crest" style="width:${px}px;height:${Math.round(px*1.12)}px;font-size:${Math.round(px*0.4)}px;background:linear-gradient(${dir},hsl(${h1} 68% 46%) 0 50%,hsl(${h2} 72% 56%) 50% 100%)">${ini}</span>`;
}
// ritratto del giocatore in pixel art (stile Retro Bowl): griglia 16x16 con contorno scuro, occhi a punto, capelli a blocchi e maglia della squadra.
// Capelli, pelle, barba e fascia vengono dall'aspetto del giocatore (look). Ogni pixel e' un quadratino netto: la misura si arrotonda a un multiplo di 16.
function avatar(p,px){
  const lk=p.look||DEF_LOOK,un=UNI[p.t||0]||UNI[0],hr=lk.hair,sk=lk.skin,O='#1a1020';
  const skS=shade(sk,-0.14),skD=shade(sk,-0.32),hrD=shade(hr,-0.3),hrL=shade(hr,0.28),sh=un.shirt,shD=shade(sh,-0.28),shL=shade(sh,0.25);
  const G=Array.from({length:16},()=>Array(16).fill(null));
  const R=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(i>=0&&i<16&&j>=0&&j<16)G[j][i]=c;};
  R(0,0,16,16,shade(sh,-0.62));   // sfondo: la divisa, molto scura
  if(lk.style===2){R(2,4,1,9,O);R(13,4,1,9,O);R(3,3,2,10,hr);R(11,3,2,10,hr);R(3,5,1,6,hrD);R(12,5,1,6,hrD);}   // capelli lunghi: dietro le spalle
  // busto: contorno, maglia, ombre ai lati, scollo a V
  R(1,13,14,3,O);R(3,12,10,1,O);R(2,13,12,3,sh);R(2,13,1,3,shD);R(13,13,1,3,shD);R(4,13,2,1,shL);R(10,13,2,1,shL);R(7,13,2,1,sk);
  // collo
  R(5,11,1,2,O);R(10,11,1,2,O);R(6,11,4,2,sk);R(6,12,4,1,skS);
  // testa: contorno (senza gli angoli), pelle, ombra a destra, orecchie
  R(3,2,10,10,O);R(3,2,1,1,null);R(12,2,1,1,null);R(3,11,1,1,null);R(12,11,1,1,null);
  R(4,3,8,8,sk);R(11,4,1,6,skS);R(4,10,8,1,skS);R(3,6,1,3,skS);R(12,6,1,3,skS);
  // viso: sopracciglia, occhi, naso, bocca
  const cap=lk.style!==4;
  if(cap){R(5,5,2,1,hrD);R(9,5,2,1,hrD);}
  R(6,6,1,2,O);R(9,6,1,2,O);R(8,8,1,1,skD);R(7,9,2,1,'#7a3b2e');
  if(lk.beard){R(4,8,1,3,hrD);R(11,8,1,3,hrD);R(5,10,6,1,hrD);R(5,9,2,1,hrD);R(9,9,2,1,hrD);R(7,9,2,1,'#7a3b2e');}
  // capelli: calotta a blocchi con frangia; stile 1 = basette, 3 = coda, 4 = rasato
  if(lk.style===4){R(4,3,8,1,skS);R(5,3,6,1,skD);}
  else{
    R(4,1,8,1,O);R(4,2,8,2,hr);R(4,4,2,1,hr);R(10,4,2,1,hr);R(3,3,1,1,O);R(12,3,1,1,O);R(6,2,3,1,hrL);R(3,2,1,1,O);R(12,2,1,1,O);R(4,4,1,1,hrD);R(11,4,1,1,hrD);
    if(lk.style===1){R(4,5,1,2,hrD);R(11,5,1,2,hrD);}
    if(lk.style===3){R(13,5,1,5,O);R(14,5,1,5,O);R(13,4,2,1,O);R(13,10,2,1,O);R(13,5,1,5,hr);R(14,5,1,5,O);R(12,4,1,1,hr);}
  }
  if(lk.band)R(4,4,8,1,lk.band);
  let o='';
  for(let y=0;y<16;y++){let x=0;while(x<16){const c=G[y][x];let w=1;while(x+w<16&&G[y][x+w]===c)w++;if(c)o+=`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${c}"/>`;x+=w;}}
  const z=16*Math.max(1,Math.round(px/16));
  return `<svg class="av" viewBox="0 0 16 16" width="${z}" height="${z}" shape-rendering="crispEdges" aria-hidden="true">${o}</svg>`;
}
let teamTab='C';
function renderTeamList(){for(const b of $('tSr').children)b.classList.toggle('on',b.dataset.k===teamTab);$('tTeams').innerHTML=SERIES[teamTab].map(n=>`<button type="button" class="tteam" data-n="${n.replace(/"/g,'&quot;')}"><span class="tn">${crest(n,22)}<span>${n}</span></span><b class="tp">${Math.round(previewPower(n))}</b></button>`).join('');}
// ---- menu iniziale e partita veloce ----
const QM={on:false,bak:null,a:null,b:null,s:1};   // s: la squadra che inizia in attacco (0 = tua/blu, 1 = avversaria/rossa)
const hasCareer=()=>!!(SV&&SV.team);
function renderTitle(){$('tSchoolS').textContent=SCH.tut?'Tutorial, pratica e sfide':((SCH.lv|0)?`Tutorial: lezione ${(SCH.lv|0)+1} di ${TUT_STEPS.length}`:'Nuovo? Inizia dal tutorial');$('tCareerS').textContent=hasCareer()?`Continua: ${SV.team}, ${SERIES_NAME[SV.sr]}${SV.susp?' · partita sospesa':''}`:'Scegli la squadra e inizia';const n=[1,2,3].filter(k=>slotInfo(k)).length;$('tSlotsS').textContent=n?`${n} di 3 slot · nuova`:'3 slot liberi';}
const qPowCache={};
function qRoster(n,min){return REAL[n]?realRoster(REAL[n],'qm|'+n,realOpt(n,min)):makeRoster(TEAM[n].power,'qm|'+n);}
function qPower(n){if(qPowCache[n]==null)qPowCache[n]=rosterPower(qRoster(n,7));return qPowCache[n];}
function renderQuick(){
  const all=[].concat(SERIES.A,SERIES.B,SERIES.C);
  if(!QM.a||!all.includes(QM.a))QM.a=hasCareer()&&all.includes(SV.team)?SV.team:'Grem';
  if(!QM.b||!all.includes(QM.b)||QM.b===QM.a)QM.b=all.find(n=>n!==QM.a&&TEAM[n]&&TEAM[n].series!==TEAM[QM.a].series)||all.find(n=>n!==QM.a);
  $('qD').value=QM.d|0;$('qS').value=String(QM.s);$('qL').value=String(lenOk(QM.len|0));updateQuick();
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
  QM.d=+$('qD').value;QM.s=+$('qS').value;QM.len=+$('qL').value;
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
  newGame();G.target=lenOk(QM.len|0);rollWind();G.lvl=[0,Math.min(2,QM.d|0)];G.oppPlus=0;G.idn=[null,teamIdentity(b,T[1])];G.xtr=(QM.d|0)===3;G.hint=(QM.d|0)===0;G.routes=(QM.d|0)<=1;G.inMatch=true;G.recorded=false;   // Estrema = IA come Difficile
  G.nextRec=QM.s===0?0:1;G.startRec=G.nextRec;   // chi riceve il primo pull inizia in attacco; l'altra squadra tira il pull (difesa)
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
}

