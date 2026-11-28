/* Primi passi: si usano i comandi della partita, su una copia del punto iniziale.
   Al ritorno in partita contano solo le azioni giocate dopo le prove. */
const PP_KEY='ultimate-primi';
let PP={d:[],off:0};
try{const o=JSON.parse(localStorage.getItem(PP_KEY)||'null');if(o&&Array.isArray(o.d))PP={d:o.d.filter(x=>typeof x==='string'),off:o.off?1:0};}catch(e){}
const ppSave=()=>{try{localStorage.setItem(PP_KEY,JSON.stringify(PP));}catch(e){}};
function ppReset(){PP={d:[],off:0};ppSave();}
const ppEv={};
function tutEv(k){ppEv[k]=(ppEv[k]|0)+1;}
const PP_STEPS=[
  {id:'goal',t:'Come si gioca',x:'Segni quando un compagno prende il disco nella meta avversaria. Con il disco in mano non puoi correre. Fai una prova alla volta e riprova se sbagli.'},
  {id:'pull',t:'Pull',x:'Il pull apre ogni meta. Tocca per fermare la potenza nel verde, poi tocca di nuovo quando la direzione è al centro.',a:'Ferma la potenza, poi la direzione.',done:()=>!!G.pull||G.mode==='play'},
  {id:'throw',t:'Passaggio',x:'Trascina all’indietro come con una fionda e rilascia per lanciare. Il cerchio dell’indicatore mostra la zona in cui può cadere il disco.',a:'Completa un passaggio a un compagno.',done:()=>G.st.cmp[0]>0},
  {id:'calls',t:'Chiamare un taglio',x:'Tocca un compagno senza trascinare per dirgli di smarcarsi. Lancia verso il punto in cui sta correndo.',a:'Tocca un compagno.',done:()=>!!ppEv.call},
  {id:'iso',t:'Isolamento',x:'Tieni premuto su un compagno. Solo lui taglia, mentre gli altri gli fanno spazio.',a:'Tieni premuto su un compagno finché compare «ISO!».',done:()=>!!ppEv.iso},
  {id:'alto',t:'Lancio alto',x:'Tocca due volte il campo libero e tieni premuto il secondo tocco per mirare. Puoi anche trascinare con due dita, oppure iniziare a trascinare con un dito e poi toccare con un altro senza sollevare il primo.',a:'Lancia alto con uno dei tre gesti.',done:()=>!!(G.flight&&G.flight.team===0&&G.flight.high)},
  {id:'catchDive',t:'Presa in tuffo',x:'Tocca quando l’indicatore entra nel verde. Nel giallo puoi ancora prendere il disco. Nel nero lo perdi.',a:'Tocca nella zona verde.',done:()=>G.st.dive[0]>0},
  {id:'stall',t:'Stall',x:'Il marcatore vicino conta fino a 10. A 10 perdi il disco. Passa prima che finisca il conteggio.',a:'Completa un passaggio prima del 10.',done:()=>G.st.cmp[0]>0},
  {id:'def',t:'Difesa manuale',x:'Trascina per guidare il difensore con l’anello azzurro. Puoi toccare un altro difensore per passare a lui.',a:'Trascina per muovere il difensore.',done:()=>G.primiMoved>=0.3},
  {id:'handblock',t:'Handblock',x:'Il pulsante rosso con la mano si illumina in basso a destra. Premilo quando il cerchio che si stringe raggiunge l’anello interno.',a:'Premi la mano quando i due cerchi coincidono.',done:()=>G.st.hb[0]>0},
  {id:'defDive',t:'Tuffo difensivo',x:'Il pulsante rosso del tuffo si illumina in basso a destra. Premilo quando il cerchio che si stringe raggiunge l’anello interno.',a:'Premi il tuffo quando i due cerchi coincidono.',done:()=>G.st.dive[0]>0},
  {id:'score',t:'Segnare una meta',x:'Servi un compagno nella meta avversaria. Se prende il disco dentro il rettangolo di fondo, segni.',a:'Completa un passaggio dentro la meta.',done:()=>G.score[0]>0},
  {id:'next',t:'Timeout',x:'Quando hai il disco puoi chiamare un Timeout, una volta a partita. Azzera lo stall e fa recuperare energia.',a:'Premi «Timeout», poi «Riprendi».',done:()=>G.tmo[0]>0&&!G.schemeOpen},
  {id:'schemi',t:'Schemi',x:'Prima del pull apri «Schemi» per scegliere come attaccare e come difendere. Puoi leggere come risponde ogni schema a quelli avversari.',a:'Apri «Schemi», poi torna in campo.',done:()=>!!ppEv.schemi&&!G.schemeOpen},
  {id:'sim',t:'Cambi, Simula e Pausa',x:'Prima del pull, «Cambi» sceglie chi gioca e «Simula meta» fa giocare il computer. Il tasto II mette in pausa. In carriera puoi anche sospendere e riprendere più tardi.'}
];
const ppDefense=id=>['def','handblock','defDive'].includes(id);
let ppCur=null,ppPhase='',ppReal=null,ppT0=0,ppSuccess=0,ppRetry=false;
const ppPending=()=>!PP.off&&tipsOn()&&PP_STEPS.some(s=>!PP.d.includes(s.id));
function ppLayout(bar){
  const panel=$('pp');
  panel.classList.toggle('pp-bar',bar);
  document.body.classList.toggle('pp-live',bar);
  if(bar)ppMeasure();
  else document.body.style.removeProperty('--pp-space');
  resize();
}
function ppMeasure(){
  if(!document.body.classList.contains('pp-live'))return;
  document.body.style.setProperty('--pp-space',Math.ceil($('pp').offsetHeight*UIZ)+'px');
}
new ResizeObserver(()=>{if(document.body.classList.contains('pp-live')){ppMeasure();if(cv.clientHeight!==CH)resize();}}).observe($('pp'));
function ppPaint(note){
  const s=ppCur,bar=ppPhase==='play';
  $('ppN').textContent=`Primi passi · ${PP_STEPS.indexOf(s)+1} di ${PP_STEPS.length}`;
  $('ppT').textContent=s.t;$('ppX').textContent=bar?s.a:s.x;
  $('ppH').textContent=note||'';$('ppH').classList.toggle('hidden',!note);
  $('ppOk').textContent=bar?'Salta questo passo':(s.done?'Prova':'Capito');
  $('ppOk').className=bar?'sec':'go';
  $('pp').classList.remove('hidden');
  ppLayout(bar);
}
function ppStart(){
  const copy=structuredClone({game:G,teams:T});
  ppReal={game:{...G},teams:T.slice()};
  Object.assign(G,copy.game,{opt:G.opt,score:[0,0],tmo:[0,0],heroOn:false,hz:null,hk:null});
  [T[0],T[1]]=copy.teams;
  ppShow();
}
function ppStop(){
  if(!ppReal)return;
  const tick=G.tick,opt=G.opt;
  for(const id of ['menu','tout'])$(id).classList.add('hidden');
  clearMatchInput();
  for(const k of Object.keys(G))if(!(k in ppReal.game))delete G[k];
  Object.assign(G,ppReal.game,{tick,opt});
  [T[0],T[1]]=ppReal.teams;
  toasts.length=0;floaters.length=0;
  ppReal=null;ppCur=null;ppPhase='';cine=null;pm=null;cam.snap=true;band=null;
  $('pp').classList.add('hidden');ppLayout(false);
}
function ppScenario(){
  const id=ppCur.id,side=ppDefense(id)?1:0;
  clearMatchInput();resetStats();placeTeams(1);pm=null;band=null;
  setWind(0,0);setWx(0);
  Object.assign(G,{primi:id,primiManual:!!side,primiMiss:false,primiMoved:0,goalWait:null,diveCool:0,slowK:1,k:1,stallK:id==='stall'?1:0,score:[0,0],tmo:[0,0],paused:false});
  if(id!=='pull'&&id!=='schemi'){
    const d=dirOf(side),x=id==='score'?(d>0?FIELD_L-EZ-6:EZ+6):FIELD_L/2;
    const atk=T[side],def=T[1-side],h=atk[0];
    atk.forEach((p,i)=>{p.x=x+d*(i?(id==='score'?9:5)+i*2:0);p.y=i===1||!i?MID:clamp(MID+(i-4)*5,3,FIELD_W-3);p.cutT=4;});
    def.forEach((p,i)=>{p.x=x+d*(id==='defDive'?10+i:2+i*2);p.y=id==='score'?(i%2?5:FIELD_W-5):(i?clamp(MID+(i-4)*5+3,3,FIELD_W-3):MID+0.6);});
    Object.assign(G,{mode:'play',poss:side,puller:null,holder:h,holdT:0,hbAtt:null,hbOk:null,think:side?1.8:1,stallT:id==='stall'?4:0});
    Object.assign(G.disc,{x:h.x,y:h.y,z:1});
    assignMarks();
    if(id==='def'||id==='handblock'){G.ctrl=def[0];G.ctrlH=h;G.marker=def[0];}
    if(id==='catchDive')ppCatchDive(h,atk[1]);
  }
  cam.snap=true;ppT0=G.tick;ppSuccess=0;ppRetry=false;
}
function ppCatchDive(h,p){
  // Si prepara un disco oltre la portata, poi il motore apre la normale scena del tuffo.
  const x=p.x+dirOf(0)*3.3;G.noCine=false;
  const f={team:0,thrower:h,intended:p,tx:x,ty:p.y,sx:h.x,sy:h.y,cat:'lan',sp:{cd:0},stall:0};
  G.holder=null;G.marker=null;G.disc.x=x;G.disc.y=p.y;G.disc.z=0;
  for(const q of T[0].concat(T[1]))if(q!==p&&q!==h){q.y=q.slot%2?4:FIELD_W-4;}
  diveChain(f,{x,y:p.y},[p],[],q=>reachOf(f,q));
}
function ppDiveThrow(){
  const h=G.holder,p=T[0][0],d=dirOf(1),x=h.x+12*d,y=h.y;
  doThrow(h,x,y,null,0);
  if(!G.flight)return;
  Object.assign(G.flight,{tx:x,ty:y,cx:0,cy:0,T:1.1,H:1.4,high:false,intended:null});
  p.x=x-3*d;p.y=y+2;
  G.ctrl=p;
}
function ppShow(){
  ppCur=PP_STEPS.find(s=>!PP.d.includes(s.id));
  if(!ppCur){PP.off=1;ppSave();ppStop();return;}
  if(G.mode==='cine')G.mode='play';
  cine=null;
  ppPhase='info';G.primi=ppCur.id;G.primiManual=false;G.paused=true;pm=null;clearMatchInput();
  for(const k of Object.keys(ppEv))delete ppEv[k];
  ppPaint();$('ppOk').focus({preventScroll:true});
}
function ppClose(all){
  if(!ppCur)return;
  if(!PP.d.includes(ppCur.id))PP.d.push(ppCur.id);
  if(all)PP.off=1;
  ppSave();
  if(all)ppStop();else ppShow();
}
function ppAction(){
  if(!ppCur)return;
  if(ppPhase==='info'&&ppCur.done){ppPhase='play';ppPaint();ppScenario();cv.focus({preventScroll:true});}
  else ppClose(false);
}
function ppTick(){
  if(ppReal&&!G.inMatch){ppStop();G.inMatch=false;G.mode='home';return;}
  if(!ppCur){
    if(G.inMatch&&!G.auto&&!G.drill&&!DR.on&&!G.skip&&ppPending()&&G.mode==='ready'&&!G.paused&&!G.schemeOpen&&!overlayBusy())ppStart();
    return;
  }
  if(ppPhase!=='play')return;
  if(ppSuccess){if(G.tick>=ppSuccess)ppClose(false);return;}
  if(G.paused||G.schemeOpen)return;
  const id=ppCur.id;
  if(ppCur.done()){
    ppSuccess=G.tick+(id==='score'?1.4:0.85);
    G.paused=true;clearMatchInput();ppPaint('✓ '+lgC('Prova riuscita!'));HOOKS.sfx('ui');
    return;
  }
  if(id==='defDive'&&G.holder?.t===1&&G.tick-ppT0>1.2&&!ppRetry){ppDiveThrow();ppRetry=true;}
  const ended=G.mode==='play'&&!G.flight&&!G.pull&&(G.primiMiss||
    (ppDefense(id)?G.poss!==1||id==='defDive'&&ppRetry||id==='handblock'&&G.st.thr[1]>0:id==='catchDive'||G.poss!==0||id==='alto'&&G.st.thr[0]>0));
  if(ended&&id!=='pull'&&id!=='schemi'){
    ppScenario();ppPaint('Riprova.');
  }
}
$('ppOk').addEventListener('click',ppAction);
$('ppSkip').addEventListener('click',()=>ppClose(true));
window.addEventListener('keydown',e=>{
  if(!ppCur||ppPhase!=='info')return;
  e.stopImmediatePropagation();e.preventDefault();
  if(e.repeat)return;
  if(e.code==='Tab')($(document.activeElement.id==='ppOk'?'ppSkip':'ppOk')).focus();
  else if(['Enter','Space','NumpadEnter'].includes(e.code)){
    if(document.activeElement?.id==='ppSkip')ppClose(true);else ppAction();
  }
},true);
