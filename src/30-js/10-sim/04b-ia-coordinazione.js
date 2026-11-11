/* ---- COORDINAZIONE DELL'ATTACCO: i cutter non tagliano piu' ognuno per conto suo ----
   - Tagli in coppia (pairCut): quando un cutter va lungo, un compagno che legge il gioco viene sotto sul lato opposto (e viceversa).
     Il difensore che aiuta su uno dei due lascia libero l'altro: e' la base del gioco a stack.
   - Give-and-go (giveGo): chi ha appena fatto un passaggio corto riparte subito in avanti sul lato libero, per ricevere di nuovo.
   - Isolamento dell'IA (aiIso): se un suo cutter e' piu' veloce del proprio marcatore, l'IA gli libera il campo come fai tu con la pressione lunga.
   Quanto succede dipende dalla Visione dei giocatori (e, per l'IA avversaria, dal livello). G.st.pair, G.st.gg, G.st.iso li contano. */
const PAIR_GAP=4;   // secondi minimi tra due tagli in coppia della stessa squadra: una giocata, non un automatismo
function pairCut(p,deep,H,d,atk){
  if(!G.holder||G.flight)return;
  if(!G.pairT)G.pairT=[-99,-99];if((G.gt||0)-G.pairT[p.t]<PAIR_GAP)return;
  const cand=atk.filter(q=>q!==p&&q!==G.holder&&!q.cmd&&!q.fl&&(q.cs==='set'||q.cs==='hold')&&q.role!=='H'&&visOf(q)>=0.45);
  if(!cand.length)return;
  const q=cand.sort((a,b)=>hyp(a.x-p.x,a.y-p.y)-hyp(b.x-p.x,b.y-p.y))[0],v=(visOf(p)+visOf(q))/2;
  if(Math.random()>clamp(0.15+v*0.7,0,0.85))return;
  const away=p.ty>=H.y?-1:1;   // l'altro lato rispetto al primo taglio
  let tx,ty;
  if(deep){tx=H.x+d*rnd(8,12);ty=H.y+away*rnd(5,9);}               // il primo va lungo: il secondo viene sotto
  else{tx=H.x+d*rnd(26,32);ty=H.y+away*rnd(6,11);}                  // il primo viene sotto: il secondo attacca la profondita'
  const t=spreadFrom(q,clamp(tx,1,FIELD_L-1),clamp(ty,3,FIELD_W-3),atk,SPREAD_R,SPREAD_K),tc=awayFrom(H,t.x,t.y,MIN_ATT);
  q.cs='cut';q.tx=tc.x;q.ty=tc.y;q.cutT=deep?2.6:3.6;q.pairT=G.tick;G.st.pair[q.t]++;
  G.pairT[p.t]=G.gt||0;
}
function giveGo(th,dist){
  if(dist>=14||(th.t===0&&!G.auto&&G.holder===th))return;
  if(Math.random()>clamp(0.2+0.55*visOf(th)+(th.role==='H'?0.1:0),0,0.85))return;
  const d=dirOf(th.t),mk=T[1-th.t].find(q=>q.mark===th),side=mk?(mk.y>=th.y?-1:1):(th.y<MID?1:-1);   // riparte dal lato opposto al suo marcatore
  const x=clamp(th.x+d*rnd(10,15),2,FIELD_L-2),y=clamp(th.y+side*rnd(3,7),3,FIELD_W-3);
  th.cmd={k:'go',x,y,t:2.6};th.cs='cut';th.tx=x;th.ty=y;G.st.gg[th.t]++;
}
function aiIso(P,Hh,dt){
  if(!aiTeam(P)||!Hh||G.flight||G.iso||G.walk||G.brickWait||G.holdT<0.6)return;
  const lv=AIK(P);if(Math.random()>dt*0.15*lv.smart)return;   // circa uno ogni 7-10 secondi di possesso al livello alto, se c'e' un mismatch
  let best=null,bs=10;   // almeno 10 punti di Velocita' (o Scatto) in piu' del marcatore
  for(const q of T[P]){if(q===Hh||q.cmd||q.fl)continue;const mk=T[1-P].find(x=>x.mark===q);if(!mk)continue;const s=Math.max(q.s.vel-mk.s.vel,q.s.sca-mk.s.sca);if(s>bs){bs=s;best=q;}}
  if(best&&callIso(best))G.st.iso[P]++;
}
