/* ---- CAMPO IN STILE RETRO ARCADE: strumenti, livello dell'impianto, prato sotto la pioggia e la neve ----
   Il campo e' disegnato come nei giochi sportivi a 16 bit: prato saturo con le strisce di taglio ben visibili, linee bianche nette, mete piene
   nel colore della squadra. Tutto attorno al campo (23-tribune.js in alto, 24-bordocampo-persone.js in basso e dietro le mete) cambia con il
   livello dell'impianto G.vn.lv (0 campo comunale ... 5 grande stadio) e con il tempo (G.wx: 1 pioggia, 2 neve). Il campo stesso ha tre tipi (fieldKind):
   terra battuta ai livelli 0-1, prato consumato ai livelli 2-3 (fieldWear: colori spenti, strisce deboli, chiazze di terra, linee di gesso, mete sbiadite),
   prato curato negli stadi. Con la neve ogni campo diventa solo un po' piu' chiaro.
   Le inquadrature non cambiano: tutto sta nelle fasce gia' visibili attorno al campo. Niente di salvato: deriva da nomi e dati della partita. */
// livello 0-5 (i campi senza lv, per esempio quelli delle prove, lo ricavano dal tier) e tier 0-2 che ne deriva: cartelloni, seggiolini, bandierine
const vnLv=V=>V.lv!==undefined&&V.lv!==null?clamp(V.lv|0,0,5):[0,2,4][clamp(V.tier|0,0,2)];
const vnTier=V=>{const l=vnLv(V);return l>=4?2:(l>=2?1:0);};
// paese del campo di casa (IT, US, BE, FR, DE, UK; EU in campo neutro agli EUCF): alberi, tetti, bandiere, tribune in alluminio negli USA
function vnLand(V){
  if(V.land)return V.land;
  let l='IT';
  try{
    if(V.home)l=clubLega(V.home);
    else if(V.ev==='NATIONALS')l='US';
    else if(V.ev==='EUCF')l='EU';
    else if(typeof SV!=='undefined'&&SV&&SV.lk)l=SV.lk;
  }catch(e){}
  if(l==='IW')l='IT';
  if(l==='UW')l='US';
  V.land=l;return l;
}
// ---------- colori ----------
function cRgb(h){
  h=String(h);
  if(h[0]==='#'){const s=h.length===4?h.slice(1).split('').map(c=>c+c).join(''):h.slice(1,7),n=parseInt(s,16);return [n>>16,(n>>8)&255,n&255];}
  const m=h.match(/[\d.]+/g);return m?[+m[0],+m[1],+m[2]]:[0,0,0];
}
const cHex=a=>'#'+a.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
const cMixMemo=new Map();   // i colori del pubblico si ricalcolano a ogni fotogramma: si tengono da parte
const cMix=(a,b,k)=>{const key=a+b+k;let r=cMixMemo.get(key);if(r===undefined){const A=cRgb(a),B=cRgb(b);r=cHex(A.map((v,i)=>v+(B[i]-v)*k));if(cMixMemo.size>4000)cMixMemo.clear();cMixMemo.set(key,r);}return r;};
const cShade=(a,k)=>cMix(a,k<0?'#000000':'#ffffff',Math.abs(k));
const cLum=a=>{const c=cRgb(a);return (0.299*c[0]+0.587*c[1]+0.114*c[2])/255;};
// numero pseudo-casuale da due interi: posti in tribuna, ciuffi d'erba, pozzanghere (piu' veloce di hashStr, che lavora sui testi)
function ihash(a,b){let h=(Math.imul(a|0,374761393)+Math.imul((b|0)+7,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0;}
// ---------- sprite a pixel ----------
// righe di caratteri, '.' trasparente; m = colore per carattere; (x,y) = piedi (al centro, in basso); fl = specchiato. Le righe uguali si disegnano a tratti
function sprDraw(x,y,rows,m,fl){
  const h=rows.length,w=rows[0].length,ox=ri(x)-(w>>1),oy=ri(y)-h+1;
  for(let r=0;r<h;r++){
    const row=rows[r];let c=0;
    while(c<w){
      const ch=row[fl?w-1-c:c];let e=c+1;
      while(e<w&&row[fl?w-1-e:e]===ch)e++;
      if(ch!=='.'){const col=m[ch];if(col){ctx.fillStyle=col;ctx.fillRect(ox+c,oy+r,e-c,1);}}
      c=e;
    }
  }
}
// cifre 3x5 per i segnapunti a cartellini
const DIG35=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001010010010','111101111101111','111101111001111'];
function digits35(n,x,y,c){
  const s=String(n);
  for(let i=0;i<s.length;i++){const d=DIG35[+s[i]]||DIG35[0];for(let k=0;k<15;k++)if(d[k]==='1')px(x+i*4+k%3,y+((k/3)|0),1,1,c);}
  return s.length*4-1;
}
// ---------- trame del prato ----------
// ciuffi d'erba sparsi (al posto della griglia di puntini): piu' fitti sui campi poveri, quasi assenti negli stadi e sul sintetico
const tuftPats=new Map();
function tuftPattern(lv,w){
  w=w||0;const k=PAL.grass+'|'+lv+'|'+ri(w*10);let p=tuftPats.get(k);if(p)return p;
  const c=document.createElement('canvas');c.width=c.height=24;const g=c.getContext('2d'),n=[16,13,10,8,6,5][lv]||8,lt=PAL.dot,dk=cShade(PAL.grass,-0.16);
  for(let i=0;i<n;i++){const h=ihash(i,lv*31+3),x=h%24,y=(h>>>8)%24;g.fillStyle=i%3?lt:dk;g.fillRect(x,y,1,i%3?2:1);if(i%4===0){g.fillStyle=lt;g.fillRect((x+1)%24,(y+1)%24,1,1);}}
  const nd=ri(w*9);for(let i=0;i<nd;i++){const h=ihash(i,977),x=h%24,y=(h>>>8)%24;g.fillStyle=i%2?'#8f7a52':'#a8925f';g.fillRect(x,y,(h>>>16)%3?1:2,1);}   // terra che si vede tra l'erba
  if(tuftPats.size>40)tuftPats.clear();
  p=ctx.createPattern(c,'repeat');tuftPats.set(k,p);return p;
}
// TIPO DI CAMPO secondo l'impianto: 0 terra battuta con qualche ciuffo d'erba e senza linee delle distanze (livelli 0-1), 1 prato consumato senza i numeri
// (livelli 2-3), 2 prato curato con linee e numeri (livelli 4-5). Le prove (G.drill) si fanno su un prato consumato, con i numeri che aiutano a misurare i lanci
const fieldKind=V=>{if(G.drill)return 1;const l=vnLv(V);return l<=1?0:(l<=3?1:2);};
const careK=V=>V.care>=0?clamp(V.care|0,0,5)/5:-1;   // il Campo di allenamento, sul tuo campo: migliora un po' il prato dentro il suo tipo
// quanto e' consumato il prato (0 perfetto, 1 del tutto): terra e prato consumato lo sono sempre molto, gli stadi quasi mai
const WEAR_LV=[1,1,1,0.85,0.05,0];
function fieldWear(V){
  if(V.vip)return 0;   // lo Stadio d'Oro e' sempre perfetto
  const k=fieldKind(V),c=careK(V);
  if(k===0)return 1;
  if(k===1)return c<0?WEAR_LV[clamp(vnLv(V),2,3)]:1-0.3*c;
  return c<0?WEAR_LV[vnLv(V)]:0.08*(1-c);
}
// sui campi di terra, quanti ciuffi d'erba restano (0-1, in dirtPattern): pochi al campo comunale, un po' di piu' al livello 1 e con il Campo di allenamento
const turfCover=V=>{const c=careK(V),b=vnLv(V)===0?0.3:0.42;return c<0?b:b+0.25*c;};
// terra battuta: granelli chiari, puntini scuri, sassolini con l'ombra e qualche filo d'erba, a caso ma senza ripetizioni visibili
const dirtPats=new Map();
function dirtPattern(cover){
  const k=PAL.grass+'|'+ri(cover*20);let p=dirtPats.get(k);if(p)return p;
  const c=document.createElement('canvas');c.width=c.height=40;const g=c.getContext('2d'),put=(x,y,col)=>{g.fillStyle=col;g.fillRect(((x%40)+40)%40,((y%40)+40)%40,1,1);};
  const lt=PAL.dot,dk=cShade(PAL.grass,-0.16),dk2=cShade(PAL.grass,-0.08),tu=PAL.turf||'#5a8a3c',tu2=cShade(PAL.turf||'#5a8a3c',0.18);
  for(let i=0;i<70;i++){const h=ihash(i,515),x=h%40,y=(h>>>8)%40;put(x,y,i%3?lt:dk2);if(i%7===0)put(x+1,y,lt);}
  for(let i=0;i<34;i++){const h=ihash(i,616),x=h%40,y=(h>>>8)%40;put(x,y,dk);}
  for(let i=0;i<7;i++){const h=ihash(i,717),x=h%40,y=(h>>>8)%40;put(x,y,'#ddd2b8');put(x+1,y,'#cfc3a6');put(x,y+1,dk);put(x+1,y+1,dk);}   // sassolini
  for(let i=0;i<ri(10*cover);i++){const h=ihash(i,818),x=h%40,y=(h>>>8)%40;put(x,y,tu);put(x,y-1,tu2);if(h&1024)put(x+1,y,tu);}   // fili d'erba
  if(dirtPats.size>20)dirtPats.clear();
  p=ctx.createPattern(c,'repeat');dirtPats.set(k,p);return p;
}
// neve fuori dal campo: bianco uniforme con qualche granello (niente chiazze)
let snowTex=null;
function snowTexture(){
  if(snowTex)return snowTex;
  const c=document.createElement('canvas');c.width=c.height=24;const g=c.getContext('2d');
  for(let i=0;i<14;i++){const h=ihash(i,4242),x=h%24,y=(h>>>8)%24;g.fillStyle=i%3?'#ccd8e6':'#ffffff';g.fillRect(x,y,i%5?1:2,1);}
  return snowTex=ctx.createPattern(c,'repeat');
}
// riempie un rettangolo dello schermo con una trama agganciata al mondo (non scorre rispetto al campo quando la camera si muove)
function patFill(p,x,y,w,h,sz){   // sz = lato della trama in pixel
  if(!p||w<=0||h<=0)return;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  ctx.translate(-(((CX%sz)+sz)%sz),((OYi%sz)+sz)%sz-sz);ctx.fillStyle=p;ctx.fillRect(x-sz,y-sz,w+3*sz,h+3*sz);ctx.restore();
}
// ---------- sole: l'ombra delle tribune sul bordo lontano del campo (solo con il bel tempo, negli impianti con tribuna) ----------
function standShadow(y0,x0,x1){
  const V=venueNow(),lv=vnLv(V);if((G.wx|0)||lv<3)return;
  const d=ri((lv>=5?2.4:(lv>=4?1.8:1.1))*S);
  px(0,y0,VW,d,'rgba(16,28,52,.13)');
  for(let x=-(((CX%6)+6)%6);x<VW;x+=6)px(x+((ihash(Math.floor((x+CX)/6),1)%3)),y0+d,3,1,'rgba(16,28,52,.08)');   // bordo dell'ombra sfrangiato: il profilo della tribuna
}
