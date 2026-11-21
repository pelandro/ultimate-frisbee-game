/* ---- IA lanciatore (avversario; in test anche per la tua squadra) ---- */
// probabilita' di completare un lancio piatto verso il compagno (dove sta andando): serve a scegliere tra i candidati, non solo a scegliere lo stile
function aiProb(th,q){
  const dist=hyp(q.x-th.x,q.y-th.y),tt=flightTime(dist,0,dist>=SPARO_D);
  return estimateThrow(th,clamp(q.x+q.vx*tt*0.8,0.5,FIELD_L-0.5),clamp(q.y+q.vy*tt*0.8,0.5,FIELD_W-0.5),q,0).p;
}
// refine (solo quando sta per lanciare): tra i 3 migliori per punteggio vince chi ha la probabilita' di completare piu' alta (traiettoria libera, difensore
// lontano dal punto d'arrivo). Non aggiunge attese: decide nello stesso istante, con un conto in piu'
function aiPick(th,refine){
  const P=th.t,d=dirOf(P),defs=heroSeen(1-P);   // heroSeen: con la copia del clone avversario, che chi lancia non riconosce
  let mates=T[P].filter(q=>q!==th);
  {const al=pbAllowed(th);if(al){const fr=PB_FREE-PB_FREE_D*clamp((visOf(th)-0.5)/0.3,0,1),free=q=>defs.every(df=>hyp(df.x-q.x,df.y-q.y)>=fr),m2=mates.filter(q=>(al.includes(q)||heroOn(q))&&free(q));if(m2.length)mates=m2;}}   // schema a sequenza: il lancio va a chi e' previsto, se e' libero (chi ha Visione alta si accontenta di meno spazio, e lancia come da schema anche con un difensore addosso); se lo schema e' chiuso si gioca libero
  let best=null,bs=-1e9;const lv=AIK(P),idn=idOf(P),dmD=G.dmode[1-P],cands=[];
  // LETTURA DELLA PARTITA: chi e' avanti di 2 o sta per chiudere non regala il disco (meno lanci lunghi e contesi); chi e' sotto di 3 rischia di piu'
  const gap=G.score[P]-G.score[1-P],late=G.score[P]>=G.target-2,risk=lv.smart*((gap>=2?1:(gap<=-3?-0.8:0))+(late&&gap>=0?0.5:0));
  const W=G.wind&&G.wind.lv?G.wind:null;
  for(const q of mates){
    const dx=q.x-th.x,dy=q.y-th.y,dist=hyp(dx,dy);if(dist<3.5)continue;
    let open=99,lane=99;
    for(const df of defs){open=Math.min(open,hyp(df.x-q.x,df.y-q.y));lane=Math.min(lane,segDist(df.x,df.y,th.x,th.y,q.x,q.y));}
    const fwd=dx*d,c=closedness(th,dx,dy);
    // SPAZIO DAVANTI AL RICEVITORE: conta anche quanto sara' libero il punto in cui il disco arrivera' (lui corre, i difensori pure), non solo dov'e' adesso
    if(lv.smart>=0.6){const tt=flightTime(dist,dist>=SPARO_D,dist>=SPARO_D),lx=q.x+q.vx*tt*0.8,ly=q.y+q.vy*tt*0.8;let o2=99;for(const df of defs)o2=Math.min(o2,hyp(df.x+df.vx*tt*0.6-lx,df.y+df.vy*tt*0.6-ly));open=lerp(open,Math.min(o2,12),0.45*lv.smart);}
    let sc=Math.min(open,9)+Math.min(lane,6)*0.8+fwd*0.11*(1+0.4*idn.deep)-dist*0.06-c*4+rnd(0,Math.max(1,3.8+(0.6-th.s.vis/100)*9))*lv.noise;
    {const cr=throwComf(th),mr=throwMax(th);if(dist>cr)sc-=(dist-cr)*0.15;if(dist>mr)sc-=40;}
    sc+=heroPass(th,q,dist,fwd);   // superpoteri: si cercano i compagni trasformati (27-superpoteri.js)   // oltre la gittata comoda cala il punteggio; oltre il massimo il disco non arriva
    if(dist>=SPARO_D)sc+=(th.s.spa-55)*0.05-1.5+(open>=5?1.5:0)+idn.deep*1.6;   // sparo: conviene se sei bravo e il compagno e' libero (di piu' per le squadre che giocano lungo)
    if(risk){if(dist>=SPARO_D)sc-=risk*1.3;if(open<4.5)sc-=risk*0.9;}
    if(W&&dist>=22)sc+=clamp((dx*W.x+dy*W.y)/dist,-6.5,6.5)*0.22*lv.smart;   // VENTO: lungo con il vento alle spalle, corto e basso controvento
    if(dist<10)sc-=clamp(1+idn.deep*0.8,0,2);   // evita il gioco troppo vicino al portatore (le squadre da gioco corto lo accettano)
    // MISMATCH: cerca il compagno che ha un vantaggio sul suo marcatore (velocita', salto sul lungo, agilita' sul corto) e mani sicure
    {const mq=defs.find(df=>df.mark===q);if(mq)sc+=clamp((q.s.vel-mq.s.vel)*0.025+(dist>=20?(q.s.sal-mq.s.sal)*0.025:(q.s.agi-mq.s.agi)*0.015)+(q.s.pre-65)*0.012,-1.5,1.5)*lv.smart;}
    // lettura della marcatura: contro l'anticipo conviene il lungo, contro il contenimento il taglio di rientro
    if(lv.smart>0.5){if(dmD===1&&fwd>18)sc+=0.9*lv.smart;else if(dmD===0&&fwd>4&&fwd<16)sc+=0.5*lv.smart;}
    // gestione dello stall: piu' il conteggio sale, piu' cerca un passaggio corto e sicuro e rinuncia al lungo
    if(G.stallT>5){const u=G.stallT-5;if(open>4&&dist<16)sc+=u*0.7;if(dist>20)sc-=u*0.6;}
    if(inEZ(q,P))sc+=3;
    {const own=d>0?q.x:FIELD_L-q.x;if(own<EZ+10&&open<5)sc-=8;}   // vicino alla propria meta (quella che difende) un intercetto regala il punto all'avversario: prudenza
    if(fwd<-3)sc-=2;   // un lancio all'indietro serve solo se non c'e' di meglio
    if(G.open&&G.poss===P)sc+=clamp(fwd,-6,18)*0.18+clamp(3-Math.abs(q.y-MID)*0.2,-2,3)+(q.role==='H'?0.8:0);   // passaggio d'apertura dopo il pull: avanti e verso il centro, di preferenza a un handler
    if(G.stallT>6.5&&fwd<0)sc+=3;
    if(sc>bs){bs=sc;best=q;}
    cands.push([sc,q]);
  }
  if(refine&&lv.smart>=0.7&&cands.length>1){
    cands.sort((a,b)=>b[0]-a[0]);let bv=-1e9;const W=8*lv.smart;
    for(const [sc,q] of cands.slice(0,3)){const v=sc+W*aiProb(th,q);if(v>bv){bv=v;best=q;}}
  }
  if(!best)best=nearestTo(mates,th.x,th.y);
  let open=99;for(const df of defs)open=Math.min(open,hyp(df.x-best.x,df.y-best.y));
  return {best,open};
}
function aiThrow(th){
  const P=th.t,defs=T[1-P],pk=aiPick(th,true),best=pk.best,open=pk.open,lv=AIK(P);
  const dist=hyp(best.x-th.x,best.y-th.y);
  const lead=st=>{const tt=flightTime(dist,st,dist>=SPARO_D);return [clamp(best.x+best.vx*tt*0.8,0.5,FIELD_L-0.5),clamp(best.y+best.vy*tt*0.8,0.5,FIELD_W-0.5)];};
  // PUNTO D'ARRIVO NELLO SPAZIO: oltre a dove sta andando il compagno prova qualche punto piu' lontano dal difensore che gli e' piu' vicino e sceglie quello in cui
  // il compagno arriva prima di lui (e dove il lancio ha piu' probabilita' di completarsi): meno duelli a due su un disco contestato
  const space=st=>{
    const a0=lead(st);if(lv.smart<0.7)return {a:a0,v:0};
    const nd=nearestTo(defs,a0[0],a0[1]);let ux=a0[0]-nd.x,uy=a0[1]-nd.y;const ul=hyp(ux,uy);
    if(ul<0.3){ux=0;uy=a0[1]<MID?-1:1;}else{ux/=ul;uy/=ul;}
    let bv=-1e9,ba=a0;
    for(const s of [0,1.5,3,4.5]){
      const x=clamp(a0[0]+ux*s,0.5,FIELD_L-0.5),y=clamp(a0[1]+uy*s,0.5,FIELD_W-0.5),e=estimateThrow(th,x,y,best,st).p;
      let dm=1e9;for(const q of defs)dm=Math.min(dm,ttr(q,x,y));
      const v=e+0.12*clamp(dm-ttr(best,x,y),-1.5,1.5)-0.02*s;
      if(v>bv){bv=v;ba=[x,y];}
    }
    return {a:ba,v:bv};
  };
  let style=0;
  if(dist<SPARO_D){
    if(lv.smart>=0.7){   // SCELTA DEL LANCIO: prova gli stili che sa fare e tira quello che ha piu' probabilita' di arrivare
      let bp=-1;
      for(const st of [0,1]){const e=space(st).v+(st===0?0.03:0)+rnd(0,0.05);if(e>bp){bp=e;style=st;}}
    }else{   // livello facile: regole semplici
      const lb=laneBlock(th,best.x,best.y,planThrow(th,best.x,best.y,0));
      if(open<4&&dist>14&&Math.random()<0.4)style=1;
      else if(lb&&lb.prob>0.14&&Math.random()<0.35+th.s.vis*0.004)style=1;
    }
  }
  const a=space(style).a;
  doThrow(th,a[0],a[1],best,style);
}

