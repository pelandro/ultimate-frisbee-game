/* ---- STADI E PUBBLICO IN PARTITA ----
   Ogni club ha il suo campo. A centrocampo c'e' lo stemma della squadra di casa (in campo neutro il nome della manifestazione); colore e taglio
   del prato vengono dal nome del club di casa; l'impianto va dal campo comunale (recinzione, pochi cartelloni, erba consumata) allo stadio
   (gradoni su due file, bandierine agli angoli). Il pubblico sta nella fascia sopra il campo, quindi non toglie spazio al gioco: quanta gente
   dipende dagli spettatori della partita, i colori dalla squadra di casa, e la squadra ospite ha i suoi tifosi in un angolo. Esultano solo
   i tifosi di chi segna; nelle partite importanti (derby, playoff, finali) ci sono bandiere, uno striscione e coriandoli.
   G.vn = {v:'H'|'A'|'N', home, tier 0-2, lv 0-5 (livello dell'impianto che si vede: 22-campo-retro.js e seguenti), n, cap, fill 0-1, my (quota dei tifosi della squadra ospite; in campo neutro, dei tuoi), big, ev, spon, comp, care}:
   in carriera lo calcola careerVenue (30-carriera/30-stadi.js) a inizio partita, nelle altre modalita' gioca in casa la prima squadra.
   Si azzera in newGame(); tutto deriva da nomi e dati della carriera, quindi lo stesso campo e' sempre uguale. */
