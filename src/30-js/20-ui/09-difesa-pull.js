/* ---- DIFESA AUTOMATICA, SALTO DEL POSSESSO AVVERSARIO e PULL A TEMPO ----
   Difesa (G.opt.def, vedi defMan nel motore): 0 automatica, 1 manuale, 2 saltata. La scelta vale per tutte le modalita' e resta salvata sul dispositivo.
   In automatico non c'e' nulla da guidare: restano il tasto della marcatura (anticipo o contenimento), il tasto SALTA e, ogni tanto, un tuffo o un duello a tempo. */
const DEF_KEY='ultimate-difesa',DEF_LBL=['Automatica','Manuale','Saltata'];
const DEF_TXT=['i tuoi difendono da soli, restano pochi tuffi e salti a tempo','guidi un difensore: handblock e tuffi a ogni occasione','il possesso avversario si risolve in un istante'];
function setDefMode(v){G.opt.def=v;try{localStorage.setItem(DEF_KEY,String(v));}catch(e){}ddrag=null;G.cdir=null;G.ctrl=null;}
const bSkipD=$('bSkipD');let shownSkip=0;
const canSkipDef=()=>!!G.inMatch&&!G.drill&&!G.paused&&G.mode==='play'&&G.poss===1&&!G.pull&&!G.diveWin&&!!(G.holder||G.flight);
/* SALTA: il possesso avversario viene giocato in un istante dal motore vero (stesse statistiche, stessa fatica, stessi schemi), finche' il disco
   torna a te o loro segnano. Durante il salto non ci sono stacchi ne' momenti a tempo: decidono le statistiche. Alla fine una fascia dice com'e' andata. */
function skipDefense(){
  if(!canSkipDef())return false;
  const H0=Object.assign({},HOOKS),c0=G.opt.cine,cmp0=G.st.cmp[1];
  let last=null,n=0;
  drag=null;ddrag=null;aimPid=null;G.cdir=null;
  HOOKS.toast=(t,b)=>{if(t)last=[t,b];};
  for(const k of ['sfx','vibe','shake'])HOOKS[k]=function(){};
  HOOKS.cine=null;G.opt.cine=false;G.skip=true;
  try{while(n++<14400&&G.mode==='play'&&G.poss===1)update(1/60);}
  finally{Object.assign(HOOKS,H0);G.opt.cine=c0;G.skip=false;}
  G.diveWin=null;G.dive=null;G.slowTail=0;G.hold=false;G.sprint=null;G.ctrl=null;cam.snap=true;shownSkip++;
  const pas=G.st.cmp[1]-cmp0,rec=pas===1?'1 passaggio avversario':pas+' passaggi avversari';
  if(G.mode==='banner'&&G.banner){HOOKS.sfx('goal',G.banner.team);return true;}
  if(G.mode==='play'&&G.poss===0){
    HOOKS.sfx('turn',0);
    band={txt:(last&&last[1]===0?last[0].replace(/!$/,''):'Disco recuperato').toUpperCase(),t:1.5,max:1.5,c:PAL.green};
    const h=G.holder||G.disc;addFloater(rec,h.x,h.y,'#ffffff','t');
  }
  return true;
}
bSkipD.addEventListener('click',()=>{skipDefense();});
// difesa automatica: durante il rallentatore del tuffo basta un tocco sullo schermo
function diveTouch(){
  if(G.mode!=='play'||defMan()||!inDefense()||!G.diveWin||G.diveWin.done)return false;
  diveTap();return true;
}
// difesa saltata: appena l'avversario ha il disco in mano (e ha fatto in tempo a comparire la fascia del cambio di possesso) il possesso si risolve da solo
function defTick(){
  if(G.opt.def===2&&G.holder&&G.holder.t===1&&G.holdT>0.45&&!G.walk&&canSkipDef())skipDefense();
}

/* PULL A TEMPO (le regole sono nel motore, 09-ia-lanciatore-pull.js): pm = indicatore attivo. Fase 0: la potenza sale e scende; fase 1: la direzione spazza il campo.
   Ogni tocco (schermo, Spazio, tasto A del controller) ferma l'indicatore; al secondo parte il pull. Il punto d'arrivo si muove sul campo: non serve leggere numeri. */