/* ---- pull ---- */
const PULL_TH=0.88,PULL_SPEED=1.12;   // PULL_SPEED: velocita' del disco in volo al pull (1 = com'era)
/* Un buon pull e un gran pull devono costare fatica: PULL_ERR moltiplica l'errore del colpo (anche con il tempismo perfetto il disco non cade sempre dove
   si e' mirato) e il gran pull vuole di piu': PULL_GD metri dentro la meta di chi riceve (prima 7) e PULL_GM metri dalla linea laterale (prima 4).
   Misurato con lo stesso errore di tempo di 70 ms (Sparo e Lancio a 90): Gran pull dal 75% al 51%. L'IA mira a PULL_AIM metri dentro la meta, cioe' un
   poco oltre la soglia del gran pull, cosi' resta brava come prima. Se li tocchi, rimisura con node tools/test-sim.js (gruppo «Pull e difesa automatica»). */
const PULL_ERR=1.3,PULL_GD=9,PULL_GM=5.5,PULL_AIM=10;
/* PULL A TEMPO: il pull e' un gesto difficile, non un lancio qualsiasi. Si decide in due tocchi su due indicatori che oscillano:
   1) POTENZA: la zona verde (da PULL_G0 alla tacca PULL_TH) manda il disco nella meta avversaria; prima e' corto, oltre la tacca rischia di uscire dal fondo;
   2) DIREZIONE: l'ago spazza il campo da una linea laterale all'altra e oltre (PULL_SW radianti per parte); solo la parte centrale resta in campo.
   Gli indicatori vanno piano per chi ha Sparo (potenza) e Lancio (direzione) alti e in fretta per chi li ha bassi: con Sparo 20 la barra della potenza corre
   a 0,7 s per spazzata, con 99 a 1,7 s. Anche il colpo e' meno pulito per i deboli (pullSkill). L'interfaccia legge queste costanti; il motore riceve carica e angolo. */
