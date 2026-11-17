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
const SCREENS=['title','slots','quick','home','league','team','coachsel','roster','event','train','market','club','school','tourn','settings','posedit','ut','utPack','utShop','utTeam','utMode','utReal','utBoard'];
function hideScreens(){for(const sc of SCREENS)$(sc).classList.add('hidden');$('cshell').classList.add('hidden');}
function showScreen(id){
  for(const sc of SCREENS)$(sc).classList.toggle('hidden',sc!==id);
  shellShow(id);   // barra in alto e navigazione laterale della carriera (50-schermate/24-guscio-carriera.js)
  G.mode='home';$(id).scrollTop=0;   // si entra in una schermata dall'alto (il browser ricorda lo scorrimento di quelle nascoste)
  if(['home','roster','market','club','train','event'].includes(id))setTimeout(()=>{if(!$(id).classList.contains('hidden'))tipOnce(id);},350);   // fumetto di primo accesso
  if(id==='title')renderTitle();else if(id==='slots')renderCareers();else if(id==='quick')renderQuick();else if(id==='home')renderHome();else if(id==='league')renderLeagues();else if(id==='team')renderTeams();else if(id==='coachsel')renderCoach();else if(id==='roster'){rosterMsg='';sellArm=null;cardOpen=null;nickEdit=null;renderRoster();}else if(id==='event')renderEvent();else if(id==='settings')setSView('menu');else if(id==='posedit')layoutButtons();else if(id==='ut')renderUT();else if(id==='utMode'){}else if(id==='utReal')renderUtReal();else if(id==='utBoard')renderUtBoard();else if(id==='utPack')renderPack();else if(id==='utShop')renderShop();else if(id==='utTeam')renderTeamUT();else if(id==='school')renderSchool();else if(id==='tourn')renderTourn();else if(id==='market'){mkMsg='';mkOpen.clear();if(SV.mkSeen!==SV.mkN){SV.mkSeen=SV.mkN;persist();}renderMarket();}else if(id==='club'){clMsg='';clInfo.clear();renderClub();}else{trainSel.clear();trainRes=null;renderTrain();}   // le «i» del Club si richiudono a ogni ingresso
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
// forza di una squadra = media delle statistiche dei suoi 7 migliori giocatori (3 handler e 4 cutter)
const teamFormB=()=>clamp(clamp((SV.chem-50)/50*0.9+(SV.mor-50)/50*0.6,-1.5,1.5)+0.5*staffLv('ana')+(hasTr('ana','str')?0.3:0),-1.5,2.5);   // l'Analista si somma ad affiatamento e morale (prima stavano nello stesso tetto e contava poco)
const squadPower=()=>{const b=pickSeven(SQ,p=>p.role,mean9);return b.reduce((a,p)=>a+mean9(p),0)/b.length;};
// forza in partita della tua squadra: le due linee che hai scelto (21-due-linee.js), riportate alla scala dei 7 migliori con LINE_REF.
// Le squadre del computer restano alla forza dei loro 7 migliori, come in tutto il resto del gioco
function myLinesPow(){
  const lo=matchLine('lineO').map(id=>SQ[id]),ld=matchLine('lineD').map(id=>SQ[id]);if(!lo.length||!ld.length)return squadPower();
  const dbl=new Set(lo.filter(p=>ld.includes(p))),av=l=>l.reduce((a,p)=>a+mean9(p)-(dbl.has(p)?DBL_PEN:0),0)/l.length;
  return (av(lo)+av(ld))/2+LINE_REF;
}
const matchPow=n=>n===SV.team?myLinesPow():teamPow(n);
const teamPower=n=>n===SV.team?squadPower():(SV.rost&&SV.rost[n]?rosterPower(SV.rost[n])+carDiff().plus:null);
// forza mostrata nella scelta della squadra: la stessa rosa con cui si parte davvero (userRoster: 9 giocatori, come per le avversarie)
const previewPower=n=>REAL[n]?rosterPower(realRoster(REAL[n],'preview|'+n,realOpt(n,9))):0;
// stemma della squadra: scudetto con due colori e iniziali, generato dal nome
function crest(name,px){
  const h=hashStr('crest|'+name),h1=h%360,h2=(h1+130+(h>>8)%90)%360,ini=name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const dir=['135deg','180deg','90deg','45deg'][(h>>4)%4];
  return `<span class="crest" style="width:${px}px;height:${Math.round(px*1.12)}px;font-size:${Math.round(px*0.4)}px;background:linear-gradient(${dir},hsl(${h1} 68% 46%) 0 50%,hsl(${h2} 72% 56%) 50% 100%)">${ini}</span>`;
}
// ritratto del giocatore in pixel art, stile del campo (contorno scuro, luce da sinistra in alto): griglia 32x32 con occhi, sopracciglia, naso, bocca, orecchie, ombre,
// capelli a ciocche e divisa con scollo. Capelli, pelle, barba e fascia vengono dall'aspetto del giocatore (look); la divisa dalla squadra. Ogni pixel e' un quadratino netto:
// la misura e' 32 (elenchi), 64 (carte) o 96 (anteprima dell'allenatore), cosi' i pixel non si deformano.
const AVC=new Map();
function avatar(p,px){
  const z=px<40?32:(px<72?64:96),lk0=p.look||DEF_LOOK,key=[lk0.hair,lk0.skin,lk0.style|0,lk0.beard|0,lk0.band||'',p.t|0,z].join('|');   // la stessa faccia si ridisegna spesso (liste lunghe): si ricorda
  if(AVC.has(key))return AVC.get(key);
  const N=32,lk=p.look||DEF_LOOK,un=UNI[p.t||0]||UNI[0],hr=lk.hair,sk=lk.skin,O='#1a1020',MO='#7a3b2e';
  const skS=shade(sk,-0.14),skD=shade(sk,-0.3),skL=shade(sk,0.1),hrD=shade(hr,-0.34),hrL=shade(hr,0.32),sh=un.shirt,shD=shade(sh,-0.3),shL=shade(sh,0.28);
  const G=Array.from({length:N},()=>Array(N).fill(null));
  const R=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(i>=0&&i<N&&j>=0&&j<N)G[j][i]=c;},P=(x,y,c)=>R(x,y,1,1,c);
  // forma della testa: ellisse "squadrata" (mascella piu' stretta); in(x,y,dx,dy) dice se il pixel e' dentro l'ellisse allargata di dx,dy
  const CX=16,CY=13.6,RX=8.6,RY=9.9,NE=2.5;
  const inE=(x,y,dx,dy,up)=>{const a=(x+0.5-CX),b=(y+0.5-(CY-(up||0)));const rx=(RX+dx)*(b>0?1-0.12*Math.pow(b/(RY+dy),2):1),ry=RY+dy;return Math.pow(Math.abs(a)/rx,NE)+Math.pow(Math.abs(b)/ry,NE)<=1;};
  const head=(x,y)=>inE(x,y,0,0),headIn=(x,y)=>inE(x,y,-1,-1);
  const hairOut=(x,y)=>inE(x,y,1.2,1.2,0.5),hairIn=(x,y)=>inE(x,y,0.2,0.2,0.5);
  const st=lk.style|0;
  // sfondo: divisa molto scura con puntinatura ai bordi
  const bg=shade(sh,-0.62),bg2=shade(sh,-0.5);R(0,0,N,N,bg);
  R(0,19,N,13,bg2);for(let x=0;x<N;x+=2)P(x,18,bg2);   // orizzonte: parte bassa un po' piu' chiara
  // capelli lunghi dietro le spalle / coda
  if(st===2){R(5,9,22,20,O);R(6,10,20,19,hr);for(let y=11;y<28;y+=3){P(7,y,hrD);P(24,y+1,hrD);}R(6,10,2,16,hrD);P(8,12,hr);}
  if(st===3){R(24,8,6,13,O);R(25,9,4,11,hr);R(27,10,1,9,hrD);R(24,9,2,2,'#ff5a3c');}
  // collo
  R(11,20,10,6,O);R(12,20,8,6,sk);R(12,22,8,2,skD);R(12,24,8,1,skS);R(18,20,2,6,skS);
  // busto: spalle spioventi
  R(6,25,20,1,O);R(3,26,26,1,O);R(1,27,30,1,O);R(0,28,32,4,O);
  R(7,26,18,1,sh);R(4,27,24,1,sh);R(2,28,28,1,sh);R(1,29,30,3,sh);
  R(8,26,5,1,shL);R(19,26,5,1,shL);R(4,27,5,1,shL);R(23,27,5,1,shL);R(1,29,2,3,shD);R(29,29,2,3,shD);R(14,30,4,2,shD);
  R(1,30,5,1,shL);R(26,30,5,1,shL);   // fascia sulle maniche
  // scollo a V con bordo
  R(12,26,8,1,sk);R(13,27,6,1,sk);R(14,28,4,1,sk);R(15,29,2,1,sk);P(18,27,skS);P(17,28,skS);
  P(12,26,shL);P(19,26,shL);P(13,27,shL);P(18,27,shL);P(14,28,shL);P(17,28,shL);P(15,29,shL);P(16,29,shL);P(11,26,shL);P(20,26,shL);
  if(st===2){R(5,22,5,9,O);R(6,22,3,9,hr);R(6,25,1,5,hrD);R(22,22,5,9,O);R(23,22,3,9,hr);R(25,25,1,5,hrD);}
  // testa: contorno, pelle, ombre
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(head(x,y))G[y][x]=headIn(x,y)?sk:O;}
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(headIn(x,y)){
    if(x>=22||y>=22)G[y][x]=skS;
    if(x>=23&&y>=14)G[y][x]=skD;
    if(y===10&&x>=12&&x<=15)G[y][x]=skL;
  }
  // orecchie
  R(5,13,2,4,O);R(6,14,1,2,sk);P(6,15,skD);R(25,13,2,4,O);R(25,14,1,2,skS);P(25,15,skD);
  // viso: sopracciglia, occhi, naso, bocca, guance
  R(10,12,4,1,hrD);R(18,12,4,1,hrD);P(10,12,hr);P(21,12,hr);
  R(11,14,3,1,O);R(18,14,3,1,O);R(11,15,3,1,'#ffffff');R(18,15,3,1,'#ffffff');P(12,15,'#2a1810');P(19,15,'#2a1810');P(11,14,O);P(20,14,O);
  P(12,14,shade(hr,-0.5));P(19,14,shade(hr,-0.5));
  P(16,16,skS);R(15,17,2,1,skD);P(15,16,skL);
  R(14,20,4,1,MO);P(13,19,MO);P(18,19,MO);R(15,21,2,1,skS);
  R(9,18,2,1,skS);R(21,18,2,1,skS);
  // barba
  if(lk.beard){
    for(let y=17;y<N;y++)for(let x=0;x<N;x++)if(headIn(x,y)&&y>=18&&!(y<=19&&Math.abs(x-16)<2))G[y][x]=((x*3+y)%4===0)?hr:hrD;
    R(12,18,8,1,hrD);R(14,19,4,1,hrD);R(14,20,4,1,MO);R(15,21,2,1,skS);P(13,19,hrD);P(18,19,hrD);
  }
  // capelli
  if(st===4){for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(headIn(x,y)&&y<=9)G[y][x]=((x*2+y)%5===0)?skD:skS;for(let x=9;x<23;x++)if(headIn(x,9))G[9][x]=skD;}
  else{
    const HS=[[11,11,10,9,8,8,9,8,8,7,7,8,8,9,8,8,9,10,11,11],[15,14,12,10,9,9,10,9,8,9,9,8,10,9,9,10,11,13,14,15],[17,16,13,10,9,9,8,8,8,9,8,9,9,10,10,12,16,17,17,17],[11,11,10,9,8,8,9,8,8,7,7,8,8,9,8,8,9,10,11,11]];
    const H=HS[st===1?1:(st===2?2:0)];
    for(let y=0;y<N;y++)for(let x=6;x<=25;x++){const h=H[x-6];if(y>h)continue;
      if(hairIn(x,y))G[y][x]=(y===h?hrD:hr);else if(hairOut(x,y))G[y][x]=O;}
    // luci e ciocche
    for(let y=0;y<N;y++)for(let x=6;x<=25;x++)if(hairIn(x,y)&&y<=H[x-6]&&y!==H[x-6]){
      if((y===4&&x>=11&&x<=17)||(y===5&&x>=10&&x<=14)||(y===6&&x>=9&&x<=11))G[y][x]=hrL;
      else if(y>=6&&((x*5+y*3)%7===0))G[y][x]=hrD;}
    // scriminatura
    if(st!==1){for(let y=3;y<=7;y++)if(hairIn(19,y))G[y][19]=hrD;}
    if(lk.band){for(let y=9;y<=10;y++)for(let x=5;x<=26;x++){if(hairIn(x,y)||(hairOut(x,y)&&H[x-6]>=y&&false))G[y][x]=y===9?lk.band:shade(lk.band,-0.28);else if(hairOut(x,y))G[y][x]=O;}}
  }
  let o='';
  for(let y=0;y<N;y++){let x=0;while(x<N){const c=G[y][x];let w=1;while(x+w<N&&G[y][x+w]===c)w++;if(c)o+=`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${c}"/>`;x+=w;}}
  const out=`<svg class="av" viewBox="0 0 ${N} ${N}" width="${z}" height="${z}" shape-rendering="crispEdges" aria-hidden="true">${o}</svg>`;
  AVC.set(key,out);return out;
}
let teamTab='C';
function renderTeamList(){for(const b of $('tSr').children)b.classList.toggle('on',b.dataset.k===teamTab);$('tTeams').innerHTML=SERIES[teamTab].slice().sort(favFirst).map(n=>`<button type="button" class="tteam" data-n="${n.replace(/"/g,'&quot;')}"><span class="tn">${crest(n,22)}<span>${favMark(n)}${n}</span></span><b class="tp">${Math.round(previewPower(n))}</b></button>`).join('');}
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
  $('qpT').textContent=QM.side==='a'?'Tua squadra (blu)':'Avversaria (rossa)';
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

