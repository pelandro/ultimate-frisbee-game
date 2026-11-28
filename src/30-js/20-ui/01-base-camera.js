/* ===================== INTERFACCIA ===================== */
const $=id=>document.getElementById(id);
const cv=$('c'),octx=cv.getContext('2d');
// il gioco si disegna in un buffer a bassa risoluzione (pcv) e poi si ingrandisce a pixel netti sul canvas vero (cv).
// VW e VH sono le dimensioni del buffer in pixel di gioco; CW e CH quelle dello schermo in pixel CSS (servono per i pulsanti); PXS = pixel fisici per pixel di gioco
const pcv=document.createElement('canvas');let ctx=pcv.getContext('2d');   // let: gli stacchi (03-stacchi.js) disegnano per un attimo le figure in un buffer a parte e poi lo rimettono
let VW=400,VH=224,CW=800,CH=400,PXS=2,BAR=12,DPR=1,S=9,OY=0,baseS=9,CX=0,OYi=0,UIZ=1,BZ=1,UZS=1;   // UIZ: ingrandimento di menu e pannelli (--ui nel CSS); BZ: ingrandimento dei pulsanti di gioco (--bz); UZS: scelta del giocatore (0 piu' piccola, 1 automatica, 2 piu' grande, 3 molto piu' grande)
const UZ_STEP=[-1,0,1,2];   // passi di un quarto aggiunti all'ingrandimento automatico
let uiReady=false;   // i pulsanti di gioco si posizionano solo dopo che l'interfaccia e' pronta
const cam={x:0,y:FIELD_W/2,z:1,zF:1,zTo:1,zP:1,dz:0,snap:true};
const ZOOM_T=1.6;   // secondi per passare da uno zoom all'altro
const ATT_FRAC=0.16;   // posizione del portatore sullo schermo in attacco (0 = bordo posteriore): piu' e' basso, piu' campo si vede davanti
const DEF_ZOOM=1.5,ATT_ZOOM=1.5;   // prova: in attacco lo stesso zoom della difesa (rimettere 1 per tornare al campo intero)
//   // in difesa il campo e' molto piu' ingrandito e la camera resta sul disco
const FONT='"Barlow Condensed","Arial Narrow","Roboto Condensed",system-ui,sans-serif';
const COL=['#2f7bff','#ff4b4b'];
// divise: maglia e pantaloncini di colori diversi (blu con calzoncini bianchi, rossa con calzoncini blu notte)
const UNI=[{shirt:'#2f7bff',shorts:'#f2f5fa',socks:'#2f7bff',shoe:'#18202e'},{shirt:'#ff4b4b',shorts:'#1f2740',socks:'#ff4b4b',shoe:'#18202e'}];
const DEF_LOOK={hair:'#3a2616',skin:'#f0c9a4',style:0,hs:1,bw:1,hd:1};
const LBL={lan:'Lancio',buc:'Buco',spa:'Sparo',pre:'Presa',dif:'Difesa',sal:'Salto',sca:'Scatto',agi:'Agilità',tuf:'Tuffo',vel:'Velocità',res:'Resistenza',vis:'Visione'};
// la camera e' agganciata alla griglia dei pixel (CX, OYi): linee e giocatori fermi non tremano mentre la camera scorre
const sxw=x=>Math.round(x*S)-CX,syw=y=>OYi+Math.round(y*S);
const toWorld=(px,py)=>({x:(px+CX)/S,y:(py-OYi)/S});
const portrait=()=>typeof matchMedia==='function'&&matchMedia('(orientation: portrait)').matches;

/* ---- TESTO CHE SEGUE LO ZOOM ----
   Menu e pannelli si ingrandiscono con «zoom: var(--ui)». Su iPad e iPhone (WebKit), con text-size-adjust in percentuale, il carattere si calcola dalla misura
   scritta nel CSS e perde lo zoom: le caselle crescevano e il testo restava piccolo. Qui lo si misura: dentro un riquadro zoomato si confronta la larghezza di un testo
   con quella di una barra di 400 px (se il testo segue lo zoom il rapporto e' lo stesso di fuori). Se il testo e' indietro, --tsa (letta da .screen, .overlay e #cshell
   in 12-leggibilita.css) porta la percentuale che lo compensa; si verifica una seconda volta e, se non serve a niente, si toglie. Dove lo zoom e' regolare non cambia nulla. */