function venueNow(){
  if(G.vn)return G.vn;
  const on=!!G.inMatch&&!G.drill,home=on&&G.myName?G.myName:null,h=hashStr('stadio|'+(home||''));
  // fuori dalla carriera l'impianto segue il prestigio del club di casa (un grande club gioca in un grande stadio), con un po' di varieta'
  let lv=0;if(home){let cl=0.5;try{cl=clamp(clubLvl(home),0,1);}catch(e){}lv=clamp(Math.round(cl*4.4+((h>>7)%3)*0.5-0.3),0,5);}
  G.vn=on?{v:'H',home,tier:lv>=4?2:(lv>=2?1:0),lv,n:0,cap:0,fill:0.45+((h>>4)%5)*0.12,my:0.12,big:false,ev:'',spon:'',comp:'',care:-1}
    :(G.drill?{v:'H',home:null,tier:0,lv:0,n:0,cap:0,fill:0.1,my:0.12,big:false,ev:'',spon:'',comp:'',care:-1}
      :{v:'H',home:null,tier:2,lv:5,n:0,cap:0,fill:0.85,my:0.12,big:false,ev:'',spon:'',comp:'',care:-1});   // dietro i menu il campo grande: lo stadio pieno
  return G.vn;
}
const vnSide=V=>V.v==='A'?1:0;   // squadra di casa in campo: 0 tu (blu), 1 l'avversaria (rossa); in campo neutro conta la tua
// ---------- prato ----------
// taglio dell'erba per club: 0 strisce di 4 m, 1 strisce larghe 8 m, 2 a quadri, 3 sintetico (quasi uniforme)
const mowKind=V=>{if(!V.home)return 0;const k=(hashStr('taglio|'+V.home)>>3)%4;return k===3&&fieldKind(V)<2?0:k;};   // il sintetico c'e' solo negli stadi
// contrasto tra le strisce: piu' curato negli stadi e, sul tuo campo, con il Campo di allenamento
function mowK(V){
  if(mowKind(V)===3)return -0.04;
  if(V.care>=0)return V.care>=3?-0.17:(V.care>=1?-0.135:-0.09);
  return [-0.09,-0.11,-0.13,-0.15,-0.16,-0.17][vnLv(V)];
}
const SYN={grass:'#3fa35c',grass2:'#3a9a56',dot:'#56b670',apron:'#2f8a4c',apron2:'#297a44',dim:'#e0f2e2',num:'#ecf8ee'};   // sintetico: verde acceso e uniforme
function venuePal(){
  const V=venueNow(),p=V.home&&mowKind(V)===3?SYN:VENUES[V.home?hashStr('campo|'+V.home)%VENUES.length:0];
  const o=Object.assign({},p),wx=G.wx|0,w=fieldWear(V),fk=fieldKind(V);
  o.turf=cMix(p.grass,'#8f9358',0.25);   // il verde dei ciuffi d'erba sui campi di terra
  if(fk===0){   // terra battuta: sabbiosa, rossa (come i campi da tennis in terra) o grigia secondo il club; niente strisce di taglio, il gesso per le linee
    const D=[['#b4966a','#c8ad80'],['#a9825c','#bf9a72'],['#9d8b6c','#b3a183']][V.home?hashStr('terra|'+V.home)%3:0];
    o.grass=D[0];o.dot=D[1];o.grass2=cShade(D[0],-0.03);
    o.apron=cMix(p.apron,'#7f7c52',0.32);o.apron2=cMix(p.apron2,'#726f49',0.32);
    o.dim='#e6dfcc';o.num='#ece6d6';o.line='#eee8d8';
  }else if(w>0){   // campo consumato: erba secca e spenta, linee e numeri di gesso che si confondono col prato, bordo spelacchiato
    o.grass=cMix(o.grass,'#8f9358',0.34*w);o.dot=cMix(o.dot,'#a3a067',0.3*w);
    o.apron=cMix(o.apron,'#7f7c52',0.3*w);o.apron2=cMix(o.apron2,'#726f49',0.3*w);
    o.dim=cMix(o.dim,o.grass,0.3*w);o.num=cMix(o.num,o.grass,0.34*w);
  }
  if(fk>0){o.line=cMix('#f6f8f2',o.grass,0.2*w);o.grass2=cShade(o.grass,mowK(V)*(1-0.6*w));}   // strisce di taglio deboli dove il prato e' trascurato
  if(wx===1)for(const k of ['grass','grass2','dot','apron','apron2','turf'])o[k]=cMix(cShade(o[k],fk===0&&k!=='turf'&&k.indexOf('apron')<0?-0.22:-0.13),'#24506a',0.1);   // bagnato: piu' scuro e freddo (la terra bagnata molto di piu')
  if(wx===2){   // neve: il prato e' solo piu' chiaro (le strisce restano), fuori dal campo e' tutto bianco
    for(const k of ['grass','grass2','dot','turf'])o[k]=cMix(o[k],'#e6eeea',0.3);
    o.apron='#dde7f1';o.apron2='#cfdbe8';
  }
  return o;
}
function drawMow(y0,H){
  const V=venueNow(),k=mowKind(V),g1=PAL.grass,g2=PAL.grass2;
  if(fieldKind(V)===0){px(sxw(EZ),y0,sxw(FIELD_L-EZ)-sxw(EZ),H,g1);return;}   // terra battuta: niente taglio
  if(k===2){   // a quadri: 8 m per un quarto di larghezza
    const qh=FIELD_W/4;
    for(let i=0;i<8;i++){const a=sxw(EZ+i*8),b=sxw(EZ+i*8+8);for(let j=0;j<4;j++){const c=syw(j*qh),d=syw((j+1)*qh);px(a,c,b-a,d-c,(i+j)%2?g2:g1);}}
    return;
  }
  const w=k===1?8:4;
  for(let i=0;i<64/w;i++){const a=sxw(EZ+i*w),b=sxw(EZ+i*w+w);px(a,y0,b-a,H,i%2?g2:g1);}
}
// prato consumato: drawWear e le pozzanghere stanno in 25-prato-dettagli.js (sprite a pixel fatti una volta per campo)
// ---------- centrocampo ----------
function drawCenterMark(){
  if(!G.inMatch||G.drill)return;
  const V=venueNow(),cx=sxw(FIELD_L/2),cy=syw(MID);
  if(V.ev){   // campo neutro: disco con il nome della manifestazione
    const r=ri(6*S);
    pell(cx,cy,r,r,'rgba(255,210,63,.16)');pring(cx,cy,r,r,'rgba(246,248,242,.45)',1);pring(cx,cy,r-3,r-3,'rgba(246,248,242,.25)',1);
    ptext(V.ev,cx,cy-4,{f:'p',c:'rgba(255,255,255,.6)',o:false});
    return;
  }
  if(V.home){const fk=fieldKind(V);crestPaint(cx,cy,ri(10*S),V.home,(fk===0?0.42:(fk===1?0.55:0.78))*((G.wx|0)===2?0.7:1),fk<2);}   // largo 10 m: a colori negli stadi; sui campi del club e' vernice bianca da righe, sulla terra gesso (25b-scritte-dipinte.js)   // largo 12 m (prima 10); negli stadi lo stemma e' dipinto piu' pieno
}
// ---------- bandierine agli angoli (stadi e partite importanti) ----------
const cornerFlags=()=>{const V=venueNow();return !!G.inMatch&&!G.drill&&(vnLv(V)>=4||V.big);};
function cornerFlag(x,y){
  const V=venueNow(),c=V.v==='N'?PAL.gold:UNI[vnSide(V)].shirt,w=Math.sin(G.tick*4+x*0.1)>0?1:0;
  px(x-1,y-10,3,11,PAL.out);px(x,y-9,1,10,'#f4f4f4');
  px(x+1,y-11+w,6,6,PAL.out);px(x+1,y-10+w,5,4,c);px(x+1,y-10+w,5,1,'rgba(255,255,255,.35)');
}
// ---------- tribuna e pubblico: drawStands, crowdRow e la rete del campo comunale stanno in 23-tribune.js ----------
// partite importanti: striscione dietro la tribuna con il tifo della squadra di casa (o il nome della manifestazione)
function drawStreamer(top){
  const V=venueNow(),hs=vnSide(V),txt=V.ev?V.ev:('FORZA '+(V.home?teamAbbr(V.home):'')),a=sxw(FIELD_L/2-14),b=sxw(FIELD_L/2+14);
  if(b<0||a>VW)return;
  const c=V.ev?'#1d2b53':UNI[hs].shirt,ink=V.ev?PAL.gold:'#ffffff';
  px(a-1,top,b-a+2,9,PAL.out);px(a,top+1,b-a,7,c);px(a,top+1,b-a,1,'rgba(255,255,255,.25)');
  if(b-a>ptw(txt,'t')+4)ptext(txt,(a+b)/2,top+1,{f:'t',c:ink,o:false});
}
// coriandoli sopra la tribuna quando si segna in una partita importante (posizioni dal tempo: niente stato da tenere)
function drawConfetti(top){
  const cs=['#ffd23f','#f4f4f4','#ff6b70','#4fe58f','#7fd8ff',UNI[0].shirt,UNI[1].shirt];
  for(let i=0;i<46;i++){
    const h=hashStr('cor'+i),sp=10+(h%9),x=((h>>4)%(VW+40))-20+Math.sin(G.tick*3+i)*4,y=top-4+((G.tick*sp*6+(h>>9)%60)%48);
    px(x,y,2,1+((h>>6)&1),cs[(h>>2)%cs.length]);
  }
}
