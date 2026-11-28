/* ---- RICONOSCIMENTI: i badge di tutte le carriere, nel menu iniziale ----
   Un badge per ogni campionato vinto (ogni livello di ogni campionato: Italia, Italia Women, Belgio, Francia, Germania, Regno Unito, USA, USA Women) e per
   il podio del campionato europeo (EUCF: 3°, 2°, 1°, con qualsiasi squadra), uno per difficolta' della carriera (Facile, Medio, Difficile, Estrema).
   Valgono per il dispositivo, non per una carriera: stanno in localStorage (RIC_KEY), con la squadra e la stagione in cui sono arrivati. La difficolta' e'
   quella della carriera, che si sceglie all'inizio e non cambia piu' (12-allenatore-scelta.js). Si vince un livello chiudendo primi (nel livello piu' alto:
   vincendo i playoff, come per lo scudetto; negli USA: vincendo i Nationals).
   I disegni sono pixel art generata qui (badgeSVG). Ogni campionato ha le sue forme e i colori della sua bandiera nel nastro; piu' il livello e' alto, piu'
   la forma e' ricca (corone, merli, stelle); piu' la difficolta' e' alta, piu' il materiale e' prezioso (bronzo, argento, oro, cristallo) e piu' ornamenti
   ha (cartiglio dal Medio, alloro dal Difficile, gemma, alone e scintille in Estrema). Chiavi: per l'Italia C, B, A; per gli altri il valore di SV.sr
   (lnKey: 'BE.N1', 'IW.A'..., 'U', 'UW'); per l'EUCF E1, E2, E3. */
const RIC_KEY='ultimate-riconoscimenti';
// sh = forma, ch = segno inciso, rb = colori del nastro (lettere della tavolozza di badgeSVG), hang = come e' appeso: bar nastrino a righe
// verticali (Italia, Belgio), hbar a righe orizzontali (Germania), uj bandiera britannica, us bandiera americana, niente se sta in piedi
const RIC_EU={k:'EU',name:'EUCF',full:'Campionato europeo per club',rb:['b','y'],comps:[
  {k:'E1',name:'EUCF · Campione',short:'Campione',txt:'Vinci il campionato europeo (EUCF)'},
  {k:'E2',name:'EUCF · 2° posto',short:'2° posto',txt:'Arriva in finale al campionato europeo (EUCF)'},
  {k:'E3',name:'EUCF · 3° posto',short:'3° posto',txt:'Vinci la finale per il 3° posto al campionato europeo (EUCF)'}]};
const ricC=(k,name,short,txt,sh,ch)=>({k,name,short,txt,sh,ch});
const RIC_LG=[
  {k:'IT',name:'Italia',rb:['v','w','x'],hang:'bar',comps:[ricC('A','Serie A','Serie A','Vinci lo scudetto in Serie A','crown','A'),ricC('B','Serie B','Serie B','Vinci la Serie B','shield','B'),ricC('C','Serie C','Serie C','Vinci la Serie C','medal','C')]},
  {k:'IW',name:'Italia Women',rb:['v','w','x'],hang:'bar',comps:[ricC('IW.A','Italia Women · Serie A','Serie A','Vinci lo scudetto Women in Serie A','gemCrown','A'),ricC('IW.B','Italia Women · Serie B','Serie B','Vinci la Serie B Women','gem','B')]},
  {k:'BE',name:'Belgio',rb:['k','y','x'],hang:'bar',comps:[ricC('BE.N1','Belgio · N1','N1','Vinci il campionato belga (N1)','octRim','1'),ricC('BE.N2','Belgio · N2','N2','Chiudi prima la N2 belga','oct','2'),ricC('BE.N3','Belgio · N3','N3','Chiudi prima la N3 belga','hex','3')]},
  {k:'FR',name:'Francia',rb:['b','w','x'],comps:[ricC('FR.N1','Francia · N1','N1','Vinci il campionato francese (N1)','cocarde','1'),ricC('FR.N2','Francia · N2','N2','Chiudi prima la N2 francese','ecu','2')]},
  {k:'DE',name:'Germania',rb:['k','x','y'],hang:'hbar',comps:[ricC('DE.D1','Germania · 1. Liga','1. Liga','Vinci il campionato tedesco (1. Liga)','castle','1'),ricC('DE.D2','Germania · 2. Liga','2. Liga','Chiudi prima la 2. Liga','pent','2'),ricC('DE.D3','Germania · 3. Liga','3. Liga','Chiudi prima la 3. Liga','square','3')]},
  {k:'UK',name:'Regno Unito',rb:['n','w','x'],hang:'uj',comps:[ricC('UK.N1','Regno Unito · Nationals','Nationals','Vinci i Nationals britannici','salver','N')]},
  {k:'US',name:'USA',rb:['x','w','n'],comps:[ricC('U','USA · Nationals','Nationals','Vinci i Nationals USA','ring','')]},
  {k:'UW',name:'USA Women',rb:['x','w','n'],hang:'us',comps:[ricC('UW','USA Women · Nationals','Nationals','Vinci i Nationals USA Women','star','W')]}];