function tszRatio(zoomed){
  const d=document.createElement('div');d.className=zoomed?'tszprobe':'';
  d.style.cssText='position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none;white-space:nowrap;font:100px sans-serif;'+(zoomed?'zoom:var(--ui);':'');
  d.innerHTML='<span>MMMMMMMM</span><i style="display:block;width:400px;height:1px"></i>';document.body.appendChild(d);
  const r=d.firstChild.getBoundingClientRect().width/Math.max(1,d.lastChild.getBoundingClientRect().width);d.remove();return r;
}
function tszFix(){
  const root=document.documentElement;root.style.removeProperty('--tsa');
  if(UIZ<=1.01||!document.body)return;
  try{
    const r0=tszRatio(false),q1=tszRatio(true)/r0;   // 1 = il testo cresce come le caselle; meno di 1 = resta indietro
    if(!(q1<0.93))return;
    let pct=Math.min(400,Math.max(100,Math.round(100/q1)));root.style.setProperty('--tsa',pct+'%');
    const q2=tszRatio(true)/r0;
    if(q2<q1*1.05){root.style.removeProperty('--tsa');return;}   // la percentuale non fa effetto su questo browser: meglio non toccare niente
    if(Math.abs(q2-1)>0.05){pct=Math.min(400,Math.max(100,Math.round(pct/q2)));root.style.setProperty('--tsa',pct+'%');}   // un secondo ritocco
    window.__tsa=[q1,q2,pct];
  }catch(e){root.style.removeProperty('--tsa');}
}
function resize(){
  const r={width:cv.clientWidth,height:cv.clientHeight};DPR=Math.min(window.devicePixelRatio||1,3);
  CW=Math.max(1,r.width);CH=Math.max(1,r.height);
  // ADATTAMENTO ALLO SCHERMO: il gioco e' pensato per un riquadro di circa 800x450 (telefono in orizzontale: ingrandimento 1). Su iPad e computer il riquadro
  // e' molto piu' grande e menu, pannelli e pulsanti crescono in proporzione (fino a 2,5), a passi di un quarto per tenere nitidi i caratteri a pixel.
  // Il giocatore puo' rimpicciolire o ingrandire ancora (Impostazioni > Dimensioni). Con 1 il telefono resta com'era.
  const uq=Math.min(10,Math.max(4,Math.round(Math.min(CW/800,document.body.clientHeight/450)*4)));
  UIZ=clamp((uq+UZ_STEP[UZS|0])/4,0.75,3);BZ=clamp(UIZ,1,1.75);   // i pulsanti di gioco crescono un po' meno del resto: sotto il dito bastano 90 px
  document.documentElement.style.setProperty('--ui',UIZ);document.documentElement.style.setProperty('--bz',BZ);
  tszFix();
  // larghezza utile in px CSS dopo l'ingrandimento: con «piu' grande» il telefono ha meno spazio e le schermate passano a disposizioni piu' compatte (12-leggibilita.css)
  const ew=CW/UIZ;document.documentElement.dataset.ew=ew<640?'xs':(ew<800?'s':'');
  document.documentElement.dataset.eh=document.body.clientHeight/UIZ<300?'s':'';   // altezza utile bassa: la colonna della carriera si stringe (12-leggibilita.css)
  document.documentElement.dataset.big=UIZ>=1.5?'1':'';   // iPad e computer: il cruscotto riempie meglio l'altezza (05-schermi-grandi-e-tocco.css)
  cv.width=Math.round(CW*DPR);cv.height=Math.round(CH*DPR);
  PXS=Math.max(1,Math.round(cv.height/224));   // circa 224 pixel di gioco in altezza, ingrandimento sempre intero
  VW=Math.ceil(cv.width/PXS);VH=Math.ceil(cv.height/PXS);pcv.width=VW;pcv.height=VH;
  BAR=Math.ceil(28*UIZ*DPR/PXS);   // altezza della barra nera in alto (28 px CSS, ingrandita sugli schermi grandi) in pixel di gioco
  // un pixel di gioco in px CSS (--gp) e dentro i riquadri ingranditi con zoom:var(--ui) (--gpz): le scritte dell'HUD lo usano per stare sulla stessa griglia del campo (27-hud-pixel.css)
  document.documentElement.style.setProperty('--gp',(PXS/DPR)+'px');document.documentElement.style.setProperty('--gpz',(PXS/DPR/UIZ)+'px');
  baseS=(VH-BAR)/(FIELD_W+8);S=baseS*cam.z;OY=(VH+BAR)/2-cam.y*S;CX=Math.round(cam.x*S);OYi=Math.round(OY);
  layoutButtons();
}

