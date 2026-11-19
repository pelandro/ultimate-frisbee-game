/* ---- SCHERMATA INIZIALE: un giocatore che prende il disco in tuffo ----
   Dietro il menu iniziale si vede lo stadio grande (venueNow fuori partita) senza le squadre in campo e senza i nomi nelle mete:
   al loro posto un solo giocatore, disegnato come nelle scene laterali (athlete, 03-stacchi.js), che si tuffa sul disco a centrocampo.
   TDV sceglie la versione (prove). */
let TDV='A',tdT=0;
const titleBg=()=>!G.inMatch&&!G.drill&&G.mode==='home'&&!$('title').classList.contains('hidden');
const TD_WHO={t:0,look:{hair:'#2b1b10',skin:'#d9a57c',style:1,hs:1,bw:1,hd:1}};
// athlete legge la divisa da cine.kits: qui ne serve una sola, la prima del campo
function tdAthlete(x,gy,hip,pose,rot,tt,hu){
  const keep=cine;cine={kits:UNI.map(k=>({...k}))};
  try{athlete(x,gy,hip,1,pose,rot,tt,hu,undefined,false,TD_WHO);}finally{cine=keep;}
}
// zolle e fili d'erba che schizzano dove il tuffo tocca terra (posizioni fisse da un seme: stessa scena a ogni giro)
function tdSpray(x,gy,k,hu){
  if(k<=0)return;
  const g1='#8fcf5a',g2='#c9ec8c',dirt='#a07a48';   // piu' chiari del prato, per staccarsi
  for(let i=0;i<14;i++){
    const a=(ihash(i,7)%100)/100,b=(ihash(i,13)%100)/100,dx=-(0.2+a*1.6)*hu*k,dy=-(0.1+b*0.7)*hu*k*(1.2-k);
    px(x+dx,gy+dy,i%3?3:2,2,i%4===0?dirt:(i%2?g1:g2));
  }
}
// linee di velocita' dietro al giocatore
function tdLines(x,y,len,hu,al){
  ctx.save();ctx.globalAlpha=al;
  for(let i=0;i<5;i++){const yy=ri(y-hu*0.5+i*hu*0.22),l=ri(len*(0.5+((i*37)%10)/14));px(x-l,yy,l,1,'#ffffff');}
  ctx.restore();
}
// lo spazio libero tra l'insegna e i pulsanti, in pixel del gioco (si rilegge ogni mezzo secondo: cambia con la rotazione e l'ingrandimento)
let tdBand=null,tdBandT=-1;
function titleBand(){
  if(tdBand&&tdT-tdBandT<0.5)return tdBand;
  const k=DPR/PXS,a=$('title').querySelector('.hl'),b=$('title').querySelector('.hr');
  let y0=VH*0.33,y1=VH*0.66;
  if(a&&b){const ra=layRect(a),rb=layRect(b);if(rb.top>ra.bottom+20){y0=ra.bottom*k;y1=rb.top*k;}}
  tdBandT=tdT;return tdBand={y0,y1,h:y1-y0};
}
function drawTitleDive(dt){
  tdT+=Math.min(dt||0,0.05);
  const B=titleBand(),hu=ri(clamp(B.h*0.46,24,52)),cx=ri(VW*0.5),gy=ri(B.y0+B.h*0.5+hu*0.55);
  if(TDV==='A'){   // fermo al culmine del tuffo: disco in mano, scia e schizzi; si muovono solo il disco e la scia
    const bob=Math.sin(tdT*2)*1.5,hip=0.55+bob/hu;
    pell(cx+ri(hu*0.2),gy,ri(hu*1.3),Math.max(2,ri(hu*0.12)),'rgba(20,40,20,.35)');
    tdLines(cx-ri(hu*0.9),gy-hip*hu,hu*1.4,hu,0.55+0.2*Math.sin(tdT*8));
    tdAthlete(cx,gy,hip,'dive',1.4,0,hu);
    heldDisc(cx,gy,hip,1,1.4,hu,'dive',TD_WHO,tdT*12);
    tdSpray(cx-ri(hu*0.6),gy,1,hu);
  }else if(TDV==='B'){   // animato a giro: il disco arriva da destra, il giocatore corre, si tuffa, lo prende e scivola
    const L=4.2,t=tdT%L,run=0.9,fly=0.45,slide=0.7,hu=ri(clamp(B.h*0.38,22,46)),gy=ri(B.y1-3);   // in piedi e' alto: piu' piccolo e coi piedi sul bordo dei pulsanti
    const x0=cx-ri(hu*4.2),xr=cx-ri(hu*1.2),xc=cx+ri(hu*0.6),xe=cx+ri(hu*1.6);
    let x,hip,pose,rot,tt=t*11;
    if(t<run){const k=t/run;x=x0+(xr-x0)*k;hip=0.92;pose='run';rot=0.15;}
    else if(t<run+fly){const k=(t-run)/fly;x=xr+(xc-xr)*k;hip=0.92-0.35*k+0.35*Math.sin(Math.PI*k);pose='dive';rot=0.7+0.7*easeIO(Math.min(1,k*1.6));}
    else if(t<run+fly+slide){const k=(t-run-fly)/slide;x=xc+(xe-xc)*(1-(1-k)*(1-k));hip=0.57-0.17*k;pose='dive';rot=1.4+0.1*k;}
    else{x=xe;hip=0.4;pose='dive';rot=1.5;}
    const al=t>L-0.5?(L-t)/0.5:(t<0.3?t/0.3:1);
    ctx.save();ctx.globalAlpha=al;
    pell(ri(x)+ri(hu*0.2),gy,ri(hu*(pose==='dive'?1.2:0.6)),Math.max(2,ri(hu*0.1)),'rgba(20,40,20,.35)');
    if(pose==='dive'&&t<run+fly)tdLines(x-ri(hu*0.8),gy-hip*hu,hu*1.2,hu,0.4);
    tdAthlete(x,gy,hip,pose,rot,tt,hu);
    const caught=t>=run+fly*0.85;
    if(caught)heldDisc(x,gy,hip,1,rot,hu,'dive',TD_WHO,tdT*12);
    if(t>=run+fly&&t<run+fly+slide+0.4)tdSpray(x-ri(hu*0.5),gy,Math.min(1,(t-run-fly)/0.25)*(1-Math.max(0,(t-run-fly-slide)/0.4)),hu);
    ctx.restore();
    if(!caught){   // il disco che arriva: da destra in alto verso la mano
      const k=clamp(t/(run+fly*0.85),0,1),q=heldAt(xc,gy,0.57,1,1.4,hu,'dive'),sx=VW+20,sy=gy-hu*2.6;
      const p=bez({x:sx,y:sy},{x:(sx+q.x)/2,y:sy-hu*0.6},{x:q.x,y:q.y},k);
      pell(ri(p.x),gy,ri(hu*0.2),1,'rgba(20,40,20,.25)');discSprite(p.x,p.y,0.17*hu,tdT*14);
    }
  }else if(TDV==='C'){   // manifesto: piu' grande, in salita, con un fascio di luce dietro
    const H=ri(hu*1.2),hip=0.62+Math.sin(tdT*1.6)*0.03,x=cx-ri(H*0.4),gy=ri(B.y1-H*0.1);
    const g=ctx.createRadialGradient(x+H*0.6,gy-H*0.9,4,x+H*0.6,gy-H*0.9,H*2.2);
    g.addColorStop(0,'rgba(255,248,214,.55)');g.addColorStop(1,'rgba(255,248,214,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
    pell(x+ri(H*0.4),gy+ri(H*0.15),ri(H*1.1),Math.max(2,ri(H*0.1)),'rgba(20,40,20,.35)');
    tdLines(x-ri(H*0.8),gy-hip*H+ri(H*0.3),H*1.6,H,0.4);
    tdAthlete(x,gy,hip,'dive',1.05,0,H);
    heldDisc(x,gy,hip,1,1.05,H,'dive',TD_WHO,tdT*12);
  }else{   // dall'alto, come in partita: il giocatore del campo ingrandito, con la scia di erba
    const k=Math.max(2,ri(hu/12)),lift=0.5+Math.sin(tdT*2)*0.3,cy=ri(B.y0+B.h*0.55);
    ctx.save();ctx.translate(cx,cy);ctx.scale(k,k);
    pell(4,1,13,2,'rgba(10,30,10,.3)');
    for(let i=0;i<6;i++)px(-22-i*4,-4+((i*5)%7)-3,3,1,'rgba(255,255,255,.35)');
    puppetDive(0,0,UNI[0],TD_WHO.look,1,lift*2);
    ctx.restore();
    const q={x:cx+ri(14*k),y:cy-ri((5+lift*2)*k)};discSprite(q.x,q.y,0.14*hu,tdT*12);
    tdSpray(cx-ri(10*k),cy+3,1,hu*0.8);
  }
}
