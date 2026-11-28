/* ---- FESTA DEL TITOLO: il capitano alza la coppa, la squadra festeggia dietro di lui ----
   Si apre dal riepilogo della partita decisiva (Continua, anche dopo una simulazione): il risultato e' gia' registrato e il campo non avanza.
   Disegno a pixel su un canvas a parte, alto CUP_H; la larghezza segue la finestra (cupFit), cosi' la scena la riempie senza bande.
   Gli omini sono quelli del campo (puppet con le pose 'cel' delle esultanze, 20-ui/27-esultanze.js), i tifosi quelli delle tribune (fanFigure)
   e i cartelloni quelli dei primi piani (cineBoard): per disegnarli si presta per un attimo ctx (come negli stacchi) e si rimettono G.tick, G.wx e UNI[0].
   La scena: stadio di sera con torri faro, tifosi che saltano, striscioni e flash; palco a due gradini; il capitano davanti, sul tappeto; fotografi di spalle.
   Tre feste, secondo il titolo (careerTitleAfter: kind):
   - campionato ('camp'): il capitano alza la coppa d'oro e dietro di lui tutta la squadra fa il balletto dell'esultanza, a tempo
     (passo laterale, giro su se stessi, «febbre del sabato sera», salto a braccia alzate; poi da capo);
   - EUCF ('eu'): due compagni portano in spalla il capitano con la coppa d'argento; dietro, salti a onda;
   - Nationals ('us'): il capitano alza il trofeo con il disco d'oro; dietro, petto contro petto a coppie; fuochi d'artificio.
   Prima della coppa la squadra guarda il capitano e applaude; quando la coppa arriva in alto partono coriandoli, stelle filanti e flash.
   La canzoncina della vittoria (scena audio 'festa', 90-avvio/02-audio-ciclo.js) va allo stesso tempo: una croma = CUP_BEAT, il colpo pieno a CUP_LIFT,
   il giro da CUP_DANCE; il balletto dura due battute (16 passi) e finisce con il salto di tutti e il grido «Ehi!» (fumetto EHI!).
   Tutto dipende dal tempo e da ihash (niente Math.random): con «riduci animazioni» resta un solo fotogramma, a coppa alzata. */
const CUP_H=144,CUP_W0=200,CUP_W1=320;   // altezza fissa del disegno; la larghezza segue la finestra
const CUP_BEAT=0.24,CUP_LIFT=1.05,CUP_DANCE=CUP_LIFT+2*CUP_BEAT;   // un passo del balletto (in campo 0,22 s), coppa in alto, inizio del balletto
const CUP_STILL=CUP_DANCE+6.5*CUP_BEAT;   // il fotogramma fisso con «riduci animazioni»: coppa in alto, squadra nella «febbre del sabato sera»
const CUP_ROOF=24,CUP_STAND=30,CUP_ROWS=5,CUP_RISE=7,CUP_BRD=69,CUP_BH=11,CUP_GY=CUP_BRD+CUP_BH;   // tetto, gradoni del pubblico, cartelloni, inizio del prato
const CUP_BACK=99,CUP_MID=111,CUP_FRONT=129,CUP_HW=64;   // piedi: fila sul gradino alto, fila sul gradino basso, capitano sul tappeto; mezza larghezza del palco
let cup=null,cupFrame=0;

// ---------- i trofei: righe di caratteri (sprDraw), con la presa delle mani e i nastri ----------
const CUP_GOLD={o:PAL.out,W:'#ffffff',L:'#fff1a8',G:'#ffcf3a',D:'#c4851c',B:'#4a2f1e',b:'#6e4a2e',P:'#ffe680'};
const CUP_SILVER={o:PAL.out,W:'#ffffff',L:'#eef3f9',G:'#c3cedb',D:'#7a889e',B:'#1f3566',b:'#2f5296',P:'#ffd23f'};
// hold: righe dalla base alla presa con la coppa al petto; chest: altezza delle mani al petto (dalle spalle); spread: mani alle anse;
// rib: dove sono legati i nastri, shine: dove brilla (dal centro della base)
const CUP_TR={
  coppa:{pal:CUP_GOLD,hold:8,chest:3,spread:5,rib:[[-5,-6],[5,-6]],shine:[-3,-11],rows:[
    '...ooooooo...',
    '..oWLLGGGDo..',
    'oooLGGGGGDooo',
    'oGoLGGGGGDoGo',
    'oGooLGGGDooGo',
    'oDGooLGDooGDo',
    '.ooooLGDoooo.',
    '....oLGDo....',
    '.....oGo.....',
    '....oLGDo....',
    '..ooooooooo..',
    '..oBbbPbbBo..',
    '..ooooooooo..']},
  europa:{pal:CUP_SILVER,hold:10,chest:4,spread:6,rib:[[-5,-8],[5,-8]],shine:[-3,-14],rows:[
    '....ooooooo....',
    '...oWLLGGGDo...',
    'ooooLGGGGGDoooo',
    'oGGoLGGGGGDoGGo',
    'oGooLGGGGGDooGo',
    'oGo.oLGGGDo.oGo',
    'oGDooLGGGDooDGo',
    '.oGDooLGDooDGo.',
    '..ooooLGDoooo..',
    '.....oLGDo.....',
    '......oGo......',
    '......oDo......',
    '.....oLGDo.....',
    '...ooooooooo...',
    '...oBbbPbbBo...',
    '...ooooooooo...']},
  disco:{pal:CUP_GOLD,hold:6,chest:6,spread:2,rib:[[-3,-10],[3,-10]],shine:[-3,-12],rows:[
    '..ooooooo..',
    '.oWWLLGGGo.',
    'oLLGGGGGGDo',
    '.ooDDDDDDo.',
    '...ooooo...',
    '....oGo....',
    '...oLGDo...',
    '..oLGWGDo..',
    '...oLGDo...',
    '....oGo....',
    '...oLGDo...',
    '.ooooooooo.',
    '.oBbbPbbBo.',
    '.ooooooooo.']}
};
// le tre feste: trofeo, esultanza della squadra dietro, colori del palco e posti [x dal centro, fila 0 dietro / 1 in mezzo], dal piu' vicino al capitano
const CUP_FEST={
  camp:{tr:'coppa',back:'ballo',carpet:'#9b2335',trim:'#ffd23f',
    slots:[[-16,1],[16,1],[-10,0],[10,0],[-32,1],[32,1],[-25,0],[25,0],[-48,1],[48,1],[-40,0],[40,0]]},
  eu:{tr:'europa',back:'onda',carpet:'#1d3f8a',trim:'#9cc3ff',lift:true,
    slots:[[-18,1],[18,1],[-10,0],[10,0],[-34,1],[34,1],[-25,0],[25,0],[-50,1],[50,1],[-40,0],[40,0]]},
  us:{tr:'disco',back:'petto',carpet:'#8e1f2c',trim:'#f4f4f4',fire:true,   // coppie a 11 pixel: si incontrano a meta' strada
    slots:[[-15,1],[-26,1],[15,1],[26,1],[-25,0],[-36,0],[25,0],[36,0],[-41,1],[-52,1],[41,1],[52,1]]}
};