/* ---- messaggi sul campo ---- */
const toasts=[];
// messaggi del gioco: le prese diventano un testo che sale dal ricevitore (con i metri guadagnati), i cambi di possesso una fascia nera
// a tutto schermo come in Retro Bowl, il resto un riquadro nero sotto la barra
HOOKS.toast=(txt,benefit,ex)=>{
  const d=G.disc,x=G.holder?G.holder.x:d.x,y=G.holder?G.holder.y:d.y;
  if(txt==='Presa mancata'){burst(d.x,d.y,'turf');band={txt:'PRESA MANCATA',t:1.25,max:1.25,c:benefit===0?PAL.green:PAL.red};return;}
  if(/^Presa/.test(txt)){
    burst(x,y,'dust');
    if(ex&&ex.p){   // animazione della presa: salto, una mano, tuffo
      if(ex.ck==='tuffo'){if(!ex.p.dv)ex.p.dv={t0:G.tick-0.3,dir:ex.p.fc||1,end:G.tick,landedFx:true};}
      else ex.p.cfx={k:ex.ck||'',until:G.tick+0.42};
    }
    const plain=txt==='Presa!'||txt==='Presa in corsa!',gain=ex&&ex.gain?Math.round(ex.gain):0;
    catchPop(x,y,gain>=15||!plain?PAL.gold:'#ffffff');
    if(!plain)addFloater(txt.toUpperCase(),x,y,benefit===0?'#ffffff':'#ffd9d9');
    else if(benefit===0)addFloater(gain>=4?'+'+gain+' m':'Presa!',x,y,gain>=15?PAL.gold:'#ffffff');
    return;
  }
  if(/^Tuff[oi] mancat/.test(txt)){addFloater(txt,d.x,d.y,'#ffffff','t');return;}
  if(/Intercetto|Handblock|Bloccat|Blocco|terra|Fuori!|Stall/.test(txt)){
    burst(/terra|Fuori/.test(txt)?d.x:x,/terra|Fuori/.test(txt)?d.y:y,/terra/.test(txt)?'turf':(/Fuori/.test(txt)?'dust':'spark'));
    if(/tuffo/i.test(txt)&&G.holder&&!G.holder.dv)G.holder.dv={t0:G.tick-0.3,dir:G.holder.fc||1,end:G.tick,landedFx:true};   // il difensore che ha preso il disco in tuffo e' a terra
    band={txt:txt.replace(/!? Disco perso/,'!').toUpperCase(),t:1.25,max:1.25,c:benefit===0?PAL.green:(benefit===1?PAL.red:'#ffffff')};
    return;
  }
  if(/brick/.test(txt))burst(d.x,d.y,'dust');
  toasts.push({txt,t:1.8,max:1.8,benefit});if(toasts.length>3)toasts.shift();
};
HOOKS.vibe=ms=>{try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}};
HOOKS.cine=startCine;
HOOKS.menu=()=>{cam.snap=true;};
HOOKS.half=()=>{$('hScore').textContent=`${G.myName||'Blu'} ${G.score[0]} – ${G.score[1]} ${G.oppName||'Rossi'}`;$('half').classList.remove('hidden');};
$('hSch').addEventListener('click',()=>openSchemes(false));
$('hSub').addEventListener('click',()=>{if(G.mode!=='half')return;forcedSubs=false;$('subTitle').textContent='Cambi';$('subSub').textContent='';swapSel=null;G.schemeOpen=true;renderLineupBox();$('subs').classList.remove('hidden');});
$('hCont').addEventListener('click',()=>{if(G.mode!=='half'||forcedSubs)return;$('half').classList.add('hidden');startSecondHalf();});
HOOKS.over=showOver;

