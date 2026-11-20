/* ---- SCHERMATA INIZIALE: il giocatore che prende il disco dell'insegna ----
   Dietro il menu iniziale si vede lo stadio grande (venueNow fuori partita) senza le squadre in campo e senza i nomi nelle mete.
   Quando il gioco si apre un giocatore entra di corsa da sinistra, si tuffa in salita e prende al volo il disco sotto l'insegna (.ttlDisc),
   poi resta fermo in quella posa, come un manifesto. Il giocatore e' disegnato come nelle scene laterali (athlete, 03-stacchi.js);
   il disco resta l'elemento della pagina: qui lo si sposta (transform) fino alla mano. Le volte dopo la scena e' gia' ferma.
   Il giocatore sta su una tela sopra il velo del menu (tdOnTop); l'ombra e la luce restano nel campo, sotto il velo. */
const titleBg=()=>!G.inMatch&&!G.drill&&G.mode==='home'&&!$('title').classList.contains('hidden');
const TD_WHO={t:0,look:{hair:'#2b1b10',skin:'#d9a57c',style:1,hs:1,bw:1,hd:1}};
// spazio minimo tra insegna e pulsanti (pixel del gioco), inclinazione del tuffo (in salita verso il disco), durata del volo in secondi,
// inclinazione del disco (resta verso l'alto, come quando fluttua sotto l'insegna)
const TD_MINH=40,TD_ROT=1.0,TD_LEAP=0.62,TD_TILT=-6;
// tela sopra il velo del menu (sfumatura e righe di #title), sotto l'insegna, il disco e i pulsanti, alla stessa scala del campo:
// disegnato nel campo, sotto il velo, il giocatore sembrava piu' lontano del disco, che sta sopra
let tdCv=null;
function tdOnTop(fn){
  if(!tdCv){tdCv=document.createElement('canvas');tdCv.id='tdCv';tdCv.setAttribute('aria-hidden','true');$('title').prepend(tdCv);}
  const k=tdK()/tdZ();if(tdCv.width!==VW||tdCv.height!==VH){tdCv.width=VW;tdCv.height=VH;}
  tdCv.style.display='';tdCv.style.width=VW*k+'px';tdCv.style.height=VH*k+'px';
  const keep=ctx;ctx=tdCv.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,VW,VH);
  try{fn();}finally{ctx=keep;}
}
const TDS={t:-1,done:false,from:null,c0:null,key:''};
// athlete legge la divisa da cine.kits: qui ne serve una sola, la prima del campo
// stile del giocatore: pixel grossi (4 pixel del gioco l'uno, come il disco: tdDiscSize) e, a presa fatta, il bordo bianco da adesivo con l'ombra
const TD_STK=2,TD_Z=4,TD_HK=1,TD_DISC=10;   // TD_DISC: larghezza del disco in pixel grossi (la sua griglia in 02-menu-impostazioni.html)
let tdTmp=null;
function tdAthlete(x,gy,hip,pose,rot,tt,hu,stk){
  const keep=cine,o={...PX_OPT};cine={kits:UNI.map(k=>({...k}))};
  Object.assign(PX_OPT,{z:TD_Z,hk:TD_HK,flat:false,noSh:stk>0});
  const draw=()=>athlete(x,gy,hip,1,pose,rot,tt,hu,undefined,false,TD_WHO);
  try{
    if(!(stk>0))draw();
    else{   // adesivo: l'omino su una tela a parte, poi ricomposto con il bordo bianco (cresce in un attimo: stk 0-1) e l'ombra spostata
      if(!tdTmp)tdTmp=document.createElement('canvas');if(tdTmp.width!==VW||tdTmp.height!==VH){tdTmp.width=VW;tdTmp.height=VH;}
      const k0=ctx,tc=tdTmp.getContext('2d');tc.clearRect(0,0,VW,VH);ctx=tc;try{draw();}finally{ctx=k0;}
      const tint=c=>{const t=document.createElement('canvas');t.width=VW;t.height=VH;const g=t.getContext('2d');g.drawImage(tdTmp,0,0);g.globalCompositeOperation='source-in';g.fillStyle=c;g.fillRect(0,0,VW,VH);return t;};
      const r=Math.max(1,ri(TD_STK*stk)),wh=tint('#ffffff'),sd=tint('rgba(10,20,40,.45)');
      ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(sd,r+2,r+2);
      for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if((a||b)&&a*a+b*b<=r*r+1)ctx.drawImage(wh,a,b);
      ctx.drawImage(tdTmp,0,0);ctx.restore();
    }
  }finally{cine=keep;Object.assign(PX_OPT,o);}
}
// linee di velocita' dietro al giocatore
function tdLines(x,y,len,hu,al){
  ctx.save();ctx.globalAlpha=al;
  for(let i=0;i<5;i++){const yy=ri(y-hu*0.5+i*hu*0.22),l=ri(len*(0.5+((i*37)%10)/14));px(x-l,yy,l,1,'#ffffff');}
  ctx.restore();
}
const titleIntro=()=>TDS.t>=0&&!TDS.done&&titleBg();
const tdDisc=()=>$('title').querySelector('.ttlDisc');
const tdK=()=>PXS/DPR;   // da pixel del gioco a pixel della pagina
// ingrandimento dell'interfaccia (zoom:var(--ui) sulle schermate): dentro #title spostamenti e misure in CSS vengono moltiplicati per questo
const tdZ=()=>{const t=$('title'),w=t.clientWidth;return w?layRect(t).width/w:1;};
const tdCtr=el=>{const r=layRect(el);return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width};};
// centro del disco senza spostamenti, in pixel della pagina (l'animazione del CSS e' !important: anche questi lo sono)
function tdRest(el){
  el.style.setProperty('animation','none','important');el.style.setProperty('transform','none','important');
  return tdCtr(el);
}
// il disco ha i pixel grandi come quelli dell'omino (TD_Z pixel del gioco), su ogni schermo
function tdDiscSize(el){el.style.setProperty('width',(TD_DISC*TD_Z*tdK()/tdZ()).toFixed(2)+'px','important');}
function tdStk(el,k){   // bordo da adesivo anche sul disco, dello stesso spessore di quello dell'omino
  if(k<=0){el.classList.remove('tdStk');return;}
  el.classList.add('tdStk');el.style.setProperty('--tdo',(Math.max(1,ri(TD_STK*k))*tdK()/tdZ()).toFixed(2)+'px');el.style.setProperty('--tds',((Math.max(1,ri(TD_STK*k))+2)*tdK()/tdZ()).toFixed(2)+'px');
}
function tdPlace(el,x,y,deg){   // x, y: centro del disco in pixel del gioco
  const k=tdK(),z=tdZ(),s=`translate(${((x*k-TDS.c0.x)/z).toFixed(1)}px,${((y*k-TDS.c0.y)/z).toFixed(1)}px) rotate(${deg.toFixed(1)}deg)`;
  if(el.dataset.tdt!==s){el.dataset.tdt=s;el.style.setProperty('transform',s,'important');}
}
// lo spazio libero tra l'insegna e i pulsanti, in pixel del gioco
function titleBand(){
  const k=1/tdK(),a=$('title').querySelector('.hl'),b=$('title').querySelector('.hr');
  if(!a||!b)return null;
  const ra=layRect(a),rb=layRect(b),y0=ra.bottom*k,y1=rb.top*k;
  return y1-y0>=TD_MINH?{y0,y1,h:y1-y0}:null;   // con l'interfaccia molto grande i pulsanti stanno subito sotto l'insegna: niente scena
}
// posa finale: la mano sul bordo del disco, che sta poco a destra del suo posto sotto l'insegna; il resto del corpo scende verso sinistra
function tdFinal(B){
  const hu=ri(clamp(B.h*0.46,24,52)),k=1/tdK(),w=TDS.c0.w*k/2;
  const T={x:TDS.c0.x*k+w*0.4,y:TDS.c0.y*k};
  const h=handPos(0,0,0,1,TD_ROT,hu,SK_FLY2),ax=Math.sin(TD_ROT),ay=-Math.cos(TD_ROT),e=1.0/Math.hypot(ax/w,ay/(w*0.4));   // dal centro del disco al bordo, lungo il braccio
  const P={x:T.x-h.x-ax*e,y:T.y-h.y-ay*e},gy=ri(B.y1-2);
  return {hu,T,x:P.x,gy,hip:(gy-P.y)/hu};
}
function drawTitleDive(dt){
  const el=tdDisc();if(!el)return;
  const B=titleBand();
  if(!B){   // non c'e' spazio: il disco torna a fluttuare sotto l'insegna come prima
    if(el.classList.contains('tdHold')){el.classList.remove('tdHold','tdStk');el.style.removeProperty('width');el.style.removeProperty('animation');el.style.removeProperty('transform');el.dataset.tdt='';TDS.key='';}
    if(tdCv)tdCv.style.display='none';
    return;
  }
  const key=[ri(B.y0),ri(B.y1),VW,VH].join('|');
  if(TDS.t<0||key!==TDS.key){   // primo disegno o schermo cambiato: rilegge dove sta il disco
    tdDiscSize(el);const now=tdCtr(el);TDS.c0=tdRest(el);TDS.key=key;el.dataset.tdt='';el.classList.add('tdHold');
    if(TDS.t<0){TDS.t=0;TDS.done=!!reduceMotion;const k=1/tdK();TDS.from={x:now.x*k,y:now.y*k};}
  }
  const F=tdFinal(B),hu=F.hu;
  if(!TDS.done)TDS.t+=Math.min(dt||0,0.05);
  const xr=F.x-hu*1.7,x0=-hu*1.5,run=clamp((xr-x0)/(VW*0.36),1,2),t=TDS.t;
  if(t>=run+TD_LEAP&&!TDS.done){TDS.done=true;TDS.dt=0;}
  if(TDS.done)TDS.dt=(TDS.dt||0)+Math.min(dt||0,0.05);
  const stk=TDS.done?(reduceMotion||TDS.t<0.01?1:clamp(TDS.dt/0.18,0,1)):0;   // l'adesivo arriva con la presa, in un attimo
  let x,hip,pose,rot,dx,dy,lines=false;
  if(TDS.done){x=F.x;hip=F.hip;pose=SK_FLY2D;rot=TD_ROT;dx=F.T.x;dy=F.T.y;   // fermo: la presa a una mano al culmine del tuffo, con la luce dietro
    const g=ctx.createRadialGradient(F.T.x,F.T.y,4,F.T.x,F.T.y,hu*3.2);g.addColorStop(0,'rgba(255,248,214,.45)');g.addColorStop(1,'rgba(255,248,214,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  }else{
    // il disco va dal punto in cui fluttuava fino alla mano, in tempo per la presa
    const kd=easeIO(clamp(t/(run+TD_LEAP),0,1));dx=TDS.from.x+(F.T.x-TDS.from.x)*kd;dy=TDS.from.y+(F.T.y-TDS.from.y)*kd-Math.sin(Math.PI*kd)*hu*0.25;
    if(t<run){const k=t/run;x=x0+(xr-x0)*k;hip=0.92;pose='run';rot=0.15;}
    else{   // stacco come nel tuffo laterale (diveMo, 03-stacchi.js): carica sul ginocchio, spinta e volo verso il disco
      const v=t-run,kx=clamp(v/TD_LEAP,0,1);x=xr+(F.x-xr)*(1-(1-kx)*(1-kx));
      if(v<DV_LOAD){const e=easeIO(v/DV_LOAD);pose=skMix(skelOf('run',t*13),SK_LOAD,e);hip=0.92-0.24*e;rot=0.15+0.17*e;}
      else if(v<DV_PUSH){const e=easeIO((v-DV_LOAD)/(DV_PUSH-DV_LOAD));pose=skMix(SK_LOAD,SK_PUSH,e);hip=0.68+0.12*e;rot=0.32+0.5*e;}
      else{const e=easeIO(clamp((v-DV_PUSH)/(TD_LEAP-DV_PUSH),0,1));pose=skMix(SK_PUSH,SK_FLY2,e);hip=0.8+(F.hip-0.8)*e;rot=0.82+(TD_ROT-0.82)*e;lines=true;}
    }
  }
  pell(ri(x+hu*0.1),F.gy,ri(hu*(pose==='run'?0.55:(TDS.done?1.1:1))),Math.max(2,ri(hu*0.1)),'rgba(20,40,20,.35)');   // l'ombra resta sul prato, sotto il velo
  tdOnTop(()=>{
    if(lines)tdLines(x-ri(hu*0.8),F.gy-hip*hu,hu*1.3,hu,0.45);
    tdAthlete(x,F.gy,hip,pose,rot,TDS.done?0:t*13,hu,stk);   // passi piu' fitti: la corsa e' piu' lenta ma le gambe non rallentano
  });
  tdPlace(el,dx,dy,TD_TILT);tdStk(el,stk);
}