let pm=null;
const pullMineNow=()=>G.mode==='ready'&&G.pullTeam===0&&!G.auto&&!G.schemeOpen&&!G.paused&&!!G.puller;
const pmSpd=()=>G.drill?0.78:[0.9,1,1.12][G.lvl?G.lvl[1]|0:0];   // la difficolta' della partita accelera un poco gli indicatori; nella lezione vanno piano
function pullTick(){
  if(!pullMineNow()){pm=null;return;}
  if(!pm)pm={ph:0,t0:G.tick+0.5,c:0,off:0};   // mezzo secondo di attesa: un tocco dato per chiudere la meta precedente non fa partire il pull
}
function pmVal(){   // fase 0: potenza 0..1; fase 1: direzione -1..1 (da una linea laterale all'altra)
  const T=pullPeriod(G.puller,pm.ph)/pmSpd(),t=Math.max(0,G.tick-pm.t0);
  return pm.ph?pullWave(t+pm.off*T,T)*2-1:pullWave(t,T);
}
function pullTap(){
  if(!pm||!pullMineNow()||G.tick<pm.t0)return false;
  if(!pm.ph){
    pm.c=Math.max(0.12,pmVal());pm.ph=1;pm.t0=G.tick+0.2;pm.off=rnd(0,2);
    HOOKS.sfx('tick',pm.c>PULL_TH?2:1);HOOKS.vibe(10);
    if(pm.c>PULL_TH)HOOKS.sfx('warn');
    return true;
  }
  const c=pm.c,a=(dirOf(0)>0?0:Math.PI)+pmVal()*PULL_SW;pm=null;
  doPull(c,a);shownPull++;return true;
}
// angolo massimo (per parte) che resta in campo alla distanza scelta
const pullLim=dist=>Math.asin(clamp((MID-1)/dist,0,1));
function drawPull(){
  if(!pm||!G.puller)return;
  const p=G.puller,fwd=dirOf(0)>0?0:Math.PI,v=pmVal(),c=pm.ph?pm.c:v,pp=pullPlan(p,0,c,fwd),rel=pm.ph?v*PULL_SW:0,a=fwd+rel;
  // punto d'arrivo sul campo: verde nella meta avversaria, bianco se e' corto, rosso se e' fuori
  const lx=p.x+Math.cos(a)*pp.dist,ly=p.y+Math.sin(a)*pp.dist,out=lx<0||lx>FIELD_L||ly<0||ly>FIELD_W,deep=dirOf(0)>0?lx>=FIELD_L-EZ:lx<=EZ;
  const col=out?PAL.red:(deep?PAL.green:'#ffffff'),cx=sxw(p.x),cy=syw(p.y)-10,ex=sxw(lx),ey=syw(ly);
  const n=Math.max(4,ri(hyp(ex-cx,ey-cy)/7)),arc=Math.min(46,hyp(ex-cx,ey-cy)*0.25),flow=(G.tick*1.6)%1;
  for(let i=1;i<n;i++){const u=(i+flow)/n,x=ri(lerp(cx,ex,u)),y=ri(lerp(cy,ey,u)-arc*4*u*(1-u));px(x-2,y-2,4,4,PAL.out);px(x-1,y-1,2,2,col);}
  pring(ex,ey,7,5,PAL.out,3);pring(ex,ey,7,5,col,1);
  if(out)ptext('FUORI',clamp(ex,24,VW-24),clamp(ey-20,BAR+2,VH-12),{f:'p',c:PAL.red});
  // i due indicatori, in basso al centro: zone colorate e cursore
  const W=Math.min(168,VW-150),x0=ri(VW/2-W/2),hB=7,y1=VH-ri(60*DPR/PXS)-hB,y0=y1-17;   // sopra la fila dei pulsanti in basso (alti circa 50 px sullo schermo)
  const bar=(y,lab,zones,pos,on)=>{
    ptext(lab,x0-4,y-1,{f:'t',a:'r',c:on?'#ffffff':'#9aa3b8'});
    px(x0-2,y-2,W+4,hB+4,PAL.out);px(x0,y,W,hB,'#3b4263');
    for(const z of zones){const xa=x0+ri(clamp(z[0],0,1)*W),xb=x0+ri(clamp(z[1],0,1)*W);if(xb>xa)px(xa,y,xb-xa,hB,z[2]);}
    const mx=x0+ri(clamp(pos,0,1)*W);px(mx-2,y-4,5,hB+8,PAL.out);px(mx-1,y-3,3,hB+6,on?'#ffffff':'#c9cfdd');
  };
  bar(y0,'POTENZA',[[PULL_Y0,PULL_G0,PAL.gold],[PULL_G0,PULL_TH,PAL.green],[PULL_TH,1,PAL.red]],c,!pm.ph);
  if(pm.ph){
    const lim=pullLim(pp.dist)/PULL_SW,ok=Math.max(0.08,lim-0.3);   // gialla: in campo ma vicino alla linea; verde: in campo anche con un piccolo errore
    bar(y1,'DIREZIONE',[[0,0.5-lim/2,PAL.red],[0.5-lim/2,0.5+lim/2,PAL.gold],[0.5-ok/2,0.5+ok/2,PAL.green],[0.5+lim/2,1,PAL.red]],(v+1)/2,true);
  }
}