/* ---- camera ---- */
const CAM_MT=3,CAM_MB=3;   // metri visibili oltre le linee laterali quando la camera segue il gioco in verticale: in alto la tribuna, in basso il bordocampo
const AIM_EDGE=8;   // metri: quanto campo resta sempre visibile oltre il punto mirato (con 5 il punto finiva quasi sul bordo e non si vedeva chi corre li')
// zoom: pull = tutto il campo, difesa = zoom forte, attacco = normale
const zoomTarget=()=>G.mode==='ready'?Math.min(1,VW/(FIELD_L+6)/baseS):((G.mode==='play'||G.mode==='cine')?(G.poss===1?DEF_ZOOM:ATT_ZOOM):1);
function updateCamera(dt,replayDisc){
  const defend=G.mode==='play'&&G.poss===1&&!G.pull;
  const zt=zoomTarget();
  if(cam.snap){cam.z=cam.zF=cam.zTo=zt;cam.zP=1;}
  else{
    if(Math.abs(zt-cam.zTo)>0.001){cam.zF=cam.z;cam.zTo=zt;cam.zP=0;}   // nuovo zoom: parte una transizione lenta
    if(cam.zP<1){cam.zP=Math.min(1,cam.zP+dt/ZOOM_T);cam.z=lerp(cam.zF,cam.zTo,easeIO(cam.zP));}
  }
  const zooming=cam.zP<1;
  // scena del tuffo difensivo: zoom lento (1,5 -> 1,8) centrato sul giocatore che si tuffa; poi torna piano a 1,5
  const dzT=G.diveScene&&G.diveFocus?0.2:0;cam.dz+=(dzT-cam.dz)*(1-Math.exp(-dt*(dzT>cam.dz?1.6:2.4)));
  if(Math.abs(cam.dz)<0.0005&&dzT===0)cam.dz=0;
  S=baseS*cam.z*(1+cam.dz);
  const vw=VW/S,vh=(VH-BAR)/S;   // l'altezza utile e' quella sotto la barra nera
  const pt=1-G.poss,pu=G.pull;
  let dc,fx,fy;
  if(G.mode==='ready'){dc=dirOf(pt);fx=(pt===0&&G.puller)?G.puller.x:G.ref.x;fy=MID;}
  else if(pu){dc=dirOf(pt);fx=pu.landed?G.ref.x:lerp(G.disc.x,pu.tx,0.5);fy=pu.landed?G.ref.y:lerp(G.disc.y,pu.ty,0.5);}
  else{const f=G.flight;dc=dirOf(G.poss);fx=f?lerp(G.disc.x,f.tx,0.5):(G.holder?G.holder.x:G.ref.x);fy=f?lerp(G.disc.y,f.ty,0.5):(G.holder?G.holder.y:G.ref.y);}
  if(replayDisc)[fx,fy]=replayDisc;
  const bl=clamp(cam.dz/0.2,0,1);if(bl>0.001&&G.diveFocus){fx=lerp(fx,G.diveFocus.x,bl);fy=lerp(fy,G.diveFocus.y,bl);}
  // in attacco il portatore sta vicino al bordo posteriore dello schermo: si vede il piu' possibile del campo davanti, per mirare i lanci lunghi.
  // in difesa il disco e' al centro. Il passaggio tra le due inquadrature e' lento.
  const fracT=defend||bl>0.001?0.5:(dc>0?ATT_FRAC:1-ATT_FRAC);
  if(cam.snap||cam.fr===undefined)cam.fr=fracT;else cam.fr+=(fracT-cam.fr)*(1-Math.exp(-dt*2.2));
  const frac=cam.fr;
  let tg=fx-frac*vw;const lo=-5,hi=FIELD_L+5-vw;
  // MIRA LUNGA: mentre miri, se il punto mirato arriva a AIM_EDGE metri dal bordo dello schermo la visuale lo segue (sempre AIM_EDGE metri oltre)
  const am=drag&&drag.dirOk&&drag.wx!==undefined&&G.mode==='play'&&!G.flight&&!G.pull&&G.holder&&G.holder.t===0?drag:null;
  if(am){const e=Math.min(AIM_EDGE,vw/3);if(am.wx>tg+vw-e)tg=am.wx-vw+e;else if(am.wx<tg+e)tg=am.wx-e;}
  tg=(hi<lo||vw>=FIELD_L+2)?(FIELD_L-vw)/2:clamp(tg,lo,hi);
  // se lo zoom non lascia vedere tutta l'altezza del campo la camera segue il disco anche in verticale, fino a CAM_MT metri oltre la linea laterale in alto
  // (la tribuna) e CAM_MB in basso (panchine e cartelloni)
  const MT=CAM_MT,MB=CAM_MB;let cy=vh>=FIELD_W+MT+MB?FIELD_W/2+(MB-MT)/2:clamp(fy,vh/2-MT,FIELD_W-vh/2+MB);
  if(am&&vh<FIELD_W+MT+MB){const e=Math.min(AIM_EDGE/2,vh/3);cy=clamp(clamp(cy,am.wy-vh/2+e,am.wy+vh/2-e),vh/2-MT,FIELD_W-vh/2+MB);}   // e in verticale, se lo zoom non mostra tutta la larghezza del campo
  if(cam.snap){cam.x=tg;cam.y=cy;cam.snap=false;}else{cam.x+=(tg-cam.x)*(1-Math.exp(-dt*(zooming?2.2:5)));cam.y+=(cy-cam.y)*(1-Math.exp(-dt*(zooming?2.2:4)));}
  OY=(VH+BAR)/2-cam.y*S;CX=Math.round(cam.x*S);OYi=Math.round(OY);
}

