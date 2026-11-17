/* ---- STADI E PUBBLICO IN PARTITA ----
   Ogni club ha il suo campo. A centrocampo c'e' lo stemma della squadra di casa (in campo neutro il nome della manifestazione); colore e taglio
   del prato vengono dal nome del club di casa; l'impianto va dal campo comunale (recinzione, pochi cartelloni, erba consumata) allo stadio
   (gradoni su due file, bandierine agli angoli). Il pubblico sta nella fascia sopra il campo, quindi non toglie spazio al gioco: quanta gente
   dipende dagli spettatori della partita, i colori dalla squadra di casa, e la squadra ospite ha i suoi tifosi in un angolo. Esultano solo
   i tifosi di chi segna; nelle partite importanti (derby, playoff, finali) ci sono bandiere, uno striscione e coriandoli.
   G.vn = {v:'H'|'A'|'N', home, tier 0-2, n, cap, fill 0-1, my (quota dei tifosi della squadra ospite; in campo neutro, dei tuoi), big, ev, spon, comp, care}:
   in carriera lo calcola careerVenue (30-carriera/30-stadi.js) a inizio partita, nelle altre modalita' gioca in casa la prima squadra.
   Si azzera in newGame(); tutto deriva da nomi e dati della carriera, quindi lo stesso campo e' sempre uguale. */
