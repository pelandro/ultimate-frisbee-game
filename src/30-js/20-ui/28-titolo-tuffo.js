/* ---- SCHERMATA INIZIALE: il giocatore che prende il disco dell'insegna ----
   Dietro il menu iniziale si vede lo stadio grande (venueNow fuori partita) senza le squadre in campo e senza i nomi nelle mete.
   Quando il gioco si apre un giocatore entra di corsa da sinistra, si tuffa in salita e prende al volo il disco sotto l'insegna (.ttlDisc),
   poi resta fermo in quella posa, come un manifesto. Il giocatore e' disegnato come nelle scene laterali (athlete, 03-stacchi.js);
   il disco resta l'elemento della pagina: qui lo si sposta (transform) fino alla mano. Le volte dopo la scena e' gia' ferma. */
const titleBg=()=>!G.inMatch&&!G.drill&&G.mode==='home'&&!$('title').classList.contains('hidden');
const TD_WHO={t:0,look:{hair:'#2b1b10',skin:'#d9a57c',style:1,hs:1,bw:1,hd:1}};
const TD_ROT=1.0,TD_LEAP=0.5;   // inclinazione del tuffo (in salita verso il disco) e durata del volo, in secondi
const TDS={t:-1,done:false,from:null,c0:null,key:''};
// athlete legge la divisa da cine.kits: qui ne serve una sola, la prima del campo
function tdAthlete(x,gy,hip,pose,rot,tt,hu){
  const keep=cine;cine={kits:UNI.map(k=>({...k}))};
  try{athlete(x,gy,hip,1,pose,rot,tt,hu,undefined,false,TD_WHO);}finally{cine=keep;}
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
const tdCtr=el=>{const r=layRect(el);return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width};};
// centro del disco senza spostamenti, in pixel della pagina (l'animazione del CSS e' !important: anche questi lo sono)
function tdRest(el){
  el.style.setProperty('animation','none','important');el.style.setProperty('transform','none','important');
  return tdCtr(el);
}
function tdPlace(el,x,y,deg){   // x, y: centro del disco in pixel del gioco
  const k=tdK(),s=`translate(${(x*k-TDS.c0.x).toFixed(1)}px,${(y*k-TDS.c0.y).toFixed(1)}px) rotate(${deg.toFixed(1)}deg)`;
  if(el.dataset.tdt!==s){el.dataset.tdt=s;el.style.setProperty('transform',s,'important');}
}
// lo spazio libero tra l'insegna e i pulsanti, in pixel del gioco
function titleBand(){
  const k=1/tdK(),a=$('title').querySelector('.hl'),b=$('title').querySelector('.hr');
  let y0=VH*0.33,y1=VH*0.66;
  if(a&&b){const ra=layRect(a),rb=layRect(b);if(rb.top>ra.bottom+20){y0=ra.bottom*k;y1=rb.top*k;}}
  return {y0,y1,h:y1-y0};
}
// posa finale: la mano sul bordo del disco, che sta poco a destra del suo posto sotto l'insegna; il resto del corpo scende verso sinistra
function tdFinal(B){
  const hu=ri(clamp(B.h*0.46,24,52)),k=1/tdK(),w=TDS.c0.w*k/2;
  const T={x:TDS.c0.x*k+w*0.4,y:TDS.c0.y*k};
  const h=handPos(0,0,0,1,TD_ROT,hu,'dive'),ax=Math.sin(TD_ROT),ay=-Math.cos(TD_ROT),e=0.8/Math.hypot(ax/w,ay/(w*0.33));   // dal centro del disco al bordo, lungo il braccio
  const P={x:T.x-h.x-ax*e,y:T.y-h.y-ay*e},gy=ri(B.y1-2);
  return {hu,T,x:P.x,gy,hip:(gy-P.y)/hu};
}
function drawTitleDive(dt){
  const el=tdDisc();if(!el)return;
  const B=titleBand(),key=[ri(B.y0),ri(B.y1),VW,VH].join('|');
  if(TDS.t<0||key!==TDS.key){   // primo disegno o schermo cambiato: rilegge dove sta il disco
    const now=tdCtr(el);TDS.c0=tdRest(el);TDS.key=key;el.dataset.tdt='';
    if(TDS.t<0){TDS.t=0;TDS.done=!!reduceMotion;const k=1/tdK();TDS.from={x:now.x*k,y:now.y*k};}
  }
  const F=tdFinal(B),hu=F.hu;
  if(!TDS.done)TDS.t+=Math.min(dt||0,0.05);
  const xr=F.x-hu*1.7,x0=-hu*1.5,run=clamp((xr-x0)/(VW*0.4),0.9,1.8),t=TDS.t;
  if(TDS.done||t>=run+TD_LEAP){   // fermo: la presa al culmine del tuffo, con la luce dietro
    TDS.done=true;
    const g=ctx.createRadialGradient(F.T.x,F.T.y,4,F.T.x,F.T.y,hu*3.2);g.addColorStop(0,'rgba(255,248,214,.45)');g.addColorStop(1,'rgba(255,248,214,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
    pell(ri(F.x+hu*0.1),F.gy,ri(hu*1.1),Math.max(2,ri(hu*0.1)),'rgba(20,40,20,.35)');
    tdAthlete(F.x,F.gy,F.hip,'dive',TD_ROT,0,hu);
    tdPlace(el,F.T.x,F.T.y,0);
    return;
  }
  // il disco va dal punto in cui fluttuava fino alla mano, in tempo per la presa
  const kd=easeIO(clamp(t/(run+TD_LEAP),0,1));tdPlace(el,TDS.from.x+(F.T.x-TDS.from.x)*kd,TDS.from.y+(F.T.y-TDS.from.y)*kd-Math.sin(Math.PI*kd)*hu*0.25,(1-kd)*-6);
  let x,hip,pose,rot;
  if(t<run){const k=t/run;x=x0+(xr-x0)*k;hip=0.92;pose='run';rot=0.15;}
  else{const k=(t-run)/TD_LEAP,e=easeIO(k);x=xr+(F.x-xr)*e;hip=0.92+(F.hip-0.92)*e+Math.sin(Math.PI*k)*0.06;pose='dive';rot=0.85+(TD_ROT-0.85)*e;   // si butta subito in avanti: in piedi la testa finirebbe sotto l'insegna
    tdLines(x-ri(hu*0.8),F.gy-hip*hu,hu*1.3,hu,0.45);}
  pell(ri(x+hu*0.1),F.gy,ri(hu*(pose==='dive'?1:0.55)),Math.max(2,ri(hu*0.1)),'rgba(20,40,20,.35)');
  tdAthlete(x,F.gy,hip,pose,rot,t*13,hu);   // passi piu' fitti: la corsa e' piu' lenta ma le gambe non rallentano
}