/* ---- disegno del campo ---- */
/* ---- utilità grafiche ---- */
function shade(hex,k){
  const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;
  if(k<0){r*=1+k;g*=1+k;b*=1+k;}else{r+=(255-r)*k;g+=(255-g)*k;b+=(255-b)*k;}
  return 'rgb('+(r|0)+','+(g|0)+','+(b|0)+')';
}
function rr(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
const easeOut=t=>1-Math.pow(1-t,3);
const SKIN='#f0c9a4';
const parts=[],conf=[],trail=[];
let grassPat=null,lastFl=null,lastPull=null;
function addFx(o){if(parts.length<240)parts.push(o);}
function burst(x,y,kind){
  if(kind==='dust'||kind==='turf'){
    for(let i=0;i<9;i++){const a=Math.random()*6.283,sp=rnd(0.5,2.2);addFx({t:'dust',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*0.6,z:0.3,vz:rnd(0.4,1.4),life:0.7,max:0.7,r:rnd(0.25,0.5)});}
  }else{
    for(let i=0;i<14;i++){const a=Math.random()*6.283,sp=rnd(3,9);addFx({t:'spark',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*0.7,z:1,vz:rnd(1,4),life:0.45,max:0.45});}
  }
  if(kind==='turf')for(let i=0;i<6;i++){const a=Math.random()*6.283,sp=rnd(0.8,2.4);addFx({t:'blade',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*0.5,z:0.1,vz:rnd(2.5,4.5),life:0.6,max:0.6});}   // il disco a terra alza qualche filo d'erba
  addFx({t:'ring',x,y,life:0.5,max:0.5});
}
// presa: anello che scatta attorno alle mani (oro per le prese lunghe) e due scintille
function catchPop(x,y,c){addFx({t:'pop',x,y,z:3,c,life:0.3,max:0.3});for(let i=0;i<3;i++)addFx({t:'spark',x,y,vx:rnd(-3,3),vy:rnd(-1,1),z:3,vz:rnd(1,3),life:0.3,max:0.3});}
function updateFx(dt){
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];p.life-=dt;if(p.life<=0){parts.splice(i,1);continue;}
    if(p.t==='ring')continue;
    if(p.t==='smoke'){const k=Math.exp(-dt*3);p.vx*=k;p.vy*=k;p.vz*=k;}   // il fumo frena e resta a mezz'aria
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=(p.t==='spark'?10:-0.4)*dt;
    if(p.z<0){p.z=0;p.vz*=-0.3;}
  }
}