// ---------- apertura e chiusura ----------
function openCupScene(title,after){
  cancelAnimationFrame(cupFrame);
  const kind=CUP_FEST[title.kind]?title.kind:(title.europe?'eu':'camp'),F=CUP_FEST[kind],team=SV.team;
  const kit={...KIT_RESET,...(premiKit()||KITS[0][hashStr('kit|'+team)%KITS[0].length])};   // la divisa di sempre (matchLook)
  // chi alza la coppa: il migliore dei titolari; poi gli altri titolari e il resto della rosa, dal piu' forte
  let line=[];try{line=matchLine('lineO').map(id=>SQ[id]).filter(Boolean);}catch(e){}
  const byOvr=a=>a.slice().sort((p,q)=>ovr(q)-ovr(p)),pool=[...new Set([...byOvr(line),...byOvr(SQ)])];
  const cap=pool[0]||null,rest=pool.slice(1),lifters=F.lift?rest.slice(0,2):[];
  const mates=rest.slice(lifters.length,lifters.length+F.slots.length).map((p,i)=>({p,x:F.slots[i][0],row:F.slots[i][1]}));
  if(F.back==='petto')cupPairs(mates);
  let land='IT';try{land=kind==='us'?'US':(kind==='eu'?'EU':clubLega(team));}catch(e){}
  if(land==='IW')land='IT';
  const fem=SV.lk==='IW',ev={bg:'#1d2b53',ink:'#ffd23f',ac:'#f4f4f4',ic:'trophy',t:[UPC(title.text),fem?'CAMPIONESSE':'CAMPIONI']};
  const boards=[ev,{...bClub(team,0),bg:kit.shirt},SV.sp&&SV.sp.name?bSp(SV.sp.name):B_UF,ev,{...bClub(team,0),bg:kit.shirt},B_SPIRIT];
  const shorts=kit.shorts===kit.shirt?'#ffffff':kit.shorts;
  cup={kind,F,kit,team,cap,lifters,mates,boards,ev,fem,after,
    V:{v:'N',home:null,tier:2,lv:5,n:0,cap:0,fill:0.94,my:0.88,big:true,ev:'',spon:'',comp:'',care:-1,land},   // i tifosi per fanFigure: quasi tutti tuoi, gli avversari in un angolo
    conf:kind==='eu'?['#ffd23f','#2f6fd6','#ffffff','#9cc3ff']:(kind==='us'?[kit.shirt,'#ffffff','#ff4b4b','#3a63d8','#ffd23f']:[kit.shirt,'#ffd23f','#ffffff',shorts]),
    rib:[kit.shirt,shorts],cv:$('cupPark'),t0:performance.now(),reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
  cup.g=cup.cv.getContext('2d');
  $('cupTitle').textContent=title.text;
  $('cupTeam').textContent=team;
  $('cupScene').classList.remove('hidden');
  cupFit();
  cup.aud=AUD.festa();   // la canzoncina della vittoria (90-avvio/02-audio-ciclo.js): parte adesso
  const loop=now=>{
    if(!cup)return;
    const ta=cup.aud?AUD.festaT():null;   // con l'audio il tempo e' quello della musica, cosi' il balletto resta a tempo
    cupDraw(cup.reduced?CUP_STILL:Math.max(0,ta!==null?ta:(now-cup.t0)/1000));
    if(!cup.reduced)cupFrame=requestAnimationFrame(loop);
  };
  loop(cup.t0);
}
// la larghezza del disegno segue la forma della finestra (da 200 a 320 pixel): niente bande nere ai lati o sopra
function cupFit(){
  if(!cup)return;
  const o=$('cupScene'),w=o.clientWidth,h=o.clientHeight,W=h>0?clamp(Math.round(CUP_H*w/h),CUP_W0,CUP_W1):256;
  if(cup.cv.width!==W||cup.cv.height!==CUP_H){cup.cv.width=W;cup.cv.height=CUP_H;}
}
addEventListener('resize',()=>{if(!cup)return;cupFit();if(cup.reduced)cupDraw(CUP_STILL);});
$('cupNext').addEventListener('click',()=>{
  if($('cupScene').classList.contains('hidden'))return;
  cancelAnimationFrame(cupFrame);
  $('cupScene').classList.add('hidden');
  const after=cup&&cup.after;cup=null;
  if(after)after();
});
// petto contro petto: compagni vicini nella stessa fila fanno coppia (pi = quale coppia, per sfalsare i salti; side -1 a sinistra)
function cupPairs(mates){
  let pi=0;
  for(const row of [0,1]){
    const r=mates.filter(m=>m.row===row).sort((a,b)=>a.x-b.x);
    for(let i=0;i+1<r.length;i++)if(r[i+1].x-r[i].x<=12){r[i].pair=r[i+1];r[i+1].pair=r[i];r[i].side=-1;r[i+1].side=1;r[i].pi=r[i+1].pi=pi++;i++;}
  }
}

// ---------- un fotogramma ----------
function cupDraw(t){
  const S=cup,W=S.cv.width;
  const o=ctx,tk=G.tick,wx=G.wx,u0=Object.assign({},UNI[0]);
  ctx=S.g;G.tick=t;G.wx=0;Object.assign(UNI[0],S.kit);   // i disegni del campo leggono ctx, G.tick (bandiere), G.wx (ombrelli) e UNI[0] (tifosi)
  try{
    ctx.imageSmoothingEnabled=false;
    cupSky(S,W,t);
    cupStand(S,W,t);
    cupBoards(S,W,t);
    cupField(S,W,t);
    cupStage(S,W,t);
    cupBeams(S,W,t);
    cupTeam(S,W,t);
    cupConfetti(S,W,t);
    cupShout(S,W,t);
    cupPhoto(S,W,t);
  }finally{
    ctx=o;G.tick=tk;G.wx=wx;
    for(const k of Object.keys(UNI[0]))if(!(k in u0))delete UNI[0][k];
    Object.assign(UNI[0],u0);
  }
}
const cupLit=t=>t>=CUP_LIFT-0.05;   // la coppa e' in alto: festa piena

// ---------- cielo di sera, torri faro, fuochi ----------
function cupSky(S,W,t){
  const band=['#0b1430','#0e1836','#111d3d','#152245','#19284e','#1e2f58'];
  for(let i=0;i<band.length;i++)px(0,i*4,W,4,band[i]);
  for(let i=0;i<30;i++){   // stelle: qualcuna brilla
    const h=ihash(i,77),x=h%W,y=1+((h>>>9)%20);
    if(((h>>>4)&3)===0&&Math.sin(t*3+i)>0.5)continue;
    px(x,y,1,1,(h>>>13)%3?'#8ea3cc':'#ffffff');
  }
  if(S.F.fire)cupFireworks(S,W,t);
  for(const x of cupTowers(W)){   // torri faro dietro il tetto
    px(x-1,9,3,CUP_ROOF-9,'#2c3446');px(x-1,9,1,CUP_ROOF-9,'#58637c');
    for(let y=12;y<CUP_ROOF;y+=4)px(x-2,y,5,1,'#3c4559');
    px(x-12,-1,25,13,'rgba(255,240,190,.07)');px(x-10,0,21,11,'rgba(255,240,190,.09)');   // alone
    px(x-8,1,17,8,PAL.out);px(x-7,2,15,6,'#2a3244');
    for(let r=0;r<2;r++)for(let k=0;k<4;k++)px(x-6+k*4,3+r*3,3,2,'#fff6d4');
  }
}
const cupTowers=W=>[ri(W*0.1),W-1-ri(W*0.1)];
// fuochi d'artificio (Nationals): uno ogni 0,55 s, ai lati del titolo; il razzo sale, poi la corona si apre e cade
function cupFireworks(S,W,t){
  const P=0.55,a0=t-CUP_LIFT+0.3;if(a0<0)return;
  const cols=['#ff4b4b','#ffffff','#5b8cff','#ffd23f',S.kit.shirt];
  for(let k=Math.max(0,Math.floor(a0/P)-3);k<=Math.floor(a0/P);k++){
    const a=a0-k*P;if(a<0||a>1.35)continue;
    const h=ihash(k,911),sd=k&1?1:-1,x=ri(W/2+sd*(W*0.22+(h%ri(W*0.2)))),y=7+((h>>>8)%9),c=cols[(h>>>12)%cols.length];
    if(a<0.25){px(x,ri(CUP_ROOF-(CUP_ROOF-y)*a/0.25),1,2,'#fff3c4');continue;}
    const b=a-0.25,r=2+11*(1-Math.pow(1-Math.min(1,b/0.55),2)),n=16;
    for(let i=0;i<n;i++){
      const an=i/n*6.283+(h&7)*0.3,dx=ri(Math.cos(an)*r),dy=ri(Math.sin(an)*r*0.8+b*b*9);
      px(x+dx,y+dy,1,1,b<0.1?'#ffffff':(b>0.8?cShade(c,-0.45):c));
      if(b<0.5)px(x+ri(dx*0.7),y+ri(dy*0.7),1,1,cShade(c,-0.25));   // la scia verso il centro
    }
  }
}

// ---------- la tribuna ----------
const cupAisles=W=>{const c=W>>1;return [c-44,c+44,c-108,c+108];};
function cupStand(S,W,t){
  const V=S.V,lit=cupLit(t),aisles=cupAisles(W),home=S.kit.shirt;
  px(-1,CUP_ROOF,W+2,CUP_STAND-CUP_ROOF,PAL.out);   // il tetto: fascia nei colori della squadra, LED che corrono
  px(-1,CUP_ROOF+1,W+2,3,cShade(home,-0.5));px(-1,CUP_ROOF+1,W+2,1,'#56627c');
  for(let x=-(ri(t*30)%8);x<W;x+=8)px(x,CUP_ROOF+3,3,1,lit?'#ffd23f':'#7f93bb');
  for(let r=0;r<CUP_ROWS;r++){   // gradoni: le prime file sono all'ombra del tetto
    const y0=CUP_STAND+r*CUP_RISE,base=r%2?'#4b546b':'#444d63',col=r<2?cShade(base,-0.25):base;
    px(-1,y0,W+2,CUP_RISE,col);px(-1,y0+CUP_RISE-1,W+2,1,cShade(col,0.3));
  }
  for(const ax of aisles){   // corridoi con le scale: li' non siede nessuno
    px(ax-4,CUP_STAND,9,CUP_ROWS*CUP_RISE,'#59627a');
    for(let y=CUP_STAND+3;y<CUP_STAND+CUP_ROWS*CUP_RISE;y+=4)px(ax-4,y,9,1,'#6e778e');
    px(ax-4,CUP_STAND,1,CUP_ROWS*CUP_RISE,'#3a4256');
  }
  const ban=cupBanners(S,W);
  for(let r=0;r<CUP_ROWS;r++){
    const yb=CUP_STAND+(r+1)*CUP_RISE-1,st=r%2?5:0;
    for(let x=st+3;x<W;x+=9){
      if(aisles.some(a=>Math.abs(x-a)<7))continue;
      const h=ihash(x,r*97+13);
      if((h%1000)/1000>=V.fill){px(x-2,yb-3,5,3,PAL.out);px(x-1,yb-2,3,2,cShade(home,-0.35));continue;}   // posto vuoto: il seggiolino
      const tm=fanTeam(V,clamp(x/W,0,1)*FIELD_L,h),mine=tm===0||(tm<0&&h%3===0);
      const hop=lit&&mine&&Math.sin(t*(9+h%5)+h)>0.1?2:(!lit&&mine&&Math.sin(t*4+h)>0.93?1:0);
      fanFigure(x,yb-hop,h,V,tm,false,{dark:r<2?-0.42:(r<4?-0.26:-0.12),far:r<3,arms:!!hop&&lit});
      if(lit&&ihash(h,Math.floor(t*10))%53===0)px(x-1,yb-hop-7,3,2,'#ffffff');   // flash delle macchine fotografiche
      if(r===ban.row&&ban.at.some(b=>x>=b.x-2&&x<b.x+b.w+2)&&h%3===0)px(x-2,ban.y-2,1,2,FAN_S[h%4]),px(x+2,ban.y-2,1,2,FAN_S[h%4]);   // le mani che tengono lo striscione
    }
    if(r===ban.row)cupBannerDraw(S,ban,t);
  }
  px(-1,CUP_BRD-4,W+2,4,PAL.out);px(-1,CUP_BRD-3,W+2,1,'#5c6780');   // parapetto con la striscia di LED
  for(let x=(ri(t*18)%5)-5;x<W;x+=5)px(x,CUP_BRD-2,2,1,lit?S.F.trim:'#56688f');
}
// gli striscioni dei tifosi in prima fila (davanti non c'e' nessuno che li copra): «GRAZIE RAGAZZI!» e la sigla della squadra tra due stelle
function cupBanners(S,W){
  const row=CUP_ROWS-1,y=CUP_STAND+(row+1)*CUP_RISE-7,a=(S.fem?'GRAZIE RAGAZZE!':'GRAZIE RAGAZZI!'),b='* '+UPC(teamAbbr(S.team))+' *';
  const wa=ptw(a,'t')+10,wb=ptw(b,'t')+10,ax=ri(W*0.27-wa/2),bx=ri(W*0.76-wb/2);
  return {row,y,at:[{x:ax,w:wa,txt:a,bg:S.kit.shirt},{x:bx,w:wb,txt:b,bg:'#f4f4f4',ink:S.kit.shirt}]};
}
function cupBannerDraw(S,ban,t){
  for(const b of ban.at){
    const y=ban.y+(Math.sin(t*2.2+b.x)>0.6?1:0),ink=b.ink||'#ffffff';   // la stoffa ondeggia
    px(b.x-1,y-1,b.w+2,10,PAL.out);px(b.x,y,b.w,8,b.bg);px(b.x,y,b.w,1,cShade(b.bg,0.25));px(b.x,y+7,b.w,1,cShade(b.bg,-0.25));
    ptext(b.txt,b.x+5,y+1,{f:'t',c:ink,a:'l',o:false});
  }
}

// ---------- cartelloni, prato, palco ----------
function cupBoards(S,W,t){
  const y=CUP_BRD,bw=64,cx=W>>1,seq=S.boards,step=Math.floor(t/1.6),flash=t>=CUP_LIFT&&t<CUP_LIFT+1.2;   // i LED cambiano ogni 1,6 s; alla coppa lampeggiano
  px(-1,y,W+2,CUP_BH,PAL.out);
  for(let k=-3;k<=3;k++){
    const x=cx-bw/2+k*bw;if(x>W||x+bw<0)continue;
    let it=seq[((k+step)%seq.length+seq.length)%seq.length];
    if(flash)it=Math.floor(t*7)&1?{...S.ev,bg:'#ffd23f',ink:'#1d2b53',ac:'#1d2b53'}:S.ev;
    cineBoard(x,y,bw-1,CUP_BH,it);
  }
}
function cupField(S,W,t){
  const g1='#3f8a3c',g2='#397e37',top=CUP_GY;
  px(-1,top,W+2,CUP_H-top,g1);
  for(let x=-((W>>1)%24)-12;x<W;x+=24)px(x,top,12,CUP_H-top,g2);   // strisce del taglio
  for(let i=0;i<70;i++){const h=ihash(i,303);px(h%W,top+2+((h>>>10)%(CUP_H-top-2)),1,1,'#4f9a4a');}
  px(-1,top,W+2,1,PAL.out);
}
function cupStage(S,W,t){
  const cx=W>>1,F=S.F,hw=CUP_HW,trim=F.trim,top0=CUP_BACK-4,top1=CUP_MID-4,bot=CUP_FRONT-8,lit=cupLit(t);
  // tappeto davanti al palco: si allarga verso chi guarda
  for(let y=bot;y<CUP_H;y++){const w=ri(11+(y-bot)*0.45);px(cx-w-1,y,2*w+2,1,PAL.out);px(cx-w,y,2*w,1,F.carpet);px(cx-w+1,y,1,1,trim);px(cx+w-2,y,1,1,trim);}
  // gradino alto (fila dietro) e gradino basso (fila in mezzo): piano, bordo, fronte
  const step=(x0,w,y0,y1,face)=>{
    px(x0-1,y0-1,w+2,y1-y0+2,PAL.out);px(x0,y0,w,5,'#2b3c6b');px(x0,y0,w,1,'#3d5288');px(x0,y0+5,w,1,trim);px(x0,y0+6,w,y1-y0-6,face);
  };
  step(cx-hw+8,2*(hw-8),top0,top1-1,'#17213d');
  for(let x=cx-hw+12;x<cx+hw-10;x+=6)px(x,top0+8,1,1,lit&&((x>>1)+Math.floor(t*8))%4===0?'#ffffff':'#4a5f95');   // lucine sul fronte
  step(cx-hw,2*hw,top1,bot,'#111933');
  // sul fronte: stelle che si accendono a onda e gli stemmi della squadra ai lati (al centro c'e' il capitano)
  for(let x=cx-hw+6,i=0;x<cx+hw-4;x+=8,i++){
    if(Math.abs(x-cx)<12||Math.abs(Math.abs(x-cx)-40)<7)continue;
    const on=lit&&(i+Math.floor(t*6))%5<2;cupStar(x,top1+10,on?trim:cShade(trim,-0.55),1);
  }
  for(const sd of [-1,1])crestPx(cx+sd*40,top1+10,7,S.team,1);
  // coriandoli caduti: sempre di piu' sul prato, sul palco e sul tappeto
  if(t>CUP_LIFT+0.8){
    const n=Math.min(110,Math.floor((t-CUP_LIFT-0.8)*16));
    for(let i=0;i<n;i++){const h=ihash(i,707),x=h%W,y=CUP_GY+3+((h>>>9)%(CUP_H-CUP_GY-3));px(x,y,(h>>>5)&1?2:1,1,S.conf[i%S.conf.length]);}
  }
  // ombre di chi sta sul palco e del capitano
  for(const m of S.mates)pell(cx+m.x,(m.row?CUP_MID:CUP_BACK)+1,4,1,'rgba(5,10,25,.45)');
  pell(cx,CUP_FRONT+1,S.F.lift?9:5,1,'rgba(5,10,25,.45)');
}
// due fasci di luce dalle torri faro sulla squadra; si muovono piano
function cupBeams(S,W,t){
  if(!cupLit(t)&&!S.reduced)return;
  const cx=W>>1;
  for(const [i,x0] of cupTowers(W).entries()){
    const tx=cx+(i?1:-1)*(10+12*Math.sin(t*0.9+i*2)),y0=8,y1=CUP_FRONT+2;
    for(let y=y0;y<y1;y+=1){const k=(y-y0)/(y1-y0),c=ri(lerp(x0,tx,k)),w=ri(1+k*16);px(c-w,y,2*w+1,1,'rgba(255,244,214,.045)');}
  }
}

// ---------- la squadra ----------
function cupTeam(S,W,t){
  const cx=W>>1,un=S.kit,lit=cupLit(t);
  const draw=(p,x,y,P)=>puppet(x+(P.ox||0),y,un,lookOf(p),P.f,'cel',0,0,0,{cp:P.cp,ca:-1});
  const stars=[];
  for(const row of [0,1])for(const m of S.mates){
    if(m.row!==row)continue;
    const P=CUP_DO[S.F.back](m,t,S),y=row?CUP_MID:CUP_BACK;
    draw(m.p,cx+m.x,y,P);
    if(P.star&&m.side<0)stars.push([cx+m.x+5,y-25-(P.cp.hop||0)]);   // petto contro petto: la stellina a meta' strada
  }
  for(const [x,y] of stars)cupStar(x,y,'#ffffff');
  if(!S.cap)return;
  const C=S.F.lift?cupCapLift(t):cupCap(t),x=cx;
  if(S.F.lift)S.lifters.forEach((p,i)=>draw(p,x+(i?5:-5),CUP_FRONT-1,cupLifter(i?-1:1,t)));
  // il capitano: le mani dalla presa alle anse (coppa al petto, u=0) alla presa sotto la base (coppa in alto, u=1)
  const T=CUP_TR[S.F.tr],u=C.u,hx=ri(lerp(T.spread,3,u)),hy=ri(lerp(T.chest,-11,u));   // in alto le braccia sono tese: tra la base e la testa resta luce
  const cp={view:2,ab:1,hop:C.hop,crouch:C.crouch,h:[[hx,hy],[-hx,hy]],lg:C.lg};
  puppet(x,CUP_FRONT,un,lookOf(S.cap),1,'cel',0,0,0,{cp,ca:-1});
  const sy=CUP_FRONT-C.hop+C.crouch-14,by=sy+hy+ri(lerp(T.hold,-1,u));   // riga piu' bassa del trofeo
  if(u>0.8){const r=8+(Math.sin(t*5)>0?1:0),cy=by-ri(T.rows.length/2);pell(x-1,cy,r+3,r+2,'rgba(255,224,130,.10)');pell(x-1,cy,r,r-1,'rgba(255,232,150,.14)');}   // alone della coppa in alto
  cupTrophy(S,T,x-1,by,t);
  if(u<0.6)for(const s of [1,-1]){const q=x-1+s*hx;px(q-1,sy+hy-1,4,4,PAL.out);px(q,sy+hy,2,2,lookOf(S.cap).skin);}   // al petto le mani stringono le anse, davanti al trofeo
  if(t>=CUP_LIFT&&t<CUP_LIFT+0.45)cupBurst(x-1,by-ri(T.rows.length/2),(t-CUP_LIFT)/0.45);
}
function cupTrophy(S,T,x,y,t){
  for(const [k,[dx,dy]] of T.rib.entries()){   // i nastri nei colori della squadra, legati alle anse
    for(let i=0;i<6;i++){
      const sw=ri(Math.sin(t*6+i*0.7+k*1.7)*Math.min(i,4)*0.35),xx=x+dx+sw-(k?0:1),yy=y+dy+i;
      px(xx-1,yy,4,1,PAL.out);px(xx,yy,1,1,S.rib[0]);px(xx+1,yy,1,1,S.rib[1]);
    }
  }
  sprDraw(x,y,T.rows,T.pal);
  const ph=(t*0.7)%1;   // ogni tanto un riflesso sul bordo
  if(ph<0.16)cupStar(x+T.shine[0],y+T.shine[1],'#ffffff',ph<0.08?2:1);
}
// stellina a quattro punte (riflessi, petto contro petto)
function cupStar(x,y,c,r){
  r=r||2;px(x-r,y,2*r+1,1,c);px(x,y-r,1,2*r+1,c);
  if(r>1)for(const [u,v] of [[-1,-1],[1,-1],[-1,1],[1,1]])px(x+u,y+v,1,1,c);
}
// quando la coppa arriva in alto: un lampo che si apre a scatti, con i raggi
function cupBurst(x,y,k){
  const st=Math.min(3,Math.floor(k*4)),r=6+st*4,c=st<2?'#ffffff':'#fff1a8';
  for(let i=0;i<8;i++){const an=i*Math.PI/4,a=r,b=r+3;pline(x+Math.cos(an)*a,y+Math.sin(an)*a,x+Math.cos(an)*b,y+Math.sin(an)*b,c,1);}
  if(st<2)pring(x,y,r-2,r-2,c,1);
}
// il capitano in piedi (campionato e Nationals): coppa al petto, si carica, la alza; poi saltella a tempo e la rilancia quando saltano tutti
function cupCap(t){
  let u=0,crouch=0,hop=0;
  if(t<0.5){}
  else if(t<0.74)crouch=ri(2*celSm((t-0.5)/0.14));
  else if(t<CUP_LIFT){const k=celSm((t-0.74)/(CUP_LIFT-0.74));u=k;crouch=ri(2*(1-k));hop=ri(3*Math.sin(Math.PI*k));}
  else{
    u=1;hop=ri(2*Math.abs(Math.sin(Math.PI*(t-CUP_LIFT)/CUP_BEAT)));
    if(t>=CUP_DANCE){const a=(t-CUP_DANCE)/CUP_BEAT,n=Math.floor(a)%16;if(n>=14){u=1-0.3*Math.sin(Math.PI*(a-Math.floor(a)));hop+=1;}}   // con il salto di tutti la rilancia in alto
  }
  return {u,crouch,hop,lg:null};
}
// EUCF: sale sulle spalle dei due compagni (come il trionfo in campo) e alza la coppa mentre sale
function cupCapLift(t){
  let u=0,crouch=0,hop=0,lg=null;
  if(t<0.5){}
  else if(t<0.74)crouch=ri(celSm((t-0.5)/0.14));
  else{
    const k=celSm((t-0.74)/(CUP_LIFT-0.74));hop=ri(13*k);u=celSm((t-0.84)/(CUP_LIFT-0.74));
    if(t>=CUP_LIFT+0.25)hop+=Math.sin((t-CUP_LIFT)*11)>0?1:0;   // i compagni lo fanno saltellare
    if(hop>4)lg=[[-3,2],[3,2]];   // le gambe aperte sulle spalle
  }
  return {u,crouch,hop,lg};
}
function cupLifter(m,t){   // m = verso il capitano (1 = guarda a destra)
  if(t<0.5)return {f:m,cp:{view:0,h:Math.floor(t*7)&1?[[4,1],[3,2]]:[[6,0],[1,3]]}};
  if(t<0.74)return {f:m,cp:{view:2,ab:1,crouch:2,h:[[2,4],[-2,4]]}};
  const bo=t>CUP_LIFT+0.25&&Math.sin((t-CUP_LIFT)*11)>0?1:0;
  return {f:m,cp:{view:2,ab:1,hop:bo,h:m>0?[[2,-5],[-4,-9]]:[[4,-9],[-2,-5]]}};   // una mano lo tiene, l'altra al cielo
}

// ---------- le esultanze di chi sta dietro (stesse pose delle esultanze in campo) ----------
const cupClap=(m,t)=>({f:m.x<0?1:-1,cp:{view:0,h:Math.floor(t*7+(m.x&3))&1?[[4,1],[3,2]]:[[6,0],[1,3]]}});   // guardano il capitano e applaudono
const cupJoy=(t)=>{const u=(t-CUP_LIFT+0.05)/(CUP_DANCE-CUP_LIFT+0.05);return {f:1,cp:{view:2,ab:1,hop:ri(4*Math.abs(Math.sin(Math.PI*u*2))),h:[[4,-9],[-4,-9]],lg:[[-2,1],[2,1]]}};};   // coppa in alto: tutti su con le braccia
const CUP_DO={
  // il balletto dell'esultanza in campo, a tempo per tutti e lungo due battute: 4 passi laterali, giro su se stessi, «febbre del sabato sera»;
  // 4 passi, ancora la «febbre», due salti a braccia alzate con il grido; poi da capo
  ballo(m,t){
    if(t<CUP_LIFT-0.05)return cupClap(m,t);
    if(t<CUP_DANCE)return cupJoy(t);
    const a=(t-CUP_DANCE)/CUP_BEAT,n=Math.floor(a)%16,w=a-Math.floor(a);
    if(n<4||(n>=8&&n<12)){const sd=n&1?1:-1;   // passo laterale: il braccio dal lato del passo in alto, l'altra gamba alzata
      return {f:1,cp:{view:2,ab:1,crouch:w<0.4?1:0,h:sd>0?[[4,-8],[-3,5]]:[[3,5],[-4,-8]],lg:sd>0?[[-1,2],[3,0]]:[[-3,0],[1,2]]},ox:sd*2};}
    if(n<6){const u=(n-4+w)*2,q=Math.min(3,Math.floor(u));   // giro su se stessi: di fronte, di lato, di schiena, dall'altro lato
      return {f:q===3?-1:1,cp:{view:[2,0,1,0][q],ab:1,hop:ri(2*Math.sin(Math.PI*(u-q))),h:[[3,-7],[-3,-7]]}};}
    if(n<14){const sd=n&1?-1:1;   // un braccio in alto in diagonale, l'altro in basso
      return {f:1,cp:{view:2,ab:1,h:sd>0?[[5,-9],[-3,6]]:[[3,6],[-5,-9]],lg:[[-2,0],[2,0]]},ox:sd};}
    return {f:1,cp:{view:2,ab:1,hop:ri(3*Math.sin(Math.PI*w)),h:[[4,-8],[-4,-8]],lg:[[-2,0],[2,0]]}};
  },
  // salti a onda da sinistra a destra; tra un'onda e l'altra salutano la curva, un braccio alla volta
  onda(m,t){
    if(t<CUP_LIFT-0.05)return cupClap(m,t);
    if(t<CUP_DANCE)return cupJoy(t);
    const ph=(t-CUP_DANCE)/(8*CUP_BEAT)-(m.x+60)/150,fr=ph-Math.floor(ph);   // un'onda a battuta
    if(fr<0.28){const u=fr/0.28;return {f:1,cp:{view:2,ab:1,hop:ri(6*Math.sin(Math.PI*u)),h:[[4,-9],[-4,-9]],lg:[[-2,2],[2,2]]}};}
    const k=Math.floor(t*5+m.x*0.13)&1;
    return {f:1,cp:{view:2,ab:1,h:k?[[5,-8],[-3,5]]:[[3,5],[-5,-8]]}};
  },
  // petto contro petto a coppie, sfalsate; chi resta senza compagno salta a braccia alzate
  petto(m,t){
    if(t<CUP_LIFT-0.05)return cupClap(m,t);
    const l0=t-CUP_DANCE+0.06-((m.pi|0)%4)*2*CUP_BEAT;   // ogni coppia su un suo quarto: lo scontro in aria cade sul tempo
    if(!m.pair||l0<0)return cupJoy(CUP_LIFT+((t-CUP_LIFT)%(2*CUP_BEAT)));
    const P=8*CUP_BEAT,l=l0%P,f=m.side<0?1:-1;
    if(l<0.12)return {f,cp:{crouch:2,lean:-1,h:[[-4,3],[-3,5]]}};   // si caricano
    if(l<0.52){const u=(l-0.12)/0.4,inn=u<0.45?u/0.45:lerp(1,-1.5,(u-0.45)/0.55);   // in aria: petto in fuori, braccia indietro
      return {f,cp:{hop:ri(11*Math.sin(Math.PI*u)),lean:u<0.45?1:0,h:u<0.45?[[-4,-1],[-3,0]]:[[-4,-8],[-3,-7]],lg:[[-1,2],[1,3]]},ox:ri(f*inn*2),star:u>=0.45&&u<0.62};}
    if(l<0.64)return {f,cp:{crouch:2,h:[[3,4],[-2,5]]},ox:-f};
    if(l<1.1)return {f,cp:{h:[[6,-1],[-2,5]]},ox:-f};   // si indicano
    return {f:1,cp:{view:2,ab:1,hop:ri(2*Math.abs(Math.sin(Math.PI*l/CUP_BEAT))),h:[[3,-7],[-3,-7]]}};
  }
};

// il grido «Ehi!» della canzoncina, ogni due battute: due fumetti, uno per parte, ogni volta sopra compagni diversi
function cupShout(S,W,t){
  if(t<CUP_DANCE||!S.mates.length)return;
  const a=(t-CUP_DANCE)/CUP_BEAT,n=a%16;if(n<14)return;
  const cyc=Math.floor(a/16),l=(n-14)*CUP_BEAT,cx=W>>1;
  for(const sd of [-1,1]){
    const side=S.mates.filter(m=>m.x*sd>0);if(!side.length)continue;
    const m=side[ihash(cyc,sd+40)%side.length],y=(m.row?CUP_MID:CUP_BACK)-25;
    cupBubble(cx+m.x,y-ri(3*Math.sin(Math.PI*Math.min(1,l/CUP_BEAT))),l,W);
  }
}
// fumetto bianco col bordo nero e la punta verso la testa, come quello delle esultanze in campo; la scritta e' disegnata a pixel (netta anche ingrandita)
const CUP_EHI=['####.#..#.###.#','#....#..#..#..#','###..####..#..#','#....#..#..#...','####.#..#.###.#'];
function cupBubble(x,y,l,W){
  const w=CUP_EHI[0].length+8,h=11,bx=clamp(ri(x-w/2),2,W-w-2),by=ri(y-h-3)-(l<0.07?2:0),tx=clamp(ri(x),bx+3,bx+w-4);
  pbox(bx-1,by-1,w+2,h+2,PAL.out);pbox(bx,by,w,h,'#ffffff');
  px(tx-2,by+h,5,1,PAL.out);px(tx-1,by+h,3,1,'#ffffff');px(tx-1,by+h+1,3,1,PAL.out);px(tx,by+h+1,1,1,'#ffffff');px(tx,by+h+2,1,1,PAL.out);
  sprDraw(bx+4+(CUP_EHI[0].length>>1),by+7,CUP_EHI,{'#':'#1b2a55'});
}

// ---------- coriandoli e stelle filanti ----------
function cupConfetti(S,W,t){
  const a0=t-CUP_LIFT,cx=W>>1,C=S.conf,nC=C.length;
  if(a0<0)return;
  const bit=(x,y,i,a)=>{const s=Math.floor(a*9+i)%3;px(x,y,s===0?2:1,s===1?2:1,C[i%nC]);};   // girano mentre cadono
  // due cannoni ai lati del palco: la raffica sale, rallenta e scende piano ondeggiando
  for(let i=0;i<84;i++){
    const h=ihash(i,501),sd=i&1?1:-1,a=a0-((h>>>3)%10)*0.02;if(a<0)continue;
    const v0=105+(h%55),vx=-sd*(6+((h>>>7)%34)),vf=11+((h>>>12)%9),g=230,ta=(v0+vf)/g,x0=cx+sd*(CUP_HW-2),y0=CUP_MID-3;
    let x,y;
    if(a<ta){x=x0+vx*a;y=y0-v0*a+g*a*a/2;}
    else{x=x0+vx*ta+3*Math.sin((a-ta)*3+i);y=y0-v0*ta+g*ta*ta/2+vf*(a-ta);}
    if(y>CUP_H+2)continue;
    bit(ri(x),ri(y),i,a);
  }
  // stelle filanti: una testa che cade e una coda a serpentina sopra di lei
  for(let i=0;i<10;i++){
    const h=ihash(i,555),sd=i&1?1:-1,a=a0-0.05*(i>>1);if(a<0)continue;
    const v0=120+(h%40),vx=-sd*(10+((h>>>6)%30)),vf=8+((h>>>11)%5),g=230,ta=(v0+vf)/g,x0=cx+sd*(CUP_HW-2),y0=CUP_MID-3;
    const hx=a<ta?x0+vx*a:x0+vx*ta+4*Math.sin((a-ta)*2+i),hy=a<ta?y0-v0*a+g*a*a/2:y0-v0*ta+g*ta*ta/2+vf*(a-ta);
    if(hy-12>CUP_H)continue;
    const sc=i%2?S.kit.shirt:'#ffd23f';   // una nei colori della squadra, una d'oro
    for(let j=0;j<10;j++)px(ri(hx+2*Math.sin(j*0.45+a*4+i)),ri(hy-j*(a<ta?0.6:1)),1,1,j%4===3?cShade(sc,-0.3):sc);
  }
  // poi una pioggia continua dall'alto, che non finisce
  const N=ri(W*0.22);
  for(let i=0;i<N;i++){
    const h=ihash(i,621),s=0.6+((h%1000)/1000)*3.6,P=3.6+((h>>>10)%10)*0.12,vf=26+((h>>>14)%12);
    if(a0<s)continue;
    const a=(a0-s)%P,x=(h>>>4)%W+4*Math.sin(a*2.4+i),y=-4+a*vf*1.6;
    if(y>CUP_H)continue;
    bit(ri(x),ri(y),i,a);
  }
}

// ---------- i fotografi in primo piano, di spalle, con il flash (a sinistra: in basso a destra c'e' «Continua») ----------
function cupPhoto(S,W,t){
  const un={shirt:'#262d3d',shorts:'#1b2030',socks:'#1b2030',shoe:'#111522',pat:'',shirtB:''};
  const pics=[[17,1,{hair:'#6b4a2b',skin:'#f0c9a4',style:1}],[ri(W*0.3),-1,{hair:'#1f1712',skin:'#a56e45',style:0,band:'#c23b3b'}]];   // a sinistra: a destra c'e' «Continua»
  for(const [i,[x,f,lk]] of pics.entries()){
    const y=CUP_H+9+i*3,top=y-20;
    px(x-6,top+1,13,6,PAL.out);px(x-5,top+2,11,4,'#1c2029');px(x-5,top+2,11,1,'#3a4152');   // la macchina, davanti al viso
    puppet(x,y,un,lk,f,'cel',0,0,0,{cp:{view:1,h:[[5,-5],[-5,-5]]},ca:-1});
    px(x-2,top-4,5,4,PAL.out);px(x-1,top-3,3,2,'#d8dde6');   // il flash sopra la testa
    const ph=(t+i*0.37)%(cupLit(t)?0.9:2.1);
    if(ph<0.09){cupStar(x,top-3,'#ffffff',3);px(x-6,top-9,13,13,'rgba(255,255,255,.12)');}
  }
}