const RIC_COMP=RIC_LG.flatMap(l=>l.comps.map(c=>Object.assign({lg:l.k},c))).concat(RIC_EU.comps.map((c,i)=>Object.assign({lg:'EU',sh:'cup',ch:String(i+1)},c)));
// Ultimate Team · Sfide online: i primi 10 della classifica di un mese (04-ut-online.js). Non dipendono dalla difficolta': il materiale e gli
// ornamenti sono fissi (mat, lv) e lo stesso badge si puo' vincere piu' volte (si conta quante)
const RIC_UT={k:'UT',name:'Ultimate Team',rb:['b','y'],hang:'v',comps:[
  {k:'UT1',name:'Sfide online · 1° del mese',short:'1° posto',txt:'Chiudi un mese al 1° posto della classifica di Sfide online',ch:'1',mat:'hard',lv:3,glow:1},
  {k:'UT2',name:'Sfide online · 2° del mese',short:'2° posto',txt:'Chiudi un mese al 2° posto della classifica di Sfide online',ch:'2',mat:'med',lv:2},
  {k:'UT3',name:'Sfide online · 3° del mese',short:'3° posto',txt:'Chiudi un mese al 3° posto della classifica di Sfide online',ch:'3',mat:'easy',lv:1},
  {k:'UT10',name:'Sfide online · primi 10 del mese',short:'Primi 10',txt:'Chiudi un mese tra il 4° e il 10° posto della classifica di Sfide online',ch:'10',mat:'blu',lv:0}].map(c=>Object.assign({lg:'UT',sh:'disc'},c))};
// Altro: badge che assegna l'amministratore a un profilo online (35-premi.js). Materiale e ornamenti fissi, uno per profilo
const RIC_AL={k:'AL',name:'Altro',rb:['y','k'],hang:'v',comps:[
  {k:'SOST',name:'Sostenitore',short:'Sostenitore',txt:'Per chi ha sostenuto il gioco con una donazione di almeno 5 euro',sh:'heart',ch:'',mat:'hard',lv:2,glow:1},
  {k:'PRIMA',name:'Prima settimana',short:'Prima settimana',txt:'Per chi ha scaricato il gioco nella sua prima settimana',sh:'burst',ch:'1',mat:'xtr',lv:2}].map(c=>Object.assign({lg:'AL'},c))};
const RIC_BY={};for(const c of RIC_COMP.concat(RIC_UT.comps,RIC_AL.comps))RIC_BY[c.k]=c;
const RIC_DIFF=['easy','med','hard','xtr'];
// materiali per difficolta': M metallo, L luce, D ombra, O contorno
const RIC_MAT={easy:{M:'#c27a3a',L:'#eda66a',D:'#87491d',O:'#3b1f0c'},med:{M:'#b9c4d3',L:'#f2f6fb',D:'#77849a',O:'#262d3b'},
  hard:{M:'#f2b42e',L:'#ffe680',D:'#b0721a',O:'#4a2a06'},xtr:{M:'#8fdcff',L:'#ffffff',D:'#7a62e0',O:'#1d1648'},blu:{M:'#4f86cf',L:'#bfdcff',D:'#244a86',O:'#0f2240'}};
