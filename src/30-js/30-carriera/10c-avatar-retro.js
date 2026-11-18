/* RITRATTI DEI GIOCATORI - stile «retro 32»: volto a blocchi 32x32 su sfondo blu notte, contorno scuro, maglia di due toni.
   - I giocatori veri dei roster hanno il loro ritratto disegnato a mano (foglio di sprite in 10b-avatar-dati.js): si trovano per nome e cognome,
     in qualunque ordine e senza badare agli accenti.
   - Tutti gli altri (giovani generati, rincalzi, allenatori, staff, giocatrici) vengono disegnati qui con lo stesso stile: l'aspetto (capelli, pelle, barba,
     fascia) e' quello che il giocatore ha anche in campo (look), i piccoli tratti del volto (sopracciglia, bocca, naso, occhiali...) vengono dal nome,
     la maglia dalla squadra. Il disegno e' deterministico: la stessa persona ha sempre lo stesso volto.
   La misura e' 32 (elenchi), 64 (carte) o 96 (anteprima dell'allenatore), cosi' i pixel non si deformano. */
const AVR_SHIRT=[['#3f79b4','#759fc9'],['#758abd','#9cabcf'],['#57ac98','#86c3b5'],['#85ad59','#a7c487'],['#e1a15a','#e9bb88'],['#a17bc1','#bba0d2'],['#c58078','#d5a49e'],['#d15e55','#de8b85']];   // maglia e spalline: stesso ordine di tools/avatar-da-zip.py
const AVR_BG='#182132',AVR_OL='#201d24',AVR_WH='#f4ebd6';
const avKey=s=>String(s||'').normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,' ').trim();
let AVR_IDX=null;
function avIndex(){   // chiave «nome cognome» e «cognome nome» -> numero dello sprite (si costruisce alla prima richiesta)
  if(AVR_IDX)return AVR_IDX;
  AVR_IDX=new Map();
  AVR_NAMES.split('~').forEach((k,i)=>{const [n,c]=k.split('|');AVR_IDX.set(n+' '+c,i);if(!AVR_IDX.has(c+' '+n))AVR_IDX.set(c+' '+n,i);});
  return AVR_IDX;
}
function avFind(p){   // numero dello sprite del giocatore vero, o -1 (i generati e le giocatrici non hanno un ritratto disegnato: possono avere lo stesso nome di uno vero)
  if(p.gen||p.f)return -1;
  const ix=avIndex();
  for(const s of [p.label,p.full,p.name]){const i=ix.get(avKey(s));if(i!==undefined)return i;}
  return -1;
}
// il foglio sta in un solo elemento nascosto della pagina: ogni ritratto ne mostra il suo riquadro (un data URI per ritratto pesava dieci volte tanto)
function avSheet(){
  if(typeof document==='undefined'||document.getElementById('avSheet'))return;
  const h=Math.ceil(AVR_NAMES.split('~').length/AVR_COLS)*32;
  (document.body||document.documentElement).insertAdjacentHTML('beforeend',`<svg id="avSheet" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true"><image id="avImg" x="0" y="0" width="${AVR_COLS*32}" height="${h}" style="image-rendering:pixelated" href="${AVR_SHEET}"/></svg>`);
}
// colore della maglia: quella vera per le squadre del foglio, per le altre una stabile dal nome
const avShirt=club=>AVR_SHIRT[AVR_CLUB[club]!==undefined?AVR_CLUB[club]:hashStr('av|'+(club||'-'))%AVR_SHIRT.length];
function avMix(a,b,k){   // miscela due colori '#rrggbb'
  const x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16),f=(s)=>Math.round(((x>>s)&255)*(1-k)+((y>>s)&255)*k);
  return 'rgb('+f(16)+','+f(8)+','+f(0)+')';
}
// il volto: le righe (y) e le colonne (x) sono quelle dei ritratti disegnati a mano; il capo e' largo 16 (colonne 8-23)
const AVR_SP=[null,null,null,null,[11,20],[10,21],[9,22],[8,23],[8,23],[8,23],[8,23],[8,23],[8,23],[8,23],[8,23],[8,23],[8,23],[8,23],[8,23],[9,22],[9,22],[9,22],[10,21],[10,21]];
function avGrid(L){
  const N=32,G=Array.from({length:N},()=>Array(N).fill(AVR_BG));
  const R=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(i>=0&&i<N&&j>=0&&j<N)G[j][i]=c;},P=(x,y,c)=>R(x,y,1,1,c);
  const O=AVR_OL,sk=L.sk,skG=shade(sk,-0.2),skE=shade(sk,0.12),hr=L.hr,hrL=shade(hr,0.3),hrD=shade(hr,-0.25),[sh,shL]=L.sh;
  const stub=avMix(sk,hr,0.45);
  // capelli dietro la testa (lunghi, coda, ricci)
  if(L.st==='long'){R(5,6,22,19,O);R(6,6,20,19,hr);R(6,8,1,15,hrL);R(25,8,1,16,hrD);}
  if(L.st==='tail'){R(24,9,3,10,hr);R(26,10,1,8,hrD);R(24,9,3,1,L.bn||'#d15e55');}
  if(L.st==='curl'){R(7,2,18,9,O);R(8,3,16,8,hr);}
  // busto e collo
  R(11,24,2,1,O);R(19,24,2,1,O);R(13,24,1,1,skG);R(14,24,4,1,sk);R(18,24,1,1,skG);
  R(8,25,4,1,O);R(20,25,4,1,O);P(12,25,sh);P(19,25,sh);P(13,25,skG);R(14,25,4,1,sk);P(18,25,skG);
  R(4,26,4,1,O);R(8,26,3,1,shL);P(11,26,sh);P(12,26,O);P(13,26,skG);R(14,26,4,1,sk);P(18,26,skG);P(19,26,O);R(20,26,2,1,sh);R(22,26,2,1,shL);R(24,26,4,1,O);
  P(4,27,O);R(5,27,3,1,shL);R(8,27,4,1,sh);P(12,27,O);R(13,27,6,1,sh);P(19,27,O);R(20,27,4,1,sh);R(24,27,3,1,shL);P(27,27,O);
  R(1,28,4,1,O);R(5,28,8,1,sh);R(13,28,6,1,O);R(19,28,8,1,sh);R(27,28,4,1,O);
  R(1,29,30,1,sh);P(1,29,O);P(30,29,O);R(0,30,32,1,sh);R(0,30,2,1,O);R(30,30,2,1,O);R(1,31,30,1,sh);P(0,31,O);P(31,31,O);
  // testa: contorno e pelle (il mento non ha contorno ai lati)
  for(let y=4;y<=23;y++){const [a,b]=AVR_SP[y];
    if(y===4||y===23){R(a,y,b-a+1,1,O);continue;}
    if(y===22){R(a,y,b-a+1,1,sk);continue;}
    P(a,y,O);P(b,y,O);R(a+1,y,b-a-1,1,sk);}
  // ombra a destra e orecchie
  for(let y=11;y<=22;y++)P(y>=19&&y<=20?20:21,y,skG);
  for(let y=12;y<=16;y++){R(7,y,2,1,sk);P(22,y,sk);R(23,y,2,1,skG);}
  P(8,14,skG);P(8,15,skG);   // incavo dell'orecchio
  // fronte: la luce sul lato sinistro
  R(11,8,4,1,skE);
  // capelli sopra la testa
  const cap=(top,fx,sides)=>{   // calotta: contorno, riflesso, laterali e frangia fino a x=fx (riga 8)
    R(11,top,10,1,O);P(10,top+1,hr);R(11,top+1,10,1,hrL);P(21,top+1,hr);R(9,top+2,14,1,hr);
    for(let y=top+3;y<=7;y++)R(8,y,16,1,hr);
    if(fx>=11){R(8,8,3,1,hr);R(11,8,fx-10,1,hrL);R(fx+1,8,23-fx-3,1,sk);R(21,8,3,1,hr);}else{R(8,8,3,1,hr);R(21,8,3,1,hr);}
    R(8,9,3,1,hr);R(21,9,3,1,hr);
    if(sides>0){R(8,10,2,1,hr);R(22,10,2,1,hr);}
    for(let y=top+3;y<=7;y+=2)for(let x=9+(y%3);x<22;x+=5)P(x,y,hrD);   // qualche ciocca piu' scura
  };
  switch(L.st){
    case 'quiff':cap(3,17,1);R(12,2,8,1,O);break;
    case 'crop':R(11,5,10,1,O);R(10,6,12,1,hr);R(9,7,14,1,hr);R(8,8,16,1,hr);R(11,6,10,1,hrL);R(8,9,3,1,hr);R(21,9,3,1,hr);R(11,8,4,1,hrL);R(15,8,6,1,hr);break;
    case 'medium':cap(4,19,1);R(6,8,3,9,hr);R(23,8,3,9,hr);R(6,8,1,9,hrL);P(7,16,hrD);P(24,16,hrD);break;
    case 'long':cap(4,19,1);R(6,9,3,16,hr);R(23,9,3,16,hr);R(7,10,1,13,hrL);R(25,10,1,14,hrD);P(15,8,hrD);P(16,8,hrD);break;
    case 'tail':case 'short':cap(4,14,1);break;
    case 'curl':{R(8,2,16,1,O);for(let y=3;y<=10;y++){const a=y<5?8:7,b=y<5?23:24;R(a,y,b-a+1,1,hr);}
      R(9,8,14,1,hr);R(9,9,14,1,hr);R(7,10,2,1,hr);R(23,10,2,1,hr);R(7,11,2,2,hr);R(23,11,2,2,hr);
      for(let y=3;y<=9;y++)for(let x=8;x<=24;x++)if((x*3+y*5)%7===0&&G[y][x]===hr)G[y][x]=hrL;
      R(11,10,10,1,sk);break;}
    default:{   // rasato: la testa mostra solo l'ombra dei capelli
      R(11,5,10,3,stub);R(10,6,12,1,stub);R(11,5,10,1,skE);R(9,8,2,1,stub);R(21,8,2,1,stub);
      for(let x=11;x<=20;x+=2)P(x,7,sk);}
  }
  if(L.cap){   // berretto blu con visiera
    const c1='#3a4a6a',c2='#2b3550',c3='#5a6c92';
    R(11,4,10,1,O);R(10,5,12,1,c1);R(11,5,10,1,c3);R(9,6,14,2,c1);R(8,8,16,1,c2);R(6,8,2,1,O);R(24,8,2,1,O);R(7,9,18,1,O);P(16,6,AVR_WH);
    R(8,7,16,1,c1);R(9,9,14,1,c2);}
  if(L.band){R(8,8,16,1,L.band);R(8,9,16,1,shade(L.band,-0.28));}
  // sopracciglia
  const br=hrD,ty=L.br===2?10:11;
  if(L.br===1){R(11,ty,3,1,br);R(18,ty,3,1,br);}else{R(12,ty,2,1,br);R(18,ty,2,1,br);}
  if(L.bt){R(12,ty+1,2,1,br);R(18,ty+1,2,1,br);}
  // occhi: bianco, pupilla, bianco
  const ey=L.eye<0?13:12;
  for(const x of [11,18]){R(x,ey,3,L.eye<0?1:2,AVR_WH);P(x+1,ey,O);if(L.eye>=0)P(x+1,ey+1,O);}
  // naso
  P(16,14,skG);P(15,15,skE);P(16,15,skG);P(16,16,skG);R(15,17,L.no?4:3,1,skG);
  // lentiggini
  if(L.fr){for(const [x,y] of [[11,15],[13,16],[19,15],[12,16],[20,16]])P(x,y,skG);}
  // barba: 1 = ombra della barba, 2 = pizzetto, 3 = piena
  if(L.bd===1){for(let y=17;y<=22;y++){const [a,b]=AVR_SP[y];for(let x=a+1;x<b;x++)if((x+y)%2===0&&!(y<=19&&x>=14&&x<=17)&&G[y][x]===sk)G[y][x]=stub;}}
  if(L.bd===2){R(13,18,6,1,hr);R(14,20,4,3,hr);P(14,22,hrD);P(17,22,hrD);R(15,22,2,1,hrD);}
  if(L.bd>=3){for(let y=16;y<=22;y++){const [a,b]=AVR_SP[y];for(let x=Math.max(a,9);x<=Math.min(b,22);x++){const hole=y<=19&&Math.abs(x-15.5)<3.2&&y>=18;if((y>=19||x<=11||x>=20)&&!hole&&G[y][x]!==O)G[y][x]=(x+y)%4===0?hrL:hr;}}
    R(12,18,8,1,hr);R(8,16,1,1,hr);R(23,16,1,1,hr);R(10,22,12,1,hrD);}
  // bocca (0 = linea, 1 = sorriso con i denti, 2 = piccola)
  if(L.bd>=3){R(14,19,4,1,O);if(L.mo===1)R(14,20,4,1,AVR_WH);}
  else if(L.mo===1){R(13,19,6,1,O);R(14,20,4,1,AVR_WH);}
  else if(L.mo===2){R(14,19,4,1,O);P(13,18,skG);P(18,18,skG);}
  else R(14,19,4,1,O);
  // occhiali
  if(L.gl){for(const x of [10,17]){R(x,11,5,1,O);R(x,14,5,1,O);R(x,12,1,2,O);R(x+4,12,1,2,O);}R(15,12,2,1,O);}
  return G;
}
const avClub=p=>p.club||(typeof SV!=='undefined'&&SV&&SV.team)||'';   // squadra di chi e' ritratto: se non si sa, quella della carriera in corso
function avLook(p){
  const lk=p.look||DEF_LOOK,key=(p.full||p.label||p.name||'')+'|'+lk.hair+'|'+lk.skin+'|'+(lk.style|0)+'|'+(lk.beard|0)+'|'+(lk.band||''),r=mulberry32(hashStr('avr|'+key)),f=r;
  const st0=lk.style|0,rn=()=>r();
  let st=['short','medium','long','tail','bald'][st0]||'short';
  if(st==='short'){const q=rn();st=q<0.5?'short':(q<0.72?'quiff':(q<0.9?'crop':'curl'));}
  const dark=parseInt(lk.skin.slice(3,5),16)<0xb8;   // pelle scura: i ricci sono piu' frequenti
  if(st==='crop'&&dark&&rn()<0.4)st='curl';
  const q=rn(),qm=rn();
  return {sk:lk.skin,hr:lk.hair,st,band:lk.band||'',bn:lk.band||'',bd:lk.beard?(rn()<0.2?1:(rn()<0.45?2:3)):0,
    br:Math.floor(rn()*3),bt:rn()<0.25?1:0,mo:qm<0.5?0:(qm<0.78?1:2),no:rn()<0.25?1:0,eye:rn()<0.14?-1:0,
    fr:rn()<0.09&&parseInt(lk.skin.slice(1,3),16)>0xc0?1:0,gl:q<0.06?1:0,cap:q>=0.06&&q<0.1&&st!=='long'?1:0,
    sh:avShirt(avClub(p))};
}
const AVC=new Map();
function avatar(p,px){
  p=p||{};
  const z=px<40?32:(px<72?64:96),n=avFind(p);
  const key=n>=0?'r|'+n+'|'+z:[p.full||p.label||p.name||'',(p.look||DEF_LOOK).hair,(p.look||DEF_LOOK).skin,((p.look||DEF_LOOK).style|0),((p.look||DEF_LOOK).beard|0),((p.look||DEF_LOOK).band||''),avClub(p),z].join('|');
  if(AVC.has(key))return AVC.get(key);
  let out;
  if(n>=0&&typeof document!=='undefined'){
    avSheet();
    out=`<svg class="av" viewBox="${(n%AVR_COLS)*32} ${Math.floor(n/AVR_COLS)*32} 32 32" width="${z}" height="${z}" shape-rendering="crispEdges" aria-hidden="true"><use href="#avImg"/></svg>`;
  }else{
    const G=avGrid(avLook(p));let o='';
    for(let y=0;y<32;y++){let x=0;while(x<32){const c=G[y][x];let w=1;while(x+w<32&&G[y][x+w]===c)w++;o+=`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${c}"/>`;x+=w;}}
    out=`<svg class="av" viewBox="0 0 32 32" width="${z}" height="${z}" shape-rendering="crispEdges" aria-hidden="true">${o}</svg>`;
  }
  if(AVC.size>3000)AVC.clear();
  AVC.set(key,out);return out;
}