const PULL_G0=0.74,PULL_Y0=0.62,PULL_SW=0.42;
const pullPeriod=(p,k)=>k?0.36+p.s.lan*0.0112:0.42+p.s.spa*0.0128;   // secondi per una spazzata: 0 potenza (Sparo), 1 direzione (Lancio)
const pullSkill=p=>clamp(p.s.spa*0.6+p.s.lan*0.4,20,99);            // la bravura nel pull: soprattutto Sparo (distanza), poi Lancio (precisione)
const pullWave=(t,T)=>{const u=(t/T)%2;return u<1?u:2-u;};          // 0..1..0 a velocita' costante
function pullAngle(team,ang){
  const fwd=dirOf(team)>0?0:Math.PI;
  let rel=Math.atan2(Math.sin(ang-fwd),Math.cos(ang-fwd));
  rel=clamp(rel,-1.3,1.3);return fwd+rel;
}
// Il pull non esce piu' a caso. La distanza cresce con la carica fino alla tacca (78 m: dentro la meta avversaria); oltre la tacca il disco va
// ancora piu' lungo (fuori dal fondo) e il controllo cala. Direzione e distanza hanno un errore piccolo, che dipende dallo Sparo di chi tira.
function pullPlan(p,team,charge,ang){
  const c=clamp(charge,0,1),over=clamp((c-PULL_TH)/(1-PULL_TH),0,1);
  const W=G.wind,wk=1+0.15*W.lv;   // il vento sposta il punto d'arrivo (wx, wy) e rende il pull un po' meno preciso
  return {c,over,dist:20+58*Math.min(c,PULL_TH)/PULL_TH+7*over,a:pullAngle(team,ang),wx:W.x*PULL_WK,wy:W.y*PULL_WK,
    sa:(0.6+(100-pullSkill(p))*0.06)*(1+2.2*over*over)*wk*PULL_ERR*Math.PI/180,sd:(0.7+(100-pullSkill(p))*0.09)*(1+2*over)*wk*PULL_ERR};
}
/* QUALITA' DEL PULL: dove cade rispetto alla meta di chi riceve. Un buon pull da' un vantaggio vero a chi lo tira (cioe' alla difesa):
   3 GRAN PULL: in campo, a PULL_GD m o piu' dentro la meta di chi riceve e ad almeno PULL_GM m dalla linea laterale;  2 BUON PULL: in campo, dentro la meta;
   1 CORTO: cade prima della meta, fino a 20 m;  0 BRICK: fuori dal campo oppure cortissimo (oltre 20 m prima della meta).
   Alla presa, per ciascun livello (PULL_EDGE): stall di partenza di chi riceve (la difesa e' gia' addosso), quanto aspettano i tagliatori prima di partire
   (moltiplicatore) e, per qualche secondo (PULL_EDGE_T), +k alla velocita' dei difensori (k > 0) oppure dei ricevitori (k < 0) e thr punti in piu' (o in meno)
   ai lanci di chi riceve: sotto pressione sbaglia di piu', con via libera molto meno. In piu' c'e' la posizione stessa: piu' il disco cade in fondo, piu' strada devono fare per segnare. */
