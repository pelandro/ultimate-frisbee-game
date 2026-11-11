/* ---- ciclo principale ---- */
let last=performance.now();
G.tick=0;
// scossa dello schermo: impatti (handblock, intercetti, tuffi) e mete. Si smorza da sola; con «riduci animazioni» attivo non c'e'
const shake={a:0,t:0};
const reduceMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
HOOKS.shake=a=>{if(!reduceMotion){shake.a=Math.max(shake.a*shake.t/0.3,a);shake.t=0.3;}};
function render(dt){
  ctx.clearRect(0,0,VW,VH);
  if(G.mode==='cine'&&cine){drawCine();blit();return;}
  let sh=false;
  if(shake.t>0){shake.t=Math.max(0,shake.t-dt);const k=shake.t/0.3,m=shake.a*0.45*k*k;ctx.save();ctx.translate(Math.round((Math.random()-0.5)*2*m),Math.round((Math.random()-0.5)*2*m));sh=true;}
  drawField();drawRoutes();drawPlayers(dt);drawDisc();updateFx(dt);drawFx();drawAim();if(ddrag&&ddrag.mv&&inDefense())drawSling(ddrag.ox,ddrag.oy,ddrag.fx,ddrag.fy,false);drawSprint();drawHb();drawDiveWin();drawPull();drawWind();drawToasts(dt);drawBanner(dt);drawReplay();
  if(sh)ctx.restore();
  blit();
}
function blit(){octx.imageSmoothingEnabled=false;octx.drawImage(pcv,0,0,VW*PXS,VH*PXS);}
