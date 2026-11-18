function startMatch(resume){   // resume: ripresa di una partita sospesa (niente presentazione)
  const m=nextMatch();if(!m)return;
  applyRoster(m.roster||makeRoster(m.power,SV.seed+'|'+m.name));
  const plus=carDiff().plus;oppBoost(plus);oppLinesSet();   // dal Medio in su: avversarie piu' forti (DIFF_PLUS); due linee anche per loro
  SQ.forEach(p=>{p.injNew=false;});fixLineup();   // gli infortunati non giocano
  const first=!SV.help;if(first){SV.help=true;persist();}   // salvo prima della forma del giorno
  fixLines();const lo=new Set(matchLine('lineO'));G.formB=teamFormB();applyForm(new Set(matchLine('lineD').filter(id=>lo.has(id))));   // chi sta in entrambe le linee rende DBL_PEN in meno
  G.oppName=m.name;G.myName=SV.team;G.matchLabel=m.label;
  newGame();G.target=carLen();G.lvl=[0,carDiff().ai|0];G.oppPlus=plus||0;G.idn=[null,teamIdentity(m.name,T[1])];G.xtr=SV.diff==='xtr';G.hint=(SV.diff||'easy')==='easy';G.routes=G.hint||SV.diff==='med';G.inMatch=true;G.recorded=false;
  G.duo=duoMap();   // intesa tra le coppie: vale solo in carriera
  G.vn=careerVenue(m);   // chi gioca in casa, impianto e pubblico (30-stadi.js)
  {const w=careerWind(m);setWind(w[0],w[1]);setWx(careerWeather(m));}   // il meteo annunciato sul cruscotto
  fixLines();G.lines={o:matchLine('lineO'),d:matchLine('lineD'),auto:!!SV.autoSub};G.injK=1-0.12*facLv('fis');   // linee d'attacco e di difesa, cambi intelligenti, fisioterapia
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
  if(first)openSchemes(true);   // la prima volta si aprono gli schemi, con il rimando a tutorial e guida
  else if(!resume)showIntro(m);   // finali, derby, ultima giornata con qualcosa in palio: un cartello breve prima del pull
}
function quitMatch(){if(!QM.on&&SV&&SV.susp){SV.susp=null;persist();}   // abbandonata: niente da riprendere
  $('half').classList.add('hidden');$('pause').classList.add('hidden');G.paused=false;restoreForm();if(QM.on){exitQuick(quickNext());return;}G.schemeOpen=false;G.inMatch=false;$('menu').classList.add('hidden');$('over').classList.add('hidden');showScreen('home');}