const PULL_EDGE_T=6,PULL_OOB_GAIN=6;
const PULL_EDGE=[{stall:0,cut:0.6,k:-0.05,thr:6},{stall:0,cut:0.8,k:-0.03,thr:3.5},{stall:1.5,cut:1.15,k:0.03,thr:-3},{stall:3,cut:1.7,k:0.07,thr:-12}];   // thr: punti di Lancio/Sparo in piu' (o in meno) ai lanci di chi riceve
function pullQuality(oob,spot,rec){
  if(oob)return 0;
  const dr=dirOf(rec),dep=((dr>0?EZ:FIELD_L-EZ)-spot.x)*dr;
  if(dep<-20)return 0;if(dep<0)return 1;
  return dep>=PULL_GD&&Math.min(spot.y,FIELD_W-spot.y)>=PULL_GM?3:2;
}
function doPull(charge,ang){
  const pt=G.pullTeam,p=G.puller,d=dirOf(pt),rec=G.poss,pp=pullPlan(p,pt,charge,ang);
  const dist=pp.dist+randn()*pp.sd,a=pp.a+randn()*pp.sa;
  const tx=p.x+Math.cos(a)*dist+pp.wx,ty=p.y+Math.sin(a)*dist+pp.wy;
  const dl=hyp(tx-p.x,ty-p.y),oob=tx<0||tx>FIELD_L||ty<0||ty>FIELD_W;
  let spot;
  const dr=dirOf(rec),hx=dr>0?EZ:FIELD_L-EZ;
  let bk=false;
  if(oob){   // pull fuori senza che nessuno lo tocchi: chi riceve sceglie il brick (al centro, a 18 m dalla sua linea di meta) o il punto della zona centrale
    // piu' vicino a dove e' uscito (WFDF). Si sceglie da solo: il punto d'uscita se fa guadagnare almeno PULL_OOB_GAIN metri, altrimenti il brick
    let lo=0,hi=1;for(let i=0;i<16;i++){const m=(lo+hi)/2;if(inField({x:lerp(p.x,tx,m),y:lerp(p.y,ty,m)}))lo=m;else hi=m;}
    const ex=outRestart({x:lerp(p.x,tx,lo),y:lerp(p.y,ty,lo)}),br={x:hx+dr*18,y:MID};
    bk=(ex.x-br.x)*dr<PULL_OOB_GAIN;spot=bk?br:ex;
  }
  else spot={x:clamp(tx,1,FIELD_L-1),y:clamp(ty,3,FIELD_W-3)};   // il pull si prende dove cade, anche dentro la meta
  const atk=T[rec];
  for(const q of atk.concat(T[pt])){q.fl=null;q.flD=0;q.boost=0;}
  const catcher=atk.slice().sort((a,b)=>ttr(a,spot.x,spot.y)-ttr(b,spot.x,spot.y))[0];
  catcher.fl={x:spot.x,y:spot.y};
  G.pull={thrower:p,sx:p.x,sy:p.y,tx,ty,t:0,T:(1.8+dl/40)/PULL_SPEED,H:clamp(dl*0.16,5,12),team:pt,oob,bk,landed:false,spot,catcher,lt:0,q:pullQuality(oob,spot,rec)};
  G.ref={x:spot.x,y:spot.y};
  G.puller=null;G.mode='play';
  assignMarks();
  HOOKS.vibe(18);HOOKS.sfx('pull');
}
function aiPull(){
  // l'IA mira al centro della zona verde e al centro del campo, ma sbaglia come sbaglierebbe una persona: chi ha Sparo e Lancio bassi
  // tira piu' spesso corto, lungo o fuori di lato (in media un pull su cinque finisce in brick, uno su dieci per i migliori)
  // Il punto ideale e' PULL_AIM m dentro la meta avversaria, al centro; il vento lo corregge per due terzi.
  const p=G.puller,d=dirOf(G.pullTeam),W=G.wind,need=Math.abs((d>0?FIELD_L-EZ+PULL_AIM:EZ-PULL_AIM)-p.x)-W.x*PULL_WK*d*0.67;
  const c0=clamp((need-20)/58*PULL_TH,0.5,PULL_TH-0.03),rel0=-Math.asin(clamp(W.y*PULL_WK*0.67/Math.max(30,need),-0.4,0.4))*d;
  const ps=pullSkill(p);
  doPull(clamp(c0+randn()*(0.06+(100-ps)*0.0021),0.35,0.99),(d>0?0:Math.PI)+rel0+randn()*(0.08+(100-p.s.lan)*0.0023));
}