// poligono regolare di n lati (raggio r, primo vertice all'angolo a0 in gradi) e prova "dentro"
const ricPoly=(n,cx,cy,r,a0)=>[...Array(n)].map((_,i)=>{const t=(a0+i*360/n)*Math.PI/180;return [cx+r*Math.cos(t),cy+r*Math.sin(t)];});
function ricIn(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;}
const ricStar=(cx,cy,R,r)=>[...Array(10)].map((_,i)=>{const t=(-90+i*36)*Math.PI/180,q=i%2?r:R;return [cx+q*Math.cos(t),cy+q*Math.sin(t)];});
// bandiera britannica (w x h a partire da x0,y0): fondo blu, croci di Sant'Andrea bianche, croce bianca e rossa al centro
function ricUJ(set,x0,y0,w,h){
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const u=x/(w-1),v=y/(h-1),d1=Math.abs(u-v)*w,d2=Math.abs(u-(1-v))*w,cx=Math.abs(x-(w-1)/2),cy=Math.abs(y-(h-1)/2);
    let c='n';if(d1<1.6||d2<1.6)c='w';if((d1<0.6&&u<0.5)||(d2<0.6&&u>0.5))c='x';if(cx<2.6||cy<1.6)c='w';if(cx<1.1||cy<0.6)c='x';
    set(x0+x,y0+y,c);
  }
}
// bandiera americana: righe rosse e bianche, riquadro blu con le stelle (punti bianchi) in alto a sinistra
function ricUS(set,x0,y0,w,h){
  const cw=Math.round(w*0.45),ch=Math.round(h*0.55);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)set(x0+x,y0+y,x<cw&&y<ch?((x+y)%2===1&&x>0&&y>0&&x<cw-1&&y<ch-1?'W':'n'):(y%2?'w':'x'));
}
function badgeGrid(comp,diff){
  const N=40,g=[...Array(N)].map(()=>Array(N).fill('.')),C=RIC_BY[comp]||RIC_BY.C,sh=C.sh;
  const set=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<N&&y<N)g[y][x]=c;};
  const get=(x,y)=>x>=0&&y>=0&&x<N&&y<N?g[y][x]:'.';
  const lv=C.lv!==undefined?C.lv:RIC_DIFF.indexOf(diff),rank=sh==='cup'?4-(+C.ch):0;   // rank delle coppe: 1 terzo, 2 secondo, 3 primo
  const fill=(test,c)=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(test(x+0.5,y+0.5))g[y][x]=c;};
  const LG=RIC_LG.find(l=>l.k===C.lg)||(C.lg==='UT'?RIC_UT:(C.lg==='AL'?RIC_AL:RIC_EU)),RB=LG.rb;
  // corona a tre punte (Serie A, N1 belga, Serie A Women): base da y0 a y0+4, punte sopra
  const crown=(y0,x0,x1)=>{fill((x,y)=>y>=y0&&y<y0+4&&x>=x0&&x<=x1,'M');for(const cx of [x0+1,(x0+x1)/2,x1-1])fill((x,y)=>y>=y0-4.5&&y<y0+0.1&&Math.abs(x-cx)<=(y-y0+4.5)*0.55+0.3,'M');};
  // ALLORO dal Difficile: due rami che salgono dal basso ai lati della figura, foglie a coppie lungo il ramo (in Estrema di cristallo)
  if(lv>=2)for(const sd of [-1,1]){
    for(let a=28;a<=150;a+=4){const t=a*Math.PI/180;set(20+sd*15*Math.sin(t),22+14*Math.cos(t),'g');}   // il ramo
    for(let a=34;a<=146;a+=14){const t=a*Math.PI/180,x=20+sd*15*Math.sin(t),y=22+14*Math.cos(t);   // le foglie: una fuori e una dentro, verso l'alto
      for(const [dx,dy,c] of [[sd,-1,'G'],[sd*2,-2,'G'],[sd*2,-1,'g'],[-sd,-1,'G'],[-sd*2,-2,'G']])set(x+dx,y+dy,c);}
  }
  // BANDIERA in alto: nastrino a righe verticali (Italia, Belgio) o orizzontali (Germania), bandiera britannica o americana
  const hang=LG.hang;
  if(hang==='v'){for(let y=0;y<10;y++){const x1=8+y*0.75,x2=31-y*0.75;for(let i=0;i<4;i++){set(x1+i,y,RB[i>>1]);set(x2-i,y,RB[i>>1]);}}}   // nastro a V (Ultimate Team)
  else if(hang==='bar')for(let y=0;y<11;y++)for(let x=13;x<=26;x++)set(x,y,RB[Math.floor((x-13)/14*3)]);
  else if(hang==='hbar')for(let y=0;y<6;y++)for(let x=11;x<=28;x++)set(x,y,RB[y>>1]);
  else if(hang==='uj')ricUJ(set,10,0,20,8);
  else if(hang==='us')ricUS(set,11,0,18,10);
  // FIGURA; cy = riga del segno inciso (alto 7)
  let cy=17;
  if(sh==='medal'){fill((x,y)=>Math.hypot(x-20,y-21)<=9.6,'M');cy=18;}
  else if(sh==='shield'||sh==='crown'){
    const top=sh==='crown'?11:9;fill((x,y)=>{if(x<10.5||x>29.5||y<top||y>31.5)return false;if(y<24)return true;const t=(y-24)/7.5;return Math.abs(x-20)<=9.5*(1-t*t)+0.4;},'M');
    if(sh==='crown')crown(7.5,11.5,28.5);cy=sh==='crown'?17:16;
  }else if(sh==='gem'){fill((x,y)=>Math.abs(x-20)/10.5+Math.abs(y-20.5)/13<=1,'M');cy=17;}
  else if(sh==='gemCrown'){fill((x,y)=>Math.abs(x-20)/10+Math.abs(y-23)/11<=1,'M');crown(9.5,14.5,25.5);cy=19;}
  else if(sh==='hex'){const P=ricPoly(6,20,20,10,-90);fill((x,y)=>ricIn(x,y,P),'M');}
  else if(sh==='oct'){const P=ricPoly(8,20,20.5,11.5,22.5);fill((x,y)=>ricIn(x,y,P),'M');}
  else if(sh==='octRim'){const P=ricPoly(8,20,21,12.6,22.5);fill((x,y)=>ricIn(x,y,P),'M');}
  else if(sh==='square'){fill((x,y)=>{const dx=Math.max(0,Math.abs(x-20)-6.5),dy=Math.max(0,Math.abs(y-20.5)-6.5);return Math.hypot(dx,dy)<=3.4;},'M');}
  else if(sh==='pent'){const P=ricPoly(5,20,21.5,12,-90);fill((x,y)=>ricIn(x,y,P),'M');cy=18;}
  else if(sh==='castle'){   // scudo con i merli: tre torri in alto
    fill((x,y)=>{if(x<9.5||x>30.5||y<13||y>33)return false;if(y<26)return true;const t=(y-26)/7;return Math.abs(x-20)<=10.5*(1-t*t)+0.4;},'M');
    for(const x0 of [9.5,17,24.5])fill((x,y)=>y>=8&&y<13.1&&x>=x0&&x<=x0+6,'M');cy=18;
  }else if(sh==='salver'){fill((x,y)=>Math.hypot(x-20,y-19.5)<=13.2,'M');cy=16;}
  else if(sh==='cocarde'){   // coccarda: cerchio smerlato con le code nei colori della bandiera
    for(const sd of [-1,1])for(let y=22;y<=37;y++)for(let i=0;i<5;i++){const x=20+sd*(2+i+(y-22)*0.5);if(!(y>=36&&i===2))set(x,y,RB[Math.min(2,Math.floor((sd<0?i:4-i)*3/5))]);}
    fill((x,y)=>{const t=Math.atan2(y-18,x-20);return Math.hypot(x-20,y-18)<=10.5+1.4*Math.cos(12*t);},'M');cy=15;
  }else if(sh==='ecu'){   // scudo alla francese: angoli in basso arrotondati e punta al centro, capo tricolore
    fill((x,y)=>{if(x<10.5||x>29.5||y<8||y>34)return false;if(y<26)return true;const t=(y-26)/7;return Math.abs(x-20)<=9.5*Math.sqrt(Math.max(0,1-t*t))+0.4||(Math.abs(x-20)<=2.2-(y-32)*0.9&&y<=34);},'M');
    cy=17;
  }else if(sh==='ring'){   // anello dei campioni: castone in alto, fascia sotto
    fill((x,y)=>y>15&&Math.hypot(x-20,(y-24.5)*1.05)<=9.4&&Math.hypot(x-20,(y-24.5)*1.05)>=5.6,'M');
    fill((x,y)=>{const dx=Math.max(0,Math.abs(x-20)-5.5),dy=Math.max(0,Math.abs(y-11.5)-3.8);return Math.hypot(dx,dy)<=2.6;},'M');cy=8;
  }else if(sh==='star'){const P=ricStar(20,17.5,13.5,6.6);fill((x,y)=>ricIn(x,y,P),'M');fill((x,y)=>y>=27.5&&y<=31&&Math.abs(x-20)<=4.5+(y-27.5)*0.6,'M');cy=14;}
  else if(sh==='heart'){   // cuore pieno: la curva classica, un po' schiacciata
    fill((x,y)=>{const u=(x-20)/11.2,v=(19.5-y)/10.6,q=u*u+v*v-1;return q*q*q-u*u*v*v*v<=0;},'M');cy=14;
  }else if(sh==='burst'){   // sigillo a dodici punte
    fill((x,y)=>{const t=Math.atan2(y-20,x-20),r=Math.hypot(x-20,y-20),k=Math.abs(((t*6/Math.PI)%2+2)%2-1);return r<=9.4+3.8*k;},'M');cy=17;
  }
  else if(sh==='disc'){   // disco da ultimate visto un po' dall'alto: superficie, bordo e spessore
    fill((x,y)=>Math.hypot((x-20)/13.2,(y-22)/8.6)<=1,'D');fill((x,y)=>Math.hypot((x-20)/13.2,(y-20)/8.6)<=1,'M');cy=16;
    if(C.k==='UT1')crown(9.5,13.5,26.5);
  }
  else{   // coppe dell'EUCF: piu' grandi salendo sul podio
    const bw=[0,5.5,7,8.2][rank],bt=[0,13,11,9][rank],bb=23;
    fill((x,y)=>{if(y<bt||y>bb)return false;const t=(y-bt)/(bb-bt);return Math.abs(x-20)<=bw*(1-0.55*t*t)+0.3;},'M');   // coppa
    fill((x,y)=>y>bb&&y<=bb+3.5&&Math.abs(x-20)<=1.6,'M');   // gambo
    const bw2=[0,5,6,7.5][rank];fill((x,y)=>y>bb+3.5&&y<=bb+6.5&&Math.abs(x-20)<=bw2-(y-bb-3.5)*-0.4,'M');   // base
    if(rank>=2){const hr=rank===3?4.6:3.6;for(const s of [-1,1])fill((x,y)=>{const d=Math.hypot(x-(20+s*(bw+0.8)),y-(bt+4.5));return d<=hr&&d>=hr-1.7&&(x-20)*s>bw-0.6;},'M');}   // manici
    if(rank===3){for(const [dx,dy] of [[0,-3],[0,-2],[-1,-2],[1,-2],[-2,-2],[2,-2],[0,-1],[-1,-1],[1,-1],[-1,0],[1,0]])set(20+dx,bt-2+dy+1,'M');}   // stella in cima alla coppa del campione
    cy=[0,15,14,13][rank];
  }
  // ombreggiatura: luce in alto a sinistra, ombra in basso a destra
  const solid=c=>'MLDTJKW'.includes(c);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(g[y][x]==='M'){const up=!solid(get(x,y-1))||!solid(get(x-1,y)),dn=!solid(get(x,y+1))||!solid(get(x+1,y));if(up&&!dn)g[y][x]='L';else if(dn&&!up)g[y][x]='D';}
  // bordo inciso del piatto britannico (con le perline sul bordo) e dell'ottagono belga
  if(sh==='salver')for(let y=0;y<N;y++)for(let x=0;x<N;x++){const d=Math.hypot(x+0.5-20,y+0.5-19.5),t=Math.atan2(y+0.5-19.5,x+0.5-20);if(d>=8.6&&d<9.6)g[y][x]='D';else if(d>=9.6&&d<10.4)g[y][x]='L';else if(d>=11.2&&d<12.4&&Math.cos(16*t)>0.3)g[y][x]='L';}
  if(sh==='octRim'){const A=ricPoly(8,20,21,9.6,22.5),B=ricPoly(8,20,21,8.6,22.5);for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(ricIn(x+0.5,y+0.5,A)&&!ricIn(x+0.5,y+0.5,B))g[y][x]=y<21?'D':'L';}
  if(sh==='ring'){   // la bandiera copre tutto il castone (fino al bordo), poi l'attacco alla fascia
    const inB=(x,y)=>Math.hypot(Math.max(0,Math.abs(x-20)-5.5),Math.max(0,Math.abs(y-11.5)-3.8))<=2.6;
    ricUS((x,y,c)=>{if(inB(x+0.5,y+0.5))set(x,y,c);},11,5,18,11);
    for(let x=15;x<=25;x++){set(x,16,'D');set(x,17,'L');}
  }
  if(sh==='disc')for(let y=0;y<N;y++)for(let x=0;x<N;x++){const e=Math.hypot((x+0.5-20)/13.2,(y+0.5-20)/8.6);if(g[y][x]==='M'&&e>=0.72&&e<0.82)g[y][x]='D';}   // l'anello del disco
  if(sh==='cocarde')for(let y=0;y<N;y++)for(let x=0;x<N;x++){const d=Math.hypot(x+0.5-20,y+0.5-18);if(d<4.7)g[y][x]='b';else if(d<6.7)g[y][x]='w';else if(d<8.6)g[y][x]='x';}   // la coccarda vera: blu, bianco e rosso
  if(sh==='ecu')for(let y=9;y<=12;y++)for(let x=11;x<=29;x++)set(x,y,RB[Math.min(2,Math.floor((x-11)/19*3))]);   // capo dello scudo nei colori della bandiera
  // il segno inciso al centro: lettera della serie, numero del livello o del podio
  // il segno: uno o due caratteri da 5 colonne, centrati
  const tc=sh==='cocarde'?'w':(sh==='disc'?'o':'T'),chs=[...(C.ch||'')],x0=Math.round(20-(chs.length*6-1)/2);
  if(sh==='heart')['..111','.1...','1111.','.1...','1111.','.1...','..111'].forEach((r,j)=>[...r].forEach((b,i)=>{if(b==='1')set(18+i,cy+j,tc);}));   // il simbolo dell'euro
  chs.forEach((ch,k)=>{const F=CLUB_FONT[ch];if(F)F.forEach((r,j)=>[...r].forEach((b,i)=>{if(b==='1')set(x0+k*6+i,cy+j,tc);}));});
  if(lv>=3&&sh!=='ring')for(const [dx,dy,c] of [[0,0,'J'],[-1,1,'J'],[0,1,'W'],[1,1,'K'],[0,2,'K']])set(20+dx,cy+8+dy,c);   // gemma sotto il segno
  if(lv>=3&&sh==='ring')for(const [dx,dy,c] of [[0,0,'J'],[-1,1,'J'],[0,1,'W'],[1,1,'K'],[0,2,'K']])set(20+dx,26+dy,c);   // nell'anello, la gemma va sulla fascia in basso
  // CARTIGLIO in basso dal Medio: una fascia con le code piegate
  if(lv>=1){const y0=32;
    for(let x=10;x<=30;x++){set(x,y0,'R');set(x,y0+1,'R');set(x,y0+2,'r');}
    for(const sd of [-1,1]){const xe=20+sd*11;for(const [dx,dy,c] of [[0,1,'r'],[0,2,'r'],[sd,1,'R'],[sd,2,'R'],[sd,3,'R'],[sd*2,1,'R'],[sd*2,3,'R'],[sd*2,4,'R'],[sd*3,2,'R'],[sd*3,4,'R']])set(xe+dx,y0+dy,c);}
  }
  // contorno attorno a tutto cio' che e' pieno
  const full=c=>c!=='.'&&c!=='o';
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(g[y][x]==='.'){if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>full(get(x+a,y+b))))g[y][x]='o';}
  // scintille di Estrema
  if(lv===3)for(const [x,y,k] of [[5,7,2],[34,5,1],[36,24,2],[3,26,1]]){set(x,y,'s');for(let i=1;i<=k;i++){set(x-i,y,'s');set(x+i,y,'s');set(x,y-i,'s');set(x,y+i,'s');}}
  return g;
}
function badgeSVG(comp,diff,locked,px){
  const C=RIC_BY[comp]||{};if(C.mat)diff=C.mat;   // Ultimate Team: materiale fisso
  const g=badgeGrid(comp,diff),m=RIC_MAT[diff];
  const P=locked?{M:'#3a4a63',L:'#4a5d7a',D:'#2c3a50',O:'#1a2332',T:'#2c3a50',v:'#3a4a63',w:'#4a5d7a',x:'#2c3a50',b:'#3a4a63',y:'#4a5d7a',k:'#2c3a50',n:'#33445c',G:'#33445c',g:'#2c3a50',R:'#3a4a63',r:'#2c3a50',J:'#4a5d7a',K:'#2c3a50',W:'#4a5d7a',s:'transparent'}
    :{M:m.M,L:m.L,D:m.D,O:m.O,T:m.D,v:'#1f9a4e',w:'#f4f5f0',x:'#d8323c',b:'#2a55c8',y:'#ffd23f',k:'#22252b',n:'#1c2f7a',G:diff==='xtr'?'#c9f3ff':'#3fae4a',g:diff==='xtr'?'#7a62e0':'#1f6b2a',W:'#ffffff',R:diff==='xtr'?'#c04bd8':(diff==='hard'?'#d8323c':'#2a55c8'),r:'#1a2332',J:'#ff5fd2',K:'#8a2be2',s:'#ffffff'};
  let out='';
  for(let y=0;y<g.length;y++){const r=g[y];for(let x=0;x<r.length;){const c=r[x];let e=x+1;while(e<r.length&&r[e]===c)e++;
    if(c!=='.'){const col=c==='o'?P.O:P[c];if(col&&col!=='transparent')out+=`<rect x="${x}" y="${y}" width="${e-x}" height="1" fill="${col}"${c==='s'?' class="rsp"':''}/>`;}x=e;}}
  const s=px||80;
  return `<svg class="rbadge${(diff==='xtr'||C.glow)&&!locked?' xtr':''}" viewBox="0 0 40 40" width="${s}" height="${s}" shape-rendering="crispEdges" aria-hidden="true">${out}</svg>`;
}
// ---------- registro (per dispositivo) ----------
function ricLoad(){try{const o=JSON.parse(localStorage.getItem(RIC_KEY)||'{}');return o&&typeof o==='object'?o:{};}catch(e){return {};}}
function ricSave(o){try{localStorage.setItem(RIC_KEY,JSON.stringify(o));}catch(e){}}
// nuovo riconoscimento: comp = chiave di RIC_COMP (C, B, A, 'BE.N1', 'U', E1...); la difficolta' e' quella della carriera. Una volta sola per
// competizione e difficolta'; le chiavi che non ci sono (livelli dei formati vecchi) non danno niente
function ricGive(comp){
  if(!SV||!SV.team||!RIC_BY[comp])return false;
  const d=RIC_DIFF.includes(SV.diff)?SV.diff:'easy',id=comp+':'+d,o=ricLoad();
  if(o[id])return false;
  o[id]={t:SV.team,s:SV.season,at:Date.now(),nw:1};ricSave(o);
  if(typeof news==='function')news(`Nuovo riconoscimento: ${RIC_BY[comp].name} · ${CAR_DIFF[d].name}. Lo trovi nel menu iniziale.`);
  return true;
}
const ricComp=id=>RIC_BY[id.slice(0,id.lastIndexOf(':'))];
// Sfide online: posizione di fine mese (1, 2, 3 o 10 = dal 4° al 10°), mese ('AAAA-MM') e nome online. Un mese conta una volta sola; lo stesso
// badge si somma (n) e tiene l'elenco dei mesi (m)
function ricUtGive(pos,season,name){
  const c=RIC_BY['UT'+pos];if(!c||!utoSeasonOk(season))return false;
  const o=ricLoad(),w=o[c.k]||{n:0,m:[]};if(!Array.isArray(w.m))w.m=[];
  if(RIC_UT.comps.some(x=>o[x.k]&&Array.isArray(o[x.k].m)&&o[x.k].m.includes(season)))return false;
  w.m.push(season);w.n=w.m.length;w.t=utoName(name);w.at=Date.now();w.nw=1;o[c.k]=w;ricSave(o);
  return true;
}
const ricKeyOk=k=>!!ricComp(k)||RIC_UT.comps.concat(RIC_AL.comps).some(c=>c.k===k);
// ---------- pannello ----------
// a sinistra il campionato scelto nelle linguette (all'apertura quello della carriera in corso), a destra il podio dell'EUCF, che vale per tutti:
// al massimo tre righe per blocco, su un telefono di traverso stanno senza scorrere
let ricSel=null,ricTab='IT';
function renderRic(){
  const o=ricLoad(),has=c=>RIC_DIFF.filter(d=>o[c.k+':'+d]).length;
  const got=Object.keys(o).filter(k=>ricComp(k)).length;
  $('ricSub').textContent=ricTab==='AL'?'Riconoscimenti speciali: li assegna chi gestisce il gioco al tuo profilo di Sfide online':ricTab==='UT'?'Sfide online: i primi 10 della classifica di ogni mese (almeno 10 partite giocate)':`${got} su ${RIC_COMP.length*RIC_DIFF.length} · per ogni campionato vinto un badge per difficoltà della carriera`;
  const utN=RIC_UT.comps.reduce((t,c)=>t+((o[c.k]&&o[c.k].n)|0),0),utNw=RIC_UT.comps.some(c=>o[c.k]&&o[c.k].nw);
  const tabs=`<div class="rict2" role="tablist">${RIC_LG.concat([RIC_UT,RIC_AL]).map(l=>{const n=l.k==='UT'?utN:l.k==='AL'?premiCount():l.comps.reduce((t,c)=>t+has(c),0),nw=l.k==='UT'?utNw:l.k==='AL'?premiNew():l.comps.some(c=>RIC_DIFF.some(d=>o[c.k+':'+d]&&o[c.k+':'+d].nw));
    return `<button type="button" role="tab" class="sg${l.k===ricTab?' on':''}${nw?' nw':''}" data-rtab="${l.k}" aria-selected="${l.k===ricTab}">${l.k==='AL'?'<span data-lgk="ricAltro">'+l.name+'</span>':l.name}${n?` <i>${n}</i>`:''}</button>`;}).join('')}</div>`;
  const block=(title,cs)=>`<div class="ricg"><div class="rich rict">${title}</div>${RIC_DIFF.map(d=>`<div class="rich">${CAR_DIFF[d].name}</div>`).join('')}`+
    cs.map(c=>`<div class="ricl">${c.short}</div>`+RIC_DIFF.map(d=>{const id=c.k+':'+d,w=o[id];
      return `<button type="button" class="ricb${w?' on':''}${w&&w.nw?' nw':''}${ricSel===id?' sel':''}" data-ric="${id}" aria-label="${c.name} · ${CAR_DIFF[d].name}${w?'':' (da ottenere)'}">${badgeSVG(c.k,d,!w,64)}</button>`;}).join('')).join('')+'</div>';
  $('ricTabs').innerHTML=tabs;
  if(ricTab==='AL'){premiRender(o);return;}
  if(ricTab==='UT'){   // una riga sola: i quattro badge di fine mese, con quante volte li hai vinti
    $('ricGrid').innerHTML=`<div class="ricg ricu">${RIC_UT.comps.map(c=>`<div class="rich">${c.short}</div>`).join('')}${RIC_UT.comps.map(c=>{const w=o[c.k];
      return `<button type="button" class="ricb${w?' on':''}${w&&w.nw?' nw':''}${ricSel===c.k?' sel':''}" data-ric="${c.k}" aria-label="${c.name}${w?'':' (da ottenere)'}">${badgeSVG(c.k,'',!w,64)}${w&&w.n>1?`<i class="ricx">×${w.n}</i>`:''}</button>`;}).join('')}</div>`;
    const c=RIC_BY[ricSel],w=c&&o[c.k];
    $('ricInfo').innerHTML=c?`<b>${c.name}</b><span>${w?`${w.n>1?'Ottenuto '+w.n+' volte: ':'Ottenuto a '}${w.m.map(s=>lgTr(utoSeasonName(s))).join(', ')}${w.t?' · '+esc(w.t):''}`:c.txt+', con almeno '+UTO_SEASON_G+' partite nel mese.'}</span>`
      :'<span>Tocca un badge per vedere come si ottiene. La classifica riparte ogni mese.</span>';
    return;
  }
  const L=RIC_LG.find(l=>l.k===ricTab)||RIC_LG[0];
  $('ricGrid').innerHTML=block(L.name,L.comps)+block('EUCF',RIC_EU.comps);
  const id=ricSel||'',c=id?ricComp(id):null,d=id.split(':').pop(),w=o[id];
  $('ricInfo').innerHTML=c?`<b>${c.name} · ${CAR_DIFF[d].name}</b><span>${w?`Ottenuto con ${esc(w.t)} nella stagione ${w.s}${w.at?' · '+new Date(w.at).toLocaleDateString(lgLoc(),{day:'numeric',month:'long',year:'numeric'}):''}`:c.txt+' con una carriera a difficoltà '+CAR_DIFF[d].name+'.'}</span>`
    :'<span>Tocca un badge per vedere come si ottiene. La difficoltà è quella scelta all’inizio della carriera; l’EUCF vale con qualsiasi squadra.</span>';
}
function ricOpen(){
  premiSync().then(ch=>{if(ch&&!$('ric').classList.contains('hidden'))renderRic();});
  ricSel=null;const lk=SV&&SV.lk;ricTab=RIC_LG.some(l=>l.k===lk)?lk:'IT';
  renderRic();$('ric').classList.remove('hidden');
}
function ricClose(){   // quelli nuovi smettono di brillare quando li hai visti
  const o=ricLoad();let ch=false;for(const k in o)if(o[k]&&o[k].nw){delete o[k].nw;ch=true;}if(ch)ricSave(o);
  premiSeen();
  $('ric').classList.add('hidden');ricBtn();
}
function ricBtn(){   // il pulsante del menu iniziale: quanti ne hai e un punto se ce n'e' uno nuovo
  const o=ricLoad(),ks=Object.keys(o).filter(ricKeyOk),n=ks.reduce((t,k)=>t+(ricComp(k)?1:(o[k].n|0)),0);$('tRicN').textContent=n?String(n):'';$('tRic').classList.toggle('nw',ks.some(k=>o[k]&&o[k].nw)||premiNew());
}
$('ricTabs').addEventListener('click',e=>{const b=e.target.closest('[data-rtab]');if(!b)return;ricTab=b.dataset.rtab;ricSel=null;renderRic();});
$('tRic').addEventListener('click',ricOpen);
$('ricX').addEventListener('click',ricClose);
$('ricGrid').addEventListener('click',e=>{if(e.target.closest('#prWear')){premiWear(!premiKit());renderRic();return;}
  if(e.target.closest('#prStad')){premiStadioWear(!premiStadio());renderRic();return;}
  const b=e.target.closest('[data-ric]');if(!b)return;ricSel=b.dataset.ric;renderRic();});
ESC_CLOSE.push(['ric',ricClose]);
