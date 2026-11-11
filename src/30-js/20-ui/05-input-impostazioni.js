/* ---- input ---- */
let drag=null,tap=null,ddrag=null;
const ptr=e=>{const r=cv.getBoundingClientRect();return {px:e.clientX-r.left,py:e.clientY-r.top};};
function nearestPlayer(px,py,maxd,team){
  let b=null,bd=maxd;const off=PH()*0.5;
  for(const p of (team===undefined?T[0].concat(T[1]):T[team])){const d=hyp(sxw(p.x)-px,syw(p.y)-off-py);if(d<bd){bd=d;b=p;}}
  return b;
}
/* ---- LANCIO A TRASCINAMENTO (come il lancio di Retro Bowl): si tocca lo schermo in un punto qualsiasi, si trascina il dito all'indietro come una fionda
   e si rilascia. Il disco parte nella direzione opposta al trascinamento e va tanto piu' lontano quanto piu' e' lungo. Riportando il dito vicino al punto
   di partenza il lancio si annulla. Non c'e' nessun pulsante di lancio. Il pull e' un evento a parte, a due tocchi (09-difesa-pull.js). ---- */
const SL_DEAD=14;                                  // px: sotto questa lunghezza non c'e' direzione e il rilascio annulla
const SL_SENS=[1.3,1.14,1,0.86],DSL=['Molto bassa','Bassa','Media','Alta'];   // sensibilita' (Impostazioni): piu' e' alta, meno bisogna trascinare
const slFull=()=>0.5*CH*SL_SENS[SETT.ds];          // px di trascinamento per il lancio massimo (55 m): meta' dell'altezza dello schermo
// distanza in metri: cresce piano all'inizio (i passaggi corti sono precisi) e in fretta alla fine (gli spari)
function slDist(len){const u=clamp((len-SL_DEAD)/(slFull()-SL_DEAD),0,1);return 3.5+(CH_MAX-3.5)*(0.45*u+0.55*u*u);}
let throwStyle=0;                                  // tipo di lancio scelto col pulsante in basso a destra: 0 piatto, 1 alto (scoober o hammer), 2 blade
const STYLE_LBL=['PIATTO','ALTO','BLADE'];
// CHIAMATE RAPIDE: tocco su un compagno = taglio (profondo se e' vicino, di rientro se e' lontano); pressione lunga = isolamento; tocco sul portatore = clear
function nearMate(w,team,r){let b=null,bd=r;for(const q of T[team]){const d=hyp(q.x-w.x,q.y-1.4-w.y);if(d<bd){bd=d;b=q;}}return b;}
function quickCall(w,long){
  const h=G.holder;if(!h||h.t!==0||G.flight)return;
  const q=nearMate(w,0,3.4);if(!q)return;
  if(q===h){if(callClear(0)){addFloater('CLEAR!',h.x,h.y,PAL.sky);HOOKS.sfx('ui');HOOKS.vibe(8);}return;}
  const k=long?callIso(q):callCut(q,'auto');if(!k)return;
  addFloater(long?'ISO!':(k==='deep'?'LUNGO!':'VIENI!'),q.x,q.y,PAL.sky);HOOKS.sfx('ui');HOOKS.vibe(8);shownCall++;
}
let shownCall=0,shownCtrl=0;
function toggleDmode(){G.dmode[0]=1-G.dmode[0];HOOKS.sfx('ui');HOOKS.vibe(8);}
function slMove(e){
  const vx=e.clientX-drag.ox,vy=e.clientY-drag.oy,len=hyp(vx,vy);
  drag.fx=e.clientX;drag.fy=e.clientY;
  if(len>=SL_DEAD){drag.dirOk=true;drag.was=true;drag.ang=Math.atan2(-vy,-vx);drag.D=slDist(len);}
  else{drag.dirOk=false;drag.D=0;}
  syncAimPoint();
}
cv.addEventListener('pointerdown',e=>{
  if(RP.on){rpEnd(true);return;}   // un tocco salta il replay
  if(G.mode==='cine'){cineTap();return;}
  if(G.mode==='ready'){pullTap();return;}   // pull a tempo: ogni tocco ferma un indicatore
  if(diveTouch())return;                      // difesa automatica: durante il rallentatore basta toccare lo schermo per tuffarsi
  if(G.mode!=='play'||G.freeze>0||G.zoomHold||G.brickWait||G.walk)return;   // brick o disco da raccogliere: si aspetta
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
  const sprintNow=!!(G.flight&&G.flight.sparo&&G.sprint&&!G.pull);if(sprintNow)G.hold=true;   // sparo in volo: tieni premuto per far scattare il tuo corridore
  if(inDefense()&&!G.auto&&!defMan())return;   // difesa automatica: niente da guidare
  if(inDefense()&&!G.auto){   // difesa manuale: il dito guida il difensore cerchiato (trascina = corri in quella direzione, tocco su un altro difensore = prendi lui)
    if(!ddrag)ddrag={ox:e.clientX,oy:e.clientY,fx:e.clientX,fy:e.clientY,pid:e.pointerId,t0:G.tick,mv:false};return;
  }
  if(sprintNow)return;
  const h=G.holder;
  if(h&&h.t===0&&!G.flight&&!drag){
    aimPid=e.pointerId;
    const tb=cssToBuf(e.clientX,e.clientY);
    drag={btn:throwStyle?'hammer':'throw',sl:true,ox:e.clientX,oy:e.clientY,fx:e.clientX,fy:e.clientY,s:G.tick,D:0,dirOk:false,ang:0,x:sxw(h.x),y:syw(h.y),tw:toWorld(tb[0],tb[1])};
    G.high=throwStyle;
  }
});
cv.addEventListener('pointermove',e=>{
  if(ddrag&&e.pointerId===ddrag.pid){
    ddrag.fx=e.clientX;ddrag.fy=e.clientY;const vx=e.clientX-ddrag.ox,vy=e.clientY-ddrag.oy,len=hyp(vx,vy);
    if(len>12){if(!ddrag.mv)shownCtrl++;ddrag.mv=true;G.cdir={x:vx/len,y:vy/len};}else if(ddrag.mv)G.cdir=null;
    return;
  }
  if(e.pointerId!==aimPid)return;
  if(drag&&drag.sl)slMove(e);
});
cv.addEventListener('pointercancel',e=>{
  tap=null;ddrag=null;G.cdir=null;G.hold=false;
  if(e.pointerId===aimPid&&drag&&drag.sl){drag=null;aimPid=null;G.high=false;}
});
cv.addEventListener('pointerup',e=>{
  G.hold=false;tap=null;
  if(ddrag&&e.pointerId===ddrag.pid){
    if(!ddrag.mv&&G.tick-ddrag.t0<0.35&&inDefense()){const b=cssToBuf(e.clientX,e.clientY),q=nearMate(toWorld(b[0],b[1]),0,3.4);if(q){G.ctrl=q;G.ctrlBy=true;HOOKS.sfx('ui');HOOKS.vibe(8);}}
    ddrag=null;G.cdir=null;return;
  }
  if(e.pointerId===aimPid&&drag&&drag.sl)aimUp(e);
});
// da pixel CSS dello schermo a pixel del buffer di gioco (per disegnare l'elastico sotto il dito)
function cssToBuf(cx,cy){const r=cv.getBoundingClientRect();return [(cx-r.left)*DPR/PXS,(cy-r.top)*DPR/PXS];}
function drawSling(x0,y0,x1,y1,cancel){
  const a=cssToBuf(x0,y0),b=cssToBuf(x1,y1);
  pline(a[0],a[1],b[0],b[1],PAL.out,3,3);pline(a[0],a[1],b[0],b[1],cancel?PAL.red:'#ffffff',1,3);
  pring(a[0],a[1],4,4,PAL.out,3);pring(a[0],a[1],4,4,'#ffffff',1);
  px(b[0]-3,b[1]-3,6,6,PAL.out);px(b[0]-2,b[1]-2,4,4,cancel?PAL.red:PAL.gold);
  if(cancel)ptext('ANNULLA',a[0],a[1]-16,{f:'t',c:PAL.red});
}
/* ---- lancio con i pulsanti: «Lancio» (normale) e «Hammer» (alto). Versione a carica: si tiene premuto e si trascina un poco il dito SUL PULSANTE per dare
   la direzione; la DISTANZA cresce con il tempo di pressione (anello che si riempie da bianco a verde). Al rilascio parte il lancio. Per annullare si
   riporta il dito dove si era premuto. Il dito non copre mai il campo ---- */
