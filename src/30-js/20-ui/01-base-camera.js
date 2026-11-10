/* ===================== INTERFACCIA ===================== */
const $=id=>document.getElementById(id);
const cv=$('c'),octx=cv.getContext('2d');
// il gioco si disegna in un buffer a bassa risoluzione (pcv) e poi si ingrandisce a pixel netti sul canvas vero (cv).
// VW e VH sono le dimensioni del buffer in pixel di gioco; CW e CH quelle dello schermo in pixel CSS (servono per i pulsanti); PXS = pixel fisici per pixel di gioco
const pcv=document.createElement('canvas'),ctx=pcv.getContext('2d');
let VW=400,VH=224,CW=800,CH=400,PXS=2,BAR=12,DPR=1,S=9,OY=0,baseS=9,CX=0,OYi=0,UIZ=1;   // UIZ: ingrandimento di menu e pannelli sugli schermi grandi (--ui nel CSS)
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

function resize(){
  const r=cv.getBoundingClientRect();DPR=Math.min(window.devicePixelRatio||1,3);
  CW=Math.max(1,r.width);CH=Math.max(1,r.height);
  UIZ=clamp(Math.floor(Math.min(CW/1000,CH/560)*4)/4,1,2.25);document.documentElement.style.setProperty('--ui',UIZ);
  cv.width=Math.round(CW*DPR);cv.height=Math.round(CH*DPR);
  PXS=Math.max(1,Math.round(cv.height/224));   // circa 224 pixel di gioco in altezza, ingrandimento sempre intero
  VW=Math.ceil(cv.width/PXS);VH=Math.ceil(cv.height/PXS);pcv.width=VW;pcv.height=VH;
  BAR=Math.ceil(28*UIZ*DPR/PXS);   // altezza della barra nera in alto (28 px CSS, ingrandita sugli schermi grandi) in pixel di gioco
  baseS=(VH-BAR)/(FIELD_W+8);S=baseS*cam.z;OY=(VH+BAR)/2-cam.y*S;CX=Math.round(cam.x*S);OYi=Math.round(OY);
  layoutButtons();
}

/* ---- messaggi sul campo ---- */
const toasts=[];
// messaggi del gioco: le prese diventano un testo che sale dal ricevitore (con i metri guadagnati), i cambi di possesso una fascia nera
// a tutto schermo come in Retro Bowl, il resto un riquadro nero sotto la barra
HOOKS.toast=(txt,benefit,ex)=>{
  const d=G.disc,x=G.holder?G.holder.x:d.x,y=G.holder?G.holder.y:d.y;
  if(txt==='Presa mancata'){burst(d.x,d.y,'dust');band={txt:'PRESA MANCATA',t:1.25,max:1.25,c:benefit===0?PAL.green:PAL.red};return;}
  if(/^Presa/.test(txt)){
    burst(x,y,'dust');
    if(ex&&ex.p){   // animazione della presa: salto, una mano, tuffo
      if(ex.ck==='tuffo'){if(!ex.p.dv)ex.p.dv={t0:G.tick-0.3,dir:ex.p.fc||1,end:G.tick,landedFx:true};}
      else ex.p.cfx={k:ex.ck||'',until:G.tick+0.42};
    }
    const plain=txt==='Presa!'||txt==='Presa in corsa!',gain=ex&&ex.gain?Math.round(ex.gain):0;
    if(!plain)addFloater(txt.toUpperCase(),x,y,benefit===0?'#ffffff':'#ffd9d9');
    else if(benefit===0)addFloater(gain>=4?'+'+gain+' m':'Presa!',x,y,gain>=15?PAL.gold:'#ffffff');
    return;
  }
  if(/^Tuff[oi] mancat/.test(txt)){addFloater(txt,d.x,d.y,'#ffffff','t');return;}
  if(/Intercetto|Handblock|Bloccat|Blocco|terra|Fuori!|Stall/.test(txt)){
    burst(/terra|Fuori/.test(txt)?d.x:x,/terra|Fuori/.test(txt)?d.y:y,/terra|Fuori/.test(txt)?'dust':'spark');
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
// zoom: pull = tutto il campo, difesa = zoom forte, attacco = normale
const zoomTarget=()=>G.mode==='ready'?Math.min(1,VW/(FIELD_L+6)/baseS):((G.mode==='play'||G.mode==='cine')?(G.poss===1?DEF_ZOOM:ATT_ZOOM):1);
function updateCamera(dt){
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
  const bl=clamp(cam.dz/0.2,0,1);if(bl>0.001&&G.diveFocus){fx=lerp(fx,G.diveFocus.x,bl);fy=lerp(fy,G.diveFocus.y,bl);}
  // in attacco il portatore sta vicino al bordo posteriore dello schermo: si vede il piu' possibile del campo davanti, per mirare i lanci lunghi.
  // in difesa il disco e' al centro. Il passaggio tra le due inquadrature e' lento.
  const fracT=defend||bl>0.001?0.5:(dc>0?ATT_FRAC:1-ATT_FRAC);
  if(cam.snap||cam.fr===undefined)cam.fr=fracT;else cam.fr+=(fracT-cam.fr)*(1-Math.exp(-dt*2.2));
  const frac=cam.fr;
  let tg=fx-frac*vw;const lo=-5,hi=FIELD_L+5-vw;
  tg=(hi<lo||vw>=FIELD_L+2)?(FIELD_L-vw)/2:clamp(tg,lo,hi);
  // se lo zoom non lascia vedere tutta l'altezza del campo la camera segue il disco anche in verticale (3 m di margine oltre la linea laterale)
  const M=3,cy=vh>=FIELD_W+2*M?FIELD_W/2:clamp(fy,vh/2-M,FIELD_W-vh/2+M);
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
  if(kind==='dust'){
    for(let i=0;i<9;i++){const a=Math.random()*6.283,sp=rnd(0.5,2.2);addFx({t:'dust',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*0.6,z:0.3,vz:rnd(0.4,1.4),life:0.7,max:0.7,r:rnd(0.25,0.5)});}
  }else{
    for(let i=0;i<14;i++){const a=Math.random()*6.283,sp=rnd(3,9);addFx({t:'spark',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*0.7,z:1,vz:rnd(1,4),life:0.45,max:0.45});}
  }
  addFx({t:'ring',x,y,life:0.5,max:0.5});
}
function updateFx(dt){
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];p.life-=dt;if(p.life<=0){parts.splice(i,1);continue;}
    if(p.t==='ring')continue;
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=(p.t==='spark'?10:-0.4)*dt;
    if(p.z<0){p.z=0;p.vz*=-0.3;}
  }
}
