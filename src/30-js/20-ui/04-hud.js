/* ---- HUD ---- */
const bDef=$('bDef');bDef.addEventListener('click',()=>{if(inDefense())toggleDmode();});
const hud=$('hud'),elScore0=$('s0'),elScore1=$('s1'),elPt=$('pt'),elStall=$('stall'),elHint=$('hint'),bThr=$('thr'),bSprint=$('bSprint'),bThrow=$('bThrow'),bHammer=$('bHammer'),bSch=$('bSch'),skipBtn=$('skip');
const cache=new Map();
function setHTML(el,html){if(cache.get(el)!==html){cache.set(el,html);el.innerHTML=html;}}
const ATT_NAME={vert:'Verticale',horz:'Orizzontale',hex:'Esagono',side:'Stack laterale',t1:'T1'},DEF_NAME={man_out:'Uomo, forza fuori',man_in:'Uomo, forza dentro',zone:'Zona',man_poach:'Uomo con aiuti'};
let shownHint=0,shownPull=0,shownDef=0;
// in difesa (l'avversario ha il disco o lo ha lanciato) i due pulsanti diventano handblock (destra) e tuffo (sinistra)
const inDefense=()=>G.mode==='play'&&!G.pull&&!!((G.holder&&G.holder.t===1)||(G.flight&&G.flight.team===1));
function updateHUD(dt){
  const play=G.mode==='play'||G.mode==='banner'||G.mode==='ready';
  hud.classList.toggle('hidden',!play||G.schemeOpen);
  skipBtn.classList.toggle('hidden',G.mode!=='cine');
  if(!play)return;
  elScore0.textContent=G.drill?drHud(0):G.score[0];elScore1.textContent=G.drill?drHud(1):G.score[1];
  $('score').classList.toggle('mini',G.mode==='play');   // durante l'azione restano solo i due numeri; a fine meta tornano i nomi
  elPt.textContent=G.drill?G.matchLabel:(G.matchLabel?G.matchLabel+' · ':'')+'Meta '+G.pointNo;myN.textContent=G.drill?drHud(2):(G.myName||'Blu');oppN.textContent=G.drill?drHud(3):(G.oppName||'Rossi');bExit.classList.toggle('hidden',!G.inMatch);
  const h=G.holder;
  const n=h&&!G.flight&&G.marker&&hyp(G.marker.x-h.x,G.marker.y-h.y)<3.8?Math.min(10,Math.floor(G.stallT)+1):0;
  elStall.classList.toggle('hidden',!n||G.mode!=='play');elStall.classList.toggle('hot',n>=7);
  if(n)elStall.textContent='Stall '+n;
  const mine=h&&h.t===0&&!G.flight&&G.mode==='play';
  const canThrow=mine&&G.freeze<=0&&!G.zoomHold&&!G.brickWait&&!G.walk;
  const pullMine=G.mode==='ready'&&G.pullTeam===0&&!G.auto&&!G.schemeOpen&&!!G.puller;   // il pull si carica con il pulsante «Lancio»
  const defNow=inDefense(),man=defMan(),hbRdy=defNow&&!!hbWindow()&&!G.hbAtt,dvRdy=defNow&&!!(G.diveWin&&!G.diveWin.done);   // rdy: e' il momento di premere
  // difesa automatica: il tasto del tuffo compare solo nel momento del tuffo a tempo, quello dell'handblock mai
  bThr.classList.toggle('hidden',!(mine||defNow));bThr.classList.toggle('def',defNow);bThr.classList.toggle('dis',mine&&!canThrow);bHammer.classList.toggle('hidden',!(mine||(defNow&&(man||dvRdy))));
  bThrow.classList.toggle('hidden',!(defNow&&man));   // in attacco si lancia trascinando sullo schermo: resta solo l'interruttore Hammer
  if(!mine)throwStyle=0;
  $('stLab').textContent=STYLE_LBL[drag&&!drag.sl?(G.high|0):throwStyle];bHammer.classList.toggle('bl',mine&&(drag&&!drag.sl?G.high===2:throwStyle===2));
  bThrow.classList.toggle('rdy',hbRdy);bHammer.classList.toggle('rdy',dvRdy);
  bThrow.classList.toggle('on',!!(drag&&drag.btn==='throw'));bHammer.classList.toggle('on',!!((mine&&throwStyle===1)||(drag&&drag.btn==='hammer'&&G.high!==2)));
  if(!mine&&drag){drag=null;aimPid=null;G.high=false;}   // il disco e' partito o cambiato mano: il mirino si annulla
  updRings();
  const spr=G.mode==='play'&&!!G.flight&&!!G.flight.sparo&&!!G.sprint&&!G.pull;   // SCATTO: solo sui lanci lunghi
  bSprint.classList.toggle('hidden',!spr);
  if(spr){const q=G.sprint.p;bSprint.classList.toggle('on',!!(G.hold&&q.st>3));const f=bSprint.querySelector('.rf');f.style.strokeDashoffset=(RING_C*(1-clamp(q.st/100,0,1))).toFixed(1);f.style.stroke=barColor(q.st);}
  bSch.classList.toggle('hidden',G.mode!=='ready'||!!G.drill);bSub.classList.toggle('hidden',G.mode!=='ready'||!!G.drill);$('bSimPt').classList.toggle('hidden',G.mode!=='ready'||!!G.drill);
  bSkipD.classList.toggle('hidden',!canSkipDef());
  bDef.classList.toggle('hidden',!defNow);bDef.classList.toggle('on',G.dmode[0]===1);bDef.textContent=G.dmode[0]?'Marcatura: anticipo':'Marcatura: contieni';
  if(!defNow&&(ddrag||G.cdir)){ddrag=null;G.cdir=null;}
  let hint='';
  if(G.mode==='ready'&&G.pullTeam===1&&!G.schemeOpen)hint='Pull avversario tra '+Math.max(1,Math.ceil(G.readyT));
  if(G.mode==='play'&&G.holder&&!G.flight){if(G.brickWait)hint='Brick: si aspetta che la difesa si schieri';else if(G.walk)hint='Si riparte dalla linea di meta';}
  if(!hint&&pullMine&&pm)hint=pm.ph?'Tocca per fermare la DIREZIONE dentro il campo':'PULL: tocca per fermare la POTENZA nel verde';
  if(!hint&&canThrow&&!drag&&shownHint<3)hint='Trascina all’indietro e rilascia per lanciare';
  if(!hint&&canThrow&&!drag&&shownHint>=3&&shownCall<2&&G.holdT>1.2)hint='Tocca un compagno per chiamargli il taglio';
  if(!hint&&dvRdy&&!man)hint='TUFFO! Tocca quando il cerchio si chiude';
  if(!hint&&defNow&&G.holder&&man&&shownCtrl<3)hint='Difesa: trascina per muovere il difensore azzurro';
  if(!hint&&defNow&&G.holder&&!man&&shownSkip<3)hint='Difesa automatica: tocca SALTA per andare avanti';
  if(!hint&&G.tick<VIN.hintUntil&&G.mode==='play')hint=defNow?(man?'Spazio: handblock · Maiusc: tuffo':'Invio: salta la difesa · Spazio: tuffo quando compare'):'Frecce: direzione · Spazio: lancio (tieni premuto) · Maiusc: Hammer';
  if(DR.on)hint='';
  elHint.classList.toggle('hidden',!hint);if(hint)elHint.textContent=hint;
  drillTick();
}

