/* ---- VENTO: sorteggio per ogni modalita' e indicatore sul campo (le regole sono nel motore, 10-sim/15-vento.js) ---- */
// carriera: il vento di una partita dipende dal salvataggio, dalla stagione e dalla giornata, cosi' il cruscotto lo annuncia prima e non cambia ricaricando
const careerWind=m=>windFor(mulberry32(hashStr('vento|'+SV.seed+'|'+SV.season+'|'+m.label+'|'+m.name)));
const WIND_KEY='ultimate-vento';
// acceso o spento dalle Impostazioni e dalle Opzioni della carriera: vale dalla prossima partita; spegnendolo a partita in corso cala subito
function setWindOn(on){G.opt.wind=!!on;try{localStorage.setItem(WIND_KEY,on?'1':'0');}catch(e){}if(!on)setWind(0,0);}
const windTxt=lv=>WIND_N[lv]+(lv>=2?': lanci lunghi e alti più difficili':(lv===1?': poco effetto':''));
// in alto a destra, sotto la barra: freccia nella direzione in cui soffia e nome. Con la calma non compare nulla
function drawWind(){
  const W=G.wind;if(!W||!W.lv||!G.inMatch||!(G.mode==='play'||G.mode==='ready'||G.mode==='banner'))return;
  const txt=WIND_N[W.lv].toUpperCase(),tw=ptw(txt,'t'),w=tw+24,x=VW-w-4,y=BAR+4,cx=x+10,cy=y+7,col=W.lv>=3?PAL.red:(W.lv===2?PAL.gold:'#ffffff');
  px(x-1,y-1,w+2,16,PAL.out);px(x,y,w,14,'#000000');
  const ux=Math.cos(W.a),uy=Math.sin(W.a),sw=Math.sin(G.tick*(2+W.lv))*0.6;   // la freccia oscilla un poco, piu' in fretta col vento forte
  const ax=cx-ux*5,ay=cy-uy*5,bx=cx+ux*(5+sw),by=cy+uy*(5+sw);
  pline(ax,ay,bx,by,col,1);pline(bx,by,bx-ux*3-uy*3,by-uy*3+ux*3,col,1);pline(bx,by,bx-ux*3+uy*3,by-uy*3-ux*3,col,1);
  ptext(txt,x+19,y+3,{f:'t',a:'l',c:col,o:false});
}