const CH_D1=20,CH_MAX=55,CH_DEAD=12;   // fino a 20 m la carica va alla velocita' iniziale; poi rallenta (v lineare con la distanza) fino a 55 m; zona morta della direzione in px
// IMPOSTAZIONI del giocatore (schermata principale): due regolazioni a 4 livelli [molto lento, lento, veloce, molto veloce]
const CH_SPEEDS=[14,18,23,28];                          // velocita' iniziale (m/s) fino a 20 m
const CH_SLOWS=[[1,0.93],[0.92,0.72],[0.64,0.1],[0.52,0.07]];   // rallentamento oltre i 20 m: [velocita' a 20 m, velocita' a 55 m] come frazione di quella iniziale. ritoccati il 9/11 con un rallentamento un po' minore; «molto veloce» rallenta di piu'
const LVL=['Molto lento','Lento','Veloce','Molto veloce'];
const SET_KEY='ultimate-settings';
let SETT={ci:2,cs:1,bs:2,ds:2,pos:null};   // pos: centro di ogni pulsante come frazione dello schermo (null = posizione predefinita)   // predefinito: velocita' iniziale veloce (23 m/s), rallentamento lento (30 m a 1,4 s, 40 m a 2,0 s, 55 m a 3,0 s)
try{const o=JSON.parse(localStorage.getItem(SET_KEY)||'null');if(o&&o.ci>=0&&o.ci<4&&o.cs>=0&&o.cs<4)SETT={ci:o.ci|0,cs:o.cs|0,bs:(o.bs>=0&&o.bs<5)?o.bs|0:2,ds:(o.ds>=0&&o.ds<4)?o.ds|0:2,pos:validPos(o.pos)};}catch(e){}
// dimensione dei pulsanti di gioco: 5 livelli con piccole differenze (circa 7%); «medi» = 50 px come prima
function validPos(p){
  if(!p||typeof p!=='object')return null;
  const out={};let any=false;
  for(const k of ['throw','hammer','sprint']){const v=p[k];if(Array.isArray(v)&&v.length===2&&v[0]>=0&&v[0]<=1&&v[1]>=0&&v[1]<=1){out[k]=[+v[0],+v[1]];any=true;}else out[k]=null;}
  return any?out:null;
}
const BSCALE=[0.86,0.93,1,1.07,1.14],BLBL=['Molto piccoli','Piccoli','Medi','Grandi','Molto grandi'];
const applyBtnSize=()=>{document.documentElement.style.setProperty('--bsc',BSCALE[SETT.bs]);layoutButtons();};
applyBtnSize();
// ---- posizione dei pulsanti di gioco: predefinita (angolo in basso a destra, SCATTO nell'angolo e Lancio, Hammer a sinistra) oppure scelta dal giocatore ----
const tbPx=()=>Math.min(54,Math.max(46,0.155*CH))*BSCALE[SETT.bs];   // stessa formula del CSS: clamp(46px,15.5vh,54px) * --bsc
function defCenter(name){
  const tb=tbPx(),sai=$('sai').getBoundingClientRect(),rr=Math.max(24,sai.width),bb=Math.max(12,sai.height);
  const y=CH-bb-tb/2,xs=CW-rr-tb/2;
  return name==='sprint'?[xs,y]:(name==='throw'?[xs-tb-12,y]:[xs-2*tb-22,y]);
}
function btnCenter(name){const q=SETT.pos&&SETT.pos[name];return q?[q[0]*CW,q[1]*CH]:defCenter(name);}
function placeBtn(el,name){const tb=tbPx(),c=btnCenter(name);el.style.left=Math.round(clamp(c[0]-tb/2,2,CW-tb-2))+'px';el.style.top=Math.round(clamp(c[1]-tb/2,2,CH-tb-2))+'px';}
function layoutButtons(){
  if(!uiReady)return;
  placeBtn(bThrow,'throw');placeBtn(bHammer,'hammer');placeBtn(bSprint,'sprint');
  placeBtn($('pdThrow'),'throw');placeBtn($('pdHammer'),'hammer');placeBtn($('pdSprint'),'sprint');
}
function saveSett(){try{localStorage.setItem(SET_KEY,JSON.stringify(SETT));}catch(e){}}
function chargeDist(t,st){
  st=st||SETT;const V1=CH_SPEEDS[st.ci],f=CH_SLOWS[st.cs],V2=V1*f[0],V3=V1*f[1],t1=CH_D1/V1;
  if(t<=t1)return V1*Math.max(0,t);
  const k=(V2-V3)/(CH_MAX-CH_D1);
  if(k<1e-6)return Math.min(CH_MAX,CH_D1+V2*(t-t1));
  return Math.min(CH_MAX,CH_D1+(V2/k)*(1-Math.exp(-k*(t-t1))));   // v(d)=V2-k*(d-D1)
}
let aimPid=null;
function syncAimPoint(){
  const h=G.holder;if(!drag||!h||drag.s===undefined)return;
  const D=drag.sl?drag.D:chargeDist(G.tick-drag.s);drag.D=D;
  if(drag.sl){if(D<CH_D1-1.5)drag.p20=0;if(D<SPARO_D-1.5)drag.p30=0;}   // trascinando si puo' anche tornare indietro: il tick risuona se si ripassa la soglia
  if(D>=SPARO_D&&!drag.p30){drag.p30=drag.p20=1;HOOKS.vibe(14);HOOKS.sfx('tick',2);}   // da qui e' uno sparo
  else if(D>=CH_D1&&!drag.p20){drag.p20=1;HOOKS.vibe(7);HOOKS.sfx('tick',1);}            // da qui la carica rallenta
  if(drag.dirOk){const wx=clamp(h.x+Math.cos(drag.ang)*D,0.5,FIELD_L-0.5),wy=clamp(h.y+Math.sin(drag.ang)*D,0.5,FIELD_W-0.5);drag.x=sxw(wx);drag.y=syw(wy);}
  else{drag.x=sxw(h.x);drag.y=syw(h.y);}
}
// anello attorno al pulsante: si riempie con la distanza, da bianco a verde; i trattini segnano 20 m (da li' cresce piu' piano) e 30 m (da li' e' uno sparo)
const RING_C=2*Math.PI*44,ringEls=[[bThrow,'throw'],[bHammer,'hammer']].map(([b,k])=>({b,k,f:b.querySelector('.rf')}));
function addRingTicks(sv){
  for(const m of [CH_D1,SPARO_D]){const an=m/CH_MAX*2*Math.PI,l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('class','tk');
    l.setAttribute('x1',(50+37*Math.cos(an)).toFixed(1));l.setAttribute('y1',(50+37*Math.sin(an)).toFixed(1));l.setAttribute('x2',(50+51*Math.cos(an)).toFixed(1));l.setAttribute('y2',(50+51*Math.sin(an)).toFixed(1));sv.appendChild(l);}
}
function setRing(f,p){f.style.strokeDashoffset=(RING_C*(1-p)).toFixed(1);f.style.stroke='rgb('+Math.round(255-192*p)+','+Math.round(255-46*p)+','+Math.round(255-124*p)+')';}
for(const r of ringEls)addRingTicks(r.b.querySelector('.ring'));
function updRings(){
  for(const r of ringEls){
    const on=!!(drag&&drag.btn===r.k);r.b.classList.toggle('chg',on);
    if(on){const p=clamp(drag.D/CH_MAX,0,1);r.f.style.strokeDashoffset=(RING_C*(1-p)).toFixed(1);r.f.style.stroke='rgb('+Math.round(255-192*p)+','+Math.round(255-46*p)+','+Math.round(255-124*p)+')';}
  }
}
// ---- schermata Impostazioni (menu principale): velocita' iniziale e rallentamento della carica del lancio, con prova ----
function timeTo(d){for(let t=0;t<9;t+=0.01)if(chargeDist(t)>=d-0.01)return t;return null;}
let sView='menu';
function setSView(v){
  sView=v;$('sMenu').classList.toggle('hidden',v!=='menu');$('sBtns').classList.toggle('hidden',v!=='btns');$('sCharge').classList.toggle('hidden',v!=='charge');$('sSize').classList.toggle('hidden',v!=='size');$('sDiag').classList.toggle('hidden',v!=='diag');
  $('sTitle').textContent=v==='diag'?'Diagnostica':v==='charge'?'Lancio':(v==='btns'?'Pulsanti':(v==='size'?'Dimensione pulsanti':'Impostazioni'));renderSettings();
}
function renderSettings(){
  for(const [id,key,names] of [['sDs','ds',DSL],['sSpd','ci',LVL],['sSlow','cs',LVL],['sBsz','bs',BLBL]])$(id).innerHTML=names.map((n,i)=>`<button type="button" class="sg${SETT[key]===i?' on':''}" data-k="${key}" data-i="${i}">${n}</button>`).join('');
  const f=d=>{const t=timeTo(d);return t===null?'oltre 9 s':t.toFixed(1).replace('.',',')+' s';};
  $('sPrev').textContent=`20 m in ${f(20)} · 30 m in ${f(30)} · 40 m in ${f(40)} · 55 m in ${f(55)}`;
  $('sSumC').textContent=`Trascinamento: sensibilità ${DSL[SETT.ds].toLowerCase()}`;
  $('sSumS').textContent=BLBL[SETT.bs];
  $('sSumP').textContent=SETT.pos?'Personalizzata':'Predefinita';
  $('sSumB').textContent=`Dimensione: ${BLBL[SETT.bs].toLowerCase()} · posizione: ${SETT.pos?'personalizzata':'predefinita'}`;
}
$('settings').addEventListener('click',e=>{const b=e.target.closest('.sg');if(!b)return;SETT[b.dataset.k]=+b.dataset.i;saveSett();if(b.dataset.k==='bs')applyBtnSize();renderSettings();});
$('sGoCharge').addEventListener('click',()=>setSView('charge'));
$('sGoBtns').addEventListener('click',()=>setSView('btns'));
$('sGoDiag').addEventListener('click',()=>setSView('diag'));
