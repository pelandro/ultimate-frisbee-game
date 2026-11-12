/* ---- DIAGNOSTICA: esegue la suite di test del motore (selfTestPlan/selfTestRun) un passo alla volta, cosi' la pagina puo' aggiornare l'avanzamento ---- */
let diagBusy=false;
function runDiag(n){
  if(diagBusy)return;diagBusy=true;
  const bak=hasCareer()?(persist(),JSON.stringify(SV)):null,S=selfTestPlan({n,seed:2026}),out=$('dgOut');let ok=0,tot=0;
  out.innerHTML='';
  const step=i=>{
    if(i>=S.steps.length){
      if(bak){SV={};loadSave(JSON.parse(bak));}else{SV={};initTeams();}   // rimetto la rosa della carriera (o quella iniziale)
      lookKey='x';G.inMatch=false;diagBusy=false;
      $('dgState').textContent=`Finito: ${ok} controlli superati su ${tot} (${n} partite per gruppo, seme ${S.seed}).`;return;
    }
    $('dgState').textContent=`Passo ${i+1} di ${S.steps.length}: ${S.steps[i][0]}…`;
    setTimeout(()=>{
      const rows=selfTestRun(S,i);
      out.insertAdjacentHTML('beforeend',`<div class="ccard" style="margin-bottom:6px"><h3>${S.steps[i][0]}</h3><ul class="nlist">${rows.map(r=>{tot++;if(r.ok)ok++;return `<li><i style="color:${r.ok?'var(--good)':'var(--bad)'}">${r.ok?'OK':'NO'}</i>${esc(r.name)}: <b style="color:#fff;font-weight:400">${esc(r.val)}</b>${r.note?' <span style="color:#7f8db8">('+esc(r.note)+')</span>':''}</li>`;}).join('')}</ul></div>`);
      step(i+1);
    },60);
  };
  step(0);
}
$('dgQuick').addEventListener('click',()=>runDiag(3));
$('dgFull').addEventListener('click',()=>runDiag(8));
$('sGoSize').addEventListener('click',()=>setSView('size'));
$('sGoPos').addEventListener('click',()=>showScreen('posedit'));
// ---- editor della posizione: si trascinano Lancio, Hammer e SCATTO dove si vuole (il centro viene salvato come frazione dello schermo) ----
let pDrag=null;
function endPDrag(e){if(!pDrag||e.pointerId!==pDrag.id)return;pDrag.el.classList.remove('drag');pDrag=null;saveSett();}
for(const [name,id] of [['throw','pdThrow'],['hammer','pdHammer'],['sprint','pdSprint']]){
  const el=$(id);
  el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId);}catch(_){}const r=layRect(el);pDrag={name,el,id:e.pointerId,dx:e.clientX-(r.left+r.width/2),dy:e.clientY-(r.top+r.height/2)};el.classList.add('drag');});
  el.addEventListener('pointermove',e=>{
    if(!pDrag||pDrag.el!==el||e.pointerId!==pDrag.id)return;
    const tb=tbPx(),cx=clamp(e.clientX-pDrag.dx,tb/2+2,CW-tb/2-2),cy=clamp(e.clientY-pDrag.dy,tb/2+2,CH-tb/2-2);
    if(!SETT.pos)SETT.pos={throw:null,hammer:null,sprint:null};
    SETT.pos[name]=[cx/CW,cy/CH];layoutButtons();
  });
  el.addEventListener('pointerup',endPDrag);el.addEventListener('pointercancel',endPDrag);el.addEventListener('contextmenu',e=>e.preventDefault());
}
$('pdDone').addEventListener('click',()=>{showScreen('settings');setSView('btns');});
$('pdReset').addEventListener('click',()=>{SETT.pos=null;saveSett();layoutButtons();});
let testS=null;const sTest=$('sTest');
addRingTicks(sTest.querySelector('.ring'));
sTest.addEventListener('pointerdown',e=>{e.preventDefault();try{sTest.setPointerCapture(e.pointerId);}catch(_){}testS=G.tick;});
const endTest=()=>{testS=null;sTest.classList.remove('chg');};
sTest.addEventListener('pointerup',endTest);sTest.addEventListener('pointercancel',endTest);sTest.addEventListener('contextmenu',e=>e.preventDefault());
function updTest(){
  if(testS===null||$('settings').classList.contains('hidden'))return;
  const D=chargeDist(G.tick-testS);sTest.classList.add('chg');setRing(sTest.querySelector('.rf'),clamp(D/CH_MAX,0,1));
  $('sDist').textContent=Math.round(D)+' m'+(D>=SPARO_D?' · sparo':'');
}
uiReady=true;layoutButtons();
function aimDown(e,hammer){
  if(inDefense()){   // difesa: sinistra = tuffo, destra = handblock (stesso tempismo di prima, ma sul pulsante)
    e.preventDefault();
    if(G.diveWin&&!G.diveWin.done&&(hammer||!defMan()))diveTap();   // in difesa automatica vale qualsiasi tasto
    else if(!hammer&&tryHandblock()>=0)HOOKS.vibe(12);
    return;
  }
  if(G.mode==='ready'){e.preventDefault();if(!hammer)pullTap();return;}   // pull a tempo: Spazio o A fermano l'indicatore
  const h=G.holder;
  if(hammer&&e.pointerId!==VIN.pid){   // tocco sul pulsante Hammer: accende o spegne il lancio alto (vale anche a mira gia' iniziata)
    e.preventDefault();
    if(G.mode==='play'&&h&&h.t===0&&!G.flight){throwStyle=(throwStyle+1)%3;if(drag&&drag.sl){drag.btn=throwStyle?'hammer':'throw';G.high=throwStyle;}HOOKS.vibe(8);HOOKS.sfx('ui');}
    return;
  }
  if(G.mode!=='play'||G.freeze>0||G.zoomHold||G.brickWait||G.walk||G.flight||!h||h.t!==0||drag)return;
  e.preventDefault();
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}
  aimPid=e.pointerId;
  drag={btn:hammer?'hammer':'throw',ox:e.clientX,oy:e.clientY,s:G.tick,D:0,dirOk:false,ang:0,x:sxw(h.x),y:syw(h.y)};
  G.high=hammer;
}
function aimMove(e){
  if(!drag||e.pointerId!==aimPid)return;
  const vx=e.clientX-drag.ox,vy=e.clientY-drag.oy;
  if(hyp(vx,vy)>=CH_DEAD){drag.dirOk=true;drag.ang=Math.atan2(vy,vx);}else drag.dirOk=false;   // dito tornato al punto di partenza: nessuna direzione, il rilascio annulla
  syncAimPoint();
}
function aimUp(e){
  if(!drag||e.pointerId!==aimPid)return;
  syncAimPoint();
  const h=G.holder,ok=G.mode==='play'&&h&&h.t===0&&!G.flight&&G.freeze<=0;
  const w=toWorld(drag.x,drag.y),hi=G.high,dOk=drag.dirOk;
  const exq=drag.sl&&G.tick-drag.s<0.22?1.18:1;                          // lancio affrettato (rilasciato in un lampo): meno preciso
  const tapW=drag.sl&&!drag.was&&!drag.iso&&G.tick-drag.s<0.35?drag.tw:null;   // tocco senza trascinare: chiamata rapida a un compagno
  drag=null;aimPid=null;
  if(ok&&dOk&&hyp(w.x-h.x,w.y-h.y)>=3.5){   // nessuna direzione (dito al punto di partenza) o troppo vicino: il lancio si annulla
    updateCall(h,w.x,w.y,hi,true);
    const aim=computeAim(h,w.x,w.y,hi);
    doThrow(h,aim.x,aim.y,aim.intended,hi,exq);shownHint++;throwStyle=0;
  }else if(ok&&tapW)quickCall(tapW,false);
  G.high=false;
}
bSprint.addEventListener('pointerdown',e=>{if(!(G.flight&&G.flight.sparo&&G.sprint&&!G.pull))return;e.preventDefault();try{bSprint.setPointerCapture(e.pointerId);}catch(_){}G.hold=true;});
bSprint.addEventListener('pointerup',()=>{G.hold=false;});
bSprint.addEventListener('pointercancel',()=>{G.hold=false;});
bSprint.addEventListener('contextmenu',e=>e.preventDefault());
for(const [b,hm] of [[bThrow,false],[bHammer,true]]){
  b.addEventListener('pointerdown',e=>aimDown(e,hm));
  b.addEventListener('pointermove',aimMove);
  b.addEventListener('pointerup',aimUp);
  b.addEventListener('pointercancel',e=>{if(e.pointerId!==aimPid)return;if(drag){drag=null;G.high=false;}aimPid=null;});
  b.addEventListener('contextmenu',e=>e.preventDefault());
}