const SCREENS=['title','slots','quick','home','league','team','coachsel','roster','event','train','market','club','school','tourn','settings','posedit','ut','utPack','utShop','utTeam','utMode','utReal','utBoard','utEquip'];
function hideScreens(){for(const sc of SCREENS)$(sc).classList.add('hidden');$('cshell').classList.add('hidden');}
function showScreen(id){
  for(const sc of SCREENS)$(sc).classList.toggle('hidden',sc!==id);
  shellShow(id);   // barra in alto e navigazione laterale della carriera (50-schermate/24-guscio-carriera.js)
  G.mode='home';$(id).scrollTop=0;   // si entra in una schermata dall'alto (il browser ricorda lo scorrimento di quelle nascoste)
  if(['home','roster','market','club','train','event'].includes(id))setTimeout(()=>{if(!$(id).classList.contains('hidden'))tipOnce(id);},350);   // fumetto di primo accesso
  femPass();   // testi al femminile nel campionato Women (20-ui/19-femminile.js)
  if(id==='title')renderTitle();else if(id==='slots')renderCareers();else if(id==='quick')renderQuick();else if(id==='home')renderHome();else if(id==='league')renderLeagues();else if(id==='team')renderTeams();else if(id==='coachsel')renderCoach();else if(id==='roster'){rosterMsg='';sellArm=null;cardOpen=null;nickEdit=null;renderRoster();}else if(id==='event')renderEvent();else if(id==='settings')setSView('menu');else if(id==='posedit')layoutButtons();else if(id==='ut')renderUT();else if(id==='utMode'){}else if(id==='utReal')renderUtReal();else if(id==='utBoard')renderUtBoard();else if(id==='utPack')renderPack();else if(id==='utShop')renderShop();else if(id==='utTeam')renderTeamUT();else if(id==='utEquip')renderEquip();else if(id==='school')renderSchool();else if(id==='tourn')renderTourn();else if(id==='market'){mkMsg='';mkOpen.clear();if(SV.mkSeen!==SV.mkN){SV.mkSeen=SV.mkN;persist();}renderMarket();}else if(id==='club'){clMsg='';clInfo.clear();renderClub();}else{trainSel.clear();trainRes=null;renderTrain();}   // le «i» del Club si richiudono a ogni ingresso
}
const evName=()=>SV.event==='camp'?'Campionato':'Campionato europeo';
// difficolta' della carriera: ritmo degli allenamenti e forza delle avversarie
const CAR_DIFF={
  easy:{name:'Facile',n:1,plus:DIFF_PLUS[0],ai:0,txt:'Allenamenti a ogni partita. Avversarie che scelgono in modo semplice.'},
  med:{name:'Medio',n:2,plus:DIFF_PLUS[1],ai:1,txt:'Allenamenti una volta ogni 2 partite. Avversarie che leggono i mismatch e si adattano un po’ al tuo gioco, con +2 a tutte le statistiche.'},
  hard:{name:'Difficile',n:3,plus:DIFF_PLUS[2],ai:2,txt:'Allenamenti una volta ogni 3 partite. Avversarie che decidono, si posizionano e reagiscono meglio, con +4 a tutte le statistiche.'},
  xtr:{name:'Estrema',n:3,plus:DIFF_PLUS[3],ai:3,txt:'Avversarie ancora più attente, con +6 a tutte le statistiche; la traiettoria del lancio si vede solo all’inizio.'}
};
const carDiff=()=>CAR_DIFF[(SV&&SV.diff)||'easy']||CAR_DIFF.easy;
const carLen=()=>lenOk((SV&&SV.len)|0);   // durata delle partite di carriera (Opzioni): 7, 11 o 15 punti
const trainOpen=()=>((SV.played||0)%carDiff().n)===0;       // la sessione e' disponibile prima della 1a partita e poi ogni n partite giocate (anche in Europa)
const trainWait=()=>{const n=carDiff().n;return n-((SV.played||0)%n);};
const teamFormB=()=>clamp(clamp((SV.chem-50)/50*0.9+(SV.mor-50)/50*0.6,-1.5,1.5)+0.5*staffLv('ana')+(hasTr('ana','str')?0.3:0),-1.5,2.5);   // l'Analista si somma ad affiatamento e morale (prima stavano nello stesso tetto e contava poco)
// POTENZA della tua squadra (formula unica, 12-allenamenti-rose.js): tutta la rosa, senza penalita' di giornata. Per i confronti con le altre squadre e per la forza mostrata
const squadPower=()=>powerOfVals(SQ.map(mean9));
// livello dei tuoi 7 titolari (3 handler e 4 cutter): riferimento di crescita, mercato e giovani (rosterLevel), non una potenza
const squadLevel=()=>{const b=pickSeven(SQ,p=>p.role,mean9);return b.reduce((a,p)=>a+mean9(p),0)/b.length;};
// potenza di oggi della tua squadra nelle partite simulate: stessa formula, con i valori di oggi dei giocatori. Un infortunato non c'e'; le due linee sono 14 posti: chi sta
// in entrambe occupa due posti (una linea d'attacco e una di difesa) e in tutti e due rende DBL_PEN in meno (non riposa mai, 21-due-linee.js); chi non e' in nessuna linea e'
// panchina (un posto, dal 15º). Con cond, chi e' scarico rende COND_PEN per ogni punto di condizione che manca, come in partita (applyForm)
// PW_MY: carriere simulate con la strategia di sempre (stessa difficolta', stesso vantaggio per chi gioca bene) perdevano con la formula unica circa 1,5 punti di forza nelle
// Serie A rispetto a prima, perche' le rose del computer di vertice sono piu' profonde di quelle che si costruisce un giocatore, e meta' di quello si recupera con le linee (due
// posti a chi gioca in entrambe); gli ultimi 0,6 sono l'unica taratura (come LINE_REF prima): con 0,6 scudetto e vittorie tornano a quelli di prima (punti fissi G1-G6)
const PW_MY=0.6;
function myPow(cond){
  const lo=new Set(matchLine('lineO')),ld=new Set(matchLine('lineD'));if(!lo.size||!ld.size)return squadPower();
  const v=[];
  for(const p of SQ){
    if(p.inj)continue;const n=(lo.has(p.id)?1:0)+(ld.has(p.id)?1:0),x=mean9(p)-(n===2?DBL_PEN:0)-(cond?COND_PEN*(100-(p.cond===undefined?100:p.cond)):0);
    for(let k=0;k<Math.max(1,n);k++)v.push(x);
  }
  return powerOfVals(v)+PW_MY;
}
const matchPow=n=>n===SV.team?myPow(false):teamPow(n);
// livello in partita della tua squadra (le due linee che hai scelto, riportate alla scala dei 7 titolari con LINE_REF) e delle altre: solo per il freno alla crescita (carGrowK)
function myLinesLevel(){
  const lo=matchLine('lineO').map(id=>SQ[id]),ld=matchLine('lineD').map(id=>SQ[id]);if(!lo.length||!ld.length)return squadLevel();
  const dbl=new Set(lo.filter(p=>ld.includes(p))),av=l=>l.reduce((a,p)=>a+mean9(p)-(dbl.has(p)?DBL_PEN:0),0)/l.length;
  return (av(lo)+av(ld))/2+LINE_REF;
}
const matchLevel=n=>n===SV.team?myLinesLevel():teamLevel(n);
const teamPower=n=>n===SV.team?squadPower():(SV.rost&&SV.rost[n]?rosterPower(SV.rost[n])+carDiff().plus:null);
// forza mostrata nella scelta della squadra: la stessa rosa con cui si parte davvero (userRoster: 9 giocatori, come per le avversarie)
const previewPower=n=>REAL[n]?rosterPower(realRoster(REAL[n],'preview|'+n,realOpt(n,9))):0;
// stemma della squadra: scudetto con due colori e iniziali, generato dal nome
function crest(name,px){
  const h=hashStr('crest|'+name),h1=h%360,h2=(h1+130+(h>>8)%90)%360,ini=name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const dir=['135deg','180deg','90deg','45deg'][(h>>4)%4];
  return `<span class="crest" style="width:${px}px;height:${Math.round(px*1.12)}px;font-size:${Math.round(px*0.4)}px;background:linear-gradient(${dir},hsl(${h1} 68% 46%) 0 50%,hsl(${h2} 72% 56%) 50% 100%)">${ini}</span>`;
}
// i ritratti dei giocatori (avatar) stanno in 10b-avatar-dati.js (foglio dei disegni) e 10c-avatar-retro.js (ricerca per nome e volti disegnati nello stesso stile)
let teamTab='C';
function renderTeamList(){for(const b of $('tSr').children)b.classList.toggle('on',b.dataset.k===teamTab);$('tTeams').innerHTML=SERIES[teamTab].slice().sort(favFirst).map(n=>`<button type="button" class="tteam" data-n="${n.replace(/"/g,'&quot;')}"><span class="tn">${crest(n,22)}<span>${favMark(n)}${n}</span></span><b class="tp">${Math.round(previewPower(n))}</b></button>`).join('');}
// ---- menu iniziale e partita veloce ----
const QM={on:false,bak:null,a:null,b:null,s:1};   // s: la squadra che inizia in attacco (0 = tua/blu, 1 = avversaria/rossa)
const hasCareer=()=>!!(SV&&SV.team);
function renderTitle(){$('tSchoolS').textContent=SCH.tut?'Tutorial, pratica e sfide':((SCH.lv|0)?`Tutorial: lezione ${(SCH.lv|0)+1} di ${TUT_STEPS.length}`:'Nuovo? Inizia dal tutorial');$('tCareerS').textContent=hasCareer()?`Continua: ${SV.team}, ${SERIES_NAME[SV.sr]}${SV.susp?' · partita sospesa':''}`:'Scegli la squadra e inizia';const n=[1,2,3].filter(k=>slotInfo(k)).length;$('tSlotsS').textContent=n?`${n} di 3 slot · nuova`:'3 slot liberi';}
const qPowCache={};
function qRoster(n,min){if(isWomenClub(n))return lnRoster(n,'qm|'+n);return REAL[n]?realRoster(REAL[n],'qm|'+n,realOpt(n,min)):makeRoster(TEAM[n].power,'qm|'+n);}
function qPower(n){if(qPowCache[n]==null)qPowCache[n]=rosterPower(qRoster(n,7));return qPowCache[n];}
// squadre femminili (campionato Women, 37-leghe/07-women.js): linguette WA e WB; giocano solo tra loro
const qList=k=>k==='WA'||k==='WB'?LN_CL.IW.filter(r=>r[1]===k[1]).map(r=>r[0]):SERIES[k];
const qTab=n=>isWomenClub(n)?'W'+LN_BY[n].t:TEAM[n].series;
const qSerName=n=>isWomenClub(n)?'Women Serie '+LN_BY[n].t:'Serie '+TEAM[n].series;
function qGender(side){   // se le due squadre non sono dello stesso campionato (maschile o femminile), l'altra si adegua: la piu' vicina in forza dell'altro mondo
  const o=side==='a'?'b':'a',w=isWomenClub(QM[side]);if(isWomenClub(QM[o])===w&&QM[o]!==QM[side])return;
  const pool=(w?qList('WA').concat(qList('WB')):[].concat(SERIES.A,SERIES.B,SERIES.C)).filter(n=>n!==QM[side]);
  QM[o]=pool.slice().sort((x,y)=>Math.abs(qPower(x)-qPower(QM[side]))-Math.abs(qPower(y)-qPower(QM[side])))[0];
}
// divisione della partita veloce (QM.div: 'm' maschile, 'w' femminile): si sceglie in alto, il selettore mostra solo le squadre di quella divisione
const qDivAll=d=>d==='w'?qList('WA').concat(qList('WB')):[].concat(SERIES.A,SERIES.B,SERIES.C);
function qDivSet(d){
  QM.div=d;const all=qDivAll(d);
  if(!all.includes(QM.a))QM.a=hasCareer()&&all.includes(SV.team)?SV.team:(d==='w'?all[1]:'Grem');
  if(!all.includes(QM.b)||QM.b===QM.a)QM.b=d==='w'?all.filter(n=>n!==QM.a).sort((x,y)=>Math.abs(qPower(x)-qPower(QM.a))-Math.abs(qPower(y)-qPower(QM.a)))[0]:(all.find(n=>n!==QM.a&&TEAM[n].series!==TEAM[QM.a].series)||all.find(n=>n!==QM.a));
}
function renderQuick(){
  if(!QM.div)QM.div=hasCareer()&&lnWomenNow()?'w':'m';
  qDivSet(QM.div);
  for(const b of $('qDiv').children)b.classList.toggle('on',b.dataset.v===QM.div);
  $('qD').value=QM.d|0;$('qS').value=String(QM.s);$('qL').value=String(lenOk(QM.len|0));updateQuick();
}
// selettore delle squadre: le categorie sono linguette e l'elenco della categoria e' gia' aperto
function openPick(side){QM.side=side;QM.tab=qTab(QM[side]);renderPick();$('qPick').classList.remove('hidden');}
function renderPick(){
  const me=QM[QM.side],other=QM[QM.side==='a'?'b':'a'];
  $('qpT').textContent=QM.side==='a'?'Tua squadra (blu)':'Avversaria (rossa)';
  $('qpTabs').innerHTML=(QM.div==='w'?[['WA','Serie A'],['WB','Serie B']]:[['A','Serie A'],['B','Serie B'],['C','Serie C']]).map(([k,t])=>`<button type="button" data-k="${k}" class="${k===QM.tab?'on':''}">${t}</button>`).join('');
  $('qpG').innerHTML=qList(QM.tab).map(n=>`<button type="button" data-n="${n.replace(/"/g,'&quot;')}" class="${n===me?'sel':''}${n===other?' off':''}">${crest(n,22)}<span>${n}</span><b>${Math.round(qPower(n))}</b></button>`).join('');
}
function updateQuick(){
  const a=QM.a,b=QM.b;
  const row=n=>`${qSerName(n)} · forza ${Math.round(qPower(n))}`;
  const btn=n=>`<span class="tn">${crest(n,24)}<span>${n}</span></span><span class="qv">▾</span>`;
  $('qA').innerHTML=btn(a);$('qB').innerHTML=btn(b);
  $('qAP').textContent=row(a);$('qBP').textContent=row(b);
  $('qPlay').disabled=a===b;$('qPlay').textContent=a===b?'Scegli due squadre diverse':'Gioca';
  QM.d=+$('qD').value;QM.s=+$('qS').value;QM.len=+$('qL').value;
  $('qS').options[0].textContent=a;$('qS').options[1].textContent=b;   // i nomi delle due squadre
  $('qDP').textContent=['L’IA avversaria gioca in modo semplice.','L’IA avversaria sceglie e reagisce un po’ meglio.','L’IA avversaria sceglie e reagisce molto meglio.','Ancora più attenta del Difficile, e la traiettoria del lancio si vede solo all’inizio (un breve tratto tratteggiato).'][QM.d]+' '+['Le statistiche dei giocatori non cambiano.','Avversari con +2 a tutte le statistiche.','Avversari con +4 a tutte le statistiche.','Avversari con +6 a tutte le statistiche.'][QM.d];
  quickVs();   // confronto tra le due squadre (29-confronto-tabellone.js)
}
function startQuick(){
  const a=QM.a,b=QM.b;if(!a||!b||a===b)return;
  if(hasCareer()){persist();QM.bak=JSON.stringify(SV);}else QM.bak=null;   // la carriera resta com'e': viene rimessa alla fine
  QM.on=true;
  setSquad(qRoster(a,9));applyRoster(qRoster(b,7));oppBoost(DIFF_PLUS[clamp(QM.d|0,0,3)]);
  SQ.forEach(p=>{p.injNew=false;p.inj=0;p.cond=100;});
  G.formB=0;G.lines=null;G.injK=1;applyForm();
  G.oppName=b;G.myName=a;G.matchLabel='Partita veloce';
  newGame();G.target=lenOk(QM.len|0);rollWind();G.lvl=[0,clamp(QM.d|0,0,3)];G.oppPlus=DIFF_PLUS[clamp(QM.d|0,0,3)];G.idn=[null,teamIdentity(b,T[1])];G.xtr=(QM.d|0)===3;G.hint=(QM.d|0)===0;G.routes=(QM.d|0)<=1;G.inMatch=true;G.recorded=false;
  G.nextRec=QM.s===0?0:1;G.startRec=G.nextRec;   // chi riceve il primo pull inizia in attacco; l'altra squadra tira il pull (difesa)
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
}

