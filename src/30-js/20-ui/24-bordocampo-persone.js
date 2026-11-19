/* ---- BORDOCAMPO: PERSONE, OGGETTI, NEVE ----
   Chi sta attorno al campo, secondo il livello dell'impianto (vnLv):
   - lato lontano (davanti ai cartelloni in alto): telecamere della TV, una dal livello 2, due dal 3, tre dal 4; nel grande stadio una segue l'azione;
   - lato vicino (in basso, visto da dietro): panche di legno, poi panchine coperte dal livello 3; allenatori in piedi, borse e borracce, il tavolo del
     segnapunti con i cartellini (dal livello 4 un tabellone a LED con il punteggio vero); dal 3 un cameraman, dal 4 la steadicam che segue il disco,
     dal 5 il carrello su binario;
   - dietro le mete: gazebo delle squadre e borse sui campi piccoli, fotografi in ginocchio negli stadi.
   Con la neve: cumuli lungo i lati e dietro le mete che coprono le gambe di cameraman e panchine, pupazzo di neve sui campi piccoli.
   Con la pioggia: ombrelloni sopra lo staff e teli trasparenti sulle telecamere. Le persone sono piccole come il pubblico: i giocatori restano i protagonisti. */
const CREW_P={o:'#0e1018',k:'#16191f',K:'#3c4352',L:'#c9d0db',l:'#7fb4e8',g:'#7d8392',p:'#2b3142',w:'#eef0f3',r:'#ff4b4b',y:'#ff8a1f',Y:'#ffb15a',W:'#ffffff'};
// telecamera su treppiede vista di fronte (lato lontano): testa dell'operatore, obiettivo, luce rossa, treppiede
const SP_CAM_F=['...ooo....','..ohhho...','..ossso...','.ojjjjjo..','oooooooooo','okkkkkkkro','okKLLLKkko','okLlWlLkko','okLlllLkko','okKLLLKkko','oooooooooo','....og....','...og.o...','..og...o..','.og.....o.'];
// cameraman visto da dietro (lato vicino), telecamera in spalla puntata verso il campo
const SP_CAM_B=['....oo.','...oKo.','.oookko','ohhhkko','ohhhkko','ojjjjjo','ojjjjjo','ojjjjjo','.opppo.','.opppo.','.op.po.','.oo.oo.'];
// fotografo in ginocchio con il teleobiettivo bianco, di profilo verso destra
const SP_PHOTO=['..ooo....','.ohhho...','.ohssoooo','.ojjokwwo','ojjjjokoo','ojjjjo...','opppppo..','oo.oooo..'];
// persona in piedi: di fronte (s = faccia) o di schiena (h = capelli dietro); c = cartellina dell'allenatore
const SP_MAN_F=['.ooo.','ohhho','ossso','ojjjo','ojjjo','ojjjo','opppo','opopo','op.po','oo.oo'];
const SP_MAN_B=['.ooo.','ohhho','ohhho','ojjjo','ojjjo','ojjjo','opppo','opopo','op.po','oo.oo'];
const SP_COACH_B=['.ooo.','ohhho','ohhho','ojjjoo','ojjjwo','ojjjoo','opppo.','opopo.','op.po.','oo.oo.'].map(r=>r.padEnd(6,'.'));
const SP_COOLER=['ooooo','owwwo','oyyyo','oyYyo','oyyyo','ooooo'];
const SP_BAG=['.oooo.','obbbbo','obBbbo','oooooo'];
const SP_SNOWMAN=['..ooo..','..oko..','.ooooo.','..owo..','.owwwo.','..oso..','oowwwoo','.owwwo.','owwwwwo','owwkwwo','owwwwwo','.ooooo.'];
const SP_UMB=['...ooooo...','.oouuuuuoo.','ouuUuuuuuuo','ooooooooooo','.....o.....','.....o.....'];
const SP_DOLLY=['...ooo...','..ohhho..','.okkkKko.','okkkkkkko','ojjjjjggo','ooooooooo','oKKKKKKKo','oo.ooo.oo'];
// ---------- chi segue l'azione: si muove lungo il lato a passo d'uomo ----------
const bcFol={n:{x:FIELD_L/2,t:-1},f:{x:FIELD_L/2,t:-1},d:{x:FIELD_L/2,t:-1}};
function followX(k,off,v){
  const s=bcFol[k],dt=s.t<0?1:clamp(G.tick-s.t,0,0.1);s.t=G.tick;
  const tx=clamp(((G.flight?G.flight.tx:(G.holder?G.holder.x:G.disc.x))||FIELD_L/2)+off,-2,FIELD_L+2);
  s.x+=clamp(tx-s.x,-v*dt,v*dt);if(Math.abs(tx-s.x)>60)s.x=tx;
  return s.x;
}
// colori di una persona dello staff: giacca della squadra (o nera per la TV), pelle e capelli dal numero
function crewMap(h,jacket){return Object.assign({},CREW_P,{s:FAN_S[h%4],h:HAIR_C[(h>>>3)%5],j:jacket,b:jacket,B:cShade(jacket,0.3)});}
function rainCover(x,y,w,h){px(x,y,w,h,'rgba(206,228,255,.42)');px(x,y,w,1,'rgba(240,248,255,.7)');}
function umbrellaOver(x,feet,hh,c){sprDraw(x,feet-hh+1,SP_UMB,{o:PAL.out,u:c,U:cShade(c,0.35)});}
// ---------- lato lontano: telecamere davanti ai cartelloni ----------
function farCrew(y0){
  const V=venueNow(),lv=vnLv(V);if(lv<2||!G.inMatch||G.drill)return;
  const wx=G.wx|0,feet=y0-2,xs=lv===2?[FIELD_L/2]:(lv===3?[FIELD_L/2-22,FIELD_L/2+22]:[FIELD_L*0.22,FIELD_L/2,FIELD_L*0.78]);
  if(lv>=5)xs[1]=followX('f',0,6);   // nel grande stadio la telecamera centrale segue il gioco
  for(let i=0;i<xs.length;i++){
    const x=sxw(xs[i]);if(x<-10||x>VW+10)continue;
    sprDraw(x,feet,SP_CAM_F,crewMap(ihash(i,3),'#2a2f3d'));
    if(wx===1){rainCover(x-4,feet-9,10,5);if(i!==1||lv<4)umbrellaOver(x-1,feet,14,'#1f2740');}
  }
}
// ---------- lato vicino: panchine, staff, segnapunti, cameraman ----------
function nearSide(y1){
  const V=venueNow(),lv=vnLv(V),wx=G.wx|0,fy=y1+11,mid=FIELD_L/2,on=G.inMatch&&!G.drill;
  const benchL=[mid-15,mid-5],benchR=[mid+5,mid+15],blueLeft=G.dir[0]>0;
  if(lv>=5&&on){   // binario del carrello lungo tutto il lato
    px(0,fy+1,VW,1,'#5d6375');px(0,fy+3,VW,1,'#5d6375');for(let x=-(((CX%5)+5)%5);x<VW;x+=5)px(x,fy+1,1,3,'#3b4252');
  }
  const items=[];   // tutto cio' che sta a terra, ordinato per profondita' alla fine
  for(const [r,t] of [[benchL,blueLeft?0:1],[benchR,blueLeft?1:0]])benchArea(r,t,fy,lv,wx,items);
  if(on)scoreTable(sxw(mid),fy,lv,blueLeft);
  if(on&&lv>=3){
    const hs=[mid-26,mid+26];
    for(let i=0;i<2;i++){const x=sxw(hs[i]);if(x>-10&&x<VW+10){items.push({y:fy,d:()=>{sprDraw(x,fy,SP_CAM_B,crewMap(ihash(i,9),'#2a2f3d'));if(wx===1)rainCover(x-1,fy-11,4,5);}});}}
  }
  if(on&&lv>=4){   // steadicam: cammina lungo il lato seguendo il disco (giacca gialla, si vede bene)
    const x=sxw(followX('n',-5,5.5));
    items.push({y:fy+1,d:()=>{sprDraw(x,fy+1,SP_CAM_B,crewMap(77,'#d9a21b'));if(wx===1)umbrellaOver(x+3,fy+1,11,'#2a2f3d');}});
  }
  if(on&&lv>=5){const x=sxw(followX('d',-3,6));items.push({y:fy+3,d:()=>{sprDraw(x,fy+4,SP_DOLLY,crewMap(78,'#2a2f3d'));if(wx===1)rainCover(x-3,fy-3,8,3);}});}
  items.sort((a,b)=>a.y-b.y);for(const it of items)it.d();
}
function benchArea(r,t,fy,lv,wx,items){
  const a=sxw(r[0]),b=sxw(r[1]);if(b<-20||a>VW+20)return;
  const un=UNI[t],n=Math.max(3,Math.min(7,((b-a)/7)|0)),dug=lv>=3,on=G.inMatch&&!G.drill;
  const seatY=fy-3;
  // panca: legno sui campi piccoli, seggiolini nel colore della squadra nelle panchine coperte
  if(dug){px(a-2,seatY-1,b-a+4,4,PAL.out);px(a-1,seatY,b-a+2,2,cShade(un.shirt,-0.25));}
  else{px(a-1,seatY-1,b-a+2,3,PAL.out);px(a,seatY,b-a,1,'#a07a4c');px(a+1,seatY+1,1,3,PAL.out);px(b-2,seatY+1,1,3,PAL.out);}
  for(let i=0;i<n;i++){   // chi siede in panchina, visto da dietro (esulta alla meta della sua squadra)
    const x=ri(a+(b-a)*(i+0.5)/n),h=ihash(t*13+i,41),bob=G.mode==='banner'&&G.banner&&G.banner.team===t&&Math.sin(G.tick*11+i)>0.2?2:0,y=seatY-bob;
    px(x-2,y-9,5,9,PAL.out);px(x-1,y-8,3,2,HAIR_C[(h>>>3)%5]);px(x-1,y-6,3,1,FAN_S[h%4]);
    px(x-1,y-5,3,3,wx===1&&!dug?COAT_C[h%6]:un.shirt);px(x-1,y-2,3,1,un.shorts);
    if(wx===2)px(x-1,y-9,3,2,i%2?un.shirt:'#f4f4f4');   // cuffie con la neve
    if(bob){px(x-2,y-9,1,2,FAN_S[h%4]);px(x+2,y-9,1,2,FAN_S[h%4]);}
  }
  if(dug){   // panchina coperta: guscio trasparente con il telaio
    px(a-3,fy-15,b-a+6,1,'#c9d3df');px(a-3,fy-14,b-a+6,9,'rgba(186,214,236,.26)');px(a-3,fy-14,1,12,'#9aa4b4');px(b+2,fy-14,1,12,'#9aa4b4');
    px(a-2,fy-14,b-a+4,1,'rgba(255,255,255,.4)');
    if(wx===2)px(a-3,fy-16,b-a+6,1,'#f4f8fc');
  }
  if(!on)return;
  // allenatore in piedi davanti alla panchina, con la cartellina; un aiutante; borse e borracce per terra
  const L=t===(G.dir[0]>0?0:1),cx=L?a-6:b+6,h0=ihash(t,99),jk=cShade(un.shirt,-0.15);
  items.push({y:fy+1,d:()=>{sprDraw(cx,fy+1,SP_COACH_B,crewMap(h0,jk),!L);if(wx===1&&!dug)umbrellaOver(cx,fy+1,9,un.shirt);}});
  if(lv>=2)items.push({y:fy,d:()=>sprDraw(L?a-12:b+12,fy,SP_MAN_B,crewMap(h0>>>4,lv>=3?'#c8343a':jk))});   // fisioterapista (rosso) negli impianti piu' grandi
  items.push({y:fy+2,d:()=>{sprDraw(L?b+3:a-4,fy+2,SP_COOLER,CREW_P);sprDraw(L?a+4:b-5,fy+3,SP_BAG,{o:PAL.out,b:un.shirt,B:cShade(un.shirt,0.3)});}});
}
// tavolo del segnapunti a centrocampo: cartellini sui campi piccoli, tabellone a LED negli stadi (il punteggio e' quello vero)
function scoreTable(cx,fy,lv,blueLeft){
  if(cx<-20||cx>VW+20)return;
  const sL=G.score[blueLeft?0:1]|0,sR=G.score[blueLeft?1:0]|0;
  px(cx-11,fy-6,22,4,PAL.out);px(cx-10,fy-5,20,1,lv>=3?'#2b3142':'#f4f4f4');px(cx-10,fy-4,20,1,lv>=3?'#1d212b':'#d9dde6');px(cx-9,fy-2,1,2,PAL.out);px(cx+8,fy-2,1,2,PAL.out);
  if(lv>=4){   // tabellone: fondo nero, cifre arancioni, le due strisce nei colori delle squadre
    px(cx-12,fy-15,24,10,PAL.out);px(cx-11,fy-14,22,8,'#0d1018');
    px(cx-11,fy-14,2,8,UNI[blueLeft?0:1].shirt);px(cx+9,fy-14,2,8,UNI[blueLeft?1:0].shirt);
    digits35(sL,cx-8+(sL<10?2:0),fy-13,'#ffb02e');digits35(sR,cx+1+(sR<10?2:0),fy-13,'#ffb02e');px(cx,fy-11,1,1,'#ffb02e');
    if((G.wx|0)===2)px(cx-12,fy-16,24,1,'#f4f8fc');
  }else{   // cartellini da sfogliare
    for(const [x,s] of [[cx-10,sL],[cx+1,sR]]){px(x,fy-15,9,9,PAL.out);px(x+1,fy-14,7,7,'#f4f4f4');px(x+1,fy-11,7,1,'#c9ced8');digits35(s,x+(s<10?3:1),fy-13,'#1a1c2c');}
  }
}
// ---------- dietro le mete ----------
function drawEnds(){
  const V=venueNow(),lv=vnLv(V),wx=G.wx|0,on=G.inMatch&&!G.drill,list=[];
  for(const side of [0,1]){
    const ex=side?FIELD_L:0,sg=side?1:-1,xs=sxw(ex+sg*3);if(side?xs>VW+30:xs<-30)continue;
    if(wx===2)snowBankV(ex+sg*3.4,ex+sg*5.5,side);
    if(!on)continue;
    const t=side?(G.dir[0]>0?0:1):(G.dir[0]>0?1:0);   // la squadra della panchina da quel lato
    if(lv<=2){   // campi piccoli: gazebo della squadra, borse, borracce, una pila di dischi
      list.push({y:syw(9),d:()=>gazebo(ex,sg,8.5,t,wx)});
      list.push({y:syw(4),d:()=>sprDraw(sxw(ex+sg*1.8),syw(4),SP_BAG,{o:PAL.out,b:UNI[t].shirt,B:cShade(UNI[t].shirt,0.3)})});
      list.push({y:syw(5.2),d:()=>sprDraw(sxw(ex+sg*2.6),syw(5.2),SP_BAG,{o:PAL.out,b:'#2b3142',B:'#4a5163'})});
      list.push({y:syw(14),d:()=>sprDraw(sxw(ex+sg*1.7),syw(14),SP_COOLER,CREW_P)});
      list.push({y:syw(FIELD_W-6),d:()=>discStack(sxw(ex+sg*1.8),syw(FIELD_W-6))});
      if(wx===2&&side===0)list.push({y:syw(FIELD_W-3),d:()=>sprDraw(sxw(-2.4),syw(FIELD_W-3),SP_SNOWMAN,{o:PAL.out,w:'#f4f8fc',k:'#1d212b',s:'#ff8a1f'})});
    }else{   // stadi: fotografi in ginocchio lungo la linea di fondo
      const ys=lv>=4?[5,10,15,22,27,32]:[7,13,24,30];
      for(let i=0;i<ys.length;i++){
        const y=ys[i]+((ihash(i,side)%10)-5)*0.08,x=sxw(ex+sg*(1.7+(i%2)*0.5)),h=ihash(i+side*20,5);
        list.push({y:syw(y),d:()=>{sprDraw(x,syw(y),SP_PHOTO,crewMap(h,i%3?'#2a2f3d':'#5a6275'),side===1);if(wx===1)rainCover(x-3,syw(y)-6,7,3);}});
      }
      if(lv>=4)list.push({y:syw(MID+1),d:()=>{const x=sxw(ex+sg*3.6);sprDraw(x,syw(MID+1),SP_CAM_F,crewMap(side+40,'#2a2f3d'));if(wx===1)rainCover(x-4,syw(MID+1)-8,9,5);}});
    }
  }
  list.sort((a,b)=>a.y-b.y);for(const it of list)it.d();
}
// gazebo pieghevole visto dall'alto: tetto a quattro spicchi nel colore della squadra, la balza bianca, l'ombra (sg: -1 meta di sinistra, 1 di destra)
function gazebo(ex,sg,wy,t,wxr){
  const c=UNI[t].shirt,X=sxw(sg<0?ex-4.4:ex+1.2),w=ri(3.2*S),y=syw(wy),h=ri(3.2*S*0.62);if(X+w<0||X>VW)return;
  px(X+2,y+2,w,h,'rgba(10,30,10,.22)');px(X-1,y-1,w+2,h+2,PAL.out);px(X,y,w,h,c);
  const top=wxr===2?'#f4f8fc':cShade(c,0.22),bot=cShade(c,-0.22);
  for(let r=0;r<h;r++){const k=r/h,ww=k<0.5?ri(w*(1-2*k)):ri(w*(2*k-1));if(ww>0)px(X+ri((w-ww)/2),y+r,ww,1,k<0.5?top:bot);}
  px(X,y,w,1,'#f4f4f4');px(X,y+h-1,w,1,'#f4f4f4');px(X+ri(w/2),y+ri(h/2),1,1,PAL.out);
}
function discStack(x,y){for(let i=0;i<4;i++){px(x-3,y-2*i-2,7,2,PAL.out);px(x-2,y-2*i-2,5,1,i%2?'#f4f4f4':'#ffd23f');}}
// ---------- neve: cumuli spalati ai bordi ----------
// rumore morbido: altezze dei cumuli che cambiano piano lungo il lato
function nz(t,seed){const i=Math.floor(t),f=t-i,a=ihash(i,seed)%1000/1000,b=ihash(i+1,seed)%1000/1000,s=f*f*(3-2*f);return a+(b-a)*s;}
function snowBankH(yBase,hMin,hMax,seed){
  px(0,yBase-2,VW,2,'#bccbdd');px(0,yBase,VW,1,'rgba(64,84,120,.35)');   // la base in ombra e' uguale dappertutto: due rettangoli soli
  for(let x=0;x<VW;x+=2){
    const w=(x+CX)/S,h=ri(hMin+(hMax-hMin)*(0.6*nz(w*0.45,seed)+0.4*nz(w*1.3,seed+5))),t=yBase-h;
    px(x,t-1,2,1,'rgba(64,84,120,.72)');px(x,t,2,h-2,'#eef3f9');
  }
}
function snowBankV(xa,xb,side){
  const y0=syw(-2),y1=syw(FIELD_W+2);
  for(let y=Math.max(BAR,y0);y<Math.min(VH,y1);y+=2){
    const w=(y-OYi)/S,k=0.55*nz(w*0.5,side*7+3)+0.45*nz(w*1.4,side*7+9),a=sxw(side?xa+(xb-xa)*(1-k)*0.6:xa),b=sxw(side?xb:xa+(xb-xa)*(1-k*0.6));
    const L=Math.min(a,b),R=Math.max(a,b);px(L,y,R-L,2,'#e9f0f7');px(side?L:R-1,y,1,2,'#ffffff');px(side?L-1:R,y,1,2,'rgba(80,100,132,.5)');
  }
}
