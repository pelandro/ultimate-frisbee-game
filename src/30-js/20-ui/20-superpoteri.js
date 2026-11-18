/* ---- MODALITA' SUPERPOTERI (interfaccia): trasformazione in campo, un pulsante per eroe con il suo timer, effetto della trasformazione, dito che guida il disco ----
   Il motore e' in 10-sim/27-superpoteri.js. Il disegno dell'omino trasformato passa da puppet (02-pixel-art.js): pelle e capelli dell'animale (heroLook) e,
   al posto della testa, HERO_DRAW[eroe] (testa, collo, coda o tentacoli), con gli stessi pixel e lo stesso contorno degli omini. */
const HERO_LOOK={lupo:{skin:'#6e5f50',hair:'#3f342b',style:4,band:null,beard:0},giraffa:{skin:'#e9b44c',hair:'#9a5a1e',style:4,band:null,beard:0},polpo:{skin:'#b25fe0',hair:'#7a35a8',style:4,band:null,beard:0},tele:{},clone:{},
  ghiaccio:{skin:'#a9dcff',hair:'#f4f8ff',style:4,band:null,beard:0},mietitore:{skin:'#e9e4d2',hair:'#1e1629',style:4,band:null,beard:0}};
function heroLook(p){   // aspetto dell'eroe trasformato; chi e' congelato dallo stregone ha la pelle azzurra
  const h=heroOn(p)?p.hero:'',fr=p.frz>0;
  if(!h&&!fr)return lookOf(p);
  const key=h+(fr?'*':'');
  if(!p._hl||p._hlk!==key){p._hl=Object.assign({},lookOf(p),h?HERO_LOOK[h]:{},fr?{skin:'#bfe6ff'}:{});p._hlk=key;}
  return p._hl;
}
const HERO_DRAW={
  // testa da lupo: piu' grande, orecchie a punta, muso in avanti, occhi gialli; coda folta dietro
  lupo(R,o){   // lupo mannaro mostruoso: testa grande, orecchie alte, occhi rossi, fauci aperte con le zanne, pelo irto sulle spalle, coda folta
    const {hx0,T,f,view,x,by,sy,lean}=o,c=o.skin,d=o.skin2,dk='#1c1612',ey='#ff3b2f',wh='#f4f4f4';
    for(const s of [-1,1])for(let k=0;k<3;k++)R(x-1+lean+s*(4+k),sy-1-(k===1?2:1),1,2+(k===1?1:0),d);   // pelo irto sulle spalle
    R(hx0-1,T-1,8,7,c);R(hx0-2,T+1,10,4,c);R(hx0,T+5,6,2,c);
    R(hx0-1,T-4,2,3,d);R(hx0,T-5,1,1,d);R(hx0+5,T-4,2,3,d);R(hx0+6,T-5,1,1,d);   // orecchie alte
    if(view===1){R(hx0-1,T,8,4,d);R(hx0+1,T+4,4,1,d);}   // di schiena: solo pelo
    else if(view===0){
      const sx=f>0?hx0+7:hx0-5;R(sx,T+2,5,2,c);R(sx,T+5,5,1,c);R(sx,T+4,5,1,dk);   // muso con le fauci aperte
      R(f>0?sx+4:sx,T+2,1,1,dk);R(f>0?sx+1:sx+3,T+4,1,1,wh);R(f>0?sx+3:sx+1,T+4,1,1,wh);   // naso e zanne
      R(f>0?hx0+4:hx0+1,T+1,2,1,ey);R(f>0?hx0+3:hx0+2,T,2,1,dk);   // occhio rosso e sopracciglio
    }else{R(hx0+1,T+4,4,2,c);R(hx0+1,T+5,4,1,dk);R(hx0+1,T+5,1,1,wh);R(hx0+4,T+5,1,1,wh);R(hx0,T+1,2,1,ey);R(hx0+4,T+1,2,1,ey);R(hx0+2,T+3,2,1,dk);}
    const tx=f>0?x-7:x+5,s=f>0?-1:1;R(tx,by-10,3,2,d);R(tx+s,by-9,3,3,d);R(tx+2*s,by-7,3,2,c);R(tx+3*s,by-6,2,2,d);   // coda folta
  },
  // giraffa: collo lungo a macchie dalle spalle, testa piccola con gli ossiconi
  giraffa(R,o){
    const {x,lean,sy,f,view}=o,c=o.skin,sp='#9a5a1e',nx=x-1+lean+(view===0?f:0),top=sy-14;
    R(nx,top,2,15,c);R(nx,top+3,1,2,sp);R(nx+1,top+8,1,2,sp);R(nx,top+12,1,1,sp);
    if(view===0){
      const hx=f>0?nx-1:nx-3;R(hx,top-3,6,3,c);R(f>0?hx+4:hx,top-2,2,2,'#c98a3a');R(f>0?nx+2:nx-1,top-3,1,1,PAL.out);
      R(f>0?nx:nx+1,top-5,1,2,sp);R(f>0?nx+2:nx-1,top-5,1,2,sp);
    }else{
      R(nx-1,top-3,4,3,c);R(nx-1,top-5,1,2,sp);R(nx+2,top-5,1,2,sp);
      if(view===2){R(nx-1,top-2,1,1,PAL.out);R(nx+2,top-2,1,1,PAL.out);R(nx,top-1,2,1,'#c98a3a');}
    }
  },
  // polpo: testa a bulbo con macchie e occhi grandi, quattro tentacoli lunghi che ondeggiano ai lati
  polpo(R,o){
    const {hx0,T,f,view,x,lean,sy}=o,c=o.skin,d=o.skin2,t=G.tick||0;
    R(hx0+1,T-3,4,1,c);R(hx0,T-2,6,7,c);R(hx0-1,T,8,4,c);R(hx0+1,T-1,1,1,d);R(hx0+4,T,1,1,d);R(hx0+2,T+3,1,1,d);
    if(view===0){R(f>0?hx0+3:hx0+1,T+1,2,2,'#ffffff');R(f>0?hx0+4:hx0+1,T+2,1,1,PAL.out);}
    else if(view===2){R(hx0,T+1,2,2,'#ffffff');R(hx0+4,T+1,2,2,'#ffffff');R(hx0+1,T+2,1,1,PAL.out);R(hx0+4,T+2,1,1,PAL.out);}
    for(let i=0;i<4;i++){
      const s=i<2?-1:1,y0=sy+2+(i%2)*3,x0=x-1+lean+s*3;
      for(let k=1;k<=6;k++)R(Math.round(x0+s*k*1.6),Math.round(y0+Math.sin(t*7+k*0.9+i*1.7)*1.4+k*0.35),2,2,k>=5?d:c);
    }
  },
  // stregone di ghiaccio: cappello a punta blu con le stelline, barba bianca lunga, bastone con il cristallo di ghiaccio davanti
  ghiaccio(R,o){
    const {hx0,T,f,view,x,by,lean}=o,c=o.skin,hb='#3d7fd6',ic='#bff0ff',wh='#f4f8ff';
    R(hx0+1,T,4,1,c);R(hx0,T+1,6,4,c);R(hx0+1,T+5,4,1,c);
    if(view===0)R(f>0?hx0+4:hx0+1,T+2,1,1,PAL.out);else if(view===2){R(hx0+1,T+2,1,1,PAL.out);R(hx0+4,T+2,1,1,PAL.out);}
    if(view===0){R(f>0?hx0+2:hx0,T+3,4,3,wh);R(f>0?hx0+3:hx0+1,T+6,2,2,wh);}else if(view===2){R(hx0+1,T+3,4,3,wh);R(hx0+2,T+6,2,3,wh);}   // la barba
    R(hx0-2,T-1,10,2,hb);R(hx0,T-3,6,2,hb);R(hx0+1,T-5,4,2,hb);R(hx0+2,T-7,2,2,hb);R(f>0?hx0+1:hx0+3,T-8,2,1,hb);   // cappello, la punta piegata all'indietro
    R(hx0+1,T-3,1,1,ic);R(hx0+4,T-4,1,1,ic);R(hx0+2,T-6,1,1,ic);
    const sx=x+f*6+lean;R(sx,T-2,1,by-T+1,'#8a6a4a');R(sx-1,T-6,3,4,'#7fd0ff');R(sx,T-7,1,1,wh);R(sx,T-5,1,1,wh);   // bastone e cristallo
  },
  // mietitore: cappuccio nero che copre spalle e testa, teschio con gli occhi viola, falce dietro la schiena con la lama in avanti
  mietitore(R,o){
    const {hx0,T,f,view,x,by,sy,lean}=o,hd='#1e1629',hd2='#3a2c4f',bn='#e9e4d2',ey='#c45cff',bl='#c9d1db',so='#120c18';
    const sx=x-f*5+lean;R(sx,T-7,1,by-T+6,'#6b4a2e');   // il manico, dietro la schiena
    [[0,0],[1,-1],[2,-1],[3,-1],[4,-1],[5,0],[6,0],[7,1],[8,2],[9,3]].forEach(([i,d])=>R(sx+f*i,T-7+d,1,i<7?2:1,bl));
    for(let i=2;i<6;i++)R(sx+f*i,T-8+(i>4?1:0),1,1,'#ffffff');   // il filo della lama che brilla
    R(x-4+lean,sy,2,4,hd);R(x+2+lean,sy,2,4,hd);   // il mantello sulle spalle
    R(hx0,T-3,6,1,hd);R(hx0-1,T-2,8,2,hd);R(hx0-2,T,10,6,hd);R(hx0-1,T+6,8,1,hd);   // il cappuccio
    if(view===1){R(hx0+1,T-1,4,4,hd2);return;}
    const fx=view===0?(f>0?hx0+2:hx0):hx0+1;R(fx,T,4,5,bn);   // il teschio
    if(view===0){const ex=f>0?fx+2:fx+1;R(ex,T+1,1,2,so);R(ex,T+1,1,1,ey);}else{R(fx,T+1,1,2,so);R(fx+3,T+1,1,2,so);R(fx,T+1,1,1,ey);R(fx+3,T+1,1,1,ey);}
    R(fx+1,T+3,2,1,so);R(fx+1,T+4,1,1,so);
  },
  // telecinetico: un omino con un cervello gigante rosa al posto dei capelli; quando guida il disco, scintille attorno al cervello
  tele(R,o){
    const {hx0,T,f,view}=o,c=o.skin,pk='#f29ac0',pd='#c8608f';
    R(hx0+1,T+2,4,4,c);R(hx0,T+3,6,2,c);   // il viso, piccolo sotto il cervello
    if(view===0)R(f>0?hx0+4:hx0+1,T+3,1,1,PAL.out);else if(view===2){R(hx0+1,T+3,1,1,PAL.out);R(hx0+4,T+3,1,1,PAL.out);}
    R(hx0-2,T-5,10,7,pk);R(hx0-3,T-3,12,4,pk);R(hx0-1,T-6,8,1,pk);   // il cervello
    R(hx0+2,T-5,1,6,pd);R(hx0-1,T-3,2,1,pd);R(hx0+4,T-4,2,1,pd);R(hx0+5,T-2,2,1,pd);R(hx0-2,T-1,2,1,pd);R(hx0+7,T-3,1,2,pd);   // le pieghe
  }
};
// trasformazione: nuvola di fumo e scintille, poi la scritta col nome dell'animale
HOOKS.hero=(p,k,on)=>{
  for(let i=0;i<(on?18:8);i++){const a=Math.random()*Math.PI*2,v=0.8+Math.random()*1.6;addFx({t:i%3?'dust':'spark',x:p.x+Math.cos(a)*0.4,y:p.y+Math.sin(a)*0.3,vx:Math.cos(a)*v,vy:Math.sin(a)*v*0.6,z:0.4+Math.random()*1.4,vz:on?1.4:0.6,life:0.6,max:0.6,r:0.2});}
  const c=on&&k==='clone'&&G.dec&&G.dec[p.t];   // il clone: la copia salta fuori in una seconda nuvola
  if(on&&k==='ghiaccio'){HW.push({x:p.x,y:p.y,t0:G.tick||0,t:p.t});for(const q of T[1-p.t])if(q.frz>0)for(let i=0;i<5;i++)addFx({t:'spark',c:'#ffffff',c2:'#7fd0ff',x:q.x+rnd(-0.4,0.4),y:q.y+rnd(-0.3,0.3),vx:rnd(-0.5,0.5),vy:rnd(-0.3,0.3),z:rnd(0.3,1.6),vz:0.6,life:0.7,max:0.7,r:0.15});}
  if(c)for(let i=0;i<14;i++){const a=Math.random()*Math.PI*2,v=0.6+Math.random()*1.4;addFx({t:i%2?'dust':'spark',x:c.x+Math.cos(a)*0.4,y:c.y+Math.sin(a)*0.3,vx:Math.cos(a)*v,vy:Math.sin(a)*v*0.6,z:0.4+Math.random()*1.4,vz:1.2,life:0.6,max:0.6,r:0.2});}
  if(on){HOOKS.sfx&&HOOKS.sfx('ui');if(p.t===0||G.auto)HOOKS.toast&&HOOKS.toast(HERO[k].n+'!');}
};
// ---- i pulsanti dei tuoi eroi (G.hk[0], al massimo tre): icona, anello del timer, grigio se l'eroe non e' in campo ----
const HERO_ICON={   // 10x8: o contorno, c pelle dell'animale, e occhio giallo, k nero, w bianco, b muso
  lupo:   ['.o......o.','oco....oco','occcccccco','occeccecco','occcccccco','.occkkcco.','..occwwo..','...oooo...'],
  giraffa:['..k.k.....','..o.o.....','.occco....','.oceccooo.','.occcccbbo','..oooccooo','...occo...','...occo...'],
  polpo:  ['...oooo...','..occcco..','.occcccco.','occwkcwkco','.occcccco.','.oc.oc.co.','oc..oc..co','o...o....o'],
  ghiaccio:['....oo....','...oiio...','..oiwiio..','.oiiiiiio.','oooooooooo','..osksko..','..owwwwo..','...owwo...'],
  mietitore:['..oooo.lll','.ovvvvo..l','ovqqqqvo.n','ovxqqxvo.n','ovqqqqvo.n','ovqkkqvo.n','.ovvvvo..n','..oooo...n'],
  tele:   ['..oooooo..','.oppdppdo.','oppdppppdo','opdppdpppo','.oppppdpo.','..osssso..','..okskso..','...oooo...'],
  clone:  ['.ss...gg..','.ss...gg..','uuuu.gggg.','uuuu.gggg.','.uu...gg..','.kk...hh..','.kk...hh..','k..k.h..h.']   // il vero e, accanto, la copia trasparente
};
function heroIconSvg(k){
  const C={i:'#3d7fd6',v:'#2a1d3a',q:'#e9e4d2',x:'#c45cff',l:'#c9d1db',n:'#7a5634',u:'#2f7bff',g:'#a8ecff',h:'#62bcd8',o:'#0b0d12',c:HERO_LOOK[k].skin,e:k==='lupo'?'#ff3b2f':'#ffd23f',k:'#0b0d12',w:'#ffffff',b:'#c98a3a',p:'#f29ac0',d:'#c8608f',s:'#f0c9a4'};
  let s='<svg viewBox="0 0 10 8" shape-rendering="crispEdges" aria-hidden="true">';
  HERO_ICON[k].forEach((row,y)=>{for(let x=0;x<row.length;x++){const c=C[row[x]];if(c)s+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;}});
  return s+'</svg>';
}
(function(){
  const box=$('heroB');if(!box)return;
  box.addEventListener('pointerdown',e=>{const b=e.target.closest('.hb');if(!b)return;e.preventDefault();e.stopPropagation();heroUse(0,b.dataset.k);});
})();
function heroHud(){
  const box=$('heroB');if(!box)return;
  const show=!!(G.heroOn&&G.hz&&(G.mode==='play'||G.mode==='ready'||G.mode==='banner'));
  box.classList.toggle('hidden',!show);if(!show)return;
  const ks=(G.hk&&G.hk[0])||HERO_K,id=ks.join();
  if(box.dataset.ks!==id){box.dataset.ks=id;box.innerHTML=ks.map(k=>`<button type="button" class="hb" data-k="${k}" aria-label="${HERO[k].n}">${heroIconSvg(k)}<i class="hbr"></i><em></em></button>`).join('');}   // un pulsante per ogni eroe scelto
  for(const b of box.children){
    const k=b.dataset.k,p=heroOf(0,k),H=HERO[k],left=G.hz[0][k],act=!!(p&&p.hx>0);
    const fr=act?p.hx/H.dur:(left<=0?1:1-left/(H.dur+H.cd));
    b.style.setProperty('--p',(fr*100).toFixed(1)+'%');
    b.classList.toggle('rdy',heroReady(0,k));b.classList.toggle('act',act);b.classList.toggle('off',!p);
    const t=act?Math.ceil(p.hx)+'':(left>0?Math.ceil(left)+'':'');const em=b.lastChild;if(em.textContent!==t)em.textContent=t;
  }
}
// gli eroi sono un po' piu' grandi degli altri, il lupo mannaro trasformato molto di piu' (scala dei pixel in puppet)
const heroScale=p=>!G.heroOn||!p.hero?1:(heroOn(p,'lupo')?1.4:1.15);
// TELECINETICO: mentre e' trasformato e il tuo disco e' in volo, il dito sul campo indica dove guidarlo (G.tkp, letto da heroTick nel motore)
const tkOk=()=>!!(G.heroOn&&!G.auto&&G.mode==='play'&&G.flight&&G.flight.team===0&&!G.pull&&heroOn(heroOf(0,'tele'),'tele'));
let tkPid=null;
const tkAt=e=>{const b=cssToBuf(e.clientX,e.clientY);G.tkp=toWorld(b[0],b[1]);};
cv.addEventListener('pointerdown',e=>{if(!tkOk())return;e.stopImmediatePropagation();e.preventDefault();tkPid=e.pointerId;try{cv.setPointerCapture(e.pointerId);}catch(_){}tkAt(e);},true);
cv.addEventListener('pointermove',e=>{if(e.pointerId!==tkPid)return;if(!tkOk()){tkPid=null;G.tkp=null;return;}e.stopImmediatePropagation();tkAt(e);},true);
for(const ev of ['pointerup','pointercancel'])cv.addEventListener(ev,e=>{if(e.pointerId!==tkPid)return;tkPid=null;G.tkp=null;e.stopImmediatePropagation();},true);
// disco guidato: scia di scintille viola e un cerchio dove punta il dito
// onde di freddo dello stregone (si allargano fino a ICE_R in mezzo secondo) e scie viola sugli avversari del mietitore
const HW=[];
function heroTkFx(){
  if(!G.heroOn){HW.length=0;return;}
  for(let i=HW.length-1;i>=0;i--){
    const w=HW[i],a=((G.tick||0)-w.t0)/0.55;if(a>1.4||a<0){HW.splice(i,1);continue;}
    const r=ICE_R*Math.min(1,a),n=64,c=a<0.7?'#ffffff':'#9fe0ff';
    for(let k=0;k<n;k++){const an=k/n*Math.PI*2;px(sxw(w.x+Math.cos(an)*r)-1,syw(w.y+Math.sin(an)*r)-1,a<1?2:1,a<1?2:1,(k&1)?c:'#7fd0ff');}
  }
  for(const t of [0,1])if(G.mode==='play'&&heroOn(heroOf(t,'mietitore'),'mietitore'))for(const q of T[1-t])if(Math.random()<0.18)addFx({t:'spark',c:'#d79bff',c2:'#7a35a8',x:q.x+rnd(-0.3,0.3),y:q.y,vx:0,vy:0,z:rnd(0.6,1.4),vz:0.9,life:0.6,max:0.6,r:0.12});
  heroTkSteer();
}
// ghiaccio ai piedi di chi e' congelato: sparisce man mano che il gelo passa
function heroFrost(p,x,y){
  if(!(p.frz>0))return;const k=Math.min(1,p.frz/ICE_T),w=ri(4+5*k);
  px(x-w,y-2,2*w+1,3,'#7fd0ff');px(x-w+1,y-3,2*w-1,1,'#d8f4ff');if(k>0.5){px(x-w+1,y-5,2,2,'#d8f4ff');px(x+w-2,y-4,2,2,'#bfe6ff');}
}
function heroTkSteer(){
  const f=G.flight;if(!f||!f.tk)return;
  if(Math.random()<0.6)addFx({t:'spark',x:G.disc.x,y:G.disc.y,vx:0,vy:0,z:G.disc.z||1,vz:0.3,life:0.35,max:0.35,r:0.12});
  if(G.tkp&&f.team===0){const x=sxw(G.tkp.x),y=syw(G.tkp.y),pu=Math.sin((G.tick||0)*10)>0?1:0;pring(x,y,7+pu,3,PAL.out,3);pring(x,y,7+pu,3,'#f29ac0',1);}
}
const heroTop=p=>heroOn(p,'giraffa')?18:(heroOn(p,'tele')?8:(heroOn(p,'lupo')?4:0));   // il nome sta sopra il collo della giraffa, il cervello o le orecchie
// CLONE: la copia della tua squadra si disegna su una tela a parte (cosi' i pixel sovrapposti non si scuriscono), con un velo azzurro, poi trasparente sul campo
const GH_W=96,GH_H=112,GH_C=document.createElement('canvas');GH_C.width=GH_W;GH_C.height=GH_H;const GH_X=GH_C.getContext('2d');
function heroGhost(x,y,draw){
  const o=ctx;let r;GH_X.clearRect(0,0,GH_W,GH_H);ctx=GH_X;
  try{r=draw(GH_W/2,GH_H-14);}finally{ctx=o;}
  GH_X.globalCompositeOperation='source-atop';GH_X.fillStyle='rgba(160,230,255,.5)';GH_X.fillRect(0,0,GH_W,GH_H);GH_X.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=0.5+0.12*Math.sin((G.tick||0)*9);ctx.drawImage(GH_C,ri(x)-GH_W/2,ri(y)-(GH_H-14));ctx.restore();
  return r;
}
