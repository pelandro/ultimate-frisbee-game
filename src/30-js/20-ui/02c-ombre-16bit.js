/* ---- OMBRE A 16 BIT: toni e contorno pixel per pixel ----
   Per le persone a bordo campo (sprShade, 24-bordocampo-persone.js) e i toni della vernice sul prato (ramp16, 25b-scritte-dipinte.js).
   Una griglia di materiali si colora come negli sprite delle console a 16 bit: luce fissa in alto a sinistra (bordo esterno chiaro), ombra sul bordo
   in basso a destra e sotto le parti che stanno sopra, contorno nel tono piu' scuro del colore che tocca invece del nero pieno. I toni di ogni colore
   cambiano anche di tinta (ombre verso il blu-viola, luci verso il giallo), cosi' stanno nella stessa tavolozza del prato.
   Un rettangolo e' [x, y, w, h, colore, fl, gruppo]: fl&3 = profondita' (0 normale, 1 lontano = un tono piu' scuro, 2 vicino = un tono piu' chiaro), fl&4 = piatto
   (colore esatto, senza ombre); il gruppo (facoltativo) unisce colori diversi della stessa superficie, che non si fanno ombra. */
const PS_FAR=1,PS_NEAR=2,PS_FLAT=4;
function rgb2hsl(c){
  const r=c[0]/255,g=c[1]/255,b=c[2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=(mx===r?(g-b)/d+(g<b?6:0):(mx===g?(b-r)/d+2:(r-g)/d+4))*60;}
  return [h,s,l];
}
function hsl2hex(h,s,l){
  h=((h%360)+360)%360;s=clamp(s,0,1);l=clamp(l,0,1);
  const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return 255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)));};
  return cHex([f(0),f(8),f(4)]);
}
const hueTo=(h,t,d)=>{const x=((t-h+540)%360)-180;return h+Math.sign(x)*Math.min(Math.abs(x),d);};   // sposta la tinta h verso t di al massimo d gradi
// i quattro toni di un colore: [luce, base, ombra, contorno]. dep 1 = parte lontana (un tono piu' scuro e piu' freddo), -1 = parte vicina (piu' chiara)
const RAMP16=new Map();
function ramp16(c,dep){
  const key=c+'|'+dep;let r=RAMP16.get(key);if(r)return r;
  let [h,s,l]=rgb2hsl(cRgb(c));
  if(dep>0){l=Math.max(0.04,l*0.8-0.02);h=hueTo(h,235,6);s=Math.min(1,s*1.05);}
  else if(dep<0)l=Math.min(0.97,l+(1-l)*0.16);
  const grey=s<0.12,hs=grey?222:h,ss=grey?Math.max(s,0.16):s;   // i grigi e il bianco hanno le ombre azzurrine (come il bianco al sole)
  const hi=hsl2hex(hueTo(h,52,grey?0:6),s*0.95,l+Math.min(0.14,(1-l)*0.3));
  const warm=!grey&&h>=8&&h<=50&&s>0.25;   // pelle, legno, arancio: l'ombra va verso il rosa spento (verso il blu diventerebbe arancione acceso)
  const lo=warm?hsl2hex(hueTo(h,350,10),s*0.62,l*0.78):hsl2hex(hueTo(hs,235,9),Math.min(1,ss*1.02+0.02),l*(l>0.8?0.84:0.76));
  const out=cMix(hsl2hex(hueTo(hs,240,22),Math.min(1,ss*0.85+0.12),l*0.3),PAL.out,0.5);
  r=[hi,hsl2hex(h,s,l),lo,out];
  if(RAMP16.size>600)RAMP16.clear();
  RAMP16.set(key,r);return r;
}
// griglia di lavoro riusata da una figura all'altra
let PSW=0,PSH=0,psGrid=new Int16Array(0),psCol=[];
const psMat=[],psIdx=new Map();
function psShade(ops,st){   // st = numero di valori per rettangolo nella lista (7)
  if(!ops.length)return;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(let i=0;i<ops.length;i+=st){const a=ops[i],b=ops[i+1];if(a<x0)x0=a;if(b<y0)y0=b;if(a+ops[i+2]>x1)x1=a+ops[i+2];if(b+ops[i+3]>y1)y1=b+ops[i+3];}
  x0-=1;y0-=1;x1+=1;y1+=1;   // un pixel di margine per il contorno
  const W=x1-x0,H=y1-y0;if(W<=0||H<=0||W*H>40000)return;
  if(W*H>psGrid.length){psGrid=new Int16Array(W*H*2);psCol=new Array(W*H*2);}
  PSW=W;PSH=H;psGrid.fill(0,0,W*H);psMat.length=1;psIdx.clear();
  // materiali: un indice per colore + profondita' + piatto; il gruppo decide dove nascono ombre e bordi
  for(let i=0;i<ops.length;i+=st){
    const c=ops[i+4],fl=ops[i+5]|0,key=c+'|'+fl;let id=psIdx.get(key);
    if(id===undefined){
      const dep=(fl&3)===1?1:((fl&3)===2?-1:0);
      id=psMat.length;psIdx.set(key,id);psMat.push({r:(fl&PS_FLAT)?null:ramp16(c,dep),c,flat:!!(fl&PS_FLAT),g:ops[i+6]||key,out:(fl&PS_FLAT)?PAL.out:ramp16(c,dep)[3]});
    }
    const ax=ops[i]-x0,ay=ops[i+1]-y0,w=ops[i+2],h=ops[i+3];
    for(let y=ay;y<ay+h;y++){const row=y*W;for(let x=ax;x<ax+w;x++)psGrid[row+x]=id;}
  }
  const at=(x,y)=>x<0||y<0||x>=W||y>=H?0:psGrid[y*W+x];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const id=psGrid[y*W+x],k=y*W+x;
    if(!id){   // vuoto: e' contorno se tocca la figura (solo in croce: gli angoli restano smussati)
      const n=at(x,y-1)||at(x,y+1)||at(x-1,y)||at(x+1,y);
      psCol[k]=n?psMat[n].out:null;continue;
    }
    const m=psMat[id];if(m.flat){psCol[k]=m.c;continue;}
    const g=m.g,up=at(x,y-1),sameG=n=>n&&psMat[n].g===g;
    let t=1;
    if(!at(x+1,y)||!at(x,y+1))t=2;   // bordo in ombra (destra e sotto)
    else if(up&&!sameG(up)&&!psMat[up].flat)t=2;   // ombra portata dalla parte che sta sopra
    else if((!up&&sameG(at(x,y+2)))||(!at(x-1,y)&&sameG(at(x+2,y))))t=0;   // bordo verso la luce, solo dove la parte e' spessa almeno 3 pixel (sugli arti sottili sarebbe una riga di rumore)
    psCol[k]=m.r[t];
  }
  // si disegna a tratti: i pixel vicini dello stesso colore in un solo rettangolo
  for(let y=0;y<H;y++){
    let x=0;const row=y*W;
    while(x<W){const c=psCol[row+x];let e=x+1;while(e<W&&psCol[row+e]===c)e++;if(c){ctx.fillStyle=c;ctx.fillRect(x0+x,y0+y,e-x,1);}x=e;}
  }
}
// sprite a righe di caratteri (come sprDraw, 22-campo-retro.js) colorato con le ombre a 16 bit: le 'o' del disegno diventano il contorno
// automatico dove toccano un colore, e restano linee scure dove sono da sole (le gambe del treppiede). (x,y) = piedi, fl = specchiato
function sprShade(x,y,rows,m,fl){
  const h=rows.length,w=rows[0].length,ox=ri(x)-(w>>1),oy=ri(y)-h+1,ops=[];
  const at=(c,r)=>{if(r<0||r>=h||c<0||c>=w)return '.';const ch=rows[r][fl?w-1-c:c];return ch===undefined?'.':ch;};
  const solid=ch=>ch!=='.'&&ch!=='o'&&!!m[ch];
  for(let r=0;r<h;r++){
    let c=0;
    while(c<w){
      const ch=at(c,r);let e=c+1;while(e<w&&at(e,r)===ch)e++;
      if(solid(ch))ops.push(ox+c,oy+r,e-c,1,m[ch],0,0);
      else if(ch==='o')for(let k=c;k<e;k++)if(!solid(at(k-1,r))&&!solid(at(k+1,r))&&!solid(at(k,r-1))&&!solid(at(k,r+1)))ops.push(ox+k,oy+r,1,1,PAL.out,PS_FLAT,0);
      c=e;
    }
  }
  psShade(ops,7);
}