function venueNow(){
  if(G.vn)return G.vn;
  const on=!!G.inMatch&&!G.drill,home=on&&G.myName?G.myName:null,h=hashStr('stadio|'+(home||''));
  G.vn=on?{v:'H',home,tier:h%3,n:0,cap:0,fill:0.45+((h>>4)%5)*0.12,my:0.12,big:false,ev:'',spon:'',comp:'',care:-1}
    :{v:'H',home:null,tier:0,n:0,cap:0,fill:G.drill?0.1:0.3,my:0.12,big:false,ev:'',spon:'',comp:'',care:-1};
  return G.vn;
}
const vnSide=V=>V.v==='A'?1:0;   // squadra di casa in campo: 0 tu (blu), 1 l'avversaria (rossa); in campo neutro conta la tua
// ---------- prato ----------
// taglio dell'erba per club: 0 strisce di 4 m, 1 strisce larghe 8 m, 2 a quadri, 3 sintetico (quasi uniforme)
const mowKind=V=>V.home?(hashStr('taglio|'+V.home)>>3)%4:0;
// contrasto tra le strisce: piu' curato negli stadi e, sul tuo campo, con il Campo di allenamento
function mowK(V){
  if(mowKind(V)===3)return -0.03;
  if(V.care>=0)return V.care>=3?-0.1:(V.care>=1?-0.075:-0.045);
  return [-0.05,-0.075,-0.09][V.tier|0];
}
const SYN={grass:'#6fb05e',grass2:'#6aa95a',dot:'#86c376',apron:'#5b8f4e',apron2:'#527f46',dim:'#9fd08f',num:'#93c483'};   // sintetico: verde acceso e uniforme
function venuePal(){
  const V=venueNow(),p=V.home&&mowKind(V)===3?SYN:VENUES[V.home?hashStr('campo|'+V.home)%VENUES.length:0];
  return Object.assign({},p,{grass2:shade(p.grass,mowK(V))});
}
function drawMow(y0,H){
  const V=venueNow(),k=mowKind(V),g1=PAL.grass,g2=PAL.grass2;
  if(k===2){   // a quadri: 8 m per un quarto di larghezza
    const qh=FIELD_W/4;
    for(let i=0;i<8;i++){const a=sxw(EZ+i*8),b=sxw(EZ+i*8+8);for(let j=0;j<4;j++){const c=syw(j*qh),d=syw((j+1)*qh);px(a,c,b-a,d-c,(i+j)%2?g2:g1);}}
    return;
  }
  const w=k===1?8:4;
  for(let i=0;i<64/w;i++){const a=sxw(EZ+i*w),b=sxw(EZ+i*w+w);px(a,y0,b-a,H,i%2?g2:g1);}
}
// campi comunali (e il tuo, senza Campo di allenamento): chiazze d'erba consumata dove si gioca di piu'
function drawWear(){
  const V=venueNow();if(!(V.care===0||(V.care<0&&V.tier===0&&V.home)))return;
  const h=hashStr('usura|'+V.home),spots=[[FIELD_L/2,MID,7,4],[EZ+3,MID,3,6],[FIELD_L-EZ-3,MID,3,6],[EZ+18,MID,3,2],[FIELD_L-EZ-18,MID,3,2]];
  for(let i=0;i<spots.length;i++){
    const s=spots[i],dx=((h>>(i*3))%5-2)*0.8,dy=((h>>(i*3+2))%5-2)*0.8;
    pell(sxw(s[0]+dx),syw(s[1]+dy),ri(s[2]*S/2),ri(s[3]*S/2),'rgba(176,156,104,.18)');
    pell(sxw(s[0]+dx*0.5),syw(s[1]+dy*0.5),ri(s[2]*S/4),ri(s[3]*S/4),'rgba(160,136,88,.14)');
  }
}
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
  if(V.home)crestPx(cx,cy,ri(10*S),V.home,0.3);
}
// ---------- bandierine agli angoli (stadi e partite importanti) ----------
const cornerFlags=()=>{const V=venueNow();return !!G.inMatch&&!G.drill&&(V.tier>=2||V.big);};
function cornerFlag(x,y){
  const V=venueNow(),c=V.v==='N'?PAL.gold:UNI[vnSide(V)].shirt,w=Math.sin(G.tick*4+x*0.1)>0?1:0;
  px(x-1,y-10,3,11,PAL.out);px(x,y-9,1,10,'#f4f4f4');
  px(x+1,y-11+w,6,6,PAL.out);px(x+1,y-10+w,5,4,c);px(x+1,y-10+w,5,1,'rgba(255,255,255,.35)');
}
// ---------- tribuna e pubblico (fascia sopra il campo) ----------
const STEP_C=['#5d6478','#6c7389'];
// la fascia sta subito sopra la linea laterale: e' la parte del bordo che resta visibile sotto la barra in alto su tutti gli schermi
function drawStands(y0){
  const V=venueNow(),top=y0-16;
  if(V.tier>=1){   // gradoni: due file di cemento con il bordo chiaro
    px(0,top,VW,7,STEP_C[0]);px(0,top+7,VW,7,STEP_C[1]);px(0,top+7,VW,1,'rgba(255,255,255,.18)');px(0,top+13,VW,1,'rgba(0,0,0,.25)');
  }else px(0,top,VW,14,PAL.apron2);
  if(V.tier>=2)crowdRow(y0-9,1,V);   // fila di dietro: solo negli stadi
  crowdRow(y0-3,0,V);
  if(V.tier===0)drawFence(top);
  if(V.big)drawStreamer(top-2);   // lo striscione lo tengono i tifosi (o e' appeso alla rete): sta dietro ai cartelloni, appena sopra
  drawTopBoards(y0);   // cartelloni davanti alla tribuna, con i varchi per vedere il pubblico (18-cartelloni.js)
  if(V.big&&G.mode==='banner')drawConfetti(top);
}
function crowdRow(yBase,row,V){
  const step=1.55,k0=Math.floor((toWorld(0,0).x-2)/step),k1=Math.ceil((toWorld(VW,0).x+2)/step),bt=G.mode==='banner'&&G.banner?G.banner.team:-9;
  const hs=vnSide(V),seats=V.tier>=1,fill=V.fill*(row?0.85:1),seatC=seats?shade(UNI[hs].shirt,-0.35):'';
  // i tifosi ospiti (quota V.my) stanno in un angolo, in fondo a destra; in campo neutro le due tifoserie si dividono la tribuna (i tuoi a sinistra)
  const away=1-hs,split=V.v==='N'?-10+(FIELD_L+20)*V.my:FIELD_L+10-clamp(V.my*1.6,0.06,0.6)*(FIELD_L+20);
  for(let k=k0;k<=k1;k++){
    const h=hashStr('fan'+k+'|'+row),wx=k*step+((h>>3)%5)*0.12,x=sxw(wx),y=yBase;
    if((h%1000)/1000>=fill){   // posto vuoto: seggiolino in tribuna, niente sul campo comunale
      if(seats){px(x-2,y-3,5,3,PAL.out);px(x-1,y-2,3,2,seatC);}
      continue;
    }
    let t;
    if(V.v==='N')t=wx<split?0:1;else t=wx>=split?away:hs;
    if(((h>>11)%10)<3)t=-1;   // non tutti vestono i colori
    const hop=bt!==-9?((t===bt||(t<0&&h%4===0))&&Math.sin(G.tick*11+h)>0.2?2:0):((Math.sin(G.tick*1.3+h)>0.96)?1:0),yy=y-hop;
    const shirt=t>=0?UNI[t].shirt:FAN_C[(h>>2)%8];
    px(x-2,yy-8,5,9,PAL.out);px(x-1,yy-9,3,1,PAL.out);
    px(x-1,yy-8,3,3,FAN_S[h%4]);px(x-1,yy-8,3,1,['#2b1b12','#7a4a21','#101010','#c9964a','#8a2f1c'][(h>>5)%5]);
    px(x-1,yy-5,3,4,shirt);
    if(bt!==-9&&hop&&t===bt){px(x-2,yy-8,1,2,FAN_S[h%4]);px(x+2,yy-8,1,2,FAN_S[h%4]);}
    if(V.big&&t>=0&&h%9===0){   // bandiera che sventola
      const w=Math.sin(G.tick*5+h)>0?1:0;
      px(x+2,yy-15,1,8,PAL.out);px(x+3,yy-15+w,4,3,UNI[t].shirt);px(x+3,yy-14+w,4,1,'#f4f4f4');
    }
  }
}
// campo comunale: rete metallica davanti al pubblico (trasparente: la gente si vede lo stesso)
function drawFence(top){
  const k0=Math.floor(toWorld(0,0).x/3)-1,k1=Math.ceil(toWorld(VW,0).x/3)+1;
  px(0,top+2,VW,1,'rgba(40,46,60,.55)');px(0,top+13,VW,1,'rgba(40,46,60,.55)');
  for(let k=k0;k<=k1;k++){const x=sxw(k*3);px(x,top+1,1,13,'rgba(60,66,82,.75)');}
  for(let x=-(((CX%4)+4)%4);x<VW;x+=4)for(let y=top+4;y<top+13;y+=3)px(x+((y>>1)&1)*2,y,1,1,'rgba(220,226,236,.18)');
}
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
