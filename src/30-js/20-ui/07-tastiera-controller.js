/* ---- tastiera e controller: stessi comandi dei pulsanti a schermo ----
   Frecce o WASD = direzione (si aggancia al compagno piu' vicino a quella direzione, e lo segue mentre corre).
   Spazio (o J) = Lancio: tieni premuto per caricare, rilascia per tirare; in difesa = handblock; durante uno sparo = scatto; nello stacco laterale = tocco.
   Maiusc (o K) = lancio alto (Hammer); in difesa = tuffo. Invio (o Y) in difesa = salta il possesso avversario. Esc = annulla il lancio. Controller: stick o croce = direzione, A / RT = Lancio, X / B = Hammer. */
const SRC={kb:{th:false,hm:false,ang:null},pad:{th:false,hm:false,ang:null}},VIN={th:false,hm:false,ang:null,live:false,sp:false,pid:9001,hintUntil:0,hinted:false};
const vinEvt=(x,y)=>({pointerId:VIN.pid,clientX:x,clientY:y,preventDefault(){},currentTarget:{setPointerCapture(){}}});
const angDiff=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
const kbOn=()=>G.inMatch&&!G.schemeOpen&&(G.mode==='play'||G.mode==='ready'||G.mode==='cine');
const MAG_CONE=0.56;   // 32 gradi: entro questo angolo la direzione si aggancia a un compagno
function vinAngle(){
  if(VIN.ang===null)return null;
  const h=G.holder;if(!h||h.t!==0||G.mode!=='play'||G.flight)return VIN.ang;
  let best=null,bs=9;
  for(const q of T[0]){
    if(q===h)continue;
    const dx=q.x-h.x,dy=q.y-h.y,d=hyp(dx,dy);if(d<4)continue;
    const a=Math.atan2(dy,dx),df=angDiff(a,VIN.ang),sc=df+d*0.002;
    if(df<MAG_CONE&&sc<bs){bs=sc;best=a;}
  }
  return best===null?VIN.ang:best;
}
function vinPushDir(){
  if(!VIN.live||aimPid!==VIN.pid)return;
  let a=vinAngle();
  if(a!==null){VIN.lastAng=a;VIN.lastT=G.tick;}
  else if(VIN.lastAng!==undefined&&G.tick-VIN.lastT<0.16)a=VIN.lastAng;   // freccia e Spazio rilasciati quasi insieme: il lancio non si annulla
  if(a===null)aimMove(vinEvt(0,0));else aimMove(vinEvt(Math.cos(a)*40,Math.sin(a)*40));
}
function vinDown(hm){
  if(!kbOn())return;
  if(G.mode==='cine'){cineTap();return;}
  if(G.flight&&G.flight.sparo&&G.sprint&&!G.pull){G.hold=true;VIN.sp=true;return;}   // sparo in volo: tenere premuto = scatto
  aimDown(vinEvt(0,0),hm);
  VIN.live=aimPid===VIN.pid;VIN.lastAng=undefined;
  vinPushDir();
}
function vinUp(){
  if(VIN.sp){VIN.sp=false;G.hold=false;return;}
  if(VIN.live){vinPushDir();VIN.live=false;aimUp(vinEvt(0,0));}
}
function vinSync(){   // unisce tastiera e controller: un comando e' premuto se lo e' da una delle due fonti
  const th=!!(SRC.kb.th||SRC.pad.th),hm=!!(SRC.kb.hm||SRC.pad.hm);
  VIN.ang=SRC.kb.ang!==null?SRC.kb.ang:SRC.pad.ang;
  if(th!==VIN.th){VIN.th=th;if(th)vinDown(0);else vinUp();}
  if(hm!==VIN.hm){VIN.hm=hm;if(hm)vinDown(1);else vinUp();}
  vinPushDir();
}
function vinCancel(){if(!VIN.live)return;VIN.live=false;drag=null;aimPid=null;G.high=false;}
const KB_DIRS={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],KeyW:[0,-1],KeyS:[0,1],KeyA:[-1,0],KeyD:[1,0]};
const kbHeld=new Set();
function kbRecalc(){let x=0,y=0;for(const c of kbHeld){const d=KB_DIRS[c];x+=d[0];y+=d[1];}SRC.kb.ang=(x||y)?Math.atan2(y,x):null;}
const kbKind=c=>c in KB_DIRS?'dir':((c==='Space'||c==='KeyJ')?'th':((c==='ShiftLeft'||c==='ShiftRight'||c==='KeyK')?'hm':''));
// compagno verso cui punta la direzione premuta (per le chiamate da tastiera)
function vinMate(){const h=G.holder;if(VIN.ang===null||!h||h.t!==0)return null;let b=null,bs=9;for(const q of T[0]){if(q===h)continue;const dx=q.x-h.x,dy=q.y-h.y,d=hyp(dx,dy);if(d<4)continue;const df=angDiff(Math.atan2(dy,dx),VIN.ang);if(df<0.7&&df+d*0.002<bs){bs=df+d*0.002;b=q;}}return b;}
// tasti singoli: E = chiama il taglio, Q = isolamento (in difesa: cambia difensore, anche Tab), C = clear, F = anticipo o contenimento
function kbAction(c){
  if(G.mode!=='play')return false;
  if(inDefense()){if(c==='Enter'){skipDefense();return true;}if(c==='KeyQ'||c==='Tab'){if(defMan()){cycleCtrl();HOOKS.sfx('ui');}return true;}if(c==='KeyF'){toggleDmode();return true;}return false;}
  const h=G.holder;if(!h||h.t!==0||G.flight)return false;
  if(c==='KeyC'){quickCall({x:h.x,y:h.y-1.4},false);return true;}
  if(c==='KeyE'||c==='KeyQ'){const q=vinMate();if(q)quickCall({x:q.x,y:q.y-1.4},c==='KeyQ');return true;}
  return false;
}
window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.code==='Escape'&&VIN.live&&kbOn()){e.preventDefault();vinCancel();return;}
  if((e.code==='Escape'||e.code==='KeyP')&&!e.repeat){if(G.paused&&!$('pause').classList.contains('hidden')){e.preventDefault();closePause();return;}if(G.inMatch&&(G.mode==='play'||G.mode==='ready')&&!G.schemeOpen){e.preventDefault();openPause();return;}}
  if(kbOn()&&(['KeyE','KeyQ','KeyC','KeyF','Tab'].includes(e.code)||(e.code==='Enter'&&inDefense()))){e.preventDefault();if(!e.repeat)kbAction(e.code);return;}
  const k=kbKind(e.code);if(!k||!kbOn())return;
  e.preventDefault();if(e.repeat)return;
  if(!VIN.hinted&&G.mode!=='cine'){VIN.hinted=true;VIN.hintUntil=G.tick+7;}
  if(k==='dir'){kbHeld.add(e.code);kbRecalc();}else SRC.kb[k]=true;
  vinSync();
},true);
window.addEventListener('keyup',e=>{
  const k=kbKind(e.code);if(!k)return;
  if(kbOn())e.preventDefault();
  if(k==='dir'){kbHeld.delete(e.code);kbRecalc();}else SRC.kb[k]=false;
  vinSync();
},true);
window.addEventListener('blur',()=>{kbHeld.clear();SRC.kb.th=SRC.kb.hm=false;SRC.kb.ang=null;SRC.pad.th=SRC.pad.hm=false;G.cdir=null;vinSync();});
let padSeen=false,padSw=false,padY=false;
function padPoll(){
  const gps=navigator.getGamepads?navigator.getGamepads():null;let g=null;
  if(gps)for(const q of gps)if(q&&q.connected){g=q;break;}
  if(!g){if(padSeen){padSeen=false;SRC.pad.th=SRC.pad.hm=false;SRC.pad.ang=null;vinSync();}return;}
  padSeen=true;
  const b=i=>!!(g.buttons[i]&&g.buttons[i].pressed);
  let dx=g.axes[0]||0,dy=g.axes[1]||0;if(b(14))dx=-1;if(b(15))dx=1;if(b(12))dy=-1;if(b(13))dy=1;
  SRC.pad.ang=hyp(dx,dy)>0.45?Math.atan2(dy,dx):null;
  SRC.pad.th=b(0)||b(7)||b(5);SRC.pad.hm=b(2)||b(1);
  if(b(3)&&!padY&&inDefense())skipDefense();padY=b(3);   // Y in difesa: salta il possesso avversario
  if(b(4)&&!padSw){if(inDefense())cycleCtrl();else{const q=vinMate();if(q)quickCall({x:q.x,y:q.y-1.4},false);}}padSw=b(4);   // LB: cambia difensore o chiama il taglio
  if(SRC.pad.th||SRC.pad.hm||SRC.pad.ang!==null||VIN.th||VIN.hm){if(!VIN.hinted&&kbOn())VIN.hinted=true;vinSync();}
}
/* schermo intero (su telefono parte al primo tocco; il pulsante nella schermata Schemi lo attiva o lo chiude) */
const fsEl=document.documentElement||{},fsReq=fsEl.requestFullscreen||fsEl.webkitRequestFullscreen;
const fsOn=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
function goFullscreen(){
  if(!fsReq||fsOn())return;
  try{
    const r=fsReq.call(fsEl);
    const lock=()=>{try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});}catch(_){}};
    if(r&&r.then)r.then(lock).catch(()=>{});else lock();
  }catch(_){}
}
function leaveFullscreen(){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch(_){}}
const touchDev=typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches;
if(touchDev)window.addEventListener('pointerup',goFullscreen,{once:true,capture:true});
const toggleFs=()=>{if(fsOn())leaveFullscreen();else goFullscreen();};
$('sFs').addEventListener('click',()=>{
  if(fsReq)toggleFs();
  else $('hFs').textContent='iPhone: Condividi › Aggiungi a Home';   // Safari su iPhone non ha lo schermo intero per le pagine web
});
const updFs=()=>{$('hFs').textContent=fsOn()?'Attivo: tocca per uscire':'Usa tutto lo schermo';};
document.addEventListener('fullscreenchange',updFs);document.addEventListener('webkitfullscreenchange',updFs);
bSch.addEventListener('click',()=>{if(G.mode==='ready')openSchemes(false);});
skipBtn.addEventListener('click',()=>{if(RP.on)rpEnd(true);else skipCine();});

