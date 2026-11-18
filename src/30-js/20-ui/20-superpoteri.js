/* ---- MODALITA' SUPERPOTERI (interfaccia): trasformazione in campo, tre pulsanti con il loro timer, effetto della trasformazione ----
   Il motore e' in 10-sim/27-superpoteri.js. Il disegno dell'omino trasformato passa da puppet (02-pixel-art.js): pelle e capelli dell'animale (heroLook) e,
   al posto della testa, HERO_DRAW[eroe] (testa, collo, coda o tentacoli), con gli stessi pixel e lo stesso contorno degli omini. */
const HERO_LOOK={lupo:{skin:'#8d7c68',hair:'#4b3f35',style:4,band:null,beard:0},giraffa:{skin:'#e9b44c',hair:'#9a5a1e',style:4,band:null,beard:0},polpo:{skin:'#b25fe0',hair:'#7a35a8',style:4,band:null,beard:0}};
function heroLook(p){
  if(!heroOn(p))return lookOf(p);
  if(!p._hl||p._hlk!==p.hero){p._hl=Object.assign({},lookOf(p),HERO_LOOK[p.hero]);p._hlk=p.hero;}
  return p._hl;
}
const HERO_DRAW={
  // testa da lupo: piu' grande, orecchie a punta, muso in avanti, occhi gialli; coda folta dietro
  lupo(R,o){
    const {hx0,T,f,view,x,by}=o,c=o.skin,d=o.skin2,dk='#2a221c',ey='#ffd23f';
    R(hx0,T,6,6,c);R(hx0-1,T+1,8,4,c);
    R(hx0,T-2,1,2,d);R(hx0+1,T-1,1,1,d);R(hx0+5,T-2,1,2,d);R(hx0+4,T-1,1,1,d);   // orecchie
    if(view===1)R(hx0,T+1,6,3,d);   // di schiena: solo pelo
    else if(view===0){const sx=f>0?hx0+6:hx0-3;R(sx,T+3,3,2,c);R(f>0?sx+2:sx,T+3,1,1,dk);R(sx,T+5,3,1,'#f4f4f4');R(f>0?hx0+4:hx0+1,T+2,1,1,ey);}
    else{R(hx0+2,T+4,2,2,c);R(hx0+2,T+4,2,1,dk);R(hx0+1,T+2,1,1,ey);R(hx0+4,T+2,1,1,ey);}
    const tx=f>0?x-6:x+4,s=f>0?-1:1;R(tx,by-9,2,2,d);R(tx+s,by-8,2,2,d);R(tx+2*s,by-6,2,2,c);   // coda
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
  }
};
// trasformazione: nuvola di fumo e scintille, poi la scritta col nome dell'animale
HOOKS.hero=(p,k,on)=>{
  for(let i=0;i<(on?18:8);i++){const a=Math.random()*Math.PI*2,v=0.8+Math.random()*1.6;addFx({t:i%3?'dust':'spark',x:p.x+Math.cos(a)*0.4,y:p.y+Math.sin(a)*0.3,vx:Math.cos(a)*v,vy:Math.sin(a)*v*0.6,z:0.4+Math.random()*1.4,vz:on?1.4:0.6,life:0.6,max:0.6,r:0.2});}
  if(on){HOOKS.sfx&&HOOKS.sfx('ui');if(p.t===0||G.auto)HOOKS.toast&&HOOKS.toast(HERO[k].n+'!');}
};
// ---- i tre pulsanti (solo i tuoi eroi): icona, anello del timer, grigio se l'eroe non e' in campo ----
const HERO_ICON={   // 10x8: o contorno, c pelle dell'animale, e occhio giallo, k nero, w bianco, b muso
  lupo:   ['.o......o.','oco....oco','occcccccco','occeccecco','occcccccco','.occkkcco.','..occwwo..','...oooo...'],
  giraffa:['..k.k.....','..o.o.....','.occco....','.oceccooo.','.occcccbbo','..oooccooo','...occo...','...occo...'],
  polpo:  ['...oooo...','..occcco..','.occcccco.','occwkcwkco','.occcccco.','.oc.oc.co.','oc..oc..co','o...o....o']
};
function heroIconSvg(k){
  const C={o:'#0b0d12',c:HERO_LOOK[k].skin,e:'#ffd23f',k:'#0b0d12',w:'#ffffff',b:'#c98a3a'};
  let s='<svg viewBox="0 0 10 8" shape-rendering="crispEdges" aria-hidden="true">';
  HERO_ICON[k].forEach((row,y)=>{for(let x=0;x<row.length;x++){const c=C[row[x]];if(c)s+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;}});
  return s+'</svg>';
}
(function(){
  const box=$('heroB');if(!box)return;
  box.innerHTML=HERO_K.map(k=>`<button type="button" class="hb" data-k="${k}" aria-label="${HERO[k].n}">${heroIconSvg(k)}<i class="hbr"></i><em></em></button>`).join('');
  box.addEventListener('pointerdown',e=>{const b=e.target.closest('.hb');if(!b)return;e.preventDefault();e.stopPropagation();heroUse(0,b.dataset.k);});
})();
function heroHud(){
  const box=$('heroB');if(!box)return;
  const show=!!(G.heroOn&&G.hz&&(G.mode==='play'||G.mode==='ready'||G.mode==='banner'));
  box.classList.toggle('hidden',!show);if(!show)return;
  for(const b of box.children){
    const k=b.dataset.k,p=heroOf(0,k),H=HERO[k],left=G.hz[0][k],act=!!(p&&p.hx>0);
    const fr=act?p.hx/H.dur:(left<=0?1:1-left/(H.dur+H.cd));
    b.style.setProperty('--p',(fr*100).toFixed(1)+'%');
    b.classList.toggle('rdy',heroReady(0,k));b.classList.toggle('act',act);b.classList.toggle('off',!p);
    const t=act?Math.ceil(p.hx)+'':(left>0?Math.ceil(left)+'':'');const em=b.lastChild;if(em.textContent!==t)em.textContent=t;
  }
}
