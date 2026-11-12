/* ---- VENTO: sorteggio per ogni modalita' e indicatore sul campo (le regole sono nel motore, 10-sim/15-vento.js) ---- */
// carriera: il vento di una partita dipende dal salvataggio, dalla stagione e dalla giornata, cosi' il cruscotto lo annuncia prima e non cambia ricaricando
const careerWind=m=>windFor(mulberry32(hashStr('vento|'+SV.seed+'|'+SV.season+'|'+m.label+'|'+m.name)));
const careerWeather=m=>weatherFor(mulberry32(hashStr('meteo|'+SV.seed+'|'+SV.season+'|'+m.label+'|'+m.name)));
// testo del meteo di una partita di carriera, per il cruscotto: tempo e vento
function meteoTxt(m){
  const w=careerWind(m),wx=careerWeather(m),p=[];
  if(wx)p.push(WX_N[wx].toLowerCase()+' (prese più difficili)');
  if(w[0])p.push(WIND_N[w[0]].toLowerCase()+(w[0]>=2?': lanci lunghi più difficili':''));
  return p.length?p.join(', '):'sereno';
}
const WIND_KEY='ultimate-vento';
// acceso o spento dalle Impostazioni e dalle Opzioni della carriera: vale dalla prossima partita; spegnendolo a partita in corso cala subito
function setWindOn(on){G.opt.wind=!!on;try{localStorage.setItem(WIND_KEY,on?'1':'0');}catch(e){}if(!on){setWind(0,0);setWx(0);}}
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
// pioggia e neve: velo sul campo e gocce o fiocchi che cadono (posizioni calcolate dal tempo, niente stato); il vento le spinge di lato
function drawWeather(){
  const wx=G.wx|0;if(!wx||!G.inMatch||!(G.mode==='play'||G.mode==='ready'||G.mode==='banner'))return;
  const t=G.tick,W=G.wind&&G.wind.lv?G.wind:{x:0},dr=W.x*(wx===1?5:3);
  if(wx===1){
    px(0,BAR,VW,VH-BAR,'rgba(24,44,78,.13)');
    for(let i=0;i<110;i++){const sp=90+(i%5)*14,x=(((i*97.3)%VW+t*(dr-8))%VW+VW)%VW,y=BAR+(((i*61.7)%(VH-BAR))+t*sp)%(VH-BAR);px(x,y,1,3,'rgba(215,230,255,.72)');}
  }else{
    px(0,BAR,VW,VH-BAR,'rgba(236,243,255,.11)');
    for(let i=0;i<60;i++){const sp=10+(i%4)*5,x=(((i*83.9)%VW+t*dr+Math.sin(t*0.8+i)*5)%VW+VW)%VW,y=BAR+(((i*57.3)%(VH-BAR))+t*sp)%(VH-BAR),big=i%3===0;px(x,y,big?2:1,big?2:1,'rgba(255,255,255,.9)');}
  }
  // etichetta del tempo, sotto quella del vento
  const txt=WX_N[wx].toUpperCase(),w=ptw(txt,'t')+10,x=VW-w-4,y=BAR+(G.wind&&G.wind.lv?22:4);
  px(x-1,y-1,w+2,16,PAL.out);px(x,y,w,14,'#000000');ptext(txt,x+5,y+3,{f:'t',a:'l',c:wx===1?'#9fc4ff':'#e8f2ff',o:false});
}
